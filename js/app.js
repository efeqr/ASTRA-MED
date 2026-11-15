/**
 * ASTRA-MED Ana Uygulama Kontrolcüsü
 * Her Yeni Gün Astronotun Kendi Baz Değerlerini Görerek Ölçüm Girdiği Sistem
 */

(function () {
  const state = {
    activeTab: "tab-guides",
    crewId: "cdr-kaya",
    selectedMetric: "bp",
    selectedBodySystem: "head_sans",
    activeScenarioId: "nominal",
    draftEntry: null,
    osdrStudyKey: "OSD_575",
    osdrMarkerIdx: 0,
    gamification: {
      streakDays: 18,
      xp: 1420,
      waterCups: 6,
      completedTasks: {
        "task-vitals": true,
        "task-ared": true,
        "task-hydration": false,
        "task-circadian": false,
        "task-lbnp": false,
        "task-mood": true
      }
    },
    crewLogs: {}
  };

  function buildBiomarkersFromVitals(vitals) {
    return {
      il6_pg_ml: vitals.temperature >= 37.8 ? 6.9 : vitals.temperature >= 37.3 ? 3.8 : 1.7,
      urine_calcium_mg_day: vitals.glucose >= 125 ? 275 : 188,
      optic_nerve_sheath_mm: vitals.bpSystolic >= 140 ? 6.4 : vitals.bpSystolic >= 130 ? 5.85 : 5.2,
      cabin_co2_mmhg: vitals.bpSystolic >= 140 ? 4.1 : 2.6
    };
  }

  function initCrewLogs() {
    Object.keys(window.NASA_DATA.CREW_PROFILES).forEach((cId) => {
      const p = window.NASA_DATA.CREW_PROFILES[cId];
      const b = p.baselines;
      const initialDays = [
        { day: 1, time: "07:10 UTC", dSys: 1, dDia: 0, dHr: 1, dGlu: 1, dTemp: 0.0, dSlp: 0.0, dMood: 0.0 },
        { day: 2, time: "07:15 UTC", dSys: 3, dDia: 2, dHr: 2, dGlu: 2, dTemp: 0.1, dSlp: -0.1, dMood: -0.1 },
        { day: 3, time: "07:12 UTC", dSys: 6, dDia: 4, dHr: 4, dGlu: 4, dTemp: 0.1, dSlp: -0.3, dMood: -0.2 },
        { day: 4, time: "07:20 UTC", dSys: 15, dDia: 10, dHr: 14, dGlu: 16, dTemp: 0.5, dSlp: -1.3, dMood: -1.6 },
        { day: 5, time: "07:08 UTC", dSys: 2, dDia: 1, dHr: 1, dGlu: 2, dTemp: 0.1, dSlp: -0.1, dMood: -0.1 }
      ];

      state.crewLogs[cId] = initialDays.map((item) => {
        const entry = {
          id: `${cId}-day-${item.day}`,
          day: item.day,
          time: item.time,
          crewId: cId,
          crewName: p.name,
          bpSystolic: b.bpSystolic + item.dSys,
          bpDiastolic: b.bpDiastolic + item.dDia,
          heartRate: b.heartRate + item.dHr,
          glucose: b.glucose + item.dGlu,
          temperature: Number((b.temperature + item.dTemp).toFixed(1)),
          sleepHours: Number((b.sleepHours + item.dSlp).toFixed(1)),
          moodScore: Number((b.moodScore + item.dMood).toFixed(1))
        };
        entry.biomarkers = buildBiomarkersFromVitals(entry);
        const evalRes = window.DECISION_ENGINE.evaluateMetrics(entry, b);
        entry.overallStatus = evalRes.overallStatus;
        entry.statusLabel =
          evalRes.overallStatus === "normal"
            ? "NORMAL (YEŞİL)"
            : evalRes.overallStatus === "warning"
              ? "DİKKAT (SARI)"
              : "KRİTİK (KIRMIZI)";
        return entry;
      });
    });
  }

  function getActiveCrewLog() {
    return state.crewLogs[state.crewId] || [];
  }

  function getNextDayNumber() {
    const log = getActiveCrewLog();
    if (!log.length) return 1;
    return Math.max(...log.map((d) => d.day)) + 1;
  }

  function getDefaultDraftForCrew(crewId) {
    const b = window.NASA_DATA.CREW_PROFILES[crewId].baselines;
    const scenario = window.NASA_DATA.ANOMALY_SCENARIOS[state.activeScenarioId];
    const nextDay = getNextDayNumber();

    if (scenario && scenario.overrides) {
      return Object.assign({}, scenario.overrides, {
        day: nextDay
      });
    }

    const draft = {
      day: nextDay,
      bpSystolic: b.bpSystolic + 2,
      bpDiastolic: b.bpDiastolic + 1,
      heartRate: b.heartRate + 1,
      glucose: b.glucose + 2,
      temperature: Number((b.temperature + 0.1).toFixed(1)),
      sleepHours: Number((b.sleepHours - 0.1).toFixed(1)),
      moodScore: Number((b.moodScore - 0.1).toFixed(1))
    };
    draft.biomarkers = buildBiomarkersFromVitals(draft);
    return draft;
  }

  function getActiveTelemetry() {
    if (!state.draftEntry) {
      state.draftEntry = getDefaultDraftForCrew(state.crewId);
    }
    state.draftEntry.day = getNextDayNumber();
    return state.draftEntry;
  }

  function showToast(title, message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-hide");
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".main-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab-target") === tabId);
    });
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === tabId);
    });
    if (tabId === "tab-charts") {
      setTimeout(() => renderCharts(), 20);
    }
  }

  function initStaticIcons() {
    document.getElementById("header-logo-svg").innerHTML = window.ASTRA_ICONS.get("logo");
    document.getElementById("nav-icon-dashboard").innerHTML = window.ASTRA_ICONS.get("tabDashboard");
    document.getElementById("nav-icon-body").innerHTML = window.ASTRA_ICONS.get("tabBody");
    document.getElementById("nav-icon-charts").innerHTML = window.ASTRA_ICONS.get("tabCharts");
    document.getElementById("nav-icon-guide").innerHTML = window.ASTRA_ICONS.get("tabGuide");
    document.getElementById("nav-icon-tasks").innerHTML = window.ASTRA_ICONS.get("tabTasks");
  }

  function renderHeaderAndBaselines(evaluation) {
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const b = profile.baselines;
    const nextDay = getNextDayNumber();
    const recordedCount = getActiveCrewLog().length;

    document.getElementById("header-mission-day").textContent = `Görev Günü ${nextDay}`;
    document.getElementById("header-comm-delay").textContent = `14.2 dk`;
    document.getElementById("header-distance").textContent = `${recordedCount} Gün Kayıtlı`;
    document.getElementById("header-health-score").textContent = `%${evaluation.healthScore}`;

    const entryTitle = document.getElementById("entry-screen-title");
    if (entryTitle) {
      entryTitle.textContent = `Yeni Gün Veri Girişi (Görev Günü ${nextDay}) ve Öz-Ölçüm Rehberi`;
    }

    const saveTopBtn = document.getElementById("btn-save-all-measurements");
    if (saveTopBtn) {
      saveTopBtn.textContent = `Gün ${nextDay} Ölçümlerini Kaydet ve Yeni Güne Geç (+50 Puan)`;
    }

    const saveBottomBtn = document.getElementById("btn-save-all-measurements-bottom");
    if (saveBottomBtn) {
      saveBottomBtn.textContent = `Gün ${nextDay} Ölçümlerini Kaydet ve Analiz Raporunu Aç →`;
    }

    const scoreBadge = document.getElementById("header-readiness-badge");
    scoreBadge.className = `status-pill status-${evaluation.overallStatus}`;
    scoreBadge.textContent =
      evaluation.overallStatus === "normal"
        ? "DURUM: NORMAL (YEŞİL)"
        : evaluation.overallStatus === "warning"
          ? "DURUM: DİKKAT (SARI)"
          : "DURUM: KRİTİK MÜDAHALE (KIRMIZI)";

    document.getElementById("crew-avatar").innerHTML = window.ASTRA_ICONS.get(profile.id);
    document.getElementById("crew-name").textContent = profile.name;
    document.getElementById("crew-role").textContent = `${profile.role} • Kan Grubu: ${profile.bloodType} • Yaş: ${profile.age}`;

    // Top Personal Baseline Reference Strip
    const topStrip = document.getElementById("top-baseline-strip");
    if (topStrip) {
      topStrip.innerHTML = `
        <div class="base-mini-item">
          <span class="base-mini-lbl">Tansiyon Bazı</span>
          <strong class="base-mini-val">${b.bpSystolic}/${b.bpDiastolic} mmHg</strong>
        </div>
        <div class="base-mini-item">
          <span class="base-mini-lbl">Nabız Bazı</span>
          <strong class="base-mini-val">${b.heartRate} atım/dk</strong>
        </div>
        <div class="base-mini-item">
          <span class="base-mini-lbl">Kan Şekeri Bazı</span>
          <strong class="base-mini-val">${b.glucose} mg/dL</strong>
        </div>
        <div class="base-mini-item">
          <span class="base-mini-lbl">Sıcaklık Bazı</span>
          <strong class="base-mini-val">${b.temperature} °C</strong>
        </div>
        <div class="base-mini-item">
          <span class="base-mini-lbl">Uyku Bazı</span>
          <strong class="base-mini-val">${b.sleepHours} saat</strong>
        </div>
        <div class="base-mini-item">
          <span class="base-mini-lbl">Ruh Hali Bazı</span>
          <strong class="base-mini-val">${b.moodScore} / 10</strong>
        </div>
      `;
    }

    const tabAlertBadge = document.getElementById("tab-badge-alerts");
    if (evaluation.alerts.length > 0) {
      tabAlertBadge.style.display = "inline-block";
      tabAlertBadge.textContent = `${evaluation.alerts.length} Uyarı`;
    } else {
      tabAlertBadge.style.display = "none";
    }
  }

  // =========================================================================
  // SEKME 1: HER KARTTA KİŞİSEL BAZ DEĞERİ + REHBER + YENİ GÜN VERİ GİRİŞİ
  // =========================================================================
  function renderGuideCardsSection() {
    const container = document.getElementById("guide-cards-grid");
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const cur = getActiveTelemetry();
    const nextDay = getNextDayNumber();
    const evaluation = window.DECISION_ENGINE.evaluateMetrics(cur, profile.baselines);

    const inputMarkupForMetric = (g) => {
      const mEval = evaluation.metrics[g.metricKey];
      if (g.metricKey === "bp") {
        return `
          <div class="entry-input-box">
            <div class="entry-baseline-compare-grid">
              <div class="entry-personal-base-card">
                <span class="base-card-tag">KİŞİSEL BAZ DEĞERİNİZ (NORMALİNİZ)</span>
                <div class="base-card-big">${mEval.baselineDisplay} <small>mmHg</small></div>
                <span class="base-card-sub">${g.normalBaselineNote}</span>
              </div>
              <div class="entry-new-input-card">
                <span class="new-input-tag">YENİ ÖLÇÜM GİRİŞİ (GÜN ${nextDay})</span>
                <div class="entry-dual-inputs">
                  <div class="entry-field">
                    <label for="entry-input-sys">Büyük</label>
                    <input type="number" id="entry-input-sys" class="entry-num-input" min="70" max="220" step="1" value="${cur.bpSystolic}" />
                  </div>
                  <span class="bp-slash">/</span>
                  <div class="entry-field">
                    <label for="entry-input-dia">Küçük</label>
                    <input type="number" id="entry-input-dia" class="entry-num-input" min="40" max="140" step="1" value="${cur.bpDiastolic}" />
                  </div>
                </div>
              </div>
            </div>
            <div class="entry-delta-line delta-${mEval.status}" id="live-delta-bp">
              Baz Değerinizden Fark: ${mEval.deltaDisplay} — ${mEval.summary}
            </div>
          </div>
        `;
      }

      const inputConfig = {
        heartRate: { id: "entry-input-hr", min: 35, max: 190, step: "1", val: cur.heartRate, unit: "atım/dk" },
        glucose: { id: "entry-input-glu", min: 50, max: 320, step: "1", val: cur.glucose, unit: "mg/dL" },
        temperature: { id: "entry-input-temp", min: 35.0, max: 41.5, step: "0.1", val: cur.temperature, unit: "°C" },
        sleepHours: { id: "entry-input-sleep", min: 1.0, max: 12.0, step: "0.1", val: cur.sleepHours, unit: "saat/gün" },
        moodScore: { id: "entry-input-mood", min: 1.0, max: 10.0, step: "0.1", val: cur.moodScore, unit: "/ 10 puan" }
      }[g.metricKey];

      return `
        <div class="entry-input-box">
          <div class="entry-baseline-compare-grid">
            <div class="entry-personal-base-card">
              <span class="base-card-tag">KİŞİSEL BAZ DEĞERİNİZ (NORMALİNİZ)</span>
              <div class="base-card-big">${mEval.baselineDisplay}</div>
              <span class="base-card-sub">${g.normalBaselineNote}</span>
            </div>
            <div class="entry-new-input-card">
              <label for="${inputConfig.id}" class="new-input-tag">YENİ ÖLÇÜM GİRİŞİ (GÜN ${nextDay})</label>
              <div class="entry-single-input">
                <input
                  type="number"
                  id="${inputConfig.id}"
                  class="entry-num-input"
                  min="${inputConfig.min}"
                  max="${inputConfig.max}"
                  step="${inputConfig.step}"
                  value="${inputConfig.val}"
                />
                <span class="entry-unit-lbl">${inputConfig.unit}</span>
              </div>
            </div>
          </div>
          <div class="entry-delta-line delta-${mEval.status}" id="live-delta-${g.metricKey}">
            Baz Değerinizden Fark: ${mEval.deltaDisplay} — ${mEval.summary}
          </div>
        </div>
      `;
    };

    container.innerHTML = window.NASA_DATA.GUIDE_CARDS.map((g) => {
      const mEval = evaluation.metrics[g.metricKey];
      return `
        <div class="guide-card status-border-${mEval.status}" id="guide-entry-card-${g.metricKey}">
          <div class="guide-card-header">
            <div class="metric-title-wrap">
              <div class="metric-icon-svg">${window.ASTRA_ICONS.get(g.iconKey)}</div>
              <div>
                <h4>${g.title}</h4>
                <span class="guide-ref-range">Cihaz: ${g.device}</span>
              </div>
            </div>
            <span class="status-pill status-${mEval.status}" id="live-pill-${g.metricKey}">${mEval.statusText}</span>
          </div>

          <!-- 1. NASIL ÖLÇÜLÜR? REHBERİ -->
          <div class="how-to-measure-box">
            <div class="how-to-header">
              <span class="how-to-badge">NASIL ÖLÇÜLÜR?</span>
              <span class="how-to-sub">Uzayda Doğru Ölçüm Adımları</span>
            </div>
            <ol class="guide-steps">
              ${g.howToMeasure.map((s) => `<li>${s}</li>`).join("")}
            </ol>
          </div>

          <!-- 2. KİŞİSEL BAZ DEĞERİ VE YENİ GÜN VERİ GİRİŞ ALANI -->
          ${inputMarkupForMetric(g)}

          <!-- 3. DEĞER BOZULURSA NE YAPILMALI? -->
          <div class="action-protocol-box action-protocol-${mEval.status}" id="live-protocol-${g.metricKey}">
            <div class="action-protocol-header">
              <span class="action-protocol-badge">NE YAPILMALI?</span>
              <span class="action-protocol-title">Değer Bozulduğunda Uygulanacak Protokol</span>
            </div>
            <ol class="action-step-list">
              ${g.actionSteps.map((s) => `<li>${s}</li>`).join("")}
            </ol>
          </div>
        </div>
      `;
    }).join("");

    renderEntryLiveSummary(evaluation);

    container.querySelectorAll(".entry-num-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        handleLiveEntryChange();
      });
    });
  }

  function readDraftVitalsFromInputs() {
    const cur = getActiveTelemetry();
    const sysEl = document.getElementById("entry-input-sys");
    if (!sysEl) return cur;

    const vitals = {
      day: getNextDayNumber(),
      bpSystolic: Number(document.getElementById("entry-input-sys").value) || cur.bpSystolic,
      bpDiastolic: Number(document.getElementById("entry-input-dia").value) || cur.bpDiastolic,
      heartRate: Number(document.getElementById("entry-input-hr").value) || cur.heartRate,
      glucose: Number(document.getElementById("entry-input-glu").value) || cur.glucose,
      temperature: Number(document.getElementById("entry-input-temp").value) || cur.temperature,
      sleepHours: Number(document.getElementById("entry-input-sleep").value) || cur.sleepHours,
      moodScore: Number(document.getElementById("entry-input-mood").value) || cur.moodScore
    };
    vitals.biomarkers = buildBiomarkersFromVitals(vitals);
    return vitals;
  }

  function handleLiveEntryChange() {
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const draft = readDraftVitalsFromInputs();
    state.draftEntry = draft;

    const evaluation = window.DECISION_ENGINE.evaluateMetrics(draft, profile.baselines);

    Object.keys(evaluation.metrics).forEach((mKey) => {
      const mEval = evaluation.metrics[mKey];
      const card = document.getElementById(`guide-entry-card-${mKey}`);
      const pill = document.getElementById(`live-pill-${mKey}`);
      const delta = document.getElementById(`live-delta-${mKey}`);
      const proto = document.getElementById(`live-protocol-${mKey}`);

      if (card) card.className = `guide-card status-border-${mEval.status}`;
      if (pill) {
        pill.className = `status-pill status-${mEval.status}`;
        pill.textContent = mEval.statusText;
      }
      if (delta) {
        delta.className = `entry-delta-line delta-${mEval.status}`;
        delta.textContent = `Baz Değerinizden Fark: ${mEval.deltaDisplay} — ${mEval.summary}`;
      }
      if (proto) {
        proto.className = `action-protocol-box action-protocol-${mEval.status}`;
      }
    });

    renderEntryLiveSummary(evaluation);
    renderHeaderAndBaselines(evaluation);
    renderMetricCards(evaluation);
    renderBodyMap(evaluation);
    renderDecisionEngine(evaluation, draft);
  }

  function renderEntryLiveSummary(evaluation) {
    const summaryEl = document.getElementById("entry-live-summary");
    if (!summaryEl) return;

    if (evaluation.alerts.length === 0) {
      summaryEl.innerHTML = `
        <span class="status-pill status-normal">CANLI ANALİZ: NORMAL (YEŞİL)</span>
        <span>Girdiğiniz tüm yeni gün ölçümleri kişisel baz değerlerinizle uyumlu. Kaydederek yeni günü tamamlayabilirsiniz.</span>
      `;
    } else {
      const alertNames = evaluation.alerts.map((a) => a.name).join(", ");
      summaryEl.innerHTML = `
        <span class="status-pill status-${evaluation.overallStatus}">CANLI ANALİZ: ${evaluation.alerts.length} METRİKTE SAPMA</span>
        <span><strong>Sapma Tespit Edilenler:</strong> ${alertNames}. Kartların altındaki <strong>"NE YAPILMALI?"</strong> adımlarını uygulayın.</span>
      `;
    }
  }

  function saveNewDayMeasurement(switchToOverview = true) {
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const draft = readDraftVitalsFromInputs();
    const savedDayNum = getNextDayNumber();
    draft.day = savedDayNum;

    const evaluation = window.DECISION_ENGINE.evaluateMetrics(draft, profile.baselines);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} UTC`;

    const statusLabel =
      evaluation.overallStatus === "normal"
        ? "NORMAL (YEŞİL)"
        : evaluation.overallStatus === "warning"
          ? "DİKKAT (SARI)"
          : "KRİTİK (KIRMIZI)";

    const newRecord = Object.assign({}, draft, {
      id: `${state.crewId}-day-${savedDayNum}-${Date.now()}`,
      day: savedDayNum,
      time: timeStr,
      crewId: state.crewId,
      crewName: profile.name,
      overallStatus: evaluation.overallStatus,
      statusLabel
    });

    state.crewLogs[state.crewId].push(newRecord);

    // Gamification reward: advance streak and XP for the new day
    state.gamification.completedTasks["task-vitals"] = true;
    state.gamification.completedTasks["task-mood"] = true;
    state.gamification.streakDays += 1;
    state.gamification.xp += 50;

    // Keep the newly entered values active so Tab 2/3 show the analysis of what was just saved
    state.draftEntry = Object.assign({}, newRecord, { day: getNextDayNumber() });

    updateAll();

    if (switchToOverview) {
      switchTab("tab-overview");
    }

    showToast(
      `Görev Günü ${savedDayNum} Kaydedildi (+50 Puan)`,
      evaluation.alerts.length > 0
        ? `Gün ${savedDayNum} kayıt defterine eklendi. ${evaluation.alerts.length} metrik için 'NE YAPILMALI?' protokolü hazırlandı.`
        : `Gün ${savedDayNum} ölçümleri kişisel baz çizginizle uyumlu. Sistem Görev Günü ${getNextDayNumber()} girişi için hazır.`,
      evaluation.alerts.length > 0 ? "warning" : "success"
    );
  }

  function renderMeasurementLogTable() {
    const tbody = document.getElementById("measurement-log-tbody");
    const badge = document.getElementById("logbook-count-badge");
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const b = profile.baselines;
    if (!tbody) return;

    const log = getActiveCrewLog().slice().reverse();
    if (badge) {
      badge.textContent = `${log.length} Gün Kayıtlı`;
    }

    const chartPill = document.getElementById("chart-recorded-days-pill");
    if (chartPill) {
      chartPill.textContent = `${log.length} GÜN KAYITLI`;
    }

    tbody.innerHTML = log
      .map(
        (item) => `
        <tr>
          <td><strong>Gün ${item.day}</strong> <span class="log-time">${item.time}</span></td>
          <td>${item.crewName}</td>
          <td><strong>${item.bpSystolic}/${item.bpDiastolic}</strong> <small class="log-base-note">(Baz: ${b.bpSystolic}/${b.bpDiastolic})</small></td>
          <td><strong>${item.heartRate}</strong> <small class="log-base-note">(Baz: ${b.heartRate})</small></td>
          <td><strong>${item.glucose}</strong> <small class="log-base-note">(Baz: ${b.glucose})</small></td>
          <td><strong>${item.temperature}°C</strong> <small class="log-base-note">(Baz: ${b.temperature}°C)</small></td>
          <td><strong>${item.sleepHours} sa</strong> <small class="log-base-note">(Baz: ${b.sleepHours})</small></td>
          <td><strong>${item.moodScore}</strong> <small class="log-base-note">(Baz: ${b.moodScore})</small></td>
          <td><span class="status-pill status-${item.overallStatus}">${item.statusLabel}</span></td>
          <td>
            <button type="button" class="btn-chip btn-load-log" data-log-day="${item.day}">
              Analizi Gör
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    tbody.querySelectorAll(".btn-load-log").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dayNum = Number(btn.getAttribute("data-log-day"));
        const logItem = getActiveCrewLog().find((x) => x.day === dayNum);
        if (!logItem) return;
        state.draftEntry = Object.assign({}, logItem);
        updateAll();
        switchTab("tab-overview");
        showToast("Geçmiş Gün Analizi Açıldı", `Görev Günü ${logItem.day} ölçüm analizi gösteriliyor.`);
      });
    });
  }

  // =========================================================================
  // SEKME 2: 6 METRİK DURUM KARTI VE KARAR MOTORU
  // =========================================================================
  function renderMetricCards(evaluation) {
    const grid = document.getElementById("metrics-grid");
    const order = ["bp", "heartRate", "glucose", "temperature", "sleepHours", "moodScore"];
    const guideMap = {
      bp: "bp",
      heartRate: "hr",
      glucose: "glucose",
      temperature: "temp",
      sleepHours: "sleep",
      moodScore: "mood"
    };

    grid.innerHTML = order
      .map((key) => {
        const m = evaluation.metrics[key];
        const svgIcon = window.ASTRA_ICONS.get(m.iconKey);
        return `
          <div class="metric-card status-border-${m.status}" data-metric-key="${key}">
            <div class="metric-card-top">
              <div class="metric-title-wrap">
                <div class="metric-icon-svg">${svgIcon}</div>
                <div>
                  <h3 class="metric-name">${m.name}</h3>
                  <span class="metric-citation">${m.citation}</span>
                </div>
              </div>
              <span class="status-pill status-${m.status}">${m.statusText}</span>
            </div>

            <div class="metric-value-row">
              <div class="metric-main-value">
                <span class="val-num">${m.valueDisplay}</span>
                <span class="val-unit">${m.unit}</span>
              </div>
              <div class="metric-baseline-box">
                <div class="base-line-label">Kişisel Bazınız: <strong>${m.baselineDisplay}</strong></div>
                <div class="delta-label delta-${m.status}">Fark: ${m.deltaDisplay}</div>
              </div>
            </div>

            <p class="metric-summary-text">${m.summary}</p>

            <div class="metric-card-footer">
              <button class="btn-chip btn-edit-metric" data-metric-key="${key}">
                Yeni Değer Gir
              </button>
              <button class="btn-chip btn-guide-open" data-guide-id="${guideMap[key]}">
                Ölçüm & Ne Yapılmalı?
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".btn-edit-metric").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = btn.getAttribute("data-metric-key");
        switchTab("tab-guides");
        const targetCard = document.getElementById(`guide-entry-card-${key}`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
          const inp = targetCard.querySelector("input");
          if (inp) setTimeout(() => inp.focus(), 250);
        }
      });
    });

    grid.querySelectorAll(".btn-guide-open").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openGuideModal(btn.getAttribute("data-guide-id"));
      });
    });
  }

  function renderBodyMap(evaluation) {
    const regions = evaluation.bodyRegions;

    Object.keys(regions).forEach((sysId) => {
      const regState = regions[sysId];
      const svgGroup = document.getElementById(`svg-node-${sysId}`);
      if (svgGroup) {
        svgGroup.setAttribute(
          "class",
          `body-hotspot hotspot-${regState.status} ${state.selectedBodySystem === sysId ? "hotspot-active" : ""}`
        );
      }
    });

    const selectorContainer = document.getElementById("body-system-buttons");
    selectorContainer.innerHTML = Object.values(window.NASA_DATA.BODY_SYSTEMS)
      .map((sys) => {
        const st = regions[sys.id]?.status || "normal";
        const isActive = state.selectedBodySystem === sys.id;
        const dotClass = st === "normal" ? "dot-green" : st === "warning" ? "dot-yellow" : "dot-red";
        return `
          <button class="body-sys-btn ${isActive ? "active" : ""}" data-sys-id="${sys.id}">
            <span class="sys-btn-left">
              <span class="sys-btn-svg">${window.ASTRA_ICONS.get(sys.iconKey)}</span>
              <span>${sys.shortName}</span>
            </span>
            <span class="status-dot ${dotClass}"></span>
          </button>
        `;
      })
      .join("");

    selectorContainer.querySelectorAll(".body-sys-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedBodySystem = btn.getAttribute("data-sys-id");
        renderBodyMap(evaluation);
      });
    });

    const sysData = window.NASA_DATA.BODY_SYSTEMS[state.selectedBodySystem];
    const liveRegion = regions[state.selectedBodySystem];
    const statusText =
      liveRegion.status === "normal"
        ? "NORMAL (YEŞİL)"
        : liveRegion.status === "warning"
          ? "DİKKAT (SARI)"
          : "KRİTİK MÜDAHALE (KIRMIZI)";

    const detailPanel = document.getElementById("body-system-detail");
    detailPanel.innerHTML = `
      <div class="organ-detail-header">
        <div class="organ-header-left">
          <div class="organ-large-svg">${window.ASTRA_ICONS.get(sysData.iconKey)}</div>
          <div>
            <span class="organ-subtitle">${sysData.subtitle}</span>
            <h3 class="organ-title">${sysData.name}</h3>
          </div>
        </div>
        <span class="status-pill status-${liveRegion.status}">${statusText}</span>
      </div>

      <div class="organ-live-status status-box-${liveRegion.status}">
        <strong>Girilen Ölçümlere Göre Durum:</strong> ${liveRegion.liveNote}
      </div>

      <div class="action-protocol-box action-protocol-${liveRegion.status}">
        <div class="action-protocol-header">
          <span class="action-protocol-badge">NE YAPILMALI?</span>
          <span class="action-protocol-title">Uygulanacak Karşı Önlem Protokolü</span>
        </div>
        <ol class="action-step-list">
          ${sysData.countermeasures.map((c) => `<li>${c}</li>`).join("")}
        </ol>
      </div>

      <div class="organ-info-block">
        <h4>Uzay Kaynaklı Risk Özeti</h4>
        <ul class="organ-list">
          ${sysData.spaceRisks.map((r) => `<li>${r}</li>`).join("")}
        </ul>
      </div>

      <div class="organ-source-footer">
        <span>NASA Referansı: <strong>${sysData.nasaSource}</strong></span>
      </div>
    `;
  }

  function renderDecisionEngine(evaluation, currentData) {
    const alertCountEl = document.getElementById("decision-alert-count");
    const container = document.getElementById("decision-alerts-container");
    const syndromeEl = document.getElementById("syndrome-banner-box");

    if (evaluation.syndromeBanner) {
      const sb = evaluation.syndromeBanner;
      syndromeEl.style.display = "block";
      syndromeEl.className = `syndrome-banner syndrome-${sb.severity}`;
      syndromeEl.innerHTML = `
        <div class="syndrome-title">${sb.title}</div>
        <div class="syndrome-action">
          <span class="action-protocol-badge">ACİL EYLEM</span>
          <strong>NE YAPILMALI:</strong> ${sb.action}
        </div>
      `;
    } else {
      syndromeEl.style.display = "none";
    }

    if (evaluation.alerts.length === 0) {
      alertCountEl.className = "status-pill status-normal";
      alertCountEl.textContent = "0 Aktif Uyarı • Her Şey Normal";
      container.innerHTML = `
        <div class="nominal-decision-card">
          <div>${window.ASTRA_ICONS.get("checkCircle")}</div>
          <div>
            <h4>Girilen Tüm Sağlık Değerleri Kişisel Baz Çizginizle Uyumlu</h4>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
              Ölçüp girdiğiniz değerler uçuş öncesi kişisel baz çizginizle uyumludur. Rutin egzersiz ve su tüketim planına devam edin.
            </p>
            <div class="biomarker-mini-strip">
              <span>Enflamasyon (IL-6): <strong>${currentData.biomarkers?.il6_pg_ml || 1.6} pg/mL</strong> (Normal)</span>
              <span>İdrar Kalsiyum: <strong>${currentData.biomarkers?.urine_calcium_mg_day || 180} mg/gün</strong> (Normal)</span>
              <span>Göz Siniri Çapı: <strong>${currentData.biomarkers?.optic_nerve_sheath_mm || 5.2} mm</strong> (Normal)</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    alertCountEl.className = `status-pill status-${evaluation.overallStatus}`;
    alertCountEl.textContent = `${evaluation.alerts.length} Müdahale Gerekli`;

    container.innerHTML = evaluation.alerts
      .map(
        (alert) => `
        <div class="decision-alert-card alert-border-${alert.status}">
          <div class="decision-alert-header">
            <div class="alert-title-group">
              <div class="metric-icon-svg">${window.ASTRA_ICONS.get(alert.iconKey)}</div>
              <div>
                <h4>${alert.name}: ${alert.valueDisplay} ${alert.unit} <small>(Kişisel Bazınız: ${alert.baselineDisplay} | Fark: ${alert.deltaDisplay})</small></h4>
                <span class="alert-cause-inline"><strong>Tespit:</strong> ${alert.physiologyExplanation}</span>
              </div>
            </div>
            <span class="status-pill status-${alert.status}">${alert.statusText}</span>
          </div>

          <div class="action-protocol-box action-protocol-${alert.status}">
            <div class="action-protocol-header">
              <span class="action-protocol-badge">NE YAPILMALI?</span>
              <span class="action-protocol-title">Hemen Uygulanacak Müdahale Adımları</span>
            </div>
            <ol class="action-step-list">
              ${(alert.actionSteps || []).map((step) => `<li>${step}</li>`).join("")}
            </ol>
          </div>

          <div class="decision-alert-footer">
            <span>Protokol Kaynağı: ${alert.citation}</span>
            <button class="btn-apply-countermeasure">
              Protokolü Uyguladım • Yeni Kontrol Ölçümü Gir (+35 Puan)
            </button>
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll(".btn-apply-countermeasure").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyCountermeasureStabilization();
      });
    });
  }

  function applyCountermeasureStabilization() {
    state.activeScenarioId = "nominal";
    state.draftEntry = getDefaultDraftForCrew(state.crewId);
    const scenarioSelect = document.getElementById("anomaly-scenario-select");
    if (scenarioSelect) scenarioSelect.value = "nominal";

    state.gamification.xp += 35;
    const autonomyBadge = window.NASA_DATA.BADGES.find((b) => b.id === "badge-autonomy");
    if (autonomyBadge) autonomyBadge.unlocked = true;

    updateAll();
    showToast(
      "Karşı Önlem Uygulandı (+35 Puan)",
      "Önerilen protokol uygulandı ve değerler kişisel baz aralığınıza döndü.",
      "success"
    );
  }

  function renderCharts() {
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const recordedEntries = getActiveCrewLog();

    const mainCanvas = document.getElementById("telemetry-canvas");
    const cfg = window.ASTRA_CHARTS.METRIC_CONFIG[state.selectedMetric];
    document.getElementById("chart-metric-title").textContent = cfg.title;

    window.ASTRA_CHARTS.renderTelemetryChart(
      mainCanvas,
      recordedEntries,
      profile.baselines,
      state.selectedMetric
    );

    document.querySelectorAll(".chart-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-metric") === state.selectedMetric);
    });

    const osdrStudy = window.NASA_DATA.OSDR_REFERENCE_DATA[state.osdrStudyKey];
    const osdrCanvas = document.getElementById("osdr-canvas");
    if (osdrStudy && osdrCanvas) {
      const marker = osdrStudy.markers[state.osdrMarkerIdx] || osdrStudy.markers[0];
      document.getElementById("osdr-study-title").textContent = `${osdrStudy.code}: ${osdrStudy.title}`;
      document.getElementById("osdr-method-text").textContent = osdrStudy.method;
      document.getElementById("osdr-marker-insight").textContent = marker.insight;
      document.getElementById("osdr-external-link").href = osdrStudy.url;

      const markerBtns = document.getElementById("osdr-marker-buttons");
      markerBtns.innerHTML = osdrStudy.markers
        .map(
          (m, idx) => `
          <button class="btn-chip ${idx === state.osdrMarkerIdx ? "active" : ""}" data-marker-idx="${idx}">
            ${m.name} (${m.unit})
          </button>
        `
        )
        .join("");

      markerBtns.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => {
          state.osdrMarkerIdx = Number(b.getAttribute("data-marker-idx"));
          const osdrBadge = window.NASA_DATA.BADGES.find((bg) => bg.id === "badge-osdr");
          if (osdrBadge) osdrBadge.unlocked = true;
          renderCharts();
          renderGamification();
        });
      });

      window.ASTRA_CHARTS.renderOsdrChart(osdrCanvas, osdrStudy, state.osdrMarkerIdx);
    }
  }

  function openGuideModal(guideId) {
    const g = window.NASA_DATA.GUIDE_CARDS.find((item) => item.id === guideId);
    if (!g) return;
    const modal = document.getElementById("guide-modal");
    const content = document.getElementById("guide-modal-body");
    content.innerHTML = `
      <div class="modal-guide-head">
        <div class="organ-large-svg">${window.ASTRA_ICONS.get(g.iconKey)}</div>
        <div>
          <h3>${g.title}</h3>
          <p class="guide-ref-range"><strong>Cihaz: ${g.device} • ${g.normalBaselineNote}</strong></p>
        </div>
      </div>
      <div class="action-protocol-box action-protocol-warning" style="margin-bottom: 14px;">
        <div class="action-protocol-header">
          <span class="action-protocol-badge">NE YAPILMALI?</span>
          <span class="action-protocol-title">Değer Bozulduğunda Uygulanacak Protokol</span>
        </div>
        <ol class="action-step-list">
          ${g.actionSteps.map((s) => `<li>${s}</li>`).join("")}
        </ol>
      </div>
      <div class="modal-guide-grid">
        <div class="modal-guide-box">
          <h4>Nasıl Ölçülür? (Adım Adım)</h4>
          <ol class="guide-steps">
            ${g.howToMeasure.map((s) => `<li>${s}</li>`).join("")}
          </ol>
        </div>
        <div class="modal-guide-box">
          <h4>Uzay Ortamı Etkisi</h4>
          <p>${g.spaceEffect}</p>
        </div>
      </div>
    `;
    modal.classList.add("open");
  }

  function renderGamification() {
    const g = state.gamification;
    const missions = window.NASA_DATA.DAILY_MISSIONS;
    const completedCount = missions.filter((m) => g.completedTasks[m.id]).length;
    const completionPct = Math.round((completedCount / missions.length) * 100);
    const level = Math.floor(g.xp / 250) + 1;
    const levelProgress = Math.round(((g.xp % 250) / 250) * 100);

    document.getElementById("streak-count-val").textContent = `${g.streakDays} Gün`;
    document.getElementById("xp-total-val").textContent = `${g.xp} Puan`;
    document.getElementById("crew-level-badge").textContent = `Seviye ${level} • Uzay Sağlık Koruyucusu`;
    document.getElementById("xp-progress-fill").style.width = `${levelProgress}%`;
    document.getElementById("daily-completion-label").textContent = `%${completionPct} (${completedCount}/${missions.length})`;
    document.getElementById("water-tracker-val").textContent = `${(g.waterCups * 0.25).toFixed(2)} / 2.50 Litre (${g.waterCups} / 10 Su Paketi)`;

    const taskListEl = document.getElementById("gamification-task-list");
    taskListEl.innerHTML = missions
      .map((m) => {
        const done = !!g.completedTasks[m.id];
        return `
          <label class="mission-task-item ${done ? "task-done" : ""}">
            <input type="checkbox" data-task-id="${m.id}" ${done ? "checked" : ""} />
            <div class="task-svg-wrap">${window.ASTRA_ICONS.get(m.iconKey)}</div>
            <div class="task-text">
              <div class="task-title">${m.title}</div>
              <div class="task-sub">${m.subtitle}</div>
            </div>
            <span class="task-xp-pill">+${m.xp} Puan</span>
          </label>
        `;
      })
      .join("");

    taskListEl.querySelectorAll("input[type='checkbox']").forEach((chk) => {
      chk.addEventListener("change", () => {
        const id = chk.getAttribute("data-task-id");
        const mission = missions.find((item) => item.id === id);
        const isChecked = chk.checked;
        g.completedTasks[id] = isChecked;
        if (isChecked) {
          g.xp += mission.xp;
          showToast(`Görev Tamamlandı: ${mission.title}`, `+${mission.xp} Puan kazanıldı!`, "success");
        } else {
          g.xp = Math.max(0, g.xp - mission.xp);
        }
        renderGamification();
      });
    });

    const badgesEl = document.getElementById("badges-container");
    badgesEl.innerHTML = window.NASA_DATA.BADGES.map(
      (b) => `
        <div class="badge-card ${b.unlocked ? "badge-unlocked" : "badge-locked"}">
          <div>${window.ASTRA_ICONS.get("badgeMedal")}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>
      `
    ).join("");
  }

  function updateAll() {
    const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
    const currentData = getActiveTelemetry();
    const evaluation = window.DECISION_ENGINE.evaluateMetrics(currentData, profile.baselines);

    renderHeaderAndBaselines(evaluation);
    renderGuideCardsSection();
    renderMeasurementLogTable();
    renderMetricCards(evaluation);
    renderBodyMap(evaluation);
    renderDecisionEngine(evaluation, currentData);
    if (state.activeTab === "tab-charts") {
      renderCharts();
    }
    renderGamification();
  }

  function bindEvents() {
    document.querySelectorAll(".main-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab-target"));
      });
    });

    const crewSelect = document.getElementById("crew-select");
    crewSelect.addEventListener("change", () => {
      state.crewId = crewSelect.value;
      state.draftEntry = getDefaultDraftForCrew(state.crewId);
      updateAll();
      showToast("Astronot Değiştirildi", `${window.NASA_DATA.CREW_PROFILES[state.crewId].name} kişisel baz değerleri yüklendi.`);
    });

    const scenarioSelect = document.getElementById("anomaly-scenario-select");
    scenarioSelect.addEventListener("change", () => {
      state.activeScenarioId = scenarioSelect.value;
      state.draftEntry = getDefaultDraftForCrew(state.crewId);
      updateAll();
      const sc = window.NASA_DATA.ANOMALY_SCENARIOS[state.activeScenarioId];
      if (sc && state.activeScenarioId !== "nominal") {
        showToast(`Örnek Ölçüm Değerleri Dolduruldu`, `${sc.title} değerleri veri giriş kutularına aktarıldı.`, "warning");
      }
    });

    document.getElementById("btn-focus-entry-tab").addEventListener("click", () => {
      switchTab("tab-guides");
      const firstInput = document.getElementById("entry-input-sys");
      if (firstInput) firstInput.focus();
    });

    document.getElementById("btn-reset-nominal").addEventListener("click", () => {
      state.activeScenarioId = "nominal";
      state.draftEntry = getDefaultDraftForCrew(state.crewId);
      scenarioSelect.value = "nominal";
      updateAll();
      showToast("Baz Değerlere Sıfırlandı", "Veri giriş alanları astronotun kişisel baz değerlerine sıfırlandı.", "success");
    });

    document.getElementById("btn-save-all-measurements").addEventListener("click", () => {
      saveNewDayMeasurement(false);
    });

    document.getElementById("btn-save-all-measurements-bottom").addEventListener("click", () => {
      saveNewDayMeasurement(true);
    });

    document.getElementById("btn-fill-normal-preset").addEventListener("click", () => {
      state.activeScenarioId = "nominal";
      scenarioSelect.value = "nominal";
      state.draftEntry = getDefaultDraftForCrew(state.crewId);
      updateAll();
      showToast("Normal Ölçümler Dolduruldu", "Kişisel baz çizginize uygun normal değerler kutulara yazıldı.");
    });

    document.getElementById("btn-fill-risk-preset").addEventListener("click", () => {
      const keys = ["sans_fluid_shift", "space_fever_cytokine", "circadian_collapse", "metabolic_renal_stress"];
      const currentIdx = keys.indexOf(state.activeScenarioId);
      const nextKey = keys[(currentIdx + 1) % keys.length];
      state.activeScenarioId = nextKey;
      scenarioSelect.value = nextKey;
      state.draftEntry = getDefaultDraftForCrew(state.crewId);
      updateAll();
      const sc = window.NASA_DATA.ANOMALY_SCENARIOS[nextKey];
      showToast("Örnek Riskli Ölçüm Dolduruldu", `${sc.title} değerleri kutulara aktarıldı.`, "warning");
    });

    document.querySelectorAll(".body-hotspot").forEach((node) => {
      node.addEventListener("click", () => {
        const sysId = node.getAttribute("data-sys-id");
        if (sysId) {
          state.selectedBodySystem = sysId;
          updateAll();
        }
      });
    });

    document.querySelectorAll(".chart-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedMetric = btn.getAttribute("data-metric");
        renderCharts();
      });
    });

    document.querySelectorAll(".osdr-study-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".osdr-study-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.osdrStudyKey = btn.getAttribute("data-study");
        state.osdrMarkerIdx = 0;
        const osdrBadge = window.NASA_DATA.BADGES.find((bg) => bg.id === "badge-osdr");
        if (osdrBadge) osdrBadge.unlocked = true;
        renderCharts();
        renderGamification();
      });
    });

    document.getElementById("btn-add-water").addEventListener("click", () => {
      if (state.gamification.waterCups < 12) {
        state.gamification.waterCups += 1;
        state.gamification.xp += 10;
        if (state.gamification.waterCups >= 10) {
          state.gamification.completedTasks["task-hydration"] = true;
          showToast("Günlük Su Hedefi Tamamlandı!", "2.5 litre su içildi, böbrek taşı riski önlendi.", "success");
        }
        renderGamification();
      }
    });

    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target === el || el.classList.contains("modal-close-btn")) {
          document.querySelectorAll(".modal-backdrop").forEach((m) => m.classList.remove("open"));
        }
      });
    });

    document.getElementById("btn-export-json").addEventListener("click", () => {
      const profile = window.NASA_DATA.CREW_PROFILES[state.crewId];
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        project: "ASTRA-MED NASA Space Apps Challenge 2026",
        astronaut: profile,
        recordedDailyMeasurements: getActiveCrewLog(),
        osdrReference: window.NASA_DATA.OSDR_REFERENCE_DATA
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ASTRA_MED_Gunluk_Kayit_Defteri_${state.crewId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Kayıt Defteri İndirildi", "Astronotun kaydettiği günlük ölçümler JSON olarak indirildi.", "success");
    });

    window.addEventListener("resize", () => {
      if (state.activeTab === "tab-charts") {
        renderCharts();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCrewLogs();
    initStaticIcons();
    bindEvents();
    updateAll();
  });
})();

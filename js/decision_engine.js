/**
 * ASTRA-MED Otonom Karar Motoru
 * Kısa durum tespiti + Vurgulu, doğrudan uygulanabilir "NE YAPILMALI?" adımları.
 */

window.DECISION_ENGINE = (function () {
  function formatSigned(val, decimals = 0) {
    const num = Number(val);
    const fixed = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
    return num > 0 ? `+${fixed}` : fixed;
  }

  function evaluateMetrics(current, baselines) {
    const results = {};
    const alerts = [];

    // 1. KAN BASINCI (TANSİYON)
    const sysDiff = current.bpSystolic - baselines.bpSystolic;
    const diaDiff = current.bpDiastolic - baselines.bpDiastolic;
    let bpStatus = "normal";
    let bpSummary = "Baz çizgisiyle uyumlu.";
    let bpCause = "Sıvı dağılımı dengeli.";
    let bpSteps = ["Mevcut sıvı ve egzersiz programına devam edin."];

    if (current.bpSystolic >= 142 || current.bpDiastolic >= 90 || sysDiff >= 24 || current.bpSystolic <= 90) {
      bpStatus = "critical";
      bpSummary = "Kritik Yüksek Tansiyon ve Göz Basıncı (SANS) Riski";
      bpCause = "Üst vücuda sıvı toplanması ve olası kabin CO₂ artışı damar basıncını kritik eşiğe çıkardı.";
      bpSteps = [
        "Belden aşağı vakum kıyafetini (LBNP) -25 mmHg'da 45 dakika çalıştırın.",
        "Kabin havalandırma fanını yüzünüze çevirin (CO₂ < 3 mmHg olmalı).",
        "10 dakika yavaş diyafram solunumu (dakikada 6 nefes) uygulayın."
      ];
    } else if (current.bpSystolic >= 130 || current.bpDiastolic >= 84 || sysDiff >= 14 || current.bpSystolic <= 98) {
      bpStatus = "warning";
      bpSummary = "Tansiyonda Yükselme Eğilimi";
      bpCause = "Baş bölgesine sıvı kayması nedeniyle kişisel ortalamanın üzerinde.";
      bpSteps = [
        "Akşam 30 dakika koruyucu LBNP vakum seansı uygulayın.",
        "Bu öğünde sodyum (tuz) alımını azaltın ve 10 dk nefes egzersizi yapın."
      ];
    }

    results.bp = {
      key: "bp",
      iconKey: "bp",
      name: "Kan Basıncı (Tansiyon)",
      valueDisplay: `${current.bpSystolic}/${current.bpDiastolic}`,
      unit: "mmHg",
      baselineDisplay: `${baselines.bpSystolic}/${baselines.bpDiastolic}`,
      deltaDisplay: `${formatSigned(sysDiff)}/${formatSigned(diaDiff)}`,
      status: bpStatus,
      statusText: bpStatus === "normal" ? "NORMAL" : bpStatus === "warning" ? "DİKKAT" : "KRİTİK",
      summary: bpSummary,
      physiologyExplanation: bpCause,
      actionSteps: bpSteps,
      citation: "NASA HRP SANS & Sıvı Kayması Protokolü"
    };
    if (bpStatus !== "normal") alerts.push(results.bp);

    // 2. NABIZ (KALP HIZI)
    const hrDiff = current.heartRate - baselines.heartRate;
    let hrStatus = "normal";
    let hrSummary = "Dinlenik kalp ritmi normal.";
    let hrCause = "Plazma hacmi dengede.";
    let hrSteps = ["Rutin kardiyo programına devam edin."];

    if (current.heartRate >= 98 || hrDiff >= 30 || current.heartRate <= 45) {
      hrStatus = "critical";
      hrSummary = "Kritik Nabız Yükselmesi (Taşikardi)";
      hrCause = "Sıvı kaybı (hipovolemi) ve termal stres nedeniyle kalp aşırı hızlı çalışıyor.";
      hrSteps = [
        "Hemen 2 paket (500 mL) elektrolitli su için.",
        "Ağır ARED egzersizini durdurup dinlenmeye geçin.",
        "Göğüs bandı ile 30 saniyelik EKG ritim kaydı alın."
      ];
    } else if (current.heartRate >= 82 || hrDiff >= 16) {
      hrStatus = "warning";
      hrSummary = "Nabız Ortalamanın Üzerinde";
      hrCause = "Hafif sıvı eksilmesi veya yorgunluk kaynaklı artış.";
      hrSteps = [
        "350 mL su için ve kafeinli içecekleri kesin.",
        "5 dakika yavaş nefes egzersizi uygulayın."
      ];
    }

    results.heartRate = {
      key: "heartRate",
      iconKey: "heartRate",
      name: "Nabız (Kalp Hızı)",
      valueDisplay: `${current.heartRate}`,
      unit: "Atım/dk",
      baselineDisplay: `${baselines.heartRate}`,
      deltaDisplay: `${formatSigned(hrDiff)}`,
      status: hrStatus,
      statusText: hrStatus === "normal" ? "NORMAL" : hrStatus === "warning" ? "DİKKAT" : "KRİTİK",
      summary: hrSummary,
      physiologyExplanation: hrCause,
      actionSteps: hrSteps,
      citation: "NASA Kardiyovasküler & OSD-575 Protokolü"
    };
    if (hrStatus !== "normal") alerts.push(results.heartRate);

    // 3. KAN ŞEKERİ (GLİKOZ)
    const gluDiff = current.glucose - baselines.glucose;
    let gluStatus = "normal";
    let gluSummary = "Açlık glikozu normal.";
    let gluCause = "Enerji metabolizması dengeli.";
    let gluSteps = ["Standart rasyon düzenine devam edin."];

    if (current.glucose >= 126 || gluDiff >= 38 || current.glucose <= 65) {
      gluStatus = "critical";
      gluSummary = "Kritik Kan Şekeri Yükselmesi (OSD-575)";
      gluCause = "Yerçekimsiz ortamda kasların az çalışması ve stres kortizolü glikozu yükseltti.";
      gluSteps = [
        "25 dakika orta tempolu CEVIS bisiklet egzersizi yaparak şekeri kaslarda yakın.",
        "Şekerli ve basit karbonhidratlı gıda paketlerini kesin.",
        "500 mL su için ve idrar stribi ile kontrol yapın."
      ];
    } else if (current.glucose >= 105 || gluDiff >= 18) {
      gluStatus = "warning";
      gluSummary = "Kan Şekerinde Hafif Yükselme";
      gluCause = "Mikrogravite kaynaklı hafif insülin direnci başlangıcı.";
      gluSteps = [
        "Yemekten 30 dk sonra 15 dakika bacak egzersizi ekleyin.",
        "Lif ve protein oranı yüksek rasyon paketlerini tercih edin."
      ];
    }

    results.glucose = {
      key: "glucose",
      iconKey: "glucose",
      name: "Kan Şekeri (Glikoz)",
      valueDisplay: `${current.glucose}`,
      unit: "mg/dL",
      baselineDisplay: `${baselines.glucose}`,
      deltaDisplay: `${formatSigned(gluDiff)}`,
      status: gluStatus,
      statusText: gluStatus === "normal" ? "NORMAL" : gluStatus === "warning" ? "DİKKAT" : "KRİTİK",
      summary: gluSummary,
      physiologyExplanation: gluCause,
      actionSteps: gluSteps,
      citation: "NASA OSDR OSD-575 Metabolik Protokolü"
    };
    if (gluStatus !== "normal") alerts.push(results.glucose);

    // 4. VÜCUT SICAKLIĞI
    const tempDiff = Number((current.temperature - baselines.temperature).toFixed(1));
    let tempStatus = "normal";
    let tempSummary = "Termal denge normal.";
    let tempCause = "Isı transferi dengeli.";
    let tempSteps = ["Standart kabin sıcaklığını koruyun."];

    if (current.temperature >= 37.8 || tempDiff >= 1.1) {
      tempStatus = "critical";
      tempSummary = "Kritik 'Uzay Ateşi' ve Enflamasyon Uyarısı";
      tempCause = "Terin buharlaşamaması ve bağışıklık sitokin artışı (OSD-575/656) çekirdek ısıyı yükseltti.";
      tempSteps = [
        "Sıvı soğutmalı içliği (LCVG) giyin ve kabin fanını maksimuma açın.",
        "Soğuk elektrolitli su için ve fiziksel çalışmayı durdurun.",
        "OSD-656 idrar enflamasyon test stribini uygulayın."
      ];
    } else if (current.temperature >= 37.3 || tempDiff >= 0.6) {
      tempStatus = "warning";
      tempSummary = "Vücut Sıcaklığında Artış";
      tempCause = "Mikrogravitede gecikmiş ısı atılımı.";
      tempSteps = [
        "Kabin fan hızını artırın ve 400 mL serin su için.",
        "20 dakika dinlenme moduna geçin."
      ];
    }

    results.temperature = {
      key: "temperature",
      iconKey: "temperature",
      name: "Vücut Sıcaklığı",
      valueDisplay: `${current.temperature.toFixed(1)}`,
      unit: "°C",
      baselineDisplay: `${baselines.temperature.toFixed(1)}`,
      deltaDisplay: `${formatSigned(tempDiff, 1)}`,
      status: tempStatus,
      statusText: tempStatus === "normal" ? "NORMAL" : tempStatus === "warning" ? "DİKKAT" : "KRİTİK",
      summary: tempSummary,
      physiologyExplanation: tempCause,
      actionSteps: tempSteps,
      citation: "NASA Uzay Ateşi & OSD-656 Protokolü"
    };
    if (tempStatus !== "normal") alerts.push(results.temperature);

    // 5. GÜNLÜK UYKU SÜRESİ
    const sleepDiff = Number((current.sleepHours - baselines.sleepHours).toFixed(1));
    let sleepStatus = "normal";
    let sleepSummary = "Uyku süresi yeterli.";
    let sleepCause = "Sirkadiyen ritim dengede.";
    let sleepSteps = ["Mevcut ışık ve uyku takvimini sürdürün."];

    if (current.sleepHours < 5.0 || sleepDiff <= -2.3) {
      sleepStatus = "critical";
      sleepSummary = "Kritik Uykusuzluk (Operasyonel Hata Riski)";
      sleepCause = "Sirkadiyen kayma ve kafa içi sıvı dolgunluğu uykuyu böldü.";
      sleepSteps = [
        "Kritik/tehlikeli görevleri erteleyin ve 25 dk güç uykusu (Power Nap) yapın.",
        "Sabah 30 dk 480nm mavi ışık açın; yatmadan 2 saat önce sarı/loş ışığa geçin.",
        "Uyku kabini sıcaklığını 19°C'ye çekin ve fanı çalıştırın."
      ];
    } else if (current.sleepHours < 6.3 || sleepDiff <= -1.2) {
      sleepStatus = "warning";
      sleepSummary = "Uyku Süresi Azaldı";
      sleepCause = "Hafif biyolojik saat kayması.";
      sleepSteps = [
        "Yatmadan 90 dk önce tüm ekranları kapatın.",
        "Sabah uyanınca 20 dk gün ışığı lambası kullanın."
      ];
    }

    results.sleepHours = {
      key: "sleepHours",
      iconKey: "sleepHours",
      name: "Günlük Uyku Süresi",
      valueDisplay: `${current.sleepHours.toFixed(1)}`,
      unit: "Saat",
      baselineDisplay: `${baselines.sleepHours.toFixed(1)}`,
      deltaDisplay: `${formatSigned(sleepDiff, 1)}`,
      status: sleepStatus,
      statusText: sleepStatus === "normal" ? "NORMAL" : sleepStatus === "warning" ? "DİKKAT" : "KRİTİK",
      summary: sleepSummary,
      physiologyExplanation: sleepCause,
      actionSteps: sleepSteps,
      citation: "NASA Sirkadiyen ve Uyku Protokolü"
    };
    if (sleepStatus !== "normal") alerts.push(results.sleepHours);

    // 6. RUH HALİ VE ODAK (MOOD)
    const moodDiff = Number((current.moodScore - baselines.moodScore).toFixed(1));
    let moodStatus = "normal";
    let moodSummary = "Odak ve moral yüksek.";
    let moodCause = "Bilişsel hazırlık iyi.";
    let moodSteps = ["Günlük ekip molalarını sürdürün."];

    if (current.moodScore < 4.5 || moodDiff <= -3.2) {
      moodStatus = "critical";
      moodSummary = "Kritik Moral ve Odak Düşüşü";
      moodCause = "İzolasyon, iletişim gecikmesi ve yorgunluk bilişsel performansı düşürdü.";
      moodSteps = [
        "20 dakikalık VR Dünya doğa simülasyonu seansını başlatın.",
        "Günlük iş yükünü %30 azaltın.",
        "Aile video mesajlarını izleyin ve mürettebatla serbest mola yapın."
      ];
    } else if (current.moodScore < 6.4 || moodDiff <= -1.8) {
      moodStatus = "warning";
      moodSummary = "Hafif Zihinsel Yorgunluk";
      moodCause = "Monoton görev temposu etkisi.";
      moodSteps = [
        "30 dakika serbest sosyal mola verin ve bitki modülü (Veggie) bakımı yapın."
      ];
    }

    results.moodScore = {
      key: "moodScore",
      iconKey: "moodScore",
      name: "Ruh Hali ve Odak",
      valueDisplay: `${current.moodScore.toFixed(1)}`,
      unit: "/ 10",
      baselineDisplay: `${baselines.moodScore.toFixed(1)}`,
      deltaDisplay: `${formatSigned(moodDiff, 1)}`,
      status: moodStatus,
      statusText: moodStatus === "normal" ? "NORMAL" : moodStatus === "warning" ? "DİKKAT" : "KRİTİK",
      summary: moodSummary,
      physiologyExplanation: moodCause,
      actionSteps: moodSteps,
      citation: "NASA Davranışsal Tıp Protokolü"
    };
    if (moodStatus !== "normal") alerts.push(results.moodScore);

    // VÜCUT HARİTASI DURUMLARI
    const statusWeight = { normal: 0, warning: 1, critical: 2 };
    function combineStatus(s1, s2, s3 = "normal") {
      const maxW = Math.max(statusWeight[s1] || 0, statusWeight[s2] || 0, statusWeight[s3] || 0);
      return maxW === 2 ? "critical" : maxW === 1 ? "warning" : "normal";
    }

    const bodyRegions = {
      head_sans: {
        status: combineStatus(results.bp.status, current.biomarkers?.optic_nerve_sheath_mm > 6.0 ? "critical" : current.biomarkers?.optic_nerve_sheath_mm > 5.6 ? "warning" : "normal"),
        liveNote: results.bp.status !== "normal"
          ? `Kafa içi sıvı basıncı yüksek (${current.bpSystolic}/${current.bpDiastolic} mmHg) — LBNP vakum protokolü uygulanmalı.`
          : `Kafa içi basınç ve görme siniri çapı (${current.biomarkers?.optic_nerve_sheath_mm || 5.2} mm) normal.`
      },
      brain_cns: {
        status: combineStatus(results.sleepHours.status, results.moodScore.status, results.temperature.status),
        liveNote: combineStatus(results.sleepHours.status, results.moodScore.status) !== "normal"
          ? `Uyku (${current.sleepHours} sa) ve Odak (${current.moodScore}/10) düşük — Mavi ışık ve dinlenme protokolü gerekli.`
          : `Uyku (${current.sleepHours} sa) ve bilişsel odak (${current.moodScore}/10) nominal.`
      },
      cardiovascular: {
        status: combineStatus(results.bp.status, results.heartRate.status),
        liveNote: combineStatus(results.bp.status, results.heartRate.status) !== "normal"
          ? `Tansiyon (${current.bpSystolic}/${current.bpDiastolic}) / Nabız (${current.heartRate}) sapması — Sıvı takviyesi ve nefes protokolü gerekli.`
          : `Kalp hızı (${current.heartRate} atım/dk) ve tansiyon baz çizgisinde.`
      },
      metabolic_endocrine: {
        status: combineStatus(results.glucose.status, results.temperature.status),
        liveNote: results.glucose.status !== "normal"
          ? `Glikoz yüksek (${current.glucose} mg/dL) — 20 dk CEVIS bisiklet egzersizi uygulanmalı.`
          : `Açlık glikozu (${current.glucose} mg/dL) normal sınırda.`
      },
      renal_immune: {
        status: combineStatus(
          results.temperature.status,
          (current.biomarkers?.urine_calcium_mg_day > 260 || current.biomarkers?.il6_pg_ml > 5.5) ? "critical" :
          (current.biomarkers?.urine_calcium_mg_day > 215 || current.biomarkers?.il6_pg_ml > 3.2) ? "warning" : "normal"
        ),
        liveNote: (current.biomarkers?.urine_calcium_mg_day > 215 || results.temperature.status !== "normal")
          ? `İdrar kalsiyumu yüksek (${current.biomarkers?.urine_calcium_mg_day || 235} mg/gün) — 2.5L su + Potasyum Sitrat alınmalı.`
          : `Böbrek kalsiyum atılımı ve enflamasyon değerleri normal.`
      },
      musculoskeletal: {
        status: (current.biomarkers?.urine_calcium_mg_day > 270) ? "critical" : (current.biomarkers?.urine_calcium_mg_day > 210 || results.sleepHours.status === "critical") ? "warning" : "normal",
        liveNote: (current.biomarkers?.urine_calcium_mg_day > 210)
          ? `Kemik kalsiyum yıkımı hızlandı — 60 dk ARED direnç egzersizi zorunlu.`
          : `ARED egzersiz uyumu tam, kemik yoğunluğu korunuyor.`
      }
    };

    let syndromeBanner = null;
    if (results.bp.status !== "normal" && results.sleepHours.status !== "normal") {
      syndromeBanner = {
        title: "BİRLEŞİK UYARI: Başa Sıvı Toplanması + Uyku Bölünmesi",
        severity: results.bp.status === "critical" ? "critical" : "warning",
        action: "HEMEN UYGULA: Yatmadan önce 45 dk LBNP vakum kıyafeti (-25 mmHg) giyin ve kabin fanını açın."
      };
    } else if (results.temperature.status !== "normal" && results.heartRate.status !== "normal") {
      syndromeBanner = {
        title: "BİRLEŞİK UYARI: Uzay Ateşi + Enflamasyon (OSD-575/656)",
        severity: "critical",
        action: "HEMEN UYGULA: Sıvı soğutmalı içliği (LCVG) giyin, 500 mL soğuk elektrolitli su için ve egzersizi durdurun."
      };
    } else if (results.glucose.status !== "normal" && (results.moodScore.status !== "normal" || results.sleepHours.status !== "normal")) {
      syndromeBanner = {
        title: "BİRLEŞİK UYARI: Stres Kaynaklı Kan Şekeri Artışı",
        severity: results.glucose.status,
        action: "HEMEN UYGULA: Sabah 30 dk mavi ışık terapisi açın ve yemek sonrası 20 dk CEVIS bisiklet sürün."
      };
    }

    let penalty = 0;
    Object.values(results).forEach((m) => {
      if (m.status === "warning") penalty += 8;
      if (m.status === "critical") penalty += 18;
    });
    const healthScore = Math.max(22, Math.min(100, 100 - penalty));

    return {
      metrics: results,
      alerts,
      bodyRegions,
      syndromeBanner,
      healthScore,
      overallStatus: alerts.some((a) => a.status === "critical")
        ? "critical"
        : alerts.length > 0
          ? "warning"
          : "normal"
    };
  }

  return {
    evaluateMetrics
  };
})();

/**
 * ASTRA-MED Özel Yüksek Çözünürlüklü (Retina/HiDPI) HTML5 Canvas Grafik Motoru
 * Astronotun Kaydettiği Günlük Ölçümlerin Kişisel Baz Çizgisine Göre Grafiği
 */

window.ASTRA_CHARTS = (function () {
  const METRIC_CONFIG = {
    bp: {
      title: "Kan Basıncı (Tansiyon) - Kaydedilen Günlük Ölçümler ve Baz Çizgisi",
      unit: "mmHg",
      minY: 55,
      maxY: 165,
      warningHigh: 130,
      criticalHigh: 142,
      colorPrimary: "#6c95bd",
      colorSecondary: "#858da8",
      getValue: (d) => d.bpSystolic,
      getSecondary: (d) => d.bpDiastolic,
      getBaseline: (b) => b.bpSystolic,
      getBaselineSecondary: (b) => b.bpDiastolic
    },
    heartRate: {
      title: "Nabız (Kalp Atış Hızı) - Kaydedilen Günlük Ölçümler ve Baz Çizgisi",
      unit: "Atım/dk",
      minY: 45,
      maxY: 120,
      warningHigh: 82,
      criticalHigh: 98,
      colorPrimary: "#c96969",
      getValue: (d) => d.heartRate,
      getBaseline: (b) => b.heartRate
    },
    glucose: {
      title: "Açlık Kan Şekeri (Glikoz) - Kaydedilen Günlük Ölçümler ve Baz Çizgisi",
      unit: "mg/dL",
      minY: 65,
      maxY: 165,
      warningHigh: 105,
      criticalHigh: 126,
      colorPrimary: "#c28e38",
      getValue: (d) => d.glucose,
      getBaseline: (b) => b.glucose
    },
    temperature: {
      title: "Vücut Sıcaklığı - Kaydedilen Günlük Ölçümler ve Baz Çizgisi",
      unit: "°C",
      minY: 36.0,
      maxY: 38.8,
      warningHigh: 37.3,
      criticalHigh: 37.8,
      colorPrimary: "#c47d4e",
      getValue: (d) => d.temperature,
      getBaseline: (b) => b.temperature
    },
    sleepHours: {
      title: "Günlük Uyku Süresi - Kaydedilen Günlük Ölçümler ve Baz Çizgisi",
      unit: "Saat",
      minY: 3.0,
      maxY: 9.5,
      warningLow: 6.3,
      criticalLow: 5.0,
      colorPrimary: "#8c82ba",
      getValue: (d) => d.sleepHours,
      getBaseline: (b) => b.sleepHours
    },
    moodScore: {
      title: "Ruh Hali ve Odak Puanı - Kaydedilen Günlük Ölçümler ve Baz Çizgisi",
      unit: "/ 10",
      minY: 1.0,
      maxY: 10.5,
      warningLow: 6.4,
      criticalLow: 4.5,
      colorPrimary: "#589e7d",
      getValue: (d) => d.moodScore,
      getBaseline: (b) => b.moodScore
    }
  };

  function setupHiDPICanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, rect.width || 720);
    const height = Math.max(220, rect.height || 290);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function renderTelemetryChart(canvas, recordedEntries, baselines, metricKey) {
    if (!canvas || !recordedEntries || !recordedEntries.length) return;
    const cfg = METRIC_CONFIG[metricKey] || METRIC_CONFIG.bp;
    const { ctx, width, height } = setupHiDPICanvas(canvas);

    const pad = { top: 30, right: 34, bottom: 38, left: 52 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    ctx.clearRect(0, 0, width, height);

    const count = recordedEntries.length;
    const xForIdx = (idx) => {
      if (count <= 1) return pad.left + plotW / 2;
      return pad.left + (idx / (count - 1)) * plotW;
    };
    const yForVal = (val) => {
      const clamped = Math.max(cfg.minY, Math.min(cfg.maxY, val));
      return pad.top + plotH - ((clamped - cfg.minY) / (cfg.maxY - cfg.minY)) * plotH;
    };

    if (cfg.criticalHigh) {
      const yCrit = yForVal(cfg.criticalHigh);
      const yWarn = yForVal(cfg.warningHigh);

      ctx.fillStyle = "rgba(194, 82, 82, 0.08)";
      ctx.fillRect(pad.left, pad.top, plotW, Math.max(0, yCrit - pad.top));

      ctx.fillStyle = "rgba(194, 142, 56, 0.07)";
      ctx.fillRect(pad.left, yCrit, plotW, Math.max(0, yWarn - yCrit));

      ctx.fillStyle = "rgba(70, 148, 110, 0.05)";
      ctx.fillRect(pad.left, yWarn, plotW, Math.max(0, pad.top + plotH - yWarn));
    } else if (cfg.criticalLow) {
      const yWarn = yForVal(cfg.warningLow);
      const yCrit = yForVal(cfg.criticalLow);

      ctx.fillStyle = "rgba(70, 148, 110, 0.05)";
      ctx.fillRect(pad.left, pad.top, plotW, Math.max(0, yWarn - pad.top));

      ctx.fillStyle = "rgba(194, 142, 56, 0.07)";
      ctx.fillRect(pad.left, yWarn, plotW, Math.max(0, yCrit - yWarn));

      ctx.fillStyle = "rgba(194, 82, 82, 0.08)";
      ctx.fillRect(pad.left, yCrit, plotW, Math.max(0, pad.top + plotH - yCrit));
    }

    ctx.strokeStyle = "rgba(162, 171, 184, 0.12)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#727b88";
    ctx.font = "11px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "right";

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const val = cfg.minY + ((cfg.maxY - cfg.minY) / steps) * i;
      const y = yForVal(val);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();

      const label = cfg.maxY - cfg.minY <= 10 ? val.toFixed(1) : Math.round(val);
      ctx.fillText(label, pad.left - 8, y + 4);
    }

    // X-Axis ticks for each recorded day
    ctx.textAlign = "center";
    recordedEntries.forEach((entry, idx) => {
      const x = xForIdx(idx);
      ctx.strokeStyle = "rgba(162, 171, 184, 0.1)";
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();

      ctx.fillStyle = idx === count - 1 ? "#e8ecf1" : "#727b88";
      ctx.font = idx === count - 1 ? "600 11px 'Inter', system-ui, sans-serif" : "11px 'Inter', system-ui, sans-serif";
      ctx.fillText(`Gün ${entry.day}`, x, pad.top + plotH + 20);
    });

    // Personal Baseline Line
    const baseVal = cfg.getBaseline(baselines);
    const yBase = yForVal(baseVal);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "rgba(123, 196, 160, 0.75)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(pad.left, yBase);
    ctx.lineTo(pad.left + plotW, yBase);
    ctx.stroke();
    ctx.fillStyle = "#7bc4a0";
    ctx.textAlign = "left";
    ctx.font = "600 11px 'Inter', system-ui, sans-serif";
    ctx.fillText(`Kişisel Baz Değeriniz (Normaliniz: ${baseVal} ${cfg.unit})`, pad.left + 8, yBase - 6);
    ctx.restore();

    if (cfg.getSecondary && count > 1) {
      ctx.save();
      ctx.strokeStyle = cfg.colorSecondary;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      recordedEntries.forEach((point, idx) => {
        const val = cfg.getSecondary(point);
        const x = xForIdx(idx);
        const y = yForVal(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    }

    if (count > 1) {
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
      grad.addColorStop(0, cfg.colorPrimary + "33");
      grad.addColorStop(1, cfg.colorPrimary + "00");

      ctx.beginPath();
      recordedEntries.forEach((point, idx) => {
        const val = cfg.getValue(point);
        const x = xForIdx(idx);
        const y = yForVal(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(xForIdx(count - 1), pad.top + plotH);
      ctx.lineTo(xForIdx(0), pad.top + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      recordedEntries.forEach((point, idx) => {
        const val = cfg.getValue(point);
        const x = xForIdx(idx);
        const y = yForVal(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = cfg.colorPrimary;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // Draw nodes and value labels for each recorded day
    recordedEntries.forEach((point, idx) => {
      const val = cfg.getValue(point);
      const x = xForIdx(idx);
      const y = yForVal(val);

      ctx.beginPath();
      ctx.arc(x, y, idx === count - 1 ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = idx === count - 1 ? "#e8ecf1" : cfg.colorPrimary;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#15181e";
      ctx.stroke();

      const valLabel = cfg.getSecondary ? `${point.bpSystolic}/${point.bpDiastolic}` : `${val}`;
      ctx.fillStyle = idx === count - 1 ? "#e8ecf1" : "#a2abb8";
      ctx.font = idx === count - 1 ? "700 11px 'Inter', system-ui, sans-serif" : "600 10px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(valLabel, x, Math.max(pad.top + 12, y - 10));
    });
  }

  function renderOsdrChart(canvas, studyData, markerIndex = 0) {
    if (!canvas || !studyData) return;
    const marker = studyData.markers[markerIndex] || studyData.markers[0];
    const timepoints = studyData.timepoints;
    const values = marker.values;

    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const pad = { top: 32, right: 24, bottom: 38, left: 48 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    ctx.clearRect(0, 0, width, height);

    const minVal = Math.min(...values) * 0.82;
    const maxVal = Math.max(...values, marker.normalMax) * 1.15;

    const yForVal = (v) => pad.top + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

    ctx.strokeStyle = "rgba(162, 171, 184, 0.12)";
    ctx.fillStyle = "#727b88";
    ctx.font = "11px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const v = minVal + ((maxVal - minVal) / 4) * i;
      const y = yForVal(v);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
      ctx.fillText(v.toFixed(1), pad.left - 8, y + 4);
    }

    const yNorm = yForVal(marker.normalMax);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#c25252";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(pad.left, yNorm);
    ctx.lineTo(pad.left + plotW, yNorm);
    ctx.stroke();
    ctx.fillStyle = "#e08282";
    ctx.textAlign = "right";
    ctx.font = "600 10px 'Inter', system-ui, sans-serif";
    ctx.fillText(`Normal Üst Sınır (${marker.normalMax} ${marker.unit})`, pad.left + plotW - 4, yNorm - 5);
    ctx.restore();

    const barSlot = plotW / values.length;
    const barW = Math.min(38, barSlot * 0.48);

    values.forEach((v, i) => {
      const cx = pad.left + barSlot * i + barSlot / 2;
      const y = yForVal(v);
      const h = pad.top + plotH - y;
      const isElevated = v > marker.normalMax;

      ctx.fillStyle = isElevated ? "rgba(194, 82, 82, 0.55)" : "rgba(70, 115, 158, 0.55)";
      ctx.strokeStyle = isElevated ? "#c25252" : "#5b82a6";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.roundRect(cx - barW / 2, y, barW, h, [4, 4, 0, 0]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e8ecf1";
      ctx.font = "600 11px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${v}`, cx, y - 7);

      ctx.fillStyle = "#a2abb8";
      ctx.font = "11px 'Inter', system-ui, sans-serif";
      ctx.fillText(timepoints[i], cx, pad.top + plotH + 20);
    });
  }

  return {
    METRIC_CONFIG,
    renderTelemetryChart,
    renderOsdrChart
  };
})();

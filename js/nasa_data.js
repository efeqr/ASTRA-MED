/**
 * ASTRA-MED: NASA Space Apps Challenge 2026
 * Astronot Odaklı, Kısa ve Eylem Vurgulu Veri Katmanı
 */

window.NASA_DATA = (function () {
  const CREW_PROFILES = {
    "cdr-kaya": {
      id: "cdr-kaya",
      name: "Elif Kaya",
      role: "Görev Komutanı",
      age: 38,
      bloodType: "A Rh+",
      seed: 101,
      baselines: {
        bpSystolic: 116,
        bpDiastolic: 74,
        heartRate: 62,
        glucose: 88,
        temperature: 36.6,
        sleepHours: 7.5,
        moodScore: 8.5
      }
    },
    "plt-vance": {
      id: "plt-vance",
      name: "Marcus Vance",
      role: "Uzay Aracı Pilotu",
      age: 41,
      bloodType: "O Rh+",
      seed: 207,
      baselines: {
        bpSystolic: 120,
        bpDiastolic: 77,
        heartRate: 59,
        glucose: 91,
        temperature: 36.7,
        sleepHours: 7.2,
        moodScore: 8.2
      }
    },
    "ms-sato": {
      id: "ms-sato",
      name: "Dr. Kenji Sato",
      role: "Biyobilim Uzmanı",
      age: 35,
      bloodType: "B Rh+",
      seed: 319,
      baselines: {
        bpSystolic: 112,
        bpDiastolic: 71,
        heartRate: 65,
        glucose: 85,
        temperature: 36.5,
        sleepHours: 7.8,
        moodScore: 8.8
      }
    }
  };

  function seededNoise(day, seed, freq = 1) {
    const x = Math.sin(day * 0.43 * freq + seed * 1.17) * 10000;
    const y = Math.cos(day * 0.19 * freq + seed * 0.73) * 10000;
    return ((x - Math.floor(x)) + (y - Math.floor(y))) / 2 - 0.5;
  }

  function getMissionPhase(day) {
    if (day <= 14) {
      return {
        phaseCode: "1. Dönem (Gün 1-14)",
        title: "Akut Sıvı Kayması Dönemi",
        commDelayMin: (0.5 + (day / 14) * 1.5).toFixed(1),
        distanceMillionKm: (0.4 + day * 0.85).toFixed(1),
        description: "Yerçekimsiz ortam nedeniyle ~2L sıvı üst vücuda kayar. Odak: Kafa içi basınç ve tansiyon kontrolü."
      };
    } else if (day <= 65) {
      return {
        phaseCode: "2. Dönem (Gün 15-65)",
        title: "Kemik ve Kas Koruma Dönemi",
        commDelayMin: (2.0 + ((day - 14) / 51) * 4.5).toFixed(1),
        distanceMillionKm: (12.3 + (day - 14) * 1.25).toFixed(1),
        description: "Kemiklerden kalsiyum kaybı hızlanır. Odak: Günlük 60 dk ARED egzersizi ve 2.5L su tüketimi."
      };
    } else if (day <= 115) {
      return {
        phaseCode: "3. Dönem (Gün 66-115)",
        title: "Derin Uzay ve Uyku Senkronizasyonu",
        commDelayMin: (6.5 + ((day - 65) / 50) * 5.5).toFixed(1),
        distanceMillionKm: (76.0 + (day - 65) * 1.4).toFixed(1),
        description: "Anlık Dünya iletişimi kesilir. Odak: Işık terapisi ile uyku ve bilişsel dikkatin korunması."
      };
    } else if (day <= 145) {
      return {
        phaseCode: "4. Dönem (Gün 116-145)",
        title: "Güneş Radyasyonu Sığınağı Dönemi",
        commDelayMin: (12.0 + ((day - 115) / 30) * 4.0).toFixed(1),
        distanceMillionKm: (146.0 + (day - 115) * 1.35).toFixed(1),
        description: "Sığınak modülünde yüksek stres ve hareketsizlik. Odak: Vücut sıcaklığı, enflamasyon ve glikoz takibi."
      };
    } else {
      return {
        phaseCode: "5. Dönem (Gün 146-180)",
        title: "Mars İniş Hazırlığı (LBNP Protokolü)",
        commDelayMin: (16.0 + ((day - 145) / 35) * 4.2).toFixed(1),
        distanceMillionKm: (186.5 + (day - 145) * 1.1).toFixed(1),
        description: "Yerçekimine giriş öncesi ortostatik bayılmayı önlemek için yoğun sıvı yüklemesi ve LBNP vakum seansları."
      };
    }
  }

  function generateCrewTimeSeries(crewId) {
    const profile = CREW_PROFILES[crewId] || CREW_PROFILES["cdr-kaya"];
    const b = profile.baselines;
    const s = profile.seed;
    const series = [];

    for (let day = 1; day <= 180; day++) {
      const n1 = seededNoise(day, s, 1.0);
      const n2 = seededNoise(day, s + 31, 1.7);
      const n3 = seededNoise(day, s + 67, 0.8);

      const fluidShiftEffect = day <= 14 ? Math.sin((day / 14) * Math.PI) * 14 : 0;
      const circadianWave = (day >= 75 && day <= 110) ? Math.sin(((day - 75) / 35) * Math.PI) : 0;
      const radiationStressWave = (day >= 120 && day <= 142) ? Math.sin(((day - 120) / 22) * Math.PI) : 0;

      const sys = Math.round(b.bpSystolic + fluidShiftEffect * 1.15 + circadianWave * 9 + radiationStressWave * 19 + n1 * 6);
      const dia = Math.round(b.bpDiastolic + fluidShiftEffect * 0.8 + circadianWave * 6 + radiationStressWave * 13 + n2 * 4);
      const hr = Math.round(b.heartRate + (day <= 10 ? 9 : 0) + circadianWave * 11 + radiationStressWave * 24 + n1 * 5);
      const glucose = Math.round(b.glucose + (day > 20 ? 4 : 0) + circadianWave * 18 + radiationStressWave * 34 + n3 * 7);

      const tempRaw = b.temperature + (day > 7 ? 0.22 : 0.08) + circadianWave * 0.35 + radiationStressWave * 0.95 + n2 * 0.16;
      const temperature = Number(tempRaw.toFixed(1));

      const sleepRaw = b.sleepHours - (day <= 12 ? 0.9 : 0) - circadianWave * 1.65 - radiationStressWave * 2.1 + n1 * 0.45;
      const sleepHours = Number(Math.max(3.6, Math.min(9.2, sleepRaw)).toFixed(1));

      const moodRaw = b.moodScore - (day <= 10 ? 0.8 : 0) - circadianWave * 2.2 - radiationStressWave * 3.1 + n3 * 0.6;
      const moodScore = Number(Math.max(2.0, Math.min(10.0, moodRaw)).toFixed(1));

      const il6 = Number((1.5 + fluidShiftEffect * 0.12 + radiationStressWave * 5.2 + Math.abs(n1)).toFixed(1));
      const urineCalcium = Math.round(165 + Math.min(day * 0.65, 85) + radiationStressWave * 45 + n2 * 15);
      const opticNerveSheathMm = Number((5.1 + (day / 180) * 0.65 + (sys > 132 ? 0.45 : 0)).toFixed(2));

      series.push({
        day,
        bpSystolic: sys,
        bpDiastolic: dia,
        heartRate: hr,
        glucose,
        temperature,
        sleepHours,
        moodScore,
        biomarkers: {
          il6_pg_ml: il6,
          urine_calcium_mg_day: urineCalcium,
          optic_nerve_sheath_mm: opticNerveSheathMm,
          cabin_co2_mmhg: Number((2.4 + radiationStressWave * 1.9 + Math.abs(n2) * 0.5).toFixed(1))
        }
      });
    }
    return series;
  }

  const ANOMALY_SCENARIOS = {
    "nominal": {
      id: "nominal",
      title: "Normal Görev Durumu",
      badge: "NORMAL SEYİR",
      severity: "normal",
      description: "Değerler seçilen görev gününün doğal akışındadır.",
      overrides: null
    },
    "sans_fluid_shift": {
      id: "sans_fluid_shift",
      title: "Senaryo 1: Başa Sıvı Toplanması ve Göz/Tansiyon Basıncı",
      badge: "YÜKSEK TANSİYON & GÖZ RİSKİ",
      severity: "critical",
      description: "Üst vücuda sıvı birikimi sonucu yüksek tansiyon ve göz arkası basınç artışı.",
      overrides: {
        bpSystolic: 148,
        bpDiastolic: 94,
        heartRate: 88,
        glucose: 99,
        temperature: 37.1,
        sleepHours: 5.2,
        moodScore: 5.4,
        biomarkers: {
          il6_pg_ml: 3.8,
          urine_calcium_mg_day: 225,
          optic_nerve_sheath_mm: 6.45,
          cabin_co2_mmhg: 4.2
        }
      }
    },
    "space_fever_cytokine": {
      id: "space_fever_cytokine",
      title: "Senaryo 2: Uzay Ateşi ve Bağışıklık Zorlanması (OSD-575)",
      badge: "YÜKSEK ATEŞ & NABIZ",
      severity: "critical",
      description: "Termal stres ve enflamasyon (IL-6 artışı) kaynaklı yüksek ateş ve taşikardi.",
      overrides: {
        bpSystolic: 136,
        bpDiastolic: 86,
        heartRate: 108,
        glucose: 122,
        temperature: 38.3,
        sleepHours: 4.8,
        moodScore: 4.2,
        biomarkers: {
          il6_pg_ml: 7.9,
          urine_calcium_mg_day: 240,
          optic_nerve_sheath_mm: 5.8,
          cabin_co2_mmhg: 3.1
        }
      }
    },
    "circadian_collapse": {
      id: "circadian_collapse",
      title: "Senaryo 3: Şiddetli Uykusuzluk ve Moral Çöküşü",
      badge: "UYKU & MORAL UYARISI",
      severity: "warning",
      description: "Sirkadiyen kayma ve izolasyon stresi nedeniyle uyku ve odaklanma düşüşü.",
      overrides: {
        bpSystolic: 131,
        bpDiastolic: 84,
        heartRate: 84,
        glucose: 118,
        temperature: 37.2,
        sleepHours: 3.9,
        moodScore: 3.1,
        biomarkers: {
          il6_pg_ml: 4.4,
          urine_calcium_mg_day: 210,
          optic_nerve_sheath_mm: 5.6,
          cabin_co2_mmhg: 3.6
        }
      }
    },
    "metabolic_renal_stress": {
      id: "metabolic_renal_stress",
      title: "Senaryo 4: Kan Şekeri Yükselmesi ve Böbrek Taşı Riski",
      badge: "KAN ŞEKERİ & BÖBREK RİSKİ",
      severity: "critical",
      description: "Uzay insülin direnci (hiperglisemi) ve idrar kalsiyum artışına bağlı böbrek taşı riski.",
      overrides: {
        bpSystolic: 134,
        bpDiastolic: 87,
        heartRate: 92,
        glucose: 152,
        temperature: 37.4,
        sleepHours: 5.8,
        moodScore: 5.0,
        biomarkers: {
          il6_pg_ml: 5.6,
          urine_calcium_mg_day: 310,
          optic_nerve_sheath_mm: 5.7,
          cabin_co2_mmhg: 2.8
        }
      }
    }
  };

  // Vücut Haritası: Gereksiz "ne işe yarar" metinleri kaldırıldı, doğrudan Risk ve NE YAPILMALI odaklı!
  const BODY_SYSTEMS = {
    "head_sans": {
      id: "head_sans",
      name: "Göz ve Kafa Bölgesi (SANS)",
      shortName: "Göz ve Kafa",
      subtitle: "Kafa İçi Sıvı Basıncı ve Görme Protokolü",
      iconKey: "head_sans",
      spaceRisks: [
        "Yerçekimsiz ortamda ~2L sıvının başa toplanması göz arkası basıncı artırır ve bulanık görmeye (SANS) yol açar.",
        "Yetersiz hava akışı nedeniyle yüz çevresinde biriken CO₂ zonklayıcı baş ağrısını tetikler."
      ],
      nasaSource: "NASA HRP SANS & LBNP Protokolü",
      countermeasures: [
        "Belden aşağı vakum kıyafetini (LBNP) -25 mmHg basınçta 45 dakika çalıştırarak sıvıyı bacaklara çekin.",
        "Kabin havalandırma fanını doğrudan yüz bölgesine yönlendirin (CO₂ < 3.0 mmHg olmalı).",
        "Göz dibi (Fundoskop) ve Optik Sinir Kılıfı ultrason ölçümü alıp kaydedin."
      ]
    },
    "brain_cns": {
      id: "brain_cns",
      name: "Beyin, Uyku ve Bilişsel Odak",
      shortName: "Beyin ve Uyku",
      subtitle: "Sirkadiyen Ritim ve Performans Protokolü",
      iconKey: "brain_cns",
      spaceRisks: [
        "24 saatlik gün ışığı döngüsü kaybı uykuyu böler; kritik görevlerde tepki süresini yavaşlatır.",
        "Derin uzay iletişim gecikmesi ve kapalı ortam stresi odaklanma gücünü düşürür."
      ],
      nasaSource: "NASA HRP Davranışsal Tıp ve Sirkadiyen Protokolü",
      countermeasures: [
        "Uyanınca 30 dk 480nm mavi kabin ışığı açın; уykudan 2 saat önce tüm ekranları ve ışıkları kehribar/loş moda alın.",
        "Uyku < 5 saat ise kritik kenetlenme/EVA görevlerini erteleyin ve 25 dk güç uykusu (Power Nap) uygulayın.",
        "Moral düşüşünde 20 dk VR Dünya simülasyonu ve nefes biofeedback seansı başlatın."
      ]
    },
    "cardiovascular": {
      id: "cardiovascular",
      name: "Kalp ve Damar Sistemi",
      shortName: "Kalp ve Damar",
      subtitle: "Tansiyon, Nabız ve Plazma Hacmi Protokolü",
      iconKey: "cardiovascular",
      spaceRisks: [
        "Kan plazma hacminin %10-15 azalması dinlenik nabzı hızlandırır ve inişte bayılma (ortostatik) riski yaratır.",
        "Üst vücut sıvı yükü ve vasküler stres (OSD-575 sitokin artışı) tansiyonu baz çizgisinden saptırır."
      ],
      nasaSource: "NASA HRP Kardiyovasküler & OSD-575 Veri Seti",
      countermeasures: [
        "Nabız yüksekse hemen 500 mL izotonik elektrolitli su için ve ağır egzersizi durdurun.",
        "Tansiyon yüksekse 10 dakika yavaş diyafram solunumu (6 nefes/dk) ve akşam LBNP seansı uygulayın.",
        "Giyilebilir göğüs bandı ile 30 saniyelik EKG ritim kaydı alın."
      ]
    },
    "metabolic_endocrine": {
      id: "metabolic_endocrine",
      name: "Metabolizma ve Kan Şekeri",
      shortName: "Kan Şekeri",
      subtitle: "Uzay İnsülin Direnci Protokolü (OSD-575)",
      iconKey: "metabolic_endocrine",
      spaceRisks: [
        "Yerçekimsiz ortamda bacak kaslarının kullanılmaması glikoz tüketimini düşürür (OSD-575 uçuş hiperglisemisi).",
        "Uykusuzluk ve stres kaynaklı kortizol artışı açlık kan şekerini yükseltir."
      ],
      nasaSource: "NASA OSDR OSD-575: Inspiration4 Metabolik Panel",
      countermeasures: [
        "Yemekten 30 dakika sonra 20 dakika CEVIS bisiklet egzersizi yaparak kasların şekeri yakmasını sağlayın.",
        "Rasyondaki basit karbonhidrat/şeker paketlerini kesin; yüksek lif ve protein paketlerine geçin.",
        "Sabah açlık sensör (CGM) okumasını tekrarlayıp doğrulayın."
      ]
    },
    "renal_immune": {
      id: "renal_immune",
      name: "Böbrekler ve Bağışıklık",
      shortName: "Böbrek ve Bağışıklık",
      subtitle: "Böbrek Taşı ve Enflamasyon Protokolü (OSD-656)",
      iconKey: "renal_immune",
      spaceRisks: [
        "Kemiklerden eriyen kalsiyumun idrara geçmesi (hiperkalsiüri) derin uzayda akut Böbrek Taşı riski oluşturur.",
        "Terin buharlaşamaması ('Uzay Ateşi') ve bağışıklık zorlanması (OSD-656 IL-18/KIM-1 artışı) ateşi yükseltir."
      ],
      nasaSource: "NASA OSDR OSD-656: Inspiration4 İdrar Enflamasyon Paneli",
      countermeasures: [
        "Böbrek taşını önlemek için günlük su alımını 2.5 Litreye (10 paket) çıkarın ve Potasyum Sitrat tableti alın.",
        "Ateş ≥ 37.8°C ise Sıvı Soğutmalı Giysiyi (LCVG) giyin ve kabin fanını maksimuma getirin.",
        "OSD-656 idrar test stribi ile kalsiyum ve enflamasyon kontrolü yapın."
      ]
    },
    "musculoskeletal": {
      id: "musculoskeletal",
      name: "Kemik ve Kas Sistemi",
      shortName: "Kemik ve Kas",
      subtitle: "Kemik Erimesi ve ARED Egzersiz Protokolü",
      iconKey: "musculoskeletal",
      spaceRisks: [
        "Yerçekimi yükü kalktığı için koruma yapılmazsa ayda %1 - %1.5 kemik yoğunluğu ve kas hacmi kaybedilir.",
        "Omurga boyunun 3-5 cm uzaması bel ağrısı ve disk baskısı yaratır."
      ],
      nasaSource: "NASA HRP Kemik/Kas Koruma ve ARED Protokolü",
      countermeasures: [
        "Her gün 60 dakika ARED vakumlu direnç cihazında Squat, Deadlift ve topuk yükseltme (Heel Raise) yapın.",
        "Bel ağrısında dizleri göğse çekerek (fetal pozisyon) 10 dk omurga germe uygulayın.",
        "Günlük D3 vitamini (2000 IU) takviyesini alın."
      ]
    }
  };

  // Rehber Kartları: Adım Adım "Nasıl Ölçülür?" Rehberi + Veri Giriş Cihaz Bilgisi + Vurgulu NE YAPILMALI?
  const GUIDE_CARDS = [
    {
      id: "bp",
      metricKey: "bp",
      iconKey: "bp",
      title: "Kan Basıncı (Tansiyon)",
      device: "Üst Kol Dijital Tansiyon Manşonu",
      normalBaselineNote: "Hedef: Kişisel Baz ±12 mmHg",
      spaceEffect: "Baş bölgesine sıvı toplanması ve kabin CO₂ artışı tansiyonu yükseltir.",
      howToMeasure: [
        "Ölçümden önce 5 dakika dinlenin ve ayaklarınızı kabin sabitleyicisine geçirin.",
        "Manşonu sol üst kolunuza, tam kalp hizasında olacak şekilde sarın.",
        "Ölçüm sırasında konuşmayın ve kolunuzu gövdenizle aynı hizada serbest bırakın."
      ],
      actionSteps: [
        "LBNP vakum kıyafetini -25 mmHg'da 45 dakika çalıştırın.",
        "Kabin fanını yüzünüze çevirip 10 dk yavaş diyafram nefesi (6 nefes/dk) yapın.",
        "Göz arkası basınç (SANS) kontrolü için optik sinir ultrasonu alın."
      ]
    },
    {
      id: "hr",
      metricKey: "heartRate",
      iconKey: "heartRate",
      title: "Nabız (Kalp Atış Hızı)",
      device: "Optik Bileklik / Göğüs EKG Bandı",
      normalBaselineNote: "Hedef: Kişisel Baz ±12 Atım/dk",
      spaceEffect: "Plazma sıvı kaybı ve termal stres kalbi normalden hızlı attırır.",
      howToMeasure: [
        "Sabah uyku tulumundan çıkmadan önce (dinlenik halde) ölçüm yapın.",
        "Optik bileklik sensörünün veya göğüs bandının cilde tam temas ettiğini doğrulayın.",
        "60 saniye boyunca hareketsiz kalarak ortalama dakikadaki atım değerini okuyun."
      ],
      actionSteps: [
        "Hemen 2 paket (500 mL) elektrolitli su için.",
        "O günkü ağır ARED egzersizini durdurun veya hafifletin.",
        "Nabız > 98 ise 30 saniyelik giyilebilir EKG kaydı başlatın."
      ]
    },
    {
      id: "glucose",
      metricKey: "glucose",
      iconKey: "glucose",
      title: "Açlık Kan Şekeri (Glikoz)",
      device: "Kol Glikoz Sensörü (CGM) / Parmak Stribi",
      normalBaselineNote: "Açlık Hedefi: 75 - 99 mg/dL",
      spaceEffect: "Kasların yerçekimsiz ortamda az çalışması insülin direnci yaratır (OSD-575).",
      howToMeasure: [
        "Sabah kahvaltı paketini açmadan önce (en az 8 saat açlıkla) ölçüm yapın.",
        "Okuyucu cihazı üst kolunuzdaki CGM sensörüne yaklaştırın (veya parmak ucu stribi kullanın).",
        "Ekranda çıkan mg/dL değerini aşağıdaki kutuya girin."
      ],
      actionSteps: [
        "Yemekten 30 dk sonra 20 dakika uzay bisikleti (CEVIS) sürerek şekeri kaslarda yakın.",
        "Şekerli/unlu paketleri kesip lifli ve proteinli rasyon seçin.",
        "Su tüketimini artırıp idrar keton/kalsiyum stribini kontrol edin."
      ]
    },
    {
      id: "temp",
      metricKey: "temperature",
      iconKey: "temperature",
      title: "Vücut Sıcaklığı",
      device: "Kızılötesi Şakak / Kulak Termometresi",
      normalBaselineNote: "Hedef: 36.3°C - 37.2°C",
      spaceEffect: "Ter buharlaşamadığı için vücut ısısı kolayca yükselir ('Uzay Ateşi').",
      howToMeasure: [
        "ARED veya koşu bandı egzersizinden sonra en az 30 dakika bekleyin.",
        "Alın ve şakak bölgesindeki teri kuru bezle silin.",
        "Kızılötesi termometreyi şakak damarına 2 cm mesafede tutarak ölçümü okuyun."
      ],
      actionSteps: [
        "Sıvı soğutmalı içliği (LCVG) giyin ve kabin fanını hızlandırın.",
        "500 mL soğuk su için ve tüm fiziksel eforu durdurun.",
        "Sıcaklık ≥ 37.8°C ise OSD-656 idrar enflamasyon testini uygulayın."
      ]
    },
    {
      id: "sleep",
      metricKey: "sleepHours",
      iconKey: "sleepHours",
      title: "Günlük Uyku Süresi",
      device: "Aktigrafi Uyku Bilekliği & Uyku Günlüğü",
      normalBaselineNote: "Hedef: 7.0 - 8.5 Saat / Gün",
      spaceEffect: "Gün ışığı döngüsü kaybı ve kafa içi sıvı dolgunluğu uykuyu böler.",
      howToMeasure: [
        "Gece uyku kabinini karartıp bilekliği 'Uyku Kayıt' moduna alın.",
        "Sabah uyandığınızda bileklik ekranındaki toplam net uyku süresini (saat) kontrol edin.",
        "Gece uyanmaları düşülmüş net süreyi (ör. 7.4 saat) veri alanına girin."
      ],
      actionSteps: [
        "Sabah 30 dk parlak mavi ışık (480nm) açın; yatmadan 2 saat önce ekranları kapatıp sarı ışığa geçin.",
        "Uyku < 5 saat ise kritik operasyonları erteleyin ve 25 dk güç uykusu yapın.",
        "Uyku kabini havalandırmasını açıp sıcaklığı 19°C'ye düşürün."
      ]
    },
    {
      id: "mood",
      metricKey: "moodScore",
      iconKey: "moodScore",
      title: "Ruh Hali ve Odak (Mood)",
      device: "1-10 Bilişsel Odak ve Moral Ölçeği",
      normalBaselineNote: "Hedef: 7.0 - 10.0 Puan",
      spaceEffect: "İletişim gecikmesi, kapalı ortam ve yorgunluk bilişsel odağı düşürür.",
      howToMeasure: [
        "Sabah ölçümlerinin sonunda 1 dakika sessizce zihinsel odak durumunuzu değerlendirin.",
        "1 (Çok Yorgun / Stresli / Odak Dağınık) ile 10 (Tam Odaklı / Dinç) arasında puan verin.",
        "Puanınızı dürüstçe girerek bilişsel iş yükü önerisini alın."
      ],
      actionSteps: [
        "20 dakikalık VR Dünya doğa simülasyonu seansını başlatın.",
        "Günlük operasyonel iş yükünü %30 azaltın.",
        "Aile video mesajlarını izleyin ve mürettebatla ortak mola verin."
      ]
    }
  ];

  const OSDR_REFERENCE_DATA = {
    OSD_575: {
      code: "OSD-575",
      title: "Inspiration4 Görevi: Astronot Kan Tahlili Verileri (NASA OSDR)",
      url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575",
      method: "Uçuş Öncesi, Uçuş Sırası ve İniş Sonrası Gerçek Kan Ölçümleri",
      timepoints: ["Uçuş Öncesi 1", "Uçuş Öncesi 2", "Uçuş Öncesi 3", "Uzayda (4. Gün)", "İniş Günü", "İniş +45 Gün", "İniş +84 Gün"],
      markers: [
        {
          id: "glucose_cmp",
          name: "Kan Şekeri (Glikoz)",
          unit: "mg/dL",
          normalMax: 99,
          values: [86, 88, 89, 108, 115, 91, 87],
          color: "#6c95bd",
          insight: "Uzayda hareketsizlik nedeniyle kan şekeri 88'den 115 mg/dL'ye yükselmiş; karşı önlem olarak yemek sonrası egzersiz protokolü belirlenmiştir."
        },
        {
          id: "il6_serum",
          name: "Enflamasyon Değeri (IL-6)",
          unit: "pg/mL",
          normalMax: 4.5,
          values: [1.4, 1.5, 1.7, 5.9, 7.3, 2.1, 1.5],
          color: "#c96969",
          insight: "Bağışıklık zorlanmasını gösteren IL-6 uçuşta 3-4 kat artmıştır; ateş ve taşikardi uyarı eşiği bu veriye dayandırılmıştır."
        },
        {
          id: "calcium_serum",
          name: "Kandaki Kalsiyum (Kemik Kaybı)",
          unit: "mg/dL",
          normalMax: 10.0,
          values: [9.1, 9.2, 9.2, 9.9, 10.3, 9.4, 9.2],
          color: "#c28e38",
          insight: "Kemiklerden kana geçen kalsiyum artışını gösterir; günlük 60 dk ARED egzersizi ve 2.5L su protokolünün temel dayanağıdır."
        }
      ]
    },
    OSD_656: {
      code: "OSD-656",
      title: "Inspiration4 Görevi: Astronot İdrar Tahlili Verileri (NASA OSDR)",
      url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-656",
      method: "Böbrek Yükü ve Bağışıklık Göstergeleri (NULISAseq Analizi)",
      timepoints: ["Uçuş Öncesi 1", "Uçuş Öncesi 2", "Uçuş Öncesi 3", "Uzayda (4. Gün)", "İniş Günü", "İniş +45 Gün", "İniş +84 Gün"],
      markers: [
        {
          id: "kim1_urine",
          name: "Böbrek Stres Göstergesi (KIM-1)",
          unit: "Birim (NPQ)",
          normalMax: 4.2,
          values: [2.7, 2.8, 2.9, 4.9, 5.4, 3.1, 2.8],
          color: "#8c82ba",
          insight: "Kalsiyum atılımı ve susuzluğun böbreklerde yarattığı yükü gösterir; Potasyum Sitrat ve su takibi bu riski önler."
        },
        {
          id: "il18_urine",
          name: "İdrar Enflamasyon Değeri (IL-18)",
          unit: "Birim (NPQ)",
          normalMax: 5.0,
          values: [3.8, 3.9, 4.0, 5.9, 6.4, 4.2, 3.9],
          color: "#589e7d",
          insight: "Kan almaya gerek kalmadan idrar stribi ile böbrek ve sistemik enflamasyon takibi yapılmasını sağlar."
        },
        {
          id: "cxcl10_urine",
          name: "Bağışıklık Yanıtı (CXCL10)",
          unit: "Birim (NPQ)",
          normalMax: 6.2,
          values: [4.5, 4.4, 4.7, 7.2, 7.8, 5.0, 4.6],
          color: "#c47d4e",
          insight: "Uzay radyasyonu ve stres altında bağışıklık aktivasyonunu gösterir."
        }
      ]
    }
  };

  const DAILY_MISSIONS = [
    {
      id: "task-vitals",
      title: "Sabah Sağlık Ölçümlerini Kaydet",
      subtitle: "Tansiyon, nabız, glikoz ve sıcaklık kontrolü",
      xp: 50,
      iconKey: "bp",
      defaultDone: true
    },
    {
      id: "task-ared",
      title: "60 dk ARED Direnç Egzersizi",
      subtitle: "Kemik ve kas kaybını önleyen ağırlık protokolü",
      xp: 100,
      iconKey: "musculoskeletal",
      defaultDone: true
    },
    {
      id: "task-hydration",
      title: "2.5 Litre Su + Potasyum Sitrat",
      subtitle: "Böbrek taşı riskini önlemek için 10 paket sıvı hedefi",
      xp: 60,
      iconKey: "renal_immune",
      defaultDone: false
    },
    {
      id: "task-circadian",
      title: "30 dk Sabah Mavi Işık Terapisi",
      subtitle: "Biyolojik saat ve uyku kalitesi senkronizasyonu",
      xp: 45,
      iconKey: "sleepHours",
      defaultDone: false
    },
    {
      id: "task-lbnp",
      title: "45 dk LBNP Vakum Kıyafeti Seansı",
      subtitle: "Kafa içi sıvı ve göz basıncını (SANS) düşürme protokolü",
      xp: 80,
      iconKey: "head_sans",
      defaultDone: false
    },
    {
      id: "task-mood",
      title: "Günlük Odak ve Moral Kaydı",
      subtitle: "1 dakikalık bilişsel hazırlık kontrolü",
      xp: 40,
      iconKey: "moodScore",
      defaultDone: true
    }
  ];

  const BADGES = [
    {
      id: "badge-bone",
      name: "Kemik Kalkanı",
      desc: "14 gün aralıksız ARED egzersizi",
      unlocked: true
    },
    {
      id: "badge-sans",
      name: "Basınç Koruyucu",
      desc: "LBNP ve tansiyon protokolü tam uyumlu",
      unlocked: true
    },
    {
      id: "badge-circadian",
      name: "Uyku Disiplini",
      desc: "7+ saat uyku ortalaması korundu",
      unlocked: true
    },
    {
      id: "badge-osdr",
      name: "Veri Analisti",
      desc: "OSD-575 ve OSD-656 panelleri incelendi",
      unlocked: false
    },
    {
      id: "badge-autonomy",
      name: "Otonom Müdahale",
      desc: "Anomali karşı önlemle stabilize edildi",
      unlocked: false
    }
  ];

  return {
    CREW_PROFILES,
    ANOMALY_SCENARIOS,
    BODY_SYSTEMS,
    GUIDE_CARDS,
    OSDR_REFERENCE_DATA,
    DAILY_MISSIONS,
    BADGES,
    getMissionPhase,
    generateCrewTimeSeries
  };
})();

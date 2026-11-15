# ASTRA-MED: Sunum Rehberi ve Uygulamanın Çalışma Mantığı

## 1. Jüriye Kısaca Ne Anlatacaksınız? (Özet Konuşma)

> **"Derin uzay görevlerinde (örneğin Mars yolculuğunda) Dünya ile iletişimde 20 dakikaya varan gecikmeler yaşanır. Yani bir astronotun tansiyonu çıktığında veya ateşi yükseldiğinde Dünya'daki doktorlarla canlı konuşup hemen cevap alması imkansızdır.**  
>  
> **Biz de astronotların kendi sağlık durumlarını tek bakışta anlayabilmesi ve ne yapmaları gerektiğini hemen görebilmesi için ASTRA-MED uygulamasını geliştirdik. Uygulamamızda hem NASA'nın gerçek Inspiration4 uçuş tahlil verilerini (OSD-575 ve OSD-656) hem de 180 günlük görev simülasyonunu kullandık."**

---

## 2. Uygulamadaki 5 Üst Sekme Nasıl Çalışır?

Kalabalık bir ekran yerine uygulamayı yukarıdan seçilebilen **5 sade sekmeye** ayırdık:

### 1. Sekme: Genel Durum ve Uyarılar
- **6 Temel Ölçüm Kutusu:** Kan basıncı (tansiyon), nabız, kan şekeri, vücut sıcaklığı, günlük uyku süresi ve ruh hali (moral) değerlerini gösterir.
- **Kişisel Baz Çizgisi Karşılaştırması:** Her astronotun uçuş öncesi kendi normal değeri farklıdır. Kutular astronotun kendi normaline göre **Normal (Yeşil)**, **Dikkat (Sarı)** veya **Kritik (Kırmızı)** renk alır.
- **Otonom Karar Motoru:** Bir değer bozulduğunda en üstte uyarı çıkar; *"Neden oldu?"* ve *"Ne yapılmalı?"* sorularını sade bir dille yanıtlar. **"Önlemi Uygula"** butonuna basıldığında astronot öneriyi uygular ve değerler tekrar yeşile döner.

### 2. Sekme: İnsan Vücudu Haritası
- Ekranda tıklanabilir bir **İnsan Vücudu Haritası** bulunur (*Beyin, Göz/Kafa, Kalp, Metabolizma, Böbrek, Kemik/Kas*).
- Örneğin tansiyon yükseldiğinde haritadaki **Göz/Kafa** ve **Kalp** bölgesi otomatik olarak **Kırmızı** yanar.
- Üzerine tıkladığınızda sağ tarafta o organın ne işe yaradığı, uzayda neden risk altında olduğu ve nasıl korunacağı sade maddelerle yazar.

### 3. Sekme: Zaman Grafikleri ve NASA Verileri
Bu sekmede iki grafik alt alta yer alır:
1. **180 Günlük Görev Değişim Grafiği (Sentetik Simülasyon):** Astronotların saatlik tansiyon/nabız verileri gizli olduğu için, NASA makalelerindeki sınırlara uygun üretilmiş 180 günlük zaman serisini gösterir. Grafik üzerinde istediğiniz güne tıklayabilirsiniz.
2. **Gerçek NASA OSDR Verileri (`OSD-575` ve `OSD-656`):** SpaceX Inspiration4 görevindeki astronotlardan alınan gerçek kan (`OSD-575`: kan şekeri, kalsiyum, enflamasyon) ve idrar (`OSD-656`: böbrek yükü ve bağışıklık) tahlillerinin uçuş öncesi, uçuş sırası ve iniş sonrası değişimini gösterir.

### 4. Sekme: Ölçüm Rehberi (Nasıl ve Neden?)
- Astronotun tıp doktoru olmadığını varsayarak her ölçüm için 4 soruyu en sade dille yanıtlar:
  1. *Bu ölçüm neden yapılır?*
  2. *Uzay ortamı bunu nasıl etkiler?*
  3. *Nasıl doğru ölçülür?*
  4. *Değer bozulursa ne yapılmalıdır?*

### 5. Sekme: Günlük Görevler ve Seri (Oyunlaştırma)
- Uzun uzay yolculuğunda astronotun motivasyonunu korumak için **Kesintisiz Sağlık Serisi (Streak)**, **Puan (XP)**, **Günlük 2.5 Litre Su Takibi (Böbrek taşı önleme)** ve **Kazanılan Başarım Madalyaları** yer alır.

---

## 3. Sunumda Jüriye Göstereceğiniz 1 Dakikalık Canlı Demo

1. Üstteki **"Görev Günü 1 - 180"** çubuğunu sağa sola kaydırın veya **"Görevi Oynat"** butonuna basın.
2. Sağ üstteki **"Anomali Simüle Et"** butonuna basın:
   - 1. Sekmede uyarı çıktığını ve kutuların **Kırmızı** olduğunu gösterin.
   - 2. Sekmeye (**İnsan Vücudu Haritası**) tıklayıp vücut üzerinde kızaran organa tıklayın.
   - Tekrar 1. Sekmeye dönüp **"Önlemi Uygula ve Değerleri Normale Döndür"** butonuna basın.
3. 3. Sekmeye (**Zaman Grafikleri ve NASA Verileri**) geçip hem 180 günlük grafiği hem de gerçek NASA `OSD-575` / `OSD-656` grafiklerini gösterin.

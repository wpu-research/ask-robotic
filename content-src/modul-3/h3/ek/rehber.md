### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Analog ve dijital sinyali ayırt eder; `analogRead` değerini (0-1023) gerilime (ham × 5,0 / 1024) çevirir.
2. Gerilim bölücü formülüyle (Vout = Vin × R2 / (R1 + R2)) bir sensörün direncini gerilim ve ham değerden hesaplar.
3. LDR ile ışığı, NTC ile sıcaklığı (beta formülü, Kelvin, `log`) ölçer ve geçersiz okumayı yakalar.
4. `map`, `constrain`, kalibrasyon ve yumuşatmayla gürültülü sensör verisini kullanılır hâle getirir.
5. Üç sensörü birleştirip akıllı bir gece lambası yapar.

### Haftanın planı
Hafta beş derstir. Plan günde bir ders içindir; 5. gün proje dersi daha uzundur.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | analogRead, ADC ve potansiyometre | ~20 dk | Pot'u A0'a bağla, ham değeri ve gerilimi seri monitörde izle, LED parlaklığını ayarla. |
| 2 | Gerilim bölücü ve LDR | ~25 dk | Bölücü hesaplarını yap, LDR'yi kur, ışık kaydırıcısıyla ham değeri oku, histerezisi dene. |
| 3 | Termistör (NTC) ve sıcaklık hesabı | ~25 dk | NTC'yi kur, sıcaklık kaydırıcısıyla beta formülünün sonuçlarını tabloyla karşılaştır. |
| 4 | map, constrain, kalibrasyon ve yumuşatma | ~25 dk | Sınırsız ve sınırlı `map` farkını gör, kalibrasyon ve ortalamayı çalıştır. |
| 5 | Proje: Akıllı gece lambası | ~35 dk | Önce aşama 1, sonra tam sürüm; ölçütle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- Ohm yasası (V = I × R) ve mA/A, kΩ/Ω dönüşümü rahat mı? (Hafta 1, ders 2)
- `if / else if` ve karşılaştırma işleçlerini yazabiliyor mu? (Hafta 2)
- `Serial.begin`, `Serial.print` ve `Serial.println` ile değer yazdırabiliyor mu? (Hafta 2, ders 9)
- `for` döngüsü ve dizi indeksleri (0 tabanlı) tanıdık mı? (Hafta 1, ders 4)
- Laboratuvarda parça özelliklerini (Konum, Işık, Sıcaklık kaydırıcıları) değiştirebiliyor mu?

### Kavram haritası
- **Ölçme:** analog sinyal → ADC (10 bit, 1024 değer) → `analogRead` → ham değer → gerilim
- **Sensör devresi:** gerilim bölücü → LDR (ışık arttıkça direnç azalır) ve NTC (sıcaklık arttıkça direnç azalır) → direnç hesabı → beta formülü
- **Veriyi işleme:** `map` → `constrain` → kalibrasyon → ortalama ve üstel yumuşatma
- **Karar:** eşik → histerezis → öncelik sırası (güvenlik normal davranışı ezer)
- **Proje:** üç girdi (LDR, pot, NTC) → tek çıktı (PWM lamba) + uyarı LED'i

### Sık yapılan hatalar
- **`ham * 5 / 1024` yazmak.** Tam sayı bölmesi sonucu 0, 1, 2 gibi yuvarlar. `5.0` yaz.
- **`analogRead` sayısını doğrudan `analogWrite`'a vermek.** 0-1023 ile 0-255 aralıkları farklıdır; `ham / 4` ya da `map` kullan.
- **`10000 * ham` gibi tam sayı çarpımı.** `int` 16 bittir ve taşar. `10000.0` yaz.
- **Bölücüde yer değiştirmek.** LDR ile sabit direncin yeri değişirse ışık yönü tersine döner.
- **Tek eşik kullanmak.** Eşik civarında çıkış titreşir; iki eşik (histerezis) kullan.
- **`log` yerine `log10` yazmak.** Beta formülü doğal logaritma ister.
- **Kelvin'i Celsius'a çevirmemek.** 273,15 çıkarmayı unutma.
- **`map` sonucunu kırpmamak.** `map` sınırlamaz; `constrain` ekle. `map` ondalık da vermez.
- **Kalibrasyonda `enAz = 0`, `enCok = 1023` ile başlamak.** Tersi doğrudur.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Yanlış yaptığın mini test sorularının açıklamalarını oku, sonra soruyu yeniden çöz.
3. Elle hesapla: ham = 300 için gerilim, ham = 300 için LDR direnci (LDR üstte), ham = 400 için NTC direnci.
4. `map(250, 100, 500, 0, 255)` değerini elle hesapla, sonra laboratuvarda sketch ile doğrula.
5. Kendi cümlelerinle cevapla: "Gerilim bölücü neden gerekli?" ve "Histerezis neden kullanılır?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir: her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Akıllı gece lambası)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Sensörlerden biri bölücü olmadan bağlı ya da LED dirençsiz | LDR, pot, NTC ve iki LED doğru bağlı | Bağlantılar düzenli, direnç değerleri gerekçeli |
| Parlaklık mantığı | Lamba karanlıkta sönük, aydınlıkta yanık | Karanlıkta parlak, aydınlıkta sönük; `constrain` var | Eşik değerleri kalibrasyonla ölçülmüş |
| Potansiyometre ve yumuşatma | Pot etkisiz, lamba titriyor | Pot üst sınırı belirliyor, ortalama alınıyor | Yumuşatma yönteminin etkisini açıklıyor |
| Sıcaklık koruması | Sıcaklık hesabı yanlış ya da koruma yok | 40 °C'de lamba kapanıyor, uyarı yanıyor | Sensör hatasını da ayrı ele alıyor |
| Anlatım | Ne yaptığını anlatamıyor | Girdi-çıktı tablosunu ve kodu anlatıyor | Hata yapıp nasıl bulduğunu ve bir geliştirmeyi anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta ölçmeyi öğretir: sensörler dünyayı gerilim olarak bildirir ve yazılım bu sayıları anlamlı hâle getirir. Formül ezberi değil, "neden böyle?" sorusu önemlidir.
- **Zorluk.** Gerilim bölücü ve beta formülü matematik içerir. Öğrenci takılırsa önce kaydırıcıyı oynatıp seri monitördeki sayıların nasıl değiştiğine bakmasını, sonra hesabı yapmasını önerin.
- **Nasıl destek olunur?** Cevabı söylemek yerine sor: "Işık artınca ham değer hangi yöne gidiyor?", "Bu sayı 0-1023 mü, 0-255 mi?", "Hesap tam sayıyla mı ondalıkla mı yapılıyor?"
- **Gerçek donanım.** LDR ve NTC değerleri parçadan parçaya değişir; laboratuvardaki NTC B = 3950 ile modellenmiştir, gerçek parçanın veri sayfasına bakılmalıdır.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kart kullanılırsa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; gece lambası projesi yalnız 5 V'luk LED ile yapılır.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).

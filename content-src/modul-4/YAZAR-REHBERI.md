# Modül 4 — Sensörler ve Projeler — Yazar rehberi

Bu rehber, Modül 4 — Sensörler ve Projeler ders yazarları içindir. Önce şunları oku: `tools/sim/README.md` (ders biçimi, Sim API, cihaz modelleri, robot benzetimi), `content-src/modul-3/h1/03-blink.md` (biçim referansı), `content-src/modul-3/h6/27-millis-bloklamayan.md` ve `content-src/modul-3/h6/checks.mjs` (iyi bir ders + anlamlı kontroller örneği), `content-src/modul-3/h7/35-termostat.md` (proje dersi örneği).

## Kurallar
- Yalnız KENDİ hafta dizinine yaz: `content-src/modul-4/<hN>/NN-kısa-ad.md` (NN = küresel ders numarası, iki hane) ve aynı dizinde `checks.mjs`. Başka dizine, paylaşılan dosyalara, `packages/`, `apps/`, `tools/` altına dokunma. git çalıştırma. `pnpm build` ve içerik üretici (`tools/content/build.mjs`) çalıştırma.
- Doğrulama: `node tools/sim/check.mjs modul-4 <hN>` — çıkış kodu 0 olana kadar düzelt. Testi gevşetme; sketch'i ya da dersi düzelt.
- Her sketch gerçekten çalıştırılıp ölçülür. Ölçüm dersteki bir iddiayı çürütürse DERSİ düzelt (Modül 3'te "100 karakterlik String ≥100 bayt" iddiası ölçümde 97 çıktı ve ders düzeltildi). Anlamlı assert'ler yaz: sayısal sonuç, zamanlama, pin durumu, seri çıktı. Boş/trivial assert yazma.
- Sensör/cihaz modeli gerektiren kontroller için `tools/sim/README.md`'deki modelleri kullan. Model olmayan (RC522, IRremote, SD, VL53L0X, OLED) sketch'ler yalnız derlenir; dersin metninde "simülatörde bu parça yok" gibi iddialar yazma, normal anlat ama doğrulanmamış davranış iddia etme.

## Hedef kitle ve üslup
12 yaş ve üzeri, yetişkin dahil. Modül 1-3'ü tamamlamış kabul et (aşağıdaki "Önceden bilinenler"). Türkçe, "sen" hitabı, sade, kısa cümleler. Emoji yok. Ders 15-25 dk (proje dersleri 30-35 dk; `süre:` 15-40). Bir ders yalnızca kendisinden ÖNCEKİ derslerde (bu modül ve öncekiler) işlenen kavramları kullanabilir; yeni bir kavramı ilk kez kullanıyorsan kısaca tanıt. Önceki derslere "13. derste gördüğün gibi" biçiminde atıf yap, yeniden anlatma.

## Ders yapısı (referans derslerdeki gibi)
`# Başlık` · `süre: N` · `## Merak` (2-4 cümle, gerçek bir senaryo/soru) · `## Etkinlik` (`### Devre` tablosu [Parça | Bağlantı], `### Program` doğrulanmış sketch'ler, `### Nasıl çalışıyor?`, `### Dene` 2-3 görev, `### Sık yapılan hatalar`) · `## Konuşalım` (1-2 soru).
Test edilecek her tam sketch ` ```cpp ` bloğunun ilk satırı `// sketch: ad` (hafta içinde benzersiz). Kısa açıklama parçalarını işaretsiz bırak. Her hafta sonunda proje dersi; projede haftanın sensörünü ve önceki haftalardan en az bir kavramı birleştir.

## Doğruluk ve güvenlik
- Emin olmadığın teknik bilgiyi yazma; sayısal parça özelliklerinde ("tipik", "veri sayfasına bak") dürüst ol. Uydurma veri, uydurma kaynak yok.
- Şebeke gerilimiyle (220 V) ASLA devre kurdurma. Motorlar/servolar için harici güç ve ortak GND uyarısı ver. Pil güvenliği: yalnız genel uyarı (kısa devre, ters bağlama); lityum pil tavsiyesi verme.
- Hyvex vakaları: yalnız `/home/wpu/Desktop/Hyvex-demo/docs/staj_ders_programi.md` içinde yazılı olanlara dayan (ağ/protokol/PID/fail-safe dersleri). Orada olmayan Hyvex ayrıntısı uydurma.

## Teslim
`node tools/sim/check.mjs modul-4 <hN>` çıkış kodu 0. Son mesajında KISA rapor: yazdığın dosyalar; kaç sketch derlendi / kaçında davranış kontrolü var; yalnız derlenenler ve nedeni; emin olmadığın, riskli, ya da başka haftalarla çakışabilecek noktalar (bağlantı/pin/formül tutarsızlığı).

## Önceden bilinenler (Modül 3, 35 ders)
1 Mikrodenetleyici · 2 Ohm yasası · 3 Blink · 4 Çoklu LED, for, diziler · 5 Trafik ışığı · 6 digitalRead, buton, INPUT_PULLUP · 7 if/else, switch, bool · 8 Debounce, kenar algılama · 9 Serial Monitor (yaz, oku, parseInt) · 10 Kapı zili · 11 analogRead, ADC, potansiyometre · 12 Gerilim bölücü, LDR · 13 NTC termistör, sıcaklık (devre: 10 kΩ 5 V→A2, NTC A2→GND; R = 10000·ADC/(1023−ADC); β = 3950) · 14 map, constrain, kalibrasyon, yumuşatma · 15 Gece lambası · 16 PWM/analogWrite · 17 RGB LED · 18 Buzzer/tone · 19 Fonksiyonlar, kapsam, const int · 20 Müzik kutusu · 21 Servo · 22 Transistör, DC motor · 23 L293D H-köprüsü · 24 Röle · 25 Fan + servo tarayıcı · 26 delay tuzağı · 27 millis() · 28 Durum makineleri, enum · 29 Kesmeler, volatile, timer'lar · 30 Çoklu görev paneli · 31 7-segment, 74HC595 · 32 LCD 16x2 · 33 I2C, Wire, adres tarama · 34 EEPROM, String, SRAM, kütüphane · 35 Termostat.

## Modül 4 standart bağlantılar (tüm haftalarda aynı kullan)
LED D13/D12/D11 · aktif/pasif buzzer D8 · butonlar D2/D3 (INPUT_PULLUP, basılı = LOW) · röle D7 · servo D6 · HC-SR04 TRIG D9, ECHO D10 · DHT veri D5 · I2C: SDA A4, SCL A5 (I2C LCD 0x27, BMP280 0x76, MPU6050 0x68, RTC 0x68; MPU6050 ile RTC aynı devrede olmasın) · analog: A0 potansiyometre/ses/joystick X, A1 LDR/alev/joystick Y, A2 NTC/toprak nemi, A3 MQ-2 gaz. Bu tablo dışında bir pin gerekirse dersin devre tablosunda açıkça yaz ve hafta içinde tutarlı kal. Ekran gerektiğinde I2C LCD (0x27) tercih et (paralel LCD çok pin yer).

## 40 derslik plan (Modül 4: 36-75)
H1 Mesafe, HC-SR04 (Park sensörü): 36 Ultrasonik prensip: ses, süre, mesafe · 37 pulseIn, trig/echo ve santimetre hesabı · 38 Gürültü, yansıma açısı ve medyan filtre · 39 Servo ile tarama (sonar) · 40 Proje: Park sensörü (LED + buzzer + LCD)
H2 Varlık ve engel: PIR, IR engel, reed/limit, VL53L0X (Hırsız alarmı): 41 PIR: hareket algılama ve ısınma süresi · 42 IR engel sensörü ve eşik ayarı · 43 Reed anahtarı ve limit anahtarı · 44 VL53L0X (I2C ToF): hassas mesafe · 45 Proje: Hırsız alarmı (durum makineli)
H3 Ortam: DHT11/22, BMP280, toprak nemi, yağmur, su seviyesi (Hava istasyonu): 46 DHT11/DHT22: sıcaklık ve nem · 47 BMP280: basınç ve rakım (I2C) · 48 Toprak nemi, yağmur ve su seviyesi (analog) · 49 Çok sayfalı ekran arayüzü (LCD/OLED) · 50 Proje: Hava istasyonu ve sulama uyarısı
H4 Işık, ses, gaz: foto sensör, ses sensörü, MQ-2, alev (Yangın ve gaz alarmı): 51 Işık sensörü hassasiyeti ve histerezis · 52 Ses sensörü: alkış anahtarı · 53 MQ-2 gaz sensörü: ısınma ve kalibrasyon · 54 Alev sensörü ve çoklu eşik yönetimi · 55 Proje: Yangın ve gaz alarm paneli
H5 Hareket ve yön: joystick, döner enkoder, MPU6050 (Eğimle kontrol edilen servo): 56 Joystick: iki eksen ve düğme · 57 Döner enkoder (quadrature) ve kesme · 58 MPU6050: ivmeölçer ve eğim açısı (I2C) · 59 Jiroskop sapması ve tamamlayıcı filtre · 60 Proje: El eğimiyle kontrol edilen servo (mini gimbal)
H6 Girdi cihazları: IR kumanda, keypad 4x4, RFID RC522 (Akıllı kapı): 61 IR alıcı ve kumanda kodları · 62 Keypad 4x4: şifre girişi · 63 RFID RC522 (SPI): kart okuma · 64 Yetki yönetimi: kart + şifre + EEPROM · 65 Proje: Akıllı kapı kilidi (servo + LCD + buzzer)
H7 Zaman ve veri: RTC, SD kart, protokoller (Veri kaydedici): 66 RTC: saat, tarih, alarm · 67 SD kart (SPI): dosyaya yazma · 68 Veri kaydı: CSV ve zaman damgası · 69 Haberleşme protokolleri: UART, I2C, SPI karşılaştırması · 70 Proje: Sıcaklık ve nem veri kaydedici
H8 Simülasyondan gerçeğe (Akıllı oda): 71 Simülasyon neden yalan söyler: gürültü, bounce, güç, toprak · 72 Gerçek kart: kurulum, yükleme, multimetre, güvenlik · 73 Kablosuz: Bluetooth (HC-05) ve WiFi — kod ve seri konsol · 74 Hata ayıklama vakası: "ping çalışıyor ama veri yok" (Hyvex kök neden) · 75 Bitirme projesi: Akıllı oda (DHT + PIR + LDR + röle + LCD)

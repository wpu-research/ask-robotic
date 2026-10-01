# Modül 5 — Robotik — Yazar rehberi

Bu rehber, Modül 5 — Robotik ders yazarları içindir. Önce şunları oku: `tools/sim/README.md` (ders biçimi, Sim API, cihaz modelleri, robot benzetimi), `content-src/modul-3/h1/03-blink.md` (biçim referansı), `content-src/modul-3/h6/27-millis-bloklamayan.md` ve `content-src/modul-3/h6/checks.mjs` (iyi bir ders + anlamlı kontroller örneği), `content-src/modul-3/h7/35-termostat.md` (proje dersi örneği).

## Kurallar
- Yalnız KENDİ hafta dizinine yaz: `content-src/modul-5/<hN>/NN-kısa-ad.md` (NN = küresel ders numarası, iki hane) ve aynı dizinde `checks.mjs`. Başka dizine, paylaşılan dosyalara, `packages/`, `apps/`, `tools/` altına dokunma. git çalıştırma. `pnpm build` ve içerik üretici (`tools/content/build.mjs`) çalıştırma.
- Doğrulama: `node tools/sim/check.mjs modul-5 <hN>` — çıkış kodu 0 olana kadar düzelt. Testi gevşetme; sketch'i ya da dersi düzelt.
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
`node tools/sim/check.mjs modul-5 <hN>` çıkış kodu 0. Son mesajında KISA rapor: yazdığın dosyalar; kaç sketch derlendi / kaçında davranış kontrolü var; yalnız derlenenler ve nedeni; emin olmadığın, riskli, ya da başka haftalarla çakışabilecek noktalar (bağlantı/pin/formül tutarsızlığı).

## Önceden bilinenler (Modül 3, 35 ders)
1 Mikrodenetleyici · 2 Ohm yasası · 3 Blink · 4 Çoklu LED, for, diziler · 5 Trafik ışığı · 6 digitalRead, buton, INPUT_PULLUP · 7 if/else, switch, bool · 8 Debounce, kenar algılama · 9 Serial Monitor (yaz, oku, parseInt) · 10 Kapı zili · 11 analogRead, ADC, potansiyometre · 12 Gerilim bölücü, LDR · 13 NTC termistör, sıcaklık (devre: 10 kΩ 5 V→A2, NTC A2→GND; R = 10000·ADC/(1023−ADC); β = 3950) · 14 map, constrain, kalibrasyon, yumuşatma · 15 Gece lambası · 16 PWM/analogWrite · 17 RGB LED · 18 Buzzer/tone · 19 Fonksiyonlar, kapsam, const int · 20 Müzik kutusu · 21 Servo · 22 Transistör, DC motor · 23 L293D H-köprüsü · 24 Röle · 25 Fan + servo tarayıcı · 26 delay tuzağı · 27 millis() · 28 Durum makineleri, enum · 29 Kesmeler, volatile, timer'lar · 30 Çoklu görev paneli · 31 7-segment, 74HC595 · 32 LCD 16x2 · 33 I2C, Wire, adres tarama · 34 EEPROM, String, SRAM, kütüphane · 35 Termostat.

Modül 4'ü de tamamlamış kabul et: HC-SR04 (pulseIn, medyan filtre, servo tarama), PIR/IR/reed, DHT, BMP280, joystick, döner enkoder, MPU6050 (ham Wire, eğim, tamamlayıcı filtre), keypad, RTC, I2C LCD, durum makineleri, EEPROM. Bu modülde çoğu ders robot benzetimine dayanır (`sim.rover`, `sim.balancer`); kullanım ve standart pinler `tools/sim/README.md`'deki "Robot benzetimi" bölümünde. Davranış kontrolü robotun gerçek konumu/yönü/ölçümü üzerinden yazılmalı (ör. "robot 1 m yol alıp duvardan ≥ 15 cm uzakta durdu", "çizgiyi kaybetmeden pisti bitirdi", "X dakikada Y metre"); sadece pin durumuna bakan kontrol yetmez. checks.mjs içinde `import { Arena, STD_MOTORS, STD_ENCODERS, STD_ULTRASONIC } from '../../../tools/sim/robot.mjs'` kullan. Simülasyon süresi uzadıkça check yavaşlar: gereksiz uzun koşturma (tipik 5-15 sn benzetim yeter).
Fizik gerçekçi ama basit: ölü bölge, motor gecikmesi, tekerlek uyumsuzluğu (`gain`), sensör gürültüsü (`noiseCm`, `seed` ile tekrarlanabilir). Bunları derslerde gerçek robotun özellikleri gibi anlat ("motorların ilk %20 PWM'de dönmemesi gerçek motorlarda da görülür"); simülasyona özgü kusurları (ör. zamanlamanın mükemmelliği) gerçek donanıma garanti diye sunma. Derslerin sonunda "gerçek robotta farklı olabilecekler" notu ekleyebilirsin.
3D robot: Bu modülün hedefi, öğrencinin kodunun ileride 3D bir robotu sürmesi. Derslerde 3D'den söz edeceksen "ileride bağlanacak" de; var olan bir 3D görüntü iddia etme.

## Modül 5 standart bağlantılar (tüm haftalarda aynı)
Sol motor EN D5 (PWM), IN1 D7, IN2 D8 · sağ motor EN D6 (PWM), IN3 D9, IN4 D10 · enkoder sol D2, sağ D3 (kesme pinleri) · ultrasonik TRIG D11, ECHO D12, servo D4 · çizgi sensörleri A0…A4 · tamponlar D2/D3 (enkoder gelmeden önceki haftalarda; ikisi aynı anda kullanılmaz) · I2C MPU6050 0x68 (SDA A4, SCL A5) · robot kol servoları D9/D10/D11 (kol dersleri sürüş motorlarından bağımsızdır). Sketch'lerde pinleri `const int` ile adlandır.

## 40 derslik plan (Modül 5: 76-115)
H1 Hareket temelleri, DC motor + L298N/TB6612 (Komutlu araba): 76 Diferansiyel sürüş: v, ω ve tekerlek hızları · 77 Motor sürücüsü L298N/TB6612: yön ve PWM · 78 Hız, ölü bölge ve kalibrasyon · 79 Seri komutlarla sürüş (uzaktan kumanda simülasyonu) · 80 Proje: Komutlu araba
H2 Engel, tampon + HC-SR04 + servo (Engelden kaçan robot): 81 Tampon (dokunma) sensörleriyle tepki · 82 Mesafe sensörüyle dur ve dön · 83 Servo taramasıyla en açık yolu bul · 84 Engelden kaçma durum makinesi · 85 Proje: Otonom engelden kaçan robot
H3 Çizgi, TCRT5000 dizisi (Çizgi izleyen robot): 86 Yansımalı IR sensör ve çizgi okuma · 87 Kalibrasyon: min/max ve eşik · 88 Bang-bang çizgi izleme ve histerezis · 89 Kavşak, keskin viraj ve çizgi kaybı · 90 Proje: Çizgi izleyen robot (pist)
H4 Enkoder ve odometri (Kare çizen robot): 91 Tekerlek enkoderi: tık → mesafe · 92 Kesmeyle sayma ve hız hesabı · 93 Düz gitme: iki tekerleği eşitleme · 94 Odometri: konum ve yön tahmini, sapma · 95 Proje: Kare ve sekiz çizen robot
H5 PID (PID çizgi izleyen ve duvar takipçisi): 96 P: orantılı kontrol · 97 D: türev ve gürültü · 98 I: integral ve windup · 99 PID ayarı: el ile ve SIMC (Hyvex F1 vakası) · 100 Proje: PID çizgi izleyen ve duvar takip
H6 IMU ve denge, MPU6050 (Dengelenen robot): 101 IMU ile eğim ölçümü · 102 Tamamlayıcı filtre ve Kalman'a giriş · 103 Sabit periyotlu kontrol döngüsü · 104 Kaskad PID: açı ve hız · 105 Proje: Kendini dengeleyen robot
H7 Davranış ve robot kol (Gezgin robot): 106 Sensör birleştirme: enkoder + IMU · 107 Davranış tabanlı kontrol ve öncelikler · 108 Robot kol: servolar ve iki eksen ters kinematik · 109 Robot kol: al-bırak dizisi · 110 Proje: Gezgin robot (ara, kaç, dolaş)
H8 Bitirme robotu, üç seçmeli yol (Bitirme robotu): 111 Proje seçimi ve tasarım: A) otonom araç, B) robot kol, C) takip robotu · 112 Yapım 1: alt sistemler · 113 Yapım 2: entegrasyon ve test · 114 3D robota bağlama, hata ayıklama, ölçüm · 115 Sergi ve sunum (Hyvex rapor kültürü)

# Modül 3-4-5 Planı — Arduino · Sensörler · Robotik (115 ders)

Durum: taslak v1 (2026-10-01). Önceki `mufredat-taslak.md` içindeki Modül 3-5 bölümlerinin yerini alır.
Format: haftada 5 ders, ders başına 15-25 dk (Hyvex formatı: merak → etkinlik → konuşalım → bitti).
Her hafta: bir **sensör/parça grubu** ve haftanın sonunda bir **proje**. Her modül bir bitirme projesiyle kapanır.

## Neden bu bölünme

| Modül | İçerik | Hafta | Ders |
|---|---|---|---|
| **3. Arduino Temelleri** | Giriş/çıkış, analog, PWM, motor, zamanlama, ekran | 7 | 35 |
| **4. Sensörler ve Projeler** | Mesafe, varlık, ortam, hareket, girdi cihazları, zaman/veri, simülasyondan gerçeğe | 8 | 40 |
| **5. Robotik** | Motor sürüşü, engel, çizgi, enkoder, PID, denge, robot kol, bitirme robotu | 8 | 40 |
| | | **23** | **115** |

Araştırma bulgusu: incelenen 13 eğitimden hiçbiri 100+ ders değil (SunFounder 23-87, Keyestudio 11-35, Elegoo 34, Arduino Starter Kit 15, SparkFun SIK 16). En yaygın sıra hepsinde aynı: dijital → analog → ekran → motor → sensörler → haberleşme → robot. Bu plan o sırayı izler ve robotik ile PID/denge gibi kitlerde bulunmayan konuları ekler.

---

# Modül 3 — Arduino Temelleri (7 hafta, 35 ders)

### Hafta 1 — Temeller · Parça: LED, direnç · Proje: Trafik ışığı
1. Mikrodenetleyici nedir? Kart anatomisi ve simülatör
2. Elektrik: V, I, R ve Ohm yasası
3. İlk program: Blink (setup/loop)
4. Çoklu LED, for döngüsü ve diziler
5. **Proje:** Trafik ışığı

### Hafta 2 — Girdi ve mantık · Parça: buton, eğim anahtarı · Proje: Kapı zili ve sayaç
6. digitalRead, buton, INPUT_PULLUP
7. if/else, switch, mantık işleçleri
8. Debounce ve kenar algılama
9. Serial Monitor: yazdır, oku, ayrıştır
10. **Proje:** Kapı zili ve basış sayacı

### Hafta 3 — Analog dünya · Parça: potansiyometre, LDR, NTC termistör · Proje: Akıllı gece lambası
11. analogRead, ADC, potansiyometre
12. Gerilim bölücü ve LDR
13. Termistör (NTC) ve sıcaklık hesabı
14. map, constrain, kalibrasyon ve yumuşatma
15. **Proje:** Akıllı gece lambası

### Hafta 4 — PWM, renk, ses · Parça: RGB LED, buzzer · Proje: Işıklı müzik kutusu
16. PWM ve analogWrite: nefes alan LED
17. RGB LED ve renk karıştırma
18. Buzzer: tone ve nota frekansları
19. Fonksiyonlar, kapsam, parametreler
20. **Proje:** Işıklı müzik kutusu

### Hafta 5 — Motorlar · Parça: servo, DC motor, L293D, röle · Proje: Otomatik fan ve tarayıcı
21. Servo: açı kontrolü
22. Transistör/MOSFET ile anahtarlama, flyback diyot, DC motor
23. H-köprüsü L293D: yön ve hız
24. Röle: yüksek akım anahtarlama ve güvenlik
25. **Proje:** Sıcaklığa bağlı otomatik fan ve servo tarayıcı

### Hafta 6 — Zamanlama · Parça: buton, LED, buzzer · Proje: Çoklu görev paneli
26. delay'in tuzağı
27. millis() ile bloklamayan kod
28. Durum makineleri (FSM)
29. Kesmeler ve timer'lar: attachInterrupt, volatile, ISR kuralları
30. **Proje:** Çoklu görev paneli (üç işi aynı anda)

### Hafta 7 — Ekranlar ve veri · Parça: 7-segment, 74HC595, LCD, I2C · Proje: Termostat
31. 7-segment ve 74HC595 kaydırmalı yazmaç
32. LCD 16x2
33. I2C: Wire, adres tarama
34. EEPROM, String/SRAM ve kütüphane kullanımı
35. **Bitirme projesi:** Termostat (NTC + LCD + röle + EEPROM, durum makineli)

---

# Modül 4 — Sensörler ve Projeler (8 hafta, 40 ders)

### Hafta 1 — Mesafe · Sensör: HC-SR04 · Proje: Park sensörü
36. Ultrasonik prensip: ses, süre, mesafe
37. pulseIn, trig/echo ve santimetre hesabı
38. Gürültü, yansıma açısı ve medyan filtre
39. Servo ile tarama (sonar)
40. **Proje:** Park sensörü (LED + buzzer + LCD)

### Hafta 2 — Varlık ve engel · Sensör: PIR, IR engel, reed/limit, VL53L0X · Proje: Hırsız alarmı
41. PIR: hareket algılama ve ısınma süresi
42. IR engel sensörü ve eşik ayarı
43. Reed anahtarı ve limit anahtarı
44. VL53L0X (I2C ToF): hassas mesafe
45. **Proje:** Hırsız alarmı (durum makineli)

### Hafta 3 — Ortam · Sensör: DHT11/22, BMP280, toprak nemi, yağmur, su seviyesi · Proje: Hava istasyonu
46. DHT11/DHT22: sıcaklık ve nem
47. BMP280: basınç ve rakım (I2C)
48. Toprak nemi, yağmur ve su seviyesi
49. Çok sayfalı ekran arayüzü (LCD/OLED)
50. **Proje:** Hava istasyonu ve sulama uyarısı

### Hafta 4 — Işık, ses, gaz · Sensör: foto sensör, ses sensörü, MQ-2, alev · Proje: Yangın ve gaz alarmı
51. Işık sensörü hassasiyeti ve histerezis
52. Ses sensörü: alkış anahtarı
53. MQ-2 gaz sensörü: ısınma ve kalibrasyon
54. Alev sensörü ve çoklu eşik yönetimi
55. **Proje:** Yangın ve gaz alarm paneli

### Hafta 5 — Hareket ve yön · Sensör: joystick, döner enkoder, MPU6050 · Proje: Eğimle kontrol edilen servo
56. Joystick: iki eksen ve düğme
57. Döner enkoder (quadrature) ve kesme
58. MPU6050: ivmeölçer ve eğim açısı
59. Jiroskop sapması ve tamamlayıcı filtre
60. **Proje:** El eğimiyle kontrol edilen servo (mini gimbal)

### Hafta 6 — Girdi cihazları · Sensör: IR kumanda, keypad 4x4, RFID RC522 · Proje: Akıllı kapı
61. IR alıcı ve kumanda kodları
62. Keypad 4x4: şifre girişi
63. RFID RC522 (SPI): kart okuma
64. Yetki yönetimi: kart + şifre + EEPROM
65. **Proje:** Akıllı kapı kilidi (servo + LCD + buzzer)

### Hafta 7 — Zaman ve veri · Sensör: RTC, SD kart · Proje: Veri kaydedici
66. RTC: saat, tarih, alarm
67. SD kart (SPI): dosyaya yazma
68. Veri kaydı: CSV ve zaman damgası
69. Haberleşme protokolleri: UART, I2C, SPI karşılaştırması
70. **Proje:** Sıcaklık ve nem veri kaydedici

### Hafta 8 — Simülasyondan gerçeğe · Proje: Akıllı oda
71. Simülasyon neden yalan söyler: gürültü, bounce, güç, toprak
72. Gerçek kart: kurulum, yükleme, multimetre, güvenlik
73. Kablosuz: Bluetooth (HC-05) ve WiFi — kod ve seri konsol
74. Hata ayıklama vakası: "ping çalışıyor ama veri yok" (Hyvex kök neden)
75. **Bitirme projesi:** Akıllı oda (DHT + PIR + LDR + röle + LCD)

---

# Modül 5 — Robotik (8 hafta, 40 ders)

### Hafta 1 — Hareket temelleri · Parça: DC motor, L298N/TB6612 · Proje: Komutlu araba
76. Diferansiyel sürüş: v, ω ve tekerlek hızları
77. Motor sürücüsü L298N/TB6612: yön ve PWM
78. Hız, ölü bölge ve kalibrasyon
79. Seri komutlarla sürüş (uzaktan kumanda simülasyonu)
80. **Proje:** Komutlu araba ve 3D robotun ilk sürüşü

### Hafta 2 — Engel · Sensör: tampon, HC-SR04 + servo · Proje: Engelden kaçan robot
81. Tampon (dokunma) sensörleriyle tepki
82. Mesafe sensörüyle dur ve dön
83. Servo taramasıyla en açık yolu bul
84. Engelden kaçma durum makinesi
85. **Proje:** Otonom engelden kaçan robot

### Hafta 3 — Çizgi · Sensör: TCRT5000 dizisi · Proje: Çizgi izleyen robot
86. Yansımalı IR sensör ve çizgi okuma
87. Kalibrasyon: min/max ve eşik
88. Bang-bang çizgi izleme ve histerezis
89. Kavşak, keskin viraj ve çizgi kaybı
90. **Proje:** Çizgi izleyen robot (pist)

### Hafta 4 — Enkoder ve odometri · Sensör: tekerlek enkoderi · Proje: Kare çizen robot
91. Tekerlek enkoderi: tık → mesafe
92. Kesmeyle sayma ve hız hesabı
93. Düz gitme: iki tekerleği eşitleme
94. Odometri: konum ve yön tahmini, sapma
95. **Proje:** Kare ve sekiz çizen robot (3D iz)

### Hafta 5 — PID · Proje: PID çizgi izleyen ve duvar takipçisi
96. P: orantılı kontrol
97. D: türev ve gürültü
98. I: integral ve windup
99. PID ayarı: el ile ve SIMC (Hyvex F1 vakası)
100. **Proje:** PID çizgi izleyen ve duvar takip

### Hafta 6 — IMU ve denge · Sensör: MPU6050 · Proje: Dengelenen robot
101. IMU ile eğim ölçümü
102. Tamamlayıcı filtre ve Kalman'a giriş
103. Sabit periyotlu kontrol döngüsü
104. Kaskad PID: açı ve hız
105. **Proje:** Kendini dengeleyen robot

### Hafta 7 — Davranış ve robot kol · Parça: servo kol · Proje: Gezgin robot
106. Sensör birleştirme: enkoder + IMU
107. Davranış tabanlı kontrol ve öncelikler
108. Robot kol: servolar ve iki eksen ters kinematik
109. Robot kol: al-bırak dizisi
110. **Proje:** Gezgin robot (ara, kaç, dolaş)

### Hafta 8 — Bitirme robotu (üç seçmeli yol)
111. Proje seçimi ve tasarım: A) otonom araç, B) robot kol, C) takip robotu
112. Yapım 1: alt sistemler
113. Yapım 2: entegrasyon ve test
114. 3D robota bağlama, hata ayıklama, ölçüm
115. **Sergi ve sunum** (Hyvex rapor kültürü)

---

## Sensör haritası ve simülatör uygunluğu

✅ simülatörde doğal çalışır · ⚠️ kısmen / kaydırıcı ya da kayıtlı veriyle · ❌ simüle edilemez (yalnız kod ve anlatım)

| Sensör / parça | Ders | Simülatör | Not |
|---|---|---|---|
| LED, buton, direnç, potansiyometre | 1-15 | ✅ | |
| LDR, NTC | 12-13 | ✅ | analog değer |
| RGB LED, buzzer, servo | 16-21 | ✅ | |
| DC motor + transistör / L293D | 22-23 | ⚠️ | hareket yalnız görsel; Velxio'da L298N yok, L293D var |
| Röle | 24 | ✅ | |
| 7-segment, 74HC595, LCD, OLED, I2C | 31-33 | ✅ | |
| HC-SR04 | 36-40 | ✅ | kendi modelimiz: 2B/3B ışın atma |
| PIR, IR engel | 41-42 | ✅ | |
| Reed / limit | 43 | ⚠️ | buton gibi modellenir |
| VL53L0X | 44 | ⚠️ | Wokwi listesinde yok; I2C cihaz modeli yazılabilir veya kayıtlı veri |
| DHT11/22, BMP280 | 46-47 | ✅ | DHT11 zamanlaması bizim modelimizde yazılmalı |
| Toprak nemi, yağmur, su, ses, MQ-2, alev | 48, 52-54 | ⚠️ | analog kaydırıcı |
| Joystick, döner enkoder | 56-57 | ✅ | |
| MPU6050 | 58-59, 101-104 | ✅ | kendi modelimiz: sapma + gürültü |
| IR alıcı + kumanda | 61 | ✅ | |
| Keypad 4x4 | 62 | ✅ | |
| RFID RC522 | 63 | ⚠️ | sanal kart |
| RTC, SD kart | 66-68 | ✅ | DS1307 var, DS3231 yok |
| Bluetooth HC-05/HM-10, ESP8266, nRF24 | 73 | ❌ | seri konsolla taklit + kod anlatımı |
| MAX30102, kamera | — | ❌ | müfredata alınmadı |
| TCRT5000 dizisi, tekerlek enkoderi | 86-95 | ⚠️ | robot arenası içinde kendi modelimizle |

**Bulgu:** Bluetooth/WiFi/nRF24 en sık geçen kablosuz parçalar ama hiçbir tarayıcı simülatöründe desteklenmiyor. Bu yüzden 73. ders "kod ve seri konsol" olarak tasarlandı; kablosuz konular müfredatın merkezinde değil.

## Simülatör yapım sırası (müfredatla aynı)

| Aşama | Gereken | Ders |
|---|---|---|
| S1 | avr8js çekirdeği, LED, buton, potansiyometre, Serial, blok → C++ | 1-15 |
| S2 | PWM, RGB, buzzer, servo, röle, DC motor + sürücü | 16-30 |
| S3 | 7-seg, 74HC595, LCD (I2C), EEPROM | 31-35 |
| S4 | HC-SR04, PIR, DHT, BMP280 (I2C cihaz modeli) | 36-55 |
| S5 | MPU6050, enkoder, keypad, IR, RC522, RTC, SD | 56-70 |
| S6 | 2B robot arenası: motor, enkoder, çizgi/mesafe sensörü, 3D görüntüleme | 76-115 |

Her aşama, dersler yayınlanmadan önce bitmeli. Hazır değilse o aşamanın dersleri Velxio/Wokwi yönlendirmesiyle yayına alınabilir.

## 3D robot kontrol noktaları

| Ders | 3D robotta görünen |
|---|---|
| 20 | Farlar (PWM parlaklık ve renk) |
| 25 | Servo "kafa" ve fan |
| 40 | Ultrasonik ışın görselleştirmesi |
| 60 | Eğime tepki veren gimbal |
| 80 | İlk sürüş (komutlu araba) |
| 85, 90, 95 | Engel, çizgi, odometri izi |
| 105 | Dengelenen robot |
| 110, 115 | Gezgin robot ve bitirme robotu |

Mimari kararı: fizik ve sensörler 2B'de hesaplanır, 3D yalnız görüntüleme katmanıdır.

## Riskler ve doğrulanmayanlar

- Ders başlıkları birleşik bir plan. **Ders içerikleri henüz yazılmadı** (yalnız başlık ve sıra var). Modül 1-2'deki gibi tek tek yazılacak, ~115 ders.
- Simülatör uygunluğu Wokwi'nin desteklenen donanım sayfasından geliyor. **Kendi simülatörümüz için her parça ayrı model işi** (sensör başına tahminen 1-3 gün, kanıtlanmadı).
- Keyestudio KS0536 projeleri 21-35, SunFounder Ultimate Sensor ders sırası ve Türkçe 100 derslik bir kurs **doğrulanamadı**. Kıyaslama 12 kaynaklı bir örnekleme dayanıyor, tam sayım değil.
- Wokwi'de DC motor/L298N desteği doğrulanmadı. Motor derslerinin simülatörde nasıl işleneceği simülatör kararına bağlı.
- Hafta başına 5 ders, ders başına 15-25 dk varsayımı. Proje günleri 25+ dk sürebilir.

## Kaynaklar

SunFounder (Ultimate Sensor Kit, Elite Explorer, UNO/Mega, 3-in-1) · Keyestudio (KS0077/79, KS0536/37, KS0470, KS0523) · Elegoo Most Complete Starter Kit · Jeremy Blum Exploring Arduino · Arduino Starter Kit · SparkFun SIK · Wokwi desteklenen donanım sayfası · Udemy Arduino Step by Step (özet). Ayrıntılı bağlantılar ve önceki araştırmalar: `mufredat-taslak.md`.

# Modül 3-5 Müfredat Taslağı — Arduino · Gerçek Kart · Robotik ve Sensörler

Durum: taslak v0 (2026-10-01). Kit satılmıyor; her ders önce tarayıcı simülasyonunda çalışır.
Ders formatı (Hyvex Academy): günlük 15-20 dk = 2 dk problem · 8-10 dk kavram + gerçek vaka · 3-5 dk demo · 1 soru.
Hafta sonu: mini uygulama (otomatik kontrol edilebilir çıktı: Serial çıktısı / pin durumu).

---

## Modül 1 — ScratchJr (5 hafta, 5-7 yaş)

Seans 30-40 dk, haftada 2, yanında yetişkin. Sıra CAL müfredatını izler: yeşil bayrak → sonsuza kadar tekrarla → dokununca başla → bekle → tekrar → çok sayfalı proje. Hata ayıklama final projesinden önce.

1. Merhaba Dünya: ekransız "robot oyunu" (ebeveyn komut verir), yeşil bayrakla karakter hareketi. *Sıra, algoritma.*
2. Dans eden karakter: hareket, görünüm, sonsuz tekrar, ses, çizim editörü. *Döngü, parametre.*
3. Dokununca olsun: dokununca başla, söyle, bekle; konuşan hayvan, zıplayan top. *Olay, zamanlama.*
4. İki sayfalı hikâye: sayfa değişimi, arka plan, metin aracı, tekrar(n). *Çok sayfa, modülerlik.*
5. Hata avı + final: bozuk programı düzelt, "Benim hikâyem" projesini aileye sun. *Tasarım süreci, hata ayıklama.*

## Modül 2 — Scratch 3 (8 hafta, 8-12 yaş)

Seans 45-60 dk. Sıra Harvard Creative Computing ünitelerinden uyarlandı; "Debug It!" her ünitede tekrarlanır.

1. Tanışma: arayüz, sprite, kostüm, sahne; ekransız "dans programı". *Sıra.*
2. Animasyon: "Canlı Karakter", tekrar, sonsuz, görünüm blokları. *Döngü, paralellik.*
3. Müzik ve etkileşim: tuş/tık olayları, ses. *Olay.*
4. Hikâye: iki sprite arası konuşma, yayın/aldığımda, arka plan değişimi. *Mesajlaşma, sahneler.*
5. Oyun 1 — yakalama oyunu: hareket, eğer/değilse, dokunma, skor değişkeni. *Koşul, değişken.*
6. Oyun 2 — geliştir: zamanlayıcı, can, oyun bitti, rastgele, klonlarla düşen nesneler. *Operatör, klon.*
7. Benim Bloğum ve listeler: fonksiyon, liste tabanlı bilgi yarışması. *Soyutlama, liste.*
8. Proje ve fiziksel dünyaya köprü: seç, yap, sergile; LED/Arduino bloklarıyla kısa tanıtım. *Tasarım süreci, remix.*

Remix tüm modüle yayılır: 1. haftada hazır projeden başla, 4. haftada eşli programlama ("Pass It On"); remix platform içinde ve orijinal sahibi belirtilerek yapılır.

**Scratch → Arduino köprüsü:** Scratch → blok tabanlı Arduino (Tinkercad "Kod Blokları" veya mBlock) → bloklar + metin görünümü → Arduino C++. Modül 3'ün 1. haftası bu köprüden girebilir. Velxio'da blok modu doğrulanmadı.

**Türkiye boşlukları ve farklılaşma:** 5-7 yaş için Türkçe ScratchJr içeriği zayıf; ScratchJr Kodlama Kartları'nın Türkçesi bulunamadı; Scratch'ten Arduino ve robotiğe uzanan yapılandırılmış tek bir merdiven bulunamadı. Fark yaratacak noktalar: Türkçe hikâye yazımıyla okuryazarlık bağı, ekransız önce yaklaşımı, Arduino'ya görünür yol, ebeveyn kılavuzları.

**Lisans ve gizlilik notları (lisans konusu sona bırakıldı, burada sadece kayıt):**
- CAL ve Creative Computing CC BY-NC-SA 4.0: ticari kursa kopyalanamaz, yalnız pedagojik model olarak kullanıp dersleri kendimiz yazarız.
- Scratch editör kodu (scratch-gui, scratch-vm) Kasım 2024'te BSD-3'ten AGPL-3.0'a geçti; Scratch adı ve logosu marka. Barındırma biçimi lisansa göre ayrıca değerlendirilecek.
- KVKK: 16 yaş altı için ebeveyn açık rızası; mümkün olan en az veri, gerçek isim/fotoğraf yayımlayan öğrenci hesabı yok. COPPA bakılmadı.

---

## Modül 3 — Arduino Simülasyon (7 hafta, 35 ders)

Çıkış: tarayıcıda sıfırdan çalışan, durum makineli bir Arduino projesi.

| Hf | Tema | Dersler (günler) |
|----|------|------------------|
| 1 | Temeller | Mikrodenetleyici nedir, kart anatomisi · V/I/R, Ohm yasası, breadboard · setup/loop, Blink · Değişken ve tipler · Çoklu LED, for, dizi |
| 2 | Girdi ve mantık | digitalRead, buton, INPUT_PULLUP · if/else/switch · Debounce ve kenar algılama · Serial monitör (yaz/oku/ayrıştır) · Fonksiyonlar ve kapsam |
| 3 | Analog | analogRead, ADC, gerilim bölücü, potansiyometre · LDR, NTC · map/constrain/kalibrasyon · Yumuşatma (ortalama, medyan) · PWM, analogWrite, fade |
| 4 | Çıkışlar | RGB LED · Buzzer, tone, melodi · Servo · Transistör/MOSFET, flyback diyot, DC motor · L293D/H-köprüsü, röle |
| 5 | Zamanlama (ayırt edici hafta) | delay'in tuzağı · millis() ile bloklamayan kod · Durum makineleri · Timer'lar · Interrupt, volatile, ISR kuralları |
| 6 | Ekran ve veri yolları | 7-segment, 74HC595 · LCD 16x2 · I2C (Wire, tarama, OLED) · SPI temelleri · Kütüphane kullanımı |
| 7 | Bitirme | EEPROM · String ve SRAM · Proje günü 1-3 (Simon Says / trafik ışığı / termostat, durum makineli) · Proje günü 4-5: hata ayıklama ve sunum |

Ayırt edici: millis, durum makinesi, interrupt, EEPROM. Araştırmada bulunan Türkçe kaynaklar buton/sensör/servo seviyesinde bitiyor.

Sık yanlışlar (her derse gömülecek): pull-up'sız buton, LED'e dirençsiz bağlantı, analogRead (0-1023) ile analogWrite (0-255) karışması, delay ile kaçan buton, int ile millis taşması, motoru pine direkt bağlama, ISR içinde Serial.print, = ile == karışması.

---

## Modül 4 — Simülasyondan Gerçeğe (2 hafta, 10 ders)

Kit yok: elinde kartı olan öğrenci uygular, olmayan öğrenci aynı derslerde **kayıtlı ölçüm verisi ve hata vakaları** üzerinde çalışır.

| Hf | Dersler |
|----|---------|
| 1 | Simülasyon neden yalan söyler (gürültü, bounce, güç, toprak) · IDE/Arduino Cloud kurulum ve yükleme · Multimetre ve güvenlik · Kayıtlı osiloskop verisinden bounce okumak · Sim'de çalışan ama gerçekte çalışmayan 3 vaka |
| 2 | Hyvex vakası: "ping çalışıyor ama veri yok" → katman katman hata ayıklama (Hyvex Gün 3-4) · Seri protokol sorunları: baud, checksum (Hyvex Gün 5-6) · Fail-safe: watchdog ve varsayılan-kapalı çıkış (Hyvex Gün 9) · Sim → gerçek taşıma kontrol listesi · Mini sınav: bozuk bir devreyi teşhis et |

---

## Modül 5 — Robotik ve Sensörler (8 hafta, 40 ders)

Sıra "robot ne algılar" mantığıyla (Circuit Digest çerçevesi: dokunur, görür, hareketi algılar). Her hafta bir proje basamağı.

| Hf | Temalar | Proje | Yeni kavramlar |
|----|---------|-------|----------------|
| 1 | Dokunma + sürüş | Tampon sensörlü robot | Motor sürücü, PWM, debounce |
| 2 | Işık ve çizgi | Işık takipçisi → bang-bang çizgi izleyen | Kalibrasyon, eşik, histerezis |
| 3 | Mesafe | Servo taramalı engelden kaçan robot | Ultrasonik/ToF/IR, medyan filtre, FSM |
| 4 | Kendi hareketi 1 | Enkoderle düz gitme ve 90° dönüş | Enkoder, interrupt, diferansiyel sürüş kinematiği, odometri |
| 5 | Kontrol | PID çizgi izleyen | P→PD→PID, integral windup, ayar yöntemleri (Hyvex F1: neden Ziegler-Nichols yerine SIMC) |
| 6 | Kendi hareketi 2 | Duvar takipçisi + dengelenen robot | IMU, jiroskop sapması, tamamlayıcı filtre, kaskad PID, sabit periyotlu döngü |
| 7 | Ortam, ısı, görüntü | Davranış tabanlı robot (ara, kaç, gez) | BMP280/DHT22, MLX90614/AMG8833, sensör birleştirme, davranış önceliği |
| 8 | Haberleşme ve bitirme | LiDAR/kamera verisini köprüleme | UART/I2C/SPI/CAN karşılaştırma, /cmd_vel → tekerlek hızı, bitirme projesi |

Hyvex vaka bağlantıları: protokol tersine mühendisliği (Gün 5-6), köprü mimarisi (Gün 8), fail-safe (Gün 9), MAVLink ve sahte araçla geliştirme (Gün 10), görsel servoing (Gün 12), PID (F1).

---

## Simülatörün sınırları ve çözümleri

| Sorun | Çözüm |
|-------|-------|
| Sensör değeri kaydırıcı, gerçek fizik yok (gürültü, IMU sapması) | Hazır CSV veri setleri Serial'e verilir; filtre dersleri gerçek kayıtlı veriyle işlenir |
| Kamera, LiDAR simüle edilemiyor | LiDAR taraması ve kamera karesi kayıtlı veri olarak sağlanır; Modül 5 Hf 7-8 |
| L298N bulunamadı (L293D var) | Derslerde L293D kullan; L298N'i metinle anlat |
| Otomatik not verme yok | Çıktıyı (Serial/pin kaydı) kendi betiğimizle karşılaştır |
| Flex sensör, soft pot, dokunmatik, optik enkoder yok | Bu derslerden çıkar ya da potansiyometreyle taklit et |

---

## Doğrulanması gerekenler (ders yazmadan önce)

1. Her biri için tek test sketch'i: attachInterrupt, EEPROM, Servo.h, LiquidCrystal.h, tone() zamanlaması, 74HC595, L293D ile motor.
2. Kütüphane yükleme canlı sitede çalışıyor mu.
3. Simülatör seçimi: Velxio (kart sayısı kaynaklarda 19/35/40 diye tutarsız, beta, iframe belgesi yok) ve Wokwi (iframe örneği var, sınıf planı 30 €/öğrenci/dönem) için karar. Kod bu adımdan önce yazılmamalı.
4. Circuit Digest gönderisinin slayt içeriği hiç okunamadı; sensör sırası başlıktan çıkarıldı.
5. Lisans (Velxio AGPLv3) en sona bırakıldı.

## Kararlar (2026-10-01)

- Kit satılmayacak. Lisans konusu en sona bırakıldı.
- Önce platform; modüller sırayla (1 → 5) geliştirilecek.
- Kendi simülatörümüz hedef (avr8js + rp2040js + wokwi-elements + Blockly üzerine); sıra gelince Arduino modülünde Blink, Serial çıktısı ve basit HC-SR04 modeliyle başlanır. Velxio/Wokwi yedek.
- Her bölüm sonunda 3D robot: öğrenci Arduino kodunu yazar, simüle edilen Arduino 3D robotu sürer.
  Önerilen mimari: fizik/mantık 2D'de, 3D yalnız görüntüleme katmanı (maliyeti düşürür).
- Sensör kütüphanesi müfredat sırasıyla büyür, "hepsi baştan" hedeflenmez.

## Kaynaklar (okunanlar)
Arduino Starter Kit ve built-in examples (docs.arduino.cc) · SparkFun SIK v3.3 · Paul McWhorter · Tinkercad Circuits · Arduino Student Kit · Programming Electronics Academy (millis) · DroneBot Workshop · MIT 6.141 · Pololu Zumo 32U4 · Georgia Tech Control of Mobile Robots · MEB Arduino ile Robotik Kodlama · velxio.dev ve GitHub dokümanları · wokwi.com/classroom.

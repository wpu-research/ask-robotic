# Sanal Arduino Devre Laboratuvarı — Tasarım

Durum: tasarım v0 (2026-10-01). Portal tamamen sanaldır (bkz. `plan-moduller.md`): Modül 3-4'ün tüm devre/kod etkinlikleri bu laboratuvarda yapılır.

## Kullanıcıya görünen
Bir ders etkinliği: devre tuvali + kod düzenleyici + seri monitör + parça paneli.
- **Tuval:** Arduino Uno sabit durur. Paletten parça sürüklenir (LED, direnç, buton, potansiyometre, LDR, NTC, buzzer, RGB LED, servo, LCD, HC-SR04, DHT22…). Parçaların uçlarından (pin) başka bir uca sürüklenerek **kablo** çizilir. Breadboard yok: kablolar doğrudan pinler arasındadır (başlangıç düzeyi için daha az karmaşık). Kabloların bağlandığı pinlerde birleşme (net) oluşur; bir pine birden çok kablo bağlanabilir.
- **Parça özellikleri** (tıklayınca): direnç değeri, potansiyometre konumu, LDR için ışık düzeyi, NTC için sıcaklık, mesafe sensörü için mesafe, buton için basılı tutma, vb. Çalışırken canlı değiştirilebilir.
- **Kod:** C++ (Arduino) düzenleyici; **Derle ve çalıştır**, **Dur**, **Sıfırla**.
- **Geri bildirim:** LED'ler yanar (parlaklık akıma göre), buzzer sesi çalar, servo döner, LCD yazıyı gösterir, seri monitör satırları gösterir. Hata varsa derleme mesajı satır numarasıyla çıkar.
- **Hedefler:** Ders hedefleri (Modül 1'deki gibi) hem **bağlantıyı** ("LED anodu D13'e 330 Ω üzerinden bağlı") hem **davranışı** ("LED saniyede bir yanıp sönüyor") denetler.

## Katmanlar
```
UI (React/SVG)  ──►  Lab (devre + simülasyon)  ──►  Sim (avr8js + cihaz modelleri)
                          │                             ▲
                          ├─ Netlist + DC çözücü        │ hex
                          └─ Parça modelleri            └── Derleme servisi (arduino-cli)
```
1. **`@ask/sim`** (paket, tarayıcı + Node): `Sim` (avr8js sarmalayıcısı: GPIO, zamanlayıcı, ADC, USART, TWI, EEPROM), cihaz modelleri (HC-SR04, DHT, BMP280, MPU6050, RTC, LCD, keypad), robot arenası. Node API'si (fs, child_process) YOK. Ders denetleyicisi (`tools/sim`) bu paketi kullanır → öğrencinin göreceği davranış, dersleri doğruladığımız davranışla aynıdır.
2. **Devre modeli ve çözücü** (`@ask/sim/circuit`): `Circuit = { parts, wires }`. Netlist çıkarımı (birleşik pinler), DC çözümü (modified nodal analysis): dirençler, 5 V/GND kaynakları, Arduino çıkış pinleri (gerilim kaynağı + ~25 Ω seri direnç), giriş pinleri (yüksek empedans; INPUT_PULLUP ise ~35 kΩ iç direnç), ADC okuması çözülen düğüm gerilimidir. LED sabit ileri gerilim (renge göre ~1.8-3.2 V) ile modellenir; akım sınırı aşımı (LED yanması) uyarısı verilir. Transistör/MOSFET/röle basit anahtar modelidir (eşik gerilimi). Şu aşamada AC/frekans analizi yoktur; PWM, ortalama gerilim olarak değil **zamanlama olarak** işlenir (pin kenarlarından doluluk oranı çıkarılır; LED parlaklığı = min(1, akım / 10 mA) × doluluk; böylece 330 Ω ≈ 0,86, 220 Ω tam parlak, 1 kΩ belirgin loş).
3. **Derleme servisi**: `POST /api/compile`. Sunucuda `arduino-cli`; hex döner. Güvenlik sınırları aşağıda.
4. **UI**: tuval, palet, özellik paneli, kod düzenleyici (CodeMirror 6), seri monitör, hedef paneli. Jr editöründeki desenler yeniden kullanılır (sürükle-bırak, kalıcılık, hedefler).

## Çalıştırma döngüsü
- `Lab.start(hex)`: Sim kurulur, devre netlist'i çözülür, her saat diliminde (örn. 1 ms benzetim zamanı) çözücü, GPIO durumu veya kullanıcı özellikleri değiştiyse yeniden çalışır.
- Çözüm → ADC kanal gerilimleri (`sim.analog`), dijital giriş seviyeleri (`sim.drive`) ve parça durumları (LED akımı, buzzer frekansı, servo açısı…).
- Zaman: gerçek zamanla orantılı (varsayılan 1x), "hızlı ileri" seçeneği olabilir.

## Parça kümeleri (aşamalar)
- **A (Modül 3, H1-H4):** Uno, LED (+renkler), direnç, buton, potansiyometre, LDR, NTC, aktif/pasif buzzer, RGB LED. 
- **B (H5-H7):** servo, DC motor + transistör/MOSFET + diyot, L293D, röle, 7-segment, 74HC595, LCD 16x2 (paralel + I2C).
- **C (Modül 4):** HC-SR04, PIR, IR engel, reed, DHT11/22, BMP280, MPU6050, joystick, döner enkoder, keypad, RTC, MQ-2/alev/ses/toprak nemi (analog modüller).
- **Yalnız modelsiz/derlenir:** RC522, IRremote, SD, VL53L0X, OLED, HC-05 (ders metni dürüstçe belirtir ya da bu dersler başka etkinliğe çevrilir).

## Derleme servisinin güvenliği (zorunlu)
Kullanıcının yazdığı kod sunucuda **derlenir** (çalıştırılmaz). Riskler: dosya sızdırma (`#include "/etc/passwd"`), kaynak tüketimi, uzun derleme.
- Boyut sınırı (örn. 32 KB), zaman aşımı (60 sn), eşzamanlı derleme sınırı (kuyruk), kullanıcı/IP başına hız sınırı.
- `#include` yalnız **izinli kütüphane başlıkları** (Servo, LiquidCrystal, LiquidCrystal_I2C, Wire, EEPROM, SPI, DHT, Adafruit_BMP280, RTClib, Keypad, NewPing…) ve Arduino çekirdek başlıkları; tırnaklı ya da yol içeren include, `#include_next`, `__has_include`, `#pragma`, satır içi `asm`/`__asm__` reddedilir.
- Hata çıktısından sunucu yolları temizlenir.
- İzole dizinde derleme, sonuç hex içerik-hash'iyle önbelleğe alınır (aynı kod tekrar derlenmez).
- Dağıtım: `arduino-cli` + `arduino:avr` + kütüphaneler ayrı bir servis imajında; web uygulamasından ayrı ölçeklenir.
- Alternatif (araştırılacak): tarayıcı içi AVR derleyicisi. Şimdilik sunucu tarafı.

## Ders entegrasyonu
- `LabActivity` (Jr'daki `Activity` gibi): başlangıç devresi (Uno + hazır parçalar), izin verilen parçalar, başlangıç kodu (boş ya da eksik), hedefler, test için `solution` (devre + kod).
- Derslerin "Devre" tabloları aynen kalır: öğrenci tabloyu izleyip kabloları çeker. Bağlantı hedefleri bu tablolardan üretilir.
- Mevcut `checks.mjs` doğrulamaları değişmeden çalışır (aynı Sim çekirdeği).

## Açık sorular
1. LED'in "yanmasını" akıma mı doluluk oranına mı bağlayacağız (öneri: akım × doluluk, görsel olarak 3 kademe).
2. Gürültü/sıçrama gibi gerçek dünya etkilerinin simülatörde açılıp kapatılabilmesi (Modül 4 H8'in yeniden tasarımı buna dayanır).
3. Derleme servisi barındırma maliyeti ve sınırları.

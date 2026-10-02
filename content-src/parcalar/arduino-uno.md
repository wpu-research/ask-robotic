# Arduino Uno
slug: arduino-uno
parça: uno
kategori: Kart
özet: ATmega328P mikrodenetleyicili geliştirme kartı. Programı çalıştırır, pinleriyle devreyi sürer ve okur.

## Pinler
- D0: Dijital pin 0 (seri haberleşme RX ile paylaşılır; derslerde LED/butonda kullanılmaz)
- D1: Dijital pin 1 (seri haberleşme TX ile paylaşılır)
- D2: Dijital pin 2. Bu sitede ilk buton girişi
- D3: Dijital pin 3 (PWM). Bu sitede ikinci buton girişi
- D4: Dijital pin 4
- D5: Dijital pin 5 (PWM)
- D6: Dijital pin 6 (PWM)
- D7: Dijital pin 7
- D8: Dijital pin 8. Bu sitede buzzer
- D9: Dijital pin 9 (PWM). Servo/RGB
- D10: Dijital pin 10 (PWM)
- D11: Dijital pin 11 (PWM)
- D12: Dijital pin 12
- D13: Dijital pin 13. Karttaki dahili L LED'ine de bağlıdır
- A0: Analog giriş 0 (0-5 V okur). Bu sitede potansiyometre
- A1: Analog giriş 1. Bu sitede LDR
- A2: Analog giriş 2. Bu sitede NTC
- A3: Analog giriş 3
- A4: Analog giriş 4 (I2C SDA)
- A5: Analog giriş 5 (I2C SCL)
- 5V: 5 volt besleme çıkışı
- 3V3: 3,3 volt besleme çıkışı
- GND: Toprak (0 V)
- GND2: Toprak (0 V); GND ile aynı düğüm
- GND3: Toprak (0 V); GND ile aynı düğüm
- VIN: Dış besleme girişi

## Nasıl çalışır
Arduino Uno, **ATmega328P** mikrodenetleyicisi üzerine kurulmuş bir kartdır. Program (sketch) çipin **flash** belleğinde durur; güç gelince `setup()` bir kez, sonra `loop()` sürekli çalışır.

Başlıca özellikler: 16 MHz saat, 32 KB flash (program), 2 KB SRAM (çalışma belleği), 1 KB EEPROM (kalıcı veri).

**Dijital pinler (D0-D13)** iki durumdan birinde olur: HIGH (≈ 5 V) ya da LOW (0 V). `pinMode` ile çıkış ya da giriş yaparsın. **Analog girişler (A0-A5)** 0-5 V arasındaki gerilimi 10 bitlik ADC ile 0-1023 sayısına çevirir. **PWM** işaretli pinler (D3, D5, D6, D9, D10, D11) `analogWrite` ile 0-255 arası "ayarlanabilir" çıkış verir.

Pin akımı sınırlıdır: bir pinin önerilen en yüksek akımı yaklaşık 20 mA, mutlak sınır 40 mA'dir. Laboratuvar 40 mA'i aşınca uyarı verir. Çıkış pini modelde yaklaşık 25 Ω iç dirençle sürer.

## Laboratuvarda bağlantı
Laboratuvarı açınca Uno tuvalde hazır durur. Laboratuvar Uno'nun **5V**, **3V3** ve **GND** pinlerini otomatik besler, programı da otomatik yükler: ▶ **Derle ve çalıştır**, ■ durdurur, ↺ baştan başlatır (gerçek kartın Reset düğmesi gibi).

Parçaların uçlarını Uno'daki pin adlarına kablo çekerek bağlarsın (örneğin direnç **1** → **D13**). **GND, GND2 ve GND3** aynı düğümdür; hangisine bağlarsan bağla fark etmez.

## Tipik değerler
- Mantık gerilimi | 5 V | HIGH ≈ 5 V, LOW ≈ 0 V
- Dijital giriş eşiği | ≈ 2,5 V | Üstü HIGH, altı LOW okunur (laboratuvar modeli)
- Pin akımı (önerilen) | ≤ 20 mA | Mutlak sınır 40 mA
- ADC çözünürlüğü | 10 bit | 0-1023, basamak ≈ 4,9 mV
- INPUT_PULLUP direnci | ≈ 35 kΩ | Laboratuvar modeli
- Saat | 16 MHz | -
- Bellekler | 32 KB flash, 2 KB SRAM, 1 KB EEPROM | -

## Sık hatalar
- **`A0` ile `0`'ı karıştırmak.** `A0` analog giriş, `0` dijital pindir.
- **D0 ve D1'i parça için kullanmak.** Bu pinler seri haberleşmeyle paylaşılır; derslerde LED/buton için D2'den başla.
- **GND'yi unutmak.** Devre tamamlanmaz.
- **Bir pinden fazla akım çekmek.** Motor, röle ve büyük yükleri doğrudan pine bağlama.
- **Bir pine aynı anda iki çıkış bağlamak.** Biri HIGH, diğeri LOW sürerse kısa devre olur.
- **`pinMode` yazmayı unutmak.** Pin çıkış olmaz; LED çok sönük yanar ya da hiç yanmaz.

## İlgili dersler
- arduino-temelleri:1:1
- arduino-temelleri:1:3
- arduino-temelleri:1:4

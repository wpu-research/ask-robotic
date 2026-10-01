# Haberleşme protokolleri: UART, I2C, SPI karşılaştırması
süre: 30

## Merak
Bu hafta Arduino'na üç farklı yolla konuştun: bilgisayarla Serial üzerinden, RTC ve LCD ile I2C üzerinden, SD kartla SPI üzerinden. Hepsi "veri taşıyor" ama biri iki kablo kullanıyor, biri dört; biri bir cihazla konuşuyor, biri onlarca cihazla. Hangisi daha hızlı? Hangisini ne zaman seçmelisin? Bu derste her birinin hızını sayılarla bulup karşılaştıracaksın.

## Etkinlik
### Devre
Bu derste ek parça gerekmiyor; laboratuvarda yalnız Uno'yu kullanıyoruz ve programları düzenleyiciye yazıp ▶'e basıyorsun. Programlar **D4**'ü bir "ölçüm penceresi" olarak kullanır: ölçülen işin başında D4'ü HIGH, sonunda LOW yapar. Süreyi program içinde `micros()` ile ölçeriz. (Bilgi notu: gerçek bir devrede D4'e bir osiloskop ya da lojik analizör bağlansa aynı pencerenin süresini dışarıdan görürdük.) Laboratuvarda arka arkaya gelen pencerelerin arasındaki boşluk çok kısa olduğundan D4 tek uzun bir HIGH gibi görünebilir; aralarına `delay(20)` koyarsan ayrı pencereler görürsün.

| Pin | Görevi |
|---|---|
| D4 | Ölçüm penceresi |
| D0 (RX), D1 (TX) | UART |
| A4 (SDA), A5 (SCL) | I2C |
| D11 (MOSI), D12 (MISO), D13 (SCK), D10 (CS) | SPI |

D0 ve D1 gerçek kartta aynı zamanda USB üzerinden bilgisayarla konuşmak için kullanılır. Bu pinlere başka bir cihaz bağlıysa program yüklemekte ya da Serial Monitor'de sorun çıkabilir. Bu yüzden D0 ve D1'i başka iş için kullanmaktan kaçın.

### UART: iki kablo, ortak hız
**UART** (Serial) iki hatla çalışır: bir uçtan TX (gönder), karşı uçtan RX (al). Ortak bir saat hattı yoktur. Bu yüzden iki tarafın **baud hızını** (saniyede bit sayısı) önceden aynı seçmesi gerekir. Bir bayt şöyle gönderilir: 1 başlangıç biti, 8 veri biti, 1 bitiş biti. Yani bir bayt **10 bit** sürer. Bir bitin süresi `1 / baud` olur.

Ölçelim. Program üç hızda 100 tane `'U'` gönderir. `'U'` (0x55) bitleri sürekli değişen, "01010101" desenli bir karakterdir ve hat izlenirken kolay tanınır. Gönderme sırasında D4 HIGH kalır. Aynı süreyi program içinde `micros()` ile ölçeriz; gerçek kartta D4'e bağlı bir cihaz da aynı pencereyi görür.

```cpp
// sketch: uart_hiz
const int PENCERE = 4;                        // ölçüm penceresi: yazma süresince HIGH
const int BAYT = 100;
const long HIZLAR[] = {9600, 19200, 38400};
unsigned long sureUs[3];

void setup() {
  pinMode(PENCERE, OUTPUT);

  for (int i = 0; i < 3; i++) {
    Serial.begin(HIZLAR[i]);
    Serial.flush();
    digitalWrite(PENCERE, HIGH);
    unsigned long t0 = micros();
    for (int k = 0; k < BAYT; k++) {
      Serial.write('U');
    }
    Serial.flush();                           // son bit çıkana kadar bekle
    sureUs[i] = micros() - t0;
    digitalWrite(PENCERE, LOW);
    Serial.end();
  }

  Serial.begin(9600);
  Serial.println();
  for (int i = 0; i < 3; i++) {
    Serial.print(HIZLAR[i]);
    Serial.print(" baud: bit suresi ");
    Serial.print(sureUs[i] / (BAYT * 10.0), 1);
    Serial.println(" us");
  }
}

void loop() {
}
```

Gerçek bir bilgisayarda terminal 9600'dayken 19200 ve 38400 bölümlerinde ekranda anlamsız karakterler görürdün: gönderen ve alan hızlar aynı değildi. Bu UART'ın doğasıdır: hız önceden anlaşılır. Laboratuvarın seri monitörü hız farkını modellemez; 100 tane `U` hep düzgün görünür. Sonda ölçüm tablosu 9600'de yazdırılır.

Ölçüm sonucu:

| Baud | Bit süresi (hesap: 1/baud) | Ölçülen bit süresi | Bayt/s (baud ÷ 10) |
|---|---|---|---|
| 9600 | 104,2 µs | 104,4 µs | 960 |
| 19200 | 52,1 µs | 52,4 µs | 1920 |
| 38400 | 26,0 µs | 26,4 µs | 3840 |

Ölçülen değerler hesaptan biraz büyüktür (yüzde 2'nin altında). Küçük fark ölçüm yönteminden gelir: `micros()` 4 µs'lik adımlarla sayar, ayrıca döngü ve baytları sıraya koyma işi de süreye girer. 115200 baud için hesap 8,7 µs eder; bunu ölçmedik.

### I2C: iki kablo, adresle konuşma
**I2C** da iki hatla çalışır: SDA (veri) ve SCL (saat). UART'tan farkı, bir **saat hattı** olması ve cihazların **adresle** seçilmesidir (33. ders). Aynı iki kabloya RTC (0x68), LCD (0x27) ve başka cihazlar birlikte bağlanır. Saat hattının hızını `Wire.setClock()` ile seçersin. Arduino Uno'da bu hız, `TWBR` adlı bir yazmaca yazılan bölenle ayarlanır: `SCL = 16 MHz / (16 + 2 × TWBR × ön bölücü)`.

Program varsayılan hızı okur, sonra 100 kHz ve 400 kHz'i ayarlar ve yazmaçtan çıkan frekansı hesaplar. Bir I2C baytı 9 saat darbesi sürer (8 veri biti + 1 onay biti). Adres baytı ve bir veri baytı toplam 18 darbe eder; bunu da süreye çeviriyoruz.

```cpp
// sketch: i2c_hiz
#include <Wire.h>

const long ISTENEN[] = {100000, 400000};

long sclHz() {
  int onbolucu[] = {1, 4, 16, 64};
  int p = onbolucu[TWSR & 0x03];
  return F_CPU / (16L + 2L * TWBR * p);
}

void rapor(const char* etiket) {
  Serial.print(etiket);
  Serial.print(": TWBR=");
  Serial.print(TWBR);
  Serial.print("  SCL=");
  Serial.print(sclHz());
  Serial.println(" Hz");
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  rapor("varsayilan");

  for (int i = 0; i < 2; i++) {
    Wire.setClock(ISTENEN[i]);
    rapor("setClock");
    // adres baytı + 1 veri baytı = 2 bayt = 18 saat darbesi
    Serial.print("  2 baytlik aktarim ~ ");
    Serial.print(18.0e6 / sclHz(), 0);
    Serial.println(" us");
  }
}

void loop() {
}
```

Sonuç:

| Ayar | TWBR | SCL frekansı | 2 baytlık aktarım (hesap) |
|---|---|---|---|
| Varsayılan (`Wire.begin`) | 72 | 100 kHz | 180 µs |
| `setClock(100000)` | 72 | 100 kHz | 180 µs |
| `setClock(400000)` | 12 | 400 kHz | 45 µs |

Süreye başlangıç ve bitiş koşulları dahil değildir; gerçek aktarım biraz daha uzun sürer. Bu değerler yazmaçtan okunan ayarlardan **hesaplandı**; gerçek bir devrede SCL hattını osiloskopla ya da lojik analizörle ölçerek doğrulamak gerekirdi. 400 kHz hızı kullanmak için hattaki bütün cihazların bunu desteklemesi gerekir; cihazın veri sayfasına bak.

### SPI: dört kablo, çok hızlı
**SPI**'da ortak üç hat (SCK, MOSI, MISO) ve her cihaz için bir **CS** hattı vardır (67. ders). Saat hattı olduğu için hız serbesttir ve I2C'den çok yüksektir. Uno'da en yüksek SCK, işlemci saatinin yarısıdır: 16 MHz ÷ 2 = 8 MHz. Hızı iki yolla seçersin: eski `SPI.setClockDivider(...)` ya da yeni `SPISettings(hız, bitSırası, mod)`. Program her ayarda SPI yazmaçlarından (`SPCR`, `SPSR`) gerçek SCK frekansını hesaplar.

```cpp
// sketch: spi_hiz
#include <SPI.h>

long sckHz() {
  const int bolen[] = {4, 16, 64, 128, 2, 8, 32, 64};
  int dizin = (SPCR & 0x03) | ((SPSR & 0x01) ? 4 : 0);   // SPR1:SPR0 ve SPI2X
  return F_CPU / bolen[dizin];
}

void rapor(const char* etiket) {
  Serial.print(etiket);
  Serial.print(" -> SCK=");
  Serial.print(sckHz());
  Serial.println(" Hz");
}

void setup() {
  Serial.begin(9600);
  SPI.begin();

  SPI.setClockDivider(SPI_CLOCK_DIV4);
  rapor("DIV4 ");
  SPI.setClockDivider(SPI_CLOCK_DIV16);
  rapor("DIV16");
  SPI.setClockDivider(SPI_CLOCK_DIV128);
  rapor("DIV128");

  const long istenen[] = {250000, 1000000, 3000000, 8000000, 20000000};
  for (int i = 0; i < 5; i++) {
    SPI.beginTransaction(SPISettings(istenen[i], MSBFIRST, SPI_MODE0));
    Serial.print("istenen ");
    Serial.print(istenen[i]);
    Serial.print(" Hz");
    rapor("");
    SPI.endTransaction();
  }
}

void loop() {
}
```

Sonuç:

| İstenen | Kullanılan SCK |
|---|---|
| `SPI_CLOCK_DIV4` | 4 MHz |
| `SPI_CLOCK_DIV16` | 1 MHz |
| `SPI_CLOCK_DIV128` | 125 kHz |
| `SPISettings(250000, ...)` | 250 kHz |
| `SPISettings(1000000, ...)` | 1 MHz |
| `SPISettings(3000000, ...)` | **2 MHz** |
| `SPISettings(8000000, ...)` | 8 MHz |
| `SPISettings(20000000, ...)` | 8 MHz |

Dikkat: 3 MHz istediğinde 2 MHz'e düştü. Uno'da SCK yalnızca işlemci saatinin 2, 4, 8, ... katına bölünmüş hali olabilir (8, 4, 2, 1 MHz ...). `SPISettings` istediğin hızı aşmayan en yüksek değeri seçer. 20 MHz istenince de en fazla 8 MHz'e çıkılabilir.

Gerçek bir SPI aktarımı `SPI.transfer(değer)` ile yapılır; bu programda ona gerek duymadık çünkü yalnızca ayarlanan hızı okuyorduk.

### Üçünü yan yana koy
Aşağıdaki tablo bu derste okuduğun sayılarla genel bilgiyi birleştirir.

| | UART | I2C | SPI |
|---|---|---|---|
| Uno'da pin | 2 (RX, TX) | 2 (SDA, SCL) | 3 ortak (SCK, MOSI, MISO) + her cihaz için 1 CS |
| Saat hattı | Yok (hız önceden anlaşılır) | Var | Var |
| Bu derste okunan hız | 9600-38400 baud | 100 kHz, 400 kHz | 125 kHz - 8 MHz |
| Bir baytın bit sayısı | 10 | 9 | 8 |
| Cihaz sayısı | Genellikle 2 uç (birebir) | Aynı hatta çok cihaz, adresle (7 bit adres) | CS pini sayısı kadar |
| Mesafe (genel bilgi) | TTL seviyesinde kısa; uzun mesafe için RS-485 gibi başka elektrik standartları | Kısa; kablo uzadıkça hat kapasitesi sorun çıkarır | Kısa; hız yükseldikçe kablo boyu daha önemli olur |

100 baytı taşımak ne kadar sürer? Aşağıdaki süreler yukarıdaki bit sayılarından **hesaplandı** (başlangıç/bitiş payı ve adresleme dahil değil):

| Yol | Hesap | Süre |
|---|---|---|
| UART, 9600 baud | 100 × 10 bit ÷ 9600 | yaklaşık 104 ms |
| UART, 38400 baud | 100 × 10 bit ÷ 38400 | yaklaşık 26 ms |
| I2C, 100 kHz | 100 × 9 bit ÷ 100000 | 9 ms |
| I2C, 400 kHz | 100 × 9 bit ÷ 400000 | yaklaşık 2,3 ms |
| SPI, 4 MHz | 100 × 8 bit ÷ 4000000 | 0,2 ms |
| SPI, 8 MHz | 100 × 8 bit ÷ 8000000 | 0,1 ms |

Veri kaydedicin üçünü birden kullanacak: **UART** ile bilgisayara satır yazar, **I2C** ile RTC ve LCD'yi okur/yazar, **SPI** ile SD karta dosya yazar. Her iş için doğru yol farklıdır: saat ve ekran az veri taşır, I2C'nin iki kablosu yeter. SD kart çok veri taşır, SPI'nin hızı gerekir. Bilgisayarla konuşmak için ise zaten UART vardır.

### Dene
- `uart_hiz` programında `BAYT` değerini 200 yap. Bit süresi değişiyor mu? Neden değişmemeli? D4 penceresinin süresi nasıl değişir?
- `i2c_hiz` programında `ISTENEN` dizisindeki 100000 değerini 50000 yap. `TWBR` kaç oluyor, 2 baytlık aktarım kaç µs sürüyor? (Önce formülle hesapla, sonra ▶ ile karşılaştır.)
- `spi_hiz` programındaki `istenen` dizisinde 250000 yerine 500000 yaz. Hangi SCK hızı çıkıyor? 16 MHz'in kaça bölünmüş hali olduğunu hesapla.

### Sık yapılan hatalar
- UART'ta iki ucun baud hızını farklı seçmek: gerçek bağlantıda ekranda anlamsız karakterler çıkar.
- UART bağlantısında TX'i TX'e bağlamak: bir ucun TX'i diğer ucun RX'ine gitmeli.
- I2C'de iki cihazın aynı adresi kullanması (örneğin RTC ve MPU6050, ikisi de 0x68).
- I2C hattında hızı artırıp bütün cihazların bunu desteklediğini kontrol etmemek.
- SPI'da CS hattını unutmak ya da aynı anda iki cihazın CS'ini LOW yapmak.
- SPI'da ayarlanan hızı istenen hız sanmak: `SPISettings` istenen hıza en yakın **altındaki** değeri kullanır.
- 3,3 V ve 5 V seviyelerini karıştırmak: bazı SPI cihazlarının (SD kart gibi) belgesini oku.

## Konuşalım
Bir odada dört sensör, bir LCD ve bir SD kartın var. Hangisini hangi protokolle bağlarsın? Neden RTC için I2C, SD kart için SPI daha mantıklı?

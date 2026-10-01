# Proje: Sıcaklık ve nem veri kaydedici
süre: 35

## Merak
Sera, kuluçka makinesi, ilaç dolabı, müze vitrini: hepsinde sıcaklık ve nem günlerce izlenir, biri bakmadığı zaman bile. "Salı gecesi 03:10'da ne oldu?" sorusunun cevabı kayıt defterinde, yani bir veri dosyasındadır. Bu projede kendi veri kaydedicini yapacaksın: her 10 saniyede bir ölçüm alır, zaman damgalı bir CSV satırı üretir ve son ölçümü ekranda gösterir.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Bu modülün 3. haftası:** DHT22 ile sıcaklık ve nem (D5).
- **Modül 3:** `millis()` ile bloklamayan kod (27. ders), butonla kenar algılama ve sıçrama önleme (8. ders), I2C LCD ekran (32. ve 33. dersler).
- **Bu hafta:** RTC ile zaman (66), SD kart (67), CSV satırı ve zaman damgası (68), UART/I2C/SPI (69).

Kayıt cihazı RTC'nin saniyesi 10'a bölünen her an bir satır üretir: 08:30:10, 08:30:20, 08:30:30 ... Bu satırlar Serial'e gider. Butona (D2) basınca kayıt durur, tekrar basınca devam eder. Ekranda üstte son ölçüm, altta saat ve kayıt durumu görünür. SD karta yazan sürüm, projenin ayrı bir kopyasıdır.

### Devre
| Parça | Bağlantı |
|---|---|
| DHT22 | Veri → **D5**, VCC → 5 V, GND → GND |
| RTC modülü (DS3231, adres 0x68) | SDA → **A4**, SCL → **A5**, VCC → 5 V, GND → GND |
| I2C LCD 16x2 (adres 0x27) | SDA → **A4**, SCL → **A5**, VCC → 5 V, GND → GND |
| Buton "kayıt aç/kapat" | Bir ucu **D2**, öbür ucu GND (`INPUT_PULLUP`) |
| SD kart modülü (yalnız SD sürümü) | CS → **D10**, MOSI → **D11**, MISO → **D12**, SCK → **D13**, VCC → 5 V (modül belgesine bak), GND → GND |

RTC ve LCD aynı iki kabloyu (SDA, SCL) paylaşır; adresleri (0x68 ve 0x27) farklı olduğu için karışmazlar (69. ders). Bu hafta D11, D12, D13 SD kart içindir; bu projede o pinlere LED bağlama. Bu devrede MPU6050 yok, 0x68 yalnız RTC'nin.

### Program: Serial'e CSV yazan kaydedici
```cpp
// sketch: veri_kaydedici
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const int BUTON = 2;                          // kaydı durdur / sürdür
const uint32_t KAYIT_ARALIGI = 10;            // saniye
const unsigned long KONTROL_ARALIGI = 200;    // ms: RTC'ye bu sıklıkta bak

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 16, 2);

bool kayitAcik = true;
bool oncekiBasili = false;
unsigned long sonButon = 0;
unsigned long sonKontrol = 0;
uint32_t sonKayit = 0;                        // son satırın RTC saniyesi (unixtime)
uint32_t sonEkran = 0;                        // ekranın son güncellendiği saniye
float sonSicak = NAN;
float sonNem = NAN;

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

void kaydet(const String& satir) {
  Serial.println(satir);
}

void ekranYaz(DateTime t) {
  lcd.setCursor(0, 0);
  lcd.print("T:");
  if (isnan(sonSicak)) lcd.print("--"); else lcd.print(sonSicak, 1);
  lcd.print("C N:%");
  if (isnan(sonNem)) lcd.print("--"); else lcd.print(sonNem, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print(ikiHane(t.hour()));
  lcd.print(':');
  lcd.print(ikiHane(t.minute()));
  lcd.print(':');
  lcd.print(ikiHane(t.second()));
  lcd.print(kayitAcik ? " KAYIT    " : " DURDU    ");
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  lcd.init();
  lcd.backlight();
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();

  // Buton: basıldığı an kaydı aç/kapat (50 ms sıçrama koruması)
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonButon > 50) {
    sonButon = simdi;
    kayitAcik = !kayitAcik;
    sonEkran = 0;                             // ekranı hemen yenile
  }
  oncekiBasili = basili;

  if (simdi - sonKontrol >= KONTROL_ARALIGI) {
    sonKontrol = simdi;
    DateTime t = rtc.now();
    uint32_t u = t.unixtime();

    // RTC saniyesi aralığa tam bölünüyorsa ve bu saniye daha yazılmadıysa: satır üret
    if (kayitAcik && u % KAYIT_ARALIGI == 0 && u != sonKayit) {
      sonKayit = u;
      sonSicak = dht.readTemperature();
      sonNem = dht.readHumidity();
      kaydet(satirOlustur(t, sonSicak, sonNem));
    }

    if (u != sonEkran) {
      sonEkran = u;
      ekranYaz(t);
    }
  }
}
```

Serial Monitor'de şuna benzer bir çıktı görürsün:

```
zaman,sicaklik_C,nem_yuzde
2026-03-14 08:30:10,23.5,55.0
2026-03-14 08:30:20,23.5,55.0
2026-03-14 08:30:30,23.5,55.0
```

LCD'de üst satırda `T:23.5C N:%55.0`, alt satırda `08:30:34 KAYIT` gibi bir görüntü olur.

### Program: SD karta da yazan sürüm
Aşağıdaki program aynı kaydedicidir. Tek fark `kaydet()` fonksiyonu: satırı Serial'e yazmanın yanında SD karta da ekler. `setup()` içinde de SD başlatılır; dosya yeniyse başlık satırı yazılır. SD kart yoksa ya da yazma başarısızsa program çalışmaya devam eder ve Serial'e uyarı yazar.

```cpp
// sketch: veri_kaydedici_sd
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const int SD_CS = 10;
const char DOSYA_ADI[] = "VERI.CSV";          // 8.3 kuralı
const int BUTON = 2;                          // kaydı durdur / sürdür
const uint32_t KAYIT_ARALIGI = 10;            // saniye
const unsigned long KONTROL_ARALIGI = 200;    // ms: RTC'ye bu sıklıkta bak

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 16, 2);

bool kayitAcik = true;
bool oncekiBasili = false;
unsigned long sonButon = 0;
unsigned long sonKontrol = 0;
uint32_t sonKayit = 0;                        // son satırın RTC saniyesi (unixtime)
uint32_t sonEkran = 0;                        // ekranın son güncellendiği saniye
float sonSicak = NAN;
float sonNem = NAN;
bool sdHazir = false;

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

bool sdyeYaz(const String& satir) {
  File dosya = SD.open(DOSYA_ADI, FILE_WRITE);
  if (!dosya) return false;
  dosya.println(satir);
  dosya.close();                              // kapatınca veri karta yazılır
  return true;
}

void kaydet(const String& satir) {
  Serial.println(satir);
  if (sdHazir && !sdyeYaz(satir)) {
    Serial.println("UYARI: SD'ye yazilamadi");
  }
}

void ekranYaz(DateTime t) {
  lcd.setCursor(0, 0);
  lcd.print("T:");
  if (isnan(sonSicak)) lcd.print("--"); else lcd.print(sonSicak, 1);
  lcd.print("C N:%");
  if (isnan(sonNem)) lcd.print("--"); else lcd.print(sonNem, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print(ikiHane(t.hour()));
  lcd.print(':');
  lcd.print(ikiHane(t.minute()));
  lcd.print(':');
  lcd.print(ikiHane(t.second()));
  lcd.print(kayitAcik ? " KAYIT    " : " DURDU    ");
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  lcd.init();
  lcd.backlight();
  Serial.println("zaman,sicaklik_C,nem_yuzde");

  sdHazir = SD.begin(SD_CS);
  if (!sdHazir) {
    Serial.println("UYARI: SD kart yok, yalniz Serial'e yaziliyor");
  } else if (!SD.exists(DOSYA_ADI)) {
    sdyeYaz("zaman,sicaklik_C,nem_yuzde");    // dosya yeniyse başlığı yaz
  }
}

void loop() {
  unsigned long simdi = millis();

  // Buton: basıldığı an kaydı aç/kapat (50 ms sıçrama koruması)
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonButon > 50) {
    sonButon = simdi;
    kayitAcik = !kayitAcik;
    sonEkran = 0;                             // ekranı hemen yenile
  }
  oncekiBasili = basili;

  if (simdi - sonKontrol >= KONTROL_ARALIGI) {
    sonKontrol = simdi;
    DateTime t = rtc.now();
    uint32_t u = t.unixtime();

    // RTC saniyesi aralığa tam bölünüyorsa ve bu saniye daha yazılmadıysa: satır üret
    if (kayitAcik && u % KAYIT_ARALIGI == 0 && u != sonKayit) {
      sonKayit = u;
      sonSicak = dht.readTemperature();
      sonNem = dht.readHumidity();
      kaydet(satirOlustur(t, sonSicak, sonNem));
    }

    if (u != sonEkran) {
      sonEkran = u;
      ekranYaz(t);
    }
  }
}
```

SD kütüphanesi Uno için ucuz değildir. Bu dersin yazıldığı sırada, aynı programın derleme çıktısı SD'siz sürümde yaklaşık 570 bayt, SD'li sürümde yaklaşık 1290 bayt global değişken (RAM) kullandığını gösterdi. Uno'da toplam 2048 bayt SRAM var (34. ders). Flash kullanımı da yaklaşık 13 KB'dan 21 KB'a çıktı. Sayılar kütüphane ve derleyici sürümüne göre değişir; kendi derleme çıktına bak.

### Nasıl çalışıyor?
1. `loop()` hiç `delay` kullanmaz (27. ders). Buton her turda, RTC ise 200 ms'de bir okunur.
2. Satır üretme koşulu **RTC saniyesine** bağlıdır: `u % 10 == 0`, yani `unixtime` (1970'ten beri geçen saniye) 10'a tam bölünüyorsa. Bu yüzden satırlar `millis()` kaymasından etkilenmeden 08:30:10, 08:30:20 gibi tam 10 saniyelik adımlarla üretilir. `u != sonKayit` aynı saniye içinde 200 ms'lik turlarda satırın tekrar tekrar yazılmasını engeller.
3. Her satırda DHT22 yeniden okunur ve `sonSicak`, `sonNem` güncellenir. Ekran bu "son ölçümü" gösterir; saat satırı her saniye yenilenir.
4. `satirOlustur` 68. dersteki aynı fonksiyondur. Satır biçimi hiç değişmez; `kaydet()` fonksiyonu satırın nereye gideceğine karar verir.
5. Buton, 8. dersteki kenar algılamayla çalışır: yalnız "basılmadı → basıldı" geçişi sayılır, 50 ms içindeki tekrar basışlar yok sayılır. Kayıt durunca ekranda `DURDU` yazar ve satır üretilmez.
6. DHT okuması başarısız olursa `NaN` gelir; satır yine yazılır, sensör alanları boş kalır, ekranda `--` görünür.

Bir not: ekran ve kayıt için RTC'yi aynı turda tek kez okuyoruz (`t`). Bu yüzden aynı turda yazılan satır ile ekrandaki saat aynı anı gösterir.

### Dene
- `KAYIT_ARALIGI`'nı 30 yap. Satırlar hangi saniyelerde çıkıyor? 7 yaparsan satırlar saniyenin kaçında çıkıyor? 60'ı tam bölen değerlerde satırlar dakikanın hep aynı saniyelerine denk gelir; 7'de neden gelmez?
- Ekranın alt satırına saati değil tarihi (`14.03`) yazdır. Hangi satırı değiştireceksin?
- DHT22 okuması başarısız olduğunda (sensör kablosunu çıkar) ekranda ve CSV'de ne görüyorsun?
- `veri_kaydedici_sd` içinde `DOSYA_ADI`'nı 8.3 kuralına uymayan bir adla değiştir. Program ne yapıyor? Sonucu Serial'de gör.
- Sıcaklık 30 dereceyi geçince buzzer'ı (D8) çalan bir uyarı ekle. Hangi değişkeni kontrol edeceksin?

### Sık yapılan hatalar
- `delay(10000)` ile 10 saniye beklemek: buton ve ekran 10 saniye boyunca donar. Bunun yerine RTC ya da `millis()` kullan.
- RTC'yi `loop()`'un her turunda okumak ya da hiç okumamak: çok sık okumak I2C hattını gereksiz meşgul eder, çok seyrek okumak saniyeyi kaçırır.
- Aynı saniyede satırı birden çok kez yazmak: `u != sonKayit` kontrolünü unutursan 200 ms'lik her turda bir satır çıkar.
- RTC saatini ayarlamayı unutmak: satırlardaki zaman yanlış çıkar. 66. dersteki `lostPower()` kontrolünü ekle.
- SD'ye yazarken dosyayı kapatmamak ya da kartı yazma sırasında çıkarmak (67. ders).
- D11, D12, D13 pinlerine LED bağlayıp SD kartı da bağlamak: bu pinler SPI hatlarıdır.
- LCD adresinin 0x27 olduğunu varsaymak: çalışmazsa adres tarama programıyla (33. ders) bul.
- DHT22'yi iki saniyeden sık okumak.

## Konuşalım
Kaydedicini üç gün çalıştırdın ve elektrik bir gece kesildi. Sabah dosyada ne olduğunu, saatin doğru olup olmadığını ve kesinti sırasındaki ölçümlerin ne olacağını düşün. Cihazı güvenilir yapmak için neyi değiştirirdin?

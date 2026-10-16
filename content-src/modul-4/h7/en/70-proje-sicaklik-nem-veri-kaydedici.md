# Project: Temperature and humidity data logger
duration: 35

## Wonder
A greenhouse, an egg incubator, a medicine cabinet, a museum display case: in all of them, temperature and humidity are watched for days, even when nobody is looking. The answer to "what happened on Tuesday night at 03:10?" is in the log book, that is, in a data file. In this project you will make your own data logger: it takes a measurement every 10 seconds, produces a timestamped CSV row and shows the latest measurement on the screen.

## Activity
### What are we going to do?
This project brings together what you have learnt:
- **Week 3 of this module:** Temperature and humidity with the DHT22 (D5).
- **Module 3:** Non-blocking code with `millis()` (lesson 27), edge detection and debouncing with a button (lesson 8), the I2C LCD screen (lessons 32 and 33).
- **This week:** Time with the RTC (66), the SD card (67), the CSV row and timestamp (68), UART/I2C/SPI (69).

The logger produces a row at every moment when the RTC's seconds divide by 10: 08:30:10, 08:30:20, 08:30:30 ... These rows go to Serial. When you press the button (D2), logging stops; press it again and it carries on. The screen shows the latest measurement on top and the time and logging state underneath. The version that writes to the SD card is a separate copy of the project; because there is no SD card module in the lab, you study it as a reading example.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| DHT22 (Type: DHT22) | **DATA** → Uno **D5**, **VCC** → **5V**, **GND** → **GND** |
| RTC (address 0x68) | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → **5V**, **GND** → **GND** |
| I2C LCD 16x2 (I2C address property 0x27) | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → **5V**, **GND** → **GND** |
| Button "logging on/off" | **A** → Uno **D2**, **B** → **GND** (`INPUT_PULLUP`) |

An SD card module is only needed for the SD version (on a real module CS → D10, MOSI → D11, MISO → D12, SCK → D13). There is no SD part in the lab, so it is not added to the circuit.

The RTC and the LCD share the same two wires (SDA, SCL); because their addresses (0x68 and 0x27) are different, they do not get mixed up (lesson 69). This week D11, D12, D13 are for the SD card; do not connect LEDs to those pins in this project. There is no MPU6050 in this circuit, so 0x68 belongs only to the RTC.

### Program: a logger that writes CSV to Serial
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

On the Serial monitor you see output like this (because the lab's RTC starts from 2026-01-01 00:00:00, the rows run `2026-01-01 00:00:10`, `2026-01-01 00:00:20` ...):

```
zaman,sicaklik_C,nem_yuzde
2026-03-14 08:30:10,23.5,55.0
2026-03-14 08:30:20,23.5,55.0
2026-03-14 08:30:30,23.5,55.0
```

On the LCD you get something like `T:23.5C N:%55.0` on the top line and `08:30:34 KAYIT` (logging) on the bottom line.

### Program: the version that also writes to the SD card
The program below is the same logger. The only difference is the `kaydet()` (save) function: as well as writing the row to Serial, it also adds it to the SD card. SD is also started inside `setup()`; if the file is new, the header row is written. If there is no SD card, or writing fails, the program keeps running and writes a warning to Serial.

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

The SD library is not cheap for the Uno. The compile output of the same program showed about 570 bytes of global variables (RAM) for the version without SD, and about 1290 bytes for the version with SD. The Uno has 2048 bytes of SRAM in total (lesson 34). Flash use also went up from about 13 KB to 21 KB. The numbers change with the library and compiler version.

Because there is no SD module in the lab, if you run this version, `SD.begin` cannot find a card and gets stuck; after the header row, the screen and logging do not move on. On a real card, `SD.begin` returns `false`, and the program just writes a warning and keeps running.

### How does it work?
1. `loop()` never uses `delay` (lesson 27). The button is read on every pass, and the RTC every 200 ms.
2. The condition for producing a row depends on the **RTC's seconds**: `u % 10 == 0`, that is, if `unixtime` (the seconds since 1970) divides exactly by 10. That is why the rows are produced in exact 10-second steps such as 08:30:10, 08:30:20, unaffected by `millis()` drift. `u != sonKayit` (last record) stops the row being written again and again during the 200 ms passes within the same second.
3. For every row, the DHT22 is read again and `sonSicak` and `sonNem` (latest temperature, latest humidity) are updated. The screen shows this "latest measurement"; the time line is refreshed every second.
4. `satirOlustur` is the same function as in lesson 68. The row format never changes; the `kaydet()` function decides where the row goes.
5. The button works with the edge detection from lesson 8: only the "not pressed → pressed" change counts, and presses repeated within 50 ms are ignored. When logging stops, the screen shows `DURDU` (stopped) and no rows are produced.
6. If the DHT reading fails, `NaN` comes back; the row is still written, the sensor fields stay empty, and `--` appears on the screen.

One note: we read the RTC only once per pass (`t`), for both the screen and the log. That is why the row written in a pass and the time on the screen show the same moment.

### Try it
- Set `KAYIT_ARALIGI` (logging interval) to 30. At which seconds do the rows come out? If you set it to 7, at which seconds do they come out? With values that divide 60 exactly, the rows always fall on the same seconds of the minute; why do they not with 7?
- Print the date (`14.03`) instead of the time on the bottom line of the screen. Which line will you change?
- What happens when the DHT22 reading fails? Stop the program with ■, remove the DHT's DATA wire and press ▶ again. What do you see on the screen and in the CSV?
- In `veri_kaydedici_sd`, if you changed `DOSYA_ADI` (file name) to a name that does not follow the 8.3 rule, what would `sdyeYaz` (write to SD) return (on a real card), and which warning would the program write to Serial? Find out by reading the code.
- Add a buzzer warning (D8) that sounds when the temperature goes above 30 degrees: add a buzzer to the lab, write the code, and set the DHT's temperature to 31 °C live. Which variable will you check?
- Press the button to stop logging, wait 30 seconds, and press it again. What do the bottom line of the screen and the timestamps in the CSV show?

### Common mistakes
- Waiting 10 seconds with `delay(10000)`: the button and the screen freeze for 10 seconds. Use the RTC or `millis()` instead.
- Reading the RTC on every pass of `loop()`, or never reading it: reading too often keeps the I2C line busy for nothing, and reading too rarely misses the second.
- Writing the row more than once in the same second: if you forget the `u != sonKayit` check, a row comes out on every 200 ms pass.
- Forgetting to set the RTC's time: the time in the rows comes out wrong. On a real module, add the `lostPower()` check from lesson 66; in the lab the clock starts from 2026-01-01, and you can set it with `rtc.adjust` if you like.
- Not closing the file when writing to SD, or (on a real device) removing the card while writing (lesson 67).
- Connecting LEDs to pins D11, D12, D13 and using the SD card as well: these pins are the SPI lines.
- Assuming the LCD's address is 0x27: if it does not work, find the address with the address scanner program (lesson 33); in the lab, check that the LCD's "I2C address" property is 0x27.
- Reading the DHT22 more often than every two seconds.

## Discuss
You ran your logger for three days and the power went off one night. Think about what is in the file in the morning, whether the time is right, and what happens to the measurements during the power cut. What would you change to make the device reliable?

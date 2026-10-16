# Data logging: CSV and timestamps
duration: 30

## Wonder
You recorded the temperature of your room for a week. Now you want to draw a graph of it: does it get cold at night, does it warm up in the afternoon? For this the data needs to go into a table, that is, every row should say "when, how many degrees, what percentage humidity". The simplest form of this table file is **CSV**. In this lesson you will learn to produce tidy rows from the Arduino that any computer program can open.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| DHT22 (Type: DHT22) | **DATA** → Uno **D5** (as in lesson 46), **VCC** → **5V**, **GND** → **GND** |
| RTC | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → **5V**, **GND** → **GND** |

This lesson's programs only write to Serial; no SD card is needed. The last program (`csv_sd`) also writes to the SD card; there is no SD card module part in the lab, so study that program as a reading example (there is a note below).

### CSV and the timestamp
**CSV** (Comma-Separated Values) is a plain text file. Each row is a record, and the columns are separated by commas. The first row holds the column names:

```
zaman,sicaklik_C,nem_yuzde
2026-03-14 08:30:00,23.5,55.0
2026-03-14 08:30:05,23.5,55.1
```

The first column is the **timestamp**: the moment at which the measurement was made. We chose the format `yıl-ay-gün saat:dakika:saniye` (year-month-day hour:minute:second). This follows the international date format called ISO 8601 and is useful in two ways. First, it reads the same everywhere (one country reads 03.04.2026 as 3 April, another as 4 March). Second, **alphabetical order is time order**: because the year comes first, then the month, then the day, even if you sort the rows as text they line up in time order. For this to work, fields such as the month, day and hour must always be written with two digits (`03`, `08`).

### The function that builds the row: independent of the hardware
We put the row formatting in a function separate from the SD card, the RTC and the DHT:

`String satirOlustur(DateTime t, float sicak, float nem)`

The function takes a time and two numbers (temperature, humidity) and returns a piece of text. It touches no hardware. That is why it is easy to try with fixed values: first make sure the function produces the right row, then connect it to the real sensors. (We will use the same function when writing to SD, too.)

```cpp
// sketch: csv_fonksiyon
#include <RTClib.h>

String ikiHane(int n) {                  // 5 -> "05"
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {                   // 23.5 -> "23.5" (bir ondalık, nokta ile)
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);                         // yeri baştan ayır
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
  if (!isnan(sicak)) s += sayi(sicak);   // okuma başarısızsa alan boş kalır
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

void setup() {
  Serial.begin(9600);
  Serial.println("zaman,sicaklik_C,nem_yuzde");
  Serial.println(satirOlustur(DateTime(2026, 3, 14, 8, 30, 5), 23.5, 55.0));
  Serial.println(satirOlustur(DateTime(2026, 12, 1, 0, 0, 0), -2.5, 100.0));
  Serial.println(satirOlustur(DateTime(2026, 7, 9, 23, 59, 59), NAN, NAN));
}

void loop() {
}
```

The output looks like this:

```
zaman,sicaklik_C,nem_yuzde
2026-03-14 08:30:05,23.5,55.0
2026-12-01 00:00:00,-2.5,100.0
2026-07-09 23:59:59,,
```

In the third row we acted as if the sensor could not be read (`NAN`, not a number). The timestamp is written and the sensor columns are left empty. An empty field means "no value" in CSV, and the columns do not shift.

### Live data: RTC + DHT22
Now let's connect the function to the sensors. Every 5 seconds we read the time from the RTC and the temperature and humidity from the DHT22, and write the row to Serial. You should wait at least about 2 seconds between two DHT22 readings; 5 seconds is a comfortable interval. Because the lab's RTC starts from 2026-01-01 00:00:00, the rows' dates run `2026-01-01 00:00:00`, `2026-01-01 00:00:05` ...; you can select the DHT and change the temperature and humidity from the right panel while it runs.

```cpp
// sketch: csv_satir
#include <Wire.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const unsigned long OLCUM_ARALIGI = 5000;   // ms

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
unsigned long sonOlcum = 0;
bool ilkOlcum = true;

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

void setup() {
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();
  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {
    ilkOlcum = false;
    sonOlcum = simdi;
    float sicak = dht.readTemperature();
    float nem = dht.readHumidity();
    Serial.println(satirOlustur(rtc.now(), sicak, nem));
  }
}
```

`satirOlustur` stayed exactly the same; only `loop()` gives it the values read from the sensors. If you like, you can copy the rows from the Serial monitor, paste them into a text file on your computer named `VERI.CSV` and open it in a spreadsheet program; this part is outside the lab.

### The decimal separator and Excel
In CSV the comma separates the columns. So what if you also write the decimal number with a comma (`23,5`)? The row becomes `...,23,5,55,0` and a program takes it for 5 columns. The decimal separator changes from country to country: in Turkey it is a comma, in many countries it is a point. Depending on your computer's language setting, the spreadsheet program expects something different too. The general rule:

- **Decimal point + comma separator** (`23.5,55.0`): the standard in the programming world and in programs set to English.
- **Decimal comma + semicolon separator** (`23,5;55,0`): the format Excel usually expects on a computer set to Turkish.

You need to try on your own computer which one works for you, because this setting depends on the Excel version and the regional settings. Another way is to use the spreadsheet program's "import from text/CSV" feature instead of opening the file with a double click, and choose the separator yourself.

To produce the second format the function changes, but the logic is the same:

```cpp
// sketch: csv_tr
#include <RTClib.h>

const char AYRAC = ';';                    // Türkçe Excel'in sütun ayracı

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayiTR(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  String s(tampon);
  s.replace('.', ',');                     // ondalık ayırıcı virgül
  return s;
}

String satirOlusturTR(DateTime t, float sicak, float nem) {
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
  s += AYRAC;
  if (!isnan(sicak)) s += sayiTR(sicak);
  s += AYRAC;
  if (!isnan(nem)) s += sayiTR(nem);
  return s;
}

void setup() {
  Serial.begin(9600);
  Serial.println("zaman;sicaklik_C;nem_yuzde");
  Serial.println(satirOlusturTR(DateTime(2026, 3, 14, 8, 30, 5), 23.5, 55.0));
  Serial.println(satirOlusturTR(DateTime(2026, 12, 1, 0, 0, 0), -2.5, 100.0));
}

void loop() {
}
```

### Write the same row to the SD card
In the last step we write the row both to Serial and to the SD card. The lab has no SD card module, and `SD.begin` gets stuck when it cannot find a card; so when you run this program in the lab, it writes nothing. Read it as an example of logging that works on a real card. As you learnt in lesson 67, for every row we open the file, write and close. If the file is new (checked with `SD.exists`), we write the header row first. If no SD card is inserted, the program does not stop; it just keeps writing to Serial.

```cpp
// sketch: csv_sd
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <RTClib.h>
#include <DHT.h>

const int SD_CS = 10;
const int DHT_PIN = 5;
const unsigned long OLCUM_ARALIGI = 5000;   // ms
const char DOSYA_ADI[] = "VERI.CSV";        // 8.3 kuralı: en çok 8 harf + 3 harf uzantı

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
unsigned long sonOlcum = 0;
bool ilkOlcum = true;
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
  dosya.close();                            // kapatınca veri karta yazılır
  return true;
}

void setup() {
  Serial.begin(9600);
  rtc.begin();
  dht.begin();

  sdHazir = SD.begin(SD_CS);
  if (!sdHazir) {
    Serial.println("UYARI: SD kart yok, yalniz Serial'e yaziliyor");
  } else if (!SD.exists(DOSYA_ADI)) {
    sdyeYaz("zaman,sicaklik_C,nem_yuzde");    // dosya yeniyse başlığı yaz
  }
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();
  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {
    ilkOlcum = false;
    sonOlcum = simdi;
    String satir = satirOlustur(rtc.now(), dht.readTemperature(), dht.readHumidity());
    Serial.println(satir);
    if (sdHazir && !sdyeYaz(satir)) {
      Serial.println("UYARI: SD'ye yazilamadi");
    }
  }
}
```

### How does it work?
1. `ikiHane` (two digits) puts a 0 in front of single-digit numbers. That way `08:05:03` sorts properly.
2. `dtostrf(x, 1, 1, tampon)` turns a `float` into text: a width of at least 1 character, 1 decimal place. The AVR compiler's `sprintf` function does not support `%f` by default; that is why `dtostrf` is used.
3. `String s; s.reserve(40);` sets aside the room for the text from the start. In lesson 34 you saw that `String` can fragment the SRAM; a short-lived `String` with its room set aside from the start reduces this risk.
4. When the DHT reading fails, `readTemperature()` returns `NaN`. We catch this with `isnan` and leave the field empty. The row's timestamp is still written.
5. Because `satirOlustur` does not touch the hardware, we use the same function for both Serial and SD. When the place to write changes, the row format does not change.

### Try it
- Add a fourth test row to the `csv_fonksiyon` program: a temperature of 0.0 and a time whose seconds are 5. Are `0.0` and `05` written correctly in the output?
- In the `csv_satir` program, set `OLCUM_ARALIGI` (measurement interval) to 2000. Look at the time between the rows. Why should you not go below 2 seconds?
- If you like, copy the Serial monitor output and import it into a spreadsheet program on your computer. Were the columns separated correctly? If not, try the `csv_tr` format.
- While `csv_satir` is running, set the DHT's temperature to -5 °C. Do you see a minus sign and one decimal place in the row? Then stop with ■, remove the DHT's DATA wire and press ▶ again: what do the sensor columns look like in the rows?
- Add a third sensor column to the `satirOlustur` function: the temperature in Fahrenheit (`sicak * 9 / 5 + 32`). Do not forget to update the header row too.

### Common mistakes
- The number of columns in the header row being different from the number of columns in the data rows.
- Using a decimal comma and leaving the separator as a comma too: the number is split into two columns.
- Not writing fields such as the month, day and hour with two digits: the sorting goes wrong, and the spreadsheet program may not recognise the format.
- Writing separate formatting code for each place instead of using the same function for both Serial and SD: the format comes out different in the two places.
- Not closing the file when writing to SD (lesson 67).
- Choosing a file name longer than the 8.3 form.

## Discuss
Why does making the timestamp with `millis()` instead of the RTC (for example "123456 ms") not seem to do the job? How would someone who opens this file a year later know when the rows were written?

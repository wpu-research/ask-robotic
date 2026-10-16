# Project: weather station and watering alert
duration: 35

## Wonder
Nobody could water the tomato seedlings on the balcony during a weekend away. When everyone came back, the leaves were drooping. What if the board could have watched them and said "the soil has dried out, time to water"? In this project you will build a weather station: it will measure the temperature, humidity, pressure and altitude and show them page by page on a screen; and when the soil dries out, it will light an LED and warn you with a buzzer.

## Activity
### What will we do?
This project brings together what you have learned:
- **Module 3, lesson 18:** `tone` with a buzzer (D8).
- **Module 3, lessons 14 and 35:** calibration with `map`/`constrain`, and hysteresis.
- **Module 3, lessons 27 and 33:** non-blocking code with `millis()`, several devices on the I2C bus.
- **Lessons 46-49:** the DHT22, the BMP280, the soil moisture sensor and the multi-page LCD.

The system works like this: every 2 seconds the DHT22, the BMP280 and the soil moisture are read. The LCD shows three pages, changing every 3 seconds. When the soil moisture drops **below 30 %**, the watering alert starts: the LED lights up, the buzzer gives a short beep every 2 seconds and one line is written to the serial port. The alert ends when the soil rises to **40 %**. We use two separate thresholds (the hysteresis from lesson 35), so the alert does not keep switching on and off while the moisture wobbles around 30 %.

### Circuit
There is no pump or valve in this project; only an LED and a buzzer. Info note: if you add a real watering pump, you need a transistor or a relay and a separate power supply, as in lessons 22 and 24; no circuit is ever built with mains voltage (220 V).

Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| DHT (DHT22) | DATA → **D5**, VCC → 5V, GND → GND |
| BMP280 (address 0x76) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |
| I2C LCD (address 0x27) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |
| Soil moisture module | AO → **A2**, VCC → 5V, GND → GND |
| LED + 330 Ω resistor | **D13** → resistor pin 1; resistor pin 2 → LED A (anode); LED K (cathode) → GND |
| Passive buzzer | **D8** → buzzer +, buzzer − → GND (Type property Passive) |
| "Next page" button | A → **D2**, B → GND (`INPUT_PULLUP`) |

The LCD and the BMP280 share the same two wires (SDA, SCL); because their addresses are different (0x27, 0x76), they do not get mixed up. For the soil moisture, the numbers from lesson 48 apply: with the **Soil moisture** slider at 0 the raw value is about 921, and at 1 about 307; the program below assumes `KURU = 800` and `ISLAK = 350` (dry and wet). In that case the alert starts with the slider at about 0.41 and below (29 % and below), and ends at 0.5 and above (41 %).

### The alert logic
| State | Condition | Action |
|---|---|---|
| Normal | Soil moisture `%30` or above | LED off, buzzer silent |
| Normal → ALERT | If the moisture drops **below** `%30` | LED on, buzzer beeps, **one** line is written to the serial port |
| ALERT | Moisture between `%30` and `%40` | The alert continues (hysteresis) |
| ALERT → Normal | If the moisture rises to `%40` or above | LED off, buzzer silent, one line is written to the serial port |

### Program
```cpp
// sketch: hava_istasyonu
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int LED = 13;
const int BUZZER = 8;
const int BUTON = 2;

const int KURU = 800;                       // ham deger: kuru toprak
const int ISLAK = 350;                      // ham deger: islak toprak
const int ESIK_ALT = 30;                    // % - altina inince uyari
const int ESIK_UST = 40;                    // % - ustune cikinca uyari biter
const float P0_HPA = 1013.25;               // deniz seviyesi basinci

const int SAYFA_SAYISI = 3;
const unsigned long OLCUM_ARALIGI = 2000;   // ms (DHT icin en az 2 sn)
const unsigned long SAYFA_SURESI = 3000;    // ms
const unsigned long BIP_ARALIGI = 2000;     // ms
const unsigned long BIP_SURESI = 200;       // ms
const int BIP_HZ = 1000;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

float sicaklik = NAN;
float nem = NAN;
float hpa = NAN;
float rakim = NAN;
int toprakHam = 0;
int toprakYuzde = 0;

bool bmpHazir = false;
bool uyari = false;
int sayfa = 0;
bool oncekiBasili = false;
unsigned long sonOlcum = 0;
unsigned long sonSayfa = 0;
unsigned long sonBip = 0;
unsigned long sonBasis = 0;

// Sayiyi metne cevirir; gecersizse "--" verir.
const char* sayi(float v, int basamak, char* tampon) {
  if (isnan(v)) {
    return "--";
  }
  dtostrf(v, 1, basamak, tampon);
  return tampon;
}

// Seri porta sayi yazar; gecersizse "--".
void seriSayi(const char* ad, float v, int basamak) {
  Serial.print(ad);
  if (isnan(v)) {
    Serial.print("--");
  } else {
    Serial.print(v, basamak);
  }
}

void satirYaz(int satir, const char* metin) {
  char tampon[17];
  snprintf(tampon, sizeof(tampon), "%-16s", metin);
  lcd.setCursor(0, satir);
  lcd.print(tampon);
}

void sayfaCiz() {
  char ust[17];
  char alt[17];
  char a[10];
  char b[10];

  if (sayfa == 0) {
    snprintf(ust, sizeof(ust), "Sic: %s C", sayi(sicaklik, 1, a));
    snprintf(alt, sizeof(alt), "Nem: %s %%", sayi(nem, 1, b));
  } else if (sayfa == 1) {
    if (bmpHazir) {
      snprintf(ust, sizeof(ust), "P:%s hPa", sayi(hpa, 1, a));
      snprintf(alt, sizeof(alt), "Rakim: %s m", sayi(rakim, 0, b));
    } else {
      snprintf(ust, sizeof(ust), "BMP280 yok");
      snprintf(alt, sizeof(alt), " ");
    }
  } else {
    snprintf(ust, sizeof(ust), "Toprak: %%%d", toprakYuzde);
    snprintf(alt, sizeof(alt), "%s", uyari ? "SULAMA GEREKLI" : "Durum: NORMAL");
  }

  char baslik[17];
  char sonSatir[17];
  snprintf(baslik, sizeof(baslik), "%-13s%d/%d", ust, sayfa + 1, SAYFA_SAYISI);
  snprintf(sonSatir, sizeof(sonSatir), "%-15s%c", alt, uyari ? '!' : ' ');
  satirYaz(0, baslik);
  satirYaz(1, sonSatir);
}

void olcumYap() {
  nem = dht.readHumidity();
  sicaklik = dht.readTemperature();
  if (bmpHazir) {
    hpa = bmp.readPressure() / 100.0;
    rakim = bmp.readAltitude(P0_HPA);
  }
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(A2);
  }
  toprakHam = toplam / 8;
  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);
}

// Toprak nemine gore uyariyi acar/kapatir (histerezisli).
void uyariKontrol(unsigned long simdi) {
  if (!uyari && toprakYuzde < ESIK_ALT) {
    uyari = true;
    sonBip = simdi - BIP_ARALIGI;           // ilk bip hemen calsin
    digitalWrite(LED, HIGH);
    Serial.print("UYARI: toprak nemi %");
    Serial.print(toprakYuzde);
    Serial.println(" - sulama gerekli");
  } else if (uyari && toprakYuzde >= ESIK_UST) {
    uyari = false;
    digitalWrite(LED, LOW);
    noTone(BUZZER);
    Serial.print("Toprak nemi normale dondu: %");
    Serial.println(toprakYuzde);
  }
}

void seriDurum() {
  seriSayi("T=", sicaklik, 1);
  seriSayi(" N=", nem, 1);
  seriSayi(" P=", hpa, 1);
  seriSayi(" R=", rakim, 0);
  Serial.print(" Toprak=%");
  Serial.print(toprakYuzde);
  Serial.print(" Uyari=");
  Serial.println(uyari ? 1 : 0);
}

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  digitalWrite(LED, LOW);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  dht.begin();
  bmpHazir = bmp.begin(0x76);
  if (!bmpHazir) {
    Serial.println("BMP280 bulunamadi");
  }
  delay(1500);                              // DHT sensoru acilsin

  olcumYap();
  uyariKontrol(millis());
  seriDurum();
  sayfaCiz();
  sonOlcum = millis();
  sonSayfa = millis();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Buton: hemen sonraki sayfa
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 50) {
    sonBasis = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sonSayfa = simdi;
    sayfaCiz();
  }
  oncekiBasili = basili;

  // 2) Olcum, uyari ve seri cikti: 2 saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    olcumYap();
    uyariKontrol(simdi);
    seriDurum();
    sayfaCiz();
  }

  // 3) Sayfa degisimi: 3 saniyede bir
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }

  // 4) Uyari sirasinda buzzer: 2 saniyede bir kisa bip
  if (uyari && simdi - sonBip >= BIP_ARALIGI) {
    sonBip = simdi;
    tone(BUZZER, BIP_HZ, BIP_SURESI);
  }
}
```

### How does it work?
1. `olcumYap()` (take measurements) reads the three sensors and puts the values into global variables. If the DHT cannot be read, the value stays `NaN`; the screen and the serial port show it as `--`, and the program does not stop. If the BMP280 is not found, `bmpHazir` becomes false and the pressure page says `BMP280 yok` (no BMP280) (lesson 47).
2. As in lesson 48, the soil moisture is turned into a percentage from the average of 8 measurements with `map` and `constrain`.
3. `uyariKontrol()` (check alert) keeps a **state**: `uyari` (alert). When it is normal and the moisture drops below 30 per cent, it switches on; when it is on and the moisture rises to 40, it switches off. The alert line is written to the serial port only once, **when the state changes**; this way the Serial monitor does not fill up with the same message. The `T=... Uyari=1` status line, written every 2 seconds, keeps flowing, though.
4. The buzzer sounds for 200 ms with `tone(BUZZER, 1000, 200)`, and the program does not wait. It is repeated every 2 seconds with `sonBip` (last beep) (lesson 27). When the alert switches on, we wrote `sonBip = simdi - BIP_ARALIGI` so that the first beep plays straight away.
5. While there is an alert, a `!` appears in the bottom right corner of every LCD page; page 3 says `SULAMA GEREKLI` (watering needed). This way the user sees the alert whichever page they are on.
6. The four jobs (button, measurement, page, buzzer) each run on their own clock; there is no `delay` in `loop()`.

### What we checked in the lab
- With the Soil moisture slider at 0.6 (55 %), the LED is off, the buzzer is silent and only status lines flow on the serial port (`T=25.0 N=50.0 P=990.0 R=195 Toprak=%55 Uyari=0`; with the BMP280 slider at 990 hPa and the DHT at 25 °C and 50 %). The LCD pages turn every 3 seconds as `1/3`, `2/3`, `3/3`. The LCD and the BMP280 work on the same I2C bus.
- When you pull the slider down to 0.1 (0 %), within 2 seconds the LED lights up, a single `UYARI: toprak nemi %0 - sulama gerekli` line (alert: soil moisture 0 % - watering needed) is written to the serial port, and the buzzer plays beeps of about 200 ms at 1 kHz, 2 seconds apart. Page 3 shows `SULAMA GEREKLI`.
- When you raise the slider to 0.45 (34 %, between 30 and 40), the alert continues. When you raise it to 0.5 (41 %), the LED goes off, the buzzer goes quiet and the "normale dondu" (back to normal) line is written to the serial port.
- Right at the threshold: with the slider at 0.42 (30 %) there is no alert, and at 0.41 (29 %) there is.
- When the DHT and the BMP280 are not in the circuit (without adding these two parts to the canvas at all), the program does not crash: the screen shows `--` and `BMP280 yok`, the serial port shows `--`, and the soil alert still works.

### Try it
- Set `ESIK_ALT` and `ESIK_UST` (lower and upper threshold) to 30 % and 32 %. Move the Soil moisture slider back and forth between 0.42 and 0.44 (about 30 %-33 %): how many times does the alert switch on and off? Why are two thresholds better?
- Add a second button on D3: when pressed, it should silence the buzzer for 10 minutes while the LED stays on. Which variables do you need for this?
- Connect a Rain sensor to A0, as in lesson 48: when it is raining, do not give the watering alert even if the soil is dry. Where would you write this condition?

### Common mistakes
- Using a single threshold: when the moisture wobbles around the threshold, the LED and the buzzer switch on and off quickly, and the serial port fills up with lines.
- Writing the serial alert on every round: instead of catching the change of state, you keep printing the same message.
- Playing the buzzer with `delay`: the page change, the button and the measurement stop.
- Reading the DHT more often than every 2 seconds.
- Not measuring the soil sensor's dry/wet ends for the sensor you are using: the percentage calculation comes out wrong.
- Not being ready for the DHT22 to return `NaN`: `nan` appears on the screen, and the threshold comparisons go wrong.

## Discuss
If the soil moisture sensor breaks and always reads "dry", the system gives an alert for ever; if it always reads "wet", it never gives an alert. What check would you add to tell that the sensor has broken? What are the pros and cons of watering by time (twice a week) instead of by the sensor?

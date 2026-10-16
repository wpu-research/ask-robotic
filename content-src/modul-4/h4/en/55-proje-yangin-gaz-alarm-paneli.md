# Project: Fire and gas alarm panel
duration: 35

## Wonder
When you look at a building's fire panel, you see green, yellow and red lights; close by you hear a beep. Inside the panel there are sensors, decision logic and outputs. They all answer the same question: "What is the situation right now, and what should I do?" This week you will combine what you have learnt and build a panel like this. The gas and flame sensors will work together, the panel will give a three-level alarm and show the situation on a screen.

## Activity
### What are we going to do?
This project combines what you have learnt:
- **Lesson 51:** hysteresis with two thresholds, so the state values do not flicker.
- **Lesson 53:** warm-up for the MQ-2 and a baseline in clean air; thresholds as multiples of the baseline.
- **Lesson 54:** `enum Seviye` and the same `seviyeBul` function for every sensor.
- **Module 3:** non-blocking code with `millis()` (27), the relay (24), the I2C LCD (32-33), the buzzer (18), temperature with an NTC (13).

The panel makes the **worst** of the levels from the three sensors the overall state. The overall state drives three things: the LEDs, the buzzer and the screen. The relay also depends on the gas level.

### Safety note
- Never build a circuit with mains voltage (220 V) on a real relay. In this project the relay only drives a 5 V LED; this LED stands for the ventilation fan.
- There is no real gas or flame in this lesson; you give the sensor values from the properties panel. Certified alarm devices are used to protect real lives and property; this project is for learning.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| MQ-2 gas sensor module | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** |
| Flame sensor module | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A1** |
| NTC thermistor (optional) | Lead **1** → **A2**, lead **2** → **GND** |
| Resistor (10000 Ω; for the NTC) | Lead **1** → **5V**, lead **2** → **A2** |
| Resistor (330 Ω) + LED (normal; green) | **D11** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| Resistor (330 Ω) + LED (warning; yellow) | **D12** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| Resistor (330 Ω) + LED (danger; red) | **D13** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| Buzzer (**Type: Active** in the properties panel) | **+** → **D8**, **-** → **GND** |
| Relay module | **VCC** → **5V**, **GND** → **GND**, **IN** → **D7** |
| Resistor (330 Ω) + LED in place of the ventilation fan | Relay **COM** → **5V**; relay **NO** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| I2C LCD 16x2 | **SDA** → **A4**, **SCL** → **A5**, **VCC** → **5V**, **GND** → **GND** (address 0x27) |

If you are not adding the NTC to the canvas, set `ISI_VAR = false` in the program; if A2 is left unconnected, random values are read and the lab gives a "floating input" warning. If your flame sensor works the other way round, change the `ALEVDE_DUSER` value as in lesson 54; on the lab's flame module the value drops with a flame, so `true` is correct. If the relay works backwards, swap `HIGH` and `LOW`, or check the relay's **Trigger** property.

### Levels and outputs
| Overall state | LED | Buzzer (D8) | Relay (D7, fan) | Screen line |
|---|---|---|---|---|
| NORMAL | Green | Silent | Off if gas is NORMAL | `DURUM: NORMAL` |
| UYARI | Yellow | Slow beep (one short beep a second) | On if gas is UYARI/TEHLIKE | `DURUM: UYARI` |
| TEHLIKE | Red | Continuous | On if gas is UYARI/TEHLIKE | `DURUM: TEHLIKE` |

The levels of the three sensors are found separately with `seviyeBul`:

| Sensor | Quantity | UYARI on / off | TEHLIKE on / off |
|---|---|---|---|
| Gas (A3) | reading, relative to the baseline | baseline×1.5 / baseline×1.25 | baseline×2.5 / baseline×2 |
| Flame (A1) | intensity (lesson 54) | 300 / 250 | 600 / 500 |
| Heat (A2, optional) | °C (whole number) | 45 / 42 | 60 / 55 |

The relay depends on the gas level: the fan runs until the gas is back to clean air (until the gas level is NORMAL). The relay does not need a separate hysteresis, because the gas level itself already has hysteresis.

When the panel is switched on, it first **warms up** (`ISINMA` on the screen), then measures the gas baseline in clean air. In the lab we kept the warm-up short (4 seconds); for a real MQ-2 use a much longer time. Until the warm-up and the baseline measurement are over (about 5 seconds), the **Gas level** must stay at 0; then `gazBaz` is about 102.

To test the panel, give these values from the properties panel after the warm-up is over:

| What you want to do | Value |
|---|---|
| Gas UYARI | MQ-2 **Gas level** 0.1 (reading about 194; threshold about 153) |
| Gas TEHLIKE | MQ-2 **Gas level** 0.3 (reading about 379; threshold about 255) |
| Flame UYARI | Flame sensor **Flame intensity** 0.4 (intensity about 389; threshold 300) |
| Flame TEHLIKE | Flame sensor **Flame intensity** 0.8 (intensity about 777; threshold 600) |
| Heat UYARI / TEHLIKE | NTC **Temperature** 50 °C / 70 °C |

### Program
```cpp
// sketch: yangin_gaz_paneli
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int ALEV_PIN = A1;
const int NTC_PIN = A2;
const int GAZ_PIN = A3;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;
const int BUZZER = 8;
const int ROLE = 7;

const bool ALEVDE_DUSER = true;
const bool ISI_VAR = true;
const unsigned long ISINMA_MS = 4000;     // ders için kısa; gerçekte çok daha uzun
const unsigned long OLCUM_ARALIGI = 100;  // ms
const unsigned long EKRAN_ARALIGI = 250;  // ms

enum Seviye { NORMAL, UYARI, TEHLIKE };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Seviye gaz = NORMAL;
Seviye alev = NORMAL;
Seviye isi = NORMAL;
Seviye genel = NORMAL;
int gazBaz = 100;
int gazDeger = 0;
int alevDeger = 0;
int isiDeger = 25;
unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;

int ortalama(int pin) {
  long toplam = 0;
  for (int i = 0; i < 4; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 4;
}

int alevSiddeti() {
  int ham = ortalama(ALEV_PIN);
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

int sicaklikOku() {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NTC_PIN);
  }
  float adc = toplam / 8.0;
  if (adc < 1.0) adc = 1.0;
  if (adc > 1022.0) adc = 1022.0;
  float direnc = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);
  return (int)(kelvin - 273.15 + 0.5);
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

Seviye enKotu(Seviye a, Seviye b) {
  return (a > b) ? a : b;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI  ";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL ";
}

char seviyeHarfi(Seviye s) {
  if (s == UYARI) return 'U';
  if (s == TEHLIKE) return 'T';
  return 'N';
}

void gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {
  if (eski == yeni) return;
  Serial.print(ad);
  Serial.print(": ");
  Serial.print(seviyeAdi(yeni));
  Serial.print(" deger=");
  Serial.println(deger);
}

void seviyeleriGuncelle() {
  gazDeger = ortalama(GAZ_PIN);
  alevDeger = alevSiddeti();

  Seviye yeniGaz = seviyeBul(gaz, gazDeger,
                             gazBaz * 3 / 2, gazBaz * 5 / 4,
                             gazBaz * 5 / 2, gazBaz * 2);
  Seviye yeniAlev = seviyeBul(alev, alevDeger, 300, 250, 600, 500);
  Seviye yeniIsi = isi;
  if (ISI_VAR) {
    isiDeger = sicaklikOku();
    yeniIsi = seviyeBul(isi, isiDeger, 45, 42, 60, 55);
  }

  gecisYaz("GAZ", gaz, yeniGaz, gazDeger);
  gecisYaz("ALEV", alev, yeniAlev, alevDeger);
  gecisYaz("ISI", isi, yeniIsi, isiDeger);
  gaz = yeniGaz;
  alev = yeniAlev;
  isi = yeniIsi;

  Seviye yeniGenel = enKotu(gaz, enKotu(alev, isi));
  if (yeniGenel != genel) {
    genel = yeniGenel;
    Serial.print("DURUM: ");
    Serial.println(seviyeAdi(genel));
  }
}

void ciktilariSur(unsigned long simdi) {
  digitalWrite(LED_YESIL, genel == NORMAL);
  digitalWrite(LED_SARI, genel == UYARI);
  digitalWrite(LED_KIRMIZI, genel == TEHLIKE);

  bool bip = false;
  if (genel == TEHLIKE) {
    bip = true;                          // sürekli
  } else if (genel == UYARI) {
    bip = (simdi % 1000) < 150;          // saniyede bir kısa bip
  }
  digitalWrite(BUZZER, bip);

  digitalWrite(ROLE, gaz != NORMAL);     // fan: gaz temizlenene kadar
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  lcd.print("DURUM: ");
  lcd.print(seviyeAdi(genel));
  lcd.print("  ");
  lcd.setCursor(0, 1);
  lcd.print("G:");
  lcd.print(seviyeHarfi(gaz));
  lcd.print(" A:");
  lcd.print(seviyeHarfi(alev));
  lcd.print(" I:");
  lcd.print(ISI_VAR ? seviyeHarfi(isi) : '-');
  lcd.print("     ");
}

void setup() {
  pinMode(LED_YESIL, OUTPUT);
  pinMode(LED_SARI, OUTPUT);
  pinMode(LED_KIRMIZI, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(ROLE, OUTPUT);
  digitalWrite(ROLE, LOW);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ISINMA...       ");
  lcd.setCursor(0, 1);
  lcd.print("Temiz havada kal");

  while (millis() < ISINMA_MS) {
    digitalWrite(LED_YESIL, (millis() / 250) % 2);   // yanıp söner
  }

  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ_PIN);
    delay(20);
  }
  gazBaz = toplam / 32;
  if (gazBaz < 20) gazBaz = 20;
  Serial.print("gazBaz=");
  Serial.println(gazBaz);

  seviyeleriGuncelle();
  ciktilariSur(millis());
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    seviyeleriGuncelle();
  }

  ciktilariSur(simdi);

  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranYaz();
  }
}
```

### How does it work?
1. `setup` first switches on the screen and waits for the warm-up. Meanwhile the green LED blinks. Then the average of 32 readings in clean air becomes `gazBaz` (gas baseline).
2. Every 100 ms, `seviyeleriGuncelle()` (update levels) reads the three sensors and calls the **same** `seviyeBul` function three times with different thresholds. Adding a new sensor takes one line.
3. `genel` (overall) is the `enKotu` value of the three levels. If one sensor says TEHLIKE, the panel becomes TEHLIKE; when they are all NORMAL, the panel becomes NORMAL.
4. The levels decide the outputs directly (`ciktilariSur`, drive outputs). There is no code that changes the outputs anywhere else; this reduces bugs in state machines.
5. The slow beep is made with `simdi % 1000 < 150`: the buzzer sounds in the first 150 ms of every second. There is no `delay`, so `loop` keeps going round.
6. Coming back down (TEHLIKE → UYARI → NORMAL) happens with hysteresis for every sensor. If the value wobbles near a threshold, the level and the outputs do not flicker.
7. The relay depends only on the **gas** level. Even if the panel is TEHLIKE, if the gas is NORMAL (for example there is a flame but no gas), the fan does not run.
8. The screen is refreshed every 250 ms; `lcd.print` prints spaces at the end of each line so that no old characters are left behind.
9. The serial monitor only prints when a level changes; it reads like an event log.

### Try it
- Set `ISI_VAR = false` and delete the NTC (and its resistor) from the canvas. Does the panel work with just gas and flame? What do you see on the second line of the screen?
- Break the flame sensor's direction by setting `ALEVDE_DUSER = false`. How does the panel behave in a normal room?
- Change the buzzer pattern for UYARI: on for 100 ms, off for 400 ms (`simdi % 500 < 100`). Can you write a "two short beeps, one pause" pattern for TEHLIKE?
- What happens if you delete the NTC's A2 wire? (Hint: check the extreme values of `adc`.) Would you add a `SENSOR HATASI` (sensor error) level to the panel?

### Common mistakes
- Skipping the warm-up and the baseline: the panel either alarms all the time or never alarms.
- Measuring the baseline in air that contains gas: the thresholds end up far too high, and a real rise in gas does not raise the alarm.
- Making the off threshold the same as the on threshold: the level and the buzzer flicker.
- Using the same output for `NORMAL` and `UYARI`, so you cannot tell one from the other.
- Using the relay with mains voltage: never do this in this project.
- Driving the outputs (LEDs, buzzer, relay) from different places: the level and the outputs get out of step.
- In a real circuit, placing the sensor so that it looks straight at sunlight or a heater: it gives false alarms (the lab does not model this).

## Discuss
Running the fan when gas is detected makes sense, but when there is a fire (flame TEHLIKE), should the fan behave the same way? Who sets the rules in a real panel? What information do you need before you can answer these questions?

# Project: Parking sensor (LED + buzzer + LCD)
duration: 35

## Wonder
You have probably heard the "beep... beep... beep.beep.beep.beeeep" sound as a car reverses into a garage. As the beeps get closer together, you know you are getting nearer the wall; when it sounds without stopping, it means stop. Being able to sense distance just by sound, without looking at a screen at all, is a brilliant idea. Now you are going to build this system yourself.

## Activity
### What are we going to make?
This project brings together pieces from this week and from earlier modules:
- **This week (36-38):** the `pulseIn` measurement with the HC-SR04, working out centimetres and the 5-element **median filter**.
- **Module 3, week 6:** non-blocking code with `millis()`. The measurement, the screen and the beep do not wait for one another.
- **Module 3, week 7:** the I2C LCD screen (0x27).
- **Module 3, week 3:** turning one range into another with `map()`.

How the system behaves:

| Distance | LED | Buzzer (D8) | LCD bottom line |
|---|---|---|---|
| 100 cm and above | Green | Silent | GUVENLI |
| 50 - 100 cm | Green | Slow beep | GUVENLI |
| 20 - 50 cm | Yellow | Beeps getting faster | YAKLASIYOR |
| Less than 20 cm | Red | Continuous sound | DUR! |

(On the screen, GUVENLI means "safe", YAKLASIYOR means "getting close" and DUR! means "stop!".)

The beep interval depends on the distance: 800 ms at 100 cm, 100 ms at 20 cm. In between, it is worked out in proportion with `map()`. Each beep lasts 40 ms.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 GND | Uno **GND** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |
| Buzzer **+** | Uno **D8** |
| Buzzer **-** | Uno **GND** |
| Green LED + 330 Ω resistor | Uno **D11** → resistor **1**; resistor **2** → LED **A**; LED **K** → Uno **GND** |
| Yellow LED + 330 Ω resistor | Uno **D12** → resistor **1**; resistor **2** → LED **A**; LED **K** → Uno **GND** |
| Red LED + 330 Ω resistor | Uno **D13** → resistor **1**; resistor **2** → LED **A**; LED **K** → Uno **GND** |
| I2C LCD 16x2 | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → Uno **5V**, **GND** → Uno **GND** |

Select the buzzer and set **Type** to **Active** in the right panel (the default is "Passive", which needs `tone()`). Set the LED colours in the properties panel too (green, yellow, red). The LCD's I2C address is shown in the panel; it must be the same as in the code (0x27).

An active buzzer has its own oscillator inside: it sounds when you give the pin HIGH and goes quiet when you give it LOW. If you are using a passive buzzer, you need `tone()` instead of `digitalWrite` (lesson 18). Note: the current of a real buzzer can be close to the pin's limits; a module with a driver or a resistor that suits the datasheet is used.

### Program
The system does five jobs, and none of them has a long `delay`:
1. It measures the distance every 60 ms.
2. It puts the measurement in the window and takes the median (the filtered distance).
3. It chooses the LEDs according to the filtered distance.
4. It makes the buzzer silent, beeping or continuous according to the distance.
5. It updates the LCD every 250 ms.

```cpp
// sketch: park_sensoru
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int TRIG = 9;
const int ECHO = 10;
const int BUZZER = 8;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;

const float MENZIL = 400.0;               // yankı yok: uzak say
const float BIP_BASLANGIC = 100.0;        // bundan yakında bip başlar
const float SARI_MESAFE = 50.0;           // bundan yakında sarı
const float DUR_MESAFE = 20.0;            // bundan yakında sürekli ses
const unsigned long OLCUM_ARALIGI = 60;   // ms
const unsigned long EKRAN_ARALIGI = 250;  // ms
const unsigned long BIP_SURESI = 40;      // ms
const int N = 5;

LiquidCrystal_I2C lcd(0x27, 16, 2);

float pencere[N];
int sira = 0;
float mesafe = MENZIL;                    // filtreli mesafe

unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;
unsigned long bipBasla = 0;
bool bipAcik = false;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float medyan(float a[], int n) {
  float b[N];
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];
}

void ledGuncelle() {
  digitalWrite(LED_YESIL, mesafe >= SARI_MESAFE);
  digitalWrite(LED_SARI, mesafe >= DUR_MESAFE && mesafe < SARI_MESAFE);
  digitalWrite(LED_KIRMIZI, mesafe < DUR_MESAFE);
}

void buzzerGuncelle(unsigned long simdi) {
  if (mesafe >= BIP_BASLANGIC) {          // uzak: sessiz
    digitalWrite(BUZZER, LOW);
    bipAcik = false;
    return;
  }
  if (mesafe < DUR_MESAFE) {              // çok yakın: sürekli ses
    digitalWrite(BUZZER, HIGH);
    bipAcik = true;
    return;
  }
  // 20-100 cm arası: bip aralığı 100-800 ms
  unsigned long aralik = map((long)mesafe, 20, 100, 100, 800);
  if (bipAcik) {
    if (simdi - bipBasla >= BIP_SURESI) {
      digitalWrite(BUZZER, LOW);
      bipAcik = false;
    }
  } else if (simdi - bipBasla >= aralik) {
    digitalWrite(BUZZER, HIGH);
    bipAcik = true;
    bipBasla = simdi;
  }
}

void ekranGuncelle() {
  char sayi[8];
  lcd.setCursor(0, 0);
  lcd.print("Mesafe:");
  if (mesafe >= MENZIL) {
    lcd.print("   ---");
  } else {
    dtostrf(mesafe, 6, 1, sayi);          // 6 karakter genişlikte, 1 ondalık
    lcd.print(sayi);
  }
  lcd.print(" cm");                       // toplam tam 16 karakter

  lcd.setCursor(0, 1);
  if (mesafe < DUR_MESAFE) lcd.print("DUR!            ");
  else if (mesafe < SARI_MESAFE) lcd.print("YAKLASIYOR      ");
  else lcd.print("GUVENLI         ");
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_YESIL, OUTPUT);
  pinMode(LED_SARI, OUTPUT);
  pinMode(LED_KIRMIZI, OUTPUT);
  digitalWrite(BUZZER, LOW);

  lcd.init();
  lcd.backlight();

  float ilk = tekOlcum();
  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur
  mesafe = ilk;
  ledGuncelle();
  ekranGuncelle();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    pencere[sira] = tekOlcum();
    sira = (sira + 1) % N;
    mesafe = medyan(pencere, N);
    ledGuncelle();
  }

  buzzerGuncelle(simdi);                  // her turda: bip zamanlaması hassas

  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranGuncelle();
  }
}
```

### How does it work?
1. **Three clocks, three jobs:** `sonOlcum` (last measurement) runs the measurement, `sonEkran` (last screen) the screen and `bipBasla` (beep start) the beep. Each one checks its own interval with `millis()` (lesson 27). None of them waits for another.
2. **Filter:** the raw measurement is not used directly. The median of five measurements becomes `mesafe` (distance) (lesson 38). This way a single wrong reading does not spoil the beep.
3. **Beep interval:** `map((long)mesafe, 20, 100, 100, 800)` turns 20 cm into 100 ms and 100 cm into 800 ms. For 60 cm the result is 450 ms: the beeps start 450 ms apart.
4. **Beep length:** each beep stays on for 40 ms, then the buzzer goes quiet. The next beep starts `aralik` (interval) after `bipBasla`.
5. **Continuous sound:** if the distance is less than 20 cm, the buzzer pin stays HIGH all the time; there are no edges, so it is a steady sound.
6. **Screen:** `dtostrf(mesafe, 6, 1, sayi)` turns the decimal number into right-aligned text 6 characters wide. Because the line is exactly 16 characters every time, old characters do not stay on the screen. We update the screen every 250 ms; an LCD is a slow device, and writing to it every time round would upset the beep timing.
7. **No echo:** `tekOlcum` returns 400 if no echo comes back; in this case the screen shows `---`, the system is silent and green lights up.

Reaction time: because of the median filter, if the distance changes suddenly, the system reacts after 3 measurements, so about 180 ms later. At parking speeds (around walking speed) this is an acceptable price.

### Try it
- Set `BIP_SURESI` (beep length) to 100 ms. Do the beeps run into each other at around 20 cm?
- What happens if the LED flickers at the yellow and red boundaries (if the measurement goes back and forth between 19.9 and 20.1)? Apply the hysteresis idea from the thermostat here: switch to red at 20 cm, and leave red at 25 cm.
- Build the NTC circuit from lesson 13 (10 kΩ and NTC, middle point to A2) and correct the speed of sound for the temperature (the formula from lesson 36). Set the NTC's Temperature property to 0 °C and 35 °C and print the corrected distance in the serial monitor. The HC-SR04 in the lab works with a fixed speed of sound; this correction really makes a difference on a real sensor, and here you are only trying out the calculation.
- Slowly slide the Distance property from 150 cm down to 15 cm. At what distances do the LED colours, the beep rate and the LCD text change? Do they match the table?
- For a passive buzzer, use `tone(BUZZER, 2000)` instead of `digitalWrite(BUZZER, HIGH)`, and `noTone(BUZZER)` to silence it.

### Common mistakes
- Using `delay()` for the beep: the measurement, the screen and the other jobs stop for the length of the beep. Every job should run on its own clock with `millis()`.
- Updating the LCD every time round: I2C communication takes a long time and the beep rhythm gets upset.
- Not padding the LCD line out to exactly 16 characters: when it goes down from "100.0 cm" to "45.3 cm", old characters stay on the screen.
- Deciding with the raw measurement without a filter: a single outlier brings a short silence or the wrong colour.
- Treating the no-echo case (`0`) as a distance: the system says "0 cm" and sounds all the time. We left it silent by making it 400 cm; but in a real vehicle it is safer to give a separate warning that "the sensor cannot measure".
- Not setting the buzzer's Type property to "Active": a passive buzzer makes no sound with `digitalWrite`.
- Note: in a real vehicle, a surface closer than 2 cm to the sensor (the bumper, a cable) causes constant wrong measurements. Also, powering loads such as a servo, motor or fan from the same power line as the sensor spoils the measurement with voltage drops; they are powered separately and the GNDs are joined together.

## Discuss
A real car would have four sensors side by side on the rear bumper. If the sensors measure at the same time, they can hear each other's sound. How would you prevent this? What would be the cost of making the sensors measure one after another?

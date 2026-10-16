# Soil moisture, rain and water level (analogue)
duration: 25

## Wonder
The geranium at home is watered once a week, but some weeks it gets water while the soil is still wet, and other weeks it dries out and turns yellow. Instead of poking your finger into the soil to check, a sensor can turn the moisture into a number. The same method also measures rain and how full a tank is. All three are analogue sensors: you read them with `analogRead`, just as you did with the potentiometer in lesson 11. The real job is turning the raw number into a meaningful percentage.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Soil moisture module | VCC → 5V, GND → GND, AO → **A2** |
| Rain sensor | VCC → 5V, GND → GND, AO → **A0** |
| Water level sensor | VCC → 5V, GND → GND, AO → **A1** |

All three modules have an analogue output (AO). The sliders in the right panel set the physical quantity: **Soil moisture** (how wet the surface is), **Wetness (rain)** (how much rain has fallen on the board) and **Water level** (how much of the stick is in water). All of them go from 0 to 1. We do not use the modules' DO outputs in this lesson.

The three sensors work in different directions; you will read this from the raw numbers:
- **Soil moisture** and **rain sensor:** the wetter they get, the more AO **drops** (high when dry, low when wet).
- **Water level:** the higher the water rises, the more AO **rises** (as the bare tracks on the stick go under water).

### Two kinds of soil moisture sensor
- **Resistive sensor:** It has two bare metal prongs that go into the soil. When the soil is moist, the resistance between the prongs changes, and you read that. Because current keeps flowing through the prongs, the metal **wears away and rusts** over time; these sensors do not last long. A common way to reduce the current is to power the sensor only at the moment of measuring instead of all the time; look at the datasheet for the module's supply current.
- **Capacitive sensor:** The prongs are covered with an insulator and do not pass current straight into the soil. It measures the effect of the soil's moisture on capacitance. It usually lasts longer.

**The output direction depends on the module.** Most ready-made modules give a high value when dry and a low value when wet; but on some it can be the other way round, and the numbers differ from maker to maker. So there is no rule like "wet = big number". You must learn the direction and the numbers for each sensor by measuring it dry and wet. On the Soil moisture module in the lab, the raw value is about 921 with the slider at 0 (dry) and about 307 at 1 (wet); so it is high when dry and low when wet. We assume this direction in this lesson too; we will also adapt the code for a sensor that works the other way.

### Program 1: percentage from the dry and wet ends
The idea of calibration (lesson 14): measure the two end values, turn them into a percentage with `map`, and keep it between 0 and 100 with `constrain`. `map` also works with ends in reverse order: whether `KURU` (dry) is bigger or smaller than the wet value, the same code gives the right percentage.

```cpp
// sketch: toprak_yuzde
const int KURU = 800;                 // sensör havada/kuru toprakta okunan ham değer
const int ISLAK = 350;                // sensör suda okunan ham değer

int ortalamaOku(int pin) {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 8;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = ortalamaOku(A2);
  int yuzde = map(ham, KURU, ISLAK, 0, 100);
  yuzde = constrain(yuzde, 0, 100);

  Serial.print("Toprak ham=");
  Serial.print(ham);
  Serial.print(" nem=%");
  Serial.println(yuzde);
  delay(500);
}
```

In the lab we moved the **Soil moisture** slider and measured this:

| Slider | Raw value | In the serial monitor |
|---|---|---|
| 0 (driest) | 921 | 0 % (drier than the dry end: clamped) |
| 0.2 | 798 | 0 % (close to KURU = 800) |
| 0.4 | 675 | 27 % |
| 0.6 | 552 | 55 % |
| 0.8 | 430 | 82 % |
| 1 (wettest) | 307 | 100 % (wetter than the wet end: clamped) |

We chose `KURU = 800` and `ISLAK = 350` (dry and wet); because the ends the module reaches (921 and 307) lie outside these, `constrain` holds the ends at 0 % and 100 %. Without `constrain` you would see about -26 % with the slider at 0.

If the sensor works the other way (low when dry, high when wet), you only change the two constants; for example `KURU = 300`, `ISLAK = 700`. Because `map` also works with ends in reverse order, the same code gives the right percentage on that sensor too. The module in the lab always works in the same direction, so to try the reversed case here, you just swap the `KURU` and `ISLAK` values (see "Try it" below).

### Program 2: calibrate over the serial port
Instead of burying the constants in the code, it is more reliable to measure the sensor dry and wet and save the values. In this program, if you send `k` from the serial monitor, the current raw value is saved as the **dry** end, and if you send `i`, as the **wet** end. If the two ends are very close to each other, no percentage is calculated, because `map` divides, and when the difference gets close to zero the result becomes meaningless.

```cpp
// sketch: toprak_kalibre
int kuru = 800;
int islak = 350;

unsigned long sonYazi = 0;

int ortalamaOku(int pin) {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 8;
}

void setup() {
  Serial.begin(9600);
  Serial.println("k: kuru uc, i: islak uc");
}

void loop() {
  while (Serial.available() > 0) {
    char komut = Serial.read();
    if (komut == 'k') {
      kuru = ortalamaOku(A2);
      Serial.print("Kuru kaydedildi: ");
      Serial.println(kuru);
    } else if (komut == 'i') {
      islak = ortalamaOku(A2);
      Serial.print("Islak kaydedildi: ");
      Serial.println(islak);
    }
  }

  unsigned long simdi = millis();
  if (simdi - sonYazi >= 500) {
    sonYazi = simdi;
    int ham = ortalamaOku(A2);
    if (abs(kuru - islak) < 50) {
      Serial.println("Kalibrasyon gecersiz: uclar cok yakin");
    } else {
      int yuzde = constrain(map(ham, kuru, islak, 0, 100), 0, 100);
      Serial.print("nem=%");
      Serial.println(yuzde);
    }
  }
}
```

In the lab we sent `k` with the slider at 0 (`Kuru kaydedildi: 921`, dry saved) and `i` with the slider at 1 (`Islak kaydedildi: 307`, wet saved); then, when we set the slider to 0.5, it printed `nem=%50`. When we sent both `k` and `i` with the slider at 0.5 (both ends 614), it printed `Kalibrasyon gecersiz: uclar cok yakin` (calibration invalid: the ends are too close).

### Program 3: rain and water level
On the rain sensor, drops falling on the board bridge the gap between two copper tracks and the reading drops; on the water level sensor, the value grows as the water covers the bare tracks. The directions depend on the module. In this example the rain sensor gives a **high value when dry and a low value when wet**, and the water level sensor gives a **higher value as the water rises**. You must set the thresholds by measuring a real sensor; the thresholds below were measured for the models in the lab.

```cpp
// sketch: yagmur_su
const int YAGMUR_ESIK = 600;          // altı: yagmur var
const int SEVIYE_ORTA = 300;          // bunun altı: bos
const int SEVIYE_DOLU = 600;          // bunun ustu: dolu

void setup() {
  Serial.begin(9600);
}

void loop() {
  int yagmur = analogRead(A0);
  int seviye = analogRead(A1);

  Serial.print("Yagmur: ");
  Serial.print(yagmur < YAGMUR_ESIK ? "VAR" : "YOK");
  Serial.print("  Su: ");
  if (seviye < SEVIYE_ORTA) {
    Serial.print("BOS");
  } else if (seviye < SEVIYE_DOLU) {
    Serial.print("ORTA");
  } else {
    Serial.print("DOLU");
  }
  Serial.print("  (A0=");
  Serial.print(yagmur);
  Serial.print(" A1=");
  Serial.print(seviye);
  Serial.println(")");
  delay(500);
}
```

In the lab we moved the rain sensor's **Wetness (rain)** slider and measured:

| Wetness | A0 | In the serial monitor |
|---|---|---|
| 0 (dry board) | 972 | `YOK` |
| 0.2 | 798 | `YOK` |
| 0.4 | 624 | `YOK` (just above the threshold of 600) |
| 0.5 | 537 | `VAR` |
| 0.8 | 276 | `VAR` |
| 1 (downpour) | 102 | `VAR` |

With the water level sensor's **Water level** slider:

| Water level | A1 | In the serial monitor |
|---|---|---|
| 0 (empty) | 51 | `BOS` |
| 0.2 | 204 | `BOS` |
| 0.4 | 358 | `ORTA` |
| 0.7 | 588 | `ORTA` (just below the DOLU threshold of 600) |
| 0.8 | 665 | `DOLU` |
| 1 (stick fully in water) | 819 | `DOLU` |

(`VAR` means yes, `YOK` means no; `BOS`, `ORTA` and `DOLU` mean empty, half and full.)

Careful: at 5 V the water level sensor does not reach full scale (1023); the stick's top value stays at about 819. That is why we chose the thresholds by the sensor's real range, not by 1023. In the lab, as you move the slider, also watch the drops and the water level in the drawing of the **board** or the **stick** change with the slider.

### How does it work?
1. All three sensors produce a voltage, and `analogRead` turns it into a number from 0 to 1023 (lesson 11).
2. On the soil sensor, `map` carries the raw number over to a percentage; `constrain` cuts off overflows at the ends. The average of 8 measurements reduces noise (lesson 14).
3. Rain and water level are compared with simple thresholds. For readings close to the limit values, the state can flip back and forth quickly; the cure for this is the hysteresis you used in the thermostat in lesson 35.
4. Because the direction and the numbers change from sensor to sensor, these numbers may not be right for another sensor. Always calibrate with the sensor you are using.

### Try it
- In the `toprak_yuzde` program, swap the `KURU` and `ISLAK` values. What happens to the percentage? How can you tell which direction a sensor works in by pulling the slider from 0 to 1 and watching how the raw number changes?
- While running the `toprak_kalibre` program, send `k` with the slider at 0 and `i` with the slider at 1. Then set the slider to 0.3: what percentage comes out?
- If the sensor works the other way (low when dry), how would you change the rain comparison in the `yagmur_su` program?
- Move the rain slider slowly between 0.4 and 0.5: where does it switch between `YOK` and `VAR`? If you set the threshold to 700, at what wetness would the switch happen?

### Common mistakes
- Assuming "big number = wet" without knowing the sensor's direction.
- Forgetting `constrain`: readings outside the calibration range give silly values such as -20 % or 130 %.
- Leaving a resistive sensor in the soil and switched on all the time: the prongs rust and the reading drifts over time (the lab does not model this; it is real-world knowledge).
- Interpreting the sensor output from a single measurement: take an average because of noise.

## Discuss
You left a resistive soil moisture sensor in the soil for a year, and the readings slowly drifted. What could be the reason? How often would you redo the calibration, and could there be a way to do it automatically?

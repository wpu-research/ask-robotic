# MQ-2 gas sensor: warm-up and calibration
duration: 25

## Wonder
The gas leak alarm in the kitchen waits quietly, but one day it goes off. So does the alarm decide by "how many ppm of gas there is"? With most cheap sensors, no: it only says "the value has risen a lot compared with clean air". In this lesson you will learn why the MQ-2 gas sensor first has to warm up, how to take a measurement in clean air to find a **baseline value**, and how to raise an alarm based on that value.

## Activity
### Safety note
- Gas leaks and flammable gases are dangerous. There is no gas in this lesson: you will imitate a rise in gas with the MQ-2's **Gas level** property in the lab.
- A real MQ-2 has a heater inside; it gets hot while it works.
- This circuit does **not** replace a certified gas or smoke detector. It is for learning only.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| MQ-2 gas sensor module | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** (**DO** stays unconnected) |
| Resistor (330 Ω) + LED (status) | **D12** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| Resistor (330 Ω) + LED (alarm) | **D13** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |

Connect the MQ-2 module to 5 V; in the lab, if you connect it to 3.3 V the module counts as unpowered (the heater of a real MQ-2 also needs 5 V). On most MQ-2 modules the analog output voltage rises as the gas rises; the module in the lab works the same way. The MQ-2 is sensitive to flammable gases and smoke, but it **cannot tell** which gas it is.

In the lab, the **Gas level** property goes from 0 (clean air) to 1 and can be changed while the circuit runs. On this module the AO voltage is 5 V × (0.1 + 0.9 × level):

| Gas level | 0 | 0.03 | 0.1 | 0.3 | 1 |
|---|---|---|---|---|---|
| `analogRead(A3)` | 102 | 130 | 194 | 379 | 1023 |

### Warm-up and calibration
The MQ-2's heater brings the sensing element up to its working temperature. When it is cold or has just been switched on, the readings are unsteady and settle slowly. On first use, and after being switched off for a long time, this takes a **long** time; how long depends on the module and the maker, so check your own datasheet. In this lesson we use **5 seconds** so we do not have to wait in the lab; in a real circuit this time must be much longer. The MQ-2 in the lab does not model the warm-up effect (the readings are steady from the start); we still write the warm-up wait in the code, because the real module behaves that way.

After it has warmed up, you take a measurement in **clean air** (in the lab with Gas level at 0, so `analogRead` is about 102): this is your **baseline** value. The baseline changes from place to place, from module to module and over time. That is why, for the alarm, we use a threshold **relative to the baseline** instead of a fixed number (for example 1.5 times the baseline).

To convert to a unit like ppm (parts per million), you need the curve from the datasheet, the type of gas and the sensor's calibration data. Without these, the number you get is not reliable. That is why in these lessons **we do not write ppm**; we only look at "how many times the clean-air value" it is.

### Program 1: warm up and measure the baseline
The LED (D12) blinks while warming up. When the warm-up is over, the sensor is measured 32 times and the average becomes the baseline.

```cpp
// sketch: mq2_isinma_baz
const int GAZ = A3;
const int DURUM_LED = 12;
const unsigned long ISINMA_MS = 5000;   // ders için kısa; gerçekte çok daha uzun

int baz;
unsigned long sonYazma = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ);
    delay(20);
  }
  return toplam / 32;
}

void setup() {
  pinMode(DURUM_LED, OUTPUT);
  Serial.begin(9600);

  Serial.println("Isiniyor...");
  while (millis() < ISINMA_MS) {
    digitalWrite(DURUM_LED, (millis() / 250) % 2);   // yanıp söner
  }
  digitalWrite(DURUM_LED, LOW);

  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  if (millis() - sonYazma >= 500) {
    sonYazma = millis();
    int okuma = analogRead(GAZ);
    Serial.print("okuma=");
    Serial.print(okuma);
    Serial.print(" fark=");
    Serial.println(okuma - baz);
  }
}
```

### Program 2: an alarm relative to the baseline
The alarm looks at **how many times** the baseline the reading is. As in lesson 51, we use two thresholds: the alarm starts when the ratio rises to 1.5, but only ends when it drops below 1.2. We also smooth the reading (lesson 14): a sample is taken every 50 ms and mixed with the old average. That way a single spike does not raise the alarm.

```cpp
// sketch: mq2_bagil_alarm
const int GAZ = A3;
const int DURUM_LED = 12;
const int ALARM_LED = 13;
const unsigned long ISINMA_MS = 5000;
const float ALARM_ORAN = 1.5;   // bazın 1,5 katı: alarm başlar
const float BIRAK_ORAN = 1.2;   // bazın 1,2 katının altı: alarm biter

float baz;
float ort;
bool alarm = false;
unsigned long sonOrnek = 0;
unsigned long sonYazma = 0;

float bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ);
    delay(20);
  }
  return toplam / 32.0;
}

void setup() {
  pinMode(DURUM_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);
  Serial.begin(9600);

  while (millis() < ISINMA_MS) {
    digitalWrite(DURUM_LED, (millis() / 250) % 2);
  }
  digitalWrite(DURUM_LED, LOW);

  baz = bazOlc();
  if (baz < 20) baz = 20;   // çok küçük baz, oranı anlamsız büyütür
  ort = baz;
  Serial.print("baz=");
  Serial.println(baz, 0);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOrnek >= 50) {
    sonOrnek = simdi;
    ort = 0.8 * ort + 0.2 * analogRead(GAZ);
    float oran = ort / baz;

    if (!alarm && oran >= ALARM_ORAN) {
      alarm = true;
    } else if (alarm && oran < BIRAK_ORAN) {
      alarm = false;
    }
    digitalWrite(ALARM_LED, alarm);
  }

  if (simdi - sonYazma >= 500) {
    sonYazma = simdi;
    Serial.print("oran=");
    Serial.print(ort / baz, 2);
    Serial.print(" alarm=");
    Serial.println(alarm ? 1 : 0);
  }
}
```

### How does it work?
1. Until `ISINMA_MS` (warm-up time) is up, the program uses no measurements; only the status LED blinks.
2. After the warm-up, the average of 32 readings becomes `baz` (baseline). During this time there must be **no** gas, smoke or alcohol vapour in the air (in the lab, Gas level must stay at 0).
3. `ort` (average) is the sum of 80% of the old average and 20% of the new reading. Even if the reading jumps suddenly, `ort` rises over a few samples.
4. `oran = ort / baz` (ratio) tells you how many times the baseline the value is. 1.0 means clean air; 2.0 means the value has doubled.
5. The two thresholds keep the alarm steady: while the ratio is between 1.2 and 1.5, the alarm state does not change.
6. The `baz < 20` check stops the ratio coming out meaninglessly large when the baseline is very small.

### Try it
- Set the gas level to 0.03 (reading about 130, ratio about 1.27). With `ALARM_ORAN = 1.5`, is there an alarm? What about with `ALARM_ORAN = 1.2`? Then set it to 3.0: when does it raise the alarm?
- Set the warm-up time to 1000 ms. Does the `baz` value change? (In the lab it does not, because the warm-up is not modelled. On a real sensor, measuring before the warm-up is over makes a big difference.)
- Add `Serial.println(okuma)` to the sketch and print the raw values next to the smoothed `ort` value. Which one is steadier?

### Common mistakes
- Not waiting for the warm-up: the baseline comes out wrong, and the alarm goes off wrongly or never goes off.
- Measuring the baseline in air that contains gas (starting the program in the lab while Gas level is not 0): the alarm threshold moves up and a real danger is missed.
- Comparing with a fixed number (`okuma > 400`): it becomes meaningless with another module or in different air.
- Converting the reading to a unit like ppm and believing it is correct.
- Tying the alarm to a single reading: one spike causes a false alarm.
- Using this circuit on its own to protect real lives.

## Discuss
Is it a good idea to measure the baseline again every time it is switched on? What happens if the sensor is switched on in a room full of gas? How would you notice this problem?

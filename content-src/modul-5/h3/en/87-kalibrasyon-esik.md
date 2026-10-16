# Calibration: min/max and threshold
duration: 25

## Wonder
You set your robot on the line at home, under the evening lamp, and it worked brilliantly. The next day you tried it at school by the window: the robot cannot see the line at all; it behaves as if everything were line. Your program is the same, the robot is the same. The only thing that has changed is the ambient light. How does the sensor adapt to changing light?

## Activity
### The idea: measure the threshold, do not guess it
In lesson 86 we chose the threshold by hand as 512. This number is only right when the floor reads 164 and the line reads 860. If the light, the surface or the sensor height changes, the floor and line readings shift too.

**Calibration** means this: before the robot starts working, we measure the **smallest** (min, floor) and **largest** (max, line) value each sensor sees. The threshold is halfway between the two:

`esik = (min + max) / 2`

We keep a separate min, max and threshold for each sensor. This is because the five sensors are not identical; one may be a little more sensitive, another a little higher up.

### Circuit
Standard connections (the common Module 5 layout):

| Part | Connection |
|---|---|
| Line sensors 0…4 | AO → **A0…A4**, VCC → 5 V, GND → GND |
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Use external power for the motors and the driver; do not power them from the Arduino's 5 V output. The battery and driver GND must be connected to the Arduino GND (common GND). Do not connect the battery the wrong way round and do not short its leads.

### Program: calibration by wiggling
Place the robot on the line, with the line in the middle. When the program starts, the robot wiggles by turning on the spot to the left, then to the right, then to the left again. Meanwhile each sensor sees the line one moment and the floor the next. When the wiggling ends, the program prints the min, max and thresholds, then reports the line pattern every 300 ms.

The `motor(sol, sag)` function that drives the motors uses the direction + PWM logic you saw in lesson 77: the sign chooses the direction, the size chooses the speed. Because of the dead zone, the wheel does not turn below PWM 51 (≈ 20%) (lesson 78); we use 120 for the wiggle.

```cpp
// sketch: kalib_salla
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int SALLA_PWM = 120;
const unsigned long KALIBRASYON_MS = 1800;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
bool hazir = false;
unsigned long sonYazi = 0;

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void sallan(unsigned long t) {
  if (t < 400) motor(-SALLA_PWM, SALLA_PWM);          // sola don
  else if (t < 1200) motor(SALLA_PWM, -SALLA_PWM);    // saga don
  else if (t < 1600) motor(-SALLA_PWM, SALLA_PWM);    // basa don
  else motor(0, 0);
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    enAz[i] = 1023;     // gercek degerler bunlardan kucuk/buyuk olacak
    enCok[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();

  if (simdi < KALIBRASYON_MS) {
    sallan(simdi);
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      int v = analogRead(SENSOR_PIN[i]);
      if (v < enAz[i]) enAz[i] = v;
      if (v > enCok[i]) enCok[i] = v;
    }
    return;
  }

  if (!hazir) {
    motor(0, 0);
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      esik[i] = (enAz[i] + enCok[i]) / 2;
      Serial.print("A");
      Serial.print(i);
      Serial.print(" min=");
      Serial.print(enAz[i]);
      Serial.print(" max=");
      Serial.print(enCok[i]);
      Serial.print(" esik=");
      Serial.println(esik[i]);
    }
    hazir = true;
  }

  if (simdi - sonYazi >= 300) {
    sonYazi = simdi;
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      Serial.print(analogRead(SENSOR_PIN[i]) > esik[i] ? '1' : '0');
    }
    Serial.println();
  }
}
```

### Program: fixed threshold versus calibrated threshold when the light changes
Now think about the case where ambient light brightens both the floor and the line. Let the floor read 2.9 V (≈ 593) and the line 4.6 V (≈ 941) (example values). This sketch does not drive the robot; it only prints the two decision methods side by side. For the first 2 seconds it measures min/max (during this time, bring the sensors over a line and over the floor). Then every 200 ms it prints what both the fixed threshold (512) and the calibrated threshold say.

```cpp
// sketch: kalib_isik
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int SABIT_ESIK = 512;
const unsigned long OLCUM_MS = 2000;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
bool hazir = false;
unsigned long sonYazi = 0;

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    enAz[i] = 1023;
    enCok[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();

  if (!hazir) {
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      int v = analogRead(SENSOR_PIN[i]);
      if (v < enAz[i]) enAz[i] = v;
      if (v > enCok[i]) enCok[i] = v;
    }
    if (simdi >= OLCUM_MS) {
      for (int i = 0; i < SENSOR_SAYISI; i++) {
        esik[i] = (enAz[i] + enCok[i]) / 2;
      }
      hazir = true;
    }
    return;
  }

  if (simdi - sonYazi >= 200) {
    sonYazi = simdi;
    Serial.print("sabit=");
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      Serial.print(analogRead(SENSOR_PIN[i]) > SABIT_ESIK ? '1' : '0');
    }
    Serial.print(" kalibre=");
    for (int i = 0; i < SENSOR_SAYISI; i++) {
      Serial.print(analogRead(SENSOR_PIN[i]) > esik[i] ? '1' : '0');
    }
    Serial.println();
  }
}
```

### How does it work?
1. `enAz` (smallest) starts at 1023 and `enCok` (largest) starts at 0. The first real reading beats both at once; this way the "smallest/largest" calculation starts correctly. If you write the starting values the other way round (min = 0), min is never updated.
2. While wiggling, the line passes under the sensors. The max is caught on the line and the min on the floor. Instead of wiggling, moving the robot by hand over and off the line gives the same result; on a real robot this is often what is done.
3. `(enAz + enCok) / 2` puts the threshold exactly halfway between floor and line. In normal light, at the end of the wiggle, lines such as `min=163 max=860 esik=511` come out.
4. When the light gets brighter, the floor reads 593. Because the fixed threshold is 512, the floor is also counted as "line": all five sensors give `1` and the robot cannot tell anything apart. The calibrated threshold (halfway between 593 and 941, ≈ 767) still works correctly.
5. Calibration is not only a safeguard against changes in light. It also makes up for each sensor's own differences; that is why we keep a separate threshold for each sensor in an array.

### Try it
- Set `SALLA_PWM` to 40. Does the robot wiggle? Why? (Think about the dead zone from lesson 78.)
- Set `KALIBRASYON_MS` to 300. If you take min/max before the wiggle has finished, does the threshold still come out right?
- Add a button to the program (for example D2, `INPUT_PULLUP`) to calibrate again after calibration. When you press the button, the measurement should start again.

### Common mistakes
- Writing the starting values of `enAz` and `enCok` the wrong way round.
- Placing the robot far from the line during the wiggle: the sensor never sees the line, max stays at the floor value and the threshold cannot pick out the line.
- Ending the wiggle too early, or not being able to turn the robot at all. With `KALIBRASYON_MS = 300`, the measurement ends while the robot is turning left; A0 and A1 never see the line, min and max stay equal (163) and the threshold becomes 163. Even the smallest flicker on the floor counts as "line". The robot is also left turned by 38°.
- If `SALLA_PWM` stays below the dead zone (40), the robot does not move. A2 always reads 860: min = max = 860, the threshold becomes 860 and `860 > 860` is false. Even though the robot is right on top of the line, the pattern comes out as `00000`.
- Applying one single threshold to all five sensors. The sensors can turn out different from each other.
- Trusting the old threshold if the ambient light changes noticeably after calibration.

### What may be different on a real robot
In the simulation the five sensors are exactly the same, so their min/max all come out the same. On a real robot each sensor has its own min/max and the readings flicker. On a flickering signal, a single odd reading can spoil the min or max; taking the average of a few readings helps.

## Discuss
Should calibration be done every time the robot is switched on, or should you do it once and write the result to EEPROM (lesson 34)? What are the good and bad sides of each approach?

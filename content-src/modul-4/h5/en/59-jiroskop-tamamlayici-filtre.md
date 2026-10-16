# Gyroscope bias and the complementary filter
duration: 30

## Wonder
In lesson 58 we found the tilt angle with the accelerometer. But when the chip was shaken (the `ax = 0,3 g` experiment in lesson 58), the angle went wild. A gyroscope, on the other hand, says "how fast am I turning" and works brilliantly during movement. We have two sensors, and both are flawed. Can we combine them so that each one covers what the other is missing?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. The circuit is the same as the MPU6050 part of lesson 58; no LED is needed.

| Part | Connection |
|---|---|
| MPU6050 VCC | 5V |
| MPU6050 GND | GND |
| MPU6050 SDA | **A4** |
| MPU6050 SCL | **A5** |

### What does a gyroscope measure?
The accelerometer gives the angle directly. The gyroscope gives the **rate of turn** (°/s). To find the angle, we add up the rate over time: if you turn at 10 °/s for one second, you have turned 10°. We do this in small steps:

```cpp
aci = aci + hiz * dt;     // hiz: °/s, dt: son ölçümden bu yana geçen saniye
```
This is called taking the **integral**. This week, pitch (forward-backward tilt) is the chip's rotation around its Y axis. That is why we will use the `gy` value from the gyroscope.

Note: on a real MPU6050, a rotation around +Y usually makes the `atan2(ax, az)` angle from lesson 58 smaller; in other words, the two signs can come out opposite. In that case you flip the sign of `gy` (see "Common mistakes" below). In the lab, the accelerometer and gyroscope properties are independent of each other; you choose values that fit together.

### Bias: not zero when still
When the chip is standing still, `gy` should be exactly zero, right? It is not. Real chips show a small constant value (typically a few °/s; the datasheet allows a tolerance of up to ±20 °/s for the initial bias, so check your chip's datasheet for the exact value). This is called **bias**. Its value changes from chip to chip, and it can also drift with temperature.

Finding the bias is easy: while the chip is **not moving**, take hundreds of measurements and calculate their average. That average is the bias. Then subtract the bias from every measurement.

The gyroscope properties of the virtual chip in the lab are 0 by default, so it has no bias. To imitate a real chip's bias, set the MPU6050's **Gyro Y** property to 2 before pressing ▶.

### Program 1: Measure the bias and subtract it
```cpp
// sketch: mpu_sapma_olc
#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;
float sapmaGy = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);                 // Y ekseni jiroskop (yüksek bayt)
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;               // °/s
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;         // durağan ortalama = sapma
  Serial.print("Sapma gy = ");
  Serial.print(sapmaGy, 2);
  Serial.println(" derece/sn");
}

void loop() {
  float gy = gyOku();
  Serial.print("gy ham=");
  Serial.print(gy, 1);
  Serial.print(" duzeltilmis=");
  Serial.println(gy - sapmaGy, 1);
  delay(500);
}
```
After pressing ▶, do not change the properties for the first second (while the bias is being measured). First you see the line `Sapma gy = 2.00` (bias gy). Then set **Gyro Y** to 32 (a real rotation of 30 °/s + 2 °/s bias): `duzeltilmis` (corrected) shows about 30. When you go back to 2, `duzeltilmis` is close to zero.

### If we add up the angle with the gyroscope: the bias builds up
Now let's do an experiment. The chip is standing still, but the gyroscope shows a small bias of, say, 2 °/s. If we find the angle with the integral:

- In 1 second: 2 × 1 = 2° of drift
- In 10 seconds: 2 × 10 = **20° of drift**
- In 1 minute: 120° of drift

The chip did not move at all, yet the calculated angle really wandered away. Each measurement adds a very small error, and when you add the errors up they grow. Even if you measure the bias and subtract it, a small leftover error (the bias can change over time or with heat) still builds up.

### Program 2: The integral's drift
```cpp
// sketch: mpu_integral
#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;

float sapmaGy = 0;
float gyroHam = 0;                  // sapma çıkarılmadan integral
float gyroDuz = 0;                  // sapma çıkarılarak integral
unsigned long sonUs = 0;
unsigned long baslaMs = 0;
unsigned long sonYazMs = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;
}

float ivmeAci() {                   // 58. ders: pitch = atan2(ax, az)
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);
  int axH = Wire.read(); int axL = Wire.read();
  int ayH = Wire.read(); int ayL = Wire.read();
  int azH = Wire.read(); int azL = Wire.read();
  float ax = (int16_t)((axH << 8) | axL) / 16384.0;
  float az = (int16_t)((azH << 8) | azL) / 16384.0;
  return atan2(ax, az) * 180.0 / PI;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;

  gyroHam = ivmeAci();              // başlangıç açısı: ivmeölçerden
  gyroDuz = gyroHam;
  sonUs = micros();
  baslaMs = millis();
  sonYazMs = baslaMs;
}

void loop() {
  float gy = gyOku();

  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;     // saniye
  sonUs = simdi;

  gyroHam += gy * dt;
  gyroDuz += (gy - sapmaGy) * dt;

  if (millis() - sonYazMs >= 1000) {
    sonYazMs += 1000;
    Serial.print("t=");
    Serial.print((millis() - baslaMs) / 1000.0, 1);
    Serial.print(" ham=");
    Serial.print(gyroHam, 1);
    Serial.print(" duz=");
    Serial.print(gyroDuz, 1);
    Serial.print(" acc=");
    Serial.println(ivmeAci(), 1);
  }
  delay(10);
}
```
To keep the chip tilted and still, set **Gyro Y = 2**, **Accel X = 0.17**, **Accel Z = 0.98** before pressing ▶ (about 10°). Look at the Serial monitor: `acc` always stays the same (the lab sensor has no noise). `ham` (raw) keeps walking away over time. `duz` (straight, corrected) stays constant because the bias was subtracted; if the bias changes later (you will see this in Try it below), it only drifts by the small leftover error.

### The accelerometer's problem: noise and vibration
The accelerometer does not drift. If the chip stays at the same tilt, it tells you the same angle forever. But it also measures every acceleration other than gravity: motor vibration, a shaking hand, the bounce of a walking robot. (The lab chip does not produce this noise by itself; you make the vibration by changing Accel X quickly.) If an extra 0.3 g is added to `ax`, as in lesson 58, the angle is off by 16.7°. So the accelerometer is:

- **Right in the long run** (it does not drift), **noisy in the short run**.

The gyroscope is the exact opposite:

- **Right in the short run** (it catches fast changes well), **drifts in the long run** (the bias builds up).

### The complementary filter
The two sensors complete each other. The idea: update the angle with the gyroscope (fast, calm), but at every step apply a small pull towards the accelerometer's angle (this stops the drift):

```
angle = α · (angle + gy · dt) + (1 − α) · accAngle
```
- `aci + gy · dt`: adds the rotation the gyroscope saw to the previous angle (`aci`).
- `accAci`: the angle found from the accelerometer with atan2.
- `α` (alpha): how much you trust the gyroscope. Usually **0.98**. So at every step it is 98% gyroscope, 2% accelerometer.

This very small 2% pull stops the drift because it builds up in a loop that takes a hundred steps per second. Think of it as a small "pull back" that keeps correcting the error. The vibrating accelerometer, meanwhile, always comes in with only a 2% weight, so its noise is filtered out.

With `dt = 10 ms` and `α = 0,98`, the filter's correction speed (time constant) is about `α · dt / (1 − α) = 0,98 · 0,01 / 0,02 ≈ 0,5 s`. So even if it starts wrong, the filter settles on the right angle within a few half-seconds.

### Program 3: The complementary filter
```cpp
// sketch: mpu_tamamlayici
#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;
const float ALFA = 0.98;

float sapmaGy = 0;
float aci = 0;                      // filtreli açı
float saf = 0;                      // karşılaştırma: yalnız jiroskop integrali
unsigned long sonUs = 0;
unsigned long baslaMs = 0;
unsigned long sonYazMs = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;
}

float ivmeAci() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);
  int axH = Wire.read(); int axL = Wire.read();
  int ayH = Wire.read(); int ayL = Wire.read();
  int azH = Wire.read(); int azL = Wire.read();
  float ax = (int16_t)((axH << 8) | axL) / 16384.0;
  float az = (int16_t)((azH << 8) | azL) / 16384.0;
  return atan2(ax, az) * 180.0 / PI;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;

  aci = ivmeAci();
  saf = aci;
  sonUs = micros();
  baslaMs = millis();
  sonYazMs = baslaMs;
}

void loop() {
  float gy = gyOku() - sapmaGy;
  float acc = ivmeAci();

  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;
  sonUs = simdi;

  saf += gy * dt;
  aci = ALFA * (aci + gy * dt) + (1.0 - ALFA) * acc;

  if (millis() - sonYazMs >= 200) {
    sonYazMs += 200;
    Serial.print("t=");
    Serial.print((millis() - baslaMs) / 1000.0, 1);
    Serial.print(" acc=");
    Serial.print(acc, 1);
    Serial.print(" saf=");
    Serial.print(saf, 1);
    Serial.print(" filtre=");
    Serial.println(aci, 1);
  }
  delay(10);
}
```

### How does it work?
1. In `setup`, the average of 200 measurements is stored as the bias; the chip must not move during this time.
2. The starting angle is taken from the accelerometer, because the integral only knows the **change**; it does not know the starting angle.
3. On every pass, `loop` calculates `dt` from the `micros()` difference. Using the real time that has passed instead of writing a fixed 0.01 gives a correct integral even if the `delay` and I2C times change.
4. `saf` (pure) adds up the gyroscope only. `aci` (angle) applies the formula. You see the two side by side on the Serial monitor.
5. At a constant tilt, when the bias changes later (for example, you raised Gyro Y from 2 to 4 while it was running): `acc` stays constant, `saf` slowly drifts (because of the small error left after subtracting the bias), but `filtre` (filter) stays calm and correct.
6. If you wiggle the accel properties quickly to make vibration, `acc` jumps around, but `filtre` moves very little because it is weighted towards the gyroscope. In a real rotation (when the accel and gyro change together), `filtre` reacts straight away thanks to the gyroscope.

Notice, too, that the filter is not perfectly right. If a small error is still left between what the gyroscope measures and the real value (if the bias changed), `filtre` sits a tiny bit away from the correct value. The error is `α · hata · dt / (1 − α)` (error). For example, if the leftover error is 2 °/s, `dt = 0,01 s` and `α = 0,98`, it is about 1°. If you used the gyroscope alone, the same error would be 20° in 10 seconds.

### Try it
- Set `ALFA` to 0.90. Wiggle Accel X quickly between 0.17 and 0.35: does `filtre` move more or less? Does it catch fast movement better?
- Set `ALFA` to 0.999. Why does the filter become very slow to settle on the right angle? (The time constant is about 0.999 · 0.01 / 0.001 ≈ 10 seconds.)
- Start with the chip tilted: before pressing ▶, set Accel X = 0.5, Accel Z = 0.87 (about 30°). While it runs, set Accel X to 0 and Accel Z to 1. How do `filtre` and `saf` separate from each other? (`saf` looks only at the gyroscope; it does not see the accelerometer's new state.)
- Let the bias change later: while it runs, raise Gyro Y from 2 to 4. How far do `saf` and `filtre` drift in 10 seconds?

### Common mistakes
- Changing the properties as if the chip were moving while the bias is being measured (in the first second of the program), or holding a real chip / knocking the table: the bias is measured wrongly and everything drifts.
- Never subtracting the bias: `saf` and even `filtre` carry a small constant error.
- Writing `dt` as a fixed value instead of using the real time: when the `delay` or printing time changes, the integral comes out wrong.
- Mixing up the units: `gy` must be in °/s and `dt` in seconds. If you write milliseconds, you see a drift 1000 times bigger.
- Choosing `α` very close to 1: the accelerometer has almost no effect and the drift comes back.
- Taking the angle found with `atan2` and the gyroscope's rotation with opposite signs: the filter pulls the angle one way while it pushes it the other. If the sign comes out reversed, change the sign of the `gy` value.

## Discuss
This idea (combining two sensors) is used everywhere in phones and drones. More advanced filters (such as the Kalman filter) solve the same problem more cleverly. Why do you think "combining two flawed sensors" makes more sense than looking for a single perfect sensor?

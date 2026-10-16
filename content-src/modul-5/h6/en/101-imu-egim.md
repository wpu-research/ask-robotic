# Measuring tilt with an IMU
duration: 20

## Wonder
When you turn your phone on its side, the screen rotates. When a drone tilts in the wind, it rights itself. A two-wheeled robot, on the other hand, always wants to fall over, even when it is standing perfectly upright: its top is heavy and it stands on its wheels. In all of these, a small chip answers the question "how many degrees am I tilting right now?". This week you will use that chip to build a robot that balances itself. First you need to learn one thing: how to measure the tilt.

## Activity
### This week
- **101:** Measure tilt with the MPU6050 (this lesson).
- **102:** Combine the accelerometer and the gyroscope (complementary filter).
- **103:** Run the control loop at a fixed period.
- **104:** Cascade PID: the inner loop holds the angle, the outer loop holds the position.
- **105:** Project: a self-balancing robot.

**Important:** This week the robot is a **simulation** (an inverted pendulum model). The gain numbers in the lessons (such as `0,15`, `0,02`) belong to the robot in the simulation. On a real robot the motor, wheels, weight and battery are different; if you run the same code, the robot will most likely either not stay upright or will jitter. On a real robot you tune the gains again from scratch, starting with small values. The structure of the code (measuring, filter, fixed loop, PID), however, holds exactly.

### Circuit
Module 5's standard connections apply. Only the IMU is used in this lesson; the motors come in at 104.

| Part | Connection |
|---|---|
| MPU6050 module (such as the GY-521) | SDA → **A4**, SCL → **A5**, GND → GND, VCC → the voltage given in the module's documentation (5 V on most modules, which have a regulator on them), AD0 → GND (address 0x68) |
| Motors (in later lessons) | Left EN **D5**, IN1 **D7**, IN2 **D8**; right EN **D6**, IN3 **D9**, IN4 **D10**. Give the motors external power and join the GNDs |

Fix the sensor to the robot so that the **X axis points forwards**, the **Z axis points up** and the **Y axis is parallel to the wheel axle**. We assume the same in the simulation, so that the angle is positive when the robot leans forwards. If you mount your real sensor in another direction, you need to flip the signs.

### Tilt is measured in two ways
1. **The accelerometer measures gravity.** When the robot is still, the sensor sees only gravity. If the robot leans forwards by θ, the X axis sees sin θ of gravity and the Z axis sees cos θ of it (in g). So `θ = atan2(ax, az)`.
2. **The gyroscope measures rotation speed** (degrees per second). Speed is not an angle; to find the angle you need to add up the speed over time. We will do this in 102.

Remember the raw `Wire` reading from lessons 58-59: first you write 0 to register `0x6B` to wake the sensor up, then you read 14 bytes starting from register `0x3B`: ax, ay, az, temperature, gx, gy, gz. Each value is a signed 16-bit number and the **high byte comes first**. At the default scale, acceleration gives 16384 counts/g and the gyroscope 131 counts/(°/s).

One thing to watch: the robot rotates fast while it falls. The default gyroscope range is ±250 °/s; at a faster rotation the value gets stuck at the limit (saturates) and the measurement is wrong. The robot in the simulation reaches at most about 200 °/s while falling, which is very close to the limit; a push, or a real robot falling faster, goes past the limit. That is why we write `0x08` to register `0x1B` to set the range to ±500 °/s. In this range the scale is 65.5 counts/(°/s); we lose a little resolution but gain headroom against overflow.

### Program: print the tilt and the rotation speed
```cpp
// sketch: imu_olcum
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float RAD_DERECE = 57.2958;     // 180 / pi
const float JIRO_OLCEK = 65.5;        // ±500 °/s aralığında sayı / (°/s)
const float IVME_OLCEK = 16384.0;     // ±2 g aralığında sayı / g

int16_t oku16() {                     // iki bayttan işaretli sayı, yüksek bayt önce
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);  // sensörü uyandır
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);  // jiroskop aralığı ±500 °/s
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
}

void loop() {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);                   // ilk veri yazmacı: ax
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);

  int16_t axHam = oku16();
  oku16();                            // ay: kullanmıyoruz
  int16_t azHam = oku16();
  oku16();                            // sıcaklık
  oku16();                            // gx
  int16_t gyHam = oku16();
  oku16();                            // gz

  float ax = axHam / IVME_OLCEK;
  float az = azHam / IVME_OLCEK;
  float aci = atan2(ax, az) * RAD_DERECE;   // ivmeölçerden eğim (derece)
  float hiz = gyHam / JIRO_OLCEK;           // jiroskoptan dönme hızı (°/s)

  Serial.print(millis());
  Serial.print(',');
  Serial.print(aci, 1);
  Serial.print(',');
  Serial.println(hiz, 1);
  delay(50);
}
```

### How does it work?
1. `oku16()` turns two bytes into a single signed number. We read the bytes on separate lines; if you write both `Wire.read()` calls in the same expression, C++ does not guarantee which one runs first.
2. `atan2(ax, az)` gives radians. We multiply by `57,2958` to convert to degrees.
3. `ax` and `az` are in g: we divide the raw number by `16384.0`. Writing it with a decimal point matters; otherwise it becomes integer division.
4. If `hiz` (speed) is positive, the robot is rotating forwards, that is, the angle is increasing.

### What we saw in the measurement
In the simulation we held the sensor still at a 20° tilt: the program printed about 20.0 for `aci` (angle) and about 0 for `hiz`. Then we released the robot without motors, tilted by 3°: the robot falls over by itself and the angle passes 45° in about 0.7 seconds. Meanwhile the angle read from the accelerometer followed the real angle within less than 4°, and the rotation speed rose on the positive side to about 200 °/s. So falling over takes less than a second; the control has to work much faster than that (103).

### Program: the gyroscope should show zero while the robot is still
A still gyroscope should, in theory, read 0 °/s. In reality it reads a small constant value: this is called **bias**. Even though the bias looks small, when you add up the speed (turn it into an angle) it keeps growing; you will see this in 102. The solution: at start-up, while the robot is still, take many measurements, save their average as the bias and subtract it from later readings.

```cpp
// sketch: gyro_sifir
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float JIRO_OLCEK = 65.5;        // ±500 °/s
const int ORNEK_SAYISI = 500;

float jiroSapma = 0;                  // °/s

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

float jiroOku() {                     // gy, °/s
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x43);                   // gx yazmacı
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 6, true);
  oku16();                            // gx
  int16_t gyHam = oku16();
  oku16();                            // gz
  return gyHam / JIRO_OLCEK;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);

  float toplam = 0;
  for (int i = 0; i < ORNEK_SAYISI; i++) {   // robot HAREKETSIZ olmalı
    toplam += jiroOku();
    delay(2);
  }
  jiroSapma = toplam / ORNEK_SAYISI;
  Serial.print("Sapma: ");
  Serial.println(jiroSapma, 2);
}

void loop() {
  float hiz = jiroOku() - jiroSapma;  // sapması çıkarılmış hız
  Serial.print("Hiz: ");
  Serial.println(hiz, 2);
  delay(100);
}
```

In the simulation we gave the gyroscope a bias of 1.8 °/s. The program printed `Sapma: 1.80` (bias) and the following `Hiz:` lines came out very close to 0 (±0.05 °/s). The same holds for real sensors: the bias changes from sensor to sensor and with temperature, so it is measured again at every start-up. Do not hold the robot in your hand when you switch it on; put it on the table and do not move it.

### Try it
- Write `0x00` to register `0x1B` (±250 °/s) and set `JIRO_OLCEK` to 131. Turn a real sensor quickly by hand. Do the speed values get stuck at some point? (You cannot see this with the simulation alone: there the speed does not go above ≈ 200 °/s.)
- Work out the accelerometer angle using only `ax`: `asin(ax)`. At small angles, is there a difference from `atan2`? How big is the difference at 60°?
- Move the robot by shaking it in your hand. Is the accelerometer angle disturbed more when you hold it still, or when it is moving?

### Common mistakes
- Leaving the angle in radians: `atan2` gives radians; without converting to degrees, gains in degrees such as `0,15` work wrongly.
- Writing `axHam / 16384`: dividing two integers throws away the fraction. Write `16384.0`.
- Changing the gyroscope range without changing the scale: for ±500 °/s use 65.5, not 131. Otherwise the speed is halved or doubled.
- Holding or shaking the robot while measuring the bias: the bias comes out wrong and spoils every later measurement.
- Writing `atan2(az, ax)`: the order of the arguments matters. Here the first argument is `ax`, which is proportional to sin θ.

### What may be different on a real robot
A real accelerometer also measures motor vibration and its output is noisy; the first two measurements in the simulation were done with clean data. We deal with this in the next lesson. The direction of a real sensor, its scale error and the effect of temperature may also be different.

## Discuss
The accelerometer finds the angle by looking at gravity. While the robot is accelerating quickly forwards (when the motor pushes), do you think what the accelerometer sees will be only gravity? How does this affect the angle measurement?

# The complementary filter and an introduction to Kalman
duration: 25

## Wonder
In the previous lesson you measured tilt in two ways. The accelerometer gives the angle directly, but its values jump when the motor vibrates. The gyroscope is smooth, but to find the angle you have to add it up, and even the smallest bias grows over time. Neither is enough on its own. So can you combine the two and get an angle that is both smooth and free of drift?

## Activity
### Circuit
The same as the previous lesson: MPU6050 module, SDA → **A4**, SCL → **A5**, AD0 → GND (address 0x68). The motors are not used in this lesson.

### The idea: who is good at what?
| Sensor | Over a short time (fast changes) | Over a long time |
|---|---|---|
| Accelerometer | Noisy (vibration, jolts) | Correct (tied to gravity) |
| Gyroscope (sum of the speed) | Smooth and fast | Drifts (bias builds up) |

The **complementary filter** takes the side each one is good at:

`aci = α · (aci + hiz · dt) + (1 − α) · ivmeAci`

- `aci + hiz · dt`: move the previous angle forward with the gyroscope (trust it in the short term).
- `ivmeAci`: the angle from the accelerometer. With a small share (`1 − α`) it pulls the estimate towards itself at every step; this way the bias cannot build up.
- `α` is a number between 0 and 1. A typical value is 0.98: 98% of the estimate comes from the gyroscope and 2% from the accelerometer.

How "quickly the filter forgets" is given roughly by the time constant `τ ≈ α · dt / (1 − α)`. In this lesson each round takes about 5.4 ms (`dt ≈ 5,4 ms`), so `τ ≈ 0,26 s`: the lasting information from the accelerometer shows up in the angle in about this time, and most faster vibrations are filtered out. The bigger `α` is, the more you trust the gyroscope (smoother, but the drift is corrected later); the smaller it is, the more accelerometer noise passes into the angle.

`dt` is the real time between two measurements, in seconds. In this lesson we measure it with `micros()`; we will get into fixed periods in 103.

### Bench experiment
We simulated a movement like rocking the robot back and forth by hand on the table (±15°, 0.4 cycles per second). During the movement:
- noise like motor vibration was added to the accelerometer (±0.12 g random noise and a 37 Hz vibration with an amplitude of 0.08 g),
- the gyroscope was given a bias of 2 °/s; the bias was not corrected.

### Program: print the three angles side by side
```cpp
// sketch: tamamlayici_filtre
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float RAD_DERECE = 57.2958;
const float JIRO_OLCEK = 65.5;        // ±500 °/s
const float IVME_OLCEK = 16384.0;
const float ALFA = 0.98;              // jiroskop payı

float aciIvme = 0;                    // yalnız ivmeölçer
float aciJiro = 0;                    // yalnız jiroskop integrali
float aciFiltre = 0;                  // tamamlayıcı filtre
unsigned long sonUs = 0;
unsigned long sonYazdirMs = 0;
bool ilk = true;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2(axHam / IVME_OLCEK, azHam / IVME_OLCEK) * RAD_DERECE;
  hiz = gyHam / JIRO_OLCEK;
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
  sonUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;   // iki ölçüm arası gerçek süre (s)
  sonUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);

  if (ilk) {                                // başlangıç: üçü de ivmeölçerle başlasın
    aciIvme = aciJiro = aciFiltre = ivmeAci;
    ilk = false;
  } else {
    aciIvme = ivmeAci;
    aciJiro += hiz * dt;                                         // saf integral
    aciFiltre = ALFA * (aciFiltre + hiz * dt) + (1 - ALFA) * ivmeAci;
  }

  if (millis() - sonYazdirMs >= 100) {      // saniyede 10 satır
    sonYazdirMs = millis();
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aciIvme, 1);
    Serial.print(',');
    Serial.print(aciJiro, 1);
    Serial.print(',');
    Serial.println(aciFiltre, 1);
  }
  delay(5);
}
```

### How does it work?
1. `dt` is worked out every round; `micros()` counts microseconds.
2. `aciJiro` adds up the gyroscope only; it adds up the bias along with it, so the error keeps growing.
3. `aciFiltre` does the same sum, but every round it is pulled by `(1 − α)` towards the accelerometer angle. This pull balances out the build-up of the bias.
4. In the first round all three values start from the accelerometer angle; if you started from zero, the filter would give a wrong angle until it reached the correct one.

### Measurement: angle error
We measured the same 20-second movement with three methods and compared them with the real angle (the first 2 s were discarded; error = measured − real).
| Method | Average (RMS) error | Largest error |
|---|---|---|
| Accelerometer only | 5.2° | 11.1° |
| Gyroscope only (integral) | 27.2° | 43.2° (at 20 seconds) |
| Complementary filter (α = 0.98) | 0.65° | 1.7° |

Interpretation: the pure accelerometer is correct on average but jumps with the vibration; the pure gyroscope is smooth but its error grows without stopping (2 °/s bias × 20 s ≈ 43°); the complementary filter largely removes the problems of both. The small constant error left in the filter equals the bias times the time constant (≈ 2 °/s × τ), so if you measure the gyroscope bias at start-up and subtract it as in 101, it gets even smaller.

### An introduction to the Kalman filter (concept only)
The `α` value of the complementary filter is fixed: you choose it and it always stays the same. The **Kalman filter** uses the same idea (move forward with the gyroscope, correct with the measurement), but it works out the correction share (the **Kalman gain**) itself at every step, by looking at how reliable the sensors are and how uncertain the estimate is:

`yeni tahmin = tahmin + K · (ölçüm − tahmin)`, that is, new estimate = estimate + K · (measurement − estimate).

If the estimate is uncertain, `K` grows (it trusts the measurement a lot); if the measurement is noisy, `K` shrinks. The version often seen in robot code also estimates the gyroscope bias together with the angle. The cost: matrix operations, noise settings (you state how much to trust which sensor) and a longer processing time. In this course we carry on with the complementary filter: it is a single line, it has a single setting and it is enough to balance the robot in the simulation. If you need a more precise measurement later, you will be ready to learn Kalman.

### Try it
- Set `ALFA` to 0.9. How does the filter's output change? Set it to 0.995; what happens this time?
- Delete the `ilk` (first) block and start `aciFiltre` from 0. If the starting angle were 15°, how long would it take the filter to settle at the correct value? (Hint: τ)
- Add the `gyro_sifir` idea from 101: measure the bias at start-up and subtract it from `hiz`. How does the error change?

### Common mistakes
- Writing `dt` as a constant (for example 0.005) when the loop actually runs every 5.3 ms: the gyroscope integral comes out about 6% too small. We will measure this in 103.
- Mixing up the angle in degrees and the speed in radians/s. Both must be in degrees.
- Choosing `α` and `(1 − α)` so that they do not add up to 1: the filter either swells up or dies away.
- Not initialising the filter (taking the first angle as 0).
- Forgetting that while the robot accelerates, the accelerometer measures more than just gravity: the filter only filters this out to some extent.

### What may be different on a real robot
The vibration on a real accelerometer can be very different depending on how the motors and wheels are built; sometimes the noise is much larger than in this lesson and you may need to raise `α` to 0.99. The gyroscope bias also changes with temperature. The numbers here are for the simulation.

## Discuss
If you use `α = 0,5` instead of `α = 0,98`, what does the filter become like? If there were no gyroscope bias at all, would the filter still be needed?

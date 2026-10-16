# Cascade PID: angle and speed
duration: 30

## Wonder
In the previous lessons the robot stayed upright, but did you notice something: we never looked at **where** the robot was standing. In reality the centre of mass is never exactly in the middle, and the sensor is never mounted perfectly upright. The robot stands up but slowly drifts in one direction; when it reaches the edge of the table, it falls. A control that only corrects the angle cannot notice this. The solution: stack two controllers on top of each other. One watches the angle, the other watches the robot's position and speed.

## Activity
### Circuit
The same as the previous lessons. MPU6050 (SDA **A4**, SCL **A5**, address 0x68); left motor EN **D5**, IN1 **D7**, IN2 **D8**; right motor EN **D6**, IN3 **D9**, IN4 **D10**. Use external power for the motors and connect the motor driver's GND to the Arduino GND (common GND).

**Important (reminder):** `KP = 0,15`, `KD = 0,02` and the outer loop gains were tuned for **the robot in the simulation**. On a real robot the motor power, wheel diameter, mass and height are different; you need to tune the gains again. You keep the same structure (inner loop angle, outer loop position/speed) and change the numbers.

### Why is a single loop not enough?
So far the control has been an **angle PD**: `komut = KP · açı + KD · açıHızı` (command = KP · angle + KD · angle speed). The target is always 0°. This keeps the robot upright. But the angle at which the robot is really balanced may not be 0°: if the sensor is mounted 4° off (or the centre of mass is in front/behind), the point the sensor calls "0°" is not the real balance point. PD tries to go to the sensor's 0°, the robot really stays slightly tilted, and a tilted robot has to keep driving in the same direction to stay upright. The result: **drift**.

In the simulation we gave the sensor a 4° offset (an accelerometer mounting error) and watched the robot for 15 seconds. In the arena activity, too, the accelerometer is mounted 4° off: only the **read** value is off by 4°, not the robot's real tilt. This is exactly what a crookedly mounted sensor does on a real robot; the numbers in the arena come out the same as in the tables below.

### Program 1: angle PD only (with a printout that tracks the position)
In this simulation the robot has no encoder. We estimate the position from the command we give the motor: the model gives the wheel speed as roughly `0,5 · komut` (m/s). On a real robot the position and speed come from the encoder (lesson 92); estimating from the command is only a shortcut for this simulation and is wrong when the wheels slip.

```cpp
// sketch: pd_aci
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor

const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const float ALFA = 0.98;

// İç döngü (açı PD) -- BENZETİM robotuna göre
const float KP = 0.15;                   // komut / derece
const float KD = 0.02;                   // komut / (derece/s)
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut (yalnız konumu YAZDIRMAK için)
const float OLU_BOLGE = 0.08;

float aci = 0;
bool ilk = true;
float sonKomut = 0;                      // en son motora verilen komut
float konumTahmin = 0;                   // m
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;
unsigned long sonYazdirMs = 0;

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
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void motorSur(float u) {                 // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
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
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  // Yalnız açı PD'si. Hedef açı hep 0.
  sonKomut = KP * aci + KD * hiz;
  motorSur(sonKomut);

  // Konumu yalnız İZLİYORUZ, kontrol etmiyoruz: hız tahmini = 0,5 · komut
  konumTahmin += HIZ_KATSAYI * sonKomut * dt;

  if (millis() - sonYazdirMs >= 1000) {
    sonYazdirMs = millis();
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aci, 2);
    Serial.print(',');
    Serial.println(konumTahmin, 3);
  }
}
```

The output columns: time (ms), filtered angle (°), estimated position (m).

What we measured in the simulation (sensor 4° off, 15 seconds):
| Time | Real position (from the simulation) |
|---|---|
| 5 s | −0.053 m |
| 10 s | −0.110 m |
| 15 s | −0.166 m |

The robot did not fall; the largest tilt was 4.2°. The real tilt stayed at about −4.15° (the sensor says "0°") and the robot drifted non-stop at about **1.1 cm/s**: 16.6 cm in 15 seconds. When we ran the same code without the sensor offset, the position stayed at 0.001 m over 15 seconds; so the cause of the drift is not PD itself, but the balance point not being 0°. The estimated position printed by the program was less than 2 cm off the real position.

### The idea: two loops, one inside the other
**Cascade** control chains two PIDs/PDs: the output of the outer loop becomes the target of the inner loop.

| | Outer loop (position and speed) | Inner loop (angle) |
|---|---|---|
| Input | Estimated position and speed | Filtered angle and angle speed |
| Output | **Target angle** | Motor command |
| Speed | Slow: 20 ms (50 Hz) | Fast: 5 ms (200 Hz) |

The logic: if the robot is drifting forwards, the outer loop makes the target angle **backwards** (negative); to bring the robot to that angle, the inner loop first drives the wheels forwards, the robot leans back and then moves backwards. This pulls the position towards 0. The outer loop does not correct the angle directly; it tells the inner loop "stay at this angle".

**Why must the outer loop be slow?** The inner loop needs time to settle at a target angle. If the outer loop changes the target every round, the target has moved before the inner loop can catch it, and the two chase each other. Rule: the outer loop should be about 5-10 times slower than the inner loop. We will measure this below.

### Program 2: cascade balancing
```cpp
// sketch: kaskad_denge
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor

const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const int DIS_ORAN = 4;                  // dış döngü: her 4 turda bir = 20 ms (50 Hz)
const float ALFA = 0.98;

// İç döngü (açı PD) -- BENZETİM robotuna göre
const float KP = 0.15;                   // komut / derece
const float KD = 0.02;                   // komut / (derece/s)
// Dış döngü (konum + hız -> hedef açı) -- BENZETİM robotuna göre
const float KX = -60.0;                  // derece / metre
const float KV = -150.0;                 // derece / (metre/saniye)
const float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut
const float OLU_BOLGE = 0.08;

float aci = 0;
bool ilk = true;
float sonKomut = 0;                      // en son motora verilen komut
float hizTahmin = 0;                     // m/s
float konumTahmin = 0;                   // m
float hedefAci = 0;                      // dış döngünün çıkışı, iç döngünün girişi
int disSayac = 0;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;
unsigned long sonYazdirMs = 0;

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
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void motorSur(float u) {                 // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
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
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  // DIŞ DÖNGÜ: yavaş. Hız ve konumu tahmin et, hedef açıyı belirle.
  disSayac++;
  if (disSayac >= DIS_ORAN) {
    disSayac = 0;
    hizTahmin = HIZ_KATSAYI * sonKomut;
    hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);
  }

  // İÇ DÖNGÜ: hızlı. Açıyı hedef açıda tut.
  sonKomut = KP * (aci - hedefAci) + KD * hiz;
  motorSur(sonKomut);
  konumTahmin += HIZ_KATSAYI * sonKomut * dt;   // konum: her turda topla (hız tahmini x dt)

  if (millis() - sonYazdirMs >= 1000) {
    sonYazdirMs = millis();
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aci, 2);
    Serial.print(',');
    Serial.print(hedefAci, 2);
    Serial.print(',');
    Serial.println(konumTahmin, 3);
  }
}
```

### How does it work?
1. Every 5 ms the inner loop runs: the filtered angle is worked out and `sonKomut = KP · (aci − hedefAci) + KD · hiz` goes to the motors.
2. Every 4th round (20 ms) the outer loop runs: it takes `hizTahmin = 0,5 · sonKomut` and finds `hedefAci = KX · konum + KV · hız` (target angle = KX · position + KV · speed), limited to ±6°.
3. `KX` and `KV` are **negative**: if the position is positive (it has gone forwards), the target angle becomes negative, so the robot moves backwards.
4. `hedefAci` is limited; without the limit, the outer loop could try to tilt the robot further than the inner loop can recover from.
5. Running the outer loop inside a separate `if` is the simplest way to keep it slower than the inner loop; there is no need for a second timer.

### Measurements
With the same sensor offset (4°), cascade over 15 seconds:

| Time | Real position (from the simulation) |
|---|---|
| 5 s | −0.028 m |
| 10 s | −0.038 m |
| 15 s | −0.038 m |

- The drift **stopped**: in the last 5 seconds the position changed by less than 1 mm (with PD only it changed by 5.6 cm).
- The real angle at 15 seconds is −0.32°; so the robot stood almost upright (with PD only it was −4.15°). The sensor is still 4° off, but the outer loop makes up for it by adjusting the target angle (+1.7° at 15 seconds).
- The largest tilt was 4.0°, with no fall.
- The cost: the robot stands about 4 cm away from its starting point. The outer loop does not bring the position exactly to 0, but to a point that balances out the sensor offset. Adding an integral term to the outer loop (Week 5, lesson 98) is one way you could try to reduce this lasting difference; we did not measure it here.
- Because our position estimate is made from the command, it is imperfect: at the last record (14 s) the estimate is −0.072 m and the real position −0.041 m. The estimate can be clearly off the real value. This is a feature of the simulation, but on a real robot, too, estimating speed from the command is unreliable for the same reason; use an encoder.

### How slow should the outer loop be?
We changed `DIS_ORAN` (how many inner rounds between runs of the outer loop) and measured the angle oscillation (RMS) in the last 5 seconds:

| `DIS_ORAN` | Outer loop period | Angle oscillation (RMS, 10-15 s) |
|---|---|---|
| 1 | 5 ms (the same as the inner loop) | 2.14° |
| 2 | 10 ms | 2.11° |
| 4 | 20 ms | 0.30° |
| 8 | 40 ms | 0.71° |

With the outer loop at the same speed as the inner loop (1) or 2 times slower (2), the robot stays upright but keeps rocking ±3°. At 4 times slower it calms down. At 8 times slower the outer loop reacts so late that the oscillation grows a little again. So the outer loop should be neither as fast as the inner loop nor very slow; in this course we chose 4 times slower (20 ms). This number was found for the robot in the simulation.

### Try it
- Set `KX` and `KV` to 0: the cascade switches off and it goes back to program 1. Does the drift come back?
- Raise `KX` from −60 to −120. Did the robot settle into place faster, or did it rock more?
- Set `DIS_ORAN` to 1. The robot stays upright, but what happens?
- Set `HEDEF_SINIR` to 15°. If the sensor offset is very large, why could the outer loop be harmful?

### Common mistakes
- Running the outer loop at the same speed as the inner loop: the two loops chase each other and the robot rocks.
- Putting the signs of `KX` and `KV` the wrong way round: instead of correcting the drift, the robot speeds it up and falls. Try with a small value to find the sign.
- Not limiting the target angle.
- Carrying on estimating the position from the command on a real robot: the wheels slip, the floor slopes, and the estimate gets more wrong over time; use an encoder.
- Starting the gains large on a real robot: start small, and add the outer loop after the inner loop has settled.

### What may be different on a real robot
In the simulation we estimated speed from the command; on a real robot we measure it from the encoder. Real motors have delay, backlash (gear play) and a change in gain when the battery voltage drops. All the gains are found again for your robot.

## Discuss
The outer loop has to be slower than the inner loop. So how fast should the inner loop be? What might decide this?

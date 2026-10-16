# Sensor fusion: encoder + IMU
duration: 30

## Wonder
You spun your robot on the spot on the table 10 times. According to the encoders it turned exactly 3600 degrees and its heading is still right. The gyroscope, however, says "3650 degrees". Which one will you believe? In fact you will believe both a little: one slowly drifts but is smooth, the other does not drift but moves in coarse steps. In this lesson you will combine the two into a single heading estimate.

## Activity
### Circuit
The drive and encoder connections are Module 5's standard connections; the MPU6050 is connected over I2C.

| Part | Connection |
|---|---|
| Left motor (driver) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor (driver) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Left encoder | **D2** (interrupt pin) |
| Right encoder | **D3** (interrupt pin) |
| MPU6050 | SDA → **A4**, SCL → **A5**, VCC → 5 V (on boards with a regulator, such as the GY-521), GND → GND; address **0x68** |

Use a separate power supply for the motors and connect the motor driver's GND to the Arduino GND (common GND). When fitting the battery, do not connect plus and minus the wrong way round, and do not let the terminals touch each other.

### Why two sensors?
You have two sources of heading:

| Source | Good side | Bad side |
|---|---|---|
| **Encoder heading** (odometry, lesson 94) | Does not drift over time: the heading is worked out from the counted ticks | Moves in coarse steps: one tick means about 1 cm of wheel travel, about 5 degrees of heading |
| **Gyroscope** (yaw rate `gz`) | Smooth, and sees small turns too | It measures speed; for the heading you add it up (integral). A small bias builds up every second |

Heading from the encoders: you divide the difference between the distances travelled by the right and left wheels by the axle width.

```
heading (rad) = (right distance − left distance) / axle width
```

Here one tick = 2π · 0.033 / 20 ≈ 1.04 cm of wheel travel (radius 3.3 cm, 20 slots per turn); the axle width is 0.12 m. A single tick moves the heading by about 5 degrees. That is why the encoder heading moves like a staircase.

### First, the gyroscope scale
By default the MPU6050 measures ±250 °/s. If you turn faster than this, the raw value sticks to the limit (saturates) and you cannot see that you are really turning faster. As you saw in lesson 59, the solution is to write a scale to the GYRO_CONFIG register (address **0x1B**):

| 0x1B value | Full scale | Sensitivity (LSB / (°/s)) |
|---|---|---|
| `0x00` | ±250 °/s | 131 |
| `0x08` | ±500 °/s | 65.5 |
| `0x10` | ±1000 °/s | 32.8 |
| `0x18` | ±2000 °/s | 16.4 |

As the scale grows, it does not saturate, but fine detail is lost. The program below spins the robot on the spot at full power and reads the same turn at three scales.

```cpp
// sketch: jiroskop_olcek
#include <Wire.h>

const int MPU = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;

float duyarlilik = 131.0;   // LSB / (°/s); ±250 için 131
int16_t sonHam = 0;

void yaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

void olcekSec(byte secim) {          // 0: ±250, 1: ±500, 2: ±1000, 3: ±2000
  const float tablo[] = {131.0, 65.5, 32.8, 16.4};
  yaz(0x1B, secim << 3);             // GYRO_CONFIG: ölçek bitleri 3-4
  duyarlilik = tablo[secim];
}

float yawHizi() {                    // °/s, sola dönüş +
  Wire.beginTransmission(MPU);
  Wire.write(0x47);                  // GYRO_ZOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  sonHam = (Wire.read() << 8) | Wire.read();
  return sonHam / duyarlilik;
}

void raporla(const char* ad) {
  float gz = yawHizi();
  Serial.print("olcek ");
  Serial.print(ad);
  Serial.print(" gz=");
  Serial.print(gz, 1);
  Serial.println((sonHam >= 32767 || sonHam <= -32768) ? " DOYDU" : " tamam");
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  yaz(0x6B, 0);                      // uyku modundan çık
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);

  digitalWrite(SOL_IN1, LOW);  digitalWrite(SOL_IN2, HIGH);   // sol tekerlek geri
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);    // sağ tekerlek ileri
  analogWrite(SOL_EN, 255);
  analogWrite(SAG_EN, 255);          // yerinde sola dönüş, tam güç
  delay(1500);                       // motorlar hızlansın

  olcekSec(0); delay(50); raporla("+-250");
  olcekSec(1); delay(50); raporla("+-500");
  olcekSec(2); delay(50); raporla("+-1000");

  analogWrite(SOL_EN, 0);
  analogWrite(SAG_EN, 0);
}

void loop() {
}
```

### How does it work?
1. `olcekSec()` writes `secim << 3` to register 0x1B; the scale bits are bits 3 and 4 of the register. It also takes the sensitivity from the table.
2. `yawHizi()` reads two bytes from the GYRO_ZOUT_H (0x47) address and divides by the sensitivity.
3. If the raw value has hit 32767 (or −32768), the scale is not enough; the program marks this as `DOYDU` (saturated).
4. At the ±250 scale the robot really turns at about 380 °/s, but the reading gets stuck at about 250 °/s. At the ±500 scale the real value is visible.

If you add up the heading with a saturated gyroscope, you keep adding too little. This error is different from bias: it grows the faster the robot turns. Know your robot's fastest turn and choose the scale to match.

### Now the fusion: a complementary filter
In lesson 102 you combined the accelerometer and the gyroscope with a complementary filter. The same idea works here too: trust the gyroscope in the short term and the encoder in the long term.

```
heading = α · (heading + gz · dt) + (1 − α) · encoderHeading
```

If `α = 0,98` and `dt = 0,02` s, the filter has a time constant of about 1 second: the gyroscope gives sudden turns smoothly, and the encoder slowly pulls the heading towards its own value. If the gyroscope bias is `b` degrees per second, the error left in the fused heading is about `b · 1 s` (with this setting).

The program spends 24 seconds turning the robot left, driving forwards, turning right more slowly and driving forwards, in turn; at the end the robot is really facing about 330 degrees to the left. The gyroscope has a 2 °/s bias. The program prints the three headings together: gyroscope only, encoder only and fused.

```cpp
// sketch: sensor_birlestirme
#include <Wire.h>

const int MPU = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_YOLU = 2 * PI * 0.033 / 20;   // bir tıkta tekerlek yolu (m)
const float AKS = 0.12;                        // aks aralığı (m)
const float ALFA = 0.98;
const float DUYARLILIK = 65.5;                 // ±500 °/s ölçeği
const unsigned long DONGU_MS = 20;

volatile long tikSol = 0, tikSag = 0;
volatile int yonSol = 1, yonSag = 1;           // sürüş yönü: tık +1 ya da −1 sayılır

float yonJiro = 0;        // yalnız jiroskop (derece)
float yonBirlesik = 0;    // tamamlayıcı filtre (derece)
unsigned long sonDongu = 0, sonYazdir = 0;
bool bitti = false;

void sayacSol() { tikSol += yonSol; }
void sayacSag() { tikSag += yonSag; }

void mpuYaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

float yawHizi() {         // °/s, sola dönüş +
  Wire.beginTransmission(MPU);
  Wire.write(0x47);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int16_t ham = (Wire.read() << 8) | Wire.read();
  return ham / DUYARLILIK;
}

float enkoderYonelimi() { // derece
  noInterrupts();
  long s = tikSol, g = tikSag;
  interrupts();
  float rad = (g - s) * TIK_YOLU / AKS;
  return rad * 180.0 / PI;
}

void surus(int sol, int sag) {          // -255 … 255
  yonSol = sol >= 0 ? 1 : -1;
  yonSag = sag >= 0 ? 1 : -1;
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpuYaz(0x6B, 0);
  mpuYaz(0x1B, 0x08);                   // ±500 °/s
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);
  sonDongu = millis();
}

void loop() {
  unsigned long simdi = millis();

  if (!bitti) {                          // 3 sn'lik aşamalar: sol dön, ileri, sağ dön, ileri
    int asama = (simdi / 3000) % 4;
    if (simdi >= 24000) { surus(0, 0); bitti = true; }
    else if (asama == 0) surus(-150, 150);
    else if (asama == 2) surus(120, -120);
    else surus(150, 150);
  }

  if (simdi - sonDongu >= DONGU_MS) {
    float dt = (simdi - sonDongu) / 1000.0;
    sonDongu = simdi;
    float gz = yawHizi();
    yonJiro += gz * dt;
    yonBirlesik = ALFA * (yonBirlesik + gz * dt) + (1 - ALFA) * enkoderYonelimi();
  }

  if (simdi - sonYazdir >= 1000 && (simdi < 24000 || simdi >= 25000)) {
    sonYazdir = simdi - (simdi % 1000);
    Serial.print("t=");        Serial.print(simdi / 1000);
    Serial.print(" jiro=");     Serial.print(yonJiro, 1);
    Serial.print(" enk=");      Serial.print(enkoderYonelimi(), 1);
    Serial.print(" birlesik="); Serial.println(yonBirlesik, 1);
  }
}
```

### How does it work?
1. The interrupt functions add up the ticks with `yonSol` / `yonSag`. This single-channel encoder cannot tell the direction of rotation; we know the direction from the drive command.
2. `surus()` both drives the motors and sets the sign of the ticks. A wheel going backwards counts its ticks as negative.
3. Every 20 ms, `dt` is worked out from the real time that has passed (the fixed-period idea you saw in lesson 103), the gyroscope is read and both headings are updated.
4. `yonJiro` is the gyroscope integral only. `yonBirlesik`, on the other hand, is pulled gently towards the encoder heading at every step.
5. The headings are printed as accumulated angles: they do not wrap to zero after 360 degrees (for example, two full turns to the left = +720). This makes comparison easier.

In the measurement (2 °/s bias, 0.4 °/s noise), after 24 seconds the difference from the real heading comes out like this: the gyroscope alone drifts by about 50 degrees; the fused heading stays close to the real value, within a few degrees. The encoder heading is also close to the real value but moves in steps; its error is of the order of the roughly 5 degrees that a single tick moves it.

### Try it
- Set `ALFA` to 0.9 and 0.995. Which one suppresses the gyroscope bias more? With which one is the heading smoother?
- At the start, while the robot is still, take the average of `gz` for 1 second and subtract it from later readings. How much does the bias go down?
- Delete the `mpuYaz(0x1B, 0x08)` line (default ±250). When the robot turns at 150 PWM it is at about 180 °/s; does it still saturate? Compare with the full power in the `jiroskop_olcek` program.

### Common mistakes
- Changing the scale without changing the divisor: if you use 131 instead of 65.5, the angles come out at half their value.
- Assuming `dt` is constant and not measuring the real time: if `loop()` slows down for one round, the integral adds up too little.
- Always increasing the encoder ticks without looking at the drive direction: a wheel going backwards is also counted as forwards and the heading is spoiled.
- Wrapping the heading to 0-360 and then filtering it: the difference between 359 and 1 degrees looks like 358. Do the wrapping after the filter.
- Never measuring the gyroscope bias: when still, `gz` should be zero. If it is not, there is a bias.

### What may be different on a real robot
In this simulation the wheels do not slip, so the encoder heading is very good. On a real robot, wheel slip and wheel diameter error also make the encoder heading drift over time; so neither of them is completely reliable. A single-channel encoder does not know the direction; at the moment you change direction the motor does not stop at once, so a few ticks may be counted with the wrong sign. The bias of a real MPU6050 changes with temperature. For real values, look at the datasheet and do your own measurement while it is still.

## Discuss
If the robot is driving along a straight road without turning at all, which heading source would you trust more? On a wet floor where the wheels slip, how does this choice change?

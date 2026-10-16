# Build 1: subsystems
duration: 40

## Wonder
You wrote a three-hundred-line program, ran it for the first time, and the robot spins on the spot. Is the problem in the motor, in the sensor, or in its decisions? If everything is mixed together, you cannot tell. Skilled engineers split a big robot into small parts and test each part **on its own**, by measuring. Today you will build the parts of the path you chose and test them one by one.

## Activity
Each subsystem has three things: functions that do a single job, a way of testing it that can be run on its own, and a pass condition written in numbers. Do the section for the path you chose; read the others if you are curious.

### Path A: drive, distance and line modules
The circuit is the same as the path A table in lesson 111. The sketch keeps the three modules in separate sections and runs each of them separately with one-letter commands from the serial port.

| Module | Function | Test command | Pass condition |
|---|---|---|---|
| Drive | `surus(sol, sag)` | `i` forwards, `g` backwards, `s` turn left, `d` turn right | 1 s forwards: 15-30 cm; 420 ms turn: 80-100° |
| Distance | `tekOlcum()` | `m` | At most 1.5 cm off the distance you measured with a ruler |
| Line | `cizgiKonum(sayi)` | `c` | Line under the middle sensor: position 0; one sensor spacing (2 cm) to the right: position -1 |

```cpp
// sketch: a_alt_sistem
// Yol A alt sistem testi: sürüş, mesafe ve çizgi modüllerini seri komutla tek tek dene.
// Komutlar: i = ileri 1 sn, g = geri 1 sn, s = sola dön 0,42 sn, d = sağa dön 0,42 sn,
//           m = mesafe yaz, c = çizgi konumu yaz
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;      // PWM'in %20'si: altında tekerlek dönmez
const int TABAN = 150;

// ---- SÜRÜŞ MODÜLÜ ----
void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) {
    digitalWrite(in1, LOW);
    digitalWrite(in2, LOW);
    analogWrite(en, 0);
    return;
  }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));   // ölü bölgeyi atla
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

// ---- MESAFE MODÜLÜ ----
float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;      // yankı yoksa "çok uzak"
}

// ---- ÇİZGİ MODÜLÜ ----
// Konum -2 ... +2 (artı = çizgi solda). sayi = çizgiyi gören sensör sayısı.
float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {    // çizgi ~860, zemin ~164
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  Serial.println("hazir");
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  switch (komut) {
    case 'i': surus(TABAN, TABAN);   delay(1000); surus(0, 0); Serial.println("ileri bitti"); break;
    case 'g': surus(-TABAN, -TABAN); delay(1000); surus(0, 0); Serial.println("geri bitti"); break;
    case 's': surus(-TABAN, TABAN);  delay(420);  surus(0, 0); Serial.println("sol bitti"); break;
    case 'd': surus(TABAN, -TABAN);  delay(420);  surus(0, 0); Serial.println("sag bitti"); break;
    case 'm':
      Serial.print("mesafe=");
      Serial.println(tekOlcum(), 1);
      break;
    case 'c': {
      int sayi;
      float konum = cizgiKonum(sayi);
      Serial.print("konum=");
      Serial.print(konum, 2);
      Serial.print(" sayi=");
      Serial.println(sayi);
      break;
    }
  }
}
```

**How does it work?**
1. `motor()` drives a wheel with a number between -255...255. The sign sets the direction, the size sets the speed. If it is not zero, the speed is rescaled between `OLU_BOLGE` (dead zone) and 255; this way small commands are not lost in the dead zone (lesson 78).
2. `surus(sol, sag)` controls both wheels together. The same sign goes straight; opposite signs turn on the spot (lesson 76).
3. `tekOlcum()` (single measurement) measures the HC-SR04's echo time with `pulseIn` and converts it to centimetres by dividing by 58. If no echo comes back, it returns 400 cm, meaning "very far".
4. `cizgiKonum()` (line position) takes the average of the position numbers of the sensors (out of five) that see the line: A2 is the middle (0), A0 is far left (+2), A4 is far right (-2). It gives the number of sensors that see the line in `sayi`; if `sayi` is zero, the line is lost and the position is meaningless.
5. The test commands use `delay`. This is a subsystem test, not the robot's real program; in the real program (lesson 113) you will use `millis()`.

**What we learned by measuring (in the simulator):**
- The `i` command moved the robot about 22.9 cm in 1 s. Your own robot may come out differently; that is why in lesson 113 we will use states and sensors, not time instead of speed.
- With `s` and `d`, a 420 ms turn turned it about 91°. We found this number by measuring: at the same speed, 500 ms turned it about 108°. On your own robot, adjust the `delay` time until the robot turns exactly 90°; a protractor or your phone's compass does the job.

### Path B: the inverse kinematics function and the servo driver
*In the arena activity, open the **B: Robot arm** tab for this path: send the arm to targets with `g x y` commands, and the arena recalculates the tip position from the pulse and checks the 1 mm criterion for you.*

The circuit is the path B table in lesson 111 (servos D9, D10, D11; external power and common GND). Both parts of the arm are 10 cm. Here we gather the two-axis inverse kinematics you saw in lesson 108 in one place. Our angle layout is:

| Servo | Angle | Meaning |
|---|---|---|
| Shoulder (D9) | 0° / 90° | Arm horizontal forwards / straight up |
| Elbow (D10) | 0° / 90° | Arm stretched out straight / elbow at a right angle |

The target point (x, y) is in centimetres; the base is the origin, x forwards, y up. This layout is the same as q1 and q2 in lesson 108 (the elbow servo is q2 directly). The elbow-up solution is found with these steps:

```text
c   = (x² + y² − L1² − L2²) / (2 · L1 · L2)       (law of cosines)
q2  = acos(c)                                      (if c is not between -1 and 1, the point cannot be reached)
q1  = atan2(y, x) + atan2(L2·sin q2, L1 + L2·cos q2)
shoulder servo = q1 (degrees),  elbow servo = q2 (degrees)
forward kinematics: x = L1·cos q1 + L2·cos(q1 − q2),  y = L1·sin q1 + L2·sin(q1 − q2)
```

The servo driver converts the angle to a pulse width. In the Servo library it is 544 µs for 0° and 2400 µs for 180° (lesson 21: `write(90)` gives about 1472 µs). `Servo.write()` only takes whole degrees; `writeMicroseconds()`, on the other hand, gives a position with microsecond precision.

| Module | Function | Test command | Pass condition |
|---|---|---|---|
| Inverse kinematics | `tersKinematik(x, y, omuz, dirsek)` | `g x y` | The tip position found from the angles with forward kinematics is less than 1 mm off the target |
| Servo driver | `dereceyiUsYap(aci)` | `g x y` (the `us=` in the line) | The pulse on the pin differs from the µs written by less than 1.5 µs |
| Reach check | `tersKinematik` returns `false` | `g 25 0` | Prints `ulasilamaz` (unreachable), the servos stay in place |

```cpp
// sketch: b_alt_sistem
#include <Servo.h>

const int OMUZ_PIN = 9;
const int DIRSEK_PIN = 10;
const int TUTUCU_PIN = 11;

const float L1 = 10.0;             // omuz - dirsek (cm)
const float L2 = 10.0;             // dirsek - uç (cm)
const int US_MIN = 544;            // Servo kütüphanesinin 0 derece darbesi
const int US_MAX = 2400;           // 180 derece darbesi

Servo omuz, dirsek, tutucu;

// Derece (0-180) -> darbe genişliği (mikrosaniye)
int dereceyiUsYap(float aci) {
  aci = constrain(aci, 0.0, 180.0);
  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);
}

// Ters kinematik: hedef (x, y) cm -> servo açıları (derece). Ulaşılamazsa false.
// Omuz servosu q1: 0 = yatay ileri, 90 = dik yukarı. Dirsek servosu q2: 0 = kol düz, 90 = dirsek dik açı.
bool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {
  float r2 = x * x + y * y;
  float c = (r2 - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);
  if (c < -1.0 || c > 1.0) return false;          // kol bu noktaya yetişmez
  float s2 = acos(c);                              // dirsek bükülmesi q2 (radyan), dirsek üstte çözüm
  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  omuzAci = q1 * 180.0 / PI;
  dirsekAci = s2 * 180.0 / PI;
  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;
}

// İleri kinematik: açılardan uç noktasını bul (ters kinematiği doğrulamak için)
void ileriKinematik(float omuzAci, float dirsekAci, float &x, float &y) {
  float t1 = omuzAci * PI / 180.0;
  float t2 = dirsekAci * PI / 180.0;
  x = L1 * cos(t1) + L2 * cos(t1 - t2);
  y = L1 * sin(t1) + L2 * sin(t1 - t2);
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);
  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);
  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);
  omuz.writeMicroseconds(dereceyiUsYap(90));
  dirsek.writeMicroseconds(dereceyiUsYap(0));
  tutucu.writeMicroseconds(dereceyiUsYap(30));
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  if (komut != 'g') return;                        // "g 12 4" = x=12 cm, y=4 cm'ye git
  float x = Serial.parseFloat();
  float y = Serial.parseFloat();
  float a1, a2;
  if (!tersKinematik(x, y, a1, a2)) {
    Serial.println("ulasilamaz");
    return;
  }
  omuz.writeMicroseconds(dereceyiUsYap(a1));
  dirsek.writeMicroseconds(dereceyiUsYap(a2));
  float gx, gy;
  ileriKinematik(a1, a2, gx, gy);
  Serial.print("omuz=");   Serial.print(a1, 2);
  Serial.print(" dirsek="); Serial.print(a2, 2);
  Serial.print(" us=");    Serial.print(dereceyiUsYap(a1));
  Serial.print(",");       Serial.print(dereceyiUsYap(a2));
  Serial.print(" kontrol="); Serial.print(gx, 2);
  Serial.print(",");       Serial.println(gy, 2);
}
```

**How does it work?**
1. `tersKinematik()` first checks whether the target is within the arm's reach. Because both parts are 10 cm, the arm reaches at most 20 cm; that is why `g 25 0` is rejected.
2. Example: the `g 12 4` command gives shoulder 69.20° and elbow 101.54°; the sketch produces the pulses `us=1258,1591`. The line `kontrol=12.00,4.00`, which feeds the same angles back into forward kinematics, shows that you wrote the formula correctly. This "round-trip" test is a cheap way to check a function without calculating by hand.
3. `dereceyiUsYap()` converts the angle to microseconds with `544 + açı · (2400 − 544) / 180` (with `açı`, the angle). The `+ 0.5` is for rounding.
4. `ileriKinematik()` works out where the tip of the arm is from the angles. On a real arm you use a ruler to measure the tip position; this function does not replace the ruler, it only tests the formula.

**What we learned by measuring (in the simulator):**
- At five different targets (for example (12; 4), (8; 10), (4; 12), (14; 2), (10; 0)), the tip position found from the pulses we measured on the servo pins was at most 0.14 mm off the target.
- If we had rounded the same angles to whole degrees (like `Servo.write`), the largest deviation would have been 0.9 mm. So rounding alone does not threaten the 5 mm criterion. The real risks are mechanical: gear backlash, the arm bending under its own weight, the servo's dead band, measuring the arm lengths wrongly with a ruler. These do not exist in the simulator; on a real arm, these are what put the criterion under pressure. Look up the dead band of your own servo in its datasheet.

### Path C: the distance PID subsystem
*In the arena activity, the **C: Follow** tab: the real distance (beam, without noise) of the robot approaching the board 44 cm in front of it appears in the right-hand panel; the 17-23 cm criterion is tested against this value.*

The circuit is the path C table in lesson 111. To keep a distance of 20 cm to the target in front, the error is the difference between the measured distance and the target distance: `hata = ölçülen − 20` (error = measured − 20). A positive error means "the target is far away, go forwards"; a negative error means "too close, back off". We add up the three PID terms (lessons 96-98).

| Module | Function | Test | Pass condition |
|---|---|---|---|
| Drive | `surus(sol, sag)` | The same as path A | Path A's conditions |
| Distance | `mesafe()` (median of the last 3 measurements) | The `mesafe=` serial line | At most 1.5 cm off the distance you measured with a ruler |
| PID | inside `loop()` | Stationary target | 17-23 cm, 10 s after catching up |

```cpp
// sketch: c_mesafe_pid
// Yol C alt sistemi: öndeki hedefe 20 cm mesafeyi PID ile koru.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;

const int OLU_BOLGE = 51;
const float HEDEF_CM = 20.0;
const float KP = 9.0;
const float KI = 4.0;
const float KD = 6.0;
const float I_SINIR = 40.0;        // integral toplamının üst sınırı (windup önleme)
const float OLU_ARALIK_CM = 0.5;   // hedefe bu kadar yakınsa dur
const unsigned long DONGU_MS = 60;

float mesafeler[3] = {400, 400, 400};
float integral = 0, oncekiHata = 0;
unsigned long sonDongu = 0;
unsigned long sonYazi = 0;

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;
}

float mesafe() {
  mesafeler[0] = mesafeler[1];
  mesafeler[1] = mesafeler[2];
  mesafeler[2] = tekOlcum();
  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() - sonDongu < DONGU_MS) return;
  sonDongu += DONGU_MS;
  float dt = DONGU_MS / 1000.0;

  float d = mesafe();
  float hata = d - HEDEF_CM;               // artı: hedef uzakta, ileri git
  float turev = (hata - oncekiHata) / dt;
  oncekiHata = hata;

  float u = KP * hata + KI * integral + KD * turev;
  bool doygun = fabs(u) >= 255;
  if (!doygun) {                           // doyduysa integrali büyütme
    integral = constrain(integral + hata * dt, -I_SINIR, I_SINIR);
  }

  int hiz = 0;
  if (fabs(hata) >= OLU_ARALIK_CM) {
    hiz = (int)constrain(u, -200, 200);
  }
  surus(hiz, hiz);

  if (millis() - sonYazi >= 500) {         // ayar yaparken izlemek için
    sonYazi = millis();
    Serial.print("mesafe=");
    Serial.print(d, 1);
    Serial.print(" hata=");
    Serial.print(hata, 1);
    Serial.print(" hiz=");
    Serial.println(hiz);
  }
}
```

**How does it work?**
1. The measurement comes through a **median filter** (the median of 3 measurements); a single wrong reading (noise) does not spoil the decision.
2. The loop runs every 60 ms with `millis()`. The fixed period is there so that the derivative and integral calculations are correct with `dt` (lesson 103).
3. `u` is the sum of the three terms. A large error means a large speed, the error changing fast (`KD`) means braking, and a small error that lasts a long time (`KI`) means an extra push.
4. The `I_SINIR` (integral limit) and `doygun` (saturated) checks prevent the integral from swelling up (windup, lesson 98).
5. If it is closer than 0.5 cm to the target, the robot stops (dead band); otherwise measurement noise could keep the motors jittering.
6. The speed was limited to ±200; it stays a little below full speed.
7. We found the `KP`, `KI`, `KD` values in the simulator by trying by hand, as in lesson 99. Your own robot's motors and target are different; you need to tune the values again.

**What we learned by measuring (in the simulator):**
- The target is a stationary board, and the robot starts at 44 cm. In the first 10 s **catch-up** phase, the robot went slightly past 20 cm and came as close as 13.5 cm. That is why we measure the acceptance criterion "after catching up".
- In the 8 s after catching up, the distance stayed between 18.6 and 21.4 cm. The 17-23 cm criterion is met. Because the measurement noise is 1 cm, a wobble of 1-2 cm is expected.
- **A limit of the subsystem:** when the target suddenly disappeared (we pulled the board away), this subsystem rushed about 38 cm forwards within 1.5 s. This is because it reads a far distance as "the target is very far away, go". This behaviour is not a fault of the PID; it is a missing **decision layer**: in lesson 113 we will solve it by adding a state machine.

### Try it
- **A:** Set `TABAN` to 100 and 200 and repeat the `i` command. Measure the distance travelled in 1 s with a ruler. Is the distance proportional to `TABAN`, or does the dead zone spoil the proportion?
- **A:** Shift the robot to the left and right of the line and check the sign of the `c` command. If the sign is wrong, in lesson 113 the robot will run away from the line.
- **B:** Try the commands `g 19 0` and `g 21 0`. One moves the servos, the other prints `ulasilamaz`. Why is the arm's reach 20 cm?
- **B:** Make your arms 12 and 8 cm instead of 10 (`L1`, `L2`). Is the inverse kinematics still correct? The `kontrol=` line tells you.
- **C:** Set `KD` to 0, then to 20. How do the `hiz` (speed) values in the serial output change? How does noise affect the derivative?
- **C:** Set `OLU_ARALIK_CM` to 0. Does the robot stop at the target, or does it jitter?

### Common mistakes
- Moving on to the next step without testing the subsystem. If you say "I'll look at it once it is combined", you cannot find which part made the mistake.
- A: Giving a low PWM without using `OLU_BOLGE`. The motor does not turn and you think "it doesn't work".
- A: Not trying the line threshold (512) on different floors and in different light. Read the sensor values with `Serial` first (lesson 87).
- B: Taking the servo power from the Arduino. When the servos move, the board resets. External power and a common GND are a must.
- B: Taking the elbow angle in the wrong direction. The formula may be right, but if you fitted the servo the wrong way round, the arm bends to the opposite side; check once with `g 12 4` (it should be shoulder 69.20°, elbow 101.54°) and compare the angle layout with the physical arm.
- C: Giving the distance to the PID without filtering it: the derivative term amplifies the noise.
- C: Not limiting the integral: if the robot cannot reach the target for a long time, the integral swells up and then overshoots the target.

## Discuss
A subsystem test passed, but when you combined everything the robot did not work. In which layer could the bug be? Think about which kind of bug the subsystem tests saved you from finding, and which kind they cannot find.

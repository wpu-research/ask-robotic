# Build 2: integration and testing
duration: 40

## Wonder
Yesterday the path C subsystem rushed 38 cm forwards when the target disappeared. The PID made no mistake; it simply did not know anything called "no target". Subsystems do the job of the parts, but a decision layer decides which one runs when. In this lesson you will combine the parts with a **state machine** (lessons 28 and 84) and test them with a **test matrix**.

## Activity
The rule of combining is simple: in each state a single behaviour runs, transitions between states depend on conditions, and each condition comes from a sensor or from time.

Do only the section for the path you chose; you do not have to read the others.

### What is a test matrix?
A table: each row is a **scenario**, and the columns are the **expected result** and the **measured result**. First you fill in the expected column (from the criteria in lesson 111), then you measure, then you compare. If there is an error, the row turns red and its cause is looked for. Below is each path's matrix; we took the measured column from the simulator.

### Path A: follow the line, avoid the obstacle, stop at the finish line
States:

| State | What it does | Exit condition |
|---|---|---|
| CIZGI_IZLE | Sets the speed of the two wheels according to the line position | The line was seen before and there has been no line for 300 ms: SERBEST |
| SERBEST | Goes straight | All three sensors on a line at once: BITTI. An obstacle closer than 28 cm in front: SOLA_DON |
| SOLA_DON | Turns left on the spot (420 ms, about 90°) | Time up: YANA_GIT |
| YANA_GIT | Goes straight, passes beside the obstacle (2 s) | Time up: SAGA_DON |
| SAGA_DON | Turns right on the spot (420 ms) | Time up: SERBEST |
| BITTI | Stops | None |

(The state names mean: follow line, free, turn left, go sideways, turn right, finished.) The drive, distance and line functions are the same as in lesson 112; what is new is the state machine inside `loop()`. The distance is measured every 60 ms. There is no `delay()` in the program (apart from the short `delayMicroseconds` and `pulseIn` needed for the HC-SR04): the turn and sideways times are counted with `millis()` (lesson 27).

```cpp
// sketch: a_arac
// Yol A: çizgiyi izle, çizgi bitince engelden kaçarak ilerle, bitiş çizgisinde dur.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;          // PWM'in %20'si: altında tekerlek dönmez
const int TABAN = 150;             // düz giderken hız
const float KP = 55.0;             // çizgi konumu başına hız farkı
const float ENGEL_CM = 28.0;       // bundan yakınsa engel var
const unsigned long KAYIP_MS = 300;   // çizgisiz geçen bu süre = çizgi bitti
const unsigned long DONUS_MS = 420;   // yaklaşık 90 derece dönüş süresi (ölçerek bulundu)
const unsigned long YAN_MS = 2000;    // engelin yanından gitme süresi

enum Durum { CIZGI_IZLE, SERBEST, SOLA_DON, YANA_GIT, SAGA_DON, BITTI };
Durum durum = CIZGI_IZLE;
unsigned long durumBasla = 0;
unsigned long sonCizgi = 0;
bool cizgiGordu = false;

float mesafeler[3] = {400, 400, 400};
unsigned long sonOlcum = 0;

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
  return s == 0 ? 400.0 : s / 58.0;   // yankı yoksa "çok uzak"
}

// Son 3 ölçümün ortancası (tek bir hatalı okuma kararı bozmaz)
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

// Çizgi konumu: -2 ... +2 (artı = çizgi solda). Kaç sensör çizgide: sayi
float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {   // çizgi ~860, zemin ~164
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void durumDegis(Durum yeni) {
  durum = yeni;
  durumBasla = millis();
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  int sayi;
  float konum = cizgiKonum(sayi);

  // Mesafeyi 60 ms'de bir ölç
  static float onde = 400;
  if (simdi - sonOlcum >= 60) {
    sonOlcum = simdi;
    onde = mesafe();
  }

  switch (durum) {
    case CIZGI_IZLE:
      if (sayi > 0) {
        cizgiGordu = true;
        sonCizgi = simdi;
        int fark = (int)(KP * konum);
        surus(TABAN - fark, TABAN + fark);
      } else if (cizgiGordu && simdi - sonCizgi > KAYIP_MS) {
        durumDegis(SERBEST);
        Serial.println("durum: SERBEST");
      }
      // çizgi hiç görülmediyse (başlangıç) son komut sürer
      break;

    case SERBEST:
      if (sayi >= 3) {
        surus(0, 0);
        durumDegis(BITTI);
        Serial.println("durum: BITTI");
      } else if (onde < ENGEL_CM) {
        durumDegis(SOLA_DON);
      } else {
        surus(TABAN, TABAN);
      }
      break;

    case SOLA_DON:
      surus(-TABAN, TABAN);
      if (simdi - durumBasla >= DONUS_MS) durumDegis(YANA_GIT);
      break;

    case YANA_GIT:
      surus(TABAN, TABAN);
      if (simdi - durumBasla >= YAN_MS) durumDegis(SAGA_DON);
      break;

    case SAGA_DON:
      surus(TABAN, -TABAN);
      if (simdi - durumBasla >= DONUS_MS) durumDegis(SERBEST);
      break;

    case BITTI:
      surus(0, 0);
      break;
  }
}
```

**How does it work?**
1. Every `loop` round, the line is read, the distance is measured every 60 ms, and then only the code of **the current state** runs.
2. Inside `CIZGI_IZLE`, a difference is worked out according to the line position: `fark = KP · konum` (difference = KP · position). If the line is on the left (positive position), the left wheel slows down, the right one speeds up, and the robot turns left.
3. The "line ended" decision does not depend on a single reading: if the line is not seen at all for 300 ms, it switches to SERBEST. A single sensor error is not mistaken for the end of the line (lesson 89).
4. Going round the obstacle is a **pattern**: turn left, go sideways, turn right, look again. If the obstacle is still in the way, the state machine repeats the same pattern. If it cannot get past the end of the wall in one round, it gets past in the second.
5. Because the finish line crosses the path, three sensors see it at once. This check is only done in the SERBEST state, so that it does not mislead while following the line.

**Test matrix (path A).** Pass condition: stopping at the finish line, not colliding (at least 8 cm between the robot's centre and the nearest wall; the robot's radius is 7.5 cm) and taking less than 20 s.

| No | Scenario | Expected | Measured (simulator) |
|---|---|---|---|
| T1 | Start 4 cm to the right of the line | Finish, no collision | 11.2 s, nearest wall 18.1 cm |
| T2 | Start 5 cm to the right, at a 6° angle | Finish, no collision | 11.2 s, nearest wall 18.2 cm |
| T3 | Start 3 cm to the left, at a -6° angle | Finish, no collision | 11.2 s, nearest wall 18.1 cm |
| T4 | Right motor 4% weaker | Finish, no collision | 11.2 s, nearest wall 10.0 cm |
| T5 | Right motor 3% stronger | Finish, no collision | 11.4 s, nearest wall 12.7 cm |
| T6 | Wait 1 s after finishing | The robot does not move | It did not move (less than 5 mm) |

In T4 and T5 the distance to the wall shrank; in other words, a mismatch between the wheels eats into the tolerance margin. Knowing this margin matters when you write the criterion on a real robot (lesson 93).

**The sensor spacing is different in the arena: tune KP again.** The table above was measured on a test rig with sensors placed 2.0 cm apart. In the **arena** in the lab (this lesson's activity), the line sensors are 2.4 cm apart. `cizgiKonum()` gives the position in units of sensor **number** (−2 ... +2); because the sensors are 20% further apart, the same position value now stands for a 20% larger real deviation, and with `KP = 55` the correction is too harsh. What we measured in the arena:

| `KP` | Arena result |
|---|---|
| 55 | It loses the line: at 3.6 s, before the line ends (x = 1.02 m; the line goes up to 1.30 m), `durum: SERBEST` is printed in the middle of the crossing. The robot wanders freely, collides 3 times and cannot finish the course |
| 52 and below | It finishes (about 11.5 s), no collisions |
| **46** | It finishes (11.3 s), no collisions; it switches to `SERBEST` in the right place, after the line ends (x = 1.31 m) |

Recommendation: use `KP = 46` in the arena (55 / 1.2 ≈ 46; because the sensor spacing grew by 20%, we reduced the gain in the same proportion). General rule: if you change the sensor spacing or use a different array, measure `KP` again; do not copy a number from another set-up. That is why the solution to the arena activity has `KP = 46`. The `a_arac` sketch in this lesson's text was left at `KP = 55`, for the 2.0 cm test rig.

### Path B: a pick-and-place sequence over three points
*In the arena activity, the **B: Robot arm** tab: the part sits at P1, the green circle is P3; the gripper counts as closed above 90° (in this lesson's sketch, open = 30°, closed = 100°). The arena also checks that the part is really picked up and dropped.*

States:

| State | What it does | Exit condition |
|---|---|---|
| P1_GIT | Takes the arm to P1 | Arrived and waited 500 ms: close the gripper, P1_TUT |
| P1_TUT | Waits for the gripper to close | 500 ms passed: head for P2, P2_GIT |
| P2_GIT | Carries the part to P2 | Arrived and waited: head for P3, P3_GIT |
| P3_GIT | Carries the part to P3 | Arrived and waited: open the gripper, P3_BIRAK |
| P3_BIRAK | Waits for the gripper to open | 500 ms passed: "dizi bitti" (sequence finished), BITTI |

(`GIT` means go, `TUT` hold, `BIRAK` release.) The arm does not jump between points: every 20 ms each joint moves at most 1.5° (`adimAt`, take a step). The movement is smooth, and the servo and the part are not suddenly jolted. The waiting times are for the arm to settle and the gripper to close. The sketch prints a line on arriving at each point (`nokta=1`, `nokta=2`, `nokta=3`), so we know the moment of measurement.

```cpp
// sketch: b_kol
// Yol B: üç noktadan al-bırak dizisi. P1'den al, P2'den geçir, P3'e bırak.
#include <Servo.h>

const int OMUZ_PIN = 9;
const int DIRSEK_PIN = 10;
const int TUTUCU_PIN = 11;

const float L1 = 10.0;
const float L2 = 10.0;
const int US_MIN = 544;
const int US_MAX = 2400;
const float TUTUCU_ACIK = 30.0;
const float TUTUCU_KAPALI = 100.0;

const float NOKTA_X[3] = {12.0, 8.0, 4.0};     // cm
const float NOKTA_Y[3] = {4.0, 10.0, 12.0};
const float ADIM_DERECE = 1.5;                 // her 20 ms'de en çok bu kadar
const unsigned long ADIM_MS = 20;
const unsigned long BEKLEME_MS = 500;          // noktada durma süresi

enum Durum { P1_GIT, P1_TUT, P2_GIT, P3_GIT, P3_BIRAK, BITTI };
Durum durum = P1_GIT;

Servo omuz, dirsek, tutucu;
float omuzSimdi = 90, dirsekSimdi = 0;         // şu anki açılar
float omuzHedef = 90, dirsekHedef = 0;         // gidilecek açılar
unsigned long sonAdim = 0;
unsigned long beklemeBasla = 0;
bool bekliyor = false;

int dereceyiUsYap(float aci) {
  aci = constrain(aci, 0.0, 180.0);
  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);
}

bool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {
  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);
  if (c < -1.0 || c > 1.0) return false;
  float s2 = acos(c);                          // q2: dirsek bükülmesi (0 = düz, 90 = dik)
  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  omuzAci = q1 * 180.0 / PI;
  dirsekAci = s2 * 180.0 / PI;
  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;
}

void noktayaGit(int n) {
  if (!tersKinematik(NOKTA_X[n], NOKTA_Y[n], omuzHedef, dirsekHedef)) {
    Serial.println("hata: nokta ulasilamaz");
  }
}

// Açıyı hedefe doğru bir adım ilerlet. Vardıysa true.
bool adimAt() {
  float fo = omuzHedef - omuzSimdi;
  float fd = dirsekHedef - dirsekSimdi;
  omuzSimdi += constrain(fo, -ADIM_DERECE, ADIM_DERECE);
  dirsekSimdi += constrain(fd, -ADIM_DERECE, ADIM_DERECE);
  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));
  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));
  return fabs(fo) < 0.01 && fabs(fd) < 0.01;
}

void nokta(int n) {                            // dizi kaydı: ölçüm için seri satır
  Serial.print("nokta=");
  Serial.println(n);
}

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);
  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);
  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);
  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));
  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));
  tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));
  noktayaGit(0);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonAdim < ADIM_MS) return;
  sonAdim = simdi;

  if (durum == BITTI) return;

  bool vardi = adimAt();
  if (!vardi) return;

  // Vardık: biraz bekle (kol otursun), sonra sıradaki işe geç
  if (!bekliyor) {
    bekliyor = true;
    beklemeBasla = simdi;
    return;
  }
  if (simdi - beklemeBasla < BEKLEME_MS) return;
  bekliyor = false;

  switch (durum) {
    case P1_GIT:
      nokta(1);
      tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_KAPALI));   // al
      durum = P1_TUT;
      break;
    case P1_TUT:
      noktayaGit(1);
      durum = P2_GIT;
      break;
    case P2_GIT:
      nokta(2);
      noktayaGit(2);
      durum = P3_GIT;
      break;
    case P3_GIT:
      nokta(3);
      tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));     // bırak
      durum = P3_BIRAK;
      break;
    case P3_BIRAK:
      Serial.println("dizi bitti");
      durum = BITTI;
      break;
    default:
      break;
  }
}
```

**How does it work?**
1. `noktayaGit(n)` (go to point) only sets the **target angles**. What actually moves the servo is `adimAt()`; `loop` calls it every 20 ms.
2. `adimAt()` moves each joint at most 1.5° towards the target and returns `true` when both have arrived. This way the two joints set off at the same time and the arm moves without springing about.
3. After arriving, it waits 500 ms. This wait is for the arm to settle mechanically and for the gripper to close. The simulator finds the servo position instantly; **a real servo is not in place the moment it gets the pulse**, so adjust this wait by measuring on your own arm.
4. On every arrival, `nokta=N` (point) is printed. The measurement is made at the moment this line arrives.

**Test matrix (path B).** Measurement: at the moment the point line arrives, the tip position is worked out from the pulses on pins D9 and D10 and compared with the target. This is the **commanded** position; the simulator does not include the servo's mechanical error.

| No | Scenario | Expected | Measured (simulator) |
|---|---|---|---|
| T1 | Arrive at P1 | Tip position error < 5 mm; gripper open | 0.05 mm; gripper open |
| T2 | Carry to P2 | Error < 5 mm; gripper closed (part held) | 0.06 mm; gripper closed |
| T3 | Carry to P3 | Error < 5 mm | 0.09 mm |
| T4 | End of the sequence | Prints "dizi bitti"; gripper open; less than 15 s | 4.2 s; gripper open |
| T5 | Smoothness of the movement | The shoulder never jumps more than 2.5° in any 20 ms | It did not jump |

On a real arm these numbers will not come out this good; the 0.05-0.09 mm in the table is the accuracy of the maths and the servo pulse. You will measure the remaining error with a ruler and your own arm.

### Path C: follow the target, stop if it disappears
*In the arena activity, the **C: Follow** tab: the board's movement (moving away, disappearing, coming back) happens by itself over time in the arena; you see the T1, T5 and T6 rows below without doing them by hand.*

States:

| State | What it does | Exit condition |
|---|---|---|
| BEKLE | Stops, looks for a target | A target was seen within range (within 100 cm): TAKIP |
| TAKIP | Keeps a distance of 20 cm with PID | No target for 8 measurements in a row (about 0.5 s): KAYIP |
| KAYIP | Stops | Target seen: TAKIP (the PID is reset) |

(The state names mean: wait, follow, lost.) An important detail: the motors stop at **the moment** the target disappears; they do not wait for the switch to the KAYIP state. The stop command comes before writing the state. When the target comes back, the PID's integral and old error values are reset; otherwise it would shoot off with an old value.

```cpp
// sketch: c_takip
// Yol C: öndeki hedefi 20 cm mesafeden takip et; hedef kaybolursa dur.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;

const int OLU_BOLGE = 51;
const float HEDEF_CM = 20.0;
const float MENZIL_CM = 100.0;         // bundan uzaktaki "hedef" sayılmaz
const float KP = 9.0;
const float KI = 4.0;
const float KD = 6.0;
const float I_SINIR = 40.0;
const float OLU_ARALIK_CM = 0.5;
const unsigned long DONGU_MS = 60;
const int KAYIP_SAYISI = 8;            // art arda bu kadar boş ölçüm = hedef kayıp (~0,5 sn)

enum Durum { BEKLE, TAKIP, KAYIP };
Durum durum = BEKLE;

float mesafeler[3] = {400, 400, 400};
float integral = 0, oncekiHata = 0;
int bosSayac = 0;
unsigned long sonDongu = 0;

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

void pidSifirla() {
  integral = 0;
  oncekiHata = 0;
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
  bool hedefVar = d < MENZIL_CM;

  if (!hedefVar) {
    surus(0, 0);                          // hedef yoksa anında dur (fail-safe)
    bosSayac++;
    if (durum == TAKIP && bosSayac >= KAYIP_SAYISI) {
      durum = KAYIP;
      Serial.println("durum: KAYIP");
    }
    return;
  }
  bosSayac = 0;

  if (durum != TAKIP) {                   // hedef (yeniden) göründü
    durum = TAKIP;
    pidSifirla();
    Serial.println("durum: TAKIP");
  }

  float hata = d - HEDEF_CM;
  float turev = (hata - oncekiHata) / dt;
  oncekiHata = hata;
  float u = KP * hata + KI * integral + KD * turev;
  if (fabs(u) < 255) {
    integral = constrain(integral + hata * dt, -I_SINIR, I_SINIR);
  }
  int hiz = 0;
  if (fabs(hata) >= OLU_ARALIK_CM) {
    hiz = (int)constrain(u, -200, 200);
  }
  surus(hiz, hiz);
}
```

**How does it work?**
1. `hedefVar` (target present) is whether the distance is within range (within 100 cm). A measurement outside the range counts as "no target". If the HC-SR04 gets no echo, `tekOlcum` returns 400, so it goes the same way.
2. If there is no target, the robot stops at once and the counter goes up. When the counter reaches 8 (about 0.5 s), the state becomes KAYIP. The median filter already removes a single empty measurement; two empty measurements in a row stop the robot for that round. This is a deliberate choice: if you cannot be sure, stop.
3. When the target comes back, `pidSifirla()` (reset PID) is called; the old integral does not make it charge at the new target (lesson 98).
4. `BEKLE` and `KAYIP` behave the same (stopping); the reason they are written separately is so that the report in the serial output can show the difference between "I never saw a target" and "I lost the target".

**How did we imitate a moving target?** In the simulator, the target is a wall segment in the `arena.walls` array. Because the array **can be changed**, if we increase the x values of the two ends of the segment over time, the target slowly moves away:

```js
// checks.mjs'ten: her 100 ms'de hedef 3 mm kayar = 3 cm/sn
const tahta = arena.walls.at(-1)        // [x1, y1, x2, y2]
tahta[0] += 0.003; tahta[2] += 0.003
sim.run(100)
```

On a real robot you do the same experiment with a sheet of cardboard in a friend's hand. Important: the person measuring the real distance holds the ruler between the robot's sensor and the target, and does not trust the robot's own measurement.

**Test matrix (path C).** The measured distance is the real sensor-to-target distance known to the simulator (not the robot's noisy measurement). In each row, the first 10 s are for catching up, then comes the measurement.

| No | Scenario | Expected | Measured (simulator) |
|---|---|---|---|
| T1 | The target moves away at 3 cm/s for 8 s (24 cm), then stops | 17-23 cm | 18.3-22.0 cm |
| T2 | T1, right motor 5% weaker | 17-23 cm | 18.2-21.5 cm |
| T3 | T1, right motor 3% stronger | 17-23 cm | 18.7-21.7 cm |
| T4 | T1, the target starts 55 cm away | 17-23 cm | 18.4-22.1 cm |
| T5 | The target suddenly disappears (board pulled away) | Moves less than 3 cm; prints KAYIP | 0.8 cm; printed KAYIP |
| T6 | The target comes back 0.5 m in front | TAKIP again; 17-23 cm within 10 s | Printed TAKIP; within 17-23 cm |

T5, compared with the 38 cm run in lesson 112, shows the value of the state machine: the same PID, the only difference is the decision layer.

### Try it
- **A:** Set `YAN_MS` to 1500 and run the course again. What happens? We will solve the reason with root cause analysis in lesson 115.
- **A:** Set `ENGEL_CM` to 15. How close does the robot get to the obstacle? Which test row breaks in this case?
- **B:** Set `BEKLEME_MS` to 0. What problem would come up on a real arm? Does the error change in the simulator, and why?
- **B:** Make the third point (4; 21) instead of (4; 12). What does the sketch print, and what does the arm do? Is this behaviour safe?
- **C:** Set `KAYIP_SAYISI` to 2 and to 20. How does the robot's behaviour change when the target disappears? Which value keeps you safer?
- **C:** Add a new row to the test matrix: if the target moves away at 5 cm/s, can the robot keep up? Write the expected result first, then measure.

### Common mistakes
- Writing the test matrix after measuring. If you do not write the expected column first, you talk yourself into the result.
- Saying "it works" after a single scenario. Test the same sketch several times by changing things such as the starting position, the wheel mismatch and the speed of the target; a single scenario that works is not proof.
- Using `delay` inside states: sensing stops and the robot is left blind (lesson 26).
- Not resetting the old timer (`durumBasla`, state start) when the state changes: the next state ends at once.
- Carrying on with "the last known command" when the target disappears. When you are not sure, stop the motor.
- C: Not resetting the PID when the state changes: the old integral throws the robot at the new target.
- B: Going to the target by jumping. The servo draws current to get there instantly, the arm jolts and the part falls.

## Discuss
A row in the test matrix came out red and you are thinking of improving the robot. Should your first job be to change the sketch, or first to measure why the row broke? Why does the order of the two matter?

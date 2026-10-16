# Robot arm: a pick-and-place sequence
duration: 35

## Wonder
Robot arms in factories grab a box quickly, carry it and put it in its place. But look carefully: their movements are not jerky, they are smooth. If you tell a servo "go to 90 degrees", it jumps there instantly; the object at the tip of the arm swings, falls, and the gears may even get damaged. In this lesson you will learn to move the arm smoothly and to make it do a pick-and-place job step by step.

## Activity
### Circuit
The arm connection from lesson 108 applies exactly.

| Part | Connection |
|---|---|
| Shoulder servo | signal **D9** |
| Elbow servo | signal **D10** |
| Gripper servo | signal **D11** |
| Servo power | External 5 V supply; the supply's negative connected to the Arduino **GND** (common GND) |

Three servos working together can draw a high current for short moments. Do not power them from the Arduino's 5 V pin. When fitting the battery, do not connect plus and minus the wrong way round, and do not let the terminals touch each other.

### First a sudden movement, then a smooth one
First, look at what a sudden movement does. The program below throws the shoulder from 90° to 30° in one go, and back to 90° 2 seconds later.

```cpp
// sketch: kol_ani_hareket
#include <Servo.h>

Servo omuz;

void setup() {
  omuz.attach(9);
  omuz.write(90);
  delay(1000);
  omuz.write(30);        // bir anda 60° atlar
  delay(2000);
  omuz.write(90);
}

void loop() {
}
```

The servo gets a pulse every 20 ms. The pulse width changes from 90° to 30° in a single frame: the servo rushes there as fast as it can. Meanwhile the arm jolts.

The idea of a smooth movement: do not go to the target in one move; move forwards in small steps between the start and the target. Measure time with `millis()` (lesson 27) and work out an in-between angle every 20 ms:

```
ratio = elapsed time / total time        (between 0 and 1)
angle = start + (target − start) · ratio
```

The longer the total time, the slower the movement. Because the three servos (shoulder, elbow, gripper) share the same time, they all arrive at the same moment.

### The pick-and-place sequence
The sequence has nine steps. Each step has a target point (converted to angles with the inverse kinematics from lesson 108), a gripper state and a duration.

| # | Step | Target (x, y) cm | Gripper | Time (ms) |
|---|---|---|---|---|
| 1 | NESNE_USTU: go above the object | (16, 8) | open | 1500 |
| 2 | ASAGI: lower down to the object | (16, 2) | open | 800 |
| 3 | KAVRA: close the gripper (arm still) | (16, 2) | close | 900 |
| 4 | YUKARI: lift the object | (16, 8) | closed | 800 |
| 5 | TASI: go above the drop point | (7, 12) | closed | 1500 |
| 6 | INDIR: lower down | (7, 5) | closed | 800 |
| 7 | BIRAK: open the gripper (arm still) | (7, 5) | open | 900 |
| 8 | KALK: rise | (7, 12) | open | 800 |
| 9 | EVE: home position | (2, 14) | open | 1500 |

The gripper angles were chosen as `ACIK = 120°` (open) and `KAPALI = 60°` (closed). These depend on your own gripper; find the values at which it opens and closes without straining its gears.

Watch the order: the gripper closes only while the arm has **stopped** next to the object (step 3), and opens only while it has stopped at the drop point (step 7). The gripper does not let go while the arm is moving.

```cpp
// sketch: kol_al_birak
#include <Servo.h>

const int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;
const float L1 = 10.0, L2 = 10.0;
const float DERECE = 180.0 / PI;
const float ACIK = 120, KAPALI = 60;
const unsigned long KARE_MS = 20;          // servo çerçeve süresi

Servo omuz, dirsek, tutucu;

struct Adim {
  const char* ad;
  float x, y;
  float tut;
  unsigned long sure;
};

const int ADIM_SAYISI = 9;
const Adim DIZI[ADIM_SAYISI] = {
  {"NESNE_USTU", 16, 8,  ACIK,   1500},
  {"ASAGI",      16, 2,  ACIK,    800},
  {"KAVRA",      16, 2,  KAPALI,  900},
  {"YUKARI",     16, 8,  KAPALI,  800},
  {"TASI",        7, 12, KAPALI, 1500},
  {"INDIR",       7, 5,  KAPALI,  800},
  {"BIRAK",       7, 5,  ACIK,    900},
  {"KALK",        7, 12, ACIK,    800},
  {"EVE",         2, 14, ACIK,   1500}
};

float simdiki[3];      // omuz, dirsek, tutucu: şu anki açılar
float baslangic[3];
float hedef[3];
int adim = -1;
unsigned long adimBasi = 0, sonKare = 0;

int acidanUs(float aci) {
  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);
}

bool ters(float x, float y, float &q1, float &q2) {
  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c > 1.0 || c < -1.0) return false;
  float s2 = acos(c);
  q1 = (atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2))) * DERECE;
  q2 = s2 * DERECE;
  return q1 >= 0 && q1 <= 180 && q2 >= 0 && q2 <= 180;
}

void servolaraYaz() {
  omuz.writeMicroseconds(acidanUs(simdiki[0]));
  dirsek.writeMicroseconds(acidanUs(simdiki[1]));
  tutucu.writeMicroseconds(acidanUs(simdiki[2]));
}

void adimBaslat(int i) {
  adim = i;
  adimBasi = millis();
  for (int k = 0; k < 3; k++) baslangic[k] = simdiki[k];
  if (!ters(DIZI[i].x, DIZI[i].y, hedef[0], hedef[1])) {
    Serial.println("HEDEF ULASILAMAZ");
    adim = ADIM_SAYISI;                    // diziyi durdur
    return;
  }
  hedef[2] = DIZI[i].tut;
  Serial.print("t=");   Serial.print(adimBasi);
  Serial.print(" ");    Serial.print(DIZI[i].ad);
  Serial.print(" ");    Serial.print(hedef[0], 1);
  Serial.print(" ");    Serial.print(hedef[1], 1);
  Serial.print(" ");    Serial.println(hedef[2], 0);
}

void setup() {
  Serial.begin(9600);
  float q1, q2;
  ters(2, 14, q1, q2);                     // başlangıç konumu
  simdiki[0] = q1; simdiki[1] = q2; simdiki[2] = KAPALI;
  omuz.attach(OMUZ_PIN);
  dirsek.attach(DIRSEK_PIN);
  tutucu.attach(TUTUCU_PIN);
  servolaraYaz();
  delay(1000);
  adimBaslat(0);
}

void loop() {
  unsigned long simdi = millis();
  if (adim >= ADIM_SAYISI) return;         // dizi bitti

  if (simdi - sonKare >= KARE_MS) {
    sonKare = simdi;
    float oran = (float)(simdi - adimBasi) / DIZI[adim].sure;
    if (oran > 1) oran = 1;
    for (int k = 0; k < 3; k++) {
      simdiki[k] = baslangic[k] + (hedef[k] - baslangic[k]) * oran;
    }
    servolaraYaz();
    if (oran >= 1) {                       // adım bitti
      if (adim + 1 < ADIM_SAYISI) adimBaslat(adim + 1);
      else { Serial.print("t="); Serial.print(simdi); Serial.println(" BITTI"); adim = ADIM_SAYISI; }
    }
  }
}
```

### How does it work?
1. The `DIZI` (sequence) table is the whole recipe for the job: step name, target point, gripper state and duration. To add a new job without changing the code, adding a row to the table is enough.
2. `adimBaslat()` (start step) stores the current angles as the start, finds the target angles with inverse kinematics (lesson 108) and records the time. If the target is unreachable, it stops the sequence.
3. Every 20 ms (the servo's frame time), `loop()` works out `oran` (ratio) and writes the in-between angle to all three servos. There is no `delay()`; `loop()` always stays free, so jobs such as reading sensors can be added later.
4. When `oran` reaches 1, the angle settles exactly on the target and the next step starts at once.
5. In the KAVRA and BIRAK steps the target point is the same; only the gripper angle changes. The arm does not move during this time.
6. Because the servo angle is given with `writeMicroseconds()`, the in-between values flow finely even in fractions of a degree.

This method joins the in-between angles with a straight line **in joint space**. The tip of the arm does not draw an exactly straight line between two points; it follows a slightly curved path. Because the vertical descents and rises are short, this does not matter here.

Measuring the pulse widths also confirms the timing: you watch the servo signal to measure the start and end moments of each step. In the measurement the steps finish at the times written in the table, and the angle difference between two consecutive pulses is at most about 1.5°. The same measurement shows a 60° jump in the `kol_ani_hareket` program.

### Try it
- Halve all the `sure` (time) values. As the movement gets faster, how does the difference between consecutive pulses change?
- Use `oran * oran * (3 - 2 * oran)` instead of `oran`. Why is the movement smoother when it starts and finishes?
- Add a third object point to the sequence. If the drop point goes out of reach, what does the program do?

### Common mistakes
- Doing the smooth movement with a `for` loop containing `delay()`: the code cannot do anything else while the movement lasts (lesson 26).
- Forgetting to reset the start at every step: if `baslangic` (start) is not the current angle, the servo jumps to an old place at every step.
- Not limiting `oran` to 1: the servo goes past the target.
- Closing or opening the gripper while the arm is moving: the object falls.
- Forcing the gripper all the way: the servo burns out or the gears get damaged. Find the gripper's mechanical limits beforehand.

### What may be different on a real robot
The servo in the simulation obeys the command instantly and carries no load; in reality the weight of the object, the servo torque and the arm's moment of inertia slow the movement down, and the arm may not settle exactly in the commanded position. When the gripper grabs an object, the servo cannot reach its full closing angle (the object is in the way), and the servo may draw current all the time and heat up; set the closing angle according to the size of the object.

## Discuss
What could happen if a robot arm lifts an object very fast? Why could it be expensive to use a slow arm in a factory? How do you strike the balance between speed and safety?

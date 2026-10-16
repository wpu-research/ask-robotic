# Project: A robot that draws a square and a figure of eight
duration: 35

## Wonder
Drawing robots, toy "turtles" that move along the floor and factory carriers all do the same hard job: drawing a shape and coming back exactly to where they started. A square looks easy: four sides, four corners. But if a small turning error is made at every corner, the last side ends far from the starting point. In this project you make your robot draw a square and then a figure of eight, and then measure how many centimetres from the starting point it stops.

## Activity
### What are we going to do?
This project brings together all of this week's lessons and ideas from earlier weeks:
- **Week 4, lessons 91-92:** two encoders, counting ticks with interrupts (the interrupt rules from Module 3 lesson 29), tick → distance.
- **Week 4, lesson 93:** P correction based on the counter difference, so the two wheels travel the same distance.
- **Week 4, lesson 94:** odometry: estimating `x`, `y`, `θ`.
- **Week 1, lessons 76-78:** differential drive and the PWM dead zone (20% ≈ 51).

First the robot draws a square with 0.5 m sides: 0.5 m forward, turn 90° left, four times. Then it draws a figure of eight made of two circles. At the end of each shape, the robot prints its **return-to-start error**.

### Circuit
Module 5 standard connections:

| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Left encoder | **D2** (interrupt pin), VCC → 5 V, GND → GND |
| Right encoder | **D3** (interrupt pin), VCC → 5 V, GND → GND |
| Power | A separate battery for the motors, common GND |

Safety: Do not power the motors from the Arduino's 5 V pin. Do not short the battery and do not connect it the wrong way round. Never build a circuit with mains voltage (220 V). Test a real robot lifted off the ground first, then put it on a large, empty floor.

### The plan: geometry first
**Turning.** When the robot turns on the spot, the two wheels travel the same distance **in opposite directions**. The robot's centre stays in place; each wheel draws an arc of a circle with a radius of `L/2`. For 90°, the arc length is:

```
arc = angle · radius = (π/2) · (L/2) = 1.5708 · 0.06 m ≈ 9.42 cm  →  ≈ 9.1 ticks
```

So each wheel turns by about 9 ticks: left backwards, right forwards (for a left turn). But as you saw in lesson 94, one tick means 5° of uncertainty. That is why we aim the amount of turning not with ticks but **with the odometry angle `th`**: `yay = (hedefYön − th) · L/2` (arc = (target heading − th) · L/2). The targets of the four turns are absolute: 90°, 180°, 270°, 360°. If you are 4° off at one corner, the next corner corrects it; the error does not build up.

**A straight path.** The two wheels travel the same distance (as in lesson 93, with P correction).

**A circle.** For a circle whose centre line has a radius of `R = 0,25 m`, the radius of the inner wheel is `R − L/2` and of the outer wheel `R + L/2`:

```
inner path = 2π · (0.25 − 0.06) = 1.194 m   (≈ 115 ticks)
outer path = 2π · (0.25 + 0.06) = 1.948 m   (≈ 188 ticks)
```

The two wheels must start at the same time and finish at the same time; so the outer wheel must turn faster than the inner one. Speed ratio = path ratio = 0.613. We achieve this with the idea from lesson 93: the **percentages** the two wheels have completed should stay equal.

**One function does it all.** `hareket(hSol, hSag)` (move): the left wheel travels `hSol` metres and the right wheel `hSag` metres (minus = backwards).
- Straight: `hareket(0.5, 0.5)`.
- Turn left on the spot: `hareket(-yay, +yay)`.
- Left circle: `hareket(ic, dis)`. Right circle: `hareket(dis, ic)`.

Inside, on every pass: update odometry, calculate both wheels' PWM according to "the fraction done", and if there is an error (the leading wheel has gone too far), turn it down and turn up the one behind; slow down when getting close to the target.

When calculating the PWM, we take the dead zone (51) into account (lesson 78): below PWM 51 the motor does not turn. To make the inner wheel's speed 61% of the outer wheel's, multiplying the PWM directly by 0.61 would be wrong; we multiply the part above the dead zone: `PWM = 51 + (v − 51) · oran` (ratio).

**Slowing down.** If you are still going at full speed with 5 cm to go, you travel too far when the motor slides to a stop (lesson 91). So as the remaining distance gets smaller, the PWM drops (to at least 60). The stopping margin gets shorter, and the tick precision is good enough.

### Program
```cpp
// sketch: kare_sekiz
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)
const float L = 0.12;                      // iki tekerlek arası (m)
const int OLU_BOLGE = 51;                  // ders 78: PWM'in %20'si
const float KP = 1000.0;                   // yay hatası (m) başına PWM

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;
int yonSol = 1, yonSag = 1;

float x = 0, y = 0, th = 0;                // odometri tahmini (m, m, rad)
float segSol = 0, segSag = 0;              // hareketin başından beri tekerlek yolları
unsigned long sonIz = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void motor(int en, int a, int b, int pwm) {      // pwm: -255..255
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

void surus(int solPwm, int sagPwm) {
  motor(EN_SOL, IN1, IN2, solPwm);
  motor(EN_SAG, IN3, IN4, sagPwm);
  if (solPwm != 0) yonSol = solPwm > 0 ? 1 : -1;
  if (sagPwm != 0) yonSag = sagPwm > 0 ? 1 : -1;
}

void odometriGuncelle() {
  unsigned int s = oku(tikSol), g = oku(tikSag);
  float dsSol = yonSol * (int)(s - oncekiSol) * TIK_M;
  float dsSag = yonSag * (int)(g - oncekiSag) * TIK_M;
  oncekiSol = s; oncekiSag = g;

  float ds = (dsSol + dsSag) / 2;
  float dth = (dsSag - dsSol) / L;
  x += ds * cos(th + dth / 2);
  y += ds * sin(th + dth / 2);
  th += dth;
  segSol += dsSol;
  segSag += dsSag;

  if (millis() - sonIz >= 250) {                 // iz: x,y (cm)
    sonIz = millis();
    Serial.print("IZ ");
    Serial.print(x * 100, 0);
    Serial.print(' ');
    Serial.println(y * 100, 0);
  }
}

void bekle(unsigned long ms) {
  unsigned long t = millis();
  while (millis() - t < ms) odometriGuncelle();
}

// Sol tekerlek hSol, sağ tekerlek hSag metre yol alsın (işaret = yön).
// İki yol oranını enkoder farkıyla korur, hedefe yaklaşırken yavaşlar.
void hareket(float hSol, float hSag, int pwmBuyuk) {
  segSol = 0; segSag = 0;
  float aSol = fabs(hSol), aSag = fabs(hSag);
  float buyuk = max(aSol, aSag);
  float oranSol = aSol / buyuk, oranSag = aSag / buyuk;
  int isaretSol = hSol < 0 ? -1 : 1;
  int isaretSag = hSag < 0 ? -1 : 1;

  while (true) {
    odometriGuncelle();
    float biten = (fabs(segSol) + fabs(segSag)) / (aSol + aSag);
    float kalan = buyuk * (1 - biten);
    if (kalan <= TIK_M / 2) break;               // yarım tık hassasiyet

    int v = constrain(60 + (int)(600 * kalan), 60, pwmBuyuk);   // yaklaşırken yavaşla
    float hata = fabs(segSol) * oranSag - fabs(segSag) * oranSol;  // >0: sol önde
    int pSol = OLU_BOLGE + (v - OLU_BOLGE) * oranSol - KP * hata;
    int pSag = OLU_BOLGE + (v - OLU_BOLGE) * oranSag + KP * hata;
    surus(isaretSol * constrain(pSol, 0, 255), isaretSag * constrain(pSag, 0, 255));
  }
  surus(0, 0);
  bekle(300);                                    // robot kayarak dursun, tıklar sayılsın
}

void ileri(float metre) { hareket(metre, metre, 200); }

void yonuHedefle(float hedefTh) {                // yerinde dön: yay = açı * L/2
  float yay = (hedefTh - th) * L / 2;
  hareket(-yay, yay, 140);
}

void rapor(const char* ad, float x0, float y0) {
  Serial.print(ad);
  Serial.print(" hata(tahmin) cm: ");
  Serial.print(hypot(x - x0, y - y0) * 100, 1);
  Serial.print(" aci: ");
  Serial.println(th * 180 / PI, 1);
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);
  bekle(500);

  // 1) Kare: 0,5 m ileri, 90 derece sol, dört kez
  float x0 = x, y0 = y;
  for (int i = 1; i <= 4; i++) {
    ileri(0.5);
    yonuHedefle(i * PI / 2);                     // mutlak hedef: hatalar birikmez
  }
  rapor("KARE", x0, y0);

  // 2) Sekiz: yarıçapı 0,25 m iki daire; önce sola, sonra sağa
  x0 = x; y0 = y;
  const float R = 0.25;
  float ic = 2 * PI * (R - L / 2);               // iç tekerleğin çember yolu
  float dis = 2 * PI * (R + L / 2);
  hareket(ic, dis, 180);                         // sol daire: sol tekerlek içte
  hareket(dis, ic, 180);                         // sağ daire: sağ tekerlek içte
  rapor("SEKIZ", x0, y0);
  Serial.println("BITTI");
}

void loop() {}
```

### How does it work?
1. `odometriGuncelle()` does the calculation from lesson 94. It also prints an `IZ x y` (trail) line every 250 ms; this is a record of the path the robot follows.
2. `hareket()` knows it has finished from **the percentages of the two wheels**: `biten = (|segSol| + |segSag|) / (hedefSol + hedefSag)` (done). `hata` (error) is the distance the leading wheel has gone too far, in proportion; `KP · hata` is added to or taken away from the PWM (lesson 93). `KP = 1000 PWM/m`: a 1-tick (1 cm) difference means about 10 PWM.
3. `kalan <= TIK_M / 2`: if the remaining distance is less than half a tick, stop. Waiting for exactly zero (for example the 10th tick instead of 9.09 ticks) would turn the robot about 5° too far.
4. `yonuHedefle()` (aim heading) takes the target angle as absolute. At the last corner the target is 360° (= 2π), so the robot faces the direction it started in.
5. The first circle turns left and the second turns right; the point where the two circles meet is the starting point. This is an "8" shape: two circles joining at a single point.

### The result: return-to-start error
The program prints two lines on the Serial monitor:

```
KARE hata(tahmin) cm: 2.4 aci: 356.4
SEKIZ hata(tahmin) cm: 0.1 aci: 356.4
BITTI
```

This is the robot's **own estimate**. Because the simulation also knows the robot's real position, we can measure the real error (on a real robot you would use a tape measure or a trail drawn on paper). With two robots, with the right wheel's efficiency at 100% and 93% (`gain`):

| Right wheel efficiency | Square: distance from start | Square: final heading | Figure of eight: distance from start |
|---|---|---|---|
| 100% | 2.2 cm | 357° | 0.4 cm |
| 93% | 2.2 cm | 357° | 0.7 cm |

The square's perimeter is 2 m. A 2 cm error is 1 percent of the perimeter. The cause: the tick resolution (5°) at every turn and the robot sliding to a stop. It would be wrong to call this "perfect"; we need to set a **tolerance**.

**Tolerance.** The worst result we measured in the simulation is 2.2 cm. Since one tick is 1 cm and the heading precision is 5°, let's allow a margin of twice that and accept this: **at the end of the shape, at most 5 cm from the start, and a heading error of at most 8°.** On a real robot there will be effects such as slipping, a dusty floor and battery voltage, so hitting 5 cm will be much harder; on a real robot, set the tolerance by your own measurement.

To see that the correction really works, set `KP = 0.0` in the same program (the arc error correction switches off, and the wheels get only the proportioned PWM) and run it with the right efficiency at 93%:
- Square: distance from start **10.3 cm**.
- Figure of eight: distance from start **19.5 cm**.

With the correction they were 2.2 cm and 0.7 cm. So the P correction from lesson 93 is the lifeblood of this project.

### Trail recording: moving to 3D later
The simulation records the robot's path every 20 ms as `[x, y, heading]` (`robot.state.trail`). Our program also prints the same path from odometry with `IZ x y` lines. In the simulation's real trail record, the square draws a box of about 0.5 × 0.5 m and the figure of eight a box of 0.5 × 1.0 m; the program's `IZ` lines give the same shape. Later on, this trail could be used to guide the movement of a 3D robot and to compare the real and virtual paths. The 3D robot is not connected yet; for now the goal is to record the path correctly.

### Try it
- Make the side 0.3 m instead of 0.5 m. How did the return-to-start error change?
- Draw the square turning **right**: `yonuHedefle(-i * PI / 2)`. Why are the targets negative?
- Reduce the circle radius from `R = 0.25` to `0.20`. Which wheel travels less? Work out the inner and outer paths by hand, then compare them with `ic` and `dis` in the program.
- Try a new shape: an equilateral triangle. What is its exterior angle in degrees?

### Common mistakes
- Turning with a fixed "number of ticks" instead of an angle: every turn gives a different error, and the error builds up.
- Forgetting to update odometry during the turn.
- Making the turning target "current angle + 90°": the error builds up. Use an absolute target.
- Scaling the PWM without taking the dead zone into account: the inner wheel may not turn at all.
- Not allowing for the stopping margin: reading the odometry without counting the last ticks.
- Forgetting to measure the start of the shape and saying "the square closed".

### What may be different on a real robot
The errors in the simulation come only from the tick resolution and sliding to a stop. On a real robot there are also wheel slip, measurement errors in the radius and axle track, and a speed that changes as the battery runs down (lesson 94). So the real robot's error may be clearly larger than what we measured here; the shape may not close. That is why the figure of eight is a good test: the error builds up over two circles.

## Discuss
When the square was finished, the robot was 2 cm from the start, and it knew this from the encoders. If the real error had been 8 cm, could the robot have noticed? Which extra sensor would help?

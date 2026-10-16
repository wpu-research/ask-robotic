# Odometry: estimating position and heading, and drift
duration: 30

## Wonder
Imagine walking with your eyes closed in a completely dark room with the lights off. If you count "5 steps forward, turn left, 3 steps", you roughly know where you are. The longer you walk, the worse your estimate gets. Robots do this too. It is called **odometry**: working out where the robot is and which way it is facing from how much the wheels have turned. But how far can we trust this estimate?

## Activity
### The formulas
In lesson 91 we found the distance each wheel travelled from the ticks: `ΔsL` (left) and `ΔsR` (right), in a small time step. The distance between the robot's two wheels is `L = 12 cm`.

**The distance travelled by the centre:** the average of the two wheels.

```
Δs = (ΔsL + ΔsR) / 2
```

**The turning angle:** if the right wheel travelled `d` further than the left, the robot turns left. The two wheels move around the same circle with different radii; because the difference in radius is `L` and the difference in arc is `d`, the angle is `d / L` (arc = angle × radius). We count a left turn as positive:

```
Δθ = (ΔsR − ΔsL) / L
```

(This is the distance version of the formula `ω = (vR − vL) / L` you saw in lesson 76.)

**Position:** the robot moves forward by Δs in the direction it is facing. Because the heading also changes during the step, we use the heading in the **middle** of the step:

```
x ← x + Δs · cos(θ + Δθ/2)
y ← y + Δs · sin(θ + Δθ/2)
θ ← θ + Δθ
```

`θ = 0` means the robot is facing the +x axis, and a positive angle means a left turn. At the start we take `x = y = θ = 0`: odometry works in a coordinate system of "where the robot started".

If you do this calculation very often (for example on every pass of `loop()`), the steps stay small and the estimate comes out accurate.

### A single-channel encoder does not know direction
Our encoder only says "a slot has passed"; it does not say whether the wheel turned forwards or backwards. We know the direction **from the command**: if we drove the motor backwards, we count the ticks as negative. In the program, `yonSol` and `yonSag` (left/right direction) hold the last direction given. With this encoder you cannot correctly track a robot that is pushed from outside or slides backwards. (That is why real robots usually use a two-channel encoder; in Module 4 you found the direction with the A/B channels on a rotary encoder.)

### Circuit
The same as the circuit in lesson 91: motors on D5/D7/D8 and D6/D9/D10, encoders on D2 and D3, separate motor power and a common GND.

### Program 1: draw a path, print the estimate
The robot follows this path: 1 m forward, turn 90° left, 0.5 m forward, turn 90° left, 1 m forward. After each step it prints the odometry estimate (cm and degrees). When going forward, it uses the P correction from lesson 93.

```cpp
// sketch: odometri_temel
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)
const float L = 0.12;                      // iki tekerlek arası (m)

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;
int yonSol = 1, yonSag = 1;                // tek kanallı enkoder yön bilmez

float x = 0, y = 0, th = 0;                // tahmin: m, m, rad

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void odometriGuncelle() {
  unsigned int s = oku(tikSol), g = oku(tikSag);
  float dsSol = yonSol * (int)(s - oncekiSol) * TIK_M;
  float dsSag = yonSag * (int)(g - oncekiSag) * TIK_M;
  oncekiSol = s; oncekiSag = g;

  float ds = (dsSol + dsSag) / 2;          // merkezin aldığı yol
  float dth = (dsSag - dsSol) / L;         // dönüş (sola +)
  x += ds * cos(th + dth / 2);             // ortadaki yönü kullan
  y += ds * sin(th + dth / 2);
  th += dth;
}

void motorlar(int sol, int sag) {          // -255..255
  digitalWrite(IN1, sol > 0); digitalWrite(IN2, sol < 0);
  digitalWrite(IN3, sag > 0); digitalWrite(IN4, sag < 0);
  analogWrite(EN_SOL, abs(sol));
  analogWrite(EN_SAG, abs(sag));
  if (sol != 0) yonSol = sol > 0 ? 1 : -1;
  if (sag != 0) yonSag = sag > 0 ? 1 : -1;
}

void bekle(unsigned long ms) {             // beklerken de tıkları say
  unsigned long t = millis();
  while (millis() - t < ms) odometriGuncelle();
}

void ileriGit(float metre) {               // ders 93'teki P düzeltmesi
  float baslangicX = x, baslangicY = y;
  unsigned int s0 = oku(tikSol), g0 = oku(tikSag);
  while (hypot(x - baslangicX, y - baslangicY) < metre - 0.01) {
    odometriGuncelle();
    int hata = (int)(oku(tikSol) - s0) - (int)(oku(tikSag) - g0);
    motorlar(constrain(200 - 20 * hata, 0, 255), constrain(200 + 20 * hata, 0, 255));
  }
  motorlar(0, 0);
  bekle(400);
}

void solaDon(float derece) {
  float hedef = th + derece * PI / 180;
  motorlar(-100, 100);                     // yerinde dön
  while (th < hedef - 0.05) odometriGuncelle();
  motorlar(0, 0);
  bekle(400);
}

void yaz(const char* ad) {
  Serial.print(ad);
  Serial.print(" x="); Serial.print(x * 100, 1);
  Serial.print(" y="); Serial.print(y * 100, 1);
  Serial.print(" aci="); Serial.println(th * 180 / PI, 1);
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  ileriGit(1.0);   yaz("1");
  solaDon(90);     yaz("2");
  ileriGit(0.5);   yaz("3");
  solaDon(90);     yaz("4");
  ileriGit(1.0);   yaz("5");
  Serial.println("BITTI");
}

void loop() {}
```

Serial output (x, y in cm; angle in degrees):

```
1 x=101.6 y=0.0 aci=0.0
2 x=101.3 y=0.3 aci=89.1
3 x=102.1 y=52.1 aci=89.1
4 x=101.8 y=51.8 aci=178.2
5 x=0.3 y=55.0 aci=178.2
```

### How does it work?
1. `odometriGuncelle()` (update odometry) only takes the ticks that have arrived **since the last call** (`s - oncekiSol`), applies the formulas and updates the `x`, `y`, `th` values. Because it is called very often, we also call it inside `bekle()` (wait) and the `while` loops, so that ticks counted while the robot is turning or sliding to a stop are not lost.
2. We stop the turn by looking at `th`: when `th` gets close to the target (0.05 rad = ~3° to go), the motors switch off. The robot turns a little more before it stops.
3. We told the robot 90°; odometry saw **89.1°**, and the robot really turned about 94°. Because the ticks arrive in steps of 5°, the estimate stays this rough (see below).

### How accurate is the estimate? Comparing with reality
The simulation knows the robot's real position. In the same run, the real position was:

| | x (cm) | y (cm) | heading (degrees) |
|---|---|---|---|
| Odometry estimate | 0.3 | 55.0 | 178.2 |
| Real (simulation) | −2.4 | 36.9 | 188.1 |

The distance between them is **about 18 cm**; the heading is off by 10°. The whole path was only 2.5 m. Why was it so far off? During the first turn the real robot turned 94°, and odometry saw 89°. This is because if the wheel stops in the middle of a slot, that half slot is not counted. This is a **quantisation error**: one tick is about 1.04 cm of travel, and because the wheels are 12 cm apart, **one tick = 5° of turning uncertainty**. If you walk 1 m with 5° of error, you drift 9 cm sideways. The error is made during the turn and grows on the straight path afterwards.

**Solution 1: increase the resolution.** If you set the interrupt to `CHANGE` instead of `RISING`, two edges (LOW→HIGH and HIGH→LOW) are counted for each slot; the number of ticks becomes 40 and `TIK_M` halves (0.52 cm). The same program, with these two changes:

```
estimate: x=−2.9  y=36.9  heading=188.1
real:     x=−2.4  y=36.9  heading=188.1
```

The difference is **0.5 cm**. The error has almost disappeared.

### Drift: build-up and systematic error
Has the error gone now that the resolution is higher? No, only one kind of error has gone. Even if the numbers we measure are correct, the estimate comes out wrong if the **constants** in the formula are wrong.

Let's do the experiment with the CHANGE program. Let's leave the numbers in the program the same, but change the robot in the simulation:

| Real robot | Estimate (stayed the same) | Difference from the real position |
|---|---|---|
| Correct (r = 3.3 cm, L = 12 cm) | x=−2.9 y=36.9 | 0.5 cm |
| Wheel radius 3.45 cm (3.3 in the software) | x=−2.9 y=36.9 | 14.1 cm |
| Axle track 12.5 cm (12 in the software) | x=−2.9 y=36.9 | 13.7 cm |

If the software thinks the wheel radius is 1.5 mm smaller, or the axle track 5 mm smaller, the estimate is off by 14 cm over a 2.5 m path. The program **itself** cannot see the error, because the ticks have been counted correctly; it is the formula that has been fooled. The measurement error builds up: it grows as the path gets longer.

Let's see this error for the heading by turning on the spot. The program turns the robot two full turns (it stops when the estimate reaches 720°):

```cpp
// sketch: donus_birikim
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const float L = 0.12;                      // iki tekerlek arası (m): ölçüm hatası buraya girer

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;
float th = 0;                              // tahmini yön (rad)

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void yonGuncelle() {
  unsigned int s = oku(tikSol), g = oku(tikSag);
  float dsSol = -(int)(s - oncekiSol) * TIK_M;   // sol tekerlek geri
  float dsSag = (int)(g - oncekiSag) * TIK_M;    // sağ tekerlek ileri
  oncekiSol = s; oncekiSag = g;
  th += (dsSag - dsSol) / L;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);   // sol geri
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);    // sağ ileri
  analogWrite(EN_SOL, 100);
  analogWrite(EN_SAG, 100);

  while (th < 4 * PI - 0.1) yonGuncelle();            // 2 tam tur
  analogWrite(EN_SOL, 0);
  analogWrite(EN_SAG, 0);
  delay(500);
  yonGuncelle();

  Serial.print("Tahmin (derece): ");
  Serial.println(th * 180 / PI, 0);
}

void loop() {}
```

The result in the simulation:

| Real axle track | Odometry estimate | Robot's real turn | Difference |
|---|---|---|---|
| 12 cm (the same as the software) | 723° | 720° | 3° |
| 12.5 cm | 723° | 691° | 32° |

With the axle track 4% wrong, two turns gave a drift of 32°; that is about 16° per turn. As the number of turns grows, the difference grows **proportionally**: over 10 turns it would be around 160°. That is why, on a long path, the odometry heading error also makes the position error bigger.

### On a real robot it is worse
In the simulation the wheel **does not slip**. So the ticks give the distance perfectly, and the error only comes from the two causes above: tick resolution and wrong constants. On a real robot, in addition:
- The wheel slips (when accelerating, when turning, on a dusty floor); the encoder counts the rotation, but the robot has not gone that far.
- Sloping floors, wheel wear and the wheel squashing as it presses on the ground change the radius.
- When it hits an obstacle, the wheel turns but the robot stays where it is.

These errors build up, and odometry never corrects itself. After hundreds of steps, the estimate can be completely wrong. The solution is to correct odometry with another sensor: a gyroscope for the heading (the IMU in week 6, combining it with the encoder in week 7), and a line or a wall for the position.

### Try it
- In the `odometri_temel` program, set the interrupt to `CHANGE` and change the 20 in the `TIK_M` formula to 40. How does the estimate get closer to the real position? (Look at the simulation's real position for comparison.)
- Set `L` to 0.13. How does the estimate change at the end of the same path? How would you measure the axle track on your own robot?
- In the `donus_birikim` program, change the turning speed (PWM 100). Does the difference between the odometry estimate and the robot's real turn change? Think about whether a fixed measurement error depends on speed.
- Set the odometry's `yonSol`/`yonSag` variables to a fixed 1 and drive the robot backwards. What happens to the estimate?

### Common mistakes
- Mixing up degrees and radians: `cos` and `sin` want radians.
- Forgetting the sign of the wheel's distance (minus when going backwards).
- Not updating odometry during a turn or inside a `delay`: the ticks build up in the counter, but at that moment the wrong heading is used in the `x`, `y`, `th` calculation.
- Using `L/2` instead of `L` in the turning formula (or the other way round): the angle is off by a factor of two.
- Writing the radius and axle track as guesses instead of measuring them with a ruler.

## Discuss
You have seen that odometry error builds up. How would you know that the robot has returned to its starting point? After drawing a square, what could you rely on to say "I am back where I started"?

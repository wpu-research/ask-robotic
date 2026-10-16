# Project: an explorer robot (search, escape, wander)
duration: 35

## Wonder
An exploration robot is dropped into an unknown room. It has no map, and nobody is controlling it. It will roam the room, not bump into walls and furniture, and also stop by the area it has to visit and say "I'm here". When you combine the parts you learned this week, you can write a robot that does exactly this.

## Activity
### What are we going to do?
This project brings together what you have learned:
- **Week 2:** detecting and escaping obstacles with the ultrasonic sensor.
- **Week 4:** estimating distance and position with encoders (odometry).
- **Module 3:** a non-blocking loop with `millis()` and jobs at fixed intervals.
- **This week:** combining the gyroscope and the encoders (106) and priority between behaviours (107).

The robot has three behaviours, from highest to lowest:

| Priority | Behaviour | When is it active? | What does it do? |
|---|---|---|---|
| 1 | **`KAC`** (escape) | When the front distance drops below 25 cm (until it goes above 60 cm) | Moves away from the obstacle by turning left on the spot |
| 2 | **`ZIYARET`** (visit) | After the first 12 seconds, if the area has not been visited yet | Heads for the centre of the area using the position estimate; when it gets within 15 cm it prints "visited" |
| 3 | **`DOLAS`** (wander) | Always | Goes forwards, turns randomly now and then |

For the first 12 seconds the robot only searches ("search" = wander). Then the wish to go to the area comes in. If an obstacle appears, `KAC` always keeps priority.

The robot knows where the area is: near the top right corner of the arena, centre (1.5 m ; 1.5 m), radius 0.25 m. Its own position, however, it has to estimate: the starting position and direction are known (0.3 m ; 0.3 m, facing right). After that, it is worked out from the encoder distance and the fused heading (lesson 106):

```
x = x + distance · cos(heading)
y = y + distance · sin(heading)
```

### Circuit
Standard Module 5 connections. There is no line sensor and no servo here.

| Part | Connection |
|---|---|
| Left motor (driver) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor (driver) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Left / right encoder | **D2** / **D3** (interrupt pins) |
| Ultrasonic HC-SR04 | TRIG **D11**, ECHO **D12** (looks forwards) |
| MPU6050 | SDA → **A4**, SCL → **A5**, address **0x68** |

Use a separate power supply for the motors and connect the driver's GND to the Arduino GND. When fitting the battery, do not connect plus and minus the wrong way round.

### Program
```cpp
// sketch: gezgin_robot
#include <Wire.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;
const int TRIG = 11, ECHO = 12;
const int MPU = 0x68;

const float TIK_YOLU = 2 * PI * 0.033 / 20;     // m / tık
const float AKS = 0.12;                          // m
const float ALFA = 0.98;
const float DUYARLILIK = 65.5;                   // ±500 °/s

const float KAC_BASLA_CM = 25, KAC_BITIR_CM = 60;
const float BOLGE_X = 1.5, BOLGE_Y = 1.5;        // ziyaret edilecek bölgenin merkezi (m)
const float BOLGE_YAKIN = 0.15;                  // "geldim" mesafesi (m)
const unsigned long ARAMA_MS = 12000;            // önce ara, sonra bölgeye git

struct Oneri { bool aktif; int sol; int sag; };
enum Davranis { KAC, ZIYARET, DOLAS, DAVRANIS_SAYISI };
const char* DAVRANIS_ADI[] = {"KAC", "ZIYARET", "DOLAS"};

volatile long tikSol = 0, tikSag = 0;           // robot hiç geri gitmediği için tıklar hep ileri sayılır
long oncekiSol = 0, oncekiSag = 0;

float x = 0.3, y = 0.3;          // konum tahmini (m)
float yon = 0;                   // birleşik yönelim (derece, sola +)
float encYon = 0;                // yalnız enkoderden yönelim (derece)
float onCm = 400;
bool kaciyor = false, ziyaretEdildi = false;
unsigned long ziyaretSusma = 0;  // bu zamana kadar ZIYARET susar
unsigned long sonDongu = 0, sonOlcum = 0, sonYazdir = 0;
unsigned long donusBitis = 0, sonrakiDonus = 2000;
int donusYonu = 1;

void sayacSol() { tikSol++; }
void sayacSag() { tikSag++; }

void mpuYaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

float yawHizi() {
  Wire.beginTransmission(MPU);
  Wire.write(0x47);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int16_t ham = (Wire.read() << 8) | Wire.read();
  return ham / DUYARLILIK;
}

float mesafeOku() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 25000);
  if (sure == 0) return 400;
  return sure / 58.0;
}

void surus(int sol, int sag) {                 // 0 … 255: robot yalnız ileri gider
  sol = constrain(sol, 0, 255);
  sag = constrain(sag, 0, 255);
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

// Konum tahmini: 20 ms'de bir
void konumGuncelle() {
  unsigned long simdi = millis();
  float dt = (simdi - sonDongu) / 1000.0;
  sonDongu = simdi;

  noInterrupts();
  long s = tikSol, g = tikSag;
  interrupts();
  float dSol = (s - oncekiSol) * TIK_YOLU;
  float dSag = (g - oncekiSag) * TIK_YOLU;
  oncekiSol = s; oncekiSag = g;

  encYon += ((dSag - dSol) / AKS) * 180.0 / PI;              // enkoder yönelimi (mutlak)
  float gz = yawHizi();
  yon = ALFA * (yon + gz * dt) + (1 - ALFA) * encYon;

  float yol = (dSol + dSag) / 2;
  x += yol * cos(yon * PI / 180.0);
  y += yol * sin(yon * PI / 180.0);
}

float aciFarki(float hedefAci, float simdikiAci) {      // -180 … 180
  float f = hedefAci - simdikiAci;
  while (f > 180) f -= 360;
  while (f < -180) f += 360;
  return f;
}

Oneri kac() {
  Oneri o = {false, 0, 0};
  if (!kaciyor && onCm < KAC_BASLA_CM) {
    kaciyor = true;
    ziyaretSusma = millis() + 3000;            // engele takıldıysak 3 sn başka yöne bak
  }
  if (kaciyor && onCm > KAC_BITIR_CM) kaciyor = false;
  if (kaciyor) { o.aktif = true; o.sol = 0; o.sag = 190; }   // sol tekerlek üstünde sola dön
  return o;
}

Oneri ziyaret() {
  Oneri o = {false, 0, 0};
  if (ziyaretEdildi || millis() < ARAMA_MS || millis() < ziyaretSusma) return o;
  float mesafe = sqrt((BOLGE_X - x) * (BOLGE_X - x) + (BOLGE_Y - y) * (BOLGE_Y - y));
  if (mesafe < BOLGE_YAKIN) {
    ziyaretEdildi = true;
    Serial.print("t=");   Serial.print(millis());
    Serial.println(" BOLGE ZIYARET EDILDI");
    return o;
  }
  float hata = aciFarki(atan2(BOLGE_Y - y, BOLGE_X - x) * 180.0 / PI, yon);
  o.aktif = true;
  if (fabs(hata) > 30) {                       // yön çok yanlış: önce dön
    o.sol = hata > 0 ? 0 : 170;
    o.sag = hata > 0 ? 170 : 0;
  } else {                                     // yaklaşık doğru yön: giderken düzelt
    o.sol = 170 - 2 * hata;
    o.sag = 170 + 2 * hata;
  }
  return o;
}

Oneri dolas() {
  Oneri o = {true, 190, 190};
  unsigned long t = millis();
  if (t >= sonrakiDonus) {
    donusBitis = t + random(300, 800);
    donusYonu = random(2) ? 1 : -1;
    sonrakiDonus = donusBitis + random(1500, 3500);
  }
  if (t < donusBitis) {                        // bir tekerlek üstünde dön
    o.sol = donusYonu > 0 ? 0 : 190;
    o.sag = donusYonu > 0 ? 190 : 0;
  }
  return o;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpuYaz(0x6B, 0);
  mpuYaz(0x1B, 0x08);                      // ±500 °/s
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);
  randomSeed(11);
  sonDongu = millis();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonDongu >= 20) konumGuncelle();
  if (simdi - sonOlcum >= 60) { sonOlcum = simdi; onCm = mesafeOku(); }

  Oneri oneri[DAVRANIS_SAYISI];
  oneri[KAC]     = kac();
  oneri[ZIYARET] = ziyaret();
  oneri[DOLAS]   = dolas();

  int secilen = DOLAS;
  for (int i = 0; i < DAVRANIS_SAYISI; i++) {
    if (oneri[i].aktif) { secilen = i; break; }
  }
  surus(oneri[secilen].sol, oneri[secilen].sag);

  if (simdi - sonYazdir >= 5000) {
    sonYazdir = simdi;
    Serial.print("t=");   Serial.print(simdi / 1000);
    Serial.print(" x=");  Serial.print(x, 2);
    Serial.print(" y=");  Serial.print(y, 2);
    Serial.print(" yon="); Serial.print(yon, 0);
    Serial.print(" ");    Serial.println(DAVRANIS_ADI[secilen]);
  }
}
```

### How does it work?
1. **Position estimate.** `konumGuncelle()` (update position) runs every 20 ms. From the ticks it finds the distance of each wheel, and from their average the distance the robot has travelled. The direction comes from the complementary filter in lesson 106: the gyroscope is smooth, the encoder is right in the long term. `x` and `y` are updated with the distance and the heading.
2. **Behaviours.** `kac()`, `ziyaret()` and `dolas()` only return suggestions, as in lesson 107. The arbiter loop picks the first active suggestion.
3. **`KAC`'s patience.** When `KAC` starts, `ziyaretSusma` (visit silence) is moved 3 seconds ahead. Otherwise, if there is a wall in front of the area, the robot heading for the area would turn back to the same wall every time and switch back and forth between `KAC` and `ZIYARET`. These 3 seconds give `DOLAS` a chance to go in another direction.
4. **Forwards only.** The robot never goes backwards; when turning, it stops one wheel (`0`) and drives the other. Because the single-channel encoder does not know the direction of rotation, we can always count the ticks as forwards. If we turned one wheel backwards, the sign of the ticks would become uncertain, because the motor does not stop at once.
5. **Visit.** `ZIYARET` works out the angle to the target (`atan2`). If the angle difference is bigger than 30 degrees, it turns on one wheel; if it is smaller, it corrects with a speed difference between the two wheels while driving straight. When the position estimate gets within 15 cm of the centre of the area, it prints "visited" once.

### Measurement
The robot starts at (0.3 m ; 0.3 m) in a 2 m x 2 m arena; there is a 1 °/s bias on the gyroscope, a 3% slowness on the right wheel and 1 cm of noise on the ultrasonic sensor. The arena is divided into 0.25 m cells (8 x 8 = 64 cells); any cell the robot's track passes through counts as "visited". The measurements from a 40-second run:

| Criterion | Result | Threshold |
|---|---|---|
| Coverage (share of cells visited) | 58% (37 of the 64 cells) | at least 45% |
| Number of collisions | 2 (the counter went up twice for the same wall contact) | at most 3 |
| Time spent pushed against a wall | about 1.3 s | less than 3 s |
| Area visit | at 16 seconds, 13 cm from the area | between 12-40 s, within 25 cm |
| Position estimate error (before the first collision) | below 4 cm | 10 cm |

For comparison, we switched `KAC` off (we set its threshold to 0 cm): the robot pushes against the first wall and stays there; coverage drops to 28% and it stays pushed against the wall for more than 20 seconds.

A collision also has a side effect: while the robot is pushed against a wall in the simulation, the wheels keep turning, the encoder keeps counting and the position estimate slides. In this run, after the first collision the estimate moved about 30 cm away from the real position. The position estimate knows where the robot is only as long as you can count the collisions.

The thresholds were chosen so that this run passes them, but not by a narrow margin. Because of the randomness (`random`) and the sensor noise, every run comes out a little differently; in the other runs, where we changed the seed of the sensor noise, coverage was in the range 58%-64% and collisions 0-3.

### Try it
- Set `ARAMA_MS` to 25000. At what second does the area visit happen? Does the coverage change?
- Change the `BOLGE_X` and `BOLGE_Y` values; move the area close to a corner of the arena (for example 1.8 ; 0.2). Is the visit still successful? Because it is close to the wall, do `KAC` and `ZIYARET` clash?
- Change the `random(300, 800)` and `random(1500, 3500)` ranges in `DOLAS`. To increase coverage, are longer straight runs or more frequent turns better?
- Design a fourth behaviour: `SARJ` (charge: go back to the starting point when the time is up). Where would you put it in the priority order?

### Common mistakes
- Trusting the position estimate absolutely: after a collision or wheel slip, the estimate goes wrong. Measure how long you can trust it.
- Giving the wrong starting position and direction: the starting values of `x`, `y` and `yon` must match the robot's real position.
- Wrapping the heading to 0-360 and then filtering it (lesson 106); wrap it only in the error calculation.
- Using a single threshold for `KAC`: the robot jitters around the threshold; use two thresholds, one for starting and one for ending.
- Skipping `KAC` while going to the area: however strong the wish to reach the target, not bumping into things comes first.

### What may be different on a real robot
In this simulation the floor is flat, the wheels do not slip and the ultrasonic beam is a single straight line. On a real robot, wheel slip spoils the position estimate much faster; the ultrasonic beam is cone-shaped and may not reflect off soft or slanted surfaces. Also, a single-beam sensor sees the obstacle late when approaching a wall at a very shallow angle. The collision in this run happened exactly like that: at 23 seconds the robot touched the top wall while approaching it at a shallow angle of about 12 degrees; at that moment the sensor still showed 30 cm (the `KAC` threshold is 25 cm). On a real robot you add sensors or a bumper at the sides too. Correcting the position estimate from time to time against a known point (for example with the help of a line or a wall) is a standard improvement for this job.

## Discuss
With which number would you measure how well the robot explores: coverage, collisions, or a combination of both? If a "battery low, go back to the charging station" behaviour were also added to the same robot, where would you put it in the priority order, and why there?

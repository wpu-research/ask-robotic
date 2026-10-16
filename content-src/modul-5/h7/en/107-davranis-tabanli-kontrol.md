# Behaviour-based control and priorities
duration: 30

## Wonder
Robot vacuum cleaners sweep the room while also trying not to bump into table legs, and when the battery runs low they go back to the charging station. If you tried to write all of this as one long `if` ladder, the code would become impossible to understand within a few days. Roboticists solve this differently: they make each job a separate "behaviour", and a priority order decides which one has the final say.

## Activity
### Circuit
Standard Module 5 connections: drive motors, an ultrasonic sensor and three line sensors. We do not use the servo; the ultrasonic sensor always looks forwards.

| Part | Connection |
|---|---|
| Left motor (driver) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor (driver) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Ultrasonic HC-SR04 | TRIG **D11**, ECHO **D12** (looks forwards) |
| Line sensors (TCRT5000) | left **A0**, middle **A1**, right **A2** (about 2 cm apart) |

Use a separate power supply for the motors and connect the driver's GND to the Arduino GND.

### The idea: behaviours and a referee
Each behaviour is a small function that answers a single question:

> "Should I be active right now? If yes, what do I suggest for the wheels?"

The function returns an `aktif` (active) flag and two wheel speeds (a suggestion). No behaviour drives the motors itself. It only makes a suggestion. The part that collects the suggestions and picks one is called the **arbiter** (referee). The arbiter is simple: go through the behaviours in priority order and apply the suggestion of the first active behaviour.

In this lesson we have three behaviours, from highest to lowest:

| Priority | Behaviour | When is it active? | Its suggestion |
|---|---|---|---|
| 1 (highest) | **`KAC`** (escape) | When the front distance drops below 25 cm; it lasts until it goes above 60 cm | Turn left on the spot |
| 2 | **`CIZGI`** (line) | If any of the three line sensors sees the line | Go straight or steer slightly according to the line |
| 3 (lowest) | **`DOLAS`** (wander) | Always (default) | Go forwards, turn randomly now and then |

Two points to watch:
- **`KAC`** uses two different thresholds: it starts at 25 cm and ends at 60 cm. Think of this like the hysteresis in lesson 88; otherwise the robot jitters around the threshold.
- **`DOLAS`** always returns `aktif`. The bottom layer says what to do when none of the others is active.

When you want to add a new sensor or a new task as a behaviour, you do not touch the others. You just write a new function and put it in the order.

### Program
At every change of behaviour, the robot writes the time and the name of the new behaviour to the serial port.

```cpp
// sketch: davranis_oncelik
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int SENS_SOL = A0, SENS_ORTA = A1, SENS_SAG = A2;

const float KAC_BASLA_CM = 25;
const float KAC_BITIR_CM = 60;
const int CIZGI_ESIK = 500;          // analogRead: çizgi ≈ 860, zemin ≈ 164

struct Oneri {
  bool aktif;
  int sol;
  int sag;
};

enum Davranis { KAC, CIZGI, DOLAS, DAVRANIS_SAYISI };   // sıra = öncelik
const char* DAVRANIS_ADI[] = {"KAC", "CIZGI", "DOLAS"};

float onCm = 400;
bool kaciyor = false;
unsigned long donusBitis = 0, sonrakiDonus = 2000;
int donusYonu = 1;
unsigned long sonOlcum = 0;
int onceki = -1;

float mesafeOku() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 25000);
  if (sure == 0) return 400;                  // yankı yok: çok uzak
  return sure / 58.0;
}

void surus(int sol, int sag) {                // -255 … 255
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

Oneri kac() {
  Oneri o = {false, 0, 0};
  if (!kaciyor && onCm < KAC_BASLA_CM) kaciyor = true;
  if (kaciyor && onCm > KAC_BITIR_CM) kaciyor = false;
  if (kaciyor) { o.aktif = true; o.sol = -140; o.sag = 140; }   // yerinde sola dön
  return o;
}

Oneri cizgiyiIzle() {
  Oneri o = {false, 0, 0};
  bool sol  = analogRead(SENS_SOL)  > CIZGI_ESIK;
  bool orta = analogRead(SENS_ORTA) > CIZGI_ESIK;
  bool sag  = analogRead(SENS_SAG)  > CIZGI_ESIK;
  if (!sol && !orta && !sag) return o;        // çizgi yok: devrede değil
  o.aktif = true;
  if (sol && !sag)      { o.sol = 60;  o.sag = 150; }   // çizgi solda: sola yönel
  else if (sag && !sol) { o.sol = 150; o.sag = 60; }    // çizgi sağda: sağa yönel
  else                  { o.sol = 150; o.sag = 150; }   // ortada: düz
  return o;
}

Oneri dolas() {
  Oneri o = {true, 170, 170};                 // her zaman devrede: varsayılan
  unsigned long t = millis();
  if (t >= sonrakiDonus) {                    // yeni rastgele dönüş planla
    donusBitis = t + random(300, 800);
    donusYonu = random(2) ? 1 : -1;
    sonrakiDonus = donusBitis + random(1500, 3500);
  }
  if (t < donusBitis) { o.sol = -130 * donusYonu; o.sag = 130 * donusYonu; }
  return o;
}

void setup() {
  Serial.begin(9600);
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  randomSeed(7);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= 60) {               // ultrasonik 60 ms'de bir
    sonOlcum = simdi;
    onCm = mesafeOku();
  }

  Oneri oneri[DAVRANIS_SAYISI];
  oneri[KAC]   = kac();
  oneri[CIZGI] = cizgiyiIzle();
  oneri[DOLAS] = dolas();

  int secilen = DOLAS;                        // hakem: ilk aktif davranış kazanır
  for (int i = 0; i < DAVRANIS_SAYISI; i++) {
    if (oneri[i].aktif) { secilen = i; break; }
  }
  surus(oneri[secilen].sol, oneri[secilen].sag);

  if (secilen != onceki) {                    // davranış değişince yaz
    Serial.print("t=");
    Serial.print(simdi);
    Serial.print(" ");
    Serial.println(DAVRANIS_ADI[secilen]);
    onceki = secilen;
  }
}
```

### How does it work?
1. The order of `enum Davranis` sets the priority: `KAC` is number zero, so it comes first.
2. Every `loop()` round, all three behaviours prepare a suggestion. The arbiter loop starts from `i = 0` and stops with `break` at the first `aktif` suggestion. So if `KAC` is active, whatever `CIZGI` and `DOLAS` suggest is ignored.
3. `surus()` writes the speeds of the chosen suggestion to the motors. Negative speed = backwards.
4. The serial port output answers the question "which behaviour is the robot in right now?". This is the most valuable information when debugging.
5. The ultrasonic measurement is made every 60 ms (`pulseIn` waits, so doing it every round is unnecessary).
6. `dolas()` keeps its own time; it runs even while another behaviour is in charge. So when it goes back to `DOLAS`, the robot may be in the middle of a random turn.

In the simulation the robot starts on a line with a wall at its end. It follows the line (`CIZGI`); 25 cm before the wall, while the line is still visible, `KAC` takes over and overrides the line, and when the turn is finished `DOLAS` starts. The start of the measured serial output looks like this:

```
t=0 CIZGI
t=5580 KAC
t=5940 DOLAS
t=7980 KAC
t=8460 DOLAS
t=10800 KAC
```

`KAC`'s second entry at 7980 milliseconds is also worth noting: during one of `DOLAS`'s random turns, the robot read a distance of 6 cm at the moment the edge of the wall came into the beam. A single-beam sensor sees an obstacle coming from the side late.

### Try it
- Set `KAC_BITIR_CM` to 30. Why does the robot jitter more at the edge of the wall? How often do `KAC` and `DOLAS` swap in the serial output?
- Change the order in the arbiter's `for` loop: move `DOLAS` to the front. What happens? (Guess before you write the answer, then try it.)
- Add a fourth behaviour: `bekle()` (wait): it stops while the button on D2 is pressed (`INPUT_PULLUP`). Where would you put its priority?

### Common mistakes
- Calling `surus()` inside the behaviours: two behaviours write to the motors at the same time and the result becomes unpredictable. A behaviour only returns a suggestion.
- Writing `aktif = true` for all behaviours: the arbiter always picks the first one, and the others never run again.
- A single-threshold escape: a `KAC` that starts at 25 cm and ends at 25 cm makes the robot jitter in front of the wall. Keep the end threshold larger.
- Using `delay()`: the arbiter loop slows down and the robot reacts late (use the millis approach from lesson 27).

### What may be different on a real robot
A single-beam ultrasonic sensor sees an obstacle approaching from the side late; on a real robot, sensors are added at the sides too. On real ultrasonic sensors the echo is sometimes lost, or bounces off side walls and gives a wrong distance; instead of looking at a single measurement, it is a good idea to give the `KAC` behaviour the median of several measurements (the median filter from Module 4). You find the threshold of a real line sensor by calibration (lesson 87); `500` is a value specific to this simulation.

## Discuss
If one behaviour always overrides another, the priority order sets the robot's "character". On a fire alarm robot, how would you order the behaviours "follow the smoke to its source" and "escape from obstacles"? What does changing the order put at risk?

# Counting with interrupts and working out speed
duration: 25

## Wonder
A driver's dashboard says "28 km/h". There is no separate speed-measuring device in the car; there is only a sensor that counts the wheel's turns. Speed is "distance divided by time". So while the robot is doing thousands of jobs a second, how do we count the ticks without missing any and work out the speed? What happens if the window is short, and what happens if it is long?

## Activity
### An interrupt does not miss a tick
In lesson 91 you counted ticks with `attachInterrupt`. The same method applies here: the interrupt function must be **short** (only increase the counter), and `loop()` must read the counters and do the calculation. Do not use `Serial.print` or long calculations inside the interrupt (Module 3, lesson 29).

The speed formula:

```
speed = Δticks · tick_distance / Δt
```

`Δtık` = the number of ticks that arrive within a **window**, `Δt` = the length of the window. Let the window be 100 ms (0.1 s) and the tick distance 1.037 cm. If 3 ticks arrived in the window:

```
speed = 3 · 1.037 cm / 0.1 s ≈ 31.1 cm/s
```

### Circuit
The same as the circuit in lesson 91: motors on D5/D7/D8 and D6/D9/D10, encoders on D2 (left) and D3 (right). Do not forget separate power and a common GND for the motors.

### Program
The robot drives both motors at PWM 200. Every 100 ms the program takes the tick difference and prints the speed of both wheels. There is no `delay`; we measure time with `millis()` (Module 3, lesson 27).

```cpp
// sketch: hiz_olc
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const unsigned long PENCERE_MS = 100;

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

unsigned long sonOlcum = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, 200);
  analogWrite(EN_SAG, 200);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= PENCERE_MS) {
    float dt = (simdi - sonOlcum) / 1000.0;     // gerçek geçen süre (s)
    sonOlcum = simdi;

    unsigned int s = oku(tikSol), g = oku(tikSag);
    unsigned int dSol = s - oncekiSol;          // pencerede gelen tık
    unsigned int dSag = g - oncekiSag;
    oncekiSol = s; oncekiSag = g;

    float vSol = dSol * TIK_M / dt;             // m/s
    float vSag = dSag * TIK_M / dt;

    Serial.print("t="); Serial.print(simdi);
    Serial.print(" dtik="); Serial.print(dSol);
    Serial.print(" vSol="); Serial.print(vSol * 100, 1);
    Serial.print(" vSag="); Serial.println(vSag * 100, 1);
  }
}
```

The first lines of the serial output (cm/s):

```
t=100 dtik=1 vSol=10.4 vSag=10.4
t=200 dtik=3 vSol=31.1 vSag=31.1
t=300 dtik=2 vSol=20.7 vSag=20.7
t=400 dtik=3 vSol=31.1 vSag=31.1
t=500 dtik=3 vSol=31.1 vSag=31.1
t=600 dtik=2 vSol=20.7 vSag=20.7
```

### How does it work?
1. `oncekiSol` (previous left) holds the counter at the end of the last window. `s - oncekiSol` is the number of ticks that arrived in that window. Unsigned subtraction gives the right difference even when the counter wraps round from 65535 to 0 (the overflow rule you saw with millis, Module 3 lesson 27).
2. Instead of writing 0.1 for `dt`, we used the time that really passed. If `loop()` is busy with something else, the window may be a little longer than 100 ms; the formula still stays correct.
3. The speed is only calculated from a **whole number of ticks**. If there are 2 ticks in the window you get 20.7 cm/s, if there are 3 ticks 31.1 cm/s; there is nothing in between.

### Comparing with reality
The simulation also knows the robot's real wheel speed (`wL · yarıçap`, wL · radius). In the same run, after the first half second of speeding up, the real speed was **28.8 cm/s** (the wheel at 8.7 rad/s · 3.3 cm). Our measurement went back and forth between 2 and 3 ticks: 20.7 and 31.1 cm/s. The average is close to the truth (28.8), but a single measurement can be about 8 cm/s below or above it.

The reason for this is **quantisation**: the counter only gives whole numbers. The resolution:

```
smallest speed step = tick_distance / window = 1.037 cm / 0.1 s ≈ 10.4 cm/s
```

So with a 100 ms window, at best you see the speed in steps of 10.4 cm/s.

### Choosing the window: noise versus delay
If you make the window longer, the step gets smaller: at 500 ms, 1.037 / 0.5 ≈ 2.1 cm/s. But if the speed changes, the measurement reacts late; a 500 ms average also includes the half second before.

The program below drives the robot at **low speed** (PWM 100) and prints two calculations side by side: the speed over the last 100 ms and over the last 500 ms (5 windows).

```cpp
// sketch: hiz_pencere
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const unsigned long PENCERE_MS = 100;
const int N = 5;                                // uzun pencere = 5 kısa pencere

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

unsigned int gecmis[N];                         // son N ölçümdeki sol sayaç
int sira = 0;
unsigned long sonOlcum = 0;

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, 100);                     // düşük hız
  analogWrite(EN_SAG, 100);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= PENCERE_MS) {
    sonOlcum = simdi;
    unsigned int s = oku(tikSol);

    unsigned int eski = gecmis[sira];           // 5 ölçüm önceki sayaç
    unsigned int onceki = gecmis[(sira + N - 1) % N];   // bir önceki ölçüm
    gecmis[sira] = s;
    sira = (sira + 1) % N;

    float v100 = (s - onceki) * TIK_M / 0.1;
    float v500 = (s - eski) * TIK_M / (N * 0.1);

    Serial.print("v100="); Serial.print(v100 * 100, 1);
    Serial.print(" v500="); Serial.println(v500 * 100, 1);
  }
}
```

For the first half second the values are wrong because `gecmis[]` (history) has not filled up yet; ignore them. After that (cm/s):

```
v100=10.4 v500=10.4
v100=10.4 v500=10.4
v100=0.0 v500=8.3
v100=10.4 v500=8.3
```

At this speed the real speed is **9.4 cm/s** (the wheel at 2.9 rad/s). The results:
- **The 100 ms window** only gives 0 or 10.4 cm/s. While the robot is moving all the time, in some measurements it looks as if it has "stopped" (0.0). The standard deviation is about 2.9 cm/s.
- **The 500 ms window** stays between 8.3 and 10.4. The standard deviation is about 1.0 cm/s; but if the speed changes suddenly, the measurement is half a second late.
- **The average** of both measurements is close to the real speed (9.4). The problem is in the individual values.

A control system based on speed measurement (week 5) reacts for no reason if it sees a wobbly speed. So you either make the window longer or smooth the measurement (Module 3, lesson 14).

### Try it
- In the `hiz_olc` program, set `PENCERE_MS` to 500. What do you see in the output? What did the resolution become, and how late is the measurement updated?
- In the `hiz_pencere` program, raise the `analogWrite` value from 100 to 200. Does the wobble of the 100 ms window get smaller? Why?
- Change the interrupt mode from `RISING` to `CHANGE` and change the 20 in the `TIK_M` formula to 40 (in this case each slot gives two ticks). How does the speed resolution change?
- Think about measuring the time between two ticks with `micros()` and working out the speed from that: at low speed, which method gives a finer result? Think it through on paper first, then try it.

### Common mistakes
- Putting `Serial.print` or a long calculation inside the interrupt function.
- Using a fixed 0.1 instead of `dt` and calculating the wrong speed when `loop()` slows down.
- Resetting the counters at the end of the window: if an interrupt comes in, a tick is lost. Storing the previous value and subtracting is safer.
- Keeping the window time in an `int`, or using addition instead of `simdi - sonOlcum`.
- Using a short window at low speed and deciding "the robot has stopped".

### What may be different on a real robot
A real encoder module's output can bounce, or the slot widths may not be equal; this means extra noise. The ticks in the simulation are perfectly spaced, so on a real robot the measurements may wobble more than here.

## Discuss
When the robot is going at 30 cm/s, does a 20 ms window or a 500 ms window measure the speed better? With how much delay can you trust the speed of a robot that is about to hit an obstacle?

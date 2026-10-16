# Driving straight: matching the two wheels
duration: 25

## Wonder
When one of the wheels of a shopping trolley is faulty, the trolley always pulls to one side, and you keep correcting it with your hands. The robot has no steering wheel; both motors get the same command, but one turns a little less. Telling both of them to "go" does not make the robot go straight. The robot needs a "hand on the wheel": looking at the counters of the two wheels and speeding up the one that is falling behind.

## Activity
### Two motors are never the same
Even two DC motors of the same model work differently: friction, brush wear, the voltage drop in the driver, how the wheel presses on the floor. At the same PWM, one turns a little slower. In the simulation we can set this with `gain`: let the right wheel's efficiency be **90%** (`gain: {left: 1, right: 0.9}`). So the PWM is the same, but the right wheel is 10% slower.

### Circuit
The same as in the previous lessons: motors on D5/D7/D8 and D6/D9/D10, encoders on D2 (left) and D3 (right). Separate power and a common GND for the motors.

### Program 1: driving forward without adjustment
First let's drive without correction. The robot gives PWM 200 to both motors and goes an average of 193 ticks (about 2 m). At the end it prints both counters.

```cpp
// sketch: duz_ham
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const int HEDEF_TIK = 193;                      // yaklaşık 2 m

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

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, 200);                     // iki tekerleğe aynı PWM
  analogWrite(EN_SAG, 200);

  while ((oku(tikSol) + oku(tikSag)) / 2 < HEDEF_TIK) {}
  analogWrite(EN_SOL, 0);
  analogWrite(EN_SAG, 0);
  delay(600);

  Serial.print("Sol tik: "); Serial.println(oku(tikSol));
  Serial.print("Sag tik: "); Serial.println(oku(tikSag));
  Serial.println("BITTI");
}

void loop() {}
```

With the right wheel 10% slower, the result (in the simulation, on a large floor, with the robot starting in the x direction):

```
Sol tik: 205
Sag tik: 185
```

The left wheel made 20 more ticks. The difference means `1,037 cm · 20 ≈ 21 cm`, and because the two wheels are 12 cm apart, the robot turned **about 100° to the right**. The robot's path is 2 m long, but it is an **arc**: it went only 1.1 m forward from the starting point and drifted **137 cm sideways**. If the right wheel had been only 5% slower (`gain` 0.95): counters 200 and 190, sideways drift **82 cm**. When the wheels are exactly equal (`gain` 1), the drift is 0 cm.

The reason a small difference in efficiency becomes a huge arc after 2 m is that the error **builds up**: once the robot has turned slightly to one side, it travels all the rest of the way in that direction.

### The solution: look at the counter difference
The tick difference (`sol − sağ`, left − right) tells you how much the robot has turned. A difference of 1 tick means about 1 cm of path difference, which is about 5° of heading error (we will work out why in the next lesson). If we bring the difference close to zero, the robot goes straight.

**Proportional (P) correction:** the bigger the error, the bigger the correction.

```
error     = left_ticks − right_ticks      (positive: left ahead)
PWM_left  = 200 − KP · error
PWM_right = 200 + KP · error
```

If the left is ahead, we turn the left motor down and the right one up. `KP` says how many PWM of correction to make per tick of difference. On every pass we read the counters again and recalculate.

### Program 2: driving forward with P correction

```cpp
// sketch: duz_p
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const int HEDEF_TIK = 193;                      // yaklaşık 2 m
const int BAZ_PWM = 200;
const float KP = 20.0;                          // tık farkı başına PWM

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

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void loop() {
  int sol = oku(tikSol), sag = oku(tikSag);
  if ((sol + sag) / 2 >= HEDEF_TIK) {
    analogWrite(EN_SOL, 0);
    analogWrite(EN_SAG, 0);
    delay(600);
    Serial.print("Sol tik: "); Serial.println(oku(tikSol));
    Serial.print("Sag tik: "); Serial.println(oku(tikSag));
    Serial.println("BITTI");
    while (true) {}
  }
  int hata = sol - sag;                         // > 0: sol önde
  int pwmSol = constrain(BAZ_PWM - KP * hata, 0, 255);
  int pwmSag = constrain(BAZ_PWM + KP * hata, 0, 255);
  analogWrite(EN_SOL, pwmSol);
  analogWrite(EN_SAG, pwmSag);
}
```

With the same robot (right wheel 10% slower), the result:

```
Sol tik: 195
Sag tik: 195
```

### The result: in numbers
After going 2 m forward from the starting point, the **sideways drift** `|y − y0|` (from the real position the simulation knows; on a real robot you would measure it with a tape measure):

| Case | Right efficiency | Drift |
|---|---|---|
| No correction | 100% | 0 cm |
| No correction | 95% | 82 cm |
| No correction | 90% | 137 cm |
| P correction, `KP = 5` | 90% | 25.5 cm |
| P correction, `KP = 20` | 95% | 3.3 cm |
| P correction, `KP = 20` | 90% | 6.7 cm |
| P correction, `KP = 40` | 90% | 3.4 cm |

The correction reduced the drift about **20 times** (137 cm → 6.7 cm). As `KP` grew, the drift got smaller. It did not become zero, because the correction only steps in **after** a tick difference has appeared: the error shows up first, then it is corrected. In the first moments the robot goes a little sideways; all of the drift builds up during this transition. In the end the two counters came out equal (195 and 195).

`KP` cannot be made as large as you like: the PWM is limited to the range 0-255, and the measurement also arrives tick by tick. We will study the finer points of this tuning in week 5 (P, D, I).

### Try it
- Set `KP` to 5 and to 40. Did the counters in the output stay equal? Did the robot still drift sideways by the end of the run?
- In the simulation, this time slow down the **left** wheel (`gain: {left: 0.9, right: 1}`). Does the same program correct it? Which line turns down which wheel?
- Lower `BAZ_PWM` to 120. The robot goes more slowly and there is PWM room left for the correction. Did the drift change?
- Apply the correction only to the right wheel (the left stays at 200 all the time). What changes?

### Common mistakes
- Writing the sign of the correction the wrong way round: the slow wheel slows down even more and the robot drifts more.
- Measuring the distance by looking at the counter of a single wheel: while drawing an arc, one wheel travels a different distance from the other, so taking the average is more accurate.
- Choosing `KP` too small and saying "the correction does not work".
- Subtracting `unsigned` values without converting the counter difference to `int`: a negative difference turns into a very large number.

### What may be different on a real robot
On a real robot, the difference in wheel efficiency is not fixed: it changes as the battery voltage drops, as the floor changes and as the motors warm up. In the simulation the difference is kept fixed; so on a real robot, do not take it for granted that the correction will work well with a single `KP`; tune it in the field.

## Discuss
Why did the robot that drove 2 m without correction drift sideways by a lot, and not just "a bit"? If P correction can never bring the error to zero, what do you think should be added?

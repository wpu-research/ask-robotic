# The wheel encoder: tick → distance
duration: 25

## Wonder
How does a car's odometer know the distance? It counts how many turns the wheel has made, and it also knows how many metres one turn is. Multiply them and you have the distance. Until now your robot has always estimated distance by looking at time: "go for 2 seconds, that comes to about 60 cm." When the battery is running low or the floor gets slippery, this estimate does not hold. In this lesson you fit the robot with its own odometer.

## Activity
### What is an encoder?
On the wheel or the motor shaft there is a thin disc with slots around its edge. On either side of the disc there is a light source and a light sensor. As the disc turns, the slots let the light through and block it in turn. The sensor produces an electrical pulse at each pass. We will call each of these pulses a **tick**.

Our robot's encoder disc has **20 slots**. The output goes from HIGH to LOW and from LOW to HIGH. We will only count **the change from LOW to HIGH (the RISING edge)**. This way each slot makes one tick: when the wheel turns once, **20 ticks**.

### How does a tick turn into distance?
The wheel's radius is `r = 3,3 cm`. When the wheel turns once, it travels its own circumference along the ground (we assume it does not slip):

```
circumference = 2 · π · r = 2 · 3.1416 · 3.3 cm ≈ 20.73 cm
```

Since there are 20 ticks in one turn, one tick is worth:

```
tick distance = circumference / 20 ≈ 1.037 cm
```

Let's look at it the other way round: how many ticks is 1 metre?

```
100 cm / 1.037 cm ≈ 96.5 ticks
```

So if the robot goes 1 m, the counter should read about 96-97. We will try this straight away.

### Circuit
| Part | Connection |
|---|---|
| Left motor (driver L298N or TB6612) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Left encoder output | **D2** (interrupt pin), VCC → 5 V, GND → GND |
| Right encoder output | **D3** (interrupt pin), VCC → 5 V, GND → GND |
| Motor power | A separate battery/power supply for the motors; the driver's GND must be common with the Arduino GND |

Safety: Do not power the motors from the Arduino's 5 V pin. Use a separate battery and join the GNDs. Do not short the battery and do not connect it the wrong way round. Never build a circuit with mains voltage (220 V).

D2 and D3 are the two pins on the Uno that can take an interrupt. You saw the rules for interrupts in lesson 29 of Module 3, and reading an encoder in lesson 57 of Module 4. Here we do the same for two wheels.

### Program
Our first program does two things: the robot counts enough ticks to go 1 m, stops, and works out the distance from the ticks.

```cpp
// sketch: tik_mesafe
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float CEVRE = 2 * PI * 0.033;     // tekerlek çevresi (m)
const int YUVA = 20;                    // diskteki yuva sayısı
const float TIK_M = CEVRE / YUVA;       // bir tıkın mesafesi (m)

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

void ilerisur(int pwm) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, pwm);
  analogWrite(EN_SAG, pwm);
}
void dur() { analogWrite(EN_SOL, 0); analogWrite(EN_SAG, 0); }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();                       // okurken kesme araya girmesin
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

  Serial.print("Tik basina cm: ");
  Serial.println(TIK_M * 100, 2);
  Serial.print("1 m icin tik: ");
  Serial.println(1.0 / TIK_M, 1);

  int hedefTik = (int)(1.0 / TIK_M + 0.5);   // 1 m kaç tık (yuvarla)
  ilerisur(200);
  while (oku(tikSol) < hedefTik) {}
  dur();
  delay(600);                                 // robotun durmasını bekle

  unsigned int s = oku(tikSol), g = oku(tikSag);
  Serial.print("Sol tik: "); Serial.println(s);
  Serial.print("Sag tik: "); Serial.println(g);
  Serial.print("Mesafe (cm): ");
  Serial.println(s * TIK_M * 100, 1);
}

void loop() {}
```

On the Serial monitor you see this:

```
Tik basina cm: 1.04
1 m icin tik: 96.5
Sol tik: 98
Sag tik: 98
Mesafe (cm): 101.6
```

### How does it work?
1. With `attachInterrupt(..., RISING)` we attached two interrupts to D2 and D3. Every time the pin rises from LOW to HIGH, the matching `sayi...()` (count) function runs and adds one to the counter. Whatever the main program is doing, no tick is missed.
2. The counters are `volatile`. Because `unsigned int` is 2 bytes, the 8-bit Arduino cannot read it in a single instruction; if an interrupt comes in while it is being read, a half-read number can come out. That is why the `oku()` (read) function switches interrupts off for a brief moment with `noInterrupts()` and takes a copy.
3. `TIK_M` (tick in metres) is calculated once: `CEVRE / YUVA` (circumference / slots). Distance = number of ticks × `TIK_M`.
4. The robot got the stop command at 97 ticks, but we counted **98 ticks**. This is because the motor does not stop the instant it is told to; it keeps turning for a few tens of milliseconds. This extra tick shows up on the counter too. The counter tells you the distance the robot really travelled, not the distance you wanted.

The simulation also knows the robot's real position. In the same run, the robot's real distance came out at 101.3 cm; the one we worked out from the ticks was 101.6 cm. The difference is 0.3 cm, about a third of a tick. The left and right counters came out the same because the two wheels turned equally. You will see in lesson 93 that this is not always the case.

### Going to a target in cm
Turning a distance target into ticks takes one line: `hedefTik = istenenCm / TIK_CM` (target ticks = requested cm / tick in cm). The program below asks for 20, 50 and 100 cm and measures how far it went each time.

```cpp
// sketch: tik_hedef_cm
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_CM = 2 * PI * 3.3 / 20;   // bir tıkın mesafesi (cm)

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

void surus(int pwm) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, pwm);
  analogWrite(EN_SAG, pwm);
}

// istenen cm kadar ileri git, ölçülen mesafeyi (cm) döndür
float ileriCm(float istenen) {
  unsigned int baslangic = oku(tikSol);
  unsigned int hedef = (unsigned int)(istenen / TIK_CM + 0.5);
  surus(180);
  while (oku(tikSol) - baslangic < hedef) {}
  surus(0);
  delay(500);                                   // durma payını bekle
  return (oku(tikSol) - baslangic) * TIK_CM;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  float istek[3] = {20, 50, 100};
  for (int i = 0; i < 3; i++) {
    float olculen = ileriCm(istek[i]);
    Serial.print("Istenen: "); Serial.print(istek[i], 0);
    Serial.print(" cm  Olculen: "); Serial.print(olculen, 1);
    Serial.println(" cm");
  }
  Serial.println("BITTI");
}

void loop() {}
```

Output:

```
Istenen: 20 cm  Olculen: 20.7 cm
Istenen: 50 cm  Olculen: 50.8 cm
Istenen: 100 cm  Olculen: 100.6 cm
BITTI
```

It is always a little more than requested. There are two reasons: the target number of ticks is rounded to a whole number (20 cm = 19.3 ticks → 19 ticks), and the robot slides as it stops, so the counter goes up one more tick (20 ticks instead of 19 = 20.7 cm). What matters is that the **measured** value is close to the truth: in the simulation, for each of the three distances, the measured value matched the real distance to within 1.5 cm.

### Try it
- Change `YUVA` from 20 to 30 and interpret the output. Does the counter go wrong, or the distance calculation? On a real robot, where would you find this number?
- In the `tik_hedef_cm` program, set the target to 5 cm. What percentage was the difference between requested and measured? Why is the tick resolution felt more over a small distance?
- Raise the PWM from 180 to 255. Does the robot go further for the same target? Why?

### Common mistakes
- Putting the wheel's diameter into the formula instead of its radius: the distance comes out twice as large.
- Mixing up centimetres and metres: `TIK_M` is in metres, `TIK_CM` in centimetres.
- Not making the counter `volatile`, or reading a 2-byte counter without switching interrupts off.
- Thinking the counter has stopped because the robot has stopped: the sliding margin goes into the counter.
- Connecting an encoder to only one wheel and assuming the robot goes straight.

### What may be different on a real robot
A real wheel squashes slightly when it presses on the ground, and it can slip on the floor. Measuring the circumference with a ruler and putting it into the formula is a good start, but there is still a margin of error. The simulation wheel in this lesson is an ideal robot that does not slip; that is why the measurements are so close to the truth.

## Discuss
Does a wheel encoder measure the distance the robot really travelled, or the distance the wheel turned? When are the two not the same?

# Finding the clearest path with a servo scan
duration: 25

## Wonder
You have stopped in front of an obstacle. Which way will you go now? Left or right? A person turns their head, looks, and walks towards the empty side. The robot has no head, but it has a servo that carries its sensor. The servo turns the sensor left and right, the robot measures how clear each direction is, and it decides to turn towards the farthest one.

## Activity
### Circuit
The connections are the same as in lesson 82; the difference is that the servo now really moves.

| Part | Connection |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Servo carrying the sensor | Signal → **D4** (fix the sensor on top of the servo) |
| Left motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Right motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Power warning:** Use a separate battery for the servo and the motors, and also connect the battery's negative to the Arduino GND (common GND). Do not power the servo and the motors from the Arduino's 5 V pin. Do not short the batteries and do not connect them the wrong way round.

### The servo angle sets the direction
In lesson 21, `write(90)` brought the servo to the middle. Because the sensor is fixed to the servo, the servo angle also sets the direction of the beam:

| Servo angle | Beam direction |
|---|---|
| 90° | straight ahead |
| 150° | 60° to the robot's left |
| 30° | 60° to the robot's right |

So **a large angle = left**. We will scan from −60° to +60° in 30° steps: servo angles 30, 60, 90, 120, 150.

### Program
First, picture the arena: the robot is facing a wall, but the left end of the wall is open; so you can get past on the left. The program measures the directions in turn, chooses the farthest direction and turns there.

```cpp
// sketch: tara_en_acik
#include <Servo.h>

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}

const int SERVO_PIN = 4;
const int ACI_ADET = 5;
const int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol
const int MS_DERECE = 5;                               // yerinde dönüş: ~5 ms / derece (HIZ = 160 için)

Servo tarayici;

// 3 ölçümün ortancası
int medyan3() {
  int a = mesafeOlc(); delay(10);
  int b = mesafeOlc(); delay(10);
  int c = mesafeOlc();
  if (a > b) { int t = a; a = b; b = t; }
  if (b > c) { int t = b; b = c; c = t; }
  if (a > b) { int t = a; a = b; b = t; }
  return b;
}

// Servoyu 30°...150° gezdirir, her yönde ölçer, en uzak ölçülen açıyı döndürür
int enAcikAci() {
  int enIyiAci = 90;
  int enIyiCm = -1;
  for (int i = 0; i < ACI_ADET; i++) {
    tarayici.write(ACILAR[i]);
    delay(300);                      // servo hedefe varsın
    int cm = medyan3();
    Serial.print(ACILAR[i]);
    Serial.print(":");
    Serial.println(cm);
    if (cm > enIyiCm) {
      enIyiCm = cm;
      enIyiAci = ACILAR[i];
    }
  }
  tarayici.write(90);
  return enIyiAci;
}

void setup() {
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
  Serial.begin(9600);
  delay(500);

  int aci = enAcikAci();
  Serial.print("SECILEN ");
  Serial.println(aci);

  int fark = aci - 90;                  // + = sola
  if (fark > 0) surus(-HIZ, HIZ);
  else if (fark < 0) surus(HIZ, -HIZ);
  delay(abs(fark) * MS_DERECE);
  surus(HIZ, HIZ);
}

void loop() {
}
```

### How does it work?
1. The `ACILAR` (angles) array holds the servo angles to scan (lesson 4, arrays). `ACI_ADET` is the length of the array.
2. At each angle it first tells the servo `write`, waits 300 ms (so the servo reaches its target), then takes the distance as the median of 3 measurements (lesson 82). The waiting time depends on the servo; measuring with a servo that is still moving gives a wrong result.
3. With `if (cm > enIyiCm)`, the farthest measurement so far and its angle are remembered.
4. When the scan ends, the servo goes back to 90°. The robot turns by `fark = aci - 90` (difference = angle − 90): if the difference is positive, to the left (`surus(-HIZ, HIZ)`); if it is negative, to the right. The turning time is `|fark| × 5 ms`; in lessons 81 and 82 we saw that 450 ms comes to about 90°.
5. After turning, it drives straight.

**What we measured (simulation):**
- With the left side of the wall open, the measurements came out roughly like this: 30° → 57 cm, 60° → 32 cm, 90° → 29 cm, 120° → 33 cm, 150° → 115 cm. The program printed `SECILEN 150` (chosen 150), the robot turned about 60° to the left, passed the end of the wall and carried on.
- In a mirrored version of the same arena with the right side open, the measurements were reversed: 30° → 116 cm, 150° → 57 cm. The program printed `SECILEN 30` and the robot turned about 60° to the right. So the code finds out by itself which side of the arena is open; turning left or right is not written into the code.
- The scan took about 1.7 seconds (5 directions × 300 ms of waiting, plus the measurements). During this time the robot stands still.

### Try it
- Add 0 and 180 to the `ACILAR` array (update `ACI_ADET` too). What do the measurements show at very wide angles? At angles close to the sides, does it make sense to turn the robot towards the side wall?
- Reduce the step from 30° to 15° (9 directions). How much longer does the scan take? Does the chosen direction become more accurate?
- Change it so that instead of choosing the farthest direction, it chooses "the direction closest to straight ahead that is farther than 40 cm". Does the robot turn less?

### Common mistakes
- Measuring right after telling the servo `write`: the servo is still on its way, and the measurement is a mix of two directions.
- Writing `ACI_ADET` so that it does not match the real length of the array: the loop runs past the end of the array.
- Mixing up left and right. Remember: 90° is ahead, a large angle is left.
- Using the sign of `fark` the wrong way round: the robot turns away from the open direction.
- Forgetting to bring the servo back to 90° after the scan: the following measurements look sideways.
- Not thinking about what to do if every direction is short. If all the measurements are close, the "farthest" direction is a wall too. We will deal with this case in lesson 84.

### What may be different on a real robot
- A real servo is not as quick and repeatable as in the simulation; set the waiting time to suit your own servo. A servo can draw a sudden current when it starts moving; if it is powered from the same battery as the Arduino, this can cause problems such as the board resetting. Separate power and a common GND reduce this.
- The real HC-SR04 beam is a wide cone (lesson 82). When you scan in 30° steps, the beams of neighbouring directions overlap; thin obstacles can slip between them.
- Beams looking towards the sides see the side wall at a slant; on a slanted surface the reflection may not return to the sensor and give a "very far" measurement. This misleads the choice of a clear path.
- The scan takes about 2 seconds. If you meet a moving obstacle (a person, another robot), the scan result may already be out of date.

## Discuss
The robot stands still during the scan, and this takes about 2 seconds. What might be the price of speeding up the scan (fewer angles, shorter waits)? Which is more important: a fast decision or a correct decision?

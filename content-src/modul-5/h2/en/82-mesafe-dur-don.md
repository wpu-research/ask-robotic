# Stop and turn with a distance sensor
duration: 25

## Wonder
A car with parking sensors beeps faster as it gets closer to the wall; it warns you before you hit it. With the bumper sensor, the news came when you hit something. With the ultrasonic sensor we will make the robot stop without touching the obstacle. But there is a catch: the sensor's measurement comes out slightly different every time. How will the robot decide when to stop with this jumpy measurement?

## Activity
### Circuit
| Part | Connection |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Servo carrying the sensor | Signal → **D4** (always 90° in this lesson, that is, straight ahead) |
| Left motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Right motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Power warning:** Use a separate battery for the servo and the motors, and also connect the battery's negative to the Arduino GND (common GND). Do not power the servo and the motors from the Arduino's 5 V pin. Do not short the batteries and do not connect them the wrong way round.

The sensor is at the front centre of the robot, about 6 cm in front of the centre. The distance you measure is the distance to the sensor, not to the robot's centre.

### Program
**First, let's watch the measurement.** The robot is standing still, 44 cm from the wall. On every pass we print two numbers: a single measurement (`ham`, raw) and the median of 5 measurements (`medyan`). You will remember the median filter from lesson 38: sort the measurements and take the middle one; the odd measurement that jumps is thrown out. In the simulation we added random noise of about ±3 cm to the measurement. On real sensors the measurement jumps around too.

```cpp
// sketch: mesafe_yaz
#include <Servo.h>

const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

Servo bakis;                         // sensörü taşıyan servo

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

// 5 ölçümün ortancası (38. dersteki medyan filtre)
int medyan5() {
  int d[5];
  for (int i = 0; i < 5; i++) {
    d[i] = mesafeOlc();
    delay(10);
  }
  for (int i = 1; i < 5; i++) {      // ekleme sıralaması
    int x = d[i];
    int j = i - 1;
    while (j >= 0 && d[j] > x) {
      d[j + 1] = d[j];
      j--;
    }
    d[j + 1] = x;
  }
  return d[2];
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
  Serial.begin(9600);
}

void loop() {
  int ham = mesafeOlc();
  int med = medyan5();
  Serial.print(ham);
  Serial.print(" ");
  Serial.println(med);
  delay(100);
}
```

**Now stop and turn.** The robot drives straight and takes a single measurement on every pass. When the distance drops below `ESIK_CM`, it stops and turns right on the spot. The first version trusts a single measurement.

```cpp
// sketch: mesafe_tek_dur
#include <Servo.h>

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

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

const int ESIK_CM = 25;              // bundan yakındaysa dur

Servo bakis;                         // sensörü taşıyan servo

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  int cm = mesafeOlc();
  if (cm < ESIK_CM) {
    surus(0, 0);                     // 1) dur
    Serial.print("DUR ");
    Serial.println(cm);
    surus(HIZ, -HIZ);                // 2) yerinde sağa dön (~90°)
    delay(450);
    surus(0, 0);
    return;
  }
  surus(HIZ, HIZ);
  delay(20);
}
```

**With the median.** The same program, but the decision depends on the median of the last 5 measurements instead of a single measurement.

```cpp
// sketch: mesafe_medyan_dur
#include <Servo.h>

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

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

const int ESIK_CM = 25;              // bundan yakındaysa dur
const int N = 5;

// N ölçümün ortancası (38. dersteki medyan filtre)
int medyan() {
  int d[N];
  for (int i = 0; i < N; i++) {
    d[i] = mesafeOlc();
    delay(8);
  }
  for (int i = 1; i < N; i++) {
    int x = d[i];
    int j = i - 1;
    while (j >= 0 && d[j] > x) { d[j + 1] = d[j]; j--; }
    d[j + 1] = x;
  }
  return d[N / 2];
}

Servo bakis;                         // sensörü taşıyan servo

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  int cm = medyan();
  if (cm < ESIK_CM) {
    surus(0, 0);                     // 1) dur
    Serial.print("DUR ");
    Serial.println(cm);
    surus(HIZ, -HIZ);                // 2) yerinde sağa dön (~90°)
    delay(450);
    surus(0, 0);
    return;
  }
  surus(HIZ, HIZ);
}
```

### How does it work?
1. `mesafeOlc()` (measure distance) gives TRIG a 10 µs pulse, measures the length of the pulse on ECHO with `pulseIn` and divides it by 58 (for 1 cm, sound spends about 58 µs going there and back). If no echo comes back, it returns 400.
2. `ESIK_CM = 25` means: stop when the sensor is 25 cm from the obstacle. At this moment the robot's centre is about 31 cm from the obstacle.
3. The robot does not stop the moment you say `surus(0, 0)`. Because of motor lag (80 ms), it moves about 1.5 cm further. Take this margin into account when you choose the threshold.
4. The turn lasts 450 ms; as in lesson 81, this is about 90°.

**What we measured (simulation, robot driving towards the wall from 0.3 m):**
- In the `mesafe_yaz` program, with a real distance of 44 cm, the single measurements averaged about 44 cm but wobbled by about 3 cm (standard deviation about 3). The median value wobbled by about 2 cm: about half as much as a single measurement.
- Without noise, both programs stopped when the sensor was about 24-25 cm from the wall, and the robot turned about 90° to the right. It did not touch the wall.
- We exaggerated the noise to 6 cm and ran four separate trials. The single-measurement robot stopped at 33, 33, 34 and 35 cm: even though the threshold was 25, it braked early because of fake "obstacle ahead" readings. The median robot stopped at 27, 24, 25 and 28 cm, that is, much closer to the threshold.

Noise does not only cause early stops. On a real robot, if a single measurement shows "far" once, the robot may also see the obstacle too late. The median reduces both.

### Try it
- In the `mesafe_medyan_dur` program, set `N` first to 3, then to 9. How steady is the stopping distance? What happens to the robot's decision speed as the number of measurements grows?
- Lower `ESIK_CM` to 15. Does the robot still stop without touching the wall? Take the slide after the stop command into account too.
- After the robot stops, wait 1 second (`delay(1000)`) and print the distance it sees with `Serial.println(medyan())`. Does it stop a little below the threshold?

### Common mistakes
- Trusting a single measurement. A fake measurement stops the robot or makes it miss the obstacle.
- Thinking of the threshold relative to the robot's centre. The sensor is at the front of the robot, and the robot also travels some distance while stopping.
- Not giving `pulseIn` a timeout: if no echo comes back, the program waits for 1 second.
- Reading a result of 0 when no echo comes back as "0 cm, I am right at the wall". Our function returns 400 if there is no echo. Very close objects may not return an echo either (check the minimum measuring distance in the datasheet).
- Putting a long `delay` in the measurement loop: meanwhile the robot drives on blindly.

### What may be different on a real robot
- The HC-SR04 does not send a narrow beam; it spreads out like a cone. Its width depends on the module (check the datasheet). The sensor may also see a side wall or the floor and give a wrong distance; the sensor in the simulation is a single thin beam.
- Sound hitting a slanted wall may bounce off in another direction instead of returning to the sensor. The robot then thinks the wall is farther away than it is, or not there at all.
- Soft surfaces such as fabric, sofas and curtains absorb sound; the echo becomes weak and the measurement may be wrong or empty.
- The speed of sound changes with temperature; the divisor 58 is an approximate value.
- Small, thin objects (a chair leg) return a very weak echo.
- Real noise does not look like the even spread in the simulation; now and then you also see measurements that are completely wrong. The median is still the most reliable first step.

## Discuss
If you choose a large threshold, the robot stops safely but cannot get through narrow gaps. If you choose a small one, the risk of a crash grows. With noise and a braking margin, how would you choose the threshold?

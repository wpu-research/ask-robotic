# D: derivative and noise
duration: 30

## Wonder
When you are driving and see that you are approaching the edge fast, you start correcting the steering straight away, even though you are still far from it. You do not just look at "how far away am I", but also at "how fast am I getting closer". In control this is called the **D (derivative)** term. But there is a trap: if the measurement jitters, D amplifies that jitter. In this lesson you will see both with numbers.

## Activity
### Concepts
- **Derivative:** the rate of change of the error. `turev = (e - sonHata) / dt` (cm/s). If the error is growing fast, the derivative is large.
- **PD control:** `u = Kp x e + Kd x turev`. When the error starts to grow, D sees it at once and brakes hard; while the error is shrinking, D softens the response. This is what damping means.
- The question for day 16 of Hyvex's internship programme: "The robot reaches the target but oscillates: which term, which direction?" Answer: the D term provides the damping; increase Kd (or decrease Kp).

### Why wall following in this lesson?
A wall follower is a good place to see D: the steering first changes the robot's **heading**, and the heading then changes the **distance**. Because the effect is delayed, the robot overshoots the target as Kp grows. In the project (lesson 100) we will measure how a large Kd spoils the lap time on the line array.

The servo turns the ultrasonic sensor **180 degrees** (to the left); the beam goes at right angles to the wall on the robot's left. Error: `e = mesafe - HEDEF`. `e > 0` means the robot is far from the wall and needs to turn left, towards the wall. The direction rule is the same as in lesson 96: `u > 0` turn left.

### Circuit
| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| HC-SR04 | TRIG **D11**, ECHO **D12**, VCC 5 V, GND |
| Servo | Signal **D4** (180 degrees = looks left) |

Use external power for the motors and the servo, and connect all GNDs together. Do not short-circuit the battery or connect it the wrong way round.

### Program
```cpp
// sketch: d_duvar
#include <Servo.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 16.0;             // PWM / cm
const float KD = 3.0;              // PWM / (cm/s)
const float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok, 1'e yaklaştıkça daha yavaş
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
float mesafe = HEDEF;
float sonHata = 0;
float turevSuz = 0;                // süzülmüş türev

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

// Mesafe (cm). Yankı yoksa -1.
float olc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long us = pulseIn(ECHO, HIGH, 25000);
  if (us == 0) return -1;
  return us / 58.0;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};
  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  servo.write(180);                // ışın sola, duvara dik
  delay(500);
  float ilk = olc();
  if (ilk > 0) mesafe = ilk;
  sonHata = mesafe - HEDEF;        // ilk türev sıçramasını önle
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float m = olc();
  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru

  float e = mesafe - HEDEF;        // + : duvardan çok uzak
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;   // basit alçak geçiren süzgeç

  float u = KP * e + KD * turevSuz;
  u = constrain(u, -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);       // u > 0: duvara (sola) dön
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
```

### How does it work?
1. `olc()` gives the distance in cm, as in lesson 82. If no echo comes back, we use the old measurement.
2. The derivative is the difference between two measurements divided by the time between them. Because `DT = 50` ms, we take 20 measurements per second.
3. In `setup()`, `sonHata` is set from the first measurement. If we do not set it, there is a fake jump in the derivative in the first loop.
4. `turevSuz` is the filtered version of the derivative: `turevSuz = ALFA * turevSuz + (1 - ALFA) * turev`. `ALFA = 0` means no filter. `ALFA = 0.8` takes only 20% of each new derivative; this gives a smoothing of about 0.2 s.
5. `u` is first limited by `UMAX`, so the robot does not spin on the spot when the error is very large.

### Measurement 1: what happens when Kp grows, and what does D do?
The robot starts parallel to the wall, **4 cm away** from the target (19 cm). Straight wall, no noise. Two runs for each Kp: `Kd = 0` and `Kd = 0.15 x Kp`.

| Kp | Kd | Overshoot (beyond the target) | Error RMS | Result |
|---|---|---|---|---|
| 16 | 0 | 3.8 cm | 0.97 cm | settled |
| 16 | 2.4 | 1.3 cm | 0.35 cm | settled |
| 32 | 0 | 6.5 cm | 1.67 cm | large overshoot |
| 32 | 4.8 | 1.0 cm | 0.20 cm | settled |
| 48 | 0 | 7.5 cm | 2.36 cm | touched the wall |
| 48 | 7.2 | 1.5 cm | 0.31 cm | settled |
| 64 | 0 | 7.5 cm (touched the wall) | 7.98 cm | touched the wall, then stayed 10.6 cm from the wall |
| 64 | 9.6 | 2.5 cm | 0.56 cm | settled |

"Overshoot 7.5 cm" means the robot touched the wall (the robot's radius is 7.5 cm). Reading the table:
- With P alone, increasing Kp **did not improve things, it made them worse**: the overshoot went from 3.8 cm up to 7.5 cm.
- At the same Kp values, `Kd = 0.15 x Kp` made the overshoot 3 to 6.5 times smaller and saved the robot from hitting the wall. The error RMS dropped about 3 times at Kp = 16, and more than 7 times at Kp = 32 and above.

### Measurement 2: how does noise spoil D?
We added 1 cm of random noise to the ultrasonic measurements (`noiseCm = 1`). A 1 cm wobble, even over 50 ms, produces a typical **fake speed** of about 28 cm/s (the difference between two measurements / 0.05 s). D multiplies this fake speed by Kd and sends it to the motors. `Kp = 16`, same start:

| Setting | Error RMS | Steering jitter |
|---|---|---|
| Kd = 0 (P) | 1.21 cm | 0.29 |
| Kd = 3, no filter (`ALFA = 0`) | 0.49 cm | 1.21 |
| Kd = 3, filtered (`ALFA = 0,8`) | 0.58 cm | 0.51 |
| Kd = 20, no filter | 2.02 cm | 1.57 |
| Kd = 20, filtered | 1.09 cm | 1.12 |

- Unfiltered D suppressed the error well (RMS 1.21 -> 0.49), but the steering jitter went up **4 times** (0.29 -> 1.21). The motors jittered non-stop.
- The filter cut the jitter by more than half (1.21 -> 0.51). In return, D is a little delayed; the overshoot went from 1.4 cm up to 2.3 cm.
- **Making Kd far too large** does not help: at Kd = 20 the error grew again and the robot stayed inside the target band (+-2 cm) only 49% of the time.

### How do you choose Kd?
1. Start with `Kd = 0`; increase Kp until you see overshoot.
2. Start with `Kd = 0.15 x Kp` (here `16 x 0.15 = 2.4`; the sketch uses a little more, 3). If the overshoot shrinks, increase it.
3. If the motor starts to jitter or make noise, decrease Kd or increase `ALFA`.

### What may be different on a real robot
- A real HC-SR04 on a side wall, especially when it looks at the wall at an angle, may return a wrong echo or none at all. The 1 cm of noise in the simulation is optimistic.
- Do not carry these rules ("0.15 x Kp") over to your own robot unchanged. The numbers belong to the robot in this simulation; the method (Kp first, then Kd, then the filter) holds.

### Try it
- Set `Kp = 32` and set `KD` to 0, 2, 5 and 10. How does the error change?
- Set `ALFA` to 0.5 and 0.95. Which one makes the motor jitter less, and which one overshoots more?
- Start the robot 4 cm away from the target and delete the `sonHata = mesafe - HEDEF;` line in `setup()`. What changes in the first second?

### Common mistakes
- Using unfiltered D with a noisy measurement: the motor buzzes and jitters.
- Choosing Kd far too large compared with Kp: the error does not shrink, it grows.
- Changing the control period (`DT`) without updating `dt`: the derivative is scaled wrongly.
- Not initialising `sonHata` when working out the first derivative: in the first loop the robot makes a jerky move.
- Writing the sign of Kd the wrong way round: instead of damping, D makes the oscillation bigger.

## Discuss
Can you now answer the question "The robot reaches the target but oscillates: which term, which direction?" with numbers? If the measurement is noisy, is it better to make Kd smaller or to filter the measurement? What is the cost?

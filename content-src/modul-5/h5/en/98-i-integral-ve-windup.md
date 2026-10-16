# I: integral and windup
duration: 35

## Wonder
If a car's right tyre is slightly less inflated, the car slowly pulls to one side when you let go of the steering wheel. On robots, too, the efficiency of the two motors is never the same. P control tries to correct this pull, but it has a trap: the correction depends on the error, and when the error is zero, the correction is zero too. So the robot never quite reaches the target; it always drives a little off to the side. In this lesson you will see the term that **accumulates** the error (I) and its side effect (windup).

## Activity
### Concepts
- **Steady-state error:** an error that does not close even after a long time. It happens in P control when there is a constant outside influence (a weak motor).
- **Integral (I):** the sum of the error over time: `integral += e * dt`. Even a small error builds up if it lasts long, and makes the correction bigger. `u = Kp x e + Ki x integral + Kd x turev`.
- **Windup:** when the output hits its limit (the motor cannot get more than 255 PWM), the integral keeps building up because the error continues. Then, even when the error reverses, this built-up value keeps the output in the wrong place for a long time.
- **Anti-windup:** methods that prevent windup. You will see two: limiting the integral, and stopping the integral when the output saturates.

### Circuit
| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| HC-SR04 | TRIG **D11**, ECHO **D12** |
| Servo (180 degrees, looks left) | Signal **D4** |
| Left encoder | **D2** (interrupt pin) |

External power for the motors and the servo, common GND. Do not short-circuit the battery or connect it the wrong way round.

### Program 1: a robot with a weak motor following a wall
We added an integral to the wall follower from lesson 97. The integral is limited by `ILIM`.

```cpp
// sketch: i_duvar
#include <Servo.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 6.0;              // PWM / cm
const float KI = 2.0;              // PWM / (cm x s)
const float KD = 3.0;              // PWM / (cm/s)
const float ILIM = 30.0;           // integral sınırı (cm x s); KI x ILIM = 60 PWM
const float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok, 1'e yaklaştıkça daha yavaş
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
float mesafe = HEDEF;
float sonHata = 0;
float turevSuz = 0;                // süzülmüş türev
float integral = 0;                // hataların birikimi (cm x s)

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

  integral += e * dt;
  integral = constrain(integral, -ILIM, ILIM);       // sınırla: sonsuza gitmesin

  float u = KP * e + KI * integral + KD * turevSuz;
  u = constrain(u, -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);       // u > 0: duvara (sola) dön
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
```

### Measurement 1: steady-state offset
We weakened the right motor by 15% (`gain: right = 0,85`). Straight wall, target 15 cm, 12 s. The robot tends to drift away from the wall; stopping this needs a constant steering of about 13 PWM.

| Setting | Average offset in the last 1 s | Staying within +-2 cm after 6 s |
|---|---|---|
| `KI = 0` (PD) | 2.25 cm | 7% |
| `KI = 2` (PID, in the lesson) | 0.09 cm | 95% |

With P control you can work out the offset: to produce a constant 13 PWM with `Kp = 6`, the error has to stay at `13 / 6 = 2.2 cm`. The integral, however, takes this constant steering on itself: even when the error drops to 0, the integral keeps its built-up value. When the motors are equal, the same PID keeps the offset at 0.06 cm; I does no harm when it is not needed.

Changing `KI` changes how fast the offset closes. The offset at around 12 s in the same run:

| KI | 0.5 | 1 | 2 (in the lesson) | 6 | 12 |
|---|---|---|---|---|---|
| Offset | 0.97 cm | 0.41 cm | 0.09 cm | 0.08 cm | 0.09 cm |

As KI grows, the offset closes faster. At KI = 12, however, the target was overshot by 0.8 cm (at KI = 2 there is no overshoot). As KI grows, overshoot starts to increase.

`ILIM` limits the integral. It can contribute at most `KI x ILIM` PWM to the output: in the lesson `2 x 30 = 60` PWM, more than the 13 PWM needed. If you set `ILIM = 3`, then `2 x 3 = 6` PWM is not enough; in the same run the offset went down from 2.25 cm to 1.27 cm but did not close.

### Program 2: prove windup
Windup shows up most clearly in **speed control**. The robot tries to go at 15 cm/s, then at 25 cm/s. Then we set the target to 50 cm/s. The motor gives at most about 39.6 cm/s (12 rad/s x 3.3 cm), so the output hits 255 and the error does not close. After 4 seconds we drop the target back to 15. In the sketch you can compare the two cases with `ANTI_WINDUP`. (You will find out where the values `Kc = 7,4` and `Ti = 0,08` come from by measuring in lesson 99; for now, take them as given.)

```cpp
// sketch: i_hiz_windup
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2;                 // sol enkoder (kesme pini)

const float TIK_CM = 1.0367;           // bir tık = 1,04 cm yol (20 yuva, 3,3 cm yarıçap)
const float KC = 7.4;                  // PWM / (cm/s)
const float TI = 0.08;                 // integral zamanı (s)
const bool ANTI_WINDUP = false;        // true: çıkış doyunca integrali durdur
const unsigned long DT = 20;

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
unsigned long son = 0;
unsigned long sonYazdir = 0;
float integral = 0;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

void tik() {
  unsigned long t = micros();
  aralikUs = t - sonTikUs;             // son iki tık arası süre
  sonTikUs = t;
}

// Tekerlek hızı (cm/s): bir tıkın yolu / tıklar arası süre.
float hizOku() {
  noInterrupts();
  unsigned long aralik = aralikUs;
  unsigned long sonTik = sonTikUs;
  interrupts();
  unsigned long gecen = micros() - sonTik;
  if (aralik == 0 || gecen > 200000UL) return 0;   // 0,2 sn tık yoksa durdu say
  if (gecen > aralik) aralik = gecen;              // yavaşlıyorsa eski aralığa güvenme
  return TIK_CM * 1000000.0 / aralik;
}

// İstenen hız (cm/s): 15 -> 25 -> 50 (motorun gücünü aşar) -> 15
float hedefHiz(unsigned long t) {
  if (t < 1500) return 15;
  if (t < 3500) return 25;
  if (t < 7500) return 50;
  return 15;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float hiz = hizOku();
  float e = hedefHiz(millis()) - hiz;

  // Bu turda integrali eklersek çıkış ne olurdu?
  float aday = KC * (e + (integral + e * dt) / TI);
  bool doymus = (aday <= 0 || aday >= 255);
  if (!(ANTI_WINDUP && doymus)) integral += e * dt;   // doymuşken biriktirme

  float u = KC * (e + integral / TI);
  u = constrain(u, 0, 255);
  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);

  if (millis() - sonYazdir >= 500) {          // integralin nasıl büyüdüğünü izle
    sonYazdir = millis();
    Serial.print(millis());
    Serial.print(",");
    Serial.print(hedefHiz(millis()), 0);
    Serial.print(",");
    Serial.print(hiz, 1);
    Serial.print(",");
    Serial.println(integral, 1);
  }
}
```

### How does it work?
1. The speed is worked out from the time between two encoder ticks (the encoder ticks from lessons 91-92): `speed = distance of one tick / time between ticks`. While the interrupt routine writes this time, the reading is placed between `noInterrupts()` and `interrupts()` so the main program does not read a half-written value (lesson 29).
2. Here PI is in its standard form: `u = Kc x (e + integral / Ti)`.
3. `aday` (candidate) works out what the output would be if we added the integral in this round. If `aday` goes below 0 or above 255, the output is saturated.
4. When `ANTI_WINDUP = true`, the integral is not increased in saturated rounds. Stopping the accumulation while the output is saturated is the "conditional integration" method.
5. Every 500 ms the serial output prints `zaman, hedef, hız, integral` (time, target, speed, integral). Watch what the integral does while the target is 50.

### Measurement 2: without and with the clamp
| Setting | Speed while the target is 50 | Integral at 7 s | Time to get within +-2 cm/s after the target drops to 15 | Error area (7.5-10 s) |
|---|---|---|---|---|
| `ANTI_WINDUP = false` | ~39.6 cm/s (saturated) | 40.2 | 1.84 s | 42.8 cm |
| `ANTI_WINDUP = true` | ~39.6 cm/s (saturated) | 1.8 | 0.34 s | 1.5 cm |

Error area: the sum of the absolute value of the error over time (cm/s x s = cm). Smaller is better.

- Neither reached the target during the saturated period; this is the motor's limit, not the controller's fault.
- In the version without the clamp, the integral rose to 40 in 4 seconds. When the target dropped to 15, this build-up first had to drain; during that time the output stayed high and the robot could not slow down. The recovery is 5.4 times longer and the error area is 28 times bigger.
- In the version with the clamp, the integral stayed at 1.8 and the robot settled at the new speed in 0.34 s.
- Before saturating (at the 25 cm/s target), both versions followed the target (error area below 3 cm): anti-windup does not spoil normal operation.

### What may be different on a real robot
- Real wheel speed fluctuates in the time between ticks and the measurement is coarse; tuning the integral and the derivative needs a little more care.
- If you hold the robot in your hand, the same windup happens on a real robot too: because the wheels do not turn, the error grows and the integral builds up. When you let go, the robot may shoot off. When testing, keep the wheels in the air and reset the control before letting go.

### Try it
- With `ANTI_WINDUP = false`, change the 50 cm/s target to 30 cm/s (the motor can reach this speed). Does windup happen? Why?
- In the `i_duvar` sketch, set `KI` to 0.5. How many seconds does it take for the offset to get within ±2 cm?
- In `i_hiz_windup`, make the 50 cm/s section in `hedefHiz()` last 2 s instead of 4 s. Does the windup effect get smaller?

### Common mistakes
- Forgetting to multiply by `dt` in the `integral += e * dt` line: the integral then depends on the control period.
- Never limiting the integral: when the output saturates, windup is unavoidable.
- Making `KI` very large in one go: overshoot starts. Start small.
- Writing the sign of the error the wrong way round: the integral makes the error bigger instead of closing it.
- Leaving the control on while the robot is held or pushed against an obstacle: the integral quietly builds up.

## Discuss
If PI control stayed on while you held the robot up in the air, what would happen to the integral? What would the robot do the moment you let go? In which two ways can you do anti-windup, and which one suits which situation better?

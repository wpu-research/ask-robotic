# Final project: PID line follower and wall follower
duration: 35

## Wonder
Two robots stand side by side at a race: one bang-bang, one PID. Which one finishes the lap first? Does what you learned this week really work, or is it just more complicated? In this project you will test the claim with numbers. On top of that, with the same robot you will do wall following with PID and try to hold a distance of 15 cm +-2 cm from the wall.

## Activity
### What are we going to do?
This project brings together what you have learned:
- **Week 2:** HC-SR04 and servo (the sensor that looks at the wall).
- **Week 3:** the 5-sensor line array and bang-bang line following (lesson 88).
- **Module 3, week 6:** a non-blocking loop with a fixed period using `millis()`.
- **This week:** P (96), D and the filter (97), I and anti-windup (98), tuning by measuring (99).

There are three sketches:
1. `proje_cizgi_pid`: PID line follower.
2. `proje_cizgi_bb`: bang-bang line follower, for comparison.
3. `proje_duvar_pid`: PID wall follower.

### Circuit
| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| 5-sensor line array | **A0 ... A4** (A0 far left, A4 far right), 7 cm in front of the axle |
| HC-SR04 | TRIG **D11**, ECHO **D12** |
| Servo (turns the sensor) | Signal **D4** |

Use external power for the motors and the servo, and connect all GNDs together. Do not short-circuit the battery or connect it the wrong way round. Do not run the robot on the edge of a table; it may fall off during the first tries.

### Program 1: PID line follower
The three terms are gathered in a single `pid()` function. On the line array `Kd` is kept very small and filtered, and `Ki` is kept at 0; you will see why in the measurement. The integral is still limited, so it is ready if you want to switch `Ki` on.

```cpp
// sketch: proje_cizgi_pid
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const float KP = 240.0;            // PWM / sensör aralığı
const float KI = 0.0;              // PWM / (aralık x s)
const float KD = 0.5;              // PWM / (aralık/s)
const float ALFA = 0.9;            // türev süzgeci
const float ILIM = 20.0;           // integral sınırı: KI x ILIM = 100 PWM
const int TABAN = 255;
const unsigned long DT = 10;       // kontrol periyodu (ms)

unsigned long son = 0;
unsigned long sonYazdir = 0;
float sonYon = 1;
float integral = 0;
float sonHata = 0;
float turevSuz = 0;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

// Çizginin konumu: -2...+2 (pozitif = çizgi solda). Kayıpsa son yöne doğru 2.
float hataOku() {
  int sayi = 0;
  float toplam = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(SENSOR[i]) > ESIK) {
      sayi++;
      toplam += 2 - i;
    }
  }
  if (sayi == 0) return sonYon * 2.0;
  float e = toplam / sayi;
  if (e != 0) sonYon = (e > 0) ? 1 : -1;
  return e;
}

// PID: çıkış = Kp x hata + Ki x (hata birikimi) + Kd x (hatanın değişim hızı)
float pid(float e, float dt) {
  integral += e * dt;
  integral = constrain(integral, -ILIM, ILIM);
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;
  return KP * e + KI * integral + KD * turevSuz;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;

  float e = hataOku();
  float u = pid(e, DT / 1000.0);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);

  if (millis() - sonYazdir >= 500) {       // ayar yaparken değerleri izle
    sonYazdir = millis();
    Serial.print("hata=");
    Serial.print(e, 1);
    Serial.print(" u=");
    Serial.println(u, 0);
  }
}
```

### Program 2: bang-bang for comparison
The same idea as in lesson 88: whatever the error, turn by a fixed `DONUS` (turn) amount. You choose the `DONUS` value; this is where it differs from PID's "as much as the error" logic.

```cpp
// sketch: proje_cizgi_bb
// Karşılaştırma için bang-bang çizgi izleyici (88. ders): üç durum, sabit dönüş.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const int TABAN = 255;
const int DONUS = 200;             // sabit direksiyon: hata ne kadar küçük olursa olsun aynı

int sonYon = 1;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
}

void loop() {
  bool gor[5];
  for (int i = 0; i < 5; i++) gor[i] = analogRead(SENSOR[i]) > ESIK;

  int yon;                                   // +1: sola dön, -1: sağa dön, 0: düz
  if (gor[0] || gor[1]) yon = 1;             // çizgi solda
  else if (gor[3] || gor[4]) yon = -1;       // çizgi sağda
  else if (gor[2]) yon = 0;                  // çizgi ortada
  else yon = sonYon;                         // kayıp: son yöne dön
  if (yon != 0) sonYon = yon;

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - yon * DONUS);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + yon * DONUS);
}
```

### Program 3: PID wall follower
The servo turns the sensor to the left (180 degrees). The robot tries to hold the wall at 15 cm. Based on the results of lessons 97 and 98, we chose `Kp = 16`, `Ki = 1`, `Kd = 4`, `ALFA = 0,8` and tried it with two different noise seeds.

```cpp
// sketch: proje_duvar_pid
#include <Servo.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 16.0;             // PWM / cm
const float KI = 1.0;              // PWM / (cm x s)
const float KD = 4.0;              // PWM / (cm/s)
const float ALFA = 0.8;            // türev süzgeci
const float ILIM = 30.0;           // integral sınırı (cm x s)
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
unsigned long sonYazdir = 0;
float mesafe = HEDEF;
float integral = 0;
float sonHata = 0;
float turevSuz = 0;

void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

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

float pid(float e, float dt) {
  integral += e * dt;
  integral = constrain(integral, -ILIM, ILIM);
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;
  return KP * e + KI * integral + KD * turevSuz;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};
  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  servo.attach(SERVO_PIN);
  servo.write(180);                // ışın sola, duvara dik
  delay(500);
  float ilk = olc();
  if (ilk > 0) mesafe = ilk;
  sonHata = mesafe - HEDEF;
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;

  float m = olc();
  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru
  float e = mesafe - HEDEF;        // + : duvardan çok uzak
  float u = constrain(pid(e, DT / 1000.0), -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);

  if (millis() - sonYazdir >= 500) {
    sonYazdir = millis();
    Serial.print("mesafe=");
    Serial.print(mesafe, 1);
    Serial.print(" u=");
    Serial.println(u, 0);
  }
}
```

### How does it work?
1. Both follow the same skeleton: **measure -> error -> PID -> give it to the motors**. The only difference is the source of the error: on the line it is the array position (unit: sensor spacing), at the wall it is the ultrasonic distance (cm).
2. When the error is positive (`çizgi solda`, line on the left, or `duvardan uzak`, far from the wall), the left wheel slows down and the right one speeds up: the robot turns left.
3. Inside `pid()`, `integral` is limited (`ILIM`) and the derivative is filtered (`ALFA`). These are the safety measures you learned in lessons 97-98.
4. Every 500 ms the serial output prints the error and `u`. Look at it while tuning: if `u` keeps hitting 255, the gain is too large.
5. Using two separate PIDs for distance and heading (the structure mentioned in the F1 lesson of Hyvex's internship programme) may be needed. This wall follower measures only the distance, not the heading (the robot's angle to the wall); the distance PID corrects the heading indirectly.

### Tuning order (lesson 99)
1. Go round the track once with bang-bang; find the best `DONUS`.
2. For `proje_cizgi_pid`, start `TABAN` small. Set `Ki = Kd = 0`, and increase `Kp` until it no longer loses the line.
3. Add `Kd` and filter it. Be careful on the line array; see the measurement below.
4. Try `Ki`; if you see no benefit on the line, leave it at 0 (we left it on this array).
5. Increase `TABAN` and go back to step 1.

### Measurement 1: PID or bang-bang?
We ran on two tracks with `TABAN = 255` (full speed). **Hard track:** bend radius 12 cm, a steep slalom on the bottom straight (4.5 cm amplitude, 30 cm wavelength). **Easy track:** bend radius 17 cm, a gentle slalom (3 cm amplitude, 40 cm wavelength). For bang-bang, `DONUS` = 60, 100, 140 and 200 were tried.

**Hard track**

| Driver | Lap time | Error RMS | Largest deviation | Steering jitter |
|---|---|---|---|---|
| PID (in the lesson) | 8.62 s | 10.9 mm | 23 mm | 0.91 |
| Bang-bang, `DONUS = 200` | 9.04 s | 27.5 mm | 79 mm | 0.46 |
| Bang-bang, `DONUS` = 60 / 100 / 140 | lost the line | - | - | - |

**Easy track**

| Driver | Lap time | Error RMS | Largest deviation | Steering jitter |
|---|---|---|---|---|
| PID (in the lesson) | 9.86 s | 11.1 mm | 23 mm | 1.27 |
| Bang-bang, `DONUS = 200` | 8.90 s | 12.5 mm | 46 mm | 0.56 |
| Bang-bang, `DONUS` = 60 / 100 / 140 | lost the line | - | - | - |

An honest reading:
- **On the hard track PID is faster:** 8.62 s, 4.7% shorter than the best bang-bang. It is also much closer to the line: RMS 10.9 mm against 27.5 mm, largest deviation 23 mm against 79 mm.
- **On the easy track PID is not faster; it is clearly slower.** The working bang-bang setting finished 0.96 s (10.8%) ahead. PID was still closer to the line (RMS 11.1 mm, maximum 23 mm; for bang-bang 12.5 and 46 mm), but this closeness did not show up in the time.
- **Bang-bang is sensitive to tuning:** of the 4 `DONUS` values, only 200 finished both tracks at full speed. A small `DONUS` cannot take the bend. The single PID setting tried finished both tracks.
- **The "smoother" claim does not hold in this measurement.** PID stays close to the line (smaller deviation), but the steering command wiggles clearly more with PID (0.91 against 0.46 on the hard track, 1.27 against 0.56 on the easy track). Which measure you use to define smoothness changes the result.
- The line array's sensors are 2.4 cm apart and the line is 2 cm wide: while the line passes between two sensors, it is briefly seen by neither of them and the error jumps. PID is affected by these jumps; bang-bang swallows them with its fixed turn.
- Because both ran at full speed (`TABAN = 255`), the lap time is largely limited by the motor's top speed. The result changes with the track and `TABAN`.

With one of the motors weaker (the right motor 8% weaker), PID still finished the hard track: 9.22 s, RMS 11.3 mm, largest deviation 24 mm.

**Watch out for I and D on the line.** The array gives the error in steps of 0.5, and the line can disappear between sensors; these jumps create fake bursts in the derivative and fake build-up in the integral. On the hard track (8.62 s in the lesson):
- Switching on `Ki = 1` made the lap longer, 9.40 s, and the steering jitter went from 0.91 up to 1.21.
- Setting `Kd = 30` without a filter (`ALFA = 0`) made the lap 10.08 s and the jitter 1.15.

That is why the lesson uses `Ki = 0` and `Kd = 0,5` (`ALFA = 0,9`). On the line array the real work is done by P; I and D were useful in wall following and in the speed loop (97-99).

### Measurement 2: wall following
A long, gently curving wall (a wave with 3 cm amplitude and 1.2 m wavelength), 1 cm of noise in the ultrasonic measurement, the right motor 10% weaker. The robot starts parallel to the wall; because of the wall's bend at that point, the starting distance is about 18 cm (3 cm beyond the target). It runs for 11 seconds (about 2.5 m).

| Measure | Result |
|---|---|
| Did it hit the wall? | no (with two different noise seeds) |
| Staying within +-2 cm after the first 4 s | 100% |
| Largest deviation after the first 4 s | 0.78 cm (one run), 1.48 cm (the other run) |
| Error RMS after the first 4 s | 0.35 cm (PID), 0.54 cm (P only, `Ki = Kd = 0`) |
| Largest deviation within the first 4 s | 2.6 cm |

Because the starting distance is outside the target and the wall starts to bend towards the robot, in the first seconds the deviation goes up to 2.6 cm (the target band is +-2 cm). After the 4th second the robot stays inside the band. P alone also held the band in this run, because Kp = 16 is large and the motor difference is small (10%). PID made the RMS smaller by about a third. If Kp is small or the motor difference is large (15%), as in lesson 98, P alone cannot hold the band; that is when I makes a difference.

### What may be different on a real robot
- In the simulation the control timing is perfect and there is no noise on the line sensors. On a real robot, light, the surface and the battery voltage change the result; measure every setting again on your own robot.
- A real HC-SR04 may get a wrong echo when it looks at the wall at an angle. In wall following you may want to filter the measurement or take a median (Module 4).
- As the battery runs down, the motor slows down. If you tuned the speed with a full battery, review the gains again when it runs down.

### Try it
- In `proje_cizgi_pid`, set `KD = 30` and `ALFA = 0` (in the measurement the lap became 10.08 s). Why does the lap time get longer? Look at the `u` values in the `Serial` output.
- In bang-bang, set `TABAN = 200` and try the `DONUS` values again. Which `DONUS` works? What happens to the lap time compared with PID?
- In the wall follower, set `HEDEF = 20`. Does it hold +-2 cm without changing the settings?
- Challenge: combine the two sketches into one program. If `c` arrives on the serial port, run line mode; if `d` arrives, run wall mode (lesson 79; lesson 28 for the state machine).

### Common mistakes
- Using the same Kp for the line and the wall: the error units are different (sensor spacing and cm). Measure the gains separately.
- Comparing bang-bang and PID on different tracks and at different speeds: that is not fair. Use the same track, the same `TABAN` and the same measurement method.
- Skipping the tuning order: raising the speed first and then looking for Kp. Start at a low speed.
- Deciding from a single run: measure in at least two runs (a different noise seed or starting point).
- Increasing Kd by intuition: on the line array the derivative behaves like noise.

## Discuss
On the easy track bang-bang finished clearly ahead of PID. So can you say bang-bang is enough? In which situations is the simple solution better (for example the number of settings, top speed, track difficulty)? If you were to enter this project in a race, which one would you choose, and why?

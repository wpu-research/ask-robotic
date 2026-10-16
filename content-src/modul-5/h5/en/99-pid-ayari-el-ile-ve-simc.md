# PID tuning: by hand and SIMC
duration: 40

## Wonder
PID has three numbers (Kp, Ki, Kd), but in what order and how will you choose them? At Hyvex, on Horde, we fixed the speed-tracking error by tuning the PID. We chose the **SIMC** method instead of Ziegler-Nichols, because Ziegler-Nichols requires increasing the gain all the way to the stability limit, and that is risky on real hardware. In this lesson, try all three ways on the robot's speed loop and compare them with numbers.

## Activity
### The speed loop
What is controlled in this lesson is wheel speed. Input: the PWM given to the motor (`u`). Output: the speed measured by the encoder (cm/s). The robot uses the speed measurement from lesson 98. Both wheels get the same command, and the left encoder (D2) measures the speed.

| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Left encoder | **D2** (interrupt pin) |

External power for the motors, common GND. Do not short-circuit the battery or connect it the wrong way round.

### Way 1: tuning by hand
The order matters:
1. **P first.** `Ki = Kd = 0`. Start Kp small and increase it; stop when it follows the target quickly and starts to overshoot slightly. (Lesson 96)
2. **Then D.** Add Kd to damp the overshoot and oscillation; if the measurement is noisy, filter it. (Lesson 97)
3. **I last.** If a steady-state offset remains, add Ki and limit the integral. (Lesson 98)

At each step change one thing only and measure the number. Example: in wall following, with `Kp = 32` the overshoot was 6.5 cm; adding `Kd = 4,8` brought it down to 1.0 cm (lesson 97). On the robot with a weak motor, `Ki = 2` brought the steady-state offset down from 2.25 cm to 0.09 cm (lesson 98).

Tuning by hand does the job, but it relies on intuition. You start the trials again from scratch for every robot and every system. That is why we will look at two "systematic" ways.

### Way 2: Ziegler-Nichols, and why it is risky
Ziegler-Nichols (Z-N) works like this: set `Ki = Kd = 0`, and increase Kp **until the system oscillates permanently**. The gain at which it starts to oscillate is `Ku`, and the period of the oscillation is `Pu`. PI tuning: `Kc = 0,45 x Ku`, `Ti = Pu / 1,2`.

In the speed loop, with P control only (target 25 cm/s), we increased Kc and looked at the peak-to-peak wobble of the speed measurement:

| Kc | 10 | 14 | 16 | 18 | 20 | 22 | 24 |
|---|---|---|---|---|---|---|---|
| Peak-to-peak wobble of the speed (cm/s) | 0.4 | 0.8 | 1.8 | 2.6 | 10.6 | 12.9 | 15.4 |

Up to Kc = 18 the oscillation is small; at 20 permanent oscillation begins: `Ku = 20`, `Pu = 0,22 sn`. Z-N PI tuning: `Kc = 9`, `Ti = 0,183 sn`.

This tuning works, but look at the cost: to find Ku we made the speed oscillate by **40% of the target** (10.6 cm/s around 25 cm/s). In the simulation this does no harm. On a real vehicle (a fast robot, a boat, a drone), deliberately bringing the system to the stability limit can damage the vehicle or its surroundings with a single wrong step. This was also why Hyvex chose SIMC instead of Z-N.

### Way 3: SIMC
SIMC (Skogestad) gets to know the system from a step response measured **safely**. First we describe the system with this simple model: **first order + delay**:
- `k`: gain. When the input increases by 1 unit, how many units does the output eventually increase by?
- `tau (τ)`: time constant. How slowly the output response settles.
- `theta (θ)`: delay. The time after the command is given during which the output does not start to move.

Then the formula:
- `Kc = (1 / k) x τ / (τc + θ)`
- `τI = min(τ, 4 x (τc + θ))`

Here `τc` is the time constant you want from the closed loop. A small `τc` means fast but harsh, a large `τc` means gentle. Skogestad's recommendation as a fast and robust choice is `τc = θ`.

#### Step 1: measure the step response
Make the motor jump suddenly from PWM 100 to 180. At every encoder tick the time and the speed are printed.

```cpp
// sketch: adim_cevabi
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2;

const float TIK_CM = 1.0367;           // bir tık = 1,04 cm yol
const int U1 = 100;                    // adımdan önceki komut (PWM)
const int U2 = 180;                    // adımdan sonraki komut (PWM)
const unsigned long ADIM_ZAMANI = 2000;   // ms

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
volatile unsigned long tikSayisi = 0;
unsigned long yazilan = 0;

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
  aralikUs = t - sonTikUs;
  sonTikUs = t;
  tikSayisi++;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
}

void loop() {
  unsigned long t = millis();
  int u = (t < ADIM_ZAMANI) ? U1 : U2;          // t = 2 sn'de komut aniden 100 -> 180
  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);

  if (tikSayisi != yazilan) {                   // yeni tık geldi: zaman ve hızı yaz
    noInterrupts();
    unsigned long aralik = aralikUs;
    yazilan = tikSayisi;
    interrupts();
    Serial.print(t);
    Serial.print(',');
    Serial.println(TIK_CM * 1000000.0 / aralik, 1);   // cm/s
  }
}
```

In the simulation we got this output (the step is at t = 2000 ms):

| Time (ms) | 2016 | 2068 | 2112 | 2153 | 2193 | 2232 | 2270 | 2308 |
|---|---|---|---|---|---|---|---|---|
| Speed (cm/s) | 15.5 | 19.9 | 23.6 | 25.3 | 25.9 | 26.6 | 27.3 | 27.3 |

The average speed before the step is 15.17 cm/s, and 1 s after the step it is 27.63 cm/s.

#### Step 2: work out k, τ and θ
1. **k** = increase in speed / increase in PWM = (27.63 - 15.17) / (180 - 100) = **0.156 cm/s per PWM unit**.
2. The two-point method: look at the times at which the speed reaches 28.3% and 63.2% of its total increase. In a first-order response with delay, these two moments are `t28 = θ + 0,333 τ` and `t63 = θ + τ`. If you subtract one from the other, `t63 - t28 = 0,667 τ` is left. From our data: `t28 = 54 ms`, `t63 = 105 ms` (from the step).
3. **τ** = 1.5 x (t63 - t28) = 1.5 x 51 = **77 ms**. This matches 80 ms, the design value for the robot's motor delay.
4. **θ** = t63 - τ = 105 - 77 = **28 ms**.

In digital control, sampling also counts as delay: on average half a period, that is `DT / 2 = 10 ms`. Effective delay: `θ = 28 + 10 = 38 ms`.

#### Step 3: apply the formula
We chose `τc = θ = 0,038 sn`. The sketch writes this formula directly:
- `Kc = (1 / 0,156) x 0,077 / (0,038 + 0,038) = 6,49`
- `τI = min(0,077; 4 x 0,076) = 0,077 sn`

```cpp
// sketch: simc_hiz
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2;

const float TIK_CM = 1.0367;
const unsigned long DT = 20;           // kontrol periyodu (ms)

// Adım cevabından ölçülen model: hız = K x PWM, gecikme + birinci derece
const float K = 0.156;                 // cm/s başına PWM birimi
const float TAU = 0.077;               // s
const float THETA = 0.038;             // s (ölçülen 0,028 + DT/2 = 0,010)
const float TAUC = 0.038;              // s: istenen kapalı döngü zaman sabiti (hızlı seçim: TAUC = THETA)

// SIMC (Skogestad) ayarı
const float KC = (1.0 / K) * TAU / (TAUC + THETA);
const float TI = min(TAU, 4.0 * (TAUC + THETA));

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
unsigned long son = 0;
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
  aralikUs = t - sonTikUs;
  sonTikUs = t;
}

float hizOku() {
  noInterrupts();
  unsigned long aralik = aralikUs;
  unsigned long sonTik = sonTikUs;
  interrupts();
  unsigned long gecen = micros() - sonTik;
  if (aralik == 0 || gecen > 200000UL) return 0;
  if (gecen > aralik) aralik = gecen;
  return TIK_CM * 1000000.0 / aralik;
}

float hedefHiz(unsigned long t) {      // 15 -> 25 -> 15 cm/s
  if (t < 1500) return 15;
  if (t < 3500) return 25;
  return 15;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
  Serial.print("Kc=");
  Serial.print(KC, 2);
  Serial.print(" Ti=");
  Serial.println(TI, 3);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float e = hedefHiz(millis()) - hizOku();
  float aday = KC * (e + (integral + e * dt) / TI);
  if (aday > 0 && aday < 255) integral += e * dt;     // doymuşken biriktirme (98. ders)

  float u = constrain(KC * (e + integral / TI), 0, 255);
  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);
}
```

### Comparing the three ways
Target 15 -> 25 -> 15 cm/s. "Settling" is the time it takes for the speed to get within +-2 cm/s of the target and stay there. "Error area" is the sum of the absolute value of the error over time (cm/s x s = cm).

| Tuning | 15 -> 25 settling | 15 -> 25 overshoot | 15 -> 25 error area | 25 -> 15 settling | 25 -> 15 error area |
|---|---|---|---|---|---|
| SIMC, `τc = θ` (Kc 6.49; Ti 0.077) | 0.16 s | 2.2 cm/s | 0.7 cm | 0.22 s | 1.2 cm |
| SIMC gentle, `τc = 3 θ` (Kc 3.25) | 0.16 s | 0.1 cm/s | 0.9 cm | 0.16 s | 1.0 cm |
| Z-N PI (Kc 9; Ti 0.183) | 0.26 s | 1.8 cm/s | 0.9 cm | 0.30 s | 0.8 cm |
| By guesswork (Kc 1; Ti 1) | did not settle | 0 | 33.9 cm | did not settle | 10.5 cm |

- The weak tuning guessed by hand could not keep up with the target: its error area is 48 times that of SIMC.
- SIMC and Z-N gave a similar error area; SIMC settled a little faster. Z-N worked well too: the difference comes from the **method**, not from the speed result. SIMC asked only for a single safe step test. Z-N asked for the speed to oscillate by 40% of the target.
- `τc` is a single knob: when you increase it, Kc drops, the overshoot almost disappears (2.2 -> 0.1 cm/s) and the settling time does not get longer. You choose the balance between speed and gentleness you want with this number.
- SIMC's value of `Kc = 6,49` is about a third of `Ku = 20`: it stays far from the stability limit. This is what "safety margin" means.

### What may be different on a real robot
- On a real motor the step response changes with the load and the battery voltage. Measure `k`, `τ` and `θ` while the robot carries its real load and the battery is full.
- The τ measured here (77 ms) came out close to the design value because the simulation is clean. Real measurements are more scattered; do several step tests and take the average.
- Because the SIMC model is simple, it may not be enough on its own for very slow or oscillating systems. Then fine-tune by measuring.

### Try it
- Set `TAUC` to 0.02 and 0.2 instead of 0.038. How do Kc and Ti change? What do the overshoot and the settling time do?
- In `adim_cevabi`, set `U2 = 255`. Does the k you measure come out the same? (Is this system linear?)
- In `simc_hiz`, subtract `DT / 2` from `THETA` (make it 0.028). When Kc changes, does speed tracking get worse?

### Common mistakes
- Not starting the step response with the system at rest: apply the step once the speed has settled.
- Working out `k` while mixing up the PWM unit and the speed unit. The `1 / k` in the formula must be in PWM / (cm/s).
- Forgetting `θ` and using only `τ`: `Kc` comes out too large.
- Pushing Z-N on real hardware all the way to the instability limit just to "give it a try and see".
- Tuning at a single speed and treating it as valid in every condition.

## Discuss
Hyvex chose SIMC instead of Z-N on Horde. On your own robot, if it had a fragile part or an expensive motor, which method would you choose, and why? What happens if you measure the time constant of the step test wrongly (for example when the battery is about to run out)?

# Speed, dead zone and calibration
duration: 30

## Wonder
You wrote `analogWrite(EN, 40)` for the robot. The motor hums slightly, but the wheel does not move. When you write 60, the wheel starts to turn slowly. You wanted "half speed", so you wrote 128, but the robot does not go at half speed; it goes much slower than that. Why is speed not proportional to PWM? And which number should you write to tell the robot "go at 20 cm/s"?

## Activity
### The dead zone
For the motor to start turning, it needs enough power to overcome friction and the resistance of the gears. At low PWM, the motor current cannot overcome this resistance; the wheel stays still. This range is called the **dead zone**. You see it in real motors too, and it changes with the motor, the gears and the battery.

The dead zone of the robot in the simulation is the first 20% of the PWM range: while the `analogWrite` value is below about 51 (0.20 · 255), the wheel does not turn. Above the dead zone, the speed rises roughly linearly and reaches its highest value (maximum speed) at PWM 255.

### Measuring the dead zone
We have no sensor that measures the robot's speed (the encoder comes in a later week). Your eyes and a button do the measuring: the sketch raises the PWM every 250 ms, and when you see the wheel start to turn, you press the button (D2). The sketch prints the PWM at that moment.

| Part | Connection |
|---|---|
| Left and right motor | Standard connection: EN D5/D6, IN1 D7, IN2 D8, IN3 D9, IN4 D10 |
| Button | Between **D2** and GND (`INPUT_PULLUP`) |

**Safety:** Keep the robot's wheels in the air during this experiment. Motor power comes from a separate battery; the GNDs must be common.

```cpp
// sketch: olu_bolge_tarama
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;
const int DUGME = 2;                    // INPUT_PULLUP: tekerlek dönmeye başlayınca bas

const unsigned long ADIM_ARALIGI = 250;  // ms
int pwm = 30;
bool bitti = false;
unsigned long sonAdim = 0;

void ileri(int deger) {
  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);
  analogWrite(SOL_EN, deger);
  analogWrite(SAG_EN, deger);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(DUGME, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Tarama basladi");
  ileri(pwm);
}

void loop() {
  if (bitti) return;

  if (digitalRead(DUGME) == LOW) {       // tekerlek döndü, taramayı bitir
    ileri(0);
    bitti = true;
    Serial.print("Hareket basladi: PWM=");
    Serial.println(pwm);
    return;
  }

  if (millis() - sonAdim >= ADIM_ARALIGI) {
    sonAdim = millis();
    pwm++;
    if (pwm > 255) {                     // hiç dönmediyse güvenli bitir
      ileri(0);
      bitti = true;
      Serial.println("Tarama bitti: hareket yok");
      return;
    }
    ileri(pwm);
    Serial.print("PWM=");
    Serial.println(pwm);
  }
}
```

In the simulation, we pressed the button the moment the robot's speed went above 1 cm/s, and the sketch printed **PWM = 57**. This number is the value at which "the wheel visibly turns"; the real end of the dead zone is a little lower, at about 51. This is because once it leaves the dead zone, the speed starts from zero and rises slowly:

| PWM | 50 | 52 | 55 | 57 | 60 | 70 | 100 | 150 | 200 | 255 |
|---|---|---|---|---|---|---|---|---|---|---|
| Measured speed (cm/s) | 0.1 | 0.2 | 0.7 | 1.1 | 1.7 | 3.6 | 9.4 | 19.1 | 28.8 | 39.6 |

Between PWM 35 and 48 the speed stayed below 0.2 cm/s, so the wheel did not turn. After PWM 52 the speed rises linearly: each PWM unit adds about 0.19 cm/s.

### Finding a line from two points
A more reliable way to find the end of the dead zone and the maximum speed is to draw a line through two speeds that can be measured well. On a real robot, you find the speed by timing a 1-metre run with a stopwatch.

We measured 9.4 cm/s at PWM 100 and 28.8 cm/s at PWM 200.

- Slope = (28.8 − 9.4) / (200 − 100) = 0.194 cm/s per PWM unit.
- The PWM where the speed is zero = 100 − 9.4 / 0.194 ≈ **51**.
- Maximum speed (PWM 255) = 0.194 · (255 − 51) ≈ 39.6 cm/s = **0.396 m/s**.

The numbers from the two methods agree: the dead zone ends at 51, and the maximum speed is 0.396 m/s (in lesson 76 we also found it from the wheel radius, as 12 rad/s · 0.033 m).

### The calibration function: hizdanPwm
Our goal: when you say "this many m/s", find the right PWM. The mapping skips the dead zone:

```
PWM = OLU_PWM + (255 − OLU_PWM) · v / V_MAX
```

Think of it as the difference between two lines: at v = 0 the PWM starts from 51 (just after the end of the dead zone), and at v = V_MAX it becomes 255. For comparison we also added the "naive" mapping: PWM = 255 · v / V_MAX, a line that starts from 0.

The sketch reads the command `K 20` (calibrated, 20 cm/s) or `N 20` (naive, 20 cm/s) from the serial port and sets both wheels to that PWM.

```cpp
// sketch: kalibre_hiz
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

const float V_MAX = 0.396;   // PWM 255'te ölçülen hız (m/s)
const int OLU_PWM = 51;      // ölçülen ölü bölge sonu

// Naif eşleme: 0 ile 255 arasında doğrusal (ölü bölgeyi unutur)
int naifPwm(float v) {
  return constrain((int)(255.0 * v / V_MAX), 0, 255);
}

// Kalibre eşleme: ölü bölgeyi atlar, V_MAX'ta 255'e varır
int hizdanPwm(float v) {
  if (v < 0.005) return 0;               // neredeyse durma isteği
  if (v > V_MAX) v = V_MAX;
  return OLU_PWM + (int)((255 - OLU_PWM) * v / V_MAX + 0.5);
}

void ileri(int deger) {
  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);
  analogWrite(SOL_EN, deger);
  analogWrite(SAG_EN, deger);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
  Serial.setTimeout(100);
  Serial.println("Komut: K 20 (kalibre) veya N 20 (naif), hiz cm/s");
}

void loop() {
  if (Serial.available() == 0) return;
  String satir = Serial.readStringUntil('\n');
  satir.trim();
  if (satir.length() < 3) return;
  char mod = satir.charAt(0);
  float v = satir.substring(2).toInt() / 100.0;     // cm/s -> m/s
  int pwm = (mod == 'N') ? naifPwm(v) : hizdanPwm(v);
  ileri(pwm);
  Serial.print("mod="); Serial.print(mod);
  Serial.print(" istenen="); Serial.print(v, 3);
  Serial.print(" pwm="); Serial.println(pwm);
}
```

### How does it work?
1. `hizdanPwm()` (PWM from speed) first turns very small requests (below 5 mm/s) into 0; otherwise the robot would wander around just above the dead zone, at a speed too slow to measure.
2. It limits the request to the maximum speed (`v > V_MAX`). Then it applies the linear mapping that starts from `OLU_PWM`. The `+ 0.5` is for rounding.
3. `naifPwm()` knows nothing about the dead zone. When you ask for 5 cm/s, it gives PWM 32, which is inside the dead zone: the robot does not move.
4. The `N` and `K` modes work side by side; this way you can try the same speed request with both methods and compare the robot's real speed.

### Measurement: requested and real speed
After each command, we waited for the robot's motion to settle and measured how far it went in 1 second:

| Requested (cm/s) | Naive PWM | Naive real speed (cm/s) | Calibrated PWM | Calibrated real speed (cm/s) |
|---|---|---|---|---|
| 5 | 32 | 0 (did not turn) | 77 | 5.0 |
| 10 | 64 | 2.5 | 103 | 10.0 |
| 20 | 128 | 14.9 | 154 | 19.9 |
| 39 | 251 | 38.6 | 252 | 38.8 |

The naive mapping only works for requests close to full speed; at slow speeds the error is very large (ask for 10 cm/s and you get 2.5 cm/s). With the calibrated mapping, the error was never more than 0.2 cm/s in any row. This success only holds for the robot whose dead zone and maximum speed were measured; for another robot you must measure the numbers again.

What may be different on a real robot: as the battery runs down, the maximum speed drops, so calibration is done with a full battery and repeated from time to time. Friction with the floor (carpet, wooden floor) changes the dead zone. The speed may not depend perfectly linearly on the PWM; then you measure more points instead of two and draw lines between them.

### Try it
- In the scanning sketch, set `ADIM_ARALIGI` to 100 ms. Does the PWM you find change? Why?
- In `kalibre_hiz`, set `OLU_PWM` to 70 and try `K 10`. What happens? How would this mistake show up on a real robot?
- On your own robot, find the dead zone for the left and right motors separately. If there is a difference, what do you need to do? (Driving straight is covered in week 4.)

### Common mistakes
- Thinking PWM is speed: "128 is half speed" is not true.
- Calibrating with a flat battery.
- Thinking the end of the dead zone is the value where you pressed the button: that is the threshold you notice by eye. The end of the dead zone is the PWM where the speed line crosses zero (51 here).
- Copying the `OLU_PWM` and `V_MAX` numbers to another robot.

## Discuss
Why should the calibration numbers (`OLU_PWM`, `V_MAX`) sit at the top of the code as `const`? When you change the robot's battery or wheels, which lines of the code do you need to touch?

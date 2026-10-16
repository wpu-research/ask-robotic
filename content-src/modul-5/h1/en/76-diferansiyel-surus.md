# Differential drive: v, ω and wheel speeds
duration: 25

## Wonder
A robot vacuum cleaner has no steering wheel. All it does is give the left and right wheels different speeds. If both wheels turn at the same speed, it goes straight; if one is faster, it drives a curve; if they turn in opposite directions, it spins on the spot. So if you want the robot to move forward at 20 cm/s and turn at 1 radian per second (about 57°), exactly which speeds should you give the two wheels?

## Activity
In this module the robot steers using the difference between two motorised wheels. This is called **differential drive**. The robot's measurements (the robot in the simulation uses them too):

- Wheel radius: r = 3.3 cm = 0.033 m
- Axle track (the distance between the points where the two wheels touch the ground): L = 12 cm = 0.12 m

### Formulas
Let the left wheel's ground speed be vL and the right wheel's vR (m/s, forward +). Two numbers describe the robot's motion:

- **v**: the forward speed of the robot's centre (m/s)
- **ω** (omega): the robot's turning speed (rad/s). A left turn is **+**, a right turn is **−**.

```
v = (vR + vL) / 2
ω = (vR − vL) / L
R = v / ω = (L / 2) · (vR + vL) / (vR − vL)      (turning radius, m)
```

A wheel's ground speed is linked to how fast it spins: vT = r · φ, where φ is the wheel's spin speed in rad/s. If the wheel spins 12 rad per second, its speed is 0.033 · 12 = 0.396 m/s.

Special cases:

| Case | v | ω | R | Robot |
|---|---|---|---|---|
| vR = vL | vR | 0 | infinite | goes straight |
| vR = −vL | 0 | 2·vR / L | 0 | spins on the spot |
| vL = 0, vR > 0 | vR / 2 | vR / L | L / 2 = 6 cm | turns around the stopped wheel |
| vR > vL > 0 | in between | + | large | curves left |
| vL > vR > 0 | in between | − | large | curves right |

### Working it out by hand
1. **Straight:** vL = vR = 0.30 m/s. v = 0.30 m/s, ω = 0.
2. **Curve:** vL = 0.20, vR = 0.30. v = 0.25 m/s. ω = 0.10 / 0.12 = 0.83 rad/s (about 48°/s). R = 0.06 · 0.50 / 0.10 = 0.30 m.
3. **Spin on the spot:** vL = −0.30, vR = 0.30. v = 0. ω = 0.60 / 0.12 = 5 rad/s (about 286°/s). A full turn takes 2π / 5 = 1.26 s.

**The inverse problem:** if you want a given v and ω, the wheel speeds come out like this:

```
vR = v + ω · L / 2
vL = v − ω · L / 2
```

For v = 0.20 m/s and ω = 1 rad/s: vR = 0.20 + 0.06 = 0.26 m/s, vL = 0.20 − 0.06 = 0.14 m/s. But the Arduino gives a PWM value, not a speed. So you also need a mapping for that.

### Circuit
Standard Module 5 connections (the same in every week):

| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Motor driver (L298N or TB6612) | Motor power from a separate battery box; the driver's GND connected to the Arduino GND (common GND) |

**Safety:** Do not power the motors from the Arduino's 5 V pin; use a separate battery box and join the GNDs. Do not connect the battery the wrong way round and do not let its leads touch (short circuit). For the first test, lift the robot so the wheels are in the air. We do not describe the motor driver in detail in this lesson; that comes in lesson 77.

### Program
The sketch below reads two PWM values from the serial port in the form "left right" (between −255 and 255, minus = backwards). It drives the motors and prints the results of the formulas for the same values.

The `pwmdenHiz` (speed from PWM) function is a model that gives the wheel speed (m/s) from the PWM value: below PWM 51 the wheel does not turn (**dead zone**), at PWM 255 the wheel turns at 0.396 m/s, and in between it is linear. You will measure these values yourself in lesson 78; for now, take them as given.

```cpp
// sketch: diferansiyel_hesap
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

const float L = 0.12;       // aks aralığı (m)
const float V_MAX = 0.396;  // PWM 255'te tekerlek hızı (m/s)
const int OLU_PWM = 51;     // bu değerin altında tekerlek dönmez

float pwmdenHiz(int pwm) {
  int a = abs(pwm);
  if (a <= OLU_PWM) return 0;
  float h = (a - OLU_PWM) / (255.0 - OLU_PWM) * V_MAX;
  return pwm > 0 ? h : -h;
}

void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
  Serial.setTimeout(100);
  Serial.println("Hazir: sol_pwm sag_pwm");
}

void loop() {
  if (Serial.available() == 0) return;
  String satir = Serial.readStringUntil('\n');
  int bosluk = satir.indexOf(' ');
  if (bosluk < 0) return;
  int pwmL = constrain(satir.substring(0, bosluk).toInt(), -255, 255);
  int pwmR = constrain(satir.substring(bosluk + 1).toInt(), -255, 255);
  motor(SOL_EN, SOL_IN1, SOL_IN2, pwmL);
  motor(SAG_EN, SAG_IN1, SAG_IN2, pwmR);

  float vL = pwmdenHiz(pwmL);
  float vR = pwmdenHiz(pwmR);
  float v = (vR + vL) / 2;
  float w = (vR - vL) / L;
  Serial.print("vL="); Serial.print(vL, 3);
  Serial.print(" vR="); Serial.print(vR, 3);
  Serial.print(" v="); Serial.print(v, 3);
  Serial.print(" w="); Serial.print(w, 3);
  if (fabs(vR - vL) < 0.0005) {
    Serial.println(" R=duz");
  } else {
    Serial.print(" R="); Serial.println((L / 2) * (vR + vL) / (vR - vL), 3);
  }
}
```

In the Serial monitor, set the line ending to "Newline" and send pairs such as `204 204`, `-204 204`, `153 204`.

### How does it work?
1. `motor()` takes a signed PWM: if it is positive, IN1 goes high; if it is negative, IN2 goes high. The speed goes to the EN pin with `analogWrite`. The details of direction and PWM are in lesson 77.
2. `pwmdenHiz()` converts PWM to m/s. Inside the dead zone it returns zero.
3. Then `v` and `ω` are calculated with the two formulas above. `R` is only calculated if the wheel speeds are different; if they are equal the denominator is zero, so it prints "duz" (straight).
4. To compare the calculation with real motion, we ran the same sketch on the robot in the simulation and measured the distance the robot travelled and its change of heading over 2 seconds.

### Measurement
Values measured on the robot in the simulation (each row is a 2-second average after the motion had settled):

| Sent (left right) | Calculated v, ω, R | Measured v, ω, R |
|---|---|---|
| `204 204` | 0.297 m/s, 0, straight | 0.295 m/s, 0, straight |
| `-204 204` | 0, 4.95 rad/s, 0 | 0, 4.92 rad/s (about 282°/s), 0 |
| `153 204` | 0.248 m/s, 0.825 rad/s, 0.30 m | 0.246 m/s, 0.822 rad/s, 0.30 m |
| `0 204` | 0.148 m/s, 2.475 rad/s, 0.06 m | 0.148 m/s, 2.46 rad/s, 0.06 m |

The calculation and the measurement are very close. With opposite speeds the robot really did spin on the spot, and with `0 204` it drew a circle of 6 cm radius around the stopped wheel. The answer to the inverse problem worked too: when you send `123 185`, the robot moved with v = 0.20 m/s and ω = 1.0 rad/s (we found the PWM values 123 and 185 with the inverse of the `pwmdenHiz` function: PWM = 51 + 204 · v / 0.396).

What may be different on a real robot: the wheels slip on the ground, the two motors never turn at exactly the same speed, and the radius and axle track must be measured with a ruler. The formulas stay the same, but the measured results do not come out as clean as in the simulation.

### Try it
- Send `100 -100`. Which way does the robot turn? Predict the sign of ω with the formula first.
- What should vL and vR be for a curve with a radius of 15 cm? (Hint: choose v = 0.2 m/s, calculate ω = v / R, then use the inverse problem formula.)
- Give both wheels the same speed, but write a value below `OLU_PWM` (`40 40`). Why does nothing happen?

### Common mistakes
- Mixing up centimetres and metres: L is 0.12 m, not 12.
- Writing the wheel radius (0.033) instead of L.
- Thinking ω is in degrees: the formula gives radians per second. To convert to degrees, multiply by 180/π ≈ 57.3.
- Mixing up the turning direction: if the right wheel is faster, the robot turns **left** (ω positive).
- Trying to calculate the R formula when vR = vL: that is a division by zero.

## Discuss
The two motors of a real robot may not turn at exactly the same speed even at the same PWM. In that case, what does the robot do when you tell it to "go straight", and how would you notice?

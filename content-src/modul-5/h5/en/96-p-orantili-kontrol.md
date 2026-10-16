# P: proportional control
duration: 30

## Wonder
When you ride your bike close to the edge of the road, how much do you turn the handlebars? A little if you got a bit close, a lot if you got very close. Nobody works out "3 cm left to the edge, turn exactly 7 degrees"; the amount you turn grows with the error. The bang-bang line follower from lesson 88 only knows "right", "left" or "straight". In this lesson you will teach the robot to steer as much as the error is. This is called **P (proportional) control**.

## Activity
### Concepts
- **Setpoint:** where the robot wants to be. Here: with the line exactly in the middle of the array.
- **Error (e):** the difference between the setpoint and the measurement. If the error is 0, the robot is where it wants to be.
- **Control output (u):** the robot's steering. In P control, `u = Kp x e`.
- **Kp:** the number that turns the error into steering. The bigger it is, the harder the robot reacts to the same error.

### Circuit
| Part | Connection |
|---|---|
| Left motor (L298N / TB6612) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| 5-sensor line array | **A0 ... A4** (A0 far left, A4 far right); sensors 2.4 cm apart, 7 cm in front of the wheel axle |

Do not power the motors from the Arduino's 5 V pin; use an external battery and connect the battery's negative terminal to the Arduino GND (common GND). Do not short-circuit the battery or connect it the wrong way round.

### Program
First, a small sketch that turns the array's raw data into the **position** of the line. We give each sensor a weight: +2 for A0, +1 for A1, 0 for A2, -1 for A3, -2 for A4. The average of the weights of the sensors that see the line is the line's position. Positive position: the line is to the robot's left.

```cpp
// sketch: konum_oku
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;                          // bunun üstü = çizgi

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sayi = 0;       // çizgiyi gören sensör sayısı
  int toplam = 0;     // görenlerin ağırlıklarının toplamı
  for (int i = 0; i < 5; i++) {
    if (analogRead(SENSOR[i]) > ESIK) {
      sayi++;
      toplam += 2 - i;    // ağırlıklar: +2, +1, 0, -1, -2
    }
  }
  if (sayi == 0) {
    Serial.println("kayip");
  } else {
    Serial.println((float)toplam / sayi, 1);
  }
  delay(200);
}
```

If only A1 sees the line, it prints `1.0`; if A0 and A1 see it together, `1.5`; if no sensor sees it, `kayip` (lost). The array's 5 sensors let us measure the line in steps of 0.5 (-2 ... +2).

Now the P-controlled line follower that uses this position as the error:

```cpp
// sketch: p_cizgi
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const float KP = 170.0;            // hata 1 birim olunca direksiyon: 170 PWM
const int TABAN = 200;             // düz giderken her tekerleğin PWM'i
const unsigned long DT = 10;       // kontrol periyodu (ms)

unsigned long son = 0;
float sonYon = 1;                  // çizgi en son hangi taraftaydı

// v: -255...255. Ölü bölgeyi atlar (78. ders): 1 -> %20 PWM, 255 -> %100.
void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

// Hata: çizginin konumu, -2...+2. Pozitif = çizgi solda.
float hataOku() {
  int sayi = 0;
  float toplam = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(SENSOR[i]) > ESIK) {
      sayi++;
      toplam += 2 - i;
    }
  }
  if (sayi == 0) return sonYon * 2.0;     // çizgi kayıp (sensörler arası boşluk da olabilir): son görülen yöne "uzakta" de
  float e = toplam / sayi;
  if (e != 0) sonYon = (e > 0) ? 1 : -1;
  return e;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
}

void loop() {
  if (millis() - son < DT) return;     // 10 ms'de bir çalış
  son += DT;

  float e = hataOku();
  float u = KP * e;                    // P kontrol: çıkış = Kp x hata

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);   // u > 0 (çizgi solda): sol yavaşla, sağ hızlan
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
```

### How does it work?
1. `hataOku()` gives the position of the line. Because the setpoint is 0, the position itself is the error: `e > 0` means the line is on the left.
2. `u = KP * e`: if the error doubles, the steering doubles too.
3. The left wheel gets `TABAN - u` and the right wheel `TABAN + u`. If the line is on the left (`u > 0`), the left wheel slows down, the right wheel speeds up and the robot turns left (the ω = (vR - vL) / L formula from lesson 76).
4. If the line is lost (`sayi == 0`), the error is set to ±2, meaning "very far" towards the side where the line was last seen (the position of the outermost sensor). Because the sensors are 2.4 cm apart and the line is 2 cm wide, the line may briefly be seen by none of them while it passes between two sensors; ±2 does not throw the robot around too much at these moments. The robot turns that way until it finds the line.
5. `surucu()` skips the dead zone from lesson 78: even if the command is 1, the PWM is at least 20%. This keeps the wheel speed roughly linear in `u`.
6. With `millis()` we built a fixed control loop that runs every 10 ms (lesson 27). A fixed period is also needed for the derivative in lesson 97.

### Measurement: change Kp
We ran the same sketch with 4 different `KP` values (8, 85, 210, 830) on `sim.rover`. Track: a track that runs anticlockwise, with two wavy (slalom) sections on its bottom straight and a bend radius of 17 cm. `TABAN = 200`. (The lesson uses `KP = 170`; for the table we chose four extreme values to see the effect of the setting.)

| Kp | Result | Lap time | Error RMS | Largest deviation | Steering jitter |
|---|---|---|---|---|---|
| 8 | lost the line | - | 52.6 mm | 175 mm | 0.06 |
| 85 | finished the lap | 10.40 s | 15.7 mm | 46 mm | 0.43 |
| 210 | finished the lap | 10.90 s | 8.4 mm | 19 mm | 0.95 |
| 830 | finished the lap | 12.10 s | 7.9 mm | 19 mm | 1.49 |

- **Error RMS:** the root mean square of the distance between the centre of the robot's array and the line. Smaller is better.
- **Steering jitter:** the average change, every 20 ms, in the speed difference between the left and right wheels (rad/s). A large value means the robot keeps wiggling its steering.

Reading the table:
- **If Kp is too small**, the steering is not enough. The robot leaves the line in the bend and loses it.
- **If Kp is suitable**, the robot stays on the line and finishes the lap.
- **As Kp grows**, the error shrinks but the steering jitter increases. At Kp = 830 the jitter is about 3.5 times that at Kp = 85, and the lap took 1.7 s longer. More Kp is not always better.

### Why did a large Kp not oscillate here?
On real robots a very large Kp often throws the robot from one side of the line to the other (oscillation). We saw very little of this on this track, because the array is **7 cm in front of** the wheel axle. The robot sees where its nose is going and corrects early. Looking ahead is a kind of damping. On the same track, with the array moved close to the axle (2 cm) and the same Kp = 210, we measured this in the first 8 seconds:

| Array relative to the axle | Number of line crossings | Error RMS |
|---|---|---|
| 7 cm in front | 7 | 8.4 mm |
| 2 cm in front | 14 | 17.6 mm |

When the array is closer to the axle, the robot crosses the line much more often; the oscillation grows. In lesson 97 you will learn the term that damps oscillation.

### What may be different on a real robot
- In this simulation no noise was added to the line sensors. On a real array, ambient light and surface colour change the reading; you need to calibrate the threshold as in lesson 87.
- Motor response speed and dead zone differ from robot to robot. Do not copy the Kp values here onto your own robot; measure on your own robot.

### Try it
- With `KP = 100`, set `TABAN` to 150, 200 and 255. At which speed does the robot lose the line?
- Set `ESIK` to 900. Over the line a sensor reads about 860. What does the robot do, and why?
- In the `konum_oku` sketch, bring two sensors over the line at once. Why does the position change in steps of 0.5?

### Common mistakes
- Swapping `TABAN - u` and `TABAN + u`: the robot turns away from the line instead of towards it.
- Defining the sign of the error wrongly. Here positive error = line on the left = turn left. Wire the right and left wheels to match.
- Making Kp very large in one go. Start small, double it each time and measure.
- Putting `delay()` inside `loop()`. If the control loop's period is not fixed, the D and I terms in the next lessons break.
- Skipping the line-lost case: when `sayi == 0` you get a division by zero, or the robot drives straight on.

## Discuss
When the robot is exactly on the line (error 0), what does P control give to the steering? What happens if, in a bend, the line always stays on the same side of the robot? If the error never becomes zero, is P control enough?

# Robot arm: servos and two-axis inverse kinematics
duration: 35

## Wonder
You want to tell a robot arm "go to that point on the table". But the arm's hand has no point, only two servos: one at the shoulder, one at the elbow. What angles will you give the servos? Finding the answer to this question is inverse kinematics. The good news: for a flat two-axis arm, the answer comes from the cosine rule you learned at school.

## Activity
### Circuit
The robot arm's servos are independent of the drive motors; in this lesson and the next, the arm works on its own.

| Part | Connection |
|---|---|
| Shoulder servo | signal **D9** |
| Elbow servo | signal **D10** |
| Gripper servo | signal **D11** |
| Servo power | The servos' red (+) wire to an **external 5 V** supply, the brown (−) wire to both the external supply's negative and the Arduino **GND** (common GND) |

Servos, and especially three servos working together, need more current than can be drawn from the Arduino's 5 V pin. Always use external power and join the GNDs. When fitting the battery, do not connect plus and minus the wrong way round, and do not let the terminals touch each other.

### The arm's geometry
The arm has two parts: the **upper arm** from the shoulder to the elbow (length `L1`) and the **forearm** from the elbow to the gripper (`L2`). In this lesson both are 10 cm. The origin is the shoulder axis; x points forwards, y points up, and our unit is the centimetre.

We use two angles (the same as the servo angle, 0-180°):
- **q1 (shoulder):** the angle the upper arm makes with the horizontal (the x axis). 0° = forwards horizontal, 90° = straight up, 180° = backwards horizontal.
- **q2 (elbow):** how far the forearm closes downwards from the line of the upper arm. 0° = arm stretched out straight, 90° = elbow at a right angle, 180° = forearm folded onto the upper arm.

The servo is fitted to the arm so that it matches this definition. If 0° is somewhere else on your own arm, you need to shift the angles to match.

**Forward kinematics** (from angles to position): the upper arm points in the q1 direction, and the forearm in the (q1 − q2) direction.

```
x = L1·cos(q1) + L2·cos(q1 − q2)
y = L1·sin(q1) + L2·sin(q1 − q2)
```

**Inverse kinematics** (from position to angles): let the target be (x, y). The shoulder, the elbow and the target form a triangle; its sides are `L1`, `L2` and `r = √(x² + y²)`. From the cosine rule:

```
cos(q2) = (r² − L1² − L2²) / (2·L1·L2)
q2 = acos(...)
q1 = atan2(y, x) + atan2(L2·sin(q2), L1 + L2·cos(q2))
```

The first line gives the elbow angle. The elbow angle in the triangle is `180° − q2`, which is why the sign comes out this way in the formula. In the second line, the shoulder angle of the triangle is added to the angle towards the target (`atan2(y, x)`). In this solution the elbow stays on top. There is also a second solution where the elbow stays underneath, but because in this servo layout the elbow can only close in one direction, we do not use it.

### Unreachable points
For every target, check two things:
1. **Reach:** if `cos(q2)` is greater than 1 or less than −1, the triangle cannot be formed. The target is too far away (`r > L1 + L2`, that is, more than 20 cm).
2. **Servo limit:** if the calculated q1 or q2 goes outside 0-180°, the servo cannot go there. For example, the shoulder cannot go below 0°. So the arm cannot reach points far below the shoulder.

For an unreachable target, **write nothing** to the servos; let the arm stay where it is.

### From servo angle to pulse width
As you saw in lesson 21, a servo is driven by pulse width. `Servo.write(açı)` places the angle between about 544 µs (0°) and 2400 µs (180°). If you write µs directly with `writeMicroseconds()`, 1 µs is about 0.1°; `write()`, on the other hand, gives whole degrees. For high precision we will use µs:

```
pulse (µs) = 544 + angle · (2400 − 544) / 180
```

### Program
The program tries six targets in turn. For a reachable target it works out the angles, writes them to the servos, calculates back with forward kinematics and prints the deviation from the target in millimetres.

```cpp
// sketch: kol_ters_kinematik
#include <Servo.h>

const int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;
const float L1 = 10.0, L2 = 10.0;         // cm
const float DERECE = 180.0 / PI;

Servo omuz, dirsek, tutucu;

int acidanUs(float aci) {                 // 0-180° → darbe genişliği (µs)
  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);
}

void ileri(float q1, float q2, float &x, float &y) {
  float a1 = q1 / DERECE;
  float a2 = (q1 - q2) / DERECE;
  x = L1 * cos(a1) + L2 * cos(a2);
  y = L1 * sin(a1) + L2 * sin(a2);
}

// 0: tamam, 1: erişilemez (çok uzak), 2: servo sınırı dışında
int ters(float x, float y, float &q1, float &q2) {
  float r2 = x * x + y * y;
  float c = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c > 1.0 || c < -1.0) return 1;
  float s2 = acos(c);                      // dirsek bükülmesi (radyan)
  float hedefAci = atan2(y, x);
  float omuzRad = hedefAci + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  q1 = omuzRad * DERECE;
  q2 = s2 * DERECE;
  if (q1 < 0 || q1 > 180 || q2 < 0 || q2 > 180) return 2;
  return 0;
}

const int HEDEF_SAYISI = 6;
const float HEDEF[HEDEF_SAYISI][2] = {
  {14, 6}, {10, 10}, {18, 0}, {-6, 12}, {8, -12}, {25, 5}
};

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN);
  dirsek.attach(DIRSEK_PIN);
  tutucu.attach(TUTUCU_PIN);
  omuz.writeMicroseconds(acidanUs(90));    // başlangıç: kol dik yukarı
  dirsek.writeMicroseconds(acidanUs(0));
  tutucu.write(90);
  delay(1000);

  for (int i = 0; i < HEDEF_SAYISI; i++) {
    float x = HEDEF[i][0], y = HEDEF[i][1];
    float q1, q2;
    int sonuc = ters(x, y, q1, q2);

    Serial.print("t=");        Serial.print(millis());
    Serial.print(" hedef=");   Serial.print(x, 1);
    Serial.print(",");         Serial.print(y, 1);

    if (sonuc == 0) {
      float gx, gy;
      ileri(q1, q2, gx, gy);               // geri hesap: doğrulama
      float hata = sqrt((gx - x) * (gx - x) + (gy - y) * (gy - y)) * 10.0;   // cm → mm
      Serial.print(" q1=");      Serial.print(q1, 2);
      Serial.print(" q2=");      Serial.print(q2, 2);
      Serial.print(" ileri=");   Serial.print(gx, 2);
      Serial.print(",");         Serial.print(gy, 2);
      Serial.print(" hata_mm="); Serial.println(hata, 3);
      omuz.writeMicroseconds(acidanUs(q1));
      dirsek.writeMicroseconds(acidanUs(q2));
    } else if (sonuc == 1) {
      Serial.println(" ULASILAMAZ uzak");
    } else {
      Serial.println(" ULASILAMAZ servo siniri");
    }
    delay(1500);
  }
}

void loop() {
}
```

### How does it work?
1. `ters()` (inverse) first looks at the value of `cos(q2)`. If it is greater than 1 or less than −1, the target is outside the arm's reach and it returns `1`.
2. Then it works out the two angles from the formula. If they are outside 0-180°, the servo cannot go there, and it returns `2`.
3. The servos move only if the result is `0`. In the other two cases the arm stays where it is.
4. We write to the servos with `writeMicroseconds()`. Rounding to whole degrees (`write()`) would create an error of up to half a degree; at the tip of a 20 cm arm that is about 1.7 mm. With µs the error is very small.
5. `ileri()` (forward) tries to get back to the target with the calculated angles. This difference is printed as `hata_mm` (error in mm). Inverse and forward kinematics must be the inverse of each other; if the difference is not close to zero, there is a mistake in the formula or in the signs in the code.

In the serial output you see this for the first target: `q1=63,60 q2=80,79`, and `hata_mm` well below a millimetre. For the `{10, 10}` target you get `q1 = 90°`, `q2 = 90°`: the upper arm upright and the forearm horizontal. Picture it in your head and check whether it is right. The point `{8, -12}` stays at the servo limit because it is far below the shoulder, and `{25, 5}` is outside the 20 cm reach.

### Try it
- Set `L2` to 15 (and leave `L1` at 10). What does the arm's reach become? Can it reach very close points (for example `{2, 1}`)?
- Add your own points to the `HEDEF` (target) array. Which ones come out as `ULASILAMAZ` (unreachable)? Check this by drawing it by hand.
- In the `ileri()` function, write `(q1 + q2)` instead of `(q1 - q2)`. What does `hata_mm` become? Why do we use inverse and forward kinematics together to catch this kind of mistake?

### Common mistakes
- Mixing up radians and degrees: `cos()` and `sin()` want radians, the servo wants degrees.
- Giving `acos()` a value slightly above 1: the result is `NaN`. Check the range first.
- Writing an unreachable target to the servo as well: `NaN` or out-of-range angles strain the servo. Check the result of `ters()` first.
- Powering the servos from the Arduino's 5 V pin: the board resets or the servos jitter.
- Forgetting the 0° reference when fitting the servo to the arm: even if the calculation is right, the arm goes to the wrong place.

### What may be different on a real robot
In the simulation the servo goes to the pulse instantly and has no load. A real servo may not fully reach the target angle under load, cheap servos have gear backlash, and the pulse-to-angle mapping (544-2400 µs) varies a little from servo to servo. That is why you need to calibrate each servo on your own arm. Measure the arm lengths with a ruler and write them into the code; the accuracy of the calculation depends on these measurements.

## Discuss
A human arm also works with a shoulder and an elbow, and when reaching for a cup on the table it does not "calculate" inverse kinematics; it just reaches. Why does the robot arm have to calculate? Think about how there can be two different elbow positions that reach the target point; which one would you choose, and why?

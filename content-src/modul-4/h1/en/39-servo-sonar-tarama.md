# Scanning with a servo (sonar)
duration: 25

## Wonder
In submarine films there is a sonar that goes "beep... beep..." as it sweeps round the screen. A sonar does not look in just one direction; it sends sound in every direction in turn and maps what is where. Our HC-SR04 only measures the direction it is facing. So what if we put it on top of a servo, made it scan the surroundings and found which direction the nearest object is in?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 GND | Uno **GND** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |
| Servo SIG | Uno **D6** |
| Servo VCC | Uno **5V** |
| Servo GND | Uno **GND** |

Note (from lesson 21): a servo draws a sudden current while it moves. In a real circuit this current can pull down the Uno's 5 V line and reset the board, or spoil the sensor's measurements; that is why in real projects the servo is powered from a separate 5 V supply and the GNDs are joined together. There is no external power supply in the lab, so you connect the servo to the Uno's 5V and GND pins.

**In the lab, the sensor does not turn with the servo.** In a real sonar, the HC-SR04 is fixed to the servo's arm and faces different directions as the servo turns. In the lab, the sensor has a single **Distance** value. To pretend there are different objects in different directions, you change Distance yourself while the program is running. For example, when the servo is around 120°, set Distance to 35 cm, then bring it back to 200 cm. In the serial monitor you see the line `120:35.0`.

### The idea
We increase the servo angle from 0° to 180° in 30° steps. At each step:
1. `servo.write(aci)` sends the servo to the angle.
2. We wait until the servo gets there (`delay(300)`; a typical value for small servos, it changes with the load and the servo).
3. We measure the distance with the sensor. Instead of a single measurement, we use the median idea from lesson 38: the middle of three measurements.
4. We print the result in the form **"angle:distance"**, for example `120:35.0`.
5. We keep the smallest distance and the angle at that moment.

When the scan is finished, the "EN YAKIN" (nearest) line is printed. If no object is found (all 400 cm or no echo), "nesne yok" (no object) is printed.

### Program 1: the scan and the nearest object
```cpp
// sketch: sonar_tarama
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int ADIM = 30;                  // derece
const float MENZIL = 400.0;           // yankı yok: uzak say

Servo servo;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

// Üç sayının ortancası: ne en küçük ne en büyük olan
float medyan3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

float olc() {
  float a = tekOlcum(); delay(30);
  float b = tekOlcum(); delay(30);
  float c = tekOlcum();
  return medyan3(a, b, c);
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  Serial.begin(9600);
  servo.write(0);
  delay(600);                         // başlangıç konumuna git
}

void loop() {
  float enYakin = MENZIL;
  int enYakinAci = -1;

  for (int aci = 0; aci <= 180; aci += ADIM) {
    servo.write(aci);
    delay(300);                       // servo varsın
    float cm = olc();
    Serial.print(aci);
    Serial.print(":");
    Serial.println(cm, 1);
    if (cm < enYakin) {
      enYakin = cm;
      enYakinAci = aci;
    }
  }

  if (enYakinAci < 0) {
    Serial.println("EN YAKIN: nesne yok");
  } else {
    Serial.print("EN YAKIN: ");
    Serial.print(enYakinAci);
    Serial.print(" derece, ");
    Serial.print(enYakin, 1);
    Serial.println(" cm");
  }
  servo.write(0);                     // başa dön
  delay(800);
}
```

### How does it work?
1. The `for` loop sets the angle to 0, 30, 60, ... 180. `aci += ADIM` adds 30 each time round.
2. `delay(300)` waits for the servo to move. If you do not wait, the sensor measures while the servo is still turning and it gets unclear which angle the measurement belongs to.
3. `medyan3` throws away the oddest of three measurements. The formula: `max(min(a,b), min(max(a,b),c))`. It finds the middle of three numbers without sorting.
4. The comparison `cm < enYakin` catches the smallest distance. Because `enYakin` (nearest) starts at `MENZIL`, measurements with no echo (400) can never be "the nearest".
5. The result lines are in the form `aci:mesafe` (angle:distance). This format is a good habit: a PC program or a plotting tool can read the data by splitting at the `:` sign.

A servo angle is really a **pulse width** (lesson 21): about 544 µs matches 0° and about 2400 µs matches 180°. For `write(90)`, the Servo library sends a pulse of about 1472 µs every 20 ms.

### Program 2: point at the nearest object
This time, let the scan happen only once. Then the servo turns towards the nearest object, stays there and prints the distance in that direction live.

```cpp
// sketch: sonar_isaret
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int ADIM = 30;
const float MENZIL = 400.0;

Servo servo;
int hedefAci = 90;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float medyan3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

float olc() {
  float a = tekOlcum(); delay(30);
  float b = tekOlcum(); delay(30);
  float c = tekOlcum();
  return medyan3(a, b, c);
}

// Tarama yapar, en yakın nesnenin açısını döndürür (yoksa -1)
int enYakinAciBul() {
  float enYakin = MENZIL;
  int aciEn = -1;
  for (int aci = 0; aci <= 180; aci += ADIM) {
    servo.write(aci);
    delay(300);
    float cm = olc();
    if (cm < enYakin) {
      enYakin = cm;
      aciEn = aci;
    }
  }
  return aciEn;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  Serial.begin(9600);
  servo.write(0);
  delay(600);

  int aci = enYakinAciBul();
  if (aci >= 0) hedefAci = aci;       // nesne bulunduysa oraya dön
  else hedefAci = 90;                 // yoksa ortada dur
  servo.write(hedefAci);
  delay(500);
}

void loop() {
  Serial.print("isaret=");
  Serial.print(hedefAci);
  Serial.print(" mesafe=");
  Serial.println(olc(), 1);
  delay(500);
}
```

Here the scan has been moved into a function: `enYakinAciBul()` (find the nearest angle) returns the angle. `setup()` calls it once, then the servo stays at that angle. If we call this "pointing at the object", the next step would be **following the object**: narrowing the scan range and updating it all the time.

### Try it
- Set `ADIM` to 15 and to 10. How many seconds does the scan take? What do you lose as the resolution goes up? (Work it out: number of steps × about 400 ms.)
- Scan on the way back too (from 180° to 0°) and compare the results of the two directions. Do they come out the same?
- Paste the `sonar_tarama` output into a spreadsheet program and draw a graph: angle on the horizontal axis, distance on the vertical axis. Where does the object show up as a "dip"?

### Common mistakes
- Forgetting to wire the servo's VCC or GND: the servo does not move at all, and the lab gives a "not powered" warning.
- Forgetting the line `servo.attach(SERVO_PIN)`: the `servo.write` calls do not move the servo.
- In a real circuit, powering the servo and the sensor from the same weak 5 V line and forgetting the common GND: the board resets and the sensor talks nonsense.
- Measuring before the movement has finished: the angle and the distance do not match. That is what `delay(300)` is for.
- Forgetting the sensor's beam width: the datasheet typically gives a measuring angle of about 15°, so the sensor looks at a cone, not a single line. 30° steps can show some objects at two neighbouring angles at once, or not at all.
- Not starting `enYakin` with a very large value (starting with 0, for example): no measurement can be "smaller".

## Discuss
If an object moves during the scan, will the result of the scan be right? If a 180° scan takes 3 seconds, does it make sense to use this sensor on a fast-moving vehicle?

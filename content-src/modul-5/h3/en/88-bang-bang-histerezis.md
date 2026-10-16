# Bang-bang line following and hysteresis
duration: 25

## Wonder
You are walking along a dark corridor with your hand touching the wall. If you drift away from the wall, you move closer; if you get too close, you move away. You do not walk in a straight line; you trace a slight zigzag, but you never lose the wall. This is also the simplest method for a line-following robot. There is just one question: how big does this zigzag get, and how often does the robot lose the line?

## Activity
### What is bang-bang control?
In bang-bang control, the output is only ever one of a few fixed options: "turn left", "go straight", "turn right". There are no values in between. The thermostat in lesson 35 was like this too: the heater was either fully on or fully off. In line following, the rule is:

- If the line appears on the left, turn left (slow down or stop the left motor).
- If the line appears on the right, turn right.
- If the line is in the middle, go straight.

### Circuit
Standard connections (as in lessons 86 and 87):

| Part | Connection |
|---|---|
| Line sensors 0…4 | AO → **A0…A4** (A0 far left) |
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Use external power and a common GND for the motors; do not connect the battery the wrong way round and do not short its leads.

### Program 1: with a single sensor (zigzag)
First the simplest version: only the middle sensor (A2). If the sensor is on the line, turn right; if not, turn left. The robot tries to follow the edge of the line.

```cpp
// sketch: bangbang_tek
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int ORTA_SENSOR = A2;
const int ESIK = 512;
const int HIZ = 150;      // hizli tekerlek
const int DONUS = 0;      // yavas tekerlek (0 = durur)

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
}

void loop() {
  if (analogRead(ORTA_SENSOR) > ESIK) {
    motor(HIZ, DONUS);      // cizgi altinda: saga don
  } else {
    motor(DONUS, HIZ);      // cizgi disinda: sola don
  }
}
```

### Program 2: with five sensors and a memory of the last direction
Five sensors tell you which side the line is on. If A0 or A1 sees it, the line is on the left; if A3 or A4 sees it, it is on the right. What do we do if none of them sees it? This is where **memory** comes in: `sonYon` (last direction) holds which side the line was last seen on. If the line disappears, the robot keeps turning that way, because the line most probably stayed on that side.

This is a kind of **hysteresis**: the decision depends not only on the current reading but also on the past. The thermostat in lesson 35 also remembered its state by saying "the switch-off threshold while on, the switch-on threshold while off".

I also added a measurement to the program: the total time during which no sensor sees the line (`kayipMs`, lost ms) is printed every second.

```cpp
// sketch: bangbang_dizi
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;
const int HIZ = 150;
const int DONUS = 0;

int sonYon = 0;                  // -1 cizgi solda, 0 ortada, +1 sagda
unsigned long sonTur = 0;
unsigned long kayipMs = 0;       // hicbir sensorun cizgiyi gormedigi toplam sure
unsigned long sonYazi = 0;

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hicbiri = !(sol || sag || orta);

  if (hicbiri) {
    kayipMs += simdi - sonTur;
  }
  sonTur = simdi;

  if (sol) {
    sonYon = -1;
  } else if (sag) {
    sonYon = 1;
  } else if (orta) {
    sonYon = 0;
  }                              // hicbiri: sonYon aynen kalir (hafiza)

  if (sonYon == 0) {
    motor(HIZ, HIZ);
  } else if (sonYon < 0) {
    motor(DONUS, HIZ);           // sola don
  } else {
    motor(HIZ, DONUS);           // saga don
  }

  if (simdi - sonYazi >= 1000) {
    sonYazi = simdi;
    Serial.print("t=");
    Serial.print(simdi / 1000);
    Serial.print(" kayip=");
    Serial.println(kayipMs);
  }
}
```

### Program 3: hysteresis on a noisy sensor (two thresholds)
Memory is used not only for the direction but also for the threshold itself. A real sensor's reading flickers. While the reading is near the threshold, a single threshold keeps giving 0-1-0-1. If you use **two thresholds** (one upper, one lower), this flicker has no effect: the signal must first go above the upper threshold (switch on), then drop below the lower threshold (switch off).

The sketch below watches A2. The LED on D13 lights with a single threshold (512), the LED on D12 with two thresholds (switch on at 600, switch off at 420). Because the line sensor in the simulation has no noise, in this sketch we drive A2 by hand; you will see noise on a real sensor too.

```cpp
// sketch: histerezis_esik
const int SENSOR_PIN = A2;
const int LED_TEK = 13;
const int LED_HIST = 12;
const int ESIK = 512;
const int ESIK_YUKARI = 600;
const int ESIK_ASAGI = 420;
bool histDurum = false;

void setup() {
  pinMode(LED_TEK, OUTPUT);
  pinMode(LED_HIST, OUTPUT);
}

void loop() {
  int v = analogRead(SENSOR_PIN);

  digitalWrite(LED_TEK, v > ESIK);

  if (!histDurum && v > ESIK_YUKARI) {
    histDurum = true;
  } else if (histDurum && v < ESIK_ASAGI) {
    histDurum = false;
  }
  digitalWrite(LED_HIST, histDurum);
}
```

### How does it work?
1. `bangbang_tek` keeps the robot turning all the time: right if it is on the line, left if not. It can never go straight; the robot zigzags constantly along the edge of the line. The middle sensor's state changes very often.
2. `bangbang_dizi` watches the two sides separately. While the line is in the middle it goes straight; if one of the edge sensors sees it, it turns that way. The zigzag shrinks a lot.
3. While the line is on no sensor, `sonYon` does not change and the robot keeps turning towards the last direction it knew. If you change the `else if (orta)` line to `else` (if there is no line, go straight), the memory is gone.
4. Measurements (an oval track in the simulation, circumference ≈ 2.9 m, the robot starting on the line):

| Program | Lap of the track | Total time not seeing the line |
|---|---|---|
| `bangbang_tek` | not finished in 30 s | more than half of the 30 s |
| `bangbang_dizi` (with memory) | ≈ 17 s | ≈ 3.9 s (longest gap ≈ 0.24 s) |
| `bangbang_dizi`, without memory (straight if no line) | ≈ 17 s | ≈ 12 s (longest gap ≈ 1.2 s) |

The version without memory also finishes the lap, but it cannot see the line for much longer. Memory cuts the lost time to a third.
5. In the `histerezis_esik` sketch, on a noisy signal the single-threshold LED flashes on and off dozens of times, while the two-threshold LED switches on only once and off only once.

### Try it
- In `bangbang_dizi`, set `DONUS` to 60. Does the gentler turn make the lap longer or shorter? Does the time it cannot see the line change?
- Set `HIZ` to 200. Does the lap get shorter? What happens to the lost time?
- Change the `else if (orta)` line to `else` and compare the lost time.

### Common mistakes
- Mixing up the turning direction of the left and right motors: when it says "line on the left" you turn right and the robot runs away from the line.
- Too high a speed: the robot crosses the line before it starts turning.
- Not using memory at all: when the line disappears for a moment, the robot goes straight and misses the bend.
- Choosing the threshold by guessing: when the light changes, the decision breaks (lesson 87).

### What may be different on a real robot
In the simulation the sensor has no noise and the timing is perfect. On a real robot, flickering readings, a motor speed that changes as the battery voltage drops, and flaws in the floor make the zigzag bigger; deciding with two thresholds (hysteresis) makes a real difference on a real sensor.

## Discuss
One way to reduce the zigzag is to go more slowly; another is to answer the question "how far off are you?" with a number instead of left/right, and to set the turn according to that number. Why do you think this second way would be smoother than bang-bang?

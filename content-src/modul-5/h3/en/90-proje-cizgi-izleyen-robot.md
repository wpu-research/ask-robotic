# Project: A line-following robot (track)
duration: 35

## Wonder
In a robot race, the judge looks at only two things: did the robot finish the track, and how long did it take? A robot that keeps losing the line slows down, and sometimes never finishes at all. In this project you will bring all of this week's parts together in a single program. At the end, the robot will report its own lap time and the time it could not see the line.

## Activity
### What are we going to do?
This project brings together the ideas of this week and the weeks before:
- **Lesson 86:** the five-sensor array, the "on the line?" decision with a threshold.
- **Lesson 87:** measuring min/max by wiggling at the start, threshold = (min + max) / 2 for each sensor. If the contrast is too low (line and floor cannot be told apart), the calibration counts as failed.
- **Lesson 88:** the bang-bang direction decision and the memory of the last direction.
- **Lesson 89:** crossing gaps, searching for the line, stopping if the line cannot be found.
- **Lessons 27 and 28:** a state machine with `millis()` and `enum`; no `delay` at all.
- **Lessons 77 and 78:** driver control with direction + PWM, the dead zone (below 20% PWM the wheel does not turn).

The robot will travel along a **track** and stop when it sees the finish strip. When it stops, it will print this on the serial port: `BITTI sure=… kayip=… enuzun=…` (finished, time, lost, longest; all in milliseconds).

### The track
The track is simple but contains every kind of difficulty. The robot starts at the beginning of the line, on the line and facing forward.

| Section | Length | What is there? |
|---|---|---|
| 1. Straight | about 60 cm | The start; there are another 20 cm of line behind the robot |
| 2. Curve | about 63 cm | A 90° curve to the left, radius 40 cm |
| 3. Straight | 30 cm | A straight exit after the curve |
| 4. Sharp bend | | A sharp 90° bend to the right (L) |
| 5. Straight | 60 cm | A straight piece |
| 6. Gap | 9 cm | No line; then the line continues |
| 7. Straight and finish | about 60 cm | At the end, a 30 cm finish strip at right angles to the line |

The line is 2 cm wide, the sensor spacing is 2.4 cm, and the sensors are 7 cm in front of the axle.

### Circuit
Standard connections:

| Part | Connection |
|---|---|
| Line sensors 0…4 | AO → **A0…A4** (A0 far left), VCC → 5 V, GND → GND |
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Use external power for the motors and the driver, and connect a common GND. Do not connect the battery the wrong way round and do not short its leads.

### Program
The flow of the program:

1. `KALIBRE` (calibrate): wiggle left and right for 1.8 s, measure each sensor's min/max, calculate and print the thresholds. If any sensor's contrast is less than `MIN_KONTRAST`, move to the `HATA` (error) state and do not move the robot.
2. `IZLE` (follow): the bang-bang rule from lesson 88. Straight while the middle sensor is on the line; if an edge sensor sees it, turn that way.
3. If no sensor sees the line: if the last direction was the middle, `BOSLUK` (gap, go straight); if it was an edge, `ARAMA` (search, turn on the spot that way).
4. If all five sensors are on the line at once and 3 s have passed since the start, this is the finish strip: stop and print the report.

The time it cannot see the line (`kayipMs`) and the longest single gap (`enUzunMs`) are added up while it runs.

```cpp
// sketch: cizgi_proje
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};

const int HIZ = 170;
const int SALLA_PWM = 120;
const unsigned long KALIBRASYON_MS = 1800;
const int MIN_KONTRAST = 200;                 // max - min bundan kucukse kalibrasyon basarisiz
const unsigned long BOSLUK_MS = 900;
const unsigned long ARAMA_MS = 2500;
const unsigned long BITIS_BEKLE_MS = 3000;    // baslangictan once bitis aranmaz

enum Durum { KALIBRE, IZLE, BOSLUK, ARAMA, BITTI, HATA };
Durum durum = KALIBRE;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
int sonYon = 0;                               // -1 sol, 0 orta, +1 sag
unsigned long durumBasla = 0;
unsigned long turBasla = 0;
unsigned long sonTur = 0;
unsigned long kayipMs = 0;
unsigned long kesintiMs = 0;
unsigned long enUzunMs = 0;

void motor(int sol, int sag) {
  digitalWrite(SOL_IN1, sol > 0);
  digitalWrite(SOL_IN2, sol < 0);
  analogWrite(SOL_EN, abs(sol));
  digitalWrite(SAG_IN3, sag > 0);
  digitalWrite(SAG_IN4, sag < 0);
  analogWrite(SAG_EN, abs(sag));
}

void gec(Durum yeni) {
  durum = yeni;
  durumBasla = millis();
}

void kalibreAdimi(unsigned long t) {
  if (t < 400) motor(-SALLA_PWM, SALLA_PWM);
  else if (t < 1200) motor(SALLA_PWM, -SALLA_PWM);
  else if (t < 1600) motor(-SALLA_PWM, SALLA_PWM);
  else motor(0, 0);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    int v = analogRead(SENSOR_PIN[i]);
    if (v < enAz[i]) enAz[i] = v;
    if (v > enCok[i]) enCok[i] = v;
  }
}

bool esikleriHesapla() {
  bool tamam = true;
  Serial.print("esikler:");
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    esik[i] = (enAz[i] + enCok[i]) / 2;
    if (enCok[i] - enAz[i] < MIN_KONTRAST) tamam = false;
    Serial.print(' ');
    Serial.print(esik[i]);
  }
  Serial.println();
  return tamam;
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    enAz[i] = 1023;
    enCok[i] = 0;
  }
  gec(KALIBRE);
}

void loop() {
  unsigned long simdi = millis();
  unsigned long gecen = simdi - durumBasla;

  if (durum == KALIBRE) {
    kalibreAdimi(gecen);
    if (gecen >= KALIBRASYON_MS) {
      if (esikleriHesapla()) {
        turBasla = simdi;
        sonTur = simdi;
        gec(IZLE);
      } else {
        Serial.println("KALIBRASYON HATASI");
        gec(HATA);
      }
    }
    return;
  }
  if (durum == BITTI || durum == HATA) {
    motor(0, 0);
    return;
  }

  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > esik[i];
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hepsi = s[0] && s[1] && s[2] && s[3] && s[4];
  bool hicbiri = !(sol || sag || orta);

  // olcum: cizgiyi gormedigimiz sure
  unsigned long dt = simdi - sonTur;
  sonTur = simdi;
  if (hicbiri) {
    kayipMs += dt;
    kesintiMs += dt;
    if (kesintiMs > enUzunMs) enUzunMs = kesintiMs;
  } else {
    kesintiMs = 0;
  }

  if (hepsi && simdi - turBasla > BITIS_BEKLE_MS) {
    motor(0, 0);
    Serial.print("BITTI sure=");
    Serial.print(simdi - turBasla);
    Serial.print(" kayip=");
    Serial.print(kayipMs);
    Serial.print(" enuzun=");
    Serial.println(enUzunMs);
    gec(BITTI);
    return;
  }

  switch (durum) {
    case IZLE:
      if (hicbiri) {
        gec(sonYon == 0 ? BOSLUK : ARAMA);
        break;
      }
      if (sol) sonYon = -1;
      else if (sag) sonYon = 1;
      else sonYon = 0;
      if (sonYon == 0) motor(HIZ, HIZ);
      else if (sonYon < 0) motor(0, HIZ);
      else motor(HIZ, 0);
      break;

    case BOSLUK:
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }
      motor(HIZ, HIZ);
      break;

    case ARAMA:
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > ARAMA_MS) {
        motor(0, 0);
        Serial.println("CIZGI KAYBOLDU");
        gec(HATA);
        break;
      }
      if (sonYon <= 0) motor(-HIZ, HIZ);
      else motor(HIZ, -HIZ);
      break;

    default:
      break;
  }
}
```

### How does it work?
1. On every pass of `loop`, in order: if the state is `KALIBRE`, a calibration step; if it is `BITTI` or `HATA`, stop; otherwise read the sensors, update the measurement, check for the finish, then drive according to the state. There is no `delay` anywhere, so the sensors are always read fresh.
2. The threshold is separate for each sensor and is measured during calibration. In the simulation it prints `esikler: 511 511 511 511 511`. `MIN_KONTRAST = 200` is a safety measure: if the robot has been placed by mistake far from the line (the sensors never saw a line), the program prints `KALIBRASYON HATASI` (calibration error) and does not drive the robot; in this case the robot stays where it is.
3. The `BOSLUK` state goes straight across the 9 cm gap (about 0.4 s). `BOSLUK` and `ARAMA` start with the same `hicbiri` (none) condition; what separates them is `sonYon`.
4. `kayipMs` and `enUzunMs` are the program's own measurements. Both are calculated from the sensors. On this track the longest gap happens at the gap in the line; when the gap is 15 cm, it rises to about 0.6 s, and `BOSLUK_MS = 900` is still enough.
5. The finish strip puts all five sensors on the line at once. For the first 3 s this condition is not checked; this way an odd reading during the start does not stop the robot by mistake.

### Measurement report
The values I got in the simulation with `HIZ = 170` (approximately):

| Measurement | Value |
|---|---|
| Calibration | 1.8 s |
| Lap time (not counting calibration) | ≈ 13.3 s |
| Total time not seeing the line | ≈ 2.7 s |
| Longest single gap (the gap in the line) | ≈ 0.37 s |

When I changed only the `HIZ` value on the same track, I saw this in the simulation:

| `HIZ` | Lap time | Time not seeing the line | Result |
|---|---|---|---|
| 140 | ≈ 17.6 s | ≈ 3.8 s | finished |
| 170 | ≈ 13.3 s | ≈ 2.7 s | finished |
| 200 | ≈ 10.8 s | ≈ 2.2 s | finished |
| 230 | ≈ 8.6 s | ≈ 1.3 s | finished |
| 255 | - | - | could not find the line at the sharp bend, printed `CIZGI KAYBOLDU` (line lost) and stopped |

On this track, as the speed increased, both the time and the loss went down, but at the highest speed the robot could not finish the track. The rule "faster is better" has a limit; try to find the limit yourself.

### Try it
- Try a value between 240 and 250 for `HIZ`. Which is the highest speed that can finish the track?
- Place the robot 15 cm away from the line and start it. Does it print `KALIBRASYON HATASI`? Does the robot move?
- A feature of your own to add: in the `HATA` or `BITTI` state, light the LED on D13 (blinking if successful, steady if there is an error).

### Common mistakes
- Not starting the calibration while the robot is on the line: min/max come out wrong.
- Leaving the finish condition active at the moment of starting: the first reading could stop the robot straight away. That is why `BITIS_BEKLE_MS` exists.
- Increasing the speed and leaving `BOSLUK_MS` unchanged: the robot travels further in the gap.
- Not limiting `ARAMA`: when the line ends, the robot turns forever. Stopping when the time runs out is for safety.
- Writing the thresholds by hand: when the light changes, the project stops working (lesson 87).

### What may be different on a real robot
In the simulation the sensors have no noise and the wheels do not slip. On a real robot the readings flicker (hysteresis around the threshold, lesson 88, helps), the robot slows down as the battery voltage drops, and more information may be needed to tell the finish strip from a junction. The values in this project (`BOSLUK_MS`, `HIZ`) must be set again on your robot.

## Discuss
Is it more important for the robot to "lose the line less" or to "finish faster"? In which situations would you choose which? How would you defend this with numbers (lap time, lost time)?

# Junctions, sharp bends and losing the line
duration: 25

## Wonder
On a toy train track everything is easy: the rails always go forward. On a real track, however, there are right-angle corners, lines that cross each other, and even gaps where the tape has worn away. Your bang-bang program worked on straight and curved lines. But what will the robot do if a "T" suddenly appears in front of it, if the line suddenly ends, or if a right-angle corner comes up?

## Activity
### The patterns the five sensors see
As in lesson 88, we read the five sensors and make a pattern (`A0 … A4`, `1` = line). Three difficult cases have their own patterns:

| Case | What the sensors see | What the robot will do |
|---|---|---|
| Sharp left bend (L) | `11100`: the left side and the middle on the line | turn left |
| Sharp right bend (L) | `00111` | turn right |
| T or + junction | `11111`: all on the line | a decision given in advance: left, right or straight |
| Gap or lost line | `00000`: none on the line | depending on the case, go straight or search for the line |

A gap and overshooting a bend look alike: in both, the line disappears for a moment. To tell them apart, the **last known direction** is used:

- If the line disappeared while it was last **in the middle**, the robot was going straight: most probably a **gap**. Go straight; if the gap is narrow, you will find the line again.
- If the line was last seen on **an edge sensor**, the robot was turning: it has **overshot** the line. Turn towards the direction it was last seen in and search for the line.
- If the gap is very long, or the line is never found, the robot should not spin out of control; **stop** and report the situation.

### Circuit
Standard connections, as in lesson 88:

| Part | Connection |
|---|---|
| Line sensors 0…4 | AO → **A0…A4** (A0 far left) |
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |

Use external power and a common GND for the motors; do not connect the battery the wrong way round and do not short its leads.

### Program 1: gaps and losing the line
With the state machine from lesson 28 we write three states: `IZLE` (follow, normal bang-bang), `BOSLUK` (gap, cross it by going straight), `ARAMA` (search, turn on the spot towards the last direction), plus a safe `DUR` (stop). When the state changes, its name is printed on the serial port.

```cpp
// sketch: kayip_toparla
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;
const int HIZ = 150;
const unsigned long BOSLUK_MS = 900;    // en cok bu kadar duz git
const unsigned long ARAMA_MS = 2500;    // en cok bu kadar ara

enum Durum { IZLE, BOSLUK, ARAMA, DUR };
const char* DURUM_ADI[] = { "IZLE", "BOSLUK", "ARAMA", "DUR" };

Durum durum = IZLE;
int sonYon = 0;                         // -1 sol, 0 orta, +1 sag
unsigned long durumBasla = 0;

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
  Serial.println(DURUM_ADI[yeni]);
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hicbiri = !(sol || sag || orta);
  unsigned long gecen = millis() - durumBasla;

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

    case BOSLUK:                         // duz git, cizgi gelirse IZLE
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }
      motor(HIZ, HIZ);
      break;

    case ARAMA:                          // son gorulen yone yerinde don
      if (!hicbiri) { gec(IZLE); break; }
      if (gecen > ARAMA_MS) { motor(0, 0); gec(DUR); break; }
      if (sonYon <= 0) motor(-HIZ, HIZ);
      else motor(HIZ, -HIZ);
      break;

    case DUR:
      motor(0, 0);
      break;
  }
}
```

### Program 2: the junction decision
Now we add a fourth state: if all the sensors are on the line, `11111`, there is a junction. The decision is in the `KAVSAK_KARARI` (junction decision) constant: −1 left, 0 straight, +1 right. Three stages:

1. `KAVSAK_ILERI` (junction forward): at the moment of detection, the sensor array is over the line, but the wheel axle is 7 cm behind it. If you turn straight away, you turn from the wrong place. First go forward for 350 ms so the axle comes level with the junction.
2. `KAVSAK_DON` (junction turn): turn on the spot in the chosen direction. First the middle sensor leaves the line (`merkezGitti`, centre gone), then the turn ends when it finds the new line.
3. If you decided on straight, `KAVSAK_DUZ` (junction straight): go straight for 300 ms and cross the junction.

Turning left at a T junction is the "always left" tactic of the maze rule; for right, write `+1`. At a `+` junction you set the decision to `0` and go straight across.

```cpp
// sketch: kavsak_karari
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;
const int HIZ = 150;
const int KAVSAK_KARARI = -1;                  // -1 sola, 0 duz, +1 saga
const unsigned long BOSLUK_MS = 900;
const unsigned long ARAMA_MS = 2500;
const unsigned long KAVSAK_ILERI_MS = 350;
const unsigned long KAVSAK_DUZ_MS = 300;

enum Durum { IZLE, BOSLUK, ARAMA, DUR, KAVSAK_ILERI, KAVSAK_DON, KAVSAK_DUZ };
const char* DURUM_ADI[] = { "IZLE", "BOSLUK", "ARAMA", "DUR",
                            "KAVSAK_ILERI", "KAVSAK_DON", "KAVSAK_DUZ" };

Durum durum = IZLE;
int sonYon = 0;
bool merkezGitti = false;
unsigned long durumBasla = 0;

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
  merkezGitti = false;
  Serial.println(DURUM_ADI[yeni]);
}

void yerindeDon(int yon) {
  if (yon < 0) motor(-HIZ, HIZ);
  else motor(HIZ, -HIZ);
}

void setup() {
  for (int p = 5; p <= 10; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  bool s[SENSOR_SAYISI];
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;
  }
  bool sol = s[0] || s[1];
  bool sag = s[3] || s[4];
  bool orta = s[2];
  bool hepsi = s[0] && s[1] && s[2] && s[3] && s[4];
  bool hicbiri = !(sol || sag || orta);
  unsigned long gecen = millis() - durumBasla;

  switch (durum) {
    case IZLE:
      if (hepsi) { gec(KAVSAK_ILERI); break; }
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
      if (gecen > ARAMA_MS) { motor(0, 0); gec(DUR); break; }
      yerindeDon(sonYon <= 0 ? -1 : 1);
      break;

    case DUR:
      motor(0, 0);
      break;

    case KAVSAK_ILERI:
      motor(HIZ, HIZ);
      if (gecen >= KAVSAK_ILERI_MS) {
        gec(KAVSAK_KARARI == 0 ? KAVSAK_DUZ : KAVSAK_DON);
      }
      break;

    case KAVSAK_DON:
      yerindeDon(KAVSAK_KARARI);
      if (!orta) merkezGitti = true;          // eski cizgiyi biraktik
      if (merkezGitti && orta) {              // yeni cizgiyi bulduk
        sonYon = 0;
        gec(IZLE);
      }
      break;

    case KAVSAK_DUZ:
      motor(HIZ, HIZ);
      if (gecen >= KAVSAK_DUZ_MS) gec(IZLE);
      break;
  }
}
```

### How does it work?
1. The `IZLE` state is the bang-bang logic from lesson 88; the difference is that it uses `sonYon` to decide what happens when no sensor sees the line.
2. In a gap (`BOSLUK`) the robot goes straight. In the simulation, while crossing a gap of about 10 cm it cannot see the line for about 0.4 s; `BOSLUK_MS = 900` is enough for this. If the time runs out, the line really is lost and it moves to `ARAMA`. If you set `BOSLUK_MS = 300`, the robot moves to `ARAMA` too early in the same gap; it still finds the line, but the time it cannot see the line rises from about 0.4 s to about 0.7 s.
3. On a sharp bend the robot may overshoot the corner slightly; the line was last seen on an edge sensor, so `ARAMA` turns on the spot that way, and when it finds the line it goes back to `IZLE`. In the simulation, on a sharp left L bend, you see `ARAMA` printed on the serial port.
4. If the line is never found, the robot stops at the end of `ARAMA_MS` and `DUR` is printed. Stopping is always safer than spinning out of control.
5. When the decision at a T junction is left, the sequence `KAVSAK_ILERI → KAVSAK_DON → IZLE` is printed and the robot goes to the left end of the bar. If the decision is `+1`, it goes to the right end; if it is `0` and there is a line crossing the bar, it carries straight on.

### Try it
- Set `KAVSAK_KARARI` to +1 and try the same T. Which end does the robot go to?
- Set `BOSLUK_MS` to 300. What happens at the 10 cm gap?
- Make the gap 25 cm. When `BOSLUK_MS` is not enough, what does the robot do? Does it print `DUR` in the end?

### Common mistakes
- Always turning the same way as soon as the line disappears: in a gap the robot spins round on itself.
- Turning straight away at a junction, leaving the axle behind: with `KAVSAK_ILERI_MS = 0`, instead of going to the left end of the T, the robot turns back onto the stem it came from, because while turning on the spot the array finds the stem, not the bar.
- Leaving the search time unlimited: if the line really is not there, the robot turns forever.
- Not thinking about the gap length in relation to speed: the distance covered in `BOSLUK_MS` depends on the speed. If you increase the speed, you travel further in the same time.

### What may be different on a real robot
In the simulation the sensors are 7 cm in front, the turn is exactly on the spot and the timing is perfect. On a real robot the wheels slip, the distance covered in 350 ms of going forward changes with the battery voltage, and the edge sensors may see a false junction in a single reading. Before making a junction decision, checking that the pattern is consistent over several readings in a row is a good precaution.

## Discuss
Is "stop" really the safest answer? What happens if a warehouse robot loses the line and stops in the middle of the aisle? How do you think the robot should "ask for help" in this situation?

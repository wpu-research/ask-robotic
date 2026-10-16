# Exhibition and presentation
duration: 40

## Wonder
It is exhibition day. Someone looks at your robot and asks: "So how good is it?" If your answer is "it works really well", the conversation ends there. If your answer is "it met the 20 ± 3 cm criterion, between the 18.3 and 22.0 cm I measured; in one test I failed for this reason and fixed it like this", the conversation is only just beginning. In this lesson you will learn to describe your robot's success, its failure and your effort in a form that someone else can read and trust.

## Activity
### The three documents of the presentation
1. **Results table:** for each criterion, the measured value and whether it passed or failed.
2. **Bug report:** the symptom, root cause, fix and verification of a problem you ran into.
3. **Daily report:** what you did each day, what you measured, what you chose and why.

All three are plain text: a table, a few lines and numbers. You do not need fancy slides; you need numbers you can trust.

### Reporting culture: from the HYVEX notes
In the HYVEX team's internship course programme, the way this work is done is summed up like this:
- **Single source of truth (Day 2):** the repository (repo) is the source of truth; everything is kept as plain text in git. The daily report culture in the `raporlar/` (reports) folder is part of this. The lesson's question: where should a piece of information live: in your head, in a chat history, or in the repo?
- **Root cause analysis (Day 4):** the case is a situation in which ping worked but the telemetry and video stream dropped; the problem was found to be NetworkManager deleting the IP. The approach: **reduce the symptom to its root cause**, checking layer by layer (physical, IP, port, application). The phrase "it sometimes fixes itself" is the sign of an unstable layer. The lesson's question: before you say "I fixed it", how do you make sure?
- **Knowledge management (Day 15):** meaningful commits, daily reports (together with the root cause) and the principle "someone reading it 6 months later should understand".

In this lesson we will do this on a small scale. Apply the templates below to your own project.

### 1) Results table
Four columns for each criterion: what was asked for (lesson 111), how it was measured, what was measured, the result. Below is an example filled in with the values we measured in the simulator in lesson 113.

| Path | Criterion (lesson 111) | How it was measured | Measured | Result |
|---|---|---|---|---|
| A | Finish without colliding and stop at the finish line | At least 8 cm between the robot's centre and the nearest wall; after stopping it did not move for 1 s | No collision, nearest wall 18.1 cm; 11.2 s; stopped on the line | PASSED |
| B | Tip position error < 5 mm at three points | Tip position calculated from the servo pulses on the pins | Largest error 0.09 mm (commanded position; mechanical error not measured) | PASSED (limited scope) |
| C | Follow the target at a distance of 20 ± 3 cm | The sensor-to-target distance known to the simulator, while the target moves away at 3 cm/s | Smallest 18.3 cm, largest 22.0 cm | PASSED |

If you enter the three numbers into the sketch from lesson 111, it prints `yol A: GECTI`, `yol B: GECTI`, `yol C: GECTI` (path A/B/C: passed) (`A 0 1`, `B 0.16`, `C 18.3 22.0`).

**Three things that keep this table honest:**
- The "how it was measured" column. Without a measurement method, a number is not proof.
- The "limited scope" note. The 0.09 mm in path B is not the result of a real arm; it is the maths and the servo pulse. Gear backlash, bending under load and the servo's dead band were not measured.
- Stating that the result is from the simulator. A real robot gives other numbers; fill in your own robot's table with your own measurements.

### Program: a scoreboard that measures itself
At the exhibition, let the robot itself tell you the result. While a line-following robot is running, this sketch measures three things and, when it finishes, prints a single line:
- **Lap time:** from the start of the run to the end of the line.
- **Number of collisions:** how many times the bumpers (D2, D3, `INPUT_PULLUP`, pressed = LOW) were pressed. The vibrations of the same collision count as one (presses closer together than 500 ms count as a single collision).
- **Average error:** at every measurement in which the line is seen, the absolute value of how many millimetres it is from the centre of the line; the average of all of them.

The run ends in two ways: if the line is not seen for 400 ms, `BITTI` (finished); if 15 s pass, `ZAMAN_ASIMI` (time-out).

Circuit: from the path A table in lesson 111, the drive and the line sensors (D5-D10, A0-A4) and the bumpers (D2, D3). This sketch does not use the distance sensor or the encoder.

```cpp
// sketch: skor_tablosu
// Çizgi izleyen robot kendi performansını ölçer: tur süresi, çarpma sayısı, ortalama çizgi hatası.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TAMPON_SOL = 2, TAMPON_SAG = 3;       // INPUT_PULLUP: basılı = LOW
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;
const int TABAN = 150;
const float KP = 55.0;
const float SENSOR_ARALIK_MM = 20.0;            // iki sensör arası
const unsigned long BASLAMA_MS = 500;           // sayım sonrası kalkış
const unsigned long KAYIP_MS = 400;             // çizgisiz geçen bu süre = pist bitti
const unsigned long ZAMAN_ASIMI_MS = 15000;
const unsigned long CARPMA_ARALIK_MS = 500;     // bundan sık basışlar tek çarpma sayılır

enum Durum { BEKLE, KOS, BITTI };
Durum durum = BEKLE;

unsigned long kosuBasla = 0;
unsigned long sonCizgi = 0;
unsigned long sonCarpma = 0;
int carpma = 0;
bool tamponOnce = false;

float hataToplamMm = 0;                         // |hata| toplamı
unsigned long olcumSayisi = 0;

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void skorYaz(const char *sonuc, unsigned long bitisMs) {
  Serial.print("SKOR sonuc=");
  Serial.print(sonuc);
  Serial.print(" sure_s=");
  Serial.print((bitisMs - kosuBasla) / 1000.0, 2);
  Serial.print(" carpma=");
  Serial.print(carpma);
  Serial.print(" ort_hata_mm=");
  Serial.println(olcumSayisi ? hataToplamMm / olcumSayisi : 0.0, 1);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  // Çarpma sayacı: tampon basılınca bir kez say
  bool tampon = digitalRead(TAMPON_SOL) == LOW || digitalRead(TAMPON_SAG) == LOW;
  if (tampon && !tamponOnce && durum == KOS && simdi - sonCarpma > CARPMA_ARALIK_MS) {
    carpma++;
    sonCarpma = simdi;
  }
  tamponOnce = tampon;

  int sayi;
  float konum = cizgiKonum(sayi);

  switch (durum) {
    case BEKLE:
      if (simdi >= BASLAMA_MS) {
        kosuBasla = simdi;
        sonCizgi = simdi;
        durum = KOS;
      }
      break;

    case KOS:
      if (sayi > 0) {
        sonCizgi = simdi;
        hataToplamMm += fabs(konum) * SENSOR_ARALIK_MM;   // çizgi merkezden kaç mm kaçık
        olcumSayisi++;
        int fark = (int)(KP * konum);
        surus(TABAN - fark, TABAN + fark);
      }
      if (simdi - sonCizgi > KAYIP_MS) {                   // pist bitti
        surus(0, 0);
        skorYaz("BITTI", sonCizgi);
        durum = BITTI;
      } else if (simdi - kosuBasla > ZAMAN_ASIMI_MS) {
        surus(0, 0);
        skorYaz("ZAMAN_ASIMI", simdi);
        durum = BITTI;
      }
      break;

    case BITTI:
      surus(0, 0);
      break;
  }
}
```

### How does it work?
1. The `BEKLE` (wait) state switches to `KOS` (run) after 500 ms, and `kosuBasla` (run start) is recorded. The lap time is the difference between `kosuBasla` and **the moment the line was last seen**; it does not include the 400 ms we wait to tell that the line has ended.
2. The collision counter counts the **moment the bumper is pressed** (not pressed in the previous round, pressed now) once. If the robot pushes against the wall and keeps the bumper pressed, or jiggles slightly, the collision is not counted again within 500 ms.
3. The average error is built up as `|konum| × 20 mm` (|position| × 20 mm) in every round in which the line is seen, and divided by the count. This is the same formula as the "mean absolute error" in lesson 114.
4. `skorYaz` (write score) prints a single line: `SKOR sonuc=BITTI sure_s=6.68 carpma=0 ort_hata_mm=2.4` (score, result, time, collisions, average error). The line is in key=value format; a program like the one in lesson 114 can read it easily.
5. If it cannot finish in 15 s, it prints `ZAMAN_ASIMI`. A robot saying "it never finished" is better than it silently getting stuck.

**What we checked in the simulator:**
- Clean track (a 1.6 m line with a small bend): `SKOR sonuc=BITTI sure_s=6.68 carpma=0 ort_hata_mm=2.4`. We compared the time with the real time known to the simulator: 6.68 s, the same.
- When we put a wall at the end of the track (the line runs into the wall): the robot pushed against the wall, the bumper was pressed and the line came out as `sonuc=ZAMAN_ASIMI sure_s=15.00 carpma=1`. One wall, one collision.
- **A warning about the average error:** the real average deviation known to the simulator is 8.7 mm, while the sketch printed 2.4 mm. The difference comes from the sensors: the sensors are 20 mm apart and the line is 20 mm thick; when a sensor "sees" the line, the line can be within ±10 mm of it, but the sketch counts the error as 0. So the scoreboard is honest **only to the resolution of the device it measures with**. Report this number not as "the robot's real deviation from the line" but as "the deviation seen by the sensor array". A more precise measurement needs denser or analogue (greyscale) sensors.

### 2) Bug report: from symptom to root cause
A bug report is not an apology; it is a **chain of evidence**. Template:

```text
BUG REPORT
Title:             (one sentence, with a number)
Symptom:           what did we see? (measured, no interpretation)
Reproduction:      under which conditions, how many times in how many tries?
Layer review:      for each layer: what did we measure, what was the result, is it SOUND or not?
Root cause:        the first layer that produces the symptom, and why
Fix:               one change
Verification:      the same test + neighbouring tests
Lesson learnt:     how do we prevent it next time?
```

The example below is the kind of bug we **really ran into** while preparing path A in lesson 113. We reproduced and measured the details with the final version, by setting `YAN_MS` to 1500 ms.

```text
BUG REPORT
Title:       Path A course not finished: the robot got stuck at the end of the obstacle wall.
Symptom:     After printing "durum: SERBEST" (state: free), the robot stopped at x = 1.72 m, y = 1.22 m;
             "durum: BITTI" (state: done) was never printed. Distance from the robot centre to the
             nearest wall: 7.5 cm (the robot radius, so it is touching the wall).
Reproduction: same start, same result (in the simulator with a fixed seed; scenario T1).
             On the real robot it must be tried again and again: if it sometimes gets stuck
             and sometimes passes, the bug is on the edge.
Layer review:
  Decision (state machine): in the trace log the heading reached at most 1.55 rad (about 89°),
             then went back to -0.06 rad (about -4°). The turn left, move sideways, turn right
             pattern worked. SOUND.
  Turning:   in lesson 112, 420 ms = about 91°. SOUND.
  Moving sideways: the largest y in the trace log = 1.233 m. Wall end y = 1.15 m, robot radius
             0.075 m; passing needs y >= 1.225 m: a margin of only 8 mm. On top of that, the
             right turn did not point the robot exactly east (-4°, slightly south); y fell
             as the robot moved forward and was 1.219 m when it reached the wall end.
             6 mm SHORT. NOT SOUND.
Root cause:  The sideways time (YAN_MS = 1500 ms) does not take the robot far enough to clear
             the end of the wall by its radius; the margin is too narrow to absorb even the
             turning error. "Symptom": the robot got stuck. "Root cause": YAN_MS is too small.
             The obstacle sensor and the motors are not to blame.
Fix:         YAN_MS 1500 -> 2000 (one change).
Verification: T1 again: finished, nearest wall 18.1 cm. The neighbouring tests T2-T5 also passed
             (the lesson 113 matrix).
Lesson learnt: The margin was close to zero; this is an edge bug of the "it fixes itself sometimes"
             kind. In the new version the largest y = 1.348 m, so the margin is about 12 cm. Write
             the margin into the requirement (y >= 1.225 + allowance).
```

**Things to notice in this report:**
- The *symptom* and the *root cause* are separate. "The robot got stuck" is the symptom. If we had treated only the symptom (for example by making ENGEL_CM bigger), it might have got better by chance, and the bug would have come back on another course.
- In every layer we **measured**; we did not guess. The track log, the turn measurement from lesson 112, the wall geometry.
- We made a single change. If we had changed two things at once, we could not tell which one worked.
- We verified the fix with **neighbouring tests**; we showed that while fixing one bug we did not break another.

### 3) Daily report template
A short report every day, as in HYVEX's `raporlar/` culture. It should be detailed enough that, even six months later, someone (or you) can understand why that decision was made.

```text
DAILY REPORT     Day: __     Written by: __     Path: A / B / C

Today's goal:
  (one sentence, measurable)

What I did:
  - ...

Measurements (number + unit + how):
  - ...

Problem -> root cause -> fix:
  Symptom:
  Root cause:
  Fix:

Decision and reason:
  (what did I choose, and why did I rule out the other option?)

Tomorrow:
  - ...
```

The example below is a daily report for path A, written by a learner doing lesson 113 (the learner is made up for the example; the numbers are the measurements from lesson 113).

```text
DAILY REPORT     Day: 3     Path: A

Today's goal:
  Finish the path A course end to end with the state machine, without crashing.

What I did:
  - I combined the a_arac sketch with the state machine.
  - I ran the 5 scenarios of the test matrix.

Measurements:
  - T1: 11.2 s, nearest wall 18.1 cm, no crash (simulator).
  - T4 (right motor 4% weaker): nearest wall 10.0 cm; the margin is shrinking.

Problem -> root cause -> fix:
  Symptom: with YAN_MS = 1500 the robot got stuck at the wall end (1.72, 1.22).
  Root cause: the sideways distance is not enough, 6 mm short.
  Fix: YAN_MS = 2000.

Decision and reason:
  I increased the time and did not change the obstacle threshold (28 cm): the threshold
  affects detection, not the sideways move.

Tomorrow:
  - Measure DONUS_MS again on the real robot with a protractor.
```

If you use git, the commit message for the same fix is also a mini report: `yol-a: YAN_MS 1500 -> 2000, robot engel ucunda 6 mm eksik kaldigi icin takiliyordu` (path A: YAN_MS 1500 -> 2000, the robot was getting stuck because it was 6 mm short at the end of the obstacle). Messages like "fixed it" or "final version" tell you nothing six months later (HYVEX's "meaningful commit" principle).

### Checklist for exhibition day
- Your robot, your design document and your results table side by side.
- For each criterion, the measurement method and the number, passed/failed.
- One bug report: symptom, root cause, fix, verification.
- Your daily reports: the reasons for your decisions.
- A screen showing the serial output: `SKOR ...` or `yol A: GECTI`.
- The robot's spare battery and the external power supply (battery safety: do not short-circuit it or connect it the wrong way round).
- A "what if it doesn't work" plan: a recording or measurement table you can show if the robot misbehaves at the exhibition.

### The journey: from Arduino to robot
This project is the last link in the path that runs from Module 3 to 5.
- **Module 3, Arduino basics:** you started by lighting an LED. You learned digital and analogue inputs, PWM, driving motors and relays, non-blocking code with `millis()`, state machines, interrupts, I2C and EEPROM. You did your first final project with a thermostat.
- **Module 4, sensors:** you learned to measure the world. Distance with the HC-SR04, PIR, infrared and reed sensors, temperature and humidity, pressure, joystick, rotary encoder, tilt with the MPU6050, keypad and real-time clock. You saw that every measurement is noisy and is corrected with a filter.
- **Module 5, robotics:** you turned sensors and motors into a robot. Differential drive, obstacle avoidance, line following, encoders and odometry, PID, balancing with an IMU, behaviour-based control and the robot arm. This week you brought these together, tested them against criteria, reduced your bugs to their root causes and reported your results.

You learned not just to make something work, but to **prove it by measuring**. You now have a working robot, a design document that describes it, a measurement table and a bug report.

### Try it
- Fill in the results table for your own path. Write the "how it was measured" column for each row. Mark which measurement is weak.
- Set the `KP` value in the `skor_tablosu` sketch to 30 and 90. How do the time, the collisions and the average error change? Which value is best? Show it with a table.
- Find a bug in your own robot and write it up with the bug report template: symptom, layer check, root cause, single change, verification.
- Write three daily reports. Give them to a friend; can they understand your decision?

### Common mistakes
- Writing the result before measuring, or taking a failed test out of the table. A failed test is one of the most valuable rows in the report.
- Mistaking the symptom for the root cause: "the robot crashed" is a result, not a cause.
- Changing several things at once and saying "it's fixed". You cannot tell which one worked.
- Not taking a "it sometimes fixes itself" bug seriously. A test that sometimes passes and sometimes fails shows a problem at the limit.
- Presenting simulator measurements as if they were the results of a real robot.
- Mistaking the scoreboard's average error for the real error. The sensor's resolution limits the number.
- Putting off the report with "I'll write it tomorrow". The reason for what you did is forgotten within a few days.

## Discuss
If, six months from now, someone who does not know you stood next to this robot and read your reports, could they find the answer to the question "why this `YAN_MS` value?" If not, what is missing from your report?

# An obstacle-avoiding state machine
duration: 30

## Wonder
In lessons 81-83 you wrote three separate skills: a reflex with the bumpers, stopping by distance, and choosing a direction with the servo. If you tried to run them all in one program, you would end up with a pile of `if` and `delay`; while the robot waits for one thing, it cannot look at the others. How will you decide who gets a turn and when? Remember the answer from lesson 28: give the robot **a single state** at any moment and write the transitions between states out clearly.

## Activity
### Circuit
The circuit is the same as in lesson 83, and the bumpers are connected too.

| Part | Connection |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Servo carrying the sensor | Signal → **D4** |
| Bumpers | Left → **D2**, right → **D3** (both between the pin and GND, `INPUT_PULLUP`) |
| Left motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Right motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Power warning:** Use a separate battery for the servo and the motors, and also connect the battery's negative to the Arduino GND (common GND). Do not short the batteries and do not connect them the wrong way round.

### The states
The robot has five states:

| State | What is the robot doing? | Next state |
|---|---|---|
| ILERI (forward) | Drives straight, measures every 50 ms | If the median distance < 25 cm: **DUR**; if a bumper is pressed: **GERI** |
| DUR (stop) | Motors off, waits 250 ms (so the robot comes to a full stop) | **TARA** |
| TARA (scan) | The servo looks in 5 directions, waiting 300 ms in each and measuring | If the farthest direction is more than 35 cm: **DON**, otherwise **GERI** |
| DON (turn) | Turns on the spot, time = \|angle − 90\| × 5 ms | **ILERI** |
| GERI (back) | Goes backward for 400 ms | **DON** (turns 90°) |

The bumper is a backup for obstacles the sensor cannot see: in the ILERI state, the bumpers are checked first on every pass.

### Program
This program is built on the `millis()` logic from lesson 27: there is no `delay` in any state. Each state checks "has the time run out?" and, if it has, moves to a new state with `gec()` (go). You can also watch which state it is in on the Serial monitor.

```cpp
// sketch: kacis_fsm
#include <Servo.h>

// Robotun beş durumu (28. ders). Her biri bir sayıdır: ILERI=0, DUR=1, ...
enum Durum { ILERI, DUR, TARA, DON, GERI };

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}

const int SERVO_PIN = 4;
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;

const int ESIK_CM = 25;              // bundan yakında engel varsa dur
const int ACIK_CM = 35;              // taramada en iyi yön bundan yakınsa sıkışmışız
const int ACI_ADET = 5;
const int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol
const int MS_DERECE = 5;                 // yerinde dönüş: ~5 ms / derece
const unsigned long OLCUM_ARALIK = 50;   // ILERI'de ölçüm aralığı (ms)
const unsigned long DUR_MS = 250;        // durduktan sonra bekleme (robot tam dursun)
const unsigned long SERVO_BEKLE = 300;   // servo yeni açıya varsın
const unsigned long GERI_MS = 400;

const char* DURUM_ADI[] = {"ILERI", "DUR", "TARA", "DON", "GERI"};

Servo tarayici;
Durum durum = ILERI;
unsigned long durumBasi = 0;
unsigned long sonOlcum = 0;
unsigned long servoZaman = 0;
int taramaNo = 0;
int mesafeler[ACI_ADET];
unsigned long donSure = 0;
int donYon = 1;                      // +1 sola, -1 sağa

// 3 ölçümün ortancası (~20 ms sürer)
int medyan3() {
  int a = mesafeOlc(); delay(5);
  int b = mesafeOlc(); delay(5);
  int c = mesafeOlc();
  if (a > b) { int t = a; a = b; b = t; }
  if (b > c) { int t = b; b = c; c = t; }
  if (a > b) { int t = a; a = b; b = t; }
  return b;
}

// Durum değiştirir, giriş zamanını kaydeder ve seriye yazar
void gec(Durum yeni) {
  durum = yeni;
  durumBasi = millis();
  Serial.print("DURUM ");
  Serial.println(DURUM_ADI[yeni]);
}

void don(int yon, unsigned long ms) {   // yon: +1 sola, -1 sağa
  donYon = yon;
  donSure = ms;
  gec(DON);
}

void setup() {
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
  Serial.begin(9600);
  gec(ILERI);
}

void loop() {
  unsigned long simdi = millis();

  switch (durum) {
    case ILERI:                           // düz git, engel ara
      surus(HIZ, HIZ);
      if (digitalRead(TAMPON_SOL) == LOW) { donYon = -1; gec(GERI); break; }
      if (digitalRead(TAMPON_SAG) == LOW) { donYon = 1; gec(GERI); break; }
      if (simdi - sonOlcum >= OLCUM_ARALIK) {
        sonOlcum = simdi;
        if (medyan3() < ESIK_CM) gec(DUR);
      }
      break;

    case DUR:                             // dur, robot sakinleşsin
      surus(0, 0);
      if (simdi - durumBasi >= DUR_MS) {
        taramaNo = 0;
        tarayici.write(ACILAR[0]);
        servoZaman = simdi;
        gec(TARA);
      }
      break;

    case TARA:                            // servoyla 5 yöne bak
      surus(0, 0);
      if (simdi - servoZaman >= SERVO_BEKLE) {
        mesafeler[taramaNo] = medyan3();
        taramaNo++;
        if (taramaNo < ACI_ADET) {
          tarayici.write(ACILAR[taramaNo]);
          servoZaman = millis();
        } else {
          tarayici.write(90);
          int en = 0;
          for (int i = 1; i < ACI_ADET; i++) if (mesafeler[i] > mesafeler[en]) en = i;
          Serial.print("EN ACIK ");
          Serial.print(ACILAR[en]);
          Serial.print(" ");
          Serial.println(mesafeler[en]);
          if (mesafeler[en] < ACIK_CM) {
            donYon = 1;
            gec(GERI);
          } else {
            int fark = ACILAR[en] - 90;
            don(fark >= 0 ? 1 : -1, (unsigned long)abs(fark) * MS_DERECE);
          }
        }
      }
      break;

    case DON:                             // yerinde dön
      surus(-donYon * HIZ, donYon * HIZ);
      if (simdi - durumBasi >= donSure) gec(ILERI);
      break;

    case GERI:                            // geri çekil
      surus(-HIZ, -HIZ);
      if (simdi - durumBasi >= GERI_MS) don(donYon, 90UL * MS_DERECE);
      break;
  }
}
```

### How does it work?
1. `enum Durum { ILERI, DUR, TARA, DON, GERI }` gives the states names; `switch (durum)` runs the block that belongs to the current state (lesson 28). `durumBasi` (state start) holds the time you entered that state, and comparisons such as `simdi - durumBasi >= DUR_MS` make the transition when the time runs out.
2. `gec(yeni)` changes the state, updates `durumBasi` and prints `DURUM ...` on the serial port. We never reset the time by hand anywhere; there is no risk of forgetting it.
3. In the TARA state, `taramaNo` (scan number) holds which angle we are at. When the servo angle changes, `servoZaman` (servo time) is recorded; after 300 ms a measurement is taken and it moves on to the next angle. When the five angles are done, the farthest one is chosen from the `mesafeler` (distances) array and the `EN ACIK` (clearest) line is printed.
4. If even the best direction is closer than `ACIK_CM = 35` cm, the robot is stuck (a narrow pocket or a corner). Then, instead of trying to turn, it first goes to GERI and backs off a little, then turns 90°.
5. `medyan3()` contains three `pulseIn` calls and two `delay(5)` calls, and takes about 20 ms. This short block is acceptable; `loop()` still runs dozens of times a second.

**What we measured (simulation):**
- In an empty 2 × 2 m box, with 2 cm of measurement noise, the robot travelled about 2.8 m in 20 seconds, did 3 full ILERI-DUR-TARA-DON rounds and never touched the wall.
- The timings held with `millis()`: DUR about 250 ms, TARA about 1.6 seconds (5 directions × 300 ms of waiting, plus the measurements), a 60° DON about 300 ms. The measured turning angle matched the difference between the angle chosen in the scan and 90° to within 20°.
- A robot that started in a narrow pocket (30 cm wide, closed at the end) drove forward and stopped; in the second scan the farthest direction came out at 26 cm (closer than 35 cm), it moved to the `GERI` state and really did go backward. It never crashed.
- We left a thin 3 cm slit in the wall. The middle beam went through the slit and saw far away (the sensor could not see the obstacle), but both bumpers pressed against the wall and the robot backed off in the order ILERI → GERI → DON. The bumper backup did its job.

### Try it
- Set `ACIK_CM` to 60. Does the robot go to GERI more often? Why?
- The GERI that comes from TARA when stuck always turns left (`donYon = 1`). Change it so that it turns towards whichever of the 30° and 150° directions measured longer in the scan.
- Add `BEKLE` (wait) as a sixth state: stop when `b` arrives from the Serial monitor, and go back to ILERI when `g` arrives. Where did you need to add `if`s?

### Common mistakes
- Putting `delay` into the state blocks: while one state waits, the bumpers are never checked.
- Writing `durum = DUR;` and forgetting to update `durumBasi`. Always use `gec()`.
- Writing the `enum` definition after the functions that use it as a parameter: Arduino gives the error "`Durum` was not declared". Put the definition at the top of the file.
- Giving states names that clash with Arduino's own names. For example, `ADLAR` is the name of a register bit of the AVR processor in the Arduino; if you define an array with this name, the compiler gives an unexpected error. That is why we called the array `DURUM_ADI`.
- Forgetting the exit from a state while writing the transitions: the robot stays in that state forever. For every state, answer the question "where does it go next?".
- Forgetting to say `surus(0, 0)` during the scan: the robot measures while turning.

### What may be different on a real robot
- Measure the timings (`DUR_MS`, `SERVO_BEKLE`, `MS_DERECE`) on your own robot; the turning time changes with the battery, the floor and differences between the motors. Turning by time is less accurate than turning by counting wheel ticks (encoder, week 4).
- A state machine makes debugging much easier: the `DURUM ...` output tells you what the robot is doing and why. On a real robot without the serial cable attached, you can also show this with an LED or a short series of beeps.
- In a real environment, something may come close to the robot during the scan. You may want to add the rule "check the bumpers during TARA too" to the state machine.

## Discuss
Think about writing this program with `delay` and without a state machine. What would happen when a bumper is pressed? What do you think the state machine makes easiest for you?

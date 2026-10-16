# Project: An autonomous obstacle-avoiding robot
duration: 35

## Wonder
A small robot moving around a warehouse travels along the aisles without asking anyone, turns at the ends of the shelves, and changes direction when it is about to hit something. This week you built a robot that does exactly this job with three sensors and five states. Now you will put it all together and let the robot loose in an arena with obstacles in it, and we will ask: does this robot really work? When you say "it works", what will you measure, and with which number?

## Activity
### What are we going to do?
This project brings together what you have learnt:
- **Week 2, lesson 81:** the bumpers (D2, D3) as backup protection.
- **Week 2, lesson 82:** the HC-SR04 (D11, D12) and the median filter.
- **Week 2, lesson 83:** scanning from 30° to 150° with the servo (D4) and choosing the farthest direction.
- **Week 2, lesson 84:** a state machine based on `millis()` (ILERI, DUR, TARA, DON, GERI).
- **Week 1:** the `surus(sol, sag)` function and the motor driver (lesson 77), speed above the dead zone (lesson 78), stopping and starting remotely with serial commands (lesson 79).

We add three things to the program from lesson 84:
1. **Serial commands:** `x` stops the robot and `g` starts it again.
2. **A stuck check:** in the ILERI state, if the distance has not changed by 6 cm for 1.5 seconds (which means the robot is not moving forward), the robot backs off. This is extra protection against getting caught on an obstacle the sensor cannot see.
3. **A report:** every 5 seconds it prints the number of bumper hits.

### Circuit
| Part | Connection |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Servo carrying the sensor | Signal → **D4** |
| Bumpers | Left → **D2**, right → **D3** (between the pin and GND, `INPUT_PULLUP`) |
| Left motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Right motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Power warning:** Use a separate battery for the servo and the motors, and also connect the battery's negative to the Arduino GND (common GND). Do not power the servo and the motors from the Arduino's 5 V pin. Do not short the batteries and do not connect them the wrong way round.

### Program
```cpp
// sketch: otonom_kacis
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
const unsigned long TAKILMA_MS = 1500;   // bu sürede mesafe 6 cm değişmediyse sıkıştık
const unsigned long RAPOR_MS = 5000;

const char* DURUM_ADI[] = {"ILERI", "DUR", "TARA", "DON", "GERI"};

Servo tarayici;
Durum durum = ILERI;
unsigned long durumBasi = 0;
unsigned long sonOlcum = 0;
unsigned long servoZaman = 0;
int taramaNo = 0;
int mesafeler[ACI_ADET];
unsigned long donSure = 0;
unsigned long ilerlemeZaman = 0;
unsigned long sonRapor = 0;
int ilerlemeCm = -100;
int carpmaSayisi = 0;
bool calisiyor = true;
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
  if (yeni == ILERI) {
    ilerlemeZaman = durumBasi;
    ilerlemeCm = -100;
  }
  Serial.print("DURUM ");
  Serial.println(DURUM_ADI[yeni]);
}

void tamponTepki(int yon) {
  carpmaSayisi++;
  Serial.println(yon > 0 ? "TAMPON SAG" : "TAMPON SOL");
  donYon = yon;
  gec(GERI);
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

void komutOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'x') { calisiyor = false; Serial.println("KOMUT DUR"); }
    if (c == 'g') { calisiyor = true; Serial.println("KOMUT GIT"); gec(ILERI); }
  }
}

void loop() {
  unsigned long simdi = millis();

  komutOku();
  if (!calisiyor) {
    surus(0, 0);
    return;
  }

  if (simdi - sonRapor >= RAPOR_MS) {
    sonRapor = simdi;
    Serial.print("RAPOR carpma=");
    Serial.println(carpmaSayisi);
  }

  switch (durum) {
    case ILERI:                           // düz git, engel ara
      surus(HIZ, HIZ);
      if (digitalRead(TAMPON_SOL) == LOW) { tamponTepki(-1); break; }
      if (digitalRead(TAMPON_SAG) == LOW) { tamponTepki(1); break; }
      if (simdi - sonOlcum >= OLCUM_ARALIK) {
        sonOlcum = simdi;
        int cm = medyan3();
        if (cm < ESIK_CM) { gec(DUR); break; }
        if (abs(cm - ilerlemeCm) >= 6) {          // ilerliyoruz: mesafe değişti
          ilerlemeCm = cm;
          ilerlemeZaman = simdi;
        } else if (simdi - ilerlemeZaman >= TAKILMA_MS) {
          Serial.println("SIKISTI");
          donYon = 1;
          gec(GERI);
        }
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
1. The state machine is the same as in lesson 84. The difference: at the very start, `loop()` checks the serial port with `komutOku()` (read command). If `calisiyor` (running) is false, the motors stop and `loop()` returns; the states stay as they are. When `g` arrives, a clean start is made with `gec(ILERI)`.
2. `tamponTepki()` (bumper reaction) counts the bumper event (`carpmaSayisi`, number of hits), prints the message and moves to the GERI state. If the left bumper was pressed, the turning direction is right (lesson 81).
3. **The stuck check:** in the ILERI state, the moment the latest measurement changes by more than 6 cm, `ilerlemeCm` and `ilerlemeZaman` (progress distance and time) are updated. When the robot goes at 0.2 m/s, 6 cm changes in about 0.3 seconds. If it has not changed for 1.5 seconds (`TAKILMA_MS`), the robot has got caught somewhere: `SIKISTI` (stuck) is printed and it moves to the GERI state. We chose a threshold of 6 cm; after the median filter, 2 cm of measurement noise usually does not cause this much wobble.
4. The `RAPOR` (report) line prints the number of bumper hits every 5 seconds. It is handy for seeing what happens often while you test the robot.

### Measure it: does the robot work?
The test arena is 2 × 2 m. There are three obstacles in it: a 40 × 40 cm block in the middle (four walls), a 60 cm vertical piece of wall on the right side and a 60 cm horizontal piece of wall at the top. The measurement noise is 2 cm. In each run we place the robot at a starting point, run it for 30-35 seconds and look at two things (in the check we also send `x` at the 25th second to confirm that the robot stops, and that it carries on with `g`):

- **Distance:** the total distance the robot travelled (`r.state.distanceM`).
- **Number of collisions:** `r.state.collided` is true for as long as the robot is trying to push into a wall. Because it stays true for a while, counting milliseconds would be wrong; we count **the moment it becomes true** (edge detection, lesson 8). This way one contact is one collision.

**Results:**
- In the run that started at the bottom left facing east (35 s), the robot travelled 4.2 m and never collided. The bumper stepped in once, and it scanned 7 times.
- In the run that started at the top right facing west (30 s), it travelled 4.2 m, there was 1 collision and the stuck check stepped in once.
- We tried six different starting points and two different noise seeds (12 runs, 35 s): the robot travelled 4.0-4.7 m and the number of collisions stayed between 0 and 3.

**Why these thresholds?** We set the success criterion like this: in 30-35 seconds, **at least 3 metres travelled** and **at most 3 collisions**.
- The robot goes at 0.2 m/s. If it never stopped, it would cover 7 m in 35 seconds. But at each obstacle the stop, scan, turn round takes about 2.2 seconds (DUR 0.25 + TARA 1.6 + DON 0.3). During this time the robot does not move forward; so 4-5 metres is a very good result for this robot.
- We set the threshold at 3 m, about 1 m below the lowest value we measured (4.0 m): we want the robot to still pass with a different start and different noise. A threshold close to 7 m would ignore the time the robot spends avoiding obstacles. A 1 m threshold, on the other hand, would pass even if the robot was standing still most of the time; it would measure nothing.
- Requiring "no collisions at all" is not realistic. Our sensor is a single beam; the beam can pass beside the end of a wall while the body touches that end, and while scraping along a wall at a shallow angle the beam may always see far away. The bumper also only protects the front of the robot. Still, we want to keep the number of collisions close to zero: that is why the upper limit is small (3).

Before you change the threshold to a number that suits you, ask: does this number show that the robot is really good, or does it only fit our arena?

### Try it
- Set `ESIK_CM` to 15 and to 40. How do the distance and the number of collisions change? Which value is a good balance?
- Set `HIZ` to 220. Does the robot travel further, but does the number of collisions grow? Why?
- Add `h` to the serial commands: when `h` arrives, `HIZ` should drop to half (slow mode), and `g` should go back to normal speed. `HIZ` is currently fixed (`const`); you will need to turn it into a variable that can change.
- Add the total time passed to the `RAPOR` line too.

### Common mistakes
- Doing the stuck check with `delay`: while the robot waits, it cannot look at anything.
- Counting a collision for as long as `collided` is true: one contact looks like hundreds of collisions.
- Not using a median against measurement noise: the robot is scared of fake obstacles and scans for no reason.
- Not resetting the state machine when stopping with the `x` command and starting with `g`: the robot carries on from the middle of an unfinished turn.
- Keeping the threshold higher than the measurement "so the robot passes" and then being surprised that "it does not pass". Measure first, then set the threshold.

### What may be different on a real robot
- **Ultrasonic beam angle:** the real HC-SR04 does not send a narrow beam; it spreads out like a cone (check the datasheet). Narrow things such as the end of a wall or a chair leg are sometimes not seen; sometimes a side wall or the floor causes a wrong measurement. In the simulation the sensor is a single beam.
- **Reflection:** sound arriving at a wall at a slant may not return to the sensor. The robot thinks the wall is farther away, or not there at all. Approaching at a shallow angle is the most dangerous case.
- **Soft surfaces:** surfaces such as curtains, fabric, sofas and rugs absorb sound. The echo becomes weak or does not come back at all. On these surfaces the bumpers and the stuck check become very important as backups.
- **Bumper:** real switches bounce (lesson 8). On soft obstacles the bumper may not be pressed.
- **Timing:** the turns are done by time. As the battery runs down, the motors slow down and a 90° turn can drop to 70°. Measuring turns with an encoder (week 4) solves this.
- **Safety:** run a real robot first lifted up, testing with the wheels in the air. The robot should not move before a command arrives; think of the `x` command as an "emergency stop".

## Discuss
A friend says their robot is "very good", but gives no numbers at all. Which two measurements would you ask them for, and what would you understand from the answers? If the number of collisions is small but the distance is small too, what might have happened to the robot?

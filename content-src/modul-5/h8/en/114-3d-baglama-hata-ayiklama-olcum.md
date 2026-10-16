# Connecting to a 3D robot, debugging, measuring
duration: 40

## Wonder
Your robot works, but only you know it. What would you do if you wanted someone else to see your robot on their screen, as a 3D robot, a graph or a log file? You bring a **data stream with a contract** out of the robot: the format, the fields and the value ranges of every line are fixed from the start. In this lesson you will build that stream and check it; then you will measure the robot's error with the same records.

## Activity
### An honest note: there is no 3D yet
Right now we do **not** have a view that shows the robot in 3 dimensions. In this lesson we are not running anything that connects to 3D. What we are doing is setting up the interface that a 3D robot will be fed from in the future: the robot writes its state over the serial line in a fixed format. Later, a 3D robot will be fed from this interface; today's job is to leave the format solid and tested. At the end of the lesson you will have: (1) a robot that knows its own position, (2) a data stream whose format has been checked, (3) a method for getting the average and largest error out of that stream.

### The data contract: JSON lines
Every 100 ms the robot writes **a single line**. The line is a JSON object (JSON-lines: one object per line). The contract:

| Field | Meaning | Type | Valid value |
|---|---|---|---|
| `t` | Timestamp, `millis()` | integer, ms | 0 or greater |
| `x` | Position, forwards (odometry) | number, metres | between -10 and 10 |
| `y` | Position, sideways (odometry) | number, metres | between -10 and 10 |
| `th` | Heading | number, radians | greater than -π, equal to or less than π |
| `d` | Distance in front | number, cm; `null` if there is no measurement | between 2 and 400, or `null` |

The order and names of the fields are fixed: `t`, `x`, `y`, `th`, `d`. An example line (simulator output):

```text
{"t":100,"x":0.010,"y":0.000,"th":0.000,"d":242.8}
```

The key idea: you agree on the format once, and both the robot and the receiver trust that format. Whether the receiver is a 3D view, a graph or a log file.

### Circuit
Standard Module 5 connections; the encoders are used for odometry.

| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Left encoder | **D2** (interrupt pin) |
| Right encoder | **D3** (interrupt pin) |
| HC-SR04 | TRIG **D11**, ECHO **D12** |

Because the encoders use D2 and D3, do not connect bumpers in this lesson. Motor power comes from an external supply, and the GND is shared. The serial line is 115200 baud; set the Serial Monitor to 115200 too.

### Program
This sketch drives the robot along a set path (2 s forwards, 0.6 s turning left, 2 s forwards, stop) and writes a position line every 100 ms. It works out the position from the encoders (odometry, lesson 94).

```cpp
// sketch: telemetri
// Robot kendi konumunu (odometri) ve önündeki mesafeyi her 100 ms'de bir JSON satırı olarak seri porttan yazar.
// Satır biçimi: {"t":ms,"x":metre,"y":metre,"th":radyan,"d":cm}
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;
const int TRIG = 11, ECHO = 12;

const int OLU_BOLGE = 51;
const int TABAN = 150;
const float TEKERLEK_CEVRE_M = 0.2073;          // 2 * pi * 0,033 m
const int YUVA = 20;
const float TIK_M = TEKERLEK_CEVRE_M / YUVA;    // bir tık = yaklaşık 1,04 cm
const float AKS_M = 0.12;                       // tekerlekler arası
const unsigned long RAPOR_MS = 100;

volatile long tikSol = 0, tikSag = 0;           // işaretli: geri dönüşte azalır
volatile int solYon = 1, sagYon = 1;            // komut verilen yön (+1 ileri, -1 geri)
long oncekiSol = 0, oncekiSag = 0;
float x = 0, y = 0, th = 0;                     // odometri: metre, metre, radyan
unsigned long sonRapor = 0;

// Tek kanallı enkoder yönü bilmez: yönü, motora verdiğimiz komuttan biliriz.
void solTik() { tikSol += solYon; }
void sagTik() { tikSag += sagYon; }

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  if (sol != 0) solYon = sol > 0 ? 1 : -1;
  if (sag != 0) sagYon = sag > 0 ? 1 : -1;
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

// Hareket planı: 2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur
void plan(unsigned long ms) {
  if (ms < 2000) surus(TABAN, TABAN);
  else if (ms < 2600) surus(-TABAN, TABAN);
  else if (ms < 4600) surus(TABAN, TABAN);
  else surus(0, 0);
}

float mesafeCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 25000);
  return s == 0 ? -1.0 : s / 58.0;               // -1 = yankı yok
}

void odometriGuncelle() {
  noInterrupts();
  long s = tikSol, g = tikSag;
  interrupts();
  float dSol = (s - oncekiSol) * TIK_M;
  float dSag = (g - oncekiSag) * TIK_M;
  oncekiSol = s;
  oncekiSag = g;
  float d = (dSol + dSag) / 2.0;
  th += (dSag - dSol) / AKS_M;
  while (th > PI) th -= 2 * PI;                  // (-pi, pi] aralığında tut
  while (th <= -PI) th += 2 * PI;
  x += d * cos(th);
  y += d * sin(th);
}

void satirYaz(unsigned long t, float cm) {
  Serial.print("{\"t\":");
  Serial.print(t);
  Serial.print(",\"x\":");
  Serial.print(x, 3);
  Serial.print(",\"y\":");
  Serial.print(y, 3);
  Serial.print(",\"th\":");
  Serial.print(th, 3);
  Serial.print(",\"d\":");
  if (cm < 0) Serial.print("null");              // geçerli ölçüm yok
  else Serial.print(cm, 1);
  Serial.println("}");
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), solTik, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sagTik, RISING);
  Serial.begin(115200);
}

void loop() {
  unsigned long simdi = millis();
  plan(simdi);
  if (simdi - sonRapor >= RAPOR_MS) {
    sonRapor += RAPOR_MS;
    odometriGuncelle();
    satirYaz(simdi, mesafeCm());
  }
}
```

### How does it work?
1. The interrupt service routines (`solTik`, `sagTik`) update the tick count at every encoder edge (lesson 92). Because a single-channel encoder does not know the direction of rotation, we record the direction **from the command we give the motor** (`solYon`, `sagYon`); when going backwards, the tick count goes down.
2. Every 100 ms, `odometriGuncelle()` (update odometry) works out the distance of the two wheels from the tick count. Their average is the robot's forward movement, their difference is the turning angle: `Δθ = (sağ − sol) / aks` (right − left, divided by the axle). Then `x` and `y` are updated with the new heading (lesson 94).
3. `th` is always pulled into the range (-π, π]; that is the contract. Otherwise, after the robot turns a few times, `th` becomes 7, 8 and the receiver does not understand it.
4. If `d` cannot be measured, `-1` is not sent; `null` is written in the JSON. The receiver treats `null` as "no measurement"; writing a fake value such as "400 cm" would be misleading.
5. `Serial.println` adds `\r\n` at the end of the line. Python's `json.loads` function has no problem with the whitespace and `\r` character at the end of a line.
6. The serial line is 115200 baud. A line is about 50 bytes; at 9600 baud this line takes up about 52 ms on the line (half of the 100 ms period), at 115200 less than 5 ms.

**What we measured in the simulator:**
- 51 lines came in 5.2 s, and all of them followed the contract: the keys and their order, `t` increasing by 100 ± 5 ms on every line, the range of `th`, the range of `d`.
- Odometry came within 0.4 cm of the robot's real position (the robot moved about 38 cm from the start and turned more than 130°). This accuracy is because the wheels do not slip in the simulator; on a real floor, floor slip and measurement errors in the wheel diameter and axle width make odometry drift over time (lesson 95).

### Checker: let a program check the contract
Checking the format by eye is not enough. A program reads every line and tests the rules. We wrote this in `checks.mjs`; on your computer you can write the same thing in Python:

```python
import json, math

def satir_sorunu(satir):
    try:
        o = json.loads(satir)
    except ValueError:
        return "JSON degil"
    if list(o.keys()) != ["t", "x", "y", "th", "d"]:
        return "anahtarlar t,x,y,th,d olmali"
    if not isinstance(o["t"], int) or o["t"] < 0:
        return "t pozitif tam sayi olmali"
    if abs(o["x"]) > 10 or abs(o["y"]) > 10:
        return "x ve y -10..10 m olmali"
    if not (-math.pi < o["th"] <= math.pi):
        return "th (-pi, pi] olmali"
    if o["d"] is not None and not (2 <= o["d"] <= 400):
        return "d null ya da 2..400 cm olmali"
    return None                         # sorun yok

for no, satir in enumerate(open("log.jsonl"), 1):
    sorun = satir_sorunu(satir)
    if sorun:
        print("satir", no, ":", sorun)
```

Python is not taught in this course; this section is optional. The code reads each line as JSON (`json.loads`), compares the keys, types and ranges with the rules and names the first rule that is broken. If you do not use Python, you can also check the same rules by eye in the Serial Monitor.

Try a broken line on purpose: in the line `{"t":100,"x":0.1,"y":0.2,"th":4.0,"d":50}`, `th` is greater than π and the checker catches it. It is also important to test the checker itself; in `checks.mjs` we tested it with both good and broken examples.

### Debugging: measurement and log analysis
**Feeling** that the robot is doing something wrong is not enough; you need to put it into numbers. For a measurement error, two numbers are worked out:

- **Mean absolute error:** the average of the absolute values of the difference between each measurement and the real value. The sign does not matter: +3 and -3 do not cancel each other out.
- **Largest absolute error:** the error of the worst measurement. The average may be good while a single measurement is very bad; for safety, the worst case matters.

The first sketch: you type the errors, it calculates:

```cpp
// sketch: hata_istatistik
// Ölçüm hatalarını seri porttan al, ortalama ve en büyük mutlak hatayı hesapla.
//   e <değer>  hata ekle (işaretli olabilir)    r  sonucu yaz    s  sıfırla
long adet = 0;
float toplam = 0;       // mutlak hataların toplamı
float enBuyuk = 0;

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  if (komut == 'e') {
    float hata = fabs(Serial.parseFloat());    // yönü değil büyüklüğü say
    adet++;
    toplam += hata;
    if (hata > enBuyuk) enBuyuk = hata;
  } else if (komut == 'r') {
    Serial.print("n=");
    Serial.print(adet);
    Serial.print(" ort=");
    Serial.print(adet ? toplam / adet : 0.0, 2);
    Serial.print(" maks=");
    Serial.println(enBuyuk, 2);
  } else if (komut == 's') {
    adet = 0;
    toplam = 0;
    enBuyuk = 0;
  }
}
```

An example by hand: if the errors are 1.2; -3.1; 0.4; 2.0; -0.2, the absolute values are 1.2; 3.1; 0.4; 2.0; 0.2. Their sum is 6.9; divided by five the average is 1.38; the largest is 3.10. The sketch prints the same result as `n=5 ort=1.38 maks=3.10` (`ort` average, `maks` maximum).

So how about from a real log? Let us measure the ultrasonic sensor's own error. Keep the robot still (change the `plan(simdi);` line to `surus(0, 0);`), place it 50 cm from a wall, measured with a ruler, take a log for 10 s and paste the Serial Monitor output into a `log.jsonl` file. Then:

```python
import json

HEDEF_CM = 50.0                       # cetvelle ölçtüğün gerçek mesafe
hatalar = []
for satir in open("log.jsonl"):
    kayit = json.loads(satir)
    if kayit["d"] is None:            # geçerli ölçüm yok, atla
        continue
    hatalar.append(kayit["d"] - HEDEF_CM)

ort = sum(abs(h) for h in hatalar) / len(hatalar)
maks = max(abs(h) for h in hatalar)
print("satir sayisi :", len(hatalar))
print("ortalama hata: %.2f cm" % ort)
print("en buyuk hata: %.2f cm" % maks)
```

In the simulator, with 1 cm of sensor noise in the measurement, for 101 lines the average error came out as 0.73 cm and the largest error as 2.20 cm. So a single reading from this sensor can be off by about ± 2 cm at 50 cm. This number shows that the ± 3 cm margin in path C is bigger than the sensor noise. The error of a real HC-SR04 may be different; measure the number for your own sensor, and look at the datasheet.

### Try it
- Run the `telemetri` sketch on your own robot. Set the Serial Monitor to 115200. Does the format follow the contract? Try it with the checker.
- Move the robot 1 m forwards, measured with a ruler, and look at the resulting `x` value. How far off is the odometry? What percentage is the error?
- Make the plan draw a square: four times 2 s forwards and 0.5 s turning. When it gets back to the starting point, are `x` and `y` close to zero? How big is the deviation, and at which corner is its largest error?
- Think about adding a fifth field to the line (for example `"durum"`, state). Think about how the receivers are affected by this, and why the contract needs to be versioned.

### Common mistakes
- Using a comma as the decimal separator: in JSON the decimal separator is a point (`0.5`). `Serial.print` writes with a point, but if you write `0,5` while joining text by hand, the line breaks.
- Using `Serial.print` instead of `Serial.println` and forgetting the end of the line: two lines run together and the JSON breaks.
- Writing `0` when there is no `d`: 0 cm looks like a valid measurement and misleads. Use `null`.
- Setting the wrong baud rate: you see meaningless characters on the screen.
- Not wrapping the `th` value: after a few turns it goes outside the contract.
- Trusting odometry too much: slip and measurement error build up over time. On a long path the position is wrong; the drift from lesson 94 applies here too.
- Keeping the sign in the error calculation and taking a signed average: +3 and -3 cancel each other out, the average comes out as zero, but the robot is wrong.

## Discuss
If the data format is a contract, how would you announce it to everyone who uses it if one day you had to change this format (for example, writing two distances instead of `d`)? What happens to the old records?

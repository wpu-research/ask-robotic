# A fixed-period control loop
duration: 25

## Wonder
A balancing robot's code reads the tilt, does its calculations and adjusts the motors hundreds of times a second. Just as important as the rhythm of this work is something else: each round taking **the same time**. In a film, if the frames arrive irregularly, the motion judders; in a control loop, the robot falls over. Does writing `delay(5)` mean "run every 5 ms"? In this lesson you will measure it.

## Activity
### Circuit
The same as the previous lessons: MPU6050 (SDA **A4**, SCL **A5**, address 0x68). **D13** is used for measuring: the built-in LED. Every round flips the state of D13; the time between two edges is the length of one round. If you have an oscilloscope or a logic analyser, connect it to D13. In the simulation, `pinEdges` does this measurement for us.

### Why a fixed period?
Three things in the control code depend on `dt`:
1. **The angle integral:** `aci += hiz · dt` (lesson 102). If `dt` is wrong, the angle comes out wrong in proportion.
2. **The complementary filter:** time constant `τ ≈ α · dt / (1 − α)` (lesson 102); when `dt` changes, the filter's behaviour changes too.
3. **PID:** the derivative `Δhata / dt`, the integral `hata · dt` (Week 5); the gains are tuned for a particular `dt`.

So there are two ways: either we **really measure `dt` every round** (at the very least), or we run the loop at a **fixed period** (better). Doing both together is the most robust.

### How long does a delay() loop take?
`delay(5)` means "wait 5 ms"; but the rest of the round (I2C reading, calculations, `Serial.print`) is added **on top** of it. The round takes `5 ms + the time of the work`, and the work does not take the same time every round.

### Program 1: measure the period of a delay() loop
The gyroscope is fed as if it were rotating at a constant 50 °/s. The program adds up the angle in two ways: assuming a constant `dt = 0,005`, and measuring it with `micros()`. Every 100 rounds it prints the results and the shortest/longest round time measured (µs).

```cpp
// sketch: delay_dongusu
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int OLCUM_PINI = 13;            // her turda durumu değişir
const float JIRO_OLCEK = 65.5;        // ±500 °/s
const float VARSAYILAN_DT = 0.005;    // "5 ms'dir herhalde" diye yazdığımız dt (s)

float aciSabitDt = 0;                 // dt = 0,005 varsayarak
float aciOlculenDt = 0;               // dt'yi micros() ile ölçerek
unsigned long sonUs = 0;
unsigned long enKucukUs = 4294967295UL;
unsigned long enBuyukUs = 0;
int tur = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

// 14 baytı oku, ivme açısını hesapla, jiroskop hızını döndür
float imuOku(float &ivmeAci) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  return gyHam / JIRO_OLCEK;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  pinMode(OLCUM_PINI, OUTPUT);
  sonUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long dtUs = simdi - sonUs;         // bu tur ile önceki tur arası gerçek süre
  sonUs = simdi;
  if (dtUs < enKucukUs) enKucukUs = dtUs;
  if (dtUs > enBuyukUs) enBuyukUs = dtUs;

  digitalWrite(OLCUM_PINI, !digitalRead(OLCUM_PINI));   // her turda durumu çevir

  float ivmeAci;
  float hiz = imuOku(ivmeAci);
  aciSabitDt += hiz * VARSAYILAN_DT;
  aciOlculenDt += hiz * (dtUs / 1000000.0);

  tur++;
  if (tur >= 100) {                           // her 100 turda bir yazdır
    tur = 0;
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aciSabitDt, 1);
    Serial.print(',');
    Serial.print(aciOlculenDt, 1);
    Serial.print(',');
    Serial.print(enKucukUs);
    Serial.print(',');
    Serial.println(enBuyukUs);
    enKucukUs = 4294967295UL;
    enBuyukUs = 0;
  }
  delay(5);                                   // "5 ms bekle"
}
```

The output columns: time (ms), angle with constant `dt`, angle with measured `dt`, shortest round (µs), longest round (µs).

What we measured in the simulation (over 4 seconds):
- Round time (D13 edges): average **5.35 ms**, shortest 5.33 ms, longest **6.64 ms**. On top of the 5 ms, `delay(5)` adds about 0.33 ms of work time, and about 1.3 ms more in the rounds with `Serial.print`.
- The gyroscope rotated at 50 °/s for 3.7 seconds, so the real angle is **186.7°**. The angle assuming `dt = 0,005` came out as **175.0°** (6.3% short); the angle found with the measured `dt` came out as **186.7°**.

### Program 2: a fixed period with micros()
The solution: ask "have 5 ms passed?". We did this with `millis()` (lesson 27); for balancing we need finer timing, so we use `micros()` (microseconds; on this board it counts in steps of 4 µs). We keep the **planned** time of the next round and add `PERIYOT_US` to it every round; this way small delays do not build up and shift the loop.

If the work takes longer than one round (**overrun**), we reset the planned time and count the missed round. If you send `a` from the serial port, the program deliberately does 12 ms of heavy work and misses a round.

```cpp
// sketch: sabit_dongu
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int OLCUM_PINI = 13;
const float JIRO_OLCEK = 65.5;
const unsigned long PERIYOT_US = 5000;   // hedef periyot: 5 ms = 200 Hz

float aciSabitDt = 0;                 // dt = PERIYOT_US varsayarak
float aciOlculenDt = 0;               // dt'yi micros() ile ölçerek
unsigned long sonPlanUs = 0;          // bir sonraki turun planlanan zamanı
unsigned long sonGercekUs = 0;        // önceki turun gerçek başlangıcı
unsigned long enKucukUs = 4294967295UL;
unsigned long enBuyukUs = 0;
int tasma = 0;                        // kaçırılan tur sayısı
int tur = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

float imuOku(float &ivmeAci) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  return gyHam / JIRO_OLCEK;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  pinMode(OLCUM_PINI, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;             // zamanı gelmedi: hiçbir şey yapma
  if (gecen >= 2 * PERIYOT_US) {              // bir tur kaçtı (iş çok uzun sürdü)
    tasma++;
    sonPlanUs = simdi;                        // yeniden senkronla
  } else {
    sonPlanUs += PERIYOT_US;                  // bir sonraki planlı an: kayma birikmez
  }
  unsigned long dtUs = simdi - sonGercekUs;   // iki tur arası gerçek süre
  sonGercekUs = simdi;
  if (dtUs < enKucukUs) enKucukUs = dtUs;
  if (dtUs > enBuyukUs) enBuyukUs = dtUs;

  digitalWrite(OLCUM_PINI, !digitalRead(OLCUM_PINI));

  float ivmeAci;
  float hiz = imuOku(ivmeAci);
  aciSabitDt += hiz * (PERIYOT_US / 1000000.0);
  aciOlculenDt += hiz * (dtUs / 1000000.0);

  if (Serial.available() && Serial.read() == 'a') {
    delay(12);                                // ağır iş benzetimi: bir turu kaçırır
  }

  tur++;
  if (tur >= 100) {                           // her 100 turda bir yazdır
    tur = 0;
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aciSabitDt, 1);
    Serial.print(',');
    Serial.print(aciOlculenDt, 1);
    Serial.print(',');
    Serial.print(enKucukUs);
    Serial.print(',');
    Serial.print(enBuyukUs);
    Serial.print(',');
    Serial.println(tasma);
    enKucukUs = 4294967295UL;
    enBuyukUs = 0;
  }
}
```

The last column of the output is the number of missed rounds.

What we measured in the simulation:
- Round time (D13 edges): average **5.000 ms**, shortest 4.991 ms, longest 5.009 ms. The sketch's own measurement is also between 4996 and 5004 µs.
- Both angles find the real value (around 186.7°); the constant `dt` assumption is now correct, because the period really is constant.
- Sending the `a` command, the 12 ms of work missed one round: `tasma` (overrun) became 1, one gap between rounds went above 12 ms, and the following rounds carried on at 5.000 ms.

### How does it work?
1. With `if (gecen < PERIYOT_US) return;` the loop quickly returns empty; the work is entered only when the time is up. Unlike `delay()`, we do not keep the processor waiting; `loop()` can look at another job at any moment (for example reading from the serial port).
2. `sonPlanUs += PERIYOT_US` moves the planned time forward. If we did `sonPlanUs = simdi`, the small delay in each round would be added to the next one and the period would drift away from the target.
3. Times are worked out as an `unsigned long` difference. `micros()` wraps around after about 71.6 minutes; the subtraction (as in lesson 27) gives the right result even across this wrap-around.
4. `dtUs` is still **measured**: if a round is missed, the filter and the integral still use the correct `dt`.

### How important is a fixed period for balancing?
We ran the same PD balance code (we will go into the details in 104) with different periods. The robot starts tilted by 3° and was watched for 8 seconds:

```cpp
// sketch: denge_sabit
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor

const unsigned long PERIYOT_US = 5000;
const float ALFA = 0.98;              // tamamlayıcı filtre
const float KP = 0.15;                // komut / derece      (BENZETİM robotuna göre)
const float KD = 0.02;                // komut / (derece/s)  (BENZETİM robotuna göre)
const float OLU_BOLGE = 0.08;         // motor ölü bölgesi: PWM'in bu oranının altında tekerlek dönmüyor

float aci = 0;
bool ilk = true;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void motorSur(float u) {              // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;   // ölü bölgeyi atla, yuvarla
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
}

void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  motorSur(KP * aci + KD * hiz);      // açı ve hız PD'si; ayrıntısı 104'te
}
```

| Period | Result (8 seconds) |
|---|---|
| 5 ms (200 Hz) | Upright; largest tilt 3.0° (the starting one), 0° at the end |
| 20 ms (50 Hz) | Upright; largest tilt 3.0°, 0° at the end |
| 60 ms | Stays upright but makes large oscillations: largest tilt 16.5° |
| 100 ms | Almost falls: largest tilt 43.9°, just below the 45° limit |
| 150 ms | Falls (in 0.3 seconds) |

Rule: the control period must be much shorter than the robot's falling time scale (0.7 seconds, as we saw in 101). Real robots usually choose 5-10 ms; in this course we use 5 ms.

### Try it
- In `delay_dongusu`, write `delay(1)` instead of `delay(5)`. What did the round time become? Is the time of the work still added?
- In `sabit_dongu`, set `PERIYOT_US` to 2000 (500 Hz). Do rounds start to be missed? Find the fastest safe period by measuring the time of the work.
- In `denge_sabit`, set `PERIYOT_US` to 20000, 60000 and 100000. When does the robot start to jitter, and when does it start to fall?

### Common mistakes
- Thinking you have made a "200 Hz loop" with `delay(5)`: the round time is 5 ms + the time of the work, and it changes every round.
- Writing `sonPlanUs = simdi`: small delays build up and the period drifts away from the target.
- Taking the `micros()` difference as an `int`: on AVR an `int` is 16 bits and overflows at 32.7 ms. Use `unsigned long`.
- Putting too many `Serial.print` calls inside the control loop: even at 115200 baud, long lines fill the buffer and delay the round. Print rarely for measuring (every 100 rounds, as above).
- Only making the loop fast without measuring it: without an overrun counter, missed rounds go unnoticed.

### What may be different on a real robot
The timing in the simulation is almost perfect: the fixed period holds within ±4 µs. On a real board, interrupts (for example the encoder, lesson 92), `Serial` and I2C lock-ups make the round time wobble more, and the I2C speed (`Wire.setClock(400000)`) can shorten the round time; measure this on your own board.

## Discuss
If, while your control loop is running at 200 Hz, a job that takes 12 ms (for example a long `Serial.print`) is added to every round, what will the robot do? Where would you move this job?

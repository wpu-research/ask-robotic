# Project: a self-balancing robot
duration: 35

## Wonder
Have you ever tried to keep something upright with one finger? A ruler, a broom handle... Your eye sees it starting to fall, and your hand moves under it straight away. Your robot will do the same: its eye is the MPU6050, its hands are two motors. In this week's project you will build the whole balancing robot and give it a push. Will the robot be able to recover without falling?

## Activity
### What are we going to do?
This project brings together what you have learned:
- **Week 6, lessons 101-102:** read the MPU6050 with raw `Wire`, find the angle with the complementary filter.
- **Week 6, lesson 103:** a control loop with a fixed period of 5 ms.
- **Week 6, lesson 104:** cascade control: the inner loop holds the angle, the slow outer loop holds the position.
- **Module 3, lesson 28:** a state machine (`enum`): DENGE (balance), KONTROLSUZ (uncontrolled), DUSTU (fell).
- **Week 1, lessons 77-78:** motor direction, PWM and the dead zone.

Goals (we will measure them in the simulation):
1. The robot will stay upright for 10 seconds.
2. At 3 seconds we will give it a push. The robot will recover without falling.
3. The robot will report the **largest tilt** and the **settling time** itself (the tilt dropping below 1° after the push and staying there).
4. Comparison: we will measure how long it takes the robot to fall when the control is switched off.

### Circuit
| Part | Connection |
|---|---|
| MPU6050 | SDA → **A4**, SCL → **A5**, GND → GND, VCC → the voltage in the module's documentation, AD0 → GND (address 0x68). X axis forwards, Z axis up |
| Left motor (through the driver) | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Right motor (through the driver) | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |
| Status LED | **D13** (built-in LED): lights up when the robot falls |

**Safety:** Do not power the motors from the Arduino's 5 V pin; use external power and connect the motor driver's GND to the Arduino GND. If you use a battery, do not short-circuit it or connect it the wrong way round; work under adult supervision. Hold the real robot in the air on the first try: check that the motors turn in the right direction before the wheels touch the ground.

### Simulation and real robot
**Important:** the `KP`, `KD`, `KX`, `KV` and `HIZ_KATSAYI` numbers were found for the robot in the simulation (an inverted pendulum model: A = 25, B = 80, C = 0.6). On a real robot these numbers will not work: the motor power, wheel diameter, height and weight of the robot are different. On a real robot, tune the gains from scratch with small values: first `KP` alone, then `KD` when the robot starts to jitter, and the outer loop last. The **structure** of the program holds exactly.

In this simulation the robot has no encoder; we estimate the position from the command. On a real robot, use an encoder (lesson 92).

### Program
```cpp
// sketch: denge_robotu
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor
const int DURUM_LED = 13;                           // yanıyorsa robot düştü

const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const int DIS_ORAN = 4;                  // dış döngü: 20 ms (50 Hz)
const float ALFA = 0.98;                 // tamamlayıcı filtre

// BENZETİM robotuna göre ayarlı kazançlar; gerçek robotta yeniden ayarlanır
const float KP = 0.15;                   // komut / derece
const float KD = 0.02;                   // komut / (derece/s)
const float KX = -10.0;                  // derece / metre
const float KV = -25.0;                  // derece / (metre/saniye)
const float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut
const float OLU_BOLGE = 0.08;

const float DUSME_ACISI = 40.0;          // bu açıyı aşarsak motorları kes
const float ITME_ESIGI = 2.0;            // bu kadar sapma = "itildik"
const float OTURMA_ESIGI = 1.0;          // bundan küçük sapma = "oturdu"
const unsigned long OTURMA_BEKLEME_MS = 1000;   // bu kadar süre eşik altında kalırsa oturmuş say
const unsigned long HAZIR_MS = 2000;     // açılıştaki ilk toparlanmayı itme sanma

enum Durum { DENGE, KONTROLSUZ, DUSTU };
Durum durum = DENGE;

float aci = 0;
bool ilk = true;
float sonKomut = 0;
float hizTahmin = 0;
float konumTahmin = 0;
float hedefAci = 0;
int disSayac = 0;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;
unsigned long sonYazdirMs = 0;

// Rapor için ölçümler
bool itildi = false;
bool raporVerildi = false;
unsigned long itmeMs = 0;
unsigned long sonDisariMs = 0;           // eşiğin dışında olduğumuz son an
float maksEgim = 0;

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

void motorSur(float u) {                 // u: -1 ... +1; 0 = motorlar boşta
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
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
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  pinMode(DURUM_LED, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  // 1) Sabit periyot (ders 103)
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  // 2) Komut: 'k' kontrolü kapatır (kontrolsüz deney)
  if (Serial.available() && Serial.read() == 'k') durum = KONTROLSUZ;

  // 3) Ölç ve süz (ders 101-102)
  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  // 4) Durum makinesi (ders 28)
  if (durum != DUSTU && fabs(aci) > DUSME_ACISI) {
    durum = DUSTU;
    Serial.print("DUSTU,");
    Serial.println(millis());
  }

  if (durum == DENGE) {
    // Dış döngü: yavaş (ders 104)
    disSayac++;
    if (disSayac >= DIS_ORAN) {
      disSayac = 0;
      hizTahmin = HIZ_KATSAYI * sonKomut;
      hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);
    }
    // İç döngü: hızlı
    sonKomut = KP * (aci - hedefAci) + KD * hiz;
    konumTahmin += HIZ_KATSAYI * sonKomut * dt;
    motorSur(sonKomut);
  } else {
    sonKomut = 0;
    motorSur(0);                         // motorlar kapalı
    digitalWrite(DURUM_LED, durum == DUSTU);
  }

  // 5) Ölçüm ve rapor: itme, en büyük eğim, oturma süresi
  unsigned long ms = millis();
  if (durum == DENGE && ms > HAZIR_MS) {
    if (!itildi && fabs(aci) > ITME_ESIGI) {
      itildi = true;
      itmeMs = ms;
    }
    if (itildi && !raporVerildi) {
      if (fabs(aci) > maksEgim) maksEgim = fabs(aci);
      if (fabs(aci) > OTURMA_ESIGI) sonDisariMs = ms;
      if (ms - sonDisariMs > OTURMA_BEKLEME_MS) {
        raporVerildi = true;
        Serial.print("RAPOR,");
        Serial.print(itmeMs);
        Serial.print(',');
        Serial.print(maksEgim, 1);
        Serial.print(',');
        Serial.println(sonDisariMs - itmeMs);
      }
    }
  }

  if (ms - sonYazdirMs >= 1000) {        // saniyede bir durum satırı
    sonYazdirMs = ms;
    Serial.print("T,");
    Serial.print(ms);
    Serial.print(',');
    Serial.print(aci, 2);
    Serial.print(',');
    Serial.println(konumTahmin, 3);
  }
}
```

### How does it work?
1. **Fixed period (103):** `loop()` enters the work only when 5 ms are up, and `dt` is measured every round.
2. **Measurement and filter (101-102):** 14 bytes are read, and the acceleration angle and the gyroscope speed go into the complementary filter.
3. **State machine:** in DENGE the control runs. If the angle goes past 40°, it switches to the DUSTU state: the motors switch off, the LED lights up and `DUSTU` is printed. If `k` arrives from the serial port, it switches to the KONTROLSUZ state; this is an experiment to see that the control works.
4. **Cascade (104):** the outer loop sets the target angle every 20 ms, and the inner loop moves towards this target every 5 ms. We kept the outer loop gains (`KX = −10`, `KV = −25`) smaller than in 104. Why? See "What we learned from this project" below.
5. **Report:** after 2 seconds, when the angle goes past 2°, it counts as "we were pushed". The largest tilt is tracked. If the angle stays below 1° for 1 second, it counts as settled, and the line `RAPOR,itmeAnı,enBüyükEğim,oturmaSüresi` (report, push time, largest tilt, settling time) is printed. The settling time is the time from the push until the last moment the tilt went past 1°.

The `T,` lines in the serial output (once a second): time, filtered angle, estimated position.

### Measurements
We started the robot tilted by 3°. At 3 seconds we added **+200 °/s** to the robot's angular speed from the simulation: a light but clear push. In the arena activity this push comes by itself at 3 seconds; you can also push forwards or backwards whenever you like with the "Push" buttons. The arena measures the real moment of the push, its largest tilt and the settling time, and compares the robot's `RAPOR` line with them (push time ±100 ms, tilt ±0.6°, settling ±100 ms).

| Measurement | Real (`bal`) | Robot's report |
|---|---|---|
| Push time | 3000 ms | 3010 ms |
| Largest tilt | 4.96° | 5.3° |
| Settling time (the tilt dropping below 1° and staying there) | 177 ms | 175 ms |

- The robot stayed upright for 10 seconds and never fell; at 10 seconds the position had shifted by only 1 cm.
- The tilt in the report is 0.3° larger than the real one: the robot sees the filtered angle, not the real angle, and during fast movement there can be small differences between the two. The settling time is almost the same in both measurements.
- **Uncontrolled comparison:** when the same program ran with the control switched off by the `k` command, the robot fell over **756 ms after** the command (the 45° limit). When it passed the 40° threshold, the program printed `DUSTU` and lit the LED. The control saves the robot from a 0.76-second fall; this matches the 0.71-second measurement in 101 (there the robot was released before any control started).
- **A push in the opposite direction** (−200 °/s) was also recovered: after 4 seconds the tilt was 0.70°.
- **Imitating a weak battery:** when `KP` was reduced by 30%, the robot still recovered (largest tilt again 5.0°).
- **If the gyroscope bias is not corrected** (1 °/s): the robot does not fall, but stays permanently tilted by about −1.05°, which means it goes past the settling threshold (1°). This shows why the start-up calibration in 101 is needed.

### What we learned from this project
- **The outer loop gain is a balance.** The large gains we used in 104 (`KX = −60`, `KV = −150`) held the position well against a sensor offset. But after a +200 °/s push with the same gains, the robot did not fall, yet even 7 seconds later the tilt RMS hovered above 1.5° (so it did not settle): because our position estimate is made from the command it is wrong, and a large gain amplifies this error. Here, because there is no sensor offset, we chose small gains. On a real robot, measure the position with an encoder; the estimation error gets smaller and you can increase the outer loop gain.
- **With very strong pushes** the robot does not fall, but it takes longer to calm down: in the simulation, after a +250 °/s push the tilt was still above 1° even at 7 seconds (largest tilt 7.6°), and at +700 °/s the robot fell.
- The margin for staying upright depends on the gains; every number is specific to the robot in the simulation.

### Try it
- When the battery voltage drops, the motors get weaker. Imitate this in the simulation by reducing `KP` by 30%. Does the robot still recover? Did the largest tilt change?
- Give the push in the opposite direction (`−200 °/s`). Do the report values change?
- Set `KX` to −60 and `KV` to −150 and give the same push. What happened to the settling time?
- Set `DUSME_ACISI` to 20° and give a bigger push. Is it a good idea to cut the motors early?
- (Real robot) Halve `KP` and watch the motor response while holding the robot in the air.

### Common mistakes
- Starting the robot without placing it at its balance point: the filter's first angle is wrong. Hold it upright by hand first and switch the power on while the real angle is close to 0°.
- Copying the gains onto a real robot: the numbers from the simulation do not work there.
- Connecting the motor direction pins the wrong way round: the robot speeds up the fall instead of correcting it. Try the sign in the air.
- Not taking the dead zone into account (lesson 78): with small commands the wheel does not turn and the robot wobbles.
- Writing a lot to the serial port inside the loop: the period breaks (103).

### What may be different on a real robot
On a real robot the motors' response time, gear backlash, wheel slip and battery voltage are different. This project works in the simulation; to balance a real robot with the same code you need to tune the gains from scratch, add an encoder and take extra safety measures (such as cutting the motors when it falls).

## Discuss
The robot stayed upright for 10 seconds and recovered from the push. To get the same result with a real robot, which three things do you think you would have to change? The uncontrolled robot falling over in about 0.7 seconds: what conditions does this place on the loop and the motors?

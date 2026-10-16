# Project: A servo controlled by hand tilt (mini gimbal)
duration: 35

## Wonder
In systems that carry a camera (a handheld gimbal, a drone), the picture stays level however much the camera shakes. Inside them there are small motors and a tilt sensor: the sensor says "the base has tilted 20°", the motor turns 20° the opposite way, and the camera stays steady in place. In this project you will build a single-axis model of this idea that fits on a desk.

## Activity
### What are we going to do?
This project brings together what you have learnt:
- **Module 3, Week 5 (lesson 21):** The servo and angle → pulse width.
- **Module 3, Week 6 (lesson 27):** A non-blocking loop with `millis()`.
- **Module 3, Week 7 (lessons 32-33):** Showing the angle with the LCD and I2C.
- **This week (lessons 58-59):** Raw data from the MPU6050, the pitch calculation, gyroscope bias and the complementary filter.

The MPU6050 measures the pitch angle, and the complementary filter calms it down. The servo turns by the pitch amount in the **opposite** direction: if pitch is +20°, the servo goes to 90 − 20 = 70°. If a platform were fixed to the servo arm, the platform would try to stay level when the base tilts. In the lab you tilt the base with the MPU6050's Accel X and Accel Z properties, and you follow the platform's angle from the servo arm's angle.

The button (D2) takes the current tilt as "zero": even if the base is not perfectly level, you can say "this is level now".

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. In the lab you power the servo from the Uno's 5V pin.

| Part | Connection |
|---|---|
| MPU6050 VCC | 5V |
| MPU6050 GND | GND |
| MPU6050 SDA | **A4** (address 0x68) |
| MPU6050 SCL | **A5** |
| I2C LCD VCC | 5V |
| I2C LCD GND | GND |
| I2C LCD SDA | **A4** (address 0x27) |
| I2C LCD SCL | **A5** |
| Servo SIG | **D6** |
| Servo VCC | 5V |
| Servo GND | GND |
| Button "reset" A | **D2** (`INPUT_PULLUP`) |
| Button B | GND |
| Resistor (330 Ω) 1 | **D13** |
| Resistor 2 | LED **A** (anode) |
| LED **K** (cathode) | GND ("servo at limit" light) |

The MPU6050 (0x68) and the LCD (0x27) work side by side on the same two wires, because their addresses are different (lesson 33). There must be no RTC (DS3231) part in the circuit; it uses 0x68 too.

On real hardware, however, the 5 V can drop when the servo is under load, and the MPU/LCD may misbehave; that is why in a real build the servo is powered from a separate 5 V supply and the supplies' GNDs are joined. The lab does not model this voltage drop.

### Design
- **Pitch:** `atan2(ax, az)` (lesson 58).
- **Filter:** `aci = 0,98 · (aci + gy · dt) + 0,02 · accAci` (lesson 59). The bias is measured in `setup`, while the chip is not moving.
- **Reset:** When the button is pressed, the current `aci` (angle) is stored as `ofset` (offset). The control angle becomes `egim = aci − ofset` (tilt).
- **Servo angle:** `servo = 90 − egim`. It is limited to `10 ... 170°` so that the servo does not push against its mechanical ends. When it reaches the limit, the LED lights up.
- **Timing:** The loop measures and updates the servo every 10 ms; the LCD and serial output are refreshed every 250 ms. There is no `delay` at all (lesson 27).

The servo does **not see** the result of the control: the MPU measures the tilt of the base, not whether the platform is really level. Control like this, with no sensor feedback, is called **open loop**. It is simple and good enough for most desktop models; measuring and correcting the platform's real angle is the next level.

### Program
```cpp
// sketch: mini_gimbal
#include <Wire.h>
#include <Servo.h>
#include <LiquidCrystal_I2C.h>

const int MPU = 0x68;
const int SERVO_PIN = 6;
const int SIFIRLA = 2;
const int LED = 13;

const float ALFA = 0.98;
const int SERVO_MERKEZ = 90;
const int SERVO_MIN = 10;
const int SERVO_MAX = 170;
const unsigned long DONGU_MS = 10;
const unsigned long EKRAN_MS = 250;

Servo servo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

float sapmaGy = 0;
float aci = 0;                       // filtreli pitch (derece)
float ofset = 0;                     // "sıfır" kabul edilen açı
float ax, az, gy;                    // son ölçüm: g, g, °/s
unsigned long sonDongu = 0;
unsigned long sonEkran = 0;
unsigned long sonUs = 0;
bool oncekiBasili = false;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void mpuOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 14, true);
  ax = oku16() / 16384.0;
  oku16();                           // ay: kullanmıyoruz
  az = oku16() / 16384.0;
  oku16();                           // sıcaklık
  oku16();                           // gx
  gy = oku16() / 131.0;              // pitch: Y ekseni etrafında dönüş
  oku16();                           // gz
}

float ivmeAci() {
  return atan2(ax, az) * 180.0 / PI;
}

void ekranYaz(float egim, int servoAci) {
  lcd.setCursor(0, 0);
  lcd.print("Egim: ");
  lcd.print(egim, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print("Servo: ");
  lcd.print(servoAci);
  lcd.print("      ");
}

void setup() {
  Serial.begin(9600);
  pinMode(SIFIRLA, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  servo.attach(SERVO_PIN);
  servo.write(SERVO_MERKEZ);

  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);                     // uyandır
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;                  // sapma ölçümü: çip kıpırdamasın
  for (int i = 0; i < 100; i++) {
    mpuOku();
    toplam += gy;
    delay(5);
  }
  sapmaGy = toplam / 100;

  mpuOku();
  aci = ivmeAci();                   // başlangıç açısı ivmeölçerden
  lcd.init();
  lcd.backlight();
  sonUs = micros();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Sıfırlama düğmesi: basıldığı an bir kez
  bool basili = (digitalRead(SIFIRLA) == LOW);
  if (basili && !oncekiBasili) {
    ofset = aci;
  }
  oncekiBasili = basili;

  // 2) Her 10 ms'de ölçüm, filtre ve servo
  if (simdi - sonDongu >= DONGU_MS) {
    sonDongu = simdi;

    mpuOku();
    unsigned long us = micros();
    float dt = (us - sonUs) / 1000000.0;
    sonUs = us;
    aci = ALFA * (aci + (gy - sapmaGy) * dt) + (1.0 - ALFA) * ivmeAci();

    float egim = aci - ofset;
    int servoAci = SERVO_MERKEZ - (int)round(egim);   // ters yönde dön
    bool sinirda = (servoAci <= SERVO_MIN || servoAci >= SERVO_MAX);
    servoAci = constrain(servoAci, SERVO_MIN, SERVO_MAX);
    servo.write(servoAci);
    digitalWrite(LED, sinirda ? HIGH : LOW);

    // 3) Ekran ve seri çıktı: 250 ms'de bir
    if (simdi - sonEkran >= EKRAN_MS) {
      sonEkran = simdi;
      ekranYaz(egim, servoAci);
      Serial.print("egim=");
      Serial.print(egim, 1);
      Serial.print(" servo=");
      Serial.println(servoAci);
    }
  }
}
```

### How does it work?
1. `setup` moves the servo to the middle (90°), wakes up the MPU and finds the gyroscope bias from the average of 100 measurements (lesson 59). After pressing ▶, do not change the MPU6050's properties for the first half second (while this measurement is running).
2. `mpuOku` (read MPU) reads the 14 bytes in one go (lesson 58) but keeps only the ones we need: `ax`, `az` and `gy`.
3. Every 10 ms the complementary filter runs. `dt` is calculated from the `micros()` difference; even if the loop's timing wobbles a little, the integral stays right.
4. `egim = aci − ofset`: when you press the button, the current angle becomes zero.
5. `servoAci = 90 − egim`: if the tilt is positive, the servo goes below 90, that is, it turns the opposite way. `constrain` keeps it between 10 and 170. When it reaches the limit, the LED lights up.
6. `servo.write` sets the pulse width (lesson 21): 90° ≈ 1472 µs, 70° ≈ 1266 µs.
7. `loop` never waits; it checks the button, the measurement and the screen with separate timestamps (`millis`).

If the platform turns the wrong way (this can happen depending on how the servo is mounted), change `SERVO_MERKEZ - ...` to `SERVO_MERKEZ + ...`.

### Try it
- Set `ALFA` to 0.90. Imitate vibration: change Accel X quickly between 0 and 0.2. How much does the servo jitter? With `ALFA` at 0.99, how late does the servo react?
- Set `SERVO_MIN` and `SERVO_MAX` to 45 and 135. When does the LED light at the limit?
- Add the roll axis too: connect a second servo to D9 and drive it with the angle `roll = atan2(ay, az)`. It becomes a two-axis gimbal (you need to keep the `ay` value inside `mpuOku`).
- Let the bias change later: while it runs, raise Gyro Y from 0 to 3. Does the servo slowly drift, or does the filter hold it? Work out the leftover error with the formula from lesson 59 (`α · hata · dt / (1 − α)`, where `hata` is the error).

### Common mistakes
- On real hardware, powering the servo from the board's 5 V pin and being surprised when the MPU or LCD freezes as the servo takes load. In a real build, use an external supply and a common GND.
- Moving the base while the bias is being measured (in the first half second of the program): the bias is measured wrongly and the servo keeps drifting.
- Using an RTC (DS3231, the same 0x68 address) on the same line as the MPU6050.
- Writing a fixed 0.01 instead of `dt`: when the loop time changes, the filter goes wrong.
- Not limiting the servo angle: the servo pushes against its mechanical end, strains, makes a noise and heats up.
- Using `delay`: it misses button presses and spoils the filter's `dt`.

## Discuss
A real gimbal has a second sensor that measures the platform's own angle, and a control that keeps correcting the error. Our model has no such feedback. When the camera's base tilts slowly and when it tilts quickly, in which case does our model make more mistakes? Why?

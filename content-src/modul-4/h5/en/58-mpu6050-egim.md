# MPU6050: accelerometer and tilt angle (I2C)
duration: 30

## Wonder
When you turn your phone sideways, the screen rotates by itself. Inside the device there is a small chip that answers the question "which way is up?". This chip measures gravity. A phone lying on the table measures gravity; so does one held at a tilt. The difference is how much of the pull falls on which axis. Can we get an angle out of this difference?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| MPU6050 VCC | 5V |
| MPU6050 GND | GND |
| MPU6050 SDA | **A4** |
| MPU6050 SCL | **A5** |
| Resistor (330 Ω) 1 | **D13** |
| Resistor 2 | LED **A** (anode) |
| LED **K** (cathode) | GND |

You learnt I2C in lesson 33: many devices on two lines (SDA, SCL), each with its own address. The MPU6050's address is **0x68**; if the AD0 pin on the real module is connected to 5 V, the address becomes 0x69. In the lab this is the MPU6050's **I2C address (AD0)** property; if you choose 0x69, you must also change the `MPU` constant in the code to 0x69. The RTC (DS3231) module also uses 0x68, so do not add an RTC part to this week's circuit.

When you select the MPU6050, the **Accel X, Y, Z** (in g) and **Gyro X, Y, Z** (in °/s) properties appear in the right panel. These are the values the chip "measures", and you can change them while the program runs too; instead of turning the chip by hand, you change these numbers. The lab chip's temperature is fixed at 25 °C.

### Registers: reading without a library
In this lesson we will not use a ready-made library; we will talk to the chip itself. That way you will see what the `Wire` commands you met in lesson 33 really do. Inside, the MPU6050 is made of numbered cells called **registers**. The ones we need:

| Register | Meaning |
|---|---|
| 0x6B | Power management. The chip is in sleep mode at start-up. Writing 0 here wakes it up. |
| 14 bytes starting at 0x3B | Accel X, Y, Z (2 bytes each) · temperature (2 bytes) · gyro X, Y, Z (2 bytes each) |

Each measurement is a **16-bit signed** number, and the high byte comes first. So you have to join the two bytes with `(yuksek << 8) | dusuk` (high, low) and keep the result as an `int16_t`.

With the default settings, the chip's measuring ranges are:

- Accelerometer: ±2 g. To convert the raw value to g, you divide by **16384** (16384 LSB/g).
- Gyroscope: ±250 °/s. To convert the raw value to °/s, you divide by **131** (131 LSB/(°/s)).
- Temperature: `ham / 340 + 36,53` degrees (the formula from the datasheet).

g is the Earth's gravitational acceleration: a chip lying on a table measures about 1 g on the axis that points up.

### Program 1: Read the raw data and convert it
```cpp
// sketch: mpu_ham
#include <Wire.h>

const int MPU = 0x68;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);                 // güç yönetimi yazmacı
  Wire.write(0);                    // 0 yaz: uyan
  Wire.endTransmission(true);
}

void loop() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);                 // okumaya başlanacak yazmaç
  Wire.endTransmission(false);      // bağlantıyı bırakma (tekrar başlat)
  Wire.requestFrom(MPU, 14, true);  // 14 bayt iste

  int16_t ax = oku16();
  int16_t ay = oku16();
  int16_t az = oku16();
  int16_t sicak = oku16();
  int16_t gx = oku16();
  int16_t gy = oku16();
  int16_t gz = oku16();

  Serial.print("HAM ax=");
  Serial.print(ax);
  Serial.print(" ay=");
  Serial.print(ay);
  Serial.print(" az=");
  Serial.println(az);

  Serial.print("g ax=");
  Serial.print(ax / 16384.0, 2);
  Serial.print(" ay=");
  Serial.print(ay / 16384.0, 2);
  Serial.print(" az=");
  Serial.print(az / 16384.0, 2);
  Serial.print(" | dps gx=");
  Serial.print(gx / 131.0, 1);
  Serial.print(" gy=");
  Serial.print(gy / 131.0, 1);
  Serial.print(" gz=");
  Serial.print(gz / 131.0, 1);
  Serial.print(" | C=");
  Serial.println(sicak / 340.0 + 36.53, 1);

  delay(500);
}
```
For a chip lying flat, the properties panel should show **Accel X = 0, Accel Y = 0, Accel Z = 1** (these are the default values). Press ▶: `az` comes out at about 1.00 g, and `ax` and `ay` are close to zero. Now imagine standing the chip up on one edge: set **Accel X = 1** and **Accel Z = 0**. The 1 g moves to another axis and the raw `ax` becomes 16384. To imitate the chip turning, set **Gyro X** to 20: `gx` reads about 20 °/s; bring it back to 0 and it returns to zero. A real chip does not show exactly zero on the gyro when it is still (the next lesson explains this); the lab chip, being ideal, shows zero.

### Tilt angle
When the chip is still, the only thing it measures is gravity: a **vector** of about 1 g. As you tilt the chip, this vector is shared between the axes in different amounts. When the X axis lifts up, `ax` grows and `az` shrinks. Think of a triangle: the horizontal side is `az`, the vertical side is `ax`. The angle is the arctangent of these two sides:

```cpp
pitch = atan2(ax, az) * 180.0 / PI;   // öne-arkaya eğim
roll  = atan2(ay, az) * 180.0 / PI;   // yana eğim
```
`atan2(y, x)` gives the angle from the two sides in **radians**. Multiplying by 180/π turns it into degrees. Example: if `ax = 0.5` and `az = 0.866`, then `atan2(0.5, 0.866) = 30°` (0.5 = sin 30°, 0.866 = cos 30°).

Which way pitch and roll are positive depends on how the real chip is mounted on its board (the X and Y arrows printed on the module show the direction). In the lab, pitch grows as Accel X grows, and roll grows as Accel Y grows. In this lesson we assume tilt on one axis; if both axes are tilted a lot at the same time, these simple formulas affect each other a little.

### Program 2: Pitch, roll and a spirit level
```cpp
// sketch: mpu_egim
#include <Wire.h>

const int MPU = 0x68;
const int LED = 13;

float ax, ay, az;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void ivmeOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);   // yalnız ivme: 6 bayt
  ax = oku16() / 16384.0;
  ay = oku16() / 16384.0;
  az = oku16() / 16384.0;
}

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
}

void loop() {
  ivmeOku();
  float pitch = atan2(ax, az) * 180.0 / PI;
  float roll = atan2(ay, az) * 180.0 / PI;

  digitalWrite(LED, (abs(pitch) < 2.0 && abs(roll) < 2.0) ? HIGH : LOW);   // terazi

  Serial.print("pitch=");
  Serial.print(pitch, 1);
  Serial.print(" roll=");
  Serial.println(roll, 1);
  delay(200);
}
```

### How does it work?
1. The chip is asleep at start-up. If you read without writing 0 to register `0x6B`, no meaningful data comes back.
2. `beginTransmission` + `write(0x3B)` + `endTransmission(false)` means "I am going to read from this register". `requestFrom` then asks for the bytes that follow one after another. After each byte the chip adds one to the register number by itself, so 14 bytes arrive with a single request.
3. The bytes are joined two by two: the high byte is shifted 8 bits to the left and the low byte is added. The `int16_t` type reads the sign correctly (a negative tilt becomes a negative number).
4. Dividing by 16384 converts the raw number into g. Example: raw 8192 → 0.5 g.
5. `atan2` gives the angle. When the chip is flat, `ax = 0` and `az = 1`, so `pitch = 0`.
6. The LED lights if both angles are within ±2°: a digital spirit level.

### Try it
- Leave Accel X and Y at 0 and Accel Z at 1. What do `pitch` and `roll` come out as? In the lab they come out as exactly 0.0. If they are not exactly 0.0 on a real chip, is that a fault? (Answer: because of the angle at which the chip is mounted on the board and measurement error, a small offset is normal.) To imitate this, set Accel X to 0.02 and see how many degrees pitch is.
- Without tilting the chip, set only **Accel X** to 0.3 (as if the chip were speeding up horizontally). What does `pitch` become? The chip did not tilt, yet the angle changed: when the chip is moving, is gravity the only thing it measures?
- Make the LED's lighting range ±5°, then ±0.5°. Which one is more useful?

### Common mistakes
- Forgetting to write 0 to register `0x6B`: the chip stays asleep.
- Joining the bytes as an `int` and leaving them unsigned: a negative tilt turns into a number like 65000. Use `int16_t`.
- Writing `ax / 16384`: dividing two whole numbers gives a whole number. Write `16384.0`.
- Forgetting to convert the result of `atan2` into degrees: the result is in radians.
- Trusting the angle measured while the chip is moving: the accelerometer cannot tell gravity apart from the chip's own acceleration. If you speed the chip up horizontally (for example so that `ax = 0,3 g` and `az = 1 g`), `atan2` gives about 16.7°, yet the chip has not tilted.
- Using the MPU6050 and an RTC (DS3231) module on the same line: both use address 0x68.

## Discuss
A phone knows whether it is landscape or portrait with its accelerometer. So why does measuring a bicycle's lean in a bend, or a drone's tilt, with an accelerometer alone cause problems? What happens to the gravity vector in a swaying train carriage?

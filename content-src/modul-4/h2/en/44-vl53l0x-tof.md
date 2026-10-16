# VL53L0X (I2C ToF): precise distance
duration: 20

## Wonder
You measured the length of the room with the HC-SR04, but sometimes the sensor did not see the object at all, or the sound bounced off in the wrong direction. To measure a part that comes right up to the tip of a thin cable, would you like to use light instead of sound? There is a sensor on a small board that measures the there-and-back time of a pulse of light: the VL53L0X.

## Activity
### What is ToF?
ToF (Time of Flight) means the sensor sends out a pulse of light and measures how long its reflection takes to come back. The VL53L0X does this with an infrared laser and gives the result in **millimetres**. It sends the data to the Arduino over **I2C** (the `Wire` from lesson 33). Its default I2C address is **0x29**.

For the limits, check the sensor's datasheet. The measuring range, the accuracy and how it reacts to ambient light **depend on the model and the conditions of use**.

**Important:** there is **no** VL53L0X part in the lab. In this lesson you will not build a circuit; you will write and compile the sensor code and see what your program does when the lab cannot find the sensor. A good program notices when the sensor is missing and reports it.

Real hardware note: most ready-made breakout boards have a regulator that steps down 5 V, but the bare chip is not 5 V tolerant; you need to check the board's documentation.

### ToF compared with ultrasonic
Let's compare the HC-SR04 from lessons 36-39 with the VL53L0X in broad terms. For exact numbers, check the datasheets of both.

| Topic | HC-SR04 (ultrasonic) | VL53L0X (ToF) |
|---|---|---|
| Measuring method | The echo of a sound pulse | The reflection of a light pulse |
| Connection | Two digital pins for TRIG and ECHO, `pulseIn` | I2C (SDA and SCL), a library |
| Range | Offers a longer range | Usually a shorter range |
| Speed | Measuring is slow because sound is slow | Measuring can be fast because light is fast |
| Surface dependence | Soft (fabric, sponge) and slanted surfaces can scatter the sound, as in lesson 38 | Dark and shiny surfaces and strong ambient light can affect the result |
| Beam width | A cone of sound that can spread widely across the surface | Light also has a certain field of view; compare the angles in the datasheets |
| Number of pins | Uses up pins | Two I2C pins, shared with other I2C devices |

Which one is "better"? That is the wrong question. To measure a far wall in a large room where the surface does not matter, ultrasonic may suit. If you need a small, fast measurement with a narrow angle, ToF suits. Because it is cheap and simple, the HC-SR04 is still common.

### Circuit
Because there is no VL53L0X part in the lab, no circuit is built in this lesson. In a real circuit the connection would be as follows (for information):

| Part | Connection |
|---|---|
| VL53L0X board | VCC → 5V (check the board's documentation), GND → GND, SDA → **A4**, SCL → **A5** |
| Resistor (330 Ω) + LED | **D13** → resistor → LED A; LED K → GND |

The I2C address is 0x29. In a real circuit, to be sure, you run the address scanner program from lesson 33; 0x29 should appear in the output. Another I2C device (for example an LCD at 0x27) can be connected to the same bus; their addresses are different.

### Program
The sketches below use the **Pololu VL53L0X** library. The header file is `#include <VL53L0X.h>`. Because there is no sensor part in the lab, these sketches are only **compiled**; the measuring behaviour (mm values, threshold crossings) has not been checked here. If you run the program with ▶, `init()` cannot find the sensor and the serial monitor shows "VL53L0X bulunamadi" (VL53L0X not found); this is the expected behaviour and shows that the error check works.

First, the simplest reading. `readRangeContinuousMillimeters()` returns the result in millimetres in continuous measuring mode:

```cpp
// sketch: tof_okuma
#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  sensor.setTimeout(500);               // ms
  if (!sensor.init()) {
    Serial.println("VL53L0X bulunamadi");
    while (true) {}                     // sensör yoksa burada dur
  }
  sensor.startContinuous();             // sürekli ölçüm başlat
}

void loop() {
  int mm = sensor.readRangeContinuousMillimeters();
  if (sensor.timeoutOccurred()) {
    Serial.println("Zaman asimi");
  } else {
    Serial.print(mm);
    Serial.println(" mm");
  }
  delay(100);
}
```

Now let's add a threshold: if an object is closer than 300 mm, the LED lights. So that it does not flicker around the threshold, we used the hysteresis idea from lesson 35:

```cpp
// sketch: tof_esik
#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

const int LED = 13;
const int YAKIN_MM = 300;      // bunun altında "yakın"
const int UZAK_MM = 340;       // bunun üstünde "uzak"

bool yakin = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Wire.begin();
  sensor.setTimeout(500);
  if (!sensor.init()) {
    Serial.println("VL53L0X bulunamadi");
    while (true) {}
  }
  sensor.startContinuous();
}

void loop() {
  int mm = sensor.readRangeContinuousMillimeters();
  if (!sensor.timeoutOccurred()) {
    if (!yakin && mm < YAKIN_MM) {
      yakin = true;
      Serial.println("Yakin");
    } else if (yakin && mm > UZAK_MM) {
      yakin = false;
      Serial.println("Uzak");
    }
  }
  digitalWrite(LED, yakin);
}
```

### How does it work?
1. `Wire.begin()` starts the I2C bus. `sensor.init()` returns true if it can reach the sensor and false if it cannot. This is how we catch wiring errors.
2. `setTimeout(500)` makes sure that, if a reading does not finish within 500 ms, you are told via `timeoutOccurred()`. If a reading fails, do not trust the number it returns; do this check first.
3. `startContinuous()` makes the sensor measure again and again. `readRangeContinuousMillimeters()` gives the result in mm.
4. `tof_esik` has two thresholds. When the distance drops below 300 mm it becomes "close", and when it rises above 340 mm it becomes "far". If it stays in between, the previous state is kept. The median filter you used with the HC-SR04 (lesson 38) can be used here too.

### Try it
- Run the `tof_okuma` program in the lab. What does the serial monitor show? What happens if you delete the `init()` check and run it? (Write in your own words why the check is needed.)
- Set `YAKIN_MM` and `UZAK_MM` in `tof_esik` to 200 and 260 and compile. Explain why the gap between them (the hysteresis margin) should not be zero.
- Write the same threshold logic with the HC-SR04 (with the Distance slider in the lab, lesson 37): the LED lights if closer than 30 cm and goes off if farther than 34 cm. How is it different from the ToF code?
- Look up in the datasheet how dark and shiny surfaces can affect a ToF measurement, and write it in one sentence.

### Common mistakes
- Connecting the SDA and SCL wires the wrong way round (or not having the sensor at all): `init()` fails.
- On real hardware, connecting a bare chip with 3.3 V logic to 5 V: do not connect it without checking the board's documentation.
- Not checking `timeoutOccurred()`: you take a faulty reading for a real distance.
- Using a long `delay` or writing blocking code: use the `millis()` method from lesson 27.
- Using the function names of a different VL53L0X library instead of the Pololu library: the names differ between libraries.

## Discuss
To detect an obstacle in front of a robot, would you use the HC-SR04 or the VL53L0X? Does your choice change if the robot is outdoors, if the surfaces are soft, or if the robot is very fast?

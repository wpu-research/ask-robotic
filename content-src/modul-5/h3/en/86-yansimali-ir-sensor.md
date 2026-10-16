# The reflective IR sensor and reading a line
duration: 20

## Wonder
Have you seen warehouse robots that keep following a black tape on the floor? They have no eyes, but they have small sensors looking down at the floor. The sensor measures the infrared light reflected from the floor. Because the tape and the floor reflect light differently, the robot can say "I am on the tape right now". But how do you work out which of five sensors sees the tape, that is, where the tape is under the robot?

## Activity
### How does the sensor work?
A reflective sensor such as the TCRT5000 has two small parts side by side: an infrared (IR) LED and a phototransistor. The LED sends light to the floor, and the more light the surface reflects, the more current the phototransistor lets through. A light-coloured, shiny surface reflects a lot; a dark, matt surface reflects little. The sensor module's analogue output turns this difference into a voltage.

In the circuit we use in this lesson, **the reading is high on the line and low on the floor**: about 4.2 V on the line (`analogRead` ≈ 860) and about 0.8 V on the floor (≈ 164). On real modules the direction can be the other way round; whichever module you have, look at the raw values first, then write the code to match.

### Circuit
Five sensors are lined up at the front of the robot, looking down at the floor. The sensors sit side by side 2.4 cm apart, 7 cm in front of the axle. The line is 2 cm wide. The sensors should be a few millimetres above the floor; check the exact distance in the part's datasheet.

| Part | Connection |
|---|---|
| Sensor 0 (far left) | AO → **A0**, VCC → 5 V, GND → GND |
| Sensor 1 | AO → **A1** |
| Sensor 2 (middle) | AO → **A2** |
| Sensor 3 | AO → **A3** |
| Sensor 4 (far right) | AO → **A4** |

The order matters: looking at the robot from behind, in the direction it moves, A0 is on the far left and A4 on the far right. Decide on this order once and use it in all the code. The driver and motor connections are not used in this lesson; we will add them with the standard connections in the next lessons.

### Program: raw reading
First, look at what the sensors are saying. A program that prints the five values on one line:

```cpp
// sketch: sensor_ham
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};

void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    Serial.print(analogRead(SENSOR_PIN[i]));
    if (i < SENSOR_SAYISI - 1) {
      Serial.print(' ');
    }
  }
  Serial.println();
  delay(200);
}
```

If you place the robot centred on the line, you see a line such as `164 164 860 164 164`: the middle sensor is on the line (high), the others are on the floor (low).

### Program: digital thresholding and line position
Instead of dealing with raw numbers, we ask each sensor a single question: "are you on the line?" We do this with a single **threshold**: if the reading is greater than the threshold it is 1 (line), otherwise 0 (floor). Since the floor is 164 and the line is 860, 512, halfway between the two, is a sensible starting threshold.

Then a five-bit pattern comes out (`00100`). If a single sensor is on the line, we give the position in the range −2…+2: **negative = line on the left**, 0 = in the middle, positive = on the right.

```cpp
// sketch: sensor_desen
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sayi = 0;       // kac sensor cizgide
  int ilk = -1;       // cizgiyi gorenlerden ilkinin numarasi

  for (int i = 0; i < SENSOR_SAYISI; i++) {
    bool cizgide = analogRead(SENSOR_PIN[i]) > ESIK;
    if (cizgide) {
      Serial.print('1');
      sayi++;
      if (ilk < 0) {
        ilk = i;
      }
    } else {
      Serial.print('0');
    }
  }

  if (sayi == 0) {
    Serial.println(" cizgi yok");
  } else if (sayi == 1) {
    Serial.print(" konum=");
    Serial.println(ilk - 2);          // A0 -> -2, A2 -> 0, A4 -> +2
  } else {
    Serial.println(" birden cok sensor");
  }
  delay(200);
}
```

### How does it work?
1. The `SENSOR_PIN` array lists the sensors from left to right. The `for` loop reads all five with the same code (the arrays you saw in lesson 4).
2. `analogRead(...) > ESIK` produces a `bool`. This way you turn the number into "line / no line" information.
3. The `ilk - 2` (first − 2) calculation turns the sensor number (0…4) into a position (−2…+2). The middle sensor is number 2, and its position is 0.
4. The line is 2 cm wide and the sensors sit 2.4 cm apart. A sensor sees the line if it is closer than 1 cm (half the line's width) to the line's centre. If the line's centre is between two neighbouring sensors, between 1 and 1.4 cm from both of them, both sensors see floor: `00000`. This is a **blind zone** of about 4 mm. As long as the sensor spacing is larger than the line width, a blind zone like this remains. If the line were 3 cm wide, two neighbouring sensors would both give `1` in the same position and the program would print "birden cok sensor" (more than one sensor).

### Try it
- Set `ESIK` to 100. Since the floor reads 164, all five sensors give `1`. Why does everything become "line" if the threshold is too low?
- Set `ESIK` to 900. Because the line reads 860, you can no longer see the line at all. In which range can you choose the threshold?
- Place the robot 1.2 cm beside the line and watch the pattern. Did you find the blind zone?

### Common mistakes
- Mixing up the sensor order: if you think A0 is on the right, the robot turns the wrong way in all the following lessons.
- Using `>` even though the module's output is reversed (the line reads low). Look at the raw values first.
- Tying all the code to a single number ("512"). When the light or the floor changes, this number turns out wrong; in the next lesson we will find the threshold by measuring.
- Mounting the sensor too high above the floor: the reflection gets weaker and the difference between line and floor shrinks.

### What may be different on a real robot
The sensor in the simulation has no noise and always gives 0.8 V / 4.2 V. On a real TCRT5000, the colour of the line and the floor, the shine of the tape, the sensor's height above the floor and the ambient light (sunlight contains infrared too) change the values. The readings are not two fixed numbers; they flicker.

## Discuss
If you used a shiny, reflective tape on a white floor instead of black tape, how would the sensor's reading change? What would you need to change in the robot's program?

# The ultrasonic principle: sound, time, distance
duration: 20

## Wonder
A bat flies in the dark without hitting the wall. It sees with its ears, not its eyes: it makes a sound and waits for it to bounce back from the wall. The later the echo returns, the farther away the wall is. The HC-SR04 sensor does the same thing. So how do we turn "how late" into centimetres?

## Activity
### How does the sensor work?
The HC-SR04 has two "eyes": one sends sound like a speaker (T), the other listens like a microphone (R). The sound it sends is **ultrasonic**: a sound with a frequency too high for the human ear to hear (40 kHz on this sensor).

A measurement goes like this:
1. The board gives the sensor's **TRIG** pin a very short HIGH pulse. This pulse is the "measure" command.
2. The sensor sends out a short burst of 40 kHz sound.
3. The sound hits an object and bounces back.
4. The sensor holds its **ECHO** pin HIGH from the moment it sends the sound until the moment it comes back.

So the sensor does not give you a distance. It gives you a **time**: how long ECHO stays HIGH. We work out the distance from that time.

### The formula
Sound travels through air at about **343 m/s** (at about 20 °C). Let's convert it to centimetres and microseconds:

343 m/s = 34 300 cm/s = 34 300 / 1 000 000 cm/µs = **0.0343 cm/µs**

The sound travels to the object and back. The time we measure is the **there-and-back** time. The distance is only the way there, so we divide by two:

**distance (cm) = time (µs) × 0.0343 / 2**

Shortcut: a distance of 1 cm takes about 58 µs there and back. Dividing the time by 58 also gives you centimetres.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |
| HC-SR04 GND | Uno **GND** |

The programs in this lesson do not touch the sensor yet; they only do the maths. Build the circuit now anyway, you will use it in lesson 37. When you select the HC-SR04, a **Distance** property appears in the right panel (2-400 cm). You can change it while the circuit runs; the sensor measures the distance of "the object in front of it" accordingly. The module's datasheet gives a typical range of 2 cm to 400 cm. Outside this range, or when the sound bounces off in a way that does not return to the sensor, you do not get a valid measurement.

Note: what ECHO does when there is no echo differs from module to module. Some modules keep ECHO HIGH for about 38 ms when no echo comes back. The 30 ms timeout we will see in lesson 37 turns both cases into the same "no measurement" (0).

### Program 1: from time to distance
Let's apply the formula to five different times.

```cpp
// sketch: ses_mesafe_tablosu
const float SES_CM_US = 0.0343;   // 343 m/s = 0,0343 cm/us
unsigned long sureler[] = {583, 2915, 5830, 11660, 23320};   // mikrosaniye

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) {
    float cm = sureler[i] * SES_CM_US / 2.0;
    Serial.print("sure=");
    Serial.print(sureler[i]);
    Serial.print(" us -> ");
    Serial.print(cm, 1);
    Serial.println(" cm");
  }
}

void loop() {
}
```

In the output you see about 10 cm for 583 µs, about 100 cm for 5830 µs and about 400 cm for 23 320 µs. 400 cm is the sensor's far limit: the sound goes 4 metres and comes back 4 metres, which takes about 23 milliseconds. Sound is fast, but it is not light: even a 1 metre measurement takes 5.8 milliseconds.

### Temperature and the speed of sound
343 m/s is not always right. The speed of sound depends on the air temperature. In dry air it is roughly:

**c ≈ 331.3 + 0.606 × T** (c: m/s, T: °C)

Sound travels faster in hot air and slower in cold air. Because the sensor's calculation always assumes 343 m/s, the measurement drifts when the temperature changes. If the sound really travels at 331.3 m/s while the sensor assumes 343 m/s, it finds the distance larger than it is; if the sound travels at 355 m/s, it finds it smaller. The program below works out what the sensor reads at each temperature for an object that is really 100 cm away:

```cpp
// sketch: ses_sicaklik
float sesHizi(float sicaklikC) {          // m/s
  return 331.3 + 0.606 * sicaklikC;
}

void setup() {
  Serial.begin(9600);
  float sicakliklar[] = {0, 10, 20, 30, 40};
  for (int i = 0; i < 5; i++) {
    float c = sesHizi(sicakliklar[i]);
    float okunan = 100.0 * 343.0 / c;     // sensör 343 m/s sanıyor
    Serial.print("T=");
    Serial.print(sicakliklar[i], 0);
    Serial.print(" C  c=");
    Serial.print(c, 2);
    Serial.print(" m/s  gercek 100 cm -> ");
    Serial.print(okunan, 1);
    Serial.println(" cm");
  }
}

void loop() {
}
```

Let's check with numbers: at 20 °C, c = 331.3 + 0.606 × 20 = 343.42 m/s; that is very close to 343, an error of about 0.1 cm. At 0 °C, c = 331.3 m/s and the sensor reads 100 cm as 103.5 cm. At 40 °C, c = 355.54 m/s and the sensor reads 96.5 cm. So a 40 degree change in temperature makes a difference of about 7 cm over 1 metre. For jobs like a parking sensor this is usually acceptable. If you need centimetre accuracy, you measure the temperature and put it into the formula (the NTC from lesson 13 helps).

### How does it work?
1. `SES_CM_US` holds the speed of sound in centimetres per microsecond. Doing the unit conversion in one place lowers the risk of mistakes.
2. `sureler[i] * SES_CM_US / 2.0` turns the there-and-back time into a one-way distance. We wrote `2.0` so the division is done with decimals (integer division throws the fraction away).
3. `Serial.print(cm, 1)` prints the number with 1 digit after the decimal point.
4. The `sesHizi` function takes the temperature and returns c in m/s. The ratio `okunan = 100 × 343 / c` is the result of the sensor's wrong assumption.

### Try it
- For an object 2 metres away, how many µs does ECHO stay HIGH? Work it out yourself first, then put it into the `sureler` array and compare with the program.
- Put 35 into the `sicakliklar` array. How many centimetres does a real 100 cm read as?
- Write and run the `ses_mesafe_tablosu` program in the lab; in the serial monitor, compare the centimetres for 583, 5830 and 23 320 µs with the formula.
- Do the same temperature calculation for a distance of 250 cm. Does the error in centimetres grow or shrink?

### Common mistakes
- Forgetting the `/ 2`: the distance comes out twice as large, because the sound went there and came back.
- Mixing up units: putting 343 m/s into the cm/µs formula as 343. Convert to the same unit first.
- Not knowing about temperature at all: a parking sensor that works on a hot day can drift a few centimetres in a cold garage. (The HC-SR04 in the lab works with a fixed speed of sound (about 58 µs/cm); this drift only shows up on a real sensor.)
- Dividing with integers instead of `100 * 343 / c`: the result has no fraction. Write it with decimals (`100.0`).

## Discuss
If an object is 10 cm from the sensor, about how many µs does ECHO stay HIGH? If there is no object, so the sound never comes back, what happens to ECHO?

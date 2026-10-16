# pulseIn, trig/echo and working out centimetres
duration: 25

## Wonder
In the last lesson you learnt that the sensor gives us a time, not a distance: how many microseconds the ECHO pin stays HIGH. But `loop()` goes round thousands of times a second. How does the board measure the time between a pin going HIGH and dropping back to LOW, accurate to the microsecond? And if no echo ever comes back, won't it wait for ever?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |
| HC-SR04 GND | Uno **GND** |
| LED + 330 Ω resistor (second program) | Uno **D13** → resistor **1**; resistor **2** → LED **A**; LED **K** → Uno **GND** |

Select the sensor and change the **Distance** value in the right panel to move "the object" closer or farther away; you can do this while the program is running, too.

### The three steps of a measurement
1. **Trigger:** hold TRIG LOW for 2 µs (a clean start), then HIGH for 10 µs, then LOW again. This 10 µs pulse tells the sensor "measure". For waiting in microseconds you use `delayMicroseconds()` (`delay` works in milliseconds).
2. **Measure the time:** `pulseIn(pin, HIGH, zamanAsimi)` waits for the pin to go HIGH and returns how long it stayed HIGH, in microseconds.
3. **Convert:** time × 0.0343 / 2 = centimetres (lesson 36).

The third parameter of `pulseIn` is the **timeout**: if the pulse does not finish within this time, `pulseIn` returns **0**. This is what stops the program hanging for ever when there is no object or the echo does not return to the sensor. We chose 30 000 µs (30 ms); this matches about 5 metres and comfortably covers the sensor's 4 metre limit.

### Program 1: the first measurement
```cpp
// sketch: mesafe_pulsein
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);       // 10 us'lik tetik darbesi
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  unsigned long sure = pulseIn(ECHO, HIGH, 30000);   // us; en çok 30 ms bekle

  if (sure == 0) {
    Serial.println("Yansima yok (menzil disi)");
  } else {
    float cm = sure * 0.0343 / 2.0;
    Serial.print("sure=");
    Serial.print(sure);
    Serial.print(" us  mesafe=");
    Serial.print(cm, 1);
    Serial.println(" cm");
  }
  delay(200);
}
```

### How does it work?
1. `TRIG` is an output and `ECHO` is an input. The board gives the command, the sensor gives the answer.
2. The three-line trigger (LOW, HIGH for 10 µs, LOW) starts the sensor measuring. Inside, the sensor sends out its burst of sound and raises ECHO.
3. `pulseIn(ECHO, HIGH, 30000)` returns how long ECHO stays HIGH. In a typical 100 cm measurement this is about 5800 µs.
4. If `sure == 0`, no echo came back. Working out 0 as a distance would print "0 cm", which would be wrong.
5. `delay(200)` puts a pause between measurements. A pause is left between measurements so that a new one does not start before the echo of the previous one has died away; datasheets usually suggest about 60 ms between measurements.

`pulseIn` is **blocking**: until the measurement finishes, the program does nothing else. At 100 cm it takes 6 ms, but with no echo it waits the full 30 ms. Remember the `millis()` idea from lesson 27: if you measure often, there is less time left for buttons and the screen. That is why we will put the measurement in a function and call it at set intervals with `millis()`.

The type of the time variable matters: `pulseIn` returns an `unsigned long`. If you use `int`, it overflows at 32 767 µs and large distances become negative numbers.

### Program 2: a function and an LED
Let's move the measurement into a function called `mesafeOku()` (read distance). If there is no echo, it returns `-1`. The main program measures every 100 ms and lights the LED if the object is closer than 30 cm.

```cpp
// sketch: mesafe_fonksiyon_led
const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;
const unsigned long OLCUM_ARALIGI = 100;   // ms

unsigned long sonOlcum = 0;

float mesafeOku() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return -1;                 // yansıma yok
  return sure * 0.0343 / 2.0;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    float cm = mesafeOku();
    digitalWrite(LED, cm >= 0 && cm < 30);  // yakın ve geçerli ölçüm
    Serial.println(cm);
  }
}
```

The condition `cm >= 0 && cm < 30` stops the value `-1` (no echo) from counting as "less than 30" and lighting the LED. This small detail can be vital in safety jobs like a parking sensor.

### A ready-made library: NewPing
There is also a library that does this job for you: **NewPing**. You tell it the TRIG and ECHO pins and the largest distance, then call `ping()`; it returns the time in microseconds (0 if there is no echo).

```cpp
// sketch: newping_ornek
#include <NewPing.h>

NewPing sonar(9, 10, 400);   // TRIG, ECHO, en büyük mesafe (cm)

void setup() {
  Serial.begin(9600);
}

void loop() {
  delay(100);
  unsigned int sure = sonar.ping();          // us; yansıma yoksa 0
  Serial.print("sure=");
  Serial.print(sure);
  Serial.print(" us  mesafe=");
  Serial.print(sure * 0.0343 / 2.0, 1);
  Serial.println(" cm");
}
```

NewPing's `ping_cm()` function gives whole centimetres directly; because it uses its own fixed 57 µs per 1 cm, its result can differ from our 0.0343 formula by a few per cent (in the lab, `ping_cm()` gave 102 for a distance of 100 cm). In this module we will carry on with `pulseIn`, because the real goal is to see the time, trigger and conversion steps. A library makes the job shorter, but knowing what is inside it is your job.

### Try it
- While the `mesafe_pulsein` program is running, set Distance in the properties panel to 5 cm first, then to the lowest value, 2 cm. Is the reading right? According to the datasheet, objects closer than 2 cm cannot be measured; the panel does not go below 2 cm anyway.
- To see the "no echo" case, stop the program with ■, delete the ECHO wire and press ▶ again. What does it print? What would happen without the timeout?
- Write `delay(20)` instead of `delay(200)`. Does the measurement change in the lab? On a real sensor, why does the pause between measurements matter? (If a new measurement starts before the echo of the previous one has faded, the two can get mixed up.)
- In the `mesafe_fonksiyon_led` program, make the LED's threshold 15 cm. Then write the threshold as a constant so you can change it from outside the code.

### Common mistakes
- Not setting a timeout: `pulseIn(ECHO, HIGH)` waits 1 second by default; with no echo, the program looks as if it has frozen.
- Making the trigger pulse too short or too long: the sensor may not measure. Stick to 10 µs.
- Not checking for `sure == 0`: the distance shows as "0 cm" and the LED or buzzer behaves wrongly.
- Using `int` for `sure`: it overflows above 32 767 µs.
- Swapping TRIG and ECHO: no measurement comes in and you always read 0.
- Connecting ECHO straight to a 3.3 V board: the HC-SR04's ECHO output is 5 V. That is fine on the Uno, but if you move to other boards you need a voltage divider.

## Discuss
`pulseIn` makes the program wait during a measurement. If you also had to manage a button and a screen in the same program, how would you take the measurement? What would be the cost of measuring less often?

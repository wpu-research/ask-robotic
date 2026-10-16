# PIR: motion detection and warm-up time
duration: 20

## Wonder
You have seen lights at a shop entrance that switch on by themselves as you approach the door, and lamps in a corridor that light up as you walk past. There is no button and no camera. How does this device "notice" you? And why does it sometimes react in silly ways just after it is plugged in?

## Activity
### What is a PIR?
A PIR (passive infrared) sensor detects **changes in the infrared (heat) radiation** around it. When a warm object (a person, an animal) moves in the sensor's field of view, the radiation changes and the sensor sets its output HIGH. An object that stands still, or a room temperature that changes slowly, does not create this change. "Passive" means it sends no light itself, it only listens (the ultrasonic sensor in lesson 36, on the other hand, sent out sound and waited for it to come back).

A PIR module has three pins: VCC, OUT, GND. On real modules the supply voltage depends on the module (check the datasheet); the PIR in the lab works on 5 V. For the Arduino, the OUT pin is just a simple digital input: HIGH when there is motion, LOW when there is none.

Most real modules have two adjustment screws and a jumper. The screws usually set the detection sensitivity and how long the output stays HIGH; the jumper turns on or off whether the output is extended while motion continues ("retriggering"). Which screw does what **depends on the module**. The PIR in the lab has no screws; it holds its output HIGH for **3 seconds** after the motion ends.

**Warm-up time:** When a PIR is switched on, it waits for a while to get used to its surroundings. During this time its output can go HIGH and LOW at random. On real modules this time is usually around half a minute to a minute, but it **depends on the module**. To speed up the lesson, the lab shortens it to **2 seconds**: in the first 2 seconds after you press ▶, the output jumps about noisily and the **Motion** box is ignored. That is why, in applications such as alarms, we ignore the PIR for a while after start-up.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| PIR | VCC → 5V, GND → GND, OUT → **D2** |
| Resistor (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → resistor pin 2, K → GND |

To give the PIR some motion, select the part and tick the **Motion** box in the properties panel; when you untick the box, the motion ends. You can also change it while the circuit runs.

Because the PIR's OUT pin carries its own voltage, we do not use `INPUT_PULLUP`; plain `INPUT` is enough.

### Program
First the warm-up, then edge detection (the "catch the change" idea from lessons 6 and 8 still applies). In the lesson's sketch we set the warm-up to 5 seconds; since the lab's own warm-up is 2 seconds, the sketch's wait is enough. On a real module you need to make this time longer.

```cpp
// sketch: pir_isinma
const int PIR = 2;
const int LED = 13;
const unsigned long ISINMA_MS = 5000;   // gerçek modülde daha uzun tut

bool oncekiHareket = false;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Isiniyor...");
  while (millis() < ISINMA_MS) {              // ısınma bitene kadar PIR'ı yok say
    digitalWrite(LED, (millis() / 250) % 2);  // LED hızlı yanıp söner
  }
  digitalWrite(LED, LOW);
  Serial.println("Hazir");
}

void loop() {
  bool hareket = (digitalRead(PIR) == HIGH);
  if (hareket && !oncekiHareket) {
    Serial.println("Hareket var");
  }
  if (!hareket && oncekiHareket) {
    Serial.println("Hareket bitti");
  }
  oncekiHareket = hareket;
  digitalWrite(LED, hareket);
}
```

A PIR stays HIGH for a while after motion. Sometimes this time is too short or too long for us. If we want to know whether a room is occupied or empty, we can check the condition "no new motion for 3 seconds after the last motion" in software ourselves. This is the `millis()` method from lesson 27:

```cpp
// sketch: pir_oda_dolu
const int PIR = 2;
const int LED = 13;
const unsigned long BOS_SURE = 3000;   // ms: bu kadar sessizlikten sonra oda "boş"

bool odaDolu = false;
unsigned long sonHareket = 0;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  if (digitalRead(PIR) == HIGH) {
    sonHareket = simdi;                 // hareket sürdükçe sayacı yenile
    if (!odaDolu) {
      odaDolu = true;
      Serial.println("Oda dolu");
    }
  }

  if (odaDolu && simdi - sonHareket >= BOS_SURE) {
    odaDolu = false;
    Serial.println("Oda bos");
  }

  digitalWrite(LED, odaDolu);
}
```

### How does it work?
1. In `pir_isinma`, `setup()` does not return until the warm-up has finished. Meanwhile the LED blinks quickly; the user gets the message "do not move now".
2. In `loop()` only the **edges** are printed: the change from LOW to HIGH prints "Hareket var" (motion detected), the change from HIGH to LOW prints "Hareket bitti" (motion ended). Otherwise a message would be printed on every pass.
3. `pir_oda_dolu` does not send the sensor output straight to the LED. Every time motion is seen, `sonHareket` is refreshed. The room only becomes "empty" if no motion is seen for `BOS_SURE`. Even if the sensor output drops to LOW for a moment, the room is not counted as empty straight away.
4. The time comparison uses subtraction (`simdi - sonHareket`). You saw why in lesson 27.

### Try it
- With `pir_isinma`, tick the **Motion** box within the first 5 seconds after pressing ▶. Is anything printed? Tick it after the warm-up has finished; what happens now?
- Delete the warm-up waiting loop in `pir_isinma` and watch the serial monitor during the first 2 seconds. You will see "Hareket var" even when there is no motion; this is warm-up noise.
- Set `BOS_SURE` to 1 second and to 10 seconds. Because the PIR in the lab already holds its output HIGH for 3 seconds after the motion ends, `BOS_SURE` is added **on top** of that. Which value suits someone sitting in a room and moving very little?
- Measure the gap between the moment you untick the box and the moment the "Hareket bitti" message arrives, using `Serial.println(millis())`. How many seconds is it?

### Common mistakes
- Not waiting for the warm-up: the false HIGHs just after start-up set off the alarm.
- Reading the PIR with `INPUT_PULLUP`, or writing the logic the wrong way round: on a PIR the output is HIGH when there is motion, not LOW as with a button.
- Printing a message on every pass: without an edge check the Serial Monitor overflows.
- Placing the sensor at a sunny window, or in front of a radiator or air conditioner: heat changes can look like motion.
- Not connecting the PIR's VCC or GND pin: the module gets no power, its output stays LOW all the time and the lab shows a "not powered" warning.

## Discuss
If someone is sleeping in their room without moving at all, does that mean "nobody is there" for the PIR? What other situations might a PIR not see, and how could an alarm system make up for this?

# The IR obstacle sensor and setting the threshold
duration: 20

## Wonder
Who counts the boxes passing along a conveyor belt in a factory? And how does an automatic soap dispenser know your hand is there? Most of them have the same cheap part: an infrared LED and a receiver waiting for its reflection. This part answers the question "how close?" with yes or no. Who decides the threshold?

## Activity
### What is an IR obstacle sensor?
An IR obstacle (obstacle avoidance) module sends out infrared light and catches the reflected light with a receiver. If there is an object in front of it, the light comes back and the module changes its output. The ultrasonic sensor in lesson 36 measured distance **in centimetres**; this module only says "obstacle / no obstacle".

On the real module there is a small adjustment screw (a trimpot). This screw sets **how much reflection counts as an "obstacle"**, that is, it sets the threshold in hardware. The detection distance depends on the screw, the surroundings and the colour and surface of the object; light-coloured, matt surfaces are usually detected more easily, while dark and shiny surfaces can be hard. The exact values **depend on the module**.

The IR obstacle part in the lab has two sliders instead of a distance: **Proximity** (0-1, how much reflection the object gives; as it grows, the AO voltage rises) and **Threshold (trimmer)** (0-1). When the proximity reaches or passes the threshold, an obstacle is detected. Raising the threshold makes the screw "less sensitive".

**Output level:** On common modules the output is LOW when there is an obstacle and HIGH when there is none. But this **can depend on the module**: some modules do the opposite. That is why we will put the level into a constant in the code. The part in the lab follows the common layout: OUT is LOW when there is an obstacle and HIGH when there is none.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| IR obstacle | VCC → 5V, GND → GND, OUT → **D3** |
| Resistor (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → resistor pin 2, K → GND |
| (For the analogue program) IR obstacle | AO → **A0** |

Because the module drives its output itself, we use `INPUT`.

### Program
```cpp
// sketch: ir_engel
const int IR = 3;
const int LED = 13;
const int ENGEL_SEVIYESI = LOW;   // modülüne göre HIGH olabilir

void setup() {
  pinMode(IR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);
  digitalWrite(LED, engel);
  Serial.println(engel ? "Engel var" : "Engel yok");
  delay(200);
}
```

The module's output sometimes jitters for a moment at the edge. If we want to **count** objects, we use the idea from lesson 8: a change is only accepted if it stays stable for a certain time. After that, one object passing becomes a single count:

```cpp
// sketch: ir_sayac_kararli
const int IR = 3;
const int ENGEL_SEVIYESI = LOW;
const unsigned long KARARLI_MS = 30;

bool kararliEngel = false;      // kabul edilmiş durum
bool sonOkunan = false;         // en son okunan ham durum
unsigned long sonDegisim = 0;
int sayac = 0;

void setup() {
  pinMode(IR, INPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);

  if (engel != sonOkunan) {          // ham okuma değişti: sayacı başa al
    sonOkunan = engel;
    sonDegisim = simdi;
  }

  if (sonOkunan != kararliEngel && simdi - sonDegisim >= KARARLI_MS) {
    kararliEngel = sonOkunan;        // yeterince kararlı: kabul et
    if (kararliEngel) {              // engel geldi: bir cisim say
      sayac++;
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
}
```

Some modules also have an **analogue output (AO)** as well as the digital output. Then you choose the threshold yourself in software. Which way it changes (whether the value rises or falls when there is an obstacle) depends on the module. In the example below we assumed "high value = obstacle close"; the part in the lab works this way too. On a real module you need to look with `Serial.println(analogRead(A0))` and swap the conditions if it is the other way round. We use two separate thresholds (**hysteresis**, like the thermostat in lesson 35): even if the value wobbles around the threshold, the output does not flicker.

```cpp
// sketch: ir_analog_esik
const int AO = A0;
const int LED = 13;
const int ESIK_YUKSEK = 600;   // bunun üstünde engel var say
const int ESIK_ALCAK = 500;    // bunun altında engel yok say

bool engel = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(AO);
  if (!engel && deger >= ESIK_YUKSEK) {
    engel = true;
    Serial.println("Engel var");
  } else if (engel && deger <= ESIK_ALCAK) {
    engel = false;
    Serial.println("Engel yok");
  }
  digitalWrite(LED, engel);
  delay(20);
}
```

### How does it work?
1. `ir_engel`: the `ENGEL_SEVIYESI` (obstacle level) constant tells you the module's "obstacle" level. The rest of the code relies on this constant; if your module is the other way round, you change a single line.
2. `ir_sayac_kararli`: the moment the raw reading changes, the timer is reset. If the change lasts for 30 ms, it is accepted. Counting is done only on the "obstacle arrived" edge; so an object that stays for a long time is counted once.
3. `ir_analog_esik`: if the value stays between the two thresholds, the previous state is kept. So even if the value wobbles around 550, the output does not change.
4. The hardware screw and the software threshold are two separate places. For the digital output the threshold is set on the screw; for the analogue output it is set in the code.

### Try it
- While the `ir_engel` program runs, select the IR obstacle part and slowly drag the **Proximity** slider from 0 towards 1. At which value do the LED and the serial monitor change? Is this value equal to the **Threshold** value?
- Set the proximity to 0.6, then raise **Threshold (trimmer)** to 0.8. Is the obstacle ignored? A shiny black surface behaves like this in real life too: it gives little reflection, so it may not pass the threshold.
- With `ir_analog_esik`, set the proximity to 0.3 - 0.5 - 0.7. What happens to the state at 0.5? First go from 0.7 to 0.5, then from 0.3 to 0.5, and compare the results; this is hysteresis.
- Set `KARARLI_MS` in `ir_sayac_kararli` to 0. Because the lab model produces no jitter, the counter does not go wrong. On a real module it could; write in your own words why this waiting time is still needed for a real circuit.

### Common mistakes
- Thinking "the output is LOW when there is an obstacle" is true for every module: check the documentation of your real module.
- On real hardware, pointing the sensor straight at sunlight or a strong lamp: the infrared in the ambient light can spoil the measurement (the lab does not model this).
- Using a single threshold for the analogue value: when the value wobbles around the threshold, the output keeps changing.
- Counting the level instead of the edge when counting: an object that stays still is counted again and again.
- Expecting a single threshold to sort out both distance and colour: an IR sensor is sensitive to the colour and surface of the object.

## Discuss
When counting on a conveyor belt, if two boxes pass very close together, the sensor counts them as one box. How could you solve this: with software, or by moving the sensor?

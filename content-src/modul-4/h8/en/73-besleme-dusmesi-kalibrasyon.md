# Supply drop and calibration
duration: 30

## Wonder
Real circuits have a strange habit: when a motor starts, the board restarts by itself, or as the battery gets weaker, the sensor numbers slowly drift. Nothing changed in the code; what changed is the **voltage that powers the sensor**. So how much of this can you see in the lab, and what should you do about the rest?

## Activity
### The lab's power model
The lab really models some things about power:
- **The sensors' minimum supply voltage.** Parts such as the HC-SR04 and the PIR do not respond if they are powered below 4 V. Parts such as the DHT, BMP280 and MPU6050 work from about 3 V. The MQ-2 module needs 4 V.
- **The output of analogue modules is in proportion to the supply voltage.** On the soil moisture, sound, flame and MQ-2 modules, the AO output is the VCC voltage times a ratio. If VCC drops, AO drops too.
- **The internal resistance of an Uno pin.** In the lab, an output pin behaves like an internal resistance of about 25 Ω; as it takes load, the pin's voltage drops from 5 V.
- **The pin current limit.** If more than 40 mA flows through a pin, the lab gives a warning.

The lab does **not model**:
- **The 5 V line collapsing.** In the lab, the Uno's 5V and 3V3 pins are ideal supplies: however much current a motor, servo or relay draws, the voltage does not drop.
- **Brown-out reset.** The board does not restart itself because the supply dropped. (You press the ↺ Reset button yourself.)
- **Power line noise, the effect of capacitors, wire resistance.**

So the sentence "in the lab the board did not reset while the motor was running" proves nothing for a real circuit. In reality, steps such as powering the motor and the relay from a separate supply, a common GND and a capacitor on the supply line are solutions outside the code. In the lab, in this section, we will only work with the parts that are modelled.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Soil moisture module | VCC → **5V**, GND → **GND**, AO → **A0** |

### 1) The supply voltage spoils the measurement
In the lab, the soil moisture module's AO output has the form `VCC × (0,9 − 0,6 × nem)` (where `nem`, the moisture, is 0-1). With VCC left at 5V, AO gives 4.5 V in dry soil (moisture 0) and 1.5 V in wet soil (moisture 1). If you move VCC to **3V3**, the module still works (it is above the 3 V threshold), but in the same dry soil AO becomes 3.3 × 0.9 = 2.97 V and `analogRead` shows about 608. Same sensor, same soil; a very different number.

This gives us the first rule of calibration: **a calibration depends on the measuring conditions.** If the supply voltage changes, the old calibration gives the wrong result.

### 2) Two-point calibration
To turn the raw ADC value into a meaningful unit, two known ends are measured: what does the sensor read when it is dry and when it is wet? Then these two ends are mapped to 0 and 100 with `map` (lesson 14).

1. Select the sensor and set the **Soil moisture** value to 0 in the properties panel (completely dry), and write down the `Ham` (raw) value read on the Serial monitor.
2. Set the soil moisture to 1 (completely wet), and write down the `Ham` value.
3. Use these two values as constants in the code.

The sketch below works out a percentage with these constants. The constants were read in the lab with a 5V supply:

```cpp
// sketch: nem_kalibrasyon
const int SENSOR = A0;
const int KURU = 921;     // nem 0 iken okunan ham değer
const int ISLAK = 307;    // nem 1 iken okunan ham değer

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENSOR);
  int yuzde = map(ham, KURU, ISLAK, 0, 100);
  yuzde = constrain(yuzde, 0, 100);       // uçların dışına taşan değerleri kırp
  Serial.print("Ham=");
  Serial.print(ham);
  Serial.print(" Nem: ");
  Serial.print(yuzde);
  Serial.println("%");
  delay(500);
}
```

Because `KURU` (dry) is big and `ISLAK` (wet) is small, the first range of `map` was written "backwards": `map` handles backwards ranges correctly too. Without `constrain`, a value drier than dry would go below 0%, and a value wetter than wet would go above 100%. When you set the soil moisture to 0.5, the module's AO becomes 3.0 V, `Ham` reads about 614 and the program prints about 50%.

Now move the VCC of the same sketch to 3V3 (■ Stop, move the wire, ▶). With the soil moisture at 0.5, `Ham` becomes about 405 and the program prints almost 84%: the calibration was made for the old condition. The fix is to repeat the calibration in the new condition, or to keep the supply voltage constant.

### 3) Pin voltage under load
If you use one of the Uno's pins as a supply and connect a load to it, the pin voltage drops because of the internal resistance. Try it in the lab: connect D13 to a 220 Ω resistor and the other end of the resistor to GND; in the program, do `digitalWrite(13, HIGH)`. While it runs, select the resistor: the **Virtual meter** shows about 4.5 V across the resistor and about 20 mA. The pin's internal resistance (about 25 Ω) and the 220 Ω are in series, and the 5 V is shared between them: 5 × 220 / 245 ≈ 4.49 V. If you make the resistor 47 Ω, the pin voltage drops to about 3.26 V, the current becomes about 69 mA, and the lab gives a "pin overcurrent" warning (the limit is 40 mA).

### 4) What happens if the sensor is not powered? Safe behaviour
When the supply is missing or low, the sensor usually **does not give an error; it stays silent.** On the HC-SR04, this means `pulseIn` returns 0. The sketch below prints "YOK" (none) when 0 comes back and switches the LED off; in other words, in an unknown situation it keeps the dangerous output **off** (fail-safe):

```cpp
// sketch: mesafe_veya_yok
const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);     // 30 ms'de cevap gelmezse 0 döner
  if (sure == 0) {
    Serial.println("YOK");
    digitalWrite(LED, LOW);                   // bilinmiyorsa uyarı yakma, güvenli tarafta kal
  } else {
    float cm = sure / 58.0;
    Serial.print(cm, 1);
    Serial.println(" cm");
    digitalWrite(LED, cm < 20 ? HIGH : LOW);
  }
  delay(100);
}
```

Try it: connect the HC-SR04's VCC to **3V3** instead of 5V. Because the sensor stays below 4 V, it does not respond, and you see `YOK` all the time on the Serial monitor. In this case the lab also shows an "unpowered" warning on the sensor. In reality, though, a sensor sometimes works half-heartedly and gives strange values; that is why we will ask the question "is the value sensible?" separately in lesson 74.

### Real-world knowledge: why does the board reset?
A microcontroller has a circuit called a **brown-out detector**: when the supply goes below a certain threshold, it resets the processor, because below the threshold there is no guarantee that the code runs reliably. The big current a motor or relay draws as it starts can pull the voltage below this threshold on a weak supply. The sign is that the board goes back to the start every time the motor starts; on the Serial monitor you see the start-up message from `setup()` again and again. This is not a bug fixed with code; it is solved in the circuit with a separate supply, a capacitor and a common GND. This does not happen in the lab. An easy way to notice a restart in a real circuit is to print a start-up message inside `setup()`.

### How does it work?
1. `nem_kalibrasyon` (moisture calibration) maps the two measured ends to 0-100 with `map`; `constrain` cuts off overflows.
2. The same constants give the wrong result at a different supply voltage, because the AO voltage is in proportion to VCC.
3. The pin voltage is a voltage divider of the internal resistance and the load resistance (lesson 12).
4. `mesafe_veya_yok` (distance or none) catches the silent sensor with the `pulseIn` timeout and leaves the output on the safe side.

### Try it
- In `nem_kalibrasyon`, raise the soil moisture from 0 to 1 in steps of 0.1. Does the percentage go up in a straight line?
- Deliberately write the `KURU` and `ISLAK` constants wrongly (for example 800 and 400). At which soil moisture values do 0% and 100% now appear?
- In `mesafe_veya_yok`, change the `30000` timeout to 3000 and set the distance to 100 cm. The sensor is working, so why does the program print "YOK"? (Hint: for 100 cm the echo time is about 5800 µs.)

### Common mistakes
- Calibrating under one supply condition and using it under another.
- Not clipping the end values with `constrain`: the percentage goes below 0 or above 100.
- Saying "the 5V line did not collapse in the lab, so I can power the motor from the board".
- Taking it as a distance of 0 when the sensor does not respond (`pulseIn` 0) and setting off the alarm.

## Discuss
In this lesson you saw that sensor numbers drift when the supply voltage changes. After calibrating a sensor, which conditions do you need to be sure have not changed? Which of them can you not control in your measuring set-up?

# The voltage divider and the LDR
duration: 25

## Wonder
An Arduino cannot measure resistance; it can only measure voltage. So how will we tell whether a part whose resistance changes with light (an LDR) is in the dark or in the light? The answer is a small trick built with two resistors: the voltage divider.

## Activity
### The voltage divider
Imagine two resistors connected in series. The top one, R1, is connected to 5 V and the bottom one, R2, to GND. We take the voltage from the point in the middle.

- The current flowing through the circuit: I = Vin / (R1 + R2)
- The voltage across R2: Vout = I × R2

Putting these two together:

`Vout = Vin × R2 / (R1 + R2)`

Examples (Vin = 5 V, R1 = 10 kΩ):

| R2 | Vout |
|---|---|
| 1 kΩ | 5 × 1 / 11 ≈ 0.45 V |
| 10 kΩ | 5 × 10 / 20 = 2.50 V |
| 100 kΩ | 5 × 100 / 110 ≈ 4.55 V |

As R2 gets bigger, the output voltage gets bigger. If the two resistors are equal, it is exactly in the middle, that is 2.5 V. You can check these numbers with the small sketch below.

```cpp
// sketch: bolucu_hesap
float vin = 5.0;
float r1 = 10000.0;
float r2[] = {1000.0, 10000.0, 100000.0};

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    float vout = vin * r2[i] / (r1 + r2[i]);
    Serial.print("R2=");
    Serial.print(r2[i], 0);
    Serial.print(" Vout=");
    Serial.println(vout, 2);
  }
}

void loop() {
}
```

### LDR
The resistance of an LDR (light-dependent resistor) goes down as more light falls on it. The values vary from part to part; roughly, it is hundreds of kΩ in the dark, and between a few hundred Ω and a few kΩ in bright light. You can read the value of the LDR in the lab with the sketch below: when you move the light slider, the resistance changes.

If we make the LDR the top resistor (R1) of the divider, the fixed 10 kΩ resistor becomes R2:

- Light: the LDR is small, R2 dominates, Vout is **high**.
- Dark: the LDR is large, Vout is **low**.

To find the LDR's resistance from the measured Vout, we turn the formula around:

`R_ldr = 10 kΩ × (5 − Vout) / Vout`

Written with the ADC value: `R_ldr = 10000 × (1024 − ham) / ham`.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. When you select the LDR and the resistor, you can set the LDR's **Light** slider and the resistor's value (10000 Ω) in the properties panel.

| Part | Connection |
|---|---|
| LDR | Leg 1 → 5V; leg 2 → **A1** |
| 10 kΩ resistor | Leg 1 to **A1**, leg 2 to GND |
| LED (red) | **A** (anode) → leg 2 of the 330 Ω resistor; **K** (cathode) → GND |
| 330 Ω resistor | Leg 1 to **D13**, leg 2 to the LED's **A** leg |

### Program
First, let's print the light and the LDR's resistance.

```cpp
// sketch: isik_oku
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A1);
  float volt = ham * 5.0 / 1024.0;
  float rLdr = 0;
  if (ham > 0) {
    rLdr = 10000.0 * (1024 - ham) / ham;
  }
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" volt=");
  Serial.print(volt, 2);
  Serial.print(" R_ldr=");
  Serial.println(rLdr, 0);
  delay(500);
}
```

Now let's make a system that turns the LED on when it gets dark. Careful: if we use a single threshold, the LED keeps blinking on and off while the light is close to the threshold. To prevent this we use two thresholds: turn it on below 250, turn it off above 350. In the zone between them, the LED keeps its previous state. This is called **hysteresis**.

```cpp
// sketch: karanlik_esik
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  int ham = analogRead(A1);
  if (ham < 250) {
    digitalWrite(13, HIGH);   // karanlık: yak
  } else if (ham > 350) {
    digitalWrite(13, LOW);    // aydınlık: söndür
  }
  delay(50);
}
```

### How does it work?
1. The LDR and the 10 kΩ resistor form a voltage divider. A1 measures the voltage at the point between the two.
2. When the light increases, the LDR's resistance drops, and the voltage on A1 and the `ham` value go up.
3. In the `if / else if` chain, if neither of the two conditions is true (between 250 and 350), the pin is not touched and the LED stays as it was.
4. If the fixed resistor is chosen close to the LDR's middle value (here 10 kΩ), the measuring range is at its widest.

### Try it
- Pull the LDR's **Light** slider all the way to the left (dark). How far does `ham` drop? Then pull it all the way to the right (light). What is the highest value?
- Adjust the 250 and 350 thresholds yourself, based on the dark and light values you read with `isik_oku`.
- Swap the places of the LDR and the 10 kΩ resistor in the circuit. How does `ham` change as the light increases? Why?

### Common mistakes
- Forgetting the fixed resistor: the LDR sits directly between 5 V and A1, the pin is left "floating" and the measurement becomes meaningless.
- Swapping the places of the LDR and the fixed resistor: the circuit works, but the `ham` value goes down as the light increases. The program's logic is reversed, so watch out for this.
- Choosing a very small fixed resistor (for example 100 Ω): Vout stays at almost 0 V all the time, and the range becomes narrow.
- Using a single threshold and being surprised when the LED flickers at the threshold.

## Discuss
If we made the fixed resistor 1 kΩ, what would the voltage on A1 be in the dark (when the LDR is very large)? Why would this divider be worse at telling differences in light apart?

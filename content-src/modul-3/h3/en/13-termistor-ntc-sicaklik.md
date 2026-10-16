# The thermistor (NTC) and calculating temperature
duration: 25

## Wonder
Inside a temperature sensor there is nothing that "knows" the temperature. There is only a part whose resistance changes. So how do we get from that resistance value to the result "23.5 degrees"?

## Activity
### The NTC thermistor
An **NTC** (Negative Temperature Coefficient) thermistor is a resistor whose resistance **goes down** as the temperature rises. A very common type is the "10k NTC", which is 10 kΩ at 25 °C. The way the resistance changes with temperature is not linear; it follows an exponential curve.

We read the sensor with a voltage divider (previous lesson). The NTC becomes the bottom resistor (R2); the top resistor is a fixed 10 kΩ resistor:

`Vout = 5 × R_ntc / (10 kΩ + R_ntc)`

Turning it around with the ADC value, the NTC's resistance is:

`R_ntc = 10000 × ham / (1024 − ham)`

When the temperature rises, the NTC's resistance drops, and so does the voltage on A2.

### From resistance to temperature: the beta formula
The most common method is the **beta** formula. You need two numbers for the part, and both are written in the datasheet:

- R0: the resistance at the reference temperature (for us, 10 000 Ω at 25 °C)
- B: the part's beta coefficient (on popular 10k NTCs it is often 3950, but there are other values such as 3435; for a real part you read the value from the datasheet. The NTC in the lab is modelled as 10 kΩ and B = 3950)

With T the temperature in Kelvin, and T0 = 25 + 273.15 = 298.15 K:

`1/T = 1/T0 + ln(R / R0) / B`

Then convert to Celsius: `°C = T − 273,15`. `ln` is the natural logarithm; on the Arduino the `log()` function gives it.

The values the formula gives for R0 = 10 kΩ, B = 3950:

| Temperature | NTC resistance |
|---|---|
| 0 °C | ≈ 33.6 kΩ |
| 25 °C | 10 kΩ |
| 50 °C | ≈ 3.59 kΩ |
| 100 °C | ≈ 0.70 kΩ |

On real parts these values can be off by a few per cent; the beta formula is an approximate model and it is most accurate around 25 °C. The NTC in the lab works directly with this beta model.

### The Steinhart-Hart equation
A more accurate model is the **Steinhart-Hart** equation:

`1/T = A + B × ln(R) + C × (ln(R))³`

A, B and C are three numbers specific to the part. You find them by choosing three points from the resistance-temperature table given by the manufacturer and solving the equation with three unknowns. The second sketch below does this for you inside `setup()`. As an example, it uses the points 0, 25 and 50 °C (here the R values were taken from the table above; for a real part you write the three values from your own datasheet).

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. When you select the NTC, a **Temperature** slider appears in the properties panel (-20 to 120 °C).

| Part | Connection |
|---|---|
| NTC thermistor (10 kΩ) | Leg 1 → **A2**; leg 2 → GND |
| 10 kΩ resistor | Leg 1 → 5V; leg 2 → **A2** |

### Program
```cpp
// sketch: ntc_sicaklik
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A2);
  if (ham <= 0 || ham >= 1023) {
    Serial.println("sensor hatasi");   // kopuk ya da kisa devre
  } else {
    float r = 10000.0 * ham / (1024.0 - ham);               // NTC direnci
    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    float tC = tK - 273.15;
    Serial.print("R=");
    Serial.print(r, 0);
    Serial.print(" T=");
    Serial.println(tC, 1);
  }
  delay(500);
}
```

The version that does the same measurement with Steinhart-Hart:

```cpp
// sketch: ntc_steinhart
float A, B, C;

void setup() {
  Serial.begin(9600);
  // Üç nokta: (direnç, sıcaklık)  0 C, 25 C, 50 C
  float l1 = log(33620.0), l2 = log(10000.0), l3 = log(3588.0);
  float y1 = 1.0 / 273.15, y2 = 1.0 / 298.15, y3 = 1.0 / 323.15;
  float g2 = (y2 - y1) / (l2 - l1);
  float g3 = (y3 - y1) / (l3 - l1);
  C = (g3 - g2) / (l3 - l2) / (l1 + l2 + l3);
  B = g2 - C * (l1 * l1 + l1 * l2 + l2 * l2);
  A = y1 - (B + C * l1 * l1) * l1;
}

void loop() {
  int ham = analogRead(A2);
  if (ham <= 0 || ham >= 1023) {
    Serial.println("sensor hatasi");
  } else {
    float r = 10000.0 * ham / (1024.0 - ham);
    float lr = log(r);
    float tK = 1.0 / (A + B * lr + C * lr * lr * lr);
    Serial.print("R=");
    Serial.print(r, 0);
    Serial.print(" T=");
    Serial.println(tK - 273.15, 1);
  }
  delay(500);
}
```

### How does it work?
1. From the `ham` value we calculate the NTC's resistance (the reverse of the voltage divider formula).
2. The beta formula gives the temperature in Kelvin from the resistance; we subtract 273.15 to convert it to Celsius.
3. If `ham` is 0 or 1023, the division goes to zero or the result becomes meaningless. These cases mean a broken connection or a short circuit; the sketch reports this as `sensor hatasi` (sensor error).
4. The Steinhart-Hart version builds the curve that passes through the three points we gave it. Between the three points it gives the same result as beta; towards the ends the two can drift apart. The part's datasheet decides which one is more accurate.

Expected temperatures for each voltage (beta formula, B = 3950):

| Voltage on A2 | ham | Temperature |
|---|---|---|
| 1.0 V | 204 | ≈ 60.0 °C |
| 1.5 V | 307 | ≈ 45.4 °C |
| 2.0 V | 409 | ≈ 34.5 °C |
| 2.5 V | 512 | 25.0 °C |
| 3.0 V | 614 | ≈ 16.2 °C |
| 4.0 V | 819 | ≈ −3.2 °C |

### Try it
- Pull the NTC's **Temperature** slider from 25 °C to 45 °C. Which way does the temperature in the Serial monitor change? How does the voltage on A2 (virtual measurement) change?
- In the properties panel, change the fixed resistor's value from 10 kΩ to 4.7 kΩ. Which number should you change in the sketch? Is the result correct at room temperature?
- Add an `if` that turns on the LED on D13 when the temperature goes above 30 °C.

### Common mistakes
- Mixing up Kelvin and Celsius: the formula gives Kelvin; if you forget to subtract 273.15, you will see numbers like 298.
- Using `log10` instead of `log`: the formula needs the natural logarithm.
- Writing a different value in the code from the fixed resistor's real value: if you write 10000 in the code and use 4.7 kΩ in the circuit, the result drifts.
- Writing `10000 * ham`: the `int` overflows. Write `10000.0 *` to do a decimal calculation.

## Discuss
Because the sensor's resistance does not change linearly, there is no straight line between the ADC value and the temperature. So why would turning the raw value directly into a temperature with `map()` not be a good idea?

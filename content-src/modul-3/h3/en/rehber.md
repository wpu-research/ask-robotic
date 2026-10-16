### Week goals
By the end of this week, the student:
1. Tells analog and digital signals apart; turns an `analogRead` value (0-1023) into a voltage (raw × 5.0 / 1024).
2. Calculates a sensor's resistance from the voltage and raw value with the voltage divider formula (Vout = Vin × R2 / (R1 + R2)).
3. Measures light with an LDR and temperature with an NTC (beta formula, Kelvin, `log`), and catches an invalid reading.
4. Makes noisy sensor data usable with `map`, `constrain`, calibration and smoothing.
5. Combines three sensors to make a smart night light.

### The week's plan
The week has five lessons. The plan is for one lesson a day; the project lesson on day 5 is longer.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | analogRead, the ADC and the potentiometer | ~20 min | Connect the pot to A0, watch the raw value and the voltage in the Serial monitor, set the LED brightness. |
| 2 | The voltage divider and the LDR | ~25 min | Do the divider calculations, build the LDR circuit, read the raw value with the light slider, try hysteresis. |
| 3 | The thermistor (NTC) and calculating temperature | ~25 min | Build the NTC circuit, compare the results of the beta formula with the table using the temperature slider. |
| 4 | map, constrain, calibration and smoothing | ~25 min | See the difference between unlimited and limited `map`, run calibration and averaging. |
| 5 | Project: Smart night light | ~35 min | Stage 1 first, then the full version; assess with the rubric. |

### Prerequisite check
Before you start, check the following:
- Is the student comfortable with Ohm's law (V = I × R) and converting mA/A and kΩ/Ω? (Week 1, lesson 2)
- Can they write `if / else if` and comparison operators? (Week 2)
- Can they print values with `Serial.begin`, `Serial.print` and `Serial.println`? (Week 2, lesson 9)
- Are the `for` loop and array indexes (starting at 0) familiar? (Week 1, lesson 4)
- Can they change part properties in the lab (the Position, Light and Temperature sliders)?

### Concept map
- **Measuring:** analog signal → ADC (10-bit, 1024 values) → `analogRead` → raw value → voltage
- **Sensor circuit:** voltage divider → LDR (resistance goes down as light increases) and NTC (resistance goes down as temperature rises) → calculating resistance → beta formula
- **Processing the data:** `map` → `constrain` → calibration → averaging and exponential smoothing
- **Decision:** threshold → hysteresis → order of priority (safety overrides normal behaviour)
- **Project:** three inputs (LDR, pot, NTC) → one output (PWM lamp) + warning LED

### Common mistakes
- **Writing `ham * 5 / 1024`.** Integer division rounds the result to 0, 1, 2. Write `5.0`.
- **Passing the `analogRead` number straight to `analogWrite`.** The ranges 0-1023 and 0-255 are different; use `ham / 4` or `map`.
- **Integer multiplication such as `10000 * ham`.** `int` is 16-bit and overflows. Write `10000.0`.
- **Swapping places in the divider.** If the LDR and the fixed resistor swap places, the light direction is reversed.
- **Using a single threshold.** The output flickers around the threshold; use two thresholds (hysteresis).
- **Writing `log10` instead of `log`.** The beta formula needs the natural logarithm.
- **Not converting Kelvin to Celsius.** Do not forget to subtract 273.15.
- **Not clipping the `map` result.** `map` does not limit; add `constrain`. `map` does not give decimals either.
- **Starting calibration with `enAz = 0`, `enCok = 1023`.** The opposite is correct.

### End-of-week review
1. Look at each lesson's concept cards and read the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Calculate by hand: the voltage for raw = 300, the LDR resistance for raw = 300 (LDR on top), the NTC resistance for raw = 400.
4. Work out `map(250, 100, 500, 0, 255)` by hand, then check it with a sketch in the lab.
5. Answer in your own words: "Why do we need a voltage divider?" and "Why is hysteresis used?"

The mini quizzes of the five lessons are enough as the end-of-week test: 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct from each lesson. Go back to the explainer of any lesson that is still weak.

### Project rubric (Smart night light)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | One of the sensors is connected without a divider, or an LED has no resistor | LDR, pot, NTC and two LEDs connected correctly | Connections are tidy, resistor values are justified |
| Brightness logic | The lamp is dim in the dark and on in the light | Bright in the dark, off in the light; `constrain` is used | Threshold values were measured with calibration |
| Potentiometer and smoothing | The pot has no effect, the lamp flickers | The pot sets the upper limit, an average is taken | Explains the effect of the smoothing method |
| Temperature protection | The temperature calculation is wrong or there is no protection | At 40 °C the lamp turns off and the warning turns on | Also handles a sensor error separately |
| Explanation | Cannot explain what they did | Explains the input-output table and the code | Explains a mistake they made, how they found it, and an improvement |

### Note for parents and teachers
- **Purpose.** This week teaches measuring: sensors report the world as a voltage, and software makes these numbers meaningful. What matters is not memorising formulas but the question "why is it like this?"
- **Difficulty.** The voltage divider and the beta formula involve maths. If the student gets stuck, suggest that they first move the slider and look at how the numbers in the Serial monitor change, and then do the calculation.
- **How to help.** Instead of giving the answer, ask: "When the light increases, which way does the raw value go?", "Is this number 0-1023 or 0-255?", "Is the calculation done with whole numbers or with decimals?"
- **Real hardware.** LDR and NTC values vary from part to part; the NTC in the lab is modelled with B = 3950, and for a real part you should check its datasheet.
- **Safety.** Everything on this platform is virtual. If a real board is used, no circuit is ever built with mains voltage (220 V); the night light project is done only with a 5 V LED.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent was given).

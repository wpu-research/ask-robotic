### Goals for the week
By the end of this week, the learner can:
1. Read temperature and humidity with the DHT11/DHT22; catch the `NaN` value with `isnan` and explain why the reading interval (at least 2 seconds) is needed.
2. Find the BMP280 by its I2C address, convert the pressure from Pa to hPa and say why the altitude depends on the sea-level pressure (P0).
3. Find the direction of soil moisture, rain and water level sensors by measuring; turn the raw value into a percentage with `map` and `constrain`.
4. Show several values on a multi-page LCD screen without using `delay`.
5. Build the weather station and watering alert project starting from a plan table; stop the alert from flickering with two thresholds (hysteresis).

### Plan for the week
The week has five lessons; the first four lessons take about 25 minutes, and the project about 35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | DHT11 and DHT22: temperature and humidity | ~25 min | Read the explainer, connect the DHT to D5, move the temperature and humidity sliders, remove the DATA wire to try the error path, do the mini test. |
| 2 | BMP280: pressure and altitude (I2C) | ~25 min | See the altitude change with the pressure slider, work out the formula by hand and compare it with the library, try the address mistake. |
| 3 | Soil moisture, rain and water level (analogue) | ~25 min | Find the direction of the three sensors from the raw numbers, save the calibration ends, print the state with thresholds. |
| 4 | A multi-page screen interface (LCD/OLED) | ~25 min | Set up the three-page screen, turn pages with the button, see the leftovers that unpadded text leaves behind. |
| 5 | Project: weather station and watering alert | ~35 min | Write the state table, build the circuit, run the program, test the alert by lowering the soil moisture, assess it with the project rubric. |

### Prerequisite check
Before starting, the learner should be able to:
- Run two jobs together without `delay`, using `millis()` (lesson 27).
- Recognise the SDA/SCL connection on the I2C bus and the idea of a device address (lesson 33).
- Use a library with `#include` (lesson 34).
- Turn a raw value into a percentage with `analogRead`, `map` and `constrain` (lessons 11 and 14).
- Know the idea of hysteresis (two thresholds) (lesson 35).
- Play a buzzer with `tone` (lesson 18).

If anything is missing, go back to the matching Module 3 lesson; lessons 27 and 35 in particular are the foundation of this week.

### Concept map
- **Environment sensors:** DHT (temperature, relative humidity) → `NaN` and `isnan` → the 2-second rule → consecutive error counter
- **Pressure:** BMP280 → I2C address (0x76/0x77) → Pa and hPa → altitude formula → P0 and the weather
- **Analogue sensors:** soil moisture, rain, water level → direction → calibration ends → `map` and `constrain` → threshold and hysteresis
- **Interface:** page variable → the `%` operator → padding the line to 16 characters → `snprintf` and `dtostrf` → OLED
- **Project:** state table → the `uyari` (alert) state → two thresholds → non-blocking buzzer → fault tolerance

### Common mistakes
- **Skipping the `isnan` check.** If the DHT cannot read, it returns `NaN`; the calculation and the screen become `nan`.
- **Reading the DHT more often than every 2 seconds.** The same old value is repeated.
- **Looking for the BMP280 with `begin()` without a parameter.** The default address is 0x77; a sensor at 0x76 is not found.
- **Mixing up Pa and hPa.** `readAltitude` expects hPa; if `101325` is written, the altitude makes no sense.
- **Assuming "big number = wet" without knowing the sensor's direction.** On the soil and rain sensors the value drops as they get wetter.
- **Forgetting `constrain`.** The percentage comes out as values such as -26 % or 130 %.
- **Not padding the line to 16 characters.** Leftovers of the old text stay on the screen.
- **Using `%f` with `snprintf`.** On the Uno, `?` is printed instead of the decimal number; `dtostrf` is used.
- **Using a single threshold and using `delay` for the beep.** The alert flickers and the program freezes.

### End-of-week review
1. Look at the concept cards of each lesson once more and read the "common mistake" lines out loud.
2. Read the explanations of the mini test questions you got wrong again, then answer the question again.
3. Connect the DHT and move the sliders while it runs; then remove the DATA wire and explain what the program prints.
4. Pull the BMP280 pressure from 1013.25 hPa to 1003.25 hPa, work out how many metres the altitude drifts, and measure it.
5. Answer this question in your own words: "Why did we use two thresholds for the alert?"

The mini tests of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct from each lesson. Go back to the explainer of any lesson where you fell short.

### Project rubric (Weather station and watering alert)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | Some parts are not connected, or the LED has no resistor | DHT, BMP280, LCD, soil sensor, LED and buzzer on the right pins | Tidy connections; the LCD and the BMP280 share the same I2C bus with their addresses |
| Plan | No state table | The normal and alert states and the thresholds are written in the table | The table matches the code exactly and every change of state is explained |
| Measurement | Values in the wrong unit, or `nan` appears | Temperature, humidity, pressure, altitude and soil percentage are correct | The calibration ends were measured on their own sensor |
| Alert | The alert flickers or does not work at all | With two thresholds the alert switches on and off correctly; the message is written only when the state changes | There is an extra improvement (for example a silence button) |
| Robustness | The program crashes when a sensor is removed | With no DHT or BMP280, `--` and "BMP280 yok" (no BMP280) appear on the screen | An extra check has been added to detect a broken sensor |
| Explanation | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made and how they found it |

### Note for parents and teachers
- **Aim.** This week is about learning that reading a sensor is not just getting a number; you need to check and interpret that number before you trust it. "What happens if there is no sensor?" is the shared question of the week.
- **How can you help?** When the learner gets stuck, instead of giving the answer, ask these questions: "What is the unit of this number?", "What happens if the sensor does not answer?", "In which direction does this value rise?"
- **A note on accuracy.** Seeing many digits on the screen does not mean measuring correctly. For a sensor's real accuracy you look at the datasheet; the numbers in the lessons belong to the lab model.
- **Safety.** Everything on this platform is virtual. The project has no pump; a real pump needs a transistor or a relay and a separate power supply, and no circuit is ever built with mains voltage (220 V).
- **Progress.** The mini test results appear by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).

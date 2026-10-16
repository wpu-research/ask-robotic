### Goals for the week
By the end of this week, the learner:
1. Can say that a digit on a 7-segment display is a byte; can drive eight outputs with three pins using the 74HC595 and `shiftOut`.
2. Can connect a 16x2 LCD with `LiquidCrystal` and print anywhere on it with `setCursor` and `print`; knows that old text is not deleted.
3. Can explain that the I2C bus works with SDA (A4) and SCL (A5), and what an address is; can find a device with an address scan.
4. Can say how Flash, SRAM and EEPROM differ; can write a setting to the EEPROM with `update` and rarely; can work out the write lifetime.
5. Can build and explain a thermostat with hysteresis and a state machine that combines an NTC, an LCD, a relay and the EEPROM.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan below is for one lesson a day. Set aside two days for the final project if needed.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The 7-segment display and the 74HC595 | ~25 min | Read the explainer, build the circuit, run the 0-9 counter, work out the byte for a digit by hand, do the mini quiz. |
| 2 | The 16x2 LCD display | ~20 min | Set the contrast, write text on two rows, try the problem of writing over old text. |
| 3 | I2C: Wire and the address scan | ~25 min | Run the address scan, change the address and see the difference, print on the I2C LCD. |
| 4 | EEPROM, String and SRAM | ~25 min | Run the power-on counter, see the difference between `write` and `update`, work out the write lifetime. |
| 5 | Final project: Thermostat | ~35 min | Draw the plan, build the circuit, run the program, try the hysteresis and the EEPROM, assess it with the rubric. |

### Prerequisite check
This week brings together the topics of the earlier weeks. Before starting, check the following:
- Working out the temperature with an NTC, and the voltage divider (Week 3). Can the learner find the resistance from the ADC value read on A2?
- Switching a load on and off with a relay (Week 5). Is the relay used with a low voltage, under adult supervision?
- Non-blocking code with `millis()` and the state machine (Week 6). Can the learner run two jobs together without using `delay`?
- Reading a button with `INPUT_PULLUP` and catching the moment it is pressed (Week 2).
- The ideas of hexadecimal numbers and binary numbers (bits) are new; they are covered slowly in lesson 31. If the learner gets stuck, think of a byte as a row of 8 lamps.

### Concept map
- **Display output:** 7-segment (byte pattern) → 74HC595 (SER, SRCLK, RCLK) → `shiftOut` → latch
- **Character display:** LCD 16x2 → RS, E, D4-D7 → `begin`, `setCursor`, `print` → contrast (V0)
- **Communication:** I2C → SDA (A4) and SCL (A5) → device address → `Wire` and the address scan → `LiquidCrystal_I2C`
- **Memory:** Flash, SRAM, EEPROM → `read`, `update`, `put/get` → write lifetime → `String` and SRAM
- **Project:** NTC measurement → hysteresis → state machine (`KAPALI`, `ISITIYOR`, `AYAR`: off, heating, setting) → relay → target in the EEPROM

### Common mistakes
- **Forgetting the latch.** `shiftOut` was called but RCLK was not set HIGH; the 7-segment display does not change.
- **Mixing up common anode and common cathode.** The pattern looks inverted; on a common anode display COM is connected to 5V.
- **Mixing up the LCD pin order.** The order in `LiquidCrystal lcd(RS, E, D4, D5, D6, D7)` must match the wires; do not forget to set the contrast (V0) either.
- **Not clearing old text.** When a number gets shorter, old digits stay (writing `7` over `250` gives `750`).
- **Guessing the I2C address.** Run the scan first; the address in the code and the device's address must be the same.
- **Connecting SDA and SCL to pins other than A4-A5.** The Uno's I2C is only on these pins.
- **Writing to the EEPROM on every pass.** A cell's lifetime is about 100,000 writes. Use `update` and write rarely.
- **Thinking an empty EEPROM is 0.** A cell that has never been written holds 255; check for a valid range.
- **Driving the heater with a single threshold.** The relay keeps switching on and off; use hysteresis.

### End-of-week review
1. Read each lesson's concept cards once more and say the "common mistake" lines out loud.
2. Read the explanations of the questions you got wrong in the mini quizzes again, then do those questions again.
3. Write the bytes for the digits 5 and 9 on the 7-segment display by hand; then try them in the program.
4. Work out after how many days a cell's lifetime would run out if you wrote to an EEPROM cell every minute, every hour and every 10 seconds.
5. Fill in the thermostat state table again for a target of 25 with your own threshold numbers (24.5 and 25.5).
6. Answer this question in your own words: "What would happen to the relay without hysteresis?"

The mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Thermostat)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The NTC is connected the wrong way round, or the relay / LCD connection is missing | The NTC, buttons, relay (LED load) and I2C LCD are connected correctly | The connections are tidy; the sensor value has been checked with the serial monitor |
| Measurement | The temperature makes no sense or is not read at all | The temperature looks sensible on the display and in the serial monitor | It takes an average and catches readings outside a sensible range |
| Control | A single threshold; the relay chatters | Hysteresis works; the relay is on only in the `ISITIYOR` state | Has chosen the hysteresis value by experimenting and explains its effect |
| Memory | The target is lost when the power is cut, or is written on every pass | The target is written once, with `update`, when the setting is finished; the default is used for an invalid value | Has measured the number of writes and worked out the lifetime |
| Program structure | It is blocked by `delay` | A state machine is built with `millis()` and `switch` | A safety measure, such as one for sensor failure, has been added |
| Explanation | Cannot explain what they did | Explains the circuit, the states and the use of the EEPROM step by step | Explains a mistake they made and how they found it, and an idea for improvement |

### Note for parents and teachers
- **Aim.** This is the week where everything learnt in the earlier weeks comes together like a real product. Calculations and pin numbers often get mixed up this week; it helps a lot if the learner draws the circuit diagram and the state table on paper.
- **How can you help?** Instead of giving the answer, ask these questions: "Which pin is connected to which wire?", "Did you use the latch?", "What does the serial monitor say?", "When is this value written to the EEPROM?"
- **Hard concepts.** Bits and hexadecimal notation (lessons 31, 33) and the I2C address are abstract. It helps to explain a binary number as a row of eight lamps and an address as a flat number in a block of flats.
- **Time.** The final project can take longer than 35 minutes. If needed, build the circuit on one day and run the program the next day.
- **Safety.** Everything on this platform is virtual. When working with a real board, use the relay only with low voltage (an LED, a small load); no circuit is ever built with mains voltage (220 V). A real heater is not connected.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).

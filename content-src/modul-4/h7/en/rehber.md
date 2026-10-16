### Goals for the week
By the end of this week, the learner:
1. Can connect the RTC module over I2C, read the date and time with `rtc.now()`, set them with `rtc.adjust()` and write a simple alarm.
2. Can explain how the SD card is connected over SPI, the 8.3 file name rule and how data is written to the card with `close()`/`flush()`.
3. Can write a function, independent of the hardware, that produces a timestamped CSV row; can explain the clash between the decimal comma and the column separator.
4. Can compare the UART, I2C and SPI protocols in terms of the number of lines, speed and how a device is chosen; can work out the transfer time from the number of bits.
5. Can build a temperature and humidity data logger that combines the RTC, the DHT22, the LCD and a button.

### Plan for the week
The week has five lessons; the lessons take 25-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | RTC: time, date, alarm | ~25 min | Read the explainer, set up the RTC, read the time, set it to midnight with `adjust`, try the alarm, do the mini quiz. |
| 2 | SD card (SPI): writing to a file | ~25 min | There is no SD in the lab: read the circuit from the table, write and compile the code, answer the "Try it" questions on paper. |
| 3 | Data logging: CSV and timestamps | ~30 min | Try the row function with fixed values, produce live rows with the RTC + DHT22. |
| 4 | Communication protocols: comparing UART, I2C and SPI | ~30 min | Run the three measurement programs, compare the tables with your own calculations. |
| 5 | Project: Temperature and humidity data logger | ~35 min | Write the plan in a table, build the circuit, run the logger, assess it with the rubric. |

### Prerequisite check
This week needs the following. Go back to the lesson for anything that is missing:
- Non-blocking timing with `millis()` (Module 3, lesson 27)
- I2C, `Wire` and addresses (lesson 33); the I2C LCD (lesson 32)
- The button and edge detection (lesson 8)
- Reading temperature and humidity with the DHT22 (Module 4, lesson 46)
- `String` and the SRAM limit (lesson 34)
- A first introduction to SPI (lesson 63)

### Concept map
- **Time:** `millis()` → RTC → `DateTime` → `adjust` and `lostPower` → alarm
- **Storage:** EEPROM (1 KB) → SD card → SPI (SCK, MOSI, MISO, CS) → 8.3 name → `close` and `flush`
- **Data format:** CSV → timestamp (ISO 8601) → row function → `NaN` and an empty field → decimal separator
- **Communication:** UART (baud) → I2C (address, SDA/SCL) → SPI (CS) → bit time and transfer time
- **Project:** logging linked to the RTC's seconds → repeat-stopping flag → on/off with a button → error-proof row

### Common mistakes
- **Leaving the `adjust(__DATE__, __TIME__)` line without a condition.** At every start-up the time goes back to the moment of compiling; only set it if `lostPower()` is true.
- **Connecting the MPU6050 and the RTC to the same I2C line.** Both use 0x68.
- **Not calling `close()` or `flush()`.** On a real device the last lines are lost.
- **Choosing a file name outside the 8.3 rule.** A name such as `sicaklik_kaydi.csv` cannot be opened.
- **Not writing the month and day with two digits.** Text order breaks time order.
- **Using a decimal comma and a comma separator together.** `23,5` is split into two columns.
- **Choosing different baud rates.** The other side sees meaningless characters.
- **Writing the row more than once in the same second.** The `u != sonKayit` flag is needed.
- **Waiting for the logging interval with `delay(10000)`.** The button and the screen freeze.
- **Connecting LEDs to pins D11, D12, D13 and using the SD card as well.** These pins are the SPI lines.

### End-of-week review
1. Look at each lesson's concept cards and read the "common mistake" lines out loud.
2. Read again the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Answer in your own words: "Why do we use an RTC instead of `millis()` in the data logger?"
4. How many rows are written in a day with a 5-second interval? How many in a week with a 60-second interval? Work it out and estimate the file size.
5. In a circuit that uses the RTC, the LCD and SD at the same time, draw a table of which pins belong to which protocol.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Temperature and humidity data logger)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The RTC or the LCD does not respond, SDA/SCL mixed up | DHT22, RTC, LCD and button on the right pins; the RTC (0x68) and the LCD (0x27) do not clash | Tidy connections; the addresses and the pin table are explained |
| Log format | The rows are broken or the number of columns does not match | A header + timestamped, two-digit, 3-column CSV rows | An empty field is written for NaN, and this has been tested |
| Timing | Uses `delay`, or writes many rows in the same second | The rows come out in exact 10-second steps, without repeats | Changes the interval and explains the effect |
| Control | The button cannot reliably stop logging | The button switches logging on/off, and the state shows on the screen | Explains debouncing and edge detection; adds an extra warning (for example a buzzer) |
| Explanation | Cannot explain what they did | Explains the data flow (sensor → row → log) step by step | Explains a mistake they made and how they found it, and the difference of the SD version |

### Note for parents and teachers
- **Aim.** This week the learner sees a measurement turn from "a moment" into a set of data linked to time. What matters is not a perfect logger, but understanding why data needs a timestamp and a tidy format.
- **SD card.** There is no SD card module in the virtual lab; the second lesson and the SD version of the project are reading and compiling exercises. If it is done with a real card, a FAT32-formatted card and a 3.3 V-compatible module are needed.
- **How to help.** When they get stuck, ask instead of giving the answer: "How many columns does this row have?", "At what moment was the clock set?", "How many times is it writing in the same second?"
- **Time.** Spacing the lessons out helps the learning stick. The protocol lesson (day 4) involves calculations with numbers; a calculator can be used if needed.
- **Safety.** No circuit is ever built with mains voltage (220 V). In a real circuit the file must be closed before the card is removed.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).

### Goals for the week
By the end of this week, the learner:
1. Can explain that the HC-SR04 measures distance from the there-and-back time of sound; can work out centimetres from the time (time × 0.0343 / 2).
2. Can give TRIG the right trigger pulse and measure the ECHO time with `pulseIn` and a timeout; reads a return value of `0` as "no echo".
3. Can say what an outlier is and how the average and the median differ; can write a median filter with a sliding window.
4. Can scan angle by angle with a servo and a sensor and find the direction of the nearest object.
5. Can combine the distance sensor with LEDs, a buzzer and an I2C LCD to build a non-blocking parking sensor with `millis()`.

### Plan for the week
The week has five lessons; the first four take about 20-25 minutes each, and the project lesson about 35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The ultrasonic principle: sound, time, distance | ~20 min | Read the explainer, apply the formula by hand, run the temperature table and interpret it, do the mini quiz. |
| 2 | pulseIn, trig/echo and working out centimetres | ~25 min | Connect the HC-SR04, watch the measurement while changing the Distance value, try the "no echo" case. |
| 3 | Noise, reflection angle and the median filter | ~25 min | Compare the average and the median on arrays with outliers, try the sliding window with the live sensor. |
| 4 | Scanning with a servo (sonar) | ~25 min | Add the servo, run the scan; change Distance by hand to match the angle and find the nearest direction. |
| 5 | Project: Parking sensor (LED + buzzer + LCD) | ~35 min | Read the behaviour table, build the circuit, run the program, assess it with the rubric. |

### Prerequisite check
This week needs the following from Modules 1-3. Check them briefly before you start:
- The `for` loop, arrays and writing functions (Module 3, lessons 4 and 19).
- Non-blocking timing with `millis()` (lesson 27); in the project three jobs run together.
- `map()` (lesson 14), the buzzer (lesson 18), the servo (lesson 21) and the I2C LCD (lessons 32-33).
- Printing to the Serial Monitor (lesson 9).
- Multiplying and dividing with decimal numbers; converting units (from m/s to cm/µs).

### Concept map
- **Physics:** sound → echo → there-and-back time → distance = time × 0.0343 / 2 → how temperature affects the speed of sound
- **Measurement:** TRIG pulse (10 µs) → ECHO time → `pulseIn` → timeout → `0` = no echo
- **Data quality:** reflection angle and surface → outlier → average / median → sliding window → filter delay
- **System:** servo + sensor = scan → keeping the smallest → thresholds → `map()` → multitasking with `millis()`

### Common mistakes
- **Forgetting to divide by two.** Because the time is there + back, the distance comes out doubled.
- **Mixing up units.** Putting 343 m/s into the formula without turning it into 0.0343 cm/µs.
- **Not writing a timeout and treating 0 as a distance.** The program hangs or it is taken as "0 cm"; the LED or buzzer works wrongly.
- **Mixing up `delay(10)` and `delayMicroseconds(10)`.** One is milliseconds, the other microseconds.
- **Thinking the average has cleaned up the outlier.** The median throws wrong values away; the average takes them in.
- **Not filling the window, or forgetting `% N`.** The zeros at the start spoil the median, and the index runs off the end of the array.
- **Starting at 0 when searching for the nearest object.** No measurement is smaller than 0.
- **Using `delay()` for the beep.** The measurement and the screen stop for the length of the beep.
- **Not padding the LCD line out to 16 characters.** Old letters stay on the screen.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Re-read the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Write the formula time × 0.0343 / 2 without looking; work out the centimetres for 1750 µs, 5830 µs and 11660 µs (about 30, 100 and 200 cm).
4. Find the average and the median of the sequence `100, 100, 100, 350, 100` on paper; then write a sequence with two wrong values yourself.
5. Answer this in your own words: "What do you gain, and what do you lose, when you make the parking sensor's window bigger?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. The target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Parking sensor)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The HC-SR04, LED, buzzer or LCD is missing or connected to the wrong pin | All parts on the right pins (TRIG D9, ECHO D10, buzzer D8, LEDs D11-D13, LCD A4/A5) | The wiring is tidy, the buzzer type and LCD address are chosen knowingly |
| Measurement and filter | Decides with the raw measurement; the no-echo case is not handled | The median filter and the invalid measurement are handled | Explains how the window size affects the delay and shows it with an experiment |
| Thresholds and behaviour | The LED, beep or screen does not match the table | The four zones work as in the table | Has solved the flicker at the boundary with hysteresis |
| Timing | `delay()` is used for the beep and the measurement stops | The measurement, beep and screen run separately with `millis()` | Changes the timings and explains the effect |
| Explanation | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made and how they found it, and lists the differences in a real car |

### Note for parents and teachers
- **Aim.** This week is about understanding that a sensor "does not know the distance, it measures a time", and seeing that measurement in the real world is noisy. Instead of making the learner memorise the formula, expect them to say in their own words "the sound goes there and comes back, so we divide by two".
- **How to help.** When the learner gets stuck, instead of giving the answer, ask these questions: "How long does ECHO stay HIGH?", "Is the time one way, or there and back?", "What does it read if no echo comes back?", "Could this reading be an outlier?"
- **Virtual lab and real sensor.** The sensor in the lab is perfect: it reads whatever is typed into the Distance property, and the speed of sound is fixed. A real HC-SR04 can read wrongly on slanted surfaces, on soft materials and when the temperature changes; that is why the median filter is taught.
- **Time.** Spacing the lessons out, instead of doing them one after another on the same day, helps the learning stick. The median lesson and the project involve a new way of thinking; take a day's break if needed.
- **Safety.** In a real circuit, servos and motors are powered from a separate 5 V supply and the GNDs are joined together. No circuit is ever built with mains voltage (220 V); if batteries are used, watch out for short circuits and connecting them the wrong way round.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).

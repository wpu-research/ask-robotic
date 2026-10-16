### Goals for the week
By the end of this week, the learner:
1. Can say that a joystick is made of two potentiometers and a button; can measure the centre and add a dead zone to turn the raw value into the range -100...+100.
2. Can find the direction of rotation of a rotary encoder from the CLK and DT signals; can keep the counter with an interrupt and `volatile`, and can explain why a bounce filter is needed.
3. Can read the MPU6050 through its registers, convert the raw value into g and °/s, and calculate the tilt angle with `atan2`.
4. Can explain why gyroscope bias builds up error, and can combine the two sensors with a complementary filter.
5. Can build a non-blocking mini gimbal with `millis` that turns a tilt into a servo movement in the opposite direction.

### Plan for the week
The week has five lessons; each lesson takes about 25-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Joystick: two axes and a button | ~25 min | Read the explainer, watch the raw values, try the centre and the dead zone, do the mini quiz. |
| 2 | Rotary encoder (quadrature) and interrupts | ~25 min | Draw the CLK/DT state table, run the counter, change the bounce threshold. |
| 3 | MPU6050: accelerometer and tilt angle (I2C) | ~30 min | Try reading the registers, convert the raw value into g, calculate pitch and roll. |
| 4 | Gyroscope bias and the complementary filter | ~30 min | Measure the bias, see the integral drift, change the ALFA value. |
| 5 | Project: A servo controlled by hand tilt (mini gimbal) | ~35 min | Build the circuit, run the program, assess the project with the rubric. |

### Prerequisite check
This week needs the following from earlier weeks. Check them before you start:
- Does the learner know `INPUT_PULLUP` and that a pressed button reads `LOW`? (lesson 6)
- Do they understand edge detection and button bounce? (lesson 8)
- Can they read a 0-1023 value with `analogRead` and scale it with `map`? (lessons 11 and 14)
- Do they know the servo angle and the non-blocking loop with `millis`? (lessons 21 and 27)
- Do they know the ideas of `attachInterrupt`, the ISR and `volatile`? (lesson 29)
- Do they know SDA, SCL and the device address in I2C? (lesson 33)

### Concept map
- **Analogue input:** joystick (two voltage dividers) → centre → dead zone → -100...+100 with `map`
- **Counting:** encoder → CLK and DT (90 degrees apart) → direction rule → interrupt and `volatile` → bounce filter
- **Motion sensing:** MPU6050 → registers (0x6B, 0x3B) → raw → g and °/s → angle with `atan2`
- **Sensor fusion:** accelerometer (does not drift, noisy) + gyroscope (fast, drifts) → complementary filter (`ALFA`)
- **Project:** angle → offset → servo = 90 − tilt → `constrain` → jobs with `millis` → open loop

### Common mistakes
- **Writing the centre as a fixed 512, or not adding a dead zone.** The value wobbles while the stick is released.
- **Starting the program while the stick is pushed.** The centre is measured wrongly.
- **Not connecting CLK to an interrupt pin (D2, D3).** `attachInterrupt` does not work.
- **Not making `sayac` `volatile`, or using `Serial.print` / `delay` inside the ISR.**
- **Choosing a bounce threshold that is too large.** When you turn fast, real ticks are thrown away too.
- **Reading the MPU6050 without writing 0 to register `0x6B`.** The chip stays asleep.
- **Writing `ax / 16384`.** Integer division gives 0; write `16384.0`.
- **Joining the bytes as unsigned.** A negative value looks like 65000; use `int16_t`.
- **Using the MPU6050 and the RTC on the same line.** Both are at address 0x68.
- **Trusting the accelerometer angle during movement.** Even `ax` = 0.3 g without the chip tilting shows about 16.7 degrees.
- **Writing `dt` in milliseconds or as a fixed value.** The integral is off by 1000 times, or it drifts when the timing changes.
- **Moving the chip while measuring the bias.** The whole angle drifts.
- **Using `delay` in the gimbal and not limiting the servo.** The button is missed and the servo pushes against its mechanical end.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Write the joystick program without looking: measure the centre, add a dead zone, scale with `map`.
4. For the encoder, draw the 11, 01, 00, 10 table for both directions on paper and explain the "DT when CLK falls" rule in your own words.
5. Compare how the filter reacts to vibration and drift by setting `ALFA` to 0.90, 0.98 and 0.999; work out the time constant with `ALFA · dt / (1 − ALFA)`.
6. Answer this question in your own words: "Why are the accelerometer and the gyroscope used together?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Mini gimbal)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The MPU6050 or the servo does not work, SDA/SCL mixed up | MPU6050, LCD, servo and button on the right pins; no RTC | Tidy connections; explains why the servo's power should be separate |
| Measurement and filter | Uses the accelerometer only; the angle jitters | The bias is measured, the complementary filter works | Tries different `ALFA` values and explains their effect |
| Control | The servo turns the same way as the tilt, or is unlimited | The servo turns the opposite way, limited to 10...170, the button resets | The limit LED works; there is an improvement such as a roll axis |
| Timing | Uses `delay`; the button is missed | There is a non-blocking loop with `millis` | Calculates `dt` with `micros` and explains why |
| Explanation | Cannot explain what they did | Explains the data flow from sensor to servo step by step | Explains the limit of open loop and how it could be improved |

### Note for parents and teachers
- **Aim.** This week is not about memorising formulas but about seeing that a sensor is flawed and covering its flaw with another sensor. "Why does the accelerometer get it wrong?" is the main question of the week.
- **How to help.** When the learner gets stuck, ask instead of giving the answer: "What exactly is the sensor measuring right now?", "Do the units match: degrees or radians, ms or s?", "Which line would still run while the chip is asleep?"
- **Maths.** `atan2` and the filter formula can look hard. It is easier to change the values in the lab first and watch the result, then look at the formula. The calculations stay at the level of the four operations and simple ratios.
- **Time.** Spacing the lessons out, instead of doing them one after another on the same day, helps the learning stick. A day's break between lessons 3 and 4 of the week is a good idea.
- **Safety.** Everything on this platform is virtual. If you work with a real board, power the servo from a separate 5 V supply and join the GNDs; no circuit is ever built with mains voltage (220 V).
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).

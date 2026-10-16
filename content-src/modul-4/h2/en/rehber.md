### Goals for the week
By the end of this week the learner:
1. Can explain that a PIR sensor detects changes in heat radiation, and what the warm-up and hold times are; can write a program that waits for the warm-up and keeps the time of the last motion.
2. Knows that an IR obstacle sensor gives "yes/no" information, and that the threshold is on the screw for the digital output and in the code for the analogue output; can make flicker-free decisions with two thresholds (hysteresis).
3. Can read reed and limit switches with `INPUT_PULLUP`, explain the difference between NO and NC in terms of safety, and filter out contact bounce with debounce.
4. Knows the VL53L0X (ToF, I2C, 0x29); can write code that checks for errors with `init()`, `timeoutOccurred()` and `Wire.begin()` (there is no part in the lab, compiling only).
5. Can build a four-state burglar alarm, written with `enum` and `millis()`, that combines a PIR, a reed and a button, and can discuss its weak points.

### Plan for the week
The week has five lessons; each lesson takes about 20 minutes and the project about 35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | PIR: motion detection and warm-up time | ~20 min | Read the explainer, run the `pir_isinma` and `pir_oda_dolu` sketches, try the Motion box during and after the warm-up, do the mini quiz. |
| 2 | The IR obstacle sensor and setting the threshold | ~20 min | Play with the Proximity and Threshold sliders, watch the hysteresis in the analogue sketch, do the mini quiz. |
| 3 | The reed switch and the limit switch | ~20 min | Read the reed and the button with the same logic, think about NO/NC and debounce, do the mini quiz. |
| 4 | VL53L0X (I2C ToF): precise distance | ~20 min | Write and compile the code, run it without a sensor and see the error message, do the threshold calculations, do the mini quiz. |
| 5 | Project: Burglar alarm (with a state machine) | ~35 min | Draw the state table, build the circuit, run the program, go through all the states, assess with the rubric. |

### Prerequisite check
This week builds on Module 3 and the first week. Before you start, check:
- Can they read a button with `INPUT_PULLUP`, and do they know that pressed = LOW? (lesson 6)
- Do they remember the ideas of edge detection and debounce? (lesson 8)
- Can they measure time with `millis()` without using `delay()`? (lesson 27)
- Can they write a state machine with `enum` and `switch`? (lesson 28)
- Do they know that I2C works with SDA and SCL, and that each device has an address? (lesson 33)
- Do they remember the idea of a two-threshold (hysteresis) decision? (lesson 35)
- Do they know that the ultrasonic sensor sends out sound and waits for the echo? (lesson 36)

### Concept map
- **Presence:** PIR (heat change) → warm-up time → hold time → time of the last motion → room occupied/empty
- **Obstacle:** IR obstacle (reflection) → digital OUT (screw threshold) and analogue AO (code threshold) → hysteresis → counting edges
- **Contact:** reed and limit switch → `INPUT_PULLUP` → NO and NC → debounce → fail-safe design
- **Distance (light):** VL53L0X → I2C 0x29 → `init()` and `timeoutOccurred()` → millimetre threshold
- **Project:** state table → `enum` and `switch` → exit delay → latch → code window → non-blocking loop

### Common mistakes
- **Not waiting for the warm-up.** After it is switched on, a PIR gives false HIGHs; the alarm goes off straight away.
- **Using `INPUT_PULLUP` for a PIR, or counting LOW as motion.** On a PIR, motion = HIGH.
- **Thinking the PIR goes LOW straight away.** Because of the hold time, OUT stays HIGH for a while after the motion ends.
- **Assuming every IR module gives LOW for an obstacle.** Put the level into a constant.
- **Using a single threshold.** When the value wobbles around the threshold, the output flickers; use two thresholds.
- **Counting the level when counting objects.** An object that stays still is counted again on every pass; count the edge.
- **Forgetting the pull-up on reed and limit switches.** When the contact is open the pin floats, and the reading is random.
- **Mixing up NO and NC.** The logic works the wrong way round; a broken wire may go unnoticed.
- **Skipping `Wire.begin()` or the `timeoutOccurred()` check with the VL53L0X.** A faulty reading is taken for a real distance.
- **Mixing up mm and cm.** 300 mm = 30 cm.
- **Using `delay()` in the alarm project.** The button and the sensors are missed during that time.
- **Not resetting the code counter when the state changes.** Presses from the previous state spoil the new one.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Re-read the explanations for the questions you got wrong in the mini quizzes, then do the questions again.
3. Write the `pir_oda_dolu` sketch without looking; then change the waiting time and explain its effect.
4. On paper, draw the state transition diagram for the burglar alarm (with arrows and conditions); then check it against the code in the project.
5. Answer this question in your own words: "Why might connecting the alarm door contact as NC be safer than connecting it as NO?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 correct for each lesson. Go back to the explainer of any lesson where you fell short.

### Project assessment rubric (Burglar alarm)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The PIR, reed or button is missing or on the wrong pin | The three inputs and the outputs are on the right pins, the GNDs are connected | The wiring is tidy, each sensor has been tested one by one |
| State design | No state table, mixed up with flags | The four states and their transitions are in a table, the code uses `enum` and `switch` | The transition conditions match the diagram exactly, an extra state such as an entry delay has been considered |
| Timing | `delay()` is used, the button or a sensor is missed | The exit delay, the alarm time and the code window are measured with `millis()` | The times are gathered in constants, and the effect of changing them is explained |
| Sensor reliability | The warm-up and hold times are not taken into account, false alarms occur | The exit delay lets the PIR settle, the reed logic is correct | The NC/NO and debounce choices are justified |
| Explanation | Cannot explain what they did | Explains the states and transitions step by step | Discusses the weak points (cutting the wire, covering the PIR) and their solutions |

### Note for parents and teachers
- **Aim.** This week shows that sensors do not give "the right answer"; they give signals that have to be interpreted, filtered and designed around for safety. Ideas such as warm-up, bounce and thresholds are everyday problems in real engineering.
- **How to help.** When the learner gets stuck, instead of giving the answer, ask: "What is the sensor reading at that moment?", "Which condition changes this state?", "What would happen if the wire broke?"
- **Lab limit.** There is no VL53L0X part in the lab; this lesson is only about writing and compiling code. The measured values cannot be checked virtually.
- **Safety.** Everything on the platform is virtual. If you work with a real board, never build any circuit with mains voltage (220 V); for relays and sirens, remember the rule of an external supply and a common GND.
- **Ethics.** Alarms and motion detection are for your own room and your own things. Putting a sensor in someone else's room without permission, or secretly watching someone, is wrong; it is a good idea to talk about this with the learner.
- **Progress.** The mini quiz results at the end of each lesson appear skill by skill on the "My progress" page (a draft/pilot feature; saved only if consent has been given).

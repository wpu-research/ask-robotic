### Goals for the week
By the end of this week the learner can:
1. Say which way light changes the reading in an LDR divider, and prevent flicker with two-threshold hysteresis.
2. Measure the baseline of a sound sensor and work out the deviation; classify a sound by its loudness and duration.
3. Explain the idea of warm-up and a clean-air baseline for the MQ-2; write the threshold as a multiple of the baseline and say why ppm is not written.
4. Sort out the flame sensor's direction in one place; build a three-level decision system with `enum` and a `seviyeBul` function that takes parameters.
5. Build and test a fire and gas alarm panel from gas, flame and heat sensors; explain that the panel is for learning and what its limits are.

### Plan for the week
The week has five lessons. The plan below is for one lesson a day; the project day is longer.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Light sensor sensitivity and hysteresis | ~25 min | Read the explainer, see the flicker with one threshold, remove it with two thresholds, do the mini quiz. |
| 2 | Sound sensor: clap switch | ~30 min | Measure the baseline, print the peak, recognise a clap by duration and height, toggle an LED with two claps. |
| 3 | MQ-2 gas sensor: warm-up and calibration | ~25 min | Wait for the warm-up, measure the baseline, build an alarm on a multiple of the baseline. Imitate gas with Gas level. |
| 4 | Flame sensor and managing several thresholds | ~30 min | Sort out the direction with `siddet()`, try the three levels, use the same function for two sensors. |
| 5 | Project: Fire and gas alarm panel | ~35 min | Build the circuit, work through the test table, check the outputs and the screen, assess with the rubric. |

### Prerequisite check
This week needs some topics from Module 3. Check before you start:
- Can you read a value from 0 to 1023 with `analogRead` and print it to the Serial Monitor? (Lessons 11 and 9)
- Can you build a voltage divider with an LDR and say which way the value goes with light? (Lesson 12)
- Do you know what smoothing is for? (Lesson 14)
- Can you write a function that takes parameters and returns a value? (Lesson 19)
- Can you measure time with `millis()` without using `delay`? (Lesson 27)
- Do you know how to keep a state with `enum`? (Lesson 28)
- The project also uses the relay (lesson 24), the buzzer (lesson 18), the NTC (lesson 13) and the I2C LCD (lessons 32-33).

### Concept map
- **Reading:** sensor → raw number → direction → noise → baseline value
- **Decision:** threshold → hysteresis (two thresholds) → relative threshold (multiple of the baseline) → smoothing → several levels (NORMAL, UYARI, TEHLIKE)
- **Event:** baseline level → deviation (`abs`) → peak → duration → quiet margin → classification
- **Structure:** function with parameters → `enum` → `enKotu` → working out the outputs from the level
- **Project:** three sensors → overall state → LEDs, buzzer, relay, screen → safety and limits

### Common mistakes
- **Making the on and off thresholds the same.** That is a single threshold; the flicker comes back. Writing the thresholds the wrong way round (on > off) also produces a change on every pass in the dead band.
- **Writing the direction of the threshold without looking at the circuit.** If the LDR is on the 5V side, the value is small in the dark.
- **Assuming the baseline or measuring it in the wrong surroundings.** On the sound module the baseline is not 512 (about 256 on the virtual module); if the MQ-2 baseline is measured in air containing gas, the thresholds move up.
- **Skipping the warm-up.** On a real MQ-2 the baseline comes out wrong.
- **Looking only at loudness.** A door slam also looks like a clap; the duration must be checked too.
- **Integer division.** `int` / `int` throws the fraction away: 160 / 100 gives 1.
- **Writing the off threshold bigger than the on threshold.** The level flickers or never drops.
- **Leaving a sensor out of the overall state.** `enKotu` must cover every sensor.
- **Driving the outputs from different places.** The LEDs, buzzer and screen get out of step.
- **Using the relay with mains voltage.** Never do this in this project.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Reread the explanations for the mini quiz questions you got wrong, then do those questions again.
3. Write the `seviyeBul` function on paper without looking. Then trace the sequence 320, 280, 240, 650, 520, 480 by hand with the thresholds 300 / 250 / 600 / 500.
4. Try adding a third sensor for heat: change the thresholds, do not touch the function.
5. Answer these questions in your own words: "Why do we need hysteresis?" and "Why don't we write ppm for the MQ-2?"

The mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson where you fall short.

### Project rubric (Fire and gas alarm panel)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | One of the sensors or one of the outputs is not connected | Gas, flame, LEDs, buzzer, relay and screen are connected correctly | The wiring is tidy; the NTC is connected and works too |
| Warm-up and baseline | No warm-up, or the baseline is measured in air containing gas | The warm-up is waited for and the baseline is measured in clean air | There is protection for a very small baseline, and the time for real hardware has been discussed |
| Levels | The levels flicker or come from the wrong sensor | NORMAL, UYARI, TEHLIKE with hysteresis work for three sensors | A new sensor is added with one line, and `seviyeBul` does not change |
| Outputs | The outputs do not match the level | The LEDs, buzzer, relay and screen behave as in the table | The buzzer pattern has been changed (for example two short beeps) and the reason explained |
| Testing | No testing done | The values in the test table have been tried and the results written down | Edge cases (the hysteresis band, a disconnected sensor) have been tried |
| Safety and explanation | The limits are not mentioned | Says it is for learning and states the relay limit | Explains with examples why the panel would not be enough in real life |

### Note for parents and teachers
- **Aim.** This week the aim is for the learner to grasp the idea that "a sensor gives a number, the decision is ours". Seeing the flicker and fixing it is worth more than memorising.
- **Safety.** The gas, flame and heat on this platform are virtual. No experiments are done with real gas, flames or heaters. The relay only drives a 5 V LED; no circuit is ever built with mains voltage (220 V). This panel does not replace a certified gas or fire detector; proper devices must be used for real protection at home.
- **How can you help?** When the learner gets stuck, instead of giving the answer, ask: "Does the sensor go up or down with light?", "What does it read in clean air?", "What does the serial monitor print?", "Which output comes from which level?"
- **Discussion question.** Work through the questions in the Discuss section as a conversation: Should the fan run when there is gas, and should it also run when there is a flame? Who sets these rules in real panels?
- **Time.** The project lesson is long; it can be split into two sessions if needed. Waiting for the warm-up takes patience, and on real hardware it is much longer.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; saved only if consent has been given).

### Goals for the week
By the end of this week the learner:
1. Explains how a reflective IR sensor reads a line; reads five sensors with an array and `for`, turns them into a 0/1 pattern with a threshold and finds the line position (−2…+2).
2. Calculates the blind zone from the sensor spacing and the line width.
3. Finds the threshold for each sensor with `(min + max) / 2` by measuring min/max; explains why a fixed threshold goes wrong when the light changes.
4. Applies bang-bang control and the `sonYon` memory; uses a two-threshold (hysteresis) decision.
5. Handles gaps, sharp bends and junctions with a state machine; puts a time limit on every search.
6. Brings all the parts together in one program, measures the robot's lap time and the time it cannot see the line, and interprets the trade-off between speed and reliability.

### Plan for the week
The week has five lessons. The plan below is for one lesson a day; the project lesson is a little longer.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The reflective IR sensor and reading a line | ~20 min | Read the explainer, run the raw reading and the pattern, find the blind zone, do the mini quiz. |
| 2 | Calibration: min/max and threshold | ~25 min | Run the wiggle calibration, compare the fixed and calibrated thresholds in the light example. |
| 3 | Bang-bang line following and hysteresis | ~25 min | Compare the single-sensor and five-sensor programs, read the lost time. |
| 4 | Junctions, sharp bends and losing the line | ~25 min | Try the gap, the sharp bend and the T junction; change `BOSLUK_MS` and the decision value. |
| 5 | Project: A line-following robot (track) | ~35 min | Run the program on the track, change the `HIZ` value and compare the reports, assess it against the criteria. |

### Prerequisite check
This week needs Module 3 and the first week of Module 5 (including lessons 77 and 78). Before you start, check:
- Can they take a reading from 0 to 1023 with `analogRead`? (Module 3, lesson 11)
- Can they use arrays and the `for` loop? (lesson 4)
- Can they write a state machine with `millis()` and `enum`? (lessons 27 and 28)
- Can they drive a motor with direction + PWM, and do they know about the dead zone? (lessons 77 and 78)
- Can they read values on the Serial monitor? (lesson 9)

### Concept map
- **Sensing:** reflective IR sensor → `analogRead` → threshold → bit pattern → line position → blind zone
- **Calibration:** min and max → `(min + max) / 2` → a separate threshold for each sensor → conditions for the wiggle
- **Deciding:** bang-bang → `sonYon` memory → two-threshold decision (hysteresis) → zigzag and lost time
- **Difficult cases:** gap, overshot bend, junction → `IZLE`, `BOSLUK`, `ARAMA`, `DUR` → time limit
- **Project:** calibration + following + recovery + finish → measurement (lap, loss, longest gap) → the speed trade-off

### Common mistakes
- **Mixing up the sensor order.** A0 is on the far left; if you think it is the other way round, the robot always turns the wrong way.
- **Not checking the module's direction.** If the line reads low, `>` works the wrong way; look at the raw values first.
- **Choosing the threshold by guessing.** When the light changes, the decision breaks; measure the threshold.
- **Writing the starting values of `enAz` and `enCok` the wrong way round.** Min and max are never updated.
- **Leaving the wiggle PWM below the dead zone.** The robot does not turn and the calibration comes out wrong.
- **Resetting `sonYon` when the line disappears.** The memory is wiped and the robot misses the bend.
- **Turning straight away at a junction.** The sensor array is in front of the axle; go forward briefly first.
- **Leaving the search unlimited.** If there is no line, the robot turns forever; stop when the time runs out.
- **Not updating `sonTur`.** The lost time comes out many times too large.
- **Increasing the speed and leaving the times the same.** It travels further in the same time.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong again, then solve the question again.
3. Draw a table by hand: write the five-bit pattern for seven different positions of the line (level with the centre sensor, between two sensors, at the end).
4. Make up a situation where the light increases (choose two numbers for the floor and the line) and compare the results of the fixed threshold and the calibrated threshold.
5. Answer this question in your own words: "When the line disappears, how does the robot tell whether it is a gap or whether it has overshot a bend?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson where you fall short.

### Project assessment rubric (A line-following robot)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Calibration | The thresholds are written by hand, or the calibration gives an error | The robot wiggles, min/max are measured and the thresholds are printed | Explains the contrast check and why it is there, has chosen the wiggle time by measuring |
| Following | The robot often loses the line or cannot finish the track | The robot finishes the track and stops at the finish | The lost time is clearly lower than in the version without memory, and they show this by measuring |
| Recovery | Gets stuck at the gap or the bend | The gap is crossed; if the line cannot be found, it stops | Has set the times again to suit the speed and explains why |
| Measurement | No report line | Lap time, loss and longest gap in the report | Has made a table for at least three `HIZ` values and interpreted it |
| Explaining | Cannot explain what they did | Explains the states and transitions step by step | Explains a mistake they made and how they found it |

### Note for parents and teachers
- **Aim.** This week is about learning to find and measure where the robot does not work, as much as about making it "work". The robot losing the line is not a failure; it is a chance to collect data.
- **How to help.** Instead of giving the answer, ask: "What are the sensors seeing right now? Did you print the pattern?", "Which side was the line on last?", "When you changed the speed, which number changed?"
- **Time.** Spacing out the lessons helps the learning stick. Be patient on project day; tuning often takes several attempts.
- **Difference from a real robot.** Everything here is virtual. On a real robot the readings flicker, the speed changes as the battery voltage drops, and ambient light (sunlight contains infrared too) shifts the values; the times and thresholds must be set again.
- **Safety.** If you move on to a real robot, use external power and a common GND for the motors; never connect the battery the wrong way round or short its leads. No circuit is ever built with mains voltage (220 V). Stopping when something goes wrong is the safe default.
- **Progress.** The mini quiz results at the end of each lesson appear skill by skill on the "My progress" page (draft feature; saved only if consent has been given).

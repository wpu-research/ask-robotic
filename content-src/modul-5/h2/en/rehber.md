### Goals for the week
By the end of this week the learner:
1. Can read a bumper switch with `INPUT_PULLUP`, tell left/right/head-on bumps apart and write a reaction that turns away from the obstacle.
2. Can turn the HC-SR04 echo time into distance (time / 58) and explain why the median filter is needed.
3. Can take the sensor's position and the braking margin into account when choosing a stop threshold.
4. Can scan several directions with a servo, find the farthest direction and turn the angle into a turning time.
5. Can read and write a five-state (ILERI, DUR, TARA, DON, GERI) state machine based on `millis()`.
6. Can assess the robot's success with measurable criteria such as distance and number of collisions.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan is for one lesson a day. Lesson 84 is the most demanding; split it over two days if needed.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Reacting with bumper (touch) sensors | ~20 min | Read the explainer, watch the bumpers, run the bump-back off-turn program, play with `GERI_MS` and `DONUS_MS`, do the mini quiz. |
| 2 | Stop and turn with a distance sensor | ~25 min | Compare the raw and median values, try the stopping points of the single-measurement and median robots, change the `ESIK_CM` and `N` values. |
| 3 | Finding the clearest path with a servo scan | ~25 min | Draw the angle table, run the scan, interpret the chosen angle, reduce the step to 15°. |
| 4 | An obstacle-avoiding state machine | ~30 min | Draw the state table in your own words, watch the `DURUM` lines on the Serial monitor, change the `ACIK_CM` value. |
| 5 | Project: An autonomous obstacle-avoiding robot | ~35 min | Run the program, measure the distance and the number of collisions, try the `x` and `g` commands, assess it against the criterion. |

### Prerequisite check
This week needs Week 1 (lessons 76-80) and some knowledge from Modules 3-4. Before you start:
- Can they drive both motors together with `surus(sol, sag)`? (Module 5, Week 1)
- Can they read a button with `INPUT_PULLUP` and do they know the "pressed = LOW" logic? (Module 3, lesson 6)
- Can they measure time with `millis()` without using `delay`? (Module 3, lesson 27)
- Can they read a state machine with `enum` and `switch`? (Module 3, lesson 28)
- Are using `pulseIn` with the HC-SR04 and the median filter familiar? (Module 4, lesson 38)
- Can they set an angle with the `Servo` library? (Module 3, lesson 21)

If something is missing, go back to the explainer of the relevant lesson.

### Concept map
- **Sensing:** bumper (contact) → ultrasonic (distance) → scanning with a servo (direction) → measurement noise → median filter
- **Deciding:** threshold → braking margin → farthest direction → from angle to turning time
- **Structure:** states → transition conditions → time with `millis()` → `gec()` → backup protection (bumper, stuck check)
- **Measuring:** distance → number of collisions (edge detection) → deriving the threshold from measurements → emergency stop

### Common mistakes
- **Thinking a pressed bumper is HIGH.** With `INPUT_PULLUP`, pressed = LOW.
- **Choosing the wrong turning direction.** If the left bumper was pressed, the obstacle is on the left; the robot turns right.
- **Thinking a result of 0 when no echo comes back is a distance.** 0 does not mean "I am right at the wall"; it means "no echo".
- **Trusting a single measurement.** The median filter throws out the outlier.
- **Thinking of the threshold relative to the robot's centre.** The sensor is at the front of the robot, and the robot also travels some distance while stopping.
- **Measuring right after telling the servo `write`.** The servo is on its way; the measurement is a mix of two directions.
- **Mixing up left and right.** 90° is ahead, a large angle is left.
- **Assigning the state with `durum = ...`.** `durumBasi` is not updated; use `gec()`.
- **Putting `delay` into the state blocks.** While the robot waits, it cannot see the bumpers.
- **Counting a collision for as long as the flag is true.** Count the edge: the moment the flag becomes true.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong again, then solve the question again.
3. Draw the five-state table (state, what it does, exit condition, next) on paper without looking.
4. Set `ESIK_CM` to 15 and to 40; write a short sentence on how the stopping point and the number of collisions change.
5. Answer this question in your own words: "Which two numbers would I ask for to say that a robot works, and why are both needed?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson where you fall short.

### Project assessment rubric (An autonomous obstacle-avoiding robot)
Test arena: 2 × 2 m with three obstacles inside; a 30-35 second run; 2 cm of measurement noise.

| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit and safety | No common GND, or the motors are powered from the Arduino's 5 V | Separate battery, common GND, bumpers and sensor on the right pins | Explains the wiring with the pin table and explains the emergency stop as a safety measure |
| Behaviour | Keeps crashing into the wall or never moves forward | At least 3 m travelled and at most 3 collisions in 30-35 s | Changes the threshold and speed, measures the result and writes it in a table |
| State machine | Contains `delay`, or the states are muddled | Five states, transitions with `gec()`, no `delay` | Adds a new state (for example BEKLE) and updates the table |
| Measuring | Gives no numbers | Measures the distance and the number of collisions, counts collisions by the edge | Derives the threshold from measurements and answers the question "does this number only fit our arena?" |
| Explaining | Cannot explain what they did | Explains the state table and every transition | Explains a mistake they made and how they found it (for example the `durum` assignment bug) |

### Note for parents and teachers
- **Aim.** This week is about making visible how the robot "makes decisions": sensor, threshold, state. A robot that does not work is not a failure; it is data to be measured.
- **How to help.** Instead of giving the answer, ask: "Which state is the robot in right now?", "What is the Serial monitor printing?", "What is the sensor measuring, and what were you expecting?"
- **Time.** Lesson 84 is demanding; splitting it over two days helps the learning stick.
- **Safety.** Everything on this platform is virtual. If you move on to a real robot: for the first test, lift the robot and run it with the wheels in the air; power the motors and the servo from a separate battery and make the GND common; never short the batteries or connect them the wrong way round; no circuit is ever built with mains voltage (220 V). Think of the `x` command as an "emergency stop".
- **Difference from a real robot.** The measurements in the lessons are simulation results. Real sensors, bumpers and motors behave differently; measure the times and thresholds again on your own robot.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent has been given).

### Week goals
By the end of this week the learner:
1. Chooses their path for the final robot (A autonomous vehicle, B robot arm, C follower robot) and turns the word "done" into acceptance criteria containing a number, a unit and a measurement method.
2. Fills in a design document: goal, requirements, subsystems, state machine, test plan, risks.
3. Tests the subsystems of the chosen path (drive-distance-line, inverse kinematics-servo driver or distance PID) on their own, with pass conditions.
4. Combines the subsystems with a state machine and fills in a test matrix, writing the expected results first.
5. Writes the robot's state as contract-bound JSON lines and works out the mean and largest absolute error.
6. Writes a results table, a bug report with root cause analysis and a daily report; presents them keeping simulator and real measurements apart.

### The week's plan
The week has five lessons; each lesson is 35-40 minutes. The plan below is for one lesson a day. The path is chosen on day 1 and does not change during the week.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Final robot: choosing the project and designing it | ~35 min | Compare the three paths, choose one, fill in the design document, try the acceptance criterion sketch. |
| 2 | Build 1: subsystems | ~40 min | Test your path's subsystems one by one with serial commands; measure the pass conditions. |
| 3 | Build 2: integration and testing | ~40 min | Combine the subsystems with a state machine, fill in the test matrix. |
| 4 | Connecting to a 3D robot, debugging, measuring | ~40 min | Write and check the telemetry line; work out the error statistics. |
| 5 | Exhibition and presentation | ~40 min | Write the results table, the bug report and the daily report; get ready for the exhibition. |

### Prerequisite check
This week uses all the previous weeks. Depending on the path you will choose, these should be ready:
- **Path A:** lessons 76-78 (two-motor driving, dead zone), lesson 82 (HC-SR04), lessons 86-89 (line sensor, threshold), lesson 84 (state machine).
- **Path B:** lesson 21 (servo), lessons 108-109 (inverse kinematics, pick-and-place).
- **Path C:** lesson 82 (distance), lessons 96-99 (P, I, D and tuning).
- For all of them: non-blocking code with `millis()` (lessons 26-27) and reading from and writing to the serial port.
- Power safety: motors and servos are powered from an external supply, the GND is shared; no circuit is built with mains voltage.

### Concept map
- **Planning:** "it works well" → acceptance criterion (number, unit, method) → design document → subsystems and pass conditions
- **Building:** subsystem test → state machine → test matrix (expected first) → safe default
- **Measuring:** data contract (`t, x, y, th, d`) → `null` and ranges → mean and largest absolute error
- **Explaining:** results table → scope limit → bug report (symptom, root cause) → daily report

### Common mistakes
- **Writing a requirement that cannot be measured.** Add a number and a unit to a sentence such as "it should go smoothly".
- **Loosening the criterion afterwards.** If it is going to change, the reason is written in the document and applied to all tests.
- **Writing `<=` instead of `<`.** In "less than 5 mm", exactly 5.0 does not pass.
- **Combining a subsystem without testing it.** You cannot tell which part the bug comes from.
- **Not resetting the timer when the state changes.** The next state ends at once.
- **Carrying on with the last command when the target disappears.** When you are not sure, stop the motor.
- **Writing 0 for "no measurement".** Use `null` in the telemetry.
- **Taking a signed average of the errors.** +3 and -3 cancel each other out.
- **Presenting a simulator result as a real result.** Write the scope limit.

### End-of-week review
1. Read your design document from scratch: does every requirement have a number and a measurement method next to it?
2. Type `C 17 23`, `C 16.9 20`, `B 4.9`, `B 5`, `A 0 0` into the acceptance criterion sketch; explain the reason for each result.
3. Choose a row that broke in the test matrix; first measure the reason, then make a single change, then run the neighbouring tests again.
4. Compare every field of the telemetry line with the contract rule; make up a broken line and say why it is broken.
5. Give your daily report to someone who will read it six months from now: can the answer to "why this value?" be found?

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct from each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (final robot)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Requirements | There are wishes without numbers | Every requirement has a number, a unit and a measurement method | The criteria are written with their limit values (`<`/`<=`) and their reasons |
| Subsystems | Combined code, no separate tests | Each subsystem has been tested on its own with its own pass condition | Checked with an independent measurement, such as a round trip or a ruler |
| Integration | Blocked with `delay()`, or no decision layer | A state machine and a test matrix with at least 5 rows | The expected column was written first; a failed row was fixed with its reason |
| Safety | The motor/servo is powered from the Arduino's 5 V, the last command carries on when the target is lost | External power and a common GND; the robot stops when it loses the target | The safe default has been tested as a row in the test matrix |
| Measurement and reporting | Results are given by word of mouth, no evidence | There is a results table, a bug report and a daily report | The root cause has been measured layer by layer, and the scope limit written |

### Note for parents and teachers
- **Purpose.** This week, "a robot that proves it works" matters as much as "a working robot". The learner should describe their results with numbers, the measurement method and their limits.
- **Choosing a path.** No path is "easy". A combines the most parts, B puts the maths first, C asks for PID tuning. Rather than trying to do all three at once, finishing one path is recommended.
- **How to help.** Instead of giving the answer, ask these questions: "With which number did you measure this?", "Which layer is sound and which is not?", "What was the single change?"
- **3D robot.** At the moment there is no 3-dimensional view. Lesson 114 only tests the data format; do not raise the expectation that "the 3D robot works".
- **Safety.** If working with a real board, batteries are never short-circuited or connected the wrong way round, and motors are not powered from the board's 5 V; when in doubt, ask an adult for help. No circuit is ever built with mains voltage (220 V).
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).

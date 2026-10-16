### Week goals
By the end of this week the learner can:
1. Say what the strengths and weaknesses of the encoder and the gyroscope are; choose the gyroscope scale and work out a fused heading with a complementary filter.
2. Split a robot program into behaviours; explain the ideas of suggestion, arbiter and priority; write a behaviour with two thresholds (hysteresis).
3. Work out forward and inverse kinematics for a two-axis robot arm; catch unreachable targets and servo limits.
4. Move the robot arm smoothly with `millis()` and write a pick-and-place job as a step table.
5. Build and assess an explorer robot with a position estimate, behaviours and measured numbers (coverage, collisions, time).

### The week's plan
The week has five lessons; each lesson is 30-35 minutes. The plan is for one lesson a day.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Sensor fusion: encoder + IMU | ~30 min | Read the explainer, try the gyroscope scale, change the α value and watch the drift, solve the mini quiz. |
| 2 | Behaviour-based control and priorities | ~30 min | Read the three behaviours, watch in the serial output which behaviour is active when, change the order and test your guess. |
| 3 | Robot arm: servos and two-axis inverse kinematics | ~35 min | First work out q1 and q2 by hand for one or two targets, then compare with the program, try unreachable points. |
| 4 | Robot arm: a pick-and-place sequence | ~35 min | Compare the sudden and smooth movements, read the step table, change the times. |
| 5 | Project: an explorer robot (search, escape, wander) | ~35 min | Combine the behaviours and the position estimate, assess with the measurement table. |

### Prerequisite check
Before you start, check these:
- Is the learner comfortable with the drive (D5-D10), encoder (D2, D3) and ultrasonic (D11, D12) connections and with a non-blocking loop using `millis()`? (Weeks 1-4)
- Do they remember the complementary filter and the fixed-period loop? (Lessons 102 and 103)
- Do they know sine, cosine and converting between radians and degrees from school? The arm lessons use this.
- Do they know how to use servos and the external power rule (common GND)? (Lesson 21)

### Concept map
- **Sensing:** encoder heading · gyroscope (scale, bias, saturation) · complementary filter → fused heading
- **Decision:** behaviour → suggestion → arbiter → priority · hysteresis (two thresholds)
- **Arm:** servo angle (q1, q2) · forward and inverse kinematics · reach and servo limit · pulse width
- **Movement:** linear interpolation · servo frame (20 ms) · step table
- **Combination:** position estimate (x, y) → heading for a target (angle difference) → measurement (coverage, collisions, time)

### Common mistakes
- **Changing the scale without changing the divisor.** 65.5 for ±500; if you write 131, the angles come out at half.
- **Not measuring the gyroscope bias.** When still, `gz` should be zero; if not, the heading slides over time.
- **Wrapping the heading to 0-360 and then filtering it.** Do the wrapping only on the angle difference.
- **Driving the motor inside the behaviour.** A behaviour only returns a suggestion; the arbiter drives the motor.
- **A single-threshold `KAC`.** The robot jitters around the threshold; the start and end thresholds must be separate.
- **Mixing up degrees and radians.** `cos()` and `sin()` want radians, the servo wants degrees.
- **Writing an unreachable target to the servo.** Check the reach and the servo limit first.
- **Integer division.** `(2400 - 544) / 180` comes out as 10; when working out the ratio, one of them must be a `float`.
- **Opening and closing the gripper while the arm is moving.** The object falls; only while the arm has stopped.
- **Trusting the position estimate absolutely.** Wheels spinning while pushed against a wall spoil the estimate.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations of the quiz questions you got wrong again, then solve the question again.
3. On paper, work out q1 and q2 for the targets (14, 6) and (10, 10) for an arm with L1 = L2 = 10 cm; then check them with the program.
4. Answer this question in your own words: "What is the arbiter for, and why should a behaviour not drive the motor itself?"
5. In the explorer robot, change the `ARAMA_MS` value and write down how the visit time changes.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct from each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (explorer robot)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Behaviours | The behaviours are mixed up in a single `if` ladder | Three behaviours as separate functions, the arbiter chooses in priority order | A fourth behaviour (for example charging) has been added and its priority justified |
| Position estimate | No estimate, or the starting values are wrong | (x, y) is updated with the distance and the fused heading | The estimation error has been measured, and the drift after a collision explained |
| Safety | The robot collides often, `KAC` has no two thresholds | `KAC` has two thresholds, the number of collisions is within the threshold | Extra measures have been considered for obstacles coming from the sides |
| Task and measurement | The area is not reached, no numbers | The area visit and the coverage have been measured with numbers | A comparison run has been done with `KAC` switched off |
| Explanation | Cannot explain what they did | Explains the behaviours and the position calculation step by step | Explains a mistake they made and how they found it, and the limits |

### Note for parents and teachers
- **Purpose.** This week teaches putting the parts together more than giving separate facts. Making mistakes is safe; the robot and arm in the simulation cannot be damaged.
- **How to help.** When the learner gets stuck, instead of giving the answer, ask these: "Which sensor gives this information?", "Which behaviour is active right now, and what does the serial output say?", "Did you give the angle in degrees or radians?"
- **Working with numbers.** Measurements such as coverage, collisions and error (mm) teach the learner to give evidence instead of saying "it went well". Encourage the learner to look at the numbers after every change.
- **Safety.** On a real robot, a separate power supply and a common GND are used for the motors and servos; do not power the servos from the Arduino's 5 V pin. When fitting the battery, do not connect plus and minus the wrong way round, and do not let the terminals touch each other. No circuit is ever built with mains voltage (220 V).
- **What may be different on a real robot.** In the simulation the wheels do not slip, the servo carries no load and the ultrasonic beam is a single straight line. On a real robot all of these spoil the result; that is why everything must be measured and calibrated again on real hardware.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).

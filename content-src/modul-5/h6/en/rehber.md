### Week goals
By the end of this week the learner can:
1. Work out the tilt angle from the accelerometer with `atan2(ax, az)` and the rotation speed from the gyroscope; explain the gyroscope's scale and bias.
2. Write the complementary filter's formula and work out the time constant from `α` and `dt` (`τ = α · dt / (1 − α)`).
3. Explain, based on measurement, the difference between a `delay()` loop and a fixed-period loop planned with `micros()`.
4. Explain that in cascade control the outer loop (position and speed) gives the inner loop (angle) a target angle, and why the outer loop must be slow.
5. Combine the four parts into a balance program that detects falls and gives its own report; know that simulation gains cannot be carried over to a real robot.

### The week's plan
The week has five lessons. The plan below is for one lesson a day; set aside extra time for the project lesson. This week the robot is a simulation (an inverted pendulum model).

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Measuring tilt with an IMU | ~20 min | Read the explainer, run the tilt and speed program, measure the gyroscope bias, solve the mini quiz. |
| 2 | The complementary filter and an introduction to Kalman | ~25 min | Watch the three angles (acceleration, gyro, filter) side by side, change the `ALFA` value, compare the errors. |
| 3 | A fixed-period control loop | ~25 min | Measure the real time of a `delay()` loop, run the fixed-period version, try different periods. |
| 4 | Cascade PID: angle and speed | ~30 min | See the drift, add the cascade, change the outer loop speed (`DIS_ORAN`). |
| 5 | Project: a self-balancing robot | ~35 min | Run the project, give a push, read the report, do the uncontrolled experiment, assess with the rubric. |

### Prerequisite check
Before you start, check these:
- From Module 4, can the learner read the MPU6050 with raw `Wire`? (Lesson 58) Have they seen the complementary filter for the first time? (Lesson 59)
- From Week 5, can they say what the P and D terms do? (Lessons 96-97)
- From Module 3, do they remember non-blocking timing with `millis()` and a state machine with `enum`? (Lessons 27 and 28)
- From Week 1, do they know the idea of motor direction, PWM and the dead zone? (Lessons 77-78)
- Are they familiar with the idea of degrees, radians and basic trigonometry (sine, cosine)? If needed, looking at the table in lesson 101 is enough.

### Concept map
- **Measurement:** accelerometer (gravity, `atan2`) → gyroscope (speed, scale, bias)
- **Combining:** complementary filter → `α`, `dt`, time constant `τ` → introduction to Kalman
- **Timing:** `dt` → the `delay()` trap → planned time (`+=`) → overrun, `micros()` wrap-around
- **Control:** angle PD → drift → cascade (outer loop target angle, inner loop motor command) → target angle limit
- **Project:** state machine (DENGE, KONTROLSUZ, DUSTU) → largest tilt, settling time → from simulation to real robot

### Common mistakes
- **Leaving radians.** `atan2` gives radians; for gains in degrees, multiply by 57.2958.
- **Writing `axHam / 16384`.** Integer division gives zero; write `16384.0`.
- **Not matching the gyroscope scale to the range.** 65.5 for ±500 °/s, 131 for ±250 °/s.
- **Holding the robot while measuring the bias.** The bias comes out wrong and spoils every measurement.
- **Forgetting the `hiz * dt` term in the filter, or starting the filter from 0.**
- **Thinking `delay(5)` gives a 5 ms period.** The round time is 5 ms plus the time of the work.
- **Writing `sonPlanUs = simdi`.** Delays build up; use `+=`.
- **Running the outer loop at the same speed as the inner loop.** The two loops chase each other.
- **Working out the target angle and not using it in the inner loop, or putting the signs of `KX`, `KV` the wrong way round.**
- **Checking the fall threshold in only one direction.** Use `fabs(aci)`.
- **Copying the simulation gains onto a real robot.** The gains are specific to the robot and are tuned again starting small.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Write the complementary filter's formula without looking. Work out `τ` for `α = 0,98` and `dt = 0,01 s` (0.49 s).
4. Explain the difference between a `delay()` loop and a fixed-period loop in your own words: "Why `+=` ?"
5. Explain cascade control in one paragraph: what does the outer loop measure, what does it produce, how does the inner loop use it, and why is the outer loop slow?
6. Run the project once more; this time give the push in the opposite direction and compare the reports.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct from each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (a self-balancing robot)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Balance | The robot does not stay upright for 10 seconds | Stays upright for 10 seconds and recovers from the push at 3 seconds | Also recovers from pushes in the opposite direction and of different sizes, and knows the limit |
| Timing | The loop is built with `delay()`, `dt` is written as a constant | A fixed period based on the planned time, `dt` is measured | Has an overrun counter, has changed the period and measured its effect |
| Control | Angle PD only, the robot drifts | The cascade works, the target angle is limited | Changes the outer loop speed and gain and explains the result |
| Safety and report | The motors are not cut when it falls, or there is no report | A fall is detected in both directions; the largest tilt and the settling time are reported | Has compared with the uncontrolled experiment, measures the gyroscope bias at start-up |
| Explanation | Cannot explain what they did | Explains the four parts and their order | Explains what will change when moving from the simulation to a real robot |

### Note for parents and teachers
- **Purpose.** This week the aim is for the child to combine measuring, filtering and feedback control. The robot is a simulation; a robot that falls over is not a mistake but a measurement, and it is reset with ↺.
- **How to help.** Instead of giving the answer, ask these: "Which way is the robot leaning, and which way is the motor going?", "Which sensor produces this number?", "How many milliseconds does this loop really take, and how do you know?"
- **Hard points.** Trigonometry (`atan2`) and the time constant can feel abstract at first; the ax/az table in lesson 101 and the numerical examples in lesson 102 help. Cascade control is one of the most abstract ideas in this course; it should not be rushed.
- **Simulation and reality.** The gain numbers in the lessons belong to the robot in the simulation. If a real robot is built later, the same values will not work; the structure is the same, the numbers are tuned again. A real robot needs adult supervision for motor and battery safety; no circuit is ever built with mains voltage (220 V).
- **Time.** The project lesson is long; you are free to split it into two sessions.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).

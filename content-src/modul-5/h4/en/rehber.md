### Goals for the week
By the end of this week the learner:
1. Can explain that an encoder produces ticks and work out how a tick is turned into distance (circumference / number of slots).
2. Can count ticks with an interrupt and use the counter with `volatile` and safe reading.
3. Can work out speed from a window and a tick difference; can explain the effect of quantisation and of the window length.
4. Can make the robot go straight with P correction based on the tick difference, and say why the correction does not bring the drift to zero.
5. Can work out x, y and θ with the odometry formulas; can tell apart the two sources of error (resolution, wrong constants).
6. Can plan a robot that draws a square and a figure of eight, measure the return-to-start error and compare it with a tolerance.

### Plan for the week
The week has five lessons; the first four take about 25-30 minutes and the project 35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The wheel encoder: tick → distance | ~25 min | Read the explainer, work out the tick distance by hand, run the 1 m run, do the mini quiz. |
| 2 | Counting with interrupts and working out speed | ~25 min | Apply the speed formula, set the window to 100 and 500 ms, compare the quantisation. |
| 3 | Driving straight: matching the two wheels | ~25 min | Compare the runs without correction and with P correction, try KP values. |
| 4 | Odometry: estimating position and heading, and drift | ~30 min | Apply the formulas by hand, compare the estimate with the real position, do the CHANGE and wrong-constant experiments. |
| 5 | Project: A robot that draws a square and a figure of eight | ~35 min | Write the plan in a table, make the robot draw the shapes, measure the return-to-start error. |

### Prerequisite check
Before you start, check:
- Do they remember the idea of interrupts and `attachInterrupt`? (Module 3, lesson 29)
- Do they know how to measure time without blocking using `millis()`? (Module 3, lesson 27)
- Are driving a two-motor robot forward and differential drive familiar? (Module 5, week 1)
- Are they comfortable with the four operations, percentages and decimals? There are a lot of number calculations this week.
- Sine, cosine and radians are briefly revised in lesson 4 of the week; if the learner is seeing them for the first time, the teacher can help.

### Concept map
- **Measuring:** encoder disc → tick → tick distance (circumference / slots) → counting with interrupts → `volatile` and safe reading
- **Speed:** window → counter difference → speed = Δticks · tick distance / Δt → quantisation → the window compromise
- **Driving straight:** difference between two motors → tick difference → build-up → P correction (KP) → remaining drift
- **Odometry:** Δs, Δθ → x, y, θ → resolution error → systematic error → build-up
- **Project:** three movements (straight, turn, circle) → absolute angle target → dead zone → return-to-start error → tolerance

### Common mistakes
- **Using the diameter instead of the radius.** The tick distance comes out twice as large.
- **Mixing up centimetres and metres.** First convert all lengths to the same unit.
- **Not making the counter `volatile`, or reading a 2-byte counter without switching interrupts off.**
- **Resetting the counter at the end of the window.** Storing the previous value and taking the difference is safer.
- **Writing the sign of the correction the wrong way round.** The slow wheel slows down even more.
- **Mixing up degrees and radians.** `cos` and `sin` want radians.
- **Turning with a fixed number of ticks or a relative angle.** The error builds up at every corner; use an absolute angle target.
- **Trusting odometry's own estimate completely.** Measure the real error from outside.

### End-of-week review
1. Look at each lesson's concept cards and read the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong again, then solve the question again.
3. Work out the tick distance by hand for a different wheel (for example radius 4 cm, 24 slots) and find how many ticks are needed for 1 m.
4. Run the same path with `KP = 0` and `KP = 20` and compare the drift; explain the difference in your own words.
5. Answer this question: "Why can odometry not see its own error?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson where you fall short.

### Project assessment rubric (A robot that draws a square and a figure of eight)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Plan | No plan | Tick targets worked out for straight, turn and circle | The calculations match the code and the dead zone calculation is explained |
| Driving straight | The robot clearly drifts sideways | P correction works, the counters are roughly equal | Compares KP values and justifies their choice |
| Turning | Turns with fixed ticks, the corners do not line up | Uses an absolute angle target | Explains the turning error (tick resolution) |
| Result | The distance from the start has not been measured | The distance has been measured and compared with the tolerance | Compares with KP = 0 and shows the effect of the correction |
| Explaining | Cannot explain what they did | Explains the plan and the result step by step | Names the sources of error and what will be different on a real robot |

### Note for parents and teachers
- **Aim.** This week the learner finds out how the robot knows "how far I have gone and where I am". The ideas of measurement, error and tolerance are the foundation of scientific thinking; do not expect "exactly zero error".
- **How to help.** When they get stuck, instead of giving the answer, ask: "What does the counter show, and how do you turn that into centimetres?", "Does the error happen first, or the correction?", "Which number was measured, and which is an estimate?"
- **Time.** It is a week full of calculations; spreading the lessons over several days helps the learning stick.
- **Safety.** Everything on this platform is virtual. If a real robot is built, do not power the motors from the Arduino's 5 V pin, use a separate battery, do not short the battery, and do the first test with the robot lifted off the ground. No circuit is ever built with mains voltage (220 V).
- **A note on reality.** In the simulation the wheel does not slip; on a real robot the errors can be clearly larger than those measured here.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent has been given).

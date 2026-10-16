### Goals for the week
By the end of this week the learner can:
1. Say what the accelerometer measures on the x, y and z axes; explain that motion blocks only run when the state changes.
2. Read the values of the temperature, light and sound sensors (temperature -5..50, light and sound 0..255) and make a decision with a threshold.
3. Work out how many LEDs a bar graph lights up with the sum value ÷ largest × 25.
4. Match compass degrees with directions and build the angle of the arrow pointing north as 360 minus compass.
5. Make an Environment station with three sensors, using a variable and the remainder operation, where a button changes the mode.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan is for one lesson a day. On a busier timetable, you can combine two lessons.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Accelerometer: shake and tilt | ~20 min | Read the explainer, shake and tilt the virtual card, build the magic ball, do the mini quiz. |
| 2 | Temperature and light | ~25 min | Change the temperature and light with the sliders, do the threshold and bar graph sums, build the mini weather station. |
| 3 | Compass: find north | ~25 min | Match compass degrees with directions, draw the north arrow with the 360 minus compass rule. |
| 4 | Sound level: clap counter | ~25 min | Choose the right threshold, count claps with a variable, work out the round time. |
| 5 | Project: Environment station | ~35 min | Write the plan, change the mode with A, show the bar and the number, assess the project with the rubric. |

### Prerequisite check
This week uses the topics of week 1 and week 2. Before you start, check:
- Can the learner attach a program stack to an event (button) block? (Week 2, lesson 6)
- Can they make a variable and make it go up with "change by"? (Lesson 7)
- Can they use the if ... then ... else block? (Lesson 8)
- Do they know what the forever block does? (Lesson 5)
- Are they comfortable with sums such as multiplication, division and proportions (0.4 × 25)?

### Concept map
- **Sensing:** sensor → virtual slider → moment of reading → threshold
- **Motion:** accelerometer → x, y, z → position (threshold 700) → motion event (only on a change)
- **Direction:** compass (0 north, 90 east, 180 south, 270 west) → 360 ≡ 0 → arrow angle = 360 − compass → eight-direction arrow
- **Display:** bar graph (value ÷ largest × 25) → managing the screen from one place
- **Program:** variable → counter → remainder operation → mode → get it ready first, then draw

### Common mistakes
- **Trying the same tilt again.** Tilting a card that is already tilted left to the left again does not produce an event; set it face up first.
- **Thinking the threshold is below 700.** One axis must be the largest and at least 700; a small slide does not count as a tilt.
- **Forgetting the boundary value.** The condition temperature > 30 is false at 30; the sad face comes up at 31.
- **Typing the wrong largest value.** Light goes up to 255; if the largest value is left at 5, the screen fills up straight away.
- **Making the arrow's angle the compass value directly.** The arrow turns with the card; you need 360 − compass.
- **Leaving plus instead of minus.** The arithmetic block adds by default; change the sign to −.
- **Choosing a threshold below the room noise.** Room noise is about 20; if the threshold is 10, the counter keeps going up.
- **Writing to the screen from two places.** If both forever and a button event draw, the picture gets mixed up.
- **Writing mod + 1 instead of the remainder.** The mode does not go back to the start; it grows as 3, 4, 5.

### End-of-week review
1. Look at the concept cards of each lesson and read the "common mistake" lines out loud.
2. Read the explanations of the questions you got wrong in the mini quizzes again, then do the question again.
3. Do the bar graph sum by hand: (temperature 12, largest 40), (light 100, largest 255), (sound 255, largest 255). Then test it on the virtual card.
4. Guess first which way the arrow points when the compass is 0, 90, 180, 270 and 45, then check by running it.
5. Answer in your own words: "Why do motion blocks not run a second time on the same tilt?" and "Why did we use 360 minus compass?"

The mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that needs more work.

### Project rubric (Environment station)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Sensors | Only one sensor works | Temperature, light and sound each appear as a bar in their own mode | Each sensor has the right largest value (40 and 255), and the bar changes in proportion when the value changes |
| Changing mode | A does not change the mode, or the mode keeps growing after 3 | With every press, A moves on in the order 0, 1, 2 and goes back to the start | Adds a fourth mode (compass) and updates the divisor on their own |
| Showing the number | The number does not appear when B is pressed | While B is held down, the number of the selected sensor scrolls | The screen is drawn only from the forever block, and they can explain why |
| Program layout | The same screen is written to from more than one place | okuma and enCok are got ready first, then drawn | The variable names are clear and a warning has been added (for example a heart when the temperature is high) |
| Explaining | Cannot explain what they did | Explains the program step by step | Explains a mistake they made, how they found it, and the bar sum |

### Note for parents and teachers
- **Aim.** This week is about measuring and deciding: a value is read, compared with a threshold and shown on the screen. Pointing out that the learner gives the values of the virtual sensors themselves gets them thinking about the difference between "measuring" and "setting".
- **How can you help?** Instead of giving the answer, ask these questions: "What is this sensor reading right now?", "What is the threshold, and is this value bigger than it?", "From how many places are you writing to the screen?"
- **Sums.** The bar graph and compass sums are small but real maths; when the learner works them out by hand and checks them on the virtual card, the connection sticks.
- **Sound and privacy.** The sound level is a virtual slider; no real microphone is used. You can discuss with the learner that real devices need privacy rules when they listen to sound.
- **Safety.** Everything on this platform is virtual. If the lessons move on to using a real card, no circuit is ever built with mains voltage (220 V).
- **Progress.** Mini quiz results are shown by skill on the "My progress" page (draft/pilot feature; only saved if consent was given).

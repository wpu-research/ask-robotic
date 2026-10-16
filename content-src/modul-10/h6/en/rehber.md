### Week goals
By the end of this week, the learner:
1. Can work out beats per minute with a 10-second measurement and a multiplication; can manage the counting time with a flag variable.
2. Can count events with the **when card is shaken** hat block; can explain the difference between the equal and greater-than-or-equal conditions, and the remainder (mod) operation.
3. Can describe a device such as an alarm as states and moves between them, and build it with variables.
4. Can turn a sensor value (0-1023) into a percentage with **map**; can use a threshold, a bar graph and the console.
5. Can write a project in which two cards talk by radio as a plan first, and then build it.

### Plan for the week
The week has five lessons; each lesson takes about 25-40 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Pulse meter | ~28 min | Read the explainer, start the 10-second measurement with B, press A 12 times, see 72, do the mini quiz. |
| 2 | Step counter | ~25 min | Shake the card, read the steps with A, see the celebration on the 10th step, try the "= or >=" difference. |
| 3 | Alarm | ~28 min | Set up the three states, watch the kurulu and alarm variables, turn it off with an A+B long press. |
| 4 | Humidity and temperature station | ~30 min | Turn the moisture into a percentage with the P1 slider, try the bar graph and the console, change the threshold. |
| 5 | Project: Smart plant pot (final) | ~40 min | Draw the plan, set up the two cards, have them watch each other's moisture by radio, assess yourself. |

### Prerequisite check
This week puts together parts from the earlier weeks. Before you start, check:
- Can they make a variable, set a value and change the value by an amount? (Lesson 7)
- Can they use the **if ... then** and comparison blocks? (Lesson 8)
- Do they know the button hat blocks and the long press? (Lessons 6 and 9)
- Do they know the **when card is shaken** hat block and the **bar graph** block? (Lessons 11 and 12)
- Do they know the **play melody** block and the radio send/receive blocks? (Lessons 18, 21 and 22)
- Are they used to the idea of percentage and proportion? (such as 50 / 100)

### Concept map
- **Counting and measuring:** flag variable → pause block → sayac x 6
- **Event and condition:** when card is shaken → adim = 10 / adim >= 10 → remainder operation
- **State:** off → set → ringing → turn off; the kurulu and alarm variables
- **Sensor:** analog read (0-1023) → map (0-100) → threshold → bar graph and console
- **Project:** plan → send every 2000 ms → when a message arrives, react with the received value

### Common mistakes
- **Turning the flag on in the wrong place.** If you set olcum to 1 after the pause block, nothing is counted during the wait.
- **Not resetting the counter.** The second measurement is added on top of the first (such as 126).
- **Forgetting the multiplier or choosing the wrong one.** time x multiplier must be 60.
- **Putting the counting block inside the if.** The variable does not go up, and the condition is never true.
- **Using greater-than-or-equal instead of equal.** The celebration repeats on every step after the 10th.
- **Only half turning off the alarm.** Only stopping the sound; the alarm variable stays 1 and the melody starts again.
- **Writing the ranges in the map block the wrong way round.** The value 512 becomes 5238 instead of 50.
- **Putting the threshold sign the wrong way round.** If you write nem > 30, it warns you when it is wet.
- **Reading its own sensor on the receiving card.** The received value in the message that arrives should be used.
- **Writing the message name differently.** "nem" and "Nem" do not count as equal.
- **Leaving the wrong largest value in the bar graph.** If the moisture is a percentage, it must be 100.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the questions you got wrong in the mini quizzes, then answer the question again.
3. Build the pulse meter again without looking. Then make the measurement time 15 seconds, change the multiplier and find the same result.
4. Draw the state table for the alarm on paper: three states, and which event changes which state.
5. Set the P1 slider to 0, 100, 300, 512 and 1023; guess the percentage for each one, then compare in the console.
6. Answer this question in your own words: "Why does the pause block not stop the other buttons?"

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Smart plant pot)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Plan | No plan | When the four hat blocks run is written down | The plan matches the code exactly, and why the threshold was chosen is explained |
| Measuring | The moisture is shown as a raw number | The P1 value has been turned into 0-100 with map | The threshold is kept in a variable and can be changed easily |
| Radio | The cards do not see each other | The two cards are in the same group, the moisture message goes out and the receiving card uses the received value | The message name and the group have been checked, and an extra message (such as temperature) has been added |
| Reaction | There is no warning, or it rings all the time | Below 30 moisture, a sad face and the melody; otherwise a bar graph | The bar graph is correctly scaled, and they can explain what happens to messages that arrive while the melody plays |
| Explanation | Cannot explain what they did | Explains the program in three sentences | Explains a mistake they made and how they found it, and where they used the parts from the lessons |

### Note for parents and teachers
- **Aim.** The week is not about memorising, but about the learner building a small "product" by putting the earlier weeks together. Each lesson produces a device (pulse meter, step counter, alarm, station).
- **How to help.** When they get stuck, do not give the answer; ask these questions: "Which event runs this hat block?", "What are the values of the variables at that moment?", "Did you put this block inside or outside the if?", "Which card are you reading from: the message that arrived or its own pin?"
- **Health note.** The pulse meter is a learning tool, not a medical measurement. For a real health concern, ask an adult or a doctor.
- **Time.** Spacing the lessons out, rather than doing them one after another on the same day, helps the learning stick. It is a good idea to do the final project on a different day.
- **Safety.** Everything on this platform is virtual; no real sensor, battery or radio is used.
- **Progress.** The mini quiz results at the end of each lesson appear by skill on the "My progress" page (a draft/pilot feature; saved only if consent has been given).

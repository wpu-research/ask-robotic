### Goals for the week
By the end of this week the learner can:
1. Name the parts of the Micro Card (the 25-LED screen, the A and B buttons, the logo, P0-P2) and say what a virtual card is.
2. Attach blocks to a header block (on start, forever) in the block editor and run them with ▶; explain that blocks run from top to bottom, in order.
3. Light up single LEDs using the (x, y) address of the LEDs, counting from 0 and the logic of clearing the screen and pausing.
4. Show ready-made icons and a 5 x 5 pattern they drew themselves; make an animation by putting a pause between two drawings.
5. Build a project with a rhythm (Beating heart) using the repeat block and pause times; work out the total time of a loop.

### Plan for the week
The week has five lessons; each lesson takes about 15-30 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Hello, Micro Card | ~15 min | Read the explainer, get to know the parts of the card, show text and a number, do the mini quiz. |
| 2 | The address of the LEDs: x and y | ~20 min | Draw the diagonal line and the four corners, write the addresses on paper and check them. |
| 3 | Icons and your own pattern | ~20 min | Show the faces, draw the robot head, put a pause between two drawings and make an animation. |
| 4 | Order and repetition | ~20 min | Build the three blinks with repeat, change the numbers and times and try them out. |
| 5 | Project: Beating heart | ~30 min | Write the plan in a table, build the heart, change the rhythm, assess it with the project rubric. |

### Prerequisite check
No special prior knowledge is needed this week. Before you start, check these:
- Does the Micro Card editor open in the browser, and does the ▶ button work?
- Can the learner grab and drag a block with the mouse (or a finger)?
- Can they count from 0 to 10 and do addition and multiplication? (This is needed for the time sums.)

### Concept map
- **Card:** LED screen (5 x 5 = 25) → buttons and logo → virtual card
- **Program:** header block (on start, forever) → blocks from top to bottom → JavaScript and Python view (read-only)
- **Screen:** text (scrolls) and a single character (stays) → LED address (x, y) → icon and pattern → clear screen
- **Time:** pause (ms) → animation → repeat → round time and total time
- **Project:** plan table → brightness (0-255) → rhythm

### Common mistakes
- **Leaving a block outside the header block.** It looks faded and never runs.
- **Not pressing the ▶ button after a change.** The old program stays on the screen.
- **Mixing up x and y, or counting from 1.** (4, 0) is the top right corner; the largest address is 4, not 5. An address outside the screen is ignored without an error.
- **Not adding a pause.** With two drawings one after the other, only the last one is seen; something that is drawn and cleared straight away is not visible either.
- **Forgetting to clear.** When blinking, the square never goes off.
- **Attaching a block inside/outside repeat by mistake.** What is inside runs in every round; what is outside runs once.
- **Putting the text inside forever.** It scrolls again in every round and spoils the heartbeat.
- **Setting the brightness to 0 and thinking the program is broken.** The screen is dark, but the program is running.

### End-of-week review
1. Look at the concept cards of each lesson once more and read the "common mistake" lines out loud.
2. Read the explanations of the questions you got wrong in the mini quizzes again, then do the question again.
3. Build the program that lights up the four corners from scratch, without looking; then try lighting up the whole frame (16 LEDs).
4. Write a pattern you drew yourself on paper with 1s and 0s, count how many LEDs are on and check it in the editor.
5. Work out the round time of the beating heart and the number of rounds per minute; then change the pause times and explain how the speed changes.

The mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that needs more work.

### Project rubric (Beating heart)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Structure | Blocks are outside the header block, or the program does not run | The text is inside on start, the heart inside forever | It matches the plan table exactly, and the learner explains why the parts are separate |
| Look | The heart or the small heart does not appear | The big and small hearts appear in turn, and the brightness is set | Chose the brightness on purpose and explains why |
| Rhythm | There are no pauses, or they are too short | The lub-dub and the rest can be told apart | Makes a fast and a slow rhythm and works out the round time |
| Debugging | Cannot find the cause when stuck | Finds the mistake by asking or looking | Finds the mistake on their own and explains how they found it |
| Explaining | Cannot explain what they did | Explains the blocks in order | Finds and fixes the mistake in a friend's program |

### Note for parents and teachers
- **Aim.** This week is not about memorising; it is about the child getting used to thinking in blocks and seeing the result straight away. The card is virtual; making mistakes is safe, and ↺ resets it.
- **How can you help?** Instead of giving the answer, ask: "Which block runs first?", "Is this block attached to the on start block?", "Did you add a pause?", "Which address did you type, and where on the screen is it?"
- **Time.** Rather than doing the lessons back to back, one lesson a day with a short review helps learning stick. If the child is 8, work through the reading and the number work together.
- **Screen time.** The lessons are short; taking breaks is better than long sessions.
- **Progress.** The results of the mini quiz at the end of each lesson are shown by skill (draft/pilot feature; only saved if consent was given).

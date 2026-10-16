### Goals for the week
By the end of this week the learner can:
1. Describe a game's skeleton (player, goal, danger, winning, losing) with the five-question design card.
2. Set the score and lives when the game starts, and write the winning rule correctly with `≥`.
3. Build difficulty that grows over time with variables, and memory (such as a key) with a flag.
4. Choose one of two paths with `if … do … else`, and turn tile coordinates into pixels.
5. Find and fix the bugs in a broken game with the four-step detective method, and add polish such as sounds and shakes to a game.
6. Make a complete game from their own idea, in four rounds, that meets all eight goals.

### Plan for the week
The week has five lessons. The plan is for one lesson a day; because the final lesson is longer, it is a good idea to set aside a separate day for it.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Game skeleton: player, goal, score, ending | ~25 min | Fill in the design card, build the cat and apples game, try the difference between ≥ and =. |
| 2 | Full game 1: Space defence | ~30 min | Build the hitting, lives, time and difficulty rules in order; change the increase and balance it. |
| 3 | Full game 2: Maze escape | ~30 min | Write the key flag and the two-branch door rule; adjust the ghost's speed. |
| 4 | Polish and debugging: fix the broken game | ~25 min | Fix three bugs with the detective method, then add sounds and shakes. |
| 5 | Final: Your own game | ~40 min | Fill in the card, make the game in four rounds, get the goals to ✓ and have a friend play the game. |

### Prerequisite check
This week uses the blocks from earlier weeks. Before you start, these should feel comfortable:
- Creating sprites, moving with the arrow keys and the collision event (weeks 1 and 2)
- The score, lives and the `change score` block
- Creating a variable, and the difference between `change by` and `set`
- The Map tab, tiles and enemies that follow (weeks 3 and 4; for the maze lesson)
- Simple multiplication, division and addition (for speed and time calculations)

### Concept map
- **Design:** design card → player, goal, danger → winning and losing rules
- **Rules:** event + condition → collision event (once) → every frame event (60 times a second)
- **Memory:** variable → flag (0 or 1) → a bridge between events
- **Decisions:** `if … do` → the `else` branch → the difference between `≥` and `=`
- **Difficulty and time:** `every N ms` → countdown → `when time runs out` → balance
- **Quality:** detective method → debugging → polish → Goals panel

### Common mistakes
- **Putting the win check outside the event.** The score changes but the rule is never asked.
- **Writing `score = 3`.** If the score skips (2, 4, 6), it never triggers; use `≥`.
- **`change by` instead of `set`, or the other way round.** You expect an increase, but the value stays fixed.
- **Not setting the flag to 1, or not setting it to 0 at the start.** The door stays locked for ever.
- **Typing pixels into a tile block.** The numbers start from 0, and a tile is 16 pixels.
- **Not deleting the sprite in an every-frame rule.** The `every frame` event runs 60 times a second, and three lives go in 50 ms.
- **Choosing the wrong sprite kind.** If the event expects Food, a sprite of the Object kind does not trigger the event.
- **Pressing the ↺ Start over button in the activity.** The blocks are deleted; to test the game, use the ↺ on the stage.

### End-of-week review
1. Read each lesson's concept cards again and say the "common mistake" lines out loud.
2. Read again the explanations of the mini quiz questions you got wrong, then answer the question again.
3. In space defence, change the increase from 5 to 10. Work out the `hiz` value at 28 seconds and the speed of the slowest alien, then try it in the game.
4. Add a second key and a second door to maze escape. Write on paper first which flags you will use.
5. Ask a friend to play your own game; watch without saying anything. Where did they get stuck in the first 10 seconds?

As an end-of-week test, the five lessons' mini quizzes are enough: 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (My final game)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Design | No card; the aim of the game is unclear | All five questions are answered and match the game | The card matches the game exactly; the player understands the aim in the first 10 seconds |
| Rules | The score or lives do not work | The score goes up when you collect something; lives go down when you touch the danger | An extra rule such as time, a flag or levels has been added |
| Ending | The game cannot be won, or never ends | Winning and losing both work | A meaningful message is shown for both endings |
| Polish and balance | No sounds or effects; the game is too easy or impossible | There are sounds and at least one effect; the game is playable | The numbers have been tried and adjusted, and the changes are explained |
| Explanation | Cannot explain what they did | Explains the game and its rules step by step | Explains a bug they made and how they found it, using the detective steps |

### Note for parents and teachers
- **Aim.** This week is not about learning things by heart; it is the experience of turning an idea into a product that works from start to finish. The final game is the learner's own design; instead of "make it better", ask "what would you like to add?"
- **How to help.** When they get stuck, do not give the answer. Use the detective method together with questions such as "What is the symptom?", "Which event is running?", "Which block did you suspect?"
- **Time.** The final lesson is 40 minutes; if the learner gets tired, you can take a break between rounds. The game can be tried as many times as you like with ↺.
- **Safety.** Everything runs in the browser; there is no real hardware. If the game file is downloaded to the computer with **Save**, it contains no personal information, but take care not to use a real first name and surname when naming it.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; they are only saved if consent has been given).

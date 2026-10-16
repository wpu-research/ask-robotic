### Week goals
By the end of this week the learner:
1. Can set up a collision event; can explain the difference between `this sprite` and `other sprite` and the role of a sprite's kind.
2. Can manage the score with the `set` and `change` blocks; can make a decision based on the score with `if ... do`.
3. Can produce objects falling from the sky with the `every ... ms` event and a random number; knows how to delete the ones that leave the screen.
4. Can manage the number of lives; can end the game themselves in the `when lives run out` and `when time runs out` events.
5. Can complete a full game (Fruit hunt) made of a goal, a risk and an ending.

### Plan for the week
The week has five lessons; each lesson is about 20-35 minutes. The plan is for one lesson a day.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Eat the apple, pop the ghost | ~20 min | Read the explainer, set up the collision events, try the difference between `this sprite` and `other sprite`, do the mini quiz. |
| 2 | Collect three fruits, win the game | ~22 min | Build the score blocks, add winning with `if score = 3`, try the difference between `=` and `≥`. |
| 3 | Let it rain fruit | ~25 min | Set up the `every 800 ms` event, give a random position and speed, turn the delete setting on and off and see the difference. |
| 4 | Dodge the bombs, keep your lives | ~22 min | Write the bomb collision, the lives, the shaking and the `when lives run out` event. |
| 5 | Project: Fruit hunt | ~35 min | Fill in what is missing (penalty, countdown, winning, losing), play the game, balance it and assess it with the rubric. |

### Prerequisite check
The following are needed from week 1. Check before you start:
- Can they drag a block into the work area and attach it to another block?
- Can they make a new sprite inside `when game starts` and give it a position?
- Can they walk a sprite with the arrow keys, and can they tell apart the x and y of the speed block?
- Can they make a variable and hold a sprite in it?
- Do they know what the ▶ and ↺ buttons do?

### Concept map
- **Interaction:** sprite box → collision → collision event → `this sprite` / `other sprite` → sprite kind
- **State:** score (`set`, `change`) → condition → `if ... do` → `=` and `≥`
- **Producing:** `every ... ms` → new sprite → random number → speed (pixels/s) → delete setting
- **Risk:** lives → danger event → feedback (sound, shaking) → `when lives run out`
- **The whole game:** goal + risk + ending → splitting into events → countdown → `when time runs out` → balance

### Common mistakes
- **Mixing up `this sprite` and `other sprite`.** The wrong sprite is deleted; most of the time the cat disappears.
- **Choosing the wrong sprite kind.** The event never runs; the ghost and the bomb must be Enemy, the fruit Food.
- **Mixing up `set score to` and `change score by`.** The first fixes the score, the second adds.
- **Checking the target with `=`.** If the score jumps over the target, the game is never won; `≥` is safer.
- **Writing the 0 on the wrong axis in the speed block.** The fruit does not fall; it slides sideways.
- **Not deleting the ones that leave the screen.** The number of sprites piles up, and when it passes 500 the game gives an error.
- **Forgetting to end the game inside `when lives run out` or `when time runs out`.** The game carries on with zero lives or zero time.
- **Leaving the countdown block outside an event.** The time never starts.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Build the fruit hunt again without looking: first the collisions, then the score, the falling objects, the lives and last of all the countdown.
4. Change the numbers and predict: if you cut the time to 30 seconds, how does the game change? And if you make the target 12?
5. Answer this question in your own words: "What are a game's goal, risk and ending for?"

The five lessons' mini quizzes are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Fruit hunt)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Collisions | The fruit or bomb collision does not work | The fruit raises the score, the bomb takes a life and both are deleted | Feedback has been added (sound, shaking, message) |
| Rules | There is no winning or losing | There is winning when the score is 8, and losing when the lives or time run out | The target and time have been balanced by playing with them |
| Time | The countdown does not start | There is a 45 second countdown and the game is lost when the time runs out | The time left is used in a message |
| Decision | Checked with `=`, written without understanding | Winning is written with `≥` | Explains why they chose `≥` |
| Explanation | Cannot explain what they did | States the game's goal, risk and ending | Changes something based on feedback from a friend |

### Note for parents and teachers
- **Aim.** This week the aim is to see that making a game means "designing what happens when one thing touches another", not memorising. Making mistakes is safe; you start again with ↺.
- **How to help.** When they get stuck, instead of giving the answer, ask: "Which two things should have touched for this to happen?", "Did you choose the right kinds?", "Are you checking the score after this block?", "Who ends the game?"
- **Game testing.** Let the child have a friend or someone in the family play their game, and watch where they struggle. Half of game design is watching the player.
- **Time.** Spacing the lessons out helps learning stick. A short review between lessons is enough.
- **Screen time and safety.** Everything on this platform is virtual and no personal data is asked for. Making games is different from playing games; do not forget to take breaks.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).

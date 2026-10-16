### Goals for the week
By the end of this week the learner can:
1. Give an enemy a patrol pattern with the timer event (`every ... ms`) and the `reverse speed` block, and calculate the link between speed, time and distance.
2. Build the rule "chase if near, stop if far" with the `follows sprite` and `distance from` blocks, and explain the difference between `stops` and `stops following`.
3. Read direction in degrees (0 up, 90 right, 180 down, 270 left) and give an enemy movement that is hard to predict with a random number.
4. Create a bullet sprite when the A button is pressed, write a collision rule with the Bullet and Enemy kinds, and delete bullets that are no longer used.
5. Finish the "Ghost hunter" game by combining the patrol, follow, shooting, score and lives rules.

### Plan for the week
The week has five lessons; each lesson takes 20-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Patrol: the enemy goes back and forth | ~20 min | Read the explainer, make the bat go back and forth with a timer, change the time and calculate the distance, do the mini quiz. |
| 2 | Follow: the ghost chases you | ~20 min | Try the follow and distance blocks, set the wake-up distance to 40 and 100, talk about the difference. |
| 3 | Random movement: the confused bat | ~20 min | Build a random direction, set the timer to 300 and 2000 ms, say which one is more dangerous. |
| 4 | Shooting: hit it with a laser | ~25 min | Create the laser, set its speed and kind, build the hit rule, delete the bullet. |
| 5 | Project: Ghost hunter | ~35 min | Write the plan in a table, build the five parts one by one, play, and assess with the rubric. |

### Prerequisite check
This week builds on these skills from weeks 1-3; check them before you start:
- Can they create a sprite and give it a kind? (Enemy, Player, Bullet)
- Can they give a sprite a speed and make it stay on screen or bounce?
- Can they build an `if ... else` block?
- Do they know the collision event and the score and lives blocks?
- Can they create a variable and choose a sprite with a variable?

### Concept map
- **Time:** `every frame` (60 a second) · `every N ms` (milliseconds) · distance = speed x time
- **Movement:** speed (x, y) · direction (degrees) · reversing · following · stops
- **Brains:** patrol (its own pattern) · detection threshold (distance < N) · randomness (a formula with a seed)
- **Bullet:** new sprite when a button is pressed · kind (Bullet) · this sprite / other sprite · deleting
- **Game:** plan table · shared kind · score and winning · lives and losing

### Common mistakes
- **Writing the speed again instead of reversing it.** "x speed 40" in the timer does not turn the bat round.
- **The wrong axis when reversing.** If y (up-down) is selected, the sideways speed never changes.
- **Thinking milliseconds are seconds.** 1500 ms is one and a half seconds; change to seconds before working out the distance.
- **Putting the same sprite in both slots of the follow block.** The sprite follows itself and does not move.
- **`stops following` instead of `stops`.** The ghost keeps sliding at its last speed.
- **Putting the distance check inside `when game starts`.** The rule is only tested once.
- **A small range such as 1-100 for direction.** Direction needs 0-359.
- **Creating the laser with the Object kind.** The collision rule expects the Bullet kind and does not run.
- **Never deleting bullets.** Clear away the laser that hits with `delete`, and the one that misses with `delete when it leaves the world`.
- **Putting the win check where the score does not change.** The game may never end.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the mini quiz questions you got wrong, then answer the question again.
3. Build the patrol bat from scratch without looking; set the timer to 1000 and 2000 ms and work out how many pixels the bat goes in one direction, then run it and check.
4. Set the ghost's wake-up distance to 40, 70 and 100; write in one sentence which one makes the game feel fair, and why.
5. Answer this question in your own words: "Why does the collision rule look at a sprite's kind and not its name?"
6. Think of a new kind of enemy (for example, a spider) and draw a plan table for it.

As an end-of-week test, the five lessons' mini quizzes are enough: 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Ghost hunter)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Enemies | The bat or one of the ghosts does not work | The bat bounces; the ghosts come from the top and follow the hunter | The ghosts' speed and making interval are set so that the game is balanced |
| Shooting | No laser comes out when A is pressed, or it goes the wrong way | The laser goes up from the hunter's nose and is deleted when it leaves the screen | An extra has been added, such as two lasers or the B button |
| Collision and score | A hit gives no score, or the laser is not deleted | A hit gives 1 point; the laser and the ghost are removed | There are winning and losing messages |
| Lives | Lives do not change when an enemy touches | Lives go down, the screen shakes, the enemy is deleted | The game ends with `when lives run out` |
| Explanation | Cannot explain what they did | Explains the five parts and their events | Explains a bug they made and how they found it |

### Note for parents and teachers
- **Aim.** This week the child learns the idea of "setting rules": an enemy is controlled by a timer, a distance or a random number. Because blocks are dragged instead of code being typed, the result appears on the screen straight away.
- **How to help.** When they get stuck, instead of giving the answer, ask: "Which event runs this block?", "What is the sign of the speed?", "What is the sprite's kind?", "Is this block inside the event?"
- **Making mistakes is safe.** Everything is virtual; nothing breaks when the ↺ button rewinds the game. Block changes do not reach the running game; you need ↺ first.
- **Numbers.** The speed and distance calculations use the four operations; the distance question does not need Pythagoras to be known already, as the numbers are chosen close to the 3-4-5 ratio, as in the examples given.
- **Enemy design.** Whether a game is fair is an important design question; talking with the child about "is it possible to escape from this enemy?" builds both maths and design thinking.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; they are only saved if consent has been given).

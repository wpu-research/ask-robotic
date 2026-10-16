### Goals for the week
By the end of this week the learner can:
1. Say the difference between speed and acceleration, and set up gravity as a downward acceleration.
2. Build a jump as a minus y speed and stop jumps in mid-air with the `touching a wall below?` condition.
3. Write a `touches tile` event for passable tiles such as gold, spikes and doors, and use the `event tile` blocks.
4. Separate a collision into a "stomp" and a "side hit" using falling speed and position tests.
5. Plan the week's pieces with a rules table and combine them in a single platform level.

### Plan for the week
The week has five lessons. The plan below is for one lesson a day; the last day is longer because it is the project.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Gravity: let the hero land | ~20 min | Read the explainer, build the acceleration block, choose left-right as the way of moving, do the mini quiz. |
| 2 | Jumping: jump with A | ~20 min | Try the jump speed, add the `if` condition, stop jumps in mid-air. |
| 3 | Platforms, gold and spikes | ~25 min | Build the gold and spike events, try clearing tiles. |
| 4 | Jump on the enemy | ~25 min | Build the two tests, test the stomp and the side hit. |
| 5 | Project: Platform jumper | ~35 min | Fill in the rules table, write the gold, spike and door events, play the game and adjust it. |

### Prerequisite check
This week needs the following knowledge; if anything is missing, repeat the lesson concerned:
- Creating a sprite and using the `set speed x y` block (Module 11, lessons 1-4).
- Knowing the collision event and the idea of `other sprite` (lesson 6).
- Using the `if` block and the score/lives blocks (lessons 7 and 9).
- The tile map, walls and the `touches tile` event (lessons 11-13), and the camera (lesson 14).
- The learner should be comfortable with addition and multiplication; this week has speed x time calculations.

### Concept map
- **Physics:** speed → acceleration → gravity (positive acceleration in the y direction) → jump (minus y speed) → highest point and fall
- **Coordinates:** x grows to the right, y grows downwards → up = minus speed, small y
- **Tile events:** passable tile → `touches tile` → edge triggering → `event tile column / row` → clear the tile
- **Collision:** collision event → `this sprite` / `other sprite` → falling speed and position tests → `and` → `if ... else`
- **Project:** rules table → gold, spikes, door, stomp → camera → testing and adjusting the difficulty

### Common mistakes
- **Choosing in 4 directions as the way of moving.** The engine writes the y speed again from the keys; gravity has almost no effect.
- **Mixing up speed and acceleration.** If you fall with a speed, the hero always goes at the same speed; if you fall with an acceleration, it speeds up.
- **Typing a plus number for the jump speed.** y grows downwards; to jump you need a minus.
- **Not linking the jump to the on-the-ground condition.** The hero jumps in the air too.
- **Setting the sideways speed to zero.** When jumping, the hero's own x speed should go in the `x speed` slot.
- **Not clearing the gold tile, or typing a fixed column/row.** The gold stays where it is, or the wrong tile is cleared.
- **Choosing the wrong event kind.** If you choose Enemy instead of Player, the event does not run.
- **A comparison the wrong way round in the stomp test.** It counts as a stomp when the enemy is on top.
- **Mixing up `this sprite` and `other sprite`.** The hero disappears instead of the enemy.
- **Not resetting the speed after the spikes.** The hero can shoot up into the air from the start with its upward speed.

### End-of-week review
1. Read each lesson's concept cards once more and say the "common mistake" lines out loud.
2. Read again the explanations of the mini quiz questions you got wrong, then answer the question again.
3. Build gravity and jumping from scratch without looking. Set the jump speed to -150, -250 and -350 and compare how high the hero goes.
4. Work out how many seconds it takes to reach the highest point when the speed is -260 and the acceleration 520, then try it in the game.
5. Answer this question in your own words: "How does the game know whether the hero stomped the enemy or hit it from the side?"

As an end-of-week test, the five lessons' mini quizzes are enough; 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Platform jumper)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Movement | The hero does not fall or does not jump | Gravity, walking and jumping work; jumping in mid-air is blocked | Has set the jump strength themselves and explains why |
| Tile events | The gold or spike event does not work | The gold disappears and the score goes up; on the spikes a life is lost and the hero goes back to the start | Resets the speed when going back to the start and says why |
| Door and winning | Nothing happens when the door is touched | A message appears and the game is won | Has changed the winning condition (for example, a score requirement) and thought about the loophole |
| Enemy | The stomp and the side hit are not told apart | A stomp from above gets rid of the enemy; a side hit takes a life | Explains the two tests and shows the effect of changing the threshold |
| Design and explanation | The game is too hard or too easy to play | The level is playable; can explain the rules | Has had a friend play it and adjusted the difficulty |

### Note for parents and teachers
- **Aim.** This week the child does not learn physics formulas by heart; they see by experimenting that gravity and jumping can be set with a number. When talking about speed and acceleration, it is enough to discuss how it feels in the game.
- **How to help.** When they get stuck, instead of giving the answer, ask: "Which block does this?", "What happens if you change the number?", "Is the hero falling, or on the ground?" Guessing together and then trying it works well.
- **Time.** Lessons take 20-35 minutes. Do not rush tasks that need time to experiment, such as adjusting the jump strength.
- **Safety.** Everything runs in the browser; there is no external hardware. Avoiding the spikes is just a game rule.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; they are only saved if consent has been given).

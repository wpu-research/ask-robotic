# Game skeleton: player, goal, score, ending
duration: 25

## Wonder
Chess, football and a computer game look very different, but they all share a skeleton: who are you, what can you do, what are you trying to achieve, and when do you win or lose? A game that answers these questions from the start gets finished much faster than one left half-done. This week we are making complete games; first, learn the skeleton.

## Activity
### The five-question design card
Before you start a game, answer these five questions for yourself (explaining them to a friend works too):
1. **Who is the player?** (a cat, a robot, a ship…) How does it move?
2. **What is the goal?** (collecting, shooting, escaping, reaching a place)
3. **What is the danger?** (enemies, spikes, time…)
4. **How do you win?** (for example, when the score reaches 3)
5. **How do you lose?** (for example, when lives reach 0)

In this lesson you will put the answers into practice with a ready-made game: the player is a cat, the goal is apples, you win at a score of 3, and you lose at 0 lives.

### What is ready
On the stage there is a light blue background, a cat at the bottom left and three apples. The cat does not walk yet, the score and lives are not set, and touching the apples does nothing.

### Build the blocks
1. From the **Controller** category, snap the `[kedi] moves [in 4 directions] with player keys, speed [60]` block at the very bottom of the `when game starts` block. The cat now walks with the arrow keys.
2. From the **Game** category, add the `set score to [0]` and `set lives to [3]` blocks in the same place. The counters should be set when the game starts.
3. From the **Sprite** category, build the `when a [Player] sprite hits a [Food] sprite` event.
4. Inside the event: `change score by [1]`, `play melody [point]`, `delete sprite [other sprite]`.
5. At the bottom, put an `if [score] ≥ [3] do` block from the **Logic** category. (The `score` block is in the **Game** category.) Snap the `show [You win!] on screen for [2] seconds` and `end game: [you win]` blocks inside it.
6. Press ↺. Collect the apples. On the third one, "You win!" appears and the game ends.

Expected result: all five goals ✓. The cat walks, the score and lives are set at the start, the apples disappear when eaten, and the game is won after three apples.

### How does it work?
- Winning and losing are each a **rule**. We wrote the winning rule (`if score ≥ 3`). If we do not write a losing rule, the game is lost by itself when lives reach 0.
- The score and lives variables are the game's own counters; on the screen they appear as the score at the top left and hearts at the top right.
- The collision event does three jobs together: it gives a point, plays a sound and gets rid of the apple. You can put as many blocks as you like inside an event.
- Once the skeleton is complete, it is easy to add pieces such as enemies, a map or time on top of it.

### Try it
1. Add more apples: add new apples with `new [Apple] sprite, kind [Food]`. Raise the winning score to match.
2. Use **Cherry** or **Mushroom** instead of the apple. Does changing the picture of the new apples affect the collision rule?
3. Add a danger to the screen (`new [Ghost] sprite, kind [Enemy]`) and take away a life in the `when a [Player] sprite hits a [Enemy] sprite` event.

### Common mistakes
- Putting the win check outside the collision event: the score changes but the rule is never asked, and the game does not end.
- Writing `score = 3` instead of `if score ≥ 3` and raising the score by more than 1: if the score skips 3 and becomes 4, the win is never triggered. `≥` is safer.
- Not deleting the apple: an eaten apple is still visible on the stage, and it looks as if it has not been eaten.
- Not writing the starting score and lives: the game still works, but someone reading the program cannot see the starting values. Writing the starting values clearly is a good habit.

## Discuss
Which was the hardest answer on the five-question card? If you had a game idea, which question would make things hardest for you if you started without answering it?

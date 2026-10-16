# Polish and debugging: fix the broken game
duration: 25

## Wonder
One day every programmer goes through this: the game runs, but something somewhere is wrong. But where? Debugging is detective work: catch the symptom, look at the clues, find the culprit. In this lesson you will find and fix three bugs in a broken game, and then you will polish the game.

## Activity
### The broken game
A fruit-catching game: the basket (the cat) is at the bottom and fruit falls from the top. But when you play the game, three things are wrong:
1. **Bug 1:** when you catch a fruit, the score goes down instead of up.
2. **Bug 2:** the fruit you caught stays on the screen and keeps falling.
3. **Bug 3:** when a fruit reaches the bottom of the screen, the game ends at once; all three lives go in a flash.

### The detective method
1. **See the symptom:** what is wrong? (the score goes down)
2. **Find the event:** in which event does it happen? (when the fruit hits the basket)
3. **Find the block:** which block inside that event does this? (`change score by [-1]`)
4. **Fix and test:** change the block, press ↺, and check that the symptom has gone.
If the program has an error, a warning appears in the Goals panel and the **Show block** button marks the block with the problem. In the JavaScript tab you can also read the written form of your program (you cannot edit it).

### Fix the bugs
1. **Bug 1:** in the catching event, find the `change score by [-1]` block and change the number to 1.
2. **Bug 2:** add the `delete sprite [other sprite]` block at the very bottom of the same event. The caught fruit disappears.
3. **Bug 3:** look at the `for each [Food] sprite` loop in the `every frame` event. Inside it there is `if [this sprite y position] > [116] do change lives by [-1]`, but it does not delete the fruit. The fruit stays at the bottom and takes a life every frame (60 times a second). Add `delete sprite [this sprite]` inside the `if`.
4. Press ↺ and play. The score goes up, a caught fruit disappears, and a missed fruit takes only one life.

### Polish
5. Add `play melody [point]` from the **Sound** category to the catching event.
6. Add `shake screen for [200] ms` to the missing rule (`if ... > 116`).
7. Play the game once more. Now both catching and missing can be felt.

Expected result: all five goals ✓. When you catch a fruit, the score goes up and a sound plays; a caught fruit disappears; a missed fruit takes only one life and the screen shakes.

### How does it work?
- The cause of bug 3 is that the missing rule is in the `every frame` event. This event runs 60 times a second; if you do not delete the fruit inside it, a life is lost again every frame for the same fruit.
- The collision event, on the other hand, runs only once; not deleting the fruit does not give the score again, but the fruit stays on the stage.
- Sounds and shakes do not touch the game's rules; they just tell the player "something happened". This is called **polish**. Good polish is small but effective.
- These bugs are really common: a sign mistake, forgetting to delete, not limiting a rule that repeats.

### Try it
1. When a fruit is missed, add `play melody [lose]`.
2. Add a rule for winning the game when the score reaches 10 (an `if` inside the collision event).
3. Show a particle effect when you catch a fruit: use the `[yellow] explosion at x [80] y [60]` block from the **Game** category. For x and y, use `[other sprite] [x position]` and `[other sprite] [y position]`.

### Common mistakes
- Solving bug 3 by deleting the "lose a life" block: the game has no bug, but there is no longer any penalty for missing.
- Trying to write the event again from scratch while fixing bug 1: most of the time, changing a single number or sign is enough.
- Making the change and not pressing ↺: the running game uses the old program.
- Making three changes at once and not being able to tell which one worked: fix one thing, test it, then move on to the next.

## Discuss
What do you look at first when you are trying to find a bug? If a friend's game had a bug like this, how would you describe it to them so that they could find it too?

# Collect three fruits, win the game
duration: 22

## Wonder
In games we collect points. But where does the computer keep the points? And which question does it need to ask so that it can say "You collected three fruits, you win!"? In this lesson you will make a game that counts numbers.

## Activity
On the stage there are the cat and three fruits (apple, orange, cherry). They are all of the **Food** kind. The score starts at zero, but nothing makes it go up.

### Score
The game has a ready-made number called the **score**. It is shown in the top corner. Three blocks do the job:
- `set score to [0]`: sets the score to the number you choose.
- `change score by [1]`: adds to the score. If you give a minus number, it takes away.
- `score`: gives the score as a number; you can use it in a condition.

### Build the blocks
1. From the **Sprite** category, put in the `when a [Player] sprite hits a [Food] sprite` event.
2. Attach the `change score by [1]` block from the **Game** category inside it.
3. Underneath, add `delete sprite [other sprite]` (`other sprite` instead of `this sprite`).
4. From the **Sound** category, add the `play melody [point]` block.
5. Press the ▶ button and collect the three fruits. The score becomes 3.
6. Now let's add winning. From the **Logic** category, take the `if ... do` block and attach it at the very bottom of the event.
7. Drop the **=** comparison block from the **Logic** category into the condition slot. Put the `score` block from the **Game** category into the left slot, and the number 3 from the **Math** category into the right slot.
8. Inside the `if` block, attach these in order: `show [You got them all!] on screen for [2] seconds`, `play melody [victory]`, `end game: [you win]`.
9. Press the ↺ button and finish the game. The words YOU WIN! appear on the screen.

Expected result: Each fruit adds 1 to the score and a melody plays. After the third fruit a message appears, the victory melody plays and the game is won.

### How does it work?
- The event runs from the start at every collision. At the first fruit the score becomes 1, the `if` question asks "is the score 3?" and the answer is no. At the third one the answer is yes and the blocks inside it run.
- The `if ... do` block asks a **question**. If the answer is yes, the blocks inside it run; if it is no, they are skipped.
- The **=** block compares two numbers. You can also choose other signs from the drop-down list: such as greater than or less than.
- When the game ends, the Game Workshop shows an end screen. The A button starts the game again.

### Try it
1. Change the comparison from **=** to **≥**. Does it still work after the third fruit? And why is **≥** sometimes safer?
2. Make each fruit give 10 points, and make the score needed to win 30. Which two numbers must you change?
3. Add the `[kedi] says [OK!] for [1] seconds` block so that the cat says it when it gobbles up a fruit.

### Common mistakes
- `set score to [1]` and `change score by [1]` are not the same thing. The first fixes the score at 1, the second adds 1. If the score never goes up, check this.
- If you write text instead of 3 on the right side of the condition, the comparison does not work. Use the number block in the Math category.
- Do not forget to reset the score: make sure `set score to [0]` is inside `when game starts`.

## Discuss
Why are points important in games? How does the score going up make the player feel? If you said "collect as many as you can in 30 seconds" instead of "collect them all", how would the game change?

# Dodge the bombs, keep your lives
duration: 22

## Wonder
Every game has a risk. If you make a mistake you lose something, and most of the time that loss is measured in lives. How does a game say "you are out of lives"? And when you see that message, who decides that the game should end?

## Activity
Bombs have been added to the fruit-catching game. The bombs fall from the sky like the fruits, and their kind is **Enemy**. The basket (the cat) can touch both fruits and bombs. When it touches a fruit the score goes up, but when it touches a bomb nothing happens. The game starts with 3 lives.

### Lives
The game has a ready-made number called **lives**. It is shown as hearts in the corner of the screen.
- `set lives to [3]`: sets the lives.
- `change lives by [-1]`: adds to the lives. A minus number lowers them.
- `lives`: gives the lives as a number.
- When the lives reach **0**, the game ends by itself. But if you use the `when lives run out` block, the decision is yours: you must end the game yourself there.

### Build the blocks
1. First run the game and watch the bombs and fruits fall. Touching a bomb has no effect.
2. From the **Sprite** category, put in the `when a [Player] sprite hits a [Enemy] sprite` event.
3. Attach the `change lives by [-1]` block from the **Game** category inside it.
4. Underneath, add the `shake screen for [250] ms` block.
5. From the **Sound** category, add the `play melody [boom]` block.
6. At the very bottom, put the `delete sprite [other sprite]` block (swallow the bomb).
7. Press the ▶ button. Each time you touch a bomb a heart goes, the screen shakes and the bomb disappears. After the third bomb it says "NO LIVES LEFT".
8. Now let's write our own ending. Bring the `when lives run out` event block from the **Game** category. Attach the `show [You are out of lives!] on screen for [2] seconds`, `play melody [lose]` and `end game: [you lose]` blocks inside it, in order.
9. Press the ↺ button and catch three bombs. Your own message appears and the game is lost.

Expected result: When you touch a bomb, a life goes and the screen shakes. After the third bomb your message appears and the game is lost.

### How does it work?
- Two collision events can run side by side. One waits for fruit, the other for bombs. Each event only runs when its own kinds touch.
- The `when lives run out` event runs once, the moment the lives drop to zero. If you write this block, the game does not end automatically. If you forget to end the game, the game carries on with zero lives.
- Saying `change lives by [-1]` means "add -1 to the lives". The lives never go below 0.

### Try it
1. Make the bomb's penalty take away 2 lives.
2. Make the starting lives 5: change the `set lives to [3]` block inside `when game starts`.
3. Make the screen shake time 100 and then 800 ms. Which one feels better?

### Common mistakes
- If you forget to delete the bomb, the bomb takes a life as it passes over the basket, but then it keeps falling on the stage. What you see is confusing.
- If there is no block that ends the game inside the `when lives run out` block, the game keeps running with zero lives.
- If you choose the wrong kind in the collision event (e.g. Food instead of Enemy), the event runs for the fruit, not for the bomb.

## Discuss
Can you think of another penalty instead of "lives" in a game? (For example, losing time or losing points.) Which one seems fairer to you? What makes you give up on a game that is too easy or too hard?

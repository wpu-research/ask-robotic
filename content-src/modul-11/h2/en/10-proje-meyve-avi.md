# Project: Fruit hunt
duration: 35

## Wonder
You will bring together all of this week's pieces and make a complete game: collisions, score, lives, randomly falling objects and a race against time as well. A good game has a goal, a risk and an ending. In the fruit hunt, the goal is to collect 8 fruits, the risk is the bombs, and the ending is winning or losing.

## Activity
Half of the project is ready: the basket cat walks left and right, fruits and bombs fall, and the score goes up when you catch a fruit. What is missing: the bomb penalty, the countdown, and the rules for winning and losing.

### The rules of the game
- At the start you have 5 lives and 45 seconds.
- If you catch a fruit, the score goes up by 1. When the score is 8, you win.
- If you touch a bomb, you lose 1 life and the screen shakes.
- If you run out of lives or the time runs out, you lose.

### Look first
1. Press the ▶ button to run the game. What works, and what is missing?
2. Read the blocks: how many event blocks are there? When does each one run?

### Bomb penalty
1. Put in the `when a [Player] sprite hits a [Enemy] sprite` event.
2. Inside it, attach the `change lives by [-1]`, `shake screen for [250] ms`, `play melody [boom]` and `delete sprite [other sprite]` blocks, in order.

### Countdown
1. Inside the `when game starts` block, add the `start countdown from [30] seconds` block from the **Game** category. Change the number to 45.
2. Bring the `when time runs out` event block. Attach the `show [Time is up!] on screen for [2] seconds`, `play melody [lose]` and `end game: [you lose]` blocks inside it.

### Winning
1. At the very bottom of the fruit event (`when a [Player] sprite hits a [Food] sprite`), add an `if ... do` block.
2. As the condition, use the comparison block in the **Logic** category: the `score` block **≥** 8.
3. Inside it, put the `show [You win!] on screen for [2] seconds`, `play melody [victory]` and `end game: [you win]` blocks.

### Losing
Bring the `when lives run out` event block. Inside it, put the `show [You are out of lives!] on screen for [2] seconds`, `play melody [lose]` and `end game: [you lose]` blocks.

### Run it and try it
1. Press the ↺ button and play the game from start to finish. Win once, and lose once on purpose.
2. Are all seven items in the Goals panel green?

Expected result: The score, the hearts and the time left are shown at the top. If you collect 8 fruits, you win. If you run out of lives or the time runs out, you lose.

### How does it work?
- The parts of the game are split into **events** that are independent of each other: setting up the stage, dropping fruit, dropping bombs, the collisions, when lives run out, when time runs out. Each event only deals with its own job.
- The game should end with a single ending. The moment a winning or losing block runs, the game ends and the other events stop.
- The `time left (s)` block gives how much time is left in the countdown. To add it to the winning message, you can use it with the `create text with` block.

### Add your own touch
Try at least two of the following:
1. Make the winning score 12 and raise the time to 60 seconds. Is the game balanced?
2. Make the fruit fall faster. Which speed is fun, and which is impossible?
3. When the cat catches a fruit, show the message `show [Yummy!] on screen for [1] seconds`.
4. Change the background colour or choose another player picture.

### Common mistakes
- If you write the winning condition with **=** and the score jumps over 8, you cannot win. Using **≥** is safer.
- If you do not put the countdown block inside any event, it does not run. Put it inside `when game starts`.
- Do not forget to end the game in the `when lives run out` and `when time runs out` blocks. Once you write these blocks, whether the game ends is up to you.
- Write two separate collision events for fruit and bombs. If you choose the wrong kind, the event does not run for the sprite you expect.

## Discuss
What are the game's goal, risk and ending? Where did your friend find it hardest while playing? If you had to change one thing to make the game more fun, what would you change?

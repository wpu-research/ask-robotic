# Random movement: the confused bat
duration: 20

## Wonder
An enemy that takes the same path every time soon gets boring; the player learns its pattern. Some enemies, though, fly off in a different direction at every moment, as if they were confused. How does a computer do "random"? In this lesson you will make a bat choose its own direction roughly every half second.

## Activity
On the stage there is a bat standing in the middle of the screen. It does not move at all. The `every [700] ms` event is ready too, empty. The bat starts with the "stay on screen" setting, so it cannot leave the screen.

### Direction and random numbers
Direction is in degrees: 0 means up, 90 right, 180 down and 270 left. The `random integer from [1] to [100]` block in the **Math** category picks a number from the range each time. If the range is 0 to 359, it covers every direction.

### Build the blocks
1. From the **Motion** category, take the `[this sprite] moves in direction [90] degrees at speed [40]` block and snap it inside the `every 700 ms` block. Replace `this sprite` with the `yarasa` (bat) variable.
2. In place of the 90 in the direction slot, snap in the `random integer from [1] to [100]` block from the **Math** category. Make the first number 0 and the second number 359.
3. Press ↺. The bat flies in a different direction about every half second. When it reaches the edge of the screen it stops, because it has the "stay on screen" setting.
4. Stop and restart the program a few times. Each time the bat draws a different path.

Expected result: the bat moves, does not leave the screen, and its path changes on every run. (The activity checks this by trying it with two different randomness "seeds".)

### How does it work?
- The `at speed` block gives a direction and a speed together. In fact, it works out the x and y speeds for you.
- The timer makes it choose a new direction every 700 ms. In between, the bat goes in a fixed direction.
- On a computer, random numbers are made with a formula. In this game the formula moves on from a starting number (the "seed") on each run; that is why the activity check can be done reliably.
- A shorter timer makes a jumpier bat that is hard to avoid. A longer timer is easier to predict.

### Try it
1. Set the timer to 300, then to 2000 ms. Which one feels more dangerous?
2. Make the speed random as well: put a random number between 20 and 60 in the speed slot of the `at speed` block.
3. Does the bat get stuck at the edge? Instead of "stay on screen", try the "bounce off walls/edges: yes" setting.

### Common mistakes
- If you leave the random number range at 1-100, the bat always goes right and a little up. For direction you need 0-359.
- Putting the random direction inside `when game starts`: the direction is chosen once and the bat always goes the same way.
- Leaving the `at speed` block outside the timer: the block never runs.

## Discuss
Is a "completely random" enemy always good? If the player cannot find a pattern to learn, how fair is the game? How would you describe an enemy that is a bit random and a bit regular?

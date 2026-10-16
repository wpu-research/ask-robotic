# Walk the cat with the arrow keys
duration: 20

## Wonder
A cat that just stands there is not a game. When the player presses a key, something has to happen. So how does the computer know which key you pressed? And what should happen when the cat reaches the edge of the screen: should it go out and disappear, or should it stop?

## Activity
In this lesson, when the game starts, the cat is already standing in the middle of the screen. You will give it the ability to move.

### Controller
In the Game Workshop we call the keys the player uses the **controller**. There are four direction keys (or W, A, S, D) and two buttons (A: Space or Z, B: X or Enter). Under the stage there is an on-screen version of the same keys too. You can use them on a touch screen.

### Build the blocks
1. Open the activity and press the ▶ button. Press the arrow keys. The cat does not move.
2. Open the **Controller** category and take the `[kedi] moves [in 4 directions] with player keys, speed [60]` block. Attach it under the last block inside the `when game starts` block. Put the `kedi` block from the **Variables** category in place of `this sprite`.
3. Press the ↺ button and walk with the arrow keys. The cat moves now.
4. Make the cat a bit faster: set the speed to 100 and try again. The speed shows how many pixels it goes in a second.
5. Hold the left key down for a long time. The cat goes off the screen and disappears.
6. From the **Sprite** category, take the `[kedi] [stay on screen]: [yes]` block and attach it under the movement block. This is a setting block. From the first drop-down list choose the **stay on screen** setting, and from the second list choose the value **yes**.
7. Press the ↺ button. Now the cat stops at the edge of the screen.

Expected result: The cat walks in four directions and cannot leave the screen.

### How does it work?
- The key movement block runs once but works forever. The game looks at the keys 60 times every second and slides the cat to match. You do not write a separate loop for this.
- There are three ways of moving: **in 4 directions**, **left-right** and **up-down**. For a platform game, left-right is enough. For a fruit basket too.
- Without the **stay on screen** setting, the sprite can leave the world. A sprite that has left cannot be seen, but it still exists.

### Try it
1. Change the way of moving to **left-right**. Do the up and down keys still do anything?
2. Make the speed very high, for example 200. Can you still control the cat? How do you think speed should be chosen in games?
3. Swap the cat for another picture: find the robot or the astronaut in the Pictures tab. Change the picture in the drop-down list of the `new [picture] sprite, kind [kind]` block.

### Common mistakes
- If `this sprite` is still left inside the movement block, the sprite made last moves. There is only one sprite in this lesson, so nothing goes wrong. But once you add a second sprite, always use the variable name.
- Do not forget to put the block inside the `when game starts` block. A block left outside does not run.
- A change to the blocks does not show up in the running game by itself. Press ↺ first.

## Discuss
If the cat did not stay on the screen, what problems would that cause in a game? In which games is the player allowed to leave the screen?

# The ball that keeps bouncing
duration: 20

## Wonder
When a ball hits the wall of a room, it comes back. So how do we teach a sprite on the stage, "go this many pixels a second, and come back when you hit the wall"? In this lesson you will make a ball that moves on its own. You will not need to press any keys.

## Activity
There is a ball standing in the middle of the stage. The background is a plain colour. You will make the ball move and tile the background with grass.

### What does speed mean?
Speed is made of two numbers: the x speed goes sideways, the y speed goes up and down. Its unit is pixels per second. If the x speed is 50, the sprite goes 50 pixels to the right every second. If the x speed is a minus number, it goes left. If the y speed is positive it goes down; if it is minus, it goes up.

### Build the blocks
1. From the **Motion** category, take the `set [top] speed x [30] y [0]` block and attach it under the last block inside the `when game starts` block. Put the `top` (ball) variable in place of the `this sprite` inside it. Type 50 for x and 35 for y.
2. Press the ▶ button. The ball goes off the screen and away.
3. From the **Sprite** category, take the `[top] [bounce off walls/edges]: [yes]` block and attach it underneath. Choose the right options from the setting and value lists.
4. Press the ↺ button. The ball bounces back when it hits the edge.
5. Make the background nicer: from the **Stage / Map** category, take the `tile background with picture [picture]` block and attach it inside the `when game starts` block. Choose **Grass** as the picture.
6. The stage is now covered with grass. The ball bounces around on it.

Expected result: The ball keeps bouncing, and after 10 seconds it is still inside the screen. The background is tiled with grass.

### How does it work?
- The `set speed` block runs only once. But the speed value stays stored on the sprite, and the sprite keeps going at the same speed until another block changes it.
- With the bounce setting on, when the sprite hits an edge or a wall, its speed turns the other way. Minus becomes plus, plus becomes minus.
- Tiling puts a small picture (16 x 16 pixels) next to itself again and again across the whole screen.

### Going in a direction
Instead of the `set speed x y` block, you can also use the `[top] moves in direction [90] degrees at speed [40]` block. The direction is in degrees: 0 means up, 90 right, 180 down, 270 left. Change the numbers to send the ball in diagonal directions.

### Try it
1. Send the ball in the 45 degree direction at speed 60. Which corner is it heading towards?
2. Add the `[top] stops` block and put it straight after the speed block. What does the ball do? Why?
3. Try another tile picture: **Sand**, **Floor** or **Water**.

### Common mistakes
- If the `bounce off walls/edges` setting is off, the ball goes out through the edges and is never seen again.
- At a very high speed, a small sprite crosses the screen in a few frames. Do not go above 400.
- If you dropped the tiling block in the wrong place (outside the event block), it does not work.

## Discuss
When the speed is minus, the sprite goes the opposite way. What other ways can you think of to make a sprite come back when it hits a wall in a game?

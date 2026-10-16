# Gravity: let the hero land
duration: 20

## Wonder
When you let go of an apple, it falls slowly at first and then faster and faster. Nobody tells it "go"; it just speeds up a little more at every moment. That is exactly why platform games feel the way they do: you give the hero gravity and it falls by itself. In this lesson you will set up gravity in the Game Workshop.

## Activity
On the stage there is a light blue sky and, at the bottom, two rows of ground tiles (grassy dirt and dirt). The hero is hanging in the air in the top half of the screen, and starts with the "stay on screen" setting. The starter project is ready for you; the map and the hero are created, but nothing moves.

### Speed and acceleration
- **Speed** is how many pixels the sprite moves each second.
- **Acceleration** is how much the speed grows each second. A downward acceleration behaves like gravity: the hero falls a little faster every second.

### Build the blocks
1. Open the activity and press the ▶ button. The hero is hanging in the air.
2. From the **Motion** category, take the `set [this sprite] acceleration x [0] y [300]` block and snap it at the very bottom of the `when game starts` block. Replace `this sprite` with the `kahraman` (hero) variable. Type 520 in the y slot.
3. Press ↺. The hero falls and stands on top of the ground.
4. From the **Controller** category, take the `[kahraman] moves [left-right] with player keys, speed [70]` block and snap it under the acceleration block. Make sure **left-right** is selected in the list.
5. Press ↺. Walk with the right and left keys. The hero stays on the ground and stops when it reaches the edge of the map.

Expected result: the hero comes down from the air, stands on the ground and can walk left and right. All three goals ✓.

### How does it work?
- Acceleration is added to the speed every frame. The hero starts at speed 0; half a second later it is falling at about 260 pixels a second.
- The hero stops when it lands on the ground: the ground tiles are "walls", and walls stop sprites. When the hero touches a wall, its y speed is set to zero.
- While the hero is on the ground, gravity is still working; only the wall is holding it up. This will help us ask the question "am I on the ground?" in the next lesson.
- The value 520 is a carefully chosen number: if it is too small, the hero falls slowly as if it were on the Moon; if it is too big, it falls like a stone.

### Try it
1. Set the acceleration to 200 (light, like the Moon) and to 1000 (heavy). Which one is better for a platform game?
2. Give the acceleration a minus number (-300). What happens to the hero? In which game would you use this?
3. At the start, put the hero at the very top of the screen (`move to x 80 y 10`) and watch it fall. How many seconds does it take to land?

### Common mistakes
- Choosing **in 4 directions** as the way of moving: every frame the game sets the y speed from the up and down keys, and gravity has no effect. In platform games, choose **left-right**.
- Writing `set speed x 0 y 100` instead of acceleration: the hero falls, but always at the same speed; there is no feeling of "falling faster and faster".
- Leaving the acceleration block outside `when game starts`: the block does not run, and the hero stays hanging.
- Placing the hero inside the ground at the start: the hero gets stuck inside the wall. Put it somewhere in the sky.

## Discuss
In the game, gravity is a fixed 520, but in real life gravity on the Moon is much weaker than on Earth. If you made a game set on the Moon, how would you choose the acceleration, and how would the hero's jump be different?

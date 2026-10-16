# Jumping: jump with A
duration: 20

## Wonder
You know how Mario jumps. But what happens if you press again while he is in the air? In many platform games nothing happens, because the hero cannot start a new jump in mid-air. There is a simple question that controls this: "Am I standing on something right now?" In this lesson you will make the game ask that question.

## Activity
The scene you built in the last lesson is ready: ground, hero, gravity and walking left and right. At the start the hero is standing on top of a ground tile. It cannot jump yet.

### What is a jump, really?
Jumping means giving the hero's y speed a sudden **upward** value. Because the y axis grows downwards, an upward speed is a **minus** number. Gravity slowly takes this speed away, the hero stops at the highest point and falls back down.

### Build the blocks
1. From the **Controller** category, take the `when [A] button is [pressed]` block and drop it in the workspace.
2. From the **Motion** category, take the `set [kahraman] speed x [30] y [0]` block and snap it inside the event. Type -250 in the y speed slot. In the x speed slot, snap the `[kahraman] [x speed]` block from the **Sprite** category. This way you keep the sideways speed while jumping.
3. Press ↺. Press the space (A) key. The hero jumps.
4. While it is in the air, press A quickly again and again. The hero shoots up again on every press and climbs all the way to the top of the screen. This is a kind of "flying" we do not want.
5. Fix it: take the `if ... do ...` block from the **Logic** category, put the speed block inside it, and put the if block inside the event. For the condition, snap in the `is [kahraman] touching [a wall below]?` block from the **Sprite** category.
6. Also add the `play melody [jump]` block from the **Sound** category under the speed block in the `do` branch.
7. Press ↺ and press A while in the air. Now the hero does not jump a second time in the air.

Expected result: when you press A, the hero rises about 60 pixels and falls back down; in the air A does nothing; a sound plays when it jumps.

### How does it work?
- The question `touching a wall below?` says "true" if there is a wall tile right under the hero. If the hero is on the ground or on top of a platform it is true; if it is in the air it is false.
- Because the starting speed is -250 and the acceleration is 520, the rise works out at about 250 x 250 / (2 x 520) = 60 pixels. The jump takes about a second.
- If you want a stronger jump, set the y speed to -300: the rise goes up to about 86 pixels.
- Without the `if` block, every press of A gives a new speed; the hero speeds up in the air too.

### Try it
1. Set the jump speed to -150, then to -350. Which value is good for a platform game? Why?
2. Copy the same block into a `when [up ↑] button is [pressed]` event as well. Now you jump with two keys.
3. Give the hero a speech bubble when it jumps: add the `[kahraman] says [Hop!] for [1] seconds` block.

### Common mistakes
- Typing a positive number for the y speed: the hero goes down instead of up and tries to sink into the ground.
- Forgetting the `if` block: the hero flies.
- Putting the jump block inside `when game starts`: the jump happens only once, at the start of the game. You need an event linked to a key.
- Setting the sideways speed to zero while jumping: the hero goes straight up and down on the spot, like a lift. For the sideways speed, use the hero's own `x speed`.

## Discuss
Some games have a double jump; how do you think you would make one with blocks? What would you need to store the "number of jumps"?

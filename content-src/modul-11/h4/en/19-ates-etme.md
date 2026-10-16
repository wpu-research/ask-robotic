# Shooting: hit it with a laser
duration: 25

## Wonder
In space games, when you press a key the ship fires a laser and the enemy explodes. How does a "laser" object suddenly appear on the screen? Who moves it? In this lesson, every time you press the A button you will create a new bullet sprite and send it at the enemy.

## Activity
On the stage there is a night sky, a spaceship at the bottom and an alien waiting at the top. The ship moves left and right with the arrow keys and stays on the screen. The score starts at 0. The starter project is ready for you; the shooting is up to you.

### A bullet is a sprite too
The laser is a small moving sprite. We give it the **Bullet** kind. That way we can write a rule like "when a Bullet sprite hits an Enemy sprite".

### Build the blocks: fire the laser
1. In the **Variables** category, press the **Create variable...** button and name it `lazer` (laser).
2. From the **Controller** category, take the `when [A] button is [pressed]` block and drop it in the workspace.
3. From the **Variables** category, take the `set [lazer] to [ ]` block and snap it inside this event. In the value slot, snap the `new [picture] sprite, kind [kind]` block from the **Sprite** category. Choose **Laser** from the picture list and **Bullet** from the kind list.
4. From the **Sprite** category, take the `move [this sprite] to x [80] y [60]` block and snap it underneath. Replace `this sprite` with `lazer`.
5. In the x slot, snap a `[gemi] x position` block (take the `[this sprite] [x position]` block from the **Sprite** category and choose `gemi` (ship) as the sprite). In the y slot, snap a subtraction block (`[ ] - [ ]`) from the **Math** category: put `gemi y position` on the left and 12 on the right. This way the laser comes out of the ship's nose.
6. Snap the `set [lazer] speed x [0] y [-140]` block from the **Motion** category underneath. A minus y means up.
7. Add the `[lazer] [delete when it leaves the world]: [yes]` block from the **Sprite** category. This way lasers that leave the top of the screen are deleted and the stage does not fill up.
8. Press ↺ and press the space (A) key. Lasers come out of the ship going upwards.

### Build the blocks: hit
9. From the **Sprite** category, take the `when a [Bullet] sprite hits a [Enemy] sprite` event.
10. Inside it, in this order: `change score by [10]` from the **Game** category; `play melody [boom]` from the **Sound** category; `make [other sprite] explode` and `delete sprite [this sprite]` from the **Sprite** category.
11. Press ↺. Bring the ship under the alien and press the space key: the alien explodes and the score becomes 10.

Expected result: when you press A, a laser comes out going upwards; when it hits the alien, the alien explodes, the laser is deleted and the score goes up.

### How does it work?
- Each press of the A button runs the event once. So each press creates a brand-new bullet sprite. Holding the button down does not fire again and again.
- In a collision event, `other sprite` and `this sprite` are the sprites of the second and the first kind. We wrote "when a Bullet hits an Enemy": `this sprite` is the laser and `other sprite` is the alien.
- The collision event runs once, at the moment the two sprites overlap. If you do not delete the laser, it carries on its way even after the alien explodes.
- A speed of -140 means 140 pixels upwards every second. It gets from the ship's nose to where the alien is in about half a second.

### Try it
1. Set the laser's speed to -60: a slower laser that is easier to watch. Set it to -300: does the very fast laser ever miss the alien?
2. Link firing to the B button: the **Controller** category has `when [B] button is [pressed]`.
3. Make the ship fire two lasers: in the same event, create a second laser sprite, and move their x positions 6 pixels to the left and 6 pixels to the right of the ship.
4. Give the alien a speed: add `set uzayli speed x 30 y 0` and the `bounce off walls/edges: yes` setting. Hitting a moving target is more fun.

### Common mistakes
- Leaving the bullet's kind as `Object`: the collision event expects the "Bullet" kind, so it never runs.
- Leaving the laser's speed at 0: the laser comes out of the ship but stays where it is.
- Never deleting the laser: lasers pile up on the screen. Use `delete when it leaves the world` for the ones that fly off the top and `delete` for the ones that hit.
- Putting the collision event, the block with the rounded top, inside another event: events only work on their own in the workspace.

## Discuss
If the player pressed A 20 times a second, how many lasers would be on the screen? How do real games limit the rate of fire?

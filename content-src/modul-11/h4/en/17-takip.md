# Follow: the ghost chases you
duration: 20

## Wonder
The scariest enemy is the one that sees you and comes after you. But if a ghost chases you across the whole map, the game becomes very hard. In good games the ghost only wakes up if you get close enough. In this lesson you will make a ghost that both chases and asks itself "is it near or far?".

## Activity
On the stage there is a cat and, in the corner, a ghost. You can walk the cat with the arrow keys; the ghost does nothing yet. The starter project is ready for you, and the `every frame` event is waiting, empty.

### Two new ideas
- **Follow:** the `[hayalet] follows sprite [kedi] at speed [25]` block keeps the ghost walking towards the cat. You choose the speed (pixels per second).
- **Distance:** the `distance from [hayalet] to [kedi]` block tells you how far apart the centres of two sprites are, in pixels.

### Build the blocks
1. First, simple following: from the **Sprite** category, take the `[this sprite] follows sprite [this sprite] at speed [30]` block. Put the `hayalet` (ghost) variable in the first slot and the `kedi` (cat) variable in the second; set the speed to 25. Snap the block inside the `every frame` event.
2. Press ↺ and run away with the cat. Wherever you go, the ghost is after you. Unless the cat is very fast, you get caught.
3. Now keep the ghost alert, but limited: the **Logic** category has two `if` blocks; take the one with an "else" branch and snap it inside the `every frame` block. Drag the follow block into the `do` branch.
4. For the condition, take a comparison block (`[ ] = [ ]`) from the **Logic** category and change its sign to `<`. On the left, put `distance from [hayalet] to [kedi]` from the **Sprite** category; on the right, type 70.
5. In the `else` branch, put the `[hayalet] stops` block from the **Motion** category. (`stops` sets the speed to zero and also ends the following.)
6. Press ↺. Do not bring the cat closer than 70 pixels to the ghost: the ghost stays where it is. Come a little closer: the ghost wakes up and chases. When you move away, it stops again.

Expected result: when the cat is near, the ghost moves towards it; when it is far away, the ghost does not move at all. Three goals ✓.

### How does it work?
- The `every frame` block runs 60 times a second, so the ghost checks "is the cat near?" 60 times a second.
- The follow speed is fixed (25 here). If the cat walks at speed 60, the ghost can never catch it; you set the speeds to make the game harder or easier.
- When the ghost is closer than 1 pixel to the cat, it stops; it does not climb on top of it.
- There is also a `[hayalet] stops following` block for ending the follow, but this block does not set the speed to zero: the ghost carries on at its last speed. That is why we used `stops`.

### Try it
1. Set the wake-up distance to 40, then to 100. Which one feels fairer?
2. Slow the ghost down (15) and speed the cat up (100). Make the cat and the ghost touch: what happens? (We will write the collision rule later; for now you are just watching.)
3. Add a second ghost: make a new sprite with the `new [Ghost] sprite, kind [Enemy]` block, give it a different variable name, and build the same rule for it too.

### Common mistakes
- Putting the same variable in both slots of the follow block: the sprite tries to follow itself and nothing happens.
- Putting the follow block only inside `when game starts` and not writing the distance rule inside `every frame`: the ghost chases for ever, or never wakes up.
- Using `stops following` instead of `stops`: the ghost keeps sliding at its last speed.

## Discuss
In real life, a dog barks when you come near and ignores you when you are far away. In which other game enemies have you seen this "detection distance" idea? Should the player be able to see the ghost's detection distance, or not?

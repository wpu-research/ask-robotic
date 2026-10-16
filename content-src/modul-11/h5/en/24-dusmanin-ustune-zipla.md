# Jump on the enemy
duration: 25

## Wonder
In platform games you can touch an enemy in two ways: by jumping on top of it (then the enemy is beaten) or by walking into its side (then you get hurt). How does the game tell these two apart? The answer: it looks at the direction. Am I falling? Am I above the enemy?

## Activity
The ground, the hero and a slime enemy going back and forth at the right end of the map are ready. The map is wider than the screen; the camera follows the hero, and you need to walk towards the slime. The enemy changes direction when it reaches an edge or a wall. The score is 0 and lives are 3. When the hero touches the slime, nothing happens yet.

### Two tests
We can tell whether it hit from above by looking at two things:
1. Is the hero moving downwards? (The y speed is positive, for example greater than 10.)
2. Is the hero's y position a little smaller than the enemy's y position? (The hero is a little **above** the enemy.) y is small at the top and big at the bottom.

If both are true, it is a stomp; if not, it is a side hit.

### Build the blocks
1. From the **Sprite** category, take the `when a [Player] sprite hits a [Enemy] sprite` event.
2. Inside it, put the two-branch `if ... do ... else ...` block from the **Logic** category.
3. For the condition, take an `[ ] and [ ]` block from the **Logic** category. On its left side, a `[ ] > [ ]` comparison block: on its left `[this sprite] [y speed]`, on its right 10. On its right side, a `[ ] < [ ]` comparison block: on its left `[this sprite] [y position]`, on its right a subtraction block (`[ ] - [ ]`): on its left `[other sprite] [y position]`, on its right 4.
4. The `do` branch (stomp): `make [other sprite] explode`; `change score by [5]`; `set [this sprite] speed x [this sprite x speed] y [-150]` (so the hero bounces up a little); `play melody [boom]`.
5. The `else` branch (side hit): `change lives by [-1]`; `shake screen for [250] ms`; `put sprite [this sprite] on tile column [2] row [5]`; `set [this sprite] speed x [0] y [0]`.
6. Press ↺. Jump on top of the enemy: the slime explodes, the score goes up by 5 and the hero bounces. Walk into it from the side: you lose a life.

Expected result: when you jump on it from above, the slime is beaten and you do not lose a life; when you hit it from the side, the hero goes back to the start and loses a life. Four goals ✓.

### How does it work?
- In the collision event, `this sprite` is the sprite of the first kind (the hero) and `other sprite` the sprite of the second kind (the slime).
- While the hero is falling, its y speed is positive. While walking on the ground its y speed is 0, so the "speed > 10" condition rules out a side hit.
- If the hero's y is smaller than the enemy's, the hero is above the enemy.
- The enemy's movement comes ready-made: gravity, a sideways speed and reversing when it reaches a wall. These are in the `when a [Enemy] sprite is created` and `every frame` events; these events work for every enemy.
- To check your work, the activity puts a separate slime on the stage and drops the hero on top of it; then it tries a side hit too.

### Try it
1. Make the stomp worth 10 points. Raise the bouncing hero's speed to -250: this way the hero gets a high jump when it stomps an enemy.
2. Create one more enemy on the map (`new [Slime] sprite, kind [Enemy]`) and check that it can be stomped.
3. In the stomp condition, use "y speed > 100" instead of "y speed > 10". What changes? Which one makes the game fairer?

### Common mistakes
- Using only the "y speed > 10" condition: even if the hero touches the enemy while falling past its side, the enemy dies. The second test (position) prevents this.
- Writing the sprites the wrong way round in the subtraction: if you write `balcik y < kahraman y - 4` instead of `kahraman y < balcik y - 4`, it counts as a stomp when the enemy is on top.
- Putting the lives loss in the `do` branch: you lose a life when you stomp too.
- Forgetting to delete `other sprite`: the stomped slime stays on the screen and you keep stomping it.

## Discuss
Does the rule "speed > 10 and I am above" feel fair to the player? If you sometimes touch from the side and still count as stomping, or lose a life when you did stomp, how does the game make you feel? How could you make the collision rule more generous or stricter?

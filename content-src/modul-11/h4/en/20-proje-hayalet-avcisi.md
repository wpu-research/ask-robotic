# Project: Ghost hunter
duration: 35

## Wonder
This week, all together: a patrol bat that keeps bouncing, ghosts that chase you, and shooting too. When you put them all in the same game, you will feel like a night guard. It is time to break your own game's logic into pieces and build them one by one.

## Activity
### What are we going to make?
In a night scene, a hunter (an astronaut) is at the bottom of the screen. It can only walk left and right, and it stays on the screen. The score is set to 0 and lives to 3. You will add these:

| Part | Which lesson you learnt it in | What will it do? |
|---|---|---|
| Patrol bat | 16 | A bat going back and forth at the top |
| Chasing ghosts | 17 | Ghosts that come from the top and follow the hunter |
| Laser | 19 | Fire with A, upwards |
| Hit rule | 19 | Each hit is 1 point, win at 5 points |
| Lives rule | 9 | If an enemy touches the hunter, a life is lost |

### Build the blocks
1. **Bat:** at the very bottom of the `when game starts` block, set up the bat: `set yarasa to [new [Bat] sprite, kind [Enemy]]`, `move yarasa to x 20 y 30`, `set yarasa speed x 40 y 0` and `yarasa [bounce off walls/edges]: [yes]`. The bat goes back and forth on the screen. (You can also choose the timer method from lesson 16.)
2. **Ghosts:** build an `every [900] ms` event. Inside it: `set hayalet to [new [Ghost] sprite, kind [Enemy]]`; `move hayalet to x [random integer from 10 to 150] y [-8]`; `[hayalet] follows sprite [avci] at speed [15]`. Ghosts come from random places at the top and drift towards the hunter (`avci`).
3. **Laser:** fire a laser with the `when [A] button is [pressed]` event, as in lesson 19. The laser should appear at `avci x position` and `avci y position - 12`, with `speed x 0 y -140` and `delete when it leaves the world: yes`.
4. **Hit:** in the `when a [Bullet] sprite hits a [Enemy] sprite` event, put `change score by [1]`, `play melody [boom]`, `make [other sprite] explode` and `delete sprite [this sprite]`. Then, with an `if [score] ≥ [5] do` block, add `show [Hunter wins!] on screen for [2] seconds` and `end game: [you win]`. (The `score` block is in the **Game** category.)
5. **Lives:** in the `when a [Player] sprite hits a [Enemy] sprite` event, put `change lives by [-1]`, `shake screen for [250] ms` and `delete sprite [other sprite]`.
6. Press ↺ and play. Ghosts drift down from the top while you move left and right and shoot. When you hit 5 ghosts, "Hunter wins!" appears.

Expected result: all six goals ✓. The bat bounces, the ghosts follow the hunter, A fires a laser, collisions change the score and lives, and the game is won at 5 points.

### How does it work?
- The bat and the ghosts are both of the **Enemy** kind. That is why the hit and lives rules apply to both of them. One rule, two different enemies.
- The ghosts enter the stage from above, and their follow speed (15) is much lower than the hunter's speed (80). This gives the player time to escape.
- The three events (hit, lives, timer) run independently of each other. Breaking one does not break the others.
- It takes the ghosts more than seven seconds to get from the top of the screen to the hunter; that is enough time to shoot.

### Try it
1. Set the ghost's speed to 30 and make one every 600 ms. How many times harder did the game get?
2. Raise the target: increase the winning score from 5 to 10 and make ghosts every 700 ms. Is the game still balanced, or has it become too hard?
3. In the `when lives run out` event, add `show [Ghosts win!] on screen` and `end game: [you lose]`.

### Common mistakes
- Writing `this sprite` instead of `avci` in the ghost's follow block: the ghost follows itself and does not move at all.
- In the hit rule, blowing up `other sprite` but forgetting to delete `this sprite`: the laser keeps going through the target.
- Putting the `if score ≥ 5` block outside the collision event: the game may never end.
- Making the ghosts too fast: the player has no chance.

## Discuss
Which part of this game keeps you busiest: the bat, the ghost or the laser? If a friend played it, which enemy would they find harder? Why?

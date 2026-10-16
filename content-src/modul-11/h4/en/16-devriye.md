# Patrol: the enemy goes back and forth
duration: 20

## Wonder
In a game, a guard bat flies back and forth along the same corridor. Nobody tells it "turn now", but it turns at exactly the right time. This week we will give enemies a little "brain". The first step is the simplest: a patrol that goes back and forth to its own rhythm.

## Activity
On the stage there is a navy background and a bat. The bat flies to the right and, after a few seconds, leaves the screen and disappears. The starter project is ready for you. In the Goals panel on the right, the boxes turn ✓ as you finish each job.

### The enemy "kind"
The bat is a sprite of the `Enemy` kind. A kind is a label: later, when we write rules like "lose a life when you hit an enemy", we will talk about kinds. For now we are only looking at how the bat moves.

### Build the blocks
1. Open the activity and press the ▶ button. The bat goes right and leaves the screen. Stop it with ■.
2. From the **Game** category, take the `every [1000] ms` block and drop it in the workspace. Change the number to 1500. (1000 ms = 1 second, so 1500 ms is one and a half seconds.)
3. From the **Motion** category, take the `reverse [this sprite] [x (sideways)] speed` block and snap it inside the `every 1500 ms` block. Replace `this sprite` with the `yarasa` (bat) block from the **Variables** category. Leave **x (sideways)** selected in the list.
4. Press the ↺ button and watch. The bat goes right for one and a half seconds, then turns left, then goes right again.

Expected result: after 6 seconds the bat is back where it started (x about 40). All three goals turn ✓.

### How does it work?
- The bat's speed in the x direction is 40. In one and a half seconds it travels 40 x 1.5 = 60 pixels.
- The `reverse` block changes the sign of the speed: a speed of 40 becomes -40, and a speed of -40 becomes 40.
- The `every ... ms` block runs once in that time, and this repeats for ever. The jobs inside the block are done every time.
- Because the times going and coming back are equal, the bat returns to its starting point every 3 seconds.
- This patrol is different from the "bounce" setting: it needs no wall or edge. The enemy's own timer decides.

### Try it
1. Set the timer to 1000 ms. How many pixels does the bat travel? Work it out, then check with ▶.
2. Change the starting speed block to `set speed x 40 y 20`. The bat flies diagonally. To make it come back on patrol, add a `reverse [yarasa] [y (up-down)] speed` block to the timer as well.
3. Make the bat look the way it is going: in the timer, build `if [yarasa x speed] > [0] do [yarasa] faces [right] else [yarasa] faces [left]`. Reverse the speed first, then choose the facing; this order matters.

### Common mistakes
- If you put `set speed x 40 y 0` inside the timer, the bat never turns, because the speed becomes 40 again every time. To reverse it you need the `reverse` block.
- If **y (up-down)** is selected in the `reverse` block, the sideways speed never changes.
- Block changes do not reach the running game. Press the ↺ button first.
- You cannot set the timer below 50 ms.

## Discuss
What would happen to the bat if the times going and coming back were different (for example, 1 s going and 2 s coming back)? In a real game, how does a player use the patrol pattern once they notice it?

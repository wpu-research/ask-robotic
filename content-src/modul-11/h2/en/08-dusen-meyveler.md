# Let it rain fruit
duration: 25

## Wonder
So far we have placed objects one by one when the game starts. In real games, though, new things keep appearing: falling fruit, approaching enemies. We cannot make a hundred sprites by hand. Is there a way to tell the computer "make a new one every second"? And they should not pile up on the screen forever.

## Activity
The basket (the cat) goes left and right, and the score goes up when it catches a fruit. But no fruit falls from the sky.

### A repeating event
The `every [1000] ms` block runs once every set amount of time. 1000 milliseconds is one second. If you write "make a new fruit" inside it, a fruit appears every second.

### Build the blocks
1. From the **Game** category, drop the `every [1000] ms` event block into the work area. Change the number to 800.
2. In the **Variables** category, use **Create variable...** to make a variable called `meyve` (fruit). Take the `set [meyve] to [ ]` block and attach it inside the event. Connect the `new [Apple] sprite, kind [Food]` block from the **Sprite** category as its value.
3. Put the fruit in the sky: add the `move [meyve] to x [80] y [60]` block. Type -8 for y (just above the screen). For x, put the `random integer from [10] to [150]` block from the **Math** category.
4. Make the fruit fall: add the `set [meyve] speed x [30] y [0]` block from the **Motion** category. Type 0 for x. For y, put a random number: between 35 and 70.
5. Delete the ones that leave the screen: add the `[meyve] [delete when it leaves the world]: [yes]` block from the **Sprite** category.
6. Press the ▶ button. Fruits fall from random places. Catch them with the basket and watch the score go up.

Expected result: Every 0.8 seconds a fruit falls from a different place. The fruit you catch raises the score. The fruits you miss are deleted when they leave the screen.

### How does it work?
- The `every [800] ms` event repeats for as long as the game stays open.
- In each round, the `new [Apple] sprite, kind [Food]` block makes a brand new fruit. The `meyve` variable points to the newest fruit each time. The old fruits keep falling at their own speeds.
- A **random number** picks a number between 10 and 150 every time it runs. So the fruit falls from a different place each time.
- The fruit starts outside the screen (y -8). The delete when it leaves the world setting makes sure that once a sprite has come onto the screen, it is deleted if it leaves again. If you turn this setting off, thousands of fruits pile up off the screen and the game slows down.

### Try it
1. Make the falling speed range wider: between 20 and 120. Did the game get harder?
2. Change the frequency to 400 ms. How did the game change?
3. Change the fruit's picture: add the `set [meyve] picture to [picture]` block inside the event and choose **Orange**.

### Common mistakes
- If you leave the y value at 60, the fruit appears in the middle of the screen.
- If you type 0 for y instead of x in the speed block, the fruit slides sideways and never falls.
- If you do not delete the fruits that leave the screen, the game stops after a while. The Game Workshop allows 500 sprites at most.
- In the random number block, write the smaller number in the first slot and the bigger number in the second slot.

## Discuss
Why does the game use randomness instead of always dropping fruit in the same order? What would the game be like without randomness? Give examples of things that are random in real life.

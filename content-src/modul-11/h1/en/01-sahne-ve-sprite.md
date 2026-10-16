# Set up your stage: colour, cat and apple
duration: 20

## Wonder
Every game starts with an empty stage. Like a theatre crew that builds the set before the curtain opens, you place the players on the stage before the game starts. The screen is 160 pixels wide and 120 pixels high. Which numbers must you tell the computer to put a cat on the left side and an apple on the right side?

## Activity
This activity happens entirely in the Game Workshop, on the virtual stage. You do not need a camera, a kit or paper.

### Get to know the workshop
- **On the left is the stage.** The game is played here. Under the stage, the ▶ button starts the game, ■ stops it and ↺ starts it again from the beginning.
- Under the stage is the **Goals** list. Each goal turns green when it is done. When they are all green, the activity is complete.
- **On the right are the tabs:** Blocks, JavaScript, Pictures and Map. In this lesson you will only use the **Blocks** tab.
- The block box sits to the left of the work area as coloured categories. In this lesson these categories are open: Sprite, Game, Stage / Map, Variables and Math.

### Three new ideas
- **Sprite:** A player or object on the stage. The cat is a sprite, and so is the apple.
- **Position:** Every sprite has an x number and a y number. x is counted from left to right, y from top to bottom. The top left corner is the point x 0, y 0. The middle of the screen is the point x 80, y 60.
- **Kind:** Every sprite has a kind (such as Player, Enemy, Food). Later we will ask, "What should happen when the Player hits the Food?" The kind is what lets us say this.

### Build the blocks
1. The `when game starts` block is already in the work area. This block runs the blocks under it in order as soon as the game starts. You will attach all your blocks under it.
2. From the **Stage / Map** category, drag the `background color [color]` block and attach it under the `when game starts` block. Click the colour square and choose light blue (sky).
3. Open the **Variables** category and press the **Create variable...** button. Type `kedi` (cat) as its name. Then attach the `set [kedi] to [ ]` block that appears under the background block.
4. From the **Sprite** category, take the `new [picture] sprite, kind [kind]` block and plug it into the empty slot of the variable block. Choose **Cat** from the picture list and **Player** as the kind.
5. Place the cat. From the **Sprite** category, add the `move [this sprite] to x [80] y [60]` block underneath. Drag the `kedi` block from the **Variables** category into it, in place of `this sprite`. Type 40 for x and 80 for y.
6. Repeat the same job for the apple: make a new variable called `elma` (apple). Connect the `new [picture] sprite, kind [kind]` block to it (picture **Apple**, kind **Food**). Then set the apple's position to x 120, y 80.
7. Press the ▶ button. On the stage you should see a light blue background, the cat on the left and the apple on the right.

Expected result: The stage is blue, the cat is on the left, the apple is on the right. All four goals are green.

### How does it work?
- Blocks run from top to bottom, in order. When the game starts, first the colour changes, then the cat appears and goes to its place, then the apple.
- A **variable** is a name label you give to something. Saying `set [kedi] to [...]` means "I will call the new sprite kedi." After that, wherever you put the `kedi` block, it points to that sprite.
- The position shows the **centre** of the sprite. The cat is 16 pixels wide, so when you give x 40, the middle of the cat is at 40.
- `this sprite` means the sprite you made last. So that two sprites do not get mixed up, we give each sprite a variable name.

### Try it
1. Change the cat's y value to 20. Does the cat move up? Start again from the beginning with the ↺ button instead of ▶.
2. Choose another background colour and restart the game.
3. Add a third sprite: a variable called `portakal` (orange), picture **Orange**, kind **Food**. Put it between the cat and the apple.

### Common mistakes
- If the blocks are not attached under the `when game starts` block, they do not run at all. Make sure the blocks are stuck to each other.
- After you change the blocks, the stage stays as it was. Press the ↺ button to see the new version.
- Do not use the same variable name for two sprites. If you put a sprite into the same variable a second time, the variable points to the new sprite and you can never reach the first one again.
- If the picture list says "(no picture)", go to the Pictures tab, press the **Gallery** button and click the picture you want. The picture is added to your project.

## Discuss
Why are the x values of the cat and the apple different, but their y values the same? If you wanted to put an apple right above the cat, which numbers would you change?

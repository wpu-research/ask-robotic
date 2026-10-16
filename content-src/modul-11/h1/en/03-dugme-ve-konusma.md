# Change and talk when you press the A button
duration: 20

## Wonder
In games some things happen all the time, and some things happen only for a moment: jumping, shooting, talking. These happen at the moment a button is pressed. Let's learn to tell the computer, "do this the moment I press A." Our cat will both change shape and talk.

## Activity
The cat walks with the arrow keys and stays on the screen. In this lesson you will give it three new abilities.

### The idea of an event
Some blocks are blocks that run **when** something happens. `when game starts` was one of them. Now we are learning a new event: when a button is pressed. Event blocks run the blocks you connect under them only when that event happens. Event blocks are not attached under another block; they stand on their own in the work area.

### Build the blocks
1. From the **Controller** category, drop the `when [A] button is [pressed]` block into the work area. Choose **A** from the drop-down list on the left. This block stands next to the `when game starts` block, as a separate block.
2. From the **Sprite** category, take the `set [kedi] picture to [picture]` block and attach it inside the A event. Choose **Robot** as the picture. Do not forget to put the `kedi` variable in place of the cat.
3. Inside the same event, add the `[kedi] says [Hello!] for [2] seconds` block. You can change the text and write "Hello, I am a robot!".
4. Press the ▶ button and press the A key (Space or Z). The cat turns into a robot and a speech bubble appears.
5. Now let's set the direction it faces. Add a `when [left ←] button is [pressed]` event and put the `[kedi] faces [left]` block inside it.
6. Add one more event, `when [right →] button is [pressed]`. Put the `[kedi] faces [right]` block inside it.
7. Press the ↺ button. When you press the left key the cat faces left, and when you press the right key it faces right.

Expected result: When you press A, the cat turns into a robot and talks. When it walks left, the cat's face turns to the left.

### How does it work?
- Each event block runs separately. You can write more than one button event; they all wait at the same time.
- A button event runs **once**: the moment you press the button. If you hold it down, it does not run again and again.
- The `[kedi] faces [left]` block flips the picture sideways. You do not have to draw another picture.
- The speech bubble disappears by itself after a few seconds.

### Try it
1. Add a `when [A] button is [released]` event. Turn the cat back into a cat: choose **Cat** as the picture.
2. Write a separate event for the B button: the cat becomes a ninja (picture **Ninja**) and says "Hiyaa!".
3. Make the talking time 5 seconds and watch what happens.

### Common mistakes
- If you do not attach anything inside the event block, nothing happens.
- If you use `this sprite` in button events, the sprite made last is affected. There is only one sprite in this lesson, but use the `kedi` variable anyway.
- Do not put the direction block inside the walking block. The key movement already takes care of walking. Separate events decide the direction.

## Discuss
Which of the player's actions do you think should be continuous (for as long as the key is held down), and which should be one-off (the moment it is pressed)? Which would you choose for jumping?

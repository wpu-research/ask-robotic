# Eat the apple, pop the ghost
duration: 20

## Wonder
What makes a game a game is that something happens when objects touch each other. When the cat touches the apple, the apple disappears. When the cat touches the ghost, something explodes. How does the computer notice that two pictures are on top of each other? And how does it answer the question "which one touched which?"

## Activity
On the stage there is the cat (Player), an apple (Food) at the top right and a ghost (Enemy) at the bottom right. Walk the cat with the arrow keys. For now nothing happens.

### The collision event
The Game Workshop checks in every frame whether two sprites are on top of each other. This check is called a **collision**. You only say what should happen when which kinds collide.

There are two sprites in a collision event:
- `this sprite`: the one of the kind at the start of the event, so the first sprite. (In this lesson, the cat.)
- `other sprite`: the second sprite, the one that was hit. (The apple or the ghost.)

### Build the blocks
1. From the **Sprite** category, drop the `when a [Player] sprite hits a [Food] sprite` event block into the work area.
2. From the same category, take the `delete sprite [this sprite]` block and attach it inside the event. Drag the `other sprite` block (in the same category) into it, in place of `this sprite`. This way the apple is deleted, not the cat.
3. Press the ▶ button and take the cat to the apple. The apple disappears.
4. Bring a second event block: `when a [Player] sprite hits a [Enemy] sprite`.
5. Put the `make [other sprite] explode` block inside it.
6. Press the ↺ button and this time visit the ghost. The ghost explodes into sparkles.
7. If you like, also add the `play melody [point]` block from the **Sound** category to the apple event.

Expected result: When you touch the apple, the apple disappears. When you touch the ghost, the ghost explodes and disappears.

### How does it work?
- The kinds in the event block give the sprite's **kind**, not its **name**. If there are many sprites of the same kind, it works for all of them.
- The collision event runs **once**, the moment the two sprites come on top of each other. Even if the cat stays on top of the apple, it does not run again and again in every frame.
- The `make ... explode` block is the version of the `delete sprite` block with an effect. It removes the sprite and throws out sparkles.

### Try it
1. Delete the cat: delete `this sprite` and see what happens. Then fix it.
2. Make the cat explode instead of the ghost. Which block must you change?
3. Add a second apple to the stage (with **Create variable...** make `elma2`, then `new [Apple] sprite, kind [Food]` and a position). Does the same event work for both apples?

### Common mistakes
- If you put `this sprite` instead of `other sprite`, the wrong sprite is deleted. Most of the time the cat is deleted and the game looks as if it has ended.
- If the sprite's kind is wrong, the event never runs. The apple's kind must be **Food** and the ghost's kind **Enemy**.
- Do not put the event block inside the `when game starts` block. An event block always stands on its own in the work area.

## Discuss
A collision does not only mean "touching": what can two things touching each other lead to in a game? If you designed a game, which two sprites would you want to collide, and what would you want to come of it?

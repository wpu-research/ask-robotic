# Project: The wandering cat
duration: 30

## Wonder
You are about to finish your first week. You have learnt to set up a stage, make sprites, walk with keys, make something happen when a button is pressed and make an object that keeps bouncing. Now let's turn all of it into one small game. The wandering cat will use its magic abilities while it roams the grass.

## Activity
Half of the project is ready: a grass background, a cat that walks with the arrow keys and stays on the screen, and a star that keeps bouncing around the screen. You will add the missing abilities.

### What will you do?
- A button: the cat talks and plays a melody.
- B button: there is an explosion on the screen and a short sound.
- Then add your own ideas.

### Run it and look first
1. Press the ▶ button to run the game. Walk the cat and watch the star bounce.
2. In the **Blocks** tab, read the `when game starts` block. Which block does what? Find three places: the tiled background, the key movement and the bounce setting.

### A button: talk and play a melody
1. From the **Controller** category, put the `when [A] button is [pressed]` event into the work area.
2. From the **Sprite** category, attach the `[kedi] says [Hello!] for [2] seconds` block inside it.
3. From the **Sound** category, add the `play melody [start]` block.

### B button: explosion
1. Put in the `when [B] button is [pressed]` event.
2. From the **Game** category, attach the `[color] explosion at x [80] y [60]` block inside it. Choose yellow as the colour.
3. From the **Sound** category, add the `beep [300] Hz for [120] ms` block.

### Run it and try it
1. Press the ↺ button. Press the A and B keys.
2. There are seven items in the Goals panel. Are they all green?

Expected result: The cat walks and the star keeps bouncing. When you press A the cat talks and a melody plays; when you press B there is a yellow explosion on the screen.

### How does it work?
The project uses all of this week's blocks together:
- The `when game starts` event sets up the stage (lesson 1).
- Key movement and the **stay on screen** setting make the cat walk (lesson 2).
- Button events give the cat abilities (lesson 3).
- Speed and the **bounce** setting move the star (lesson 4).

### Add your own touch
Do at least two of the following. Do not break the goals, but you can add as much as you like.
1. When B is pressed, the cat turns into another picture (e.g. **Astronaut**). Use the `set [kedi] picture to [picture]` block.
2. When A is pressed, write a message on the screen: `show [Hello!] on screen for [2] seconds`.
3. Shake the screen when there is an explosion: `shake screen for [300] ms`.
4. Write your own little melody with `play note [A4] for [250] ms`: add three notes one after another.
5. Make the star faster or slower.

### Common mistakes
- If you do not attach anything inside an event block, that button does nothing.
- If you write two separate events for the same button, both of them run. So that things do not get mixed up, write a single event for each button.
- If the x and y in the explosion block are outside the screen, you cannot see the explosion. Use an x between 0 and 160 and a y between 0 and 120.

## Discuss
Which new ability was the most fun in the game? How would a friend playing this game work out what the A and B buttons do? If you added an instructions message to the game, what would you write?

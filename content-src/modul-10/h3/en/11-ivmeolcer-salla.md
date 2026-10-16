# Accelerometer: shake and tilt
duration: 20

## Wonder
When you turn your phone sideways, the screen rotates by itself. Some apps undo things when you shake the phone, and in some games you steer a car by tilting the phone. A part inside the phone called an **accelerometer** senses movement and tilt. The card has an accelerometer too. Let's use it to make a "magic ball"!

## Activity
### What does the accelerometer sense?
The accelerometer measures the card's movement and **which way it is tilted**. The measurements are given on three axes:

- **x:** the card tilting to the left (minus) and to the right (plus)
- **y:** the card tilting backwards (minus) and forwards (plus)
- **z:** the card's face looking up (plus) or down (minus)

The values are in **milli-g**. When the card lies face up, gravity measures about 1024 on the z axis. So (x, y, z) = (0, 0, 1024).

On the virtual card, in the **Motion (accelerometer)** section to the right of the card, you will find:

- Buttons: **Shake**, **Tilt left**, **Tilt right**, **Tilt forward**, **Tilt back**, **Face up**, **Face down**, **Free fall**.
- Three sliders: **x (side)**, **y (front-back)**, **z (face)**.
- Under them, three readings: **strength**, **pitch**, **roll**.

### Motion blocks
The **Input** category has these blocks:

- **when card is [shaken]:** a header block. Choose the movement from the list: shaken, tilted left, tilted right, tilted forward, tilted back, face up, face down, falling.
- **card is [shaking]?:** asks whether the card is in this state right now. It gives true or false.
- **acceleration ([strength])** and **tilt ([pitch (forward +)]) degrees:** give a number.

### Program: magic ball
Three **when card is ...** header blocks are already in the editor: shaken, tilted left, tilted right.

1. Put the **if ... then ... else** block from the **Logic** category inside the **shaken** block (there are two kinds of if; take the one with "else").
2. Attach the **coin flip (random true/false)** block from the **Logic** category to the condition slot of the if.
3. In the "then" part put **show icon** and choose **yes** from the list. In the "else" part put **show icon** and choose **no**.
4. Inside the **tilted left** block put **show icon** and choose **left arrow**.
5. Inside the **tilted right** block put **show icon** and choose **right arrow**.
6. ▶ **Run**.
7. On the virtual card, press the **Shake** button. Shake it a few times. Then **Tilt left**, then **Tilt right**.

### Expected result
With every shake, "yes" or "no" appears at random. When you tilt it left, the left arrow comes up; when you tilt it right, the right arrow comes up. All five goals should have a ✓.

### How does it work?
- A motion block runs **the moment the card's state changes**. If the card is already tilted left, **tilted left** does not run again; first you need to go back to another state, for example **Face up**.
- **Shaking** is a short event: when the card is shaken, the block runs straight away, and the acceleration readings wobble for about half a second.
- **coin flip** gives **true** or **false** at random every time it runs. It is like tossing a coin.
- When an axis goes past 700 milli-g, the card counts as tilted in that direction.

### Try it
1. Add two blocks for **tilted forward** and **tilted back** as well: make them show the up arrow and the down arrow.
2. Add a **face down** block and make it clear the screen. When you turn the card over, the screen goes dark.
3. Move the sliders by hand. When does the **strength** reading get bigger? How does the strength value change while you shake the card?

### Common mistakes
- **Trying the same tilt again and again.** If you press **Tilt left** again after tilting it left, the event does not run again. Press the **Face up** button first.
- **Leaving out the "else" branch.** If you put an if that only has a **then** part, half the time you see nothing.
- **Moving the slider only a little.** For the card to count as tilted, one axis must go past 700. A small slide does not count as a tilt; the ready-made buttons are easier to use.

## Discuss
What else do you know that senses movement in your phone or a games controller? What do you think is the difference between wanting something to happen when you shake the card and pressing a button?

# Hello, Micro Card
duration: 15

## Wonder
Imagine a computer small enough to fit in the palm of your hand. Its screen is made of only 25 tiny lights, yet it can write words, play songs and answer you. You will program this card with blocks. So how does a word fit on a screen of 25 lights?

## Activity
### Meet the virtual card
In this module you will work with the **virtual Micro Card**. The card lives entirely inside the computer; there are no wires, batteries or real parts. You use everything you see on the screen with the mouse or your finger.

The card has these parts:

| Part | What does it do? |
|---|---|
| LED screen | 5 columns x 5 rows, 25 tiny lights in total |
| A and B buttons | On the two sides of the card. They tell the program when you press them |
| A+B button | For pressing both at the same time |
| Logo (star) | A surface that tells the program when you touch it |
| P0, P1, P2 | Three connection points at the bottom of the card (we will use them later) |

To the right of the card there is a control panel. There you change things like shaking, tilting, light and temperature yourself. We will use those in later lessons too.

### Parts of the editor
- **Top bar:** the ▶ **Run**, ■ **Stop** and ↺ **Reset** buttons are here. There are also **Start over** (takes the lesson back to how it started), **Export** and **Import**.
- **Goals box:** the tasks for this lesson. Each time you complete a task, a ✓ appears in the box next to it.
- **Block box:** the colourful categories on the left. In this lesson you will only use the **Basic** category.
- **Tabs:** **Blocks**, **JavaScript**, **Python**. In the last two you see the written code of your blocks. You cannot change the text there; you can only read it.

### Program: Hello
There is already an **on start** block on the screen. This block runs once when you start the program. Every program lives inside a header block like this one.

1. Click the **Basic** category in the block box.
2. Grab the **show text [Hello!]** block and drag it inside the **on start** block. When you let go, you will see it snap into place.
3. Click the text in the block and type your own name. If you like, type Merhaba (Turkish for "hello"), as in the examples in this lesson.
4. Take the **show number [0]** block from the **Basic** category and attach it right under the text block.
5. Type 7 in the number box.
6. Press the ▶ **Run** button.

### Expected result
The text scrolls across the card's screen from right to left. A 7-letter word like "Merhaba" takes about 4 seconds. When the text ends, the screen goes dark, then the number 7 appears in the middle for about half a second. All three tasks in the Goals box should have a ✓.

### How does it work?
- Blocks run **from top to bottom**, in order.
- The next block does not start until the scrolling text has finished. The card waits until the text is done.
- A single letter or a one-digit number does not scroll. It stays in the middle of the screen for a short time. A two-digit number (for example 25) scrolls like text.
- Look at the **JavaScript** tab: inside the `card.onStart(...)` line it says `screen.showText("Merhaba")` and `screen.showNumber(7)`. This is the code form of your blocks. In the **Python** tab, the same program appears written in another language.

### Try it
1. Change the text and press ▶ again. How long did the scrolling take? Compare a long text with a short one.
2. Type 25 in the number block. How is it different from a one-digit number?
3. Put two **show text** blocks one under the other. Which one appears first?

### Common mistakes
- **Dropping the block outside on start.** A stack of blocks that is not attached to a header block does not run; it looks faded. Move the block inside on start.
- **Not pressing ▶ after making a change.** A change you make while the program is running is not applied by itself. A note appears on the screen: "Press ▶ to use your changes".
- **Expecting a result before the program has finished.** The number does not appear until the scrolling text is done. Wait a little.

## Discuss
The card's screen is only 5 columns wide. Are there other ways, apart from scrolling, to show a long text on a small screen? Why do you think we keep a single letter in the middle instead of scrolling it?

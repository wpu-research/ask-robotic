# The logo, long presses and secret buttons
duration: 20

## Wonder
Some toys have a secret button; it only works when you touch the right spot or press for a while. The star-shaped logo on top of the card is a touch-sensitive button too. In this lesson you will add secret doors to your card.

## Activity
### The logo: a touch star
The star-shaped logo on top of the card is a **touch button**. On the virtual card, if you press on it with the mouse and hold, it is "touched"; if you let go, it is "released".

The **Input** category has this block:

- **when logo is [touched]:** runs the moment the logo is touched. If you choose **released** from the list, it runs the moment you lift your finger.

### Long press
Earlier you looked at the second list of the **on button [A] [pressed]** block. It had three options: **pressed**, **released**, **long pressed**. The **long pressed** option runs when you **hold the button down for 1 second**.

### Program: secret buttons
Three event blocks are already in the editor: one **when logo is touched**, one **when logo is released** and one **on button A long pressed**.

1. Put **show icon** from the **Basic** category inside the **when logo is touched** block and choose **heart**.
2. Put the **clear screen** block from the **Basic** category inside the **when logo is released** block.
3. Put **show icon** inside the **on button A long pressed** block and choose **sleeping face**.
4. ▶ **Run**.
5. On the virtual card, press on the logo with the mouse and hold it: the heart will appear. Let go: the screen will go dark.
6. Hold the A button down for 1 second or longer.

### Expected result
When you touch the logo, the heart appears; when you lift off, the screen goes dark. When you press A for longer than a second, the sleeping face comes up. All four goals should have a ✓.

### How does it work?
- The logo is a source of events too, just like the A and B buttons: being touched and being released make two separate events.
- If you press the A button briefly, nothing happens in this program, because we only wrote a **long pressed** block.
- A long press is triggered **1 second** after the moment you press the button. If you let go before a second has passed, there is no long press.
- **pressed** and **long pressed** blocks for the same button can be used together. If you press for a long time, both run: first the short one, and one second later the long one.

### Try it
1. Show a **happy face** when you touch the logo and a **sad face** when you let go. The logo is like a mood button.
2. Add a **pressed** block for A as well: make it show a face. Do you see two different things when you press for a long time?
3. Make a **long pressed** block for B too: make it clear the screen. Let it be a secret button that resets the card.

### Common mistakes
- **Not changing the list in the logo block.** If **touched** stays selected in both, the **clear screen** block does not run when you let go.
- **Pressing too briefly for a long press.** You need to hold it down for a full second. Hold the virtual button down; do not let go quickly.
- **Clicking the logo and letting go straight away.** The heart appears for a moment and goes off. If you hold it down, the heart stays on the screen.

## Discuss
What jobs is a long press used for on phones or toys? Why would we want to give different jobs to a short press and a long press?

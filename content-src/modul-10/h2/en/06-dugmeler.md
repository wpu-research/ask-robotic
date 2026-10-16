# The A, B and A+B buttons
duration: 20

## Wonder
What happens when you press a doorbell button? The bell rings. The bell does not ring by itself; it waits for someone to press it. In computers, a rule like "when something happens, do this" is called an event. With the card's A and B buttons, you will write your first event blocks.

## Activity
### What is an event?
Until now, programs ran from start to finish on their own. In this lesson, though, the card **waits**. When you press a button, the jobs inside that button's block are done. These blocks that "run when something happens" are called event blocks.

The **on button [A] [pressed]** block in the **Input** category is a header block, like **on start**. It has two lists:

- Button: **A**, **B** or **A+B**.
- When: **pressed**, **released** or **long pressed**.

### Program: feeling buttons
Three **on button** blocks are already in the editor: for A, B and A+B. They are all empty. You will fill them in.

1. Drag the **show icon** block from the **Basic** category into the first block (A). Choose **happy face** from the list.
2. Put **show icon** in the second block (B) and choose **sad face** from the list.
3. Put **show icon** in the third block (A+B) and choose **heart** from the list.
4. Make sure the first drop-down list of the third block is **A+B**.
5. ▶ **Run**.
6. Click the A button on the virtual card, then B, then the A+B button underneath.

### Expected result
When you press A, the happy face appears; when you press B, the sad face appears. When you press A+B, the heart comes up. All four goals should have a ✓.

### How does it work?
- While the program is running, the event blocks quietly **wait**. When the button is pressed, the inside of that block runs from top to bottom, and when it is done, it goes back to waiting.
- When A and B are both pressed at the same time, only the **A+B** event runs; the separate blocks of A and B do not run.
- **pressed** runs the moment you press the button; **released** runs the moment you lift your finger. **long pressed** runs one second after you start holding the button down.
- Events are independent of each other. A program can have as many event blocks as you like.

### Try it
1. Change the A block from **pressed** to **released**. When does the happy face come up?
2. Add a second block inside the B block: **pause 1000 ms**, and under it **clear screen**. The sad face goes off after one second.
3. Hold down the A button and let go after one second. Which block ran when? Tell a friend what you saw.

### Common mistakes
- **Forgetting to change the button list.** If A stays selected in both blocks, both blocks react to A; nothing happens when you press B.
- **Pressing one after the other instead of A+B.** Pressing A and then B separately does not produce the A+B event. To press both at the same time, use the **A+B** button underneath the virtual card.
- **Leaving a block outside the header block.** A **show icon** that you put outside the event block never runs. It looks faded.

## Discuss
Which devices in everyday life work when you press a button? If you compare the buttons on a games console with the card's A, B and A+B buttons, what do you think you would need most?

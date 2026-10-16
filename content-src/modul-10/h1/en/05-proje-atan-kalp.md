# Project: Beating heart
duration: 30

## Wonder
When a doctor listens to your heart, they hear "lub-dub, lub-dub": two short beats, then a little rest. With what you have learnt this week, you can make a real heartbeat on the card's screen. And with a short greeting at the very start, too!

## Activity
### Project: Beating heart
You will bring together everything you learnt this week: showing text, showing icons, pausing, repeating and screen brightness.

**Goals:**
- When the card starts, a short text scrolls.
- The screen brightness is turned down a little.
- Then the heart beats "lub-dub" forever: big heart, small heart, big heart, small heart and then a short rest.

### New block: forever
The **forever** block in the **Basic** category repeats the blocks inside it from the start without stopping. It keeps going until you press the **Stop** button. It is perfect for jobs that never end, like a beating heart.

### New block: set screen brightness
The **set screen brightness to [255]** block in the **LED** category sets the brightness of all the LEDs between 0 and 255. 255 is the brightest. At 0 nothing is visible. Turning the light down a little before showing text is easier on your eyes.

### Step by step
The **on start** and **forever** blocks are already in the editor.

1. Put the **set screen brightness to [255]** block from the **LED** category inside the **on start** block. Change the number to 200.
2. Under it, attach the **show text** block from the **Basic** category. Change the text to "Sev" (Turkish for "love").
3. Attach these blocks inside the **forever** block, in this order:
   - **show icon** (heart), **pause** 150 ms
   - **show icon** (small heart), **pause** 100 ms
   - **show icon** (heart), **pause** 150 ms
   - **show icon** (small heart), **pause** 400 ms
4. ▶ **Run**.

### Expected result
First a short "Sev" text scrolls across the screen (about 2 seconds). Then the heart beats twice quickly, there is a short rest, and it starts again. All five goals should have a ✓.

### How does it work?
- **on start** runs once; after it has finished, **forever** takes over.
- The heartbeat: big heart, small heart, big heart, small heart. The pause times in between set the rhythm. About 0.8 seconds in total.
- **forever** takes a very short breather at the end of every round, so it does not wear the card out.
- By changing the times, you can make an excited heart or a sleeping heart.

### Try it
1. Make the heart faster by shortening the pauses. Make it like the heart of someone who is running.
2. Slow it down by making the pauses longer. Like the heart of someone who is asleep.
3. Use the first letter of your name as the text. A single letter does not scroll; it stays in the middle. What is the difference?
4. If you like, set the brightness inside the **on start** block to 20 and see what the heart looks like. Then set it back to 255.

### Common mistakes
- **Putting the blocks in the wrong place.** The text block must be inside **on start**, the heart blocks inside **forever**. If you put the text in the forever block, it scrolls again in every round.
- **Not adding pauses.** If there is no pause between the big and the small heart, you cannot see the heart beating.
- **Setting the brightness to 0.** If the brightness is 0, the screen shows nothing. The program is not broken; raise the number.

## Discuss
Which times did you choose in your project? How different is a real heartbeat from your beating heart? How would you turn this heart into a gift for a friend that they could reprogram?

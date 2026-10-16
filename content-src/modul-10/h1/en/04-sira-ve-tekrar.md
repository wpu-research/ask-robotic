# Order and repetition
duration: 20

## Wonder
If you mix up the order when you write a recipe, the meal goes wrong: first crack the egg, then stir. In computers, order is everything too. Now say you want the same job done three times. Are you going to copy the blocks three times?

## Activity
### Order
The card runs blocks **from top to bottom**. The same blocks give a different result in a different order.

Compare these two stacks:

| Stack 1 | Stack 2 |
|---|---|
| show square | clear screen |
| pause 300 ms | pause 300 ms |
| clear screen | show square |
| pause 300 ms | pause 300 ms |

In stack 1 the square appears first, then goes off. In stack 2 the screen stays empty first, then the square appears and stays on the screen. The blocks are the same; the order is different.

### Repetition
To make a square blink three times, you could put the 4 blocks one under the other three times. But the **repeat [4] times** block in the **Loops** category gives you a much shorter way. The blocks you put inside it run again as many times as the number you type.

### Program: three blinks and yes
1. Drag the **repeat [4] times** block from the **Loops** category into **on start**.
2. Change the number to 3.
3. Attach these inside the repeat block, in this order:
   - **show icon** from the **Basic** category (choose **square** from the list)
   - **pause [300] ms**
   - **clear screen**
   - **pause [300] ms**
4. **Under** the repeat block, that is outside it, add a **show icon** block and choose **yes**.
5. ▶ **Run**.

### Expected result
The square blinks three times. Each blink takes about 0.6 seconds. Then the "yes" sign stays on the screen. All three tasks in the Goals box should have a ✓.

### How does it work?
- The blocks inside the repeat block run from start to finish **as many times as the number**. When the third round is over, the card moves on to the next block.
- If a block is **inside** the repeat block, it repeats; if it is **under** it, it runs once. The "yes" icon is outside the repeat block, so it appears only once, at the very end.
- Look at the **JavaScript** tab: the repeat block has turned into the line `for (let _i = 0; _i < 3; _i++)`. The lines inside the curly brackets are the blocks that repeat.

### Try it
1. Change the number to 10. The square blinks 10 times. Change the pause time to 100 ms and compare the speed.
2. Add a second icon inside the repeat block: square, pause, diamond, pause and so on. What happens instead of blinking?
3. Move the "yes" block inside the repeat block and see what changes.

### Common mistakes
- **Attaching the block in the wrong place.** Pay attention to whether you put it inside the repeat block or under it. Inside and outside do different things.
- **Forgetting to clear.** Without clearing and pausing, the square never goes off and you cannot see it blink.
- **Typing a time that is too short.** A very short pause, such as 10 ms, cannot be seen.

## Discuss
What repeats in everyday life? How would you describe repeated things, such as brushing your teeth or climbing stairs, with a single "repeat ... times" sentence?

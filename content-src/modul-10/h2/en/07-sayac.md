# Counter and variable
duration: 25

## Wonder
Imagine someone at the door of a bus counting passengers. For each passenger they bend a finger once and keep the number in their head. So where does the card keep a number? Not in its head, but in a box: a variable.

## Activity
### Variable: a labelled box
A **variable** is a box with a name written on it. It stores a number or a text inside. You can put a new value in the box, look at what is inside, and make the number inside bigger or smaller.

A variable called **sayi** (Turkish for "number") is already in the editor. To make a new variable in your own projects, you click the **Make a variable...** button in the **Variables** category and type a name.

The blocks in the **Variables** category:

- **set sayi to [0]:** puts a new number in the box.
- **change sayi by [1]:** makes the number in the box bigger by the given amount (if you type a minus number, it makes it smaller).
- **sayi:** gives the number inside the box. It fits into the hole of another block.

### Program: visitor counter
The **on start** block and three **on button** blocks (A, B, A+B) are already in the editor.

1. Put the **set sayi to [0]** block from the **Variables** category inside **on start**. Make sure it is zero.
2. Attach the **change sayi by [1]** block inside the A block.
3. Under it, add the **show number [0]** block from the **Basic** category.
4. Remove the 0 inside this block: grab the **sayi** block from the **Variables** category and drop it on top of the 0.
5. Do the same in the B block, but use **change sayi by [-1]**.
6. Put **set sayi to [0]** inside the A+B block, and add **show number sayi** under it.
7. ▶ **Run**. Press A three times, then B once, then A+B.

### Expected result
Each time you press A, the screen shows 1, 2, 3. When you press B, it goes down to 2. A+B shows 0 on the screen and resets the counter. All four goals should have a ✓.

### How does it work?
- The **on start** block resets the counter. That way the counter clearly starts from 0 every time it runs.
- **change sayi by 1** makes the number in the box 1 bigger. First it reads the old value, adds 1 and puts the new value back.
- **show number [sayi]** first looks in the box, takes the number inside and shows it on the screen. The name of the box is not written on the screen; the number inside it is.
- When the number reaches 10, there are two digits on the screen and the number scrolls. Minus numbers scroll too, together with the minus sign.
- In the **JavaScript** tab you will see the line `let sayi = 0;` at the very top. That is where the variable's box is made.

### Try it
1. Press A 12 times in a row. What does a two-digit number look like on the screen?
2. What does the counter do if you press B at the start? Can it go below zero?
3. Change the 1 in the **change sayi by [1]** block to 5. The counter now counts in fives.

### Common mistakes
- **Forgetting to show the number.** The variable's box changes, but if there is no **show number** block, you see nothing on the screen.
- **Not resetting in on start.** The card counts a variable that has never been given a value as 0. Still, writing 0 clearly in on start lets anyone reading the program see what it starts with.
- **Pressing too fast.** Showing the number takes some time. If you press many times very quickly, some of the presses wait in a queue or may be skipped. Press a little more slowly.

## Discuss
Without variables, how would the card remember the number? Think of something from your own life whose value you keep changing: like your score in a game or the money in your pocket. What name would you give the box you put it in?

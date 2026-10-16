# Alarm
duration: 28

## Wonder
What if your bag or your bike had an alarm that started ringing as soon as anyone touched it? An alarm is really a **state** machine: either it is not set, or it is set, or it is ringing. The buttons and sensors make it move between the states. In this lesson you will make an alarm that keeps its states in variables.

## Activity
### Three states
| State | When? | On the screen |
|---|---|---|
| Off | at the start | empty |
| Set | when you press A | the "yes" mark |
| Ringing | when the card is shaken while it is set | a skull and the alarm melody |

To turn off a ringing alarm, you press **A+B** for longer than a second. A long press does not happen by accident, so it works like a password. When it turns off, a happy face appears on the screen.

### New ideas
- Two **state variables**: **kurulu** ("set", 0/1) and **alarm** (0/1). The variables remember the card's current state.
- **on button [A+B] [long pressed]**: runs when you press A and B together for longer than 1 second. (In the button hat block, choose **A+B** and **long pressed** from the lists.)
- Checking a state all the time with an **if** inside **forever**.

### Step by step
**on start**, **on button [A] [pressed]**, **when card is [shaken]**, **forever** and **on button [A+B] [long pressed]** are ready in the editor.

1. In the **Variables** category, make the **kurulu** and **alarm** variables.
2. Put **set kurulu to [0]** and **set alarm to [0]** inside **on start**.
3. Put **set kurulu to [1]** and **show icon [yes]** inside **on button [A] [pressed]**.
4. Put **if ... then** inside **when card is [shaken]**. Condition: **kurulu** **=** **1**. Inside it, **set alarm to [1]**.
5. Put **if ... then** inside **forever**. Condition: **alarm** **=** **1**. Inside it, in this order: **show icon [skull]**, **play melody [Alarm]**, **clear screen**, **pause [200] ms**.
6. Inside **on button [A+B] [long pressed]**, in this order: **set kurulu to [0]**, **set alarm to [0]**, **stop sound**, **show icon [happy face]**.
7. Press ▶ **Run**. Press the card's **A** button. Press **Shake** in the **Motion** section. While the alarm is ringing, press the button marked **A+B** for longer than a second and do not let go.

### Expected result
After **A**, the "yes" mark appears on the screen. When you shake, the skull flashes on and off and a short alarm melody plays again and again (the melody lasts 1.6 seconds, followed by a gap of 0.2 seconds). When you long-press **A+B**, the alarm stops and a happy face appears. All six goals should have a ✓.

### How does it work?
- If you shake **while it is not set**, nothing happens, because the **if** inside **when card is [shaken]** waits for **kurulu = 1**.
- **forever** always goes round, but while **alarm = 0** it skips its inside.
- When the **A+B** long press sets **alarm** to 0, **forever** does not ring the alarm on the next round. The melody that is playing at that moment may carry on until it ends (at most 1.6 seconds), but it does not start again.
- Because more than one hat block runs at the same time, the **A+B** long press is handled before the melody has ended.

### Try it
1. Make the alarm ring when the card is turned face down instead of shaken: use the **when card is [face down]** hat block.
2. While the alarm is ringing, play a different melody if the **light level** is below 50 (in the dark). Change the light with the **Light** slider.
3. To turn it off, try pressing the B button 3 times in a row instead of A+B. You will need a variable that keeps count.

### Common mistakes
- **Keeping the press too short.** For a long press you must keep A+B pressed for more than a second.
- Mixing up the **kurulu** and **alarm** variables. When the card is shaken, **alarm** becomes 1, not **kurulu**.
- **Only stopping the sound when turning off the alarm.** If you do not reset the **alarm** variable, **forever** rings the alarm again.
- **Not putting a pause inside forever.** The screen is only empty for a very short moment, and the flashing is almost invisible.

## Discuss
In a real alarm, ringing by mistake (a false alarm) is a problem. Which would bother you more: an alarm that rings when it should not, or an alarm that does not ring when it really should? How would you make the card more reliable?

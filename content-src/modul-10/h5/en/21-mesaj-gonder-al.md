# Send a message, receive a message
duration: 20

## Wonder
Two people talking on walkie-talkies have to be tuned to the same channel. If the channel is different, however loudly you shout, the other person does not hear. Micro Cards have a radio too, and the channel is called a **group**. In this lesson you will set two cards to the same group and send a message from one to the other.

## Activity
### Two cards
The radio works with two cards. In this activity two cards appear side by side in the editor (if the second one does not appear by itself, press the **Add second card** button in the **Radio** section on the right). Both cards run **the same program**. So the program you write runs on both the sending and the receiving card. In the virtual portal there is no real hardware or distance; the message reaches the other card after a very short moment (about 10 milliseconds).

### New blocks
They are all in the **Radio** category:
- **set radio group to [1]**: says which group the card joins. The group is a number between 0 and 255. Cards in the same group hear each other.
- **radio send number [1]**: sends a number to the other card in the group.
- **on radio received**: a hat block that runs when a message arrives.
- **received [number]**: gives the number in the message that arrived. From the list you can also choose **text**, **name** and **value**; you will see them in the next lesson.

### Step by step
**on start**, two button hat blocks and **on radio received** are ready in the editor.

1. Put the **set radio group to [1]** block inside **on start**.
2. Put **radio send number [1]** inside **on button [A] [pressed]**. Put the same block inside **on button [B] [pressed]** and make the number **2**.
3. Put the **if ... then ... else** block from the **Logic** category inside **on radio received**. (There are two **if** blocks in your palette; take the one with the "else" branch.)
4. Plug a comparison block into the condition of the **if**. On the left side put **received [number]** from the **Radio** category, and on the right side write **1**. The sign should be **=**.
5. Put **show icon [heart]** in the **then** branch and **show icon [happy face]** in the **else** branch.
6. Press ▶ **Run**. Press Card 1's **A** button. Then press **B**.

### Expected result
When you press **A** on Card 1, a heart appears on Card 2's screen; when you press **B**, a happy face appears. The sending card does not receive its own message: Card 1's screen does not change. The **Last received:** box in the Radio section shows the number received. All five goals should have a ✓.

### How does it work?
- Card 1 sends the number with **A**. It reaches Card 2, which is in the same group, 10 ms later. On Card 2, the **on radio received** hat block runs.
- The **received [number]** block inside the hat block reads the message that has just arrived.
- Because Card 2 runs the same program too, if you press Card 2's **A**, a heart appears on Card 1. So both sides can send and receive.
- Even if you do not put the group block in the program, the cards start in group 1. Still, writing the group clearly is a good habit.

### Try it
1. Change Card 2's group: in the Radio section, choose **5** from the **Card 2 group** list. Send a message from Card 1. What happens? Then set the list back to **From program**.
2. Send a message by hand from the Radio section: type **number**, message **1**, **Send to card 2**. Do you see the same result?
3. Add a third message to your program: the **A+B** button sends **3**, and Card 2 shows a sad face.

### Common mistakes
- **Putting the two cards in different groups.** The message never arrives. No error message appears either, because the card does not know who is listening.
- **Not writing the receiving code.** Even if the sender works, if **on radio received** is empty, the receiving card does nothing.
- **Comparing the number wrongly.** To check whether the **received [number]** value is equal to **1**, the sign in the comparison block must be **=**.

## Discuss
Is choosing a channel on a walkie-talkie the same as choosing a group on the card? How would you make sure only your friend hears your message?

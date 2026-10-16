# Chatting with two cards
duration: 22

## Wonder
When you send messages, you send emoji: a heart, a smiling face, a sad face. An emoji is really a small picture, but the phone sends it as a number, and the other side turns that number back into the picture. You can do the same trick between two Micro Cards. In this lesson the two cards will become a small chat app that sends heart and face icons to each other.

## Activity
### The idea
Let's give each icon a number and send that number by radio:

| Number | Icon | Which key sends it? |
|---|---|---|
| 1 | heart | A |
| 2 | happy face | B |
| 3 | sad face | A+B |

When the receiving card sees the number, it shows the matching icon and plays a short sound. Because both cards run the same program, both directions work.

### A new idea: reading into a variable
The **received [number]** block is read when a message arrives. If you are going to compare this number in more than one place, it is tidier to put it into a variable (**mesaj**, "message") first. That way you do not need to find the **received** block again and again for every comparison.

To check three possibilities, you will put **if ... then ... else** blocks inside each other: "is the number 1? If not, is the number 2? If not (then it is 3)".

### Step by step
**on start**, **on button [A] [pressed]**, **on button [B] [pressed]**, **on button [A+B] [pressed]** and **on radio received** are ready in the editor.

1. Put **set radio group to [1]** inside **on start**.
2. Put **radio send number [1]** inside **on button [A] [pressed]**, **radio send number [2]** inside **on button [B] [pressed]**, and **radio send number [3]** inside **on button [A+B] [pressed]**.
3. In the **Variables** category, make a variable called **mesaj**.
4. Inside **on radio received**, in this order:
   - **set mesaj to [0]**. Plug **received [number]** in place of the zero.
   - **if ... then ... else**. Condition: **mesaj** **=** **1**. **then**: **show icon [heart]**.
   - Inside the **else** branch, put a second **if ... then ... else**. Condition: **mesaj** **=** **2**. **then**: **show icon [happy face]**. **else**: **show icon [sad face]**.
   - **play melody [Birdsong]** from the **Music** category.
5. Press ▶ **Run**. Press **A** on Card 1, then **B** on Card 2, then **A+B** on Card 1 again.

### Expected result
Card 1's **A** shows a heart on Card 2. Card 2's **B** shows a happy face on Card 1. Card 1's **A+B** shows a sad face on Card 2. After each message, Birdsong plays (about 1.25 seconds). All seven goals should have a ✓.

### How does it work?
- The sender cannot receive the message; the message only goes to the other card in the group.
- The chain of **if** blocks inside each other checks in order. If the first one is true, the others are not checked at all.
- The **play melody** block waits until it finishes. If another message arrives during that time, it joins a queue; for the same hat block, at most 3 messages wait in the queue.

### Try it
1. Add a fourth icon: the **on button [A] [long pressed]** hat block sends **4**, and the receiving card shows a **sun**. (You need to add one more branch to the **if** chain.)
2. Instead of Birdsong, choose a different melody for each icon: the **Jingle** melody for the heart, the **Sad** melody for the sad face.
3. So that you also see your own message on your screen, make the sending side **show** the icon too. Which hat block should you put it inside?

### Common mistakes
- **Putting the second if outside the else branch.** Then the happy face does not appear in the "else" branch.
- **Always sending 1 instead of different numbers.** The receiving card cannot tell which key was pressed.
- **Never reading the message.** If you do not put **received [number]** into the **mesaj** variable, the variable stays zero and the sad face always appears.

## Discuss
Isn't turning numbers into icons a kind of "agreement"? If the other side did not know your table, how would they understand the message? Where does this "shared table" idea turn up in real messaging apps?

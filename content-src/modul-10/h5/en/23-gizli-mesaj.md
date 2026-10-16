# Secret message
duration: 22

## Wonder
It is said that in ancient Rome, Julius Caesar shifted the letters in his secret letters: in place of each letter, he wrote the letter a few places further on in the alphabet. Someone who catches the message sees meaningless letters; but a friend who knows the shift number decodes the message easily. In this lesson you will do the same idea with numbers: before sending, a **key** will be added to the number, and the receiving card will take this key away.

## Activity
### Encryption and the key
- **Plain message**: the real information you want to send (for example the digit 3).
- **Key**: a secret number that both sides know (for example 7).
- **Encrypted message**: plain message + key = 3 + 7 = 10. This 10 is what goes by radio.
- **Decrypting**: the receiving side works out 10 − 7 = 3 and finds the real digit.

This is a very simple cipher, and in real life it is easily broken. But it is very good for learning the basic idea of encryption: **the information changes on the way, and whoever knows the right key turns it back into what it was.**

### New blocks
- In the **Math** category, the arithmetic block that adds and subtracts: it has two number boxes and a sign in the middle. Choose **+** or **−** for the sign from the list.
- In the **Variables** category, the **change [gizli] by [1]** block.

### Step by step
**on start**, two buttons and **on radio received** are ready in the editor.

1. In the **Variables** category, make two variables: **gizli** ("secret") and **anahtar** ("key").
2. Inside **on start**, in this order: **set radio group to [1]**, **set gizli to [0]**, **set anahtar to [7]**.
3. Put **change gizli by [1]** and **show number [gizli]** inside **on button [A] [pressed]**. (Plug the **gizli** variable in as the number to show.)
4. Put **radio send number** inside **on button [B] [pressed]**. Plug the addition block in place of the number: **gizli** **+** **anahtar**.
5. Put **show number** inside **on radio received**. Plug the subtraction block in place of the number: **received [number]** **−** **anahtar**.
6. Press ▶ **Run**. On Card 1, press **A** three times (1, 2, 3 appear on the screen). Then press **B**.

### Expected result
Card 1 sends 10 by radio. In the Radio section, Card 2's **Last received:** box shows **10**. But on Card 2's screen, **3** appears: the key has been taken away and the real digit found. All four goals should have a ✓.

### How does it work?
- The number travelling on the way is 10. Someone who hears the message cannot know the 3; they would need to know the key (7).
- Because the two cards run the same program, both of their keys are 7. So they share the same key.
- Because the key is stored in a variable, you change it in only one place; both the encryption and the decryption follow automatically.

### Try it
1. From the Radio section, send **10** by hand to Card 2 as a **number** message. You see 3 on Card 2.
2. Now send **5** by hand. What appears on Card 2's screen? (5 − 7 = −2.) This is like someone who does not know the key getting the wrong result.
3. In **on start**, make the key 12 instead of 7. Did the decrypted digit change? Why did it not change?
4. Think: if the key were random every time, how would the receiving card know it? Would it be safe to send the key by radio too?

### Common mistakes
- **Forgetting the key.** If you did not set the key variable in **on start** on the receiving card, the variable stays at zero; the decrypting does not work.
- **Putting subtraction instead of addition** (or the other way round). If the sender adds, the receiver must subtract.
- **Putting the number to show in the wrong place.** Inside **show number** there must be the subtraction block, not **received [number]** on its own.

## Discuss
If someone caught this cipher on the way, could they guess the 7? How many tries would it take them? What would you add to make a harder cipher?

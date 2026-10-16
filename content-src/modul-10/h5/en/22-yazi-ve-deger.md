# Text, name and value
duration: 20

## Wonder
You can split a message like "temperature 28" into two parts: "temperature" is a name, and 28 is a value. A card that knows the name puts the value in the right place. When a number is not enough, the radio can also carry text, or a name and a value as a pair. In this lesson you will use all three message types.

## Activity
### Three message types
| Type | Sending block | Receiving block |
|---|---|---|
| number | **radio send number [1]** | **received [number]** |
| text | **radio send text [hello]** | **received [text]** |
| name = value | **radio send [name] = [1]** | **received [name]** and **received [value]** |

Limits: a text can be at most 32 characters, and a name at most 12 characters. Anything longer is cut off. In this lesson we will write names without special letters (for example **sicak**, short for "hot"). The sending and receiving sides must write the name exactly the same, letter for letter.

There is also a block called **signal strength**. In the virtual radio there is no distance, so the signal strength is always 200. Still, it is good to know: on real radios, the signal strength usually drops as the cards move further apart.

### Step by step
**on start**, **on button [A] [pressed]**, **on button [B] [pressed]** and **on radio received** are ready in the editor.

1. Put **set radio group to [1]** inside **on start**.
2. Put **radio send text [selam]** inside **on button [A] [pressed]**. Make the text **selam** ("hi").
3. Put **radio send [sicak] = [0]** inside **on button [B] [pressed]**. Make the name **sicak**. Plug the **temperature (°C)** block from the **Input** category in place of the value.
4. Put **if ... then ... else** inside **on radio received**. Condition: **received [name]** **=** **sicak**. In the **then** branch, put **received [value]** inside **show number**. In the **else** branch, put **received [text]** inside **show text**.
5. Press ▶ **Run**. Set Card 1's temperature to 28 with the **Temperature** slider in the **Compass and sensors** section. On Card 1, press **A**, then **B**.

### Expected result
When you press **A**, the text **selam** scrolls across Card 2's screen (about 3 seconds). When you press **B**, **28** appears on Card 2. All five goals should have a ✓.

### How does it work?
- In a text message, the **received [name]** value is empty. So the comparison comes out false and the **else** branch runs.
- In a **name = value** message, **received [name]** is "sicak", and **received [value]** is 28.
- For every message, you first need to work out its type. In this program, checking the name is a simple way to work out the message type.
- Card 1's temperature slider belongs to Card 1, and Card 2's slider belongs to Card 2. You can see which card you have selected from the **Card 1 / Card 2** buttons in the right panel.

### Try it
1. Try the **received [text]** block on a name = value message too. You will see that it gives the value as text.
2. Send a name = value message by hand from the Radio section: type **name = value**, name **sicak**, message **35**. 35 should appear on Card 2.
3. Add a new message: **on button [A+B] [pressed]** does **radio send [isik] = [light level]** (`isik` means "light"). If the name is **isik**, the receiving card shows a bar graph. (The light is 0-255; make the bar graph's upper limit **255**.)
4. Send a text longer than 32 characters. How much of it appears on the receiving card?

### Common mistakes
- **Writing the name differently.** If you write **sicak** on the sender and `sıcak` on the receiver, the comparison does not come out equal.
- **Thinking the value is text.** **received [value]** is a number. It is good for doing calculations.
- **A name longer than 12 characters is cut off.** If you choose a long name, the comparison on the receiving side does not match.

## Discuss
Where does sending a "name = value" pair instead of a number make your job easier? If you want to send three readings, such as temperature, light and sound, at the same time, how would you organise the messages?

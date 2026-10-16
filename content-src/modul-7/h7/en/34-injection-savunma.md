# Layered defence
duration: 30

## Wonder
A single lock never makes a house safe: door, windows, alarm, neighbours... For AI systems too, defence is not a single move but layers on top of each other.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Defence layers
- **Data/instruction separation:** separate untrusted text with a label and say "this is data".
- **Instruction hierarchy:** the system rule ranks above the text in the document.
- **Output filter:** secret data or suspicious links are removed from the output.
- **Least privilege:** never give the model secret information or tools it does not need.
- **Human approval:** approval for risky actions.
- **Banned word list:** helps partly, easy to get round.

### Open the tool
The **Prompt injection** tool, on the "Defend" tab. There are six types of attack; each measure has a cost.
1. Stop all six attacks.
2. Keep the total cost at 3 or less.
3. Use at least three different layers.

### How does it work?
- The table is simplified for the lesson: which measure stops which attack really depends on the situation.
- A single measure never stops them all. You can see this by choosing one measure and looking at the table.
- The most important principle: **do not give the model anything that has to stay secret.** If the model does not know something, it cannot tell it.

### Test yourself
1. What does "defence in depth" mean?
2. Why is writing a secret key in the system message bad design?

## Discuss
If you gave a school bot permission to show students' marks, which defence layers would you put in place? If your budget were tight, which one would you not give up?

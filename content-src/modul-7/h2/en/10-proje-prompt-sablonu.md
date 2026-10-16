# Project: A prompt template
duration: 35

## Wonder
If you repeat the same job often, instead of writing a prompt from scratch every time, you prepare a template: the fixed parts stay in place, and the parts that change are left blank. This week we are writing a template that classifies student comments.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### Task
In the **Prompt checker** tool, write a prompt template that classifies student comments as "positive" or "negative".

### Template skeleton
- Role: "You are a ... assistant."
- Task: "Classify student comments as ..."
- Example: an Input / Output pair.
- Format: "In the answer, write only ..."
- Constraint: What should it not do?

### Steps
1. Expand the starting text following this skeleton.
2. Raise the checklist score to at least 80.
3. There must be a role and an example; the words "comment" and "positive" must appear in the prompt.
4. Think of a mark for the field where you will put the comment in the template (for example `{{yorum}}`, "comment"); in real apps the program replaces this field.

### How does it work?
- A template is like a function: fixed instructions + a changing input.
- Separating the input from the instructions (for example with labels) makes it both easier to read and safer; you will see why in lesson 34.

### Test yourself
1. Which part of the template changes, and which stays fixed?
2. How does the example affect the model's output format?

## Discuss
What should you watch out for so that the template also works well in someone else's hands? Look at a friend's template and tell them what is missing.

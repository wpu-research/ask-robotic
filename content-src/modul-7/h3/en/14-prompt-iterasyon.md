# Improve the prompt by iteration
duration: 30

## Wonder
Engineers do not write perfect code at the first attempt; they run it, see the error, and fix it. Writing prompts is also a job of iteration: write, try, see what is missing, fix.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### The loop
1. Set a goal: what does a good answer look like?
2. Write the first prompt.
3. Judge the result against the goal.
4. Change one thing (do not change many things at once).
5. Try again and compare.

### Open the tool
Task: a prompt that gets the bug in a Python function found and explained.
1. The starting text is very short. First, stay on topic (the words "Python" and "bug" must appear).
2. Add a constraint: "at most 4 bullet points", "do not rewrite the code from scratch".
3. State the output format.
4. Raise the score to at least 75. After each change, write down on paper how the score changed.

### How does it work?
- The checker is not a measure on its own; it is just a checklist. The real measure is the results you get when you try the prompt with real examples. For that you need a test set: you will build one in week 4.
- Making changes one at a time and recording them lets you understand which change worked.

### Try it
1. Write three versions (v1, v2, v3) and write down the score of each version.
2. Which change brought the most points? Would it also help the most on a real model?

### Test yourself
1. Why should you change only one thing each time?
2. The score went up but the output got worse. How can this happen?

## Discuss
Can a high checklist score mislead you? What evidence would you want before counting a prompt as "done"?

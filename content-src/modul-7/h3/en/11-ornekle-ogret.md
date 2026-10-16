# Teach by example
duration: 25

## Wonder
Instead of explaining the "positive or negative" game to a friend, you could show them two examples and they would get it. It is a powerful approach for language models too: show a few examples and let the model catch the pattern. This is called a few-shot prompt.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### Teaching by example
- **Zero-shot:** you give only instructions.
- **Few-shot:** instructions + a few examples (pairs of input and expected output).
Examples make the format, the tone and the label names clear. If the instructions and an example contradict each other, the model may get confused, so be consistent.

### Open the tool
1. In the **Prompt checker** tool, the task is: comment classification.
2. Write at least two "Input:" and two "Output:" lines.
3. Make one example labelled "positive" and the other "negative".
4. The words "comment" and "positive" must appear in the prompt.

### How does it work?
- The checker counts the "Input:" and "Output:" patterns. It cannot know whether the examples are really good.
- Good examples are ones from different labels, realistic, short and written in a consistent format.
- The order and number of examples can affect the result. Test this not by gut feeling, but with the measurements (evals) you will learn in week 4.

### Try it
1. Write three examples: make one of them labelled "undecided". How do you state the format?
2. Delete an example and look at how the score changes.

### Test yourself
1. If all the examples have the same label, how might the model go wrong?
2. Are few-shot prompting and "fine-tuning" the same thing?

## Discuss
What might be the difference between giving a model an example and telling it a rule? Which would you choose in which situation?

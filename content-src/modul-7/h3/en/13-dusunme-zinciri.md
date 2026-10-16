# Chain of thought: step by step
duration: 20

## Wonder
Instead of trying to solve a maths question "in your head" in one go, writing it out step by step often reduces mistakes. There is a similar idea for models: writing the intermediate steps before the answer.

## Activity
This is a reading lesson; there is no activity tool.

### The idea
A language model produces its answer token by token. If you have it write intermediate steps before the answer, each step becomes context for the next step. This approach is called **chain of thought**. It can improve the result in multi-step calculation and logic questions. Some models can also do this themselves, with a separate "thinking" stage.

### How do you ask for it?
- "First solve it step by step, then write the final answer on a separate line."
- Fix the format: the headings "Steps:" and "Answer:".
- Having the final answer written on a separate line lets a program pull out the answer easily.

### Limits
- The steps **may not exactly reflect the real reasoning**. A fluent explanation does not mean a correct explanation.
- A longer answer means more tokens and more time.
- Where correctness is needed, it is safer to hand the calculation to a tool. In lesson 26 you will use a calculator as a tool.
- For very simple questions the chain may be unnecessary.

### A small example
Question: "Each of 12 groups did 7 projects. How many projects are there in total?"
Steps: The number of groups is 12, with 7 projects in each group. 12 times 7 equals 84.
Answer: 84.

### Test yourself
1. When you ask for a chain of thought, why do you have the answer written on a separate line?
2. Even if the steps look logical, why should you still check them?
3. What is the advantage of solving the same question with a calculator tool?

## Discuss
When you compare a "step-by-step solution" written by a model with your own solution, what kinds of differences do you expect? What do you look at to check a step?

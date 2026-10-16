# Project: mini agent
duration: 40

## Wonder
This week's project: an agent that measures twice and moves forward twice. Move forward half the remaining distance, measure again, move forward sixty per cent of it, stop. Do the calculations with a tool.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Task
**Agent loop**, robot corridor:
1. Measure with `mesafe()`.
2. Find half of the remaining distance with `hesapla` and move forward that much.
3. Measure again; move forward 60 per cent of what remains.
4. `dur()` and `bitir(...)`.
5. Make the robot stop between 5 and 20 cm from the wall; no crash.

### Hint
`$1` is the first measurement. `hesapla($1*0.5)` gives half of it. You reach each step's result by its own number: number the steps on paper.

### Report
1. Your script and the observation of each step.
2. Why did you measure twice?
3. What did you do when you got an error?
4. If you connected this agent to a real robot, which extra safety measures would you add?

### How does it work?
- The result is the real result of the calculation. You are the "model" part of the agent; in a real agent the model would make the decision, and it might not reach the same result every time. That is why agents are measured with evals too.

### Test yourself
1. If you run the same agent 10 times and it hits the wall in 3 of them, what do you do?
2. If a model made the decisions instead of a script, which new risk would appear?

## Discuss
Which decision in this project is better suited to a rule, and which to a model? How far can you trust a model's decision on a robot?

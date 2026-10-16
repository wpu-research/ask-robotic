# Tool use
duration: 30

## Wonder
Language models are good at predicting words, but on their own they cannot guarantee a multi-digit multiplication or know today's date. The fix is simple: the model does not do the calculation, it calls the calculator.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Tool use
The model is given a list of tools: each tool's name, what it does and which input it takes. In a step, the model says "I want to call this tool with this input"; the application **really runs** the tool and gives the result back to the model. The model looks at the result and carries on.

### Open the tool
In the **Agent loop** tool the tools are real (a calculator, a knowledge base, a virtual robot). The "model step", however, is not a model: **you write** the decisions about using the tools **as a script**. In a real agent, the model makes this decision.

Question: there are 12 groups, and each group has done 7 projects. How many projects are there in total?
1. Write `hesapla(12*7)` in the script box (`hesapla` means "calculate").
2. Give the result with `bitir($1)` (`bitir` means "finish"). `$1` is the result of the first step.
3. Goals: the `hesapla` tool was used, the result is 84, no errors.

### How does it work?
- The calculator is a real expression parser; it only accepts numbers and operations, and does not run arbitrary code.
- Call format: `arac(girdi)` (tool(input)). The result appears in the "Observation" column.
- A bad call (for example dividing by zero) produces an error observation; the agent can see it and try something different.

### Try it
1. Write `hesapla(1/0)` and see the error observation.
2. Chain two calculations: `hesapla(12*7)` then `hesapla($1+16)`.

### Test yourself
1. Why would you prefer a tool's result to the model's answer "from its head"?
2. What should the agent do when a tool error comes back?

## Discuss
What is the difference between giving a model a "connect to the internet" or "delete a file" tool and giving it a "calculator"? Which tools need approval?

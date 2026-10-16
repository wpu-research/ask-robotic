# Review the AI's explanation of code
duration: 30

## Wonder
When a model explains a piece of code, it speaks very fluently. But fluency does not mean correctness. Before you trust it, you need to look at the code.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Code review
In front of you there is a Python function and seven claims that "explain" it. The claims are **hand-written examples**; they are not real model output. Your task: mark each claim by looking at the code.

### Marks
- **Matches the source** (`Kaynakla uyumlu`): the code really does this.
- **Contradicts the source** (`Kaynakla çelişiyor`): the code does the opposite.
- **Not in the source** (`Kaynakta yok`): there is nothing like this in the code at all (a made-up detail).

### Open the tool
The **Hallucination detective** tool opens with the code case.
1. Mark all seven claims.
2. Mark at least six of them correctly.
3. Look closely at the claim that says it "returns 0 if the list is empty": what does `len([])` give? What happens when you divide by zero?
4. Press the **Check answers** button and read the explanations.

### How does it work?
- Predict the output yourself: the calculation (4 + 8 + 6) / 3 gives 6.0. In Python, `/` gives a decimal result.
- A sentence that says the code does something it does not do damages trust, even if it looks harmless.
- The best way to check is to run the code and write tests.

### Test yourself
1. Why is predicting the code's output more reliable than trusting the explanation?
2. Why do you get an error with an empty list?

## Discuss
When an AI assistant presents your code as "completely correct", which tests would you write before you believed it?

# Project: Your own eval set
duration: 35

## Wonder
The aim of the project: to build a dense test set. You will work not to defend the system, but to expose its weak spots. A good test engineer does not say "it works"; they can say "it doesn't work in these cases".

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### Task
In the **Eval table** tool, build your own test set for the comment classifier.

### Requirements
- At least 10 cases.
- At least 3 positive and 3 negative cases, and at least 1 unclear case.
- At least 2 hard cases where the system gets it wrong.
- No repeated cases.

### Report
Write a short report:
1. The overall accuracy and the results per label.
2. The cases where the system got it wrong, and why it went wrong.
3. An idea for improving the system (for example, which word list or rule could be added).
4. How far you can trust these results (is the number of cases enough?).

### How does it work?
- Ten cases is very small; a reliable measurement needs more. Real eval sets can contain hundreds or thousands of cases.
- Hard cases are useful because they show when the system goes wrong.

### Test yourself
1. If the test set is small, why should you be cautious about the results?
2. When the system changes, why do you run the eval again?

## Discuss
Swap eval sets with a friend. Which of the cases they wrote caught a weak point in your system?

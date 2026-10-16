# Accuracy is not enough: which label is being missed?
duration: 30

## Wonder
Is 80% accuracy good? If 80% of the data is "positive" and the system always says "positive", this number tells you nothing. You need to look label by label.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### Looking per label
For each expected label, how many of its cases were found correctly is called **recall**. For example, if 3 of 4 negative cases were found correctly, the recall for negative is 3/4. While the overall accuracy looks good, a serious weakness can hide in a single label.

### Open the tool
1. In the **Eval table** tool, write at least two "negative" cases.
2. Build a set where the system gets at least two cases wrong.
3. Make sure the accuracy still does not drop below 40% (the system is not completely bad).
4. Look at the label bars: which label is weaker?

### How does it work?
- A bar shows the rate of cases known correctly for that label; green: all correct, yellow: some missing.
- In real projects you also first ask "in which kind of case are we making mistakes?", then make a fix aimed at it.

### Test yourself
1. If 9 out of 10 cases are "positive" and the system always says "positive", what is the accuracy, and what is the recall for negative?
2. Why is grouping the wrong cases useful?

## Discuss
Think of a medical test: is telling someone who is not ill that they are "ill" just as important as telling someone who is ill that they are "healthy"? How does this affect which mistake we measure?

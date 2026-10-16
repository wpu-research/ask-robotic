# Why should we measure?
duration: 25

## Wonder
You tried a prompt three times and said "it works nicely". But will it also work on a hundred different inputs? Real engineering work means turning gut feeling into measurement. This is called evaluation, or an eval.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### What is an eval?
An eval is a test set that measures how well a system (a model, a prompt or an app) meets the expected behaviour. Each case is made of an input and an expected output. In the end you get a simple number: **accuracy = number correct / total cases**.

### Important note
The system tested in this activity is **not a model**: it is a small rule-based sentiment classifier. The method (write cases, run them, measure) is, however, exactly the same as a real eval.

### Open the tool
1. In the **Eval table** tool, write at least five test cases. Each case is a comment and the expected label. (The classifier reads Turkish comments.)
2. Watch the accuracy.
3. Find at least one case where the system gets it wrong. Hint: try sarcastic sentences such as `Harika, yine bozuldu` (Great, it broke again) and phrases such as `Fena değil` (Not bad).

### How does it work?
- The system looks at lists of positive and negative words; the word `değil` (not) flips the meaning of the word before it. Sarcasm and words it does not know are its weak points.
- Each case is shown on its own row with "✓" or "✗". The ✗ rows show the system's weak points.

### Test yourself
1. What is the accuracy of a system that gets 6 out of 8 cases right?
2. Why is the measurement misleading if you write only easy cases?

## Discuss
Before announcing that something "works well", what number would you want to see? What can a single number hide?

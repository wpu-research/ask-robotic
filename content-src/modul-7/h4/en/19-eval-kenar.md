# Edge cases and limits
duration: 30

## Wonder
Mistakes usually hide at the limits: between 19 and 20, between 49 and 50. In robot control, this difference is the difference between crashing and not crashing.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### Edge cases
If a rule says "stop if it is less than 20", what happens at exactly 20 is an edge case. Edge cases are the most valuable part of a test set.

### Open the tool
In the **Eval table** tool, the system being tested this time is a robot's obstacle decision. The input has the form `mesafe=<cm> hız=<cm/s>` (distance, speed); the output is "stop", "slow down" or "continue".
1. Write at least six cases.
2. Try both sides of the thresholds: distance 19 and 20, 49 and 50.
3. Do not repeat the same case.
4. Find a case where the system gets it wrong. Hint: what should happen if the distance is medium and the speed is very high?

### How does it work?
- The rule looks at the distance; it does not take the speed into account. This is a **deliberate gap**: you will find it by testing.
- You decide the expected label: "for `mesafe=40 hız=100` (distance 40, speed 100), what do you think the system should do?" The test compares this expectation with the system.
- If you also use the test set while tuning the system (if you fix the rule to suit the same cases), the measurement comes out too optimistic. This is **data leakage**. Keeping one set for tuning and a separate set for the final measurement is good practice.

### Test yourself
1. If the threshold is 20 and the rule is "stop if it is less than 20", what does the system do for distance=20?
2. Why does data leakage make the result look better than it is?

## Discuss
If the person who wrote this rule on a real robot had forgotten the speed, which test would have caught it in advance? What other variables would you add to the test set?

### Week goals
By the end of this week the learner:
1. Can say what an eval is and that a test case is made of an input and an expected output, and can work out accuracy (correct / total).
2. Can write a balanced, repeat-free and clear test set with positive, negative and unclear labels.
3. Can work out recall for a label; can explain why a single accuracy number is misleading on unbalanced data.
4. Can find a gap in a rule using both sides of the thresholds (edge cases) and paired cases; can explain data leakage.
5. Can build their own eval set and write a short report containing the results, the mistakes and the limit of confidence.

Note: the system this week is not a real language model but a small rule-based program (the activity says this clearly). The method is real; the system itself is simplified.

### The week's plan
The week has five lessons; each lesson takes about 25-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Why should we measure? | ~25 min | Read the explainer, write at least five cases in the Eval table, find a case where the system gets it wrong, do the mini quiz. |
| 2 | Writing good test cases | ~25 min | Build a balanced set of eight cases, use all three labels, remove repeats, compare labels with a friend. |
| 3 | Accuracy is not enough: which label is being missed? | ~30 min | Read the label bars, work out recall by hand, group the mistakes. |
| 4 | Edge cases and limits | ~30 min | Test the thresholds of the robot obstacle rule (19-20, 49-50), find the missing speed with paired cases. |
| 5 | Project: Your own eval set | ~35 min | Build a set of ten cases, measure it, group the mistakes and write the four-part report. |

### Prerequisite check
No special prior knowledge is needed. Before you start, check:
- Can the learner do percentage sums comfortably (6 / 8 = 75%)?
- Are prompts, outputs and the idea that "a model may not give the same answer every time" familiar? (lessons 1-15)
- Does the AI Workshop open in the browser? No external account or key is needed.

### Concept map
- **Basics:** eval → test case (input + expected output) → accuracy
- **Set design:** three labels → easy and hard cases → no repeats → checking labels
- **Measures:** recall → unbalanced data → grouping mistakes → cost of mistakes
- **Limits:** threshold → edge case → paired cases → data leakage (tuning set / measurement set)
- **Project:** write cases → measure → group → improve → measure again → report

### Common mistakes
- **Working out accuracy the wrong way round.** Wrong / total is the error rate; accuracy is correct / total.
- **Writing only easy cases.** The accuracy comes out high and the weak points are not visible.
- **Skipping the "unclear" label.** Mistakes on texts that carry no feeling are not caught.
- **Counting the same case more than once.** What matters is the number of unique cases.
- **Writing the expected label wrongly.** A system that works correctly looks as if it "got it wrong".
- **Dividing recall by all the cases.** The bottom of the fraction is only the cases with that label.
- **Trying only values in the middle.** Mistakes hide right next to the threshold (19-20, 49-50).
- **Keeping the tuning set and the measurement set the same.** The result comes out better than it really is.
- **Thinking the result of a small set is certain.** With 10 cases, a single case moves it by 10 points.

### End-of-week review
1. Reread each lesson's concept cards and explain the "common mistake" lines in your own words.
2. Read the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Work out an example by hand: a set of 20 cases has 15 positive and 5 negative cases; the system finds 14 positive and 3 negative cases correctly. Find the overall accuracy and the recall for each label. (Answer: 85%; positive 14/15, negative 3/5.)
4. For the robot rule, write which distances from 0 to 60 give "stop", "slow down" and "continue", and check one number.
5. Answer this question in your own words: "Why is a system's 90% accuracy not always good news?"

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Your own eval set)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Set size and balance | Fewer than ten cases, or one label dominates | At least 10 cases; at least 3 positive and 3 negative, and at least 1 unclear | Easy and hard cases deliberately balanced, labels compared with a friend |
| Case quality | There are repeats, or the labels are debatable | No repeats, clear labels | Explains why each hard case is hard |
| Error analysis | The wrong cases are not listed | The wrong cases and their causes are written | The mistakes are grouped by their causes |
| Report | Only a single accuracy number | Accuracy, per-label results, the mistakes and an idea for improvement | The limit of confidence (set size, data leakage) is written clearly |
| Honesty | Firm claims such as "perfect" about the system | The result is limited to "on these cases" | States that the system is not a real model and what the result does not prove |

### Note for parents and teachers
- **Aim.** This week is not about making an AI product, but about learning how to measure how well a system works. Measuring is the most basic habit of engineers who work with AI.
- **Honesty.** The classifier in the Workshop is a small rule-based program; it is not a real language model. This difference should be discussed openly with the child. The method being learned is real.
- **How can you help?** Instead of giving the answer, ask: "Would two people give this sentence the same label?", "Why did the system say that?", "With how many cases did you reach this number?"
- **Labelling can be subjective.** If you and the child cannot agree on the label of a sentence, that is not a mistake but a good discussion.
- **Time.** Spacing out the lessons makes learning last longer. In the project lesson, leave enough time to write the report.
- **Privacy.** The Workshop runs locally in the browser; remind the learner not to write personal information (real names, phone numbers) in the cases.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent was given).

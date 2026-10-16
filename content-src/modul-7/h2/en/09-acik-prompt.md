# Write a clear task
duration: 25

## Wonder
Describe the same job to two friends in two different ways: "do this" and "do this, for this purpose, in this format, at most this much". You know which one will do what you want more accurately. It is the same for models: a clear request usually means a better result.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### The parts of a good prompt
- **Task:** What is to be done? Start with an action verb.
- **Role:** Who should the model act like?
- **Context:** For whom, and for what purpose?
- **Example:** What does the answer you want look like?
- **Format:** Bullet points, a table, JSON, a number of sentences?
- **Constraint:** What should it not do?

### Open the tool
1. The **Prompt checker** tool opens. The task: get a robot club announcement summarised for 13-year-old students.
2. Start with "Summarise the announcement." and watch the score: a very short prompt gets a low score.
3. Add the missing parts one by one: the format (for example "at most 3 bullet points"), the role and the audience.
4. Get the score above 55; the words "announcement" and "summary" must appear.

### How does it work?
- This checker is a **rule-based** program: it looks at keywords and format. It is not an AI, and it cannot tell whether your prompt is really good.
- A high score means "the parts a good prompt should have are there". The real test is to try the prompt on a model and measure the output (week 4).
- Padding it out for no reason is bad too: every sentence should do a job.

### Try it
1. Write the same task with two different roles and compare how much each part adds to the score.
2. Add a constraint and look at how the score changes.

### Common mistakes
- Adding lots of adjectives ("the most perfect, most amazing summary") but not saying the format and the audience.
- Vague pronouns: saying "summarise this" and not writing what is meant.

### Test yourself
1. Name at least two parts that are missing from a prompt.
2. What is the limit of a rule-based checker?

## Discuss
For you, are "a good prompt" and "a long prompt" the same thing? What would a short but effective prompt look like?

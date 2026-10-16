### Week goals
By the end of this week the learner:
1. Can explain that a language model chooses the next word by probability and how **temperature** sharpens or flattens these probabilities; can do a small temperature calculation by hand.
2. Can say what the **context window** contains, can work out a token budget and can explain what happens when the window is full.
3. Knows that a conversation is made of system, user and assistant messages, that the model's "memory" is the history being sent again, and that secret information must not be stored in the system message.
4. Can break a prompt into the parts task, role, context, example, format and constraint, and make a vague request clear.
5. Can write a reusable prompt template with a placeholder and can state the limits of a rule-based checker.

### The week's plan
The week has five lessons; each lesson takes about 20-35 minutes. The plan below is for one lesson a day. The Workshop tools run locally in the browser; no external service, account or key is needed.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Temperature: cautious or adventurous? | ~25 min | Read the explainer, take the temperature to both extremes in the Workshop, do the calculation by hand with T=0.5, do the mini quiz. |
| 2 | The context window | ~25 min | Write a long text, make the window smaller, examine the tokens left outside, do a budget calculation. |
| 3 | System message, roles and conversation structure | ~20 min | Reading lesson: draw the message list by hand, count the messages, do the mini quiz. |
| 4 | Write a clear task | ~25 min | Start with "Summarise the announcement.", add the missing parts one by one, get the score above 55. |
| 5 | Project: A prompt template | ~35 min | Write a comment classification template, raise the score to 80, add the placeholder and the input separator. |

### Prerequisite check
Before starting, these should be remembered from week 1:
- What is a token, and why can one word be more than one token? (lessons 2-3)
- How does the model predict the next word, and what is a probability? (lessons 4-5)
- Percentage and ratio sums, such as 3/4 = 0.75 (for the temperature calculation).
- Being able to read short pieces of Python (in the quizzes they are only read, not written).
For any missing topic, go back to the relevant week 1 explainer.

### Concept map
- **Choosing:** probability distribution → softmax → temperature → greedy selection and variety
- **Input:** token → context window → token budget → truncation → choosing and summarising
- **Structure:** system message → user message → assistant message → conversation history = memory → role
- **Writing:** task, role, context, example, format, constraint → rule-based checker and its limit
- **Project:** template → placeholder → fixed and changing parts → input separator → cost

### Common mistakes
- **Thinking temperature is a "correctness setting".** A low temperature only gives consistency; the answer can still be wrong.
- **Forgetting the division in the temperature formula.** The scores are **divided** by the temperature; multiplying turns the effect upside down.
- **Counting only the input in the window.** The model's answer also takes a share of the window.
- **Thinking the text left outside is "remembered a little".** The part that is cut off is not seen at all.
- **Thinking the model remembers the history on its own.** The app sends the history again with every request.
- **Thinking a role is a source of knowledge.** Saying "be an expert" gives the model no new knowledge.
- **Writing a password in the system message.** "Don't tell anyone" is not protection.
- **Using vague pronouns.** "Summarise this" does not say what is meant.
- **Treating a high checker score as proof of quality.** The checker does not know meaning; it counts parts.
- **Forgetting to replace the placeholder.** If the text `{{yorum}}` is sent as it is, the model gets confused.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Reread the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. For two candidates with counts 4 and 1, work out the probabilities on paper at T = 1, 0.5 and 2 (around 0.80 / 0.94 / 0.67) and compare in the Workshop.
4. Answer these questions in your own words: "What goes into the context window?", "What is the difference between a role and knowledge?"
5. Rewrite the prompt "Summarise the announcement." from scratch, without looking, with the six parts, and see its score in the checker.

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (A prompt template)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Parts | Three parts or fewer | Has a role, task, example, format and constraint | Has all six parts and each one does a job |
| Placeholder | No placeholder, the comment is written in as fixed text | Has a placeholder such as `{{yorum}}` | The input is separated from the instructions with a label |
| Example | No example | Has one Input/Output pair | The example matches the wanted format exactly |
| Checker score | Below 80 | 80 or above | 90 or above; also explains that the score is not proof of quality |
| Testing | Has not tested the template at all | Has filled in the template by hand with 2-3 different comments and read it | Has found a weak spot in the template (for example a comment with two feelings) and fixed it |

### Note for parents and teachers
- **Aim.** This week lays a sound foundation for the question "how does a model think?": the model chooses by probability, works in a limited window and sees only what is written. Writing a good prompt is not about magic words but about describing a task clearly.
- **Honesty.** The next-word model in the Workshop is a small table made from counts, not a neural network. The prompt checker is a rule-based program, not an AI. No real model is called on this platform; there is no claim like "the model answered" or "Claude scored it". Remind the learner of this clearly.
- **How can you help?** When the learner gets stuck, instead of giving the answer, ask: "What is still left for the model to guess?", "Is this information in the window?", "Which part does this sentence serve?"
- **Privacy.** If a real AI tool is going to be used, personal details such as name, school and phone number, and passwords, are not written in the prompt. Not putting secret information in the system message is seen for the first time this week.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent was given).

### Week goals
By the end of this week the learner:
1. Tells apart zero-shot and few-shot prompts; writes balanced and consistent examples.
2. Writes a prompt that asks for JSON for output a program can read; explains why the model's output must be validated.
3. Knows when and how to ask for a chain of thought; shows that a fluent explanation can be wrong.
4. Improves a prompt by iteration: makes one change at a time and saves the versions.
5. Writes a six-part (task, role, context, example, format, constraint) announcement summariser prompt and justifies the choices with a design note.
6. Says that the checklist score in the Workshop is a hint, not proof.

### The week's plan
The week has five lessons. The plan below is for one lesson a day; all the tools run in the browser, and no account or key is needed. The chain of thought lesson is a reading lesson.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Teach by example | ~25 min | Read the explainer, write two labelled examples in the Prompt checker, do the mini quiz. |
| 2 | Structured output: JSON | ~25 min | Write the key names and an example output, tell valid and invalid JSON examples apart. |
| 3 | Chain of thought: step by step | ~20 min | Reading lesson: examine the example solution, catch the mistake in the first step, do the mini quiz. |
| 4 | Improve the prompt by iteration | ~30 min | Write three versions, put each version's score and change into a table. |
| 5 | Project: An announcement summariser prompt | ~40 min | Place the six parts, simplify, write the design note, assess with the rubric. |

### Prerequisite check
Before starting, the learner should be able to:
- Explain tokens, temperature and the context window in their own words (lessons 2, 6, 7).
- Name the six parts of a prompt (lesson 9) and say the difference between a system message and a user message (lesson 8).
- Do percentage sums (e.g. 47 / 50 × 100).
- The lessons contain small pieces of code (JSON.parse, filtering a list). The learner does not need to write code; it is enough to understand what it does by reading it.

### Concept map
- **Examples:** zero-shot → few-shot → balanced, consistent, correct pair → takes up space in the context (it is not fine-tuning)
- **Output:** free text → JSON (double quotation marks, key name, comma) → validation (is it valid, is the key there) → retry / give an error
- **Reasoning:** intermediate step → separate answer line → fluent ≠ correct → a tool for exact calculation
- **Iteration:** goal → v1 → measure → one change → v2; check score ≠ real success
- **Honesty:** the checker is not a model; there is no model answer in the Workshop; proof is measurement on real examples

### Common mistakes
- **Writing all the examples with the same label.** The model may lean towards giving that label to everything.
- **Labelling an example wrongly, or making an example contradict the instructions.** The model gets confused.
- **Single quotation marks or a trailing comma.** Both produce invalid JSON.
- **Not validating the output.** "The model usually writes it correctly" is not a guarantee.
- **Trusting a fluent explanation.** A mistake in the first step is carried to the end.
- **Having the model do an exact calculation.** A tool is used for calculations.
- **Changing many things at once.** You cannot know which one worked.
- **Treating a high score as proof.** The Workshop checker looks at keywords; there is no model answer or output quality in this tool.

### End-of-week review
1. Look at each lesson's concept cards and read the "common mistake" lines out loud.
2. Reread the explanations of the questions you got wrong in the mini quizzes, then do the question again without looking.
3. Write a "two-example" classification prompt by hand; ask a friend to find the mistake in the examples.
4. Write three JSON examples, valid and invalid, and mark where the mistake is.
5. Answer in your own words: "Why does the Prompt checker giving 90 points not prove that the prompt is good?"

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (An announcement summariser prompt)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Parts | At most three of the six parts are there | All six parts are written | Every part does a job, with no unnecessary sentences |
| Example | No example, or it contradicts the instructions | There is a consistent input-output example | The example suits the audience and the format, and was chosen on purpose |
| Faithfulness to the source | No constraint | A constraint such as "do not add missing information" is written | Explains that the constraint is not a guarantee and how it will be tested |
| Simplifying and iteration | A single draft | At least two versions and a change note | Versions made with one change at a time are in a table, with the reasons written |
| Design note | None | The reasons for the role, example and format are written | Also writes what needs to be measured and the limit of the checker |

### Note for parents and teachers
- **Aim.** This week is not about the model giving "magic" answers, but about the learner building the habit of writing clear, testable requests.
- **Simulation.** The Prompt checker in the Workshop is not an AI but a rule-based checklist; it does not produce a model answer. If the learner asks "what did the tool answer?", talk about this difference together. If a test is done with a real model, the results may change every time and may contain wrong or made-up content.
- **How can you help?** Instead of giving the answer, ask: "Which part did you change?", "What evidence is there?", "Would it work on another example too?"
- **Privacy.** When writing to a real model, the learner should not paste personal information (name, address, phone, school documents).
- **Time.** Spacing out the lessons makes learning last longer.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent was given).

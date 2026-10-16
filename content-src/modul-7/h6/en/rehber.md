### Week goals
By the end of this week the student:
1. Can explain tool use: the model asks for a call, the application runs the tool, and the result comes back as an observation.
2. Can put the think-act-observe loop in order and chain step results with `$1`, `$2`, `$son`.
3. Can describe the step limit, error observations and stopping conditions; can compare the total of a movement written with `tekrar` against the wall.
4. Can explain the principles "measure first, then move", safety margin, least privilege and human approval with examples.
5. Can write a mini agent script that measures twice and moves forward twice, use step numbers correctly, and honestly say how a scripted agent differs from a real model.

### Plan for the week
The week has five lessons; a lesson takes about 30-40 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Tool use | ~30 min | Read the explainer, write the `hesapla(12*7)` script, try the error observation and chaining, do the mini quiz. |
| 2 | Think, act, observe | ~30 min | Study the scripted demo, find the number of groups with two `ara` calls and one `hesapla`. |
| 3 | Errors, limits and stopping | ~30 min | Move the robot forward without hitting the wall, observe the crash and the step limit with `tekrar 6`. |
| 4 | Measure first, then move | ~30 min | Measure with `mesafe()`, leave a safety margin, change the margin and compare the effect. |
| 5 | Project: mini agent | ~40 min | Write the plan on paper, build the script, fill in the report, assess it with the rubric. |

### Prerequisite check
This week the student should know:
- That a language model works by predicting words (Week 1), and that a model on its own does not guarantee exact information.
- The idea of retrieving information (Week 5): a model can take information from outside.
- The four basic operations, percentages and subtraction. No coding knowledge is needed this week; script writing is made of simple lines.
- How to open and use the AI Workshop (it runs in the browser; no account or key is needed).

### Concept map
- **Tools:** tool list -> call `arac(girdi)` -> observation -> carrying with `$n` -> error observation
- **Agent:** goal -> think-act-observe loop -> done? -> `bitir(...)`
- **Limits:** step limit (30) -> stopping on an error -> irreversible action (crash)
- **Safety:** measure first -> safety margin -> least privilege -> human approval
- **Honesty:** in the workshop, "model step" = your script (simulation); the tools really calculate -> a real agent is measured (eval)

### Common mistakes
- **Using a `$n` that does not exist.** Writing `$2` when only one step was taken gives an empty text.
- **Not checking the error observation.** The error text of a failed step is carried to the next step with `$n`, and the calculator gets text instead of a number.
- **Not working out the `tekrar` total.** `tekrar 6: ileri(20)` hits the wall on the fifth call.
- **Applying the safety margin in the wrong direction.** It should be `hesapla($1-20)` instead of `hesapla($1+20)`.
- **Mixing up `$1` and `$4`.** The second calculation must be based on the second measurement.
- **Thinking the "model step" in the workshop is a real model.** You make the decision as a script; the model's answer is a simulation.
- **Relying on the step limit.** The limit cuts off an endless loop; it does not guarantee that the plan is right.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Reread the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Write the project script from scratch without looking; then make the second move 40 per cent of what remains, work out where the robot will stop first, then check it in the workshop.
4. Answer in your own words: "What is the difference between the agent in the workshop and an agent that uses a real model?"
5. If an agent were given permission to send emails, which safety steps would you put in place? Write three points.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Goal: at least 4 correct in every lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Mini agent)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Measurement and calculation | No measurement, or the calculation was done in the head | `mesafe()` called twice, half and 60 per cent found with `hesapla` | Step numbers planned on paper, calculations predicted in advance |
| Safety | The robot hits the wall | No crash, the robot stops 5-20 cm from the wall | Explains why the safety margin was chosen |
| Script | Wrong `$n` numbers or faulty steps | The script runs without errors, `dur()` and `bitir()` are called | Tried an error scenario on purpose (e.g. a wrong `$n`) and fixed it |
| Report | Observations and explanation missing | Has the script, the observations and the answer to "why did you measure twice" | Justifies extra safety measures for a real robot (measuring while moving, emergency stop, approval) |
| Honesty | Describes the script as "the AI decided" | Says "the model step is my script" | Explains the difference in reliability between a scripted agent and an agent that uses a model, and the need for evaluation (eval) |

### Note for parents and teachers
- **Goal.** This week is not about using an AI product, but about understanding how agents work and why they need limits, measurement and approval.
- **Everything is virtual.** The tools in the workshop (calculator, small knowledge base, virtual robot) run locally in the browser; there is no external service, account or key. The "model step" is not a model: it is the script the student writes. In a real agent a language model makes the decision and may not reach the same result every time. The lessons stress this difference on purpose.
- **How to help.** When the student is stuck, instead of giving the answer, ask: "Which step's result are you taking with which `$n`?", "What does the Observation column say?", "Does the total movement go past the wall?"
- **Conversation idea.** Talk together about the risk of giving a piece of software permission to "delete files" or "send emails"; at which steps should human approval be needed?
- **Progress.** The mini quiz results at the end of each lesson appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent was given).

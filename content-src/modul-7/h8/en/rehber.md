### Week goals
By the end of this week the student:
1. Can compare the claims in an AI output with the source and sort them into matches, contradicts or not in the source; can work out the hallucination rate.
2. Says which information is not to be typed into a service, anonymises data, says when AI help was used, and shows bias with group-based accuracy.
3. Justifies whether to leave a robot decision to a rule or a model; stops the virtual robot with a conditional `eğer` ("if") rule.
4. Judges whether a decision should be left automatic in terms of reversibility, the people affected and the cost of mistakes; knows the human-in-the-loop and safe-default patterns.
5. Gathers the eight weeks of work in an honest portfolio backed by evidence.

### Plan for the week
The week has five lessons; each lesson takes about 25-40 minutes. The plan is for one lesson a day. All the tools this week run locally in the browser; no external service or account is needed.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Hallucination detective | ~30 min | Read the explainer, compare the eight claims with the source in the detective tool, do the mini quiz. |
| 2 | Privacy, copyright and bias | ~25 min | Reading lesson: read the explainer, try the anonymising example yourself, do the mini quiz. |
| 3 | Decisions in a robot: rule or model? | ~35 min | Write an `eğer` rule for the virtual robot in the agent loop, change the threshold and compare the results. |
| 4 | When should a human decide? | ~25 min | Reading lesson: apply the four questions to your own example, turn the error rate into a daily number. |
| 5 | Project: engineering portfolio | ~40 min | Fill in the portfolio outline, add evidence to each heading, check the principles of honesty. |

### Prerequisite check
- Have they completed the lessons on tokens, temperature, prompts, evals, RAG, agents and injection (1-35)?
- Can they work out an accuracy percentage (correct / total x 100)?
- Do they remember how to use `mesafe()`, `dur()` and `$son` in the agent loop in the workshop?
- Can they read simple Python code (sums, division, `if/else`)?

### Concept map
- **Reliability:** hallucination → comparing with the source → matches / contradicts / not in the source → rate → reducing it (source, tools, eval)
- **Responsibility:** privacy → anonymising → copyright and honesty → bias → group-based eval
- **Robotics:** rule ↔ model → threshold → hard limit → safety layer independent of the model
- **Oversight:** reversibility → people affected → cost of mistakes → human in the loop → safe default → logging
- **Project:** outline → evidence → separating real calculation from simulation → writing down what is missing

### Common mistakes
- **Thinking a fluent sentence is right.** A well-written answer does not mean a correct answer.
- **Mixing up "not in the source" and "contradicts".** A detail that never appears in the source is made up; one that says the opposite of the source is a contradiction.
- **Mixing up the error rate and accuracy.** 6 mistakes in 40 summaries = 15% errors, 85% accuracy.
- **Changing only the name and calling it anonymous.** When age, school and neighbourhood come together, the person can be recognised.
- **Looking at overall accuracy and not at the groups.** The average can hide a problem in one group.
- **Expecting the wrong value of `$son`.** After `dur()` succeeds, `$son` becomes `durdu` ("stopped"), not the distance.
- **Writing the condition the wrong way round.** `eğer $son > 30: dur()` is the opposite of the `<` rule; the robot does not stop.
- **Writing the safety rule only in the model's prompt.** A hard limit must work independently of the model.
- **Presenting a simulation as real model output.** Which parts of the portal tools are real calculations and which are simulations; separate them in the portfolio.

### End-of-week review
1. Read each lesson's concept cards and say the "common mistake" lines out loud.
2. Reread the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Choose a source in the detective tool and write your own eight claims; have a friend mark them.
4. In the agent loop, raise the threshold from 50 to 70 and the step from 20 to 35; first predict where the robot will stop, then run it.
5. Answer in your own words: "Which decision would I never leave completely to a model, and why?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Goal: at least 4 correct in every lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Engineering portfolio)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Coverage | Some headings missing | All nine headings are there | A next step is also written under each heading |
| Evidence | Claims have no evidence | Each heading has a number, screenshot or prompt | The numbers come with the number of cases and a comparison |
| Honesty | A simulation is described as a real model | Real calculation and simulation are separated | Missing parts and limits are written clearly |
| Responsibility | Privacy and oversight are skimmed over | There are rules for privacy, copyright and human oversight | The rules are shown through a real example case |
| Explanation | Cannot explain what they did | Explains each section in three to five sentences | Explains a mistake they made and how they solved it |

### Note for parents and teachers
- **Goal.** This week is about responsibility and critical thinking more than technical skill. The goal is for the student not to trust AI output blindly, and to be able to say the limits of the tool they use.
- **Honesty.** The tools on the portal are small examples. The hallucination cases were written by hand, and the agent's model step is the student's script. Encourage the student to state this in their portfolio too.
- **How to help.** While the student defends a result, ask: "Which source did you check this with?", "How many cases did you look at?", "If you got this decision wrong, who would be affected?"
- **Privacy.** If a real AI service is going to be used with the student, first look at the service's age requirements and privacy policy together. Passwords, addresses, phone numbers and other people's information are never typed in.
- **Homework honesty.** Read the school's rules on using AI together with the student; make saying what help was used a habit.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent was given).

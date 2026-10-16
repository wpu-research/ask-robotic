### Week goals
By the end of this week the student:
1. Can say how AI tools that write code work as agents, and describe a safe workflow (goal, plan, small step, test, review, record).
2. Can sort an AI's explanation of code, by looking at the code, into "matches", "contradicts" or "not in the source".
3. Can explain what prompt injection (direct and indirect) is, and why a banned word list is fragile.
4. Can choose several defence layers to fit a budget and say the limit of each layer.
5. Can write a one-page red team report with the sections finding, impact, recommendation, remaining risk and responsible disclosure.

### Plan for the week
The week has five lessons; each lesson takes 30 minutes, and the project 40 minutes. The plan is for one lesson a day. The workshop tools run locally in the browser and are simulations; the model answers do not come from a real model.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The workflow for writing code with AI | ~30 min | Read the explainer (no activity tool), write the six steps in your own words, do the mini quiz. |
| 2 | Review the AI's explanation of code | ~30 min | Mark the seven claims in the Hallucination detective tool, predict the output by hand. |
| 3 | Red team: attack | ~30 min | On the Attack tab of the Prompt injection tool, get past levels 0 and 1, read the trace of level 2. |
| 4 | Layered defence | ~30 min | On the Defend tab, stop the six attacks with a cost of at most 3. |
| 5 | Project: red team report | ~40 min | Finish the attack and defend tasks, write the one-page report, assess it with the rubric. |

### Prerequisite check
- Was the agent loop from Week 6 understood? (The model decides, the tool does the work, the result goes back to the model.)
- Is the idea of the system message and roles (lesson 8) remembered?
- Can they read a small Python function (for loop, len, return)? This week's code examples are short, but they need to be read.
- Does the AI Workshop open in the browser? No external account or key is needed.

### Concept map
- **Coding agent:** goal → plan → small step → test → review → commit; least privilege and approval
- **Verification:** fluency ≠ correctness → matches / contradicts / not in the source → output prediction → edge case → weak test
- **Attack:** instructions and data in the same stream → direct and indirect injection → the fragility of blacklists
- **Defence:** data/instruction separation, hierarchy, output filter, least privilege, human approval → cost balance → remaining risk
- **Ethics:** red and blue teams → permission → responsible disclosure

### Common mistakes
- **Thinking "the tests passed" means "the code is right".** A written test can let wrong code pass too; add edge cases.
- **Believing a fluent explanation.** For every verb in the explanation, find the line in the code; if you cannot, the claim is made up.
- **Not trying the empty list.** `len([])` is zero, and the division gives an error.
- **Relying on a banned word list.** The same meaning can be said with other words.
- **Thinking the document is safe.** Indirect injection comes from the content that is read; even if the user is innocent, the document may not be.
- **Writing secret information in the system message.** A model can leak what it knows; the strongest measure is never to give it.
- **Writing "completely safe" in the report.** State the remaining risk honestly.
- **Testing on a real system without permission.** Testing is done only on systems where it is allowed.

### End-of-week review
1. Read each lesson's concept cards and say the "common mistake" lines out loud.
2. Read the explanation of the mini quiz questions you got wrong, then solve the question again.
3. Fix the weak test example (the `buyuk` function) yourself and write two extra tests.
4. Choose a different set of three from the six defences; find which attack stays open by looking at the table in the workshop.
5. Answer in your own words: "Why should I never give a secret key to the model?"

The mini quizzes of the five lessons are enough as an end-of-week test: 4 questions in lesson 31, 4 in lesson 32, 5 in lesson 33, 5 in lesson 34 and 4 in lesson 35, 22 questions in total. Goal: at least 3 correct in every lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Red team report)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Attack | Could not even get past level 0 | Wrote a document of at least 5 words that gets past levels 0 and 1 | Explained why it worked (a wording that is not on the list) |
| Defence | Some of the six attacks are open | A set with a cost of at most 4 that stops all six attacks | Chose at least three different layers and justified the choice with the budget |
| Report | Sections missing | Finding, impact, recommendation, remaining risk, responsible disclosure are there | Every section is based on an observation from the workshop |
| Remaining risk | Says "completely safe" | States the remaining risk | Also writes about the difference between the simulation and a real system |
| Ethics | Approves of testing on a real system | Writes down the principles of permission and responsible disclosure | Explains them with an example (such as a school system) |

### Note for parents and teachers
- **Goal.** This week is not about teaching how to break a system, but about trusting AI tools in a measured way and thinking about defence. The "model" in the workshop is a simulation that works with simple rules; it does not show a real model.
- **How to help.** Instead of giving the answer, ask: "Which line of the code is this claim in?", "Which word that is not on the list could an attacker use?", "Why was this secret information given to the model?"
- **The ethical line.** Talk openly with the student: attacking someone else's system without permission does harm and can be illegal. The ideas learned are tried only in environments where it is allowed.
- **Safety.** Everything on this platform is virtual; no real passwords, keys or personal information are written.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent was given).

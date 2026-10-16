# Decisions in a robot: rule or model?
duration: 35

## Wonder
What should a robot do when it sees an obstacle: should a rule run ("stop if closer than 50 cm"), or should a learned model decide? The answer depends on the job: sometimes a simple rule is the safest option.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Where is AI in robotics?
- **Vision:** recognising obstacles, lines, objects or people from a camera (usually done with specially trained vision models).
- **Decision:** choosing an action based on what is sensed. This can be a rule, a state machine or a learned policy.
- **Language interface:** turning a command a person gives in natural language into tool calls. Language models can be used here; but the safety of the command must be ensured by a separate layer (rules, limits, approval).

### When is a rule good?
A rule's behaviour is predictable, testable and explainable. In places where safety is critical (e.g. "stop if too close"), these qualities matter. A model is better at jobs that are hard to write as a rule (such as image recognition), but it can make mistakes, and it is hard to explain why.

### Open the tool
**Agent loop**, robot corridor. Here the script is your rule:
1. Move the robot forward in three steps: `tekrar 3: ileri(20)`.
2. Measure with `mesafe()`.
3. Write a conditional line: `eğer $son < 50: dur()` (`eğer` means "if").
4. Goals: the script has an "if", the robot stopped when the condition came true, it did not hit the wall, and it moved forward at least 50 cm.

### How does it work?
- The line `eğer koşul: çağrı` ("if condition: call") runs the call if the condition is true (the result of the calculation is not 0). `$son` is the result of the latest successful call.
- The script and the tools are deterministic: the same result on every run. A real model-based decision may not have this quality, so safety rules must stay independent of the model.

### Test yourself
1. Which decision would you leave to a rule, and which to a model? Why?
2. Even if the model says "go forward", where should the rule that protects the robot from the wall live?

## Discuss
In a line-following robot, does it make sense for the part that finds the line with a camera to be a model, and the part that stops the motors to be a rule? Why?

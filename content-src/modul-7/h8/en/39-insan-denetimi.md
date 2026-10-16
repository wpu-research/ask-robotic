# When should a human decide?
duration: 25

## Wonder
A model is fast, never gets tired and is often helpful. But some decisions cannot be undone when a mistake is made, or they affect other people. Who makes these decisions is an engineering design question.

## Activity
This is a reading lesson; there is no activity tool.

### What do you leave automatic?
When you decide, ask these questions:
1. **Can it be undone?** If a wrong decision can be fixed easily, automation is more acceptable.
2. **Does it affect others?** Decisions that affect people's safety, money or opportunities need more oversight.
3. **How costly is a mistake?** Is the error rate measured in the eval acceptable?
4. **Can it be explained?** Can you say why the decision was made?

### Design patterns
- **Human in the loop:** the model makes a suggestion, a human approves.
- **Safe default:** if it is not sure, it stops or asks a human.
- **Logging and audit trail:** what was done, and why, is recorded.
- **Limits:** hard limits such as speed, force, area and budget are applied independently of the model.
- **Continuous measurement:** the eval is run again when the system changes and with new data.

### Responsibility
The person who uses the model and the team that builds the application are responsible for the outcome. "The model said so" is not an excuse. Before using an AI output, you should ask yourself: "Have I checked this myself, and can I live with the consequences?"

### Test yourself
1. What does "human in the loop" mean? Give an example.
2. Under which condition would you leave a robot's decision fully automatic?
3. If the model makes a mistake, who is responsible?

## Discuss
How would you apply the "human in the loop" principle to using AI for class homework? Which steps should you do yourself?

# Measure first, then move
duration: 30

## Wonder
Gathering information before an irreversible action is a rule for agents too: measure the distance first, then move forward. This is the basis of working safely, for people and machines alike.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Permissions and approval
The tools given to an agent are its "permissions". Good design means:
- **Least privilege:** only the tools that are needed are given.
- **Read first, then write:** gather information before changing anything.
- **Human approval:** approval is asked for irreversible or risky steps.

### Open the tool
**Agent loop**, robot corridor:
1. Make the first step `mesafe()` ("distance").
2. Move forward 20 cm less than the remaining distance: `hesapla($1-20)` then `ileri($2)`.
3. Make the robot stop between 5 and 30 cm from the wall, and call `dur()`.

### How does it work?
- `mesafe()` returns 100; `hesapla($1-20)` gives 80; `ileri($2)` moves the robot forward 80 cm.
- Measuring and moving are separate steps; the surroundings can change after the measurement. On real robots you keep measuring while moving, too.

### Try it
1. Make the margin 5 cm: is the result still safe?
2. Skip the measurement and write `ileri(90)` straight away: what happened?

### Test yourself
1. What precautions would you take when giving a robot an `ileri(N)` tool?
2. At which steps is human approval needed?

## Discuss
If you gave an agent permission to send emails, which safety steps would you put in place? Does it make sense to ask for approval on every email?

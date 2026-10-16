# The workflow for writing code with AI
duration: 30

## Wonder
There are AI tools that run in the terminal, read and edit code files, and run commands (Claude Code is one of them). So is it safe to just say "do it" and walk away? How do engineers work with these tools?

## Activity
This is a reading lesson; there is no activity tool. Here we do not run Claude Code-style tools; we learn the principles of the workflow.

### Coding tools that work like agents
Tools like these are the agent loop you saw in week 6, applied to coding: they read the codebase, make a plan, change files, run test commands, look at the result and fix things. The tools (reading files, editing, running commands) are real; the decisions, however, are made by a language model.

### A good workflow
1. **Make the goal clear:** what do you want, which files will be affected, what must not break?
2. **Ask for a plan first:** before having any code written, read the plan and fix wrong assumptions at that stage.
3. **Small steps:** break a big change into pieces; check each piece separately.
4. **Have tests written / run them:** define the behaviour with a test. Do not say "done" until the test passes.
5. **Read the change:** study the generated code line by line. Do not take ownership of code you do not understand.
6. **Version control:** save changes in small records (commits); if something goes wrong, you can go back.

### Things to watch out for
- The model can "make up" a function or library that does not exist. Do not believe it without running it.
- Do not ask for secret information (passwords, keys) or have it written into the code.
- The permissions given to the tool should be kept to the minimum; ask for approval on risky commands.
- If something works, understanding why is your job: the model's explanation can be wrong too (lesson 32).

### Test yourself
1. Why is reading a plan first better than having the code written straight away?
2. What does the sentence "The tests passed" guarantee, and what does it not?
3. Which three things do you look at before accepting a generated change?

## Discuss
Whose responsibility is a bug in code you wrote with AI? Is the answer "the person who wrote the code" enough?

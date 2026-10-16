# System message, roles and conversation structure
duration: 20

## Wonder
An AI app may have told the model something even before you typed anything: "You are a coding teacher, give short answers." This invisible introduction steers the model's behaviour. So which part of this is yours, and which part is the app's?

## Activity
This is a reading lesson; there is no activity tool.

### How is a conversation structured?
Most chat-based models take their input as **messages**. The general structure is:
- **System message:** lasting instructions given by whoever wrote the app (role, tone, rules).
- **User message:** the request you write.
- **Assistant message:** the model's earlier answers. These go into the context too.
With every answer, the model sees all of these messages together (as much as fits in the window). So the model's "memory" is the conversation that is given to it again each time.

### Giving a role
A sentence like "You are an experienced robotics mentor" can affect the tone and level of detail of the model's answers. A role is not magic: it does not give the model new knowledge; it only steers which knowledge it uses, and in what tone. You cannot make a piece of information that needs checking correct by giving a role.

### What does a good system message contain?
1. The role and the audience.
2. The job to do and the things not to do.
3. The output format.
4. What to do when it is not sure ("if you don't know, say you don't know").

### Important: a safety note
The system message is not a "safe". Do not store secret keys, passwords or information that must be kept secret there. If the model's output is steered the wrong way, this content can come out. In lesson 33 you will see for yourself why this is so.

### Test yourself
1. Does the model "remember the earlier conversation", or is it given to it again?
2. Does giving a role teach the model new knowledge?
3. Why is writing a password in the system message a bad idea?

## Discuss
If you wrote a school assistant app, which three rules would you put in the system message? What might happen if a user wanted to get around these rules?

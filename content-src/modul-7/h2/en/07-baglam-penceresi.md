# The context window
duration: 25

## Wonder
You may have noticed that, near the end of a long chat, a model seems to have "forgotten" something you told it at the start. Often the reason is that the model can see only a limited number of tokens at once. This is called the context window.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### What is the window?
In one request, a model can process text together up to a certain number of tokens. This limit is called the context window. What you write, the model's answer and the documents you give it all count towards the limit. If the limit is exceeded, part of the text is cut off, summarised or left out. In our simulation the oldest tokens are left out.

### Open the tool
1. In the **Tokens and BPE** tool, write a long text (at least 25 tokens).
2. Lower the **Context window** slider to about 20 tokens. The tokens left outside appear struck through.
3. Make at least 5 tokens stay outside, but keep more than 8 tokens in the window.

### How does it work?
- The part that stays in the window is the part "the model sees". In this simulation, the part left outside is not seen.
- In real systems the window is much bigger, but long documents, long chats and lots of tool output can still fill it.
- Not everything inside the window may be used equally well either. Problems such as missing information in the middle of very long contexts have been reported. That is why keeping important information short and clear is a good habit.

### Try it
1. Make the window very small and show that a rule you gave at the start of the sentence is left outside.
2. Shorten the text: does the same rule fit in the window?

### Test yourself
1. If the window is 100 tokens and your text is 130 tokens, how many tokens are left outside?
2. In a long task, where would you put the important information?

## Discuss
A robot produces hundreds of sensor lines every second. Is it possible to send them all to the model? What would you choose and summarise?

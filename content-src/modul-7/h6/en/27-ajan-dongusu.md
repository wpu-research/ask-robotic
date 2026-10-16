# Think, act, observe
duration: 30

## Wonder
An agent does not answer in one go; it builds a loop: what do I need, which tool should I call, what did the result say, am I done? This loop is what sets an agent apart from a simple chat.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### The loop
1. **Think:** what is the next step towards the goal?
2. **Act:** call a tool.
3. **Observe:** read the result.
4. Done? Yes: give the answer. No: go back to the start.

### Open the tool
In the **Agent loop** tool the world is: knowledge base + calculator. Question: how many groups will there be in the club? (number of members ÷ group size)
1. First press the **Show the scripted demo** button and study it. The "thought" texts there were written by hand; no model produced them.
2. Write your own script: find the two facts with `ara(...)` (`ara` means "search"), divide with `hesapla($1/$2)`, and give the answer with `bitir($3)`.
3. Goals: two `ara` calls, one `hesapla`, the correct answer 6.

### How does it work?
- `$1`, `$2` carry results by step number; `$son` ("last") gives the latest successful result.
- The knowledge base is small and prepared by hand. A query that does not match returns `bulunamadı` ("not found"); the agent must decide how to handle that.
- In a real agent the model chooses every step and can change its plan after seeing the tool result. Our script, however, is written in advance, so there is no "plan that changes with the observation"; we know about this limit.

### Try it
1. Search for something that is not in the knowledge base: `ara(yıldız sayısı)` ("number of stars").
2. How many steps did the correct result take? Can you do it in fewer steps?

### Test yourself
1. Put the four parts of the loop in order.
2. When the agent cannot reach a result, which stopping conditions are needed?

## Discuss
What is the difference between a chatbot and an agent? Which jobs would you be careful about giving to an agent?

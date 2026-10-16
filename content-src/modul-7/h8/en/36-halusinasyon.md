# Hallucination detective
duration: 30

## Wonder
A model can tell you the author of a book it has never heard of, and sound very sure of itself. This is called a hallucination: information that looks fluent and reasonable but has no source, or is wrong.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Why does it happen?
The model produces a likely next piece; it may say something not because it "knows" it, but because writing it that way looks reasonable. If information is missing or not in the context, it can fill the gap with a fluent guess.

### Types
- **Contradiction:** writing the opposite of what the source says.
- **Made-up detail:** adding a date, name or number that is not in the source at all.
- **Exaggeration:** certainty that is not in the source, such as "definitely" or "always".

### Open the tool
**Hallucination detective**, with the sensor note case. There is a source text and eight claims "summarised" from it (hand-written examples, not real model output).
1. Mark all eight claims.
2. Mark at least seven of them correctly.
3. Find the made-up detail that is "Not in the source".
4. Check the answers and read the explanations.

### How do you reduce it?
- Put the source into the context (RAG) and say "rely only on the source".
- Give the instruction "If you do not know, say you do not know".
- Ask it to cite sources for important claims, and **check the sources yourself**.
- Use tools for calculations and up-to-date information.
- Measure the output with an eval.
These reduce the risk; they do not remove it.

### Test yourself
1. What is the difference between "not in the source" and "contradicts the source"?
2. Why is a model speaking confidently not proof that it is right?

## Discuss
In real life, has there been a moment when you trusted an AI's answer and then turned out to be wrong? What would you do differently next time?

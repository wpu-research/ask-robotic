# Retrieval: find the right chunk
duration: 30

## Wonder
If the question is vague, retrieval is left to luck too: if you type `Yardım` ("Help"), you cannot know which chunk should come back. The retrieval step depends on the quality of the shared language between the question and the document.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Retrieval and insertion
The retrieval step turns the question into a vector, ranks the chunks by similarity and picks the best K. The chosen chunks are inserted into a **prompt template**: "Answer the question based on the context below. If it is not in the context, say you do not know." Then this prompt goes to the model.

### Open the tool
In the **RAG pipeline** tool:
1. The question box starts with `Yardım` ("Help"). Write a question that finds how quickly the mentors reply.
2. Make the template answer contain `iki gün` ("two days").
3. Make the question at least four words long.
4. Retrieve at most three chunks.

### How does it work?
- Retrieval is **really calculated**. The result depends on the words in the question.
- Step 5 (synthesis) is a **template**: in a real system it would be a model. The tool only quotes the best-matching sentence in the context. So the answer is a quote, not "the model's interpretation".
- If the answer is not in the context, a good system should say "I don't know". For that you need a clear instruction in the prompt and cases in the eval that test this situation.

### Try it
1. Raise the number of chunks to 5: the context got longer. Did it make finding the answer easier or harder?
2. Ask about a topic that never appears in the guide (`Ücret ne kadar?`, "How much does it cost?"). What does it bring back?

### Test yourself
1. If retrieval brings back the wrong chunk, how does that affect the next step?
2. Why is the instruction "If it is not in the context, say you do not know" important?

## Discuss
Even if the retrieval step works perfectly, can the synthesis step give a wrong answer? Which mistake comes from which step, and how do you tell them apart?

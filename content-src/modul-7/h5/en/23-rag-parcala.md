# Chunking: how big?
duration: 30

## Wonder
If what you ask the model is not in a document it has seen, the model may guess. Giving the document to the model is the fix; but giving a 200-page document all at once is expensive and may not fit in the window. The fix: chunk the document and bring back the chunks that fit the question. This is called RAG (retrieval-augmented generation).

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### The RAG pipeline
1. **Chunk:** split the document into small chunks.
2. **Vectorize:** turn each chunk and the question into a vector.
3. **Retrieve:** pick the K chunks closest to the question.
4. **Insert into context:** put the chosen chunks into the prompt.
5. **Synthesis:** the model writes an answer based on the context.

In this lesson we focus on step 1.

### Open the tool
The **RAG pipeline** tool holds a fictional club guide (a text made up for the lesson). The question is `Proje teslimi ne zaman?` ("When is the project due?").
1. At the start the chunk size is very large; the whole document is one chunk.
2. Make the chunk size smaller: split the document into at least 5 chunks.
3. Make sure `son cuma` ("last Friday") appears in the retrieved context, and the context is no longer than 45 words.
4. Keep the overlap below half of the chunk size.

### How does it work?
- **Overlap:** consecutive chunks share a few words, so an answer is not cut in half between two chunks.
- A chunk that is too large: unneeded text gets into the context and the similarity is "watered down". A chunk that is too small: the answer is split or loses its meaning.
- There is no single right size; you choose it with an eval, based on the document and the questions.

### Try it
1. Lower the chunk size to 10 and check whether the answer is still found.
2. Set the overlap to zero and look at where the chunks begin and end.

### Test yourself
1. Why does overlap help?
2. What is one drawback of very small chunks?

## Discuss
When you chunk a book, is it more sensible to split at sentence boundaries or at a fixed number of words? In which situation would you choose which?

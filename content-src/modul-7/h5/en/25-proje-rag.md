# Project: your own RAG pipeline
duration: 40

## Wonder
Now you put all the steps together: chunk size, overlap, number of chunks to retrieve and the question. The goal: bring back from the guide the answer to the question `Bronz rozet için ne gerekir?` ("What do you need for the bronze badge?").

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Task
Set up the whole pipeline in the **RAG pipeline** tool.

### Goals
- The template answer contains `iki proje` ("two projects").
- The chunk size is between 15 and 60 words.
- The overlap is greater than 0.
- The number of retrieved chunks is between 1 and 3.

### Report
1. The settings you chose and why.
2. Ask the guide three different questions; on which one did the pipeline struggle?
3. Ask a question whose answer is not in the context: what did the system do? If it were a real model, what should it have done?
4. Two ideas for improving the pipeline.

### How does it work?
- The first four steps of the pipeline are real calculations; the synthesis step is a template.
- In real RAG systems, measuring is essential too: "was the right chunk retrieved?" and "is the answer faithful to the source?" are tested separately.

### Test yourself
1. How does RAG reduce a model's lack of knowledge? Which problem does it not solve?
2. If the source document is wrong, why is RAG's answer wrong?

## Discuss
If you turned your school's rules into a question-and-answer bot with RAG, what would the biggest risk be? How would you test the answers?

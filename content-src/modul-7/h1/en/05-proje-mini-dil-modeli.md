# Project: A mini language model
duration: 35

## Wonder
You wanted to see inside a language model: in this project you use a mini language model from start to finish with the pieces you have, and generate sentences. The sentences that come out may be strange, and that is good: explaining where the strangeness comes from is the real job of this project.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### Task
Generate a sentence with the **Next word and temperature** tool and analyse the sentence you generated.

### Steps
1. Choose the starting word (for example `robot`).
2. Set the model to a **two-word context**.
3. Generate at least eight words. Keep trying until a sentence end (a full stop) appears in the generated text; change the seed if needed.
4. Save three different sentences with three different seeds.

### Analysis (on paper or in a notebook)
- Which sentence is grammatically correct? Which one is meaningless?
- In the meaningless ones, which two words sitting next to each other are the model's "mistake"? Look at the corpus and check whether this pair is really there.
- How did the longer context (two words) change the results?

### How does it work?
- The model can only rearrange pieces of the sentences it has seen. It cannot produce a completely new idea.
- Most meaningless outputs come from the two-word context not being able to see "the whole sentence". Large models look at thousands of tokens at once.

### Test yourself
1. Can a sentence the model generates be an exact copy of a sentence in the corpus? Why?
2. What is one cost of making the context longer? (Hint: more data is needed.)

## Discuss
Share the funniest sentence from the project with the class, and why it came out. Would the reasons a real model builds a silly sentence be similar to the ones here, or different?

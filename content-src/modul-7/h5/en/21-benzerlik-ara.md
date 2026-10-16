# Compare texts with numbers
duration: 30

## Wonder
When you type `ses dalgası` (sound wave) into a search box, how does it find the most relevant document among a hundred? By turning the text into numbers and comparing the numbers. This idea is the foundation of modern search and RAG systems.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### What is a vector?
You can turn a text into a **list of numbers (a vector)** that holds one number for each term. This tool has two methods:
- **Word count:** how many times each term appears in the text.
- **TF-IDF:** multiplies the count by how rare the term is: terms that appear in every document (for example `sensör`, sensor) get little weight, and rare terms (for example `servo`) get a lot.

### Cosine similarity
It is the cosine of the angle between two vectors: 1 if they point the same way, 0 if they share no terms at all. It looks at **direction** more than length, so it compares long and short texts fairly.

### Open the tool
1. In the **Text similarity** tool, write a query of at least two words.
2. Set the method to TF-IDF.
3. Make the first result the `Ultrasonik sensör` (Ultrasonic sensor) document, with a similarity above 0.4. Hint: look at the words inside this document.
4. Watch how the bars change; the "Shared terms" line tells you why a match happened.

### How does it work?
- Terms are lowercased, common linking words such as `ve` (and) and `bir` (a/one) are thrown away, and the first five letters of each word are kept (very simple stemming; not a real Turkish analyser).
- The calculations are real. But this is a word vector, not a **meaning** vector. Real embedding models, which capture meaning, use different, learned vectors; the shared logic is still "close vector, close meaning".

### Test yourself
1. If two texts have no terms in common, what is their cosine similarity?
2. Why does TF-IDF give little weight to very common terms such as `ve` (and)?

## Discuss
Which words did you choose to push a document to the top with your own query? How could a real search engine find those words without knowing them?

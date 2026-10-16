# The vector that cannot catch synonyms
duration: 25

## Wonder
To a person, `mesafe` and `uzaklık` (both mean "distance") are the same thing. To a count-based vector they are two separate words. Seeing this limit explains why smarter embedding models are needed.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### The problem
Word count and TF-IDF only match **identical** terms. They cannot link words that are close in meaning but different.

### Open the tool
1. In the **Text similarity** tool, the `Ultrasonik sensör` (Ultrasonic sensor) document talks about `mesafe` (distance).
2. Add a form of the word `uzaklık` (distance) to your query (for example `uzaklığı nasıl bulur`, "how does it find the distance").
3. Use a query of at least three words.
4. See that there is no match with any document: the highest similarity is 0.

### How does it work?
- No term in the query appears in the documents, so the cosine is 0.
- Embedding models have learned to place texts that are close in meaning on similar vectors; that is why they can sometimes match texts with no words in common. The method in this tool does not do that, and we use it on purpose.
- Simple ways to soften this limit: adding synonyms to the query, better stemming, learned vectors.

### Try it
1. In the same query, write `mesafeyi` instead of `uzaklığı` and compare the result.
2. Set the method to "Word count": does the result change?

### Test yourself
1. Why can a count vector not find a synonym?
2. Which mistake does this limit cause in a search system? (Missing the relevant document, or bringing back the wrong document?)

## Discuss
In a school search box, students use the words `ödev` (homework), `görev` (task) and `proje` (project) in place of each other. What would you do to improve the search?

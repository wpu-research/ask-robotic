# Predict the next word
duration: 25

## Wonder
When you type "Hello, how are..." your phone keyboard suggests "...you". It does not get this from a memorised list, but from frequencies in texts it has seen before. A language model is a much more powerful version of the same idea. Now we are going to really count it from a small text.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### The n-gram model
There is a mini robot text (about forty short sentences). The tool **counts** the answer to the question "which words came after this word?" from this text. If it looks at the last word, it is called a bigram model; if it looks at the last two words, a trigram model. This is not a neural network, but the idea of "working out the probability of the next word from the context" is the same.

### Open the tool
1. In the **Next word and temperature** tool, type `robot engeli görür ve` (the robot sees the obstacle and) into the context. Choose the model that looks at two words.
2. Look at the probability bars: candidates such as `durur` (stops), `sağa` (right) and `geri` (back) appear with their probabilities.
3. Change the context to `robot sağa` (robot right): only one candidate may be left (probability 100 per cent). This is the goal: the probability of the most likely word is above 40%.
4. Use the **Generate one word** button to generate at least three words.

### How does it work?
- Counting: if `döner` (turns) always came after `robot sağa` in the corpus, the probability of `döner` is 1.
- If it meets a context it does not know, the model **backs off**: it looks at a shorter context, and if there is none, at the words that start sentences. The tool says which level it used.
- Generation is done with a seeded random choice based on the probabilities. The same seed gives the same result; when you change the seed, a different sentence comes out.

### Try it
1. Type a word that never appears in the corpus as the context. What does the model do?
2. Compare a one-word and a two-word context: which is more "confident"?
3. Generate with two different seeds in the same context.

### Test yourself
1. If, in the corpus, `durur` came 4 times and `sağa` came once after `görür ve`, what would the probability of `durur` be?
2. Why does a model that looks at a short context build less consistent sentences?

## Discuss
This model has seen only forty sentences. A real language model sees far more. In which direction does more data change the job of "predicting"? Which problems does it not solve?

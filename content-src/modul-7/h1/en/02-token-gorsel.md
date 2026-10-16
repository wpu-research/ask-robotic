# Tokens: how does a model see text?
duration: 20

## Wonder
You see a sentence as made of words. A language model sees it as made of pieces called "tokens". Is "Robot" one piece, or two pieces like "ro" and "bot"? The way text is split changes how quickly and how cheaply a model can look at something.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### What is a token?
A token is the smallest unit a model uses when it processes text. A token is sometimes a whole word, sometimes part of a word, sometimes a single letter or a punctuation mark. The model does not read text directly; first it splits it into tokens and turns each token into a number.

### Open the tool
1. In the **Tokens and BPE** tool, type a sentence of at least eight words into the "Text" box.
2. Move the **Number of merges** up from 0. At first every character is a separate token. As the merges increase, pieces that appear often become a single token.
3. When the token count is lower than the character count, you complete the second goal.
4. Switch the **Training corpus** between Turkish and English. The token count of the same text changes.

### How does it work?
- The tool uses **BPE** merges learned from a small Turkish text and a small English text. The calculation is real.
- The pieces learned from the Turkish corpus fit Turkish text better; they split English text into more pieces. The tokenisers of real models are trained on very large, multilingual texts, but the same effect can happen on a smaller scale: a language seen less in training takes up more tokens.
- The space at the start of a word is shown with "·".

### Try it
1. Compare the words `robot` and `robotlar` (robots). Do they share a token?
2. Write a very long word: how does the number of pieces change?
3. Write a Turkish sentence and an English sentence with the same meaning; which one takes up more tokens?

### Common mistakes
- Thinking "token = word". A token is often smaller or bigger than a word.
- Thinking this tool's tokeniser is a real model's. It is only a small example that shows the mechanism.

### Test yourself
1. Why does the token count matter? (Hint: a model can see only a certain number of tokens at once.)
2. When the number of merges is 0, what is the token count equal to?

## Discuss
In an agglutinative language like Turkish, words easily get long. How might this affect the cost of a model processing Turkish text?

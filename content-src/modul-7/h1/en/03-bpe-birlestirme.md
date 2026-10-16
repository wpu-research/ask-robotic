# BPE: how are the pieces learned?
duration: 25

## Wonder
How does the tokeniser know which pieces are "common"? Nobody told it one by one. It is enough to keep merging the two pieces that appear next to each other most often in a corpus: this compression rule makes word pieces appear on their own.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### The algorithm (BPE: byte pair encoding)
1. Split the text into characters.
2. Find the two pieces that appear next to each other most often in the corpus.
3. Merge that pair into a new piece and write it in the list as a "merge".
4. Repeat as many times as you want.

When you tokenise a new text, you apply the learned merges in the order they were learned. The slider in the tool chooses how many merges are applied.

### Open the tool
1. Open the **Tokens and BPE** tool. The starting text is ready.
2. Raise the merges to 40 or more and type words from the corpus, such as `robot sağa döner ve ileri gider` (the robot turns right and goes forward): the token count should drop to 60% of the character count.
3. Type a word that never appears in the corpus (for example `kalemlik`, pencil case). See that this word is split into at least three pieces.

### How does it work?
- Common words (`robot`, `ve` = and) become a single token; rare words break into small pieces. This way the model can represent even a word it has never seen, at least through its pieces.
- In real systems the process starts at byte level instead of character level, so no text is ever "unknown". Our tool starts with characters; the idea is the same.
- Because the corpus is small, the merges follow the taste of that small corpus. In large corpora the pieces are much more general.

### Try it
1. Raise the slider slowly and watch which pieces merge, and in which order.
2. Switch the corpus to English and type a Turkish sentence: what happens?

### Test yourself
1. If the pair "ab" appears 7 times in a corpus and the pair "bc" appears 5 times, which will the first merge be?
2. Why can a word that has never been seen still be split into tokens?

## Discuss
If you wrote the tokenising vocabulary by hand, which words would you make into a single piece? What does BPE do differently from your choice?

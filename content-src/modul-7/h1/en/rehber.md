### Week goals
By the end of this week the learner:
1. Can tell apart the concepts of artificial intelligence, machine learning and language model; can say that a language model's basic job is to predict the next piece.
2. Explains that a text is split into tokens and turned into numbers; shows with an example why a token and a word are not the same.
3. Can apply BPE's "merge the most common pair" rule by hand on a list of words.
4. Works out the probability of the next word for a context by counting in a corpus (count / total), and compares the bigram and trigram models.
5. Compares the mini language model's output with the corpus and finds the source of the strangeness (copy, recombination, context limit).
6. Tells apart a "real calculation" step on the portal from a step labelled "simulation".

### The week's plan
The week has five lessons; lessons last 20-35 minutes. The plan below is for one lesson a day. The first lesson has no activity tool, only reading and discussion.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Artificial intelligence, machine learning, language models | ~20 min | Read the explainer, write the three concepts in your own words, do the mini quiz, discuss the question "does it understand, or does it predict?". |
| 2 | Tokens: how does a model see text? | ~20 min | Open the tool, move the number of merges, compare the Turkish and English corpora, do the mini quiz. |
| 3 | BPE: how are the pieces learned? | ~25 min | Watch the merge order, try an unseen word like `kalemlik`, do the pair-counting exercise by hand. |
| 4 | Predict the next word | ~25 min | Change the context, compare the bigram and trigram models, work out a probability by hand, generate words with different seeds. |
| 5 | Project: A mini language model | ~35 min | Generate three sentences with three seeds, compare each one with the corpus and write down its source. |

### Prerequisite check
No special prior knowledge is needed this week. Before you start, check these:
- Can the learner do ratio and percentage sums comfortably (2/10 = 20%)?
- Can they read short pieces of code (loop, array, if)? They do not need to write it; reading is enough.
- Does the AI Workshop open in the browser?

### Concept map
- **Framework:** artificial intelligence → machine learning → language model → predicting the next piece
- **How text is seen:** token → token ID (number) → number of merges → corpus and language
- **Learning pieces:** BPE → most common pair → merge list and its order → unseen word
- **Prediction:** counting → probability = count / total → bigram and trigram models → backing off → seed
- **Analysis:** copy, recombination, context limit → the cost of context (data)
- **Honesty:** real calculation versus a step labelled simulation

### Common mistakes
- **Mixing up tokens and words.** A token is often smaller than a word; with zero merges the start-of-word mark counts as a token too.
- **Finding the token count by counting words.** The real count can only be found by running the tokeniser.
- **Counting BPE pairs only by the number of words.** Both how many times the word appears and how many pairs it contains go into the count.
- **Not skipping the second piece after a merge.** If `i++` is forgotten in the code, the same letter is written twice.
- **Taking the wrong bottom of the probability fraction.** The bottom is the total of all candidates, not just the word's own count.
- **Thinking the trigram model is always better.** If the context is not in the corpus, the model backs off.
- **Assuming the model "understands".** The mini model only repeats the pattern it counted.
- **Thinking an output labelled "simulation" is a real model's answer.**

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Reread the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Split the text `robot ileri` into tokens by hand with 0 merges, then check the result in the tool.
4. Make up a small list of words and find the most common pair of letters in it; write the first merge.
5. Answer this question in your own words: "Why do we say a language model 'predicts' instead of saying it 'understands'?"

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (A mini language model)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Generation | Tool settings missing, no sentence end | At least 8 words with a two-word context, and three sentences with three different seeds | Has written the seeds, the setting and the result so that someone else can reproduce them |
| Analysis | Just calls the sentences "silly" or "good" | Has written the source of the strangeness or correctness for each sentence (copy, recombination, context limit) | Has looked up the suspicious pairs in the corpus and shown it with evidence |
| Concepts | Mixes up the terms | Explains context, probability and backing off in their own words | Explains the benefit and the cost of a longer context with an example |
| Honesty | Has presented the model as "understanding" | Says the model is a prediction table | Explains the similarity and the difference between the mini model and a large model, knowing the limits |
| Explanation | Cannot explain what they did | Explains the steps in order | Explains how they corrected one of their wrong predictions |

### Note for parents and teachers
- **Aim.** This week the aim is to take AI out of being "magic" and break it into parts that can be counted. The learner sees in their own tool that a language model chooses the next piece by probability.
- **Honesty.** The tools on the portal run in the browser and their calculations are real. No real chat model is run, and no account or key is needed. Steps that stand in for a large model are labelled "simulation"; noticing this difference is one of the learner's outcomes for the week.
- **How can you help?** Instead of giving the answer, ask: "Where did you get this number?", "Is this pair really in the corpus?", "What happens if you try again with the same seed?"
- **Time.** Spacing the lessons out makes learning last longer. A short review between lessons is enough.
- **Safety and privacy.** No personal information needs to be entered this week. If real AI services are used later, details such as name, address and phone number are not written.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent was given).

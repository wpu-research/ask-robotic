### Week goals
By the end of this week the student:
1. Can explain that a text is turned into a vector with word count and TF-IDF; can work out the cosine similarity of two small vectors by hand.
2. Can say why a count vector cannot link synonyms, and which idea embedding models are based on.
3. Can list the five steps of RAG (chunk, vectorize, retrieve, insert, synthesise) in order; can work out the number of chunks from the size and overlap.
4. Can explain top-K retrieval, the prompt template and the purpose of the "I don't know" instruction.
5. Can set up their own RAG pipeline and judge retrieval accuracy and the answer's faithfulness to the source separately; knows that the last step in the workshop is a template (simulation).

### Plan for the week
The week has five lessons; each lesson takes about 25-40 minutes. The plan is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Compare texts with numbers | ~30 min | Read the explainer, open the Text similarity tool in the AI Workshop, try a query with TF-IDF, do the mini quiz. |
| 2 | The vector that cannot catch synonyms | ~25 min | Find a query that gives zero similarity, compare it with `mesafeyi`, write the limit in your own words. |
| 3 | Chunking: how big? | ~30 min | Change the chunk size and overlap in the RAG pipeline tool, work out the number of chunks by hand and compare with the tool. |
| 4 | Retrieval: find the right chunk | ~30 min | Compare vague and clear questions, change K, note that the template answer is a quote. |
| 5 | Project: your own RAG pipeline | ~40 min | Choose the settings, ask three questions, try a question that is not in the context, write the report. |

### Prerequisite check
- Do they remember splitting text into pieces (tokens, word count)? (Lessons 2 and 4)
- Do they know how to put context into a prompt, and that the context window is limited? (Lessons 7 and 9)
- Can they work out an accuracy ratio (number correct divided by the total)? (Lessons 16-20)
- Are they comfortable with multiplication, addition and square roots? (For the cosine calculation)

### Concept map
- **Representation:** text → terms → vector (count, TF-IDF) → cosine similarity → limit: synonyms → embedding model
- **Pipeline:** document → chunk (size, overlap) → vector → retrieval (top-K) → context → prompt template → synthesis
- **Measurement:** retrieval accuracy · faithfulness · "not in the document" case
- **Honesty:** the first four steps are real calculations; the synthesis step is a template (simulation); if the source is wrong, the answer is wrong too

### Common mistakes
- **Forgetting the denominator in the cosine calculation.** Taking only the dot product pushes long documents to the top.
- **Thinking a count vector is meaning.** `Mesafe` and `uzaklık` (both "distance") are two separate terms; the similarity comes out 0.
- **Working out the number of chunks as document / size.** With overlap, the step is size − overlap.
- **Choosing an overlap equal to or larger than the size.** The window does not move forward.
- **Writing a vague question.** A single word such as `Yardım` ("Help") is not enough to bring back the right chunk.
- **Thinking everything gets better when K is bigger.** The context gets longer and unrelated text gets in; a chunk with no shared term does not come back anyway.
- **Thinking the template answer is a model's answer.** In the workshop, synthesis is a labelled template that quotes a sentence from the context.
- **Mixing up retrieval and faithfulness errors.** If the right chunk came back, the problem is not in retrieval.
- **Trusting the source document blindly.** RAG also brings back the mistakes in the document.

### End-of-week review
1. Read each lesson's concept cards once more and rewrite the "common mistake" lines in your own words.
2. Make your own count vectors from two sentences and work out their cosine similarity by hand; compare the result with the workshop.
3. Write a five-question eval set: two answered in one chunk, one spread over two chunks, one not in the document, and one vague question. Try the pipeline on each and note the retrieval accuracy.
4. Answer this question in your own words: "What do you gain, and what do you lose, by making the chunk size smaller?"
5. Imagine a school rules bot: write one example each of a retrieval error and a faithfulness error.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Goal: at least 4 correct in every lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Your own RAG pipeline)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Settings | Goals not met, or settings chosen at random | Size 15-60, overlap > 0, K 1-3; the template answer contains `iki proje` ("two projects") | Explains the reason for each setting in terms of overlap and context length |
| Questions | Stops at a single question | Asked the guide three different questions | Compares a clear and a vague question and interprets the difference |
| Error analysis | Cannot find the question that caused trouble | Says on which question the pipeline struggled | Links the mistake to the retrieval or the synthesis step |
| Question not in the document | Did not try | Tried and describes the result | Explains that a real model should say "I don't know", and why |
| Honesty | Thinks the template answer is a model's answer | Knows the template is a simulation | Separates retrieval accuracy from faithfulness and suggests two improvements |

### Note for parents and teachers
- **Goal.** This week is about opening up a search system and a RAG pipeline and seeing what they do. The vector and retrieval calculations in the workshop are real; but these are simple word vectors, not real embedding models.
- **Simulation.** There is no model in the last step of the pipeline. The template quotes the best-matching sentence in the context, and the interface labels it. Do not tell the student "this is how the AI answered".
- **How to help.** When the student is stuck, ask: "Which words do the question and the chunk share?", "Which chunk is the answer in, and was that chunk retrieved?", "Is the problem in retrieval or in synthesis?"
- **Time.** Spacing the lessons out helps learning stick. The cosine calculation may feel hard at first; working by hand with small vectors is enough.
- **Privacy.** The workshop runs locally in the browser; no account, key or external service is needed. If school documents are uploaded to a real RAG system, the privacy of personal information must be considered separately.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent was given).

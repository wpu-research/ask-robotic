# Structured output: JSON
duration: 25

## Wonder
A program cannot read the sentence "this comment seems to be positive"; but it can read {"duygu": "olumlu"} ("sentiment": "positive"). If you want to make the model part of a program, its output needs to be orderly.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### What is JSON?
JSON is an orderly data format made of key-value pairs: `{"duygu": "olumlu", "konu": "robot dersi"}` (sentiment: positive, topic: robot lesson). Almost every programming language can read it.

### Open the tool
1. In the **Prompt checker** tool, the task is: a prompt that extracts the sentiment and topic of a comment as JSON.
2. Ask for JSON as the format and write the key names clearly (for example `duygu` and `konu`, sentiment and topic).
3. Show an example output.
4. Raise the score to at least 70.

### How does it work?
- Saying "give only JSON" and showing an example usually works, but it is not a guarantee. The model may sometimes add an explanation in front of the JSON or forget a quotation mark.
- That is why apps **validate** the output: is it valid JSON, are the expected keys there? If validation fails, the request is tried again or an error is given. The checker in the tool looks at the format phrase in the prompt; the code that validates the output (for example with `JSON.parse`) is a separate step.
- Some services offer features that force the output to fit a schema; but the logic is the same: don't trust the model, validate.

### Try it
1. Add a third key to the same prompt (for example a suggestion).
2. Add the constraint "write nothing except JSON" and look at the score.

### Common mistakes
- The key names in the example output being different from the names in the instructions.
- Skipping validation and assuming the output will always come in the right format.

### Test yourself
1. Why should you validate the JSON the model produces separately?
2. In which situations is free text preferred, and in which is JSON?

## Discuss
Does it make sense to give a robot its commands with JSON produced by a model? What checks would you put in the validation step?

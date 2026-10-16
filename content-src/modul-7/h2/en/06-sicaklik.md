# Temperature: cautious or adventurous?
duration: 25

## Wonder
You ask an AI assistant the same question twice and get two different answers. Why? Because at every step the model ranks words by probability and picks one. A setting decides how "bold" this choice will be: temperature.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. No external service, account or key is needed. As the **Goals** list on the right turns green, you can see your progress.

### What does temperature do?
The model works out a score for each candidate. These scores are turned into probabilities by an operation called **softmax**. Temperature is applied before softmax, by dividing the scores:
- **Low temperature (close to 0):** the most likely candidate becomes even more dominant. The output is consistent and repeatable, but it can be boring.
- **High temperature:** the probabilities flatten. Rare candidates get more of a chance; the output becomes more varied but can wander.

An example by hand: there are two candidates with counts 3 and 1. At temperature 1 the probabilities are 0.75 and 0.25. When the temperature drops, 0.75 grows; when it rises, it moves towards 0.5.

### Open the tool
1. In the **Next word and temperature** tool, set the context to `robot`.
2. Lower the temperature below 0.3 and look at the bars: the first candidate dominates.
3. Raise the temperature above 1.8: the bars get close to equal. The uncertainty (entropy) rises.
4. Generate at least four words.

### How does it work?
- The bars are really calculated with softmax(log(count) / temperature).
- At temperature 0 the most likely word is always chosen. In real services this setting may be called something like "creativity"; it is really how sharp the probability distribution is.
- A low temperature is not a guarantee of "correctness": the model can also say something wrong consistently.

### Try it
1. Generate the same context at temperature 0 with three different seeds. Are the results the same?
2. Raise the temperature to 3 and watch the generation.

### Test yourself
1. Which temperature would you choose for a data extraction job, and which for a poem?
2. If the temperature is high, is the most likely word never chosen?

## Discuss
Why could a high temperature be dangerous in a robot's command interpreter? In which jobs do you want variety, and in which do you not?

# Errors, limits and stopping
duration: 30

## Wonder
An agent that runs for ever is both expensive and dangerous. A good agent knows when to stop: when it reaches the result, when it gets an error, or when it hits a limit.

## Activity
This activity runs entirely in the **AI Workshop**, in your browser. You need no external service, account or key. You can see your progress as the **Goals** list on the right turns green.

### Limits
- **Step limit:** the loop takes at most a certain number of steps. Here it is 30.
- **Error handling:** a failed tool call comes back to the agent as an observation.
- **Stopping:** when the job is done, the agent closes the loop with `bitir(...)` ("finish").
- **Irreversible actions:** outcomes such as hitting the wall must be prevented from the start.

### Open the tool
In the **Agent loop** tool the world is: a virtual robot corridor; the wall is 100 cm ahead.
1. Move the robot forward at least 60 cm without hitting the wall: `tekrar 3: ileri(20)` (`tekrar` means "repeat", `ileri` means "forward").
2. Stop the robot with `dur()` ("stop").
3. Close the agent loop with `bitir(tamam)` (`tamam` means "done").
4. The robot map works with real calculations: `ileri(n)` returns the remaining distance; if you reach the wall, the robot CRASHES and the agent stops.

### How does it work?
- `tekrar N: ...` repeats a line N times. If you write `tekrar 99:`, the step limit kicks in; this is a safety net.
- A crash error is the result of the agent's "wrong plan": when writing the plan, you should have worked out the total movement (3 × 20 = 60 < 100).

### Try it
1. Write `tekrar 6: ileri(20)` and see the crash.
2. Write `tekrar 99: hesapla(1)`: see the step limit error.

### Test yourself
1. What is the risk of an agent with no step limit?
2. When a tool gives an error, what is the agent's safest behaviour?

## Discuss
What would a "step limit" or an "emergency stop" look like on a real robot? Is it safer to provide them in software or in hardware?

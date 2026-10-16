# Keypad 4x4
slug: keypad
category: Input
summary: A matrix keypad that reads 16 keys with 8 pins. The rows and columns connect directly to Uno pins.

## Pins
- R1: First row. Connects to an input pin on the Uno (D9 on this site).
- R2: Second row (D8 on this site).
- R3: Third row (D7 on this site).
- R4: Fourth row (D6 on this site).
- C1: First column (D5 on this site).
- C2: Second column (D4 on this site).
- C3: Third column (D3 on this site).
- C4: Fourth column (D2 on this site).

## How it works
On a keypad, each key connects one row to one column when it is pressed. Instead of 16 wires for 16 keys, 4 rows and 4 columns, that is 8 wires, are enough. The Arduino keeps the rows waiting HIGH with `INPUT_PULLUP` and sets the columns LOW one at a time. While the pressed key's column is LOW, that key's row also reads LOW; the row and column that cross give away the key.

The `Keypad` library does this scanning and the debouncing. `getKey()` returns a newly pressed key once as a `char`; if nothing is pressed, it returns `'\0'`.

**Advanced:** In a matrix without diodes, if three keys are pressed at the same time a "ghost" key can be detected, because the current returns through the wrong path. That is why single-key jobs, such as entering a password, are the safest use of a matrix. The lab part counts only one key as pressed at a time.

## Wiring in the lab
| From | To |
|---|---|
| Keypad **R1, R2, R3, R4** | Uno **D9, D8, D7, D6** |
| Keypad **C1, C2, C3, C4** | Uno **D5, D4, D3, D2** |

You pick a key from the **Basılı tuş** (Pressed key) list in the right panel; the selected key counts as pressed, and choosing **Yok** (None) releases it. Leaving a key selected in the list means holding it down. The key map, row by row, is `1 2 3 A`, `4 5 6 B`, `7 8 9 C`, `* 0 # D`.

## Typical values
- Number of keys | 16 | 4 rows × 4 columns
- Pins needed | 8 | 4 rows + 4 columns
- Row pin mode | INPUT_PULLUP | The library sets this itself
- Row while a key is pressed | LOW | While its column is driven LOW
- `getKey()` when idle | '\0' | If nothing is pressed

## Common mistakes
- **Swapping the row and column pins in code.** Keys give the wrong character or are not detected at all. Select each key in turn and check what the serial monitor prints.
- **Using the `getKey()` value without checking it.** It returns `'\0'` when nothing is pressed; filter with `if (tus)`.
- **Giving the keypad pins to other parts too.** D2-D9 belong to the keypad this week; parts such as a servo must be moved to another pin.
- **Waiting with `delay()`.** Keys pressed while waiting can be missed; use `millis()`.
- **Forgetting to release the key.** In the lab, set the list back to **Yok** after each press.

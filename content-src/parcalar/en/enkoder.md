# Rotary encoder
slug: enkoder
category: Input
summary: A rotary knob that turns endlessly and reports steps and direction with two signals (CLK and DT). It also has a push button.

## Pins
- CLK: First signal (A). Falls once per click; connected to an interrupt pin (D2).
- DT: Second signal (B). Shifted by a quarter period (90 degrees) from CLK; it gives the direction.
- SW: Button output. Connected to GND when pressed.
- VCC: Supply (5V) for the module's pull-up resistors. Even if you do not connect it, INPUT_PULLUP is enough.
- GND: Ground. Must always be connected.

## How it works
A **rotary encoder** is an endlessly turning knob with two contacts inside. The contacts do not change at the same time; one changes a little before the other. That is why there is a 90 degree difference between CLK and DT (quadrature). Clockwise, the (CLK, DT) states change in the order 11, 01, 00, 10, 11; counter-clockwise, 11, 10, 00, 01, 11.

Direction rule: look at DT when CLK falls from 1 to 0. If DT is 1 it is turning one way, if it is 0 the other way. That is why CLK is connected to an interrupt pin and DT is read inside the ISR.

**Advanced:** Real contacts bounce; one click can produce 2-3 edges. The fix is to ignore an edge if less than a certain time (for example 2000 µs) has passed since the previous one. The lab model does not bounce and applies one state transition per simulated millisecond; one click is 4 transitions, so it turns at most 250 clicks/s.

## Wiring in the lab
| From | To |
|---|---|
| Encoder **CLK** | Uno **D2** (`INPUT_PULLUP`, interrupt pin) |
| Encoder **DT** | Uno **D3** (`INPUT_PULLUP`) |
| Encoder **SW** | Uno **D4** (`INPUT_PULLUP`) |
| Encoder **VCC** | Uno **5V** (optional) |
| Encoder **GND** | Uno **GND** |

When the **Konum (tık)** (Position, clicks) value in the properties panel changes, the encoder is turned by that many clicks (clockwise is positive). **Düğme basılı** (Button pressed) presses the button.

## Typical values
- One click | 4 state transitions | 11, 01, 00, 10, 11
- Duration of one transition | 1 ms | Lab model
- Fastest rotation | 250 clicks/s | 4 ms per click
- Pull-up resistor | 10 kΩ | On the module board, to VCC
- Recommended bounce threshold | 2000 µs | Must be less than 4 ms

## Common mistakes
- **Connecting CLK to a pin that is not an interrupt pin.** On the Uno only D2 and D3 support interrupts.
- **Not making the sayac variable volatile.** loop() may not see the change.
- **Using Serial.print or delay inside the ISR.** An ISR must be short.
- **Not adding a bounce filter, or making the threshold too large.** In the first case the counter skips extra steps; in the second, clicks are lost when you turn quickly.
- **Mixing up CLK and DT.** The direction comes out reversed.

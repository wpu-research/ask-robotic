# Relay module
slug: relay
category: Power
summary: A switch operated by an electromagnet. It opens and closes a circuit that is electrically separate from the Arduino.

## Pins
- VCC: Module power. Connects to 5V.
- GND: Ground. Connects to GND.
- IN: Signal input. Connects to an Uno pin.
- COM: Common terminal of the contact side.
- NO: Normally open terminal. Connected to COM when the relay is energised (pulled in).
- NC: Normally closed terminal. Connected to COM when the relay is not energised.

## How it works
When current flows through the relay coil, an electromagnet pulls a contact. The contact side is separate from the coil side and behaves only like a switch (a dry contact). The module already has the transistor that drives the coil and the flyback diode built in.

Most modules are **active-LOW**: when the IN pin is LOW the relay pulls in, and when it is HIGH the relay releases. In the lab you choose this with the **Tetik** (Trigger) property.

A relay is a mechanical part; it is not used for fast PWM. To avoid chattering near a threshold, two-threshold control (hysteresis) is used.

**Advanced:** A contact rating (such as "250 V") is not a certificate of safe use. Working with mains voltage (220 V) can kill you and is a job only for a trained professional.

## Wiring in the lab
| From | To |
|---|---|
| Relay **VCC** | Uno **5V** |
| Relay **GND** | Uno **GND** |
| Relay **IN** | Uno **D7** |
| Relay **COM** | Uno **5V** |
| Relay **NO** | Resistor **1** (load) |

In the properties panel, set Tetik (Trigger) to "LOW ile çeker" (pulls in on LOW). If VCC is below 4 V or GND is missing, the relay does not pull in and a warning appears. The lab only offers low-voltage 5 V circuits.

## Typical values
- Trigger | pulls in on LOW | The lessons' assumption
- Supply | 5 V | Does not pull in below 4 V
- Contact resistance | 0.1 Ω | Lab model
- Example load | ≈ 9 mA | 330 Ω and a red LED
- Safe limit | 5 V only | Mains voltage is a job for professionals

## Common mistakes
- **Experimenting with mains voltage.** It can kill you; it is never needed on this portal.
- **Getting the active-LOW logic backwards.** The relay may stay pulled in at startup; write HIGH before `pinMode`.
- **Connecting a bare relay to a pin.** The coil current is too high and the voltage spike damages the pin.
- **Mixing up COM, NO and NC.** The load works the opposite way.
- **Not connecting VCC or GND.** The relay does not pull in.

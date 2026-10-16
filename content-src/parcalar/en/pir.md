# PIR motion sensor
slug: pir
category: Sensor
summary: A sensor that detects changes in infrared radiation and sets its OUT output HIGH while there is motion; it needs a warm-up time at power-up.

## Pins
- VCC: Power. Connects to 5V in the lab.
- OUT: Digital output. HIGH while there is motion, LOW when there is none.
- GND: Ground. Connects to the Uno's GND.

## How it works
A PIR (passive infrared) sensor detects changes in the infrared (heat) radiation around it. When a warm object (a person, an animal) moves in its field of view, the radiation changes and the OUT output goes HIGH. An object standing still, or a slowly changing room temperature, does not create this change. "Passive" means the sensor does not send out any light itself; it only listens.

After the motion ends, the output stays HIGH for a while. In the lab this time is 3 seconds. At power-up the sensor waits through a warm-up time; during this, the output may jump around because of noise. In the lab the warm-up is 2 seconds, and the **Hareket** (Motion) box is ignored during it.

**Advanced:** On real modules the warm-up time is usually around half a minute to a minute and depends on the module; most have adjustment screws for sensitivity and for how long the output stays HIGH. Which screw does what depends on the module, so check the datasheet. In applications such as an alarm, you ignore the PIR for this long after power-up (lesson 75).

## Wiring in the lab
| From | To |
|---|---|
| PIR **VCC** | Uno **5V** |
| PIR **GND** | Uno **GND** |
| PIR **OUT** | Uno **D2** |

In the code you write `pinMode(2, INPUT)`; because OUT drives its own voltage, `INPUT_PULLUP` is not needed. You give motion with the **Hareket** (Motion) box in the properties panel, and you can change it while running.

## Typical values
- Lab warm-up | 2 s | On a real module usually half a minute to 1 minute, depending on the module
- Stays HIGH after motion | 3 s | Lab model
- Supply threshold for operation | 4 V | Below this the module counts as unpowered
- Recommended wiring | OUT to D2 | The standard in this site's lessons

## Common mistakes
- **Not allowing for the warm-up time.** At power-up the output jumps around because of noise, and the room is wrongly taken as "occupied".
- **Using `INPUT_PULLUP`.** OUT drives its own voltage; plain `INPUT` is enough.
- **Expecting the output to go LOW as soon as motion stops.** The output stays HIGH for a while.
- **Expecting it to detect a person standing still.** A PIR detects motion (a change in radiation), not presence.
- **Not connecting GND.** The circuit is not closed and the output is meaningless.

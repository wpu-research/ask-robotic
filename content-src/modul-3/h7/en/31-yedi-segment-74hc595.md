# The 7-segment display and the 74HC595
duration: 25

## Wonder
How are the digits on a calculator drawn? In fact, some of seven small LED bars are lit and the rest are off. But using seven pins for seven bars is very costly. Is it possible for a board to control eight outputs at once with only three pins?

## Activity
### Circuit
A 7-segment display is made of seven bars named "a" to "g", plus a dot (dp) LED. In this lesson we use a **common cathode** display (the negative legs of all the LEDs are joined); in the lab, the part's **Common pin** property is "Common cathode" by default. Instead of connecting the seven bars to pins one by one, we will use a **74HC595 shift register**. The Uno sends it the bits one after another, and the chip changes all eight outputs at once.

Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. Parts you need: a 74HC595 (`sr595`), a 7-segment display (`sevenseg`) and 7 resistors.

| Part | Connection |
|---|---|
| 74HC595 VCC and SRCLR | 5V |
| 74HC595 GND and OE | GND |
| 74HC595 SER (data) | **D4** |
| 74HC595 SRCLK (clock) | **D6** |
| 74HC595 RCLK (latch) | **D5** |
| 74HC595 QA, QB, QC, QD, QE, QF, QG | Each through a 330 Ω resistor to the display's a, b, c, d, e, f, g pins in order |
| 74HC595 QH (optional) | Through a 330 Ω resistor to the display's dp pin (used in the Try it section) |
| 7-segment COM | GND |

Set the resistor value by selecting the resistor and using the properties in the right panel (the default 330 Ω is fine). Each bar needs its own resistor. On the real chip these pins are numbered 16 for VCC, 8 for GND, 14 for SER, 11 for SRCLK, 12 for RCLK, 13 for OE and 10 for SRCLR; but in the lab you choose the pins by name.

The lab also models two important pins of the 74HC595: if **OE** (output enable) is connected to 5V or left unconnected, the outputs are off; if **SRCLR** (shift register clear) is connected to GND or left unconnected, the register is cleared all the time. If you leave either of them unconnected, you see a "floating input" warning.

### Program
Each digit is a **byte** (8 bits). Bit 0 controls the "a" bar, bit 1 the "b" bar, ... bit 6 the "g" bar, and bit 7 the dot LED (bit 0 goes to QA, bit 7 to QH). For example, for the digit 1 only b and c light up: `0b00000110`, that is 0x06.

```cpp
// sketch: yedi_segment_sayac
const int VERI = 4;    // DS
const int MANDAL = 5;  // ST_CP
const int SAAT = 6;    // SH_CP

// 0'dan 9'a rakam desenleri (bit 0 = a ... bit 6 = g)
const byte RAKAM[10] = {
  0x3F, 0x06, 0x5B, 0x4F, 0x66,
  0x6D, 0x7D, 0x07, 0x7F, 0x6F
};

void yaz(byte desen) {
  digitalWrite(MANDAL, LOW);                 // mandalı aç: çıkışlar sabit kalsın
  shiftOut(VERI, SAAT, MSBFIRST, desen);     // 8 biti sırayla kaydır
  digitalWrite(MANDAL, HIGH);                // mandalı kapat: çıkışlar bir anda güncellenir
}

void setup() {
  pinMode(VERI, OUTPUT);
  pinMode(MANDAL, OUTPUT);
  pinMode(SAAT, OUTPUT);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    yaz(RAKAM[i]);
    delay(1000);
  }
}
```

### How does it work?
1. `shiftOut` sends a byte bit by bit. For each bit it first sets the **data** pin HIGH or LOW, then gives the **clock** pin a pulse. The 74HC595 looks at the data pin on the rising edge of the clock and shifts the bit into its internal register.
2. `MSBFIRST` means "most significant bit first". If the byte is 0x06 (0b00000110), the bits go in the order 0, 0, 0, 0, 0, 1, 1, 0.
3. After eight clock pulses the byte is inside the chip, but the outputs have not changed yet. When the **latch** (ST_CP) pin goes from LOW to HIGH, the chip copies the byte inside it to the outputs. This way the display changes in one go instead of sliding.
4. The chip can be chained: if you connect two 74HC595s one after the other, you control 16 outputs with three pins by calling `shiftOut` twice.
5. The sums: driving the display directly would need 8 pins. With the 74HC595, 3 pins are enough; each time you add a chip to the chain, the pin count still stays at 3.

You can connect the same chip to 8 LEDs (each with a resistor) instead of a display. The program below moves a single LED from left to right. The expression `1 << i` sets only bit number i to 1.

```cpp
// sketch: led_seridi
const int VERI = 4;
const int MANDAL = 5;
const int SAAT = 6;

void setup() {
  pinMode(VERI, OUTPUT);
  pinMode(MANDAL, OUTPUT);
  pinMode(SAAT, OUTPUT);
}

void loop() {
  for (int i = 0; i < 8; i++) {
    digitalWrite(MANDAL, LOW);
    shiftOut(VERI, SAAT, MSBFIRST, 1 << i);   // yalnızca i. LED yanar
    digitalWrite(MANDAL, HIGH);
    delay(200);
  }
}
```

### Try it
- Run the program with ▶ and watch the display count from 0 to 9. While it runs, select a resistor: **Virtual meter** shows the current through that bar (about 8 mA). Change the resistor to 1 kΩ and see how the bar becomes dimmer.
- Spoil one of the patterns in the `RAKAM` (digit) array by hand and watch what changes on the display (for example, write 0x7F instead of 0x3F).
- To light the dot LED, add 0x80 to the byte: `yaz(RAKAM[i] | 0x80)`. For this, QH must be connected to dp. Does the dot light up next to each digit?
- Select the display and set its **Common pin** property to "Common anode". Connect COM to 5V instead of GND and send the inverted pattern (`~RAKAM[i]`).
- Write a program that counts backwards: from 9 to 0.

### Common mistakes
- Never using the latch pin: the bits shift into the chip, but the outputs never change and the display stays blank.
- Using a common anode display as if it were common cathode: the digits look inverted (the lit bars are off, the off bars are lit). On a common anode display you connect COM to 5V and the pattern byte is inverted: `~RAKAM[i]`.
- Connecting without resistors: the lab gives the warning "the LED has no series resistor" and the bar burns out (the internal resistance of a 74HC595 output is only about 50 Ω). On real bars, too much current damages the bar and the chip.
- Connecting the 74HC595's OE and SRCLR pins wrongly or leaving them unconnected: the chip gives no output or keeps clearing the register.
- Forgetting the power (VCC and GND) wires: the lab gives a "not powered" warning and there is no output.

## Discuss
Controlling eight LEDs with three pins is great, but it also has a cost. What do you think that cost could be? (Hint: how many bytes do you have to send to change the state of one LED?)

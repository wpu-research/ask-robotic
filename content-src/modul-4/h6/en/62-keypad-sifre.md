# 4x4 keypad: entering a password
duration: 30

## Wonder
The keypad on a block of flats' front door has 16 keys, but it does not have 16 wires. Even if the Arduino had 16 pins, spending all of them on one keypad would be very costly. So how do we read 16 keys with only 8 wires? What is more, to write a program that opens something when you enter the right password and warns you when you enter the wrong one, you need to catch the "moment of the press" correctly.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| 4x4 keypad | Rows R1..R4 → **D9, D8, D7, D6**; columns C1..C4 → **D5, D4, D3, D2** |
| LED (green) | **D13** → resistor (330 Ω) 1; resistor 2 → LED **A**; LED **K** → **GND** |
| LED (red) | **D12** → resistor (330 Ω) 1; resistor 2 → LED **A**; LED **K** → **GND** |

This week all of pins D2-D9 go to the keypad. D2 and D3, which you used for buttons in earlier weeks, and D6, which you used for the servo, are not free this week; that is why in this week's project the servo will be moved to another pin.

In the lab, when you select the keypad, you pick a key from the **Pressed key** list in the right panel: the key you pick counts as pressed; if you choose **None**, it is released. The keypad can only hold one key pressed at a time. On the 8-wire ribbon of a real membrane keypad, which wire is a row and which is a column depends on the maker; on the lab part the pins are labelled R1-R4 and C1-C4.

### How is a matrix read?
Instead of reading 16 keys with 16 wires, we arrange the keys in a grid of 4 rows × 4 columns. When a key is pressed, it joins one row to one column. Reading is done like this:

1. The row pins are inputs and wait at HIGH with `INPUT_PULLUP`.
2. The Arduino makes the columns LOW in turn (only one at a time).
3. When the column of a pressed key is LOW, that key's row also reads LOW.
4. Whichever row reads LOW while whichever column is LOW, the key is the one where that row and column cross.

With 8 wires, 4 × 4 = 16 keys are read. The `Keypad` library does this scanning and the debouncing for you. On a real keypad, if several keys are pressed at the same time, some keys in the matrix may be detected wrongly (a known limit of matrices without diodes); when entering a password the keys are pressed one by one, so this is not a problem. In the lab you can only pick one key at a time anyway.

### Program 1: Read a key
When we set up the `Keypad` object, we give it the letter map of the keys and the row and column pins. `makeKeymap` turns the two-dimensional array into the form the library wants.

```cpp
// sketch: keypad_tus
#include <Keypad.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};

Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

void setup() {
  Serial.begin(9600);
}

void loop() {
  char tus = tusTakimi.getKey();      // basılan tuş; basılmadıysa '\0'
  if (tus) {
    Serial.print("Tus: ");
    Serial.println(tus);
  }
}
```

`getKey()` returns the key **once** for each press; even if you hold the key down, it does not repeat (in the lab, leaving a key selected in the list means holding it down). If there is no press, it returns `0` (`'\0'`), which counts as "false" in `if (tus)`.

### Program 2: Entering a PIN
Now let's write the first half of a door lock: a 4-digit PIN. The rules:

- Digit keys are added to the PIN (at most 4 digits).
- `*` deletes the last digit entered.
- `#` confirms the entry.
- Wrong entries are counted; after 3 wrong ones, a warning is given.

We do not show the PIN openly on the Serial monitor; we print a `*` for each digit.

```cpp
// sketch: keypad_sifre
#include <Keypad.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

const int YESIL = 13;
const int KIRMIZI = 12;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long LED_SURESI = 1000;   // ms

const char DOGRU_PIN[] = "1234";

char girilen[PIN_UZUNLUK + 1];           // +1: dizinin sonundaki '\0'
int hane = 0;
int yanlisSayisi = 0;
unsigned long ledBitis = 0;

void girisiTemizle() {
  hane = 0;
  girilen[0] = '\0';
}

void yildizYaz() {
  Serial.print("Girilen: ");
  for (int i = 0; i < hane; i++) Serial.print('*');
  Serial.println();
}

void onayla() {
  if (hane < PIN_UZUNLUK) {
    Serial.println("PIN 4 haneli olmali");
    return;
  }
  if (strcmp(girilen, DOGRU_PIN) == 0) {
    Serial.println("PIN dogru");
    yanlisSayisi = 0;
    digitalWrite(YESIL, HIGH);
  } else {
    yanlisSayisi++;
    Serial.print("PIN yanlis (");
    Serial.print(yanlisSayisi);
    Serial.print("/");
    Serial.print(AZAMI_YANLIS);
    Serial.println(")");
    digitalWrite(KIRMIZI, HIGH);
    if (yanlisSayisi >= AZAMI_YANLIS) {
      Serial.println("Cok fazla yanlis deneme");
      yanlisSayisi = 0;
    }
  }
  ledBitis = millis() + LED_SURESI;
  girisiTemizle();
}

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  girisiTemizle();
}

void loop() {
  char tus = tusTakimi.getKey();
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\0';
      yildizYaz();
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\0';
      yildizYaz();
    }
  } else if (tus == '#') {
    onayla();
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {   // LED süresi doldu
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
```

### How does it work?
1. `girilen` (entered) is a character array that holds 4 digits and a `'\0'` at the end. In C, a piece of text is a character array that ends with `'\0'`. `strcmp(a, b)` returns `0` if the two texts are equal.
2. When a digit arrives, it is written at position `hane` (digit count) in the array, `hane` goes up, and a `'\0'` is put at the end again. `*` does the opposite: `hane` goes down and `'\0'` is written in that place.
3. The comparison `tus >= '0' && tus <= '9'` works with character codes; the digit characters have consecutive codes.
4. When `#` is pressed, the length is checked first. If it is fewer than 4 digits, the attempt is **not counted**; the user only gets a warning, the digits they entered are not deleted, and they can carry on from where they were.
5. On a wrong entry, `yanlisSayisi` (wrong count) goes up by one. When it reaches 3, a warning is printed and the counter is reset. In a real lock you would start a lockout time here; we will do that in the project lesson.
6. When the LED goes off is worked out with `millis()`, not `delay` (lesson 27); that way keys are read while the LED is on, too. The expression `(long)(millis() - ledBitis) >= 0` is a comparison that works correctly even when `millis()` overflows.
7. The `A`, `B`, `C`, `D` keys do nothing in this program. Later you can use them as menu keys.

### Try it
- Make the PIN 6 digits long: set `PIN_UZUNLUK` to 6 and choose a new 6-digit text for `DOGRU_PIN`.
- Add a feature that clears the whole entry when you press the `D` key.
- Set `AZAMI_YANLIS` to 5. Did you need to change anything else?

### Common mistakes
- Writing the row and column pins the wrong way round in the sketch or in the wiring: keys are not detected, or they give the wrong letter. Pick each key in turn and see what the Serial monitor prints.
- Using the value returned by `getKey()` without checking it. If there is no press, it returns `'\0'`.
- Not leaving +1 for the `'\0'` at the end when making room for the `girilen` array.
- Comparing the PIN with `==`. With character arrays, `==` compares addresses; for the contents, use `strcmp`.
- Holding the LED on with `delay()`: keys pressed during that time can be missed.

## Discuss
Is it safe to write the PIN inside the program code? What would happen if someone could read the program's code? In the next lessons, why will we want to keep the PIN somewhere else?

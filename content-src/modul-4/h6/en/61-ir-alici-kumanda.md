# IR receiver and remote control codes
duration: 30

## Wonder
You cannot see the light at the tip of a TV remote with your eyes, but if you look through a phone camera, you can see it flashing. With every button, the remote sends a message with light. How does the TV understand this message as "volume up" or "change channel"? In this lesson you will open up the message and write your own decoder.

## Activity
### Circuit
The lab has no IR receiver or remote control part. So first get to know the real circuit, then try the same idea in the lab with a button.

In a real circuit (for information):

| Part | Connection |
|---|---|
| IR receiver module (VS1838B type, 38 kHz) | OUT → **D2**, VCC → 5 V, GND → GND |
| IR remote control | Pointed at the receiver; sends a message when you press a button |

The pin order differs between modules; you need to look at the labels printed on it (OUT, GND, VCC).

For the lab experiment, pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button (in place of the receiver's OUT output) | A → **D2**, B → **GND** |
| LED | The Uno's built-in LED (**D13**) is enough; you do not need to add a part |

When the button is not pressed, D2 reads HIGH thanks to `INPUT_PULLUP` (idle); when you hold the button down, it reads LOW (pulse). The IR receiver module's output works the same way: HIGH when idle, LOW while there is a carrier. If you measure how long the button stays pressed with `pulseIn`, you have rehearsed how to measure the length of an IR pulse. The difference is this: remote control pulses are at the millisecond and microsecond level, and you cannot press that fast by clicking.

### What does the remote send?
The IR LED at the tip of the remote produces a "carrier" by flashing 38,000 times a second. The receiver module only recognises this 38 kHz; it filters out slowly changing light such as daylight. The module's output works **inverted**:

- When there is no carrier, OUT = **HIGH** (idle).
- When there is a carrier, OUT = **LOW** (pulse).

So the Arduino does not see the carrier; it only sees "how long the LOW pulse lasted, how long the HIGH gap lasted". The information is stored in the **durations**. Many remotes use a protocol called NEC:

| Part | LOW (pulse) | HIGH (gap) |
|---|---|---|
| Leading pulse (start) | 9 ms | 4.5 ms |
| Bit 0 | 562.5 µs | 562.5 µs |
| Bit 1 | 562.5 µs | 1687.5 µs |
| End | 562.5 µs | idle |

The bits are told apart by the **gap**, not the pulse: a short gap is 0, a long gap is 1. After the leading pulse come 32 bits, **least significant bit first**:

1. Address (8 bits): which device?
2. Inverse of the address (8 bits): the same with every bit flipped
3. Command (8 bits): which button?
4. Inverse of the command (8 bits)

The inverse copy is an error check: if the command and its inverse are not each other's complement, the message is corrupt. That is why every message has 16 bits that are 1 and 16 bits that are 0, and a message lasts about 68 ms whichever button it is (13.5 ms start part + 16 × 1.125 ms + 16 × 2.25 ms + a 0.56 ms end pulse).

If you hold a button down, the remote does not repeat the same message; instead it sends a short "repeat" message: a 9 ms pulse, a **2.25 ms** gap and a 562.5 µs end pulse. It typically comes about every 108 ms. Some remotes use NEC's "extended" form (16-bit address, no inverse copy); if your remote does not follow NEC, the decoder gives an error. What is in this lesson is for standard NEC.

### Program 1: Measure the durations
First let's see that the leading pulse really is 9 ms. The `pulseIn(pin, durum, zamanAşımı)` (pin, state, timeout) you learnt in lesson 37 waits for the level and returns how many microseconds that level lasted. Here we look at the LOW pulses.

```cpp
// sketch: nec_zamanlari
const int IR_PIN = 2;

void setup() {
  Serial.begin(9600);
  pinMode(IR_PIN, INPUT);
}

void loop() {
  unsigned long on = pulseIn(IR_PIN, LOW, 200000);     // ön darbe (LOW)
  if (on < 8000) return;                               // ön darbe değil, yok say
  unsigned long ilkBit = pulseIn(IR_PIN, LOW, 20000);  // bir sonraki LOW darbe: ilk bitin darbesi
  Serial.print("On darbe: ");
  Serial.print(on);
  Serial.print(" us, ilk bit darbesi: ");
  Serial.print(ilkBit);
  Serial.println(" us");
}
```

On a real remote, when you press a button, the leading pulse comes out at around 9000 µs and the first bit's pulse at around 560 µs. On real remotes the values can wobble by a few hundred microseconds; the timing changes with the battery level and with manufacturing. Because there is no IR source in the lab, this sketch compiles but gives no output unless NEC pulses arrive at D2.

### Program 2: Write the NEC decoder yourself
Now read the 32 bits and find the command. An important detail: when `pulseIn(HIGH)` is called and the pin is already LOW, it waits for the next HIGH and measures that. Because a LOW pulse comes after each gap, when you make `pulseIn(IR_PIN, HIGH)` calls **one after another**, each call measures the next gap. The first call gives the leading gap (4.5 ms), and the next 32 calls give the gaps of the 32 bits.

```cpp
// sketch: nec_cozucu
const int IR_PIN = 2;
const int LED = 13;
const byte KOMUT_AC = 0x0C;      // kumandana göre değişir: önce yazdırıp bak
const byte KOMUT_KAPAT = 0x18;
const unsigned long BIT_ESIK = 1100;   // us: bundan uzun boşluk = 1

void hexYaz(byte b) {
  if (b < 16) Serial.print('0');
  Serial.print(b, HEX);
}

// Bir mesaj okur. Başarılıysa true döner; tekrar mesajıysa tekrar = true olur.
bool mesajOku(byte &adres, byte &komut, bool &tekrar) {
  unsigned long bosluk = pulseIn(IR_PIN, HIGH, 100000);    // ön boşluk
  if (bosluk == 0) return false;                           // sinyal yok
  if (bosluk > 2000 && bosluk < 2600) {                    // 2,25 ms: tekrar mesajı
    tekrar = true;
    return true;
  }
  if (bosluk < 4000 || bosluk > 5000) return false;        // 4,5 ms değil: gürültü
  tekrar = false;

  uint32_t veri = 0;
  for (int i = 0; i < 32; i++) {
    unsigned long b = pulseIn(IR_PIN, HIGH, 3000);         // i. bitin boşluğu
    if (b == 0 || b > 2200) return false;                  // beklenen süre dışında
    if (b > BIT_ESIK) veri |= (uint32_t)1 << i;            // uzun boşluk: i. biti 1 yap
  }

  adres = veri & 0xFF;
  byte adresTers = (veri >> 8) & 0xFF;
  komut = (veri >> 16) & 0xFF;
  byte komutTers = (veri >> 24) & 0xFF;
  if (komut != (byte)~komutTers) return false;             // ters kopya tutmuyor: bozuk
  (void)adresTers;                                         // genişletilmiş NEC'te tutmaz, denetlemiyoruz
  return true;
}

void setup() {
  Serial.begin(9600);
  pinMode(IR_PIN, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  byte adres, komut;
  bool tekrar = false;
  if (!mesajOku(adres, komut, tekrar)) return;

  if (tekrar) {
    Serial.println("tekrar");
    return;
  }
  Serial.print("Adres: 0x");
  hexYaz(adres);
  Serial.print(" Komut: 0x");
  hexYaz(komut);
  Serial.println();

  if (komut == KOMUT_AC) digitalWrite(LED, HIGH);
  if (komut == KOMUT_KAPAT) digitalWrite(LED, LOW);
}
```

### How does it work?
1. `pulseIn(IR_PIN, HIGH, 100000)` waits while idle: while the pin is HIGH, it first waits for that level to end, that is, for the leading pulse to arrive. If no signal comes within 100 ms, it returns `0` and `loop` tries again.
2. If the leading gap is not 4.5 ms, the message has not started (or it is noise); it returns `false`.
3. The expression `veri |= (uint32_t)1 << i` is a new idea: `1 << i` shifts 1 to the left by `i` places (for i = 3, binary 1000, that is 8). With `|=`, this bit is set to 1 inside `veri` (data). `uint32_t` is a 32-bit unsigned whole number; `int` is only 16 bits, so it does not fit a 32-bit message.
4. Because the bits arrive least significant bit first, the first bit that arrives is written to bit 0 of `veri`. Then we separate out the command with `veri >> 16` and the lowest 8 bits with `& 0xFF`.
5. `~komutTers` flips every bit of the byte (`~` is the complement). If the command and its inverse match, the message is sound.
6. `pulseIn` calls **block** (like the `delay` trap in lesson 26). This decoder cannot do any other job while it waits. It is enough for a small experiment, but in a program with many jobs a library is a better fit.

### Program 3: The IRremote library
In real projects a library does this job. The library watches pin changes with interrupts and a timer, does not block and recognises dozens of protocols. In IRremote version 4.x, the header file is `IRremote.hpp`.

```cpp
// sketch: ir_kutuphane
#include <IRremote.hpp>

const int IR_PIN = 2;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(IR_PIN, ENABLE_LED_FEEDBACK);   // mesaj gelince dahili LED yanıp söner
}

void loop() {
  if (IrReceiver.decode()) {                       // yeni mesaj çözüldü mü?
    Serial.print("Protokol: ");
    Serial.print(getProtocolString(IrReceiver.decodedIRData.protocol));
    Serial.print(" Adres: 0x");
    Serial.print(IrReceiver.decodedIRData.address, HEX);
    Serial.print(" Komut: 0x");
    Serial.println(IrReceiver.decodedIRData.command, HEX);
    IrReceiver.resume();                           // bir sonraki mesaja hazırlan
  }
}
```

This library sketch only compiles in the lab; because there is no IR receiver part, it gives no output. The library uses a timer inside; it can clash with other libraries that use the same timer (for example `tone()`). Check the documentation for the version you use.

`decode()` returns `true` if there is a message, and the result is in `decodedIRData`. If you do not call `resume()` when you are done, the library does not take a new message.

### Try it
- In the lab, connect the button to D2 (`INPUT_PULLUP`) and print how long it stays pressed, in microseconds, with `pulseIn(2, LOW, 3000000)`. See how the measurement changes with a short and a long press.
- In NEC, the leading pulse is always 9 ms and the leading gap 4.5 ms. So does a message last longer when the command is 0x00 or when it is 0xFF? Work it out from the bit durations in the lesson (hint: because of the inverse copy, how many bits are 1?).
- If a button is held down, repeat messages arrive about every 108 ms. How many repeat messages would you expect in 2 seconds?

### Common mistakes
- Connecting the real module's legs the wrong way round: the module can be damaged. The pin order depends on the module.
- Taking codes from another remote and expecting them to work with your remote: every remote's address and commands are different.
- Mixing up the `pulseIn(LOW)` and `pulseIn(HIGH)` calls. When idle the pin is HIGH; the leading pulse is LOW.
- Forgetting to write `INPUT_PULLUP` when trying it with a button: D2 floats and the measurement becomes meaningless (on the IR module this pull-up is inside the module).
- Using `int` with `1 << i` and losing everything after bit 16: for 32 bits you need `uint32_t` and `(uint32_t)1 << i`.
- In a real circuit, placing the IR receiver so that it looks straight at the sun or a bright lamp: the receiver can be triggered all the time.

## Discuss
If you used the remotes of two different devices at the same time in the same room, would they get mixed up? How does the address field in an NEC message solve this problem? What do you think the inverse copies are for?

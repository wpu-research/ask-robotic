# Driving with serial commands (a remote control simulation)
duration: 25

## Wonder
In computer games you walk your character with the W, A, S and D keys. It would be great if you could drive the robot with the same keys. In fact, all you need for this is a small "parser" that understands the letter coming from the serial port and turns it into motor commands. A cable or a Bluetooth module can carry the same letters to the robot. In this lesson we skip the wireless part and send the commands from the Serial monitor.

## Activity
### The command language
First, let's decide what we will say to the robot. Each command is one line: a letter and an optional number. The line ends with a newline character (`\n`).

| Command | Meaning | Wheels |
|---|---|---|
| `W` | Forward | left +, right + |
| `S` | Backward | left −, right − |
| `A` | Turn left on the spot | left −, right + |
| `D` | Turn right on the spot | left +, right − |
| `X` | Stop | both 0 |

The number written after the letter is the speed (PWM, 0-255). If no number is written, 150 is used. Examples: `W200`, `S`, `A100`, `X`. Lower-case letters are accepted too. The robot answers an unknown letter with `?`.

In the Serial monitor, set the line ending to "Newline"; otherwise the command is never completed.

### Circuit
| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Motor power | Separate battery box; driver GND common with Arduino GND |

**Safety:** Do the first test with the wheels in the air. Keep in mind that the robot may run away if there is a command or connection error. Do not connect the battery box the wrong way round and do not short it.

### Program
The parser has three parts:

1. **Reading:** `loop()` adds the characters coming from the serial port one by one to an array called `tampon` (buffer). When a newline arrives, the buffer is a command and `satirIsle()` (process line) is called.
2. **Decoding:** The first character of the array is the command letter (made upper case with `toupper`). The rest is turned into a number with `atoi`. `atoi` stands for "ASCII to integer"; it turns text into a whole number ("200" → 200). `constrain` limits the speed to 0-255.
3. **Applying:** `switch` sets the wheel speeds with `surus(sol, sag)` (drive left, right) according to the letter.

```cpp
// sketch: seri_komut
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

const int VARSAYILAN_HIZ = 150;   // hız yazılmazsa kullanılan PWM
char tampon[12];
int uzunluk = 0;

void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

void komutIsle(char komut, int hiz) {
  switch (komut) {
    case 'W': surus(hiz, hiz); break;       // ileri
    case 'S': surus(-hiz, -hiz); break;     // geri
    case 'A': surus(-hiz, hiz); break;      // yerinde sola dön
    case 'D': surus(hiz, -hiz); break;      // yerinde sağa dön
    case 'X': surus(0, 0); hiz = 0; break;  // dur
    default:
      Serial.println("?");
      return;
  }
  Serial.print("OK ");
  Serial.print(komut);
  Serial.print(' ');
  Serial.println(hiz);
}

void satirIsle() {
  tampon[uzunluk] = '\0';
  char komut = toupper(tampon[0]);
  int hiz = VARSAYILAN_HIZ;
  if (uzunluk > 1) hiz = constrain(atoi(tampon + 1), 0, 255);
  komutIsle(komut, hiz);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
  Serial.println("Hazir: W S A D X + hiz (0-255)");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (uzunluk > 0) satirIsle();
      uzunluk = 0;
    } else if (uzunluk < (int)sizeof(tampon) - 1) {
      tampon[uzunluk++] = c;
    }
  }
}
```

### How does it work?
1. `loop()` never waits (no `delay`, lesson 26). Every character that arrives while reading goes into the buffer, so even a long command is not left half-finished.
2. Both `\n` and `\r` count as the end of a line. It works whichever one the Serial monitor's line ending setting sends. If you choose "Both NL & CR", two characters arrive; at the second one the buffer is empty and nothing happens.
3. The buffer is 12 characters long; the extra part of a long line is thrown away, and the program does not overflow.
4. For the `X` command, the speed is printed as 0.
5. The direction and speed being driven right now are not stored in a variable; they are directly on the motor pins. The pins stay the same until a command arrives. This will have an important consequence, as you will see below.

### Measurement
We sent these commands to the robot in the simulation (waiting for the motion to settle between commands):

| Sent | Expected | Measured |
|---|---|---|
| `W200` | 0.289 m/s forward (from the model in lesson 76) | 0.29 m/s in the +x direction, no drift |
| `X` | stops | speed zero after 0.5 s, `OK X 0` on the serial port |
| `S` (no speed, with CRLF) | backward at 150: 0.19 m/s | 0.19 m/s in the −x direction, `OK S 150` on the serial port |
| `A150` for 0.5 s, then `X` | about 90° to the left | about +91°, position did not shift |
| `d150` for 0.5 s, then `X` | lower case accepted, about 90° to the right | turned back to the starting heading (within ±6°) |
| `Q` | prints `?`, the robot is not affected | `?` on the serial port, robot still |
| `W10` | PWM 10 is in the dead zone (lesson 78) | printed `OK W 10` but the robot did not move |
| `W999` | limited to 255 | `OK W 255`, 0.396 m/s |

The angle of a turn on the spot depends on time: at PWM 150 the robot turns about 183° per second. For 90° it needs about 0.5 s. This time changes with the battery and the floor; for precise turns you will use an encoder and an IMU later on.

### When the remote control drops out
One more test: send a single `W150` and send nothing else. In the simulation, the robot was still moving at 0.19 m/s after 3 seconds and had travelled more than half a metre. The reason is clear: the robot carries out a command **until a new command arrives**. If the cable comes out, the Bluetooth drops or the computer freezes, the robot keeps going with the last command. For a real robot this is dangerous behaviour. You will close this gap in the project in lesson 80.

What may be different on a real robot: on wireless links, characters can get lost or delayed. In the simulation the serial line is perfect and has no delay.

### Try it
- Set `VARSAYILAN_HIZ` to 100. How fast does the robot go with the `W` command? What happens if it goes below 51?
- Add the letter `E` as "slow forward" (fixed speed 80). Is a single `case` inside the `switch` enough?
- What happens when you write the command as `W 200` (with a space)? How does `atoi` deal with the space? Try it.

### Common mistakes
- Leaving the Serial monitor's line ending setting on "No line ending": the command is never completed and the robot does not react at all.
- Joining the buffer with `String` and allocating new memory for every character. On the Uno, with its small memory, a `char` array is safer.
- Not limiting the speed: a silly number such as `W9999` overflows `analogWrite`. `constrain` prevents this.
- Doing nothing for an unknown command: the user does not understand what happened. A `?` is enough.
- Leaving the robot in a way that it never stops automatically. We will see this in the next lesson.

## Discuss
We designed the command protocol as "the first character is the command, the rest is a number". If you needed to add more commands (for example increasing the speed with `+` and `-`), would this design be enough? What do you need to be most careful about when adding new commands?

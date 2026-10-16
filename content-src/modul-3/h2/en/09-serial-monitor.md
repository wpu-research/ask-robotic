# Serial monitor: print, read, parse
duration: 25

## Wonder
Until now we have only been able to guess what is going on inside the board from an LED blinking. But what if the board wrote text to you directly? What if it said "You pressed the button 3 times"? What if you could type commands to it from the computer? The serial port makes this possible.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button | One end to **D2**, the other end to **GND** |
| LED (red) + 330 Ω resistor | **D13** → resistor → LED anode; cathode to GND |

A real board talks over the same USB cable that connects it to the computer. In the lab this connection is ready: the **Serial monitor** at the bottom shows what the board writes and sends what you type to the board. Press ▶, and while the program runs, type into the serial monitor's input box and send it.

### Serial communication
The board and the computer communicate by sending bits one after another (in series). Both sides must talk at the same speed. This speed is called **baud**. We will always use 9600 baud. The lab sets this by itself; in a real Serial Monitor you must choose the same speed too.

```cpp
Serial.begin(9600);        // setup() içinde bir kez
Serial.print("merhaba");   // satır sonu eklemeden yazar
Serial.println("dunya");   // yazar ve alt satıra geçer
Serial.println(42);        // sayı da yazabilir
```

Note: Turkish letters (`ç, ğ, ı, ö, ş, ü`) may look garbled in the serial monitor. That is why we do not use these letters in the texts we print.

### Print
A program that prints the button state every half second:

```cpp
// sketch: seri_yazdir
void setup() {
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Hazir");
}

void loop() {
  int d = digitalRead(2);
  Serial.print("D2 = ");
  Serial.println(d);
  delay(500);
}
```

Lines saying `D2 = 1` scroll past in the serial monitor. When you switch on the button's **Pressed** property or hold the button down, it becomes `D2 = 0`. Now you can see with your own eyes that pressed = LOW = 0.

This is the easiest way to debug: you look for answers to questions like "Did the code reach this point? What value does the variable have?" with `Serial.print`.

### Read
Data coming from the computer collects in a buffer on the board. `Serial.available()` tells you how many bytes are waiting, and `Serial.read()` reads one byte.

```cpp
// sketch: seri_komut
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {       // gelen veri var mı?
    char c = Serial.read();           // bir karakter oku
    if (c == 'A') {
      digitalWrite(13, HIGH);
      Serial.println("LED acik");
    } else if (c == 'K') {
      digitalWrite(13, LOW);
      Serial.println("LED kapali");
    } else {
      Serial.print("Bilinmeyen komut: ");
      Serial.println(c);
    }
  }
}
```

Type `A` into the serial monitor's input box and send it: the LED lights. Send `K`: it goes off. `char` is a variable that holds a single character, and it is written with single quotes: `'A'`.

### Parse
Sometimes the incoming data has the form "command + number", for example `B3`: "blink 3 times". Splitting data into parts is called **parsing**. `Serial.parseInt()` reads the next number coming from the serial port and gives it as an `int`.

```cpp
// sketch: seri_ayristir
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  Serial.println("B ve bir sayi yaz, ornek: B3");
}

void loop() {
  if (Serial.available() > 0) {
    char komut = Serial.read();           // ilk karakter: komut
    if (komut == 'B') {
      int adet = Serial.parseInt();       // arkasından gelen sayi
      Serial.print("Yanip sonme: ");
      Serial.println(adet);
      for (int i = 0; i < adet; i++) {
        digitalWrite(13, HIGH);
        delay(200);
        digitalWrite(13, LOW);
        delay(200);
      }
    }
  }
}
```

Type `B3` in the serial monitor and send it: the LED blinks 3 times. In a real Serial Monitor, if the line ending setting is "Newline", a line-ending character is added to the end of what you send. The program reads this character and ignores it because it is not `B`.

You can also read more than one number in a row. Let's add two numbers separated by a space:

```cpp
// sketch: seri_toplam
void setup() {
  Serial.begin(9600);
  Serial.println("Iki sayi yaz, ornek: 12 30");
}

void loop() {
  if (Serial.available() > 0) {
    int a = Serial.parseInt();
    int b = Serial.parseInt();
    Serial.print("Toplam: ");
    Serial.println(a + b);
  }
}
```

### How does it work?
1. `Serial.begin(9600)` opens the serial port. A real Serial Monitor's speed must also be 9600; otherwise you see meaningless characters on the screen. The lab matches it by itself.
2. `Serial.print` writes, and `Serial.println` writes and ends the line.
3. `Serial.available()` gives the number of bytes waiting to be read. `read()` uses up one byte each time it is called.
4. `parseInt()` skips characters that are not digits and reads until the number ends. If no data comes after the number, it waits about one second and gives up. Sending a line ending shortens this wait.
5. Incoming data can be more than one byte at a time; while `loop()` goes round again, the remaining bytes wait in the buffer.

### Try it
- Change the `seri_yazdir` program so that it prints only when the state changes, not all the time. (Use the edge idea from last lesson.)
- Add a `'T'` command to the `seri_komut` program: make it print the LED's current state.
- In the `seri_ayristir` program, take the blink time from the command as well: like `B3 500`.

### Common mistakes
- Not writing `Serial.begin`: nothing appears.
- Writing a different speed in `Serial.begin`: in a real Serial Monitor the screen fills with meaningless characters.
- Calling `read()` directly instead of `if (Serial.available())`: it returns `-1` when there is no data.
- Writing `"A"` instead of `'A'`: double quotes are text, single quotes are a single character. Use single quotes with `char`.
- Printing too often and too much: writing is slow and slows the program down.

## Discuss
Is the serial port only for talking to a computer? If two Arduino boards were connected to each other with just two wires (one writing, one listening), what kinds of messages could they send each other?

# Functions, scope and parameters
duration: 25

## Wonder
What happens if you write the same three lines (play a note, wait, stop) dozens of times in a melody? Your program gets long, and if you make a mistake somewhere you have to fix every copy one by one. Programmers write this job once and give it a name. Today you will write your own commands.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Passive buzzer | **+** leg → **D8**; **-** leg → GND |

The last sketch (scope) needs no circuit; the **Serial monitor** is enough.

### What is a function?
`setup()` and `loop()` are really functions. You can write your own function too:

```cpp
void bip() {
  // buraya komutlar yazılır
}
```
- `void`: the function does **not return** a value.
- `bip`: the name of the function (a "beep"). Make it descriptive.
- `()`: the **parameters** go inside the brackets (leave them empty if there are none).
- `{ }`: the body of the function.

Defining a function does not run it. To make it run, you must **call** it by its name: `bip();`

### Program 1: Your first function
```cpp
// sketch: fonk_bip
void bip() {
  tone(8, 880, 100);
  delay(150);
}

void setup() {
}

void loop() {
  bip();
  bip();
  bip();
  delay(1000);
}
```

### Parameters and return values
A parameter is information you give a function from outside. When you write `notaCal(440, 400)` (play note), `440` is the frequency and `400` is the duration. A function can also give back a result: instead of `void`, you write the return type (such as `int`), and you hand back the result with `return`.

### Program 2: A function that plays a melody
We play the "Twinkle, Twinkle, Little Star" melody. Three functions work together:
```cpp
// sketch: fonk_melodi
const int BUZZER = 8;           // const: değeri değişmeyen sabit
const int NOTA_SAYISI = 14;

int melodi[]  = {262, 262, 392, 392, 440, 440, 392,
                 349, 349, 330, 330, 294, 294, 262};
int uzunluk[] = {1, 1, 1, 1, 1, 1, 2,
                 1, 1, 1, 1, 1, 1, 2};      // kaç vuruş

int vurusSuresi(int bpm) {          // dakikadaki vuruştan ms hesapla
  return 60000 / bpm;
}

void notaCal(int frekans, int sure) {
  tone(BUZZER, frekans, sure * 9 / 10);   // sürenin %90'ı ses, %10'u ara
  delay(sure);
}

void melodiCal(int bpm) {
  int vurus = vurusSuresi(bpm);
  for (int i = 0; i < NOTA_SAYISI; i++) {
    notaCal(melodi[i], uzunluk[i] * vurus);
  }
}

void setup() {
}

void loop() {
  melodiCal(150);     // dakikada 150 vuruş: bir vuruş 400 ms
  delay(2000);
}
```

### Scope: where does a variable live?
The part of the program where a variable can be seen is called its **scope**.
- A **local** variable is defined inside a function; only that function sees it, and it is created afresh on every call.
- A **global** variable is defined outside the functions; every function sees it, and its value is kept between calls.

Parameters go into a function as a **copy**: changing the parameter inside the function does not change the variable outside.

### Program 3: See scope in action
```cpp
// sketch: fonk_kapsam
int toplam = 0;      // global: her yerden görünür
int sayi = 5;

void yerelDene() {
  int yerel = 0;     // her çağrıda yeniden oluşur
  yerel = yerel + 1;
  Serial.print("yerel: ");
  Serial.println(yerel);
}

void globalDene() {
  toplam = toplam + 1;   // değer korunur
  Serial.print("toplam: ");
  Serial.println(toplam);
}

void ikiyeKatla(int x) {
  x = x * 2;             // yalnız kopya değişir
  Serial.print("fonksiyonda x: ");
  Serial.println(x);
}

void setup() {
  Serial.begin(9600);
  ikiyeKatla(sayi);
  Serial.print("disarida sayi: ");
  Serial.println(sayi);
}

void loop() {
  yerelDene();
  globalDene();
  delay(500);
}
```

### How does it work?
1. In Program 1, `bip()` is called three times; the code is written once and runs three times. To change the sound, you only need to change one line.
2. In Program 2, `melodiCal` (play melody) calls `notaCal` for every note. `notaCal` takes a frequency and a duration parameter; `vurusSuresi` (beat length) gives back a number with `return`: `60000 / 150 = 400` ms.
3. The sum `uzunluk[i] * vurus` (length × beat) makes a two-beat note last 800 ms.
4. In Program 3, `yerel` (local) prints 1 every time, while `toplam` (total) goes up 1, 2, 3. Inside `ikiyeKatla(sayi)` (double it), `x` becomes 10, but outside, `sayi` is still 5.

### Try it
- Write `melodiCal(100)` and `melodiCal(200)`. How does the tempo change?
- Write your own melody by changing the `melodi` and `uzunluk` arrays. Update the value of `NOTA_SAYISI` (number of notes) too.
- Write a function called `void sessizlik(int sure)` (silence) that only does `delay(sure)`, and add it to the end of the melody.

### Common mistakes
- Defining a function and never calling it: defining does not run it, you must write `notaCal(440, 300);`.
- Defining a function inside another function: functions are written side by side, outside each other's `{ }` blocks.
- Giving the wrong number of parameters: `notaCal(440)` gives a compiler error, because it expects two parameters.
- Using a local variable in another function: the compiler says "was not declared in this scope". Make the variable global or pass it as a parameter.
- Forgetting to write `return`: in a function that returns `int`, you must give back the result with `return`.

## Discuss
Why does splitting a big program into functions make bugs easier to find? Why is it not a good idea to make everything a global variable?

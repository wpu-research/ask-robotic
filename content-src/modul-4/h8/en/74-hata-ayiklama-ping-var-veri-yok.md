# A debugging case: "ping works but there is no data"
duration: 30

## Wonder
You connect a gimbal camera to a laptop over USB-Ethernet. `ping` answers: the device is there. But the telemetry and the video stream keep dropping, and the application gets no data. It is very tempting to think "there is a connection, so the problem is in the software". The real cause, however, was not in the software. The lesson from this case is the same whether it is a network cable or an I2C sensor: look for the fault **layer by layer**.

## Activity
### The case: the Hyvex gimbal
This section is based on a case from the Hyvex team's internship programme; I only pass on what is written there.
- The gimbal connects to the laptop over Type-C like USB-Ethernet, and it is reached with a static IP.
- **Symptom:** `ping` works, but the telemetry and the video (RTSP) keep dropping.
- **Root cause:** NetworkManager was deleting the IP with DHCP. The fix was to set up a permanent static profile.
- **Clue:** The sentence "it sorts itself out now and then" is a sign that one **layer is unstable**.
- **Method:** Checking layer by layer to bring the symptom down to the root cause: physical connection, IP, port, application.

The programme's question is this: "Before you say you have 'fixed' a fault, how do you make sure?" First let's adapt the method to our world.

### Our layers: an I2C sensor
The network "ping" here is an **I2C scan** (lesson 33): someone answers at the address. But a device answering at its address does not prove that it is the right device or that it gives the right data. We check four layers in order from the bottom up. Testing a higher layer only makes sense if the ones below it are fine:

| Layer | Question | How to try it |
|---|---|---|
| 1. Physical | Are the lines (SDA/SCL) HIGH when idle, is there a short circuit? | `digitalRead(A4)` and `digitalRead(A5)` |
| 2. Address | Is a device answering at the expected address? | `beginTransmission` / `endTransmission` |
| 3. Protocol (identity) | Is the one answering the **right** device? | Read the identity register (WHO_AM_I), compare it with the expected one |
| 4. Data logic | Is the value read **sensible**? | Range check |

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| MPU6050 | VCC → **5V**, GND → **GND**, SDA → **A4**, SCL → **A5** |

On the MPU6050 (the accelerometer you saw in lesson 58, address 0x68), the identity register is 0x75 and, according to the datasheet, it returns `0x68`. At rest, the total size of the acceleration should be about 1 g (gravity). This sketch tries the four layers in order and tells you the **first layer that fails**:

```cpp
// sketch: katman_testi
#include <Wire.h>

const byte ADRES = 0x68;
const byte YAZMAC_KIMLIK = 0x75;      // WHO_AM_I
const byte BEKLENEN_KIMLIK = 0x68;
const byte YAZMAC_GUC = 0x6B;         // uyku/güç yazmacı
const byte YAZMAC_IVME = 0x3B;        // ivme verisinin başı
const float MIN_G = 0.8;              // hareketsiz ivme büyüklüğü için makul aralık
const float MAKS_G = 1.2;

int sonSonuc = -1;
float sonG = 0;

bool hatlarBosta() {
  return digitalRead(A4) == HIGH && digitalRead(A5) == HIGH;
}

bool cihazVar() {
  Wire.beginTransmission(ADRES);
  return Wire.endTransmission() == 0;
}

int kimlikOku() {
  Wire.beginTransmission(ADRES);
  Wire.write(YAZMAC_KIMLIK);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom((int)ADRES, 1) != 1) return -1;
  return Wire.read();
}

bool ivmeBuyuklugu(float &g) {
  Wire.beginTransmission(ADRES);
  Wire.write(YAZMAC_IVME);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((int)ADRES, 6) != 6) return false;
  int16_t ham[3];
  for (int i = 0; i < 3; i++) {
    int yuksek = Wire.read();
    int dusuk = Wire.read();
    ham[i] = (int16_t)((yuksek << 8) | dusuk);
  }
  float x = ham[0] / 16384.0;         // varsayılan aralıkta 16384 LSB = 1 g
  float y = ham[1] / 16384.0;
  float z = ham[2] / 16384.0;
  g = sqrt(x * x + y * y + z * z);
  return true;
}

// 0 = hepsi tamam, 1-4 = ilk hata veren katman
int ilkHataKatmani() {
  if (!hatlarBosta()) return 1;
  if (!cihazVar()) return 2;
  if (kimlikOku() != BEKLENEN_KIMLIK) return 3;
  float g;
  if (!ivmeBuyuklugu(g)) return 4;
  sonG = g;
  if (g < MIN_G || g > MAKS_G) return 4;
  return 0;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(ADRES);      // uykudan uyandır
  Wire.write(YAZMAC_GUC);
  Wire.write(0);
  Wire.endTransmission();
  delay(100);
}

void loop() {
  int sonuc = ilkHataKatmani();
  if (sonuc == 0) {
    Serial.print("TAMAM g=");
    Serial.println(sonG, 2);
  } else if (sonuc == 1) {
    Serial.println("Katman 1 HATA: SDA/SCL LOW'da takili");
  } else if (sonuc == 2) {
    Serial.println("Katman 2 HATA: adreste cihaz yok");
  } else if (sonuc == 3) {
    Serial.println("Katman 3 HATA: adres cevap veriyor ama kimlik yanlis");
  } else {
    Serial.println("Katman 4 HATA: deger makul degil");
  }
  if (sonSonuc != -1 && sonuc != sonSonuc) {
    Serial.println("DEGISTI: sonuc kararsiz");
  }
  sonSonuc = sonuc;
  delay(1000);
}
```

### How does it work?
1. `hatlarBosta()` (lines idle) checks that the I2C lines are HIGH when idle. Note: on the Uno, `Wire.begin()` switches on the internal pull-up resistors, so the line usually reads HIGH even if nothing is connected. This test only catches the case where the line is stuck LOW (such as a short circuit); the "no wire at all" case is found by layer 2.
2. `cihazVar()` (device present) is the scan from lesson 33 reduced to a single address.
3. `kimlikOku()` (read identity) asks the address for the identity register. This gives **more information than a ping**: if the wrong device answers at the address, or if the wires have swapped places, you catch it here.
4. `ivmeBuyuklugu()` (acceleration size) reads six bytes (two bytes each for X, Y, Z), converts them into g and works out the size of the vector. For a sensor at rest, 0.8-1.2 g is a sensible range. If the sensor is shaking, this test gives a false alarm; the range needs you to know **under which condition** the test is valid.
5. `ilkHataKatmani()` (first failing layer) tries from the bottom up in order and stops at the first fault. There is no point asking about a higher layer while a lower one is broken. The root cause is the **lowest** layer that fails.
6. If the result changes between two measurements, it prints `DEGISTI` (changed). This is the code for the "it sorts itself out now and then" clue in the case.

### Producing sensor failure modes in the lab
Not all of the layers can be produced in the lab. Know which ones you can produce and which ones you will only see in a real circuit:

| Failure mode | Which layer | How to produce it in the lab |
|---|---|---|
| SDA or SCL wire missing | 2 | Delete the wire (while the circuit is stopped), ▶ |
| No power | 2 | Delete the MPU6050's VCC wire |
| Different address | 2 | Select the part and set the **I2C address** property to `0x69` (while the circuit is stopped); the code still looks for `0x68` |
| Data zero (frozen sensor) | 4 | While it runs, set the `ax`, `ay` and `az` properties to 0 |
| Data saturated, or shaking | 4 | While it runs, set the `ax`, `ay` and `az` properties to 1.9 |
| "It sorts itself out now and then" | `DEGISTI` | While it runs, set `az` to 0, then back to 1 |
| SDA line stuck LOW (short circuit) | 1 | Connect the Uno's **A4** pin to **GND** with a wire (while the circuit is stopped), ▶ |
| Wrong device at the address | 3 | **Cannot be produced.** In the lab you cannot put another device at the expected address; the MPU6050 can only be `0x68` or `0x69`. |

Layer 3 is in the code, but because the lab cannot produce this fault, you have not tested it in the lab. In a real circuit you need to check separately that this line works as you expect.

### Frame and checksum
There is one more layer: if the data is part of a long message, a **checksum** is used to tell whether it has been corrupted. In the Hyvex case, the checksum in the gimbal's UDP command frame is the **XOR** of certain bytes. The frame is made of these parts: sync (start), length, command, parameter, checksum and footer. If the receiver does not recalculate the checksum, it takes a corrupted frame for a valid one.

Our small frame has this form: `0xAA` (sync), `N` (number of data bytes), `N` data bytes, last byte = the XOR of `N` and the data bytes. The first of the data bytes is the command: `0x01` = LED, and the second is the parameter (1 = on, 0 = off).

```cpp
// sketch: xor_cerceve
const byte SYNC = 0xAA;
const byte MAKS_VERI = 8;
const int LED = 13;

enum Asama { BEKLE, UZUNLUK, VERI, SUM };
Asama asama = BEKLE;
byte veri[MAKS_VERI];
byte n = 0;
byte alinan = 0;
byte xorHesap = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  while (Serial.available()) {
    byte b = Serial.read();
    switch (asama) {
      case BEKLE:
        if (b == SYNC) asama = UZUNLUK;       // sync dışındaki baytlar yok sayılır
        break;
      case UZUNLUK:
        if (b == 0 || b > MAKS_VERI) {
          Serial.println("UZUNLUK HATA");
          asama = BEKLE;
        } else {
          n = b;
          alinan = 0;
          xorHesap = b;
          asama = VERI;
        }
        break;
      case VERI:
        veri[alinan++] = b;
        xorHesap ^= b;
        if (alinan == n) asama = SUM;
        break;
      case SUM:
        if (b == xorHesap) {
          Serial.println("CERCEVE TAMAM");
          if (veri[0] == 0x01 && n >= 2) digitalWrite(LED, veri[1] ? HIGH : LOW);
        } else {
          Serial.print("CHECKSUM HATA: gelen=");
          Serial.print(b, HEX);
          Serial.print(" hesaplanan=");
          Serial.println(xorHesap, HEX);        // bozuk çerçeve uygulanmaz
        }
        asama = BEKLE;
        break;
    }
  }
}
```

In this design, if the checksum does not match, the frame is **ignored**: the LED does not change. What the Hyvex device does with a frame that does not match is not written in the source; and that is the question for you: what would happen if a device carried out a corrupted command?

### Try it
- While `katman_testi` (layer test) is running, set the `ax` property to 0.8 (as if the sensor were speeding up sideways). The total size becomes about 1.28 g: which layer fails? Why is this not a sensor fault?
- Make `MIN_G` and `MAKS_G` narrow, and keep them wide: which one produces false alarms, and which one missed faults?
- For `xor_cerceve` (XOR frame), check for yourself by XOR-ing that the frame `AA 02 01 01 02` is valid (`02 ^ 01 ^ 01 = 02`). Then change the last byte.
- Add these layers to your own sketch, to run at every start-up before you use a device.
- Change the `az` property quickly between 0 and 1 and see when the `DEGISTI` message appears.

### Common mistakes
- Saying "the ping (scan) answers, so the device works". An answer at the address does not mean the identity and the data are right.
- Changing the software as the first job when a fault is found; check the lower layers first.
- Brushing a fault aside because "it sorts itself out now and then". Unstable behaviour shows that a layer is unhealthy.
- Doing the range check without a condition: it gives false alarms while the sensor is moving.
- Trusting the incoming byte without calculating the checksum.

## Discuss
Before you say you have "fixed" a fault, how do you make sure? Is it enough to try all four layers in this lesson again before and after the fault, or do you need to wait a while to see that the problem does not come back "now and then"?

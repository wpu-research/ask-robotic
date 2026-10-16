// Buton (INPUT_PULLUP): bir uç D2, diğer uç GND. Basılıyken LOW okunur.
// Mekanik buton zıplar (bounce): 20-50 ms boyunca açılıp kapanır, yazılımla süzülür.
const int BTN = 2;
const int LED = 13;
int sayac = 0;
bool onceki = HIGH;
unsigned long sonDegisim = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BTN, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool simdi = digitalRead(BTN);
  if (simdi != onceki && millis() - sonDegisim > 30) {
    sonDegisim = millis();
    if (simdi == LOW) {
      sayac++;
      Serial.print("basma=");
      Serial.println(sayac);
    }
    onceki = simdi;
  }
  digitalWrite(LED, simdi == LOW);
}

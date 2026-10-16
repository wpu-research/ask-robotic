// ESOF 323, 1. hafta: iki sensörlü aç-kapa (bang-bang) çizgi izleyen, L298N sürücü
// Sol IR OUT -> D2, sağ IR OUT -> D3 (çizgiyi görünce LOW)
// L298N: ENA D5, IN1 D6, IN2 D7, IN3 D8, IN4 D9, ENB D10; OUT1/OUT2 sol motor, OUT3/OUT4 sağ motor
const int L_IR = 2, R_IR = 3;
const int ENA = 5, IN1 = 6, IN2 = 7, IN3 = 8, IN4 = 9, ENB = 10;

void drive(int left, int right) {
  digitalWrite(IN1, left >= 0);  digitalWrite(IN2, left < 0);
  digitalWrite(IN3, right >= 0); digitalWrite(IN4, right < 0);
  analogWrite(ENA, abs(left));   analogWrite(ENB, abs(right));
}

void setup() {
  Serial.begin(9600);
  pinMode(L_IR, INPUT); pinMode(R_IR, INPUT);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
}

void loop() {
  bool l = digitalRead(L_IR) == LOW;   // çoğu IR modülünde LOW = çizgi algılandı
  bool r = digitalRead(R_IR) == LOW;
  if (l && r)   { drive(150, 150); Serial.println("duz"); }
  else if (l)   { drive(0, 150);   Serial.println("sola"); }
  else if (r)   { drive(150, 0);   Serial.println("saga"); }
  else          { drive(0, 0);     Serial.println("kayip"); }
  delay(100);
}

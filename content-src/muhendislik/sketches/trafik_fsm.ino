// ESOF 323, 2. hafta: engellemeyen trafik ışığı durum makinesi (millis)
// Yeşil D11, sarı D12, kırmızı D13 (her biri 220 Ω ile); potansiyometre orta ucu A0
enum State { GREEN, YELLOW, RED };
State state = GREEN;
unsigned long t0 = 0, tPrint = 0;
const unsigned long DUR[] = {4000, 1000, 3000};   // her durumun süresi (ms)
const int PIN[] = {11, 12, 13};

void setup() {
  for (int i = 0; i < 3; i++) pinMode(PIN[i], OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() - t0 >= DUR[state]) {          // taşmaya dayanıklı karşılaştırma
    t0 = millis();
    state = (State)((state + 1) % 3);
    Serial.print("durum -> "); Serial.println(state);
  }
  for (int i = 0; i < 3; i++) digitalWrite(PIN[i], i == state);
  // ışıklar beklemeden çalışırken başka işler de yapılabilir: potansiyometre gerilimi
  if (millis() - tPrint >= 250) {
    tPrint = millis();
    Serial.print("V=");
    Serial.println(analogRead(A0) * 5.0 / 1023.0, 2);
  }
}

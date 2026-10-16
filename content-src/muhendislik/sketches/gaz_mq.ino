// MQ serisi gaz modülü: AO -> A0 (analog seviye), DO -> D2 (eşik karşılaştırıcısı, gaz varken LOW)
// Not: MQ sensörlerin ısıtıcısı ilk açılışta 1-2 dk (MQ-7 ve MQ-135'te daha uzun) ön ısınma ister.
const int AO_PIN = A0;
const int DO_PIN = 2;

void setup() {
  Serial.begin(9600);
  pinMode(DO_PIN, INPUT);
}

void loop() {
  int ham = analogRead(AO_PIN);          // 0-1023
  float volt = ham * 5.0 / 1023.0;
  bool alarm = digitalRead(DO_PIN) == LOW;
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" V=");
  Serial.print(volt, 2);
  Serial.println(alarm ? " ALARM" : " normal");
  delay(250);
}

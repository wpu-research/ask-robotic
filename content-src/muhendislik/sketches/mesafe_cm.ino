// HC-SR04 ailesi (HC-SR04, JSN-SR04T, RCWL-1601, US-100 trig/echo kipi): TRIG -> D9, ECHO -> D10
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 40000UL);   // 40 ms zaman aşımı (~680 cm)
  if (sure == 0) {
    Serial.println("menzil disi");
  } else {
    Serial.print("cm=");
    Serial.println(sure / 58.2, 1);
  }
  delay(100);
}

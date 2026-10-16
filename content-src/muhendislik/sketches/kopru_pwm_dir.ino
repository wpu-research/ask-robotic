// PWM + DIR tipi sürücü (Cytron MD10C): D5 -> PWM, D7 -> DIR
const int PWM_PIN = 5;
const int DIR_PIN = 7;

void surus(int hiz) {           // -255 ... +255
  digitalWrite(DIR_PIN, hiz < 0 ? HIGH : LOW);
  analogWrite(PWM_PIN, abs(hiz));
}

void setup() {
  Serial.begin(9600);
  pinMode(PWM_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);
}

void loop() {
  Serial.println("ileri tam");  surus(255);  delay(1000);
  Serial.println("ileri yarim"); surus(128); delay(1000);
  Serial.println("geri");       surus(-200); delay(1000);
  Serial.println("dur");        surus(0);    delay(1000);
}

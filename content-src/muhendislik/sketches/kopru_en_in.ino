// EN/PWM + IN1/IN2 tipi köprü sürücü (L298N, TB6612FNG)
// D5 -> ENA (TB6612'de PWMA), D7 -> IN1 (AIN1), D8 -> IN2 (AIN2), D9 -> STBY (yalnız TB6612)
const int PWM_PIN = 5;
const int IN1 = 7;
const int IN2 = 8;
const int STBY = 9;

void surus(int hiz) {           // -255 ... +255
  digitalWrite(IN1, hiz > 0);
  digitalWrite(IN2, hiz < 0);
  analogWrite(PWM_PIN, abs(hiz));
}

void setup() {
  Serial.begin(9600);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(PWM_PIN, OUTPUT);
  pinMode(STBY, OUTPUT);
  digitalWrite(STBY, HIGH);     // TB6612 bekleme modundan çıkar
}

void loop() {
  Serial.println("ileri tam");  surus(255);  delay(1000);
  Serial.println("ileri yarim"); surus(128); delay(1000);
  Serial.println("geri");       surus(-200); delay(1000);
  Serial.println("dur");        surus(0);    delay(1000);
}

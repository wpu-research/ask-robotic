// İki PWM girişli köprü sürücü (DRV8833, BTS7960)
// DRV8833: D5 -> AIN1, D6 -> AIN2      BTS7960: D5 -> RPWM, D6 -> LPWM, D9 -> R_EN ve L_EN
// Hız ve yön aynı anda: bir giriş PWM, diğeri LOW.
const int PWM_A = 5;
const int PWM_B = 6;
const int EN_PIN = 9;

void surus(int hiz) {           // -255 ... +255
  if (hiz >= 0) { analogWrite(PWM_B, 0); analogWrite(PWM_A, hiz); }
  else          { analogWrite(PWM_A, 0); analogWrite(PWM_B, -hiz); }
}

void setup() {
  Serial.begin(9600);
  pinMode(PWM_A, OUTPUT);
  pinMode(PWM_B, OUTPUT);
  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, HIGH);   // BTS7960 yarım köprülerini etkinleştir
}

void loop() {
  Serial.println("ileri tam");  surus(255);  delay(1000);
  Serial.println("ileri yarim"); surus(128); delay(1000);
  Serial.println("geri");       surus(-200); delay(1000);
  Serial.println("dur");        surus(0);    delay(1000);
}

// TMC2209 + NEMA17 step motor: D3 -> STEP, D4 -> DIR, D8 -> EN (LOW = etkin)
// Sürücü 1/8 mikro adımda: bir tur = 200 adım x 8 = 1600 STEP darbesi.
const int STEP_PIN = 3;
const int DIR_PIN = 4;
const int EN_PIN = 8;
const int MIKRO = 8;

void adimla(long n, bool ileri, int bekleUs) {
  digitalWrite(DIR_PIN, ileri ? HIGH : LOW);
  for (long i = 0; i < n; i++) {
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(bekleUs);
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(bekleUs);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(STEP_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);
  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, LOW);
}

void loop() {
  Serial.println("ileri 180");
  adimla(100L * MIKRO, true, 300);   // 100 tam adım = 180 derece
  delay(500);
  Serial.println("geri 90");
  adimla(50L * MIKRO, false, 300);
  delay(500);
}

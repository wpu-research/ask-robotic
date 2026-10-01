// Serbest mod (/arena) için sahne başına örnek kodlar. Her biri derlenir ve sahnesinde çalışır (free.test.ts).
import { FREE_SCENES } from './scenes'
import { CIZGI_ZOR, KACIS } from './free-sketches'
import { MOTOR_FN, PIN_HEADER, SETUP_PINS } from './activities/helpers'

const LINE = `// Çizgi izleyici: 5 sensör, ağırlıklı konum, çizgi kaybında son yöne dön
${PIN_HEADER}const int ESIK = 512;
const int HIZ = 150;
const int KAZANC = 45;            // çizgiye göre sapmayı düzeltme gücü
const unsigned long BOSLUK_MS = 700;  // çizgi bu süre görünmezse ara

int sonYon = 0;                    // -1: çizgi solda kaldı, +1: sağda
unsigned long sonGorulen = 0;

${MOTOR_FN}
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, constrain(sol, -255, 255));
  motor(SAG_EN, SAG_IN1, SAG_IN2, constrain(sag, -255, 255));
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
}

void loop() {
  int toplam = 0, agirlik = 0;
  for (int i = 0; i < 5; i++) {
    bool cizgide = analogRead(A0 + i) > ESIK;   // A0 en solda
    if (cizgide) { toplam++; agirlik += i - 2; }
  }
  if (toplam > 0) {
    float hata = (float)agirlik / toplam;       // eksi: çizgi solda
    if (hata < -0.5) sonYon = -1; else if (hata > 0.5) sonYon = 1;
    surus(HIZ + KAZANC * hata, HIZ - KAZANC * hata);
    sonGorulen = millis();
  } else if (millis() - sonGorulen < BOSLUK_MS) {
    surus(HIZ, HIZ);                            // kısa boşluk: düz devam
  } else {
    surus(-sonYon * 90, sonYon * 90);           // çizgiyi arayarak yerinde dön
  }
}
`

const TAMPON = `// Tampon testi: duvara kadar ileri git, çarpınca geri çekil ve dur
${PIN_HEADER}const int SOL_TAMPON = 2, SAG_TAMPON = 3;     // INPUT_PULLUP: basılı = LOW

${MOTOR_FN}
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

void setup() {
${SETUP_PINS}  pinMode(SOL_TAMPON, INPUT_PULLUP); pinMode(SAG_TAMPON, INPUT_PULLUP);
  Serial.begin(9600);
  surus(150, 150);
}

void loop() {
  if (digitalRead(SOL_TAMPON) == LOW || digitalRead(SAG_TAMPON) == LOW) {
    Serial.println("CARPMA");
    surus(-150, -150);
    delay(600);
    surus(0, 0);
    while (true) {}
  }
}
`

const DUZ = `// Düz yol: enkoder tıklarıyla 3,4 m git ve dur (1 tık ≈ 1,04 cm)
${PIN_HEADER}const int ENK_SOL = 2, ENK_SAG = 3;
volatile long tikSol = 0, tikSag = 0;
const float CM_TIK = 1.037;
const float HEDEF_CM = 340;

${MOTOR_FN}
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

void solTik() { tikSol++; }
void sagTik() { tikSag++; }

void setup() {
${SETUP_PINS}  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), solTik, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sagTik, RISING);
  Serial.begin(9600);
}

void loop() {
  float cm = (tikSol + tikSag) / 2.0 * CM_TIK;
  if (cm < HEDEF_CM) {
    int duzelt = constrain((tikSol - tikSag) * 4, -40, 40);   // hızlı giden tekerleği yavaşlat
    surus(200 - duzelt, 200 + duzelt);
  } else {
    surus(0, 0);
  }
  static unsigned long son = 0;
  if (millis() - son > 500) { son = millis(); Serial.print("cm="); Serial.println(cm, 0); }
}
`

export const FREE_STARTERS: Record<string, string> = {
  'cizgi-kolay': LINE, 'cizgi-zor': CIZGI_ZOR, engelli: KACIS, tampon: TAMPON, labirent: KACIS, 'duz-yol': DUZ,
}
export const freeScenes = () => FREE_SCENES()

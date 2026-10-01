import { roverScene } from '../scenes'
import { codeHas, serialHas } from '../goals'
import type { ArenaActivity, Zone } from '../types'
import { rk, type ActivityMap, type RS } from './helpers'

/** Modül 5, hafta 5 (PID; ders 96-100). Anahtar: "robotik:5:<ders>". */

const DRV_PINS = `const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
`
/** Ölü bölgeyi atlayan işaretli sürücü (78. ders): v -255..255, 1 -> %20 PWM. */
const SURUCU = `void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}
`
const OLC = `// Mesafe (cm). Yankı yoksa -1.
float olc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long us = pulseIn(ECHO, HIGH, 25000);
  if (us == 0) return -1;
  return us / 58.0;
}
`

// ---------------------------------------------------------------- sahneler
/** Stadyum pist (saat yönünün tersi); alt düzlükte iki dalgalı "slalom" bölümü var (checks.mjs `pist`). */
function stadium(cx: number, cy: number, L: number, R: number, amp: number, lam: number, basla: number): Array<[number, number]> {
  const p: Array<[number, number]> = []
  const x0 = cx - L / 2, x1 = cx + L / 2, xs = x0 + basla
  for (let x = x0; x <= x1 + 1e-9; x += 0.015) {
    const off = x >= xs && x <= xs + 2 * lam ? amp * Math.sin((2 * Math.PI * (x - xs)) / lam) : 0
    p.push([x, cy - R + off])
  }
  for (let a = -85; a <= 90; a += 5) p.push([x1 + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)])
  p.push([x0, cy + R])
  for (let a = 95; a <= 270; a += 5) p.push([x0 + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)])
  return p
}
function pistScene(id: string, title: string, description: string, R: number, amp: number, lam: number, basla: number, y0: number, timeLimitS: number) {
  const cx = 0.9, cy = 0.45, L = 0.9
  const zones: Zone[] = [
    { id: 'bitis', kind: 'goal', label: 'Bitiş', x: 0.5, y: y0, r: 0.1 },
    { id: 'k1', kind: 'checkpoint', x: cx + L / 2 + R, y: cy, r: 0.1 },
    { id: 'k2', kind: 'checkpoint', x: cx, y: cy + R, r: 0.1 },
    { id: 'k3', kind: 'checkpoint', x: cx - L / 2 - R, y: cy, r: 0.1 },
  ]
  return roverScene({ id, title, description, width: 1.8, height: 0.9, pose: { x: 0.5, y: y0, theta: 0 }, sensors: { line: true }, lines: [stadium(cx, cy, L, R, amp, lam, basla)], zones, timeLimitS })
}

/** Sol tarafta duvar (y = 0,60 + amp sin(2 pi x / 1,2)); robot +x yönünde gider, servo 180 ile sola bakar (checks.mjs `duvar`). */
function wallScene(id: string, title: string, description: string, o: { y: number; amp: number; noise: number; gain?: { left: number; right: number }; timeLimitS: number }) {
  const uzunluk = 3.2
  const walls: Array<[number, number, number, number]> = []
  let prev: [number, number] | null = null
  for (let x = 0; x <= uzunluk + 1e-9; x += 0.1) {
    const p: [number, number] = [x, 0.6 + o.amp * Math.sin((2 * Math.PI * x) / 1.2)]
    if (prev) walls.push([...prev, ...p])
    prev = p
  }
  walls.push([uzunluk, 0, uzunluk, 2], [0, 0.1, uzunluk, 0.1])
  return roverScene({
    id, title, description, width: uzunluk, height: 1, box: false, walls, pose: { x: 0.3, y: o.y, theta: 0 }, sensors: { ultrasonic: true },
    extra: { noiseCm: o.noise, seed: 3, ...(o.gain ? { gain: o.gain } : {}) }, timeLimitS: o.timeLimitS,
  })
}
const frontOf = (snap: unknown) => (snap as RS).frontTrueCm

// ---------------------------------------------------------------- Ders 96: P
const d96: ArenaActivity = {
  intro: 'P kontrol: çizginin konumu (−2…+2) hatadır; direksiyon = Kp x hata. Ovali bir tam tur at. KP’yi değiştirip (8, 85, 210, 830) tur süresine ve direksiyon titreşimine bak.',
  scene: pistScene('r5-96', 'Stadyum pisti', 'Dar virajlı oval, alt düzlükte iki dalgalı bölüm. Bir tam tur at.', 0.17, 0.03, 0.4, 0.2, 0.28, 30),
  starter: () => `${DRV_PINS}const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const float KP = 170.0;            // hata 1 birim olunca direksiyon: 170 PWM
const int TABAN = 200;             // düz giderken her tekerleğin PWM'i
const unsigned long DT = 10;       // kontrol periyodu (ms)

unsigned long son = 0;
float sonYon = 1;                  // çizgi en son hangi taraftaydı

${SURUCU}
// Hata: çizginin konumu, -2...+2. Pozitif = çizgi solda.
float hataOku() {
  // TODO: çizgiyi gören sensörlerin konumlarının ortalamasını al (A0 = +2 ... A4 = -2)
  // TODO: hiçbiri görmüyorsa sonYon * 2.0 döndür; e != 0 ise sonYon'u güncelle
  return 0;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
}

void loop() {
  if (millis() - son < DT) return;     // 10 ms'de bir çalış
  son += DT;

  float e = hataOku();
  // TODO: u = KP * e  (P kontrol)
  // TODO: sol tekerlek TABAN - u, sağ tekerlek TABAN + u ile sürülsün (surucu)
}
`,
  solutionSketch: 'p_cizgi',
  scenario: (s) => { s.until((n) => (n as RS).finishedAtS !== null, 30000); s.advance(500) },
  goals: [
    { id: 'tur', text: 'Pistte bir tam tur at (üç kontrol noktasından geçip bitiş bölgesine dön).', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null },
    { id: 'kayip', text: 'Turu çizgiyi hiç kaybetmeden bitir.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).lineExits === 0 },
    { id: 'sure', text: 'Turu 20 saniyenin altında bitir.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).finishedAtS! < 20 },
    { id: 'p', text: 'Direksiyonu hatayla orantılı yap: u = KP * e.', check: codeHas(/\bKP\s*\*\s*\w+/) },
    { id: 'taban', text: 'Sol tekerleğe TABAN - u, sağ tekerleğe TABAN + u ver.', check: ({ code }) => codeHas(/TABAN\s*-\s*u/)({ code }) && codeHas(/TABAN\s*\+\s*u/)({ code }) },
  ],
}

// ---------------------------------------------------------------- Ders 97: D
const d97: ArenaActivity = {
  intro: 'Duvar takipçisi: sol duvarı 15 cm’de tut (servo 180° = ışın sola). P tek başına aşar; türev (Kd) sakinleştirir, süzgeç (ALFA) gürültüyü keser. Robot 19 cm’den başlıyor, ultrasonik 1 cm gürültülü.',
  scene: wallScene('r5-97', 'Düz duvar', 'Solda düz duvar. Hedef: duvara 15 cm.', { y: 0.41, amp: 0, noise: 1, timeLimitS: 12 }),
  starter: () => `#include <Servo.h>

${DRV_PINS}const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 16.0;             // PWM / cm
const float KD = 3.0;              // PWM / (cm/s)
const float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok
const int TABAN = 170;
const int UMAX = 100;              // direksiyon sınırı
const unsigned long DT = 50;       // 20 ölçüm / saniye

Servo servo;
unsigned long son = 0;
float mesafe = HEDEF;
float sonHata = 0;
float turevSuz = 0;                // süzülmüş türev

${SURUCU}
${OLC}
void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};
  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  servo.write(180);                // ışın sola, duvara dik
  delay(500);
  float ilk = olc();
  if (ilk > 0) mesafe = ilk;
  sonHata = mesafe - HEDEF;        // ilk türev sıçramasını önle
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float m = olc();
  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru

  float e = mesafe - HEDEF;        // + : duvardan çok uzak
  // TODO: turev = (e - sonHata) / dt; sonHata = e;
  // TODO: turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;
  // TODO: u = KP * e + KD * turevSuz; constrain(u, -UMAX, UMAX)
  // TODO: u > 0 ise duvara (sola) dön: sol TABAN - u, sağ TABAN + u
}
`,
  solutionSketch: 'd_duvar',
  runSeconds: 9,
  goals: [
    { id: 'oturdu', text: '5. saniyeden sonra duvara 15 cm (±2 cm) uzaklıkta dur ve orada kal.', behavior: true, check: ({ snap }) => (snap as RS).timeS > 5 && Math.abs(frontOf(snap) - 15) <= 2 },
    { id: 'asim', text: 'Duvara 12 cm’den fazla yaklaşma (aşım yok).', behavior: true, check: ({ snap }) => (snap as RS).timeS > 5 && (snap as RS).minFrontTrueCm >= 12 },
    { id: 'carpma', text: 'Duvara hiç çarpma.', behavior: true, check: ({ snap }) => (snap as RS).timeS > 5 && (snap as RS).collisions === 0 },
    { id: 'turev', text: 'Türev terimini ekle: u = KP * e + KD * turevSuz.', check: codeHas(/\bKD\s*\*/) },
    { id: 'suzgec', text: 'Türevi alçak geçiren süzgeçten geçir (ALFA).', check: codeHas(/\bALFA\s*\*\s*\w+\s*\+\s*\(\s*1\s*-\s*ALFA\s*\)/) },
  ],
}

// ---------------------------------------------------------------- Ders 98: I
const d98: ArenaActivity = {
  intro: 'Sağ motor %15 zayıf: robot kendiliğinden duvardan uzaklaşır, P+D bu sapmayı kapatamaz (kalıcı hata). Integral (Ki) hatayı biriktirip düzeltir; ILIM onu sınırlar. KI’yi 0 yapıp farkı gör.',
  scene: wallScene('r5-98', 'Düz duvar, zayıf sağ motor', 'Solda düz duvar; sağ motor %15 zayıf. Hedef: 15 cm.', { y: 0.45, amp: 0, noise: 0, gain: { left: 1, right: 0.85 }, timeLimitS: 14 }),
  starter: () => `#include <Servo.h>

${DRV_PINS}const int TRIG = 11, ECHO = 12, SERVO_PIN = 4;

const float HEDEF = 15.0;          // duvarla istenen mesafe (cm)
const float KP = 6.0;              // PWM / cm
const float KI = 2.0;              // PWM / (cm x s)
const float KD = 3.0;              // PWM / (cm/s)
const float ILIM = 30.0;           // integral sınırı (cm x s)
const float ALFA = 0.8;
const int TABAN = 170;
const int UMAX = 100;
const unsigned long DT = 50;

Servo servo;
unsigned long son = 0;
float mesafe = HEDEF;
float sonHata = 0;
float turevSuz = 0;
float integral = 0;                // hataların birikimi (cm x s)

${SURUCU}
${OLC}
void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};
  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  servo.write(180);
  delay(500);
  float ilk = olc();
  if (ilk > 0) mesafe = ilk;
  sonHata = mesafe - HEDEF;
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;

  float m = olc();
  if (m > 0) mesafe = m;

  float e = mesafe - HEDEF;
  float turev = (e - sonHata) / dt;
  sonHata = e;
  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;

  // TODO: integral += e * dt; integral'i -ILIM..ILIM arasına sınırla (constrain)
  float u = KP * e + KD * turevSuz;     // TODO: + KI * integral ekle
  u = constrain(u, -UMAX, UMAX);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
`,
  solutionSketch: 'i_duvar',
  runSeconds: 12,
  goals: [
    { id: 'sapma', text: '9. saniyeden sonra duvara 15 cm (±1,5 cm) uzaklıkta kal: kalıcı hata kapansın.', hint: 'Integral terimini ekle; KI * integral u’ya eklenmeli.', behavior: true, check: ({ snap }) => (snap as RS).timeS > 9 && Math.abs(frontOf(snap) - 15) <= 1.5 },
    { id: 'carpma', text: 'Duvara hiç çarpma.', behavior: true, check: ({ snap }) => (snap as RS).timeS > 9 && (snap as RS).collisions === 0 },
    { id: 'ilerle', text: 'Bu sırada robot en az 1,5 m ilerlesin.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 1.5 },
    { id: 'integral', text: 'Integrali biriktir ve sınırla: integral += e * dt; constrain(integral, -ILIM, ILIM).', check: ({ code }) => codeHas(/integral\s*\+=\s*e\s*\*\s*dt/)({ code }) && codeHas(/integral\s*=\s*constrain\s*\(\s*integral/)({ code }) },
    { id: 'ki', text: 'Çıkışa KI * integral terimini ekle.', check: codeHas(/\bKI\s*\*\s*integral/) },
  ],
}

// ---------------------------------------------------------------- Ders 99: ayar (SIMC)
const hizScene = roverScene({
  id: 'r5-99', title: 'Hız ölçüm yolu', description: 'Sol enkoderle tekerlek hızı ölçülür; hedef hız 15 → 25 → 15 cm/s.', width: 8, height: 3, pose: { x: 0.3, y: 1.5, theta: 0 },
  sensors: { encoders: true }, timeLimitS: 8,
})
const d99: ArenaActivity = {
  intro: 'Hız PI kontrolcüsünü SIMC ile ayarla: Kc = (1/k) · τ / (τc + θ), Ti = min(τ, 4(τc + θ)). Ölçülen model k = 0,156, τ = 0,077 s, θ = 0,038 s. Robot 15 → 25 → 15 cm/s hedef hızı çabuk ve aşmadan izlesin.',
  scene: hizScene,
  starter: () => `${DRV_PINS}const int ENK_SOL = 2;

const float TIK_CM = 1.0367;
const unsigned long DT = 20;           // kontrol periyodu (ms)

// Adım cevabından ölçülen model: hız = K x PWM, gecikme + birinci derece
const float K = 0.156;                 // cm/s başına PWM birimi
const float TAU = 0.077;               // s
const float THETA = 0.038;             // s
const float TAUC = 0.038;              // s: istenen kapalı döngü zaman sabiti (hızlı seçim: TAUC = THETA)

// SIMC (Skogestad) ayarı
const float KC = 1.0;                  // TODO: (1 / K) * TAU / (TAUC + THETA)
const float TI = 1.0;                  // TODO: min(TAU, 4.0 * (TAUC + THETA))

volatile unsigned long sonTikUs = 0;
volatile unsigned long aralikUs = 0;
unsigned long son = 0;
float integral = 0;

${SURUCU}
void tik() {
  unsigned long t = micros();
  aralikUs = t - sonTikUs;
  sonTikUs = t;
}

float hizOku() {
  noInterrupts();
  unsigned long aralik = aralikUs;
  unsigned long sonTik = sonTikUs;
  interrupts();
  unsigned long gecen = micros() - sonTik;
  if (aralik == 0 || gecen > 200000UL) return 0;
  if (gecen > aralik) aralik = gecen;
  return TIK_CM * 1000000.0 / aralik;
}

float hedefHiz(unsigned long t) {      // 15 -> 25 -> 15 cm/s
  if (t < 1500) return 15;
  if (t < 3500) return 25;
  return 15;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);
  Serial.begin(115200);
  Serial.print("Kc=");
  Serial.print(KC, 2);
  Serial.print(" Ti=");
  Serial.println(TI, 3);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;
  float dt = DT / 1000.0;
  // TODO: e = hedefHiz(millis()) - hizOku(); PI: u = KC * (e + integral / TI)
  // TODO: integral += e * dt; iki tekerleğe aynı u ile surucu(...)
}
`,
  solutionSketch: 'simc_hiz',
  runSeconds: 6,
  goals: [
    { id: 'formul', text: 'SIMC formülüyle Kc ≈ 6,5 ve Ti ≈ 0,077 s hesapla ve seri monitöre yaz.', behavior: true, check: ({ snap }) => {
      const m = snap.serial.match(/Kc=([\d.]+) Ti=([\d.]+)/)
      return !!m && Math.abs(Number(m[1]) - 6.49) < 0.1 && Math.abs(Number(m[2]) - 0.077) < 0.002
    } },
    { id: 'yukari', text: '2,5-3,4 sn arasında hız 25 cm/s’ye (±2) otursun.', behavior: true, check: ({ snap }) => (snap as RS).timeS > 2.5 && (snap as RS).timeS < 3.5 && Math.abs((snap as RS).v - 0.25) < 0.02 },
    { id: 'asagi', text: '4,5 sn sonra hız 15 cm/s’ye (±2) düşsün.', behavior: true, check: ({ snap }) => (snap as RS).timeS > 4.5 && Math.abs((snap as RS).v - 0.15) < 0.02 },
    { id: 'simc', text: 'Kc ve Ti’yi SIMC formülüyle (TAUC + THETA) hesapla.', check: codeHas(/\(\s*TAUC\s*\+\s*THETA\s*\)/) },
  ],
}

// ---------------------------------------------------------------- Ders 100: proje
const d100: ArenaActivity = {
  intro: 'Proje: PID çizgi izleyici. Dar virajlı (R = 12 cm), dik slalomlu zor pistte bir tam tur at; her 0,5 sn’de hata ve çıkışı yazdır. Kp, Ki, Kd ve süzgeci ayarla.',
  scene: pistScene('r5-100', 'Zor stadyum pisti', 'Dar viraj (12 cm) ve dik slalom. Bang-bang bu pistte çizgiyi kaybeder.', 0.12, 0.045, 0.3, 0.15, 0.33, 30),
  starter: () => `${DRV_PINS}const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const float KP = 240.0;            // PWM / sensör aralığı
const float KI = 0.0;              // PWM / (aralık x s)
const float KD = 0.5;              // PWM / (aralık/s)
const float ALFA = 0.9;            // türev süzgeci
const float ILIM = 20.0;           // integral sınırı
const int TABAN = 255;
const unsigned long DT = 10;       // kontrol periyodu (ms)

unsigned long son = 0;
unsigned long sonYazdir = 0;
float sonYon = 1;
float integral = 0;
float sonHata = 0;
float turevSuz = 0;

${SURUCU}
// Çizginin konumu: -2...+2 (pozitif = çizgi solda). Kayıpsa son yöne doğru 2.
float hataOku() {
  // TODO: 96. dersteki hataOku()
  return 0;
}

// PID: çıkış = Kp x hata + Ki x (hata birikimi) + Kd x (hatanın değişim hızı)
float pid(float e, float dt) {
  // TODO: integral (sınırlı), süzülmüş türev ve toplam
  return 0;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (millis() - son < DT) return;
  son += DT;

  float e = hataOku();
  float u = pid(e, DT / 1000.0);

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);

  // TODO: her 500 ms'de "hata=<e> u=<u>" yazdır
}
`,
  solutionSketch: 'proje_cizgi_pid',
  scenario: (s) => { s.until((n) => (n as RS).finishedAtS !== null, 30000); s.advance(600) },
  goals: [
    { id: 'tur', text: 'Zor pistte bir tam tur at.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null },
    { id: 'kayip', text: 'Çizgiyi hiç kaybetme.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).lineExits === 0 },
    { id: 'sure', text: 'Turu 15 saniyenin altında bitir.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).finishedAtS! < 15 },
    { id: 'rapor', text: 'Ayar için "hata=.. u=.." değerlerini seri monitöre yazdır.', behavior: true, check: serialHas(/hata=-?[\d.]+ u=-?\d+/) },
    { id: 'pid', text: 'Üç terimi de kullan: KP * e, KI * integral ve KD * turevSuz.', check: ({ code }) => codeHas(/\bKP\s*\*\s*e\b/)({ code }) && codeHas(/\bKI\s*\*\s*integral/)({ code }) && codeHas(/\bKD\s*\*\s*turevSuz/)({ code }) },
  ],
}

export const R_H5_ACTIVITIES: ActivityMap = {
  [rk(5, 1)]: d96, [rk(5, 2)]: d97, [rk(5, 3)]: d98, [rk(5, 4)]: d99, [rk(5, 5)]: d100,
}

import { roverScene } from '../scenes'
import { codeHas, serialHas } from '../goals'
import type { ArenaActivity, ArenaSnapshot } from '../types'
import { rk, type ActivityMap, type RS } from './helpers'

/** Modül 5, hafta 4 (Enkoder ve odometri; ders 91-95). Anahtar: "robotik:4:<ders>". */

const TIK_CM = (2 * Math.PI * 3.3) / 20 // 1,0367 cm
const ENC_PINS = `const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;
`
const ENC_COUNT = `volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

// Sayaç 2 bayt: okurken kesme araya girmesin
unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}
`
const ENC_SETUP = `  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);
`

const num = (s: string, re: RegExp): number | null => { const m = s.match(re); return m ? Number(m[1]) : null }
const bitti = (snap: ArenaSnapshot) => /BITTI/.test(snap.serial)

// ---------------------------------------------------------------- Ders 91: tekerlek enkoderi, tık -> mesafe
const d91: ArenaActivity = {
  intro: 'Enkoder tıklarını kesmeyle say, tıkı santimetreye çevir. Robot 20, 50 ve 100 cm gitsin; her seferinde ölçtüğü mesafeyi yazsın. Panelde sol/sağ tık sayısını izle.',
  scene: roverScene({ id: 'r4-91', title: 'Ölçüm alanı', description: '4 x 4 m boş alan. Enkoder sol D2, sağ D3 (tekerlekte 20 yuva).', width: 4, height: 4, pose: { x: 0.5, y: 2, theta: 0 }, sensors: { encoders: true }, zones: [{ id: 'baslangic', kind: 'start', x: 0.5, y: 2, r: 0.1 }], timeLimitS: 30 }),
  starter: () => `${ENC_PINS}const float TIK_CM = 2 * PI * 3.3 / 20;   // bir tıkın mesafesi (cm)

${ENC_COUNT}
void surus(int pwm) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, pwm);
  analogWrite(EN_SAG, pwm);
}

// istenen cm kadar ileri git, ölçülen mesafeyi (cm) döndür
float ileriCm(float istenen) {
  // TODO: başlangıç tıkını kaydet; hedef tık = istenen / TIK_CM (yuvarla);
  //       sürerken tık farkı hedefe varana kadar bekle; dur; 500 ms bekle; ölçülen = tık farkı * TIK_CM
  return 0;
}

void setup() {
${ENC_SETUP}  // TODO: 20, 50, 100 cm için ileriCm çağır; "Istenen: 20 cm  Olculen: 20.7 cm" yaz; sonunda "BITTI"
}

void loop() {}
`,
  solutionSketch: 'tik_hedef_cm',
  scenario: (s) => { s.until((n) => bitti(n), 30000); s.advance(300) },
  goals: [
    { id: 'kesme', text: 'Tıkları kesmeyle say: attachInterrupt ile D2 ve D3.', check: codeHas(/attachInterrupt\s*\(/) },
    { id: 'satirlar', text: '20, 50 ve 100 cm için "Istenen: .. cm  Olculen: .. cm" satırlarını yazdır, sonunda BITTI.', behavior: true, check: ({ snap }) => /Istenen: 20 cm\s+Olculen: [\d.]+ cm[\s\S]*Istenen: 50 cm\s+Olculen: [\d.]+ cm[\s\S]*Istenen: 100 cm\s+Olculen: [\d.]+ cm[\s\S]*BITTI/.test(snap.serial) },
    { id: 'dogruluk', text: 'Ölçülen mesafe istenenden 0-2 cm fazla olsun (tık yuvarlaması + durma payı).', behavior: true, check: ({ snap }) => {
      const v = [...snap.serial.matchAll(/Olculen: ([\d.]+) cm/g)].map((m) => Number(m[1]))
      return v.length === 3 && [20, 50, 100].every((w, i) => v[i] - w >= 0 && v[i] - w < 2)
    } },
    { id: 'gercek', text: 'Ölçülen üç mesafenin toplamı, robotun gerçek yolu ile 4 cm içinde uyuşsun.', hint: 'Panelde "Yol" gerçek mesafeyi gösterir.', behavior: true, check: ({ snap }) => {
      const v = [...snap.serial.matchAll(/Olculen: ([\d.]+) cm/g)].map((m) => Number(m[1]))
      return v.length === 3 && bitti(snap) && Math.abs(v.reduce((a, b) => a + b, 0) - (snap as RS).distanceM * 100) < 4
    } },
    { id: 'tik', text: 'Robot iki tekerlekle de aynı sayıda (±2) tık atsın.', behavior: true, check: ({ snap }) => { const r = snap as RS; return r.ticksL > 150 && Math.abs(r.ticksL - r.ticksR) <= 2 } },
  ],
}

// ---------------------------------------------------------------- Ders 92: kesmeyle sayma ve hız
const d92: ArenaActivity = {
  intro: 'Her 100 ms\'de tık farkından hız hesapla ve "t=.. dtik=.. vSol=.. vSag=.." yaz. Pencere kısa olduğu için hız basamaklı (1 tık = 10,4 cm/s) çıkar.',
  scene: roverScene({ id: 'r4-92', title: 'Geniş alan', width: 8, height: 8, pose: { x: 0.5, y: 4, theta: 0 }, sensors: { encoders: true }, zones: [{ id: 'baslangic', kind: 'start', x: 0.5, y: 4, r: 0.1 }], timeLimitS: 8 }),
  starter: () => `${ENC_PINS}const float TIK_M = 2 * PI * 0.033 / 20;
const unsigned long PENCERE_MS = 100;

${ENC_COUNT}
unsigned int oncekiSol = 0, oncekiSag = 0;
unsigned long sonOlcum = 0;

void setup() {
${ENC_SETUP}  // TODO: iki motoru ileri yönde PWM 150 ile sür
}

void loop() {
  // TODO: her PENCERE_MS'de tık farkını (dSol, dSag) bul;
  //       hız = fark * TIK_M / (PENCERE_MS / 1000.0)
  //       "t=<ms> dtik=<fark> vSol=<cm/s> vSag=<cm/s>" yaz
}
`,
  solutionSketch: 'hiz_olc',
  runSeconds: 3,
  goals: [
    { id: 'kesme', text: 'Tıkları kesmeyle say (attachInterrupt).', check: codeHas(/attachInterrupt\s*\(/) },
    { id: 'satirlar', text: '100 ms\'de bir "t=.. dtik=.. vSol=.. vSag=.." satırı yazdır (3 saniyede en az 20 satır).', behavior: true, check: ({ snap }) => (snap.serial.match(/t=\d+ dtik=\d+ vSol=[\d.]+ vSag=[\d.]+/g) ?? []).length >= 20 },
    { id: 'nicemleme', text: 'Hız = tık sayısı × 10,37 cm/s olsun (1 tık = 1,04 cm, pencere 0,1 sn).', behavior: true, check: ({ snap }) => {
      const L = [...snap.serial.matchAll(/t=\d+ dtik=(\d+) vSol=([\d.]+)/g)]
      return L.length >= 20 && L.every((m) => Math.abs(Number(m[2]) - Number(m[1]) * TIK_CM * 10) < 0.15)
    } },
    { id: 'dalgalanma', text: 'Hız oturduktan sonra 100 ms penceresinde tık sayısı 2 ile 3 arasında dalgalanır; bunu çıktıda gör.', behavior: true, check: ({ snap }) => new Set([...snap.serial.matchAll(/t=(\d+) dtik=(\d+)/g)].filter((m) => Number(m[1]) >= 1000).map((m) => m[2])).size >= 2 },
    { id: 'hiz', text: 'Ölçülen hız gerçek hıza (yaklaşık 28,8 cm/s) bir tık kadar yakın olsun.', behavior: true, check: ({ snap }) => {
      const L = [...snap.serial.matchAll(/vSol=([\d.]+)/g)].map((m) => Number(m[1]))
      const real = Math.abs((snap as RS).v) * 100
      return L.length >= 20 && real > 27 && real < 31 && Math.abs(L.at(-1)! - real) < 11
    } },
  ],
}

// ---------------------------------------------------------------- Ders 93: düz gitme
const d93: ArenaActivity = {
  intro: 'Sağ motor %10 zayıf: ham sürüşte robot sağa kıvrılır. Sol-sağ tık farkına orantılı (P) düzeltme ekle, robotu 2 m düz götür. Sapmayı panelde konumdan izle.',
  scene: roverScene({ id: 'r4-93', title: 'Düz yol (zayıf sağ motor)', description: 'Sağ tekerlek %10 yavaş. Hedef: 2 m ileri, yana en çok 10 cm sapma.', width: 6, height: 6, pose: { x: 0.5, y: 3, theta: 0 }, sensors: { encoders: true }, extra: { gain: { left: 1, right: 0.9 } }, zones: [{ id: 'baslangic', kind: 'start', x: 0.5, y: 3, r: 0.1 }], timeLimitS: 20 }),
  starter: () => `${ENC_PINS}const int HEDEF_TIK = 193;     // yaklaşık 2 m
const int BAZ_PWM = 200;
const float KP = 20.0;          // tık farkı başına PWM

${ENC_COUNT}
void setup() {
${ENC_SETUP}  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void loop() {
  int sol = oku(tikSol), sag = oku(tikSag);
  // TODO: ortalama tık HEDEF_TIK'e varınca motorları durdur, 600 ms bekle,
  //       "Sol tik: .." "Sag tik: .." "BITTI" yaz ve dur
  // TODO: hata = sol - sag; pwmSol = BAZ_PWM - KP * hata, pwmSag = BAZ_PWM + KP * hata (0..255)
  analogWrite(EN_SOL, BAZ_PWM);
  analogWrite(EN_SAG, BAZ_PWM);
}
`,
  solutionSketch: 'duz_p',
  scenario: (s) => { s.until((n) => bitti(n), 20000); s.advance(300) },
  goals: [
    { id: 'bitti', text: 'Yaklaşık 2 m yol al (193 tık) ve "BITTI" yaz.', behavior: true, check: ({ snap }) => bitti(snap) && Math.abs((snap as RS).x - 0.5 - 2.02) < 0.1 },
    { id: 'sapma', text: 'Yana en çok 10 cm sapmış ol (düzeltme olmadan ~137 cm sapar).', behavior: true, check: ({ snap }) => bitti(snap) && Math.abs((snap as RS).y - 3) < 0.1 },
    { id: 'tik', text: 'Sol ve sağ tık sayıları en çok 2 farklı olsun.', behavior: true, check: ({ snap }) => {
      const a = num(snap.serial, /Sol tik: (\d+)/), b = num(snap.serial, /Sag tik: (\d+)/)
      return a !== null && b !== null && Math.abs(a - b) <= 2
    } },
    { id: 'yon', text: 'Robot başladığı yöne (±5°) bakarak dursun.', behavior: true, check: ({ snap }) => bitti(snap) && Math.abs((snap as RS).thetaDeg) < 5 },
    { id: 'duzeltme', text: 'Kodda tık farkını (sol - sag) hesapla ve iki motora ters işaretle ekle.', check: codeHas(/\b(?:sol|tikSol|oku\s*\(\s*tikSol\s*\))\s*-\s*(?:sag|tikSag|oku\s*\(\s*tikSag\s*\))/) },
  ],
}

// ---------------------------------------------------------------- Ders 94: odometri
const d94: ArenaActivity = {
  intro: 'Tıklardan robotun konumunu ve yönünü kestir (odometri). Robot 5 adımlık bir yol izler; her adımda tahmini x, y, açıyı yazar. Panelde gerçek ve tahmini konumu karşılaştır.',
  scene: roverScene({ id: 'r4-94', title: 'Odometri alanı', description: 'Tahmin başlangıca göre cm cinsindendir; robot (0,5 m; 0,5 m) noktasından başlar.', width: 4, height: 4, pose: { x: 0.5, y: 0.5, theta: 0 }, sensors: { encoders: true }, zones: [{ id: 'baslangic', kind: 'start', x: 0.5, y: 0.5, r: 0.1 }], timeLimitS: 45 }),
  starter: () => `${ENC_PINS}const float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)
const float L = 0.12;                      // iki tekerlek arası (m)

${ENC_COUNT}
float x = 0, y = 0, th = 0;                // tahmin: m, m, rad
unsigned int oncekiSol = 0, oncekiSag = 0;

void odometriGuncelle() {
  // TODO: yeni tıkları oku; dsSol, dsSag = tık farkı * TIK_M
  //       ds = (dsSol + dsSag) / 2; dth = (dsSag - dsSol) / L
  //       x += ds * cos(th + dth / 2); y += ds * sin(th + dth / 2); th += dth
}

void setup() {
${ENC_SETUP}  // TODO: ileri 1 m, yerinde dön, ... 5 adım; her adımdan sonra "1 x=100.8 y=0.0 aci=0.0" biçiminde yaz
  // TODO: sonunda "BITTI"
}

void loop() {}
`,
  solutionSketch: 'odometri_temel',
  scenario: (s) => { s.until((n) => bitti(n), 45000); s.advance(300) },
  goals: [
    { id: 'adimlar', text: 'Beş adımın her birinden sonra "N x=.. y=.. aci=.." satırını yazdır, sonunda BITTI.', behavior: true, check: ({ snap }) => /^1 x=[-\d.]+ y=[-\d.]+ aci=[-\d.]+/m.test(snap.serial) && /^5 x=[-\d.]+ y=[-\d.]+ aci=[-\d.]+/m.test(snap.serial) && bitti(snap) },
    { id: 'ilk', text: 'İlk adımda robot yaklaşık 1 m ileri gitmiş olarak yazdırılsın (x ≈ 100-103 cm).', behavior: true, check: serialHas(/1 x=10[0-3]\.\d y=0\.0 aci=0\.0/) },
    { id: 'tahmin', text: 'Son tahmin gerçek konuma 25 cm içinde olsun.', behavior: true, check: ({ snap }) => {
      const m = snap.serial.match(/^5 x=(-?[\d.]+) y=(-?[\d.]+) aci=(-?[\d.]+)/m)
      const r = snap as RS
      return !!m && bitti(snap) && Math.hypot(Number(m[1]) - (r.x - 0.5) * 100, Number(m[2]) - (r.y - 0.5) * 100) < 25
    } },
    { id: 'yon', text: 'Tahmin edilen son yön gerçek yönden en çok 12° farklı olsun.', behavior: true, check: ({ snap }) => {
      const m = snap.serial.match(/^5 x=(-?[\d.]+) y=(-?[\d.]+) aci=(-?[\d.]+)/m)
      if (!m || !bitti(snap)) return false
      let d = (Number(m[3]) - (snap as RS).thetaDeg) % 360
      if (d > 180) d -= 360; if (d < -180) d += 360
      return Math.abs(d) < 12
    } },
    { id: 'formul', text: 'Dönmeyi tekerlek yollarının farkından hesapla: dth = (dsSag - dsSol) / L.', check: codeHas(/\(\s*\w+\s*-\s*\w+\s*\)\s*\/\s*L\b/) },
  ],
}

// ---------------------------------------------------------------- Ders 95: proje, kare ve sekiz
const d95: ArenaActivity = {
  intro: 'Önce 0,5 m kenarlı bir kare, sonra sekiz (8) çiz; odometri ve P düzeltmesiyle başladığın noktaya dön. Sağ motor %7 zayıf. Robotun izi turuncu çizgi olarak arenada kalır.',
  scene: roverScene({ id: 'r4-95', title: 'Kare ve sekiz', description: 'Başlangıç ortada. Sağ tekerlek %7 yavaş; düzeltme olmadan şekiller kapanmaz.', width: 2, height: 2, pose: { x: 1, y: 1, theta: 0 }, sensors: { encoders: true }, extra: { gain: { left: 1, right: 0.93 } }, zones: [{ id: 'baslangic', kind: 'start', x: 1, y: 1, r: 0.05 }], timeLimitS: 70 }),
  starter: () => `${ENC_PINS}const float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)
const float L = 0.12;                      // iki tekerlek arası (m)
const int OLU_BOLGE = 51;                  // ders 78
const float KP = 1000.0;                   // yay hatası (m) başına PWM

${ENC_COUNT}
float x = 0, y = 0, th = 0;                // odometri tahmini

void odometriGuncelle() {
  // TODO: 94. dersteki odometri
}

void ileri(float metre) {
  // TODO: tık farkına (P) göre düzeltmeli düz gitme (93. ders)
}

void don(float derece) {
  // TODO: yerinde dön (th hedefine varana kadar)
}

void setup() {
${ENC_SETUP}  // TODO: kare: 4 x (ileri(0.5), don(90)); "KARE hata(tahmin) cm: .. aci: .." yaz
  // TODO: sekiz: iki daire/yay; her 100 ms "IZ <x_cm> <y_cm>" yaz
  // TODO: sonunda "BITTI"
}

void loop() {}
`,
  solutionSketch: 'kare_sekiz',
  scenario: (s) => { s.until((n) => bitti(n), 70000); s.advance(300) },
  goals: [
    { id: 'kare', text: 'Kareyi bitirince "KARE hata(tahmin) cm: .." yaz; tahmini kapanış hatası 5 cm altında olsun.', behavior: true, check: ({ snap }) => { const v = num(snap.serial, /KARE hata\(tahmin\) cm: ([\d.]+)/); return v !== null && v < 5 } },
    { id: 'sekiz', text: 'Sekizi de çiz: "IZ x y" noktalarını yaz (en az 100 nokta, yükseklik yaklaşık 1 m).', behavior: true, check: ({ snap }) => {
      const ys = [...snap.serial.matchAll(/IZ (-?\d+) (-?\d+)/g)].map((m) => Number(m[2]) / 100)
      return ys.length > 100 && Math.max(...ys) - Math.min(...ys) > 0.9 && Math.max(...ys) - Math.min(...ys) < 1.15
    } },
    { id: 'kapanis', text: 'BITTI yaz ve başlangıç noktasının 6 cm yakınında dur.', behavior: true, check: ({ snap }) => bitti(snap) && Math.hypot((snap as RS).x - 1, (snap as RS).y - 1) < 0.06 },
    { id: 'carpma', text: 'Duvara hiç çarpma.', behavior: true, check: ({ snap }) => bitti(snap) && (snap as RS).collisions === 0 },
    { id: 'yon', text: 'Şekiller bitince robot başlangıç yönüne (±8°) bakmalı.', behavior: true, check: ({ snap }) => bitti(snap) && Math.abs((snap as RS).thetaDeg) < 8 },
  ],
}

export const R_H4_ACTIVITIES: ActivityMap = {
  [rk(4, 1)]: d91, [rk(4, 2)]: d92, [rk(4, 3)]: d93, [rk(4, 4)]: d94, [rk(4, 5)]: d95,
}

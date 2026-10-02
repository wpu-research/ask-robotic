import { armScene } from '../arm-scenes'
import { roverScene } from '../scenes'
import { codeHas, serialHas } from '../goals'
import type { ArenaActivity, ArmSnapshot } from '../types'
import { PIN_HEADER, SETUP_PINS, rk, type ActivityMap, type RS } from './helpers'

/**
 * Modül 5, hafta 8 (Bitirme robotu; ders 111-115). Anahtar: "robotik:8:<ders>".
 * 112 ve 113 için üç yoldan (A araç, B kol, C takip) en genel olan A yolu seçildi; intro'da diğerleri anılır.
 */

const A_ARAC = `// Ders 113 çözümü (A yolu); KP, arenadaki 2,4 cm aralıklı sensör dizisine göre ayarlandı
// Yol A: çizgiyi izle, çizgi bitince engelden kaçarak ilerle, bitiş çizgisinde dur.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;          // PWM'in %20'si: altında tekerlek dönmez
const int TABAN = 150;             // düz giderken hız
const float KP = 46.0;             // çizgi konumu başına hız farkı
const float ENGEL_CM = 28.0;       // bundan yakınsa engel var
const unsigned long KAYIP_MS = 300;   // çizgisiz geçen bu süre = çizgi bitti
const unsigned long DONUS_MS = 420;   // yaklaşık 90 derece dönüş süresi (ölçerek bulundu)
const unsigned long YAN_MS = 2000;    // engelin yanından gitme süresi

enum Durum { CIZGI_IZLE, SERBEST, SOLA_DON, YANA_GIT, SAGA_DON, BITTI };
Durum durum = CIZGI_IZLE;
unsigned long durumBasla = 0;
unsigned long sonCizgi = 0;
bool cizgiGordu = false;

float mesafeler[3] = {400, 400, 400};
unsigned long sonOlcum = 0;

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;   // yankı yoksa "çok uzak"
}

// Son 3 ölçümün ortancası (tek bir hatalı okuma kararı bozmaz)
float mesafe() {
  mesafeler[0] = mesafeler[1];
  mesafeler[1] = mesafeler[2];
  mesafeler[2] = tekOlcum();
  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

// Çizgi konumu: -2 ... +2 (artı = çizgi solda). Kaç sensör çizgide: sayi
float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {   // çizgi ~860, zemin ~164
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void durumDegis(Durum yeni) {
  durum = yeni;
  durumBasla = millis();
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  int sayi;
  float konum = cizgiKonum(sayi);

  // Mesafeyi 60 ms'de bir ölç
  static float onde = 400;
  if (simdi - sonOlcum >= 60) {
    sonOlcum = simdi;
    onde = mesafe();
  }

  switch (durum) {
    case CIZGI_IZLE:
      if (sayi > 0) {
        cizgiGordu = true;
        sonCizgi = simdi;
        int fark = (int)(KP * konum);
        surus(TABAN - fark, TABAN + fark);
      } else if (cizgiGordu && simdi - sonCizgi > KAYIP_MS) {
        durumDegis(SERBEST);
        Serial.println("durum: SERBEST");
      }
      // çizgi hiç görülmediyse (başlangıç) son komut sürer
      break;

    case SERBEST:
      if (sayi >= 3) {
        surus(0, 0);
        durumDegis(BITTI);
        Serial.println("durum: BITTI");
      } else if (onde < ENGEL_CM) {
        durumDegis(SOLA_DON);
      } else {
        surus(TABAN, TABAN);
      }
      break;

    case SOLA_DON:
      surus(-TABAN, TABAN);
      if (simdi - durumBasla >= DONUS_MS) durumDegis(YANA_GIT);
      break;

    case YANA_GIT:
      surus(TABAN, TABAN);
      if (simdi - durumBasla >= YAN_MS) durumDegis(SAGA_DON);
      break;

    case SAGA_DON:
      surus(TABAN, -TABAN);
      if (simdi - durumBasla >= DONUS_MS) durumDegis(SERBEST);
      break;

    case BITTI:
      surus(0, 0);
      break;
  }
}
`

const srl = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
const cmd = (text: string, label = text.trim()) => ({ label, text })

const MOTOR_DEAD = `const int OLU_BOLGE = 51;      // PWM'in %20'si: altında tekerlek dönmez

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));   // ölü bölgeyi atla
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}
`

// ---------------------------------------------------------------- Ders 111: proje seçimi, kabul ölçütleri
const d111: ArenaActivity = {
  intro: 'Üç yolun (A araç, B kol, C takip) kabul ölçütünü kodla: ölçüm sonucunu seri monitörden gir (ör. "A 0 1", "B 4.9", "C 17 23"), program GECTI ya da KALDI yazsın. Robot sürülmez; bu ders ölçütleri sayıya dökmeyi çalıştırır.',
  scene: roverScene({ id: 'r8-111', title: 'Bekleme alanı', description: 'Bu derste robot hareket etmez; kabul ölçütleri seri monitörde sınanır.', width: 2, height: 1, pose: { x: 1, y: 0.5, theta: 0 }, timeLimitS: 20 }),
  quickSend: ['A 0 1', 'A 1 1', 'B 4.9', 'B 5', 'C 17 23', 'C 16.9 20'].map((t) => cmd(`${t}\n`, t)),
  starter: () => `// Ölçüm sonuçlarını seri porttan gir, kabul ölçütüne göre GEÇTİ / KALDI yazsın.
//   A <carpma> <bitti>      örnek: A 0 1      (bitti: 1 = parkuru bitirdi)
//   B <en_buyuk_hata_mm>    örnek: B 3.2
//   C <en_kucuk_cm> <en_buyuk_cm>   örnek: C 18.4 21.9
const float KOL_ESIK_MM = 5.0;       // hata bunun ALTINDA olmalı
const float TAKIP_HEDEF_CM = 20.0;
const float TAKIP_PAY_CM = 3.0;

void sonucYaz(char yol, bool gecti) {
  Serial.print("yol ");
  Serial.print(yol);
  Serial.println(gecti ? ": GECTI" : ": KALDI");
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  Serial.println("hazir");
}

void loop() {
  if (Serial.available() == 0) return;
  char yol = Serial.read();
  // TODO: A -> parseInt ile çarpma ve bitti; çarpma 0 VE bitti 1 ise geçti
  // TODO: B -> parseFloat ile hata; KOL_ESIK_MM'den KÜÇÜKSE geçti (5,0 geçmez)
  // TODO: C -> en küçük ve en büyük mesafe; ikisi de 20 ± 3 cm içindeyse geçti (sınırlar dahil)
}
`,
  solutionSketch: 'kabul_olcut',
  scenario: (s) => {
    s.advance(300)
    for (const t of ['A 0 1', 'A 1 1', 'B 4.9', 'B 5.0', 'C 17 23', 'C 16.9 20']) { s.sendSerial(`${t}\n`); s.advance(300) }
  },
  goals: [
    { id: 'hazir', text: 'Açılışta "hazir" yaz.', behavior: true, check: serialHas(/^hazir/m) },
    { id: 'a', text: 'A yolu: "A 0 1" GECTI, "A 1 1" (bir çarpma) KALDI olsun.', behavior: true, check: ({ snap }) => /yol A: GECTI/.test(snap.serial) && /yol A: KALDI/.test(snap.serial) },
    { id: 'b', text: 'B yolu: 4.9 mm geçsin, 5.0 mm kalsın (ölçüt "5 mm’den az").', behavior: true, check: ({ snap }) => { const l = srl(snap.serial).filter((x) => /^yol B/.test(x)); return l[0] === 'yol B: GECTI' && l[1] === 'yol B: KALDI' } },
    { id: 'c', text: 'C yolu: "C 17 23" GECTI (sınır dahil), "C 16.9 20" KALDI olsun.', behavior: true, check: ({ snap }) => { const l = srl(snap.serial).filter((x) => /^yol C/.test(x)); return l[0] === 'yol C: GECTI' && l[1] === 'yol C: KALDI' } },
    { id: 'sabit', text: 'Ölçütleri en üstte const olarak tanımla (KOL_ESIK_MM, TAKIP_HEDEF_CM, TAKIP_PAY_CM).', check: codeHas(/const\s+float\s+KOL_ESIK_MM/) },
  ],
}

// ---------------------------------------------------------------- Ders 112: alt sistemler (A yolu)
const d112: ArenaActivity = {
  variant: { id: 'arac', label: 'A: Araç' },
  intro: 'A yolu alt sistem testi: sürüş, mesafe ve çizgi modüllerini seri komutla tek tek sına (i ileri, g geri, s sola, d sağa, m mesafe, c çizgi). B (robot kol) ve C (takip) yollarının alt sistem etkinlikleri aşağıdaki yol sekmelerindedir. Robotu kaydırıp çizgi konumunu oku.',
  scene: roverScene({
    id: 'r8-112', title: 'Alt sistem bankı', description: 'Çizgi ve 94 cm ötede dikey bir duvar. Robotu sürükleyerek çizgi konumunu dene.',
    pose: { x: 0.5, y: 1, theta: 0 }, sensors: { ultrasonic: true, line: true }, lines: [[[0.2, 1], [1.8, 1]]], walls: [[1.5, 0.2, 1.5, 1.8]], movable: true, timeLimitS: 25,
  }),
  quickSend: ['m', 'c', 'i', 'g', 's', 'd'].map((t) => cmd(t)),
  starter: () => `${PIN_HEADER}const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};
const int TABAN = 150;

${MOTOR_DEAD}
// ---- MESAFE MODÜLÜ ----
float tekOlcum() {
  // TODO: TRIG darbesi, pulseIn(ECHO, HIGH, 15000); yankı yoksa 400
  return 400.0;
}

// ---- ÇİZGİ MODÜLÜ ----
// Konum -2 ... +2 (artı = çizgi solda). sayi = çizgiyi gören sensör sayısı.
float cizgiKonum(int &sayi) {
  // TODO: sensör > 512 ise çizgide; toplam += 2 - i; ortalamayı döndür
  sayi = 0;
  return 0;
}

void setup() {
${SETUP_PINS}  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  Serial.println("hazir");
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  // TODO: i = 1 sn ileri ("ileri bitti"), g = 1 sn geri, s = 420 ms sola ("sol bitti"), d = 420 ms sağa
  // TODO: m -> "mesafe=94.0" ; c -> "konum=0.0 sayi=1"
}
`,
  solutionSketch: 'a_alt_sistem',
  scenario: (s) => {
    s.advance(300)
    s.sendSerial('m'); s.advance(300)
    s.sendSerial('c'); s.advance(300)
    s.place({ y: 1.024 }); s.advance(50); s.sendSerial('c'); s.advance(300)
    s.place({ y: 1 })
    s.sendSerial('i'); s.advance(1500)
    s.sendSerial('g'); s.advance(1500)
    s.sendSerial('s'); s.advance(900)
    s.sendSerial('d'); s.advance(900)
  },
  goals: [
    { id: 'mesafe', text: 'Mesafe modülü: duvar 94 cm uzakta, "mesafe=" değeri 92-96 arası olsun.', behavior: true, check: ({ snap }) => { const m = snap.serial.match(/mesafe=([\d.]+)/); return !!m && Math.abs(Number(m[1]) - 94) < 2 } },
    { id: 'cizgi', text: 'Çizgi modülü: ortadayken "konum=0.0 sayi=1" yaz; robotu yana kaydırınca konum değişsin.', behavior: true, check: ({ snap }) => /konum=0\.0+ sayi=1/.test(snap.serial) && /konum=-?[1-9][\d.]* sayi=1/.test(snap.serial) },
    { id: 'ileri', text: 'Sürüş modülü: "i" ile 1 sn ileri git ve "ileri bitti" yaz (15-30 cm).', behavior: true, check: ({ snap }) => /ileri bitti/.test(snap.serial) && (snap as RS).distanceM >= 0.15 },
    { id: 'geri', text: '"g" ile geri git ("geri bitti").', behavior: true, check: serialHas(/geri bitti/) },
    { id: 'don', text: '420 ms’lik "s" ve "d" dönüşleri yaklaşık 90° olsun: toplam dönüş en az 150°.', behavior: true, check: ({ snap }) => /sol bitti[\s\S]*sag bitti/.test(snap.serial) && (snap as RS).turnedDeg >= 150 },
  ],
}

// ---------------------------------------------------------------- Ders 113: entegrasyon ve test (A yolu)
const d113: ArenaActivity = {
  variant: { id: 'arac', label: 'A: Araç' },
  intro: 'A yolu entegrasyonu: çizgiyi izle, serbest alanda ilerle, engel duvarını yan geçip bitiş çizgisinde dur. Her durumu "durum: ..." diye yaz. B (robot kol) ve C (takip) yollarının etkinlikleri aşağıdaki yol sekmelerindedir.',
  scene: roverScene({
    id: 'r8-113', title: 'A yolu parkuru', description: 'Çizgi, serbest alan, engel duvarı ve bitiş çizgisi.',
    width: 2.4, height: 1.6, pose: { x: 0.25, y: 0.66, theta: 0 }, sensors: { line: true, ultrasonic: true, bumpers: true },
    lines: [[[0.2, 0.7], [0.8, 0.7], [1.1, 0.9], [1.3, 0.9]], [[2.05, 0.3], [2.05, 1.5]]], walls: [[1.75, 0.5, 1.75, 1.15]],
    extra: { noiseCm: 1, seed: 3 },
    zones: [{ id: 'bitis', kind: 'goal', label: 'Bitiş', x: 2.05, y: 1.0, r: 0.5 }], timeLimitS: 30,
  }),
  starter: () => `${PIN_HEADER}const int TRIG = 11, ECHO = 12;
const int CIZGI[5] = {A0, A1, A2, A3, A4};
const int TABAN = 150;             // düz giderken hız
const float KP = 55.0;             // çizgi konumu başına hız farkı
const float ENGEL_CM = 28.0;       // bundan yakınsa engel var
const unsigned long KAYIP_MS = 300;   // çizgisiz geçen bu süre = çizgi bitti
const unsigned long DONUS_MS = 420;   // yaklaşık 90 derece dönüş süresi
const unsigned long YAN_MS = 2000;    // engelin yanından gitme süresi

${MOTOR_DEAD}
enum Durum { CIZGI_IZLE, SERBEST, DON_SOL, YAN, DON_SAG, DUZ, BITTI };
Durum durum = CIZGI_IZLE;

void setup() {
${SETUP_PINS}  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  // TODO: CIZGI_IZLE -> orantılı çizgi izleme; çizgi KAYIP_MS yoksa "durum: SERBEST"
  // TODO: SERBEST -> düz git; mesafe < ENGEL_CM ise sola dön, YAN_MS yan git, sağa dön, düz git
  // TODO: bitiş çizgisini (beş sensör çizgide) görünce dur ve "durum: BITTI" yaz
}
`,
  solution: () => A_ARAC,
  scenario: (s) => { s.until((n) => /durum: BITTI/.test(n.serial), 28000); s.advance(800) },
  goals: [
    { id: 'durumlar', text: 'Durumları sırayla yaz: "durum: SERBEST" ve sonunda "durum: BITTI".', behavior: true, check: serialHas(/durum: SERBEST[\s\S]*durum: BITTI/) },
    { id: 'bitis', text: 'Bitiş çizgisine ulaş ve orada dur.', behavior: true, check: ({ snap }) => /durum: BITTI/.test(snap.serial) && (snap as RS).inZone.has('bitis') && Math.abs((snap as RS).v) < 0.01 },
    { id: 'carpma', text: 'Hiç çarpma; engel duvarına en az 8 cm yaklaş.', behavior: true, check: ({ snap }) => /durum: BITTI/.test(snap.serial) && (snap as RS).collisions === 0 && (snap as RS).minClearanceM > 0.08 - 0.075 },
    { id: 'sure', text: 'Parkuru 20 saniyenin altında bitir.', behavior: true, check: ({ snap }) => /durum: BITTI/.test(snap.serial) && (snap as RS).timeS < 20 },
    { id: 'enum', text: 'Durum makinesini enum ile yaz.', check: codeHas(/\benum\b/) },
  ],
}

// ---------------------------------------------------------------- Ders 114: telemetri ve ölçüm
const d114: ArenaActivity = {
  intro: 'Robot her 100 ms’de {"t":ms,"x":m,"y":m,"th":rad,"d":cm} biçiminde bir JSON satırı yazsın (odometri + mesafe). Satırlar geçerli JSON olmalı, anahtar sırası sabit olmalı. hata_istatistik (ortalama ve en büyük mutlak hata) sketch’i dersin metnindedir.',
  scene: roverScene({
    id: 'r8-114', title: 'Telemetri alanı', description: '3 x 3 m kutu. Plan: 2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur.',
    width: 3, height: 3, pose: { x: 0.5, y: 0.5, theta: 0 }, sensors: { encoders: true, ultrasonic: true }, extra: { noiseCm: 1, seed: 2 }, timeLimitS: 7,
  }),
  starter: () => `${PIN_HEADER}const int ENK_SOL = 2, ENK_SAG = 3;
const int TRIG = 11, ECHO = 12;
const int TABAN = 150;
const float TIK_M = 0.2073 / 20;                // bir tık = yaklaşık 1,04 cm
const float AKS_M = 0.12;
const unsigned long RAPOR_MS = 100;

volatile long tikSol = 0, tikSag = 0;
volatile int solYon = 1, sagYon = 1;
float x = 0, y = 0, th = 0;                     // odometri: metre, metre, radyan
unsigned long sonRapor = 0;

void solTik() { tikSol += solYon; }
void sagTik() { tikSag += sagYon; }

${MOTOR_DEAD}
// Hareket planı: 2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur
void plan(unsigned long ms) {
  if (ms < 2000) surus(TABAN, TABAN);
  else if (ms < 2600) surus(-TABAN, TABAN);
  else if (ms < 4600) surus(TABAN, TABAN);
  else surus(0, 0);
}

void setup() {
${SETUP_PINS}  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), solTik, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sagTik, RISING);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  plan(simdi);
  // TODO: odometriyi güncelle (tık farkından yol ve dönüş)
  // TODO: her RAPOR_MS'de {"t":..,"x":..,"y":..,"th":..,"d":..} satırı yaz (mesafe yoksa d = null)
}
`,
  solutionSketch: 'telemetri',
  runSeconds: 5.4,
  goals: [
    { id: 'json', text: 'Her satır geçerli JSON olsun ve anahtarlar t, x, y, th, d sırasında gelsin.', behavior: true, check: ({ snap }) => { const l = srl(snap.serial).filter((x) => x.startsWith('{')); return l.length >= 5 && l.every((x) => { try { return Object.keys(JSON.parse(x)).join(',') === 't,x,y,th,d' } catch { return false } }) } },
    { id: 'sayi', text: '5 saniyede yaklaşık 50 satır yaz (her 100 ms’de bir).', behavior: true, check: ({ snap }) => srl(snap.serial).filter((x) => x.startsWith('{')).length >= 48 },
    { id: 'odometri', text: 'Odometri konumu gerçek konumdan 5 cm’den az sapsın.', behavior: true, check: ({ snap }) => { const l = srl(snap.serial).filter((x) => x.startsWith('{')); if (l.length < 40) return false; try { const o = JSON.parse(l.at(-1)!); const r = snap as RS; return Math.hypot(o.x + 0.5 - r.x, o.y + 0.5 - r.y) < 0.05 } catch { return false } } },
    { id: 'mesafe', text: 'İlk satırdaki d, önündeki duvarın mesafesini (yaklaşık 244 cm) göstersin.', behavior: true, check: ({ snap }) => { const l = srl(snap.serial).find((x) => x.startsWith('{')); try { return Math.abs(JSON.parse(l!).d - 244) < 6 } catch { return false } } },
    { id: 'donus', text: 'Plan sırasında robot dönsün: th sıfırdan farklı olsun (en az 90° dönüş).', behavior: true, check: ({ snap }) => (snap as RS).turnedDeg >= 90 },
  ],
}

// ---------------------------------------------------------------- Ders 115: sergi ve sunum (skor tablosu)
const d115: ArenaActivity = {
  intro: 'Çizgi izleyen robot kendi skorunu yazsın: "SKOR sonuc=BITTI sure_s=.. carpma=.. ort_hata_mm=..". Sergide sonuçları ölçülmüş sayılarla anlatırsın.',
  scene: roverScene({
    id: 'r8-115', title: 'Sergi pisti', description: '2 x 2 m kutuda düz ve hafif kaymalı çizgi. Robot çizgi bitince koşuyu bitirir.',
    pose: { x: 0.25, y: 0.985, theta: 0 }, sensors: { line: true, bumpers: true }, lines: [[[0.2, 1.0], [0.7, 1.0], [1.0, 1.15], [1.8, 1.15]]], timeLimitS: 20,
  }),
  starter: () => `${PIN_HEADER}const int TAMPON_SOL = 2, TAMPON_SAG = 3;       // INPUT_PULLUP: basılı = LOW
const int CIZGI[5] = {A0, A1, A2, A3, A4};
const int TABAN = 150;
const float KP = 55.0;
const float SENSOR_ARALIK_MM = 20.0;            // iki sensör arası
const unsigned long BASLAMA_MS = 500;
const unsigned long KAYIP_MS = 400;             // çizgisiz geçen bu süre = pist bitti
const unsigned long ZAMAN_ASIMI_MS = 15000;

unsigned long kosuBasla = 0;
int carpma = 0;
float hataToplamMm = 0;                         // |hata| toplamı
unsigned long olcumSayisi = 0;

${MOTOR_DEAD}
void skorYaz(const char *sonuc, unsigned long bitisMs) {
  // TODO: "SKOR sonuc=BITTI sure_s=5.12 carpma=0 ort_hata_mm=7.3" biçiminde tek satır yaz
}

void setup() {
${SETUP_PINS}  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  // TODO: BEKLE (BASLAMA_MS) -> KOS: orantılı çizgi izle, her ölçümde |konum| * SENSOR_ARALIK_MM topla
  // TODO: tampon basışlarını say (500 ms'den sık basışlar tek çarpma)
  // TODO: çizgi KAYIP_MS yoksa BITTI; ZAMAN_ASIMI_MS dolarsa ZAMAN_ASIMI; ikisinde de skorYaz()
}
`,
  solutionSketch: 'skor_tablosu',
  scenario: (s) => { s.until((n) => /SKOR .*\n/.test(n.serial), 18000); s.advance(500) },
  goals: [
    { id: 'satir', text: 'Koşu bitince tek bir "SKOR sonuc=.. sure_s=.. carpma=.. ort_hata_mm=.." satırı yaz.', behavior: true, check: serialHas(/^SKOR sonuc=\w+ sure_s=[\d.]+ carpma=\d+ ort_hata_mm=[\d.]+/m) },
    { id: 'temiz', text: 'Temiz koşu: sonuc=BITTI ve carpma=0.', behavior: true, check: serialHas(/SKOR sonuc=BITTI sure_s=[\d.]+ carpma=0 /) },
    { id: 'sure', text: 'Pist 4-9 saniyede bitsin (sure_s).', behavior: true, check: ({ snap }) => { const m = snap.serial.match(/sure_s=([\d.]+)/); return !!m && Number(m[1]) > 4 && Number(m[1]) < 9 } },
    { id: 'hata', text: 'Ortalama çizgi hatasını milimetre cinsinden yaz (0’dan büyük).', behavior: true, check: ({ snap }) => { const m = snap.serial.match(/ort_hata_mm=([\d.]+)/); return !!m && Number(m[1]) > 0 } },
    { id: 'bir', text: 'Skor satırı yalnız bir kez yazılsın.', behavior: true, check: ({ snap }) => (snap.serial.match(/^SKOR /gm) ?? []).length === 1 && snap.serialAgeS > 0.3 },
  ],
}

// ================================================================ B (robot kol) ve C (takip) yolları: ders 112 ve 113
// Anahtar: "robotik:8:<ders>:kol" / ":takip". Arayüz, aynı sahne kimliğiyle temel (A) etkinliğin yanında yol sekmesi olarak gösterir.
const L_KOL = 10
const usDeg = (us: number) => ((us - 544) * 180) / (2400 - 544)
const kolUc = (omuz: number, dirsek: number): [number, number] => {
  const t1 = (omuz * Math.PI) / 180, t2 = (dirsek * Math.PI) / 180
  return [L_KOL * Math.cos(t1) + L_KOL * Math.cos(t1 - t2), L_KOL * Math.sin(t1) + L_KOL * Math.sin(t1 - t2)]
}
/** "omuz=.. dirsek=.. us=a,b kontrol=x,y" satırları (b_alt_sistem yanıtı). */
const ikSatirlari = (serial: string) => [...serial.matchAll(/^omuz=(-?[\d.]+) dirsek=(-?[\d.]+) us=(\d+),(\d+) kontrol=(-?[\d.]+),(-?[\d.]+)\s*$/gm)].map((m) => ({ us1: Number(m[3]), us2: Number(m[4]), idx: m.index ?? 0 }))
const IK_HEDEFLER: Array<[number, number]> = [[12, 4], [8, 10], [4, 12], [14, 2], [10, 0]]

const KOL_STARTER_BASLIK = `#include <Servo.h>

const int OMUZ_PIN = 9;
const int DIRSEK_PIN = 10;
const int TUTUCU_PIN = 11;

const float L1 = 10.0;             // omuz - dirsek (cm)
const float L2 = 10.0;             // dirsek - uç (cm)
const int US_MIN = 544;            // Servo kütüphanesinin 0 derece darbesi
const int US_MAX = 2400;           // 180 derece darbesi

Servo omuz, dirsek, tutucu;
`

const KOL_IK_FONKSIYONLARI = `// Derece (0-180) -> darbe genişliği (mikrosaniye)
int dereceyiUsYap(float aci) {
  aci = constrain(aci, 0.0, 180.0);
  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);
}

// Ters kinematik: hedef (x, y) cm -> servo açıları (derece). Ulaşılamazsa false.
// Omuz servosu q1: 0 = yatay ileri, 90 = dik yukarı. Dirsek servosu q2: 0 = kol düz, 90 = dirsek dik açı.
bool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {
  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);
  if (c < -1.0 || c > 1.0) return false;          // kol bu noktaya yetişmez
  float s2 = acos(c);                              // dirsek bükülmesi q2 (radyan), dirsek üstte çözüm
  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  omuzAci = q1 * 180.0 / PI;
  dirsekAci = s2 * 180.0 / PI;
  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;
}
`

const C_ORTAK_BASLIK = `${PIN_HEADER}const int TRIG = 11, ECHO = 12;

const float HEDEF_CM = 20.0;
const float KP = 9.0;
const float KI = 4.0;
const float KD = 6.0;
const float I_SINIR = 40.0;        // integral toplamının üst sınırı (windup önleme)
const float OLU_ARALIK_CM = 0.5;   // hedefe bu kadar yakınsa dur
const unsigned long DONGU_MS = 60;
`

const C_SETUP = `void setup() {
${SETUP_PINS}  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}
`

/** Takip hedefi tahtası: robotun 44 cm önünde (sensör robot merkezinin 6 cm önünde) dikey levha. */
const HEDEF_TAHTA: [number, number, number, number] = [1.0, 0.3, 1.0, 1.7]
const takipExtra = { gain: { left: 1, right: 0.97 }, noiseCm: 1, seed: 5 }

// ---------------------------------------------------------------- Ders 112 · Yol B: ters kinematik ve servo sürücü
const d112b: ArenaActivity = {
  variant: { id: 'kol', label: 'B: Robot kol' },
  intro: 'B yolu alt sistemi: ters kinematik fonksiyonunu (tersKinematik) ve servo sürücüyü (dereceyiUsYap) yaz. "g 12 4" gibi bir komutla kolu hedefe götür; satırdaki açılardan ve darbelerden uç noktası hedeften 1 mm’den az sapsın. Kolun erişemediği hedefte "ulasilamaz" yazsın ve servolar yerinde kalsın.',
  scene: armScene({
    id: 'r8-112b', title: 'Kol alt sistem bankı', description: 'İki eklemli kol (10 + 10 cm). Omuz D9, dirsek D10, tutucu D11. Komutlarla kolu hedeflere gönder; ucun gerçek konumu çizimde ve panelde görünür.',
    timeLimitS: 16,
  }),
  quickSend: ['g 12 4', 'g 8 10', 'g 4 12', 'g 14 2', 'g 10 0', 'g 25 0'].map((t) => cmd(`${t}\n`, t)),
  starter: () => `${KOL_STARTER_BASLIK}
// Derece (0-180) -> darbe genişliği (mikrosaniye)
int dereceyiUsYap(float aci) {
  // TODO: aci'yi 0-180 arasında sınırla; US_MIN + aci * (US_MAX - US_MIN) / 180, +0.5 ile yuvarla
  return US_MIN;
}

// Ters kinematik: hedef (x, y) cm -> servo açıları (derece). Ulaşılamazsa false.
bool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {
  // TODO: c = (x² + y² - L1² - L2²) / (2 L1 L2); c, -1 ile 1 arasında değilse false
  //       q2 = acos(c); q1 = atan2(y, x) + atan2(L2 sin q2, L1 + L2 cos q2); dereceye çevir
  return false;
}

// İleri kinematik: açılardan uç noktasını bul (ters kinematiği doğrulamak için)
void ileriKinematik(float omuzAci, float dirsekAci, float &x, float &y) {
  // TODO: x = L1 cos q1 + L2 cos(q1 - q2); y = L1 sin q1 + L2 sin(q1 - q2)
  x = 0;
  y = 0;
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);
  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);
  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);
  omuz.write(90);
  dirsek.write(0);
  tutucu.write(30);
}

void loop() {
  // TODO: 'g' komutu: x ve y'yi Serial.parseFloat() ile oku; tersKinematik() false dönerse "ulasilamaz" yaz ve servolara dokunma
  // TODO: yoksa omuz ve dirsek servolarına writeMicroseconds(dereceyiUsYap(...)) ile yaz ve
  //       "omuz=69.20 dirsek=101.54 us=1258,1591 kontrol=12.00,4.00" biçiminde tek satır yaz
}
`,
  solutionSketch: 'b_alt_sistem',
  scenario: (s) => {
    s.advance(300)
    for (const t of ['g 12 4', 'g 8 10', 'g 4 12', 'g 14 2', 'g 10 0', 'g 25 0']) { s.sendSerial(`${t}\n`); s.advance(500) }
  },
  goals: [
    {
      id: 'hedefler', text: 'Beş hedefe git ((12; 4), (8; 10), (4; 12), (14; 2), (10; 0)): satırdaki darbelerden hesaplanan uç noktası her hedeften 1 mm’den az sapsın.',
      hint: 'Hızlı komutlarla beş hedefi sırayla gönder. Hata yalnız yuvarlamadan gelmeli; us= değerleri tam mikrosaniye olmalı.', behavior: true,
      check: ({ snap }) => {
        const l = ikSatirlari(snap.serial)
        return IK_HEDEFLER.every(([x, y]) => l.some((r) => { const [ux, uy] = kolUc(usDeg(r.us1), usDeg(r.us2)); return Math.hypot(ux - x, uy - y) < 0.1 }))
      },
    },
    { id: 'ik', text: '"g 12 4" için omuz 69,20° ve dirsek 101,54° yazılsın.', behavior: true, check: serialHas(/omuz=69\.20 dirsek=101\.5[34]/) },
    {
      id: 'darbe', text: 'Pindeki gerçek servo darbesi, son satırdaki us= değeriyle uyuşsun (açı farkı 0,3°’den az).', behavior: true,
      check: ({ snap }) => {
        const l = ikSatirlari(snap.serial).at(-1)
        const a = snap as ArmSnapshot
        return !!l && Math.abs(usDeg(l.us1) - a.cmd.q1) < 0.3 && Math.abs(usDeg(l.us2) - a.cmd.q2) < 0.3
      },
    },
    {
      id: 'ulasilamaz', text: 'Erişilemeyen hedefte ("g 25 0") "ulasilamaz" yaz; servolar son noktada kalsın.', behavior: true,
      check: ({ snap }) => {
        const l = ikSatirlari(snap.serial).at(-1), u = snap.serial.lastIndexOf('ulasilamaz')
        const a = snap as ArmSnapshot
        return !!l && u > l.idx && Math.abs(usDeg(l.us1) - a.cmd.q1) < 0.3 && Math.abs(usDeg(l.us2) - a.cmd.q2) < 0.3
      },
    },
    { id: 'hassas', text: 'Servoya writeMicroseconds ile mikrosaniye hassasiyetinde yaz (Servo.write tam derece verir).', check: codeHas(/\bwriteMicroseconds\s*\(/) },
  ],
}

// ---------------------------------------------------------------- Ders 112 · Yol C: mesafe PID alt sistemi
const d112c: ArenaActivity = {
  variant: { id: 'takip', label: 'C: Takip' },
  intro: 'C yolu alt sistemi: öndeki levhaya 20 cm mesafeyi PID ile koru. Mesafe son üç ölçümün ortancasıdır; hata = ölçülen − 20. Robot 44 cm’den başlar; yakalamadan sonra gerçek mesafe 17-23 cm’de kalmalı. Seriden "mesafe=.. hata=.. hiz=.." satırı yaz.',
  scene: roverScene({
    id: 'r8-112c', title: 'Hedef takip bankı', description: '4 x 2 m alan. 44 cm önünde duran bir levha (hedef); sağ motor %3 zayıf, ultrasonik 1 cm gürültülü. Çizimdeki ışın sensörün baktığı yönü gösterir.',
    width: 4, height: 2, pose: { x: 0.5, y: 1, theta: 0 }, sensors: { ultrasonic: true },
    movers: [{ id: 'hedef', wall: HEDEF_TAHTA, keys: [{ t: 0, dx: 0, dy: 0 }] }],
    extra: takipExtra, timeLimitS: 18,
  }),
  starter: () => `${C_ORTAK_BASLIK}
${MOTOR_DEAD}
float mesafeler[3] = {400, 400, 400};
float integral = 0, oncekiHata = 0;
unsigned long sonDongu = 0, sonYazi = 0;

float tekOlcum() {
  // TODO: TRIG darbesi (2 µs LOW, 10 µs HIGH, LOW), pulseIn(ECHO, HIGH, 15000); yankı yoksa 400, varsa süre / 58
  return 400.0;
}

float mesafe() {
  // TODO: mesafeler dizisini kaydır, yeni ölçümü ekle ve üç değerin ORTANCASINI döndür
  return tekOlcum();
}

${C_SETUP}
void loop() {
  // TODO: millis() ile her DONGU_MS'de bir çalış (dt = DONGU_MS / 1000)
  // TODO: hata = mesafe() - HEDEF_CM; turev = (hata - oncekiHata) / dt; u = KP*hata + KI*integral + KD*turev
  // TODO: u doymadıysa (|u| < 255) integrali güncelle ve I_SINIR ile sınırla (windup)
  // TODO: |hata| < OLU_ARALIK_CM ise dur; yoksa hiz = constrain(u, -200, 200); surus(hiz, hiz)
  // TODO: 500 ms'de bir "mesafe=<cm> hata=<cm> hiz=<pwm>" satırı yaz
}
`,
  solutionSketch: 'c_mesafe_pid',
  runSeconds: 18,
  goals: [
    { id: 'izleme', text: 'Ayar yaparken izlemek için "mesafe=.. hata=.. hiz=.." satırlarını yaz.', behavior: true, check: serialHas(/^mesafe=\d+\.\d hata=-?\d+\.\d hiz=-?\d+/m) },
    { id: 'yakala', text: 'Levhaya yaklaş: gerçek mesafe 25 cm’nin altına insin.', behavior: true, check: ({ snap }) => (snap as RS).minFrontTrueCm < 25 },
    { id: 'otur', text: 'Yakalamadan sonra (14. saniyeden sonra) gerçek mesafe 17-23 cm arasında otursun ve robot durgun olsun.', hint: 'KP, KI, KD’yi elle ayarla; integral toplamını I_SINIR ile sınırla.', behavior: true, check: ({ snap }) => { const r = snap as RS; return r.timeS >= 14 && r.frontTrueCm >= 17 && r.frontTrueCm <= 23 && Math.abs(r.v) < 0.05 } },
    { id: 'carpma', text: 'Levhaya çarpma; en yakın gerçek mesafe 8 cm’den küçük olmasın.', behavior: true, check: ({ snap }) => (snap as RS).timeS >= 18 && (snap as RS).collisions === 0 && (snap as RS).minFrontTrueCm > 8 },
    { id: 'windup', text: 'Integral toplamını constrain() ile I_SINIR’a sınırla (windup önleme).', check: codeHas(/constrain\s*\([^;]*I_SINIR/) },
  ],
}

// ---------------------------------------------------------------- Ders 113 · Yol B: üç noktadan al-bırak dizisi
const d113b: ArenaActivity = {
  variant: { id: 'kol', label: 'B: Robot kol' },
  intro: 'B yolu entegrasyonu: durum makinesiyle üç noktalı al-bırak dizisi. Kol parçayı P1’den (12; 4) alsın, P2’den (8; 10) geçirsin ve P3’e (4; 12) bıraksın. Tutucu açık = 30°, kapalı = 100°. Her varışta "nokta=N" yaz, bitince "dizi bitti". Kol noktalar arasında zıplamasın (omuz ve dirsek 20 ms’de en çok 2,5°).',
  scene: armScene({
    id: 'r8-113b', title: 'Al-bırak dizisi', description: 'Turuncu kutu parça (P1), yeşil daire P3 bırakma bölgesi. Bu yolda tutucu 90°’nin üstündeyken kapalı sayılır.',
    objects: [{ id: 'parca', label: 'Parça (P1)', x: 12, y: 4 }], zones: [{ id: 'p3', label: 'P3', x: 4, y: 12, r: 2 }], gripClosedAboveDeg: 90, timeLimitS: 16,
  }),
  starter: () => `${KOL_STARTER_BASLIK}const float TUTUCU_ACIK = 30.0;
const float TUTUCU_KAPALI = 100.0;

const float NOKTA_X[3] = {12.0, 8.0, 4.0};     // cm
const float NOKTA_Y[3] = {4.0, 10.0, 12.0};
const float ADIM_DERECE = 1.5;                 // her 20 ms'de en çok bu kadar
const unsigned long ADIM_MS = 20;
const unsigned long BEKLEME_MS = 500;          // noktada durma süresi

enum Durum { P1_GIT, P1_TUT, P2_GIT, P3_GIT, P3_BIRAK, BITTI };
Durum durum = P1_GIT;

float omuzSimdi = 90, dirsekSimdi = 0;         // şu anki açılar
float omuzHedef = 90, dirsekHedef = 0;         // gidilecek açılar
unsigned long sonAdim = 0;
unsigned long beklemeBasla = 0;
bool bekliyor = false;

${KOL_IK_FONKSIYONLARI}
void noktayaGit(int n) {
  if (!tersKinematik(NOKTA_X[n], NOKTA_Y[n], omuzHedef, dirsekHedef)) {
    Serial.println("hata: nokta ulasilamaz");
  }
}

// Açıyı hedefe doğru bir adım ilerlet. Vardıysa true.
bool adimAt() {
  // TODO: her eklem hedefe en çok ADIM_DERECE ilerlesin (constrain); servolara writeMicroseconds ile yaz
  //       iki eklem de vardıysa true
  return false;
}

void nokta(int n) {                            // dizi kaydı: ölçüm için seri satır
  Serial.print("nokta=");
  Serial.println(n);
}

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);
  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);
  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);
  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));
  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));
  tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));
  noktayaGit(0);
}

void loop() {
  // TODO: delay() yok; her ADIM_MS'de adimAt(); vardıysa BEKLEME_MS bekle
  // TODO: P1_GIT: "nokta=1", tutucuyu kapat, P1_TUT | P1_TUT: P2'ye git | P2_GIT: "nokta=2", P3'e git
  // TODO: P3_GIT: "nokta=3", tutucuyu aç, P3_BIRAK | P3_BIRAK: "dizi bitti", BITTI
}
`,
  solutionSketch: 'b_kol',
  scenario: (s) => { s.until((n) => /dizi bitti/.test(n.serial), 14000); s.advance(300) },
  goals: [
    { id: 'noktalar', text: 'Üç noktayı sırayla bildir: "nokta=1", "nokta=2", "nokta=3" ve sonunda "dizi bitti".', behavior: true, check: serialHas(/nokta=1[\s\S]*nokta=2[\s\S]*nokta=3[\s\S]*dizi bitti/) },
    { id: 'tuttu', text: 'Parçayı al: tutucu P1’de kapansın ve parça kolun ucunda taşınsın.', behavior: true, check: ({ snap }) => (snap as ArmSnapshot).held === 'parca' },
    { id: 'birakti', text: 'Parçayı P3 bölgesine bırak.', behavior: true, check: ({ snap }) => (snap as ArmSnapshot).placed.parca === 'p3' },
    { id: 'yumusak', text: 'Yumuşak hareket: omuz ve dirsek komutları hiçbir çerçevede 2,5°’den fazla sıçramasın.', hint: 'Ani write() 60° sıçratır; her 20 ms’de en çok ADIM_DERECE ilerle.', behavior: true, check: ({ snap }) => /dizi bitti/.test(snap.serial) && (snap as ArmSnapshot).maxJointJumpDeg <= 2.5 },
    { id: 'sure', text: 'Diziyi 15 saniyenin altında bitir.', behavior: true, check: ({ snap }) => /dizi bitti/.test(snap.serial) && snap.timeS < 15 },
    { id: 'enum', text: 'Durum makinesini enum ile yaz.', check: codeHas(/\benum\b/) },
  ],
}

// ---------------------------------------------------------------- Ders 113 · Yol C: hedefi takip et, kaybolursa dur
const d113c: ArenaActivity = {
  variant: { id: 'takip', label: 'C: Takip' },
  intro: 'C yolu entegrasyonu: öndeki levhayı 20 cm mesafeden takip et (BEKLE, TAKIP, KAYIP). Levha 10. saniyeden itibaren 8 sn boyunca 3 cm/sn ile uzaklaşır; 28. saniyede birden kaybolur (robot anında durmalı); 32. saniyede 0,5 m önüne geri gelir (yeniden TAKIP). Hedef yokken motorlar durmalı: emin olamıyorsan dur.',
  scene: roverScene({
    id: 'r8-113c', title: 'Hedef takip parkuru', description: '4 x 2 m alan. Levha hareket eder: önce durur, 10-18. sn uzaklaşır, 28. sn kaybolur, 32. sn geri gelir. Sağ motor %3 zayıf, ultrasonik 1 cm gürültülü.',
    width: 4, height: 2, pose: { x: 0.5, y: 1, theta: 0 }, sensors: { ultrasonic: true },
    movers: [{
      id: 'hedef', wall: HEDEF_TAHTA,
      keys: [{ t: 0, dx: 0, dy: 0 }, { t: 10, dx: 0, dy: 0 }, { t: 18, dx: 0.24, dy: 0 }, { t: 28, dx: 0.24, dy: 0 }, { t: 28.1, dx: 2.5, dy: 0 }, { t: 32, dx: 2.5, dy: 0 }, { t: 32.1, dx: 0.54, dy: 0 }],
    }],
    extra: takipExtra, timeLimitS: 44,
  }),
  starter: () => `${C_ORTAK_BASLIK}const float MENZIL_CM = 100.0;         // bundan uzaktaki "hedef" sayılmaz
const int KAYIP_SAYISI = 8;            // art arda bu kadar boş ölçüm = hedef kayıp (~0,5 sn)

enum Durum { BEKLE, TAKIP, KAYIP };
Durum durum = BEKLE;

${MOTOR_DEAD}
float mesafeler[3] = {400, 400, 400};
float integral = 0, oncekiHata = 0;
int bosSayac = 0;
unsigned long sonDongu = 0;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 15000);
  return s == 0 ? 400.0 : s / 58.0;
}

float mesafe() {
  mesafeler[0] = mesafeler[1];
  mesafeler[1] = mesafeler[2];
  mesafeler[2] = tekOlcum();
  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

void pidSifirla() {
  // TODO: integral ve oncekiHata'yı sıfırla (hedef yeniden görününce eski değerle fırlamasın)
}

${C_SETUP}
void loop() {
  // TODO: millis() ile her DONGU_MS'de bir çalış
  // TODO: hedefVar = mesafe() < MENZIL_CM. Hedef yoksa ANINDA dur (surus(0, 0)), bosSayac++;
  //       TAKIP'teyken bosSayac >= KAYIP_SAYISI ise durum = KAYIP ve "durum: KAYIP" yaz
  // TODO: hedef (yeniden) göründüyse bosSayac = 0; durum TAKIP değilse pidSifirla(), durum = TAKIP, "durum: TAKIP" yaz
  // TODO: TAKIP'te 112. dersteki PID ile 20 cm mesafeyi koru
}
`,
  solutionSketch: 'c_takip',
  runSeconds: 44,
  goals: [
    { id: 'takip', text: 'Hedef 28. saniyeye kadar uzaklaşırken robot onu izlesin: 27-28. saniyede gerçek mesafe 17-23 cm olsun ve robot en az 40 cm ilerlemiş olsun.', hint: 'PID mesafeyi 20 cm’de tutar; hedef kayarken integral terimi robotu geriden gelmekten kurtarır.', behavior: true, check: ({ snap }) => { const r = snap as RS; return r.timeS >= 27 && r.timeS <= 28 && r.frontTrueCm >= 17 && r.frontTrueCm <= 23 && r.x > 0.5 + 0.4 } },
    { id: 'kayip', text: 'Hedef kaybolunca (28. sn) robot anında dursun (en çok 3 cm gitsin) ve "durum: KAYIP" yazılsın.', hint: 'Durma komutu, durum yazmaktan önce gelmeli.', behavior: true, check: ({ snap }) => { const r = snap as RS; return r.timeS >= 29.5 && r.timeS <= 31.5 && /durum: KAYIP/.test(snap.serial) && Math.abs(r.v) < 0.02 && r.x < 1.03 } },
    { id: 'geri', text: 'Hedef 32. saniyede geri gelince yeniden "durum: TAKIP" yazılsın ve robot 10 sn içinde 17-23 cm’e otursun.', behavior: true, check: ({ snap }) => { const r = snap as RS; return r.timeS >= 42 && (snap.serial.match(/durum: TAKIP/g) ?? []).length >= 2 && r.frontTrueCm >= 17 && r.frontTrueCm <= 23 } },
    { id: 'carpma', text: 'Levhaya çarpma.', behavior: true, check: ({ snap }) => (snap as RS).timeS >= 42 && (snap as RS).collisions === 0 },
    { id: 'durumlar', text: 'Durum makinesini enum ile yaz (BEKLE, TAKIP, KAYIP) ve PID’i durum değişiminde sıfırla.', check: ({ code }) => codeHas(/\benum\b/)({ code }) && codeHas(/\bpidSifirla\s*\(\s*\)\s*;/)({ code }) },
  ],
}

export const R_H8_ACTIVITIES: ActivityMap = {
  [rk(8, 1)]: d111, [rk(8, 2)]: d112, [rk(8, 3)]: d113, [rk(8, 4)]: d114, [rk(8, 5)]: d115,
  // B ve C yolları (yol sekmeleri; anahtarın dördüncü bölümü yol kimliğidir)
  [`${rk(8, 2)}:kol`]: d112b, [`${rk(8, 2)}:takip`]: d112c, [`${rk(8, 3)}:kol`]: d113b, [`${rk(8, 3)}:takip`]: d113c,
}

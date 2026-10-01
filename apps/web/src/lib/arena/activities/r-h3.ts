import { easyLine, hardLine, roverScene } from '../scenes'
import { codeHas, serialHas } from '../goals'
import type { ArenaActivity } from '../types'
import { LINE_HEADER, MOTOR2_FN, PIN_HEADER, SETUP_PINS, rk, type ActivityMap, type RS } from './helpers'

/** Modül 5, hafta 3 (Çizgi; ders 86-90). Anahtar: "robotik:3:<ders>". */

const straightLine = (id: string, movable: boolean) => roverScene({
  id, title: 'Düz çizgi', description: 'Robotun altında 2 cm’lik siyah çizgi var. Sensörler robotun 7 cm önünde, 2,4 cm arayla dizili (A0 en solda).',
  pose: { x: 1, y: 1, theta: 0 }, sensors: { line: true }, lines: [[[0.2, 1], [1.8, 1]]], movable, timeLimitS: 20,
})
const T_JUNCTION = (id: string) => roverScene({
  id, title: 'T kavşağı', description: 'Düz yol bir T kavşağında biter. Kavşakta karar ver: sola ya da sağa.',
  width: 2.4, height: 2.4, pose: { x: 1.1, y: 0.3, theta: Math.PI / 2 }, sensors: { line: true },
  lines: [[[1.1, 0.3], [1.1, 1.2]], [[0.6, 1.2], [1.6, 1.2]]],
  zones: [
    { id: 'baslangic', kind: 'start', x: 1.1, y: 0.3, r: 0.1 },
    { id: 'sol-uc', kind: 'target', label: 'Sol', x: 0.6, y: 1.2, r: 0.12 },
    { id: 'sag-uc', kind: 'target', label: 'Sağ', x: 1.6, y: 1.2, r: 0.12 },
  ], timeLimitS: 25,
})

// ---------------------------------------------------------------- Ders 86: yansımalı IR sensör ve çizgi okuma
const d86: ArenaActivity = {
  intro: 'Beş sensörü oku ve deseni yaz (ör. 00100 konum=0). Robot sürülmez: ▶ ile başlattıktan sonra robotu sürükle ya da panelden kaydır, deseni izle.',
  scene: straightLine('r3-86', true),
  starter: () => `${LINE_HEADER}const int ESIK = 512;     // zemin ~164, çizgi ~860

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sayi = 0;       // kaç sensör çizgide
  int ilk = -1;       // çizgiyi görenlerden ilkinin numarası

  // TODO: 5 sensörü oku; analogRead(...) > ESIK ise '1', değilse '0' yazdır
  // TODO: tek sensör çizgideyse " konum=" yaz: A0 -> -2, A2 -> 0, A4 -> +2 (negatif = çizgi solda)
  // TODO: hiçbiri çizgideyse " cizgi yok", birden çoksa " birden cok sensor" yaz
  Serial.println();
  delay(200);
}
`,
  solutionSketch: 'sensor_desen',
  scenario: (s) => {
    s.advance(700)
    for (const y of [0.976, 0.952, 1.024, 1.048, 1.3, 0.988]) { s.place({ y }); s.advance(600) }
  },
  goals: [
    { id: 'desen', text: 'Beş sensörün durumunu "00100" gibi bir desen olarak yazdır.', behavior: true, check: serialHas(/^[01]{5} /m) },
    { id: 'orta', text: 'Çizgi tam ortadayken "00100 konum=0" yazdır.', behavior: true, check: serialHas(/00100 konum=0/) },
    { id: 'yan', text: 'Robotu yana kaydır: çizgi sol/sağ sensörde görününce konum işareti doğru çıksın (negatif = çizgi solda).', hint: 'Robotu çizginin üstünden ~2,4 cm yana kaydır.', behavior: true, check: serialHas(/(10000 konum=-2|01000 konum=-1|00010 konum=1|00001 konum=2)/) },
    { id: 'yok', text: 'Çizgi hiçbir sensörde yokken "cizgi yok" yazdır.', behavior: true, check: serialHas(/00000 cizgi yok/) },
    { id: 'esik', text: 'Okumayı bir eşikle karşılaştır: analogRead(...) > ESIK.', check: codeHas(/analogRead\s*\([^;]*\)\s*>\s*\w+/) },
  ],
}

// ---------------------------------------------------------------- Ders 87: kalibrasyon
const d87: ArenaActivity = {
  intro: 'Açılışta robot sağa sola sallanıp her sensörün min/max değerini ölçsün; eşik = (min + max) / 2. Sonra kalibre eşikle deseni yazsın.',
  scene: straightLine('r3-87', true),
  starter: () => `${PIN_HEADER}${LINE_HEADER}const int SALLA_PWM = 120;
const unsigned long KALIBRASYON_MS = 1800;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
bool hazir = false;
unsigned long sonYazi = 0;

${MOTOR2_FN}
void sallan(unsigned long t) {
  // TODO: 0-400 ms sola dön, 400-1200 ms sağa dön, 1200-1600 ms başa dön, sonra dur
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
  // TODO: enAz[i] = 1023, enCok[i] = 0 ile başlat
}

void loop() {
  unsigned long simdi = millis();
  if (simdi < KALIBRASYON_MS) {
    sallan(simdi);
    // TODO: her sensör için min ve max'ı güncelle
    return;
  }
  if (!hazir) {
    motor(0, 0);
    // TODO: eşik[i] = (enAz[i] + enCok[i]) / 2; "A0 min=.. max=.. esik=.." satırlarını yaz
    hazir = true;
  }
  // TODO: her 300 ms'de kalibre eşiklerle deseni yaz (ör. 00100)
}
`,
  solutionSketch: 'kalib_salla',
  runSeconds: 4,
  goals: [
    { id: 'satirlar', text: 'Her sensör için "A0 min=.. max=.. esik=.." satırını yazdır (A0-A4).', behavior: true, check: serialHas(/A0 min=\d+ max=\d+ esik=\d+[\s\S]*A4 min=\d+ max=\d+ esik=\d+/) },
    { id: 'ortalama', text: 'Eşik, min ile max’ın ortası olsun; çizgiyi ve zemini görmüş olmalısın (max − min > 500).', behavior: true, check: ({ snap }) => {
      const rows = [...snap.serial.matchAll(/A([0-4]) min=(\d+) max=(\d+) esik=(\d+)/g)]
      return rows.length >= 5 && rows.every((m) => Number(m[4]) === Math.floor((Number(m[2]) + Number(m[3])) / 2) && Number(m[3]) - Number(m[2]) > 500)
    } },
    { id: 'yerinde', text: 'Sallanma bitince robot başladığı yerde ve yönde dursun (3 cm, 6° içinde).', behavior: true, check: ({ snap }) => { const r = snap as RS; return r.timeS > 2.2 && Math.hypot(r.x - 1, r.y - 1) < 0.03 && Math.abs(r.thetaDeg) < 6 } },
    { id: 'desen', text: 'Kalibrasyondan sonra çizgi ortadayken "00100" yazdır.', behavior: true, check: serialHas(/^00100\s*$/m) },
  ],
}

// ---------------------------------------------------------------- Ders 88: bang-bang ve histerezis
const d88: ArenaActivity = {
  intro: 'Beş sensörlü bang-bang çizgi izleyici yaz: çizgi solda kaldıysa sola, sağdaysa sağa dön; çizgiyi kaybedersen son yönü hatırla. Ovali bir tam tur at.',
  scene: easyLine(),
  starter: () => `${PIN_HEADER}${LINE_HEADER}const int ESIK = 512;
const int HIZ = 150;
const int DONUS = 0;             // dönülen tarafın tekerlek hızı

int sonYon = 0;                  // -1 çizgi solda, 0 ortada, +1 sağda
unsigned long sonTur = 0;
unsigned long kayipMs = 0;       // hiçbir sensörün çizgiyi görmediği toplam süre
unsigned long sonYazi = 0;

${MOTOR2_FN}
void setup() {
${SETUP_PINS}  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  // TODO: 5 sensörü oku (> ESIK); sol = s[0] || s[1], sag = s[3] || s[4], orta = s[2]
  // TODO: hiçbiri çizgide değilse kayipMs'e geçen süreyi ekle
  // TODO: sonYon'u güncelle (hiçbiri ise AYNEN KALSIN: hafıza)
  // TODO: sonYon'a göre: düz / sola dön / sağa dön (motor(DONUS, HIZ) ...)
  // TODO: her 1000 ms'de "t=<sn> kayip=<ms>" yaz
}
`,
  solutionSketch: 'bangbang_dizi',
  scenario: (s) => { s.until((n) => (n as RS).finishedAtS !== null, 35000); s.advance(1500) },
  goals: [
    { id: 'tur', text: 'Pistte bir tam tur at (üç kontrol noktasından geçip başlangıca dön).', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null },
    { id: 'sure', text: 'Turu 25 saniyenin altında bitir.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).finishedAtS! < 25 },
    { id: 'kesinti', text: 'Hiçbir kesintinin 0,3 saniyeyi geçmesin: çizgi kaybında son yönü hatırla.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).longestOffLineMs < 300 },
    { id: 'rapor', text: 'Her saniye "t=.. kayip=.." satırını yazdır (çizgiyi görmediğin toplam süre).', behavior: true, check: serialHas(/t=\d+ kayip=\d+/) },
    { id: 'hafiza', text: 'Son yönü bir değişkende sakla (sonYon).', check: codeHas(/\bsonYon\b/) },
  ],
}

// ---------------------------------------------------------------- Ders 89: kavşak, keskin viraj ve çizgi kaybı
const d89: ArenaActivity = {
  intro: 'T kavşağında beş sensör birden çizgiyi görür. Kavşağa gir, ilerle, kararına göre (KAVSAK_KARARI) dön ve çizgiyi izlemeye devam et. Her durum geçişini yazdır.',
  scene: T_JUNCTION('r3-89'),
  starter: () => `${PIN_HEADER}${LINE_HEADER}const int ESIK = 512;
const int HIZ = 150;
const int KAVSAK_KARARI = -1;                 // -1 sola, 0 düz, +1 sağa
const unsigned long BOSLUK_MS = 900;
const unsigned long ARAMA_MS = 2500;
const unsigned long KAVSAK_ILERI_MS = 350;

enum Durum { IZLE, BOSLUK, ARAMA, DUR, KAVSAK_ILERI, KAVSAK_DON, KAVSAK_DUZ };
const char* DURUM_ADI[] = { "IZLE", "BOSLUK", "ARAMA", "DUR", "KAVSAK_ILERI", "KAVSAK_DON", "KAVSAK_DUZ" };

Durum durum = IZLE;
int sonYon = 0;
unsigned long durumBasla = 0;

${MOTOR2_FN}
void gec(Durum yeni) {
  durum = yeni;
  durumBasla = millis();
  Serial.println(DURUM_ADI[yeni]);
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
}

void loop() {
  // TODO: sensörleri oku; hepsi = beşi de çizgide, hicbiri = hiçbiri çizgide
  switch (durum) {
    case IZLE:         /* TODO: hepsi ise KAVSAK_ILERI; hiçbiri ise BOSLUK ya da ARAMA; yoksa bang-bang */ break;
    case BOSLUK:       /* TODO: BOSLUK_MS boyunca düz git, çizgi gelirse IZLE, süre dolarsa ARAMA */ break;
    case ARAMA:        /* TODO: son yöne doğru dön; ARAMA_MS dolarsa DUR */ break;
    case KAVSAK_ILERI: /* TODO: KAVSAK_ILERI_MS kadar ileri git (aks kavşak merkezine varsın); karara göre KAVSAK_DON ya da KAVSAK_DUZ */ break;
    case KAVSAK_DON:   /* TODO: karar yönüne yerinde dön; orta sensör çizgiyi yeniden bulunca IZLE */ break;
    case KAVSAK_DUZ:   /* TODO: kavşağı düz geç, IZLE */ break;
    case DUR:          motor(0, 0); break;
  }
}
`,
  solutionSketch: 'kavsak_karari',
  runSeconds: 14,
  goals: [
    { id: 'kavsak', text: 'Kavşağı tanı: beş sensör birden çizgideyken "KAVSAK_ILERI" yaz.', behavior: true, check: serialHas(/KAVSAK_ILERI/) },
    { id: 'sira', text: 'Durumlar bu sırayla görünsün: KAVSAK_ILERI, KAVSAK_DON, IZLE.', behavior: true, check: serialHas(/KAVSAK_ILERI\s+KAVSAK_DON\s+IZLE/) },
    { id: 'uc', text: 'Kararına göre T’nin bir ucuna (sol ya da sağ) ulaş.', behavior: true, check: ({ snap }) => (snap as RS).visited.has('sol-uc') || (snap as RS).visited.has('sag-uc') },
    { id: 'carpma', text: 'Arena duvarına hiç çarpma.', behavior: true, check: ({ snap }) => ((snap as RS).visited.has('sol-uc') || (snap as RS).visited.has('sag-uc')) && (snap as RS).collisions === 0 },
    { id: 'karar', text: 'Kararı bir sabit olarak yaz (KAVSAK_KARARI: -1 sol, 0 düz, +1 sağ) ve değiştirip tekrar dene.', check: codeHas(/\bKAVSAK_KARARI\b/) },
  ],
}

// ---------------------------------------------------------------- Ders 90: proje, çizgi izleyen robot
const d90: ArenaActivity = {
  intro: 'Önce kalibre et (sallan, eşikleri bul), sonra pisti bitir: kavis, dik viraj ve 9 cm’lik çizgi boşluğu var. Sondaki banda varınca dur ve süre/kayıp raporunu yaz.',
  scene: hardLine(),
  starter: () => `${PIN_HEADER}${LINE_HEADER}const int HIZ = 170;
const int SALLA_PWM = 120;
const unsigned long KALIBRASYON_MS = 1800;
const int MIN_KONTRAST = 200;                 // max - min bundan küçükse kalibrasyon başarısız
const unsigned long BOSLUK_MS = 900;
const unsigned long ARAMA_MS = 2500;

enum Durum { KALIBRE, IZLE, BOSLUK, ARAMA, BITTI, HATA };
Durum durum = KALIBRE;

int enAz[SENSOR_SAYISI];
int enCok[SENSOR_SAYISI];
int esik[SENSOR_SAYISI];
int sonYon = 0;
unsigned long durumBasla = 0;
unsigned long turBasla = 0;
unsigned long kayipMs = 0;
unsigned long enUzunMs = 0;

${MOTOR2_FN}
void setup() {
${SETUP_PINS}  Serial.begin(9600);
  // TODO: enAz/enCok'u başlat
}

void loop() {
  unsigned long simdi = millis();
  // TODO: KALIBRE: sallan, min/max ölç; sonunda "esikler: a b c d e" yaz; kontrast yetmezse "KALIBRASYON HATASI"
  // TODO: IZLE / BOSLUK / ARAMA: 88-89. derslerdeki mantık
  // TODO: beş sensör birden çizgideyse (bitiş bandı) dur ve "BITTI sure=<ms> kayip=<ms> enuzun=<ms>" yaz
  // TODO: delay() kullanma
}
`,
  solutionSketch: 'cizgi_proje',
  scenario: (s) => { s.until((n) => /BITTI|HATASI|KAYBOLDU/.test(n.serial), 30000); s.advance(800) },
  goals: [
    { id: 'kalibre', text: 'Başlangıçta kalibre et ve "esikler: a b c d e" yazdır (eşikler yaklaşık 511).', behavior: true, check: serialHas(/esikler: (\d+ ){4}\d+/) },
    { id: 'bitir', text: 'Pisti bitir: kavisi, dik virajı ve boşluğu geçip bitiş bandına ulaş.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null },
    { id: 'rapor', text: 'Bitişte "BITTI sure=.. kayip=.. enuzun=.." raporunu yazdır.', behavior: true, check: serialHas(/BITTI sure=\d+ kayip=\d+ enuzun=\d+/) },
    { id: 'sure', text: 'Pisti 20 saniyenin altında bitir.', behavior: true, check: ({ snap }) => (snap as RS).finishedAtS !== null && (snap as RS).finishedAtS! < 20 },
    { id: 'durus', text: 'Bitiş bandında robot dursun.', behavior: true, check: ({ snap }) => /BITTI/.test(snap.serial) && Math.abs((snap as RS).v) < 0.01 && (snap as RS).inZone.has('bitis') },
    { id: 'delay', text: 'Zamanlamada delay() kullanma; millis() ile ölç.', check: ({ code }) => { const c = code.replace(/\/\/.*$/gm, ''); return !/\bdelay\s*\(/.test(c) && /\bmillis\s*\(/.test(c) } },
  ],
}

export const R_H3_ACTIVITIES: ActivityMap = {
  [rk(3, 1)]: d86, [rk(3, 2)]: d87, [rk(3, 3)]: d88, [rk(3, 4)]: d89, [rk(3, 5)]: d90,
}

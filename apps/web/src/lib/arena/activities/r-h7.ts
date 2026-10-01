import { armScene } from '../arm-scenes'
import { codeHas, lastLine, serialHas } from '../goals'
import { roverScene } from '../scenes'
import type { ArenaActivity, ArmSnapshot } from '../types'
import { PIN_HEADER, SETUP_PINS, rk, type ActivityMap, type RS } from './helpers'

/** Modül 5, hafta 7 (Davranış ve robot kol; ders 106-110). Anahtar: "robotik:7:<ders>". */

const arm = (s: unknown) => s as ArmSnapshot
const noComment = (c: string) => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

// ---------------------------------------------------------------- Ders 106: sensör birleştirme
const d106: ArenaActivity = {
  intro: 'Robot yerinde döner; jiroskop 2 °/s sapmalı. Yalnız jiroskop zamanla kayar, enkoder kaymaz ama tekerlek kayar; ikisini tamamlayıcı filtreyle birleştir ve "t= jiro= enk= birlesik=" yaz.',
  scene: roverScene({
    id: 'r7-106', title: 'Dönen robot', description: 'Robot 25 saniye yerinde döner; gerçek yönelim panelde "Yön" olarak görünür.',
    width: 4, height: 4, pose: { x: 2, y: 2, theta: 0 }, sensors: { encoders: true, imu: true },
    extra: { gyroBiasDps: 2, gyroNoiseDps: 0.4, seed: 5 }, timeLimitS: 30,
  }),
  starter: () => `#include <Wire.h>

${PIN_HEADER}const int MPU = 0x68;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_YOLU = 2 * PI * 0.033 / 20;   // bir tıkta tekerlek yolu (m)
const float AKS = 0.12;                        // aks aralığı (m)
const float ALFA = 0.98;
const float DUYARLILIK = 65.5;                 // ±500 °/s ölçeği
const unsigned long DONGU_MS = 20;

volatile long tikSol = 0, tikSag = 0;
float yonJiro = 0;        // yalnız jiroskop (derece)
float yonBirlesik = 0;    // tamamlayıcı filtre (derece)
unsigned long sonDongu = 0, sonYazdir = 0;

void sayacSol() { tikSol++; }
void sayacSag() { tikSag++; }

void mpuYaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

float yawHizi() {         // °/s, sola dönüş +
  // TODO: 0x47 yazmacından iki bayt oku, DUYARLILIK'a böl
  return 0;
}

float enkoderYonelimi() { // derece
  // TODO: (sağ tık - sol tık) * TIK_YOLU / AKS radyan, dereceye çevir
  return 0;
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
  Wire.begin();
  mpuYaz(0x6B, 0);
  mpuYaz(0x1B, 0x08);                   // ±500 °/s
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);
  // TODO: robotu yerinde döndür (sol geri, sağ ileri)
}

void loop() {
  // TODO: her DONGU_MS'de: yonJiro += yawHizi() * dt;
  //       yonBirlesik = ALFA * (yonBirlesik + yawHizi() * dt) + (1 - ALFA) * enkoderYonelimi();
  // TODO: her 1 sn "t=<sn> jiro=<°> enk=<°> birlesik=<°>" yaz
}
`,
  solutionSketch: 'sensor_birlestirme',
  scenario: (s) => { s.until((n) => n.timeS >= 25.3, 32000); s.advance(300) },
  goals: [
    { id: 'satir', text: 'Her saniye "t=.. jiro=.. enk=.. birlesik=.." satırını yazdır.', behavior: true, check: serialHas(/t=\d+ jiro=-?[\d.]+ enk=-?[\d.]+ birlesik=-?[\d.]+/) },
    { id: 'kayma', text: 'Yalnız jiroskop yönelimi gerçek yönden 30°’den fazla kaysın (sapma birikir).', behavior: true, check: ({ snap }) => {
      const m = lastLine(snap.serial).match(/jiro=(-?[\d.]+)/)
      return !!m && Math.abs(Number(m[1]) - (snap as RS).headingChangeDeg) > 30
    } },
    { id: 'birlesik', text: 'Birleşik yönelim gerçek yönden 8°’den az sapsın (20 sn sonra).', behavior: true, check: ({ snap }) => {
      const m = lastLine(snap.serial).match(/t=(\d+) .*birlesik=(-?[\d.]+)/)
      return !!m && Number(m[1]) >= 20 && Math.abs(Number(m[2]) - (snap as RS).headingChangeDeg) < 8
    } },
    { id: 'enkoder', text: 'Enkoder yönelimi de gerçek yöne 8° içinde yakın olsun.', behavior: true, check: ({ snap }) => {
      const m = lastLine(snap.serial).match(/t=(\d+) .*enk=(-?[\d.]+)/)
      return !!m && Number(m[1]) >= 20 && Math.abs(Number(m[2]) - (snap as RS).headingChangeDeg) < 8
    } },
    { id: 'filtre', text: 'Tamamlayıcı filtre katsayısını (ALFA) kullan.', check: codeHas(/alfa/i) },
  ],
}

// ---------------------------------------------------------------- Ders 107: davranış tabanlı kontrol
const d107: ArenaActivity = {
  intro: 'Üç davranış (KAC > CIZGI > DOLAS) öncelik sırasıyla hakemlik eder; hangisinin devrede olduğunu "t=.. DAVRANIS" diye yaz. Robot çizgi üstünde başlar, çizginin ucunda duvar var.',
  scene: roverScene({
    id: 'r7-107', title: 'Çizgi ve duvar', description: 'Dikey bir çizgi ve ucunda duvar parçası var. Çizgi izlerken engel çıkınca KAC öne geçmeli.',
    pose: { x: 1, y: 0.25, theta: Math.PI / 2 + 0.1 }, sensors: { line: true, ultrasonic: true },
    walls: [[0.7, 1.6, 1.3, 1.6]], lines: [[[1.0, 0.3], [1.0, 1.85]]], extra: { noiseCm: 0.5, seed: 3 }, timeLimitS: 30,
  }),
  starter: () => `${PIN_HEADER}const int TRIG = 11, ECHO = 12;
const int SENS_SOL = A0, SENS_ORTA = A1, SENS_SAG = A2;

const float KAC_BASLA_CM = 25;
const float KAC_BITIR_CM = 60;
const int CIZGI_ESIK = 500;          // analogRead: çizgi ≈ 860, zemin ≈ 164

struct Oneri {
  bool aktif;
  int sol;
  int sag;
};

enum Davranis { KAC, CIZGI, DOLAS, DAVRANIS_SAYISI };   // sıra = öncelik
const char* DAVRANIS_ADI[] = {"KAC", "CIZGI", "DOLAS"};

void surus(int sol, int sag) {
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

Oneri kac() {
  Oneri o = {false, 0, 0};
  // TODO: ön mesafe KAC_BASLA_CM'den kısaysa devreye gir (histerezis: KAC_BITIR_CM'de bırak), yerinde dön
  return o;
}

Oneri cizgiyiIzle() {
  Oneri o = {false, 0, 0};
  // TODO: A0-A2 > CIZGI_ESIK; hiçbiri çizgide değilse devrede değil, yoksa çizgiye doğru yönel
  return o;
}

Oneri dolas() {
  Oneri o = {true, 170, 170};     // her zaman devrede: varsayılan
  // TODO: arada rastgele kısa dönüşler
  return o;
}

void setup() {
${SETUP_PINS}  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  // TODO: ön mesafeyi ölç; üç öneriyi sırayla (KAC, CIZGI, DOLAS) sor, İLK aktif olanı uygula
  // TODO: devredeki davranış değişince "t=<ms> <AD>" yaz
}
`,
  solutionSketch: 'davranis_oncelik',
  runSeconds: 30,
  goals: [
    { id: 'ilk', text: 'Robot çizgi üstünde başladığı için ilk devreye giren davranış CIZGI olsun.', behavior: true, check: serialHas(/^t=\d+ CIZGI/m) },
    { id: 'oncelik', text: 'Çizgi ucundaki duvara yaklaşınca KAC, CIZGI’nin önüne geçsin (önce CIZGI, sonra KAC yazılsın).', behavior: true, check: serialHas(/t=\d+ CIZGI[\s\S]*t=\d+ KAC/) },
    { id: 'uc', text: 'Üç davranış da (KAC, CIZGI, DOLAS) en az bir kez devreye girsin.', behavior: true, check: ({ snap }) => ['KAC', 'CIZGI', 'DOLAS'].every((a) => new RegExp(`t=\\d+ ${a}\\b`).test(snap.serial)) },
    { id: 'carpma', text: 'Hiç çarpma, 25 saniye boyunca (hakem KAC’ı öne alıyor).', behavior: true, check: ({ snap }) => (snap as RS).timeS >= 25 && (snap as RS).collisions === 0 },
    { id: 'yapi', text: 'Davranışları bir enum ve öneri yapısıyla (struct) yaz.', check: ({ code }) => codeHas(/\benum\b/)({ code }) && codeHas(/\bstruct\b/)({ code }) },
  ],
}

// ---------------------------------------------------------------- Ders 108: robot kol, ters kinematik
const T108: Array<[string, number, number]> = [['t1', 14, 6], ['t2', 10, 10], ['t3', -6, 12]]
const d108: ArenaActivity = {
  intro: 'İki eklemli kol (10 cm + 10 cm): her hedef için ters kinematikle omuz ve dirsek açısını hesapla, servolara yaz. Erişilemeyen hedefte servoya yazma, nedenini söyle. Yeşil daireler erişilebilir hedeflerdir.',
  scene: armScene({
    id: 'r7-108', title: 'Hedefe uzan', description: 'Kol yandan görünür (omuz solda, x ileri, y yukarı). Daireler hedef noktalar (cm).',
    zones: [...T108.map(([id, x, y]) => ({ id, label: `${x},${y}`, x, y, r: 1 })), { id: 't4', label: '18,0', x: 18, y: 0, r: 1 }],
    timeLimitS: 14,
  }),
  starter: () => `#include <Servo.h>

const int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;
const float L1 = 10.0, L2 = 10.0;         // cm
const float DERECE = 180.0 / PI;

Servo omuz, dirsek, tutucu;

int acidanUs(float aci) {                 // 0-180° → darbe genişliği (µs)
  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);
}

void ileri(float q1, float q2, float &x, float &y) {
  // TODO: x = L1 cos(q1) + L2 cos(q1 - q2); y benzer (sin)
  x = 0; y = 0;
}

// 0: tamam, 1: erişilemez (çok uzak), 2: servo sınırı dışında
int ters(float x, float y, float &q1, float &q2) {
  // TODO: cos(q2) = (r² - L1² - L2²) / (2 L1 L2); |c| > 1 ise 1 döndür
  //       q2 = acos(c); q1 = atan2(y, x) + atan2(L2 sin(q2), L1 + L2 cos(q2)); sınır dışıysa 2
  return 1;
}

const int HEDEF_SAYISI = 6;
const float HEDEF[HEDEF_SAYISI][2] = {
  {14, 6}, {10, 10}, {18, 0}, {-6, 12}, {8, -12}, {25, 5}
};

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN);
  dirsek.attach(DIRSEK_PIN);
  tutucu.attach(TUTUCU_PIN);
  omuz.writeMicroseconds(acidanUs(90));    // başlangıç: kol dik yukarı
  dirsek.writeMicroseconds(acidanUs(0));
  tutucu.write(90);
  delay(1000);
  // TODO: her hedef için: ters(), "t=.. hedef=x,y q1=.. q2=.. ileri=x,y hata_mm=.." yaz ve servolara yaz;
  //       erişilemezse " ULASILAMAZ uzak" ya da " ULASILAMAZ servo siniri" yaz, servolara DOKUNMA; 1500 ms bekle
}

void loop() {
}
`,
  solutionSketch: 'kol_ters_kinematik',
  runSeconds: 11,
  goals: [
    ...T108.map(([id, x, y]): ArenaActivity['goals'][number] => ({
      id: `uc-${id}`, text: `Kolun ucu (${x}; ${y}) cm hedefine 1 cm içinde otursun.`, behavior: true, check: ({ snap }) => arm(snap).inZone.has(id),
    })),
    { id: 'hata', text: 'İleri kinematikle geri hesap yap: "hata_mm" 1 mm’nin altında yazdırılsın.', behavior: true, check: serialHas(/hata_mm=0\.\d+/) },
    { id: 'ulasilamaz', text: 'Erişilemeyen iki hedefi nedenleriyle bildir: "ULASILAMAZ uzak" ve "ULASILAMAZ servo siniri".', behavior: true, check: ({ snap }) => /ULASILAMAZ uzak/.test(snap.serial) && /ULASILAMAZ servo siniri/.test(snap.serial) },
  ],
}

// ---------------------------------------------------------------- Ders 109: robot kol, al-bırak
const d109: ArenaActivity = {
  intro: 'Dokuz adımlık al-bırak dizisini yumuşak hareketle çalıştır: nesneyi (16; 2) noktasından al, (7; 5) bölgesine bırak, eve dön. Servo komutları 2°’den fazla sıçramasın.',
  scene: armScene({
    id: 'r7-109', title: 'Al-bırak', description: 'Turuncu kutu nesne, yeşil daire bırakma bölgesi. Tutucu 90°’nin altına inince kapalı sayılır.',
    objects: [{ id: 'nesne', label: 'Nesne', x: 16, y: 2 }], zones: [{ id: 'birak', label: 'Bırak', x: 7, y: 5, r: 2.5 }], timeLimitS: 20,
  }),
  starter: () => `#include <Servo.h>

const int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;
const float L1 = 10.0, L2 = 10.0;
const float DERECE = 180.0 / PI;
const float ACIK = 120, KAPALI = 60;
const unsigned long KARE_MS = 20;          // servo çerçeve süresi

Servo omuz, dirsek, tutucu;

struct Adim {
  const char* ad;
  float x, y;
  float tut;
  unsigned long sure;
};

const int ADIM_SAYISI = 9;
const Adim DIZI[ADIM_SAYISI] = {
  {"NESNE_USTU", 16, 8,  ACIK,   1500},
  {"ASAGI",      16, 2,  ACIK,    800},
  {"KAVRA",      16, 2,  KAPALI,  900},
  {"YUKARI",     16, 8,  KAPALI,  800},
  {"TASI",        7, 12, KAPALI, 1500},
  {"INDIR",       7, 5,  KAPALI,  800},
  {"BIRAK",       7, 5,  ACIK,    900},
  {"KALK",        7, 12, ACIK,    800},
  {"EVE",         2, 14, ACIK,   1500}
};

float simdiki[3];      // omuz, dirsek, tutucu: şu anki açılar
float baslangic[3];
float hedef[3];
int adim = -1;
unsigned long adimBasi = 0, sonKare = 0;

int acidanUs(float aci) {
  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);
}

bool ters(float x, float y, float &q1, float &q2) {
  // TODO: 108. dersteki ters kinematik; ulaşılamıyorsa false
  return false;
}

void adimBaslat(int i) {
  // TODO: başlangıç = şimdiki açılar; hedef açıları ters() ile bul; "t=<ms> <AD> <q1> <q2> <tutucu>" yaz
}

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN);
  dirsek.attach(DIRSEK_PIN);
  tutucu.attach(TUTUCU_PIN);
  // TODO: başlangıç konumu (2, 14), tutucu KAPALI; servolara yaz; 1 sn bekle; ilk adımı başlat
}

void loop() {
  // TODO: delay() yok; her KARE_MS'de oran = geçen / süre (en çok 1) ile ara açıyı hesapla ve servolara yaz;
  //       oran 1 olunca sıradaki adım; dizi bitince "t=<ms> BITTI" yaz
}
`,
  solutionSketch: 'kol_al_birak',
  scenario: (s) => { s.until((n) => /BITTI/.test(n.serial), 16000); s.advance(300) },
  goals: [
    { id: 'sira', text: 'Dokuz adımı sırayla yazdır: NESNE_USTU, ASAGI, KAVRA, YUKARI, TASI, INDIR, BIRAK, KALK, EVE.', behavior: true, check: serialHas(/NESNE_USTU[\s\S]*ASAGI[\s\S]*KAVRA[\s\S]*YUKARI[\s\S]*TASI[\s\S]*INDIR[\s\S]*BIRAK[\s\S]*KALK[\s\S]*EVE/) },
    { id: 'tuttu', text: 'Nesneyi yakala: tutucu yalnız kol nesnenin yanında dururken kapansın.', behavior: true, check: ({ snap }) => arm(snap).held === 'nesne' },
    { id: 'birakti', text: 'Nesneyi bırakma bölgesine bırak.', behavior: true, check: ({ snap }) => arm(snap).placed.nesne === 'birak' },
    { id: 'yumusak', text: 'Yumuşak hareket: servo komutları hiçbir çerçevede 2,5°’den fazla sıçramasın.', hint: 'Ani write() 60° sıçratır; adımları oranla böl.', behavior: true, check: ({ snap }) => /BITTI/.test(snap.serial) && arm(snap).maxJumpDeg <= 2.5 },
    { id: 'eve', text: 'Dizi "BITTI" ile bitsin ve kol (2; 14) başlangıç konumuna dönsün.', behavior: true, check: ({ snap }) => /BITTI/.test(snap.serial) && Math.hypot(arm(snap).tipX - 2, arm(snap).tipY - 14) < 0.5 },
    { id: 'millis', text: 'Zamanlamayı millis() ile yap, bekleme için delay() kullanma (setup dışında).', check: ({ code }) => /\bmillis\s*\(/.test(noComment(code)) },
  ],
}

// ---------------------------------------------------------------- Ders 110: proje, gezgin robot
const d110: ArenaActivity = {
  intro: 'Gezgin robot: KAC > ZIYARET > DOLAS davranışları, enkoder + jiroskopla konum tahmini. 12 saniye arama yap, sonra (1,5; 1,5) bölgesini ziyaret et ve "BOLGE" yaz. Sağ motor %3 zayıf, jiroskop sapmalı.',
  scene: roverScene({
    id: 'r7-110', title: 'Gezgin alanı', description: '2 x 2 m kutu. Turuncu bölge ziyaret edilecek; arama süresi dolmadan ZIYARET susar.',
    pose: { x: 0.3, y: 0.3, theta: 0 }, sensors: { encoders: true, ultrasonic: true, imu: true },
    zones: [{ id: 'bolge', kind: 'target', label: 'Bölge', x: 1.5, y: 1.5, r: 0.25 }],
    extra: { gain: { left: 1, right: 0.97 }, noiseCm: 1, gyroBiasDps: 1, gyroNoiseDps: 0.3, seed: 5 }, timeLimitS: 42,
  }),
  starter: () => `#include <Wire.h>

${PIN_HEADER}const int ENK_SOL = 2, ENK_SAG = 3;
const int TRIG = 11, ECHO = 12;
const int MPU = 0x68;

const float TIK_YOLU = 2 * PI * 0.033 / 20;     // m / tık
const float AKS = 0.12;                          // m
const float ALFA = 0.98;
const float DUYARLILIK = 65.5;                   // ±500 °/s

const float KAC_BASLA_CM = 25, KAC_BITIR_CM = 60;
const float BOLGE_X = 1.5, BOLGE_Y = 1.5;        // ziyaret edilecek bölgenin merkezi (m)
const float BOLGE_YAKIN = 0.15;                  // "geldim" mesafesi (m)
const unsigned long ARAMA_MS = 12000;            // önce ara, sonra bölgeye git

struct Oneri { bool aktif; int sol; int sag; };
enum Davranis { KAC, ZIYARET, DOLAS, DAVRANIS_SAYISI };
const char* DAVRANIS_ADI[] = {"KAC", "ZIYARET", "DOLAS"};

volatile long tikSol = 0, tikSag = 0;
float x = 0.3, y = 0.3;          // konum tahmini (m)
float yon = 0;                   // birleşik yönelim (derece, sola +)
bool ziyaretEdildi = false;

void sayacSol() { tikSol++; }
void sayacSag() { tikSag++; }

void surus(int sol, int sag) {
  sol = constrain(sol, 0, 255);
  sag = constrain(sag, 0, 255);
  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);
  analogWrite(SOL_EN, sol);
  analogWrite(SAG_EN, sag);
}

void setup() {
${SETUP_PINS}  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU); Wire.write(0x6B); Wire.write(0); Wire.endTransmission(true);
  Wire.beginTransmission(MPU); Wire.write(0x1B); Wire.write(0x08); Wire.endTransmission(true);
}

void loop() {
  // TODO: 20 ms'de bir konumGuncelle(): enkoder tıklarından yol, jiroskop + enkoder birleşik yön, x ve y
  // TODO: her 50 ms'de ön mesafe; üç öneri (KAC, ZIYARET, DOLAS) öncelik sırasıyla
  // TODO: ZIYARET yalnız ARAMA_MS sonra; bölgeye BOLGE_YAKIN kala "t=<sn> BOLGE" yaz
  // TODO: her sn "t=<sn> x=<m> y=<m> yon=<°> <davranış>" yaz
}
`,
  solutionSketch: 'gezgin_robot',
  runSeconds: 40,
  goals: [
    { id: 'kapsama', text: 'Arenanın en az %45’ini gez (64 hücrenin 29’u, 25 cm’lik hücreler).', behavior: true, check: ({ snap }) => (snap as RS).coverCells >= 29 },
    { id: 'carpma', text: 'En çok 3 kez çarp.', behavior: true, check: ({ snap }) => (snap as RS).timeS >= 38 && (snap as RS).collisions <= 3 },
    { id: 'bolge', text: 'Arama süresinden sonra bölgeyi ziyaret et ve "BOLGE" yaz (robot gerçekten bölgede olsun).', behavior: true, check: ({ snap }) => /BOLGE/.test(snap.serial) && (snap as RS).visited.has('bolge') },
    { id: 'tahmin', text: 'Konum tahmini ilk 15 saniyede gerçek konuma 10 cm içinde kalsın (enkoder + jiroskop).', behavior: true, check: ({ snap }) => {
      const m = lastLine(snap.serial).match(/^t=(\d+) x=(-?[\d.]+) y=(-?[\d.]+)/)
      const r = snap as RS
      return !!m && Number(m[1]) >= 8 && Number(m[1]) <= 15 && Math.hypot(Number(m[2]) - r.x, Number(m[3]) - r.y) < 0.1
    } },
    { id: 'yapi', text: 'Davranışları enum ve öneri yapısıyla yaz; zamanlamada delay() kullanma.', check: ({ code }) => codeHas(/\benum\b/)({ code }) && codeHas(/\bstruct\b/)({ code }) && !/\bdelay\s*\(/.test(noComment(code)) },
  ],
}

export const R_H7_ACTIVITIES: ActivityMap = {
  [rk(7, 1)]: d106, [rk(7, 2)]: d107, [rk(7, 3)]: d108, [rk(7, 4)]: d109, [rk(7, 5)]: d110,
}

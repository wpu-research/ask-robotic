import { bumpWall, obstacleField, roverScene } from '../scenes'
import { codeHas, serialCount, serialHas } from '../goals'
import type { ArenaActivity } from '../types'
import { MESAFE_FN, MOTOR_FN, PIN_HEADER, SETUP_PINS, SURUS_FN, rk, type ActivityMap, type RS } from './helpers'

/** Modül 5, hafta 2 (Engel; ders 81-85). Anahtar: "robotik:2:<ders>". */

const SENS_PINS = `const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;
`

// ---------------------------------------------------------------- Ders 81: tampon
const d81: ArenaActivity = {
  intro: 'Robot doğu duvarına doğru gidiyor. Tamponlar basılınca dur, geri çekil, engelin tersine dön ve devam et. Panelde tamponların BASILI/serbest durumunu izle.',
  scene: { ...bumpWall(), id: 'r2-81', pose: { x: 1, y: 1, theta: -0.3 }, zones: [], timeLimitS: 15 },
  starter: () => `${PIN_HEADER}${SENS_PINS.split('\n').filter((l) => /TAMPON/.test(l)).join('\n')}

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde
const int GERI_MS = 400;
const int DONUS_MS = 450;

${MOTOR_FN}
${SURUS_FN}
void setup() {
${SETUP_PINS}  pinMode(TAMPON_SOL, INPUT_PULLUP);   // basılı = LOW
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  // TODO: tamponları oku (basılı = LOW)
  // TODO: temas yoksa düz ilerle: surus(HIZ, HIZ)
  // TODO: temas varsa "CARPMA SOL" / "CARPMA SAG" / "CARPMA ON" yaz;
  //       dur, GERI_MS kadar geri çekil, engelin tersine DONUS_MS kadar dön
}
`,
  solutionSketch: 'tampon_kacis',
  goals: [
    { id: 'tampon', text: 'Tampon basılınca nedenini seri monitöre yaz: "CARPMA SOL", "CARPMA SAG" ya da "CARPMA ON".', behavior: true, check: serialHas(/CARPMA (SOL|SAG|ON)/) },
    { id: 'yumusak', text: 'Duvara gömülmeden dur: robotun gövdesi duvara hiç çarpmasın (tampon önce algılar).', hint: 'Tampon basılır basılmaz motoru durdur ve geri çek.', behavior: true, check: ({ snap }) => /CARPMA/.test(snap.serial) && (snap as RS).collisions === 0 },
    { id: 'don', text: 'Geri çekildikten sonra engelden uzağa en az 25° dön.', behavior: true, check: ({ snap }) => /CARPMA/.test(snap.serial) && (snap as RS).turnedDeg >= 25 },
    { id: 'devam', text: 'Döndükten sonra yola devam et: toplam en az 1,5 m yol al.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 1.5 },
    { id: 'pullup', text: 'Tamponları INPUT_PULLUP ile bağla (basılı = LOW).', check: codeHas(/INPUT_PULLUP/) },
  ],
}

// ---------------------------------------------------------------- Ders 82: mesafe sensörüyle dur ve dön
const d82: ArenaActivity = {
  intro: 'Robot duvara doğru gidiyor; sensör gürültülü (±4 cm). Eşiğin (25 cm) yakınında dur, sağa dön. Tek ölçüm mü, 5 ölçümün medyanı mı daha iyi? Sensör ışını arenada turkuaz koni olarak görünür.',
  scene: roverScene({ id: 'r2-82', title: 'Duvara yaklaş', description: 'Boş kutu; robot doğu duvarına doğru gider. Turkuaz koni mesafe sensörünün ışınıdır.', pose: { x: 0.3, y: 1, theta: 0 }, sensors: { ultrasonic: true }, extra: { noiseCm: 4, seed: 2 }, timeLimitS: 15 }),
  starter: () => `#include <Servo.h>

${PIN_HEADER}const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde
const int ESIK_CM = 25;              // bundan yakındaysa dur
const int N = 5;

${MOTOR_FN}
${SURUS_FN}
${MESAFE_FN}
// N ölçümün ortancası (38. dersteki medyan filtre)
int medyan() {
  // TODO: N ölçümü diziye al, sırala, ortadakini döndür
  return mesafeOlc();
}

Servo bakis;                         // sensörü taşıyan servo

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
${SETUP_PINS}  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  // TODO: mesafeyi ölç; ESIK_CM'den yakınsa dur, "DUR <cm>" yaz, ~450 ms yerinde sağa dön
  // TODO: yakın değilse düz ilerle
}
`,
  solutionSketch: 'mesafe_medyan_dur',
  goals: [
    { id: 'dur', text: 'Engel eşikten yakınsa dur ve "DUR <cm>" yaz.', behavior: true, check: serialHas(/DUR \d+/) },
    { id: 'mesafe', text: 'Robot duvara çarpmadan, sensör duvara 18-30 cm kalınca dursun.', hint: 'Eşik 25 cm; gürültü yüzünden tek ölçüm çok erken ya da çok geç durdurabilir.', behavior: true, check: ({ snap }) => /DUR \d+/.test(snap.serial) && (snap as RS).minFrontTrueCm >= 18 && (snap as RS).minFrontTrueCm <= 30 },
    { id: 'carpma', text: 'Duvara hiç değme.', behavior: true, check: ({ snap }) => /DUR \d+/.test(snap.serial) && (snap as RS).collisions === 0 },
    { id: 'don', text: 'Durduktan sonra yaklaşık 90° dön (en az 70°).', behavior: true, check: ({ snap }) => /DUR \d+/.test(snap.serial) && (snap as RS).turnedDeg >= 70 },
    { id: 'medyan', text: 'Tek ölçüm yerine birkaç ölçümün medyanını kullan.', check: codeHas(/median|medyan|ortanca|sort|sirala/i) },
  ],
}

// ---------------------------------------------------------------- Ders 83: servo taramasıyla en açık yol
const d83: ArenaActivity = {
  intro: 'Robotun önü kapalı, sol tarafı açık. Servo ile 30°-150° arasında 5 yöne bak, en uzak yönü seç ve oraya dön. Koninin dönmesini izle.',
  scene: roverScene({
    id: 'r2-83', title: 'Kapalı önü olan alan', description: 'Önde dik duvar var; sol taraf açık. Servo 90° = ileri, büyük açı = sol.',
    pose: { x: 1, y: 1, theta: 0 }, sensors: { ultrasonic: true }, walls: [[1.35, 0, 1.35, 1.4]], extra: { noiseCm: 1, seed: 4 },
    zones: [{ id: 'acik', kind: 'target', label: 'Açık yol', x: 1.6, y: 1.7, r: 0.2 }], timeLimitS: 15,
  }),
  starter: () => `#include <Servo.h>

${PIN_HEADER}const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;
const int ACI_ADET = 5;
const int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};
const int HIZ = 160;
const int MS_DERECE = 5;             // yerinde dönüş: ~5 ms / derece (HIZ = 160 için)

${MOTOR_FN}
${SURUS_FN}
${MESAFE_FN}
Servo bakis;

void setup() {
  bakis.attach(SERVO_PIN);
${SETUP_PINS}  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  // TODO: her açıya servoyu çevir, servonun varmasını bekle (~300 ms), mesafeyi ölç;
  //       "30:120" biçiminde yazdır; en büyük mesafeli açıyı bul
  // TODO: "SECILEN <açı>" yaz; servoyu 90°'ye al; (seçilen açı - 90) derece yerinde dön
}

void loop() {
  // TODO: dönüşten sonra düz ilerle
}
`,
  solutionSketch: 'tara_en_acik',
  runSeconds: 12,
  goals: [
    { id: 'tarama', text: 'Beş yönü sırayla ölç ve "açı:cm" satırları yaz (30, 60, 90, 120, 150).', behavior: true, check: serialHas(/30:\d+\s+60:\d+\s+90:\d+\s+120:\d+\s+150:\d+/) },
    { id: 'secim', text: 'En açık yönü seç: "SECILEN 150" (sol taraf açık).', behavior: true, check: serialHas(/SECILEN 150/) },
    { id: 'don', text: 'Seçtiğin yöne doğru yerinde dön (yaklaşık 60° sola).', behavior: true, check: ({ snap }) => (snap as RS).headingChangeDeg >= 45 && (snap as RS).headingChangeDeg <= 80 },
    { id: 'gecis', text: 'Açık yolun hedef bölgesine ulaş, duvara hiç çarpma.', behavior: true, check: ({ snap }) => (snap as RS).visited.has('acik') && (snap as RS).collisions === 0 },
    { id: 'servo', text: 'Sensörü servoyla çevir (Servo kütüphanesi, write()).', check: ({ code }) => codeHas(/#include\s*<Servo\.h>/)({ code }) && codeHas(/\.write\s*\(/)({ code }) },
  ],
}

// ---------------------------------------------------------------- Ders 84: kaçış durum makinesi
const d84: ArenaActivity = {
  intro: 'Beş durumlu bir kaçış makinesi yaz: ILERI → DUR → TARA → DON → ILERI (sıkışınca GERI). Her geçişte "DURUM <ad>" yazdır.',
  scene: { ...bumpWall(), id: 'r2-84', title: 'Kutu', description: '2 x 2 m kutu; ultrasonik + tampon.', sensors: { ultrasonic: true, bumpers: true }, pose: { x: 0.3, y: 1, theta: 0 }, zones: [], extra: { noiseCm: 2, seed: 5 }, timeLimitS: 25 },
  starter: () => `#include <Servo.h>

enum Durum { ILERI, DUR, TARA, DON, GERI };
const char* DURUM_ADI[] = { "ILERI", "DUR", "TARA", "DON", "GERI" };

${PIN_HEADER}${SENS_PINS}
const int HIZ = 160;
const int ESIK_CM = 25;              // bundan yakında engel varsa dur
const int ACIK_CM = 35;              // taramada en iyi yön bundan yakınsa sıkışmışız
const int ACI_ADET = 5;
const int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};
const int MS_DERECE = 5;             // yerinde dönüş: ~5 ms / derece
const unsigned long OLCUM_ARALIK = 50;
const unsigned long DUR_MS = 250;
const unsigned long SERVO_BEKLE = 300;
const unsigned long GERI_MS = 400;

${MOTOR_FN}
${SURUS_FN}
${MESAFE_FN}
Servo bakis;
Durum durum = ILERI;

void gec(Durum yeni) {
  durum = yeni;
  Serial.print("DURUM ");
  Serial.println(DURUM_ADI[yeni]);
  // TODO: durum başlangıç zamanını millis() ile kaydet
}

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);
${SETUP_PINS}  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP); pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
  gec(ILERI);
}

void loop() {
  switch (durum) {
    case ILERI:  /* TODO: ilerle; her OLCUM_ARALIK'ta mesafe ölç; yakınsa DUR; tampon basılıysa GERI */ break;
    case DUR:    /* TODO: DUR_MS bekle, sonra TARA */ break;
    case TARA:   /* TODO: 5 yönde ölç (delay yok: SERVO_BEKLE ile); "EN ACIK <açı> <cm>" yaz; hepsi kapalıysa GERI, değilse DON */ break;
    case DON:    /* TODO: |açı - 90| * MS_DERECE ms yerinde dön, sonra ILERI */ break;
    case GERI:   /* TODO: GERI_MS geri git, sonra DON */ break;
  }
}
`,
  solutionSketch: 'kacis_fsm',
  runSeconds: 22,
  goals: [
    { id: 'durumlar', text: 'Durumlar bu sırayla görünsün: ILERI, DUR, TARA, DON.', behavior: true, check: serialHas(/DURUM ILERI[\s\S]*?DURUM DUR[\s\S]*?DURUM TARA[\s\S]*?DURUM DON/) },
    { id: 'turlar', text: 'En az iki tam tur yap (iki kez TARA ve DON).', behavior: true, check: ({ snap }) => (snap.serial.match(/DURUM TARA/g) ?? []).length >= 2 && (snap.serial.match(/DURUM DON/g) ?? []).length >= 2 },
    { id: 'enacik', text: 'Taramada en açık yönü yaz: "EN ACIK <açı> <cm>".', behavior: true, check: serialHas(/EN ACIK \d+ \d+/) },
    { id: 'gezin', text: 'Duvara çarpmadan en az 2 m gezin.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 2.0 && (snap as RS).collisions === 0 },
    { id: 'yapi', text: 'Durumları enum ve switch ile yaz.', check: ({ code }) => codeHas(/\benum\b/)({ code }) && codeHas(/\bswitch\b/)({ code }) },
  ],
}

// ---------------------------------------------------------------- Ders 85: proje, otonom engelden kaçan robot
const d85: ArenaActivity = {
  intro: 'Engelli alanda en az 3 m yol al, en fazla 3 kez çarp. Seri monitörden x (dur) ve g (git) komutlarını kabul et, 5 saniyede bir RAPOR yaz.',
  scene: { ...obstacleField(), id: 'r2-85', title: 'Engelli alan', description: 'Ortada blok ve iki duvar parçası.', extra: { noiseCm: 2, seed: 1 }, timeLimitS: 45 },
  quickSend: [{ label: 'x (dur)', text: 'x' }, { label: 'g (git)', text: 'g' }],
  starter: () => `#include <Servo.h>

enum Durum { ILERI, DUR, TARA, DON, GERI };
const char* DURUM_ADI[] = { "ILERI", "DUR", "TARA", "DON", "GERI" };

${PIN_HEADER}${SENS_PINS}
const int HIZ = 160;
const int ESIK_CM = 25;
const int ACIK_CM = 35;
const unsigned long RAPOR_MS = 5000;
const unsigned long TAKILMA_MS = 1500;   // bu sürede mesafe 6 cm değişmediyse sıkıştık

${MOTOR_FN}
${SURUS_FN}
${MESAFE_FN}
Servo bakis;
Durum durum = ILERI;
bool calisiyor = true;
int carpmaSayisi = 0;

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);
${SETUP_PINS}  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP); pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  // TODO: seriden 'x' gelirse dur ("KOMUT DUR"), 'g' gelirse devam et ("KOMUT GIT")
  // TODO: her RAPOR_MS'de "RAPOR carpma=<sayı>" yaz
  // TODO: 84. dersteki durum makinesi + tampon + takılma denetimi ("SIKISTI")
}
`,
  solutionSketch: 'otonom_kacis',
  scenario: (s) => {
    s.advance(20000)
    s.sendSerial('x'); s.advance(2500)
    s.sendSerial('g'); s.advance(9000)
  },
  goals: [
    { id: 'yol', text: 'En az 3 m yol al.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 3.0 },
    { id: 'carpma', text: 'En fazla 3 kez çarp (tamponlar gövde çarpmasını önler).', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 3.0 && (snap as RS).collisions <= 3 },
    { id: 'komut', text: 'x ile dur ("KOMUT DUR"), g ile devam et ("KOMUT GIT").', hint: 'Seri monitörün altındaki x ve g düğmelerini kullan.', behavior: true, check: ({ snap }) => /KOMUT DUR[\s\S]*KOMUT GIT/.test(snap.serial) },
    { id: 'rapor', text: '5 saniyede bir "RAPOR carpma=N" yaz (en az 3 rapor).', behavior: true, check: serialCount(/RAPOR carpma=\d+/, 3) },
    { id: 'gezgin', text: 'Alanın büyük bölümünü gez: en az 12 hücre (25 cm’lik) dolaş.', hint: 'Panelde "Gezilen alan" sayılır.', behavior: true, check: ({ snap }) => (snap as RS).coverCells >= 12 },
  ],
}

export const R_H2_ACTIVITIES: ActivityMap = {
  [rk(2, 1)]: d81, [rk(2, 2)]: d82, [rk(2, 3)]: d83, [rk(2, 4)]: d84, [rk(2, 5)]: d85,
}

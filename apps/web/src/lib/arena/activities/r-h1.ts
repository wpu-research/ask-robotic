import { roverScene } from '../scenes'
import { codeHas, lastLine, serialHas, stopped } from '../goals'
import type { ArenaActivity, ArenaScenario } from '../types'
import { MOTOR_FN, PIN_HEADER, SETUP_PINS, rk, type ActivityMap, type RS } from './helpers'

/** Modül 5, hafta 1 (Hareket temelleri; ders 76-80). Anahtar: "robotik:1:<ders>". */

const cmd = (s: ArenaScenario, text: string, ms: number) => { s.sendSerial(text); s.advance(ms) }

// ---------------------------------------------------------------- Ders 76: diferansiyel sürüş
const d76: ArenaActivity = {
  intro: 'Seri monitörden "sol sağ" PWM çiftleri gönder (ör. 204 204, -204 204, 153 204). Robot hem hareket etsin hem formülün sonucunu (v, ω, R) yazsın.',
  scene: roverScene({
    id: 'r1-76', title: 'Açık alan', description: '8 x 6 m boş alan.', width: 8, height: 6, pose: { x: 3, y: 3, theta: 0 }, timeLimitS: 40,
    zones: [{ id: 'baslangic', kind: 'start', x: 3, y: 3, r: 0.12 }],
  }),
  quickSend: [{ label: 'İleri 204 204', text: '204 204\n' }, { label: 'Yerinde sol -204 204', text: '-204 204\n' }, { label: 'Kavis 153 204', text: '153 204\n' }, { label: 'Dur 0 0', text: '0 0\n' }],
  starter: () => `${PIN_HEADER}
const float L = 0.12;       // aks aralığı (m)
const float V_MAX = 0.396;  // PWM 255'te tekerlek hızı (m/s)
const int OLU_PWM = 51;     // bu değerin altında tekerlek dönmez

${MOTOR_FN}
float pwmdenHiz(int pwm) {
  // TODO: |pwm| <= OLU_PWM ise 0; değilse (|pwm| - OLU_PWM) / (255 - OLU_PWM) * V_MAX, işaret pwm'inkiyle aynı
  return 0;
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
  Serial.setTimeout(100);
  Serial.println("Hazir: sol_pwm sag_pwm");
}

void loop() {
  if (Serial.available() == 0) return;
  String satir = Serial.readStringUntil('\\n');
  // TODO: "sol sag" satırını iki sayıya ayır (indexOf, substring, toInt), -255..255'e sınırla
  // TODO: iki motoru sür
  // TODO: vL, vR, v = (vR + vL) / 2 ve w = (vR - vL) / L hesapla;
  //       "vL=.. vR=.. v=.. w=.. R=.." biçiminde yazdır (R: vR == vL ise "duz")
}
`,
  solutionSketch: 'diferansiyel_hesap',
  scenario: (s) => { cmd(s, '204 204\n', 2500); cmd(s, '-204 204\n', 1500); cmd(s, '153 204\n', 2500); cmd(s, '0 0\n', 800) },
  goals: [
    { id: 'hazir', text: 'Program açılışta "Hazir" yazsın (seri haberleşme çalışıyor).', behavior: true, check: ({ snap }) => /Hazir/.test(snap.serial) },
    { id: 'formul', text: 'Her komutta vL, vR, v ve w değerlerini seri monitöre yazdır.', hint: 'Çıktı: vL=0.297 vR=0.297 v=0.297 w=0.000 R=duz', behavior: true, check: serialHas(/vL=-?[\d.]+ vR=-?[\d.]+ v=-?[\d.]+ w=-?[\d.]+ R=\S+/) },
    { id: 'duz', text: 'Robotu düz sürerek en az 0,5 m yol aldır.', hint: 'Seri monitöre 204 204 gönder.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 0.5 },
    { id: 'don', text: 'Robotu yerinde en az yarım tur (180°) döndür.', hint: 'Zıt işaretli PWM gönder: -204 204.', behavior: true, check: ({ snap }) => (snap as RS).turnedDeg >= 180 },
    { id: 'kavis', text: 'Bir kavis çiz: yarıçap (R) sayı olarak yazdırılsın.', hint: '153 204 gibi farklı iki PWM gönder.', behavior: true, check: serialHas(/R=-?\d+\.\d+/) },
    { id: 'omega', text: 'Koduna dönme hızı formülünü yaz: ω = (vR − vL) / L.', check: codeHas(/\(\s*vR\s*-\s*vL\s*\)\s*\/\s*L\b/) },
  ],
}

// ---------------------------------------------------------------- Ders 77: motor sürücüsü
const d77: ArenaActivity = {
  intro: 'Her 1,5 saniyede bir ileri → fren → geri → serbest bırak durumlarını sırayla uygula ve adını seri monitöre yaz.',
  scene: roverScene({ id: 'r1-77', title: 'Kutu', width: 2, height: 2, pose: { x: 0.8, y: 1, theta: 0 }, timeLimitS: 14, zones: [{ id: 'baslangic', kind: 'start', x: 0.8, y: 1, r: 0.12 }] }),
  starter: () => `${PIN_HEADER}
enum Durum { ILERI, FREN, GERI, SERBEST };
const char* ISIMLER[] = { "ILERI", "FREN", "GERI", "SERBEST" };

const int PWM_ILERI = 200;
const int PWM_GERI = 120;
const unsigned long ADIM_SURESI = 1500;   // ms

void surucu(int en, int in1, int in2, Durum d, int pwm) {
  switch (d) {
    case ILERI:
      // TODO: IN1 = HIGH, IN2 = LOW, EN'e pwm
      break;
    case GERI:
      // TODO: IN1 = LOW, IN2 = HIGH, EN'e pwm
      break;
    case FREN:
      // TODO: IN1 = IN2 = HIGH, EN = 255 (motor uçları kısa devre)
      break;
    case SERBEST:
      // TODO: IN1 = IN2 = LOW, EN = 0
      break;
  }
}

int sonAdim = -1;

void setup() {
${SETUP_PINS}  Serial.begin(9600);
}

void loop() {
  // TODO: adim = (millis() / ADIM_SURESI) % 4; adım değişince iki motoru da yeni duruma sok ve ismini yazdır
}
`,
  solutionSketch: 'surucu_durumlari',
  runSeconds: 7,
  goals: [
    { id: 'siralama', text: 'Seri monitörde ILERI, FREN, GERI, SERBEST adları bu sırayla görünsün.', behavior: true, check: serialHas(/ILERI\s+FREN\s+GERI\s+SERBEST/) },
    { id: 'hareket', text: 'Robot ileri-geri toplam en az 0,4 m yol alsın.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 0.4 },
    { id: 'serbest', text: 'SERBEST durumunda robot dursun.', hint: 'EN = 0 ve IN1 = IN2 = LOW.', behavior: true, check: ({ snap }) => /SERBEST$/.test(lastLine(snap.serial)) && stopped(snap as RS, 0.01) && snap.serialAgeS > 0.8 },
    { id: 'yapi', text: 'Durumları enum ve switch ile yaz (28. ders).', check: ({ code }) => codeHas(/\benum\b/)({ code }) && codeHas(/\bswitch\b/)({ code }) },
  ],
}

// ---------------------------------------------------------------- Ders 78: hız, ölü bölge, kalibrasyon
const d78: ArenaActivity = {
  intro: 'Seri monitörden "K 20" (kalibre, 20 cm/s) ve "N 20" (naif) komutlarını gönder; aynı isteğin iki yöntemle farklı gerçek hız verdiğini gör. (İstersen sahnedeki D2 düğmesiyle ölü bölge taramasını da deneyebilirsin.)',
  scene: roverScene({
    id: 'r1-78', title: 'Uzun yol', description: 'Hız ölçümü için 8 m’lik düz alan.', width: 8, height: 1.4, pose: { x: 0.4, y: 0.7, theta: 0 }, timeLimitS: 60,
    buttons: [{ pin: 2, label: 'Düğme (D2)' }], zones: [{ id: 'baslangic', kind: 'start', x: 0.4, y: 0.7, r: 0.12 }],
  }),
  quickSend: [5, 10, 20, 30, 39].map((v) => ({ label: `K ${v}`, text: `K ${v}\n` })).concat([10, 20].map((v) => ({ label: `N ${v}`, text: `N ${v}\n` }))),
  starter: () => `${PIN_HEADER}
const float V_MAX = 0.396;   // PWM 255'te ölçülen hız (m/s)
const int OLU_PWM = 51;      // ölçülen ölü bölge sonu

// Naif eşleme: 0..255 arasında doğrusal (ölü bölgeyi unutur)
int naifPwm(float v) {
  return constrain((int)(255.0 * v / V_MAX), 0, 255);
}

// Kalibre eşleme: ölü bölgeyi atlar, V_MAX'ta 255'e varır
int hizdanPwm(float v) {
  // TODO: v < 0.005 ise 0; v > V_MAX ise V_MAX'a sınırla;
  //       OLU_PWM + (255 - OLU_PWM) * v / V_MAX (yuvarla)
  return 0;
}

void ileri(int deger) {
  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);
  analogWrite(SOL_EN, deger);
  analogWrite(SAG_EN, deger);
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
  Serial.setTimeout(100);
  Serial.println("Komut: K 20 (kalibre) veya N 20 (naif), hiz cm/s");
}

void loop() {
  // TODO: seriden "K 20" / "N 20" satırı oku; mod harfini ve cm/s değerini ayır (m/s'ye çevir)
  // TODO: moda göre pwm hesapla, ileri(pwm) ile sür, "mod=K istenen=0.200 pwm=..." yaz
}
`,
  solutionSketch: 'kalibre_hiz',
  scenario: (s) => { cmd(s, 'K 5\n', 2500); cmd(s, 'K 20\n', 3000); cmd(s, 'N 20\n', 3000); cmd(s, 'K 0\n', 1000) },
  goals: [
    { id: 'komut', text: 'Komuta cevap ver: "mod=K istenen=0.200 pwm=NNN" biçiminde yazdır.', behavior: true, check: serialHas(/mod=[KN] istenen=[\d.]+ pwm=\d+/) },
    { id: 'kalibre', text: 'K 20 gönder: robot 20 cm/s’ye (±1,5 cm/s) otursun.', hint: 'hizdanPwm ölü bölgeyi (51) atlamalı.', behavior: true, check: ({ snap }) => /mod=K istenen=0\.200/.test(lastLine(snap.serial)) && snap.serialAgeS > 1.2 && Math.abs((snap as RS).v - 0.2) < 0.015 },
    { id: 'naif', text: 'N 20 gönder ve naif eşlemenin hedefin belirgin altında kaldığını gör (hız 17 cm/s altında).', behavior: true, check: ({ snap }) => /mod=N istenen=0\.200/.test(lastLine(snap.serial)) && snap.serialAgeS > 1.2 && (snap as RS).v < 0.17 && (snap as RS).v > 0.1 },
    { id: 'yavas', text: 'K 5 gönder: yavaş istekte de robot hareket etsin (ölü bölge atlanmalı).', behavior: true, check: ({ snap }) => /mod=K istenen=0\.050/.test(lastLine(snap.serial)) && snap.serialAgeS > 1.2 && (snap as RS).v > 0.03 },
  ],
}

// ---------------------------------------------------------------- Ders 79: seri komutlarla sürüş
const d79: ArenaActivity = {
  intro: 'Seri monitörden W, S, A, D, X harflerini (ve ardından 0-255 hız, ör. W200) gönder. Geçersiz harfe "?" yaz.',
  scene: roverScene({ id: 'r1-79', title: 'Geniş alan', width: 6, height: 4, pose: { x: 1, y: 2, theta: 0 }, timeLimitS: 60, zones: [{ id: 'baslangic', kind: 'start', x: 1, y: 2, r: 0.12 }] }),
  quickSend: ['W200', 'S150', 'A150', 'D150', 'X', 'Q'].map((t) => ({ label: t, text: `${t}\n` })),
  starter: () => `${PIN_HEADER}
const int VARSAYILAN_HIZ = 150;   // hız yazılmazsa kullanılan PWM
char tampon[12];
int uzunluk = 0;

${MOTOR_FN}
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

void komutIsle(char komut, int hiz) {
  // TODO: W ileri, S geri, A yerinde sola, D yerinde sağa, X dur; geçersizse "?" yaz ve çık
  // TODO: geçerliyse "OK <komut> <hiz>" yaz
}

void setup() {
${SETUP_PINS}  Serial.begin(9600);
  Serial.println("Hazir: W S A D X + hiz (0-255)");
}

void loop() {
  // TODO: karakter karakter oku; satır sonunda (\\n veya \\r) tamponu işle
  //       ilk karakter komut harfi (toupper), kalanı atoi ile hız (constrain 0..255)
}
`,
  solutionSketch: 'seri_komut',
  scenario: (s) => { cmd(s, 'W200\n', 1500); cmd(s, 'X\n', 600); cmd(s, 'S\n', 1000); cmd(s, 'X\n', 600); cmd(s, 'A150\n', 700); cmd(s, 'X\n', 500); cmd(s, 'Q\n', 300) },
  goals: [
    { id: 'hazir', text: 'Açılışta "Hazir" yaz.', behavior: true, check: serialHas(/Hazir/) },
    { id: 'ileri', text: 'W200 ile robotu en az 0,5 m ileri sür ("OK W 200" yazılmalı).', behavior: true, check: ({ snap }) => /OK W 200/.test(snap.serial) && (snap as RS).distanceM >= 0.5 },
    { id: 'don', text: 'A veya D ile yerinde en az 60° dönsün.', behavior: true, check: ({ snap }) => /OK [AD] \d+/.test(snap.serial) && (snap as RS).turnedDeg >= 60 },
    { id: 'varsayilan', text: 'Hız yazmadan gönderilen komutta varsayılan hız 150 kullanılsın ("OK S 150").', behavior: true, check: serialHas(/OK S 150/) },
    { id: 'dur', text: 'X komutu robotu durdursun ("OK X 0").', behavior: true, check: ({ snap }) => /OK X 0/.test(snap.serial) },
    { id: 'gecersiz', text: 'Geçersiz komut ("Q") yalnız "?" yazdırsın, robotu sürmesin.', behavior: true, check: ({ snap }) => /\?\r?\n/.test(snap.serial) },
  ],
}

// ---------------------------------------------------------------- Ders 80: proje, komutlu araba
const d80: ArenaActivity = {
  intro: 'Komutlu arabayı tamamla: W/A/S/D/X komutları cm/s hızla sürsün, 700 ms komut gelmezse kendiliğinden dursun (watchdog).',
  scene: roverScene({
    id: 'r1-80', title: 'Sürüş alanı', width: 4, height: 3, pose: { x: 0.5, y: 2, theta: 0 }, timeLimitS: 30,
    zones: [{ id: 'baslangic', kind: 'start', x: 0.5, y: 2, r: 0.12 }],
  }),
  quickSend: ['W20', 'S20', 'A12', 'D12', 'X', 'Q'].map((t) => ({ label: t, text: `${t}\n` })),
  starter: () => `${PIN_HEADER}const int DURUM_LED = 13;               // yanık = robot sürülüyor

const unsigned long CMD_TIMEOUT = 700;  // ms: bu süre komut gelmezse dur
const float V_MAX = 0.396;              // PWM 255'te hız (m/s)
const int OLU_PWM = 51;                 // ölü bölge sonu
const int VARSAYILAN_CM = 20;           // hız yazılmazsa (cm/s)
const int MAKS_CM = 39;

unsigned long sonKomut = 0;
bool suruyor = false;
char tampon[12];
int uzunluk = 0;

${MOTOR_FN}
int hizdanPwm(float v) {
  // TODO: 78. dersteki kalibre eşleme
  return 0;
}

void tekerlekler(float vSol, float vSag) {
  // TODO: m/s hızı işaretli PWM'e çevir (eksi = geri) ve motor() ile sür
}

void dur() {
  // TODO: tekerlekleri durdur, suruyor = false, LED söndür
}

void komutIsle(char komut, int cm) {
  // TODO: W S A D X komutları; geçersizde "?" yaz ve çık (watchdog yenilenmez!)
  // TODO: geçerli komutta sonKomut = millis(); sürüyorsa LED yak
}

void setup() {
${SETUP_PINS}  pinMode(DURUM_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Hazir");
}

void loop() {
  // TODO: seri satırını oku ve işle
  // TODO: suruyor && millis() - sonKomut > CMD_TIMEOUT ise dur() ve "Komut yok: dur" yaz
}
`,
  solutionSketch: 'komutlu_araba',
  scenario: (s) => {
    // kumanda tuşu basılı tutulur gibi: komutu 200 ms'de bir yinele
    const surdur = (k: string, ms: number) => { for (let t = 0; t < ms; t += 200) { s.sendSerial(k + '\n'); s.advance(200) } }
    s.advance(1500)
    surdur('W20', 1200); s.sendSerial('X\n'); s.advance(500)
    surdur('D12', 800); s.sendSerial('X\n'); s.advance(500)
    s.sendSerial('Q\n'); s.advance(300)
    s.sendSerial('Q\n'); s.advance(300)
    s.sendSerial('W20\n'); s.advance(2000)     // tek komut, sonra sessizlik: watchdog
  },
  goals: [
    { id: 'hazir', text: 'Açılışta güvenli durumda bekle ve "Hazir" yaz; komut gelmeden robot kıpırdamasın.', behavior: true, check: ({ snap }) => /Hazir/.test(snap.serial) && (snap as RS).timeS > 1 && (snap as RS).distanceM === 0 },
    { id: 'surus', text: 'W ile robotu en az 0,3 m ileri sür.', behavior: true, check: ({ snap }) => (snap as RS).distanceM >= 0.3 },
    { id: 'don', text: 'D (ya da A) ile yerinde en az 60° döndür.', behavior: true, check: ({ snap }) => (snap as RS).turnedDeg >= 60 },
    { id: 'watchdog', text: 'Komut kesilince 700 ms sonra robot kendiliğinden dursun ve "Komut yok: dur" yazılsın.', hint: 'Tek komut gönder, sonra bekle.', behavior: true, check: ({ snap }) => /Komut yok: dur/.test(snap.serial) && stopped(snap as RS, 0.01) },
    { id: 'gecersiz', text: 'Geçersiz komut ("Q") "?" yazdırsın.', behavior: true, check: serialHas(/\?\r?\n/) },
    { id: 'zaman', text: 'Kodda zamanlama için delay() kullanma; millis() ile ölç.', check: ({ code }) => !/\bdelay\s*\(/.test(code.replace(/\/\/.*$/gm, '')) && /\bmillis\s*\(/.test(code.replace(/\/\/.*$/gm, '')) },
  ],
}

export const R_H1_ACTIVITIES: ActivityMap = {
  [rk(1, 1)]: d76, [rk(1, 2)]: d77, [rk(1, 3)]: d78, [rk(1, 4)]: d79, [rk(1, 5)]: d80,
}

import { codeHas, serialHas } from '../goals'
import type { ArenaActivity, ArenaSnapshot, BalancerScene, BalancerSnapshot } from '../types'
import { rk, type ActivityMap } from './helpers'

/** Modül 5, hafta 6 (IMU ve denge; ders 101-105). Anahtar: "robotik:6:<ders>". Hepsi dengelenen robot (ters sarkaç) sahnesidir. */

const balScene = (id: string, title: string, description: string, timeLimitS: number, extra: Partial<BalancerScene> = {}): BalancerScene => ({
  kind: 'balancer', id, title, description, theta0Deg: 3, timeLimitS, ...extra,
})
const B = (s: ArenaSnapshot) => s as BalancerSnapshot
/** Seri çıktıdaki "a,b,c" biçimli sayı satırları. */
const csv = (serial: string): number[][] => serial.split(/\r?\n/).filter((l) => /^-?[\d.]+(,-?[\d.]+)+$/.test(l.trim())).map((l) => l.trim().split(',').map(Number))
const noC = (c: string) => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const IMU_BASLIK = `#include <Wire.h>

const int MPU_ADRES = 0x68;
const float RAD_DERECE = 57.2958;     // 180 / pi
const float JIRO_OLCEK = 65.5;        // ±500 °/s aralığında sayı / (°/s)
const float IVME_OLCEK = 16384.0;     // ±2 g aralığında sayı / g

int16_t oku16() {                     // iki bayttan işaretli sayı, yüksek bayt önce
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuAyarla() {
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);  // sensörü uyandır
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  // TODO: jiroskop aralığını ±500 °/s yap (0x1B yazmacına 0x08)
}

// Ham ivme ve jiroskop okur: ivmeAci (derece), hiz (°/s)
void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);                   // ilk veri yazmacı: ax
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();                            // ay
  int16_t azHam = oku16();
  oku16();                            // sıcaklık
  oku16();                            // gx
  int16_t gyHam = oku16();
  oku16();                            // gz
  // TODO: ivmeAci = atan2(ax, az) derece cinsinden; hiz = gyHam / JIRO_OLCEK
  ivmeAci = 0;
  hiz = 0;
}
`

const MOTOR_BASLIK = `const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor
const float OLU_BOLGE = 0.08;         // motor ölü bölgesi: PWM'in bu oranının altında tekerlek dönmüyor

void motorSur(float u) {              // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;   // ölü bölgeyi atla, yuvarla
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
}
`

// ---------------------------------------------------------------- Ders 101: IMU ile eğim ölçümü
const d101: ArenaActivity = {
  intro: 'Robot motorsuz ve 3° eğik bırakıldı: bir saniyeden kısa sürede devrilir. MPU6050’yi ham Wire ile oku, ivmeölçerden açıyı ve jiroskoptan dönme hızını "ms,açı,hız" satırı olarak yazdır; devrilirken ölçümün gerçeği izlediğini kontrol et.',
  scene: balScene('r6-101', 'Motorsuz robot', 'Kontrolsüz robot yaklaşık 0,7 saniyede 45° eğimi geçer. Yan görünüşte eğim ve durum izlenir.', 6),
  starter: () => `${IMU_BASLIK}
void setup() {
  Serial.begin(115200);
  imuAyarla();
}

void loop() {
  float aci, hiz;
  imuOku(aci, hiz);
  // TODO: "ms,aci,hiz" satırını yazdır (örn. 120,12.5,180.2); 50 ms bekle
}
`,
  solutionSketch: 'imu_olcum',
  runSeconds: 3,
  goals: [
    { id: 'satirlar', text: 'Her turda "ms,açı,hız" biçiminde satır yazdır (en az 15 satır).', behavior: true, check: ({ snap }) => csv(snap.serial).filter((r) => r.length === 3).length >= 15 },
    { id: 'aci', text: 'İvmeölçerden hesapladığın açı, robot devrilince gerçek eğime 4° içinde uysun.', hint: 'atan2(ax, az) * 57,2958; ax ve az g cinsinden.', behavior: true, check: ({ snap }) => { const r = csv(snap.serial).filter((x) => x.length === 3).at(-1); return B(snap).fell && !!r && Math.abs(r[1] - B(snap).thetaDeg) < 4 } },
    { id: 'hiz', text: 'Devrilirken jiroskop hızı pozitif ve 150-260 °/s arasında okunsun (±500 °/s ölçeği).', hint: 'Ölçek 65,5; aralığı 0x1B yazmacına 0x08 yazarak seç.', behavior: true, check: ({ snap }) => { const m = Math.max(...csv(snap.serial).filter((x) => x.length === 3).map((x) => x[2]), -1e9); return m > 150 && m < 260 } },
    { id: 'atan2', text: 'Açıyı atan2() ile ivmeölçerin ax ve az değerlerinden hesapla.', check: ({ code }) => /atan2\s*\(/.test(noC(code)) },
    { id: 'aralik', text: 'Jiroskop aralığını ±500 °/s yap (0x1B yazmacına 0x08).', check: ({ code }) => /0x1B/i.test(noC(code)) && /0x08/i.test(noC(code)) },
  ],
}

// ---------------------------------------------------------------- Ders 102: tamamlayıcı filtre
const d102: ArenaActivity = {
  intro: 'Robot 20° eğik ve sabit duruyor ama jiroskop 5 °/s sapma okuyor. Saf integral zamanla kayar; ivmeölçer kayma yapmaz ama gürültülüdür. Tamamlayıcı filtre ikisini birleştirir: açı = α·(açı + hız·dt) + (1−α)·ivmeAçı. Yazdırdığın üç sütunu karşılaştır: ivme, jiro integrali, filtre.',
  scene: balScene('r6-102', 'Tezgâhta eğik sensör', 'Robot tezgâhta 20° eğik ve sabit duruyor; jiroskop gerçekte hareket olmadığı halde 5 °/s sapma okuyor.', 10, { theta0Deg: 20, A: 0, gyroBiasDps: 5 }),
  starter: () => `${IMU_BASLIK}
const float ALFA = 0.98;              // jiroskop payı

float aciIvme = 0;                    // yalnız ivmeölçer
float aciJiro = 0;                    // yalnız jiroskop integrali
float aciFiltre = 0;                  // tamamlayıcı filtre
unsigned long sonUs = 0;
unsigned long sonYazdirMs = 0;
bool ilk = true;

void setup() {
  Serial.begin(115200);
  imuAyarla();
  sonUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;   // iki ölçüm arası gerçek süre (s)
  sonUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);

  // TODO: ilk turda üç açıyı da ivmeAci ile başlat
  // TODO: aciIvme = ivmeAci; aciJiro += hiz * dt; aciFiltre = ALFA * (aciFiltre + hiz * dt) + (1 - ALFA) * ivmeAci

  if (millis() - sonYazdirMs >= 100) {
    sonYazdirMs = millis();
    // TODO: "ms,aciIvme,aciJiro,aciFiltre" satırını yazdır
  }
  delay(5);
}
`,
  solutionSketch: 'tamamlayici_filtre',
  runSeconds: 9,
  goals: [
    { id: 'satirlar', text: '"ms,ivme,jiro,filtre" biçiminde saniyede ~10 satır yazdır (en az 20 satır).', behavior: true, check: ({ snap }) => csv(snap.serial).filter((r) => r.length === 4).length >= 20 },
    { id: 'filtre', text: 'Filtre açısı 6. saniyeden sonra da gerçek eğime (20°) 4° içinde kalsın.', behavior: true, check: ({ snap }) => { const r = csv(snap.serial).filter((x) => x.length === 4).at(-1); return B(snap).timeS > 6 && !!r && Math.abs(r[3] - B(snap).thetaDeg) < 4 } },
    { id: 'kayma', text: 'Saf jiroskop integralinin sapma yüzünden gerçekten kaydığını gör (sütun 3: gerçekten 8° ya da daha fazla uzaklaşır).', behavior: true, check: ({ snap }) => { const r = csv(snap.serial).filter((x) => x.length === 4).at(-1); return B(snap).timeS > 6 && !!r && Math.abs(r[2] - B(snap).thetaDeg) > 8 } },
    { id: 'dt', text: 'Zaman farkını (dt) micros() ile ölç.', check: ({ code }) => /micros\s*\(/.test(noC(code)) && /\bdt\b/.test(noC(code)) },
    { id: 'alfa', text: 'Filtre formülünü yaz: ALFA * (açı + hız * dt) + (1 - ALFA) * ivme.', check: ({ code }) => /ALFA\s*\*\s*\(/.test(noC(code)) && /\(\s*1\s*-\s*ALFA\s*\)/.test(noC(code)) },
  ],
}

// ---------------------------------------------------------------- Ders 103: sabit periyotlu kontrol döngüsü
const d103: ArenaActivity = {
  intro: 'Kontrol döngüsünü delay() ile değil micros() ile, 5 ms sabit periyotla çalıştır (planlanan zamana +=). Sonra PERIYOT_US değerini 20000, 60000, 100000 yaparak robotun nasıl bozulduğunu gör.',
  scene: balScene('r6-103', 'Dengelenen robot', 'Robot 3° eğik başlar. Sabit periyotlu PD kontrol onu dik tutmalı.', 10),
  starter: () => `#include <Wire.h>

const int MPU_ADRES = 0x68;
${MOTOR_BASLIK}
const unsigned long PERIYOT_US = 5000;
const float ALFA = 0.98;              // tamamlayıcı filtre
const float KP = 0.15;                // komut / derece
const float KD = 0.02;                // komut / (derece/s)

float aci = 0;
bool ilk = true;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  // TODO: gecen < PERIYOT_US ise bu turu atla (return)
  // TODO: planı ilerlet: sonPlanUs += PERIYOT_US (iki periyoddan fazla geciktiysek sonPlanUs = simdi)
  // TODO: dt = (simdi - sonGercekUs) / 1e6; sonGercekUs = simdi
  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  // TODO: tamamlayıcı filtre ile aci'yi güncelle (ilk turda aci = ivmeAci)
  // TODO: motorSur(KP * aci + KD * hiz)
}
`,
  solutionSketch: 'denge_sabit',
  runSeconds: 8,
  goals: [
    { id: 'ayakta', text: 'Robotu 8 saniye ayakta tut (düşmesin).', behavior: true, check: ({ snap }) => !B(snap).fell && B(snap).timeS >= 8 },
    { id: 'sakin', text: 'Eğim hiçbir zaman 5°’yi aşmasın.', behavior: true, check: ({ snap }) => !B(snap).fell && B(snap).timeS >= 8 && B(snap).maxAbsDeg < 5 },
    { id: 'dik', text: '8. saniyede eğim 1°’nin altında olsun.', behavior: true, check: ({ snap }) => B(snap).timeS >= 7.5 && !B(snap).fell && Math.abs(B(snap).thetaDeg) < 1 },
    { id: 'planli', text: 'Periyodu planlanan zamana ekleyerek koru: sonPlanUs += PERIYOT_US.', check: ({ code }) => /sonPlanUs\s*\+=\s*PERIYOT_US/.test(noC(code)) },
    { id: 'delay', text: 'Kontrol döngüsünde delay() kullanma; micros() ile ölç.', check: ({ code }) => !/\bdelay\s*\(/.test(noC(code)) && /\bmicros\s*\(/.test(noC(code)) },
  ],
}

// ---------------------------------------------------------------- Ders 104: kaskad PID (açı ve hız)
const d104: ArenaActivity = {
  intro: 'İç döngü açıyı (PD, 200 Hz), dış döngü konum ve hızı kontrol eder ve iç döngüye hedef açı verir (20 ms’de bir, ±6° ile sınırlı). Bu arenada ivmeölçer 4° kaymış takılı (montaj hatası): yalnız açı PD’si robotu ayakta tutar ama robot yavaşça süzülür (15 saniyede yaklaşık 17 cm). Dış döngü bunu durdurmalı; robot yalnız dik değil, yerinde de durmalı.',
  scene: balScene('r6-104', 'Kaskad denge', 'Robot 3° eğik başlar. İvmeölçer 4° kaymış: okunan açı gerçek açıdan 4° fazladır (yalnız okunan değer bozulur). Hedef: dik kal ve yerinden kayma.', 14, { accelOffsetDeg: 4 }),
  starter: () => `#include <Wire.h>

const int MPU_ADRES = 0x68;
${MOTOR_BASLIK}
const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const int DIS_ORAN = 4;                  // dış döngü: her 4 turda bir = 20 ms (50 Hz)
const float ALFA = 0.98;
const float KP = 0.15;                   // iç döngü: komut / derece
const float KD = 0.02;                   // komut / (derece/s)
const float KX = -60.0;                  // dış döngü: derece / metre
const float KV = -150.0;                 // derece / (metre/saniye)
const float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut

float aci = 0, hedefAci = 0, konumTahmin = 0, hizTahmin = 0, sonKomut = 0;
bool ilk = true;
int disSayac = 0;
unsigned long sonPlanUs = 0, sonGercekUs = 0, sonYazdirMs = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  // TODO: 103. dersteki sabit periyot iskeleti (micros ile 5 ms)
  // TODO: tamamlayıcı filtre ile aci'yi güncelle
  // TODO: komut = KP * (aci - hedefAci) + KD * hiz; motorSur(komut)
  // TODO: konumTahmin += hizTahmin * dt (hizTahmin = HIZ_KATSAYI * sonKomut)
  // TODO: her DIS_ORAN turda bir: hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR)
  // TODO: sonYazdirMs ile düzenli aralıkla (ör. 100-1000 ms) "ms,aci,hedefAci,konumTahmin" satırı yazdır
}
`,
  solutionSketch: 'kaskad_denge',
  runSeconds: 12,
  goals: [
    { id: 'ayakta', text: 'Robotu 12 saniye ayakta tut.', behavior: true, check: ({ snap }) => !B(snap).fell && B(snap).timeS >= 12 },
    { id: 'sakin', text: 'En büyük eğim 6°’nin altında kalsın.', behavior: true, check: ({ snap }) => !B(snap).fell && B(snap).timeS >= 12 && B(snap).maxAbsDeg < 6 },
    { id: 'konum', text: 'Yerinde dur: 10. saniyeden sonra konum 10 cm içinde kalsın.', hint: 'Dış döngü konum ve hızdan hedef açı üretir.', behavior: true, check: ({ snap }) => B(snap).timeS >= 11 && !B(snap).fell && Math.abs(B(snap).x) < 0.1 },
    { id: 'dik', text: 'Sensör 4° kaymış olsa da gerçek eğim 11. saniyeden sonra ±1° içinde kalsın (dış döngü hedef açıyı kaydırarak telafi eder).', hint: 'Yalnız açı PD’sinde gerçek eğim yaklaşık −4,15°’de kalır; kaskadda hedef açı bunu kaydırır.', behavior: true, check: ({ snap }) => B(snap).timeS >= 11 && !B(snap).fell && Math.abs(B(snap).thetaDeg) < 1 },
    { id: 'rapor', text: 'Düzenli aralıkla "ms,açı,hedefAçı,konum" satırı yazdır (en az 8 satır).', behavior: true, check: ({ snap }) => csv(snap.serial).filter((r) => r.length === 4).length >= 8 },
    { id: 'sinir', text: 'Hedef açıyı constrain() ile HEDEF_SINIR’a sınırla.', check: ({ code }) => /constrain\s*\([^;]*HEDEF_SINIR/.test(noC(code)) },
  ],
}

// ---------------------------------------------------------------- Ders 105: proje, kendini dengeleyen robot
const d105: ArenaActivity = {
  intro: 'Projeyi tamamla: robot dik kalsın, durumunu (DENGE, KONTROLSUZ, DUSTU) yönetsin, düşünce LED’i yaksın ve "DUSTU,ms" yazsın. 3. saniyede robota +200 °/s’lik bir itme verilir; robot toparlanmalı ve "RAPOR,itmeMs,enBüyükEğim,oturmaMs" yazmalı. Arena itmenin gerçek değerlerini ölçer ve raporunu bununla sınar. "k" komutu kontrolü kapatır: robot yaklaşık 0,8 saniyede devrilir ve sen düşmeyi raporlarsın.',
  scene: balScene('r6-105', 'Denge projesi', 'Robot 3° eğik başlar, 3. saniyede +200 °/s itilir. Ek itme için düğmeleri, kontrolü kapatıp düşmeyi görmek için seri monitörden "k" komutunu kullanabilirsin.', 20, { pushes: [{ atS: 3, dps: 200 }] }),
  quickSend: [{ label: 'k (kontrolü kapat)', text: 'k' }],
  starter: () => `#include <Wire.h>

const int MPU_ADRES = 0x68;
const int DURUM_LED = 13;                           // yanıyorsa robot düştü
${MOTOR_BASLIK}
const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const int DIS_ORAN = 4;                  // dış döngü: 20 ms (50 Hz)
const float ALFA = 0.98;
const float KP = 0.15;
const float KD = 0.02;
const float KX = -10.0;
const float KV = -25.0;
const float HEDEF_SINIR = 6.0;
const float HIZ_KATSAYI = 0.5;
const float DUSME_ACISI = 40.0;          // bu açıyı aşarsak motorları kes

enum Durum { DENGE, KONTROLSUZ, DUSTU };
Durum durum = DENGE;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  pinMode(DURUM_LED, OUTPUT);
}

void loop() {
  // TODO: 5 ms sabit periyot (micros), tamamlayıcı filtre
  // TODO: seriden 'k' gelirse durum = KONTROLSUZ (motorlar kapalı)
  // TODO: |aci| > DUSME_ACISI ise durum = DUSTU, motorları kes, LED yak, "DUSTU,<ms>" yaz
  // TODO: DENGE'de kaskad kontrol (104. ders); her 100 ms "T,ms,aci,konum" satırı yaz
  // TODO: 2. saniyeden sonra |aci| > 2° olunca "itildik" say; en büyük eğimi izle; |aci| 1°'nin altında 1 sn kalınca
  //       "RAPOR,<itmeMs>,<enBuyukEgim>,<oturmaMs>" yaz (oturma = itmeden eğimin 1°'yi son aştığı ana kadar süre)
}
`,
  solutionSketch: 'denge_robotu',
  scenario: (s) => { s.advance(6000); s.sendSerial('k'); s.advance(2500) },
  goals: [
    { id: 'ayakta', text: 'Robotu en az 5 saniye ayakta tut.', behavior: true, check: ({ snap }) => !B(snap).fell && B(snap).timeS >= 5 },
    { id: 'sakin', text: 'İlk 5 saniyede eğim 6°’yi aşmasın.', behavior: true, check: ({ snap }) => !B(snap).fell && B(snap).timeS >= 5 && B(snap).maxAbsDeg < 6 },
    { id: 'telemetri', text: 'Her 100 ms’de "T,ms,açı,konum" telemetrisi yazdır.', behavior: true, check: serialHas(/^T,\d+,-?[\d.]+,-?[\d.]+/m) },
    { id: 'kontrolsuz', text: '"k" gönder: kontrol kapanınca robot devrilsin ve "DUSTU,ms" yazılsın.', hint: 'Seri monitörün altındaki k düğmesini kullan.', behavior: true, check: ({ snap }) => B(snap).fell && /DUSTU,\d+/.test(snap.serial) },
    { id: 'durum', text: 'Durumları enum ile yönet: DENGE, KONTROLSUZ, DUSTU.', check: codeHas(/\benum\b/) },
    {
      id: 'rapor', text: 'İtmeyi raporla: "RAPOR,itmeMs,enBüyükEğim,oturmaMs" satırı arenanın ölçtüğü gerçek değerlerle uyuşsun (itme anı ±100 ms, en büyük eğim ±0,6°, oturma ±100 ms).',
      hint: 'İtme 3. saniyede gelir. Rapor, eğim 1°’nin altında 1 sn kaldıktan sonra yazılır; oturma süresi itmeden eğimin 1°’yi son aştığı ana kadardır.', behavior: true,
      check: ({ snap }) => {
        const b = B(snap), m = snap.serial.match(/^RAPOR,(\d+),(-?[\d.]+),(\d+)/m)
        if (!m || !b.push || b.push.settleMs === null) return false
        return Math.abs(Number(m[1]) - b.push.atS * 1000) <= 100 && Math.abs(Number(m[2]) - b.push.maxAbsDeg) <= 0.6 && Math.abs(Number(m[3]) - b.push.settleMs) <= 100
      },
    },
  ],
}

export const R_H6_ACTIVITIES: ActivityMap = {
  [rk(6, 1)]: d101, [rk(6, 2)]: d102, [rk(6, 3)]: d103, [rk(6, 4)]: d104, [rk(6, 5)]: d105,
}

import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 8 (Simülasyondan gerçeğe: gerçek dünya etkilerini sanal laboratuvarda gözlemlemek) laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:8:<ders>" (ders 1 tabanlı konum: 71 -> 1 ... 75 -> 5). */

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))

/** Çalışan benzetimde bir Uno pininin anlık durumu. */
const pinOf = (ctx: LabGoalCtx, name: string) => ctx.lab?.pins[name]
/** Seri çıktıda "Nem: X%" biçiminin SON değeri (yoksa null). */
const lastNem = (serial: string): number | null => {
  const all = [...serial.matchAll(/Nem: (-?\d+)%/g)]
  return all.length ? Number(all[all.length - 1][1]) : null
}
/** Seri çıktıda "Sayac: N" biçiminin SON değeri (yoksa null). */
const lastSayac = (serial: string): number | null => {
  const all = [...serial.matchAll(/Sayac: (\d+)/g)]
  return all.length ? Number(all[all.length - 1][1]) : null
}
/** Bir LED, direnç üzerinden belirli bir Uno pinine bağlı mı ve katodu toprakta mı. */
const ledOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', unoPin), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))

// ---------------------------------------------------------------- Ders 71: ADC basamağı ve gürültü
const gurultuCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('pot', 'pot', 360, 60, { position: 0.5 }), part('r1', 'resistor', 520, 200, { ohms: 330 }), part('led', 'led', 640, 200, { color: 'red' }))
  w(c, ['pot', 'VCC'], ['uno', '5V']); w(c, ['pot', 'GND'], ['uno', 'GND']); w(c, ['pot', 'SIG'], ['uno', 'A0'])
  w(c, ['r1', '1'], ['uno', 'D13']); w(c, ['r1', '2'], ['led', 'A']); w(c, ['led', 'K'], ['uno', 'GND2'])
  return c
}

const GURULTU_STARTER = `const int SENSOR = A0;
const int LED = 13;
const int ACMA = 524;     // yanmak için bunun üstüne çık
const int KAPAMA = 500;   // sönmek için bunun altına in
bool yanik = false;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);   // sahte gürültü: ±8 basamak
}

void setup() {
  pinMode(LED, OUTPUT);
  randomSeed(42);
}

void loop() {
  // 1) gürültülü değeri oku
  // 2) iki eşikle karar ver: yanık değilken ACMA'yı aşarsa yan, yanıkken KAPAMA'nın altına inerse sön
  // 3) LED'i yanık değişkenine göre sür
  delay(5);
}
`

const GURULTU_SOLUTION = `const int SENSOR = A0;
const int LED = 13;
const int ACMA = 524;
const int KAPAMA = 500;
bool yanik = false;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);
}

void setup() {
  pinMode(LED, OUTPUT);
  randomSeed(42);
}

void loop() {
  int deger = gurultuluOku();
  if (!yanik && deger > ACMA) yanik = true;
  if (yanik && deger < KAPAMA) yanik = false;
  digitalWrite(LED, yanik ? HIGH : LOW);
  delay(5);
}
`

const gurultuEtkinlik: LabActivity = {
  intro: 'Laboratuvarın ADC’si gürültüsüzdür; gürültüyü kodla ekledik (±8 basamak). Potansiyometrenin ayarı eşiğe yakınken bile LED titremesin: iki eşikli (histerezisli) bir karar yaz.',
  starter: () => ({ circuit: unoOnly(), code: GURULTU_STARTER }),
  allowedParts: ['pot', 'resistor', 'led'],
  goals: [
    {
      id: 'pot-baglanti',
      text: 'Potansiyometrenin VCC ucunu 5V’a, GND ucunu GND’ye, SIG ucunu A0’a bağla.',
      hint: '"Parça ekle" menüsünden potansiyometreyi seç. Kayar uç (SIG) analog giriş A0’a gider.',
      check: (ctx) => partsOf(ctx.circuit, 'pot').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'SIG', 'A0')),
    },
    {
      id: 'led-baglanti',
      text: 'D13’ten bir direnç üzerinden LED’in A ucuna, LED’in K ucunu GND’ye bağla.',
      hint: 'D13 → direnç (330 Ω) → LED A; LED K → GND. LED’in direnci olmazsa laboratuvar uyarı verir.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'yanip-soner',
      text: 'Potansiyometreyi önce yüksek bir konuma (örneğin 0,65), sonra düşük bir konuma (örneğin 0,3) getir: LED bir kez yansın, bir kez sönsün.',
      hint: 'Kodda gürültülü değer ACMA’nın üstüne çıkınca yanik = true, KAPAMA’nın altına inince yanik = false yap ve LED’i sür. Potansiyometre konumunu özellik panelinden ayarla.',
      behavior: true,
      check: (ctx) => (ctx.stats.pinEdges['D13'] ?? 0) >= 2,
    },
    {
      id: 'titreme-yok',
      text: 'Potansiyometreyi tam eşiğe (konum 0,5) getirip en az 3 sn çalıştır: LED titremesin (pin toplamda en çok 4 kez değişsin).',
      hint: 'Tek eşik (örneğin > 512) bu konumda gürültü yüzünden LED’i saniyede onlarca kez değiştirir. İki eşik arasındaki boşluk gürültüden (±8) büyük olmalı.',
      behavior: true,
      check: (ctx) => {
        const v = pinOf(ctx, 'A0')?.volts ?? 0
        const e = ctx.stats.pinEdges['D13'] ?? 0
        return ctx.stats.runMs >= 3000 && v >= 2.4 && v <= 2.6 && e >= 2 && e <= 4
      },
    },
  ],
  solution: () => ({ circuit: gurultuCircuit(), code: GURULTU_SOLUTION }),
  // Yüksek (yanar), düşük (söner), sonra 3,5 sn eşikte (titreme olmamalı).
  scenario: (s) => {
    s.advance(300)                                // LED sönük başlangıç durumu gözlensin
    s.setProp('pot', 'position', 0.65)
    s.advance(500)
    s.setProp('pot', 'position', 0.3)
    s.advance(500)
    s.setProp('pot', 'position', 0.5)
    s.advance(3500)
  },
}

// ---------------------------------------------------------------- Ders 72: buton sıçraması
const butonCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('btn', 'button', 360, 60), part('r1', 'resistor', 520, 200, { ohms: 330 }), part('led', 'led', 640, 200, { color: 'red' }))
  w(c, ['btn', 'A'], ['uno', 'D2']); w(c, ['btn', 'B'], ['uno', 'GND'])
  w(c, ['r1', '1'], ['uno', 'D13']); w(c, ['r1', '2'], ['led', 'A']); w(c, ['led', 'K'], ['uno', 'GND2'])
  return c
}

const BUTON_STARTER = `const int BUTON = 2;
const int LED = 13;
int sayac = 0;
bool onceki = false;
bool ledDurum = false;

// Gerçek kontağın sıçramasını taklit eder: her değişimden sonraki 5 ms içinde tek ms'lerde ters okur.
bool hamOku() {
  static bool son = false;
  static bool var = false;
  static unsigned long degisim = 0;
  bool temiz = (digitalRead(BUTON) == LOW);
  if (temiz != son) {
    son = temiz;
    degisim = millis();
    var = true;
  }
  unsigned long gecen = millis() - degisim;
  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;
  return temiz;
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool basili = hamOku();
  if (basili && !onceki) {          // basılmaya yeni geçti
    sayac++;
    ledDurum = !ledDurum;
    digitalWrite(LED, ledDurum);
    Serial.print("Sayac: ");
    Serial.println(sayac);
  }
  onceki = basili;
}
`
const BUTON_SOLUTION = `const int BUTON = 2;
const int LED = 13;
const unsigned long SAKIN_SURE = 20;   // ms
int sayac = 0;
bool ledDurum = false;
bool sonHam = false;
bool kararli = false;
unsigned long sonDegisim = 0;

// Gerçek kontağın sıçramasını taklit eder (sayac_ham ile aynı).
bool hamOku() {
  static bool son = false;
  static bool var = false;
  static unsigned long degisim = 0;
  bool temiz = (digitalRead(BUTON) == LOW);
  if (temiz != son) {
    son = temiz;
    degisim = millis();
    var = true;
  }
  unsigned long gecen = millis() - degisim;
  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;
  return temiz;
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool ham = hamOku();
  if (ham != sonHam) {              // pin oynadı: sayacı sıfırla
    sonHam = ham;
    sonDegisim = millis();
  }
  if (millis() - sonDegisim >= SAKIN_SURE && ham != kararli) {
    kararli = ham;                  // yeterince sakin kaldı: kabul et
    if (kararli) {
      sayac++;
      ledDurum = !ledDurum;
      digitalWrite(LED, ledDurum);
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
}
`

const butonEtkinlik: LabActivity = {
  intro: 'Laboratuvarın butonu sıçramaz; koddaki hamOku() fonksiyonu sıçramayı taklit eder. Butona bir kez bas: sayaç 1 olmalı. Başlangıç kodu bir basışı 5 kez sayıyor; sen düzelt.',
  starter: () => ({ circuit: unoOnly(), code: BUTON_STARTER }),
  allowedParts: ['button', 'resistor', 'led'],
  goals: [
    {
      id: 'buton-baglanti',
      text: 'Butonun bir ucunu D2’ye, öbür ucunu GND’ye bağla.',
      hint: 'Kod INPUT_PULLUP kullanıyor: basılı = LOW. Butonun bir ucu D2, diğer ucu GND.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'button').some((b) =>
          (toUno(ctx, b.id, 'A', 'D2') && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', 'D2') && toGnd(ctx, b.id, 'A'))),
    },
    {
      id: 'led-baglanti',
      text: 'D13’ten bir direnç üzerinden LED’in A ucuna, LED’in K ucunu GND’ye bağla.',
      hint: 'D13 → direnç (330 Ω) → LED A; LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'tek-basis',
      text: 'Butona bir kez bas ve bırak: seri monitördeki "Sayac" değeri 1 olsun (bir basış = bir sayım).',
      hint: 'Başlangıç kodu bir basışı 5 kez sayıyor. Pin değiştikten sonra 20 ms sakin kalmasını bekle (millis ile) ve ancak sonra say. ↺ ile sıfırlayıp yeniden dene.',
      behavior: true,
      check: (ctx) => {
        const n = lastSayac(ctx.lab?.serial ?? '')
        const e = ctx.stats.pinEdges['D2'] ?? 0
        return n !== null && n >= 1 && n === Math.floor(e / 2)
      },
    },
    {
      id: 'iki-basis',
      text: 'Bir kez daha bas ve bırak: sayaç basış sayısını tutsun (iki basış = "Sayac: 2"); gerçek basışlar kaçmasın.',
      hint: 'Bekleme süresi çok uzunsa hızlı basışlar kaybolur. 20 ms gerçek bir basış için kısa bir süredir.',
      behavior: true,
      check: (ctx) => {
        const n = lastSayac(ctx.lab?.serial ?? '')
        const e = ctx.stats.pinEdges['D2'] ?? 0
        return n !== null && n >= 2 && n === Math.floor(e / 2)
      },
    },
  ],
  solution: () => ({ circuit: butonCircuit(), code: BUTON_SOLUTION }),
  scenario: (s) => {
    s.advance(200)
    s.setProp('btn', 'pressed', true)
    s.advance(100)
    s.setProp('btn', 'pressed', false)
    s.advance(150)
    s.setProp('btn', 'pressed', true)
    s.advance(100)
    s.setProp('btn', 'pressed', false)
    s.advance(150)
  },
}

// ---------------------------------------------------------------- Ders 73: besleme ve kalibrasyon
const nemCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('soil', 'soil', 400, 80, { moisture: 0.3 }))
  w(c, ['soil', 'VCC'], ['uno', '5V']); w(c, ['soil', 'GND'], ['uno', 'GND']); w(c, ['soil', 'AO'], ['uno', 'A0'])
  return c
}

const NEM_STARTER = `const int SENSOR = A0;
const int KURU = 0;     // nem 0 iken okunan ham değer (önce Ham değerini seri monitörden oku)
const int ISLAK = 0;    // nem 1 iken okunan ham değer

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENSOR);
  int yuzde = -1;         // map ile 0-100 aralığına çevir, constrain ile uçlarda kırp
  Serial.print("Ham=");
  Serial.print(ham);
  Serial.print(" Nem: ");
  Serial.print(yuzde);
  Serial.println("%");
  delay(500);
}
`
const NEM_SOLUTION = `const int SENSOR = A0;
const int KURU = 921;     // nem 0 iken okunan ham değer
const int ISLAK = 307;    // nem 1 iken okunan ham değer

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENSOR);
  int yuzde = map(ham, KURU, ISLAK, 0, 100);
  yuzde = constrain(yuzde, 0, 100);       // uçların dışına taşan değerleri kırp
  Serial.print("Ham=");
  Serial.print(ham);
  Serial.print(" Nem: ");
  Serial.print(yuzde);
  Serial.println("%");
  delay(500);
}
`

const soilOf = (ctx: LabGoalCtx) => partsOf(ctx.circuit, 'soil')
/** Seri geçmişinde, ham değeri [hamLo, hamHi] olan bir satırın yüzdesi [minPct, maxPct] aralığında mı. */
const nemSatiri = (ctx: LabGoalCtx, hamLo: number, hamHi: number, minPct: number, maxPct: number) =>
  [...(ctx.lab?.serial ?? '').matchAll(/Ham=(\d+) Nem: (-?\d+)%/g)].some((m) => {
    const ham = Number(m[1]), nem = Number(m[2])
    return ham >= hamLo && ham <= hamHi && nem >= minPct && nem <= maxPct
  })

const nemEtkinlik: LabActivity = {
  intro: 'Toprak nemi modülünü 5V ile besle, kuru (nem 0) ve ıslak (nem 1) uçlarının ham değerini seri monitörden oku, KURU ve ISLAK sabitlerine yaz; map ile yüzdeye çevir. Kalibrasyon besleme geriliminde geçerlidir: VCC’yi 3V3’e alırsan sayılar kayar.',
  starter: () => ({ circuit: unoOnly(), code: NEM_STARTER }),
  allowedParts: ['soil'],
  goals: [
    {
      id: 'parca-besleme',
      text: 'Tuvale bir toprak nemi modülü ekle; VCC’yi 5V’a, GND’yi GND’ye bağla.',
      hint: '"Parça ekle" menüsünden toprak nemi modülünü seç. Kalibrasyonu 5V beslemeyle yapıyoruz; 3V3’e bağlarsan AO düşer.',
      check: (ctx) => soilOf(ctx).some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND')),
    },
    {
      id: 'ao-a0',
      text: 'Modülün AO ucunu A0’a bağla.',
      hint: 'AO analog çıkıştır: A0 gibi bir analog girişe gider. DO dijital çıkıştır, burada gerekmez.',
      check: (ctx) => soilOf(ctx).some((p) => toUno(ctx, p.id, 'AO', 'A0')),
    },
    {
      id: 'kuru',
      text: 'Toprak nemini 0 yap (tamamen kuru): program "Nem: 0%" yazsın.',
      hint: 'Nem 0 iken Ham değerini oku (yaklaşık 921), KURU sabitine yaz. map(ham, KURU, ISLAK, 0, 100) ters aralıkla da çalışır. (Ham değer yaklaşık 921 değilse modül 5V ile beslenmiyor olabilir.)',
      behavior: true,
      check: (ctx) => nemSatiri(ctx, 915, 925, 0, 2),
    },
    {
      id: 'islak',
      text: 'Toprak nemini 1 yap (tamamen ıslak): program "Nem: 100%" yazsın.',
      hint: 'Nem 1 iken Ham değerini oku (yaklaşık 307), ISLAK sabitine yaz.',
      behavior: true,
      check: (ctx) => nemSatiri(ctx, 303, 311, 98, 100),
    },
    {
      id: 'orta',
      text: 'Toprak nemini 0,5 yap: program yaklaşık %50 yazsın (45 ile 55 arası).',
      hint: 'İki ucu doğru kalibre ettiysen ortası kendiliğinden %50 olur. Değilse KURU ve ISLAK değerlerini yeniden oku.',
      behavior: true,
      check: (ctx) => nemSatiri(ctx, 610, 618, 45, 55),
    },
    {
      id: 'kirpma',
      text: 'Yüzdeyi 0-100 aralığında tut: kodda constrain (ya da min ve max) kullan.',
      hint: 'map aralığın dışına taşabilir; sonucu constrain(yuzde, 0, 100) ile kırp.',
      check: ({ code }) => /constrain\s*\(/.test(noComments(code)) || (/\bmin\s*\(/.test(noComments(code)) && /\bmax\s*\(/.test(noComments(code))),
    },
  ],
  solution: () => ({ circuit: nemCircuit(), code: NEM_SOLUTION }),
  scenario: (s) => {
    s.advance(1000)
    s.setProp('soil', 'moisture', 0)
    s.advance(1100)
    s.setProp('soil', 'moisture', 1)
    s.advance(1100)
    s.setProp('soil', 'moisture', 0.5)
    s.advance(1100)
  },
}

// ---------------------------------------------------------------- Ders 74: katman katman hata ayıklama
const katmanCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('imu', 'mpu6050', 420, 80))
  w(c, ['imu', 'VCC'], ['uno', '5V']); w(c, ['imu', 'GND'], ['uno', 'GND']); w(c, ['imu', 'SDA'], ['uno', 'A4']); w(c, ['imu', 'SCL'], ['uno', 'A5'])
  return c
}
const KATMAN_CODE = `#include <Wire.h>

const byte ADRES = 0x68;
const byte YAZMAC_KIMLIK = 0x75;      // WHO_AM_I
const byte BEKLENEN_KIMLIK = 0x68;
const byte YAZMAC_GUC = 0x6B;         // uyku/güç yazmacı
const byte YAZMAC_IVME = 0x3B;        // ivme verisinin başı
const float MIN_G = 0.8;              // hareketsiz ivme büyüklüğü için makul aralık
const float MAKS_G = 1.2;

int sonSonuc = -1;
float sonG = 0;

bool hatlarBosta() {
  return digitalRead(A4) == HIGH && digitalRead(A5) == HIGH;
}

bool cihazVar() {
  Wire.beginTransmission(ADRES);
  return Wire.endTransmission() == 0;
}

int kimlikOku() {
  Wire.beginTransmission(ADRES);
  Wire.write(YAZMAC_KIMLIK);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom((int)ADRES, 1) != 1) return -1;
  return Wire.read();
}

bool ivmeBuyuklugu(float &g) {
  Wire.beginTransmission(ADRES);
  Wire.write(YAZMAC_IVME);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((int)ADRES, 6) != 6) return false;
  int16_t ham[3];
  for (int i = 0; i < 3; i++) {
    int yuksek = Wire.read();
    int dusuk = Wire.read();
    ham[i] = (int16_t)((yuksek << 8) | dusuk);
  }
  float x = ham[0] / 16384.0;         // varsayılan aralıkta 16384 LSB = 1 g
  float y = ham[1] / 16384.0;
  float z = ham[2] / 16384.0;
  g = sqrt(x * x + y * y + z * z);
  return true;
}

// 0 = hepsi tamam, 1-4 = ilk hata veren katman
int ilkHataKatmani() {
  if (!hatlarBosta()) return 1;
  if (!cihazVar()) return 2;
  if (kimlikOku() != BEKLENEN_KIMLIK) return 3;
  float g;
  if (!ivmeBuyuklugu(g)) return 4;
  sonG = g;
  if (g < MIN_G || g > MAKS_G) return 4;
  return 0;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(ADRES);      // uykudan uyandır
  Wire.write(YAZMAC_GUC);
  Wire.write(0);
  Wire.endTransmission();
  delay(100);
}

void loop() {
  int sonuc = ilkHataKatmani();
  if (sonuc == 0) {
    Serial.print("TAMAM g=");
    Serial.println(sonG, 2);
  } else if (sonuc == 1) {
    Serial.println("Katman 1 HATA: SDA/SCL LOW'da takili");
  } else if (sonuc == 2) {
    Serial.println("Katman 2 HATA: adreste cihaz yok");
  } else if (sonuc == 3) {
    Serial.println("Katman 3 HATA: adres cevap veriyor ama kimlik yanlis");
  } else {
    Serial.println("Katman 4 HATA: deger makul degil");
  }
  if (sonSonuc != -1 && sonuc != sonSonuc) {
    Serial.println("DEGISTI: sonuc kararsiz");
  }
  sonSonuc = sonuc;
  delay(1000);
}
`

const katmanEtkinlik: LabActivity = {
  intro: 'Katman testi hazır. MPU6050’yi bağla, çalıştır ve hata modlarını özellik panelinden üret: önce her şey tamam, sonra veri bozulsun, sonra düzelsin. Hangi katmanın hata verdiğini oku.',
  starter: () => ({ circuit: unoOnly(), code: KATMAN_CODE }),
  allowedParts: ['mpu6050'],
  goals: [
    {
      id: 'parca',
      text: 'Tuvale bir MPU6050 ekle.',
      hint: '"Parça ekle" menüsünden MPU6050’yi seç.',
      check: ({ circuit }) => partsOf(circuit, 'mpu6050').length >= 1,
    },
    {
      id: 'besleme',
      text: 'MPU6050’nin VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme yoksa sensör veri yolunda görünmez: test "Katman 2 HATA" der.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => to5V(ctx, m.id, 'VCC') && toGnd(ctx, m.id, 'GND')),
    },
    {
      id: 'hat',
      text: 'SDA ucunu A4’e, SCL ucunu A5’e bağla.',
      hint: 'Uno’nun I2C pinleri A4 (SDA) ve A5 (SCL)’tir. Bağlanmazsa test "Katman 2 HATA: adreste cihaz yok" yazar.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => toUno(ctx, m.id, 'SDA', 'A4') && toUno(ctx, m.id, 'SCL', 'A5')),
    },
    {
      id: 'tamam',
      text: 'Programı çalıştır: seri monitörde "TAMAM g=1.00" görünsün.',
      hint: 'Dört katman da sağlam ve sensör hareketsiz (az = 1 g) olmalı. ▶’ten sonra bir iki saniye bekle.',
      behavior: true,
      check: (ctx) => /TAMAM g=1\.0\d/.test(ctx.lab?.serial ?? ''),
    },
    {
      id: 'katman4',
      text: 'Çalışırken MPU6050’nin ivme X, Y ve Z özelliklerini 0 yap: "Katman 4 HATA" görünsün.',
      hint: 'Sensör cevap veriyor ve kimliği doğru, ama değer makul değil (0 g). Bu yüzden sorun 4. katmandadır.',
      behavior: true,
      check: (ctx) => /Katman 4 HATA/.test(ctx.lab?.serial ?? ''),
    },
    {
      id: 'duzeldi',
      text: 'Z ivmesini 1 g’ye geri al: önce "DEGISTI", sonra yine "TAMAM" görünsün.',
      hint: '"Arada düzeliyor" ipucu: sonuç iki ölçüm arasında değişince DEGISTI yazılır. az = 1, ax = ay = 0 yap.',
      behavior: true,
      check: (ctx) => /Katman 4 HATA[\s\S]*DEGISTI[\s\S]*TAMAM/.test(ctx.lab?.serial ?? ''),
    },
  ],
  solution: () => ({ circuit: katmanCircuit(), code: KATMAN_CODE }),
  scenario: (s) => {
    s.advance(2500)
    s.setProp('imu', 'ax', 0); s.setProp('imu', 'ay', 0); s.setProp('imu', 'az', 0)
    s.advance(1300)
    s.setProp('imu', 'az', 1)
    s.advance(1300)
  },
}

// ---------------------------------------------------------------- Ders 75: Akıllı oda
const odaCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('pir', 'pir', 360, 20), part('dht', 'dht', 360, 140, { type: 'dht22', tempC: 24, humidity: 45 }),
    part('ldr', 'ldr', 360, 260, { light: 0.5 }), part('rldr', 'resistor', 360, 340, { ohms: 10000 }),
    part('rl', 'relay', 520, 20), part('rfan', 'resistor', 680, 20, { ohms: 330 }), part('fan', 'led', 780, 20, { color: 'blue' }),
    part('rlamp', 'resistor', 680, 140, { ohms: 330 }), part('lamp', 'led', 780, 140, { color: 'yellow' }),
    part('btn', 'button', 520, 300), part('lcd', 'lcdI2c', 640, 260, { address: '0x27' }),
  )
  w(c, ['pir', 'VCC'], ['uno', '5V']); w(c, ['pir', 'GND'], ['uno', 'GND']); w(c, ['pir', 'OUT'], ['uno', 'D2'])
  w(c, ['dht', 'VCC'], ['uno', '5V']); w(c, ['dht', 'GND'], ['uno', 'GND2']); w(c, ['dht', 'DATA'], ['uno', 'D5'])
  w(c, ['ldr', '1'], ['uno', '5V']); w(c, ['ldr', '2'], ['uno', 'A1']); w(c, ['rldr', '1'], ['uno', 'A1']); w(c, ['rldr', '2'], ['uno', 'GND3'])
  w(c, ['rl', 'VCC'], ['uno', '5V']); w(c, ['rl', 'GND'], ['uno', 'GND']); w(c, ['rl', 'IN'], ['uno', 'D7']); w(c, ['rl', 'COM'], ['uno', '5V'])
  w(c, ['rl', 'NO'], ['rfan', '1']); w(c, ['rfan', '2'], ['fan', 'A']); w(c, ['fan', 'K'], ['uno', 'GND2'])
  w(c, ['rlamp', '1'], ['uno', 'D13']); w(c, ['rlamp', '2'], ['lamp', 'A']); w(c, ['lamp', 'K'], ['uno', 'GND3'])
  w(c, ['btn', 'A'], ['uno', 'D3']); w(c, ['btn', 'B'], ['uno', 'GND'])
  w(c, ['lcd', 'GND'], ['uno', 'GND']); w(c, ['lcd', 'VCC'], ['uno', '5V']); w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  return c
}
const ODA_CODE = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

const int PIR = 2;
const int DUGME = 3;
const int DHT_PIN = 5;
const int ROLE = 7;
const int LAMBA = 13;
const int LDR = A1;

const unsigned long ISINMA_SURESI = 3000;    // ms (gerçekte çok daha uzun)
const unsigned long BOS_SURESI = 8000;       // ms (gerçekte dakikalar)
const unsigned long OLCUM_ARALIGI = 2000;    // DHT22 için en az 2 sn
const unsigned long EKRAN_ARALIGI = 500;
const int KARANLIK_ALT = 300;                // bunun altı: karanlık
const int AYDINLIK_UST = 400;                // bunun üstü: aydınlık
const float FAN_ACIK = 28.0;
const float FAN_KAPAT = 26.0;

enum Durum { ISINMA, BOS, DOLU, KAPALI };

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT22);

Durum durum = ISINMA;
bool karanlik = false;
bool fan = false;
bool olculdu = false;                // ilk DHT okuması yapıldı mı?
bool sensorTamam = false;
float sicaklik = 0;
float nem = 0;
bool arkaIsik = true;
bool oncekiDugme = false;
unsigned long sonDugme = 0;
unsigned long sonHareket = 0;
unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;

const char *durumAdi() {
  if (durum == ISINMA) return "ISINMA";
  if (durum == BOS) return "BOS   ";
  if (durum == DOLU) return "DOLU  ";
  return "KAPALI";
}

void gec(Durum yeni) {
  durum = yeni;
  Serial.print("durum=");
  Serial.println(durumAdi());
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  if (!olculdu) {
    lcd.print("Olcum bekleniyor");
  } else if (!sensorTamam) {
    lcd.print("DHT HATA        ");
  } else {
    lcd.print("T:");
    lcd.print(sicaklik, 1);
    lcd.print("C N:%");
    lcd.print((int)nem);
    lcd.print("    ");
  }
  lcd.setCursor(0, 1);
  lcd.print(durumAdi());
  lcd.print(" L");
  lcd.print(digitalRead(LAMBA) == HIGH ? 1 : 0);
  lcd.print(" F");
  lcd.print(fan ? 1 : 0);
  lcd.print("   ");
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(DUGME, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  pinMode(LAMBA, OUTPUT);
  digitalWrite(ROLE, LOW);             // varsayılan: kapalı
  digitalWrite(LAMBA, LOW);
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Buton: basıldığı an bir kez, 50 ms sıçrama payıyla
  bool basili = (digitalRead(DUGME) == LOW);
  if (basili && !oncekiDugme && simdi - sonDugme > 50) {
    sonDugme = simdi;
    if (durum == KAPALI) gec(BOS); else gec(KAPALI);
  }
  oncekiDugme = basili;

  // 2) PIR: ısınırken ve kapalıyken yok sayılır
  bool hareket = (digitalRead(PIR) == HIGH);
  if (hareket && (durum == BOS || durum == DOLU)) {
    sonHareket = simdi;
    if (durum == BOS) gec(DOLU);
  }

  // 3) Işık: her turda oku, histerezisle karar ver
  int isik = analogRead(LDR);
  if (!karanlik && isik < KARANLIK_ALT) karanlik = true;
  if (karanlik && isik > AYDINLIK_UST) karanlik = false;

  // 4) Sıcaklık ve nem: iki saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    olculdu = true;
    sensorTamam = !isnan(t) && !isnan(h) && t > -40 && t < 80 && h >= 0 && h <= 100;
    if (sensorTamam) {
      sicaklik = t;
      nem = h;
    }
  }

  // 5) Durum geçişleri (zamana bağlı)
  if (durum == ISINMA && simdi >= ISINMA_SURESI) gec(BOS);
  if (durum == DOLU && simdi - sonHareket >= BOS_SURESI) gec(BOS);

  // 6) Fan: histerezis; sensör bozuksa ya da oda DOLU değilse kapalı
  if (durum != DOLU || !sensorTamam) {
    fan = false;
  } else if (sicaklik >= FAN_ACIK) {
    fan = true;
  } else if (sicaklik <= FAN_KAPAT) {
    fan = false;
  }

  // 7) Çıkışlar
  digitalWrite(LAMBA, (durum == DOLU && karanlik) ? HIGH : LOW);
  digitalWrite(ROLE, fan ? HIGH : LOW);

  // 8) Ekran ve arka ışık: BOS iken ışık kapalı (tasarruf)
  bool arkaIstenen = (durum != BOS);
  if (arkaIstenen != arkaIsik) {
    arkaIsik = arkaIstenen;
    if (arkaIsik) lcd.backlight(); else lcd.noBacklight();
  }
  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranYaz();
  }
}
`

const odaEtkinlik: LabActivity = {
  intro: 'Bitirme projesi: Akıllı oda programı hazır. Sensörleri, röleyi, lambayı, butonu ve ekranı bağla; sonra ışığı, sıcaklığı ve hareketi özellik panelinden değiştirerek odanın tepkisini dene.',
  starter: () => ({ circuit: unoOnly(), code: ODA_CODE }),
  allowedParts: ['pir', 'dht', 'ldr', 'resistor', 'relay', 'led', 'button', 'lcdI2c'],
  goals: [
    {
      id: 'sensorler',
      text: 'PIR’ı (VCC 5V, GND, OUT → D2) ve DHT22’yi (VCC 5V, GND, DATA → D5) bağla.',
      hint: 'PIR OUT ucu D2’ye, DHT DATA ucu D5’e gider. İkisinin de VCC’si 5V, GND’si GND olmalı.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'pir').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'OUT', 'D2')) &&
        partsOf(ctx.circuit, 'dht').some((d) => to5V(ctx, d.id, 'VCC') && toGnd(ctx, d.id, 'GND') && toUno(ctx, d.id, 'DATA', 'D5')),
    },
    {
      id: 'isik',
      text: 'Işık bölücüsünü kur: LDR bir ucu 5V’a, öbür ucu A1’e; A1 ile GND arasında yaklaşık 10 kΩ’luk bir direnç.',
      hint: 'LDR üstte (5V tarafı), direnç altta (GND tarafı) olunca aydınlıkta A1 yükselir. Direncin değerini özellik panelinden 10000 Ω yap.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'ldr').some((l) =>
          (to5V(ctx, l.id, '1') && toUno(ctx, l.id, '2', 'A1')) || (to5V(ctx, l.id, '2') && toUno(ctx, l.id, '1', 'A1'))) &&
        partsOf(ctx.circuit, 'resistor').some((r) =>
          typeof r.props.ohms === 'number' && r.props.ohms >= 4700 && r.props.ohms <= 22000 &&
          ((toUno(ctx, r.id, '1', 'A1') && toGnd(ctx, r.id, '2')) || (toUno(ctx, r.id, '2', 'A1') && toGnd(ctx, r.id, '1')))),
    },
    {
      id: 'role-fan',
      text: 'Röleyi bağla (VCC 5V, GND, IN → D7). COM’u 5V’a, NO’yu bir direnç ve LED ("fan") üzerinden GND’ye bağla.',
      hint: 'COM → 5V; NO → 330 Ω direnç → LED A; LED K → GND. Röle çekince LED yanar.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'relay').some((r) =>
          to5V(ctx, r.id, 'VCC') && toGnd(ctx, r.id, 'GND') && toUno(ctx, r.id, 'IN', 'D7') && to5V(ctx, r.id, 'COM') &&
          partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin(r.id, 'NO'), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))),
    },
    {
      id: 'lamba',
      text: 'D13’ten bir direnç üzerinden bir LED’e ("lamba") bağlan; LED’in K ucu GND’de olsun.',
      hint: 'D13 → 330 Ω direnç → LED A; LED K → GND. Fan LED’inden ayrı bir LED kullan.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'buton-ekran',
      text: 'Butonu D3’e (öbür ucu GND) ve I2C LCD’yi A4/A5’e (VCC 5V, GND) bağla.',
      hint: 'Buton INPUT_PULLUP ile okunur: bir ucu D3, diğer ucu GND. LCD: SDA → A4, SCL → A5.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'button').some((b) => (toUno(ctx, b.id, 'A', 'D3') && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', 'D3') && toGnd(ctx, b.id, 'A'))) &&
        partsOf(ctx.circuit, 'lcdI2c').some((l) => to5V(ctx, l.id, 'VCC') && toGnd(ctx, l.id, 'GND') && toUno(ctx, l.id, 'SDA', 'A4') && toUno(ctx, l.id, 'SCL', 'A5')),
    },
    {
      id: 'lamba-yanar',
      text: 'Odayı karanlık yap (LDR ışığı 0,3’ün altı) ve PIR’a hareket ver: lamba yansın.',
      hint: 'Lamba yalnızca oda DOLU ve karanlıkken yanar. ISINMA 3 sn sürer; ısınma bitmeden verilen hareket yok sayılır. LDR’nin Işık özelliğini düşür, PIR’ın Hareket özelliğini aç.',
      behavior: true,
      check: (ctx) => (pinOf(ctx, 'A1')?.volts ?? 5) < 1.4 && pinOf(ctx, 'D13')?.high === true && partsOf(ctx.circuit, 'led').some((l) => ctx.lab?.parts[l.id]?.led?.on === true),
    },
    {
      id: 'fan-calisir',
      text: 'Odada hareket varken DHT22’nin sıcaklığını 28 °C’ın üstüne çıkar: fan (röle) çeksin.',
      hint: 'Fan yalnız DOLU iken ve sıcaklık 28 °C’a ulaşınca çalışır. DHT22 en çok 2 sn’de bir okunur, tepki biraz gecikir.',
      behavior: true,
      check: (ctx) =>
        partsOf(ctx.circuit, 'dht').some((d) => (ctx.lab?.parts[d.id]?.dht?.tempC ?? 0) >= 28) &&
        partsOf(ctx.circuit, 'relay').some((r) => ctx.lab?.parts[r.id]?.relay?.energized === true),
    },
  ],
  solution: () => ({ circuit: odaCircuit(), code: ODA_CODE }),
  scenario: (s) => {
    s.setProp('ldr', 'light', 0.2)
    s.advance(4000)                               // ISINMA (3 sn) bitti
    s.setProp('pir', 'motion', true)
    s.advance(700)
    s.setProp('pir', 'motion', false)
    s.advance(500)                                // DOLU: lamba yanar
    s.setProp('dht', 'tempC', 29)
    s.advance(3000)                               // DHT okuma aralığı + röle
  },
}

export const M4_H8_ACTIVITIES: Record<string, LabActivity> = {
  'sensorler-ve-projeler:8:1': gurultuEtkinlik,
  'sensorler-ve-projeler:8:2': butonEtkinlik,
  'sensorler-ve-projeler:8:3': nemEtkinlik,
  'sensorler-ve-projeler:8:4': katmanEtkinlik,
  'sensorler-ve-projeler:8:5': odaEtkinlik,
}

/** Koordinatörün kaydı için (görev: `export const m4h8Activities`). */
export const m4h8Activities = M4_H8_ACTIVITIES

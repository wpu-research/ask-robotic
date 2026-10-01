import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 5 laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:5:<ders>" (ders 1 tabanlı konum; 56 = 1 ... 60 = 5). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))
const serialOf = (ctx: LabGoalCtx) => ctx.lab?.serial ?? ''
const ledToggles = (ctx: LabGoalCtx) => Math.max(0, ...partsOf(ctx.circuit, 'led').map((l) => ctx.stats?.ledToggles[l.id] ?? 0))

/** D13 → 330 Ω → LED A, LED K → GND zinciri (çözümler için). */
const addLed = (c: Circuit, x: number, y: number, unoPin = 'D13') => {
  c.parts.push(part('r1', 'resistor', x, y, { ohms: 330 }), part('led1', 'led', x + 140, y))
  w(c, ['uno', unoPin], ['r1', '1']); w(c, ['r1', '2'], ['led1', 'A']); w(c, ['led1', 'K'], ['uno', 'GND2'])
}
/** LED zinciri hedefi: pin → direnç → LED A, K → GND. */
const ledChain = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', unoPin), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))
/** I2C sensörü/ekranı: VCC 5V, GND, SDA A4, SCL A5. */
const i2cOk = (ctx: LabGoalCtx, id: string) => to5V(ctx, id, 'VCC') && toGnd(ctx, id, 'GND') && toUno(ctx, id, 'SDA', 'A4') && toUno(ctx, id, 'SCL', 'A5')
const wireI2c = (c: Circuit, id: string) => { w(c, [id, 'VCC'], ['uno', '5V']); w(c, [id, 'GND'], ['uno', 'GND3']); w(c, [id, 'SDA'], ['uno', 'A4']); w(c, [id, 'SCL'], ['uno', 'A5']) }

// ---------------------------------------------------------------- Ders 56: Joystick
const joystickCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('joy', 'joystick', 420, 40))
  w(c, ['joy', 'VCC'], ['uno', '5V']); w(c, ['joy', 'GND'], ['uno', 'GND']); w(c, ['joy', 'VRX'], ['uno', 'A0']); w(c, ['joy', 'VRY'], ['uno', 'A1']); w(c, ['joy', 'SW'], ['uno', 'D2'])
  addLed(c, 420, 300)
  return c
}

const JOYSTICK_CODE = `// Joystick: X ve Y eksenlerini oku, seri monitöre yaz; düğmeye basınca LED'i tersle.
const int SW = 2;
const int LED = 13;
bool ledAcik = false;
bool oncekiBasili = false;

void setup() {
  Serial.begin(9600);
  // SW pinini INPUT_PULLUP, LED pinini OUTPUT yap
}

void loop() {
  // A0 (X) ve A1 (Y) değerlerini oku, seri monitöre "X=... Y=..." biçiminde yaz
  // düğmeye basıldığı an (pin LOW olunca, bir kez) LED'in durumunu tersle
  delay(100);
}
`

const joystick: LabActivity = {
  intro: 'Joystick, iki potansiyometre ve bir düğmedir. Bağla, X ile Y değerlerini seri monitöre yaz ve düğmeyle LED’i aç-kapat. Çalışırken joystick’in X ekseni, Y ekseni ve Düğme basılı özelliklerini değiştirerek kolu oynat.',
  starter: () => ({ circuit: unoOnly(), code: JOYSTICK_CODE }),
  allowedParts: ['joystick', 'resistor', 'led'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir joystick, bir direnç ve bir LED ekle.',
      hint: '"Parça ekle" menüsünden joystick’i, direnci ve LED’i seç. Direncin değerini 330 Ω yap.',
      check: ({ circuit }) => partsOf(circuit, 'joystick').length >= 1 && partsOf(circuit, 'resistor').length >= 1 && partsOf(circuit, 'led').length >= 1,
    },
    {
      id: 'guc',
      text: 'Joystick’in VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Beslenmeyen joystick değer vermez: VCC → 5V, GND → GND kablosunu çek.',
      check: (ctx) => partsOf(ctx.circuit, 'joystick').some((j) => to5V(ctx, j.id, 'VCC') && toGnd(ctx, j.id, 'GND')),
    },
    {
      id: 'eksenler',
      text: 'VRX ucunu A0’a, VRY ucunu A1’e bağla.',
      hint: 'X ekseni A0, Y ekseni A1 olacak. İkisi de analog pindir.',
      check: (ctx) => partsOf(ctx.circuit, 'joystick').some((j) => toUno(ctx, j.id, 'VRX', 'A0') && toUno(ctx, j.id, 'VRY', 'A1')),
    },
    {
      id: 'dugme',
      text: 'SW (düğme) ucunu D2’ye bağla.',
      hint: 'Düğme basılınca GND’ye çeker; programda pini INPUT_PULLUP yap.',
      check: (ctx) => partsOf(ctx.circuit, 'joystick').some((j) => toUno(ctx, j.id, 'SW', 'D2')),
    },
    {
      id: 'led',
      text: 'LED’i D13’e bir direnç üzerinden bağla (D13 → direnç → LED anodu, LED katodu → GND).',
      hint: 'Dirençsiz LED’i bağlama: uyarı çıkar. Katot (K) GND’ye gider.',
      check: (ctx) => ledChain(ctx, 'D13'),
    },
    {
      id: 'seri-xy',
      text: 'Programı çalıştır: seri monitörde "X=… Y=…" satırları görünsün.',
      hint: 'setup() içinde Serial.begin(9600); loop() içinde analogRead(A0) ve analogRead(A1) değerlerini Serial.print ile yaz.',
      behavior: true,
      check: (ctx) => /X=-?\d+\s+Y=-?\d+/.test(serialOf(ctx)),
    },
    {
      id: 'dugme-led',
      text: 'Joystick’in Düğme basılı kutusunu işaretle: LED yansın ya da sönsün.',
      hint: 'Pini INPUT_PULLUP yap. Düğmeye basılı iken digitalRead LOW okunur. Basıldığı an bir kez LED’in durumunu tersle.',
      behavior: true,
      check: (ctx) => ledToggles(ctx) >= 1,
    },
  ],
  solution: () => ({ circuit: joystickCircuit(), code: `const int SW = 2;
const int LED = 13;
const int OLU_BOLGE = 40;          // merkezin ± bu kadarı sıfır sayılır

int merkezX;
int merkezY;
bool ledAcik = false;
bool oncekiBasili = false;
unsigned long sonBasis = 0;
unsigned long sonYazma = 0;

int merkezOlc(int pin) {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(pin);
    delay(2);
  }
  return toplam / 16;
}

// ham değeri -100 ... +100 aralığına çevirir
int eksen(int ham, int merkez) {
  int fark = ham - merkez;
  if (abs(fark) < OLU_BOLGE) return 0;
  if (fark > 0) {
    return constrain(map(fark, OLU_BOLGE, 1023 - merkez, 0, 100), 0, 100);
  }
  return constrain(map(fark, -OLU_BOLGE, -merkez, 0, -100), -100, 0);
}

const char* yonAdi(int x, int y) {
  if (abs(x) < 30 && abs(y) < 30) return "ORTA";
  if (abs(x) >= abs(y)) return x > 0 ? "SAG" : "SOL";
  return y > 0 ? "YUKARI" : "ASAGI";
}

void setup() {
  Serial.begin(9600);
  pinMode(SW, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  merkezX = merkezOlc(A0);          // kol bırakılmışken ölç
  merkezY = merkezOlc(A1);
}

void loop() {
  unsigned long simdi = millis();

  // Düğme: basıldığı an LED'in durumunu tersle (kenar algılama + sıçrama önleme)
  bool basili = (digitalRead(SW) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 30) {
    sonBasis = simdi;
    ledAcik = !ledAcik;
    digitalWrite(LED, ledAcik);
  }
  oncekiBasili = basili;

  // Saniyede beş kez yaz
  if (simdi - sonYazma >= 200) {
    sonYazma = simdi;
    int x = eksen(analogRead(A0), merkezX);
    int y = eksen(analogRead(A1), merkezY);
    Serial.print("X=");
    Serial.print(x);
    Serial.print(" Y=");
    Serial.print(y);
    Serial.print(" YON=");
    Serial.println(yonAdi(x, y));
  }
}
` }),
  scenario: (s) => {
    s.advance(700)
    s.setProp('joy', 'x', 0.9)
    s.advance(400)
    s.setProp('joy', 'x', 0.5)
    s.setProp('joy', 'pressed', true)
    s.advance(300)
    s.setProp('joy', 'pressed', false)
    s.advance(300)
  },
}

// ---------------------------------------------------------------- Ders 57: Döner enkoder
const encoderCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('enc', 'encoder', 420, 60))
  w(c, ['enc', 'CLK'], ['uno', 'D2']); w(c, ['enc', 'DT'], ['uno', 'D3']); w(c, ['enc', 'SW'], ['uno', 'D4'])
  w(c, ['enc', 'VCC'], ['uno', '5V']); w(c, ['enc', 'GND'], ['uno', 'GND'])
  return c
}

const ENCODER_CODE = `// Döner enkoder: CLK düşerken DT'ye bakıp yönü bul, sayacı artır ya da azalt.
const int CLK = 2;
const int DT = 3;
const int SW = 4;

volatile int sayac = 0;

void adim() {
  // kesme servis rutini: DT HIGH ise sayac artsın, LOW ise azalsın
}

void setup() {
  Serial.begin(9600);
  // üç pini INPUT_PULLUP yap
  // CLK pinine FALLING kesmesi bağla: attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING)
}

void loop() {
  // sayac değişince "Sayac: N" yaz (okurken noInterrupts() / interrupts() kullan)
  // SW düğmesine basılınca sayacı sıfırla
}
`

const encoder: LabActivity = {
  intro: 'Döner enkoderin CLK ve DT çıkışları 90° kaymış iki sinyaldir. Bağla, kesmeyle say. Sonra enkoderin Konum (tık) özelliğini değiştirerek düğmeyi çevir: artı değerler saat yönü, eksi değerler ters yöndür.',
  starter: () => ({ circuit: unoOnly(), code: ENCODER_CODE }),
  allowedParts: ['encoder'],
  goals: [
    {
      id: 'parca',
      text: 'Tuvale bir döner enkoder ekle.',
      hint: '"Parça ekle" menüsünden döner enkoderi (KY-040) seç.',
      check: ({ circuit }) => partsOf(circuit, 'encoder').length >= 1,
    },
    {
      id: 'clk-dt',
      text: 'CLK ucunu D2’ye (kesme pini), DT ucunu D3’e bağla.',
      hint: 'Uno’da kesme pinleri D2 ve D3’tür. CLK’yı D2’ye bağlayıp kesmeyi ona kur.',
      check: (ctx) => partsOf(ctx.circuit, 'encoder').some((e) => toUno(ctx, e.id, 'CLK', 'D2') && toUno(ctx, e.id, 'DT', 'D3')),
    },
    {
      id: 'sw-gnd',
      text: 'SW ucunu D4’e, GND ucunu GND’ye bağla.',
      hint: 'GND bağlı değilse enkoder hiçbir şey okutmaz. VCC’yi bağlaman gerekmez; pinleri INPUT_PULLUP yapman yeter.',
      check: (ctx) => partsOf(ctx.circuit, 'encoder').some((e) => toUno(ctx, e.id, 'SW', 'D4') && toGnd(ctx, e.id, 'GND')),
    },
    {
      id: 'kesme',
      text: 'Kodda CLK pinine attachInterrupt ile bir kesme bağla.',
      hint: 'attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING); satırını setup() içine yaz.',
      check: ({ code }) => /attachInterrupt\s*\(/.test(noComments(code)),
    },
    {
      id: 'artar',
      text: 'Enkoderin Konum (tık) özelliğini en az 3 artır: seri monitörde "Sayac: 3" ya da daha büyüğü görünsün.',
      hint: 'adim() içinde DT HIGH ise sayac++ yap. loop() içinde sayac değişince Serial.println ile "Sayac: " yaz.',
      behavior: true,
      check: (ctx) => [...serialOf(ctx).matchAll(/Sayac:\s*(\d+)/g)].some((m) => Number(m[1]) >= 3),
    },
    {
      id: 'azalir',
      text: 'Konum (tık) değerini eksi yönde çevir: sayaç sıfırın altına insin.',
      hint: 'DT LOW iken sayac-- yap. Konum değerini örneğin -3 yap.',
      behavior: true,
      check: (ctx) => /Sayac:\s*-\d+/.test(serialOf(ctx)),
    },
    {
      id: 'sifirla',
      text: 'Önce sayacı sıfırdan farklı yap, sonra Düğme basılı kutusunu işaretle: sayaç 0’a dönsün.',
      hint: 'loop() içinde digitalRead(SW) == LOW olunca (basıldığı an bir kez) noInterrupts(); sayac = 0; interrupts(); yap.',
      behavior: true,
      check: (ctx) => /Sayac:\s*[1-9]\d*\s[\s\S]*Sayac:\s*0(?!\d)/.test(serialOf(ctx)),
    },
  ],
  solution: () => ({ circuit: encoderCircuit(), code: `const int CLK = 2;
const int DT = 3;
const int SW = 4;
const unsigned long ARALIK_US = 2000;   // iki kenar arası en az 2 ms

volatile int sayac = 0;
volatile unsigned long sonKenar = 0;

void adim() {
  unsigned long simdi = micros();
  if (simdi - sonKenar < ARALIK_US) return;   // sıçrama: yok say
  sonKenar = simdi;
  if (digitalRead(DT) == HIGH) {
    sayac++;
  } else {
    sayac--;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK, INPUT_PULLUP);
  pinMode(DT, INPUT_PULLUP);
  pinMode(SW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);
}

void loop() {
  static int onceki = 0;
  static bool oncekiBasili = false;

  // Düğme: basıldığı an sayacı sıfırla
  bool basili = (digitalRead(SW) == LOW);
  if (basili && !oncekiBasili) {
    noInterrupts();
    sayac = 0;
    interrupts();
  }
  oncekiBasili = basili;

  noInterrupts();
  int kopya = sayac;
  interrupts();

  if (kopya != onceki) {
    onceki = kopya;
    Serial.print("Sayac: ");
    Serial.println(kopya);
  }
}
` }),
  scenario: (s) => {
    s.advance(300)
    s.setProp('enc', 'position', 6)
    s.advance(300)
    s.setProp('enc', 'position', -3)
    s.advance(400)
    s.setProp('enc', 'pressed', true)
    s.advance(300)
    s.setProp('enc', 'pressed', false)
    s.advance(300)
  },
}

// ---------------------------------------------------------------- Ders 58: MPU6050 ivmeölçer ve eğim
const mpuLedCircuit = (props: Record<string, number> = {}): Circuit => {
  const c = unoOnly()
  c.parts.push(part('mpu', 'mpu6050', 420, 40, props))
  wireI2c(c, 'mpu')
  addLed(c, 420, 300)
  return c
}

const MPU_EGIM_START = `#include <Wire.h>

const int MPU = 0x68;
const int LED = 13;

float ax, ay, az;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void ivmeOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);   // yalnız ivme: 6 bayt
  ax = oku16() / 16384.0;
  ay = oku16() / 16384.0;
  az = oku16() / 16384.0;
}

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
  Wire.begin();
  // MPU6050'yi uyandır: 0x6B yazmacına 0 yaz
}

void loop() {
  ivmeOku();
  // pitch = atan2(ax, az) ve roll = atan2(ay, az) hesapla (derece)
  // iki açı da ±2 derece içindeyse LED yansın (dijital su terazisi)
  // seri monitöre "pitch=... roll=..." yaz
  delay(200);
}
`

const mpuEgim: LabActivity = {
  intro: 'MPU6050’yi I2C ile bağla, ivme verisinden eğim açısını hesapla. Çipi eğmek için MPU6050’nin İvme X ve İvme Z özelliklerini değiştir (örneğin X = 0,5 ve Z = 0,87 yaklaşık 30° eğimdir).',
  starter: () => ({ circuit: unoOnly(), code: MPU_EGIM_START }),
  allowedParts: ['mpu6050', 'resistor', 'led'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir MPU6050, bir direnç ve bir LED ekle.',
      hint: '"Parça ekle" menüsünden MPU6050’yi, direnci ve LED’i seç. Direncin değerini 330 Ω yap.',
      check: ({ circuit }) => partsOf(circuit, 'mpu6050').length >= 1 && partsOf(circuit, 'resistor').length >= 1 && partsOf(circuit, 'led').length >= 1,
    },
    {
      id: 'guc',
      text: 'MPU6050’nin VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme eksikse çip I2C hattında cevap vermez.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => to5V(ctx, m.id, 'VCC') && toGnd(ctx, m.id, 'GND')),
    },
    {
      id: 'hat',
      text: 'SDA ucunu A4’e, SCL ucunu A5’e bağla.',
      hint: 'Uno’nun I2C pinleri A4 (SDA) ve A5 (SCL)’tir. Ters bağlarsan çip bulunamaz.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => toUno(ctx, m.id, 'SDA', 'A4') && toUno(ctx, m.id, 'SCL', 'A5')),
    },
    {
      id: 'led',
      text: 'LED’i D13’e bir direnç üzerinden bağla (D13 → direnç → LED anodu, LED katodu → GND).',
      hint: 'Katot (K) GND’ye gider; dirençsiz bağlama.',
      check: (ctx) => ledChain(ctx, 'D13'),
    },
    {
      id: 'pitch-30',
      text: 'Çipi yaklaşık 30° eğ (İvme X = 0,5 ve İvme Z = 0,87): seri monitörde "pitch=" yaklaşık 30 görünsün.',
      hint: 'pitch = atan2(ax, az) * 180.0 / PI; yaz ve "pitch=" ile "roll=" değerlerini Serial.print ile yazdır. atan2 radyan verir, dereceye çevirmeyi unutma.',
      behavior: true,
      check: (ctx) => [...serialOf(ctx).matchAll(/pitch=(-?\d+(?:\.\d+)?)/g)].some((m) => Math.abs(Number(m[1]) - 30) <= 3),
    },
    {
      id: 'terazi-yanar',
      text: 'Çip düzken (İvme X = 0, İvme Z = 1) LED yansın.',
      hint: 'İki açının mutlak değeri 2’den küçükse LED’i HIGH yap: abs(pitch) < 2.0 && abs(roll) < 2.0.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'led').some((l) => ctx.lab?.parts[l.id]?.led?.on === true),
    },
    {
      id: 'terazi-soner',
      text: 'Çipi eğ: LED sönsün (LED’in durumu değişsin).',
      hint: 'Düz değilse LED sönük olmalı. Tek bir digitalWrite(LED, koşul ? HIGH : LOW) yeterli.',
      behavior: true,
      check: (ctx) => ledToggles(ctx) >= 1,
    },
  ],
  solution: () => ({ circuit: mpuLedCircuit(), code: `#include <Wire.h>

const int MPU = 0x68;
const int LED = 13;

float ax, ay, az;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void ivmeOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);   // yalnız ivme: 6 bayt
  ax = oku16() / 16384.0;
  ay = oku16() / 16384.0;
  az = oku16() / 16384.0;
}

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
}

void loop() {
  ivmeOku();
  float pitch = atan2(ax, az) * 180.0 / PI;
  float roll = atan2(ay, az) * 180.0 / PI;

  digitalWrite(LED, (abs(pitch) < 2.0 && abs(roll) < 2.0) ? HIGH : LOW);   // terazi

  Serial.print("pitch=");
  Serial.print(pitch, 1);
  Serial.print(" roll=");
  Serial.println(roll, 1);
  delay(200);
}
` }),
  scenario: (s) => {
    s.advance(800)
    s.setProp('mpu', 'ax', 0.5)
    s.setProp('mpu', 'az', 0.87)
    s.advance(800)
    s.setProp('mpu', 'ax', 0)                // yine düz: LED yanar
    s.setProp('mpu', 'az', 1)
    s.advance(600)
  },
}

// ---------------------------------------------------------------- Ders 59: Jiroskop sapması ve tamamlayıcı filtre
const mpuOnlyCircuit = (props: Record<string, number> = {}): Circuit => {
  const c = unoOnly()
  c.parts.push(part('mpu', 'mpu6050', 420, 40, props))
  wireI2c(c, 'mpu')
  return c
}

const MPU_FILTRE_START = `#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;
const float ALFA = 0.98;

float sapmaGy = 0;
float aci = 0;                      // filtreli açı
float saf = 0;                      // yalnız jiroskop integrali
float acc = 0;                      // ivmeölçerden gelen açı
unsigned long sonUs = 0;
unsigned long sonYazMs = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;
}

float ivmeAci() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);
  int axH = Wire.read(); int axL = Wire.read();
  int ayH = Wire.read(); int ayL = Wire.read();
  int azH = Wire.read(); int azL = Wire.read();
  float ax = (int16_t)((axH << 8) | axL) / 16384.0;
  float az = (int16_t)((azH << 8) | azL) / 16384.0;
  return atan2(ax, az) * 180.0 / PI;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;                 // durağan ortalama = sapma
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;

  aci = ivmeAci();                  // başlangıç açısı ivmeölçerden
  saf = aci;
  sonYazMs = millis();
  // sonUs'u micros() ile başlat
}

void loop() {
  // 1) gy = gyOku() - sapmaGy ve acc = ivmeAci() değerlerini al
  // 2) dt'yi (saniye) micros() farkından hesapla, sonUs'u güncelle
  // 3) saf += gy * dt;  aci = ALFA * (aci + gy * dt) + (1.0 - ALFA) * acc;

  if (millis() - sonYazMs >= 200) {
    sonYazMs += 200;
    Serial.print("acc=");
    Serial.print(acc, 1);
    Serial.print(" saf=");
    Serial.print(saf, 1);
    Serial.print(" filtre=");
    Serial.println(aci, 1);
  }
  delay(10);
}
`

/** Seri çıktıdaki tam "acc= saf= filtre=" satırlarının sonuncusu. */
const lastFilterLine = (ctx: LabGoalCtx) => {
  const all = [...serialOf(ctx).matchAll(/acc=(-?\d+(?:\.\d+)?)\s+saf=(-?\d+(?:\.\d+)?)\s+filtre=(-?\d+(?:\.\d+)?)\r?\n/g)]
  const m = all.at(-1)
  return m ? { acc: Number(m[1]), saf: Number(m[2]), filtre: Number(m[3]) } : null
}

const mpuFiltre: LabActivity = {
  intro: 'Jiroskop kısa vadede iyi, uzun vadede kayar; ivmeölçer tersidir. İkisini tamamlayıcı filtreyle birleştir. Önce çipi bağla ve filtreyi yaz. Programın ilk saniyesinde (sapma ölçülürken) özellikleri değiştirme. Sonra çalışırken MPU6050’nin Jiroskop Y özelliğini 2 yap: sapmanın sonradan değişmesini taklit eder.',
  starter: () => ({ circuit: unoOnly(), code: MPU_FILTRE_START }),
  allowedParts: ['mpu6050'],
  goals: [
    {
      id: 'parca',
      text: 'Tuvale bir MPU6050 ekle.',
      hint: '"Parça ekle" menüsünden MPU6050’yi seç.',
      check: ({ circuit }) => partsOf(circuit, 'mpu6050').length >= 1,
    },
    {
      id: 'guc',
      text: 'VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme eksikse çip cevap vermez.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => to5V(ctx, m.id, 'VCC') && toGnd(ctx, m.id, 'GND')),
    },
    {
      id: 'hat',
      text: 'SDA ucunu A4’e, SCL ucunu A5’e bağla.',
      hint: 'Uno’nun I2C pinleri A4 (SDA) ve A5 (SCL)’tir.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => toUno(ctx, m.id, 'SDA', 'A4') && toUno(ctx, m.id, 'SCL', 'A5')),
    },
    {
      id: 'dt',
      text: 'Kodda geçen süreyi (dt) micros() ile ölç.',
      hint: 'sonUs’u setup() sonunda micros() ile başlat. loop() içinde simdi = micros(); dt = (simdi - sonUs) / 1000000.0; sonUs = simdi; yaz.',
      check: ({ code }) => (noComments(code).match(/micros\s*\(\s*\)/g) ?? []).length >= 2,
    },
    {
      id: 'sapma-kayar',
      text: 'Çalışırken Jiroskop Y’yi 2 yap: "saf" ivmeölçerin açısından en az 5° uzaklaşsın, "filtre" ise ona 3° içinde kalsın.',
      hint: 'saf += gy * dt; ve aci = ALFA * (aci + gy * dt) + (1.0 - ALFA) * acc; satırlarını yaz. Sapma ölçüldükten sonra değiştiği için saf kayar, filtre ivmeölçerle düzelir. Birkaç saniye bekle.',
      behavior: true,
      check: (ctx) => {
        const l = lastFilterLine(ctx)
        return !!l && Math.abs(l.saf - l.acc) >= 5 && Math.abs(l.filtre - l.acc) <= 3
      },
    },
    {
      id: 'egim-izler',
      text: 'Çipi en az 30° eğ (örneğin İvme X = 0,71 ve İvme Z = 0,71 yaklaşık 45°): "filtre" ivmeölçerin açısına 3° içinde oturmuş olsun.',
      hint: 'acc = ivmeAci(); satırını loop() içinde her turda çalıştır ve filtre formülündeki (1.0 - ALFA) * acc terimini unutma. Oturması bir iki saniye sürer.',
      behavior: true,
      check: (ctx) => {
        const l = lastFilterLine(ctx)
        return !!l && l.acc >= 30 && Math.abs(l.filtre - l.acc) <= 3
      },
    },
  ],
  solution: () => ({ circuit: mpuOnlyCircuit({ ax: 0.34, az: 0.94 }), code: `#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;
const float ALFA = 0.98;

float sapmaGy = 0;
float aci = 0;                      // filtreli açı
float saf = 0;                      // karşılaştırma: yalnız jiroskop integrali
unsigned long sonUs = 0;
unsigned long baslaMs = 0;
unsigned long sonYazMs = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;
}

float ivmeAci() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);
  int axH = Wire.read(); int axL = Wire.read();
  int ayH = Wire.read(); int ayL = Wire.read();
  int azH = Wire.read(); int azL = Wire.read();
  float ax = (int16_t)((axH << 8) | axL) / 16384.0;
  float az = (int16_t)((azH << 8) | azL) / 16384.0;
  return atan2(ax, az) * 180.0 / PI;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;

  aci = ivmeAci();
  saf = aci;
  sonUs = micros();
  baslaMs = millis();
  sonYazMs = baslaMs;
}

void loop() {
  float gy = gyOku() - sapmaGy;
  float acc = ivmeAci();

  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;
  sonUs = simdi;

  saf += gy * dt;
  aci = ALFA * (aci + gy * dt) + (1.0 - ALFA) * acc;

  if (millis() - sonYazMs >= 200) {
    sonYazMs += 200;
    Serial.print("t=");
    Serial.print((millis() - baslaMs) / 1000.0, 1);
    Serial.print(" acc=");
    Serial.print(acc, 1);
    Serial.print(" saf=");
    Serial.print(saf, 1);
    Serial.print(" filtre=");
    Serial.println(aci, 1);
  }
  delay(10);
}
` }),
  scenario: (s) => {
    s.advance(2500)                          // sapma ölçülür (jiroskop 0), açı yaklaşık 20°
    s.setProp('mpu', 'gy', 2)                // sapma sonradan 2 °/s oldu
    s.advance(2000)
    s.setProp('mpu', 'ax', 0.71)             // eğim 45°
    s.setProp('mpu', 'az', 0.71)
    s.advance(4500)
  },
}

// ---------------------------------------------------------------- Ders 60: Proje, mini gimbal
const gimbalCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('mpu', 'mpu6050', 420, 20), part('lcd', 'lcdI2c', 420, 190, { address: '0x27' }), part('sv', 'servo', 420, 360), part('btn', 'button', 640, 20))
  wireI2c(c, 'mpu'); wireI2c(c, 'lcd')
  w(c, ['sv', 'SIG'], ['uno', 'D6']); w(c, ['sv', 'VCC'], ['uno', '5V']); w(c, ['sv', 'GND'], ['uno', 'GND2'])
  w(c, ['btn', 'A'], ['uno', 'D2']); w(c, ['btn', 'B'], ['uno', 'GND'])
  addLed(c, 640, 200)
  return c
}

const mimiGimbal: LabActivity = {
  intro: 'Bitirme projesi: MPU6050, I2C LCD, servo, sıfırlama düğmesi ve “servo sınırda” LED’ini kur. Ders metnindeki program hazır yüklüdür. MPU6050’nin İvme X ve İvme Z özellikleriyle tabanı eğ (X = 0,34 ve Z = 0,94 yaklaşık 20°): servo ters yönde dönmeli. Programın ilk yarım saniyesinde (sapma ölçülürken) özellikleri değiştirme.',
  starter: () => ({ circuit: unoOnly(), code: `#include <Wire.h>
#include <Servo.h>
#include <LiquidCrystal_I2C.h>

const int MPU = 0x68;
const int SERVO_PIN = 6;
const int SIFIRLA = 2;
const int LED = 13;

const float ALFA = 0.98;
const int SERVO_MERKEZ = 90;
const int SERVO_MIN = 10;
const int SERVO_MAX = 170;
const unsigned long DONGU_MS = 10;
const unsigned long EKRAN_MS = 250;

Servo servo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

float sapmaGy = 0;
float aci = 0;                       // filtreli pitch (derece)
float ofset = 0;                     // "sıfır" kabul edilen açı
float ax, az, gy;                    // son ölçüm: g, g, °/s
unsigned long sonDongu = 0;
unsigned long sonEkran = 0;
unsigned long sonUs = 0;
bool oncekiBasili = false;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void mpuOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 14, true);
  ax = oku16() / 16384.0;
  oku16();                           // ay: kullanmıyoruz
  az = oku16() / 16384.0;
  oku16();                           // sıcaklık
  oku16();                           // gx
  gy = oku16() / 131.0;              // pitch: Y ekseni etrafında dönüş
  oku16();                           // gz
}

float ivmeAci() {
  return atan2(ax, az) * 180.0 / PI;
}

void ekranYaz(float egim, int servoAci) {
  lcd.setCursor(0, 0);
  lcd.print("Egim: ");
  lcd.print(egim, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print("Servo: ");
  lcd.print(servoAci);
  lcd.print("      ");
}

void setup() {
  Serial.begin(9600);
  pinMode(SIFIRLA, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  servo.attach(SERVO_PIN);
  servo.write(SERVO_MERKEZ);

  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);                     // uyandır
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;                  // sapma ölçümü: çip kıpırdamasın
  for (int i = 0; i < 100; i++) {
    mpuOku();
    toplam += gy;
    delay(5);
  }
  sapmaGy = toplam / 100;

  mpuOku();
  aci = ivmeAci();                   // başlangıç açısı ivmeölçerden
  lcd.init();
  lcd.backlight();
  sonUs = micros();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Sıfırlama düğmesi: basıldığı an bir kez
  bool basili = (digitalRead(SIFIRLA) == LOW);
  if (basili && !oncekiBasili) {
    ofset = aci;
  }
  oncekiBasili = basili;

  // 2) Her 10 ms'de ölçüm, filtre ve servo
  if (simdi - sonDongu >= DONGU_MS) {
    sonDongu = simdi;

    mpuOku();
    unsigned long us = micros();
    float dt = (us - sonUs) / 1000000.0;
    sonUs = us;
    aci = ALFA * (aci + (gy - sapmaGy) * dt) + (1.0 - ALFA) * ivmeAci();

    float egim = aci - ofset;
    int servoAci = SERVO_MERKEZ - (int)round(egim);   // ters yönde dön
    bool sinirda = (servoAci <= SERVO_MIN || servoAci >= SERVO_MAX);
    servoAci = constrain(servoAci, SERVO_MIN, SERVO_MAX);
    servo.write(servoAci);
    digitalWrite(LED, sinirda ? HIGH : LOW);

    // 3) Ekran ve seri çıktı: 250 ms'de bir
    if (simdi - sonEkran >= EKRAN_MS) {
      sonEkran = simdi;
      ekranYaz(egim, servoAci);
      Serial.print("egim=");
      Serial.print(egim, 1);
      Serial.print(" servo=");
      Serial.println(servoAci);
    }
  }
}
` }),
  allowedParts: ['mpu6050', 'lcdI2c', 'servo', 'button', 'resistor', 'led'],
  goals: [
    {
      id: 'i2c-hat',
      text: 'MPU6050 ve I2C LCD’yi aynı iki telli hatta bağla: ikisinin de VCC’si 5V, GND’si GND, SDA’sı A4, SCL’si A5 olsun.',
      hint: 'İki parçanın SDA uçlarını A4’e, SCL uçlarını A5’e çek. Adresleri farklı (0x68 ve 0x27), bu yüzden aynı hatta çalışırlar. RTC parçası ekleme.',
      check: (ctx) => partsOf(ctx.circuit, 'mpu6050').some((m) => i2cOk(ctx, m.id)) && partsOf(ctx.circuit, 'lcdI2c').some((l) => i2cOk(ctx, l.id)),
    },
    {
      id: 'servo',
      text: 'Servoyu bağla: SIG → D6, VCC → 5V, GND → GND.',
      hint: 'Servonun sinyal ucu programdaki SERVO_PIN olan D6’ya gider.',
      check: (ctx) => partsOf(ctx.circuit, 'servo').some((s) => toUno(ctx, s.id, 'SIG', 'D6') && to5V(ctx, s.id, 'VCC') && toGnd(ctx, s.id, 'GND')),
    },
    {
      id: 'buton',
      text: '"Sıfırla" butonunu D2 ile GND arasına bağla.',
      hint: 'Butonun bir ucu D2, öbür ucu GND. Program INPUT_PULLUP kullanıyor.',
      check: (ctx) => partsOf(ctx.circuit, 'button').some((b) => (toUno(ctx, b.id, 'A', 'D2') && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', 'D2') && toGnd(ctx, b.id, 'A'))),
    },
    {
      id: 'led',
      text: '"Servo sınırda" LED’ini D13’e bir direnç üzerinden bağla.',
      hint: 'D13 → 330 Ω direnç → LED anodu; LED katodu → GND.',
      check: (ctx) => ledChain(ctx, 'D13'),
    },
    {
      id: 'ters-yon',
      text: 'Çalıştır ve tabanı en az 10° eğ: seri monitörde servo, eğimin tersi yönde ve aynı miktarda dönsün (eğim 20° ise servo 70°).',
      hint: 'İvme X = 0,34 ve İvme Z = 0,94 yap (yaklaşık 20°). Birkaç saniye bekle; servo = 90 − egim olmalı. MPU6050 bağlı ve beslenmiş olmalı.',
      behavior: true,
      check: (ctx) => [...serialOf(ctx).matchAll(/egim=(-?\d+(?:\.\d+)?) servo=(\d+)/g)].some((m) => {
        const egim = Number(m[1]), servo = Number(m[2])
        return Math.abs(egim) >= 10 && Math.abs(Math.abs(servo - 90) - Math.abs(egim)) <= 3 && Math.sign(servo - 90) === -Math.sign(egim)
      }),
    },
    {
      id: 'sinir-led',
      text: 'Tabanı çok fazla eğ (İvme X = 1 ve İvme Z = 0,1 gibi): servo sınıra dayanınca LED yansın.',
      hint: 'Servo açısı 10 ile 170 arasında kalır; sınıra gelince D13 HIGH olur. Eğimi 85° civarına çıkar.',
      behavior: true,
      check: (ctx) => ledToggles(ctx) >= 1,
    },
    {
      id: 'sifirla',
      text: 'Taban eğikken butona (Basılı özelliği) bas: eğim sıfırlansın ve servo 90° civarına dönsün.',
      hint: 'Tabanı örneğin 20° eğ, butona bas. Program o anki açıyı ofset olarak saklar: egim yaklaşık 0, servo yaklaşık 90 olur.',
      behavior: true,
      check: (ctx) =>
        (ctx.stats?.pinEdges['D2'] ?? 0) >= 1 &&
        /egim=-?(?:1\d|2\d|3\d)(?:\.\d+)?\s+servo=\d+\s[\s\S]*egim=-?[01](?:\.\d+)?\s+servo=(?:8[7-9]|9[0-3])\s/.test(serialOf(ctx)),
    },
  ],
  solution: () => ({ circuit: gimbalCircuit(), code: `#include <Wire.h>
#include <Servo.h>
#include <LiquidCrystal_I2C.h>

const int MPU = 0x68;
const int SERVO_PIN = 6;
const int SIFIRLA = 2;
const int LED = 13;

const float ALFA = 0.98;
const int SERVO_MERKEZ = 90;
const int SERVO_MIN = 10;
const int SERVO_MAX = 170;
const unsigned long DONGU_MS = 10;
const unsigned long EKRAN_MS = 250;

Servo servo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

float sapmaGy = 0;
float aci = 0;                       // filtreli pitch (derece)
float ofset = 0;                     // "sıfır" kabul edilen açı
float ax, az, gy;                    // son ölçüm: g, g, °/s
unsigned long sonDongu = 0;
unsigned long sonEkran = 0;
unsigned long sonUs = 0;
bool oncekiBasili = false;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void mpuOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 14, true);
  ax = oku16() / 16384.0;
  oku16();                           // ay: kullanmıyoruz
  az = oku16() / 16384.0;
  oku16();                           // sıcaklık
  oku16();                           // gx
  gy = oku16() / 131.0;              // pitch: Y ekseni etrafında dönüş
  oku16();                           // gz
}

float ivmeAci() {
  return atan2(ax, az) * 180.0 / PI;
}

void ekranYaz(float egim, int servoAci) {
  lcd.setCursor(0, 0);
  lcd.print("Egim: ");
  lcd.print(egim, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print("Servo: ");
  lcd.print(servoAci);
  lcd.print("      ");
}

void setup() {
  Serial.begin(9600);
  pinMode(SIFIRLA, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  servo.attach(SERVO_PIN);
  servo.write(SERVO_MERKEZ);

  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);                     // uyandır
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;                  // sapma ölçümü: çip kıpırdamasın
  for (int i = 0; i < 100; i++) {
    mpuOku();
    toplam += gy;
    delay(5);
  }
  sapmaGy = toplam / 100;

  mpuOku();
  aci = ivmeAci();                   // başlangıç açısı ivmeölçerden
  lcd.init();
  lcd.backlight();
  sonUs = micros();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Sıfırlama düğmesi: basıldığı an bir kez
  bool basili = (digitalRead(SIFIRLA) == LOW);
  if (basili && !oncekiBasili) {
    ofset = aci;
  }
  oncekiBasili = basili;

  // 2) Her 10 ms'de ölçüm, filtre ve servo
  if (simdi - sonDongu >= DONGU_MS) {
    sonDongu = simdi;

    mpuOku();
    unsigned long us = micros();
    float dt = (us - sonUs) / 1000000.0;
    sonUs = us;
    aci = ALFA * (aci + (gy - sapmaGy) * dt) + (1.0 - ALFA) * ivmeAci();

    float egim = aci - ofset;
    int servoAci = SERVO_MERKEZ - (int)round(egim);   // ters yönde dön
    bool sinirda = (servoAci <= SERVO_MIN || servoAci >= SERVO_MAX);
    servoAci = constrain(servoAci, SERVO_MIN, SERVO_MAX);
    servo.write(servoAci);
    digitalWrite(LED, sinirda ? HIGH : LOW);

    // 3) Ekran ve seri çıktı: 250 ms'de bir
    if (simdi - sonEkran >= EKRAN_MS) {
      sonEkran = simdi;
      ekranYaz(egim, servoAci);
      Serial.print("egim=");
      Serial.print(egim, 1);
      Serial.print(" servo=");
      Serial.println(servoAci);
    }
  }
}
` }),
  scenario: (s) => {
    s.advance(3500)                          // düz: servo 90
    s.setProp('mpu', 'ax', 0.34)             // yaklaşık 20°: servo 70
    s.setProp('mpu', 'az', 0.94)
    s.advance(3000)
    s.setProp('mpu', 'ax', 0.996)            // yaklaşık 85°: servo sınırda, LED yanar
    s.setProp('mpu', 'az', 0.087)
    s.advance(2000)
    s.setProp('mpu', 'ax', 0.34)             // yine 20°
    s.setProp('mpu', 'az', 0.94)
    s.advance(2000)
    s.setProp('btn', 'pressed', true)        // sıfırla: ofset = 20°, servo 90
    s.advance(200)
    s.setProp('btn', 'pressed', false)
    s.advance(1500)
  },
}

export const m4h5Activities: Record<string, LabActivity> = {
  'sensorler-ve-projeler:5:1': joystick,
  'sensorler-ve-projeler:5:2': encoder,
  'sensorler-ve-projeler:5:3': mpuEgim,
  'sensorler-ve-projeler:5:4': mpuFiltre,
  'sensorler-ve-projeler:5:5': mimiGimbal,
}

import type { LabActivity, LabScenario } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 2 (Varlık ve engel) laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:2:<ders>" (ders 1 tabanlı konum; 41-45). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)
/** Bir LED, bir direnç üzerinden Uno pinine (A ucu) ve katodu GND'ye bağlı mı. */
const ledOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', unoPin), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))
/** Bir parçanın iki ucu: biri Uno pinine, öbürü GND'ye (buton, reed). */
const switchOnPin = (ctx: LabGoalCtx, type: 'button' | 'reed', unoPin: string) =>
  partsOf(ctx.circuit, type).some((b) => (toUno(ctx, b.id, 'A', unoPin) && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', unoPin) && toGnd(ctx, b.id, 'A')))

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))
/** Direnç + LED'i bir Uno pinine bağlar (anot tarafı dirençli). */
const addLed = (c: Circuit, unoPin: string, x: number, y: number) => {
  c.parts.push(part('r1', 'resistor', x, y, { ohms: 330 }), part('led1', 'led', x + 120, y, { color: 'red' }))
  w(c, ['uno', unoPin], ['r1', '1']); w(c, ['r1', '2'], ['led1', 'A']); w(c, ['led1', 'K'], ['uno', 'GND'])
}
const anyLedOn = (ctx: LabGoalCtx) => partsOf(ctx.circuit, 'led').some((l) => ctx.lab?.parts[l.id]?.led?.on === true)

/** Butona kısa bir süre basıp bırakır (YALNIZ TEST). */
const bas = (s: LabScenario, id: string, ms = 60) => { s.setProp(id, 'pressed', true); s.advance(ms); s.setProp(id, 'pressed', false) }

// ---------------------------------------------------------------- Ders 41: PIR, hareket ve ısınma
const pirCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('pir', 'pir', 360, 60, { motion: false }))
  w(c, ['pir', 'VCC'], ['uno', '5V']); w(c, ['pir', 'GND'], ['uno', 'GND']); w(c, ['pir', 'OUT'], ['uno', 'D2'])
  addLed(c, 'D13', 360, 240)
  return c
}

const PIR_STARTER = `const int PIR = 2;
const int LED = 13;
const unsigned long ISINMA_MS = 5000;

bool oncekiHareket = false;

void setup() {
  // PIR girişi (düz INPUT), LED çıkışı, Serial.begin(9600)
  // ısınma bitene kadar (millis() < ISINMA_MS) PIR'ı okuma; LED hızlı yanıp sönsün
  // sonra seri monitöre "Hazir" yaz
}

void loop() {
  // PIR okunuyorsa LED yansın; hareket başlayınca "Hareket var", bitince "Hareket bitti" yaz
}
`

const pir: LabActivity = {
  intro: 'PIR sensörü kur: OUT ucu D2’ye, LED D13’e. Önce ısınma süresini bekle (laboratuvarda 2 sn, programda 5 sn), sonra özellik panelinden PIR’ın Hareket kutusunu işaretleyip LED’i yak. Hareketi bitirince PIR çıkışı 3 sn daha HIGH kalır.',
  starter: () => ({ circuit: unoOnly(), code: PIR_STARTER }),
  allowedParts: ['pir', 'led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir PIR, bir LED ve bir direnç ekle.',
      hint: '"Parça ekle" menüsünden PIR, LED ve direnç seç.',
      check: ({ circuit }) => partsOf(circuit, 'pir').length >= 1 && partsOf(circuit, 'led').length >= 1 && partsOf(circuit, 'resistor').length >= 1,
    },
    {
      id: 'pir-baglanti',
      text: 'PIR’ın VCC ucunu 5V’a, GND ucunu GND’ye, OUT ucunu D2’ye bağla.',
      hint: 'Besleme eksikse PIR çalışmaz ve "beslenmemiş" uyarısı çıkar. OUT ucu D2’ye gider.',
      check: (ctx) => partsOf(ctx.circuit, 'pir').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'OUT', 'D2')),
    },
    {
      id: 'led',
      text: 'LED’i bir dirençle D13’e bağla (LED’in K ucu GND’ye).',
      hint: 'D13 → direnç → LED A; LED K → GND. LED’i dirençsiz bağlama.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'isinma',
      text: 'Programda ısınma süresini bekle: ısınma bitene kadar PIR’ı yok say.',
      hint: 'setup() içinde millis() < ISINMA_MS olduğu sürece dönen bir while döngüsü yaz (en az 2 sn). Isınmada PIR parazitli HIGH-LOW yapar.',
      check: ({ code }) => {
        const c = noComments(code)
        return /millis\s*\(\s*\)\s*(-\s*\w+\s*)?[<>]/.test(c) || /delay\s*\(\s*(?:[2-9]\d{3}|\d{5,})\s*\)/.test(c)
      },
    },
    {
      id: 'hareket-led',
      text: 'Isınma bitince PIR’ın Hareket kutusunu işaretle: LED yansın.',
      hint: 'Önce ▶’e bas ve ısınma bitsin. Sonra PIR’ı seç, özellik panelinde Hareket kutusunu işaretle. Kodda LED’i digitalWrite(LED, digitalRead(PIR)) ile sür.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'pir').some((p) => {
        const r = ctx.lab?.parts[p.id]?.pir
        return !!r && r.powered && !r.warmingUp && r.out
      }) && anyLedOn(ctx),
    },
  ],
  solution: () => ({
    circuit: pirCircuit(),
    code: `const int PIR = 2;
const int LED = 13;
const unsigned long ISINMA_MS = 5000;

bool oncekiHareket = false;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Isiniyor...");
  while (millis() < ISINMA_MS) {
    digitalWrite(LED, (millis() / 250) % 2);
  }
  digitalWrite(LED, LOW);
  Serial.println("Hazir");
}

void loop() {
  bool hareket = (digitalRead(PIR) == HIGH);
  if (hareket && !oncekiHareket) Serial.println("Hareket var");
  if (!hareket && oncekiHareket) Serial.println("Hareket bitti");
  oncekiHareket = hareket;
  digitalWrite(LED, hareket);
}
`,
  }),
  scenario: (s) => {
    s.advance(5500)                       // ısınma bitti
    s.setProp('pir', 'motion', true)
    s.advance(400)
  },
}

// ---------------------------------------------------------------- Ders 42: IR engel sensörü ve eşik
const irCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('ir', 'irobstacle', 360, 60, { proximity: 0, threshold: 0.5 }))
  w(c, ['ir', 'VCC'], ['uno', '5V']); w(c, ['ir', 'GND'], ['uno', 'GND']); w(c, ['ir', 'OUT'], ['uno', 'D3']); w(c, ['ir', 'AO'], ['uno', 'A0'])
  addLed(c, 'D13', 360, 260)
  return c
}

const IR_STARTER = `const int IR = 3;
const int LED = 13;
const int ENGEL_SEVIYESI = LOW;   // laboratuvardaki parça engel varken LOW verir

void setup() {
  // IR girişi (INPUT), LED çıkışı, Serial.begin(9600)
}

void loop() {
  // engel var mı? LED’i buna göre yak; seri monitöre "Engel var" / "Engel yok" ve analogRead(A0) değerini yaz
  // en sonda delay(200)
}
`

const irEngel: LabActivity = {
  intro: 'IR engel sensörünü bağla. Özellik panelinde Yakınlık kaydırıcısı cismin yansımasını, Eşik kaydırıcısı ayar vidasını temsil eder: Yakınlık eşiğe ulaşınca engel algılanır, OUT LOW olur.',
  starter: () => ({ circuit: unoOnly(), code: IR_STARTER }),
  allowedParts: ['irobstacle', 'led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir IR engel sensörü, bir LED ve bir direnç ekle.',
      hint: '"Parça ekle" menüsünden IR engel sensörünü, LED’i ve direnci seç.',
      check: ({ circuit }) => partsOf(circuit, 'irobstacle').length >= 1 && partsOf(circuit, 'led').length >= 1 && partsOf(circuit, 'resistor').length >= 1,
    },
    {
      id: 'ir-baglanti',
      text: 'Sensörün VCC ucunu 5V’a, GND ucunu GND’ye, OUT ucunu D3’e bağla.',
      hint: 'Besleme eksikse sensör hep "engel yok" der. OUT ucu D3’e gider.',
      check: (ctx) => partsOf(ctx.circuit, 'irobstacle').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'OUT', 'D3')),
    },
    {
      id: 'led',
      text: 'LED’i bir dirençle D13’e bağla (LED’in K ucu GND’ye).',
      hint: 'D13 → direnç → LED A; LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'ao',
      text: 'AO ucunu A0’a bağla ve kodda analogRead(A0) ile yansıma değerini oku.',
      hint: 'AO → A0 kablosunu çek, sonra programda int deger = analogRead(A0); yaz ve seri monitöre yazdır.',
      check: (ctx) => partsOf(ctx.circuit, 'irobstacle').some((p) => toUno(ctx, p.id, 'AO', 'A0')) && /analogRead\s*\(/.test(noComments(ctx.code)) && /\b(A0|AO)\b/.test(noComments(ctx.code)),
    },
    {
      id: 'engel-led',
      text: 'Programı çalıştır: Yakınlığı artırıp azalt; LED engel varken yansın, yokken sönsün.',
      hint: 'Yakınlık eşiğe (0,5) ulaşınca OUT LOW olur. Kodda digitalWrite(LED, digitalRead(IR) == LOW); kullan. LED en az iki kez değişmeli.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'irobstacle').some((p) => {
        const r = ctx.lab?.parts[p.id]?.irobstacle
        const toggles = partsOf(ctx.circuit, 'led').reduce((a, l) => a + (ctx.stats.ledToggles[l.id] ?? 0), 0)
        return !!r && r.powered && toggles >= 2 && anyLedOn(ctx) === r.detected
      }),
    },
    {
      id: 'vida',
      text: 'Yakınlığı yüksek tut (0,6 gibi), Eşik değerini ondan büyük yap: engel algılanmasın.',
      hint: 'Sensörü seç; Yakınlık 0,6 iken Eşik (ayar vidası) değerini 0,8 yap. Eşiği büyütmek sensörü daha az duyarlı yapar; LED sönmeli.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'irobstacle').some((p) => {
        const r = ctx.lab?.parts[p.id]?.irobstacle
        return !!r && r.powered && r.aoVolts > 2.7 && !r.detected
      }),
    },
  ],
  solution: () => ({
    circuit: irCircuit(),
    code: `const int IR = 3;
const int LED = 13;
const int AO = A0;
const int ENGEL_SEVIYESI = LOW;

void setup() {
  pinMode(IR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);
  digitalWrite(LED, engel);
  Serial.print(engel ? "Engel var" : "Engel yok");
  Serial.print(" AO=");
  Serial.println(analogRead(AO));
  delay(200);
}
`,
  }),
  scenario: (s) => {
    s.advance(300)
    s.setProp('ir', 'proximity', 0.8)     // engel var: LED yanar
    s.advance(400)
    s.setProp('ir', 'proximity', 0.6)
    s.setProp('ir', 'threshold', 0.9)     // vida çevrildi: engel yok sayılır
    s.advance(400)
  },
}

// ---------------------------------------------------------------- Ders 43: Reed ve limit anahtarı
const reedCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('reed', 'reed', 360, 60), part('limit', 'button', 360, 160))
  w(c, ['uno', 'D4'], ['reed', 'A']); w(c, ['reed', 'B'], ['uno', 'GND'])
  w(c, ['uno', 'D3'], ['limit', 'A']); w(c, ['limit', 'B'], ['uno', 'GND2'])
  addLed(c, 'D13', 360, 280)
  return c
}

const REED_STARTER = `const int PIN_SAYISI = 2;
const int PINLER[PIN_SAYISI] = {4, 3};   // 0: reed (D4), 1: limit anahtarı = buton (D3)
const int LED = 13;
const unsigned long KARARLI_MS = 20;

bool kararli[PIN_SAYISI];
bool sonOkunan[PIN_SAYISI];
unsigned long sonDegisim[PIN_SAYISI];

void setup() {
  // iki pini INPUT_PULLUP yap, LED’i çıkış yap, Serial.begin(9600)
}

void loop() {
  // her anahtar için: LOW = kontak kapalı; değişim KARARLI_MS boyunca sürerse kabul et ve
  // "Reed: kapali" / "Limit: acik" gibi bir mesaj yaz
  // LED kapı açıkken (reed kontağı açıkken) yansın
}
`

const reed: LabActivity = {
  intro: 'Reed anahtarı kapıyı, buton da limit anahtarını temsil eder. Reed’in Mıknatıs yakın kutusu işaretliyse kapı kapalıdır; LED kapı açıkken yanmalı. Butonun Basılı kutusu limit kolunun basılmasıdır.',
  starter: () => ({ circuit: unoOnly(), code: REED_STARTER }),
  allowedParts: ['reed', 'button', 'led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir reed, bir buton (limit anahtarı), bir LED ve bir direnç ekle.',
      hint: '"Parça ekle" menüsünden reed’i, butonu, LED’i ve direnci seç.',
      check: ({ circuit }) => partsOf(circuit, 'reed').length >= 1 && partsOf(circuit, 'button').length >= 1 && partsOf(circuit, 'led').length >= 1 && partsOf(circuit, 'resistor').length >= 1,
    },
    {
      id: 'reed-baglanti',
      text: 'Reed’in bir ucunu D4’e, öbür ucunu GND’ye bağla.',
      hint: 'Reed çıplak bir anahtardır: A → D4, B → GND. Kodda D4 INPUT_PULLUP olmalı.',
      check: (ctx) => switchOnPin(ctx, 'reed', 'D4'),
    },
    {
      id: 'limit-baglanti',
      text: 'Butonu (limit anahtarı) D3 ile GND arasına bağla.',
      hint: 'Butonun bir ucu D3, öbür ucu GND. Kodda D3 INPUT_PULLUP olmalı.',
      check: (ctx) => switchOnPin(ctx, 'button', 'D3'),
    },
    {
      id: 'led',
      text: 'LED’i bir dirençle D13’e bağla (LED’in K ucu GND’ye).',
      hint: 'D13 → direnç → LED A; LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'led-kapi',
      text: 'Programı çalıştır: Mıknatıs yakın kutusunu işaretleyip kaldır; LED kapı açıkken yansın, kapalıyken sönsün.',
      hint: 'Kontak kapalıyken (mıknatıs yakın) pin LOW okunur. LED’i digitalWrite(LED, kapı açık) ile sür. LED en az iki kez değişmeli.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'reed').some((r) => {
        const st = ctx.lab?.parts[r.id]?.reed
        const toggles = partsOf(ctx.circuit, 'led').reduce((a, l) => a + (ctx.stats.ledToggles[l.id] ?? 0), 0)
        return !!st && toggles >= 2 && anyLedOn(ctx) === !st.closed
      }),
    },
    {
      id: 'limit-mesaj',
      text: 'Butona (limit) basınca seri monitörde "Limit" sözcüğü geçen bir mesaj yazsın.',
      hint: 'Butonun Basılı kutusunu işaretle. Kodda LOW görünce Serial.println("Limit: kapali"); yaz.',
      behavior: true,
      check: ({ lab }) => /limit/i.test(lab?.serial ?? ''),
    },
  ],
  solution: () => ({
    circuit: reedCircuit(),
    code: `const int PIN_SAYISI = 2;
const int PINLER[PIN_SAYISI] = {4, 3};
const int LED = 13;
const unsigned long KARARLI_MS = 20;

bool kararli[PIN_SAYISI];
bool sonOkunan[PIN_SAYISI];
unsigned long sonDegisim[PIN_SAYISI];

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
  for (int i = 0; i < PIN_SAYISI; i++) {
    pinMode(PINLER[i], INPUT_PULLUP);
    kararli[i] = false;
    sonOkunan[i] = false;
    sonDegisim[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();
  for (int i = 0; i < PIN_SAYISI; i++) {
    bool kapali = (digitalRead(PINLER[i]) == LOW);
    if (kapali != sonOkunan[i]) {
      sonOkunan[i] = kapali;
      sonDegisim[i] = simdi;
    }
    if (sonOkunan[i] != kararli[i] && simdi - sonDegisim[i] >= KARARLI_MS) {
      kararli[i] = sonOkunan[i];
      Serial.print(i == 0 ? "Reed: " : "Limit: ");
      Serial.println(kararli[i] ? "kapali" : "acik");
    }
  }
  digitalWrite(LED, !kararli[0]);   // kapı açıkken LED yanar
}
`,
  }),
  scenario: (s) => {
    s.advance(300)
    s.setProp('reed', 'magnet', true)     // kapı kapandı: LED söner
    s.advance(200)
    s.setProp('reed', 'magnet', false)    // kapı açıldı: LED yanar
    s.advance(200)
    s.setProp('reed', 'magnet', true)     // kapı yine kapandı
    s.advance(200)
    s.setProp('limit', 'pressed', true)   // limit kolu basıldı
    s.advance(200)
  },
}

// ---------------------------------------------------------------- Ders 44: VL53L0X (parça yok; kod ve hata kontrolü)
const TOF_STARTER = `#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

const int LED = 13;
const int YAKIN_MM = 300;   // bunun altında "yakın"
const int UZAK_MM = 340;    // bunun üstünde "uzak"

bool yakin = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Wire.begin();
  // zaman aşımını 500 ms yap
  // sensor.init() başarısızsa seri monitöre bir hata yaz ve dur
  // sürekli ölçümü başlat
}

void loop() {
  // sürekli ölçümle mm değerini oku
  // zaman aşımı olduysa okumaya güvenme
  // iki eşikle (histerezis) yakin değişkenini güncelle ve LED’e yaz
}
`

const tof: LabActivity = {
  intro: 'Laboratuvarda VL53L0X parçası yok, bu yüzden devre kurmayacaksın. Sensör kodunu yaz: sensör bulunamazsa program bunu fark edip seri monitöre haber versin. ▶’e basınca "bulunamadi" benzeri bir mesaj görmelisin.',
  starter: () => ({ circuit: unoOnly(), code: TOF_STARTER }),
  allowedParts: [],
  goals: [
    {
      id: 'kutuphane',
      text: 'Kodda Wire ve VL53L0X kütüphanelerini ekle ve bir VL53L0X nesnesi oluştur.',
      hint: '#include <Wire.h>, #include <VL53L0X.h> ve VL53L0X sensor; yaz.',
      check: ({ code }) => {
        const c = noComments(code)
        return /#include\s*<Wire\.h>/.test(c) && /#include\s*<VL53L0X\.h>/.test(c) && /\bVL53L0X\s+\w+\s*;/.test(c)
      },
    },
    {
      id: 'timeout',
      text: 'Zaman aşımını ayarla (setTimeout) ve okuma sonrası timeoutOccurred() ile kontrol et.',
      hint: 'setup() içinde sensor.setTimeout(500); loop() içinde okumadan sonra if (sensor.timeoutOccurred()) ... ile kontrol et.',
      check: ({ code }) => /\.setTimeout\s*\(/.test(noComments(code)) && /\.timeoutOccurred\s*\(/.test(noComments(code)),
    },
    {
      id: 'olcum',
      text: 'Sürekli ölçümü başlat (startContinuous) ve mesafeyi readRangeContinuousMillimeters() ile oku.',
      hint: 'setup() içinde sensor.startContinuous(); loop() içinde int mm = sensor.readRangeContinuousMillimeters();',
      check: ({ code }) => /\.startContinuous\s*\(/.test(noComments(code)) && /\.readRangeContinuousMillimeters\s*\(/.test(noComments(code)),
    },
    {
      id: 'init-kontrol',
      text: 'init() başarısız olursa programı durdur.',
      hint: 'if (!sensor.init()) { Serial.println("VL53L0X bulunamadi"); while (true) {} }',
      check: ({ code }) => /!\s*\w+\.init\s*\(\s*\)/.test(noComments(code)) && /while\s*\(\s*(true|1)\s*\)/.test(noComments(code)),
    },
    {
      id: 'bulunamadi',
      text: 'Programı çalıştır: laboratuvarda sensör olmadığı için seri monitörde bir hata mesajı görünsün.',
      hint: 'init() başarısız olunca Serial.println ile bir mesaj yaz (örneğin "VL53L0X bulunamadi"). Serial.begin(9600) unutma.',
      behavior: true,
      check: ({ lab }) => (lab?.serial ?? '').trim().length > 0,
    },
  ],
  solution: () => ({
    circuit: unoOnly(),
    code: `#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

const int LED = 13;
const int YAKIN_MM = 300;
const int UZAK_MM = 340;

bool yakin = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Wire.begin();
  sensor.setTimeout(500);
  if (!sensor.init()) {
    Serial.println("VL53L0X bulunamadi");
    while (true) {}
  }
  sensor.startContinuous();
}

void loop() {
  int mm = sensor.readRangeContinuousMillimeters();
  if (!sensor.timeoutOccurred()) {
    if (!yakin && mm < YAKIN_MM) {
      yakin = true;
      Serial.println("Yakin");
    } else if (yakin && mm > UZAK_MM) {
      yakin = false;
      Serial.println("Uzak");
    }
  }
  digitalWrite(LED, yakin);
}
`,
  }),
  scenario: (s) => s.advance(1500),
}

// ---------------------------------------------------------------- Ders 45: Proje, hırsız alarmı
const alarmCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('pir', 'pir', 360, 40, { motion: false }),
    part('btn', 'button', 360, 160),
    part('reed', 'reed', 360, 240, { magnet: false }),
    part('bz', 'buzzer', 520, 40, { kind: 'passive' }),
  )
  w(c, ['pir', 'VCC'], ['uno', '5V']); w(c, ['pir', 'GND'], ['uno', 'GND']); w(c, ['pir', 'OUT'], ['uno', 'D2'])
  w(c, ['uno', 'D3'], ['btn', 'A']); w(c, ['btn', 'B'], ['uno', 'GND2'])
  w(c, ['uno', 'D4'], ['reed', 'A']); w(c, ['reed', 'B'], ['uno', 'GND2'])
  w(c, ['uno', 'D8'], ['bz', '+']); w(c, ['bz', '-'], ['uno', 'GND3'])
  addLed(c, 'D13', 520, 200)
  return c
}

const ALARM_CODE = `const int PIR = 2;
const int BUTON = 3;
const int REED = 4;
const int BUZZER = 8;
const int LED = 13;

const unsigned long CIKIS_GECIKMESI = 5000;   // ms
const unsigned long ALARM_SURESI = 10000;     // ms
const unsigned long SIFRE_PENCERESI = 3000;   // ms
const unsigned long BUTON_KARARLI = 30;       // ms: debounce
const int SIFRE_BASIS = 3;                    // şifre: 3 basış

enum Durum { DEVRE_DISI, HAZIR, ALARM, SUSTURULDU };
const char* DURUM_ADI[] = { "DEVRE_DISI", "HAZIR", "ALARM", "SUSTURULDU" };

Durum durum = DEVRE_DISI;
bool cikisBekliyor = false;
unsigned long cikisBasla = 0;
unsigned long alarmBasla = 0;

bool oncekiBasili = false;
unsigned long sonBasis = 0;
unsigned long ilkBasis = 0;
int basisSayisi = 0;

bool sirenFaz = false;

void durumDegistir(Durum yeni) {
  durum = yeni;
  basisSayisi = 0;                 // yeni durumda şifre sayacı sıfırlansın
  cikisBekliyor = false;
  noTone(BUZZER);
  sirenFaz = false;
  Serial.print("Durum: ");
  Serial.println(DURUM_ADI[durum]);
}

// Butonun yeni basışını bir kez bildirir (kenar + debounce).
bool yeniBasis(unsigned long simdi) {
  bool basili = (digitalRead(BUTON) == LOW);
  bool yeni = basili && !oncekiBasili && (simdi - sonBasis > BUTON_KARARLI);
  oncekiBasili = basili;
  if (yeni) sonBasis = simdi;
  return yeni;
}

// Şifre girildi mi? Her yeni basış için bir kez çağrılır.
bool sifreTamam(unsigned long simdi) {
  if (basisSayisi == 0 || simdi - ilkBasis > SIFRE_PENCERESI) {
    basisSayisi = 1;               // pencere dışında: yeni deneme başlat
    ilkBasis = simdi;
  } else {
    basisSayisi++;
  }
  if (basisSayisi >= SIFRE_BASIS) {
    basisSayisi = 0;
    return true;
  }
  return false;
}

bool ihlalVar() {
  bool hareket = (digitalRead(PIR) == HIGH);
  bool kapiAcik = (digitalRead(REED) == HIGH);
  return hareket || kapiAcik;
}

// LED desenini durumdan üretir.
void ledGuncelle(unsigned long simdi) {
  bool yanik = false;
  if (durum == DEVRE_DISI) {
    yanik = cikisBekliyor && (simdi % 500 < 250);     // çıkış gecikmesinde hızlı
  } else if (durum == HAZIR) {
    yanik = (simdi % 2000 < 100);                     // 2 sn'de bir kısa parlama
  } else if (durum == ALARM) {
    yanik = (simdi % 200 < 100);                      // çok hızlı
  } else {
    yanik = (simdi % 1000 < 500);                     // yavaş
  }
  digitalWrite(LED, yanik);
}

// Siren: 250 ms'de bir 1 kHz ile 2 kHz arasında geçiş yapar.
void sirenGuncelle(unsigned long simdi) {
  bool faz = (simdi / 250) % 2;
  if (faz != sirenFaz) {
    sirenFaz = faz;
    tone(BUZZER, faz ? 2000 : 1000);
  }
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(REED, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Durum: DEVRE_DISI");
}

void loop() {
  unsigned long simdi = millis();
  bool basis = yeniBasis(simdi);

  switch (durum) {
    case DEVRE_DISI:
      if (basis && !cikisBekliyor) {
        if (digitalRead(REED) == HIGH) {
          Serial.println("Kapi acik, kurulamadi");
        } else {
          cikisBekliyor = true;
          cikisBasla = simdi;
          Serial.println("Cikis gecikmesi basladi");
        }
      }
      if (cikisBekliyor && simdi - cikisBasla >= CIKIS_GECIKMESI) {
        if (digitalRead(REED) == HIGH) {
          cikisBekliyor = false;
          Serial.println("Kapi kapanmadi, kurma iptal");
        } else {
          durumDegistir(HAZIR);
        }
      }
      break;

    case HAZIR:
      if (basis && sifreTamam(simdi)) {
        durumDegistir(DEVRE_DISI);
      } else if (ihlalVar()) {
        alarmBasla = simdi;
        durumDegistir(ALARM);
      }
      break;

    case ALARM:
      sirenGuncelle(simdi);
      if (basis && sifreTamam(simdi)) {
        durumDegistir(SUSTURULDU);
      } else if (simdi - alarmBasla >= ALARM_SURESI) {
        durumDegistir(SUSTURULDU);
      }
      break;

    case SUSTURULDU:
      if (basis && sifreTamam(simdi)) {
        durumDegistir(DEVRE_DISI);
      }
      break;
  }

  ledGuncelle(simdi);
}
`

const hirsizAlarmi: LabActivity = {
  intro: 'Proje: ders metnindeki durum makineli alarm programı hazır yüklüdür. Devreyi kur (PIR, buton, reed, buzzer, LED), sonra dene: önce reed’in Mıknatıs yakın kutusunu işaretle (kapı kapalı), butona bas, 5 sn bekle (HAZIR). Sonra PIR’ın Hareket kutusunu işaretle (ALARM). Butona 3 sn içinde üç kez basınca alarm susar.',
  starter: () => ({ circuit: unoOnly(), code: ALARM_CODE }),
  allowedParts: ['pir', 'button', 'reed', 'buzzer', 'led', 'resistor'],
  goals: [
    {
      id: 'pir',
      text: 'PIR’ı bağla: VCC → 5V, GND → GND, OUT → D2.',
      hint: 'PIR beslenmezse çıkışı hep LOW kalır ve alarm hareket görmez.',
      check: (ctx) => partsOf(ctx.circuit, 'pir').some((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND') && toUno(ctx, p.id, 'OUT', 'D2')),
    },
    {
      id: 'buton',
      text: 'Kur / şifre butonunu D3 ile GND arasına bağla.',
      hint: 'Butonun bir ucu D3, öbür ucu GND. Program INPUT_PULLUP kullanıyor.',
      check: (ctx) => switchOnPin(ctx, 'button', 'D3'),
    },
    {
      id: 'reed',
      text: 'Kapı kontağı olan reed’i D4 ile GND arasına bağla.',
      hint: 'Reed’in bir ucu D4, öbür ucu GND. Mıknatıs yakın = kapı kapalı = D4 LOW.',
      check: (ctx) => switchOnPin(ctx, 'reed', 'D4'),
    },
    {
      id: 'cikislar',
      text: 'Çıkışları bağla: buzzer + ucu D8’e, − ucu GND’ye; LED’i dirençle D13’e.',
      hint: 'Buzzer’ın Tür özelliği Pasif olsun (tone ile çalışır). LED için D13 → direnç → LED A, LED K → GND.',
      check: (ctx) => partsOf(ctx.circuit, 'buzzer').some((b) => toUno(ctx, b.id, '+', 'D8') && toGnd(ctx, b.id, '-')) && ledOnPin(ctx, 'D13'),
    },
    {
      id: 'hazir',
      text: 'Kapıyı kapat (Mıknatıs yakın), butona bas ve 5 sn bekle: seri monitörde "Durum: HAZIR" görünsün.',
      hint: 'Reed’in Mıknatıs yakın kutusunu işaretle. Kapı açıksa sistem kurulmaz. Çıkış gecikmesinde LED hızlı yanıp söner.',
      behavior: true,
      check: ({ lab }) => /Durum: HAZIR/.test(lab?.serial ?? ''),
    },
    {
      id: 'alarm',
      text: 'HAZIR iken PIR’ın Hareket kutusunu işaretle: "Durum: ALARM" görünsün, buzzer çalsın.',
      hint: 'Kapıyı açmak da (Mıknatıs yakın kutusunu kaldırmak) alarm çaldırır. Hareket ihlalini çıkış gecikmesi bittikten sonra ver.',
      behavior: true,
      check: ({ lab }) => /Durum: ALARM/.test(lab?.serial ?? ''),
    },
    {
      id: 'sustur',
      text: 'Butona 3 sn içinde üç kez bas: alarm "Durum: SUSTURULDU" olsun.',
      hint: 'Üç basış arasında 3 saniyeden fazla bekleme; süre dolarsa sayaç sıfırlanır.',
      behavior: true,
      check: ({ lab }) => /Durum: SUSTURULDU/.test(lab?.serial ?? ''),
    },
  ],
  solution: () => ({ circuit: alarmCircuit(), code: ALARM_CODE }),
  scenario: (s) => {
    s.setProp('reed', 'magnet', true)     // kapı kapalı
    s.advance(300)
    bas(s, 'btn')                         // kur
    s.advance(5500)                       // çıkış gecikmesi biter: HAZIR
    s.setProp('pir', 'motion', true)      // ihlal: ALARM
    s.advance(300)
    s.setProp('pir', 'motion', false)
    for (let i = 0; i < 3; i++) { bas(s, 'btn'); s.advance(200) }   // şifre: SUSTURULDU
    s.advance(500)
  },
}

export const m4h2Activities: Record<string, LabActivity> = {
  'sensorler-ve-projeler:2:1': pir,
  'sensorler-ve-projeler:2:2': irEngel,
  'sensorler-ve-projeler:2:3': reed,
  'sensorler-ve-projeler:2:4': tof,
  'sensorler-ve-projeler:2:5': hirsizAlarmi,
}

import type { LabActivity } from '../activity'
import type { Circuit, PartType } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/**
 * Modül 4, hafta 4 (Işık, ses, gaz) laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:4:<ders>" (ders 1 tabanlı konum).
 * Koordinatör bu dosyadaki `m4h4Activities` nesnesini activities/index.ts'e kaydeder.
 */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const to3V3 = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '3V3'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)
const resistorToGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => viaResistor(ctx, pin(id, p), pin('uno', g)))

/** Uno pininden (dirençli ya da dirençsiz) LED'e ve oradan GND'ye giden, en az bir direnç içeren yol. */
const ledOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'led').some((l) =>
    (viaResistor(ctx, pin('uno', unoPin), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K')) ||
    (ctx.analysis.sameNet(pin('uno', unoPin), pin(l.id, 'A')) && resistorToGnd(ctx, l.id, 'K')))

/** Analog modül (mq2 / flame / sound): VCC beslemesi (3V3 de yeter diyen modüller için `v33`), GND ve AO → Uno analog pini. */
const analogModuleOn = (ctx: LabGoalCtx, type: PartType, aoPin: string, v33: boolean) =>
  partsOf(ctx.circuit, type).some((m) => (to5V(ctx, m.id, 'VCC') || (v33 && to3V3(ctx, m.id, 'VCC'))) && toGnd(ctx, m.id, 'GND') && toUno(ctx, m.id, 'AO', aoPin))

/** Bir sabit tanımındaki (const int X = 423; gibi) tam sayılardan eşik olabilecek (50-1000) olanları. */
const thresholdConsts = (code: string): number[] =>
  [...noComments(code).matchAll(/\b(?:const\s+)?(?:int|long|unsigned\s+int|byte)\s+\w+\s*=\s*(\d{2,4})\s*;/g)].map((m) => Number(m[1])).filter((n) => n >= 50 && n <= 1000)

const edges = (ctx: LabGoalCtx, pinName: string) => ctx.stats?.pinEdges[pinName] ?? 0
const pinLow = (ctx: LabGoalCtx, pinName: string) => !!ctx.lab && ctx.lab.pins[pinName]?.high === false
const pinHigh = (ctx: LabGoalCtx, pinName: string) => !!ctx.lab && ctx.lab.pins[pinName]?.high === true

const lcdLines = (ctx: LabGoalCtx): string[][] => partsOf(ctx.circuit, 'lcdI2c').map((p) => ctx.lab?.parts[p.id]?.lcd?.lines ?? [])

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))

/** Uno'nun D pininden dirençli LED devresi kurar (çözümler için). */
const addLed = (c: Circuit, id: string, unoPin: string, color: string, x: number, y: number) => {
  c.parts.push(part(`r${id}`, 'resistor', x, y, { ohms: 330 }), part(id, 'led', x + 120, y, { color }))
  w(c, ['uno', unoPin], [`r${id}`, '1']); w(c, [`r${id}`, '2'], [id, 'A']); w(c, [id, 'K'], ['uno', 'GND3'])
}

// ---------------------------------------------------------------- Ders 51: Işık sensörü hassasiyeti ve histerezis
const ldrCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('ldr', 'ldr', 360, 40, { light: 0.52 }), part('r10', 'resistor', 360, 140, { ohms: 10_000 }))
  w(c, ['uno', '5V'], ['ldr', '1']); w(c, ['ldr', '2'], ['uno', 'A1'])
  w(c, ['uno', 'A1'], ['r10', '1']); w(c, ['r10', '2'], ['uno', 'GND'])
  addLed(c, 'led1', 'D13', 'yellow', 360, 240)
  return c
}

const LDR_CODE = `// Karanlıkta yanan, titremeyen bir gece lambası: iki eşikli (histerezis) program.
const int LDR = A1;
const int LED = 13;
// Açma ve kapama için iki ayrı eşik tanımla (örneğin 423 ve 523).

bool yanik = false;
bool onceki = false;
int gecis = 0;
unsigned long sonYazma = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LDR);

  // yanik değişkenini iki eşiğe göre güncelle, sonra LED'i yanik'a göre sür

  if (yanik != onceki) {
    gecis++;
    onceki = yanik;
  }

  if (millis() - sonYazma >= 1000) {
    sonYazma = millis();
    Serial.print("gecis=");
    Serial.println(gecis);
  }
}
`

const lastGecis = (serial: string): number | null => {
  const m = [...serial.matchAll(/gecis=(\d+)/g)]
  return m.length ? Number(m[m.length - 1][1]) : null
}

const isikHisterezis: LabActivity = {
  intro: 'Karanlıkta yanan bir lamba kur: LDR’yi 10 kΩ ile bölücü yap, LED’i D13’e bağla. Sonra iki eşikli (histerezis) kodla ışığı eşiğin yanında oynatsan da LED’in titremediğini göster. Işığı LDR’nin Işık özelliğiyle değiştirirsin.',
  starter: () => ({ circuit: unoOnly(), code: LDR_CODE }),
  allowedParts: ['ldr', 'resistor', 'led'],
  goals: [
    {
      id: 'bolucu',
      text: 'LDR’yi 5V ile A1 arasına, 10 kΩ direnci A1 ile GND arasına bağla (gerilim bölücü).',
      hint: '5V → LDR → A1; A1 → direnç → GND. Direncin değerini özellik panelinden yaklaşık 10000 Ω yap.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'ldr').some((l) => (to5V(ctx, l.id, '1') && toUno(ctx, l.id, '2', 'A1')) || (to5V(ctx, l.id, '2') && toUno(ctx, l.id, '1', 'A1'))) &&
        partsOf(ctx.circuit, 'resistor').some((r) => {
          const ohms = Number(r.props.ohms)
          return ohms >= 5_000 && ohms <= 20_000 && ((toUno(ctx, r.id, '1', 'A1') && toGnd(ctx, r.id, '2')) || (toUno(ctx, r.id, '2', 'A1') && toGnd(ctx, r.id, '1')))
        }),
    },
    {
      id: 'led',
      text: 'D13’e bir direnç üzerinden bir LED bağla (LED’in öbür ucu GND).',
      hint: 'D13 → direnç (330 Ω) → LED A; LED K → GND. LED’i dirençsiz bağlama.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'iki-esik',
      text: 'Kodda açma ve kapama için iki ayrı eşik sabiti tanımla (aralarında en az 30 fark olsun).',
      hint: 'Örneğin const int ACMA = 423; ve const int KAPAMA = 523; Açma eşiği kapama eşiğinden küçük olmalı.',
      check: ({ code }) => {
        const t = thresholdConsts(code)
        return t.some((a) => t.some((b) => b - a >= 30))
      },
    },
    {
      id: 'yanar-soner',
      text: 'Programı çalıştır: ışığı karart (LED yansın), sonra aydınlat (LED sönsün).',
      hint: 'Önce Işık değerini 0,9 yap. Sonra 0,2 yap (LED yanar), sonra tekrar 0,9 yap (LED söner).',
      behavior: true,
      check: (ctx) => edges(ctx, 'D13') >= 2,
    },
    {
      id: 'titreme-yok',
      text: 'Işığı eşiğin yanında (0,50 ile 0,55 arasında) birkaç kez oynat: seri monitörde gecis=2 kalsın, LED titremesin.',
      hint: 'Işığı 0,9 → 0,2 → 0,9 yaptıktan sonra 0,50 ile 0,55 arasında gidip gel. Bant (ACMA-KAPAMA) bu aralığı kapsamalı. Işık değeri en son 0,47-0,58 arasında dursun.',
      behavior: true,
      check: (ctx) => {
        if (lastGecis(ctx.lab?.serial ?? '') !== 2) return false
        return partsOf(ctx.circuit, 'ldr').some((l) => {
          const v = Number(l.props.light)
          return v >= 0.47 && v <= 0.58
        })
      },
    },
  ],
  solution: () => ({
    circuit: ldrCircuit(),
    code: `const int LDR = A1;
const int LED = 13;
const int ACMA = 423;     // bunun altında: karanlık, LED yansın
const int KAPAMA = 523;   // bunun üstünde: aydınlık, LED sönsün

bool yanik = false;
bool onceki = false;
int gecis = 0;
unsigned long sonYazma = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LDR);

  if (!yanik && deger < ACMA) {
    yanik = true;
  } else if (yanik && deger > KAPAMA) {
    yanik = false;
  }
  digitalWrite(LED, yanik);

  if (yanik != onceki) {
    gecis++;
    onceki = yanik;
  }

  if (millis() - sonYazma >= 1000) {
    sonYazma = millis();
    Serial.print("gecis=");
    Serial.println(gecis);
  }
}
`,
  }),
  scenario: (s) => {
    s.advance(300)
    s.setProp('ldr', 'light', 0.2); s.advance(300)     // karanlık: LED yanar
    s.setProp('ldr', 'light', 0.9); s.advance(300)     // aydınlık: LED söner
    for (const v of [0.52, 0.53, 0.51, 0.52, 0.55, 0.5, 0.52]) { s.setProp('ldr', 'light', v); s.advance(100) }   // eşik çevresinde oynama
    s.advance(1300)
  },
}

// ---------------------------------------------------------------- Ders 52: Ses sensörü, alkış anahtarı
const alkisCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('mic', 'sound', 360, 40))
  w(c, ['mic', 'VCC'], ['uno', '5V']); w(c, ['mic', 'GND'], ['uno', 'GND']); w(c, ['mic', 'AO'], ['uno', 'A0'])
  addLed(c, 'led1', 'D13', 'yellow', 360, 240)
  return c
}

const ALKIS_CODE = `// Alkış anahtarı: iki alkışta LED'in durumu değişir.
const int SES = A0;
const int LED = 13;
const int TEPE_ESIK = 150;           // baz seviyeden en az bu kadar sapma
const unsigned long SURE_MIN = 10;   // ms: bundan kısa = parazit
const unsigned long SURE_MAX = 500;  // ms: bundan uzun = alkış değil
const unsigned long SESSIZ_PAY = 20; // ms
const unsigned long ARALIK = 3000;   // iki alkış arası en çok

int baz;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  // 1) baz'dan sapmayı oku: abs(analogRead(SES) - baz)
  // 2) sapma TEPE_ESIK'i aşınca olay başlar; SESSIZ_PAY kadar sessizlik olunca biter
  // 3) süre SURE_MIN ile SURE_MAX arasındaysa bu bir alkıştır
  // 4) iki alkışın başlangıcı ARALIK içindeyse LED'in durumunu tersine çevir
}
`

const alkisAnahtari: LabActivity = {
  intro: 'Ses modülünü A0’a bağla, LED’i D13’e bağla. Kodda önce baz seviyeyi ölç, sonra kısa ve yüksek sesleri (alkış) tanıyıp iki alkışta LED’i aç/kapat. Alkışı taklit etmek için çalışırken Ses şiddeti’ni 0,8 yap, hemen 0’a döndür. Dersteki “alkis_anahtar” programını Kopyala ile alabilirsin.',
  starter: () => ({ circuit: unoOnly(), code: ALKIS_CODE }),
  allowedParts: ['sound', 'led', 'resistor'],
  goals: [
    {
      id: 'modul',
      text: 'Ses modülünün VCC ucunu 5V’a, GND ucunu GND’ye, AO ucunu A0’a bağla.',
      hint: 'Modülü "Parça ekle" menüsünden seç. DO ucunu bağlamana gerek yok; analog çıkış AO’dur.',
      check: (ctx) => analogModuleOn(ctx, 'sound', 'A0', true),
    },
    {
      id: 'led',
      text: 'D13’e bir direnç üzerinden bir LED bağla (LED’in öbür ucu GND).',
      hint: 'D13 → direnç (330 Ω) → LED A; LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'baz',
      text: 'Programı çalıştır: seri monitörde baz= ile ölçtüğün baz seviye görünsün.',
      hint: 'Baz seviyeyi açılışta, Ses şiddeti 0 iken ölç (yaklaşık 256 çıkar). Serial.print("baz="); Serial.println(baz);',
      behavior: true,
      check: ({ lab }) => /baz=\d+/.test(lab?.serial ?? ''),
    },
    {
      id: 'iki-alkis-yakar',
      text: 'İki alkış (Ses şiddeti’ni 0,8 yapıp 0’a döndür; 3 saniye içinde iki kez) ile LED yansın.',
      hint: 'Tek alkış LED’i değiştirmemeli. Kodda alkışın süresini (SURE_MIN-SURE_MAX) ve iki alkışın başlangıcı arasındaki süreyi (ARALIK) denetle.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 1),
    },
    {
      id: 'iki-alkis-sondurur',
      text: 'İki alkış daha: LED sönsün.',
      hint: 'Her iki alkışta LED’in durumunu tersine çevir: ledAcik = !ledAcik; Son durumda LED sönük olmalı.',
      behavior: true,
      check: ({ circuit, lab, stats }) =>
        partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 2 && lab?.parts[l.id]?.led?.on === false),
    },
  ],
  solution: () => ({
    circuit: alkisCircuit(),
    code: `const int SES = A0;
const int LED = 13;
const int TEPE_ESIK = 150;
const unsigned long SURE_MIN = 10;
const unsigned long SURE_MAX = 500;
const unsigned long SESSIZ_PAY = 20;
const unsigned long ARALIK = 3000;   // iki alkış arası en çok

int baz;
bool sesVar = false;
unsigned long baslangic = 0;
unsigned long sonYuksek = 0;
int tepe = 0;
unsigned long sure = 0;

bool ledAcik = false;
int alkisSay = 0;
unsigned long ilkAlkis = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

char olayOku() {
  unsigned long simdi = millis();
  int fark = abs(analogRead(SES) - baz);

  if (fark >= TEPE_ESIK) {
    if (!sesVar) {
      sesVar = true;
      baslangic = simdi;
      tepe = 0;
    }
    sonYuksek = simdi;
    if (fark > tepe) tepe = fark;
  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {
    sesVar = false;
    sure = sonYuksek - baslangic;
    if (sure < SURE_MIN) return 'K';
    if (sure > SURE_MAX) return 'U';
    return 'A';
  }
  return 0;
}

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  char olay = olayOku();

  if (olay == 'A') {
    if (alkisSay == 1 && baslangic - ilkAlkis <= ARALIK) {
      ledAcik = !ledAcik;
      digitalWrite(LED, ledAcik);
      alkisSay = 0;
      Serial.println(ledAcik ? "LED acik" : "LED kapali");
    } else {
      alkisSay = 1;
      ilkAlkis = baslangic;
    }
  } else if (olay == 'U') {
    alkisSay = 0;              // uzun ses: alkış dizisini sıfırla
  }
}
`,
  }),
  scenario: (s) => {
    const alkis = (ms: number) => { s.setProp('mic', 'sound', 0.8); s.advance(ms); s.setProp('mic', 'sound', 0) }
    s.advance(700)                          // baz ölçümü
    alkis(60); s.advance(400); alkis(60); s.advance(800)       // iki alkış: LED yanar
    alkis(60); s.advance(400); alkis(60); s.advance(800)       // iki alkış daha: LED söner
  },
}

// ---------------------------------------------------------------- Ders 53: MQ-2 gaz sensörü
const mq2Circuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('gaz', 'mq2', 360, 40))
  w(c, ['gaz', 'VCC'], ['uno', '5V']); w(c, ['gaz', 'GND'], ['uno', 'GND']); w(c, ['gaz', 'AO'], ['uno', 'A3'])
  addLed(c, 'durum', 'D12', 'green', 360, 200)
  addLed(c, 'alarm', 'D13', 'red', 360, 280)
  return c
}

const MQ2_CODE = `// MQ-2: ısın, temiz havada baz değeri ölç, bazın katına göre alarm ver.
const int GAZ = A3;
const int DURUM_LED = 12;
const int ALARM_LED = 13;
const unsigned long ISINMA_MS = 5000;   // ders için kısa; gerçekte çok daha uzun
const float ALARM_ORAN = 1.5;           // bazın 1,5 katı: alarm başlar
const float BIRAK_ORAN = 1.2;           // bazın 1,2 katının altı: alarm biter

float baz;
float ort;
bool alarm = false;

void setup() {
  pinMode(DURUM_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);
  Serial.begin(9600);

  // 1) ISINMA_MS dolana kadar durum LED'ini yanıp söndür (while (millis() < ISINMA_MS))
  // 2) 32 ölçümün ortalamasını baz yap ve seri monitöre "baz=" ile yaz
}

void loop() {
  // 3) okumayı yumuşat: ort = 0.8 * ort + 0.2 * analogRead(GAZ)
  // 4) oran = ort / baz; ALARM_ORAN'a çıkınca alarm, BIRAK_ORAN'ın altına inince alarmı bitir
  // 5) ALARM_LED'i alarm'a göre sür
}
`

const mq2Alarm: LabActivity = {
  intro: 'MQ-2 modülünü A3’e, durum LED’ini D12’ye, alarm LED’ini D13’e bağla. Program önce ısınsın, sonra temiz havada (Gaz düzeyi 0) baz değeri ölçsün; gaz düzeyi bazın 1,5 katını geçince alarm versin. Dersteki “mq2_bagil_alarm” programını Kopyala ile alabilirsin.',
  starter: () => ({ circuit: unoOnly(), code: MQ2_CODE }),
  allowedParts: ['mq2', 'led', 'resistor'],
  goals: [
    {
      id: 'modul',
      text: 'MQ-2 modülünün VCC ucunu 5V’a, GND ucunu GND’ye, AO ucunu A3’e bağla.',
      hint: 'MQ-2 5V ister; 3V3’e bağlarsan modül beslenmemiş sayılır.',
      check: (ctx) => analogModuleOn(ctx, 'mq2', 'A3', false),
    },
    {
      id: 'ledler',
      text: 'D12’ye ve D13’e birer direnç üzerinden birer LED bağla (LED’lerin öbür ucu GND).',
      hint: 'Her LED için: pin → direnç (330 Ω) → LED A; LED K → GND. D12 durum, D13 alarm LED’i.',
      check: (ctx) => ledOnPin(ctx, 'D12') && ledOnPin(ctx, 'D13') && partsOf(ctx.circuit, 'led').length >= 2,
    },
    {
      id: 'isinma',
      text: 'Programı çalıştır: ısınırken D12’deki durum LED’i yanıp sönsün.',
      hint: 'ISINMA_MS dolana kadar while (millis() < ISINMA_MS) döngüsünde digitalWrite(DURUM_LED, (millis() / 250) % 2); yaz.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D12') >= 4,
    },
    {
      id: 'baz',
      text: 'Isınmadan sonra seri monitörde baz= ile baz değer görünsün.',
      hint: 'Isınmadan sonra 32 ölçümün ortalamasını al: toplam / 32.0. Gaz düzeyi 0 iken baz yaklaşık 102 çıkar.',
      behavior: true,
      check: ({ lab }) => /baz=\d+/.test(lab?.serial ?? ''),
    },
    {
      id: 'alarm-yanar',
      text: 'Gaz düzeyini artır (örneğin 0,3): D13’teki alarm LED’i yansın.',
      hint: 'MQ-2’yi seç, sağ panelde Gaz düzeyi’ni 0,3 yap. oran = ort / baz; oran 1,5’e ulaşınca alarm = true.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D13') >= 1,
    },
    {
      id: 'alarm-biter',
      text: 'Gaz düzeyini 0’a döndür: alarm LED’i sönsün.',
      hint: 'Alarm yalnız oran BIRAK_ORAN’ın altına inince biter. Gaz düzeyi’ni 0 yaptıktan sonra birkaç saniye bekle.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D13') >= 2 && pinLow(ctx, 'D13'),
    },
  ],
  solution: () => ({
    circuit: mq2Circuit(),
    code: `const int GAZ = A3;
const int DURUM_LED = 12;
const int ALARM_LED = 13;
const unsigned long ISINMA_MS = 5000;
const float ALARM_ORAN = 1.5;   // bazın 1,5 katı: alarm başlar
const float BIRAK_ORAN = 1.2;   // bazın 1,2 katının altı: alarm biter

float baz;
float ort;
bool alarm = false;
unsigned long sonOrnek = 0;
unsigned long sonYazma = 0;

float bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ);
    delay(20);
  }
  return toplam / 32.0;
}

void setup() {
  pinMode(DURUM_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);
  Serial.begin(9600);

  while (millis() < ISINMA_MS) {
    digitalWrite(DURUM_LED, (millis() / 250) % 2);
  }
  digitalWrite(DURUM_LED, LOW);

  baz = bazOlc();
  if (baz < 20) baz = 20;   // çok küçük baz, oranı anlamsız büyütür
  ort = baz;
  Serial.print("baz=");
  Serial.println(baz, 0);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOrnek >= 50) {
    sonOrnek = simdi;
    ort = 0.8 * ort + 0.2 * analogRead(GAZ);
    float oran = ort / baz;

    if (!alarm && oran >= ALARM_ORAN) {
      alarm = true;
    } else if (alarm && oran < BIRAK_ORAN) {
      alarm = false;
    }
    digitalWrite(ALARM_LED, alarm);
  }

  if (simdi - sonYazma >= 500) {
    sonYazma = simdi;
    Serial.print("oran=");
    Serial.print(ort / baz, 2);
    Serial.print(" alarm=");
    Serial.println(alarm ? 1 : 0);
  }
}
`,
  }),
  scenario: (s) => {
    s.advance(6500)                          // ısınma + baz
    s.setProp('gaz', 'gas', 0.3); s.advance(1500)     // alarm
    s.setProp('gaz', 'gas', 0); s.advance(1500)       // temiz hava: alarm biter
  },
}

// ---------------------------------------------------------------- Ders 54: Alev sensörü ve çoklu eşik
const alevCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('alev', 'flame', 360, 40), part('gaz', 'mq2', 360, 120), part('bz', 'buzzer', 600, 40, { kind: 'active' }))
  w(c, ['alev', 'VCC'], ['uno', '5V']); w(c, ['alev', 'GND'], ['uno', 'GND']); w(c, ['alev', 'AO'], ['uno', 'A1'])
  w(c, ['gaz', 'VCC'], ['uno', '5V']); w(c, ['gaz', 'GND'], ['uno', 'GND']); w(c, ['gaz', 'AO'], ['uno', 'A3'])
  w(c, ['bz', '+'], ['uno', 'D8']); w(c, ['bz', '-'], ['uno', 'GND2'])
  addLed(c, 'sari', 'D12', 'yellow', 360, 240)
  addLed(c, 'kirmizi', 'D13', 'red', 360, 320)
  return c
}

const ALEV_CODE = `// Üç seviyeli (NORMAL, UYARI, TEHLIKE) alev ve gaz paneli.
const int ALEV = A1;
const int GAZ = A3;
const int LED_UYARI = 12;
const int LED_TEHLIKE = 13;
const int BUZZER = 8;
const bool ALEVDE_DUSER = true;   // alev arttıkça okuma düşüyor

enum Seviye { NORMAL, UYARI, TEHLIKE };

Seviye alevSeviye = NORMAL;
Seviye gazSeviye = NORMAL;
int gazBaz;

// 1) siddet(): ham okumayı "büyük = alev güçlü" biçimine çevir
// 2) seviyeBul(): şimdiki seviye + değer + dört eşik -> yeni seviye (tek fonksiyon, iki sensör)
// 3) enKotu(): iki seviyeden büyüğünü ver

void setup() {
  pinMode(LED_UYARI, OUTPUT);
  pinMode(LED_TEHLIKE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  // temiz havada gazBaz'ı ölç
}

void loop() {
  // alevi ve gazı oku, seviyelerini bul, genel = enKotu(...)
  // genel UYARI -> LED_UYARI; genel TEHLIKE -> LED_TEHLIKE ve BUZZER
}
`

const alevSeviye: LabActivity = {
  intro: 'Alev (A1) ve MQ-2 (A3) modüllerini, sarı LED’i (D12), kırmızı LED’i (D13) ve aktif buzzer’ı (D8) bağla. Her iki sensör için aynı seviyeBul fonksiyonunu kullan: NORMAL, UYARI, TEHLIKE. Dersteki “iki_kanal_seviye” programını Kopyala ile alabilirsin.',
  starter: () => ({ circuit: unoOnly(), code: ALEV_CODE }),
  allowedParts: ['flame', 'mq2', 'led', 'resistor', 'buzzer'],
  goals: [
    {
      id: 'alev-modulu',
      text: 'Alev modülünün VCC ucunu 5V’a, GND ucunu GND’ye, AO ucunu A1’e bağla.',
      hint: 'Alev modülünü "Parça ekle" menüsünden seç. DO ucu boş kalabilir.',
      check: (ctx) => analogModuleOn(ctx, 'flame', 'A1', true),
    },
    {
      id: 'gaz-modulu',
      text: 'MQ-2 modülünün VCC ucunu 5V’a, GND ucunu GND’ye, AO ucunu A3’e bağla.',
      hint: 'MQ-2 5V ister.',
      check: (ctx) => analogModuleOn(ctx, 'mq2', 'A3', false),
    },
    {
      id: 'ledler',
      text: 'D12’ye ve D13’e birer direnç üzerinden birer LED bağla (LED’lerin öbür ucu GND).',
      hint: 'D12 uyarı (sarı), D13 tehlike (kırmızı) LED’i. Rengi LED’in özellik panelinden seçebilirsin.',
      check: (ctx) => ledOnPin(ctx, 'D12') && ledOnPin(ctx, 'D13') && partsOf(ctx.circuit, 'led').length >= 2,
    },
    {
      id: 'buzzer',
      text: 'Aktif bir buzzer’ı D8 (+) ile GND (-) arasına bağla.',
      hint: 'Buzzer’ı seçip Tür’ünü Aktif yap. + ucu D8’e, - ucu GND’ye gider.',
      check: (ctx) => partsOf(ctx.circuit, 'buzzer').some((b) => b.props.kind === 'active' && toUno(ctx, b.id, '+', 'D8') && toGnd(ctx, b.id, '-')),
    },
    {
      id: 'uyari',
      text: 'Çalıştır: Alev şiddeti’ni 0,4 yap, sarı LED yansın; sonra 0’a döndür, sönsün.',
      hint: 'Alev şiddeti 0,4 iken şiddet yaklaşık 389’dur; UYARI eşiği 300. Seviye UYARI iken D12 HIGH olmalı.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D12') >= 2,
    },
    {
      id: 'tehlike',
      text: 'Alev şiddeti’ni 0,8 yap: kırmızı LED yansın ve buzzer ötsün; sonra söndür.',
      hint: 'Alev şiddeti 0,8 iken şiddet yaklaşık 777’dir; TEHLIKE eşiği 600. Seviye TEHLIKE iken D13 ve D8 HIGH olmalı.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D13') >= 2 && edges(ctx, 'D8') >= 2,
    },
    {
      id: 'normal',
      text: 'Alev ve gaz yokken (şiddet 0, Gaz düzeyi 0) iki LED ve buzzer da sönük olsun.',
      hint: 'Son durumda alev şiddetini 0 ve gaz düzeyini 0 yap; birkaç saniye bekle. Seviye NORMAL’e dönünce çıkışlar kapanmalı.',
      behavior: true,
      check: (ctx) => ctx.lab !== null && pinLow(ctx, 'D12') && pinLow(ctx, 'D13') && pinLow(ctx, 'D8') && edges(ctx, 'D12') >= 1,
    },
  ],
  solution: () => ({
    circuit: alevCircuit(),
    code: `const int ALEV = A1;
const int GAZ = A3;
const int LED_UYARI = 12;
const int LED_TEHLIKE = 13;
const int BUZZER = 8;
const bool ALEVDE_DUSER = true;

enum Seviye { NORMAL, UYARI, TEHLIKE };

Seviye alevSeviye = NORMAL;
Seviye gazSeviye = NORMAL;
int gazBaz;

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL";
}

Seviye enKotu(Seviye a, Seviye b) {
  return (a > b) ? a : b;
}

void gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {
  if (eski == yeni) return;
  Serial.print(ad);
  Serial.print(": ");
  Serial.print(seviyeAdi(yeni));
  Serial.print(" deger=");
  Serial.println(deger);
}

int bazOlc(int pin) {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(pin);
    delay(10);
  }
  return toplam / 16;
}

void setup() {
  pinMode(LED_UYARI, OUTPUT);
  pinMode(LED_TEHLIKE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  gazBaz = bazOlc(GAZ);
  Serial.print("gazBaz=");
  Serial.println(gazBaz);
}

void loop() {
  int a = siddet(analogRead(ALEV));
  int g = analogRead(GAZ);

  Seviye yeniAlev = seviyeBul(alevSeviye, a, 300, 250, 600, 500);
  Seviye yeniGaz = seviyeBul(gazSeviye, g,
                             gazBaz * 3 / 2, gazBaz * 5 / 4,
                             gazBaz * 5 / 2, gazBaz * 2);

  gecisYaz("ALEV", alevSeviye, yeniAlev, a);
  gecisYaz("GAZ", gazSeviye, yeniGaz, g);
  alevSeviye = yeniAlev;
  gazSeviye = yeniGaz;

  Seviye genel = enKotu(alevSeviye, gazSeviye);
  digitalWrite(LED_UYARI, genel == UYARI);
  digitalWrite(LED_TEHLIKE, genel == TEHLIKE);
  digitalWrite(BUZZER, genel == TEHLIKE);
}
`,
  }),
  scenario: (s) => {
    s.advance(600)                                              // gazBaz ölçümü
    s.setProp('alev', 'flame', 0.4); s.advance(500)             // UYARI
    s.setProp('alev', 'flame', 0.8); s.advance(500)             // TEHLIKE
    s.setProp('alev', 'flame', 0); s.advance(500)               // NORMAL
    s.setProp('gaz', 'gas', 0.3); s.advance(500)                // gaz TEHLIKE
    s.setProp('gaz', 'gas', 0); s.advance(500)                  // NORMAL
  },
}

// ---------------------------------------------------------------- Ders 55: Proje, yangın ve gaz alarm paneli
const panelCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('gaz', 'mq2', 360, 40), part('alev', 'flame', 360, 120),
    part('ntc', 'ntc', 360, 200, { tempC: 25 }), part('r10', 'resistor', 360, 280, { ohms: 10_000 }),
    part('bz', 'buzzer', 700, 40, { kind: 'active' }),
    part('k1', 'relay', 700, 120, { trigger: 'high' }), part('rf', 'resistor', 860, 120, { ohms: 330 }), part('fan', 'led', 980, 120, { color: 'blue' }),
    part('lcd', 'lcdI2c', 700, 280, { address: '0x27' }),
  )
  w(c, ['gaz', 'VCC'], ['uno', '5V']); w(c, ['gaz', 'GND'], ['uno', 'GND']); w(c, ['gaz', 'AO'], ['uno', 'A3'])
  w(c, ['alev', 'VCC'], ['uno', '5V']); w(c, ['alev', 'GND'], ['uno', 'GND']); w(c, ['alev', 'AO'], ['uno', 'A1'])
  w(c, ['uno', '5V'], ['r10', '1']); w(c, ['r10', '2'], ['uno', 'A2']); w(c, ['uno', 'A2'], ['ntc', '1']); w(c, ['ntc', '2'], ['uno', 'GND'])
  addLed(c, 'yesil', 'D11', 'green', 360, 400)
  addLed(c, 'sari', 'D12', 'yellow', 360, 480)
  addLed(c, 'kirmizi', 'D13', 'red', 360, 560)
  w(c, ['bz', '+'], ['uno', 'D8']); w(c, ['bz', '-'], ['uno', 'GND2'])
  w(c, ['k1', 'VCC'], ['uno', '5V']); w(c, ['k1', 'GND'], ['uno', 'GND2']); w(c, ['k1', 'IN'], ['uno', 'D7'])
  w(c, ['k1', 'COM'], ['uno', '5V']); w(c, ['k1', 'NO'], ['rf', '1']); w(c, ['rf', '2'], ['fan', 'A']); w(c, ['fan', 'K'], ['uno', 'GND3'])
  w(c, ['lcd', 'GND'], ['uno', 'GND']); w(c, ['lcd', 'VCC'], ['uno', '5V']); w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  return c
}

const PANEL_CODE = `// Yangın ve gaz alarm paneli: gaz, alev ve ısı; üç seviye; LED, buzzer, röle (fan) ve LCD.
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int ALEV_PIN = A1;
const int NTC_PIN = A2;
const int GAZ_PIN = A3;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;
const int BUZZER = 8;
const int ROLE = 7;

const bool ALEVDE_DUSER = true;
const bool ISI_VAR = true;
const unsigned long ISINMA_MS = 4000;     // ders için kısa; gerçekte çok daha uzun

enum Seviye { NORMAL, UYARI, TEHLIKE };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Seviye gaz = NORMAL;
Seviye alev = NORMAL;
Seviye isi = NORMAL;
Seviye genel = NORMAL;
int gazBaz = 100;

// seviyeBul(), enKotu(), sicaklikOku(), seviyeleriGuncelle(), ciktilariSur(), ekranYaz() yaz.
// setup(): pinler, LCD, ısınma (yeşil LED yanıp sönsün), gazBaz ölçümü.
// loop(): 100 ms'de bir seviyeleri güncelle, çıkışları sür, 250 ms'de bir ekranı yaz (delay yok).

void setup() {
  Serial.begin(9600);
}

void loop() {
}
`

const yanginPaneli: LabActivity = {
  intro: 'Proje: gaz (A3), alev (A1) ve ısı (A2) sensörlerini, üç LED’i (D11-D13), aktif buzzer’ı (D8), röle + fan LED’ini (D7) ve I2C LCD’yi bağla. Panel üç sensörün en kötü seviyesini gösterir. Dersteki “yangin_gaz_paneli” programını Kopyala ile alabilirsin; ısınma bitene kadar (yaklaşık 5 sn) Gaz düzeyi 0 kalsın.',
  starter: () => ({ circuit: unoOnly(), code: PANEL_CODE }),
  allowedParts: ['mq2', 'flame', 'ntc', 'resistor', 'led', 'buzzer', 'relay', 'lcdI2c'],
  goals: [
    {
      id: 'sensorler',
      text: 'MQ-2’yi (VCC 5V, GND, AO → A3) ve alev modülünü (VCC 5V, GND, AO → A1) bağla.',
      hint: 'İkisini de "Parça ekle" menüsünden seç. DO uçları boş kalabilir.',
      check: (ctx) => analogModuleOn(ctx, 'mq2', 'A3', false) && analogModuleOn(ctx, 'flame', 'A1', true),
    },
    {
      id: 'cikislar',
      text: 'D11, D12 ve D13’e birer dirençli LED, D8’e aktif bir buzzer bağla.',
      hint: 'Her LED: pin → direnç (330 Ω) → LED A; LED K → GND. Buzzer: Tür’ü Aktif; + ucu D8, - ucu GND.',
      check: (ctx) =>
        ledOnPin(ctx, 'D11') && ledOnPin(ctx, 'D12') && ledOnPin(ctx, 'D13') && partsOf(ctx.circuit, 'led').length >= 3 &&
        partsOf(ctx.circuit, 'buzzer').some((b) => b.props.kind === 'active' && toUno(ctx, b.id, '+', 'D8') && toGnd(ctx, b.id, '-')),
    },
    {
      id: 'fan',
      text: 'Röleyi bağla (VCC 5V, GND, IN → D7) ve fanı simgeleyen LED’i sür: COM → 5V; NO → direnç → LED A; LED K → GND.',
      hint: 'Röle kuru bir anahtardır: COM’a 5V ver, NO’dan bir dirençle LED’e git. LED’i dirençsiz bağlama.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'relay').some((k) =>
          to5V(ctx, k.id, 'VCC') && toGnd(ctx, k.id, 'GND') && toUno(ctx, k.id, 'IN', 'D7') && to5V(ctx, k.id, 'COM') &&
          partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin(k.id, 'NO'), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))),
    },
    {
      id: 'lcd',
      text: 'I2C LCD’yi bağla (VCC 5V, GND, SDA → A4, SCL → A5); kodda adres LCD’nin adresiyle aynı olsun.',
      hint: 'LCD’yi seç, sağ panelde I2C adresine bak (0x27 ya da 0x3F) ve LiquidCrystal_I2C lcd(0x27, 16, 2); içine aynısını yaz.',
      check: ({ circuit, analysis, code }) => {
        const m = noComments(code).match(/LiquidCrystal_I2C\s+\w+\s*\(\s*(0[xX][0-9a-fA-F]+)\s*,/)
        return !!m && partsOf(circuit, 'lcdI2c').some((l) =>
          Number(l.props.address ?? '0x27') === Number(m[1]) &&
          analysis.sameNet(pin(l.id, 'VCC'), pin('uno', '5V')) && UNO_GNDS.some((g) => analysis.sameNet(pin(l.id, 'GND'), pin('uno', g))) &&
          analysis.sameNet(pin(l.id, 'SDA'), pin('uno', 'A4')) && analysis.sameNet(pin(l.id, 'SCL'), pin('uno', 'A5')))
      },
    },
    {
      id: 'seviyeler',
      text: 'Çalıştır: gazı artır (UYARI), alevi artır (TEHLIKE), sonra ikisini de kapat. Sarı LED, kırmızı LED ve buzzer birer kez yanıp sönsün.',
      hint: 'Gaz düzeyi 0,1 → UYARI (D12). Alev şiddeti 0,8 → TEHLIKE (D13 ve D8). Sonra Alev şiddeti 0, Gaz düzeyi 0.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D12') >= 2 && edges(ctx, 'D13') >= 2 && edges(ctx, 'D8') >= 2,
    },
    {
      id: 'fan-calisti',
      text: 'Gaz algılanınca fan (röle, D7) çalışsın, gaz temizlenince dursun.',
      hint: 'Röle yalnız gaz seviyesine bağlıdır: digitalWrite(ROLE, gaz != NORMAL); Gaz düzeyi 0,1 yapıp sonra 0’a döndür.',
      behavior: true,
      check: (ctx) => edges(ctx, 'D7') >= 2 && pinLow(ctx, 'D7'),
    },
    {
      id: 'normal-donus',
      text: 'Her şey temizlenince yeşil LED yansın, diğerleri sönsün ve LCD’de bir durum yazısı olsun.',
      hint: 'Seviye NORMAL’e dönünce yalnız D11 HIGH olmalı. ekranYaz() ilk satıra "DURUM: ..." yazar.',
      behavior: true,
      check: (ctx) => pinHigh(ctx, 'D11') && pinLow(ctx, 'D12') && pinLow(ctx, 'D13') && lcdLines(ctx).some((l) => (l[0] ?? '').trim().length > 0),
    },
  ],
  solution: () => ({
    circuit: panelCircuit(),
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int ALEV_PIN = A1;
const int NTC_PIN = A2;
const int GAZ_PIN = A3;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;
const int BUZZER = 8;
const int ROLE = 7;

const bool ALEVDE_DUSER = true;
const bool ISI_VAR = true;
const unsigned long ISINMA_MS = 4000;     // ders için kısa; gerçekte çok daha uzun
const unsigned long OLCUM_ARALIGI = 100;  // ms
const unsigned long EKRAN_ARALIGI = 250;  // ms

enum Seviye { NORMAL, UYARI, TEHLIKE };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Seviye gaz = NORMAL;
Seviye alev = NORMAL;
Seviye isi = NORMAL;
Seviye genel = NORMAL;
int gazBaz = 100;
int gazDeger = 0;
int alevDeger = 0;
int isiDeger = 25;
unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;

int ortalama(int pin) {
  long toplam = 0;
  for (int i = 0; i < 4; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 4;
}

int alevSiddeti() {
  int ham = ortalama(ALEV_PIN);
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

int sicaklikOku() {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NTC_PIN);
  }
  float adc = toplam / 8.0;
  if (adc < 1.0) adc = 1.0;
  if (adc > 1022.0) adc = 1022.0;
  float direnc = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);
  return (int)(kelvin - 273.15 + 0.5);
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

Seviye enKotu(Seviye a, Seviye b) {
  return (a > b) ? a : b;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI  ";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL ";
}

char seviyeHarfi(Seviye s) {
  if (s == UYARI) return 'U';
  if (s == TEHLIKE) return 'T';
  return 'N';
}

void gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {
  if (eski == yeni) return;
  Serial.print(ad);
  Serial.print(": ");
  Serial.print(seviyeAdi(yeni));
  Serial.print(" deger=");
  Serial.println(deger);
}

void seviyeleriGuncelle() {
  gazDeger = ortalama(GAZ_PIN);
  alevDeger = alevSiddeti();

  Seviye yeniGaz = seviyeBul(gaz, gazDeger,
                             gazBaz * 3 / 2, gazBaz * 5 / 4,
                             gazBaz * 5 / 2, gazBaz * 2);
  Seviye yeniAlev = seviyeBul(alev, alevDeger, 300, 250, 600, 500);
  Seviye yeniIsi = isi;
  if (ISI_VAR) {
    isiDeger = sicaklikOku();
    yeniIsi = seviyeBul(isi, isiDeger, 45, 42, 60, 55);
  }

  gecisYaz("GAZ", gaz, yeniGaz, gazDeger);
  gecisYaz("ALEV", alev, yeniAlev, alevDeger);
  gecisYaz("ISI", isi, yeniIsi, isiDeger);
  gaz = yeniGaz;
  alev = yeniAlev;
  isi = yeniIsi;

  Seviye yeniGenel = enKotu(gaz, enKotu(alev, isi));
  if (yeniGenel != genel) {
    genel = yeniGenel;
    Serial.print("DURUM: ");
    Serial.println(seviyeAdi(genel));
  }
}

void ciktilariSur(unsigned long simdi) {
  digitalWrite(LED_YESIL, genel == NORMAL);
  digitalWrite(LED_SARI, genel == UYARI);
  digitalWrite(LED_KIRMIZI, genel == TEHLIKE);

  bool bip = false;
  if (genel == TEHLIKE) {
    bip = true;                          // sürekli
  } else if (genel == UYARI) {
    bip = (simdi % 1000) < 150;          // saniyede bir kısa bip
  }
  digitalWrite(BUZZER, bip);

  digitalWrite(ROLE, gaz != NORMAL);     // fan: gaz temizlenene kadar
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  lcd.print("DURUM: ");
  lcd.print(seviyeAdi(genel));
  lcd.print("  ");
  lcd.setCursor(0, 1);
  lcd.print("G:");
  lcd.print(seviyeHarfi(gaz));
  lcd.print(" A:");
  lcd.print(seviyeHarfi(alev));
  lcd.print(" I:");
  lcd.print(ISI_VAR ? seviyeHarfi(isi) : '-');
  lcd.print("     ");
}

void setup() {
  pinMode(LED_YESIL, OUTPUT);
  pinMode(LED_SARI, OUTPUT);
  pinMode(LED_KIRMIZI, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(ROLE, OUTPUT);
  digitalWrite(ROLE, LOW);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ISINMA...       ");
  lcd.setCursor(0, 1);
  lcd.print("Temiz havada kal");

  while (millis() < ISINMA_MS) {
    digitalWrite(LED_YESIL, (millis() / 250) % 2);   // yanıp söner
  }

  long toplam = 0;
  for (int i = 0; i < 32; i++) {
    toplam += analogRead(GAZ_PIN);
    delay(20);
  }
  gazBaz = toplam / 32;
  if (gazBaz < 20) gazBaz = 20;
  Serial.print("gazBaz=");
  Serial.println(gazBaz);

  seviyeleriGuncelle();
  ciktilariSur(millis());
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    seviyeleriGuncelle();
  }

  ciktilariSur(simdi);

  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranYaz();
  }
}
`,
  }),
  scenario: (s) => {
    s.advance(5500)                                             // ısınma (4 sn) + baz ölçümü
    s.setProp('gaz', 'gas', 0.1); s.advance(700)                // gaz UYARI, fan açık
    s.setProp('alev', 'flame', 0.8); s.advance(700)             // alev TEHLIKE
    s.setProp('alev', 'flame', 0); s.advance(700)               // yine gaz UYARI
    s.setProp('gaz', 'gas', 0); s.advance(1000)                 // NORMAL, fan kapanır
  },
}

export const m4h4Activities: Record<string, LabActivity> = {
  'sensorler-ve-projeler:4:1': isikHisterezis,
  'sensorler-ve-projeler:4:2': alkisAnahtari,
  'sensorler-ve-projeler:4:3': mq2Alarm,
  'sensorler-ve-projeler:4:4': alevSeviye,
  'sensorler-ve-projeler:4:5': yanginPaneli,
}

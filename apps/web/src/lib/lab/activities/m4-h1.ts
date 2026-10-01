import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 1 laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:1:<ders>" (ders 1 tabanlı konum: 36 -> 1 ... 40 -> 5). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** Uno pini ile parça ucu arasında yalnız dirençler üzerinden (ya da doğrudan) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor'])
const ledToGnd = (ctx: LabGoalCtx, ledId: string) => UNO_GNDS.some((g) => viaResistor(ctx, pin(ledId, 'K'), pin('uno', g)))

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))

/** HC-SR04 bağlantıları. */
const hcPower = (ctx: LabGoalCtx) => partsOf(ctx.circuit, 'hcsr04').some((h) => to5V(ctx, h.id, 'VCC') && toGnd(ctx, h.id, 'GND'))
const hcSignal = (ctx: LabGoalCtx) => partsOf(ctx.circuit, 'hcsr04').some((h) => toUno(ctx, h.id, 'TRIG', 'D9') && toUno(ctx, h.id, 'ECHO', 'D10'))
const hcWired = (ctx: LabGoalCtx) => hcPower(ctx) && hcSignal(ctx)
/** Çalışan benzetimde ilk HC-SR04'ün Mesafe özelliği (yoksa null). */
const hcDistance = (ctx: LabGoalCtx): number | null => {
  const h = partsOf(ctx.circuit, 'hcsr04')[0]
  return h ? (ctx.lab?.parts[h.id]?.hcsr04?.distanceCm ?? null) : null
}

/** Seri çıktıdaki tüm sayılar. */
const numbersIn = (s: string): number[] => (s.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
const serialOf = (ctx: LabGoalCtx) => ctx.lab?.serial ?? ''
const pinHigh = (ctx: LabGoalCtx, name: string) => ctx.lab?.pins[name]?.high === true
const lcdLines = (ctx: LabGoalCtx): string[] =>
  partsOf(ctx.circuit, 'lcdI2c').flatMap((p) => ctx.lab?.parts[p.id]?.lcd?.lines ?? [])

/** Bir sensörü kuran yardımcı (çözümler için). */
const addSensor = (c: Circuit, id = 'hc', x = 400, y = 60, distanceCm = 100) => {
  c.parts.push(part(id, 'hcsr04', x, y, { distanceCm }))
  w(c, [id, 'VCC'], ['uno', '5V']); w(c, [id, 'GND'], ['uno', 'GND'])
  w(c, [id, 'TRIG'], ['uno', 'D9']); w(c, [id, 'ECHO'], ['uno', 'D10'])
}

// ---------------------------------------------------------------- Ders 36: Ultrasonik prensip
const PRENSIP_CODE = `// Süre (us) -> mesafe (cm) hesabı.
const float SES_CM_US = 0.0343;   // 343 m/s = 0,0343 cm/us

void setup() {
  Serial.begin(9600);
  // 5830 us ve 23320 us için mesafeyi hesapla ve seri monitöre yaz
  // (gidiş + dönüş olduğu için ikiye bölmeyi unutma)
}

void loop() {
}
`

const prensip: LabActivity = {
  intro: 'HC-SR04’ü bağla (37. derste kullanacaksın). Programda ECHO süresini santimetreye çeviren formülü uygula: 5830 µs ve 23 320 µs kaç cm eder?',
  starter: () => ({ circuit: unoOnly(), code: PRENSIP_CODE }),
  allowedParts: ['hcsr04'],
  goals: [
    {
      id: 'sensor',
      text: 'Tuvale bir HC-SR04 ultrasonik sensör ekle.',
      hint: '"Parça ekle" menüsünden HC-SR04’ü seç.',
      check: ({ circuit }) => partsOf(circuit, 'hcsr04').length >= 1,
    },
    {
      id: 'guc',
      text: 'HC-SR04’ün VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme eksikse sensör cevap vermez.',
      check: hcPower,
    },
    {
      id: 'sinyal',
      text: 'TRIG ucunu D9’a, ECHO ucunu D10’a bağla.',
      hint: 'TRIG tetik (Uno’dan sensöre), ECHO yankı (sensörden Uno’ya) pinidir. Ters bağlama.',
      check: hcSignal,
    },
    {
      id: 'yuz-cm',
      text: 'Programı çalıştır: seri monitör, 5830 µs süreye karşılık gelen mesafeyi (yaklaşık 100 cm) yazsın.',
      hint: 'mesafe = süre × 0,0343 / 2. Önce float tanımla: float cm = 5830 * SES_CM_US / 2.0; sonra Serial.println(cm);',
      behavior: true,
      check: (ctx) => numbersIn(serialOf(ctx)).some((n) => n >= 99 && n <= 101),
    },
    {
      id: 'dort-yuz-cm',
      text: 'Seri monitör, 23 320 µs süreye karşılık gelen mesafeyi (yaklaşık 400 cm) da yazsın.',
      hint: 'Aynı formülü 23320 için de kullan. 400 cm sensörün en uzak sınırıdır.',
      behavior: true,
      check: (ctx) => numbersIn(serialOf(ctx)).some((n) => n >= 398 && n <= 402),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    addSensor(circuit)
    return {
      circuit,
      code: `const float SES_CM_US = 0.0343;   // 343 m/s = 0,0343 cm/us
unsigned long sureler[] = {583, 5830, 23320};   // mikrosaniye

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    float cm = sureler[i] * SES_CM_US / 2.0;    // gidiş + dönüş: ikiye böl
    Serial.print("sure=");
    Serial.print(sureler[i]);
    Serial.print(" us -> ");
    Serial.print(cm, 1);
    Serial.println(" cm");
  }
}

void loop() {
}
`,
    }
  },
  scenario: (s) => s.advance(1000),
}

// ---------------------------------------------------------------- Ders 37: pulseIn, trig/echo
const PULSEIN_CODE = `const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;

void setup() {
  // TRIG çıkış, ECHO giriş, LED çıkış; Serial.begin(9600)
}

void loop() {
  // 1) tetik darbesi: TRIG 2 us LOW, 10 us HIGH, sonra tekrar LOW
  // 2) pulseIn ile ECHO’nun HIGH kalma süresini ölç (30000 us zaman aşımı koy)
  // 3) süre 0 değilse santimetreye çevir ve seri monitöre yaz
  // 4) mesafe 30 cm’den azsa LED yansın, değilse sönsün
  delay(100);
}
`

const pulseinEtkinlik: LabActivity = {
  intro: 'HC-SR04 ve bir LED kur. TRIG’e 10 µs’lik darbe ver, ECHO süresini pulseIn ile ölç, santimetreye çevir. 30 cm’den yakınsa LED yansın. Sensörü seçip Mesafe değerini değiştirerek dene.',
  starter: () => ({ circuit: unoOnly(), code: PULSEIN_CODE }),
  allowedParts: ['hcsr04', 'led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir HC-SR04, bir LED ve bir direnç ekle.',
      hint: '"Parça ekle" menüsünden HC-SR04’ü, LED’i ve direnci seç.',
      check: ({ circuit }) => partsOf(circuit, 'hcsr04').length >= 1 && partsOf(circuit, 'led').length >= 1 && partsOf(circuit, 'resistor').length >= 1,
    },
    {
      id: 'sensor-baglanti',
      text: 'HC-SR04’ü bağla: VCC 5V, GND GND, TRIG D9, ECHO D10.',
      hint: 'TRIG ve ECHO’yu karıştırma; ikisi de doğrudan Uno pinlerine gitmeli.',
      check: hcWired,
    },
    {
      id: 'led-baglanti',
      text: 'LED’i D13’e bir direnç üzerinden bağla; katot GND’ye gitsin.',
      hint: 'D13 → direnç → LED A; LED K → GND.',
      check: (ctx) => partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', 'D13'), pin(l.id, 'A')) && ledToGnd(ctx, l.id)),
    },
    {
      id: 'zaman-asimi',
      text: 'pulseIn’e bir zaman aşımı ver (üçüncü parametre).',
      hint: 'pulseIn(ECHO, HIGH, 30000); Zaman aşımı olmazsa yankı gelmediğinde program 1 saniye takılır.',
      check: ({ code }) => /pulseIn\s*\(\s*[\w]+\s*,\s*HIGH\s*,\s*[^)]+\)/.test(noComments(code)),
    },
    {
      id: 'mesafe-yazdir',
      text: 'Programı çalıştır: seri monitör sensörün Mesafe değerine yakın bir santimetre değeri yazsın.',
      hint: 'cm = süre * 0.0343 / 2.0; Önce TRIG darbesini ver, sonra pulseIn. Mesafe 100 cm iken yaklaşık 100 yazmalı.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        return d !== null && numbersIn(serialOf(ctx)).some((n) => Math.abs(n - d) <= Math.max(2, d * 0.03))
      },
    },
    {
      id: 'led-yakin',
      text: 'Mesafeyi 30 cm’nin altına indir: LED yansın. Sonra 30 cm’nin üstüne çıkar: LED sönsün.',
      hint: 'Sensörü seç, sağ panelde Mesafe’yi değiştir. LED’i digitalWrite(LED, cm >= 0 && cm < 30) gibi bir koşula bağla; yankı olmayan ölçümü (0) mesafe sayma.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        return d !== null && d >= 30 && partsOf(ctx.circuit, 'led').some((l) => (ctx.stats.ledToggles[l.id] ?? 0) >= 2 && ctx.lab?.parts[l.id]?.led?.on === false)
      },
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    addSensor(circuit)
    circuit.parts.push(part('r1', 'resistor', 400, 220, { ohms: 330 }), part('led1', 'led', 540, 220, { color: 'red' }))
    w(circuit, ['uno', 'D13'], ['r1', '1']); w(circuit, ['r1', '2'], ['led1', 'A']); w(circuit, ['led1', 'K'], ['uno', 'GND2'])
    return {
      circuit,
      code: `const int TRIG = 9;
const int ECHO = 10;
const int LED = 13;

float mesafeOku() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);       // 10 us'lik tetik darbesi
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return -1;       // yansıma yok
  return sure * 0.0343 / 2.0;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float cm = mesafeOku();
  digitalWrite(LED, cm >= 0 && cm < 30);
  Serial.println(cm);
  delay(100);
}
`,
    }
  },
  scenario: (s) => {
    s.advance(600)
    s.setProp('hc', 'distanceCm', 20)
    s.advance(600)
    s.setProp('hc', 'distanceCm', 100)
    s.advance(600)
  },
}

// ---------------------------------------------------------------- Ders 38: medyan filtre
const MEDYAN_CODE = `const int TRIG = 9;
const int ECHO = 10;
const int N = 5;                      // pencere boyu (tek sayı)
const float MENZIL = 400.0;           // yankı yoksa "uzak" say

float pencere[N];
int sira = 0;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float ortalama(float a[], int n) {
  float toplam = 0;
  for (int i = 0; i < n; i++) toplam += a[i];
  return toplam / n;
}

float medyan(float a[], int n) {
  // 1) a[] dizisini b[] dizisine kopyala (asıl pencerenin sırası bozulmasın)
  // 2) b[] dizisini küçükten büyüğe sırala
  // 3) ortadaki elemanı (b[n / 2]) döndür
  return 0;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  float ilk = tekOlcum();
  for (int i = 0; i < N; i++) pencere[i] = ilk;
}

void loop() {
  float ham = tekOlcum();
  pencere[sira] = ham;
  sira = (sira + 1) % N;

  Serial.print("ham=");
  Serial.print(ham, 1);
  Serial.print(" ort=");
  Serial.print(ortalama(pencere, N), 1);
  Serial.print(" med=");
  Serial.println(medyan(pencere, N), 1);
  delay(250);   // yavaş ölçüm: kaydırıcıyla kısa bir sıçrama üretmek kolay olsun
}
`

const MEDYAN_SOL = MEDYAN_CODE.replace(
  /float medyan\(float a\[\], int n\) \{[\s\S]*?\n\}\n/,
  `float medyan(float a[], int n) {
  float b[N];
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];
}
`)

/** "ham=… ort=… med=…" satırlarını ayrıştırır. */
const filtreSatirlari = (s: string) =>
  [...s.matchAll(/ham=([\d.]+)\s+ort=([\d.]+)\s+med=([\d.]+)/g)].map((m) => ({ ham: Number(m[1]), ort: Number(m[2]), med: Number(m[3]) }))

const medyanEtkinlik: LabActivity = {
  intro: 'Kayan pencereli ortalama ve medyan hazır; medyan() fonksiyonunu sen yaz. Sonra Mesafe değerini kısa süre 350 cm yapıp geri al: ortalama bozulurken medyan bozulmasın. Ölçüm 250 ms’de bir yapılır, böylece kısa sıçrama üretmek kolaydır.',
  starter: () => ({ circuit: unoOnly(), code: MEDYAN_CODE }),
  allowedParts: ['hcsr04'],
  goals: [
    {
      id: 'sensor-baglanti',
      text: 'HC-SR04’ü bağla: VCC 5V, GND GND, TRIG D9, ECHO D10.',
      hint: '"Parça ekle" menüsünden HC-SR04’ü seç. Hafta boyunca aynı bağlantıyı kullanıyoruz.',
      check: hcWired,
    },
    {
      id: 'medyan-calisir',
      text: 'Programı çalıştır: sensör kararlıyken medyan (med) Mesafe değerini yazsın.',
      hint: 'medyan() içinde diziyi kopyala, sırala ve b[n / 2] değerini döndür. Starter 0 döndürüyor.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        return d !== null && filtreSatirlari(serialOf(ctx)).some((l) => Math.abs(l.med - d) <= 3)
      },
    },
    {
      id: 'sicrama',
      text: 'Mesafeyi kısa süre 350 cm yapıp geri al: ortalama sıçramadan etkilensin (ort − med en az 30) ama medyan yerinde kalsın.',
      hint: 'Sıçrama yarım saniyeden uzun sürerse pencereye 3 yanlış değer girer ve medyan da yanılır. Kaydırıcıyı ya da değeri hızlıca 350 yapıp geri al.',
      behavior: true,
      check: (ctx) => filtreSatirlari(serialOf(ctx)).some((l) => l.med > 50 && l.ort - l.med >= 30),
    },
    {
      id: 'gercek-adim',
      text: 'Mesafeyi kalıcı olarak 50 cm’ye indir (70 cm ya da altı): birkaç ölçüm sonra medyan da yeni mesafeyi göstersin.',
      hint: 'Medyan hemen değişmez: pencerede 3 tane yeni değer birikmesi gerekir (yaklaşık 3 ölçüm). Biraz bekle.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        const son = filtreSatirlari(serialOf(ctx)).at(-1)
        return d !== null && d <= 70 && !!son && Math.abs(son.med - d) <= 5
      },
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    addSensor(circuit)
    return { circuit, code: MEDYAN_SOL }
  },
  scenario: (s) => {
    s.advance(1500)
    s.setProp('hc', 'distanceCm', 350)
    s.advance(260)
    s.setProp('hc', 'distanceCm', 100)
    s.advance(1600)
    s.setProp('hc', 'distanceCm', 50)
    s.advance(2200)
  },
}

// ---------------------------------------------------------------- Ders 39: servo ile sonar tarama
const SONAR_CODE = `#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int ADIM = 30;                  // derece
const float MENZIL = 400.0;           // yankı yok: uzak say

Servo servo;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

// Üç sayının ortancası
float medyan3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

float olc() {
  float a = tekOlcum(); delay(30);
  float b = tekOlcum(); delay(30);
  float c = tekOlcum();
  return medyan3(a, b, c);
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  servo.attach(SERVO_PIN);
  Serial.begin(9600);
  servo.write(0);
  delay(600);                         // başlangıç konumuna git
}

void loop() {
  float enYakin = MENZIL;
  int enYakinAci = -1;

  // Burayı sen yaz: açıyı 0'dan 180'e ADIM adım artır.
  // Her açıda: servo.write(aci); delay(300); cm = olc();
  // "aci:cm" biçiminde yaz (örnek 120:35.0), en küçük mesafeyi ve açısını sakla.

  // Tarama bitince: "EN YAKIN: 120 derece, 35.0 cm" yaz (nesne yoksa "EN YAKIN: nesne yok").
  servo.write(0);                     // başa dön
  delay(800);
}
`

const SONAR_SOL = SONAR_CODE.replace(
  /  \/\/ Burayı sen yaz[\s\S]*?\(nesne yoksa "EN YAKIN: nesne yok"\)\.\n/,
  `  for (int aci = 0; aci <= 180; aci += ADIM) {
    servo.write(aci);
    delay(300);                       // servo varsın
    float cm = olc();
    Serial.print(aci);
    Serial.print(":");
    Serial.println(cm, 1);
    if (cm < enYakin) {
      enYakin = cm;
      enYakinAci = aci;
    }
  }

  if (enYakinAci < 0) {
    Serial.println("EN YAKIN: nesne yok");
  } else {
    Serial.print("EN YAKIN: ");
    Serial.print(enYakinAci);
    Serial.print(" derece, ");
    Serial.print(enYakin, 1);
    Serial.println(" cm");
  }
`)

/** "açı:mesafe" satırları. */
const taramaSatirlari = (s: string) =>
  [...s.matchAll(/^(\d+):(\d+(?:\.\d+)?)\s*$/gm)].map((m) => ({ aci: Number(m[1]), cm: Number(m[2]) }))

const sonar: LabActivity = {
  intro: 'Servoyu 0°’den 180°’ye 30° adımlarla döndür, her açıda mesafeyi ölç ve "açı:mesafe" yaz. Laboratuvarda sensör servoyla birlikte dönmez: farklı yönlerde nesne olduğunu taklit etmek için tarama sürerken Mesafe değerini bir açıda küçült.',
  starter: () => ({ circuit: unoOnly(), code: SONAR_CODE }),
  allowedParts: ['hcsr04', 'servo'],
  goals: [
    {
      id: 'sensor-baglanti',
      text: 'HC-SR04’ü bağla: VCC 5V, GND GND, TRIG D9, ECHO D10.',
      hint: '"Parça ekle" menüsünden HC-SR04’ü seç.',
      check: hcWired,
    },
    {
      id: 'servo-baglanti',
      text: 'Servoyu bağla: SIG D6, VCC 5V, GND GND.',
      hint: 'Servo besleme almazsa hareket etmez ve "beslenmemiş" uyarısı çıkar. Kodda SERVO_PIN = 6.',
      check: (ctx) => partsOf(ctx.circuit, 'servo').some((s) => toUno(ctx, s.id, 'SIG', 'D6') && to5V(ctx, s.id, 'VCC') && toGnd(ctx, s.id, 'GND')),
    },
    {
      id: 'tarama',
      text: 'Programı çalıştır: seri monitör 0°’den 180°’ye "açı:mesafe" satırları (örnek 120:35.0) yazsın.',
      hint: 'for (int aci = 0; aci <= 180; aci += ADIM) döngüsünde servo.write(aci); delay(300); olc(); Serial.print(aci); Serial.print(":"); Serial.println(cm, 1);',
      behavior: true,
      check: (ctx) => {
        const aci = new Set(taramaSatirlari(serialOf(ctx)).map((l) => l.aci))
        return aci.has(0) && aci.has(180) && aci.size >= 5
      },
    },
    {
      id: 'en-yakin',
      text: 'Tarama sürerken Mesafe’yi bir açıda küçült (örnek 35 cm); program o açıyı "EN YAKIN: açı derece, mesafe cm" satırında bildirsin.',
      hint: 'En küçük mesafeyi ve açısını sakla: if (cm < enYakin) { enYakin = cm; enYakinAci = aci; }. Tarama bitince yaz. Mesafe’yi servo o açıdayken değiştir, sonra eski değere getir.',
      behavior: true,
      check: (ctx) => {
        const s = serialOf(ctx)
        const satirlar = taramaSatirlari(s)
        const en = [...s.matchAll(/EN YAKIN:?\s*(\d+)\D+?(\d+(?:\.\d+)?)/gi)].map((m) => ({ aci: Number(m[1]), cm: Number(m[2]) }))
        if (!satirlar.length) return false
        const enBuyuk = Math.max(...satirlar.map((l) => l.cm))
        return en.some((e) => e.cm < enBuyuk - 5 && satirlar.some((l) => l.aci === e.aci && Math.abs(l.cm - e.cm) <= 0.3))
      },
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    addSensor(circuit, 'hc', 400, 60, 200)
    circuit.parts.push(part('sv', 'servo', 400, 260))
    w(circuit, ['sv', 'SIG'], ['uno', 'D6']); w(circuit, ['sv', 'VCC'], ['uno', '5V']); w(circuit, ['sv', 'GND'], ['uno', 'GND2'])
    return { circuit, code: SONAR_SOL }
  },
  // Servo yaklaşık 2,3 sn sonra 120° civarına gelir; nesneyi orada (ve komşu açılarda) 35 cm yap, sonra uzaklaştır.
  scenario: (s) => {
    s.advance(1800)
    s.setProp('hc', 'distanceCm', 35)
    s.advance(1000)
    s.setProp('hc', 'distanceCm', 200)
    s.advance(2600)
  },
}

// ---------------------------------------------------------------- Ders 40: Park sensörü
const PARK_HEAD = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int TRIG = 9;
const int ECHO = 10;
const int BUZZER = 8;
const int LED_YESIL = 11;
const int LED_SARI = 12;
const int LED_KIRMIZI = 13;

const float MENZIL = 400.0;               // yankı yok: uzak say
const float BIP_BASLANGIC = 100.0;        // bundan yakında bip başlar
const float SARI_MESAFE = 50.0;           // bundan yakında sarı
const float DUR_MESAFE = 20.0;            // bundan yakında sürekli ses
const unsigned long OLCUM_ARALIGI = 60;   // ms
const unsigned long EKRAN_ARALIGI = 250;  // ms
const unsigned long BIP_SURESI = 40;      // ms
const int N = 5;

LiquidCrystal_I2C lcd(0x27, 16, 2);

float pencere[N];
int sira = 0;
float mesafe = MENZIL;                    // filtreli mesafe

unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;
unsigned long bipBasla = 0;
bool bipAcik = false;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float medyan(float a[], int n) {
  float b[N];
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];
}
`

const PARK_TAIL = `
void ekranGuncelle() {
  char sayi[8];
  lcd.setCursor(0, 0);
  lcd.print("Mesafe:");
  if (mesafe >= MENZIL) {
    lcd.print("   ---");
  } else {
    dtostrf(mesafe, 6, 1, sayi);          // 6 karakter genişlikte, 1 ondalık
    lcd.print(sayi);
  }
  lcd.print(" cm");                       // toplam tam 16 karakter

  lcd.setCursor(0, 1);
  if (mesafe < DUR_MESAFE) lcd.print("DUR!            ");
  else if (mesafe < SARI_MESAFE) lcd.print("YAKLASIYOR      ");
  else lcd.print("GUVENLI         ");
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_YESIL, OUTPUT);
  pinMode(LED_SARI, OUTPUT);
  pinMode(LED_KIRMIZI, OUTPUT);
  digitalWrite(BUZZER, LOW);

  lcd.init();
  lcd.backlight();

  float ilk = tekOlcum();
  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur
  mesafe = ilk;
  ledGuncelle();
  ekranGuncelle();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    pencere[sira] = tekOlcum();
    sira = (sira + 1) % N;
    mesafe = medyan(pencere, N);
    ledGuncelle();
  }

  buzzerGuncelle(simdi);                  // her turda: bip zamanlaması hassas

  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranGuncelle();
  }
}
`

const PARK_STARTER = `${PARK_HEAD}
void ledGuncelle() {
  // yeşil: mesafe >= SARI_MESAFE
  // sarı: DUR_MESAFE <= mesafe < SARI_MESAFE
  // kırmızı: mesafe < DUR_MESAFE
}

void buzzerGuncelle(unsigned long simdi) {
  // mesafe >= BIP_BASLANGIC: sessiz
  // mesafe < DUR_MESAFE: sürekli ses (pin HIGH)
  // arası: aralık = map((long)mesafe, 20, 100, 100, 800) ms; her bip BIP_SURESI ms sürsün
}
${PARK_TAIL}`

const PARK_SOL = `${PARK_HEAD}
void ledGuncelle() {
  digitalWrite(LED_YESIL, mesafe >= SARI_MESAFE);
  digitalWrite(LED_SARI, mesafe >= DUR_MESAFE && mesafe < SARI_MESAFE);
  digitalWrite(LED_KIRMIZI, mesafe < DUR_MESAFE);
}

void buzzerGuncelle(unsigned long simdi) {
  if (mesafe >= BIP_BASLANGIC) {          // uzak: sessiz
    digitalWrite(BUZZER, LOW);
    bipAcik = false;
    return;
  }
  if (mesafe < DUR_MESAFE) {              // çok yakın: sürekli ses
    digitalWrite(BUZZER, HIGH);
    bipAcik = true;
    return;
  }
  // 20-100 cm arası: bip aralığı 100-800 ms
  unsigned long aralik = map((long)mesafe, 20, 100, 100, 800);
  if (bipAcik) {
    if (simdi - bipBasla >= BIP_SURESI) {
      digitalWrite(BUZZER, LOW);
      bipAcik = false;
    }
  } else if (simdi - bipBasla >= aralik) {
    digitalWrite(BUZZER, HIGH);
    bipAcik = true;
    bipBasla = simdi;
  }
}
${PARK_TAIL}`

const parkCircuit = (): Circuit => {
  const c = unoOnly()
  addSensor(c, 'hc', 400, 40, 150)
  c.parts.push(part('bz', 'buzzer', 400, 180, { kind: 'active' }))
  w(c, ['bz', '+'], ['uno', 'D8']); w(c, ['bz', '-'], ['uno', 'GND2'])
  const leds: [string, string, string][] = [['D11', 'green', 'g'], ['D12', 'yellow', 'y'], ['D13', 'red', 'r']]
  leds.forEach(([d, color, k], i) => {
    c.parts.push(part(`r${k}`, 'resistor', 400, 280 + i * 70, { ohms: 330 }), part(`l${k}`, 'led', 540, 280 + i * 70, { color }))
    w(c, ['uno', d], [`r${k}`, '1']); w(c, [`r${k}`, '2'], [`l${k}`, 'A']); w(c, [`l${k}`, 'K'], ['uno', 'GND3'])
  })
  c.parts.push(part('lcd', 'lcdI2c', 640, 60, { address: '0x27' }))
  w(c, ['lcd', 'VCC'], ['uno', '5V']); w(c, ['lcd', 'GND'], ['uno', 'GND']); w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  return c
}

const park: LabActivity = {
  intro: 'Park sensörü: HC-SR04, üç LED (D11 yeşil, D12 sarı, D13 kırmızı), aktif buzzer (D8) ve I2C LCD. ledGuncelle() ve buzzerGuncelle() fonksiyonlarını yaz, sonra Mesafe değerini 150 cm’den 15 cm’ye doğru değiştirerek sına. LCD ilk yazıyı yaklaşık 1,5 saniye sonra gösterir.',
  starter: () => ({ circuit: unoOnly(), code: PARK_STARTER }),
  allowedParts: ['hcsr04', 'buzzer', 'led', 'resistor', 'lcdI2c'],
  goals: [
    {
      id: 'sensor',
      text: 'HC-SR04’ü bağla: VCC 5V, GND GND, TRIG D9, ECHO D10.',
      hint: '"Parça ekle" menüsünden HC-SR04’ü seç.',
      check: hcWired,
    },
    {
      id: 'lcd',
      text: 'I2C LCD’yi bağla: VCC 5V, GND GND, SDA A4, SCL A5.',
      hint: 'LCD’nin I2C adresi 0x27 olmalı (özellik panelinde görünür); kodda da 0x27 yazıyor.',
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => to5V(ctx, l.id, 'VCC') && toGnd(ctx, l.id, 'GND') && toUno(ctx, l.id, 'SDA', 'A4') && toUno(ctx, l.id, 'SCL', 'A5')),
    },
    {
      id: 'cikislar',
      text: 'Çıkışları kur: aktif buzzer D8’e (- ucu GND’ye); yeşil, sarı, kırmızı LED sırayla D11, D12, D13’e birer dirençle.',
      hint: 'Buzzer’ın Tür özelliğini Aktif yap. Her LED: Uno pini → direnç → LED A; LED K → GND.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'buzzer').some((b) => b.props.kind === 'active' && toUno(ctx, b.id, '+', 'D8') && toGnd(ctx, b.id, '-')) &&
        ['D11', 'D12', 'D13'].every((d) => partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', d), pin(l.id, 'A')) && ledToGnd(ctx, l.id))),
    },
    {
      id: 'renk-uyumu',
      text: 'LED’ler mesafeye uysun: 50 cm ve üstü yalnız yeşil, 20-50 cm yalnız sarı, 20 cm’nin altı yalnız kırmızı yansın.',
      hint: 'ledGuncelle() içinde: yeşil mesafe >= SARI_MESAFE; sarı mesafe >= DUR_MESAFE && mesafe < SARI_MESAFE; kırmızı mesafe < DUR_MESAFE. Mesafe değerini değiştirip birkaç ölçüm bekle.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        if (d === null) return false
        const [g, y, r] = [pinHigh(ctx, 'D11'), pinHigh(ctx, 'D12'), pinHigh(ctx, 'D13')]
        if (d >= 50) return g && !y && !r
        if (d >= 20) return y && !g && !r
        return r && !g && !y
      },
    },
    {
      id: 'uc-renk',
      text: 'Mesafeyi 150 cm’den 15 cm’ye doğru azalt: üç renk de sırayla en az bir kez yansın.',
      hint: 'Sensörü seç, Mesafe değerini örneğin 150, 30, 15 yap; her değerde birkaç ölçüm bekle.',
      behavior: true,
      check: (ctx) =>
        ['D11', 'D12', 'D13'].every((d) =>
          partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', d), pin(l.id, 'A')) && (ctx.stats.ledToggles[l.id] ?? 0) >= 1)),
    },
    {
      id: 'buzzer',
      text: 'Buzzer önce aralıklı bip bip ötsün; mesafe 20 cm’nin altına inince sürekli öt.',
      hint: '20-100 cm arası millis() ile aç-kapat (aralık map((long)mesafe, 20, 100, 100, 800), bip 40 ms); mesafe < DUR_MESAFE ise pini HIGH tut. Mesafeyi 100’den 15’e doğru indir.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        return d !== null && d < 20 && pinHigh(ctx, 'D8') && (ctx.stats.pinEdges['D8'] ?? 0) >= 4
      },
    },
    {
      id: 'lcd-mesafe',
      text: 'LCD’de sensörün Mesafe değeri görünsün.',
      hint: 'Starter’daki ekranGuncelle() mesafeyi yazar; LCD ve I2C bağlantısını kontrol et. İlk yazı ▶’ten yaklaşık 1,5 saniye sonra çıkar.',
      behavior: true,
      check: (ctx) => {
        const d = hcDistance(ctx)
        return d !== null && d < 400 && numbersIn(lcdLines(ctx).join(' ')).some((n) => Math.abs(n - d) <= Math.max(2, d * 0.03))
      },
    },
  ],
  solution: () => ({ circuit: parkCircuit(), code: PARK_SOL }),
  scenario: (s) => {
    s.advance(2200)
    s.setProp('hc', 'distanceCm', 60)
    s.advance(1500)
    s.setProp('hc', 'distanceCm', 30)
    s.advance(1500)
    s.setProp('hc', 'distanceCm', 15)
    s.advance(1200)
  },
}

export const m4h1Activities: Record<string, LabActivity> = {
  'sensorler-ve-projeler:1:1': prensip,
  'sensorler-ve-projeler:1:2': pulseinEtkinlik,
  'sensorler-ve-projeler:1:3': medyanEtkinlik,
  'sensorler-ve-projeler:1:4': sonar,
  'sensorler-ve-projeler:1:5': park,
}

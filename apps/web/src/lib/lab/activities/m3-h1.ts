import type { LabActivity } from '../activity'
import type { Circuit, CircuitAnalysis } from '../contract'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Yorum satırlarını atar (kod hedeflerinde yorumdaki sözcükler sayılmasın). */
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

/** Ders 1: dahili L LED'i (D13) yanıp söndür. Devre kurma yok. */
const DAHILI_CODE = `// Kartın üzerindeki dahili L LED'i yanıp söndür.
void setup() {
  // dahili LED'in bağlı olduğu pini çıkış yap
}

void loop() {
  // yak, bekle, söndür, bekle
}
`

const mikrodenetleyici: LabActivity = {
  intro: 'Uno’nun üzerindeki dahili L LED, D13 pinine bağlıdır. Devre kurmadan, yalnız kod yazarak onu yanıp söndür.',
  starter: () => ({ circuit: unoOnly(), code: DAHILI_CODE }),
  allowedParts: [],
  goals: [
    {
      id: 'pin-modu',
      text: 'D13 pinini çıkış yap.',
      hint: 'setup() içine pinMode(13, OUTPUT); yaz.',
      check: ({ code }) => /pinMode\s*\(\s*(13|LED_BUILTIN)\s*,\s*OUTPUT\s*\)/.test(stripComments(code)),
    },
    {
      id: 'yaz',
      text: 'loop() içinde D13’e HIGH ve LOW ver.',
      hint: 'digitalWrite(13, HIGH); ... digitalWrite(13, LOW); satırlarını delay ile araya bölerek yaz.',
      check: ({ code }) => {
        const c = stripComments(code)
        return /digitalWrite\s*\(\s*(13|LED_BUILTIN)\s*,\s*HIGH\s*\)/.test(c) && /digitalWrite\s*\(\s*(13|LED_BUILTIN)\s*,\s*LOW\s*\)/.test(c)
      },
    },
    {
      id: 'yanip-sonuyor',
      text: 'Programı çalıştır: dahili LED yanıp sönsün.',
      hint: '“Derle ve çalıştır”a bas; D13 en az 3 kez değişince tamamlanır. Bekleme süresi çok uzunsa kısalt.',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D13'] ?? 0) >= 3,
    },
  ],
  solution: () => ({
    circuit: unoOnly(),
    code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`,
  }),
  scenario: (s) => s.advance(3000),
}

/** Üç/dört LED'li devre kurucu: her LED bir direnç üzerinden verilen pine, katot GND'ye. */
function ledRow(pins: number[], colors: string[]): Circuit {
  const circuit = unoOnly()
  pins.forEach((d, i) => {
    const r = `r${i + 1}`, l = `led${i + 1}`
    const y = 40 + i * 70
    circuit.parts.push(part(r, 'resistor', 360, y, { ohms: 330 }), part(l, 'led', 480, y, { color: colors[i] }))
    circuit.wires.push(wire(pin('uno', `D${d}`), pin(r, '1')), wire(pin(r, '2'), pin(l, 'A')), wire(pin(l, 'K'), pin('uno', 'GND')))
  })
  return circuit
}

/** Her istenen pin, bir direnç üzerinden bir LED'in anoduna bağlı mı (doğrudan değil). */
const pinsThroughResistor = (pins: number[]) => ({ circuit, analysis }: { circuit: Circuit; analysis: CircuitAnalysis }) =>
  pins.every((d) =>
    partsOf(circuit, 'led').some((l) => analysis.connected(pin('uno', `D${d}`), pin(l.id, 'A'), ['resistor']) && !analysis.sameNet(pin('uno', `D${d}`), pin(l.id, 'A'))))

const ledsToGnd = ({ circuit, analysis }: { circuit: Circuit; analysis: CircuitAnalysis }) => {
  const leds = partsOf(circuit, 'led')
  return leds.length > 0 && leds.every((l) => UNO_GNDS.some((g) => analysis.sameNet(pin(l.id, 'K'), pin('uno', g))))
}

const BLINK_CODE = `// Burayı sen yaz: LED'i yakıp söndüren programı oluştur.
void setup() {
  // 13. pini çıkış yap
}

void loop() {
  // yak, bekle, söndür, bekle
}
`

/** Modül 3, hafta 1, ders 3: İlk program: Blink. Anahtar "arduino-temelleri:1:3". */
const blink: LabActivity = {
  intro: 'Laboratuvarda devreyi kur, programı yaz ve çalıştır: LED yanıp sönsün.',
  starter: () => ({ circuit: unoOnly(), code: BLINK_CODE }),
  allowedParts: ['led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir LED ve bir direnç ekle.',
      hint: '"Parça ekle" düğmesinden LED ve direnç seç.',
      check: ({ circuit }) => partsOf(circuit, 'led').length >= 1 && partsOf(circuit, 'resistor').length >= 1,
    },
    {
      id: 'd13-direnc-led',
      text: 'D13 pinini bir direnç üzerinden LED’in uzun bacağına (anot, A) bağla.',
      hint: 'D13 → direncin bir ucu, direncin öbür ucu → LED’in A ucu. D13’ü LED’e doğrudan bağlama.',
      check: ({ circuit, analysis }) =>
        partsOf(circuit, 'led').some((l) => analysis.connected(pin('uno', 'D13'), pin(l.id, 'A'), ['resistor']) && !analysis.sameNet(pin('uno', 'D13'), pin(l.id, 'A'))),
    },
    {
      id: 'katot-gnd',
      text: 'LED’in kısa bacağını (katot, K) GND’ye bağla.',
      hint: 'Uno’daki herhangi bir GND pini olur.',
      check: ({ circuit, analysis }) =>
        partsOf(circuit, 'led').some((l) => UNO_GNDS.some((g) => analysis.sameNet(pin(l.id, 'K'), pin('uno', g)))),
    },
    {
      id: 'direnc-degeri',
      text: 'Direnci yaklaşık 330 Ω yap (220-1000 Ω arası olur).',
      hint: 'Direnci seçip sağdaki özelliklerden değerini ayarla.',
      check: ({ circuit }) => partsOf(circuit, 'resistor').some((r) => Number(r.props.ohms) >= 220 && Number(r.props.ohms) <= 1000),
    },
    {
      id: 'yanip-sonuyor',
      text: 'Programı çalıştır: LED yanıp sönsün.',
      hint: 'Kodda pinMode, digitalWrite ve delay kullan, sonra “Derle ve çalıştır”a bas.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 3),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(part('r1', 'resistor', 360, 60, { ohms: 330 }), part('led1', 'led', 480, 60, { color: 'red' }))
    circuit.wires.push(wire(pin('uno', 'D13'), pin('r1', '1')), wire(pin('r1', '2'), pin('led1', 'A')), wire(pin('led1', 'K'), pin('uno', 'GND')))
    return {
      circuit,
      code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`,
    }
  },
}

const COKLU_CODE = `// Dört LED'i sırayla yak: D13, D12, D11, D10.
int ledler[] = {13, 12, 11, 10};

void setup() {
  // dizideki her pini çıkış yap (for döngüsü)
}

void loop() {
  // dizideki her LED'i sırayla yak, bekle, söndür
}
`

const cokluLed: LabActivity = {
  intro: 'Dört LED’i D13, D12, D11 ve D10 pinlerine kur. Diziyle ve for döngüsüyle LED’leri sırayla yakıp söndür.',
  starter: () => ({ circuit: unoOnly(), code: COKLU_CODE }),
  allowedParts: ['led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale dört LED ve dört direnç ekle.',
      hint: '“Parça ekle” menüsünden LED ve direnci dörder kez seç.',
      check: ({ circuit }) => partsOf(circuit, 'led').length >= 4 && partsOf(circuit, 'resistor').length >= 4,
    },
    {
      id: 'pinler-direnc-led',
      text: 'D13, D12, D11 ve D10 pinlerinin her birini bir direnç üzerinden bir LED’in A ucuna bağla.',
      hint: 'Her LED’in kendi direnci olsun: D pini → direnç 1, direnç 2 → LED A.',
      check: pinsThroughResistor([13, 12, 11, 10]),
    },
    {
      id: 'katotlar-gnd',
      text: 'Bütün LED’lerin K (katot) ucunu GND’ye bağla.',
      hint: 'Dört katot da Uno’nun GND pinlerinden birine gitmeli.',
      check: ledsToGnd,
    },
    {
      id: 'dizi-kod',
      text: 'Kodda for döngüsü ve bir dizi kullan.',
      hint: 'int ledler[] = {13, 12, 11, 10}; yaz ve for (int i = 0; i < 4; i++) ile dolaş.',
      check: ({ code }) => /for\s*\(/.test(stripComments(code)) && /\w+\s*\[\s*\]\s*=\s*\{/.test(stripComments(code)),
    },
    {
      id: 'hepsi-yaniyor',
      text: 'Programı çalıştır: dört LED’in dördü de yanıp sönsün.',
      hint: '“Derle ve çalıştır”a bas. Bir LED hiç yanmıyorsa kablosunu, pin numarasını ve dizinin elemanlarını kontrol et.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').filter((l) => (stats?.ledToggles[l.id] ?? 0) >= 2).length >= 4,
    },
  ],
  solution: () => ({
    circuit: ledRow([13, 12, 11, 10], ['red', 'yellow', 'green', 'blue']),
    code: `int ledler[] = {13, 12, 11, 10};

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(ledler[i], OUTPUT);
  }
}

void loop() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledler[i], HIGH);
    delay(300);
    digitalWrite(ledler[i], LOW);
  }
}
`,
  }),
  scenario: (s) => s.advance(3000),
}

const TRAFIK_CODE = `// Trafik ışığı: kırmızı D13, sarı D12, yeşil D11.
// Plan: kırmızı 5 sn, yeşil 5 sn, sarı 2 sn, sonra başa dön.
void setup() {
  // üç pini çıkış yap
}

void loop() {
  // aşamaları sırayla yaz
}
`

const trafikIsigi: LabActivity = {
  intro: 'Kırmızı (D13), sarı (D12) ve yeşil (D11) LED’lerle trafik ışığı kur: kırmızı 5 sn, yeşil 5 sn, sarı 2 sn, sonra başa dön.',
  starter: () => ({ circuit: unoOnly(), code: TRAFIK_CODE }),
  allowedParts: ['led', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale üç LED ve üç direnç ekle.',
      hint: '“Parça ekle” menüsünden LED ve direnci üçer kez seç.',
      check: ({ circuit }) => partsOf(circuit, 'led').length >= 3 && partsOf(circuit, 'resistor').length >= 3,
    },
    {
      id: 'pinler-direnc-led',
      text: 'D13, D12 ve D11 pinlerinin her birini bir direnç üzerinden bir LED’in A ucuna bağla.',
      hint: 'Her LED’in kendi direnci olsun: D pini → direnç 1, direnç 2 → LED A.',
      check: pinsThroughResistor([13, 12, 11]),
    },
    {
      id: 'katotlar-gnd',
      text: 'Bütün LED’lerin K (katot) ucunu GND’ye bağla.',
      hint: 'Üç katot da Uno’nun GND pinlerinden birine gitmeli.',
      check: ledsToGnd,
    },
    {
      id: 'renkler',
      text: 'LED’lerin renklerini kırmızı, sarı ve yeşil yap.',
      hint: 'LED’i seçip sağdaki özelliklerden “Renk”i değiştir. D13 kırmızı, D12 sarı, D11 yeşil olsun.',
      check: ({ circuit, analysis }) =>
        ([[13, 'red'], [12, 'yellow'], [11, 'green']] as const).every(([d, color]) =>
          partsOf(circuit, 'led').some((l) => l.props.color === color && analysis.connected(pin('uno', `D${d}`), pin(l.id, 'A'), ['resistor']))),
    },
    {
      id: 'uc-led-yanip-soner',
      text: 'Programı çalıştır: kırmızı, sarı ve yeşil LED’lerin üçü de yanıp sönsün.',
      hint: '“Derle ve çalıştır”a bas ve bir tam turu (yaklaşık 12 sn) bekle. Süreleri kısaltırsan daha çabuk tamamlanır.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').filter((l) => (stats?.ledToggles[l.id] ?? 0) >= 2).length >= 3,
    },
  ],
  solution: () => ({
    circuit: ledRow([13, 12, 11], ['red', 'yellow', 'green']),
    code: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);
  delay(5000);

  digitalWrite(13, LOW);
  digitalWrite(11, HIGH);
  delay(5000);

  digitalWrite(11, LOW);
  digitalWrite(12, HIGH);
  delay(2000);

  digitalWrite(12, LOW);
}
`,
  }),
  // Bir tam tur 12 sn; ikinci turun kırmızısı için biraz pay bırak.
  scenario: (s) => s.advance(14000),
}

export const M3_H1_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:1:1': mikrodenetleyici,
  'arduino-temelleri:1:3': blink,
  'arduino-temelleri:1:4': cokluLed,
  'arduino-temelleri:1:5': trafikIsigi,
}

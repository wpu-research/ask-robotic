import type { LabActivity } from '../activity'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

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
  intro: 'Devreyi kur, programı yaz ve çalıştır: LED saniyede bir yanıp sönsün.',
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

export const MODUL3_LAB_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:1:3': blink,
}

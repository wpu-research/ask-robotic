import type { LabActivity, LabScenario } from '../activity'
import type { Circuit, CircuitAnalysis } from '../contract'
import type { LabGoal } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 3, hafta 2 laboratuvar etkinlikleri. Anahtar: "arduino-temelleri:2:<ders>" (ders 1 tabanlı konum). Ders 2 (if/else/switch) için etkinlik yok. */

// ---- ortak denetimler ----

/** Butonun bir ucu `unoPin`'e, öbür ucu GND'ye bağlı mı (uç sırası fark etmez). */
const buttonOn = (c: Circuit, a: CircuitAnalysis, unoPin: string) =>
  partsOf(c, 'button').some((b) => {
    const toGnd = (p: string) => UNO_GNDS.some((g) => a.sameNet(pin(b.id, p), pin('uno', g)))
    return (a.sameNet(pin(b.id, 'A'), pin('uno', unoPin)) && toGnd('B')) || (a.sameNet(pin(b.id, 'B'), pin('uno', unoPin)) && toGnd('A'))
  })

const ledViaResistor = (c: Circuit, a: CircuitAnalysis, unoPin: string) =>
  partsOf(c, 'led').some((l) => a.connected(pin('uno', unoPin), pin(l.id, 'A'), ['resistor']) && !a.sameNet(pin('uno', unoPin), pin(l.id, 'A')))

const ledCathodeGnd = (c: Circuit, a: CircuitAnalysis) =>
  partsOf(c, 'led').some((l) => UNO_GNDS.some((g) => a.sameNet(pin(l.id, 'K'), pin('uno', g))))

const buttonGoal = (id: string, unoPin: string): LabGoal => ({
  id,
  text: `Butonun bir ucunu ${unoPin} pinine, öbür ucunu GND’ye bağla.`,
  hint: `Butonun A ucundan ${unoPin}’ye, B ucundan GND’ye kablo çek. Hangi uç hangisi olduğu fark etmez.`,
  check: ({ circuit, analysis }) => buttonOn(circuit, analysis, unoPin),
})

const ledGoal = (id: string): LabGoal => ({
  id,
  text: 'D13 pinini bir direnç üzerinden LED’in uzun bacağına (anot, A) bağla.',
  hint: 'D13 → direncin bir ucu, direncin öbür ucu → LED’in A ucu. Direnci 330 Ω yap. D13’ü LED’e doğrudan bağlama.',
  check: ({ circuit, analysis }) => ledViaResistor(circuit, analysis, 'D13'),
})

const cathodeGoal = (id: string): LabGoal => ({
  id,
  text: 'LED’in kısa bacağını (katot, K) GND’ye bağla.',
  hint: 'Uno’daki herhangi bir GND pini olur.',
  check: ({ circuit, analysis }) => ledCathodeGnd(circuit, analysis),
})

/** Çözüm devresi: buton D2-GND, LED (kırmızı) D13 - 330 Ω. */
function buttonLedCircuit(): Circuit {
  const c = unoOnly()
  c.parts.push(part('btn1', 'button', 360, 200), part('r1', 'resistor', 360, 60, { ohms: 330 }), part('led1', 'led', 480, 60, { color: 'red' }))
  c.wires.push(
    wire(pin('uno', 'D2'), pin('btn1', 'A')), wire(pin('btn1', 'B'), pin('uno', 'GND2')),
    wire(pin('uno', 'D13'), pin('r1', '1')), wire(pin('r1', '2'), pin('led1', 'A')), wire(pin('led1', 'K'), pin('uno', 'GND')),
  )
  return c
}

/** Butona basıp bırakır (laboratuvarın butonu sıçramasız, temiz sinyal verir). */
function tap(s: LabScenario, id: string, holdMs: number, gapMs: number) {
  s.setProp(id, 'pressed', true)
  s.advance(holdMs)
  s.setProp(id, 'pressed', false)
  s.advance(gapMs)
}

/** Seri alıcı tek baytlıktır: karakterleri arada bekleterek gönderir. */
function typeSerial(s: LabScenario, text: string) {
  for (const ch of text) { s.sendSerial(ch); s.advance(10) }
}

const serialLines = (serial: string) => serial.split(/\r?\n/).map((l) => l.trim())
const serialInts = (serial: string) => (serial.match(/\d+/g) ?? []).map(Number)

// ---- ders 1 (06): digitalRead, buton, INPUT_PULLUP ----

const BUTTON_CODE = `// Butona basınca LED yansın.
void setup() {
  // D2 giriş (iç pull-up açık), D13 çıkış
}

void loop() {
  // D2'yi oku, basılıysa (LOW) LED'i yak
}
`

const digitalReadButon: LabActivity = {
  intro: 'Butonu D2’ye bağla, iç pull-up ile oku: butona basınca LED yansın, bırakınca sönsün.',
  starter: () => ({ circuit: unoOnly(), code: BUTTON_CODE }),
  allowedParts: ['button', 'led', 'resistor'],
  goals: [
    buttonGoal('buton-d2', 'D2'),
    ledGoal('led-d13'),
    cathodeGoal('katot-gnd'),
    {
      id: 'input-pullup',
      text: 'Kodda D2’yi INPUT_PULLUP olarak ayarla.',
      hint: 'setup() içine pinMode(2, INPUT_PULLUP); yaz. Basılı = LOW olduğunu unutma.',
      check: ({ code }) => /pinMode\s*\(\s*2\s*,\s*INPUT_PULLUP\s*\)/.test(code),
    },
    {
      id: 'basinca-yanar',
      text: 'Çalıştır ve butonu basılı tut: LED yansın.',
      hint: 'Basılıyken D2 LOW olur. LED’in tersine yanıyorsa değeri ters çevir ya da if (digitalRead(2) == LOW) kullan.',
      behavior: true,
      check: ({ circuit, lab }) => !!lab && lab.pins.D2?.high === false && partsOf(circuit, 'led').some((l) => lab.parts[l.id]?.led?.on === true),
    },
    {
      id: 'birakinca-soner',
      text: 'Butonu bırak: LED sönsün. (Bir kez bas ve bırak.)',
      hint: 'LED hem yanmalı hem sönmeli. Basılı değilken LED yanıyorsa mantık ters kalmış.',
      behavior: true,
      check: ({ circuit, stats }) => (stats?.pinEdges.D2 ?? 0) >= 2 && partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 2),
    },
  ],
  solution: () => ({
    circuit: buttonLedCircuit(),
    code: `void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int durum = digitalRead(2);
  digitalWrite(13, 1 - durum);
}
`,
  }),
  scenario: (s) => {
    s.advance(300)
    tap(s, 'btn1', 150, 300)
    s.setProp('btn1', 'pressed', true) // basılı tutarak bitir
    s.advance(300)
  },
}

// ---- ders 3 (08): debounce ve kenar algılama ----

const EDGE_CODE = `// Her basışta LED'in durumu tersine dönsün.
int onceki = HIGH;
int ledDurum = LOW;

void setup() {
  // D2 giriş (pull-up), D13 çıkış
}

void loop() {
  // butonu oku; HIGH'dan LOW'a geçişi (düşen kenar) yakala
  // yakalayınca ledDurum'u ters çevir ve LED'e yaz
  // onceki'yi güncellemeyi unutma
}
`

const debounceKenar: LabActivity = {
  intro: 'Kenar algılamayla her basışta LED’i tersine çevir: butonu basılı tutsan da tek basış tek değişim olsun.',
  starter: () => ({ circuit: unoOnly(), code: EDGE_CODE }),
  allowedParts: ['button', 'led', 'resistor'],
  goals: [
    buttonGoal('buton-d2', 'D2'),
    ledGoal('led-d13'),
    cathodeGoal('katot-gnd'),
    {
      id: 'tek-basis-tek-degisim',
      text: 'Butona en az iki kez bas (birinde uzun tut): LED her basışta tam bir kez değişsin.',
      hint: 'Seviyeye değil kenara bak: if (onceki == HIGH && simdi == LOW). Sonda onceki = simdi; yaz. Basılı tutunca LED titreşiyorsa kenar kullanmıyorsun.',
      behavior: true,
      check: ({ circuit, stats }) => {
        const edges = stats?.pinEdges.D2 ?? 0
        const presses = Math.ceil(edges / 2)
        return edges >= 4 && partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) === presses)
      },
    },
  ],
  solution: () => ({
    circuit: buttonLedCircuit(),
    code: `int onceki = HIGH;
int ledDurum = LOW;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int simdi = digitalRead(2);

  if (simdi != onceki) {
    delay(20);
    simdi = digitalRead(2);
    if (simdi != onceki) {
      if (simdi == LOW) {
        ledDurum = 1 - ledDurum;
        digitalWrite(13, ledDurum);
      }
      onceki = simdi;
    }
  }
}
`,
  }),
  scenario: (s) => {
    s.advance(200)
    tap(s, 'btn1', 120, 250)
    tap(s, 'btn1', 1000, 250) // uzun basış: yine tek değişim
    tap(s, 'btn1', 120, 250)
  },
}

// ---- ders 4 (09): Serial Monitor ----

const SERIAL_CODE = `// Buton durumunu seri monitöre yaz, A ve K komutlarıyla LED'i yönet.
void setup() {
  // pinler, Serial.begin(9600)
}

void loop() {
  // 1) D2'yi oku ve seri monitöre yaz
  // 2) Serial.available() > 0 ise bir karakter oku: 'A' yak, 'K' söndür
}
`

const serialMonitor: LabActivity = {
  intro: 'Seri monitöre buton durumunu yazdır; seri monitörden A gönderince LED yansın, K gönderince sönsün.',
  starter: () => ({ circuit: unoOnly(), code: SERIAL_CODE }),
  allowedParts: ['button', 'led', 'resistor'],
  goals: [
    buttonGoal('buton-d2', 'D2'),
    ledGoal('led-d13'),
    cathodeGoal('katot-gnd'),
    {
      id: 'seri-yazdir',
      text: 'Programı çalıştır, butona bas ve bırak: seri monitörde hem 1 hem 0 değeri görünsün.',
      hint: 'Serial.begin(9600); yaz, sonra Serial.println(digitalRead(2)); ile değeri yazdır. Basılı değilken 1, basılıyken 0 olur.',
      behavior: true,
      check: ({ lab, stats }) => {
        const lines = serialLines(lab?.serial ?? '')
        return (stats?.pinEdges.D2 ?? 0) >= 2 && lines.some((l) => /(^|\D)1$/.test(l)) && lines.some((l) => /(^|\D)0$/.test(l))
      },
    },
    {
      id: 'seri-komut',
      text: 'Seri monitörden A gönder: LED yansın. K gönder: sönsün.',
      hint: 'if (Serial.available() > 0) { char c = Serial.read(); … } içinde c == \'A\' ve c == \'K\' durumlarına digitalWrite yaz. Tek tırnak kullan.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 2),
    },
  ],
  solution: () => ({
    circuit: buttonLedCircuit(),
    code: `int onceki = -1;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  Serial.println("Hazir");
}

void loop() {
  int d = digitalRead(2);
  if (d != onceki) {
    Serial.print("D2 = ");
    Serial.println(d);
    onceki = d;
  }

  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'A') {
      digitalWrite(13, HIGH);
      Serial.println("LED acik");
    } else if (c == 'K') {
      digitalWrite(13, LOW);
      Serial.println("LED kapali");
    }
  }
}
`,
  }),
  scenario: (s) => {
    s.advance(200)
    tap(s, 'btn1', 150, 150)
    typeSerial(s, 'A')
    s.advance(100)
    typeSerial(s, 'K')
    s.advance(100)
  },
}

// ---- ders 5 (10): Proje, kapı zili ve basış sayacı ----

const DOORBELL_CODE = `// Kapı zili: her basışta LED yansın, zil çalsın, sayaç artsın ve seri monitöre yazılsın.
int sayac = 0;
int onceki = HIGH;

void setup() {
  // butonu, LED'i ve buzzer'ı tanıt; Serial.begin(9600)
}

void loop() {
  // kenar algıla (basılı tutmak tek sayım olsun)
  // basışta: sayac++, LED + buzzer 300 ms, Serial.println(sayac)
}
`

const kapiZili: LabActivity = {
  intro: 'Kapı zilini kur: butona her basışta LED yansın, aktif buzzer ötsün, sayaç artsın ve seri monitöre yazılsın.',
  starter: () => ({ circuit: unoOnly(), code: DOORBELL_CODE }),
  allowedParts: ['button', 'led', 'resistor', 'buzzer'],
  goals: [
    buttonGoal('buton-d2', 'D2'),
    {
      id: 'buzzer-d8',
      text: 'Buzzer’ın + ucunu D8’e, - ucunu GND’ye bağla ve türünü Aktif yap.',
      hint: 'Buzzer’ı seç, sağ panelde “Tür”ü “Aktif” yap. + ucu D8’e, - ucu GND’ye. Aktif buzzer HIGH ile öter.',
      check: ({ circuit, analysis }) =>
        partsOf(circuit, 'buzzer').some(
          (b) => b.props.kind === 'active' && analysis.sameNet(pin(b.id, '+'), pin('uno', 'D8')) && UNO_GNDS.some((g) => analysis.sameNet(pin(b.id, '-'), pin('uno', g))),
        ),
    },
    {
      id: 'led-d13',
      text: 'D13’ü bir direnç üzerinden LED’in anoduna bağla, LED’in katodunu GND’ye bağla.',
      hint: 'D13 → direnç (330 Ω) → LED’in A ucu; LED’in K ucu → GND.',
      check: ({ circuit, analysis }) => ledViaResistor(circuit, analysis, 'D13') && ledCathodeGnd(circuit, analysis),
    },
    {
      id: 'led-zil',
      text: 'Butona bas: LED yansın ve D8’deki zil ötsün.',
      hint: 'Basışta digitalWrite(13, HIGH) ve digitalWrite(8, HIGH) yaz, kısa bir delay sonra ikisini LOW yap.',
      behavior: true,
      check: ({ circuit, stats }) => (stats?.pinEdges.D8 ?? 0) >= 2 && partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 2),
    },
    {
      id: 'sayac-seri',
      text: 'Üç kez bas: seri monitörde 1, 2, 3 sayıları sırayla görünsün.',
      hint: 'sayac değişkenini loop() dışında tanımla, basışta sayac++ yap ve Serial.println(sayac) ile yaz.',
      behavior: true,
      check: ({ lab }) => {
        const n = serialInts(lab?.serial ?? '')
        const i1 = n.indexOf(1)
        const i2 = i1 < 0 ? -1 : n.indexOf(2, i1 + 1)
        return i2 >= 0 && n.indexOf(3, i2 + 1) >= 0
      },
    },
    {
      id: 'tek-basis-tek-sayim',
      text: 'Butonu bir basışta uzun tut: sayaç yine tek artsın (sayı, basış sayısını geçmesin).',
      hint: 'Seviyeye değil kenara bak: yalnız onceki == HIGH iken simdi == LOW olduğunda say. onceki = simdi; yazmayı unutma.',
      behavior: true,
      check: ({ lab, stats }) => {
        const n = serialInts(lab?.serial ?? '')
        const presses = Math.ceil((stats?.pinEdges.D2 ?? 0) / 2)
        return n.length > 0 && presses >= 1 && Math.max(...n) <= presses
      },
    },
  ],
  solution: () => {
    const c = buttonLedCircuit()
    c.parts.push(part('buz1', 'buzzer', 480, 200, { kind: 'active' }))
    c.wires.push(wire(pin('uno', 'D8'), pin('buz1', '+')), wire(pin('buz1', '-'), pin('uno', 'GND3')))
    return {
      circuit: c,
      code: `int sayac = 0;
int onceki = HIGH;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(8, OUTPUT);
  Serial.begin(9600);
  Serial.println("Kapi zili hazir");
}

void loop() {
  int simdi = digitalRead(2);
  if (simdi != onceki) {
    delay(20);
    simdi = digitalRead(2);
    if (simdi != onceki) {
      onceki = simdi;
      if (simdi == LOW) {
        sayac++;
        bool sessiz = (digitalRead(3) == LOW);

        digitalWrite(13, HIGH);
        if (!sessiz) {
          digitalWrite(8, HIGH);
        }
        delay(300);
        digitalWrite(13, LOW);
        digitalWrite(8, LOW);

        Serial.print("Zil: ");
        Serial.println(sayac);
      }
    }
  }

  if (Serial.available() > 0) {
    char komut = Serial.read();
    if (komut == 'S') {
      Serial.print("Toplam: ");
      Serial.println(sayac);
    } else if (komut == 'R') {
      sayac = 0;
      Serial.println("Sayac sifirlandi");
    }
  }
}
`,
    }
  },
  scenario: (s) => {
    s.advance(200)
    tap(s, 'btn1', 120, 500)
    tap(s, 'btn1', 1000, 500) // uzun basış: tek sayım
    tap(s, 'btn1', 120, 500)
    typeSerial(s, 'S')
    s.advance(100)
  },
}

export const M3_H2_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:2:1': digitalReadButon,
  'arduino-temelleri:2:3': debounceKenar,
  'arduino-temelleri:2:4': serialMonitor,
  'arduino-temelleri:2:5': kapiZili,
}

import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 3, hafta 5 laboratuvar etkinlikleri. Anahtar: "arduino-temelleri:5:<ders>" (ders 1 tabanlı konum). */

type Ctx = Pick<LabGoalCtx, 'circuit' | 'analysis'>

/** Parça ucu doğrudan (kablolarla) Uno pinine bağlı mı. */
const toUno = ({ analysis }: Ctx, id: string, p: string, uno: string) => analysis.sameNet(pin(id, p), pin('uno', uno))
const toGnd = (c: Ctx, id: string, p: string) => UNO_GNDS.some((g) => toUno(c, id, p, g))
/** İki parça ucu doğrudan aynı düğümde mi. */
const same = ({ analysis }: Ctx, a: string, pa: string, b: string, pb: string) => analysis.sameNet(pin(a, pa), pin(b, pb))
/** Uno pini ile parça ucu arasında yalnız dirençle (doğrudan değil) yol var mı. */
const viaResistor = ({ analysis }: Ctx, unoPin: string, id: string, p: string) =>
  analysis.connected(pin('uno', unoPin), pin(id, p), ['resistor']) && !analysis.sameNet(pin('uno', unoPin), pin(id, p))
/** Uno pini, yalnız bir butondan geçerek GND'ye bağlı mı (INPUT_PULLUP butonu). */
const buttonToGnd = ({ analysis }: Ctx, unoPin: string) =>
  UNO_GNDS.some((g) => analysis.connected(pin('uno', unoPin), pin('uno', g), ['button']) && !analysis.sameNet(pin('uno', unoPin), pin('uno', g)))

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const speedOf = (c: LabGoalCtx): number[] => partsOf(c.circuit, 'dcmotor').map((m) => c.lab?.parts[m.id]?.dcmotor?.speed).filter((x): x is number => x !== undefined)

// ---- Ders 21: Servo ----

const SERVO_CODE = `// Burayı sen yaz: servo 0, 90 ve 180 dereceye gitsin.
#include <Servo.h>

Servo servom;

void setup() {
  // servoyu D9'a bağla (attach)
}

void loop() {
  // 0 dereceye git, bekle; 90 dereceye git, bekle; 180 dereceye git, bekle
}
`

const servo: LabActivity = {
  intro: 'Servoyu ekle, D9 sinyaliyle ve 5V/GND ile bağla. Programı yaz: servo 0, 90 ve 180 dereceye sırayla gitsin.',
  starter: () => ({ circuit: unoOnly(), code: SERVO_CODE }),
  allowedParts: ['servo', 'pot'],
  goals: [
    {
      id: 'sinyal',
      text: 'Servonun SIG (sinyal) ucunu D9’a bağla.',
      hint: 'Parça ekle’den Servo’yu seç; SIG pininden D9’a kablo çek.',
      check: (c) => partsOf(c.circuit, 'servo').some((s) => toUno(c, s.id, 'SIG', 'D9')),
    },
    {
      id: 'vcc',
      text: 'Servonun VCC ucunu 5V’a bağla.',
      hint: 'Servo, güç pininden beslenir; sinyal pininden değil. VCC → Uno 5V.',
      check: (c) => partsOf(c.circuit, 'servo').some((s) => toUno(c, s.id, 'VCC', '5V')),
    },
    {
      id: 'gnd',
      text: 'Servonun GND ucunu GND’ye bağla.',
      hint: 'Uno’daki herhangi bir GND pini olur.',
      check: (c) => partsOf(c.circuit, 'servo').some((s) => toGnd(c, s.id, 'GND')),
    },
    {
      id: 'uc-konum',
      text: 'Kodda üç konumu da yaz: 0, 90 ve 180 derece.',
      hint: 'loop() içinde servom.write(0); servom.write(90); servom.write(180); satırlarını, aralarına delay(1000); koyarak yaz.',
      check: ({ code }) => {
        const c = noComments(code)
        return [0, 90, 180].every((a) => new RegExp(`\\.write\\s*\\(\\s*${a}\\s*\\)`).test(c))
      },
    },
    {
      id: 'aci-180',
      text: 'Programı çalıştır: servo kolu 180 dereceye gitsin.',
      hint: 'setup() içinde servom.attach(9); yaz ve ▶’e bas. Servo beslenmiyorsa (VCC/GND eksik) hareket etmez.',
      behavior: true,
      check: ({ lab }) => Object.values(lab?.parts ?? {}).some((p) => p.servo?.attached && p.servo.angleDeg >= 175),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(part('sv1', 'servo', 420, 60))
    circuit.wires.push(wire(pin('sv1', 'SIG'), pin('uno', 'D9')), wire(pin('sv1', 'VCC'), pin('uno', '5V')), wire(pin('sv1', 'GND'), pin('uno', 'GND')))
    return { circuit, code: `#include <Servo.h>

Servo servom;               // bir servo nesnesi oluştur

void setup() {
  servom.attach(9);         // servo sinyal teli D9'a bağlı
}

void loop() {
  servom.write(0);          // 0 dereceye git
  delay(1000);
  servom.write(90);         // 90 dereceye git
  delay(1000);
  servom.write(180);        // 180 dereceye git
  delay(1000);
}
` }
  },
  scenario: (s) => s.advance(2500), // 0 -> 90 -> 180 sırası: 2,5 sn'de servo 180 derecede
}

// ---- Ders 22: Transistör ve DC motor ----

const FAN_CODE = `// Burayı sen yaz: D6'dan PWM ver, motorun hızını potansiyometre belirlesin.
const int MOTOR = 6;

void setup() {
  // MOTOR pinini çıkış yap
}

void loop() {
  // A0'ı oku (0-1023), 0-255'e çevir ve analogWrite ile motora ver
}
`

const npnMotor: LabActivity = {
  intro: 'NPN transistörle motoru anahtarla: D6 baz direnci üzerinden tabana, motor 5V ile kolektör arasında, flyback diyodu motora paralel. Hızı potansiyometreyle ayarla.',
  starter: () => ({ circuit: unoOnly(), code: FAN_CODE }),
  allowedParts: ['npn', 'mosfet', 'dcmotor', 'diode', 'resistor', 'pot'],
  goals: [
    {
      id: 'baz',
      text: 'D6 pinini bir direnç üzerinden transistörün B (baz) ucuna bağla.',
      hint: 'D6 → 1 kΩ direncin 1 ucu, direncin 2 ucu → NPN’in B ucu. D6’yı tabana doğrudan bağlama.',
      check: (c) => partsOf(c.circuit, 'npn').some((q) => viaResistor(c, 'D6', q.id, 'B')),
    },
    {
      id: 'emitor',
      text: 'Transistörün E (emitör) ucunu GND’ye bağla.',
      hint: 'Uno’daki herhangi bir GND pini olur.',
      check: (c) => partsOf(c.circuit, 'npn').some((q) => toGnd(c, q.id, 'E')),
    },
    {
      id: 'motor',
      text: 'Motorun bir ucunu 5V’a, öbür ucunu transistörün C (kolektör) ucuna bağla.',
      hint: 'Motor M1 → 5V, motor M2 → NPN’in C ucu. Motor transistörle GND arasına değil, 5V ile kolektör arasına girer.',
      check: (c) => partsOf(c.circuit, 'dcmotor').some((m) => partsOf(c.circuit, 'npn').some((q) =>
        (toUno(c, m.id, 'M1', '5V') && same(c, m.id, 'M2', q.id, 'C')) || (toUno(c, m.id, 'M2', '5V') && same(c, m.id, 'M1', q.id, 'C')))),
    },
    {
      id: 'flyback',
      text: 'Flyback diyodunu motora paralel bağla: A (anot) kolektöre, K (katot) 5V’a.',
      hint: 'Katot (çizgili uç) motorun artı tarafına, yani 5V’a bakmalı. Ters bağlarsan laboratuvar uyarı verir.',
      check: (c) => partsOf(c.circuit, 'diode').some((d) => partsOf(c.circuit, 'npn').some((q) => same(c, d.id, 'A', q.id, 'C')) && toUno(c, d.id, 'K', '5V')),
    },
    {
      id: 'pot-hiz',
      text: 'Kodda hızı potansiyometreden oku ve D6’ya PWM olarak ver.',
      hint: 'int okuma = analogRead(A0); analogWrite(MOTOR, okuma / 4); Potansiyometrenin SIG ucunu A0’a, VCC’sini 5V’a, GND’sini GND’ye bağla.',
      check: ({ code }) => {
        const c = noComments(code)
        return /analogRead\s*\(\s*A0\s*\)/.test(c) && /analogWrite\s*\(/.test(c)
      },
    },
    {
      id: 'doner',
      text: 'Programı çalıştır: motor dönsün.',
      hint: 'Potansiyometre konumu sıfırdan büyük olmalı. Tüm kablolar tamsa motoru seç: Sanal ölçümde gerilim ve hız görünür.',
      behavior: true,
      check: (c) => speedOf(c).some((v) => Math.abs(v) > 0.2),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('rb', 'resistor', 360, 40, { ohms: 1000 }), part('q1', 'npn', 460, 40), part('m1', 'dcmotor', 560, 40),
      part('d1', 'diode', 560, 120), part('pot1', 'pot', 360, 140, { position: 0.5 }),
    )
    circuit.wires.push(
      wire(pin('uno', 'D6'), pin('rb', '1')), wire(pin('rb', '2'), pin('q1', 'B')), wire(pin('q1', 'E'), pin('uno', 'GND')),
      wire(pin('m1', 'M1'), pin('uno', '5V')), wire(pin('m1', 'M2'), pin('q1', 'C')),
      wire(pin('d1', 'A'), pin('q1', 'C')), wire(pin('d1', 'K'), pin('uno', '5V')),
      wire(pin('pot1', 'VCC'), pin('uno', '5V')), wire(pin('pot1', 'GND'), pin('uno', 'GND2')), wire(pin('pot1', 'SIG'), pin('uno', 'A0')),
    )
    return { circuit, code: `const int MOTOR = 6;        // transistörün bazına giden PWM pini

void setup() {
  pinMode(MOTOR, OUTPUT);
}

void loop() {
  int okuma = analogRead(A0);       // 0-1023
  int hiz = okuma / 4;              // 0-255
  analogWrite(MOTOR, hiz);
  delay(10);
}
` }
  },
  scenario: (s) => {
    s.advance(1500)
    s.setProp('pot1', 'position', 1)
    s.advance(1500)
  },
}

// ---- Ders 23: H-köprüsü L293D ----

const MOTOR_CODE = `// Burayı sen yaz: iki butonla motorun yönünü, potansiyometreyle hızını ayarla.
const int EN = 6;
const int IN1 = 7;
const int IN2 = 5;

void setup() {
  // EN, IN1, IN2 çıkış; D2 ve D3 INPUT_PULLUP
}

void loop() {
  // A0'dan hızı oku; D2 basılıysa ileri, D3 basılıysa geri, aksi halde dur
}
`

const l293d: LabActivity = {
  intro: 'L293D ile motorun yönünü iki butonla, hızını potansiyometreyle yönet. Çipi besle, kontrol pinlerini ve motoru bağla.',
  starter: () => ({ circuit: unoOnly(), code: MOTOR_CODE }),
  allowedParts: ['l293d', 'dcmotor', 'button', 'pot'],
  goals: [
    {
      id: 'besleme',
      text: 'L293D’yi besle: VCC1 ve VCC2’yi 5V’a, GND’yi GND’ye bağla.',
      hint: 'VCC1 çipin mantık gücü, VCC2 motorun gücüdür; ikisi de bu laboratuvarda Uno’nun 5V ucuna gider. Eksikse çıkışlar boşta kalır.',
      check: (c) => partsOf(c.circuit, 'l293d').some((l) => toUno(c, l.id, 'VCC1', '5V') && toUno(c, l.id, 'VCC2', '5V') && toGnd(c, l.id, 'GND')),
    },
    {
      id: 'kontrol',
      text: 'EN12’yi D6’ya, IN1’i D7’ye, IN2’yi D5’e bağla.',
      hint: 'EN12 hız (PWM) pinidir, IN1 ve IN2 yönü belirler.',
      check: (c) => partsOf(c.circuit, 'l293d').some((l) => toUno(c, l.id, 'EN12', 'D6') && toUno(c, l.id, 'IN1', 'D7') && toUno(c, l.id, 'IN2', 'D5')),
    },
    {
      id: 'motor',
      text: 'Motorun uçlarını L293D’nin OUT1 ve OUT2 pinlerine bağla.',
      hint: 'Motor M1 → OUT1, motor M2 → OUT2.',
      check: (c) => partsOf(c.circuit, 'dcmotor').some((m) => partsOf(c.circuit, 'l293d').some((l) =>
        (same(c, m.id, 'M1', l.id, 'OUT1') && same(c, m.id, 'M2', l.id, 'OUT2')) || (same(c, m.id, 'M1', l.id, 'OUT2') && same(c, m.id, 'M2', l.id, 'OUT1')))),
    },
    {
      id: 'butonlar',
      text: 'İki butonu bağla: biri D2 ile GND arasına, öbürü D3 ile GND arasına.',
      hint: 'Butonun A ucu D2 (ya da D3), B ucu GND. Kodda bu pinler INPUT_PULLUP olduğu için basılınca LOW okunur.',
      check: (c) => buttonToGnd(c, 'D2') && buttonToGnd(c, 'D3'),
    },
    {
      id: 'ileri',
      text: 'D2 butonuna bas: IN1 (D7) yükselsin, motor bir yönde dönsün.',
      hint: 'Programı ▶ ile çalıştır, butonu seçip “Basılı” özelliğini aç ya da butona basılı tut. İleri yönde D7 HIGH, D5 LOW olur.',
      behavior: true,
      check: (c) => (c.stats.pinEdges['D7'] ?? 0) >= 1,
    },
    {
      id: 'geri',
      text: 'D3 butonuna bas: IN2 (D5) yükselsin, motor ters yönde dönsün.',
      hint: 'Öbür butona bas. Geri yönde D7 LOW, D5 HIGH olur; motor hızı negatif görünür.',
      behavior: true,
      check: (c) => (c.stats.pinEdges['D5'] ?? 0) >= 1,
    },
    {
      id: 'doner',
      text: 'Bir butona basılıyken motor gerçekten dönsün.',
      hint: 'Potansiyometreyi bağla (SIG → A0, VCC → 5V, GND → GND), konumu sıfırdan büyük yap; L293D’nin VCC1, VCC2 ve EN12 bağlantılarına bak. Motoru seçip Sanal ölçümde gerilimi kontrol et.',
      behavior: true,
      check: (c) => speedOf(c).some((v) => Math.abs(v) > 0.15),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('u1', 'l293d', 380, 40), part('m1', 'dcmotor', 540, 40), part('b1', 'button', 380, 200), part('b2', 'button', 380, 260),
      part('pot1', 'pot', 540, 200, { position: 1 }),
    )
    circuit.wires.push(
      wire(pin('uno', 'D6'), pin('u1', 'EN12')), wire(pin('uno', 'D7'), pin('u1', 'IN1')), wire(pin('uno', 'D5'), pin('u1', 'IN2')),
      wire(pin('u1', 'OUT1'), pin('m1', 'M1')), wire(pin('u1', 'OUT2'), pin('m1', 'M2')),
      wire(pin('u1', 'GND'), pin('uno', 'GND')), wire(pin('u1', 'VCC1'), pin('uno', '5V')), wire(pin('u1', 'VCC2'), pin('uno', '5V')),
      wire(pin('uno', 'D2'), pin('b1', 'A')), wire(pin('b1', 'B'), pin('uno', 'GND3')),
      wire(pin('uno', 'D3'), pin('b2', 'A')), wire(pin('b2', 'B'), pin('uno', 'GND3')),
      wire(pin('pot1', 'VCC'), pin('uno', '5V')), wire(pin('pot1', 'GND'), pin('uno', 'GND3')), wire(pin('pot1', 'SIG'), pin('uno', 'A0')),
    )
    return { circuit, code: `const int EN = 6;
const int IN1 = 7;
const int IN2 = 5;

void surus(bool yonIleri, int hiz) {
  digitalWrite(IN1, yonIleri ? HIGH : LOW);
  digitalWrite(IN2, yonIleri ? LOW : HIGH);
  analogWrite(EN, hiz);
}

void dur() {
  analogWrite(EN, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}

void setup() {
  pinMode(EN, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  dur();
}

void loop() {
  int hiz = analogRead(A0) / 4;
  bool ileriBas = (digitalRead(2) == LOW);   // basılı = LOW
  bool geriBas = (digitalRead(3) == LOW);

  if (ileriBas && !geriBas) {
    surus(true, hiz);
  } else if (geriBas && !ileriBas) {
    surus(false, hiz);
  } else {
    dur();                                    // hiçbiri ya da ikisi birden
  }
}
` }
  },
  scenario: (s) => {
    s.advance(300)
    s.setProp('b1', 'pressed', true)
    s.advance(400)
    s.setProp('b1', 'pressed', false)
    s.advance(200)
    s.setProp('b2', 'pressed', true)
    s.advance(400)
  },
}

// ---- Ders 24: Röle ----

const ROLE_CODE = `// Burayı sen yaz: butona her basışta röle çeksin / bıraksın.
const int ROLE = 7;
const int BUTON = 2;
bool acik = false;

void setup() {
  // röle pinini çıkış yap (önce HIGH yaz), butonu INPUT_PULLUP yap
}

void loop() {
  // butona basılınca durumu ters çevir; röle LOW ile çeker, HIGH ile bırakır
}
`

const role: LabActivity = {
  intro: 'Röle modülünü ekle ve Tetik özelliğini “LOW ile çeker” yap. Kontak tarafına direnç ve LED bağla; butona her basışta LED yansın, sönsün.',
  starter: () => ({ circuit: unoOnly(), code: ROLE_CODE }),
  allowedParts: ['relay', 'resistor', 'led', 'button', 'pot'],
  goals: [
    {
      id: 'besleme',
      text: 'Röle modülünü besle: VCC’yi 5V’a, GND’yi GND’ye bağla.',
      hint: 'Röle modülü VCC’sinde 4 V’tan fazla gerilim ister; eksikse röle hiç çekmez.',
      check: (c) => partsOf(c.circuit, 'relay').some((k) => toUno(c, k.id, 'VCC', '5V') && toGnd(c, k.id, 'GND')),
    },
    {
      id: 'sinyal',
      text: 'Rölenin IN (sinyal) ucunu D7’ye bağla.',
      hint: 'IN pininden D7’ye kablo çek.',
      check: (c) => partsOf(c.circuit, 'relay').some((k) => toUno(c, k.id, 'IN', 'D7')),
    },
    {
      id: 'tetik',
      text: 'Röle özelliklerinde Tetik’i “LOW ile çeker (aktif-LOW)” yap.',
      hint: 'Rölenin üzerine tıkla; sağ paneldeki Tetik listesinden “LOW ile çeker”i seç. Kodun röleyi LOW ile çekecek şekilde yazılmıştır.',
      check: (c) => partsOf(c.circuit, 'relay').some((k) => k.props.trigger === 'low'),
    },
    {
      id: 'com',
      text: 'Rölenin COM (ortak) ucunu 5V’a bağla.',
      hint: 'Kontak tarafı kuru kontaktır: COM’a bir gerilim vermen gerekir. Laboratuvarda Uno’nun 5V ucu olur.',
      check: (c) => partsOf(c.circuit, 'relay').some((k) => toUno(c, k.id, 'COM', '5V')),
    },
    {
      id: 'yuk',
      text: 'NO ucundan bir dirençle LED’in A ucuna, LED’in K ucundan GND’ye bağla.',
      hint: 'NO → direnç (330 Ω) → LED A; LED K → GND. Röle çekmeyince NO açıktır, LED yanmaz.',
      check: (c) => partsOf(c.circuit, 'relay').some((k) => partsOf(c.circuit, 'led').some((l) =>
        c.analysis.connected(pin(k.id, 'NO'), pin(l.id, 'A'), ['resistor']) && !c.analysis.sameNet(pin(k.id, 'NO'), pin(l.id, 'A')) && toGnd(c, l.id, 'K'))),
    },
    {
      id: 'buton',
      text: 'Bir butonu D2 ile GND arasına bağla.',
      hint: 'Butonun A ucu D2, B ucu GND. Kodda D2 INPUT_PULLUP olduğu için basılınca LOW okunur.',
      check: (c) => buttonToGnd(c, 'D2'),
    },
    {
      id: 'led-degisir',
      text: 'Programı çalıştır: butona basınca LED yansın, tekrar basınca sönsün.',
      hint: 'LED’in iki kez durum değiştirmesi gerekir: bir basış yaksın, bir basış söndürsün. Butonu seçip “Basılı” özelliğini aç/kapa.',
      behavior: true,
      check: (c) => partsOf(c.circuit, 'led').some((l) => (c.stats.ledToggles[l.id] ?? 0) >= 2),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('k1', 'relay', 380, 40, { trigger: 'low' }), part('r1', 'resistor', 520, 40, { ohms: 330 }), part('led1', 'led', 620, 40, { color: 'red' }),
      part('b1', 'button', 380, 200),
    )
    circuit.wires.push(
      wire(pin('k1', 'VCC'), pin('uno', '5V')), wire(pin('k1', 'GND'), pin('uno', 'GND')), wire(pin('k1', 'IN'), pin('uno', 'D7')),
      wire(pin('k1', 'COM'), pin('uno', '5V')), wire(pin('k1', 'NO'), pin('r1', '1')), wire(pin('r1', '2'), pin('led1', 'A')), wire(pin('led1', 'K'), pin('uno', 'GND2')),
      wire(pin('uno', 'D2'), pin('b1', 'A')), wire(pin('b1', 'B'), pin('uno', 'GND3')),
    )
    return { circuit, code: `const int ROLE = 7;
const int BUTON = 2;
bool acik = false;

void setup() {
  digitalWrite(ROLE, HIGH);        // önce kapalı durumu yaz
  pinMode(ROLE, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {     // basıldı
    acik = !acik;                      // durumu ters çevir
    if (acik) {
      digitalWrite(ROLE, LOW);         // röle çeker
    } else {
      digitalWrite(ROLE, HIGH);        // röle bırakır
    }
    delay(50);
    while (digitalRead(BUTON) == LOW) {
      // buton bırakılana kadar bekle
    }
    delay(50);
  }
}
` }
  },
  scenario: (s) => {
    s.advance(100)
    for (let i = 0; i < 2; i++) {
      s.setProp('b1', 'pressed', true)
      s.advance(150)
      s.setProp('b1', 'pressed', false)
      s.advance(150)
    }
  },
}

// ---- Ders 25: Proje, otomatik fan ve servo ----

const PROJE_CODE = `// Burayı sen tamamla: sıcaklığa göre fan ve servo.
#include <Servo.h>

const int NTC_PIN = A2;
const int FAN_PIN = 6;
const int SERVO_PIN = 9;

const float SABIT_R = 10000.0;
const float NTC_R25 = 10000.0;
const float BETA = 3950.0;

const float ACMA_C = 30.0;
const float KAPAMA_C = 28.0;

Servo tarayici;

float sicaklikOku() {
  int adc = analogRead(NTC_PIN);
  adc = constrain(adc, 1, 1022);
  float rntc = SABIT_R * adc / (1023.0 - adc);
  float kelvin = 1.0 / (1.0 / 298.15 + log(rntc / NTC_R25) / BETA);
  return kelvin - 273.15;
}

void setup() {
  // seriyi başlat, fan pinini çıkış yap, servoyu bağla ve 90 dereceye park et
}

void loop() {
  // sıcaklığı oku; histerezisle fanı aç/kapat
  // fan açıkken hızı sıcaklığa göre ayarla ve servoyu 30-150 derece arasında tara
  // fan kapalıyken fanı durdur, servoyu 90 dereceye park et
  // sıcaklığı seriye yaz
}
`

const proje: LabActivity = {
  intro: 'Sıcaklık ölçümünü (NTC + 10 kΩ), NPN ile sürülen fanı ve servoyu kur. NTC’nin Sıcaklık özelliğini değiştirerek sistemi sına: 30 °C üstünde fan dönsün ve servo tarasın.',
  starter: () => ({ circuit: unoOnly(), code: PROJE_CODE }),
  allowedParts: ['ntc', 'resistor', 'npn', 'dcmotor', 'diode', 'servo'],
  goals: [
    {
      id: 'bolucu',
      text: 'Sıcaklık ölçeri kur: NTC A2 ile GND arasına, 10 kΩ direnç 5V ile A2 arasına.',
      hint: 'NTC altta (A2–GND), sabit direnç üstte (5V–A2). Direncin değerini 10 000 Ω yap: kodun formülü bunu varsayar.',
      check: (c) => partsOf(c.circuit, 'ntc').some((n) =>
        (toUno(c, n.id, '1', 'A2') && toGnd(c, n.id, '2')) || (toUno(c, n.id, '2', 'A2') && toGnd(c, n.id, '1')))
        && partsOf(c.circuit, 'resistor').some((r) => {
          const ohms = Number(r.props.ohms)
          return ohms >= 9500 && ohms <= 10500 && ((toUno(c, r.id, '1', '5V') && toUno(c, r.id, '2', 'A2')) || (toUno(c, r.id, '2', '5V') && toUno(c, r.id, '1', 'A2')))
        }),
    },
    {
      id: 'surucu',
      text: 'D6’yı bir dirençle transistörün B ucuna, E ucunu GND’ye bağla.',
      hint: 'D6 → 1 kΩ direnç → NPN B; NPN E → GND. D6 PWM pinidir; Servo yüzünden fan D9/D10’da olamaz.',
      check: (c) => partsOf(c.circuit, 'npn').some((q) => viaResistor(c, 'D6', q.id, 'B') && toGnd(c, q.id, 'E')),
    },
    {
      id: 'fan',
      text: 'Fan motorunun bir ucunu 5V’a, öbür ucunu transistörün C ucuna bağla.',
      hint: 'Motor M1 → 5V, motor M2 → NPN C.',
      check: (c) => partsOf(c.circuit, 'dcmotor').some((m) => partsOf(c.circuit, 'npn').some((q) =>
        (toUno(c, m.id, 'M1', '5V') && same(c, m.id, 'M2', q.id, 'C')) || (toUno(c, m.id, 'M2', '5V') && same(c, m.id, 'M1', q.id, 'C')))),
    },
    {
      id: 'flyback',
      text: 'Flyback diyodunu bağla: A ucu transistörün C ucuna, K ucu 5V’a.',
      hint: 'Katot (çizgili uç) motorun artı tarafına, yani 5V’a bakar.',
      check: (c) => partsOf(c.circuit, 'diode').some((d) => partsOf(c.circuit, 'npn').some((q) => same(c, d.id, 'A', q.id, 'C')) && toUno(c, d.id, 'K', '5V')),
    },
    {
      id: 'servo',
      text: 'Servoyu bağla: SIG → D9, VCC → 5V, GND → GND.',
      hint: 'Servo üç pinini de bağlamak zorunda; yoksa hareket etmez.',
      check: (c) => partsOf(c.circuit, 'servo').some((s) => toUno(c, s.id, 'SIG', 'D9') && toUno(c, s.id, 'VCC', '5V') && toGnd(c, s.id, 'GND')),
    },
    {
      id: 'fan-doner',
      text: 'NTC sıcaklığını 30 °C’nin üstüne çıkar: fan dönsün.',
      hint: 'NTC’yi seç, Sıcaklık özelliğini 45 °C yap (çalışırken de değişir). Programı ▶ ile çalıştır. Fan dönmüyorsa tüm hedeflerin devre kısımlarına bak.',
      behavior: true,
      check: (c) => speedOf(c).some((v) => Math.abs(v) > 0.3),
    },
    {
      id: 'servo-tarar',
      text: 'Fan çalışırken servo taramaya başlasın (park konumu olan 90 dereceden uzaklaşsın).',
      hint: 'Fan açıkken servo açısını 2 derece artıp azalt, 30 ile 150 arasında dolaştır; kapalıyken 90’da park et.',
      behavior: true,
      check: ({ lab }) => Object.values(lab?.parts ?? {}).some((p) => p.servo?.attached && (p.servo.angleDeg >= 120 || p.servo.angleDeg <= 60)),
    },
  ],
  solution: () => {
    const circuit: Circuit = unoOnly()
    circuit.parts.push(
      part('ntc1', 'ntc', 360, 40, { tempC: 25 }), part('rs', 'resistor', 360, 120, { ohms: 10000 }),
      part('rb', 'resistor', 360, 200, { ohms: 1000 }), part('q1', 'npn', 460, 200), part('m1', 'dcmotor', 560, 200), part('d1', 'diode', 560, 280),
      part('sv1', 'servo', 560, 40),
    )
    circuit.wires.push(
      wire(pin('ntc1', '1'), pin('uno', 'A2')), wire(pin('ntc1', '2'), pin('uno', 'GND')),
      wire(pin('rs', '1'), pin('uno', '5V')), wire(pin('rs', '2'), pin('uno', 'A2')),
      wire(pin('uno', 'D6'), pin('rb', '1')), wire(pin('rb', '2'), pin('q1', 'B')), wire(pin('q1', 'E'), pin('uno', 'GND2')),
      wire(pin('m1', 'M1'), pin('uno', '5V')), wire(pin('m1', 'M2'), pin('q1', 'C')),
      wire(pin('d1', 'A'), pin('q1', 'C')), wire(pin('d1', 'K'), pin('uno', '5V')),
      wire(pin('sv1', 'SIG'), pin('uno', 'D9')), wire(pin('sv1', 'VCC'), pin('uno', '5V')), wire(pin('sv1', 'GND'), pin('uno', 'GND3')),
    )
    return { circuit, code: `#include <Servo.h>

const int NTC_PIN = A2;
const int FAN_PIN = 6;          // PWM, transistör üzerinden fan
const int SERVO_PIN = 9;

const float SABIT_R = 10000.0;  // 10 kΩ sabit direnç
const float NTC_R25 = 10000.0;  // 25 °C'de 10 kΩ
const float BETA = 3950.0;

const float ACMA_C = 30.0;      // fan bu sıcaklıkta başlar
const float KAPAMA_C = 28.0;    // fan bu sıcaklığın altında durur

Servo tarayici;
bool fanAcik = false;
int aci = 90;
int yon = 2;                    // her adımda 2 derece
int sayac = 0;

float sicaklikOku() {
  int adc = analogRead(NTC_PIN);
  adc = constrain(adc, 1, 1022);                      // sıfıra bölmeyi önle
  float rntc = SABIT_R * adc / (1023.0 - adc);        // NTC altta (13. ders)
  float kelvin = 1.0 / (1.0 / 298.15 + log(rntc / NTC_R25) / BETA);
  return kelvin - 273.15;
}

void setup() {
  Serial.begin(9600);
  pinMode(FAN_PIN, OUTPUT);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
}

void loop() {
  float sicak = sicaklikOku();

  // histerezisli açma/kapama
  if (!fanAcik && sicak >= ACMA_C) {
    fanAcik = true;
  } else if (fanAcik && sicak < KAPAMA_C) {
    fanAcik = false;
  }

  if (fanAcik) {
    // 30-50 °C arasını fan hızına çevir, çok düşük hızlarda motor dönmez
    int hiz = map((int)(sicak * 10), 300, 500, 90, 255);
    hiz = constrain(hiz, 90, 255);
    analogWrite(FAN_PIN, hiz);

    // servo bir adım ilerler
    aci = aci + yon;
    if (aci >= 150 || aci <= 30) {
      yon = -yon;                 // uca gelince yön değiştir
    }
    tarayici.write(aci);
  } else {
    analogWrite(FAN_PIN, 0);
    aci = 90;
    yon = 2;
    tarayici.write(90);           // park
  }

  sayac++;
  if (sayac >= 25) {              // yaklaşık yarım saniyede bir yazdır
    sayac = 0;
    Serial.print("Sicaklik: ");
    Serial.print(sicak, 1);
    Serial.print(" C  Fan: ");
    Serial.println(fanAcik ? "ACIK" : "KAPALI");
  }
  delay(20);
}
` }
  },
  scenario: (s) => {
    s.advance(1500)
    s.setProp('ntc1', 'tempC', 45)
    s.advance(4300) // servo taramanın bir ucuna yakın
  },
}

export const M3_H5_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:5:1': servo,
  'arduino-temelleri:5:2': npnMotor,
  'arduino-temelleri:5:3': l293d,
  'arduino-temelleri:5:4': role,
  'arduino-temelleri:5:5': proje,
}

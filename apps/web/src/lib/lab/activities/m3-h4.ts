import type { LabActivity } from '../activity'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 3, hafta 4 laboratuvar etkinlikleri. Anahtar: "arduino-temelleri:4:<ders>" (ders 1 tabanlı konum). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
const inRange = (v: number | undefined, target: number, tol: number) => v !== undefined && Math.abs(v - target) <= tol

/** Bir Uno pini ile parça ucu arasında (yalnız dirençten geçerek, doğrudan değil) yol var mı. */
const viaResistor = ({ analysis }: Pick<LabGoalCtx, 'analysis'>, uno: string, p: string, pn: string) =>
  analysis.connected(pin('uno', uno), pin(p, pn), ['resistor']) && !analysis.sameNet(pin('uno', uno), pin(p, pn))

const toGnd = ({ analysis }: Pick<LabGoalCtx, 'analysis'>, p: string, pn: string) => UNO_GNDS.some((g) => analysis.sameNet(pin(p, pn), pin('uno', g)))

/** Pasif buzzer: + ucu Uno'nun bir dijital pinine (D2-D13), - ucu GND'ye bağlı. */
const buzzerWired = (c: LabGoalCtx, pinName = 'D8') =>
  partsOf(c.circuit, 'buzzer').some((b) => c.analysis.sameNet(pin(b.id, '+'), pin('uno', pinName)) && toGnd(c, b.id, '-'))

const freqHeard = (c: LabGoalCtx, hz: number, tol: number) =>
  Object.values(c.lab?.parts ?? {}).some((p) => p.buzzer?.on && inRange(p.buzzer.freqHz, hz, tol))

const addBuzzer = (circuit = unoOnly()) => {
  circuit.parts.push(part('bz1', 'buzzer', 480, 60, { kind: 'passive' }))
  circuit.wires.push(wire(pin('uno', 'D8'), pin('bz1', '+')), wire(pin('bz1', '-'), pin('uno', 'GND')))
  return circuit
}

const addRgb = (circuit = unoOnly()) => {
  circuit.parts.push(
    part('r1', 'resistor', 360, 40, { ohms: 330 }), part('r2', 'resistor', 360, 100, { ohms: 330 }), part('r3', 'resistor', 360, 160, { ohms: 330 }),
    part('rgb1', 'rgbled', 520, 100, { common: 'cathode' }),
  )
  circuit.wires.push(
    wire(pin('uno', 'D9'), pin('r1', '1')), wire(pin('r1', '2'), pin('rgb1', 'R')),
    wire(pin('uno', 'D10'), pin('r2', '1')), wire(pin('r2', '2'), pin('rgb1', 'G')),
    wire(pin('uno', 'D11'), pin('r3', '1')), wire(pin('r3', '2'), pin('rgb1', 'B')),
    wire(pin('rgb1', 'COM'), pin('uno', 'GND')),
  )
  return circuit
}

const rgbAny = (c: LabGoalCtx) => partsOf(c.circuit, 'rgbled').map((p) => c.lab?.parts[p.id]?.rgbled).filter((x) => !!x) as { r: number; g: number; b: number }[]

const rgbWiring = (c: LabGoalCtx) => partsOf(c.circuit, 'rgbled').some((l) => viaResistor(c, 'D9', l.id, 'R') && viaResistor(c, 'D10', l.id, 'G') && viaResistor(c, 'D11', l.id, 'B'))

// ---- Ders 16: PWM / analogWrite ----

const PWM_CODE = `// Burayı sen yaz: LED'in parlaklığı yavaşça artıp azalsın (nefes alsın).
void setup() {
  // 9. pini çıkış yap
}

void loop() {
  // analogWrite(9, 0-255 arası değer) kullan
}
`

const pwm: LabActivity = {
  intro: 'Kırmızı LED’i D9 üzerinden bağla ve analogWrite ile parlaklığını değiştir: LED nefes alsın.',
  starter: () => ({ circuit: unoOnly(), code: PWM_CODE }),
  allowedParts: ['led', 'resistor', 'pot'],
  goals: [
    {
      id: 'd9-direnc-led',
      text: 'D9 pinini bir direnç üzerinden LED’in A (anot) ucuna bağla.',
      hint: 'D9 → direncin 1 ucu, direncin 2 ucu → LED’in A ucu. 330 Ω iyi bir değerdir.',
      check: (c) => partsOf(c.circuit, 'led').some((l) => viaResistor(c, 'D9', l.id, 'A')) && partsOf(c.circuit, 'resistor').length >= 1,
    },
    {
      id: 'katot-gnd',
      text: 'LED’in K (katot) ucunu GND’ye bağla.',
      hint: 'Uno’daki herhangi bir GND pini olur.',
      check: (c) => partsOf(c.circuit, 'led').some((l) => toGnd(c, l.id, 'K')),
    },
    {
      id: 'pwm-uretiyor',
      text: 'Programı çalıştır: D9 hızla açılıp kapansın (PWM). LED’in parlaklığı değişsin.',
      hint: 'Kodda pinMode(9, OUTPUT) yaz, analogWrite(9, değer) kullan (değer 0-255) ve ▶’e bas. digitalWrite yalnız yak/söndür yapar.',
      behavior: true,
      check: (c) => /analogWrite\s*\(/.test(noComments(c.code)) && (c.stats.pinEdges.D9 ?? 0) >= 20,
    },
    {
      id: 'orta-parlaklik',
      text: 'LED bir an yarım parlaklıkta (ne sönük ne tam parlak) yansın.',
      hint: 'Direnci 330 Ω yap. analogWrite(9, 128) yarım doluluk verir; döngüyle 0’dan 255’e artırırsan LED bir an bu aralıktan geçer.',
      behavior: true,
      check: (c) => partsOf(c.circuit, 'led').some((l) => {
        const b = c.lab?.parts[l.id]?.led?.brightness ?? 0
        return b > 0.1 && b < 0.7
      }),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(part('r1', 'resistor', 360, 60, { ohms: 330 }), part('led1', 'led', 480, 60, { color: 'red' }))
    circuit.wires.push(wire(pin('uno', 'D9'), pin('r1', '1')), wire(pin('r1', '2'), pin('led1', 'A')), wire(pin('led1', 'K'), pin('uno', 'GND')))
    return {
      circuit,
      code: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  for (int p = 0; p <= 255; p++) {
    analogWrite(9, p);
    delay(5);
  }
  for (int p = 255; p >= 0; p--) {
    analogWrite(9, p);
    delay(5);
  }
}
`,
    }
  },
  scenario: (s) => s.advance(3000),
}

// ---- Ders 17: RGB LED ----

const RGB_CODE = `// Burayı sen yaz: RGB LED'in üç rengini PWM ile karıştır.
void setup() {
  // 9, 10, 11. pinleri çıkış yap
  Serial.begin(9600);
}

void loop() {
  // analogWrite ile kırmızı (9), yeşil (10), mavi (11) kanallarını ayarla
}
`

const rgb: LabActivity = {
  intro: 'RGB LED’i üç PWM pinine bağla. Renkleri karıştır: iki rengi birlikte yak ve bir kanalı yarım parlaklıkta kullan.',
  starter: () => ({ circuit: unoOnly(), code: RGB_CODE }),
  allowedParts: ['rgbled', 'resistor'],
  goals: [
    {
      id: 'com-gnd',
      text: 'RGB LED’in COM (ortak) ucunu GND’ye bağla.',
      hint: 'Ortak katotlu LED’de COM, GND’ye gider (Ortak uç: Ortak katot).',
      check: (c) => partsOf(c.circuit, 'rgbled').some((l) => toGnd(c, l.id, 'COM')),
    },
    {
      id: 'kirmizi-hat',
      text: 'D9 pinini bir direnç üzerinden RGB LED’in R (kırmızı) ucuna bağla.',
      hint: 'D9 → direnç → R. Pin ile uç arasında mutlaka direnç olsun.',
      check: (c) => partsOf(c.circuit, 'rgbled').some((l) => viaResistor(c, 'D9', l.id, 'R')),
    },
    {
      id: 'yesil-hat',
      text: 'D10 pinini bir direnç üzerinden G (yeşil) ucuna bağla.',
      hint: 'D10 → ikinci direnç → G.',
      check: (c) => partsOf(c.circuit, 'rgbled').some((l) => viaResistor(c, 'D10', l.id, 'G')),
    },
    {
      id: 'mavi-hat',
      text: 'D11 pinini bir direnç üzerinden B (mavi) ucuna bağla.',
      hint: 'D11 → üçüncü direnç → B.',
      check: (c) => partsOf(c.circuit, 'rgbled').some((l) => viaResistor(c, 'D11', l.id, 'B')),
    },
    {
      id: 'iki-renk',
      text: 'Programı çalıştır: iki rengi birlikte yak (ör. kırmızı + yeşil = sarı), üçüncüsü sönük kalsın.',
      hint: 'analogWrite(9, 255); analogWrite(10, 255); analogWrite(11, 0); ya da seri monitöre 255 255 0 gönder.',
      behavior: true,
      check: (c) => rgbAny(c).some((v) => [v.r, v.g, v.b].filter((x) => x > 0.3).length === 2 && [v.r, v.g, v.b].some((x) => x < 0.03)),
    },
    {
      id: 'ara-ton',
      text: 'Bir kanalı yarım parlaklıkta yak (turuncu gibi ara bir renk elde et).',
      hint: 'analogWrite(10, 80) gibi 0 ile 255 arasında bir değer ver. Seri monitöre 255 128 0 de gönderebilirsin.',
      behavior: true,
      check: (c) => rgbAny(c).some((v) => [v.r, v.g, v.b].some((x) => x > 0.08 && x < 0.55) && Math.max(v.r, v.g, v.b) > 0.3),
    },
  ],
  solution: () => ({
    circuit: addRgb(),
    code: `void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    int r = Serial.parseInt();
    int g = Serial.parseInt();
    int b = Serial.parseInt();
    r = constrain(r, 0, 255);
    g = constrain(g, 0, 255);
    b = constrain(b, 0, 255);
    delay(10);
    while (Serial.available() > 0) {
      Serial.read();
    }
    analogWrite(9, r);
    analogWrite(10, g);
    analogWrite(11, b);
    Serial.print("R=");
    Serial.print(r);
    Serial.print(" G=");
    Serial.print(g);
    Serial.print(" B=");
    Serial.println(b);
  }
}
`,
  }),
  scenario: (s) => {
    const gonder = (t: string) => { for (const ch of t) { s.sendSerial(ch); s.advance(3) } }
    s.advance(200)
    gonder('255 128 0\n')
    s.advance(300)
  },
}

// ---- Ders 18: buzzer / tone ----

const BUZZER_CODE = `// Burayı sen yaz: buzzer'dan La (440 Hz) ve bir oktav yukarısını çal.
void setup() {
}

void loop() {
  // tone(8, frekans, süre) ve delay kullan
}
`

const buzzer: LabActivity = {
  intro: 'Pasif buzzer’ı D8’e bağla, tone() ile La notasını (440 Hz) ve bir oktav yukarısını çal. Sesi duymak için üstteki ses düğmesini aç.',
  starter: () => ({ circuit: unoOnly(), code: BUZZER_CODE }),
  allowedParts: ['buzzer'],
  goals: [
    {
      id: 'pasif-buzzer',
      text: 'Tuvale bir pasif buzzer ekle.',
      hint: '"Parça ekle" düğmesinden buzzer seç; özellik panelinde Tür: Pasif olsun.',
      check: (c) => partsOf(c.circuit, 'buzzer').some((b) => (b.props.kind ?? 'passive') === 'passive'),
    },
    {
      id: 'buzzer-d8-gnd',
      text: 'Buzzer’ın + ucunu D8’e, - ucunu GND’ye bağla.',
      hint: 'D8 → buzzer +; buzzer - → GND. Kodda tone(8, ...) yazacaksın.',
      check: (c) => buzzerWired(c),
    },
    {
      id: 'tone-sure',
      text: 'tone komutunu süre parametresiyle kullan (ya da noTone ile sustur).',
      hint: 'tone(8, 440, 400); notayı 400 ms çalıp kendiliğinden susturur.',
      check: (c) => /\btone\s*\(\s*\w+\s*,\s*[\w\[\]]+\s*,\s*[^)]+\)|\bnoTone\s*\(/.test(noComments(c.code)),
    },
    {
      id: 'la-440',
      text: 'Programı çalıştır: buzzer 440 Hz (La) çalsın.',
      hint: 'tone(8, 440, 400); delay(500); yaz ve ▶’e bas. Frekans 440 Hz ± 8 olmalı. Sesi duymak için ses düğmesini aç.',
      behavior: true,
      check: (c) => freqHeard(c, 440, 8),
    },
  ],
  solution: () => ({
    circuit: addBuzzer(),
    code: `void setup() {
}

void loop() {
  tone(8, 440, 400);
  delay(500);
  tone(8, 880, 400);
  delay(500);
}
`,
  }),
  scenario: (s) => s.advance(3200),
}

// ---- Ders 19: fonksiyonlar ----

const FUNC_CODE = `// Burayı sen yaz: bir nota çalan, parametre alan kendi fonksiyonunu yaz
// ve onu loop() içinde çağırarak melodiyi çal.

void setup() {
}

void loop() {
}
`

/** setup/loop dışında, en az bir parametresi olan fonksiyon tanımı. */
const hasParamFunction = (code: string) => /\b(?:void|int|long|float|bool|byte)\s+(?!setup\b|loop\b)[A-Za-z_]\w*\s*\(\s*(?:const\s+)?(?:unsigned\s+)?(?:int|long|float|byte|bool)\s+\w+/.test(noComments(code))

const functions: LabActivity = {
  intro: 'Buzzer’ı D8’e bağla ve notaCal(frekans, sure) gibi parametreli bir fonksiyon yaz. Fonksiyonunla "Küçük yıldız" melodisini çal.',
  starter: () => ({ circuit: unoOnly(), code: FUNC_CODE }),
  allowedParts: ['buzzer'],
  goals: [
    {
      id: 'buzzer-d8-gnd',
      text: 'Pasif buzzer’ı ekle: + ucu D8’e, - ucu GND’ye.',
      hint: 'D8 → buzzer +; buzzer - → GND.',
      check: (c) => buzzerWired(c),
    },
    {
      id: 'parametreli-fonksiyon',
      text: 'Kodda parametre alan kendi fonksiyonunu tanımla (örneğin void notaCal(int frekans, int sure)).',
      hint: 'setup ve loop’un dışında, yan yana yaz: void notaCal(int frekans, int sure) { ... }',
      check: (c) => hasParamFunction(c.code),
    },
    {
      id: 'fonksiyon-cagri',
      text: 'Fonksiyonunu kodda çağır (tanımlamak yetmez, adıyla çağırman gerekir).',
      hint: 'Örneğin loop içinde notaCal(262, 400); yaz ya da melodiyi bir for döngüsünde fonksiyona ver.',
      check: (c) => {
        const code = noComments(c.code)
        const m = code.match(/\b(?:void|int|long|float|bool|byte)\s+(?!setup\b|loop\b)([A-Za-z_]\w*)\s*\(\s*(?:const\s+)?(?:unsigned\s+)?(?:int|long|float|byte|bool)\s+\w+/)
        return !!m && code.split(new RegExp(`\\b${m[1]}\\s*\\(`)).length - 1 >= 2
      },
    },
    {
      id: 'melodi-calar',
      text: 'Programı çalıştır: fonksiyonun buzzer’dan bir nota çaldırsın (ses duyulsun).',
      hint: 'Fonksiyonun içinde tone(8, frekans, süre) ve delay kullan, sonra ▶’e bas. Küçük yıldız Do (262), Do, Sol (392), Sol, La (440)… diye gider.',
      behavior: true,
      check: (c) => Object.values(c.lab?.parts ?? {}).some((p) => p.buzzer?.on && p.buzzer.freqHz >= 200 && p.buzzer.freqHz <= 1000),
    },
  ],
  solution: () => ({
    circuit: addBuzzer(),
    code: `const int BUZZER = 8;
const int NOTA_SAYISI = 14;

int melodi[]  = {262, 262, 392, 392, 440, 440, 392,
                 349, 349, 330, 330, 294, 294, 262};
int uzunluk[] = {1, 1, 1, 1, 1, 1, 2,
                 1, 1, 1, 1, 1, 1, 2};

int vurusSuresi(int bpm) {
  return 60000 / bpm;
}

void notaCal(int frekans, int sure) {
  tone(BUZZER, frekans, sure * 9 / 10);
  delay(sure);
}

void melodiCal(int bpm) {
  int vurus = vurusSuresi(bpm);
  for (int i = 0; i < NOTA_SAYISI; i++) {
    notaCal(melodi[i], uzunluk[i] * vurus);
  }
}

void setup() {
}

void loop() {
  melodiCal(150);
  delay(2000);
}
`,
  }),
  scenario: (s) => s.advance(6000),
}

// ---- Ders 20: proje, ışıklı müzik kutusu ----

const BOX_CODE = `// Burayı sen yaz: butona basınca melodiyi çal, notalara renk ver,
// beklerken mavi LED nefes alsın, tempoyu potansiyometreden oku.
void setup() {
}

void loop() {
}
`

const buttonOnD2 = (c: LabGoalCtx) =>
  partsOf(c.circuit, 'button').some((b) =>
    (c.analysis.sameNet(pin(b.id, 'A'), pin('uno', 'D2')) && toGnd(c, b.id, 'B')) || (c.analysis.sameNet(pin(b.id, 'B'), pin('uno', 'D2')) && toGnd(c, b.id, 'A')))

const musicBox: LabActivity = {
  intro: 'Işıklı müzik kutusunu kur: butona basınca melodi çalsın, her nota renkli yansın, beklerken mavi ışık nefes alsın.',
  starter: () => ({ circuit: unoOnly(), code: BOX_CODE }),
  allowedParts: ['buzzer', 'rgbled', 'resistor', 'button', 'pot'],
  goals: [
    {
      id: 'buzzer',
      text: 'Buzzer’ın + ucunu D8’e, - ucunu GND’ye bağla.',
      hint: 'D8 → buzzer +; buzzer - → GND.',
      check: (c) => buzzerWired(c),
    },
    {
      id: 'rgb',
      text: 'RGB LED’i bağla: D9, D10, D11 birer dirençle R, G, B uçlarına; COM → GND.',
      hint: 'Üç ayrı direnç kullan. Ortak uç özelliği Ortak katot olmalı.',
      check: (c) => rgbWiring(c) && partsOf(c.circuit, 'rgbled').some((l) => toGnd(c, l.id, 'COM')),
    },
    {
      id: 'buton',
      text: 'Butonun bir ucunu D2’ye, öbür ucunu GND’ye bağla.',
      hint: 'Butonun A ucu → D2, B ucu → GND (kodda INPUT_PULLUP kullanacaksın).',
      check: buttonOnD2,
    },
    {
      id: 'pot',
      text: 'Potansiyometreyi bağla: SIG → A0, VCC → 5V, GND → GND.',
      hint: 'Kayar uç (SIG) A0’a gider; tempoyu bu pot belirleyecek.',
      check: (c) => partsOf(c.circuit, 'pot').some((p) =>
        c.analysis.sameNet(pin(p.id, 'SIG'), pin('uno', 'A0')) && c.analysis.sameNet(pin(p.id, 'VCC'), pin('uno', '5V')) && toGnd(c, p.id, 'GND')),
    },
    {
      id: 'nefes',
      text: 'Beklerken mavi LED nefes alsın: D11 PWM ile yavaşça parlayıp sönsün.',
      hint: 'Buton basılı değilken analogWrite(11, parlak) ile mavi kanalı 0-255 arasında artır ve azalt; her adımda kısa bir delay koy.',
      behavior: true,
      check: (c) => /analogWrite\s*\(/.test(noComments(c.code)) && (c.stats.pinEdges.D11 ?? 0) >= 20,
    },
    {
      id: 'melodi-calar',
      text: 'Butona bas: buzzer melodiyi çalsın (ses duyulsun).',
      hint: 'Buton parçasına basılı tut. Kodda digitalRead(2) == LOW ise melodiyi çal.',
      behavior: true,
      check: (c) => Object.values(c.lab?.parts ?? {}).some((p) => p.buzzer?.on && p.buzzer.freqHz > 200),
    },
    {
      id: 'nota-rengi',
      text: 'Nota çalarken RGB LED renkli yansın.',
      hint: 'Her nota için tone’dan önce analogWrite ile bir renk ayarla. Mavi kanal (D11) tone çalarken yalnız 0 ya da 255 olmalı.',
      behavior: true,
      check: (c) => Object.values(c.lab?.parts ?? {}).some((p) => p.buzzer?.on) && rgbAny(c).some((v) => Math.max(v.r, v.g, v.b) > 0.3),
    },
  ],
  solution: () => {
    const circuit = addRgb(addBuzzer())
    circuit.parts.push(part('btn1', 'button', 360, 260, {}), part('pot1', 'pot', 480, 260, { position: 0.5 }))
    circuit.wires.push(
      wire(pin('uno', 'D2'), pin('btn1', 'A')), wire(pin('btn1', 'B'), pin('uno', 'GND2')),
      wire(pin('pot1', 'SIG'), pin('uno', 'A0')), wire(pin('pot1', 'VCC'), pin('uno', '5V')), wire(pin('pot1', 'GND'), pin('uno', 'GND3')),
    )
    return {
      circuit,
      code: `const int BUZZER = 8;
const int KIRMIZI = 9;
const int YESIL = 10;
const int MAVI = 11;
const int BUTON = 2;
const int NOTA_SAYISI = 14;

int melodi[]  = {262, 262, 392, 392, 440, 440, 392,
                 349, 349, 330, 330, 294, 294, 262};
int uzunluk[] = {1, 1, 1, 1, 1, 1, 2,
                 1, 1, 1, 1, 1, 1, 2};

int parlak = 0;
int yon = 5;

void renkAyarla(int r, int g, int b) {
  analogWrite(KIRMIZI, r);
  analogWrite(YESIL, g);
  analogWrite(MAVI, b);
}

void notaRengi(int frekans) {
  switch (frekans) {
    case 262: renkAyarla(255, 0, 0); break;
    case 294: renkAyarla(255, 80, 0); break;
    case 330: renkAyarla(255, 200, 0); break;
    case 349: renkAyarla(0, 255, 0); break;
    case 392: renkAyarla(0, 255, 255); break;
    case 440: renkAyarla(0, 0, 255); break;
    default:  renkAyarla(255, 255, 255);
  }
}

void notaCal(int frekans, int sure) {
  notaRengi(frekans);
  tone(BUZZER, frekans, sure * 9 / 10);
  delay(sure);
  renkAyarla(0, 0, 0);
}

int tempoOku() {
  return map(analogRead(A0), 0, 1023, 80, 200);
}

void melodiCal(int bpm) {
  int vurus = 60000 / bpm;
  for (int i = 0; i < NOTA_SAYISI; i++) {
    notaCal(melodi[i], uzunluk[i] * vurus);
  }
}

void bekleNefesi() {
  parlak = parlak + yon;
  if (parlak >= 255) {
    parlak = 255;
    yon = -5;
  }
  if (parlak <= 0) {
    parlak = 0;
    yon = 5;
  }
  analogWrite(MAVI, parlak);
  delay(10);
}

void setup() {
  pinMode(BUZZER, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(MAVI, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {
    int bpm = tempoOku();
    Serial.print("tempo: ");
    Serial.println(bpm);
    melodiCal(bpm);
  } else {
    bekleNefesi();
  }
}
`,
    }
  },
  scenario: (s) => {
    s.advance(1500)
    s.setProp('btn1', 'pressed', true)
    s.advance(300)
    s.setProp('btn1', 'pressed', false)
    s.advance(770) // melodinin 3. notasının ortası
  },
}

export const M3_H4_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:4:1': pwm,
  'arduino-temelleri:4:2': rgb,
  'arduino-temelleri:4:3': buzzer,
  'arduino-temelleri:4:4': functions,
  'arduino-temelleri:4:5': musicBox,
}

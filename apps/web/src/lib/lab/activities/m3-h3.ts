import type { LabActivity } from '../activity'
import type { LabGoalCtx } from '../goals'
import type { CircuitAnalysis, PinRef } from '../contract'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/* ---------- ortak yardımcılar (bu haftaya özel) ---------- */

type Ctx = Pick<LabGoalCtx, 'circuit' | 'analysis'>

const gndPins = UNO_GNDS.map((g) => pin('uno', g))
const toGnd = (an: CircuitAnalysis, p: PinRef) => gndPins.some((g) => an.sameNet(p, g))

/** İki uçlu parçanın (pin '1' ve '2') uçları verilen iki düğüme, hangi sırayla olursa olsun bağlı mı. */
const spans = (an: CircuitAnalysis, id: string, x: PinRef, y: PinRef) =>
  (an.sameNet(pin(id, '1'), x) && an.sameNet(pin(id, '2'), y)) || (an.sameNet(pin(id, '1'), y) && an.sameNet(pin(id, '2'), x))
const spansGnd = (an: CircuitAnalysis, id: string, x: PinRef) => gndPins.some((g) => spans(an, id, x, g))

const unoPin = (n: string) => pin('uno', n)

/** Üst eleman (LDR/NTC...) 5V ile `analogPin` arasında. */
const topPart = (c: Ctx, type: 'ldr' | 'ntc', analogPin: string) =>
  partsOf(c.circuit, type).some((p) => spans(c.analysis, p.id, unoPin('5V'), unoPin(analogPin)))
/** Alt eleman (LDR/NTC) `analogPin` ile GND arasında. */
const bottomPart = (c: Ctx, type: 'ldr' | 'ntc', analogPin: string) =>
  partsOf(c.circuit, type).some((p) => spansGnd(c.analysis, p.id, unoPin(analogPin)))
const fixedTop = (c: Ctx, analogPin: string, lo: number, hi: number) =>
  partsOf(c.circuit, 'resistor').some((r) => Number(r.props.ohms) >= lo && Number(r.props.ohms) <= hi && spans(c.analysis, r.id, unoPin('5V'), unoPin(analogPin)))
const fixedBottom = (c: Ctx, analogPin: string, lo: number, hi: number) =>
  partsOf(c.circuit, 'resistor').some((r) => Number(r.props.ohms) >= lo && Number(r.props.ohms) <= hi && spansGnd(c.analysis, r.id, unoPin(analogPin)))

/** LDR üstte (5V→A1), sabit direnç altta (A1→GND). */
const ldrDivider = (c: Ctx) => topPart(c, 'ldr', 'A1') && fixedBottom(c, 'A1', 5_000, 20_000)

/** Pot: uçlar 5V ve GND (hangi sırayla olursa), SIG → A0. */
const potPowered = (c: Ctx) =>
  partsOf(c.circuit, 'pot').some((p) => {
    const an = c.analysis
    return (an.sameNet(pin(p.id, 'VCC'), unoPin('5V')) && toGnd(an, pin(p.id, 'GND'))) || (toGnd(an, pin(p.id, 'VCC')) && an.sameNet(pin(p.id, 'GND'), unoPin('5V')))
  })
const potSig = (c: Ctx, a: string) => partsOf(c.circuit, 'pot').some((p) => c.analysis.sameNet(pin(p.id, 'SIG'), unoPin(a)))

/** D<n> → direnç → LED anodu. */
const ledsOn = (c: Ctx, d: string) => partsOf(c.circuit, 'led').filter((l) => c.analysis.connected(unoPin(d), pin(l.id, 'A'), ['resistor']) && !c.analysis.sameNet(unoPin(d), pin(l.id, 'A')))
const ledsToGnd = (c: Ctx, d: string) => ledsOn(c, d).some((l) => toGnd(c.analysis, pin(l.id, 'K')))

/* ---------- seri çıktı yardımcıları ---------- */

/** Tamamlanmış (sonu \n ile biten) satırlar. */
const serialLines = (s: string) => s.split('\n').slice(0, -1).map((l) => l.trim()).filter(Boolean)
const numbersIn = (line: string) => (line.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
const keyed = (s: string, key: string) => [...s.matchAll(new RegExp(key + '=(-?\\d+(?:\\.\\d+)?)', 'g'))].map((m) => Number(m[1]))
const volts = (c: LabGoalCtx, p: string) => c.lab?.pins[p]?.volts ?? 0
/** Son 3 satırdan herhangi birinde, `want` değerine `tol` içinde bir sayı var mı. */
const recentNear = (serial: string, want: number, tol: number) =>
  serialLines(serial).slice(-3).some((l) => numbersIn(l).some((n) => Math.abs(n - want) <= tol))

/** Pin gerilimine karşılık gelen ADC sayısı (laboratuvarın çözücüsüne göre: 5 V → 1023). */
const expectedHam = (v: number) => (v / 5) * 1024
/** 10 kΩ sabit dirençle kurulmuş NTC bölücüsünden (beta = 3950, R0 = 10 kΩ) sıcaklık, °C. */
const ntcTempFromVolts = (v: number) => {
  const r = (10_000 * v) / (5 - v)
  return 1 / (1 / 298.15 + Math.log(r / 10_000) / 3950) - 273.15
}

/* =====================================================================
 * Ders 11: analogRead, ADC ve potansiyometre
 * ===================================================================== */

const POT_CODE = `// Potansiyometreyi oku, seri monitöre yaz ve LED'in parlaklığını onunla ayarla.
void setup() {
  Serial.begin(9600);
  // 11. pini çıkış yap
}

void loop() {
  // int ham = analogRead(A0);
  // ham değerini seri monitöre yaz: Serial.println(ham);
  // analogWrite(11, ham / 4);   // 0-1023 -> 0-255
  delay(100);
}
`

const potLesson: LabActivity = {
  intro: 'Potansiyometreyi A0’a bağla. Okunan sayıyı seri monitöre yaz ve D11’deki LED’in parlaklığını onunla ayarla. Kaydırıcıyı uçtan uca gezdir.',
  starter: () => ({ circuit: unoOnly(), code: POT_CODE }),
  allowedParts: ['pot', 'led', 'resistor'],
  goals: [
    {
      id: 'pot-guc',
      text: 'Potansiyometrenin iki dış ucunu 5V ve GND’ye bağla.',
      hint: 'VCC ucu → Uno 5V, GND ucu → Uno GND.',
      check: (c) => potPowered(c),
    },
    {
      id: 'pot-a0',
      text: 'Potansiyometrenin orta ucunu (SIG) A0’a bağla.',
      hint: 'Orta uç kaydırıcının okuduğu uçtur: SIG → A0.',
      check: (c) => potSig(c, 'A0'),
    },
    {
      id: 'led-d11',
      text: 'D11 pinini bir direnç üzerinden LED’in anoduna (A) bağla.',
      hint: 'D11 → direnç → LED A. D11 parlaklık ayarını (PWM) destekler, D13 desteklemez.',
      check: (c) => ledsOn(c, 'D11').length > 0,
    },
    {
      id: 'led-gnd',
      text: 'LED’in katodunu (K) GND’ye bağla.',
      hint: 'LED’in K ucundan Uno’daki bir GND pinine kablo çek.',
      check: (c) => ledsToGnd(c, 'D11'),
    },
    {
      id: 'seri-ham',
      text: 'Seri monitörde A0’daki gerilimle uyumlu bir sayı (0-1023) görünsün.',
      hint: 'setup’ta Serial.begin(9600), loop’ta analogRead(A0) ve Serial.println yaz. Kaydırıcı ortadayken sayı yaklaşık 512 olur.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const ham = expectedHam(volts(c, 'A0'))
        return ham > 5 && ham < 1018 && recentNear(c.lab.serial, ham, 3)
      },
    },
    {
      id: 'seri-aralik',
      text: 'Kaydırıcıyı en sola ve en sağa getir: sayı 0 civarından 1023 civarına çıksın.',
      hint: 'Pot kaydırıcısını sürükle, seri monitörde en küçük ve en büyük değerleri gör.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const v = serialLines(c.lab.serial).map((l) => numbersIn(l)[0]).filter((n) => Number.isFinite(n))
        return v.length >= 3 && Math.min(...v) <= 40 && Math.max(...v) >= 980
      },
    },
    {
      id: 'led-parlaklik',
      text: 'LED’in parlaklığı kaydırıcıyı izlesin: ortada loş (ne sönük ne tam parlak) yansın.',
      hint: 'analogWrite(11, ham / 4) kullan. Kaydırıcı ortadayken LED yarı parlaklıkta olur.',
      behavior: true,
      check: (c) => ledsOn(c, 'D11').some((l) => {
        const b = c.lab?.parts[l.id]?.led?.brightness ?? 0
        return b > 0.08 && b < 0.85
      }),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('pot1', 'pot', 360, 40, { position: 0.5, ohms: 10_000 }),
      part('r1', 'resistor', 360, 200, { ohms: 330 }),
      part('led1', 'led', 520, 200, { color: 'red' }),
    )
    circuit.wires.push(
      wire(pin('pot1', 'VCC'), pin('uno', '5V')),
      wire(pin('pot1', 'GND'), pin('uno', 'GND')),
      wire(pin('pot1', 'SIG'), pin('uno', 'A0')),
      wire(pin('uno', 'D11'), pin('r1', '1')),
      wire(pin('r1', '2'), pin('led1', 'A')),
      wire(pin('led1', 'K'), pin('uno', 'GND2')),
    )
    return {
      circuit,
      code: `void setup() {
  Serial.begin(9600);
  pinMode(11, OUTPUT);
}

void loop() {
  int ham = analogRead(A0);
  float volt = ham * 5.0 / 1024.0;
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" volt=");
  Serial.println(volt, 2);
  analogWrite(11, ham / 4);
  delay(100);
}
`,
    }
  },
  scenario: (s) => {
    s.setProp('pot1', 'position', 0)
    s.advance(800)
    s.setProp('pot1', 'position', 1)
    s.advance(800)
    s.setProp('pot1', 'position', 0.25)
    s.advance(800)
    // Pot ortada: ham ≈ 512 (laboratuvar çözücüsü, bkz. ders 11 tablosu)
    s.setProp('pot1', 'position', 0.5)
    s.advance(1000)
    const son = serialLines(s.serial).at(-1) ?? ''
    const ham = numbersIn(son)[0]
    if (!(Math.abs(ham - 512) <= 2)) throw new Error('pot ortada ≈512 beklenirdi: ' + son)
  },
}

/* =====================================================================
 * Ders 12: Gerilim bölücü ve LDR
 * ===================================================================== */

const LDR_CODE = `// LDR ile ışığı ölç; karanlık olunca D13'teki LED'i yak (iki eşikli: histerezis).
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  // int ham = analogRead(A1);
  // ham değerini seri monitöre yaz
  // ham < 250 ise LED'i yak, ham > 350 ise söndür (arada dokunma)
  delay(100);
}
`

const ldrLesson: LabActivity = {
  intro: 'LDR ile 10 kΩ direnç bir gerilim bölücü oluşturur. Bölücüyü kur, A1’i seri monitörde izle ve ışık azalınca D13’teki LED’i yaktır. Işık kaydırıcısını oynat.',
  starter: () => ({ circuit: unoOnly(), code: LDR_CODE }),
  allowedParts: ['ldr', 'resistor', 'led'],
  goals: [
    {
      id: 'ldr-ust',
      text: 'LDR’nin bir ucunu 5V’a, öbür ucunu A1’e bağla (bölücünün üst direnci).',
      hint: 'LDR’nin 1 ve 2 uçlarından biri 5V’a, öbürü A1’e gider. Hangisinin hangisi olduğu önemli değil.',
      check: (c) => topPart(c, 'ldr', 'A1'),
    },
    {
      id: 'direnc-alt',
      text: 'A1 ile GND arasına yaklaşık 10 kΩ’luk bir direnç bağla (bölücünün alt direnci).',
      hint: 'Direncin bir ucu A1’e (LDR ile aynı noktaya), öbür ucu GND’ye gider. Direnci seçip değerini özellik panelinden 10000 Ω yap.',
      check: (c) => fixedBottom(c, 'A1', 5_000, 20_000),
    },
    {
      id: 'led-d13',
      text: 'D13 pininden bir direnç üzerinden LED’in anoduna, LED’in katodundan GND’ye bağlantı kur.',
      hint: 'D13 → 330 Ω direnç → LED A; LED K → GND.',
      check: (c) => ledsToGnd(c, 'D13'),
    },
    {
      id: 'seri-ham',
      text: 'Seri monitörde A1’deki gerilimle uyumlu ham değer görünsün.',
      hint: 'loop’ta analogRead(A1) değerini Serial.println ile yaz. Işık kaydırıcısı ortadayken değer yaklaşık 424 olur.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const ham = expectedHam(volts(c, 'A1'))
        return ham > 5 && ham < 1018 && recentNear(c.lab.serial, ham, 3)
      },
    },
    {
      id: 'karanlik-yanar',
      text: 'Işığı azalt (LDR kaydırıcısını sola çek): D13’teki LED yansın.',
      hint: 'ham < 250 iken digitalWrite(13, HIGH). Karanlıkta LDR’nin direnci büyür, A1 gerilimi düşer.',
      behavior: true,
      check: (c) => !!c.lab && volts(c, 'A1') < 1.3 && c.lab.pins.D13?.high === true,
    },
    {
      id: 'yanip-soner',
      text: 'Işığı artırıp azalt: LED yansın, sonra sönsün.',
      hint: 'ham > 350 iken digitalWrite(13, LOW). LED hem yanıp hem sönmeli.',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D13'] ?? 0) >= 2,
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('ldr1', 'ldr', 360, 40, { light: 0.5 }),
      part('r1', 'resistor', 360, 160, { ohms: 10_000 }),
      part('r2', 'resistor', 360, 280, { ohms: 330 }),
      part('led1', 'led', 520, 280, { color: 'red' }),
    )
    circuit.wires.push(
      wire(pin('uno', '5V'), pin('ldr1', '1')),
      wire(pin('ldr1', '2'), pin('uno', 'A1')),
      wire(pin('uno', 'A1'), pin('r1', '1')),
      wire(pin('r1', '2'), pin('uno', 'GND')),
      wire(pin('uno', 'D13'), pin('r2', '1')),
      wire(pin('r2', '2'), pin('led1', 'A')),
      wire(pin('led1', 'K'), pin('uno', 'GND2')),
    )
    return {
      circuit,
      code: `void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  int ham = analogRead(A1);
  float volt = ham * 5.0 / 1024.0;
  float rLdr = 0;
  if (ham > 0) {
    rLdr = 10000.0 * (1024 - ham) / ham;
  }
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" volt=");
  Serial.print(volt, 2);
  Serial.print(" R_ldr=");
  Serial.println(rLdr, 0);
  if (ham < 250) {
    digitalWrite(13, HIGH);
  } else if (ham > 350) {
    digitalWrite(13, LOW);
  }
  delay(100);
}
`,
    }
  },
  scenario: (s) => {
    s.advance(600) // ışık 0,5: A1 ≈ 2,07 V, ham ≈ 424 -> LED sönük
    s.setProp('ldr1', 'light', 0.2) // karanlık (R_ldr ≈ 182 kΩ, A1 ≈ 0,26 V)
    s.advance(800)
    s.setProp('ldr1', 'light', 0.8) // aydınlık (R_ldr ≈ 1,1 kΩ, A1 ≈ 4,5 V)
    s.advance(800)
    s.setProp('ldr1', 'light', 0.2)
    s.advance(800)
  },
}

/* =====================================================================
 * Ders 13: Termistör (NTC) ve sıcaklık hesabı
 * ===================================================================== */

const NTC_CODE = `// NTC'nin direncini ve sıcaklığı hesapla, seri monitöre yaz.
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A2);
  if (ham <= 0 || ham >= 1023) {
    Serial.println("sensor hatasi");
  } else {
    // float r = 10000.0 * ham / (1024.0 - ham);               // NTC direnci
    // float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    // float tC = tK - 273.15;
    // Serial.print("T=");  Serial.println(tC, 1);
  }
  delay(500);
}
`

const ntcLesson: LabActivity = {
  intro: '10 kΩ direnç ve NTC bir bölücü kurar. Bölücüyü kur, beta formülüyle sıcaklığı hesapla ve seri monitörde izle. NTC’nin sıcaklık kaydırıcısını oynat.',
  starter: () => ({ circuit: unoOnly(), code: NTC_CODE }),
  allowedParts: ['ntc', 'resistor'],
  goals: [
    {
      id: 'direnc-ust',
      text: '5V ile A2 arasına 10 kΩ’luk bir direnç bağla (bölücünün üst direnci).',
      hint: 'Direncin bir ucu 5V’a, öbür ucu A2’ye. Değerini özellik panelinden 10000 Ω yap; formüldeki 10000 ile aynı olmalı.',
      check: (c) => fixedTop(c, 'A2', 9_000, 11_000),
    },
    {
      id: 'ntc-alt',
      text: 'NTC’nin bir ucunu A2’ye, öbür ucunu GND’ye bağla (bölücünün alt direnci).',
      hint: 'NTC, 10 kΩ direncin A2’ye bağlandığı noktaya ve GND’ye bağlanır.',
      check: (c) => bottomPart(c, 'ntc', 'A2'),
    },
    {
      id: 'olcum-dogru',
      text: 'Seri monitördeki sıcaklık, NTC’nin gerçek sıcaklığıyla uyuşsun (±1 °C).',
      hint: 'Beta formülünü kullan: R = 10000·ham/(1024−ham), 1/T = 1/298,15 + ln(R/10000)/3950, sonra 273,15 çıkar. Sonucu Serial.println ile yaz.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const v = volts(c, 'A2')
        if (v < 0.1 || v > 4.9) return false
        return recentNear(c.lab.serial, ntcTempFromVolts(v), 1)
      },
    },
    {
      id: 'sicak-soguk',
      text: 'Sıcaklık kaydırıcısını oynat: seri monitörde hem 10 °C’nin altı hem 40 °C’nin üstü bir değer görünsün.',
      hint: 'NTC’yi seçip Sıcaklık değerini önce 0 °C’ye, sonra 45 °C’ye getir. Sıcakta direnç küçülür, A2 gerilimi düşer.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const t = serialLines(c.lab.serial).map((l) => numbersIn(l).at(-1)).filter((n): n is number => n !== undefined && Number.isFinite(n))
        return t.some((x) => x <= 10 && x > -30) && t.some((x) => x >= 40 && x < 130)
      },
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(part('r1', 'resistor', 360, 60, { ohms: 10_000 }), part('ntc1', 'ntc', 360, 200, { tempC: 25 }))
    circuit.wires.push(
      wire(pin('uno', '5V'), pin('r1', '1')),
      wire(pin('r1', '2'), pin('uno', 'A2')),
      wire(pin('uno', 'A2'), pin('ntc1', '1')),
      wire(pin('ntc1', '2'), pin('uno', 'GND')),
    )
    return {
      circuit,
      code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A2);
  if (ham <= 0 || ham >= 1023) {
    Serial.println("sensor hatasi");
  } else {
    float r = 10000.0 * ham / (1024.0 - ham);
    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    float tC = tK - 273.15;
    Serial.print("R=");
    Serial.print(r, 0);
    Serial.print(" T=");
    Serial.println(tC, 1);
  }
  delay(500);
}
`,
    }
  },
  scenario: (s) => {
    const kontrol = (want: number) => {
      const son = serialLines(s.serial).at(-1) ?? ''
      const t = Number(son.match(/T=(-?\d+(?:\.\d+)?)/)?.[1])
      if (!(Math.abs(t - want) <= 0.6)) throw new Error(`T≈${want} bekleniyordu: "${son}"`)
    }
    s.advance(1300)
    kontrol(25) // 10 kΩ NTC, 25 °C: A2 = 2,5 V
    s.setProp('ntc1', 'tempC', 45)
    s.advance(1300)
    kontrol(45)
    s.setProp('ntc1', 'tempC', 0)
    s.advance(1300)
    kontrol(0)
    s.setProp('ntc1', 'tempC', 25)
    s.advance(1300)
    kontrol(25)
  },
}

/* =====================================================================
 * Ders 14: map, constrain, kalibrasyon ve yumuşatma
 * ===================================================================== */

const CALIB_CODE = `// LDR'yi 3 saniye izleyip en küçük ve en büyük değeri bul (kalibrasyon).
// Sonra ışığı 0-100 arası yüzde olarak yaz.
int enAz = 1023;
int enCok = 0;

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);              // kalibrasyon sürüyor
  // 300 tur (her turda delay(10)): A1'i oku, enAz ve enCok'u güncelle
  digitalWrite(13, LOW);               // kalibrasyon bitti
  Serial.print("enAz=");
  Serial.print(enAz);
  Serial.print(" enCok=");
  Serial.println(enCok);
}

void loop() {
  int ham = analogRead(A1);
  int yuzde = 0;   // map ve constrain ile 0-100 arası yap
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" yuzde=");
  Serial.println(yuzde);
  delay(300);
}
`

const calibLesson: LabActivity = {
  intro: 'Program açılınca 3 saniye boyunca LDR’nin en karanlık ve en aydınlık değerini öğrensin (kalibrasyon). Bu sırada ışık kaydırıcısını önce sola, sonra sağa çek. Sonra ışığı yüzde olarak yazsın.',
  starter: () => ({ circuit: unoOnly(), code: CALIB_CODE }),
  allowedParts: ['ldr', 'resistor', 'led'],
  goals: [
    {
      id: 'ldr-bolucu',
      text: 'LDR bölücüsünü kur: 5V → LDR → A1 → 10 kΩ → GND.',
      hint: 'LDR’nin bir ucu 5V’a, öbür ucu A1’e; 10 kΩ direnç A1 ile GND arasında.',
      check: (c) => ldrDivider(c),
    },
    {
      id: 'led-d13',
      text: 'D13 → direnç → LED → GND zincirini kur (kalibrasyon göstergesi).',
      hint: 'D13 → 330 Ω direnç → LED A; LED K → GND.',
      check: (c) => ledsToGnd(c, 'D13'),
    },
    {
      id: 'kalibrasyon-led',
      text: 'Açılışta D13 yansın, kalibrasyon bitince sönsün.',
      hint: 'setup’ın başında digitalWrite(13, HIGH), 3 saniyelik döngüden sonra LOW.',
      behavior: true,
      // D13 açılışta yanık başlar (ilk gözlem), kalibrasyon bitince söner: en az bir geçiş ve şu an sönük.
      check: ({ stats, lab }) => (stats?.pinEdges['D13'] ?? 0) >= 1 && (stats?.runMs ?? 0) >= 2500 && lab?.pins.D13?.high === false,
    },
    {
      id: 'aralik',
      text: 'Kalibrasyonda sensörün gerçek aralığı bulunsun: enAz ile enCok arasında en az 200 fark olsun.',
      hint: 'Kalibrasyon sürerken ışık kaydırıcısını sola ve sağa çek. enAz 1023, enCok 0 ile başlar; her ölçümde güncelle.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const lo = keyed(c.lab.serial, 'enAz').at(-1)
        const hi = keyed(c.lab.serial, 'enCok').at(-1)
        return lo !== undefined && hi !== undefined && lo <= 1023 && hi <= 1023 && hi - lo >= 200
      },
    },
    {
      id: 'yuzde',
      text: 'Işığı en karanlıktan en aydınlığa getir: yüzde 0’dan 100’e çıksın, hiçbir zaman bu aralığın dışına taşmasın.',
      hint: 'map(ham, enAz, enCok, 0, 100) sonra constrain(yuzde, 0, 100). Kalibrasyondan sonra ışığı en uçlara getir.',
      behavior: true,
      check: (c) => {
        if (!c.lab) return false
        const y = keyed(c.lab.serial, 'yuzde')
        return y.length >= 4 && y.every((v) => v >= 0 && v <= 100) && y.includes(0) && y.includes(100)
      },
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('ldr1', 'ldr', 360, 40, { light: 0.5 }),
      part('r1', 'resistor', 360, 160, { ohms: 10_000 }),
      part('r2', 'resistor', 360, 280, { ohms: 330 }),
      part('led1', 'led', 520, 280, { color: 'red' }),
    )
    circuit.wires.push(
      wire(pin('uno', '5V'), pin('ldr1', '1')),
      wire(pin('ldr1', '2'), pin('uno', 'A1')),
      wire(pin('uno', 'A1'), pin('r1', '1')),
      wire(pin('r1', '2'), pin('uno', 'GND')),
      wire(pin('uno', 'D13'), pin('r2', '1')),
      wire(pin('r2', '2'), pin('led1', 'A')),
      wire(pin('led1', 'K'), pin('uno', 'GND2')),
    )
    return {
      circuit,
      code: `int enAz = 1023;
int enCok = 0;

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
  for (int i = 0; i < 300; i++) {
    int ham = analogRead(A1);
    if (ham < enAz) {
      enAz = ham;
    }
    if (ham > enCok) {
      enCok = ham;
    }
    delay(10);
  }
  if (enCok - enAz < 50) {
    enCok = enAz + 50;
  }
  digitalWrite(13, LOW);
  Serial.print("enAz=");
  Serial.print(enAz);
  Serial.print(" enCok=");
  Serial.println(enCok);
}

void loop() {
  int ham = analogRead(A1);
  int yuzde = map(ham, enAz, enCok, 0, 100);
  yuzde = constrain(yuzde, 0, 100);
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" yuzde=");
  Serial.println(yuzde);
  delay(300);
}
`,
    }
  },
  scenario: (s) => {
    // Kalibrasyon (≈3 sn): karanlık (A1 ≈ 0,26 V, ham ≈ 53), aydınlık (A1 ≈ 4,5 V, ham ≈ 920), sonra orta
    s.setProp('ldr1', 'light', 0.2)
    s.advance(1000)
    s.setProp('ldr1', 'light', 0.8)
    s.advance(1000)
    s.setProp('ldr1', 'light', 0.5)
    s.advance(1500)
    // Kalibrasyon sonrası: orta ışık ≈ %40, uçlar 0 ve 100, aralık dışı kırpılır
    s.advance(700)
    s.setProp('ldr1', 'light', 0.2)
    s.advance(700)
    s.setProp('ldr1', 'light', 0.8)
    s.advance(700)
    s.setProp('ldr1', 'light', 0.95)
    s.advance(700)
    s.setProp('ldr1', 'light', 0.05)
    s.advance(700)
    const aralik = s.serial.match(/enAz=(\d+) enCok=(\d+)/)
    if (!aralik) throw new Error('enAz/enCok yazılmadı')
    const lo = Number(aralik[1]), hi = Number(aralik[2])
    // Beklenen: 0,2 ışıkta ham ≈ 53, 0,8 ışıkta ham ≈ 920 (laboratuvar çözücüsü)
    if (Math.abs(lo - 53) > 6 || Math.abs(hi - 920) > 12) throw new Error(`kalibrasyon aralığı beklenenden farklı: ${lo}-${hi}`)
  },
}

/* =====================================================================
 * Ders 15: Proje: Akıllı gece lambası
 * ===================================================================== */

const LAMP_CODE = `// Akıllı gece lambası: LDR + potansiyometre + (isteğe bağlı) NTC uyarısı
const int KARANLIK = 150;       // bunun altı: tam karanlık
const int AYDINLIK = 700;       // bunun üstü: oda aydınlık

void setup() {
  pinMode(11, OUTPUT);   // lamba (PWM)
  Serial.begin(9600);
}

void loop() {
  int enYuksek = analogRead(A0) / 4;   // potansiyometre: en yüksek parlaklık
  int isik = analogRead(A1);           // LDR
  // karanlıkta enYuksek, aydınlıkta 0: map ile hesapla, constrain ile sınırla
  int parlaklik = 0;
  analogWrite(11, parlaklik);
  Serial.print("isik=");
  Serial.print(isik);
  Serial.print(" parlaklik=");
  Serial.println(parlaklik);
  delay(200);
}
`

const lampLeds = (c: LabGoalCtx) => ledsOn(c, 'D11')
const lampBrightness = (c: LabGoalCtx) => Math.max(0, ...lampLeds(c).map((l) => c.lab?.parts[l.id]?.led?.brightness ?? 0))
const lampPairs = (serial: string) =>
  serialLines(serial).map((l) => ({ isik: keyed(l, 'isik')[0], par: keyed(l, 'parlaklik')[0] })).filter((p) => p.isik !== undefined && p.par !== undefined)

const lampLesson: LabActivity = {
  intro: 'Akıllı gece lambası: LDR karardıkça lamba (D11) parlaklaşsın, potansiyometre en yüksek parlaklığı sınırlasın. İstersen NTC ile 40 °C üstünde D13’teki uyarı LED’ini yak ve lambayı kapat (zor görev).',
  starter: () => ({ circuit: unoOnly(), code: LAMP_CODE }),
  allowedParts: ['pot', 'ldr', 'ntc', 'resistor', 'led'],
  goals: [
    {
      id: 'pot',
      text: 'Potansiyometreyi kur: dış uçlar 5V ve GND, orta uç (SIG) A0.',
      hint: 'Pot’un VCC ucu 5V’a, GND ucu GND’ye, SIG ucu A0’a gider.',
      check: (c) => potPowered(c) && potSig(c, 'A0'),
    },
    {
      id: 'ldr-bolucu',
      text: 'LDR bölücüsünü kur: 5V → LDR → A1 → 10 kΩ → GND.',
      hint: 'LDR 5V ile A1 arasında, 10 kΩ direnç A1 ile GND arasında.',
      check: (c) => ldrDivider(c),
    },
    {
      id: 'lamba-led',
      text: 'Lamba LED’ini kur: D11 → direnç → LED anodu, LED katodu → GND.',
      hint: 'D11 → 330 Ω direnç → LED A; LED K → GND. Sarı ya da beyaz LED seçebilirsin.',
      check: (c) => ledsToGnd(c, 'D11'),
    },
    {
      id: 'karanlik-parlak',
      text: 'Potansiyometre sonda, oda karanlıkken lamba parlak yansın.',
      hint: 'Pot kaydırıcısını sona, LDR ışığını sola çek. Karanlıkta parlaklık en yüksek değere gitmeli: map(isik, KARANLIK, AYDINLIK, enYuksek, 0).',
      behavior: true,
      check: (c) => !!c.lab && volts(c, 'A0') > 4.5 && volts(c, 'A1') < 0.9 && lampBrightness(c) >= 0.35,
    },
    {
      id: 'aydinlik-sonuk',
      text: 'Oda aydınlanınca lamba sönsün (parlaklık 0).',
      hint: 'LDR ışığını sağa çek. Işık AYDINLIK değerini aşınca parlaklık 0 olmalı; constrain unutma. Seri monitörde isik= ve parlaklik= yazdır.',
      behavior: true,
      check: (c) => !!c.lab && (c.stats?.pinEdges['D11'] ?? 0) >= 1 && lampPairs(c.lab.serial).some((p) => p.isik >= 700 && p.par === 0),
    },
    {
      id: 'pot-sinirlar',
      text: 'Potansiyometreyi başa yakın bırak: karanlıkta bile lamba sadece loş yansın.',
      hint: 'enYuksek = analogRead(A0) / 4 değerini map’in çıkış üst sınırı yap. Pot küçükse karanlıkta bile parlaklık 20-130 arasında kalır.',
      behavior: true,
      check: (c) => !!c.lab && lampPairs(c.lab.serial).some((p) => p.isik <= 200 && p.par >= 15 && p.par <= 130),
    },
  ],
  solution: () => {
    const circuit = unoOnly()
    circuit.parts.push(
      part('pot1', 'pot', 360, 40, { position: 1, ohms: 10_000 }),
      part('ldr1', 'ldr', 360, 160, { light: 0.5 }),
      part('r1', 'resistor', 360, 280, { ohms: 10_000 }),
      part('ntc1', 'ntc', 360, 400, { tempC: 25 }),
      part('r2', 'resistor', 360, 520, { ohms: 10_000 }),
      part('r3', 'resistor', 560, 160, { ohms: 330 }),
      part('led1', 'led', 720, 160, { color: 'yellow' }),
      part('r4', 'resistor', 560, 320, { ohms: 330 }),
      part('led2', 'led', 720, 320, { color: 'red' }),
    )
    circuit.wires.push(
      wire(pin('pot1', 'VCC'), pin('uno', '5V')),
      wire(pin('pot1', 'GND'), pin('uno', 'GND')),
      wire(pin('pot1', 'SIG'), pin('uno', 'A0')),
      wire(pin('uno', '5V'), pin('ldr1', '1')),
      wire(pin('ldr1', '2'), pin('uno', 'A1')),
      wire(pin('uno', 'A1'), pin('r1', '1')),
      wire(pin('r1', '2'), pin('uno', 'GND')),
      wire(pin('uno', '5V'), pin('r2', '1')),
      wire(pin('r2', '2'), pin('uno', 'A2')),
      wire(pin('uno', 'A2'), pin('ntc1', '1')),
      wire(pin('ntc1', '2'), pin('uno', 'GND')),
      wire(pin('uno', 'D11'), pin('r3', '1')),
      wire(pin('r3', '2'), pin('led1', 'A')),
      wire(pin('led1', 'K'), pin('uno', 'GND2')),
      wire(pin('uno', 'D13'), pin('r4', '1')),
      wire(pin('r4', '2'), pin('led2', 'A')),
      wire(pin('led2', 'K'), pin('uno', 'GND3')),
    )
    return {
      circuit,
      code: `const int KARANLIK = 150;
const int AYDINLIK = 700;
const float SICAK_SINIR = 40.0;

void setup() {
  pinMode(11, OUTPUT);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int enYuksek = analogRead(A0) / 4;

  int toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam = toplam + analogRead(A1);
    delay(3);
  }
  int isik = toplam / 8;

  float sicaklik = -99.0;
  int hamS = analogRead(A2);
  if (hamS > 0 && hamS < 1023) {
    float r = 10000.0 * hamS / (1024.0 - hamS);
    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    sicaklik = tK - 273.15;
  }

  int parlaklik = map(isik, KARANLIK, AYDINLIK, enYuksek, 0);
  parlaklik = constrain(parlaklik, 0, enYuksek);

  if (sicaklik > SICAK_SINIR) {
    parlaklik = 0;
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  analogWrite(11, parlaklik);

  Serial.print("isik=");
  Serial.print(isik);
  Serial.print(" parlaklik=");
  Serial.print(parlaklik);
  Serial.print(" sicaklik=");
  Serial.println(sicaklik, 1);
  delay(200);
}
`,
    }
  },
  scenario: (s) => {
    const son = () => serialLines(s.serial).at(-1) ?? ''
    // Aydınlık oda (A1 ≈ 4,5 V): lamba sönük
    s.setProp('pot1', 'position', 1)
    s.setProp('ldr1', 'light', 0.8)
    s.advance(1200)
    if (keyed(son(), 'parlaklik')[0] !== 0) throw new Error('aydınlıkta parlaklık 0 beklenirdi: ' + son())
    // Pot çeyrekte + karanlık: loş (≈ 63'ü geçmez)
    s.setProp('pot1', 'position', 0.25)
    s.setProp('ldr1', 'light', 0.2)
    s.advance(1200)
    const loş = keyed(son(), 'parlaklik')[0]
    if (!(loş >= 55 && loş <= 70)) throw new Error('çeyrek pot: ≈63 beklenirdi: ' + son())
    // Sıcak oda (45 °C): lamba kapanır, uyarı yanar
    s.setProp('ntc1', 'tempC', 45)
    s.setProp('pot1', 'position', 1)
    s.advance(1200)
    if (keyed(son(), 'parlaklik')[0] !== 0 || Math.abs(keyed(son(), 'sicaklik')[0] - 45) > 1) throw new Error('45 °C: lamba kapalı, sıcaklık ≈45 beklenirdi: ' + son())
    // Oda soğuyunca: pot sonda + karanlık = lamba tam parlak
    s.setProp('ntc1', 'tempC', 25)
    s.advance(1200)
  },
}

export const M3_H3_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:3:1': potLesson,
  'arduino-temelleri:3:2': ldrLesson,
  'arduino-temelleri:3:3': ntcLesson,
  'arduino-temelleri:3:4': calibLesson,
  'arduino-temelleri:3:5': lampLesson,
}

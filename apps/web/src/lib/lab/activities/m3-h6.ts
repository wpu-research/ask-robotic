import type { LabActivity } from '../activity'
import type { Circuit, PartInstance } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 3, hafta 6 laboratuvar etkinlikleri. Anahtar: "arduino-temelleri:6:<ders>" (ders 1 tabanlı konum). */

const noComments = (code: string) => code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
const usesDelay = (code: string) => /\bdelay\s*\(/.test(noComments(code))
const usesMillis = (code: string) => /\bmillis\s*\(/.test(noComments(code))
/** Seri çıktıdaki en büyük tam sayı (sayaç değeri). */
const maxCount = (serial: string | undefined) => Math.max(0, ...((serial ?? '').match(/\d+/g) ?? []).map(Number))

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))

/** Bir LED, bir direnç üzerinden Uno pinine bağlı (A ucu yönünde) mı. */
const ledOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'led').some((l) => ctx.analysis.connected(pin('uno', unoPin), pin(l.id, 'A'), ['resistor']) && !ctx.analysis.sameNet(pin('uno', unoPin), pin(l.id, 'A')))

/** Bir buton bir ucuyla Uno pinine, öbür ucuyla GND'ye bağlı mı. */
const buttonOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'button').some((b) =>
    (ctx.analysis.sameNet(pin(b.id, 'A'), pin('uno', unoPin)) && toGnd(ctx, b.id, 'B')) ||
    (ctx.analysis.sameNet(pin(b.id, 'B'), pin('uno', unoPin)) && toGnd(ctx, b.id, 'A')))

/** Buton basış hareketi (YALNIZ TEST). */
const tikla = (s: { setProp: (id: string, k: string, v: boolean) => void; advance: (ms: number) => void }, id: string, ms: number) => {
  s.setProp(id, 'pressed', true)
  s.advance(ms)
  s.setProp(id, 'pressed', false)
}

const ledWith = (c: Circuit, n: number, unoPin: string, x: number, y: number, color = 'red') => {
  c.parts.push(part(`r${n}`, 'resistor', x, y, { ohms: 330 }), part(`led${n}`, 'led', x + 120, y, { color }))
  c.wires.push(wire(pin('uno', unoPin), pin(`r${n}`, '1')), wire(pin(`r${n}`, '2'), pin(`led${n}`, 'A')), wire(pin(`led${n}`, 'K'), pin('uno', 'GND')))
}
const buttonWith = (c: Circuit, id: string, unoPin: string, x: number, y: number) => {
  c.parts.push(part(id, 'button', x, y))
  c.wires.push(wire(pin('uno', unoPin), pin(id, 'A')), wire(pin(id, 'B'), pin('uno', 'GND')))
}

const partsGoal = (leds: number, buttons: number, extra = false) => ({
  id: 'parcalar',
  text: `Tuvale ${leds} LED, ${leds} direnç${buttons ? ` ve ${buttons} buton` : ''}${extra ? ' ile bir buzzer' : ''} ekle.`.replace('ve 1 buton', 've bir buton'),
  hint: '"Parça ekle" düğmesinden seç.',
  check: ({ circuit }: LabGoalCtx) =>
    partsOf(circuit, 'led').length >= leds && partsOf(circuit, 'resistor').length >= leds && partsOf(circuit, 'button').length >= buttons && (!extra || partsOf(circuit, 'buzzer').length >= 1),
})

// ---------------------------------------------------------------- Ders 26: delay'in tuzağı
const delayTuzagi: LabActivity = {
  intro: 'delay’li programı kur: LED saniyelik yanıp sönerken butona kısa basış kaçar, ancak uzun basış sayılır.',
  starter: () => ({
    circuit: unoOnly(),
    code: `// delay'li program: LED 1 sn yanar, 1 sn söner; turun sonunda butona bakılır.
int sayac = 0;

void setup() {
  // D13 çıkış, D2 INPUT_PULLUP, Serial.begin(9600)
}

void loop() {
  // yak, bekle, söndür, bekle; sonra butona bak
  // basılıysa: sayac++ ve "Basis sayisi: " yazdır
}
`,
  }),
  allowedParts: ['led', 'resistor', 'button'],
  goals: [
    partsGoal(1, 1),
    {
      id: 'led-d13',
      text: 'D13 pinini bir direnç üzerinden LED’in A ucuna bağla; LED’in K ucunu GND’ye bağla.',
      hint: 'D13 → direnç 1, direnç 2 → LED A, LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D13') && partsOf(ctx.circuit, 'led').some((l) => toGnd(ctx, l.id, 'K')),
    },
    {
      id: 'buton-d2',
      text: 'Butonun bir ucunu D2’ye, öbür ucunu GND’ye bağla.',
      hint: 'Buton A → D2, buton B → GND. Kodda pinMode(2, INPUT_PULLUP) kullan.',
      check: (ctx) => buttonOnPin(ctx, 'D2'),
    },
    {
      id: 'yanip-sonuyor',
      text: 'Programı çalıştır: LED yanıp sönsün.',
      hint: 'digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D13'] ?? 0) >= 3,
    },
    {
      id: 'uzun-basis',
      text: 'Butonu 2 saniyeden uzun basılı tut: seri monitörde “Basis sayisi: 1” çıksın.',
      hint: 'Turun sonunda digitalRead(2) == LOW ise sayac++ yap ve Serial.println ile yazdır. Butona kısa basarsan sayılmaz; bunu denemek için önce kısa bas.',
      behavior: true,
      check: ({ lab }) => /Basis sayisi: 1/.test(lab?.serial ?? ''),
    },
  ],
  solution: () => {
    const c = unoOnly()
    ledWith(c, 1, 'D13', 360, 60)
    buttonWith(c, 'btn', 'D2', 360, 200)
    return {
      circuit: c,
      code: `int sayac = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);

  if (digitalRead(2) == LOW) {
    sayac++;
    Serial.print("Basis sayisi: ");
    Serial.println(sayac);
  }
}
`,
    }
  },
  scenario: (s) => {
    s.advance(1200)
    tikla(s, 'btn', 100)       // delay içinde kısa basış: kaçar
    s.advance(900)             // t = 2200
    s.setProp('btn', 'pressed', true)
    s.advance(2500)            // t = 4700: t = 4000'deki kontrol yakalar
    s.setProp('btn', 'pressed', false)
    s.advance(300)
  },
}

// ---------------------------------------------------------------- Ders 27: millis ile bloklamayan kod
const millisBlink: LabActivity = {
  intro: 'millis sürümünü yaz: LED 500 ms’de bir değişirken butonun kısa basışları da kaçmasın. Aynı basışlar delay’li sürümde kaybolurdu.',
  starter: () => ({
    circuit: unoOnly(),
    code: `// millis ile bloklamayan kod: delay kullanma!
unsigned long sonDegisim = 0;
bool ledYanik = false;
bool oncekiBasili = false;
int sayac = 0;

void setup() {
  // D13 çıkış, D2 INPUT_PULLUP, Serial.begin(9600)
}

void loop() {
  // 1) millis() ile LED'i 500 ms'de bir değiştir
  // 2) butonun yeni basışını (kenar) say ve "Basis sayisi: " ile yazdır
}
`,
  }),
  allowedParts: ['led', 'resistor', 'button'],
  goals: [
    partsGoal(1, 1),
    {
      id: 'led-d13',
      text: 'D13 pinini bir direnç üzerinden LED’in A ucuna bağla; LED’in K ucunu GND’ye bağla.',
      hint: 'D13 → direnç 1, direnç 2 → LED A, LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D13') && partsOf(ctx.circuit, 'led').some((l) => toGnd(ctx, l.id, 'K')),
    },
    {
      id: 'buton-d2',
      text: 'Butonun bir ucunu D2’ye, öbür ucunu GND’ye bağla.',
      hint: 'Buton A → D2, buton B → GND.',
      check: (ctx) => buttonOnPin(ctx, 'D2'),
    },
    {
      id: 'delay-yok',
      text: 'Kodda delay kullanma; zamanı millis() ile ölç.',
      hint: 'simdi - sonDegisim >= 500 ise LED’i değiştir ve sonDegisim = simdi yap.',
      check: ({ code }) => usesMillis(code) && !usesDelay(code),
    },
    {
      id: 'led-hizi',
      text: 'LED ritmi bozulmadan yanıp sönsün (yaklaşık 200-1000 ms’de bir değişsin).',
      hint: 'Aralık 500 ms olursa saniyede iki değişim olur. Butona basarken de aynı hızla sürmeli.',
      behavior: true,
      check: ({ stats, circuit }) => {
        const toggles = partsOf(circuit, 'led').reduce((m, l) => Math.max(m, stats?.ledToggles[l.id] ?? 0), 0)
        const ms = stats?.runMs ?? 0
        return toggles >= 6 && ms / toggles >= 200 && ms / toggles <= 1000
      },
    },
    {
      id: 'kisa-basislar',
      text: 'Butona 3 kez kısa kısa bas (yaklaşık 0,1 sn): LED yanıp sönerken sayaç 3’e çıksın.',
      hint: 'Önceki dersteki delay’li program bu kısa basışları kaçırırdı. Kenar algılama: basili && !oncekiBasili.',
      behavior: true,
      check: ({ lab }) => maxCount(lab?.serial) >= 3,
    },
  ],
  solution: () => {
    const c = unoOnly()
    ledWith(c, 1, 'D13', 360, 60)
    buttonWith(c, 'btn', 'D2', 360, 200)
    return {
      circuit: c,
      code: `const unsigned long ARALIK = 500;
unsigned long sonDegisim = 0;
bool ledYanik = false;
bool oncekiBasili = false;
int sayac = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonDegisim >= ARALIK) {
    sonDegisim = simdi;
    ledYanik = !ledYanik;
    digitalWrite(13, ledYanik);
  }

  bool basili = (digitalRead(2) == LOW);
  if (basili && !oncekiBasili) {
    sayac++;
    Serial.print("Basis sayisi: ");
    Serial.println(sayac);
  }
  oncekiBasili = basili;
}
`,
    }
  },
  scenario: (s) => {
    // LED yanıp sönerken (500 ms'de bir) üç kısa basış; delay'li sürüm bunların hiçbirini görmezdi
    s.advance(200)
    tikla(s, 'btn', 100)
    s.advance(900)
    tikla(s, 'btn', 100)
    s.advance(700)
    tikla(s, 'btn', 100)
    s.advance(2500)
  },
}

// ---------------------------------------------------------------- Ders 28: durum makineleri
const trafik: LabActivity = {
  intro: 'Zamanlı trafik ışığı: kırmızı 3 sn, yeşil 3 sn, sarı 1 sn; delay olmadan, bir durum makinesiyle.',
  starter: () => ({
    circuit: unoOnly(),
    code: `// Zamanlı trafik ışığı: enum ile durumlar, switch ile geçişler. delay yok.
enum Durum { KIRMIZI, YESIL, SARI };
Durum durum = KIRMIZI;
unsigned long durumBasi = 0;

void setup() {
  // D13 kırmızı, D12 sarı, D11 yeşil: çıkış yap
}

void loop() {
  unsigned long simdi = millis();
  // switch (durum): her durumda doğru LED'i yak,
  // süre dolunca bir sonraki duruma geç ve durumBasi = simdi yap
}
`,
  }),
  allowedParts: ['led', 'resistor', 'button'],
  goals: [
    partsGoal(3, 0),
    {
      id: 'ledler',
      text: 'Üç LED’i dirençlerle D13 (kırmızı), D12 (sarı), D11 (yeşil) pinlerine bağla.',
      hint: 'Her pin → bir direnç → bir LED’in A ucu.',
      check: (ctx) => ['D13', 'D12', 'D11'].every((p) => ledOnPin(ctx, p)),
    },
    {
      id: 'katotlar',
      text: 'Üç LED’in K uçlarını GND’ye bağla.',
      hint: 'Uno’daki herhangi bir GND pini olur.',
      check: (ctx) => { const l = partsOf(ctx.circuit, 'led'); return l.length >= 3 && l.every((x) => toGnd(ctx, x.id, 'K')) },
    },
    {
      id: 'delay-yok',
      text: 'Kodda delay kullanma; durumu millis() ile yönet.',
      hint: 'Bir durum değişkeni (enum), bir de durumBasi zamanı tut.',
      check: ({ code }) => usesMillis(code) && !usesDelay(code),
    },
    {
      id: 'dongu',
      text: 'Programı en az 8 saniye çalıştır: üç ışık sırayla yansın.',
      hint: 'Kırmızı 3 sn → yeşil 3 sn → sarı 1 sn → kırmızı.',
      behavior: true,
      check: ({ stats }) => (stats?.runMs ?? 0) >= 7500 && ['D13', 'D12', 'D11'].every((p) => (stats?.pinEdges[p] ?? 0) >= 2),
    },
    {
      id: 'tek-isik',
      behavior: true,
      text: 'Her an yalnızca bir ışık yansın.',
      hint: 'Her durumda diğer ikisini LOW yap.',
      check: ({ lab }) => !!lab && ['D13', 'D12', 'D11'].filter((p) => lab.pins[p]?.high).length === 1,
    },
  ],
  solution: () => {
    const c = unoOnly()
    ledWith(c, 1, 'D13', 360, 40, 'red')
    ledWith(c, 2, 'D12', 360, 140, 'yellow')
    ledWith(c, 3, 'D11', 360, 240, 'green')
    return {
      circuit: c,
      code: `enum Durum { KIRMIZI, YESIL, SARI };
Durum durum = KIRMIZI;
unsigned long durumBasi = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  unsigned long simdi = millis();

  switch (durum) {
    case KIRMIZI:
      digitalWrite(13, HIGH); digitalWrite(12, LOW); digitalWrite(11, LOW);
      if (simdi - durumBasi >= 3000) { durum = YESIL; durumBasi = simdi; }
      break;
    case YESIL:
      digitalWrite(13, LOW); digitalWrite(12, LOW); digitalWrite(11, HIGH);
      if (simdi - durumBasi >= 3000) { durum = SARI; durumBasi = simdi; }
      break;
    case SARI:
      digitalWrite(13, LOW); digitalWrite(12, HIGH); digitalWrite(11, LOW);
      if (simdi - durumBasi >= 1000) { durum = KIRMIZI; durumBasi = simdi; }
      break;
  }
}
`,
    }
  },
  // 8 sn çalıştır; durum o anda kırmızı (7-8 sn) olur, tek ışık yanar
  scenario: (s) => { s.advance(7600) },
}

// ---------------------------------------------------------------- Ders 29: kesmeler ve timer'lar
const kesme: LabActivity = {
  intro: 'D2’deki butonla attachInterrupt sayacı kur. Ana program delay(1000) içinde uyurken bile basışlar sayılsın.',
  starter: () => ({
    circuit: unoOnly(),
    code: `// Kesme ile basış sayacı. loop() delay(1000) içinde uyusa da sayar.
volatile unsigned int basisSayisi = 0;
volatile unsigned long sonKesme = 0;

void basildi() {
  // ISR: kısa tut. 50 ms'den sık gelenleri (sıçrama) yok say, sayacı artır
}

void setup() {
  // Serial.begin(9600), D2 INPUT_PULLUP, attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING)
}

void loop() {
  // delay(1000); sayacı noInterrupts()/interrupts() arasında kopyala; "Basis: " yazdır
}
`,
  }),
  allowedParts: ['button'],
  goals: [
    {
      id: 'buton',
      text: 'Tuvale bir buton ekle.',
      hint: '"Parça ekle" düğmesinden buton seç.',
      check: ({ circuit }) => partsOf(circuit, 'button').length >= 1,
    },
    {
      id: 'buton-d2',
      text: 'Butonun bir ucunu D2’ye (INT0), öbür ucunu GND’ye bağla.',
      hint: 'Uno’da dış kesme yalnız D2 ve D3 pinlerinde çalışır. Buton A → D2, buton B → GND.',
      check: (ctx) => buttonOnPin(ctx, 'D2'),
    },
    {
      id: 'kesme-kodu',
      text: 'Kodda attachInterrupt kullan ve loop() içinde delay(1000) bırak.',
      hint: 'attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING); loop içinde delay(1000);',
      check: ({ code }) => /\battachInterrupt\s*\(/.test(noComments(code)) && /\bdelay\s*\(\s*1000\s*\)/.test(noComments(code)),
    },
    {
      id: 'uc-basis',
      text: 'Çalıştırıp 3 kez kısa bas: seri monitörde “Basis: 3” çıksın.',
      hint: 'ISR içinde yalnızca sayacı artır; yazdırmayı loop() içinde yap. Değişkenler volatile olsun.',
      behavior: true,
      check: ({ lab }) => /Basis: 3/.test(lab?.serial ?? ''),
    },
  ],
  solution: () => {
    const c = unoOnly()
    buttonWith(c, 'btn', 'D2', 360, 100)
    return {
      circuit: c,
      code: `volatile unsigned int basisSayisi = 0;
volatile unsigned long sonKesme = 0;

void basildi() {
  unsigned long simdi = millis();
  if (simdi - sonKesme > 50) {
    basisSayisi++;
    sonKesme = simdi;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);
}

void loop() {
  delay(1000);

  noInterrupts();
  unsigned int kopya = basisSayisi;
  interrupts();

  Serial.print("Basis: ");
  Serial.println(kopya);
}
`,
    }
  },
  scenario: (s) => {
    // ana program delay(1000) içindeyken üç kısa basış
    s.advance(100)
    for (let i = 0; i < 3; i++) { tikla(s, 'btn', 20); s.advance(180) }
    s.advance(1500)
  },
}

// ---------------------------------------------------------------- Ders 30: Çoklu görev paneli
const panel: LabActivity = {
  intro: 'Çoklu görev paneli: D13 nabız LED’i, D12 alarm LED’i, D8 buzzer; MOD butonu D2’de (kesme), SUSTUR butonu D3’te. Hiç delay yok.',
  starter: () => ({
    circuit: unoOnly(),
    code: `// Çoklu görev paneli: millis + durum makinesi + kesme. delay yok.
enum Mod { BEKLE, CALISIR, ALARM };
Mod mod = BEKLE;

volatile bool modIstegi = false;
volatile unsigned long sonKesme = 0;

void modTusu() {
  // ISR: kısa tut; bayrak kaldır (50 ms sıçrama koruması)
}

void setup() {
  // pinler, MOD butonu için attachInterrupt (D2)
}

void loop() {
  // 1) modIstegi geldiyse sıradaki moda geç
  // 2) ALARM'dan SUSTUR (D3) ya da 5 sn dolunca BEKLE'ye dön
  // 3) nabız LED'i, 4) alarm LED'i, 5) zamanlı buzzer
}
`,
  }),
  allowedParts: ['led', 'resistor', 'button', 'buzzer'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale 2 LED, 2 direnç, 2 buton ve bir buzzer ekle; buzzer türünü Pasif yap.',
      hint: 'Pasif buzzer tone() ile istediğin frekansta çalar.',
      check: ({ circuit }) =>
        partsOf(circuit, 'led').length >= 2 && partsOf(circuit, 'resistor').length >= 2 && partsOf(circuit, 'button').length >= 2 &&
        partsOf(circuit, 'buzzer').some((b) => b.props.kind !== 'active'),
    },
    {
      id: 'ledler',
      text: 'D13’ü ve D12’yi birer direnç üzerinden LED’lere bağla; LED’lerin K uçlarını GND’ye bağla.',
      hint: 'D13 → direnç → LED 1 A; D12 → direnç → LED 2 A; iki K ucu GND.',
      check: (ctx) => ledOnPin(ctx, 'D13') && ledOnPin(ctx, 'D12') && partsOf(ctx.circuit, 'led').every((l) => toGnd(ctx, l.id, 'K')),
    },
    {
      id: 'buzzer-d8',
      text: 'Buzzer’ın + ucunu D8’e, - ucunu GND’ye bağla.',
      hint: 'D8 → buzzer +, buzzer - → GND.',
      check: (ctx) => partsOf(ctx.circuit, 'buzzer').some((b) => ctx.analysis.sameNet(pin(b.id, '+'), pin('uno', 'D8')) && toGnd(ctx, b.id, '-')),
    },
    {
      id: 'butonlar',
      text: 'MOD butonunu D2’ye, SUSTUR butonunu D3’e bağla (öbür uçlar GND).',
      hint: 'Kesme yalnız D2 ve D3 pinlerinde çalışır. Her butonun bir ucu pin, öbür ucu GND.',
      check: (ctx) => buttonOnPin(ctx, 'D2') && buttonOnPin(ctx, 'D3'),
    },
    {
      id: 'nabiz-buzzer',
      text: 'Çalıştır: D13 nabız LED’i yanıp sönsün; MOD butonuyla CALISIR’a geçince buzzer bip çalsın.',
      hint: 'CALISIR modunda 2 sn’de bir 100 ms’lik 1 kHz bip. İlk bip için yaklaşık 2 sn bekle.',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D13'] ?? 0) >= 6 && (stats?.pinEdges['D8'] ?? 0) >= 4,
    },
    {
      id: 'alarm',
      text: 'MOD butonuna ikinci kez bas: ALARM’da D12 LED’i yansın, sonra SUSTUR (D3) ya da 5 saniye ile sönsün.',
      hint: 'ALARM modunda D12 HIGH. SUSTUR basılınca ya da 5 sn dolunca modGec(BEKLE).',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D12'] ?? 0) >= 2,
    },
  ],
  solution: () => {
    const c = unoOnly()
    ledWith(c, 1, 'D13', 360, 40, 'green')
    ledWith(c, 2, 'D12', 360, 140, 'red')
    c.parts.push(part('bz', 'buzzer', 360, 240, { kind: 'passive' }))
    c.wires.push(wire(pin('uno', 'D8'), pin('bz', '+')), wire(pin('bz', '-'), pin('uno', 'GND')))
    buttonWith(c, 'mod', 'D2', 360, 320)
    buttonWith(c, 'sustur', 'D3', 360, 400)
    return {
      circuit: c,
      code: `const int LED_NABIZ = 13;
const int LED_ALARM = 12;
const int BUZZER = 8;
const int BTN_SUSTUR = 3;

enum Mod { BEKLE, CALISIR, ALARM };
Mod mod = BEKLE;

volatile bool modIstegi = false;
volatile unsigned long sonKesme = 0;

unsigned long ledZaman = 0;
unsigned long buzzerZaman = 0;
unsigned long modBasi = 0;
bool ledYanik = false;
bool buzzerAcik = false;

void modTusu() {
  unsigned long simdi = millis();
  if (simdi - sonKesme > 50) {
    modIstegi = true;
    sonKesme = simdi;
  }
}

void modGec(int yeni) {
  mod = (Mod)yeni;
  modBasi = millis();
  ledZaman = modBasi;
  buzzerZaman = modBasi;
  ledYanik = false;
  buzzerAcik = false;
  digitalWrite(LED_NABIZ, LOW);
  noTone(BUZZER);
}

void buzzerYonet(unsigned long simdi, unsigned long acikSure,
                 unsigned long kapaliSure, int frekans) {
  if (buzzerAcik) {
    if (simdi - buzzerZaman >= acikSure) {
      noTone(BUZZER);
      buzzerAcik = false;
      buzzerZaman = simdi;
    }
  } else if (simdi - buzzerZaman >= kapaliSure) {
    tone(BUZZER, frekans);
    buzzerAcik = true;
    buzzerZaman = simdi;
  }
}

void setup() {
  pinMode(LED_NABIZ, OUTPUT);
  pinMode(LED_ALARM, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(BTN_SUSTUR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), modTusu, FALLING);
}

void loop() {
  unsigned long simdi = millis();

  if (modIstegi) {
    modIstegi = false;
    modGec((mod + 1) % 3);
  }

  if (mod == ALARM) {
    if (digitalRead(BTN_SUSTUR) == LOW || simdi - modBasi >= 5000) {
      modGec(BEKLE);
    }
  }

  unsigned long aralik = 1000;
  if (mod == CALISIR) aralik = 250;
  if (mod == ALARM) aralik = 100;
  if (simdi - ledZaman >= aralik) {
    ledZaman = simdi;
    ledYanik = !ledYanik;
    digitalWrite(LED_NABIZ, ledYanik);
  }

  digitalWrite(LED_ALARM, mod == ALARM ? HIGH : LOW);

  switch (mod) {
    case BEKLE:
      break;
    case CALISIR:
      buzzerYonet(simdi, 100, 1900, 1000);
      break;
    case ALARM:
      buzzerYonet(simdi, 200, 200, 2000);
      break;
  }
}
`,
    }
  },
  scenario: (s) => {
    s.advance(3100)              // BEKLE: 0,5 Hz nabız
    tikla(s, 'mod', 60)          // CALISIR
    s.advance(4000)              // ~2 bip
    tikla(s, 'mod', 60)          // ALARM
    s.advance(1500)
    tikla(s, 'sustur', 60)       // BEKLE
    s.advance(1000)
  },
}

export const M3_H6_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:6:1': delayTuzagi,
  'arduino-temelleri:6:2': millisBlink,
  'arduino-temelleri:6:3': trafik,
  'arduino-temelleri:6:4': kesme,
  'arduino-temelleri:6:5': panel,
}

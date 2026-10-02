import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 3, hafta 7 laboratuvar etkinlikleri. Anahtar: "arduino-temelleri:7:<ders>" (ders 1 tabanlı konum). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)

/** Çalışan benzetimde bir ekranın (lcd1602 / lcdI2c) satırları. */
const lcdLines = (ctx: LabGoalCtx, type: 'lcd1602' | 'lcdI2c'): string[][] =>
  partsOf(ctx.circuit, type).map((p) => ctx.lab?.parts[p.id]?.lcd?.lines ?? [])

/** Bir parçayı sıradaki konuma koyup kablolayan yardımcılar (çözümler için). */
const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))

// ---------------------------------------------------------------- Ders 31: 7-segment ve 74HC595
const SEG_PINS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const
const Q_PINS = ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG'] as const

const segmentCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('u1', 'sr595', 360, 40), part('seg', 'sevenseg', 700, 120, { common: 'cathode' }))
  SEG_PINS.forEach((s, i) => c.parts.push(part(`r${s}`, 'resistor', 520, 40 + i * 50, { ohms: 330 })))
  w(c, ['u1', 'VCC'], ['uno', '5V']); w(c, ['u1', 'SRCLR'], ['uno', '5V'])
  w(c, ['u1', 'GND'], ['uno', 'GND']); w(c, ['u1', 'OE'], ['uno', 'GND2'])
  w(c, ['u1', 'SER'], ['uno', 'D4']); w(c, ['u1', 'RCLK'], ['uno', 'D5']); w(c, ['u1', 'SRCLK'], ['uno', 'D6'])
  SEG_PINS.forEach((s, i) => { w(c, ['u1', Q_PINS[i]], [`r${s}`, '1']); w(c, [`r${s}`, '2'], ['seg', s]) })
  w(c, ['seg', 'COM'], ['uno', 'GND3'])
  return c
}

const SEGMENT_CODE = `// 74HC595 ile 7-segment ekranda 0'dan 9'a say.
const int VERI = 4;    // SER
const int MANDAL = 5;  // RCLK
const int SAAT = 6;    // SRCLK

// 0'dan 9'a rakam desenleri (bit 0 = a ... bit 6 = g)
const byte RAKAM[10] = {
  0x3F, 0x06, 0x5B, 0x4F, 0x66,
  0x6D, 0x7D, 0x07, 0x7F, 0x6F
};

void setup() {
  // üç pini çıkış yap
}

void loop() {
  // her rakam için: mandalı LOW yap, shiftOut ile deseni gönder, mandalı HIGH yap, 1 sn bekle
}
`

const yediSegment: LabActivity = {
  intro: '74HC595 kaydırmalı yazmacı ve 7-segment ekranı laboratuvarda kur; yalnızca üç pinle ekranda 0’dan 9’a say.',
  starter: () => ({ circuit: unoOnly(), code: SEGMENT_CODE }),
  allowedParts: ['sr595', 'sevenseg', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir 74HC595, bir 7-segment ekran ve yedi direnç ekle.',
      hint: '"Parça ekle" menüsünden 74HC595’i, 7-segment ekranı ve direnci (yedi kez) seç.',
      check: ({ circuit }) => partsOf(circuit, 'sr595').length >= 1 && partsOf(circuit, 'sevenseg').length >= 1 && partsOf(circuit, 'resistor').length >= 7,
    },
    {
      id: 'besleme',
      text: '74HC595’te VCC ve SRCLR’yi 5V’a, GND ve OE’yi GND’ye bağla.',
      hint: 'SRCLR boş ya da GND’de olursa yazmaç sürekli temizlenir, OE boş ya da 5V’ta olursa çıkışlar kapalı kalır.',
      check: (ctx) => partsOf(ctx.circuit, 'sr595').some((u) => to5V(ctx, u.id, 'VCC') && to5V(ctx, u.id, 'SRCLR') && toGnd(ctx, u.id, 'GND') && toGnd(ctx, u.id, 'OE')),
    },
    {
      id: 'sinyal',
      text: 'SER’i D4’e, RCLK’yı D5’e, SRCLK’yı D6’ya bağla.',
      hint: 'SER veri, SRCLK saat, RCLK mandal pinidir. Koddaki sabitlerle aynı pinler olmalı.',
      check: (ctx) => partsOf(ctx.circuit, 'sr595').some((u) => toUno(ctx, u.id, 'SER', 'D4') && toUno(ctx, u.id, 'RCLK', 'D5') && toUno(ctx, u.id, 'SRCLK', 'D6')),
    },
    {
      id: 'cikislar',
      text: 'QA’dan QG’ye her çıkışı bir direnç üzerinden ekranın a’dan g’ye karşılık gelen çubuğuna bağla.',
      hint: 'QA → direnç → a, QB → direnç → b, ... QG → direnç → g. Her çubuğun kendi direnci olsun.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'sr595').some((u) =>
          partsOf(ctx.circuit, 'sevenseg').some((s) =>
            SEG_PINS.every((seg, i) => viaResistor(ctx, pin(u.id, Q_PINS[i]), pin(s.id, seg))))),
    },
    {
      id: 'ortak-uc',
      text: '7-segment ekranın COM (ortak katot) ucunu GND’ye bağla.',
      hint: 'Ortak katotlu ekranda COM toprağa gider. Ekranın "Ortak uç" özelliği "Ortak katot" olmalı.',
      check: (ctx) => partsOf(ctx.circuit, 'sevenseg').some((s) => s.props.common !== 'anode' && toGnd(ctx, s.id, 'COM')),
    },
    {
      id: 'rakam-gorunur',
      text: 'Programı çalıştır: ekranda bir rakam görünsün.',
      hint: 'Kodda üç pini çıkış yap, mandalı LOW yapıp shiftOut ile deseni gönder, sonra mandalı HIGH yap. ▶’e bas.',
      behavior: true,
      check: ({ circuit, lab }) =>
        partsOf(circuit, 'sevenseg').some((s) => {
          const g = lab?.parts[s.id]?.sevenseg?.segments
          return !!g && SEG_PINS.filter((k) => g[k] > 0.3).length >= 2
        }),
    },
    {
      id: 'bir-rakami',
      text: 'Sayım 1’e gelince ekranda yalnız b ve c çubukları yansın (1 rakamı).',
      hint: '1 rakamının deseni 0x06’dır (b ve c). Rakamları sırayla göster, her birinde delay(1000) bekle; 0’dan sonra 1 görünmeli.',
      behavior: true,
      check: ({ circuit, lab }) =>
        partsOf(circuit, 'sevenseg').some((s) => {
          const g = lab?.parts[s.id]?.sevenseg?.segments
          return !!g && g.b > 0.3 && g.c > 0.3 && (['a', 'd', 'e', 'f', 'g'] as const).every((k) => g[k] < 0.05)
        }),
    },
  ],
  solution: () => ({
    circuit: segmentCircuit(),
    code: `const int VERI = 4;    // DS
const int MANDAL = 5;  // ST_CP
const int SAAT = 6;    // SH_CP

// 0'dan 9'a rakam desenleri (bit 0 = a ... bit 6 = g)
const byte RAKAM[10] = {
  0x3F, 0x06, 0x5B, 0x4F, 0x66,
  0x6D, 0x7D, 0x07, 0x7F, 0x6F
};

void yaz(byte desen) {
  digitalWrite(MANDAL, LOW);                 // mandalı aç: çıkışlar sabit kalsın
  shiftOut(VERI, SAAT, MSBFIRST, desen);     // 8 biti sırayla kaydır
  digitalWrite(MANDAL, HIGH);                // mandalı kapat: çıkışlar bir anda güncellenir
}

void setup() {
  pinMode(VERI, OUTPUT);
  pinMode(MANDAL, OUTPUT);
  pinMode(SAAT, OUTPUT);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    yaz(RAKAM[i]);
    delay(1000);
  }
}
`,
  }),
  // 0 (ilk sn), sonra 1 gösterilirken bitir.
  scenario: (s) => s.advance(1500),
}

// ---------------------------------------------------------------- Ders 32: LCD 16x2
const lcdCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('lcd', 'lcd1602', 460, 40), part('pot', 'pot', 360, 360, { position: 0.2 }), part('rbl', 'resistor', 360, 300, { ohms: 220 }))
  w(c, ['lcd', 'VSS'], ['uno', 'GND']); w(c, ['lcd', 'VDD'], ['uno', '5V']); w(c, ['lcd', 'RW'], ['uno', 'GND2'])
  w(c, ['lcd', 'K'], ['uno', 'GND3']); w(c, ['lcd', 'A'], ['rbl', '1']); w(c, ['rbl', '2'], ['uno', '5V'])
  w(c, ['lcd', 'V0'], ['pot', 'SIG']); w(c, ['pot', 'VCC'], ['uno', '5V']); w(c, ['pot', 'GND'], ['uno', 'GND2'])
  w(c, ['lcd', 'RS'], ['uno', 'D12']); w(c, ['lcd', 'E'], ['uno', 'D11'])
  w(c, ['lcd', 'D4'], ['uno', 'D5']); w(c, ['lcd', 'D5'], ['uno', 'D4']); w(c, ['lcd', 'D6'], ['uno', 'D3']); w(c, ['lcd', 'D7'], ['uno', 'D2'])
  return c
}

const LCD_CODE = `#include <LiquidCrystal.h>

// Sıra: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  // ekranı başlat (16 sütun, 2 satır)
  // üst satıra bir yazı yaz
  // imleci alt satırın başına götür ve bir yazı yaz
}

void loop() {
}
`

const lcd16x2: LabActivity = {
  intro: '16x2 LCD’yi 4 bitlik kipte kur: güç, arka ışık, kontrast ve altı sinyal kablosunu bağla, sonra iki satıra yazı yazdır. Ekran boş kalırsa kontrast potansiyometresinin konumunu düşür.',
  starter: () => ({ circuit: unoOnly(), code: LCD_CODE }),
  allowedParts: ['lcd1602', 'pot', 'resistor'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir 16x2 LCD, bir potansiyometre ve bir direnç ekle.',
      hint: '"Parça ekle" menüsünden LCD’yi, potansiyometreyi ve direnci seç.',
      check: ({ circuit }) => partsOf(circuit, 'lcd1602').length >= 1 && partsOf(circuit, 'pot').length >= 1 && partsOf(circuit, 'resistor').length >= 1,
    },
    {
      id: 'guc',
      text: 'LCD’nin VDD ucunu 5V’a; VSS ve RW uçlarını GND’ye bağla.',
      hint: 'Yazı görünmesi için VDD en az 4 V olmalı, VSS ve RW toprağa bağlı olmalı (RW’yi unutma).',
      check: (ctx) => partsOf(ctx.circuit, 'lcd1602').some((l) => to5V(ctx, l.id, 'VDD') && toGnd(ctx, l.id, 'VSS') && toGnd(ctx, l.id, 'RW')),
    },
    {
      id: 'arka-isik',
      text: 'Arka ışığı bağla: A ucu bir direnç üzerinden 5V’a, K ucu GND’ye.',
      hint: 'A → 220 Ω direnç → 5V; K → GND. Arka ışığın yanması için akım 1 mA’den fazla olmalı.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'lcd1602').some((l) => viaResistor(ctx, pin(l.id, 'A'), pin('uno', '5V')) && toGnd(ctx, l.id, 'K')),
    },
    {
      id: 'kontrast',
      text: 'Kontrast için LCD’nin V0 ucunu potansiyometrenin SIG ucuna bağla; potansiyometrenin VCC ucu 5V’a, GND ucu GND’ye gitsin.',
      hint: 'V0 → pot SIG, pot VCC → 5V, pot GND → GND.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'lcd1602').some((l) =>
          partsOf(ctx.circuit, 'pot').some((p) => ctx.analysis.sameNet(pin(l.id, 'V0'), pin(p.id, 'SIG')) && to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND'))),
    },
    {
      id: 'veri',
      text: 'RS’yi D12’ye, E’yi D11’e; D4, D5, D6 ve D7’yi sırasıyla D5, D4, D3 ve D2’ye bağla.',
      hint: 'Koddaki LiquidCrystal lcd(12, 11, 5, 4, 3, 2) sırası RS, E, D4, D5, D6, D7’dir. Kablolar kodla aynı olmalı.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'lcd1602').some((l) =>
          ([['RS', 'D12'], ['E', 'D11'], ['D4', 'D5'], ['D5', 'D4'], ['D6', 'D3'], ['D7', 'D2']] as const).every(([p, u]) => toUno(ctx, l.id, p, u))),
    },
    {
      id: 'ust-satir',
      text: 'Programı çalıştır: LCD’nin üst satırında yazı görünsün.',
      hint: 'setup() içinde lcd.begin(16, 2); ve lcd.print("..."); yaz. Ekran boşsa potansiyometreyi seçip Konum değerini 0,3’ün altına indir (V0 yaklaşık 1,6 V’u geçerse ekran boş kalır).',
      behavior: true,
      check: (ctx) => lcdLines(ctx, 'lcd1602').some((l) => (l[0] ?? '').trim().length > 0),
    },
    {
      id: 'alt-satir',
      text: 'Alt satıra da bir yazı yazdır.',
      hint: 'lcd.setCursor(0, 1); ile imleci alt satırın başına götür, sonra lcd.print(...) kullan.',
      behavior: true,
      check: (ctx) => lcdLines(ctx, 'lcd1602').some((l) => (l[1] ?? '').trim().length > 0),
    },
  ],
  solution: () => ({
    circuit: lcdCircuit(),
    code: `#include <LiquidCrystal.h>

// Sıra: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  lcd.begin(16, 2);          // 16 sütun, 2 satır
  lcd.print("Merhaba!");     // 1. satır, 1. sütundan başlar
  lcd.setCursor(0, 1);       // sütun 0, satır 1 (alt satır)
  lcd.print("Saniye:");
}

void loop() {
  lcd.setCursor(8, 1);               // sayıyı sabit yere yaz
  lcd.print(millis() / 1000);
}
`,
  }),
  scenario: (s) => s.advance(1500),
}

// ---------------------------------------------------------------- Ders 33: I2C ve Wire
const i2cCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('lcd', 'lcdI2c', 460, 60, { address: '0x27' }))
  w(c, ['lcd', 'GND'], ['uno', 'GND']); w(c, ['lcd', 'VCC'], ['uno', '5V']); w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  return c
}

const I2C_CODE = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Önce LCD’nin sağ paneldeki I2C adresine bak, sonra nesneyi oluştur: adres, sütun, satır.

void setup() {
  // ekranı başlat, arka ışığı aç
  // üst satıra ve alt satıra birer yazı yaz
}

void loop() {
}
`

const i2cLcd: LabActivity = {
  intro: 'I2C LCD yalnız dört kabloyla bağlanır. Bağla, adresini kodda doğru yaz ve iki satıra yazı yazdır. Yazı, lcd.init() içindeki bekleme yüzünden ▶’ten yaklaşık 1,5 saniye sonra görünür.',
  starter: () => ({ circuit: unoOnly(), code: I2C_CODE }),
  allowedParts: ['lcdI2c'],
  goals: [
    {
      id: 'parca',
      text: 'Tuvale bir I2C LCD ekle.',
      hint: '"Parça ekle" menüsünden I2C LCD’yi seç.',
      check: ({ circuit }) => partsOf(circuit, 'lcdI2c').length >= 1,
    },
    {
      id: 'guc',
      text: 'I2C LCD’nin VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme eksikse ekran cevap vermez ve "beslenmemiş" uyarısı çıkar.',
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => to5V(ctx, l.id, 'VCC') && toGnd(ctx, l.id, 'GND')),
    },
    {
      id: 'hat',
      text: 'SDA ucunu A4’e, SCL ucunu A5’e bağla.',
      hint: 'Uno’nun I2C pinleri A4 (SDA) ve A5 (SCL)’tir. Ters bağlarsan ekran bulunmaz.',
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => toUno(ctx, l.id, 'SDA', 'A4') && toUno(ctx, l.id, 'SCL', 'A5')),
    },
    {
      id: 'adres',
      text: 'Kodda LiquidCrystal_I2C nesnesinin adresi, LCD’nin I2C adresi özelliğiyle aynı olsun.',
      hint: 'LCD’yi seç, sağ panelde I2C adresine bak (0x27 ya da 0x3F). Aynısını LiquidCrystal_I2C lcd(0x27, 16, 2); içine yaz.',
      check: ({ circuit, code }) => {
        const m = noComments(code).match(/LiquidCrystal_I2C\s+\w+\s*\(\s*(0[xX][0-9a-fA-F]+)\s*,/)
        return !!m && partsOf(circuit, 'lcdI2c').some((l) => Number(l.props.address ?? '0x27') === Number(m[1]))
      },
    },
    {
      id: 'arka-isik',
      text: 'Programı çalıştır: ekran açılsın ve arka ışığı yansın.',
      hint: 'setup() içinde lcd.init(); ve lcd.backlight(); çağır. ▶’ten sonra yaklaşık 1,5 saniye bekle.',
      behavior: true,
      check: ({ circuit, lab }) => partsOf(circuit, 'lcdI2c').some((l) => lab?.parts[l.id]?.lcd?.poweredOn === true && lab.parts[l.id].lcd?.backlight === true),
    },
    {
      id: 'ust-satir',
      text: 'LCD’nin üst satırında yazı görünsün.',
      hint: 'lcd.setCursor(0, 0); lcd.print("..."); Yazı görünmüyorsa adresi ve SDA/SCL kablolarını kontrol et.',
      behavior: true,
      check: (ctx) => lcdLines(ctx, 'lcdI2c').some((l) => (l[0] ?? '').trim().length > 0),
    },
    {
      id: 'alt-satir',
      text: 'Alt satıra da bir yazı yazdır.',
      hint: 'lcd.setCursor(0, 1); lcd.print("...");',
      behavior: true,
      check: (ctx) => lcdLines(ctx, 'lcdI2c').some((l) => (l[1] ?? '').trim().length > 0),
    },
  ],
  solution: () => ({
    circuit: i2cCircuit(),
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // adres, sütun, satır

void setup() {
  lcd.init();             // ekranı başlat
  lcd.backlight();        // arka ışığı aç
  lcd.setCursor(0, 0);
  lcd.print("I2C ile merhaba");
  lcd.setCursor(0, 1);
  lcd.print("Adres: 0x27");
}

void loop() {
}
`,
  }),
  scenario: (s) => s.advance(2500),
}

// ---------------------------------------------------------------- Ders 34: EEPROM, String ve SRAM (devresiz)
const EEPROM_CODE = `#include <EEPROM.h>

const int ADRES = 0;   // hedef sıcaklığın EEPROM adresi

void setup() {
  Serial.begin(9600);
  // 1) EEPROM’dan oku
  // 2) hücre boşsa (255) varsayılan 22 kullan
  // 3) "hedef=22" biçiminde seri monitöre yazdır
  // 4) hücre dolu idiyse ayrıca "kayitli deger okundu" yazdır
  // 5) değeri update ile geri kaydet
}

void loop() {
}
`

const eeprom: LabActivity = {
  intro: 'Devre yok: yalnız Uno ve kod. Hedef sıcaklığı EEPROM’dan oku, boşsa (255) varsayılan 22 kullan, seri monitöre yazdır ve update ile kaydet. İlk çalıştırmada EEPROM boştur (255). ■ ile durdurup yeniden ▶’e basman güç kesip yeniden vermek gibidir: EEPROM içeriği korunur. ↺ Sıfırla EEPROM’u da boşaltır.',
  starter: () => ({ circuit: unoOnly(), code: EEPROM_CODE }),
  allowedParts: [],
  goals: [
    {
      id: 'oku',
      text: 'Kodda EEPROM kütüphanesini ekle ve EEPROM.read ile 0. adresi oku.',
      hint: '#include <EEPROM.h> yaz, sonra int hedef = EEPROM.read(ADRES); kullan.',
      check: ({ code }) => /#include\s*<EEPROM\.h>/.test(noComments(code)) && /EEPROM\.read\s*\(/.test(noComments(code)),
    },
    {
      id: 'bos-kontrol',
      text: 'Okunan değer 255 ise (boş hücre) varsayılan 22 kullan.',
      hint: 'if (hedef == 255) hedef = 22; Boş EEPROM hücresi 0 değil 255 verir.',
      check: ({ code }) => /255/.test(noComments(code)) && /\b22\b/.test(noComments(code)),
    },
    {
      id: 'update',
      text: 'Değeri kaydederken EEPROM.update kullan (EEPROM.write değil).',
      hint: 'EEPROM.update(ADRES, hedef); yalnız değer farklıysa yazar ve hücreyi yıpratmaz.',
      check: ({ code }) => /EEPROM\.update\s*\(/.test(noComments(code)) && !/EEPROM\.write\s*\(/.test(noComments(code)),
    },
    {
      id: 'seri-hedef',
      text: 'Programı çalıştır: seri monitörde "hedef=22" yazsın.',
      hint: 'Serial.begin(9600); sonra Serial.print("hedef="); Serial.println(hedef); İlk çalıştırmada EEPROM boş olduğu için 22 çıkar.',
      behavior: true,
      check: ({ lab }) => /hedef=22/.test(lab?.serial ?? ''),
    },
    {
      id: 'eeprom-yazildi',
      text: 'Çalıştırınca 0. EEPROM hücresine 22 yazılsın (anlık görüntüde 0. bayt = 22).',
      hint: 'Kodun sonunda EEPROM.update(ADRES, hedef); çağır. Laboratuvar, EEPROM’un 0. baytını çalıştırma sırasında izler.',
      behavior: true,
      check: ({ lab }) => lab?.eeprom[0] === 22,
    },
    {
      id: 'guc-kes',
      text: 'Güç kes ve yeniden ver: ■ ile durdur, ▶’e bas. Bu kez EEPROM dolu başlar; seri monitörde "kayitli deger okundu" yazsın.',
      hint: 'Okuduğun değer 255 değilse Serial.println("kayitli deger okundu"); yaz. Güç kesilince EEPROM’un kalıcı olması tam budur. (↺ Sıfırla hücreyi yine boşaltır.)',
      behavior: true,
      check: ({ lab }) => !!lab && lab.eepromRestored && /hedef=22/.test(lab.serial) && /kayitli deger okundu/.test(lab.serial),
    },
  ],
  solution: () => ({
    circuit: unoOnly(),
    code: `#include <EEPROM.h>

const int ADRES = 0;

void setup() {
  Serial.begin(9600);
  int hedef = EEPROM.read(ADRES);
  bool kayitli = (hedef != 255);
  if (hedef == 255) hedef = 22;
  Serial.print("hedef=");
  Serial.println(hedef);
  if (kayitli) Serial.println("kayitli deger okundu");
  EEPROM.update(ADRES, hedef);
}

void loop() {
}
`,
  }),
  scenario: (s) => { s.advance(500); s.powerCycle(); s.advance(500) },
}

// ---------------------------------------------------------------- Ders 35: Termostat
const termostatCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('ntc', 'ntc', 360, 40, { tempC: 15 }), part('r10', 'resistor', 360, 120, { ohms: 10_000 }),
    part('artir', 'button', 360, 200), part('azalt', 'button', 360, 260),
    part('k1', 'relay', 500, 40, { trigger: 'high' }), part('rl', 'resistor', 640, 40, { ohms: 330 }), part('led1', 'led', 760, 40, { color: 'red' }),
    part('lcd', 'lcdI2c', 500, 200, { address: '0x27' }),
  )
  w(c, ['uno', '5V'], ['r10', '1']); w(c, ['r10', '2'], ['uno', 'A2']); w(c, ['uno', 'A2'], ['ntc', '1']); w(c, ['ntc', '2'], ['uno', 'GND'])
  w(c, ['uno', 'D2'], ['artir', 'A']); w(c, ['artir', 'B'], ['uno', 'GND2'])
  w(c, ['uno', 'D3'], ['azalt', 'A']); w(c, ['azalt', 'B'], ['uno', 'GND2'])
  w(c, ['k1', 'VCC'], ['uno', '5V']); w(c, ['k1', 'GND'], ['uno', 'GND3']); w(c, ['k1', 'IN'], ['uno', 'D7'])
  w(c, ['k1', 'COM'], ['uno', '5V']); w(c, ['k1', 'NO'], ['rl', '1']); w(c, ['rl', '2'], ['led1', 'A']); w(c, ['led1', 'K'], ['uno', 'GND3'])
  w(c, ['lcd', 'GND'], ['uno', 'GND']); w(c, ['lcd', 'VCC'], ['uno', '5V']); w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  return c
}

const TERMOSTAT_CODE = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

const int ARTIR = 2;
const int AZALT = 3;
const int ROLE = 7;
const int NTC_PIN = A2;

const int ADRES = 0;                // hedef sıcaklığın EEPROM adresi
const int HEDEF_MIN = 10;
const int HEDEF_MAX = 35;
const int HEDEF_VARSAYILAN = 22;
const float HISTEREZIS = 0.5;       // hedefin altı ve üstü için pay
const unsigned long AYAR_SURESI = 2000;   // ms
const unsigned long OLCUM_ARALIGI = 500;  // ms

enum Durum { KAPALI, ISITIYOR, AYAR };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Durum durum = KAPALI;
int hedef;
float sicaklik;
unsigned long sonOlcum = 0;
unsigned long ayarBasla = 0;
unsigned long sonBasis = 0;
bool oncekiArtir = false;
bool oncekiAzalt = false;

float sicaklikOku() {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NTC_PIN);
  }
  float adc = toplam / 8.0;
  if (adc < 1.0) adc = 1.0;           // sıfıra bölmeyi önle
  if (adc > 1022.0) adc = 1022.0;
  float direnc = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);
  return kelvin - 273.15;
}

const char* durumAdi() {
  if (durum == ISITIYOR) return "ISIT  ";
  if (durum == AYAR) return "AYAR  ";
  return "KAPALI";
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  lcd.print("Su an: ");
  lcd.print(sicaklik, 1);
  lcd.print(" C    ");
  lcd.setCursor(0, 1);
  lcd.print("Hedef:");
  lcd.print(hedef);
  lcd.print("C ");
  lcd.print(durumAdi());
}

void setup() {
  pinMode(ARTIR, INPUT_PULLUP);
  pinMode(AZALT, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  digitalWrite(ROLE, LOW);
  Serial.begin(9600);

  hedef = EEPROM.read(ADRES);
  if (hedef < HEDEF_MIN || hedef > HEDEF_MAX) {
    hedef = HEDEF_VARSAYILAN;         // boş (255) ya da bozuk değer
  }

  lcd.init();
  lcd.backlight();
  sicaklik = sicaklikOku();
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Butonlar: basıldığı an (yüksekten alçağa geçiş) bir kez işle
  bool artirBasili = (digitalRead(ARTIR) == LOW);
  bool azaltBasili = (digitalRead(AZALT) == LOW);
  bool artirYeni = artirBasili && !oncekiArtir;
  bool azaltYeni = azaltBasili && !oncekiAzalt;
  oncekiArtir = artirBasili;
  oncekiAzalt = azaltBasili;

  if ((artirYeni || azaltYeni) && simdi - sonBasis > 50) {   // 50 ms: sıçrama önleme
    sonBasis = simdi;
    if (artirYeni && hedef < HEDEF_MAX) hedef++;
    if (azaltYeni && hedef > HEDEF_MIN) hedef--;
    durum = AYAR;                      // ayar moduna gir, 2 saniyelik süreyi başlat
    ayarBasla = simdi;
    ekranYaz();
  }

  // 2) Sıcaklık: yarım saniyede bir ölç
  bool olcumZamani = false;
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    sicaklik = sicaklikOku();
    olcumZamani = true;
  }

  // 3) Durum makinesi
  switch (durum) {
    case KAPALI:
      if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;
      break;
    case ISITIYOR:
      if (sicaklik >= hedef + HISTEREZIS) durum = KAPALI;
      break;
    case AYAR:
      if (simdi - ayarBasla >= AYAR_SURESI) {
        EEPROM.update(ADRES, hedef);   // ayar bitti: yalnızca değiştiyse yazar
        durum = KAPALI;
      }
      break;
  }
  digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW);

  // 4) Ekran ve seri çıktı: her ölçümden sonra
  if (olcumZamani) {
    ekranYaz();
    Serial.print("sicaklik=");
    Serial.print(sicaklik, 1);
    Serial.print(" hedef=");
    Serial.print(hedef);
    Serial.print(" role=");
    Serial.println(durum == ISITIYOR ? 1 : 0);
  }
}
`

const termostat: LabActivity = {
  intro: 'Bitirme projesi: devreyi kur (NTC bölücü, iki buton, röle, ısıtıcı LED’i, I2C LCD). Ders metnindeki program hazır yüklüdür; sen devreyi kurup NTC sıcaklığını değiştirerek termostatı dene. Hedef ayarı EEPROM’da kalıcıdır: ■ ile durdurup ▶’e basmak güç kesip vermek gibidir, ↺ Sıfırla ise EEPROM’u boşaltır.',
  starter: () => ({ circuit: unoOnly(), code: TERMOSTAT_CODE }),
  allowedParts: ['ntc', 'resistor', 'button', 'relay', 'led', 'lcdI2c'],
  goals: [
    {
      id: 'bolucu',
      text: 'NTC’yi A2 ile GND arasına, 10 kΩ direnci 5V ile A2 arasına bağla (gerilim bölücü).',
      hint: '5V → 10 kΩ direnç → A2; A2 → NTC → GND. Direncin değerini 10000 Ω yap.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'ntc').some((n) => (toUno(ctx, n.id, '1', 'A2') && toGnd(ctx, n.id, '2')) || (toUno(ctx, n.id, '2', 'A2') && toGnd(ctx, n.id, '1'))) &&
        partsOf(ctx.circuit, 'resistor').some((r) => Number(r.props.ohms) === 10_000 && ((to5V(ctx, r.id, '1') && toUno(ctx, r.id, '2', 'A2')) || (to5V(ctx, r.id, '2') && toUno(ctx, r.id, '1', 'A2')))),
    },
    {
      id: 'butonlar',
      text: '"Artır" butonunu D2’ye, "azalt" butonunu D3’e bağla (öbür uçlar GND).',
      hint: 'Her butonun bir ucu pin (D2 ya da D3), öbür ucu GND. Program INPUT_PULLUP kullanıyor.',
      check: (ctx) => {
        const on = (u: string) => partsOf(ctx.circuit, 'button').some((b) => (toUno(ctx, b.id, 'A', u) && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', u) && toGnd(ctx, b.id, 'A')))
        return on('D2') && on('D3')
      },
    },
    {
      id: 'role',
      text: 'Rölenin VCC ucunu 5V’a, GND ucunu GND’ye, IN ucunu D7’ye bağla.',
      hint: 'Röle modülünün üç kontrol ucu: VCC, GND ve IN. IN, programdaki ROLE pini olan D7’ye gider.',
      check: (ctx) => partsOf(ctx.circuit, 'relay').some((k) => to5V(ctx, k.id, 'VCC') && toGnd(ctx, k.id, 'GND') && toUno(ctx, k.id, 'IN', 'D7')),
    },
    {
      id: 'isitici-led',
      text: '"Isıtıcı" LED’ini kur: röle COM → 5V; röle NO → direnç → LED A; LED K → GND.',
      hint: 'Röle kontakları kuru bir anahtardır: COM’a 5V ver, NO’dan bir dirençle LED’e git. LED’i dirençsiz bağlama.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'relay').some((k) => to5V(ctx, k.id, 'COM') && partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin(k.id, 'NO'), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))),
    },
    {
      id: 'lcd',
      text: 'I2C LCD’yi bağla: VCC → 5V, GND → GND, SDA → A4, SCL → A5.',
      hint: 'Adres özelliği 0x27 olmalı (programdaki adres bu). Yazı, ▶’ten yaklaşık 1,5 saniye sonra görünür.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'lcdI2c').some((l) => to5V(ctx, l.id, 'VCC') && toGnd(ctx, l.id, 'GND') && toUno(ctx, l.id, 'SDA', 'A4') && toUno(ctx, l.id, 'SCL', 'A5')),
    },
    {
      id: 'isitir',
      text: 'Çalıştır: NTC’nin sıcaklığını hedefin (22 °C) altına indir; röle çeksin ve ısıtıcı LED’i yansın.',
      hint: 'NTC’yi seç, sağ panelde Sıcaklık değerini 15 °C yap. Hedefin 0,5 derece altına inince röle çeker.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 1),
    },
    {
      id: 'kapatir',
      text: 'Sıcaklığı hedefin üstüne çıkar (örneğin 30 °C): röle bıraksın.',
      hint: 'NTC sıcaklığını 30 °C yap. Röle (D7) önce açılıp sonra kapanmalı; hedefin 0,5 derece üstünde bırakır.',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D7'] ?? 0) >= 2,
    },
    {
      id: 'kalici-ayar',
      text: 'Ayarı kalıcı yap: "artır"a basıp hedefi değiştir (22 → 23), 2 saniye bekle. Sonra ■ ile durdur, ▶’e bas (güç kes/ver): ekran yeni hedefi göstersin.',
      hint: 'Hedef, ayar bittikten 2 saniye sonra EEPROM’a yazılır. Hemen durdurursan yazılmaz. Güç yeniden verilince ekranın alt satırında "Hedef:23C" görünür; ↺ Sıfırla EEPROM’u boşaltıp hedefi 22’ye döndürür.',
      behavior: true,
      check: ({ lab }) => {
        if (!lab || !lab.eepromRestored) return false
        const h = lab.eeprom[0]
        return h !== 255 && h !== 22 && Object.values(lab.parts).some((p) => p.lcd?.lines[1]?.startsWith(`Hedef:${h}C`))
      },
    },
  ],
  solution: () => ({ circuit: termostatCircuit(), code: TERMOSTAT_CODE }),
  scenario: (s) => {
    s.advance(2500)                       // 15 °C: ısıtıyor
    s.setProp('ntc', 'tempC', 30)
    s.advance(1500)                       // 30 °C: kapatır
    s.setProp('artir', 'pressed', true); s.advance(120)   // hedef 22 → 23
    s.setProp('artir', 'pressed', false); s.advance(2500) // 2 sn sonra EEPROM’a yazılır
    s.powerCycle()                        // güç kes, yeniden ver: ayar korunur
    s.advance(2000)
  },
}

export const M3_H7_ACTIVITIES: Record<string, LabActivity> = {
  'arduino-temelleri:7:1': yediSegment,
  'arduino-temelleri:7:2': lcd16x2,
  'arduino-temelleri:7:3': i2cLcd,
  'arduino-temelleri:7:4': eeprom,
  'arduino-temelleri:7:5': termostat,
}

import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 3 (Ortam: DHT, BMP280, toprak nemi) laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:3:<ders>" (ders 1 tabanlı konum). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)

/** Metinde, tam sayı kısmı n olan bir sayı var mı (25 -> "25", "25.0", "25,3"; "125" ya da "2.25" sayılmaz). */
const hasNum = (text: string, n: number) => new RegExp(`(^|[^\\d.,])${Math.trunc(Math.abs(n))}([^\\d]|$)`).test(text)
const numbersIn = (text: string) => (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
/** BMP280 rakım formülü (ders 47). */
const altitude = (hpa: number, p0 = 1013.25) => 44330 * (1 - Math.pow(hpa / p0, 1 / 5.255))
/** Sayı olmayan ya da eksik değerde varsayılanı verir. */
const nz = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)

/** Bir ekranın (lcdI2c) çalışan satırları. */
const lcdLines = (ctx: LabGoalCtx): string[][] => partsOf(ctx.circuit, 'lcdI2c').map((p) => ctx.lab?.parts[p.id]?.lcd?.lines ?? [])

/** AO ucu belirli bir Uno pinine bağlı olan analog modül. */
const moduleOn = (ctx: LabGoalCtx, type: 'soil' | 'rain' | 'waterlevel', unoPin: string) =>
  partsOf(ctx.circuit, type).find((p) => toUno(ctx, p.id, 'AO', unoPin))
const levelOf = (ctx: LabGoalCtx, id: string | undefined) => (id ? ctx.lab?.parts[id]?.analogModule?.level ?? 0 : 0)

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))

// ---------------------------------------------------------------- Ders 46: DHT11/DHT22
const dhtCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('dht', 'dht', 460, 80, { type: 'dht22', tempC: 25, humidity: 50 }))
  w(c, ['dht', 'VCC'], ['uno', '5V']); w(c, ['dht', 'GND'], ['uno', 'GND']); w(c, ['dht', 'DATA'], ['uno', 'D5'])
  return c
}

const DHT_STARTER = `#include <DHT.h>

#define DHT_PIN 5
#define DHT_TIP DHT22        // DHT11 seçersen burayı da DHT11 yap

DHT dht(DHT_PIN, DHT_TIP);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  // 2 sn bekle, nemi ve sıcaklığı oku, isnan ile denetle, seri monitöre yazdır
}
`

const dhtEtkinlik: LabActivity = {
  intro: 'DHT modülünü Uno’ya bağla, sıcaklık ve nemi okuyup seri monitöre yazdır. Çalışırken sensörün sıcaklık ve nem kaydırıcılarını oynat. Okumalar arasında en az 2 saniye bekle.',
  starter: () => ({ circuit: unoOnly(), code: DHT_STARTER }),
  allowedParts: ['dht'],
  goals: [
    {
      id: 'parca',
      text: 'Tuvale bir DHT sensörü ekle.',
      hint: '"Parça ekle" menüsünden DHT sıcaklık ve nem sensörünü seç.',
      check: ({ circuit }) => partsOf(circuit, 'dht').length >= 1,
    },
    {
      id: 'besleme',
      text: 'DHT’nin VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme eksikse sensör hiç cevap vermez ve "beslenmemiş" uyarısı çıkar.',
      check: (ctx) => partsOf(ctx.circuit, 'dht').some((d) => to5V(ctx, d.id, 'VCC') && toGnd(ctx, d.id, 'GND')),
    },
    {
      id: 'veri',
      text: 'DATA ucunu doğrudan D5’e bağla.',
      hint: 'Koddaki DHT_PIN ile aynı pin olmalı. DATA ucu araya başka parça girmeden Uno’nun D5 pinine gider.',
      check: (ctx) => partsOf(ctx.circuit, 'dht').some((d) => toUno(ctx, d.id, 'DATA', 'D5')),
    },
    {
      id: 'isnan',
      text: 'Kodda okumayı isnan ile denetle.',
      hint: 'if (isnan(nem) || isnan(sicaklik)) { ... return; } sensör cevap vermezse NaN döner.',
      check: ({ code }) => /\bisnan\s*\(/.test(noComments(code)),
    },
    {
      id: 'seri-deger',
      text: 'Seri monitörde sensörün sıcaklık ve nem değerleri görünsün.',
      hint: 'readHumidity() ve readTemperature() değerlerini Serial.print ile yaz. Her turun başında delay(2000) ile bekle.',
      behavior: true,
      check: ({ lab, circuit }) =>
        partsOf(circuit, 'dht').some((d) => {
          const r = lab?.parts[d.id]?.dht
          return !!r && r.reads >= 1 && hasNum(lab!.serial, r.tempC) && hasNum(lab!.serial, r.humidity)
        }),
    },
    {
      id: 'canli',
      text: 'Çalışırken sıcaklığı 30 °C ya da üstüne çıkar: seri monitörde yeni değer görünsün.',
      hint: 'Sensörü seç, sağ paneldeki Sıcaklık kaydırıcısını 30 üstüne çek. Yeni değer en geç 2 saniye sonra seri monitöre düşer.',
      behavior: true,
      check: ({ lab, circuit }) =>
        partsOf(circuit, 'dht').some((d) => {
          const r = lab?.parts[d.id]?.dht
          return !!r && r.tempC >= 30 && hasNum(lab!.serial, r.tempC)
        }),
    },
  ],
  solution: () => ({
    circuit: dhtCircuit(),
    code: `// sketch: dht_oku
#include <DHT.h>

#define DHT_PIN 5
#define DHT_TIP DHT22        // DHT11 kullanıyorsan burayı DHT11 yap

DHT dht(DHT_PIN, DHT_TIP);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);                          // okumalar arası en az 2 sn
  float nem = dht.readHumidity();
  float sicaklik = dht.readTemperature();   // santigrat

  if (isnan(nem) || isnan(sicaklik)) {
    Serial.println("Okuma hatasi");
    return;
  }

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 1);
  Serial.print(" C  Nem: ");
  Serial.print(nem, 1);
  Serial.println(" %");
}
`,
  }),
  scenario: (s) => {
    s.advance(3000)                       // 25 °C, nem 50
    s.setProp('dht', 'tempC', 31)
    s.advance(2500)                       // yeni değer okunur ve yazılır
  },
}

// ---------------------------------------------------------------- Ders 47: BMP280
const bmpCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('bmp', 'bmp280', 460, 80, { tempC: 21.5, pressureHpa: 1005, address: '0x76' }))
  w(c, ['bmp', 'VCC'], ['uno', '5V']); w(c, ['bmp', 'GND'], ['uno', 'GND']); w(c, ['bmp', 'SDA'], ['uno', 'A4']); w(c, ['bmp', 'SCL'], ['uno', 'A5'])
  return c
}

const BMP_STARTER = `#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
bool bmpHazir = false;

void setup() {
  Serial.begin(9600);
  // BMP280'i başlat: begin(adres). Sensör bulunamazsa bir mesaj yaz
}

void loop() {
  // 1 sn bekle, basıncı hPa olarak ve rakımı seri monitöre yazdır
}
`

const bmpEtkinlik: LabActivity = {
  intro: 'BMP280 basınç sensörünü I2C ile bağla, kodda adresini doğru yaz. Basıncı hPa olarak, rakımı metre olarak seri monitöre yazdır. Çalışırken Basınç kaydırıcısını azaltırsan rakım artar.',
  starter: () => ({ circuit: unoOnly(), code: BMP_STARTER }),
  allowedParts: ['bmp280'],
  goals: [
    {
      id: 'parca',
      text: 'Tuvale bir BMP280 sensörü ekle.',
      hint: '"Parça ekle" menüsünden BMP280’i seç.',
      check: ({ circuit }) => partsOf(circuit, 'bmp280').length >= 1,
    },
    {
      id: 'besleme',
      text: 'BMP280’in VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: 'Besleme eksikse sensör I2C hattında cevap vermez.',
      check: (ctx) => partsOf(ctx.circuit, 'bmp280').some((b) => to5V(ctx, b.id, 'VCC') && toGnd(ctx, b.id, 'GND')),
    },
    {
      id: 'hat',
      text: 'SDA ucunu A4’e, SCL ucunu A5’e bağla.',
      hint: 'Uno’nun I2C pinleri A4 (SDA) ve A5 (SCL)’tir. Ters bağlarsan sensör bulunamaz.',
      check: (ctx) => partsOf(ctx.circuit, 'bmp280').some((b) => toUno(ctx, b.id, 'SDA', 'A4') && toUno(ctx, b.id, 'SCL', 'A5')),
    },
    {
      id: 'adres',
      text: 'Kodda bmp.begin(...) içindeki adres, BMP280’in I2C adresi özelliğiyle aynı olsun.',
      hint: 'Sensörü seç, sağ panelde I2C adresine bak (0x76 ya da 0x77). Kütüphanenin varsayılanı 0x77’dir; 0x76 için bmp.begin(0x76); yaz.',
      check: ({ circuit, code }) => {
        const m = noComments(code).match(/\.begin\s*\(\s*(0[xX][0-9a-fA-F]+)?\s*[,)]/)
        const adres = m?.[1] ? Number(m[1]) : 0x77
        return !!m && partsOf(circuit, 'bmp280').some((b) => Number(b.props.address ?? '0x76') === adres)
      },
    },
    {
      id: 'rakim-kod',
      text: 'Rakımı hesapla: readAltitude(...) ya da pow(...) ile kendi formülünü kullan.',
      hint: 'readAltitude(1013.25) deniz seviyesi basıncını hPa cinsinden alır. Kendi formülün için rakım = 44330 · (1 − (P / P0) ^ (1 / 5,255)).',
      check: ({ code }) => /\b(readAltitude|pow)\s*\(/.test(noComments(code)),
    },
    {
      id: 'seri-basinc',
      text: 'Seri monitörde sensörün basıncı hPa olarak görünsün.',
      hint: 'readPressure() Pa verir; 100’e bölüp hPa yap ve Serial.print ile yaz. Adresin doğru olduğundan emin ol.',
      behavior: true,
      check: ({ lab, circuit }) =>
        partsOf(circuit, 'bmp280').some((b) => {
          const r = lab?.parts[b.id]?.bmp280
          return !!r && r.present && hasNum(lab!.serial, r.pressureHpa)
        }),
    },
    {
      id: 'canli-rakim',
      text: 'Çalışırken Basınç kaydırıcısını 960 hPa altına indir: seri monitörde yaklaşık rakım (deniz seviyesi basıncı 1013,25 hPa) görünsün.',
      hint: 'Basıncı 954 civarına çekersen rakım yaklaşık 500 m çıkar. P0 olarak 1013.25 kullan; sonuç en geç 1 saniye sonra seri monitöre düşer.',
      behavior: true,
      check: ({ lab, circuit }) =>
        partsOf(circuit, 'bmp280').some((b) => {
          const r = lab?.parts[b.id]?.bmp280
          if (!r || !r.present || r.pressureHpa > 960) return false
          const beklenen = altitude(r.pressureHpa)
          return numbersIn(lab!.serial).some((n) => Math.abs(n - beklenen) <= 20)
        }),
    },
  ],
  solution: () => ({
    circuit: bmpCircuit(),
    code: `// sketch: bmp_oku
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
bool bmpHazir = false;

void setup() {
  Serial.begin(9600);
  bmpHazir = bmp.begin(0x76);          // modülün adresi 0x77 ise burayı değiştir
  if (!bmpHazir) {
    Serial.println("BMP280 bulunamadi");
  }
}

void loop() {
  delay(1000);
  if (!bmpHazir) {
    return;                            // sensör yoksa okuma yapma
  }
  float sicaklik = bmp.readTemperature();         // santigrat
  float hpa = bmp.readPressure() / 100.0;         // Pa -> hPa
  float rakim = bmp.readAltitude(1013.25);        // P0 hPa cinsinden

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 1);
  Serial.print(" C  Basinc: ");
  Serial.print(hpa, 1);
  Serial.print(" hPa  Rakim: ");
  Serial.print(rakim, 1);
  Serial.println(" m");
}
`,
  }),
  scenario: (s) => {
    s.advance(2500)
    s.setProp('bmp', 'pressureHpa', 954.5)   // yaklaşık 500 m
    s.advance(2500)
  },
}

// ---------------------------------------------------------------- Ders 48: toprak nemi, yağmur, su seviyesi
// Toprak nemi (A2), yağmur sensörü (A0, ıslandıkça AO düşer) ve su seviyesi sensörü (A1, su yükseldikçe AO artar).
const analogCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('toprak', 'soil', 460, 40, { moisture: 0.4 }),
    part('yagmur', 'rain', 460, 190, { wetness: 0 }),
    part('seviye', 'waterlevel', 460, 340, { level: 0 }),
  )
  for (const id of ['toprak', 'yagmur', 'seviye']) { w(c, [id, 'VCC'], ['uno', '5V']); w(c, [id, 'GND'], ['uno', 'GND']) }
  w(c, ['toprak', 'AO'], ['uno', 'A2']); w(c, ['yagmur', 'AO'], ['uno', 'A0']); w(c, ['seviye', 'AO'], ['uno', 'A1'])
  return c
}

const ANALOG_STARTER = `const int KURU = 800;          // kuru toprakta okunan ham değer
const int ISLAK = 350;         // ıslak toprakta okunan ham değer
const int YAGMUR_ESIK = 600;   // A0 bunun altındaysa yağmur var
const int SEVIYE_ORTA = 300;   // A1 bunun altında: boş
const int SEVIYE_DOLU = 600;   // A1 bunun üstünde: dolu

void setup() {
  Serial.begin(9600);
}

void loop() {
  // A2'yi oku, map ile yüzdeye çevir, constrain ile 0-100 arasında tut
  // A0'dan yağmuru (VAR/YOK), A1'den su seviyesini (BOS/ORTA/DOLU) belirle
  // hepsini seri monitöre yaz, 500 ms bekle
}
`

const ANALOG_SOLUTION = `const int KURU = 800;
const int ISLAK = 350;
const int YAGMUR_ESIK = 600;   // altı: yagmur var
const int SEVIYE_ORTA = 300;   // bunun altı: bos
const int SEVIYE_DOLU = 600;   // bunun ustu: dolu

int ortalamaOku(int pin) {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 8;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = ortalamaOku(A2);
  int yuzde = map(ham, KURU, ISLAK, 0, 100);
  yuzde = constrain(yuzde, 0, 100);
  int yagmur = analogRead(A0);
  int seviye = analogRead(A1);

  Serial.print("Toprak ham=");
  Serial.print(ham);
  Serial.print(" nem=%");
  Serial.print(yuzde);
  Serial.print("  Yagmur: ");
  Serial.print(yagmur < YAGMUR_ESIK ? "VAR" : "YOK");
  Serial.print("  Su: ");
  if (seviye < SEVIYE_ORTA) {
    Serial.println("BOS");
  } else if (seviye < SEVIYE_DOLU) {
    Serial.println("ORTA");
  } else {
    Serial.println("DOLU");
  }
  delay(500);
}
`

const analogEtkinlik: LabActivity = {
  intro: 'Üç analog sensör kur: Toprak nemi (A2), Yağmur sensörü (A0; ıslandıkça AO düşer) ve Su seviyesi sensörü (A1; su yükseldikçe AO artar). Kaydırıcıları oynatarak ham sayıyı yüzdeye ve duruma çevir.',
  starter: () => ({ circuit: unoOnly(), code: ANALOG_STARTER }),
  allowedParts: ['soil', 'rain', 'waterlevel'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale bir Toprak nemi modülü, bir Yağmur sensörü ve bir Su seviyesi sensörü ekle.',
      hint: '"Parça ekle" menüsünden (Sensörler) Toprak nemi, Yağmur ve Su seviyesi parçalarını birer kez seç.',
      check: ({ circuit }) => partsOf(circuit, 'soil').length >= 1 && partsOf(circuit, 'rain').length >= 1 && partsOf(circuit, 'waterlevel').length >= 1,
    },
    {
      id: 'besleme',
      text: 'Üç modülün VCC uçlarını 5V’a, GND uçlarını GND’ye bağla.',
      hint: 'Besleme eksik modül AO ucunda anlamlı gerilim vermez.',
      check: (ctx) => {
        const hepsi = [...partsOf(ctx.circuit, 'soil'), ...partsOf(ctx.circuit, 'rain'), ...partsOf(ctx.circuit, 'waterlevel')]
        return hepsi.length >= 3 && hepsi.every((m) => to5V(ctx, m.id, 'VCC') && toGnd(ctx, m.id, 'GND'))
      },
    },
    {
      id: 'sinyal',
      text: 'Toprak nemi modülünün AO ucunu A2’ye, Yağmur sensörünün AO ucunu A0’a, Su seviyesi sensörünün AO ucunu A1’e bağla.',
      hint: 'Kodda toprak A2, yağmur A0, su seviyesi A1’den okunuyor.',
      check: (ctx) => !!moduleOn(ctx, 'soil', 'A2') && !!moduleOn(ctx, 'rain', 'A0') && !!moduleOn(ctx, 'waterlevel', 'A1'),
    },
    {
      id: 'yuzde-kod',
      text: 'Kodda ham değeri map ile yüzdeye çevir ve constrain ile 0-100 arasında tut.',
      hint: 'int yuzde = map(ham, KURU, ISLAK, 0, 100); yuzde = constrain(yuzde, 0, 100);',
      check: ({ code }) => /\bmap\s*\(/.test(noComments(code)) && /\bconstrain\s*\(/.test(noComments(code)),
    },
    {
      id: 'toprak-100',
      text: 'Toprak modülünün Toprak nemi kaydırıcısını sonuna kadar (1) çek: seri monitörde %100 görünsün.',
      hint: 'Toprak modülünü seç, kaydırıcıyı sağa çek. Islakta AO düşer; KURU=800 ve ISLAK=350 için sonuç %100’e sınırlanır.',
      behavior: true,
      check: (ctx) => levelOf(ctx, moduleOn(ctx, 'soil', 'A2')?.id) >= 0.95 && /(^|[^\d])100([^\d]|$)/.test(ctx.lab?.serial ?? ''),
    },
    {
      id: 'yagmur-var',
      text: 'Yağmur sensörünü ıslat (Islaklık 0,5 ya da üstü): seri monitörde yağmur için VAR yazsın.',
      hint: 'A0 değeri 600’ün altına inince yağmur var demektir. Sensör ıslandıkça AO gerilimi düşer (0,5 ıslaklıkta A0 ≈ 537).',
      behavior: true,
      check: (ctx) => levelOf(ctx, moduleOn(ctx, 'rain', 'A0')?.id) >= 0.5 && /VAR/i.test(ctx.lab?.serial ?? ''),
    },
    {
      id: 'seviye-dolu',
      text: 'Su seviyesi kaydırıcısını 0,8 ya da üstüne çek: seri monitörde su seviyesi için DOLU yazsın.',
      hint: 'A1 değeri 600’ü geçince "dolu" kolu çalışır. Su seviyesi 0,7’de A1 ≈ 588 (ORTA), 0,8’de ≈ 665 (DOLU); sensör 5 V’ta tam ölçeğe ulaşmaz.',
      behavior: true,
      check: (ctx) => levelOf(ctx, moduleOn(ctx, 'waterlevel', 'A1')?.id) >= 0.8 && /DOLU/i.test(ctx.lab?.serial ?? ''),
    },
  ],
  solution: () => ({ circuit: analogCircuit(), code: ANALOG_SOLUTION }),
  scenario: (s) => {
    s.advance(1000)
    s.setProp('toprak', 'moisture', 1)
    s.setProp('yagmur', 'wetness', 0.8)
    s.setProp('seviye', 'level', 0.9)
    s.advance(1500)
  },
}

// ---------------------------------------------------------------- Ders 49: çok sayfalı ekran
const ekranCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('lcd', 'lcdI2c', 460, 20, { address: '0x27' }),
    part('bmp', 'bmp280', 460, 150, { tempC: 22, pressureHpa: 990, address: '0x76' }),
    part('dht', 'dht', 460, 300, { type: 'dht22', tempC: 25, humidity: 50 }),
    part('toprak', 'soil', 640, 300, { moisture: 0.5 }),
    part('btn', 'button', 640, 150),
  )
  for (const id of ['lcd', 'bmp', 'dht', 'toprak']) { w(c, [id, 'VCC'], ['uno', '5V']); w(c, [id, 'GND'], ['uno', 'GND']) }
  w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  w(c, ['bmp', 'SDA'], ['uno', 'A4']); w(c, ['bmp', 'SCL'], ['uno', 'A5'])
  w(c, ['dht', 'DATA'], ['uno', 'D5']); w(c, ['toprak', 'AO'], ['uno', 'A2'])
  w(c, ['btn', 'A'], ['uno', 'D2']); w(c, ['btn', 'B'], ['uno', 'GND2'])
  return c
}

const EKRAN_STARTER = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

const int SAYFA_SAYISI = 3;
const unsigned long SAYFA_SURESI = 3000;   // ms
int sayfa = 0;
unsigned long sonSayfa = 0;

void setup() {
  lcd.init();
  lcd.backlight();
  dht.begin();
  bmp.begin(0x76);
  // ilk sayfayı çiz, sonSayfa = millis() yap
}

void loop() {
  // 3 sn dolunca sayfa = (sayfa + 1) % SAYFA_SAYISI ve sayfayı yeniden çiz
}
`

const ekranEtkinlik: LabActivity = {
  intro: 'DHT, BMP280 ve toprak nemi sensörlerinin değerlerini 16x2 I2C LCD’de sayfa sayfa göster. LCD ve BMP280 aynı SDA/SCL hattını paylaşır. Sayfayı delay ile değil millis ile değiştir; butona basınca hemen sonraki sayfaya geçsin.',
  starter: () => ({ circuit: unoOnly(), code: EKRAN_STARTER }),
  allowedParts: ['lcdI2c', 'bmp280', 'dht', 'soil', 'button'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale I2C LCD, BMP280, DHT, Toprak nemi modülü ve bir buton ekle.',
      hint: '"Parça ekle" menüsünden beş parçayı da seç.',
      check: ({ circuit }) => (['lcdI2c', 'bmp280', 'dht', 'soil', 'button'] as const).every((t) => partsOf(circuit, t).length >= 1),
    },
    {
      id: 'besleme',
      text: 'LCD, BMP280, DHT ve Toprak nemi modülünün VCC uçlarını 5V’a, GND uçlarını GND’ye bağla.',
      hint: 'Besleme eksik bir parça cevap vermez. Dört parçanın da VCC ve GND uçlarını kontrol et.',
      check: (ctx) => (['lcdI2c', 'bmp280', 'dht', 'soil'] as const).every((t) => {
        const ps = partsOf(ctx.circuit, t)
        return ps.length >= 1 && ps.every((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND'))
      }),
    },
    {
      id: 'i2c',
      text: 'LCD ve BMP280’in SDA uçlarını A4’e, SCL uçlarını A5’e bağla (aynı hat).',
      hint: 'İki cihaz da A4 ve A5’e bağlanır; adresleri farklı (0x27 ve 0x76) olduğu için karışmazlar. Kabloyu bir cihazdan diğerine de uzatabilirsin.',
      check: (ctx) => ['lcdI2c', 'bmp280'].every((t) => {
        const ps = partsOf(ctx.circuit, t as 'lcdI2c' | 'bmp280')
        return ps.length >= 1 && ps.every((p) => toUno(ctx, p.id, 'SDA', 'A4') && toUno(ctx, p.id, 'SCL', 'A5'))
      }),
    },
    {
      id: 'sinyaller',
      text: 'DHT’nin DATA ucunu D5’e, Toprak nemi modülünün AO ucunu A2’ye, butonun bir ucunu D2’ye öbür ucunu GND’ye bağla.',
      hint: 'Buton INPUT_PULLUP ile okunur: bir ucu D2, öbür ucu GND. Basılınca D2 LOW olur.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'dht').some((d) => toUno(ctx, d.id, 'DATA', 'D5'))
        && partsOf(ctx.circuit, 'soil').some((s) => toUno(ctx, s.id, 'AO', 'A2'))
        && partsOf(ctx.circuit, 'button').some((b) => (toUno(ctx, b.id, 'A', 'D2') && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', 'D2') && toGnd(ctx, b.id, 'A'))),
    },
    {
      id: 'zamanlayici',
      text: 'Sayfa değişimini millis ve % (kalan) işleciyle yap.',
      hint: 'if (simdi - sonSayfa >= 3000) { sonSayfa = simdi; sayfa = (sayfa + 1) % SAYFA_SAYISI; }',
      check: ({ code }) => /\bmillis\s*\(/.test(noComments(code)) && /%/.test(noComments(code).replace(/"[^"]*"/g, '')),
    },
    {
      id: 'ekran-dolu',
      text: 'Programı çalıştır: LCD’nin iki satırında da yazı görünsün.',
      hint: 'lcd.init() ve lcd.backlight() çağır; her iki satıra setCursor ile yaz. Yazı ▶’ten yaklaşık 1,5 saniye sonra görünür.',
      behavior: true,
      check: (ctx) => lcdLines(ctx).some((l) => (l[0] ?? '').trim().length > 0 && (l[1] ?? '').trim().length > 0),
    },
    {
      id: 'sicaklik-ekranda',
      text: 'Sayfalardan birinde DHT’nin sıcaklığı LCD’de görünsün.',
      hint: 'dht.readTemperature() değerini dtostrf ile metne çevirip lcd.print ile yaz. Sayfa değişince bekle ya da butona bas.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'dht').some((d) => {
        const r = ctx.lab?.parts[d.id]?.dht
        return !!r && lcdLines(ctx).some((l) => hasNum(l.join('\n'), nz(r.tempC, 0)))
      }),
    },
  ],
  solution: () => ({ circuit: ekranCircuit(), code: `// sketch: ekran_sayfalar
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int BUTON = 2;
const int SAYFA_SAYISI = 3;
const unsigned long SAYFA_SURESI = 3000;   // ms
const unsigned long OLCUM_ARALIGI = 2000;  // ms
const int KURU = 800;
const int ISLAK = 350;
const float P0_HPA = 1013.25;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

int sayfa = 0;
unsigned long sonSayfa = 0;
unsigned long sonOlcum = 0;
unsigned long sonBasis = 0;
bool oncekiBasili = false;
bool bmpHazir = false;

float sicaklik = NAN;
float nem = NAN;
float hpa = NAN;
float rakim = NAN;
int toprakHam = 0;
int toprakYuzde = 0;

// Sayiyi metne cevirir; gecersizse "--" verir.
const char* sayi(float v, int basamak, char* tampon) {
  if (isnan(v)) {
    return "--";
  }
  dtostrf(v, 1, basamak, tampon);
  return tampon;
}

// Bir satiri her zaman 16 karaktere tamamlayarak yazar.
void satirYaz(int satir, const char* metin) {
  char tampon[17];
  snprintf(tampon, sizeof(tampon), "%-16s", metin);
  lcd.setCursor(0, satir);
  lcd.print(tampon);
}

void sayfaCiz() {
  char ust[17];
  char alt[17];
  char a[10];
  char b[10];

  if (sayfa == 0) {
    snprintf(ust, sizeof(ust), "Sic: %s C", sayi(sicaklik, 1, a));
    snprintf(alt, sizeof(alt), "Nem: %s %%", sayi(nem, 1, b));
  } else if (sayfa == 1) {
    if (bmpHazir) {
      snprintf(ust, sizeof(ust), "P:%s hPa", sayi(hpa, 1, a));
      snprintf(alt, sizeof(alt), "Rakim: %s m", sayi(rakim, 0, b));
    } else {
      snprintf(ust, sizeof(ust), "BMP280 yok");
      snprintf(alt, sizeof(alt), " ");
    }
  } else {
    snprintf(ust, sizeof(ust), "Toprak: %%%d", toprakYuzde);
    snprintf(alt, sizeof(alt), "Ham: %d", toprakHam);
  }

  char baslik[17];
  snprintf(baslik, sizeof(baslik), "%-13s%d/%d", ust, sayfa + 1, SAYFA_SAYISI);
  satirYaz(0, baslik);
  satirYaz(1, alt);
}

void olcumYap() {
  float n = dht.readHumidity();
  float s = dht.readTemperature();
  sicaklik = s;                         // okunamazsa NAN kalir, ekran "--" yazar
  nem = n;

  if (bmpHazir) {
    hpa = bmp.readPressure() / 100.0;
    rakim = bmp.readAltitude(P0_HPA);
  }

  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(A2);
  }
  toprakHam = toplam / 8;
  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  dht.begin();
  bmpHazir = bmp.begin(0x76);
  delay(1500);                          // DHT sensoru acilsin
  olcumYap();
  sayfaCiz();
  sonOlcum = millis();
  sonSayfa = millis();                  // sayfa suresi simdi baslasin
}

void loop() {
  unsigned long simdi = millis();

  // Butona basilinca hemen sonraki sayfa
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 50) {
    sonBasis = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sonSayfa = simdi;                   // 3 saniyelik sure bastan
    sayfaCiz();
  }
  oncekiBasili = basili;

  // Sensorler 2 saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    olcumYap();
    sayfaCiz();
  }

  // Sayfa 3 saniyede bir
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }
}
` }),
  scenario: (s) => s.advance(2800),     // ilk sayfa (sıcaklık ve nem) ekranda
}

// ---------------------------------------------------------------- Ders 50: proje, hava istasyonu ve sulama uyarısı
const projeCircuit = (): Circuit => {
  const c = ekranCircuit()
  c.parts = c.parts.filter((p) => p.id !== 'btn')
  c.wires = c.wires.filter((x) => x.a.part !== 'btn' && x.b.part !== 'btn')
  c.parts.push(
    part('btn', 'button', 640, 150),
    part('led', 'led', 640, 20, { color: 'red' }),
    part('r', 'resistor', 780, 20, { ohms: 330 }),
    part('buz', 'buzzer', 780, 150, { kind: 'passive' }),
  )
  w(c, ['btn', 'A'], ['uno', 'D2']); w(c, ['btn', 'B'], ['uno', 'GND2'])
  w(c, ['uno', 'D13'], ['r', '1']); w(c, ['r', '2'], ['led', 'A']); w(c, ['led', 'K'], ['uno', 'GND3'])
  w(c, ['uno', 'D8'], ['buz', '+']); w(c, ['buz', '-'], ['uno', 'GND3'])
  return c
}

const PROJE_STARTER = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int LED = 13;
const int BUZZER = 8;
const int BUTON = 2;

const int KURU = 800;       // ham deger: kuru toprak
const int ISLAK = 350;      // ham deger: islak toprak
const int ESIK_ALT = 30;    // % - altina inince uyari
const int ESIK_UST = 40;    // % - ustune cikinca uyari biter

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

bool uyari = false;

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  dht.begin();
  bmp.begin(0x76);
}

void loop() {
  // 2 sn'de bir DHT, BMP280 ve toprağı oku (millis ile)
  // toprak yüzdesi ESIK_ALT altına inince uyarıyı aç: LED yansın, buzzer 2 sn'de bir ötsün, seriye BİR satır yaz
  // yüzde ESIK_UST ya da üstüne çıkınca uyarıyı kapat (histerezis)
  // LCD'de sayfaları 3 sn'de bir değiştir, butona basınca hemen sonraki sayfa
}
`

const projeEtkinlik: LabActivity = {
  intro: 'Hava istasyonunu kur: DHT, BMP280 ve toprak nemi sensörleri LCD’de sayfa sayfa görünsün. Toprak %30’un altına inince LED yansın, buzzer ötsün; %40 ya da üstüne çıkınca uyarı bitsin. Toprak modülünün kaydırıcısı: yaklaşık 0,4 altı uyarı, yaklaşık 0,5 üstü normal (KURU=800, ISLAK=350 için).',
  starter: () => ({ circuit: unoOnly(), code: PROJE_STARTER }),
  allowedParts: ['dht', 'bmp280', 'lcdI2c', 'soil', 'led', 'resistor', 'buzzer', 'button'],
  goals: [
    {
      id: 'parcalar',
      text: 'Tuvale DHT, BMP280, I2C LCD, Toprak nemi modülü, LED, direnç ve buzzer ekle.',
      hint: '"Parça ekle" menüsünden yedi parçayı da seç. Sayfa butonu istersen ekleyebilirsin.',
      check: ({ circuit }) => (['dht', 'bmp280', 'lcdI2c', 'soil', 'led', 'resistor', 'buzzer'] as const).every((t) => partsOf(circuit, t).length >= 1),
    },
    {
      id: 'besleme',
      text: 'DHT, BMP280, LCD ve Toprak nemi modülünün VCC uçlarını 5V’a, GND uçlarını GND’ye bağla.',
      hint: 'Besleme eksik bir parça cevap vermez. Dört parçanın da VCC ve GND uçlarını kontrol et.',
      check: (ctx) => (['dht', 'bmp280', 'lcdI2c', 'soil'] as const).every((t) => {
        const ps = partsOf(ctx.circuit, t)
        return ps.length >= 1 && ps.every((p) => to5V(ctx, p.id, 'VCC') && toGnd(ctx, p.id, 'GND'))
      }),
    },
    {
      id: 'sensor-pinleri',
      text: 'DHT DATA → D5, toprak AO → A2; LCD ve BMP280’in SDA uçları A4’e, SCL uçları A5’e bağlı olsun.',
      hint: 'LCD ve BMP280 aynı SDA/SCL hattını paylaşır. DATA ve AO uçları araya parça girmeden Uno pinlerine gider.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'dht').some((d) => toUno(ctx, d.id, 'DATA', 'D5'))
        && partsOf(ctx.circuit, 'soil').some((s) => toUno(ctx, s.id, 'AO', 'A2'))
        && (['lcdI2c', 'bmp280'] as const).every((t) => {
          const ps = partsOf(ctx.circuit, t)
          return ps.length >= 1 && ps.every((p) => toUno(ctx, p.id, 'SDA', 'A4') && toUno(ctx, p.id, 'SCL', 'A5'))
        }),
    },
    {
      id: 'led',
      text: 'LED’i D13’e bir direnç üzerinden bağla (katot GND’ye).',
      hint: 'D13 → direnç → LED anodu (A); LED katodu (K) → GND. Direnç LED’i korur.',
      check: (ctx) => {
        const gnd = (id: string, p: string) => UNO_GNDS.some((g) => viaResistor(ctx, pin(id, p), pin('uno', g)))
        return partsOf(ctx.circuit, 'led').some((l) =>
          (viaResistor(ctx, pin('uno', 'D13'), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))
          || (ctx.analysis.sameNet(pin('uno', 'D13'), pin(l.id, 'A')) && gnd(l.id, 'K')))
      },
    },
    {
      id: 'buzzer',
      text: 'Buzzer’ın + ucunu D8’e, − ucunu GND’ye bağla.',
      hint: 'Buzzer parçasının "Tür" özelliği Pasif ise tone() ile öter.',
      check: (ctx) => partsOf(ctx.circuit, 'buzzer').some((b) => toUno(ctx, b.id, '+', 'D8') && toGnd(ctx, b.id, '-')),
    },
    {
      id: 'uyari-acildi',
      text: 'Toprağı kurut (kaydırıcı 0,4’ün altı): uyarı LED’i yansın.',
      hint: 'Uyarı, toprak yüzdesi %30’un altına inince açılır: LED D13’te yanar, buzzer D8’den 2 saniyede bir öter. Toprak modülünü seç, kaydırıcıyı sola çek.',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D13'] ?? 0) >= 1,
    },
    {
      id: 'uyari-bitti',
      text: 'Sonra toprağı ıslat (kaydırıcı 0,5 ve üstü): LED sönsün ve buzzer sussun.',
      hint: 'Uyarı yalnız %40 ya da üstünde biter. %30-%40 arasında uyarı sürer (histerezis). Bu yüzden kaydırıcıyı 0,5’in üstüne çek.',
      behavior: true,
      check: ({ stats, lab }) => (stats?.pinEdges['D13'] ?? 0) >= 2 && lab?.pins['D13']?.high === false,
    },
  ],
  solution: () => ({ circuit: projeCircuit(), code: `// sketch: hava_istasyonu
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int LED = 13;
const int BUZZER = 8;
const int BUTON = 2;

const int KURU = 800;                       // ham deger: kuru toprak
const int ISLAK = 350;                      // ham deger: islak toprak
const int ESIK_ALT = 30;                    // % - altina inince uyari
const int ESIK_UST = 40;                    // % - ustune cikinca uyari biter
const float P0_HPA = 1013.25;               // deniz seviyesi basinci

const int SAYFA_SAYISI = 3;
const unsigned long OLCUM_ARALIGI = 2000;   // ms (DHT icin en az 2 sn)
const unsigned long SAYFA_SURESI = 3000;    // ms
const unsigned long BIP_ARALIGI = 2000;     // ms
const unsigned long BIP_SURESI = 200;       // ms
const int BIP_HZ = 1000;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

float sicaklik = NAN;
float nem = NAN;
float hpa = NAN;
float rakim = NAN;
int toprakHam = 0;
int toprakYuzde = 0;

bool bmpHazir = false;
bool uyari = false;
int sayfa = 0;
bool oncekiBasili = false;
unsigned long sonOlcum = 0;
unsigned long sonSayfa = 0;
unsigned long sonBip = 0;
unsigned long sonBasis = 0;

// Sayiyi metne cevirir; gecersizse "--" verir.
const char* sayi(float v, int basamak, char* tampon) {
  if (isnan(v)) {
    return "--";
  }
  dtostrf(v, 1, basamak, tampon);
  return tampon;
}

// Seri porta sayi yazar; gecersizse "--".
void seriSayi(const char* ad, float v, int basamak) {
  Serial.print(ad);
  if (isnan(v)) {
    Serial.print("--");
  } else {
    Serial.print(v, basamak);
  }
}

void satirYaz(int satir, const char* metin) {
  char tampon[17];
  snprintf(tampon, sizeof(tampon), "%-16s", metin);
  lcd.setCursor(0, satir);
  lcd.print(tampon);
}

void sayfaCiz() {
  char ust[17];
  char alt[17];
  char a[10];
  char b[10];

  if (sayfa == 0) {
    snprintf(ust, sizeof(ust), "Sic: %s C", sayi(sicaklik, 1, a));
    snprintf(alt, sizeof(alt), "Nem: %s %%", sayi(nem, 1, b));
  } else if (sayfa == 1) {
    if (bmpHazir) {
      snprintf(ust, sizeof(ust), "P:%s hPa", sayi(hpa, 1, a));
      snprintf(alt, sizeof(alt), "Rakim: %s m", sayi(rakim, 0, b));
    } else {
      snprintf(ust, sizeof(ust), "BMP280 yok");
      snprintf(alt, sizeof(alt), " ");
    }
  } else {
    snprintf(ust, sizeof(ust), "Toprak: %%%d", toprakYuzde);
    snprintf(alt, sizeof(alt), "%s", uyari ? "SULAMA GEREKLI" : "Durum: NORMAL");
  }

  char baslik[17];
  char sonSatir[17];
  snprintf(baslik, sizeof(baslik), "%-13s%d/%d", ust, sayfa + 1, SAYFA_SAYISI);
  snprintf(sonSatir, sizeof(sonSatir), "%-15s%c", alt, uyari ? '!' : ' ');
  satirYaz(0, baslik);
  satirYaz(1, sonSatir);
}

void olcumYap() {
  nem = dht.readHumidity();
  sicaklik = dht.readTemperature();
  if (bmpHazir) {
    hpa = bmp.readPressure() / 100.0;
    rakim = bmp.readAltitude(P0_HPA);
  }
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(A2);
  }
  toprakHam = toplam / 8;
  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);
}

// Toprak nemine gore uyariyi acar/kapatir (histerezisli).
void uyariKontrol(unsigned long simdi) {
  if (!uyari && toprakYuzde < ESIK_ALT) {
    uyari = true;
    sonBip = simdi - BIP_ARALIGI;           // ilk bip hemen calsin
    digitalWrite(LED, HIGH);
    Serial.print("UYARI: toprak nemi %");
    Serial.print(toprakYuzde);
    Serial.println(" - sulama gerekli");
  } else if (uyari && toprakYuzde >= ESIK_UST) {
    uyari = false;
    digitalWrite(LED, LOW);
    noTone(BUZZER);
    Serial.print("Toprak nemi normale dondu: %");
    Serial.println(toprakYuzde);
  }
}

void seriDurum() {
  seriSayi("T=", sicaklik, 1);
  seriSayi(" N=", nem, 1);
  seriSayi(" P=", hpa, 1);
  seriSayi(" R=", rakim, 0);
  Serial.print(" Toprak=%");
  Serial.print(toprakYuzde);
  Serial.print(" Uyari=");
  Serial.println(uyari ? 1 : 0);
}

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  digitalWrite(LED, LOW);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  dht.begin();
  bmpHazir = bmp.begin(0x76);
  if (!bmpHazir) {
    Serial.println("BMP280 bulunamadi");
  }
  delay(1500);                              // DHT sensoru acilsin

  olcumYap();
  uyariKontrol(millis());
  seriDurum();
  sayfaCiz();
  sonOlcum = millis();
  sonSayfa = millis();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Buton: hemen sonraki sayfa
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 50) {
    sonBasis = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sonSayfa = simdi;
    sayfaCiz();
  }
  oncekiBasili = basili;

  // 2) Olcum, uyari ve seri cikti: 2 saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    olcumYap();
    uyariKontrol(simdi);
    seriDurum();
    sayfaCiz();
  }

  // 3) Sayfa degisimi: 3 saniyede bir
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }

  // 4) Uyari sirasinda buzzer: 2 saniyede bir kisa bip
  if (uyari && simdi - sonBip >= BIP_ARALIGI) {
    sonBip = simdi;
    tone(BUZZER, BIP_HZ, BIP_SURESI);
  }
}
` }),
  scenario: (s) => {
    s.advance(3500)                                  // toprak %55: normal
    s.setProp('toprak', 'moisture', 0.1)             // kuru
    s.advance(5000)                                  // uyarı: LED yanar, buzzer öter
    s.setProp('toprak', 'moisture', 0.8)             // ıslak
    s.advance(3000)                                  // uyarı biter
  },
}

export const M4_H3_ACTIVITIES: Record<string, LabActivity> = {
  'sensorler-ve-projeler:3:1': dhtEtkinlik,
  'sensorler-ve-projeler:3:2': bmpEtkinlik,
  'sensorler-ve-projeler:3:3': analogEtkinlik,
  'sensorler-ve-projeler:3:4': ekranEtkinlik,
  'sensorler-ve-projeler:3:5': projeEtkinlik,
}

/** Koordinatörün kaydı için (görev: `export const m4h3Activities`). */
export const m4h3Activities = M4_H3_ACTIVITIES

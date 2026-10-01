import type { LabActivity } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 7 laboratuvar etkinlikleri. Anahtar: "sensorler-ve-projeler:7:<ders>" (ders 1 tabanlı konum: 66-70). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))

/** I2C modülü (rtc, lcdI2c) beslemesi ve A4/A5 hattı. */
const i2cOk = (ctx: LabGoalCtx, id: string) => to5V(ctx, id, 'VCC') && toGnd(ctx, id, 'GND') && toUno(ctx, id, 'SDA', 'A4') && toUno(ctx, id, 'SCL', 'A5')
const i2cWire = (c: Circuit, id: string, gnd: 'GND' | 'GND2' | 'GND3' = 'GND') => {
  w(c, [id, 'VCC'], ['uno', '5V']); w(c, [id, 'GND'], ['uno', gnd]); w(c, [id, 'SDA'], ['uno', 'A4']); w(c, [id, 'SCL'], ['uno', 'A5'])
}

const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
const CSV_ROW = /^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d),(-?\d+(?:\.\d+)?)?,(-?\d+(?:\.\d+)?)?$/
const csvRows = (serial: string) => lines(serial).filter((l) => CSV_ROW.test(l))
const lcdText = (ctx: LabGoalCtx, id: string) => (ctx.lab?.parts[id]?.lcd?.lines ?? []).join('\n')

// ---------------------------------------------------------------- Ders 66: RTC saat, tarih, alarm
const rtcCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('rtc', 'rtc', 380, 40), part('rl', 'resistor', 380, 180, { ohms: 330 }), part('led1', 'led', 520, 180, { color: 'red' }),
    part('bz', 'buzzer', 520, 300, { kind: 'passive' }),
  )
  i2cWire(c, 'rtc')
  w(c, ['uno', 'D13'], ['rl', '1']); w(c, ['rl', '2'], ['led1', 'A']); w(c, ['led1', 'K'], ['uno', 'GND2'])
  w(c, ['uno', 'D8'], ['bz', '+']); w(c, ['bz', '-'], ['uno', 'GND3'])
  return c
}

const RTC_CODE = `#include <Wire.h>
#include <RTClib.h>

const int LED = 13;
const int BUZZER = 8;

RTC_DS3231 rtc;

void setup() {
  Serial.begin(9600);
  // LED ve buzzer pinlerini çıkış yap
  // rtc.begin() ile RTC'yi başlat
}

void loop() {
  // her saniye saati "SS:DD:SN" biçiminde seri monitöre yazdır (rtc.now())
  // saat senin seçtiğin alarm saatine gelince LED yansın ve buzzer birkaç saniye çalsın
}
`

const rtcAlarm: LabActivity = {
  intro: 'RTC modülünü bağla, saati seri monitöre yazdır ve kendi alarmını kur. Laboratuvarın RTC’si her ▶’de 2026-01-01 00:00:00’dan başlar; alarmı ilk dakikanın içine kurabilir ya da rtc.adjust ile saati ileri sarabilirsin.',
  starter: () => ({ circuit: unoOnly(), code: RTC_CODE }),
  allowedParts: ['rtc', 'led', 'resistor', 'buzzer'],
  goals: [
    {
      id: 'rtc-guc',
      text: 'RTC modülünü ekle; VCC ucunu 5V’a, GND ucunu GND’ye bağla.',
      hint: '"Parça ekle" menüsünden RTC’yi seç. Besleme eksikse modül cevap vermez ve "beslenmemiş" uyarısı çıkar.',
      check: (ctx) => partsOf(ctx.circuit, 'rtc').some((r) => to5V(ctx, r.id, 'VCC') && toGnd(ctx, r.id, 'GND')),
    },
    {
      id: 'rtc-hat',
      text: 'RTC’nin SDA ucunu A4’e, SCL ucunu A5’e bağla.',
      hint: 'Uno’nun I2C pinleri A4 (SDA) ve A5 (SCL). Ters bağlarsan program "RTC bulunamadi" yazar.',
      check: (ctx) => partsOf(ctx.circuit, 'rtc').some((r) => toUno(ctx, r.id, 'SDA', 'A4') && toUno(ctx, r.id, 'SCL', 'A5')),
    },
    {
      id: 'led-buzzer',
      text: 'Alarm çıkışlarını kur: D13 → direnç → LED → GND ve D8 → buzzer + ucu, buzzer - ucu GND.',
      hint: 'LED’i dirençsiz bağlama (330 Ω). Buzzer’ın "Tür" özelliği Pasif olsun, tone() ile çalar.',
      check: (ctx) =>
        partsOf(ctx.circuit, 'led').some((l) => viaResistor(ctx, pin('uno', 'D13'), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K')) &&
        partsOf(ctx.circuit, 'buzzer').some((b) => toUno(ctx, b.id, '+', 'D8') && toGnd(ctx, b.id, '-')),
    },
    {
      id: 'saat-yazar',
      text: 'Programı çalıştır: seri monitörde saat her saniye ilerleyerek yazılsın (SS:DD:SN).',
      hint: 'rtc.begin() sonra loop() içinde millis() ile saniyede bir rtc.now() oku; hour(), minute(), second() ile yazdır. Tek haneli sayıların başına 0 koymayı unutma.',
      behavior: true,
      check: ({ lab }) => new Set((lab?.serial ?? '').match(/\d\d:\d\d:\d\d/g) ?? []).size >= 2,
    },
    {
      id: 'alarm-led',
      text: 'Alarm saati gelince LED yansın.',
      hint: 'Alarmı ilk dakikanın içine kur (örneğin 00:00:05) ya da rtc.adjust(DateTime(2026, 3, 14, 7, 29, 55)) ile saati ileri sar. Saat, dakika ve saniyeyi t.hour(), t.minute(), t.second() ile karşılaştır.',
      behavior: true,
      check: ({ circuit, stats }) => partsOf(circuit, 'led').some((l) => (stats?.ledToggles[l.id] ?? 0) >= 1),
    },
    {
      id: 'alarm-buzzer',
      text: 'Alarmda buzzer’ı tone() ile çaldır ve alarm bitince noTone() ile sustur.',
      hint: 'tone(BUZZER, 1000); alarm başlarken, noTone(BUZZER); alarm bitince. Alarmın aynı dakika boyunca tekrar tekrar başlamaması için "bugün çaldı mı" bayrağı kullan.',
      check: ({ code }) => /tone\s*\(/.test(noComments(code)) && /noTone\s*\(/.test(noComments(code)),
    },
  ],
  solution: () => ({
    circuit: rtcCircuit(),
    code: `#include <Wire.h>
#include <RTClib.h>

const int LED = 13;
const int BUZZER = 8;
const int ALARM_SAAT = 7;
const int ALARM_DAKIKA = 30;
const unsigned long KONTROL_ARALIGI = 250;   // ms
const unsigned long ALARM_SURESI = 3000;     // ms

RTC_DS3231 rtc;
unsigned long sonKontrol = 0;
unsigned long sonYazma = 0;
unsigned long alarmBasla = 0;
bool alarmCaliyor = false;
int sonTetikGunu = -1;

void iki(int n) {
  if (n < 10) Serial.print('0');
  Serial.print(n);
}

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  rtc.begin();
  rtc.adjust(DateTime(2026, 3, 14, 7, 29, 57));   // alarmdan 3 sn önce
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonYazma >= 1000) {
    sonYazma = simdi;
    DateTime t = rtc.now();
    iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());
    Serial.println();
  }

  if (simdi - sonKontrol >= KONTROL_ARALIGI) {
    sonKontrol = simdi;
    DateTime t = rtc.now();
    bool saatGeldi = (t.hour() == ALARM_SAAT && t.minute() == ALARM_DAKIKA);
    if (saatGeldi && !alarmCaliyor && t.day() != sonTetikGunu) {
      sonTetikGunu = t.day();
      alarmCaliyor = true;
      alarmBasla = simdi;
      digitalWrite(LED, HIGH);
      tone(BUZZER, 1000);
    }
  }

  if (alarmCaliyor && simdi - alarmBasla >= ALARM_SURESI) {
    alarmCaliyor = false;
    digitalWrite(LED, LOW);
    noTone(BUZZER);
  }
}
`,
  }),
  scenario: (s) => s.advance(4500),   // alarm ~3. sn'de başlar
}

// ---------------------------------------------------------------- Ders 67: SD kart (laboratuvarda SD modülü yok: yalnız kod)
const SD_CODE = `#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;

void setup() {
  Serial.begin(9600);
  // SD kartı başlat; başarısız olursa seri monitöre bir uyarı yaz ve dur
  // "TEST.TXT" dosyasını FILE_WRITE ile aç, iki satır yaz ve kapat
}

void loop() {
}
`

const SD_NAME = /^[A-Za-z0-9_]{1,8}\.[A-Za-z0-9_]{1,3}$/

const sdKart: LabActivity = {
  intro: 'Laboratuvarda SD kart modülü yok: bu derste SD kodunu yazıp derlersin ama karta yazma sonucunu göremezsin. SD.begin kart bulamayınca burada takılıp kalır; bu yüzden SD.begin’den önce seri monitöre bir ilerleme mesajı yaz. Gerçek bir kartta bu kod dosya yazar.',
  starter: () => ({ circuit: unoOnly(), code: SD_CODE }),
  allowedParts: [],
  goals: [
    {
      id: 'kutuphane',
      text: 'Kodda SPI ve SD kütüphanelerini ekle.',
      hint: '#include <SPI.h> ve #include <SD.h> satırlarını yaz.',
      check: ({ code }) => /#include\s*<SPI\.h>/.test(noComments(code)) && /#include\s*<SD\.h>/.test(noComments(code)),
    },
    {
      id: 'cs-pini',
      text: 'SD.begin ile kartı başlat ve CS pini olarak 10’u ver.',
      hint: 'SD.begin(10); ya da const int SD_CS = 10; tanımlayıp SD.begin(SD_CS); yaz. Uno’da CS bu derste D10’dur.',
      check: ({ code }) => {
        const c = noComments(code)
        const m = c.match(/SD\.begin\s*\(\s*(\w+)\s*\)/)
        if (!m) return false
        if (/^\d+$/.test(m[1])) return Number(m[1]) === 10
        const d = c.match(new RegExp(`(?:const\\s+)?(?:int|byte|uint8_t)\\s+${m[1]}\\s*=\\s*(\\d+)`)) ?? c.match(new RegExp(`#define\\s+${m[1]}\\s+(\\d+)`))
        return !!d && Number(d[1]) === 10
      },
    },
    {
      id: 'kontrol',
      text: 'SD.begin’in sonucunu kontrol et: başarısızsa program uyarı yazsın.',
      hint: 'if (!SD.begin(SD_CS)) { Serial.println("HATA: ..."); while (true) {} } gibi. Kart yoksa ya da kablo yanlışsa SD.begin false döner.',
      check: ({ code }) => /(?:if|while)\s*\(\s*!\s*SD\.begin\s*\(|=\s*SD\.begin\s*\([^)]*\)\s*;/.test(noComments(code)),
    },
    {
      id: 'dosya-adi',
      text: 'Dosya adını 8.3 kuralına uydur: en çok 8 harf, nokta, en çok 3 harf (örneğin TEST.TXT).',
      hint: 'Türkçe karakter, boşluk ve uzun ad kullanma. SD.open("TEST.TXT", FILE_WRITE) gibi.',
      check: ({ code }) => {
        const names = [...noComments(code).matchAll(/"([^"\s]*\.[A-Za-z0-9]{1,4})"/g)].map((m) => m[1])
        return names.length >= 1 && names.every((n) => SD_NAME.test(n))
      },
    },
    {
      id: 'yaz-kapat',
      text: 'Dosyayı FILE_WRITE ile aç, println ile yaz, sonra close() ya da flush() çağır.',
      hint: 'Veri karta close() ya da flush() ile gider. File dosya = SD.open("TEST.TXT", FILE_WRITE); dosya.println("..."); dosya.close();',
      check: ({ code }) => {
        const c = noComments(code)
        return /FILE_WRITE/.test(c) && /\.\s*(?:println|print)\s*\(/.test(c) && /\.\s*(?:close|flush)\s*\(/.test(c)
      },
    },
    {
      id: 'ilerleme-mesaji',
      text: 'Programı çalıştır: SD.begin’e geçmeden seri monitörde bir ilerleme mesajı görünsün (örneğin "SD kart baslatiliyor...").',
      hint: 'Serial.begin(9600); sonra SD.begin’den ÖNCE Serial.print ya da println ile bir mesaj yaz. Laboratuvarda kart olmadığı için program SD.begin’de bekler; mesaj sayesinde nerede takıldığını görürsün.',
      behavior: true,
      check: ({ lab }) => (lab?.serial ?? '').trim().length > 0,
    },
  ],
  solution: () => ({
    circuit: unoOnly(),
    code: `#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;

void setup() {
  Serial.begin(9600);
  Serial.print("SD kart baslatiliyor... ");
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: kart yok ya da baglanti yanlis");
    while (true) {}
  }
  Serial.println("tamam");

  File dosya = SD.open("TEST.TXT", FILE_WRITE);
  if (dosya) {
    dosya.println("Merhaba SD kart");
    dosya.println(millis());
    dosya.close();
    Serial.println("Yazildi");
  } else {
    Serial.println("HATA: dosya acilamadi");
  }
}

void loop() {
}
`,
  }),
  scenario: (s) => s.advance(1500),
}

// ---------------------------------------------------------------- Ders 68: CSV ve zaman damgası
const csvCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('rtc', 'rtc', 380, 40), part('dht', 'dht', 380, 200, { type: 'dht22', tempC: 23.5, humidity: 55 }))
  i2cWire(c, 'rtc')
  w(c, ['dht', 'VCC'], ['uno', '5V']); w(c, ['dht', 'GND'], ['uno', 'GND2']); w(c, ['dht', 'DATA'], ['uno', 'D5'])
  return c
}

const CSV_CODE = `#include <Wire.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const unsigned long OLCUM_ARALIGI = 5000;   // ms

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);

void setup() {
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  // ilk satır: sütun başlıkları (zaman,sicaklik_C,nem_yuzde)
}

void loop() {
  // 5 saniyede bir: zaman damgası (YYYY-AA-GG SS:DD:SN), sıcaklık ve nemi
  // virgülle ayrılmış TEK satır olarak yazdır. Tek haneli sayılara baştan 0 koy.
}
`

const csvKayit: LabActivity = {
  intro: 'RTC ve DHT22’yi bağla, her 5 saniyede bir "zaman damgası, sıcaklık, nem" biçiminde CSV satırı yazdır. Çalışırken DHT’nin sıcaklığını değiştirip satırların izlediğini gör.',
  starter: () => ({ circuit: unoOnly(), code: CSV_CODE }),
  allowedParts: ['rtc', 'dht'],
  goals: [
    {
      id: 'rtc',
      text: 'RTC modülünü bağla: VCC → 5V, GND → GND, SDA → A4, SCL → A5.',
      hint: '"Parça ekle" menüsünden RTC’yi seç. SDA A4’e, SCL A5’e gider; besleme eksikse modül cevap vermez.',
      check: (ctx) => partsOf(ctx.circuit, 'rtc').some((r) => i2cOk(ctx, r.id)),
    },
    {
      id: 'dht',
      text: 'DHT22’yi bağla: DATA → D5, VCC → 5V, GND → GND.',
      hint: 'DHT’nin DATA ucu koddaki DHT_PIN olan D5’e gider. Modülün "Tür" özelliği DHT22 olsun.',
      check: (ctx) => partsOf(ctx.circuit, 'dht').some((d) => to5V(ctx, d.id, 'VCC') && toGnd(ctx, d.id, 'GND') && toUno(ctx, d.id, 'DATA', 'D5')),
    },
    {
      id: 'baslik',
      text: 'Programı çalıştır: ilk satırda üç sütun adı (virgülle ayrılmış) yazsın.',
      hint: 'setup() içinde Serial.println("zaman,sicaklik_C,nem_yuzde"); Sütun adlarını sen seçebilirsin ama üç tane olsun.',
      behavior: true,
      check: ({ lab }) => {
        const first = lines(lab?.serial ?? '')[0] ?? ''
        const cols = first.split(',')
        return cols.length === 3 && cols.every((x) => /^[A-Za-z_]\w*$/.test(x.trim()))
      },
    },
    {
      id: 'satirlar',
      text: 'Altında en az üç veri satırı olsun: "2026-01-01 00:00:05,23.5,55.0" biçiminde (zaman, sıcaklık, nem).',
      hint: 'Zaman damgasında ay, gün, saat, dakika, saniye hep iki haneli olsun. Ondalık ayırıcı nokta, sütun ayracı virgül. Sayıyı yazıya çevirmek için dtostrf(x, 1, 1, tampon) kullanabilirsin.',
      behavior: true,
      check: ({ lab }) => csvRows(lab?.serial ?? '').length >= 3,
    },
    {
      id: 'zaman-artar',
      text: 'Satırların zaman damgaları birbirinden farklı olsun ve artarak gitsin.',
      hint: 'Zamanı rtc.now() ile oku, her satırda yeniden oku. Satırlar arası bekleme için delay yerine millis() kullanmak daha iyidir.',
      behavior: true,
      check: ({ lab }) => {
        const z = csvRows(lab?.serial ?? '').map((l) => l.slice(0, 19))
        return z.length >= 2 && z.every((t, i) => i === 0 || t > z[i - 1])
      },
    },
    {
      id: 'sicaklik-izler',
      text: 'DHT’nin sıcaklığını çalışırken değiştir: satırlarda en az iki farklı sıcaklık değeri görünsün.',
      hint: 'Çalışırken DHT’yi seç, sağ panelde Sıcaklık değerini değiştir (örneğin 23,5 → 27). Bir sonraki ölçümde satıra yansır. Satır değişmiyorsa her turda dht.readTemperature() çağırdığından emin ol.',
      behavior: true,
      check: ({ lab }) => new Set(csvRows(lab?.serial ?? '').map((l) => l.split(',')[1])).size >= 2,
    },
  ],
  solution: () => ({
    circuit: csvCircuit(),
    code: `#include <Wire.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const unsigned long OLCUM_ARALIGI = 5000;   // ms

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
unsigned long sonOlcum = 0;
bool ilkOlcum = true;

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

void setup() {
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();
  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {
    ilkOlcum = false;
    sonOlcum = simdi;
    float sicak = dht.readTemperature();
    float nem = dht.readHumidity();
    Serial.println(satirOlustur(rtc.now(), sicak, nem));
  }
}
`,
  }),
  scenario: (s) => {
    s.advance(6000)
    s.setProp('dht', 'tempC', 27)
    s.advance(6000)
  },
}

// ---------------------------------------------------------------- Ders 69: Haberleşme protokolleri (UART bit süresi ölçümü)
const UART_CODE = `const int PENCERE = 4;       // ölçüm penceresi: yazma süresince HIGH
const int BAYT = 100;

void setup() {
  pinMode(PENCERE, OUTPUT);

  // Her hız için (örneğin 9600 ve 38400):
  //   Serial.begin(hız); Serial.flush();
  //   D4'ü HIGH yap, micros() ile süreyi başlat
  //   100 tane 'U' gönder (Serial.write), Serial.flush() ile bitmesini bekle
  //   süreyi oku, D4'ü LOW yap, Serial.end()
  //
  // Sonunda Serial.begin(9600) ile her hız için bir satır yazdır:
  //   "9600 baud: bit suresi 104.4 us"
}

void loop() {
}
`

const parseBauds = (serial: string) =>
  [...serial.matchAll(/(\d+)\s*baud\D*?(\d+(?:\.\d+)?)\s*us/g)].map((m) => ({ baud: Number(m[1]), us: Number(m[2]) }))

const protokol: LabActivity = {
  intro: 'Devre yok: yalnız Uno ve kod. UART’ta bir bitin süresini ölç: 100 baytı farklı baud hızlarında gönder, D4 pencere pinini ve micros() ile süreyi bul, bit süresini seri monitöre yazdır.',
  starter: () => ({ circuit: unoOnly(), code: UART_CODE }),
  allowedParts: [],
  goals: [
    {
      id: 'olcum-kodu',
      text: 'Kodda süreyi micros() ile ölç ve gönderimin bitmesini Serial.flush() ile bekle.',
      hint: 'unsigned long t0 = micros(); ... Serial.flush(); unsigned long sure = micros() - t0; flush olmadan ölçüm, baytlar sıraya girer girmez biter ve çok kısa çıkar.',
      check: ({ code }) => /micros\s*\(/.test(noComments(code)) && /Serial\.flush\s*\(/.test(noComments(code)),
    },
    {
      id: 'pencere',
      text: 'Programı çalıştır: D4 pencere pini ölçüm boyunca HIGH kalıp bitince LOW’a dönsün.',
      hint: 'pinMode(4, OUTPUT); gönderimden önce D4’ü HIGH, ölçüm bitince LOW yap. Ölçümler arasında çok kısa boşluk kalırsa D4 tek uzun pencere gibi görünür; aralarına delay(20) koyarak ayrı ayrı gör.',
      behavior: true,
      check: ({ stats }) => (stats?.pinEdges['D4'] ?? 0) >= 1,
    },
    {
      id: 'iki-hiz',
      text: 'Seri monitörde en az iki farklı hız için "<hız> baud: bit suresi <değer> us" satırı görünsün.',
      hint: 'Satır biçimi: 9600 baud: bit suresi 104.4 us. Bit süresi = ölçülen süre / (BAYT x 10); her bayt 10 bittir (1 başlangıç, 8 veri, 1 bitiş).',
      behavior: true,
      check: ({ lab }) => new Set(parseBauds(lab?.serial ?? '').map((x) => x.baud)).size >= 2,
    },
    {
      id: 'dogru-sure',
      text: 'Yazdırdığın bit süreleri 1 / baud hesabına yüzde 5 yakınlıkta olsun.',
      hint: '9600 baud için bit yaklaşık 104 µs, 38400 için yaklaşık 26 µs olmalı. Bayt başına 10 bit (BAYT x 10) böldüğünden emin ol.',
      behavior: true,
      check: ({ lab }) => {
        const r = parseBauds(lab?.serial ?? '')
        return r.length >= 2 && r.every((x) => Math.abs(x.us - 1e6 / x.baud) <= (1e6 / x.baud) * 0.05)
      },
    },
    {
      id: 'hizli',
      text: '9600’den daha hızlı bir baud değeri de ölç.',
      hint: 'Yüksek hız bitleri kısaltır: 19200 ya da 38400 dene.',
      behavior: true,
      check: ({ lab }) => parseBauds(lab?.serial ?? '').some((x) => x.baud > 9600),
    },
  ],
  solution: () => ({
    circuit: unoOnly(),
    code: `const int PENCERE = 4;
const int BAYT = 100;
const long HIZLAR[] = {9600, 19200, 38400};
unsigned long sureUs[3];

void setup() {
  pinMode(PENCERE, OUTPUT);

  for (int i = 0; i < 3; i++) {
    Serial.begin(HIZLAR[i]);
    Serial.flush();
    digitalWrite(PENCERE, HIGH);
    unsigned long t0 = micros();
    for (int k = 0; k < BAYT; k++) {
      Serial.write('U');
    }
    Serial.flush();
    sureUs[i] = micros() - t0;
    digitalWrite(PENCERE, LOW);
    Serial.end();
  }

  Serial.begin(9600);
  Serial.println();
  for (int i = 0; i < 3; i++) {
    Serial.print(HIZLAR[i]);
    Serial.print(" baud: bit suresi ");
    Serial.print(sureUs[i] / (BAYT * 10.0), 1);
    Serial.println(" us");
  }
}

void loop() {
}
`,
  }),
  scenario: (s) => s.advance(1500),
}

// ---------------------------------------------------------------- Ders 70: Proje, sıcaklık ve nem veri kaydedici
const kaydediciCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(
    part('dht', 'dht', 380, 40, { type: 'dht22', tempC: 23.5, humidity: 55 }), part('rtc', 'rtc', 380, 200), part('lcd', 'lcdI2c', 380, 340, { address: '0x27' }),
    part('btn', 'button', 560, 40),
  )
  w(c, ['dht', 'VCC'], ['uno', '5V']); w(c, ['dht', 'GND'], ['uno', 'GND2']); w(c, ['dht', 'DATA'], ['uno', 'D5'])
  i2cWire(c, 'rtc'); i2cWire(c, 'lcd', 'GND3')
  w(c, ['btn', 'A'], ['uno', 'D2']); w(c, ['btn', 'B'], ['uno', 'GND2'])
  return c
}

const KAYDEDICI_CODE = `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const int BUTON = 2;                          // kaydı durdur / sürdür
const uint32_t KAYIT_ARALIGI = 10;            // saniye
const unsigned long KONTROL_ARALIGI = 200;    // ms: RTC'ye bu sıklıkta bak

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 16, 2);

bool kayitAcik = true;
bool oncekiBasili = false;
unsigned long sonButon = 0;
unsigned long sonKontrol = 0;
uint32_t sonKayit = 0;                        // son satırın RTC saniyesi (unixtime)
uint32_t sonEkran = 0;                        // ekranın son güncellendiği saniye
float sonSicak = NAN;
float sonNem = NAN;

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

void kaydet(const String& satir) {
  Serial.println(satir);
}

void ekranYaz(DateTime t) {
  lcd.setCursor(0, 0);
  lcd.print("T:");
  if (isnan(sonSicak)) lcd.print("--"); else lcd.print(sonSicak, 1);
  lcd.print("C N:%");
  if (isnan(sonNem)) lcd.print("--"); else lcd.print(sonNem, 1);
  lcd.print("      ");
  lcd.setCursor(0, 1);
  lcd.print(ikiHane(t.hour()));
  lcd.print(':');
  lcd.print(ikiHane(t.minute()));
  lcd.print(':');
  lcd.print(ikiHane(t.second()));
  lcd.print(kayitAcik ? " KAYIT    " : " DURDU    ");
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  lcd.init();
  lcd.backlight();
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();

  // Buton: basıldığı an kaydı aç/kapat (50 ms sıçrama koruması)
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonButon > 50) {
    sonButon = simdi;
    kayitAcik = !kayitAcik;
    sonEkran = 0;                             // ekranı hemen yenile
  }
  oncekiBasili = basili;

  if (simdi - sonKontrol >= KONTROL_ARALIGI) {
    sonKontrol = simdi;
    DateTime t = rtc.now();
    uint32_t u = t.unixtime();

    // RTC saniyesi aralığa tam bölünüyorsa ve bu saniye daha yazılmadıysa: satır üret
    if (kayitAcik && u % KAYIT_ARALIGI == 0 && u != sonKayit) {
      sonKayit = u;
      sonSicak = dht.readTemperature();
      sonNem = dht.readHumidity();
      kaydet(satirOlustur(t, sonSicak, sonNem));
    }

    if (u != sonEkran) {
      sonEkran = u;
      ekranYaz(t);
    }
  }
}
`

const kaydedici: LabActivity = {
  intro: 'Proje: veri kaydedici. Devreyi kur (DHT22, RTC, I2C LCD, kayıt butonu). Ders metnindeki program hazır yüklüdür; çalıştırıp ölçümün seri monitöre CSV satırı olarak aktığını, ekranın saati gösterdiğini ve butonun kaydı durdurduğunu dene. Sıcaklığı canlı değiştir.',
  starter: () => ({ circuit: unoOnly(), code: KAYDEDICI_CODE }),
  allowedParts: ['dht', 'rtc', 'lcdI2c', 'button'],
  goals: [
    {
      id: 'dht',
      text: 'DHT22’yi bağla: DATA → D5, VCC → 5V, GND → GND.',
      hint: 'DATA ucu programdaki DHT_PIN olan D5’e gider. Modülün "Tür" özelliği DHT22 olsun.',
      check: (ctx) => partsOf(ctx.circuit, 'dht').some((d) => to5V(ctx, d.id, 'VCC') && toGnd(ctx, d.id, 'GND') && toUno(ctx, d.id, 'DATA', 'D5')),
    },
    {
      id: 'rtc',
      text: 'RTC’yi bağla: VCC → 5V, GND → GND, SDA → A4, SCL → A5.',
      hint: 'RTC ve LCD aynı iki kabloyu (A4, A5) paylaşır; adresleri (0x68 ve 0x27) farklı olduğu için karışmazlar.',
      check: (ctx) => partsOf(ctx.circuit, 'rtc').some((r) => i2cOk(ctx, r.id)),
    },
    {
      id: 'lcd',
      text: 'I2C LCD’yi bağla: VCC → 5V, GND → GND, SDA → A4, SCL → A5; adres özelliği 0x27 olsun.',
      hint: 'LCD’yi seç, sağ panelde I2C adresini 0x27 yap (programdaki adres bu). Yazı ▶’ten yaklaşık 1,5 saniye sonra görünür.',
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => i2cOk(ctx, l.id) && (l.props.address ?? '0x27') === '0x27'),
    },
    {
      id: 'buton',
      text: '"Kayıt aç/kapat" butonunu bağla: bir ucu D2, öbür ucu GND.',
      hint: 'Program INPUT_PULLUP kullanıyor: buton basılınca D2 LOW olur. Basmak için butonu seçip özellik panelinden "Basılı"yı aç.',
      check: (ctx) => partsOf(ctx.circuit, 'button').some((b) => (toUno(ctx, b.id, 'A', 'D2') && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', 'D2') && toGnd(ctx, b.id, 'A'))),
    },
    {
      id: 'satirlar',
      text: 'Çalıştır: seri monitörde en az iki CSV veri satırı (zaman, sıcaklık, nem) görünsün.',
      hint: 'Satırlar RTC saniyesi 10’a bölünen anlarda çıkar, yani yaklaşık 10 saniyede bir. Biraz bekle; ▶ sonrası ilk satır hemen gelir. Hiç satır yoksa RTC’nin A4/A5 kablolarına bak.',
      behavior: true,
      check: ({ lab }) => csvRows(lab?.serial ?? '').length >= 2,
    },
    {
      id: 'ekran',
      text: 'LCD’nin üst satırında son ölçüm görünsün (T: ... C N:% ...).',
      hint: 'Ekran ilk ölçümden önce "T:--C N:%--" gösterir; ilk satır yazılınca sayılar gelir. DHT bağlıysa "--" kalmaz.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => /T:-?\d+(\.\d)?C N:%\d+(\.\d)?/.test(lcdText(ctx, l.id))),
    },
    {
      id: 'durdur',
      text: 'Butona bas: LCD’nin alt satırında DURDU yazsın (kayıt dursun).',
      hint: 'Butonu seç, özellik panelinde "Basılı"yı açıp kapat (kısa bir basış yeter). Tekrar basarsan KAYIT yazısı geri gelir.',
      behavior: true,
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => /DURDU/.test(lcdText(ctx, l.id))),
    },
  ],
  solution: () => ({ circuit: kaydediciCircuit(), code: KAYDEDICI_CODE }),
  scenario: (s) => {
    s.advance(22000)                       // 00:00:00, :10, :20 satırları
    s.setProp('btn', 'pressed', true)
    s.advance(150)
    s.setProp('btn', 'pressed', false)
    s.advance(1500)                        // DURDU
  },
}

export const m4h7Activities: Record<string, LabActivity> = {
  'sensorler-ve-projeler:7:1': rtcAlarm,
  'sensorler-ve-projeler:7:2': sdKart,
  'sensorler-ve-projeler:7:3': csvKayit,
  'sensorler-ve-projeler:7:4': protokol,
  'sensorler-ve-projeler:7:5': kaydedici,
}

import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

// Haftanın ortak başlangıç zamanı: 2026-03-14 08:30:00 (Cumartesi)
const BASLA = new Date('2026-03-14T08:30:00Z')

const satirlar = (s) => s.split(/\r?\n/).filter((l) => l.length > 0)
const sn = (str) => Date.parse(str.replace(' ', 'T') + 'Z') / 1000        // "2026-03-14 08:30:10" -> saniye

// Serial çıktısındaki CSV satırlarını (başlık hariç) ayrıştırır.
function csvSatirlari(serial) {
  return satirlar(serial).filter((l) => /^\d{4}-/.test(l)).map((l) => {
    const m = l.match(/^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d),([^,]*),([^,]*)$/)
    assert.ok(m, `satır CSV biçiminde değil (3 sütun beklenirdi): ${JSON.stringify(l)}`)
    return { ham: l, zaman: m[1], sn: sn(m[1]), sicak: m[2], nem: m[3] }
  })
}

function bas(sim, pin, ms = 100) {
  sim.drive(pin, false)
  sim.run(ms)
  sim.drive(pin, true)
}

const yaklasik = (deger, hedef, oran, mesaj) =>
  assert.ok(Math.abs(deger - hedef) <= hedef * oran, `${mesaj}: ${deger} (beklenen ~${hedef}, pay %${oran * 100})`)

export default {
  // ---------- 66: RTC ----------
  rtc_saat(sim, kaynak) {
    sim.rtc({ start: BASLA })
    sim.run(3500)
    assert.deepEqual(satirlar(sim.serial), ['2026-03-14 08:30:01', '2026-03-14 08:30:02', '2026-03-14 08:30:03'],
      `saat her saniye 1 ilerlemeli, çıktı: ${JSON.stringify(sim.serial)}`)
    sim.run(60000)                                    // dakika geçişi
    const l = satirlar(sim.serial)
    assert.equal(l.at(-1), '2026-03-14 08:31:03', `63 sn sonra 08:31:03 beklenirdi, son satır: ${l.at(-1)}`)
    for (let i = 1; i < l.length; i++) assert.equal(sn(l[i]) - sn(l[i - 1]), 1, `satırlar 1 sn arayla olmalı: ${l[i - 1]} -> ${l[i]}`)

    // Modül yoksa rtc.begin() false döner
    const yok = createSim(kaynak, { name: 'rtc_saat_yok' })
    yok.run(1500)
    assert.ok(/RTC bulunamadi/.test(yok.serial), `modül yokken uyarı beklenirdi: ${JSON.stringify(yok.serial)}`)
  },

  rtc_ayarla(sim) {
    sim.rtc({ start: BASLA })
    sim.run(8000)
    const l = satirlar(sim.serial)
    assert.equal(l[0], 'Once:  2026-03-14 08:30:00 Cumartesi', `adjust öncesi okuma: ${l[0]}`)
    assert.equal(l[1], 'Sonra: 2026-03-14 23:59:55 Cumartesi', `adjust sonrası yeniden okuma: ${l[1]}`)
    assert.ok(l.includes('2026-03-14 23:59:59 Cumartesi'), `23:59:59 satırı yok: ${JSON.stringify(l)}`)
    assert.ok(l.includes('2026-03-15 00:00:00 Pazar'), `gün geçişi (Pazar) yok: ${JSON.stringify(l)}`)
    assert.ok(l.includes('2026-03-15 00:00:01 Pazar'), `00:00:01 satırı yok: ${JSON.stringify(l)}`)
    const dongu = l.slice(2)
    for (let i = 1; i < dongu.length; i++) {
      assert.equal(sn(dongu[i].slice(0, 19)) - sn(dongu[i - 1].slice(0, 19)), 1, `1 sn arayla olmalı: ${dongu[i - 1]} -> ${dongu[i]}`)
    }
  },

  rtc_alarm(sim) {
    sim.rtc({ start: BASLA })
    sim.run(4500)
    assert.equal(sim.read(13), false, 'alarm saatinden önce LED sönük olmalı')
    assert.equal(sim.pinEdges(8, 5, 4500).length, 0, 'alarm saatinden önce buzzer sessiz olmalı')
    assert.equal(sim.serial, '', `alarmdan önce çıktı olmamalı: ${JSON.stringify(sim.serial)}`)
    sim.run(11000)                                    // t = 15,5 sn: alarm 5. sn'de başlar, 10. sn'de biter
    const yukselen = sim.pinEdges(13, 5, 15500).filter((e) => e.value)
    assert.equal(yukselen.length, 1, `aynı dakikada alarm yalnız bir kez çalmalı, yükselen kenar: ${yukselen.length}`)
    const basla = yukselen[0].t
    assert.ok(basla >= 4990 && basla <= 5300, `alarm 07:30:00'da (adjust'tan ~5 sn sonra) başlamalı, ${basla.toFixed(0)} ms`)
    const dusen = sim.pinEdges(13, basla, 15500).filter((e) => !e.value)
    assert.equal(dusen.length, 1, 'LED bir kez sönmeli')
    yaklasik(dusen[0].t - basla, 5000, 0.03, 'alarm süresi (ms)')
    const w = sim.wave(8, basla + 100, dusen[0].t - 100)
    yaklasik(w.hz, 1000, 0.04, 'buzzer frekansı (Hz)')
    assert.equal(sim.pinEdges(8, dusen[0].t + 50, 15500).length, 0, 'alarm bitince buzzer susmalı')
    assert.equal(satirlar(sim.serial).filter((x) => x === 'ALARM 07:30').length, 1, `ALARM satırı bir kez yazılmalı: ${JSON.stringify(sim.serial)}`)
  },

  rtc_ds1307(sim) {
    sim.rtc({ start: BASLA })
    sim.run(2500)
    assert.deepEqual(satirlar(sim.serial), ['2026-03-14T08:30:01', '2026-03-14T08:30:02'],
      `timestamp() ISO 8601 biçiminde olmalı, çıktı: ${JSON.stringify(sim.serial)}`)
  },

  // ---------- 67: SD kart sketch'leri yalnız derlenir (sd_yaz, sd_oku, sd_flush) ----------

  // ---------- 68: CSV ----------
  csv_fonksiyon(sim) {
    sim.run(300)
    assert.deepEqual(satirlar(sim.serial), [
      'zaman,sicaklik_C,nem_yuzde',
      '2026-03-14 08:30:05,23.5,55.0',
      '2026-12-01 00:00:00,-2.5,100.0',
      '2026-07-09 23:59:59,,',
    ], `satır biçimi (ISO tarih, nokta ondalık, sütun sırası, boş alan): ${JSON.stringify(sim.serial)}`)
  },

  csv_tr(sim) {
    sim.run(300)
    assert.deepEqual(satirlar(sim.serial), [
      'zaman;sicaklik_C;nem_yuzde',
      '2026-03-14 08:30:05;23,5;55,0',
      '2026-12-01 00:00:00;-2,5;100,0',
    ], `Türkçe biçim (; ayraç, virgül ondalık): ${JSON.stringify(sim.serial)}`)
  },

  csv_satir(sim, kaynak) {
    sim.rtc({ start: BASLA })
    const d = sim.dht({ pin: 5, type: 'DHT22', tempC: 23.5, humidity: 55 })
    sim.run(16000)
    assert.equal(satirlar(sim.serial)[0], 'zaman,sicaklik_C,nem_yuzde', 'ilk satır başlık olmalı')
    let r = csvSatirlari(sim.serial)
    assert.deepEqual(r.map((x) => x.ham), [
      '2026-03-14 08:30:00,23.5,55.0',
      '2026-03-14 08:30:05,23.5,55.0',
      '2026-03-14 08:30:10,23.5,55.0',
      '2026-03-14 08:30:15,23.5,55.0',
    ], `5 sn arayla 4 satır beklenirdi: ${JSON.stringify(sim.serial)}`)

    // Değerler değişince satırlar izler; negatif sıcaklık ve 0.0 biçimi
    d.tempC = -2.5; d.humidity = 100
    sim.run(5000)
    d.tempC = 0; d.humidity = 8.3
    sim.run(5000)
    r = csvSatirlari(sim.serial)
    assert.equal(r.at(-2).ham, '2026-03-14 08:30:20,-2.5,100.0', `negatif sıcaklık: ${r.at(-2).ham}`)
    assert.equal(r.at(-1).ham, '2026-03-14 08:30:25,0.0,8.3', `sıfır sıcaklık "0.0" yazılmalı: ${r.at(-1).ham}`)
    for (let i = 1; i < r.length; i++) assert.equal(r[i].sn - r[i - 1].sn, 5, 'satırlar 5 sn arayla olmalı')

    // DHT bağlı değilse: zaman damgası yazılır, sensör alanları boş kalır
    const yok = createSim(kaynak, { name: 'csv_satir_dht_yok' })
    yok.rtc({ start: BASLA })
    yok.run(7000)
    const ry = csvSatirlari(yok.serial)
    assert.deepEqual(ry.map((x) => x.ham), ['2026-03-14 08:30:00,,', '2026-03-14 08:30:05,,'],
      `sensör yokken boş alanlı satırlar beklenirdi: ${JSON.stringify(yok.serial)}`)
  },

  // csv_sd: SD kütüphanesi için model yok, yalnız derlenir.

  // ---------- 69: protokoller ----------
  uart_hiz(sim) {
    // Not: benzetimdeki USART D1 (TX) pininde kenar üretmez; süre, ölçüm penceresi pininden (D4) ve micros()'tan ölçülür.
    sim.run(1500)
    const kenar = sim.pinEdges(4)
    const pencereler = []
    for (let i = 0; i < kenar.length - 1; i++) if (kenar[i].value && !kenar[i + 1].value) pencereler.push((kenar[i + 1].t - kenar[i].t) * 1000)
    assert.equal(pencereler.length, 3, `3 ölçüm penceresi beklenirdi, ${pencereler.length}`)
    const hizlar = [9600, 19200, 38400]
    const yazilan = [...sim.serial.matchAll(/(\d+) baud: bit suresi ([\d.]+) us/g)].map((m) => ({ baud: +m[1], us: +m[2] }))
    assert.deepEqual(yazilan.map((y) => y.baud), hizlar, `tablo satırları: ${JSON.stringify(sim.serial.replace(/U+/, ''))}`)
    hizlar.forEach((baud, i) => {
      const ideal = 1e6 / baud
      const pencereBit = pencereler[i] / (100 * 10)               // 100 bayt x 10 bit
      yaklasik(pencereBit, ideal, 0.03, `${baud} baud: pencereden bit süresi (µs)`)
      yaklasik(yazilan[i].us, ideal, 0.03, `${baud} baud: yazdırılan bit süresi (µs)`)
      yaklasik(yazilan[i].us, pencereBit, 0.02, `${baud} baud: micros() ile pencere uyuşmalı`)
      assert.ok(pencereBit >= ideal * 0.995, `ölçülen süre ideal değerden kısa olamaz (${pencereBit.toFixed(2)} < ${ideal.toFixed(2)})`)
    })
    // 9600 baud: bit ≈ 104 µs, saniyede 960 bayt
    yaklasik(yazilan[0].us, 104.2, 0.01, '9600 baud bit süresi (µs)')
  },

  i2c_hiz(sim) {
    sim.run(500)
    const l = satirlar(sim.serial)
    assert.deepEqual(l, [
      'varsayilan: TWBR=72  SCL=100000 Hz',
      'setClock: TWBR=72  SCL=100000 Hz',
      '  2 baytlik aktarim ~ 180 us',
      'setClock: TWBR=12  SCL=400000 Hz',
      '  2 baytlik aktarim ~ 45 us',
    ], `I2C ayarları: ${JSON.stringify(sim.serial)}`)
    // Benzetimin kendi TWI hesabıyla çapraz kontrol: son ayar 400 kHz
    yaklasik(sim.twi.sclFrequency, 400000, 0.001, 'TWI SCL frekansı (Hz)')
  },

  spi_hiz(sim) {
    sim.run(300)
    assert.deepEqual(satirlar(sim.serial), [
      'DIV4  -> SCK=4000000 Hz',
      'DIV16 -> SCK=1000000 Hz',
      'DIV128 -> SCK=125000 Hz',
      'istenen 250000 Hz -> SCK=250000 Hz',
      'istenen 1000000 Hz -> SCK=1000000 Hz',
      'istenen 3000000 Hz -> SCK=2000000 Hz',
      'istenen 8000000 Hz -> SCK=8000000 Hz',
      'istenen 20000000 Hz -> SCK=8000000 Hz',
    ], `SPI SCK hızları: ${JSON.stringify(sim.serial)}`)
  },

  // ---------- 70: proje ----------
  veri_kaydedici(sim) {
    const rtc = sim.rtc({ start: BASLA })
    const dht = sim.dht({ pin: 5, type: 'DHT22', tempC: 23.5, humidity: 55 })
    const lcd = sim.lcdI2C({ address: 0x27 })
    const ekranSaati = () => lcd.text[1].slice(0, 8)
    const hhmmss = (d) => d.toISOString().slice(11, 19)

    // Açılış: başlık var, henüz ölçüm yok, ekranda "--"
    sim.run(2500)
    assert.equal(sim.serial, 'zaman,sicaklik_C,nem_yuzde\r\n', `açılışta yalnız başlık beklenirdi: ${JSON.stringify(sim.serial)}`)
    assert.equal(lcd.text[0].trimEnd(), 'T:--C N:%--', `ilk ölçümden önce ekran: ${JSON.stringify(lcd.text)}`)
    assert.ok(/^08:30:0\d KAYIT\s*$/.test(lcd.text[1]), `alt satır saat + durum olmalı: ${JSON.stringify(lcd.text)}`)

    // 10 sn aralıklı satırlar: RTC saniyesi 10'a bölünen anlar
    sim.run(32000)                                    // t = 34,5 sn
    let r = csvSatirlari(sim.serial)
    assert.deepEqual(r.map((x) => x.ham), [
      '2026-03-14 08:30:10,23.5,55.0',
      '2026-03-14 08:30:20,23.5,55.0',
      '2026-03-14 08:30:30,23.5,55.0',
    ], `10 sn arayla 3 satır beklenirdi: ${JSON.stringify(sim.serial)}`)

    // Sensör değeri değişir; sonraki satır ve ekran yeni değeri gösterir
    dht.tempC = 24.1; dht.humidity = 60.5
    sim.run(10000)                                    // t = 44,5 sn
    r = csvSatirlari(sim.serial)
    assert.equal(r.at(-1).ham, '2026-03-14 08:30:40,24.1,60.5', `değişen değer satıra yansımalı: ${r.at(-1).ham}`)
    assert.equal(lcd.text[0].trimEnd(), 'T:24.1C N:%60.5', `ekranda son ölçüm: ${JSON.stringify(lcd.text)}`)
    const simdi = hhmmss(rtc.now())
    const bir = hhmmss(new Date(rtc.now().getTime() - 1000))
    assert.ok([simdi, bir].includes(ekranSaati()), `ekran saati RTC ile uyuşmalı: ekran ${ekranSaati()}, RTC ${simdi}`)
    assert.ok(/KAYIT/.test(lcd.text[1]), `kayıt açıkken ekranda KAYIT yazmalı: ${JSON.stringify(lcd.text)}`)

    // Buton: kaydı durdur. 08:30:50 ve 08:31:00 satırları yazılmamalı
    bas(sim, 2, 100)
    sim.run(18000)                                    // t = 62,7 sn (08:31:02)
    r = csvSatirlari(sim.serial)
    assert.equal(r.at(-1).zaman, '2026-03-14 08:30:40', `durdurulmuşken satır eklenmemeli, son satır: ${r.at(-1).ham}`)
    assert.ok(/DURDU/.test(lcd.text[1]), `durmuşken ekranda DURDU yazmalı: ${JSON.stringify(lcd.text)}`)
    assert.ok([hhmmss(rtc.now()), hhmmss(new Date(rtc.now().getTime() - 1000))].includes(ekranSaati()), 'durmuşken de ekran saati akmalı')

    // Tekrar bas: kayıt sürer, aralık yine 10 sn ve 10'un katlarında
    bas(sim, 2, 100)
    sim.run(20000)                                    // t = 82,8 sn (08:31:22)
    r = csvSatirlari(sim.serial)
    assert.deepEqual(r.map((x) => x.zaman), [
      '2026-03-14 08:30:10', '2026-03-14 08:30:20', '2026-03-14 08:30:30', '2026-03-14 08:30:40',
      '2026-03-14 08:31:10', '2026-03-14 08:31:20',
    ], `duraklamadan sonra 08:31:10 ve 08:31:20 satırları beklenirdi: ${JSON.stringify(sim.serial)}`)
    assert.ok(/KAYIT/.test(lcd.text[1]), 'devam edince KAYIT yazmalı')
    for (const x of r) assert.equal(x.sn % 10, 0, `zaman damgası 10 sn'nin katı olmalı: ${x.ham}`)
    for (let i = 1; i < r.length; i++) {
      const fark = r[i].sn - r[i - 1].sn
      assert.ok(fark === 10 || (r[i - 1].zaman === '2026-03-14 08:30:40' && fark === 30), `satırlar 10 sn arayla (duraklama hariç): ${r[i - 1].zaman} -> ${r[i].zaman}`)
    }
  },

  // veri_kaydedici_sd: SD kütüphanesi için model yok, yalnız derlenir.
}

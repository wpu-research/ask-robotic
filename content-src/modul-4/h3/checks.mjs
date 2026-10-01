import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

const rakim = (hpa, p0) => 44330 * (1 - Math.pow(hpa / p0, 1 / 5.255))
const volt = (adc) => ((adc + 0.5) * 5) / 1024
// Pindeki tone bip'leri: aralarında 50 ms'den uzun boşluk olan yükselen kenar kümeleri.
function bipler(sim, pin, from, to) {
  const rises = sim.pinEdges(pin, from, to).filter((e) => e.value).map((e) => e.t)
  const out = []
  let grup = []
  for (const t of rises) {
    if (grup.length && t - grup.at(-1) > 50) { out.push(grup); grup = [] }
    grup.push(t)
  }
  if (grup.length) out.push(grup)
  return out.map((g) => ({
    basla: g[0],
    sure: g.at(-1) - g[0],
    hz: g.length > 1 ? 1000 / ((g.at(-1) - g[0]) / (g.length - 1)) : 0,
  }))
}
const satirlar = (s) => s.trim().split(/\r?\n/).filter(Boolean)

export default {
  dht_oku(sim, kaynak) {
    const d = sim.dht({ pin: 5, type: 'DHT22', tempC: 23.4, humidity: 55.2 })
    sim.run(1500)
    assert.equal(sim.serial, '', '2 sn dolmadan çıktı olmamalıydı')
    sim.run(1000)
    assert.ok(/Sicaklik: 23\.4 C {2}Nem: 55\.2 %\r?\n/.test(sim.serial), `DHT22 ondalık vermeliydi: ${JSON.stringify(sim.serial)}`)
    // canlı değişim
    d.tempC = 30.1; d.humidity = 40.5
    sim.serial = ''
    sim.run(2100)
    assert.ok(/Sicaklik: 30\.1 C {2}Nem: 40\.5 %/.test(sim.serial), `yeni değer okunmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.ok(!/hatasi/.test(sim.serial))

    // DHT11 sürümü: tablodaki iddia
    const k11 = kaynak.replace('#define DHT_TIP DHT22', '#define DHT_TIP DHT11')
    assert.notEqual(k11, kaynak, 'DHT_TIP satırı bulunamadı')
    const s11 = createSim(k11, { name: 'dht_oku_11' })
    s11.dht({ pin: 5, type: 'DHT11', tempC: 23.4, humidity: 55.2 })
    s11.run(2500)
    assert.ok(/Sicaklik: 23\.0 C {2}Nem: 55\.0 %\r?\n/.test(s11.serial), `DHT11 tam sayı vermeliydi: ${JSON.stringify(s11.serial)}`)

    // sensör yok: hata yolu
    const yok = createSim(kaynak, { name: 'dht_oku_yok' })
    yok.run(4500)
    const l = satirlar(yok.serial)
    assert.equal(l.length, 2, `2 turda 2 satır bekleniyordu: ${JSON.stringify(yok.serial)}`)
    assert.ok(l.every((x) => x === 'Okuma hatasi'), `hata mesajı bekleniyordu: ${JSON.stringify(l)}`)
    assert.ok(!/nan/i.test(yok.serial), 'nan yazdırılmamalıydı')
  },

  dht_millis(sim, kaynak) {
    const d = sim.dht({ pin: 5, type: 'DHT22', tempC: 21.7, humidity: 48.6 })
    sim.run(10100)
    const l = satirlar(sim.serial)
    assert.equal(l.length, 5, `10 sn'de 5 satır bekleniyordu: ${JSON.stringify(l)}`)
    assert.ok(l.every((x) => x === 'T=21.7 N=48.6'), `değerler: ${JSON.stringify(l)}`)
    // okumalar arası >= 2 sn: 10 sn'de en çok 5-6 fiziksel okuma
    assert.ok(d.reads >= 4 && d.reads <= 6, `fiziksel okuma sayısı ${d.reads}`)

    // sensör yok: 3. hatadan sonra SENSOR YOK
    const yok = createSim(kaynak, { name: 'dht_millis_yok' })
    yok.run(6100)
    const y = satirlar(yok.serial)
    assert.equal(y.length, 3, JSON.stringify(y))
    assert.deepEqual(y, ['SENSOR YOK  Ardisik hata: 1', 'SENSOR YOK  Ardisik hata: 2', 'SENSOR YOK  Ardisik hata: 3'])

    // sensör sonradan takılır: ilk geçerli okumada normal satırlara dönülür
    yok.dht({ pin: 5, type: 'DHT22', tempC: 20, humidity: 50 })
    yok.serial = ''
    yok.run(4100)
    const g = satirlar(yok.serial)
    assert.deepEqual(g, ['T=20.0 N=50.0', 'T=20.0 N=50.0'], JSON.stringify(g))
  },

  bmp_oku(sim, kaynak) {
    const b = sim.bmp280({ tempC: 21.5, pressurePa: 100500 })
    sim.run(1800)
    const l = satirlar(sim.serial)
    assert.ok(l.length >= 1, `çıktı yok: ${JSON.stringify(sim.serial)}`)
    const m = l.at(-1).match(/^Sicaklik: ([\d.-]+) C {2}Basinc: ([\d.]+) hPa {2}Rakim: ([\d.-]+) m$/)
    assert.ok(m, `biçim: ${JSON.stringify(l.at(-1))}`)
    assert.ok(Math.abs(Number(m[1]) - 21.5) < 0.3, `sıcaklık ${m[1]}`)
    assert.ok(Math.abs(Number(m[2]) - 1005.0) < 0.3, `basınç ${m[2]}`)
    const beklenen = rakim(1005.0, 1013.25)
    assert.ok(Math.abs(Number(m[3]) - beklenen) < 1.5, `rakım ${m[3]}, beklenen ${beklenen.toFixed(1)}`)
    // canlı değişim: basınç düşünce rakım artar
    b.pressurePa = 95461
    sim.serial = ''
    sim.run(1100)
    const m2 = satirlar(sim.serial).at(-1).match(/Basinc: ([\d.]+) hPa {2}Rakim: ([\d.-]+) m/)
    assert.ok(Math.abs(Number(m2[2]) - 500.1) < 1.5, `500 m bekleniyordu: ${m2[2]}`)

    // sensör yok: hata yolu, sayı yazdırılmaz
    const yok = createSim(kaynak, { name: 'bmp_oku_yok' })
    yok.run(3500)
    assert.ok(/^BMP280 bulunamadi\r?\n$/.test(yok.serial), `yalnız hata mesajı bekleniyordu: ${JSON.stringify(yok.serial)}`)

    // varsayılan adres (0x77) tuzağı: begin() parametresiz 0x76 modülü bulamaz
    const yanlis = createSim(kaynak.replace('bmp.begin(0x76)', 'bmp.begin()'), { name: 'bmp_oku_77' })
    yanlis.bmp280({ address: 0x76 })
    yanlis.run(500)
    assert.ok(/bulunamadi/.test(yanlis.serial), `begin() 0x76 modülü bulmamalıydı: ${JSON.stringify(yanlis.serial)}`)
  },

  bmp_rakim_formul(sim) {
    const b = sim.bmp280({ tempC: 20, pressurePa: 101325 })
    const durumlar = [[101325, 0], [95461, 500], [89875, 1000]]
    for (const [pa, yaklasik] of durumlar) {
      b.pressurePa = pa
      sim.serial = ''
      sim.run(2100)
      const m = satirlar(sim.serial).at(-1).match(/^Basinc: ([\d.]+) hPa {2}Formul: ([\d.-]+) m {2}Kutuphane: ([\d.-]+) m$/)
      assert.ok(m, `biçim: ${JSON.stringify(sim.serial)}`)
      const beklenen = rakim(pa / 100, 1013.25)
      assert.ok(Math.abs(beklenen - yaklasik) < 1, `tablo değeri yanlış: ${beklenen}`)
      assert.ok(Math.abs(Number(m[2]) - beklenen) < 1, `formül ${m[2]}, beklenen ${beklenen.toFixed(1)} (P=${pa})`)
      assert.ok(Math.abs(Number(m[3]) - beklenen) < 1, `kütüphane ${m[3]}, beklenen ${beklenen.toFixed(1)} (P=${pa})`)
      assert.ok(Math.abs(Number(m[2]) - Number(m[3])) < 0.5, 'formül ve kütüphane uyuşmalı')
    }
    // P0 değişince rakım kayar: 10 hPa ~ 84 m
    assert.ok(Math.abs((rakim(1000, 1013.25) - rakim(1000, 1003.25)) - 83.5) < 1)
  },

  bmp_p0_ayar(sim) {
    const b = sim.bmp280({ tempC: 20, pressurePa: 100000 })
    sim.run(2100)
    const p0 = Number(sim.serial.match(/P0: ([\d.]+) hPa/)[1])
    const beklenenP0 = 1000 / Math.pow(1 - 100 / 44330, 5.255)
    assert.ok(Math.abs(p0 - beklenenP0) < 0.3, `P0 ${p0}, beklenen ${beklenenP0.toFixed(1)}`)
    const r = Number(satirlar(sim.serial).at(-1).match(/Rakim: ([\d.-]+) m/)[1])
    assert.ok(Math.abs(r - 100) < 1.5, `ayardan hemen sonra 100 m bekleniyordu: ${r}`)
    // hava değişti: 1 hPa düşüş, rakım ~8 m artar
    b.pressurePa = 99900
    sim.serial = ''
    sim.run(1100)
    const r2 = Number(satirlar(sim.serial).at(-1).match(/Rakim: ([\d.-]+) m/)[1])
    assert.ok(r2 - r > 6 && r2 - r < 11, `1 hPa ~8 m bekleniyordu: ${(r2 - r).toFixed(1)} m`)
  },

  toprak_yuzde(sim, kaynak) {
    const yuzdeOku = (s, adc) => {
      s.analog(2, volt(adc))
      s.serial = ''
      s.run(700)
      const m = satirlar(s.serial).at(-1).match(/^Toprak ham=(\d+) nem=%(-?\d+)$/)
      assert.ok(m, `biçim: ${JSON.stringify(s.serial)}`)
      assert.ok(Math.abs(Number(m[1]) - adc) <= 1, `ham ${m[1]}, uygulanan ${adc}`)
      return Number(m[2])
    }
    assert.equal(yuzdeOku(sim, 800), 0)
    assert.equal(yuzdeOku(sim, 575), 50)
    assert.equal(yuzdeOku(sim, 350), 100)
    assert.equal(yuzdeOku(sim, 900), 0, 'kuru uçtan da kuru: 0 ile sınırlanmalı')
    assert.equal(yuzdeOku(sim, 200), 100, 'ıslak uçtan da ıslak: 100 ile sınırlanmalı')
    // sınırlama olmasaydı sonuç taşardı: constrain gerçekten iş görüyor
    const sinirsiz = createSim(kaynak.replace('yuzde = constrain(yuzde, 0, 100);', ''), { name: 'toprak_yuzde_sinirsiz' })
    assert.ok(yuzdeOku(sinirsiz, 200) > 100, 'constrain olmadan %100 üstü çıkmalıydı')
    // ters yönlü sensör: yalnız iki sabit değişir
    const ters = createSim(kaynak.replace('KURU = 800', 'KURU = 300').replace('ISLAK = 350', 'ISLAK = 700'), { name: 'toprak_yuzde_ters' })
    assert.equal(yuzdeOku(ters, 300), 0)
    assert.equal(yuzdeOku(ters, 500), 50)
    assert.equal(yuzdeOku(ters, 700), 100)
    assert.equal(yuzdeOku(ters, 900), 100)
  },

  toprak_kalibre(sim) {
    const son = () => satirlar(sim.serial).at(-1)
    sim.run(100)
    assert.ok(/k: kuru uc, i: islak uc/.test(sim.serial))
    sim.analog(2, volt(900)); sim.run(50)
    sim.sendSerial('k'); sim.run(100)
    assert.ok(/Kuru kaydedildi: 900\r?\n/.test(sim.serial), JSON.stringify(sim.serial))
    sim.analog(2, volt(300)); sim.run(50)
    sim.sendSerial('i'); sim.run(100)
    assert.ok(/Islak kaydedildi: 300\r?\n/.test(sim.serial), JSON.stringify(sim.serial))
    sim.analog(2, volt(600)); sim.serial = ''
    sim.run(700)
    assert.equal(son(), 'nem=%50', JSON.stringify(sim.serial))
    sim.analog(2, volt(300)); sim.serial = ''; sim.run(700)
    assert.equal(son(), 'nem=%100')
    // aynı değerde iki uç kaydedilirse hesap yapılmaz
    sim.analog(2, volt(500)); sim.run(50)
    sim.sendSerial('k'); sim.run(50); sim.sendSerial('i'); sim.run(50); sim.serial = ''
    sim.run(700)
    assert.equal(son(), 'Kalibrasyon gecersiz: uclar cok yakin')
    assert.ok(!/nem=%/.test(sim.serial))
  },

  yagmur_su(sim) {
    const oku = (yagmurV, suV) => {
      sim.analog(0, yagmurV); sim.analog(1, suV)
      sim.serial = ''; sim.run(700)
      return satirlar(sim.serial).at(-1)
    }
    assert.match(oku(4.8, 0), /^Yagmur: YOK {2}Su: BOS /)
    assert.match(oku(1.5, 0), /^Yagmur: VAR {2}Su: BOS /)
    assert.match(oku(4.8, 2), /^Yagmur: YOK {2}Su: ORTA /)
    assert.match(oku(4.8, 3.5), /^Yagmur: YOK {2}Su: DOLU /)
    assert.match(oku(1.5, 3.5), /^Yagmur: VAR {2}Su: DOLU {2}\(A0=\d+ A1=\d+\)$/)
  },

  ekran_sayfalar(sim, kaynak) {
    const d = sim.dht({ pin: 5, type: 'DHT22', tempC: 23.4, humidity: 55.2 })
    const b = sim.bmp280({ tempC: 22, pressurePa: 99000 })
    const lcd = sim.lcdI2C({ address: 0x27 })
    sim.analog(2, volt(575))
    // 100 ms'de bir ekranı örnekle; sayfa numarasının değiştiği anları bul
    const ornekle = (s, lcdX, ms) => {
      const gecis = []
      let onceki = null
      const bas = s.nowMs()
      for (let t = 0; t < ms; t += 50) {
        s.run(50)
        const m = lcdX.text[0].match(/(\d)\/3$/)
        const no = m ? Number(m[1]) : null
        if (no !== onceki) { gecis.push({ no, t: s.nowMs() - bas }); onceki = no }
      }
      return gecis
    }
    sim.run(1600)
    assert.ok(lcd.backlight, 'arka ışık yanmalı')
    const g = ornekle(sim, lcd, 13000)
    // ilk kayıt: bulunduğumuz sayfa; sonraki geçişler 3 sn arayla ve sıralı
    const nolar = g.map((x) => x.no)
    for (let i = 1; i < nolar.length; i++) assert.equal(nolar[i], (nolar[i - 1] % 3) + 1, `sayfa sırası bozuk: ${JSON.stringify(g)}`)
    assert.ok(g.length >= 4, `13 sn'de en az 3 geçiş bekleniyordu: ${JSON.stringify(g)}`)
    for (let i = 2; i < g.length; i++) {
      const fark = g[i].t - g[i - 1].t
      assert.ok(Math.abs(fark - 3000) < 120, `sayfa aralığı ~3000 ms olmalı, ${fark} ms`)
    }

    // içerikler: her sayfayı sırayla yakala
    const gor = {}
    for (let t = 0; t < 9500; t += 100) {
      sim.run(100)
      const no = Number(lcd.text[0].match(/(\d)\/3$/)[1])
      gor[no] = [...lcd.text]
    }
    assert.equal(gor[1][0], 'Sic: 23.4 C  1/3', JSON.stringify(gor[1]))
    assert.equal(gor[1][1], 'Nem: 55.2 %     ', JSON.stringify(gor[1]))
    const p = gor[2][0].match(/^P:([\d.]+) hPa +2\/3$/)
    assert.ok(p && Math.abs(Number(p[1]) - 990) < 0.3, `basınç sayfası: ${JSON.stringify(gor[2])}`)
    const r = gor[2][1].match(/^Rakim: (\d+) m +$/)
    const beklenen = rakim(990, 1013.25)
    assert.ok(r && Math.abs(Number(r[1]) - beklenen) <= 1.01, `rakım ${r && r[1]}, beklenen ${beklenen.toFixed(1)}`)
    assert.equal(gor[3][0], 'Toprak: %50  3/3', JSON.stringify(gor[3]))
    assert.match(gor[3][1], /^Ham: 57[45] +$/)
    // her satır 16 karakter; eski yazıdan artık kalmaz (kısa yazı uzun yazının üstüne yazıldı)
    for (const no of [1, 2, 3]) for (const row of gor[no]) assert.equal(row.length, 16)

    // canlı değişim: sıcaklık değişince aynı sayfada güncellenir; "10.0" gibi daha kısa yazıda artık kalmaz
    d.tempC = 5.0; d.humidity = 9.5
    for (let i = 0; i < 400 && !/Sic: 5\.0 C +1\/3/.test(lcd.text[0]); i++) sim.run(50)
    assert.equal(lcd.text[0], 'Sic: 5.0 C   1/3', JSON.stringify(lcd.text))
    assert.equal(lcd.text[1], 'Nem: 9.5 %      ', JSON.stringify(lcd.text))

    // buton: sayfayı hemen çevirir ve 3 sn'lik süreyi baştan başlatır
    const no = () => Number(lcd.text[0].match(/(\d)\/3$/)[1])
    const once = no()
    sim.run(1000)                       // otomatik değişime yakın olmayalım diye biraz bekle
    const n0 = no()
    sim.drive(2, false); sim.run(100); sim.drive(2, true); sim.run(50)
    assert.equal(no(), (n0 % 3) + 1, `buton sayfayı çevirmeli (önce ${n0}, sonra ${no()})`)
    sim.run(2700)
    assert.equal(no(), (n0 % 3) + 1, 'buton süreyi baştan başlatmalı: 2,7 sn sonra hâlâ aynı sayfa')
    sim.run(500)
    assert.equal(no(), (((n0 % 3) + 1) % 3) + 1, '3 sn dolunca otomatik değişmeli')

    // sensörler yokken: çökmez, "--" ve "BMP280 yok" yazar
    const yok = createSim(kaynak, { name: 'ekran_yok' })
    const lcdY = yok.lcdI2C({ address: 0x27 })
    yok.analog(2, volt(800))
    const gorY = {}
    for (let t = 0; t < 12000; t += 100) {
      yok.run(100)
      const m = lcdY.text[0].match(/(\d)\/3$/)
      if (m) gorY[m[1]] = [...lcdY.text]
    }
    assert.equal(gorY[1][0], 'Sic: -- C    1/3', JSON.stringify(gorY[1]))
    assert.equal(gorY[1][1], 'Nem: -- %       ', JSON.stringify(gorY[1]))
    assert.equal(gorY[2][0], 'BMP280 yok   2/3', JSON.stringify(gorY[2]))
    assert.equal(gorY[3][0], 'Toprak: %0   3/3', JSON.stringify(gorY[3]))

    // setup'ta sonSayfa = millis() olmasaydı ilk sayfa kısa kalırdı
    const ilkSayfaSuresi = (src, ad) => {
      const s2 = createSim(src, { name: ad })
      s2.dht({ pin: 5, type: 'DHT22' }); s2.bmp280({})
      const l2 = s2.lcdI2C({ address: 0x27 })
      let basla = null
      for (let t = 0; t < 8000; t += 20) {
        s2.run(20)
        const m = l2.text[0].match(/(\d)\/3$/)
        if (m && basla === null && m[1] === '1') basla = s2.nowMs()
        if (m && basla !== null && m[1] === '2') return s2.nowMs() - basla
      }
      return null
    }
    const dogru = ilkSayfaSuresi(kaynak, 'ekran_ilk_dogru')
    const hatali = ilkSayfaSuresi(kaynak.replace('  sonSayfa = millis();                  // sayfa suresi simdi baslasin\n', ''), 'ekran_ilk_hatali')
    assert.ok(dogru > 2900 && dogru < 3200, `ilk sayfa ~3000 ms görünmeliydi: ${dogru}`)
    assert.ok(hatali !== null && hatali < 2500, `sonSayfa ayarı olmadan ilk sayfa kısa kalmalıydı: ${hatali}`)
  },


  hava_istasyonu(sim, kaynak) {
    const harita = (adc) => Math.trunc(((adc - 800) * 100) / (350 - 800))   // Arduino map() (KURU=800, ISLAK=350)
    const adcYuzde = (yz) => { let a = 800; while (harita(a) < yz) a--; return a }   // yüzdeyi veren ilk ham değer
    const y = (adc) => Math.max(0, Math.min(100, harita(adc)))
    const d = sim.dht({ pin: 5, type: 'DHT22', tempC: 24.6, humidity: 48.3 })
    sim.bmp280({ tempC: 23, pressurePa: 99000 })
    const lcd = sim.lcdI2C({ address: 0x27 })
    const rak = rakim(990, 1013.25)
    sim.analog(2, volt(adcYuzde(60)))
    const no = () => Number(lcd.text[0].match(/(\d)\/3$/)[1])
    const uyariSay = () => (sim.serial.match(/^UYARI:/gm) || []).length
    const sonDurum = () => satirlar(sim.serial).filter((l) => l.startsWith('T=')).at(-1)

    // 1) normal çalışma
    sim.run(2000)
    assert.equal(sim.read(13), false, 'normalde LED sönük')
    const t0 = sim.nowMs()
    sim.run(8000)
    assert.equal(sim.pinEdges(8, 0, sim.nowMs()).filter((e) => e.value).length, 0, 'normalde buzzer sessiz')
    assert.equal(uyariSay(), 0, `normalde uyarı satırı olmamalı: ${JSON.stringify(sim.serial)}`)
    const dm = sonDurum().match(/^T=24\.6 N=48\.3 P=([\d.]+) R=(\d+) Toprak=%(\d+) Uyari=0$/)
    assert.ok(dm, `durum satırı biçimi: ${sonDurum()}`)
    assert.ok(Math.abs(Number(dm[1]) - 990) < 0.3, `basınç ${dm[1]}`)
    assert.ok(Math.abs(Number(dm[2]) - rak) <= 1.01, `rakım ${dm[2]}, beklenen ${rak.toFixed(1)}`)
    assert.equal(Number(dm[3]), y(adcYuzde(60)), `toprak %${dm[3]}`)
    // durum satırları 2 sn arayla akar
    assert.ok(satirlar(sim.serial).filter((l) => l.startsWith('T=')).length >= 4)

    // LCD: sayfalar 3 sn'de bir döner, içerik doğru, I2C'de LCD + BMP280 birlikte
    const gor = {}
    const gecis = []
    let onceki = null
    const b0 = sim.nowMs()
    for (let t = 0; t < 9500; t += 50) {
      sim.run(50)
      const n = no()
      gor[n] = [...lcd.text]
      if (n !== onceki) { gecis.push({ n, t: sim.nowMs() - b0 }); onceki = n }
    }
    for (let i = 1; i < gecis.length; i++) assert.equal(gecis[i].n, (gecis[i - 1].n % 3) + 1)
    for (let i = 2; i < gecis.length; i++) assert.ok(Math.abs(gecis[i].t - gecis[i - 1].t - 3000) < 120, `sayfa aralığı: ${JSON.stringify(gecis)}`)
    assert.equal(gor[1][0], 'Sic: 24.6 C  1/3')
    assert.equal(gor[1][1], 'Nem: 48.3 %     ')
    assert.ok(/^P:99[0-9]\.[0-9] hPa +2\/3$/.test(gor[2][0]) && /^P:(989\.[89]|990\.[0-2])/.test(gor[2][0]), `basınç sayfası: ${JSON.stringify(gor[2])}`)
    assert.ok(/^Rakim: \d+ m +$/.test(gor[2][1]), JSON.stringify(gor[2]))
    assert.equal(gor[3][0], 'Toprak: %60  3/3')
    assert.equal(gor[3][1], 'Durum: NORMAL   ')

    // 2) toprak %24'e düşer -> uyarı
    const adc24 = adcYuzde(24)
    const yz = y(adc24)
    assert.ok(yz < 30)
    sim.analog(2, volt(adc24))
    const tU = sim.nowMs()
    sim.run(2200)
    assert.equal(sim.read(13), true, 'uyarıda LED yanmalı (2 sn içinde)')
    assert.equal(uyariSay(), 1, `tek UYARI satırı: ${JSON.stringify(sim.serial)}`)
    assert.match(sim.serial, new RegExp(`UYARI: toprak nemi %${yz} - sulama gerekli`))
    sim.run(8000)
    assert.equal(uyariSay(), 1, 'uyarı satırı tekrar yazılmamalı (yalnız durum değişince)')
    assert.match(sonDurum(), /Uyari=1$/)
    assert.equal(sim.read(13), true, 'LED uyarı boyunca yanık kalmalı')
    // buzzer: 1 kHz, ~200 ms, 2 sn arayla
    const bp = bipler(sim, 8, tU, sim.nowMs())
    assert.ok(bp.length >= 4 && bp.length <= 6, `~10 sn'de 4-6 bip bekleniyordu: ${bp.length}`)
    for (const b of bp) {
      assert.ok(Math.abs(b.hz - 1000) < 60, `bip 1 kHz: ${b.hz.toFixed(0)}`)
      assert.ok(b.sure > 140 && b.sure < 230, `bip ~200 ms: ${b.sure.toFixed(0)}`)
    }
    for (let i = 1; i < bp.length; i++) assert.ok(Math.abs(bp[i].basla - bp[i - 1].basla - 2000) < 60, 'bipler 2 sn arayla')
    // sayfa 3 ve '!' işareti
    const gor2 = {}
    for (let t = 0; t < 9500; t += 50) { sim.run(50); gor2[no()] = [...lcd.text] }
    assert.equal(gor2[3][1], 'SULAMA GEREKLI !', JSON.stringify(gor2[3]))
    assert.ok(gor2[1][1].endsWith('!') && gor2[2][1].endsWith('!'), 'her sayfada ! görünmeli')

    // 3) histerezis: %35 (30-40 arası) -> uyarı sürer
    sim.analog(2, volt(adcYuzde(35)))
    sim.run(2200)
    assert.equal(y(adcYuzde(35)), 35)
    assert.equal(sim.read(13), true, '%35: uyarı sürmeli')
    assert.ok(!/normale dondu/.test(sim.serial), '%35: uyarı bitmemeli')
    // 4) %45 -> biter
    sim.analog(2, volt(adcYuzde(45)))
    sim.run(2200)
    assert.equal(sim.read(13), false, '%45: LED sönmeli')
    assert.equal((sim.serial.match(/normale dondu: %45/g) || []).length, 1, 'normale dondu bir kez')
    const tS = sim.nowMs()
    sim.run(4500)
    assert.equal(sim.pinEdges(8, tS + 300, sim.nowMs()).filter((e) => e.value).length, 0, 'uyarı bitince buzzer susmalı')
    assert.match(sonDurum(), /Uyari=0$/)
    // 5) tekrar kurur -> ikinci uyarı
    sim.analog(2, volt(adcYuzde(10)))
    sim.run(2200)
    assert.equal(uyariSay(), 2, 'ikinci uyarı gelmeli')
    assert.equal(sim.read(13), true)

    // 6) buton sayfayı hemen çevirir
    sim.run(500)
    const n0 = no()
    sim.drive(2, false); sim.run(100); sim.drive(2, true); sim.run(50)
    assert.equal(no(), (n0 % 3) + 1, 'buton sayfayı çevirmeli')

    // 7) DHT canlı değişim
    d.tempC = 5.0
    sim.run(2200)
    assert.match(sonDurum(), /^T=5\.0 N=48\.3 /)

    // 8) eşik sınırı: %30 uyarı vermez, %29 verir
    const sinir = (adc) => {
      const s2 = createSim(kaynak, { name: 'hava_sinir' })
      s2.dht({ pin: 5, type: 'DHT22' }); s2.bmp280({}); s2.lcdI2C({ address: 0x27 })
      s2.analog(2, volt(adc))
      s2.run(3000)
      return { led: s2.read(13), uyari: /^UYARI:/m.test(s2.serial), pct: Number(s2.serial.match(/Toprak=%(\d+)/)[1]) }
    }
    const a30 = sinir(adcYuzde(30)), a29 = sinir(adcYuzde(29))
    assert.deepEqual([a30.pct, a30.led, a30.uyari], [30, false, false], '%30 uyarı vermemeli')
    assert.deepEqual([a29.pct, a29.led, a29.uyari], [29, true, true], '%29 uyarı vermeli')

    // 9) DHT ve BMP280 yok: çökmez, "--" ve "BMP280 yok", toprak uyarısı yine çalışır
    const yok = createSim(kaynak, { name: 'hava_yok' })
    const lcdY = yok.lcdI2C({ address: 0x27 })
    yok.analog(2, volt(adcYuzde(20)))
    const gorY = {}
    for (let t = 0; t < 12000; t += 100) {
      yok.run(100)
      const m = lcdY.text[0].match(/(\d)\/3$/)
      if (m) gorY[m[1]] = [...lcdY.text]
    }
    assert.match(yok.serial, /BMP280 bulunamadi/)
    assert.match(yok.serial, /^UYARI: toprak nemi %20 - sulama gerekli$/m)
    assert.match(yok.serial, /^T=-- N=-- P=-- R=-- Toprak=%20 Uyari=1$/m, JSON.stringify(yok.serial))
    assert.equal(yok.read(13), true)
    assert.ok(!/nan/i.test(yok.serial))
    assert.equal(gorY[1][0], 'Sic: -- C    1/3')
    assert.equal(gorY[2][0], 'BMP280 yok   2/3')
    assert.equal(gorY[3][1], 'SULAMA GEREKLI !')
  },

}

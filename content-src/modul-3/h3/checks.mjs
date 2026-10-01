import assert from 'node:assert/strict'

// Seri çıktının tamamlanmış satırları (son, yarım kalmış olabilecek satır atılır).
const lines = (sim) => sim.serial.split('\n').slice(0, -1).map((l) => l.trim()).filter(Boolean)
const lastLine = (sim) => lines(sim).at(-1) ?? ''
const num = (text, key) => {
  const m = text.match(new RegExp(`${key}=(-?\\d+(?:\\.\\d+)?)`))
  assert.ok(m, `"${key}=" bulunamadı: "${text}"`)
  return Number(m[1])
}
const near = (got, want, tol, msg) =>
  assert.ok(Math.abs(got - want) <= tol, `${msg}: ${want} ± ${tol} bekleniyordu, ${got}`)

// 10k NTC, B=3950, 5V - 10k - A2 - NTC - GND bölücüsü için, ADC adımları dahil beklenen °C
// (beta modeli: 1/T = 1/298,15 + ln(R/10k)/3950)
const NTC_BEKLENEN = [
  [1.0, 59.98],
  [1.5, 45.39],
  [2.0, 34.47],
  [2.5, 25.0],
  [3.0, 16.18],
  [4.0, -3.22],
]

export default {
  pot_oku(sim) {
    sim.analog(0, 2.5)
    sim.run(1300)
    const son = lastLine(sim)
    near(num(son, 'ham'), 512, 1, 'A0=2,5 V ham')
    near(num(son, 'volt'), 2.5, 0.01, 'A0=2,5 V gerilim')
    sim.analog(0, 5)
    sim.run(1100)
    near(num(lastLine(sim), 'ham'), 1023, 1, 'A0=5 V ham')
    sim.analog(0, 0)
    sim.run(1100)
    assert.equal(num(lastLine(sim), 'ham'), 0)
    assert.equal(num(lastLine(sim), 'volt'), 0)
  },

  pot_parlaklik(sim) {
    sim.analog(0, 0)
    sim.run(100)
    sim.run(100)
    assert.equal(sim.read(11), false, '0 V: LED sönük olmalı')
    sim.analog(0, 2.5)
    sim.run(100)
    const t = sim.nowMs()
    sim.run(200)
    const w = sim.wave(11, t, t + 200)
    near(w.duty, 0.5, 0.03, '2,5 V doluluk')
    near(w.hz, 490, 15, '2,5 V PWM frekansı')
    sim.analog(0, 1.25)
    sim.run(100)
    const t2 = sim.nowMs()
    sim.run(200)
    near(sim.wave(11, t2, t2 + 200).duty, 0.25, 0.03, '1,25 V doluluk')
    sim.analog(0, 5)
    sim.run(100)
    const t3 = sim.nowMs()
    sim.run(100)
    assert.ok(sim.wave(11, t3, t3 + 100).duty > 0.97, '5 V: LED tam parlak olmalı')
  },

  bolucu_hesap(sim) {
    sim.run(600)
    const l = lines(sim)
    assert.equal(l.length, 3, `3 satır bekleniyordu: ${JSON.stringify(l)}`)
    const bek = [
      ['1000', 0.45],
      ['10000', 2.5],
      ['100000', 4.55],
    ]
    bek.forEach(([r2, v], i) => {
      assert.equal(num(l[i], 'R2'), Number(r2))
      near(num(l[i], 'Vout'), v, 0.006, `R2=${r2} Vout`)
    })
  },

  isik_oku(sim) {
    const olc = (volt) => {
      sim.analog(1, volt)
      sim.run(1100)
      return lastLine(sim)
    }
    const orta = olc(2.5)
    near(num(orta, 'ham'), 512, 1, '2,5 V ham')
    near(num(orta, 'R_ldr'), 10000, 100, '2,5 V: LDR 10 kΩ olmalı')
    // 0,5 V: R = 10k * (5-0,5)/0,5 = 90 kΩ
    near(num(olc(0.5), 'R_ldr'), 90000, 2500, '0,5 V: LDR ≈ 90 kΩ')
    // 4,5 V: R = 10k * 0,5/4,5 ≈ 1,11 kΩ
    near(num(olc(4.5), 'R_ldr'), 1111, 50, '4,5 V: LDR ≈ 1,1 kΩ')
  },

  karanlik_esik(sim) {
    const dur = (volt) => {
      sim.analog(1, volt)
      sim.run(300)
      return sim.read(13)
    }
    assert.equal(dur(0.5), true, 'karanlıkta LED yanmalı')
    assert.equal(dur(1.5), true, 'orta bölgede (karanlıktan gelince) LED yanık kalmalı')
    assert.equal(dur(4.0), false, 'aydınlıkta LED sönmeli')
    assert.equal(dur(1.5), false, 'orta bölgede (aydınlıktan gelince) LED sönük kalmalı')
    assert.equal(dur(0.5), true, 'tekrar karanlıkta LED yanmalı')
  },

  ntc_sicaklik(sim) {
    for (const [volt, derece] of NTC_BEKLENEN) {
      sim.analog(2, volt)
      sim.run(1100)
      near(num(lastLine(sim), 'T'), derece, 0.4, `${volt} V -> °C`)
    }
    // 2,5 V: iki direnç eşit, R = 10 kΩ
    sim.analog(2, 2.5)
    sim.run(1100)
    near(num(lastLine(sim), 'R'), 10000, 50, 'R')
    // Kopuk/kısa devre koruması
    sim.analog(2, 0)
    sim.run(1100)
    assert.match(lastLine(sim), /hata/)
    sim.analog(2, 5)
    sim.run(1100)
    assert.match(lastLine(sim), /hata/)
  },

  ntc_steinhart(sim) {
    // Steinhart-Hart katsayıları 0/25/50 °C noktalarından kurulur: bu aralıkta beta sonucuyla uyuşmalı.
    for (const [volt, derece] of NTC_BEKLENEN.filter(([v]) => v >= 1.5 && v <= 3.0)) {
      sim.analog(2, volt)
      sim.run(1100)
      near(num(lastLine(sim), 'T'), derece, 0.6, `${volt} V -> °C (Steinhart-Hart)`)
    }
    sim.analog(2, 2.5)
    sim.run(1100)
    near(num(lastLine(sim), 'T'), 25, 0.3, '2,5 V -> 25 °C')
    sim.analog(2, 0)
    sim.run(1100)
    assert.match(lastLine(sim), /hata/)
  },

  map_constrain(sim) {
    const dene = (volt) => {
      sim.analog(0, volt)
      sim.run(700)
      const son = lastLine(sim)
      return { ham: num(son, 'ham'), p: num(son, 'p'), k: num(son, 'k') }
    }
    // 200-800 -> 0-100 (tam sayı map)
    const orta = dene(2.5)
    near(orta.ham, 512, 1, 'ham')
    near(orta.p, 52, 1, 'orta nokta yüzdesi')
    assert.equal(orta.k, orta.p)
    const alt = dene(0.4)
    assert.ok(alt.p < 0, `map sınırlamaz: negatif bekleniyordu, ${alt.p}`)
    assert.equal(alt.k, 0)
    const ust = dene(4.8)
    assert.ok(ust.p > 100, `map sınırlamaz: 100'den büyük bekleniyordu, ${ust.p}`)
    assert.equal(ust.k, 100)
  },

  kalibrasyon(sim) {
    sim.analog(1, 0.5)   // karanlık: ham ≈ 102
    sim.run(1000)
    assert.equal(sim.read(13), true, 'kalibrasyon sürerken D13 yanık olmalı')
    sim.analog(1, 4.5)   // aydınlık: ham ≈ 921
    sim.run(1000)
    sim.analog(1, 2.5)
    sim.run(1500)        // toplam ≈ 3,5 s: kalibrasyon bitti
    assert.equal(sim.read(13), false, 'kalibrasyon bitince D13 sönmeli')
    sim.run(700)
    const yuzde = () => num(lastLine(sim), 'yuzde')
    near(yuzde(), 50, 2, 'orta ışık yüzdesi')
    sim.analog(1, 0.5)
    sim.run(700)
    assert.equal(yuzde(), 0)
    sim.analog(1, 4.5)
    sim.run(700)
    assert.equal(yuzde(), 100)
    // Kalibre aralığın dışı (kırpma)
    sim.analog(1, 5)
    sim.run(700)
    assert.equal(yuzde(), 100)
    sim.analog(1, 0)
    sim.run(700)
    assert.equal(yuzde(), 0)
  },

  yumusatma(sim) {
    // 1 ms'de bir rastgele (deterministik) gürültü: 1,5-3,5 V, ortalama 2,5 V
    let tohum = 12345
    const rastgele = () => (tohum = (tohum * 1103515245 + 12345) % 2147483648) / 2147483648
    for (let i = 0; i < 4000; i++) {
      sim.analog(0, 1.5 + 2 * rastgele())
      sim.run(1)
    }
    const veri = lines(sim).map((l) => ({ ham: num(l, 'ham'), ort: num(l, 'ort') }))
    assert.ok(veri.length >= 15, `en az 15 satır bekleniyordu, ${veri.length}`)
    const sapma = (dizi) => {
      const m = dizi.reduce((a, b) => a + b, 0) / dizi.length
      return Math.sqrt(dizi.reduce((a, b) => a + (b - m) ** 2, 0) / dizi.length)
    }
    const sHam = sapma(veri.map((v) => v.ham))
    const sOrt = sapma(veri.map((v) => v.ort))
    assert.ok(sHam > 60, `ham değer gürültülü olmalı (σ=${sHam.toFixed(0)})`)
    assert.ok(sOrt < sHam / 2, `ortalama en az 2 kat daha durgun olmalı: σ_ham=${sHam.toFixed(0)}, σ_ort=${sOrt.toFixed(0)}`)
    const ortOrt = veri.reduce((a, v) => a + v.ort, 0) / veri.length
    near(ortOrt, 512, 40, 'ortalamaların ortalaması')
  },

  lamba_adim1(sim) {
    const olc = (volt) => {
      sim.analog(1, volt)
      sim.run(200)
      const t = sim.nowMs()
      sim.run(150)
      return sim.wave(11, t, t + 150).duty
    }
    assert.equal(olc(4.5), 0, 'aydınlıkta (ham 921 > 700) lamba sönük olmalı')
    assert.ok(olc(0.5) > 0.97, 'karanlıkta (ham 102 < 150) lamba tam parlak olmalı')
    // ham ≈ 424 = (150+700)/2 -> yarım parlaklık
    near(olc(2.075), 0.5, 0.05, 'orta ışıkta yarım parlaklık')
    // Daha karanlık = daha parlak (tekdüze azalan)
    assert.ok(olc(1.0) > olc(1.8) && olc(1.8) > olc(2.6), 'ışık arttıkça parlaklık azalmalı')
  },

  gece_lambasi(sim) {
    const duty = () => {
      const t = sim.nowMs()
      sim.run(150)
      return sim.wave(11, t, t + 150).duty
    }
    const ayar = ({ pot, ldr, ntc }) => {
      sim.analog(0, pot)
      sim.analog(1, ldr)
      sim.analog(2, ntc)
      sim.run(600)
    }
    // Oda sıcaklığı (25 °C): NTC 2,5 V
    ayar({ pot: 5, ldr: 0.5, ntc: 2.5 })
    assert.ok(duty() > 0.97, 'pot sonda + karanlık: tam parlak')
    assert.equal(sim.read(13), false, '25 °C: uyarı yok')
    near(num(lastLine(sim), 'sicaklik'), 25, 0.3, 'seri çıktıdaki sıcaklık')
    ayar({ pot: 5, ldr: 4.5, ntc: 2.5 })
    assert.equal(duty(), 0, 'aydınlıkta lamba sönük')
    ayar({ pot: 5, ldr: 2.075, ntc: 2.5 })
    near(duty(), 0.5, 0.06, 'orta ışıkta yarım parlaklık')
    // Potansiyometre en yüksek parlaklığı sınırlar
    ayar({ pot: 2.5, ldr: 0.5, ntc: 2.5 })
    near(duty(), 0.5, 0.05, 'pot ortada + karanlık: ≈ yarı parlaklık')
    ayar({ pot: 1.25, ldr: 0.5, ntc: 2.5 })
    near(duty(), 0.25, 0.05, 'pot çeyrekte + karanlık: ≈ çeyrek parlaklık')
    ayar({ pot: 0, ldr: 0.5, ntc: 2.5 })
    assert.equal(duty(), 0, 'pot en solda: lamba hiç yanmaz')
    // 40 °C üstü (1,5 V ≈ 45 °C): lamba kapanır, uyarı yanar
    ayar({ pot: 5, ldr: 0.5, ntc: 1.5 })
    assert.equal(duty(), 0, 'sıcakta lamba kapanmalı')
    assert.equal(sim.read(13), true, 'sıcakta uyarı LED yanmalı')
    near(num(lastLine(sim), 'sicaklik'), 45.4, 0.5, 'sıcak durumda seri sıcaklık')
    // 2,0 V ≈ 34,5 °C sınırın altında: normale döner
    ayar({ pot: 5, ldr: 0.5, ntc: 2.0 })
    assert.ok(duty() > 0.97, 'sınırın altında lamba yeniden yanmalı')
    assert.equal(sim.read(13), false)
    // Kopuk NTC (0 V): lamba çalışmaya devam eder, uyarı yok
    ayar({ pot: 5, ldr: 0.5, ntc: 0 })
    assert.ok(duty() > 0.97)
    assert.equal(sim.read(13), false)
  },
}

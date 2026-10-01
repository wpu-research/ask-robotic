import assert from 'node:assert/strict'

// Butona kısa bir süre (ms) basar ve bırakır; basış sırasında benzetim ilerler.
function bas(sim, pin, ms = 100) {
  sim.drive(pin, false)
  sim.run(ms)
  sim.drive(pin, true)
}

// Pindeki tone bip'lerini bulur: aralarında 50 ms'den uzun boşluk olan yükselen kenar kümeleri.
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

const satirSay = (s, desen) => (s.match(desen) || []).length

export default {
  // delay'li sürüm kısa basışı KAÇIRIR, uzun basışı yakalar.
  delay_kacirir(sim) {
    sim.run(200)
    bas(sim, 2, 100)                 // t = 200-300 ms: delay(1000) içinde kısa basış
    sim.run(2500)
    assert.equal(satirSay(sim.serial, /Basis sayisi/g), 0,
      `delay içindeki kısa basış kaçırılmalıydı, çıktı: ${JSON.stringify(sim.serial)}`)
    // 2 saniyelik turun sonuna denk gelen uzun basış yakalanır
    sim.drive(2, false)
    sim.run(2500)
    sim.drive(2, true)
    assert.ok(/Basis sayisi: 1/.test(sim.serial), `uzun basış sayılmalıydı, çıktı: ${JSON.stringify(sim.serial)}`)
  },

  delay_tur_sayaci(sim) {
    sim.run(5050)
    const turlar = satirSay(sim.serial, /\d+\r?\n/g)
    assert.ok(turlar >= 5 && turlar <= 6, `5 sn'de ~5 tur bekleniyordu, ${turlar} tur`)
    const w = sim.wave(13, 0, 5050)
    assert.ok(w.hz > 0.3 && w.hz < 0.7, `LED 0,5 Hz bekleniyordu, ${w.hz.toFixed(2)} Hz`)
  },

  // millis'li sürüm aynı kısa basışı YAKALAR ve LED zamanlaması bozulmaz.
  millis_blink_buton(sim) {
    sim.run(200)
    bas(sim, 2, 100)                 // delay'li sürümün kaçırdığı basışın aynısı
    sim.run(400)
    assert.ok(/Basis sayisi: 1/.test(sim.serial), `kısa basış yakalanmalıydı, çıktı: ${JSON.stringify(sim.serial)}`)
    bas(sim, 2, 30)                  // daha da kısa
    sim.run(100)
    assert.ok(/Basis sayisi: 2/.test(sim.serial), `ikinci basış sayılmalıydı, çıktı: ${JSON.stringify(sim.serial)}`)
    sim.run(4000)
    const w = sim.wave(13, 0, sim.nowMs())
    assert.ok(Math.abs(w.hz - 1) < 0.1, `LED 1 Hz bekleniyordu, ${w.hz.toFixed(2)} Hz`)
    assert.ok(Math.abs(w.duty - 0.5) < 0.1, `%50 bekleniyordu, ${(w.duty * 100).toFixed(0)}%`)
    // basılı tutmak tek basış sayılır
    sim.drive(2, false)
    sim.run(1500)
    sim.drive(2, true)
    sim.run(100)
    assert.ok(!/Basis sayisi: 4/.test(sim.serial), 'basılı tutmak tek basış sayılmalıydı')
    assert.ok(/Basis sayisi: 3/.test(sim.serial), 'üçüncü basış sayılmalıydı')
  },

  millis_iki_led(sim) {
    sim.run(6100)
    const w1 = sim.wave(13, 0, 6100)
    const w2 = sim.wave(12, 0, 6100)
    assert.ok(Math.abs(w1.hz - 0.5) < 0.05, `D13 0,5 Hz bekleniyordu, ${w1.hz.toFixed(2)} Hz`)
    assert.ok(Math.abs(w2.hz - 1 / 0.6) < 0.1, `D12 1,67 Hz bekleniyordu, ${w2.hz.toFixed(2)} Hz`)
  },

  millis_tasma(sim) {
    sim.run(100)
    assert.ok(/Dogru \(cikarma\): 100\r?\n/.test(sim.serial), `çıkarma 100 vermeliydi: ${JSON.stringify(sim.serial)}`)
    assert.ok(/Yanlis \(toplama\): sure doldu\r?\n/.test(sim.serial), `toplama yöntemi yanlış sonuç vermeliydi: ${JSON.stringify(sim.serial)}`)
    assert.ok(/Tasmadan sonra fark: 306\r?\n/.test(sim.serial), `taşma sonrası fark 306 olmalıydı: ${JSON.stringify(sim.serial)}`)
  },

  fsm_mod(sim) {
    sim.run(1100)
    assert.equal(sim.pinEdges(13, 50, 1100).length, 0, 'KAPALI modda LED hiç değişmemeliydi')
    bas(sim, 2, 60)                  // -> YAVAS
    const t1 = sim.nowMs()
    sim.run(6000)
    const w1 = sim.wave(13, t1, t1 + 6000)
    assert.ok(Math.abs(w1.hz - 0.5) < 0.06, `YAVAS 0,5 Hz bekleniyordu, ${w1.hz.toFixed(2)} Hz`)
    bas(sim, 2, 60)                  // -> HIZLI
    const t2 = sim.nowMs()
    sim.run(3000)
    const w2 = sim.wave(13, t2, t2 + 3000)
    assert.ok(Math.abs(w2.hz - 2) < 0.2, `HIZLI 2 Hz bekleniyordu, ${w2.hz.toFixed(2)} Hz`)
    bas(sim, 2, 60)                  // -> KAPALI
    const t3 = sim.nowMs()
    sim.run(2000)
    assert.equal(sim.pinEdges(13, t3 + 5, t3 + 2000).length, 0, 'KAPALI moda dönünce LED değişmemeliydi')
    assert.equal(sim.read(13), false, 'KAPALI modda LED sönük olmalıydı')
  },

  fsm_trafik(sim) {
    const durum = () => [sim.read(13), sim.read(12), sim.read(11)].map(Number).join('')
    sim.run(100)
    assert.equal(durum(), '100', `0-3 sn: yalnız kırmızı, ${durum()}`)
    sim.run(3000)                    // t = 3,1 sn
    assert.equal(durum(), '001', `3-6 sn: yalnız yeşil, ${durum()}`)
    sim.run(3000)                    // t = 6,1 sn
    assert.equal(durum(), '010', `6-7 sn: yalnız sarı, ${durum()}`)
    sim.run(1000)                    // t = 7,1 sn
    assert.equal(durum(), '100', `7 sn sonrası tekrar kırmızı, ${durum()}`)
  },

  // Kesme, ana program delay(1000) içindeyken bile basışı sayar.
  kesme_sayac(sim) {
    sim.run(100)
    for (let i = 0; i < 3; i++) { bas(sim, 2, 20); sim.run(180) }   // delay içinde 3 kısa basış
    sim.run(900)
    assert.ok(/Basis: 3\r?\n/.test(sim.serial), `3 basış sayılmalıydı, çıktı: ${JSON.stringify(sim.serial)}`)
  },

  kesme_bayrak(sim) {
    sim.run(100)
    assert.equal(satirSay(sim.serial, /Kesme geldi/g), 0, 'basmadan çıktı olmamalıydı')
    bas(sim, 2, 20)
    sim.run(100)
    assert.equal(satirSay(sim.serial, /Kesme geldi/g), 1, `1 basış 1 çıktı vermeliydi: ${JSON.stringify(sim.serial)}`)
    bas(sim, 2, 20)
    sim.run(100)
    assert.equal(satirSay(sim.serial, /Kesme geldi/g), 2, 'ikinci basış da gelmeliydi')
  },

  timer1_led(sim) {
    sim.run(5100)
    const w = sim.wave(13, 0, 5100)
    assert.ok(Math.abs(w.hz - 1) < 0.02, `1 Hz bekleniyordu, ${w.hz.toFixed(3)} Hz`)
    assert.ok(Math.abs(w.duty - 0.5) < 0.05, `%50 bekleniyordu, ${(w.duty * 100).toFixed(0)}%`)
  },

  coklu_gorev_paneli(sim) {
    // BEKLE: LED 0,5 Hz, alarm LED'i sönük, buzzer sessiz
    sim.run(4100)
    const w0 = sim.wave(13, 0, 4100)
    assert.ok(Math.abs(w0.hz - 0.5) < 0.06, `BEKLE 0,5 Hz bekleniyordu, ${w0.hz.toFixed(2)} Hz`)
    assert.equal(sim.read(12), false, 'BEKLE: alarm LED sönük olmalı')
    assert.equal(sim.pinEdges(8, 50, 4100).length, 0, 'BEKLE: buzzer sessiz olmalı')

    // MOD butonu (kesme) -> CALISIR
    bas(sim, 2, 60)
    const t1 = sim.nowMs()
    sim.run(6000)
    const w1 = sim.wave(13, t1 + 100, t1 + 6000)
    assert.ok(Math.abs(w1.hz - 2) < 0.2, `CALISIR 2 Hz bekleniyordu, ${w1.hz.toFixed(2)} Hz`)
    assert.equal(sim.read(12), false, 'CALISIR: alarm LED sönük olmalı')
    const b1 = bipler(sim, 8, t1, t1 + 6000)
    assert.ok(b1.length >= 2 && b1.length <= 4, `~2 sn'de bir bip bekleniyordu, ${b1.length} bip`)
    for (const b of b1) {
      assert.ok(Math.abs(b.hz - 1000) < 60, `bip 1 kHz olmalı, ${b.hz.toFixed(0)} Hz`)
      assert.ok(b.sure > 60 && b.sure < 140, `bip ~100 ms olmalı, ${b.sure.toFixed(0)} ms`)
    }
    if (b1.length >= 2) {
      const aralik = b1[1].basla - b1[0].basla
      assert.ok(Math.abs(aralik - 2000) < 60, `bipler 2 sn arayla olmalı, ${aralik.toFixed(0)} ms`)
    }

    // MOD butonu -> ALARM
    bas(sim, 2, 60)
    const t2 = sim.nowMs()
    sim.run(2000)
    assert.equal(sim.read(12), true, 'ALARM: alarm LED yanmalı')
    const w2 = sim.wave(13, t2 + 100, t2 + 2000)
    assert.ok(Math.abs(w2.hz - 5) < 0.5, `ALARM 5 Hz bekleniyordu, ${w2.hz.toFixed(2)} Hz`)
    const b2 = bipler(sim, 8, t2, t2 + 2000)
    assert.ok(b2.length >= 4, `ALARM: aralıklı bip bekleniyordu, ${b2.length} bip`)
    for (const b of b2) assert.ok(Math.abs(b.hz - 2000) < 120, `alarm 2 kHz olmalı, ${b.hz.toFixed(0)} Hz`)

    // SUSTUR butonu -> BEKLE
    bas(sim, 3, 60)
    sim.run(100)
    const t3 = sim.nowMs()
    assert.equal(sim.read(12), false, 'SUSTUR: alarm LED sönmeli')
    sim.run(1500)
    assert.equal(sim.pinEdges(8, t3, t3 + 1500).length, 0, 'SUSTUR sonrası buzzer susmalı')

    // ALARM kendiliğinden 5 sn sonra biter
    bas(sim, 2, 60)                  // BEKLE -> CALISIR
    bas(sim, 2, 60)                  // CALISIR -> ALARM
    sim.run(500)
    assert.equal(sim.read(12), true, 'tekrar ALARM olmalıydı')
    sim.run(5000)
    assert.equal(sim.read(12), false, '5 sn sonra ALARM kendiliğinden bitmeli')
    const t4 = sim.nowMs()
    sim.run(1200)
    assert.equal(sim.pinEdges(8, t4, t4 + 1200).length, 0, 'zaman aşımı sonrası buzzer susmalı')
  },

  komut_zaman_asimi(sim) {
    sim.run(100)
    assert.equal(sim.read(7), false, 'başta çıkış kapalı olmalı')
    // komutlar 300 ms arayla gelirken çıkış açık kalır
    for (let i = 0; i < 4; i++) { sim.sendSerial('1'); sim.run(300) }
    assert.equal(sim.read(7), true, 'komut geldikçe çıkış açık kalmalı')
    // komut kesilir: 700 ms dolmadan hâlâ açık
    sim.run(300)                     // son komuttan ~600 ms
    assert.equal(sim.read(7), true, '700 ms dolmadan çıkış açık olmalı')
    sim.run(250)                     // son komuttan ~850 ms
    assert.equal(sim.read(7), false, '700 ms komut gelmeyince çıkış kapanmalı')
    assert.ok(/Komut yok/.test(sim.serial), `uyarı yazdırılmalıydı: ${JSON.stringify(sim.serial)}`)
    // '0' komutu da kapatır
    sim.sendSerial('1'); sim.run(50)
    assert.equal(sim.read(7), true)
    sim.sendSerial('0'); sim.run(50)
    assert.equal(sim.read(7), false, "'0' komutu çıkışı kapatmalı")
  },
}

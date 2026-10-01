import assert from 'node:assert/strict'

// Yardımcılar -------------------------------------------------------------

/** Benzetimi t ms'ye getirir, pinin son `pencere` ms'deki doluluk oranını (0-1) döndürür. */
function doluluk(sim, pin, t, pencere = 100) {
  sim.run(t - sim.nowMs())
  return sim.wave(pin, t - pencere, t).duty
}

/** Benzetimi t ms'ye getirir, pinin son `pencere` ms'deki frekansını (Hz) döndürür. */
function frekans(sim, pin, t, pencere = 100) {
  sim.run(t - sim.nowMs())
  return sim.wave(pin, t - pencere, t).hz
}

/** Seri girişe karakterleri aralıklı gönderir (avr8js tek baytlık alım tamponu kullanır). */
function gonder(sim, metin) {
  for (const c of metin) { sim.sendSerial(c); sim.run(3) }
}

function yakin(gercek, beklenen, tolerans, ad) {
  assert.ok(Math.abs(gercek - beklenen) <= tolerans, `${ad}: ${beklenen} ± ${tolerans} bekleniyordu, ${Number(gercek).toFixed(3)} geldi`)
}

/** Pindeki ses patlamalarını (aralarında >20 ms boşluk olan dizileri) bulur: { baslangic, sure, hz } */
function patlamalar(sim, pin, from = 0, to = Infinity) {
  const yukselen = sim.pinEdges(pin, from, to).filter((e) => e.value).map((e) => e.t)
  const gruplar = []
  let g = []
  for (const t of yukselen) {
    if (g.length && t - g.at(-1) > 20) { gruplar.push(g); g = [] }
    g.push(t)
  }
  if (g.length) gruplar.push(g)
  return gruplar
    .filter((x) => x.length > 3)
    .map((x) => ({ baslangic: x[0], sure: x.at(-1) - x[0], hz: ((x.length - 1) * 1000) / (x.at(-1) - x[0]) }))
}

// Kontroller --------------------------------------------------------------

export default {
  // 16 · PWM ---------------------------------------------------------------
  pwm_basamak(sim) {
    const seviye = [0, 64, 128, 192, 255]
    seviye.forEach((v, k) => {
      const t = k * 1000 + 800
      sim.run(t - sim.nowMs())
      const w = sim.wave(9, k * 1000 + 300, t)
      yakin(w.duty, v / 255, 0.03, `analogWrite(9,${v}) doluluk`)
      if (v > 0 && v < 255) yakin(w.hz, 490, 15, `analogWrite(9,${v}) frekans`)
    })
  },

  pwm_nefes(sim) {
    yakin(doluluk(sim, 9, 640), 0.5, 0.08, 'yükselirken orta')
    assert.ok(doluluk(sim, 9, 1280) > 0.9, 'tepe noktasında LED neredeyse tam parlak olmalı')
    yakin(doluluk(sim, 9, 1920), 0.5, 0.08, 'alçalırken orta')
    assert.ok(doluluk(sim, 9, 2500) < 0.2, 'döngü sonunda LED neredeyse sönük olmalı')
  },

  pwm_pot(sim) {
    sim.analog(0, 0)
    sim.run(200)
    yakin(doluluk(sim, 9, 400), 0, 0.02, '0 V')
    sim.analog(0, 2.5)
    yakin(doluluk(sim, 9, 700), 0.5, 0.04, '2,5 V')
    sim.analog(0, 5)
    yakin(doluluk(sim, 9, 1000), 1, 0.02, '5 V')
  },

  // 17 · RGB ---------------------------------------------------------------
  rgb_renkler(sim, kaynak) {
    // [r, g, b] sırasıyla sketch'teki sekiz renk
    const beklenen = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [0, 255, 255], [255, 0, 255], [255, 255, 255], [255, 80, 0]]
    beklenen.forEach((renk, k) => {
      const t = k * 1000 + 700
      sim.run(t - sim.nowMs())
      ;[9, 10, 11].forEach((pin, c) => {
        const w = sim.wave(pin, k * 1000 + 300, t)
        yakin(w.duty, renk[c] / 255, 0.04, `renk ${k} kanal ${'RGB'[c]}`)
      })
    })
    assert.ok(sim.serial.includes('R=255'), 'seri monitörde R= değerleri yazılmalı')
  },

  rgb_gokkusagi(sim) {
    const d = (t) => [9, 10, 11].map((p) => doluluk(sim, p, t, 100))
    let [r, g, b] = d(1280)
    yakin(r, 0.5, 0.1, 'kırmızı→yeşil: R'); yakin(g, 0.5, 0.1, 'kırmızı→yeşil: G'); yakin(b, 0, 0.02, 'kırmızı→yeşil: B')
    ;[r, g, b] = d(3840)
    yakin(r, 0, 0.02, 'yeşil→mavi: R'); yakin(g, 0.5, 0.1, 'yeşil→mavi: G'); yakin(b, 0.5, 0.1, 'yeşil→mavi: B')
    ;[r, g, b] = d(6400)
    yakin(r, 0.5, 0.1, 'mavi→kırmızı: R'); yakin(g, 0, 0.02, 'mavi→kırmızı: G'); yakin(b, 0.5, 0.1, 'mavi→kırmızı: B')
  },

  rgb_serial(sim) {
    sim.run(200)
    gonder(sim, '255 128 0\n')
    sim.run(500)
    yakin(doluluk(sim, 9, sim.nowMs() + 100), 1, 0.02, 'R')
    yakin(doluluk(sim, 10, sim.nowMs() + 0.001), 0.5, 0.04, 'G')
    yakin(doluluk(sim, 11, sim.nowMs() + 0.001), 0, 0.02, 'B')
    assert.ok(sim.serial.includes('R=255 G=128 B=0'), `seri çıktı beklenenden farklı: ${JSON.stringify(sim.serial)}`)
    // 255'ten büyük değer sınırlanmalı
    gonder(sim, '0 0 300\n')
    sim.run(500)
    yakin(doluluk(sim, 9, sim.nowMs() + 100), 0, 0.02, 'R (ikinci)')
    yakin(doluluk(sim, 11, sim.nowMs() + 0.001), 1, 0.02, 'B (300 → 255)')
    assert.ok(sim.serial.includes('R=0 G=0 B=255'), 'constrain 300 değerini 255 yapmalı')
  },

  // 18 · Buzzer ------------------------------------------------------------
  buzzer_a4(sim) {
    sim.run(500)
    const w = sim.wave(8, 100, 500)
    yakin(w.hz, 440, 3, 'A4')
    yakin(w.duty, 0.5, 0.03, 'kare dalga doluluğu')
  },

  buzzer_gam(sim) {
    const notalar = [262, 294, 330, 349, 392, 440, 494, 523]
    notalar.forEach((n, i) => {
      const t = i * 500 + 350
      sim.run(t - sim.nowMs())
      yakin(sim.wave(8, i * 500 + 100, t).hz, n, 4, `nota ${i}`)
    })
    // 400 ms çalar, ~100 ms sessizlik: aralık sonunda pin hareketsiz olmalı
    sim.run(4000 - sim.nowMs())
    const p = patlamalar(sim, 8, 0, 4000)
    assert.equal(p.length, 8, `8 ayrı nota bekleniyordu, ${p.length} bulundu`)
    p.forEach((x) => yakin(x.sure, 400, 25, 'nota süresi'))
  },

  buzzer_oktav(sim) {
    sim.run(900)
    const a = sim.wave(8, 100, 350).hz
    const b = sim.wave(8, 600, 850).hz
    yakin(a, 440, 3, 'A4')
    yakin(b, 880, 6, 'A5')
    yakin(b / a, 2, 0.03, 'oktav oranı')
  },

  buzzer_ve_pwm(sim) {
    sim.run(500)
    yakin(sim.wave(8, 100, 500).hz, 440, 3, 'buzzer')
    const w = sim.wave(9, 100, 500)
    yakin(w.hz, 490, 15, 'D9 PWM frekansı')
    yakin(w.duty, 0.25, 0.03, 'D9 PWM doluluğu')
    assert.ok(sim.read(11), 'tone sürerken D11 analogWrite(255) ile HIGH kalmalı')
    assert.equal(sim.pinEdges(11, 100, 500).length, 0, 'D11 sabit kalmalı')
  },

  // 19 · Fonksiyonlar ------------------------------------------------------
  fonk_bip(sim) {
    sim.run(1000)
    const p = patlamalar(sim, 8, 0, 1000)
    assert.equal(p.length, 3, `3 bip bekleniyordu, ${p.length} bulundu`)
    p.forEach((x) => { yakin(x.hz, 880, 6, 'bip frekansı'); yakin(x.sure, 100, 15, 'bip süresi') })
    yakin(p[1].baslangic - p[0].baslangic, 150, 10, 'bipler arası')
  },

  fonk_melodi(sim) {
    sim.run(6500)
    const p = patlamalar(sim, 8, 0, 6500)
    const nota = [262, 262, 392, 392, 440, 440, 392, 349, 349, 330, 330, 294, 294, 262]
    const vurus = [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2]
    assert.equal(p.length, 14, `14 nota bekleniyordu, ${p.length} bulundu`)
    p.forEach((x, i) => {
      yakin(x.hz, nota[i], 5, `nota ${i} frekansı`)
      yakin(x.sure, vurus[i] * 400 * 0.9, 25, `nota ${i} süresi`)
    })
    yakin(p[7].baslangic - p[0].baslangic, 8 * 400, 25, 'ilk 8 vuruşun toplamı')
  },

  fonk_kapsam(sim) {
    sim.run(1700)
    const s = sim.serial
    assert.ok(s.includes('fonksiyonda x: 10'), 'parametre kopyasında x = 10 olmalı')
    assert.ok(s.includes('disarida sayi: 5'), 'dışarıdaki değişken değişmemeli')
    assert.ok((s.match(/yerel: 1/g) ?? []).length >= 3, 'yerel değişken her çağrıda 1 olmalı')
    assert.ok(!s.includes('yerel: 2'), 'yerel değişken birikmemeli')
    assert.ok(s.includes('toplam: 3'), 'global değişken birikmeli')
  },

  // 20 · Proje -------------------------------------------------------------
  muzik_kutusu(sim) {
    sim.analog(0, 2.5) // tempo = 140 vuruş/dk → bir vuruş 428 ms
    sim.run(100)
    yakin(doluluk(sim, 9, sim.nowMs() + 0.001), 0, 0.02, 'beklerken kırmızı sönük')
    sim.drive(2, false)
    const T0 = sim.nowMs()
    sim.run(50)
    sim.drive(2, true) // butonu bırak
    const vurusMs = 428
    const nota = [262, 262, 392, 392, 440, 440, 392, 349, 349, 330, 330, 294, 294, 262]
    const uzun = [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2]
    const basla = (i) => T0 + uzun.slice(0, i).reduce((a, b) => a + b, 0) * vurusMs
    const renkler = (i) => {
      const t = basla(i) + 300
      sim.run(t - sim.nowMs())
      return [9, 10, 11].map((p) => sim.wave(p, t - 150, t).duty)
    }
    let c = renkler(0) // do: kırmızı
    yakin(c[0], 1, 0.03, 'do R'); yakin(c[1], 0, 0.03, 'do G'); yakin(c[2], 0, 0.03, 'do B')
    c = renkler(2) // sol: camgöbeği
    yakin(c[0], 0, 0.03, 'sol R'); yakin(c[1], 1, 0.03, 'sol G'); yakin(c[2], 1, 0.03, 'sol B')
    c = renkler(4) // la: mavi
    yakin(c[0], 0, 0.03, 'la R'); yakin(c[1], 0, 0.03, 'la G'); yakin(c[2], 1, 0.03, 'la B')
    c = renkler(11) // re: turuncu
    yakin(c[0], 1, 0.03, 're R'); yakin(c[1], 80 / 255, 0.05, 're G'); yakin(c[2], 0, 0.03, 're B')

    const bitis = basla(14)
    sim.run(bitis + 200 - sim.nowMs())
    const p = patlamalar(sim, 8, 0, bitis + 200)
    assert.equal(p.length, 14, `14 nota bekleniyordu, ${p.length} bulundu`)
    p.forEach((x, i) => yakin(x.hz, nota[i], 5, `nota ${i}`))
    assert.ok(sim.serial.includes('tempo: 140'), `tempo yazdırılmalı: ${JSON.stringify(sim.serial)}`)

    // Melodi bitince mavi LED nefes almaya başlamalı
    const e1 = doluluk(sim, 11, bitis + 150, 60)
    const e2 = doluluk(sim, 11, bitis + 400, 60)
    assert.ok(e2 - e1 > 0.2, `mavi parlaklık artmalı: ${e1.toFixed(2)} → ${e2.toFixed(2)}`)
    yakin(doluluk(sim, 9, sim.nowMs() + 0.001), 0, 0.02, 'bitişte kırmızı sönük')
  },
}

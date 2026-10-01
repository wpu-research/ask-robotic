import assert from 'node:assert/strict'

// Her anahtar, derste "// sketch: <ad>" ile işaretlenmiş sketch'in adıdır.
// Fonksiyon (sim, kaynak) alır; tutmayan bir koşulda assert hatası fırlatır.
export default {
  blink(sim) {
    sim.run(4100)
    const w = sim.wave(13, 0, 4100)
    assert.ok(Math.abs(w.hz - 0.5) < 0.05, `0,5 Hz bekleniyordu, ${w.hz.toFixed(2)} Hz`)
    assert.ok(Math.abs(w.duty - 0.5) < 0.05, `%50 doluluk bekleniyordu, ${(w.duty * 100).toFixed(0)}%`)
  },

  coklu_led(sim) {
    // Tur 1200 ms: her LED sırayla 300 ms yanar (D10, D11, D12, D13).
    const sira = [10, 11, 12, 13]
    for (let tur = 0; tur < 2; tur++) {
      for (let k = 0; k < 4; k++) {
        sim.run(tur === 0 && k === 0 ? 150 : 300)
        for (const pin of sira) {
          assert.equal(sim.read(pin), pin === sira[k], `tur ${tur}, adım ${k}: D${pin} durumu yanlış`)
        }
      }
    }
  },

  dizi_led(sim) {
    // Tur 1200 ms, adım 200 ms: 13, 12, 11, 10, 11, 12
    const sira = [13, 12, 11, 10, 11, 12]
    const hepsi = [10, 11, 12, 13]
    for (let tur = 0; tur < 2; tur++) {
      for (let k = 0; k < sira.length; k++) {
        sim.run(tur === 0 && k === 0 ? 100 : 200)
        for (const pin of hepsi) {
          assert.equal(sim.read(pin), pin === sira[k], `tur ${tur}, adım ${k}: D${pin} durumu yanlış`)
        }
      }
    }
  },

  trafik_isigi(sim) {
    // [zaman ms, kırmızı D13, sarı D12, yeşil D11]
    const beklenen = [
      [500, 1, 0, 0],
      [2500, 1, 0, 0],
      [4800, 1, 0, 0],
      [5500, 0, 0, 1],
      [8000, 0, 0, 1],
      [9800, 0, 0, 1],
      [10500, 0, 1, 0],
      [11800, 0, 1, 0],
      [12500, 1, 0, 0], // ikinci tur
      [18000, 0, 0, 1],
      [23000, 0, 1, 0],
    ]
    let t = 0
    for (const [zaman, k, s, y] of beklenen) {
      sim.run(zaman - t)
      t = zaman
      assert.deepEqual(
        [sim.read(13), sim.read(12), sim.read(11)].map(Number),
        [k, s, y],
        `${zaman} ms: kırmızı/sarı/yeşil beklenen ${[k, s, y]}`,
      )
    }
    // Hiçbir anda iki LED birlikte yanmamalı.
    for (const [pin, ad] of [[13, 'kırmızı'], [12, 'sarı'], [11, 'yeşil']]) {
      const w = sim.pinEdges(pin, 0, t)
      assert.ok(w.length >= 2, `${ad} LED hiç değişmedi`)
    }
    const kirmiziYanik = sim.pinEdges(13, 0, t).filter((e) => e.value)
    assert.ok(kirmiziYanik.length >= 2, 'kırmızı ikinci turda yeniden yanmalı')
    const aralik = kirmiziYanik[1].t - kirmiziYanik[0].t
    assert.ok(Math.abs(aralik - 12000) < 100, `tur süresi 12 s olmalı, ${aralik} ms`)
  },
}

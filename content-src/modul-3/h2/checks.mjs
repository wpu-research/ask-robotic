import assert from 'node:assert/strict'

// Butona sıçramalı basış: varsayılan LOW, HIGH, LOW, HIGH, LOW (adım 0,4 ms), sonra basılı tut.
function bas(sim, pin, tutMs = 150, dizi = [false, true, false, true, false]) {
  for (const high of dizi) { sim.drive(pin, high); sim.run(0.4) }
  sim.run(tutMs)
}
// Bırakma da sıçrar: HIGH, LOW, HIGH, LOW, HIGH.
function birak(sim, pin, beklemeMs = 150) {
  for (const high of [true, false, true, false, true]) { sim.drive(pin, high); sim.run(0.4) }
  sim.run(beklemeMs)
}
// avr8js seri alıcısı tek baytlık: baytları arada bekleterek gönder.
function gonder(sim, metin) {
  for (const c of metin) { sim.sendSerial(c); sim.run(5) }
}

export default {
  buton_led(sim) {
    sim.run(20)
    assert.equal(sim.read(13), true, 'buton basılı değilken (HIGH) LED yanık olmalı')
    sim.drive(2, false); sim.run(20)
    assert.equal(sim.read(13), false, 'buton basılınca (LOW) LED sönmeli')
    sim.drive(2, true); sim.run(20)
    assert.equal(sim.read(13), true)
  },

  buton_led_duz(sim) {
    sim.run(20)
    assert.equal(sim.read(13), false, 'basılı değilken LED sönük olmalı')
    sim.drive(2, false); sim.run(20)
    assert.equal(sim.read(13), true, 'basılınca LED yanmalı')
    sim.drive(2, true); sim.run(20)
    assert.equal(sim.read(13), false, 'bırakınca LED sönmeli')
  },

  iki_giris(sim) {
    sim.run(20)
    assert.equal(sim.read(13), false); assert.equal(sim.read(12), false)
    sim.drive(2, false); sim.run(20)
    assert.equal(sim.read(13), true, 'buton -> D13'); assert.equal(sim.read(12), false)
    sim.drive(2, true); sim.drive(3, false); sim.run(20)
    assert.equal(sim.read(13), false); assert.equal(sim.read(12), true, 'eğim anahtarı -> D12')
  },

  if_else(sim) {
    sim.run(20)
    assert.equal(sim.read(13), false)
    sim.drive(2, false); sim.run(20)
    assert.equal(sim.read(13), true)
    sim.drive(2, true); sim.run(20)
    assert.equal(sim.read(13), false)
  },

  mantik(sim) {
    const dene = (b, e) => {
      sim.drive(2, !b); sim.drive(3, !e); sim.run(20)
      return [sim.read(13), sim.read(12), sim.read(11)]
    }
    // [ve, veya, eğim kapalı değil]
    assert.deepEqual(dene(false, false), [false, false, true])
    assert.deepEqual(dene(true, false), [false, true, true])
    assert.deepEqual(dene(false, true), [false, true, false])
    assert.deepEqual(dene(true, true), [true, true, false])
  },

  switch_durum(sim) {
    const dene = (b, e) => {
      sim.drive(2, !b); sim.drive(3, !e); sim.run(20)
      return [sim.read(13), sim.read(12), sim.read(11)]
    }
    assert.deepEqual(dene(false, false), [false, false, false])
    assert.deepEqual(dene(true, false), [true, false, false])
    assert.deepEqual(dene(false, true), [false, true, false])
    assert.deepEqual(dene(true, true), [false, false, true])
  },

  sicrama_var(sim) {
    sim.run(20)
    const t0 = sim.nowMs()
    // Sıçramalı tek basış (LOW, HIGH, LOW): iki düşen kenar -> LED iki kez döner, basış "kaybolur".
    bas(sim, 2, 150, [false, true, false])
    assert.equal(sim.read(13), false, 'debounce yokken sıçrama tek basışı iki say(ıp) LED sönük kalmalı')
    const kenar = sim.pinEdges(13, t0).length
    assert.ok(kenar >= 2, `LED tek basışta en az 2 kez değişmeli, ${kenar}`)
  },

  debounce_ms(sim) {
    sim.run(20)
    const t0 = sim.nowMs()
    // 10 sıçramalı basış (basarken ve bırakırken): LED tam 10 kez değişmeli.
    for (let i = 1; i <= 10; i++) {
      bas(sim, 2)
      assert.equal(sim.read(13), i % 2 === 1, `${i}. basıştan sonra LED ${i % 2 === 1 ? 'yanık' : 'sönük'} olmalı`)
      birak(sim, 2)
      assert.equal(sim.read(13), i % 2 === 1, `${i}. bırakmadan sonra LED durumu değişmemeli`)
    }
    assert.equal(sim.pinEdges(13, t0).length, 10, 'LED tam 10 kez değişmeli (basış başına bir)')
  },

  seri_yazdir(sim) {
    sim.run(100)
    assert.ok(sim.serial.includes('Hazir'), 'Hazir yazmalı')
    sim.run(600)
    assert.ok(sim.serial.includes('D2 = 1'), 'basılı değilken D2 = 1')
    sim.drive(2, false); sim.run(700)
    assert.ok(sim.serial.includes('D2 = 0'), 'basılıyken D2 = 0')
  },

  seri_komut(sim) {
    sim.run(50)
    gonder(sim, 'A'); sim.run(50)
    assert.equal(sim.read(13), true); assert.ok(sim.serial.includes('LED acik'))
    gonder(sim, 'K'); sim.run(50)
    assert.equal(sim.read(13), false); assert.ok(sim.serial.includes('LED kapali'))
    gonder(sim, 'x'); sim.run(50)
    assert.ok(sim.serial.includes('Bilinmeyen komut: x'))
  },

  seri_ayristir(sim) {
    sim.run(50)
    const t0 = sim.nowMs()
    gonder(sim, 'B3\n'); sim.run(1800)
    assert.ok(sim.serial.includes('Yanip sonme: 3'), `seri çıktı: ${JSON.stringify(sim.serial)}`)
    const yukselen = sim.pinEdges(13, t0).filter((e) => e.value).length
    assert.equal(yukselen, 3, `LED 3 kez yanmalı, ${yukselen}`)
  },

  seri_toplam(sim) {
    sim.run(50)
    gonder(sim, '12 30\n'); sim.run(200)
    assert.ok(sim.serial.includes('Toplam: 42'), `seri çıktı: ${JSON.stringify(sim.serial)}`)
  },

  kapi_zili(sim) {
    sim.run(100)
    assert.ok(sim.serial.includes('Kapi zili hazir'))
    // 3 sıçramalı basış: sayaç 1,2,3; buzzer yaklaşık 300 ms
    for (let i = 1; i <= 3; i++) {
      const t0 = sim.nowMs()
      bas(sim, 2, 400)
      assert.ok(sim.serial.includes(`Zil: ${i}`), `Zil: ${i} yazmalı; çıktı ${JSON.stringify(sim.serial)}`)
      const e = sim.pinEdges(8, t0)
      assert.equal(e.filter((x) => x.value).length, 1, 'buzzer basış başına bir kez çalmalı')
      const sure = e.find((x) => !x.value).t - e.find((x) => x.value).t
      assert.ok(Math.abs(sure - 300) < 15, `buzzer ~300 ms çalmalı, ${sure.toFixed(0)} ms`)
      assert.equal(sim.pinEdges(13, t0).filter((x) => x.value).length, 1, 'LED de bir kez yanmalı')
      birak(sim, 2, 100)
    }
    assert.ok(!sim.serial.includes('Zil: 4'), 'bırakma/sıçrama fazladan sayım üretmemeli')
    // Basılı tutmak tekrar saymaz
    bas(sim, 2, 2000)
    assert.ok(sim.serial.includes('Zil: 4') && !sim.serial.includes('Zil: 5'), 'basılı tutmak tek sayım olmalı')
    birak(sim, 2, 100)
    // S: toplam
    gonder(sim, 'S'); sim.run(100)
    assert.ok(sim.serial.includes('Toplam: 4'), 'S toplamı yazmalı')
    // Sessiz mod: eğim anahtarı kapalı -> buzzer susar, LED yanar, sayaç artar
    sim.drive(3, false); sim.run(10)
    const t1 = sim.nowMs()
    bas(sim, 2, 400)
    assert.ok(sim.serial.includes('Zil: 5'), 'sessiz modda da sayılmalı')
    assert.equal(sim.pinEdges(8, t1).length, 0, 'sessiz modda buzzer çalmamalı')
    assert.equal(sim.pinEdges(13, t1).filter((x) => x.value).length, 1, 'sessiz modda LED yanmalı')
    birak(sim, 2, 100)
    // R: sıfırla
    gonder(sim, 'R'); sim.run(100)
    assert.ok(sim.serial.includes('Sayac sifirlandi'))
    sim.drive(3, true); sim.run(10)
    bas(sim, 2, 400)
    assert.ok(sim.serial.endsWith('Zil: 1\r\n'), `sıfırlamadan sonra Zil: 1; çıktı sonu ${JSON.stringify(sim.serial.slice(-30))}`)
  },
}

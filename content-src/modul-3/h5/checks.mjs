import assert from 'node:assert/strict'

const medyan = (d) => {
  assert.ok(d.length > 0, 'darbe bulunamadı')
  const s = [...d].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}
const yakin = (deger, beklenen, tol, ad) =>
  assert.ok(Math.abs(deger - beklenen) <= tol, `${ad}: ${beklenen} ± ${tol} bekleniyordu, ${deger.toFixed(0)} geldi`)

export default {
  servo_uc_nokta(sim) {
    sim.run(3100)
    yakin(medyan(sim.pulseWidthsUs(9, 200, 900)), 544, 60, 'write(0) darbesi µs')
    yakin(medyan(sim.pulseWidthsUs(9, 1200, 1900)), 1472, 60, 'write(90) darbesi µs')
    yakin(medyan(sim.pulseWidthsUs(9, 2200, 2900)), 2400, 60, 'write(180) darbesi µs')
  },

  servo_pot(sim) {
    sim.analog(0, 0)
    sim.run(300)
    yakin(medyan(sim.pulseWidthsUs(9, 100, 300)), 544, 60, '0 V → 0 derece µs')
    sim.analog(0, 2.5)
    sim.run(300)
    yakin(medyan(sim.pulseWidthsUs(9, 400, 600)), 1472, 60, '2,5 V → 90 derece µs')
    sim.analog(0, 5)
    sim.run(300)
    yakin(medyan(sim.pulseWidthsUs(9, 700, 900)), 2400, 60, '5 V → 180 derece µs')
  },

  servo_tarama(sim) {
    sim.run(6500)
    const d = sim.pulseWidthsUs(9, 100, 6500)
    assert.ok(Math.min(...d) < 544 + 60, `tarama alt ucu ~544 µs olmalı, en küçük ${Math.min(...d).toFixed(0)}`)
    assert.ok(Math.max(...d) > 2400 - 60, `tarama üst ucu ~2400 µs olmalı, en büyük ${Math.max(...d).toFixed(0)}`)
    // ilerleme düzenli: 0'dan 180'e giderken darbe genişliği artmalı
    const ilk = medyan(sim.pulseWidthsUs(9, 100, 400))
    const orta = medyan(sim.pulseWidthsUs(9, 1300, 1500))
    assert.ok(orta > ilk + 300, 'servo ilerlemiyor')
  },

  fan_pot(sim) {
    sim.analog(0, 0)
    sim.run(300)
    assert.equal(sim.wave(6, 100, 300).duty, 0, '0 V iken fan kapalı olmalı')
    sim.analog(0, 2.5)
    sim.run(300)
    const w = sim.wave(6, 400, 600)
    assert.ok(Math.abs(w.duty - 0.5) < 0.05, `2,5 V → %50 doluluk, ${(w.duty * 100).toFixed(0)}%`)
    assert.ok(w.hz > 900 && w.hz < 1050, `D6 PWM ~976 Hz olmalı, ${w.hz.toFixed(0)} Hz`)
    sim.analog(0, 5)
    sim.run(300)
    assert.ok(sim.wave(6, 700, 900).duty > 0.97, '5 V iken fan tam hızda olmalı')
  },

  fan_rampa(sim) {
    sim.run(2000)
    const bas = sim.wave(6, 0, 200).duty
    const son = sim.wave(6, 1800, 2000).duty
    assert.ok(bas < 0.15, `başlangıç düşük hızda olmalı, %${(bas * 100).toFixed(0)}`)
    assert.ok(son > 0.8, `rampa sonunda hız yüksek olmalı, %${(son * 100).toFixed(0)}`)
    assert.ok(son > bas + 0.6, 'hız yavaşça artmalı')
  },

  motor_yon(sim) {
    sim.run(1000)
    assert.ok(sim.read(7) && !sim.read(5), 'ileri: IN1 HIGH, IN2 LOW')
    const w = sim.wave(6, 500, 1000)
    assert.ok(Math.abs(w.duty - 200 / 255) < 0.05, `ileri hız ~%78, %${(w.duty * 100).toFixed(0)}`)
    sim.run(1500) // t = 2500: dur
    assert.ok(!sim.read(7) && !sim.read(5), 'dur: IN1 ve IN2 LOW')
    assert.ok(!sim.read(6), 'dur: EN LOW')
    sim.run(1500) // t = 4000: geri
    assert.ok(!sim.read(7) && sim.read(5), 'geri: IN1 LOW, IN2 HIGH')
    const g = sim.wave(6, 3500, 4000)
    assert.ok(Math.abs(g.duty - 200 / 255) < 0.05, `geri hız ~%78, %${(g.duty * 100).toFixed(0)}`)
  },

  motor_buton(sim) {
    sim.analog(0, 2.5)
    sim.run(100)
    assert.ok(!sim.read(7) && !sim.read(5) && !sim.read(6), 'başta motor duruyor olmalı')
    sim.drive(2, false)
    sim.run(200)
    assert.ok(sim.read(7) && !sim.read(5), 'D2 basılı: ileri')
    const w = sim.wave(6, 150, 300)
    assert.ok(Math.abs(w.duty - 0.5) < 0.05, `hız ~%50 (A0 = 2,5 V), %${(w.duty * 100).toFixed(0)}`)
    sim.drive(2, true)
    sim.drive(3, false)
    sim.run(200)
    assert.ok(!sim.read(7) && sim.read(5), 'D3 basılı: geri')
    sim.drive(2, false)
    sim.run(200)
    assert.ok(!sim.read(7) && !sim.read(5) && !sim.read(6), 'iki buton birlikte: dur')
  },

  role_buton(sim) {
    sim.run(100)
    assert.ok(sim.read(7), 'başta röle bırakılmış (HIGH) olmalı')
    assert.ok(sim.pinEdges(7, 0, 100).every((e) => e.value || e.t < 0.1), 'açılıştan sonra röle pini LOW\'a inmemeli')
    sim.drive(2, false)
    sim.run(200)
    assert.ok(!sim.read(7), 'ilk basışta röle çekmeli (LOW)')
    sim.drive(2, true)
    sim.run(200)
    assert.ok(!sim.read(7), 'buton bırakılınca durum korunmalı')
    sim.drive(2, false)
    sim.run(200)
    assert.ok(sim.read(7), 'ikinci basışta röle bırakmalı')
    sim.drive(2, true)
    sim.run(100)
  },

  role_esik(sim) {
    sim.analog(0, 0.5)
    sim.run(200)
    assert.ok(sim.read(7), 'düşük değerde röle bırakılmış olmalı')
    sim.analog(0, 3.5) // ~716 > 600
    sim.run(200)
    assert.ok(!sim.read(7), 'eşik aşılınca röle çekmeli')
    sim.analog(0, 2.75) // ~563: histerezis aralığı
    sim.run(200)
    assert.ok(!sim.read(7), 'histerezis aralığında röle çekili kalmalı')
    sim.analog(0, 2.0) // ~409 < 500
    sim.run(200)
    assert.ok(sim.read(7), 'kapama eşiğinin altında röle bırakmalı')
    sim.analog(0, 2.75)
    sim.run(200)
    assert.ok(sim.read(7), 'histerezis aralığında röle bırakılmış kalmalı')
  },

  fan_servo_proje(sim) {
    // soğuk: 25 °C → 2,5 V
    sim.analog(2, 2.5)
    sim.run(1500)
    assert.equal(sim.wave(6, 500, 1500).duty, 0, 'soğukta fan kapalı olmalı')
    const park = sim.pulseWidthsUs(9, 500, 1500)
    assert.ok(Math.max(...park) - Math.min(...park) < 60, 'soğukta servo sabit olmalı')
    yakin(medyan(park), 1472, 60, 'soğukta servo 90 derecede park')
    assert.match(sim.serial, /Sicaklik: 2[45]\.\d C/, `25 °C civarı yazılmalı: ${sim.serial.slice(-60)}`)

    // sıcak: 45 °C → 1,515 V
    sim.analog(2, 1.515)
    sim.run(5000)
    const t0 = 1600
    const hiz = sim.wave(6, t0 + 500, t0 + 5000).duty
    assert.ok(Math.abs(hiz - 0.84) < 0.08, `45 °C'de fan ~%84 olmalı, %${(hiz * 100).toFixed(0)}`)
    const tarama = sim.pulseWidthsUs(9, t0 + 200, t0 + 5000)
    assert.ok(Math.min(...tarama) < 1000, `tarama alt ucu ~30 derece (~853 µs), ${Math.min(...tarama).toFixed(0)}`)
    assert.ok(Math.max(...tarama) > 1900, `tarama üst ucu ~150 derece (~2091 µs), ${Math.max(...tarama).toFixed(0)}`)
    assert.match(sim.serial, /Sicaklik: 4[456]\.\d C {2}Fan: ACIK/, 'sıcakta ACIK yazılmalı')

    // histerezis: 29 °C → 2,28 V, fan açık kalmalı
    sim.analog(2, 2.28)
    sim.run(1500)
    assert.ok(sim.wave(6, 6600 + 500, 8100).duty > 0.2, '29 °C aralığında fan açık kalmalı')

    // tekrar soğuk
    sim.analog(2, 2.5)
    sim.run(1500)
    assert.equal(sim.wave(6, 8200, 9600).duty, 0, 'soğuyunca fan kapanmalı')
    yakin(medyan(sim.pulseWidthsUs(9, 8500, 9600)), 1472, 60, 'soğuyunca servo parka dönmeli')
  },
}

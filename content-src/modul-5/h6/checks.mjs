import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { STD_MOTORS } from '../../../tools/sim/robot.mjs'

const RAD = Math.PI / 180

// Çıktıdan sayı satırlarını ("a,b,c") ayrıştırır.
const csv = (s) => s.split(/\r?\n/).filter((l) => /^-?[\d.]+(,-?[\d.]+)+$/.test(l)).map((l) => l.split(',').map(Number))

// Deterministik sözde rastgele sayı (-1..1).
function rnd(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1 }
}

// MPU6050 modelinin ham alanlarının üstüne ölçüm bozucu ekler (bal.mpu üzerinden):
// ofsetDeg: ivmeölçer montaj/ağırlık merkezi hatası (derece), gurultuG: ivmeölçer gürültüsü (g, tepe),
// titresimG/titresimHz: motor titreşimi (g, Hz). Gerçek değer bal.state'te kalır, yalnız OKUNAN değer bozulur.
function bozucu(sim, mpu, { ofsetDeg = 0, gurultuG = 0, titresimG = 0, titresimHz = 40, seed = 1 } = {}) {
  const r = rnd(seed)
  let ax = mpu.ax, az = mpu.az
  Object.defineProperty(mpu, 'ax', {
    get() {
      const a = Math.atan2(ax, az) + ofsetDeg * RAD
      const t = sim.nowMs() / 1000
      return Math.sin(a) + gurultuG * r() + titresimG * Math.sin(2 * Math.PI * titresimHz * t)
    },
    set(v) { ax = v },
  })
  Object.defineProperty(mpu, 'az', { get() { return Math.cos(Math.atan2(ax, az) + ofsetDeg * RAD) }, set(v) { az = v } })
}


// Tezgâh hareketi: robotu elle sallıyormuşuz gibi gerçek açı bilinen bir fonksiyon. Her ms mpu alanlarını besler.
const tezgahAci = (tMs) => 15 * Math.sin(2 * Math.PI * 0.4 * (tMs / 1000))          // derece
const tezgahHiz = (tMs) => 15 * 2 * Math.PI * 0.4 * Math.cos(2 * Math.PI * 0.4 * (tMs / 1000))   // °/s
function tezgah(sim, { gyroBias = 0 } = {}) {
  const m = sim.mpu6050({})
  const besle = () => {
    const t = sim.nowMs()
    m.ax = Math.sin(tezgahAci(t) * RAD); m.az = Math.cos(tezgahAci(t) * RAD); m.gy = tezgahHiz(t) + gyroBias
  }
  const loop = () => { besle(); sim.cpu.addClockEvent(loop, 16000) }
  besle(); sim.cpu.addClockEvent(loop, 16000)
  return m
}

// Pin kenarlarından ardışık aralıklar (ms).
const aralikDizi = (e) => e.slice(1).map((x, i) => x.t - e[i].t)
function aralik(e) {
  const d = aralikDizi(e)
  return { ort: d.reduce((a, b) => a + b, 0) / d.length, min: Math.min(...d), max: Math.max(...d), n: d.length }
}

export default {
  // Durağan sensör: 20° yatık. Düşen robot: açı gerçeği izler, hız pozitif ve ±500 aralığında ölçülür.
  imu_olcum(sim, kaynak) {
    const st = createSim(kaynak, { name: 'imu_olcum' })
    const m = st.mpu6050({ ax: Math.sin(20 * RAD), az: Math.cos(20 * RAD) })
    st.run(500)
    const son = csv(st.serial).at(-1)
    assert.ok(Math.abs(son[1] - 20) < 0.3, `20° bekleniyordu, ${son[1]}`)
    assert.ok(Math.abs(son[2]) < 0.3, `durağan sensörde hız ≈ 0 olmalı, ${son[2]}`)
    m.gy = 300   // jiroskop 300 °/s dönüyor: ±250'yi aşar, ±500 aralığında doğru ölçülmeli
    st.run(200)
    assert.ok(Math.abs(csv(st.serial).at(-1)[2] - 300) < 1, `100 °/s bekleniyordu: ${csv(st.serial).at(-1)}`)

    // Düşen robot (motorsuz)
    const bal = sim.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    const iz = []
    for (let t = 0; t < 1500; t++) { sim.run(1); iz.push(bal.thetaDeg) }
    assert.ok(bal.state.fell, 'kontrolsüz robot devrilmeliydi')
    const satirlar = csv(sim.serial)
    assert.ok(satirlar.length > 15, `yeterli satır yok: ${satirlar.length}`)
    let enBuyukHiz = 0
    for (const [t, aci, hiz] of satirlar) {
      const gercek = iz[Math.min(iz.length - 1, Math.round(t))]
      if (Math.abs(gercek) < 44) assert.ok(Math.abs(aci - gercek) < 4, `t=${t} ms: ölçülen ${aci}°, gerçek ${gercek.toFixed(1)}°`)
      enBuyukHiz = Math.max(enBuyukHiz, hiz)
    }
    assert.ok(enBuyukHiz > 150 && enBuyukHiz < 250, `düşerken hız 150-250 °/s arasında olmalı: ${enBuyukHiz}`)
    console.log('  [101] en büyük hız', enBuyukHiz, 'düşme anı ms', iz.findIndex((x) => Math.abs(x) >= 45))
  },

  gyro_sifir(sim) {
    sim.mpu6050({ gy: 1.8 })
    sim.run(3000)
    const m = sim.serial.match(/Sapma: (-?[\d.]+)/)
    assert.ok(m, `Sapma satırı yok: ${JSON.stringify(sim.serial)}`)
    assert.ok(Math.abs(Number(m[1]) - 1.8) < 0.05, `sapma 1,80 bekleniyordu: ${m[1]}`)
    const hizlar = [...sim.serial.matchAll(/Hiz: (-?[\d.]+)/g)].map((x) => Number(x[1]))
    assert.ok(hizlar.length >= 5, `Hiz satırı az: ${hizlar.length}`)
    for (const h of hizlar) assert.ok(Math.abs(h) < 0.1, `düzeltilmiş hız ≈ 0 olmalı: ${h}`)
  },

  tamamlayici_filtre(sim) {
    const m = tezgah(sim, { gyroBias: 2 })
    bozucu(sim, m, { gurultuG: 0.12, titresimG: 0.08, titresimHz: 37, seed: 5 })
    sim.run(20000)
    const satir = csv(sim.serial).filter((r) => r[0] >= 2000)
    assert.ok(satir.length > 150, `satır sayısı: ${satir.length}`)
    const rms = [0, 0, 0], son = [0, 0, 0], enb = [0, 0, 0]
    for (const [t, ...o] of satir) {
      const g = tezgahAci(t)
      o.forEach((v, i) => { rms[i] += (v - g) ** 2; son[i] = v - g; enb[i] = Math.max(enb[i], Math.abs(v - g)) })
    }
    const [rIvme, rJiro, rFiltre] = rms.map((x) => Math.sqrt(x / satir.length))
    console.log(`  [102] RMS ivme ${rIvme.toFixed(2)} jiro ${rJiro.toFixed(2)} filtre ${rFiltre.toFixed(2)} | en büyük ${enb.map((x) => x.toFixed(2))} | son ${son.map((x) => x.toFixed(2))}`)
    assert.ok(rIvme > 4, `ivmeölçer gürültüsü görünmeliydi: ${rIvme}`)
    assert.ok(Math.abs(son[1]) > 20, `saf integral ~20 sn sonra çok kaymalıydı: ${son[1]}`)
    assert.ok(rFiltre < rIvme / 1.8, `filtre ivmeölçerden belirgin iyi olmalı: ${rFiltre} vs ${rIvme}`)
    assert.ok(rFiltre < rJiro / 8, `filtre saf integralden çok iyi olmalı: ${rFiltre} vs ${rJiro}`)
    assert.ok(rFiltre < 1, `filtre RMS hatası < 1° olmalı: ${rFiltre}`)
  },

  // delay() döngüsü: periyot 5 ms'den uzun ve dalgalı; sabit dt varsayımı açıyı küçük hesaplar.
  delay_dongusu(sim) {
    sim.mpu6050({ gy: 50 })
    sim.run(4000)
    const f = aralik(sim.pinEdges(13, 500, 4000))
    console.log(`  [103] delay: ort ${f.ort.toFixed(3)} min ${f.min.toFixed(3)} max ${f.max.toFixed(3)} ms`)
    assert.ok(f.ort > 5.2 && f.ort < 5.6, `delay(5) turu 5 ms'den uzun olmalı: ${f.ort}`)
    assert.ok(f.max - f.min > 0.8, `Serial.print turu uzatmalı (dalgalanma): ${f.min}..${f.max}`)
    const [t, sabit, olculen] = csv(sim.serial).at(-1)
    const gercek = 50 * (t / 1000)
    assert.ok(Math.abs(olculen - gercek) / gercek < 0.02, `ölçülen dt ile açı doğru olmalı: ${olculen} vs ${gercek}`)
    assert.ok((gercek - sabit) / gercek > 0.04, `sabit 5 ms varsayımı açıyı küçük bulmalı: ${sabit} vs ${gercek}`)
    console.log(`  [103] t=${t} ms gerçek ${gercek.toFixed(1)} sabit-dt ${sabit} ölçülen-dt ${olculen}`)
  },

  sabit_dongu(sim) {
    sim.mpu6050({ gy: 50 })
    sim.run(4000)
    const f = aralik(sim.pinEdges(13, 500, 4000))
    console.log(`  [103] sabit: ort ${f.ort.toFixed(4)} min ${f.min.toFixed(4)} max ${f.max.toFixed(4)} ms`)
    assert.ok(Math.abs(f.ort - 5) < 0.01, `periyot 5,000 ms olmalı: ${f.ort}`)
    assert.ok(f.min > 4.98 && f.max < 5.02, `periyot ±20 µs içinde sabit olmalı: ${f.min}..${f.max}`)
    const [t, sabit, olculen, kucuk, buyuk, tasma] = csv(sim.serial).at(-1)
    const gercek = 50 * (t / 1000)
    assert.ok(Math.abs(olculen - gercek) / gercek < 0.01 && Math.abs(sabit - gercek) / gercek < 0.01, `iki açı da doğru olmalı: ${sabit}, ${olculen} vs ${gercek}`)
    assert.ok(kucuk >= 4980 && buyuk <= 5020, `sketch'in kendi ölçümü 5000 µs civarı olmalı: ${kucuk}..${buyuk}`)
    assert.equal(tasma, 0, 'taşma olmamalı')
    // ağır iş: tur kaçar, sayaç artar, sonra periyot yine 5 ms
    const t0 = sim.nowMs()
    sim.sendSerial('a')
    sim.run(1500)
    const tum = aralikDizi(sim.pinEdges(13, t0, t0 + 1500))
    assert.ok(Math.max(...tum) >= 12 && Math.max(...tum) < 20, `ağır iş ~12+ ms'lik boşluk bırakmalı: ${Math.max(...tum)}`)
    assert.equal(csv(sim.serial).at(-1)[5], 1, `1 tur kaçmalıydı: ${sim.serial.slice(-80)}`)
    const sonra = aralik(sim.pinEdges(13, t0 + 600, t0 + 1500))
    assert.ok(Math.abs(sonra.ort - 5) < 0.01 && sonra.max < 5.02, `sonra periyot tekrar 5 ms: ${sonra.ort}`)
  },

  denge_sabit(sim, kaynak) {
    const dene = (periyotUs, ms = 8000) => {
      const s = createSim(kaynak.replace('PERIYOT_US = 5000', `PERIYOT_US = ${periyotUs}`), { name: `denge_sabit_${periyotUs}` })
      const bal = s.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
      s.run(ms)
      return bal
    }
    const sonuc = {}
    for (const p of [5000, 20000, 60000, 100000, 150000]) sonuc[p] = dene(p)
    for (const p in sonuc) console.log(`  [103] ${p / 1000} ms: düştü=${sonuc[p].state.fell} maks=${sonuc[p].state.maxAbsDeg.toFixed(1)} son=${sonuc[p].thetaDeg.toFixed(2)}`)
    for (const p of [5000, 20000]) {
      assert.ok(!sonuc[p].state.fell && Math.abs(sonuc[p].thetaDeg) < 0.5 && sonuc[p].state.maxAbsDeg < 3.5, `${p} µs periyotta robot dengede kalmalı`)
    }
    assert.ok(sonuc[60000].state.maxAbsDeg > 10 && !sonuc[60000].state.fell, '60 ms periyotta robot büyük salınım yapmalı')
    assert.ok(sonuc[100000].state.maxAbsDeg > 40, '100 ms periyotta robot neredeyse düşmeli')
    assert.ok(sonuc[150000].state.fell, '150 ms periyotta robot düşmeli')
    // asıl sim üzerinde de 5 ms ile denge
    const bal = sim.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    sim.run(5000)
    assert.ok(!bal.state.fell && Math.abs(bal.thetaDeg) < 0.5, 'robot dengede kalmalı')
  },

  // Sensör 4° kaymış: yalnız açı PD'si ayakta tutar ama robot sürekli süzülür (x kayar).
  pd_aci(sim, kaynak) {
    const bal = sim.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    bozucu(sim, bal.mpu, { ofsetDeg: 4 })
    const x = {}
    for (let sn = 1; sn <= 15; sn++) { sim.run(1000); x[sn] = bal.state.x }
    console.log(`  [104] PD: x(5)=${x[5].toFixed(3)} x(10)=${x[10].toFixed(3)} x(15)=${x[15].toFixed(3)} th=${bal.thetaDeg.toFixed(2)} maks=${bal.state.maxAbsDeg.toFixed(1)}`)
    assert.ok(!bal.state.fell, 'PD ile robot ayakta kalmalı')
    assert.ok(Math.abs(bal.thetaDeg + 4) < 0.7, `gerçek açı sensör kaymasını ters yönde ~−4° olmalı: ${bal.thetaDeg}`)
    assert.ok(Math.abs(x[15]) > 0.12, `15 sn'de ≥12 cm süzülmeliydi: ${x[15]}`)
    assert.ok(Math.abs(x[15] - x[10]) > 0.04, `son 5 sn'de de süzülmeye devam etmeli: ${x[15] - x[10]}`)
    const [t, , xTahmin] = csv(sim.serial).at(-1)
    assert.ok(Math.abs(xTahmin - x[Math.round(t / 1000)]) < 0.02, `sketch'in konum tahmini gerçeğe yakın olmalı: ${xTahmin} vs ${x[Math.round(t / 1000)]}`)
    // Kayma yoksa süzülme de yok (yani kaymanın sebebi sensör kayması)
    const s2 = createSim(kaynak, { name: 'pd_aci' })
    const b2 = s2.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    s2.run(15000)
    assert.ok(Math.abs(b2.state.x) < 0.02, `sensör doğruysa süzülme olmamalı: ${b2.state.x}`)
    console.log(`  [104] PD (kayma yok): x(15)=${b2.state.x.toFixed(3)}`)
  },

  kaskad_denge(sim, kaynak) {
    const kos = (src, ad, ms = 15000) => {
      const s = createSim(src, { name: ad })
      const b = s.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
      bozucu(s, b.mpu, { ofsetDeg: 4 })
      const x = {}
      let ss = 0, n = 0
      for (let sn = 1; sn <= ms / 1000; sn++) {
        for (let k = 0; k < 20; k++) { s.run(50); if (sn > 10) { ss += b.thetaDeg ** 2; n++ } }
        x[sn] = b.state.x
      }
      return { b, x, rms: Math.sqrt(ss / n), s }
    }
    const k = kos(kaynak, 'kaskad_denge')
    console.log(`  [104] kaskad: x(5)=${k.x[5].toFixed(4)} x(10)=${k.x[10].toFixed(4)} x(15)=${k.x[15].toFixed(4)} th=${k.b.thetaDeg.toFixed(2)} maks=${k.b.state.maxAbsDeg.toFixed(1)} rms=${k.rms.toFixed(2)}`)
    assert.ok(!k.b.state.fell, 'kaskad ile robot ayakta kalmalı')
    assert.ok(Math.abs(k.x[15]) < 0.06, `konum sabitlenmeli (|x| < 6 cm): ${k.x[15]}`)
    assert.ok(Math.abs(k.x[15] - k.x[10]) < 0.01, `son 5 sn'de süzülme durmuş olmalı: ${k.x[15] - k.x[10]}`)
    assert.ok(Math.abs(k.b.thetaDeg) < 0.5, `gerçek açı ≈ 0 olmalı: ${k.b.thetaDeg}`)
    assert.ok(k.b.state.maxAbsDeg < 6, `en büyük eğim < 6°: ${k.b.state.maxAbsDeg}`)
    const [t, , hedef, xT] = csv(k.s.serial).at(-1)
    console.log(`  [104] kaskad: t=${t} tahmin x=${xT} gerçek x=${k.x[Math.round(t / 1000)].toFixed(3)} hedef=${hedef}`)
    assert.ok(Math.abs(xT) < 0.1 && Math.abs(xT - k.x[Math.round(t / 1000)]) < 0.06, `konum tahmini gerçeğin yakınında olmalı: ${xT} vs ${k.x[Math.round(t / 1000)]}`)
    assert.ok(Math.abs(hedef) <= 6.001, `hedef açı sınırlı olmalı: ${hedef}`)
    // dış döngü hızı
    const oran = {}
    for (const r of [1, 2, 4, 8]) oran[r] = kos(kaynak.replace('DIS_ORAN = 4;', `DIS_ORAN = ${r};`), `kaskad_oran${r}`)
    for (const r in oran) console.log(`  [104] DIS_ORAN=${r}: rms=${oran[r].rms.toFixed(2)} x(15)=${oran[r].x[15].toFixed(3)} th=${oran[r].b.thetaDeg.toFixed(2)}`)
    assert.ok(oran[1].rms > 1.5 && oran[2].rms > 1.5, 'dış döngü iç döngüyle (hemen hemen) aynı hızdaysa robot sallanmalı')
    assert.ok(oran[4].rms < 0.5 && oran[8].rms < 1, 'yavaş dış döngüde robot sakin kalmalı')
  },

  // Proje: 10 sn ayakta, t=3 sn'de itme (omega += 200 °/s), rapor; kontrolsüz düşme; sapma ve aşırı itme.
  denge_robotu(sim, kaynak) {
    const itme = (b, dps) => { b.state.omega += dps * RAD }
    const bal = sim.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    sim.run(3000)
    const onceki = bal.state.maxAbsDeg
    assert.ok(Math.abs(bal.thetaDeg) < 0.5, `itmeden önce robot dik olmalı: ${bal.thetaDeg}`)
    const tItme = sim.nowMs()
    itme(bal, 200)
    let maks = 0, sonDisari = 0
    const iz = []
    for (let ms = 1; ms <= 7000; ms++) {
      sim.run(1)
      const a = Math.abs(bal.thetaDeg)
      maks = Math.max(maks, a)
      if (a > 1) sonDisari = ms
      iz.push(a)
    }
    assert.ok(!bal.state.fell, 'robot itmeden sonra ayakta kalmalı')
    assert.ok(sim.nowMs() >= 10000, '10 sn tamamlanmalı')
    assert.ok(Math.abs(bal.thetaDeg) < 1, `10. saniyede eğim < 1°: ${bal.thetaDeg}`)
    assert.ok(Math.abs(bal.state.x) < 0.1, `konum 10 cm içinde kalmalı: ${bal.state.x}`)
    assert.ok(maks > 3 && maks < 8, `itme anlamlı bir eğim (3-8°) yaratmalı: ${maks}`)
    assert.ok(sonDisari < 1000, `oturma süresi < 1 sn olmalı: ${sonDisari}`)
    const r = sim.serial.match(/RAPOR,(\d+),([\d.]+),(\d+)/)
    assert.ok(r, `RAPOR satırı yok: ${JSON.stringify(sim.serial.slice(-300))}`)
    const [rItme, rMaks, rOturma] = [Number(r[1]), Number(r[2]), Number(r[3])]
    console.log(`  [105] gerçek: itme t=${tItme} maks=${maks.toFixed(2)}° oturma=${sonDisari} ms x=${bal.state.x.toFixed(3)} | rapor: itme=${rItme} maks=${rMaks} oturma=${rOturma} ms | tüm koşu maks=${bal.state.maxAbsDeg.toFixed(1)}`)
    assert.ok(rItme >= 3000 && rItme <= 3060, `itme anı ~3000 ms olmalı: ${rItme}`)
    assert.ok(Math.abs(rMaks - maks) < 1, `raporlanan maks eğim gerçeğe yakın olmalı: ${rMaks} vs ${maks}`)
    assert.ok(Math.abs(rOturma - sonDisari) < 150, `raporlanan oturma süresi gerçeğe yakın olmalı: ${rOturma} vs ${sonDisari}`)
    assert.ok(!/DUSTU/.test(sim.serial), 'DUSTU yazdırılmamalı')
    assert.equal(sim.read(13), false, 'LED sönük olmalı')

    // Kontrolsüz: aynı sketch, 'k' komutuyla kontrol kapalı
    const s2 = createSim(kaynak, { name: 'denge_robotu_k' })
    const b2 = s2.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    s2.run(50)                       // seri port açılsın
    const tK = s2.nowMs()
    s2.sendSerial('k')
    let dusme = null
    for (let ms = 1; ms <= 3000; ms++) { s2.run(1); if (b2.state.fell && dusme === null) dusme = s2.nowMs() - tK }
    console.log(`  [105] kontrolsüz: düşme ${dusme?.toFixed(0)} ms; ${JSON.stringify(s2.serial.split('\n').filter((l) => l.startsWith('DUSTU')))}`)
    assert.ok(dusme !== null && dusme > 500 && dusme < 1200, `kontrolsüz robot ≈1 sn'de düşmeli: ${dusme}`)
    const d = s2.serial.match(/DUSTU,(\d+)/)
    assert.ok(d, 'DUSTU yazdırılmalı')
    assert.ok(Math.abs(Number(d[1]) - tK - dusme) < 100, `DUSTU anı gerçek düşmeye yakın olmalı: ${Number(d[1]) - tK} vs ${dusme}`)
    assert.equal(s2.read(13), true, 'düşünce LED yanmalı')

    // Dayanıklılık: çok güçlü itme düşürür; ters yönde itme de toparlanır
    const dene = (dps, bias = 0) => {
      const s = createSim(kaynak, { name: 'denge_robotu_d' })
      const b = s.balancer({ motors: STD_MOTORS, theta0Deg: 3, gyroBiasDps: bias })
      s.run(3000); itme(b, dps); s.run(4000)
      return b
    }
    const ters = dene(-200), buyuk = dene(700)
    console.log(`  [105] ters itme -200: düştü=${ters.state.fell} th=${ters.thetaDeg.toFixed(2)} | +700: düştü=${buyuk.state.fell}`)
    assert.ok(!ters.state.fell && Math.abs(ters.thetaDeg) < 1, 'ters itmeyi de toparlamalı')
    assert.ok(buyuk.state.fell, '+700 °/s itme robotu düşürmeli')
    // Güçlü itme (+250 °/s): düşmez, ama 7 sn sonra bile eğim ±1° içinde sakinleşmemiş olabilir
    {
      const s = createSim(kaynak, { name: 'denge_robotu_g' })
      const b = s.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
      s.run(3000); itme(b, 250)
      let mk = 0, sonSn = 0
      for (let ms = 1; ms <= 7000; ms++) { s.run(1); const a = Math.abs(b.thetaDeg); mk = Math.max(mk, a); if (ms > 6000) sonSn = Math.max(sonSn, a) }
      console.log(`  [105] +250: düştü=${b.state.fell} maks=${mk.toFixed(1)} son-1sn-maks=${sonSn.toFixed(2)}`)
      assert.ok(!b.state.fell && sonSn > 1, `+250 °/s: düşmez ama 7. saniyede eğim hâlâ >1° olur: ${sonSn}`)
    }
    // 104'teki büyük dış döngü kazançlarıyla aynı itme: robot düşmez ama sakinleşemez
    {
      const s = createSim(kaynak.replace('KX = -10.0', 'KX = -60.0').replace('KV = -25.0', 'KV = -150.0'), { name: 'denge_robotu_b' })
      const b = s.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
      s.run(3000); itme(b, 200)
      let ss = 0, n = 0
      for (let ms = 1; ms <= 7000; ms++) { s.run(1); if (ms > 5000) { ss += b.thetaDeg ** 2; n++ } }
      const rmsB = Math.sqrt(ss / n)
      console.log(`  [105] KX=-60/KV=-150: düştü=${b.state.fell} son-2sn RMS=${rmsB.toFixed(2)}`)
      assert.ok(!b.state.fell && rmsB > 1.5, `büyük dış döngü kazancı itmeden sonra dolanma bırakmalı: ${rmsB}`)
    }
    // Jiroskop sapması 1 °/s ve düzeltilmedi: robot ayakta kalır ama kalıcı eğim ~1° olur
    const sapmali = dene(200, 1)
    console.log(`  [105] sapma 1 °/s: düştü=${sapmali.state.fell} th=${sapmali.thetaDeg.toFixed(2)} x=${sapmali.state.x.toFixed(3)}`)
    assert.ok(!sapmali.state.fell && Math.abs(sapmali.thetaDeg) > 0.7 && Math.abs(sapmali.thetaDeg) < 1.6, `sapmalı jiroskopla kalıcı eğim ~1° olmalı: ${sapmali.thetaDeg}`)
    // Kazançlar: KP %30 düşük (zayıf pil) hâlâ toparlar
    const zayif = createSim(kaynak.replace('KP = 0.15', 'KP = 0.105'), { name: 'denge_robotu_z' })
    const bz = zayif.balancer({ motors: STD_MOTORS, theta0Deg: 3 })
    zayif.run(3000); itme(bz, 200); zayif.run(4000)
    console.log(`  [105] KP -%30: düştü=${bz.state.fell} th=${bz.thetaDeg.toFixed(2)} maks=${bz.state.maxAbsDeg.toFixed(1)}`)
  },
}

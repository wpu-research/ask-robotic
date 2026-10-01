import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { Arena, STD_MOTORS, STD_ENCODERS, STD_ULTRASONIC } from '../../../tools/sim/robot.mjs'

const DERECE = 180 / Math.PI
const satirlar = (sim) => sim.serial.split(/\r?\n/).filter(Boolean)

// Servo pininin darbelerinden (başlangıç zamanı, genişlik) açı serisi çıkarır.
function aciSerisi(sim, pin) {
  const e = sim.pinEdges(pin)
  const out = []
  for (let i = 0; i < e.length - 1; i++) {
    if (e[i].value && !e[i + 1].value) out.push({ t: e[i].t, aci: ((e[i + 1].t - e[i].t) * 1000 - 544) * 180 / (2400 - 544) })
  }
  return out
}
const aciAt = (seri, t) => { let a = null; for (const p of seri) { if (p.t <= t) a = p.aci; else break } return a }
const ikiKolFK = (q1, q2) => [10 * Math.cos(q1 / DERECE) + 10 * Math.cos((q1 - q2) / DERECE), 10 * Math.sin(q1 / DERECE) + 10 * Math.sin((q1 - q2) / DERECE)]
const enBuyukAtlama = (seri) => seri.slice(1).reduce((m, p, i) => Math.max(m, Math.abs(p.aci - seri[i].aci)), 0)

export default {
  // Tam güçte yerinde dönüş (~378 °/s): ±250 ölçeği doyar, ±500 ve ±1000 gerçek değeri verir.
  jiroskop_olcek(sim) {
    const r = sim.rover({ arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta: 0 }, motors: STD_MOTORS, imu: true })
    sim.run(1400)                    // motorlar tam hıza ulaştı, program henüz okumadı
    const gercek = ((r.state.wR - r.state.wL) * 0.033 / 0.12) * DERECE     // °/s
    sim.run(600)
    assert.ok(gercek > 360 && gercek < 390, `tam güç dönüş ~378 °/s olmalıydı: ${gercek.toFixed(0)}`)
    const bul = (ad) => {
      const m = sim.serial.match(new RegExp(`olcek ${ad.replace(/[+]/g, '\\+')} gz=(-?[\\d.]+) (\\w+)`))
      assert.ok(m, `"${ad}" satırı yok: ${JSON.stringify(sim.serial)}`)
      return { gz: Number(m[1]), durum: m[2] }
    }
    const o250 = bul('+-250'), o500 = bul('+-500'), o1000 = bul('+-1000')
    assert.equal(o250.durum, 'DOYDU', '±250 ölçeği tam güçte doymalıydı')
    assert.ok(o250.gz > 249 && o250.gz < 251, `±250 okuma 250'de takılmalıydı: ${o250.gz}`)
    assert.equal(o500.durum, 'tamam')
    assert.ok(Math.abs(o500.gz - gercek) < 0.03 * gercek, `±500 gerçek hıza yakın olmalı: ${o500.gz} vs ${gercek.toFixed(1)}`)
    assert.ok(Math.abs(o1000.gz - gercek) < 0.03 * gercek, `±1000 gerçek hıza yakın olmalı: ${o1000.gz} vs ${gercek.toFixed(1)}`)
    assert.ok(o500.gz > 300, 'doymayan okuma 250 üstünde olmalı')
  },

  // 2 °/s sapmalı jiroskop: yalnız jiroskop kayar; enkoder + tamamlayıcı filtre gerçeğe yakın kalır.
  sensor_birlestirme(sim) {
    const r = sim.rover({ arena: Arena.box(4, 4), pose: { x: 2, y: 2, theta: 0 }, motors: STD_MOTORS, encoders: STD_ENCODERS,
      imu: true, gyroBiasDps: 2, gyroNoiseDps: 0.4, seed: 5 })
    sim.run(25200)
    const son = satirlar(sim).filter((l) => l.startsWith('t=')).at(-1)
    const v = son.match(/t=(\d+) jiro=(-?[\d.]+) enk=(-?[\d.]+) birlesik=(-?[\d.]+)/)
    assert.ok(v, `son satır okunamadı: ${son}`)
    const [t, jiro, enk, birlesik] = v.slice(1).map(Number)
    assert.equal(t, 25, `son satır t=25 olmalı: ${son}`)
    const gercek = r.state.theta * DERECE
    assert.ok(gercek > 300 && gercek < 360, `robot gerçekte ~330 derece dönmüş olmalıydı: ${gercek.toFixed(0)}`)
    assert.ok(Math.abs(jiro - gercek) > 30, `yalnız jiroskop belirgin kaymalıydı: hata ${(jiro - gercek).toFixed(1)}`)
    assert.ok(Math.abs(birlesik - gercek) < 8, `birleşik yönelim gerçeğe yakın olmalı: hata ${(birlesik - gercek).toFixed(1)}`)
    assert.ok(Math.abs(enk - gercek) < 8, `enkoder yönelimi gerçeğe yakın olmalı: hata ${(enk - gercek).toFixed(1)}`)
    assert.ok(Math.abs(birlesik - gercek) * 4 < Math.abs(jiro - gercek), 'birleşik, yalnız jiroskoptan en az 4 kat iyi olmalı')
  },

  // Üç davranış (KAC > CIZGI > DOLAS): hangi davranışın ne zaman devrede olduğu seri çıktıdan okunur
  // ve robotun gerçek durumuyla (mesafe, çizgi sensörü, çarpma) karşılaştırılır.
  davranis_oncelik(sim) {
    const arena = Arena.box(2, 2).wall(0.7, 1.6, 1.3, 1.6).line([[1.0, 0.3], [1.0, 1.85]])
    const ls = [{ pin: 0, kind: 'analog', x: 0.07, y: 0.02 }, { pin: 1, kind: 'analog', x: 0.07, y: 0 }, { pin: 2, kind: 'analog', x: 0.07, y: -0.02 }]
    const r = sim.rover({ arena, pose: { x: 1.0, y: 0.25, theta: Math.PI / 2 + 0.1 }, motors: STD_MOTORS,
      ultrasonic: STD_ULTRASONIC, lineSensors: ls, noiseCm: 0.5, seed: 3 })
    // yalnız tamamlanmış satırlar (satır sonlu) sayılır
    const aktif = () => { const m = [...sim.serial.matchAll(/t=(\d+) (\w+)\r?\n/g)].at(-1); return m ? m[2] : null }
    const gorulen = new Set(), degisimler = []
    let kacSure = 0, cizgiSure = 0, carpma = 0, oncekiAd = null
    for (let i = 0; i < 1500; i++) {          // 30 sn, 20 ms adım
      sim.run(20)
      const ad = aktif()
      if (ad !== oncekiAd) { degisimler.push([Math.round(sim.nowMs()), ad, Math.round(r.state.frontCm), ls.some((s) => s.on)]); oncekiAd = ad }
      gorulen.add(ad)
      if (r.state.collided) carpma++
      const cizgiVar = ls.some((s) => s.on)
      kacSure = r.state.frontCm < 20 ? kacSure + 20 : 0
      cizgiSure = cizgiVar && r.state.frontCm > 70 ? cizgiSure + 20 : 0
      if (kacSure >= 200) assert.equal(ad, 'KAC', `t=${sim.nowMs().toFixed(0)}: ön mesafe ${r.state.frontCm.toFixed(0)} cm iken KAC devrede olmalıydı, ${ad}`)
      if (cizgiSure >= 200) assert.equal(ad, 'CIZGI', `t=${sim.nowMs().toFixed(0)}: çizgi görünürken (engel uzak) CIZGI devrede olmalıydı, ${ad}`)
    }
    for (const ad of ['KAC', 'CIZGI', 'DOLAS']) assert.ok(gorulen.has(ad), `${ad} hiç devreye girmedi`)
    assert.equal(carpma, 0, 'robot hiç çarpmamalıydı')
    assert.equal(degisimler[0][1], 'CIZGI', 'robot çizginin üstünde başladığı için ilk davranış CIZGI olmalı')
    const ilkKac = degisimler.find((d) => d[1] === 'KAC')
    assert.equal(degisimler[1][1], 'KAC', 'çizgi ucundaki duvara yaklaşınca KAC CIZGI\'nin önüne geçmeliydi')
    assert.ok(ilkKac[3], 'ilk KAC çizgi hâlâ görünürken (CIZGI\'yi bastırarak) devreye girmeliydi')
    assert.ok(ilkKac[2] <= 25 && ilkKac[2] >= 12, `KAC ~25 cm'de başlamalıydı: ${ilkKac[2]} cm`)
  },

  // Ters kinematik: hesaplanan açılarla ileri kinematiğe dönüş hatası < 1 mm; servo darbeleri açılarla uyumlu.
  kol_ters_kinematik(sim) {
    const L1 = 10, L2 = 10
    const ileri = (q1, q2) => {
      const a1 = q1 / DERECE, a2 = (q1 - q2) / DERECE
      return [L1 * Math.cos(a1) + L2 * Math.cos(a2), L1 * Math.sin(a1) + L2 * Math.sin(a2)]
    }
    const ters = (x, y) => {                  // bağımsız çözüm (dirsek üstte)
      const c = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2)
      if (Math.abs(c) > 1) return { kod: 1 }
      const s2 = Math.acos(c)
      const q1 = (Math.atan2(y, x) + Math.atan2(L2 * Math.sin(s2), L1 + L2 * Math.cos(s2))) * DERECE
      const q2 = s2 * DERECE
      return { kod: q1 < 0 || q1 > 180 ? 2 : 0, q1, q2 }
    }
    const us = (a) => 544 + (a * (2400 - 544)) / 180
    const aciya = (w) => ((w - 544) * 180) / (2400 - 544)
    sim.run(10500)
    const hedefler = [[14, 6], [10, 10], [18, 0], [-6, 12], [8, -12], [25, 5]]
    const satir = satirlar(sim).filter((l) => l.startsWith('t='))
    assert.equal(satir.length, hedefler.length, `${hedefler.length} hedef satırı bekleniyordu: ${JSON.stringify(sim.serial)}`)
    let hareketsizSon = null, tamam = 0, ulasilamaz = 0
    satir.forEach((l, i) => {
      const [hx, hy] = hedefler[i]
      const m = l.match(/^t=(\d+) hedef=(-?[\d.]+),(-?[\d.]+)/)
      assert.ok(m, `satır okunamadı: ${l}`)
      const t = Number(m[1])
      assert.ok(Math.abs(Number(m[2]) - hx) < 1e-6 && Math.abs(Number(m[3]) - hy) < 1e-6, `hedef sırası bozuk: ${l}`)
      const w1 = sim.pulseWidthsUs(9, t + 400, t + 1500), w2 = sim.pulseWidthsUs(10, t + 400, t + 1500)
      assert.ok(w1.length >= 10 && w2.length >= 10, 'servo darbeleri gözlenmeliydi')
      const ort = (a) => a.reduce((s, v) => s + v, 0) / a.length
      const o = ters(hx, hy)
      if (o.kod === 0) {
        tamam++
        const k = l.match(/q1=(-?[\d.]+) q2=(-?[\d.]+) ileri=(-?[\d.]+),(-?[\d.]+) hata_mm=(-?[\d.]+)/)
        assert.ok(k, `çözüm satırı eksik: ${l}`)
        const [q1, q2, gx, gy, hata] = k.slice(1).map(Number)
        assert.ok(Math.abs(q1 - o.q1) < 0.01 && Math.abs(q2 - o.q2) < 0.01, `açılar bağımsız çözümle uyuşmalı: ${q1},${q2} vs ${o.q1.toFixed(2)},${o.q2.toFixed(2)}`)
        assert.ok(hata < 1, `ileri kinematik hata < 1 mm olmalı: ${hata}`)
        const [fx, fy] = ileri(q1, q2)
        assert.ok(Math.hypot(fx - hx, fy - hy) * 10 < 1, `JS ileri kinematik hatası < 1 mm olmalı: ${(Math.hypot(fx - hx, fy - hy) * 10).toFixed(3)} mm`)
        // darbe genişlikleri beklenen açılarla uyumlu
        assert.ok(Math.abs(ort(w1) - us(q1)) < 4, `omuz darbesi ${ort(w1).toFixed(1)} µs, beklenen ${us(q1).toFixed(1)}`)
        assert.ok(Math.abs(ort(w2) - us(q2)) < 4, `dirsek darbesi ${ort(w2).toFixed(1)} µs, beklenen ${us(q2).toFixed(1)}`)
        // servo darbelerinden okunan açılarla kolun ucu hedefe 2 mm içinde
        const [px, py] = ileri(aciya(ort(w1)), aciya(ort(w2)))
        assert.ok(Math.hypot(px - hx, py - hy) * 10 < 2, `darbelerden hesaplanan uç konumu hedeften ${(Math.hypot(px - hx, py - hy) * 10).toFixed(2)} mm uzakta`)
        hareketsizSon = [ort(w1), ort(w2)]
      } else {
        ulasilamaz++
        assert.ok(/ULASILAMAZ/.test(l), `erişilemeyen hedef işaretlenmeli: ${l}`)
        assert.ok(/uzak/.test(l) === (o.kod === 1), `neden doğru yazılmalı: ${l}`)
        // servo önceki konumda kalmalı
        assert.ok(Math.abs(ort(w1) - hareketsizSon[0]) < 3 && Math.abs(ort(w2) - hareketsizSon[1]) < 3, 'erişilemeyen hedefte servolar hareket etmemeli')
      }
    })
    assert.equal(tamam, 4)
    assert.equal(ulasilamaz, 2)
    // {10,10}: omuz 90°, dirsek 90°  →  1472 µs ve 1472 µs
    const t2 = Number(satir[1].match(/t=(\d+)/)[1])
    const w = sim.pulseWidthsUs(9, t2 + 400, t2 + 1500)
    assert.ok(Math.abs(w[3] - 1472) < 4, `90° ≈ 1472 µs: ${w[3]}`)
  },

  // Ani hareket: omuz tek çerçevede 60° atlar.
  kol_ani_hareket(sim) {
    sim.run(3500)
    const seri = aciSerisi(sim, 9)
    const atlama = enBuyukAtlama(seri)
    assert.ok(Math.abs(atlama - 60) < 1.5, `ani hareket ~60° atlamalıydı: ${atlama.toFixed(1)}`)
    assert.ok(Math.abs(aciAt(seri, 500) - 90) < 0.5 && Math.abs(aciAt(seri, 1500) - 30) < 0.5 && Math.abs(aciAt(seri, 3300) - 90) < 0.5, 'omuz 90 → 30 → 90 olmalıydı')
  },

  // Yumuşak al-bırak dizisi: darbelerden ölçülen zamanlama, açılar ve sıra.
  kol_al_birak(sim) {
    const dizi = [
      ['NESNE_USTU', 16, 8, 120, 1500], ['ASAGI', 16, 2, 120, 800], ['KAVRA', 16, 2, 60, 900],
      ['YUKARI', 16, 8, 60, 800], ['TASI', 7, 12, 60, 1500], ['INDIR', 7, 5, 60, 800],
      ['BIRAK', 7, 5, 120, 900], ['KALK', 7, 12, 120, 800], ['EVE', 2, 14, 120, 1500],
    ]
    const ters = (x, y) => {
      const c = (x * x + y * y - 200) / 200, s2 = Math.acos(c)
      return [(Math.atan2(y, x) + Math.atan2(10 * Math.sin(s2), 10 + 10 * Math.cos(s2))) * DERECE, s2 * DERECE]
    }
    sim.run(1000 + 9200 + 500)
    const sat = satirlar(sim)
    assert.equal(sat.filter((l) => !/BITTI|^t=/.test(l)).length, 0, `beklenmeyen çıktı: ${JSON.stringify(sim.serial)}`)
    assert.equal(sat.length, 10, `9 adım + BITTI bekleniyordu: ${JSON.stringify(sim.serial)}`)
    const S = [aciSerisi(sim, 9), aciSerisi(sim, 10), aciSerisi(sim, 11)]
    // süre: toplam dizi 9200 ms
    const zamanlar = sat.map((l) => Number(l.match(/t=(\d+)/)[1]))
    let beklenenT = zamanlar[0]
    dizi.forEach(([ad, x, y, tut, sure], i) => {
      const m = sat[i].match(/^t=(\d+) (\w+) (-?[\d.]+) (-?[\d.]+) (\d+)$/)
      assert.ok(m && m[2] === ad, `adım ${i + 1} ${ad} olmalıydı: ${sat[i]}`)
      const t0 = Number(m[1])
      assert.ok(Math.abs(t0 - beklenenT) < 40, `${ad} adımı ${beklenenT} ms'de başlamalıydı: ${t0}`)
      beklenenT += sure
      const [q1, q2] = ters(x, y)
      const hedef = [q1, q2, tut]
      // adım sonunda üç servo da hedefte
      const son = S.map((s) => aciAt(s, t0 + sure + 40))
      // (sonraki adım hemen başladığı için en fazla bir-iki çerçevelik kayma payı: ~1,6°; son adımda sıkı)
      const pay = i === dizi.length - 1 ? 0.4 : 1.6
      hedef.forEach((h, k) => assert.ok(Math.abs(son[k] - h) < pay, `${ad}: servo ${k} sonunda ${son[k].toFixed(2)} olmalıydı ${h.toFixed(2)}`))
      // adım başında ve ortasında: hareket varsa hedef henüz yok, orta nokta yaklaşık yarıda (doğrusal geçiş)
      const bas = S.map((s) => aciAt(s, t0 - 5))
      hedef.forEach((h, k) => {
        const fark = h - bas[k]
        if (Math.abs(fark) > 15) {
          const orta = aciAt(S[k], t0 + sure / 2)
          assert.ok(Math.abs(orta - (bas[k] + fark / 2)) < 3, `${ad}: servo ${k} adım ortasında yarı yolda olmalıydı: ${orta.toFixed(1)} vs ${(bas[k] + fark / 2).toFixed(1)}`)
          assert.ok(Math.abs(aciAt(S[k], t0 + sure - 200) - h) > 1, `${ad}: servo ${k} hedefe adım bitmeden varmamalı`)
        }
      })
      // kavra/bırak: kol sabit, yalnız tutucu hareket eder
      if (ad === 'KAVRA' || ad === 'BIRAK') {
        for (const k of [0, 1]) {
          const v = S[k].filter((p) => p.t >= t0 + 50 && p.t <= t0 + sure).map((p) => p.aci)
          assert.ok(Math.max(...v) - Math.min(...v) < 1.0, `${ad}: kol sabit kalmalı (servo ${k}): ${Math.min(...v).toFixed(2)}..${Math.max(...v).toFixed(2)}`)
        }
        const tv = S[2].filter((p) => p.t >= t0 + 50 && p.t <= t0 + sure).map((p) => p.aci)
        assert.ok(Math.abs(tv.at(-1) - tv[0]) > 40, `${ad}: tutucu hareket etmeli`)
        // kolun ucu nesne / bırakma noktasında (2 mm)
        const [px, py] = ikiKolFK(aciAt(S[0], t0 + 100), aciAt(S[1], t0 + 100))
        assert.ok(Math.hypot(px - x, py - y) * 10 < 2, `${ad}: uç (${px.toFixed(2)},${py.toFixed(2)}) hedef (${x},${y}) dışında`)
      }
    })
    assert.ok(/BITTI/.test(sat.at(-1)) && Math.abs(zamanlar.at(-1) - beklenenT) < 60, `dizi ${beklenenT} ms'de bitmeli: ${sat.at(-1)}`)
    // yumuşaklık: ardışık iki darbe arasında 2°'den fazla fark yok (ani hareket 60°)
    for (const [k, s] of S.entries()) {
      const atlama = enBuyukAtlama(s.filter((p) => p.t > 900))
      assert.ok(atlama <= 2, `servo ${k}: en büyük atlama ${atlama.toFixed(2)}° > 2°`)
    }
    // dizinin sonunda tutucu açık, kol başlangıç konumunda
    const [ex, ey] = ikiKolFK(aciAt(S[0], sim.nowMs()), aciAt(S[1], sim.nowMs()))
    assert.ok(Math.hypot(ex - 2, ey - 14) * 10 < 2, `kol başlangıç konumuna dönmeli: ${ex.toFixed(2)},${ey.toFixed(2)}`)
  },

  // Proje: 40 sn'de kapsama (0,25 m'lik hücreler), çarpma ve bölge ziyareti; KAC kapalı kontrol koşusuyla karşılaştırma.
  gezgin_robot(sim, kaynak) {
    const kos = (s) => {
      const robot = s.rover({ arena: Arena.box(2, 2), pose: { x: 0.3, y: 0.3, theta: 0 }, motors: STD_MOTORS, encoders: STD_ENCODERS,
        ultrasonic: STD_ULTRASONIC, imu: true, gyroBiasDps: 1, gyroNoiseDps: 0.3, noiseCm: 1, gain: { left: 1, right: 0.97 }, seed: 5 })
      let carpma = 0, onceki = false, tikanma = 0, bolgeAni = null, oncekiSatir = 0
      const durumlar = []
      for (let i = 0; i < 2000; i++) {                // 40 sn, 20 ms adım
        s.run(20)
        const st = robot.state
        if (st.collided && !onceki) carpma++
        if (st.collided) tikanma += 0.02
        onceki = st.collided
        const satir = s.serial.split(/\r?\n/)
        if (satir.length - 1 > oncekiSatir) {         // yeni tamamlanan satır
          const l = satir[satir.length - 2]
          oncekiSatir = satir.length - 1
          if (/BOLGE/.test(l)) bolgeAni = { t: Number(l.match(/t=(\d+)/)[1]), mesafe: Math.hypot(st.x - 1.5, st.y - 1.5) }
          const d = l.match(/^t=(\d+) x=(-?[\d.]+) y=(-?[\d.]+) yon=(-?\d+) (\w+)$/)
          if (d) durumlar.push({ t: Number(d[1]), ex: Number(d[2]), ey: Number(d[3]), ad: d[5], gx: st.x, gy: st.y })
        }
      }
      const hucre = new Set(robot.state.trail.map(([x, y]) => `${Math.floor(x / 0.25)},${Math.floor(y / 0.25)}`))
      return { robot, carpma, tikanma, bolgeAni, durumlar, kapsama: hucre.size / 64 }
    }
    const a = kos(sim, kaynak)
    // 1) KAÇ açıkken: iyi kapsama, az çarpma
    assert.ok(a.kapsama >= 0.45, `40 sn'de arenanın en az %45'i gezilmeliydi: %${(a.kapsama * 100).toFixed(0)}`)
    assert.ok(a.carpma <= 3, `en çok 3 çarpma bekleniyordu: ${a.carpma}`)
    assert.ok(a.tikanma < 3, `duvara dayalı kalma süresi < 3 sn olmalıydı: ${a.tikanma.toFixed(1)} sn`)
    // 2) Bölge ziyareti: arama süresinden (12 sn) sonra, gerçekten bölgenin içinde
    assert.ok(a.bolgeAni, `bölge ziyareti yazdırılmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.ok(a.bolgeAni.t >= 12000 && a.bolgeAni.t <= 40000, `ziyaret 12-40 sn arasında olmalı: ${a.bolgeAni.t}`)
    assert.ok(a.bolgeAni.mesafe < 0.25, `"ziyaret edildi" dendiğinde robot gerçekten bölgede (0,25 m) olmalıydı: ${a.bolgeAni.mesafe.toFixed(2)} m`)
    // 3) İlk 12 sn'de ZIYARET devrede olmamalı; çarpma yokken konum tahmini gerçeğe yakın
    const erken = a.durumlar.filter((d) => d.t < 12)
    assert.ok(erken.length >= 2 && erken.every((d) => d.ad !== 'ZIYARET'), 'ilk 12 sn yalnız arama yapılmalı')
    for (const d of a.durumlar.filter((d) => d.t <= 15)) {
      const hata = Math.hypot(d.ex - d.gx, d.ey - d.gy)
      assert.ok(hata < 0.10, `t=${d.t}: konum tahmini gerçekten ${hata.toFixed(2)} m uzakta (< 0,10 m bekleniyordu)`)
    }
    // 4) Kontrol koşusu: KAÇ'ı devre dışı bırak (eşik 0 cm) -> robot duvara dayanıp kalır
    const b = kos(createSim(kaynak.replace('KAC_BASLA_CM = 25', 'KAC_BASLA_CM = 0'), { name: 'gezgin_robot_kacsiz' }))
    assert.ok(b.tikanma > 10, `KAÇ'sız robot duvara takılıp kalmalıydı: ${b.tikanma.toFixed(1)} sn`)
    assert.ok(b.kapsama < a.kapsama - 0.15, `KAÇ'sız kapsama belirgin düşük olmalı: ${b.kapsama.toFixed(2)} vs ${a.kapsama.toFixed(2)}`)
  },
}

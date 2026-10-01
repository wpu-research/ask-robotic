import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { Arena, STD_MOTORS, STD_ENCODERS } from '../../../tools/sim/robot.mjs'

const R_TEKERLEK = 0.033
const TIK_CM = (2 * Math.PI * 3.3) / 20     // 1,0367 cm
const cm = (m) => m * 100
const deg = (r) => (r * 180) / Math.PI
const std = (a) => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length) }
const ort = (a) => a.reduce((s, v) => s + v, 0) / a.length

// Kaynak koddaki bir sabiti değiştirip yeni benzetim kurar (örn. KP, kesme kipi).
function sim_(kaynak, { arena = Arena.box(4, 4), pose = { x: 0.5, y: 2, theta: 0 }, degis = [], ...robotCfg } = {}) {
  let k = kaynak
  for (const [a, b] of degis) {
    assert.ok(k.includes(a) || a instanceof RegExp, `kaynakta "${a}" yok`)
    k = k.replace(a, b)
  }
  const sim = createSim(k, { name: 'degisik' })
  const robot = sim.rover({ arena, pose, motors: STD_MOTORS, encoders: STD_ENCODERS, ...robotCfg })
  return { sim, robot }
}

// Seri çıktıda `bitis` görünene kadar (en çok maxSn saniye) 50 ms'lik adımlarla ilerler.
function kos(sim, bitis, maxSn = 60, her = null) {
  for (let i = 0; i < maxSn * 20; i++) {
    sim.run(50)
    if (her) her(sim)
    if (sim.serial.includes(bitis)) return
  }
  assert.fail(`"${bitis}" ${maxSn} sn içinde görünmedi, çıktı: ${JSON.stringify(sim.serial.slice(-300))}`)
}

const sayi = (metin, desen) => { const m = metin.match(desen); assert.ok(m, `çıktıda ${desen} yok: ${JSON.stringify(metin.slice(-300))}`); return Number(m[1].replace(',', '.')) }

export default {
  // ---- Ders 91 ----
  tik_mesafe(sim, kaynak) {
    const { sim: s, robot } = sim_(kaynak)
    kos(s, 'Mesafe (cm)', 15)
    s.run(100)
    const out = s.serial
    assert.ok(Math.abs(sayi(out, /Tik basina cm: ([\d.]+)/) - TIK_CM) < 0.01, 'tık başına cm ≈ 1,04 olmalı')
    assert.ok(Math.abs(sayi(out, /1 m icin tik: ([\d.]+)/) - 96.5) < 0.1, '1 m ≈ 96,5 tık olmalı')
    const st = robot.state
    // kesme sayacı ile benzetimin gerçek kenar sayısı aynı
    assert.equal(sayi(out, /Sol tik: (\d+)/), st.ticksL, 'sol kesme sayacı gerçek tık sayısıyla aynı olmalı')
    assert.equal(sayi(out, /Sag tik: (\d+)/), st.ticksR, 'sağ kesme sayacı gerçek tık sayısıyla aynı olmalı')
    // robotun gerçek yolu ile tıktan hesaplanan mesafe 1,5 cm içinde
    const olculen = sayi(out, /Mesafe \(cm\): ([\d.]+)/), gercek = cm(st.distanceM)
    assert.ok(Math.abs(olculen - gercek) < 1.5, `ölçülen ${olculen} cm, gerçek ${gercek.toFixed(1)} cm`)
    // 1 m ≈ 96 tık: 1 m yol alınca tık sayısı
    assert.ok(Math.abs(st.ticksL / st.distanceM - 96.5) < 1.5, `tık/metre ≈ 96,5 olmalı: ${(st.ticksL / st.distanceM).toFixed(1)}`)
    assert.ok(gercek > 99 && gercek < 105, `robot ~1 m yol almalı: ${gercek.toFixed(1)} cm`)
    assert.ok(Math.abs(st.y - 2) < 0.01, 'iki tekerlek eşit: robot yana kaymamalı')
  },

  tik_hedef_cm(sim, kaynak) {
    const { sim: s, robot } = sim_(kaynak)
    const gercekler = []
    let onceki = 0, satir = 0
    kos(s, 'BITTI', 30, (x) => {
      const n = (x.serial.match(/Olculen/g) || []).length
      if (n > satir) { satir = n; gercekler.push(cm(robot.state.distanceM) - onceki); onceki = cm(robot.state.distanceM) }
    })
    const istek = [20, 50, 100]
    const olc = [...s.serial.matchAll(/Olculen: ([\d.]+) cm/g)].map((m) => Number(m[1]))
    assert.equal(olc.length, 3)
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(olc[i] - gercekler[i]) < 1.5, `${istek[i]} cm: ölçülen ${olc[i]}, gerçek ${gercekler[i].toFixed(1)}`)
      assert.ok(olc[i] - istek[i] >= 0 && olc[i] - istek[i] < 2, `${istek[i]} cm: tık yuvarlama + durma payı 0-2 cm olmalı (${olc[i]})`)
    }
  },

  // ---- Ders 92 ----
  hiz_olc(sim, kaynak) {
    const { sim: s, robot } = sim_(kaynak, { arena: Arena.box(8, 8), pose: { x: 0.5, y: 4, theta: 0 } })
    const gercek = []
    for (let i = 0; i < 25; i++) { s.run(100); gercek.push(cm(robot.state.wL * R_TEKERLEK)) }
    const satirlar = [...s.serial.matchAll(/t=(\d+) dtik=(\d+) vSol=([\d.]+) vSag=([\d.]+)/g)].map((m) => ({ t: +m[1], d: +m[2], v: +m[3], vg: +m[4] }))
    assert.ok(satirlar.length >= 23 && satirlar.length <= 25, `100 ms'de bir satır: ${satirlar.length}`)
    // nicemleme: hız = tık sayısı * 10,37 cm/s (100 ms'de 1 tık = 10,4 cm/s)
    for (const l of satirlar) assert.ok(Math.abs(l.v - l.d * TIK_CM * 10) < 0.15, `hız = tık*10,37 olmalı: ${JSON.stringify(l)}`)
    // oturduktan sonra (t>=1 sn) ölçülen ortalama gerçek hıza yakın, tek tek sapma en çok 1 tık
    const oturmus = satirlar.filter((l) => l.t >= 1000)
    const gOturmus = gercek.slice(10)
    assert.ok(Math.abs(ort(oturmus.map((l) => l.v)) - ort(gOturmus)) < 1.5, `ortalama hız: ölçülen ${ort(oturmus.map((l) => l.v)).toFixed(1)}, gerçek ${ort(gOturmus).toFixed(1)}`)
    for (const l of oturmus) assert.ok(Math.abs(l.v - ort(gOturmus)) < 11, `tek ölçüm gerçeğin en çok 1 tık (10,4 cm/s) dışında: ${l.v}`)
    assert.ok(new Set(oturmus.map((l) => l.d)).size >= 2, '100 ms pencerede tık sayısı 2 ile 3 arasında dalgalanmalı')
    assert.ok(Math.abs(ort(gOturmus) - 28.8) < 0.5, `gerçek hız ≈ 28,8 cm/s: ${ort(gOturmus).toFixed(1)}`)
  },

  hiz_pencere(sim, kaynak) {
    const { sim: s, robot } = sim_(kaynak, { arena: Arena.box(8, 8), pose: { x: 0.5, y: 4, theta: 0 } })
    const gercek = []
    for (let i = 0; i < 35; i++) { s.run(100); gercek.push(cm(robot.state.wL * R_TEKERLEK)) }
    const L = [...s.serial.matchAll(/v100=([\d.]+) v500=([\d.]+)/g)].map((m) => ({ a: +m[1], b: +m[2] }))
    assert.ok(L.length >= 33, `satır sayısı: ${L.length}`)
    const o = L.slice(10)
    const g = ort(gercek.slice(10))
    assert.ok(Math.abs(g - 9.45) < 0.3, `düşük hızda gerçek ≈ 9,4 cm/s: ${g.toFixed(2)}`)
    const s100 = std(o.map((l) => l.a)), s500 = std(o.map((l) => l.b))
    assert.ok(Math.abs(s100 - 2.9) < 0.3 && Math.abs(s500 - 1.0) < 0.2 && s100 > 2.5 * s500, `std 100 ms ≈ 2,9, 500 ms ≈ 1,0 cm/s olmalı: ${s100.toFixed(2)} / ${s500.toFixed(2)}`)
    assert.ok(o.every((l) => l.a === 0 || Math.abs(l.a - 10.4) < 0.1), '100 ms penceresi yalnız 0 ya da 10,4 cm/s verebilir')
    assert.ok(o.some((l) => l.a === 0), '100 ms penceresi bazen 0 göstermeli (robot oysa hareket ediyor)')
    assert.ok(Math.abs(ort(o.map((l) => l.b)) - g) < 1.5, 'uzun pencerenin ortalaması gerçek hıza yakın olmalı')
    assert.ok(Math.abs(ort(o.map((l) => l.a)) - g) < 1.5, 'kısa pencerenin ortalaması da yakın, ama tek tek ölçümler dalgalı')
    globalThis.__h4 = { s100, s500 }
  },

  // ---- Ders 93 ----
  duz_ham(sim, kaynak) {
    const kos2 = (gain) => {
      const { sim: s, robot } = sim_(kaynak, { arena: Arena.box(6, 6), pose: { x: 0.5, y: 3, theta: 0 }, gain })
      kos(s, 'BITTI', 20)
      return { s, st: robot.state, sapma: cm(Math.abs(robot.state.y - 3)) }
    }
    const esit = kos2({ left: 1, right: 1 })
    assert.ok(esit.sapma < 0.5, `eşit tekerlekte sapma ~0: ${esit.sapma.toFixed(2)} cm`)
    assert.ok(Math.abs(esit.st.x - 0.5 - 2.02) < 0.05, '2 m yol alınmalı')
    const g95 = kos2({ left: 1, right: 0.95 })
    assert.ok(g95.sapma > 70 && g95.sapma < 95, `%5 farkta ham sapma ~82 cm: ${g95.sapma.toFixed(1)}`)
    const g90 = kos2({ left: 1, right: 0.9 })
    assert.ok(g90.sapma > 120 && g90.sapma < 150, `%10 farkta ham sapma ~137 cm: ${g90.sapma.toFixed(1)}`)
    assert.ok(g90.st.ticksL - g90.st.ticksR >= 15, `yavaş tekerlek geride kalmalı: ${g90.st.ticksL} / ${g90.st.ticksR}`)
    assert.ok(g90.st.theta < -1.2, `robot sağa ~100° dönmüş olmalı: ${deg(g90.st.theta).toFixed(0)}°`)
    // yol uzunluğu 2 m ama ileri ilerleme çok daha az
    assert.ok(g90.st.x - 0.5 < 1.3, 'ileri ilerleme 2 m değil, ~1,1 m')
  },

  duz_p(sim, kaynak) {
    const kos2 = (gain, degis = []) => {
      const { sim: s, robot } = sim_(kaynak, { arena: Arena.box(6, 6), pose: { x: 0.5, y: 3, theta: 0 }, gain, degis })
      kos(s, 'BITTI', 20)
      return { s, st: robot.state, sapma: cm(Math.abs(robot.state.y - 3)) }
    }
    const a = kos2({ left: 1, right: 0.9 })
    assert.ok(a.sapma < 10, `P düzeltmesiyle %10 farkta sapma < 10 cm olmalı: ${a.sapma.toFixed(1)}`)
    assert.ok(Math.abs(a.st.ticksL - a.st.ticksR) <= 2, `tık farkı ≤ 2: ${a.st.ticksL}/${a.st.ticksR}`)
    assert.ok(Math.abs(a.st.x - 0.5 - 2.02) < 0.05, 'hâlâ 2 m yol alınmalı')
    const b = kos2({ left: 1, right: 0.95 })
    assert.ok(b.sapma < 6, `%5 farkta sapma < 6 cm: ${b.sapma.toFixed(1)}`)
    const c = kos2({ left: 1, right: 1 })
    assert.ok(c.sapma < 0.5, 'eşit tekerlekte düzeltme zarar vermemeli')
    // KP etkisi: küçük KP yetersiz, büyük KP daha iyi
    const kucuk = kos2({ left: 1, right: 0.9 }, [['KP = 20.0', 'KP = 5.0']])
    const buyuk = kos2({ left: 1, right: 0.9 }, [['KP = 20.0', 'KP = 40.0']])
    assert.ok(kucuk.sapma > a.sapma && a.sapma > buyuk.sapma, `KP arttıkça sapma azalmalı: ${kucuk.sapma.toFixed(1)} > ${a.sapma.toFixed(1)} > ${buyuk.sapma.toFixed(1)}`)
    const sol = kos2({ left: 0.9, right: 1 })
    assert.ok(sol.sapma < 10, `sol tekerlek yavaşken de düzeltmeli: ${sol.sapma.toFixed(1)}`)
    globalThis.__h4p = { a: a.sapma, b: b.sapma, kucuk: kucuk.sapma, buyuk: buyuk.sapma, sol: sol.sapma }
  },

  // ---- Ders 94 ----
  odometri_temel(sim, kaynak) {
    const kos2 = ({ degis = [], ...cfg } = {}) => {
      const { sim: s, robot } = sim_(kaynak, { pose: { x: 0.5, y: 0.5, theta: 0 }, degis, ...cfg })
      kos(s, 'BITTI', 40)
      const m = s.serial.match(/5 x=(-?[\d.]+) y=(-?[\d.]+) aci=(-?[\d.]+)/)
      assert.ok(m, 'son satır yok')
      const st = robot.state
      const gx = cm(st.x - 0.5), gy = cm(st.y - 0.5), gth = deg(st.theta)
      return { tahmin: [+m[1], +m[2], +m[3]], gercek: [gx, gy, gth], hata: Math.hypot(gx - +m[1], gy - +m[2]), s }
    }
    const rising = kos2()
    // ara adımlar tutarlı: ilk düz 1 m
    assert.ok(/1 x=10[0-3]\.\d y=0\.0 aci=0\.0/.test(rising.s.serial), `1. adım ~1 m ileri: ${rising.s.serial}`)
    // tahmin gerçeğe aynı bölgede, ama tık yuvarlaması yüzünden birkaç cm - ~20 cm fark var
    assert.ok(rising.hata > 5 && rising.hata < 25, `RISING ile tahmin-gerçek farkı 5-25 cm: ${rising.hata.toFixed(1)}`)
    assert.ok(Math.abs(rising.tahmin[2] - rising.gercek[2]) < 12, 'yön farkı < 12°')
    // CHANGE: iki kat çözünürlük, fark ~0
    const change = kos2({ degis: [['RISING', 'CHANGE'], ['RISING', 'CHANGE'], ['/ 20;', '/ 40;']] })
    assert.ok(change.hata < 2, `CHANGE ile tahmin-gerçek farkı < 2 cm: ${change.hata.toFixed(1)}`)
    assert.ok(Math.abs(change.tahmin[2] - change.gercek[2]) < 1, 'CHANGE yön farkı < 1°')
    // sistematik hata: tekerlek yarıçapı 3,45 cm ama yazılımda 3,3 cm; ya da aks aralığı 12,5 cm
    const cd = [['RISING', 'CHANGE'], ['RISING', 'CHANGE'], ['/ 20;', '/ 40;']]
    const yaricap = kos2({ degis: cd, wheelRadius: 0.0345 })
    const aks = kos2({ degis: cd, wheelBase: 0.125 })
    assert.ok(yaricap.hata > 10 && yaricap.hata < 20, `yarıçap hatasında fark ~14 cm: ${yaricap.hata.toFixed(1)}`)
    assert.ok(aks.hata > 10 && aks.hata < 20, `aks hatasında fark ~14 cm: ${aks.hata.toFixed(1)}`)
    // tahmin aynı kaldı (enkoder aynı tıkları sayıyor), gerçek değişti
    assert.deepEqual(yaricap.tahmin, change.tahmin, 'yarıçap yanlış olsa da tahmin aynı: odometri yanlışı göremez')
    globalThis.__h4o = { rising: rising.hata, change: change.hata, yaricap: yaricap.hata, aks: aks.hata, r: rising, c: change, y: yaricap, a: aks }
  },

  donus_birikim(sim, kaynak) {
    const kos2 = (cfg = {}) => {
      const { sim: s, robot } = sim_(kaynak, { pose: { x: 2, y: 2, theta: 0 }, ...cfg })
      kos(s, 'Tahmin', 20)
      s.run(700)
      return { tahmin: sayi(s.serial, /Tahmin \(derece\): (-?\d+)/), gercek: deg(robot.state.theta) }
    }
    const n = kos2()
    assert.ok(Math.abs(n.tahmin - 720) < 8, `tahmin ~720°: ${n.tahmin}`)
    assert.ok(Math.abs(n.tahmin - n.gercek) < 6, `doğru L ile tahmin gerçeğe yakın: ${n.tahmin} / ${n.gercek.toFixed(1)}`)
    const k = kos2({ wheelBase: 0.125 })
    const fark = k.tahmin - k.gercek
    assert.ok(fark > 25 && fark < 40, `L %4 yanlışken 2 turda ~32° fark: ${fark.toFixed(1)}`)
    globalThis.__h4d = { n, k, fark }
  },

  // ---- Ders 95 ----
  kare_sekiz(sim, kaynak) {
    const sonuclar = []
    for (const gain of [{ left: 1, right: 1 }, { left: 1, right: 0.93 }]) {
      const { sim: s, robot } = sim_(kaynak, { arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta: 0 }, gain })
      let kare = null
      kos(s, 'BITTI', 70, () => {
        if (!kare && s.serial.includes('KARE')) { const st = robot.state; kare = { x: st.x, y: st.y, th: st.theta, izN: robot.state.trail.length } }
      })
      const st = robot.state
      assert.ok(kare, 'KARE satırı görünmeli')
      const kareHata = cm(Math.hypot(kare.x - 1, kare.y - 1))
      const sekizHata = cm(Math.hypot(st.x - kare.x, st.y - kare.y))
      assert.ok(kareHata < 5, `kare dönüş hatası < 5 cm olmalı: ${kareHata.toFixed(1)}`)
      assert.ok(sekizHata < 5, `sekiz dönüş hatası < 5 cm olmalı: ${sekizHata.toFixed(1)}`)
      assert.ok(Math.abs(deg(kare.th) - 360) < 8, `kare sonunda yön ~360°: ${deg(kare.th).toFixed(1)}`)
      assert.ok(!st.collided, 'duvara çarpmamalı')
      // izin sınır kutusu: kare 0,5 x 0,5; sekiz 0,5 x 1,0
      const kareIz = st.trail.slice(0, kare.izN), sekizIz = st.trail.slice(kare.izN)
      const kutu = (iz) => { const xs = iz.map((p) => p[0]), ys = iz.map((p) => p[1]); return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)] }
      const [kw, kh] = kutu(kareIz), [sw, sh] = kutu(sekizIz)
      assert.ok(Math.abs(kw - 0.5) < 0.06 && Math.abs(kh - 0.5) < 0.06, `kare izi 0,5 x 0,5 m: ${kw.toFixed(2)} x ${kh.toFixed(2)}`)
      assert.ok(Math.abs(sw - 0.5) < 0.06 && Math.abs(sh - 1.0) < 0.08, `sekiz izi 0,5 x 1,0 m: ${sw.toFixed(2)} x ${sh.toFixed(2)}`)
      assert.ok(st.trail.length > 1500, 'iz kaydı: her 20 ms bir nokta')
      // sketch'in seri çıktısındaki IZ noktaları gerçek izle aynı kutuya düşer
      const iz = [...s.serial.matchAll(/IZ (-?\d+) (-?\d+)/g)].map((m) => [+m[1] / 100, +m[2] / 100])
      assert.ok(iz.length > 100, `IZ satırları: ${iz.length}`)
      const xs = iz.map((p) => p[0]), ys = iz.map((p) => p[1])
      assert.ok(Math.max(...ys) - Math.min(...ys) > 0.9 && Math.max(...ys) - Math.min(...ys) < 1.15, 'IZ kutusu ~1 m yüksek')
      // sketch'in kendi tahmini gerçek hatayla uyumlu (sim'de tekerlek kayması yok)
      const tahminKare = sayi(s.serial, /KARE hata\(tahmin\) cm: ([\d.]+)/)
      assert.ok(Math.abs(tahminKare - kareHata) < 3, `tahmin ${tahminKare} cm, gerçek ${kareHata.toFixed(1)} cm`)
      sonuclar.push({ gain, kareHata, sekizHata })
    }
    // KP = 0: düzeltme olmadan sağ tekerlek %93 iken hata belirgin büyür
    const { sim: s0, robot: r0 } = sim_(kaynak, { arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta: 0 }, gain: { left: 1, right: 0.93 }, degis: [['KP = 1000.0', 'KP = 0.0']] })
    let k0 = null
    kos(s0, 'BITTI', 70, () => { if (!k0 && s0.serial.includes('KARE')) k0 = { x: r0.state.x, y: r0.state.y } })
    const kareH0 = cm(Math.hypot(k0.x - 1, k0.y - 1)), sekizH0 = cm(Math.hypot(r0.state.x - k0.x, r0.state.y - k0.y))
    assert.ok(kareH0 > 8 && kareH0 < 13, `KP=0 kare hatası ~10 cm: ${kareH0.toFixed(1)}`)
    assert.ok(sekizH0 > 15 && sekizH0 < 25, `KP=0 sekiz hatası ~20 cm: ${sekizH0.toFixed(1)}`)
    // kısa kenar da kapanır
    const { sim: s3, robot: r3 } = sim_(kaynak, { arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta: 0 }, gain: { left: 1, right: 0.93 }, degis: [['ileri(0.5)', 'ileri(0.3)']] })
    let k3 = null
    kos(s3, 'BITTI', 70, () => { if (!k3 && s3.serial.includes('KARE')) k3 = { x: r3.state.x, y: r3.state.y } })
    assert.ok(cm(Math.hypot(k3.x - 1, k3.y - 1)) < 3, 'kenar 0,3 m kare de kapanmalı')
    globalThis.__h4k = { sonuclar, kareH0, sekizH0 }
  },
}

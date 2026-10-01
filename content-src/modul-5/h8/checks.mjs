import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { Arena, STD_MOTORS, STD_ENCODERS, STD_ULTRASONIC } from '../../../tools/sim/robot.mjs'

// Ölçüm değerlerini dersteki tablolara taşımak için: H8_RAPOR=1 node tools/sim/check.mjs modul-5 h8
const rapor = (...a) => { if (process.env.H8_RAPOR) console.log('   [ölçüm]', ...a) }

// ---- yardımcılar ------------------------------------------------------------

// Seri girişe metni karakter karakter gönderir (gerçek seri hat gibi).
function gonder(sim, metin) {
  for (const c of metin) { sim.sendSerial(c); sim.run(3) }
  sim.run(80)
}
const satirlar = (sim) => sim.serial.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
const sonSatir = (sim) => satirlar(sim).at(-1)

function noktaSegmente(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy
  const t = l2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)) : 0
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}
const duvaraUzaklik = (arena, x, y) => Math.min(...arena.walls.map((w) => noktaSegmente(x, y, ...w)))
const cizgiyeUzaklik = (arena, x, y) =>
  Math.min(...arena.lines.map((pl) => Math.min(...pl.slice(1).map((pt, i) => noktaSegmente(x, y, ...pl[i], ...pt)))))

const SENSORLER = () => [0, 1, 2, 3, 4].map((i) => ({ pin: i, kind: 'analog', x: 0.07, y: 0.04 - 0.02 * i }))

// Servo darbe genişliği (µs) -> açı (derece); Servo kütüphanesi 544-2400 µs = 0-180 derece
const usAci = (us) => ((us - 544) * 180) / (2400 - 544)
// İki eksenli kolun ileri kinematiği (L1 = L2 = 10 cm), servo açılarından uç noktası (cm).
// 108. ders düzeni: omuz servosu = q1, dirsek servosu = q2 (0° düz, 90° dik); ön kol yönü q1 - q2
function ucNokta(omuzAci, dirsekAci) {
  const t1 = (omuzAci * Math.PI) / 180, t2 = (dirsekAci * Math.PI) / 180
  return [10 * Math.cos(t1) + 10 * Math.cos(t1 - t2), 10 * Math.sin(t1) + 10 * Math.sin(t1 - t2)]
}
function sonDarbe(sim, pin, t) {
  const w = sim.pulseWidthsUs(pin, t - 60, t)
  assert.ok(w.length > 0, `D${pin} için servo darbesi yok (t=${t.toFixed(0)} ms)`)
  return w.at(-1)
}
const ucAt = (sim, t) => ucNokta(usAci(sonDarbe(sim, 9, t)), usAci(sonDarbe(sim, 10, t)))

// ---- Yol A parkuru (ders 112-113-115) ---------------------------------------
// Çizgi (1,3 m) -> serbest alan -> engel duvarı -> bitiş çizgisi.
function parkurA(sim, { dy = -0.04, theta = 0, sagKazanc = 1, bitisMs = 30000 } = {}) {
  const arena = Arena.box(2.4, 1.6)
    .line([[0.2, 0.7], [0.8, 0.7], [1.1, 0.9], [1.3, 0.9]])
    .line([[2.05, 0.3], [2.05, 1.5]])
    .wall(1.75, 0.5, 1.75, 1.15)
  const robot = sim.rover({
    arena, pose: { x: 0.25, y: 0.7 + dy, theta }, motors: STD_MOTORS, ultrasonic: STD_ULTRASONIC,
    lineSensors: SENSORLER(), bumpers: { left: 2, right: 3 }, gain: { left: 1, right: sagKazanc }, noiseCm: 1, seed: 3,
  })
  let carpti = false, enYakin = Infinity
  while (sim.nowMs() < bitisMs && !/BITTI/.test(sim.serial)) {
    sim.run(20)
    if (robot.state.collided) carpti = true
    enYakin = Math.min(enYakin, duvaraUzaklik(arena, robot.state.x, robot.state.y))
  }
  sim.run(500)
  return { robot, arena, carpti, enYakin, sure: sim.nowMs() / 1000 }
}

function kkaynakKisa(k) {
  const y = k.replace('YAN_MS = 2000', 'YAN_MS = 1500')
  assert.notEqual(y, k, 'YAN_MS = 2000 satırı bulunamadı')
  return y
}

// ---- Yol C hedef senaryosu (ders 112-113) -----------------------------------
// arena.walls içindeki bir kesit hedef tahtasıdır; dizi değiştirilebilir olduğu için kesiti kaydırmak hareketli hedef yapar.
function hedefSahnesi(sim, { baslangicCm = 44, sagKazanc = 0.97 } = {}) {
  const arena = Arena.box(4, 2)
  const x0 = 0.5 + 0.06 + baslangicCm / 100
  arena.wall(x0, 0.3, x0, 1.7)
  const tahta = arena.walls.at(-1)
  const robot = sim.rover({
    arena, pose: { x: 0.5, y: 1, theta: 0 }, motors: STD_MOTORS, ultrasonic: STD_ULTRASONIC,
    gain: { left: 1, right: sagKazanc }, noiseCm: 1, seed: 5,
  })
  const kon = (x) => { tahta[0] = x; tahta[2] = x }
  // Sensör ile hedef arasındaki gerçek mesafe (cm): sensör robot merkezinin 6 cm önünde
  const gercekCm = () => (tahta[0] - (robot.state.x + 0.06 * Math.cos(robot.state.theta))) * 100
  return { robot, tahta, kon, gercekCm }
}
// ms boyunca 100 ms adımlarla çalıştırır; hız (cm/sn) ile hedefi uzaklaştırır; gerçek mesafenin en küçük/en büyüğünü döndürür
function hedefiGez(sim, s, ms, cmPerSn = 0) {
  let en = Infinity, bu = -Infinity
  for (let t = 0; t < ms; t += 100) {
    if (cmPerSn) s.kon(s.tahta[0] + cmPerSn / 100 * 0.1)
    sim.run(100)
    const d = s.gercekCm()
    en = Math.min(en, d); bu = Math.max(bu, d)
  }
  return { en, bu }
}

// ---- JSON-lines doğrulayıcı (ders 114) --------------------------------------
// Bir telemetri satırının biçimini ve değer aralıklarını denetler; sorun varsa açıklama döndürür, yoksa null.
function satirSorunu(satir) {
  let o
  try { o = JSON.parse(satir) } catch { return 'JSON değil' }
  const anahtarlar = Object.keys(o).join(',')
  if (anahtarlar !== 't,x,y,th,d') return `anahtarlar t,x,y,th,d olmalı: ${anahtarlar}`
  if (!Number.isInteger(o.t) || o.t < 0) return 't pozitif tam sayı (ms) olmalı'
  if (typeof o.x !== 'number' || Math.abs(o.x) > 10) return 'x -10..10 m aralığında bir sayı olmalı'
  if (typeof o.y !== 'number' || Math.abs(o.y) > 10) return 'y -10..10 m aralığında bir sayı olmalı'
  if (typeof o.th !== 'number' || o.th <= -Math.PI || o.th > Math.PI) return 'th (-pi, pi] aralığında olmalı'
  if (o.d !== null && (typeof o.d !== 'number' || o.d < 2 || o.d > 400)) return 'd null ya da 2..400 cm olmalı'
  return null
}

// Hata listesinden ortalama ve en büyük mutlak hata (ders 114)
const hataOzeti = (hatalar) => ({
  ort: hatalar.reduce((a, h) => a + Math.abs(h), 0) / hatalar.length,
  maks: Math.max(...hatalar.map(Math.abs)),
})

export default {
  // ===== Ders 111 =====
  kabul_olcut(sim) {
    sim.run(100)
    const dene = (girdi, beklenen) => {
      const once = satirlar(sim).length
      gonder(sim, girdi)
      assert.equal(satirlar(sim).length, once + 1, `"${girdi.trim()}" tek satır yanıt vermeli: ${JSON.stringify(sim.serial)}`)
      assert.equal(sonSatir(sim), beklenen, `"${girdi.trim()}" için ${beklenen} bekleniyordu, gelen: ${sonSatir(sim)}`)
    }
    dene('A 0 1\n', 'yol A: GECTI')
    dene('A 1 1\n', 'yol A: KALDI')          // bir çarpma yeter
    dene('A 0 0\n', 'yol A: KALDI')          // bitirmediyse çarpmasız olsa da kaldı
    dene('B 3.2\n', 'yol B: GECTI')
    dene('B 4.9\n', 'yol B: GECTI')
    dene('B 5.0\n', 'yol B: KALDI')          // "5 mm'den az": 5,0 geçmez
    dene('B 8\n', 'yol B: KALDI')
    dene('C 18.4 21.9\n', 'yol C: GECTI')
    dene('C 17 23\n', 'yol C: GECTI')        // sınır dahil: 20 ± 3
    dene('C 16.9 20\n', 'yol C: KALDI')      // fazla yaklaştı
    dene('C 19 23.1\n', 'yol C: KALDI')      // fazla uzaklaştı
  },

  // ===== Ders 112 =====
  a_alt_sistem(sim) {
    const arena = Arena.box(2, 2).line([[0.2, 1], [1.8, 1]]).wall(1.5, 0.2, 1.5, 1.8)
    const robot = sim.rover({
      arena, pose: { x: 0.5, y: 1, theta: 0 }, motors: STD_MOTORS, ultrasonic: STD_ULTRASONIC,
      lineSensors: SENSORLER(), noiseCm: 0, seed: 1,
    })
    sim.run(300)
    assert.equal(sonSatir(sim), 'hazir')

    // mesafe modülü: duvar sensörden 1,5 - 0,5 - 0,06 = 0,94 m uzakta
    gonder(sim, 'm')
    const cm = Number(sonSatir(sim).match(/^mesafe=([\d.]+)$/)?.[1])
    assert.ok(Math.abs(cm - 94) < 1.5, `94 cm bekleniyordu, okunan: ${sonSatir(sim)}`)

    // çizgi modülü: robotu çizginin yanına kaydırıp konumu oku
    const konum = (dy) => {
      robot.state.y = 1 + dy
      sim.run(20)
      gonder(sim, 'c')
      const m = sonSatir(sim).match(/^konum=(-?[\d.]+) sayi=(\d)$/)
      assert.ok(m, `çizgi satırı bozuk: ${sonSatir(sim)}`)
      return { konum: Number(m[1]), sayi: Number(m[2]) }
    }
    assert.deepEqual(konum(0), { konum: 0, sayi: 1 })
    assert.deepEqual(konum(0.02), { konum: -1, sayi: 1 })      // robot çizginin solunda: çizgi sağda, konum eksi
    assert.deepEqual(konum(-0.04), { konum: 2, sayi: 1 })      // robot sağda: çizgi solda, konum artı
    assert.equal(konum(0.08).sayi, 0, 'çizgiden uzakta hiçbir sensör çizgiyi görmemeli')
    robot.state.y = 1

    // sürüş modülü: 1 sn ileri, 1 sn geri
    let x0 = robot.state.x
    gonder(sim, 'i'); sim.run(1300)
    const ileri = robot.state.x - x0
    assert.ok(/ileri bitti/.test(sim.serial))
    assert.ok(ileri > 0.15 && ileri < 0.30, `1 sn'de 15-30 cm ileri bekleniyordu, ${(ileri * 100).toFixed(1)} cm`)
    rapor('a_alt_sistem: 1 sn ileri =', (ileri * 100).toFixed(1), 'cm')
    x0 = robot.state.x
    gonder(sim, 'g'); sim.run(1300)
    assert.ok(robot.state.x - x0 < -0.15, `geri gitmeliydi, ${((robot.state.x - x0) * 100).toFixed(1)} cm`)

    // dönüş süresi: 420 ms yaklaşık 90 derece (sol artı, sağ eksi)
    let th0 = robot.state.theta
    gonder(sim, 's'); sim.run(800)
    const sol = ((robot.state.theta - th0) * 180) / Math.PI
    assert.ok(sol > 80 && sol < 100, `sola ~90 derece bekleniyordu, ${sol.toFixed(1)}`)
    th0 = robot.state.theta
    gonder(sim, 'd'); sim.run(800)
    const sag = ((robot.state.theta - th0) * 180) / Math.PI
    assert.ok(sag < -80 && sag > -100, `sağa ~90 derece bekleniyordu, ${sag.toFixed(1)}`)
    rapor('a_alt_sistem: 420 ms dönüş = sol', sol.toFixed(1), 'sağ', sag.toFixed(1), 'derece')
  },

  b_alt_sistem(sim) {
    sim.run(300)
    const hedefler = [[12, 4], [8, 10], [4, 12], [14, 2], [10, 0]]
    let enBuyukMm = 0, enBuyukTamDereceMm = 0
    for (const [x, y] of hedefler) {
      const t0 = sim.nowMs()
      gonder(sim, `g ${x} ${y}\n`)
      sim.run(100)
      const m = sonSatir(sim).match(/^omuz=([\d.]+) dirsek=([\d.]+) us=(\d+),(\d+) kontrol=(-?[\d.]+),(-?[\d.]+)$/)
      assert.ok(m, `"g ${x} ${y}" yanıtı bozuk: ${sonSatir(sim)}`)
      // yazılan açılar ile servo pininde ölçülen darbe uyuşmalı
      const w9 = sonDarbe(sim, 9, sim.nowMs()), w10 = sonDarbe(sim, 10, sim.nowMs())
      assert.ok(Math.abs(w9 - Number(m[3])) < 1.5 && Math.abs(w10 - Number(m[4])) < 1.5,
        `pin darbeleri ${w9.toFixed(1)}/${w10.toFixed(1)} µs, yazılan ${m[3]}/${m[4]}`)
      // pinde ölçülen darbelerden uç noktasını yeniden hesapla: hedefe uzaklık (mm)
      const [ux, uy] = ucNokta(usAci(w9), usAci(w10))
      const hataMm = Math.hypot(ux - x, uy - y) * 10
      enBuyukMm = Math.max(enBuyukMm, hataMm)
      assert.ok(hataMm < 1, `(${x},${y}) için uç noktası hatası ${hataMm.toFixed(2)} mm, 1 mm'den küçük olmalı`)
      // aynı açıları tam dereceye yuvarlasaydık (Servo.write) hata ne olurdu?
      const [tx, ty] = ucNokta(Math.round(usAci(w9)), Math.round(usAci(w10)))
      enBuyukTamDereceMm = Math.max(enBuyukTamDereceMm, Math.hypot(tx - x, ty - y) * 10)
      assert.ok(t0 < sim.nowMs())
    }
    rapor('b_alt_sistem: µs ile en büyük hata', enBuyukMm.toFixed(2), 'mm; tam derece ile', enBuyukTamDereceMm.toFixed(2), 'mm')
    assert.ok(enBuyukTamDereceMm < 5, 'tam derece yuvarlama bile 5 mm altında kalmalı (dersteki iddia)')

    // ulaşılamayan hedef: reddedilir, servo yerinde kalır
    const once = [sonDarbe(sim, 9, sim.nowMs()), sonDarbe(sim, 10, sim.nowMs())]
    gonder(sim, 'g 25 0\n')
    sim.run(100)
    assert.equal(sonSatir(sim), 'ulasilamaz')
    assert.ok(Math.abs(sonDarbe(sim, 9, sim.nowMs()) - once[0]) < 1.5 && Math.abs(sonDarbe(sim, 10, sim.nowMs()) - once[1]) < 1.5,
      'ulaşılamayan hedefte servolar hareket etmemeli')
    gonder(sim, 'g 12 4\n')
    sim.run(100)
    assert.ok(/^omuz=69\.20 dirsek=101\.54/.test(sonSatir(sim)), `ters kinematik (12,4) için 69,20 / 101,54 vermeliydi: ${sonSatir(sim)}`)
  },

  c_mesafe_pid(sim) {
    // Duran hedef: 44 cm'den yaklaş, 20 cm'de otur
    const s = hedefSahnesi(sim)
    const yakalama = hedefiGez(sim, s, 10000)
    rapor('c_mesafe_pid: yakalama evresi (0-10 sn) en küçük/en büyük', yakalama.en.toFixed(1), yakalama.bu.toFixed(1), 'cm')
    assert.ok(yakalama.en > 10 && yakalama.en < 20, `yakalamada hedefi biraz aşması (10-20 cm) bekleniyordu: ${yakalama.en.toFixed(1)}`)
    const { en, bu } = hedefiGez(sim, s, 8000)
    rapor('c_mesafe_pid: duran hedef, 10-18 sn arası', en.toFixed(1), bu.toFixed(1), 'cm')
    assert.ok(en >= 17 && bu <= 23, `oturduktan sonra 17-23 cm bekleniyordu, ${en.toFixed(1)}-${bu.toFixed(1)}`)
    assert.ok(/mesafe=\d+\.\d hata=-?\d+\.\d hiz=-?\d+/.test(sim.serial), 'seri izleme satırı bekleniyordu')
    // Hedef kaybolursa bu alt sistem yine de ileri koşar: durum makinesi (ders 113) bunu çözecek
    const x0 = s.robot.state.x
    s.kon(3.5)
    sim.run(1500)
    const kosu = (s.robot.state.x - x0) * 100
    rapor('c_mesafe_pid: hedef kaybolunca 1,5 sn sonra gidilen yol', kosu.toFixed(1), 'cm')
    assert.ok(kosu > 20, `hedef kaybolunca PID tek başına ileri koşmalı, ${kosu.toFixed(1)} cm gitti`)
  },

  // ===== Ders 113 =====
  a_arac(sim, kaynak) {
    const ana = parkurA(sim)
    assert.ok(/durum: SERBEST/.test(sim.serial) && /durum: BITTI/.test(sim.serial), `durumlar yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.ok(ana.robot.state.x > 1.9 && ana.robot.state.x < 2.1, `bitiş çizgisinde (x≈1,98) durmalı, x=${ana.robot.state.x.toFixed(2)}`)
    assert.ok(!ana.carpti && ana.enYakin > 0.08, `çarpmadan bitirmeli, en yakın duvar ${(ana.enYakin * 100).toFixed(1)} cm`)
    assert.ok(ana.sure < 20, `20 sn altında bitirmeli, ${ana.sure.toFixed(1)} sn`)
    // durduktan sonra kıpırdamamalı
    const x = ana.robot.state.x
    sim.run(1000)
    assert.ok(Math.abs(ana.robot.state.x - x) < 0.005, 'BITTI durumunda robot durmalı')
    // test matrisi: başlangıç sapması ve tekerlek uyumsuzluğu (aynı kaynak yeniden derlenir, önbellekten gelir)
    const matris = [
      { ad: 'sağa kaçık, açılı', dy: -0.05, theta: 0.1 },
      { ad: 'sola kaçık, açılı', dy: 0.03, theta: -0.1 },
      { ad: 'sağ motor %4 zayıf', sagKazanc: 0.96 },
      { ad: 'sağ motor %3 güçlü', sagKazanc: 1.03 },
    ]
    for (const senaryo of matris) {
      const s2 = createSim(kaynak, { name: 'a_arac' })
      const r2 = parkurA(s2, senaryo)
      assert.ok(/durum: BITTI/.test(s2.serial), `[${senaryo.ad}] bitirmeli: ${JSON.stringify(s2.serial)}`)
      assert.ok(!r2.carpti && r2.enYakin > 0.08, `[${senaryo.ad}] çarpmamalı, en yakın duvar ${(r2.enYakin * 100).toFixed(1)} cm`)
      assert.ok(r2.robot.state.x > 1.9, `[${senaryo.ad}] bitiş çizgisine ulaşmalı, x=${r2.robot.state.x.toFixed(2)}`)
      rapor('a_arac matris:', senaryo.ad, 'süre', r2.sure.toFixed(1), 'sn, en yakın duvar', (r2.enYakin * 100).toFixed(1), 'cm')
    }
    // "yana git" süresi kısa bırakılırsa robot engelin köşesine takılır (dersteki örnek hata raporu)
    const kisa = createSim(kkaynakKisa(kaynak), { name: 'a_arac_kisa' })
    const rk = parkurA(kisa, { bitisMs: 20000 })
    assert.ok(rk.carpti && !/durum: BITTI/.test(kisa.serial), 'YAN_MS = 1500 ile robot engelin köşesine takılmalı')
    // kök neden ölçümü: robot sola döndü (θ ≈ +90°), yana gitti, sağa dönüp doğuya baktı; ama y hiç 1,225 m'ye (duvar ucu 1,15 + yarıçap 0,075) varmadı
    const iz = rk.robot.state.trail
    const enBuyukY = Math.max(...iz.map((p) => p[1])), enBuyukTeta = Math.max(...iz.map((p) => p[2])), sonTeta = iz.at(-1)[2]
    assert.ok(enBuyukTeta > 1.4 && enBuyukTeta < 1.8, `sola ~90° dönmüş olmalı, en büyük θ ${enBuyukTeta.toFixed(2)} rad`)
    assert.ok(Math.abs(sonTeta) < 0.3, `takıldığında doğuya bakmalı, θ ${sonTeta.toFixed(2)} rad`)
    assert.ok(enBuyukY > 1.2 && enBuyukY < 1.25, `en büyük y 1,2-1,25 m arası olmalı: ${enBuyukY.toFixed(3)}`)
    assert.ok(sonTeta < 0, 'yön tam doğu değil, hafif güneye bakmalı (robot ilerlerken y azalır)')
    assert.ok(rk.robot.state.y < 1.225 && rk.robot.state.y > 1.2, `takıldığı y 1,225 m altında olmalı: ${rk.robot.state.y.toFixed(3)}`)
    const anaY = Math.max(...ana.robot.state.trail.map((p) => p[1]))
    assert.ok(anaY > 1.3, `YAN_MS = 2000 ile robot y > 1,3 m'ye çıkmalı: ${anaY.toFixed(3)}`)
    rapor('a_arac kök neden: en büyük θ', enBuyukTeta.toFixed(3), 'rad; son θ', sonTeta.toFixed(3), 'rad; en büyük y (1500)', enBuyukY.toFixed(3), 'm; takılma y', rk.robot.state.y.toFixed(3), '; (2000) en büyük y', anaY.toFixed(3), 'm')
    rapor('a_arac: YAN_MS=1500 ile takılma noktası', rk.robot.state.x.toFixed(2), rk.robot.state.y.toFixed(2), 'en yakın duvar', (rk.enYakin * 100).toFixed(1), 'cm')
    rapor('a_arac: ana senaryo süre', ana.sure.toFixed(1), 'sn; en yakın duvar', (ana.enYakin * 100).toFixed(1), 'cm; son konum', ana.robot.state.x.toFixed(2), ana.robot.state.y.toFixed(2))
  },

  b_kol(sim) {
    const hedefler = [[12, 4], [8, 10], [4, 12]]
    const zamanlar = []
    let onceki = 0
    for (let ms = 0; ms < 20000 && zamanlar.length < 3; ms += 10) {
      sim.run(10)
      const say = (sim.serial.match(/nokta=\d/g) || []).length
      if (say > onceki) { zamanlar.push(sim.nowMs()); onceki = say }
    }
    assert.equal(zamanlar.length, 3, `üç nokta bildirilmeli: ${JSON.stringify(sim.serial)}`)
    let enBuyuk = 0
    const hatalar = []
    zamanlar.forEach((t, i) => {
      const [ux, uy] = ucAt(sim, t)
      const hataMm = Math.hypot(ux - hedefler[i][0], uy - hedefler[i][1]) * 10
      hatalar.push(hataMm)
      enBuyuk = Math.max(enBuyuk, hataMm)
      assert.ok(hataMm < 5, `${i + 1}. nokta hatası ${hataMm.toFixed(2)} mm, 5 mm'den küçük olmalı`)
    })
    // tutucu: 1. noktada açık gelir; 2. noktaya kapalı varır (parça alındı); dizi bitince açıktır
    const acik = 544 + (30 * (2400 - 544)) / 180, kapali = 544 + (100 * (2400 - 544)) / 180
    assert.ok(Math.abs(sonDarbe(sim, 11, zamanlar[0]) - acik) < 3, 'P1 varışında tutucu açık olmalı')
    assert.ok(Math.abs(sonDarbe(sim, 11, zamanlar[1]) - kapali) < 3, 'P2 varışında tutucu kapalı (parça elde) olmalı')
    sim.run(2500)
    assert.ok(/dizi bitti/.test(sim.serial), `dizi bitti yazmalı: ${JSON.stringify(sim.serial)}`)
    assert.ok(Math.abs(sonDarbe(sim, 11, sim.nowMs()) - acik) < 3, 'dizi bitince parça bırakılmış (tutucu açık) olmalı')
    assert.ok(zamanlar[2] / 1000 < 15, `dizi 15 sn altında bitmeli, ${(zamanlar[2] / 1000).toFixed(1)} sn`)
    // kol noktalar arasında zıplamamalı: hiçbir 20 ms adımda 2 dereceden fazla açı değişmemeli (yumuşak hareket)
    const w = sim.pulseWidthsUs(9, 0, sim.nowMs())
    let enBuyukAdim = 0
    for (let i = 1; i < w.length; i++) enBuyukAdim = Math.max(enBuyukAdim, Math.abs(usAci(w[i]) - usAci(w[i - 1])))
    assert.ok(enBuyukAdim < 2.5, `omuz bir periyotta ${enBuyukAdim.toFixed(2)} derece sıçradı`)
    rapor('b_kol: hatalar (mm)', hatalar.map((h) => h.toFixed(2)).join(' / '), 'toplam süre', (zamanlar[2] / 1000).toFixed(1), 'sn')
  },

  c_takip(sim, kaynak) {
    const s = hedefSahnesi(sim)
    // yakalama: 10 sn
    sim.run(10000)
    assert.ok(/durum: TAKIP/.test(sim.serial), 'hedef görülünce TAKIP durumuna geçilmeli')
    // senaryo 1: hedef 8 sn boyunca 3 cm/sn ile uzaklaşır, sonra 10 sn durur
    const a = hedefiGez(sim, s, 8000, 3)
    const b = hedefiGez(sim, s, 10000, 0)
    const en = Math.min(a.en, b.en), bu = Math.max(a.bu, b.bu)
    rapor('c_takip: hareketli hedef, 10-28 sn arası mesafe', en.toFixed(1), bu.toFixed(1), 'cm; hedef', ((s.tahta[0] - 1.0) * 100).toFixed(0), 'cm uzaklaştı')
    assert.ok(en >= 17 && bu <= 23, `hedef 20 ± 3 cm içinde kalmalı: ${en.toFixed(1)}-${bu.toFixed(1)} cm`)
    assert.ok(s.robot.state.x > 0.5 + 0.4, 'robot hedefi gerçekten izlemiş olmalı (en az 40 cm ilerlemeli)')
    assert.ok(Math.abs(s.robot.state.y - 1) < 0.1, 'robot yanlara savrulmamalı')

    // test matrisi: farklı tekerlek uyumsuzlukları ve başlangıç mesafesi (aynı kaynak yeniden derlenir)
    for (const [ad, ayar] of [['sağ motor %5 zayıf', { sagKazanc: 0.95 }], ['sağ motor %3 güçlü', { sagKazanc: 1.03 }], ['hedef 55 cm uzakta başlar', { baslangicCm: 55 }]]) {
      const s2 = createSim(kaynak, { name: 'c_takip' })
      const h2 = hedefSahnesi(s2, ayar)
      s2.run(10000)
      const p = hedefiGez(s2, h2, 8000, 3)
      const q = hedefiGez(s2, h2, 4000, 0)
      const e2 = Math.min(p.en, q.en), b2 = Math.max(p.bu, q.bu)
      assert.ok(e2 >= 17 && b2 <= 23, `[${ad}] 20 ± 3 cm dışına çıktı: ${e2.toFixed(1)}-${b2.toFixed(1)}`)
      rapor('c_takip matris:', ad, e2.toFixed(1), b2.toFixed(1), 'cm')
    }

    // senaryo 2: hedef kaybolur -> robot anında durmalı, KAYIP yazmalı
    const x0 = s.robot.state.x
    s.kon(3.5)
    sim.run(1500)
    const yol = (s.robot.state.x - x0) * 100
    assert.ok(yol < 3, `hedef kaybolunca ${yol.toFixed(1)} cm gitti; 3 cm'den az olmalı`)
    assert.ok(/durum: KAYIP/.test(sim.serial), 'KAYIP yazılmalı')
    rapor('c_takip: hedef kaybolunca gidilen yol', yol.toFixed(1), 'cm')

    // senaryo 3: hedef geri gelir -> yeniden TAKIP, 20 cm
    s.kon(s.robot.state.x + 0.06 + 0.5)
    sim.run(10000)
    assert.ok((sim.serial.match(/durum: TAKIP/g) || []).length === 2, 'hedef dönünce yeniden TAKIP yazılmalı')
    assert.ok(Math.abs(s.gercekCm() - 20) < 3, `hedef dönünce 20 ± 3 cm'e oturmalı, ${s.gercekCm().toFixed(1)}`)
  },

  // ===== Ders 114 =====
  telemetri(sim, kaynak) {
    const arena = Arena.box(3, 3)
    const robot = sim.rover({
      arena, pose: { x: 0.5, y: 0.5, theta: 0 }, motors: STD_MOTORS, encoders: STD_ENCODERS,
      ultrasonic: STD_ULTRASONIC, noiseCm: 1, seed: 2,
    })
    sim.run(5200)
    const hepsi = satirlar(sim)
    assert.ok(hepsi.length >= 48 && hepsi.length <= 52, `5,2 sn'de ~50 satır bekleniyordu, ${hepsi.length}`)
    const kayitlar = []
    for (const [i, s] of hepsi.entries()) {
      assert.equal(satirSorunu(s), null, `${i + 1}. satır geçersiz (${satirSorunu(s)}): ${s}`)
      kayitlar.push(JSON.parse(s))
    }
    // zaman damgası 100 ms aralıkla artmalı
    for (let i = 1; i < kayitlar.length; i++) {
      const fark = kayitlar[i].t - kayitlar[i - 1].t
      assert.ok(fark >= 95 && fark <= 105, `satırlar 100 ms arayla gelmeli, ${i}. fark ${fark}`)
    }
    // odometri gerçek konumla uyuşmalı (başlangıç (0,5; 0,5), yön 0)
    const son = kayitlar.at(-1)
    const gx = robot.state.x - 0.5, gy = robot.state.y - 0.5
    let gth = robot.state.theta
    while (gth > Math.PI) gth -= 2 * Math.PI
    const hataCm = Math.hypot(son.x - gx, son.y - gy) * 100
    assert.ok(hataCm < 5, `odometri konumu gerçekten ${hataCm.toFixed(1)} cm saptı (5 cm altı bekleniyordu)`)
    assert.ok(Math.abs(son.th - gth) < 0.15, `odometri yönü ${son.th} rad, gerçek ${gth.toFixed(3)} rad`)
    assert.ok(Math.abs(gth) > 1.5, 'plan sırasında robot dönmüş olmalı (th sıfırdan farklı)')
    // d alanı: önündeki duvara olan gerçek mesafeyle uyuşur (ilk satır: robot kıpırdamadan önce, duvar 3 - 0,5 - 0,06 m)
    assert.ok(Math.abs(kayitlar[0].d - 244) < 6, `ilk d ≈ 244 cm bekleniyordu, ${kayitlar[0].d}`)
    rapor('telemetri: satır sayısı', hepsi.length, '; odometri hatası', hataCm.toFixed(1), 'cm; ilk satırlar:', hepsi.slice(0, 2).join(' '), '; son:', hepsi.at(-1))

    // ölçüm hatası analizi: robot 50 cm'de duran bir duvara bakarken d alanının hatası (ders 114)
    const durgun = createSim(kaynak.replace('plan(simdi);', 'surus(0, 0);'), { name: 'telemetri_durgun' })
    durgun.rover({
      arena: Arena.box(3, 3), pose: { x: 3 - 0.5 - 0.06, y: 1.5, theta: 0 }, motors: STD_MOTORS, encoders: STD_ENCODERS,
      ultrasonic: STD_ULTRASONIC, noiseCm: 1, seed: 2,
    })
    durgun.run(10200)
    const dl = satirlar(durgun).map((x) => JSON.parse(x))
    assert.ok(dl.length >= 98, `10 sn'de ~100 satır bekleniyordu, ${dl.length}`)
    const oz = hataOzeti(dl.map((k) => k.d - 50))
    assert.ok(oz.ort < 1.5 && oz.maks < 4, `ultrasonik hata: ort ${oz.ort.toFixed(2)} maks ${oz.maks.toFixed(2)} cm`)
    assert.ok(dl.every((k) => k.x === 0 && k.y === 0 && k.th === 0), 'duran robotun odometrisi değişmemeli')
    rapor('telemetri (duran robot, 50 cm): satır', dl.length, 'ort hata', oz.ort.toFixed(2), 'maks', oz.maks.toFixed(2), 'cm')
    globalThis.__h8_log = dl.map((k) => JSON.stringify(k)).join('\n')

    // doğrulayıcının kendisini sına: bozuk satırları yakalamalı
    assert.equal(satirSorunu('{"t":100,"x":0.1,"y":0.2,"th":0.3,"d":50.0}'), null)
    assert.equal(satirSorunu('{"t":100,"x":0.1,"y":0.2,"th":0.3,"d":null}'), null)
    assert.match(satirSorunu('{"t":100,"x":0.1,"y":0.2,"th":0.3}'), /anahtarlar/)
    assert.match(satirSorunu('{"t":100,"x":0.1,"y":0.2,"th":4.0,"d":50}'), /th/)
    assert.match(satirSorunu('{"t":100,"x":0.1,"y":0.2,"th":0.3,"d":1000}'), /d /)
    assert.match(satirSorunu('{"t":100,"x":0.1,"y":0.2,"th":0.3,"d":'), /JSON/)
    assert.match(satirSorunu('{"t":-5,"x":0.1,"y":0.2,"th":0.3,"d":50}'), /t /)
  },

  // Hata analizi: ortalama ve en büyük mutlak hata, elle hesaplanmış örnekle ve gerçek bir ölçümle sınanır.
  hata_istatistik(sim) {
    sim.run(50)
    const hatalar = [1.2, -3.1, 0.4, 2.0, -0.2]
    for (const h of hatalar) gonder(sim, `e ${h}\n`)
    gonder(sim, 'r\n')
    const ozet = hataOzeti(hatalar)
    assert.equal(sonSatir(sim), `n=5 ort=${ozet.ort.toFixed(2)} maks=${ozet.maks.toFixed(2)}`,
      `ortalama 1,38 ve maks 3,10 bekleniyordu: ${sonSatir(sim)}`)
    assert.equal(ozet.ort.toFixed(2), '1.38')
    assert.equal(ozet.maks.toFixed(2), '3.10')
    gonder(sim, 's\n')
    gonder(sim, 'r\n')
    assert.equal(sonSatir(sim), 'n=0 ort=0.00 maks=0.00', 'sıfırlama sonrası boş istatistik')
    // işaret önemli değil: +3 ve -3 birbirini götürmemeli (ortalama MUTLAK hata)
    gonder(sim, 'e 3\n'); gonder(sim, 'e -3\n'); gonder(sim, 'r\n')
    assert.equal(sonSatir(sim), 'n=2 ort=3.00 maks=3.00')
  },

  skor_tablosu(sim, kaynak) {
    const arena = Arena.box(2, 2).line([[0.2, 1.0], [0.7, 1.0], [1.0, 1.15], [1.8, 1.15]])
    const sensorler = SENSORLER()
    const robot = sim.rover({
      arena, pose: { x: 0.25, y: 0.985, theta: 0 }, motors: STD_MOTORS, lineSensors: sensorler,
      bumpers: { left: 2, right: 3 }, noiseCm: 0, seed: 1,
    })
    let sonGorulen = 0, topl = 0, say = 0
    while (!/SKOR .*\n/.test(sim.serial) && sim.nowMs() < 20000) {
      sim.run(10)
      if (sensorler.some((l) => l.on)) {
        sonGorulen = sim.nowMs()
        const fx = robot.state.x + 0.07 * Math.cos(robot.state.theta), fy = robot.state.y + 0.07 * Math.sin(robot.state.theta)
        topl += cizgiyeUzaklik(arena, fx, fy) * 1000; say++
      }
    }
    const m = sim.serial.match(/^SKOR sonuc=BITTI sure_s=([\d.]+) carpma=0 ort_hata_mm=([\d.]+)\r?$/m)
    assert.ok(m, `temiz koşuda BITTI ve 0 çarpma bekleniyordu: ${JSON.stringify(sim.serial)}`)
    const sure = Number(m[1]), ort = Number(m[2])
    const gercekSure = (sonGorulen - 500) / 1000
    assert.ok(Math.abs(sure - gercekSure) < 0.15, `süre ${sure} sn, gerçek ${gercekSure.toFixed(2)} sn`)
    // Sensörler 20 mm aralıklı ve çizgi 20 mm geniş: bir sensör çizgiyi ±10 mm içinde "görür". Skor tablosu gerçek
    // hatayı bu çözünürlükle (en çok 10 mm farkla) ve çoğunlukla olduğundan küçük ölçer.
    const gercekOrt = topl / say
    assert.ok(gercekOrt - ort >= 0 && gercekOrt - ort < 10, `ortalama hata ${ort} mm, gerçek ${gercekOrt.toFixed(1)} mm: fark 0-10 mm olmalı`)
    assert.ok(ort > 0, 'çizgi tam ortada olmadığı için ortalama hata 0 olamaz')
    assert.ok(sure > 4 && sure < 9, `1,6 m'lik pist 4-9 sn sürmeli, ${sure} sn`)
    // engelli koşu: çizgi bir duvara çıkıyor -> tampon basılır, robot ilerleyemez, süre aşımı
    const k2 = createSim(kaynak, { name: 'skor_tablosu' })
    const arena2 = Arena.box(2, 2).line([[0.2, 1.0], [0.7, 1.0], [1.0, 1.15], [1.8, 1.15]]).wall(1.5, 0.9, 1.5, 1.4)
    k2.rover({
      arena: arena2, pose: { x: 0.25, y: 0.985, theta: 0 }, motors: STD_MOTORS, lineSensors: SENSORLER(),
      bumpers: { left: 2, right: 3 }, noiseCm: 0, seed: 1,
    })
    k2.run(17000)
    const m2 = k2.serial.match(/^SKOR sonuc=(\w+) sure_s=([\d.]+) carpma=(\d+) ort_hata_mm=([\d.]+)\r?$/m)
    assert.ok(m2, `engelli koşuda skor satırı bekleniyordu: ${JSON.stringify(k2.serial)}`)
    assert.equal(m2[1], 'ZAMAN_ASIMI', 'duvara dayanan robot pisti bitiremez')
    assert.equal(Number(m2[3]), 1, `tek duvara tek çarpma sayılmalı: ${m2[0]}`)
    assert.ok(Math.abs(Number(m2[2]) - 15) < 0.1, `süre aşımı 15 sn olmalı: ${m2[2]}`)
    rapor('skor_tablosu: engelli koşu', m2[0].trim())
    rapor('skor_tablosu: temiz koşu', m[0].trim(), '; gerçek ortalama hata', gercekOrt.toFixed(1), 'mm; gerçek süre', gercekSure.toFixed(2))
  },
}

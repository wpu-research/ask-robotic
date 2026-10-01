import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { Arena, STD_MOTORS, STD_ENCODERS, STD_ULTRASONIC } from '../../../tools/sim/robot.mjs'

// PID_LOG=1 node tools/sim/check.mjs modul-5 h5  ->  ölçümleri yazdırır (derslerdeki sayılar buradan gelir)
const LOG = (...a) => { if (process.env.PID_LOG) console.log('    [ölçüm]', ...a) }

// Bang-bang karşılaştırma sketch'i 100. derste; başka sketch'ler de ona ihtiyaç duyabilir.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { extractSketches } from '../../../tools/sim/lessons.mjs'
const BU = fileURLToPath(new URL('.', import.meta.url))
const KAYNAKLAR = Object.fromEntries(
  ['100-proje-pid-cizgi-ve-duvar.md'].flatMap((f) => extractSketches(readFileSync(BU + f, 'utf8')).map((k) => [k.name, k.source])),
)

// ---------------------------------------------------------------- yardımcılar
let sayac = 0
/** Kaynaktaki bir sabitin değerini değiştirir ("const float KP = 200.0;" -> yeni değer). */
function ayar(src, degerler) {
  let s = src
  for (const [ad, v] of Object.entries(degerler)) {
    const re = new RegExp(`(\\b${ad}\\s*=\\s*)[-+\\w.]+`)
    assert.ok(re.test(s), `sketch'te "${ad}" sabiti bulunamadı`)
    s = s.replace(re, `$1${v}`)
  }
  return s
}
const sim_yap = (src, ad) => createSim(src, { name: `${ad}_${++sayac}` })
const kareKok = (a) => Math.sqrt(a.reduce((x, v) => x + v * v, 0) / a.length)
const ort = (a) => a.reduce((x, v) => x + v, 0) / a.length

/** Birim: metre. Çizginin solunda kalan nokta için işaret +. */
function isaretliUzaklik(pl, px, py) {
  let best = Infinity, sg = 1
  for (let i = 0; i + 1 < pl.length; i++) {
    const [x1, y1] = pl[i], [x2, y2] = pl[i + 1]
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2))
    const d = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
    if (d < best) { best = d; sg = Math.sign(dx * (py - y1) - dy * (px - x1)) || 1 }
  }
  return best * sg
}

// ---------------------------------------------------------------- çizgi pisti
// Stadyum biçimli pist (saat yönünün tersi), alt düzlükte iki dalgalı "slalom" bölümü var.
function pist(cx = 0.9, cy = 0.45, L = 0.9, R = 0.17, amp = 0.03, lam = 0.4, basla = 0.2) {
  const p = []
  const x0 = cx - L / 2, x1 = cx + L / 2, xs = x0 + basla
  for (let x = x0; x <= x1 + 1e-9; x += 0.015) {
    const off = x >= xs && x <= xs + 2 * lam ? amp * Math.sin((2 * Math.PI * (x - xs)) / lam) : 0
    p.push([x, cy - R + off])
  }
  for (let a = -85; a <= 90; a += 5) p.push([x1 + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)])
  p.push([x0, cy + R])
  for (let a = 95; a <= 270; a += 5) p.push([x0 + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)])
  return p
}
// kolay: geniş virajlı (R = 17 cm), hafif slalom. zor: dar viraj (R = 12 cm), dik slalom (4,5 cm genlik).
const PISTLER = {
  kolay: { pl: pist(), y0: 0.28 },
  zor: { pl: pist(0.9, 0.45, 0.9, 0.12, 0.045, 0.3, 0.15), y0: 0.33 },
}
const dizi = (x = 0.07) => [0.048, 0.024, 0, -0.024, -0.048].map((y, i) => ({ pin: i, kind: 'analog', x, y }))

/**
 * Çizgi izleme koşusu. Tur: robot toplam 360 derece döndükten sonra başlangıç düzlüğüne dönünce biter.
 * Çizgiden 5 cm'den fazla uzak kalırsa (0,6 sn) "çizgiyi kaybetti".
 */
function cizgiKos(src, ad, { dizix = 0.07, gain = { left: 1, right: 1 }, maxSn = 20, pistAdi = 'kolay' } = {}) {
  const { pl: PIST, y0 } = PISTLER[pistAdi]
  const sim = sim_yap(src, ad)
  const arena = Arena.box(1.8, 0.9).line(PIST)
  const rb = sim.rover({ arena, pose: { x: 0.5, y: y0, theta: 0 }, motors: STD_MOTORS, lineSensors: dizi(dizix), gain })
  const s = rb.state
  const hata = []
  let thCum = 0, lastTh = 0, kayip = 0, kaybetti = false, tur = null, flips = 0, onceki = 0, titre = 0, oncW = 0, n = 0, cross = 0
  for (let t = 0; t < maxSn * 1000; t += 20) {
    sim.run(20)
    const d = isaretliUzaklik(PIST, s.x + Math.cos(s.theta) * dizix, s.y + Math.sin(s.theta) * dizix)
    hata.push(d * 1000)
    thCum += s.theta - lastTh; lastTh = s.theta
    const w = s.wR - s.wL
    titre += Math.abs(w - oncW); oncW = w; n++
    if (Math.abs(d) > 0.003) { const sg = Math.sign(d); if (onceki && sg !== onceki) cross++; onceki = sg }
    kayip = Math.abs(d) > 0.05 ? kayip + 20 : 0
    if (kayip > 600) { kaybetti = true; break }
    if (thCum > 2 * Math.PI - 0.1 && s.x > 0.5 && s.y < y0 + 0.07 && t > 3000) { tur = (t + 20) / 1000; break }
  }
  return { tur, kaybetti, rms: kareKok(hata), maks: Math.max(...hata.map(Math.abs)), titre: titre / n, cross, mesafe: s.distanceM, sim, rb }
}
const ozet = (r) => ({ tur: r.tur, kaybetti: r.kaybetti, rms_mm: +r.rms.toFixed(1), maks_mm: +r.maks.toFixed(0), titre: +r.titre.toFixed(2), cross: r.cross })

// ---------------------------------------------------------------- duvar takibi
// Sol tarafta uzun, hafif kıvrımlı bir duvar: y = 0,60 + amp * sin(2 pi x / 1,2). Robot +x yönünde gider.
function duvar(amp = 0.03, uzunluk = 3.2) {
  const pl = []
  for (let x = 0; x <= uzunluk + 1e-9; x += 0.1) pl.push([x, 0.6 + amp * Math.sin((2 * Math.PI * x) / 1.2)])
  const arena = new Arena()
  for (let i = 0; i + 1 < pl.length; i++) arena.wall(...pl[i], ...pl[i + 1])
  arena.wall(uzunluk, 0, uzunluk, 2).wall(0, 0.1, uzunluk, 0.1)     // uç duvarı ve alt sınır
  return { arena, pl }
}
function duvaraUzaklik(pl, px, py) {
  let best = Infinity
  for (let i = 0; i + 1 < pl.length; i++) {
    const [x1, y1] = pl[i], [x2, y2] = pl[i + 1]
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2))
    best = Math.min(best, Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)))
  }
  return best
}

/**
 * Duvar koşusu. Hata (cm) = robot merkezinin duvara gerçek uzaklığı - 15. Servo/yerleşme için ilk 1 sn atlanır.
 * Dönen: rms, maks, bant (|hata| <= 2 cm oranı), titre (direksiyon titreşimi), cross, carpti, ofset (son 1 sn ortalaması).
 */
function duvarKos(src, ad, { y = 0.45, amp = 0.03, noise = 0, seed = 3, gain, sn = 10, theta = 0 } = {}) {
  const { arena, pl } = duvar(amp)
  const sim = sim_yap(src, ad)
  const rb = sim.rover({ arena, pose: { x: 0.3, y, theta }, motors: STD_MOTORS, ultrasonic: STD_ULTRASONIC, noiseCm: noise, seed, gain })
  const s = rb.state
  sim.run(1000)
  const e = [], t = []
  let titre = 0, oncW = s.wR - s.wL, carpti = false
  for (let ms = 1000; ms < sn * 1000; ms += 20) {
    sim.run(20)
    e.push((duvaraUzaklik(pl, s.x, s.y) - 0.15) * 100)
    t.push(ms + 20)
    const w = s.wR - s.wL
    titre += Math.abs(w - oncW); oncW = w
    if (s.collided) carpti = true
  }
  let cross = 0, onceki = 0
  for (const v of e) if (Math.abs(v) > 0.5) { const sg = Math.sign(v); if (onceki && sg !== onceki) cross++; onceki = sg }
  const son = e.slice(-50)
  // yerleşme: bundan sonra hata hep +-2 cm içinde kalır (saniye, başlangıçtan)
  let yerles = null
  for (let i = 0; i < e.length; i++) if (e.slice(i).every((v) => Math.abs(v) <= 2)) { yerles = t[i] / 1000; break }
  return {
    rms: kareKok(e), maks: Math.max(...e.map(Math.abs)), asim: Math.max(0, -Math.min(...e)), bant: e.filter((v) => Math.abs(v) <= 2).length / e.length,
    titre: titre / e.length, cross, carpti, ofset: ort(son), yerles, e, t, sim, rb,
  }
}
const dozet = (r) => ({ asim_cm: +r.asim.toFixed(1), rms_cm: +r.rms.toFixed(2), maks_cm: +r.maks.toFixed(1), bant: +r.bant.toFixed(2), titre: +r.titre.toFixed(3), cross: r.cross, ofset_cm: +r.ofset.toFixed(2), yerles_sn: r.yerles, carpti: r.carpti })


// ---------------------------------------------------------------- hız döngüsü (enkoder)
/** Düz zeminde iki tekerlek aynı komutla sürülür; her 20 ms'de sol tekerleğin GERÇEK hızı (cm/s) kaydedilir. */
function hizKos(src, ad, sn) {
  const sim = sim_yap(src, ad)
  const rb = sim.rover({ arena: Arena.box(8, 3), pose: { x: 0.3, y: 1.5, theta: 0 }, motors: STD_MOTORS, encoders: STD_ENCODERS })
  const v = []
  for (let t = 0; t < sn * 1000; t += 20) { sim.run(20); v.push({ t: t + 20, v: rb.state.wL * 3.3 }) }
  return { v, sim, rb }
}
/** [a, b] ms aralığında hedefe göre: IAE (cm), en büyük aşım, hedefin +-2 cm içine girip kalma süresi (sn, a'dan). */
function izle(v, hedef, a, b) {
  const s = v.filter((p) => p.t > a && p.t <= b)
  let iae = 0, asim = 0, alt = 0
  for (const p of s) { iae += Math.abs(hedef - p.v) * 0.02; asim = Math.max(asim, p.v - hedef); alt = Math.max(alt, hedef - p.v) }
  let yerles = null
  for (let i = 0; i < s.length; i++) if (s.slice(i).every((p) => Math.abs(p.v - hedef) <= 2)) { yerles = (s[i].t - a) / 1000; break }
  return { iae: +iae.toFixed(1), asim: +asim.toFixed(1), alt: +alt.toFixed(1), yerles }
}


/** Adım cevabı: "ms,hiz" satırlarından birinci derece + gecikme modeli (iki nokta yöntemi: %28,3 ve %63,2). */
function adimModeli(serial, tAdim, u1, u2) {
  const pts = serial.trim().split(/\r?\n/).map((l) => l.split(',').map(Number)).filter((a) => a.length === 2 && a.every(Number.isFinite))
  const v0 = ort(pts.filter((p) => p[0] > tAdim - 500 && p[0] < tAdim).map((p) => p[1]))
  const v1 = ort(pts.filter((p) => p[0] > tAdim + 1000).map((p) => p[1]))
  const k = (v1 - v0) / (u2 - u1)
  const gecis = (oran) => {
    const hedef = v0 + oran * (v1 - v0)
    const after = pts.filter((p) => p[0] >= tAdim)
    for (let i = 1; i < after.length; i++) {
      if (after[i][1] >= hedef) {
        const [ta, va] = after[i - 1], [tb, vb] = after[i]
        return (ta + ((hedef - va) / (vb - va)) * (tb - ta) - tAdim) / 1000
      }
    }
    return NaN
  }
  const t28 = gecis(0.283), t63 = gecis(0.632)
  const tau = 1.5 * (t63 - t28)
  return { pts, v0, v1, k, t28, t63, tau, theta: t63 - tau }
}

// ---------------------------------------------------------------- 96
export default {
  konum_oku(sim) {
    const dene = (volts) => {
      volts.forEach((v, i) => sim.analog(i, v))
      sim.run(450)
      const satirlar = sim.serial.trim().split(/\r?\n/)
      return satirlar.at(-1)
    }
    const ON = 4.2, OFF = 0.8
    sim.run(100)
    assert.equal(dene([OFF, OFF, ON, OFF, OFF]), '0.0', 'ortadaki sensör: konum 0')
    assert.equal(dene([OFF, ON, OFF, OFF, OFF]), '1.0', 'A1: konum +1')
    assert.equal(dene([ON, ON, OFF, OFF, OFF]), '1.5', 'A0+A1: konum +1,5')
    assert.equal(dene([OFF, OFF, OFF, OFF, ON]), '-2.0', 'A4: konum -2')
    assert.equal(dene([OFF, OFF, OFF, ON, ON]), '-1.5', 'A3+A4: konum -1,5')
    assert.equal(dene([OFF, OFF, OFF, OFF, OFF]), 'kayip', 'hiçbiri görmüyorsa "kayip"')
  },

  p_cizgi(sim, kaynak) {
    const sonuc = {}
    for (const kp of [8, 85, 210, 830]) {
      const r = cizgiKos(ayar(kaynak, { KP: kp.toFixed(1) }), 'p_cizgi')
      sonuc[kp] = r
      LOG('p_cizgi KP', kp, JSON.stringify(ozet(r)))
    }
    // dizi aksa yaklaşınca (öne bakma azalır) aynı Kp daha çok salınır
    const uzak = cizgiKos(ayar(kaynak, { KP: '210.0' }), 'p_cizgi', { dizix: 0.07, maxSn: 8 })
    const yakin = cizgiKos(ayar(kaynak, { KP: '210.0' }), 'p_cizgi', { dizix: 0.02, maxSn: 8 })
    LOG('dizi 7 cm', JSON.stringify(ozet(uzak)), 'dizi 2 cm', JSON.stringify(ozet(yakin)))
    assert.ok(yakin.cross >= uzak.cross * 1.5, `dizi aksa yakınken daha çok salınmalı: ${yakin.cross} / ${uzak.cross}`)
    assert.ok(yakin.rms > 1.4 * uzak.rms, `dizi aksa yakınken RMS büyümeli: ${yakin.rms.toFixed(1)} / ${uzak.rms.toFixed(1)}`)
    // çok küçük Kp: viraj dönülemez, çizgi kaybolur
    assert.ok(sonuc[8].kaybetti || sonuc[8].tur === null, 'Kp=8 çizgiyi kaybetmeliydi')
    assert.ok(sonuc[8].maks > 50, `Kp=8 çizgiden >50 mm uzaklaşmalıydı: ${sonuc[8].maks.toFixed(0)}`)
    // uygun Kp: tur biter, çizgiden kopmaz
    for (const kp of [85, 210]) {
      assert.ok(sonuc[kp].tur && !sonuc[kp].kaybetti, `Kp=${kp} turu bitirmeliydi`)
      assert.ok(sonuc[kp].maks < 50, `Kp=${kp} maks sapma <50 mm olmalıydı: ${sonuc[kp].maks.toFixed(0)}`)
    }
    // Kp büyüdükçe hata RMS'i küçülür ...
    assert.ok(sonuc[210].rms < sonuc[85].rms, 'Kp 85 -> 210: RMS küçülmeliydi')
    // ... ama direksiyon titreşimi artar ve tur uzar
    assert.ok(sonuc[830].titre > 1.5 * sonuc[85].titre, `Kp=830 titreşimi Kp=85'in 1,5 katından fazla olmalıydı: ${sonuc[830].titre.toFixed(2)} / ${sonuc[85].titre.toFixed(2)}`)
    assert.ok(sonuc[830].tur > sonuc[85].tur, `Kp=830 turu uzatmalıydı: ${sonuc[830].tur} / ${sonuc[85].tur}`)
  },
  d_duvar(sim, kaynak) {
    const temel = { y: 0.41, amp: 0, sn: 9 }          // 4 cm uzaktan başla, düz duvar
    const sade = (kp, kd, extra = {}) => duvarKos(ayar(kaynak, { KP: kp.toFixed(1), KD: kd.toFixed(1), ALFA: '0.0', ...extra }), 'd_duvar', temel)
    // 1) gürültüsüz: Kp büyüdükçe P tek başına aşar; D aynı Kp'yi sakinleştirir
    const p = {}, pd = {}
    for (const kp of [16, 32, 48, 64]) {
      p[kp] = sade(kp, 0); pd[kp] = sade(kp, 0.15 * kp)
      LOG(`Kp=${kp} Kd=0`, JSON.stringify(dozet(p[kp])), `| Kd=${(0.15 * kp).toFixed(1)}`, JSON.stringify(dozet(pd[kp])))
    }
    assert.ok(p[16].asim < p[32].asim && p[32].asim < p[48].asim, `Kp büyüdükçe aşım artmalı: ${[16, 32, 48].map((k) => p[k].asim.toFixed(1))}`)
    assert.ok(p[48].carpti && p[64].carpti, 'Kp=48 ve 64 (D yok) duvara çarpmalıydı')
    assert.ok(p[16].yerles < 2.5 && p[32].asim > 3, 'Kp=16 oturmalı; Kp=32 belirgin aşmalı')
    for (const kp of [32, 48, 64]) {
      assert.ok(!pd[kp].carpti, `Kp=${kp} + Kd çarpmamalıydı`)
      assert.ok(pd[kp].maks < 3, `Kp=${kp} + Kd: sapma <3 cm olmalıydı: ${pd[kp].maks.toFixed(1)}`)
      assert.ok(pd[kp].rms < p[kp].rms / 3, `Kp=${kp}: Kd RMS'i en az 3 kat azaltmalıydı: ${pd[kp].rms.toFixed(2)} / ${p[kp].rms.toFixed(2)}`)
    }
    assert.ok(pd[32].yerles < p[32].yerles, 'Kd oturma süresini kısaltmalıydı')

    // 2) 1 cm gürültülü ultrasonik: ham türev motoru titretir, süzgeç bunu keser
    const g = { noise: 1, ...temel }
    const gur = (ek) => duvarKos(ayar(kaynak, ek), 'd_duvar', g)
    const n0 = gur({ KD: '0.0' })
    const ham = gur({ ALFA: '0.0' })
    const suz = gur({})                                  // dersteki hâli: KP=16, KD=3, ALFA=0,8
    const ham20 = gur({ KD: '20.0', ALFA: '0.0' })
    const suz20 = gur({ KD: '20.0' })
    LOG('gürültülü Kd=0', JSON.stringify(dozet(n0)))
    LOG('gürültülü Kd=3 ham', JSON.stringify(dozet(ham)))
    LOG('gürültülü Kd=3 süzgeçli', JSON.stringify(dozet(suz)))
    LOG('gürültülü Kd=20 ham', JSON.stringify(dozet(ham20)))
    LOG('gürültülü Kd=20 süzgeçli', JSON.stringify(dozet(suz20)))
    assert.ok(ham.titre > 3 * n0.titre, `ham türev titreşimi >=3 kat artırmalı: ${ham.titre.toFixed(2)} / ${n0.titre.toFixed(2)}`)
    assert.ok(suz.titre < 0.6 * ham.titre, `süzgeç titreşimi azaltmalı: ${suz.titre.toFixed(2)} / ${ham.titre.toFixed(2)}`)
    assert.ok(suz.rms < n0.rms, `süzgeçli D gürültüde de P'den iyi olmalı: ${suz.rms.toFixed(2)} / ${n0.rms.toFixed(2)}`)
    assert.ok(ham20.rms > ham.rms, `Kd çok büyürse hata yeniden artmalı: ${ham20.rms.toFixed(2)} / ${ham.rms.toFixed(2)}`)
  },
  i_duvar(sim, kaynak) {
    // sağ motor %15 zayıf: robot kendiliğinden duvardan uzaklaşmaya (sağa) çeker
    const g = { left: 1, right: 0.85 }
    const o = { y: 0.45, amp: 0, sn: 12, gain: g }
    const bant = (r, t0) => { const e = r.e.filter((_, i) => r.t[i] >= t0); return e.filter((v) => Math.abs(v) <= 2).length / e.length }
    const p = duvarKos(ayar(kaynak, { KI: '0.0' }), 'i_duvar', o)
    const pi = duvarKos(kaynak, 'i_duvar', o)
    const pdsiz = duvarKos(kaynak, 'i_duvar', { ...o, sn: 9, gain: { left: 1, right: 1 } })
    for (const ki of [0.5, 1, 6, 12]) LOG('KI', ki, JSON.stringify(dozet(duvarKos(ayar(kaynak, { KI: ki.toFixed(1) }), 'i_duvar', o))))
    // integral sınırı çok dar (KI x ILIM = 6 PWM < gereken ~13 PWM): I tam düzeltemez, sapma P'den küçük ama sıfır değil
    const dar = duvarKos(ayar(kaynak, { ILIM: '3.0' }), 'i_duvar', o)
    LOG('ILIM=3 (KI x ILIM = 6 PWM)', JSON.stringify(dozet(dar)))
    assert.ok(dar.ofset > 0.8 && dar.ofset < 1.8, `dar integral sınırı sapmayı yalnız kısmen kapatmalı: ${dar.ofset.toFixed(2)}`)
    LOG('P(D) mismatch', JSON.stringify(dozet(p)), 'bant>6s', bant(p, 6).toFixed(2))
    LOG('PI(D) mismatch', JSON.stringify(dozet(pi)), 'bant>6s', bant(pi, 6).toFixed(2))
    LOG('PI(D) eşit motor', JSON.stringify(dozet(pdsiz)))
    assert.ok(p.ofset > 2, `I yokken kalıcı sapma >2 cm olmalıydı: ${p.ofset.toFixed(2)}`)
    assert.ok(bant(p, 6) < 0.2, 'I yokken robot hedef bandına girmemeli')
    assert.ok(Math.abs(pi.ofset) < 0.4, `I ile kalıcı sapma <0,4 cm olmalıydı: ${pi.ofset.toFixed(2)}`)
    assert.ok(bant(pi, 6) > 0.95, `I ile 6. sn'den sonra +-2 cm içinde kalmalıydı: ${bant(pi, 6).toFixed(2)}`)
    assert.ok(Math.abs(pdsiz.ofset) < 0.4, 'motorlar eşitken de I zarar vermemeli')
    assert.ok(!pdsiz.carpti, 'eşit motorlu koşu duvara çarpmamalıydı')
  },

  i_hiz_windup(sim, kaynak) {
    const clampsiz = hizKos(kaynak, 'i_hiz_windup', 10)
    const clampli = hizKos(ayar(kaynak, { ANTI_WINDUP: 'true' }), 'i_hiz_windup', 10)
    // 50 cm/s istenir, motor en çok ~39,6 cm/s verir (12 rad/s x 3,3 cm)
    for (const r of [clampsiz, clampli]) {
      const doy = r.v.filter((p) => p.t > 4500 && p.t <= 7500).map((p) => p.v)
      assert.ok(ort(doy) > 37 && Math.max(...doy) < 41, `doyma: hız ~39,6 cm/s'de kalmalı: ${ort(doy).toFixed(1)}`)
      const rahat = izle(r.v, 25, 2000, 3500)
      assert.ok(rahat.yerles !== null && rahat.iae < 3, 'doymadan önce 25 cm/s izlenmeliydi')
    }
    // seri çıktı: "ms,hedef,hiz,integral" — doymada integral birikir (clamp'siz) ya da birikmez (clamp'li)
    const integralde = (r, ms) => {
      const sat = r.sim.serial.trim().split(/\r?\n/).map((l) => l.split(',').map(Number)).find((a) => a.length === 4 && a[0] >= ms)
      assert.ok(sat, `seri çıktıda ${ms} ms satırı yok`)
      return sat[3]
    }
    const iVar = integralde(clampsiz, 7000), iYok = integralde(clampli, 7000), i25 = integralde(clampsiz, 3000)
    LOG('integral: 3 sn', i25, ' 7 sn clamp yok', iVar, ' 7 sn clamp var', iYok)
    assert.ok(iVar > 20 && iYok < 0.3 * iVar, `doymada integral birikmeli (clamp'siz ${iVar}) ve clamp'li küçük kalmalı (${iYok})`)
    const a = izle(clampsiz.v, 15, 7500, 10000), b = izle(clampli.v, 15, 7500, 10000)
    LOG('windup VAR   ', JSON.stringify(a))
    LOG('windup YOK   ', JSON.stringify(b))
    assert.ok(a.yerles === null || a.yerles > 0.6, `clamp'siz toparlanma yavaş olmalı (>0,6 sn): ${a.yerles}`)
    assert.ok(b.yerles !== null && b.yerles < 0.5, `clamp'li toparlanma <0,5 sn olmalı: ${b.yerles}`)
    assert.ok(a.iae > 5 * b.iae, `clamp'siz IAE en az 5 kat büyük olmalı: ${a.iae} / ${b.iae}`)
  },
  adim_cevabi(sim, kaynak) {
    const sim2 = sim_yap(kaynak, 'adim_cevabi')
    sim2.rover({ arena: Arena.box(8, 3), pose: { x: 0.3, y: 1.5, theta: 0 }, motors: STD_MOTORS, encoders: STD_ENCODERS })
    sim2.run(4200)
    const m = adimModeli(sim2.serial, 2000, 100, 180)
    LOG('adım cevabı', JSON.stringify({ n: m.pts.length, v0: +m.v0.toFixed(2), v1: +m.v1.toFixed(2), k: +m.k.toFixed(4), t28: +m.t28.toFixed(3), t63: +m.t63.toFixed(3), tau: +m.tau.toFixed(3), theta: +m.theta.toFixed(3) }))
    LOG('adım sonrası ilk noktalar', m.pts.filter((p) => p[0] >= 1990 && p[0] < 2400).map((p) => p.join(':')).join(' '))
  },
  simc_hiz(sim, kaynak) {
    const sat = (src, ad, v) => src.replace(new RegExp(`const float ${ad} = [^;]+;`), `const float ${ad} = ${v};`)
    const kosu = (kc, ti) => hizKos(sat(sat(kaynak, 'KC', kc), 'TI', ti), 'simc_hiz', 5.6).v
    const ozet2 = (v) => ({ yukari: izle(v, 25, 1500, 3500), asagi: izle(v, 15, 3500, 5500) })

    // 1) Sketch formülü: Kc = (1/k) tau/(tauc+theta), Ti = min(tau, 4(tauc+theta))
    const simc = hizKos(kaynak, 'simc_hiz', 5.6)
    const kcBeklenen = (1 / 0.156) * 0.077 / (0.038 + 0.038)
    const m = simc.sim.serial.match(/Kc=([\d.]+) Ti=([\d.]+)/)
    assert.ok(m, `Kc/Ti yazdırılmalıydı: ${JSON.stringify(simc.sim.serial)}`)
    assert.ok(Math.abs(Number(m[1]) - kcBeklenen) < 0.05 && Math.abs(Number(m[2]) - 0.077) < 0.001, `Kc ${m[1]}, Ti ${m[2]} (beklenen ${kcBeklenen.toFixed(2)}, 0.077)`)
    const S = ozet2(simc.v)
    LOG('SIMC (derste)', m[0], JSON.stringify(S))
    assert.ok(S.yukari.yerles !== null && S.yukari.yerles <= 0.3, `SIMC 15->25 oturma <= 0,3 sn: ${S.yukari.yerles}`)
    assert.ok(S.asagi.yerles !== null && S.asagi.yerles <= 0.35, `SIMC 25->15 oturma <= 0,35 sn: ${S.asagi.yerles}`)
    assert.ok(S.yukari.asim < 4, `SIMC aşımı < 4 cm/s: ${S.yukari.asim}`)

    // 2) tahminle ayar (zayıf kazanç): hedefe yetişemez
    const Z = ozet2(kosu('1.0', '1.0'))
    LOG('el ile zayıf Kc=1 Ti=1', JSON.stringify(Z))
    assert.ok(Z.yukari.yerles === null && Z.yukari.iae > 10 * S.yukari.iae, `zayıf ayar çok kötü olmalı: ${Z.yukari.iae} / ${S.yukari.iae}`)

    // 3) SIMC'te daha yumuşak seçim (tauc = 3 theta): kazanç düşer, aşım kaybolur
    const kcYum = (1 / 0.156) * 0.077 / (0.114 + 0.038)
    const Y = ozet2(kosu(kcYum.toFixed(3), '0.077'))
    LOG('SIMC yumuşak (tauc=3 theta) Kc', kcYum.toFixed(2), JSON.stringify(Y))
    assert.ok(Y.yukari.asim < S.yukari.asim && Y.yukari.asim < 1, `yumuşak SIMC aşmamalı: ${Y.yukari.asim} / ${S.yukari.asim}`)

    // 4) Ziegler-Nichols: kararlılık sınırı (Ku) için P kazancını artır, kalıcı salınımı ara
    const periyot = (v) => {
      const w = v.filter((p) => p.t > 2300 && p.t <= 3500)
      const o0 = ort(w.map((p) => p.v)), yuk = []
      for (let i = 1; i < w.length; i++) if (w[i - 1].v < o0 && w[i].v >= o0) yuk.push(w[i].t)
      return yuk.length > 1 ? (yuk.at(-1) - yuk[0]) / (yuk.length - 1) / 1000 : NaN
    }
    let ku = null, pu = null
    const taramaP2p = {}
    for (const kc of [10, 14, 16, 18, 20, 22, 24]) {
      const v = kosu(kc.toFixed(1), '1000000.0')
      const w = v.filter((p) => p.t > 2400 && p.t <= 3500).map((p) => p.v)
      const p2p = Math.max(...w) - Math.min(...w)
      taramaP2p[kc] = p2p
      if (ku === null && p2p > 8) { ku = kc; pu = periyot(v) }
    }
    LOG('P-only tarama (kazanç: tepeden tepeye cm/s)', JSON.stringify(taramaP2p), 'Ku', ku, 'Pu', pu)
    assert.ok(ku !== null && ku >= 18 && ku <= 24, `kalıcı salınım 18-24 arasında başlamalı: Ku=${ku}`)
    assert.ok(taramaP2p[16] < 3, `Kc=16'da salınım küçük olmalı: ${taramaP2p[16]}`)
    assert.ok(pu > 0.15 && pu < 0.3, `salınım periyodu ~0,2 sn olmalı: ${pu}`)
    assert.ok(Number(m[1]) < ku / 2.5, `SIMC kazancı (${m[1]}) Ku'nun (${ku}) çok altında kalmalı`)
    const zKc = 0.45 * ku, zTi = pu / 1.2
    const ZN = ozet2(kosu(zKc.toFixed(2), zTi.toFixed(3)))
    LOG('Z-N PI Kc', zKc.toFixed(2), 'Ti', zTi.toFixed(3), JSON.stringify(ZN))
    assert.ok(ZN.yukari.yerles !== null && ZN.yukari.yerles > S.yukari.yerles && ZN.asagi.yerles > S.asagi.yerles, 'Z-N çalışır ama SIMC kadar çabuk oturmaz')
    // dürüst sonuç: Z-N de iyi çalışır (IAE benzer). Fark, ona ulaşmak için robotu kararlılık sınırında salındırmak gerekmesi.
    assert.ok(ZN.yukari.iae < 1.5 * S.yukari.iae + 0.5 && ZN.asagi.iae < 1.5 * S.asagi.iae + 0.5, 'Z-N ayarı da makul sonuç vermeli')
    assert.ok(taramaP2p[ku] > 0.3 * 25, `Ku'da hız 25 cm/s etrafında en az %30 oynamalı (Z-N için gereken salınım): ${taramaP2p[ku]}`)
  },

  proje_cizgi_bb(sim, kaynak) {
    const r = cizgiKos(kaynak, 'proje_cizgi_bb', { pistAdi: 'zor' })
    LOG('bang-bang (zor pist)', JSON.stringify(ozet(r)))
    assert.ok(r.tur && !r.kaybetti, 'DONUS=200 ile bang-bang zor pisti bitirmeli')
  },

  proje_cizgi_pid(sim, kaynak) {
    const bbKaynak = KAYNAKLAR.proje_cizgi_bb
    const sonuc = {}
    for (const pistAdi of ['kolay', 'zor']) {
      const pid = cizgiKos(kaynak, 'proje_cizgi_pid', { pistAdi })
      const bb = {}
      for (const d of [60, 100, 140, 200]) bb[d] = cizgiKos(ayar(bbKaynak, { DONUS: d }), 'proje_cizgi_bb', { pistAdi })
      sonuc[pistAdi] = { pid, bb }
      LOG(pistAdi, 'PID', JSON.stringify(ozet(pid)))
      for (const d of Object.keys(bb)) LOG(pistAdi, 'BB DONUS', d, JSON.stringify(ozet(bb[d])))
    }
    for (const pistAdi of ['kolay', 'zor']) {
      const { pid, bb } = sonuc[pistAdi]
      assert.ok(pid.tur && !pid.kaybetti, `PID ${pistAdi} pisti bitirmeli`)
      assert.ok(pid.maks < 40, `PID ${pistAdi}: çizgiden en çok 40 mm sapmalı: ${pid.maks.toFixed(0)}`)
      const bitenler = Object.values(bb).filter((r) => r.tur && !r.kaybetti)
      const enIyi = bitenler.sort((a, b) => a.tur - b.tur)[0]
      assert.ok(enIyi, `bang-bang ${pistAdi} pistte en az bir ayarla bitirmeli`)
      LOG(pistAdi, 'en iyi BB tur', enIyi.tur, 'PID tur', pid.tur)
      // PID, bang-bang'in en iyi ayarından en fazla %12 yavaş olabilir (kolay pistte bang-bang önde)
      assert.ok(pid.tur <= enIyi.tur * 1.12, `PID turu (${pid.tur}) bang-bang'in en iyisinden (${enIyi.tur}) %12'den fazla yavaş olmamalı`)
      assert.ok(pid.rms < enIyi.rms, `PID RMS sapması bang-bang'den küçük olmalı: ${pid.rms.toFixed(1)} / ${enIyi.rms.toFixed(1)}`)
      assert.ok(pid.maks < enIyi.maks, `PID en büyük sapması bang-bang'den küçük olmalı: ${pid.maks.toFixed(0)} / ${enIyi.maks.toFixed(0)}`)
    }
    // zorlayıcı pistte PID belirgin biçimde daha hızlı
    const z = sonuc.zor
    const enIyiBB = Math.min(...Object.values(z.bb).filter((r) => r.tur && !r.kaybetti).map((r) => r.tur))
    assert.ok(z.pid.tur < enIyiBB * 0.97, `zor pistte PID en az %3 hızlı olmalı: ${z.pid.tur} / ${enIyiBB}`)
    // bang-bang ayara duyarlı: DONUS ayarlarının en az ikisi zor pistte çizgiyi kaybeder
    const kayiplar = Object.values(z.bb).filter((r) => r.kaybetti || !r.tur).length
    assert.ok(kayiplar >= 2, `zor pistte bang-bang ayarlarının en az ikisi çizgiyi kaybetmeli: ${kayiplar}`)
    // çizgide I terimi işe yaramıyor: Ki=1 zor pistte turu uzatır
    const kiVar = cizgiKos(ayar(kaynak, { KI: '1.0' }), 'proje_cizgi_pid', { pistAdi: 'zor' })
    LOG('PID zor pist, Ki=1', JSON.stringify(ozet(kiVar)))
    assert.ok(!kiVar.tur || kiVar.tur > z.pid.tur * 1.05, 'Ki=1 zor pistte turu en az %5 uzatmalı')
    // motor farkı (sağ %8 zayıf) PID'yi çizgiden koparmaz
    // çizgi dizisinde ham ve büyük Kd işe yaramaz: hata 0,5'lik basamaklarla sıçradığı için türev sahte patlamalar üretir
    const kdBuyuk = cizgiKos(ayar(kaynak, { KD: '30.0', ALFA: '0.0' }), 'proje_cizgi_pid', { pistAdi: 'zor' })
    LOG('PID zor pist, Kd=30 süzgeçsiz', JSON.stringify(ozet(kdBuyuk)))
    assert.ok(!kdBuyuk.tur || kdBuyuk.tur > sonuc.zor.pid.tur * 1.05 || kdBuyuk.titre > 1.5 * sonuc.zor.pid.titre, 'çizgide büyük ham Kd turu uzatmalı ya da titreşimi artırmalı')
    const fark = cizgiKos(kaynak, 'proje_cizgi_pid', { pistAdi: 'zor', gain: { left: 1, right: 0.92 } })
    LOG('PID zor pist, motor farkı', JSON.stringify(ozet(fark)))
    assert.ok(fark.tur && !fark.kaybetti, 'PID motor farkıyla da pisti bitirmeli')
  },
  proje_duvar_pid(sim, kaynak) {
    // hafif kıvrımlı uzun duvar (genlik 3 cm), 1 cm ultrasonik gürültü, sağ motor %10 zayıf; robot ~18 cm'de (duvar bükümü yüzünden) başlar
    const o = { y: 0.45, amp: 0.03, noise: 1, sn: 11, gain: { left: 1, right: 0.9 } }
    const sonra = (r, t0) => { const e = r.e.filter((_, i) => r.t[i] >= t0); return { bant: e.filter((v) => Math.abs(v) <= 2).length / e.length, maks: Math.max(...e.map(Math.abs)), rms: kareKok(e) } }
    const pid = duvarKos(kaynak, 'proje_duvar_pid', o)
    const p = duvarKos(ayar(kaynak, { KI: '0.0', KD: '0.0' }), 'proje_duvar_pid', o)
    const a = sonra(pid, 4000), b = sonra(p, 4000)
    LOG('duvar PID', JSON.stringify(dozet(pid)), '4 sn sonrası', JSON.stringify(a), 'x', pid.rb.state.x.toFixed(2))
    LOG('duvar yalnız P', JSON.stringify(dozet(p)), '4 sn sonrası', JSON.stringify(b))
    // ikinci tohumla tekrar (sonuç tohuma bağlı olmamalı)
    const pid2 = duvarKos(kaynak, 'proje_duvar_pid', { ...o, seed: 11 })
    LOG('duvar PID tohum 11', JSON.stringify(sonra(pid2, 4000)))
    for (const [ad, r, k] of [['tohum 3', pid, a], ['tohum 11', pid2, sonra(pid2, 4000)]]) {
      assert.ok(!r.carpti, `${ad}: duvara çarpmamalı`)
      assert.ok(r.rb.state.x > 2.0, `${ad}: 11 sn'de 2 m'den fazla ilerlemeli: ${r.rb.state.x.toFixed(2)}`)
      assert.ok(k.bant >= 0.98, `${ad}: 4. sn'den sonra +-2 cm içinde kalma oranı >= %98 olmalı: ${k.bant.toFixed(3)}`)
      assert.ok(k.maks <= 2.5, `${ad}: 4. sn'den sonra en büyük sapma <= 2,5 cm olmalı: ${k.maks.toFixed(2)}`)
    }
    assert.ok(a.rms < b.rms, `4. sn'den sonra PID'in RMS sapması yalnız P'den küçük olmalı: ${a.rms.toFixed(2)} / ${b.rms.toFixed(2)}`)
  },
}

import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { Arena, STD_MOTORS } from '../../../tools/sim/robot.mjs'

// Standart 5'li çizgi dizisi: A0 en sol (y > 0 sol taraf), 2,4 cm aralık, aks hizasından 7 cm önde.
const dizi = () => [0.048, 0.024, 0, -0.024, -0.048].map((y, pin) => ({ pin, kind: 'analog', x: 0.07, y }))

// Verilen sketch kaynağıyla yeni bir benzetim + robot kurar.
function kur(kaynak, ad, arena, pose, ek = {}) {
  const sim = createSim(kaynak, { name: ad })
  const r = sim.rover({ arena, pose, motors: STD_MOTORS, lineSensors: dizi(), ...ek })
  return { sim, r }
}

// Seri çıktıdan son tam satır
const sonSatir = (sim) => {
  const l = sim.serial.split(/\r?\n/).filter((x) => x.trim().length)
  return l.length > 1 ? l.at(-2) : (l.at(-1) ?? '')
}
const tamSatirlar = (sim) => sim.serial.split(/\r?\n/).slice(0, -1).filter((x) => x.trim().length)

// Robotu 1 ms adımlarla ilerletir; hiçbir sensörün çizgiyi görmediği süreyi (ms) ölçer.
// bitis(t) true dönerse durur.
function izle(sim, r, limitMs, bitis, adim = 2) {
  let kayip = 0, enUzun = 0, simdiki = 0, t = 0, a2Gecis = 0, a2Onceki = false
  const kayipSn = []                    // her saniye sonunda toplam kayıp (ms)
  const sens = r.params.lineSensors
  for (; t < limitMs; t += adim) {
    sim.run(adim)
    if ((t + adim) % 1000 === 0) kayipSn.push(kayip)
    const gorulen = sens.some((s) => s.on)
    if (!gorulen) { kayip += adim; simdiki += adim; enUzun = Math.max(enUzun, simdiki) } else simdiki = 0
    if (sens[2].on !== a2Onceki) { a2Gecis++; a2Onceki = sens[2].on }
    if (bitis && bitis(t)) return { bitti: true, sure: t, kayip, enUzun, a2Gecis, kayipSn }
  }
  return { bitti: false, sure: t, kayip, enUzun, a2Gecis, kayipSn }
}

// Oval (stadyum) pist: (cx, cy) merkez, yarı düz uzunluk hl, yarıçap R. Alt kenarın ortasından başlar, saat yönünün tersine.
function oval(cx, cy, hl, R, n = 24) {
  const p = [[cx, cy - R], [cx + hl, cy - R]]
  for (let i = 1; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI * i) / n; p.push([cx + hl + R * Math.cos(a), cy + R * Math.sin(a)]) }
  p.push([cx - hl, cy + R])
  for (let i = 1; i <= n; i++) { const a = Math.PI / 2 + (Math.PI * i) / n; p.push([cx - hl + R * Math.cos(a), cy + R * Math.sin(a)]) }
  p.push([cx, cy - R])
  return p
}

// Ovalde bir tam tur: merkez etrafında biriken açı 2π olunca biter.
function turAt(sim, r, limitMs) {
  let aci = 0, onceki = Math.atan2(r.state.y - 1, r.state.x - 1)
  const s = izle(sim, r, limitMs, (t) => {
    const a = Math.atan2(r.state.y - 1, r.state.x - 1)
    let d = a - onceki
    if (d < -Math.PI) d += 2 * Math.PI
    if (d > Math.PI) d -= 2 * Math.PI
    aci += d; onceki = a
    return aci > 2 * Math.PI
  })
  return { ...s, aci }
}

const ovalArena = () => Arena.box(2, 2).line(oval(1, 1, 0.25, 0.3))
const ovalBasla = { x: 1, y: 0.7, theta: 0 }

// Düz çizgi parçalarından oluşan bir parkurda robotu hedefe kadar sürer.
// hedef: [x, y], yaricap: bu kadar yaklaşınca bitti sayılır. Hedefsizse limit süresince koşar.
function parkur(kaynak, ad, cizgiler, pose, limitMs, hedef, yaricap = 0.12) {
  const arena = Arena.box(2.4, 2.4)
  for (const c of cizgiler) arena.line(c)
  const { sim, r } = kur(kaynak, ad, arena, pose)
  const o = izle(sim, r, limitMs, hedef ? () => Math.hypot(r.state.x - hedef[0], r.state.y - hedef[1]) < yaricap : null)
  return { sim, r, o }
}
const desen = (r) => r.params.lineSensors.map((s) => (s.on ? '1' : '0')).join('')
const adlar = (sim) => tamSatirlar(sim).filter((x) => /^[A-Z_]+$/.test(x))

// Proje pisti (3 x 2,2 m): düz, sola kavis, dik viraj (sağa), düz, boşluk, düz, bitiş bandı.
function projePisti(bosluk = 0.09) {
  const nokta = [[0.1, 1.0], [0.9, 1.0]]
  for (let i = 1; i <= 12; i++) { const a = -Math.PI / 2 + ((Math.PI / 2) * i) / 12; nokta.push([0.9 + 0.4 * Math.cos(a), 1.4 + 0.4 * Math.sin(a)]) }
  nokta.push([1.3, 1.7], [1.9, 1.7])
  return Arena.box(3, 2.2).line(nokta).line([[1.9 + bosluk, 1.7], [2.6, 1.7]]).line([[2.6, 1.55], [2.6, 1.85]])
}

// Projeyi koşturur: 1800 ms kalibrasyon, sonra pist. Gerçek (sensörlerden) süre/kayıp ölçülür.
function projeKos(kaynak, ad, { bosluk = 0.09, pose = { x: 0.3, y: 1, theta: 0 }, limitMs = 30000 } = {}) {
  const { sim, r } = kur(kaynak, ad, projePisti(bosluk), pose)
  izle(sim, r, 1800)                                            // kalibrasyon penceresi
  const o = izle(sim, r, limitMs, () => r.params.lineSensors.every((s) => s.on) || /BITTI|HATASI|KAYBOLDU/.test(sim.serial))
  sim.run(600)                                                  // seri çıktının akması için
  return { sim, r, o }
}

export default {
  // 86: ham okuma — çizgi altındaki sensör ≈ 860, diğerleri ≈ 164
  sensor_ham(sim) {
    const arena = Arena.box(2, 2).line([[0.2, 1], [1.8, 1]])
    const r = sim.rover({ arena, pose: { x: 1, y: 1, theta: 0 }, motors: STD_MOTORS, lineSensors: dizi() })
    sim.run(700)
    let v = sonSatir(sim).trim().split(/\s+/).map(Number)
    assert.equal(v.length, 5, `5 değer bekleniyordu: ${JSON.stringify(sonSatir(sim))}`)
    assert.ok(v[2] >= 850 && v[2] <= 870, `orta sensör çizgide ≈ 860 okumalı: ${v}`)
    for (const i of [0, 1, 3, 4]) assert.ok(v[i] >= 155 && v[i] <= 175, `A${i} zeminde ≈ 164 okumalı: ${v}`)
    // robotu 2,4 cm kaydır: çizgi artık A1'in altında
    r.state.y = 0.976
    sim.run(700)
    v = sonSatir(sim).trim().split(/\s+/).map(Number)
    assert.ok(v[1] >= 850, `A1 çizgide olmalı: ${v}`)
    assert.ok(v[2] <= 175, `A2 zemine geçmeli: ${v}`)
  },

  // 86: dijital desen ve konum işareti (negatif = çizgi solda)
  sensor_desen(sim, kaynak) {
    const arena = Arena.box(2, 2).line([[0.2, 1], [1.8, 1]])
    const r = sim.rover({ arena, pose: { x: 1, y: 1, theta: 0 }, motors: STD_MOTORS, lineSensors: dizi() })
    const oku = (y) => { r.state.y = y; sim.run(600); return sonSatir(sim).trim() }
    assert.equal(oku(1), '00100 konum=0')
    assert.equal(oku(1 - 0.024), '01000 konum=-1', 'robot çizginin altında kalınca çizgi solda görünür')
    assert.equal(oku(1 - 0.048), '10000 konum=-2')
    assert.equal(oku(1 + 0.024), '00010 konum=1')
    assert.equal(oku(1 + 0.048), '00001 konum=2')
    assert.equal(oku(1.3), '00000 cizgi yok')
    // kör bölge: çizgi merkezi iki sensörün ortasında
    assert.equal(oku(1 - 0.012), '00000 cizgi yok', 'iki sensörün tam ortasında çizgi görünmemeli')
    // çizgi 3 cm olsaydı iki sensör birden görürdü
    arena.lineWidth = 0.03
    assert.equal(oku(1 - 0.012), '01100 birden cok sensor')
    arena.lineWidth = 0.02
    // eşik 100: zemin bile çizgi sayılır
    const k2 = kur(kaynak.replace('ESIK = 512', 'ESIK = 100'), 'desen_100', Arena.box(2, 2).line([[0.2, 1], [1.8, 1]]), { x: 1, y: 1, theta: 0 })
    k2.sim.run(600)
    assert.match(sonSatir(k2.sim), /^11111 birden cok sensor/, 'eşik 100 iken beş sensör de 1 vermeli')
    // eşik 900: çizgi bile görünmez
    const k3 = kur(kaynak.replace('ESIK = 512', 'ESIK = 900'), 'desen_900', Arena.box(2, 2).line([[0.2, 1], [1.8, 1]]), { x: 1, y: 1, theta: 0 })
    k3.sim.run(600)
    assert.match(sonSatir(k3.sim), /^00000 cizgi yok/, 'eşik 900 iken çizgi görünmemeli')
  },

  // 87: sallanarak min/max ölç, eşik = (min+max)/2
  kalib_salla(sim, kaynak) {
    const cizgi = () => Arena.box(2, 2).line([[0.2, 1], [1.8, 1]])
    const r = sim.rover({ arena: cizgi(), pose: { x: 1, y: 1, theta: 0 }, motors: STD_MOTORS, lineSensors: dizi() })
    sim.run(2500)
    const l = tamSatirlar(sim)
    for (let i = 0; i < 5; i++) {
      const m = l.find((x) => x.startsWith(`A${i} `))?.match(/min=(\d+) max=(\d+) esik=(\d+)/)
      assert.ok(m, `A${i} satırı yok: ${JSON.stringify(sim.serial)}`)
      const [mn, mx, es] = m.slice(1).map(Number)
      assert.ok(mn >= 155 && mn <= 175, `A${i} min ≈ 164 olmalı: ${mn}`)
      assert.ok(mx >= 850 && mx <= 870, `A${i} max ≈ 860 olmalı: ${mx}`)
      assert.equal(es, Math.floor((mn + mx) / 2), `A${i} eşik (min+max)/2 olmalı`)
    }
    // sallanma bitince robot yaklaşık başladığı yerde ve yönde durur
    assert.ok(Math.hypot(r.state.x - 1, r.state.y - 1) < 0.03, `robot yerinde kalmalı: ${r.state.x}, ${r.state.y}`)
    assert.ok(Math.abs(r.state.theta) < 0.1, `robot başlangıç yönüne dönmeli: ${r.state.theta}`)
    // kalibrasyondan sonra desen doğru
    sim.run(400)
    assert.equal(sonSatir(sim).trim(), '00100')
    r.state.y = 1 - 0.024
    sim.run(600)
    assert.equal(sonSatir(sim).trim(), '01000')

    // Dene: ölü bölgenin altındaki PWM robotu kıpırdatmaz; eşik 860 olur ve çizgi görünmez
    const k = kur(kaynak.replace('SALLA_PWM = 120', 'SALLA_PWM = 40'), 'salla_40', cizgi(), { x: 1, y: 1, theta: 0 })
    k.sim.run(2500)
    assert.ok(Math.abs(k.r.state.theta) < 0.05, 'PWM 40 ile robot dönmemeli')
    assert.match(k.sim.serial, /A2 min=860 max=860 esik=860/)
    assert.match(sonSatir(k.sim), /^00000$/, 'eşik 860 iken A2 çizgiyi göremez')

    // Dene: sallanma erken biterse A0/A1 çizgiyi hiç görmez
    const e = kur(kaynak.replace('KALIBRASYON_MS = 1800', 'KALIBRASYON_MS = 300'), 'salla_300', cizgi(), { x: 1, y: 1, theta: 0 })
    e.sim.run(2500)
    assert.match(e.sim.serial, /A0 min=163 max=163 esik=163/)
    assert.match(e.sim.serial, /A1 min=163 max=163 esik=163/)
    assert.ok(e.r.state.theta > 0.5, `robot dönük kalmalı: ${e.r.state.theta}`)
  },

  // 87: ortam ışığı yüksek (zemin 2,9 V, çizgi 4,6 V): sabit eşik yanılır, kalibreli eşik doğru
  kalib_isik(sim) {
    // robot yok: sensörleri doğrudan süreriz
    for (let i = 0; i < 5; i++) sim.analog(i, 2.9)
    sim.run(900)                                    // zemin
    for (let i = 0; i < 5; i++) sim.analog(i, 4.6)
    sim.run(1200)                                   // her sensör çizgiyi de görür (2000 ms ölçüm penceresi dolar)
    // çizgi A2'nin altında kalır, öbürleri zemin: aydınlık ortam
    for (const i of [0, 1, 3, 4]) sim.analog(i, 2.9)
    sim.run(400)
    let s = sonSatir(sim).trim()
    assert.equal(s, 'sabit=11111 kalibre=00100', `parlak ortamda sabit eşik yanılmalı: ${JSON.stringify(s)}`)
    // çizgi A1'e geçince kalibreli eşik onu izler
    sim.analog(2, 2.9); sim.analog(1, 4.6)
    sim.run(400)
    s = sonSatir(sim).trim()
    assert.equal(s, 'sabit=11111 kalibre=01000')
  },

  // 88: tek sensör — zigzag: orta sensör yüzlerce kez değişir, tur 30 sn'de bitmez
  bangbang_tek(sim) {
    const r = sim.rover({ arena: ovalArena(), pose: ovalBasla, motors: STD_MOTORS, lineSensors: dizi() })
    const o = turAt(sim, r, 30000)
    assert.ok(!o.bitti, `tek sensörle tur 30 sn içinde bitmemeliydi (${o.sure} ms)`)
    assert.ok(o.a2Gecis > 300, `zigzag: orta sensör çok sık değişmeli, ${o.a2Gecis} geçiş`)
    assert.ok(o.kayip > 15000, `çizgiyi yarıdan fazla görmemeliydi: ${o.kayip} ms`)
  },

  // 88: beş sensör + son yön hafızası — turu bitirir; hafızasız sürümde kayıp süresi çok daha uzun
  bangbang_dizi(sim, kaynak) {
    const r = sim.rover({ arena: ovalArena(), pose: ovalBasla, motors: STD_MOTORS, lineSensors: dizi() })
    const o = turAt(sim, r, 30000)
    assert.ok(o.bitti, `hafızalı program 30 sn içinde turu bitirmeliydi (açı ${o.aci.toFixed(2)})`)
    assert.ok(o.sure > 14000 && o.sure < 20000, `tur süresi ≈ 17 sn bekleniyordu: ${o.sure} ms`)
    assert.ok(o.kayip > 2500 && o.kayip < 5000, `toplam kayıp ≈ 3,9 sn bekleniyordu: ${o.kayip} ms`)
    assert.ok(o.enUzun < 300, `en uzun kesinti < 0,3 sn olmalı: ${o.enUzun} ms`)
    assert.ok(o.a2Gecis < 100, `zigzag tek sensörden çok az olmalı: ${o.a2Gecis}`)
    assert.ok(r.state.distanceM > 2.7 && r.state.distanceM < 3.2, `tur ≈ 2,9 m: ${r.state.distanceM}`)
    // program kendi ölçtüğü kayıp süresini yazar; gerçek ölçümle uyuşmalı
    const satirlar = tamSatirlar(sim).filter((x) => /^t=\d+ kayip=\d+$/.test(x))
    assert.ok(satirlar.length >= 10, `her saniye bir satır bekleniyordu: ${satirlar.length}`)
    const [, sn, yaz] = satirlar.at(-1).match(/^t=(\d+) kayip=(\d+)$/)
    const gercek = o.kayipSn[Number(sn) - 1]
    assert.ok(Math.abs(Number(yaz) - gercek) < 150, `sketch ${yaz} ms dedi, gerçek ${gercek} ms (t=${sn})`)

    // hafızasız: çizgi yoksa düz git — tur biter ama çizgi çok uzun süre görülmez
    const k = kur(kaynak.replace('} else if (orta) {\n    sonYon = 0;\n  }', '} else {\n    sonYon = 0;\n  }'), 'dizi_hafizasiz', ovalArena(), ovalBasla)
    const m = turAt(k.sim, k.r, 30000)
    assert.ok(m.bitti, 'hafızasız sürüm de turu bitirmeli')
    assert.ok(m.kayip > 9000, `hafızasız kayıp ≈ 12 sn bekleniyordu: ${m.kayip} ms`)
    assert.ok(m.kayip > 2.5 * o.kayip, `hafıza kayıp süresini belirgin azaltmalı: ${o.kayip} vs ${m.kayip}`)
    assert.ok(m.enUzun > 800, `hafızasızda uzun kesintiler olmalı: ${m.enUzun} ms`)
  },

  // 88: iki eşik, gürültülü sinyalde tek geçişte kalır
  histerezis_esik(sim) {
    let tohum = 12345
    const rnd = () => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return tohum / 4294967296 }
    const adimlar = 1200
    const sur = (v) => { sim.analog(2, v + (rnd() - 0.5) * 0.6); sim.run(1) }   // ±0,3 V gürültü
    sim.run(50)
    for (let i = 0; i <= adimlar; i++) sur(1 + (3 * i) / adimlar)               // 1 V -> 4 V
    for (let i = 0; i <= adimlar; i++) sur(4 - (3 * i) / adimlar)               // 4 V -> 1 V
    const t0 = 60
    const tek = sim.pinEdges(13, t0).length
    const hist = sim.pinEdges(12, t0).length
    assert.ok(tek >= 20, `tek eşikli LED titremeliydi: ${tek} geçiş`)
    assert.equal(hist, 2, `iki eşikli LED yalnız bir kez açılıp bir kez kapanmalı: ${hist} geçiş`)
    assert.equal(sim.read(12), false)
  },

  // 89: boşluk (düz git) ve çizgi kaybı (son yöne ara, sonunda dur)
  kayip_toparla(sim, kaynak) {
    // desen tablosu: sola L, sağa L
    const sol = kur(kaynak, 'kayip_toparla', Arena.box(2.4, 2.4).line([[0.3, 0.5], [1.0, 0.5], [1.0, 1.3]]), { x: 0.93, y: 0.5, theta: 0 })
    sol.sim.run(3)
    assert.equal(desen(sol.r), '11100', 'sola dik virajda sol ve orta sensörler çizgiyi görmeli')
    const sag = kur(kaynak, 'kayip_toparla', Arena.box(2.4, 2.4).line([[0.3, 1.3], [1.0, 1.3], [1.0, 0.5]]), { x: 0.93, y: 1.3, theta: 0 })
    sag.sim.run(3)
    assert.equal(desen(sag.r), '00111', 'sağa dik virajda orta ve sağ sensörler çizgiyi görmeli')

    // sola dik viraj: çizgiyi aşınca ARAMA devreye girer, robot çizgiyi bulur ve ucuna varır
    const L = parkur(kaynak, 'kayip_toparla', [[[0.3, 0.5], [1.0, 0.5], [1.0, 1.3]]], { x: 0.3, y: 0.5, theta: 0 }, 12000, [1.0, 1.3])
    assert.ok(L.o.bitti, `dik virajı geçip çizginin ucuna varmalı; robot (${L.r.state.x.toFixed(2)}, ${L.r.state.y.toFixed(2)})`)
    assert.ok(adlar(L.sim).includes('ARAMA'), `köşede ARAMA yazılmalı: ${adlar(L.sim)}`)
    assert.ok(L.o.enUzun < 500, `köşede kesinti < 0,5 sn olmalı: ${L.o.enUzun} ms`)

    // sola ve sağa iki dik viraj (Z)
    const Z = parkur(kaynak, 'kayip_toparla', [[[0.3, 0.5], [1.0, 0.5], [1.0, 1.0], [1.7, 1.0], [1.7, 1.6]]], { x: 0.3, y: 0.5, theta: 0 }, 16000, [1.7, 1.6])
    assert.ok(Z.o.bitti, 'Z parkurunun sonuna varmalı')

    // 10 cm boşluk: düz gider, ARAMA'ya hiç geçmez
    const gap = (g) => [[[0.3, 1], [0.9, 1]], [[0.9 + g, 1], [1.9, 1]]]
    const G = parkur(kaynak, 'kayip_toparla', gap(0.1), { x: 0.3, y: 1, theta: 0 }, 9000, [1.9, 1])
    assert.ok(G.o.bitti, 'boşluğun ardındaki çizginin ucuna varmalı')
    assert.deepEqual(adlar(G.sim), ['BOSLUK', 'IZLE'], `boşlukta yalnız BOSLUK -> IZLE bekleniyordu: ${adlar(G.sim)}`)
    assert.ok(G.o.enUzun > 300 && G.o.enUzun < 700, `10 cm boşluk ≈ 0,4 sn sürmeli: ${G.o.enUzun} ms`)

    // BOSLUK_MS çok kısaysa ARAMA'ya geçer; yine de çizgiyi bulur ama kayıp artar
    const G3 = parkur(kaynak.replace('BOSLUK_MS = 900', 'BOSLUK_MS = 300'), 'kayip_300', gap(0.1), { x: 0.3, y: 1, theta: 0 }, 9000, [1.9, 1])
    assert.ok(adlar(G3.sim).includes('ARAMA'), 'BOSLUK_MS = 300 iken ARAMA yazılmalı')
    assert.ok(G3.o.kayip > G.o.kayip + 150, `kayıp artmalı: ${G.o.kayip} -> ${G3.o.kayip}`)

    // 25 cm boşluk ve çizginin bittiği uç: robot arar, bulamayınca DUR
    for (const [ad, cizgi] of [['gap25', gap(0.25)], ['uc', [[[0.3, 1], [1.0, 1]]]]]) {
      const D = parkur(kaynak, 'kayip_' + ad, cizgi, { x: 0.3, y: 1, theta: 0 }, 9000, null)
      assert.deepEqual(adlar(D.sim), ['BOSLUK', 'ARAMA', 'DUR'], `${ad}: ${adlar(D.sim)}`)
      assert.ok(Math.abs(D.r.state.wL) < 0.1 && Math.abs(D.r.state.wR) < 0.1, `${ad}: robot durmalı`)
    }
  },

  // 89: kavşak kararı: T'de sola/sağa, + kavşakta düz
  kavsak_karari(sim, kaynak) {
    const T = [[[1.1, 0.3], [1.1, 1.2]], [[0.6, 1.2], [1.6, 1.2]]]
    const baslat = { x: 1.1, y: 0.3, theta: Math.PI / 2 }
    // desen: kavşakta beş sensör birden çizgide
    const k = kur(kaynak, 'kavsak_karari', Arena.box(2.4, 2.4).line(T[0]).line(T[1]), { x: 1.1, y: 1.13, theta: Math.PI / 2 })
    k.sim.run(3)
    assert.equal(desen(k.r), '11111', 'T kavşakta beş sensör de çizgide olmalı')

    const sol = parkur(kaynak, 'kavsak_karari', T, baslat, 10000, [0.6, 1.2])
    assert.ok(sol.o.bitti, `T'de sola: çubuğun sol ucuna varmalı; robot (${sol.r.state.x.toFixed(2)}, ${sol.r.state.y.toFixed(2)})`)
    assert.deepEqual(adlar(sol.sim).slice(0, 3), ['KAVSAK_ILERI', 'KAVSAK_DON', 'IZLE'], `${adlar(sol.sim)}`)

    const sag = parkur(kaynak.replace('KAVSAK_KARARI = -1;', 'KAVSAK_KARARI = 1;'), 'kavsak_sag', T, baslat, 10000, [1.6, 1.2])
    assert.ok(sag.o.bitti, `T'de sağa: çubuğun sağ ucuna varmalı; robot (${sag.r.state.x.toFixed(2)}, ${sag.r.state.y.toFixed(2)})`)

    // + kavşak: karar 0 -> düz geçer, üst uca varır; dönüş durumuna hiç girmez
    const art = [[[1.1, 0.3], [1.1, 2.0]], [[0.6, 1.2], [1.6, 1.2]]]
    const duz = parkur(kaynak.replace('KAVSAK_KARARI = -1;', 'KAVSAK_KARARI = 0;'), 'kavsak_duz', art, baslat, 10000, [1.1, 1.9])
    assert.ok(duz.o.bitti, `+ kavşakta düz: üst uca varmalı; robot (${duz.r.state.x.toFixed(2)}, ${duz.r.state.y.toFixed(2)})`)
    assert.deepEqual(adlar(duz.sim), ['KAVSAK_ILERI', 'KAVSAK_DUZ', 'IZLE'], `${adlar(duz.sim)}`)

    // sola dik viraj ve boşluk bu sketch'te de çalışır
    const Z = parkur(kaynak, 'kavsak_karari', [[[0.3, 0.5], [1.0, 0.5], [1.0, 1.0], [1.7, 1.0], [1.7, 1.6]]], { x: 0.3, y: 0.5, theta: 0 }, 16000, [1.7, 1.6])
    assert.ok(Z.o.bitti, 'Z parkurunun sonuna varmalı')

    // KAVSAK_ILERI_MS = 0: aks kavşağa varmadan döner, robot çubuğa değil sapa geri döner
    const e = parkur(kaynak.replace('KAVSAK_ILERI_MS = 350', 'KAVSAK_ILERI_MS = 0'), 'kavsak_ileri0', T, baslat, 10000, [0.6, 1.2])
    assert.ok(!e.o.bitti, 'ileri gitmeden dönen robot çubuğun sol ucuna varmamalıydı')
    assert.ok(e.r.state.y < 0.6, `robot sapa geri dönmeli: y=${e.r.state.y.toFixed(2)}`)
  },

  // 90: proje — kalibre et, pisti bitir, süre ve kayıp süresini raporla
  cizgi_proje(sim, kaynak) {
    assert.ok(!/delay\s*\(/.test(kaynak), 'proje delay kullanmamalı')
    const { sim: s, r, o } = projeKos(kaynak, 'cizgi_proje')
    const esikler = s.serial.match(/esikler: (\d+) (\d+) (\d+) (\d+) (\d+)/)
    assert.ok(esikler, `eşikler yazılmalı: ${JSON.stringify(s.serial)}`)
    for (const e of esikler.slice(1).map(Number)) assert.ok(e >= 505 && e <= 515, `eşik ≈ 511 olmalı: ${e}`)
    const b = s.serial.match(/BITTI sure=(\d+) kayip=(\d+) enuzun=(\d+)/)
    assert.ok(b, `rapor satırı yazılmalı: ${JSON.stringify(s.serial)}`)
    const [sure, kayip, enuzun] = b.slice(1).map(Number)
    assert.ok(o.bitti, 'pisti bitirmeli')
    // robot bitiş bandında durur
    assert.ok(r.state.x > 2.4 && r.state.x < 2.65 && Math.abs(r.state.y - 1.7) < 0.06, `bitiş bandında durmalı: (${r.state.x.toFixed(2)}, ${r.state.y.toFixed(2)})`)
    assert.ok(Math.abs(r.state.wL) < 0.1 && Math.abs(r.state.wR) < 0.1, 'bitişte tekerlekler durmalı')
    // sketch'in raporu gerçek ölçümle uyuşmalı (sensörlerden hesaplanan kayıp süresi)
    assert.ok(Math.abs(sure - o.sure) < 150, `süre: sketch ${sure} ms, gerçek ${o.sure} ms`)
    assert.ok(Math.abs(kayip - o.kayip) < 200, `kayıp: sketch ${kayip} ms, gerçek ${o.kayip} ms`)
    assert.ok(Math.abs(enuzun - o.enUzun) < 100, `en uzun kesinti: sketch ${enuzun} ms, gerçek ${o.enUzun} ms`)
    // sayısal beklentiler (HIZ = 170): ≈ 13,3 sn, ≈ 2,7 sn kayıp, en uzun kesinti boşlukta ≈ 0,4 sn
    assert.ok(sure > 11000 && sure < 16000, `tur süresi ≈ 13 sn bekleniyordu: ${sure}`)
    assert.ok(kayip > 1500 && kayip < 4000, `kayıp ≈ 2,7 sn bekleniyordu: ${kayip}`)
    assert.ok(enuzun > 250 && enuzun < 600, `boşluk ≈ 0,4 sn: ${enuzun}`)

    // 15 cm boşluk da geçilir (en uzun kesinti BOSLUK_MS = 900 ms'den kısa)
    const g = projeKos(kaynak, 'proje_gap15', { bosluk: 0.15 })
    assert.ok(/BITTI/.test(g.sim.serial), `15 cm boşlukta da bitirmeli: ${JSON.stringify(g.sim.serial)}`)
    assert.ok(g.o.enUzun > 450 && g.o.enUzun < 900, `15 cm boşluk ≈ 0,6 sn: ${g.o.enUzun}`)

    // hız tablosu: yavaş robot daha geç bitirir ve daha çok kayıp verir; 255'te dik virajda çizgiyi bulamaz
    const hizli = (h) => projeKos(kaynak.replace('HIZ = 170;', `HIZ = ${h};`), `proje_${h}`)
    const sonuc = {}
    for (const h of [140, 200, 230]) {
      const k = hizli(h)
      const m = k.sim.serial.match(/BITTI sure=(\d+) kayip=(\d+)/)
      assert.ok(m, `HIZ ${h} pisti bitirmeli: ${JSON.stringify(k.sim.serial)}`)
      sonuc[h] = { sure: Number(m[1]), kayip: Number(m[2]) }
    }
    assert.ok(sonuc[140].sure > sure && sure > sonuc[200].sure && sonuc[200].sure > sonuc[230].sure, `hız arttıkça süre kısalmalı: ${JSON.stringify(sonuc)}`)
    assert.ok(sonuc[140].kayip > kayip && kayip > sonuc[200].kayip && sonuc[200].kayip > sonuc[230].kayip, `kayıp da azalmalı: ${JSON.stringify(sonuc)}`)
    assert.ok(sonuc[140].sure > 15500 && sonuc[140].sure < 19500, `HIZ 140 ≈ 17,6 sn: ${sonuc[140].sure}`)
    assert.ok(sonuc[200].sure > 9500 && sonuc[200].sure < 12000, `HIZ 200 ≈ 10,8 sn: ${sonuc[200].sure}`)
    assert.ok(sonuc[230].sure > 7500 && sonuc[230].sure < 9800, `HIZ 230 ≈ 8,6 sn: ${sonuc[230].sure}`)
    const cok = hizli(255)
    assert.ok(!/BITTI/.test(cok.sim.serial) && /CIZGI KAYBOLDU/.test(cok.sim.serial), `HIZ 255 pisti bitirememeli: ${JSON.stringify(cok.sim.serial)}`)

    // çizgiden uzakta başlarsa kalibrasyon başarısız: robot hareket etmez
    const u = projeKos(kaynak, 'proje_uzak', { pose: { x: 0.3, y: 1.15, theta: 0 }, limitMs: 3000 })
    assert.ok(/KALIBRASYON HATASI/.test(u.sim.serial) && !/BITTI/.test(u.sim.serial), `uzakta kalibrasyon hatası bekleniyordu: ${JSON.stringify(u.sim.serial)}`)
    assert.ok(Math.abs(u.r.state.x - 0.3) < 0.03 && Math.abs(u.r.state.wL) < 0.1, `robot ilerlememeli: x=${u.r.state.x.toFixed(2)}`)
  },
}

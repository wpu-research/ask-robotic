import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'
import { Arena, STD_MOTORS, STD_ULTRASONIC } from '../../../tools/sim/robot.mjs'

const DERECE = 180 / Math.PI
const dar = (aci) => ((aci + 540) % 360) - 180          // -180..180 aralığına getir

// Koşul doğru olana ya da süre bitene kadar 5 ms'lik adımlarla ilerler; koşul sağlandı mı döndürür.
function kadar(sim, kosul, enFazlaMs) {
  const bitis = sim.nowMs() + enFazlaMs
  while (sim.nowMs() < bitis) {
    if (kosul()) return true
    sim.run(5)
  }
  return kosul()
}

// ms boyunca ilerler; robotun duvara değdiği (collided) kenar sayısını ve en büyük x'i döndürür.
function izle(sim, robot, ms) {
  let carpma = 0
  let onceki = robot.state.collided
  const bitis = sim.nowMs() + ms
  while (sim.nowMs() < bitis) {
    sim.run(5)
    if (robot.state.collided && !onceki) carpma++
    onceki = robot.state.collided
  }
  return carpma
}

const say = (s, desen) => (s.match(desen) || []).length
const derece = (robot) => robot.state.theta * DERECE

// Doğu duvarına (x = 2) belli bir açıyla yaklaşan robot; ilk tampon mesajına kadar koşar.
function tamponDeneyi(kaynak, theta, mesaj) {
  const sim = createSim(kaynak, { name: 'tampon_deney' })
  const r = sim.rover({ arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta }, motors: STD_MOTORS, bumpers: { left: 2, right: 3 } })
  assert.ok(kadar(sim, () => mesaj.test(sim.serial), 8000), `tampon mesajı gelmedi: ${JSON.stringify(sim.serial)}`)
  const bump = { x: r.state.x, th: derece(r), serial: sim.serial }
  let carpti = r.state.collided
  const bitis = sim.nowMs() + 1500
  while (sim.nowMs() < bitis) { sim.run(5); carpti ||= r.state.collided }
  return { bump, x: r.state.x, th: derece(r), carpti, serial: sim.serial }
}

// Mesafe yaz: robot x = 1,5 m'de duvara bakıyor (sensör duvardan 44 cm uzakta).
function ortStd(a) {
  const m = a.reduce((x, y) => x + y, 0) / a.length
  return { m, sd: Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length) }
}

// Yalnız duvara doğru sürüp ilk DUR mesajında duran robotun sensör-duvar mesafesi (cm) ve ardından dönüşü.
function durDeneyi(kaynak, noiseCm, seed) {
  const sim = createSim(kaynak, { name: 'dur_deney' })
  const r = sim.rover({ arena: Arena.box(2, 2), pose: { x: 0.3, y: 1, theta: 0 }, motors: STD_MOTORS,
    ultrasonic: STD_ULTRASONIC, noiseCm, seed })
  assert.ok(kadar(sim, () => /DUR \d+\r?\n/.test(sim.serial), 15000), `robot hiç durmadı: ${JSON.stringify(sim.serial)}`)
  const xDur = r.state.x
  const sensorCm = (2 - xDur - 0.06) * 100             // sensör robotun 6 cm önünde
  const okunan = Number(/DUR (\d+)/.exec(sim.serial)[1])
  let carpti = false
  const bitis = sim.nowMs() + 1500
  while (sim.nowMs() < bitis) { sim.run(5); carpti ||= r.state.collided }
  return { sensorCm, okunan, carpti, th: derece(r), x: r.state.x, kayma: (r.state.x - xDur) * 100 }
}


// Seri çıktıdaki "DURUM X" satırlarından durum geçişlerini (ad, zaman, yön, konum) toplar.
const IZIN = { ILERI: ['DUR', 'GERI'], DUR: ['TARA'], TARA: ['DON', 'GERI'], DON: ['ILERI'], GERI: ['DON'] }
function durumKos(sim, robot, ms) {
  const gecisler = []
  let gorulen = 0
  let carpma = 0
  let onceki = robot.state.collided
  const bitis = sim.nowMs() + ms
  while (sim.nowMs() < bitis) {
    sim.run(5)
    if (robot.state.collided && !onceki) carpma++
    onceki = robot.state.collided
    const hepsi = [...sim.serial.matchAll(/DURUM (ILERI|DUR|TARA|DON|GERI)\r?\n/g)]
    while (gorulen < hepsi.length) {
      gecisler.push({ ad: hepsi[gorulen][1], t: sim.nowMs(), th: derece(robot), x: robot.state.x, y: robot.state.y })
      gorulen++
    }
  }
  return { gecisler, carpma }
}
function gecisleriDogrula(gecisler) {
  for (let i = 1; i < gecisler.length; i++) {
    const a = gecisler[i - 1].ad
    const b = gecisler[i].ad
    assert.ok(IZIN[a].includes(b), `${a} -> ${b} geçişi durum makinesinde yok (geçişler: ${gecisler.map((g) => g.ad).join(' ')})`)
  }
}

// Proje arenası: 2 x 2 m kutu, ortada 40x40 cm blok, iki duvar parçası.
function projeArenasi() {
  return Arena.box(2, 2)
    .wall(0.6, 0.9, 1.0, 0.9).wall(1.0, 0.9, 1.0, 1.3).wall(1.0, 1.3, 0.6, 1.3).wall(0.6, 1.3, 0.6, 0.9)   // blok
    .wall(1.4, 0.3, 1.4, 0.9)                                                                              // sağda duvar
    .wall(0.3, 1.6, 0.9, 1.6)                                                                              // üstte duvar
}
function projeKos(kaynak, pose, seed) {
  const sim = createSim(kaynak, { name: 'proje_kos' })
  const r = sim.rover({ arena: projeArenasi(), pose, motors: STD_MOTORS, ultrasonic: STD_ULTRASONIC,
    bumpers: { left: 2, right: 3 }, noiseCm: 2, seed })
  return { sim, r }
}

export default {
  tampon_oku(sim) {
    sim.run(100)
    assert.equal(sim.serial, '', 'basmadan çıktı olmamalıydı')
    sim.drive(2, false)                 // sol tampon basıldı
    sim.run(50)
    assert.ok(/Sol tampon: BASILDI\r?\n/.test(sim.serial), `sol basış yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.equal(say(sim.serial, /Sag/g), 0, 'sağ tampon basılmadı, yazılmamalıydı')
    sim.drive(3, false)                 // ikisi birden (cepheden çarpma)
    sim.run(50)
    assert.ok(/Sag tampon: BASILDI/.test(sim.serial), 'sağ basış yazılmalıydı')
    sim.drive(2, true); sim.drive(3, true)
    sim.run(50)
    assert.ok(/Sol tampon: BIRAKILDI/.test(sim.serial) && /Sag tampon: BIRAKILDI/.test(sim.serial), 'bırakma yazılmalıydı')
    assert.equal(say(sim.serial, /BASILDI/g), 2, 'her basış yalnız bir kez yazılmalıydı (kenar algılama)')
  },

  tampon_kacis(sim, kaynak) {
    // Sola yatık yaklaşım: önce SOL tampon basılır, robot geri çekilip SAĞA döner.
    const sol = tamponDeneyi(kaynak, -0.3, /CARPMA SOL/)
    assert.ok(2 - sol.bump.x < 0.15, `tampon duvara ~10 cm kala basılmalıydı, merkez duvara ${(2 - sol.bump.x).toFixed(2)} m`)
    assert.ok(!sol.carpti, 'robot tampona basınca durup geri çekilmeliydi, duvara gömülmemeliydi')
    assert.ok(sol.x < sol.bump.x - 0.05, `robot geri çekilmeliydi: x ${sol.bump.x.toFixed(2)} -> ${sol.x.toFixed(2)}`)
    const dSol = dar(sol.th - sol.bump.th)
    assert.ok(dSol < -70 && dSol > -110, `sol tampon basılınca ~90° sağa dönmeliydi, ${dSol.toFixed(0)}°`)

    // Sağa yatık yaklaşım: SAĞ tampon, dönüş SOLA.
    const sag = tamponDeneyi(kaynak, 0.3, /CARPMA SAG/)
    const dSag = dar(sag.th - sag.bump.th)
    assert.ok(dSag > 70 && dSag < 110, `sağ tampon basılınca ~90° sola dönmeliydi, ${dSag.toFixed(0)}°`)
    assert.ok(!sag.carpti, 'sağ tamponda da duvara gömülmemeliydi')

    // Dik yaklaşım: ikisi birden basılır.
    const on = tamponDeneyi(kaynak, 0, /CARPMA ON/)
    assert.ok(on.x < on.bump.x - 0.05, 'cepheden çarpınca da geri çekilmeliydi')

    // Uzun koşu: kutuda gezinir, tamponla kaçar, duvara gömülmez.
    const s2 = createSim(kaynak, { name: 'tampon_uzun' })
    const r = s2.rover({ arena: Arena.box(2, 2), pose: { x: 1, y: 1, theta: 0.4 }, motors: STD_MOTORS, bumpers: { left: 2, right: 3 } })
    const carpma = izle(s2, r, 15000)
    const tamponlar = say(s2.serial, /CARPMA/g)
    assert.ok(tamponlar >= 2, `15 sn'de en az 2 tampon olayı bekleniyordu, ${tamponlar}`)
    assert.equal(carpma, 0, `tampon varken robot duvara gömülmemeliydi (${carpma} kez)`)
    assert.ok(r.state.distanceM > 2.5, `robot ilerlemeliydi, ${r.state.distanceM.toFixed(2)} m`)
  },

  mesafe_yaz(sim) {
    const r = sim.rover({ arena: Arena.box(2, 2), pose: { x: 1.5, y: 1, theta: 0 }, motors: STD_MOTORS,
      ultrasonic: STD_ULTRASONIC, noiseCm: 3, seed: 7 })
    sim.run(5000)
    const satirlar = sim.serial.trim().split(/\r?\n/).map((l) => l.split(' ').map(Number))
    assert.ok(satirlar.length >= 25, `5 sn'de ~30 satır bekleniyordu, ${satirlar.length}`)
    const ham = ortStd(satirlar.map((s) => s[0]))
    const med = ortStd(satirlar.map((s) => s[1]))
    assert.ok(Math.abs(ham.m - 44) < 2 && Math.abs(med.m - 44) < 2, `gerçek mesafe ~44 cm, ham ${ham.m.toFixed(1)}, medyan ${med.m.toFixed(1)}`)
    assert.ok(ham.sd > 2, `gürültülü ham ölçüm dalgalanmalıydı, sapma ${ham.sd.toFixed(2)}`)
    assert.ok(med.sd < ham.sd * 0.75, `medyan ham ölçümden belirgin kararlı olmalıydı: ${med.sd.toFixed(2)} / ${ham.sd.toFixed(2)}`)
    assert.ok(r.state.distanceM === 0, 'robot sürülmedi, yerinde kalmalıydı')
  },

  mesafe_tek_dur(sim, kaynak) {
    // Gürültüsüz: eşiğe (25 cm) yakın durur ve ~90° sağa döner, duvara değmez.
    const d0 = durDeneyi(kaynak, 0, 1)
    assert.ok(d0.sensorCm > 20 && d0.sensorCm < 27, `gürültüsüz durma mesafesi 20-27 cm bekleniyordu, ${d0.sensorCm.toFixed(1)}`)
    assert.ok(!d0.carpti, 'robot duvara çarpmamalıydı')
    assert.ok(d0.kayma > 0.5 && d0.kayma < 3, `dur komutundan sonra motor gecikmesiyle ~1,5 cm kayma bekleniyordu, ${d0.kayma.toFixed(1)} cm`)
    assert.ok(d0.th < -80 && d0.th > -100, `dur ve sağa dön: ~-90° bekleniyordu, ${d0.th.toFixed(0)}°`)
    // Çok gürültülü (6 cm) ölçümde tek okuma sahte "engel" görür: robot hep erken durur, bazen çok erken.
    const stoplar = [1, 2, 3, 4].map((seed) => durDeneyi(kaynak, 6, seed))
    const en = Math.min(...stoplar.map((x) => x.sensorCm))
    const ort = stoplar.reduce((a, x) => a + x.sensorCm, 0) / stoplar.length
    assert.ok(en > 30, `tek ölçümle her koşuda eşikten (25) çok önce, 30 cm'den uzakta durmalıydı; en yakın durma ${en.toFixed(1)} cm`)
    assert.ok(ort > 32, `tek ölçümle ortalama durma 32 cm üstünde kalmalıydı (eşik 25), ${ort.toFixed(1)}`)
  },

  mesafe_medyan_dur(sim, kaynak) {
    const d0 = durDeneyi(kaynak, 0, 1)
    assert.ok(d0.sensorCm > 20 && d0.sensorCm < 27, `gürültüsüz durma mesafesi 20-27 cm bekleniyordu, ${d0.sensorCm.toFixed(1)}`)
    assert.ok(d0.th < -80 && d0.th > -100, `dur ve sağa dön: ~-90° bekleniyordu, ${d0.th.toFixed(0)}°`)
    // Aynı 6 cm gürültüde medyan filtreli sürüm eşiğe çok daha yakın durur.
    const stoplar = [1, 2, 3, 4].map((seed) => durDeneyi(kaynak, 6, seed))
    for (const x of stoplar) {
      assert.ok(x.sensorCm > 20 && x.sensorCm < 30, `medyanla durma 20-30 cm arasında olmalıydı, ${x.sensorCm.toFixed(1)}`)
      assert.ok(!x.carpti, 'robot duvara çarpmamalıydı')
    }
    const ort = stoplar.reduce((a, x) => a + x.sensorCm, 0) / stoplar.length
    assert.ok(ort < 28, `medyanla ortalama durma 28 cm altında olmalıydı, ${ort.toFixed(1)}`)
  },

  tara_en_acik(sim, kaynak) {
    // Önünde dik duvar, SOL tarafı (y > 1,4) açık arena.
    const tara = (aynali) => {
      const s = aynali ? createSim(kaynak, { name: 'tara_ayna' }) : sim
      const arena = Arena.box(2, 2)
      if (aynali) arena.wall(1.35, 2, 1.35, 0.6); else arena.wall(1.35, 0, 1.35, 1.4)
      const r = s.rover({ arena, pose: { x: 1, y: 1, theta: 0 }, motors: STD_MOTORS, ultrasonic: STD_ULTRASONIC, noiseCm: 1, seed: 4 })
      assert.ok(kadar(s, () => /SECILEN \d+\r?\n/.test(s.serial), 6000), `tarama bitmedi: ${JSON.stringify(s.serial)}`)
      const tur = Object.fromEntries([...s.serial.matchAll(/^(\d+):(\d+)/gm)].map((m) => [Number(m[1]), Number(m[2])]))
      const secilen = Number(/SECILEN (\d+)/.exec(s.serial)[1])
      const basla = derece(r)
      let carpti = false
      const bitis = s.nowMs() + 4000
      while (s.nowMs() < bitis) { s.run(5); carpti ||= r.state.collided }
      return { tur, secilen, basla, bitti: derece(r), carpti, y: r.state.y, x: r.state.x, s }
    }
    const sol = tara(false)
    assert.deepEqual(Object.keys(sol.tur).map(Number), [30, 60, 90, 120, 150], `5 yönde ölçüm bekleniyordu: ${JSON.stringify(sol.tur)}`)
    assert.equal(sol.secilen, 150, `sol açıkken 150° (sol) seçilmeliydi: ${JSON.stringify(sol.tur)}`)
    assert.ok(sol.tur[150] > 90, `açık yön uzun ölçmeliydi: ${sol.tur[150]} cm`)
    assert.ok(sol.tur[90] < 40 && sol.tur[60] < 50, `duvarlı yönler kısa ölçmeliydi: ${JSON.stringify(sol.tur)}`)
    assert.ok(sol.bitti > 50 && sol.bitti < 70, `robot ~60° sola dönmeliydi, ${sol.bitti.toFixed(0)}°`)
    assert.ok(!sol.carpti && sol.y > 1.4, `robot açık yönden geçmeliydi, y=${sol.y.toFixed(2)}`)
    // Sağ tarafı açık (ayna) arena: robot SAĞA dönmeli.
    const sag = tara(true)
    assert.equal(sag.secilen, 30, `sağ açıkken 30° (sağ) seçilmeliydi: ${JSON.stringify(sag.tur)}`)
    assert.ok(sag.bitti < -50 && sag.bitti > -70, `robot ~60° sağa dönmeliydi, ${sag.bitti.toFixed(0)}°`)
    assert.ok(!sag.carpti && sag.y < 0.6, `robot açık yönden geçmeliydi, y=${sag.y.toFixed(2)}`)
    // Servo gerçekten 30°...150° taradı (544 + açı/180 × 1856 µs).
    const gen = sim.pulseWidthsUs(4, 0, sim.nowMs()).filter((w) => w > 400 && w < 2600)
    assert.ok(Math.min(...gen) < 900 && Math.max(...gen) > 2050, `servo 30°-150° taramalıydı: ${Math.min(...gen)}-${Math.max(...gen)} µs`)
  },

  kacis_fsm(sim, kaynak) {
    const kutu = sim.rover({ arena: Arena.box(2, 2), pose: { x: 0.3, y: 1, theta: 0 }, motors: STD_MOTORS,
      ultrasonic: STD_ULTRASONIC, bumpers: { left: 2, right: 3 }, noiseCm: 2, seed: 5 })
    const { gecisler, carpma } = durumKos(sim, kutu, 20000)
    assert.equal(gecisler[0].ad, 'ILERI', 'robot ILERI durumunda başlamalı')
    gecisleriDogrula(gecisler)
    assert.equal(carpma, 0, `kutuda duvara çarpmadan gezinmeliydi (${carpma} çarpma)`)
    assert.ok(kutu.state.distanceM > 2.2, `20 sn'de >2,2 m yol bekleniyordu, ${kutu.state.distanceM.toFixed(2)} m`)
    const sayi = (ad) => gecisler.filter((g) => g.ad === ad).length
    assert.ok(sayi('DUR') >= 2 && sayi('TARA') >= 2 && sayi('DON') >= 2, `en az 2 tam tur bekleniyordu: ${gecisler.map((g) => g.ad).join(' ')}`)
    // Süreler millis() ile ölçülür: DUR ~250 ms, TARA 5 yön x 300 ms bekleme, DON = |açı - 90| x 5 ms.
    for (let i = 0; i < gecisler.length - 1; i++) {
      const sure = gecisler[i + 1].t - gecisler[i].t
      if (gecisler[i].ad === 'DUR') assert.ok(sure > 230 && sure < 330, `DUR ~250 ms sürmeliydi, ${sure.toFixed(0)} ms`)
      if (gecisler[i].ad === 'TARA') assert.ok(sure > 1500 && sure < 2000, `TARA ~1,6 sn sürmeliydi, ${sure.toFixed(0)} ms`)
      if (gecisler[i].ad === 'DON') {
        // dönüş açısı = taramada seçilen açı - 90; ölçülen yön değişimi buna yakın olmalı
        const secim = [...sim.serial.matchAll(/EN ACIK (\d+) (\d+)\r?\n/g)]
        const k = gecisler.slice(0, i + 1).filter((g) => g.ad === 'DON').length - 1
        if (secim[k]) {
          const beklenen = Number(secim[k][1]) - 90
          const olculen = dar(gecisler[i + 1].th - gecisler[i].th)
          assert.ok(Math.abs(olculen - beklenen) < 20, `DON ${beklenen}° dönmeliydi, ölçülen ${olculen.toFixed(0)}°`)
        }
      }
    }
    // Sıkışık cep (30 cm genişlik, kör son): TARA'da her yön kısa çıkar, TARA -> GERI.
    const s2 = createSim(kaynak, { name: 'fsm_cep' })
    const cepArena = Arena.box(2, 2).wall(1.2, 0.85, 1.8, 0.85).wall(1.2, 1.15, 1.8, 1.15)
    const cep = s2.rover({ arena: cepArena, pose: { x: 1.25, y: 1, theta: 0 }, motors: STD_MOTORS,
      ultrasonic: STD_ULTRASONIC, bumpers: { left: 2, right: 3 }, noiseCm: 2, seed: 5 })
    const c = durumKos(s2, cep, 12000)
    gecisleriDogrula(c.gecisler)
    const i = c.gecisler.findIndex((g, k) => g.ad === 'GERI' && c.gecisler[k - 1]?.ad === 'TARA')
    assert.ok(i > 0, `cepte TARA -> GERI beklenirdi: ${c.gecisler.map((g) => g.ad).join(' ')}`)
    const g0 = c.gecisler[i]
    const g1 = c.gecisler[i + 1]
    const ileri = (g1.x - g0.x) * Math.cos(g0.th / DERECE) + (g1.y - g0.y) * Math.sin(g0.th / DERECE)   // yön boyunca yer değiştirme
    assert.ok(ileri < -0.04, `GERI durumunda robot yönünün tersine gitmeliydi, ${(ileri * 100).toFixed(1)} cm`)
    assert.equal(c.carpma, 0, 'cepte de duvara çarpmamalıydı')
    // Ince yarık: orta ışın yarıktan geçip uzağı görür (sensör KÖR), ama iki tampon duvara basar -> ILERI -> GERI.
    const s3 = createSim(kaynak, { name: 'fsm_yarik' })
    const yarikArena = Arena.box(2, 2).wall(1.5, 0, 1.5, 0.985).wall(1.5, 1.015, 1.5, 2)
    const yarik = s3.rover({ arena: yarikArena, pose: { x: 1, y: 1, theta: 0 }, motors: STD_MOTORS,
      ultrasonic: STD_ULTRASONIC, bumpers: { left: 2, right: 3 } })
    const y = durumKos(s3, yarik, 4000)
    assert.deepEqual(y.gecisler.slice(0, 3).map((g) => g.ad), ['ILERI', 'GERI', 'DON'],
      `sensör görmeyince tampon devreye girmeliydi (ILERI GERI DON): ${y.gecisler.map((g) => g.ad).join(' ')}`)
    assert.equal(y.carpma, 0, 'tampon robotu duvara gömülmeden geri çevirmeliydi')
  },

  otonom_kacis(sim, kaynak) {
    // Koşu 1 (35 sn): sol altta başlar. Çarpma yok denecek kadar az, yeterli yol.
    const r = sim.rover({ arena: projeArenasi(), pose: { x: 0.3, y: 0.4, theta: 0 }, motors: STD_MOTORS,
      ultrasonic: STD_ULTRASONIC, bumpers: { left: 2, right: 3 }, noiseCm: 2, seed: 1 })
    const carpma1 = izle(sim, r, 25000)
    // Seri komut: 'x' robotu durdurur, 'g' devam ettirir (79. ders fikri).
    sim.sendSerial('x')
    sim.run(1000)
    const durdu = r.state.distanceM
    sim.run(2000)
    assert.ok(r.state.distanceM - durdu < 0.01, `'x' komutundan sonra robot durmalıydı, ${(r.state.distanceM - durdu).toFixed(3)} m gitti`)
    assert.ok(/KOMUT DUR/.test(sim.serial), 'x komutu seriye yazılmalıydı')
    sim.sendSerial('g')
    const carpma2 = izle(sim, r, 9000)
    assert.ok(/KOMUT GIT/.test(sim.serial), 'g komutu seriye yazılmalıydı')
    assert.ok(r.state.distanceM - durdu > 0.8, `'g' komutundan sonra robot yola devam etmeliydi, ${(r.state.distanceM - durdu).toFixed(2)} m`)
    const toplam = carpma1 + carpma2
    assert.ok(r.state.distanceM >= 3.0, `34 sn'lik koşuda en az 3 m yol bekleniyordu, ${r.state.distanceM.toFixed(2)} m`)
    assert.ok(toplam <= 3, `en fazla 3 çarpma bekleniyordu, ${toplam}`)
    // Seri rapordaki tampon sayısı gerçek tampon olaylarıyla tutarlı
    const tamponOlay = say(sim.serial, /TAMPON (SAG|SOL)/g)
    const rapor = [...sim.serial.matchAll(/RAPOR carpma=(\d+)/g)].map((m) => Number(m[1]))
    assert.ok(rapor.length >= 5, `5 sn'de bir rapor bekleniyordu, ${rapor.length} rapor`)
    assert.equal(rapor.at(-1) <= tamponOlay, true, 'rapordaki sayı tampon olaylarını aşmamalıydı')

    // Koşu 2 (30 sn): sağ üstte başlar, ters yönde; sıkışma denetimi dahil.
    const k2 = projeKos(kaynak, { x: 1.7, y: 1.7, theta: Math.PI }, 1)
    const c2 = izle(k2.sim, k2.r, 30000)
    assert.ok(k2.r.state.distanceM >= 3.0, `2. koşuda en az 3 m yol bekleniyordu, ${k2.r.state.distanceM.toFixed(2)} m`)
    assert.ok(c2 <= 3, `2. koşuda en fazla 3 çarpma bekleniyordu, ${c2}`)
    // robot arenanın içinde kaldı
    assert.ok(k2.r.state.x > 0 && k2.r.state.x < 2 && k2.r.state.y > 0 && k2.r.state.y < 2, 'robot arenadan çıkmamalıydı')
  },
}

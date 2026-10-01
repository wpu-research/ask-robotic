import assert from 'node:assert/strict'
import { Arena, STD_MOTORS } from '../../../tools/sim/robot.mjs'

const DERECE = 180 / Math.PI
const yaklasik = (gercek, beklenen, tol, ad) =>
  assert.ok(Math.abs(gercek - beklenen) <= tol, `${ad}: ${gercek.toFixed(4)} bekleniyordu ${beklenen.toFixed(4)} ± ${tol}`)

// sim.sendSerial art arda baytları kaçırabilir (tek seferde gönderilen satır hiç ulaşmaz).
// Bu yüzden baytları ~3 ms arayla, benzetim ilerleyerek gönderiyoruz. Süre: metin.length * aralikMs.
function seriGonder(sim, metin, aralikMs = 3) {
  for (const c of metin) { sim.sendSerial(c); sim.run(aralikMs) }
}

// Standart pinlerle (STD_MOTORS) robot kurar; sensör yok.
function robotKur(sim, { x = 0.5, y = 1, theta = 0, genislik = 4, yukseklik = 2 } = {}) {
  return sim.rover({ arena: Arena.box(genislik, yukseklik), pose: { x, y, theta }, motors: STD_MOTORS })
}

// ms boyunca ilerler; ortalama çizgisel hız (m/s, yol uzunluğu / süre) ve dönme hızı (rad/s) döndürür.
function olc(sim, robot, ms) {
  const s = robot.state
  const t0 = sim.nowMs(), d0 = s.distanceM, th0 = s.theta, x0 = s.x, y0 = s.y
  sim.run(ms)
  const T = (sim.nowMs() - t0) / 1000
  return {
    v: (s.distanceM - d0) / T,
    w: (s.theta - th0) / T,
    dx: s.x - x0, dy: s.y - y0,
    yol: s.distanceM - d0,
    dth: (s.theta - th0) * DERECE,
  }
}

// Ders 76-80'de ortak: PWM -> tekerlek hızı modeli (ölü bölge 51, PWM 255'te 0,396 m/s)
const pwmdenHiz = (pwm) => Math.sign(pwm) * Math.max(0, (Math.abs(pwm) - 51) / 204) * 0.396

const sonSatir = (sim) => sim.serial.trim().split('\n').at(-1).trim()
const say = (s, desen) => (s.match(desen) || []).length

export default {
  // Ders 76: formüller ve robotun gerçek hareketi
  diferansiyel_hesap(sim) {
    const robot = robotKur(sim, { x: 3, y: 3, genislik: 8, yukseklik: 6 })
    const s = robot.state
    sim.run(300)

    const dene = (pl, pr, ms = 2000) => {
      seriGonder(sim, `${pl} ${pr}\n`)
      sim.run(600)                                   // motor gecikmesi otursun
      const m = olc(sim, robot, ms)
      const satir = sonSatir(sim)
      const e = satir.match(/^vL=(-?[\d.]+) vR=(-?[\d.]+) v=(-?[\d.]+) w=(-?[\d.]+) R=(\S+)$/)
      assert.ok(e, `çıktı biçimi beklenmedik: ${JSON.stringify(satir)}`)
      const [vL, vR, v, w] = e.slice(1, 5).map(Number)
      // sketch'in yazdığı v ve ω, yazdığı vL ve vR'den formülle çıkmalı
      yaklasik(v, (vR + vL) / 2, 0.0006, 'v = (vR+vL)/2')
      yaklasik(w, (vR - vL) / 0.12, 0.01, 'ω = (vR-vL)/L')
      return { m, vL, vR, v, w, R: e[5] }
    }

    // 1) iki tekerlek aynı hız -> düz
    const a = dene(204, 204)
    yaklasik(a.vL, 0.297, 0.001, 'vL hesabı')
    assert.equal(a.R, 'duz')
    yaklasik(a.m.v, a.v, 0.006, 'ölçülen v (düz)')
    assert.ok(Math.abs(a.m.w) < 0.02, `düz gitmeliydi, ω = ${a.m.w}`)
    assert.ok(Math.abs(a.m.dy) < 0.01, `düz gitmeliydi, y değişti: ${a.m.dy}`)

    // 2) zıt hız -> yerinde dönüş
    const b = dene(-204, 204)
    yaklasik(b.v, 0, 0.0006, 'zıt hızda v')
    yaklasik(b.w, 4.95, 0.01, 'zıt hızda ω hesabı')
    yaklasik(b.m.w, 4.95, 0.15, 'ölçülen ω (yerinde dönüş)')
    assert.ok(b.m.v < 0.003, `yerinde dönerken ilerlememeliydi, v = ${b.m.v}`)
    // yerinde dönüşte robotun konumu kaymaz (2,6 sn dönüş boyunca)
    assert.ok(Math.hypot(b.m.dx, b.m.dy) < 0.005, `yerinde dönmeliydi, 2 sn'de konum ${Math.hypot(b.m.dx, b.m.dy).toFixed(3)} m kaydı`)

    // 3) farklı hız -> kavis; R = (L/2)(vR+vL)/(vR-vL)
    const c = dene(153, 204)
    yaklasik(c.v, 0.2475, 0.001, 'kavis v hesabı')
    yaklasik(c.w, 0.825, 0.001, 'kavis ω hesabı')
    yaklasik(Number(c.R), 0.3, 0.001, 'kavis R hesabı')
    yaklasik(c.m.v, c.v, 0.008, 'ölçülen v (kavis)')
    yaklasik(c.m.w, c.w, 0.03, 'ölçülen ω (kavis)')
    yaklasik(c.m.v / c.m.w, 0.3, 0.015, 'ölçülen dönme yarıçapı')
    assert.ok(c.m.w > 0, 'sağ tekerlek hızlıysa robot sola dönmeli (ω > 0)')

    // 4) bir tekerlek duruyor -> R = L/2
    const d = dene(0, 204)
    yaklasik(Number(d.R), 0.06, 0.0005, 'tek tekerlekte R hesabı = L/2')
    yaklasik(d.m.v / d.m.w, 0.06, 0.006, 'ölçülen R (tek tekerlek)')

    // 5) sağa dönüş işareti
    const e = dene(100, -100, 1000)
    assert.ok(e.m.w < 0 && e.w < 0, 'sol tekerlek hızlıysa robot sağa dönmeli (ω < 0)')

    // 6) ters problem: v = 0,2 m/s ve ω = 1 rad/s -> vR = 0,26, vL = 0,14 -> PWM 185 ve 123
    const f = dene(123, 185)
    yaklasik(f.v, 0.2, 0.002, 'ters problem v')
    yaklasik(f.w, 1.0, 0.01, 'ters problem ω')
    yaklasik(f.m.v, 0.2, 0.008, 'ters problem ölçülen v')
    yaklasik(f.m.w, 1.0, 0.04, 'ters problem ölçülen ω')
  },

  // Ders 77: ileri / fren / geri / serbest durumları
  surucu_durumlari(sim) {
    const robot = robotKur(sim, { x: 0.8, y: 1 })
    const s = robot.state
    const pinler = () => [7, 8, 9, 10].map((p) => Number(sim.read(p))).join('')

    // ILERI (0-1500 ms)
    sim.run(600)
    assert.equal(pinler(), '1010', `ILERI: IN1=1 IN2=0 IN3=1 IN4=0 bekleniyordu, ${pinler()}`)
    const wv = sim.wave(5, 100, 600)
    yaklasik(wv.duty, 200 / 255, 0.04, 'ILERI EN doluluk oranı')
    const x1 = s.x
    const ileri = olc(sim, robot, 800)             // t = 600-1400
    assert.ok(s.x > x1 + 0.1, 'ILERI: robot +x yönünde ilerlemeli')
    yaklasik(ileri.v, pwmdenHiz(200), 0.012, 'ILERI hızı (PWM 200)')
    assert.ok(Math.abs(ileri.w) < 0.02, 'ILERI: robot düz gitmeli')

    // FREN (1500-3000 ms)
    sim.run(100)                                   // t = 1500
    const xFrenBasi = s.x
    sim.run(400)
    assert.equal(pinler(), '1111', `FREN: IN1=IN2=IN3=IN4=1 bekleniyordu, ${pinler()}`)
    assert.ok(sim.read(5) && sim.read(6), 'FREN: EN yüksek olmalı')
    sim.run(500)                                   // t = 2400
    const bekle1 = olc(sim, robot, 500)            // t = 2400-2900: durmuş olmalı
    assert.ok(bekle1.v < 0.003, `FREN: robot durmuş olmalı, v = ${bekle1.v}`)
    const frenYolu = s.x - xFrenBasi
    yaklasik(frenYolu, pwmdenHiz(200) * 0.08, 0.008, 'FREN durma mesafesi (v·τ)')

    // GERI (3000-4500 ms)
    sim.run(1100)                                  // t = 4000
    assert.equal(pinler(), '0101', `GERI: IN1=0 IN2=1 IN3=0 IN4=1 bekleniyordu, ${pinler()}`)
    const x2 = s.x
    const geri = olc(sim, robot, 400)              // t = 4000-4400
    assert.ok(s.x < x2 - 0.03, 'GERI: robot -x yönünde gitmeli')
    yaklasik(geri.v, pwmdenHiz(120), 0.01, 'GERI hızı (PWM 120)')
    assert.ok(geri.v < ileri.v / 1.8, 'GERI daha düşük PWM ile daha yavaş olmalı')

    // SERBEST (4500-6000 ms)
    sim.run(200)                                   // t = 4600
    const xSerbestBasi = s.x
    sim.run(100)
    assert.equal(pinler(), '0000', `SERBEST: dört IN pini de 0 olmalı, ${pinler()}`)
    assert.ok(!sim.read(5) && !sim.read(6), 'SERBEST: EN kapalı olmalı')
    sim.run(1000)                                  // t = 5700
    const bekle2 = olc(sim, robot, 200)
    assert.ok(bekle2.v < 0.003, `SERBEST: robot durmuş olmalı, v = ${bekle2.v}`)
    // Benzetimde fren ile serbest bırakma aynı üstel yavaşlamayı verir: yol ≈ v·τ
    yaklasik(Math.abs(s.x - xSerbestBasi), pwmdenHiz(120) * 0.08, 0.01, 'SERBEST durma mesafesi (v·τ)')

    for (const ad of ['ILERI', 'FREN', 'GERI', 'SERBEST']) assert.ok(sim.serial.includes(ad), `${ad} yazdırılmalı`)
    assert.ok(/ILERI\r?\nFREN\r?\nGERI\r?\nSERBEST/.test(sim.serial), `durum sırası: ${JSON.stringify(sim.serial)}`)
  },

  // Ders 78a: PWM taraması, ölü bölge
  olu_bolge_tarama(sim) {
    const robot = robotKur(sim, { x: 1, y: 1 })
    const s = robot.state
    const enYuksekHiz = {}                         // PWM -> görülen en yüksek tekerlek hızı (m/s)
    let basildi = false
    const sonPwm = () => {
      const m = [...sim.serial.matchAll(/PWM=(\d+)/g)].pop()
      return m ? Number(m[1]) : 30
    }
    sim.run(700)                                   // açılış geçişi geçsin
    for (let i = 0; i < 1200 && !basildi; i++) {
      sim.run(10)
      const p = sonPwm()
      const v = Math.abs(s.wL) * 0.033
      enYuksekHiz[p] = Math.max(enYuksekHiz[p] ?? 0, v)
      // "Gözle görülür hareket": 1 cm/s'yi geçince butona bas
      if (v >= 0.01) { sim.drive(2, false); basildi = true }
    }
    assert.ok(basildi, 'robot hiç hareket etmedi')
    sim.run(100)
    sim.drive(2, true)
    const m = sim.serial.match(/Hareket basladi: PWM=(\d+)/)
    assert.ok(m, `bulunan PWM yazdırılmalı: ${JSON.stringify(sim.serial.slice(-80))}`)
    const bulunan = Number(m[1])
    assert.ok(bulunan >= 55 && bulunan <= 60, `1 cm/s eşiği PWM 55-60 civarında bekleniyordu, ${bulunan}`)
    // ölü bölge: 50 ve altında tekerlek (neredeyse) dönmez
    for (const p of Object.keys(enYuksekHiz).map(Number).filter((k) => k >= 35 && k <= 48)) {
      assert.ok(enYuksekHiz[p] < 0.002, `PWM ${p}: ölü bölgede tekerlek dönmemeliydi, ${enYuksekHiz[p]} m/s`)
    }
    // ölü bölgeden sonra hız PWM ile artar
    assert.ok(enYuksekHiz[bulunan] > enYuksekHiz[52] + 0.005, 'PWM arttıkça hız artmalı')
    // tarama durdu, robot durdu
    sim.run(600)
    const son = olc(sim, robot, 500)
    assert.ok(son.v < 0.003, `tarama bitince robot durmalı, v = ${son.v}`)
    assert.ok(sim.serial.length > 0 && !/hareket yok/.test(sim.serial), 'tarama hata vermemeli')
  },

  // Ders 78b: hizdanPwm kalibrasyonu ile naif eşleme
  kalibre_hiz(sim) {
    const robot = robotKur(sim, { x: 0.3, y: 1, genislik: 8 })
    sim.run(200)
    const dene = (mod, cm) => {
      seriGonder(sim, `${mod} ${cm}\n`)
      sim.run(700)
      const m = olc(sim, robot, 1000)
      const e = sonSatir(sim).match(/pwm=(\d+)$/)
      assert.ok(e, `pwm yazdırılmalı: ${JSON.stringify(sonSatir(sim))}`)
      return { v: m.v, pwm: Number(e[1]), istenen: cm / 100 }
    }

    // kalibre: istenen hıza yakın gerçek hız
    const k5 = dene('K', 5), k10 = dene('K', 10), k20 = dene('K', 20), k30 = dene('K', 30), k39 = dene('K', 39)
    for (const k of [k5, k10, k20, k30, k39]) yaklasik(k.v, k.istenen, 0.006, `K ${k.istenen} m/s gerçek hız`)
    assert.ok(k5.pwm > 51, 'kalibre PWM ölü bölgenin üstünde olmalı')

    // naif: ölü bölge yüzünden yavaş istekler çok düşük kalır
    const n5 = dene('N', 5), n10 = dene('N', 10), n20 = dene('N', 20), n39 = dene('N', 39)
    assert.ok(n5.pwm < 51 && n5.v < 0.003, `N 5: PWM ${n5.pwm} ölü bölgede, robot dönmemeliydi, v = ${n5.v}`)
    assert.ok(n10.v < 0.04, `N 10: istenen 0,10 m/s ama ölçülen ${n10.v} olmalı (çok düşük)`)
    assert.ok(n20.v < 0.17 && n20.v > 0.12, `N 20: ölçülen ${n20.v} (istenenden belirgin düşük)`)
    assert.ok(Math.abs(n39.v - 0.39) < 0.01, 'tam hızda naif ve kalibre aynıdır')
    // karşılaştırma: kalibre hata < %3, naif hata > %20 (10 cm/s)
    assert.ok(Math.abs(k10.v - 0.1) / 0.1 < 0.03, 'kalibre hata < %3')
    assert.ok(Math.abs(n10.v - 0.1) / 0.1 > 0.5, 'naif hata büyük olmalı (10 cm/s)')

    // iki noktadan doğru: (PWM, hız) -> ölü bölge sonu ve azami hız
    const egim = (k30.v - k10.v) / (k30.pwm - k10.pwm)
    const sifir = k10.pwm - k10.v / egim
    assert.ok(sifir > 48 && sifir < 54, `iki noktadan ölü bölge sonu ≈ 51 bekleniyordu, ${sifir.toFixed(1)}`)
    yaklasik(egim * (255 - sifir), 0.396, 0.01, 'iki noktadan azami hız')

    // durma isteği
    const k0 = dene('K', 0)
    assert.equal(k0.pwm, 0)
    assert.ok(k0.v < 0.003, 'K 0: robot durmalı')
  },

  // Ders 79: W/S/A/D/X ayrıştırıcı
  seri_komut(sim) {
    const robot = robotKur(sim, { x: 1, y: 2, genislik: 6, yukseklik: 4 })
    const s = robot.state
    sim.run(100)
    assert.ok(/Hazir/.test(sim.serial), 'açılış mesajı beklenirdi')
    const komut = (metin) => seriGonder(sim, metin)

    // W200: ileri
    komut('W200\n')
    sim.run(500)
    const w = olc(sim, robot, 500)
    yaklasik(w.v, pwmdenHiz(200), 0.015, 'W200 hızı')
    assert.ok(w.dx > 0.1 && Math.abs(w.dth) < 1, 'W: +x yönünde düz gitmeli')
    assert.ok(/OK W 200\r?\n/.test(sim.serial), `OK W 200 yazdırılmalı: ${JSON.stringify(sim.serial)}`)

    // X: dur
    komut('X\n')
    sim.run(500)
    assert.ok(olc(sim, robot, 300).v < 0.003, 'X sonrası robot durmalı')
    assert.ok(/OK X 0\r?\n/.test(sim.serial), 'OK X 0 yazdırılmalı')

    // S + CRLF, hız yazılmadı: varsayılan 150
    komut('S\r\n')
    sim.run(500)
    const g = olc(sim, robot, 500)
    yaklasik(g.v, pwmdenHiz(150), 0.012, 'S varsayılan hız (150)')
    assert.ok(g.dx < -0.05, 'S: geri gitmeli')
    assert.ok(/OK S 150\r?\n/.test(sim.serial), 'OK S 150 yazdırılmalı')
    komut('X\n'); sim.run(500)

    // A: yerinde sola dön (+), D: yerinde sağa dön (-), küçük harf de kabul
    const th0 = s.theta, x0 = s.x, y0 = s.y
    komut('A150\n'); sim.run(500)
    komut('X\n'); sim.run(500)
    const sola = (s.theta - th0) * DERECE
    yaklasik(sola, 91, 10, 'A150 0,5 sn: sola dönüş açısı (°)')
    komut('d150\n'); sim.run(500)
    komut('X\n'); sim.run(500)
    const toplam = (s.theta - th0) * DERECE
    yaklasik(toplam, 0, 6, 'D ile geri dönünce yön')
    assert.ok(Math.hypot(s.x - x0, s.y - y0) < 0.02, 'A/D yerinde dönüş: konum kaymamalı')

    // baştaki boşluk atoi tarafından atlanır
    komut('W 200\n')
    sim.run(100)
    assert.equal(say(sim.serial, /OK W 200\r?\n/g), 2, 'boşluklu "W 200" da kabul edilmeli (atoi baştaki boşluğu atlar)')
    komut('X\n'); sim.run(500)

    // geçersiz komut: robot etkilenmez
    komut('Q\n')
    sim.run(100)
    assert.ok(/\?\r?\n/.test(sim.serial), '? yazdırılmalı')
    assert.ok(olc(sim, robot, 300).v < 0.003, 'geçersiz komut robotu hareket ettirmemeli')

    // ölü bölge: W10 PWM 10, robot kıpırdamaz
    komut('W10\n')
    sim.run(500)
    const olu = olc(sim, robot, 700)
    assert.ok(olu.v < 0.003, `W10 ölü bölgede, robot dönmemeliydi: v = ${olu.v}`)
    assert.ok(/OK W 10\r?\n/.test(sim.serial), 'W10 kabul edilmeli (OK W 10)')

    // sınır: W999 -> 255
    komut('W999\n')
    sim.run(500)
    const tam = olc(sim, robot, 400)
    assert.ok(/OK W 255\r?\n/.test(sim.serial), `W999 255'e sınırlanmalı: ${JSON.stringify(sim.serial.slice(-60))}`)
    yaklasik(tam.v, 0.396, 0.02, 'W255 hızı')
    komut('X\n'); sim.run(500)

    // kopma sorunu: tek W gönder, sonra sessizlik. Robot X gelene kadar gider.
    komut('W150\n')
    sim.run(500)
    const yol0 = s.distanceM
    const sessiz = olc(sim, robot, 3000)
    assert.ok(sessiz.v > 0.15, `komut gelmese de robot gitmeye devam etmeli, v = ${sessiz.v}`)
    assert.ok(s.distanceM - yol0 > 0.5, 'sessizlikte robot yol almaya devam etmeli')
  },

  // Ders 80: komutlu araba + CMD_TIMEOUT watchdog
  komutlu_araba(sim) {
    const robot = robotKur(sim, { x: 0.5, y: 2, genislik: 4, yukseklik: 3 })
    const s = robot.state
    const komutSay = () => say(sim.serial, /Komut yok: dur/g)

    // Açılışta güvenli durum: komut yoksa robot yerinde durur
    sim.run(2000)
    assert.equal(s.distanceM, 0, 'komut yokken robot kıpırdamamalı')
    assert.equal(sim.read(13), false, 'açılışta LED sönük olmalı')
    assert.ok(/Hazir/.test(sim.serial), 'açılış mesajı beklenirdi')
    assert.equal(komutSay(), 0, 'sürülmüyorken "Komut yok" yazılmamalı')

    // Komutu sürdürür: her 200 ms'de bir tekrar (kumanda tuşu basılı tutulur gibi)
    const surdur = (komut, ms) => {
      const t0 = sim.nowMs()
      while (sim.nowMs() - t0 < ms) {
        seriGonder(sim, komut + '\n')
        sim.run(200 - (komut.length + 1) * 3)
      }
    }
    const dur = () => { seriGonder(sim, 'X\n'); sim.run(400) }
    const bas = { x: s.x, y: s.y }

    // 1) ileri 1 sn (20 cm/s)
    surdur('W20', 1000)
    assert.equal(sim.read(13), true, 'sürülürken LED yanmalı')
    dur()
    assert.equal(sim.read(13), false, 'X sonrası LED sönmeli')
    yaklasik(s.x - bas.x, 0.2, 0.025, '1 sn ileri: yol')
    yaklasik(s.y - bas.y, 0, 0.01, '1 sn ileri: yanal sapma')

    // 2) sağa dön (D12: her tekerlek 12 cm/s -> ω = 2v/L = 2 rad/s -> 0,8 sn ≈ 92°)
    surdur('D12', 800)
    dur()
    yaklasik(s.theta * DERECE, -90, 6, 'sağa dönüş açısı (°)')
    yaklasik(s.x, 0.7, 0.02, 'yerinde dönüş: x kaymamalı')

    // 3) geri 1 sn: robot -y'ye bakıyor, geri gidince +y'ye gider
    surdur('S20', 1000)
    dur()
    yaklasik(s.x, 0.7, 0.03, 'komut dizisi sonu x')
    yaklasik(s.y, 2.2, 0.03, 'komut dizisi sonu y')
    yaklasik(s.distanceM, 0.4, 0.04, 'toplam yol')
    assert.equal(komutSay(), 0, 'X ile durdurulan sürüşte watchdog devreye girmemeli')

    // 4) watchdog: tek W20, sonra sessizlik. 700 ms sonra durmalı.
    const yol0 = s.distanceM
    seriGonder(sim, 'W20\n')
    const tKomut = sim.nowMs()
    sim.run(2000)
    const yol = s.distanceM - yol0
    assert.equal(komutSay(), 1, '"Komut yok: dur" tam bir kez yazılmalı')
    const enKenar = sim.pinEdges(5, tKomut, tKomut + 2000).at(-1)
    assert.ok(enKenar && !enKenar.value, 'sol EN sonunda LOW olmalı')
    const gecen = enKenar.t - tKomut
    assert.ok(gecen > 680 && gecen < 760, `durma komutu ~700 ms sonra bekleniyordu, ${gecen.toFixed(0)} ms`)
    const led = sim.pinEdges(13, tKomut, tKomut + 2000).filter((e) => !e.value).at(-1)
    assert.ok(led && Math.abs(led.t - enKenar.t) < 10, 'LED de aynı anda sönmeli')
    assert.ok(yol > 0.1 && yol < 0.18, `komut kesilince ~14 cm yol bekleniyordu, ${yol.toFixed(3)} m`)
    // durduktan sonra yerinde kalır
    const sonra = olc(sim, robot, 1000)
    assert.ok(sonra.yol < 0.002 && Math.abs(s.wL) < 0.01, 'watchdog sonrası robot durmuş kalmalı')

    // 5) komutlar düzenli geldikçe watchdog devreye girmez
    const sayi0 = komutSay()
    const yol1 = s.distanceM
    surdur('W20', 2000)
    assert.equal(komutSay(), sayi0, 'komut sürerken watchdog devreye girmemeli')
    assert.ok(s.distanceM - yol1 > 0.35, 'komut sürerken robot gitmeye devam etmeli (2 sn · 0,2 m/s)')
    dur()

    // 6) geçersiz komutlar watchdog'u yenilemez
    const yol2 = s.distanceM
    seriGonder(sim, 'W20\n')
    const t2 = sim.nowMs()
    while (sim.nowMs() - t2 < 2000) { seriGonder(sim, 'Q\n'); sim.run(194) }
    assert.equal(komutSay(), sayi0 + 1, 'geçersiz komutlar watchdog süresini uzatmamalı')
    assert.ok(say(sim.serial, /\?\r?\n/g) >= 5, 'geçersiz komutlara ? yazılmalı')
    assert.ok(s.distanceM - yol2 < 0.18, 'geçersiz komutlar robotu sürmemeli')

    // 7) hız sınırı: W999 -> 39 cm/s
    seriGonder(sim, 'W999\n')
    sim.run(400)
    const hizli = olc(sim, robot, 250)           // 700 ms dolmadan ölç
    yaklasik(hizli.v, 0.39, 0.02, 'W999 -> 39 cm/s sınırı')
    dur()
    sim.run(300)
    assert.ok(Math.abs(s.wL) < 0.01, 'X sonrası durmalı')
  },
}

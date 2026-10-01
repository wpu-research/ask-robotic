import assert from 'node:assert/strict'

const sayilar = (s) => s.split(/\r?\n/).filter(Boolean)
const yaz = (sim) => JSON.stringify(sim.serial)

// Servo darbe genişliğinden açı (Servo kütüphanesi: 544 µs = 0°, 2400 µs = 180°)
const aciOku = (us) => ((us - 544) * 180) / (2400 - 544)

// Son darbeden servo açısı (yoksa null)
function servoAci(sim) {
  const t = sim.nowMs()
  const p = sim.pulseWidthsUs(6, Math.max(0, t - 45), t)
  return p.length ? aciOku(p.at(-1)) : null
}

// Pindeki yükselen kenarlar arası aralıklar (ms) ve yanık kalma süreleri (ms)
function bipler(sim, pin, from, to) {
  const e = sim.pinEdges(pin, from, to)
  const yuk = e.filter((x) => x.value).map((x) => x.t)
  const aralik = yuk.slice(1).map((t, i) => t - yuk[i])
  const sure = []
  for (let i = 0; i < e.length - 1; i++) if (e[i].value && !e[i + 1].value) sure.push(e[i + 1].t - e[i].t)
  return { sayi: yuk.length, aralik, sure, ort: aralik.length ? aralik.reduce((a, b) => a + b, 0) / aralik.length : 0 }
}

// Ölçüm başına basılan satırı (regex ile) saydıkça u.cm'yi seq[k] yapar; seq bitince döner.
function diziyleSur(sim, u, seq, desen) {
  u.cm = seq[0]
  const say = () => (sim.serial.match(desen) || []).length
  let guard = 0
  while (say() < seq.length) {
    sim.run(5)
    const k = say()
    if (k < seq.length) u.cm = seq[k]
    assert.ok(++guard < 100000, 'dizi tamamlanamadı')
  }
  sim.run(80)
}

const ortalama = (a) => a.reduce((x, y) => x + y, 0) / a.length
const medyan = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]

export default {
  // 36: tablo ve formül
  ses_mesafe_tablosu(sim) {
    sim.run(200)
    const beklenen = [[583, 10.0], [2915, 50.0], [5830, 100.0], [11660, 200.0], [23320, 400.0]]
    const satirlar = sayilar(sim.serial)
    assert.equal(satirlar.length, beklenen.length, `5 satır bekleniyordu: ${yaz(sim)}`)
    beklenen.forEach(([us, cm], i) => {
      const m = satirlar[i].match(/^sure=(\d+) us -> ([\d.]+) cm$/)
      assert.ok(m, `satır biçimi bozuk: ${satirlar[i]}`)
      assert.equal(Number(m[1]), us)
      assert.ok(Math.abs(Number(m[2]) - cm) < 0.3, `${us} us için ${cm} cm bekleniyordu, ${m[2]}`)
      const formul = (us * 0.0343) / 2
      assert.ok(Math.abs(Number(m[2]) - formul) < 0.06, `formül ${formul.toFixed(2)}, çıktı ${m[2]}`)
    })
  },

  ses_sicaklik(sim) {
    sim.run(600)
    const satirlar = sayilar(sim.serial)
    assert.equal(satirlar.length, 5, `5 satır bekleniyordu: ${yaz(sim)}`)
    const sicakliklar = [0, 10, 20, 30, 40]
    sicakliklar.forEach((T, i) => {
      const m = satirlar[i].match(/^T=(-?\d+) C  c=([\d.]+) m\/s  gercek 100 cm -> ([\d.]+) cm$/)
      assert.ok(m, `satır biçimi bozuk: ${satirlar[i]}`)
      const c = 331.3 + 0.606 * T
      assert.equal(Number(m[1]), T)
      assert.ok(Math.abs(Number(m[2]) - c) < 0.02, `T=${T}: c=${c.toFixed(2)} bekleniyordu, ${m[2]}`)
      const okunan = (100 * 343) / c
      assert.ok(Math.abs(Number(m[3]) - okunan) < 0.11, `T=${T}: ${okunan.toFixed(1)} bekleniyordu, ${m[3]}`)
    })
    // dersteki sayısal iddialar
    assert.ok(/T=20 C  c=343\.4\d m\/s/.test(sim.serial), `20 C'de c ~343,42: ${yaz(sim)}`)
    assert.ok(/T=0 C  c=331\.30 m\/s  gercek 100 cm -> 103\.5 cm/.test(sim.serial), `0 C'de 103,5 cm: ${yaz(sim)}`)
    assert.ok(/T=40 C  c=355\.54 m\/s  gercek 100 cm -> 96\.5 cm/.test(sim.serial), `40 C'de 96,5 cm: ${yaz(sim)}`)
  },

  // 37: pulseIn, tetik darbesi, zaman aşımı
  mesafe_pulsein(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 100 })
    sim.run(1000)
    const satirlar = sayilar(sim.serial)
    const son = satirlar.at(-1)
    const m = son.match(/^sure=(\d+) us  mesafe=([\d.]+) cm$/)
    assert.ok(m, `ölçüm satırı bekleniyordu: ${yaz(sim)}`)
    assert.ok(Math.abs(Number(m[2]) - 100) < 1.5, `100 cm bekleniyordu, ${m[2]}`)
    assert.ok(Math.abs(Number(m[1]) - 5820) < 80, `~5820 us bekleniyordu, ${m[1]}`)
    // tetik darbesi ~10 us
    const trig = sim.pulseWidthsUs(9, 0, sim.nowMs())
    assert.ok(trig.length >= 4, 'TRIG darbeleri bekleniyordu')
    for (const w of trig) assert.ok(w >= 9 && w <= 13, `TRIG ~10 us olmalı, ${w.toFixed(1)} us`)
    // 25 cm
    u.cm = 25
    sim.serial = ''
    sim.run(600)
    const m2 = sayilar(sim.serial).at(-1).match(/^sure=(\d+) us  mesafe=([\d.]+) cm$/)
    assert.ok(m2 && Math.abs(Number(m2[2]) - 25) < 1, `25 cm bekleniyordu: ${yaz(sim)}`)
    // Menzil dışı: yansıma yok, 0 cm yazılmamalı; döngü zaman aşımı yüzünden ~230 ms
    u.cm = 500
    sim.serial = ''
    sim.run(2000)
    assert.ok(/Yansima yok/.test(sim.serial), `yansıma yok bekleniyordu: ${yaz(sim)}`)
    assert.ok(!/mesafe=0\.0/.test(sim.serial), '0 cm yazılmamalıydı')
    const tur = sayilar(sim.serial).length
    assert.ok(tur >= 8 && tur <= 9, `2 sn'de ~8,7 tur (200+30 ms): ${tur}`)
    // 2 cm altı
    u.cm = 1
    sim.serial = ''
    sim.run(500)
    assert.ok(/Yansima yok/.test(sim.serial), '1 cm: yankı yok bekleniyordu')
  },

  mesafe_fonksiyon_led(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 100 })
    sim.run(500)
    assert.equal(sim.read(13), false, '100 cm: LED sönük olmalı')
    u.cm = 29
    sim.run(300)
    assert.equal(sim.read(13), true, '29 cm: LED yanmalı')
    u.cm = 31
    sim.run(300)
    assert.equal(sim.read(13), false, '31 cm: LED sönmeli')
    // yankı yok: -1, LED yanmamalı
    u.cm = 500
    sim.serial = ''
    sim.run(300)
    assert.equal(sim.read(13), false, 'yankı yok: LED yanmamalı')
    assert.ok(/-1\.00/.test(sim.serial), `yankı yokken -1 yazılmalı: ${yaz(sim)}`)
    // ölçüm aralığı ~100 ms
    u.cm = 100
    const t0 = sim.nowMs()
    sim.run(1000)
    const trig = sim.pinEdges(9, t0, t0 + 1000).filter((e) => e.value).map((e) => e.t)
    const ort = (trig.at(-1) - trig[0]) / (trig.length - 1)
    assert.ok(Math.abs(ort - 100) < 3, `ölçümler 100 ms arayla olmalı, ${ort.toFixed(1)} ms`)
  },

  // NewPing: kütüphane kontrol edilir
  newping_ornek(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 100 })
    sim.run(600)
    const m = sayilar(sim.serial).at(-1).match(/^sure=(\d+) us  mesafe=([\d.]+) cm$/)
    assert.ok(m, `ölçüm satırı bekleniyordu: ${yaz(sim)}`)
    assert.ok(Math.abs(Number(m[2]) - 100) < 2, `100 cm bekleniyordu, ${m[2]}`)
    u.cm = 500
    sim.serial = ''
    sim.run(600)
    assert.ok(/sure=0 us  mesafe=0\.0 cm/.test(sim.serial), `menzil dışı: süre 0 bekleniyordu: ${yaz(sim)}`)
  },

  // 38: ortalama bozulur, medyan aykırıyı atar
  ortalama_medyan_dizi(sim) {
    sim.run(200)
    const satirlar = sayilar(sim.serial)
    assert.equal(satirlar.length, 4, `4 satır bekleniyordu: ${yaz(sim)}`)
    const dizi = {
      temiz: [100, 101, 99, 100, 100],
      'bir aykiri': [100, 100, 100, 350, 100],
      'iki aykiri': [100, 350, 100, 350, 100],
      'uc aykiri': [100, 350, 350, 350, 100],
    }
    Object.entries(dizi).forEach(([ad, a], i) => {
      const m = satirlar[i].match(/^(.+) ortalama=([\d.]+) medyan=([\d.]+)$/)
      assert.ok(m && m[1] === ad, `satır ${ad} bekleniyordu: ${satirlar[i]}`)
      assert.ok(Math.abs(Number(m[2]) - ortalama(a)) < 0.06, `${ad}: ortalama ${ortalama(a)} bekleniyordu, ${m[2]}`)
      assert.ok(Math.abs(Number(m[3]) - medyan(a)) < 0.06, `${ad}: medyan ${medyan(a)} bekleniyordu, ${m[3]}`)
    })
    assert.ok(/bir aykiri ortalama=150\.0 medyan=100\.0/.test(sim.serial), 'dersteki 150 / 100 iddiası')
    assert.ok(/iki aykiri ortalama=200\.0 medyan=100\.0/.test(sim.serial), 'dersteki 200 / 100 iddiası')
    assert.ok(/uc aykiri ortalama=250\.0 medyan=350\.0/.test(sim.serial), 'üç aykırıda medyan da yanılır')
  },

  // Canlı sensör: u.cm zamanla aykırı değerli bir dizi izler.
  medyan_kayan(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 100 })
    const seq = [
      100, 100, 100, 100, 100,          // 0-4   : temiz
      350,                              // 5     : tek aykırı
      100, 100, 100, 100,               // 6-9
      350, 100, 350,                    // 10-12 : pencerede iki aykırı
      100, 100, 100, 100,               // 13-16
      350, 350, 350,                    // 17-19 : üç aykırı (medyan yanılır)
      100, 100, 100, 100,               // 20-23
      50, 50, 50, 50, 50, 50,           // 24-29 : gerçek adım (100 -> 50)
      500,                              // 30    : yankı yok (400 sayılır)
      50, 50, 50,                       // 31-33
    ]
    diziyleSur(sim, u, seq, /^ham=/gm)
    const satir = sayilar(sim.serial).map((s) => {
      const m = s.match(/^ham=([\d.]+) ort=([\d.]+) med=([\d.]+)$/)
      assert.ok(m, `satır biçimi bozuk: ${s}`)
      return { ham: Number(m[1]), ort: Number(m[2]), med: Number(m[3]) }
    })
    assert.ok(satir.length >= seq.length, `${seq.length} satır bekleniyordu, ${satir.length}`)
    // Ham değerler dizi ile uyumlu (500 -> yankı yok -> 400)
    seq.forEach((cm, i) => {
      const beklenen = cm > 400 ? 400 : cm
      assert.ok(Math.abs(satir[i].ham - beklenen) < beklenen * 0.02, `ham[${i}] ${beklenen} bekleniyordu, ${satir[i].ham}`)
    })
    // Kayan pencerenin bağımsız modeli ile karşılaştır (pencere ilk okumayla dolu başlar)
    const pencere = Array(5).fill(satir[0].ham)
    satir.slice(0, seq.length).forEach((s, i) => {
      pencere[i % 5] = s.ham
      assert.ok(Math.abs(s.ort - ortalama(pencere)) < 0.2, `ort[${i}] ${ortalama(pencere).toFixed(1)} bekleniyordu, ${s.ort}`)
      assert.ok(Math.abs(s.med - medyan(pencere)) < 0.2, `med[${i}] ${medyan(pencere).toFixed(1)} bekleniyordu, ${s.med}`)
    })
    // Dersteki iddialar
    assert.ok(Math.abs(satir[5].ort - 150) < 3, `tek aykırıda ortalama ~150 olmalı: ${satir[5].ort}`)
    assert.ok(Math.abs(satir[5].med - 100) < 2, `tek aykırıda medyan ~100 kalmalı: ${satir[5].med}`)
    assert.ok(satir[12].ort > 190 && Math.abs(satir[12].med - 100) < 2, `iki aykırıda ortalama ~200, medyan ~100: ${JSON.stringify(satir[12])}`)
    assert.ok(Math.abs(satir[19].med - 350) < 3, `üç aykırıda medyan da yanılır: ${satir[19].med}`)
    // Gecikme: 100 -> 50 adımında medyan 3. örnekte döner
    assert.ok(Math.abs(satir[24].med - 100) < 2 && Math.abs(satir[25].med - 100) < 2, 'adımdan sonra ilk 2 örnekte medyan 100 kalmalı')
    assert.ok(Math.abs(satir[26].med - 50) < 1.5, `3. örnekte medyan 50 olmalı: ${satir[26].med}`)
    // Yankı yok: tek örnek, medyan atar
    assert.ok(Math.abs(satir[30].ham - 400) < 0.01, 'yankı yok 400 olmalı')
    assert.ok(Math.abs(satir[30].med - 50) < 1.5, `yankı yokken medyan 50 kalmalı: ${satir[30].med}`)
    // Ölçümler ~55 ms arayla
    const trig = sim.pinEdges(9, 0, sim.nowMs()).filter((e) => e.value).map((e) => e.t)
    const aralik = (trig.at(-1) - trig[1]) / (trig.length - 2)
    assert.ok(aralik > 50 && aralik < 70, `ölçüm aralığı ~55 ms olmalı, ${aralik.toFixed(1)} ms`)
  },

  // 39: açıya göre değişen mesafe, açı:mesafe satırları, en yakın nesne
  sonar_tarama(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 200 })
    // 120 derecede 35 cm'de nesne, 90 ve 150'de 80 cm, kalan 200 cm
    const profil = (a) => (Math.abs(a - 120) <= 15 ? 35 : Math.abs(a - 120) <= 45 ? 80 : 200)
    const gorulen = new Set()
    let guard = 0
    while (!/EN YAKIN/.test(sim.serial)) {
      const a = servoAci(sim)
      if (a !== null) { u.cm = profil(a); gorulen.add(Math.round(a / 30) * 30) }
      sim.run(5)
      assert.ok(++guard < 4000, `tarama bitmedi: ${yaz(sim)}`)
    }
    sim.run(50)
    const satirlar = sayilar(sim.serial)
    const olc = satirlar.filter((s) => /^\d+:/.test(s)).map((s) => {
      const m = s.match(/^(\d+):([\d.]+)$/)
      assert.ok(m, `"açı:mesafe" biçimi bozuk: ${s}`)
      return { aci: Number(m[1]), cm: Number(m[2]) }
    })
    assert.deepEqual(olc.slice(0, 7).map((x) => x.aci), [0, 30, 60, 90, 120, 150, 180], `açı sırası: ${yaz(sim)}`)
    olc.slice(0, 7).forEach((x) => {
      const b = profil(x.aci)
      assert.ok(Math.abs(x.cm - b) < b * 0.03, `${x.aci} derecede ${b} cm bekleniyordu, ${x.cm}`)
    })
    const son = satirlar.find((s) => /EN YAKIN/.test(s))
    const m = son.match(/^EN YAKIN: (\d+) derece, ([\d.]+) cm$/)
    assert.ok(m, `EN YAKIN satırı bozuk: ${son}`)
    assert.equal(Number(m[1]), 120, `en yakın nesne 120 derecede olmalı: ${son}`)
    assert.ok(Math.abs(Number(m[2]) - 35) < 1.5, `35 cm bekleniyordu: ${son}`)
    // servo gerçekten bu açılara gitti: darbe genişlikleri 544..2400 us aralığında
    const w = sim.pulseWidthsUs(6, 0, sim.nowMs())
    assert.ok(Math.min(...w) < 570 && Math.max(...w) > 2370, `servo 0..180 aralığını taramalı: ${Math.min(...w)}..${Math.max(...w)} us`)
    assert.ok([0, 30, 60, 90, 120, 150, 180].every((a) => gorulen.has(a)), `görülen açılar: ${[...gorulen]}`)
  },

  // Başka bir yerde nesne olunca en yakın o açıda bulunur; hiç nesne yoksa "nesne yok"
  sonar_isaret(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 200 })
    const nesneAci = 60
    const profil = (a) => (Math.abs(a - nesneAci) <= 15 ? 40 : 250)
    let guard = 0
    while (!/isaret=/.test(sim.serial)) {
      const a = servoAci(sim)
      if (a !== null) u.cm = profil(a)
      sim.run(5)
      assert.ok(++guard < 5000, `isaret satırı gelmedi: ${yaz(sim)}`)
    }
    sim.run(1200)
    const a = servoAci(sim)
    assert.ok(Math.abs(a - nesneAci) < 1.5, `servo ${nesneAci} derecede kalmalı, ${a?.toFixed(1)}`)
    const t = sim.nowMs()
    const son = sayilar(sim.serial).at(-1)
    const m = son.match(/^isaret=(\d+) mesafe=([\d.]+)$/)
    assert.ok(m, `satır biçimi bozuk: ${son}`)
    assert.equal(Number(m[1]), nesneAci)
    assert.ok(Math.abs(Number(m[2]) - 40) < 1.5, `40 cm bekleniyordu: ${son}`)
    // servo artık hareket etmiyor
    const w = sim.pulseWidthsUs(6, t - 400, t)
    assert.ok(w.length >= 15 && Math.max(...w) - Math.min(...w) < 4, 'tarama bitince servo sabit kalmalı')
    // nesne yönü değişince canlı mesafe de değişir
    u.cm = 90
    sim.serial = ''
    sim.run(900)
    const m2 = sayilar(sim.serial).at(-1).match(/^isaret=(\d+) mesafe=([\d.]+)$/)
    assert.ok(m2 && Math.abs(Number(m2[2]) - 90) < 2, `canlı mesafe 90 bekleniyordu: ${yaz(sim)}`)
  },

  // 40: proje
  park_sensoru(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 150 })
    const lcd = sim.lcdI2C({ address: 0x27 })
    sim.run(1600)                                   // LCD başlangıcı ~1 sn
    const satir = (i) => lcd.text[i]
    const sayi = () => {
      const m = satir(0).match(/^Mesafe:\s+([\d.]+) cm$/)
      assert.ok(m, `ekran 1. satır biçimi: ${JSON.stringify(satir(0))}`)
      return Number(m[1])
    }
    const bekle = (ms = 700) => sim.run(ms)

    // 1) Uzak: sessiz, yeşil
    bekle()
    assert.equal(satir(0).length, 16)
    assert.ok(Math.abs(sayi() - 150) < 2.5, `150 cm bekleniyordu: ${satir(0)}`)
    assert.equal(satir(1).trim(), 'GUVENLI')
    let t = sim.nowMs()
    sim.run(1500)
    assert.equal(sim.pinEdges(8, t, sim.nowMs()).length, 0, '150 cm: buzzer sessiz olmalı')
    assert.equal(sim.read(8), false)
    assert.deepEqual([11, 12, 13].map((p) => sim.read(p)), [true, false, false], '150 cm: yalnız yeşil')

    // 2) 60 cm: yavaş bip, aralık map ile 450 ms, bip ~40 ms; LED yeşil
    u.cm = 60
    bekle(800)
    assert.ok(Math.abs(sayi() - 60) < 1.5, `60 cm bekleniyordu: ${satir(0)}`)
    assert.equal(satir(1).trim(), 'GUVENLI')
    assert.deepEqual([11, 12, 13].map((p) => sim.read(p)), [true, false, false], '60 cm: yalnız yeşil')
    t = sim.nowMs()
    sim.run(5000)
    const b60 = bipler(sim, 8, t, sim.nowMs())
    assert.ok(b60.sayi >= 9, `60 cm: ~11 bip bekleniyordu, ${b60.sayi}`)
    assert.ok(Math.abs(b60.ort - 450) < 35, `60 cm: bip aralığı ~450 ms, ${b60.ort.toFixed(0)} ms`)
    for (const s of b60.sure) assert.ok(s >= 38 && s <= 60, `bip ~40 ms olmalı, ${s.toFixed(1)} ms`)

    // 3) 30 cm: sıklaşır (~180 ms), sarı, YAKLASIYOR
    u.cm = 30
    bekle(800)
    assert.equal(satir(1).trim(), 'YAKLASIYOR')
    assert.deepEqual([11, 12, 13].map((p) => sim.read(p)), [false, true, false], '30 cm: yalnız sarı')
    t = sim.nowMs()
    sim.run(3000)
    const b30 = bipler(sim, 8, t, sim.nowMs())
    assert.ok(Math.abs(b30.ort - 178) < 30, `30 cm: bip aralığı ~178 ms, ${b30.ort.toFixed(0)} ms`)
    assert.ok(b30.ort < b60.ort - 200, 'mesafe azalınca bip sıklaşmalı')

    // 4) 22 cm: daha da sık (~110 ms)
    u.cm = 22
    bekle(800)
    t = sim.nowMs()
    sim.run(2000)
    const b22 = bipler(sim, 8, t, sim.nowMs())
    assert.ok(b22.ort < b30.ort - 40, `22 cm daha sık olmalı: ${b22.ort.toFixed(0)} / ${b30.ort.toFixed(0)}`)
    assert.ok(b22.ort > 95 && b22.ort < 140, `22 cm: ~110 ms bekleniyordu, ${b22.ort.toFixed(0)} ms`)

    // 5) 15 cm: sürekli ses, kırmızı, DUR!  (kenar yok)
    u.cm = 15
    bekle(600)
    assert.equal(satir(1).trim(), 'DUR!')
    assert.equal(sim.read(8), true, '15 cm: buzzer sürekli HIGH olmalı')
    assert.deepEqual([11, 12, 13].map((p) => sim.read(p)), [false, false, true], '15 cm: yalnız kırmızı')
    t = sim.nowMs()
    sim.run(1500)
    assert.equal(sim.pinEdges(8, t, sim.nowMs()).length, 0, '15 cm: buzzer kenarsız (sürekli) olmalı')
    assert.equal(sim.read(8), true)
    assert.ok(Math.abs(sayi() - 15) < 1, `15 cm bekleniyordu: ${satir(0)}`)

    // 6) Tepki süresi: 15 -> 150 cm, 600 ms içinde buzzer susmalı ve ekran güncellenmeli
    u.cm = 150
    sim.run(600)
    assert.equal(sim.read(8), false, '150 cm: buzzer susmalı')
    assert.equal(satir(1).trim(), 'GUVENLI')
    assert.ok(Math.abs(sayi() - 150) < 2.5, `150 cm bekleniyordu: ${satir(0)}`)

    // 7) Tek aykırı değer bipi bozmaz: 60 cm'de iken kısa bir 15 cm darbesi (tek ölçüm)
    u.cm = 60
    bekle(900)
    t = sim.nowMs()
    // tek ölçümlük bozulma: trig düşen kenar sayısıyla tek ölçümde 15 cm yap
    const n0 = sim.pinEdges(9, 0, Infinity).filter((e) => !e.value).length
    u.cm = 15
    while (sim.pinEdges(9, 0, Infinity).filter((e) => !e.value).length < n0 + 1) sim.run(1)
    u.cm = 60                                       // yalnız 1 ölçüm 15 cm oldu
    sim.run(1500)
    assert.equal(sim.read(13), false, 'tek aykırı ölçüm kırmızıyı yakmamalı')
    assert.equal(satir(1).trim(), 'GUVENLI')
    const bAyk = bipler(sim, 8, t, sim.nowMs())
    assert.ok(bAyk.aralik.every((a) => a > 300), `tek aykırı değer bip ritmini bozmamalı: ${bAyk.aralik.map((a) => a.toFixed(0))}`)

    // 8) Yankı yok (400 cm üstü): sessiz, '---'
    u.cm = 500
    bekle(900)
    assert.equal(satir(0), 'Mesafe:   --- cm', `yankı yok ekranı: ${JSON.stringify(satir(0))}`)
    assert.equal(sim.read(8), false)
    t = sim.nowMs()
    sim.run(1000)
    assert.equal(sim.pinEdges(8, t, sim.nowMs()).length, 0, 'yankı yokken buzzer sessiz olmalı')
    assert.deepEqual([11, 12, 13].map((p) => sim.read(p)), [true, false, false])
  },
}

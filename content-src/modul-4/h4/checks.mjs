import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

// --- Yardımcılar -----------------------------------------------------------

// Deterministik "gürültü" dizisi (rastgele değil: her çalıştırmada aynı).
const G = [1, -1, 0.5, -0.5, 1, -0.25, 0.75, -1]

/** NTC bölücüsünde (5 V - 10k - A2 - NTC - GND) verilen sıcaklığın A2 gerilimi (beta = 3950). */
function ntcVolt(derece) {
  const r = 10000 * Math.exp(3950 * (1 / (derece + 273.15) - 1 / 298.15))
  return (5 * r) / (10000 + r)
}

/** Kanalı `taban` çevresinde `genlik` volt dalgalandırır; her adım `adim` ms. */
function gurultulu(sim, kanal, taban, genlik, ms, adim = 20) {
  for (let t = 0, i = 0; t < ms; t += adim, i++) {
    sim.analog(kanal, taban + genlik * G[i % G.length])
    sim.run(adim)
  }
}

/** Seri çıktıda `desen`in (g bayraklı) tüm eşleşmelerini döndürür. */
const hepsi = (sim, desen) => [...sim.serial.matchAll(desen)]
const sonSayi = (sim, desen) => {
  const m = hepsi(sim, desen)
  assert.ok(m.length > 0, `seri çıktıda ${desen} yok: ${JSON.stringify(sim.serial.slice(-200))}`)
  return Number(m.at(-1)[1])
}

// --- Ders 51: ışık sensörü -------------------------------------------------

const LDR_TABAN = 2.3      // ~471: tek eşiğin (473) tam yanı
const LDR_GENLIK = 0.2     // ~ +-41 birim: tepeden tepeye ~82 < histerezis bandı (100)

function ldrKenar(sim, from, to) {
  return sim.pinEdges(13, from, to).length
}

// --- Ders 52: ses sensörü --------------------------------------------------

/** Ortam sesi: 2,5 V baz çevresinde küçük gürültü (~+-6 birim). */
function ortam(sim, ms) {
  for (let t = 0, i = 0; t < ms; t += 5, i++) {
    sim.analog(0, 2.5 + 0.03 * G[i % G.length])
    sim.run(5)
  }
}

/** Baz seviyeden `ofset` volt sapan, `ms` süren ses darbesi. `salin`: sinyal 2 ms'de bir yön değiştirir. */
function darbe(sim, ofset, ms, salin = false) {
  if (salin) {
    for (let t = 0, i = 0; t < ms; t += 2, i++) {
      sim.analog(0, 2.5 + (i % 2 ? -ofset : ofset))
      sim.run(2)
    }
  } else {
    sim.analog(0, 2.5 + ofset)
    sim.run(ms)
  }
  sim.analog(0, 2.5)
}

const ALKIS_VOLT = 1.7     // ~ +348 birim (eşik 150)

// --- Ders 55 yardımcıları --------------------------------------------------

function hiz(sim, pin, from, to) {
  // HIGH darbelerin başlangıç aralıkları (ms)
  const yuk = sim.pinEdges(pin, from, to).filter((e) => e.value).map((e) => e.t)
  return yuk.slice(1).map((t, i) => t - yuk[i])
}

export default {
  // --- 51 ---------------------------------------------------------------
  ldr_tek_esik(sim) {
    gurultulu(sim, 1, LDR_TABAN, LDR_GENLIK, 2000)
    const kenar = ldrKenar(sim, 0, sim.nowMs())
    assert.ok(kenar >= 60, `tek eşikte gürültü LED'i çok titretmeliydi, ${kenar} kenar`)
    const gecis = sonSayi(sim, /gecis=(\d+)/g)
    assert.ok(gecis >= 40, `gecis sayacı büyümeliydi: ${gecis}`)
    // Gerçek karanlık / aydınlıkta yine doğru çalışır
    sim.analog(1, 1.0); sim.run(100)
    assert.equal(sim.read(13), true, 'karanlıkta LED yanmalı')
    sim.analog(1, 4.0); sim.run(100)
    assert.equal(sim.read(13), false, 'aydınlıkta LED sönmeli')
  },

  ldr_histerezis(sim) {
    // LED sönükken eşik çevresindeki gürültü hiçbir şey yapmamalı
    sim.analog(1, 3.5); sim.run(200)
    const t0 = sim.nowMs()
    gurultulu(sim, 1, LDR_TABAN, LDR_GENLIK, 2000)
    assert.equal(ldrKenar(sim, t0, sim.nowMs()), 0, 'sönükken gürültü LED\'i yakmamalı')
    assert.equal(sim.read(13), false)
    // Gerçekten karanlık: yanar
    sim.analog(1, 1.4); sim.run(100)
    assert.equal(sim.read(13), true, '1,4 V (~287) karanlık: LED yanmalı')
    // Yanıkken aynı gürültü LED'i söndürmemeli
    const t1 = sim.nowMs()
    gurultulu(sim, 1, LDR_TABAN, LDR_GENLIK, 2000)
    assert.equal(ldrKenar(sim, t1, sim.nowMs()), 0, 'yanıkken gürültü LED\'i söndürmemeli')
    assert.equal(sim.read(13), true)
    // Gerçekten aydınlık: söner
    sim.analog(1, 3.5); sim.run(100)
    assert.equal(sim.read(13), false, 'aydınlıkta LED sönmeli')
    sim.run(1000)
    assert.equal(sonSayi(sim, /gecis=(\d+)/g), 2, 'toplam 2 geçiş (bir yanma, bir sönme) olmalıydı')
    // Ölü bölgenin içinde ve sınırlarında
    sim.analog(1, 2.45); sim.run(100)            // ~502: bantta, sönük kalır
    assert.equal(sim.read(13), false)
    sim.analog(1, 2.0); sim.run(100)             // ~409 < 423: yanar
    assert.equal(sim.read(13), true)
    sim.analog(1, 2.45); sim.run(100)            // ~502: bantta, yanık kalır
    assert.equal(sim.read(13), true)
  },

  ldr_otomatik_esik(sim, kaynak) {
    // 3 sn öğrenme: ışık 1,0 V (aydınlık) ile 4,0 V (karanlık) arasında gidip gelir
    for (let k = 0; k < 30; k++) { sim.analog(1, k % 2 ? 1.0 : 4.0); sim.run(100) }
    sim.run(200)
    const m = sim.serial.match(/enAz=(\d+) enCok=(\d+) acma=(\d+) kapama=(\d+)/)
    assert.ok(m, `öğrenme çıktısı yok: ${JSON.stringify(sim.serial)}`)
    const [enAz, enCok, acma, kapama] = m.slice(1).map(Number)
    assert.ok(Math.abs(enAz - 205) <= 3, `enAz ~205 bekleniyordu: ${enAz}`)
    assert.ok(Math.abs(enCok - 818) <= 3, `enCok ~818 bekleniyordu: ${enCok}`)
    assert.equal(acma, enAz + Math.floor(((enCok - enAz) * 4) / 10), 'acma = enAz + aralik*0,4')
    assert.equal(kapama, enAz + Math.floor(((enCok - enAz) * 6) / 10), 'kapama = enAz + aralik*0,6')
    assert.ok(!/UYARI/.test(sim.serial), 'geniş aralıkta uyarı olmamalı')
    // Öğrenilen eşiklerle çalışma: acma ~450, kapama ~572
    sim.analog(1, 3.0); sim.run(100)             // ~614
    assert.equal(sim.read(13), false)
    sim.analog(1, 1.8); sim.run(100)             // ~368 < 450
    assert.equal(sim.read(13), true, '1,8 V açma eşiğinin altında: LED yanmalı')
    sim.analog(1, 2.5); sim.run(100)             // ~512: bantta (450-572)
    assert.equal(sim.read(13), true, 'bantta LED yanık kalmalı')
    sim.analog(1, 3.0); sim.run(100)             // ~614 > 572
    assert.equal(sim.read(13), false, '3,0 V kapama eşiğinin üstünde: LED sönmeli')
    // Işık hiç değişmezse uyarı verir
    const sabit = createSim(kaynak, { name: 'ldr_otomatik_esik' })
    sabit.analog(1, 2.0)
    sabit.run(3500)
    assert.ok(/UYARI: isik degisimi cok az/.test(sabit.serial), `sabit ışıkta uyarı bekleniyordu: ${JSON.stringify(sabit.serial)}`)
  },

  // --- 52 ---------------------------------------------------------------
  ses_baz_tepe(sim) {
    ortam(sim, 700)
    const baz = sonSayi(sim, /baz=(\d+)/g)
    assert.ok(baz >= 505 && baz <= 518, `baz ~511 bekleniyordu: ${baz}`)
    ortam(sim, 1000)
    const sessiz = hepsi(sim, /tepe=(\d+)/g).map((m) => Number(m[1]))
    assert.ok(sessiz.length >= 2 && Math.max(...sessiz) < 25, `sessiz ortamda tepe küçük olmalı: ${sessiz}`)
    darbe(sim, ALKIS_VOLT, 40)
    ortam(sim, 600)
    const hepsiTepe = hepsi(sim, /tepe=(\d+)/g).map((m) => Number(m[1]))
    assert.ok(Math.max(...hepsiTepe) >= 330, `alkış tepesi ~348 bekleniyordu: ${hepsiTepe}`)
  },

  alkis_tani(sim) {
    ortam(sim, 700)
    assert.ok(/baz=5\d\d/.test(sim.serial), 'baz yazılmalı')
    const olaylar = () => hepsi(sim, /(ALKIS|UZUN|KISA) sure=(\d+) tepe=(\d+)/g).map((m) => ({ tur: m[1], sure: +m[2], tepe: +m[3] }))

    // 1) Ortam sesi: olay yok
    ortam(sim, 500)
    assert.equal(olaylar().length, 0, 'ortam sesi olay üretmemeli')

    // 2) Gerçek alkış: yüksek tepe, ~40 ms
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 200)
    let o = olaylar()
    assert.equal(o.length, 1, `1 olay bekleniyordu: ${JSON.stringify(o)}`)
    assert.equal(o[0].tur, 'ALKIS')
    assert.ok(o[0].sure >= 35 && o[0].sure <= 45, `süre ~40 ms: ${o[0].sure}`)
    assert.ok(o[0].tepe >= 330 && o[0].tepe <= 360, `tepe ~348: ${o[0].tepe}`)

    // 3) Zayıf ses (konuşma): eşiğin altında, hiç olay yok
    darbe(sim, 0.4, 60); ortam(sim, 200)
    assert.equal(olaylar().length, 1, 'zayıf ses (0,4 V) olay üretmemeli')

    // 4) Çok kısa parazit (1 ms)
    darbe(sim, ALKIS_VOLT, 1); ortam(sim, 200)
    o = olaylar()
    assert.equal(o.length, 2, `kısa parazit bir olay üretmeli: ${JSON.stringify(o)}`)
    assert.equal(o[1].tur, 'KISA')

    // 5) Çok uzun ses (800 ms): alkış değil
    darbe(sim, ALKIS_VOLT, 800); ortam(sim, 200)
    o = olaylar()
    assert.equal(o.length, 3)
    assert.equal(o[2].tur, 'UZUN')
    assert.ok(o[2].sure >= 780 && o[2].sure <= 820, `süre ~800: ${o[2].sure}`)

    // 6) Salınan sinyal (gerçek mikrofon gibi): tek alkış olarak tanınmalı, parçalanmamalı
    darbe(sim, ALKIS_VOLT, 60, true); ortam(sim, 200)
    o = olaylar()
    assert.equal(o.length, 4, `salınan alkış tek olay olmalı: ${JSON.stringify(o)}`)
    assert.equal(o[3].tur, 'ALKIS')
    assert.ok(o[3].sure >= 50 && o[3].sure <= 65, `süre ~58: ${o[3].sure}`)
  },

  alkis_anahtar(sim) {
    const led = () => sim.read(13)
    ortam(sim, 700)
    assert.equal(led(), false, 'başta LED sönük')
    const ciftAlkis = (aralik) => {   // iki alkışın başlangıçları `aralik` ms arayla
      darbe(sim, ALKIS_VOLT, 40)
      ortam(sim, aralik - 40)
      darbe(sim, ALKIS_VOLT, 40)
      ortam(sim, 150)
    }

    // 1) Tek alkış: bir şey olmaz
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 3500)   // ARALIK (3000) geçsin: bu alkış unutulur
    assert.equal(led(), false, 'tek alkış LED\'i değiştirmemeli')

    // 2) İki alkış 450 ms arayla: LED yanar
    ciftAlkis(450)
    assert.equal(led(), true, 'iki alkış LED\'i yakmalı')
    assert.ok(/LED acik/.test(sim.serial))
    ortam(sim, 1500)

    // 3) İki alkış daha: LED söner
    ciftAlkis(450)
    assert.equal(led(), false, 'iki alkış daha LED\'i söndürmeli')
    assert.ok(/LED kapali/.test(sim.serial))
    ortam(sim, 1500)

    // 4) Alkışlar 3500 ms arayla (ARALIK = 3000): toggle yok; ikincisi yeni "ilk alkış" olur
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 3460)
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 150)
    assert.equal(led(), false, '3,5 sn arayla iki alkış sayılmamalı')
    //    hemen ardından bir alkış daha: son ikisi 450 ms arayla -> LED yanar
    ortam(sim, 260)
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 150)
    assert.equal(led(), true, 'önceki alkış "ilk alkış" sayılıp yeni alkışla çift olmalı')
    ortam(sim, 1500)

    // 5) Araya uzun ses girerse dizi sıfırlanır
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 300)
    darbe(sim, ALKIS_VOLT, 600); ortam(sim, 100)
    darbe(sim, ALKIS_VOLT, 40); ortam(sim, 200)
    assert.equal(led(), true, 'uzun sesten sonra bu alkış yalnızca ilk alkış: LED değişmemeli')
    ortam(sim, 3500)

    // 6) Zayıf sesler (0,4 V) ve kısa parazitler (1 ms) alkış sayılmaz
    darbe(sim, 0.4, 40); ortam(sim, 300); darbe(sim, 0.4, 40); ortam(sim, 200)
    darbe(sim, ALKIS_VOLT, 1); ortam(sim, 300); darbe(sim, ALKIS_VOLT, 1); ortam(sim, 200)
    assert.equal(led(), true, 'zayıf ve kısa sesler LED\'i değiştirmemeli')

    // 7) Çok yüksek tek ses alkış değil, süresi uzunsa; ama salınan gerçek alkış çifti çalışır
    darbe(sim, ALKIS_VOLT, 60, true); ortam(sim, 300)
    darbe(sim, ALKIS_VOLT, 60, true); ortam(sim, 200)
    assert.equal(led(), false, 'salınan iki alkış LED\'i söndürmeli')

    // Toplam: yan, sön, yan, sön = 4 değişim (t=0'daki pinMode kenarı sayılmaz)
    assert.equal(sim.pinEdges(13, 1, sim.nowMs()).length, 4, 'LED toplam 4 kez değişmeliydi')
  },

  // --- 53 ---------------------------------------------------------------
  mq2_isinma_baz(sim) {
    sim.analog(3, 0.9)
    sim.run(2000)
    assert.ok(/Isiniyor/.test(sim.serial), 'ısınma mesajı yazılmalı')
    assert.ok(!/baz=/.test(sim.serial), 'ısınma bitmeden baz yazılmamalı')
    sim.run(3000)                                      // t = 5000: ısınma bitti
    const w = sim.wave(12, 300, 4800)
    assert.ok(Math.abs(w.hz - 2) < 0.3, `ısınırken durum LED'i 2 Hz yanıp sönmeli: ${w.hz.toFixed(2)}`)
    sim.run(1500)
    const baz = sonSayi(sim, /baz=(\d+)/g)
    assert.ok(Math.abs(baz - 184) <= 3, `baz ~184 (0,9 V) bekleniyordu: ${baz}`)
    assert.equal(sim.read(12), false, 'ısınma bitince durum LED\'i sönmeli')
    // Gaz artışı: fark baza göre hesaplanır
    sim.analog(3, 2.0)
    sim.run(1200)
    const fark = sonSayi(sim, /fark=(-?\d+)/g)
    assert.ok(Math.abs(fark - (409 - baz)) <= 3, `fark ~${409 - baz} bekleniyordu: ${fark}`)
  },

  mq2_bagil_alarm(sim) {
    sim.analog(3, 0.9)
    sim.run(7000)
    const baz = sonSayi(sim, /baz=(\d+)/g)
    assert.ok(Math.abs(baz - 184) <= 3, `baz ~184: ${baz}`)
    assert.equal(sim.read(13), false, 'temiz havada alarm yok')
    assert.ok(/oran=1\.0\d alarm=0/.test(sim.serial), `oran ~1,00: ${JSON.stringify(sim.serial.slice(-60))}`)

    // Tek kısa sıçrama (40 ms, tek örnek): alarm vermemeli
    const t0 = sim.nowMs()
    sim.analog(3, 3.0); sim.run(40); sim.analog(3, 0.9)
    sim.run(1500)
    assert.equal(sim.pinEdges(13, t0, sim.nowMs()).length, 0, 'tek sıçrama alarm vermemeli')

    // Hafif artış (oran ~1,45): alarm eşiğinin altında
    sim.analog(3, 1.3); sim.run(1500)
    assert.equal(sim.read(13), false, 'oran 1,45: alarm yok')
    assert.ok(/oran=1\.4\d alarm=0/.test(sim.serial), `oran ~1,45: ${JSON.stringify(sim.serial.slice(-60))}`)

    // Belirgin artış (oran ~1,67): alarm
    sim.analog(3, 1.5); sim.run(1500)
    assert.equal(sim.read(13), true, 'oran 1,67: alarm olmalı')
    assert.ok(/alarm=1/.test(sim.serial.slice(-30)))

    // Histerezis: oran 1,22 (1,2 üstü): alarm sürer
    sim.analog(3, 1.1); sim.run(1500)
    assert.equal(sim.read(13), true, 'oran 1,22: histerezis bandı, alarm sürmeli')

    // Oran 1,11: biter
    sim.analog(3, 1.0); sim.run(1500)
    assert.equal(sim.read(13), false, 'oran 1,11: alarm bitmeli')
  },

  // --- 54 ---------------------------------------------------------------
  alev_seviye(sim) {
    const v = (volt, ms = 400) => { sim.analog(1, volt); sim.run(ms) }
    const durum = () => [sim.read(12), sim.read(13), sim.read(8)].map(Number).join('')
    v(4.6)                                     // alev yok: şiddet ~82
    assert.equal(durum(), '000', 'alev yok: hepsi kapalı')
    assert.equal(sim.serial, '', 'NORMAL\'de seri çıktı olmamalı')

    v(3.3)                                     // şiddet ~348: UYARI
    assert.equal(durum(), '100', 'UYARI: sarı LED')
    assert.ok(/ALEV: UYARI siddet=34\d/.test(sim.serial), JSON.stringify(sim.serial))

    // Histerezis bandı içinde (şiddet 266-297): UYARI'da kalır, titremez
    const t0 = sim.nowMs()
    for (let i = 0; i < 40; i++) { sim.analog(1, i % 2 ? 3.55 : 3.7); sim.run(20) }
    assert.equal(sim.pinEdges(12, t0, sim.nowMs()).length, 0, 'bant içinde sarı LED değişmemeli')
    assert.equal(durum(), '100')

    v(3.9)                                     // şiddet ~225 < 250: NORMAL
    assert.equal(durum(), '000', 'kapama eşiğinin altı: NORMAL')

    v(1.0)                                     // şiddet ~818: doğrudan TEHLIKE
    assert.equal(durum(), '011', 'TEHLIKE: kırmızı LED + buzzer')
    assert.ok(/ALEV: TEHLIKE siddet=81\d/.test(sim.serial), JSON.stringify(sim.serial))

    v(2.5)                                     // şiddet ~511 >= 500: TEHLIKE sürer
    assert.equal(durum(), '011', 'tehlike kapama eşiğinin üstü: TEHLIKE sürmeli')
    v(2.7)                                     // şiddet ~471: UYARI'ya iner
    assert.equal(durum(), '100', 'TEHLIKE\'den UYARI\'ya inmeli')
    v(4.6)
    assert.equal(durum(), '000', 'alev gidince NORMAL')

    const satirlar = sim.serial.trim().split('\n').map((s) => s.trim().split(' ').slice(0, 2).join(' '))
    assert.deepEqual(satirlar, ['ALEV: UYARI', 'ALEV: NORMAL', 'ALEV: TEHLIKE', 'ALEV: UYARI', 'ALEV: NORMAL'])
  },

  iki_kanal_seviye(sim) {
    sim.analog(1, 4.6); sim.analog(3, 0.9)
    sim.run(500)
    const baz = sonSayi(sim, /gazBaz=(\d+)/g)
    assert.ok(Math.abs(baz - 184) <= 2, `gazBaz ~184: ${baz}`)
    const durum = () => [sim.read(12), sim.read(13), sim.read(8)].map(Number).join('')
    const gaz = (v) => { sim.analog(3, v); sim.run(300) }
    const alev = (v) => { sim.analog(1, v); sim.run(300) }
    assert.equal(durum(), '000')

    gaz(1.5)                                   // 307 >= 276: gaz UYARI
    assert.equal(durum(), '100')
    assert.ok(/GAZ: UYARI deger=30\d/.test(sim.serial), JSON.stringify(sim.serial))
    alev(1.0)                                  // alev TEHLIKE: genel TEHLIKE
    assert.equal(durum(), '011', 'alev tehlikesi gaz uyarısından önce gelir')
    alev(4.6)                                  // alev gitti: gaz hâlâ UYARI
    assert.equal(durum(), '100')
    gaz(2.6)                                   // 532 >= 460: gaz TEHLIKE
    assert.equal(durum(), '011')
    gaz(1.9)                                   // 389 >= 368: histerezis, TEHLIKE sürer
    assert.equal(durum(), '011', 'gaz tehlike histerezisi')
    gaz(1.6)                                   // 327 < 368: UYARI'ya iner
    assert.equal(durum(), '100')
    gaz(1.2)                                   // 246 >= 230: UYARI sürer
    assert.equal(durum(), '100', 'gaz uyarı histerezisi')
    gaz(0.9)                                   // 184 < 230: NORMAL
    assert.equal(durum(), '000')

    assert.ok(/ALEV: TEHLIKE/.test(sim.serial) && /GAZ: TEHLIKE/.test(sim.serial))
    const gazSatirlari = sim.serial.split('\n').filter((s) => s.startsWith('GAZ:')).map((s) => s.split(' ')[1])
    assert.deepEqual(gazSatirlari, ['UYARI', 'TEHLIKE', 'UYARI', 'NORMAL'])
  },

  // --- 55 ---------------------------------------------------------------
  yangin_gaz_paneli(sim) {
    const lcd = sim.lcdI2C({ address: 0x27 })
    sim.analog(1, 4.6)                         // alev yok
    sim.analog(2, ntcVolt(25))                 // oda sıcaklığı
    sim.analog(3, 0.9)                         // temiz hava
    const gec = (ms) => sim.run(ms)
    const led = () => [sim.read(11), sim.read(12), sim.read(13)].map(Number).join('')
    const satir = (n) => lcd.text[n].trimEnd()

    // --- ISINMA: LCD "ISINMA", yeşil LED yanıp söner, röle kapalı
    gec(3000)
    assert.ok(satir(0).startsWith('ISINMA'), `ısınma ekranı: ${JSON.stringify(lcd.text)}`)
    const w = sim.wave(11, 1500, 3900)
    assert.ok(Math.abs(w.hz - 2) < 0.4, `ısınmada yeşil LED 2 Hz: ${w.hz.toFixed(2)}`)
    assert.equal(sim.read(7), false)
    gec(4000)                                  // t = 7000: panel hazır
    const baz = sonSayi(sim, /gazBaz=(\d+)/g)
    assert.ok(Math.abs(baz - 184) <= 3, `gazBaz ~184: ${baz}`)

    // --- 1) NORMAL
    assert.equal(led(), '100', 'NORMAL: yalnız yeşil')
    assert.equal(satir(0), 'DURUM: NORMAL')
    assert.equal(satir(1), 'G:N A:N I:N')
    assert.equal(sim.read(7), false, 'NORMAL: fan kapalı')
    assert.equal(sim.pinEdges(8, 5000, sim.nowMs()).length, 0, 'NORMAL: buzzer sessiz')
    assert.ok(!/DURUM: (UYARI|TEHLIKE)/.test(sim.serial))

    // --- 2) Gaz artar: UYARI (sarı, yavaş bip, fan açık)
    sim.analog(3, 1.5)                         // ~307, oran 1,67
    gec(500)
    assert.equal(led(), '010', 'UYARI: yalnız sarı')
    assert.equal(satir(0), 'DURUM: UYARI')
    assert.equal(satir(1), 'G:U A:N I:N')
    assert.equal(sim.read(7), true, 'gaz uyarısı: fan açılmalı')
    const t1 = sim.nowMs()
    gec(4000)
    const araliklar = hiz(sim, 8, t1, sim.nowMs())
    assert.ok(araliklar.length >= 3 && araliklar.every((a) => Math.abs(a - 1000) < 30), `yavaş bip 1 sn arayla: ${araliklar}`)
    const genislik = sim.pulseWidthsUs(8, t1, sim.nowMs()).filter((x) => x > 100000)   // tam bip'ler
    assert.ok(genislik.length >= 3 && genislik.every((x) => x > 130000 && x < 170000), `bip ~150 ms: ${genislik}`)

    // --- Histerezis: gaz 1,20-1,35 V (246-276) arasında oynar; UYARI sürer, LED titremez
    const t2 = sim.nowMs()
    for (let i = 0; i < 100; i++) { sim.analog(3, i % 2 ? 1.2 : 1.35); sim.run(20) }
    assert.equal(led(), '010')
    assert.equal(sim.pinEdges(12, t2, sim.nowMs()).length, 0, 'sarı LED titremeli değil')
    assert.equal(sim.read(7), true)

    // --- 3) Alev: TEHLIKE (kırmızı, sürekli buzzer), gaz hâlâ UYARI -> fan açık
    sim.analog(3, 1.5)
    sim.analog(1, 1.0)                         // şiddet ~818
    gec(500)
    assert.equal(led(), '001', 'TEHLIKE: yalnız kırmızı')
    assert.equal(satir(0), 'DURUM: TEHLIKE')
    assert.equal(satir(1), 'G:U A:T I:N')
    const t3 = sim.nowMs()
    gec(2500)
    assert.equal(sim.read(8), true, 'TEHLIKE: buzzer sürekli açık')
    assert.equal(sim.pinEdges(8, t3, sim.nowMs()).length, 0, 'TEHLIKE: buzzer kesintisiz olmalı')
    assert.equal(sim.read(7), true)

    // --- 4) Alev gider: UYARI'ya iner (gaz hâlâ yüksek)
    sim.analog(1, 4.6)
    gec(500)
    assert.equal(led(), '010', 'alev gidince gaz yüzünden UYARI')
    assert.equal(satir(1), 'G:U A:N I:N')

    // --- 5) Isı: 50 C -> UYARI (genel zaten UYARI), 70 C -> TEHLIKE
    sim.analog(2, ntcVolt(50))
    gec(500)
    assert.equal(satir(1), 'G:U A:N I:U')
    sim.analog(2, ntcVolt(70))
    gec(500)
    assert.equal(led(), '001', 'ısı TEHLIKE: genel TEHLIKE')
    assert.equal(satir(1), 'G:U A:N I:T')
    sim.analog(2, ntcVolt(50))                 // 55 altı: UYARI'ya iner
    gec(500)
    assert.equal(satir(1), 'G:U A:N I:U')
    sim.analog(2, ntcVolt(43.6))               // 44 C: UYARI (kapama 42), histerezis
    gec(500)
    assert.equal(satir(1), 'G:U A:N I:U', 'ısı histerezisi: 44 C UYARI kalır')
    sim.analog(2, ntcVolt(25))
    gec(500)
    assert.equal(satir(1), 'G:U A:N I:N')

    // --- 6) Gaz temizlenir: histerezisle NORMAL'e dönüş
    sim.analog(3, 1.1)                         // ~225, oran 1,22: bant 230'un altında mı?
    gec(500)
    // 225 < 230 (baz*5/4): NORMAL'e düşer
    assert.equal(led(), '100', 'gaz temizlendi: NORMAL')
    assert.equal(satir(0), 'DURUM: NORMAL')
    assert.equal(satir(1), 'G:N A:N I:N')
    assert.equal(sim.read(7), false, 'gaz temizlenince fan kapanmalı')
    const t4 = sim.nowMs()
    gec(2500)
    assert.equal(sim.pinEdges(8, t4, sim.nowMs()).length, 0, 'NORMAL: buzzer sussun')
    assert.equal(sim.read(8), false)

    // --- Seri günlük: olaylar doğru sırada
    const ozet = sim.serial.split('\n').map((s) => s.trim()).filter((s) => s.startsWith('DURUM:')).map((s) => s.split(' ')[1])
    assert.deepEqual(ozet, ['UYARI', 'TEHLIKE', 'UYARI', 'TEHLIKE', 'UYARI', 'NORMAL'].slice(0, ozet.length))
    assert.ok(ozet.length === 6, `6 durum değişimi bekleniyordu: ${ozet}`)
  },
}

import assert from 'node:assert/strict'

// Butona kısa bir süre (ms) basar ve bırakır.
function bas(sim, pin, ms = 60) {
  sim.drive(pin, false)
  sim.run(ms)
  sim.drive(pin, true)
}

// Şifre: aralıklı n basış.
function basisDizisi(sim, pin, n, ara = 200) {
  for (let i = 0; i < n; i++) { bas(sim, pin, 60); sim.run(ara) }
}

const say = (s, desen) => (s.match(desen) || []).length

export default {
  // PIR ısınması: 5 sn boyunca "Hazir" yok, LED hızlı yanıp söner; sonra kenarlar yazdırılır.
  pir_isinma(sim) {
    sim.drive(2, false)                       // PIR sakin
    sim.run(2000)
    assert.ok(/Isiniyor/.test(sim.serial), `Isiniyor yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.ok(!/Hazir/.test(sim.serial), 'ısınma bitmeden "Hazir" yazılmamalıydı')
    const w = sim.wave(13, 100, 2000)
    assert.ok(Math.abs(w.hz - 2) < 0.3, `ısınmada LED 2 Hz bekleniyordu, ${w.hz.toFixed(2)} Hz`)
    sim.drive(2, true)                        // ısınma sırasında HIGH: yok sayılmalı
    sim.run(500)
    sim.drive(2, false)
    sim.run(2900)                             // t = 5,4 sn
    assert.ok(/Hazir/.test(sim.serial), `5 sn sonra Hazir yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.equal(say(sim.serial, /Hareket var/g), 0, 'ısınma sırasındaki HIGH yok sayılmalıydı')
    assert.equal(sim.read(13), false, 'ısınma bitince hareket yokken LED sönük olmalı')
    sim.drive(2, true)
    sim.run(100)
    assert.equal(say(sim.serial, /Hareket var/g), 1, `hareket 1 kez bildirilmeliydi: ${JSON.stringify(sim.serial)}`)
    assert.equal(sim.read(13), true, 'hareket varken LED yanmalı')
    sim.run(1000)
    assert.equal(say(sim.serial, /Hareket var/g), 1, 'hareket sürerken mesaj tekrarlanmamalıydı')
    sim.drive(2, false)
    sim.run(100)
    assert.equal(say(sim.serial, /Hareket bitti/g), 1, 'hareket bitince 1 mesaj bekleniyordu')
    assert.equal(sim.read(13), false, 'hareket bitince LED sönmeli')
  },

  // Oda dolu/boş: PIR LOW olsa da 3 sn boyunca oda "dolu" kalır.
  pir_oda_dolu(sim) {
    sim.drive(2, false)
    sim.run(500)
    assert.equal(sim.read(13), false, 'başta oda boş, LED sönük olmalı')
    sim.drive(2, true)
    sim.run(100)
    assert.ok(/Oda dolu/.test(sim.serial), 'hareketle oda dolu olmalı')
    assert.equal(sim.read(13), true)
    sim.drive(2, false)
    sim.run(2500)                             // 2,5 sn sessizlik
    assert.equal(say(sim.serial, /Oda bos/g), 0, '3 sn dolmadan oda boş sayılmamalı')
    assert.equal(sim.read(13), true, '3 sn dolmadan LED yanık kalmalı')
    // araya yeni hareket girerse sayaç yenilenir
    sim.drive(2, true); sim.run(50); sim.drive(2, false)
    sim.run(2500)
    assert.equal(say(sim.serial, /Oda bos/g), 0, 'yeni hareket sayacı yenilemeliydi')
    sim.run(700)                              // son hareketten ~3,25 sn
    assert.equal(say(sim.serial, /Oda bos/g), 1, `3 sn sessizlikten sonra oda boş olmalı: ${JSON.stringify(sim.serial)}`)
    assert.equal(sim.read(13), false, 'oda boşken LED sönük')
    assert.equal(say(sim.serial, /Oda dolu/g), 1, 'oda dolu mesajı yalnız bir kez gelmeli')
  },

  // IR engel: engel varken (LOW) LED yanar, seri mesaj değişir.
  ir_engel(sim) {
    sim.run(300)
    assert.equal(sim.read(13), false, 'engel yokken (HIGH) LED sönük olmalı')
    assert.ok(/Engel yok/.test(sim.serial), `Engel yok yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    sim.drive(3, false)                       // engel: çıkış LOW
    sim.run(400)
    assert.equal(sim.read(13), true, 'engel varken LED yanmalı')
    assert.ok(/Engel var/.test(sim.serial), `Engel var yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    sim.drive(3, true)
    sim.run(400)
    assert.equal(sim.read(13), false, 'engel kalkınca LED sönmeli')
  },

  // Kararlı sayaç: kısa parazit sayılmaz, uzun engel tek sayım.
  ir_sayac_kararli(sim) {
    sim.run(100)
    // 5 ms'lik parazit: sayılmamalı
    sim.drive(3, false); sim.run(5); sim.drive(3, true); sim.run(100)
    assert.ok(!/Sayac/.test(sim.serial), `5 ms'lik parazit sayılmamalıydı: ${JSON.stringify(sim.serial)}`)
    // 200 ms'lik gerçek engel: 1 sayım
    sim.drive(3, false); sim.run(200); sim.drive(3, true); sim.run(100)
    assert.ok(/Sayac: 1\r?\n/.test(sim.serial), `1 sayım bekleniyordu: ${JSON.stringify(sim.serial)}`)
    // 2 sn duran cisim hâlâ tek sayım
    sim.drive(3, false); sim.run(2000); sim.drive(3, true); sim.run(100)
    assert.ok(/Sayac: 2\r?\n/.test(sim.serial), 'ikinci cisim 2. sayım olmalı')
    assert.ok(!/Sayac: 3/.test(sim.serial), 'duran cisim tek sayılmalıydı')
    // kenar titreşimi (bounce): giriş sırasında kısa oynama tek sayım verir
    sim.drive(3, false); sim.run(3); sim.drive(3, true); sim.run(3)
    sim.drive(3, false); sim.run(3); sim.drive(3, true); sim.run(3)
    sim.drive(3, false); sim.run(200); sim.drive(3, true); sim.run(100)
    assert.ok(/Sayac: 3\r?\n/.test(sim.serial), `titreşimli geçiş 1 sayım vermeliydi: ${JSON.stringify(sim.serial)}`)
    assert.ok(!/Sayac: 4/.test(sim.serial), 'titreşim fazladan sayım üretmemeliydi')
  },

  // Analog eşik: histerezis; 500-600 arasında durum korunur.
  ir_analog_esik(sim) {
    sim.analog(0, 1.0)                        // ~205
    sim.run(200)
    assert.equal(sim.read(13), false)
    sim.analog(0, 2.9)                        // ~593: 600'ün altında, engel yok kalmalı
    sim.run(200)
    assert.equal(sim.read(13), false, '600 altında engel yok kalmalıydı')
    sim.analog(0, 3.2)                        // ~655: engel var
    sim.run(200)
    assert.equal(sim.read(13), true, 'eşik üstünde engel olmalı')
    assert.equal(say(sim.serial, /Engel var/g), 1)
    sim.analog(0, 2.6)                        // ~532: iki eşik arası, engel korunmalı
    sim.run(200)
    assert.equal(sim.read(13), true, 'iki eşik arasında durum korunmalıydı')
    sim.analog(0, 2.2)                        // ~450: engel yok
    sim.run(200)
    assert.equal(sim.read(13), false, 'alt eşiğin altında engel kalkmalı')
    assert.equal(say(sim.serial, /Engel yok/g), 1)
    // titreşen değer çıktıyı titretmemeli
    for (let i = 0; i < 6; i++) { sim.analog(0, i % 2 ? 2.7 : 2.9); sim.run(60) }
    assert.equal(say(sim.serial, /Engel var/g), 1, 'eşikler arası dalgalanma yeni mesaj üretmemeli')
  },

  // Reed: INPUT_PULLUP, mıknatıs yakın (LOW) = kapı kapalı; 20 ms'den kısa titreşim yok sayılır.
  reed_kapi(sim) {
    sim.run(200)
    assert.equal(sim.read(13), true, 'başta kontak açık (HIGH): kapı açık sayılır, LED yanar')
    sim.drive(4, false)                       // mıknatıs yakın
    sim.run(100)
    assert.ok(/Kapi kapali/.test(sim.serial), `Kapi kapali yazılmalıydı: ${JSON.stringify(sim.serial)}`)
    assert.equal(sim.read(13), false, 'kapı kapalıyken LED sönük')
    // 5 ms'lik titreşim: durum değişmemeli
    sim.drive(4, true); sim.run(5); sim.drive(4, false); sim.run(100)
    assert.equal(say(sim.serial, /Kapi acik/g), 0, `5 ms'lik titreşim kapı açıldı sayılmamalıydı: ${JSON.stringify(sim.serial)}`)
    assert.equal(say(sim.serial, /Kapi kapali/g), 1)
    // gerçek açılış
    sim.drive(4, true)
    sim.run(100)
    assert.equal(say(sim.serial, /Kapi acik/g), 1, 'kapı açılınca bir mesaj bekleniyordu')
    assert.equal(sim.read(13), true)
    // bounce'lu kapanış: tek mesaj
    for (let i = 0; i < 3; i++) { sim.drive(4, false); sim.run(4); sim.drive(4, true); sim.run(4) }
    sim.drive(4, false)
    sim.run(100)
    assert.equal(say(sim.serial, /Kapi kapali/g), 2, `bounce'lu kapanış tek mesaj vermeliydi: ${JSON.stringify(sim.serial)}`)
  },

  // İki kontak, dizilerle: reed ve limit bağımsız izlenir.
  kontak_debounce(sim) {
    sim.run(100)
    assert.equal(sim.serial, '', `başta mesaj olmamalıydı: ${JSON.stringify(sim.serial)}`)
    sim.drive(3, false); sim.run(100)         // limit basıldı
    assert.ok(/Limit: kapali\r?\n/.test(sim.serial), `Limit: kapali bekleniyordu: ${JSON.stringify(sim.serial)}`)
    assert.ok(!/Reed/.test(sim.serial), 'limit basışı reed mesajı üretmemeli')
    sim.drive(4, false); sim.run(100)         // reed kapandı
    assert.ok(/Reed: kapali\r?\n/.test(sim.serial), 'Reed: kapali bekleniyordu')
    // parazit
    sim.drive(4, true); sim.run(5); sim.drive(4, false); sim.run(100)
    assert.ok(!/Reed: acik/.test(sim.serial), '5 ms parazit reed açık sayılmamalı')
    sim.drive(3, true); sim.run(100)
    assert.ok(/Limit: acik\r?\n/.test(sim.serial), 'Limit: acik bekleniyordu')
    sim.drive(4, true); sim.run(100)
    assert.ok(/Reed: acik\r?\n/.test(sim.serial), 'Reed: acik bekleniyordu')
  },

  // Uçtan uca: kurma, çıkış gecikmesi, PIR ihlali, alarm, şifre ile susturma.
  hirsiz_alarmi(sim) {
    sim.drive(2, false)                       // PIR sakin
    sim.drive(4, false)                       // kapı kapalı (mıknatıs yakın)
    sim.run(300)
    assert.ok(/Durum: DEVRE_DISI/.test(sim.serial), 'başlangıç durumu DEVRE_DISI olmalı')

    // DEVRE_DISI: PIR ve kapı yok sayılır
    sim.drive(2, true); sim.run(300); sim.drive(2, false); sim.run(100)
    sim.drive(4, true); sim.run(300); sim.drive(4, false); sim.run(100)
    assert.equal(sim.pinEdges(8, 20, sim.nowMs()).length, 0, 'DEVRE_DISI: buzzer hiç çalmamalı')
    assert.equal(sim.read(13), false, 'DEVRE_DISI: LED sönük')

    // Kapı açıkken kurma reddedilir
    sim.drive(4, true)
    bas(sim, 3)
    sim.run(300)
    assert.ok(/Kapi acik, kurulamadi/.test(sim.serial), `açık kapıyla kurma reddedilmeliydi: ${JSON.stringify(sim.serial)}`)
    sim.run(5500)
    assert.ok(!/Durum: HAZIR/.test(sim.serial), 'açık kapıyla HAZIR olunmamalı')
    sim.drive(4, false)
    sim.run(100)

    // Kur: çıkış gecikmesi 5 sn
    const tKur = sim.nowMs()
    bas(sim, 3)
    sim.run(1900)
    assert.ok(/Cikis gecikmesi basladi/.test(sim.serial), 'çıkış gecikmesi başlamalı')
    const wc = sim.wave(13, tKur + 100, tKur + 1900)
    assert.ok(wc.hz > 1.5 && wc.hz < 2.5, `çıkış gecikmesinde LED ~2 Hz bekleniyordu, ${wc.hz.toFixed(2)} Hz`)
    // gecikme sırasında PIR yok sayılır
    sim.drive(2, true); sim.run(400); sim.drive(2, false)
    let hazirT = null
    for (let i = 0; i < 80 && hazirT === null; i++) {
      sim.run(100)
      if (/Durum: HAZIR/.test(sim.serial)) hazirT = sim.nowMs()
    }
    assert.ok(hazirT !== null, `HAZIR olunmalıydı: ${JSON.stringify(sim.serial)}`)
    const gecikme = hazirT - tKur
    assert.ok(gecikme >= 4900 && gecikme <= 5300, `çıkış gecikmesi ~5 sn bekleniyordu, ${gecikme} ms`)
    assert.ok(!/Durum: ALARM/.test(sim.serial), 'çıkış gecikmesindeki PIR alarm çaldırmamalıydı')

    // HAZIR: sessiz, LED 2 sn'de bir kısa parlama
    const tH = sim.nowMs()
    sim.run(4000)
    assert.equal(sim.pinEdges(8, tH, tH + 4000).length, 0, 'HAZIR: buzzer sessiz')
    const ledK = sim.pinEdges(13, tH, tH + 4000).filter((e) => e.value).length
    assert.ok(ledK >= 1 && ledK <= 3, `HAZIR: 4 sn'de ~2 parlama bekleniyordu, ${ledK}`)

    // PIR ihlali -> ALARM
    const tA = sim.nowMs()
    sim.drive(2, true)
    sim.run(100)
    assert.ok(/Durum: ALARM/.test(sim.serial), `PIR ihlali ALARM olmalı: ${JSON.stringify(sim.serial)}`)
    sim.drive(2, false)                       // PIR sönse de alarm mandallı
    sim.run(1400)
    // Siren: her 250 ms'lik dilimde (milis'e hizalı) frekans 1 kHz ile 2 kHz arasında değişir
    const hzler = []
    for (let k = Math.ceil(tA / 250) + 1; hzler.length < 4; k++) {
      const yuk = sim.pinEdges(8, k * 250 + 10, k * 250 + 240).filter((e) => e.value).length
      hzler.push(yuk / 0.23)
    }
    const dusuk = hzler.filter((h) => Math.abs(h - 1000) < 120).length
    const yuksek = hzler.filter((h) => Math.abs(h - 2000) < 200).length
    assert.ok(dusuk >= 1 && yuksek >= 1 && dusuk + yuksek === 4,
      `siren dilimleri 1 kHz / 2 kHz olmalı: ${hzler.map((h) => h.toFixed(0)).join(', ')}`)
    const wa = sim.wave(13, tA + 200, tA + 1500)
    assert.ok(wa.hz > 4 && wa.hz < 6, `ALARM: LED ~5 Hz bekleniyordu, ${wa.hz.toFixed(2)} Hz`)

    // Şifre: 2 basış yetmez, 3. basış susturur
    basisDizisi(sim, 3, 2, 300)
    assert.ok(!/Durum: SUSTURULDU/.test(sim.serial), '2 basış susturmamalı')
    bas(sim, 3); sim.run(100)
    assert.ok(/Durum: SUSTURULDU/.test(sim.serial), `3 basış susturmalı: ${JSON.stringify(sim.serial)}`)
    const tS = sim.nowMs()
    sim.run(2000)
    assert.equal(sim.pinEdges(8, tS + 20, tS + 2000).length, 0, 'SUSTURULDU: buzzer sessiz')
    const ws = sim.wave(13, tS, tS + 2000)
    assert.ok(Math.abs(ws.hz - 1) < 0.25, `SUSTURULDU: LED ~1 Hz yavaş bekleniyordu, ${ws.hz.toFixed(2)} Hz`)

    // SUSTURULDU'da yeni hareket yeniden alarm çaldırmaz
    sim.drive(2, true); sim.run(400); sim.drive(2, false); sim.run(200)
    assert.equal(say(sim.serial, /Durum: ALARM/g), 1, 'SUSTURULDU: yeni ihlal alarm çaldırmamalı')

    // 3 basış: DEVRE_DISI
    basisDizisi(sim, 3, 3, 300)
    sim.run(100)
    assert.ok(/Durum: DEVRE_DISI(\r?\n)[\s\S]*$/.test(sim.serial.split('SUSTURULDU').pop()), 'şifre DEVRE_DISI yapmalı')
    assert.equal(sim.read(13), false, 'DEVRE_DISI: LED sönük')
    // artık tek bir hareket bir şey yapmaz
    const nAlarm = say(sim.serial, /Durum: ALARM/g)
    sim.drive(2, true); sim.run(300); sim.drive(2, false); sim.run(200)
    assert.equal(say(sim.serial, /Durum: ALARM/g), nAlarm, 'DEVRE_DISI: hareket alarm çaldırmamalı')

    // İkinci tur: yeniden kur, kapı (reed) ihlali, şifre penceresi, alarm süresi
    bas(sim, 3)
    sim.run(5400)
    assert.equal(say(sim.serial, /Durum: HAZIR/g), 2, 'ikinci kurma da HAZIR olmalı')
    // şifre penceresi: 2 basış + 3,5 sn bekleme + 1 basış = şifre değil
    basisDizisi(sim, 3, 2, 200)
    sim.run(3500)
    bas(sim, 3); sim.run(200)
    assert.equal(say(sim.serial, /Durum: DEVRE_DISI/g), 2,
      `pencere dışı basışlar şifre sayılmamalı: ${JSON.stringify(sim.serial)}`)
    // kapı açılır -> ALARM (PIR sakin)
    const tK = sim.nowMs()
    sim.drive(4, true)
    sim.run(200)
    assert.equal(say(sim.serial, /Durum: ALARM/g), 2, 'kapı açılınca ALARM olmalı')
    // şifre girilmezse ALARM_SURESI (10 sn) sonra kendiliğinden susar
    sim.run(9000)                             // alarm başlangıcından ~9,2 sn
    assert.equal(say(sim.serial, /Durum: SUSTURULDU/g), 1, '10 sn dolmadan ikinci SUSTURULDU gelmemeli')
    assert.ok(sim.pinEdges(8, sim.nowMs() - 1000, sim.nowMs()).length > 500, '10 sn dolmadan siren sürmeli')
    sim.run(1500)                             // ~10,7 sn
    assert.equal(say(sim.serial, /Durum: SUSTURULDU/g), 2, '10 sn sonra otomatik SUSTURULDU')
    const tZ = sim.nowMs()
    sim.run(1500)
    assert.equal(sim.pinEdges(8, tZ + 20, tZ + 1500).length, 0, 'zaman aşımından sonra buzzer sessiz')
    const alarmSuresi = tZ - tK
    assert.ok(alarmSuresi > 10000, `alarm süresi ~10 sn olmalıydı (${alarmSuresi} ms)`)
  },

}

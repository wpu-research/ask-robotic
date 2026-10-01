import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

// --- Yardımcılar -----------------------------------------------------------

/** Tek bir basışı sıçramalı olarak üretir: [LOW, HIGH, LOW, HIGH, LOW] küçük aralıklarla, sonra kararlı LOW. */
function siciramaliBas(sim, pin, aralikMs = [0.3, 0.4, 0.2, 0.3]) {
  let seviye = false
  sim.drive(pin, seviye)
  for (const a of aralikMs) {
    sim.run(a)
    seviye = !seviye
    sim.drive(pin, seviye)
  }
  assert.equal(seviye, false, 'sıçrama dizisi LOW ile bitmeli (basılı)')
  sim.run(60)              // kararlı basılı
  sim.drive(pin, true)     // bırak
  sim.run(60)
}

/** Deterministik "gürültü": aynı sayı dizisi her çalıştırmada aynı çıkar (doğrusal eşleşik üreteç). */
function gurultu(tohum = 12345) {
  let s = tohum
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return (s / 0x7fffffff) * 2 - 1       // -1 ... +1
  }
}

/** Pin 13'ün (LED) değişim sayısı. */
const gecisSayisi = (sim, pin = 13) => sim.pinEdges(pin, 1).length   // açılıştaki ilk LOW kaydını sayma

/** Yavaşça yükselen bir gerilimi gürültüyle uygular: baslangic -> bitis V, adim sayısı kadar. */
function rampaGurultulu(sim, kanal, baslangic, bitis, adim, genlik) {
  const r = gurultu()
  for (let i = 0; i <= adim; i++) {
    const v = baslangic + ((bitis - baslangic) * i) / adim + genlik * r()
    sim.analog(kanal, v)
    sim.run(4)
  }
}

// --- Kontroller ------------------------------------------------------------

export default {
  // Debouncesiz sayaç: tek fiziksel basış, sıçrama yüzünden birden çok kez sayılır.
  sayac_ham(sim) {
    sim.run(100)
    siciramaliBas(sim, 2)
    const sayilar = [...sim.serial.matchAll(/Sayac: (\d+)/g)].map((m) => Number(m[1]))
    assert.equal(sayilar.length, 3, `5 kenarlı sıçrama dizisi 3 düşen kenar = 3 sayım bekleniyordu, çıktı: ${JSON.stringify(sim.serial)}`)
  },

  // Debounce'lu sayaç: aynı sıçramalı basış tam 1 kez sayılır; sonraki temiz basış 2.
  sayac_temiz(sim) {
    sim.run(100)
    siciramaliBas(sim, 2)
    assert.equal((sim.serial.match(/Sayac:/g) || []).length, 1, `tek basış = tek sayım, çıktı: ${JSON.stringify(sim.serial)}`)
    assert.match(sim.serial, /Sayac: 1/)
    // temiz ikinci basış
    sim.drive(2, false); sim.run(80); sim.drive(2, true); sim.run(80)
    assert.match(sim.serial, /Sayac: 2/)
    // 5 ms'lik gerçek (çok kısa) bir parazit: 20 ms dolmadan bırakıldı, sayılmamalı
    sim.drive(2, false); sim.run(5); sim.drive(2, true); sim.run(80)
    assert.equal((sim.serial.match(/Sayac:/g) || []).length, 2, '5 ms\'lik parazit sayılmamalı')
  },

  // Tek eşik: gürültülü yükselen sinyalde LED eşik civarında birden çok kez gider gelir.
  esik_ham(sim) {
    sim.analog(0, 2.3)
    sim.run(20)
    rampaGurultulu(sim, 0, 2.3, 2.7, 200, 0.03)
    sim.run(10)
    const g = gecisSayisi(sim)
    assert.ok(g >= 3, `gürültü eşik titremesi yaratmalı (>=3 geçiş), ${g} geçiş`)
    assert.equal(sim.read(13), true, 'rampa sonunda LED yanık olmalı')
  },

  // Histerezis: aynı gürültülü rampada LED tam bir kez yanar.
  esik_histerezis(sim) {
    sim.analog(0, 2.3)
    sim.run(20)
    rampaGurultulu(sim, 0, 2.3, 2.7, 200, 0.03)
    sim.run(10)
    assert.equal(gecisSayisi(sim), 1, `histerezisle tek geçiş bekleniyordu, ${gecisSayisi(sim)}`)
    assert.equal(sim.read(13), true)
    // geri inerken de tek geçiş
    rampaGurultulu(sim, 0, 2.7, 2.3, 200, 0.03)
    sim.run(10)
    assert.equal(gecisSayisi(sim), 2, 'inerken de tek geçiş (toplam 2)')
    assert.equal(sim.read(13), false)
  },

  // EEPROM'daki sayaç: ilk açılış 1; EEPROM'u taşıyan ikinci "açılış" 2.
  acilis_sayaci(sim, kaynak) {
    sim.run(200)
    assert.match(sim.serial, /Acilis no: 1/)
    const hafiza = new Uint8Array(sim.eeprom.backend.memory)
    assert.equal(hafiza[0], 1)
    // kart yeniden başlıyor: aynı EEPROM ile yeni benzetim
    const yeni = createSim(kaynak, { name: 'acilis_sayaci' })
    yeni.eeprom.backend.memory.set(hafiza)
    yeni.run(200)
    assert.match(yeni.serial, /Acilis no: 2/)
  },

  // Yükleme doğrulaması: 1 Hz yanıp sönme, açılış mesajı ve tur sayacı.
  yukleme_dogrulama(sim) {
    sim.run(3100)
    assert.match(sim.serial, /^Kart hazir\r?\n/)
    const w = sim.wave(13, 0, 3100)
    assert.ok(Math.abs(w.hz - 1) < 0.05 && Math.abs(w.duty - 0.5) < 0.05, `1 Hz %50 bekleniyordu: ${w.hz.toFixed(2)} Hz, duty ${w.duty.toFixed(2)}`)
    assert.match(sim.serial, /Tur: 3\r?\n/)
    assert.doesNotMatch(sim.serial, /Tur: 4/)
  },

  // ADC -> volt dönüşümü: uygulanan gerilimle yazılan değer tutarlı.
  adc_voltmetre(sim) {
    sim.analog(0, 3.3)
    sim.run(1200)
    const s = [...sim.serial.matchAll(/ADC=(\d+) V=([\d.]+)/g)].map((m) => ({ adc: Number(m[1]), v: Number(m[2]) }))
    assert.ok(s.length >= 2, `en az 2 satır bekleniyordu: ${JSON.stringify(sim.serial)}`)
    const son = s.at(-1)
    assert.ok(Math.abs(son.v - 3.3) < 0.03, `3,3 V bekleniyordu, ${son.v}`)
    assert.ok(Math.abs(son.adc - 675) <= 2, `ADC ~675 bekleniyordu, ${son.adc}`)
    sim.analog(0, 0)
    sim.run(700)
    assert.match(sim.serial, /ADC=0 V=0\.00\s*$/)
  },

  // Satır protokolü: bayt arası bekleyerek komut gönder, cevap ve pin durumunu doğrula.
  komut_ayristirici(sim) {
    sim.run(100)
    const gonder = (metin) => { for (const c of metin) { sim.sendSerial(c); sim.run(3) } sim.run(20) }
    gonder('LED:1\n')
    assert.equal(sim.read(13), true, 'LED:1 sonrası D13 HIGH')
    assert.match(sim.serial, /OK LED=1\r?\n/)
    gonder('DURUM?\r\n')                   // Windows satır sonu da kabul
    assert.match(sim.serial, /LED=1\r?\n(?!.*OK)/s)
    gonder('LED:0\n')
    assert.equal(sim.read(13), false)
    assert.match(sim.serial, /OK LED=0\r?\n/)
    gonder('DURUM?\n')
    assert.match(sim.serial, /LED=0\r?\n$/)
    // Tanınmayan komut LED'e dokunmaz
    gonder('LED:7\n')
    assert.match(sim.serial, /HATA: LED:7\r?\n/)
    assert.equal(sim.read(13), false)
    // Yarım gelen satır işlenmez: sadece "LED:" gönder, sonra tamamla
    gonder('LED:')
    assert.equal(sim.read(13), false)
    gonder('1\n')
    assert.equal(sim.read(13), true, 'parçalı gelen satır tamamlanınca işlenmeli')
    // Tampondan uzun satır: HATA, LED değişmez
    gonder('LED:0' + 'X'.repeat(30) + '\n')
    assert.match(sim.serial, /HATA: satir cok uzun/)
    assert.equal(sim.read(13), true, 'uzun satır komut sayılmamalı')
    // Taşmadan sonra protokol normale döner
    gonder('LED:0\n')
    assert.equal(sim.read(13), false)
  },

  // Katman katman doğrulama: cihazı bağlayıp/bağlamayarak ve değeri bozarak hangi katmanın hata verdiğini ölç.
  katman_testi(sim, kaynak) {
    const yeni = (dev) => {
      const s = createSim(kaynak, { name: 'katman_testi' })
      return dev ? [s, dev(s)] : [s, null]
    }
    const son = (s) => s.serial.trim().split(/\r?\n/).filter((l) => !l.startsWith('DEGISTI')).at(-1)

    // 0) Her şey sağlam: MPU6050 bağlı, hareketsiz (az = 1 g)
    {
      const [s, m] = yeni((x) => x.mpu6050({ az: 1 }))
      s.run(2500)
      assert.match(son(s), /^TAMAM g=1\.00$/, `sağlam durum: ${JSON.stringify(s.serial)}`)
      assert.doesNotMatch(s.serial, /HATA|DEGISTI/)
      // "arada düzeliyor": değer bir süre bozulur, sonra düzelir -> DEGISTI yazılır
      m.az = 0
      s.run(1100)
      assert.match(son(s), /Katman 4 HATA/)
      assert.match(s.serial, /DEGISTI/)
      m.az = 1
      s.run(1100)
      assert.match(s.serial, /Katman 4 HATA[^]*DEGISTI[^]*TAMAM/)
    }
    // 1) Cihaz hiç bağlı değil: katman 2
    {
      const [s] = yeni(null)
      s.run(1500)
      assert.match(son(s), /^Katman 2 HATA/, JSON.stringify(s.serial))
    }
    // 2) Adreste başka bir cihaz var (BMP280 0x68'e kondu): adres cevap verir, kimlik yanlış -> katman 3
    {
      const [s] = yeni((x) => x.bmp280({ address: 0x68 }))
      s.run(1500)
      assert.match(son(s), /^Katman 3 HATA/, JSON.stringify(s.serial))
      assert.doesNotMatch(s.serial, /Katman 2/, 'adres katmanı geçmeli: cihaz cevap veriyor')
    }
    // 3) Doğru cihaz, aralık dışı değer (sensör sıfır veriyor): katman 4
    {
      const [s] = yeni((x) => x.mpu6050({ ax: 0, ay: 0, az: 0 }))
      s.run(1500)
      assert.match(son(s), /^Katman 4 HATA/, JSON.stringify(s.serial))
    }
    // 4) Doğru cihaz, çok büyük ivme (sallanıyor/doyma): katman 4
    {
      const [s] = yeni((x) => x.mpu6050({ ax: 1.9, ay: 1.9, az: 1.9 }))
      s.run(1500)
      assert.match(son(s), /^Katman 4 HATA/, JSON.stringify(s.serial))
    }
    // 5) Fiziksel katman: SDA LOW'a takılı (kısa devre taklidi) -> katman 1, cihaz bağlı olsa bile
    {
      const [s] = yeni((x) => x.mpu6050({ az: 1 }))
      s.drive('A4', false)
      s.run(1500)
      assert.match(son(s), /^Katman 1 HATA/, JSON.stringify(s.serial))
    }
  },

  // Çerçeve + XOR checksum: geçerli çerçeve uygulanır, bozuk olan yok sayılır, çöp baytlarda yeniden senkron.
  xor_cerceve(sim) {
    sim.run(100)
    const gonder = (baytlar) => { for (const b of baytlar) { sim.sendSerial(String.fromCharCode(b)); sim.run(3) } sim.run(60) }
    const xor = (...b) => b.reduce((a, x) => a ^ x, 0)
    // AA 02 01 01 xor(02,01,01)=02 -> LED yan
    gonder([0xaa, 0x02, 0x01, 0x01, xor(0x02, 0x01, 0x01)])
    assert.match(sim.serial, /CERCEVE TAMAM/)
    assert.equal(sim.read(13), true)
    // Checksum bozuk: LED sönmesi istenir ama uygulanmamalı
    const once = sim.serial.length
    gonder([0xaa, 0x02, 0x01, 0x00, xor(0x02, 0x01, 0x00) ^ 0x10])
    const yeni = sim.serial.slice(once)
    assert.match(yeni, /CHECKSUM HATA: gelen=\w+ hesaplanan=3/, JSON.stringify(yeni))
    assert.equal(sim.read(13), true, 'bozuk çerçeve uygulanmamalı')
    // Çöp baytlar + geçerli çerçeve: sync'e kadar yok sayılır, sonra uygulanır
    gonder([0x13, 0x37, 0xff, 0xaa, 0x02, 0x01, 0x00, xor(0x02, 0x01, 0x00)])
    assert.equal(sim.read(13), false, 'çöp sonrası geçerli çerçeve uygulanmalı')
    // Geçersiz uzunluk
    const once2 = sim.serial.length
    gonder([0xaa, 0x00])
    assert.match(sim.serial.slice(once2), /UZUNLUK HATA/)
    gonder([0xaa, 0x02, 0x01, 0x01, xor(0x02, 0x01, 0x01)])
    assert.equal(sim.read(13), true, 'uzunluk hatasından sonra protokol toparlanmalı')
  },

  // Uçtan uca akıllı oda senaryosu.
  akilli_oda(sim, kaynak) {
    const kur = (dhtVar = true) => {
      const s = createSim(kaynak, { name: 'akilli_oda' })
      const lcd = s.lcdI2C({ address: 0x27 })
      const d = dhtVar ? s.dht({ pin: 5, type: 'DHT22', tempC: 24, humidity: 45 }) : null
      s.drive(2, false)            // PIR boşta LOW (düz giriş)
      s.analog(1, 4.0)             // aydınlık oda (~818)
      return { s, lcd, d }
    }
    const hareket = (s, ms = 600) => { s.drive(2, true); s.run(ms); s.drive(2, false) }
    const durumlar = (s) => [...s.serial.matchAll(/durum=(\w+)/g)].map((m) => m[1])

    const { s, lcd, d } = kur()

    // 1) Isınma: PIR tetiklenir ama yok sayılır; lamba/fan kapalı
    s.run(1500)
    hareket(s, 600)
    s.run(300)                                       // t ~ 2,4 sn
    assert.equal(durumlar(s).length, 0, `ısınmada geçiş olmamalı: ${JSON.stringify(s.serial)}`)
    assert.match(lcd.text[1], /^ISINMA/)
    s.run(1500)                                      // t ~ 3,9 sn: ısınma bitti
    assert.deepEqual(durumlar(s), ['BOS'])
    assert.match(lcd.text[1], /^BOS/)

    // 2) BOS: lamba/fan kapalı, LCD ışığı kapalı (tasarruf). Hareket olmadığı için kalır.
    s.run(700)
    assert.equal(lcd.backlight, false, 'BOS durumunda LCD arka ışığı kapalı olmalı')
    assert.equal(s.read(13), false)
    assert.equal(s.read(7), false)

    // 3) Aydınlık odaya hareket: DOLU, lamba yanmaz (aydınlık)
    hareket(s, 600)
    s.run(700)
    assert.deepEqual(durumlar(s), ['BOS', 'DOLU'])
    assert.equal(lcd.backlight, true, 'DOLU: arka ışık açık')
    assert.equal(s.read(13), false, 'aydınlıkta lamba yanmamalı')
    assert.match(lcd.text[0], /^T:24\.0C N:%45/)

    // 4) Karanlık: lamba yanar. Eşik arası (~327) önceki kararı korur (karanlık)
    s.analog(1, 0.5)                                  // ~102 < 300
    s.run(100)
    assert.equal(s.read(13), true, 'DOLU + karanlık: lamba açık')
    s.analog(1, 1.6)                                  // ~327: arada
    s.run(100)
    assert.equal(s.read(13), true, 'histerezis bölgesinde lamba açık kalmalı')
    s.analog(1, 4.0)                                  // aydınlık
    s.run(100)
    assert.equal(s.read(13), false, 'aydınlıkta lamba kapanmalı')
    s.analog(1, 1.6)                                  // ~327: arada, önceki karar aydınlık
    s.run(100)
    assert.equal(s.read(13), false, 'histerezis bölgesinde lamba kapalı kalmalı')
    s.analog(1, 0.5)
    s.run(100)
    assert.equal(s.read(13), true)

    // 5) Fan histerezisi (DHT okumaları 2 sn aralıklı)
    hareket(s, 100)
    d.tempC = 29
    s.run(2500)
    assert.equal(s.read(7), true, '29 °C: fan açık')
    hareket(s, 100)
    d.tempC = 27
    s.run(2500)
    assert.equal(s.read(7), true, '27 °C: histerezis bölgesi, fan açık kalmalı')
    assert.match(lcd.text[1], /F1/)
    hareket(s, 100)
    d.tempC = 25
    s.run(2500)
    assert.equal(s.read(7), false, '25 °C: fan kapanmalı')
    hareket(s, 100)
    d.tempC = 29
    s.run(2500)
    assert.equal(s.read(7), true)

    // Hareket kesilir: BOS_SURESI (8 sn) dolunca BOS, her şey kapalı
    s.run(4500)                                       // son hareketten ~7 sn
    assert.equal(durumlar(s).at(-1), 'DOLU', 'süre dolmadan BOS olmamalı')
    s.run(2000)
    assert.deepEqual(durumlar(s).slice(-1), ['BOS'], `boş odada BOS bekleniyordu: ${durumlar(s)}`)
    s.run(700)
    assert.equal(s.read(13), false, 'BOS: lamba kapalı')
    assert.equal(s.read(7), false, 'BOS: fan kapalı (sıcak olsa bile)')
    assert.equal(lcd.backlight, false)

    // 6) Yeniden hareket: DOLU, sıcak olduğu için fan hemen (sonraki ölçüm turunda) açılır, ışık açılır
    hareket(s, 600)
    s.run(2600)
    assert.equal(s.read(7), true, 'DOLU + 29 °C: fan açık')
    assert.equal(s.read(13), true, 'DOLU + karanlık: lamba açık')
    assert.equal(lcd.backlight, true)

    // 7) Buton: KAPALI -> her şey kapalı, PIR yok sayılır
    const bas = (ms = 100) => { s.drive(3, false); s.run(ms); s.drive(3, true); s.run(ms) }
    bas()
    s.run(700)
    assert.equal(durumlar(s).at(-1), 'KAPALI')
    assert.equal(s.read(13), false)
    assert.equal(s.read(7), false)
    assert.match(lcd.text[1], /^KAPALI/)
    hareket(s, 600)
    s.run(700)
    assert.equal(durumlar(s).at(-1), 'KAPALI', 'KAPALI iken PIR yok sayılmalı')
    assert.equal(s.read(13), false)
    // Sıçramalı basış: tek geçiş (KAPALI -> BOS)
    const once = durumlar(s).length
    s.drive(3, false); s.run(0.3); s.drive(3, true); s.run(0.4); s.drive(3, false); s.run(0.2)
    s.drive(3, true); s.run(0.3); s.drive(3, false); s.run(80); s.drive(3, true); s.run(300)
    assert.deepEqual(durumlar(s).slice(once), ['BOS'], 'sıçramalı tek basış tek geçiş olmalı')
    assert.equal(lcd.backlight, false)

    // 8) Arıza A: DHT22 hiç bağlı değil. Fan kapalı, LCD "DHT HATA", lamba çalışmaya devam eder.
    {
      const k = kur(false)
      k.s.analog(1, 0.5)                                 // karanlık
      k.s.run(3500)                                      // ısınma bitti
      hareket(k.s, 600)
      k.s.run(2800)
      assert.equal(durumlar(k.s).at(-1), 'DOLU')
      assert.equal(k.s.read(7), false, 'DHT yokken fan kapalı kalmalı')
      assert.equal(k.s.read(13), true, 'DHT arızası lambayı etkilememeli')
      assert.match(k.lcd.text[0], /^DHT HATA/)
    }
    // 9) Arıza B: DHT bağlı ama değer makul aralığın dışında (90 °C): fan kapalı, "DHT HATA"
    {
      const k = kur(true)
      k.d.tempC = 90
      k.s.run(3500)
      hareket(k.s, 600)
      k.s.run(2800)
      assert.equal(durumlar(k.s).at(-1), 'DOLU')
      assert.equal(k.s.read(7), false, 'aralık dışı sıcaklıkta fan açılmamalı')
      assert.match(k.lcd.text[0], /^DHT HATA/)
      // sensör düzelince normale döner
      k.d.tempC = 30
      hareket(k.s, 100)
      k.s.run(2600)
      assert.equal(k.s.read(7), true, 'değer makul olunca fan açılmalı')
      assert.match(k.lcd.text[0], /^T:30\.0C/)
    }
  },
}

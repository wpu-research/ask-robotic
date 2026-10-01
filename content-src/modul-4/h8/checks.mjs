import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

// --- Yardımcılar -----------------------------------------------------------

/** Seri çıktıdan "anahtar=değer" ya da "anahtar: değer" biçimindeki tam sayıları sırayla toplar. */
const sayilar = (serial, anahtar) => [...serial.matchAll(new RegExp(`${anahtar}[=:]\\s*(-?\\d+)`, 'g'))].map((m) => Number(m[1]))

/** Pin 13'ün (LED) değişim sayısı. */
const gecisSayisi = (sim, pin = 13) => sim.pinEdges(pin, 1).length   // açılıştaki ilk kaydı sayma

/** Gerilimi yavaşça başlangiç -> bitis V arasında değiştirir (gürültüyü kodun kendisi ekler). */
function rampa(sim, kanal, baslangic, bitis, adim, beklemeMs = 5) {
  for (let i = 0; i <= adim; i++) {
    sim.analog(kanal, baslangic + ((bitis - baslangic) * i) / adim)
    sim.run(beklemeMs)
  }
}

/** Butonu (INPUT_PULLUP, D2) basıp bırakır. */
function bas(sim, tutMs = 100, sonraMs = 100) {
  sim.drive(2, false)
  sim.run(tutMs)
  sim.drive(2, true)
  sim.run(sonraMs)
}

// --- Kontroller ------------------------------------------------------------

export default {
  // ADC basamağı: 2,5 V -> 512 (yuvarlama), 5 V -> 1023, mV hesabı basamak hatası içerir.
  adc_basamak(sim) {
    sim.analog(0, 2.5)
    sim.run(1200)
    assert.match(sim.serial, /ADC=512 mV=2502\.4\r?\n/, JSON.stringify(sim.serial))
    // iki basamak arası: 2,505 V bir üst basamağa geçer
    sim.analog(0, 2.505)
    sim.run(700)
    assert.match(sim.serial, /ADC=513 mV=2507\.3\r?\n/)
    sim.analog(0, 0)
    sim.run(700)
    assert.match(sim.serial, /ADC=0 mV=0\.0\r?\n$/)
    sim.analog(0, 5)
    sim.run(700)
    assert.match(sim.serial, /ADC=1023 mV=5000\.0\r?\n$/)
  },

  // Sahte gürültü: tek okuma ±8 oynar, 16'lık ortalama çok daha az.
  gurultu_ortalama(sim) {
    sim.analog(0, 2.5)                         // ADC 512, laboratuvarda sabit
    sim.run(9000)
    const tek = sayilar(sim.serial, 'Tek')
    const ort = sayilar(sim.serial, 'Ort16')
    assert.ok(tek.length >= 25 && ort.length === tek.length, `satır sayısı: ${tek.length}/${ort.length}`)
    assert.ok(tek.every((v) => v >= 504 && v <= 520), `tek okuma 504-520 olmalı: ${tek}`)
    const yayilim = (a) => Math.max(...a) - Math.min(...a)
    assert.ok(yayilim(tek) >= 12, `tek okuma gerçekten oynamalı (yayılım ${yayilim(tek)})`)
    assert.ok(ort.every((v) => v >= 508 && v <= 516), `ortalama 508-516 olmalı: ${ort}`)
    assert.ok(yayilim(ort) <= yayilim(tek) / 2, `ortalama en az yarı kadar sakin olmalı: tek ${yayilim(tek)}, ort ${yayilim(ort)}`)
  },

  // Tek eşik: eşik değerinde (512) sabit sinyalde bile LED titrer.
  esik_ham(sim) {
    sim.analog(0, 2.5)
    sim.run(2000)
    const g = gecisSayisi(sim)
    assert.ok(g >= 40, `gürültü eşik titremesi yaratmalı (>=40 geçiş), ${g} geçiş`)
  },

  // Histerezis: sabit 512'de hiç geçiş yok; yükselen rampada tek, inen rampada tek geçiş.
  esik_histerezis(sim) {
    sim.analog(0, 2.5)
    sim.run(2000)
    assert.equal(gecisSayisi(sim), 0, 'eşik bandının içinde LED hiç değişmemeli')
    assert.equal(sim.read(13), false)
    rampa(sim, 0, 2.5, 3.0, 300)
    sim.run(50)
    assert.equal(gecisSayisi(sim), 1, `yükselirken tek geçiş bekleniyordu, ${gecisSayisi(sim)}`)
    assert.equal(sim.read(13), true)
    rampa(sim, 0, 3.0, 2.5, 300)
    sim.run(50)
    assert.equal(gecisSayisi(sim), 1, 'band içine inince LED yanık kalmalı (histerezis)')
    rampa(sim, 0, 2.5, 2.0, 300)
    sim.run(50)
    assert.equal(gecisSayisi(sim), 2, 'bandın altına inince tek geçişle sönmeli')
    assert.equal(sim.read(13), false)
  },

  // Sıçramalı buton: tek basış + bırakış = 3 + 2 sahte sayım; LED tek sayıda değişim = yanık.
  sayac_ham(sim) {
    sim.run(100)
    bas(sim)
    const s = sayilar(sim.serial, 'Sayac')
    assert.deepEqual(s, [1, 2, 3, 4, 5], `tek basış+bırakış 5 sayım bekleniyordu: ${JSON.stringify(sim.serial)}`)
    assert.equal(sim.read(13), true, '5 sayım = tek sayıda LED değişimi: yanık')
  },

  // Debounce: aynı sahte sıçrama tek sayım olur; sonraki basış 2; 20 ms'ten kısa gerçek basış sayılmaz (bekleme süresinin bedeli).
  sayac_temiz(sim) {
    sim.run(100)
    bas(sim)
    assert.deepEqual(sayilar(sim.serial, 'Sayac'), [1], `tek basış tek sayım: ${JSON.stringify(sim.serial)}`)
    assert.equal(sim.read(13), true)
    bas(sim)
    assert.deepEqual(sayilar(sim.serial, 'Sayac'), [1, 2])
    assert.equal(sim.read(13), false, 'ikinci sayımda LED söner')
    // 10 ms'lik gerçek basış (20 ms'ten kısa) sayılmaz: bekleme süresinin bedeli
    bas(sim, 10, 100)
    assert.deepEqual(sayilar(sim.serial, 'Sayac'), [1, 2], '20 ms dolmadan bırakılan basış sayılmamalı')
    // 30 ms'lik basış sayılır
    bas(sim, 30, 100)
    assert.deepEqual(sayilar(sim.serial, 'Sayac'), [1, 2, 3])
  },

  // delay(500) içinde kısa basış kaçar; uzun basış en çok 500 ms gecikmeyle görülür.
  tepki_delay(sim) {
    sim.run(50)                                  // loop ilk turunu bitirdi, delay'e girdi
    bas(sim, 100, 700)                           // 100 ms'lik basış delay içinde kalır
    assert.doesNotMatch(sim.serial, /BASILDI/, 'kısa basış delay yüzünden kaçmalı')
    assert.equal(sim.read(13), false)
    sim.drive(2, false)                          // uzun basış
    sim.run(600)
    assert.match(sim.serial, /BASILDI/, 'uzun basış en geç 500 ms içinde görülmeli')
    sim.drive(2, true)
    sim.run(600)
  },

  // millis ile: aynı kısa basış anında görülür, LED hemen tepki verir; yavaş iş de çalışır.
  tepki_millis(sim) {
    sim.run(50)
    sim.drive(2, false)
    sim.run(5)
    assert.equal(sim.read(13), true, 'LED butona ms içinde tepki vermeli')
    sim.run(95)
    sim.drive(2, true)
    sim.run(5)
    assert.equal(sim.read(13), false)
    assert.match(sim.serial, /BASILDI/)
    sim.run(1200)
    const tik = (sim.serial.match(/tik/g) || []).length
    assert.ok(tik >= 2, `yavaş iş de 500 ms'de bir çalışmalı (tik: ${tik})`)
  },

  // İki nokta kalibrasyonu: kuru 4,5 V -> %0, ıslak 1,5 V -> %100, ortası %50; uçlar kırpılır.
  nem_kalibrasyon(sim) {
    const son = () => sim.serial.trim().split(/\r?\n/).at(-1)
    sim.analog(0, 4.5)                           // nem 0
    sim.run(1100)
    assert.match(son(), /^Ham=921 Nem: 0%$/, son())
    sim.analog(0, 1.5)                           // nem 1
    sim.run(700)
    assert.match(son(), /^Ham=307 Nem: 100%$/, son())
    sim.analog(0, 3.0)                           // nem 0,5
    sim.run(700)
    assert.match(son(), /^Ham=614 Nem: 50%$/, son())
    // uçların dışı kırpılır (constrain)
    sim.analog(0, 5)
    sim.run(700)
    assert.match(son(), /Nem: 0%$/)
    sim.analog(0, 0.5)
    sim.run(700)
    assert.match(son(), /Nem: 100%$/)
    // 3V3 beslemede aynı toprak (nem 0,5 -> AO 1,98 V) yanlış yüzde verir
    sim.analog(0, 1.98)
    sim.run(700)
    const yanlis = Number(son().match(/Nem: (\d+)%/)[1])
    assert.ok(yanlis >= 83 && yanlis <= 85, `3V3'te eski kalibrasyon ~%84 demeli, ${yanlis}`)
  },

  // Fail-safe: yankı yoksa "YOK" ve LED kapalı; 15 cm'de LED yanar; 100 cm'de söner.
  mesafe_veya_yok(sim) {
    const u = sim.hcsr04({ trig: 9, echo: 10, cm: 100 })
    const son = () => sim.serial.trim().split(/\r?\n/).at(-1)
    sim.run(500)
    assert.match(son(), /^(99|100)\.\d cm$/, son())
    assert.equal(sim.read(13), false)
    u.cm = 15
    sim.run(400)
    assert.match(son(), /^1[45]\.\d cm$/, son())
    assert.equal(sim.read(13), true, '20 cm altında LED yanmalı')
    u.cm = 450                                   // menzil dışı = beslenmeyen sensörle aynı: echo yok
    sim.run(500)
    assert.equal(son(), 'YOK')
    assert.equal(sim.read(13), false, 'sensör sessizken LED kapalı (güvenli)')
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

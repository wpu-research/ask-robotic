import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

// --- NEC dalga biçimi (ders 61) --------------------------------------------

/** D2'yi µs duyarlığıyla sürer: low = true -> pin LOW (taşıyıcı var), süre µs. */
function darbe(sim, pin, low, us) {
  sim.drive(pin, !low)
  sim.run(us / 1000)
}

/** Standart NEC mesajı: ön darbe, 32 bit (LSB önce: adres, ~adres, komut, ~komut), bitiş darbesi. */
function necMesaj(sim, adres, komut, pin = 2) {
  const baslangic = sim.nowMs()
  const baytlar = [adres, ~adres & 0xff, komut, ~komut & 0xff]
  darbe(sim, pin, true, 9000)
  darbe(sim, pin, false, 4500)
  for (const bayt of baytlar) {
    for (let i = 0; i < 8; i++) {
      darbe(sim, pin, true, 562.5)
      darbe(sim, pin, false, (bayt >> i) & 1 ? 1687.5 : 562.5)
    }
  }
  darbe(sim, pin, true, 562.5)
  sim.drive(pin, true)
  return sim.nowMs() - baslangic
}

/** Tekrar mesajı: 9 ms darbe, 2,25 ms boşluk, 562,5 µs bitiş darbesi. */
function necTekrar(sim, pin = 2) {
  darbe(sim, pin, true, 9000)
  darbe(sim, pin, false, 2250)
  darbe(sim, pin, true, 562.5)
  sim.drive(pin, true)
}

/** EEPROM'a gerçekten yapılan yazma sayısını sayar (backend.writeMemory çağrıları). */
function yazmaSayaci(sim) {
  const sayac = { adet: 0, adresler: [] }
  const orijinal = sim.eeprom.backend.writeMemory.bind(sim.eeprom.backend)
  sim.eeprom.backend.writeMemory = (adres, deger) => {
    sayac.adet++
    sayac.adresler.push(adres)
    orijinal(adres, deger)
  }
  return sayac
}

const hex2 = (n) => n.toString(16).toUpperCase().padStart(2, '0')

export default {
  nec_zamanlari(sim) {
    sim.run(20)
    const sure = necMesaj(sim, 0x00, 0x16)
    sim.run(30)
    const m = sim.serial.match(/On darbe: (\d+) us, ilk bit darbesi: (\d+) us/)
    assert.ok(m, `ölçüm satırı yok: ${JSON.stringify(sim.serial)}`)
    assert.ok(Math.abs(Number(m[1]) - 9000) < 120, `ön darbe ~9000 µs bekleniyordu: ${m[1]}`)
    assert.ok(Math.abs(Number(m[2]) - 562.5) < 60, `ilk bit darbesi ~562 µs bekleniyordu: ${m[2]}`)
    // Dersteki "~68 ms" iddiası: 16 bir + 16 sıfır
    assert.ok(Math.abs(sure - 68.06) < 0.1, `mesaj süresi ~68,06 ms bekleniyordu: ${sure}`)
  },

  nec_cozucu(sim) {
    sim.run(20)
    // Farklı komutlar çözülür: hem adres hem komut doğru gelmeli
    for (const [adres, komut] of [[0x00, 0x16], [0x00, 0x45], [0x7a, 0xff], [0x01, 0x00]]) {
      const once = sim.serial.length
      necMesaj(sim, adres, komut)
      sim.run(30)
      const yeni = sim.serial.slice(once)
      assert.ok(yeni.includes(`Adres: 0x${hex2(adres)} Komut: 0x${hex2(komut)}`),
        `0x${hex2(adres)}/0x${hex2(komut)} çözülmedi: ${JSON.stringify(yeni)}`)
      sim.run(70)
    }

    // LED: 0x0C açar, 0x18 kapatır, başka komut dokunmaz
    assert.equal(sim.read(13), false, 'başta LED sönük olmalı')
    necMesaj(sim, 0x00, 0x0c); sim.run(30)
    assert.equal(sim.read(13), true, '0x0C LED yakmalıydı')
    sim.run(70)
    necMesaj(sim, 0x00, 0x16); sim.run(30)
    assert.equal(sim.read(13), true, 'başka komut LED durumunu değiştirmemeliydi')
    sim.run(70)
    necMesaj(sim, 0x00, 0x18); sim.run(30)
    assert.equal(sim.read(13), false, '0x18 LED söndürmeliydi')
    sim.run(70)

    // Tekrar mesajı
    const once = sim.serial.length
    necTekrar(sim); sim.run(30)
    assert.ok(/tekrar/.test(sim.serial.slice(once)), `tekrar mesajı bildirilmedi: ${JSON.stringify(sim.serial.slice(once))}`)

    // Bozuk mesaj (komutun tersi yanlış) reddedilir
    sim.run(70)
    const onceBozuk = sim.serial.length
    darbe(sim, 2, true, 9000); darbe(sim, 2, false, 4500)
    for (const bayt of [0x00, 0xff, 0x0c, 0x0c]) {            // son bayt ~0x0C olmalıydı
      for (let i = 0; i < 8; i++) {
        darbe(sim, 2, true, 562.5)
        darbe(sim, 2, false, (bayt >> i) & 1 ? 1687.5 : 562.5)
      }
    }
    darbe(sim, 2, true, 562.5); sim.drive(2, true)
    sim.run(150)
    assert.equal(sim.serial.slice(onceBozuk), '', `bozuk mesaj yazdırılmamalıydı: ${JSON.stringify(sim.serial.slice(onceBozuk))}`)

    // Bozuk mesajdan sonra çözücü toparlanır
    necMesaj(sim, 0x00, 0x0c); sim.run(30)
    assert.equal(sim.read(13), true, 'bozuk mesajdan sonra çözücü toparlanmalıydı')
  },

  // --- Ders 62 ---------------------------------------------------------------
  keypad_tus(sim) {
    const k = sim.keypad({ rows: [9, 8, 7, 6], cols: [5, 4, 3, 2] })
    sim.run(100)
    assert.equal(sim.serial, '', 'basış yokken çıktı olmamalı')
    // Her tuş doğru harfi vermeli (satır/sütun eşlemesi)
    const hepsi = ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D']
    for (const t of hepsi) { k.press(t); sim.run(60); k.release(); sim.run(60) }
    const beklenen = hepsi.map((t) => `Tus: ${t}`).join('\r\n') + '\r\n'
    assert.equal(sim.serial, beklenen, `tuş sırası yanlış: ${JSON.stringify(sim.serial)}`)
    // Basılı tutmak tek basış sayılır
    const once = sim.serial.length
    k.press('7'); sim.run(1000); k.release(); sim.run(60)
    assert.equal(sim.serial.slice(once), 'Tus: 7\r\n', `basılı tutma tek basış olmalı: ${JSON.stringify(sim.serial.slice(once))}`)
  },

  keypad_sifre(sim) {
    const k = sim.keypad({ rows: [9, 8, 7, 6], cols: [5, 4, 3, 2] })
    const yaz = (metin) => { for (const t of metin) { k.press(t); sim.run(60); k.release(); sim.run(60) } }
    const yeni = (f) => { const o = sim.serial.length; f(); return sim.serial.slice(o) }
    sim.run(100)

    // doğru PIN
    let c = yeni(() => yaz('1234#'))
    assert.ok(c.includes('Girilen: ****'), `4 yıldız bekleniyordu: ${JSON.stringify(c)}`)
    assert.ok(c.includes('PIN dogru'), `doğru PIN kabul edilmeliydi: ${JSON.stringify(c)}`)
    assert.equal(sim.read(13), true, 'doğru PIN: yeşil LED yanmalı')
    assert.equal(sim.read(12), false, 'doğru PIN: kırmızı LED sönük olmalı')
    sim.run(1100)
    assert.equal(sim.read(13), false, 'yeşil LED ~1 sn sonra sönmeli')

    // eksik PIN: deneme sayılmaz
    c = yeni(() => yaz('12#'))
    assert.ok(c.includes('PIN 4 haneli olmali'), `eksik PIN uyarısı bekleniyordu: ${JSON.stringify(c)}`)
    assert.ok(!c.includes('yanlis'), 'eksik giriş yanlış sayılmamalı')

    // eksik giriş korunur ("12"); * son rakamı siler ("1"); 234 eklenince "1234" olur
    yeni(() => yaz('*'))                          // "1"
    c = yeni(() => yaz('234#'))
    assert.ok(c.includes('PIN dogru'), `* sildikten sonra 1+234 doğru olmalıydı: ${JSON.stringify(c)}`)
    sim.run(1100)

    // yanlış PIN sayacı: 1/3, 2/3, 3/3 + uyarı, sonra sayaç sıfırlanır
    c = yeni(() => yaz('0000#'))
    assert.ok(c.includes('PIN yanlis (1/3)'), JSON.stringify(c))
    assert.equal(sim.read(12), true, 'yanlış PIN: kırmızı LED yanmalı')
    sim.run(1100)
    assert.equal(sim.read(12), false, 'kırmızı LED ~1 sn sonra sönmeli')
    c = yeni(() => yaz('1111#'))
    assert.ok(c.includes('PIN yanlis (2/3)'), JSON.stringify(c))
    c = yeni(() => yaz('2222#'))
    assert.ok(c.includes('PIN yanlis (3/3)') && c.includes('Cok fazla yanlis deneme'), JSON.stringify(c))
    c = yeni(() => yaz('3333#'))
    assert.ok(c.includes('PIN yanlis (1/3)'), `sayaç sıfırlanmalıydı: ${JSON.stringify(c)}`)

    // doğru PIN sayacı sıfırlar
    c = yeni(() => yaz('1234#'))
    assert.ok(c.includes('PIN dogru'))
    c = yeni(() => yaz('9999#'))
    assert.ok(c.includes('PIN yanlis (1/3)'), `doğru PIN sonrası sayaç 1'den başlamalı: ${JSON.stringify(c)}`)

    // 4 haneden fazla rakam yok sayılır
    sim.run(1100)
    c = yeni(() => yaz('123456#'))
    assert.ok(c.includes('PIN dogru'), `fazla rakamlar yok sayılmalıydı (1234): ${JSON.stringify(c)}`)

    // A-D tuşları etkisiz
    sim.run(1100)
    c = yeni(() => yaz('ABCD'))
    assert.equal(c, '', `A-D tuşları çıktı vermemeli: ${JSON.stringify(c)}`)
  },

  // --- Ders 63 ---------------------------------------------------------------
  kart_taklit(sim) {
    sim.run(100)
    const gonder = (metin) => {
      const once = sim.serial.length
      for (const c of metin) { sim.sendSerial(c); sim.run(2) }
      sim.run(50)
      return sim.serial.slice(once)
    }
    // yetkili kart
    let c = gonder('KART:AABBCCDD\n')
    assert.equal(c, 'UID: AA BB CC DD\r\nYETKILI\r\n', JSON.stringify(c))
    assert.equal(sim.read(13), true, 'yetkili: yeşil LED yanmalı')
    assert.equal(sim.read(12), false)
    sim.run(1000)
    assert.equal(sim.read(13), false, 'yeşil LED ~1 sn sonra sönmeli')
    // küçük harf ve CRLF
    c = gonder('KART:aabbccdd\r\n')
    assert.ok(c.includes('YETKILI'), `küçük harf kabul edilmeliydi: ${JSON.stringify(c)}`)
    sim.run(1000)
    // yetkisiz kart; baştaki sıfırlar korunur
    c = gonder('KART:0102030F\n')
    assert.equal(c, 'UID: 01 02 03 0F\r\nYETKISIZ\r\n', JSON.stringify(c))
    assert.equal(sim.read(12), true, 'yetkisiz: kırmızı LED yanmalı')
    assert.equal(sim.read(13), false)
    sim.run(1000)
    assert.equal(sim.read(12), false)
    // bozuk satırlar reddedilir
    for (const kotu of ['KART:AABB\n', 'KART:ZZZZZZZZ\n', 'MERHABA\n', 'KART:AABBCCDDEE\n', 'kart:AABBCCDD\n']) {
      c = gonder(kotu)
      assert.equal(c, 'Gecersiz satir\r\n', `${JSON.stringify(kotu)} reddedilmeliydi: ${JSON.stringify(c)}`)
      assert.equal(sim.read(13), false, 'bozuk satır kapıyı açmamalı')
    }
    // boş satır sessiz geçer; parçalı gelen satır sonunda çözülür
    c = gonder('\n')
    assert.equal(c, '')
    c = gonder('KART:AA')
    assert.equal(c, '', `satır bitmeden çıktı olmamalı: ${JSON.stringify(c)}`)
    c = gonder('BBCCDD\n')
    assert.ok(c.includes('YETKILI'), `parçalı satır çözülmeliydi: ${JSON.stringify(c)}`)
  },

  // --- Ders 64 ---------------------------------------------------------------
  yetki_yonetimi(sim, kaynak) {
    const yaz = yazmaSayaci(sim)
    const mem = () => sim.eeprom.backend.memory
    const komut = (m, metin) => {
      const once = m.serial.length
      for (const c of metin + '\n') { m.sendSerial(c); m.run(2) }
      m.run(150)
      return m.serial.slice(once)
    }
    sim.run(100)

    // İlk açılış: fabrika ayarı = 4+4 PIN baytı + sayaç + işaret = 10 yazma
    assert.ok(sim.serial.includes('Fabrika ayari yazildi'), JSON.stringify(sim.serial))
    assert.ok(sim.serial.includes('Kart sayisi: 0'))
    assert.equal(yaz.adet, 10, `ilk kurulum 10 yazma olmalı: ${yaz.adet}`)
    assert.equal(mem()[0], 0xa5)
    assert.equal(String.fromCharCode(...mem().slice(1, 5)), '1234')
    assert.equal(String.fromCharCode(...mem().slice(5, 9)), '9999')
    assert.equal(mem()[9], 0)

    // Okuma komutları EEPROM'a yazmaz
    let c = komut(sim, 'GIRIS:1234'); assert.equal(c, 'PIN DOGRU\r\n')
    c = komut(sim, 'GIRIS:0000'); assert.equal(c, 'PIN YANLIS\r\n')
    c = komut(sim, 'KART:AABBCCDD'); assert.equal(c, 'YETKISIZ\r\n')
    c = komut(sim, 'LISTE'); assert.equal(c, 'Kart sayisi: 0\r\n')
    assert.equal(yaz.adet, 10, 'okuma komutları yazma yapmamalı')

    // Master PIN yanlışsa hiçbir şey değişmez
    c = komut(sim, 'EKLE:0000:AABBCCDD'); assert.equal(c, 'MASTER PIN YANLIS\r\n')
    c = komut(sim, 'SIL:1234:AABBCCDD'); assert.equal(c, 'MASTER PIN YANLIS\r\n')   // kullanıcı PIN'i master değil
    c = komut(sim, 'PINDEGIS:1234:5555'); assert.equal(c, 'MASTER PIN YANLIS\r\n')
    assert.equal(yaz.adet, 10)

    // Kart ekle: 4 UID baytı + 1 sayaç = 5 yazma
    c = komut(sim, 'EKLE:9999:AABBCCDD'); assert.equal(c, 'EKLENDI (1/8)\r\n')
    assert.equal(yaz.adet, 15, `ilk kart 5 yazma harcamalı: ${yaz.adet - 10}`)
    assert.deepEqual([...mem().slice(10, 14)], [0xaa, 0xbb, 0xcc, 0xdd])
    c = komut(sim, 'KART:AABBCCDD'); assert.equal(c, 'YETKILI\r\n')
    // Aynı kartı tekrar eklemek yazma harcamaz
    c = komut(sim, 'EKLE:9999:AABBCCDD'); assert.equal(c, 'ZATEN VAR\r\n')
    assert.equal(yaz.adet, 15, 'aynı kart ikinci kez yazılmamalı')

    // İki kart daha: liste sırası
    komut(sim, 'EKLE:9999:01020304')
    komut(sim, 'EKLE:9999:0A0B0C0D')
    c = komut(sim, 'LISTE')
    assert.equal(c, 'Kart sayisi: 3\r\n1: AA BB CC DD\r\n2: 01 02 03 04\r\n3: 0A 0B 0C 0D\r\n', JSON.stringify(c))

    // Ortadakini sil: son kart onun yerine gelir; 4 bayt + sayaç en çok 5 yazma
    const oncekiYazma = yaz.adet
    c = komut(sim, 'SIL:9999:01020304'); assert.equal(c, 'SILINDI (2/8)\r\n')
    assert.ok(yaz.adet - oncekiYazma <= 5, `silme en çok 5 yazma harcamalı: ${yaz.adet - oncekiYazma}`)
    c = komut(sim, 'LISTE')
    assert.equal(c, 'Kart sayisi: 2\r\n1: AA BB CC DD\r\n2: 0A 0B 0C 0D\r\n', JSON.stringify(c))
    c = komut(sim, 'KART:01020304'); assert.equal(c, 'YETKISIZ\r\n')
    c = komut(sim, 'KART:0A0B0C0D'); assert.equal(c, 'YETKILI\r\n')
    c = komut(sim, 'SIL:9999:01020304'); assert.equal(c, 'BULUNAMADI\r\n')

    // Liste dolunca
    for (const u of ['11111111', '22222222', '33333333', '44444444', '55555555', '66666666']) komut(sim, `EKLE:9999:${u}`)
    c = komut(sim, 'LISTE'); assert.ok(c.startsWith('Kart sayisi: 8'), JSON.stringify(c))
    c = komut(sim, 'EKLE:9999:77777777'); assert.equal(c, 'LISTE DOLU\r\n')
    komut(sim, 'SIL:9999:11111111'); komut(sim, 'SIL:9999:22222222'); komut(sim, 'SIL:9999:33333333')
    komut(sim, 'SIL:9999:44444444'); komut(sim, 'SIL:9999:55555555'); komut(sim, 'SIL:9999:66666666')

    // Geçersiz girdiler
    c = komut(sim, 'EKLE:9999:XYZ'); assert.equal(c, 'Gecersiz UID\r\n')
    c = komut(sim, 'KART:12'); assert.equal(c, 'Gecersiz UID\r\n')
    c = komut(sim, 'MERHABA'); assert.equal(c, 'Bilinmeyen komut\r\n')
    c = komut(sim, 'EKLE:9999'); assert.equal(c, 'Bilinmeyen komut\r\n')

    // PIN değiştirme
    c = komut(sim, 'PINDEGIS:9999:12'); assert.equal(c, 'PIN 4 rakam olmali\r\n')
    c = komut(sim, 'PINDEGIS:9999:abcd'); assert.equal(c, 'PIN 4 rakam olmali\r\n')
    c = komut(sim, 'PINDEGIS:9999:4321'); assert.equal(c, 'PIN DEGISTI\r\n')
    assert.equal(komut(sim, 'GIRIS:1234'), 'PIN YANLIS\r\n')
    assert.equal(komut(sim, 'GIRIS:4321'), 'PIN DOGRU\r\n')

    // "Kartı yeniden aç": EEPROM yeni karta taşınır; veriler kalır, açılışta yazma yapılmaz
    const bellek = Uint8Array.from(mem())
    const yeni = createSim(kaynak, { name: 'yetki_yonetimi' })
    yeni.eeprom.backend.memory.set(bellek)
    const yaz2 = yazmaSayaci(yeni)
    yeni.run(100)
    assert.ok(!yeni.serial.includes('Fabrika'), 'ikinci açılışta fabrika ayarı yazılmamalı')
    assert.ok(yeni.serial.includes('Kart sayisi: 2'), JSON.stringify(yeni.serial))
    assert.equal(yaz2.adet, 0, 'sonraki açılışlar EEPROM yazmamalı')
    assert.equal(komut(yeni, 'GIRIS:4321'), 'PIN DOGRU\r\n')
    assert.equal(komut(yeni, 'KART:0A0B0C0D'), 'YETKILI\r\n')
    assert.equal(komut(yeni, 'KART:AABBCCDD'), 'YETKILI\r\n')
    assert.equal(komut(yeni, 'KART:01020304'), 'YETKISIZ\r\n')

    // Yarım kalan kurulum: işaret yok ama PIN baytları yazılmış -> yeniden kurulum
    const yarim = createSim(kaynak, { name: 'yetki_yonetimi' })
    yarim.eeprom.backend.memory.set(bellek)
    yarim.eeprom.backend.memory[0] = 0xff
    yarim.run(100)
    assert.ok(yarim.serial.includes('Fabrika ayari yazildi'), 'işaret yoksa yeniden kurulum yapılmalı')
    assert.equal(komut(yarim, 'GIRIS:1234'), 'PIN DOGRU\r\n')

    // Bozuk kart sayacı (255) güvenli: liste taşmaz
    const bozuk = createSim(kaynak, { name: 'yetki_yonetimi' })
    bozuk.eeprom.backend.memory.set(bellek)
    bozuk.eeprom.backend.memory[9] = 255
    bozuk.run(100)
    assert.ok(bozuk.serial.includes('Kart sayisi: 0'), JSON.stringify(bozuk.serial))
    assert.equal(komut(bozuk, 'KART:AABBCCDD'), 'YETKISIZ\r\n')
  },

  // --- Ders 65: uçtan uca senaryo ---------------------------------------------
  akilli_kapi(sim, kaynak) {
    const k = sim.keypad({ rows: [9, 8, 7, 6], cols: [5, 4, 3, 2] })
    const lcd = sim.lcdI2C({ address: 0x27 })
    const yaz = yazmaSayaci(sim)
    const ekran = () => lcd.text.map((x) => x.trimEnd())
    const tus = (t) => { k.press(t); sim.run(60); k.release(); sim.run(60) }
    const pin = (metin) => { for (const t of metin) tus(t) }
    const komut = (metin) => {
      const once = sim.serial.length
      for (const c of metin + '\n') { sim.sendSerial(c); sim.run(2) }
      sim.run(150)
      return sim.serial.slice(once)
    }
    const servoUs = () => {                      // son servo darbesi (µs)
      const w = sim.pulseWidthsUs(10, sim.nowMs() - 60, sim.nowMs())
      assert.ok(w.length >= 2, 'servo darbesi yok')
      return w.at(-1)
    }
    const durum = (kilitli, acik) => {
      assert.equal(sim.read(12), kilitli, `kırmızı LED ${kilitli ? 'yanmalı' : 'sönük olmalı'}`)
      assert.equal(sim.read(13), acik, `yeşil LED ${acik ? 'yanmalı' : 'sönük olmalı'}`)
    }
    const yaklasik = (v, hedef, tol, ad) => assert.ok(Math.abs(v - hedef) <= tol, `${ad}: ${hedef} bekleniyordu, ${v}`)
    const yeniSeri = (f) => { const o = sim.serial.length; f(); return sim.serial.slice(o) }

    // 1) Açılış: kilitli, servo 0°, ekran istemi
    sim.run(1800)
    assert.ok(sim.serial.includes('Akilli kapi hazir'))
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN veya kart'])
    yaklasik(servoUs(), 544, 40, 'kilitli servo darbesi')
    durum(true, false)

    // 2) Yetkili kart ekle (master PIN ile)
    assert.equal(komut('EKLE:9999:AABBCCDD').trim(), 'EKLENDI (1/8)')
    const yazmaOnce = yaz.adet

    // 3) PIN girişi: yıldızlar, silme, onay
    tus('1'); tus('2')
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN: **'])
    tus('*')
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN: *'])
    tus('5'); tus('*')
    pin('234')
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN: ****'])
    tus('9')                                       // 5. rakam yok sayılır
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN: ****'])
    const tAc = sim.nowMs()
    const c1 = yeniSeri(() => { tus('#'); sim.run(100) })
    assert.ok(c1.includes('ACIK (PIN)'), `doğru PIN kapıyı açmalıydı: ${JSON.stringify(c1)}`)
    assert.deepEqual(ekran(), ['KAPI ACIK', 'Hos geldiniz'])
    yaklasik(servoUs(), 1472, 40, 'açık servo darbesi (90°)')
    durum(false, true)
    const bip = sim.wave(11, tAc, tAc + 400)
    yaklasik(bip.hz, 2000, 150, 'başarı sesi frekansı (Hz)')

    // 4) Açıkken tuş ve kart yok sayılır
    const c2 = yeniSeri(() => { pin('0000#'); komut('KART:11223344') })
    assert.ok(!c2.includes('YANLIS'), `açıkken deneme sayılmamalı: ${JSON.stringify(c2)}`)
    assert.ok(c2.includes('YOKSAYILDI'))

    // 5) Tam 5 sn sonra kilitlenir (4,8 sn'de hâlâ açık, 5,3 sn'de kilitli)
    sim.run(tAc + 4800 - sim.nowMs())
    durum(false, true)
    yaklasik(servoUs(), 1472, 40, '4,8 sn: hâlâ açık')
    sim.run(500)
    durum(true, false)
    yaklasik(servoUs(), 544, 40, '5,3 sn: kilitli')
    assert.ok(sim.serial.includes('\r\nKILITLI\r\n'))
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN veya kart'])
    const sureOlcum = sim.pinEdges(13, tAc - 1, tAc + 6000).filter((e) => e.value === false).at(0)
    yaklasik(sureOlcum.t - tAc, 5000, 250, 'açık kalma süresi (ms)')

    // 6) Yetkili kart (seri taklit) da açar; kart bilgisi büyük/küçük harfe duyarsız
    const c3 = komut('KART:aabbccdd')
    assert.ok(c3.includes('ACIK (KART)'), JSON.stringify(c3))
    assert.deepEqual(ekran(), ['KAPI ACIK', 'Hos geldiniz'])
    yaklasik(servoUs(), 1472, 40, 'kartla açılış')
    sim.run(5300)
    durum(true, false)

    // 7) Yanlış PIN: mesaj, kalan hak, ses; mesaj ~1,5 sn sonra kaybolur
    const tY = sim.nowMs()
    const c4 = yeniSeri(() => { pin('0000#'); sim.run(100) })
    assert.ok(c4.includes('YANLIS PIN 1/3'), JSON.stringify(c4))
    assert.deepEqual(ekran(), ['YANLIS PIN', 'Kalan hak: 2'])
    durum(true, false)
    yaklasik(servoUs(), 544, 40, 'yanlış PIN: servo kilitli kalmalı')
    const hata = sim.wave(11, tY + 500, tY + 1000)
    yaklasik(hata.hz, 400, 40, 'hata sesi frekansı (Hz)')
    sim.run(1700)
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN veya kart'])

    // 8) Eksik PIN: uyarı, deneme sayılmaz
    const c5 = yeniSeri(() => { pin('12#'); sim.run(100) })
    assert.ok(!c5.includes('YANLIS'), 'eksik PIN deneme sayılmamalı')
    assert.deepEqual(ekran(), ['PIN 4 haneli', 'olmali'])
    sim.run(1700)
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN: **'], 'eksik giriş silinmemeli')
    // yarım PIN, son tuştan 10 sn sonra silinir
    tus('*'); tus('1')
    const tYarim = sim.nowMs()
    sim.run(9500)
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN: **'], 'yarım PIN 9,5 sn sonra hâlâ duruyor olmalı')
    sim.run(800)
    assert.ok(sim.serial.includes('Giris zaman asimi'))
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN veya kart'])
    assert.ok(sim.nowMs() - tYarim > 10000)

    // 9) Ortak sayaç: (zaten 1 yanlış var) yetkisiz kart = 2, yanlış PIN = 3 -> BLOKE
    const c6 = komut('KART:11223344')
    assert.ok(c6.includes('YANLIS KART 2/3'), JSON.stringify(c6))
    assert.deepEqual(ekran(), ['YETKISIZ KART', 'Kalan hak: 1'])
    sim.run(1700)
    k.press('7'); sim.run(60); k.release(); sim.run(60)   // sayaç etkilenmez
    tus('*')
    const c7 = yeniSeri(() => { pin('8888'); k.press('#'); sim.run(60) })
    const tB = sim.nowMs() - 60
    k.release(); sim.run(100)
    assert.ok(c7.includes('YANLIS PIN 3/3') && c7.includes('BLOKE 30 sn'), JSON.stringify(c7))
    assert.deepEqual(ekran(), ['KILITLENDI', 'Bekle: 30 sn'])
    assert.equal(sim.read(13), false, 'bloke: yeşil LED sönük olmalı')
    yaklasik(servoUs(), 544, 40, 'bloke: servo kilitli')

    // 10) BLOKE: kırmızı LED 2 Hz yanıp söner, doğru PIN ve doğru kart işe yaramaz
    sim.run(2100)
    const wl = sim.wave(12, sim.nowMs() - 2000, sim.nowMs())
    yaklasik(wl.hz, 2, 0.3, 'bloke LED frekansı (Hz)')
    const c8 = yeniSeri(() => { pin('1234#'); komut('KART:AABBCCDD') })
    assert.ok(!c8.includes('ACIK'), `bloke sırasında kapı açılmamalı: ${JSON.stringify(c8)}`)
    assert.ok(c8.includes('YOKSAYILDI'))
    yaklasik(servoUs(), 544, 40, 'bloke: servo kilitli kalmalı')
    // geri sayım: ~10 sn sonra "Bekle: 20 sn" civarı
    sim.run(tB + 10000 - sim.nowMs() + 300)
    const alt = ekran()[1]
    const kalan = Number(alt.match(/Bekle: (\d+) sn/)?.[1])
    assert.ok(kalan >= 19 && kalan <= 20, `~20 sn kalmalıydı: ${alt}`)
    // 29,5 sn: hâlâ bloke; 30,5 sn: bitti
    sim.run(tB + 29500 - sim.nowMs())
    assert.ok(!sim.serial.includes('BLOKE bitti'), '29,5 sn: bloke sürmeli')
    assert.equal(ekran()[0], 'KILITLENDI')
    sim.run(1000)
    assert.ok(sim.serial.includes('BLOKE bitti'), '30,5 sn: bloke bitmeli')
    assert.deepEqual(ekran(), ['KAPI KILITLI', 'PIN veya kart'])
    durum(true, false)

    // 11) Bloke bitince sayaç sıfır: bir yanlış 1/3; doğru giriş sayacı sıfırlar
    const c9 = yeniSeri(() => { pin('3333#'); sim.run(100) })
    assert.ok(c9.includes('YANLIS PIN 1/3'), `sayaç sıfırlanmış olmalıydı: ${JSON.stringify(c9)}`)
    sim.run(1700)
    const c10 = komut('KART:AABBCCDD')
    assert.ok(c10.includes('ACIK (KART)'), JSON.stringify(c10))
    sim.run(5300)
    const c11 = yeniSeri(() => { pin('3333#'); sim.run(100) })
    assert.ok(c11.includes('YANLIS PIN 1/3'), `başarılı girişten sonra sayaç yeniden 1'den başlamalı: ${JSON.stringify(c11)}`)
    sim.run(1700)

    // 12) PIN değişimi
    assert.equal(komut('PINDEGIS:9999:4321').trim(), 'PIN DEGISTI')
    pin('1234#'); sim.run(100)
    assert.deepEqual(ekran(), ['YANLIS PIN', 'Kalan hak: 1'])
    sim.run(1700)
    pin('4321#'); sim.run(100)
    assert.deepEqual(ekran(), ['KAPI ACIK', 'Hos geldiniz'])
    sim.run(5300)

    // 13) Yetki denemeleri EEPROM'u yıpratmaz: yalnızca PINDEGIS (4 bayt, en çok 4 yazma) yazdı
    const yazmaFark = yaz.adet - yazmaOnce
    assert.ok(yazmaFark <= 4, `EEPROM yazması yalnız PINDEGIS'ten gelmeli (<=4), ${yazmaFark} yazma oldu`)

    // 14) Güç kesilip açılınca kart ve PIN korunur
    const bellek = Uint8Array.from(sim.eeprom.backend.memory)
    const yeni = createSim(kaynak, { name: 'akilli_kapi' })
    yeni.eeprom.backend.memory.set(bellek)
    yeni.keypad({ rows: [9, 8, 7, 6], cols: [5, 4, 3, 2] })
    const lcd2 = yeni.lcdI2C({ address: 0x27 })
    const yaz2 = yazmaSayaci(yeni)
    yeni.run(1800)
    assert.ok(!yeni.serial.includes('Fabrika'))
    assert.equal(yaz2.adet, 0, 'sonraki açılışlar EEPROM yazmamalı')
    for (const c of 'KART:AABBCCDD\n') { yeni.sendSerial(c); yeni.run(2) }
    yeni.run(200)
    assert.ok(yeni.serial.includes('ACIK (KART)'), 'yeniden açılışta kart hâlâ yetkili olmalı')
    assert.deepEqual(lcd2.text.map((x) => x.trimEnd()), ['KAPI ACIK', 'Hos geldiniz'])
  },
}

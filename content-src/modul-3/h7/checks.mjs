import assert from 'node:assert/strict'
import { createSim } from '../../../tools/sim/harness.mjs'

// --- Yardımcılar -----------------------------------------------------------

/**
 * shiftOut'u pin değişimlerinden çözer: mandal LOW iken saat pininin her yükselen
 * kenarında veri pinine bakar, mandal HIGH olunca toplanan 8 biti MSB-first bayta çevirir.
 * Dönüş: her tamamlanmış çerçeve için bir bayt dizisi.
 */
function cozShift(sim, veri, saat, mandal) {
  const durum = { [veri]: false, [saat]: false, [mandal]: false }
  const kare = []
  let bitler = null
  for (const e of sim.edges) {
    if (e.pin !== veri && e.pin !== saat && e.pin !== mandal) continue
    const onceki = durum[e.pin]
    durum[e.pin] = e.value
    if (e.pin === mandal) {
      if (!e.value) bitler = []                       // mandal düştü: çerçeve başladı
      else if (bitler) {                              // mandal yükseldi: çerçeve bitti
        if (bitler.length === 8) kare.push(bitler.reduce((b, x) => (b << 1) | x, 0))
        bitler = null
      }
    } else if (e.pin === saat && e.value && !onceki && bitler) {
      bitler.push(durum[veri] ? 1 : 0)
    }
  }
  return kare
}

/** NTC bölücüsünde (5 V - 10k - A2 - NTC - GND) verilen sıcaklığın A2 gerilimi (beta = 3950). */
function ntcVolt(derece) {
  const r = 10000 * Math.exp(3950 * (1 / (derece + 273.15) - 1 / 298.15))
  return (5 * r) / (10000 + r)
}

/** Seri çıktıdaki son tam satırı { sicaklik, hedef, role } olarak döndürür. */
function sonSatir(sim) {
  const satirlar = sim.serial.split('\n').filter((l) => /^sicaklik=.* hedef=\d+ role=[01]\s*$/.test(l))
  assert.ok(satirlar.length > 0, `seri çıktıda ölçüm satırı yok: ${JSON.stringify(sim.serial.slice(-120))}`)
  const m = satirlar.at(-1).match(/sicaklik=(-?[\d.]+) hedef=(\d+) role=([01])/)
  return { sicaklik: Number(m[1]), hedef: Number(m[2]), role: Number(m[3]) }
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

function bas(sim, pin, ms = 100) {
  sim.drive(pin, false)
  sim.run(ms)
  sim.drive(pin, true)
  sim.run(ms)
}

// --- Kontroller ------------------------------------------------------------

export default {
  yedi_segment_sayac(sim) {
    sim.run(10_500)
    const kareler = cozShift(sim, 4, 6, 5)
    const beklenen = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f]
    assert.deepEqual(kareler.slice(0, 10), beklenen, `0-9 desenleri yanlış: ${kareler.map((b) => b.toString(16)).join(' ')}`)
    // Her rakam yaklaşık 1 sn gösterilir: mandal yükselişleri ~1000 ms aralıklı
    const yukselis = sim.pinEdges(5).filter((e) => e.value).map((e) => e.t)
    const aralik = (yukselis[10] - yukselis[1]) / 9
    assert.ok(Math.abs(aralik - 1000) < 20, `rakam aralığı ~1000 ms olmalı, ${aralik.toFixed(0)} ms`)
  },

  led_seridi(sim) {
    sim.run(1_700)
    const kareler = cozShift(sim, 4, 6, 5)
    assert.deepEqual(kareler.slice(0, 8), [1, 2, 4, 8, 16, 32, 64, 128], `LED deseni yanlış: ${kareler.join(',')}`)
    assert.ok(kareler.length >= 8)
  },

  eeprom_sayac(sim, kaynak) {
    sim.run(300)
    assert.match(sim.serial, /Acilis sayisi: 1\b/)
    assert.equal(sim.eeprom.backend.memory[0], 1)
    // "Kartı yeniden aç": EEPROM içeriğini yeni bir karta taşı
    const bellek = Uint8Array.from(sim.eeprom.backend.memory)
    for (const beklenen of [2, 3]) {
      const yeni = createSim(kaynak, { name: 'eeprom_sayac' })
      yeni.eeprom.backend.memory.set(bellek)
      yeni.run(300)
      assert.match(yeni.serial, new RegExp(`Acilis sayisi: ${beklenen}\\b`))
      assert.equal(yeni.eeprom.backend.memory[0], beklenen)
      bellek.set(yeni.eeprom.backend.memory)
    }
  },

  eeprom_yipranma(sim) {
    const yaz = yazmaSayaci(sim)
    sim.run(200)
    assert.match(sim.serial, /10\. adres: 7/)
    assert.match(sim.serial, /11\. adres: 7/)
    assert.equal(sim.eeprom.backend.memory[10], 7)
    assert.equal(sim.eeprom.backend.memory[11], 7)
    const w10 = yaz.adresler.filter((a) => a === 10).length
    const w11 = yaz.adresler.filter((a) => a === 11).length
    assert.equal(w10, 5, `write() 5 kez yazmalı, ${w10}`)
    assert.equal(w11, 1, `update() yalnızca 1 kez yazmalı, ${w11}`)
  },

  eeprom_put_get(sim) {
    sim.run(300)
    const m = sim.eeprom.backend.memory
    assert.equal(m[20] | (m[21] << 8), 24, 'int hedef küçük-bayt-önce yazılmalı')
    const f = new DataView(new ArrayBuffer(4))
    for (let i = 0; i < 4; i++) f.setUint8(i, m[22 + i])
    assert.equal(f.getFloat32(0, true), 0.5)
    assert.match(sim.serial, /hedef=24 fark=0\.5/)
    assert.equal(m[26], 255, 'Ayar 6 bayttır; 26. adres boş kalmalı')
  },

  sram_string(sim) {
    sim.run(300)
    const once = Number(sim.serial.match(/Once: (-?\d+)/)?.[1])
    const sonra = Number(sim.serial.match(/Sonra: (-?\d+)/)?.[1])
    assert.ok(once > 1000 && once < 2048, `başlangıç boş SRAM makul değil: ${once}`)
    assert.ok(once - sonra >= 90 && once - sonra <= 140, `100 karakterlik String yaklaşık 100 bayt yer almalı: fark ${once - sonra}`)
    assert.match(sim.serial, /String uzunlugu: 100/)
  },

  termostat(sim, kaynak) {
    const yaz = yazmaSayaci(sim)

    // 1) Boş EEPROM (255): varsayılan hedef 22. 15 derece: ısıtmalı.
    sim.analog(2, ntcVolt(15))
    sim.run(1500)
    let s = sonSatir(sim)
    assert.equal(s.hedef, 22, 'boş EEPROM varsayılan 22 vermeli')
    assert.ok(Math.abs(s.sicaklik - 15) < 0.4, `15 °C bekleniyordu: ${s.sicaklik}`)
    assert.equal(s.role, 1)
    assert.equal(sim.read(7), true, '15 °C hedefin altında: röle açık olmalı')

    // 2) Histerezis: 22,2 °C iken röle hâlâ açık (kapanma eşiği 22,5)
    sim.analog(2, ntcVolt(22.2))
    sim.run(1000)
    assert.ok(Math.abs(sonSatir(sim).sicaklik - 22.2) < 0.4)
    assert.equal(sim.read(7), true, '22,2 °C: histerezis bölgesinde röle açık kalmalı')

    // 3) 23 °C: röle kapanır
    sim.analog(2, ntcVolt(23))
    sim.run(1000)
    assert.equal(sim.read(7), false, '23 °C hedefin üstünde: röle kapanmalı')

    // 4) 22,2 °C'ye inince röle kapalı kalır (açma eşiği 21,5)
    sim.analog(2, ntcVolt(22.2))
    sim.run(1000)
    assert.equal(sim.read(7), false, '22,2 °C: histerezis bölgesinde röle kapalı kalmalı')

    // 5) 21 °C: tekrar açılır
    sim.analog(2, ntcVolt(21))
    sim.run(1000)
    assert.equal(sim.read(7), true, '21 °C: röle yeniden açılmalı')

    // Henüz hiç EEPROM yazısı olmadı
    assert.equal(yaz.adet, 0, 'butona basılmadan EEPROM yazılmamalı')
    assert.equal(sim.eeprom.backend.memory[0], 255)

    // 6) D2 (artır) bir kez: hedef 23, AYAR durumunda röle kapanır, EEPROM henüz yazılmadı
    bas(sim, 2)
    sim.run(600)
    s = sonSatir(sim)
    assert.equal(s.hedef, 23)
    assert.equal(sim.read(7), false, 'AYAR durumunda röle kapalı olmalı')
    assert.equal(sim.eeprom.backend.memory[0], 255, 'ayar bitmeden EEPROM yazılmamalı')

    // 7) D3 (azalt) üç kez: hedef 20. Art arda basış tek yazma harcamalı
    bas(sim, 3)
    bas(sim, 3)
    bas(sim, 3)
    sim.run(600)
    assert.equal(sonSatir(sim).hedef, 20)
    assert.equal(sim.eeprom.backend.memory[0], 255, 'süre dolmadan EEPROM yazılmamalı')

    // 8) 2 sn sonra hedef EEPROM'a yazılır; 21 °C > 20 + 0,5 değil ama 21 > 20,5 -> röle kapalı
    sim.run(2500)
    assert.equal(sim.eeprom.backend.memory[0], 20, 'hedef 20 EEPROM adres 0 a yazılmalı')
    assert.equal(yaz.adet, 1, `art arda 4 basış tek EEPROM yazması olmalı, ${yaz.adet}`)
    assert.equal(sim.read(7), false, '21 °C, hedef 20: röle kapalı olmalı')

    // 9) Sıcaklık hedefin altına düşünce yeniden ısıtma (19 <= 19,5)
    sim.analog(2, ntcVolt(19))
    sim.run(1200)
    assert.equal(sim.read(7), true, '19 °C, hedef 20: röle açık olmalı')

    // 10) Sınırlar: hedef 35'in üstüne çıkmaz
    for (let i = 0; i < 20; i++) bas(sim, 2, 80)
    sim.run(2500)
    assert.equal(sonSatir(sim).hedef, 35)
    assert.equal(sim.eeprom.backend.memory[0], 35)

    // 11) Yeniden başlatma: EEPROM'daki hedef (30) korunur
    const bellek = Uint8Array.from(sim.eeprom.backend.memory)
    bellek[0] = 30
    const yeni = createSim(kaynak, { name: 'termostat' })
    yeni.eeprom.backend.memory.set(bellek)
    yeni.analog(2, ntcVolt(25))
    yeni.run(1500)
    s = sonSatir(yeni)
    assert.equal(s.hedef, 30, 'EEPROM hedefi açılışta okunmalı')
    assert.equal(s.role, 1, '25 °C, hedef 30: röle açık')
    assert.equal(yeni.read(7), true)
  },
}

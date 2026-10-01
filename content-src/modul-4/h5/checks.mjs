import assert from 'node:assert/strict'

// Seri çıktıdan son tam satırı döndürür.
function sonSatir(sim) {
  const s = sim.serial.split(/\r?\n/).filter((x) => x.trim().length)
  // son satır yarım olabilir; sondan bir önceki tam satırdır
  return s.length > 1 ? s.at(-2) : s.at(-1) || ''
}
const sayilar = (satir, ad) => {
  const m = satir.match(new RegExp(`${ad}=(-?\\d+)`))
  assert.ok(m, `"${ad}=" bulunamadı, satır: ${JSON.stringify(satir)}`)
  return Number(m[1])
}
const yakin = (deger, beklenen, tol, ad) =>
  assert.ok(Math.abs(deger - beklenen) <= tol, `${ad}: ${beklenen} ± ${tol} bekleniyordu, ${deger} geldi`)


const CLK = 2, DT = 3
// Bir "tık": CLK/DT'yi 90° faz farkıyla sürer. yon=+1: 11→01→00→10→11 (CLK düşerken DT=1)
// yon=-1: 11→10→00→01→11 (CLK düşerken DT=0). Her durumda 3 ms ilerler.
function adimlar(sim, yon, n) {
  for (let i = 0; i < n; i++) {
    if (yon > 0) {
      sim.drive(CLK, false); sim.run(3)
      sim.drive(DT, false); sim.run(3)
      sim.drive(CLK, true); sim.run(3)
      sim.drive(DT, true); sim.run(3)
    } else {
      sim.drive(DT, false); sim.run(3)
      sim.drive(CLK, false); sim.run(3)
      sim.drive(DT, true); sim.run(3)
      sim.drive(CLK, true); sim.run(3)
    }
  }
}
// Bir tık sırasında CLK 0,2 ms aralıklarla 3 kez düşer (kontak sıçraması), DT=1 sabit.
function sicramali(sim) {
  sim.run(10)
  for (let i = 0; i < 2; i++) {
    sim.drive(CLK, false); sim.run(0.2)
    sim.drive(CLK, true); sim.run(0.2)
  }
  sim.drive(CLK, false); sim.run(3)   // üçüncü düşüş (ilk kenardan 0,8 ms sonra)
  sim.drive(CLK, true); sim.run(10)
}
const sonSayac = (sim) => {
  const m = [...sim.serial.matchAll(/Sayac: (-?\d+)/g)]
  assert.ok(m.length, 'Sayac çıktısı yok: ' + JSON.stringify(sim.serial))
  return Number(m.at(-1)[1])
}

export default {
  joystick_ham(sim) {
    sim.analog(0, 2.5)
    sim.analog(1, 0)
    sim.run(500)
    let s = sonSatir(sim)
    yakin(sayilar(s, 'X'), 512, 3, 'X orta')
    yakin(sayilar(s, 'Y'), 0, 1, 'Y alt uç')
    assert.equal(sayilar(s, 'BUTON'), 0, 'düğme bırakılmışken BUTON=0 olmalıydı')
    sim.analog(0, 5)
    sim.analog(1, 5)
    sim.drive(2, false)
    sim.run(500)
    s = sonSatir(sim)
    yakin(sayilar(s, 'X'), 1023, 1, 'X üst uç')
    yakin(sayilar(s, 'Y'), 1023, 1, 'Y üst uç')
    assert.equal(sayilar(s, 'BUTON'), 1, 'düğmeye basılıyken BUTON=1 olmalıydı')
  },

  joystick_kalibre(sim) {
    // Merkez tam 512 değil: X merkezi 2,6 V (≈532), Y merkezi 2,4 V (≈491)
    sim.analog(0, 2.6)
    sim.analog(1, 2.4)
    sim.run(400)
    let s = sonSatir(sim)
    assert.equal(sayilar(s, 'X'), 0, 'merkezde X=0 olmalı: ' + s)
    assert.equal(sayilar(s, 'Y'), 0, 'merkezde Y=0 olmalı: ' + s)
    assert.ok(/YON=ORTA/.test(s), 'merkezde YON=ORTA olmalı: ' + s)

    // ölü bölge: merkezden ~20 sayı (0,1 V) uzaklık sıfır sayılmalı
    sim.analog(0, 2.7)
    sim.run(400)
    assert.equal(sayilar(sonSatir(sim), 'X'), 0, 'ölü bölge içinde X=0 olmalı')

    // uçlar tam ±100
    sim.analog(0, 5)
    sim.run(400)
    assert.equal(sayilar(sonSatir(sim), 'X'), 100, 'üst uçta X=+100 olmalı')
    assert.ok(/YON=SAG/.test(sonSatir(sim)), 'X=+100 iken YON=SAG olmalı: ' + sonSatir(sim))
    sim.analog(0, 0)
    sim.run(400)
    assert.equal(sayilar(sonSatir(sim), 'X'), -100, 'alt uçta X=-100 olmalı')
    assert.ok(/YON=SOL/.test(sonSatir(sim)), 'YON=SOL olmalı')

    // ara değer: 3,8 V ≈ 777; fark ≈ 245 → (245-40)*100/(491-40) ≈ 45
    sim.analog(0, 3.8)
    sim.run(400)
    yakin(sayilar(sonSatir(sim), 'X'), 45, 3, 'ara değer X')

    // Y ekseni
    sim.analog(0, 2.6)
    sim.analog(1, 5)
    sim.run(400)
    assert.equal(sayilar(sonSatir(sim), 'Y'), 100, 'Y üst uç +100')
    assert.ok(/YON=YUKARI/.test(sonSatir(sim)), 'YON=YUKARI olmalı')

    // düğme: LED aç/kapat, basılı tutmak tek basış
    assert.equal(sim.read(13), false, 'LED başta sönük olmalı')
    sim.drive(2, false); sim.run(500); sim.drive(2, true); sim.run(100)
    assert.equal(sim.read(13), true, 'ilk basışta LED yanmalı')
    sim.drive(2, false); sim.run(500); sim.drive(2, true); sim.run(100)
    assert.equal(sim.read(13), false, 'ikinci basışta LED sönmeli')
  },

  enkoder_basit(sim) {
    sim.run(100)
    adimlar(sim, +1, 12)
    adimlar(sim, -1, 5)
    sim.run(50)
    assert.equal(sonSayac(sim), 7, '12 ileri + 5 geri = 7 olmalıydı, çıktı: ' + JSON.stringify(sim.serial))
    adimlar(sim, -1, 9)
    sim.run(50)
    assert.equal(sonSayac(sim), -2, '7 − 9 = -2 olmalıydı')
    // sıçrama: tek tık sırasında CLK 3 kez düşer → filtresiz sürüm 3 sayar
    const once = sonSayac(sim)
    sicramali(sim)
    sim.run(300)
    assert.equal(sonSayac(sim), once + 3, 'filtresiz sürüm sıçramayı 3 adım saymalıydı')
  },

  enkoder_filtreli(sim) {
    sim.run(100)
    adimlar(sim, +1, 12)
    adimlar(sim, -1, 5)
    sim.run(50)
    assert.equal(sonSayac(sim), 7, '12 ileri + 5 geri = 7 olmalıydı, çıktı: ' + JSON.stringify(sim.serial))
    adimlar(sim, -1, 9)
    sim.run(50)
    assert.equal(sonSayac(sim), -2, '7 − 9 = -2 olmalıydı')
    // sıçramalı tek tık yalnız 1 adım olmalı
    const once = sonSayac(sim)
    sicramali(sim)
    sim.run(300)
    assert.equal(sonSayac(sim), once + 1, 'filtreli sürüm sıçramalı tıkı 1 adım saymalıydı')
    // SW düğmesi sıfırlar
    sim.drive(4, false); sim.run(50); sim.drive(4, true); sim.run(50)
    assert.equal(sonSayac(sim), 0, 'SW sayacı sıfırlamalıydı')
    adimlar(sim, +1, 3)
    sim.run(50)
    assert.equal(sonSayac(sim), 3, 'sıfırdan sonra 3 ileri = 3 olmalıydı')
  },

  mpu_ham(sim) {
    const m = sim.mpu6050({ ax: 0.5, ay: -0.25, az: 0.866, gx: 12, gy: -3.5, gz: 0, tempC: 30 })
    sim.run(1500)
    const ham = sim.serial.match(/HAM ax=(-?\d+) ay=(-?\d+) az=(-?\d+)/)
    assert.ok(ham, 'HAM satırı yok: ' + JSON.stringify(sim.serial))
    assert.equal(Number(ham[1]), 8192, 'ax=0,5 g → ham 8192 olmalı')
    assert.equal(Number(ham[2]), -4096, 'ay=-0,25 g → ham -4096 olmalı (işaretli birleştirme)')
    yakin(Number(ham[3]), 14188, 2, 'az=0,866 g ham')
    const g = sim.serial.match(/g ax=(-?[\d.]+) ay=(-?[\d.]+) az=(-?[\d.]+) \| dps gx=(-?[\d.]+) gy=(-?[\d.]+) gz=(-?[\d.]+) \| C=(-?[\d.]+)/)
    assert.ok(g, 'çevrilmiş satır yok: ' + JSON.stringify(sim.serial))
    yakin(Number(g[1]), 0.5, 0.01, 'ax g')
    yakin(Number(g[2]), -0.25, 0.01, 'ay g')
    yakin(Number(g[3]), 0.87, 0.01, 'az g')
    yakin(Number(g[4]), 12, 0.2, 'gx °/s')
    yakin(Number(g[5]), -3.5, 0.2, 'gy °/s')
    yakin(Number(g[6]), 0, 0.2, 'gz °/s')
    yakin(Number(g[7]), 30, 0.3, 'sıcaklık °C')
  },

  mpu_egim(sim) {
    const m = sim.mpu6050({ ax: 0, ay: 0, az: 1 })
    const son = () => {
      sim.run(500)
      const a = [...sim.serial.matchAll(/pitch=(-?[\d.]+) roll=(-?[\d.]+)/g)]
      assert.ok(a.length > 1, 'pitch/roll çıktısı yok: ' + JSON.stringify(sim.serial))
      return { pitch: Number(a.at(-2)[1]), roll: Number(a.at(-2)[2]) }
    }
    let r = son()
    yakin(r.pitch, 0, 0.3, 'düz pitch'); yakin(r.roll, 0, 0.3, 'düz roll')
    assert.equal(sim.read(13), true, 'düz durumda LED (terazi) yanmalı')

    m.ax = 0.5; m.az = 0.866                      // bilinen vektör: 30°
    r = son()
    yakin(r.pitch, 30, 0.5, 'ax=0,5 az=0,866 → 30°')
    yakin(r.roll, 0, 0.3, 'roll 0 kalmalı')
    assert.equal(sim.read(13), false, '30° eğimde LED sönük olmalı')

    m.ax = -Math.SQRT1_2; m.az = Math.SQRT1_2     // −45°
    yakin(son().pitch, -45, 0.5, 'negatif eğim −45°')

    m.ax = Math.sin(60 * Math.PI / 180); m.az = Math.cos(60 * Math.PI / 180)
    yakin(son().pitch, 60, 0.5, '60°')

    m.ax = 0; m.ay = 0.5; m.az = 0.866            // roll 30°
    r = son()
    yakin(r.roll, 30, 0.5, 'ay=0,5 az=0,866 → roll 30°')
    yakin(r.pitch, 0, 0.3, 'pitch 0 kalmalı')

    m.ax = Math.sin(1 * Math.PI / 180); m.ay = 0; m.az = Math.cos(1 * Math.PI / 180)
    r = son()
    yakin(r.pitch, 1, 0.3, '1° eğim')
    assert.equal(sim.read(13), true, '1° eğimde LED (±2°) yanmalı')

    // ivmeölçerin zayıflığı: eğim yok ama yatay hızlanma ax=0,3 g → sahte ~16,7°
    m.ax = 0.3; m.ay = 0; m.az = 1
    yakin(son().pitch, 16.7, 0.4, 'yatay hızlanma sahte eğim')
  },

  mpu_sapma_olc(sim) {
    const m = sim.mpu6050({ ax: 0, ay: 0, az: 1, gy: 2 })
    sim.run(2500)
    const sap = sim.serial.match(/Sapma gy = (-?[\d.]+) derece/)
    assert.ok(sap, 'sapma satırı yok: ' + JSON.stringify(sim.serial))
    yakin(Number(sap[1]), 2, 0.02, 'ölçülen sapma')
    let l = sim.serial.match(/gy ham=(-?[\d.]+) duzeltilmis=(-?[\d.]+)/g).at(-1).match(/ham=(-?[\d.]+) duzeltilmis=(-?[\d.]+)/)
    yakin(Number(l[1]), 2, 0.1, 'durağan ham gy')
    yakin(Number(l[2]), 0, 0.1, 'durağan düzeltilmiş gy sıfır olmalı')
    m.gy = 32                                  // gerçek dönüş: 30 °/s + 2 °/s sapma
    sim.run(1200)
    l = sim.serial.match(/gy ham=(-?[\d.]+) duzeltilmis=(-?[\d.]+)/g).at(-1).match(/ham=(-?[\d.]+) duzeltilmis=(-?[\d.]+)/)
    yakin(Number(l[2]), 30, 0.2, 'dönerken düzeltilmiş gy')
  },

  mpu_integral(sim) {
    const aci0 = 10
    const m = sim.mpu6050({ ax: Math.sin(aci0 * Math.PI / 180), ay: 0, az: Math.cos(aci0 * Math.PI / 180), gy: 2 })
    const son = () => {
      const a = [...sim.serial.matchAll(/t=([\d.]+) ham=(-?[\d.]+) duz=(-?[\d.]+) acc=(-?[\d.]+)/g)].at(-1)
      assert.ok(a, 'çıktı yok: ' + JSON.stringify(sim.serial))
      return { t: Number(a[1]), ham: Number(a[2]), duz: Number(a[3]), acc: Number(a[4]) }
    }
    sim.run(2500 + 10500)
    let r = son()
    assert.ok(r.t >= 9.5, `t ≥ 9,5 olmalı: ${r.t}`)
    yakin(r.acc, aci0, 0.3, 'ivmeölçer açısı sabit kalmalı')
    yakin(r.ham, aci0 + 2 * r.t, 1.2, `sapma çıkarılmayan integral ${r.t} sn'de 2 °/s kaymalı`)
    assert.ok(r.ham - aci0 > 17, `10 sn'de ≈20° kayma bekleniyordu, ${(r.ham - aci0).toFixed(1)}°`)
    yakin(r.duz, aci0, 0.5, 'sapması çıkarılan integral sabit kalmalı')

    // sapma sonradan değişti (ısınma): düzeltilmiş integral de yavaşça kayar
    const t0 = r.t
    m.gy = 2.5
    sim.run(10000)
    r = son()
    yakin(r.duz, aci0 + 0.5 * (r.t - t0), 0.7, 'kalan 0,5 °/s hata birikmeli')
    assert.ok(r.duz - aci0 > 3.5, `kalan hata ≈5° kaymalı: ${(r.duz - aci0).toFixed(1)}`)
    assert.ok(r.ham - aci0 > 40, 'ham integral çok daha fazla kaymış olmalı')
  },

  mpu_tamamlayici(sim) {
    const rad = (d) => d * Math.PI / 180
    const m = sim.mpu6050({ ax: Math.sin(rad(20)), ay: 0, az: Math.cos(rad(20)), gy: 2 })
    const noktalar = () => [...sim.serial.matchAll(/t=([\d.]+) acc=(-?[\d.]+) saf=(-?[\d.]+) filtre=(-?[\d.]+)/g)]
      .map((a) => ({ t: Number(a[1]), acc: Number(a[2]), saf: Number(a[3]), filtre: Number(a[4]) }))
    const std = (d) => { const o = d.reduce((x, y) => x + y, 0) / d.length; return Math.sqrt(d.reduce((x, y) => x + (y - o) ** 2, 0) / d.length) }
    const ort = (d) => d.reduce((x, y) => x + y, 0) / d.length

    // 1) Sakin: sapma ölçülüp çıkarıldı, ikisi de 20° civarında
    sim.run(2500 + 3000)
    let r = noktalar().at(-1)
    yakin(r.filtre, 20, 0.5, 'sakin filtre'); yakin(r.saf, 20, 0.5, 'sakin saf integral'); yakin(r.acc, 20, 0.3, 'sakin acc')

    // 2) Titreşim: ivmeye ±0,15 g gürültü bindir (jiroskop sakin)
    let tohum = 12345
    const rnd = () => { tohum = (tohum * 1103515245 + 12345) & 0x7fffffff; return tohum / 0x7fffffff - 0.5 }   // ±0,5
    const n0 = noktalar().length
    for (let i = 0; i < 500; i++) {              // ≈5 sn, 10 ms adım
      m.ax = Math.sin(rad(20)) + 0.3 * rnd()
      m.az = Math.cos(rad(20)) + 0.3 * rnd()
      sim.run(10)
    }
    const titresim = noktalar().slice(n0 + 2)
    assert.ok(titresim.length >= 15, 'yeterli örnek yok')
    const sAcc = std(titresim.map((x) => x.acc)), sFil = std(titresim.map((x) => x.filtre))
    assert.ok(sAcc > 3, `titreşimde acc gürültülü olmalı: std ${sAcc.toFixed(2)}`)
    assert.ok(sFil < sAcc / 3, `filtre acc'den ≥3 kat sakin olmalı: acc ${sAcc.toFixed(2)}, filtre ${sFil.toFixed(2)}`)
    yakin(ort(titresim.map((x) => x.filtre)), 20, 2.5, 'titreşimde filtre ortalaması')

    // 3) Sapma kaydı: temizle, sapmayı 2 → 4 °/s yap (kalan hata 2 °/s)
    m.ax = Math.sin(rad(20)); m.az = Math.cos(rad(20))
    sim.run(2000)
    const onceki = noktalar().at(-1)
    m.gy = 4
    sim.run(10000)
    r = noktalar().at(-1)
    const gecen = r.t - onceki.t
    assert.ok(gecen > 9.5, `geçen süre ≈10 sn: ${gecen}`)
    assert.ok(r.saf - onceki.saf > 17, `saf integral ≈20° kaymalıydı: ${(r.saf - onceki.saf).toFixed(1)}`)
    assert.ok(Math.abs(r.filtre - 20) < 1.5, `filtre 20°'ye yakın kalmalı: ${r.filtre}`)
    assert.ok(Math.abs(r.filtre - 20) < Math.abs(r.saf - 20) / 8, 'filtrenin hatası saf integralin çok altında olmalı')
    assert.ok(Math.abs(r.acc - 20) < 0.3, 'acc doğru: ' + r.acc)

    // 4) Gerçek hareket: 20° → 50°, 30 °/s ile 1 sn (jiroskop 30 + kalan 2 °/s sapma)
    for (let i = 0; i < 100; i++) {
      const a = 20 + 30 * (i / 100)
      m.gy = 32; m.ax = Math.sin(rad(a)); m.az = Math.cos(rad(a))
      sim.run(10)
    }
    m.ax = Math.sin(rad(50)); m.az = Math.cos(rad(50)); m.gy = 4
    sim.run(250)
    r = noktalar().at(-1)
    assert.ok(Math.abs(r.filtre - 50) < 2.5, `hareket sonunda filtre ≈50°: ${r.filtre}`)
    sim.run(3000)
    r = noktalar().at(-1)
    assert.ok(Math.abs(r.filtre - 50) < 1.6, `oturunca filtre ≈50°: ${r.filtre}`)
  },

  mini_gimbal(sim) {
    const rad = (d) => d * Math.PI / 180
    const m = sim.mpu6050({ ax: 0, ay: 0, az: 1, gy: 1.5 })      // 1,5 °/s sapma: setup'ta ölçülüp çıkarılmalı
    const lcd = sim.lcdI2C({ address: 0x27 })
    const egimYap = (d) => { m.ax = Math.sin(rad(d)); m.az = Math.cos(rad(d)) }
    const medyan = (d) => { assert.ok(d.length > 0, 'darbe yok'); const s = [...d].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] }
    // servo darbe genişliğinden derece: write(a) = 544 + a·(2400−544)/180 µs
    const servoDerece = (ms = 500) => {
      const t = sim.nowMs()
      return (medyan(sim.pulseWidthsUs(6, t - ms, t)) - 544) * 180 / (2400 - 544)
    }
    const hizala = (d, sure = 3000) => { egimYap(d); sim.run(sure) }
    const son = () => {
      const a = [...sim.serial.matchAll(/egim=(-?[\d.]+) servo=(\d+)/g)].at(-2)
      assert.ok(a, 'çıktı yok: ' + JSON.stringify(sim.serial))
      return { egim: Number(a[1]), servo: Number(a[2]) }
    }

    // düz: servo ortada, sapma ölçülüp çıkarıldığı için 10 sn sonra bile kaymaz
    sim.run(3500)
    yakin(servoDerece(), 90, 3, 'düz: servo 90°')
    sim.run(10000)
    yakin(servoDerece(), 90, 3, '10 sn sonra düz: servo hâlâ 90° (sapma kaymamalı)')
    assert.equal(sim.read(13), false, 'düzde LED sönük')

    // 20° eğim → servo ≈ 90 − 20 = 70
    hizala(20)
    yakin(servoDerece(), 70, 3, '20° eğim → servo 70°')
    yakin(son().egim, 20, 0.7, 'seri egim')
    yakin(son().servo, 70, 1.5, 'seri servo')
    yakin(Number(lcd.text[0].match(/Egim: (-?[\d.]+)/)[1]), 20, 0.7, 'LCD egim')
    assert.ok(/Servo: 70\s*$/.test(lcd.text[1]), 'LCD: ' + JSON.stringify(lcd.text))

    // −30° → 120
    hizala(-30)
    yakin(servoDerece(), 120, 3, '−30° eğim → servo 120°')
    yakin(Number(lcd.text[0].match(/Egim: (-?[\d.]+)/)[1]), -30, 0.7, 'LCD egim')
    assert.ok(/Servo: 120\s*$/.test(lcd.text[1]), 'LCD: ' + JSON.stringify(lcd.text))

    // 85° → sınır: servo 10°'de, LED yanar
    hizala(85)
    yakin(servoDerece(), 10, 3, '85° eğim → servo alt sınırda (10°)')
    assert.equal(sim.read(13), true, 'sınırda LED yanmalı')
    hizala(-85)
    yakin(servoDerece(), 170, 3, '−85° eğim → servo üst sınırda (170°)')
    assert.equal(sim.read(13), true, 'üst sınırda LED yanmalı')
    hizala(20)
    assert.equal(sim.read(13), false, 'sınırdan çıkınca LED sönmeli')

    // düğme: şu anki eğimi sıfır yap → servo 90; sonra düze dönünce −20 → servo 110
    sim.drive(2, false); sim.run(100); sim.drive(2, true); sim.run(1500)
    yakin(servoDerece(), 90, 3, 'sıfırlayınca servo 90°')
    yakin(son().egim, 0, 0.7, 'sıfırlayınca egim 0')
    hizala(0)
    yakin(servoDerece(), 110, 3, 'ofsetten sonra düze dönünce servo 110°')
    yakin(son().egim, -20, 0.8, 'ofsetli egim −20')

    // gerçek hareket: 0 → 40°, 40 °/s ile 1 sn; sonunda servo ≈ 50°
    for (let i = 0; i < 100; i++) { const a = 40 * i / 100; m.gy = 1.5 + 40; egimYap(a); sim.run(10) }
    m.gy = 1.5; egimYap(40); sim.run(300)
    yakin(servoDerece(200), 90 - (40 - 20), 5, 'hareket sonu: ofsetli (20°) eğim 20 → servo 70°')

    // titreşim: ivmeye ±0,1 g gürültü; servo yalnızca birkaç derece oynamalı
    hizala(0, 3000)
    let tohum = 777
    const rnd = () => { tohum = (tohum * 1103515245 + 12345) & 0x7fffffff; return tohum / 0x7fffffff - 0.5 }
    const t0 = sim.nowMs()
    for (let i = 0; i < 300; i++) { m.ax = 0.2 * rnd(); m.az = 1 + 0.2 * rnd(); sim.run(10) }
    const d = sim.pulseWidthsUs(6, t0 + 500, sim.nowMs()).map((u) => (u - 544) * 180 / (2400 - 544))
    const ort = d.reduce((x, y) => x + y, 0) / d.length
    const std = Math.sqrt(d.reduce((x, y) => x + (y - ort) ** 2, 0) / d.length)
    assert.ok(std < 2.5, `titreşimde servo oynaması küçük olmalı: std ${std.toFixed(2)}°`)
  },
}

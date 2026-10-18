// Sera sensör benzetimi (Sensör verisinden ML dersi): DHT22 (sıcaklık, nem), BME280 (basınç), LDR (ışık) ve HC-SR04 (su
// deposu mesafesi) için deterministik zaman serisi. Aynı tohum aynı veriyi verir: tarayıcı simülasyonu, CSV (public/veri/ml/
// sera-sensorleri.csv) ve testler aynı üreteçten beslenir. Gerçek sensörün kusurları bilerek eklenir: gürültü, okunamayan
// örnek (NaN), ani sıçrama (spike) ve bir ısıtıcı arızası penceresi (ariza = 1).
import { gauss, rng } from '@/lib/ml/core'

export interface SensorOpts {
  seed: number
  days: number
  /** Örnekleme aralığı, dakika. */
  stepMin: number
  /** Gürültü çarpanı (1 = sensör belgesindeki tipik değer). */
  noise: number
  /** Okunamayan örnek oranı (DHT22 zaman aşımı), 0..1. */
  missing: number
  /** Ani sıçrama oranı, 0..1. */
  spikes: number
  /** Isıtıcı arızası penceresi eklensin mi (5. gün öğleden sonra). */
  fault: boolean
}

export interface Series {
  /** Başlangıçtan dakika. */
  t: number[]
  /** Günün saati (0..24, ondalıklı). */
  hour: number[]
  temp: number[]
  hum: number[]
  press: number[]
  light: number[]
  dist: number[]
  /** Gürültüsüz, kusursuz sıcaklık (yalnız ders için: temizleme ve süzgeç ne kadar yaklaştı?). */
  trueTemp: number[]
  /** 1: ısıtıcı arızası penceresi. */
  fault: number[]
}

export const SENSOR_DEFAULTS: SensorOpts = { seed: 42, days: 7, stepMin: 10, noise: 1, missing: 0.02, spikes: 0.006, fault: true }

/** Arıza penceresi: 5. günün 13:00'ünden 19:00'una (gün indeksi 4). */
export const FAULT_WINDOW = { day: 4, from: 13, to: 19 }

const r2 = (x: number) => Math.round(x * 100) / 100

export function simulate(o: Partial<SensorOpts> = {}): Series {
  const p = { ...SENSOR_DEFAULTS, ...o }
  const r = rng(p.seed)
  const n = Math.round((p.days * 24 * 60) / p.stepMin)
  const s: Series = { t: [], hour: [], temp: [], hum: [], press: [], light: [], dist: [], trueTemp: [], fault: [] }
  // Günlük hava: bulutluluk (0 açık .. 1 kapalı) ve dış sıcaklık sapması her gün değişir
  const days = Array.from({ length: p.days + 1 }, () => ({ cloud: r() * 0.7, off: 2.5 * gauss(r) }))
  let press = 1013 + 3 * gauss(r), level = 22, pressV = 0
  for (let i = 0; i < n; i++) {
    const t = i * p.stepMin, hour = (t / 60) % 24, d = Math.floor(t / 1440)
    const w = days[d], wn = days[d + 1]
    const k = hour / 24
    const cloud = w.cloud * (1 - k) + wn.cloud * k
    const off = w.off * (1 - k) + wn.off * k
    const sun = Math.max(0, Math.sin((Math.PI * (hour - 6)) / 12))
    const light = 1023 * sun * (1 - 0.6 * cloud)
    // Sera ısınması güneşten biraz geride kalır (ısıl atalet): 15:00 civarı tepe
    const lag = Math.max(0, Math.sin((Math.PI * (hour - 7.5)) / 12))
    let tt = 18 + off + 9 * lag * (1 - 0.5 * cloud)
    const inFault = p.fault && d === FAULT_WINDOW.day && hour >= FAULT_WINDOW.from && hour < FAULT_WINDOW.to
    if (inFault) tt += Math.min(7, 2.4 * (hour - FAULT_WINDOW.from)) // takılı kalan ısıtıcı: rampa sonra plato
    press += (pressV = 0.97 * pressV + 0.04 * gauss(r)) * (p.stepMin / 10)
    // Su deposu: sulama saatlerinde (07:00, 18:00) su azalır, mesafe (sensörden yüzeye) büyür; 7. günde dolum
    if ((hour >= 7 && hour < 7.5) || (hour >= 18 && hour < 18.5)) level += 0.35 * (p.stepMin / 10)
    if (d > 0 && d % 3 === 0 && hour >= 9 && hour < 9 + p.stepMin / 60) level = 22
    const hum = Math.max(20, Math.min(98, 92 - 2.1 * (tt - 18) + 4 * cloud))
    let temp = tt + 0.25 * p.noise * gauss(r)
    let hm = hum + 1.2 * p.noise * gauss(r)
    if (r() < p.spikes) temp = r() < 0.5 ? 85 : -40 // kablo temassızlığı ya da bozuk okuma: imkânsız değer
    if (r() < p.missing) { temp = NaN; hm = NaN } // DHT22 okunamadı (ikisi birlikte gelir)
    s.t.push(t); s.hour.push(r2(hour)); s.temp.push(Number.isNaN(temp) ? NaN : r2(temp)); s.hum.push(Number.isNaN(hm) ? NaN : r2(hm))
    s.press.push(r2(press + 0.12 * p.noise * gauss(r))); s.light.push(Math.max(0, Math.round(light + 12 * p.noise * gauss(r))))
    s.dist.push(r2(level + 0.3 * p.noise * gauss(r))); s.trueTemp.push(r2(tt)); s.fault.push(inFault ? 1 : 0)
  }
  return s
}

/** Veri seti satırları (CSV sütun sırası: dakika, saat, sicaklik, nem, basinc, isik, mesafe, ariza). */
export function datasetRows(): number[][] {
  const s = simulate()
  return s.t.map((t, i) => [t, s.hour[i], s.temp[i], s.hum[i], s.press[i], s.light[i], s.dist[i], s.fault[i]])
}

/** Tarayıcıda indirilecek CSV (simülasyon ayarlarıyla). */
export function seriesCsv(s: Series): string {
  const head = 'dakika,saat,sicaklik,nem,basinc,isik,mesafe,ariza'
  return [head, ...s.t.map((t, i) => [t, s.hour[i], s.temp[i], s.hum[i], s.press[i], s.light[i], s.dist[i], s.fault[i]].join(','))].join('\n') + '\n'
}

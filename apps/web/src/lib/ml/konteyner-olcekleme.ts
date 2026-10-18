// Ders: konteyner ve otomatik ölçekleme. Robot filosunun harita servisi aynı imajdan açılan kopyalarla çalışır; yük arttıkça
// ölçekleyici hedef CPU'yu tutacak kadar kopya ekler, yük dengeleyici istekleri sırayla dağıtır. Sabit 2 kopyada kuyruk patlar.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

export interface KonSim {
  t: number[]
  load: number[]
  nAuto: number[]
  /** O adımda açılmakta olan (henüz hazır olmayan) kopya sayısı. */
  pend: number[]
  latAuto: number[]
  latFix: number[]
  target: number
  peak: number
  mu: number
  slo: number
  maxLatAuto: number
  maxLatFix: number
  peakN: number
}
export interface KonFrame extends Frame {
  S: KonSim
  k: number
  mode: 'image' | 'lb' | 'sim' | 'arch'
  /** image: 0 dizüstü/sunucu farkı, 1 imaj katmanları, 2 her yerde aynı imaj. arch: 0 normal, 1 rota çöktü. */
  step?: number
  /** lb: dağıtılan istek sayısı. */
  rr?: number
  done?: boolean
}

export const MIX = { tile: 0.6, pos: 0.25, route: 0.15 }
const MU = 50, SLO = 200, DTS = 30, NMAX = 30

export function konSim(target: number, peak: number, seed = 3): KonSim {
  const r = rng(seed)
  const t: number[] = [], load: number[] = []
  for (let i = 0; i < 240; i++) {
    const m = i * 0.5
    t.push(m)
    load.push((60 + (peak - 60) * Math.exp(-(((m - 60) / 15) ** 2))) * (1 + 0.05 * gauss(r)))
  }
  const run = (scale: boolean) => {
    let n = 2, q = 0
    const ist: number[] = [], lat: number[] = [], N: number[] = [], P: number[] = []
    for (const L of load) {
      const rho = L / (n * MU)
      q = Math.max(0, q + (L - n * MU) * DTS)
      const w = (1000 * q) / (n * MU)
      lat.push(30 / (1 - Math.min(rho, 0.95)) + w)
      N.push(n)
      if (scale) {
        ist.push(Math.min(NMAX, Math.max(2, Math.ceil(L / (MU * target)))))
        if (ist.length > 2) n = Math.max(n - 1, ist[ist.length - 3])
      }
      P.push(scale ? Math.max(0, ist[ist.length - 1] - n) : 0)
    }
    return { lat, N, P }
  }
  const A = run(true), B = run(false)
  return {
    t, load, nAuto: A.N, pend: A.P, latAuto: A.lat, latFix: B.lat, target, peak, mu: MU, slo: SLO,
    maxLatAuto: Math.max(...A.lat), maxLatFix: Math.max(...B.lat), peakN: Math.max(...A.N),
  }
}

const ms = (x: number, lang: 'tr' | 'en') => (x >= 10000 ? `${fmt(x / 1000, 0, lang)} s` : `${Math.round(x)} ms`)

export const KONTEYNER_OLCEKLEME: Lesson<KonFrame> = {
  slug: 'konteyner-olcekleme',
  n: 0,
  title: { tr: 'Konteyner ve otomatik ölçekleme', en: 'Containers and autoscaling' },
  sub: { tr: 'Robot filosunun harita servisi yoğun saatte kendini çoğaltıyor', en: "The fleet's map service multiplies itself at rush hour" },
  story: {
    tr: "Depodaki robotlar her hareketten önce harita servisine harita karosu, konum ve rota sorar. Gece yük saniyede 60 istek; vardiya değişiminde 2 saat içinde saniyede 400 isteğe kadar çıkıp iner. Bir kopya saniyede 50 istek işler, yanıt 200 ms'yi geçerse robotlar yavaşlar. Servis bir konteyner imajı olarak paketlenmiş: ölçekleyici her 30 saniyede kopya sayısına karar verir, yeni kopya 1 dakikada açılır.",
    en: 'Warehouse robots ask the map service for map tiles, positions and routes before every move. At night the load is 60 requests per second; at shift change it climbs to 400 per second and back within 2 hours. One copy handles 50 requests per second, and robots slow down if a reply takes over 200 ms. The service is packaged as a container image: the autoscaler decides the number of copies every 30 seconds and a new copy starts in 1 minute.',
  },
  how: [
    { tr: "Konteyner imajı uygulamayı ve tüm bağımlılıklarını (Python sürümü, kütüphaneler, harita dosyası) tek pakette dondurur. 'Benim makinemde çalışıyor' sorunu biter: aynı imaj dizüstünde, testte ve bulutta aynı davranır.", en: "A container image freezes the app with all its dependencies (Python version, libraries, map file) in one package. 'Works on my machine' goes away: the same image behaves the same on a laptop, in testing and in the cloud." },
    { tr: 'Aynı imajdan istediğin kadar kopya açılır. Yük dengeleyici gelen istekleri sırayla (round-robin) kopyalara dağıtır; her kopya yükün eşit payını alır.', en: 'You can start as many copies of one image as you like. The load balancer hands requests to copies in turn (round-robin), so each copy gets an equal share.' },
    { tr: 'Otomatik ölçekleyici: istenen kopya = ⌈yük / (kopya kapasitesi × hedef CPU)⌉. Hedef %60 ise her kopya %60 dolulukta tutulur; boşluk ani artışı karşılar.', en: 'Autoscaler: desired copies = ⌈load / (copy capacity × target CPU)⌉. With a 60% target every copy stays 60% busy; the headroom absorbs sudden growth.' },
    { tr: 'Monolitte bir modül çökünce bütün servis düşer; mikroservislerde yalnız o parça düşer, harita karoları ve konum çalışmayı sürdürür.', en: 'In a monolith one crashing module takes down the whole service; with microservices only that part fails, tiles and positions keep working.' },
    { tr: "Şunu dene: hedef CPU'yu %80'e çıkar; daha az kopya açılır ama gecikme 200 ms sınırını aşar. Tepe yükü 800 yap: ölçekleyici 29 kopyaya çıkar.", en: 'Try this: raise the target CPU to 80%; fewer copies start but latency breaks the 200 ms limit. Set the peak to 800: the autoscaler goes up to 29 copies.' },
  ],
  why: {
    tr: "Robot filoları, otonom araç simülasyonları ve ROS tabanlı bulut servisleri Docker imajlarıyla dağıtılır; Kubernetes'in yatay ölçekleyicisi bu dersteki formülü kullanır. Saha robotlarının kendisi de çoğu zaman konteynerle güncellenir, böylece laboratuvarda test edilen yazılım bit bit aynısıyla sahaya gider.",
    en: "Robot fleets, autonomous-vehicle simulations and ROS-based cloud services are shipped as Docker images; Kubernetes' horizontal autoscaler uses the formula in this lesson. Field robots are often updated with containers too, so the software tested in the lab reaches the field bit for bit.",
  },
  file: 'olcekleme.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(3)'],
    ['t = np.arange(0, 120, 0.5)', 'dakika, 30 s adım', 'minutes, 30 s step'],
    ['yuk = 60 + 340 * np.exp(-((t - 60) / 15) ** 2)', 'vardiya tepesi', 'shift-change peak'],
    ['yuk *= 1 + 0.05 * rng.standard_normal(len(t))', 'istek/s', 'req/s'],
    ['MU, HEDEF, SINIR = 50, 0.6, 200', 'kopya kapasitesi, CPU, ms', 'copy capacity, CPU, ms'],
    ['def calistir(olcekle):'],
    ['    n, istek, kuyruk, gec, K = 2, [], 0.0, [], []', '2 kopyayla başla', 'start with 2 copies'],
    ['    for L in yuk:'],
    ['        rho = L / (n * MU)', 'kopya başına CPU', 'CPU per copy'],
    ['        kuyruk = max(0.0, kuyruk + (L - n * MU) * 30)', 'karşılanamayan istekler', 'unserved requests'],
    ['        w = 1000 * kuyruk / (n * MU)', 'kuyrukta bekleme', 'waiting in queue'],
    ['        gec.append(30 / (1 - min(rho, .95)) + w)', 'gecikme (ms)', 'latency (ms)'],
    ['        K.append(n)'],
    ['        if olcekle:'],
    ['            ist = np.ceil(L / (MU * HEDEF))', 'istenen kopya', 'desired copies'],
    ['            istek.append(int(np.clip(ist, 2, 30)))'],
    ['            if len(istek) > 2:', "yeni kopya 1 dk'da açılır", 'a new copy starts in 1 min'],
    ['                n = max(n - 1, istek[-3])'],
    ['    return max(gec), max(K)'],
    ['g, k = calistir(True)'],
    ["print(f'ölçekleyici: {k} kopya, en kötü {g:.0f} ms')"],
    ['g, k = calistir(False)'],
    ["print(f'sabit 2 kopya: en kötü {g:.0f} ms')"],
  ],
  params: [
    { key: 'target', label: { tr: 'Hedef CPU (%)', en: 'Target CPU (%)' }, min: 30, max: 90, step: 5, value: 60 },
    { key: 'peak', label: { tr: 'Tepe yük (istek/s)', en: 'Peak load (req/s)' }, min: 100, max: 800, step: 50, value: 400 },
  ],
  run({ target = 60, peak = 400 }) {
    const S = konSim(target / 100, peak)
    const F: KonFrame[] = []
    const stat = cap(`hedef CPU %${target} · tepe ${peak} istek/s`, `target CPU ${target}% · peak ${peak} req/s`)
    const push = (f: Omit<KonFrame, 'S' | 'stat'> & { stat?: KonFrame['stat'] }) => F.push({ S, stat, ...f })
    push({ k: 0, mode: 'image', step: 0, line: 0, cap: cap("'benim makinemde çalışıyor': sunucuda kütüphane sürümü farklı", "'works on my machine': the server has a different library version"), hold: 2.2 })
    push({ k: 0, mode: 'image', step: 1, line: 0, cap: cap('imaj: kod + bağımlılıklar tek pakette', 'image: code + dependencies in one package'), hold: 2 })
    push({ k: 0, mode: 'image', step: 2, line: 5, cap: cap('aynı imaj her yerde aynı çalışır; her kopya 50 istek/s', 'the same image runs the same everywhere; each copy 50 req/s'), hold: 2 })
    for (let i = 1; i <= 6; i++) push({ k: 0, mode: 'lb', rr: i, line: 9, cap: cap(`istek ${i} → kopya ${((i - 1) % 3) + 1} (sırayla)`, `request ${i} → copy ${((i - 1) % 3) + 1} (in turn)`), hold: i < 3 ? 1.2 : 0.7 })
    push({ k: 0, mode: 'sim', line: 3, cap: cap(`yük: gece 60, vardiyada ${peak} istek/s`, `load: 60 at night, ${peak} req/s at shift change`), hold: 1.8 })
    const detail: Array<[number, [string, string]]> = [
      [7, ['2 kopyayla başla', 'start with 2 copies']],
      [9, ['kopya başına CPU = yük / (kopya × 50)', 'CPU per copy = load / (copies × 50)']],
      [12, ['gecikme: doluluk arttıkça hızla büyür', 'latency grows fast as copies fill up']],
      [15, ['istenen kopya = ⌈yük / (50 × hedef)⌉', 'desired = ⌈load / (50 × target)⌉']],
      [18, ['karar 1 dakika sonra hazır kopya olur', 'the decision becomes ready copies 1 minute later']],
    ]
    for (const [line, c] of detail) push({ k: 0, mode: 'sim', line, cap: cap(c[0], c[1]), hold: 1.1 })
    for (let k = 2; k < S.t.length; k += 2) {
      const n = S.nAuto[k], lat = S.latAuto[k]
      const c = cap(`${fmt(S.t[k], 0, 'tr')}. dk · yük ${Math.round(S.load[k])} istek/s · ${n} kopya · ${ms(lat, 'tr')}`, `min ${S.t[k].toFixed(0)} · load ${Math.round(S.load[k])} req/s · ${n} copies · ${ms(lat, 'en')}`)
      const grow = k >= 2 && S.nAuto[k] > S.nAuto[k - 2]
      push({ k, mode: 'sim', line: grow ? 18 : 12, cap: c, hold: lat > S.slo ? 0.8 : 0.32 })
    }
    const last = S.t.length - 1
    const okA = S.maxLatAuto < S.slo
    push({ k: last, mode: 'sim', done: true, line: 21, cap: cap(`ölçekleyici: en çok ${S.peakN} kopya, en kötü ${ms(S.maxLatAuto, 'tr')}${okA ? ' (sınır içinde)' : ' (sınır aşıldı)'}`, `autoscaler: at most ${S.peakN} copies, worst ${ms(S.maxLatAuto, 'en')}${okA ? ' (within limit)' : ' (limit broken)'}`), hold: 2.2 })
    push({ k: last, mode: 'sim', done: true, line: 23, cap: cap(`sabit 2 kopya: en kötü ${ms(S.maxLatFix, 'tr')}`, `fixed 2 copies: worst ${ms(S.maxLatFix, 'en')}`), hold: 2.2 })
    push({ k: last, mode: 'arch', step: 0, line: 23, cap: cap('monolit: tek süreç; mikroservis: her parça ayrı konteyner', 'monolith: one process; microservices: each part its own container'), hold: 2 })
    push({ k: last, mode: 'arch', step: 1, line: 23, cap: cap(`rota modülü çöktü: monolit %0, mikroservis %${Math.round(100 * (1 - MIX.route))} istek yanıtlanır`, `route module crashed: monolith 0%, microservices ${Math.round(100 * (1 - MIX.route))}% of requests answered`), hold: 3 })
    return F
  },
}

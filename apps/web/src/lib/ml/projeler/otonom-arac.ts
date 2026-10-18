// Proje: otonom araç (nöroevrim). Kapalı bir pistte 30 araç; her birinin beyni küçük bir sinir ağı (5 mesafe sensörü + hız →
// direksiyon ve gaz). Kimse ağa doğru cevabı söylemez: bir nesil boyunca araçlar sürer, en uzağa gidenler kopyalanıp ağırlıkları
// biraz bozularak (mutasyon) yeni nesli kurar. Pist düzlemi (x, z) metre; sahnede doğrudan three.js'in x ve z eksenidir.
// Yol ızgarası: 5 cm'lik hücrelerde yolun en yakın orta çizgi noktası (yol dışı −1); sensörler ve ilerleme bu ızgaradan okunur.
import { cap, fmt, rng } from '../core'
import type { ProjectDef, ProjectRun } from './core'
import { nnClone, nnCreate, nnForward, nnMutate, type NN } from './nn'

export interface Track {
  /** Eşit aralıklı orta çizgi noktaları [x0, z0, x1, z1, …]. */
  center: Float64Array
  n: number
  /** Yol yarı genişliği (m) ve tur uzunluğu (m). */
  halfW: number
  length: number
  /** Izgara: x0, z0 köşe, hücre boyu, sütun ve satır sayısı, hücredeki orta çizgi dizini. */
  gx: number; gz: number; cell: number; cols: number; rows: number; idx: Int16Array
}

/** Pistin biçimi: dalgalı bir elips (r = 1 + 0,22·sin 3θ + 0,06·cos 5θ), en dar virajın yarıçapı yaklaşık 1,3 m. Uzun eksen x yönünde. */
export function makeTrack(halfW = 0.65, n = 300, cell = 0.05): Track {
  const D = 3000
  const px = new Float64Array(D + 1), pz = new Float64Array(D + 1), cum = new Float64Array(D + 1)
  for (let i = 0; i <= D; i++) {
    const t = (2 * Math.PI * i) / D, r = 1 + 0.22 * Math.sin(3 * t) + 0.06 * Math.cos(5 * t)
    px[i] = 9.9 * r * Math.cos(t); pz[i] = 6 * r * Math.sin(t)
    if (i) cum[i] = cum[i - 1] + Math.hypot(px[i] - px[i - 1], pz[i] - pz[i - 1])
  }
  const length = cum[D]
  const center = new Float64Array(2 * n)
  for (let k = 0, j = 0; k < n; k++) {
    const s = (length * k) / n
    while (cum[j + 1] < s) j++
    const f = (s - cum[j]) / (cum[j + 1] - cum[j] || 1)
    center[2 * k] = px[j] + f * (px[j + 1] - px[j]); center[2 * k + 1] = pz[j] + f * (pz[j + 1] - pz[j])
  }
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity
  for (let k = 0; k < n; k++) { x0 = Math.min(x0, center[2 * k]); x1 = Math.max(x1, center[2 * k]); z0 = Math.min(z0, center[2 * k + 1]); z1 = Math.max(z1, center[2 * k + 1]) }
  const m = halfW + 0.3
  const gx = x0 - m, gz = z0 - m, cols = Math.ceil((x1 - x0 + 2 * m) / cell), rows = Math.ceil((z1 - z0 + 2 * m) / cell)
  const idx = new Int16Array(cols * rows).fill(-1), best = new Float32Array(cols * rows).fill(Infinity)
  // her orta çizgi parçasını ızgaraya "boya": yarı genişlikten yakın hücreler o parçanın dizinini alır (en yakını kazanır)
  for (let k = 0; k < n; k++) {
    const ax = center[2 * k], az = center[2 * k + 1], bx = center[(2 * k + 2) % (2 * n)], bz = center[(2 * k + 3) % (2 * n)]
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz
    const c0 = Math.max(0, Math.floor((Math.min(ax, bx) - halfW - gx) / cell)), c1 = Math.min(cols - 1, Math.ceil((Math.max(ax, bx) + halfW - gx) / cell))
    const r0 = Math.max(0, Math.floor((Math.min(az, bz) - halfW - gz) / cell)), r1 = Math.min(rows - 1, Math.ceil((Math.max(az, bz) + halfW - gz) / cell))
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const qx = gx + (c + 0.5) * cell, qz = gz + (r + 0.5) * cell
      const t = Math.max(0, Math.min(1, ((qx - ax) * dx + (qz - az) * dz) / L2))
      const d = Math.hypot(qx - ax - t * dx, qz - az - t * dz)
      const i = r * cols + c
      if (d < halfW && d < best[i]) { best[i] = d; idx[i] = t < 0.5 ? k : (k + 1) % n }
    }
  }
  return { center, n, halfW, length, gx, gz, cell, cols, rows, idx }
}

let TRACK: Track | null = null
/** Varsayılan pist (bir kez kurulur). */
export const track = (): Track => (TRACK ??= makeTrack())

/** Noktadaki orta çizgi dizini; yol dışıysa −1. */
export function roadIndex(T: Track, x: number, z: number): number {
  const c = Math.floor((x - T.gx) / T.cell), r = Math.floor((z - T.gz) / T.cell)
  if (c < 0 || r < 0 || c >= T.cols || r >= T.rows) return -1
  return T.idx[r * T.cols + c]
}

/** Işın: (x, z)'den `ang` yönünde yol kenarına uzaklık (m), en fazla `max`. 5 cm adımlarla ilerler. */
export function castRay(T: Track, x: number, z: number, ang: number, max = 5): number {
  const c = Math.cos(ang), s = Math.sin(ang), st = T.cell
  for (let d = st; d <= max; d += st) if (roadIndex(T, x + c * d, z + s * d) < 0) return d - st / 2
  return max
}

/** Sensör açıları (araç yönüne göre): −60°, −30°, 0°, 30°, 60°. */
export const RAYS = [-60, -30, 0, 30, 60].map((a) => (a * Math.PI) / 180)
export const RAY_MAX = 5
export const DT = 0.05
/** Bir neslin süre sınırı: 60 saniye. */
export const GEN_TICKS = 1200

export interface Car { net: NN; x: number; z: number; h: number; v: number; alive: boolean; idx: number; prog: number; maxProg: number; lastGain: number; rays: number[] }
export interface View {
  track: Track
  cars: Car[]
  /** Görüntülenen en iyi araç (yoldaysa en ilerideki). */
  best: number
  gen: number
  tick: number
  lapTarget: number
}

function startCar(T: Track, net: NN): Car {
  const h = Math.atan2(T.center[3] - T.center[1], T.center[2] - T.center[0])
  return { net, x: T.center[0], z: T.center[1], h, v: 1, alive: true, idx: 0, prog: 0, maxProg: 0, lastGain: 0, rays: RAYS.map(() => RAY_MAX) }
}

/** Bir aracı DT saniye sürer: sensörler → ağ → direksiyon (−1…1) ve gaz (−1…1) → hız 1–4 m/s, dönüş en fazla 2,5 rad/s. */
export function driveCar(T: Track, car: Car, tick: number) {
  if (!car.alive) return
  const inp = new Float64Array(RAYS.length + 1)
  for (let i = 0; i < RAYS.length; i++) { const d = castRay(T, car.x, car.z, car.h + RAYS[i], RAY_MAX); car.rays[i] = d; inp[i] = d / RAY_MAX }
  inp[RAYS.length] = car.v / 4
  const [steer, gas] = nnForward(car.net, inp)
  const target = 1 + 1.5 * (gas + 1)
  car.v += (target - car.v) * Math.min(1, 3 * DT)
  car.h += steer * 2.5 * DT
  car.x += Math.cos(car.h) * car.v * DT
  car.z += Math.sin(car.h) * car.v * DT
  const ni = roadIndex(T, car.x, car.z)
  if (ni < 0) { car.alive = false; return }
  let d = ni - car.idx
  if (d > T.n / 2) d -= T.n
  if (d < -T.n / 2) d += T.n
  car.idx = ni
  car.prog += (d * T.length) / T.n
  if (car.prog > car.maxProg + 0.5) { car.maxProg = car.prog; car.lastGain = tick }
  // geri gitmek ya da 3 saniye ilerleyememek (yerinde dönmek) de elenmek demek
  if (car.prog < car.maxProg - 2 || tick - car.lastGain > 60) car.alive = false
}

export interface EvoOpts { pop: number; sigma: number; hidden: number; seed: number; laps: number }

/** Nöroevrim koşusu: step(n) n zaman adımı sürer; nesil bitince seçilim ve mutasyon. */
export function createRun(o: EvoOpts) {
  const T = track(), r = rng(o.seed)
  const sizes = [RAYS.length + 1, o.hidden, 2]
  let cars = Array.from({ length: o.pop }, () => startCar(T, nnCreate(sizes, r, 'tanh')))
  const view: View = { track: T, cars, best: 0, gen: 1, tick: 0, lapTarget: o.laps }
  const hist: number[] = [], meanHist: number[] = []
  let record = 0, firstLapGen = 0, finished = false

  const evolve = () => {
    const fit = cars.map((c) => c.maxProg)
    const order = fit.map((_, i) => i).sort((a, b) => fit[b] - fit[a])
    hist.push(fit[order[0]] / T.length); meanHist.push(fit.reduce((s, x) => s + x, 0) / fit.length / T.length)
    const next: NN[] = [nnClone(cars[order[0]].net), nnClone(cars[order[1]].net)]
    while (next.length < o.pop) {
      const parent = cars[order[Math.floor(r() * r() * Math.max(2, o.pop * 0.4))]].net
      next.push(nnMutate(parent, r, o.sigma, 0.3))
    }
    cars = next.map((n) => startCar(T, n))
    view.cars = cars
    view.gen++
    view.tick = 0
  }

  const step = (n: number) => {
    for (let k = 0; k < n && !finished; k++) {
      view.tick++
      let alive = 0, bi = -1
      for (let i = 0; i < cars.length; i++) {
        const c = cars[i]
        driveCar(T, c, view.tick)
        if (c.alive) { alive++; if (bi < 0 || c.prog > cars[bi].prog) bi = i }
        if (c.maxProg > record) record = c.maxProg
        if (!firstLapGen && c.maxProg >= T.length) firstLapGen = view.gen
        if (c.maxProg >= o.laps * T.length) { finished = true; bi = i }
      }
      if (bi >= 0) view.best = bi
      else view.best = cars.reduce((b, c, i) => (c.maxProg > cars[b].maxProg ? i : b), 0)
      if (finished) { hist.push(cars[view.best].maxProg / T.length); break }
      if (alive === 0 || view.tick >= GEN_TICKS) evolve()
    }
  }

  return {
    view, step, hist, meanHist,
    alive: () => cars.filter((c) => c.alive).length,
    record: () => record,
    firstLapGen: () => firstLapGen,
    done: () => finished,
  }
}

/** Testler ve görevler için: en fazla `maxGen` nesil koşar; ilk tamamlanan turun nesli (yoksa 0) ve rekor (tur cinsinden). */
export function runUntil(o: EvoOpts, maxGen: number) {
  const R = createRun(o)
  while (!R.done() && R.view.gen <= maxGen) { const g = R.view.gen; while (R.view.gen === g && !R.done()) R.step(50) }
  return { firstLap: R.firstLapGen(), gens: R.view.gen, record: R.record() / R.view.track.length, done: R.done(), hist: R.hist }
}

export const OTONOM_ARAC: ProjectDef<View> = {
  slug: 'otonom-arac',
  title: { tr: 'Otonom araç: pisti kendi kendine öğrenen sürücü', en: 'Autonomous car: a driver that learns the track by itself' },
  sub: { tr: 'Beş mesafe sensörü, küçük bir sinir ağı ve nöroevrim', en: 'Five distance sensors, a small neural network and neuroevolution' },
  story: {
    tr: 'Bir robot yarışı için kapalı bir pist: yaklaşık 22 metreye 13 metrelik dalgalı bir halka (bir tur 57 metre), yol 1,3 metre genişliğinde. Her aracın önünde beş mesafe sensörü var (LiDAR’ın en basit hâli); yol kenarına olan uzaklığı ölçerler. Kimse araca nasıl direksiyon kıracağını göstermez; elimizde yalnızca bir ölçüt var: pistte ne kadar ilerledi.',
    en: 'A closed track for a robot race: a wavy loop about 22 by 13 metres (57 metres per lap), with a road 1.3 metres wide. Every car has five distance sensors at the front (the simplest kind of LiDAR) measuring how far the edge of the road is. Nobody shows the car how to steer; all we have is one score: how far along the track it got.',
  },
  goal: {
    tr: 'Bir aracın pisti yoldan çıkmadan iki tam tur dönmesi.',
    en: 'One car drives two full laps of the track without leaving the road.',
  },
  model: {
    tr: 'Her aracın beyni 6 → 6 → 2 nöronlu bir sinir ağı (sinir ağı dersindeki ağın aynısı, tanh eğrileriyle). Ağırlıklar gradyan inişiyle değil nöroevrimle öğrenilir: en iyi araçlar kopyalanır, kopyaların ağırlıklarına küçük gauss gürültüsü eklenir. Doğru cevap olmadığı için geri yayılım kullanılamaz; ödül yalnızca nesil sonunda gelir (Q-öğrenme dersindeki gibi).',
    en: 'Each car’s brain is a 6 → 6 → 2 neural network (the same network as in the neural network lesson, with tanh curves). The weights are learned by neuroevolution rather than gradient descent: the best cars are copied and small Gaussian noise is added to the copies’ weights. Since there is no right answer, backpropagation cannot be used; the reward only arrives at the end of a generation (as in the Q-learning lesson).',
  },
  lessons: ['sinir-agi', 'aktivasyon-fonksiyonlari', 'q-ogrenme'],
  steps: [
    { tr: 'Sensörler: her karede beş ışın −60°, −30°, 0°, 30° ve 60° yönünde yol kenarına kadar uzatılır; uzaklık 5 metreye bölünür. Altıncı girdi aracın hızıdır.', en: 'Sensors: every tick five rays at −60°, −30°, 0°, 30° and 60° are stretched to the edge of the road; the distance is divided by 5 metres. The sixth input is the car’s speed.' },
    { tr: 'Ağ: altı sayı gizli katmandan geçer, iki sayı çıkar: direksiyon (−1 sol, +1 sağ) ve gaz (hız 1 ile 4 m/s arası).', en: 'Network: six numbers pass through the hidden layer and two come out: steering (−1 left, +1 right) and throttle (speed between 1 and 4 m/s).' },
    { tr: 'Nesil: 30 araç aynı anda başlar. Yoldan çıkan, geri giden ya da 3 saniye ilerleyemeyen araç elenir. Herkes elenince ya da 60 saniye dolunca nesil biter.', en: 'Generation: 30 cars start together. A car that leaves the road, drives backwards or makes no progress for 3 seconds is out. The generation ends when everyone is out or 60 seconds have passed.' },
    { tr: 'Uygunluk: aracın orta çizgi boyunca ulaştığı en uzak nokta (metre). Sıralamada en iyi iki araç olduğu gibi kalır.', en: 'Fitness: the furthest point the car reached along the centre line (metres). The best two cars are kept unchanged.' },
    { tr: 'Yeni nesil: geri kalan 28 araç, iyi araçlardan birinin kopyasıdır; her ağırlık %30 olasılıkla “mutasyon” kadar gauss gürültüsü alır. Kötü bozulmalar elenir, iyiler kalır.', en: 'New generation: the other 28 cars are copies of one of the good cars; each weight gets Gaussian noise of size “mutation” with 30% probability. Bad changes die out, good ones stay.' },
  ],
  task: [
    { tr: 'Mutasyonu 0 yap ve eğit. Kopyalar asıllarının aynısı olur, evrim durur: rekor ilk nesilde ne ise orada kalır ve hiçbir araç tur atamaz.', en: 'Set mutation to 0 and train. The copies are identical to their parents and evolution stops: the record stays wherever the first generation left it and no car completes a lap.' },
    { tr: 'Popülasyonu 30’dan 10’a indir. Varsayılan tohumla ilk tam tur 6. nesil yerine 16. nesilde gelir; 6 araçla 80 nesilde bile gelmez. Az araç, her nesilde az deneme demektir.', en: 'Lower the population from 30 to 10. With the default seed the first full lap comes in generation 16 instead of generation 6; with 6 cars it does not come even in 80 generations. Fewer cars means fewer tries per generation.' },
    { tr: 'Gizli nöronu 6’dan 2’ye indir: ilk tam tur 16. nesle kalır. 12 yap: 4. nesilde gelir. Sonra tohumu değiştir; ilk 20 tohumun hepsinde 10 nesil içinde bir araç iki tur atar.', en: 'Lower the hidden neurons from 6 to 2: the first full lap is delayed to generation 16. Set 12: it comes in generation 4. Then change the seed; for each of the first 20 seeds a car drives two laps within 10 generations.' },
  ],
  file: 'otonom_arac.py',
  code: [
    ['import numpy as np'],
    ['C = np.genfromtxt(\'pist-orta-cizgi.csv\', delimiter=\',\', skip_header=1)', 'orta çizgi: 300 nokta (x, z), m', 'centre line: 300 points (x, z), m'],
    ['n, YARI, H = len(C), 0.65, 0.1', 'yol yarı genişliği, ızgara hücresi (m)', 'road half-width, grid cell (m)'],
    ['xs = np.arange(C[:, 0].min() - 1, C[:, 0].max() + 1, H)'],
    ['zs = np.arange(C[:, 1].min() - 1, C[:, 1].max() + 1, H)'],
    ['IDX = np.full((len(zs), len(xs)), -1)', 'hücre başına en yakın orta çizgi noktası, yol dışı −1', 'nearest centre-line point per cell, −1 off the road'],
    ['for i, z in enumerate(zs):'],
    ['    d = (xs[:, None] - C[:, 0]) ** 2 + (z - C[:, 1]) ** 2'],
    ['    j = d.argmin(1)'],
    ['    IDX[i] = np.where(d[np.arange(len(xs)), j] < YARI ** 2, j, -1)'],
    ['def hucre(x, z):', 'konumların hücre değeri (yol mu, nerede)', 'cell value of positions (on road, where)'],
    ['    c, r = ((x - xs[0]) / H).astype(int), ((z - zs[0]) / H).astype(int)'],
    ['    ok = (c >= 0) & (r >= 0) & (c < len(xs)) & (r < len(zs))'],
    ['    out = np.full(x.shape, -1)'],
    ['    out[ok] = IDX[r[ok], c[ok]]'],
    ['    return out'],
    ['ACILAR = np.radians([-60, -30, 0, 30, 60])', 'beş mesafe sensörü', 'five distance sensors'],
    ['def isinlar(x, z, h):', 'bütün araçların ışınları birlikte', 'rays of all cars at once'],
    ['    a = h[:, None] + ACILAR'],
    ['    d, acik = np.full(a.shape, 5.0), np.ones(a.shape, bool)'],
    ['    for s in np.arange(0.25, 5.01, 0.25):', '25 cm adımlarla ilerle', 'step forward 25 cm at a time'],
    ['        yol = hucre(x[:, None] + np.cos(a) * s, z[:, None] + np.sin(a) * s) >= 0'],
    ['        d[acik & ~yol] = s - 0.125', 'ilk yol dışı nokta: kenara uzaklık', 'first off-road point: distance to the edge'],
    ['        acik &= yol'],
    ['    return d'],
    ['N, rng = 30, np.random.default_rng(1)', '30 araç', '30 cars'],
    ['W1, b1 = rng.normal(0, 6 ** -.5, (N, 6, 6)), np.zeros((N, 6))', 'her aracın ağı: 6 → 6 → 2', 'each car\'s network: 6 → 6 → 2'],
    ['W2, b2 = rng.normal(0, 6 ** -.5, (N, 6, 2)), np.zeros((N, 2))'],
    ['def sur(W1, b1, W2, b2, dt=0.05):', 'bir nesil: hepsi aynı anda sürer', 'one generation: all drive at once'],
    ['    x, z = np.full(N, C[0, 0]), np.full(N, C[0, 1])'],
    ['    h, v = np.full(N, np.arctan2(C[1, 1] - C[0, 1], C[1, 0] - C[0, 0])), np.ones(N)'],
    ['    son, ilerleme, en_iyi, canli = np.zeros(N, int), np.zeros(N), np.zeros(N), np.ones(N, bool)'],
    ['    for t in range(600):', 'en fazla 30 saniye', 'at most 30 seconds'],
    ['        g = np.c_[isinlar(x, z, h) / 5, v / 4]', 'girdiler: 5 ışın, hız', 'inputs: 5 rays, speed'],
    ['        o = np.tanh(np.einsum(\'nj,njk->nk\', np.tanh(np.einsum(\'ni,nij->nj\', g, W1) + b1), W2) + b2)', 'direksiyon, gaz', 'steering, throttle'],
    ['        v = np.where(canli, v + (2.5 + 1.5 * o[:, 1] - v) * 0.15, 0)', 'hız 1–4 m/s', 'speed 1–4 m/s'],
    ['        h += 2.5 * o[:, 0] * dt'],
    ['        x, z = x + np.cos(h) * v * dt, z + np.sin(h) * v * dt'],
    ['        k = hucre(x, z)'],
    ['        canli &= k >= 0', 'yoldan çıkan elenir', 'leaving the road eliminates'],
    ['        adim = (k - son + n // 2) % n - n // 2', 'orta çizgide kaç nokta ilerledi', 'how many points along the centre line'],
    ['        ilerleme = np.where(canli, ilerleme + adim, ilerleme); son = np.where(canli, k, son)'],
    ['        canli &= ilerleme > en_iyi - 10', 'geri giden de elenir', 'going backwards eliminates too'],
    ['        en_iyi = np.maximum(en_iyi, ilerleme)'],
    ['        if not canli.any(): break'],
    ['    return en_iyi / n', 'uygunluk: tur cinsinden en uzak nokta', 'fitness: furthest point, in laps'],
    ['for nesil in range(1, 13):'],
    ['    puan = sur(W1, b1, W2, b2)'],
    ['    sira = np.argsort(-puan)'],
    ['    print(f"nesil {nesil:2d}: en iyi {puan.max():.2f} tur, ortalama {puan.mean():.2f}")'],
    ['    if puan.max() >= 1: print("bir araç tam tur attı"); break'],
    ['    eb = np.r_[sira[:2], sira[(rng.random(N - 2) ** 2 * 12).astype(int)]]', 'en iyi iki aynen, kalanlar iyilerin kopyası', 'best two unchanged, the rest copies of good ones'],
    ['    W1, b1, W2, b2 = [w[eb] + rng.normal(0, .3, w[eb].shape) * (rng.random(w[eb].shape) < .3) * (np.arange(N) >= 2).reshape(-1, *[1] * (w.ndim - 1)) for w in (W1, b1, W2, b2)]', 'mutasyon (ilk ikiye dokunma)', 'mutation (leave the first two alone)'],
  ],

  params: [
    { key: 'pop', label: { tr: 'Popülasyon (araç sayısı)', en: 'Population (cars)' }, min: 6, max: 40, step: 2, value: 30 },
    { key: 'sigma', label: { tr: 'Mutasyon', en: 'Mutation' }, min: 0, max: 1, step: 0.05, value: 0.3 },
    { key: 'hidden', label: { tr: 'Gizli nöron', en: 'Hidden neurons' }, min: 2, max: 12, step: 1, value: 6 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 50, step: 1, value: 1 },
  ],
  perFrame: 3,
  create(p): ProjectRun<View> {
    const o: EvoOpts = { pop: Math.round(p.pop ?? 30), sigma: p.sigma ?? 0.3, hidden: Math.round(p.hidden ?? 6), seed: Math.round(p.seed ?? 1), laps: 2 }
    const R = createRun(o)
    const pc = (x: number, lang: 'tr' | 'en') => (lang === 'tr' ? `%${fmt(x * 100, 0, 'tr')}` : `${fmt(x * 100, 0, 'en')}%`)
    return {
      view: R.view,
      step: R.step,
      done: R.done,
      status() {
        const v = R.view, b = v.cars[v.best], L = v.track.length
        if (R.done()) return cap(`nesil ${v.gen}: bir araç ${o.laps} tur attı`, `generation ${v.gen}: a car drove ${o.laps} laps`)
        return cap(`nesil ${v.gen} · ${R.alive()}/${o.pop} araç yolda · en iyi ${pc(b.maxProg / L, 'tr')} tur`, `generation ${v.gen} · ${R.alive()}/${o.pop} cars on the road · best ${pc(b.maxProg / L, 'en')} of a lap`)
      },
      metrics() {
        const v = R.view, L = v.track.length, b = v.cars[v.best]
        const laps = Math.floor(b.maxProg / L), fl = R.firstLapGen()
        return [
          { label: { tr: 'Nesil', en: 'Generation' }, value: cap(String(v.gen), String(v.gen)) },
          { label: { tr: 'Yoldaki araç', en: 'Cars on the road' }, value: cap(`${R.alive()} / ${o.pop}`, `${R.alive()} / ${o.pop}`) },
          { label: { tr: 'En iyi araç (bu nesil)', en: 'Best car (this generation)' }, value: cap(`${laps} tur + ${pc((b.maxProg / L) % 1, 'tr')}`, `${laps} laps + ${pc((b.maxProg / L) % 1, 'en')}`) },
          { label: { tr: 'Rekor', en: 'Record' }, value: cap(`${fmt(R.record() / L, 2, 'tr')} tur`, `${fmt(R.record() / L, 2, 'en')} laps`), tone: R.record() >= L ? 'good' : undefined },
          { label: { tr: 'İlk tam tur', en: 'First full lap' }, value: fl ? cap(`${fl}. nesil`, `generation ${fl}`) : cap('henüz yok', 'not yet'), tone: fl ? 'good' : undefined },
          { label: { tr: 'Süre (bu nesil)', en: 'Time (this generation)' }, value: cap(`${fmt(v.tick * DT, 1, 'tr')} sn`, `${fmt(v.tick * DT, 1, 'en')} s`) },
        ]
      },
      curves() {
        return [
          { label: { tr: 'Nesil başına en iyi araç (tur)', en: 'Best car per generation (laps)' }, values: [...R.hist], tone: 0 },
          { label: { tr: 'Nesil ortalaması (tur)', en: 'Generation average (laps)' }, values: [...R.meanHist], tone: 1 },
        ]
      },
    }
  },
}

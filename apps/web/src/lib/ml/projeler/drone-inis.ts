// Proje: drone iniş (pekiştirmeli öğrenme). Dikey eksende basit fizik: yükseklik h, dikey hız v, yerçekimi ve dört gaz kademesi.
// Rüzgâr hamleleri (sabit tohumlu) drone'u aşağı ya da yukarı iter, yana da sürükler (yana sürüklenme yalnız görüntüdür).
// Model: tablo hâlinde Q-öğrenme (Q-öğrenme dersinin aynısı, bu kez ödül ve iskonto ile), ε-açgözlü keşif, ε zamanla azalır.
// Eğitim arka planda hızlı bölümlerle sürer; sahnede güncel tabloyla açgözlü uçan bir gösteri drone'u gerçek zamana yakın oynar.
import { cap, fmt, gauss, rng } from '../core'
import type { Metric, ProjectDef, ProjectRun } from './core'
import { B, type EgitimRaporu } from '../egitim/rapor'

/** Fizik sabitleri: benzetim adımı (s), yerçekimi (m/s²), yumuşak iniş sınırı (m/s), en uzun bölüm (adım). */
export const DT = 0.05
export const G = 9.81
export const SOFT = 1.0
export const MAX_TICKS = 400
/** Karar her 2 benzetim adımında bir verilir (0,1 s); gaz kademesi bu süre boyunca sabit. */
export const REPEAT = 2
/** Gaz kademeleri: ağırlığın kaçta kaçı kadar itki. 1,0 havada asılı kalır. */
export const THROTTLE = [0, 0.7, 1.0, 1.3]
const CEIL = 16

/** Durum kutuları: yükseklik, dikey hız ve rüzgâr hamlesinin yönü. */
const H_EDGES = [0.3, 0.7, 1.2, 2, 3, 4.5, 6.5, 9, 12]
const V_EDGES = [-6, -4, -3, -2, -1.5, -1, -0.5, 0, 0.5, 1.5]
const NH = H_EDGES.length + 1, NV = V_EDGES.length + 1, NW = 3, NA = THROTTLE.length
export const N_STATES = NH * NV * NW
const bin = (x: number, e: number[]) => { let i = 0; while (i < e.length && x >= e[i]) i++; return i }
export const stateOf = (h: number, v: number, gz: number) => (bin(h, H_EDGES) * NV + bin(v, V_EDGES)) * NW + (gz < -0.6 ? 0 : gz > 0.6 ? 2 : 1)

export type Outcome = 'soft' | 'hard' | 'away' | 'time'
/** Ödüller: her karar −0,1; yumuşak iniş +100; sert iniş −50 − 10·|v|; kaçış ya da süre dolması −60. */
export function reward(o: Outcome | null, v: number): number {
  if (o === 'soft') return 100
  if (o === 'hard') return -50 - 10 * Math.abs(v)
  if (o) return -60
  return -0.1
}

/** Tek drone'un fiziği; rüzgâr Ornstein-Uhlenbeck süreci (yavaş değişen hamle). */
export interface Body { h: number; v: number; gz: number; gx: number; x: number; t: number; a: number }
export function newBody(r: () => number, wind: number): Body {
  return { h: 6 + 4 * r(), v: -1.5 * r(), gz: wind * 0.8 * gauss(r), gx: wind * gauss(r), x: 0, t: 0, a: 2 }
}
/** Bir benzetim adımı. Dönüş: bölüm bittiyse sonuç. */
export function tick(b: Body, a: number, wind: number, r: () => number): Outcome | null {
  b.a = a
  b.gz += -0.08 * b.gz + wind * 0.35 * gauss(r)
  b.gx += -0.05 * b.gx + wind * 0.3 * gauss(r)
  const acc = THROTTLE[a] * G - G + b.gz
  b.v += acc * DT
  b.h += b.v * DT
  b.x = Math.max(-3, Math.min(3, b.x + b.gx * 0.04 * DT * 10))
  b.t++
  if (b.h <= 0) { b.h = 0; return Math.abs(b.v) < SOFT ? 'soft' : 'hard' }
  if (b.h > CEIL) return 'away'
  if (b.t >= MAX_TICKS) return 'time'
  return null
}

const argmax = (Q: Float64Array, s: number, r?: () => number) => {
  let best = Q[s * NA], bi = 0, ties = 1
  for (let a = 1; a < NA; a++) {
    const q = Q[s * NA + a]
    if (q > best) { best = q; bi = a; ties = 1 } else if (q === best && r) { ties++; if (r() < 1 / ties) bi = a }
  }
  return bi
}

export interface DroneParams { seed: number; wind: number; alpha: number; gamma: number; eps: number }
/** Biten bölüm: sonuç, temas hızı, toplam ödül (getiri), karar sayısı ve bölüm boyunca geçerli ε. */
export interface EpisodeLog { outcome: Outcome; v: number; ret: number; steps: number; eps: number }

/** Eğitici: ε-açgözlü Q-öğrenme. `ticks(n)` n benzetim adımı ilerletir; bölümler biter, yenisi başlar. */
export function makeLearner(p: DroneParams) {
  const r = rng(p.seed)
  const Q = new Float64Array(N_STATES * NA)
  const log: EpisodeLog[] = []
  let b = newBody(r, p.wind)
  let s = stateOf(b.h, b.v, b.gz), a = 2, k = 0, ret = 0, dec = 0
  const epsNow = () => Math.max(0.02, p.eps * 0.997 ** log.length)
  const choose = () => { a = r() < epsNow() ? Math.floor(r() * NA) : argmax(Q, s, r) }
  choose()
  function ticks(n: number) {
    for (let i = 0; i < n; i++) {
      const o = tick(b, a, p.wind, r)
      k++
      if (o || k >= REPEAT) {
        const s2 = stateOf(b.h, b.v, b.gz)
        const rw = reward(o, b.v)
        ret += rw; dec++
        const target = rw + (o ? 0 : p.gamma * Q[s2 * NA + argmax(Q, s2)])
        Q[s * NA + a] += p.alpha * (target - Q[s * NA + a]) // öğrenmenin tamamı bu satır
        k = 0
        if (o) {
          log.push({ outcome: o, v: b.v, ret, steps: dec, eps: epsNow() })
          ret = 0; dec = 0
          b = newBody(r, p.wind)
          s = stateOf(b.h, b.v, b.gz)
        } else s = s2
        choose()
      }
    }
  }
  return { Q, log, ticks, eps: epsNow, body: () => b }
}

/** Son `n` bölümde yumuşak iniş oranı. */
export const softRate = (log: EpisodeLog[], n: number, end = log.length) => {
  const w = log.slice(Math.max(0, end - n), end)
  return w.length ? w.filter((e) => e.outcome === 'soft').length / w.length : 0
}

/** Açgözlü (keşifsiz) uçuşların başarı oranı: aynı tabloyla `n` deneme. */
export function greedyRate(Q: Float64Array, wind: number, n = 100, seed = 999) {
  const r = rng(seed)
  let ok = 0
  for (let i = 0; i < n; i++) {
    const b = newBody(r, wind)
    let o: Outcome | null = null, a = 2
    while (!o) { if (b.t % REPEAT === 0) a = argmax(Q, stateOf(b.h, b.v, b.gz)); o = tick(b, a, wind, r) }
    if (o === 'soft') ok++
  }
  return ok / n
}

export interface View {
  /** Gösteri drone'u (açgözlü politika, güncel tablo). */
  h: number; v: number; x: number; throttle: number; gz: number; gx: number
  /** Son gösteri inişi: yumuşak mı, sert mi; flaş için kalan süre (0–1). */
  landed: Outcome | null; flash: number
  episodes: number
}

export const MAX_EPISODES = 4000

/** Bölüm geçmişini ve Q tablosunu eğitim raporuna çevirir. Sütunlar artımlı büyür (her çağrıda yalnız yeni bölümler eklenir). */
export function droneReporter(L: ReturnType<typeof makeLearner>, p: DroneParams, finished: () => boolean) {
  const W = 50
  const cols = { episode: [] as number[], return: [] as number[], return_ma: [] as number[], soft: [] as number[], success_ma: [] as number[], epsilon: [] as number[], touchdown_speed: [] as number[], decisions: [] as number[] }
  let sumR = 0, sumS = 0, cache: { n: number; r: EgitimRaporu } | null = null, greedy = NaN
  const hLab = ['<0,3', ...H_EDGES.map((e) => `≥${String(e).replace('.', ',')}`)].reverse()
  const vLab = ['<−6', ...V_EDGES.map((e) => `≥${String(e).replace('-', '−').replace('.', ',')}`)]
  const thin = (n: number) => { const k = Math.max(1, Math.ceil(n / 600)); const out: number[] = []; for (let i = 0; i < n; i += k) out.push(i); if (n && out[out.length - 1] !== n - 1) out.push(n - 1); return out }
  return function report(): EgitimRaporu {
    const log = L.log
    if (cache && cache.n === log.length && !(finished() && Number.isNaN(greedy))) return cache.r
    for (let i = cols.episode.length; i < log.length; i++) {
      const e = log[i], soft = e.outcome === 'soft' ? 1 : 0
      sumR += e.ret; sumS += soft
      if (i >= W) { sumR -= log[i - W].ret; sumS -= log[i - W].outcome === 'soft' ? 1 : 0 }
      const n = Math.min(i + 1, W)
      cols.episode.push(i + 1); cols.return.push(e.ret); cols.return_ma.push(sumR / n); cols.soft.push(soft); cols.success_ma.push(sumS / n)
      cols.epsilon.push(e.eps); cols.touchdown_speed.push(Math.abs(e.v)); cols.decisions.push(e.steps)
    }
    if (finished() && Number.isNaN(greedy)) greedy = greedyRate(L.Q, p.wind)
    const n = log.length, last = log.slice(-100)
    const counts = (['soft', 'hard', 'away', 'time'] as Outcome[]).map((o) => last.filter((e) => e.outcome === o).length)
    // Q tablosu: rüzgârsız (orta) hamle dilimi, satır yükseklik (üstte yüksek), sütun dikey hız
    const maxQ: number[][] = [], act: number[][] = []
    for (let hi = NH - 1; hi >= 0; hi--) {
      const rq: number[] = [], ra: number[] = []
      for (let vi = 0; vi < NV; vi++) {
        const st = (hi * NV + vi) * NW + 1
        let m = -Infinity, bi = 0, seen = false
        for (let a = 0; a < NA; a++) { const q = L.Q[st * NA + a]; if (q !== 0) seen = true; if (q > m) { m = q; bi = a } }
        rq.push(seen ? m : NaN); ra.push(seen ? THROTTLE[bi] * 100 : NaN)
      }
      maxQ.push(rq); act.push(ra)
    }
    const idx = thin(n), sel = (a: number[]) => idx.map((i) => a[i])
    const x = sel(cols.episode), xl = B('bölüm', 'episode')
    const r: EgitimRaporu = {
      kind: 'pekistirmeli', model: B(`tablo Q-öğrenme · ${N_STATES} durum × ${NA} gaz`, `tabular Q-learning · ${N_STATES} states × ${NA} throttle`), seed: p.seed,
      hyper: { alpha: p.alpha, gamma: p.gamma, eps0: p.eps, eps_decay: 0.997, eps_min: 0.02, wind: p.wind },
      history: { x: 'episode', cols: Object.fromEntries(Object.entries(cols).map(([k, v]) => [k, v.slice()])) },
      final: [
        { key: 'episodes', label: B('bölüm', 'episodes'), value: n, fmt: 'int' },
        { key: 'success_100', label: B('yumuşak iniş (son 100)', 'soft landings (last 100)'), value: last.length ? counts[0] / last.length : NaN, fmt: 'pct' },
        { key: 'return_100', label: B('ortalama getiri (son 100)', 'mean return (last 100)'), value: last.length ? last.reduce((a, e) => a + e.ret, 0) / last.length : NaN, fmt: 1 },
        { key: 'epsilon', label: B('keşif ε', 'exploration ε'), value: L.eps(), fmt: 3 },
        { key: 'greedy_success', label: B('açgözlü başarı (100 uçuş)', 'greedy success (100 flights)'), value: greedy, fmt: 'pct' },
      ],
      charts: [
        { kind: 'line', id: 'return', title: B('Bölüm getirisi ve kayan ortalama (50)', 'Episode return and moving average (50)'), x, xLabel: xl, yLabel: B('toplam ödül', 'total reward'), series: [{ key: 'return', label: B('getiri', 'return'), values: sel(cols.return), tone: 1 }, { key: 'return_ma', label: B('ortalama (50)', 'mean (50)'), values: sel(cols.return_ma), tone: 0 }] },
        { kind: 'line', id: 'success', title: B('Başarı oranı ve keşif ε', 'Success rate and exploration ε'), x, xLabel: xl, yMin: 0, yMax: 1, series: [{ key: 'success_ma', label: B('yumuşak iniş (son 50)', 'soft landing (last 50)'), values: sel(cols.success_ma), tone: 3 }, { key: 'epsilon', label: B('ε', 'ε'), values: sel(cols.epsilon), tone: 4, dash: true }], note: B('Hedef: son 100 eğitim inişinin %90’ı yumuşak.', 'Goal: 90% of the last 100 training landings soft.') },
        { kind: 'line', id: 'touchdown', title: B('Temas hızı (m/s)', 'Touchdown speed (m/s)'), x, xLabel: xl, yMin: 0, series: [{ key: 'touchdown_speed', label: B('|v|', '|v|'), values: sel(cols.touchdown_speed), tone: 5 }], note: B(`${SOFT} m/s altı yumuşak iniş sayılır.`, `Below ${SOFT} m/s counts as a soft landing.`) },
        { kind: 'bar', id: 'outcomes', title: B('Son 100 bölümün sonucu', 'Outcome of the last 100 episodes'), labels: ['yumuşak / soft', 'sert / hard', 'kaçtı / away', 'süre / time'], series: [{ key: 'count', label: B('bölüm', 'episodes'), values: counts, tone: 1 }] },
        { kind: 'heat', id: 'q-max', title: B('Q tablosu: en iyi hamlenin puanı (rüzgârsız)', 'Q table: value of the best action (no gust)'), rows: hLab, cols: vLab, values: maxQ, rowLabel: B('yükseklik (m)', 'height (m)'), colLabel: B('dikey hız (m/s)', 'vertical speed (m/s)') },
        { kind: 'heat', id: 'q-act', title: B('Öğrenilen politika: gaz % (rüzgârsız)', 'Learned policy: throttle % (no gust)'), rows: hLab, cols: vLab, values: act, rowLabel: B('yükseklik (m)', 'height (m)'), colLabel: B('dikey hız (m/s)', 'vertical speed (m/s)'), showValues: true },
      ],
    }
    cache = { n, r }
    return r
  }
}

export const DRONE_INIS: ProjectDef<View> = {
  slug: 'drone-inis',
  title: { tr: 'Rüzgârda yumuşak iniş: pekiştirmeli öğrenen drone', en: 'A soft landing in the wind: a drone that learns by reinforcement' },
  sub: { tr: 'Q-öğrenme gaz kolunu deneyerek ayarlamayı öğrenir', en: 'Q-learning learns to work the throttle by trial and error' },
  story: {
    tr: 'Bir teslimat drone’u 6–10 metreden iniş pistine dikey olarak inmeli. Pervanelerin dört gaz kademesi var: kapalı, %70, %100 (havada asılı kalır) ve %130. Rüzgâr hamleleri onu habersizce aşağı ya da yukarı itiyor. Yere 1 m/s’den yavaş değerse iniş yumuşaktır; daha hızlı değerse gövde zarar görür. Drone’a kimse nasıl ineceğini söylemiyor; yalnızca her denemenin sonunda puan alıyor.',
    en: 'A delivery drone must descend vertically from 6–10 metres onto a landing pad. Its propellers have four throttle levels: off, 70%, 100% (hovering) and 130%. Gusts push it up or down without warning. If it touches the ground slower than 1 m/s the landing is soft; faster, and the airframe is damaged. Nobody tells the drone how to land; it only gets a score at the end of every attempt.',
  },
  goal: {
    tr: 'Son 100 eğitim inişinin en az %90’ı yumuşak olsun (keşif hamleleri dahil).',
    en: 'At least 90% of the last 100 training landings are soft (exploration moves included).',
  },
  model: {
    tr: 'Tablo hâlinde Q-öğrenme. Durum: yükseklik (10 kutu) × dikey hız (11 kutu) × rüzgâr hamlesinin yönü (3 kutu) = 330 durum; her durumda 4 gaz kademesi için bir puan, toplam 1.320 puan. Güncelleme Q-öğrenme dersindeki satırın ödüllü ve iskontolu hâli: Q ← Q + α · (ödül + γ · en iyi sonraki Q − Q). Keşif ε-açgözlü: ε her bölümde biraz azalır.',
    en: 'Tabular Q-learning. State: height (10 bins) × vertical speed (11 bins) × gust direction (3 bins) = 330 states; one score per throttle level in each, 1,320 scores in all. The update is the line from the Q-learning lesson with a reward and a discount: Q ← Q + α · (reward + γ · best next Q − Q). Exploration is ε-greedy: ε shrinks a little after every episode.',
  },
  lessons: ['q-ogrenme', 'gradyan-inisi'],
  steps: [
    { tr: 'Her 0,1 saniyede drone durumunu kutulara çevirir: kaç metrede, ne hızla iniyor, rüzgâr hangi yöne itiyor.', en: 'Every 0.1 seconds the drone turns its state into bins: how high it is, how fast it is descending, which way the gust is pushing.' },
    { tr: 'ε olasılıkla rastgele bir gaz kademesi dener, yoksa tablodaki en yüksek puanlı kademeyi seçer.', en: 'With probability ε it tries a random throttle level, otherwise it picks the level with the highest score in the table.' },
    { tr: 'Fizik ilerler: itki eksi ağırlık artı rüzgâr ivmeyi verir, ivme hızı, hız yüksekliği değiştirir.', en: 'Physics runs: thrust minus weight plus wind gives the acceleration, which changes the speed, which changes the height.' },
    { tr: 'Ödül gelir: her karar −0,1 (enerji), yumuşak iniş +100, sert iniş −50 ve hız başına −10, kaçış ya da süre dolması −60. Az önceki kararın puanı ödülle ve varılan durumun en iyi puanıyla düzeltilir.', en: 'The reward arrives: −0.1 per decision (energy), +100 for a soft landing, −50 and −10 per m/s for a hard one, −60 for flying away or running out of time. The score of the decision just made is corrected with the reward and the best score of the state it led to.' },
    { tr: 'Binlerce bölüm arka planda hızla oynanır. Sahnedeki drone keşif yapmadan, o anki tabloyla uçar: tablo iyileştikçe inişi de yumuşar.', en: 'Thousands of episodes run quickly in the background. The drone in the scene flies without exploring, using the table as it is right now: as the table improves, so does its landing.' },
  ],
  task: [
    { tr: 'Rüzgârı 0’a indir: drone yaklaşık 660 bölümde hedefe ulaşır (varsayılan 0,8 rüzgârda yaklaşık 920). Rüzgârı 2’ye çıkar: yaklaşık 1.420 bölüm gerekir, iki katından fazla. Sonra tohumu 13 yap: aynı fırtınada 4.000 bölümde bile hedefe ulaşamaz.', en: 'Set the wind to 0: the drone reaches the goal in about 660 episodes (about 920 with the default wind of 0.8). Raise the wind to 2: it takes about 1,420 episodes, more than twice as many. Then set the seed to 13: in the same storm it does not reach the goal even after 4,000 episodes.' },
    { tr: 'Keşfi (ε) 0’a indir: drone yine öğrenir ama yaklaşık 1.550 bölümde. Sebep Q-öğrenme dersindekinin aynısı: tablo sıfırla başlar, gerçek puanlar ise eksidedir; denenmemiş her kademe olduğundan iyi görünür ve drone onları kendiliğinden dener. ε bu merakı hızlandırır.', en: 'Set exploration (ε) to 0: the drone still learns, but in about 1,550 episodes. The reason is the same as in the Q-learning lesson: the table starts at zero while real scores are negative, so every untried level looks better than it is and the drone tries them anyway. ε speeds this curiosity up.' },
    { tr: 'Öğrenme oranını (α) 0,05’e indir: her deneme tabloyu çok az değiştirir ve hedef yaklaşık 1.800 bölüme, neredeyse iki katına çıkar.', en: 'Lower the learning rate (α) to 0.05: every attempt changes the table only a little and the goal moves to about 1,800 episodes, almost twice as many.' },
  ],
  file: 'drone_inis.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(7)'],
    ['DT, G, YUMUSAK = 0.05, 9.81, 1.0', 'adım (s), yerçekimi, iniş sınırı (m/s)', 'step (s), gravity, landing limit (m/s)'],
    ['GAZ = np.array([0, 0.7, 1.0, 1.3])', 'itki / ağırlık', 'thrust / weight'],
    ['HK = [0.3, 0.7, 1.2, 2, 3, 4.5, 6.5, 9, 12]', 'yükseklik kutuları', 'height bins'],
    ['VK = [-6, -4, -3, -2, -1.5, -1, -0.5, 0, 0.5, 1.5]', 'hız kutuları', 'speed bins'],
    ['durum = lambda h, v, r: (np.digitize(h, HK), np.digitize(v, VK), int(np.sign(r) * (abs(r) > .6)) + 1)'],
    ['Q = np.zeros((10, 11, 3, 4))', '1.320 puan, hepsi sıfır', '1,320 scores, all zero'],
    ['alfa, gama, eps, ruzgar = 0.2, 0.98, 0.3, 0.8'],
    ['history = {\'episode\': [], \'return\': [], \'soft\': [], \'epsilon\': []}', 'eğitim geçmişi: bölüm başına', 'training history: per episode'],
    ['for bolum in range(4000):'],
    ['    h, v, r = rng.uniform(6, 10), -1.5 * rng.random(), 0.0'],
    ['    s, sonuc, getiri = durum(h, v, r), None, 0.0', 'getiri: bölümün toplam ödülü', 'return: total reward of the episode'],
    ['    while sonuc is None:'],
    ['        a = rng.integers(4) if rng.random() < eps else Q[s].argmax()', 'ε-açgözlü', 'ε-greedy'],
    ['        for _ in range(2):', 'karar 0,1 s geçerli', 'a decision holds for 0.1 s'],
    ['            r += -0.08 * r + ruzgar * 0.35 * rng.normal()', 'rüzgâr hamlesi', 'gust'],
    ['            v += (GAZ[a] * G - G + r) * DT; h += v * DT'],
    ['            if h <= 0: sonuc = "yumusak" if abs(v) < YUMUSAK else "sert"; break'],
    ['            if h > 16: sonuc = "kacti"; break'],
    ['        odul = {None: -0.1, "yumusak": 100, "kacti": -60}.get(sonuc, -50 - 10 * abs(v))'],
    ['        getiri += odul'],
    ['        s2 = durum(h, v, r)'],
    ['        hedef = odul + (0 if sonuc else gama * Q[s2].max())'],
    ['        Q[s + (a,)] += alfa * (hedef - Q[s + (a,)])', 'öğrenmenin tamamı bu satır', 'the whole of learning is this line'],
    ['        s = s2'],
    ['    for k, x in zip(history, (bolum + 1, getiri, int(sonuc == "yumusak"), eps)): history[k].append(x)'],
    ['    eps = max(0.02, eps * 0.997)', 'keşif azalır', 'exploration shrinks'],
    ['son = slice(-100, None)', 'son 100 bölüm', 'last 100 episodes'],
    ['print(f\'{"yumuşak iniş (son 100)":<26}{np.mean(history["soft"][son]):>8.2f}\')'],
    ['print(f\'{"ortalama getiri (son 100)":<26}{np.mean(history["return"][son]):>8.1f}\')'],
    ['print(f\'{"epsilon":<26}{eps:>8.3f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir bölüm', 'one row per episode'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    ort = np.convolve(history[\'return\'], np.ones(50) / 50, mode=\'valid\')', '50 bölümlük kayan ortalama', '50-episode moving average'],
    ['    plt.plot(history[\'episode\'], history[\'return\'], alpha=0.3, label=\'return\'); plt.plot(history[\'episode\'][49:], ort, label=\'ma50\')'],
    ['    plt.xlabel(\'episode\'); plt.ylabel(\'return\'); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [
    { key: 'wind', label: { tr: 'Rüzgâr şiddeti', en: 'Wind strength' }, min: 0, max: 2, step: 0.1, value: 0.8 },
    { key: 'eps', label: { tr: 'Başlangıç keşfi ε', en: 'Initial exploration ε' }, min: 0, max: 0.6, step: 0.05, value: 0.3 },
    { key: 'alpha', label: { tr: 'Öğrenme oranı α', en: 'Learning rate α' }, min: 0.05, max: 0.6, step: 0.05, value: 0.2 },
    { key: 'gamma', label: { tr: 'İskonto γ', en: 'Discount γ' }, min: 0.5, max: 0.99, step: 0.01, value: 0.98 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 50, step: 1, value: 7 },
  ],
  perFrame: 10,
  create(pp) {
    const p: DroneParams = { seed: pp.seed ?? 7, wind: pp.wind ?? 0.8, alpha: pp.alpha ?? 0.2, gamma: pp.gamma ?? 0.98, eps: pp.eps ?? 0.3 }
    const L = makeLearner(p)
    // gösteri drone'u: kendi rüzgârı, keşif yok
    const dr = rng(p.seed + 1000)
    let demo = newBody(dr, p.wind), demoA = 2, acc = 0, hold = 0
    let landed: Outcome | null = null
    let lastDemo: { o: Outcome; v: number } | null = null
    const curve: number[] = []
    const view: View = { h: demo.h, v: demo.v, x: 0, throttle: 2, gz: 0, gx: 0, landed: null, flash: 0, episodes: 0 }
    let finished = false
    const goalHit = () => L.log.length >= 100 && softRate(L.log, 100) >= 0.9
    const report = droneReporter(L, p, () => finished)
    const run: ProjectRun<View> = {
      view,
      step(n) {
        if (!finished) {
          const before = L.log.length
          L.ticks(n * 4)
          for (let e = before + 1; e <= L.log.length; e++) if (e % 10 === 0) curve.push(softRate(L.log, 50, e))
          if (goalHit() || L.log.length >= MAX_EPISODES) finished = true
        }
        // gösteri: 1× hızda karede yarım benzetim adımı (gerçek zamanın yaklaşık 1,5 katı)
        acc += n / 20
        while (acc >= 1) {
          acc--
          if (hold > 0) { hold--; if (hold === 0) { demo = newBody(dr, p.wind); landed = null } continue }
          if (demo.t % REPEAT === 0) demoA = argmax(L.Q, stateOf(demo.h, demo.v, demo.gz))
          const o = tick(demo, demoA, p.wind, dr)
          if (o) { landed = o; lastDemo = { o, v: demo.v }; hold = 30 }
        }
        Object.assign(view, { h: demo.h, v: demo.v, x: demo.x, throttle: demo.a, gz: demo.gz, gx: demo.gx, landed, flash: hold / 30, episodes: L.log.length })
      },
      status() {
        const ep = L.log.length
        if (finished) return goalHit() ? cap(`hedef: ${ep} bölümde, son 100 inişte yumuşak oran %${Math.round(softRate(L.log, 100) * 100)}`, `goal: after ${ep} episodes, ${Math.round(softRate(L.log, 100) * 100)}% of the last 100 landings are soft`) : cap(`${ep} bölüm bitti, hedefe ulaşılamadı`, `${ep} episodes done, goal not reached`)
        return cap(`bölüm ${ep} · eğitim arka planda · sahnede açgözlü gösteri uçuşu`, `episode ${ep} · training in the background · greedy demo flight in the scene`)
      },
      metrics() {
        const ep = L.log.length, s50 = softRate(L.log, 50)
        const last = L.log.at(-1)
        const m: Metric[] = [
          { label: { tr: 'Bölüm', en: 'Episodes' }, value: cap(ep.toLocaleString('tr-TR'), ep.toLocaleString('en-US')) },
          { label: { tr: 'Yumuşak iniş (son 50)', en: 'Soft landings (last 50)' }, value: cap(`%${Math.round(s50 * 100)}`, `${Math.round(s50 * 100)}%`), tone: ep >= 50 ? (s50 >= 0.9 ? 'good' : s50 < 0.5 ? 'bad' : undefined) : undefined },
          { label: { tr: 'Son temas hızı (eğitim)', en: 'Last touchdown speed (training)' }, value: last ? cap(`${fmt(Math.abs(last.v), 2, 'tr')} m/s`, `${Math.abs(last.v).toFixed(2)} m/s`) : cap('—', '—'), tone: last ? (last.outcome === 'soft' ? 'good' : 'bad') : undefined },
          { label: { tr: 'Keşif ε', en: 'Exploration ε' }, value: cap(fmt(L.eps(), 3, 'tr'), L.eps().toFixed(3)) },
          { label: { tr: 'Gösteri: yükseklik · hız', en: 'Demo: height · speed' }, value: cap(`${fmt(view.h, 1, 'tr')} m · ${fmt(view.v, 1, 'tr')} m/s`, `${view.h.toFixed(1)} m · ${view.v.toFixed(1)} m/s`) },
          { label: { tr: 'Gösteri: gaz', en: 'Demo: throttle' }, value: cap(`%${Math.round(THROTTLE[view.throttle] * 100)}`, `${Math.round(THROTTLE[view.throttle] * 100)}%`) },
        ]
        if (lastDemo) m.push({ label: { tr: 'Son gösteri inişi', en: 'Last demo landing' }, value: cap(`${lastDemo.o === 'soft' ? 'yumuşak' : lastDemo.o === 'hard' ? 'sert' : 'başarısız'} · ${fmt(Math.abs(lastDemo.v), 2, 'tr')} m/s`, `${lastDemo.o === 'soft' ? 'soft' : lastDemo.o === 'hard' ? 'hard' : 'failed'} · ${Math.abs(lastDemo.v).toFixed(2)} m/s`), tone: lastDemo.o === 'soft' ? 'good' : 'bad' })
        return m
      },
      report,
      curves: () => [{ label: { tr: 'Yumuşak iniş oranı (son 50 bölüm)', en: 'Soft landing rate (last 50 episodes)' }, values: curve }],
      done: () => finished,
    }
    return run
  },
}

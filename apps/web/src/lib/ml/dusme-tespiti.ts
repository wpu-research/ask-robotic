// Ders: düşme tespiti. Hasta odasındaki kamera, poz tahmininden gelen iskelet noktalarını saniyede 10 kez verir. Gövde açısı,
// kalça yüksekliği ve iniş hızından zamansal bir kural kurulur: eğilme ve oturma alarm vermez, gerçek düşme verir.
import { cap, fmt, gauss, rng, shifted, type Frame, type Lesson } from './core'
import { B, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'

export const FPS = 10
export const DUR = 26
/** Hızlı iniş eşiği (m/s) ve inişten sonra yere yatmanın başlaması için süre (kare). */
export const V_DROP = 0.6
const DROP_GAP = 15
export const RATIO = 0.5
const N = DUR * FPS

/** Anahtar kareler: zaman (s), gövde açısı (°, dikeyden), kalça yüksekliği (m). Arada doğrusal geçiş. */
const KT = [5, 5.6, 6.6, 7.3, 10.5, 11.1, 14, 14.6, 18, 18.7]
const KTH = [5, 75, 75, 5, 5, 25, 25, 5, 5, 88]
const KH = [0.92, 0.4, 0.4, 0.92, 0.92, 0.42, 0.42, 0.92, 0.92, 0.12]
/** Yürüyüş konumu (m): anahtar zamanlar ve x. */
const XT = [0, 5, 8, 10.5, 15, 18, 18.7]
const XX = [1.2, 4, 4, 6.2, 6.2, 8.6, 8.75]

export const SEGMENTS: Array<{ t0: number; t1: number; kind: 'walk' | 'bend' | 'sit' | 'fall' | 'stand' }> = [
  { t0: 0, t1: 5, kind: 'walk' }, { t0: 5, t1: 7.3, kind: 'bend' }, { t0: 7.3, t1: 8, kind: 'stand' }, { t0: 8, t1: 10.5, kind: 'walk' },
  { t0: 10.5, t1: 14.6, kind: 'sit' }, { t0: 14.6, t1: 18, kind: 'walk' }, { t0: 18, t1: 26, kind: 'fall' },
]

export function interp(x: number, xs: number[], ys: number[]): number {
  if (x <= xs[0]) return ys[0]
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1])
  return ys[ys.length - 1]
}

/** Anahtar noktalar (m, x sağa, y yukarı): baş, omuz ortası, kalça ortası, iki diz, iki ayak = 7 nokta × 2. */
export const KP = ['head', 'neck', 'hip', 'kneeL', 'kneeR', 'footL', 'footR'] as const

function knee(hx: number, hy: number, fx: number, fy: number): [number, number] {
  const L = 0.46, dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy)
  const mx = (hx + fx) / 2, my = (hy + fy) / 2
  if (d >= 2 * L) return [mx, my]
  const k = Math.sqrt(L * L - (d / 2) ** 2)
  // dik yön, diz öne (x+) baksın
  let px = -dy / d, py = dx / d
  if (px < 0) { px = -px; py = -py }
  return [mx + px * k, my + py * k]
}

/** Gerçek hareket + ölçüm gürültüsü: iskelet dizisi (her kare 14 sayı). */
export function skeleton(seed = 3, noise = 0.015) {
  const r = rng(seed)
  const kp: number[][] = []
  for (let i = 0; i < N; i++) {
    const t = i / FPS
    const th = (interp(t, KT, KTH) * Math.PI) / 180, h = interp(t, KT, KH), x = interp(t, XT, XX)
    const walking = (t < 5) || (t > 8 && t < 10.5) || (t > 14.8 && t < 18)
    const bob = walking ? 0.015 * Math.cos(t * 4 * Math.PI) : 0
    const hy = h + bob
    const sx = x + 0.5 * Math.sin(th), sy = hy + 0.5 * Math.cos(th)
    const ex = sx + 0.24 * Math.sin(th), ey = sy + 0.24 * Math.cos(th)
    let fl: [number, number], fr: [number, number]
    if (t >= 18) {
      const a = Math.min(1, (t - 18) / 0.7)
      fl = [x - 0.08 - a * 0.7, 0.04 + a * 0.06]; fr = [x + 0.08 - a * 0.75, 0.04 + a * 0.03]
    } else if (t > 10.5 && t < 14.6) {
      const a = Math.min(1, (t - 10.5) / 0.6, (14.6 - t) / 0.6)
      fl = [x + a * 0.42, 0.04]; fr = [x + a * 0.46, 0.04]
    } else if (walking) {
      const s = 0.22 * Math.sin(t * 2 * Math.PI)
      fl = [x + s, 0.04 + Math.max(0, Math.cos(t * 2 * Math.PI)) * 0.05]; fr = [x - s, 0.04 + Math.max(0, -Math.cos(t * 2 * Math.PI)) * 0.05]
    } else { fl = [x - 0.08, 0.04]; fr = [x + 0.1, 0.04] }
    const lying = t >= 18.7
    const kl = lying ? [(x + fl[0]) / 2, (hy + fl[1]) / 2] : knee(x, hy, fl[0], fl[1])
    const kr = lying ? [(x + fr[0]) / 2, (hy + fr[1]) / 2] : knee(x, hy, fr[0], fr[1])
    const pts = [ex, ey, sx, sy, x, hy, kl[0], kl[1], kr[0], kr[1], fl[0], fl[1], fr[0], fr[1]]
    kp.push(pts.map((v) => v + noise * gauss(r)))
  }
  return kp
}

/** Öznitelikler ve zamansal kural. Alarm: sayaç N kareye ulaştığı an (her olay için bir kez). */
export function detect(kp: number[][], angThr: number, win: number) {
  const ang: number[] = [], ratio: number[] = [], drop: number[] = [], cnt: number[] = []
  const hip0 = kp.slice(0, 20).map((q) => q[5]).sort((a, b) => a - b)
  const stand = (hip0[9] + hip0[10]) / 2
  const alarms: number[] = []
  let n = 0, last = -99
  kp.forEach((q, i) => {
    const dx = q[2] - q[4], dy = q[3] - q[5]
    ang.push((Math.atan2(Math.abs(dx), dy) * 180) / Math.PI)
    ratio.push(q[5] / stand)
    drop.push(i >= 3 ? ((kp[i - 3][5] - q[5]) * FPS) / 3 : 0)
    if (drop[i] > V_DROP) last = i
    const low = ang[i] > angThr && ratio[i] < RATIO
    n = low && (n > 0 || i - last <= DROP_GAP) ? n + 1 : 0
    cnt.push(n)
    if (n === win) alarms.push(i)
  })
  return { ang, ratio, drop, cnt, alarms, stand }
}

/** Bir aralıktaki en uzun "yerde" sayacı. */
export const maxCount = (cnt: number[], t0: number, t1: number) => Math.max(0, ...cnt.slice(Math.round(t0 * FPS), Math.round(t1 * FPS)))

/**
 * Eğitim paneli (kuralın değerlendirmesi): her kare için gerçek etiket "düşme anı ya da sonrası" (t ≥ 18 s), kuralın kararı
 * "yerde sayacı ≥ pencere". Sayaç skor olarak kullanılınca ROC/PR çıkar; karşılaştırma için yalnız açı eşiğinin düşmeden önce
 * kaç karede yanlış pozitif vereceği de sayılır (eğilme de 75°'ye çıkar). Zaman geçmişi: açı, kalça oranı, iniş hızı ve sayaç.
 */
export function fallReport({ ang = 60, win = 2 }: Record<string, number>): EgitimRaporu {
  const W = Math.max(1, Math.round(win * FPS))
  const D = detect(skeleton(), ang, W)
  const t = D.ang.map((_, i) => Math.round((i / FPS) * 10) / 10)
  const y = t.map((x) => (x >= 18 ? 1 : 0))
  const blk = siniflandirmaBlok({ y, pred: D.cnt.map((c) => (c >= W ? 1 : 0)), labels: ['normal', 'düşme'], scores: D.cnt, threshold: W, pos: B('düşme', 'fall'), neg: B('normal', 'normal') })
  const falseA = D.alarms.filter((i) => t[i] < 18), real = D.alarms.filter((i) => t[i] >= 18)
  const r: EgitimRaporu = {
    kind: 'siniflandirma', model: 'zamansal kural: açı + kalça oranı + iniş hızı + pencere', seed: 3, hyper: { angle: ang, window_s: win, window_frames: W, fps: FPS },
    history: { x: 't', cols: { t, ang: D.ang, ratio: D.ratio, drop: D.drop, count: D.cnt } },
    final: [
      ...blk.final,
      { key: 'angle_only_fp', label: B('yalnız açı: yanlış pozitif kare', 'angle alone: false-positive frames'), value: D.ang.filter((a, i) => y[i] === 0 && a > ang).length, fmt: 'int' },
      { key: 'false_alarms', label: B('yanlış alarm', 'false alarms'), value: falseA.length, fmt: 'int' },
      { key: 'delay_s', label: B('alarm gecikmesi (s)', 'alarm delay (s)'), value: real.length ? t[real[0]] - 18 : NaN, fmt: 1 },
    ],
    confusion: blk.confusion, scores: blk.scores, charts: [],
  }
  const line = (id: string, title: [string, string], key: 'ang' | 'ratio' | 'count', tone: number, lim: number, limLabel: [string, string]) => ({
    kind: 'line' as const, id, title: B(...title), x: t, xLabel: B('zaman (s)', 'time (s)'), live: true,
    series: [{ key, label: B(...title), values: r.history.cols[key], tone }, { key: `${key}_lim`, label: B(...limLabel), values: t.map(() => lim), tone: 0, dash: true }],
    marker: { x: 18, label: B('düşme', 'fall') },
  })
  r.charts = [
    line('angle', ['Gövde açısı (°)', 'Trunk angle (°)'], 'ang', 1, ang, ['açı eşiği', 'angle threshold']),
    line('ratio', ['Kalça yüksekliği / ayakta', 'Hip height / standing'], 'ratio', 2, RATIO, ['oran eşiği', 'ratio threshold']),
    line('count', ['Yerde sayacı (kare)', 'On-floor counter (frames)'], 'count', 4, W, ['pencere', 'window']),
    ...blk.charts,
  ]
  return r
}

export interface FallFrame extends Frame {
  i: number
  kp: number[][]
  ang: number[]
  ratio: number[]
  drop: number[]
  cnt: number[]
  angThr: number
  win: number
  /** Şimdiye kadar çalan alarmların kare numaraları. */
  alarms: number[]
  /** Ayrıntı gösterimi: açı / yükseklik / hız ölçüsünü sahnede çiz. */
  show?: 'angle' | 'ratio' | 'drop'
  note?: [string, string]
  done?: boolean
}

const KIND: Record<string, [string, string]> = {
  walk: ['yürüme', 'walking'], bend: ['eğilme', 'bending'], stand: ['ayakta', 'standing'], sit: ['oturma', 'sitting'], fall: ['düşme', 'fall'],
}
export const kindName = (k: string): [string, string] => KIND[k]
const segAt = (t: number) => SEGMENTS.find((s) => t >= s.t0 && t < s.t1) ?? SEGMENTS[SEGMENTS.length - 1]

export const DUSME_TESPITI: Lesson<FallFrame> = {
  slug: 'dusme-tespiti',
  n: 0,
  title: { tr: 'Düşme tespiti: iskeletten alarma', en: 'Fall detection: from skeleton to alarm' },
  sub: { tr: 'Gövde açısı, kalça yüksekliği ve zaman penceresiyle kural', en: 'A rule built on trunk angle, hip height and a time window' },
  story: {
    tr: 'Hastane odasındaki kamera ve bakım robotu, hastayı 26 saniye boyunca izliyor. Poz tahmini modeli saniyede 10 kez yedi iskelet noktası veriyor: baş, omuz ortası, kalça ortası, iki diz, iki ayak (her biri ±1,5 cm gürültülü). Hasta yürüyor, yerden bir şey almak için derin eğiliyor, sandalyeye oturuyor, kalkıyor ve 18. saniyede düşüyor. Robot yalnız gerçek düşmede hemşireyi çağırmalı.',
    en: 'A camera and a care robot watch a patient in a hospital room for 26 seconds. A pose estimation model gives seven skeleton points 10 times a second: head, shoulder centre, hip centre, two knees, two feet (each with ±1.5 cm noise). The patient walks, bends deeply to pick something off the floor, sits on a chair, gets up and falls at second 18. The robot should call the nurse only for the real fall.',
  },
  how: [
    { tr: 'Gövde açısı: omuz ortasından kalça ortasına giden çizginin dikeyle yaptığı açı. Ayakta 5°, yerde yatarken 90°\'ye yakın.', en: 'Trunk angle: the angle between the vertical and the line from the hip centre to the shoulder centre. About 5° standing, close to 90° lying down.' },
    { tr: 'Kalça yüksekliği, ilk 2 saniyedeki ayakta duruşa oranlanır (kişinin boyu ve kamera uzaklığı sadeleşir). İniş hızı: kalçanın 0,3 saniyede ne kadar alçaldığı.', en: 'Hip height is divided by the standing height of the first 2 seconds (so body size and camera distance cancel). Drop speed: how far the hip went down in 0.3 seconds.' },
    { tr: 'Kural: açı eşiği geçilmiş ve kalça yarı yüksekliğin altındaysa kişi "yerde" sayılır; bu durum hızlı bir inişle (> 0,6 m/s) başlamış ve 2 saniye (20 kare) sürmüşse alarm.', en: 'Rule: if the angle threshold is exceeded and the hip is below half height, the person counts as "on the floor"; if that began with a fast drop (> 0.6 m/s) and lasts 2 seconds (20 frames), alarm.' },
    { tr: 'Eğilmede açı 75°\'ye çıkar ve kalça da iner, ama kişi 1 saniye sonra doğrulur: sayaç 20\'ye varmaz. Oturmada kalça iner ama gövde dik kalır.', en: 'When bending, the angle rises to 75° and the hip drops too, but the person straightens up after 1 second: the counter never reaches 20. When sitting, the hip drops but the trunk stays upright.' },
    { tr: 'Şunu dene: zaman penceresini 1 saniyeye indir, eğilme yanlış alarm verir. Açı eşiğini 20°\'ye indir, oturma da alarm verir.', en: 'Try this: shorten the time window to 1 second and bending raises a false alarm. Lower the angle threshold to 20° and sitting raises one too.' },
  ],
  why: {
    tr: 'Yaşlı bakım evlerinde, hastanelerde ve evde yalnız yaşayanlarda düşmeden sonra yardımın ne kadar çabuk geldiği hayati önem taşır. Kamera görüntüsü kaydedilmeden yalnız iskelet işlendiği için mahremiyet de korunur. Aynı açı ve zaman kuralları, iş güvenliğinde yerde kalan işçiyi ve robotikte insansı robotun kendi düşüşünü fark etmede de kullanılır.',
    en: 'In care homes, hospitals and for people living alone, how fast help arrives after a fall is vital. Since only the skeleton is processed and no video is stored, privacy is kept too. The same angle-and-time rules are used to spot a worker lying on the floor in industrial safety, and in robotics for a humanoid robot to notice its own fall.',
  },
  file: 'dusme.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(3)'],
    ['FPS, ANG, WIN = 10, 60, 20', 'kare/s, açı eşiği °, pencere (kare)', 'frames/s, angle threshold °, window (frames)'],
    ['kt = [5, 5.6, 6.6, 7.3, 10.5, 11.1, 14, 14.6, 18, 18.7]', 'anahtar anlar (s)', 'key times (s)'],
    ['kth = [5, 75, 75, 5, 5, 25, 25, 5, 5, 88]', 'gövde açısı (°)', 'trunk angle (°)'],
    ['kh = [.92, .4, .4, .92, .92, .42, .42, .92, .92, .12]', 'kalça yüksekliği (m)', 'hip height (m)'],
    ['t = np.arange(0, 26, 1 / FPS)'],
    ['th = np.radians(np.interp(t, kt, kth))'],
    ['hip = np.stack([0 * t, np.interp(t, kt, kh)], 1)', 'kalça ortası', 'hip centre'],
    ['sh = hip + 0.5 * np.stack([np.sin(th), np.cos(th)], 1)', 'omuz ortası', 'shoulder centre'],
    ['hip += rng.normal(0, 0.015, hip.shape)', 'poz tahmini gürültüsü', 'pose estimation noise'],
    ['sh += rng.normal(0, 0.015, sh.shape)'],
    ['d = sh - hip', 'gövde vektörü', 'trunk vector'],
    ['ang = np.degrees(np.arctan2(np.abs(d[:, 0]), d[:, 1]))', 'dikeyden açı', 'angle from vertical'],
    ['ratio = hip[:, 1] / np.median(hip[:20, 1])', 'ayakta duruşa oran', 'ratio to standing'],
    ['drop = np.r_[0, 0, 0, hip[:-3, 1] - hip[3:, 1]] * FPS / 3', 'iniş hızı m/s', 'drop speed m/s'],
    ['low = (ang > ANG) & (ratio < 0.5)', 'yerde mi?', 'on the floor?'],
    ['n, last = 0, -99', 'sayaç, son hızlı iniş', 'counter, last fast drop'],
    ["history = {'t': [], 'ang': [], 'ratio': [], 'drop': [], 'count': []}", 'kare kare geçmiş', 'frame-by-frame history'],
    ['for i in range(len(t)):'],
    ['    if drop[i] > 0.6: last = i', 'hızlı iniş', 'fast drop'],
    ['    n = n + 1 if low[i] and (n or i - last <= 15) else 0', 'yerde kalma sayacı', 'time-on-floor counter'],
    ['    r = [round(t[i], 1), ang[i], ratio[i], drop[i], n]'],
    ['    for k, v in zip(history, r): history[k].append(float(v))'],
    ["    if n == WIN: print(f'ALARM: t = {t[i]:.1f} s')"],
    ["print('eğilmede yerde kare:', low[50:75].sum(), '<', WIN)"],
    ['y = t >= 18', 'gerçek: düşme anı ve sonrası', 'truth: the fall and after'],
    ["pred = np.array(history['count']) >= WIN", 'kuralın kararı', 'the rule’s decision'],
    ['tp = (pred & y).sum(); p, r = tp / max(pred.sum(), 1), tp / y.sum()'],
    ["for k, v in [('precision', p), ('recall', r), ('f1', 2 * p * r / max(p + r, 1e-9))]:", 'son ölçümler', 'final metrics'],
    ["    print(f'{k:<10}{v:>8.3f}')"],
    ['import csv'],
    ["with open('egitim_gecmisi.csv', 'w', newline='') as f:", 'satır başına bir kare', 'one row per frame'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ["    plt.plot(history['t'], history['ang'], label='ang')"],
    ["    plt.plot(history['t'], np.array(history['count']) * 3, label='count × 3')"],
    ["    plt.axvline(18, ls='--'); plt.xlabel('t (s)'); plt.legend(); plt.show()"],
    ['except ImportError:'],
    ["    print('matplotlib yok: grafik atlandı')"],
  ],
  params: [
    { key: 'ang', label: { tr: 'Açı eşiği (°)', en: 'Angle threshold (°)' }, min: 15, max: 85, step: 5, value: 60 },
    { key: 'win', label: { tr: 'Zaman penceresi (s)', en: 'Time window (s)' }, min: 0.5, max: 4, step: 0.1, value: 2 },
  ],
  report: fallReport,
  run({ ang = 60, win = 2 }) {
    const W = Math.max(1, Math.round(win * FPS))
    const kp = skeleton()
    const D = detect(kp, ang, W)
    const base = { kp, ang: D.ang, ratio: D.ratio, drop: D.drop, cnt: D.cnt, angThr: ang, win: W }
    const F: FallFrame[] = []
    const stat = cap(`açı > ${ang}° · kalça < 0,5 · ${fmt(W / FPS, 1, 'tr')} s yerde`, `angle > ${ang}° · hip < 0.5 · ${(W / FPS).toFixed(1)} s on the floor`)
    const al = (i: number) => D.alarms.filter((a) => a <= i)
    const fr = (i: number, line: number, c: [string, string], hold = 1, extra: Partial<FallFrame> = {}): FallFrame =>
      ({ ...base, i, alarms: al(i), line, cap: c, stat, hold, ...extra })
    F.push(fr(0, 8, cap('poz tahmini: 7 iskelet noktası, saniyede 10 kez', 'pose estimation: 7 skeleton points, 10 times a second'), 2))
    F.push(fr(0, 13, cap(`gövde açısı: ${fmt(D.ang[0], 1, 'tr')}° (dikeyden)`, `trunk angle: ${D.ang[0].toFixed(1)}° (from vertical)`), 1.8, { show: 'angle' }))
    F.push(fr(0, 14, cap(`kalça oranı: ${fmt(D.ratio[0], 2, 'tr')} (ayakta = 1)`, `hip ratio: ${D.ratio[0].toFixed(2)} (standing = 1)`), 1.8, { show: 'ratio' }))
    F.push(fr(3, 15, cap(`iniş hızı: ${fmt(D.drop[3], 2, 'tr')} m/s`, `drop speed: ${D.drop[3].toFixed(2)} m/s`), 1.5, { show: 'drop' }))
    const notes = new Map<number, { line: number; c: [string, string]; hold: number; show?: FallFrame['show'] }>()
    const bendMax = maxCount(D.cnt, 5, 8)
    notes.set(56, { line: 19, c: cap(`eğilme: hızlı iniş (${fmt(Math.max(...D.drop.slice(50, 60)), 2, 'tr')} m/s), açı ${fmt(D.ang[56], 0, 'tr')}°`, `bending: fast drop (${Math.max(...D.drop.slice(50, 60)).toFixed(2)} m/s), angle ${D.ang[56].toFixed(0)}°`), hold: 2, show: 'angle' })
    notes.set(72, { line: 20, c: D.alarms.some((a) => a < 80) ? cap(`eğilme: sayaç ${bendMax} ≥ ${W}, yanlış alarm!`, `bending: counter ${bendMax} ≥ ${W}, false alarm!`) : cap(`eğilme bitti: sayaç en çok ${bendMax} < ${W}, alarm yok`, `bending over: counter peaked at ${bendMax} < ${W}, no alarm`), hold: 2.5 })
    notes.set(120, { line: 16, c: D.alarms.some((a) => a >= 105 && a < 150) ? cap(`oturma: açı ${fmt(D.ang[120], 0, 'tr')}° > ${ang}°, yanlış alarm!`, `sitting: angle ${D.ang[120].toFixed(0)}° > ${ang}°, false alarm!`) : cap(`oturma: kalça ${fmt(D.ratio[120], 2, 'tr')} ama açı ${fmt(D.ang[120], 0, 'tr')}° < ${ang}°`, `sitting: hip ${D.ratio[120].toFixed(2)} but angle ${D.ang[120].toFixed(0)}° < ${ang}°`), hold: 2.2, show: 'angle' })
    notes.set(186, { line: 19, c: cap(`düşme: iniş ${fmt(Math.max(...D.drop.slice(180, 190)), 2, 'tr')} m/s, açı ${fmt(D.ang[186], 0, 'tr')}°`, `fall: drop ${Math.max(...D.drop.slice(180, 190)).toFixed(2)} m/s, angle ${D.ang[186].toFixed(0)}°`), hold: 2, show: 'drop' })
    const alarmSet = new Set(D.alarms)
    for (let i = 4; i < N; i++) {
      const nt = notes.get(i)
      const seg = segAt(i / FPS)
      const k = kindName(seg.kind)
      const c = cap(`${fmt(i / FPS, 1, 'tr')} s · ${k[0]} · sayaç ${D.cnt[i]}/${W}`, `${(i / FPS).toFixed(1)} s · ${k[1]} · counter ${D.cnt[i]}/${W}`)
      if (alarmSet.has(i)) F.push(fr(i, 21, cap(`ALARM ${fmt(i / FPS, 1, 'tr')} s: ${k[0]} (${W} kare yerde)`, `ALARM at ${(i / FPS).toFixed(1)} s: ${k[1]} (${W} frames on the floor)`), 2.6))
      else if (nt) F.push(fr(i, nt.line, nt.c, nt.hold, { show: nt.show }))
      else if (i % 2 === 0) F.push(fr(i, D.cnt[i] > 0 ? 20 : 16, c, 0.45))
    }
    const real = D.alarms.filter((a) => a >= 180), falseA = D.alarms.filter((a) => a < 180)
    F.push(fr(N - 1, 22, real.length && !falseA.length
      ? cap(`yalnız düşme alarm verdi: ${fmt(real[0] / FPS, 1, 'tr')} s (düşüşten ${fmt(real[0] / FPS - 18, 1, 'tr')} s sonra)`, `only the fall raised an alarm: ${(real[0] / FPS).toFixed(1)} s (${(real[0] / FPS - 18).toFixed(1)} s after the fall)`)
      : cap(`${falseA.length} yanlış alarm · düşme ${real.length ? 'yakalandı' : 'kaçtı'}`, `${falseA.length} false alarms · fall ${real.length ? 'caught' : 'missed'}`), 3, { done: true }))
    return F
  },
}
// Geçmiş kaydı için döngünün önüne 1 (17'den sonra), döngünün içine 2 satır (20'den sonra) eklendi: vurgulanan satırlar kayar.
DUSME_TESPITI.run = shifted(shifted(DUSME_TESPITI.run, 20, 2), 17, 1)

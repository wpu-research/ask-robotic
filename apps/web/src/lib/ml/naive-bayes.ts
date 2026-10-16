// Ders 4: Gauss naive Bayes. Robotun önünde engel var mı? Ultrasonik mesafe (cm) ve IR yansıma (0–100) birlikte okunur; her sınıf
// ve özellik için ortalama ve varyans, sınıfların oranı (önsel) öğrenilir; yeni ölçümde log olasılıkların toplamı karşılaştırılır.
import { cap, fmt, gauss, mean, rng, variance, type Frame, type Lesson, type Pt } from './core'

export interface NBModel { m: [number, number]; v: [number, number]; prior: number }
export interface NBFrame extends Frame {
  X: Pt[]
  /** Öğrenilen kısım (sınıf → model); null: henüz yok. */
  model: Array<NBModel | null>
  /** Şu an vurgulanan sınıf ve özellik (eğitim adımı). */
  fitC?: number
  q?: { x: number; y: number }
  scores?: [number, number]
  pred?: number
  done: Array<{ x: number; y: number; pred: number }>
  regions?: boolean
  acc?: number
}

/** 0 = boş yol (uzak, az yansıma), 1 = engel (yakın, çok yansıma). Sensörler gürültülü, sınıflar biraz örtüşür. */
export function obstacleData(seed = 21, n0 = 70, n1 = 50) {
  const r = rng(seed)
  const X: Pt[] = []
  for (let i = 0; i < n0; i++) X.push({ x: 118 + 32 * gauss(r), y: 28 + 11 * gauss(r), c: 0 })
  for (let i = 0; i < n1; i++) X.push({ x: 52 + 22 * gauss(r), y: 63 + 13 * gauss(r), c: 1 })
  return X.map((p) => ({ ...p, x: Math.max(4, Math.min(200, p.x)), y: Math.max(0, Math.min(100, p.y)) }))
}

export function fitNB(X: Pt[]): NBModel[] {
  return [0, 1].map((c) => {
    const S = X.filter((p) => p.c === c)
    return { m: [mean(S.map((p) => p.x)), mean(S.map((p) => p.y))], v: [variance(S.map((p) => p.x)), variance(S.map((p) => p.y))], prior: S.length / X.length }
  })
}
export function logp(x: number, y: number, M: NBModel): number {
  const one = (z: number, m: number, v: number) => -0.5 * (Math.log(2 * Math.PI * v) + (z - m) ** 2 / v)
  return Math.log(M.prior) + one(x, M.m[0], M.v[0]) + one(y, M.m[1], M.v[1])
}
export const nbPredict = (model: NBModel[], x: number, y: number) => (logp(x, y, model[1]) > logp(x, y, model[0]) ? 1 : 0)

const QUERIES = [{ x: 150, y: 22 }, { x: 40, y: 70 }, { x: 82, y: 46 }, { x: 105, y: 58 }]

export const NAIVE_BAYES: Lesson<NBFrame> = {
  slug: 'naive-bayes',
  n: 4,
  title: { tr: 'Naive Bayes: olasılıkla karar', en: 'Naive Bayes: deciding with probabilities' },
  sub: { tr: 'İki sensörü birleştirip "önde engel var mı?" sorusunu yanıtlamak', en: 'Combining two sensors to answer "is there an obstacle ahead?"' },
  story: {
    tr: "Robot her an iki sensör okur: ultrasonik mesafe ve IR yansıma. 120 etiketli ölçümümüz var: 70'i boş yolda, 50'si önde engel varken. İki sensör de gürültülü; tek başına hiçbiri güvenilir değil.",
    en: 'The robot reads two sensors all the time: ultrasonic distance and IR reflection. We have 120 labelled readings: 70 on a free path and 50 with an obstacle ahead. Both sensors are noisy; neither is reliable on its own.',
  },
  how: [
    { tr: 'Her sınıf için her sensörün ortalaması ve varyansı hesaplanır: dört çan eğrisi. Sınıfların oranı da önsel olasılıktır (70/120, 50/120).', en: 'For each class we compute the mean and variance of each sensor: four bell curves. The class ratio is the prior (70/120, 50/120).' },
    { tr: '"Naive" varsayım: sınıf bilindiğinde sensörler birbirinden bağımsızdır. Böylece olasılıklar çarpılır, logaritmada toplanır.', en: 'The "naive" assumption: given the class, the sensors are independent, so probabilities multiply (add in log space).' },
    { tr: 'Yeni ölçüm için iki sınıfın log olasılığı hesaplanır; büyük olan kazanır.', en: 'For a new reading the log probability of both classes is computed; the larger one wins.' },
    { tr: 'Sonuçta sınır eğri bir çizgidir (iki Gauss’un karşılaştığı yer). 30 saklı ölçümle doğruluk ölçülür.', en: 'The resulting border is a curve where the two Gaussians meet. Accuracy is measured on 30 hidden readings.' },
  ],
  why: {
    tr: 'Az veriyle bile çalışır, eğitimi bir ortalama ve varyans hesabıdır, ve her kararın gerekçesi okunabilir. Veri madenciliğinin en çok kullanılan on algoritmasından biridir; spam süzgeçleri, arıza teşhisi ve sensör birleştirmede hâlâ yaygındır.',
    en: 'It works with little data, training is just a mean and a variance, and the reason for every decision is readable. It is one of the top 10 algorithms in data mining and is still common in spam filters, fault diagnosis and sensor fusion.',
  },
  file: 'naive_bayes.py',
  code: [
    ['import numpy as np'],
    ['from robot import X, y, Q', '[mesafe cm, IR], 1 = engel', '[distance cm, IR], 1 = obstacle'],
    ['def fit(X, y):'],
    ['    return [(X[y == c].mean(0), X[y == c].var(0), (y == c).mean()) for c in (0, 1)]', 'ortalama, varyans, önsel', 'mean, variance, prior'],
    ['def logp(x, m, v, prior):'],
    ['    return np.log(prior) - 0.5 * (np.log(2 * np.pi * v) + (x - m) ** 2 / v).sum()', 'bağımsız: log olasılıklar toplanır', 'independent: log probabilities add'],
    ['model = fit(X, y)'],
    ['for x in Q:'],
    ['    s = [logp(x, *model[c]) for c in (0, 1)]', 'iki sınıfın puanı', 'score of both classes'],
    ['    print(int(np.argmax(s)))', 'büyük olan kazanır', 'the larger wins'],
  ],
  params: [],
  run() {
    const X = obstacleData()
    const T = obstacleData(77, 18, 12)
    const full = fitNB(X)
    const F: NBFrame[] = []
    const stat = cap('120 ölçüm · 70 boş · 50 engel', '120 readings · 70 free · 50 obstacle')
    const none = [null, null] as Array<NBModel | null>
    F.push({ X, model: none, done: [], line: 1, cap: cap('etiketli ölçümler', 'labelled readings'), stat, hold: 1.8 })
    F.push({ X, model: [full[0], null], fitC: 0, done: [], line: 3, cap: cap(`boş yol: mesafe ${full[0].m[0].toFixed(0)} cm, IR ${full[0].m[1].toFixed(0)}`, `free path: distance ${full[0].m[0].toFixed(0)} cm, IR ${full[0].m[1].toFixed(0)}`), stat: cap(`önsel ${fmt(full[0].prior, 2, 'tr')}`, `prior ${full[0].prior.toFixed(2)}`), hold: 1.8 })
    F.push({ X, model: full, fitC: 1, done: [], line: 3, cap: cap(`engel: mesafe ${full[1].m[0].toFixed(0)} cm, IR ${full[1].m[1].toFixed(0)}`, `obstacle: distance ${full[1].m[0].toFixed(0)} cm, IR ${full[1].m[1].toFixed(0)}`), stat: cap(`önsel ${fmt(full[1].prior, 2, 'tr')}`, `prior ${full[1].prior.toFixed(2)}`), hold: 1.8 })
    const done: NBFrame['done'] = []
    QUERIES.forEach((q, i) => {
      const s: [number, number] = [logp(q.x, q.y, full[0]), logp(q.x, q.y, full[1])]
      const pred = s[1] > s[0] ? 1 : 0
      const n = i + 1
      F.push({ X, model: full, q, scores: s, done: [...done], line: 8, cap: cap(`ölçüm ${n}: ${q.x} cm, IR ${q.y}`, `reading ${n}: ${q.x} cm, IR ${q.y}`), stat: cap(`log p: boş ${fmt(s[0], 1, 'tr')} · engel ${fmt(s[1], 1, 'tr')}`, `log p: free ${s[0].toFixed(1)} · obstacle ${s[1].toFixed(1)}`), hold: 1.6 })
      F.push({ X, model: full, q, scores: s, pred, done: [...done], line: 9, cap: cap(pred ? 'engel var: fren' : 'yol boş: devam', pred ? 'obstacle: brake' : 'path free: keep going'), stat: cap(`fark ${fmt(Math.abs(s[1] - s[0]), 1, 'tr')}`, `margin ${Math.abs(s[1] - s[0]).toFixed(1)}`), hold: 1.2 })
      done.push({ ...q, pred })
    })
    const acc = T.filter((p) => nbPredict(full, p.x, p.y) === p.c).length / T.length
    F.push({ X, model: full, done: [...done], regions: true, acc, line: 9, cap: cap(`karar sınırı · test doğruluğu %${Math.round(acc * 100)}`, `decision border · test accuracy ${Math.round(acc * 100)}%`), stat: cap('30 saklı ölçüm', '30 hidden readings'), hold: 3 })
    return F
  },
}

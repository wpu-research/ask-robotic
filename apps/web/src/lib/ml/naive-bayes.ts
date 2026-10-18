// Ders 4: Gauss naive Bayes. Robotun önünde engel var mı? Ultrasonik mesafe (cm) ve IR yansıma (0–100) birlikte okunur; her sınıf
// ve özellik için ortalama ve varyans, sınıfların oranı (önsel) öğrenilir; yeni ölçümde log olasılıkların toplamı karşılaştırılır.
import { cap, fmt, gauss, mean, rng, variance, type Frame, type Lesson, type Pt, shifted } from './core'
import { B, ogrenmeEgrisi, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'
import { accuracy } from './egitim/metrics'

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

/** Log olasılık oranı log p(engel | x) − log p(boş | x): sıfırın üstü engel (eşik kaydırıcısının skoru). */
export const nbScore = (model: NBModel[], x: number, y: number) => logp(x, y, model[1]) - logp(x, y, model[0])

/**
 * Eğitim raporu: öğrenme eğrisi (her 12 eğitim ölçümünden ilk m tanesiyle model; eğitim ve test doğruluğu), tam modelin 30 test
 * ölçümünde karışıklık matrisi, kesinlik/duyarlılık, log oran skoruyla ROC ve kesinlik–duyarlılık eğrileri.
 */
export function naiveBayesReport(): EgitimRaporu {
  const X = obstacleData(), T = obstacleData(77, 18, 12)
  const yT = T.map((p) => p.c)
  const h = { n_train: [] as number[], train_acc: [] as number[], test_acc: [] as number[] }
  for (let m = 1; m <= 12; m++) {
    const S = X.filter((_, i) => i % 12 < m)
    const M = fitNB(S)
    h.n_train.push(S.length)
    h.train_acc.push(accuracy(S.map((p) => p.c), S.map((p) => nbPredict(M, p.x, p.y))))
    h.test_acc.push(accuracy(yT, T.map((p) => nbPredict(M, p.x, p.y))))
  }
  const full = fitNB(X)
  const blk = siniflandirmaBlok({
    y: yT, pred: T.map((p) => nbPredict(full, p.x, p.y)), scores: T.map((p) => nbScore(full, p.x, p.y)), threshold: 0,
    labels: ['boş / free', 'engel / obstacle'], pos: B('engel', 'obstacle'), neg: B('boş', 'free'), prefix: 'test_', title: B('test', 'test'),
  })
  const trAcc = h.train_acc.at(-1)!
  return {
    kind: 'siniflandirma', model: 'Gauss naive Bayes (2 özellik)', seed: 21, hyper: { train: X.length, test: T.length, prior_engel: full[1].prior },
    history: { x: 'n_train', cols: h },
    final: [
      { key: 'train_acc', label: B('eğitim doğruluğu', 'training accuracy'), value: trAcc, fmt: 'pct' },
      ...blk.final,
      { key: 'gap', label: B('eğitim − test farkı', 'train − test gap'), value: trAcc - h.test_acc.at(-1)!, fmt: 3 },
    ],
    confusion: blk.confusion,
    scores: blk.scores,
    charts: [
      ogrenmeEgrisi(h.n_train, h.train_acc, h.test_acc, B('doğruluk', 'accuracy'), { yMin: 0.5, yMax: 1 }),
      {
        kind: 'bar', id: 'params', title: B('Öğrenilen ortalamalar (± std)', 'Learned means (± std)'), labels: ['mesafe μ', 'mesafe σ', 'IR μ', 'IR σ'],
        series: [
          { key: 'free', label: B('boş yol', 'free path'), values: [full[0].m[0], Math.sqrt(full[0].v[0]), full[0].m[1], Math.sqrt(full[0].v[1])], tone: 1 },
          { key: 'obstacle', label: B('engel', 'obstacle'), values: [full[1].m[0], Math.sqrt(full[1].v[0]), full[1].m[1], Math.sqrt(full[1].v[1])], tone: 0 },
        ],
      },
      ...blk.charts,
    ],
  }
}

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
    ['D = np.genfromtxt(\'engel-sensoru.csv\', delimiter=\',\', names=True)', '120 eğitim, 30 test ölçümü', '120 training, 30 test readings'],
    ['A, e, tr = np.c_[D[\'mesafe\'], D[\'ir\']], D[\'engel\'].astype(int), D[\'grup\'] == 0', '[mesafe cm, IR], 1 = engel', '[distance cm, IR], 1 = obstacle'],
    ['X, y, Q = A[tr], e[tr], A[~tr]'],
    ['def fit(X, y):'],
    ['    return [(X[y == c].mean(0), X[y == c].var(0), (y == c).mean()) for c in (0, 1)]', 'ortalama, varyans, önsel', 'mean, variance, prior'],
    ['def logp(x, m, v, prior):'],
    ['    return np.log(prior) - 0.5 * (np.log(2 * np.pi * v) + (x - m) ** 2 / v).sum()', 'bağımsız: log olasılıklar toplanır', 'independent: log probabilities add'],
    ['model = fit(X, y)'],
    ['for x in Q:'],
    ['    s = [logp(x, *model[c]) for c in (0, 1)]', 'iki sınıfın puanı', 'score of both classes'],
    ['    print(int(np.argmax(s)))', 'büyük olan kazanır', 'the larger wins'],
    ['y_test = e[~tr]'],
    ['def score(M, P):', 'log olasılık oranı: sıfırın üstü engel', 'log-likelihood ratio: above zero is an obstacle'],
    ['    return np.array([logp(x, *M[1]) - logp(x, *M[0]) for x in P])'],
    ['history = {\'n_train\': [], \'train_acc\': [], \'test_acc\': []}', 'öğrenme eğrisi', 'learning curve'],
    ['for m in range(1, 13):'],
    ['    sub = np.arange(len(X)) % 12 < m', 'her 12 ölçümden ilk m tanesi', 'the first m of every 12 readings'],
    ['    M = fit(X[sub], y[sub])'],
    ['    for k, v in zip(history, (sub.sum(), ((score(M, X[sub]) > 0) == y[sub]).mean(), ((score(M, Q) > 0) == y_test).mean())): history[k].append(float(v))'],
    ['s_test = score(model, Q); flag = s_test > 0'],
    ['tp, fp, fn = np.sum(flag & (y_test == 1)), np.sum(flag & (y_test == 0)), np.sum(~flag & (y_test == 1))'],
    ['r = s_test.argsort().argsort() + 1; P1 = y_test.sum()', 'sıralamaya göre ROC AUC', 'rank-based ROC AUC'],
    ['auc = (r[y_test == 1].sum() - P1 * (P1 + 1) / 2) / (P1 * (len(y_test) - P1))'],
    ['for k, v in [(\'test_acc\', history[\'test_acc\'][-1]), (\'precision\', tp / max(tp + fp, 1)), (\'recall\', tp / max(tp + fn, 1)), (\'auc\', auc)]:', 'son ölçümler tablosu', 'final metrics table'],
    ['    print(f\'{k:<10}{v:>10.4f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir eğitim büyüklüğü', 'one row per training size'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    for k in (\'train_acc\', \'test_acc\'): plt.plot(history[\'n_train\'], history[k], marker=\'o\', label=k)'],
    ['    plt.xlabel(\'n_train\'); plt.ylabel(\'accuracy\'); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [],
  report: naiveBayesReport,
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
// Veri CSV'den açılınca 1. satırdan sonra 2 satır eklendi: vurgulanan satırlar kayar.
NAIVE_BAYES.run = shifted(NAIVE_BAYES.run, 1, 2)

// Ders 3: k en yakın komşu. Renk sensörü her nesne için iki sayı verir: ton ve parlaklık. 90 etiketli ölçüm (0 kırmızı top, 1 mavi
// silindir, 2 sarı küp); yeni bir ölçüm, en yakın k ölçümün oyuyla sınıflanır. Sonunda 45 saklı test ölçümünde doğruluk.
import { cap, d2, gauss, rng, type Frame, type Lesson, type Pt, shifted } from './core'
import { B, ogrenmeEgrisi, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'
import { accuracy } from './egitim/metrics'

export interface KnnFrame extends Frame {
  X: Pt[]
  k: number
  q?: { x: number; y: number }
  near?: number[]
  votes?: number[]
  pred?: number
  /** Önceki sorguların sonuçları. */
  done: Array<{ x: number; y: number; pred: number }>
  regions?: boolean
  test?: Array<Pt & { pred: number }>
  acc?: number
}

export function colorData(seed = 5, n = 30) {
  const r = rng(seed)
  const C = [{ x: 32, y: 58 }, { x: 52, y: 72 }, { x: 64, y: 44 }]
  const S = [{ x: 7, y: 8 }, { x: 7, y: 7 }, { x: 8, y: 9 }]
  const pts: Pt[] = []
  for (let c = 0; c < 3; c++) for (let i = 0; i < n; i++) pts.push({ x: C[c].x + S[c].x * gauss(r), y: C[c].y + S[c].y * gauss(r), c })
  return pts
}

export function knnPredict(X: Pt[], x: number, y: number, k: number) {
  const order = X.map((p, i) => [d2(p.x, p.y, x, y), i] as const).sort((a, b) => a[0] - b[0]).slice(0, k).map(([, i]) => i)
  const votes = [0, 0, 0]
  order.forEach((i) => votes[X[i].c]++)
  // eşitlikte en küçük sınıf numarası (NumPy argmax gibi)
  const pred = votes.indexOf(Math.max(...votes))
  return { near: order, votes, pred }
}

/**
 * Eğitim raporu: dersin 90 eğitim / 45 test ölçümüyle k = 1…25 (tek sayılar) için eğitim ve test doğruluğu, seçilen k'de
 * karışıklık matrisi ve sınıf başına ölçüler, eğitim kümesi büyüdükçe doğruluk (öğrenme eğrisi). Eğitim doğruluğunda nokta kendi
 * komşusudur (k = 1'de hep %100): ezberleme budur.
 */
export function knnReport({ k = 5 }: Record<string, number>): EgitimRaporu {
  const X = colorData(), T = colorData(99, 15)
  const yT = T.map((p) => p.c), yX = X.map((p) => p.c)
  const pred = (S: Pt[], P: Pt[], kk: number) => P.map((p) => knnPredict(S, p.x, p.y, kk).pred)
  const ks: number[] = [], tr: number[] = [], te: number[] = []
  for (let kk = 1; kk <= 25; kk += 2) { ks.push(kk); tr.push(accuracy(yX, pred(X, X, kk))); te.push(accuracy(yT, pred(X, T, kk))) }
  // öğrenme eğrisi: her 9 ölçümden ilk m tanesi (sınıflar dengeli kalır)
  const sizes: number[] = [], lcTr: number[] = [], lcTe: number[] = []
  for (let m = 1; m <= 9; m++) {
    const S = X.filter((_, i) => i % 9 < m)
    const kk = Math.min(k, S.length)
    sizes.push(S.length); lcTr.push(accuracy(S.map((p) => p.c), pred(S, S, kk))); lcTe.push(accuracy(yT, pred(S, T, kk)))
  }
  const NAMES = ['kırmızı top / red ball', 'mavi silindir / blue cylinder', 'sarı küp / yellow cube']
  const pk = pred(X, T, k)
  const blk = siniflandirmaBlok({ y: yT, pred: pk, labels: NAMES, prefix: 'test_', title: B(`test, k = ${k}`, `test, k = ${k}`) })
  const trAcc = accuracy(yX, pred(X, X, k))
  const r: EgitimRaporu = {
    kind: 'siniflandirma', model: `k-NN (k = ${k}, öklid uzaklığı)`, seed: 5, hyper: { k, train: X.length, test: T.length },
    history: { x: 'k', cols: { k: ks, train_acc: tr, test_acc: te } },
    final: [
      { key: 'train_acc', label: B('eğitim doğruluğu', 'training accuracy'), value: trAcc, fmt: 'pct' },
      ...blk.final,
      { key: 'gap', label: B('eğitim − test farkı', 'train − test gap'), value: trAcc - blk.final[0].value, fmt: 3 },
    ],
    confusion: blk.confusion,
    charts: [
      { kind: 'line', id: 'acc-k', title: B('Doğruluk ve k', 'Accuracy vs k'), x: ks, xLabel: B('komşu sayısı k', 'neighbours k'), yLabel: B('doğruluk', 'accuracy'), yMin: 0.5, yMax: 1,
        marker: { x: k, label: B(`seçilen k = ${k}`, `chosen k = ${k}`) },
        series: [{ key: 'train_acc', label: B('eğitim', 'train'), values: tr, tone: 1 }, { key: 'test_acc', label: B('test', 'test'), values: te, tone: 0, dash: true }],
        note: B('Küçük k eğitimi ezberler (k = 1: %100); büyük k sınırları fazla yumuşatır.', 'Small k memorises the training set (k = 1: 100%); large k smooths the borders too much.') },
      ogrenmeEgrisi(sizes, lcTr, lcTe, B('doğruluk', 'accuracy'), { yMin: 0, yMax: 1 }),
      ...blk.charts,
    ],
  }
  return r
}

/** Sınıf sınırlarına yakın, öğretici sorgu noktaları. */
const QUERIES = [{ x: 30, y: 60 }, { x: 44, y: 66 }, { x: 58, y: 56 }, { x: 47, y: 52 }, { x: 70, y: 66 }]

export const KNN: Lesson<KnnFrame> = {
  slug: 'k-en-yakin-komsu',
  n: 3,
  title: { tr: 'k en yakın komşu (k-NN)', en: 'k nearest neighbours (k-NN)' },
  sub: { tr: 'Renk sensörüyle nesne tanımak: yeni ölçüm, komşularına bakar', en: 'Recognising objects with a colour sensor: a new reading looks at its neighbours' },
  story: {
    tr: 'Robot kolun ucundaki renk sensörü her nesne için iki sayı ölçer: ton ve parlaklık. Elimizde 90 etiketli ölçüm var: kırmızı top, mavi silindir, sarı küp. Kol yeni bir nesneyi kavradığında hangisi olduğunu söylemeli.',
    en: 'The colour sensor at the tip of the robot arm measures two numbers for each object: hue and brightness. We have 90 labelled readings: red ball, blue cylinder, yellow cube. When the arm grabs a new object it has to say which one it is.',
  },
  how: [
    { tr: 'Yeni ölçümün eğitim verisindeki her ölçüme uzaklığı hesaplanır.', en: 'The distance from the new reading to every training reading is computed.' },
    { tr: 'En yakın k ölçüm seçilir ve her biri kendi sınıfına bir oy verir.', en: 'The k nearest readings are picked and each votes for its own class.' },
    { tr: 'En çok oy alan sınıf tahmindir. Eğitim yoktur: model, verinin kendisidir.', en: 'The class with the most votes is the prediction. There is no training: the model is the data itself.' },
    { tr: "k = 1 her gürültülü noktaya uyar ve sınırlar parçalanır; k büyüdükçe sınırlar yumuşar. k'yi değiştir, sınırları ve test doğruluğunu izle.", en: 'k = 1 follows every noisy point and the borders break up; larger k smooths them. Change k and watch the borders and the test accuracy.' },
  ],
  why: {
    tr: 'En basit sınıflandırıcıdır ama çoğu zaman şaşırtıcı derecede iyidir; yeni bir yöntemin karşılaştırıldığı ilk çizgidir. Aynı fikir, yapay zekâ uygulamalarındaki vektör aramanın temelidir: bir sorunun cevabını bulmak için anlamca en yakın metinler aranır.',
    en: 'It is the simplest classifier and often surprisingly good; it is the first baseline a new method is compared with. The same idea is at the heart of vector search in AI applications: to answer a question, the texts closest in meaning are retrieved.',
  },
  file: 'knn.py',
  code: [
    ['import numpy as np'],
    ['D = np.genfromtxt(\'renk-sensoru.csv\', delimiter=\',\', names=True)', '90 etiketli, 45 test ölçümü', '90 labelled, 45 test readings'],
    ['A, s, tr = np.c_[D[\'ton\'], D[\'parlaklik\']], D[\'sinif\'].astype(int), D[\'grup\'] == 0', '[ton, parlaklık], sınıf', '[hue, brightness], class'],
    ['X, y, T, y_test = A[tr], s[tr], A[~tr], s[~tr]'],
    ['Q = T[:5]', 'ilk beş yeni ölçüm', 'the first five new readings'],
    ['k = 5', 'komşu sayısı', 'number of neighbours'],
    ['for q in Q:'],
    ['    d = ((X - q) ** 2).sum(1)', 'her ölçüme uzaklık²', 'squared distance to every reading'],
    ['    near = d.argsort()[:k]', 'en yakın k ölçüm', 'the k nearest readings'],
    ['    votes = np.bincount(y[near], minlength=3)', 'sınıf oyları', 'class votes'],
    ['    print(votes.argmax())', 'en çok oy alan', 'most votes wins'],
    ['pred = [np.bincount(y[((X - t) ** 2).sum(1).argsort()[:k]], minlength=3).argmax() for t in T]'],
    ['print((np.array(pred) == y_test).mean())', 'test doğruluğu', 'test accuracy'],
    ['def knn(P, k):', 'her nokta için k-NN tahmini', 'k-NN prediction for every point'],
    ['    return np.array([np.bincount(y[((X - t) ** 2).sum(1).argsort()[:k]], minlength=3).argmax() for t in P])'],
    ['history = {\'k\': [], \'train_acc\': [], \'test_acc\': []}', 'k\'ye göre doğruluk', 'accuracy by k'],
    ['for kk in range(1, 26, 2):'],
    ['    for key, v in zip(history, (kk, (knn(X, kk) == y).mean(), (knn(T, kk) == y_test).mean())): history[key].append(float(v))'],
    ['cm = np.zeros((3, 3), int); np.add.at(cm, (y_test, np.array(pred)), 1)', 'karışıklık matrisi: satır gerçek, sütun tahmin', 'confusion matrix: row actual, column predicted'],
    ['print(cm)'],
    ['for c in range(3):', 'sınıf başına kesinlik, duyarlılık, F1', 'per-class precision, recall, F1'],
    ['    P, R = cm[c, c] / max(cm[:, c].sum(), 1), cm[c, c] / max(cm[c].sum(), 1)'],
    ['    print(f\'sınıf {c}: P={P:.3f} R={R:.3f} F1={2 * P * R / max(P + R, 1e-12):.3f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir k', 'one row per k'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    for key in (\'train_acc\', \'test_acc\'): plt.plot(history[\'k\'], history[key], marker=\'o\', label=key)'],
    ['    plt.xlabel(\'k\'); plt.ylabel(\'accuracy\'); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [{ key: 'k', label: { tr: 'Komşu sayısı k', en: 'Neighbours k' }, min: 1, max: 25, step: 2, value: 5 }],
  report: knnReport,
  run({ k = 5 }) {
    const X = colorData()
    const T = colorData(99, 15)
    const F: KnnFrame[] = []
    const done: KnnFrame['done'] = []
    const stat = cap(`90 ölçüm · k = ${k}`, `90 readings · k = ${k}`)
    const NAMES: Array<[string, string]> = [['kırmızı top', 'red ball'], ['mavi silindir', 'blue cylinder'], ['sarı küp', 'yellow cube']]
    F.push({ X, k, done: [], line: 1, cap: cap('etiketli ölçümler', 'labelled readings'), stat, hold: 1.8 })
    QUERIES.forEach((q, i) => {
      const r = knnPredict(X, q.x, q.y, k)
      const n = i + 1
      const first = i < 2
      F.push({ X, k, q, done: [...done], line: 4, cap: cap(`yeni ölçüm ${n} · uzaklıklar`, `new reading ${n} · distances`), stat, hold: first ? 1.2 : 0.6 })
      F.push({ X, k, q, near: r.near, done: [...done], line: 5, cap: cap(`yeni ölçüm ${n} · en yakın ${k}`, `new reading ${n} · nearest ${k}`), stat, hold: first ? 1.4 : 0.8 })
      F.push({ X, k, q, near: r.near, votes: r.votes, done: [...done], line: 6, cap: cap(`oylar: ${r.votes.join(' · ')}`, `votes: ${r.votes.join(' · ')}`), stat, hold: first ? 1.4 : 0.8 })
      F.push({ X, k, q, near: r.near, votes: r.votes, pred: r.pred, done: [...done], line: 7, cap: cap(`tahmin: ${NAMES[r.pred][0]}`, `prediction: ${NAMES[r.pred][1]}`), stat, hold: first ? 1.4 : 0.9 })
      done.push({ ...q, pred: r.pred })
    })
    F.push({ X, k, done: [...done], regions: true, line: 8, cap: cap('her nokta için karar: sınırlar', 'decision for every spot: the borders'), stat, hold: 2 })
    const test = T.map((p) => ({ ...p, pred: knnPredict(X, p.x, p.y, k).pred }))
    const acc = test.filter((p) => p.pred === p.c).length / test.length
    F.push({ X, k, done: [...done], regions: true, test, acc, line: 9, cap: cap(`test doğruluğu %${Math.round(acc * 100)}`, `test accuracy ${Math.round(acc * 100)}%`), stat: cap(`45 saklı ölçüm · ${test.filter((p) => p.pred !== p.c).length} hata`, `45 hidden readings · ${test.filter((p) => p.pred !== p.c).length} errors`), hold: 3 })
    return F
  },
}
// Veri CSV'den açılınca 1. satırdan sonra 3 satır eklendi: vurgulanan satırlar kayar.
KNN.run = shifted(KNN.run, 1, 3)

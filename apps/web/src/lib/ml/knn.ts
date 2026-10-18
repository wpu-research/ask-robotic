// Ders 3: k en yakın komşu. Renk sensörü her nesne için iki sayı verir: ton ve parlaklık. 90 etiketli ölçüm (0 kırmızı top, 1 mavi
// silindir, 2 sarı küp); yeni bir ölçüm, en yakın k ölçümün oyuyla sınıflanır. Sonunda 45 saklı test ölçümünde doğruluk.
import { cap, d2, gauss, rng, type Frame, type Lesson, type Pt, shifted } from './core'

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
  ],
  params: [{ key: 'k', label: { tr: 'Komşu sayısı k', en: 'Neighbours k' }, min: 1, max: 25, step: 2, value: 5 }],
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

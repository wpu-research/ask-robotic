// Ders: rastgele orman. Motor titreşimi (mm/s) ve sıcaklığından (°C) arıza tahmini; sınır eğri, etiketlerin %12'si hatalı.
// Her ağaç kendi bootstrap torbasında, her düğümde rastgele seçilen tek özellikle büyür; orman çoğunluk oyuyla karar verir.
import { cap, fmt, rng, type Frame, type Lesson, type Pt } from './core'

/** Düz dizide düğüm: f = −1 ise yaprak. p: düğümdeki arıza oranı (yaprağın cevabı p > 0,5). */
export interface RfNode { f: number; t: number; L: number; R: number; p: number; d: number }
export type RfTree = RfNode[]

export interface RfFrame extends Frame {
  /** 200 eğitim ölçümü (x titreşim, y sıcaklık, c 1 arıza). Paylaşılan referans. */
  X: Pt[]
  /** Bütün ağaçlar (paylaşılan); oylamaya ilk k tanesi katılır. */
  trees: RfTree[]
  k: number
  /** Şu an kurulan ağaç (0'dan) ve büyük panelde gösterilen kısmi derinlik. */
  cur?: number
  depth?: number
  /** Kurulan ağacın torbasında her ölçümün kaç kez çekildiği. */
  boot?: number[]
  /** Test doğruluğu: acc[k − 1] = ilk k ağacın ormanı (paylaşılan, tamamı). */
  acc: number[]
  /** Son kare: test doğruluğunu yazdır. */
  done?: boolean
}

export const MAX_DEPTH = 6

/** Arıza: (titreşim/9)² + ((sıcaklık − 20)/60)² > 1, sonra etiketlerin %12'si ters (bakım kaydı hataları). */
export function motorData(r: () => number, n: number): Pt[] {
  const X: Pt[] = []
  for (let i = 0; i < n; i++) {
    const v = 12 * r(), T = 20 + 70 * r()
    const fail = (v / 9) ** 2 + ((T - 20) / 60) ** 2 > 1
    const flip = r() < 0.12
    X.push({ x: v, y: T, c: fail !== flip ? 1 : 0 })
  }
  return X
}

const kir = (n: number, s: number) => (n ? s - (s * s) / n : 0) // n·p·(1 − p)

/** Bir ağaç: idx (tekrarlı) eğitim indeksleri; her düğümde rastgele bir özellik ve o özellikte en iyi eşik. */
export function growTree(X: Pt[], idx: number[], depth: number, r: () => number): RfTree {
  const nodes: RfTree = []
  const val = (i: number, f: number) => (f ? X[i].y : X[i].x)
  const build = (ids: number[], d: number, level: number): number => {
    const me = nodes.length
    const s = ids.reduce((a, i) => a + X[i].c, 0)
    nodes.push({ f: -1, t: 0, L: -1, R: -1, p: s / ids.length, d: level })
    const f = Math.floor(r() * 2)
    const sorted = [...ids].sort((a, b) => val(a, f) - val(b, f))
    let best = Infinity, bt = NaN
    let nl = 0, sl = 0
    for (let k = 0; k < sorted.length - 1; k++) {
      nl++; sl += X[sorted[k]].c
      const t = val(sorted[k], f)
      if (val(sorted[k + 1], f) === t) continue // aynı değerler ayrılmaz
      const g = kir(nl, sl) + kir(ids.length - nl, s - sl)
      if (g < best) { best = g; bt = t }
    }
    if (d === 0 || s === 0 || s === ids.length || !Number.isFinite(best)) return me
    const Li = ids.filter((i) => val(i, f) <= bt), Ri = ids.filter((i) => val(i, f) > bt)
    nodes[me].f = f; nodes[me].t = bt
    nodes[me].L = build(Li, d - 1, level + 1)
    nodes[me].R = build(Ri, d - 1, level + 1)
    return me
  }
  build(idx, depth, 0)
  return nodes
}

/** Ağacın arıza oranı; maxD verilirse o derinlikte durur (büyürken gösterim). */
export function treeP(t: RfTree, x: number, y: number, maxD = 99): number {
  let n = t[0]
  while (n.f >= 0 && n.d < maxD) n = t[(n.f ? y : x) <= n.t ? n.L : n.R]
  return n.p
}
/** İlk k ağacın oy oranı (arıza diyenlerin payı). Karar: oran > 0,5 (eşitlikte sağlam). */
export const forestVote = (trees: RfTree[], k: number, x: number, y: number): number => {
  let v = 0
  for (let j = 0; j < k; j++) if (treeP(trees[j], x, y) > 0.5) v++
  return v / k
}

export function buildForest(nTrees: number) {
  const r = rng(5)
  const X = motorData(r, 200), T = motorData(r, 1000)
  const tr = rng(55)
  const boots: number[][] = [], trees: RfTree[] = []
  for (let j = 0; j < nTrees; j++) {
    const idx = Array.from({ length: X.length }, () => Math.floor(tr() * X.length))
    boots.push(idx)
    trees.push(growTree(X, idx, MAX_DEPTH, tr))
  }
  // test doğruluğu, ağaç ağaç
  const votes = new Array<number>(T.length).fill(0)
  const acc: number[] = []
  for (let j = 0; j < nTrees; j++) {
    let ok = 0
    T.forEach((q, i) => { if (treeP(trees[j], q.x, q.y) > 0.5) votes[i]++; if ((votes[i] / (j + 1) > 0.5 ? 1 : 0) === q.c) ok++ })
    acc.push(ok / T.length)
  }
  return { X, T, boots, trees, acc }
}

const pct = (a: number, lang: 'tr' | 'en') => (lang === 'tr' ? `%${fmt(a * 100, 1, 'tr')}` : `${(a * 100).toFixed(1)}%`)
const FEAT: Array<[string, string]> = [['titreşim', 'vibration'], ['sıcaklık', 'temperature']]

export const RASTGELE_ORMAN: Lesson<RfFrame> = {
  slug: 'rastgele-orman',
  n: 0,
  title: { tr: 'Rastgele orman', en: 'Random forest' },
  sub: { tr: 'Birbirinden biraz farklı yirmi beş ağacın oylaması', en: 'Twenty-five slightly different trees take a vote' },
  story: {
    tr: 'Bir fabrikadaki konveyör motorlarından 1200 kayıt topladık: titreşim sensörünün RMS değeri (0–12 mm/s), sargı sıcaklığı (20–90 °C) ve bakım ekibinin notu: arızalandı mı? Titreşim ya da sıcaklık yükseldikçe arıza riski eğri bir sınırla artıyor; üstelik kayıtların yaklaşık %12’si yanlış girilmiş. 200 kayıtla öğreniyor, 1000 kayıtla sınıyoruz.',
    en: 'We collected 1200 records from conveyor motors in a factory: the RMS value of a vibration sensor (0–12 mm/s), the winding temperature (20–90 °C) and the maintenance note: did it fail? As vibration or temperature rises, the risk of failure grows along a curved border, and about 12% of the records were entered wrongly. We learn from 200 records and test on 1000.',
  },
  how: [
    { tr: 'Torba (bootstrap): 200 kayıttan, geri koyarak, 200 çekiliş yapılır. Bazı kayıtlar iki üç kez gelir, üçte biri hiç gelmez. Her ağaç kendi torbasını görür.', en: 'Bagging (bootstrap): 200 draws with replacement from the 200 records. Some records come two or three times, about a third never. Every tree sees its own bag.' },
    { tr: 'Her düğümde iki özellikten biri rastgele seçilir; ağaç yalnız o özellikte en iyi eşiği arar. Böylece ağaçlar birbirine benzemez.', en: 'At every node one of the two features is picked at random; the tree searches only that feature for the best threshold. This keeps the trees different from each other.' },
    { tr: 'Tek bir derin ağaç yanlış etiketleri de ezberler: sınırı tırtıklı ve kararsızdır. Ama her ağaç farklı yerde yanılır.', en: 'A single deep tree also memorises the wrong labels: its border is jagged and unstable. But each tree is wrong in a different place.' },
    { tr: 'Orman çoğunluk oyuyla karar verir: hatalar birbirini götürür, sınır yumuşar.', en: 'The forest decides by majority vote: the errors cancel out and the border smooths.' },
    { tr: 'Şunu dene: ağaç sayısını 1 yap ve test doğruluğuna bak; sonra 5, sonra 25. Eğri önce hızla yükselir, sonra düzleşir.', en: 'Try this: set the number of trees to 1 and look at the test accuracy; then 5, then 25. The curve rises fast, then flattens.' },
  ],
  why: {
    tr: 'Rastgele orman, tablo verisinde ayar gerektirmeden iyi çalışan ilk yöntemlerdendir. Kestirimci bakımda (titreşim, akım, sıcaklık), arazi sınıflamada ve sensör füzyonunda yaygındır; Microsoft Kinect’in vücut parçası tanıması da rastgele ormanla yapılıyordu.',
    en: 'A random forest is one of the first methods that works well on tabular data with almost no tuning. It is common in predictive maintenance (vibration, current, temperature), terrain classification and sensor fusion; Microsoft Kinect’s body-part recognition was also done with a random forest.',
  },
  file: 'rastgele_orman.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(5)'],
    ['def veri(n):'],
    ['    X = rng.uniform([0, 20], [12, 90], (n, 2))', 'titreşim, sıcaklık', 'vibration, temperature'],
    ['    r = (X[:, 0] / 9) ** 2 + ((X[:, 1] - 20) / 60) ** 2', 'eğri sınır', 'curved border'],
    ['    return X, (r > 1) ^ (rng.random(n) < 0.12)', '%12 yanlış etiket', '12% wrong labels'],
    ['X, y = veri(200); Xt, yt = veri(1000)', 'eğitim, test', 'train, test'],
    ['kir = lambda y: y.sum() * (1 - y.mean())', 'n·p·(1 − p)', 'n·p·(1 − p)'],
    ['def agac(X, y, d):'],
    ['    f = rng.integers(2); ts = np.unique(X[:, f])[:-1]', 'rastgele özellik', 'random feature'],
    ['    if d == 0 or y.all() or not y.any() or not len(ts):'],
    ['        return y.mean()', 'yaprak: arıza oranı', 'leaf: failure rate'],
    ['    s = lambda t: kir(y[X[:, f] <= t]) + kir(y[X[:, f] > t])'],
    ['    t = min(ts, key=s); L = X[:, f] <= t; d -= 1', 'en iyi eşik', 'best threshold'],
    ['    return f, t, agac(X[L], y[L], d), agac(X[~L], y[~L], d)'],
    ['def oy(n, X):'],
    ['    if type(n) is not tuple: return np.full(len(X), n)'],
    ['    f, t, L, R = n'],
    ['    return np.where(X[:, f] <= t, oy(L, X), oy(R, X))'],
    ['B = rng.integers(0, 200, (25, 200))', '25 torba (bootstrap)', '25 bags (bootstrap)'],
    ['orman = [agac(X[i], y[i], 6) for i in B]', 'derinlik ≤ 6', 'depth ≤ 6'],
    ['P = np.array([oy(a, Xt) for a in orman]) > .5', 'her ağacın oyu', "each tree's vote"],
    ['for k in (1, 5, 25):'],
    ["    print(k, 'ağaç', ((P[:k].mean(0) > .5) == yt).mean())", 'çoğunluk oyu', 'majority vote'],
  ],
  params: [{ key: 'trees', label: { tr: 'Ağaç sayısı', en: 'Number of trees' }, min: 1, max: 25, step: 1, value: 25 }],
  run({ trees: N = 25 }) {
    const nT = Math.max(1, Math.min(25, Math.round(N)))
    const { X, boots, trees, acc } = buildForest(nT)
    const base = { X, trees, acc }
    const F: RfFrame[] = []
    const nFail = X.filter((q) => q.c).length
    const stat = cap(`200 eğitim · 1000 test · ${nT} ağaç`, `200 training · 1000 test · ${nT} trees`)
    F.push({ ...base, k: 0, line: 6, cap: cap(`200 kayıt: ${nFail} arıza, ${200 - nFail} sağlam`, `200 records: ${nFail} failed, ${200 - nFail} healthy`), stat, hold: 2 })
    F.push({ ...base, k: 0, line: 7, cap: cap('kirlilik: bir kutudaki karışıklık, n·p·(1 − p)', 'impurity: how mixed a box is, n·p·(1 − p)'), stat, hold: 1.2 })
    for (let j = 0; j < nT; j++) {
      const cnt = new Array<number>(X.length).fill(0)
      boots[j].forEach((i) => cnt[i]++)
      const out = cnt.filter((c) => c === 0).length
      F.push({
        ...base, k: j, cur: j, boot: cnt, line: 19,
        cap: cap(`ağaç ${j + 1} · torba: 200 çekiliş, ${200 - out} farklı kayıt`, `tree ${j + 1} · bag: 200 draws, ${200 - out} distinct records`),
        stat: cap(`${out} kayıt bu torbada yok`, `${out} records not in this bag`), hold: j === 0 ? 2 : j < 3 ? 1 : 0.35,
      })
      if (j === 0) {
        const t = trees[0]
        for (let d = 1; d <= MAX_DEPTH; d++) {
          const nLeaf = t.filter((n) => n.d === d || (n.d < d && n.f < 0)).length
          const rootF = FEAT[t[0].f] ?? FEAT[0]
          F.push({
            ...base, k: 0, cur: 0, depth: d, boot: cnt, line: d === 1 ? 9 : 13,
            cap: d === 1 ? cap(`kök: rastgele özellik ${rootF[0]}, eşik ${fmt(t[0].t, 1, 'tr')}`, `root: random feature ${rootF[1]}, threshold ${t[0].t.toFixed(1)}`)
              : cap(`ağaç 1 · derinlik ${d} · ${nLeaf} kutu`, `tree 1 · depth ${d} · ${nLeaf} boxes`),
            stat: cap('her düğüm kendi özelliğini rastgele seçer', 'each node picks its own feature at random'), hold: d <= 2 ? 1.5 : 0.8,
          })
        }
      }
      F.push({
        ...base, k: j + 1, cur: j, line: 20,
        cap: j === 0 ? cap(`tek ağaç · test doğruluğu ${pct(acc[0], 'tr')}`, `one tree · test accuracy ${pct(acc[0], 'en')}`)
          : cap(`${j + 1} ağaç oyluyor · test doğruluğu ${pct(acc[j], 'tr')}`, `${j + 1} trees voting · test accuracy ${pct(acc[j], 'en')}`),
        stat: cap(`${trees[j].filter((n) => n.f < 0).length} yaprak`, `${trees[j].filter((n) => n.f < 0).length} leaves`), hold: j === 0 ? 2 : j < 3 ? 1.2 : 0.5,
      })
    }
    F.push({ ...base, k: nT, line: 21, cap: cap(`${nT} ağaç 1000 test kaydı için oy veriyor`, `${nT} trees vote on 1000 test records`), stat, hold: 1.2 })
    F.push({
      ...base, k: nT, done: true, line: 23,
      cap: nT === 1 ? cap(`tek ağaç: test doğruluğu ${pct(acc[0], 'tr')}`, `one tree: test accuracy ${pct(acc[0], 'en')}`)
        : cap(`1 ağaç ${pct(acc[0], 'tr')} → ${nT} ağaç ${pct(acc[nT - 1], 'tr')}`, `1 tree ${pct(acc[0], 'en')} → ${nT} trees ${pct(acc[nT - 1], 'en')}`),
      stat: cap('test doğruluğu, 1000 saklı kayıt', 'test accuracy, 1000 hidden records'), hold: 3,
    })
    return F
  },
}

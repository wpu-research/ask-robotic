// Ders 5: karar ağacı. Çizgi izleyen robotun iki sensörü (sol, sağ; 0–1023) ve uzman sürücünün seçtiği eylem (sola, düz, sağa).
// Ağaç her düğümde Gini safsızlığını en çok azaltan tek eşiği seçer; bölmeler tuvalde eksenlere paralel çizgiler olarak görünür.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt } from './core'

export type Node = { leaf: true; c: number; n: number } | { leaf: false; f: 0 | 1; t: number; g: number; L: Node; R: Node; n: number }
export interface Box { x0: number; x1: number; y0: number; y1: number }
export interface TreeFrame extends Frame {
  X: Pt[]
  /** Şimdiye kadarki bölmeler ve kutular (çizim için). */
  splits: Array<{ f: 0 | 1; t: number; box: Box; depth: number }>
  /** Bölünmekte olan kutu. */
  active?: Box
  /** Yapraklar (renkli kutular). */
  leaves: Array<{ box: Box; c: number }>
  tree?: Node
  acc?: number
}

/**
 * Eylemler: 0 sola, 1 düz, 2 sağa. Çizgi koyudur, sensör koyu yüzeyde büyük değer okur: sol koyu ve sağ açıksa çizgi solda
 * (sola dön), tersiyse sağa; ikisi de aynıysa düz. Eşik çevresinde gürültü ve %6 yanlış etiket (uzman da bazen hata yapar).
 */
export function lineData(seed = 13, n = 160) {
  const r = rng(seed)
  const X: Pt[] = []
  for (let i = 0; i < n; i++) {
    const L = Math.round(60 + 900 * r()), R = Math.round(60 + 900 * r())
    const dl = L + 50 * gauss(r) > 560, dr = R + 50 * gauss(r) > 560
    let c = dl && !dr ? 0 : dr && !dl ? 2 : 1
    if (r() < 0.06) c = Math.floor(r() * 3)
    X.push({ x: L, y: R, c })
  }
  return X
}

export function gini(c: number[]): number {
  if (!c.length) return 0
  const k = [0, 0, 0]; c.forEach((x) => k[x]++)
  return 1 - k.reduce((s, x) => s + (x / c.length) ** 2, 0)
}
const majority = (c: number[]) => { const k = [0, 0, 0]; c.forEach((x) => k[x]++); return k.indexOf(Math.max(...k)) }

export function bestSplit(X: Pt[]): { g: number; f: 0 | 1 | null; t: number } {
  let best = { g: gini(X.map((p) => p.c)), f: null as 0 | 1 | null, t: 0 }
  for (const f of [0, 1] as const) {
    const vals = [...new Set(X.map((p) => (f ? p.y : p.x)))].sort((a, b) => a - b)
    for (const t of vals) {
      const L = X.filter((p) => (f ? p.y : p.x) <= t), R = X.filter((p) => (f ? p.y : p.x) > t)
      if (!L.length || !R.length) continue
      const g = (L.length * gini(L.map((p) => p.c)) + R.length * gini(R.map((p) => p.c))) / X.length
      if (g < best.g - 1e-12) best = { g, f, t }
    }
  }
  return best
}

export function grow(X: Pt[], depth: number, box: Box, log: (e: { kind: 'split' | 'leaf'; box: Box; f?: 0 | 1; t?: number; c?: number; d: number }) => void, d = 0): Node {
  const s = bestSplit(X)
  if (depth === 0 || s.f === null) { const c = majority(X.map((p) => p.c)); log({ kind: 'leaf', box, c, d }); return { leaf: true, c, n: X.length } }
  const f = s.f
  log({ kind: 'split', box, f, t: s.t, d })
  const lb = f ? { ...box, y1: s.t } : { ...box, x1: s.t }, rb = f ? { ...box, y0: s.t } : { ...box, x0: s.t }
  const Lp = X.filter((p) => (f ? p.y : p.x) <= s.t), Rp = X.filter((p) => (f ? p.y : p.x) > s.t)
  return { leaf: false, f, t: s.t, g: s.g, n: X.length, L: grow(Lp, depth - 1, lb, log, d + 1), R: grow(Rp, depth - 1, rb, log, d + 1) }
}
export function treePredict(n: Node, x: number, y: number): number {
  while (!n.leaf) n = (n.f ? y : x) <= n.t ? n.L : n.R
  return n.c
}

export const TREE: Lesson<TreeFrame> = {
  slug: 'karar-agaci',
  n: 5,
  title: { tr: 'Karar ağacı', en: 'Decision tree' },
  sub: { tr: 'Çizgi izleyen robotun kararını evet/hayır sorularına bölmek', en: "Breaking a line follower's decision into yes/no questions" },
  story: {
    tr: "Bir uzman, çizgi izleyen robotu elle sürerken 160 an kaydettik: sol ve sağ çizgi sensörünün okuması (0–1023) ve o an seçtiği eylem: sola, düz ya da sağa. Çizgi koyu; sensör koyu yüzeyde büyük değer okur. Robot aynı kararları kendisi versin istiyoruz, ama okunabilir kurallarla.",
    en: 'While an expert drove a line-following robot by hand, we recorded 160 moments: the left and right line-sensor readings (0–1023) and the action chosen: left, straight or right. The line is dark; a sensor reads a large value over a dark surface. We want the robot to make the same decisions itself, with readable rules.',
  },
  how: [
    { tr: 'Gini safsızlığı, bir kutudaki eylemlerin ne kadar karışık olduğunu ölçer: tek eylem varsa 0.', en: 'Gini impurity measures how mixed the actions in a box are: 0 if there is only one.' },
    { tr: 'Her düğümde iki sensörün de bütün eşikleri denenir; safsızlığı en çok azaltan tek soru seçilir ("sol ≤ 612 mi?").', en: 'At each node every threshold of both sensors is tried; the single question that lowers impurity the most is chosen ("left ≤ 612?").' },
    { tr: 'İki yarıya aynı işlem uygulanır, derinlik sınırına kadar. Yapraklar çoğunluk eylemini verir.', en: 'The same is done on both halves, down to the depth limit. Leaves give the majority action.' },
    { tr: 'Derinlik 1 kaba kalır; 2–3 kuralı bulur. Daha derinde yaprak sayısı artar ama test doğruluğu artmaz: fazladan yapraklar yanlış etiketleri ezberler. Derinliği değiştir, yaprakları ve test doğruluğunu izle.', en: 'Depth 1 is too crude; 2–3 find the rule. Deeper trees grow more leaves but test accuracy does not improve: the extra leaves memorise the wrong labels. Change the depth and watch the leaves and the test accuracy.' },
  ],
  why: {
    tr: 'Karar ağacının kuralları okunabilir ve doğrudan bir Arduino if-else zincirine çevrilebilir. Yüzlerce ağaç birleşince (rastgele orman, gradyan artırma) tablo verisinde bugün de en güçlü yöntemler arasındadır.',
    en: 'A decision tree’s rules are readable and translate directly into an if-else chain on an Arduino. Combined by the hundred (random forests, gradient boosting) they are still among the strongest methods for tabular data.',
  },
  file: 'karar_agaci.py',
  code: [
    ['import numpy as np'],
    ['from cizgi import X, y', '[sol, sağ], 0 sola 1 düz 2 sağa', '[left, right], 0 left 1 straight 2 right'],
    ['def gini(y): p = np.bincount(y, minlength=3) / len(y); return 1 - (p ** 2).sum()'],
    ['def best_split(X, y):'],
    ['    best = (gini(y), None, None)'],
    ['    for f in range(2):', 'her sensör', 'every sensor'],
    ['        for t in np.unique(X[:, f]):', 'her eşik', 'every threshold'],
    ['            L = X[:, f] <= t'],
    ['            g = (L.sum() * gini(y[L]) + (~L).sum() * gini(y[~L])) / len(y)', 'bölmeden sonraki safsızlık', 'impurity after the split'],
    ['            if 0 < L.sum() < len(y) and g < best[0]: best = (g, f, t)'],
    ['    return best'],
    ['def grow(X, y, depth):'],
    ['    g, f, t = best_split(X, y)'],
    ['    if depth == 0 or f is None: return np.bincount(y).argmax()', 'yaprak: çoğunluk', 'leaf: majority'],
    ['    L = X[:, f] <= t'],
    ['    return (f, t, grow(X[L], y[L], depth - 1), grow(X[~L], y[~L], depth - 1))'],
    ['tree = grow(X, y, depth=3)'],
  ],
  params: [{ key: 'depth', label: { tr: 'En büyük derinlik', en: 'Max depth' }, min: 1, max: 7, step: 1, value: 3 }],
  run({ depth = 3 }) {
    const X = lineData(), T = lineData(57, 80)
    const root: Box = { x0: 0, x1: 1023, y0: 0, y1: 1023 }
    const F: TreeFrame[] = []
    const splits: TreeFrame['splits'] = [], leaves: TreeFrame['leaves'] = []
    const NAMES: Array<[string, string]> = [['sola', 'left'], ['düz', 'straight'], ['sağa', 'right']]
    const stat = cap(`160 an · derinlik ≤ ${depth}`, `160 moments · depth ≤ ${depth}`)
    F.push({ X, splits: [], leaves: [], line: 1, cap: cap(`başlangıç: Gini ${fmt(gini(X.map((p) => p.c)), 3, 'tr')}`, `start: Gini ${gini(X.map((p) => p.c)).toFixed(3)}`), stat, hold: 1.8 })
    const tree = grow(X, depth, root, (e) => {
      if (e.kind === 'split') {
        F.push({ X, splits: [...splits], leaves: [...leaves], active: e.box, line: 8, cap: cap(`düzey ${e.d + 1} · eşikler deneniyor`, `level ${e.d + 1} · trying thresholds`), stat, hold: e.d < 2 ? 1 : 0.5 })
        splits.push({ f: e.f!, t: e.t!, box: e.box, depth: e.d })
        F.push({ X, splits: [...splits], leaves: [...leaves], active: e.box, line: 12, cap: cap(`${e.f ? 'sağ' : 'sol'} ≤ ${e.t} ?`, `${e.f ? 'right' : 'left'} ≤ ${e.t} ?`), stat, hold: e.d < 2 ? 1.4 : 0.6 })
      } else {
        leaves.push({ box: e.box, c: e.c! })
        F.push({ X, splits: [...splits], leaves: [...leaves], line: 13, cap: cap(`yaprak: ${NAMES[e.c!][0]}`, `leaf: ${NAMES[e.c!][1]}`), stat, hold: 0.5 })
      }
    })
    const acc = T.filter((p) => treePredict(tree, p.x, p.y) === p.c).length / T.length
    F.push({ X, splits: [...splits], leaves: [...leaves], tree, acc, line: 16, cap: cap(`${leaves.length} yaprak · test doğruluğu %${Math.round(acc * 100)}`, `${leaves.length} leaves · test accuracy ${Math.round(acc * 100)}%`), stat: cap('80 saklı an', '80 hidden moments'), hold: 3 })
    return F
  },
}

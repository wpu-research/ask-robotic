// Ders 5: karar ağacı. Çizgi izleyen robotun iki sensörü (sol, sağ; 0–1023) ve uzman sürücünün seçtiği eylem (sola, düz, sağa).
// Ağaç her düğümde Gini safsızlığını en çok azaltan tek eşiği seçer; bölmeler tuvalde eksenlere paralel çizgiler olarak görünür.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt, shifted } from './core'

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
  /** Eğitim verisindeki doğruluk (son kare). */
  trainAcc?: number
  /** Ağacın okunabilir kuralları (if-else), [Türkçe, İngilizce]; ağaç çok büyükse yok. */
  rules?: Array<[string, string]>
  /** Veri kümesi: 0 çizgi izleyen robot (3 eylem), 1 banka kredisi (gelir, kaçırılan ödeme → ödedi mi). */
  ds?: number
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

/**
 * Simüle banka: müşterinin aylık geliri (1.000–6.000, 10'a yuvarlı), kaçırdığı ödeme sayısı (0–5) ve krediyi ödeyip ödemediği
 * (1 ödedi, 0 ödemedi). Gerçek kural: gelir > 3.000 ve kaçan ≤ 1 ise ya da gelir > 5.000 ise öder; %12 sürpriz (ters etiket).
 * İlk 400 müşteri eğitim, son 100 test.
 */
export function creditData(seed = 14, n = 500): Pt[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const inc = Math.round((1000 + 5000 * r()) / 10) * 10, miss = Math.floor(r() * 6)
    let y = (inc > 3000 && miss <= 1) || inc > 5000
    if (r() < 0.12) y = !y
    return { x: inc, y: miss, c: y ? 1 : 0 }
  })
}
/** Kural metinleri için veri kümesi başına özellik ve sınıf adları [Türkçe, İngilizce]. */
export const TREE_NAMES: Array<{ feat: Array<[string, string]>; cls: Array<[string, string]> }> = [
  { feat: [['sol', 'left'], ['sağ', 'right']], cls: [['sola', 'left'], ['düz', 'straight'], ['sağa', 'right']] },
  { feat: [['gelir', 'income'], ['kaçan', 'missed']], cls: [['ödemedi', 'defaults'], ['öder', 'repays']] },
]

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
export const leafCount = (n: Node): number => (n.leaf ? 1 : leafCount(n.L) + leafCount(n.R))

/** İki çocuğu aynı eylemi veren düğümü yaprağa indirger (kural listesi kısalsın, kararlar değişmez). */
function collapse(n: Node): Node {
  if (n.leaf) return n
  const L = collapse(n.L), R = collapse(n.R)
  if (L.leaf && R.leaf && L.c === R.c) return { leaf: true, c: L.c, n: n.n }
  return { ...n, L, R }
}
/** Ağacı Arduino'ya aktarılabilecek if-else satırlarına çevirir. Yaprak çocuklar aynı satıra yazılır. */
export function treeRules(root: Node, ds = 0): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const { feat, cls: ACT } = TREE_NAMES[ds]
  const cond = (n: Extract<Node, { leaf: false }>): [string, string] => [`${feat[n.f][0]} <= ${n.t}`, `${feat[n.f][1]} <= ${n.t}`]
  const walk = (n: Node, ind: string) => {
    if (n.leaf) { out.push([`${ind}${ACT[n.c][0]}`, `${ind}${ACT[n.c][1]}`]); return }
    const [ct, ce] = cond(n)
    if (n.L.leaf) out.push([`${ind}if (${ct}) ${ACT[n.L.c][0]}`, `${ind}if (${ce}) ${ACT[n.L.c][1]}`])
    else { out.push([`${ind}if (${ct})`, `${ind}if (${ce})`]); walk(n.L, ind + '  ') }
    if (n.R.leaf) out.push([`${ind}else ${ACT[n.R.c][0]}`, `${ind}else ${ACT[n.R.c][1]}`])
    else { out.push([`${ind}else`, `${ind}else`]); walk(n.R, ind + '  ') }
  }
  walk(collapse(root), '')
  return out
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
    { tr: 'Derinlik 1 kaba kalır; 2–3 kuralı bulur ve son karede kurallar Arduino’ya aktarılacak if-else satırları olarak yazılır.', en: 'Depth 1 is too crude; 2–3 find the rule, and the last frame writes the rules as if-else lines ready for an Arduino.' },
    { tr: 'İkinci veri kümesi bir banka: 500 müşterinin aylık geliri, kaçırdığı ödeme sayısı ve krediyi ödeyip ödemediği (400’ü eğitim, 100’ü yeni müşteri). Arkadaki kural “gelir 3.000’in üstünde ve en fazla 1 kaçan ödeme, ya da gelir 5.000’in üstünde”; müşterilerin %12’si sürpriz yapar. Veriyi 1 yap: derinlik 3’te ağaç kuralı neredeyse aynen bulur ve her reddi tek satırla açıklar.', en: 'The second dataset is a bank: 500 customers’ monthly income, number of missed payments and whether they repaid the loan (400 for training, 100 new customers). The rule behind it is “income above 3,000 and at most 1 missed payment, or income above 5,000”; 12% of customers surprise us. Set the data to 1: at depth 3 the tree finds the rule almost exactly and explains every refusal in one line.' },
    { tr: 'Şunu dene: derinliği 3’ten 10’a çıkar. Eğitim verisinde doğruluk %100’e çıkar, saklı veride ise derinlik 4’ten sonra hiç kıpırdamaz: fazladan yapraklar yalnızca uzmanın yanlış etiketlerini ezberler. Aradaki fark ezberin ölçüsüdür (aşırı öğrenme dersindeki durumun aynısı) ve 21 yapraklı ağacın kuralları artık okunamaz.', en: 'Try this: raise the depth from 3 to 10. Accuracy on the training data reaches 100%, while on hidden data it does not move at all after depth 4: the extra leaves only memorise the expert’s wrong labels. The gap is the measure of memorising (the overfitting lesson again), and a tree with 21 leaves has rules nobody can read.' },
    { tr: 'Aynısını kredi verisinde dene: derinliği 3’ten 10’a çıkar. Eski müşterilerde doğruluk %89’dan %95’e çıkar, yeni müşterilerde %85’ten %77’ye düşer ve yaprak sayısı 8’den 60’a fırlar. Ağaç sürprizleri kural sanıp ezberlemiştir.', en: 'Try the same on the loan data: raise the depth from 3 to 10. Accuracy on old customers rises from 89% to 95%, on new customers it falls from 85% to 77%, and the number of leaves jumps from 8 to 60. The tree has memorised the surprises as if they were rules.' },
  ],
  why: {
    tr: 'Karar ağacının kuralları okunabilir ve doğrudan bir Arduino if-else zincirine çevrilebilir. Kararın gerekçesinin gösterilmesi gereken her yerde bu yüzden tercih edilir: bir banka krediyi neden reddettiğini (“gelir ≤ 3.000 ve kaçırılan ödeme > 1”) müşteriye açıklayabilmelidir. Yüzlerce ağaç birleşince (rastgele orman, gradyan artırma) tablo verisinde bugün de en güçlü yöntemler arasındadır.',
    en: 'A decision tree’s rules are readable and translate directly into an if-else chain on an Arduino. That is why it is chosen wherever a decision must be explained: a bank has to be able to tell a customer why a loan was refused (“income ≤ 3,000 and missed payments > 1”). Combined by the hundred (random forests, gradient boosting) they are still among the strongest methods for tabular data.',
  },
  file: 'karar_agaci.py',
  code: [
    ['import numpy as np'],
    ['D = np.genfromtxt(\'cizgi-izleyen.csv\', delimiter=\',\', names=True)', '160 eğitim, 80 test anı', '160 training, 80 test moments'],
    ['A, e, tr = np.c_[D[\'sol\'], D[\'sag\']], D[\'eylem\'].astype(int), D[\'grup\'] == 0', '[sol, sağ], 0 sola 1 düz 2 sağa', '[left, right], 0 left 1 straight 2 right'],
    ['X, y, X_test, y_test = A[tr], e[tr], A[~tr], e[~tr]'],
    ['def gini(y): p = np.bincount(y, minlength=3) / max(len(y), 1); return 1 - (p ** 2).sum()'],
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
    ['def predict(t, x):'],
    ['    while isinstance(t, tuple): t = t[2] if x[t[0]] <= t[1] else t[3]', 'evet: sol dal, hayır: sağ dal', 'yes: left branch, no: right branch'],
    ['    return t'],
    ['acc = lambda X, y: np.mean([predict(tree, x) == c for x, c in zip(X, y)])'],
    ['print(acc(X, y), acc(X_test, y_test))', 'eğitim ve saklı veride doğruluk', 'accuracy on training and hidden data'],
  ],
  params: [
    { key: 'depth', label: { tr: 'En büyük derinlik', en: 'Max depth' }, min: 1, max: 10, step: 1, value: 3 },
    { key: 'veri', label: { tr: 'Veri: 0 çizgi izleyen, 1 kredi', en: 'Data: 0 line follower, 1 loan' }, min: 0, max: 1, step: 1, value: 0 },
  ],
  run({ depth = 3, veri = 0 }) {
    const ds = veri >= 0.5 ? 1 : 0
    const C = ds ? creditData() : null
    const X = C ? C.slice(0, 400) : lineData(), T = C ? C.slice(400) : lineData(57, 80)
    const root: Box = ds ? { x0: 1000, x1: 6000, y0: -0.5, y1: 5.5 } : { x0: 0, x1: 1023, y0: 0, y1: 1023 }
    const F: TreeFrame[] = []
    const splits: TreeFrame['splits'] = [], leaves: TreeFrame['leaves'] = []
    const { feat: FEAT, cls: NAMES } = TREE_NAMES[ds]
    const unit: [string, string] = ds ? ['müşteri', 'customers'] : ['an', 'moments']
    const nT = T.length
    const stat = cap(`${X.length} ${unit[0]} · derinlik ≤ ${depth}`, `${X.length} ${unit[1]} · depth ≤ ${depth}`)
    F.push({ ds, X, splits: [], leaves: [], line: 1, cap: cap(`başlangıç: Gini ${fmt(gini(X.map((p) => p.c)), 3, 'tr')}`, `start: Gini ${gini(X.map((p) => p.c)).toFixed(3)}`), stat, hold: 1.8 })
    const tree = grow(X, depth, root, (e) => {
      if (e.kind === 'split') {
        F.push({ ds, X, splits: [...splits], leaves: [...leaves], active: e.box, line: 8, cap: cap(`düzey ${e.d + 1} · eşikler deneniyor`, `level ${e.d + 1} · trying thresholds`), stat, hold: e.d < 2 ? 1 : 0.5 })
        splits.push({ f: e.f!, t: e.t!, box: e.box, depth: e.d })
        F.push({ ds, X, splits: [...splits], leaves: [...leaves], active: e.box, line: 12, cap: cap(`${FEAT[e.f!][0]} ≤ ${e.t} ?`, `${FEAT[e.f!][1]} ≤ ${e.t} ?`), stat, hold: e.d < 2 ? 1.4 : 0.6 })
      } else {
        leaves.push({ box: e.box, c: e.c! })
        F.push({ ds, X, splits: [...splits], leaves: [...leaves], line: 13, cap: cap(`yaprak: ${NAMES[e.c!][0]}`, `leaf: ${NAMES[e.c!][1]}`), stat, hold: 0.5 })
      }
    })
    const acc = T.filter((p) => treePredict(tree, p.x, p.y) === p.c).length / T.length
    const trainAcc = X.filter((p) => treePredict(tree, p.x, p.y) === p.c).length / X.length
    const rules = treeRules(tree, ds)
    const fin = { ds, X, splits: [...splits], leaves: [...leaves], tree, acc, trainAcc }
    if (rules.length <= 14) F.push({ ...fin, rules, line: 16, cap: cap(`${leaves.length} yaprak · ${rules.length} satır kural`, `${leaves.length} leaves · ${rules.length} lines of rules`), stat: ds ? cap('her red tek satırla açıklanır', 'every refusal is explained in one line') : cap('if-else: doğrudan Arduino’ya', 'if-else: straight onto an Arduino'), hold: 3 })
    F.push({ ...fin, rules: rules.length <= 14 ? rules : undefined, line: 21, cap: cap(`${leaves.length} yaprak · test doğruluğu %${Math.round(acc * 100)}`, `${leaves.length} leaves · test accuracy ${Math.round(acc * 100)}%`), stat: (ds ? cap(`eski müşteriler %${Math.round(trainAcc * 100)} · ${nT} yeni müşteri %${Math.round(acc * 100)}`, `old customers ${Math.round(trainAcc * 100)}% · ${nT} new customers ${Math.round(acc * 100)}%`) : cap(`eğitimde %${Math.round(trainAcc * 100)} · ${nT} saklı anda %${Math.round(acc * 100)}`, `training ${Math.round(trainAcc * 100)}% · ${nT} hidden moments ${Math.round(acc * 100)}%`)), hold: 3 })
    return F
  },
}
// Veri CSV'den açılınca 1. satırdan sonra 2 satır eklendi: vurgulanan satırlar kayar.
TREE.run = shifted(TREE.run, 1, 2)

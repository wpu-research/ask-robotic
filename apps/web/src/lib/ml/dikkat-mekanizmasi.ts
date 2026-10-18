// Ders: dikkat mekanizması. "robot kutuyu aldı çünkü o hafifti" cümlesinde "o" kimi kastediyor? Elle kurulmuş küçük kelime
// vektörleri ve Q, K, V matrisleriyle ölçekli nokta çarpım dikkati gerçekten hesaplanır: softmax(QKᵀ / (√d · τ)) V.
import { cap, fmt, type Bi, type Frame, type Lesson } from './core'

/** Özellikler: [ajan, nesne, eylem, hafif, güçlü]. Son kelime varyanta göre "hafifti" ya da "güçlüydü". */
export const FEATS: Bi[] = [
  { tr: 'ajan', en: 'agent' }, { tr: 'nesne', en: 'object' }, { tr: 'eylem', en: 'action' }, { tr: 'hafif', en: 'light' }, { tr: 'güçlü', en: 'strong' },
]
export function sentence(variant: number): { words: Bi[]; X: number[][] } {
  const strong = variant === 1
  const words: Bi[] = [
    { tr: 'robot', en: 'the robot' }, { tr: 'kutuyu', en: 'the box' }, { tr: 'aldı', en: 'picked up' },
    { tr: 'çünkü', en: 'because' }, { tr: 'o', en: 'it' }, strong ? { tr: 'güçlüydü', en: 'was strong' } : { tr: 'hafifti', en: 'was light' },
  ]
  const X = [
    [1, 0, 0, 0, 0], // robot: ajan
    [0, 1, 0, 0, 0], // kutu: nesne
    [0, 0, 1, 0, 0], // aldı: eylem
    [0, 0, 0.5, 0, 0], // çünkü
    [0.5, 0.5, 0, 0, 0], // o: ajan da olabilir nesne de
    strong ? [0, 0, 0, 0, 1] : [0, 0, 0, 1, 0],
  ]
  return { words, X }
}
/** Sorgu ağırlıkları (5 → 3): sütunlar [ajan arar, nesne arar, eylem arar]. "hafif" bir nesne arar, "güçlü" bir ajan arar. */
export const WQ = [[0, 0, 1], [0, 0, 1], [1, 1, 0], [0, 2, 0], [2, 0, 0]].map((r) => r.map((x) => 2.5 * x))
/** Anahtar ve değer: ilk üç özelliği (ajan, nesne, eylem) olduğu gibi alır. */
export const WK = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0], [0, 0, 0]]
export const WV = WK

const matmul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)))
const dot = (a: number[], b: number[]) => a.reduce((s, x, k) => s + x * b[k], 0)

export function attention(variant: number, tau: number) {
  const { words, X: X0 } = sentence(variant)
  const X = X0.map((r) => [...r])
  X[4] = X[4].map((x, k) => x + X0[5][k]) // önceki katman: zamir cümle sonunu görmüş
  const Q = matmul(X, WQ), K = matmul(X, WK), V = matmul(X, WV)
  const d = K[0].length
  const raw = Q.map((q) => K.map((k) => dot(q, k)))
  const S = raw.map((r) => r.map((x) => x / (Math.sqrt(d) * tau)))
  const E = S.map((r) => { const m = Math.max(...r); return r.map((x) => Math.exp(x - m)) })
  const A = E.map((r) => { const z = r.reduce((s, x) => s + x, 0); return r.map((x) => x / z) })
  const out = A.map((a) => V[0].map((_, c) => a.reduce((s, w, j) => s + w * V[j][c], 0)))
  return { words, X0, X, Q, K, V, d, raw, S, E, A, out }
}

export type Stage = 'emb' | 'mix' | 'qkv' | 'score' | 'scale' | 'exp' | 'norm' | 'out' | 'all'
export interface AttnFrame extends Frame {
  r: ReturnType<typeof attention>
  qi: number
  tau: number
  stage: Stage
  /** 'score' aşamasında kaç anahtarla çarpım yapıldı; 'emb' aşamasında −1 − i: vurgulanan kelime i. */
  kn: number
  /** Isı haritasında dolu hücre sayısı (satır satır). */
  cells: number
}

export const DIKKAT: Lesson<AttnFrame> = {
  slug: 'dikkat-mekanizmasi',
  n: 0,
  title: { tr: 'Dikkat mekanizması', en: 'The attention mechanism' },
  sub: { tr: '"o" kimi kastediyor? Sorgu, anahtar, değer ve softmax', en: 'Who does "it" refer to? Query, key, value and softmax' },
  story: {
    tr: 'Robota sesli bir rapor geliyor: "robot kutuyu aldı çünkü o hafifti". Burada "o" kutu; "o güçlüydü" deseydik robot olurdu. Dil modeli bunu dikkat ile çözer. Altı kelimenin her birine 5 sayılık elle kurulmuş bir vektör verdik (ajan, nesne, eylem, hafif, güçlü) ve dil modellerindeki hesabı birebir yapıyoruz; yalnız boyutlar küçük.',
    en: 'A spoken report reaches the robot: "the robot picked up the box because it was light". Here "it" is the box; with "it was strong" it would be the robot. A language model resolves this with attention. We gave each of the six words a hand-made vector of 5 numbers (agent, object, action, light, strong) and do exactly the computation of a language model, only with tiny sizes.',
  },
  how: [
    { tr: 'Her kelime üç vektör üretir: sorgu (Q, "ne arıyorum"), anahtar (K, "ben neyim"), değer (V, "ne taşıyorum"). Bunlar kelime vektörünün üç ayrı matrisle çarpımıdır.', en: 'Every word produces three vectors: a query (Q, "what am I looking for"), a key (K, "what am I") and a value (V, "what do I carry"). Each is the word vector times its own matrix.' },
    { tr: 'Benzerlik: sorgunun her anahtarla nokta çarpımı. Ölçekleme: √d’ye (burada √3) bölünür ki boyut büyüdükçe sayılar patlamasın; τ sıcaklığıyla da bölüyoruz.', en: 'Similarity: the dot product of the query with every key. Scaling: divide by √d (here √3) so the numbers do not blow up as dimensions grow; we also divide by a temperature τ.' },
    { tr: 'Softmax: her sayının üssü alınır ve toplama bölünür; satırın toplamı 1 olur, yani ağırlıklar bir olasılık dağılımıdır.', en: 'Softmax: exponentiate every number and divide by the sum; the row adds up to 1, so the weights form a probability distribution.' },
    { tr: 'Karışım: kelimenin yeni vektörü, değerlerin bu ağırlıklarla ortalamasıdır. "o"nun yeni vektörü çoğunlukla "kutu"nun değerini taşır.', en: 'Mixing: the new vector of a word is the average of the values with these weights. The new vector of "it" mostly carries the value of "box".' },
    { tr: 'Şunu dene: son kelimeyi "güçlüydü" yap; dikkat robota kayar. τ’yu 3 yap; dağılım düzleşir ve karar bulanıklaşır.', en: 'Try this: switch the last word to "was strong"; attention moves to the robot. Set τ to 3; the distribution flattens and the decision blurs.' },
  ],
  why: {
    tr: 'Dikkat, transformer’ın kalbidir: ChatGPT gibi modeller her katmanda, her kelime için bu hesabı binlerce boyutta ve onlarca "kafa" ile yapar; sunuculardaki GPU’ların işinin büyük kısmı bu matris çarpımlarıdır. Robotikte aynı mekanizma sesli komutları anlamada, kamera görüntüsünün parçaları arasında ilişki kurmada ve görme-dil-eylem modellerinde kullanılır.',
    en: 'Attention is the heart of the transformer: models like ChatGPT run this computation in every layer, for every word, with thousands of dimensions and dozens of "heads"; most of the GPU work on the servers is these matrix products. In robotics the same mechanism helps understand voice commands, relate parts of a camera image and drive vision-language-action models.',
  },
  file: 'dikkat.py',
  code: [
    ['import numpy as np'],
    ['words = ["robot", "box", "picked", "because", "it", "light"]'],
    ['X = np.array([[1, 0, 0, 0, 0],', 'robot: ajan', 'robot: agent'],
    ['              [0, 1, 0, 0, 0],', 'kutu: nesne', 'box: object'],
    ['              [0, 0, 1, 0, 0],', 'aldı: eylem', 'picked: action'],
    ['              [0, 0, .5, 0, 0],', 'çünkü', 'because'],
    ['              [.5, .5, 0, 0, 0],', 'o: ajan mı nesne mi?', 'it: agent or object?'],
    ['              [0, 0, 0, 1, 0]], float)', 'hafifti (güçlüydü: 0,0,0,0,1)', 'light (strong: 0,0,0,0,1)'],
    ['X[4] += X[5]', 'önceki katman: "o" cümle sonunu görmüş', 'earlier layer: "it" has seen the end'],
    ['WQ = 2.5 * np.array([[0, 0, 1], [0, 0, 1], [1, 1, 0],', 'sütunlar: ajan, nesne, eylem arar', 'columns: seeks agent, object, action'],
    ['                     [0, 2, 0], [2, 0, 0]])', 'hafif → nesne, güçlü → ajan', 'light → object, strong → agent'],
    ['WK = WV = np.eye(5, 3)', 'anahtar = değer = ilk 3 özellik', 'key = value = first 3 features'],
    ['Q, K, V = X @ WQ, X @ WK, X @ WV'],
    ['d, tau = K.shape[1], 1.0', 'd = 3, sıcaklık', 'd = 3, temperature'],
    ['S = Q @ K.T', 'benzerlik: her sorgu · her anahtar', 'similarity: every query · every key'],
    ['S = S / (np.sqrt(d) * tau)', 'ölçekle', 'scale'],
    ['A = np.exp(S - S.max(1, keepdims=True))', 'softmax: üs al', 'softmax: exponentiate'],
    ['A = A / A.sum(1, keepdims=True)', 'satır toplamı 1', 'each row sums to 1'],
    ['out = A @ V', 'değerlerin ağırlıklı karışımı', 'weighted mix of the values'],
    ['print(A[4].round(2), words[A[4].argmax()])', '"o" kime bakıyor?', 'who does "it" attend to?'],
    ['print(out[4].round(2))', '"o"nun yeni vektörü', 'the new vector of "it"'],
  ],
  params: [
    { key: 'q', label: { tr: 'Sorgu kelimesi (1 robot … 5 o … 6 son)', en: 'Query word (1 robot … 5 it … 6 last)' }, min: 1, max: 6, step: 1, value: 5 },
    { key: 'tau', label: { tr: 'Sıcaklık τ', en: 'Temperature τ' }, min: 0.25, max: 3, step: 0.25, value: 1 },
    { key: 'variant', label: { tr: 'Son kelime (0 hafifti, 1 güçlüydü)', en: 'Last word (0 light, 1 strong)' }, min: 0, max: 1, step: 1, value: 0 },
  ],
  run({ q = 5, tau = 1, variant = 0 }) {
    const qi = Math.max(0, Math.min(5, Math.round(q) - 1))
    const t = Math.max(0.05, tau)
    const vr = Math.round(variant) === 1 ? 1 : 0
    const r = attention(vr, t)
    const F: AttnFrame[] = []
    const W = r.words, w = (i: number) => W[i]
    const base = { r, qi, tau: t, kn: 0, cells: 0 }
    const st = cap(`sorgu "${w(qi).tr}" · d = ${r.d} · τ = ${fmt(t, 2, 'tr')}`, `query "${w(qi).en}" · d = ${r.d} · τ = ${t.toFixed(2)}`)
    F.push({ ...base, stage: 'emb', line: 1, cap: cap('altı kelimelik bir cümle', 'a six-word sentence'), stat: st, hold: 2 })
    const fl = (v: number[], l: 'tr' | 'en') => v.map((x, k) => (x ? `${FEATS[k][l]} ${l === 'tr' ? fmt(x, 1, 'tr') : x.toFixed(1)}` : '')).filter(Boolean).join(', ')
    for (let i = 0; i < 6; i++) F.push({ ...base, stage: 'emb', kn: -1 - i, line: 2 + i, cap: cap(`"${w(i).tr}": ${fl(r.X0[i], 'tr')}`, `"${w(i).en}": ${fl(r.X0[i], 'en')}`), stat: st, hold: i < 2 ? 1.2 : 0.7 })
    F.push({ ...base, stage: 'mix', line: 8, cap: cap('"o" cümlenin sonunu da taşıyor (önceki katman)', '"it" also carries the end of the sentence (earlier layer)'), stat: st, hold: 1.6 })
    F.push({ ...base, stage: 'qkv', line: 9, cap: cap('sorgu matrisi: "hafif" nesne arar, "güçlü" ajan arar', 'query matrix: "light" seeks an object, "strong" seeks an agent'), stat: st, hold: 1.6 })
    F.push({ ...base, stage: 'qkv', line: 12, cap: cap('Q, K, V: her kelime için üç vektör', 'Q, K, V: three vectors for every word'), stat: st, hold: 1.6 })
    F.push({ ...base, stage: 'qkv', line: 13, cap: cap(`anahtar boyu d = ${r.d}, sıcaklık τ = ${fmt(t, 2, 'tr')}`, `key size d = ${r.d}, temperature τ = ${t.toFixed(2)}`), stat: st, hold: 1.2 })
    const qv = r.Q[qi]
    for (let j = 0; j < 6; j++) {
      const c = cap(`q("${w(qi).tr}") · k("${w(j).tr}") = ${fmt(r.raw[qi][j], 2, 'tr')}`, `q("${w(qi).en}") · k("${w(j).en}") = ${r.raw[qi][j].toFixed(2)}`)
      F.push({ ...base, stage: 'score', kn: j + 1, line: 14, cap: c, stat: cap(`q = [${qv.map((x) => fmt(x, 1, 'tr')).join('; ')}]`, `q = [${qv.map((x) => x.toFixed(1)).join(', ')}]`), hold: j < 2 ? 1.4 : 0.7 })
    }
    F.push({ ...base, stage: 'scale', kn: 6, line: 15, cap: cap(`ölçekle: √${r.d} · τ = ${fmt(Math.sqrt(r.d) * t, 2, 'tr')} ile böl`, `scale: divide by √${r.d} · τ = ${(Math.sqrt(r.d) * t).toFixed(2)}`), stat: st, hold: 1.6 })
    F.push({ ...base, stage: 'exp', kn: 6, line: 16, cap: cap('softmax 1: üs al (en büyüğü çıkararak, taşmasın)', 'softmax 1: exponentiate (minus the max, to avoid overflow)'), stat: st, hold: 1.4 })
    const best = r.A[qi].indexOf(Math.max(...r.A[qi]))
    F.push({ ...base, stage: 'norm', kn: 6, line: 17, cap: cap(`softmax 2: toplama böl → "${w(best).tr}" %${Math.round(r.A[qi][best] * 100)}`, `softmax 2: divide by the sum → "${w(best).en}" ${Math.round(r.A[qi][best] * 100)}%`), stat: cap(`satır toplamı ${fmt(r.A[qi].reduce((s, x) => s + x, 0), 3, 'tr')}`, `row sum ${r.A[qi].reduce((s, x) => s + x, 0).toFixed(3)}`), hold: 2 })
    const o = r.out[qi]
    const oc = cap(`yeni vektör: ajan ${fmt(o[0], 2, 'tr')} · nesne ${fmt(o[1], 2, 'tr')} · eylem ${fmt(o[2], 2, 'tr')}`, `new vector: agent ${o[0].toFixed(2)} · object ${o[1].toFixed(2)} · action ${o[2].toFixed(2)}`)
    F.push({ ...base, stage: 'out', kn: 6, line: 18, cap: oc, stat: st, hold: 2 })
    F.push({ ...base, stage: 'out', kn: 6, line: 20, cap: oc, stat: cap(`en büyük ağırlık: "${w(best).tr}"`, `largest weight: "${w(best).en}"`), hold: 1.6 })
    // bütün satırlar: matris hücre hücre dolar
    for (let c = 1; c <= 36; c++) {
      const i = Math.floor((c - 1) / 6), j = (c - 1) % 6
      F.push({ ...base, stage: 'all', kn: 6, cells: c, line: c % 6 === 0 ? 17 : 14, cap: cap(`tüm kelimeler: "${w(i).tr}" → "${w(j).tr}" ${fmt(r.A[i][j], 2, 'tr')}`, `all words: "${w(i).en}" → "${w(j).en}" ${r.A[i][j].toFixed(2)}`), stat: cap('her satır bir sorgu, toplamı 1', 'each row is one query and sums to 1'), hold: c <= 6 ? 0.6 : 0.25 })
    }
    const ob0 = r.A[4].indexOf(Math.max(...r.A[4]))
    const lo = attention(vr, 0.5).A[4][ob0], hi = attention(vr, 3).A[4][ob0]
    F.push({
      ...base, stage: 'all', kn: 6, cells: 36, line: 15,
      cap: cap(`sıcaklık: τ = 0,5 iken "o" → "${w(ob0).tr}" %${Math.round(lo * 100)}, τ = 3 iken %${Math.round(hi * 100)}`, `temperature: at τ = 0.5 "it" → "${w(ob0).en}" ${Math.round(lo * 100)}%, at τ = 3 ${Math.round(hi * 100)}%`),
      stat: cap('küçük τ keskinleştirir, büyük τ düzleştirir', 'small τ sharpens, large τ flattens'), hold: 2,
    })
    const other = attention(1 - vr, t)
    const oBest = other.A[4].indexOf(Math.max(...other.A[4]))
    const ob = r.A[4].indexOf(Math.max(...r.A[4]))
    F.push({
      ...base, stage: 'all', kn: 6, cells: 36, line: 19,
      cap: cap(`"o" → "${w(ob).tr}" (%${Math.round(r.A[4][ob] * 100)})`, `"it" → "${w(ob).en}" (${Math.round(r.A[4][ob] * 100)}%)`),
      stat: cap(`"${other.words[5].tr}" deseydik: "o" → "${other.words[oBest].tr}" (%${Math.round(other.A[4][oBest] * 100)})`, `with "${other.words[5].en}": "it" → "${other.words[oBest].en}" (${Math.round(other.A[4][oBest] * 100)}%)`),
      hold: 3,
    })
    return F
  },
}

// Ders: mini dil modeli. Robotun görev günlüğünden 16 cümle; her kelime için "sonraki kelime" puanları (29×29), softmax ve
// çift çift okuyarak öğrenme. Sonra model ağırlıklı zarla yazar; hep en olası kelimeyi seçerse aynı cümlede döner durur.
import { cap, fmt, rng, type CodeLine, type Frame, type Lesson } from './core'

/** Görev günlüğü (Türkçe; iki arayüz dilinde de aynı korpus). Nokta da bir kelime sayılır. */
export const STORY = 'robot kırmızı kutuyu aldı ve rafa koydu . robot mavi kutuyu aldı ve banda koydu . kol yeşil kutuyu banda bıraktı . robot şarj istasyonuna gitti ve bekledi . kamera mavi etiketi okudu . kol mavi kutuyu rafa bıraktı . robot engeli gördü ve yavaşça durdu . kamera kırmızı etiketi okudu ve bekledi . robot depoya gitti ve kutuyu aldı . kol kutuyu banda koydu ve durdu . robot şarj istasyonuna hızla döndü . kamera yeşil kutuyu gördü . robot kapıya gitti ve bekledi . kol kırmızı kutuyu depoya taşıdı . robot şarj istasyonuna gitti ve durdu . kamera engeli gördü ve robot durdu .'
export const WORDS = STORY.split(' ')
/** Sözlük: Python'daki sorted(set(w)) ile aynı sıra (kod noktasına göre). */
export const VOCAB = [...new Set(WORDS)].sort()
export const N = VOCAB.length
export const SENTENCES = STORY.split(' . ').map((s) => s.replace(/ \.$/, ''))
const IX = new Map(VOCAB.map((w, i) => [w, i]))
export const ix = (w: string) => IX.get(w)!
const LR = 0.5
export const TOURS = 500

/** İngilizce arayüz için kelime kelime karşılıklar. */
export const GLOSS: Record<string, string> = {
  '.': '.', aldı: 'took', banda: 'to belt', bekledi: 'waited', bıraktı: 'dropped', depoya: 'to store', durdu: 'stopped', döndü: 'returned',
  engeli: 'obstacle', etiketi: 'label', gitti: 'went', gördü: 'saw', hızla: 'quickly', istasyonuna: 'station', kamera: 'camera', kapıya: 'to door',
  kol: 'arm', koydu: 'put', kutuyu: 'box', kırmızı: 'red', mavi: 'blue', okudu: 'read', rafa: 'to shelf', robot: 'robot', taşıdı: 'carried',
  ve: 'and', yavaşça: 'slowly', yeşil: 'green', şarj: 'charging',
}

export interface LmFrame extends Frame {
  /** Çubukları gösterilen kelime ve ondan sonra gelecek kelimelerin olasılıkları (VOCAB sırasıyla). */
  word: string
  probs: number[]
  tour: number
  /** Okunan çift (eğitim) ya da zarın seçtiği kelime (yazma). */
  pair?: [string, string]
  /** Hikâyede vurgulanan çiftin ilk kelimesinin sırası. */
  at?: number
  pick?: number
  /** Yazılan metin (kelimeler). */
  text?: string[]
  mode: number
  /** Hikâyeyi göster (giriş kareleri). */
  story?: boolean
}

export function softmax(v: ArrayLike<number>): number[] {
  let m = -Infinity
  for (let i = 0; i < v.length; i++) if (v[i] > m) m = v[i]
  const e = Array.from(v, (x) => Math.exp(x - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / s)
}

/** Puan tablosunu eğitir. snap(tour) true ise o turun sonundaki tablo kopyalanır. */
export function trainLm(tours = TOURS, snapAt: number[] = []) {
  const P = Array.from({ length: N }, () => new Float64Array(N))
  const snaps = new Map<number, Float64Array[]>()
  const a = WORDS.map(ix)
  for (let t = 1; t <= tours; t++) {
    for (let k = 0; k + 1 < a.length; k++) {
      const row = P[a[k]]
      const p = softmax(row)
      p[a[k + 1]] -= 1
      for (let j = 0; j < N; j++) row[j] -= LR * p[j]
    }
    if (snapAt.includes(t)) snaps.set(t, P.map((r) => r.slice()))
  }
  return { P, snaps }
}

/** Ağırlıklı zar (mode 0) ya da en olası kelime (mode 1) ile yazma. */
export function write(P: Float64Array[], n: number, seed: number, mode: number, start = '.') {
  const r = rng(seed)
  const out: Array<{ prev: string; probs: number[]; pick: number }> = []
  let w = start
  for (let i = 0; i < n; i++) {
    const q = softmax(P[ix(w)])
    let pick = 0
    if (mode === 1) pick = q.reduce((bi, v, j) => (v > q[bi] ? j : bi), 0)
    else { let u = r(); pick = N - 1; for (let j = 0; j < N; j++) { u -= q[j]; if (u < 0) { pick = j; break } } }
    out.push({ prev: w, probs: q, pick })
    w = VOCAB[pick]
  }
  return out
}

/** Yazılan cümlelerden kaçı hikâyede yok (tam cümle olarak). */
export function novelty(P: Float64Array[], seed: number, mode: number, sentences = 500) {
  const known = new Set(SENTENCES)
  const words = write(P, sentences * 12, seed + 1000, mode).map((o) => VOCAB[o.pick])
  const sents: string[] = []
  let cur: string[] = []
  for (const w of words) { if (w === '.') { sents.push(cur.join(' ')); cur = []; if (sents.length >= sentences) break } else cur.push(w) }
  const nov = sents.filter((s) => !known.has(s)).length
  return { n: sents.length, novel: nov, frac: sents.length ? nov / sents.length : 0 }
}

// eğitim parametreden bağımsız: bir kez hesaplanır
const SNAPS = [1, 2, 3, 5, 8, 12, 20, 35, 50, 100, 200, 500]
let cache: ReturnType<typeof trainLm> | null = null
export const trained = () => (cache ??= trainLm(TOURS, SNAPS))

// Python kodu: hikâye 60 karakterlik satırlara sarılır
function wrapStory(): CodeLine[] {
  const lines: string[] = []
  let cur = "story = '''"
  for (const w of WORDS) {
    const c = cur + (cur.endsWith("'''") ? '' : ' ') + w
    if (c.length > 60) { lines.push(cur); cur = w } else cur = c
  }
  lines.push(cur + "'''")
  return lines.map((l, i) => (i === 0 ? [l, 'görev günlüğü: 16 cümle', 'task log: 16 sentences'] : [l]))
}
const STORY_LINES = wrapStory()
const S = STORY_LINES.length // hikâye 1..S satırlarında
const L = { story: 1, vocab: S + 1, table: S + 2, soft: S + 3, tour: S + 4, pair: S + 5, step: S + 6, print: S + 7, seed: S + 8, loop: S + 9, q: S + 10, die: S + 11, top: S + 12, out: S + 13 }

const pc = (x: number, lang: 'tr' | 'en', d = 1) => (lang === 'tr' ? `%${fmt(x * 100, d, 'tr')}` : `${(x * 100).toFixed(d)}%`)
const top = (q: number[]) => q.reduce((bi, v, j) => (v > q[bi] ? j : bi), 0)

export const MINI_DIL_MODELI: Lesson<LmFrame> = {
  slug: 'mini-dil-modeli',
  n: 0,
  title: { tr: 'Mini dil modeli: bir sonraki kelime', en: 'A tiny language model: the next word' },
  sub: { tr: 'Robotun görev günlüğünden yazmayı öğrenen 29×29 puan tablosu', en: "A 29×29 score table that learns to write from the robot's task log" },
  story: {
    tr: `Ayıklama hattındaki robot, yaptığı her işi günlüğüne kısa bir cümleyle yazıyor: "robot şarj istasyonuna gitti ve bekledi ." gibi. Elimizde ${SENTENCES.length} cümle, ${WORDS.length} kelime var (nokta da kelime sayılır); farklı kelime sayısı ${N}. Model bu günlükten her kelimenin ardından hangi kelimenin geldiğini öğrenecek, sonra kendi günlük cümlelerini yazacak.`,
    en: `The robot on the sorting line writes every job into its log as a short sentence, like "robot şarj istasyonuna gitti ve bekledi ." (the robot went to the charging station and waited). The log is in Turkish, and we keep it that way in both languages: the model never knows what words mean anyway. We have ${SENTENCES.length} sentences and ${WORDS.length} words (the full stop counts as a word), ${N} of them different. The model learns which word follows which, then writes log lines of its own.`,
  },
  how: [
    { tr: `Kelimeler sayıya dönüşür: her kelime, ${N} farklı kelimelik alfabetik listedeki sırasını alır. Büyük dil modelleri de aynısını kelime parçalarıyla (token) yapar.`, en: `Words become numbers: each word gets its place in the sorted list of ${N} different words. Large language models do the same with pieces of words (tokens).` },
    { tr: `Her kelime için olası her sonraki kelimeye bir puan tutulur: ${N} × ${N} = ${N * N} puan, hepsi sıfırdan başlar. Softmax puanları olasılığa çevirir; başta her kelime eşit: %${fmt(100 / N, 1, 'tr')}.`, en: `For every word the model keeps a score for each word that could come next: ${N} × ${N} = ${N * N} scores, all starting at zero. Softmax turns them into chances; at first every word gets the same ${(100 / N).toFixed(1)}%.` },
    { tr: 'Model günlüğü çift çift okur: sonraki kelimeyi tahmin eder, hata yanlış kelimelere verdiği olasılıktır; küçük bir adım bu olasılığı gerçekten gelen kelimeye kaydırır.', en: 'The model reads the log pair by pair: it guesses the next word, the error is the chance it gave to the wrong words, and a small step moves that chance to the word that really came next.' },
    { tr: 'Yazarken son kelimenin olasılıklarıyla ağırlıklı bir zar atar, kazananı metne ekler ve oradan yeniden atar.', en: 'To write, it rolls a die weighted by the chances after the last word, adds the winner to the text and rolls again from there.' },
    { tr: "Şunu dene: yazma modunu 1 (en olası) yap. Model hep aynı cümleyi tekrarlar. Tohumu değiştir: zar başka bir günlük yazar.", en: 'Try this: set the writing mode to 1 (most likely). The model repeats the same sentence forever. Change the seed and the die writes a different log.' },
  ],
  why: {
    tr: 'ChatGPT gibi büyük dil modelleri de bir sonraki parçayı tahmin edip zar atarak yazar; fark, yalnız son kelimeye değil bütün konuşmaya bakmaları ve milyarlarca ağırlıkla çalışmalarıdır. Robotikte aynı fikir, sesli komutları ve görev planlarını adım adım üreten modellerde ve olay günlüklerinde "beklenmedik sıra" yakalamakta kullanılır.',
    en: 'Large language models like ChatGPT also write by predicting the next piece and rolling a die; the difference is that they read the whole conversation, not just the last word, with billions of weights. In robotics the same idea powers models that turn voice commands into step-by-step task plans, and catches "unexpected sequences" in event logs.',
  },
  file: 'mini_dil_modeli.py',
  code: [
    ['import numpy as np'],
    ...STORY_LINES,
    ['w = story.split(); V = sorted(set(w)); n = len(V)', `${N} farklı kelime`, `${N} different words`],
    ['ix = {s: i for i, s in enumerate(V)}; P = np.zeros((n, n))', `${N}×${N} puan, hepsi 0`, `${N}×${N} scores, all 0`],
    ['sm = lambda v: np.exp(v) / np.exp(v).sum()', 'softmax', 'softmax'],
    ['for tour in range(500):'],
    ['    for a, b in zip(w, w[1:]):', 'çift çift oku', 'read pair by pair'],
    ['        p = sm(P[ix[a]]); p[ix[b]] -= 1; P[ix[a]] -= .5 * p', 'hata → küçük adım', 'error → small step'],
    ["print(sm(P[ix['şarj']]).max().round(3))", "'şarj' sonrası en olası", "most likely after 'şarj'"],
    ["rng, t = np.random.default_rng(7), ['.']", 'cümle başından yaz', 'write from a sentence start'],
    ['for _ in range(24):'],
    ['    q = sm(P[ix[t[-1]]])', 'son kelimeden sonraki olasılıklar', 'chances after the last word'],
    ['    t.append(V[rng.choice(n, p=q)])', 'ağırlıklı zar', 'weighted die'],
    ['    # t.append(V[q.argmax()])', 'hep en olası: döngüye girer', 'always the top word: loops'],
    ["print(' '.join(t[1:]))"],
  ],
  params: [
    { key: 'seed', label: { tr: 'Zar tohumu', en: 'Die seed' }, min: 1, max: 50, step: 1, value: 7 },
    { key: 'mode', label: { tr: 'Yazma: 0 zar, 1 en olası', en: 'Writing: 0 die, 1 most likely' }, min: 0, max: 1, step: 1, value: 0 },
  ],
  run({ seed = 7, mode = 0 }) {
    const md = mode >= 0.5 ? 1 : 0
    const { P, snaps } = trained()
    const F: LmFrame[] = []
    const eq = new Array(N).fill(1 / N)
    const base = { mode: md }
    const stat0 = cap(`${SENTENCES.length} cümle · ${WORDS.length} kelime · ${N} farklı`, `${SENTENCES.length} sentences · ${WORDS.length} words · ${N} different`)
    F.push({ ...base, word: 'robot', probs: eq, tour: 0, story: true, line: L.story, cap: cap('robotun görev günlüğü', "the robot's task log"), stat: stat0, hold: 2.2 })
    F.push({ ...base, word: 'robot', probs: eq, tour: 0, story: true, line: L.vocab, cap: cap(`${N} farklı kelime, her biri bir sıra numarası alır`, `${N} different words, each gets a number`), stat: stat0, hold: 1.6 })
    F.push({ ...base, word: 'robot', probs: eq, tour: 0, line: L.table, cap: cap(`${N}×${N} = ${N * N} puan, hepsi 0`, `${N}×${N} = ${N * N} scores, all 0`), stat: stat0, hold: 1.6 })
    F.push({ ...base, word: 'robot', probs: eq, tour: 0, line: L.soft, cap: cap(`softmax: her kelime eşit, ${pc(1 / N, 'tr')}`, `softmax: every word equal, ${pc(1 / N, 'en')}`), stat: stat0, hold: 1.6 })
    // ilk turun ilk çiftleri: elle aynı adım
    const P1 = Array.from({ length: N }, () => new Float64Array(N))
    const a = WORDS.map(ix)
    for (let k = 0; k < 3; k++) {
      const w0 = WORDS[k], w1 = WORDS[k + 1]
      const before = softmax(P1[a[k]])
      F.push({ ...base, word: w0, probs: before, tour: 1, pair: [w0, w1], at: k, story: true, line: L.pair, cap: cap(`çift ${k + 1}: "${w0}" → "${w1}"`, `pair ${k + 1}: "${w0}" → "${w1}"`), stat: cap(`"${w1}" şimdi ${pc(before[a[k + 1]], 'tr')}`, `"${w1}" now ${pc(before[a[k + 1]], 'en')}`), hold: k === 0 ? 1.4 : 1 })
      const p = softmax(P1[a[k]]); p[a[k + 1]] -= 1
      for (let j = 0; j < N; j++) P1[a[k]][j] -= LR * p[j]
      const after = softmax(P1[a[k]])
      F.push({ ...base, word: w0, probs: after, tour: 1, pair: [w0, w1], at: k, story: true, line: L.step, cap: cap(`küçük adım: "${w1}" ${pc(before[a[k + 1]], 'tr')} → ${pc(after[a[k + 1]], 'tr')}`, `small step: "${w1}" ${pc(before[a[k + 1]], 'en')} → ${pc(after[a[k + 1]], 'en')}`), stat: cap(`"${w0}" sonrası`, `after "${w0}"`), hold: k === 0 ? 1.6 : 1 })
    }
    // turlar: "robot" sonrası dağılım nasıl değişiyor
    for (const t of SNAPS) {
      const q = softmax(snaps.get(t)![ix('robot')])
      const b = top(q)
      F.push({ ...base, word: 'robot', probs: q, tour: t, line: L.tour, cap: cap(`tur ${t} · "robot" sonrası`, `round ${t} · after "robot"`), stat: cap(`en olası "${VOCAB[b]}" ${pc(q[b], 'tr')}`, `top "${VOCAB[b]}" ${pc(q[b], 'en')}`), hold: t <= 3 ? 1 : 0.6 })
    }
    const qs = softmax(P[ix('şarj')])
    const bs = top(qs)
    F.push({ ...base, word: 'şarj', probs: qs, tour: TOURS, line: L.print, cap: cap(`"şarj" sonrası "${VOCAB[bs]}" ${pc(qs[bs], 'tr')}: günlükte hep böyle`, `after "şarj": "${VOCAB[bs]}" ${pc(qs[bs], 'en')}, as always in the log`), stat: cap(`${TOURS} tur sonra`, `after ${TOURS} rounds`), hold: 2.4 })
    const qr = softmax(P[ix('robot')])
    F.push({ ...base, word: 'robot', probs: qr, tour: TOURS, line: L.print, cap: cap('"robot" sonrası ise birkaç seçenek paylaşır', 'after "robot" several words share the chance'), stat: cap(`"şarj" ${pc(qr[ix('şarj')], 'tr')} · "durdu" ${pc(qr[ix('durdu')], 'tr')}`, `"şarj" ${pc(qr[ix('şarj')], 'en')} · "durdu" ${pc(qr[ix('durdu')], 'en')}`), hold: 2 })
    // yazma
    const steps = write(P, 24, seed, md)
    const text: string[] = []
    const lw = md === 1 ? L.top : L.die
    F.push({ ...base, word: '.', probs: steps[0].probs, tour: TOURS, text: [], line: L.seed, cap: cap(md ? 'yazma: hep en olası kelime' : `yazma: ağırlıklı zar (tohum ${seed})`, md ? 'writing: always the top word' : `writing: weighted die (seed ${seed})`), stat: cap('cümle başından (".") başla', 'start after a full stop'), hold: 1.6 })
    steps.forEach((s, i) => {
      text.push(VOCAB[s.pick])
      F.push({ ...base, word: s.prev, probs: s.probs, pick: s.pick, tour: TOURS, text: [...text], line: i < 2 ? (i === 0 ? L.q : lw) : lw, cap: cap(`"${s.prev}" sonrası ${md ? 'en olası' : 'zar'}: "${VOCAB[s.pick]}" (${pc(s.probs[s.pick], 'tr', 0)})`, `after "${s.prev}" the ${md ? 'top word' : 'die'}: "${VOCAB[s.pick]}" (${pc(s.probs[s.pick], 'en', 0)})`), stat: cap(`${i + 1}. kelime`, `word ${i + 1}`), hold: i < 3 ? 1.2 : 0.7 })
    })
    const nv = novelty(P, seed, md)
    const loopTxt = md === 1 ? SENTENCES.find((s) => text.join(' ').startsWith(s + ' .')) : undefined
    F.push({
      ...base, word: steps.at(-1)!.prev, probs: steps.at(-1)!.probs, pick: steps.at(-1)!.pick, tour: TOURS, text, line: L.out,
      cap: md ? cap('hep en olası kelime: aynı cümle tekrar tekrar', 'always the top word: the same sentence again and again') : cap(`zarla yazılan ${nv.n} cümle: ${pc(nv.frac, 'tr')} günlükte yok`, `${pc(nv.frac, 'en')} of ${nv.n} dice-written sentences are not in the log`),
      stat: md ? cap(loopTxt ? `döngü: "${loopTxt} ."` : 'döngü', loopTxt ? `loop: "${loopTxt} ."` : 'loop') : cap('model yalnız son kelimeye bakar', 'the model only sees the last word'),
      hold: 3,
    })
    return F
  },
}

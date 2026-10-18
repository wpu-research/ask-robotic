// Ders: rakam tanıma (softmax). Ayıklama hattındaki kamera kutu etiketindeki tek haneli numarayı 12×12 piksel olarak görür;
// 144 sayı 10 nörona girer, softmax olasılığa çevirir. 1.440 ağırlık sıfırdan, 3.000 örnekle birkaç turda öğrenilir.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

export const SIDE = 12
export const PIX = SIDE * SIDE
export const N_TRAIN = 3000
export const N_TEST = 500
const BATCH = 30
const LR = 0.1

/** 5×3 rakam şablonları (1 = parlak hücre). 9'un altı açık: 4 ile yalnız üst ortadaki hücrede ayrışır. */
export const GLYPHS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001001']

export interface Miss { img: Float32Array; y: number; pred: number }
export interface DigitFrame extends Frame {
  /** Gösterilen görüntü (144 piksel, 0..1). */
  img: Float32Array
  y: number
  /** Gösterilen görüntü için on olasılık (softmax). */
  probs: number[]
  /** Ağırlıklar [piksel·10 + rakam]; null: henüz yok. */
  W: Float32Array | null
  /** Ağırlık haritalarının ortak ölçeği (eğitim sonundaki en büyük |w|). */
  wmax: number
  seen: number
  round: number
  rounds: number
  /** Biten turların test sonucu (500'de doğru). */
  acc: number[]
  /** 144 sayılık şeridi göster. */
  flat?: boolean
  /** Vurgulanan nöron. */
  hi?: number
  miss?: Miss[]
  /** En çok karışan çift ve sayısı. */
  pair?: [number, number, number]
}

/** Etiket görüntüleri: şablon 2× büyütülür (10×6), 12×12'de kaydırılır (satır 0–1, sütun 3–4), gürültü eklenir. */
export function labels(noise = 0.35, seed = 10, n = N_TRAIN + N_TEST) {
  const r = rng(seed)
  const X = new Float32Array(n * PIX)
  const y = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    const d = Math.floor(r() * 10)
    y[i] = d
    const r0 = Math.floor(r() * 2), c0 = 3 + Math.floor(r() * 2)
    const g = GLYPHS[d]
    for (let a = 0; a < SIDE; a++) for (let b = 0; b < SIDE; b++) {
      const ga = a - r0, gb = b - c0
      const on = ga >= 0 && ga < 10 && gb >= 0 && gb < 6 && g[(ga >> 1) * 3 + (gb >> 1)] === '1' ? 1 : 0
      const v = on + noise * gauss(r)
      X[i * PIX + a * SIDE + b] = v < 0 ? 0 : v > 1 ? 1 : v
    }
  }
  return { X, y }
}

/** Softmax olasılıkları (W: [piksel·10 + k]). */
export function predict(W: Float32Array, bias: Float64Array, X: Float32Array, i: number): number[] {
  const z = Array.from(bias)
  const o = i * PIX
  for (let j = 0; j < PIX; j++) {
    const x = X[o + j]
    if (x === 0) continue
    const w = j * 10
    for (let k = 0; k < 10; k++) z[k] += x * W[w + k]
  }
  let m = -Infinity
  for (const v of z) if (v > m) m = v
  let s = 0
  for (let k = 0; k < 10; k++) { z[k] = Math.exp(z[k] - m); s += z[k] }
  return z.map((v) => v / s)
}
const argmax = (a: number[]) => a.reduce((bi, v, i) => (v > a[bi] ? i : bi), 0)

export interface TrainLog { batch: number; W: Float32Array; b: Float64Array }
/** Mini gruplarla (30) softmax eğitimi. onBatch her grup sonrası çağrılır; dönüş: test sonuçları. */
export function train(X: Float32Array, y: Int8Array, rounds: number, onBatch?: (round: number, batch: number, W: Float32Array, b: Float64Array) => void) {
  const W = new Float32Array(PIX * 10)
  const b = new Float64Array(10)
  const acc: number[] = []
  const G = new Float64Array(PIX * 10)
  const gb = new Float64Array(10)
  for (let t = 0; t < rounds; t++) {
    for (let i = 0, bi = 0; i < N_TRAIN; i += BATCH, bi++) {
      G.fill(0); gb.fill(0)
      for (let s = i; s < i + BATCH; s++) {
        const p = predict(W, b, X, s)
        p[y[s]] -= 1 // hata: olasılık − doğru cevap
        const o = s * PIX
        for (let j = 0; j < PIX; j++) {
          const x = X[o + j]
          if (x === 0) continue
          const w = j * 10
          for (let k = 0; k < 10; k++) G[w + k] += x * p[k]
        }
        for (let k = 0; k < 10; k++) gb[k] += p[k]
      }
      for (let q = 0; q < W.length; q++) W[q] -= (LR * G[q]) / BATCH
      for (let k = 0; k < 10; k++) b[k] -= (LR * gb[k]) / BATCH
      onBatch?.(t, bi, W, b)
    }
    acc.push(testCorrect(W, b, X, y))
  }
  return { W, b, acc }
}
export function testCorrect(W: Float32Array, b: Float64Array, X: Float32Array, y: Int8Array) {
  let ok = 0
  for (let i = N_TRAIN; i < N_TRAIN + N_TEST; i++) if (argmax(predict(W, b, X, i)) === y[i]) ok++
  return ok
}

const pct = (x: number, lang: 'tr' | 'en') => (lang === 'tr' ? `%${fmt(x * 100, 1, 'tr')}` : `${(x * 100).toFixed(1)}%`)

export const RAKAM_TANIMA: Lesson<DigitFrame> = {
  slug: 'rakam-tanima',
  n: 0,
  title: { tr: 'Rakam tanıma: makine nasıl görür?', en: 'Digit recognition: how a machine sees' },
  sub: { tr: '144 piksel, 10 nöron ve softmax: kutu etiketini okumak', en: '144 pixels, 10 neurons and softmax: reading a box label' },
  story: {
    tr: 'Ayıklama hattında robot kol, kutuları üzerlerindeki tek haneli etiket numarasına göre on ayrı rafa koyuyor. Kamera her etiketi 12×12 piksellik gri bir görüntü olarak görür: etiket biraz kaymış, görüntü karıncalı. Elimizde numarası bilinen 3.000 etiket görüntüsü var; model hiç görmediği 500 etikette sınanır.',
    en: 'On a sorting line a robot arm puts boxes on ten shelves by the single-digit number on their label. The camera sees each label as a 12×12 grey image: the label is a little shifted and the picture is grainy. We have 3,000 label images with known numbers; the model is tested on 500 labels it has never seen.',
  },
  how: [
    { tr: 'Her piksel bir sayıdır: 0 karanlık, 1 parlak. Satırlar art arda dizilince görüntü 144 sayılık bir liste olur; modelin gördüğü yalnız budur.', en: 'Every pixel is a number: 0 dark, 1 bright. Put the rows one after another and the image becomes a list of 144 numbers; that is all the model ever sees.' },
    { tr: 'Her rakam için bir nöron var. Nöron her pikseli kendi ağırlığıyla çarpıp toplar ve bir puan verir. Softmax on puanı toplamı %100 olan olasılıklara çevirir.', en: 'There is one neuron per digit. It multiplies every pixel by its own weight, adds everything up and gives a score. Softmax turns the ten scores into chances that add up to 100%.' },
    { tr: '1.440 ağırlığın hepsi sıfırdan başlar, yani her rakam önce %10 alır. 30 örneklik her grupta hata (olasılık eksi doğru cevap) her ağırlığı biraz iter.', en: 'All 1,440 weights start at zero, so every digit first gets 10%. After each group of 30 examples the error (chance minus the right answer) nudges every weight a little.' },
    { tr: 'Bir nöronun 144 ağırlığını yeniden 12×12 dizince ne aradığı görünür: yeşil "burası parlaksa benim rakamım", kırmızı "burası parlaksa değil". Sıfır nöronu yeşil bir halka ve kırmızı bir orta öğrenir.', en: 'Lay the 144 weights of a neuron back out as 12×12 and you see what it looks for: green means "bright here, my digit", red means "bright here, not mine". The zero neuron learns a green ring and a red middle.' },
    { tr: 'Şunu dene: gürültüyü 0,7 yap. Kamera kötüleşir, haritalar lekelenir ve test doğruluğu belirgin düşer.', en: 'Try this: set the noise to 0.7. The camera gets worse, the maps get blotchy and the test accuracy drops clearly.' },
  ],
  why: {
    tr: 'Depo ve kargo ayıklama hatlarında kamera; etiket, seri numarası ve sayaç okur. Bugünkü görüntü modelleri bu katmanlardan çok sayıda üst üste dizer: ilk katmanlar kenar ve küçük çizgileri, derindekiler halka, yüz ya da araba gibi şekilleri bulur.',
    en: 'In warehouse and parcel sorting lines cameras read labels, serial numbers and meters. Today’s vision models stack many layers like this one: the first layers find edges and small strokes, the deeper ones loops, faces or cars.',
  },
  file: 'rakam_tanima.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(10)'],
    ["S = ['111101101101111', '010110010010111',", '5×3 rakam şablonları: 0, 1', '5×3 digit templates: 0, 1'],
    ["    '111001111100111', '111001111001111', '101101111001001',", '2, 3, 4', '2, 3, 4'],
    ["    '111100111001111', '111100111101111', '111001001001001',", '5, 6, 7', '5, 6, 7'],
    ["    '111101111101111', '111101111001001']", '8, 9', '8, 9'],
    ['def label(d, noise=0.35):', 'kameradaki etiket', 'the label in the camera'],
    ['    img = np.zeros((12, 12))'],
    ['    r, c = rng.integers(0, 2), rng.integers(3, 5)', 'biraz kaymış', 'slightly shifted'],
    ['    g = np.array(list(S[d]), float).reshape(5, 3)'],
    ['    img[r:r + 10, c:c + 6] = np.kron(g, np.ones((2, 2)))', '2× büyüt', 'scale up 2×'],
    ['    noisy = img + rng.normal(0, noise, img.shape)', 'karıncalı görüntü', 'grainy image'],
    ['    return np.clip(noisy, 0, 1).ravel()', '144 sayı', '144 numbers'],
    ['y = rng.integers(0, 10, 3500)', 'etiket numaraları', 'label numbers'],
    ['X = np.array([label(d) for d in y])', '3.000 eğitim + 500 test', '3,000 train + 500 test'],
    ['W, b = np.zeros((144, 10)), np.zeros(10)', '1.440 ağırlık, hepsi 0', '1,440 weights, all 0'],
    ['for tour in range(3):'],
    ['    for i in range(0, 3000, 30):', "30'luk gruplar", 'groups of 30'],
    ['        x, t = X[i:i + 30], y[i:i + 30]'],
    ['        p = np.exp(x @ W + b); p /= p.sum(1, keepdims=True)', 'puanlar → softmax', 'scores → softmax'],
    ['        p[np.arange(30), t] -= 1', 'hata: olasılık − cevap', 'error: chance − answer'],
    ['        W -= 0.1 * x.T @ p / 30; b -= 0.1 * p.mean(0)', 'küçük adım', 'small step'],
    ['    pred = (X[3000:] @ W + b).argmax(1)', 'görmediği 500 etiket', '500 unseen labels'],
    ["    print(f'tur {tour + 1}:', (pred == y[3000:]).sum())", '500 içinde doğru', 'right out of 500'],
  ],
  params: [
    { key: 'rounds', label: { tr: 'Tur sayısı', en: 'Rounds' }, min: 1, max: 5, step: 1, value: 3 },
    { key: 'noise', label: { tr: 'Kamera gürültüsü', en: 'Camera noise' }, min: 0.1, max: 0.8, step: 0.05, value: 0.35 },
  ],
  run({ rounds = 3, noise = 0.35 }) {
    const R = Math.max(1, Math.round(rounds))
    const { X, y } = labels(noise)
    const view = (i: number) => X.subarray(i * PIX, (i + 1) * PIX)
    // gösterilen örnek: test kümesindeki ilk 8
    let show = N_TRAIN
    while (y[show] !== 8) show++
    const img = view(show)
    const snaps: Array<{ t: number; bi: number; W: Float32Array; b: Float64Array; first?: boolean }> = []
    const keep = (t: number, bi: number) => (t === 0 ? bi < 4 || bi % 4 === 3 : bi % 10 === 9)
    const { W, b, acc } = train(X, y, R, (t, bi, Wt, bt) => { if (keep(t, bi)) snaps.push({ t, bi, W: Wt.slice(), b: bt.slice() }) })
    // ortak ölçek: son ağırlıkların |w| değerlerinin %98'lik dilimi (birkaç uç değer haritayı soldurmasın)
    const sorted = Array.from(W, Math.abs).sort((a, c) => a - c)
    const wmax = sorted[Math.floor(sorted.length * 0.98)]
    const F: DigitFrame[] = []
    const ten = new Array(10).fill(0.1)
    const base = { img, y: 8, wmax, rounds: R }
    const stat0 = cap(`${N_TRAIN} eğitim · ${N_TEST} test · gürültü ${fmt(noise, 2, 'tr')}`, `${N_TRAIN} train · ${N_TEST} test · noise ${noise.toFixed(2)}`)
    F.push({ ...base, probs: ten, W: null, seen: 0, round: 0, acc: [], line: 13, cap: cap('kameradan bir etiket: 8', 'a label from the camera: 8'), stat: stat0, hold: 2 })
    F.push({ ...base, probs: ten, W: null, seen: 0, round: 0, acc: [], flat: true, line: 12, cap: cap('satırlar art arda: 144 sayı', 'rows one after another: 144 numbers'), stat: stat0, hold: 1.8 })
    F.push({ ...base, probs: ten, W: new Float32Array(PIX * 10), seen: 0, round: 0, acc: [], line: 15, cap: cap('1.440 ağırlık sıfır: her rakam %10', '1,440 weights at zero: every digit 10%'), stat: stat0, hold: 1.8 })
    // ilk grup satır satır: eğitimdeki ilk örnek
    const first = view(0), y0 = y[0]
    const z0 = { img: first, y: y0, wmax, rounds: R, W: new Float32Array(PIX * 10), seen: 0, round: 1, acc: [] as number[] }
    F.push({ ...z0, probs: ten, line: 18, cap: cap(`ilk grup: 30 etiket, ilki ${y0}`, `first group: 30 labels, the first is ${y0}`), stat: stat0, hold: 1.2 })
    F.push({ ...z0, probs: ten, line: 19, cap: cap('puanlar hepsi 0 → softmax: her rakam %10', 'all scores 0 → softmax: every digit 10%'), stat: stat0, hold: 1.2 })
    F.push({ ...z0, probs: ten.map((v, k) => (k === y0 ? v - 1 : v)), line: 20, cap: cap(`hata: doğru rakamda 0,1 − 1 = −0,9, diğerlerinde +0,1`, `error: −0.9 on the right digit, +0.1 on the others`), stat: stat0, hold: 1.4 })
    const fmtSeen = (n: number, lang: 'tr' | 'en') => String(n).replace(/\B(?=(\d{3})+$)/g, lang === 'tr' ? '.' : ',')
    snaps.forEach((s, i) => {
      const probs = predict(s.W, s.b, X, show)
      const seen = (s.bi + 1) * BATCH
      const done = acc.slice(0, s.t)
      const c = cap(`tur ${s.t + 1} · ${fmtSeen(seen, 'tr')} / 3.000 örnek`, `round ${s.t + 1} · ${fmtSeen(seen, 'en')} / 3,000 examples`)
      const st = cap(`"8" için: 8 → ${pct(probs[8], 'tr')}`, `for the "8": 8 → ${pct(probs[8], 'en')}`)
      F.push({ ...base, probs, W: s.W, seen, round: s.t + 1, acc: done, line: 21, cap: c, stat: st, hold: i === 0 ? 1.4 : s.t === 0 && s.bi < 4 ? 0.9 : 0.4 })
      if (s.bi === N_TRAIN / BATCH - 1) {
        const ok = acc[s.t]
        F.push({ ...base, probs, W: s.W, seen, round: s.t + 1, acc: acc.slice(0, s.t + 1), line: 23, cap: cap(`tur ${s.t + 1} bitti: görmediği 500 etiketten ${ok} doğru`, `round ${s.t + 1} done: ${ok} of 500 unseen labels right`), stat: cap(`test ${pct(ok / N_TEST, 'tr')}`, `test ${pct(ok / N_TEST, 'en')}`), hold: 1.6 })
      }
    })
    // sonuç: sıfır nöronu ve hatalar
    const probs = predict(W, b, X, show)
    const fin = { ...base, probs, W, seen: N_TRAIN, round: R, acc }
    F.push({ ...fin, hi: 0, line: 15, cap: cap('sıfır nöronu: yeşil halka, kırmızı orta', 'the zero neuron: a green ring, a red middle'), stat: cap('ortası parlak olan 8, sıfır puanını düşürür', 'an 8 has a bright middle, which costs the zero points'), hold: 2.4 })
    F.push({ ...fin, hi: 8, line: 19, cap: cap(`"8" nöronu: 8 için ${pct(probs[8], 'tr')}`, `the "8" neuron: ${pct(probs[8], 'en')} for the 8`), stat: cap('ortadaki çizgi yeşil', 'the middle bar is green'), hold: 2 })
    const miss: Miss[] = []
    const conf = new Map<string, number>()
    for (let i = N_TRAIN; i < N_TRAIN + N_TEST; i++) {
      const pr = argmax(predict(W, b, X, i))
      if (pr === y[i]) continue
      if (miss.length < 6) miss.push({ img: view(i), y: y[i], pred: pr })
      const k = [Math.min(pr, y[i]), Math.max(pr, y[i])].join('-')
      conf.set(k, (conf.get(k) ?? 0) + 1)
    }
    let pair: [number, number, number] | undefined
    for (const [k, n] of conf) if (!pair || n > pair[2]) { const [a, c] = k.split('-').map(Number); pair = [a, c, n] }
    const ok = acc[R - 1]
    F.push({
      ...fin, miss, pair, line: 23,
      cap: cap(`${R} tur sonra: 500 etiketten ${ok} doğru (${pct(ok / N_TEST, 'tr')})`, `after ${R} round${R > 1 ? 's' : ''}: ${ok} of 500 labels right (${pct(ok / N_TEST, 'en')})`),
      stat: pair ? cap(`en çok karışan: ${pair[0]} ile ${pair[1]} (${pair[2]} kez)`, `most mixed up: ${pair[0]} and ${pair[1]} (${pair[2]}×)`) : cap('hiç hata yok', 'no mistakes'),
      hold: 3,
    })
    return F
  },
}

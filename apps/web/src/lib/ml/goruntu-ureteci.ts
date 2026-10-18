// Ders: görüntü üreteci (otokodlayıcı). Kodlayıcı 8×8 etiket görüntüsünü (64 piksel) 2 sayıya sıkıştırır, kod çözücü 2 sayıdan
// 64 piksel boyar. Etiket verilmeden rakamlar haritada kendi türlerinin yanında toplanır; boş bir noktadan yeni bir etiket boyanır.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'
import { B, agirlikHistleri, erkenDurdurma, etkinlesmeHist, gecmisGrafik, type EgitimRaporu } from './egitim/rapor'

export const SIDE = 8
export const PIX = 64
export const NS = 400
export const DIGITS = [0, 2, 3, 7]
/** 7×5 bit maskeleri (Python kodundaki onaltılık sayılar): 0, 2, 3, 7. */
export const MASKS = [0x3a318c62e, 0x3a211111f, 0x78217043e, 0x7c2222108]
const HID = 12, D = 2, BATCH = 16, LR = 0.01

export interface GenFrame extends Frame {
  X: Float32Array
  k: Int8Array
  /** Tüm görüntülerin kodları [2i, 2i+1]; null: ağ henüz yok. */
  Z: Float32Array | null
  box: [number, number, number, number]
  step: number
  steps: number
  err: number[]
  /** Girdi ve boyanan hâli (yeniden üretim). */
  sel?: number
  rec?: Float32Array
  /** Haritada seçili nokta ve oradan boyanan görüntü. */
  probe?: [number, number]
  paint?: Float32Array
  /** Örnek görüntüler ızgarası (giriş karesi). */
  samples?: boolean
  /** İki küme arasındaki yürüyüş. */
  walk?: Float32Array[]
  walkPts?: Array<[number, number]>
  /** Yeni noktaya en yakın eğitim kodunun uzaklığı. */
  near?: number
}

/** 7×5 maskenin (r, c) hücresi. */
export const bit = (m: number, r: number, c: number) => Math.floor(m / 2 ** (34 - (r * 5 + c))) % 2

/** 400 etiket görüntüsü: şablon 8×8'in sol üstüne (sütun 1–5), gürültü 0,3, 0..1'e kırpılır. */
export function digits(seed = 13) {
  const r = rng(seed)
  const X = new Float32Array(NS * PIX), k = new Int8Array(NS)
  for (let i = 0; i < NS; i++) {
    const c = Math.floor(r() * 4)
    k[i] = c
    for (let a = 0; a < SIDE; a++) for (let b = 0; b < SIDE; b++) {
      const on = a < 7 && b >= 1 && b < 6 ? bit(MASKS[c], a, b - 1) : 0
      const v = on + 0.3 * gauss(r)
      X[i * PIX + a * SIDE + b] = v < 0 ? 0 : v > 1 ? 1 : v
    }
  }
  return { X, k }
}

export interface Net { W1: Float64Array; W2: Float64Array; W3: Float64Array; W4: Float64Array }
const tanh = Math.tanh
/** Kodlayıcı: 64 → 12 (tanh) → 2. */
export function encode(n: Net, X: Float32Array, i: number, h = new Float64Array(HID)): [number, number] {
  const o = i * PIX
  h.fill(0)
  for (let j = 0; j < PIX; j++) { const x = X[o + j]; if (x === 0) continue; for (let u = 0; u < HID; u++) h[u] += x * n.W1[j * HID + u] }
  let z0 = 0, z1 = 0
  for (let u = 0; u < HID; u++) { h[u] = tanh(h[u]); z0 += h[u] * n.W2[u * D]; z1 += h[u] * n.W2[u * D + 1] }
  return [z0, z1]
}
/** Kod çözücü: 2 → 12 (tanh) → 64 (sigmoid). */
export function decode(n: Net, z0: number, z1: number, g = new Float64Array(HID), out = new Float32Array(PIX)) {
  for (let u = 0; u < HID; u++) g[u] = tanh(z0 * n.W3[u] + z1 * n.W3[HID + u])
  for (let j = 0; j < PIX; j++) { let s = 0; for (let u = 0; u < HID; u++) s += g[u] * n.W4[u * PIX + j]; out[j] = 1 / (1 + Math.exp(-s)) }
  return out
}
/** Tüm veride piksel başına ortalama kare hata ve kodlar. */
export function evaluate(n: Net, X: Float32Array) {
  const Z = new Float32Array(NS * 2)
  const out = new Float32Array(PIX), h = new Float64Array(HID), g = new Float64Array(HID)
  let e = 0
  for (let i = 0; i < NS; i++) {
    const [a, b] = encode(n, X, i, h)
    Z[2 * i] = a; Z[2 * i + 1] = b
    decode(n, a, b, g, out)
    for (let j = 0; j < PIX; j++) e += (out[j] - X[i * PIX + j]) ** 2
  }
  return { Z, err: e / (NS * PIX) }
}

/**
 * Mini gruplarla (16) Adam benzeri adımlarla eğitim; onStep(t, net) her adım sonrası. `pool` verilirse grup yalnız bu
 * görüntülerden çekilir (eğitim paneli doğrulama görüntülerini dışarıda tutar); verilmezse bütün görüntülerden.
 */
export function train(X: Float32Array, steps: number, seed = 13, onStep?: (t: number, n: Net) => void, pool?: number[]) {
  const r = rng(seed + 7)
  const init = (a: number, b: number) => Float64Array.from({ length: a * b }, () => gauss(r) / Math.sqrt(a))
  const n: Net = { W1: init(PIX, HID), W2: init(HID, D), W3: init(D, HID), W4: init(HID, PIX) }
  const P = [n.W1, n.W2, n.W3, n.W4]
  const M = P.map((p) => new Float64Array(p.length)), V = P.map((p) => new Float64Array(p.length))
  const G = P.map((p) => new Float64Array(p.length))
  const h = new Float64Array(HID), g = new Float64Array(HID), y = new Float64Array(PIX), d = new Float64Array(PIX)
  const dg = new Float64Array(HID), dh = new Float64Array(HID)
  onStep?.(0, n)
  for (let t = 1; t <= steps; t++) {
    for (const q of G) q.fill(0)
    for (let s = 0; s < BATCH; s++) {
      const i = pool ? pool[Math.floor(r() * pool.length)] : Math.floor(r() * NS), o = i * PIX
      const [z0, z1] = encode(n, X, i, h)
      for (let u = 0; u < HID; u++) g[u] = tanh(z0 * n.W3[u] + z1 * n.W3[HID + u])
      for (let j = 0; j < PIX; j++) {
        let a = 0
        for (let u = 0; u < HID; u++) a += g[u] * n.W4[u * PIX + j]
        y[j] = 1 / (1 + Math.exp(-a))
        d[j] = (y[j] - X[o + j]) / BATCH // çapraz entropi + sigmoid: türev y − x
      }
      // geri yayılım: kod çözücü
      for (let u = 0; u < HID; u++) {
        let s2 = 0
        for (let j = 0; j < PIX; j++) { G[3][u * PIX + j] += g[u] * d[j]; s2 += d[j] * n.W4[u * PIX + j] }
        dg[u] = s2 * (1 - g[u] * g[u])
      }
      let dz0 = 0, dz1 = 0
      for (let u = 0; u < HID; u++) { G[2][u] += z0 * dg[u]; G[2][HID + u] += z1 * dg[u]; dz0 += dg[u] * n.W3[u]; dz1 += dg[u] * n.W3[HID + u] }
      // kodlayıcı
      for (let u = 0; u < HID; u++) {
        G[1][u * D] += h[u] * dz0; G[1][u * D + 1] += h[u] * dz1
        dh[u] = (dz0 * n.W2[u * D] + dz1 * n.W2[u * D + 1]) * (1 - h[u] * h[u])
      }
      for (let j = 0; j < PIX; j++) { const x = X[o + j]; if (x === 0) continue; for (let u = 0; u < HID; u++) G[0][j * HID + u] += x * dh[u] }
    }
    for (let q = 0; q < 4; q++) {
      const p = P[q], m = M[q], v = V[q], gr = G[q]
      for (let j = 0; j < p.length; j++) {
        m[j] += 0.1 * (gr[j] - m[j]); v[j] += 0.001 * (gr[j] * gr[j] - v[j])
        p[j] -= (LR * m[j]) / (Math.sqrt(v[j]) + 1e-8)
      }
    }
    onStep?.(t, n)
  }
  return n
}
const copy = (n: Net): Net => ({ W1: n.W1.slice(), W2: n.W2.slice(), W3: n.W3.slice(), W4: n.W4.slice() })

/** Bir görüntü alt kümesinde piksel başına ortalama kare hata (yeniden üretim). */
export function subsetErr(n: Net, X: Float32Array, idx: number[]) {
  const out = new Float32Array(PIX), h = new Float64Array(HID), g = new Float64Array(HID)
  let e = 0
  for (const i of idx) {
    const [a, b] = encode(n, X, i, h)
    decode(n, a, b, g, out)
    for (let j = 0; j < PIX; j++) e += (out[j] - X[i * PIX + j]) ** 2
  }
  return e / (idx.length * PIX)
}

/**
 * Eğitim paneli: her 4. etiket (i % 4 = 3) doğrulamaya ayrılır, ağ yalnız kalan 300 etiketle eğitilir. Her 10 adımda (adım 0
 * dahil) eğitim ve doğrulama yeniden üretim hatası; katman ağırlık dağılımları ve son kod haritası.
 */
export function generatorReport({ steps = 300, seed = 13 }: Record<string, number>): EgitimRaporu {
  const S = Math.max(10, Math.round(steps))
  const { X, k } = digits(13)
  const all = Array.from({ length: NS }, (_, i) => i)
  const tr = all.filter((i) => i % 4 !== 3), va = all.filter((i) => i % 4 === 3)
  const h = { step: [] as number[], loss: [] as number[], val_loss: [] as number[] }
  const snapAt = new Set([0, Math.round(S / 3 / 10) * 10, Math.round((2 * S) / 3 / 10) * 10, S])
  const snaps: Array<{ label: string; layers: Float64Array[] }> = []
  const net = train(X, S, seed, (t, n) => {
    if (t % 10 === 0) { h.step.push(t); h.loss.push(subsetErr(n, X, tr)); h.val_loss.push(subsetErr(n, X, va)) }
    if (snapAt.has(t)) snaps.push({ label: String(t), layers: [n.W1.slice(), n.W2.slice(), n.W3.slice(), n.W4.slice()] })
  }, tr)
  const ev = evaluate(net, X)
  const own = ownShare(ev.Z, k), sp = spread(ev.Z, k)
  const z0 = Array.from({ length: NS }, (_, i) => ev.Z[2 * i]), z1 = Array.from({ length: NS }, (_, i) => ev.Z[2 * i + 1])
  const m = Math.max(...z0.map(Math.abs), ...z1.map(Math.abs), 1e-6)
  const r: EgitimRaporu = {
    kind: 'sinir-agi', model: 'otokodlayıcı 64-12-2-12-64 (tanh, sigmoid)', seed, hyper: { lr: LR, batch: BATCH, steps: S, train: tr.length, val: va.length },
    history: { x: 'step', cols: h }, final: [], charts: [],
  }
  r.final = [
    { key: 'loss', label: B('eğitim hatası (piksel MSE)', 'training error (pixel MSE)'), value: h.loss.at(-1)!, fmt: 4 },
    { key: 'val_loss', label: B('doğrulama hatası (piksel MSE)', 'validation error (pixel MSE)'), value: h.val_loss.at(-1)!, fmt: 4 },
    { key: 'gap', label: B('doğrulama − eğitim', 'validation − training'), value: h.val_loss.at(-1)! - h.loss.at(-1)!, fmt: 4 },
    { key: 'own_share', label: B('kendi türüne en yakın kod', 'codes nearest own kind'), value: own, fmt: 'pct' },
    { key: 'intra', label: B('aynı tür ort. uzaklık', 'mean distance, same kind'), value: sp.intra, fmt: 3 },
    { key: 'inter', label: B('farklı tür ort. uzaklık', 'mean distance, other kind'), value: sp.inter, fmt: 3 },
  ]
  r.charts = [
    gecmisGrafik(r, 'loss', B('Yeniden üretim hatası', 'Reconstruction error'), [['loss', B('eğitim', 'train'), 1], ['val_loss', B('doğrulama', 'validation'), 0, true]], { yLabel: B('piksel MSE', 'pixel MSE'), marker: erkenDurdurma(h.step, h.val_loss) }),
    { kind: 'scatter', id: 'latent', title: B('Kod haritası (2 sayı), renk = gizli tür', 'Code map (2 numbers), colour = hidden kind'), xLabel: B('z₀', 'z₀'), yLabel: B('z₁', 'z₁'), points: z0.map((v, i) => [v, z1[i], k[i]]) },
    { ...etkinlesmeHist([{ label: 'z₀', values: z0 }, { label: 'z₁', values: z1 }], -m, m), title: B('Kod dağılımı (z₀, z₁)', 'Code distribution (z₀, z₁)'), xLabel: B('kod değeri', 'code value') },
    ...agirlikHistleri(snaps, ['64→12', '12→2', '2→12', '12→64']),
  ]
  return r
}

/** Ortalama uzaklık: aynı tür içindeki kod çiftleri ve farklı türler arası. */
export function spread(Z: Float32Array, k: Int8Array) {
  let si = 0, ni = 0, so = 0, no = 0
  for (let i = 0; i < NS; i++) for (let j = i + 1; j < NS; j++) {
    const dd = Math.hypot(Z[2 * i] - Z[2 * j], Z[2 * i + 1] - Z[2 * j + 1])
    if (k[i] === k[j]) { si += dd; ni++ } else { so += dd; no++ }
  }
  return { intra: si / ni, inter: so / no }
}
export function centers(Z: Float32Array, k: Int8Array) {
  const C = DIGITS.map(() => [0, 0, 0])
  for (let i = 0; i < NS; i++) { C[k[i]][0] += Z[2 * i]; C[k[i]][1] += Z[2 * i + 1]; C[k[i]][2]++ }
  return C.map(([a, b, c]) => [a / c, b / c] as [number, number])
}
/** Kendi türünün merkezine en yakın düşen görüntü oranı. */
export function ownShare(Z: Float32Array, k: Int8Array) {
  const C = centers(Z, k)
  let ok = 0
  for (let i = 0; i < NS; i++) {
    let bj = 0, bd = Infinity
    C.forEach((c, j) => { const dd = (Z[2 * i] - c[0]) ** 2 + (Z[2 * i + 1] - c[1]) ** 2; if (dd < bd) { bd = dd; bj = j } })
    if (bj === k[i]) ok++
  }
  return ok / NS
}
function boxOf(Z: Float32Array): [number, number, number, number] {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (let i = 0; i < NS; i++) { x0 = Math.min(x0, Z[2 * i]); x1 = Math.max(x1, Z[2 * i]); y0 = Math.min(y0, Z[2 * i + 1]); y1 = Math.max(y1, Z[2 * i + 1]) }
  const px = (x1 - x0) * 0.08 + 1e-3, py = (y1 - y0) * 0.08 + 1e-3
  return [x0 - px, x1 + px, y0 - py, y1 + py]
}
/** Haritada eğitim kodlarından uzak, "2" kümesinin kenarında boş bir nokta. */
export function emptySpot(Z: Float32Array, k: Int8Array) {
  const C = centers(Z, k)
  const c2 = C[1]
  const b = boxOf(Z)
  const span = Math.max(b[1] - b[0], b[3] - b[2])
  const thr = 0.06 * span
  const nearest = (x: number, y: number) => { let m = Infinity; for (let i = 0; i < NS; i++) m = Math.min(m, Math.hypot(Z[2 * i] - x, Z[2 * i + 1] - y)); return m }
  for (let t = 0.02; t < 0.5; t += 0.01) for (let a = 0; a < 16; a++) {
    const x = c2[0] + t * span * Math.cos((a * Math.PI) / 8), y = c2[1] + t * span * Math.sin((a * Math.PI) / 8)
    const nd = nearest(x, y)
    if (nd > thr) return { pt: [x, y] as [number, number], near: nd, span }
  }
  return { pt: c2, near: nearest(c2[0], c2[1]), span }
}

export const GORUNTU_URETECI: Lesson<GenFrame> = {
  slug: 'goruntu-ureteci',
  n: 0,
  title: { tr: 'Görüntü üreteci: sıkıştır ve boya', en: 'An image generator: squeeze and paint' },
  sub: { tr: 'Otokodlayıcı: 64 piksel → 2 sayı → 64 piksel', en: 'An autoencoder: 64 pixels → 2 numbers → 64 pixels' },
  story: {
    tr: 'Ayıklama hattının kamerası 400 kutu etiketi kaydetti: 0, 2, 3 ve 7 numaralı raflar, her biri 8×8 piksel, karıncalı. Yeni kamera yazılımını denemek için daha fazla etiket görüntüsü gerekiyor. Ağa hangi etiketin hangi numara olduğunu hiç söylemeden, görüntüleri iki sayıya sıkıştırıp geri boyamayı öğretiyoruz; sonra boyayan yarısı tek başına yeni etiketler çiziyor.',
    en: "The sorting line's camera recorded 400 box labels: shelves 0, 2, 3 and 7, each 8×8 pixels and grainy. To test new camera software we need more label images. Without ever telling the network which label is which number, we teach it to squeeze each image into two numbers and paint it back; then the painting half draws new labels on its own.",
  },
  how: [
    { tr: 'Kodlayıcı 64 pikseli 12 gizli nörondan geçirip yalnız 2 sayıya indirir: haritada bir nokta.', en: 'The encoder passes 64 pixels through 12 hidden neurons down to just 2 numbers: a spot on a map.' },
    { tr: 'Kod çözücü 2 sayıdan yeniden 64 piksel boyar. Başta yalnız gri bir sis boyar.', en: 'The decoder paints 64 pixels back from 2 numbers. At first it paints only a grey fog.' },
    { tr: 'Her adımda 16 etiket sıkıştırılır, boyanır, gerçeğiyle karşılaştırılır; hata geri yayılımla iki ağa da dağıtılır ve Adam tarzı bir adım atılır.', en: 'Each step squeezes 16 labels, paints them and compares them with the real ones; backpropagation shares the error over both networks and an Adam-style step follows.' },
    { tr: 'Kimse türleri söylemediği hâlde benzer etiketler haritada yan yana toplanır. Boş bir noktayı kod çözücüye verince hiçbir eğitim görüntüsünde olmayan yeni bir etiket çıkar; iki küme arasında yürüyünce bir rakam ötekine erir.', en: 'Nobody names the kinds, yet similar labels gather side by side on the map. Give the decoder an empty spot and out comes a new label that is in none of the training images; walk between two clusters and one digit melts into another.' },
    { tr: 'Şunu dene: adım sayısını 10 yap. Hata ancak yarıya iner, kümeler birbirine yakın kalır ve boyanan etiketler bulanıktır. Tohumu değiştirince harita başka türlü yerleşir ama türler yine ayrılır.', en: 'Try this: set the steps to 10. The error only halves, the clusters stay close together and the painted labels are blurry. Change the seed and the map is laid out differently, yet the kinds still separate.' },
  ],
  why: {
    tr: 'Robotikte görüntüyü küçük bir koda sıkıştırmak; anomali tespitinde (iyi parçayı iyi boyayan ağ, kusurlu parçayı kötü boyar), kamera verisinin hızlı aktarılmasında ve eğitim için sentetik veri üretmekte kullanılır. Stable Diffusion gibi üreteçler çok daha büyük bir sayı uzayında çalışır, gürültüden başlar ve istemle yönlendirilir; temel fikir aynı: sayılar girer, pikseller çıkar.',
    en: 'In robotics, squeezing an image into a small code is used for anomaly detection (a network that paints good parts well paints faulty ones badly), for sending camera data quickly and for making synthetic training data. Generators like Stable Diffusion work in a much bigger space of numbers, start from noise and are steered by a prompt; the core idea is the same: numbers in, pixels out.',
  },
  file: 'goruntu_ureteci.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(13)'],
    ['T = [0x3a318c62e, 0x3a211111f, 0x78217043e, 0x7c2222108]', '7×5 bit: 0, 2, 3, 7', '7×5 bits: 0, 2, 3, 7'],
    ['bits = [(t >> np.arange(34, -1, -1)) & 1 for t in T]'],
    ['k = rng.integers(0, 4, 400)', '400 etiket, tür gizli', '400 labels, kind hidden'],
    ['X = np.zeros((400, 8, 8))'],
    ['X[:, :7, 1:6] = np.array(bits)[k].reshape(400, 7, 5)'],
    ['X = X.reshape(400, 64) + rng.normal(0, .3, (400, 64))', 'karıncalı kamera', 'grainy camera'],
    ['X = X.clip(0, 1)'],
    ['sh = [(64, 12), (12, 2), (2, 12), (12, 64)]', '64 → 12 → 2 → 12 → 64', '64 → 12 → 2 → 12 → 64'],
    ['P = [rng.normal(0, a ** -.5, (a, b)) for a, b in sh]', 'rastgele ağırlıklar', 'random weights'],
    ['M = [0 * p for p in P]; V = [0 * p for p in P]', 'Adam hafızası', 'Adam memory'],
    ['tr = np.flatnonzero(np.arange(400) % 4 != 3)', '300 eğitim etiketi', '300 training labels'],
    ['va = np.flatnonzero(np.arange(400) % 4 == 3)', '100 doğrulama etiketi', '100 validation labels'],
    ['def err(A):', 'yeniden üretim hatası', 'reconstruction error'],
    ['    z = np.tanh(A @ P[0]) @ P[1]'],
    ['    y = 1 / (1 + np.exp(-np.tanh(z @ P[2]) @ P[3]))'],
    ['    return float(((y - A) ** 2).mean())'],
    ["history = {'step': [], 'loss': [], 'val_loss': []}", 'eğitim geçmişi', 'training history'],
    ['for t in range(301):', 'adım 0: eğitimsiz ağ', 'step 0: untrained net'],
    ['    if t % 10 == 0:', 'her 10 adımda kaydet', 'record every 10 steps'],
    ['        r = [t, err(X[tr]), err(X[va])]'],
    ['        for k, v in zip(history, r): history[k].append(v)'],
    ['    x = X[tr[rng.integers(0, len(tr), 16)]]', '16 etiketlik grup', 'a group of 16 labels'],
    ['    h = np.tanh(x @ P[0]); z = h @ P[1]', 'sıkıştır: 2 sayı', 'squeeze: 2 numbers'],
    ['    g = np.tanh(z @ P[2]); y = 1 / (1 + np.exp(-g @ P[3]))', 'boya: 64 piksel', 'paint: 64 pixels'],
    ['    d = (y - x) / 16', 'gerçeğiyle karşılaştır', 'compare with the real one'],
    ['    dg = d @ P[3].T * (1 - g ** 2); dz = dg @ P[2].T', 'hata geriye akar', 'the error flows back'],
    ['    dh = dz @ P[1].T * (1 - h ** 2)'],
    ['    G = [x.T @ dh, h.T @ dz, z.T @ dg, g.T @ d]'],
    ['    for p, m, v, q in zip(P, M, V, G):'],
    ['        m += .1 * (q - m); v += .001 * (q * q - v)'],
    ['        p -= .01 * m / (np.sqrt(v) + 1e-8)', 'Adam tarzı adım', 'Adam-style step'],
    ["    if t % 100 < 1: print(t, f'{((y - x) ** 2).mean():.3f}')", 'piksel başına hata', 'error per pixel'],
    ["for k in history: print(f'{k:<10}{history[k][-1]:>10.4f}')", 'son ölçümler', 'final metrics'],
    ['import csv'],
    ["with open('egitim_gecmisi.csv', 'w', newline='') as f:", 'satır başına 10 adım', 'one row per 10 steps'],
    ['    csv.writer(f).writerows([list(history),'],
    ['                             *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ["    for k in ('loss', 'val_loss'):"],
    ["        plt.plot(history['step'], history[k], label=k)"],
    ["    plt.xlabel('step'); plt.legend(); plt.show()"],
    ['except ImportError:'],
    ["    print('matplotlib yok: grafik atlandı')"],
  ],
  params: [
    { key: 'steps', label: { tr: 'Eğitim adımı', en: 'Training steps' }, min: 10, max: 600, step: 10, value: 300 },
    { key: 'seed', label: { tr: 'Başlangıç tohumu', en: 'Start seed' }, min: 1, max: 30, step: 1, value: 13 },
  ],
  report: generatorReport,
  run({ steps = 300, seed = 13 }) {
    const S = Math.max(10, Math.round(steps))
    const { X, k } = digits(13)
    // önce sık (sisten rakama), sonra seyrek kareler
    const at = new Set([0, 1, 2, 3, 4, 6, 8, 10, 13, 16, 20, 25, 30, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 400, 500, 600, S].filter((t) => t <= S))
    const snaps: Array<{ t: number; n: Net }> = []
    const net = train(X, S, seed, (t, n) => { if (at.has(t)) snaps.push({ t, n: copy(n) }) })
    const F: GenFrame[] = []
    const sel = 0
    const base = { X, k, steps: S }
    const stat0 = cap('400 etiket · 64 piksel → 2 sayı', '400 labels · 64 pixels → 2 numbers')
    F.push({ ...base, Z: null, box: [0, 1, 0, 1], step: 0, err: [], samples: true, line: 8, cap: cap('kameradan 400 etiket (0, 2, 3, 7), türleri ağa söylenmez', '400 labels from the camera (0, 2, 3, 7); the network is never told the kind'), stat: stat0, hold: 2.2 })
    const errs: number[] = []
    let last: ReturnType<typeof evaluate> | null = null
    snaps.forEach((s, i) => {
      const ev = evaluate(s.n, X)
      last = ev
      errs.push(ev.err)
      const rec = decode(s.n, ev.Z[2 * sel], ev.Z[2 * sel + 1])
      const fr = { ...base, Z: ev.Z, box: boxOf(ev.Z), step: s.t, err: errs.slice(), sel, rec, probe: [ev.Z[2 * sel], ev.Z[2 * sel + 1]] as [number, number] }
      const c = cap(`adım ${s.t} · piksel başına hata ${fmt(ev.err, 3, 'tr')}`, `step ${s.t} · error per pixel ${ev.err.toFixed(3)}`)
      if (i === 0) {
        F.push({ ...fr, line: 10, cap: cap('rastgele ağırlıklar: kodlar yığılır, boyanan gri bir sis', 'random weights: codes pile up, the painting is a grey fog'), stat: c, hold: 2 })
        F.push({ ...fr, line: 24, cap: cap('kodlayıcı: 64 piksel → 2 sayı (haritada nokta)', 'encoder: 64 pixels → 2 numbers (a spot on the map)'), stat: c, hold: 1.4 })
        F.push({ ...fr, line: 25, cap: cap('kod çözücü: 2 sayı → 64 piksel', 'decoder: 2 numbers → 64 pixels'), stat: c, hold: 1.4 })
        F.push({ ...fr, line: 26, cap: cap('boyananı gerçeğiyle karşılaştır', 'compare the painting with the real one'), stat: c, hold: 1.2 })
        F.push({ ...fr, line: 27, cap: cap('hata geri yayılır', 'the error flows back'), stat: c, hold: 1 })
      } else F.push({ ...fr, line: s.t <= 3 ? 32 : 33, cap: c, stat: cap(`hata ${fmt(errs[0], 3, 'tr')} → ${fmt(ev.err, 3, 'tr')}`, `error ${errs[0].toFixed(3)} → ${ev.err.toFixed(3)}`), hold: s.t <= 4 ? 1 : 0.6 })
    })
    const ev = last!
    const box = boxOf(ev.Z)
    const fin = { ...base, Z: ev.Z, box, step: S, err: errs }
    const own = ownShare(ev.Z, k)
    const sp = spread(ev.Z, k)
    F.push({ ...fin, line: 24, cap: cap(`harita: etiketlerin %${Math.round(own * 100)}'i kendi türünün merkezine en yakın`, `the map: ${Math.round(own * 100)}% of labels sit closest to the centre of their own kind`), stat: cap(`ortalama uzaklık: aynı tür ${fmt(sp.intra, 2, 'tr')}, farklı tür ${fmt(sp.inter, 2, 'tr')}`, `mean distance: same kind ${sp.intra.toFixed(2)}, other kind ${sp.inter.toFixed(2)}`), hold: 2.6 })
    const es = emptySpot(ev.Z, k)
    const paint = decode(net, es.pt[0], es.pt[1])
    F.push({ ...fin, probe: es.pt, paint, near: es.near, line: 25, cap: cap(`boş bir nokta (${fmt(es.pt[0], 2, 'tr')}; ${fmt(es.pt[1], 2, 'tr')}): yeni bir etiket`, `an empty spot (${es.pt[0].toFixed(2)}, ${es.pt[1].toFixed(2)}): a new label`), stat: cap(`en yakın eğitim kodu ${fmt(es.near, 2, 'tr')} uzakta`, `nearest training code ${es.near.toFixed(2)} away`), hold: 2.6 })
    // yürüyüş: sıfırlardan yedilere düz yol
    const C = centers(ev.Z, k)
    const a = C[0], b = C[3]
    const walk: Float32Array[] = [], walkPts: Array<[number, number]> = []
    const NW = 8
    for (let i = 0; i < NW; i++) {
      const t = i / (NW - 1)
      const pt: [number, number] = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
      walkPts.push(pt); walk.push(decode(net, pt[0], pt[1]))
      F.push({ ...fin, probe: pt, paint: walk[i], walk: walk.slice(), walkPts: walkPts.slice(), line: 25, cap: cap(`0'lardan 7'lere düz yol: ${i + 1} / ${NW}`, `a straight path from the 0s to the 7s: ${i + 1} / ${NW}`), stat: cap('her kare kod çözücünün boyadığı', 'every picture painted by the decoder'), hold: i === 0 ? 1.4 : 0.9 })
    }
    F.push({ ...fin, probe: walkPts.at(-1), paint: walk.at(-1), walk, walkPts, line: 33, cap: cap(`${S} adım: hata ${fmt(errs[0], 3, 'tr')} → ${fmt(errs.at(-1)!, 3, 'tr')}`, `${S} steps: error ${errs[0].toFixed(3)} → ${errs.at(-1)!.toFixed(3)}`), stat: cap('2 sayıyla boyanan etiket biraz bulanık kalır', 'painted from 2 numbers, labels stay a little blurry'), hold: 3 })
    return F
  },
}

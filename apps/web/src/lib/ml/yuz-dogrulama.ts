// Ders: yüz doğrulama. Sinir ağı her yüzü 64 sayılık bir gömme vektörüne çevirir; iki vektörün kosinüs benzerliği eşiği geçerse
// "aynı kişi". Eşik yükselince yanlış kabul (FAR) azalır, yanlış ret (FRR) artar; laboratuvar kapısındaki robot bu dengeyi seçer.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

export const DIM = 64
export const PEOPLE = 6
export const PER = 15

const unit = (v: number[]) => { const n = Math.hypot(...v) || 1; return v.map((x) => x / n) }
const dotp = (a: number[], b: number[]) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s }

/** Gömmeler: herkesin ortak bir "yüz" yönü + kişiye özgü yön; her fotoğrafa ışık/poz gürültüsü (σ 0,4–1,2). */
export function embeddings(seed = 1) {
  const r = rng(seed)
  const g = unit(Array.from({ length: DIM }, () => gauss(r)))
  const C = Array.from({ length: PEOPLE }, () => { const u = unit(Array.from({ length: DIM }, () => gauss(r))); return unit(u.map((x, d) => 0.8 * g[d] + x)) })
  const lab: number[] = [], sig: number[] = [], X: number[][] = []
  for (let p = 0; p < PEOPLE; p++) for (let k = 0; k < PER; k++) lab.push(p)
  lab.forEach(() => sig.push(0.8 * (0.5 + r())))
  lab.forEach((p, i) => X.push(unit(C[p].map((c) => c + (sig[i] * gauss(r)) / Math.sqrt(DIM)))))
  return { X, lab, sig }
}

/** Bütün çiftlerin benzerlikleri: aynı kişi (gerçek) ve farklı kişi (sahtekâr). */
export function pairScores(X: number[][], lab: number[]) {
  const gen: number[] = [], imp: number[] = []
  for (let i = 0; i < X.length; i++) for (let j = i + 1; j < X.length; j++) (lab[i] === lab[j] ? gen : imp).push(dotp(X[i], X[j]))
  return { gen, imp }
}
export const rate = (gen: number[], imp: number[], th: number) => ({
  far: imp.filter((s) => s >= th).length / imp.length,
  frr: gen.filter((s) => s < th).length / gen.length,
})
/** Eşik süpürme: 0, 0,01, …, 1. */
export function sweep(gen: number[], imp: number[]) {
  const th: number[] = [], far: number[] = [], frr: number[] = []
  for (let k = 0; k <= 100; k++) { const t = k / 100, q = rate(gen, imp, t); th.push(t); far.push(q.far); frr.push(q.frr) }
  let e = 0
  for (let k = 0; k <= 100; k++) if (Math.abs(far[k] - frr[k]) < Math.abs(far[e] - frr[e])) e = k
  return { th, far, frr, eer: e / 100 }
}

/** 2B izdüşüm (sahne için): ilk iki temel bileşen, kuvvet yinelemesiyle. */
export function project2d(X: number[][]): Array<[number, number]> {
  const n = X.length, d = X[0].length
  const mu = Array.from({ length: d }, (_, k) => X.reduce((s, x) => s + x[k], 0) / n)
  const Z = X.map((x) => x.map((v, k) => v - mu[k]))
  const comps: number[][] = []
  for (let c = 0; c < 2; c++) {
    let v = unit(Array.from({ length: d }, (_, k) => Math.sin(k * 1.7 + c * 2.3 + 0.5)))
    for (let it = 0; it < 60; it++) {
      const w = new Array(d).fill(0)
      for (const z of Z) { const a = dotp(z, v); for (let k = 0; k < d; k++) w[k] += a * z[k] }
      for (const q of comps) { const a = dotp(w, q); for (let k = 0; k < d; k++) w[k] -= a * q[k] }
      v = unit(w)
    }
    comps.push(v)
  }
  return Z.map((z) => [dotp(z, comps[0]), dotp(z, comps[1])])
}

export interface Attempt { probe: number; claim: number; who: number; cos: number; ok: boolean }
export interface FaceFrame extends Frame {
  P2: Array<[number, number]>
  lab: number[]
  /** Haritada gösterilen örnek sayısı. */
  shown: number
  gen: number[]
  imp: number[]
  /** Histogramda gösterilen: 0 hiç, 1 aynı kişi, 2 ikisi. */
  hist: 0 | 1 | 2
  th?: number
  userTh: number
  far: number[]
  frr: number[]
  /** Eğride çizilen nokta sayısı (süpürme). */
  sweepN: number
  eer?: number
  pair?: { a: number; b: number; cos: number }
  attempt?: Attempt
  /** Kayıt şablonu olarak kullanılan örnekler. */
  enrolled?: number[]
}

export const YUZ_DOGRULAMA: Lesson<FaceFrame> = {
  slug: 'yuz-dogrulama',
  n: 0,
  title: { tr: 'Yüz doğrulama: gömme, benzerlik, eşik', en: 'Face verification: embeddings, similarity, threshold' },
  sub: { tr: 'Kosinüs benzerliği ve yanlış kabul / yanlış ret dengesi', en: 'Cosine similarity and the false accept / false reject trade-off' },
  story: {
    tr: 'Laboratuvar kapısındaki robot, içeri girmek isteyenin yüzünü kayıtlı yüzle karşılaştırıyor. Laboratuvarda 6 kişi çalışıyor; her birinden farklı ışık ve açılarda 15 fotoğraf var, toplam 90. Bir sinir ağı her fotoğrafı 64 sayılık bir gömme vektörüne çevirmiş (burada benzetim: kişi başına bir merkez yön, üstüne fotoğrafın kalitesine göre gürültü). 4005 fotoğraf çiftinin 630\'u aynı kişiye, 3375\'i farklı kişilere ait.',
    en: 'The robot at the lab door compares the face of whoever wants to enter with the enrolled face. Six people work in the lab; there are 15 photos of each in different light and angles, 90 in total. A neural network has turned every photo into a 64-number embedding vector (simulated here: one centre direction per person plus noise depending on photo quality). Of the 4005 photo pairs, 630 belong to the same person and 3375 to different people.',
  },
  how: [
    { tr: 'Her yüz 64 boyutlu bir birim vektördür. İki yüzün benzerliği, vektörler arasındaki açının kosinüsüdür: 1 aynı yön, 0 dik.', en: 'Every face is a 64-dimensional unit vector. The similarity of two faces is the cosine of the angle between their vectors: 1 means the same direction, 0 perpendicular.' },
    { tr: 'Bütün çiftler iki gruba ayrılır: aynı kişi (ortalama yaklaşık 0,6) ve farklı kişi (yaklaşık 0,2). İki dağılım biraz örtüşür: kötü ışıkta çekilmiş fotoğraflar.', en: 'All pairs fall into two groups: same person (around 0.6 on average) and different people (around 0.2). The two distributions overlap a little: photos taken in poor light.' },
    { tr: 'Benzerlik eşiği geçerse kapı açılır. Eşiği geçen farklı kişi çiftlerinin oranı FAR (yanlış kabul), eşiğin altında kalan aynı kişi çiftlerinin oranı FRR\'dir (yanlış ret).', en: 'If the similarity is above the threshold the door opens. The share of different-person pairs above the threshold is the FAR (false accept rate); the share of same-person pairs below it is the FRR (false reject rate).' },
    { tr: 'Eşik 0\'dan 1\'e süpürülür: FAR hep azalır, FRR hep artar. İkisinin eşit olduğu nokta EER\'dir; sistemin tek sayılık karnesi.', en: 'Sweep the threshold from 0 to 1: FAR keeps falling and FRR keeps rising. The point where they are equal is the EER, a one-number report card for the system.' },
    { tr: 'Şunu dene: eşiği 0,3\'e indir, yabancıların dörtte biri içeri girer. 0,55\'e çıkar, çalışanların neredeyse üçte biri kapıda kalır.', en: 'Try this: lower the threshold to 0.3 and a quarter of strangers get in. Raise it to 0.55 and almost a third of the staff are left at the door.' },
  ],
  why: {
    tr: 'Telefon kilidi, pasaport kapıları ve bina girişleri aynı adımla çalışır: yüzü vektöre çevir, kayıtlı vektörle kosinüs benzerliğini karşılaştır. Eşiği güvenlik ister: kasa dairesinde yanlış kabul pahalıdır, telefon kilidinde yanlış ret can sıkar. Robotlar da aynı yöntemle sahiplerini, ziyaretçileri ve hatta nesneleri yeniden tanır.',
    en: 'Phone unlock, passport gates and building entrances all work with the same step: turn the face into a vector and compare its cosine similarity with the enrolled vector. Security sets the threshold: a false accept is expensive at a bank vault, a false reject is annoying on a phone. Robots use the same method to recognise their owners, visitors and even objects again.',
  },
  file: 'yuz.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(1)'],
    ['D, P, K = 64, 6, 15', 'boyut, kişi, kişi başı foto', 'dimension, people, photos each'],
    ['unit = lambda v: v / np.linalg.norm(v, axis=-1)[..., None]', 'birim vektör', 'unit vector'],
    ['g = unit(rng.normal(size=D))', 'ortak "yüz" yönü', 'shared "face" direction'],
    ['C = unit(0.8 * g + unit(rng.normal(size=(P, D))))', 'kişi merkezleri', 'person centres'],
    ['lab = np.repeat(np.arange(P), K)'],
    ['sig = 0.8 * (0.5 + rng.random(P * K))', 'foto kalitesi (ışık, açı)', 'photo quality (light, angle)'],
    ['N = rng.normal(size=(P * K, D)) / np.sqrt(D)'],
    ['X = unit(C[lab] + sig[:, None] * N)', '90 gömme vektörü', '90 embeddings'],
    ['S = X @ X.T', 'kosinüs benzerliği', 'cosine similarity'],
    ['i, j = np.triu_indices(P * K, 1)', 'bütün çiftler', 'all pairs'],
    ['same = lab[i] == lab[j]'],
    ['gen, imp = S[i, j][same], S[i, j][~same]', 'aynı / farklı kişi', 'same / different person'],
    ["print(f'aynı: {gen.mean():.2f}, farklı: {imp.mean():.2f}')"],
    ['for th in [0.3, 0.42, 0.55]:', 'eşik süpürme', 'threshold sweep'],
    ['    far = (imp >= th).mean()', 'yanlış kabul', 'false accept'],
    ['    frr = (gen < th).mean()', 'yanlış ret', 'false reject'],
    ["    print(f'eşik {th}: FAR {far:.1%}, FRR {frr:.1%}')"],
    ['tpl = unit(X[lab == 2][:5].mean(0))', 'kayıt şablonu: 5 foto', 'enrolled template: 5 photos'],
    ['print(X[lab == 2][-1] @ tpl, X[lab == 4][0] @ tpl)', 'kapıda iki deneme', 'two tries at the door'],
  ],
  params: [{ key: 'th', label: { tr: 'Eşik (kosinüs)', en: 'Threshold (cosine)' }, min: 0.1, max: 0.9, step: 0.01, value: 0.42 }],
  run({ th = 0.42 }) {
    const { X, lab } = embeddings()
    const P2 = project2d(X)
    const { gen, imp } = pairScores(X, lab)
    const sw = sweep(gen, imp)
    const q = rate(gen, imp, th)
    const base = { P2, lab, gen, imp, far: sw.far, frr: sw.frr, userTh: th }
    const F: FaceFrame[] = []
    const stat = cap(`90 yüz · 64 boyut · eşik ${fmt(th, 2, 'tr')}`, `90 faces · 64 dimensions · threshold ${th.toFixed(2)}`)
    const pc = (x: number) => fmt(x * 100, 1, 'tr'), pe = (x: number) => (x * 100).toFixed(1)
    // 1) gömmeler kişi kişi
    for (let p = 1; p <= PEOPLE; p++) F.push({ ...base, shown: p * PER, hist: 0, sweepN: 0, line: p === 1 ? 5 : 9, cap: cap(`kişi ${p}: 15 fotoğraf → 15 gömme`, `person ${p}: 15 photos → 15 embeddings`), stat, hold: p === 1 ? 2 : 0.8 })
    // 2) iki örnek çift
    const a = 0, b = 7, c = 3 * PER + 2
    const sab = X[a].reduce((s, x, k) => s + x * X[b][k], 0), sac = X[a].reduce((s, x, k) => s + x * X[c][k], 0)
    F.push({ ...base, shown: 90, hist: 0, sweepN: 0, pair: { a, b, cos: sab }, line: 10, cap: cap(`aynı kişi: kosinüs ${fmt(sab, 2, 'tr')}`, `same person: cosine ${sab.toFixed(2)}`), stat, hold: 1.8 })
    F.push({ ...base, shown: 90, hist: 0, sweepN: 0, pair: { a, b: c, cos: sac }, line: 10, cap: cap(`farklı kişi: kosinüs ${fmt(sac, 2, 'tr')}`, `different people: cosine ${sac.toFixed(2)}`), stat, hold: 1.8 })
    // 3) dağılımlar
    const mg = gen.reduce((s, x) => s + x, 0) / gen.length, mi = imp.reduce((s, x) => s + x, 0) / imp.length
    F.push({ ...base, shown: 90, hist: 1, sweepN: 0, line: 13, cap: cap(`630 aynı kişi çifti: ortalama ${fmt(mg, 2, 'tr')}`, `630 same-person pairs: mean ${mg.toFixed(2)}`), stat, hold: 1.8 })
    F.push({ ...base, shown: 90, hist: 2, sweepN: 0, line: 14, cap: cap(`3375 farklı kişi çifti: ortalama ${fmt(mi, 2, 'tr')}`, `3375 different-person pairs: mean ${mi.toFixed(2)}`), stat, hold: 2 })
    // 4) eşik süpürme
    for (let k = 0; k <= 100; k += 2) {
      const first = k <= 4
      F.push({ ...base, shown: 90, hist: 2, th: k / 100, sweepN: k + 1, line: first ? (k === 0 ? 15 : k === 2 ? 16 : 17) : 16,
        cap: cap(`eşik ${fmt(k / 100, 2, 'tr')}: FAR %${pc(sw.far[k])}, FRR %${pc(sw.frr[k])}`, `threshold ${(k / 100).toFixed(2)}: FAR ${pe(sw.far[k])}%, FRR ${pe(sw.frr[k])}%`), stat, hold: first ? 1.2 : 0.3 })
    }
    const e = Math.round(sw.eer * 100)
    F.push({ ...base, shown: 90, hist: 2, th: sw.eer, sweepN: 101, eer: sw.eer, line: 18, cap: cap(`EER: eşik ${fmt(sw.eer, 2, 'tr')}, FAR ≈ FRR ≈ %${pc((sw.far[e] + sw.frr[e]) / 2)}`, `EER: threshold ${sw.eer.toFixed(2)}, FAR ≈ FRR ≈ ${pe((sw.far[e] + sw.frr[e]) / 2)}%`), stat, hold: 2 })
    F.push({ ...base, shown: 90, hist: 2, th, sweepN: 101, eer: sw.eer, line: 18, cap: cap(`seçilen eşik ${fmt(th, 2, 'tr')}: FAR %${pc(q.far)}, FRR %${pc(q.frr)}`, `chosen threshold ${th.toFixed(2)}: FAR ${pe(q.far)}%, FRR ${pe(q.frr)}%`), stat, hold: 2.2 })
    // 5) kapıda doğrulama: kişi 3'ün ilk 5 fotoğrafı şablon
    const claim = 2
    const enrolled = [0, 1, 2, 3, 4].map((k) => claim * PER + k)
    const tpl = unit(Array.from({ length: DIM }, (_, d) => enrolled.reduce((s, i) => s + X[i][d], 0)))
    const own = Array.from({ length: PER - 5 }, (_, k) => claim * PER + 5 + k)
    // en zor fotoğraf: şablona en az benzeyen (kötü ışık / açı)
    const worst = own.reduce((m, i) => (dotp(X[i], tpl) < dotp(X[m], tpl) ? i : m), own[0])
    const tries: Array<{ probe: number; who: number }> = [{ probe: own.reduce((m, i) => (dotp(X[i], tpl) > dotp(X[m], tpl) ? i : m), own[0]), who: claim }, { probe: 4 * PER, who: 4 }, { probe: worst, who: claim }]
    F.push({ ...base, shown: 90, hist: 2, th, sweepN: 101, eer: sw.eer, enrolled, line: 19, cap: cap('kayıt: kişi 3\'ün 5 fotoğrafının ortalaması = şablon', 'enrolment: the mean of 5 photos of person 3 = template'), stat, hold: 1.8 })
    tries.forEach(({ probe, who }, n) => {
      const cs = dotp(X[probe], tpl), ok = cs >= th
      const right = ok === (who === claim)
      const txt: [string, string] = who === claim
        ? (ok ? ['kişi 3 → kapı açıldı', 'person 3 → door opens'] : ['kişi 3 ama reddedildi (yanlış ret)', 'person 3 but rejected (false reject)'])
        : (ok ? ['kişi 5 kişi 3 diye girdi (yanlış kabul)', 'person 5 got in as person 3 (false accept)'] : ['kişi 5, kişi 3 değil → ret', 'person 5 is not person 3 → rejected'])
      F.push({ ...base, shown: 90, hist: 2, th, sweepN: 101, eer: sw.eer, enrolled, attempt: { probe, claim, who, cos: cs, ok }, line: 20,
        cap: cap(`deneme ${n + 1}: kosinüs ${fmt(cs, 2, 'tr')} ${cs >= th ? '≥' : '<'} ${fmt(th, 2, 'tr')} · ${txt[0]}`, `try ${n + 1}: cosine ${cs.toFixed(2)} ${cs >= th ? '≥' : '<'} ${th.toFixed(2)} · ${txt[1]}`), stat, hold: right ? 2 : 2.4 })
    })
    F.push({ ...base, shown: 90, hist: 2, th, sweepN: 101, eer: sw.eer, line: 18, cap: cap(`eşik ${fmt(th, 2, 'tr')}: 3375 yabancı denemesinden ${Math.round(q.far * imp.length)} kabul, 630 çalışan denemesinden ${Math.round(q.frr * gen.length)} ret`, `threshold ${th.toFixed(2)}: ${Math.round(q.far * imp.length)} of 3375 stranger tries accepted, ${Math.round(q.frr * gen.length)} of 630 staff tries rejected`), stat: cap(`FAR %${pc(q.far)} · FRR %${pc(q.frr)} · EER eşiği ${fmt(sw.eer, 2, 'tr')}`, `FAR ${pe(q.far)}% · FRR ${pe(q.frr)}% · EER threshold ${sw.eer.toFixed(2)}`), hold: 3 })
    return F
  },
}

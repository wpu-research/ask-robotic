// Ders: öneri sistemi, matris ayrıştırma. Robotik atölye platformunda 300 öğrenci ve 60 robot projesi; her öğrenci yalnızca ~12
// projeyi denemiş. Öğrenciye ve projeye birkaç gizli sayı verilir; iki ok sigmoid ile beğeni olasılığına döner, gradyan inişiyle itilir.
import { cap, choice, fmt, gauss, rng, type Frame, type Lesson } from './core'
import { B, erkenDurdurma, gecmisGrafik, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'

export interface RecData {
  /** Gizli gerçek: öğrenci zevki ve proje tarzı (2 boyut). */
  taste: number[][]
  style: number[][]
  /** Denenen (öğrenci, proje, beğendi mi, gerçek olasılık). */
  train: Array<[number, number, number, number]>
  test: Array<[number, number, number, number]>
  /** Her öğrencinin denediği projeler. */
  seen: Set<number>[]
  /** Projenin gizli tarz grubu (0–5, açıya göre): sahnede renk. */
  group: number[]
  /** Gizli beğenilerde mümkün en iyi doğruluk (gerçek olasılığı bilen tahminci). */
  bayes: number
}

export interface RecFrame extends Frame {
  data: RecData
  /** Projelerin öğrenilen konumu (ilk iki boyut). */
  V: Array<[number, number]>
  k: number
  epoch: number
  /** Turlara göre gizli beğenilerde doğruluk. */
  acc: number[]
  rounds: number
  /** Sonuç: önerilen ilk 3'ün beğenilme oranı ve rastgele denenmemiş proje. */
  top3?: number
  rand?: number
  /** Öne çıkan bir eğitim çifti (satır satır gösterim). */
  pair?: [number, number, number, number]
}

const sig = (z: number) => 1 / (1 + Math.exp(-z))

/** 300 öğrenci × 60 proje; her öğrenci 12 proje dener (3600 çift: 3000 eğitim, 600 gizli). */
export function workshopData(seed = 15): RecData {
  const r = rng(seed)
  const taste = Array.from({ length: 300 }, () => [gauss(r), gauss(r)])
  const style = Array.from({ length: 60 }, () => [gauss(r), gauss(r)])
  const pairs: Array<[number, number, number, number]> = []
  const seen: Set<number>[] = []
  for (let u = 0; u < 300; u++) {
    const vs = choice(r, 60, 12)
    seen.push(new Set(vs))
    for (const v of vs) {
      const p = sig(5 * (taste[u][0] * style[v][0] + taste[u][1] * style[v][1]))
      pairs.push([u, v, r() < p ? 1 : 0, p])
    }
  }
  for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]] }
  const train = pairs.slice(0, 3000), test = pairs.slice(3000)
  const bayes = test.reduce((s, q) => s + Math.max(q[3], 1 - q[3]), 0) / test.length
  const group = style.map(([a, b]) => Math.floor(((Math.atan2(b, a) + Math.PI) / (2 * Math.PI)) * 6) % 6)
  return { taste, style, train, test, seen, group, bayes }
}

/** Matris ayrıştırma (lojistik, k gizli boyut). Her turdan sonra gizli beğenilerde doğruluk. */
export function factorize(d: RecData, k: number, rounds: number, seed = 16, onEpoch?: (e: number, U: Float64Array, V: Float64Array, acc: number) => void) {
  const r = rng(seed)
  const U = Float64Array.from({ length: 300 * k }, () => 0.1 * gauss(r))
  const V = Float64Array.from({ length: 60 * k }, () => 0.1 * gauss(r))
  const lr = 0.1, reg = 0.01
  const dot = (u: number, v: number) => { let s = 0; for (let j = 0; j < k; j++) s += U[u * k + j] * V[v * k + j]; return s }
  const accuracy = () => d.test.reduce((s, [u, v, y]) => s + ((sig(dot(u, v)) > 0.5 ? 1 : 0) === y ? 1 : 0), 0) / d.test.length
  const acc: number[] = []
  onEpoch?.(0, U, V, accuracy())
  for (let e = 1; e <= rounds; e++) {
    for (const [u, v, y] of d.train) {
      const err = sig(dot(u, v)) - y
      for (let j = 0; j < k; j++) {
        const a = U[u * k + j], b = V[v * k + j]
        U[u * k + j] = a - lr * (err * b + reg * a)
        V[v * k + j] = b - lr * (err * a + reg * b)
      }
    }
    acc.push(accuracy())
    onEpoch?.(e, U, V, acc[acc.length - 1])
  }
  // öneri: her öğrenciye denemediği projelerden en güçlü eşleşen 3'ü; "beğenir" = gerçek beğeni olasılığı > 0,5
  let hit = 0, n = 0, rh = 0, rn = 0
  for (let u = 0; u < 300; u++) {
    const cand: Array<[number, number]> = []
    for (let v = 0; v < 60; v++) if (!d.seen[u].has(v)) {
      const likes = d.taste[u][0] * d.style[v][0] + d.taste[u][1] * d.style[v][1] > 0 ? 1 : 0
      cand.push([dot(u, v), likes]); rh += likes; rn++
    }
    cand.sort((a, b) => b[0] - a[0])
    for (let i = 0; i < 3; i++) { hit += cand[i][1]; n++ }
  }
  return { U, V, acc, top3: hit / n, rand: rh / rn }
}

/** Çiftlerde beğeni olasılıkları (σ(U·V)) ve gerçek beğeniler. */
function pairProbs(pairs: RecData['train'], U: Float64Array, V: Float64Array, k: number) {
  const p: number[] = [], y: number[] = []
  for (const [u, v, l] of pairs) { let s = 0; for (let j = 0; j < k; j++) s += U[u * k + j] * V[v * k + j]; p.push(sig(s)); y.push(l) }
  return { p, y }
}
/** Ortalama ikili çapraz entropi ve 0,5 eşiğinde doğruluk. */
function lossAcc(pairs: RecData['train'], U: Float64Array, V: Float64Array, k: number): [number, number] {
  const { p, y } = pairProbs(pairs, U, V, k)
  let ll = 0, ok = 0
  p.forEach((q, i) => { ll -= y[i] ? Math.log(q) : Math.log(1 - q); if ((q > 0.5 ? 1 : 0) === y[i]) ok++ })
  return [ll / p.length, ok / p.length]
}

/** Eğitim paneli: her turdan sonra eğitim (3000) ve gizli (600) beğenilerde kayıp ve doğruluk; sonda gizli beğenilerde ROC/PR. */
export function recReport({ rounds = 100, k = 2 }: Record<string, number>): EgitimRaporu {
  const R = Math.max(1, Math.round(rounds)), K = Math.max(1, Math.round(k))
  const d = workshopData()
  const h = { epoch: [] as number[], loss: [] as number[], acc: [] as number[], val_loss: [] as number[], val_acc: [] as number[] }
  let last: { U: Float64Array; V: Float64Array } | null = null
  const res = factorize(d, K, R, 16, (e, U, V) => {
    last = { U, V }
    if (e === 0) return
    const [lt, at] = lossAcc(d.train, U, V, K), [lv, av] = lossAcc(d.test, U, V, K)
    h.epoch.push(e); h.loss.push(lt); h.acc.push(at); h.val_loss.push(lv); h.val_acc.push(av)
  })
  const { U, V } = last!
  const te = pairProbs(d.test, U, V, K)
  const blk = siniflandirmaBlok({ y: te.y, pred: te.p.map((q) => (q > 0.5 ? 1 : 0)), labels: ['beğenmez', 'beğenir'], scores: te.p, threshold: 0.5, pos: B('beğenir', 'likes'), neg: B('beğenmez', 'dislikes'), prefix: 'test_' })
  const r: EgitimRaporu = {
    kind: 'siniflandirma', model: `lojistik matris ayrıştırma, k = ${K}`, seed: 16, hyper: { lr: 0.1, reg: 0.01, k: K, rounds: R, train: d.train.length, test: d.test.length },
    history: { x: 'epoch', cols: h }, final: [], confusion: blk.confusion, scores: blk.scores, charts: [],
  }
  r.final = [
    ...blk.final,
    { key: 'bayes', label: B('mümkün en iyi doğruluk', 'best possible accuracy'), value: d.bayes, fmt: 'pct' },
    { key: 'top3', label: B('ilk 3 öneri zevke uyuyor', 'top-3 picks suit the taste'), value: res.top3, fmt: 'pct' },
    { key: 'random', label: B('rastgele proje uyuyor', 'random project suits'), value: res.rand, fmt: 'pct' },
  ]
  const acc = gecmisGrafik(r, 'acc', B('Doğruluk: eğitim ve gizli beğeniler', 'Accuracy: training and hidden likes'), [['acc', B('eğitim', 'train'), 1], ['val_acc', B('gizli (test)', 'hidden (test)'), 0, true]], { yLabel: B('doğruluk', 'accuracy') })
  acc.series.push({ key: 'bayes', label: B('mümkün en iyi', 'best possible'), values: h.epoch.map(() => d.bayes), tone: 3, dash: true })
  r.charts = [
    gecmisGrafik(r, 'loss', B('Kayıp (ikili çapraz entropi)', 'Loss (binary cross-entropy)'), [['loss', B('eğitim', 'train'), 1], ['val_loss', B('gizli (test)', 'hidden (test)'), 0, true]], { xLabel: B('tur', 'round'), marker: erkenDurdurma(h.epoch, h.val_loss) }),
    { ...acc, xLabel: B('tur', 'round') },
    ...blk.charts,
  ]
  return r
}

export const ONERI_SISTEMI: Lesson<RecFrame> = {
  slug: 'oneri-sistemi',
  n: 0,
  title: { tr: 'Öneri sistemi: hangi robot projesi sana uygun?', en: 'Recommender: which robot project suits you?' },
  sub: { tr: 'Matris ayrıştırma: öğrencilere ve projelere gizli sayılar', en: 'Matrix factorisation: hidden numbers for students and projects' },
  story: {
    tr: 'Bir robotik atölye platformunda 300 öğrenci ve 60 robot projesi var (çizgi izleyen, robot kol, drone, sumo…). Her öğrencinin gizli bir zevki, her projenin gizli bir tarzı var; her öğrenci yalnızca 12 projeyi denemiş. Algoritmanın gördüğü tek şey: kim hangi denediği projeyi beğendi. 3000 deneme eğitime gider, 600\'ü saklanır; başarı bu gizli beğenilerde ölçülür.',
    en: 'A robotics workshop platform has 300 students and 60 robot projects (line followers, robot arms, drones, sumo bots…). Every student has a hidden taste and every project a hidden style; each student has tried only 12 projects. All the algorithm sees is who liked which of the projects they tried. 3000 tries go to training and 600 are held back; success is measured on those hidden likes.',
  },
  how: [
    { tr: 'Her öğrenciye ve her projeye k sayı verilir (k = 2 ise haritada birer ok). Başta hepsi sıfıra yakın rastgele.', en: 'Every student and every project gets k numbers (with k = 2, an arrow on a map). They start as small random values.' },
    { tr: 'Denenen her çift için iki okun iç çarpımı sigmoid ile beğeni olasılığına döner.', en: 'For every tried pair, the dot product of the two arrows becomes a like probability through the sigmoid.' },
    { tr: 'Olasılık gerçekle karşılaştırılır ve iki ok da hata kadar itilir: gradyan inişi. Bütün yöntemin adı matris ayrıştırma.', en: 'The probability is compared with what happened, and both arrows are nudged by the error: gradient descent. The whole method is called matrix factorisation.' },
    { tr: 'Öneri: her öğrenciye denemediği projelerden en güçlü eşleşen 3 tanesi.', en: 'Recommendation: for each student, the three untried projects with the strongest match.' },
    { tr: 'Şunu dene: gizli boyutu 1 yap; harita çizgiye iner ve doğruluk düşer. Turları azalt: eğri mümkün en iyiye yaklaşamaz.', en: 'Try this: set the hidden size to 1; the map collapses to a line and accuracy drops. Cut the rounds: the curve never gets near the best possible.' },
  ],
  why: {
    tr: 'Video, müzik ve alışveriş akışlarının çekirdeği budur; gerçek sistemler kişi ve içerik başına yüzlerce sayı ve izleme süresi gibi ek sinyaller kullanır. Robotikte aynı fikir, bir robot filosunda hangi görevin hangi robota uyduğunu ya da bir öğrenciye sıradaki dersi önermeyi öğrenebilir.',
    en: 'This is the core of video, music and shopping feeds; real systems use hundreds of numbers per person and item, plus signals like watch time. In robotics the same idea can learn which task suits which robot in a fleet, or which lesson to suggest to a student next.',
  },
  file: 'oneri.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(15)'],
    ['taste = rng.normal(0, 1, (300, 2))', 'gizli öğrenci zevki', 'hidden student taste'],
    ['style = rng.normal(0, 1, (60, 2))', 'gizli proje tarzı', 'hidden project style'],
    ['sig = lambda z: 1 / (1 + np.exp(-z))'],
    ['tried = [(u, v) for u in range(300)', 'herkes 12 proje dener', 'everyone tries 12'],
    ['         for v in rng.choice(60, 12, replace=False)]'],
    ['like = {(u, v): rng.random() < sig(5 * taste[u] @ style[v])'],
    ['        for u, v in tried}'],
    ['rng.shuffle(tried)'],
    ['train, test = tried[:3000], tried[3000:]', '600 gizli beğeni', '600 hidden likes'],
    ['k, lr = 2, 0.1', 'gizli boyut, adım', 'hidden size, step'],
    ['U = rng.normal(0, .1, (300, k))', 'öğrenci okları', 'student arrows'],
    ['V = rng.normal(0, .1, (60, k))', 'proje okları', 'project arrows'],
    ['def scores(pairs):', 'çiftlerde olasılık ve gerçek', 'probability and truth on pairs'],
    ['    u, v = np.array(pairs).T'],
    ['    y = np.array([like[q] for q in pairs], float)'],
    ['    return sig((U[u] * V[v]).sum(1)), y'],
    ['def olc(pairs):', 'kayıp ve doğruluk', 'loss and accuracy'],
    ['    p, y = scores(pairs)'],
    ['    ll = -(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()'],
    ['    return ll, ((p > .5) == y).mean()'],
    ["history = {c: [] for c in ['epoch', 'loss', 'acc',"],
    ["                          'val_loss', 'val_acc']}", 'eğitim geçmişi', 'training history'],
    ['for epoch in range(1, 101):'],
    ['    for u, v in train:'],
    ['        err = sig(U[u] @ V[v]) - like[(u, v)]', 'olasılık − gerçek', 'probability − truth'],
    ['        U[u], V[v] = (U[u] - lr * (err * V[v] + .01 * U[u]),', 'iki oku it', 'nudge both arrows'],
    ['                      V[v] - lr * (err * U[u] + .01 * V[v]))'],
    ['    r = [epoch, *olc(train), *olc(test)]', 'eğitim ve gizli beğeniler', 'training and hidden likes'],
    ['    for c, v in zip(history, r): history[c].append(float(v))'],
    ['    if epoch in (1, 25, 100):'],
    ['        ok = [(sig(U[u] @ V[v]) > .5) == like[(u, v)]'],
    ['              for u, v in test]'],
    ['        print(epoch, f"{np.mean(ok):.1%}")', 'gizli beğenilerde doğru', 'right on hidden likes'],
    ["for c in history: print(f'{c:<10}{history[c][-1]:>10.4f}')", 'son ölçümler', 'final metrics'],
    ['import csv'],
    ["with open('egitim_gecmisi.csv', 'w', newline='') as f:", 'satır başına bir tur', 'one row per round'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ["    for c in ('acc', 'val_acc'): plt.plot(history['epoch'], history[c], label=c)"],
    ["    plt.xlabel('epoch'); plt.legend(); plt.show()"],
    ['except ImportError:'],
    ["    print('matplotlib yok: grafik atlandı')"],
  ],
  params: [
    { key: 'rounds', label: { tr: 'Tur sayısı', en: 'Rounds' }, min: 10, max: 200, step: 10, value: 100 },
    { key: 'k', label: { tr: 'Gizli boyut (k)', en: 'Hidden size (k)' }, min: 1, max: 4, step: 1, value: 2 },
  ],
  report: recReport,
  run({ rounds = 100, k = 2 }) {
    const R = Math.max(1, Math.round(rounds)), K = Math.max(1, Math.round(k))
    const data = workshopData()
    const F: RecFrame[] = []
    const snap = (V: Float64Array): Array<[number, number]> => Array.from({ length: 60 }, (_, v) => [V[v * K], K > 1 ? V[v * K + 1] : 0])
    const pct = (x: number, l: 'tr' | 'en') => (l === 'tr' ? `%${fmt(100 * x, 1, 'tr')}` : `${(100 * x).toFixed(1)}%`)
    const best = cap(`mümkün en iyi ${pct(data.bayes, 'tr')} · rastgele %50`, `best possible ${pct(data.bayes, 'en')} · random 50%`)
    const every = R <= 30 ? 1 : Math.ceil((R - 20) / 50)
    const accAll: number[] = []
    const res = factorize(data, K, R, 16, (e, U, V, a) => {
      const base = { data, k: K, rounds: R, line: 0, cap: cap('', ''), stat: best }
      if (e === 0) {
        F.push({ ...base, V: snap(V), epoch: 0, acc: [], line: 8, cap: cap('3600 deneme: 300 öğrenci × 12 proje', '3600 tries: 300 students × 12 projects'), stat: cap('renk: projenin gizli tarzı (model görmez)', "colour: the project's hidden style (the model never sees it)"), hold: 2 })
        F.push({ ...base, V: snap(V), epoch: 0, acc: [], line: 10, cap: cap('3000 eğitim, 600 gizli beğeni', '3000 for training, 600 hidden likes'), hold: 1.6 })
        F.push({ ...base, V: snap(V), epoch: 0, acc: [], line: 13, cap: cap(`her öğrenciye ve projeye ${K} rastgele küçük sayı`, `${K} small random numbers for every student and project`), stat: cap(`başlangıç: gizli beğenilerde ${pct(a, 'tr')} doğru`, `start: ${pct(a, 'en')} right on hidden likes`), hold: 1.6 })
        const q = data.train[0]
        F.push({ ...base, V: snap(V), epoch: 0, acc: [], pair: q, line: 26, cap: cap(`öğrenci ${q[0]} · proje ${q[1]}: ${q[2] ? 'beğendi' : 'beğenmedi'}`, `student ${q[0]} · project ${q[1]}: ${q[2] ? 'liked' : 'did not like'}`), stat: cap('olasılık ≈ 0,5 → hata ≈ ' + (q[2] ? '−0,5' : '+0,5'), 'probability ≈ 0.5 → error ≈ ' + (q[2] ? '−0.5' : '+0.5')), hold: 1.6 })
        F.push({ ...base, V: snap(V), epoch: 0, acc: [], pair: q, line: 27, cap: cap(q[2] ? 'iki ok birbirine doğru itilir' : 'iki ok birbirinden uzağa itilir', q[2] ? 'the two arrows are pushed together' : 'the two arrows are pushed apart'), stat: cap('3000 çiftin her biri için aynı iki satır', 'the same two lines for each of the 3000 pairs'), hold: 1.6 })
        return
      }
      accAll.push(a)
      const all = accAll.slice()
      if (e <= 20 || e % every === 0 || e === R) {
        F.push({ ...base, V: snap(V), epoch: e, acc: all, line: e <= 2 ? 33 : 27, cap: cap(`tur ${e}: gizli beğenilerde doğruluk ${pct(a, 'tr')}`, `round ${e}: ${pct(a, 'en')} of hidden likes right`), stat: best, hold: e <= 2 ? 1.4 : e <= 10 ? 0.6 : 0.35 })
      }
    })
    const last = F[F.length - 1]
    F.push({ ...last, top3: res.top3, rand: res.rand, line: 34,
      cap: cap(`${R} tur: ${pct(res.acc[R - 1], 'tr')} doğru (mümkün en iyi ${pct(data.bayes, 'tr')})`, `${R} rounds: ${pct(res.acc[R - 1], 'en')} right (best possible ${pct(data.bayes, 'en')})`),
      stat: cap(`önerilen ilk 3 projede zevke uyan: ${pct(res.top3, 'tr')} · rastgele projede ${pct(res.rand, 'tr')}`, `${pct(res.top3, 'en')} of the top-3 picks suit the taste · random project ${pct(res.rand, 'en')}`), hold: 3 })
    return F
  },
}

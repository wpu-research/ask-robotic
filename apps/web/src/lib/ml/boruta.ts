// Ders: Boruta özellik seçimi. Robottaki 8 sensörden yalnız 3'ü arızayı gerçekten haber veriyor. Her sensörün karıştırılmış
// "gölge" kopyası eklenir; sensör, gölgelerin en iyisinden önemliyse isabet alır. Turlar boyunca isabetler sayılır, kabul/ret verilir.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'
import { B, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'

export const SENSORS: Array<{ tr: string; en: string }> = [
  { tr: 'akım', en: 'current' }, { tr: 'ışık', en: 'light' }, { tr: 'titreşim', en: 'vibration' }, { tr: 'nem', en: 'humidity' },
  { tr: 'Wi-Fi', en: 'Wi-Fi' }, { tr: 'sıcaklık', en: 'temp.' }, { tr: 'basınç', en: 'pressure' }, { tr: 'pusula', en: 'compass' },
]
/** Gerçek sinyal taşıyan sensörler. */
export const REAL = [0, 2, 5]

/** 300 ölçüm × 8 sensör (standart normal). Arıza olasılığı = sigmoid(1,6·akım + 1,2·titreşim + 0,8·sıcaklık). */
export function sensorData(seed = 8) {
  const r = rng(seed)
  const n = 300
  const X = Array.from({ length: n }, () => Array.from({ length: 8 }, () => gauss(r)))
  const y = X.map((x) => (r() < 1 / (1 + Math.exp(-(1.6 * x[0] + 1.2 * x[2] + 0.8 * x[5]))) ? 1 : 0))
  return { X, y }
}

/** Lojistik regresyon (gradyan inişi, sabit terimsiz); önem = |ağırlık| (sütunlar zaten ölçekli). */
export function logisticImportance(Z: number[][], y: number[], iters = 50, lr = 1): number[] {
  const n = Z.length, d = Z[0].length
  const A = new Float64Array(n * d)
  Z.forEach((z, i) => A.set(z, i * d))
  const w = new Float64Array(d)
  const g = new Float64Array(d)
  for (let it = 0; it < iters; it++) {
    g.fill(0)
    for (let i = 0; i < n; i++) {
      const o = i * d
      let s = 0
      for (let j = 0; j < d; j++) s += A[o + j] * w[j]
      const e = 1 / (1 + Math.exp(-s)) - y[i]
      for (let j = 0; j < d; j++) g[j] += e * A[o + j]
    }
    for (let j = 0; j < d; j++) w[j] -= (lr * g[j]) / n
  }
  return Array.from(w, Math.abs)
}

/** İki yanlı binom kuyrukları (p = 0,5): t turda h isabet. */
const comb = (n: number, k: number) => { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c }
export function tails(h: number, t: number) {
  let up = 0, lo = 0
  for (let k = 0; k <= t; k++) { const q = comb(t, k) / 2 ** t; if (k >= h) up += q; if (k <= h) lo += q }
  return { up, lo }
}

export interface BorutaRound { imp: number[]; shadowMax: number; hit: boolean[] }

/** Boruta: her turda gölgeler yeniden karıştırılır. Karar: isabet sayısı binom testinde (α = 0,01) anlamlıysa kalıcı kabul/ret. */
export function boruta(rounds: number, seed = 8) {
  const { X, y } = sensorData(seed)
  const r = rng(seed + 100)
  const hits = new Array(8).fill(0)
  const status = new Array(8).fill(0)
  const log: Array<BorutaRound & { hits: number[]; status: number[]; decidedAt: number[] }> = []
  const decidedAt = new Array(8).fill(0)
  for (let t = 1; t <= rounds; t++) {
    // gölgeler: her sütunu ayrı ayrı karıştır
    const perm = Array.from({ length: 8 }, () => { const p = Array.from({ length: X.length }, (_, i) => i); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]] } return p })
    const Z = X.map((x, i) => [...x, ...perm.map((p, j) => X[p[i]][j])])
    const imp = logisticImportance(Z, y)
    const shadowMax = Math.max(...imp.slice(8))
    const hit = imp.slice(0, 8).map((v) => v > shadowMax)
    hit.forEach((h, j) => { if (h) hits[j]++ })
    for (let j = 0; j < 8; j++) if (!status[j]) {
      const { up, lo } = tails(hits[j], t)
      if (up < 0.01) { status[j] = 1; decidedAt[j] = t } else if (lo < 0.01) { status[j] = -1; decidedAt[j] = t }
    }
    log.push({ imp, shadowMax, hit, hits: hits.slice(), status: status.slice(), decidedAt: decidedAt.slice() })
  }
  return { log, hits, status }
}

export interface BorutaFrame extends Frame {
  /** Tur kayıtları (tüm kareler aynı diziyi paylaşır); `t` bu karenin turu (0: henüz yok). */
  log: Array<BorutaRound & { hits: number[]; status: number[] }>
  t: number
  rounds: number
  /** Gösterim aşaması: 0 yalnız sensörler, 1 gölgeler eklendi, 2 önemler, 3 gölge en iyisi çizgisi, 4 isabet. */
  stage: number
}

/** logisticImportance'ın işaretli hâli (aynı gradyan inişi, sabit terimsiz): karar değeri için ağırlıklar. */
function logisticW(Z: number[][], y: number[], iters = 50, lr = 1): number[] {
  const n = Z.length, d = Z[0].length
  const w = new Array<number>(d).fill(0)
  for (let it = 0; it < iters; it++) {
    const g = new Array<number>(d).fill(0)
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let j = 0; j < d; j++) s += Z[i][j] * w[j]
      const e = 1 / (1 + Math.exp(-s)) - y[i]
      for (let j = 0; j < d; j++) g[j] += e * Z[i][j]
    }
    for (let j = 0; j < d; j++) w[j] -= (lr * g[j]) / n
  }
  return w
}

/**
 * Eğitim paneli: tur başına 8 sensörün önemi (|ağırlık|), gölgelerin en iyisi ve isabet sayısı; sonuçta kabul edilen sensörlerle
 * eğitilen lojistik modelin doğrulama ölçümleri (her 4. kayıt, i % 4 = 3) ve 8 sensörün hepsiyle karşılaştırma.
 */
export function borutaReport({ rounds = 20 }: Record<string, number>): EgitimRaporu {
  const R = Math.max(1, Math.round(rounds))
  const { log, hits, status } = boruta(R)
  const cols: Record<string, number[]> = { round: log.map((_, t) => t + 1) }
  for (let j = 0; j < 8; j++) cols[`imp_${j}`] = log.map((L) => L.imp[j])
  cols.shadow_max = log.map((L) => L.shadowMax)
  cols.n_hits = log.map((L) => L.hit.filter(Boolean).length)
  const { X, y } = sensorData()
  const acc = status.map((s, j) => (s === 1 ? j : -1)).filter((j) => j >= 0)
  const sel = acc.length ? acc : [0, 1, 2, 3, 4, 5, 6, 7]
  const tr = X.map((_, i) => i).filter((i) => i % 4 !== 3), va = X.map((_, i) => i).filter((i) => i % 4 === 3)
  const model = (cs: number[]) => { const w = logisticW(tr.map((i) => cs.map((j) => X[i][j])), tr.map((i) => y[i])); return va.map((i) => cs.reduce((s, j, k) => s + X[i][j] * w[k], 0)) }
  const s = model(sel), sAll = model([0, 1, 2, 3, 4, 5, 6, 7])
  const yv = va.map((i) => y[i])
  const accAll = sAll.filter((v, k) => (v > 0 ? 1 : 0) === yv[k]).length / yv.length
  const blk = siniflandirmaBlok({ y: yv, pred: s.map((v) => (v > 0 ? 1 : 0)), labels: ['sağlam', 'arıza'], scores: s, threshold: 0, pos: B('arıza', 'failure'), neg: B('sağlam', 'healthy'), prefix: 'val_', title: B('seçilen sensörler', 'selected sensors') })
  const tp = acc.filter((j) => REAL.includes(j)).length
  const names = SENSORS.map((s) => s.tr)
  const r: EgitimRaporu = {
    kind: 'siniflandirma', model: B('Boruta + lojistik regresyon (|w| önemi)', 'Boruta + logistic regression (|w| importance)'), seed: 8, hyper: { rounds: R, alpha: 0.01, records: X.length, shadows: 8 },
    history: { x: 'round', cols },
    final: [
      { key: 'accepted', label: B('kabul edilen sensör', 'accepted sensors'), value: acc.length, fmt: 'int' },
      { key: 'rejected', label: B('reddedilen sensör', 'rejected sensors'), value: status.filter((v) => v === -1).length, fmt: 'int' },
      { key: 'selection_precision', label: B('seçim kesinliği (gerçek / kabul)', 'selection precision'), value: acc.length ? tp / acc.length : 0, fmt: 3 },
      { key: 'selection_recall', label: B('seçim duyarlılığı (bulunan / 3 gerçek)', 'selection recall'), value: tp / REAL.length, fmt: 3 },
      ...blk.final,
      { key: 'val_accuracy_all8', label: B('8 sensörle doğrulama doğruluğu', 'validation accuracy, all 8'), value: accAll, fmt: 'pct' },
    ],
    confusion: blk.confusion, scores: blk.scores, charts: [],
  }
  r.charts = [
    {
      kind: 'line', id: 'imp', title: B('Tur başına önem ve en iyi gölge', 'Importance per round and best shadow'), x: cols.round, xLabel: B('tur', 'round'), yLabel: B('|ağırlık|', '|weight|'), live: true,
      series: [...names.map((nm, j) => ({ key: `imp_${j}`, label: { tr: nm, en: SENSORS[j].en }, values: cols[`imp_${j}`], tone: j % 6 })), { key: 'shadow_max', label: B('en iyi gölge', 'best shadow'), values: cols.shadow_max, tone: 5, dash: true }],
    },
    { kind: 'bar', id: 'hits', title: B(`Sensör başına isabet (${R} tur)`, `Hits per sensor (${R} rounds)`), labels: names, yMin: 0, yMax: R, series: [{ key: 'hits', label: B('isabet', 'hits'), values: hits, tone: 3 }], note: B('Binom testi (α = 0,01): şanstan (R/2) anlamlı fazla isabet kabul, anlamlı az isabet ret.', 'Binomial test (α = 0.01): significantly more hits than chance (R/2) is accepted, significantly fewer rejected.') },
    { kind: 'heat', id: 'hit-map', title: B('İsabet haritası (tur × sensör)', 'Hit map (round × sensor)'), rows: cols.round.map(String), cols: names, values: log.map((L) => L.hit.map((h) => (h ? 1 : 0))), rowLabel: B('tur', 'round'), colLabel: B('sensör', 'sensor') },
    ...blk.charts,
  ]
  return r
}

export const BORUTA: Lesson<BorutaFrame> = {
  slug: 'boruta',
  n: 0,
  title: { tr: 'Boruta: hangi sensör gerçekten işe yarıyor?', en: 'Boruta: which sensor really matters?' },
  sub: { tr: 'Gölge kopyalarla özellik seçimi', en: 'Feature selection with shadow copies' },
  story: {
    tr: 'Bir mobil robotun 300 çalışma kaydı var; her kayıtta 8 sensör okuması ve ardından arıza olup olmadığı. Sensörler: motor akımı, ortam ışığı, titreşim, nem, Wi-Fi sinyali, rulman sıcaklığı, hava basıncı ve pusula. Arızayı gerçekte yalnızca akım, titreşim ve sıcaklık haber veriyor; diğer 5\'i gürültü. Algoritma bunu bilmeden bulmalı.',
    en: 'A mobile robot has 300 operating records: 8 sensor readings each, followed by whether a failure happened. The sensors: motor current, ambient light, vibration, humidity, Wi-Fi signal, bearing temperature, air pressure and compass. Only current, vibration and temperature really warn of a failure; the other 5 are noise. The algorithm must find this without being told.',
  },
  how: [
    { tr: 'Her sensörün bir "gölge" kopyası yapılır: aynı değerler, satırları karıştırılmış. Gölgenin arızayla ilişkisi kesinlikle yoktur.', en: 'Every sensor gets a "shadow" copy: the same values with the rows shuffled. A shadow has no link to failures at all.' },
    { tr: '16 sütunla basit bir model (lojistik regresyon) eğitilir; önem = ağırlığın büyüklüğü.', en: 'A simple model (logistic regression) is trained on all 16 columns; importance = the size of its weight.' },
    { tr: 'Önemi gölgelerin en iyisinden büyük olan sensör o turda "isabet" alır. Gölgeler her turda yeniden karıştırılır.', en: 'A sensor whose importance beats the best shadow scores a "hit" for that round. The shadows are reshuffled every round.' },
    { tr: 'Şans eseri isabet olasılığı %50 kabul edilir; isabet sayısı bundan anlamlı biçimde fazlaysa kabul (yeşil), azsa ret (gri), arada kalırsa kararsız (sarı).', en: 'A chance hit rate of 50% is assumed; clearly more hits than that means accept (green), clearly fewer means reject (grey), in between stays tentative (yellow).' },
    { tr: 'Şunu dene: tur sayısını 5 yap; hiçbir karar verilemez. Turları artırdıkça kararlar netleşir.', en: 'Try this: set the rounds to 5 and no decision can be made. As the rounds grow, the decisions become clear.' },
  ],
  why: {
    tr: 'Gereksiz sensörler modeli yavaşlatır, aşırı öğrenmeye iter ve donanım maliyeti getirir. Boruta, kestirimci bakımda, tıbbi verilerde ve genetikte hangi ölçümlerin gerçekten bilgi taşıdığını bulmak için kullanılır. Robot tasarımında hangi sensörün kartta kalacağına karar vermeye yardım eder.',
    en: 'Useless sensors slow a model down, push it towards overfitting and cost hardware money. Boruta is used in predictive maintenance, medical data and genetics to find which measurements really carry information. In robot design it helps decide which sensors stay on the board.',
  },
  file: 'boruta.py',
  code: [
    ['import numpy as np'],
    ['from math import comb'],
    ['rng = np.random.default_rng(8)'],
    ['n, R = 300, 20', '300 kayıt, 20 tur', '300 records, 20 rounds'],
    ['X = rng.normal(0, 1, (n, 8))', '8 sensör; 0, 2, 5 gerçek', '8 sensors; 0, 2, 5 real'],
    ['z = 1.6 * X[:, 0] + 1.2 * X[:, 2] + 0.8 * X[:, 5]'],
    ['y = (rng.random(n) < 1 / (1 + np.exp(-z))) * 1.0', 'arıza oldu mu', 'did it fail'],
    ['hits = np.zeros(8, int)'],
    ["history = {k: [] for k in ['round', *[f'imp_{j}' for j in range(8)], 'shadow_max', 'n_hits']}", 'tur geçmişi', 'history per round'],
    ['for r in range(R):'],
    ['    S = rng.permuted(X, axis=0)', 'gölgeler: sütunları karıştır', 'shadows: shuffle columns'],
    ['    Z = np.hstack([X, S])', '16 sütun', '16 columns'],
    ['    w = np.zeros(16)'],
    ["    for _ in range(50):", "lojistik regresyon", "logistic regression"],
    ['        p = 1 / (1 + np.exp(-Z @ w))'],
    ["        w -= Z.T @ (p - y) / n", "gradyan inişi", "gradient descent"],
    ['    imp = np.abs(w)', 'önem', 'importance'],
    ['    best_shadow = imp[8:].max()', 'gölgelerin en iyisi', 'best shadow'],
    ['    hits += imp[:8] > best_shadow', 'isabet', 'hit'],
    ['    row = (r + 1, *imp[:8], best_shadow, (imp[:8] > best_shadow).sum())'],
    ['    for k, v in zip(history, row): history[k].append(float(v))'],
    ['tail = lambda a, b: sum(comb(R, k) for k in range(a, b + 1))'],
    ['p_up = [tail(h, R) / 2**R for h in hits]', 'şanstan fazla mı', 'more than chance?'],
    ['p_lo = [tail(0, h) / 2**R for h in hits]', 'şanstan az mı', 'fewer than chance?'],
    ['print("isabet", hits)', 'hits', 'hits'],
    ['print("kabul", [j for j in range(8) if p_up[j] < .01])', 'accept', 'accept'],
    ['print("ret", [j for j in range(8) if p_lo[j] < .01])', 'reject', 'reject'],
    ['sel = [j for j in range(8) if p_up[j] < .01] or list(range(8))', 'seçilen sensörler', 'selected sensors'],
    ['tr = np.arange(n) % 4 != 3', 'her 4. kayıt doğrulama', 'every 4th record: validation'],
    ['def lojistik(cols):', 'seçilen sütunlarla model', 'model on the chosen columns'],
    ['    A, w = X[tr][:, cols], np.zeros(len(cols))'],
    ['    for _ in range(50):'],
    ['        w -= A.T @ (1 / (1 + np.exp(-A @ w)) - y[tr]) / len(A)'],
    ['    return ((X[~tr][:, cols] @ w > 0) == y[~tr]).mean()', 'doğrulama doğruluğu', 'validation accuracy'],
    ['for k, v in [("val_acc", lojistik(sel)), ("val_acc_all8", lojistik(list(range(8)))),'],
    ['             ("accepted", len(sel)), ("hit_rate", hits.mean() / R)]:', 'son ölçümler', 'final metrics'],
    ['    print(f"{k:<13}{v:>8.3f}")'],
    ['import csv'],
    ['with open("egitim_gecmisi.csv", "w", newline="") as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir tur', 'one row per round'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik', 'plot if available'],
    ['    for j in range(8): plt.plot(history["round"], history[f"imp_{j}"], label=f"sensör {j}")'],
    ['    plt.plot(history["round"], history["shadow_max"], "k--", label="en iyi gölge")'],
    ['    plt.xlabel("round"); plt.ylabel("|w|"); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print("matplotlib yok: grafik atlandı")'],
  ],
  params: [{ key: 'rounds', label: { tr: 'Tur sayısı', en: 'Rounds' }, min: 3, max: 40, step: 1, value: 20 }],
  report: borutaReport,
  run({ rounds = 20 }) {
    const R = Math.max(1, Math.round(rounds))
    const { log } = boruta(R)
    const F: BorutaFrame[] = []
    const base = { log, rounds: R }
    const names = (js: number[], l: 0 | 1) => js.map((j) => (l ? SENSORS[j].en : SENSORS[j].tr)).join(', ') || '—'
    F.push({ ...base, t: 0, stage: 0, line: 6, cap: cap('300 kayıt, 8 sensör: hangileri arızayı haber veriyor?', '300 records, 8 sensors: which ones warn of a failure?'), stat: cap('cevap gizli: 3 gerçek sinyal, 5 gürültü', 'hidden answer: 3 real signals, 5 noise'), hold: 2 })
    for (let t = 1; t <= R; t++) {
      const L = log[t - 1]
      const nh = L.hit.filter(Boolean).length
      const st = cap(`tur ${t}: ${nh} sensör gölgeleri geçti`, `round ${t}: ${nh} sensors beat the shadows`)
      const acc = L.status.map((s, j) => (s === 1 ? j : -1)).filter((j) => j >= 0), rej = L.status.map((s, j) => (s === -1 ? j : -1)).filter((j) => j >= 0)
      const dec = cap(`kabul ${acc.length} · ret ${rej.length} · kararsız ${8 - acc.length - rej.length}`, `accepted ${acc.length} · rejected ${rej.length} · tentative ${8 - acc.length - rej.length}`)
      if (t === 1) {
        F.push({ ...base, t, stage: 1, line: 9, cap: cap('her sensörün karıştırılmış gölgesi: 8 + 8 = 16 sütun', 'a shuffled shadow for every sensor: 8 + 8 = 16 columns'), stat: cap('gölgenin arızayla hiçbir ilişkisi yok', 'a shadow has no link to failures'), hold: 2 })
        F.push({ ...base, t, stage: 2, line: 14, cap: cap('lojistik regresyon 16 sütunla eğitildi', 'logistic regression trained on 16 columns'), stat: cap('önem = |ağırlık|', 'importance = |weight|'), hold: 1.8 })
        F.push({ ...base, t, stage: 3, line: 16, cap: cap(`gölgelerin en iyisi: ${fmt(L.shadowMax, 3, 'tr')}`, `best shadow: ${L.shadowMax.toFixed(3)}`), stat: cap('bir sensör bunu geçmeli', 'a sensor has to beat this'), hold: 1.8 })
        F.push({ ...base, t, stage: 4, line: 17, cap: st, stat: cap(`isabet: ${names(L.hit.map((h, j) => (h ? j : -1)).filter((j) => j >= 0), 0)}`, `hits: ${names(L.hit.map((h, j) => (h ? j : -1)).filter((j) => j >= 0), 1)}`), hold: 2 })
      } else if (t <= 3) {
        F.push({ ...base, t, stage: 2, line: 9, cap: cap(`tur ${t}: gölgeler yeniden karıştırıldı`, `round ${t}: shadows reshuffled`), stat: dec, hold: 1 })
        F.push({ ...base, t, stage: 4, line: 17, cap: st, stat: dec, hold: 1.2 })
      } else F.push({ ...base, t, stage: 4, line: 17, cap: st, stat: dec, hold: t <= 8 ? 0.8 : 0.5 })
    }
    const L = log[R - 1]
    const acc = L.status.map((s, j) => (s === 1 ? j : -1)).filter((j) => j >= 0), rej = L.status.map((s, j) => (s === -1 ? j : -1)).filter((j) => j >= 0)
    const ten = [0, 1, 2, 3, 4, 5, 6, 7].filter((j) => !L.status[j])
    F.push({ ...base, t: R, stage: 4, line: 22,
      cap: cap(`kabul: ${names(acc, 0)}`, `accepted: ${names(acc, 1)}`),
      stat: cap(`ret: ${rej.length} sensör${ten.length ? ` · kararsız: ${names(ten, 0)}` : ''}`, `rejected: ${rej.length} sensors${ten.length ? ` · tentative: ${names(ten, 1)}` : ''}`), hold: 3 })
    return F
  },
}
// Python koduna geçmiş sözlüğü (7. satırdan sonra 1) ve tur kaydı (17. satırdan sonra 2) eklendi: vurgulanan satırlar kayar.
const bRun = BORUTA.run
BORUTA.run = (p) => bRun(p).map((f) => ({ ...f, line: f.line <= 7 ? f.line : f.line <= 17 ? f.line + 1 : f.line + 3 }))

// Ders: Q-öğrenme. Depo robotu raflar arasında şarj istasyonunu arıyor; her adım 1 puan götürür. 220 puanlık Q tablosu sıfırdan
// başlar ve tek bir satırla öğrenir: hamlenin puanı = varılan hücrenin en iyi puanı − 1. Bilgi oyun oyun şarjdan başlangıca akar.
import { cap, rng, type Frame, type Lesson } from './core'

/** İki depo planı: S başlangıç, G şarj istasyonu, # raf. */
export const MAZES: string[][] = [
  ['S..#.......', '.#.#.###.#.', '.#...#...#.', '.####.#.##.', '......#...G'],
  ['S.#........', '.##.#####.#', '...#...#...', '.#...#.#.#.', '...#.#...#G'],
]
/** Hamleler: yukarı, aşağı, sol, sağ. */
export const MOVES: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export interface QFrame extends Frame {
  maze: string[]
  /** Q tablosu (satır·W + sütun)·4 + hamle; değişmeyen karelerde aynı dizi paylaşılır. */
  Q: Float64Array
  pos: [number, number]
  game: number
  step: number
  bumps: number
  /** Bu oyunda (ya da son oyunda) gezilen hücreler. */
  path: number[]
  /** Biten oyunların adım sayısı (−1: takıldı). */
  hist: number[]
  shortest: number
  learn: boolean
  /** Sonuçta açgözlü (en iyi hamle) yol. */
  greedy?: number[]
  /** Az önce çarpılan duvar. */
  bump?: [number, number]
}

/** Başlangıçtan şarja en kısa yol (genişlik öncelikli arama). */
export function shortestPath(L: string[]): number {
  const H = L.length, W = L[0].length
  const dist = new Map<number, number>([[0, 0]])
  const q = [0]
  while (q.length) {
    const s = q.shift()!, r = Math.floor(s / W), c = s % W
    if (L[r][c] === 'G') return dist.get(s)!
    for (const [dr, dc] of MOVES) {
      const nr = r + dr, nc = c + dc, n = nr * W + nc
      if (nr >= 0 && nr < H && nc >= 0 && nc < W && L[nr][nc] !== '#' && !dist.has(n)) { dist.set(n, dist.get(s)! + 1); q.push(n) }
    }
  }
  return -1
}

export interface StepInfo { r: number; c: number; a: number; nr: number; nc: number; bump: boolean }

/** Bir oyun: başlangıçtan şarja (ya da adım sınırına) kadar. Eşit en iyi hamleler arasında rastgele seçer. */
export function playGame(L: string[], Q: Float64Array, r: () => number, learn: boolean, maxSteps = 5000, onStep?: (s: StepInfo, k: number) => void) {
  const H = L.length, W = L[0].length
  let row = 0, col = 0, steps = 0, bumps = 0
  const path = [0]
  while (L[row][col] !== 'G' && steps < maxSteps) {
    const b = (row * W + col) * 4
    let mx = -Infinity
    for (let a = 0; a < 4; a++) mx = Math.max(mx, Q[b + a])
    const best = [0, 1, 2, 3].filter((a) => Q[b + a] === mx)
    const a = best[Math.floor(r() * best.length)]
    let nr = row + MOVES[a][0], nc = col + MOVES[a][1]
    const bump = nr < 0 || nr >= H || nc < 0 || nc >= W || L[nr][nc] === '#'
    if (bump) { nr = row; nc = col; bumps++ }
    if (learn) {
      const nb = (nr * W + nc) * 4
      const target = L[nr][nc] === 'G' ? 0 : Math.max(Q[nb], Q[nb + 1], Q[nb + 2], Q[nb + 3])
      Q[b + a] = target - 1
    }
    onStep?.({ r: row, c: col, a, nr: bump ? row + MOVES[a][0] : nr, nc: bump ? col + MOVES[a][1] : nc, bump }, steps)
    row = nr; col = nc; steps++
    path.push(row * W + col)
  }
  return { steps, bumps, path, reached: L[row][col] === 'G' }
}

/** Tablodaki en iyi hamleyi izleyen yol (öğrenme yok, eşitlikte ilk hamle). */
export function greedyPath(L: string[], Q: Float64Array, maxSteps = 200) {
  const W = L[0].length, H = L.length
  let row = 0, col = 0, steps = 0
  const path = [0]
  while (L[row][col] !== 'G' && steps < maxSteps) {
    const b = (row * W + col) * 4
    let a = 0
    for (let k = 1; k < 4; k++) if (Q[b + k] > Q[b + a]) a = k
    const nr = row + MOVES[a][0], nc = col + MOVES[a][1]
    if (!(nr < 0 || nr >= H || nc < 0 || nc >= W || L[nr][nc] === '#')) { row = nr; col = nc }
    steps++
    path.push(row * W + col)
  }
  return { steps, path, reached: L[row][col] === 'G' }
}

/** Q-öğrenmeyi n oyun çalıştırır; her oyunun adım sayısı ve çarpma sayısı. */
export function train(L: string[], games: number, seed = 14) {
  const Q = new Float64Array(L.length * L[0].length * 4)
  const r = rng(seed)
  const log: Array<{ steps: number; bumps: number }> = []
  for (let g = 0; g < games; g++) { const o = playGame(L, Q, r, true); log.push({ steps: o.steps, bumps: o.bumps }) }
  return { Q, log }
}

const DIR: Array<[string, string]> = [['yukarı', 'up'], ['aşağı', 'down'], ['sola', 'left'], ['sağa', 'right']]

export const Q_OGRENME: Lesson<QFrame> = {
  slug: 'q-ogrenme',
  n: 0,
  title: { tr: 'Q-öğrenme: şarj istasyonunu bulan robot', en: 'Q-learning: a robot that finds its charger' },
  sub: { tr: 'Deneyerek öğrenen tek satırlık kural', en: 'A one-line rule that learns by trying' },
  story: {
    tr: 'Bir depo robotu 5 × 11 hücrelik bir zeminde, raflar (#) arasında başlangıçtan (S) şarj istasyonuna (G) gitmeli. Haritası yok; her adım ona 1 puan kaybettirir, rafa çarpınca yerinde kalır. Hafızası Q adlı bir tablo: her hücre ve dört hamle için bir puan, toplam 220 puan, hepsi sıfırdan başlar. En kısa yol 18 adım.',
    en: 'A warehouse robot on a 5 × 11 floor must drive between shelves (#) from the start (S) to its charging station (G). It has no map; every step costs one point, and bumping into a shelf leaves it where it was. Its memory is a table called Q: one score for every cell and each of the four moves, 220 scores in all, all starting at zero. The shortest route is 18 steps.',
  },
  how: [
    { tr: 'Sıfır, alınabilecek en iyi puandır (her adım −1). Bu yüzden hiç denenmemiş her hamle mükemmel görünür ve robot hepsini dener.', en: 'Zero is the best possible score (every step is −1), so every untried move looks perfect and the robot tries them all.' },
    { tr: 'Her hücrede puanı en yüksek hamleyi seçer; eşitlikte rastgele. Rafa çarparsa yerinde kalır.', en: 'In each cell it picks the move with the highest score, at random among ties. If it hits a shelf it stays put.' },
    { tr: 'Tek öğrenme satırı: yapılan hamlenin puanı = varılan hücrenin en iyi puanı − 1. Şarja varan son hamle −1 alır: "bir adım kaldı".', en: 'The single learning line: the move just made gets the best score of the cell it landed in, minus one. The last move into the charger gets −1: "one step to go".' },
    { tr: 'Bu bilgi oyun oyun geriye, şarjdan başlangıca doğru akar; sonunda başlangıç hücresi "18 adım" der ve robot hep en kısa yolu izler.', en: 'Game after game this knowledge flows backwards from the charger to the start; in the end the start cell says "18 steps" and the robot always takes the shortest way.' },
    { tr: 'Şunu dene: depo planını 1 yap. Eski tablo, öğrenme kapalıyken yeni rafa takılır; aynı satırlar yeni planı sıfırdan öğrenir.', en: 'Try this: set the warehouse layout to 1. The old table, with learning off, gets stuck at a new shelf; the same lines learn the new layout from scratch.' },
  ],
  why: {
    tr: 'Q-öğrenme, pekiştirmeli öğrenmenin temelidir: doğru cevap verilmez, yalnızca ödül ya da ceza gelir. Tablonun yerine bir sinir ağı koyunca (DQN) aynı fikir Atari oyunlarını ve robot kollarının kavrama hareketlerini öğrenmiştir. Depo ve servis robotlarında rota ve görev seçimi, drone iniş kontrolü bu ailenin uygulamalarıdır.',
    en: 'Q-learning is the foundation of reinforcement learning: nobody gives the right answer, only rewards or penalties. Swap the table for a neural network (DQN) and the same idea learned Atari games and robot-arm grasping. Route and task choice in warehouse and service robots and drone landing control come from this family.',
  },
  file: 'q_ogrenme.py',
  code: [
    ['import numpy as np'],
    ['L = ["S..#.......",', 'S başlangıç, G şarj, # raf', 'S start, G charger, # shelf'],
    ['     ".#.#.###.#.",'],
    ['     ".#...#...#.",'],
    ['     ".####.#.##.",'],
    ['     "......#...G"]'],
    ['H, W = len(L), len(L[0])'],
    ['Q = np.zeros((H, W, 4))', '5·11·4 = 220 puan, hepsi 0', '5·11·4 = 220 scores, all 0'],
    ['M = [(-1, 0), (1, 0), (0, -1), (0, 1)]', 'yukarı, aşağı, sol, sağ', 'up, down, left, right'],
    ['rng = np.random.default_rng(14)'],
    ['for game in range(1, 61):'],
    ['    r, c, steps, bumps = 0, 0, 0, 0', 'S hücresinden başla', 'start at S'],
    ['    while L[r][c] != "G":'],
    ['        best = np.flatnonzero(Q[r, c] == Q[r, c].max())', 'en iyi puanlı hamleler', 'best-scoring moves'],
    ['        a = rng.choice(best)', 'eşitlikte rastgele', 'random among ties'],
    ['        nr, nc = r + M[a][0], c + M[a][1]'],
    ['        if not (0<=nr<H and 0<=nc<W) or L[nr][nc]=="#":'],
    ['            nr, nc, bumps = r, c, bumps + 1', 'çarptı, yerinde kalır', 'bumped, stays put'],
    ['        target = 0 if L[nr][nc] == "G" else Q[nr, nc].max()'],
    ['        Q[r, c, a] = target - 1', 'öğrenmenin tamamı', 'all of the learning'],
    ['        r, c, steps = nr, nc, steps + 1'],
    ['    if game in (1, 2, 10, 37, 60):'],
    ['        print(game, steps, bumps)', 'oyun, adım, çarpma', 'game, steps, bumps'],
  ],
  params: [
    { key: 'games', label: { tr: 'Oyun sayısı', en: 'Games' }, min: 10, max: 100, step: 5, value: 60 },
    { key: 'maze', label: { tr: 'Depo planı (0 / 1: yeni plan)', en: 'Layout (0 / 1: new layout)' }, min: 0, max: 1, step: 1, value: 0 },
  ],
  run({ games = 60, maze = 0 }) {
    const G = Math.max(1, Math.round(games))
    const F: QFrame[] = []
    const L0 = MAZES[0]
    const short0 = shortestPath(L0)

    /** Bir labirentte n oyunluk öğrenme izi: ilk oyunun ilk adımları tek tek, sonra oyun başına bir kare. */
    const learnRun = (L: string[], n: number, seed: number, prefix: [string, string]) => {
      const W = L[0].length, sp = shortestPath(L)
      const Q = new Float64Array(L.length * W * 4)
      const r = rng(seed)
      const hist: number[] = []
      const st = (g: number, s: number, b: number): [string, string] => cap(`${prefix[0]}oyun ${g} · adım ${s} · çarpma ${b}`, `${prefix[1]}game ${g} · step ${s} · bumps ${b}`)
      F.push({ maze: L, Q: Q.slice(), pos: [0, 0], game: 0, step: 0, bumps: 0, path: [0], hist: [], shortest: sp, learn: true, line: 7, cap: cap('220 puan, hepsi 0: her hamle mükemmel görünüyor', '220 scores, all 0: every move looks perfect'), stat: cap(`en kısa yol ${sp} adım`, `shortest route ${sp} steps`), hold: 2 })
      const gr = L.findIndex((row) => row.includes('G'))
      const goal: [number, number] = [gr, L[gr].indexOf('G')]
      for (let g = 1; g <= n; g++) {
        let bumps = 0
        const o = playGame(L, Q, r, true, 5000, g === 1 ? (s, k) => {
          if (s.bump) bumps++
          if (k >= 12) return
          const pos: [number, number] = [s.bump ? s.r : s.nr, s.bump ? s.c : s.nc]
          const qv = Q[(s.r * W + s.c) * 4 + s.a]
          const base = { maze: L, Q: Q.slice(), game: 1, step: k + 1, bumps, path: [0], hist: [], shortest: sp, learn: true }
          const mv = DIR[s.a]
          if (k < 3) {
            F.push({ ...base, Q: F[F.length - 1].Q, pos: [s.r, s.c], line: 13, cap: cap(`eşit puanlı hamleler arasından rastgele: ${mv[0]}`, `random among equal scores: ${mv[1]}`), stat: st(1, k, bumps - (s.bump ? 1 : 0)), hold: 1.4 })
            if (s.bump) F.push({ ...base, Q: F[F.length - 1].Q, pos: [s.r, s.c], bump: [s.nr, s.nc], line: 17, cap: cap('rafa çarptı, yerinde kalır', 'hit a shelf, stays put'), stat: st(1, k + 1, bumps), hold: 1.4 })
            F.push({ ...base, pos, line: 19, cap: cap(`Q(${s.r},${s.c}, ${mv[0]}) = 0 − 1 = ${qv}`, `Q(${s.r},${s.c}, ${mv[1]}) = 0 − 1 = ${qv}`), stat: st(1, k + 1, bumps), hold: 1.6 })
          } else F.push({ ...base, pos, bump: s.bump ? [s.nr, s.nc] : undefined, line: s.bump ? 17 : 19, cap: s.bump ? cap('çarptı', 'bump') : cap(`${mv[0]} · puan ${qv}`, `${mv[1]} · score ${qv}`), stat: st(1, k + 1, bumps), hold: 0.7 })
        } : undefined)
        hist.push(o.steps)
        const msg: [string, string] = g === 1
          ? cap(`ilk oyun: ${o.steps} adım, ${o.bumps} çarpma; son hamle "1 adım kaldı" öğrendi`, `first game: ${o.steps} steps, ${o.bumps} bumps; the last move learned "one step to go"`)
          : o.steps === sp ? cap(`oyun ${g}: ${o.steps} adım, en kısa yol`, `game ${g}: ${o.steps} steps, the shortest route`) : cap(`oyun ${g}: ${o.steps} adım`, `game ${g}: ${o.steps} steps`)
        F.push({ maze: L, Q: Q.slice(), pos: goal, game: g, step: o.steps, bumps: o.bumps, path: o.path, hist: hist.slice(), shortest: sp, learn: true, line: g === 1 ? 19 : 21, cap: msg, stat: st(g, o.steps, o.bumps), hold: g === 1 ? 2.2 : g < 6 ? 0.9 : 0.45 })
      }
      // en kısa yolun kalıcı olduğu ilk oyun: o oyundan sonuna kadar hep sp adım
      let from = -1
      for (let i = hist.length - 1; i >= 0 && hist[i] === sp; i--) from = i + 1
      const gp = greedyPath(L, Q)
      return { Q, hist, from, gp, sp }
    }

    const res = learnRun(L0, G, 14, ['', ''])
    const last = F[F.length - 1]
    const endMsg = (o: typeof res): [string, string] => o.from > 0
      ? cap(`oyun ${o.from}'den itibaren her seferinde ${o.sp} adımlık en kısa yol`, `from game ${o.from} on: the ${o.sp}-step shortest route every time`)
      : cap(`en iyi hamleler: ${o.gp.reached ? o.gp.steps + ' adım' : 'şarja ulaşmıyor'}; daha çok oyun gerek`, `best moves: ${o.gp.reached ? o.gp.steps + ' steps' : 'do not reach the charger'}; more games needed`)
    F.push({ ...last, greedy: res.gp.path, path: [], line: 21, cap: endMsg(res), stat: cap(`ilk oyun ${res.hist[0]} adım → son oyun ${res.hist[res.hist.length - 1]} adım`, `first game ${res.hist[0]} steps → last game ${res.hist[res.hist.length - 1]} steps`), hold: maze ? 2 : 3 })
    if (!maze) return F

    // Yeni plan: eski tabloyla, öğrenme kapalı
    const L1 = MAZES[1], W1 = L1[0].length, sp1 = shortestPath(L1)
    const Qold = res.Q
    const r = rng(41)
    const trail: number[] = [0]
    const LIM = 40
    F.push({ maze: L1, Q: Qold, pos: [0, 0], game: 0, step: 0, bumps: 0, path: [0], hist: [], shortest: sp1, learn: false, line: 1, cap: cap('yeni depo planı · eski tablo · öğrenme kapalı', 'new layout · old table · learning off'), stat: cap(`yeni en kısa yol ${sp1} adım`, `new shortest route ${sp1} steps`), hold: 2 })
    let bumpsOld = 0
    const old = playGame(L1, Qold, r, false, LIM, (s, k) => {
      if (s.bump) bumpsOld++
      const pos: [number, number] = s.bump ? [s.r, s.c] : [s.nr, s.nc]
      trail.push(pos[0] * W1 + pos[1])
      if (bumpsOld <= 4 || k === LIM - 1) F.push({ maze: L1, Q: Qold, pos, bump: s.bump ? [s.nr, s.nc] : undefined, game: 0, step: k + 1, bumps: bumpsOld, path: trail.slice(), hist: [], shortest: sp1, learn: false, line: s.bump ? 17 : 14, cap: s.bump ? cap('eski en iyi hamle yeni rafa çarpıyor', 'the old best move hits a new shelf') : cap('eski tablonun yolu', "the old table's route"), stat: cap(`adım ${k + 1} · çarpma ${bumpsOld}`, `step ${k + 1} · bumps ${bumpsOld}`), hold: 0.6 })
    })
    const lastOld = F[F.length - 1]
    F.push({ ...lastOld, hist: [old.reached ? old.steps : -1], line: 19, cap: old.reached ? cap(`eski tablo yine de ${old.steps} adımda vardı`, `the old table still arrived in ${old.steps} steps`) : cap(`takıldı: ${LIM} adımda ${old.bumps} çarpma, puanlar değişmediği için sonsuza dek`, `stuck: ${old.bumps} bumps in ${LIM} steps, forever, since the scores never change`), stat: cap('tablo bir planın notu; beceri onu yazan satırlarda', 'the table is a note for one layout; the skill is in the lines that write it'), hold: 3 })

    const res1 = learnRun(L1, G, 15, ['yeni plan · ', 'new layout · '])
    const last1 = F[F.length - 1]
    F.push({ ...last1, greedy: res1.gp.path, path: [], line: 21, cap: endMsg(res1), stat: cap(`aynı satırlar yeni planı sıfırdan öğrendi (${sp1} adım)`, `the same lines learned the new layout from scratch (${sp1} steps)`), hold: 3 })
    return F
  },
}

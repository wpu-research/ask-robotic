// Ders: nesne takibi. Tavandaki kamera fabrika içi yolu tepeden görür; dedektör her karede AGV kutuları verir (sırası karışık,
// gürültülü, ara sıra eksik). Merkez tabanlı takipçi kutuları kimliklere bağlar; piksel → metre ölçeğiyle hız ve 2 m/s ihlali.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

/** Kamera: 25 piksel = 1 metre, saniyede 10 kare. Görüntü 650×375 px (26 m × 15 m). */
export const PX_M = 25
export const FPS = 10
export const LIMIT = 2.0
export const IMG_W = 650
export const IMG_H = 375
/** Eşleşmeyen bir iz kaç kare daha tutulur. */
export const MAX_MISS = 5
/** Hız tahmini için son kaç konuma doğru oturtulur. */
const WIN = 20
/** Hız etiketi ve ihlal için en az bu kadar konum gerekir. */
const MIN_PTS = 10
const DUR = 120

export interface Det { x: number; y: number; w: number; h: number; gt: number }
export interface TrkSnap {
  id: number
  x: number; y: number; w: number; h: number
  missed: number
  /** m/s (yeterli konum yoksa NaN). */
  speed: number
  viol: boolean
  /** Son konumlar (x0, y0, x1, y1, …). */
  trail: number[]
}
export interface Link { px: number; py: number; dx: number; dy: number; cost: number; ok: boolean }
export interface ViolEvent { t: number; id: number; speed: number }
export interface TrackFrame extends Frame {
  /** Kamera karesi (0'dan). */
  t: number
  gate: number
  dets: Det[]
  tracks: TrkSnap[]
  /** Tahmin → tespit bağları (ayrıntılı karelerde). */
  links?: Link[]
  /** Bu karede doğan kimlikler. */
  born?: number[]
  events: ViolEvent[]
  summary?: Array<{ truth: number; est: number; id: number; viol: boolean }>
  switches?: number
  nTracks?: number
}

/** Gerçek hareket: metre ve m/s, görüntü ekseni (y aşağı). t0 saniyesinde girer. */
export const VEHICLES = [
  { x: 1, y: 5, vx: 1.4, vy: 0, t0: 0 },
  { x: 25, y: 9.5, vx: -2.7, vy: 0, t0: 0 },
  { x: 13, y: -0.5, vx: 0, vy: 2.3, t0: 0.8 },
  { x: -1, y: 5, vx: 1.9, vy: 0, t0: 5 },
  { x: 27, y: 9.5, vx: -1.7, vy: 0, t0: 6 },
]
export const trueSpeed = (k: number) => Math.hypot(VEHICLES[k].vx, VEHICLES[k].vy)

/** Dedektör çıktısı: piksel, gürültülü, %4 kaçırma, karışık sıra. */
export function detections(noise: number, seed = 11): Det[][] {
  const r = rng(seed)
  const out: Det[][] = []
  for (let t = 0; t < DUR; t++) {
    const s = t / FPS
    const D: Det[] = []
    VEHICLES.forEach((v, k) => {
      if (s < v.t0) return
      const x = (v.x + v.vx * (s - v.t0)) * PX_M, y = (v.y + v.vy * (s - v.t0)) * PX_M
      const nx = noise * gauss(r), ny = noise * gauss(r), miss = r(), dw = gauss(r)
      if (x < 0 || x > IMG_W || y < 0 || y > IMG_H) return
      if (miss < 0.04 && t > 3) return
      const along = 40 + dw, across = 25 + dw * 0.5
      D.push({ x: x + nx, y: y + ny, w: v.vx ? along : across, h: v.vx ? across : along, gt: k })
    })
    for (let i = D.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [D[i], D[j]] = [D[j], D[i]] }
    out.push(D)
  }
  return out
}

interface Trk { id: number; pts: number[]; fr: number[]; w: number; h: number; missed: number; viol: boolean; dead: boolean }

/** Son WIN konuma en küçük karelerle doğru: m/s. */
function lsSpeed(pts: number[], fr: number[], from = 0): number {
  const n = fr.length - from
  if (n < 2) return NaN
  let mt = 0, mx = 0, my = 0
  for (let i = from; i < fr.length; i++) { mt += fr[i]; mx += pts[2 * i]; my += pts[2 * i + 1] }
  mt /= n; mx /= n; my /= n
  let stt = 0, sx = 0, sy = 0
  for (let i = from; i < fr.length; i++) { const d = fr[i] - mt; stt += d * d; sx += d * (pts[2 * i] - mx); sy += d * (pts[2 * i + 1] - my) }
  return (Math.hypot(sx / stt, sy / stt) * FPS) / PX_M
}
const winSpeed = (k: Trk) => (k.fr.length >= MIN_PTS ? lsSpeed(k.pts, k.fr, Math.max(0, k.fr.length - WIN)) : NaN)

/** Merkez tabanlı takipçi: sabit hız tahmini + açgözlü en yakın eşleştirme + maliyet eşiği. */
export function track(dets: Det[][], gate: number) {
  const T: Trk[] = []
  let nid = 0
  const gtIds: number[][] = VEHICLES.map(() => [])
  const steps: Array<{ links: Link[]; born: number[]; events: ViolEvent[] }> = []
  const events: ViolEvent[] = []
  const snaps: TrkSnap[][] = []
  dets.forEach((D, t) => {
    const live = T.filter((k) => !k.dead)
    const pr = live.map((k) => {
      const n = k.fr.length, x = k.pts[2 * n - 2], y = k.pts[2 * n - 1]
      if (n < 2) return [x, y]
      const g = k.fr[n - 1] - k.fr[n - 2], a = t - k.fr[n - 1]
      return [x + ((x - k.pts[2 * n - 4]) / g) * a, y + ((y - k.pts[2 * n - 3]) / g) * a]
    })
    const pairs: Array<[number, number, number]> = []
    pr.forEach((q, i) => D.forEach((d, j) => pairs.push([Math.hypot(d.x - q[0], d.y - q[1]), i, j])))
    pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
    const ut = new Set<number>(), ud = new Set<number>()
    const links: Link[] = []
    for (const [c, i, j] of pairs) {
      if (ut.has(i) || ud.has(j)) continue
      const ok = c < gate
      if (c < gate * 2.5) links.push({ px: pr[i][0], py: pr[i][1], dx: D[j].x, dy: D[j].y, cost: c, ok })
      if (!ok) continue
      const k = live[i]
      k.pts.push(D[j].x, D[j].y); k.fr.push(t); k.w = D[j].w; k.h = D[j].h; k.missed = 0
      ut.add(i); ud.add(j); gtIds[D[j].gt].push(k.id)
    }
    live.forEach((k, i) => { if (!ut.has(i) && ++k.missed > MAX_MISS) k.dead = true })
    const born: number[] = []
    D.forEach((d, j) => {
      if (ud.has(j)) return
      const k: Trk = { id: nid++, pts: [d.x, d.y], fr: [t], w: d.w, h: d.h, missed: 0, viol: false, dead: false }
      T.push(k); born.push(k.id); gtIds[d.gt].push(k.id)
    })
    T.forEach((k) => {
      if (k.dead || k.viol) return
      const s = winSpeed(k)
      if (s > LIMIT) { k.viol = true; events.push({ t, id: k.id, speed: s }) }
    })
    steps.push({ links, born, events: events.slice() })
    snaps.push(T.filter((k) => !k.dead).map((k) => ({
      id: k.id, x: k.pts[k.pts.length - 2], y: k.pts[k.pts.length - 1], w: k.w, h: k.h, missed: k.missed,
      speed: winSpeed(k), viol: k.viol, trail: k.pts.slice(-50),
    })))
  })
  // kimlik değişimi: bir aracın eşleştiği kimlik kaç kez değişti
  let switches = 0
  gtIds.forEach((ids) => { for (let i = 1; i < ids.length; i++) if (ids[i] !== ids[i - 1]) switches++ })
  // her araç için en uzun izi bul, tüm konumlarına doğru oturt
  const summary = VEHICLES.map((_, g) => {
    const cnt = new Map<number, number>()
    gtIds[g].forEach((id) => cnt.set(id, (cnt.get(id) ?? 0) + 1))
    const id = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0]
    const k = T.find((q) => q.id === id)!
    return { truth: trueSpeed(g), est: lsSpeed(k.pts, k.fr), id, viol: k.viol }
  })
  return { steps, snaps, switches, nTracks: nid, summary, events }
}

export const NESNE_TAKIBI: Lesson<TrackFrame> = {
  slug: 'nesne-takibi',
  n: 0,
  title: { tr: 'Nesne takibi ve hız ihlali', en: 'Object tracking and speeding' },
  sub: { tr: 'Tepeden bakan kamerayla AGV kimlikleri, izleri ve hızları', en: 'AGV identities, trails and speeds from an overhead camera' },
  story: {
    tr: 'Fabrikanın iç yolunu tavandaki bir kamera tepeden görüyor: 26 m × 15 m, 25 piksel = 1 metre, saniyede 10 kare. 12 saniyede beş otonom forklift (AGV) geçiyor; kurallara göre hız sınırı 2 m/s. Dedektör her karede yalnız kutular verir: hangisinin hangi araç olduğunu bilmez, sırası her karede karışıktır, konum ±2 piksel titrer ve kutuların %4\'ü kaçırılır. Takipçi kimlikleri korumalı ve hız sınırını aşanı bulmalı.',
    en: 'A ceiling camera looks down on the factory\'s internal road: 26 m × 15 m, 25 pixels = 1 metre, 10 frames per second. Five autonomous forklifts (AGVs) pass in 12 seconds; the speed limit is 2 m/s. The detector only outputs boxes each frame: it does not know which box is which vehicle, their order is shuffled every frame, positions jitter by ±2 pixels and 4% of the boxes are missed. The tracker has to keep the identities and catch whoever breaks the limit.',
  },
  how: [
    { tr: 'Her iz için bir sonraki konum tahmin edilir: son iki konumdan sabit hızla bir adım ileri.', en: 'Each track predicts its next position: one step ahead at constant velocity from its last two positions.' },
    { tr: 'Tahminlerle yeni kutuların merkezleri arasındaki tüm uzaklıklar sıralanır; en yakın çift önce eşleşir, eşikten uzak olanlar eşleşmez.', en: 'All distances between the predictions and the new box centres are sorted; the closest pair is matched first, and pairs farther than the gate stay unmatched.' },
    { tr: 'Eşleşmeyen kutu yeni bir kimlik alır. Eşleşmeyen iz 5 kare daha bekletilir (kaçırılan tespitler için), sonra silinir.', en: 'An unmatched box gets a new ID. An unmatched track is kept for 5 more frames (to survive missed detections), then deleted.' },
    { tr: 'Hız: son 20 konuma en küçük karelerle doğru oturtulur, eğimi piksel/kare; × 10 kare/s ÷ 25 piksel/m = m/s. 2 m/s\'yi geçen iz kırmızıya döner.', en: 'Speed: a least-squares line through the last 20 positions gives pixels per frame; × 10 frames/s ÷ 25 pixels/m = m/s. A track above 2 m/s turns red.' },
    { tr: 'Şunu dene: gürültüyü 6 piksele çıkar; 20 piksellik eşik yetmez, araçlar yeni kimlik alır. Eşiği büyütünce düzelir; ama çok geniş eşik, bir tespit kaçınca izin yanından geçen başka bir aracın kutusunu kapmasına kapı açar.', en: 'Try this: raise the noise to 6 pixels; the 20-pixel gate is no longer enough and vehicles get new IDs. A larger gate fixes it, but a gate that is too wide lets a track grab the box of a vehicle passing nearby when its own detection is missed.' },
  ],
  why: {
    tr: 'Trafik kameralarında hız ve şerit ihlali, depolarda forklift güvenliği, mağazalarda müşteri akışı ve sporda oyuncu takibi aynı iki adımla çalışır: önce tespit, sonra kimlik bağlama. Mobil robotlar da çevrelerindeki insanları ve araçları böyle takip eder; SORT ve DeepSORT bu fikre Kalman filtresi ve görünüm benzerliği ekler.',
    en: 'Speed and lane violations on traffic cameras, forklift safety in warehouses, customer flow in shops and player tracking in sports all run on the same two steps: detect first, then link identities. Mobile robots track the people and vehicles around them the same way; SORT and DeepSORT add a Kalman filter and appearance similarity to this idea.',
  },
  file: 'takip.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(7)'],
    ['PX_M, FPS, LIMIT, GATE = 25, 10, 2.0, 20', 'px/m, kare/s, m/s, px', 'px/m, frames/s, m/s, px'],
    ['v = np.array([[1.4, 0], [-2.7, 0], [0, 2.3]])', 'gerçek hızlar (m/s)', 'true velocities (m/s)'],
    ['p0 = np.array([[1.0, 5], [25, 9.5], [13, 1]]) * PX_M', 'başlangıç (px)', 'start (px)'],
    ['T = []', 'izler: konum listeleri', 'tracks: position lists'],
    ['for t in range(60):'],
    ['    det = p0 + v * PX_M * t / FPS', 'gerçek merkezler', 'true centres'],
    ['    det += rng.normal(0, 2, det.shape)', 'ölçüm gürültüsü', 'measurement noise'],
    ['    det = det[rng.permutation(len(det))]', 'sıra bilinmez', 'order is unknown'],
    ['    pr = [2*p[-1] - p[-2] if p[1:] else p[-1] for p in T]', 'sabit hız tahmini', 'constant-velocity prediction'],
    ['    pairs = sorted((np.hypot(*(d - q)), i, j)', 'tüm uzaklıklar, küçükten', 'all distances, smallest first'],
    ['      for i, q in enumerate(pr) for j, d in enumerate(det))'],
    ['    ut, ud = set(), set()', 'kullanılan iz / tespit', 'used tracks / detections'],
    ['    for c, i, j in pairs:'],
    ['        if c < GATE and i not in ut and j not in ud:', 'eşik içinde mi?', 'inside the gate?'],
    ['            T[i].append(det[j]); ut.add(i); ud.add(j)', 'kimliğe bağla', 'link to the ID'],
    ['    for j in set(range(len(det))) - ud: T.append([det[j]])', 'yeni kimlik', 'new ID'],
    ['for i, pts in enumerate(T):'],
    ['    P = np.array(pts)'],
    ['    vel = np.polyfit(np.arange(len(P)), P, 1)[0]', 'eğim: px/kare', 'slope: px/frame'],
    ['    s = np.hypot(*vel) * FPS / PX_M', 'm/s'],
    ["    print(f'ID {i}: {s:.2f} m/s, ihlal: {s > LIMIT}')"],
  ],
  params: [
    { key: 'gate', label: { tr: 'Eşleştirme eşiği (px)', en: 'Matching gate (px)' }, min: 4, max: 80, step: 1, value: 20 },
    { key: 'noise', label: { tr: 'Ölçüm gürültüsü σ (px)', en: 'Measurement noise σ (px)' }, min: 0, max: 8, step: 0.5, value: 2 },
  ],
  run({ gate = 20, noise = 2 }) {
    const dets = detections(noise)
    const R = track(dets, gate)
    const F: TrackFrame[] = []
    const stat = cap(`eşik ${gate} px · gürültü σ = ${fmt(noise, 1, 'tr')} px · sınır 2 m/s`, `gate ${gate} px · noise σ = ${noise.toFixed(1)} px · limit 2 m/s`)
    const at = (t: number, extra: Partial<TrackFrame> & Pick<TrackFrame, 'line' | 'cap'>): TrackFrame =>
      ({ t, gate, dets: dets[t], tracks: R.snaps[t], events: R.steps[t].events, stat, ...extra })
    const prev = (t: number): TrkSnap[] => (t ? R.snaps[t - 1] : [])
    F.push({ t: 0, gate, dets: dets[0], tracks: [], events: [], line: 7, cap: cap('kare 0: dedektör yalnız kutular verir', 'frame 0: the detector only gives boxes'), stat, hold: 2 })
    F.push(at(0, { line: 17, born: R.steps[0].born, cap: cap(`hiç iz yok: her kutu yeni kimlik (${R.steps[0].born.length})`, `no tracks yet: every box gets a new ID (${R.steps[0].born.length})`), hold: 1.8 }))
    for (let t = 1; t < DUR; t++) {
      const s = R.steps[t]
      const c = cap(`kare ${t} · ${fmt(t / FPS, 1, 'tr')} s · ${R.snaps[t].length} iz`, `frame ${t} · ${(t / FPS).toFixed(1)} s · ${R.snaps[t].length} tracks`)
      if (t <= 2) {
        F.push({ t, gate, dets: dets[t], tracks: prev(t), events: R.steps[t - 1].events, line: 9, cap: cap(`kare ${t}: yeni kutular, sırası karışık`, `frame ${t}: new boxes, shuffled`), stat, hold: 1.2 })
        F.push({ t, gate, dets: dets[t], tracks: prev(t), events: R.steps[t - 1].events, links: s.links, line: 10, cap: cap('her iz bir adım ileriyi tahmin eder', 'each track predicts one step ahead'), stat, hold: 1.4 })
        F.push({ t, gate, dets: dets[t], tracks: prev(t), events: R.steps[t - 1].events, links: s.links, line: 15, cap: cap(`en yakın çift önce; eşik ${gate} px`, `closest pair first; gate ${gate} px`), stat, hold: 1.4 })
        F.push(at(t, { line: 16, cap: c, hold: 1 }))
        continue
      }
      const nv = s.events.length > R.steps[t - 1].events.length
      if (nv) {
        const e = s.events.at(-1)!
        F.push(at(t, { line: 21, cap: cap(`İHLAL: ID ${e.id} · ${fmt(e.speed, 2, 'tr')} m/s > 2 m/s`, `VIOLATION: ID ${e.id} · ${e.speed.toFixed(2)} m/s > 2 m/s`), hold: 1.8 }))
      } else if (s.born.length) F.push(at(t, { line: 17, born: s.born, cap: cap(`${c[0]} · yeni kimlik ${s.born.join(', ')}`, `${c[1]} · new ID ${s.born.join(', ')}`), hold: 0.9 }))
      else if (t === 12) F.push(at(t, { line: 20, cap: cap('10 konum birikti: hız = doğrunun eğimi', '10 positions collected: speed = slope of the line'), hold: 1.6 }))
      else F.push(at(t, { line: t < 12 ? 16 : 20, cap: c, hold: t < 20 ? 0.5 : 0.32 }))
    }
    const last = DUR - 1
    const nv = R.summary.filter((q) => q.viol).length
    F.push(at(last, {
      line: 22, summary: R.summary, switches: R.switches, nTracks: R.nTracks,
      cap: cap(`5 araç → ${R.nTracks} kimlik · kimlik değişimi ${R.switches} · ${nv} ihlal`, `5 vehicles → ${R.nTracks} IDs · ID switches ${R.switches} · ${nv} violations`),
      hold: 3,
    }))
    return F
  },
}

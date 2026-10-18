// Ders: tehlikeli bölge ihlali. Robot hücresinin tavan kamerası işçilerin kutularını ve kask/yelek (KKD) bayraklarını verir.
// Kutunun ayak noktası, robot kolunun çalışma alanı olan çokgenin içinde mi? Işın atma ile bulunur; KKD'siz giriş alarm verir.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

export const FPS = 10
const DUR = 30
const N = DUR * FPS
/** Hücre 12 m × 8 m (görüntü ekseni: y aşağı). Kolun tabanı (6, 4). */
export const CELL = { w: 12, h: 8 }
export const BASE: [number, number] = [6, 4]
/** Tehlike bölgesi (ölçek 1): kolun erişimi, altta konveyör girintisi (içbükey). */
export const ZONE: Array<[number, number]> = [[3.4, 2.4], [6.4, 1.6], [8.8, 2.6], [9, 4.8], [8.6, 6.6], [7.6, 6.6], [7.3, 5.3], [6.7, 5.3], [6.4, 6.6], [4.2, 6.4], [3, 4.4]]

export function zoneAt(scale: number): Array<[number, number]> {
  return ZONE.map(([x, y]) => [BASE[0] + (x - BASE[0]) * scale, BASE[1] + (y - BASE[1]) * scale])
}

/** Işın atma: noktadan sağa giden yatay ışının kestiği kenarların x'leri. Tek sayıda kesişim = içeride. */
export function rayHits(x: number, y: number, P: Array<[number, number]>): number[] {
  const hits: number[] = []
  for (let i = 0; i < P.length; i++) {
    const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]
    if (y1 > y !== y2 > y) {
      const xs = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)
      if (xs > x) hits.push(xs)
    }
  }
  return hits.sort((a, b) => a - b)
}
export const inside = (x: number, y: number, P: Array<[number, number]>) => rayHits(x, y, P).length % 2 === 1

/** İşçiler: kapalı yol, hız (m/s), köşelerde bekleme (s), başlangıç gecikmesi (s), kask, yelek. */
export const WORKERS = [
  { path: [[1, 1.5], [11, 1.5], [11, 7.3], [1, 7.3]], v: 1.2, dwell: 0, off: 0, helmet: true, vest: true },
  { path: [[0.8, 5], [5.4, 3.7]], v: 1.0, dwell: 3, off: 0, helmet: false, vest: true },
  { path: [[11.3, 6], [7.6, 4.4]], v: 0.9, dwell: 4, off: 6, helmet: true, vest: true },
  { path: [[1.5, 6.9], [10.5, 6.9]], v: 1.1, dwell: 1, off: 3, helmet: true, vest: true },
  { path: [[11.3, 1.8], [8.5, 2.2]], v: 0.8, dwell: 2, off: 10, helmet: false, vest: false },
  { path: [[0.8, 2.6], [3.6, 3.4]], v: 0.9, dwell: 2, off: 4, helmet: true, vest: false },
] as const

function posAt(w: (typeof WORKERS)[number], t: number): [number, number] {
  const P = w.path, n = P.length
  const legs = P.map((a, i) => { const b = P[(i + 1) % n]; return Math.hypot(b[0] - a[0], b[1] - a[1]) / w.v })
  const cyc = legs.reduce((s, x) => s + x + w.dwell, 0)
  let u = (((t + w.off) % cyc) + cyc) % cyc
  for (let i = 0; i < n; i++) {
    if (u < w.dwell) return [P[i][0], P[i][1]]
    u -= w.dwell
    if (u < legs[i]) { const a = P[i], b = P[(i + 1) % n], f = u / legs[i]; return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])] }
    u -= legs[i]
  }
  return [P[0][0], P[0][1]]
}

export interface Person {
  k: number
  /** Kutu (m): sol, üst, genişlik, yükseklik; ayak noktası = alt kenarın ortası. */
  bx: number; by: number; bw: number; bh: number
  fx: number; fy: number
  helmet: boolean; vest: boolean
  /** Son 5 karenin çoğunluk oyu: kask VE yelek var. */
  ppe: boolean
  inside: boolean
}
export interface ZoneEvent { t: number; k: number; kind: 'alarm' | 'warn' }
export type RobotState = 'run' | 'slow' | 'stop'
export interface ZoneFrame extends Frame {
  t: number
  zone: Array<[number, number]>
  people: Person[]
  events: ZoneEvent[]
  robot: RobotState
  arm: number
  ray?: { k: number; hits: number[] }
  /** Eğitimde: kişilerin tek tek tespit sırası (ilk karede). */
  focus?: number
  summary?: { alarms: number; warns: number }
}

/** Bütün sahne: kutular (gürültülü), KKD bayrağı (%6 hatalı, 5 kare çoğunluk), giriş olayları, robot durumu. */
export function simulate(scale: number, nPeople: number, seed = 5) {
  const r = rng(seed)
  const zone = zoneAt(scale)
  const W = WORKERS.slice(0, nPeople)
  const hist = W.map(() => [] as boolean[])
  const state = W.map(() => ({ in: false, run: 0 }))
  const events: ZoneEvent[] = []
  const frames: Array<{ people: Person[]; events: ZoneEvent[]; robot: RobotState; arm: number }> = []
  let arm = 0
  for (let i = 0; i < N; i++) {
    const t = i / FPS
    const people: Person[] = W.map((w, k) => {
      const [x, y] = posAt(w, t)
      const fx = x + 0.05 * gauss(r), fy = y + 0.05 * gauss(r)
      const bh = 1.15 + 0.04 * gauss(r), bw = 0.55 + 0.03 * gauss(r)
      const helmet = r() < 0.06 ? !w.helmet : w.helmet
      const vest = r() < 0.06 ? !w.vest : w.vest
      hist[k].push(helmet && vest)
      const last = hist[k].slice(-5)
      const ppe = last.filter(Boolean).length * 2 > last.length
      // giriş/çıkış: iki ardışık kare aynı sonucu vermeli
      const now = inside(fx, fy, zone)
      const s = state[k]
      if (now !== s.in) { s.run++; if (s.run >= 2) { s.in = now; s.run = 0; if (now) events.push({ t: i, k, kind: ppe ? 'warn' : 'alarm' }) } } else s.run = 0
      return { k, bx: fx - bw / 2, by: fy - bh, bw, bh, fx, fy, helmet, vest, ppe, inside: s.in }
    })
    const robot: RobotState = people.some((q) => q.inside && !q.ppe) ? 'stop' : people.some((q) => q.inside) ? 'slow' : 'run'
    arm += robot === 'run' ? 0.06 : robot === 'slow' ? 0.015 : 0
    frames.push({ people, events: events.slice(), robot, arm })
  }
  return { zone, frames, events }
}

const RS: Record<RobotState, [string, string]> = { run: ['robot çalışıyor', 'robot running'], slow: ['robot yavaşladı', 'robot slowed'], stop: ['ROBOT DURDU', 'ROBOT STOPPED'] }
export const robotName = (s: RobotState) => RS[s]

export const BOLGE_IHLALI: Lesson<ZoneFrame> = {
  slug: 'bolge-ihlali',
  n: 0,
  title: { tr: 'Tehlikeli bölge ihlali ve KKD', en: 'Danger-zone intrusion and PPE' },
  sub: { tr: 'Işın atma ile çokgen içi testi: robot hücresine kim, nasıl girdi?', en: 'Point-in-polygon by ray casting: who entered the robot cell, and how?' },
  story: {
    tr: 'Bir endüstriyel robot hücresi 12 m × 8 m. Ortadaki robot kolunun çalışma alanı, 11 köşeli bir çokgenle işaretlendi (altta konveyör için içe girinti var). Tavan kamerası 30 saniye boyunca saniyede 10 kez her işçinin kutusunu (±5 cm) ve kask/yelek sınıflandırıcısının kararını veriyor (kararların %6\'sı hatalı). İşçilerden biri kasksız, biri yeleksiz, biri ikisi de olmadan dolaşıyor.',
    en: 'An industrial robot cell is 12 m × 8 m. The working area of the robot arm in the middle is marked by an 11-cornered polygon (with a notch for the conveyor at the bottom). For 30 seconds the ceiling camera gives, 10 times a second, each worker\'s box (±5 cm) and the helmet/vest classifier\'s decision (6% of decisions are wrong). One worker walks around without a helmet, one without a vest, one with neither.',
  },
  how: [
    { tr: 'Kişinin yeri kutunun ortası değil, ayak noktasıdır (alt kenarın ortası): yere değen nokta budur.', en: 'A person\'s position is not the box centre but the foot point (the middle of the bottom edge): that is where they touch the floor.' },
    { tr: 'Işın atma: ayak noktasından sağa yatay bir ışın gönder, çokgenin kaç kenarını kestiğini say. Tek sayı içeride, çift sayı dışarıda. İçbükey çokgende de çalışır.', en: 'Ray casting: send a horizontal ray to the right from the foot point and count how many polygon edges it crosses. Odd means inside, even means outside. It works for concave polygons too.' },
    { tr: 'Titreşim yüzünden sınırda gidip gelmesin diye giriş, iki ardışık karede aynı sonuçla onaylanır. KKD kararı son 5 karenin çoğunluk oyudur.', en: 'So that jitter at the border does not flip it back and forth, an entry is confirmed by two consecutive frames. The PPE decision is the majority vote of the last 5 frames.' },
    { tr: 'KKD\'li giriş uyarıdır ve robot yavaşlar; kask ya da yelek eksikse alarm çalar ve robot durur.', en: 'An entry with PPE is a warning and the robot slows down; if the helmet or vest is missing an alarm sounds and the robot stops.' },
    { tr: 'Şunu dene: bölgeyi 1,3 kat büyüt; çevrede dolaşan işçiler de bölgeye girer. Kişi sayısını 6\'ya çıkar; daha çok alarm görürsün.', en: 'Try this: make the zone 1.3 times larger; workers walking around the edge enter it too. Raise the number of people to 6 and you see more alarms.' },
  ],
  why: {
    tr: 'Endüstriyel robot hücrelerinde, şantiyelerde ve depolarda kamera tabanlı güvenlik bölgeleri ışık perdelerinin ve çitlerin yerini alıyor; iş birlikçi robotlar insan yaklaşınca hızını düşürür (ISO/TS 15066). Aynı nokta-çokgen testi haritalarda konum sorgusunda, drone coğrafi çitlerinde (geofence) ve otonom araçlarda şerit içinde olup olmamayı anlamada kullanılır.',
    en: 'In industrial robot cells, construction sites and warehouses, camera-based safety zones are replacing light curtains and fences; collaborative robots slow down when a person comes close (ISO/TS 15066). The same point-in-polygon test is used for location queries on maps, for drone geofences, and in autonomous vehicles to tell whether they are inside a lane.',
  },
  file: 'bolge.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(5)'],
    ['Z = np.array([[3.4, 2.4], [6.4, 1.6], [8.8, 2.6], [9, 4.8],', 'tehlike bölgesi (m)', 'danger zone (m)'],
    ['     [8.6, 6.6], [7.6, 6.6], [7.3, 5.3], [6.7, 5.3],', 'altta konveyör girintisi', 'conveyor notch at the bottom'],
    ['     [6.4, 6.6], [4.2, 6.4], [3, 4.4]])'],
    ['def inside(x, y, P):', 'ışın atma', 'ray casting'],
    ['    c = False'],
    ['    for (x1, y1), (x2, y2) in zip(P, np.roll(P, -1, 0)):', 'her kenar', 'every edge'],
    ['        if (y1 > y) != (y2 > y):', 'kenar ışının hizasında mı?', 'does the edge span the ray?'],
    ['            xs = x1 + (y - y1) * (x2 - x1) / (y2 - y1)', 'kesişimin x\'i', 'x of the crossing'],
    ['            if xs > x: c = not c', 'sağdaysa say', 'count it if on the right'],
    ['    return c', 'tek sayı = içeride', 'odd = inside'],
    ['print(inside(6, 4, Z), inside(1, 1, Z), inside(7, 6.2, Z))', 'merkez, köşe, girinti', 'centre, corner, notch'],
    ['start = np.array([[1.0, 5], [11, 6], [11, 2]])', 'ayak noktaları', 'foot points'],
    ['goal = np.array([[5.5, 3.6], [7.5, 4.5], [8.5, 2.2]])'],
    ["msg, was = ['ALARM', 'UYARI', 'ALARM'], [False] * 3", 'KKD yok → alarm', 'no PPE → alarm'],
    ['for t in np.arange(0, 6, 0.1):'],
    ['    foot = start + min(t / 4, 1) * (goal - start)', 'hedefe yürü', 'walk to the goal'],
    ['    foot += rng.normal(0, 0.05, foot.shape)', 'kutu gürültüsü', 'box noise'],
    ['    for k, (x, y) in enumerate(foot):'],
    ['        now = inside(x, y, Z)'],
    ['        if now and not was[k]:', 'yeni giriş', 'new entry'],
    ['            print(round(t, 1), k, msg[k])'],
    ['        was[k] = now'],
  ],
  params: [
    { key: 'zone', label: { tr: 'Bölge büyüklüğü (×)', en: 'Zone size (×)' }, min: 0.6, max: 1.4, step: 0.05, value: 1 },
    { key: 'people', label: { tr: 'Kişi sayısı', en: 'Number of people' }, min: 2, max: 6, step: 1, value: 4 },
  ],
  run({ zone = 1, people = 4 }) {
    const n = Math.round(people)
    const S = simulate(zone, n)
    const F: ZoneFrame[] = []
    const stat = cap(`bölge × ${fmt(zone, 2, 'tr')} · ${n} kişi · 30 s`, `zone × ${zone.toFixed(2)} · ${n} people · 30 s`)
    const at = (i: number, line: number, c: [string, string], hold = 1, extra: Partial<ZoneFrame> = {}): ZoneFrame => {
      const s = S.frames[i]
      return { t: i, zone: S.zone, people: s.people, events: s.events, robot: s.robot, arm: s.arm, line, cap: c, stat, hold, ...extra }
    }
    F.push(at(0, 2, cap('tehlike bölgesi: kolun çalışma alanı, 11 köşe', 'danger zone: the arm\'s working area, 11 corners'), 2, { people: [], events: [] }))
    F.push(at(0, 12, cap('kamera: kişi kutuları; yer = ayak noktası', 'camera: person boxes; position = foot point'), 1.8))
    // ışın atma: önce dışarıdaki biri, sonra içerideki
    const p0 = S.frames[0].people[0]
    const h0 = rayHits(p0.fx, p0.fy, S.zone)
    F.push(at(0, 7, cap(`işçi 1: ışın ${h0.length} kenar kesti → ${h0.length % 2 ? 'içeride' : 'dışarıda'}`, `worker 1: the ray crossed ${h0.length} edges → ${h0.length % 2 ? 'inside' : 'outside'}`), 2.2, { ray: { k: 0, hits: h0 } }))
    const firstIn = S.frames.findIndex((s) => s.people.some((q) => q.inside))
    for (let i = 1; i < N; i++) {
      const s = S.frames[i], prevE = S.frames[i - 1].events.length
      if (s.events.length > prevE) {
        const e = s.events.at(-1)!
        const q = s.people[e.k]
        if (i === firstIn) {
          const h = rayHits(q.fx, q.fy, S.zone)
          F.push(at(i, 9, cap(`işçi ${e.k + 1}: ışın ${h.length} kenar kesti → içeride`, `worker ${e.k + 1}: the ray crossed ${h.length} edge${h.length > 1 ? 's' : ''} → inside`), 2.2, { ray: { k: e.k, hits: h } }))
        }
        F.push(at(i, 22, e.kind === 'alarm'
          ? cap(`ALARM: işçi ${e.k + 1} bölgede, ${!WORKERS[e.k].helmet ? 'kasksız' : 'yeleksiz'} → robot durdu`, `ALARM: worker ${e.k + 1} in the zone, no ${!WORKERS[e.k].helmet ? 'helmet' : 'vest'} → robot stopped`)
          : cap(`uyarı: işçi ${e.k + 1} bölgede, KKD tam → robot yavaşladı`, `warning: worker ${e.k + 1} in the zone, full PPE → robot slowed`), e.kind === 'alarm' ? 2.2 : 1.8))
        continue
      }
      if (i % 2) continue
      const c = cap(`${fmt(i / FPS, 1, 'tr')} s · ${robotName(s.robot)[0]}`, `${(i / FPS).toFixed(1)} s · ${robotName(s.robot)[1]}`)
      F.push(at(i, i < 40 ? 20 : 19, c, i < 30 ? 0.7 : 0.35))
    }
    const al = S.events.filter((e) => e.kind === 'alarm').length, wr = S.events.length - al
    F.push(at(N - 1, 23, cap(`30 s: ${al} alarm, ${wr} uyarı`, `30 s: ${al} alarms, ${wr} warnings`), 3, { summary: { alarms: al, warns: wr } }))
    return F
  },
}

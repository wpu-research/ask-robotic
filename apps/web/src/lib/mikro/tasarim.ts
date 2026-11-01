// Robotunu Tasarla: parça kataloğu, ızgaraya yerleştirme, doğrulama ve türetilen fizik.
// Tasarım bir şasi ızgarasına yerleştirilmiş parçalardır; `deriveDesign` kütleyi, ağırlık merkezini, destek çokgenini,
// güç bütçesini ve sürüş özelliklerini hesaplar ve var olan benzetimin (DriveBase) okuduğu bir RobotProfile üretir.
// Böylece tasarlanan robot aynı blok programlarıyla görevlerde ve serbest arenada çalışır. Saf TypeScript; Node'da başsız çalışır.
// Parçalar özgündür; hiçbir ürünün adı, görseli ya da kodu kullanılmaz.
import type { RobotProfile, RobotSensor, SensorMount } from './robot'

/** Izgara adımı (m): her hücre 2 cm × 2 cm. */
export const PITCH = 0.02
const G = 9.81
/** Yuvarlanma direnci katsayısı (plastik teker, masa/zemin). */
const CRR = 0.08
/** Motorların anma gerilimi (V). */
const V_NOM = 6

export type ChassisId = 'kucuk' | 'orta' | 'buyuk'
export interface ChassisSpec { id: ChassisId; title: string; en: string; cols: number; rows: number; massG: number }
/** `cols` ileri yönde (x), `rows` yanlamasına (y) hücre sayısı. */
export const CHASSIS: Record<ChassisId, ChassisSpec> = {
  kucuk: { id: 'kucuk', title: 'Küçük şasi', en: 'Small chassis', cols: 5, rows: 4, massG: 45 },
  orta: { id: 'orta', title: 'Orta şasi', en: 'Medium chassis', cols: 7, rows: 5, massG: 80 },
  buyuk: { id: 'buyuk', title: 'Büyük şasi', en: 'Large chassis', cols: 9, rows: 6, massG: 130 },
}
export const CHASSIS_IDS = Object.keys(CHASSIS) as ChassisId[]

export type PartGroup = 'teker' | 'motor' | 'sensor' | 'eyleyici' | 'pil'
export type PartType =
  | 'teker-kucuk' | 'teker-buyuk' | 'palet' | 'omni'
  | 'motor-mini' | 'motor-std' | 'motor-guclu'
  | 'sarhos'
  | 'mesafe-ir' | 'ultrasonik' | 'renk' | 'isik' | 'cizgi' | 'tampon' | 'jiroskop'
  | 'kiskac'
  | 'pil-4aa' | 'pil-6aa' | 'lipo-1s' | 'lipo-2s'

/** Parçanın takılabildiği yer: kenar (sol/sağ yan), ön kenar ya da her yer. */
export type Mount = 'yan' | 'on' | 'her'

export interface PartSpec {
  type: PartType
  group: PartGroup
  title: string
  en: string
  /** Çocuk kipinde gösterilen kısa açıklama. */
  tip: string
  tipEn: string
  massG: number
  /** Tipik akım (mA) ve en yüksek akım (mA; motorda kilitlenme akımı). */
  mA: number
  peakMA?: number
  mount: Mount
  /** Mikro Kart portu: motor portu (A-D) ya da sensör portu (1-4). */
  port?: 'motor' | 'sensor'
  /** Ağırlık merkezi yüksekliği (m, şasi üst yüzeyinden). */
  h: number
  color: string
  // ---- türe özgü ----
  wheel?: { d: number; w: number; slip: number; traction: number; /** paletin zemine değen boyu (m) */ contact?: number }
  motor?: { /** boşta hız (derece/sn, 6 V) */ rpmDeg: number; /** kilitlenme torku (N·m) */ stallNm: number }
  sensor?: { kind: RobotSensor; /** görüş açısı (derece) ve menzil (cm); zemine bakanlar için küçük */ fovDeg: number; rangeCm: number; down?: boolean }
  battery?: { v: number; mAh: number; maxMA: number }
}

const P = (s: PartSpec) => s
export const PARTS: Record<PartType, PartSpec> = {
  'teker-kucuk': P({ type: 'teker-kucuk', group: 'teker', title: 'Küçük teker', en: 'Small wheel', tip: 'Hafif ve çevik; yavaş ama dönüşleri kısa.', tipEn: 'Light and nimble; slower but turns tightly.', massG: 12, mA: 0, mount: 'yan', h: 0, color: '#334155', wheel: { d: 0.043, w: 0.012, slip: 1, traction: 1 } }),
  'teker-buyuk': P({ type: 'teker-buyuk', group: 'teker', title: 'Büyük teker', en: 'Large wheel', tip: 'Her turda daha çok yol alır: daha hızlı.', tipEn: 'Covers more ground every turn: faster.', massG: 20, mA: 0, mount: 'yan', h: 0, color: '#1f2937', wheel: { d: 0.056, w: 0.012, slip: 1, traction: 1 } }),
  palet: P({ type: 'palet', group: 'teker', title: 'Palet', en: 'Track', tip: 'Çok sağlam durur ama dönerken kayar; jiroskop ekle.', tipEn: 'Very stable but skids when turning; add a gyro.', massG: 45, mA: 0, mount: 'yan', h: 0, color: '#0f172a', wheel: { d: 0.04, w: 0.016, slip: 0.72, traction: 1.2, contact: 0.08 } }),
  omni: P({ type: 'omni', group: 'teker', title: 'Omni teker', en: 'Omni wheel', tip: 'Yanlara kayabilen makaralı teker: dönüşü kolay, tutuşu az.', tipEn: 'A wheel with side rollers: easy turns, less grip.', massG: 25, mA: 0, mount: 'yan', h: 0, color: '#7c3aed', wheel: { d: 0.048, w: 0.014, slip: 1, traction: 0.7 } }),
  'motor-mini': P({ type: 'motor-mini', group: 'motor', title: 'Mini motor', en: 'Mini motor', tip: 'Hafif ve hızlı ama güçsüz.', tipEn: 'Light and fast but weak.', massG: 18, mA: 110, peakMA: 600, mount: 'her', port: 'motor', h: 0.012, color: '#64748b', motor: { rpmDeg: 950, stallNm: 0.1 } }),
  'motor-std': P({ type: 'motor-std', group: 'motor', title: 'Standart motor', en: 'Standard motor', tip: 'Hız ve güç dengeli.', tipEn: 'Balanced speed and strength.', massG: 32, mA: 160, peakMA: 1100, mount: 'her', port: 'motor', h: 0.014, color: '#475569', motor: { rpmDeg: 840, stallNm: 0.25 } }),
  'motor-guclu': P({ type: 'motor-guclu', group: 'motor', title: 'Güçlü motor', en: 'Strong motor', tip: 'Ağır robotu taşır ama daha yavaş döner.', tipEn: 'Carries a heavy robot but spins slower.', massG: 55, mA: 230, peakMA: 1800, mount: 'her', port: 'motor', h: 0.016, color: '#1e293b', motor: { rpmDeg: 620, stallNm: 0.5 } }),
  sarhos: P({ type: 'sarhos', group: 'teker', title: 'Sarhoş teker', en: 'Caster', tip: 'Her yöne dönen bilye: robotun devrilmesini önler.', tipEn: 'A ball that rolls any way: keeps the robot from tipping.', massG: 8, mA: 0, mount: 'her', h: -0.01, color: '#9ca3af' }),
  'mesafe-ir': P({ type: 'mesafe-ir', group: 'sensor', title: 'Kızılötesi mesafe', en: 'IR distance', tip: 'Dar bakar, yakını görür (80 cm).', tipEn: 'Narrow beam, sees close things (80 cm).', massG: 6, mA: 30, mount: 'her', port: 'sensor', h: 0.012, color: '#111827', sensor: { kind: 'distance', fovDeg: 8, rangeCm: 80 } }),
  ultrasonik: P({ type: 'ultrasonik', group: 'sensor', title: 'Ultrasonik mesafe', en: 'Ultrasonic distance', tip: 'Ses dalgasıyla uzağı görür (250 cm), geniş bakar.', tipEn: 'Sees far with sound waves (250 cm), wide beam.', massG: 10, mA: 15, mount: 'her', port: 'sensor', h: 0.014, color: '#cbd5e1', sensor: { kind: 'distance', fovDeg: 30, rangeCm: 250 } }),
  renk: P({ type: 'renk', group: 'sensor', title: 'Renk sensörü', en: 'Color sensor', tip: 'Zemine bakar, rengi ve yansıyan ışığı ölçer.', tipEn: 'Looks at the floor, reads color and reflected light.', massG: 5, mA: 25, mount: 'her', port: 'sensor', h: -0.005, color: '#0ea5e9', sensor: { kind: 'color', fovDeg: 20, rangeCm: 2, down: true } }),
  isik: P({ type: 'isik', group: 'sensor', title: 'Işık sensörü', en: 'Light sensor', tip: 'Yalnız yansıyan ışığı ölçer: ucuz ve hafif.', tipEn: 'Only reads reflected light: cheap and light.', massG: 3, mA: 10, mount: 'her', port: 'sensor', h: -0.005, color: '#fbbf24', sensor: { kind: 'light', fovDeg: 20, rangeCm: 2, down: true } }),
  cizgi: P({ type: 'cizgi', group: 'sensor', title: 'Çizgi sensörü dizisi', en: 'Line sensor array', tip: 'Altta iki göz: çizginin solda mı sağda mı kaldığını söyler.', tipEn: 'Two eyes underneath: tells if the line is left or right.', massG: 8, mA: 40, mount: 'her', port: 'sensor', h: -0.005, color: '#065f46', sensor: { kind: 'line', fovDeg: 30, rangeCm: 2, down: true } }),
  tampon: P({ type: 'tampon', group: 'sensor', title: 'Tampon (dokunma)', en: 'Bumper (touch)', tip: 'Ön kenara takılır; duvara değince basılır.', tipEn: 'Goes on the front edge; pressed when it touches a wall.', massG: 6, mA: 1, mount: 'on', port: 'sensor', h: 0.005, color: '#94a3b8', sensor: { kind: 'force', fovDeg: 60, rangeCm: 1 } }),
  jiroskop: P({ type: 'jiroskop', group: 'sensor', title: 'Jiroskop', en: 'Gyro', tip: 'Ne kadar döndüğünü ölçer: kayan robot da tam döner.', tipEn: 'Measures how far it turned: even a skidding robot turns exactly.', massG: 3, mA: 5, mount: 'her', port: 'sensor', h: 0.006, color: '#e11d48', sensor: { kind: 'gyro', fovDeg: 0, rangeCm: 0 } }),
  kiskac: P({ type: 'kiskac', group: 'eyleyici', title: 'Kıskaç kolu', en: 'Gripper arm', tip: 'Ön kenara takılır; küpü tutar ve rengini okur. Bir motor portu kullanır.', tipEn: 'Goes on the front edge; grabs a cube and reads its color. Uses a motor port.', massG: 40, mA: 120, peakMA: 500, mount: 'on', port: 'motor', h: 0.01, color: '#475569' }),
  'pil-4aa': P({ type: 'pil-4aa', group: 'pil', title: '4 × AA pil', en: '4 × AA pack', tip: '6 V: motorlar tam hızında döner.', tipEn: '6 V: motors run at their full speed.', massG: 110, mA: 0, mount: 'her', h: 0.012, color: '#f97316', battery: { v: 6, mAh: 2000, maxMA: 3000 } }),
  'pil-6aa': P({ type: 'pil-6aa', group: 'pil', title: '6 × AA pil', en: '6 × AA pack', tip: '9 V: motorlar hızlanır ama ısınır ve pil ağırdır.', tipEn: '9 V: motors speed up but get hot, and the pack is heavy.', massG: 160, mA: 0, mount: 'her', h: 0.014, color: '#ea580c', battery: { v: 9, mAh: 2000, maxMA: 3000 } }),
  'lipo-1s': P({ type: 'lipo-1s', group: 'pil', title: 'Lityum pil (1 hücre)', en: 'Lithium pack (1 cell)', tip: 'Çok hafif ama 3,7 V: motorlar yavaş döner.', tipEn: 'Very light but 3.7 V: motors spin slowly.', massG: 20, mA: 0, mount: 'her', h: 0.006, color: '#2563eb', battery: { v: 3.7, mAh: 600, maxMA: 3000 } }),
  'lipo-2s': P({ type: 'lipo-2s', group: 'pil', title: 'Lityum pil (2 hücre)', en: 'Lithium pack (2 cells)', tip: '7,4 V ve hafif: hızlı robot için.', tipEn: '7.4 V and light: for a fast robot.', massG: 60, mA: 0, mount: 'her', h: 0.01, color: '#1d4ed8', battery: { v: 7.4, mAh: 1000, maxMA: 8000 } }),
}
export const PART_TYPES = Object.keys(PARTS) as PartType[]
export const PART_GROUPS: Array<{ id: PartGroup; title: string; en: string }> = [
  { id: 'teker', title: 'Tekerler', en: 'Wheels' },
  { id: 'motor', title: 'Motorlar', en: 'Motors' },
  { id: 'sensor', title: 'Sensörler', en: 'Sensors' },
  { id: 'eyleyici', title: 'Kıskaç', en: 'Gripper' },
  { id: 'pil', title: 'Piller', en: 'Batteries' },
]

/** Mikro Kart: şasinin ortasında 2×2 hücre, her tasarımda vardır. 4 motor portu (A-D), 4 sensör portu (1-4). */
export const CARD = { massG: 15, mA: 40, motorPorts: 4, sensorPorts: 4, h: 0.006 }

/** Parça: hücre (c: arkadan öne sütun, r: soldan sağa satır) ve dönüş (0-3, çeyrek tur sola). */
export interface PlacedPart { id: string; type: PartType; c: number; r: number; rot?: number }
/** : serbest çizilmiş gövde blokları (lib/mikro/govde.ts). Yoksa şasi tek levhadır. */
export interface RobotDesign { v: 1; name: string; chassis: ChassisId; parts: PlacedPart[]; govde?: { v: 1; blocks: unknown[] } }

// ---------------- ızgara ----------------
/** Hücre merkezi, şasi merkezine göre (ileri x, sola y; m). */
export function cellXY(ch: ChassisSpec, c: number, r: number): [number, number] {
  return [(c - (ch.cols - 1) / 2) * PITCH, ((ch.rows - 1) / 2 - r) * PITCH]
}
/** Mikro Kart'ın kapladığı hücreler. */
export function cardCells(ch: ChassisSpec): Array<[number, number]> {
  const c0 = Math.floor((ch.cols - 2) / 2), r0 = Math.floor((ch.rows - 2) / 2)
  return [[c0, r0], [c0 + 1, r0], [c0, r0 + 1], [c0 + 1, r0 + 1]]
}
const isCard = (ch: ChassisSpec, c: number, r: number) => cardCells(ch).some(([a, b]) => a === c && b === r)
const isSide = (ch: ChassisSpec, r: number) => r === 0 || r === ch.rows - 1

/** Bu hücreye bu parça takılabilir mi; değilse çocuk dilinde neden. */
export function canPlace(d: RobotDesign, type: PartType, c: number, r: number, ignoreId?: string): { ok: true } | { ok: false; why: string; whyEn: string } {
  const ch = CHASSIS[d.chassis]
  const spec = PARTS[type]
  if (c < 0 || r < 0 || c >= ch.cols || r >= ch.rows) return { ok: false, why: 'Şasinin dışında.', whyEn: 'Outside the chassis.' }
  if (isCard(ch, c, r)) return { ok: false, why: 'Burada Mikro Kart var.', whyEn: 'The Micro Card is here.' }
  if (d.parts.some((p) => p.c === c && p.r === r && p.id !== ignoreId)) return { ok: false, why: 'Bu hücre dolu.', whyEn: 'This cell is taken.' }
  if (spec.mount === 'yan' && !isSide(ch, r)) return { ok: false, why: 'Tekerler yalnız sol ya da sağ kenara takılır.', whyEn: 'Wheels only go on the left or right edge.' }
  if (spec.mount === 'on' && c !== ch.cols - 1) return { ok: false, why: 'Bu parça yalnız ön kenara takılır.', whyEn: 'This part only goes on the front edge.' }
  return { ok: true }
}

let seq = 0
const newId = (t: PartType) => `${t}-${Date.now().toString(36)}-${(seq++).toString(36)}`

/** Parçayı yerleştirir (yeni tasarım döner). Basit kipte tekere motor kendiliğinden eklenir. */
export function placePart(d: RobotDesign, type: PartType, c: number, r: number, o: { rot?: number; autoMotor?: boolean; id?: string } = {}): RobotDesign {
  if (!canPlace(d, type, c, r).ok) return d
  const parts = [...d.parts, { id: o.id ?? newId(type), type, c, r, ...(o.rot ? { rot: o.rot } : {}) }]
  let next: RobotDesign = { ...d, parts }
  if (o.autoMotor && PARTS[type].wheel) {
    const ch = CHASSIS[d.chassis]
    const mr = r === 0 ? 1 : ch.rows - 2
    if (canPlace(next, 'motor-std', c, mr).ok && !next.parts.some((p) => p.c === c && p.r === mr)) next = { ...next, parts: [...next.parts, { id: newId('motor-std'), type: 'motor-std', c, r: mr }] }
  }
  return next
}
export function removePart(d: RobotDesign, id: string): RobotDesign { return { ...d, parts: d.parts.filter((p) => p.id !== id) } }
export function movePart(d: RobotDesign, id: string, c: number, r: number): RobotDesign {
  const p = d.parts.find((q) => q.id === id)
  if (!p || !canPlace(d, p.type, c, r, id).ok) return d
  return { ...d, parts: d.parts.map((q) => (q.id === id ? { ...q, c, r } : q)) }
}
export function rotatePart(d: RobotDesign, id: string): RobotDesign {
  return { ...d, parts: d.parts.map((q) => (q.id === id ? { ...q, rot: ((q.rot ?? 0) + 1) % 4 } : q)) }
}
/** Şasiyi değiştirir; yeni şasiye sığmayan ya da kuralına uymayan parçalar düşer. */
export function setChassis(d: RobotDesign, chassis: ChassisId): RobotDesign {
  let next: RobotDesign = { ...d, chassis, parts: [] }
  const old = CHASSIS[d.chassis], ch = CHASSIS[chassis]
  for (const p of d.parts) {
    // kenar ve ön kenar parçaları yeni şasinin kenarına taşınır
    const c = PARTS[p.type].mount === 'on' || p.c === old.cols - 1 ? ch.cols - 1 : Math.min(p.c, ch.cols - 1)
    const r = p.r === old.rows - 1 ? ch.rows - 1 : p.r === 0 ? 0 : Math.min(p.r, ch.rows - 2)
    if (canPlace(next, p.type, c, r).ok) next = { ...next, parts: [...next.parts, { ...p, c, r }] }
  }
  return next
}

// ---------------- türetme ----------------
export type IssueLevel = 'hata' | 'uyari'
export interface Issue { level: IssueLevel; code: string; text: string; en: string; partId?: string }

export interface DriveSide { wheels: PlacedPart[]; motors: PlacedPart[] }
export interface DerivedDesign {
  massG: number
  /** Ağırlık merkezi: dönüş merkezine göre (ileri x, sola y) ve yükseklik z (yerden, m). */
  com: { x: number; y: number; z: number }
  /** Destek çokgeni (dönüş merkezine göre, saat yönünün tersine). */
  support: Array<[number, number]>
  /** CoM'un destek çokgeni kenarına en kısa uzaklığı (m; içerideyse +). */
  stabilityMargin: number
  /** Statik devrilme açısı (derece): robot bu kadar eğik zeminde devrilmez. */
  tipAngleDeg: number
  /** Dönüş merkezinin şasi merkezine göre x konumu (m). */
  originX: number
  wheel: PartSpec | null
  wheelBase: number
  left: DriveSide
  right: DriveSide
  driveMotors: number
  coupled: boolean
  voltage: number
  /** Tipik ve en yüksek akım (mA), pil sınırı, tahmini çalışma süresi (dk). */
  currentMA: number
  peakMA: number
  battery: PartSpec | null
  runtimeMin: number
  motorPortsUsed: number
  sensorPortsUsed: number
  /** Motor başına yük oranı (yuvarlanma torku / kilitlenme torku). */
  loadRatio: number
  maxDegPerS: number
  /** En yüksek hız (cm/sn) ve yerinde dönüş hızı (derece/sn). */
  speedCmS: number
  turnDegS: number
  tauS: number
  turnSlip: number
  sensors: RobotSensor[]
  issues: Issue[]
  ok: boolean
  profile: RobotProfile
}


/** Noktaların dışbükey zarfı (saat yönünün tersine). */
export function convexHull(pts: Array<[number, number]>): Array<[number, number]> {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]).filter((q, i, a) => i === 0 || q[0] !== a[i - 1][0] || q[1] !== a[i - 1][1])
  if (p.length < 3) return p
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lo: Array<[number, number]> = [], up: Array<[number, number]> = []
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-12) lo.pop(); lo.push(q) }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 1e-12) up.pop(); up.push(q) }
  return [...lo.slice(0, -1), ...up.slice(0, -1)]
}

/** Noktanın dışbükey çokgene işaretli uzaklığı (içeride +, dışarıda -). Çokgen 3 köşeden azsa -Infinity değil, kenara uzaklığın eksisi. */
export function polygonMargin(poly: Array<[number, number]>, x: number, y: number): number {
  if (poly.length < 3) {
    if (!poly.length) return -Infinity
    // doğru parçası ya da nokta: üstündeyse 0, değilse eksi uzaklık
    const [a, b] = [poly[0], poly[poly.length - 1]]
    const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy
    const t = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0
    return -Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)
  }
  let inside = true, best = Infinity
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy)
    const side = (dx * (y - a[1]) - dy * (x - a[0])) / L // saat yönünün tersindeki çokgende içerisi +
    if (side < 0) inside = false
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (L * L)))
    best = Math.min(best, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy))
  }
  return inside ? best : -best
}

export function deriveDesign(d: RobotDesign): DerivedDesign {
  const ch = CHASSIS[d.chassis]
  const issues: Issue[] = []
  const err = (code: string, text: string, en: string, partId?: string) => issues.push({ level: 'hata', code, text, en, partId })
  const warn = (code: string, text: string, en: string, partId?: string) => issues.push({ level: 'uyari', code, text, en, partId })
  const spec = (p: PlacedPart) => PARTS[p.type]
  const of = (g: PartGroup) => d.parts.filter((p) => spec(p).group === g)

  // ---- sürüş: kenardaki tekerler ve hemen içerideki motorlar ----
  const wheels = d.parts.filter((p) => spec(p).wheel)
  const motorAt = (c: number, r: number) => d.parts.find((p) => p.c === c && p.r === r && spec(p).motor)
  const side = (r: number, inner: number): DriveSide => {
    const ws = wheels.filter((w) => w.r === r)
    return { wheels: ws, motors: ws.map((w) => motorAt(w.c, inner)).filter((m): m is PlacedPart => !!m) }
  }
  const left = side(0, 1), right = side(ch.rows - 1, ch.rows - 2)
  const driveMotorIds = new Set([...left.motors, ...right.motors].map((m) => m.id))
  const driveMotors = driveMotorIds.size
  const types = new Set(wheels.map((w) => w.type))
  const wheel = wheels.length ? PARTS[wheels[0].type] : null
  if (!left.wheels.length || !right.wheels.length) err('teker', 'Robotun iki yanında da en az bir teker olmalı.', 'The robot needs at least one wheel on each side.')
  if (types.size > 1) err('teker-tur', 'Sol ve sağdaki bütün tekerler aynı türde olmalı.', 'All wheels on both sides must be the same type.')
  if (driveMotors === 0 && wheels.length) err('motor', 'Tekerleri döndürecek motor yok: tekerin hemen yanına (içeriye) bir motor koy.', 'No motor drives the wheels: put a motor right next to (inside) a wheel.')
  // tek motor: iki yandaki tekerler aynı sütunda ise ortak akstadır
  let coupled = false
  if (driveMotors > 0 && (!left.motors.length || !right.motors.length)) {
    const driven = left.motors.length ? left : right
    const other = left.motors.length ? right : left
    const axle = driven.wheels.some((w) => driven.motors.some((m) => m.c === w.c) && other.wheels.some((o) => o.c === w.c))
    if (axle) { coupled = true; warn('tek-motor', 'Tek sürüş motoru: iki teker ortak akstadır, robot dönemez, yalnız düz gider.', 'Single drive motor: both wheels share an axle, the robot cannot turn, only drive straight.') }
    else err('tek-yan', 'Yalnız bir yanda motor var ve karşı teker aynı sütunda değil: robot hep döner. Öbür yana da motor koy ya da tekeri aynı sütuna al.', 'Only one side has a motor and the opposite wheel is not in the same column: the robot would only spin. Add a motor on the other side or line the wheels up.')
  }
  if (left.motors.length && right.motors.length) {
    const ml = left.motors.map((m) => m.type).sort().join(), mr = right.motors.map((m) => m.type).sort().join()
    if (ml !== mr) warn('motor-esit', 'Sol ve sağ motorlar farklı: robot düz gitmek yerine yana çeker.', 'Left and right motors differ: the robot will pull to one side.')
  }
  for (const m of d.parts.filter((p) => spec(p).motor && !driveMotorIds.has(p.id))) warn('bos-motor', 'Bu motor hiçbir tekeri döndürmüyor (tekerin hemen içine koy).', 'This motor drives no wheel (put it right inside a wheel).', m.id)

  // dönüş merkezi: sürülen tekerlerin x ortalaması (yoksa bütün tekerler, o da yoksa şasi merkezi)
  const drivenWheels = [...left.wheels.filter((w) => left.motors.some((m) => m.c === w.c)), ...right.wheels.filter((w) => right.motors.some((m) => m.c === w.c))]
  const refWheels = drivenWheels.length ? drivenWheels : wheels
  const originX = refWheels.length ? refWheels.reduce((s, w) => s + cellXY(ch, w.c, w.r)[0], 0) / refWheels.length : 0
  const wW = wheel?.wheel?.w ?? 0.012
  const wheelBase = ch.rows * PITCH + wW
  const wr = (wheel?.wheel?.d ?? 0.043) / 2
  const plateZ = wr + 0.004

  // ---- kütle ve ağırlık merkezi ----
  let m = ch.massG + CARD.massG, mx = 0, my = 0, mz = ch.massG * plateZ + CARD.massG * (plateZ + CARD.h)
  const cc = cardCells(ch).map(([c, r]) => cellXY(ch, c, r))
  const cardX = cc.reduce((s, q) => s + q[0], 0) / 4, cardY = cc.reduce((s, q) => s + q[1], 0) / 4
  mx += CARD.massG * cardX; my += CARD.massG * cardY
  for (const p of d.parts) {
    const s = spec(p)
    let [x, y] = cellXY(ch, p.c, p.r)
    let z = plateZ + s.h
    if (s.wheel) { y += Math.sign(y) * (PITCH / 2 + s.wheel.w / 2); z = wr }
    m += s.massG; mx += s.massG * x; my += s.massG * y; mz += s.massG * z
  }
  const com = { x: mx / m - originX, y: my / m, z: mz / m }

  // ---- destek çokgeni: teker temas noktaları (palet: iki uç), sarhoş tekerler ----
  const contacts: Array<[number, number]> = []
  for (const w of wheels) {
    const s = spec(w).wheel!
    const [x, y0] = cellXY(ch, w.c, w.r)
    const y = y0 + Math.sign(y0) * (PITCH / 2 + s.w / 2)
    if (s.contact) contacts.push([x - s.contact / 2 - originX, y], [x + s.contact / 2 - originX, y])
    else contacts.push([x - originX, y])
  }
  for (const c of of('teker').filter((p) => p.type === 'sarhos')) { const [x, y] = cellXY(ch, c.c, c.r); contacts.push([x - originX, y]) }
  const support = convexHull(contacts)
  const stabilityMargin = polygonMargin(support, com.x, com.y)
  const tipAngleDeg = stabilityMargin > 0 ? (Math.atan2(stabilityMargin, com.z) * 180) / Math.PI : 0
  if (wheels.length && support.length < 3) err('devrilir', 'Robot iki teker üstünde devrilir: bir sarhoş teker ekle (ya da palet kullan).', 'The robot tips over on two wheels: add a caster (or use tracks).')
  else if (wheels.length && stabilityMargin <= 0) err('devrilir', 'Ağırlık merkezi destek alanının dışında: robot devrilir. Ağır parçaları (pil) tekerlerin arasına al.', 'The center of mass is outside the support area: the robot tips over. Move heavy parts (battery) between the wheels.')
  else if (wheels.length && tipAngleDeg < 12) warn('az-denge', `Denge zayıf (devrilme açısı ${Math.round(tipAngleDeg)}°): pili ortaya ve aşağı al.`, `Weak balance (tip angle ${Math.round(tipAngleDeg)}°): move the battery to the middle and lower.`)

  // ---- güç bütçesi ----
  const batteries = of('pil')
  const battery = batteries.length ? spec(batteries[0]) : null
  if (!battery) err('pil', 'Pil yok: robot çalışmaz.', 'No battery: the robot cannot run.')
  if (batteries.length > 1) warn('cok-pil', 'Birden çok pil: yalnız biri bağlanır, öbürleri yalnız ağırlık ekler.', 'More than one battery: only one is connected, the others only add weight.')
  const voltage = battery?.battery?.v ?? 0
  const currentMA = CARD.mA + d.parts.reduce((s, p) => s + spec(p).mA, 0)
  const peakMA = CARD.mA + d.parts.reduce((s, p) => s + (driveMotorIds.has(p.id) || spec(p).group === 'eyleyici' ? spec(p).peakMA ?? spec(p).mA : spec(p).mA), 0)
  const runtimeMin = battery?.battery ? Math.round((battery.battery.mAh / currentMA) * 60 * 0.8) : 0
  if (battery?.battery && peakMA > battery.battery.maxMA) err('akim', `Motorlar birlikte ${peakMA} mA çekebilir; bu pil en çok ${battery.battery.maxMA} mA verir.`, `The motors can draw ${peakMA} mA together; this battery gives at most ${battery.battery.maxMA} mA.`)
  if (battery && voltage < 4.5) warn('gerilim', `Gerilim düşük (${voltage} V): motorlar yavaş döner.`, `Low voltage (${voltage} V): motors spin slowly.`)
  if (voltage > 7.5) warn('asiri-gerilim', `Gerilim yüksek (${voltage} V): motorlar hızlanır ama ısınır.`, `High voltage (${voltage} V): motors speed up but get hot.`)
  if (battery && runtimeMin < 30) warn('sure', `Pil yaklaşık ${runtimeMin} dakika dayanır.`, `The battery lasts about ${runtimeMin} minutes.`)

  // ---- portlar ----
  const motorPortsUsed = d.parts.filter((p) => spec(p).port === 'motor').length
  const sensorPortsUsed = d.parts.filter((p) => spec(p).port === 'sensor').length
  if (motorPortsUsed > CARD.motorPorts) err('port-motor', `Mikro Kart'ta ${CARD.motorPorts} motor portu var; ${motorPortsUsed} parça motor portu istiyor.`, `The Micro Card has ${CARD.motorPorts} motor ports; ${motorPortsUsed} parts need one.`)
  if (sensorPortsUsed > CARD.sensorPorts) err('port-sensor', `Mikro Kart'ta ${CARD.sensorPorts} sensör portu var; ${sensorPortsUsed} sensör takılı.`, `The Micro Card has ${CARD.sensorPorts} sensor ports; ${sensorPortsUsed} sensors are attached.`)

  // ---- sensörler ----
  const sensorParts = of('sensor')
  const dist = sensorParts.filter((p) => spec(p).sensor!.kind === 'distance')
  if (dist.length > 1) warn('iki-mesafe', 'Birden çok mesafe sensörü: bloklar ilk takılanı okur.', 'More than one distance sensor: the blocks read the first one.')
  for (const k of ['color', 'line', 'light', 'force', 'gyro'] as const) {
    const xs = sensorParts.filter((p) => spec(p).sensor!.kind === k)
    if (xs.length > 1) warn(`iki-${k}`, `${PARTS[xs[0].type].title}: birden çok takılı, bloklar ilkini okur.`, `${PARTS[xs[0].type].en}: more than one attached, the blocks read the first.`, xs[1].id)
  }
  const grippers = of('eyleyici')
  if (grippers.length > 1) warn('iki-kiskac', 'Birden çok kıskaç: yalnız biri kullanılır.', 'More than one gripper: only one is used.')
  const front = (p: PlacedPart) => p.c === ch.cols - 1
  for (const p of dist) if (front(p) === false && (p.rot ?? 0) === 0 && p.c < ch.cols - 2) warn('mesafe-arka', 'Mesafe sensörü önde değil: gövde kendi önünü kapatabilir. Öne al ya da yana çevir.', 'The distance sensor is not at the front: the body may block it. Move it forward or turn it sideways.', p.id)
  const sensors = [...new Set([...sensorParts.map((p) => spec(p).sensor!.kind), ...(grippers.length ? ['gripper' as const] : [])])]

  // ---- sürüş fiziği ----
  const mot = [...driveMotorIds].map((id) => spec(d.parts.find((p) => p.id === id)!).motor!)
  const kg = m / 1000
  const stall = mot.reduce((s, q) => s + q.stallNm, 0)
  const vf = Math.min(1.5, voltage / V_NOM)
  const loadNm = CRR * kg * G * wr
  const loadRatio = stall ? loadNm / (stall * Math.max(0.3, vf)) : Infinity
  const w0 = mot.length ? mot.reduce((s, q) => s + q.rpmDeg, 0) / mot.length : 0
  const maxDegPerS = Math.max(0, Math.round(w0 * vf * (1 - Math.min(1, loadRatio))))
  if (driveMotors && loadRatio > 0.35) err('agir', 'Robot motorlarına göre çok ağır: kıpırdayamaz. Güçlü motor ya da daha hafif parça seç.', 'The robot is too heavy for its motors: it cannot move. Pick stronger motors or lighter parts.')
  else if (driveMotors && loadRatio > 0.2) warn('agir', 'Robot ağır: motorlar zorlanır, yavaşlar.', 'The robot is heavy: the motors strain and slow down.')
  const traction = wheel?.wheel?.traction ?? 1
  // hızlanma süresi: J·ω0/T (eşdeğer eylemsizlik m·r², toplam tork) + motorun kendi tepki süresi
  const tauS = Math.round((0.045 + (kg * wr * wr * ((w0 * vf * Math.PI) / 180)) / Math.max(1e-6, stall * Math.max(0.3, vf)) / traction) * 1000) / 1000
  const perSide = Math.max(left.wheels.length, right.wheels.length)
  const turnSlip = Math.round((wheel?.wheel?.slip ?? 1) * (perSide > 1 && !wheel?.wheel?.contact ? 0.85 : 1) * 100) / 100
  const speedCmS = Math.round((maxDegPerS / 360) * Math.PI * wr * 2 * 100)
  const turnDegS = coupled ? 0 : Math.round(((2 * (speedCmS / 100)) / wheelBase) * turnSlip * (180 / Math.PI))
  if (turnSlip < 1 && !sensors.includes('gyro') && !coupled) warn('kayma', 'Bu tekerler dönerken kayar: "dön" blokları eksik döner. Jiroskop eklersen tam döner.', 'These wheels skid when turning: "turn" blocks fall short. A gyro makes turns exact.')

  // ---- benzetimin okuduğu profil ----
  const at = (p: PlacedPart | undefined): SensorMount | undefined => {
    if (!p) return undefined
    const [x, y] = cellXY(ch, p.c, p.r)
    return { x: x - originX + (front(p) ? PITCH / 2 : 0), y, rot: ((p.rot ?? 0) * Math.PI) / 2 }
  }
  const firstOf = (k: RobotSensor) => sensorParts.find((p) => spec(p).sensor!.kind === k)
  // çarpışma yarıçapı (daire modeli): ön köşelerin dönüş merkezine uzaklığı ya da tekerlerin dış yüzü, hangisi büyükse.
  // Robot ileri giderken çarptığı için ön köşeler belirleyicidir; arkada kalan şasi bu basit modelde sayılmaz.
  const hx = (ch.cols * PITCH) / 2, hy = (ch.rows * PITCH) / 2
  const radius = Math.round(Math.min(0.14, Math.max(0.045, Math.hypot(hx - originX, hy), hy + wW)) * 10000) / 10000
  const gp = grippers[0]
  const ok = !issues.some((i) => i.level === 'hata')
  const profile: RobotProfile = {
    id: 'ozel',
    title: d.name || 'Tasarım robotu',
    summary: `${CHASSIS[d.chassis].title}, ${m} g`,
    wheelBase: Math.round(wheelBase * 1000) / 1000,
    wheelDiameter: wr * 2,
    radius,
    maxDegPerS,
    sensors,
    lights: 'status',
    tauS,
    turnSlip,
    coupled,
    rangeCm: dist.length ? spec(dist[0]).sensor!.rangeCm : undefined,
    mounts: {
      distance: at(dist[0]),
      color: at(firstOf('color') ?? firstOf('light')),
      line: at(firstOf('line')),
      force: at(firstOf('force')),
      gripper: gp ? { x: Math.max(radius, at(gp)!.x), y: at(gp)!.y } : undefined,
    },
    design: d,
  }
  return {
    massG: m, com, support, stabilityMargin, tipAngleDeg, originX, wheel, wheelBase, left, right, driveMotors, coupled, voltage,
    currentMA, peakMA, battery, runtimeMin, motorPortsUsed, sensorPortsUsed, loadRatio, maxDegPerS, speedCmS, turnDegS, tauS, turnSlip,
    sensors, issues, ok, profile,
  }
}

// ---------------- hazır tasarımlar (var olan üç gövde) ----------------
const part = (type: PartType, c: number, r: number, rot?: number): PlacedPart => ({ id: `${type}@${c},${r}`, type, c, r, ...(rot ? { rot } : {}) })

export const TEMPLATES: Array<{ id: 'blok' | 'gezgin' | 'kiskac'; design: RobotDesign; en: string }> = [
  {
    id: 'blok', en: 'Block Robot',
    design: { v: 1, name: 'Blok Robotu', chassis: 'orta', parts: [
      part('teker-buyuk', 4, 0), part('teker-buyuk', 4, 4), part('motor-std', 4, 1), part('motor-std', 4, 3),
      part('sarhos', 0, 2), part('pil-4aa', 1, 2), part('mesafe-ir', 6, 1), part('tampon', 6, 2), part('renk', 5, 2),
    ] },
  },
  {
    id: 'gezgin', en: 'Mini Rover',
    design: { v: 1, name: 'Mini Gezgin', chassis: 'kucuk', parts: [
      part('teker-kucuk', 3, 0), part('teker-kucuk', 3, 3), part('motor-mini', 3, 1), part('motor-mini', 3, 2),
      part('sarhos', 0, 1), part('pil-4aa', 0, 2), part('ultrasonik', 4, 1), part('cizgi', 4, 2),
    ] },
  },
  {
    id: 'kiskac', en: 'Gripper Robot',
    design: { v: 1, name: 'Kıskaçlı Robot', chassis: 'orta', parts: [
      part('teker-buyuk', 4, 0), part('teker-buyuk', 4, 4), part('motor-std', 4, 1), part('motor-std', 4, 3),
      part('sarhos', 0, 2), part('pil-4aa', 1, 2), part('mesafe-ir', 6, 1), part('renk', 5, 2), part('kiskac', 6, 2),
    ] },
  },
]

export const emptyDesign = (name = 'Benim robotum', chassis: ChassisId = 'orta'): RobotDesign => ({ v: 1, name, chassis, parts: [] })

// ---------------- kaydet / aç ----------------
export const DESIGN_FORMAT = 'macademiax.robot-tasarim'
const MAX_PARTS = 80

export function exportDesign(d: RobotDesign): string {
  return JSON.stringify({ format: DESIGN_FORMAT, v: 1, name: d.name, chassis: d.chassis, parts: d.parts.map(({ id, type, c, r, rot }) => ({ id, type, c, r, ...(rot ? { rot } : {}) })) }, null, 2)
}

/** JSON metnini ya da nesnesini doğrular; geçersiz parçaları atmaz, hatayı söyler. */
export function importDesign(raw: unknown): { ok: true; design: RobotDesign } | { ok: false; error: string } {
  let o: unknown = raw
  if (typeof raw === 'string') { try { o = JSON.parse(raw) } catch { return { ok: false, error: 'Dosya JSON değil.' } } }
  if (!o || typeof o !== 'object') return { ok: false, error: 'Tasarım okunamadı.' }
  const x = o as Record<string, unknown>
  if (x.format !== undefined && x.format !== DESIGN_FORMAT) return { ok: false, error: 'Bu bir robot tasarımı dosyası değil.' }
  if (typeof x.chassis !== 'string' || !(x.chassis in CHASSIS)) return { ok: false, error: 'Şasi türü tanınmadı.' }
  if (!Array.isArray(x.parts) || x.parts.length > MAX_PARTS) return { ok: false, error: 'Parça listesi geçersiz.' }
  const ch = CHASSIS[x.chassis as ChassisId]
  let d: RobotDesign = { v: 1, name: typeof x.name === 'string' ? x.name.slice(0, 40) : 'Robot', chassis: x.chassis as ChassisId, parts: [] }
  for (const [i, q] of (x.parts as unknown[]).entries()) {
    const p = q as Record<string, unknown>
    if (!p || typeof p.type !== 'string' || !(p.type in PARTS)) return { ok: false, error: `${i + 1}. parça tanınmadı.` }
    const c = Number(p.c), r = Number(p.r), rot = Number(p.rot ?? 0)
    if (!Number.isInteger(c) || !Number.isInteger(r) || c < 0 || r < 0 || c >= ch.cols || r >= ch.rows) return { ok: false, error: `${i + 1}. parçanın yeri şasinin dışında.` }
    const type = p.type as PartType
    if (!canPlace(d, type, c, r).ok) return { ok: false, error: `${i + 1}. parça (${PARTS[type].title}) bu hücreye takılamaz.` }
    const id = typeof p.id === 'string' && p.id.length <= 60 && !d.parts.some((z) => z.id === p.id) ? p.id : `${type}@${c},${r}`
    d = { ...d, parts: [...d.parts, { id, type, c, r, ...(rot && Number.isInteger(rot) ? { rot: ((rot % 4) + 4) % 4 } : {}) }] }
  }
  return { ok: true, design: d }
}

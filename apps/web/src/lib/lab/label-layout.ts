// Tuval etiket yerleşimi: bacak adları ve parça değer yazıları (330 Ω, %50…) birbirinin üstüne binmesin. Saf (DOM yok).
// Yöntem: etiketler sırayla (öncelik sırasıyla) yerleştirilir; her etiket için aday konumlar denenir ve önceden yerleşmiş
// etiket kutularıyla / engellerle (bacak noktaları) çakışmayan ilk aday seçilir. Hepsi çakışırsa en az çakışan aday seçilir.
import type { PartInstance } from './contract'
import { PART_DEFS, partBounds, pinWorld, type Pt } from './geometry'

export interface Box { x: number; y: number; w: number; h: number }
export type Anchor = 'start' | 'middle' | 'end'
export interface Candidate { x: number; y: number; anchor: Anchor }
export interface LabelItem { id: string; text: string; fontSize: number; candidates: Candidate[] }
export interface PlacedLabel extends Candidate { box: Box; /** true: hiçbir aday çakışmadan yerleşemedi. */ clash: boolean }

/** Kalın 9 px yazı için ortalama karakter genişliği oranı (px/px). */
const CHAR_W = 0.64
const PAD = 1.5

export function labelBox(text: string, fontSize: number, c: Candidate): Box {
  const w = text.length * fontSize * CHAR_W + 2
  const h = fontSize + 1
  const x = c.anchor === 'start' ? c.x : c.anchor === 'end' ? c.x - w : c.x - w / 2
  return { x, y: c.y - fontSize * 0.82, w, h }
}

export const overlaps = (a: Box, b: Box, pad = PAD): boolean =>
  a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad

function overlapArea(a: Box, b: Box): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  return w > 0 && h > 0 ? w * h : 0
}

/** Etiketleri sırayla yerleştirir. `obstacles`: üstüne yazı gelmemesi gereken kutular (bacak noktaları gibi). */
export function layoutLabels(items: LabelItem[], obstacles: Box[] = []): Map<string, PlacedLabel> {
  const out = new Map<string, PlacedLabel>()
  const placed: Box[] = []
  for (const it of items) {
    let best: PlacedLabel | null = null
    let bestCost = Infinity
    for (let i = 0; i < it.candidates.length; i++) {
      const c = it.candidates[i]
      const box = labelBox(it.text, it.fontSize, c)
      let cost = 0
      for (const o of placed) if (overlaps(box, o)) cost += 1000 + overlapArea(box, o)
      for (const o of obstacles) if (overlaps(box, o, 0.5)) cost += 400 + overlapArea(box, o)
      if (cost === 0) { best = { ...c, box, clash: false }; break }
      cost += i // eşit çakışmada varsayılana yakın aday
      if (cost < bestCost) { bestCost = cost; best = { ...c, box, clash: true } }
    }
    if (best) { out.set(it.id, best); placed.push(best.box) }
  }
  return out
}

/** Dünya koordinatında pin noktası engel kutusu (bağlantı noktası + dokunma payı). */
export const pinObstacle = (p: Pt, r = 4.5): Box => ({ x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r })

const ROW = 1.15 // etiket satır aralığı (yazı boyuna oranla)

/**
 * Bir pin etiketi için aday konumlar. Varsayılan: parçanın merkezinden pine doğru, dışarıda (eski davranış).
 * Sonra: aynı yönde ikinci/üçüncü sıra (kademeli), karşı yön ve yan kaydırmalar.
 */
export function pinLabelCandidates(pt: Pt, dx: number, dy: number, horiz: boolean, fs: number): Candidate[] {
  const sgn = (v: number) => (v < 0 ? -1 : 1)
  const out: Candidate[] = []
  const row = fs * ROW
  if (horiz) {
    const s = sgn(dx), anchor: Anchor = s < 0 ? 'end' : 'start'
    const x0 = s * 11
    for (const k of [0, 1, -1, 2, -2]) out.push({ x: pt.x + x0, y: pt.y + 3 + k * row, anchor })
    for (const k of [0, 1, -1]) out.push({ x: pt.x - x0, y: pt.y + 3 + k * row, anchor: anchor === 'end' ? 'start' : 'end' })
  } else {
    const s = sgn(dy)
    const y0 = s * (fs + 3)
    for (const k of [0, 1, 2, 3]) out.push({ x: pt.x, y: pt.y + y0 + s * k * row, anchor: 'middle' })
    // yana kaydırılmış (komşu etiketle aynı satıra denk gelmeyen) adaylar
    for (const k of [0, 1]) out.push({ x: pt.x - 9, y: pt.y + y0 + s * k * row, anchor: 'end' })
    for (const k of [0, 1]) out.push({ x: pt.x + 9, y: pt.y + y0 + s * k * row, anchor: 'start' })
    for (const k of [0, 1]) out.push({ x: pt.x, y: pt.y - y0 - s * k * row, anchor: 'middle' })
  }
  return out
}

/** Değer yazısı (direnç değeri, %konum, °C…) için aday konumlar: parçanın altı (varsayılan), üstü, sonra daha uzak sıralar. */
export function captionCandidates(b: Box, fs: number): Candidate[] {
  const cx = b.x + b.w / 2
  const below = b.y + b.h + 26
  const row = fs * ROW
  return [
    { x: cx, y: below, anchor: 'middle' },
    { x: cx, y: b.y - 9, anchor: 'middle' },
    { x: cx, y: below + row, anchor: 'middle' },
    { x: cx, y: b.y - 9 - row, anchor: 'middle' },
    { x: b.x + b.w + 8, y: b.y + b.h / 2 + 4, anchor: 'start' },
    { x: b.x - 8, y: b.y + b.h / 2 + 4, anchor: 'end' },
    { x: cx, y: below + 2 * row, anchor: 'middle' },
  ]
}

export interface LabelSpec { key: string; text: string; kind: 'pin' | 'caption' }

/**
 * Tuvaldaki tüm etiketleri yerleştirir. `fontSize`: dünya birimiyle yazı boyu (yakınlaştırmayla ters ölçeklenir).
 * `captions`: parça kimliği → değer yazısı. Anahtarlar: pin için `${partId}:${pin}`, değer yazısı için `cap:${partId}`.
 */
export function layoutCanvasLabels(parts: readonly PartInstance[], captions: ReadonlyMap<string, string>, fontSize: number): Map<string, PlacedLabel> {
  const obstacles: Box[] = []
  const pinItems: LabelItem[] = []
  const capItems: LabelItem[] = []
  for (const p of parts) {
    const def = PART_DEFS[p.type]
    const b = partBounds(p)
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2
    // Etiketlerini parçanın kendisi çizen kartlar/çipler (ownLabels): içlerine yazı gelmesin
    if (def.ownLabels && p.type !== 'uno') obstacles.push(b)
    for (const pin of Object.keys(def.pins)) {
      const pt = pinWorld(p, pin)!
      obstacles.push(pinObstacle(pt))
      if (p.type === 'uno' || def.ownLabels) continue
      const dx = pt.x - cx, dy = pt.y - cy
      const horiz = Math.abs(dx) / (b.w || 1) > Math.abs(dy) / (b.h || 1)
      pinItems.push({ id: `${p.id}:${pin}`, text: pin, fontSize, candidates: pinLabelCandidates(pt, dx, dy, horiz, fontSize) })
    }
    const cap = captions.get(p.id)
    if (cap) capItems.push({ id: `cap:${p.id}`, text: cap, fontSize: fontSize * 11 / 9, candidates: captionCandidates(b, fontSize * 11 / 9) })
  }
  // Önce pin etiketleri (komşu pinlere bağlı oldukları için yerleri daha az esnek), sonra değer yazıları onların etrafına kayar.
  return layoutLabels([...pinItems, ...capItems], obstacles)
}

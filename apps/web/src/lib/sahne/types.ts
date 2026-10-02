// Sahne Atölyesi — ortak türler. Saf veri: Blockly ya da DOM içermez (Node testlerinde güvenle yüklenir).

/** Sahne mantıksal boyutu: merkez (0,0), x sağa, y yukarı artar (Scratch'i çağrıştıran koordinat sistemi). */
export const STAGE_W = 480
export const STAGE_H = 360
export const FPS = 30
export const FRAME_MS = 1000 / FPS

/** Blockly'nin `serialization.workspaces.save` çıktısındaki blok düğümü. */
export interface BlockNode {
  type: string
  id?: string
  x?: number
  y?: number
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: BlockNode; shadow?: BlockNode }>
  next?: { block?: BlockNode; shadow?: BlockNode }
  extraState?: unknown
  enabled?: boolean
  disabled?: boolean
}
export interface BlockState {
  blocks?: { languageVersion?: number; blocks?: BlockNode[] }
  variables?: { name: string; id: string; type?: string }[]
}

// ───────── Kostüm (vektör + bitmap karma) ─────────
// Koordinatlar kostümün kendi tuvalindedir: (0,0) sol üst, (w,h) sağ alt; dönme merkezi tuvalin ortasıdır.
export type Shape =
  | { t: 'path'; pts: number[]; c: string; w: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; f: string | null; s: string | null; sw: number; r?: number }
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; f: string | null; s: string | null; sw: number }
  | { t: 'poly'; pts: number[]; f: string | null; s: string | null; sw: number }

export interface Costume {
  id: string
  name: string
  w: number
  h: number
  /** Vektör şekiller (arkadan öne). Bitmap varsa onun ÜSTÜNE çizilir. */
  shapes: Shape[]
  /** İsteğe bağlı bitmap katmanı (PNG data URL, w x h). Bitmap kostümlerde çizim araçları buna yazar. */
  bitmap?: string
}

/** Ses: hazır (WebAudio ile sentezlenmiş) bir sesin sprite'a eklenmiş hali + basit efektler. */
export interface SoundRef {
  name: string
  /** Ses galerisi anahtarı (sounds.ts). */
  gid: string
  /** Hız çarpanı (1 = olduğu gibi, 2 = iki kat hızlı). */
  speed?: number
  /** Perde çarpanı (1 = olduğu gibi). */
  pitch?: number
  reverse?: boolean
  /** Ses seviyesi çarpanı (0-1). */
  gain?: number
}

export interface ProcDef { id: string; name: string; params: string[] }

export type RotationStyle = 'all' | 'lr' | 'none'

export interface SpriteDef {
  id: string
  name: string
  costumes: Costume[]
  costume: number
  sounds: SoundRef[]
  x: number
  y: number
  dir: number
  /** Yüzde. */
  size: number
  visible: boolean
  rotationStyle: RotationStyle
  procs: ProcDef[]
  blocks: BlockState
}

export interface StageDef {
  backdrops: Costume[]
  backdrop: number
  sounds: SoundRef[]
  procs: ProcDef[]
  blocks: BlockState
}

export interface VarDef {
  /** Blockly değişken kimliği. */
  id: string
  name: string
  /** '' = değişken, 'List' = liste. */
  type: '' | 'List'
  /** Başlangıç değeri (değişken). */
  value: number | string
  /** Başlangıç öğeleri (liste). */
  items: string[]
  /** Sahnede göster. */
  visible: boolean
}

export interface SahneProject {
  version: 1
  name: string
  /** Öğrencinin plan / "nasıl oynanır" notları. */
  notes: string
  stage: StageDef
  /** Arkadan öne (dizideki ilk sprite en arkada). */
  sprites: SpriteDef[]
  variables: VarDef[]
  /** Elle eklenmiş yayın mesajları (blokların kullandıklarına ek). */
  messages: string[]
}

export type TargetKey = 'stage' | string // 'stage' ya da sprite kimliği

export const MAX_SPRITES = 40
export const MAX_COSTUMES = 60
export const MAX_CLONES = 300
export const MAX_LIST_ITEMS = 20000

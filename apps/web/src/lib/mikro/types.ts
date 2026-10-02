// Mikro Kart — ortak tipler. Saf TypeScript (tarayıcı ve Node'da aynı kod).

/** Çalışma zamanı değeri. Listeler JS dizisidir (başvuru ile paylaşılır). */
export type Value = number | string | boolean | null | Value[]

export type ButtonName = 'A' | 'B' | 'AB'
export type ButtonEvent = 'press' | 'release' | 'long'
export type PinName = 'P0' | 'P1' | 'P2'
export const PINS: PinName[] = ['P0', 'P1', 'P2']
export type GestureName = 'shake' | 'tiltLeft' | 'tiltRight' | 'tiltForward' | 'tiltBack' | 'faceUp' | 'faceDown' | 'freeFall'
export const GESTURES: GestureName[] = ['shake', 'tiltLeft', 'tiltRight', 'tiltForward', 'tiltBack', 'faceUp', 'faceDown', 'freeFall']

/** Blockly serileştirme biçiminde bir blok (yalnız kullandığımız alanlar). */
export interface PBlock {
  type: string
  id?: string
  x?: number
  y?: number
  disabled?: boolean
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: PBlock; shadow?: PBlock }>
  next?: { block?: PBlock; shadow?: PBlock }
  extraState?: unknown
}

/** Blockly `serialization.workspaces.save()` çıktısı. */
export interface WorkspaceState {
  blocks?: { languageVersion?: number; blocks: PBlock[] }
  variables?: { name: string; id: string; type?: string }[]
}

/** Kaydedilen proje. Çalışma alanı doğrudan Blockly JSON'udur; JavaScript/Python görünümleri bundan üretilir. */
export interface MikroProject {
  version: 1
  name: string
  workspace: WorkspaceState
}

export const emptyProject = (name = 'Projem'): MikroProject => ({ version: 1, name, workspace: { blocks: { languageVersion: 0, blocks: [] } } })

/** Radyo mesajı. */
export interface RadioMessage {
  kind: 'num' | 'str' | 'kv'
  num?: number
  str?: string
  name?: string
  value?: number
  /** 0-255 (uzaklık yoksayılır; sabit güçlü). */
  signal: number
  /** Gönderen kart numarası (-1: dışarıdan). */
  from: number
}

/** Olay anahtarları: `button:A:press`, `gesture:shake`, `logo:touch`, `pin:P0:touch`, `radio`. */
export type InputKey = string

/** Aygıt günlüğü (hedefler ve testler okur). */
export type DeviceEvent =
  | { t: number; kind: 'text'; text: string }
  | { t: number; kind: 'number'; value: number }
  | { t: number; kind: 'icon'; icon: string }
  | { t: number; kind: 'tone'; freq: number; ms: number }
  | { t: number; kind: 'melody'; name: string }
  | { t: number; kind: 'rest'; ms: number }
  | { t: number; kind: 'radioSend'; msg: RadioMessage; group: number }
  | { t: number; kind: 'radioRecv'; msg: RadioMessage }
  | { t: number; kind: 'serial'; text: string }
  | { t: number; kind: 'pin'; pin: PinName; mode: 'digital' | 'analog' | 'servo'; value: number }
  | { t: number; kind: 'input'; key: InputKey }

export interface FrameEntry { t: number; s: string }

export type EndReason = 'running' | 'idle' | 'stopped' | 'error'
export interface RunError { message: string; blockId: string | null; card: number }

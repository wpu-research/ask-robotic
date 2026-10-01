// ASK Jr — ScratchJr tarzı blok editörünün veri modeli. Motor (engine.ts), işlemler (ops.ts) ve arayüz bu sözleşmeye dayanır.

/** Sahne mantıksal boyutu (birim). Karakterler bu alanın içinde kalır. */
export const STAGE_W = 480
export const STAGE_H = 360
/** 1 "adım" kaç sahne birimi. */
export const STEP_UNITS = 24

export type BlockType =
  | 'flag' | 'tap'                                   // başlatma
  | 'forward' | 'back' | 'turnRight' | 'turnLeft' | 'hop' | 'goHome'  // hareket
  | 'say' | 'grow' | 'shrink' | 'resetSize' | 'hide' | 'show'          // görünüm
  | 'pop'                                            // ses
  | 'wait' | 'repeat' | 'forever'                    // kontrol
  | 'goPage' | 'stop'                                // bitiş

export type Category = 'start' | 'motion' | 'looks' | 'sound' | 'control' | 'end'

export interface Block {
  id: string
  type: BlockType
  /** Sayısal parametre (adım, derece, saniye, tekrar sayısı, sayfa no, ses no). */
  value?: number
  /** Metin parametresi (yalnız 'say'). */
  text?: string
  /** Kapsayıcı bloklar (repeat, forever) için iç bloklar. */
  children?: Block[]
}

/** Bir betik: blocks[0] başlatma bloğu olmalı, yoksa betik çalışmaz. */
export interface Script {
  id: string
  blocks: Block[]
  /** Çalışma alanındaki konum (yalnız arayüz için; motor yok sayar). */
  x?: number
  y?: number
}

export interface Sprite {
  id: string
  /** characters.ts anahtarı. */
  character: string
  /** Başlangıç (ve "eve dön") konumu, sahne birimi, merkez noktası. */
  x: number
  y: number
  scripts: Script[]
}

export interface Page { id: string; background: string; sprites: Sprite[] }
export interface Project { pages: Page[] }

// ---- Çalışma zamanı (motor çıktısı) ----
export interface RuntimeSprite {
  id: string
  character: string
  x: number
  y: number
  /** Derece. 0 = sağa (doğu), saat yönünde artar (ekran koordinatları). */
  heading: number
  scale: number
  visible: boolean
  /** Konuşma balonu metni, yoksa null. */
  say: string | null
}

export interface EngineSnapshot {
  pageIndex: number
  sprites: RuntimeSprite[]
  /** Benzetim zamanı (ms). */
  time: number
  /** En az bir iş parçacığı çalışıyor mu. */
  running: boolean
}

/** Betik sırasında olan olaylar (test ve hedef denetimi için kayıt). */
export type EngineEvent =
  | { t: number; kind: 'say'; spriteId: string; text: string }
  | { t: number; kind: 'sound'; spriteId: string; sound: number }
  | { t: number; kind: 'page'; page: number }
  | { t: number; kind: 'hop'; spriteId: string }

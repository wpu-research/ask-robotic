// Oyun çerçevesi sözleşmesi. Her oyun ajanı `lib/games/<slug>/index.ts` içinde `export const <slug>Game: GameDef` verir.
import type { ComponentType } from 'react'
import type { BlockHandler, RunApi, RunResult, StepInfo } from './interpreter'
import type { ProgramState } from './program'

export type { BlockHandler, RunApi, RunResult, StepInfo, ProgramState }

/** Oyun kimliği (URL parçası). */
export type GameSlug = 'bulmaca' | 'labirent' | 'kus' | 'kaplumbaga' | 'film' | 'muzik' | 'golet-egitmeni' | 'golet'

/** Kod üretici bağlamı: `js` işlevi blok için JavaScript metni üretir (yalnız "Kodu göster" içindir; çalıştırmada kullanılmaz). */
export interface CodeCtx {
  /** Alan değeri (metin olarak). */
  field(name: string): string
  /** Değer girişinin ifadesi (boşsa '0'). */
  value(name: string): string
  /** Deyim girişi: girintili, satır sonlu kod. */
  statements(name: string): string
  /** Bloğun kimliği/türü. */
  type: string
}

/** Oyuna özgü Blockly bloğu. `json` Blockly blok tanımıdır (`type` alanı OLMADAN; çerçeve ekler). */
export interface GameBlockDef {
  type: string
  /** Araç kutusunda görünen kategori adı (Türkçe). */
  category: string
  /** Kategori/blok rengi (#rrggbb). `json.colour` yoksa bu kullanılır. */
  colour?: string
  json: Record<string, unknown>
  /** Kod karşılığı: şablon metin (`{ALAN}` alan değeri ya da giriş ifadesi) ya da işlev. Değer bloklarında ifade, deyimlerde satır(lar). */
  js?: string | ((c: CodeCtx) => string)
  /** Yalnız başlık (hat) bloğu: araç kutusuna konmaz sayılmaz; blok sayısına katılmaz. */
  hat?: boolean
  /** true: blok sayısı sınırına katılmaz (örn. başlangıç bloğu). */
  free?: boolean
}

export interface LevelDef {
  /** 1..10 */
  id: number
  /** Seviye hedefi (Türkçe, çocuk dostu). */
  intro: string
  /** Takılınca gösterilen ipucu. */
  hint?: string
  /** En çok blok sayısı (yoksa sınırsız). */
  maxBlocks?: number
  /** Araç kutusundaki blok türleri (özel + yerleşik). Kategoriler sırayla gruplanır. */
  toolbox: string[]
  /** Çalışma alanı başlangıç programı (örn. sabit başlık bloğu). */
  startBlocks?: ProgramState
  /** Referans çözüm: testlerde başsız çalıştırılır, hedefi sağlamalıdır. */
  solution: ProgramState
  /** Bu seviyenin adım sınırı (varsayılan GameDef.maxSteps). */
  maxSteps?: number
  /** Oyuna özgü veri (harita, hedef…). Çerçeve dokunmaz. */
  data?: unknown
}

export interface RunOutcome {
  /** Seviye hedefi sağlandı mı? */
  ok: boolean
  /** Başarısızlık ya da başarı notu (Türkçe, çocuk dostu): "Duvara çarptın!" gibi. */
  message?: string
}

/** Bir çalıştırmanın oyun tarafı. Yorumlayıcı `api.blocks` işleyicilerini çağırır; oyun durumu burada tutulur. */
export interface GameRun<S = unknown> {
  api: RunApi
  /** Sahne için DEĞİŞMEZ anlık görüntü (her çağrıda yeni nesne/kopya). Başlangıç çerçevesi de budur. */
  snapshot(): S
  /** Program bittikten (ya da durdurulduktan) sonra hedef değerlendirmesi. */
  evaluate(result: RunResult): RunOutcome
  /** Adım sonrası ek bekleme ms (örn. uzun animasyon); yoksa çerçeve varsayılanı. */
  stepDelay?(info: StepInfo): number | undefined
}

export interface GameEngine<S = unknown> {
  createRun(level: LevelDef, opts?: { seed?: number }): GameRun<S>
}

/** Sahne bileşeninin aldığı özellikler. */
export interface SceneProps<S = unknown> {
  level: LevelDef
  /** Şu anki sahne durumu (`GameRun.snapshot()`). */
  frame: S
  running: boolean
  /** Hız çarpanı (hız kaydırıcısı açıksa), yoksa 1. Animasyon süreleri buna bölünmeli. */
  speed: number
  /** Son çalıştırmanın sonucu (çalışırken null). */
  outcome: RunOutcome | null
}

export interface GameDef<S = any> {
  slug: GameSlug
  title: string
  tagline: string
  levels: LevelDef[]
  /** Özel blok tanımları (Blockly JSON + kod karşılığı). Yerleşik bloklar için gerekmez. */
  blocks: GameBlockDef[]
  engine: GameEngine<S>
  /** Sahne bileşeni (tembel yüklenir): `scene: () => import('./scene')` → modül `default` dışa vermeli. */
  scene: () => Promise<{ default: ComponentType<SceneProps<S>> }>
  /** Özel araç kutusu (Blockly JSON). Verilmezse `level.toolbox`'tan otomatik kurulur. */
  toolboxFor?: (level: LevelDef) => unknown
  /** Eylem adımı başına temel gecikme ms (varsayılan 450). */
  stepDelay?: number
  /** Hız kaydırıcısı: verilirse sahne altında görünür. */
  speed?: { min: number; max: number; default: number }
  /** Seviye adım sınırı (varsayılan 20000). */
  maxSteps?: number
  /** Sahne yüksekliği/oranı ipucu (CSS aspect-ratio), örn. '1 / 1'. */
  stageAspect?: string
}

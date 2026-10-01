// ASK Jr — yorumlayıcı motor. Saf TypeScript: DOM, gerçek zaman ve rastgelelik yok; benzetim tamamen deterministiktir.
// Zaman, olay güdümlü ilerler: tick(dt) içinde her zaman dilimi, en yakın eylem bitişine kadar bölünür,
// böylece olay zamanları ve paralel iş parçacıklarının sırası dt'den bağımsız olarak aynıdır.

import { BLOCK_BY_TYPE } from './blocks'
import { STAGE_H, STAGE_W, STEP_UNITS } from './types'
import type { Block, EngineEvent, EngineSnapshot, Project, RuntimeSprite, Script } from './types'

export interface EngineOptions {
  onSound?: (n: number) => void
}

const EPS = 1e-9
const MAX_PAGE_CHAIN = 32
const FOREVER_IDLE_MS = 16
const SAY_MS = 2000
const HOP_MS = 500
const POP_MS = 300
const SIZE_MS = 250
const MS_PER_STEP = 200
const TURN_MS_PER_90 = 300
const SCALE_FACTOR = 1.25
const SCALE_MAX = 3
const SCALE_MIN = 0.4

/** Çalışma zamanı sprite durumu + iç alanlar. */
interface SpriteState extends RuntimeSprite {
  homeX: number
  homeY: number
  sayToken: number
}

type Action =
  | { kind: 'move'; remaining: number; dur: number; dx: number; dy: number; applied: number; state: SpriteState }
  | { kind: 'turn'; remaining: number; dur: number; delta: number; applied: number; state: SpriteState }
  | { kind: 'wait'; remaining: number }
  | { kind: 'say'; remaining: number; state: SpriteState; token: number }
  | { kind: 'hop'; remaining: number; hopsLeft: number; state: SpriteState }

interface Frame {
  blocks: Block[]
  i: number
  kind: 'root' | 'repeat' | 'forever'
  /** repeat için kalan tur sayısı. */
  left: number
  /** forever turunun başladığı andaki iş parçacığı harcanan süresi. */
  startSpent: number
}

interface Thread {
  spriteId: string
  scriptId: string
  state: SpriteState
  stack: Frame[]
  action: Action | null
  /** Bu iş parçacığının şimdiye dek planladığı toplam süre (boş forever denetimi için). */
  spent: number
  dead: boolean
}

const isTriggerType = (t: Block['type']) => t === 'flag' || t === 'tap'
const round6 = (n: number) => Math.round(n * 1e6) / 1e6
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const normDeg = (d: number) => {
  const m = ((d % 360) + 360) % 360
  return round6(m) % 360
}

export class Engine {
  private project: Project
  private opts: EngineOptions
  /** pages[sayfa][sprite] */
  private states: SpriteState[][] = []
  private threads: Thread[] = []
  private pageIndex = 0
  private time = 0
  private log: EngineEvent[] = []
  /** Anlık goPage zincirlerinde (sayfalar birbirine anında atlıyorsa) sonsuz özyinelemeyi keser. */
  private pageDepth = 0

  constructor(project: Project, opts: EngineOptions = {}) {
    this.project = project
    this.opts = opts
    this.reset()
  }

  // ---- Genel API ----

  setProject(project: Project): void {
    this.project = project
    this.reset()
  }

  /** Tüm iş parçacıklarını durdurur ve konuşma balonlarını temizler. Zaman ve olay kaydı korunur. */
  stop(): void {
    for (const t of this.threads) t.dead = true
    this.threads = []
    for (const page of this.states) for (const s of page) { s.say = null; s.sayToken++ }
  }

  /** stop + tüm sayfaların sprite durumları başlangıca, etkin sayfa pageIndex (geçersizse 0), zaman ve olaylar sıfırlanır. */
  reset(pageIndex = 0): void {
    this.stop()
    this.states = this.project.pages.map((p) =>
      p.sprites.map((sp) => ({
        id: sp.id, character: sp.character, x: sp.x, y: sp.y, heading: 0, scale: 1, visible: true, say: null,
        homeX: sp.x, homeY: sp.y, sayToken: 0,
      })),
    )
    this.pageIndex = Number.isInteger(pageIndex) && pageIndex >= 0 && pageIndex < this.project.pages.length ? pageIndex : 0
    this.time = 0
    this.log = []
  }

  /** Etkin sayfadaki 'flag' ile başlayan tüm betikleri (sprite sırasıyla) başlatır. */
  pressFlag(): void {
    this.startTriggered('flag')
  }

  /** Etkin sayfadaki sprite'ın 'tap' betiklerini başlatır; sprite bu sayfada değilse sessizce yok sayılır. */
  tapSprite(spriteId: string): void {
    this.startTriggered('tap', spriteId)
  }

  /**
   * Tek bir yığını (Scratch'te yığına tıklamak) etkin sayfadaki sprite için çalıştırır.
   * Başta başlatma bloğu varsa atlanır; yoksa olduğu gibi çalışır. Aynı sprite'ın diğer iş parçacıkları durdurulmaz;
   * yalnız aynı yığın (ilk blok kimliği aynı) zaten çalışıyorsa yeniden başlatılır.
   */
  runStack(spriteId: string, blocks: Block[]): void {
    if (blocks.length === 0) return
    const page = this.project.pages[this.pageIndex]
    if (!page) return
    const idx = page.sprites.findIndex((sp) => sp.id === spriteId)
    if (idx < 0) return
    this.startThread(this.states[this.pageIndex][idx], { id: `stack:${blocks[0].id}`, blocks }, !isTriggerType(blocks[0].type))
  }

  tick(dtMs: number): void {
    let remaining = dtMs
    if (!(remaining > 0)) return
    while (remaining > EPS) {
      let step = remaining
      for (const t of this.threads) if (t.action && t.action.remaining < step) step = t.action.remaining
      if (step < 0) step = 0
      this.time = round6(this.time + step)
      remaining -= step
      this.advance(step)
      if (step <= 0 && remaining <= EPS) break
    }
  }

  runUntilIdle(maxMs: number, dtMs = 16): boolean {
    let elapsed = 0
    while (!this.idle && elapsed < maxMs) {
      const d = Math.min(dtMs, maxMs - elapsed)
      this.tick(d)
      elapsed += d
    }
    return this.idle
  }

  get snapshot(): EngineSnapshot {
    const page = this.states[this.pageIndex] ?? []
    return {
      pageIndex: this.pageIndex,
      sprites: page.map((s) => ({
        id: s.id, character: s.character, x: s.x, y: s.y, heading: s.heading, scale: s.scale, visible: s.visible, say: s.say,
      })),
      time: this.time,
      running: !this.idle,
    }
  }

  get events(): EngineEvent[] {
    return this.log.slice()
  }

  get idle(): boolean {
    return !this.threads.some((t) => !t.dead)
  }

  // ---- İç işleyiş ----

  private emit(e: EngineEvent): void {
    this.log.push(e)
  }

  private startTriggered(trigger: 'flag' | 'tap', onlySprite?: string): void {
    const page = this.project.pages[this.pageIndex]
    if (!page) return
    const states = this.states[this.pageIndex]
    page.sprites.forEach((sp, idx) => {
      if (onlySprite !== undefined && sp.id !== onlySprite) return
      for (const script of sp.scripts) {
        if (script.blocks[0]?.type === trigger) this.startThread(states[idx], script)
      }
    })
  }

  private startThread(state: SpriteState, script: Script, keepFirst = false): void {
    // Aynı sprite'ın aynı betiği zaten çalışıyorsa önce o sonlandırılır (çift çalışma yok).
    for (const old of this.threads) if (old.spriteId === state.id && old.scriptId === script.id) this.killThread(old)
    this.threads = this.threads.filter((t) => !t.dead)
    const thread: Thread = {
      spriteId: state.id,
      scriptId: script.id,
      state,
      stack: [{ blocks: keepFirst ? script.blocks : script.blocks.slice(1), i: 0, kind: 'root', left: 1, startSpent: 0 }],
      action: null,
      spent: 0,
      dead: false,
    }
    this.threads.push(thread)
    this.run(thread)
    this.threads = this.threads.filter((t) => !t.dead)
  }

  private killThread(t: Thread): void {
    if (t.dead) return
    t.dead = true
    if (t.action?.kind === 'say' && t.action.state.sayToken === t.action.token) t.action.state.say = null
    t.action = null
  }

  /** Zamanı step kadar ilerletir; biten eylemlerin iş parçacıklarını devam ettirir. */
  private advance(step: number): void {
    const live = this.threads.filter((t) => !t.dead)
    const finished: Thread[] = []
    for (const t of live) {
      const a = t.action
      if (!a) continue
      a.remaining -= step
      this.applyProgress(a)
      if (a.remaining <= EPS) finished.push(t)
    }
    for (const t of finished) {
      if (t.dead || !t.action) continue
      if (this.finishAction(t)) this.run(t)
    }
    this.threads = this.threads.filter((t) => !t.dead)
  }

  private applyProgress(a: Action): void {
    if (a.kind === 'move') {
      const prog = a.remaining <= EPS ? 1 : 1 - a.remaining / a.dur
      const d = prog - a.applied
      a.applied = prog
      a.state.x = round6(clamp(a.state.x + a.dx * d, 0, STAGE_W))
      a.state.y = round6(clamp(a.state.y + a.dy * d, 0, STAGE_H))
    } else if (a.kind === 'turn') {
      const prog = a.remaining <= EPS ? 1 : 1 - a.remaining / a.dur
      const d = prog - a.applied
      a.applied = prog
      a.state.heading = normDeg(a.state.heading + a.delta * d)
    }
  }

  /** Eylem bitti. true dönerse iş parçacığı sonraki bloğa geçer; false ise yeni zamanlı eylem başladı. */
  private finishAction(t: Thread): boolean {
    const a = t.action as Action
    if (a.kind === 'say') {
      if (a.state.sayToken === a.token) a.state.say = null
    } else if (a.kind === 'hop' && a.hopsLeft > 0) {
      a.hopsLeft--
      a.remaining = HOP_MS
      t.spent += HOP_MS
      this.emit({ t: this.time, kind: 'hop', spriteId: t.spriteId })
      return false
    }
    t.action = null
    return true
  }

  private begin(t: Thread, action: Action, dur: number): void {
    t.action = action
    t.spent += dur
  }

  private val(b: Block): number {
    const p = BLOCK_BY_TYPE[b.type].param
    const fallback = p?.kind === 'number' ? p.default : 0
    const v = b.value
    return typeof v === 'number' && Number.isFinite(v) ? v : fallback
  }

  /** İş parçacığını, zamanlı bir eyleme ya da sona gelene kadar çalıştırır. */
  private run(t: Thread): void {
    while (!t.dead && !t.action) {
      const frame = t.stack[t.stack.length - 1]
      if (!frame) { t.dead = true; return }

      if (frame.i >= frame.blocks.length) {
        if (frame.kind === 'root') { t.stack.pop(); continue }
        if (frame.kind === 'repeat') {
          frame.left--
          if (frame.left > 0) frame.i = 0
          else t.stack.pop()
          continue
        }
        // forever: gövde hiç zaman harcamadıysa sonsuz döngüyü önlemek için 16 ms bekle.
        const idleBody = t.spent === frame.startSpent
        frame.i = 0
        if (idleBody) {
          this.begin(t, { kind: 'wait', remaining: FOREVER_IDLE_MS }, FOREVER_IDLE_MS)
        }
        frame.startSpent = t.spent
        continue
      }

      this.exec(t, frame.blocks[frame.i++])
    }
  }

  private exec(t: Thread, b: Block): void {
    const s = t.state
    switch (b.type) {
      case 'flag':
      case 'tap':
        return // ortadaki başlatma blokları yok sayılır
      case 'forward':
      case 'back': {
        const steps = Math.max(0, this.val(b))
        const dir = b.type === 'forward' ? 1 : -1
        const dur = steps * MS_PER_STEP
        if (dur <= 0) return
        const rad = (s.heading * Math.PI) / 180
        const dist = dir * steps * STEP_UNITS
        const tx = clamp(s.x + Math.cos(rad) * dist, 0, STAGE_W)
        const ty = clamp(s.y + Math.sin(rad) * dist, 0, STAGE_H)
        this.begin(t, { kind: 'move', remaining: dur, dur, dx: tx - s.x, dy: ty - s.y, applied: 0, state: s }, dur)
        return
      }
      case 'turnRight':
      case 'turnLeft': {
        const deg = Math.max(0, this.val(b))
        const dur = (deg * TURN_MS_PER_90) / 90
        if (dur <= 0) return
        const delta = b.type === 'turnRight' ? deg : -deg
        this.begin(t, { kind: 'turn', remaining: dur, dur, delta, applied: 0, state: s }, dur)
        return
      }
      case 'hop': {
        const n = Math.round(this.val(b))
        if (n <= 0) return
        this.emit({ t: this.time, kind: 'hop', spriteId: t.spriteId })
        this.begin(t, { kind: 'hop', remaining: HOP_MS, hopsLeft: n - 1, state: s }, HOP_MS)
        return
      }
      case 'goHome':
        s.x = s.homeX
        s.y = s.homeY
        return
      case 'say': {
        const text = b.text ?? ''
        const token = ++s.sayToken
        s.say = text
        this.emit({ t: this.time, kind: 'say', spriteId: t.spriteId, text })
        this.begin(t, { kind: 'say', remaining: SAY_MS, state: s, token }, SAY_MS)
        return
      }
      case 'grow':
        s.scale = round6(Math.min(SCALE_MAX, s.scale * SCALE_FACTOR))
        this.begin(t, { kind: 'wait', remaining: SIZE_MS }, SIZE_MS)
        return
      case 'shrink':
        s.scale = round6(Math.max(SCALE_MIN, s.scale / SCALE_FACTOR))
        this.begin(t, { kind: 'wait', remaining: SIZE_MS }, SIZE_MS)
        return
      case 'resetSize':
        s.scale = 1
        this.begin(t, { kind: 'wait', remaining: SIZE_MS }, SIZE_MS)
        return
      case 'hide':
        s.visible = false
        return
      case 'show':
        s.visible = true
        return
      case 'pop': {
        const n = clamp(Math.round(this.val(b)), 1, 3)
        this.opts.onSound?.(n)
        this.emit({ t: this.time, kind: 'sound', spriteId: t.spriteId, sound: n })
        this.begin(t, { kind: 'wait', remaining: POP_MS }, POP_MS)
        return
      }
      case 'wait': {
        const dur = Math.max(0, this.val(b)) * 1000
        if (dur <= 0) return
        this.begin(t, { kind: 'wait', remaining: dur }, dur)
        return
      }
      case 'repeat': {
        const n = Math.max(0, Math.round(this.val(b)))
        const kids = b.children ?? []
        if (n <= 0 || kids.length === 0) return
        t.stack.push({ blocks: kids, i: 0, kind: 'repeat', left: n, startSpent: t.spent })
        return
      }
      case 'forever': {
        const kids = b.children ?? []
        t.stack.push({ blocks: kids, i: 0, kind: 'forever', left: Infinity, startSpent: t.spent })
        return
      }
      case 'goPage':
        this.goPage(t, Math.round(this.val(b)))
        return
      case 'stop':
        this.killThread(t)
        return
    }
  }

  private goPage(from: Thread, page1: number): void {
    const idx = page1 - 1
    if (!Number.isInteger(idx) || idx < 0 || idx >= this.project.pages.length) return
    // Mevcut sayfadaki tüm iş parçacıkları (çağıran dahil) sonlanır, balonlar temizlenir.
    for (const t of this.threads) this.killThread(t)
    this.killThread(from)
    for (const s of this.states[this.pageIndex] ?? []) { s.say = null; s.sayToken++ }
    this.threads = []
    this.pageIndex = idx
    this.emit({ t: this.time, kind: 'page', page: page1 })
    if (this.pageDepth < MAX_PAGE_CHAIN) {
      this.pageDepth++
      try { this.startTriggered('flag') } finally { this.pageDepth-- }
    }
  }
}

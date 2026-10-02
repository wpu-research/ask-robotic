// SahneSession: proje + motor + yorumlayıcı. Testler, etkinlik denetimi ve arayüz bunu kullanır.
import { SahneEngine, type RtTarget, type Value } from './engine'
import { Interpreter } from './interp'
import { FPS, type SahneProject } from './types'

export interface SessionOptions {
  seed?: number
  onSound?: SahneEngine['onSound']
  onStopSounds?: () => void
}

export class SahneSession {
  readonly engine: SahneEngine
  readonly interp: Interpreter
  /** Başsız çalıştırmada bir soru sorulunca otomatik cevap üretir (verilmezse soru cevap bekler). */
  autoAnswer: ((question: string, s: SahneSession) => string) | null = null
  /** Gerçek zaman bütçesi (ms/kare); yalnız tarayıcıda verilir. Testlerde yok: sonuçlar deterministiktir. */
  wallMs: number | undefined

  constructor(readonly project: SahneProject, opts: SessionOptions = {}) {
    this.engine = new SahneEngine(project, { seed: opts.seed })
    this.engine.onSound = opts.onSound
    this.engine.onStopSounds = opts.onStopSounds
    this.interp = new Interpreter(this.engine, project)
  }

  // ── çalıştırma ──
  flag(): void { this.interp.greenFlag() }
  stop(): void { this.interp.stopAll(); this.interp.releaseAllKeys() }
  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      const e = this.engine
      if (e.error) return
      e.advance()
      if (e.asking && this.autoAnswer) e.submitAnswer(this.autoAnswer(e.asking.text, this))
      this.interp.tick(this.wallMs)
    }
  }
  seconds(s: number): void { this.tick(Math.round(s * FPS)) }
  /** Çalışan betik kalmayana (ya da `maxFrames` dolana) dek ilerletir. */
  runUntilIdle(maxFrames = FPS * 60): number {
    let n = 0
    while (this.running && n < maxFrames && !this.engine.error) { this.tick(); n++ }
    return n
  }

  get running(): boolean { return this.interp.running }
  get error() { return this.engine.error }

  // ── girdi ──
  press(key: string): void { this.interp.pressKey(key) }
  release(key: string): void { this.interp.releaseKey(key) }
  /** Tuşa `frames` kare basılı tutar ve bırakır. */
  hold(key: string, frames = 2): void { this.press(key); this.tick(frames); this.release(key) }
  tap(key: string): void { this.hold(key, 1); this.tick(1) }
  moveMouse(x: number, y: number): void { this.engine.mouse.x = x; this.engine.mouse.y = y }
  mouseDown(down: boolean): void { this.engine.mouse.down = down }
  /** Sprite'a tıklar (başlıkları çalıştırır). */
  click(idOrName: string): boolean {
    const t = this.sprite(idOrName)
    if (!t) return false
    this.interp.click(t)
    this.tick(1)
    return true
  }
  /** Sahnede (x, y) noktasına tıklar: en üstteki sprite'a tıklama gider. */
  clickAt(x: number, y: number): RtTarget | null {
    this.moveMouse(x, y)
    const t = this.engine.spriteAt(x, y)
    if (t) this.interp.click(t)
    return t
  }
  answer(text: string): void { this.engine.submitAnswer(text) }

  // ── sorgu ──
  sprite(idOrName: string): RtTarget | undefined { return this.engine.find(idOrName) }
  variable(name: string): Value | undefined { return this.engine.varByName(name) }
  list(name: string): Value[] | undefined { return this.engine.listByName(name) }
  count(kind: string): number { return this.engine.counts[kind] ?? 0 }
}

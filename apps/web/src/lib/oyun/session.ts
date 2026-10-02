// Bir proje + motor + yorumlayıcı üçlüsü. Arayüz, testler ve etkinlik denetleyicisi aynı çatıyı kullanır.
import { OyunEngine, type SoundEvent } from './engine'
import { Runner, type RunnerLimits } from './interp'
import type { Button, OyunProject } from './types'

export interface SessionOptions { seed?: number; onSound?: (e: SoundEvent) => void; limits?: Partial<RunnerLimits> }

export class OyunSession {
  readonly engine: OyunEngine
  readonly runner: Runner

  constructor(readonly project: OyunProject, opts: SessionOptions = {}) {
    this.engine = new OyunEngine(project, { seed: opts.seed, onSound: opts.onSound })
    this.runner = new Runner(this.engine, project.blocks, opts.limits)
  }

  get error() { return this.engine.error }
  /** "Oyun başlayınca" olaylarını çalıştırır (tick() ilk çağrıda kendiliğinden de yapar). */
  start(): this { this.engine.start(); return this }
  /** n kare ilerletir (1 kare = 1/60 sn). */
  tick(n = 1): this { for (let i = 0; i < n && !this.engine.error; i++) this.engine.tick(); return this }
  /** Saniye cinsinden ilerletir. */
  seconds(s: number): this { return this.tick(Math.round(s * 60)) }
  press(b: Button): this { this.engine.press(b); return this }
  release(b: Button): this { this.engine.release(b); return this }
  /** Düğmeye `frames` kare basılı tutar ve bırakır. */
  hold(b: Button, frames: number): this { this.engine.press(b); this.tick(frames); this.engine.release(b); return this }
  /** Kısa bir tık (basma + bırakma). */
  tap(b: Button): this { this.engine.press(b); this.tick(2); this.engine.release(b); return this.tick(1) }
  /** Her karede `fn` çalıştırarak `frames` kare ilerletir (basit bir bot yazmak için). */
  play(frames: number, fn: (s: OyunSession, frame: number) => void): this {
    for (let i = 0; i < frames && !this.engine.error && !this.engine.isOver; i++) { fn(this, i); this.engine.tick() }
    return this
  }
  sprites(kind?: string) { return kind ? this.engine.spritesOfKind(kind) : this.engine.sprites }
  first(kind: string) { return this.engine.spritesOfKind(kind)[0] }
}

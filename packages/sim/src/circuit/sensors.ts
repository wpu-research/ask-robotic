// Aşama C: zamana bağlı sensör davranışları (PIR ısınma/tutma, döner enkoder). Tarayıcı ve Node uyumlu, DOM/Node API yok.
import { MODEL } from './model.js'

/**
 * PIR (HC-SR501 benzeri). Besleme gelince `pirWarmupMs` boyunca hareket yok sayılır ve çıkış parazitli oynar
 * (deterministik sahte-rastgele); sonra hareket varken OUT HIGH, hareket bitince `pirHoldMs` daha HIGH kalır.
 */
export class PirModel {
  poweredSince: number | null = null
  lastMotionMs = -Infinity
  level = false
  warmingUp = false
  step(now: number, powered: boolean, motion: boolean): void {
    if (!powered) { this.poweredSince = null; this.lastMotionMs = -Infinity; this.level = false; this.warmingUp = false; return }
    if (this.poweredSince === null) this.poweredSince = now
    const t = now - this.poweredSince
    if (t < MODEL.pirWarmupMs) {
      this.warmingUp = true
      // 300 ms'lik dilimlerde sabit bir karışım deseni: kod ısınmayı beklemezse yalancı HIGH görür
      this.level = (Math.imul(Math.floor(t / 300) + 1, 2654435761) >>> 0) % 5 < 2
      return
    }
    this.warmingUp = false
    if (motion) this.lastMotionMs = now
    this.level = now - this.lastMotionMs < MODEL.pirHoldMs
  }
  signature(): string { return this.level ? '1' : '0' }
}

/** Enkoder durumları (CLK, DT), saat yönü sırasıyla: 11 → 01 → 00 → 10 → 11. */
const QUAD: ReadonlyArray<readonly [boolean, boolean]> = [[true, true], [false, true], [false, false], [true, false]]

/**
 * KY-040 döner enkoder: `position` özelliği değişince fark kadar tık, 4 durum geçişi olarak kuyruğa girer;
 * her benzetim milisaniyesinde bir geçiş uygulanır (en çok 250 tık/sn). Saat yönü = artı.
 */
export class EncoderModel {
  phase = 0
  position = 0
  private queue: number[] = []
  constructor(public target: number) { this.position = target }
  /** Yeni hedef konum: fark kadar geçiş kuyruğa eklenir. */
  setTarget(n: number): void {
    const t = Math.round(n)
    const delta = t - this.target
    this.target = t
    const dir = delta > 0 ? 1 : -1
    for (let i = 0; i < Math.abs(delta) * MODEL.encoderPhasesPerClick; i++) this.queue.push(dir)
  }
  get moving(): boolean { return this.queue.length > 0 }
  /** Kuyruktan bir geçiş uygular; durum değiştiyse true. */
  step(): boolean {
    const d = this.queue.shift()
    if (d === undefined) return false
    this.phase = (this.phase + d + 4) % 4
    if (this.phase === 0 && d > 0) this.position++
    else if (this.phase === 0 && d < 0) this.position--
    return true
  }
  get clk(): boolean { return QUAD[this.phase][0] }
  get dt(): boolean { return QUAD[this.phase][1] }
  signature(): string { return String(this.phase) }
}

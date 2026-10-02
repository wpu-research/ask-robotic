// Benzetim: bir ya da iki sanal kart + paylaşılan radyo ortamı. Zaman kuantumlarla ilerler (radyo iletimi bir sonraki kuantumda gelir).
import { Device } from './device'
import { Runtime, type RuntimeOptions } from './runtime'
import type { DeviceEvent, MikroProject, RadioMessage, RunError, WorkspaceState } from './types'

export const QUANTUM_MS = 10
const RADIO_DELAY_MS = 10

export interface Card { device: Device; runtime: Runtime }

export interface SimOptions extends RuntimeOptions {
  /** 1 ya da 2 kart. İkinci kart aynı programı çalıştırır (aynı kodu iki karta yüklemek gibi). */
  cards?: 1 | 2
}

export class Simulation {
  readonly cards: Card[] = []
  readonly ws: WorkspaceState
  now = 0
  private inflight: { at: number; to: number; msg: RadioMessage }[] = []

  constructor(project: MikroProject | WorkspaceState, opts: SimOptions = {}) {
    this.ws = 'workspace' in project ? project.workspace : project
    const n = opts.cards ?? 1
    for (let i = 0; i < n; i++) this.addCard(opts)
  }

  private addCard(opts: SimOptions) {
    const device = new Device(this.cards.length)
    device.onRadioSend = (from, msg) => this.broadcast(from, msg)
    this.cards.push({ device, runtime: new Runtime(device, this.ws, { seed: opts.seed, burstLimit: opts.burstLimit, totalStepLimit: opts.totalStepLimit }) })
  }

  get card(): Card { return this.cards[0] }
  get device(): Device { return this.cards[0].device }

  start() { for (const c of this.cards) c.runtime.start() }
  stop() { for (const c of this.cards) c.runtime.stop() }

  /** İlk hata (varsa). */
  get error(): RunError | null { return this.cards.map((c) => c.runtime.error).find((e) => !!e) ?? null }

  private broadcast(from: Device, msg: RadioMessage) {
    for (const c of this.cards) {
      if (c.device === from) continue
      if (c.device.radioGroup !== from.radioGroup) continue
      this.inflight.push({ at: this.now + RADIO_DELAY_MS, to: c.device.id, msg })
    }
  }

  /** Dışarıdan (sanal üçüncü bir gönderici gibi) mesaj yollar: o kartın grubundaki bir kart gönderdi sayılır. */
  injectRadio(card: number, msg: Omit<RadioMessage, 'signal' | 'from'> & { signal?: number }) {
    this.inflight.push({ at: this.now, to: card, msg: { signal: 200, ...msg, from: -1 } })
  }

  /** `ms` kadar sanal zaman ilerletir. `wallMs` ile gerçek süre bütçesi verilirse erken dönebilir; gerçekte ilerletilen ms döner. */
  advance(ms: number, wallMs = Infinity): number {
    const target = this.now + ms
    const t0 = wallMs === Infinity ? 0 : performance.now()
    const startNow = this.now
    while (this.now < target && !this.error) {
      const stepTo = Math.min(target, this.now + QUANTUM_MS)
      this.deliver(this.now)
      for (const c of this.cards) c.runtime.advanceTo(stepTo)
      this.now = stepTo
      if (wallMs !== Infinity && performance.now() - t0 > wallMs) break
    }
    this.deliver(this.now)
    return this.now - startNow
  }

  private deliver(now: number) {
    if (!this.inflight.length) return
    const due = this.inflight.filter((m) => m.at <= now)
    if (!due.length) return
    this.inflight = this.inflight.filter((m) => m.at > now)
    for (const m of due) {
      const c = this.cards[m.to]
      if (c) c.device.radioReceive(m.msg)
    }
  }

  /** Tüm kartların günlüğü (zaman sırasıyla), kart numarasıyla. */
  allEvents(): { card: number; e: DeviceEvent }[] {
    const out: { card: number; e: DeviceEvent }[] = []
    for (const c of this.cards) for (const e of c.device.log) out.push({ card: c.device.id, e })
    return out.sort((a, b) => a.e.t - b.e.t)
  }
}

// Dönüşen Robot (dn_*) bloklarının çalışma zamanı işleyicileri. ops.ts birleştirir; başka modül doğrudan içe aktarmamalıdır.
// Hareketler 50 ms'lik dilimlerle canlandırılır: her dilimde durum biraz değişir, görünüm aradaki kareleri çizer.
import { MikroError, evNum, evStr, type Ctx, type ExprHandler, type StmtHandler } from './runtime'
import { DONUSEN_MODELS, STEP_CM, type DonusenBot, type DonusenModelId } from './donusen'
import type { PBlock } from './types'
import { BLOCK_BY_TYPE } from './blocks'

const TICK = 50
const f = (b: PBlock, n: string): string => String(b.fields?.[n] ?? '')


function botOf(b: PBlock, c: Ctx): DonusenBot {
  const r = c.dev.donusen
  if (!r) throw new MikroError('Dönüşen Robot blokları yalnız Robot Atölyesi\'nde, kart Dönüşen Robot\'a takılıyken çalışır.', b.id ?? null)
  const ok: DonusenModelId[] | undefined = BLOCK_BY_TYPE[b.type]?.models
  if (ok && !ok.includes(r.id)) throw new MikroError(`${r.model.title} modelinde bu blok yok; ${ok.map((m) => DONUSEN_MODELS[m].title).join(', ')} modelinde çalışır.`, b.id ?? null)
  return r
}

/** `ms` boyunca her dilimde `fn(k)` (k: 0..1 ilerleme) çağırır. */
function* animate(ms: number, fn: (k: number) => void) {
  const n = Math.max(1, Math.round(ms / TICK))
  for (let i = 1; i <= n; i++) { yield TICK; fn(i / n) }
}

const stmts: Record<string, StmtHandler> = {
  *dn_walk(b, c) {
    const r = botOf(b, c)
    const n = Math.max(0, Math.min(50, Math.round(yield* evNum(b, 'STEPS', c))))
    const sign = f(b, 'DIR') === 'back' ? -1 : 1
    for (let s = 0; s < n; s++) {
      yield* animate(500, () => { r.advance((sign * STEP_CM) / 10); r.phase = (r.phase + 36) % 360; r.armL = r.armR = Math.sin((r.phase * Math.PI) / 180) * 15 })
      r.steps++
    }
    r.phase = 0; r.armL = r.armR = 0
  },
  *dn_turn_around(b, c) {
    const r = botOf(b, c)
    yield* animate(600, () => {})
    r.dir = r.dir === 1 ? -1 : 1
    r.turns++
  },
  *dn_wave(b, c) {
    const r = botOf(b, c)
    const arm = f(b, 'ARM')
    yield* animate(800, (k) => {
      const a = Math.sin(k * Math.PI) * 150
      if (arm !== 'right') r.armL = a
      if (arm !== 'left') r.armR = a
    })
    r.armL = r.armR = 0
    r.waves++
  },
  *dn_say(b, c) {
    const r = botOf(b, c)
    r.say((yield* evStr(b, 'TEXT', c)).slice(0, 40))
    yield 800
  },
  *dn_drive(b, c) {
    const r = botOf(b, c)
    const cm = Math.max(0, Math.min(300, Math.abs(yield* evNum(b, 'CM', c))))
    const sign = f(b, 'DIR') === 'back' ? -1 : 1
    // 25 cm/sn
    yield* animate((cm / 25) * 1000, (k) => { void k; r.advance((sign * 25 * TICK) / 1000); r.phase = (r.phase + sign * 40 + 360) % 360 })
  },
  *dn_pose(b, c) {
    const r = botOf(b, c)
    r.setPose(f(b, 'POSE') === 'otur' ? 'otur' : 'kalk')
    yield 500
  },
  *dn_tail(b, c) {
    const r = botOf(b, c)
    const n = Math.max(0, Math.min(20, Math.round(yield* evNum(b, 'N', c))))
    for (let i = 0; i < n; i++) { yield* animate(400, (k) => { r.tail = Math.sin(k * Math.PI * 2) * 30 }); r.tailWags++ }
    r.tail = 0
  },
  *dn_strum(b, c) {
    const r = botOf(b, c)
    const freq = r.noteFreq()
    c.dev.playTone(freq, 400)
    r.stringAmp = 1
    r.strums.push({ t: c.dev.now, freq, hand: r.handCm })
    yield 400
  },
  *dn_boom(b, c) {
    const r = botOf(b, c)
    const target = Math.max(0, Math.min(180, yield* evNum(b, 'DEG', c)))
    // 90 derece/sn
    const from = r.boom
    const ms = (Math.abs(target - from) / 90) * 1000
    yield* animate(ms, (k) => { r.boom = from + (target - from) * k; const l = r.loads.find((q) => q.id === r.carrying); if (l) l.angle = r.boom })
    r.boom = target
  },
  *dn_hook(b, c) {
    const r = botOf(b, c)
    const to = f(b, 'UPDOWN') === 'down' ? 1 : 0
    const from = r.hook
    yield* animate(Math.abs(to - from) * 600, (k) => { r.hook = from + (to - from) * k })
    r.hook = to
  },
  *dn_grab(b, c) {
    const r = botOf(b, c)
    if (f(b, 'ACTION') === 'release') r.release(); else r.grab()
    yield 300
  },
}

const exprs: Record<string, ExprHandler> = {
  *dn_distance(b, c) { const d = botOf(b, c).distanceCm; yield 1; return d as never },
}

export const DONUSEN_OPS = { stmts, exprs }

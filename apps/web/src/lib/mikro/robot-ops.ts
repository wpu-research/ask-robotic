// Robot (rb_*) bloklarının çalışma zamanı işleyicileri. ops.ts birleştirir; başka modül doğrudan içe aktarmamalıdır.
import { MikroError, evNum, type Ctx, type ExprHandler, type StmtHandler } from './runtime'
import { FLOOR_COLORS, type DriveBase, type FloorColor, type LightColor, type RobotSensor } from './robot'
import type { PBlock } from './types'

const SENSOR_NAME: Record<RobotSensor, string> = { distance: 'mesafe sensörü', color: 'renk sensörü', force: 'tampon (kuvvet) sensörü', line: 'çizgi sensörü' }
/** Hareket bloklarında robotun durumu bu aralıkla yoklanır (ms). */
const POLL_MS = 10

const f = (b: PBlock, n: string): string => String(b.fields?.[n] ?? '')

function robotOf(b: PBlock, c: Ctx, sensor?: RobotSensor): DriveBase {
  const r = c.dev.robot
  if (!r) throw new MikroError('Robot blokları yalnız Robot Atölyesi\'nde, kart bir robota takılıyken çalışır.', b.id ?? null)
  if (sensor && !r.has(sensor)) throw new MikroError(`${r.profile.title} gövdesinde ${SENSOR_NAME[sensor]} yok.`, b.id ?? null)
  return r
}

function* waitIdle(r: DriveBase) { while (r.busy) yield POLL_MS }

const stmts: Record<string, StmtHandler> = {
  *rb_move(b, c) {
    const r = robotOf(b, c)
    const cm = Math.abs(yield* evNum(b, 'CM', c))
    r.move(f(b, 'DIR') === 'back' ? -cm : cm)
    yield* waitIdle(r)
  },
  *rb_turn(b, c) {
    const r = robotOf(b, c)
    const deg = Math.abs(yield* evNum(b, 'DEG', c))
    r.turn(f(b, 'DIR') === 'right' ? -deg : deg)
    yield* waitIdle(r)
  },
  *rb_motors(b, c) {
    const r = robotOf(b, c)
    r.setMotors(yield* evNum(b, 'L', c), yield* evNum(b, 'R', c))
  },
  rb_stop(b, c) { robotOf(b, c).stop() },
  *rb_speed(b, c) {
    const r = robotOf(b, c)
    r.speed = Math.max(10, Math.min(100, Math.round(yield* evNum(b, 'P', c))))
  },
  rb_reset(b, c) { robotOf(b, c).resetAngles() },
  rb_lights(b, c) { robotOf(b, c).lights = f(b, 'COLOR') as LightColor },
}

/**
 * Sensör okuması 1 ms sürer (gerçek sensörler de sürekli örnekler). Böylece yalnız sensör yoklayan bir döngü
 * ("mesafe 10'dan büyükken") sanal zamanı ilerletir ve robot hareket eder; sensör okumayan döngüler yine yakalanır.
 */
const sense = <T,>(read: (b: PBlock, c: Ctx) => T): ExprHandler =>
  function* (b, c) { const r = read(b, c); yield SENSE_MS; return r as never }
const SENSE_MS = 1

const exprs: Record<string, ExprHandler> = {
  rb_distance: sense((b, c) => robotOf(b, c, 'distance').distanceCm),
  rb_color_is: sense((b, c) => robotOf(b, c, 'color').color === (f(b, 'C') as FloorColor)),
  rb_color: sense((b, c) => FLOOR_COLORS[robotOf(b, c, 'color').color].label),
  rb_reflect: sense((b, c) => robotOf(b, c, 'color').reflect),
  rb_line: sense((b, c) => robotOf(b, c, 'line').lineOn(f(b, 'SIDE') === 'right' ? 'right' : 'left')),
  rb_pressed: sense((b, c) => robotOf(b, c, 'force').pressed),
  rb_motor_deg: sense((b, c) => { const r = robotOf(b, c); return f(b, 'SIDE') === 'right' ? r.motorDegR : r.motorDegL }),
  rb_heading: sense((b, c) => robotOf(b, c).headingDeg),
}

export const ROBOT_OPS = { stmts, exprs }

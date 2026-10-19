// İnsansı robot poz programı: blok ya da kod kipinde yazılan poz sırası aynı adımlara çözülür ve bir zaman çizelgesine dönüşür.
// Kod sözdizimi (satır başına bir komut; TR ya da EN):
//   poz <ad> <ms>        | pose <name> <ms>       hazır poza ms içinde geç
//   eklem <eklem> <°> <ms>| joint <id> <deg> <ms>   tek eklemi döndür
//   bekle <ms>           | wait <ms>
//   yürü <adım>          | walk <steps>           LIPM yürüyüşüyle adım at
//   tekrarla <n> { ... } | repeat <n> { ... }
import { DEFAULT_GAIT, JOINT_IDS, POSES, POSE_IDS, gaitAt, lerpJoints, type GaitParams, type JointId, type Joints, type PoseId } from './kinematik'

export type PoseStep =
  | { kind: 'pose'; pose: PoseId; ms: number }
  | { kind: 'joint'; joint: JointId; deg: number; ms: number }
  | { kind: 'wait'; ms: number }
  | { kind: 'walk'; steps: number }

const POSE_EN: Record<string, PoseId> = { ready: 'hazir', squat: 'comel', 'one-leg': 'tek-ayak', wave: 'el-salla', 'arms-up': 'kollar-yukari', lean: 'egil', kick: 'tekme' }
export const POSE_NAME_EN: Record<PoseId, string> = Object.fromEntries(Object.entries(POSE_EN).map(([k, v]) => [v, k])) as Record<PoseId, string>
const MAX_STEPS = 400
const MAX_MS = 10_000

export interface Compiled { steps: PoseStep[]; error: string | null; errorEn: string | null }

/** Kodu adımlara çevirir; tekrarla blokları açılır. */
export function compilePoseProgram(src: string): Compiled {
  const lines = src.split('\n')
  const out: PoseStep[] = []
  let i = 0
  const fail = (n: number, tr: string, en: string): Compiled => ({ steps: [], error: `${n}. satır: ${tr}`, errorEn: `Line ${n}: ${en}` })
  const ms = (v: string | undefined) => { const x = Number(v); return Number.isFinite(x) && x >= 0 && x <= MAX_MS ? Math.round(x) : null }
  function block(depth: number): Compiled | null {
    while (i < lines.length) {
      const n = i + 1
      const raw = lines[i++].replace(/#.*$/, '').trim()
      if (!raw) continue
      if (raw === '}') return depth > 0 ? null : fail(n, 'fazladan "}".', 'unexpected "}".')
      const w = raw.split(/\s+/)
      const cmd = w[0].toLocaleLowerCase('tr')
      if (cmd === 'poz' || cmd === 'pose') {
        const name = (w[1] ?? '').toLocaleLowerCase('tr')
        const id = (POSE_IDS as string[]).includes(name) ? (name as PoseId) : POSE_EN[name]
        if (!id) return fail(n, `"${w[1] ?? ''}" diye bir poz yok (${POSE_IDS.join(', ')}).`, `no pose called "${w[1] ?? ''}" (${Object.keys(POSE_EN).join(', ')}).`)
        const t = ms(w[2] ?? '500')
        if (t == null) return fail(n, 'süre 0-10000 ms olmalı.', 'duration must be 0-10000 ms.')
        out.push({ kind: 'pose', pose: id, ms: t })
      } else if (cmd === 'eklem' || cmd === 'joint') {
        const j = w[1] as JointId
        if (!JOINT_IDS.includes(j)) return fail(n, `"${w[1] ?? ''}" diye bir eklem yok (örnek: kneeL, hipPitchR).`, `no joint called "${w[1] ?? ''}" (e.g. kneeL, hipPitchR).`)
        const deg = Number(w[2]), t = ms(w[3] ?? '300')
        if (!Number.isFinite(deg) || Math.abs(deg) > 180) return fail(n, 'açı -180 ile 180 arasında olmalı.', 'angle must be between -180 and 180.')
        if (t == null) return fail(n, 'süre 0-10000 ms olmalı.', 'duration must be 0-10000 ms.')
        out.push({ kind: 'joint', joint: j, deg, ms: t })
      } else if (cmd === 'bekle' || cmd === 'wait') {
        const t = ms(w[1])
        if (t == null) return fail(n, 'bekleme süresi 0-10000 ms olmalı.', 'wait must be 0-10000 ms.')
        out.push({ kind: 'wait', ms: t })
      } else if (cmd === 'yürü' || cmd === 'yuru' || cmd === 'walk') {
        const k = Number(w[1] ?? '2')
        if (!Number.isInteger(k) || k < 1 || k > 20) return fail(n, 'adım sayısı 1-20 olmalı.', 'steps must be 1-20.')
        out.push({ kind: 'walk', steps: k })
      } else if (cmd === 'tekrarla' || cmd === 'repeat') {
        const k = Number(w[1])
        if (!Number.isInteger(k) || k < 1 || k > 20 || w[2] !== '{') return fail(n, '"tekrarla <1-20> {" yazmalısın.', 'write "repeat <1-20> {".')
        const start = out.length
        const r = block(depth + 1)
        if (r) return r
        const body = out.slice(start)
        for (let c = 1; c < k; c++) out.push(...body)
      } else return fail(n, `"${w[0]}" komutu tanınmadı (poz, eklem, bekle, yürü, tekrarla).`, `unknown command "${w[0]}" (pose, joint, wait, walk, repeat).`)
      if (out.length > MAX_STEPS) return fail(n, 'program çok uzun.', 'program too long.')
    }
    return depth > 0 ? fail(lines.length, '"}" eksik.', 'missing "}".') : null
  }
  const r = block(0)
  return r ?? { steps: out, error: null, errorEn: null }
}

/** Adımları koda çevirir (blok kipinden kod kipine geçerken). */
export function stepsToCode(steps: PoseStep[], en = false): string {
  return steps.map((s) => {
    if (s.kind === 'pose') return en ? `pose ${POSE_NAME_EN[s.pose]} ${s.ms}` : `poz ${s.pose} ${s.ms}`
    if (s.kind === 'joint') return `${en ? 'joint' : 'eklem'} ${s.joint} ${s.deg} ${s.ms}`
    if (s.kind === 'wait') return `${en ? 'wait' : 'bekle'} ${s.ms}`
    return `${en ? 'walk' : 'yürü'} ${s.steps}`
  }).join('\n')
}

type Seg =
  | { t0: number; t1: number; kind: 'lerp'; from: Joints; to: Joints }
  | { t0: number; t1: number; kind: 'walk'; from: Joints; x0: number; gp: GaitParams; steps: number }
export interface Timeline { segs: Seg[]; durationMs: number; start: Joints }

/** Adımlardan zaman çizelgesi: her poz/eklem adımı bir önceki duruştan doğrusal geçiştir. */
export function poseTimeline(steps: PoseStep[], start: Joints = POSES.hazir.joints(), gp: GaitParams = DEFAULT_GAIT): Timeline {
  const segs: Seg[] = []
  let t = 0, cur = start, x = 0
  for (const s of steps) {
    if (s.kind === 'wait') { segs.push({ t0: t, t1: t + s.ms, kind: 'lerp', from: cur, to: cur }); t += s.ms; continue }
    if (s.kind === 'walk') {
      const dur = s.steps * gp.period * 1000
      segs.push({ t0: t, t1: t + dur, kind: 'walk', from: cur, x0: x, gp, steps: s.steps })
      t += dur
      x += s.steps * gp.stepLength
      cur = POSES.hazir.joints()
      continue
    }
    const to = s.kind === 'pose' ? POSES[s.pose].joints() : { ...cur, [s.joint]: s.deg }
    segs.push({ t0: t, t1: t + s.ms, kind: 'lerp', from: cur, to })
    t += s.ms
    cur = to
  }
  return { segs, durationMs: t, start }
}

export interface TimelineFrame { joints: Joints; /** yürüyüşte pelvis (dünya) ve taban hedefleri; duruşta yalnız ileri kayma */ walk: ReturnType<typeof gaitAt> | null; x: number }

export function sampleFrame(tl: Timeline, tMs: number): TimelineFrame {
  let x = 0
  for (const s of tl.segs) {
    if (s.kind === 'walk') {
      if (tMs < s.t1) {
        if (tMs < s.t0) break
        const tt = (tMs - s.t0) / 1000
        const g = gaitAt(s.gp, tt)
        // ilk çeyrek adımda önceki duruştan yürüyüş duruşuna yumuşak geçiş
        const u = Math.min(1, tt / (s.gp.period * 0.25))
        return { joints: lerpJoints(s.from, g.joints, u), walk: g, x: s.x0 }
      }
      x = s.x0 + s.steps * s.gp.stepLength
      continue
    }
    if (tMs < s.t1 && tMs >= s.t0) {
      const u = s.t1 > s.t0 ? (tMs - s.t0) / (s.t1 - s.t0) : 1
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2 // yumuşak başla, yumuşak dur
      return { joints: lerpJoints(s.from, s.to, e), walk: null, x }
    }
  }
  const last = tl.segs[tl.segs.length - 1]
  if (!last) return { joints: tl.start, walk: null, x: 0 }
  return { joints: last.kind === 'lerp' ? last.to : POSES.hazir.joints(), walk: null, x }
}
export const sampleTimeline = (tl: Timeline, tMs: number): Joints => sampleFrame(tl, tMs).joints

export const EXAMPLE_PROGRAM = `# Selamla, çömel, kalk ve iki adım yürü
poz hazir 400
tekrarla 2 {
  poz el-salla 400
  eklem elbowR 20 250
  eklem elbowR 70 250
}
poz comel 700
poz hazir 600
yürü 4
poz kollar-yukari 500`
export const EXAMPLE_PROGRAM_EN = `# Wave, squat, stand up and walk
pose ready 400
repeat 2 {
  pose wave 400
  joint elbowR 20 250
  joint elbowR 70 250
}
pose squat 700
pose ready 600
walk 4
pose arms-up 500`

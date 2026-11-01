'use client'
// Devredeki sürücü/sensör parçalarını MuJoCo robotunun motor ve sensörlerine bağlayan panel.
// İki yerden kullanılır: MuRoKo'nun ELEK rafı ve devre laboratuvarındaki robot görüntüsü.
import { useMemo } from 'react'
import { PROPS, type Circuit } from '@/lib/lab/contract'
import { autoPlan, type CtrlRange, type MotorLink, type SensorLink, type WiringPlan } from '@/lib/mujoco/wiring'

/** Devredeki sürücü sayılan parçalar (MuJoCo motoruna bağlanabilir). */
const DRIVER_TYPES: Record<string, 'servo' | 'dcmotor'> = { servo: 'servo', dcmotor: 'dcmotor' }

/** Bir parçanın dışarıdan beslenebilen (canlı) sayısal özellikleri. */
function liveProps(type: string): { key: string; label: string }[] {
  const specs = (PROPS as Record<string, readonly { key: string; label: string; kind: string; live?: boolean }[]>)[type]
  if (!specs) return []
  return specs.filter((s) => s.live && s.kind === 'number').map((s) => ({ key: s.key, label: s.label }))
}

interface Props {
  circuit: Circuit
  plan: WiringPlan
  onPlan: (p: WiringPlan) => void
  /** MuJoCo motorlarının adları ve kontrol aralıkları. */
  ranges: CtrlRange[]
  /** MuJoCo sensör kanalı adları. */
  channels: string[]
  en: boolean
}

export function WiringPanel({ circuit, plan, onPlan, ranges, channels, en }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)

  const drivers = useMemo(
    () => circuit.parts.filter((p) => DRIVER_TYPES[p.type]).map((p) => ({ id: p.id, type: p.type, kind: DRIVER_TYPES[p.type] })),
    [circuit],
  )
  const sensorParts = useMemo(
    () => circuit.parts.map((p) => ({ id: p.id, type: p.type, props: liveProps(p.type) })).filter((p) => p.props.length > 0),
    [circuit],
  )

  const setMotorLink = (actuator: string, value: string) => {
    const rest = plan.motors.filter((m) => m.actuator !== actuator)
    if (!value) return onPlan({ ...plan, motors: rest })
    const d = drivers.find((x) => x.id === value)
    if (!d) return
    const old = plan.motors.find((m) => m.actuator === actuator)
    onPlan({ ...plan, motors: [...rest, { actuator, partId: d.id, kind: d.kind, invert: old?.invert }] })
  }
  const toggleInvert = (actuator: string) => {
    onPlan({ ...plan, motors: plan.motors.map((m) => (m.actuator === actuator ? { ...m, invert: !m.invert } : m)) })
  }
  const setSensorLink = (channel: string, value: string) => {
    const rest = plan.sensors.filter((s) => s.channel !== channel)
    if (!value) return onPlan({ ...plan, sensors: rest })
    const [partId, prop] = value.split('::')
    // Mesafe sensörleri metre yerine cm bekler; otomatik eşlemeyle aynı çarpan
    const isDist = prop === 'distanceCm'
    const link: SensorLink = { partId, prop, channel, ...(isDist ? { scale: 100, min: 2, max: 400 } : {}) }
    onPlan({ ...plan, sensors: [...rest, link] })
  }

  const motorOf = (a: string): MotorLink | undefined => plan.motors.find((m) => m.actuator === a)
  const sensorOf = (c: string): SensorLink | undefined => plan.sensors.find((s) => s.channel === c)

  return (
    <div className="mj-panel" data-testid="mujoco-link-panel">
      <div className="mj-bar">
        <button className="sbtn ghost" onClick={() => onPlan(autoPlan(circuit, ranges, channels))} data-testid="mujoco-autolink">
          ✨ {L('Otomatik bağla', 'Auto-link')}
        </button>
        {plan.motors.length > 0 && (
          <button className="sbtn ghost" onClick={() => onPlan({ motors: [], sensors: [] })}>{L('Hepsini çöz', 'Unlink all')}</button>
        )}
      </div>

      <h4 className="mj-link-h">{L('Robotun motorları', 'Robot motors')}</h4>
      {ranges.length === 0
        ? <p className="muted">{L('Bu robotta motor yok.', 'This robot has no motors.')}</p>
        : <ul className="mj-links">
          {ranges.map((r) => {
            const m = motorOf(r.name)
            return (
              <li key={r.name}>
                <span className="mj-link-n" title={r.name}>{r.name}</span>
                <select value={m?.partId ?? ''} onChange={(e) => setMotorLink(r.name, e.target.value)} data-testid={`mujoco-link-${r.name}`}
                  aria-label={`${r.name} ${L('sürücüsü', 'driver')}`}>
                  <option value="">— {L('bağlı değil', 'not linked')} —</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.id} ({d.type})</option>)}
                </select>
                <button className={`mj-inv${m?.invert ? ' on' : ''}`} disabled={!m} onClick={() => toggleInvert(r.name)}
                  title={L('Yönü ters çevir', 'Reverse direction')} aria-pressed={!!m?.invert}>⇄</button>
              </li>
            )
          })}
        </ul>}

      <h4 className="mj-link-h">{L('Robotun sensörleri', 'Robot sensors')}</h4>
      {channels.length === 0
        ? <p className="muted">{L('Bu robotta sensör yok.', 'This robot has no sensors.')}</p>
        : <ul className="mj-links">
          {channels.map((c) => {
            const s = sensorOf(c)
            return (
              <li key={c}>
                <span className="mj-link-n" title={c}>{c}</span>
                <select value={s ? `${s.partId}::${s.prop}` : ''} onChange={(e) => setSensorLink(c, e.target.value)}
                  aria-label={`${c} ${L('hedefi', 'target')}`} data-testid={`mujoco-slink-${c}`}>
                  <option value="">— {L('bağlı değil', 'not linked')} —</option>
                  {sensorParts.flatMap((p) => p.props.map((pr) => (
                    <option key={`${p.id}::${pr.key}`} value={`${p.id}::${pr.key}`}>{p.id} · {pr.label}</option>
                  )))}
                </select>
              </li>
            )
          })}
        </ul>}

      <p className="muted">{L(
        'Bağlantı, robotun motorunu devredeki sürücüye bağlar. Devredeki servo döndüğünde robotun eklemi döner; robotun sensörü de devredeki sensörü besler.',
        'A link ties a robot motor to a driver in your circuit. When the servo turns, the joint turns; the robot’s sensors feed the circuit’s sensors.')}</p>
    </div>
  )
}

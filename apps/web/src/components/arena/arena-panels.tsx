'use client'
import type { ArenaGoalResult, ArenaScene, ArenaSnapshot, ArmSnapshot, BalancerSnapshot, RoverScene, RoverSnapshot } from '@/lib/arena/types'
import type { Locale } from '@/i18n'
import { useLocale, useT } from '@/i18n/client'

/** Sayı biçimi: Türkçede ondalık virgül, İngilizcede nokta. */
const fmt = (locale: Locale) => (n: number, d = 2) => (Number.isFinite(n) ? (locale === 'tr' ? n.toFixed(d).replace('.', ',') : n.toFixed(d)) : '–')

/** Hedef paneli (LabGoals ile aynı görünüm; ArenaGoal sonuçları için). */
export function ArenaGoals({ status }: { status: ArenaGoalResult[] }) {
  const t = useT()
  if (!status.length) return null
  const done = status.filter((g) => g.done).length
  const all = done === status.length
  return (
    <section className={`jr-goals${all ? ' all' : ''}`} aria-label={t('lab.goals.title')} data-testid="arena-goals">
      <div className="jr-goals-head"><b>{t('lab.goals.title')}</b><span>{done} / {status.length}</span></div>
      <ul>
        {status.map((g) => (
          <li key={g.id} className={g.done ? 'done' : undefined} data-goal={g.id} data-done={g.done}>
            <span className="jr-goal-mark" aria-hidden="true">{g.done ? '✓' : ''}</span>
            <span>{g.text}{!g.done && g.hint && <small>{g.hint}</small>}</span>
          </li>
        ))}
      </ul>
      {all && <p className="jr-goals-ok">{t('lab.goals.allDone')}</p>}
    </section>
  )
}

function Row({ k, v, id }: { k: string; v: string; id?: string }) {
  return <div className="arena-row" data-k={id}><dt>{k}</dt><dd>{v}</dd></div>
}

/** Canlı sensör / enkoder / odometri paneli. */
export function SensorPanel({ scene, snap, onButton, onNudge }: { scene: ArenaScene; snap: ArenaSnapshot; onButton?: (pin: number, down: boolean) => void; onNudge?: (forward: number, left: number, turnDeg: number) => void }) {
  const t = useT()
  const f = fmt(useLocale())
  if (snap.kind === 'arm') return <ArmPanel snap={snap} />
  if (snap.kind === 'balancer') return <BalancerPanel snap={snap} />
  if (scene.kind !== 'rover') return null
  const sc: RoverScene = scene, s: RoverSnapshot = snap
  const st = sc.sensors
  return (
    <section className="arena-panel" aria-label={t('lab.arena.panel.sensors')} data-testid="arena-sensors">
      <div className="arena-panel-col">
        <h4>{t('lab.arena.panel.robot')}</h4>
        <dl>
          <Row id="x" k={t('lab.arena.panel.position')} v={`${f(s.x)} m, ${f(s.y)} m`} />
          <Row id="theta" k={t('lab.arena.panel.heading')} v={`${f(s.thetaDeg, 0)}°`} />
          <Row id="v" k={t('lab.arena.panel.speed')} v={`${f(s.v * 100, 0)} cm/s`} />
          <Row id="omega" k={t('lab.arena.panel.turn')} v={`${f(s.omega, 2)} rad/s`} />
          <Row id="dist" k={t('lab.arena.panel.distance')} v={`${f(s.distanceM)} m`} />
          <Row id="collisions" k={t('lab.arena.panel.hits')} v={String(s.collisions)} />
          <Row id="cover" k={t('lab.arena.panel.cover')} v={t('lab.arena.panel.cells', { n: s.coverCells })} />
        </dl>
      </div>
      {st.encoders && (
        <div className="arena-panel-col">
          <h4>{t('lab.arena.panel.encoders')}</h4>
          <dl>
            <Row id="ticks" k={t('lab.arena.panel.ticks')} v={`${s.ticksL} / ${s.ticksR}`} />
            <Row id="odo" k={t('lab.arena.panel.odoPos')} v={`${f(s.odo.x)} m, ${f(s.odo.y)} m`} />
            <Row id="odoth" k={t('lab.arena.panel.odoHeading')} v={`${f((s.odo.theta * 180) / Math.PI, 0)}°`} />
            <Row id="odod" k={t('lab.arena.panel.drift')} v={`${f(Math.hypot(s.odo.x - s.x, s.odo.y - s.y) * 100, 1)} cm`} />
          </dl>
        </div>
      )}
      {st.line && (
        <div className="arena-panel-col wide">
          <h4>{t('lab.arena.panel.lineSensors')}</h4>
          <div className="arena-bars" data-testid="arena-linebars">
            {s.line.map((l) => (
              <div key={l.pin} className="arena-bar" data-on={l.on ? 'true' : 'false'} title={`A${l.pin}: ${l.adc}`}>
                <span className="arena-bar-fill" style={{ height: `${(l.adc / 1023) * 100}%` }} />
                <b>A{l.pin}</b><i>{l.adc}</i>
              </div>
            ))}
          </div>
          <dl><Row id="lost" k={t('lab.arena.panel.lineLost')} v={t('lab.arena.panel.times', { n: s.lineExits })} /><Row id="off" k={t('lab.arena.panel.offLine')} v={t('lab.arena.panel.sec', { n: f(s.totalOffLineMs / 1000, 1) })} /></dl>
        </div>
      )}
      {st.ultrasonic && (
        <div className="arena-panel-col">
          <h4>{t('lab.arena.panel.distSensor')}</h4>
          <dl><Row id="front" k={t('lab.arena.panel.front')} v={s.frontCm >= 400 ? '> 400 cm' : `${f(s.frontCm, 0)} cm`} /></dl>
        </div>
      )}
      {st.bumpers && (
        <div className="arena-panel-col">
          <h4>{t('lab.arena.panel.bumpers')}</h4>
          <dl>
            <Row id="bl" k={t('lab.arena.panel.left')} v={s.bumperL ? t('lab.arena.panel.pressed') : t('lab.arena.panel.released')} />
            <Row id="br" k={t('lab.arena.panel.right')} v={s.bumperR ? t('lab.arena.panel.pressed') : t('lab.arena.panel.released')} />
          </dl>
        </div>
      )}
      {sc.movable && onNudge ? (
        <div className="arena-panel-col" data-testid="arena-nudge">
          <h4>{t('lab.arena.panel.nudge')}</h4>
          <div className="arena-pad" role="group" aria-label={t('lab.arena.panel.nudgeAria')}>
            <button type="button" className="jr-btn small" aria-label={t('lab.arena.panel.rotLeft')} onClick={() => onNudge(0, 0, 5)}>⟲</button>
            <button type="button" className="jr-btn small" aria-label={t('lab.arena.panel.forward')} onClick={() => onNudge(0.01, 0, 0)}>▲</button>
            <button type="button" className="jr-btn small" aria-label={t('lab.arena.panel.rotRight')} onClick={() => onNudge(0, 0, -5)}>⟳</button>
            <button type="button" className="jr-btn small" aria-label={t('lab.arena.panel.left1')} onClick={() => onNudge(0, 0.01, 0)}>◀</button>
            <button type="button" className="jr-btn small" aria-label={t('lab.arena.panel.back1')} onClick={() => onNudge(-0.01, 0, 0)}>▼</button>
            <button type="button" className="jr-btn small" aria-label={t('lab.arena.panel.right1')} onClick={() => onNudge(0, -0.01, 0)}>▶</button>
          </div>
          <small className="muted">{t('lab.arena.panel.nudgeHint')}</small>
        </div>
      ) : null}
      {sc.buttons?.length ? (
        <div className="arena-panel-col">
          <h4>{t('lab.arena.panel.buttons')}</h4>
          <div className="arena-btns">
            {sc.buttons.map((b) => (
              <button
                key={b.pin} type="button" className="jr-btn small" data-testid={`arena-btn-${b.pin}`}
                onPointerDown={() => onButton?.(b.pin, true)} onPointerUp={() => onButton?.(b.pin, false)} onPointerLeave={() => onButton?.(b.pin, false)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onButton?.(b.pin, true) }} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') onButton?.(b.pin, false) }}
              >{b.label}</button>
            ))}
          </div>
          <small className="muted">{t('lab.arena.panel.buttonsHint')}</small>
        </div>
      ) : null}
    </section>
  )
}

function ArmPanel({ snap }: { snap: ArmSnapshot }) {
  const t = useT()
  const f = fmt(useLocale())
  return (
    <section className="arena-panel" aria-label={t('lab.arena.panel.arm')} data-testid="arena-sensors">
      <div className="arena-panel-col">
        <h4>{t('lab.arena.panel.joints')}</h4>
        <dl>
          <Row id="q1" k={t('lab.arena.panel.shoulder')} v={`${f(snap.q1, 1)}°`} />
          <Row id="q2" k={t('lab.arena.panel.elbow')} v={`${f(snap.q2, 1)}°`} />
          <Row id="grip" k={t('lab.arena.panel.gripper')} v={`${f(snap.grip, 0)}° ${snap.gripClosed ? t('lab.arena.panel.closed') : t('lab.arena.panel.open')}`} />
        </dl>
      </div>
      <div className="arena-panel-col">
        <h4>{t('lab.arena.panel.tip')}</h4>
        <dl>
          <Row id="tip" k="x, y" v={`${f(snap.tipX, 1)}, ${f(snap.tipY, 1)} cm`} />
          <Row id="held" k={t('lab.arena.panel.held')} v={snap.held ?? t('lab.arena.panel.nothing')} />
          <Row id="jump" k={t('lab.arena.panel.maxJump')} v={`${f(snap.maxJumpDeg, 1)}°`} />
        </dl>
      </div>
    </section>
  )
}

function BalancerPanel({ snap }: { snap: BalancerSnapshot }) {
  const t = useT()
  const f = fmt(useLocale())
  return (
    <section className="arena-panel" aria-label={t('lab.arena.panel.balance')} data-testid="arena-sensors">
      <div className="arena-panel-col">
        <h4>{t('lab.arena.panel.tiltImu')}</h4>
        <dl>
          <Row id="tilt" k={t('lab.arena.panel.tilt')} v={`${f(snap.thetaDeg, 1)}°`} />
          <Row id="rate" k={t('lab.arena.panel.tiltRate')} v={`${f(snap.rateDps, 0)} °/s`} />
          <Row id="max" k={t('lab.arena.panel.maxTilt')} v={`${f(snap.maxAbsDeg, 1)}°`} />
        </dl>
      </div>
      <div className="arena-panel-col">
        <h4>{t('lab.arena.panel.state')}</h4>
        <dl>
          <Row id="state" k={t('lab.arena.panel.state')} v={snap.fell ? t('lab.arena.panel.fell') : t('lab.arena.panel.upright')} />
          <Row id="upright" k={t('lab.arena.panel.uprightTime')} v={t('lab.arena.panel.sec', { n: f(snap.uprightS, 1) })} />
          <Row id="x" k={t('lab.arena.panel.position')} v={`${f(snap.x, 2)} m`} />
        </dl>
      </div>
      {snap.push && (
        <div className="arena-panel-col">
          <h4>{t('lab.arena.panel.pushes', { n: snap.pushCount })}</h4>
          <dl>
            <Row id="push-at" k={t('lab.arena.panel.firstPush')} v={`${t('lab.arena.panel.sec', { n: f(snap.push.atS, 2) })}, ${snap.push.dps > 0 ? '+' : ''}${f(snap.push.dps, 0)} °/s`} />
            <Row id="push-max" k={t('lab.arena.panel.pushMax')} v={`${f(snap.push.maxAbsDeg, 1)}°`} />
            <Row id="push-settle" k={t('lab.arena.panel.settle')} v={snap.push.settleMs === null ? t('lab.arena.panel.notSettled') : `${snap.push.settleMs} ms`} />
          </dl>
        </div>
      )}
    </section>
  )
}

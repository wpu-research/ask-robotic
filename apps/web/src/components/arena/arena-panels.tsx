'use client'
import type { ArenaGoalResult, ArenaScene, ArenaSnapshot, ArmSnapshot, BalancerSnapshot, RoverScene, RoverSnapshot } from '@/lib/arena/types'

const f = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '–')

/** Hedef paneli (LabGoals ile aynı görünüm; ArenaGoal sonuçları için). */
export function ArenaGoals({ status }: { status: ArenaGoalResult[] }) {
  if (!status.length) return null
  const done = status.filter((g) => g.done).length
  const all = done === status.length
  return (
    <section className={`jr-goals${all ? ' all' : ''}`} aria-label="Hedefler" data-testid="arena-goals">
      <div className="jr-goals-head"><b>Hedefler</b><span>{done} / {status.length}</span></div>
      <ul>
        {status.map((g) => (
          <li key={g.id} className={g.done ? 'done' : undefined} data-goal={g.id} data-done={g.done}>
            <span className="jr-goal-mark" aria-hidden="true">{g.done ? '✓' : ''}</span>
            <span>{g.text}{!g.done && g.hint && <small>{g.hint}</small>}</span>
          </li>
        ))}
      </ul>
      {all && <p className="jr-goals-ok">Tüm hedefler tamam. Harika iş!</p>}
    </section>
  )
}

function Row({ k, v, id }: { k: string; v: string; id?: string }) {
  return <div className="arena-row" data-k={id}><dt>{k}</dt><dd>{v}</dd></div>
}

/** Canlı sensör / enkoder / odometri paneli. */
export function SensorPanel({ scene, snap, onButton, onNudge }: { scene: ArenaScene; snap: ArenaSnapshot; onButton?: (pin: number, down: boolean) => void; onNudge?: (forward: number, left: number, turnDeg: number) => void }) {
  if (snap.kind === 'arm') return <ArmPanel snap={snap} />
  if (snap.kind === 'balancer') return <BalancerPanel snap={snap} />
  if (scene.kind !== 'rover') return null
  const sc: RoverScene = scene, s: RoverSnapshot = snap
  const st = sc.sensors
  return (
    <section className="arena-panel" aria-label="Sensörler ve ölçümler" data-testid="arena-sensors">
      <div className="arena-panel-col">
        <h4>Robot</h4>
        <dl>
          <Row id="x" k="Konum" v={`${f(s.x)} m, ${f(s.y)} m`} />
          <Row id="theta" k="Yön" v={`${f(s.thetaDeg, 0)}°`} />
          <Row id="v" k="Hız" v={`${f(s.v * 100, 0)} cm/s`} />
          <Row id="omega" k="Dönme" v={`${f(s.omega, 2)} rad/s`} />
          <Row id="dist" k="Yol" v={`${f(s.distanceM)} m`} />
          <Row id="collisions" k="Çarpma" v={String(s.collisions)} />
          <Row id="cover" k="Gezilen alan" v={`${s.coverCells} hücre`} />
        </dl>
      </div>
      {st.encoders && (
        <div className="arena-panel-col">
          <h4>Enkoder ve odometri</h4>
          <dl>
            <Row id="ticks" k="Tık (sol / sağ)" v={`${s.ticksL} / ${s.ticksR}`} />
            <Row id="odo" k="Tahmini konum" v={`${f(s.odo.x)} m, ${f(s.odo.y)} m`} />
            <Row id="odoth" k="Tahmini yön" v={`${f((s.odo.theta * 180) / Math.PI, 0)}°`} />
            <Row id="odod" k="Sapma" v={`${f(Math.hypot(s.odo.x - s.x, s.odo.y - s.y) * 100, 1)} cm`} />
          </dl>
        </div>
      )}
      {st.line && (
        <div className="arena-panel-col wide">
          <h4>Çizgi sensörleri (A0 en solda)</h4>
          <div className="arena-bars" data-testid="arena-linebars">
            {s.line.map((l) => (
              <div key={l.pin} className="arena-bar" data-on={l.on ? 'true' : 'false'} title={`A${l.pin}: ${l.adc}`}>
                <span className="arena-bar-fill" style={{ height: `${(l.adc / 1023) * 100}%` }} />
                <b>A{l.pin}</b><i>{l.adc}</i>
              </div>
            ))}
          </div>
          <dl><Row id="lost" k="Çizgi kaybı" v={`${s.lineExits} kez`} /><Row id="off" k="Dışarıda" v={`${f(s.totalOffLineMs / 1000, 1)} sn`} /></dl>
        </div>
      )}
      {st.ultrasonic && (
        <div className="arena-panel-col">
          <h4>Mesafe sensörü</h4>
          <dl><Row id="front" k="Ön mesafe" v={s.frontCm >= 400 ? '> 400 cm' : `${f(s.frontCm, 0)} cm`} /></dl>
        </div>
      )}
      {st.bumpers && (
        <div className="arena-panel-col">
          <h4>Tamponlar</h4>
          <dl>
            <Row id="bl" k="Sol" v={s.bumperL ? 'BASILI' : 'serbest'} />
            <Row id="br" k="Sağ" v={s.bumperR ? 'BASILI' : 'serbest'} />
          </dl>
        </div>
      )}
      {sc.movable && onNudge ? (
        <div className="arena-panel-col" data-testid="arena-nudge">
          <h4>Robotu kaydır</h4>
          <div className="arena-pad" role="group" aria-label="Robotu elle kaydır">
            <button type="button" className="jr-btn small" aria-label="5 derece sola döndür" onClick={() => onNudge(0, 0, 5)}>⟲</button>
            <button type="button" className="jr-btn small" aria-label="İleri 1 cm" onClick={() => onNudge(0.01, 0, 0)}>▲</button>
            <button type="button" className="jr-btn small" aria-label="5 derece sağa döndür" onClick={() => onNudge(0, 0, -5)}>⟳</button>
            <button type="button" className="jr-btn small" aria-label="Sola 1 cm" onClick={() => onNudge(0, 0.01, 0)}>◀</button>
            <button type="button" className="jr-btn small" aria-label="Geri 1 cm" onClick={() => onNudge(-0.01, 0, 0)}>▼</button>
            <button type="button" className="jr-btn small" aria-label="Sağa 1 cm" onClick={() => onNudge(0, -0.01, 0)}>▶</button>
          </div>
          <small className="muted">Robotu fareyle sürükleyebilirsin. Adım: 1 cm / 5°.</small>
        </div>
      ) : null}
      {sc.buttons?.length ? (
        <div className="arena-panel-col">
          <h4>Düğmeler</h4>
          <div className="arena-btns">
            {sc.buttons.map((b) => (
              <button
                key={b.pin} type="button" className="jr-btn small" data-testid={`arena-btn-${b.pin}`}
                onPointerDown={() => onButton?.(b.pin, true)} onPointerUp={() => onButton?.(b.pin, false)} onPointerLeave={() => onButton?.(b.pin, false)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onButton?.(b.pin, true) }} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') onButton?.(b.pin, false) }}
              >{b.label}</button>
            ))}
          </div>
          <small className="muted">Basılı tut: pin LOW olur.</small>
        </div>
      ) : null}
    </section>
  )
}

function ArmPanel({ snap }: { snap: ArmSnapshot }) {
  return (
    <section className="arena-panel" aria-label="Kol ölçümleri" data-testid="arena-sensors">
      <div className="arena-panel-col">
        <h4>Eklemler</h4>
        <dl>
          <Row id="q1" k="Omuz (D9)" v={`${f(snap.q1, 1)}°`} />
          <Row id="q2" k="Dirsek (D10)" v={`${f(snap.q2, 1)}°`} />
          <Row id="grip" k="Tutucu (D11)" v={`${f(snap.grip, 0)}° ${snap.gripClosed ? '(kapalı)' : '(açık)'}`} />
        </dl>
      </div>
      <div className="arena-panel-col">
        <h4>Uç noktası</h4>
        <dl>
          <Row id="tip" k="x, y" v={`${f(snap.tipX, 1)}, ${f(snap.tipY, 1)} cm`} />
          <Row id="held" k="Tuttuğu" v={snap.held ?? 'yok'} />
          <Row id="jump" k="En büyük atlama" v={`${f(snap.maxJumpDeg, 1)}°`} />
        </dl>
      </div>
    </section>
  )
}

function BalancerPanel({ snap }: { snap: BalancerSnapshot }) {
  return (
    <section className="arena-panel" aria-label="Denge ölçümleri" data-testid="arena-sensors">
      <div className="arena-panel-col">
        <h4>Eğim (IMU)</h4>
        <dl>
          <Row id="tilt" k="Eğim" v={`${f(snap.thetaDeg, 1)}°`} />
          <Row id="rate" k="Eğim hızı" v={`${f(snap.rateDps, 0)} °/s`} />
          <Row id="max" k="En büyük eğim" v={`${f(snap.maxAbsDeg, 1)}°`} />
        </dl>
      </div>
      <div className="arena-panel-col">
        <h4>Durum</h4>
        <dl>
          <Row id="state" k="Durum" v={snap.fell ? 'DÜŞTÜ' : 'ayakta'} />
          <Row id="upright" k="Ayakta kalma" v={`${f(snap.uprightS, 1)} sn`} />
          <Row id="x" k="Konum" v={`${f(snap.x, 2)} m`} />
        </dl>
      </div>
      {snap.push && (
        <div className="arena-panel-col">
          <h4>İtme ({snap.pushCount})</h4>
          <dl>
            <Row id="push-at" k="İlk itme" v={`${f(snap.push.atS, 2)} sn, ${snap.push.dps > 0 ? '+' : ''}${f(snap.push.dps, 0)} °/s`} />
            <Row id="push-max" k="İtmeden beri en büyük eğim" v={`${f(snap.push.maxAbsDeg, 1)}°`} />
            <Row id="push-settle" k="Oturma süresi" v={snap.push.settleMs === null ? 'oturmadı' : `${snap.push.settleMs} ms`} />
          </dl>
        </div>
      )}
    </section>
  )
}

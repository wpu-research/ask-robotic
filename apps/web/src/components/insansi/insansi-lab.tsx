'use client'
// İnsansı Robot laboratuvarı (ileri seviye): eklem açıları (FK), ayak hedefi sürükleme (IK), ağırlık merkezi ve destek çokgeni,
// LIPM yürüyüş üreteci ve eklem grafikleri, poz programı (blok/kod), Python/C++ kodu.
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BODY, DEFAULT_GAIT, JOINT_IDS, POSES, POSE_IDS, SERVO, STAND_Z, applyLegIK, bodyFK, footIK, gaitAt, gaitCycle, gaitIssues, grounded,
  limitViolations, staticBalance, type GaitParams, type JointId, type Joints, type PoseId, type Side, type V3,
} from '@/lib/insansi/kinematik'
import { EXAMPLE_PROGRAM, EXAMPLE_PROGRAM_EN, POSE_NAME_EN, compilePoseProgram, poseTimeline, sampleFrame, stepsToCode, type PoseStep } from '@/lib/insansi/poz-programi'
import { CPP_SNIPPET, PY_SNIPPET } from '@/lib/insansi/kod'
import { hasWebGL } from '../three/core'
import type { HumanoidFrame } from './insansi-3d'
import { useI18n } from '@/i18n/client'
import './insansi.css'

const Insansi3D = dynamic(() => import('./insansi-3d').then((m) => m.Insansi3D), { ssr: false, loading: () => <div className="hm-3d" /> })

type Tab = 'fk' | 'ik' | 'yuruyus' | 'program' | 'kod'
const LEG_JOINTS: JointId[] = ['hipPitchL', 'hipRollL', 'kneeL', 'anklePitchL', 'ankleRollL', 'hipPitchR', 'hipRollR', 'kneeR', 'anklePitchR', 'ankleRollR']
const ARM_JOINTS: JointId[] = ['shoulderPitchL', 'shoulderRollL', 'elbowL', 'shoulderPitchR', 'shoulderRollR', 'elbowR']

/** rAF ile oynatma: `playing` iken saniye cinsinden zamanı ilerletir. */
function useClock(playing: boolean, speed = 1): [number, (t: number) => void] {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!playing) return
    let raf = 0, last = performance.now()
    const loop = (now: number) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; setT((x) => x + dt * speed); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed])
  return [t, setT]
}

export function InsansiLab() {
  const { locale } = useI18n()
  const en = locale === 'en'
  const L = (tr: string, e: string) => (en ? e : tr)
  const f1 = (v: number, d = 1) => (en ? v.toFixed(d) : v.toFixed(d).replace('.', ','))
  const [tab, setTab] = useState<Tab>('fk')
  const [gl, setGl] = useState(false)
  useEffect(() => { setGl(hasWebGL()) }, [])

  // ---- FK ----
  const [joints, setJoints] = useState<Joints>(() => POSES.hazir.joints())
  // ---- IK ----
  const [ikSide, setIkSide] = useState<Side>('R')
  const [ikTarget, setIkTarget] = useState<[number, number]>([0.04, 0.05]) // taban x, z
  const [shiftY, setShiftY] = useState(0)
  // ---- yürüyüş ----
  const [gp, setGp] = useState<GaitParams>(DEFAULT_GAIT)
  const [walking, setWalking] = useState(true)
  const [slow, setSlow] = useState(false)
  const [gt] = useClock(tab === 'yuruyus' && walking, slow ? 0.25 : 1)
  // ---- program ----
  const [mode, setMode] = useState<'blok' | 'kod'>('blok')
  const [code, setCode] = useState(EXAMPLE_PROGRAM)
  useEffect(() => { setCode(en ? EXAMPLE_PROGRAM_EN : EXAMPLE_PROGRAM) }, [en])
  const compiled = useMemo(() => compilePoseProgram(code), [code])
  const [steps, setSteps] = useState<PoseStep[]>([])
  useEffect(() => { if (!compiled.error) setSteps(compiled.steps) }, [compiled])
  const timeline = useMemo(() => poseTimeline(steps, POSES.hazir.joints(), gp), [steps, gp])
  const [playing, setPlaying] = useState(false)
  const [pt, setPt] = useClock(tab === 'program' && playing)
  useEffect(() => { if (pt * 1000 > timeline.durationMs + 400) setPlaying(false) }, [pt, timeline.durationMs])
  const setBlocks = (s: PoseStep[]) => { setSteps(s); setCode(stepsToCode(s, en)) }

  // ---- geçerli kare ----
  const ikPelvis: V3 = [0, shiftY, STAND_Z - 0.03]
  const ikJoints = useMemo(() => {
    const other: Side = ikSide === 'L' ? 'R' : 'L'
    const so = other === 'L' ? 1 : -1, ss = ikSide === 'L' ? 1 : -1
    let j = { ...POSES.hazir.joints() }
    const ikO = footIK(ikPelvis, other, [0, so * BODY.hipHalf, 0])
    const ikS = footIK(ikPelvis, ikSide, [ikTarget[0], ss * BODY.hipHalf, ikTarget[1]])
    j = applyLegIK(applyLegIK(j, other, ikO), ikSide, ikS)
    return { j, clamped: ikS.clamped }
  }, [ikSide, ikTarget, shiftY]) // eslint-disable-line react-hooks/exhaustive-deps

  const frameNow = (): HumanoidFrame & { joints: Joints; clamped?: boolean } => {
    if (tab === 'ik') {
      const b = bodyFK(ikPelvis, ikJoints.j)
      const bal = staticBalance(b)
      const ss = ikSide === 'L' ? 1 : -1
      return { body: b, com: bal.com, support: bal.support, stable: bal.stable, target: [ikTarget[0], ss * BODY.hipHalf, ikTarget[1]], joints: ikJoints.j, clamped: ikJoints.clamped }
    }
    if (tab === 'yuruyus') {
      const s = gaitAt(gp, gt)
      const b = bodyFK(s.pelvis, s.joints)
      const bal = staticBalance(b)
      return { body: b, com: s.com, support: bal.support, stable: bal.margin > -0.005, zmp: s.zmp, joints: s.joints, clamped: s.clamped }
    }
    if (tab === 'program') {
      const fr = sampleFrame(timeline, pt * 1000)
      const b = fr.walk ? bodyFK(fr.walk.pelvis.map((v, i) => (i === 0 ? v + fr.x : v)) as V3, fr.joints) : grounded([fr.x, 0, STAND_Z], fr.joints)
      const bal = staticBalance(b)
      return { body: b, com: bal.com, support: bal.support, stable: fr.walk ? true : bal.stable, zmp: fr.walk ? [fr.walk.zmp[0] + fr.x, fr.walk.zmp[1]] : null, joints: fr.joints }
    }
    const b = grounded([0, 0, STAND_Z], joints)
    const bal = staticBalance(b)
    return { body: b, com: bal.com, support: bal.support, stable: bal.stable, joints }
  }
  const cur = frameNow()
  const liveFrame = useRef(cur)
  liveFrame.current = cur
  const bal = { margin: tab === 'yuruyus' ? null : staticBalance(cur.body).margin }
  const viol = limitViolations(cur.joints)

  const onDrag = (x: number, z: number) => setIkTarget([Math.max(-0.15, Math.min(0.2, x)), Math.max(0, Math.min(0.25, z))])

  const slider = (id: JointId) => (
    <label key={id} className={`hm-sl${viol.includes(id) ? ' bad' : ''}`}>
      <span>{en ? SERVO[id].en : SERVO[id].tr}</span>
      <input type="range" min={SERVO[id].min} max={SERVO[id].max} step={1} value={Math.round(joints[id])} onChange={(e) => setJoints({ ...joints, [id]: Number(e.target.value) })} data-testid={`hm-j-${id}`} />
      <b>{Math.round(cur.joints[id])}°</b>
    </label>
  )

  const cycle = useMemo(() => gaitCycle(gp, 80), [gp])
  const issues = useMemo(() => gaitIssues(gp), [gp])
  const phase = ((gt % (2 * gp.period)) / (2 * gp.period))

  return (
    <div className="hm" data-testid="insansi-lab">
      <div className="hm-tabs" role="tablist" aria-label={L('Bölümler', 'Sections')}>
        {([['fk', L('Eklemler (FK)', 'Joints (FK)')], ['ik', L('Ayak hedefi (IK)', 'Foot target (IK)')], ['yuruyus', L('Yürüyüş (LIPM)', 'Walking (LIPM)')], ['program', L('Poz programı', 'Pose program')], ['kod', L('Python / C++', 'Python / C++')]] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} data-testid={`hm-tab-${k}`}>{label}</button>
        ))}
      </div>
      <div className="hm-main">
        <div className="hm-view">
          {gl ? <Insansi3D frame={() => liveFrame.current} onTargetDrag={tab === 'ik' ? onDrag : undefined} label={L('İnsansı robotun 3B görünüşü', '3D view of the humanoid')} /> : <SideView frame={cur} />}
          <div className="hm-readout" aria-live="polite">
            <span className={cur.stable ? 'ok' : 'bad'} data-testid="hm-balance">{cur.stable ? L('Dengede', 'Balanced') : L('Devrilir', 'Tips over')}</span>
            {bal.margin != null && Number.isFinite(bal.margin) && <span>{L('pay', 'margin')} <b>{f1(bal.margin * 1000, 0)} mm</b></span>}
            <span>CoM <b>x {f1(cur.com[0] * 100)} · y {f1(cur.com[1] * 100)} · z {f1(cur.com[2] * 100)} cm</b></span>
            {cur.clamped && <span className="bad">{L('hedefe uzanamıyor', 'out of reach')}</span>}
            {viol.length > 0 && <span className="bad">{L('servo sınırı aşıldı', 'servo limit exceeded')}: {viol.map((v) => (en ? SERVO[v].en : SERVO[v].tr)).join(', ')}</span>}
          </div>
          <p className="hm-legend muted">{L('Yeşil/kırmızı küre: ağırlık merkezi (CoM); yerdeki çizgi: destek çokgeni; kırmızı kare: ZMP; pembe küre: sürüklenebilir ayak hedefi.', 'Green/red ball: center of mass (CoM); line on the floor: support polygon; red square: ZMP; pink ball: draggable foot target.')}</p>
        </div>

        <div className="hm-side">
          {tab === 'fk' && (
            <section aria-label={L('Eklem açıları', 'Joint angles')}>
              <p className="muted">{L('Kaydırıcılar servo sınırlarıyla sınırlı. Ayak tabanları her an yere oturtulur; ağırlık merkezinin izdüşümü destek çokgeninden çıkınca robot devrilir.', 'Sliders are bounded by the servo limits. The soles are kept on the floor; when the projection of the center of mass leaves the support polygon, the robot tips over.')}</p>
              <div className="hm-poses">{POSE_IDS.map((p) => <button key={p} type="button" className="mk-btn small" onClick={() => setJoints(POSES[p].joints())} data-testid={`hm-pose-${p}`}>{en ? POSES[p].en : POSES[p].tr}</button>)}</div>
              <h3>{L('Bacaklar', 'Legs')}</h3>
              <div className="hm-sliders">{LEG_JOINTS.map(slider)}</div>
              <h3>{L('Kollar', 'Arms')}</h3>
              <div className="hm-sliders">{ARM_JOINTS.map(slider)}</div>
            </section>
          )}
          {tab === 'ik' && (
            <section>
              <p className="muted">{L('Pembe küreyi (ayak tabanı hedefi) 3B görünümde sürükle ya da kaydırıcıları kullan. İki bağlı ters kinematik kalça, diz ve bilek açılarını bulur; taban yere paralel kalır.', 'Drag the pink ball (sole target) in the 3D view or use the sliders. Two-link inverse kinematics finds the hip, knee and ankle angles; the sole stays parallel to the floor.')}</p>
              <div className="hm-row">
                <label><input type="radio" checked={ikSide === 'L'} onChange={() => setIkSide('L')} /> {L('sol ayak', 'left foot')}</label>
                <label><input type="radio" checked={ikSide === 'R'} onChange={() => setIkSide('R')} /> {L('sağ ayak', 'right foot')}</label>
              </div>
              <label className="hm-sl"><span>{L('hedef x (ileri)', 'target x (forward)')}</span><input type="range" min={-15} max={20} step={0.5} value={ikTarget[0] * 100} onChange={(e) => setIkTarget([Number(e.target.value) / 100, ikTarget[1]])} data-testid="hm-ik-x" /><b>{f1(ikTarget[0] * 100)} cm</b></label>
              <label className="hm-sl"><span>{L('hedef z (yükseklik)', 'target z (height)')}</span><input type="range" min={0} max={25} step={0.5} value={ikTarget[1] * 100} onChange={(e) => setIkTarget([ikTarget[0], Number(e.target.value) / 100])} data-testid="hm-ik-z" /><b>{f1(ikTarget[1] * 100)} cm</b></label>
              <label className="hm-sl"><span>{L('kalçayı yana kaydır', 'shift hips sideways')}</span><input type="range" min={-6} max={6} step={0.2} value={shiftY * 100} onChange={(e) => setShiftY(Number(e.target.value) / 100)} data-testid="hm-ik-shift" /><b>{f1(shiftY * 100)} cm</b></label>
              <p className="muted">{L('Ayağı kaldırınca destek tek tabana iner: dengede kalmak için kalçayı destek ayağının üstüne kaydır.', 'Lifting a foot leaves only one sole as support: shift the hips over the standing foot to stay balanced.')}</p>
              <table className="hm-tbl"><tbody>
                {(['hipPitch', 'hipRoll', 'knee', 'anklePitch', 'ankleRoll'] as const).map((k) => { const id = `${k}${ikSide}` as JointId; return <tr key={k}><td>{en ? SERVO[id].en : SERVO[id].tr}</td><td className={viol.includes(id) ? 'bad' : ''}>{f1(cur.joints[id])}°</td></tr> })}
              </tbody></table>
            </section>
          )}
          {tab === 'yuruyus' && (
            <section>
              <p className="muted">{L('Doğrusal ters sarkaç (LIPM): ZMP destek ayağının ortasında durur, ağırlık merkezi cosh/sinh eğrisiyle salınır; adım sınırında konum ve hız süreklidir. Bacak açıları her karede ters kinematikle bulunur.', 'Linear inverted pendulum (LIPM): the ZMP stays at the center of the support foot and the center of mass swings along a cosh/sinh curve; position and velocity are continuous at step changes. Leg angles come from inverse kinematics every frame.')}</p>
              {([['stepLength', L('adım boyu', 'step length'), 0, 0.14, 0.005, 'cm', 100], ['stepHeight', L('adım yüksekliği', 'step height'), 0, 0.08, 0.002, 'cm', 100], ['period', L('adım süresi', 'step period'), 0.3, 1.2, 0.02, 's', 1], ['comHeight', L('CoM yüksekliği', 'CoM height'), 0.24, 0.335, 0.002, 'cm', 100]] as const).map(([k, label, min, max, step, unit, mul]) => (
                <label key={k} className="hm-sl"><span>{label}</span><input type="range" min={min} max={max} step={step} value={gp[k]} onChange={(e) => setGp({ ...gp, [k]: Number(e.target.value) })} data-testid={`hm-g-${k}`} /><b>{f1(gp[k] * mul, unit === 's' ? 2 : 1)} {unit}</b></label>
              ))}
              <div className="hm-row">
                <button type="button" className="mk-btn small" onClick={() => setWalking(!walking)} data-testid="hm-walk">{walking ? L('Durdur', 'Pause') : L('Yürü', 'Walk')}</button>
                <label><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} /> {L('ağır çekim', 'slow motion')}</label>
              </div>
              {(issues.clamped || issues.limits.length > 0) && <p className="bad" data-testid="hm-gait-issue">{issues.clamped ? L('Bacak bazı anlarda hedefe uzanamıyor: adımı kısalt ya da CoM\'u alçalt. ', 'The leg cannot reach at some moments: shorten the step or lower the CoM. ') : ''}{issues.limits.length ? `${L('Servo sınırı', 'Servo limit')}: ${issues.limits.map((v) => (en ? SERVO[v].en : SERVO[v].tr)).join(', ')}` : ''}</p>}
              <GaitCharts cycle={cycle} phase={phase} en={en} />
            </section>
          )}
          {tab === 'program' && (
            <section>
              <div className="hm-row">
                <div className="rt-mode" role="group" aria-label={L('Düzenleme kipi', 'Editing mode')}>
                  <button type="button" aria-pressed={mode === 'blok'} onClick={() => setMode('blok')} data-testid="hm-mode-blok">{L('Blok', 'Blocks')}</button>
                  <button type="button" aria-pressed={mode === 'kod'} onClick={() => setMode('kod')} data-testid="hm-mode-kod">{L('Kod', 'Code')}</button>
                </div>
                <button type="button" className="mk-btn small" onClick={() => { setPt(0); setPlaying(true) }} disabled={!!compiled.error && mode === 'kod'} data-testid="hm-play">▶ {L('Oynat', 'Play')}</button>
                <button type="button" className="mk-btn small" onClick={() => setPlaying(false)}>■</button>
                <span className="muted">{f1(Math.min(pt * 1000, timeline.durationMs) / 1000)} / {f1(timeline.durationMs / 1000)} s</span>
              </div>
              {mode === 'kod' ? (
                <>
                  <textarea className="hm-code" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={14} data-testid="hm-code" aria-label={L('Poz programı kodu', 'Pose program code')} />
                  {compiled.error ? <p className="bad" role="alert">{en ? compiled.errorEn : compiled.error}</p> : <p className="muted">{L(`${compiled.steps.length} adım. Komutlar: poz, eklem, bekle, yürü, tekrarla n { }`, `${compiled.steps.length} steps. Commands: pose, joint, wait, walk, repeat n { }`)}</p>}
                </>
              ) : <BlockList steps={steps} onChange={setBlocks} en={en} />}
              <p className="muted">{L('Çocuklar için aynı fikrin bloklu sürümü: ', 'The block version of the same idea for kids: ')}<Link href="/robot-atolyesi">{L('Robot Atölyesi → Dönüşen Robot (İnsansı)', 'Robot Workshop → Transforming Robot (Humanoid)')}</Link></p>
            </section>
          )}
          {tab === 'kod' && (
            <section>
              <p className="muted">{L('Sayfadaki hesapların aynısı. Python ile deneyip C++ ile robotun kartına taşıyabilirsin.', 'The same math as on this page. Try it in Python, then move it to the robot\'s board in C++.')}</p>
              <h3>Python</h3>
              <pre className="hm-pre" data-testid="hm-py"><code>{PY_SNIPPET}</code></pre>
              <h3>C++</h3>
              <pre className="hm-pre"><code>{CPP_SNIPPET}</code></pre>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

/** Yürüyüş döngüsü boyunca eklem açıları (sol düz, sağ kesikli) ve yanal CoM/ZMP; servo sınırları gri çizgi. */
function GaitCharts({ cycle, phase, en }: { cycle: ReturnType<typeof gaitCycle>; phase: number; en: boolean }) {
  const W = 300, H = 84, pad = 4
  const charts: Array<{ title: string; series: Array<{ v: number[]; dash?: boolean; color: string }>; lim?: [number, number]; unit: string }> = [
    ...(['hipPitch', 'knee', 'anklePitch', 'hipRoll'] as const).map((k) => ({
      title: en ? SERVO[`${k}L` as JointId].en.replace('left ', '') : SERVO[`${k}L` as JointId].tr.replace('sol ', ''),
      series: [{ v: cycle.map((s) => s.joints[`${k}L` as JointId]), color: '#2563eb' }, { v: cycle.map((s) => s.joints[`${k}R` as JointId]), dash: true, color: '#db2777' }],
      lim: [SERVO[`${k}L` as JointId].min, SERVO[`${k}L` as JointId].max] as [number, number], unit: '°',
    })),
    { title: en ? 'lateral CoM (blue) and ZMP (red)' : 'yanal CoM (mavi) ve ZMP (kırmızı)', series: [{ v: cycle.map((s) => s.com[1] * 100), color: '#2563eb' }, { v: cycle.map((s) => s.zmp[1] * 100), color: '#dc2626', dash: true }], unit: 'cm' },
  ]
  return (
    <div className="hm-charts" data-testid="hm-charts">
      {charts.map((c) => {
        const all = c.series.flatMap((s) => s.v)
        let lo = Math.min(...all), hi = Math.max(...all)
        if (c.lim) { if (c.lim[0] > lo - 10) lo = Math.min(lo, c.lim[0]); if (c.lim[1] < hi + 10) hi = Math.max(hi, c.lim[1]) }
        if (hi - lo < 1) { hi += 1; lo -= 1 }
        const X = (i: number, n: number) => pad + (i / (n - 1)) * (W - 2 * pad)
        const Y = (v: number) => H - pad - ((v - lo) / (hi - lo)) * (H - 2 * pad)
        return (
          <figure key={c.title}>
            <figcaption>{c.title} <small>({Math.round(lo)}…{Math.round(hi)} {c.unit})</small></figcaption>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.title}>
              <rect x={0} y={0} width={W} height={H} className="hm-ch-bg" />
              {c.lim && c.lim.map((l) => (l >= lo && l <= hi ? <line key={l} x1={0} x2={W} y1={Y(l)} y2={Y(l)} className="hm-ch-lim" /> : null))}
              {c.series.map((s, i) => <polyline key={i} fill="none" stroke={s.color} strokeWidth={1.8} strokeDasharray={s.dash ? '4 3' : undefined} points={s.v.map((v, j) => `${X(j, s.v.length).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')} />)}
              <line x1={pad + phase * (W - 2 * pad)} x2={pad + phase * (W - 2 * pad)} y1={0} y2={H} className="hm-ch-cur" />
            </svg>
          </figure>
        )
      })}
      <p className="muted">{en ? 'One gait cycle = two steps. Solid: left leg, dashed: right leg; grey lines: servo limits.' : 'Bir yürüyüş döngüsü = iki adım. Düz: sol bacak, kesikli: sağ bacak; gri çizgiler: servo sınırları.'}</p>
    </div>
  )
}

/** Blok kipi: her satır bir komut bloğu (kod kipindekiyle aynı adımlar). */
function BlockList({ steps, onChange, en }: { steps: PoseStep[]; onChange(s: PoseStep[]): void; en: boolean }) {
  const set = (i: number, s: PoseStep) => onChange(steps.map((x, j) => (j === i ? s : x)))
  const move = (i: number, d: number) => { const a = [...steps]; const [x] = a.splice(i, 1); a.splice(Math.max(0, Math.min(a.length, i + d)), 0, x); onChange(a) }
  const num = (v: number, f: (n: number) => void, min: number, max: number, w = '5em') => <input type="number" value={v} min={min} max={max} style={{ width: w }} onChange={(e) => f(Math.max(min, Math.min(max, Number(e.target.value) || 0)))} />
  return (
    <div className="hm-blocks" data-testid="hm-blocks">
      <ol>
        {steps.map((s, i) => (
          <li key={i} className={`hm-blk ${s.kind}`}>
            {s.kind === 'pose' && <><b>{en ? 'pose' : 'poz'}</b><select value={s.pose} onChange={(e) => set(i, { ...s, pose: e.target.value as PoseId })}>{POSE_IDS.map((p) => <option key={p} value={p}>{en ? POSE_NAME_EN[p] : p}</option>)}</select>{num(s.ms, (ms) => set(i, { ...s, ms }), 0, 10000)} ms</>}
            {s.kind === 'joint' && <><b>{en ? 'joint' : 'eklem'}</b><select value={s.joint} onChange={(e) => set(i, { ...s, joint: e.target.value as JointId })}>{JOINT_IDS.map((j) => <option key={j} value={j}>{j}</option>)}</select>{num(s.deg, (deg) => set(i, { ...s, deg }), -180, 180, '4.5em')}° {num(s.ms, (ms) => set(i, { ...s, ms }), 0, 10000)} ms</>}
            {s.kind === 'wait' && <><b>{en ? 'wait' : 'bekle'}</b>{num(s.ms, (ms) => set(i, { ...s, ms }), 0, 10000)} ms</>}
            {s.kind === 'walk' && <><b>{en ? 'walk' : 'yürü'}</b>{num(s.steps, (k) => set(i, { ...s, steps: Math.max(1, Math.round(k)) }), 1, 20, '4em')} {en ? 'steps' : 'adım'}</>}
            <span className="hm-blk-ctl">
              <button type="button" aria-label={en ? 'Move up' : 'Yukarı'} onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label={en ? 'Move down' : 'Aşağı'} onClick={() => move(i, 1)}>↓</button>
              <button type="button" aria-label={en ? 'Delete' : 'Sil'} onClick={() => onChange(steps.filter((_, j) => j !== i))}>×</button>
            </span>
          </li>
        ))}
      </ol>
      <div className="hm-row">
        <button type="button" className="mk-btn small" onClick={() => onChange([...steps, { kind: 'pose', pose: 'hazir', ms: 500 }])} data-testid="hm-add-pose">+ {en ? 'pose' : 'poz'}</button>
        <button type="button" className="mk-btn small" onClick={() => onChange([...steps, { kind: 'joint', joint: 'kneeL', deg: 30, ms: 300 }])}>+ {en ? 'joint' : 'eklem'}</button>
        <button type="button" className="mk-btn small" onClick={() => onChange([...steps, { kind: 'wait', ms: 300 }])}>+ {en ? 'wait' : 'bekle'}</button>
        <button type="button" className="mk-btn small" onClick={() => onChange([...steps, { kind: 'walk', steps: 2 }])}>+ {en ? 'walk' : 'yürü'}</button>
      </div>
    </div>
  )
}

/** WebGL yoksa yandan 2B görünüş (x-z düzlemi). */
function SideView({ frame }: { frame: HumanoidFrame }) {
  const b = frame.body
  const s = 600, ox = 150 - b.pelvis[0] * s, X = (x: number) => ox + x * s, Y = (z: number) => 280 - z * s
  const line = (a: V3, c: V3, cls: string) => <line x1={X(a[0])} y1={Y(a[2])} x2={X(c[0])} y2={Y(c[2])} className={cls} />
  return (
    <svg viewBox="0 0 300 300" className="hm-3d" role="img" aria-label="side view">
      <line x1={0} x2={300} y1={280} y2={280} stroke="#94a3b8" />
      {(['L', 'R'] as const).map((k) => <g key={k}>{line(b.legs[k].hip, b.legs[k].knee, 'hm-sv-leg')}{line(b.legs[k].knee, b.legs[k].ankle, 'hm-sv-leg')}{line(b.legs[k].corners[2], b.legs[k].corners[1], 'hm-sv-foot')}{line(b.arms[k].shoulder, b.arms[k].elbow, 'hm-sv-arm')}{line(b.arms[k].elbow, b.arms[k].hand, 'hm-sv-arm')}</g>)}
      {line(b.pelvis, b.neck, 'hm-sv-torso')}
      <circle cx={X(b.head[0])} cy={Y(b.head[2])} r={18} fill="#f8fafc" stroke="#0f172a" />
      <circle cx={X(frame.com[0])} cy={Y(frame.com[2])} r={6} fill={frame.stable ? '#16a34a' : '#dc2626'} />
      <line x1={X(frame.com[0])} x2={X(frame.com[0])} y1={Y(frame.com[2])} y2={280} stroke={frame.stable ? '#16a34a' : '#dc2626'} strokeDasharray="3 3" />
    </svg>
  )
}

'use client'
import { useMemo, useRef } from 'react'
import { DEG } from '@/lib/arena/geometry'
import { armTip } from '@/lib/arena/runtime'
import type { ArenaScene, ArenaSnapshot, ArmScene, ArmSnapshot, BalancerScene, BalancerSnapshot, RoverScene, RoverSnapshot } from '@/lib/arena/types'
import { useT } from '@/i18n/client'
import { useSceneText } from './scene-text'

const CM = 100 // 1 m = 100 çizim birimi (1 birim = 1 cm)
const ROBOT_R = 7.5

interface Props {
  scene: ArenaScene
  snap: ArenaSnapshot
  /** Robot izi: [x, y, theta] noktaları (m). */
  trail?: ReadonlyArray<readonly [number, number, number]>
  /** Ultrasonik tarama servosunun açısı (°, 90 = ileri). */
  servoDeg?: number
  /** Robot sürüklenince çağrılır (yalnız sahne `movable` ise): yeni konum (m). */
  onDrag?: (x: number, y: number) => void
}

export function ArenaCanvas(p: Props) {
  if (p.scene.kind === 'arm') return <ArmCanvas scene={p.scene} snap={p.snap as ArmSnapshot} />
  if (p.scene.kind === 'balancer') return <BalancerCanvas scene={p.scene} snap={p.snap as BalancerSnapshot} />
  return <RoverCanvas scene={p.scene} snap={p.snap as RoverSnapshot} trail={p.trail} servoDeg={p.servoDeg ?? 90} onDrag={p.onDrag} />
}

const zoneColor = (k: string) => (k === 'goal' ? '#16a34a' : k === 'checkpoint' ? '#d97706' : k === 'target' ? '#0891b2' : '#6366f1')

function RoverCanvas({ scene, snap, trail, servoDeg, onDrag }: { scene: RoverScene; snap: RoverSnapshot; trail?: Props['trail']; servoDeg: number; onDrag?: Props['onDrag'] }) {
  const t = useT()
  const st = useSceneText()
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const movable = !!scene.movable && !!onDrag
  const W = scene.width * CM, H = scene.height * CM
  const X = (x: number) => x * CM, Y = (y: number) => (scene.height - y) * CM
  const lineW = (scene.lineWidth ?? 0.02) * CM
  const grid = useMemo(() => {
    const out: Array<{ key: string; d: string }> = []
    for (let x = 0.5; x < scene.width; x += 0.5) out.push({ key: `v${x}`, d: `M${X(x)} 0V${H}` })
    for (let y = 0.5; y < scene.height; y += 0.5) out.push({ key: `h${y}`, d: `M0 ${Y(y)}H${W}` })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.width, scene.height])
  const trailD = useMemo(() => {
    if (!trail || trail.length < 2) return ''
    const step = Math.max(1, Math.ceil(trail.length / 900))
    let d = ''
    for (let i = 0; i < trail.length; i += step) d += `${d ? 'L' : 'M'}${X(trail[i][0]).toFixed(1)} ${Y(trail[i][1]).toFixed(1)}`
    const last = trail[trail.length - 1]
    return d + `L${X(last[0]).toFixed(1)} ${Y(last[1]).toFixed(1)}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail, trail?.length, scene.height])

  const hasUs = !!scene.sensors.ultrasonic
  const sa = -((servoDeg - 90) * Math.PI) / 180 // çizim çerçevesinde (y aşağı) işaret ters
  const reach = Math.min(Math.max(snap.frontCm, 2), 250)
  const half = (15 * Math.PI) / 180
  const cone = `M6 0L${(reach * Math.cos(sa - half)).toFixed(1)} ${(reach * Math.sin(sa - half)).toFixed(1)}A${reach.toFixed(1)} ${reach.toFixed(1)} 0 0 1 ${(reach * Math.cos(sa + half)).toFixed(1)} ${(reach * Math.sin(sa + half)).toFixed(1)}Z`

  return (
    <svg
      ref={svgRef} className="arena-svg" viewBox={`-6 -6 ${W + 12} ${H + 12}`} role="img" aria-label={t('lab.arena.canvas.top', { title: st(scene.title) })} data-testid="arena-canvas" data-scene={scene.id}
      onPointerMove={movable ? (e) => {
        if (!dragging.current || !svgRef.current) return
        const ctm = svgRef.current.getScreenCTM()
        if (!ctm) return
        const pt = svgRef.current.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
        const q = pt.matrixTransform(ctm.inverse())
        onDrag!(Math.max(0.1, Math.min(scene.width - 0.1, q.x / CM)), Math.max(0.1, Math.min(scene.height - 0.1, scene.height - q.y / CM)))
      } : undefined}
      onPointerUp={movable ? () => { dragging.current = false } : undefined} onPointerLeave={movable ? () => { dragging.current = false } : undefined}
    >
      <rect className="arena-floor" x={0} y={0} width={W} height={H} />
      {grid.map((g) => <path key={g.key} className="arena-grid" d={g.d} />)}
      {scene.zones.map((z) => (
        <g key={z.id} className="arena-zone" data-zone={z.id} data-in={snap.inZone.has(z.id) ? 'true' : undefined}>
          <circle cx={X(z.x)} cy={Y(z.y)} r={z.r * CM} fill={zoneColor(z.kind)} fillOpacity={snap.visited.has(z.id) ? 0.28 : 0.12} stroke={zoneColor(z.kind)} strokeDasharray="5 4" />
          {z.label && <text x={X(z.x)} y={Y(z.y) + 3} textAnchor="middle" className="arena-ztext">{st(z.label)}</text>}
        </g>
      ))}
      {scene.lines.map((l, i) => <polyline key={i} className="arena-line" points={l.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} strokeWidth={lineW} />)}
      {scene.walls.map((w, i) => <line key={i} className="arena-wall" x1={X(w[0])} y1={Y(w[1])} x2={X(w[2])} y2={Y(w[3])} />)}
      {snap.movers.map((m) => <line key={m.id} className="arena-wall mover" data-mover={m.id} x1={X(m.wall[0])} y1={Y(m.wall[1])} x2={X(m.wall[2])} y2={Y(m.wall[3])} />)}
      {trailD && <path className="arena-trail" d={trailD} data-testid="arena-trail" />}
      <g transform={`translate(${X(snap.x).toFixed(2)} ${Y(snap.y).toFixed(2)}) rotate(${(-snap.theta * DEG).toFixed(2)})`} data-testid="arena-robot" data-collided={snap.collided ? 'true' : 'false'} data-movable={movable ? 'true' : undefined}
        style={movable ? { cursor: 'grab' } : undefined} onPointerDown={movable ? (e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId) } : undefined}>
        {hasUs && <path className="arena-cone" d={cone} data-testid="arena-cone" />}
        {hasUs && <line className="arena-ray" x1={6} y1={0} x2={(reach * Math.cos(sa)).toFixed(1)} y2={(reach * Math.sin(sa)).toFixed(1)} />}
        <rect className="arena-wheel" x={-3.3} y={-8.2} width={6.6} height={2.4} rx={0.8} />
        <rect className="arena-wheel" x={-3.3} y={5.8} width={6.6} height={2.4} rx={0.8} />
        <circle className={`arena-body${snap.collided ? ' hit' : ''}`} r={ROBOT_R} />
        <path className="arena-front" d="M2.5 -3.5L7 0L2.5 3.5Z" />
        {(scene.sensors.bumpers) && (<>
          <path className={`arena-bump${snap.bumperL ? ' on' : ''}`} d="M5.2 -5.6A7.6 7.6 0 0 1 7.6 -0.6" fill="none" data-bumper="L" />
          <path className={`arena-bump${snap.bumperR ? ' on' : ''}`} d="M5.2 5.6A7.6 7.6 0 0 0 7.6 0.6" fill="none" data-bumper="R" />
        </>)}
        {snap.line.map((s) => (
          <circle key={s.pin} cx={(s.x * CM).toFixed(1)} cy={(-s.y * CM).toFixed(1)} r={1.15} className={`arena-sensor${s.on ? ' on' : ''}`} data-sensor={s.pin} data-on={s.on ? 'true' : 'false'} />
        ))}
      </g>
    </svg>
  )
}

function ArmCanvas({ scene, snap }: { scene: ArmScene; snap: ArmSnapshot }) {
  const t = useT()
  const st = useSceneText()
  const v = scene.view
  const w = v.xMax - v.xMin, h = v.yMax - v.yMin
  const X = (x: number) => x - v.xMin, Y = (y: number) => v.yMax - y
  const a1 = (snap.q1 * Math.PI) / 180
  const el = { x: scene.l1 * Math.cos(a1), y: scene.l1 * Math.sin(a1) }
  const tip = armTip(scene, snap.q1, snap.q2)
  const open = !snap.gripClosed
  return (
    <svg className="arena-svg" viewBox={`-2 -2 ${w + 4} ${h + 4}`} role="img" aria-label={t('lab.arena.canvas.armSide', { title: st(scene.title) })} data-testid="arena-canvas" data-scene={scene.id}>
      <rect className="arena-floor" x={0} y={0} width={w} height={h} />
      <line className="arena-wall" x1={0} y1={Y(0)} x2={w} y2={Y(0)} />
      {scene.zones.map((z) => (
        <g key={z.id} className="arena-zone" data-zone={z.id}>
          <circle cx={X(z.x)} cy={Y(z.y)} r={z.r} fill="#16a34a" fillOpacity={0.15} stroke="#16a34a" strokeDasharray="1.5 1.2" strokeWidth={0.35} />
          {z.label && <text x={X(z.x)} y={Y(z.y) + Math.max(z.r, 2) + 2.5} textAnchor="middle" className="arena-ztext" style={{ fontSize: 2.4 }}>{st(z.label)}</text>}
        </g>
      ))}
      {snap.objects.map((o) => (
        <rect key={o.id} className={`arena-obj${snap.held === o.id ? ' held' : ''}`} data-object={o.id} x={X(o.x) - 1} y={Y(o.y) - 1} width={2} height={2} rx={0.3} />
      ))}
      <line className="arena-arm" x1={X(0)} y1={Y(0)} x2={X(el.x)} y2={Y(el.y)} strokeWidth={2.2} />
      <line className="arena-arm fore" x1={X(el.x)} y1={Y(el.y)} x2={X(tip.x)} y2={Y(tip.y)} strokeWidth={1.8} />
      <circle className="arena-joint" cx={X(0)} cy={Y(0)} r={1.6} /><circle className="arena-joint" cx={X(el.x)} cy={Y(el.y)} r={1.3} />
      <g data-testid="arena-gripper" data-open={open ? 'true' : 'false'}>
        <line className="arena-grip" x1={X(tip.x)} y1={Y(tip.y)} x2={X(tip.x) + (open ? 1.8 : 0.6)} y2={Y(tip.y) + 1.6} />
        <line className="arena-grip" x1={X(tip.x)} y1={Y(tip.y)} x2={X(tip.x) - (open ? 1.8 : 0.6)} y2={Y(tip.y) + 1.6} />
      </g>
    </svg>
  )
}

function BalancerCanvas({ scene, snap }: { scene: BalancerScene; snap: BalancerSnapshot }) {
  // Yandan görünüş: yer çizgisi, tekerlek, gövde. Eğim θ > 0 ileri (sağa) yatar. Zemin işaretleri robotun konumuna göre kayar.
  const t = useT()
  const st = useSceneText()
  const GY = 170, R = 18, H = 90
  const off = (((-snap.x * 200) % 50) + 50) % 50
  const ticks = Array.from({ length: 10 }, (_, i) => i * 50 - 50 + off)
  const fell = snap.fell
  const tilt = Math.max(-90, Math.min(90, snap.thetaDeg))
  return (
    <svg className="arena-svg" viewBox="0 0 400 200" role="img" aria-label={t('lab.arena.canvas.side', { title: st(scene.title) })} data-testid="arena-canvas" data-scene={scene.id}>
      <rect className="arena-floor" x={0} y={0} width={400} height={200} />
      <line className="arena-wall" x1={0} y1={GY + R} x2={400} y2={GY + R} />
      {ticks.map((t) => <line key={t} className="arena-grid" x1={t} y1={GY + R} x2={t - 8} y2={GY + R + 12} />)}
      <g transform={`translate(200 ${GY}) rotate(${tilt.toFixed(2)})`} data-testid="arena-robot" data-fell={fell ? 'true' : 'false'}>
        <rect className={`arena-body${fell ? ' hit' : ''}`} x={-9} y={-H} width={18} height={H} rx={4} />
        <rect className="arena-front" x={-3} y={-H + 8} width={6} height={14} rx={2} />
        <circle className="arena-wheel-side" cx={0} cy={0} r={R} />
        <circle className="arena-joint" cx={0} cy={0} r={3.5} />
      </g>
      <line className="arena-ray" x1={200} y1={GY} x2={200} y2={GY - H - 20} />
      <text x={12} y={22} className="arena-ztext" style={{ fontSize: 13 }}>{fell ? t('lab.arena.panel.fell') : t('lab.arena.panel.uprightCaps')}</text>
      <text x={12} y={40} className="arena-ztext" style={{ fontSize: 12 }}>{t('lab.arena.panel.tiltValue', { v: snap.thetaDeg.toFixed(1) })}</text>
    </svg>
  )
}

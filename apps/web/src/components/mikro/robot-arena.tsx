'use client'
// Robot Atölyesi arenası: 3B (varsayılan, WebGL varsa) ya da üstten 2B görünüş. 2B'de 1 birim = 1 cm.
// Robot durumu DriveBase'ten okunur: 2B'yi `tick` yeniden çizdirir, 3B kendi kare döngüsüyle okur.
import dynamic from 'next/dynamic'
import type { Device } from '@/lib/mikro/device'
import { FLOOR_COLORS, type DriveBase, type LightColor } from '@/lib/mikro/robot'
import { useFullView, useView3D, ViewBar } from '../three/view-bar'
import { FLOOR_EN, PROFILE_EN, SCENE_EN, ZONE_EN } from '@/lib/mikro/en'
import { useI18n } from '@/i18n/client'

const RobotArena3D = dynamic(() => import('./robot-arena-3d').then((m) => m.RobotArena3D), { ssr: false, loading: () => <div className="rb-3d" /> })

const CM = 100
const LIGHT_CSS: Record<LightColor, string> = { kapali: '#475569', kirmizi: '#ef4444', yesil: '#22c55e', mavi: '#3b82f6', sari: '#facc15', beyaz: '#ffffff' }
const ZONE_CSS = { goal: '#16a34a', checkpoint: '#d97706', start: '#6366f1' } as const

export function RobotArena({ robot, device, tick }: { robot: DriveBase; device: Device; tick: number }) {
  const v = useView3D()
  const [full, setFull] = useFullView()
  const { locale, t } = useI18n()
  const en = locale === 'en'
  const dist = robot.has('distance') ? robot.distanceCm : null
  const status = robot.collisions ? t('mikro.arena.collisions', { n: robot.collisions }) : t('mikro.arena.noCollisions')
  return (
    <figure className={`rb-arena${full ? ' rb-full' : ''}`} data-testid="robot-arena" data-tick={tick} data-view={v.is3d ? '3d' : '2d'}>
      <ViewBar v={v} full={full} onFull={setFull} />
      {v.is3d ? <RobotArena3D robot={robot} device={device} mode={v.mode} /> : <TopView robot={robot} en={en} label={t('mikro.arena.topView', { scene: en ? SCENE_EN[robot.scene.id] ?? robot.scene.title : robot.scene.title, robot: en && robot.profile.id !== 'ozel' ? PROFILE_EN[robot.profile.id].title : robot.profile.title })} />}
      <figcaption className="rb-readout" aria-live="off">
        {dist != null && <span>{t('mikro.arena.distance')} <b>{dist.toFixed(0)} cm</b></span>}
        {robot.has('color') && <span>{t('mikro.arena.color')} <b>{en ? FLOOR_EN[robot.color] : FLOOR_COLORS[robot.color].label}</b></span>}
        {robot.has('gripper') && <span>{t('mikro.arena.gripper')} <b>{robot.heldColor ? (en ? FLOOR_EN[robot.heldColor] : FLOOR_COLORS[robot.heldColor].label) : robot.gripClosed ? t('mikro.arena.gripClosed') : t('mikro.arena.gripOpen')}</b></span>}
        {robot.has('line') && <span>{t('mikro.arena.line')} <b>{robot.lineOn('left') ? '●' : '○'}{robot.lineOn('right') ? '●' : '○'}</b></span>}
        <span>{t('mikro.arena.heading')} <b>{robot.headingDeg}°</b></span>
        <span>{t('mikro.arena.path')} <b>{(robot.distanceM * 100).toFixed(0)} cm</b></span>
        <span className={robot.collisions ? 'bad' : undefined}>{status}</span>
      </figcaption>
    </figure>
  )
}

function TopView({ robot, en, label }: { robot: DriveBase; en: boolean; label: string }) {
  const s = robot.scene
  const W = s.width * CM, H = s.height * CM
  const X = (x: number) => x * CM, Y = (y: number) => (s.height - y) * CM
  const p = robot.profile
  const R = p.radius * CM
  const deg = (-robot.theta * 180) / Math.PI
  const trail = robot.trail.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join('') + `L${X(robot.x).toFixed(1)} ${Y(robot.y).toFixed(1)}`
  const dist = robot.has('distance') ? robot.distanceCm : null
  const ray = dist != null ? Math.min(dist, 250) + R * 0.8 : 0
  const light = LIGHT_CSS[robot.lights]

  return (
      <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} role="img" aria-label={label}>
        <rect x={0} y={0} width={W} height={H} className="rb-floor" />
        {s.patches.map((q, i) => (
          <rect key={i} x={X(Math.min(q.x1, q.x2))} y={Y(Math.max(q.y1, q.y2))} width={Math.abs(q.x2 - q.x1) * CM} height={Math.abs(q.y2 - q.y1) * CM} fill={FLOOR_COLORS[q.color].css} rx={2} />
        ))}
        {s.lines.map((l, i) => <polyline key={i} points={l.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} className="rb-line" strokeWidth={(s.lineWidth ?? 0.02) * CM} />)}
        {s.zones.map((z) => (
          <g key={z.id} data-zone={z.id} data-visited={robot.visited.has(z.id) || undefined}>
            <circle cx={X(z.x)} cy={Y(z.y)} r={z.r * CM} fill={ZONE_CSS[z.kind]} fillOpacity={robot.visited.has(z.id) ? 0.3 : 0.12} stroke={ZONE_CSS[z.kind]} strokeDasharray="4 3" />
            {z.label && <text x={X(z.x)} y={Y(z.y) + 3} textAnchor="middle" className="rb-ztext">{en ? ZONE_EN[z.label] ?? z.label : z.label}</text>}
          </g>
        ))}
        {s.walls.map(([x1, y1, x2, y2], i) => <line key={i} x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} className="rb-wall" />)}
        {robot.objects.map((o) => (
          <rect key={o.id} data-cube={o.id} data-held={robot.held === o.id || undefined} x={X(o.x - o.half)} y={Y(o.y + o.half)} width={o.half * 2 * CM} height={o.half * 2 * CM} rx={1}
            fill={FLOOR_COLORS[o.color].css} className="rb-cube" transform={robot.held === o.id ? `rotate(${deg} ${X(o.x)} ${Y(o.y)})` : undefined} />
        ))}
        <path d={trail} className="rb-trail" />
        <g transform={`translate(${X(robot.x)} ${Y(robot.y)}) rotate(${deg})`} data-testid="robot-body">
          {dist != null && <line x1={R * 0.8} y1={0} x2={ray} y2={0} className="rb-ray" />}
          {p.id === 'kiskac' ? (
            <>
              <rect x={-R * 0.9} y={-R * 0.85} width={R * 1.7} height={R * 1.7} rx={3} className="rb-body kiskac" />
              <rect x={-R * 0.55} y={-R - 1} width={R * 1.1} height={4} rx={1} className="rb-wheel" />
              <rect x={-R * 0.55} y={R - 3} width={R * 1.1} height={4} rx={1} className="rb-wheel" />
              <rect x={-R * 0.35} y={-R * 0.35} width={R * 0.7} height={R * 0.7} rx={2} fill={light} className="rb-hub" />
              {[-1, 1].map((sd) => <rect key={sd} x={R * 0.75} y={sd * (robot.gripClosed ? 3 : 4.8) - 1} width={R * 0.75} height={2} rx={1} className="rb-jaw" />)}
            </>
          ) : p.id === 'blok' ? (
            <>
              <rect x={-R * 0.9} y={-R * 0.85} width={R * 1.8} height={R * 1.7} rx={3} className="rb-body blok" />
              <rect x={-R * 0.55} y={-R - 1} width={R * 1.1} height={4} rx={1} className="rb-wheel" />
              <rect x={-R * 0.55} y={R - 3} width={R * 1.1} height={4} rx={1} className="rb-wheel" />
              <rect x={-R * 0.35} y={-R * 0.35} width={R * 0.7} height={R * 0.7} rx={2} fill={light} className="rb-hub" />
              <rect x={R * 0.75} y={-R * 0.45} width={4} height={R * 0.9} rx={1} className="rb-bumper" data-pressed={robot.pressed || undefined} />
            </>
          ) : (
            <>
              <circle r={R} className="rb-body gezgin" />
              <rect x={-R * 0.45} y={-R - 1} width={R * 0.9} height={3.5} rx={1} className="rb-wheel" />
              <rect x={-R * 0.45} y={R - 2.5} width={R * 0.9} height={3.5} rx={1} className="rb-wheel" />
              <circle cx={R * 0.62} cy={-R * 0.35} r={1.8} fill={light} className="rb-eye" />
              <circle cx={R * 0.62} cy={R * 0.35} r={1.8} fill={light} className="rb-eye" />
            </>
          )}
          {robot.has('color') && <circle cx={R * 0.5} cy={0} r={1.4} className="rb-sensor" fill={FLOOR_COLORS[robot.color].css} />}
          {robot.has('line') && (['left', 'right'] as const).map((side) => (
            <circle key={side} cx={R * 0.6} cy={side === 'left' ? -1.5 : 1.5} r={0.9} className="rb-sensor" fill={robot.lineOn(side) ? '#f97316' : '#94a3b8'} />
          ))}
          <path d={`M${-R * 0.2} -3L${R * 0.25} 0L${-R * 0.2} 3`} className="rb-arrow" />
        </g>
      </svg>
  )
}

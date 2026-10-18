// Sezon görev alanının durağan üstten görünüşü (sunucuda çizilir; robot benzetimi yok). 1 birim = 1 cm, robot arenasıyla aynı yön ve renkler.
import { FLOOR_COLORS, ROBOT_PROFILES, type RobotProfileId, type RobotScene } from '@/lib/mikro/robot'
import { ZONE_EN } from '@/lib/mikro/en'
import './robot.css'

const CM = 100
export const ZONE_CSS = { goal: '#16a34a', checkpoint: '#d97706', start: '#6366f1', penalty: '#dc2626' } as const

export function SeasonField({ scene, profile, en, label }: { scene: RobotScene; profile: RobotProfileId; en: boolean; label: string }) {
  const W = scene.width * CM, H = scene.height * CM
  const X = (x: number) => x * CM, Y = (y: number) => (scene.height - y) * CM
  const R = ROBOT_PROFILES[profile].radius * CM
  const { x, y, theta } = scene.pose
  const deg = (-theta * 180) / Math.PI
  return (
    <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} role="img" aria-label={label} className="sz-field" data-testid="season-field">
      <rect x={0} y={0} width={W} height={H} className="rb-floor" />
      {scene.patches.map((q, i) => (
        <rect key={i} x={X(Math.min(q.x1, q.x2))} y={Y(Math.max(q.y1, q.y2))} width={Math.abs(q.x2 - q.x1) * CM} height={Math.abs(q.y2 - q.y1) * CM} fill={FLOOR_COLORS[q.color].css} rx={2} />
      ))}
      {scene.zones.map((z) => (
        <g key={z.id} data-zone={z.id}>
          <circle cx={X(z.x)} cy={Y(z.y)} r={z.r * CM} fill={ZONE_CSS[z.kind]} fillOpacity={0.14} stroke={ZONE_CSS[z.kind]} strokeDasharray="4 3" />
          {z.label && <text x={X(z.x)} y={Y(z.y) + 2} textAnchor="middle" className="rb-ztext">{en ? ZONE_EN[z.label] ?? z.label : z.label}</text>}
        </g>
      ))}
      {scene.walls.map(([x1, y1, x2, y2], i) => <line key={i} x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} className="rb-wall" />)}
      {(scene.objects ?? []).map((o) => {
        const h = ((o.size ?? 0.04) / 2) * CM
        return <rect key={o.id} data-cube={o.id} x={X(o.x) - h} y={Y(o.y) - h} width={h * 2} height={h * 2} rx={1} fill={FLOOR_COLORS[o.color].css} className="rb-cube" />
      })}
      <g transform={`translate(${X(x)} ${Y(y)}) rotate(${deg})`}>
        <circle r={R} fill={ZONE_CSS.start} fillOpacity={0.2} stroke={ZONE_CSS.start} />
        <path d={`M${R * 0.9} 0 L${-R * 0.3} ${-R * 0.5} L${-R * 0.3} ${R * 0.5} Z`} fill={ZONE_CSS.start} />
      </g>
    </svg>
  )
}

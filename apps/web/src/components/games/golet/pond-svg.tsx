// Gölet havuzu: saf SVG çizim (özgün ördekler, nilüferler, patlamalar). Üstten görünüş; 0° sağ, 90° yukarı.
import { BLAST_LIFE, BLAST_R, DUCK_R, RELOAD, duckDisplayName, type DuckFrame, type PondFrame } from '@/lib/games/golet/sim'
import { useLocale, useT } from '@/i18n/client'

const PADS: [number, number, number, number][] = [[16, 22, 4.6, 40], [84, 78, 5.2, 200], [70, 14, 3.8, 110], [30, 84, 4.2, 300], [90, 30, 3.4, 20], [46, 52, 3, 250]]
const REEDS: [number, number][] = [[4, 4], [96, 6], [5, 95], [95, 94]]

const hpColor = (hp: number) => (hp > 55 ? '#4ade80' : hp > 25 ? '#fbbf24' : '#f87171')
const shade = (hex: string, k: number): string => {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)))
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`
}

function Duck({ d }: { d: DuckFrame }) {
  const en = useLocale() === 'en'
  const body = d.color
  const dark = shade(body, 0.72)
  const light = shade(body, 1.18)
  const me = d.kind === 'player'
  const r = DUCK_R
  const wingFlap = d.alive ? Math.sin(d.x * 0.9 + d.y * 0.9) * 0.35 : 0
  return (
    <g transform={`translate(${d.x} ${100 - d.y})`} opacity={d.alive ? 1 : 0.5}>
      {d.alive && d.speed > 12 && <ellipse cx={-r * 1.4} cy="0" rx={r * 0.9} ry={r * 0.45} fill="#fff" opacity=".18" transform={`rotate(${-d.dir})`} />}
      {me && d.alive && (
        <circle r={r + 2.2} fill="none" stroke="#fff" strokeWidth=".5" strokeOpacity=".9" strokeDasharray={`${Math.max(0.01, (1 - d.reload / RELOAD) * 2 * Math.PI * (r + 2.2))} 100`} transform="rotate(-90)" />
      )}
      <g transform={`rotate(${-d.dir})`}>
        {/* kuyruk */}
        <path d={`M ${-r * 1.0} ${-r * 0.55} L ${-r * 1.55} 0 L ${-r * 1.0} ${r * 0.55} Z`} fill={dark} />
        {/* gövde */}
        <ellipse cx="0" cy="0" rx={r * 1.12} ry={r * 0.82} fill={body} stroke={dark} strokeWidth=".35" />
        {/* kanatlar */}
        <ellipse cx={-r * 0.12} cy={-r * (0.52 + wingFlap * 0.1)} rx={r * 0.62} ry={r * 0.3} fill={dark} />
        <ellipse cx={-r * 0.12} cy={r * (0.52 + wingFlap * 0.1)} rx={r * 0.62} ry={r * 0.3} fill={dark} />
        {/* baş */}
        <circle cx={r * 0.88} cy="0" r={r * 0.58} fill={light} stroke={dark} strokeWidth=".3" />
        {/* gaga */}
        <path d={`M ${r * 1.34} ${-r * 0.22} L ${r * 1.95} 0 L ${r * 1.34} ${r * 0.22} Z`} fill="#ff9f1c" stroke="#d97a00" strokeWidth=".2" />
        {/* gözler */}
        {d.alive ? (
          <>
            <circle cx={r * 1.02} cy={-r * 0.3} r={r * 0.13} fill="#0f172a" />
            <circle cx={r * 1.02} cy={r * 0.3} r={r * 0.13} fill="#0f172a" />
          </>
        ) : (
          <path d={`M ${r * 0.9} ${-r * 0.4} l ${r * 0.24} ${r * 0.2} M ${r * 1.14} ${-r * 0.4} l ${-r * 0.24} ${r * 0.2} M ${r * 0.9} ${r * 0.2} l ${r * 0.24} ${r * 0.2} M ${r * 1.14} ${r * 0.2} l ${-r * 0.24} ${r * 0.2}`} stroke="#0f172a" strokeWidth=".25" fill="none" />
        )}
        {d.kind === 'master' && d.alive && <path d={`M ${r * 0.55} ${-r * 0.35} l ${r * 0.12} ${-r * 0.55} l ${r * 0.2} ${r * 0.35} l ${r * 0.2} ${-r * 0.35} l ${r * 0.12} ${r * 0.55} Z`} fill="#fbbf24" stroke="#b45309" strokeWidth=".2" />}
        {d.kind === 'hunter' && d.alive && <path d={`M ${r * 0.55} ${-r * 0.5} L ${r * 1.2} ${-r * 0.12}`} stroke="#7f1d1d" strokeWidth=".45" />}
        {d.kind === 'sniper' && d.alive && <circle cx={r * 1.02} cy={r * 0.3} r={r * 0.3} fill="none" stroke="#e9d5ff" strokeWidth=".2" />}
        {d.kind === 'wanderer' && d.alive && <path d={`M ${r * 0.5} ${-r * 0.65} q ${r * 0.4} ${-r * 0.5} ${r * 0.8} 0 z`} fill="#166534" />}
      </g>
      {d.alive && (
        <g transform={`translate(0 ${-r - 2.4})`}>
          <rect x="-4" y="-0.9" width="8" height="1.8" rx=".9" fill="#0b2a4a" opacity=".75" />
          <rect x="-4" y="-0.9" width={Math.max(0, (8 * d.hp) / 100)} height="1.8" rx=".9" fill={hpColor(d.hp)} />
          <text className="gl-name" y="-1.6">{duckDisplayName(d, en)}</text>
        </g>
      )}
    </g>
  )
}

export function PondSvg({ frame }: { frame: PondFrame }) {
  const t = useT()
  const en = useLocale() === 'en'
  const ducks = [...frame.ducks].sort((a, b) => Number(b.alive === false) - Number(a.alive === false) || a.y - b.y)
  return (
    <svg className="gl-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img"
      aria-label={t('studios.gamesB.golet.poolLabel', { ducks: frame.ducks.map((d) => `${duckDisplayName(d, en)}: ${d.alive ? t('studios.gamesB.golet.duckHp', { hp: Math.round(d.hp) }) : t('studios.gamesB.golet.duckSunk')}`).join(', ') })}>
      <defs>
        <radialGradient id="gl-water" cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor="#57c2ea" />
          <stop offset="1" stopColor="#1f86bd" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="#e8d9a8" />
      <rect x="1.2" y="1.2" width="97.6" height="97.6" rx="5" fill="url(#gl-water)" stroke="#b79d5e" strokeWidth="1" />
      {[[30, 30, 12], [70, 62, 16], [52, 84, 9], [18, 66, 8]].map(([x, y, r], i) => (
        <ellipse key={i} className="gl-ripple" cx={x} cy={y} rx={r} ry={r * 0.55} style={{ animationDelay: `${i * 0.9}s` }} />
      ))}
      {PADS.map(([x, y, r, rot], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <circle r={r} fill="#3f9b52" stroke="#2c7a3d" strokeWidth=".4" />
          <path d={`M 0 0 L ${r} ${-r * 0.22} A ${r} ${r} 0 0 0 ${r} ${r * 0.22} Z`} fill="#2f89d0" opacity=".9" />
          {i % 2 === 0 && <circle cx={-r * 0.25} cy={-r * 0.2} r={r * 0.22} fill="#f9a8d4" />}
        </g>
      ))}
      {REEDS.map(([x, y], i) => (
        <g key={i} stroke="#4d7c0f" strokeWidth=".6" strokeLinecap="round">
          {[-1.6, 0, 1.6].map((o, j) => <line key={j} x1={x + o} y1={y + 3} x2={x + o * 1.7} y2={y - 3 - j} />)}
          <ellipse cx={x} cy={y - 4} rx=".9" ry="2" fill="#92400e" stroke="none" />
        </g>
      ))}
      {frame.shots.map((s, i) => (
        <g key={`t${i}`}>
          <path d={`M ${s.tx - 1.1} ${100 - s.ty - 1.1} l 2.2 2.2 M ${s.tx - 1.1} ${100 - s.ty + 1.1} l 2.2 -2.2`} stroke="#fff" strokeOpacity=".5" strokeWidth=".4" />
        </g>
      ))}
      {ducks.map((d) => <Duck key={d.id} d={d} />)}
      {frame.shots.map((s, i) => (
        <g key={`s${i}`} transform={`translate(${s.x} ${100 - s.y}) rotate(${-s.dir})`}>
          <line x1="-3" y1="0" x2="0" y2="0" stroke="#fff" strokeOpacity=".7" strokeWidth=".5" strokeLinecap="round" />
          <circle r="1.05" fill="#1e293b" stroke="#f1f5f9" strokeWidth=".3" />
        </g>
      ))}
      {frame.blasts.map((b, i) => {
        const t = b.age / BLAST_LIFE
        return (
          <g key={`b${i}`} transform={`translate(${b.x} ${100 - b.y})`} opacity={1 - t * 0.9}>
            <circle r={BLAST_R * (0.35 + 0.65 * Math.min(1, t * 2.2))} fill="#fb923c" fillOpacity=".55" stroke="#fff7ed" strokeWidth=".5" />
            <circle r={BLAST_R * 0.4 * (1 - t * 0.6)} fill="#fde047" />
          </g>
        )
      })}
    </svg>
  )
}

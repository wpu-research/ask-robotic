'use client'
// Gölet Eğitmeni sahnesi: saf SVG/CSS. Kendi çizimimiz (ördekler, yaprak, kayalar); Blockly Games görseli kullanılmadı.
// Koordinatlar oyun dünyası ile aynı: 0..100, y yukarı (ekranda ters çevrilir).
import { useId } from 'react'
import type { SceneProps } from '@/lib/games/types'
import { BLAST, SCAN_HALF, type Duck, type World } from '@/lib/games/pondtutor/world'
import { useT } from '@/i18n/client'

const STEP_MS = 90
const Y = (y: number) => 100 - y

function DuckSprite({ d, dur, color, belly, label, hurt, hurtKey }: { d: Duck; dur: number; color: string; belly: string; label: string; hurt: boolean; hurtKey: number }) {
  const dead = d.health <= 0
  const flip = Math.cos((d.heading * Math.PI) / 180) < -0.01
  const frac = Math.max(0, d.health / d.maxHealth)
  return (
    <g className="pt-duck" style={{ transform: `translate(${d.x}px, ${Y(d.y)}px)`, transition: `transform ${dur}ms linear` }} data-testid={`duck-${label}`}>
      {d.speed > 8 && !dead && (
        <g transform={`scale(${flip ? -1 : 1} 1)`} opacity={0.5}>
          <ellipse cx={-4.4} cy={0.9} rx={1.6} ry={0.5} fill="none" stroke="#fff" strokeWidth={0.35} />
          <ellipse cx={-6.4} cy={0.9} rx={2.2} ry={0.7} fill="none" stroke="#fff" strokeWidth={0.25} />
        </g>
      )}
      <g transform={`scale(${flip ? -1 : 1} ${dead ? -1 : 1})`} opacity={dead ? 0.55 : 1}>
        <g key={hurtKey} className={hurt ? 'pt-hurt' : undefined}>
          <ellipse cx={-0.3} cy={0.4} rx={3.3} ry={2.4} fill={color} />
          <path d="M -3.2 -0.4 Q -4.8 -2.2 -3.9 -2.6 Q -2.4 -1.6 -1.6 -1.2 Z" fill={color} />
          <ellipse cx={-0.7} cy={0.5} rx={1.9} ry={1.2} fill={belly} />
          <circle cx={2.3} cy={-1.9} r={1.7} fill={color} />
          <path d="M 3.7 -2.1 L 5.7 -1.5 L 3.8 -0.8 Z" fill="#ff9a1f" />
          {dead ? (
            <path d="M 1.6 -2.8 l 1 1 m 0 -1 l -1 1" stroke="#222" strokeWidth={0.35} strokeLinecap="round" />
          ) : (
            <><circle cx={2.7} cy={-2.3} r={0.5} fill="#fff" /><circle cx={2.85} cy={-2.3} r={0.25} fill="#1b1b1b" /></>
          )}
        </g>
      </g>
      <g transform="translate(0 -6.6)" aria-hidden="true">
        <rect x={-4.5} y={-0.6} width={9} height={1.2} rx={0.6} fill="#0b1f33" opacity={0.45} />
        <rect x={-4.5} y={-0.6} width={9 * frac} height={1.2} rx={0.6} fill={frac > 0.5 ? '#3ecf6e' : frac > 0.25 ? '#ffc933' : '#ff5a5f'} />
      </g>
    </g>
  )
}

export default function Scene({ frame, speed, running }: SceneProps<World>) {
  const t = useT()
  const w = frame
  const uid = useId().replace(/:/g, '')
  const dur = Math.max(20, STEP_MS / Math.max(0.1, speed))
  const p = w.player
  const e = w.enemy
  const scanAge = w.scan ? w.tick - w.scan.tick : 99
  const aimAge = w.aim ? w.tick - w.aim.tick : 99
  const wedge = (cx: number, cy: number, ang: number, half: number, len: number) => {
    const a1 = ((ang - half) * Math.PI) / 180, a2 = ((ang + half) * Math.PI) / 180
    return `M ${cx} ${Y(cy)} L ${cx + Math.cos(a1) * len} ${Y(cy + Math.sin(a1) * len)} L ${cx + Math.cos(a2) * len} ${Y(cy + Math.sin(a2) * len)} Z`
  }
  const reloadFrac = Math.min(1, Math.max(0, 1 - p.reload / 8))
  const live = w.status === 'playing' ? t('studios.gamesB.pondtutor.playing') : w.status
  return (
    <svg viewBox="0 0 100 100" className="pt-scene" role="img" aria-label={t('studios.gamesB.pondtutor.sceneLabel', { x: Math.round(p.x), y: Math.round(p.y), hp: Math.ceil(p.health), enemy: e ? t('studios.gamesB.pondtutor.enemyHealth', { hp: Math.ceil(e.health) }) : '', status: live })} data-testid="pondtutor-scene" data-tick={w.tick} data-status={w.status} data-running={running}>
      <style>{`
        .pt-scene{display:block;width:100%;height:100%;font-family:system-ui,sans-serif}
        .pt-duck{will-change:transform}
        .pt-hurt{animation:pt-hurt .35s ease-out}
        @keyframes pt-hurt{0%{filter:brightness(2.2) saturate(.2)}100%{filter:none}}
        .pt-boom{transform-box:fill-box;transform-origin:center;animation:pt-boom .5s ease-out forwards}
        @keyframes pt-boom{0%{transform:scale(.15);opacity:.95}100%{transform:scale(1);opacity:0}}
        .pt-pulse{transform-box:fill-box;transform-origin:center;animation:pt-pulse 1.8s ease-in-out infinite}
        @keyframes pt-pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.07);opacity:.55}}
        @media (prefers-reduced-motion:reduce){.pt-pulse,.pt-hurt{animation:none}.pt-boom{animation-duration:.01s}}
      `}</style>
      <defs>
        <radialGradient id={`${uid}-w`} cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#5fc4ee" /><stop offset="1" stopColor="#2a86c4" /></radialGradient>
        <pattern id={`${uid}-r`} width="14" height="9" patternUnits="userSpaceOnUse"><path d="M1 4 q3 -3 6 0 t6 0" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth=".5" /></pattern>
      </defs>
      <rect width="100" height="100" fill="#8a6a3b" />
      <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-w)`} />
      <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-r)`} />
      {/* ızgara ve sayılar: konumları okumaya yardım eder */}
      <g stroke="#fff" strokeOpacity=".18" strokeWidth=".25">
        {[20, 40, 60, 80].map((t) => (<g key={t}><line x1={t} y1="0" x2={t} y2="100" /><line x1="0" y1={t} x2="100" y2={t} /></g>))}
      </g>
      <g fill="#fff" fillOpacity=".7" fontSize="2.6" fontWeight="700">
        {[20, 40, 60, 80].map((t) => (<g key={t}><text x={t} y="98.6" textAnchor="middle">{t}</text><text x="1" y={Y(t) + 0.9}>{t}</text></g>))}
      </g>
      <rect x="0.6" y="0.6" width="98.8" height="98.8" fill="none" stroke="#7a5a2c" strokeWidth="1.2" rx="1" />
      {/* hedef yaprağı */}
      {w.target && (
        <g transform={`translate(${w.target.x} ${Y(w.target.y)})`} data-testid="target">
          <circle r={w.target.r} fill="#3fae5a" stroke="#1e7a3a" strokeWidth=".6" />
          <path d={`M 0 0 L ${w.target.r} ${-w.target.r * 0.18} A ${w.target.r} ${w.target.r} 0 0 1 ${w.target.r} ${w.target.r * 0.18} Z`} fill="#2a8c46" />
          <circle className="pt-pulse" r={w.target.r + 1.4} fill="none" stroke="#fff3a0" strokeWidth=".7" strokeDasharray="2 2" />
          <g fill="#ff8fb4"><circle cx="-1.3" cy="-0.6" r="1.4" /><circle cx="1.3" cy="-0.6" r="1.4" /><circle cy="1.1" r="1.4" /></g>
          <circle cy="-0.1" r=".9" fill="#ffd23f" />
        </g>
      )}
      {/* kayalar */}
      {w.rocks.map((r, i) => (
        <g key={i} transform={`translate(${r.x} ${Y(r.y)})`}>
          <ellipse cy={r.r * 0.12} rx={r.r * 1.05} ry={r.r * 0.9} fill="#1b4d70" opacity=".35" />
          <circle r={r.r} fill="#8d97a5" stroke="#5b6573" strokeWidth=".7" />
          <circle cx={-r.r * 0.3} cy={-r.r * 0.3} r={r.r * 0.45} fill="#a9b2bf" opacity=".8" />
          <path d={`M ${-r.r * 0.2} ${r.r * 0.3} l ${r.r * 0.25} ${r.r * 0.2} l ${r.r * 0.2} ${-r.r * 0.3}`} fill="none" stroke="#5b6573" strokeWidth=".6" strokeLinecap="round" />
        </g>
      ))}
      {/* tarama ışını ve nişan işareti */}
      {w.scan && scanAge <= 2 && (
        <path d={wedge(p.x, p.y, w.scan.angle, SCAN_HALF, 70)} fill={w.scan.found ? '#ffe45c' : '#ffffff'} opacity={w.scan.found ? 0.38 : 0.2} data-testid="scan-wedge" />
      )}
      {w.aim && aimAge <= 8 && (
        <g transform={`translate(${p.x + 0} ${Y(p.y)})`} opacity={Math.max(0, 1 - aimAge / 8) * 0.9}>
          <line x1="0" y1="0" x2={Math.cos((w.aim.angle * Math.PI) / 180) * w.aim.range} y2={-Math.sin((w.aim.angle * Math.PI) / 180) * w.aim.range} stroke="#fff" strokeWidth=".4" strokeDasharray="1.2 1.2" />
          <g transform={`translate(${Math.cos((w.aim.angle * Math.PI) / 180) * w.aim.range} ${-Math.sin((w.aim.angle * Math.PI) / 180) * w.aim.range})`} stroke="#ff4a55" strokeWidth=".6" strokeLinecap="round"><path d="M-1.4 -1.4 L1.4 1.4 M1.4 -1.4 L-1.4 1.4" /></g>
        </g>
      )}
      {/* ördekler */}
      {e && <DuckSprite d={e} dur={dur} color="#e0733a" belly="#f5b27a" label="rakip" hurt={w.hurt.e > 0} hurtKey={w.tick} />}
      <DuckSprite d={p} dur={dur} color="#ffd23f" belly="#fff0a8" label="sen" hurt={w.hurt.p > 0} hurtKey={w.tick} />
      {/* toplar */}
      {w.balls.map((b) => (
        <g key={b.id} style={{ transform: `translate(${b.x}px, ${Y(b.y)}px)`, transition: `transform ${dur}ms linear` }}>
          <circle r="1.25" fill={b.owner === 'p' ? '#2b2f3a' : '#6a1d1d'} stroke="#fff" strokeWidth=".3" />
          <circle cx="-.35" cy="-.4" r=".35" fill="#fff" opacity=".7" />
        </g>
      ))}
      {/* patlamalar */}
      {w.booms.map((bm, i) => (
        <g key={`${w.tick}-${i}`} transform={`translate(${bm.x} ${Y(bm.y)})`}>
          <circle className="pt-boom" r={BLAST} fill="#ffb347" opacity=".9" />
          <circle className="pt-boom" r={BLAST * 0.55} fill="#fff4b0" />
        </g>
      ))}
      {/* HUD */}
      <g transform="translate(4 4)" aria-hidden="true">
        <rect x="-1" y="-1" width="62" height={e ? 16 : 10} rx="2" fill="#0b1f33" opacity=".55" />
        <text x="0" y="3" fontSize="3" fontWeight="700" fill="#ffd23f">Sen</text>
        <rect x="14" y="0.4" width="40" height="3" rx="1.5" fill="#fff" opacity=".25" />
        <rect x="14" y="0.4" width={Math.max(0, 40 * (p.health / p.maxHealth))} height="3" rx="1.5" fill="#3ecf6e" />
        <text x="56" y="3" fontSize="2.6" fill="#fff">{Math.ceil(p.health)}</text>
        <text x="0" y="8" fontSize="2.6" fill="#fff" opacity=".85">Top</text>
        <rect x="14" y="5.6" width="40" height="2.2" rx="1.1" fill="#fff" opacity=".25" />
        <rect x="14" y="5.6" width={40 * reloadFrac} height="2.2" rx="1.1" fill={reloadFrac >= 1 ? '#7fd1ff' : '#a0a8b8'} />
        {e && (<>
          <text x="0" y="13" fontSize="3" fontWeight="700" fill="#ff9a62">Rakip</text>
          <rect x="14" y="10.4" width="40" height="3" rx="1.5" fill="#fff" opacity=".25" />
          <rect x="14" y="10.4" width={Math.max(0, 40 * (e.health / e.maxHealth))} height="3" rx="1.5" fill="#ff5a5f" />
          <text x="56" y="13" fontSize="2.6" fill="#fff">{Math.ceil(e.health)}</text>
        </>)}
      </g>
      <g aria-hidden="true">
        <text x="97" y="6.5" textAnchor="end" fontSize="3" fontWeight="700" fill="#fff" opacity=".85">{(w.tick / 10).toFixed(1)} sn</text>
      </g>
    </svg>
  )
}

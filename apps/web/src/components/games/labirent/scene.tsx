'use client'
// Labirent sahnesi: saf SVG + CSS. Yolcu, çalı duvarlar ve bayrak bu projeye özgü çizimlerdir.
import { useMemo } from 'react'
import { useT } from '@/i18n/client'
import type { SceneProps } from '@/lib/games/types'
import { dataOf, findCell, mazeStepDelay, type MazeState } from '@/lib/games/labirent/engine'

const S = 40 // bir karenin SVG birimi

/** Basit, deterministik sahte rastgelelik (çalıların her yenilemede aynı görünmesi için). */
const hash = (x: number, y: number, k: number) => {
  let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const CSS = `
.lb-svg { width: 100%; height: 100%; display: block; border-radius: 14px; }
.lb-mover { transition-property: transform; transition-timing-function: cubic-bezier(.35,.1,.3,1); }
.lb-turner { transform-origin: 0 0; transition-property: transform; transition-timing-function: cubic-bezier(.35,.1,.3,1); }
.lb-bump { animation: lb-bump var(--lb-dur, .5s) ease-out 1; }
.lb-hop { animation: lb-hop .7s ease-in-out infinite; }
.lb-flag { transform-origin: 0 0; animation: lb-wave 1.2s ease-in-out infinite; }
.lb-star { animation: lb-pulse 1.6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
.lb-confetti { animation: lb-pop 1.1s ease-out infinite; transform-box: fill-box; transform-origin: center; }
.lb-bubble { animation: lb-bubble .5s ease-out 1; transform-box: fill-box; transform-origin: center; }
.lb-flash { animation: lb-flash .9s ease-out 1; }
@keyframes lb-bump { 0% { transform: translateY(0) } 35% { transform: translateY(-9px) } 55% { transform: translateY(3px) rotate(-6deg) } 75% { transform: translateY(-2px) rotate(5deg) } 100% { transform: translateY(0) } }
@keyframes lb-hop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
@keyframes lb-wave { 0%,100% { transform: skewY(0deg) } 50% { transform: skewY(-8deg) } }
@keyframes lb-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.12) } }
@keyframes lb-pop { 0% { transform: translateY(0) scale(.3); opacity: 0 } 25% { opacity: 1 } 100% { transform: translateY(-22px) scale(1); opacity: 0 } }
@keyframes lb-bubble { 0% { transform: scale(.2); opacity: 0 } 70% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
@keyframes lb-flash { 0% { opacity: .85 } 100% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) {
  .lb-mover, .lb-turner { transition-duration: 0ms !important }
  .lb-bump, .lb-hop, .lb-flag, .lb-star, .lb-confetti, .lb-bubble, .lb-flash { animation: none !important }
}
`

function Bush({ x, y }: { x: number; y: number }) {
  const px = x * S, py = y * S
  const tone = hash(x, y, 1)
  const base = tone < 0.33 ? '#2f7d3a' : tone < 0.66 ? '#2a7236' : '#33853f'
  const blobs = [0, 1, 2].map((i) => ({ cx: px + 10 + hash(x, y, 10 + i) * 20, cy: py + 10 + hash(x, y, 20 + i) * 20, r: 6 + hash(x, y, 30 + i) * 5 }))
  return (
    <g>
      <rect x={px + 1} y={py + 1} width={S - 2} height={S - 2} rx={11} fill={base} />
      <rect x={px + 1} y={py + 24} width={S - 2} height={S - 25} rx={11} fill="#24602d" opacity={0.45} />
      {blobs.map((b, i) => <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#48a553" opacity={0.7} />)}
      {hash(x, y, 7) > 0.7 && <circle cx={px + 10 + hash(x, y, 8) * 20} cy={py + 10 + hash(x, y, 9) * 20} r={2.3} fill="#e8556d" />}
    </g>
  )
}

function Traveler() {
  // Üstten görünüş; "ön" yukarıdır (-y). Merkez (0,0).
  return (
    <g>
      <ellipse cx={0} cy={3} rx={13} ry={12} fill="#000" opacity={0.18} />
      <rect x={-9} y={2} width={18} height={12} rx={5} fill="#a8672e" />
      <rect x={-6} y={5} width={12} height={2.4} rx={1.2} fill="#c98846" />
      <circle cx={0} cy={-1} r={12} fill="#ff8a3d" />
      <circle cx={0} cy={-3} r={9.5} fill="#ffd9b0" />
      <path d="M -11 -5 Q 0 -19 11 -5 Q 0 -9 -11 -5 Z" fill="#2f6fd6" />
      <circle cx={-3.6} cy={-4} r={1.7} fill="#26323f" />
      <circle cx={3.6} cy={-4} r={1.7} fill="#26323f" />
      <path d="M -3 0.5 Q 0 3 3 0.5" fill="none" stroke="#26323f" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M 0 -19 L 4 -13 L -4 -13 Z" fill="#fff" opacity={0.9} />
    </g>
  )
}

function Flag({ x, y, won }: { x: number; y: number; won: boolean }) {
  const cx = x * S + S / 2, cy = y * S + S / 2
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} className={won ? 'lb-star' : undefined} fill="#ffe27a" opacity={0.55} />
      <ellipse cx={cx} cy={cy + 12} rx={9} ry={3} fill="#000" opacity={0.2} />
      <rect x={cx - 1.2} y={cy - 14} width={2.4} height={26} rx={1.2} fill="#6b4a2b" />
      <g transform={`translate(${cx + 1.2} ${cy - 14})`}>
        <g className="lb-flag">
          <path d="M 0 0 L 15 4 L 0 10 Z" fill="#e8423f" />
          <path d="M 0 3 L 7 4.8 L 0 6.6 Z" fill="#fff" opacity={0.85} />
        </g>
      </g>
      {won && [0, 1, 2, 3, 4].map((i) => (
        <circle key={i} className="lb-confetti" cx={cx - 16 + i * 8} cy={cy - 4 + (i % 2) * 5} r={2.4}
          fill={['#ff5d8f', '#4c97ff', '#ffd23f', '#3ccf91', '#a56bff'][i]} style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </g>
  )
}

export default function Scene({ level, frame, speed, outcome }: SceneProps<MazeState>) {
  const t = useT()
  const data = dataOf(level)
  const rows = data.grid.length, cols = data.grid[0].length
  const goal = useMemo(() => findCell(data.grid, 'G'), [data.grid])
  const walls = useMemo(() => {
    const out: Array<[number, number]> = []
    data.grid.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') out.push([x, y]) }))
    return out
  }, [data.grid])
  const paths = useMemo(() => {
    const out: Array<[number, number]> = []
    data.grid.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '#') out.push([x, y]) }))
    return out
  }, [data.grid])

  const dur = Math.max(60, Math.round(Math.min(320, mazeStepDelay(level.id) * 0.85) / Math.max(0.25, speed)))
  const w = cols * S, h = rows * S
  const won = frame.atGoal || outcome?.ok === true
  const px = frame.x * S + S / 2, py = frame.y * S + S / 2
  // Çarpmayı her çarpışmada yeniden oynatmak için anahtar.
  const crashKey = `${frame.crashed ? 'c' : 'n'}-${frame.moves}-${frame.angle}`

  return (
    <>
      <style>{CSS}</style>
      <svg className="lb-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role="img"
        aria-label={`${t('studios.games.labirent.mapAria', { cols, rows, x: frame.x + 1, y: frame.y + 1 })}${frame.atGoal ? t('studios.games.labirent.atGoal') : ''}${frame.crashed ? t('studios.games.labirent.crashed') : ''}.`}>
        <defs>
          <linearGradient id="lb-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd16b" />
            <stop offset="1" stopColor="#6fbb58" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={w} height={h} fill="url(#lb-grass)" rx={14} />
        {paths.map(([x, y]) => (
          <rect key={`p${x}-${y}`} x={x * S} y={y * S} width={S} height={S} fill={(x + y) % 2 ? '#f0dba3' : '#ebd299'} />
        ))}
        {walls.map(([x, y]) => <Bush key={`w${x}-${y}`} x={x} y={y} />)}
        {frame.trail.slice(0, -1).map(([x, y], i) => (
          <circle key={`t${i}`} cx={x * S + S / 2} cy={y * S + S / 2} r={3} fill="#b78a4a" opacity={0.45} />
        ))}
        <Flag x={goal[0]} y={goal[1]} won={won} />
        {frame.crashed && <rect key={`f${crashKey}`} className="lb-flash" x={frame.x * S} y={frame.y * S} width={S} height={S} fill="#ff4d4d" />}
        <g className="lb-mover" style={{ transform: `translate(${px}px, ${py}px)`, transitionDuration: `${dur}ms` }}>
          <g className="lb-turner" style={{ transform: `rotate(${frame.angle}deg)`, transitionDuration: `${dur}ms` }}>
            <g key={crashKey} className={frame.crashed ? 'lb-bump' : won ? 'lb-hop' : undefined} style={{ ['--lb-dur' as string]: `${Math.max(300, dur * 1.6)}ms` }}>
              <Traveler />
            </g>
          </g>
          {frame.crashed && (
            <g transform="translate(14 -20)" className="lb-bubble">
              <circle r={9} fill="#fff" stroke="#e8423f" strokeWidth={2} />
              <text y={4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#e8423f">!</text>
            </g>
          )}
        </g>
      </svg>
    </>
  )
}

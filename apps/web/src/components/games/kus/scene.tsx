'use client'
// Kuş sahnesi: saf SVG/CSS (özgün çizimler). Dünya 400x400, y yukarı; çizimde y ters çevrilir.
import { useId } from 'react'
import type { SceneProps } from '@/lib/games/types'
import { KUS_STEP_DELAY } from '@/lib/games/kus'
import type { BirdState } from '@/lib/games/kus/engine'

const W = 400
const Y = (y: number) => W - y

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.85">
      <ellipse cx="0" cy="0" rx="26" ry="10" /><ellipse cx="-12" cy="-7" rx="14" ry="10" /><ellipse cx="9" cy="-9" rx="16" ry="12" />
    </g>
  )
}

function Nest({ x, y, filled }: { x: number; y: number; filled: boolean }) {
  return (
    <g transform={`translate(${x} ${Y(y)})`}>
      <ellipse cx="0" cy="6" rx="24" ry="11" fill="#7a4b22" />
      <path d="M-24 4 Q0 22 24 4 Q22 -6 0 -4 Q-22 -6 -24 4Z" fill="#b97a3d" />
      {[-18, -10, -2, 7, 15].map((t, i) => <path key={i} d={`M${t} 14 q${i % 2 ? 6 : -6} -10 ${i % 2 ? 12 : -10} -16`} stroke="#8a5528" strokeWidth="2" fill="none" strokeLinecap="round" />)}
      <path d="M-20 0 Q0 12 20 0" stroke="#d9a35e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {filled && (
        <g className="kus-hearts">
          <path d="M0 -16 c-6 -8 -16 0 0 10 c16 -10 6 -18 0 -10Z" fill="#ff5a7a" />
        </g>
      )}
    </g>
  )
}

function Worm({ x, y, small }: { x: number; y: number; small?: boolean }) {
  const s = small ? 0.8 : 1
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="kus-wiggle">
        <path d="M-11 4 q4 -9 8 0 t8 0 t8 0" stroke="#f08a9b" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <path d="M-11 4 q4 -9 8 0 t8 0 t8 0" stroke="#ffb3c0" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="1 7" />
        <circle cx="13" cy="4" r="1.3" fill="#3a2330" />
      </g>
    </g>
  )
}

function BirdBody({ crashed, won, hasWorm, flap }: { crashed: boolean; won: boolean; hasWorm: boolean; flap: boolean }) {
  return (
    <g className={flap ? 'kus-flap' : ''}>
      <path d="M-15 4 L-27 -2 L-25 8 L-27 14 Z" fill="#2b6ed1" />
      <ellipse cx="0" cy="4" rx="16" ry="13" fill="#4c97ff" />
      <ellipse cx="2" cy="9" rx="10" ry="7" fill="#cfe3ff" />
      <g className="kus-wing" style={{ transformOrigin: '-2px 2px' }}>
        <path d="M-6 0 Q-18 -16 -4 -20 Q8 -12 6 2 Z" fill="#2b6ed1" />
      </g>
      <circle cx="8" cy="-2" r="5.4" fill="#fff" />
      {crashed ? (
        <path d="M5 -5 l6 6 M11 -5 l-6 6" stroke="#222" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <circle cx="9.4" cy="-2" r="2.5" fill="#1b2a44" />
      )}
      <path d="M15 0 L25 3 L15 6 Z" fill="#ffb02e" />
      {won && <path d="M14 8 q4 6 8 0" stroke="#1b2a44" strokeWidth="1.2" fill="none" />}
      {hasWorm && <g transform="translate(20 6) rotate(18)"><Worm x={0} y={0} small /></g>}
    </g>
  )
}

export default function Scene({ level, frame, running, speed, outcome }: SceneProps<BirdState>) {
  const uid = useId().replace(/:/g, '')
  const dur = Math.round((KUS_STEP_DELAY * 0.92) / Math.max(0.1, speed))
  const faceLeft = frame.heading > 90 && frame.heading < 270
  const crashed = frame.status === 'wall' || frame.status === 'edge'
  const won = frame.status === 'won' || outcome?.ok === true
  const trail = frame.trail.map(([x, y]) => `${x},${Y(y)}`).join(' ')
  const tilt = crashed ? 25 : 0

  return (
    <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label={`Kuş sahnesi, seviye ${level.id}`} style={{ width: '100%', height: '100%', display: 'block', borderRadius: 12, background: '#bfe3ff' }}>
      <style>{`
        .kus-wiggle{animation:kus-wig 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes kus-wig{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.82)}}
        .kus-flap .kus-wing{animation:kus-wing .28s ease-in-out infinite alternate}
        @keyframes kus-wing{from{transform:rotate(-26deg)}to{transform:rotate(30deg)}}
        .kus-hearts{animation:kus-pop 1s ease-in-out infinite alternate}
        @keyframes kus-pop{from{transform:translateY(0) scale(1)}to{transform:translateY(-6px) scale(1.15)}}
        .kus-bird{transition-property:transform;transition-timing-function:linear}
        @media (prefers-reduced-motion: reduce){.kus-wiggle,.kus-flap .kus-wing,.kus-hearts{animation:none}.kus-bird{transition-duration:0ms!important}}
      `}</style>
      <defs>
        <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fc4ff" /><stop offset="1" stopColor="#e3f4ff" />
        </linearGradient>
        <pattern id={`${uid}brick`} width="20" height="10" patternUnits="userSpaceOnUse">
          <rect width="20" height="10" fill="#9a9aa6" />
          <path d="M0 0H20M0 5H20M10 0V5M0 5V10M20 5V10" stroke="#6f6f7c" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width={W} height={W} fill={`url(#${uid}sky)`} />
      <Cloud x={70} y={50} /><Cloud x={300} y={90} s={1.3} /><Cloud x={190} y={30} s={0.7} />
      {/* ızgara: konum okumak için */}
      <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1" fontSize="9" fill="#4d6a8a" fontFamily="system-ui,sans-serif">
        {[100, 200, 300].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2={W} strokeDasharray="3 5" />
            <line x1="0" y1={Y(v)} x2={W} y2={Y(v)} strokeDasharray="3 5" />
            <text x={v + 2} y={W - 3} stroke="none">{v}</text>
            <text x={3} y={Y(v) - 2} stroke="none">{v}</text>
          </g>
        ))}
      </g>
      <rect x="0" y={W - 8} width={W} height="8" fill="#7cc66b" />
      {/* duvarlar */}
      {frame.walls.map((w, i) => (
        <g key={i}>
          <rect x={w.x} y={Y(w.y + w.h)} width={w.w} height={w.h} fill={`url(#${uid}brick)`} stroke="#58586a" strokeWidth="1.5" rx="2" />
        </g>
      ))}
      <polyline points={trail} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="2 6" strokeLinecap="round" opacity="0.9" />
      <Nest x={frame.nest[0]} y={frame.nest[1]} filled={frame.status === 'won'} />
      <g style={{ opacity: frame.hasWorm ? 0 : 1, transition: 'opacity 200ms' }}>
        <Worm x={frame.worm[0]} y={Y(frame.worm[1])} />
      </g>
      <g className="kus-bird" style={{ transform: `translate(${frame.x}px, ${Y(frame.y)}px)`, transitionDuration: `${running ? dur : 0}ms` }}>
        <g transform={`scale(${faceLeft ? -1 : 1} 1) rotate(${tilt})`}>
          <BirdBody crashed={crashed} won={won} hasWorm={frame.hasWorm && frame.status !== 'won'} flap={running && frame.status === 'flying'} />
        </g>
      </g>
      {/* pusula */}
      <g transform="translate(366 36)" fontSize="9" fontFamily="system-ui,sans-serif" fill="#35527a" textAnchor="middle" fontWeight="700">
        <circle r="22" fill="#ffffff" fillOpacity="0.7" />
        <path d="M0 -14 L0 14 M-14 0 L14 0" stroke="#35527a" strokeWidth="1" />
        <text y="-15" dy="-1">90°</text><text x="19" y="3">0°</text><text x="-19" y="3">180°</text><text y="23">270°</text>
      </g>
    </svg>
  )
}

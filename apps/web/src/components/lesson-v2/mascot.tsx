export type Mood = 'idle' | 'happy' | 'think' | 'oops'

/** Robi: platformun rehber robotu. Basit SVG; ruh hâline göre göz ve anten ışığı değişir. */
export function Mascot({ mood = 'idle', size = 56 }: { mood?: Mood; size?: number }) {
  const eye = mood === 'happy' ? 'M-6 1 q6 -6 12 0' : mood === 'oops' ? 'M-5 -3 l10 6 M5 -3 l-10 6' : null
  return (
    <svg className={`robi robi-${mood}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="6" x2="32" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle className="robi-light" cx="32" cy="6" r="4.5" />
      <rect x="8" y="14" width="48" height="38" rx="14" className="robi-head" />
      <rect x="14" y="22" width="36" height="22" rx="9" className="robi-face" />
      {[24, 40].map((x) => (
        <g key={x} transform={`translate(${x} 33)`}>
          {eye ? <path d={eye} className="robi-eye-line" /> : <rect x="-3.5" y={mood === 'think' ? -6 : -4.5} width="7" height="9" rx="3.5" className="robi-eye" />}
        </g>
      ))}
      <rect x="2" y="27" width="6" height="12" rx="3" className="robi-ear" />
      <rect x="56" y="27" width="6" height="12" rx="3" className="robi-ear" />
      <rect x="22" y="54" width="20" height="6" rx="3" className="robi-neck" />
    </svg>
  )
}

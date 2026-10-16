/**
 * "Programlarımız" kart çizimleri (fotoğraf yerine): her program kendi renginde küçük bir sahne. Dekoratif; renkler
 * playful.css'teki yardımcı renk değişkenlerinden (pa-* sınıfları) gelir, koyu temada da çalışır.
 */
export type ProgramArtKind = 'kids' | 'eng' | 'uni' | 'topics'

const Star = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path className="pa-star" transform={`translate(${x} ${y}) scale(${s})`} d="M0 -10 L3 -3 L10 -2 L4 3 L6 10 L0 6 L-6 10 L-4 3 L-10 -2 L-3 -3 Z" />
)

function Kids() {
  return (
    <>
      <circle cx="270" cy="40" r="22" className="pa-sun" />
      <path d="M0 165 C60 150 120 175 180 160 C240 146 290 160 320 152 V200 H0 Z" className="pa-ground" />
      {/* blok robot */}
      <g transform="translate(120 52)">
        <line x1="40" y1="0" x2="40" y2="-14" className="pa-stroke" /><circle cx="40" cy="-18" r="6" className="pa-coral" />
        <rect x="0" y="0" width="80" height="56" rx="14" className="pa-sky" />
        <circle cx="25" cy="26" r="9" className="pa-white" /><circle cx="55" cy="26" r="9" className="pa-white" />
        <circle cx="27" cy="27" r="4.5" className="pa-ink" /><circle cx="57" cy="27" r="4.5" className="pa-ink" />
        <path d="M28 42 q12 9 24 0" className="pa-stroke" />
        <rect x="8" y="62" width="64" height="44" rx="10" className="pa-coral" />
        <rect x="24" y="72" width="32" height="16" rx="4" className="pa-sun" />
        <rect x="-16" y="66" width="18" height="10" rx="5" className="pa-sky" transform="rotate(-25 -7 71)" />
        <rect x="78" y="62" width="18" height="10" rx="5" className="pa-sky" transform="rotate(-35 87 67)" />
        <circle cx="22" cy="110" r="9" className="pa-ink" /><circle cx="58" cy="110" r="9" className="pa-ink" />
      </g>
      {/* bloklar */}
      <g transform="translate(22 40) rotate(-8)">
        <path d="M0 6 a6 6 0 0 1 6 -6 h12 l4 5 h10 l4 -5 h34 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-34 l-4 5 h-10 l-4 -5 h-12 a6 6 0 0 1 -6 -6 z" className="pa-grape" />
        <text x="38" y="19" textAnchor="middle" className="pa-label">ileri</text>
      </g>
      <g transform="translate(222 92) rotate(6)">
        <path d="M0 6 a6 6 0 0 1 6 -6 h12 l4 5 h10 l4 -5 h34 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-34 l-4 5 h-10 l-4 -5 h-12 a6 6 0 0 1 -6 -6 z" className="pa-sprout" />
        <text x="38" y="19" textAnchor="middle" className="pa-label">zıpla!</text>
      </g>
      <Star x={60} y={120} /><Star x={250} y={150} s={0.7} /><Star x={100} y={22} s={0.6} />
    </>
  )
}

function Eng() {
  return (
    <>
      {/* devre tahtası */}
      <rect x="30" y="96" width="260" height="78" rx="10" className="pa-white pa-line" />
      {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={48 + i * 12} cy="112" r="2" className="pa-hole" />)}
      {Array.from({ length: 20 }, (_, i) => <circle key={`b${i}`} cx={48 + i * 12} cy="158" r="2" className="pa-hole" />)}
      <path d="M70 135 C70 120 100 120 100 135" className="pa-wire-r" />
      <path d="M180 135 C180 112 236 112 236 135" className="pa-wire-b" />
      {/* direnç */}
      <g transform="translate(110 128)"><line x1="-10" y1="7" x2="60" y2="7" className="pa-leg" /><rect x="6" y="0" width="38" height="14" rx="7" className="pa-sun" /><rect x="14" y="0" width="4" height="14" className="pa-coral" /><rect x="24" y="0" width="4" height="14" className="pa-grape" /></g>
      {/* LED */}
      <g transform="translate(200 104)"><circle cx="0" cy="0" r="22" className="pa-glow" /><path d="M-10 6 v-12 a10 10 0 0 1 20 0 v12 z" className="pa-coral" /><line x1="-5" y1="6" x2="-5" y2="30" className="pa-leg" /><line x1="5" y1="6" x2="5" y2="26" className="pa-leg" /></g>
      {/* drone */}
      <g transform="translate(160 44)"><g className="pa-hover">
        <line x1="-50" y1="0" x2="50" y2="0" className="pa-stroke" />
        <ellipse cx="-50" cy="-6" rx="24" ry="4" className="pa-prop" /><ellipse cx="50" cy="-6" rx="24" ry="4" className="pa-prop" />
        <rect x="-22" y="-8" width="44" height="22" rx="10" className="pa-sprout" />
        <circle cx="-8" cy="3" r="4" className="pa-white" /><circle cx="8" cy="3" r="4" className="pa-white" />
      </g></g>
      <Star x={40} y={40} s={0.8} /><Star x={290} y={62} s={0.6} />
    </>
  )
}

function Uni() {
  return (
    <>
      {/* PID grafiği */}
      <rect x="170" y="30" width="128" height="88" rx="10" className="pa-white pa-line" />
      <line x1="182" y1="74" x2="288" y2="74" className="pa-dash" />
      <path d="M182 108 C200 40 214 44 226 80 C236 100 246 66 258 76 C266 80 276 74 288 74" className="pa-curve" />
      <text x="186" y="46" className="pa-small">PID</text>
      {/* robot kol */}
      <rect x="40" y="160" width="90" height="16" rx="6" className="pa-ink" />
      <circle cx="85" cy="152" r="14" className="pa-coral" />
      <path d="M85 152 L118 92" className="pa-arm" />
      <circle cx="118" cy="92" r="10" className="pa-sun" />
      <path d="M118 92 L160 112" className="pa-arm" />
      <path d="M160 112 l14 -6 M160 112 l14 8" className="pa-grip" />
      <circle cx="182" cy="140" r="9" className="pa-sky" />
      {/* kep */}
      <g transform="translate(66 52) rotate(-10)">
        <path d="M0 0 L36 -14 L72 0 L36 14 Z" className="pa-ink" />
        <path d="M14 6 v14 q22 12 44 0 v-14" className="pa-ink" />
        <path d="M66 2 v20" className="pa-tassel" /><circle cx="66" cy="24" r="4" className="pa-sun" />
      </g>
      <text x="234" y="160" textAnchor="middle" className="pa-code">ESOF 323</text>
      <Star x={150} y={30} s={0.7} /><Star x={290} y={176} s={0.6} />
    </>
  )
}

function Topics() {
  const tiles: [number, number, string, string][] = [
    [40, 34, 'pa-coral', '🤖'], [112, 34, 'pa-sun', '💡'], [184, 34, 'pa-sky', '🎮'], [256, 34, 'pa-grape', '🧠'],
    [76, 108, 'pa-sprout', '🔌'], [148, 108, 'pa-coral', '🚁'], [220, 108, 'pa-sun', '📷'],
  ]
  return (
    <>
      {tiles.map(([x, y, c, e], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? 5 : -5} 28 28)`}>
          <rect width="56" height="56" rx="14" className={c} />
          <rect width="56" height="56" rx="14" className="pa-shine" />
          <text x="28" y="38" textAnchor="middle" className="pa-emoji">{e}</text>
        </g>
      ))}
      <Star x={24} y={110} s={0.7} /><Star x={300} y={120} s={0.8} />
    </>
  )
}

const SCENES = { kids: Kids, eng: Eng, uni: Uni, topics: Topics }

export function ProgramArt({ kind }: { kind: ProgramArtKind }) {
  const Scene = SCENES[kind]
  return (
    <svg className={`program-art pa-${kind}`} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="200" className="pa-bg" />
      <pattern id={`pa-dots-${kind}`} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" className="pa-dot" /></pattern>
      <rect width="320" height="200" fill={`url(#pa-dots-${kind})`} />
      <Scene />
    </svg>
  )
}

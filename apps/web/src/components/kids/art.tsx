// Kart illüstrasyonları (kendi çizimimiz, SVG). Her biri 320x180; arka plan rengi sahnenin parçasıdır, iki temada da aynı kalır.
export type ArtKind = 'goz' | 'robot' | 'devre' | 'sensor' | 'mikro' | 'oyun' | 'blok' | 'ai' | 'sahne' | 'oyunlar' | 'beceri' | 'arena' | 'parcalar'

const W = 320, H = 180

function Robot() {
  return (
    <>
      <rect width={W} height={H} fill="#fde7c7" />
      <path d="M-10 150 Q90 95 170 125 T340 105" stroke="#2a1a12" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="226" y="40" width="52" height="40" rx="6" fill="#ef4444" opacity=".9" />
      <text x="252" y="66" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">HEDEF</text>
      <g transform="translate(118 62)">
        <rect x="0" y="22" width="96" height="46" rx="10" fill="#facc15" stroke="#2a1a12" strokeWidth="3" />
        <rect x="26" y="4" width="44" height="24" rx="5" fill="#0f9488" stroke="#2a1a12" strokeWidth="3" />
        {[0, 1, 2].map((i) => <rect key={i} x={33 + i * 12} y="11" width="6" height="6" rx="1" fill={i === 1 ? '#ff3b30' : '#ffd1cc'} />)}
        <circle cx="16" cy="70" r="13" fill="#2a1a12" /><circle cx="16" cy="70" r="5" fill="#e5e7eb" />
        <circle cx="80" cy="70" r="13" fill="#2a1a12" /><circle cx="80" cy="70" r="5" fill="#e5e7eb" />
        <circle cx="100" cy="40" r="7" fill="#e5e7eb" stroke="#2a1a12" strokeWidth="3" />
        <circle cx="100" cy="56" r="7" fill="#e5e7eb" stroke="#2a1a12" strokeWidth="3" />
      </g>
    </>
  )
}

function Devre() {
  return (
    <>
      <rect width={W} height={H} fill="#dff3ec" />
      <rect x="40" y="40" width="240" height="100" rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={60 + i * 20} cy="56" r="3" fill="#cbd5e1" />)}
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={60 + i * 20} cy="124" r="3" fill="#cbd5e1" />)}
      <rect x="62" y="74" width="36" height="34" rx="5" fill="#2a1a12" />
      <text x="80" y="96" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fde047">+5V</text>
      <path d="M98 82 H130" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
      <rect x="130" y="74" width="48" height="16" rx="8" fill="#e0aa76" stroke="#7a4426" strokeWidth="2" />
      {[140, 152, 164].map((x, i) => <rect key={x} x={x} y="74" width="4" height="16" fill={['#7a4426', '#111', '#ef4444'][i]} />)}
      <path d="M178 82 H208" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
      <circle cx="226" cy="74" r="40" fill="#ef4444" opacity=".18" />
      <path d="M212 90 V70 a14 14 0 0 1 28 0 V90 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" />
      <path d="M220 90 V112 M232 90 V104" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <path d="M98 100 H232 V104" stroke="#2a1a12" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  )
}

function Sensor() {
  return (
    <>
      <rect width={W} height={H} fill="#e0f2fe" />
      {[60, 90, 120].map((r) => <path key={r} d={`M${200 - r * 0.2} ${90 - r * 0.55} A${r} ${r} 0 0 1 ${200 - r * 0.2} ${90 + r * 0.55}`} fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" opacity={1.3 - r / 120} />)}
      <rect x="44" y="58" width="112" height="64" rx="8" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="3" />
      {[76, 124].map((x) => <g key={x}><circle cx={x} cy="90" r="22" fill="#cbd5e1" stroke="#475569" strokeWidth="4" /><circle cx={x} cy="90" r="11" fill="#475569" /></g>)}
      <rect x="276" y="50" width="16" height="80" rx="4" fill="#7a4426" />
    </>
  )
}

function Mikro() {
  const heart = ['01010', '11111', '11111', '01110', '00100']
  return (
    <>
      <rect width={W} height={H} fill="#ccfbf1" />
      <rect x="90" y="18" width="140" height="144" rx="16" fill="#0f9488" stroke="#115e59" strokeWidth="4" />
      {heart.flatMap((row, r) => [...row].map((c, k) => <rect key={`${r}${k}`} x={118 + k * 18} y={42 + r * 18} width="12" height="12" rx="3" fill={c === '1' ? '#ff3b30' : '#134e4a'} />))}
      <circle cx="106" cy="88" r="10" fill="#f8fafc" stroke="#115e59" strokeWidth="3" /><text x="106" y="93" textAnchor="middle" fontSize="12" fontWeight="800" fill="#115e59">A</text>
      <circle cx="214" cy="88" r="10" fill="#f8fafc" stroke="#115e59" strokeWidth="3" /><text x="214" y="93" textAnchor="middle" fontSize="12" fontWeight="800" fill="#115e59">B</text>
      {[124, 160, 196].map((x) => <rect key={x} x={x - 10} y="140" width="20" height="14" rx="3" fill="#facc15" />)}
    </>
  )
}

function Oyun() {
  return (
    <>
      <rect width={W} height={H} fill="#e0e7ff" />
      <circle cx="270" cy="38" r="18" fill="#fde047" />
      <rect x="20" y="146" width="280" height="34" fill="#7a4426" /><rect x="20" y="140" width="280" height="10" fill="#22c55e" />
      <rect x="150" y="100" width="70" height="14" rx="4" fill="#7a4426" /><rect x="150" y="96" width="70" height="7" rx="3" fill="#22c55e" />
      {[168, 186, 204].map((x) => <circle key={x} cx={x} cy="82" r="7" fill="#facc15" stroke="#b45309" strokeWidth="2" />)}
      <g transform="translate(78 92)">
        <rect x="0" y="10" width="30" height="30" rx="8" fill="#f97316" stroke="#2a1a12" strokeWidth="3" />
        <circle cx="10" cy="22" r="3" fill="#2a1a12" /><circle cx="21" cy="22" r="3" fill="#2a1a12" />
        <path d="M-6 6 Q14 -10 34 4" stroke="#2a1a12" strokeWidth="3" fill="none" strokeDasharray="4 4" />
      </g>
      <path d="M250 140 l10 -18 l10 18 Z" fill="#94a3b8" />
    </>
  )
}

function Blok() {
  const blocks: [number, number, string, string][] = [[70, 38, '#facc15', 'başla'], [70, 72, '#3b82f6', 'ileri 3'], [70, 106, '#22c55e', '4 kez'], [96, 134, '#ec4899', 'dön']]
  return (
    <>
      <rect width={W} height={H} fill="#fef3c7" />
      {blocks.map(([x, y, c, t]) => (
        <g key={t}>
          <path d={`M${x} ${y} h18 v6 h20 v-6 h${120} a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-120 v6 h-20 v-6 h-18 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 Z`} fill={c} stroke="#2a1a12" strokeOpacity=".35" strokeWidth="2" />
          <text x={x + 14} y={y + 21} fontSize="15" fontWeight="800" fill="#fff">{t}</text>
        </g>
      ))}
      <g transform="translate(250 70)"><circle r="26" fill="#fb923c" /><circle cx="-8" cy="-4" r="4" fill="#2a1a12" /><circle cx="8" cy="-4" r="4" fill="#2a1a12" /><path d="M-8 9 Q0 15 8 9" stroke="#2a1a12" strokeWidth="3" fill="none" strokeLinecap="round" /></g>
    </>
  )
}

function Ai() {
  return (
    <>
      <rect width={W} height={H} fill="#ede9fe" />
      <g transform="translate(96 92)">
        <rect x="-44" y="-38" width="88" height="70" rx="18" fill="#f8fafc" stroke="#2a1a12" strokeWidth="3" />
        <circle cx="-16" cy="-4" r="9" fill="#22c55e" /><circle cx="16" cy="-4" r="9" fill="#22c55e" />
        <path d="M-14 18 Q0 26 14 18" stroke="#2a1a12" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0 -38 V-54" stroke="#2a1a12" strokeWidth="3" /><circle cx="0" cy="-58" r="6" fill="#facc15" stroke="#2a1a12" strokeWidth="2" />
      </g>
      <rect x="168" y="36" width="122" height="42" rx="14" fill="#7a4426" /><text x="229" y="63" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">Neden böyle?</text>
      <rect x="182" y="96" width="108" height="42" rx="14" fill="#fff" stroke="#c4b5fd" strokeWidth="3" /><text x="236" y="123" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4c1d95">Birlikte bakalım</text>
      {[[150, 30], [300, 160], [40, 30]].map(([x, y]) => <path key={x} d={`M${x} ${y - 8} l3 6 l6 2 l-6 2 l-3 6 l-3 -6 l-6 -2 l6 -2 Z`} fill="#a78bfa" />)}
    </>
  )
}

function Sahne() {
  return (
    <>
      <rect width={W} height={H} fill="#fce7f3" />
      <path d="M0 0 H320 V22 Q240 40 160 22 Q80 40 0 22 Z" fill="#be185d" />
      <path d="M0 0 V180 H40 Q20 90 46 0 Z" fill="#9d174d" /><path d="M320 0 V180 H280 Q300 90 274 0 Z" fill="#9d174d" />
      <ellipse cx="160" cy="156" rx="100" ry="14" fill="#fbcfe8" />
      <path d="M160 58 l14 30 l32 4 l-24 22 l7 32 l-29 -16 l-29 16 l7 -32 l-24 -22 l32 -4 Z" fill="#facc15" stroke="#b45309" strokeWidth="3" />
      <circle cx="152" cy="98" r="3.5" fill="#2a1a12" /><circle cx="168" cy="98" r="3.5" fill="#2a1a12" />
      <path d="M152 110 Q160 116 168 110" stroke="#2a1a12" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  )
}

function Oyunlar() {
  return (
    <>
      <rect width={W} height={H} fill="#fee2e2" />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5].map((c) => ((r + c) % 3 === 0 ? <rect key={`${r}${c}`} x={60 + c * 34} y={26 + r * 34} width="34" height="34" fill="#7a4426" opacity=".85" /> : null)))}
      <rect x="58" y="24" width="206" height="140" fill="none" stroke="#2a1a12" strokeWidth="4" rx="4" />
      <circle cx="77" cy="145" r="10" fill="#f97316" stroke="#2a1a12" strokeWidth="3" />
      <path d="M240 34 l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -2 Z" fill="#facc15" stroke="#b45309" strokeWidth="2" />
    </>
  )
}

function Beceri() {
  return (
    <>
      <rect width={W} height={H} fill="#fef9c3" />
      <path d="M130 40 h60 v28 a30 30 0 0 1 -60 0 Z" fill="#facc15" stroke="#b45309" strokeWidth="4" />
      <path d="M130 48 h-18 a14 14 0 0 0 18 22 M190 48 h18 a14 14 0 0 1 -18 22" fill="none" stroke="#b45309" strokeWidth="4" />
      <rect x="150" y="96" width="20" height="22" fill="#b45309" /><rect x="128" y="118" width="64" height="14" rx="4" fill="#7a4426" />
      <text x="160" y="72" textAnchor="middle" fontSize="20" fontWeight="800" fill="#7a4426">1</text>
      <g transform="translate(250 92)"><circle r="30" fill="#fff" stroke="#2a1a12" strokeWidth="4" /><path d="M0 0 V-20 M0 0 L14 8" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" /><rect x="-6" y="-42" width="12" height="10" rx="2" fill="#2a1a12" /></g>
      <g transform="translate(64 96)"><rect x="-26" y="-12" width="52" height="34" rx="6" fill="#0f9488" /><text y="11" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">89</text></g>
    </>
  )
}

function Arena() {
  return (
    <>
      <rect width={W} height={H} fill="#ffedd5" />
      <rect x="20" y="20" width="280" height="140" rx="6" fill="#fffdf9" stroke="#7a4426" strokeWidth="5" />
      <path d="M60 130 C60 50 260 50 260 90 S120 150 60 130" stroke="#2a1a12" strokeWidth="7" fill="none" />
      <g transform="translate(150 60) rotate(-12)">
        <circle r="26" fill="#bfdbfe" stroke="#1e3a8a" strokeWidth="3" /><rect x="-14" y="-10" width="22" height="20" rx="2" fill="#1d4ed8" />
        <rect x="16" y="-12" width="10" height="24" rx="2" fill="#475569" />
        <rect x="-10" y="-34" width="22" height="9" rx="3" fill="#f59e0b" /><rect x="-10" y="25" width="22" height="9" rx="3" fill="#f59e0b" />
      </g>
      <text x="236" y="146" fontSize="22" fontWeight="800" fill="#7a4426">{'{ }'}</text>
    </>
  )
}

function Parcalar() {
  return (
    <>
      <rect width={W} height={H} fill="#f1f5f9" />
      <g transform="translate(70 90)"><path d="M-10 -8 V-30 a10 10 0 0 1 20 0 V-8 Z" fill="#22c55e" stroke="#14532d" strokeWidth="3" /><path d="M-5 -8 V30 M5 -8 V20" stroke="#64748b" strokeWidth="4" /></g>
      <g transform="translate(160 90)"><path d="M-60 0 H-26 M26 0 H60" stroke="#64748b" strokeWidth="4" /><rect x="-26" y="-11" width="52" height="22" rx="11" fill="#e0aa76" stroke="#7a4426" strokeWidth="2" />{[-14, -4, 6].map((x, i) => <rect key={x} x={x} y="-11" width="5" height="22" fill={['#7a4426', '#111', '#ef4444'][i]} />)}</g>
      <g transform="translate(250 90)"><rect x="-22" y="-16" width="44" height="32" rx="4" fill="#1d4ed8" /><rect x="-30" y="-6" width="60" height="6" fill="#1e3a8a" /><circle cx="-8" cy="-26" r="10" fill="#f8fafc" stroke="#475569" strokeWidth="3" /><path d="M-8 -26 H14" stroke="#475569" strokeWidth="5" strokeLinecap="round" /></g>
    </>
  )
}

function Goz() {
  const px = [[0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 2, 2, 2, 2, 1, 0], [1, 2, 3, 2, 2, 3, 2, 1], [1, 2, 2, 2, 2, 2, 2, 1], [1, 2, 3, 2, 2, 3, 2, 1], [1, 2, 2, 3, 3, 2, 2, 1], [0, 1, 2, 2, 2, 2, 1, 0], [0, 0, 1, 1, 1, 1, 0, 0]]
  const C = ['#fde68a', '#f59e0b', '#fbbf24', '#7a4426']
  return (
    <>
      <rect width={W} height={H} fill="#e0f2fe" />
      <g transform="translate(36 30)">{px.flatMap((r, y) => r.map((v, x) => <rect key={`${x}-${y}`} x={x * 15} y={y * 15} width={14} height={14} rx={2} fill={C[v]} />))}</g>
      <path d="M170 90 H196" stroke="#0f766e" strokeWidth="5" strokeDasharray="6 5" strokeLinecap="round" />
      <g transform="translate(250 90)">
        <rect x="-44" y="-38" width="88" height="76" rx="18" fill="#0f766e" stroke="#134e4a" strokeWidth="4" />
        <circle cx="-16" cy="-6" r="15" fill="#fff" /><circle cx="16" cy="-6" r="15" fill="#fff" />
        <circle cx="-12" cy="-6" r="7" fill="#2a1a12" /><circle cx="20" cy="-6" r="7" fill="#2a1a12" />
        <path d="M-14 20 Q0 28 14 20" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M0 -38 V-52" stroke="#134e4a" strokeWidth="4" /><circle cy="-56" r="6" fill="#f43f5e" />
      </g>
    </>
  )
}

const ART: Record<ArtKind, () => React.JSX.Element> = { goz: Goz, robot: Robot, devre: Devre, sensor: Sensor, mikro: Mikro, oyun: Oyun, blok: Blok, ai: Ai, sahne: Sahne, oyunlar: Oyunlar, beceri: Beceri, arena: Arena, parcalar: Parcalar }

/** Modül slug'ı → illüstrasyon. */
export const MODULE_ART: Record<string, ArtKind> = {
  scratchjr: 'blok', scratch: 'sahne', 'arduino-temelleri': 'devre', 'sensorler-ve-projeler': 'sensor',
  robotik: 'arena', 'ai-muhendisligi': 'ai', 'mikro-kart': 'mikro', 'oyun-atolyesi': 'oyun',
}

export function Art({ kind, className }: { kind: ArtKind; className?: string }) {
  const C = ART[kind]
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
      <C />
    </svg>
  )
}

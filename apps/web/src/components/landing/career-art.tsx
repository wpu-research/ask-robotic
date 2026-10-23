/**
 * "Ne olmak istiyorsun?" kart çizimleri: kıvrılan bir yol, üstünde üç durak (o mesleğin araçları) ve sonda bayrak.
 * Program kartı çizimleriyle (program-art.tsx) aynı dil ve renk sınıfları; dekoratif.
 */
type Tone = 'sun' | 'sky' | 'sprout' | 'coral' | 'grape'

/** Hedef → üç durak simgesi ve renk. Hedef listesi lib/kariyer.ts'tedir. */
export const CAREER_ART: Record<string, { icons: [string, string, string]; tone: Tone }> = {
  'robotik-yazilim': { icons: ['🔌', '📡', '🤖'], tone: 'sky' },
  'gomulu-yazilim': { icons: ['💡', '⏱️', '🔧'], tone: 'sun' },
  'drone-iha': { icons: ['🔋', '🧭', '🚁'], tone: 'sprout' },
  iot: { icons: ['🌡️', '📶', '☁️'], tone: 'coral' },
  'bilgisayarli-goru': { icons: ['📷', '🔍', '🎯'], tone: 'grape' },
  'makine-ogrenmesi': { icons: ['📊', '🧠', '📈'], tone: 'sky' },
  'yapay-zeka-uygulama': { icons: ['💬', '📚', '✨'], tone: 'sun' },
  'endustriyel-robot': { icons: ['⚙️', '🦾', '🏭'], tone: 'sprout' },
  'otonom-arac': { icons: ['📡', '🗺️', '🚗'], tone: 'coral' },
  'robotik-arastirmaci': { icons: ['🦿', '⚖️', '🎓'], tone: 'grape' },
}

const STOPS: [number, number, string][] = [[56, 130, 'pa-coral'], [140, 76, 'pa-sky'], [226, 124, 'pa-sun']]

export function CareerArt({ slug }: { slug: string }) {
  const a = CAREER_ART[slug] ?? { icons: ['🔌', '🤖', '🚁'], tone: 'sky' as Tone }
  const id = `ca-dots-${slug}`
  return (
    <svg className={`program-art ca-${a.tone}`} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="200" className="pa-bg" />
      <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" className="pa-dot" /></pattern>
      <rect width="320" height="200" fill={`url(#${id})`} />
      <path d="M20 176 C40 150 50 150 84 150 C130 150 110 96 168 96 C220 96 200 150 254 144 C280 141 286 100 292 70" className="ca-road" />
      <path d="M20 176 C40 150 50 150 84 150 C130 150 110 96 168 96 C220 96 200 150 254 144 C280 141 286 100 292 70" className="ca-road-dash" />
      {STOPS.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x - 28} ${y - 46}) rotate(${i % 2 ? 5 : -5} 28 28)`}>
          <rect width="56" height="56" rx="14" className={c} />
          <rect width="56" height="56" rx="14" className="pa-shine" />
          <text x="28" y="38" textAnchor="middle" className="pa-emoji">{a.icons[i]}</text>
        </g>
      ))}
      <g transform="translate(292 70)"><line x1="0" y1="0" x2="0" y2="-40" className="pa-stroke" /><path d="M0 -40 L22 -32 L0 -24 Z" className="pa-coral" /></g>
    </svg>
  )
}

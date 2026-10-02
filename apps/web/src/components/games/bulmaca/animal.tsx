// Bulmaca: hayvan çizimi (özgün SVG). Parçalar özelliklerden çizilir; yeni eklenen parça "pop" animasyonuyla belirir.
import { COLORS, type Features } from '@/lib/games/bulmaca/features'

const INK = '#4a3b2a'

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * (amt < 0 ? v : 255 - v))))
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function legPaths(n: number): { hx: number; fx: number; ky: number }[] {
  return Array.from({ length: n }, (_, i) => {
    if (n <= 4) {
      const x = 100 + (i - (n - 1) / 2) * 26
      return { hx: x, fx: x, ky: 160 }
    }
    const t = (i + 0.5) / n
    return { hx: 58 + t * 84, fx: 100 + (t - 0.5) * 168, ky: 160 }
  })
}

export function Animal({ f, animate = false, label }: { f: Features; animate?: boolean; label: string }) {
  const body = COLORS[f.color].hex
  const dark = shade(body, -0.22)
  const cls = animate ? 'bul-part bul-pop' : 'bul-part'
  const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const }
  const legs = legPaths(f.legs)
  return (
    <svg className="bul-animal" viewBox="0 0 200 200" role="img" aria-label={label}>
      <ellipse cx="100" cy="190" rx={f.legs > 4 ? 78 : 58} ry="5" fill="rgba(0,0,0,.12)" />
      {legs.map((l, i) => (
        <g key={`leg-${i}`} className={cls}>
          <path d={`M${l.hx} 140 L${(l.hx + l.fx) / 2 + (l.fx - l.hx) * 0.3} ${l.ky} L${l.fx} 186`} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${l.hx} 140 L${(l.hx + l.fx) / 2 + (l.fx - l.hx) * 0.3} ${l.ky} L${l.fx} 186`} fill="none" stroke={dark} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {f.tail && (
        <g className={cls}>
          <path d="M138 134 C170 140 178 108 166 92" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d="M138 134 C170 140 178 108 166 92" fill="none" stroke={body} strokeWidth="7" strokeLinecap="round" />
        </g>
      )}
      {f.ears >= 1 && <polygon className={cls} points="74,50 78,16 98,40" fill={body} {...stroke} />}
      {f.ears >= 2 && <polygon className={cls} points="126,50 122,16 102,40" fill={body} {...stroke} />}
      <ellipse cx="100" cy="125" rx="45" ry="38" fill={body} {...stroke} />
      <circle cx="100" cy="66" r="31" fill={body} {...stroke} />
      {f.wings >= 1 && <g transform="rotate(-16 68 124)"><ellipse className={cls} cx="68" cy="124" rx="13" ry="25" fill={dark} {...stroke} /></g>}
      {f.wings >= 2 && <g transform="rotate(16 132 124)"><ellipse className={cls} cx="132" cy="124" rx="13" ry="25" fill={dark} {...stroke} /></g>}
      {f.eyes === 1 && (
        <g className={cls}><circle cx="100" cy="60" r="9" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx="100" cy="61" r="4.5" fill={INK} /></g>
      )}
      {f.eyes >= 2 && (
        <>
          <g className={cls}><circle cx="88" cy="60" r="7.5" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx="89" cy="61" r="3.6" fill={INK} /></g>
          <g className={cls}><circle cx="112" cy="60" r="7.5" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx="111" cy="61" r="3.6" fill={INK} /></g>
        </>
      )}
      {f.beak && <polygon className={cls} points="90,73 110,73 100,92" fill="#ff9f1c" {...stroke} />}
      {f.whiskers && (
        <g className={cls} stroke={INK} strokeWidth="2.2" strokeLinecap="round">
          <line x1="86" y1="76" x2="52" y2="68" /><line x1="86" y1="80" x2="50" y2="80" /><line x1="86" y1="84" x2="54" y2="94" />
          <line x1="114" y1="76" x2="148" y2="68" /><line x1="114" y1="80" x2="150" y2="80" /><line x1="114" y1="84" x2="146" y2="94" />
          <circle cx="100" cy="76" r="3.2" fill="#ff80b5" stroke="none" />
        </g>
      )}
    </svg>
  )
}

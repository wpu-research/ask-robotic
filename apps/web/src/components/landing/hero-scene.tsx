import { Mascot } from '@/components/lesson-v2/mascot'

/** Dişli yolu: n diş, dış yarıçap r, iç yarıçap ri (merkez 0,0). */
function gear(n: number, r: number, ri: number): string {
  const pts: string[] = []
  for (let i = 0; i < n * 4; i++) {
    const a = (i / (n * 4)) * Math.PI * 2
    const rr = i % 4 === 0 || i % 4 === 1 ? r : ri
    pts.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

/**
 * Ana sayfa kahraman sahnesi (çizim, fotoğraf yerine): Mac (fındık) el sallar; pistte küçük bir robot araba, yanında devre
 * kartı (LED yanıp söner), dönen dişliler, blok parçaları ve yıldızlar. Dekoratiftir (aria-hidden); hareket azaltma
 * tercihinde animasyonlar durur (playful.css).
 */
export function HeroScene() {
  return (
    <svg className="hero-scene" viewBox="0 0 560 440" role="presentation" aria-hidden="true">
      <defs>
        <pattern id="hs-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" className="hs-dot" /></pattern>
        <radialGradient id="hs-led" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff7b0" /><stop offset="60%" stopColor="#ffd34d" stopOpacity=".7" /><stop offset="100%" stopColor="#ffd34d" stopOpacity="0" /></radialGradient>
      </defs>
      {/* zemin lekesi ve noktalar */}
      <path className="hs-blob" d="M60 120 C70 40 200 10 300 30 C430 55 540 110 530 230 C520 340 430 420 290 415 C150 410 40 370 30 270 C24 210 52 170 60 120 Z" />
      <rect x="40" y="40" width="480" height="360" fill="url(#hs-dots)" opacity=".5" />

      {/* pist */}
      <path className="hs-track" d="M70 360 C150 300 230 400 320 350 C400 305 440 330 500 300" />
      <path className="hs-track-dash" d="M70 360 C150 300 230 400 320 350 C400 305 440 330 500 300" />

      {/* devre kartı */}
      <g className="hs-board" transform="translate(330 150) rotate(-6)">
        <rect width="170" height="110" rx="12" className="hs-pcb" />
        <rect x="12" y="12" width="146" height="86" rx="8" className="hs-pcb-inner" />
        <rect x="58" y="34" width="54" height="34" rx="4" className="hs-chip" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`t${i}`} x={62 + i * 8} y="28" width="4" height="6" className="hs-pin" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`b${i}`} x={62 + i * 8} y="68" width="4" height="6" className="hs-pin" />)}
        <path className="hs-trace" d="M20 30 H50 M20 50 H50 M120 40 H150 V80 M120 60 H140 M30 80 H90" />
        <circle cx="140" cy="28" r="18" fill="url(#hs-led)" className="hs-led-glow" />
        <circle cx="140" cy="28" r="6" className="hs-led" />
        <text x="85" y="56" textAnchor="middle" className="hs-chip-text">UNO</text>
      </g>

      {/* robot araba */}
      <g className="hs-car">
        <g transform="translate(250 290) rotate(-8)">
          <rect x="0" y="0" width="96" height="48" rx="14" className="hs-car-body" />
          <rect x="18" y="-22" width="56" height="28" rx="9" className="hs-car-head" />
          <circle cx="34" cy="-8" r="6" className="hs-eye" /><circle cx="58" cy="-8" r="6" className="hs-eye" />
          <circle cx="35.5" cy="-9.5" r="2" fill="#fff" /><circle cx="59.5" cy="-9.5" r="2" fill="#fff" />
          <line x1="46" y1="-22" x2="46" y2="-36" className="hs-antenna" /><circle cx="46" cy="-39" r="5" className="hs-antenna-tip" />
          <circle cx="20" cy="50" r="13" className="hs-wheel" /><circle cx="20" cy="50" r="5" className="hs-hub" />
          <circle cx="76" cy="50" r="13" className="hs-wheel" /><circle cx="76" cy="50" r="5" className="hs-hub" />
          <path d="M96 16 l18 -6 M96 26 l20 0 M96 36 l18 6" className="hs-beam" />
        </g>
      </g>

      {/* dişliler */}
      <g transform="translate(470 80)"><path d={gear(10, 34, 26)} className="hs-gear hs-gear-a" /><circle r="9" className="hs-gear-hole" /></g>
      <g transform="translate(418 112)"><path d={gear(8, 22, 16)} className="hs-gear hs-gear-b" /><circle r="6" className="hs-gear-hole" /></g>

      {/* blok parçaları */}
      <g transform="translate(70 70)"><g className="hs-float hs-float-1">
        <path d="M0 8 a8 8 0 0 1 8 -8 h18 l5 6 h14 l5 -6 h40 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-40 l-5 6 h-14 l-5 -6 h-18 a8 8 0 0 1 -8 -8 z" className="hs-block hs-block-a" />
        <text x="49" y="25" textAnchor="middle" className="hs-block-text">ileri 3</text>
      </g></g>
      <g transform="translate(96 118)"><g className="hs-float hs-float-2">
        <path d="M0 8 a8 8 0 0 1 8 -8 h18 l5 6 h14 l5 -6 h22 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-22 l-5 6 h-14 l-5 -6 h-18 a8 8 0 0 1 -8 -8 z" className="hs-block hs-block-b" />
        <text x="40" y="25" textAnchor="middle" className="hs-block-text">dön ↻</text>
      </g></g>

      {/* yıldızlar ve kod */}
      {[[230, 60, 1], [520, 210, 0.8], [40, 230, 0.7], [300, 120, 0.6]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path className={`hs-star hs-twinkle-${i % 3}`} d="M0 -14 L4 -4 L14 -3 L6 4 L9 14 L0 8 L-9 14 L-6 4 L-14 -3 L-4 -4 Z" /></g>
      ))}
      <text x="268" y="236" className="hs-code hs-float hs-float-3">0101</text>
      <text x="420" y="300" className="hs-code hs-float hs-float-1">{'{ }'}</text>

      {/* Mac */}
      <g className="hs-mac">
        <g transform="translate(70 170)"><Mascot size={170} mood="happy" /></g>
        {/* sallanan kol */}
        <g transform="translate(211 262)"><g className="hs-wave">
          <path d="M0 0 C10 -18 18 -34 30 -46" className="hs-arm" />
          <circle cx="32" cy="-50" r="11" className="hs-hand" />
        </g></g>
      </g>
    </svg>
  )
}

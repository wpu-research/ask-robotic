export type Mood = 'idle' | 'happy' | 'think' | 'oops'

/**
 * Mac: Macademia'nın rehberi, makademya cevizi karakteri (Akademi/public/mac.js ile aynı çizim). Kabuk gövde, kabuğun
 * açıklığından görünen iç yüz, başında yaprak; ruh hâline göre göz ve ağız değişir, düşünürken yapraklar sallanır.
 */
export function Mascot({ mood = 'idle', size = 56 }: { mood?: Mood; size?: number }) {
  const eyes = mood === 'happy'
    ? <path d="M23 40 q3 -4 6 0 M35 40 q3 -4 6 0" className="mac-line" />
    : mood === 'oops'
      ? <path d="M23 36 l6 6 M29 36 l-6 6 M35 36 l6 6 M41 36 l-6 6" className="mac-line" />
      : <><rect x="23.5" y={mood === 'think' ? 33 : 35} width="5" height="7" rx="2.5" className="mac-eye" /><rect x="35.5" y={mood === 'think' ? 33 : 35} width="5" height="7" rx="2.5" className="mac-eye" /></>
  const mouth = mood === 'oops' ? <path d="M28 50 q4 -3 8 0" className="mac-line" />
    : mood === 'think' ? <circle cx="32" cy="48.5" r="2" className="mac-eye" />
      : <path d="M27.5 46.5 q4.5 4.5 9 0" className="mac-line" />
  return (
    <svg className={`mac mac-${mood}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g className="mac-leaves">
        <path d="M32 15 C34 5, 44 1, 52 4 C48 11, 40 16, 32 15 Z" className="mac-leaf" /><path d="M32 15 Q42 9 50 5" className="mac-rib" />
        <path d="M31 15 C27 7, 19 5, 13 8 C17 14, 24 17, 31 15 Z" className="mac-leaf mac-leaf-2" /><path d="M31 15 Q22 11 15 8.5" className="mac-rib" />
      </g>
      <rect x="30.5" y="13" width="3" height="5" rx="1.5" className="mac-stem" />
      <circle cx="32" cy="40" r="23" className="mac-shell" />
      <circle cx="20" cy="28" r="4" fill="#ffffff" opacity=".2" />
      <path d="M14.5 40 C14 31, 22 26.5, 32 26.5 C42 26.5, 50 31, 49.5 40 C49.5 50, 42 56, 32 56 C22 56, 14.5 50, 14.5 40 Z" className="mac-face" />
      <path d="M15 37 l3 -3 l3 2.5 l3 -4 l3 2 l3 -3.5 l3 3 l3 -3.5 l3 2.5 l3 -3 l3 3.5 l3 -1.5 l2 3" className="mac-crack" />
      <circle cx="21" cy="46" r="2.6" className="mac-cheek" /><circle cx="43" cy="46" r="2.6" className="mac-cheek" />
      {eyes}{mouth}
    </svg>
  )
}

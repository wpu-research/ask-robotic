'use client'
// Nota çizgisi: beş çizgi üzerinde notalar (x = zaman, y = nota yüksekliği). Kanal renkleri; süre çubukla gösterilir.
import { memo } from 'react'
import { solfegeOf, type Ev } from '@/lib/games/muzik/notes'

export const CH_COLOURS = ['#2f7de1', '#e0821e', '#1fa855', '#c24fd1']
const E4 = 4 * 7 + 2 // alt çizgi
const STEP = 5 // bir diyatonik adımın yüksekliği (px)

export interface StaffProps {
  events: readonly Ev[]
  /** Çizgi alanının toplam vuruşu (x ölçeği). */
  beats: number
  /** Çizgi başlığı. */
  label: string
  /** Vurgulanacak (şu an çalan) olayın dizini. */
  activeIndex?: number
  width: number
  height: number
  dim?: boolean
}

export const Staff = memo(function Staff({ events, beats, label, activeIndex = -1, width, height, dim }: StaffProps) {
  const left = 34, right = 10
  const innerW = width - left - right
  const bx = innerW / Math.max(1, beats)
  // E4 alt çizgisi; en alçak (Do3 = 9 adım aşağı) ve en yüksek (Si5) notalara yer bırakır.
  const baseY = height - 6 - 9 * STEP - 6
  const yOf = (d: number) => baseY - (d - E4) * STEP
  const lines = [0, 2, 4, 6, 8].map((k) => yOf(E4 + k))
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} style={{ display: "block", width: "100%", height: "auto", opacity: dim ? 0.6 : 1 }}>
      <text x={4} y={12} fontSize={10} fontWeight={800} fill="var(--muted, #6b7385)">{label}</text>
      {lines.map((y, i) => <line key={i} x1={left - 6} x2={width - right} y1={y} y2={y} stroke="var(--border-strong, #9aa3b5)" strokeWidth={1} />)}
      {/* ölçü işaretleri her 4 vuruşta */}
      {Array.from({ length: Math.floor(beats / 4) + 1 }, (_, k) => k * 4).map((b) => (
        <line key={b} x1={left + b * bx - 1} x2={left + b * bx - 1} y1={lines[4]} y2={lines[0]} stroke="var(--border, #cfd5e2)" strokeWidth={1} strokeDasharray={b === 0 ? undefined : '2 3'} />
      ))}
      {events.map((e, i) => {
        const x = left + e.t * bx
        if (e.p === null) return <rect key={i} x={x + 1} y={lines[2] - 2} width={Math.max(3, e.d * bx - 3)} height={4} rx={2} fill="var(--muted, #8f98ad)" opacity={0.55} />
        const s = solfegeOf(e.p)
        if (!s) return null
        const y = yOf(s.diatonic)
        const col = CH_COLOURS[e.ch % CH_COLOURS.length]
        const ledgers: number[] = []
        for (let d = E4 - 2; d >= s.diatonic; d -= 2) ledgers.push(yOf(d))
        for (let d = E4 + 10; d <= s.diatonic; d += 2) ledgers.push(yOf(d))
        const active = i === activeIndex
        return (
          <g key={i}>
            {ledgers.map((ly, k) => <line key={k} x1={x - 6} x2={x + 7} y1={ly} y2={ly} stroke="var(--border-strong, #9aa3b5)" strokeWidth={1} />)}
            <rect x={x} y={y - 2.2} width={Math.max(4, e.d * bx - 2)} height={4.4} rx={2.2} fill={col} opacity={0.28} />
            {active && <circle cx={x + 3.5} cy={y} r={9} fill="none" stroke={col} strokeWidth={2} opacity={0.8} />}
            <ellipse cx={x + 3.5} cy={y} rx={4.6} ry={3.5} transform={`rotate(-18 ${x + 3.5} ${y})`} fill={e.d >= 2 ? 'var(--surface, #fff)' : col} stroke={col} strokeWidth={e.d >= 2 ? 2 : 1} />
          </g>
        )
      })}
    </svg>
  )
})

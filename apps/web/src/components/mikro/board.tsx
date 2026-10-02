'use client'
// Sanal Mikro Kart çizimi (SVG, kendi tasarımımız): 5x5 LED, A/B/A+B düğmeleri, dokunmatik yıldız logo, 3 pin.
import { useRef } from 'react'
import type { Device } from '@/lib/mikro/device'
import type { ButtonName, PinName } from '@/lib/mikro/types'

export interface BoardProps {
  device: Device
  /** Üst bileşen her karede artırır (yeniden çizim tetikler). */
  tick: number
  title: string
  onButton(b: ButtonName, down: boolean): void
  onLogo(down: boolean): void
  onPin(p: PinName, down: boolean): void
  /** Dar yerleşim için daha küçük çizim. */
  compact?: boolean
}

const CELL = 28, GAP = 8
const MX = (320 - (5 * CELL + 4 * GAP)) / 2 // 74
const MY = 66

function useHold(onDown: () => void, onUp: () => void) {
  const held = useRef(false)
  const up = () => { if (held.current) { held.current = false; onUp() } }
  return {
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); (e.currentTarget as Element).setPointerCapture?.(e.pointerId); if (!held.current) { held.current = true; onDown() } },
    onPointerUp: up,
    onPointerCancel: up,
    onLostPointerCapture: up,
    onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); if (!held.current) { held.current = true; onDown() } } },
    onKeyUp: (e: React.KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') up() },
    onBlur: up,
  }
}

function Btn({ cx, cy, r, label, down, onDown, onUp, aria, testId }: { cx: number; cy: number; r: number; label: string; down: boolean; onDown(): void; onUp(): void; aria: string; testId: string }) {
  const h = useHold(onDown, onUp)
  return (
    <g className={`mk-btn-svg${down ? ' down' : ''}`} role="button" tabIndex={0} aria-label={aria} aria-pressed={down} data-testid={testId} {...h}>
      <circle cx={cx} cy={cy + 4} r={r} className="mk-btn-shadow" />
      <circle cx={cx} cy={cy + (down ? 3 : 0)} r={r} className="mk-btn-face" />
      <text x={cx} y={cy + (down ? 3 : 0) + 6} textAnchor="middle" className="mk-btn-text">{label}</text>
    </g>
  )
}

export function Board({ device, tick, title, onButton, onLogo, onPin, compact }: BoardProps) {
  void tick
  const f = device.frame()
  const tone = device.toneNow()
  const pinKeys: PinName[] = ['P0', 'P1', 'P2']
  const abDown = device.isPressed('AB')
  const logoHold = useHold(() => onLogo(true), () => onLogo(false))
  const abHold = useHold(() => onButton('AB', true), () => onButton('AB', false))
  return (
    <svg className={`mk-board${compact ? ' compact' : ''}`} viewBox="0 0 320 346" role="group" aria-label={title} data-testid={`mikro-board-${device.id}`}>
      <defs>
        <linearGradient id={`mkg-body-${device.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <filter id={`mkg-glow-${device.id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* gövde */}
      <rect x="8" y="8" width="304" height="330" rx="30" fill={`url(#mkg-body-${device.id})`} />
      <rect x="8" y="8" width="304" height="330" rx="30" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
      <circle cx="30" cy="30" r="5" className="mk-hole" /><circle cx="290" cy="30" r="5" className="mk-hole" />
      <text x="160" y="22" textAnchor="middle" className="mk-board-title">{title}</text>

      {/* dokunmatik logo (yıldız) */}
      <g className={`mk-logo${device.logo ? ' down' : ''}`} role="button" tabIndex={0} aria-label="Dokunmatik logo" aria-pressed={device.logo} data-testid={`mikro-logo-${device.id}`} {...logoHold}>
        <rect x="132" y="28" width="56" height="26" rx="13" className="mk-logo-pad" />
        <polygon points="160,32 163,40 172,40 165,45 168,52 160,47 152,52 155,45 148,40 157,40" className="mk-logo-star" />
      </g>
      {tone > 0 && <text x="262" y="48" className="mk-note" aria-hidden="true">♪</text>}

      {/* LED matrisi */}
      <rect x={MX - 14} y={MY - 12} width={5 * CELL + 4 * GAP + 28} height={5 * CELL + 4 * GAP + 24} rx="18" className="mk-plate" />
      <g aria-label="LED ekranı" role="img" data-testid={`mikro-leds-${device.id}`} data-pattern={device.pattern()}>
        {Array.from({ length: 25 }, (_, i) => {
          const v = f[i]
          const x = MX + (i % 5) * (CELL + GAP), y = MY + Math.floor(i / 5) * (CELL + GAP)
          return (
            <g key={i}>
              <rect x={x} y={y} width={CELL} height={CELL} rx="7" className="mk-led-off" />
              {v > 0 && <rect x={x} y={y} width={CELL} height={CELL} rx="7" className="mk-led-on" opacity={0.25 + 0.75 * (v / 255)} filter={v > 120 ? `url(#mkg-glow-${device.id})` : undefined} />}
            </g>
          )
        })}
      </g>

      {/* düğmeler */}
      <Btn cx={38} cy={162} r={24} label="A" down={device.btn.A} aria="A düğmesi" testId={`mikro-btn-A-${device.id}`} onDown={() => onButton('A', true)} onUp={() => onButton('A', false)} />
      <Btn cx={282} cy={162} r={24} label="B" down={device.btn.B} aria="B düğmesi" testId={`mikro-btn-B-${device.id}`} onDown={() => onButton('B', true)} onUp={() => onButton('B', false)} />
      <g className={`mk-ab${abDown ? ' down' : ''}`} role="button" tabIndex={0} aria-label="A ve B birlikte" aria-pressed={abDown} data-testid={`mikro-btn-AB-${device.id}`} {...abHold}>
        <rect x="124" y="272" width="72" height="26" rx="13" className="mk-ab-face" />
        <text x="160" y="290" textAnchor="middle" className="mk-btn-text small">A+B</text>
      </g>

      {/* pinler */}
      {pinKeys.map((p, i) => {
        const x = 64 + i * 96
        return <Pin key={p} x={x} pin={p} device={device} onPin={onPin} />
      })}
    </svg>
  )
}

function Pin({ x, pin, device, onPin }: { x: number; pin: PinName; device: Device; onPin(p: PinName, down: boolean): void }) {
  const h = useHold(() => onPin(pin, true), () => onPin(pin, false))
  const s = device.pins[pin]
  const out = s.out
  return (
    <g className={`mk-pin${s.touch ? ' down' : ''}`} role="button" tabIndex={0} aria-label={`${pin} pini (dokun)`} aria-pressed={s.touch} data-testid={`mikro-pin-${pin}-${device.id}`} {...h}>
      <rect x={x - 22} y="300" width="44" height="30" rx="8" className="mk-pin-pad" />
      <text x={x} y="320" textAnchor="middle" className="mk-pin-text">{pin.slice(1)}</text>
      {out && <circle cx={x + 18} cy={304} r="5" className={`mk-pin-out${out.mode === 'digital' && !out.value ? ' off' : ''}`} />}
    </g>
  )
}

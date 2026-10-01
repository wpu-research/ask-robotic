import type { PartInstance, PartRuntime, PartType, PinSnapshot } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { BAND_COLORS, resistorBands } from '@/lib/lab/ops'

export const LED_COLORS: Record<string, string> = { red: '#ef4444', yellow: '#facc15', green: '#22c55e', blue: '#3b82f6', white: '#f1f5f9' }
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const METAL = '#b8c0cc'

const UNO_TOP = ['GND2', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0']
const UNO_BOTTOM = ['3V3', '5V', 'GND', 'GND3', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5']
const unoLabel = (p: string) => (p === 'GND2' || p === 'GND3' ? 'GND' : p)

function Leg({ x1, y1, x2, y2, c = METAL }: { x1: number; y1: number; x2: number; y2: number; c?: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2.4} strokeLinecap="round" />
}

function UnoArt({ pins }: { pins?: Record<string, PinSnapshot> }) {
  const d = PART_DEFS.uno.pins
  const lOn = pins?.D13?.high === true && pins.D13.mode === 'out'
  return (
    <g>
      {/* kart (mavi PCB) */}
      <rect x={0} y={0} width={290} height={150} rx={8} fill="#1b5fa8" stroke="#0f3d73" strokeWidth={2} />
      <rect x={3} y={3} width={284} height={144} rx={6} fill="none" stroke="#3b82c4" strokeWidth={0.8} opacity={0.7} />
      {[[8, 8], [8, 142], [282, 8], [282, 142], [200, 80]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.2} fill="#0b2c55" stroke="#9db8d6" strokeWidth={0.8} />)}
      {/* USB-B soket (gümüş) */}
      <rect x={-12} y={34} width={46} height={40} rx={3} fill="#cfd6df" stroke="#7b8794" strokeWidth={1.4} />
      <rect x={-8} y={40} width={30} height={28} rx={2} fill="#9aa5b1" stroke="#6b7684" />
      <rect x={-4} y={47} width={20} height={14} fill="#4b5563" />
      {/* güç jakı (siyah) */}
      <rect x={-10} y={88} width={42} height={36} rx={3} fill="#1f2937" stroke="#111827" strokeWidth={1.4} />
      <rect x={-4} y={96} width={18} height={20} rx={2} fill="#0b1220" />
      <circle cx={6} cy={106} r={4} fill="#374151" />
      {/* sıfırlama düğmesi (kırmızı) */}
      <rect x={40} y={34} width={22} height={22} rx={3} fill="#9ca3af" stroke="#4b5563" />
      <circle cx={51} cy={45} r={7} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.2} />
      <text x={51} y={67} textAnchor="middle" fontSize={5} fill="#dbeafe">SIFIRLA</text>
      {/* ATmega328P (siyah çip) */}
      <rect x={96} y={52} width={92} height={24} rx={2} fill="#111827" stroke="#030712" />
      <path d="M96 58 a4 4 0 0 1 0 12" fill="#030712" />
      {Array.from({ length: 14 }, (_, i) => <g key={i}><rect x={101 + i * 6} y={49} width={3} height={4} fill={METAL} /><rect x={101 + i * 6} y={75} width={3} height={4} fill={METAL} /></g>)}
      <text x={142} y={67} textAnchor="middle" fontSize={7} fill="#9ca3af" fontWeight={700}>ATmega328P</text>
      {/* kristal */}
      <rect x={62} y={90} width={34} height={14} rx={7} fill={METAL} stroke="#6b7684" />
      {/* durum LED'leri: ON, L(D13), TX, RX */}
      <rect x={200} y={96} width={7} height={4} fill="#16a34a" /><text x={203.5} y={108} textAnchor="middle" fontSize={5} fill="#dbeafe">ON</text>
      <rect x={214} y={96} width={7} height={4} fill={lOn ? '#fb923c' : '#9a5a2a'} data-uno-l={lOn ? 'on' : 'off'} /><text x={217.5} y={108} textAnchor="middle" fontSize={5} fill="#dbeafe">L</text>
      {lOn && <circle cx={217.5} cy={98} r={9} fill="#fb923c" opacity={0.45} filter="url(#lab-glow)" />}
      <rect x={228} y={96} width={7} height={4} fill="#9a7b2a" /><text x={231.5} y={108} textAnchor="middle" fontSize={5} fill="#dbeafe">TX</text>
      <rect x={242} y={96} width={7} height={4} fill="#9a7b2a" /><text x={245.5} y={108} textAnchor="middle" fontSize={5} fill="#dbeafe">RX</text>
      <text x={150} y={96} textAnchor="middle" fontSize={15} fontWeight={900} fill="#e0f2fe" letterSpacing={3}>UNO</text>
      {/* pin başlıkları */}
      <rect x={28} y={4} width={246} height={16} rx={2} fill="#0b1220" />
      <rect x={52} y={130} width={82} height={16} rx={2} fill="#0b1220" />
      <rect x={156} y={130} width={96} height={16} rx={2} fill="#0b1220" />
      {UNO_TOP.map((p) => <text key={p} x={d[p].x} y={30} textAnchor="middle" fontSize={5.6} fill="#e0f2fe">{unoLabel(p)}</text>)}
      {UNO_BOTTOM.map((p) => <text key={p} x={d[p].x} y={124} textAnchor="middle" fontSize={5.6} fill="#e0f2fe">{unoLabel(p)}</text>)}
      <text x={200} y={43} textAnchor="middle" fontSize={5.6} fontWeight={700} fill="#bae6fd">SAYISAL (PWM ~)</text>
      <text x={208} y={116} textAnchor="middle" fontSize={5.6} fontWeight={700} fill="#bae6fd">ANALOG GİRİŞ</text>
      <text x={92} y={116} textAnchor="middle" fontSize={5.6} fontWeight={700} fill="#bae6fd">GÜÇ</text>
    </g>
  )
}

function LedArt({ part, rt }: { part: PartInstance; rt?: PartRuntime }) {
  const color = LED_COLORS[String(part.props.color)] ?? LED_COLORS.red
  const led = rt?.led
  const burnt = led?.burnt === true
  const b = burnt ? 0 : clamp01(led?.brightness ?? 0)
  return (
    <g data-led={part.id} data-brightness={b.toFixed(2)} data-burnt={burnt ? 'true' : 'false'}>
      {/* bacaklar: uzun anot (A, bükülmüş) ve kısa katot (K) */}
      <path d="M12 38 V44 L10 48 V60" fill="none" stroke={METAL} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={28} y1={38} x2={28} y2={60} stroke={METAL} strokeWidth={2.4} strokeLinecap="round" />
      {b > 0.02 && <circle data-halo cx={20} cy={22} r={30} fill={color} opacity={0.15 + b * 0.55} filter="url(#lab-glow)" />}
      {/* şeffaf kapak */}
      <path d="M4 38 V22 a16 16 0 0 1 32 0 V38 Z" fill={burnt ? '#374151' : color} fillOpacity={burnt ? 0.95 : 0.22 + 0.7 * b} stroke={burnt ? '#111827' : color} strokeWidth={1.5} />
      {/* iç elektrotlar */}
      <path d="M14 36 V20 h12 V36" fill="none" stroke={burnt ? '#6b7280' : '#9ca3af'} strokeWidth={1.6} opacity={0.85} />
      <rect x={16} y={14} width={8} height={5} fill={burnt ? '#4b5563' : '#d1d5db'} opacity={0.9} />
      <rect x={2} y={36} width={36} height={4} rx={1.5} fill={burnt ? '#1f2937' : color} fillOpacity={0.55} stroke={burnt ? '#111827' : color} strokeWidth={0.8} />
      <path d="M36 28 V38" stroke="#fff" strokeOpacity={0.5} strokeWidth={1} />
      {/* parlama */}
      <ellipse cx={13} cy={14} rx={3} ry={6} fill="#fff" opacity={0.3 + 0.4 * b} />
      {burnt && <g stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" aria-label="Yanmış LED"><line x1={12} y1={12} x2={28} y2={28} /><line x1={28} y1={12} x2={12} y2={28} /></g>}
    </g>
  )
}

function ResistorArt({ part }: { part: PartInstance }) {
  const bands = resistorBands(num(part.props.ohms, 330))
  const xs = [24, 32, 40, 53]
  return (
    <g>
      <Leg x1={4} y1={12} x2={76} y2={12} />
      <rect x={14} y={5} width={52} height={14} rx={6} fill="#e4c98f" stroke="#a8956a" />
      {bands.map((b, i) => <rect key={i} x={xs[i]} y={5} width={4.6} height={14} fill={BAND_COLORS[b]} stroke={b === 'white' || b === 'silver' ? '#94a3b8' : undefined} strokeWidth={0.4} />)}
      <rect x={16} y={5.5} width={48} height={3.2} rx={1.6} fill="#fff" opacity={0.25} />
    </g>
  )
}

function ButtonArt({ part }: { part: PartInstance }) {
  const down = part.props.pressed === true
  return (
    <g data-pressed={down ? 'true' : 'false'}>
      {/* 4 bacak: soldaki ikisi A'ya, sağdaki ikisi B'ye */}
      <path d="M4 14 H10 M4 36 H10 M4 14 V36" fill="none" stroke={METAL} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M46 14 H40 M46 36 H40 M46 14 V36" fill="none" stroke={METAL} strokeWidth={2.4} strokeLinecap="round" />
      <rect x={9} y={7} width={32} height={36} rx={4} fill="#1f2937" stroke="#030712" strokeWidth={1.5} />
      <rect x={13} y={11} width={24} height={28} rx={3} fill="#374151" />
      {[[11.5, 9.5], [38.5, 9.5], [11.5, 40.5], [38.5, 40.5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.1} fill="#9ca3af" />)}
      <circle data-button-cap cx={25} cy={25} r={down ? 9.5 : 11} fill={down ? '#1d4ed8' : '#2563eb'} stroke="#1e3a8a" strokeWidth={1.5} />
      <circle cx={22} cy={22} r={3.5} fill="#fff" opacity={down ? 0.15 : 0.35} />
    </g>
  )
}

function PotArt({ part }: { part: PartInstance }) {
  const pos = clamp01(num(part.props.position, 0.5))
  const ang = -135 + pos * 270
  return (
    <g>
      <Leg x1={10} y1={48} x2={10} y2={66} /><Leg x1={30} y1={54} x2={30} y2={66} /><Leg x1={50} y1={48} x2={50} y2={66} />
      <rect x={4} y={4} width={52} height={50} rx={7} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={1.6} />
      <rect x={8} y={8} width={44} height={42} rx={5} fill="#2563eb" opacity={0.6} />
      {Array.from({ length: 9 }, (_, i) => { const a = ((-135 + i * 33.75) * Math.PI) / 180; return <line key={i} x1={30 + Math.sin(a) * 21} y1={29 - Math.cos(a) * 21} x2={30 + Math.sin(a) * 24} y2={29 - Math.cos(a) * 24} stroke="#bfdbfe" strokeWidth={1.2} /> })}
      <g transform={`rotate(${ang} 30 29)`} data-knob-angle={ang.toFixed(0)}>
        <circle cx={30} cy={29} r={17} fill="#e5e7eb" stroke="#6b7280" strokeWidth={1.5} />
        <circle cx={30} cy={29} r={12} fill="#f3f4f6" stroke="#9ca3af" />
        <rect x={28.4} y={13} width={3.2} height={14} rx={1.6} fill="#1e293b" />
      </g>
    </g>
  )
}

function LdrArt({ part }: { part: PartInstance }) {
  const light = clamp01(num(part.props.light, 0.5))
  return (
    <g>
      <Leg x1={4} y1={16} x2={22} y2={20} /><Leg x1={56} y1={16} x2={38} y2={20} />
      <circle cx={30} cy={15} r={14.5} fill="#e5e7eb" stroke="#9ca3af" strokeWidth={1.2} />
      <circle cx={30} cy={15} r={12} fill="#b9451d" fillOpacity={0.55 + 0.45 * light} stroke="#7c2d12" strokeWidth={1} />
      <path d="M21 9 h18 M21 12.5 h18 M21 16 h18 M21 19.5 h18 M21 23 h18" stroke="#fcd9a8" strokeWidth={1.1} opacity={0.85} />
      <path d="M21 9 h18 v3.5 h-18 v3.5 h18 v3.5 h-18 v3.5 h18" fill="none" stroke="#fbbf24" strokeWidth={1.2} />
      <circle cx={25} cy={9} r={3} fill="#fff" opacity={0.12 + 0.2 * light} />
    </g>
  )
}

function NtcArt({ part }: { part: PartInstance }) {
  const t = num(part.props.tempC, 25)
  const hot = clamp01((t + 20) / 140)
  return (
    <g>
      <path d="M26 24 Q12 28 4 16" fill="none" stroke={METAL} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M34 24 Q48 28 56 16" fill="none" stroke={METAL} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M30 1 C37 1 43 9 43 17 C43 25 37 29 30 29 C23 29 17 25 17 17 C17 9 23 1 30 1 Z" fill={`color-mix(in srgb, #ef4444 ${Math.round(hot * 75)}%, #1e3a8a)`} stroke="#0f172a" strokeWidth={1.4} />
      <ellipse cx={25} cy={10} rx={3} ry={5} fill="#fff" opacity={0.3} />
      <text x={30} y={20} textAnchor="middle" fontSize={6.5} fontWeight={800} fill="#e2e8f0">NTC</text>
    </g>
  )
}

function BuzzerArt({ part, rt }: { part: PartInstance; rt?: PartRuntime }) {
  const on = rt?.buzzer?.on === true
  const active = part.props.kind === 'active'
  return (
    <g data-buzzer-on={on ? 'true' : 'false'}>
      <Leg x1={14} y1={46} x2={14} y2={60} /><Leg x1={36} y1={46} x2={36} y2={60} />
      <circle cx={25} cy={26} r={23} fill="#0b0f19" stroke="#1f2937" strokeWidth={2} />
      <circle cx={25} cy={26} r={18} fill="#111827" stroke="#374151" strokeWidth={1} />
      <circle cx={25} cy={26} r={4.5} fill="#030712" stroke="#4b5563" />
      {active && <rect x={14} y={14} width={12} height={6} rx={1} fill="#e5e7eb" opacity={0.85} />}
      <text x={10} y={13} fontSize={9} fontWeight={800} fill="#e5e7eb">+</text>
      <ellipse cx={17} cy={14} rx={4} ry={2.5} fill="#fff" opacity={0.18} transform="rotate(-30 17 14)" />
      {on && <g fill="none" stroke="#facc15" strokeWidth={2} strokeLinecap="round"><path d="M51 18 q5 8 0 16" /><path d="M57 12 q9 14 0 28" /></g>}
    </g>
  )
}

function RgbArt({ rt }: { part: PartInstance; rt?: PartRuntime }) {
  const c = rt?.rgbled ?? { r: 0, g: 0, b: 0 }
  const lit = Math.max(c.r, c.g, c.b)
  const col = `rgb(${Math.round(clamp01(c.r) * 255)} ${Math.round(clamp01(c.g) * 255)} ${Math.round(clamp01(c.b) * 255)})`
  return (
    <g data-rgb={lit > 0.02 ? col : 'off'}>
      {[10, 24, 38].map((x) => <Leg key={x} x1={x} y1={38} x2={x} y2={66} />)}
      <Leg x1={52} y1={38} x2={52} y2={66} />
      {lit > 0.02 && <circle cx={31} cy={22} r={32} fill={col} opacity={0.2 + lit * 0.5} filter="url(#lab-glow)" />}
      <path d="M12 38 V22 a19 19 0 0 1 38 0 V38 Z" fill={lit > 0.02 ? col : '#e2e8f0'} fillOpacity={lit > 0.02 ? 0.45 + 0.5 * lit : 0.3} stroke="#64748b" strokeWidth={1.5} />
      <rect x={18} y={14} width={5} height={8} fill="#ef4444" opacity={0.75} /><rect x={28} y={14} width={5} height={8} fill="#22c55e" opacity={0.75} /><rect x={38} y={14} width={5} height={8} fill="#3b82f6" opacity={0.75} />
      <rect x={9} y={36} width={44} height={4} rx={1.5} fill="#94a3b8" />
      <ellipse cx={20} cy={13} rx={3} ry={6} fill="#fff" opacity={0.35} />
    </g>
  )
}

function ServoArt({ rt }: { part: PartInstance; rt?: PartRuntime }) {
  const a = rt?.servo?.angleDeg ?? 90
  return (
    <g data-servo-angle={a.toFixed(0)}>
      {/* üç telli kablo */}
      <Leg x1={4} y1={16} x2={18} y2={16} c="#f59e0b" /><Leg x1={4} y1={32} x2={18} y2={32} c="#ef4444" /><Leg x1={4} y1={48} x2={18} y2={48} c="#78350f" />
      {/* kulaklar */}
      <rect x={16} y={26} width={72} height={12} rx={2} fill="#1e40af" stroke="#1e3a8a" />
      <circle cx={20} cy={32} r={2.2} fill="#0b1b4a" /><circle cx={84} cy={32} r={2.2} fill="#0b1b4a" />
      {/* gövde */}
      <rect x={24} y={12} width={52} height={40} rx={4} fill="#2563eb" stroke="#1e3a8a" strokeWidth={1.5} />
      <rect x={28} y={16} width={30} height={14} rx={2} fill="#1d4ed8" />
      <text x={43} y={26} textAnchor="middle" fontSize={7} fontWeight={800} fill="#dbeafe">SERVO</text>
      {/* mil + kol */}
      <circle cx={76} cy={32} r={7} fill="#e5e7eb" stroke="#4b5563" />
      <g transform={`rotate(${-a} 76 32)`}>
        <path d="M76 28 H96 a3.4 3.4 0 0 1 0 8 H76 Z" fill="#f8fafc" stroke="#4b5563" strokeWidth={1} />
        {[82, 88, 94].map((x) => <circle key={x} cx={x} cy={32} r={1.2} fill="#475569" />)}
      </g>
      <circle cx={76} cy={32} r={2.4} fill="#475569" />
    </g>
  )
}

export function PartArt({ part, runtime, pins }: { part: PartInstance; runtime?: PartRuntime; pins?: Record<string, PinSnapshot> }) {
  switch (part.type) {
    case 'uno': return <UnoArt pins={pins} />
    case 'led': return <LedArt part={part} rt={runtime} />
    case 'resistor': return <ResistorArt part={part} />
    case 'button': return <ButtonArt part={part} />
    case 'pot': return <PotArt part={part} />
    case 'ldr': return <LdrArt part={part} />
    case 'ntc': return <NtcArt part={part} />
    case 'buzzer': return <BuzzerArt part={part} rt={runtime} />
    case 'rgbled': return <RgbArt part={part} rt={runtime} />
    case 'servo': return <ServoArt part={part} rt={runtime} />
  }
}

/** Paletteki küçük simge. */
export function PartIcon({ type, size = 44 }: { type: PartType; size?: number }) {
  const d = PART_DEFS[type]
  const part: PartInstance = { id: 'icon', type, x: 0, y: 0, rotation: 0, props: {} }
  const pad = type === 'uno' ? 14 : 4
  return (
    <svg viewBox={`${-pad} ${-pad} ${d.w + 2 * pad} ${d.h + 2 * pad}`} width={size} height={size * 0.9} aria-hidden="true" focusable="false">
      <PartArt part={part} />
    </svg>
  )
}

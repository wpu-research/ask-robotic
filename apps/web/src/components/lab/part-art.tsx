import type { PartInstance, PartRuntime, PartType, PinSnapshot } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { BAND_COLORS, resistorBands } from '@/lib/lab/ops'
import { StageCArt } from './part-art-c'

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

// ---- Aşama B parçaları ----

function DiodeArt() {
  return (
    <g>
      <Leg x1={4} y1={12} x2={76} y2={12} />
      <rect x={20} y={5} width={40} height={14} rx={3} fill="#111827" stroke="#030712" />
      <rect x={50} y={5} width={5} height={14} fill="#d5dbe3" stroke="#94a3b8" strokeWidth={0.4} />
      <text x={34} y={14.5} textAnchor="middle" fontSize={5.4} fontWeight={700} fill="#9ca3af">1N4007</text>
      <rect x={22} y={6} width={26} height={2.6} rx={1.3} fill="#fff" opacity={0.18} />
    </g>
  )
}

function NpnArt() {
  return (
    <g>
      {[12, 27, 42].map((x) => <Leg key={x} x1={x} y1={38} x2={x} y2={72} />)}
      <path d="M7 40 V28 a20 20 0 0 1 40 0 V40 Z" fill="#111827" stroke="#030712" strokeWidth={1.4} />
      <path d="M7 40 H47" stroke="#374151" strokeWidth={1.6} />
      <path d="M12 27 a15 15 0 0 1 12-14" fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2} strokeLinecap="round" />
      <text x={27} y={32} textAnchor="middle" fontSize={6.4} fontWeight={800} fill="#cbd5e1">2N2222</text>
      <text x={27} y={24} textAnchor="middle" fontSize={5} fill="#64748b">NPN</text>
    </g>
  )
}

function MosfetArt() {
  return (
    <g>
      {[17, 35, 53].map((x) => <Leg key={x} x1={x} y1={78} x2={x} y2={96} />)}
      {/* metal tırnak + montaj deliği */}
      <rect x={8} y={2} width={54} height={34} rx={3} fill={METAL} stroke="#6b7684" strokeWidth={1.2} />
      <rect x={8} y={2} width={54} height={8} rx={3} fill="#e5e9ee" opacity={0.7} />
      <circle cx={35} cy={16} r={5.2} fill="#1f2937" stroke="#6b7684" />
      {/* siyah gövde */}
      <rect x={8} y={36} width={54} height={42} rx={2} fill="#111827" stroke="#030712" strokeWidth={1.4} />
      <rect x={10} y={38} width={50} height={4} fill="#fff" opacity={0.12} />
      <text x={35} y={55} textAnchor="middle" fontSize={7.6} fontWeight={800} fill="#cbd5e1">IRLZ44N</text>
      <text x={35} y={66} textAnchor="middle" fontSize={5} fill="#64748b">N-MOSFET</text>
    </g>
  )
}

function MotorArt({ rt }: { rt?: PartRuntime }) {
  const raw = rt?.dcmotor?.speed
  const s = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(-1, Math.min(1, raw)) : 0
  const spinning = Math.abs(s) > 0.02
  const dur = Math.min(6, Math.max(0.22, 0.28 / Math.abs(s || 1)))
  return (
    <g data-motor-speed={s.toFixed(2)} data-motor-spinning={spinning ? 'true' : 'false'}>
      {/* arka kontaklar */}
      <rect x={6} y={18} width={12} height={8} rx={1.5} fill="#d97706" stroke="#7c2d12" strokeWidth={0.8} />
      <rect x={6} y={38} width={12} height={8} rx={1.5} fill="#d97706" stroke="#7c2d12" strokeWidth={0.8} />
      <circle cx={8.5} cy={22} r={1.4} fill="#7c2d12" /><circle cx={8.5} cy={42} r={1.4} fill="#7c2d12" />
      {/* silindir gövde */}
      <rect x={16} y={8} width={72} height={48} rx={8} fill="#aeb7c3" stroke="#6b7684" strokeWidth={1.6} />
      <rect x={20} y={11} width={64} height={9} rx={4} fill="#fff" opacity={0.4} />
      <rect x={20} y={46} width={64} height={7} rx={3} fill="#475569" opacity={0.28} />
      <path d="M32 8 V56 M72 8 V56" stroke="#7b8794" strokeWidth={0.8} opacity={0.7} />
      <text x={52} y={37} textAnchor="middle" fontSize={8.5} fontWeight={800} fill="#334155">DC MOTOR</text>
      <text x={52} y={46} textAnchor="middle" fontSize={5} fill="#475569">3-6 V</text>
      {/* ön kapak + yatak + mil */}
      <rect x={88} y={14} width={8} height={36} rx={2} fill="#7b8794" stroke="#475569" />
      <rect x={96} y={27} width={14} height={10} rx={1} fill="#94a3b8" stroke="#475569" strokeWidth={0.8} />
      <line x1={96} y1={32} x2={112} y2={32} stroke="#e5e7eb" strokeWidth={3} strokeLinecap="round" />
      {/* pervane: merkez (112,32); dönen grup orijinde, simetrik */}
      <g transform="translate(112 32)">
        <g className={spinning ? 'lab-spin' : undefined} data-spin={spinning ? 'true' : 'false'}
          style={spinning ? { animationDuration: `${dur.toFixed(2)}s`, animationDirection: s < 0 ? 'reverse' : 'normal' } : { transform: 'rotate(24deg)' }}>
          {spinning && Math.abs(s) > 0.55 && <circle r={17} fill="#38bdf8" opacity={0.16} />}
          <ellipse cx={9.5} cy={0} rx={9} ry={3.6} fill="#ef4444" stroke="#7f1d1d" strokeWidth={0.8} />
          <ellipse cx={-9.5} cy={0} rx={9} ry={3.6} fill="#ef4444" stroke="#7f1d1d" strokeWidth={0.8} />
          <ellipse cy={9.5} rx={3.6} ry={9} fill="#f97316" stroke="#7c2d12" strokeWidth={0.8} opacity={0.9} />
          <ellipse cy={-9.5} rx={3.6} ry={9} fill="#f97316" stroke="#7c2d12" strokeWidth={0.8} opacity={0.9} />
        </g>
        <circle r={3.4} fill="#e5e7eb" stroke="#475569" />
      </g>
      {spinning && <text x={112} y={60} textAnchor="middle" fontSize={7} fontWeight={800} fill="#0ea5e9">{s > 0 ? '↻' : '↺'} %{Math.round(Math.abs(s) * 100)}</text>}
    </g>
  )
}

interface DipSlot { n: string; dummy?: boolean }
const dipX = (i: number) => 14 + i * 16

function DipChip({ w, h, top, bottom, title, notchY, children }: { w: number; h: number; top: (DipSlot | null)[]; bottom: (DipSlot | null)[]; title: string; notchY?: number; children?: React.ReactNode }) {
  const y0 = 16, y1 = h - 16
  const leg = (slots: (DipSlot | null)[], isTop: boolean) => slots.map((s, i) => s && (
    <g key={`${isTop ? 't' : 'b'}${i}`}>
      <rect x={dipX(i) - 2} y={isTop ? 2 : y1 - 1} width={4} height={isTop ? y0 - 1 : h - y1 - 1} rx={1} fill={METAL} stroke="#6b7684" strokeWidth={0.5} opacity={s.dummy ? 0.55 : 1} />
      <text x={dipX(i)} y={isTop ? y0 + 9 : y1 - 4} textAnchor="middle" fontSize={5.4} fontWeight={700} fill="#e2e8f0" opacity={s.dummy ? 0.45 : 0.95}>{s.n === 'QH_' ? "QH'" : s.n}</text>
    </g>
  ))
  const m = notchY ?? (y0 + y1) / 2
  return (
    <g>
      {leg(top, true)}{leg(bottom, false)}
      <rect x={4} y={y0} width={w - 8} height={y1 - y0} rx={3} fill="#111827" stroke="#030712" strokeWidth={1.4} />
      <rect x={6} y={y0 + 1.5} width={w - 12} height={3} rx={1.5} fill="#fff" opacity={0.1} />
      <path d={`M4 ${m - 5} a5 5 0 0 1 0 10 Z`} fill="#030712" />
      <circle cx={13} cy={y1 - 11} r={1.6} fill="#374151" />
      <text x={w / 2} y={(y0 + y1) / 2 - (children ? 10 : -2)} textAnchor="middle" fontSize={9} fontWeight={800} fill="#94a3b8" letterSpacing={0.5}>{title}</text>
      {children}
    </g>
  )
}

function L293dArt() {
  const t: (DipSlot | null)[] = [{ n: 'VCC1' }, { n: 'IN4' }, { n: 'OUT4' }, { n: 'GND', dummy: true }, { n: 'GND', dummy: true }, { n: 'OUT3' }, { n: 'IN3' }, { n: 'EN34' }]
  const b: (DipSlot | null)[] = [{ n: 'EN12' }, { n: 'IN1' }, { n: 'OUT1' }, { n: 'GND' }, { n: 'GND', dummy: true }, { n: 'OUT2' }, { n: 'IN2' }, { n: 'VCC2' }]
  return <DipChip w={140} h={76} top={t} bottom={b} title="L293D" />
}

function Sr595Art({ rt }: { rt?: PartRuntime }) {
  const out = rt?.sr595?.outputs
  const t: DipSlot[] = ['VCC', 'QA', 'SER', 'OE', 'RCLK', 'SRCLK', 'SRCLR', 'QH_'].map((n) => ({ n }))
  const b: DipSlot[] = ['QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH', 'GND'].map((n) => ({ n }))
  const letters = 'ABCDEFGH'
  return (
    <DipChip w={140} h={100} top={t} bottom={b} title="74HC595">
      {/* çip üstünde 8 çıkış göstergesi (QA..QH) */}
      {Array.from({ length: 8 }, (_, i) => {
        const on = Array.isArray(out) && out[i] === true
        const x = 22 + i * 13.7
        return (
          <g key={i} data-sr-led={i} data-on={on ? 'true' : 'false'}>
            {on && <circle cx={x} cy={56} r={7} fill="#4ade80" opacity={0.55} filter="url(#lab-glow-s)" />}
            <circle cx={x} cy={56} r={3.6} fill={on ? '#4ade80' : '#1f2937'} stroke={on ? '#bbf7d0' : '#475569'} strokeWidth={0.8} />
            <text x={x} y={66} textAnchor="middle" fontSize={4.6} fill="#94a3b8">{letters[i]}</text>
          </g>
        )
      })}
    </DipChip>
  )
}

function RelayArt({ part, rt }: { part: PartInstance; rt?: PartRuntime }) {
  const on = rt?.relay?.energized === true
  const low = part.props.trigger === 'low'
  return (
    <g data-relay-energized={on ? 'true' : 'false'}>
      {/* kart */}
      <rect x={0} y={0} width={150} height={96} rx={5} fill="#b91c1c" stroke="#7f1d1d" strokeWidth={1.6} />
      <rect x={3} y={3} width={144} height={90} rx={4} fill="none" stroke="#ef4444" strokeWidth={0.7} opacity={0.6} />
      {[[10, 8], [10, 88], [100, 8]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#450a0a" stroke="#fca5a5" strokeWidth={0.7} />)}
      {/* başlık: VCC GND IN */}
      <rect x={0} y={14} width={12} height={60} rx={2} fill="#111827" stroke="#030712" />
      {[24, 44, 64].map((y) => <circle key={y} cx={5} cy={y} r={2.4} fill="#d4a017" stroke="#7c5a00" strokeWidth={0.6} />)}
      <text x={18} y={26} fontSize={5.4} fontWeight={700} fill="#fee2e2">VCC</text>
      <text x={18} y={46} fontSize={5.4} fontWeight={700} fill="#fee2e2">GND</text>
      <text x={18} y={66} fontSize={5.4} fontWeight={700} fill="#fee2e2">IN{low ? ' (LOW)' : ''}</text>
      {/* mavi röle küpü */}
      <rect x={36} y={8} width={64} height={54} rx={3} fill="#1d6fd6" stroke="#174ea6" strokeWidth={1.4} />
      <rect x={38} y={10} width={60} height={9} rx={2} fill="#fff" opacity={0.2} />
      <text x={68} y={30} textAnchor="middle" fontSize={7} fontWeight={800} fill="#dbeafe">SRD-05VDC</text>
      <text x={68} y={39} textAnchor="middle" fontSize={5.2} fill="#bfdbfe">10A 250VAC</text>
      <text x={68} y={47} textAnchor="middle" fontSize={5.2} fill="#bfdbfe">10A 30VDC</text>
      <text x={68} y={56} textAnchor="middle" fontSize={5.2} fill="#bfdbfe">5 V RÖLE</text>
      {/* vidalı terminal bloğu: NO / COM / NC */}
      <rect x={108} y={11} width={40} height={74} rx={3} fill="#15803d" stroke="#14532d" strokeWidth={1.2} />
      {[24, 48, 72].map((y) => (
        <g key={y}>
          <circle cx={124} cy={y} r={7.5} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
          <path d={`M119.5 ${y - 1.5} L128.5 ${y + 1.5}`} stroke="#475569" strokeWidth={1.6} strokeLinecap="round" />
          <rect x={137} y={y - 5} width={10} height={10} rx={1.5} fill="#052e16" opacity={0.8} />
        </g>
      ))}
      {/* kontak şeması: COM → NO (çekili) ya da NC (bırakılmış) */}
      <rect x={36} y={66} width={66} height={25} rx={3} fill="#1f2937" stroke="#030712" />
      <circle cx={46} cy={79} r={2.6} fill="#fbbf24" />
      <text x={46} y={89.5} textAnchor="middle" fontSize={4.6} fill="#e5e7eb">COM</text>
      <circle cx={92} cy={72} r={2.4} fill={on ? '#4ade80' : '#6b7280'} /><text x={97} y={74} fontSize={4.6} fill="#e5e7eb">NO</text>
      <circle cx={92} cy={86} r={2.4} fill={on ? '#6b7280' : '#4ade80'} /><text x={97} y={88} fontSize={4.6} fill="#e5e7eb">NC</text>
      <g transform="translate(46 79)">
        <g data-relay-arm={on ? 'no' : 'nc'} style={{ transform: `rotate(${on ? -8.6 : 8.6}deg)`, transition: 'transform 70ms cubic-bezier(.3,1.6,.5,1)' }}>
          <line x1={0} y1={0} x2={46} y2={0} stroke="#f8fafc" strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
      {/* durum LED'i */}
      {on && <circle cx={26} cy={84} r={9} fill="#ef4444" opacity={0.7} filter="url(#lab-glow-s)" />}
      <circle data-relay-led={on ? 'on' : 'off'} cx={26} cy={84} r={3.6} fill={on ? '#ff3b3b' : '#7f1d1d'} stroke="#450a0a" strokeWidth={0.8} />
      <text x={26} y={76} textAnchor="middle" fontSize={4.6} fill="#fee2e2">LED</text>
    </g>
  )
}

const hs = (x1: number, x2: number, y: number, t: number) => `${x1},${y} ${x1 + t / 2},${y - t / 2} ${x2 - t / 2},${y - t / 2} ${x2},${y} ${x2 - t / 2},${y + t / 2} ${x1 + t / 2},${y + t / 2}`
const vs = (x: number, y1: number, y2: number, t: number) => `${x},${y1} ${x + t / 2},${y1 + t / 2} ${x + t / 2},${y2 - t / 2} ${x},${y2} ${x - t / 2},${y2 - t / 2} ${x - t / 2},${y1 + t / 2}`
const SEGS: Record<'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g', string> = {
  a: hs(31, 57, 40, 5), g: hs(31, 57, 57, 5), d: hs(31, 57, 74, 5),
  f: vs(28, 42, 55, 5), b: vs(60, 42, 55, 5), e: vs(28, 59, 72, 5), c: vs(60, 59, 72, 5),
}

function SevenSegArt({ rt }: { rt?: PartRuntime }) {
  const seg = rt?.sevenseg?.segments
  const lvl = (k: string) => { const v = seg ? (seg as Record<string, number>)[k] : 0; return typeof v === 'number' && Number.isFinite(v) ? clamp01(v) : 0 }
  const topPins = [12, 28, 60, 76], botPins = [12, 28, 44, 60, 76]
  return (
    <g data-seg={seg ? (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'] as const).map((k) => (lvl(k) > 0.05 ? k : '')).join('') : ''}>
      {topPins.map((x) => <Leg key={`t${x}`} x1={x} y1={3} x2={x} y2={16} />)}
      {botPins.map((x) => <Leg key={`b${x}`} x1={x} y1={94} x2={x} y2={107} />)}
      <rect x={4} y={14} width={80} height={82} rx={4} fill="#1c1c20" stroke="#030712" strokeWidth={1.4} />
      <rect x={14} y={30} width={60} height={54} rx={3} fill="#09090c" stroke="#27272a" />
      {([['g', 12], ['f', 28], ['a', 60], ['b', 76]] as const).map(([n, x]) => <text key={n} x={x} y={25} textAnchor="middle" fontSize={7} fontWeight={800} fill="#e2e8f0">{n}</text>)}
      {([['e', 12], ['d', 28], ['COM', 44], ['c', 60], ['dp', 76]] as const).map(([n, x]) => <text key={n} x={x} y={92} textAnchor="middle" fontSize={n.length > 1 ? 6 : 7} fontWeight={800} fill="#e2e8f0">{n}</text>)}
      {(Object.keys(SEGS) as (keyof typeof SEGS)[]).map((k) => {
        const b = lvl(k)
        return (
          <g key={k} data-seg-on={b > 0.05 ? k : undefined}>
            {b > 0.05 && <polygon points={SEGS[k]} fill="#ff3030" opacity={b * 0.75} filter="url(#lab-glow-s)" />}
            <polygon points={SEGS[k]} fill={b > 0.05 ? '#ff4040' : '#3b1414'} fillOpacity={b > 0.05 ? 0.35 + 0.65 * b : 1} />
          </g>
        )
      })}
      {(() => { const b = lvl('dp'); return (<g data-seg-on={b > 0.05 ? 'dp' : undefined}>
        {b > 0.05 && <circle cx={67} cy={75} r={4} fill="#ff3030" opacity={b * 0.75} filter="url(#lab-glow-s)" />}
        <circle cx={67} cy={75} r={2.8} fill={b > 0.05 ? '#ff4040' : '#3b1414'} fillOpacity={b > 0.05 ? 0.35 + 0.65 * b : 1} />
      </g>) })()}
      <rect x={6} y={15} width={76} height={3} rx={1.5} fill="#fff" opacity={0.1} />
    </g>
  )
}

const LCD_COLS = 16, CELL_W = 13.5, CELL_H = 28
const MONO = "ui-monospace, 'DejaVu Sans Mono', Menlo, Consolas, monospace"
/** İçeriği 2 satır × 16 karaktere tamamlar/keser. */
export function lcdRows(lines: unknown): [string, string] {
  const arr = Array.isArray(lines) ? lines : []
  const fix = (s: unknown) => String(typeof s === 'string' ? s : '').slice(0, LCD_COLS).padEnd(LCD_COLS, ' ')
  return [fix(arr[0]), fix(arr[1])]
}

function LcdScreen({ x, y, tone, lcd }: { x: number; y: number; tone: 'blue' | 'green'; lcd?: PartRuntime['lcd'] }) {
  const powered = lcd?.poweredOn === true
  const lit = powered && lcd?.backlight !== false
  const bg = !powered ? (tone === 'blue' ? '#3a5683' : '#6f8f5a') : lit ? (tone === 'blue' ? '#2f6fe0' : '#9bd35a') : '#0d1512'
  const fg = tone === 'blue' ? '#eaf4ff' : '#16310f'
  const rows = powered ? lcdRows(lcd?.lines) : (['', ''] as string[])
  const x0 = x + 11, y0 = [y + 10, y + 44]
  return (
    <g data-lcd={powered ? (lit ? 'on' : 'dark') : 'off'} data-lcd-text={powered ? rows.map((r) => r.trimEnd()).join('|') : ''}>
      <rect x={x - 6} y={y - 6} width={254} height={92} rx={4} fill="#18181b" stroke="#030712" strokeWidth={1.4} />
      <rect x={x} y={y} width={242} height={80} rx={2} fill={bg} stroke="#0b0b0e" />
      {[0, 1].map((r) => Array.from({ length: LCD_COLS }, (_, c) => (
        <rect key={`${r}-${c}`} x={x0 + c * CELL_W} y={y0[r]} width={CELL_W - 1.2} height={CELL_H} rx={1} fill="#000" opacity={powered ? (lit ? 0.12 : 0.5) : 0.1} />
      )))}
      {powered && [0, 1].map((r) => rows[r].split('').map((ch, c) => (ch === ' ' ? null : (
        <text key={`${r}-${c}`} x={x0 + c * CELL_W + (CELL_W - 1.2) / 2} y={y0[r] + 22} textAnchor="middle" fontFamily={MONO} fontSize={22} fontWeight={700} fill={fg} opacity={lit ? 0.95 : 0.22}>{ch}</text>
      ))))}
      {/* nokta-matris ızgarası */}
      <rect x={x} y={y} width={242} height={80} fill="url(#lab-lcd-dots)" opacity={lit ? 0.5 : 0.25} pointerEvents="none" />
      <path d={`M${x + 6} ${y + 5} H${x + 120}`} stroke="#fff" strokeOpacity={lit ? 0.22 : 0.08} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

const LCD_PIN_NAMES = ['VSS', 'VDD', 'V0', 'RS', 'RW', 'E', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'A', 'K']

function Lcd1602Art({ rt }: { rt?: PartRuntime }) {
  return (
    <g>
      <rect x={0} y={0} width={282} height={128} rx={5} fill="#15803d" stroke="#14532d" strokeWidth={1.6} />
      <rect x={3} y={3} width={276} height={122} rx={4} fill="none" stroke="#4ade80" strokeWidth={0.6} opacity={0.5} />
      {[[8, 120], [274, 120], [8, 22], [274, 22]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={3} fill="#052e16" stroke="#bbf7d0" strokeWidth={0.8} />)}
      {LCD_PIN_NAMES.map((n, i) => (
        <g key={n}>
          <circle cx={36 + i * 14} cy={5} r={2.6} fill="#d4a017" stroke="#7c5a00" strokeWidth={0.7} />
          <text x={36 + i * 14} y={17} textAnchor="middle" fontSize={5.4} fontWeight={700} fill="#ecfdf5">{n}</text>
        </g>
      ))}
      <LcdScreen x={20} y={32} tone="blue" lcd={rt?.lcd} />
    </g>
  )
}

function LcdI2cArt({ rt }: { rt?: PartRuntime }) {
  const pins = ['GND', 'VCC', 'SDA', 'SCL']
  return (
    <g>
      {/* arka PCF8574 kartı (LCD'nin arkasında) */}
      {pins.map((p, i) => <Leg key={p} x1={117 + i * 16} y1={150} x2={117 + i * 16} y2={166} />)}
      <rect x={90} y={104} width={102} height={56} rx={4} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={1.4} />
      <rect x={104} y={132} width={30} height={10} rx={1.5} fill="#111827" stroke="#030712" />
      <text x={119} y={139.5} textAnchor="middle" fontSize={4.8} fontWeight={700} fill="#94a3b8">PCF8574</text>
      <rect x={146} y={130} width={14} height={14} rx={2} fill="#2563eb" stroke="#bfdbfe" strokeWidth={0.7} />
      <circle cx={153} cy={137} r={4.6} fill="#fbbf24" stroke="#92400e" /><line x1={150} y1={134} x2={156} y2={140} stroke="#92400e" strokeWidth={1} />
      <rect x={166} y={134} width={14} height={7} rx={1} fill="#e5e7eb" stroke="#6b7280" strokeWidth={0.6} />
      {pins.map((p, i) => <text key={p} x={117 + i * 16} y={156} textAnchor="middle" fontSize={5.6} fontWeight={800} fill="#eff6ff">{p}</text>)}
      {/* LCD modülü */}
      <rect x={0} y={0} width={282} height={124} rx={5} fill="#15803d" stroke="#14532d" strokeWidth={1.6} />
      <rect x={3} y={3} width={276} height={118} rx={4} fill="none" stroke="#4ade80" strokeWidth={0.6} opacity={0.5} />
      {[[8, 116], [274, 116], [8, 8], [274, 8]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={3} fill="#052e16" stroke="#bbf7d0" strokeWidth={0.8} />)}
      <LcdScreen x={20} y={18} tone="green" lcd={rt?.lcd} />
      <text x={141} y={115} textAnchor="middle" fontSize={5.6} fontWeight={700} fill="#dcfce7">I2C 16x2</text>
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
    case 'diode': return <DiodeArt />
    case 'npn': return <NpnArt />
    case 'mosfet': return <MosfetArt />
    case 'dcmotor': return <MotorArt rt={runtime} />
    case 'l293d': return <L293dArt />
    case 'relay': return <RelayArt part={part} rt={runtime} />
    case 'sevenseg': return <SevenSegArt rt={runtime} />
    case 'sr595': return <Sr595Art rt={runtime} />
    case 'lcd1602': return <Lcd1602Art rt={runtime} />
    case 'lcdI2c': return <LcdI2cArt rt={runtime} />
    default: return <StageCArt part={part} runtime={runtime} />
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

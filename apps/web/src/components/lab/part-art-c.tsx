// Aşama C (Modül 4) parça çizimleri: sensör modülleri ve girdi cihazları. Wokwi/Tinkercad tarzı gerçekçi SVG.
// Her çizim PartRuntime alanlarına göre canlı durum gösterir; çalışma zamanı yoksa (palet simgesi, durdurulmuş) özelliklerden (props) çizer.
import type { PartInstance, PartRuntime, PartType } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { Tx } from './tx'

export const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
export const clamp01 = (v: number) => clamp(v, 0, 1)
const METAL = '#b8c0cc'
export const GOLD = '#d4a017'
export const MONO = "ui-monospace, 'DejaVu Sans Mono', Menlo, Consolas, monospace"
export const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',')

export interface Ctx { part: PartInstance; rt?: PartRuntime }
const prop = (c: Ctx, key: string) => c.part.props[key]

/** Sözleşme pinleri üzerine altın pedler + (isteğe bağlı) siyah başlık şeridi ve ipek baskı etiketi. Konumlar PART_DEFS'ten gelir. */
export function Pads({ type, strip = true, label = '#e2e8f0', dy = 6 }: { type: PartType; strip?: boolean; label?: string; dy?: number }) {
  const entries = Object.entries(PART_DEFS[type].pins)
  const xs = entries.map(([, p]) => p.x)
  const y = entries[0][1].y
  return (
    <g data-pads={type}>
      {strip && <rect x={Math.min(...xs) - 9} y={y - 4.5} width={Math.max(...xs) - Math.min(...xs) + 18} height={9} rx={2} fill="#111827" stroke="#030712" strokeWidth={0.8} />}
      {entries.map(([n, p]) => (
        <g key={n}>
          <circle cx={p.x} cy={p.y} r={2.6} fill={GOLD} stroke="#7c5a00" strokeWidth={0.6} />
          <circle cx={p.x} cy={p.y} r={0.9} fill="#1f2937" />
          <text x={p.x} y={p.y - dy} textAnchor="middle" fontSize={5.2} fontWeight={700} fill={label}>{n}</text>
        </g>
      ))}
    </g>
  )
}

export function Board({ w, h, fill, stroke, hi, r = 5 }: { w: number; h: number; fill: string; stroke: string; hi: string; r?: number }) {
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={1.6} />
      <rect x={2.5} y={2.5} width={w - 5} height={h - 5} rx={r - 1} fill="none" stroke={hi} strokeWidth={0.7} opacity={0.6} />
      {[[6, 6], [w - 6, 6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} fill="#0b1220" stroke="#cbd5e1" strokeWidth={0.6} />)}
    </g>
  )
}

export function SmdLed({ x, y, on, color }: { x: number; y: number; on: boolean; color: string }) {
  return (
    <g data-led-on={on ? 'true' : 'false'}>
      {on && <circle cx={x} cy={y} r={7} fill={color} opacity={0.55} filter="url(#lab-glow-s)" />}
      <rect x={x - 3} y={y - 2} width={6} height={4} rx={1} fill={on ? color : '#374151'} stroke="#111827" strokeWidth={0.6} />
    </g>
  )
}

function Trimmer({ x, y, tone = '#1d4ed8' }: { x: number; y: number; tone?: string }) {
  return (
    <g>
      <rect x={x - 7} y={y - 7} width={14} height={14} rx={1.5} fill={tone} stroke="#0f172a" strokeWidth={0.9} />
      <circle cx={x} cy={y} r={4.4} fill="#e5e7eb" stroke="#475569" strokeWidth={0.7} />
      <path d={`M${x - 3} ${y} H${x + 3}`} stroke="#334155" strokeWidth={1.2} strokeLinecap="round" />
    </g>
  )
}

export function Chip({ x, y, w = 18, h = 7, text }: { x: number; y: number; w?: number; h?: number; text?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1} fill="#111827" stroke="#030712" strokeWidth={0.6} />
      {text && <text x={x + w / 2} y={y + h / 2 + 1.6} textAnchor="middle" fontSize={4} fill="#9ca3af">{text}</text>}
    </g>
  )
}

// ---------------------------------------------------------------- HC-SR04
function Hcsr04Art(c: Ctx) {
  const h = c.rt?.hcsr04
  const powered = h?.powered === true
  const inRange = h?.inRange !== false
  const active = powered && inRange
  return (
    <g data-hc-active={active ? 'true' : 'false'} data-hc-powered={powered ? 'true' : 'false'}>
      <Board w={120} h={70} fill="#1e5aa8" stroke="#0f3a73" hi="#5b9bd5" />
      {/* iki ultrasonik "göz": T (verici) ve R (alıcı) */}
      {[30, 90].map((cx, i) => (
        <g key={cx} data-hc-eye={i === 0 ? 'T' : 'R'}>
          {active && [27, 31].map((r, k) => <circle key={r} cx={cx} cy={27} r={r} fill="none" stroke="#7dd3fc" strokeWidth={1.2} opacity={0.5 - k * 0.2} />)}
          <circle cx={cx} cy={27} r={24} fill="#cbd5e1" stroke="#64748b" strokeWidth={1.4} />
          <circle cx={cx} cy={27} r={19} fill="#1f2937" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={cx} cy={27} r={14} fill="#374151" />
          <circle cx={cx} cy={27} r={8} fill="#111827" />
          {[...Array(8)].map((_, k) => { const a = (k * Math.PI) / 4; return <line key={k} x1={cx + Math.cos(a) * 9} y1={27 + Math.sin(a) * 9} x2={cx + Math.cos(a) * 18} y2={27 + Math.sin(a) * 18} stroke="#4b5563" strokeWidth={0.8} /> })}
          <circle cx={cx - 6} cy={20} r={3} fill="#fff" opacity={0.12} />
        </g>
      ))}
      {/* orta: kristal ve yazı */}
      <rect x={52} y={14} width={16} height={7} rx={3} fill="#cbd5e1" stroke="#64748b" strokeWidth={0.7} />
      <Chip x={52} y={26} w={16} h={8} />
      <text x={60} y={44} textAnchor="middle" fontSize={6} fontWeight={800} fill="#dbeafe">HC-SR04</text>
      <text x={60} y={52} textAnchor="middle" fontSize={5} fontFamily={MONO} fill={active ? '#bbf7d0' : '#93c5fd'}>{powered ? (inRange ? `${fmt(num(h?.distanceCm, 0), 0)} cm` : <Tx k="lab.art.outOfRange" />) : '—'}</text>
      <Pads type="hcsr04" />
    </g>
  )
}

// ---------------------------------------------------------------- DHT11 / DHT22
function DhtArt(c: Ctx) {
  const d = c.rt?.dht
  const type = d?.type ?? (prop(c, 'type') === 'dht11' ? 'dht11' : 'dht22')
  const blue = type === 'dht11'
  const powered = d?.powered === true
  const body = blue ? '#2f7fc9' : '#f1f5f9'
  const edge = blue ? '#1c4f8a' : '#94a3b8'
  const ink = blue ? '#dbeafe' : '#334155'
  return (
    <g data-dht-type={type} data-dht-powered={powered ? 'true' : 'false'}>
      <rect x={4} y={50} width={48} height={30} rx={3} fill="#1e3a8a" stroke="#0f1f4f" strokeWidth={1.2} />
      <rect x={6} y={0} width={44} height={54} rx={4} fill={body} stroke={edge} strokeWidth={1.6} />
      {/* havalandırma ızgarası */}
      {[...Array(6)].map((_, r) => [...Array(4)].map((__, k) => <rect key={`${r}-${k}`} x={13 + k * 9} y={5 + r * 4.4} width={5.5} height={2.6} rx={1.1} fill={blue ? '#1c4f8a' : '#cbd5e1'} />))}
      <text x={28} y={38} textAnchor="middle" fontSize={8} fontWeight={800} fill={ink}>{blue ? 'DHT11' : 'DHT22'}</text>
      <text x={28} y={48} textAnchor="middle" fontSize={4.8} fontFamily={MONO} fill={ink} data-dht-reading={powered ? 'on' : 'off'}>
        {powered ? `${fmt(num(d?.tempC, 0))}°C ${fmt(num(d?.humidity, 0), 0)}%` : `${blue ? '0-50°C' : '-40-80°C'}`}
      </text>
      <Pads type="dht" />
    </g>
  )
}

// ---------------------------------------------------------------- PIR
function PirArt(c: Ctx) {
  const p = c.rt?.pir
  const out = p?.out === true
  const warm = p?.warmingUp === true
  const motion = prop(c, 'motion') === true
  return (
    <g data-pir-out={out ? 'true' : 'false'} data-pir-warmup={warm ? 'true' : 'false'} data-pir-powered={p?.powered === true ? 'true' : 'false'}>
      <Board w={72} h={84} fill="#15803d" stroke="#14532d" hi="#4ade80" />
      <Trimmer x={9} y={62} tone="#ea580c" /><Trimmer x={63} y={62} tone="#ea580c" />
      <Chip x={27} y={48} w={18} h={7} text="BISS0001" />
      {/* metal taban + beyaz Fresnel kubbe */}
      <circle cx={36} cy={28} r={26} fill="#cbd5e1" stroke="#64748b" strokeWidth={1.4} />
      {(out || motion) && !warm && <circle cx={36} cy={28} r={34} fill="#fde68a" opacity={0.3} filter="url(#lab-glow)" />}
      <circle cx={36} cy={28} r={23} fill={warm ? '#fef3c7' : '#f8fafc'} stroke="#cbd5e1" strokeWidth={1} />
      {[...Array(9)].map((_, k) => { const a = (k * Math.PI) / 4.5; return <line key={k} x1={36} y1={28} x2={36 + Math.cos(a) * 23} y2={28 + Math.sin(a) * 23} stroke="#e2e8f0" strokeWidth={0.9} /> })}
      {[7, 14, 20].map((r) => <circle key={r} cx={36} cy={28} r={r} fill="none" stroke="#e2e8f0" strokeWidth={0.8} />)}
      <ellipse cx={28} cy={19} rx={8} ry={4.5} fill="#fff" opacity={0.7} />
      <SmdLed x={36} y={63} on={out} color="#ef4444" />
      <Pads type="pir" />
    </g>
  )
}

// ---------------------------------------------------------------- IR engel modülü
function IrObstacleArt(c: Ctx) {
  const m = c.rt?.irobstacle
  const powered = m?.powered === true
  const detected = m?.detected === true
  return (
    <g data-ir-detected={detected ? 'true' : 'false'} data-ir-powered={powered ? 'true' : 'false'}>
      <Board w={84} h={72} fill="#1d4ed8" stroke="#1e3a8a" hi="#60a5fa" />
      {/* verici (saydam) ve alıcı (koyu) IR LED'ler */}
      <g>
        {powered && <circle cx={22} cy={20} r={13} fill="#fca5a5" opacity={detected ? 0.5 : 0.22} filter="url(#lab-glow-s)" />}
        <path d="M14 30 V20 a8 8 0 0 1 16 0 V30 Z" fill="#e2e8f0" fillOpacity={0.55} stroke="#94a3b8" strokeWidth={1.2} />
        <rect x={19} y={14} width={6} height={9} fill="#9ca3af" opacity={0.7} />
      </g>
      <g>
        <path d="M54 30 V20 a8 8 0 0 1 16 0 V30 Z" fill="#111827" stroke="#030712" strokeWidth={1.2} />
        <ellipse cx={59} cy={14} rx={2} ry={3.5} fill="#fff" opacity={0.18} />
      </g>
      <Trimmer x={42} y={37} />
      <Chip x={33} y={50} w={18} h={6} text="LM393" />
      <SmdLed x={10} y={52} on={powered} color="#22c55e" />
      <SmdLed x={74} y={52} on={powered && detected} color="#ef4444" />
      <Pads type="irobstacle" />
    </g>
  )
}

// ---------------------------------------------------------------- Reed anahtarı
function ReedArt(c: Ctx) {
  const closed = c.rt?.reed ? c.rt.reed.closed === true : prop(c, 'magnet') === true
  return (
    <g data-reed-closed={closed ? 'true' : 'false'}>
      <Leg x1={4} y1={12} x2={22} y2={12} /><Leg x1={58} y1={12} x2={76} y2={12} />
      {closed && <rect x={10} y={2} width={60} height={20} rx={10} fill="#4ade80" opacity={0.28} filter="url(#lab-glow-s)" />}
      <rect x={14} y={5} width={52} height={14} rx={7} fill="#bae6fd" fillOpacity={0.45} stroke="#7dd3fc" strokeWidth={1.4} />
      {/* iki ferromanyetik lama: açıkken aralık, mıknatısla temas */}
      <path d={closed ? 'M20 12 H41' : 'M20 12 H34'} stroke="#64748b" strokeWidth={2.4} strokeLinecap="round" />
      <path d={closed ? 'M60 12 H40' : 'M60 12 H46'} stroke="#64748b" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={closed ? 40.5 : 34} cy={12} r={1.6} fill={closed ? '#22c55e' : '#fbbf24'} /><circle cx={closed ? 40.5 : 46} cy={12} r={1.6} fill={closed ? '#22c55e' : '#fbbf24'} />
      <path d="M20 8 q8 -2 16 0" stroke="#fff" strokeOpacity={0.55} strokeWidth={1} fill="none" strokeLinecap="round" />
    </g>
  )
}

function Leg({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={METAL} strokeWidth={2.4} strokeLinecap="round" />
}

// ---------------------------------------------------------------- BMP280
function Bmp280Art(c: Ctx) {
  const b = c.rt?.bmp280
  const present = b?.present === true
  return (
    <g data-bmp-present={present ? 'true' : 'false'} data-bmp-powered={b?.powered === true ? 'true' : 'false'}>
      <Board w={68} h={62} fill="#6d28d9" stroke="#3b0f87" hi="#a78bfa" />
      {/* metal kapaklı sensör */}
      <rect x={24} y={8} width={20} height={16} rx={1.5} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
      <circle cx={30} cy={13} r={1.5} fill="#1f2937" />
      <text x={34} y={33} textAnchor="middle" fontSize={6} fontWeight={800} fill="#ede9fe">BMP280</text>
      <text x={34} y={41} textAnchor="middle" fontSize={4.6} fontFamily={MONO} fill="#ddd6fe">{present ? `${fmt(num(b?.tempC, 0))}°C` : '—'}</text>
      <text x={34} y={47} textAnchor="middle" fontSize={4.6} fontFamily={MONO} fill="#ddd6fe">{present ? `${fmt(num(b?.pressureHpa, 0), 0)} hPa` : ''}</text>
      <SmdLed x={58} y={12} on={b?.powered === true} color="#22c55e" />
      <Pads type="bmp280" />
    </g>
  )
}

// ---------------------------------------------------------------- MPU6050
function Mpu6050Art(c: Ctx) {
  const m = c.rt?.mpu6050
  const ax = clamp(num(m?.ax ?? prop(c, 'ax'), 0), -2, 2), ay = clamp(num(m?.ay ?? prop(c, 'ay'), 0), -2, 2), az = num(m?.az ?? prop(c, 'az'), 1)
  const present = m?.present === true
  return (
    <g data-mpu-present={present ? 'true' : 'false'} data-mpu-ax={ax.toFixed(2)} data-mpu-ay={ay.toFixed(2)} data-mpu-az={az.toFixed(2)}>
      <Board w={68} h={76} fill="#1d4ed8" stroke="#1e3a8a" hi="#60a5fa" />
      {/* QFN çip + yön oku (X kırmızı, Y yeşil) */}
      <rect x={21} y={10} width={26} height={26} rx={2} fill="#111827" stroke="#030712" strokeWidth={1} />
      <circle cx={25} cy={14} r={1.5} fill="#6b7280" />
      <text x={34} y={25} textAnchor="middle" fontSize={4.4} fill="#9ca3af">MPU</text>
      <text x={34} y={30} textAnchor="middle" fontSize={4.4} fill="#9ca3af">6050</text>
      <g strokeWidth={2} strokeLinecap="round">
        <line x1={34} y1={46} x2={34 + ax * 11} y2={46} stroke="#f87171" data-mpu-axis="x" />
        <line x1={34} y1={46} x2={34} y2={46 - ay * 11} stroke="#4ade80" data-mpu-axis="y" />
      </g>
      <circle cx={34} cy={46} r={2} fill="#fff" />
      <text x={6} y={58} fontSize={4.6} fontFamily={MONO} fill="#bfdbfe">{`Z ${fmt(az, 2)}g`}</text>
      <SmdLed x={58} y={12} on={m?.powered === true} color="#22c55e" />
      <Pads type="mpu6050" />
    </g>
  )
}

// ---------------------------------------------------------------- Joystick (KY-023)
function JoystickArt(c: Ctx) {
  const j = c.rt?.joystick
  const x = clamp01(num(j?.x ?? prop(c, 'x'), 0.5)), y = clamp01(num(j?.y ?? prop(c, 'y'), 0.5))
  const pressed = j ? j.pressed === true : prop(c, 'pressed') === true
  const cx = 50 + (x - 0.5) * 22, cy = 36 + (y - 0.5) * 22
  return (
    <g data-joy-x={x.toFixed(2)} data-joy-y={y.toFixed(2)} data-joy-pressed={pressed ? 'true' : 'false'}>
      <Board w={100} h={100} fill="#1f2937" stroke="#030712" hi="#6b7280" />
      <rect x={20} y={6} width={60} height={60} rx={7} fill="#111827" stroke="#4b5563" strokeWidth={1.4} />
      <circle cx={50} cy={36} r={25} fill="#0f172a" stroke="#374151" strokeWidth={1} />
      {/* çubuk: gölge + gövde + kapak */}
      <line x1={50} y1={36} x2={cx} y2={cy} stroke="#4b5563" strokeWidth={7} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={pressed ? 12 : 14} fill={pressed ? '#374151' : '#4b5563'} stroke="#111827" strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={pressed ? 8.5 : 10} fill="#1f2937" stroke="#6b7280" strokeWidth={0.8} />
      <circle cx={cx - 3} cy={cy - 3} r={3} fill="#fff" opacity={0.2} />
      <text x={50} y={78} textAnchor="middle" fontSize={5.4} fontWeight={700} fill="#9ca3af">KY-023</text>
      <Pads type="joystick" />
    </g>
  )
}

// ---------------------------------------------------------------- Döner enkoder (KY-040)
function EncoderArt(c: Ctx) {
  const e = c.rt?.encoder
  const pos = Math.round(num(e?.position ?? prop(c, 'position'), 0))
  const pressed = e ? e.pressed === true : prop(c, 'pressed') === true
  const ang = (pos * 18) % 360 // 20 tık / tur
  const r = pressed ? 16 : 18
  return (
    <g data-encoder-angle={ang.toFixed(0)} data-encoder-pressed={pressed ? 'true' : 'false'} data-encoder-moving={e?.moving === true ? 'true' : 'false'}>
      <Board w={100} h={92} fill="#1e3a5f" stroke="#0b1b30" hi="#5b8ec4" />
      <rect x={30} y={8} width={40} height={40} rx={4} fill="#9ca3af" stroke="#4b5563" strokeWidth={1.2} />
      <g transform={`rotate(${ang} 50 34)`}>
        <circle cx={50} cy={34} r={r + 2} fill="#0f172a" />
        {[...Array(20)].map((_, k) => <rect key={k} x={49} y={34 - r - 1.5} width={2} height={3.4} rx={0.8} fill="#111827" transform={`rotate(${k * 18} 50 34)`} />)}
        <circle cx={50} cy={34} r={r} fill="#1f2937" stroke="#030712" strokeWidth={1.2} />
        <circle cx={50} cy={34} r={r - 5} fill="#374151" stroke="#4b5563" strokeWidth={0.8} />
        <rect x={48.6} y={34 - r + 2} width={2.8} height={8} rx={1.4} fill="#f8fafc" />
      </g>
      <circle cx={43} cy={27} r={3.2} fill="#fff" opacity={0.1} />
      {/* CLK / DT seviye göstergeleri */}
      {[['CLK', e?.clk], ['DT', e?.dt]].map(([n, v], i) => (
        <g key={String(n)} transform={`translate(8 ${12 + i * 10})`}>
          <circle cx={3} cy={0} r={2.4} fill={v ? '#4ade80' : '#475569'} stroke="#0b1b30" strokeWidth={0.6} />
          <text x={8} y={1.8} fontSize={4.6} fill="#bfdbfe">{String(n)}</text>
        </g>
      ))}
      <text x={50} y={66} textAnchor="middle" fontSize={6} fontFamily={MONO} fill="#e0f2fe">{`konum ${pos}`}</text>
      <Pads type="encoder" />
    </g>
  )
}

// ---------------------------------------------------------------- 4x4 membran tuş takımı
const KEYS = [['1', '2', '3', 'A'], ['4', '5', '6', 'B'], ['7', '8', '9', 'C'], ['*', '0', '#', 'D']]
function KeypadArt(c: Ctx) {
  const raw = c.rt?.keypad ? c.rt.keypad.key : prop(c, 'key')
  const down = typeof raw === 'string' && raw !== '' ? raw : null
  return (
    <g data-keypad-key={down ?? ''}>
      <rect x={30} y={116} width={72} height={22} fill="#9ca3af" stroke="#6b7280" strokeWidth={0.8} />
      {[...Array(8)].map((_, k) => <line key={k} x1={36 + k * 8.6} y1={118} x2={36 + k * 8.6} y2={136} stroke="#d1d5db" strokeWidth={0.7} />)}
      <rect x={0} y={0} width={132} height={118} rx={7} fill="#d1d5db" stroke="#6b7280" strokeWidth={1.6} />
      <rect x={3} y={3} width={126} height={112} rx={5} fill="none" stroke="#f3f4f6" strokeWidth={0.8} />
      {KEYS.map((row, r) => row.map((k, i) => {
        const on = down === k
        const fn = i === 3
        return (
          <g key={k} data-key={k} data-key-down={on ? 'true' : 'false'}>
            <rect x={12 + i * 28 + (on ? 1 : 0)} y={9 + r * 26 + (on ? 1.5 : 0)} width={24} height={22} rx={4} fill={on ? '#f59e0b' : fn ? '#fb923c' : '#f9fafb'} stroke={on ? '#92400e' : '#6b7280'} strokeWidth={on ? 1.6 : 1} />
            {!on && <rect x={14 + i * 28} y={11 + r * 26} width={20} height={5} rx={2} fill="#fff" opacity={0.7} />}
            <text x={24 + i * 28 + (on ? 1 : 0)} y={24 + r * 26 + (on ? 1.5 : 0)} textAnchor="middle" fontSize={11} fontWeight={800} fill={on ? '#451a03' : '#1f2937'}>{k}</text>
          </g>
        )
      }))}
      <rect x={4} y={136} width={124} height={20} rx={3} fill="#111827" stroke="#030712" strokeWidth={0.8} />
      <Pads type="keypad" strip={false} dy={6} />
    </g>
  )
}

// ---------------------------------------------------------------- DS3231 RTC
function RtcArt(c: Ctx) {
  const r = c.rt?.rtc
  const present = r?.present === true
  const t = typeof r?.time === 'string' && r.time.length >= 19 ? r.time.slice(11, 19) : null
  return (
    <g data-rtc-present={present ? 'true' : 'false'} data-rtc-time={t ?? ''}>
      <Board w={100} h={76} fill="#1e40af" stroke="#172554" hi="#60a5fa" />
      {/* CR2032 pil yuvası */}
      <circle cx={68} cy={28} r={23} fill="#9ca3af" stroke="#4b5563" strokeWidth={1.4} />
      <circle cx={68} cy={28} r={19} fill="#d1d5db" stroke="#6b7280" strokeWidth={0.8} />
      <text x={68} y={26} textAnchor="middle" fontSize={7} fontWeight={800} fill="#374151">CR2032</text>
      <text x={68} y={35} textAnchor="middle" fontSize={5.6} fill="#4b5563">3V +</text>
      <Chip x={9} y={12} w={32} h={14} text="DS3231" />
      <Chip x={9} y={32} w={22} h={8} text="24C32" />
      <text x={7} y={55} fontSize={7} fontFamily={MONO} fontWeight={700} fill={present ? '#bbf7d0' : '#93c5fd'}>{t ?? '--:--:--'}</text>
      <SmdLed x={46} y={46} on={r?.powered === true} color="#22c55e" />
      <Pads type="rtc" />
    </g>
  )
}

// ---------------------------------------------------------------- Analog modüller: MQ-2, alev, ses, toprak nemi, yağmur, su seviyesi
const propLevelKey: Record<string, string> = { mq2: 'gas', mq3: 'gas', mq4: 'gas', mq7: 'gas', mq135: 'gas', flame: 'flame', sound: 'sound', soil: 'moisture', rain: 'wetness', waterlevel: 'level' }

function analogInfo(c: Ctx) {
  const m = c.rt?.analogModule
  const level = clamp01(num(m?.level ?? prop(c, propLevelKey[c.part.type]), 0))
  const powered = m?.powered === true
  const doLow = powered && m?.doHigh === false // DO eşik üstünde LOW: sinyal LED'i yanar
  return { level, powered, doLow }
}

function ModuleLeds({ y, powered, doLow }: { y: number; powered: boolean; doLow: boolean }) {
  return (
    <g>
      <SmdLed x={10} y={y} on={powered} color="#22c55e" />
      <SmdLed x={10} y={y + 9} on={doLow} color="#ef4444" />
    </g>
  )
}

const MQ_LABEL: Record<string, string> = { mq2: 'MQ-2', mq3: 'MQ-3', mq4: 'MQ-4', mq7: 'MQ-7', mq135: 'MQ-135' }

function Mq2Art(c: Ctx) {
  const { level, powered, doLow } = analogInfo(c)
  const type = c.part.type
  return (
    <g data-module-level={level.toFixed(2)} data-module-powered={powered ? 'true' : 'false'} data-module-do={doLow ? 'low' : 'high'}>
      <Board w={76} h={96} fill="#1d4ed8" stroke="#1e3a8a" hi="#60a5fa" />
      {/* paslanmaz çelik ağ başlıklı gaz sensörü */}
      <circle cx={38} cy={29} r={24} fill="#e5e7eb" stroke="#6b7280" strokeWidth={1.6} />
      <circle cx={38} cy={29} r={20} fill="#9ca3af" stroke="#4b5563" strokeWidth={1} />
      {[...Array(11)].map((_, k) => <line key={`a${k}`} x1={20 + k * 3.6} y1={14} x2={20 + k * 3.6} y2={44} stroke="#d1d5db" strokeWidth={0.7} opacity={0.8} />)}
      {[...Array(9)].map((_, k) => <line key={`b${k}`} x1={20} y1={16 + k * 3.4} x2={56} y2={16 + k * 3.4} stroke="#d1d5db" strokeWidth={0.7} opacity={0.8} />)}
      <circle cx={38} cy={29} r={20} fill="none" stroke="#6b7280" strokeWidth={1.4} />
      <circle cx={38} cy={29} r={5} fill="#374151" stroke="#111827" strokeWidth={0.8} />
      {level > 0.05 && [[56, 8, 4], [62, 18, 3], [50, 2, 3]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r + level * 3} fill="#94a3b8" opacity={0.25 + level * 0.5} />)}
      <text x={38} y={61} textAnchor="middle" fontSize={6} fontWeight={800} fill="#dbeafe">{MQ_LABEL[type] ?? 'MQ-2'}</text>
      <Trimmer x={62} y={72} /><Chip x={22} y={70} w={20} h={6} text="LM393" />
      <ModuleLeds y={72} powered={powered} doLow={doLow} />
      <Pads type={type} />
    </g>
  )
}

function FlameArt(c: Ctx) {
  const { level, powered, doLow } = analogInfo(c)
  const s = 0.5 + level * 0.9
  return (
    <g data-module-level={level.toFixed(2)} data-module-powered={powered ? 'true' : 'false'} data-module-do={doLow ? 'low' : 'high'}>
      <Board w={76} h={88} fill="#1d4ed8" stroke="#1e3a8a" hi="#60a5fa" />
      {/* siyah IR alıcı LED */}
      <Leg x1={32} y1={34} x2={32} y2={46} /><Leg x1={44} y1={34} x2={44} y2={46} />
      <path d="M26 34 V18 a12 12 0 0 1 24 0 V34 Z" fill="#111827" stroke="#030712" strokeWidth={1.4} />
      <rect x={26} y={32} width={24} height={3} fill="#0b0f19" />
      <ellipse cx={32} cy={14} rx={2.4} ry={5} fill="#fff" opacity={0.18} />
      {level > 0.03 && (
        <g data-flame-visible="true" transform={`translate(62 22) scale(${s}) translate(-62 -22)`}>
          <circle cx={62} cy={22} r={13} fill="#fb923c" opacity={0.45} filter="url(#lab-glow-s)" />
          <path d="M62 6 C70 15 72 22 67 29 C65 32 59 32 57 28 C54 22 58 17 62 6 Z" fill="#f97316" stroke="#c2410c" strokeWidth={0.8} />
          <path d="M62 16 C66 21 66 26 63 29 C60 29 58 26 59 23 C60 20 62 19 62 16 Z" fill="#fde047" />
        </g>
      )}
      <text x={38} y={52} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#dbeafe"><Tx k="lab.art.flame" /></text>
      <Trimmer x={62} y={60} /><Chip x={22} y={58} w={20} h={6} text="LM393" />
      <ModuleLeds y={60} powered={powered} doLow={doLow} />
      <Pads type="flame" />
    </g>
  )
}

function SoundArt(c: Ctx) {
  const { level, powered, doLow } = analogInfo(c)
  return (
    <g data-module-level={level.toFixed(2)} data-module-powered={powered ? 'true' : 'false'} data-module-do={doLow ? 'low' : 'high'}>
      <Board w={76} h={88} fill="#1d4ed8" stroke="#1e3a8a" hi="#60a5fa" />
      {/* elektret mikrofon kapsülü */}
      <circle cx={24} cy={26} r={13} fill="#d1d5db" stroke="#6b7280" strokeWidth={1.4} />
      <circle cx={24} cy={26} r={9.5} fill="#9ca3af" stroke="#4b5563" strokeWidth={0.8} />
      <circle cx={24} cy={26} r={3.4} fill="#111827" />
      {[...Array(6)].map((_, k) => { const a = (k * Math.PI) / 3; return <circle key={k} cx={24 + Math.cos(a) * 6.4} cy={26 + Math.sin(a) * 6.4} r={0.9} fill="#374151" /> })}
      {/* ses dalgaları */}
      {level > 0.03 && [18, 23, 28].map((r, k) => <path key={r} d={`M${24 + r * 0.6} ${26 - r * 0.6} A${r} ${r} 0 0 1 ${24 + r * 0.6} ${26 + r * 0.6}`} fill="none" stroke="#7dd3fc" strokeWidth={1.6} strokeLinecap="round" opacity={clamp01(level * 1.4 - k * 0.25)} data-sound-wave />)}
      <Trimmer x={58} y={30} />
      <text x={38} y={52} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#dbeafe"><Tx k="lab.art.sound" /></text>
      <Chip x={44} y={58} w={20} h={6} text="LM393" />
      <ModuleLeds y={62} powered={powered} doLow={doLow} />
      <Pads type="sound" />
    </g>
  )
}

function SoilArt(c: Ctx) {
  const { level, powered, doLow } = analogInfo(c)
  const fillH = Math.round(level * 62)
  return (
    <g data-module-level={level.toFixed(2)} data-module-powered={powered ? 'true' : 'false'} data-module-do={doLow ? 'low' : 'high'}>
      {/* kapasitif prob (uç yukarıda) */}
      <path d="M20 78 V12 L38 1 L56 12 V78 Z" fill="#0f3d2e" stroke="#052e16" strokeWidth={1.4} />
      <path d="M26 74 V14 M32 74 V10 M44 74 V10 M50 74 V14" stroke={GOLD} strokeWidth={1.4} opacity={0.55} fill="none" />
      <rect x={21} y={78 - fillH} width={34} height={fillH} fill="#38bdf8" opacity={0.6} data-soil-fill={fillH} />
      {level > 0.4 && [0, 1, 2].map((k) => <circle key={k} cx={30 + k * 8} cy={78 - fillH / 2 - (k % 2) * 6} r={1.6} fill="#e0f2fe" opacity={0.7} />)}
      <rect x={0} y={78} width={76} height={58} rx={5} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={1.6} />
      <rect x={2.5} y={80.5} width={71} height={53} rx={4} fill="none" stroke="#60a5fa" strokeWidth={0.7} opacity={0.6} />
      <text x={38} y={90} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#dbeafe"><Tx k="lab.art.soil" /></text>
      <Trimmer x={62} y={104} /><Chip x={22} y={102} w={20} h={6} text="LM393" />
      <ModuleLeds y={104} powered={powered} doLow={doLow} />
      <Pads type="soil" />
    </g>
  )
}

/** Yağmur sensörü (YL-83 benzeri): üstte altın tarak izli siyah plaka, altında LM393 kontrol kartı. Islaklığa göre damlalar belirir. */
const DROPS: ReadonlyArray<readonly [number, number, number]> = [[18, 14, 1], [44, 10, 2], [30, 24, 3], [54, 26, 4], [14, 38, 5], [40, 40, 6], [60, 46, 7], [24, 52, 8]]
function RainArt(c: Ctx) {
  const { level, powered, doLow } = analogInfo(c)
  const nDrops = level > 0.03 ? Math.max(1, Math.round(level * DROPS.length)) : 0
  return (
    <g data-module-level={level.toFixed(2)} data-module-powered={powered ? 'true' : 'false'} data-module-do={doLow ? 'low' : 'high'} data-rain-drops={nDrops}>
      <rect x={4} y={2} width={68} height={68} rx={4} fill="#111827" stroke="#030712" strokeWidth={1.4} />
      {/* tarak (açık bakır) izleri */}
      {[...Array(8)].map((_, k) => <path key={k} d={`M10 ${10 + k * 7.4} H${k % 2 ? 62 : 66}`} stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" opacity={0.9} />)}
      {level > 0.03 && <rect x={4} y={2} width={68} height={68} rx={4} fill="#38bdf8" opacity={0.12 + level * 0.22} />}
      {DROPS.slice(0, nDrops).map(([x, y, k]) => (
        <path key={k} d={`M${x} ${y - 4.5} C${x + 3.6} ${y} ${x + 3.4} ${y + 3.4} ${x} ${y + 3.4} C${x - 3.4} ${y + 3.4} ${x - 3.6} ${y} ${x} ${y - 4.5} Z`} fill="#7dd3fc" stroke="#0284c7" strokeWidth={0.6} opacity={0.9} data-rain-drop />
      ))}
      <rect x={0} y={72} width={76} height={64} rx={5} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={1.6} />
      <rect x={2.5} y={74.5} width={71} height={59} rx={4} fill="none" stroke="#60a5fa" strokeWidth={0.7} opacity={0.6} />
      <text x={38} y={85} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#dbeafe"><Tx k="lab.art.rain" /></text>
      <Trimmer x={62} y={104} /><Chip x={22} y={102} w={20} h={6} text="LM393" />
      <ModuleLeds y={104} powered={powered} doLow={doLow} />
      <Pads type="rain" />
    </g>
  )
}

/** Su seviyesi sensörü: uzun çubuk üzerinde açık bakır şeritler; su yükseldikçe alttan dolar ve çıplak şeritler suya gömülür. */
function WaterLevelArt(c: Ctx) {
  const { level, powered, doLow } = analogInfo(c)
  const fillH = Math.round(level * 62)
  return (
    <g data-module-level={level.toFixed(2)} data-module-powered={powered ? 'true' : 'false'} data-module-do={doLow ? 'low' : 'high'}>
      <rect x={20} y={2} width={36} height={76} rx={3} fill="#0f3d2e" stroke="#052e16" strokeWidth={1.4} />
      {[...Array(9)].map((_, k) => <path key={k} d={`M25 ${9 + k * 7.6} H51`} stroke={GOLD} strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />)}
      <rect x={21} y={78 - fillH} width={34} height={fillH} fill="#38bdf8" opacity={0.55} data-water-fill={fillH} />
      {fillH > 3 && <path d={`M21 ${78 - fillH} q4 -2.4 8.5 0 t8.5 0 t8.5 0 t8.5 0`} fill="none" stroke="#e0f2fe" strokeWidth={1} opacity={0.9} />}
      <rect x={0} y={78} width={76} height={58} rx={5} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={1.6} />
      <rect x={2.5} y={80.5} width={71} height={53} rx={4} fill="none" stroke="#60a5fa" strokeWidth={0.7} opacity={0.6} />
      <text x={38} y={90} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#dbeafe"><Tx k="lab.art.water" /></text>
      <Trimmer x={62} y={104} /><Chip x={22} y={102} w={20} h={6} text="LM393" />
      <ModuleLeds y={104} powered={powered} doLow={doLow} />
      <Pads type="waterlevel" />
    </g>
  )
}

/** Aşama C parçası değilse null. */
export function StageCArt({ part, runtime }: { part: PartInstance; runtime?: PartRuntime }) {
  const c: Ctx = { part, rt: runtime }
  switch (part.type) {
    case 'hcsr04': return Hcsr04Art(c)
    case 'dht': return DhtArt(c)
    case 'pir': return PirArt(c)
    case 'irobstacle': return IrObstacleArt(c)
    case 'reed': return ReedArt(c)
    case 'bmp280': return Bmp280Art(c)
    case 'mpu6050': return Mpu6050Art(c)
    case 'joystick': return JoystickArt(c)
    case 'encoder': return EncoderArt(c)
    case 'keypad': return KeypadArt(c)
    case 'rtc': return RtcArt(c)
    case 'mq2': case 'mq3': case 'mq4': case 'mq7': case 'mq135': return Mq2Art(c)
    case 'flame': return FlameArt(c)
    case 'sound': return SoundArt(c)
    case 'soil': return SoilArt(c)
    case 'rain': return RainArt(c)
    case 'waterlevel': return WaterLevelArt(c)
    default: return null
  }
}

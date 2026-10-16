// Aşama D (Hyvex elektronik serisi, büyükler için) parça çizimleri: Sharp IR, köprü sürücüler, step motor, ESC + BLDC.
// MQ ailesi MQ-2 çizimini paylaşır (part-art-c.tsx). Çalışma zamanı yoksa (palet simgesi) boşta durum çizilir.
import type { PartRuntime, PartType } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { Board, Chip, clamp01, fmt, GOLD, MONO, num, SmdLed, type Ctx } from './part-art-c'

/** Pin pedleri; etiket pedin hangi yanında (kenara göre: alt kenardaki pinlerde üstte, sol kenardakilerde sağda…). */
function SidePads({ type, label = '#f8fafc' }: { type: PartType; label?: string }) {
  const def = PART_DEFS[type]
  return (
    <g data-pads={type}>
      {Object.entries(def.pins).map(([n, p]) => {
        const edge = [
          { k: 'l', d: p.x }, { k: 'r', d: def.w - p.x }, { k: 't', d: p.y }, { k: 'b', d: def.h - p.y },
        ].sort((a, b) => a.d - b.d)[0].k
        const tx = edge === 'l' ? p.x + 5 : edge === 'r' ? p.x - 5 : p.x
        const ty = edge === 'b' ? p.y - 6 : edge === 't' ? p.y + 10 : p.y + 1.8
        const anchor = edge === 'l' ? 'start' : edge === 'r' ? 'end' : 'middle'
        return (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r={2.8} fill={GOLD} stroke="#7c5a00" strokeWidth={0.6} />
            <circle cx={p.x} cy={p.y} r={1} fill="#1f2937" />
            <text x={tx} y={ty} textAnchor={anchor} fontSize={5.2} fontWeight={700} fill={label}>{n}</text>
          </g>
        )
      })}
    </g>
  )
}

/** Vidalı klemens bloğu (yeşil/mavi), `n` yuva. */
function Terminal({ x, y, n, vertical = false, tone = '#0e7490' }: { x: number; y: number; n: number; vertical?: boolean; tone?: string }) {
  const w = vertical ? 14 : n * 14, h = vertical ? n * 14 : 14
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill={tone} stroke="#083344" strokeWidth={0.9} />
      {[...Array(n)].map((_, i) => {
        const cx = vertical ? x + 7 : x + 7 + i * 14, cy = vertical ? y + 7 + i * 14 : y + 7
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={4.3} fill="#cbd5e1" stroke="#475569" strokeWidth={0.7} />
            <path d={`M${cx - 2.8} ${cy} H${cx + 2.8}`} stroke="#334155" strokeWidth={1.1} />
          </g>
        )
      })}
    </g>
  )
}

function Heatsink({ x, y, w, h, fins = 9 }: { x: number; y: number; w: number; h: number; fins?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} fill="#1f2937" stroke="#030712" strokeWidth={1} />
      {[...Array(fins)].map((_, i) => <rect key={i} x={x + 3 + (i * (w - 6)) / fins} y={y + 3} width={(w - 6) / fins - 2} height={h - 6} fill="#374151" />)}
    </g>
  )
}

/** Kanal çıkışı göstergesi: −1 … +1 çubuk, fren işareti. */
function ChannelBar({ x, y, w, out, brake, label }: { x: number; y: number; w: number; out: number; brake: boolean; label: string }) {
  const half = w / 2
  const len = clamp01(Math.abs(out)) * half
  const color = out >= 0 ? '#22c55e' : '#f97316'
  return (
    <g data-channel={label} data-out={out.toFixed(2)} data-brake={brake ? 'true' : 'false'}>
      <rect x={x} y={y} width={w} height={7} rx={2} fill="#0f172a" stroke="#475569" strokeWidth={0.5} />
      <line x1={x + half} y1={y - 1} x2={x + half} y2={y + 8} stroke="#94a3b8" strokeWidth={0.6} />
      {len > 0.3 && <rect x={out >= 0 ? x + half : x + half - len} y={y + 1} width={len} height={5} rx={1} fill={color} />}
      <text x={x - 2} y={y + 5.6} textAnchor="end" fontSize={5} fontWeight={700} fill="#e2e8f0">{label}</text>
      <text x={x + w + 2} y={y + 5.6} fontSize={5} fill={brake ? '#fca5a5' : '#e2e8f0'} fontFamily={MONO}>{brake ? 'FREN' : `${Math.round(out * 100)}%`}</text>
    </g>
  )
}

function driverInfo(rt?: PartRuntime, n = 2) {
  const d = rt?.driver
  const ch = d?.channels ?? []
  return { powered: d?.powered === true, enabled: d?.enabled === true, ch: [...Array(n)].map((_, i) => ch[i] ?? { out: 0, brake: false }) }
}

// ---------------------------------------------------------------- Sharp IR
function SharpIrArt(c: Ctx) {
  const s = c.rt?.sharpir
  const powered = s?.powered === true
  const cm = num(s?.distanceCm ?? c.part.props.distanceCm, 30)
  return (
    <g data-sharp-powered={powered ? 'true' : 'false'}>
      <rect x={6} y={4} width={88} height={30} rx={8} fill="#1f2937" stroke="#030712" strokeWidth={1.4} />
      <rect x={2} y={12} width={10} height={14} rx={3} fill="#111827" /><rect x={88} y={12} width={10} height={14} rx={3} fill="#111827" />
      {[32, 68].map((x, i) => (
        <g key={x}>
          <rect x={x - 11} y={9} width={22} height={20} rx={4} fill={i === 0 ? '#3f1d1d' : '#0f172a'} stroke="#475569" strokeWidth={0.8} />
          <circle cx={x} cy={19} r={6.5} fill={i === 0 && powered ? '#7f1d1d' : '#020617'} stroke="#334155" strokeWidth={0.8} />
        </g>
      ))}
      <text x={50} y={22} textAnchor="middle" fontSize={5} fill="#94a3b8">SHARP</text>
      <text x={50} y={40} textAnchor="middle" fontSize={5.4} fontFamily={MONO} fill="#1e293b" data-sharp-cm>{Math.round(cm)} cm</text>
      <SidePads type="sharpir" label="#1e293b" />
    </g>
  )
}

// ---------------------------------------------------------------- L298N
function L298nArt(c: Ctx) {
  const { powered, ch } = driverInfo(c.rt)
  return (
    <g data-driver-powered={powered ? 'true' : 'false'}>
      <Board w={150} h={140} fill="#b91c1c" stroke="#7f1d1d" hi="#f87171" />
      <Heatsink x={45} y={8} w={60} h={46} />
      <text x={75} y={34} textAnchor="middle" fontSize={8} fontWeight={800} fill="#e5e7eb">L298N</text>
      <Terminal x={8} y={32} n={2} vertical /><Terminal x={128} y={32} n={2} vertical />
      <Terminal x={6} y={108} n={3} tone="#1d4ed8" />
      <Chip x={60} y={62} w={30} h={10} text="78M05" />
      <SmdLed x={118} y={100} on={powered} color="#ef4444" />
      <ChannelBar x={40} y={82} w={60} out={ch[0].out} brake={ch[0].brake} label="A" />
      <ChannelBar x={40} y={94} w={60} out={ch[1].out} brake={ch[1].brake} label="B" />
      <SidePads type="l298n" />
    </g>
  )
}

// ---------------------------------------------------------------- TB6612FNG / DRV8833 (küçük breakout kartlar)
function SmallDriverArt(c: Ctx, type: 'tb6612' | 'drv8833') {
  const { powered, enabled, ch } = driverInfo(c.rt)
  const d = PART_DEFS[type]
  const fill = type === 'tb6612' ? '#6d28d9' : '#0f766e'
  return (
    <g data-driver-powered={powered ? 'true' : 'false'} data-driver-enabled={enabled ? 'true' : 'false'}>
      <Board w={d.w} h={d.h} fill={fill} stroke="#1e1b4b" hi="#c4b5fd" r={4} />
      <Chip x={d.w / 2 - 14} y={18} w={28} h={18} text={type === 'tb6612' ? 'TB6612' : '8833'} />
      <text x={d.w / 2} y={50} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#ede9fe">{type === 'tb6612' ? 'TB6612FNG' : 'DRV8833'}</text>
      <ChannelBar x={d.w / 2 - 14} y={62} w={28} out={ch[0].out} brake={ch[0].brake} label="A" />
      <ChannelBar x={d.w / 2 - 14} y={74} w={28} out={ch[1].out} brake={ch[1].brake} label="B" />
      <SidePads type={type} />
    </g>
  )
}

// ---------------------------------------------------------------- BTS7960
function Bts7960Art(c: Ctx) {
  const { powered, enabled, ch } = driverInfo(c.rt, 1)
  return (
    <g data-driver-powered={powered ? 'true' : 'false'} data-driver-enabled={enabled ? 'true' : 'false'}>
      <Board w={140} h={120} fill="#1e3a8a" stroke="#172554" hi="#60a5fa" />
      <Heatsink x={14} y={20} w={112} h={52} fins={14} />
      <Terminal x={42} y={6} n={3} tone="#15803d" />
      <text x={70} y={50} textAnchor="middle" fontSize={8} fontWeight={800} fill="#e5e7eb">BTS7960</text>
      <text x={70} y={60} textAnchor="middle" fontSize={5} fill="#cbd5e1">43 A · IBT-2</text>
      <ChannelBar x={42} y={84} w={56} out={ch[0].out} brake={ch[0].brake} label="M" />
      <SidePads type="bts7960" />
    </g>
  )
}

// ---------------------------------------------------------------- MD10C
function Md10cArt(c: Ctx) {
  const { powered, ch } = driverInfo(c.rt, 1)
  return (
    <g data-driver-powered={powered ? 'true' : 'false'}>
      <Board w={120} h={90} fill="#b91c1c" stroke="#7f1d1d" hi="#fca5a5" />
      <Terminal x={8} y={22} n={2} vertical />
      {[44, 62, 80, 98].map((x) => <rect key={x} x={x - 6} y={10} width={12} height={16} rx={1} fill="#111827" />)}
      <text x={70} y={38} textAnchor="middle" fontSize={7} fontWeight={800} fill="#fee2e2">MD10C</text>
      <SmdLed x={104} y={44} on={powered} color="#22c55e" />
      <ChannelBar x={44} y={50} w={50} out={ch[0].out} brake={ch[0].brake} label="M" />
      <SidePads type="md10c" />
    </g>
  )
}

// ---------------------------------------------------------------- Step motor (TMC2209 + NEMA17)
function StepperArt(c: Ctx) {
  const s = c.rt?.stepper
  const angle = s?.angleDeg ?? 0
  const on = s?.enabled === true
  return (
    <g data-stepper-angle={angle.toFixed(1)} data-stepper-enabled={on ? 'true' : 'false'}>
      {/* sürücü kartı */}
      <rect x={2} y={44} width={74} height={50} rx={3} fill="#1e293b" stroke="#020617" strokeWidth={1.2} />
      <rect x={18} y={50} width={42} height={22} rx={2} fill="#9ca3af" stroke="#475569" strokeWidth={0.8} />
      <text x={39} y={64} textAnchor="middle" fontSize={6} fontWeight={800} fill="#111827">TMC2209</text>
      <SmdLed x={10} y={52} on={on} color="#3b82f6" />
      {/* NEMA17 */}
      <rect x={84} y={4} width={62} height={62} rx={5} fill="#111827" stroke="#020617" strokeWidth={1.4} />
      <rect x={90} y={10} width={50} height={50} rx={3} fill="#1f2937" />
      {[[89, 9], [141, 9], [89, 61], [141, 61]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={2} fill="#6b7280" />)}
      <circle cx={115} cy={35} r={12} fill="#374151" stroke="#64748b" strokeWidth={1} />
      <g transform={`rotate(${angle % 360} 115 35)`}>
        <circle cx={115} cy={35} r={4} fill={METAL_SHAFT} />
        <rect x={113.5} y={22} width={3} height={13} rx={1} fill="#f59e0b" data-stepper-pointer />
      </g>
      <text x={115} y={76} textAnchor="middle" fontSize={5.4} fontFamily={MONO} fill="#1e293b">{fmt(angle, 0)}° · {s?.steps ?? 0} adım</text>
      <SidePads type="stepper" />
    </g>
  )
}
const METAL_SHAFT = '#d1d5db'

// ---------------------------------------------------------------- ESC + BLDC
function EscArt(c: Ctx) {
  const e = c.rt?.esc
  const armed = e?.armed === true
  const thr = e?.throttle ?? 0
  return (
    <g data-esc-armed={armed ? 'true' : 'false'} data-esc-throttle={thr.toFixed(2)}>
      <rect x={22} y={18} width={62} height={40} rx={6} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={1.4} />
      <text x={53} y={34} textAnchor="middle" fontSize={7} fontWeight={800} fill="#dbeafe">ESC 30A</text>
      <rect x={30} y={40} width={46} height={7} rx={2} fill="#0f172a" />
      <rect x={31} y={41} width={44 * clamp01(thr)} height={5} rx={1} fill={armed ? '#22c55e' : '#64748b'} />
      <text x={53} y={54} textAnchor="middle" fontSize={5} fontWeight={700} fill={armed ? '#bbf7d0' : '#fecaca'}>{armed ? 'KURULU' : 'KURULMADI'}</text>
      {[0, 1, 2].map((i) => <line key={i} x1={84} y1={30 + i * 8} x2={104} y2={30 + i * 8} stroke={['#ef4444', '#111827', '#facc15'][i]} strokeWidth={2.2} />)}
      {/* motor çanı */}
      <circle cx={128} cy={38} r={26} fill="#374151" stroke="#111827" strokeWidth={1.4} />
      <circle cx={128} cy={38} r={20} fill="#ef4444" stroke="#7f1d1d" strokeWidth={1} />
      <g transform={`rotate(${(thr * 300) % 360} 128 38)`}>
        {[0, 120, 240].map((a) => <rect key={a} x={126} y={20} width={4} height={18} rx={1.5} fill="#111827" transform={`rotate(${a} 128 38)`} />)}
      </g>
      <circle cx={128} cy={38} r={4} fill="#d1d5db" />
      <text x={128} y={74} textAnchor="middle" fontSize={5.4} fontFamily={MONO} fill="#1e293b">{(e?.rpm ?? 0).toLocaleString('tr-TR')} rpm</text>
      <line x1={4} y1={28} x2={22} y2={28} stroke="#f8fafc" strokeWidth={1.6} /><line x1={4} y1={48} x2={22} y2={48} stroke="#111827" strokeWidth={1.6} />
      <SidePads type="esc" label="#1e293b" />
    </g>
  )
}

/** Aşama D parçası değilse null. */
export function StageDArt({ part, runtime }: { part: Ctx['part']; runtime?: PartRuntime }) {
  const c: Ctx = { part, rt: runtime }
  switch (part.type) {
    case 'sharpir': return SharpIrArt(c)
    case 'l298n': return L298nArt(c)
    case 'tb6612': return SmallDriverArt(c, 'tb6612')
    case 'drv8833': return SmallDriverArt(c, 'drv8833')
    case 'bts7960': return Bts7960Art(c)
    case 'md10c': return Md10cArt(c)
    case 'stepper': return StepperArt(c)
    case 'esc': return EscArt(c)
    default: return null
  }
}

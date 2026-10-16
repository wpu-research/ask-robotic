// Aşama F parça çizimleri: pil paketi (kimyaya göre renk, şarj çubuğu, uç gerilimi), LM7805 (TO-220), buck modülü
// (trimpot, bobin, çıkış gerilimi), MAX17048 yakıt göstergesi. Çalışma zamanı yoksa özelliklerden boşta durum çizilir.
import type { PartRuntime } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { Board, Chip, fmt, MONO, num, Pads, SmdLed, type Ctx } from './part-art-c'

const GOLD = '#d4a017'
/** Yan pinler için tek pedler ve etiketleri (başlık şeridi yok). */
function SidePads({ type, color = '#e2e8f0', side = 'left' as 'left' | 'right' }: { type: keyof typeof PART_DEFS; color?: string; side?: 'left' | 'right' }) {
  return (
    <g data-pads={type}>
      {Object.entries(PART_DEFS[type].pins).map(([n, p]) => {
        const right = side === 'right' || p.x > PART_DEFS[type].w / 2
        return (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r={2.8} fill={GOLD} stroke="#7c5a00" strokeWidth={0.6} />
            <circle cx={p.x} cy={p.y} r={1} fill="#1f2937" />
            <text x={right ? p.x - 6 : p.x + 6} y={p.y + 2} textAnchor={right ? 'end' : 'start'} fontSize={5.6} fontWeight={800} fill={color}>{n}</text>
          </g>
        )
      })}
    </g>
  )
}

/** Kimyaya göre pil kabı rengi. */
const CHEM_COLOR: Record<string, string> = {
  alkalin: '#1f2937', 'cinko-karbon': '#7f1d1d', nimh: '#1d4ed8', nicd: '#065f46', liion: '#0e7490', lipo: '#334155',
  lifepo4: '#166534', 'kursun-asit': '#111827', cr2032: '#9ca3af', 'sodyum-iyon': '#5b21b6',
}
const CHEM_SHORT: Record<string, string> = {
  alkalin: 'ALKALİN', 'cinko-karbon': 'Zn-C', nimh: 'NiMH', nicd: 'NiCd', liion: 'Li-ion', lipo: 'LiPo', lifepo4: 'LiFePO₄', 'kursun-asit': 'Pb-ASİT', cr2032: 'CR2032', 'sodyum-iyon': 'Na-ion',
}

function BatteryArt(c: Ctx) {
  const b = c.rt?.battery
  const chem = String(c.part.props.chemistry ?? 'lipo')
  const cells = Math.max(1, Math.round(num(c.part.props.cells, 2)))
  const charge = Math.max(0, Math.min(100, num(b?.charge ?? c.part.props.charge, 80)))
  const col = CHEM_COLOR[chem] ?? '#334155'
  const barCol = charge > 50 ? '#22c55e' : charge > 20 ? '#f59e0b' : '#ef4444'
  return (
    <g data-battery-active={b?.active ? 'true' : 'false'} data-battery-chem={chem}>
      <rect x={14} y={6} width={88} height={52} rx={6} fill={col} stroke="#0b1220" strokeWidth={1.4} />
      <rect x={102} y={22} width={5} height={20} rx={1.5} fill="#9ca3af" />
      <text x={58} y={21} textAnchor="middle" fontSize={8} fontWeight={800} fill="#f8fafc">{CHEM_SHORT[chem] ?? chem} {cells > 1 ? `${cells}S` : ''}</text>
      <rect x={24} y={27} width={68} height={8} rx={2} fill="#0b1220" opacity={0.6} />
      <rect x={25} y={28} width={(66 * charge) / 100} height={6} rx={1.5} fill={barCol} />
      <text x={58} y={49} textAnchor="middle" fontSize={7} fontFamily={MONO} fill="#e2e8f0">
        {b ? (b.active ? `${fmt(b.volts, 2)} V · ${Math.round(b.currentMa)} mA` : `${fmt(b.ocv, 2)} V`) : `${charge} %`}
      </text>
      <rect x={0} y={14} width={14} height={12} rx={2} fill="#dc2626" /><text x={7} y={23.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">+</text>
      <rect x={0} y={38} width={14} height={12} rx={2} fill="#111827" /><text x={7} y={47} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">−</text>
      <SidePads type="battery" color="#f8fafc" />
    </g>
  )
}

function Lm7805Art(c: Ctx) {
  const r = c.rt?.regulator
  const hot = (r?.pdissW ?? 0) > 1.2
  return (
    <g data-reg-on={r?.on ? 'true' : 'false'} data-reg-hot={hot ? 'true' : 'false'}>
      {/* soğutma tırnağı */}
      <rect x={8} y={2} width={46} height={22} rx={2} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
      <circle cx={31} cy={12} r={5} fill="#f8fafc" stroke="#64748b" strokeWidth={1} />
      <rect x={8} y={22} width={46} height={40} rx={2} fill={hot ? '#7f1d1d' : '#111827'} stroke="#030712" strokeWidth={1.2} />
      <text x={31} y={38} textAnchor="middle" fontSize={8} fontWeight={800} fill="#e5e7eb">7805</text>
      <text x={31} y={49} textAnchor="middle" fontSize={5.6} fontFamily={MONO} fill={r?.inReg ? '#86efac' : '#9ca3af'}>{r ? `${fmt(r.vout, 2)} V` : '5 V'}</text>
      <text x={31} y={57} textAnchor="middle" fontSize={5} fontFamily={MONO} fill={hot ? '#fecaca' : '#9ca3af'}>{r ? `${fmt(r.pdissW, 2)} W` : ''}</text>
      {[13, 31, 49].map((x) => <rect key={x} x={x - 1.6} y={62} width={3.2} height={22} fill="#b8c0cc" />)}
      <Pads type="lm7805" strip={false} label="#1e293b" dy={-9} />
    </g>
  )
}

function BuckArt(c: Ctx) {
  const r = c.rt?.regulator
  const set = num(c.part.props.vout, 5)
  const model = String(c.part.props.model ?? 'lm2596').toUpperCase()
  return (
    <g data-reg-on={r?.on ? 'true' : 'false'}>
      <Board w={124} h={66} fill="#1d4ed8" stroke="#0b2a7a" hi="#60a5fa" r={4} />
      {/* bobin, kondansatörler, trimpot, entegre */}
      <rect x={48} y={10} width={26} height={26} rx={4} fill="#111827" stroke="#030712" />
      <circle cx={61} cy={23} r={8} fill="#374151" stroke="#9ca3af" strokeWidth={0.8} />
      <circle cx={30} cy={22} r={8} fill="#1e3a8a" stroke="#93c5fd" strokeWidth={1} /><text x={30} y={24.5} textAnchor="middle" fontSize={5} fill="#dbeafe">C</text>
      <circle cx={95} cy={22} r={8} fill="#1e3a8a" stroke="#93c5fd" strokeWidth={1} /><text x={95} y={24.5} textAnchor="middle" fontSize={5} fill="#dbeafe">C</text>
      <rect x={82} y={38} width={14} height={14} rx={1.5} fill="#2563eb" stroke="#bfdbfe" />
      <circle cx={89} cy={45} r={4} fill="#fbbf24" stroke="#92400e" strokeWidth={0.8} /><line x1={86.5} y1={45} x2={91.5} y2={45} stroke="#92400e" strokeWidth={1} />
      <Chip x={50} y={40} w={22} h={10} />
      <text x={61} y={60} textAnchor="middle" fontSize={5.2} fontWeight={700} fill="#dbeafe">{model}</text>
      <text x={100} y={60} textAnchor="middle" fontSize={5.4} fontFamily={MONO} fill={r?.inReg ? '#bbf7d0' : '#bfdbfe'}>{r ? `${fmt(r.vout, 2)} V` : `${fmt(set, 2)} V`}</text>
      <SmdLed x={26} y={50} on={!!r?.on} color="#ef4444" />
      <SidePads type="buck" />
    </g>
  )
}

function Max17048Art(c: Ctx) {
  const f = c.rt?.fuel
  return (
    <g data-fuel-present={f?.present ? 'true' : 'false'}>
      <Board w={84} h={56} fill="#7e22ce" stroke="#3b0764" hi="#d8b4fe" />
      <Chip x={30} y={10} w={24} h={12} />
      <text x={42} y={32} textAnchor="middle" fontSize={6} fontWeight={800} fill="#f3e8ff">MAX17048</text>
      <text x={42} y={40} textAnchor="middle" fontSize={5} fontFamily={MONO} fill="#e9d5ff">{f?.present ? `${fmt(f.vcell, 2)} V · %${Math.round(f.soc)}` : '0x36'}</text>
      <Pads type="max17048" />
    </g>
  )
}

/** Aşama F parçası değilse null. */
export function StageFArt({ part, runtime }: { part: Ctx['part']; runtime?: PartRuntime }) {
  const c: Ctx = { part, rt: runtime }
  switch (part.type) {
    case 'battery': return BatteryArt(c)
    case 'lm7805': return Lm7805Art(c)
    case 'buck': return BuckArt(c)
    case 'max17048': return Max17048Art(c)
    default: return null
  }
}

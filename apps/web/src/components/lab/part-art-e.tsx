// Aşama E parça çizimleri: SSD1306 OLED (çerçeve tamponu canlı çizilir), BME280, DS18B20 (TO-92), VL53L0X.
// Çalışma zamanı yoksa (palet simgesi, durdurulmuş) özelliklerden boşta durum çizilir.
import type { PartRuntime } from '@/lib/lab/contract'
import { Board, Chip, fmt, MONO, num, Pads, SmdLed, type Ctx } from './part-art-c'
import { Tx } from './tx'

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** base64 → bayt dizisi (atob'suz; sunucu ve tarayıcı). Geçersiz girişte boş dizi. */
export function decodePixels(b64: unknown): Uint8Array {
  if (typeof b64 !== 'string' || b64.length % 4 !== 0) return new Uint8Array(0)
  const out = new Uint8Array((b64.length / 4) * 3)
  let n = 0
  for (let i = 0; i < b64.length; i += 4) {
    const c = [0, 1, 2, 3].map((k) => (b64[i + k] === '=' ? 0 : B64.indexOf(b64[i + k])))
    if (c.some((x) => x < 0)) return new Uint8Array(0)
    const v = (c[0] << 18) | (c[1] << 12) | (c[2] << 6) | c[3]
    out[n++] = (v >> 16) & 255
    if (b64[i + 2] !== '=') out[n++] = (v >> 8) & 255
    if (b64[i + 3] !== '=') out[n++] = v & 255
  }
  return out.subarray(0, n)
}

/** Yanan pikselleri satır satır yatay koşulara (run) çevirip tek bir SVG yolu üretir (piksel = 1 birim). */
export function oledPath(px: Uint8Array): { d: string; lit: number } {
  if (px.length < 1024) return { d: '', lit: 0 }
  let d = '', lit = 0
  for (let y = 0; y < 64; y++) {
    const base = (y >> 3) * 128, bit = 1 << (y & 7)
    let x = 0
    while (x < 128) {
      if (!(px[base + x] & bit)) { x++; continue }
      const x0 = x
      while (x < 128 && px[base + x] & bit) x++
      lit += x - x0
      d += `M${x0} ${y}h${x - x0}v1h${x0 - x}z`
    }
  }
  return { d, lit }
}

// ---------------------------------------------------------------- SSD1306 OLED
const OLED_S = 0.6 // piksel ölçeği: 128x64 → 76,8 x 38,4
function OledArt(c: Ctx) {
  const o = c.rt?.oled
  const on = o?.on === true
  const { d, lit } = on ? oledPath(decodePixels(o?.pixels)) : { d: '', lit: 0 }
  const sx = (96 - 128 * OLED_S) / 2, sy = 24
  return (
    <g data-oled-on={on ? 'true' : 'false'} data-oled-lit={lit} data-oled-present={o?.present === true ? 'true' : 'false'}>
      <Board w={96} h={84} fill="#1e3a8a" stroke="#0b1f4d" hi="#3b82f6" />
      {/* cam panel ve siyah aktif alan */}
      <rect x={sx - 4} y={sy - 5} width={128 * OLED_S + 8} height={64 * OLED_S + 13} rx={1.5} fill="#0b0f19" stroke="#334155" strokeWidth={0.8} />
      <rect x={sx} y={sy} width={128 * OLED_S} height={64 * OLED_S} fill="#020617" />
      {d && (
        <path d={d} transform={`translate(${sx} ${sy}) scale(${OLED_S})`} fill="#d6f1ff" shapeRendering="crispEdges"
          opacity={0.55 + 0.45 * Math.min(1, (o?.contrast ?? 207) / 207)} data-oled-pixels />
      )}
      {/* esnek kablo şeridi */}
      <rect x={38} y={sy + 64 * OLED_S + 8} width={20} height={5} fill="#b45309" opacity={0.85} />
      <text x={48} y={82} textAnchor="middle" fontSize={4.4} fontWeight={700} fill="#bfdbfe">SSD1306 0.96&quot; I2C</text>
      <Pads type="oled" dy={-9} />
    </g>
  )
}

// ---------------------------------------------------------------- BME280
function Bme280Art(c: Ctx) {
  const b = c.rt?.bme280
  const present = b?.present === true
  return (
    <g data-bme-present={present ? 'true' : 'false'} data-bme-powered={b?.powered === true ? 'true' : 'false'}>
      <Board w={68} h={62} fill="#7c3aed" stroke="#3b0f87" hi="#c4b5fd" />
      {/* 2,5 x 2,5 mm metal kapaklı sensör (havalandırma deliği) */}
      <rect x={27} y={8} width={14} height={14} rx={1.2} fill="#d1d5db" stroke="#6b7280" strokeWidth={0.9} />
      <circle cx={31} cy={12} r={1.3} fill="#1f2937" />
      <Chip x={8} y={10} w={12} h={8} />
      <text x={34} y={31} textAnchor="middle" fontSize={6} fontWeight={800} fill="#f5f3ff">BME280</text>
      <text x={34} y={38.5} textAnchor="middle" fontSize={4.4} fontFamily={MONO} fill="#ede9fe">{present ? `${fmt(num(b?.tempC, 0))}°C ${fmt(num(b?.humidity, 0), 0)}%` : '—'}</text>
      <text x={34} y={44.5} textAnchor="middle" fontSize={4.4} fontFamily={MONO} fill="#ede9fe">{present ? `${fmt(num(b?.pressureHpa, 0), 1)} hPa` : ''}</text>
      <SmdLed x={58} y={12} on={b?.powered === true} color="#22c55e" />
      <Pads type="bme280" />
    </g>
  )
}

// ---------------------------------------------------------------- DS18B20 (TO-92)
function Ds18b20Art(c: Ctx) {
  const d = c.rt?.ds18b20
  const present = d?.present === true
  const t = num(d?.tempC ?? c.part.props.tempC, 25)
  return (
    <g data-ds-present={present ? 'true' : 'false'} data-ds-pullup={d ? (d.pullup ? 'true' : 'false') : ''}>
      {/* bacaklar (GND DQ VCC) */}
      {[14, 28, 42].map((x) => <line key={x} x1={x} y1={44} x2={x} y2={78} stroke="#b8c0cc" strokeWidth={2.2} strokeLinecap="round" />)}
      {/* TO-92 gövde: düz yüz önde */}
      <path d="M8 46 V20 A20 20 0 0 1 48 20 V46 Z" fill="#111827" stroke="#030712" strokeWidth={1.2} />
      <path d="M12 22 A16 16 0 0 1 26 8" fill="none" stroke="#4b5563" strokeWidth={1} />
      <text x={28} y={27} textAnchor="middle" fontSize={5.2} fontWeight={700} fill="#d1d5db">DALLAS</text>
      <text x={28} y={34} textAnchor="middle" fontSize={5.2} fontWeight={800} fill="#e5e7eb">18B20</text>
      <text x={28} y={42} textAnchor="middle" fontSize={4.6} fontFamily={MONO} fill={present ? '#86efac' : '#9ca3af'}>{d ? (present ? `${fmt(t, 2)}°C` : d.pullup ? '—' : 'pull-up?') : `${fmt(t, 1)}°C`}</text>
      <Pads type="ds18b20" strip={false} label="#1e293b" />
    </g>
  )
}

// ---------------------------------------------------------------- VL53L0X
function Vl53l0xArt(c: Ctx) {
  const v = c.rt?.vl53l0x
  const present = v?.present === true
  const mm = num(v?.distanceMm ?? c.part.props.distanceMm, 500)
  const inRange = v ? v.inRange : mm <= 2000
  const active = present && (v?.measurements ?? 0) > 0
  return (
    <g data-tof-present={present ? 'true' : 'false'} data-tof-active={active ? 'true' : 'false'}>
      <Board w={100} h={62} fill="#7e22ce" stroke="#3b0764" hi="#d8b4fe" />
      {/* sensör modülü: verici (VCSEL) ve alıcı pencereleri */}
      <rect x={38} y={8} width={24} height={14} rx={2} fill="#111827" stroke="#030712" strokeWidth={0.9} />
      <circle cx={44} cy={15} r={3.2} fill={active ? '#fda4af' : '#374151'} stroke="#6b7280" strokeWidth={0.5} />
      <circle cx={56} cy={15} r={3.2} fill="#1f2937" stroke="#6b7280" strokeWidth={0.5} />
      {active && <path d="M44 8 L38 1 M44 8 L44 0 M44 8 L50 1" stroke="#f43f5e" strokeWidth={0.8} opacity={0.6} />}
      <text x={50} y={32} textAnchor="middle" fontSize={6} fontWeight={800} fill="#f3e8ff">VL53L0X</text>
      <text x={50} y={40} textAnchor="middle" fontSize={4.8} fontFamily={MONO} fill={inRange ? '#e9d5ff' : '#fecaca'}>
        {!v || present ? (inRange ? `${Math.round(mm)} mm` : <Tx k="lab.art.outOfRange" />) : '—'}
      </text>
      <SmdLed x={88} y={12} on={v?.powered === true} color="#22c55e" />
      <Pads type="vl53l0x" />
    </g>
  )
}

/** Aşama E parçası değilse null. */
export function StageEArt({ part, runtime }: { part: Ctx['part']; runtime?: PartRuntime }) {
  const c: Ctx = { part, rt: runtime }
  switch (part.type) {
    case 'oled': return OledArt(c)
    case 'bme280': return Bme280Art(c)
    case 'ds18b20': return Ds18b20Art(c)
    case 'vl53l0x': return Vl53l0xArt(c)
    default: return null
  }
}

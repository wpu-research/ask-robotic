// 3B akıllı sera sahnesinin saf mantığı (three.js yok, testli). Sahne yalnız bunu çizer: sera günü (kural motoru benzetimi),
// düğümlerin konumu ve MQTT paketlerinin broker üzerinden yönlendirilmesi. Konumlar dünya koordinatında (metre, Y yukarı).
import type { DayResult } from './rules'
import type { Actuator } from './rules'

export type NodeId = 'sensor' | 'actuator' | 'broker' | 'dashboard'
export type V3 = readonly [number, number, number]

/** Düğüm konumları: sensör seranın ortasında direkte, eyleyici kapı duvarında, broker serbest (bulut), pano masada. */
export const NODES: Record<NodeId, V3> = {
  sensor: [0, 1.1, 0.2],
  actuator: [-1.9, 1.0, -1.1],
  broker: [0, 3.6, -2.6],
  dashboard: [3.4, 1.0, 1.6],
}

export type PacketKind = 'telemetry' | 'command' | 'state'
export interface Message { minute: number; from: NodeId; to: NodeId[]; topic: string; payload: string; kind: PacketKind }

/** Telemetri yayın aralığı (dakika) ve paketin bir bacağı (kaynak → broker ya da broker → abone) için geçen süre (dakika). */
export const TELEMETRY_EVERY = 10
export const HOP_MIN = 2

/** Abone listesi: kimin hangi tür mesajı alacağı (konu ağacı: sera/01/..., sera/02/komut/..., sera/02/durum). */
export const SUBSCRIBERS: Record<PacketKind, NodeId[]> = { telemetry: ['actuator', 'dashboard'], command: ['actuator'], state: ['dashboard'] }

/**
 * Günün mesajları: her TELEMETRY_EVERY dakikada sensörden sıcaklık; bir eyleyici değiştiğinde eyleyiciden kalıcı durum
 * mesajı. Panodan gelen elle komutlar `manual` ile eklenir (dakika, eyleyici, değer).
 */
export function messagesOfDay(day: DayResult, manual: Array<{ minute: number; act: Actuator; value: 0 | 1 }> = []): Message[] {
  const out: Message[] = []
  const acts = Object.keys(day.acts) as Actuator[]
  for (let m = 0; m < day.temp.length; m++) {
    if (m % TELEMETRY_EVERY === 0) out.push({ minute: m, from: 'sensor', to: SUBSCRIBERS.telemetry, topic: 'sera/01/sicaklik', payload: day.temp[m].toFixed(1), kind: 'telemetry' })
    for (const a of acts) if (m > 0 && day.acts[a][m] !== day.acts[a][m - 1]) out.push({ minute: m, from: 'actuator', to: SUBSCRIBERS.state, topic: `sera/02/durum/${a}`, payload: String(day.acts[a][m]), kind: 'state' })
  }
  for (const c of manual) out.push({ minute: c.minute, from: 'dashboard', to: SUBSCRIBERS.command, topic: `sera/02/komut/${c.act}`, payload: String(c.value), kind: 'command' })
  return out.sort((a, b) => a.minute - b.minute)
}

const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/** Paketin yolu her zaman broker üzerinden: kaynak → broker → abone (yayımla/abone ol modelinde cihazlar birbirini görmez). */
export const route = (from: NodeId, to: NodeId): V3[] => [NODES[from], NODES.broker, NODES[to]]

/** Yol üzerinde konum: p ∈ [0, 1]; ilk yarı ilk bacak, ikinci yarı ikinci bacak. Bacağın ortasında hafif kavis (yay). */
export function along(path: readonly V3[], p: number): V3 {
  const legs = path.length - 1
  const x = Math.max(0, Math.min(1, p)) * legs
  const i = Math.min(legs - 1, Math.floor(x))
  const t = x - i
  const q = lerp(path[i], path[i + 1], t)
  return [q[0], q[1] + 0.35 * Math.sin(Math.PI * t), q[2]]
}

export interface LivePacket { key: string; kind: PacketKind; to: NodeId; pos: V3; topic: string; payload: string }

/** t dakikasında havadaki paketler: yayından sonra 2·HOP_MIN dakika boyunca, her abone için bir kopya. */
export function packetsAt(msgs: readonly Message[], t: number): LivePacket[] {
  const out: LivePacket[] = []
  const span = 2 * HOP_MIN
  for (const m of msgs) {
    if (m.minute > t) break
    const p = (t - m.minute) / span
    if (p > 1) continue
    m.to.forEach((to, k) => out.push({ key: `${m.minute}-${m.topic}-${k}`, kind: m.kind, to, pos: along(route(m.from, to), p), topic: m.topic, payload: m.payload }))
  }
  return out
}

/** Sahnenin bir anı: dakika (ondalıklı), o andaki sera değerleri ve eyleyiciler. */
export interface GreenhouseFrame { minute: number; hour: number; temp: number; hum: number; soil: number; out: number; acts: Record<Actuator, 0 | 1>; sun: number }
export function frameAt(day: DayResult, minute: number, cloud = 0.2): GreenhouseFrame {
  const m = Math.max(0, Math.min(day.temp.length - 1, Math.floor(minute)))
  const h = minute / 60
  const acts = Object.fromEntries((Object.keys(day.acts) as Actuator[]).map((a) => [a, day.acts[a][m]])) as Record<Actuator, 0 | 1>
  return { minute, hour: h, temp: day.temp[m], hum: day.hum[m], soil: day.soil[m], out: day.out[m], acts, sun: Math.max(0, Math.sin(((h - 6) / 12) * Math.PI)) * (1 - 0.7 * cloud) }
}

/** Sıcaklığı renge çevirir (mavi 10 °C → yeşil 24 °C → kırmızı 38 °C); 0xRRGGBB. Hem IoT hem sensör-ML sahnesi kullanır. */
export function tempColor(t: number): number {
  const stops: Array<[number, [number, number, number]]> = [[10, [59, 130, 246]], [24, [34, 197, 94]], [31, [234, 179, 8]], [38, [239, 68, 68]]]
  const v = Math.max(stops[0][0], Math.min(stops[stops.length - 1][0], Number.isFinite(t) ? t : 24))
  let i = 0
  while (i < stops.length - 2 && v > stops[i + 1][0]) i++
  const [t0, c0] = stops[i], [t1, c1] = stops[i + 1]
  const k = (v - t0) / (t1 - t0)
  const c = c0.map((x, j) => Math.round(x + (c1[j] - x) * k))
  return (c[0] << 16) | (c[1] << 8) | c[2]
}

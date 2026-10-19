// Sensörden buluta ve buluttan eyleyiciye: simüle cihaz okumaları (DHT22, BME280, LDR), MQTT paket boyutu ve günlük veri
// hesabı, "değişince bildir" (ölü bant + kalp atışı), komut idempotentliği (toggle ve set) ile cihaz gölgesi (desired/reported),
// pano için halka tampon ve min/max seyreltme. Saf mantık.
import { gauss, rng } from '@/lib/ml/core'
import { simulateQos, type QoS } from './mqtt'

// --- Simüle sensörler -------------------------------------------------------------------------------------------------------

export interface Reading { temp: number; hum: number; pres: number; light: number }
const r1 = (x: number) => Math.round(x * 10) / 10

/** t saniyesindeki okuma (gün 86400 s). Aynı cihaz + aynı t = aynı değer; cihazlar `phase` ve `seed` ile ayrışır. */
export function readSensor(t: number, seed = 1, phase = 0): Reading {
  const h = ((t / 3600) + phase) % 24
  const day = Math.sin(((h - 9) / 24) * 2 * Math.PI)
  const r = rng(seed * 100_003 + Math.floor(t))
  const n = () => gauss(r)
  const sun = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI))
  return {
    temp: r1(21 + 5 * day + 0.25 * n()),
    hum: r1(Math.min(99, Math.max(10, 58 - 12 * day + 0.8 * n()))),
    pres: r1(1013 + 2 * Math.sin((t / 86400) * 2 * Math.PI * 0.5) + 0.15 * n()),
    light: Math.max(0, Math.round(900 * sun + 15 * n())),
  }
}

// --- Paket boyutu ----------------------------------------------------------------------------------------------------------

/** MQTT "kalan uzunluk" alanının bayt sayısı (değişken uzunluklu tamsayı, 7 bit/bayt). */
export const remLenBytes = (n: number): number => (n < 128 ? 1 : n < 16_384 ? 2 : n < 2_097_152 ? 3 : 4)
const utf8 = (s: string) => new TextEncoder().encode(s).length

/** PUBLISH paket boyutu: 1 bayt sabit başlık + kalan uzunluk + (2 + konu) + QoS>0 ise 2 bayt paket kimliği + yük. */
export function publishSize(topic: string, payloadBytes: number, qos: QoS): number {
  const rem = 2 + utf8(topic) + (qos > 0 ? 2 : 0) + payloadBytes
  return 1 + remLenBytes(rem) + rem
}

export type PayloadFmt = 'json' | 'csv' | 'bin'
/** Aynı okumanın üç biçimde yükü. bin: int16 sıcaklık×10, uint16 nem×10, uint16 (basınç-900)×10, uint16 ışık = 8 bayt. */
export function payload(r: Reading, fmt: PayloadFmt, id = 'sera-01'): { text: string; bytes: number } {
  if (fmt === 'json') { const text = JSON.stringify({ id, t: r.temp, h: r.hum, p: r.pres, l: r.light }); return { text, bytes: utf8(text) } }
  if (fmt === 'csv') { const text = `${r.temp},${r.hum},${r.pres},${r.light}`; return { text, bytes: utf8(text) } }
  const b = [Math.round(r.temp * 10), Math.round(r.hum * 10), Math.round((r.pres - 900) * 10), r.light]
  const hex = b.map((v) => (v & 0xffff).toString(16).padStart(4, '0').replace(/(..)(..)/, '$2 $1')).join(' ')
  return { text: hex, bytes: 8 }
}

/** Günlük trafik: mesaj sayısı ve bayt (TCP/IP başlıkları dahil ~40 B/paket; TLS kaydı ~29 B ek). */
export function dailyTraffic(intervalS: number, pktBytes: number, tls: boolean): { msgs: number; bytes: number } {
  const msgs = Math.floor(86400 / intervalS)
  return { msgs, bytes: msgs * (pktBytes + 40 + (tls ? 29 : 0)) }
}

/** Değişince bildir: |Δ| ≥ ölü bant ya da son yayından bu yana `heartbeat` örnek geçtiyse yayımla. Yayımlanan indeksler döner. */
export function reportOnChange(xs: readonly number[], deadband: number, heartbeat: number): number[] {
  const out: number[] = []
  let last = NaN, since = 0
  xs.forEach((x, i) => {
    since++
    if (!out.length || Math.abs(x - last) >= deadband || since >= heartbeat) { out.push(i); last = x; since = 0 }
  })
  return out
}

// --- Eyleyici: idempotentlik ve gölge -------------------------------------------------------------------------------------

export interface CmdResult { final: boolean; expected: boolean; applied: number; duplicates: number; lost: number }

/**
 * Kayıplı QoS 1 bağlantıda n komut. "toggle" her teslimde durumu çevirir: yinelenen teslim durumu bozar.
 * "set" mutlak değeri yazar (idempotent); "setId" ayrıca komut kimliğini saklar ve aynı kimliği ikinci kez uygulamaz.
 */
export function commandRun(kind: 'toggle' | 'set' | 'setId', n: number, loss: number, seed = 11, qos: QoS = 1): CmdResult {
  const res = simulateQos(qos, n, loss, seed)
  // trace'ten her mesajın alıcıya kaç kez ulaştığını çıkar
  const hits = new Array<number>(n).fill(0)
  for (const row of res.trace) if (row.pkt === 'PUBLISH' && !row.lost) hits[row.msg]++
  if (qos === 2) for (let i = 0; i < n; i++) hits[i] = Math.min(1, hits[i])
  let state = false, applied = 0
  const seen = new Set<number>()
  const want = (i: number) => i % 2 === 0 // komut dizisi: aç, kapat, aç, kapat… (toggle için de aynı niyet)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < hits[i]; k++) {
      if (kind === 'toggle') { state = !state; applied++ }
      else if (kind === 'set') { state = want(i); applied++ }
      else if (!seen.has(i)) { seen.add(i); state = want(i); applied++ }
    }
  }
  return { final: state, expected: n > 0 ? want(n - 1) : false, applied, duplicates: res.duplicates, lost: res.lost }
}

export interface Shadow { desired: Record<string, number>; reported: Record<string, number> }
/** Gölge farkı: istenen ama cihazın henüz bildirmediği ya da farklı bildirdiği alanlar. */
export function shadowDelta(s: Shadow): Record<string, number> {
  const d: Record<string, number> = {}
  for (const [k, v] of Object.entries(s.desired)) if (s.reported[k] !== v) d[k] = v
  return d
}

// --- Pano yardımcıları ------------------------------------------------------------------------------------------------------

/** Sabit kapasiteli halka tampon: en eski değer ezilir; toArray en eskiden en yeniye. */
export class Ring {
  private buf: number[]
  private head = 0
  size = 0
  constructor(readonly cap: number) { this.buf = new Array<number>(cap).fill(NaN) }
  push(v: number) { this.buf[this.head] = v; this.head = (this.head + 1) % this.cap; this.size = Math.min(this.cap, this.size + 1) }
  toArray(): number[] { const out: number[] = []; for (let i = 0; i < this.size; i++) out.push(this.buf[(this.head - this.size + i + this.cap) % this.cap]); return out }
}

/** Min/max seyreltme: her kovadan en küçük ve en büyük değer (sıra korunur), tepeler kaybolmaz. */
export function minMaxDownsample(xs: readonly number[], buckets: number): number[] {
  if (xs.length <= buckets * 2) return [...xs]
  const out: number[] = [], size = xs.length / buckets
  for (let b = 0; b < buckets; b++) {
    const s = Math.floor(b * size), e = Math.floor((b + 1) * size)
    let lo = s, hi = s
    for (let i = s; i < e; i++) { if (xs[i] < xs[lo]) lo = i; if (xs[i] > xs[hi]) hi = i }
    if (lo === hi) out.push(xs[lo]); else if (lo < hi) out.push(xs[lo], xs[hi]); else out.push(xs[hi], xs[lo])
  }
  return out
}

/** Eşik uyarısı (histerezisli): değer `on` üstüne çıkınca açılır, `off` altına inince kapanır. */
export function alarmStates(xs: readonly number[], on: number, off: number): boolean[] {
  let a = false
  return xs.map((x) => (a = a ? x > off : x >= on))
}

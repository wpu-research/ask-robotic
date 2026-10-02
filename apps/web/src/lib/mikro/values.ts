// Değer dönüşümleri (yorumlayıcı ve ops paylaşır).
import type { Value } from './types'

export const isList = (v: Value | undefined): v is Value[] => Array.isArray(v)

export function toNum(v: Value | undefined): number {
  if (typeof v === 'number') return v
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'string') { const n = Number(v.trim() === '' ? NaN : v); return Number.isFinite(n) ? n : 0 }
  return 0
}

/** Sayıyı gösterim metnine çevirir: 0.1+0.2 gibi artıkları temizler. */
export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return Number.isNaN(n) ? 'NaN' : n > 0 ? 'Infinity' : '-Infinity'
  if (Number.isInteger(n)) return String(n)
  return String(parseFloat(n.toPrecision(10)))
}

export function toStr(v: Value | undefined): string {
  if (typeof v === 'number') return fmtNum(v)
  if (typeof v === 'string') return v
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (Array.isArray(v)) return `[${v.map((x) => (typeof x === 'string' ? JSON.stringify(x) : toStr(x))).join(', ')}]`
  return ''
}

export const truthy = (v: Value | undefined): boolean => (Array.isArray(v) ? v.length > 0 : !!v)

/** JavaScript `==` benzeri gevşek eşitlik (sayı ile sayı gibi yazı eşit sayılır). */
export function looseEq(a: Value | undefined, b: Value | undefined): boolean {
  if (a === undefined) a = null
  if (b === undefined) b = null
  if (Array.isArray(a) || Array.isArray(b)) return a === b
  // eslint-disable-next-line eqeqeq
  return a == b
}

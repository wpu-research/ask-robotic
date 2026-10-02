// Proje kaydı: localStorage + içe/dışa aktarma (JSON). Sunucuya hiçbir şey gönderilmez.
import { ALL_BLOCK_TYPES } from './blocks'
import type { MikroProject, PBlock } from './types'

export const DEFAULT_STORAGE_KEY = 'ask:mikro:project:v1'
export const MAX_PROJECT_BYTES = 2_000_000
const MAX_BLOCKS = 4000
const KNOWN = new Set(ALL_BLOCK_TYPES)

export type ParseResult = { ok: true; project: MikroProject } | { ok: false; error: string }

function checkBlock(b: unknown, depth: number, counter: { n: number }): string | null {
  if (depth > 200) return 'Bloklar çok derin iç içe.'
  if (!b || typeof b !== 'object') return 'Geçersiz blok.'
  const blk = b as PBlock
  if (typeof blk.type !== 'string') return 'Blok türü eksik.'
  if (!KNOWN.has(blk.type)) return `Tanınmayan blok: ${blk.type}`
  if (++counter.n > MAX_BLOCKS) return 'Çok fazla blok var.'
  if (blk.inputs) {
    for (const inp of Object.values(blk.inputs)) {
      if (!inp || typeof inp !== 'object') return 'Geçersiz giriş.'
      for (const k of ['block', 'shadow'] as const) if (inp[k]) { const e = checkBlock(inp[k], depth + 1, counter); if (e) return e }
    }
  }
  if (blk.next?.block) { const e = checkBlock(blk.next.block, depth + 1, counter); if (e) return e }
  return null
}

/** Dış kaynaktan gelen JSON'u doğrular (bilinmeyen blok, bozuk yapı, aşırı boyut reddedilir). */
export function validateProject(x: unknown): ParseResult {
  if (!x || typeof x !== 'object') return { ok: false, error: 'Dosya bir proje gibi görünmüyor.' }
  const p = x as Partial<MikroProject>
  if (p.version !== 1) return { ok: false, error: 'Bu proje sürümü desteklenmiyor.' }
  const blocks = p.workspace?.blocks?.blocks
  if (!Array.isArray(blocks)) return { ok: false, error: 'Projede blok bulunamadı.' }
  const counter = { n: 0 }
  for (const b of blocks) { const e = checkBlock(b, 0, counter); if (e) return { ok: false, error: e } }
  const vars = p.workspace?.variables
  if (vars !== undefined && (!Array.isArray(vars) || vars.some((v) => !v || typeof v.name !== 'string' || typeof v.id !== 'string'))) return { ok: false, error: 'Değişken listesi bozuk.' }
  return { ok: true, project: { version: 1, name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 60) : 'Projem', workspace: { blocks: { languageVersion: 0, blocks }, variables: vars ?? [] } } }
}

export function parseProject(text: string): ParseResult {
  if (text.length > MAX_PROJECT_BYTES) return { ok: false, error: 'Dosya çok büyük.' }
  let data: unknown
  try { data = JSON.parse(text) } catch { return { ok: false, error: 'Dosya okunamadı (JSON değil).' } }
  return validateProject(data)
}

export const exportProject = (p: MikroProject): string => JSON.stringify({ version: 1, name: p.name, workspace: p.workspace }, null, 2)

export function fileNameFor(p: MikroProject): string {
  const slug = p.name.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slug || 'proje'}.mikro.json`
}

export function loadProject(key: string): MikroProject | null {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
    if (!raw) return null
    const r = parseProject(raw)
    return r.ok ? r.project : null
  } catch { return null }
}

export function saveProject(key: string, p: MikroProject): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(key, exportProject(p))
    return true
  } catch { return false }
}

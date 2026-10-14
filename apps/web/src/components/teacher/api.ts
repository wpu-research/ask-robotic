import type { MessageKey, TFunction } from '@/i18n'
import { teacher as trTeacher } from '@/i18n/tr/teacher'

// İstemci: JSON isteği; hata mesajını Türkçe döndürür (API gövdesi). Ekranda localizeError ile arayüz diline çevrilir.
export async function sendJson<T = Record<string, unknown>>(url: string, body: unknown, method = 'POST'): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: (data as { error?: string }).error ?? trTeacher.errors.generic }
    return { ok: true, data: data as T }
  } catch {
    return { ok: false, error: trTeacher.errors.network }
  }
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Türkçe API mesajı → sözlük anahtarı (teacher.errors). `{n}` yer tutucuları sayı olarak yakalanır.
const PATTERNS = Object.entries(trTeacher.errors).map(([k, tpl]) => {
  const names: string[] = []
  const re = new RegExp(`^${tpl.split(/\{(\w+)\}/).map((part, i) => (i % 2 ? (names.push(part), '(\\d+)') : esc(part))).join('')}$`)
  return { key: `teacher.errors.${k}` as MessageKey, re, names }
})

/** Sunucunun Türkçe hata metnini arayüz diline çevirir; tanınmayan metin olduğu gibi döner. */
export function localizeError(t: TFunction, msg: string): string {
  for (const p of PATTERNS) {
    const m = p.re.exec(msg)
    if (m) return t(p.key, Object.fromEntries(p.names.map((n, i) => [n, Number(m[i + 1])])))
  }
  return msg
}

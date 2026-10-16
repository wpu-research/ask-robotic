// Derleme API'si istemcisi: POST /api/compile. Hiçbir durumda fırlatmaz; sonuç her zaman CompileOutcome'tur.
export interface CompileError { line: number; column?: number; message: string }
export type CompileOutcome =
  | { ok: true; hex: string; flashBytes?: number; ramBytes?: number }
  | { ok: false; errors: CompileError[]; message?: string; unavailable?: boolean; reason?: CompileFailReason }

/** Bilinen hata durumları: arayüz `lab.compile.<reason>` metnini gösterir (`message` Türkçe kaynak). */
export type CompileFailReason = 'busy' | 'unavailable' | 'tooMany' | 'tooBig' | 'timeout' | 'tooLong' | 'unreachable' | 'failed'

const asErrors = (v: unknown): CompileError[] =>
  Array.isArray(v)
    ? v.filter((e) => e && typeof e.message === 'string').map((e) => ({
        line: Number.isFinite(Number(e.line)) ? Math.max(1, Math.floor(Number(e.line))) : 1,
        column: Number.isFinite(Number(e.column)) ? Number(e.column) : undefined,
        message: String(e.message),
      }))
    : []

export async function compileCode(code: string, fetchImpl: typeof fetch = fetch): Promise<CompileOutcome> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 100_000)
  try {
    const res = await fetchImpl('/api/compile', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }), signal: ctl.signal,
    })
    let body: Record<string, unknown> | null = null
    try { body = await res.json() } catch { /* JSON değil */ }
    if (res.ok && body?.ok === true && typeof body.hex === 'string') {
      return {
        ok: true, hex: body.hex,
        flashBytes: typeof body.flashBytes === 'number' ? body.flashBytes : undefined,
        ramBytes: typeof body.ramBytes === 'number' ? body.ramBytes : undefined,
      }
    }
    const errors = asErrors(body?.errors)
    if (errors.length) return { ok: false, errors }
    if (res.status === 503) {
      const busy = typeof body?.error === 'string' && /s[ıi]ra/i.test(body.error)
      return busy
        ? { ok: false, errors: [], reason: 'busy', message: 'Derleme sırası dolu, birazdan tekrar dene.' }
        : { ok: false, errors: [], unavailable: true, reason: 'unavailable', message: 'Derleme servisi şu an kapalı. Daha sonra tekrar dene.' }
    }
    if (res.status === 429) return { ok: false, errors: [], reason: 'tooMany', message: 'Çok fazla derleme isteği gönderdin, bir dakika bekleyip tekrar dene.' }
    if (res.status === 413) return { ok: false, errors: [], reason: 'tooBig', message: 'Kod çok büyük, kısaltıp tekrar dene.' }
    if (res.status === 504) return { ok: false, errors: [], reason: 'timeout', message: 'Derleme zaman aşımına uğradı.' }
    return typeof body?.error === 'string' ? { ok: false, errors: [], message: body.error } : { ok: false, errors: [], reason: 'failed', message: 'Derleme başarısız oldu.' }
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError'
    return aborted
      ? { ok: false, errors: [], reason: 'tooLong', message: 'Derleme çok uzun sürdü.' }
      : { ok: false, errors: [], reason: 'unreachable', message: 'Derleme servisine ulaşılamadı. Bağlantını kontrol et.' }
  } finally {
    clearTimeout(timer)
  }
}

// Derleme API'si istemcisi: POST /api/compile. Hiçbir durumda fırlatmaz; sonuç her zaman CompileOutcome'tur.
export interface CompileError { line: number; column?: number; message: string }
export type CompileOutcome =
  | { ok: true; hex: string; flashBytes?: number; ramBytes?: number }
  | { ok: false; errors: CompileError[]; message?: string; unavailable?: boolean }

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
        ? { ok: false, errors: [], message: 'Derleme sırası dolu, birazdan tekrar dene.' }
        : { ok: false, errors: [], unavailable: true, message: 'Derleme servisi şu an kapalı. Daha sonra tekrar dene.' }
    }
    if (res.status === 429) return { ok: false, errors: [], message: 'Çok fazla derleme isteği gönderdin, bir dakika bekleyip tekrar dene.' }
    if (res.status === 413) return { ok: false, errors: [], message: 'Kod çok büyük, kısaltıp tekrar dene.' }
    if (res.status === 504) return { ok: false, errors: [], message: 'Derleme zaman aşımına uğradı.' }
    return { ok: false, errors: [], message: typeof body?.error === 'string' ? body.error : 'Derleme başarısız oldu.' }
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError'
    return { ok: false, errors: [], message: aborted ? 'Derleme çok uzun sürdü.' : 'Derleme servisine ulaşılamadı. Bağlantını kontrol et.' }
  } finally {
    clearTimeout(timer)
  }
}

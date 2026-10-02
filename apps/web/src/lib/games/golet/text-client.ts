// Tarayıcı tarafı: JavaScript kodunu Web Worker'da çalıştırır; süre aşımında işçiyi öldürür.
import type { MatchResult } from './textmatch'
import type { PondData } from './sim'
import type { WorkerRequest } from './match.worker'

export const TEXT_TIMEOUT_MS = 6000

export type TextRun = { ok: true; result: MatchResult } | { ok: false; error: string }

export function runInWorker(code: string, data: PondData, seed = 1, timeoutMs = TEXT_TIMEOUT_MS): Promise<TextRun> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./match.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      resolve({ ok: false, error: 'Bu tarayıcıda kod çalıştırılamıyor (Web Worker yok).' })
      return
    }
    const finish = (r: TextRun) => { clearTimeout(timer); worker.terminate(); resolve(r) }
    const timer = setTimeout(() => finish({ ok: false, error: 'Kodun çok uzun sürdü. Sonsuz bir döngü olabilir mi? ("while (true)" yazma: kod zaten her tikte tekrar çalışır.)' }), timeoutMs)
    worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: MatchResult; error?: string }>) => {
      if (e.data.ok && e.data.result) finish({ ok: true, result: e.data.result })
      else finish({ ok: false, error: e.data.error ?? 'Maç çalıştırılamadı.' })
    }
    worker.onerror = (e) => finish({ ok: false, error: e.message || 'Kod çalışırken hata oluştu.' })
    const req: WorkerRequest = { code, data, seed }
    worker.postMessage(req)
  })
}

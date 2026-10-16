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

/** Gölet JavaScript kipi hata iletilerinin İngilizcesi (bilinmeyenler olduğu gibi döner). */
export function goletErrorEn(msg: string): string {
  const fixed: Record<string, string> = {
    'Bu tarayıcıda kod çalıştırılamıyor (Web Worker yok).': "Code can't run in this browser (no Web Worker).",
    'Kodun çok uzun sürdü. Sonsuz bir döngü olabilir mi? ("while (true)" yazma: kod zaten her tikte tekrar çalışır.)': 'Your code took too long. Could there be an endless loop? (Don\'t write "while (true)": the code already runs again every tick.)',
    'Maç çalıştırılamadı.': "The match couldn't be run.",
    'Kod çalışırken hata oluştu.': 'Something went wrong while the code was running.',
  }
  if (fixed[msg]) return fixed[msg]
  let m = /^Kodda yazım hatası: ([\s\S]*)$/.exec(msg)
  if (m) return `Syntax error in your code: ${m[1]}`
  m = /^Kodun (\d+)\. tikte hata verdi: ([\s\S]*)$/.exec(msg)
  if (m) return `Your code failed on tick ${m[1]}: ${m[2]}`
  return msg
}

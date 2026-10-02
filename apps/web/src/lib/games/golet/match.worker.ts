// Web Worker: oyuncunun JavaScript kodunu tarayıcıda izole çalıştırır (DOM, depolama, çerez yok).
// Ana iş parçacığı bu işçiyi süre aşımında `terminate()` eder (sonsuz döngü koruması). Tüm maç burada hesaplanır, kareler geri gönderilir.
import { runTextMatch } from './textmatch'
import type { PondData } from './sim'

export interface WorkerRequest { code: string; data: PondData; seed: number }

const scope = self as unknown as {
  postMessage(m: unknown): void
  onmessage: ((e: { data: WorkerRequest }) => void) | null
}
const post = scope.postMessage.bind(scope)

// Kullanıcı kodu bu kapsamı görebilir: ağ ve iletişim yollarını kapat.
for (const k of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches', 'BroadcastChannel', 'SharedWorker', 'Worker', 'postMessage', 'close']) {
  try { Object.defineProperty(self, k, { value: undefined, configurable: true, writable: true }) } catch { /* yoksay */ }
}

scope.onmessage = (e) => {
  try {
    post({ ok: true, result: runTextMatch(e.data.code, e.data.data, e.data.seed) })
  } catch (err) {
    post({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}

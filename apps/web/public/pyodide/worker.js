// Makine Öğrenmesi dersleri: tarayıcıda Python (Pyodide + NumPy). Sınıf (classic) Web Worker; sayfa bunu yalnız ilk
// "Çalıştır" tıklamasında oluşturur. Çalışma ortamı ilk yüklemeden sonra sıcak tutulur; her çalıştırma yeni bir ad alanında
// (boş dict) çalışır, değişkenler bir öncekinden sızmaz. Veri dosyaları her çalıştırmadan önce sanal dosya sistemine yazılır.
//
// Mesajlar (sayfa → worker): { type: 'run', id, code, files: [{ name, url } | { name, bytes }] }
// Mesajlar (worker → sayfa): { type: 'progress', stage: 'loading-runtime' | 'loading-numpy' | 'ready' }
//                            { type: 'out', id, text, stream: 'stdout' | 'stderr' }
//                            { type: 'done', id, ok, error?, ms }
/* global importScripts, loadPyodide */
const PYODIDE_VERSION = '0.26.4'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let ready = null
let current = null

/** Çıktıyı satır satır biriktirip kısa aralıklarla gönderir (her print için ayrı mesaj olmasın). */
const buf = { stdout: '', stderr: '' }
let flushTimer = 0
let lastFlush = 0
function flush() {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = 0
  lastFlush = performance.now()
  for (const stream of ['stdout', 'stderr']) {
    if (buf[stream]) { self.postMessage({ type: 'out', id: current, text: buf[stream], stream }); buf[stream] = '' }
  }
}
function push(stream, text) {
  buf[stream] += text + '\n'
  // Python döngüsü worker'ı meşgul tutarken zamanlayıcı çalışmaz: süre dolduysa hemen gönder
  if (performance.now() - lastFlush > 50) flush()
  else if (!flushTimer) flushTimer = setTimeout(flush, 50)
}

function load() {
  if (ready) return ready
  ready = (async () => {
    self.postMessage({ type: 'progress', stage: 'loading-runtime' })
    importScripts(PYODIDE_URL + 'pyodide.js')
    const py = await loadPyodide({ indexURL: PYODIDE_URL })
    self.postMessage({ type: 'progress', stage: 'loading-numpy' })
    await py.loadPackage('numpy')
    py.setStdout({ batched: (s) => push('stdout', s) })
    py.setStderr({ batched: (s) => push('stderr', s) })
    py.FS.mkdirTree('/home/pyodide')
    py.FS.chdir('/home/pyodide')
    self.postMessage({ type: 'progress', stage: 'ready' })
    return py
  })()
  return ready
}

/** Python hata metninin son, anlamlı satırları (Pyodide'nin iç çerçeveleri olmadan). */
function formatError(e) {
  const msg = String((e && e.message) || e)
  const lines = msg.split('\n')
  const start = lines.findIndex((l) => l.includes('File "<exec>"'))
  return (start >= 0 ? ['Traceback (most recent call last):', ...lines.slice(start)] : lines.slice(-8)).join('\n').trim()
}

self.onmessage = async (ev) => {
  const m = ev.data
  if (!m || m.type !== 'run') return
  current = m.id
  const t0 = performance.now()
  let py
  try {
    py = await load()
  } catch (e) {
    self.postMessage({ type: 'done', id: m.id, ok: false, error: 'Pyodide yüklenemedi / could not load Pyodide: ' + String((e && e.message) || e), ms: 0 })
    return
  }
  const t1 = performance.now()
  try {
    for (const f of m.files || []) {
      let bytes = f.bytes
      if (!bytes && f.url) {
        const res = await fetch(f.url)
        if (!res.ok) throw new Error(`${f.url}: HTTP ${res.status}`)
        bytes = await res.arrayBuffer()
      }
      if (bytes) py.FS.writeFile(f.name, new Uint8Array(bytes))
    }
    const ns = py.globals.get('dict')()
    try {
      await py.runPythonAsync(m.code, { globals: ns })
    } finally {
      ns.destroy()
    }
    flush()
    self.postMessage({ type: 'done', id: m.id, ok: true, ms: Math.round(performance.now() - t1), loadMs: Math.round(t1 - t0) })
  } catch (e) {
    flush()
    self.postMessage({ type: 'done', id: m.id, ok: false, error: formatError(e), ms: Math.round(performance.now() - t1), loadMs: Math.round(t1 - t0) })
  }
}

// OpenCV dersi: tarayıcıda Python (Pyodide + NumPy + opencv-python). Sınıf (classic) Web Worker; sayfa bunu yalnız ilk
// "Tarayıcıda çalıştır" tıklamasında oluşturur. Makine öğrenmesi dersinin worker.js'iyle aynı düzen; ek olarak opencv-python
// yüklenir, girdi görüntüsü 'girdi.png' olarak yazılır ve çalıştırma sonunda 'cikti.png' varsa baytları geri gönderilir.
//
// Mesajlar (sayfa → worker): { type: 'run', id, code, files: [{ name, bytes }] }
// Mesajlar (worker → sayfa): { type: 'progress', stage: 'loading-runtime' | 'loading-cv' | 'ready' }
//                            { type: 'out', id, text, stream: 'stdout' | 'stderr' }
//                            { type: 'done', id, ok, error?, ms, image?: ArrayBuffer }
/* global importScripts, loadPyodide */
const PYODIDE_VERSION = '0.26.4'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let ready = null
let current = null

function load() {
  if (ready) return ready
  ready = (async () => {
    self.postMessage({ type: 'progress', stage: 'loading-runtime' })
    importScripts(PYODIDE_URL + 'pyodide.js')
    const py = await loadPyodide({ indexURL: PYODIDE_URL })
    self.postMessage({ type: 'progress', stage: 'loading-cv' })
    await py.loadPackage(['numpy', 'opencv-python'])
    py.setStdout({ batched: (s) => self.postMessage({ type: 'out', id: current, text: s + '\n', stream: 'stdout' }) })
    py.setStderr({ batched: (s) => self.postMessage({ type: 'out', id: current, text: s + '\n', stream: 'stderr' }) })
    py.FS.mkdirTree('/home/pyodide')
    py.FS.chdir('/home/pyodide')
    self.postMessage({ type: 'progress', stage: 'ready' })
    return py
  })()
  return ready
}

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
    try { py.FS.unlink('cikti.png') } catch { /* yoksa sorun değil */ }
    for (const f of m.files || []) py.FS.writeFile(f.name, new Uint8Array(f.bytes))
    await py.runPythonAsync(m.code, { globals: py.toPy({ __name__: '__main__' }) })
    let image
    try { image = py.FS.readFile('cikti.png').buffer } catch { image = undefined }
    self.postMessage({ type: 'done', id: m.id, ok: true, ms: performance.now() - t1, image }, image ? [image] : [])
  } catch (e) {
    self.postMessage({ type: 'done', id: m.id, ok: false, error: formatError(e), ms: performance.now() - t1 })
  }
  void t0
}

// Makine Öğrenmesi dersleri: tarayıcıda Python (Pyodide + NumPy). Sınıf (classic) Web Worker; sayfa bunu yalnız ilk
// "Çalıştır" tıklamasında oluşturur. Çalışma ortamı ilk yüklemeden sonra sıcak tutulur; her çalıştırma yeni bir ad alanında
// (boş dict) çalışır, değişkenler bir öncekinden sızmaz. Veri dosyaları her çalıştırmadan önce sanal dosya sistemine yazılır.
//
// Mesajlar (sayfa → worker): { type: 'run', id, code, files: [{ name, url } | { name, bytes }] }
// Mesajlar (worker → sayfa): { type: 'progress', stage: 'loading-runtime' | 'loading-numpy' | 'ready' }
//                            { type: 'out', id, text, stream: 'stdout' | 'stderr' }
//                            { type: 'figure', id, png }   (matplotlib şekli, base64 PNG)
//                            { type: 'files', id, files: [{ name, bytes }] }   (çalıştırmanın yazdığı / değiştirdiği dosyalar)
//                            { type: 'done', id, ok, error?, ms }
// matplotlib yalnız kod onu içe aktarıyorsa ve ilk kez gerektiğinde yüklenir (Agg arka ucu). plt.show() ve çalıştırmanın sonunda
// açık kalan şekiller PNG olarak sayfaya gönderilir; sayfa bunları <img> olarak gösterir.
/* global importScripts, loadPyodide */
const PYODIDE_VERSION = '0.26.4'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let ready = null
let current = null
let mplReady = null
const MAX_FILE = 4 * 1024 * 1024

/** Kod matplotlib kullanıyor mu (yorum satırları hariç). */
const usesMpl = (code) => /^[ \t]*(import\s+matplotlib|from\s+matplotlib)/m.test(code)

// matplotlib kurulumu: Agg arka ucu, plt.show() şekilleri gönderir ve kapatır; _mx_flush() çalıştırma sonunda kalanları gönderir.
const MPL_SETUP = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as _plt, io as _io, base64 as _b64, _mx
def _mx_flush(*a, **k):
    for n in list(_plt.get_fignums()):
        f = _plt.figure(n)
        b = _io.BytesIO()
        f.savefig(b, format='png', dpi=110, bbox_inches='tight')
        _mx.figure(_b64.b64encode(b.getvalue()).decode('ascii'))
        _plt.close(f)
_plt.show = _mx_flush
`

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

function loadMpl(py) {
  if (mplReady) return mplReady
  mplReady = (async () => {
    self.postMessage({ type: 'progress', stage: 'loading-matplotlib' })
    await py.loadPackage('matplotlib')
    py.registerJsModule('_mx', { figure: (b64) => { flush(); self.postMessage({ type: 'figure', id: current, png: String(b64) }) } })
    await py.runPythonAsync(MPL_SETUP)
    self.postMessage({ type: 'progress', stage: 'running' })
  })()
  mplReady.catch(() => { mplReady = null })
  return mplReady
}

/** Çalışma dizinindeki düz dosyalar: ad → değişiklik zamanı. */
function listFiles(py) {
  const out = new Map()
  for (const name of py.FS.readdir('.')) {
    if (name === '.' || name === '..') continue
    try { const st = py.FS.stat(name); if (py.FS.isFile(st.mode)) out.set(name, `${st.mtime && st.mtime.getTime ? st.mtime.getTime() : st.mtime}:${st.size}`) } catch { /* yok say */ }
  }
  return out
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
    // önceki çalıştırmanın ürettiği dosyalar silinir (veri dosyaları az önce yeniden yazıldı)
    const inputs = new Set((m.files || []).map((f) => f.name))
    for (const name of listFiles(py).keys()) if (!inputs.has(name)) py.FS.unlink(name)
    const mpl = usesMpl(m.code)
    if (mpl) await loadMpl(py)
    const before = listFiles(py)
    const ns = py.globals.get('dict')()
    try {
      await py.runPythonAsync(m.code, { globals: ns })
    } finally {
      ns.destroy()
      if (mpl) { try { await py.runPythonAsync('_mx_flush()') } catch { /* şekil yoksa önemsiz */ } }
      flush()
      // yazılan ya da değişen dosyalar: sayfada indirme bağlantısı olur (hata olsa da o ana kadar yazılanlar)
      const files = []
      for (const [name, sig] of listFiles(py)) {
        if (before.get(name) === sig) continue
        const bytes = py.FS.readFile(name)
        if (bytes.length <= MAX_FILE) files.push({ name, bytes: bytes.slice().buffer })
      }
      if (files.length) self.postMessage({ type: 'files', id: m.id, files }, files.map((f) => f.bytes))
    }
    self.postMessage({ type: 'done', id: m.id, ok: true, ms: Math.round(performance.now() - t1), loadMs: Math.round(t1 - t0) })
  } catch (e) {
    flush()
    self.postMessage({ type: 'done', id: m.id, ok: false, error: formatError(e), ms: Math.round(performance.now() - t1), loadMs: Math.round(t1 - t0) })
  }
}

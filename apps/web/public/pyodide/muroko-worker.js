// MuRoKo: robotu gerçek Python ile sürer (Pyodide, çekirdek; NumPy yok). Sınıf (classic) Web Worker.
// Kullanıcı kodu `runPythonAsync` ile çalışır: üst düzey `await bekle(s)` benzetim saatine göre uyur.
// Sayfa durumu ~30 Hz gönderir; worker senkron `sensor()` için en son durumu tutar. Takılan kodu sayfa worker'ı sonlandırarak durdurur.
//
// sayfa → worker: { type: 'run', code, motors: [ad], sensors: [ad] }  { type: 'state', t, sensors: { ad: sayı } }
// worker → sayfa: { type: 'status', stage: 'loading' | 'ready' }  { type: 'motor', name, value }
//                 { type: 'out', text, stream }  { type: 'done', ok, error? }
/* global importScripts, loadPyodide */
const PYODIDE_VERSION = '0.26.4'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodide = null
let loading = null
let state = { t: 0, sensors: {} }
let waiter = null
let known = { motors: [], sensors: [] }

function load() {
  loading ??= (async () => {
    self.postMessage({ type: 'status', stage: 'loading' })
    importScripts(`${PYODIDE_URL}pyodide.js`)
    pyodide = await loadPyodide({ indexURL: PYODIDE_URL })
    pyodide.setStdout({ batched: (text) => self.postMessage({ type: 'out', text, stream: 'stdout' }) })
    pyodide.setStderr({ batched: (text) => self.postMessage({ type: 'out', text, stream: 'stderr' }) })
    self.postMessage({ type: 'status', stage: 'ready' })
  })()
  return loading
}

function motor(name, value) {
  const v = Number(value)
  if (!Number.isFinite(v)) throw new Error(`motor("${name}", ...): değer sayı olmalı`)
  if (!known.motors.includes(name)) throw new Error(`Böyle bir motor yok: "${name}". Motorlar: ${known.motors.join(', ') || '(yok)'}`)
  self.postMessage({ type: 'motor', name, value: v })
}
function sensor(name) {
  if (!(name in state.sensors)) throw new Error(`Böyle bir sensör yok: "${name}". Sensörler: ${known.sensors.join(', ') || '(yok)'}`)
  return state.sensors[name]
}
const now = () => state.t
function sleep(seconds) {
  const s = Math.max(0, Number(seconds) || 0)
  return new Promise((resolve) => { waiter = { until: state.t + s, resolve } })
}

self.onmessage = async (e) => {
  const m = e.data
  if (m.type === 'state') {
    state = { t: m.t, sensors: m.sensors }
    if (waiter && state.t >= waiter.until) { const w = waiter; waiter = null; w.resolve() }
    return
  }
  if (m.type !== 'run') return
  known = { motors: m.motors ?? [], sensors: m.sensors ?? [] }
  // Başlangıç durumu kodla birlikte gelir: ilk sensor() çağrısı durum mesajını beklemez
  if (m.state) state = { t: m.state.t, sensors: m.state.sensors }
  try {
    await load()
    // Türkçe ve İngilizce adlar aynı işlevlere bağlanır; `from muroko import *` ve doğrudan çağrı çalışır.
    const api = { motor, sensor, zaman: now, time: now, bekle: sleep, wait: sleep }
    pyodide.registerJsModule('muroko', api)
    const globals = pyodide.runPython('dict()')
    for (const k of Object.keys(api)) globals.set(k, api[k])
    await pyodide.runPythonAsync(m.code, { globals })
    globals.destroy()
    self.postMessage({ type: 'done', ok: true })
  } catch (err) {
    const msg = String((err && err.message) || err)
    // Python hatasında yalnız son birkaç satır (kullanıcının koduyla ilgili kısım) gösterilir
    self.postMessage({ type: 'done', ok: false, error: msg.split('\n').slice(-6).join('\n') })
  }
}

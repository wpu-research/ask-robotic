// Arduino (Uno) sketch derleme servisi (yalnız derler, ASLA çalıştırmaz).
// Güvenlik sınırları: bkz. docs/derleme-servisi.md
import { spawn, type ChildProcess } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { validateSource } from './validate'

export type CompileDiagnostic = { line: number; column: number; message: string }

export type CompileResult =
  | { ok: true; hex: string; flashBytes?: number; ramBytes?: number; cached: boolean }
  | { ok: false; reason: 'invalid' | 'compile'; errors: CompileDiagnostic[] }
  | { ok: false; reason: 'busy' | 'timeout' | 'internal'; errors: [] }

export const LIMITS = {
  timeoutMs: 60_000,
  maxBuffer: 1024 * 1024,
  maxConcurrent: 2,
  maxQueue: 10,
  cacheEntries: 200,
  maxErrors: 20,
  maxHexBytes: 1024 * 1024,
} as const

/** Bu servisin geçici dizin öneki (testler kalıntı denetler). */
export const TMP_PREFIX = 'ask-compile-'
const SKETCH_NAME = 'sketch'

// ---------- önbellek (bellek içi LRU) ----------
const cache = new Map<string, CompileResult>()
function cacheGet(key: string) {
  const v = cache.get(key)
  if (v) { cache.delete(key); cache.set(key, v) }
  return v
}
function cacheSet(key: string, v: CompileResult) {
  cache.delete(key)
  cache.set(key, v)
  while (cache.size > LIMITS.cacheEntries) cache.delete(cache.keys().next().value as string)
}
export function clearCompileCache() { cache.clear() }

// ---------- eşzamanlılık: semafor + sınırlı kuyruk ----------
let running = 0
const waiters: Array<() => void> = []

function acquire(): Promise<void> | null {
  if (running < LIMITS.maxConcurrent) { running++; return Promise.resolve() }
  if (waiters.length >= LIMITS.maxQueue) return null
  return new Promise<void>((resolve) => waiters.push(resolve)) // yuva devredilir (running değişmez)
}
function release() {
  const next = waiters.shift()
  if (next) next()
  else running--
}

const inflight = new Map<string, Promise<CompileResult>>()

// ---------- çıktı temizleme ----------
// eslint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;]*[A-Za-z]/g

export function sanitizeOutput(text: string, extraPaths: string[] = []): string {
  let s = text.replace(ANSI, '')
  const paths = [...extraPaths, os.tmpdir(), os.homedir()]
    .filter((p) => p && p.length > 1)
    .sort((a, b) => b.length - a.length)
  for (const p of paths) s = s.split(p).join('<yol>')
  s = s.replace(/<yol>(?:\/[\w.+@~-]+)*\/([\w.+@~-]+)/g, '$1') // <yol>/a/b/dosya -> dosya
  // kalan mutlak yollar (en az iki bölüm): /usr/lib/x/y.h -> y.h
  s = s.replace(/(?<![\w)\]"'.])\/(?:[\w.+@~-]+\/)+([\w.+@~-]*)/g, '$1')
  s = s.replace(/[A-Za-z]:\\(?:[^\\\s:"']+\\)*([^\\\s:"']*)/g, '$1')
  return s.replace(/<yol>/g, '')
}

const DIAG = /^([\w.+-]+):(\d+):(\d+): (?:fatal )?error: (.*)$/

export function parseDiagnostics(sanitized: string): CompileDiagnostic[] {
  const out: CompileDiagnostic[] = []
  for (const raw of sanitized.split('\n')) {
    const line = raw.trimEnd()
    const m = DIAG.exec(line)
    if (m) {
      const file = m[1]
      const msg = file.endsWith('.ino') ? m[4] : `${file}: ${m[4]}`
      out.push({ line: Number(m[2]), column: Number(m[3]), message: msg.slice(0, 300) })
    } else if (/undefined reference to|region `\w+' overflowed|multiple definition of/.test(line)) {
      out.push({ line: 0, column: 0, message: line.replace(/^.*?: (?=undefined|multiple)/, '').slice(0, 300) })
    }
    if (out.length >= LIMITS.maxErrors) break
  }
  return out
}

function killGroup(pid: number | undefined) {
  if (!pid) return
  try { process.kill(-pid, 'SIGKILL') } catch { /* süreç grubu zaten yok */ }
}

type RunOutcome = { kind: 'done'; code: number; stdout: string; stderr: string } | { kind: 'timeout' } | { kind: 'internal' }

// Not: child_process.execFile `detached` seçeneğini yok sayar (süreç grubu kurulamaz); alt süreçleri de
// öldürebilmek için `spawn` (shell YOK, argüman dizisi) kullanılır ve tampon sınırı elle uygulanır.
function runCli(cli: string, dir: string, timeoutMs: number): Promise<RunOutcome> {
  return new Promise((resolve) => {
    const args = ['compile', '--fqbn', 'arduino:avr:uno', '--output-dir', path.join(dir, 'build'), path.join(dir, SKETCH_NAME)]
    // Sunucunun gizli ortam değişkenleri (DATABASE_URL vb.) derleyiciye verilmez.
    const env: Record<string, string> = {}
    for (const k of ['PATH', 'HOME', 'USER', 'LANG', 'LC_ALL', 'TMPDIR']) { const v = process.env[k]; if (v) env[k] = v }
    for (const k of Object.keys(process.env)) { const v = process.env[k]; if (v && k.startsWith('ARDUINO_') && k !== 'ARDUINO_CLI') env[k] = v }

    let settled = false
    let timedOut = false
    let overflow = false
    let stdout = ''
    let stderr = ''
    let child: ChildProcess | undefined
    const finish = (r: RunOutcome) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      killGroup(child?.pid) // artakalan alt süreçleri öldür
      resolve(r)
    }
    const timer = setTimeout(() => { timedOut = true; killGroup(child?.pid) }, timeoutMs)
    let proc: ChildProcess
    try {
      proc = spawn(cli, args, { cwd: dir, env: env as NodeJS.ProcessEnv, detached: true, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
      child = proc
    } catch {
      return finish({ kind: 'internal' })
    }
    const collect = (which: 'out' | 'err') => (chunk: Buffer) => {
      if (stdout.length + stderr.length + chunk.length > LIMITS.maxBuffer) {
        overflow = true
        killGroup(child?.pid)
        return
      }
      if (which === 'out') stdout += chunk.toString('utf8')
      else stderr += chunk.toString('utf8')
    }
    proc.stdout?.on('data', collect('out'))
    proc.stderr?.on('data', collect('err'))
    proc.on('error', () => finish({ kind: 'internal' })) // ENOENT vb.
    // 'close': süreç bitti ve borular kapandı (alt süreç boruyu tutuyorsa grup öldürülünce kapanır)
    proc.on('close', (code) => {
      if (timedOut) return finish({ kind: 'timeout' })
      if (overflow || code === null) return finish({ kind: 'internal' })
      finish({ kind: 'done', code, stdout, stderr })
    })
  })
}

async function doCompile(source: string, timeoutMs: number): Promise<CompileResult> {
  const cli = process.env.ARDUINO_CLI || 'arduino-cli'
  let base: string | undefined
  try {
    base = await mkdtemp(path.join(os.tmpdir(), TMP_PREFIX))
    const sketchDir = path.join(base, SKETCH_NAME)
    await mkdir(sketchDir)
    await writeFile(path.join(sketchDir, `${SKETCH_NAME}.ino`), source, { encoding: 'utf8', mode: 0o600 })

    const r = await runCli(cli, base, timeoutMs)
    if (r.kind === 'timeout') return { ok: false, reason: 'timeout', errors: [] }
    if (r.kind === 'internal') return { ok: false, reason: 'internal', errors: [] }

    const real = await realpath(base).catch(() => base as string)
    const clean = sanitizeOutput(`${r.stdout}\n${r.stderr}`, [real, base])
    if (r.code !== 0) {
      const errors = parseDiagnostics(clean)
      if (!errors.length) errors.push({ line: 0, column: 0, message: 'Derleme başarısız oldu.' })
      return { ok: false, reason: 'compile', errors }
    }
    const hexPath = path.join(base, 'build', `${SKETCH_NAME}.ino.hex`)
    const st = await stat(hexPath)
    if (st.size > LIMITS.maxHexBytes) return { ok: false, reason: 'internal', errors: [] }
    const hex = await readFile(hexPath, 'utf8')
    if (!hex.startsWith(':')) return { ok: false, reason: 'internal', errors: [] }
    const flash = /Sketch uses (\d+) bytes/.exec(clean)
    const ram = /Global variables use (\d+) bytes/.exec(clean)
    return {
      ok: true,
      hex,
      flashBytes: flash ? Number(flash[1]) : undefined,
      ramBytes: ram ? Number(ram[1]) : undefined,
      cached: false,
    }
  } catch {
    return { ok: false, reason: 'internal', errors: [] }
  } finally {
    if (base) await rm(base, { recursive: true, force: true }).catch(() => {})
  }
}

export async function compileSketch(source: string, opts: { timeoutMs?: number } = {}): Promise<CompileResult> {
  // Derinlemesine savunma: route zaten doğrular, ama bu işlev tek başına da güvenli olmalı.
  const v = validateSource(source)
  if (!v.ok) {
    return { ok: false, reason: 'invalid', errors: v.errors.map((e) => ({ line: e.line, column: 1, message: e.message })) }
  }
  const key = createHash('sha256').update(source).digest('hex')
  const hit = cacheGet(key)
  if (hit) return hit.ok ? { ...hit, cached: true } : hit

  const pending = inflight.get(key)
  if (pending) return pending

  const p = (async (): Promise<CompileResult> => {
    const slot = acquire()
    if (!slot) return { ok: false, reason: 'busy', errors: [] }
    await slot
    try {
      const res = await doCompile(source, opts.timeoutMs ?? LIMITS.timeoutMs)
      if (res.ok || res.reason === 'compile') cacheSet(key, res)
      return res
    } finally {
      release()
    }
  })()
  inflight.set(key, p)
  try {
    return await p
  } finally {
    inflight.delete(key)
  }
}

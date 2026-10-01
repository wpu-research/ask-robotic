import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { TMP_PREFIX, clearCompileCache, compileSketch, parseDiagnostics, sanitizeOutput } from './compile'

function cliInstalled() {
  try {
    execFileSync('arduino-cli', ['version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
const HAS_CLI = cliInstalled()

// Başka test dosyaları paralel derleme yapar; global /tmp taraması onlara takılmasın diye bu dosya kendi TMPDIR'ini kullanır.
const ORIG_TMPDIR = process.env.TMPDIR
const scratch = mkdtempSync(path.join(os.tmpdir(), 'compiletest-'))
process.env.TMPDIR = scratch
afterAll(() => {
  if (ORIG_TMPDIR === undefined) delete process.env.TMPDIR
  else process.env.TMPDIR = ORIG_TMPDIR
  rmSync(scratch, { recursive: true, force: true })
})

function script(name: string, body: string) {
  const p = path.join(scratch, name)
  writeFileSync(p, `#!/bin/bash\n${body}\n`)
  chmodSync(p, 0o755)
  return p
}
function leftovers() {
  return readdirSync(os.tmpdir()).filter((d) => d.startsWith(TMP_PREFIX))
}
const blink = (n: number) => `void setup() { pinMode(13, OUTPUT); }
void loop() { digitalWrite(13, HIGH); delay(${n}); digitalWrite(13, LOW); delay(${n}); }
`

const savedCli = process.env.ARDUINO_CLI
beforeEach(() => {
  clearCompileCache()
  if (savedCli === undefined) delete process.env.ARDUINO_CLI
  else process.env.ARDUINO_CLI = savedCli
})
afterAll(() => {
  if (savedCli === undefined) delete process.env.ARDUINO_CLI
  else process.env.ARDUINO_CLI = savedCli
})

describe('çıktı temizleme ve ayrıştırma (arduino-cli gerekmez)', () => {
  it('tmp/home/arduino15 yollarını siler', () => {
    const base = path.join(os.tmpdir(), `${TMP_PREFIX}abc123`)
    const raw =
      `${base}/sketch/sketch.ino:3:5: error: 'x' was not declared\n` +
      `\x1b[92mUsed\x1b[0m ${os.homedir()}/.arduino15/packages/arduino/hardware/avr/1.8.6\n` +
      `/usr/lib/gcc/avr/7.3.0/../../../avr/bin/ld: ${base}/build/x.o: in function \`f': y\n` +
      `C:\\Users\\bob\\AppData\\Local\\Temp\\x\\sketch.ino:1:1: error: z`
    const clean = sanitizeOutput(raw, [base])
    expect(clean).not.toContain(os.tmpdir())
    expect(clean).not.toContain(os.homedir())
    expect(clean).not.toContain('.arduino15')
    expect(clean).not.toContain('/usr/lib')
    expect(clean).not.toContain('Users')
    expect(clean).not.toContain('\x1b')
    expect(clean).toContain("sketch.ino:3:5: error: 'x' was not declared")
  })

  it('hataları satır/sütun/mesaj olarak ayrıştırır, en çok 20 döner', () => {
    const one = parseDiagnostics("sketch.ino:2:14: error: 'foo' was not declared in this scope\nsketch.ino:2:14: note: yok sayılır")
    expect(one).toEqual([{ line: 2, column: 14, message: "'foo' was not declared in this scope" }])
    const many = parseDiagnostics(Array.from({ length: 50 }, (_, i) => `sketch.ino:${i + 1}:1: error: e${i}`).join('\n'))
    expect(many).toHaveLength(20)
    const lib = parseDiagnostics('Foo.h:9:1: fatal error: Bar.h: No such file or directory')
    expect(lib[0].message).toBe('Foo.h: Bar.h: No such file or directory')
  })
})

describe('sahte arduino-cli ile (sınırlar, zaman aşımı)', () => {
  const okCli = (sleep: string, log?: string) =>
    script(
      `ok-${sleep}-${log ? 'l' : 'n'}.sh`,
      `${log ? `echo S >> "${log}"` : ''}
while [ $# -gt 0 ]; do [ "$1" = "--output-dir" ] && out="$2"; shift; done
sleep ${sleep}
mkdir -p "$out" && echo ":00000001FF" > "$out/sketch.ino.hex"
echo "Sketch uses 100 bytes (0%) of program storage space."
echo "Global variables use 9 bytes (0%) of dynamic memory."`,
    )

  it('kuyruk: 2 çalışan + 10 bekleyen kabul edilir, fazlası busy döner', async () => {
    process.env.ARDUINO_CLI = okCli('0.4')
    const results = await Promise.all(Array.from({ length: 14 }, (_, i) => compileSketch(`int a${i};\n`)))
    const busy = results.filter((r) => !r.ok && r.reason === 'busy')
    const ok = results.filter((r) => r.ok)
    expect(ok).toHaveLength(12)
    expect(busy).toHaveLength(2)
    expect(leftovers()).toEqual([])
  })

  it('zaman aşımı: süreç ve alt süreçleri ölür, dizin silinir', async () => {
    const pidFile = path.join(scratch, 'child.pid')
    process.env.ARDUINO_CLI = script('hang.sh', `sleep 300 &\necho $! > "${pidFile}"\nwait`)
    const t0 = Date.now()
    const r = await compileSketch('int hang;\n', { timeoutMs: 800 })
    expect(r).toEqual({ ok: false, reason: 'timeout', errors: [] })
    expect(Date.now() - t0).toBeLessThan(10_000)
    const pid = Number(readFileSync(pidFile, 'utf8').trim())
    await new Promise((res) => setTimeout(res, 300))
    let alive = true
    try { process.kill(pid, 0) } catch { alive = false }
    expect(alive).toBe(false)
    expect(leftovers()).toEqual([])
  })

  it('arduino-cli bulunamazsa iç hata döner ve yol sızdırmaz', async () => {
    process.env.ARDUINO_CLI = path.join(scratch, 'yok-boyle-bir-sey')
    const r = await compileSketch('int nocli;\n')
    expect(r).toEqual({ ok: false, reason: 'internal', errors: [] })
    expect(JSON.stringify(r)).not.toContain(scratch)
    expect(leftovers()).toEqual([])
  })

  it('geçersiz kod arduino-cli çalıştırılmadan reddedilir', async () => {
    const log = path.join(scratch, 'never.log')
    process.env.ARDUINO_CLI = okCli('0', log)
    const r = await compileSketch('#include "/etc/passwd"\n')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reason).toBe('invalid')
      expect(r.errors[0].line).toBe(1)
    }
    expect(existsSync(log)).toBe(false)
  })

  it('derleme hatası önbelleğe alınır (aynı hata tekrar derlenmez)', async () => {
    const log = path.join(scratch, 'fail.log')
    process.env.ARDUINO_CLI = script(
      'fail.sh',
      `echo S >> "${log}"\necho "$PWD/sketch/sketch.ino:4:2: error: bozuk" >&2\nexit 1`,
    )
    const a = await compileSketch('int failing;\n')
    const b = await compileSketch('int failing;\n')
    expect(a).toEqual(b)
    expect(a.ok).toBe(false)
    if (!a.ok) expect(a.errors).toEqual([{ line: 4, column: 2, message: 'bozuk' }])
    expect(readFileSync(log, 'utf8').trim().split('\n')).toHaveLength(1)
  })

  it('LRU en çok 200 girdi tutar (en eski çıkar)', async () => {
    const log = path.join(scratch, 'lru.log')
    process.env.ARDUINO_CLI = script(
      'lru.sh',
      `echo S >> "${log}"\nwhile [ $# -gt 0 ]; do [ "$1" = "--output-dir" ] && out="$2"; shift; done\nmkdir -p "$out" && echo ":00" > "$out/sketch.ino.hex"`,
    )
    for (let i = 0; i < 201; i++) await compileSketch(`int lru${i};\n`)
    const count = () => readFileSync(log, 'utf8').trim().split('\n').length
    expect(count()).toBe(201)
    await compileSketch('int lru200;\n') // en yeni: önbellekte
    expect(count()).toBe(201)
    await compileSketch('int lru0;\n') // en eski: atılmış olmalı
    expect(count()).toBe(202)
  }, 60_000)
})

describe.skipIf(!HAS_CLI)('gerçek arduino-cli ile', () => {
  const log = path.join(scratch, 'real.log')
  const wrapper = () =>
    script(
      'wrap.sh',
      `echo "S $$ $(date +%s%N)" >> "${log}"\narduino-cli "$@"\nrc=$?\necho "E $$ $(date +%s%N)" >> "${log}"\nexit $rc`,
    )
  const events = () =>
    existsSync(log)
      ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map((l) => {
          const [t, pid, ns] = l.split(' ')
          return { t, pid, ns: BigInt(ns) }
        })
      : []

  it('Blink derlenir, hex ":" ile başlar, ikinci sefer cached:true', async () => {
    const src = blink(1111)
    const a = await compileSketch(src)
    expect(a.ok).toBe(true)
    if (!a.ok) return
    expect(a.hex.startsWith(':')).toBe(true)
    expect(a.cached).toBe(false)
    expect(a.flashBytes).toBeGreaterThan(100)
    expect(a.ramBytes).toBeGreaterThanOrEqual(0)
    const b = await compileSketch(src)
    expect(b.ok && b.cached).toBe(true)
    if (b.ok) expect(b.hex).toBe(a.hex)
    expect(leftovers()).toEqual([])
  }, 120_000)

  it('sözdizimi hatası satır/sütun/mesajla döner, sunucu yolu sızmaz', async () => {
    const r = await compileSketch('void setup() { pinMode(13, OUTPUT) }\nvoid loop() { foo(); }\n')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('compile')
    expect(r.errors[0]).toEqual({ line: 1, column: 36, message: "expected ';' before '}' token" })
    expect(r.errors.some((e) => e.line === 2 && /foo/.test(e.message))).toBe(true)
    const dump = JSON.stringify(r)
    for (const bad of [os.tmpdir(), os.homedir(), '.arduino15', TMP_PREFIX, '/usr/', '/home/']) expect(dump).not.toContain(bad)
    expect(leftovers()).toEqual([])
  }, 120_000)

  it('eksik kütüphane ve bağlayıcı hatası da temiz döner', async () => {
    const lib = await compileSketch('#include <Servo.h>\nvoid setup() {}\nvoid loop() { undefinedFn(); }\n')
    expect(lib.ok).toBe(false)
    if (!lib.ok) {
      expect(lib.errors.length).toBeGreaterThan(0)
      expect(JSON.stringify(lib)).not.toContain(os.homedir())
    }
    const link = await compileSketch('void f();\nvoid setup() { f(); }\nvoid loop() {}\n')
    expect(link.ok).toBe(false)
    if (!link.ok) {
      expect(link.errors[0].message).toMatch(/undefined reference/)
      expect(JSON.stringify(link)).not.toContain(os.homedir())
    }
  }, 120_000)

  it('Servo + LCD + Wire programı derlenir', async () => {
    const r = await compileSketch(`#include <Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
Servo s;
LiquidCrystal_I2C lcd(0x27, 16, 2);
void setup() { s.attach(9); lcd.init(); lcd.print("selam"); }
void loop() { s.write(90); }
`)
    expect(r.ok).toBe(true)
  }, 120_000)

  it('6 farklı eşzamanlı derleme hatasız biter ve en çok 2 süreç aynı anda çalışır', async () => {
    process.env.ARDUINO_CLI = wrapper()
    const results = await Promise.all([2001, 2002, 2003, 2004, 2005, 2006].map((n) => compileSketch(blink(n))))
    expect(results.every((r) => r.ok)).toBe(true)
    const ev = events()
    expect(ev.filter((e) => e.t === 'S')).toHaveLength(6)
    expect(ev.filter((e) => e.t === 'E')).toHaveLength(6)
    // aralıkları kur: en çok eşzamanlı süreç sayısı
    const pts = ev.map((e) => ({ ns: e.ns, d: e.t === 'S' ? 1 : -1 })).sort((a, b) => (a.ns === b.ns ? a.d - b.d : a.ns < b.ns ? -1 : 1))
    let cur = 0
    let max = 0
    for (const p of pts) { cur += p.d; max = Math.max(max, cur) }
    expect(max).toBeLessThanOrEqual(2)
    expect(max).toBeGreaterThanOrEqual(2) // gerçekten paralel de çalışmış
    expect(leftovers()).toEqual([])
  }, 240_000)

  it('aynı kaynağın eşzamanlı iki isteği yalnız bir derleme yapar', async () => {
    rmSync(log, { force: true })
    process.env.ARDUINO_CLI = wrapper()
    const src = blink(3003)
    const [a, b] = await Promise.all([compileSketch(src), compileSketch(src)])
    expect(a.ok && b.ok).toBe(true)
    if (a.ok && b.ok) expect(a.hex).toBe(b.hex)
    expect(events().filter((e) => e.t === 'S')).toHaveLength(1)
    expect(leftovers()).toEqual([])
  }, 120_000)
})

describe('son temizlik denetimi', () => {
  it('bu servisin geçici dizinlerinden hiçbiri kalmamıştır', () => {
    expect(leftovers()).toEqual([])
  })
})

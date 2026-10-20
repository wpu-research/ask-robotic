// ArmScript: sözdizimi, ifadeler, akış denetimi, yordamlar, hareket komutları, tutucu, hata kodları, sınırlar ve yalıtım.
import { describe, expect, it } from 'vitest'
import { FUNCTIONS, LIMITS_SCRIPT, describeError, parseProgram, runProgram, type ErrorCode } from './armscript'
import { defaultCell, violation, type Cell } from './cell'
import { HOME, fk, toRad } from './kinematics'
import { SAMPLES, SAMPLE_IDS, sampleCell, sampleSrc } from './samples'

const run = (src: string, cell: Cell = defaultCell(false)) => runProgram(src, { cell })
const out = (src: string, cell?: Cell) => { const r = run(src, cell); if (!r.ok) throw new Error(describeError(r.error!, 'en')); return r.output }
const errOf = (src: string, cell?: Cell) => run(src, cell).error

describe('ifadeler ve değişkenler', () => {
  it('aritmetik, öncelik, bölme, mod, birli eksi, karşılaştırma, mantık', () => {
    expect(out('print 1 + 2 * 3, (1 + 2) * 3, 7 % 4, 8 / 4, -2 + 5')).toEqual(['7 9 3 2 3'])
    expect(out('print 1 < 2, 2 <= 2, 3 > 4, 1 == 1, 1 != 1, true and false, true or false, not false')).toEqual(['true true false true false false true true'])
  })
  it('değişken tanımı, atama, metin birleştirme', () => {
    expect(out('var a = 2\na = a * 5\nprint "sonuç " + a')).toEqual(['sonuç 10'])
    expect(out('point p = pose(0.5, 0, 0.3)\nprint x_of(p), z_of(p)')).toEqual(['0.5 0.3'])
  })
  it('işlevler: trigonometri derece, floor, min, max, abs, sqrt, dist', () => {
    const o = out('print round(sin(30) * 100), round(cos(60) * 100), floor(2.9), min(3, 1), max(3, 1), abs(-4), sqrt(9), dist(pose(0,0,0), pose(3,4,0))')
    expect(o).toEqual(['50 50 2 1 3 4 3 5'])
  })
  it('joints dereceyi radyana çevirir; offset yalnız pozlara uygulanır', () => {
    const r = run('var j = joints(0, 30, 60, 0, 90, 0)\nptp j\nprint here()')
    expect(r.ok).toBe(true)
    expect(r.output[0]).toContain('pose(0.675, 0, 0.5697')
    expect(out('print offset(pose(0.5, 0, 0.3), 0.1, 0.2, -0.1)')).toEqual(['pose(0.6, 0.2, 0.2, 0)'])
    expect(errOf('print offset(joints(0,0,0,0,0,0), 1, 1, 1)')?.code).toBe('type')
  })
})

describe('akış denetimi ve yordamlar', () => {
  it('repeat, while, for (artış ve azalış), if/else', () => {
    expect(out('var n = 0\nrepeat 4\n n = n + 2\nend\nprint n')).toEqual(['8'])
    expect(out('var i = 0\nwhile i < 3\n i = i + 1\nend\nprint i')).toEqual(['3'])
    expect(out('var s = 0\nfor k = 1 to 5\n s = s + k\nend\nprint s')).toEqual(['15'])
    expect(out('var s = ""\nfor k = 3 to 1 step -1\n s = s + k\nend\nprint s')).toEqual(['321'])
    expect(out('if 2 > 3\n print "a"\nelse\n print "b"\nend')).toEqual(['b'])
  })
  it('yordam: parametre, yerel kapsam, kendi yerel değişkeni genel değişkeni ezmez', () => {
    const src = 'var x = 1\nproc f(x)\n  var y = x * 2\n  print y\nend\ncall f(21)\nprint x'
    expect(out(src)).toEqual(['42', '1'])
  })
  it('yordam sonradan tanımlanmış olsa da çağrılır (öne alınır); yordam içinde genel değişken değiştirilebilir', () => {
    expect(out('var n = 0\ncall bump()\ncall bump()\nprint n\nproc bump()\n n = n + 1\nend')).toEqual(['2'])
  })
  it('halt programı temiz bitirir', () => {
    const r = run('print "a"\nhalt\nprint "b"')
    expect(r.ok).toBe(true)
    expect(r.halted).toBe(true)
    expect(r.output).toEqual(['a'])
  })
})

describe('hata kodları ve satır numaraları', () => {
  const cases: Array<[string, ErrorCode, number]> = [
    ['print 1 +', 'syntax', 1],
    ['print "açık', 'syntax', 1],
    ['frobnicate 3', 'unknown-command', 1],
    ['var while = 3', 'reserved', 1],
    ['print z', 'undefined-var', 1],
    ['q = 3', 'undefined-var', 1],
    ['call yok()', 'unknown-proc', 1],
    ['print sqrt(1, 2)', 'arg-count', 1],
    ['print bilinmeyen(1)', 'unknown-function', 1],
    ['print 1 + true', 'type', 1],
    ['print 1 / 0', 'div-zero', 1],
    ['if 1\nend', 'type', 1],
    ['repeat 2\n proc f()\n end\nend', 'nested-proc', 2],
    ['print item_x(9)', 'bad-index', 1],
    ['ptp pose(2, 0, 0.1)', 'unreachable', 1],
    ['ptp joints(200, 0, 0, 0, 0, 0)', 'joint-limit', 1],
    ['proc a()\n call a()\nend\ncall a()', 'depth-limit', 2],
    ['repeat 300\n print 1\nend', 'output-limit', 2],
    ['repeat 100\n wait 10\nend', 'duration-limit', 2],
  ]
  for (const [src, code, line] of cases) {
    it(`${JSON.stringify(src).slice(0, 40)} -> ${code}`, () => {
      const e = errOf(src)
      expect(e?.code).toBe(code)
      expect(e?.line).toBe(line)
      expect(describeError(e!, 'tr')).toMatch(/^Satır \d+: /)
      expect(describeError(e!, 'en')).toMatch(/^Line \d+: /)
    })
  }
  it('tüm hata kodları iki dilde metne sahip; İngilizce metinde Türkçe karakter yok', () => {
    const codes: ErrorCode[] = ['syntax', 'unknown-command', 'reserved', 'undefined-var', 'unknown-proc', 'unknown-function', 'arg-count', 'type', 'div-zero', 'nested-proc', 'unreachable', 'joint-limit', 'collision', 'zone', 'lin-flip', 'plan-failed', 'step-limit', 'depth-limit', 'output-limit', 'duration-limit', 'too-long', 'bad-index']
    for (const code of codes) {
      const tr = describeError({ code, line: 3, a: 'x', b: 2 }, 'tr'), en = describeError({ code, line: 3, a: 'x', b: 2 }, 'en')
      expect(tr.length).toBeGreaterThan(10); expect(en.length).toBeGreaterThan(10)
      expect(en, code).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/)
    }
  })
  it('program boyu sınırı', () => {
    expect(parseProgram('x'.repeat(LIMITS_SCRIPT.maxChars + 1)).ok).toBe(false)
    expect(parseProgram('print 1\n'.repeat(LIMITS_SCRIPT.maxLines + 1)).ok).toBe(false)
  })
  it('sonsuz döngü adım sınırında durur ve süre kısa kalır', () => {
    const t0 = Date.now()
    const r = run('while true\nend')
    expect(r.error?.code).toBe('step-limit')
    expect(r.stats.steps).toBe(LIMITS_SCRIPT.maxSteps + 1)
    expect(Date.now() - t0).toBeLessThan(2000)
  })
})

describe('yalıtım: dil dışına çıkış yok', () => {
  it('JS/ortam adları işlev değildir: eval, Function, process, require, import, fetch, constructor hepsi hata', () => {
    for (const bad of ['eval("1")', 'Function("return 1")()', 'process.exit()', 'require("fs")', 'fetch("http://x")', 'constructor()', '__proto__(1)', 'toString()']) {
      const e = errOf(`print ${bad}`)
      expect(e, bad).toBeDefined()
    }
    expect(errOf('call constructor()')?.code).toBe('unknown-proc')
    expect(errOf('print __proto__')?.code).toBe('undefined-var')
    expect(errOf('constructor = 3')?.code).toBe('undefined-var')
  })
  it('izinli işlev listesi sabit ve yalnız dil işlevleri içerir', () => {
    expect([...FUNCTIONS].sort()).toEqual(['abs', 'cos', 'dist', 'floor', 'here', 'holding', 'item_x', 'item_y', 'item_z', 'items', 'joints', 'max', 'min', 'offset', 'pose', 'round', 'sin', 'sqrt', 'x_of', 'y_of', 'z_of'].sort())
  })
  it('kaynak dosya yasak çağrıları içermiyor', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const src = readFileSync(join(__dirname, 'armscript.ts'), 'utf8')
    const code = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
    for (const bad of [/\beval\s*\(/, /new Function\b/, /\bFunction\s*\(/, /\bimport\s*\(/, /\bfetch\s*\(/, /XMLHttpRequest/, /\brequire\s*\(/, /\bprocess\./, /globalThis/, /\bwindow\b/, /\bdocument\b/]) expect(code, String(bad)).not.toMatch(bad)
  })
})

describe('hareket komutları', () => {
  it('ptp joints hedefe varır; süre ve kare sayısı tutarlı; ilk kare başlangıç duruşu', () => {
    const r = run('ptp joints(30, 40, 50, 0, 90, 0)')
    expect(r.ok).toBe(true)
    expect(r.frames[0].q).toEqual(HOME)
    const last = r.frames[r.frames.length - 1]
    expect(last.t).toBeCloseTo(r.duration, 9)
    last.q.forEach((v, i) => expect(v).toBeCloseTo(toRad([30, 40, 50, 0, 90, 0])[i], 9))
    expect(r.stats.ptp).toBe(1)
  })
  it('speed yüzdesi süreyi uzatır', () => {
    const fast = run('speed 100\nptp joints(60, 40, 50, 0, 90, 0)').duration
    const slow = run('speed 25\nptp joints(60, 40, 50, 0, 90, 0)').duration
    expect(slow).toBeGreaterThan(fast * 1.9)
  })
  it('lin hedefe düz çizgiyle varır (TCP her karede çizgi üzerinde)', () => {
    const r = run('ptp pose(0.5, -0.2, 0.3)\nlin pose(0.5, 0.2, 0.3)')
    expect(r.ok).toBe(true)
    const pts = r.frames.filter((f) => f.t > 0).map((f) => fk(f.q).p)
    const lin = pts.slice(-Math.floor(pts.length / 2))
    for (const p of lin.slice(-5)) { expect(p[0]).toBeCloseTo(0.5, 4); expect(p[2]).toBeCloseTo(0.3, 4) }
    const end = fk(r.frames[r.frames.length - 1].q).p
    expect(end[1]).toBeCloseTo(0.2, 4)
  })
  it('wait zamanı ilerletir, duruşu değiştirmez; open/close 0,4 s sürer ve açıklığı değiştirir', () => {
    const r = run('wait 1.5\nclose\nopen')
    expect(r.duration).toBeCloseTo(1.5 + 0.8, 9)
    const f = r.frames
    expect(f[f.length - 1].grip).toBe(1)
    expect(Math.min(...f.map((x) => x.grip))).toBe(0)
    expect(f.every((x) => x.q.every((v, i) => v === HOME[i]))).toBe(true)
  })
  it('duvara ptp: collision hatası, hata ana kadarki kareler korunur; plan aynı hedefe gider', () => {
    const wall = defaultCell(true)
    const bad = run('ptp pose(0.55, -0.32, 0.25)\nptp pose(0.55, 0.32, 0.25)', wall)
    expect(bad.error).toMatchObject({ code: 'collision', line: 2, a: 'wall' })
    expect(bad.frames.length).toBeGreaterThan(5)
    const good = run('ptp pose(0.55, -0.32, 0.25)\nplan pose(0.55, 0.32, 0.25)', wall)
    expect(good.ok).toBe(true)
    expect(good.stats.plan).toBe(1)
    for (const f of good.frames) expect(violation(f.q, wall)).toBeNull()
  })
  it('lin bilek merkezini taban ekseninden geçirirse lin-flip', () => {
    const e = errOf('ptp pose(0.25, 0, 0.5)\nlin pose(-0.25, 0, 0.5)')
    expect(e?.code).toBe('lin-flip')
  })
  it('yasak bölge: girince zone hatası', () => {
    const c = defaultCell(false)
    c.zones.push({ name: 'koruma', min: [0.4, -0.1, 0], max: [0.7, 0.1, 0.8] })
    expect(errOf('ptp pose(0.55, -0.32, 0.25)\nptp pose(0.55, 0.32, 0.25)', c)).toMatchObject({ code: 'zone', a: 'koruma' })
  })
  it('plan aynı programda aynı sonucu verir (belirlenimli)', () => {
    const src = 'plan pose(0.55, -0.32, 0.25)\nplan pose(0.55, 0.32, 0.25)'
    const a = run(src, defaultCell(true)), b = run(src, defaultCell(true))
    expect(a.frames).toEqual(b.frames)
  })
})

describe('tutucu ve parçalar', () => {
  it('al-bırak: parça B noktasına konur, tutarken parça TCP ile birlikte hareket eder', () => {
    const r = run(sampleSrc('al-birak', 'en'))
    expect(r.ok).toBe(true)
    expect(r.stats).toMatchObject({ picks: 1, places: 1, drops: 0 })
    expect(r.items[0].pos[0]).toBeCloseTo(0.55, 9)
    expect(r.items[0].pos[1]).toBeCloseTo(0.32, 9)
    expect(r.items[0].pos[2]).toBeCloseTo(0.03, 9)
    expect(r.events.map((e) => e.pos === null)).toEqual([true, false])
    expect(r.output).toEqual(['holding: false'])
  })
  it('tutarken holding() true; boş kapanışta false ve hata yok', () => {
    expect(out('ptp pose(0.55, -0.32, 0.25)\nlin pose(0.55, -0.32, 0.03)\nclose\nprint holding()')).toEqual(['true'])
    expect(out('close\nprint holding()')).toEqual(['false'])
  })
  it('parça çok yüksekten bırakılırsa drops sayılır; üstüne bırakılan parça altındakinin üstünde durur', () => {
    const r = run('ptp pose(0.55, -0.32, 0.25)\nlin pose(0.55, -0.32, 0.03)\nclose\nlin pose(0.55, -0.32, 0.2)\nopen')
    expect(r.stats.drops).toBe(1)
    expect(r.items[0].pos[2]).toBeCloseTo(0.03, 9)
    const s = run(sampleSrc('istif', 'en'))
    expect(s.items.map((i) => Math.round(i.pos[2] * 1000))).toEqual([30, 90, 150])
  })
  it('item_x/item_y tutulan parçada TCP konumunu izler', () => {
    const r = out('ptp pose(0.55, -0.32, 0.25)\nlin pose(0.55, -0.32, 0.03)\nclose\nlin pose(0.55, -0.32, 0.25)\nprint round(item_z(1) * 100)')
    expect(r).toEqual(['25'])
  })
})

describe('örnek programlar (derste ve simülasyonda gösterilenler)', () => {
  it('TR ve EN örneklerin satır sayısı eşit', () => {
    for (const id of SAMPLE_IDS) expect(sampleSrc(id, 'tr').split('\n').length, id).toBe(sampleSrc(id, 'en').split('\n').length)
  })
  it('her örnek beklenen sonucu verir; ok olanlarda hata yok, hatalılarda doğru kod', () => {
    for (const id of SAMPLE_IDS) for (const l of ['tr', 'en'] as const) {
      const r = run(sampleSrc(id, l), sampleCell(id))
      const want = SAMPLES[id].expect
      if (want === 'ok') expect(r.error, `${id} ${l}: ${r.error ? describeError(r.error, 'en') : ''}`).toBeUndefined()
      else expect(r.error?.code, `${id} ${l}`).toBe(want)
    }
  })
  it('bitirme programı üç parçayı 2x2 düzeninin hücrelerine yerleştirir, çarpışmasız', () => {
    const wall = sampleCell('bitirme')
    const r = run(sampleSrc('bitirme', 'en'), wall)
    expect(r.ok).toBe(true)
    expect(r.stats).toMatchObject({ picks: 3, places: 3, plan: 6 })
    for (const f of r.frames) expect(violation(f.q, wall)).toBeNull()
    const cells = new Set(r.items.map((i) => `${i.pos[0].toFixed(2)},${i.pos[1].toFixed(2)}`))
    expect(cells.size).toBe(3)
    expect(r.output).toEqual(['parts moved: 3'])
  })
})

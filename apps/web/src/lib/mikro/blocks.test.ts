import { describe, expect, it } from 'vitest'
import { ALL_BLOCK_TYPES, BLOCK_JSON, BLOCK_BY_TYPE, CATEGORIES, SPECS, toolboxCategories, toolboxJson } from './blocks'
import { generate } from './codegen'
import { textColumns, scrollFrame, scrollDuration, glyphOf, glyphFrame } from './font'
import { ARROWS, ICONS, arrowForAngle } from './icons'
import { OPS } from './ops'
import { EXPRS, STMTS, installOps } from './runtime'
import { MELODIES } from './music'
import { ROBOT_PROFILES, type RobotProfile } from './robot'
import { b, onStart, project, hatBlock } from './program'
import { Device } from './device'

installOps()

describe('blok tanımları', () => {
  it('her özel bloğun işleyicisi var (hat dışında ifade/deyim)', () => {
    for (const s of SPECS) {
      if (s.kind === 'hat') continue
      const has = s.kind === 'stmt' ? s.type in STMTS : s.type in EXPRS
      expect(has, `${s.type} için çalışma zamanı işleyicisi yok`).toBe(true)
    }
    expect(Object.keys(OPS.stmts).length + Object.keys(OPS.exprs).length).toBeGreaterThan(60)
  })
  it('Blockly JSON: yer tutucular değişmiş, argüman sayısı eşit, tür adları benzersiz', () => {
    const seen = new Set<string>()
    for (const j of BLOCK_JSON) {
      expect(seen.has(j.type)).toBe(false)
      seen.add(j.type)
      expect(j.message0).not.toMatch(/\{\w+\}/)
      const n = (j.message0.match(/%\d+/g) ?? []).length
      expect(j.args0.length, j.type).toBe(n)
    }
  })
  it('her blok için JS ve Python kodu üretilir ve yer tutucu kalmaz', () => {
    for (const s of SPECS) {
      const blk = b(s.type)
      // girişleri doldur
      for (const a of s.args ?? []) {
        if (a.k === 'val' || a.k === 'any' || a.k === 'bool') { blk.inputs ??= {}; blk.inputs[a.n] = { block: { type: 'math_number', fields: { NUM: 3 } } } }
        else if (a.k === 'drop') { blk.fields ??= {}; blk.fields[a.n] = a.opts[0][1] }
        else if (a.k === 'num') { blk.fields ??= {}; blk.fields[a.n] = a.def }
        else if (a.k === 'leds') { blk.fields ??= {}; blk.fields[a.n] = '1'.repeat(25) }
      }
      const prog = s.kind === 'hat' ? project('t', [blk]) : s.kind === 'stmt' ? project('t', [onStart(blk)]) : project('t', [onStart(b('variables_set', { f: { VAR: { id: 'v_x' } }, i: { VALUE: blk } }))])
      for (const lang of ['js', 'py'] as const) {
        const code = generate(prog.workspace, lang)
        expect(code, `${s.type} ${lang}`).not.toMatch(/\{[A-Z_]+\}|bilinmeyen blok|\/\* \? \*\//)
        expect(code.length).toBeGreaterThan(30)
      }
    }
  })
  it('araç kutusu: kategoriler sıralı, süzme çalışır, boş kategori yok', () => {
    const all = toolboxCategories()
    expect(all.map((c) => c.label)).toEqual(expect.arrayContaining(['Temel', 'Giriş', 'LED', 'Müzik', 'Radyo', 'Döngü', 'Mantık', 'Değişken', 'Matematik', 'Liste', 'Fonksiyon', 'Pinler']))
    expect(all.length).toBe(CATEGORIES.length - 1)
    expect(all.some((c) => c.key === 'robot')).toBe(false)
    const small = toolboxCategories(['mk_on_start', 'mk_show_icon'])
    expect(small.map((c) => c.key)).toEqual(['basic'])
    expect(small[0].entries.map((e) => e.type)).toEqual(['mk_on_start', 'mk_show_icon'])
    const tb = toolboxJson(['mk_plot']) as { contents: { name: string; contents: unknown[] }[] }
    expect(tb.contents.length).toBe(1)
  })
  it('robot kategorisi yalnız gövde varken ve gövdenin sensörlerine göre çıkar', () => {
    const types = (p: RobotProfile) => toolboxCategories(null, p).find((c) => c.key === 'robot')!.entries.map((e) => e.type)
    const blok = types(ROBOT_PROFILES.blok)
    const gezgin = types(ROBOT_PROFILES.gezgin)
    expect(blok).toEqual(expect.arrayContaining(['rb_move', 'rb_turn', 'rb_distance', 'rb_color_is', 'rb_pressed']))
    expect(blok).not.toContain('rb_line')
    expect(gezgin).toEqual(expect.arrayContaining(['rb_move', 'rb_distance', 'rb_line']))
    expect(gezgin).not.toContain('rb_color_is')
    expect(gezgin).not.toContain('rb_pressed')
    const kiskac = types(ROBOT_PROFILES.kiskac)
    expect(kiskac).toEqual(expect.arrayContaining(['rb_grip', 'rb_held_is', 'rb_holding', 'rb_color_is', 'rb_distance']))
    expect(blok).not.toContain('rb_grip')
    expect(gezgin).not.toContain('rb_held_is')
  })
  it('değişken/fonksiyon kategorileri yalnız izinliyse çıkar', () => {
    expect(toolboxCategories(['variables_set']).some((c) => c.key === 'vars')).toBe(true)
    expect(toolboxCategories(['mk_plot']).some((c) => c.key === 'vars' || c.key === 'func')).toBe(false)
  })
  it('ALL_BLOCK_TYPES özel + yerleşik türleri içerir', () => {
    expect(ALL_BLOCK_TYPES).toEqual(expect.arrayContaining(['mk_plot', 'controls_if', 'lists_create_with', 'procedures_defnoreturn', 'variables_get']))
    expect(BLOCK_BY_TYPE.mk_plot.cat).toBe('led')
  })
  it('çalışma zamanı: bilinmeyen blok anlaşılır hata verir', async () => {
    const { Simulation } = await import('./sim')
    const sim = new Simulation(project('t', [hatBlock('mk_on_start', [b('yok_boyle_blok')])]))
    sim.start(); sim.advance(100)
    expect(sim.error?.message).toMatch(/Bilinmeyen blok/)
  })
})

describe('yazı tipi, simgeler, ses', () => {
  it('her harf/rakam/noktalama glifi 5 satır ve düzgün genişlikte', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?:;-+*/=()%\'"_#<>°ÇĞİÖŞÜı') {
      const g = glyphOf(ch)
      expect(g.length, ch).toBe(5)
      expect(new Set(g.map((r) => r.length)).size, ch).toBe(1)
      expect(g[0].length, ch).toBeLessThanOrEqual(5)
    }
    expect(glyphOf('ç')).toEqual(glyphOf('C'))
    expect(glyphOf('\u{1F600}')).toEqual(glyphOf('?'))
  })
  it('kaydırma: sürede biter, başta ve sonda boş, ortada içerik var', () => {
    const t = 'Hi'
    expect(textColumns(t).length).toBe(5 + 1 + 3)
    expect(scrollFrame(t, 0).some((v) => v > 0)).toBe(true) // ilk sütun sağdan girer
    expect(scrollFrame(t, scrollDuration(t)).every((v) => v === 0)).toBe(true)
    let lit = 0
    for (let ms = 0; ms < scrollDuration(t); ms += 90) if (scrollFrame(t, ms).some((v) => v > 0)) lit++
    expect(lit).toBeGreaterThan(5)
    expect(glyphFrame('1').some((v) => v > 0)).toBe(true)
  })
  it('simgeler 5x5 ve kimlikler benzersiz; oklar 8 yön', () => {
    for (const i of [...ICONS, ...ARROWS]) { expect(i.rows.length).toBe(5); for (const r of i.rows) expect(r).toMatch(/^[01]{5}$/) }
    expect(new Set(ICONS.map((i) => i.id)).size).toBe(ICONS.length)
    expect(ARROWS.length).toBe(8)
    expect(arrowForAngle(0)).toBe('N'); expect(arrowForAngle(92)).toBe('E'); expect(arrowForAngle(-90)).toBe('W'); expect(arrowForAngle(359)).toBe('N')
  })
  it('ezgiler geçerli', () => {
    for (const m of MELODIES) { expect(m.notes.length).toBeGreaterThan(2); for (const [f, beats] of m.notes) { expect(f).toBeGreaterThanOrEqual(0); expect(beats).toBeGreaterThan(0) } }
  })
  it('aygıt: duruş algısı ve eğim', () => {
    const d = new Device()
    expect(d.isGesture('faceUp')).toBe(true)
    d.perform('tiltRight')
    expect(d.isGesture('tiltRight')).toBe(true)
    expect(d.roll()).toBe(90)
    d.perform('freeFall')
    expect(d.isGesture('freeFall')).toBe(true)
    d.perform('faceDown'); expect(d.roll()).toBe(180)
  })
  it('aygıt: parlaklık çarpanı ve LED sınırları', () => {
    const d = new Device()
    d.plot(0, 0, 200); d.plot(9, 9, 255); d.plot(1, 1, 999)
    expect(d.led(1, 1)).toBe(255)
    d.brightness = 51
    expect(d.frame()[0]).toBe(40)
    expect(d.led(9, 9)).toBe(0)
  })
})

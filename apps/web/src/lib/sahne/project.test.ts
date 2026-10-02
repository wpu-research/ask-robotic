import { describe, expect, it } from 'vitest'
import { b, flag, program } from './dsl'
import { makeProject, makeVar } from './kit'
import { allMessages, cloneProject, exportProject, parseProject, renameCostumeRefs, sanitizeState, starterProject, validateProject, walkBlocks } from './project'
import { BACKDROPS } from './gallery/backdrops'
import { CHARACTERS } from './gallery/characters'
import { SOUND_GALLERY, envelope, noteSteps, soundDuration, soundSteps } from './sounds'
import { SahneSession } from './session'

describe('proje', () => {
  it('başlangıç projesi geçerli ve çalışır', () => {
    const p = starterProject()
    expect(p.sprites).toHaveLength(1)
    const s = new SahneSession(p); s.flag(); s.tick(3)
    expect(s.error).toBeNull()
  })
  it('dışa/içe aktarma gidiş dönüş', () => {
    const p = makeProject('Deneme', [{ id: 'a', sounds: ['do'], blocks: [flag([b('sh_move', { N: 3 }), b('sh_play', { S: 'Do' })])] }], { vars: [makeVar('skor', { value: 5 })], messages: ['m1'] })
    p.notes = 'plan'
    const back = parseProject(exportProject(p))!
    expect(back).toEqual(cloneProject(p))
  })
  it('bozuk / kötü niyetli içe aktarma ayıklanır', () => {
    expect(parseProject('not json')).toBeNull()
    expect(parseProject('{"version":2}')).toBeNull()
    expect(parseProject('x'.repeat(4_000_000))).toBeNull()
    const evil = { version: 1, name: '<img src=x onerror=alert(1)>', notes: 'n', stage: { backdrops: [], backdrop: 99, sounds: [{ gid: 'yok' }], procs: [], blocks: {} },
      sprites: [{ id: '../../x', name: 'S', costumes: [{ id: 'c', name: 'k', w: 99999, h: 5, shapes: [{ t: 'script', x: 1 }, { t: 'rect', x: 'a' }, { t: 'path', pts: ['x'], c: 'red', w: 3 }], bitmap: 'javascript:alert(1)' }], x: 1e12, y: NaN, size: 9999,
        blocks: { blocks: { blocks: [{ type: 'eval_bomb' }, { type: 'sh_move', next: { block: { type: 'unknown_x', next: { block: { type: 'sh_hide' } } } } }] } } }] }
    const p = validateProject(evil)!
    expect(p).not.toBeNull()
    expect(p.stage.backdrops).toHaveLength(1) // varsayılan arka plan
    expect(p.stage.sounds).toHaveLength(0)
    const s = p.sprites[0]
    expect(s.id).toMatch(/^[a-zA-Z0-9_-]+$/)
    expect(s.costumes[0].bitmap).toBeUndefined()
    expect(s.costumes[0].w).toBeLessThanOrEqual(1000)
    expect(s.costumes[0].shapes.every((x) => ['rect', 'ellipse', 'poly', 'path'].includes(x.t))).toBe(true)
    expect(s.costumes[0].shapes.length).toBeLessThanOrEqual(1)
    expect(Math.abs(s.x)).toBeLessThanOrEqual(2000); expect(s.size).toBeLessThanOrEqual(800)
    const types: string[] = []
    walkBlocks(s.blocks, (x) => types.push(x.type))
    expect(types).toEqual(['sh_move', 'sh_hide'])
  })
  it('mesajlar bloklardan ve elle eklenenlerden toplanır', () => {
    const p = makeProject('t', [{ id: 'a', blocks: [b('sh_when_msg', { M: 'x' }, []), flag([b('sh_broadcast', { M: 'y' })])] }], { messages: ['z'] })
    expect(allMessages(p).sort()).toEqual(['x', 'y', 'z'])
  })
  it('kostüm adı değişince bloklardaki başvurular güncellenir', () => {
    const st = program([flag([b('sh_costume', { C: 'kedi-b' }), b('sh_play', { S: 'Miyav' })])])
    const out = renameCostumeRefs(st, 'costume', 'kedi-b', 'yeni')
    const f: string[] = []
    walkBlocks(out, (x) => { if (x.type === 'sh_costume') f.push(String(x.fields?.C)) })
    expect(f).toEqual(['yeni'])
    expect(sanitizeState(out, []).blocks?.blocks).toHaveLength(1)
  })
})

describe('galeriler ve sesler', () => {
  it('karakterler ve arka planlar geçerli, benzersiz kimlikli', () => {
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(CHARACTERS.length)
    for (const c of CHARACTERS) { expect(c.costumes.length).toBeGreaterThan(0); for (const k of c.costumes) { expect(k.shapes.length).toBeGreaterThan(1); expect(k.w).toBe(96) } expect(new Set(c.costumes.map((k) => k.name)).size).toBe(c.costumes.length) }
    expect(BACKDROPS.length).toBeGreaterThanOrEqual(8)
    for (const bd of BACKDROPS) { expect(bd.costume.w).toBe(480); expect(bd.costume.h).toBe(360) }
  })
  it('sesler: süre, efektler, dalga biçimi', () => {
    expect(SOUND_GALLERY.length).toBeGreaterThanOrEqual(20)
    const ref = { name: 'Davul', gid: 'davul' }
    const d = soundDuration(ref)
    expect(d).toBeGreaterThan(50)
    expect(soundDuration({ ...ref, speed: 2 })).toBeCloseTo(d / 2, -1)
    expect(soundSteps({ ...ref, pitch: 2 })[0].freq).toBeCloseTo(soundSteps(ref)[0].freq * 2)
    const rev = soundSteps({ name: 'x', gid: 'puan', reverse: true })
    expect([...rev].sort((x, y) => x.at - y.at)[0].freq).toBeCloseTo(1318.5)
    const env = envelope(soundSteps(ref), 20)
    expect(env).toHaveLength(20); expect(Math.max(...env)).toBeLessThanOrEqual(1)
    expect(noteSteps(69, 1)[0].freq).toBeCloseTo(440)
  })
})

import { describe, expect, it } from 'vitest'
import { runProgramSync } from '../interpreter'
import { b, emptyProgram, program, seq, walkBlocks } from '../program'
import { assertLevelSolutions, solveLevel } from '../testing'
import { blockCount } from '../toolbox'
import { CONTROLLERS } from './ai'
import { goletGame } from './index'
import { getRecording } from './recording'
import { advance, apiFor, ARENA, BLAST_DMG, createWorld, MAX_RANGE, RELOAD, ranking, settle, snapshot, type PondData } from './sim'
import { compilePlayerCode, runTextMatch } from './textmatch'
import { JS_SOLUTIONS, TEMPLATES } from './templates'

const game = goletGame!
const levelData = (id: number) => game.levels[id - 1].data as PondData

assertLevelSolutions(game)

const world = (data: PondData, seed = 1) => createWorld(data, { seed, record: true, controllers: CONTROLLERS })
const duel = (foe: PondData['foes'][number], player = { x: 20, y: 50 }): PondData => ({ player, foes: [foe], maxTicks: 500 })

describe('Gölet: benzetim', () => {
  it('ördek yön ve hıza göre yüzer, hızlanması kademelidir', () => {
    const w = world(duel({ kind: 'sitter', x: 90, y: 90 }))
    const api = apiFor(w, w.ducks[0])
    api.swim(0, 100)
    advance(w)
    expect(w.ducks[0].speed).toBe(10)
    for (let i = 0; i < 20; i++) advance(w)
    expect(w.ducks[0].speed).toBe(100)
    expect(w.ducks[0].x).toBeGreaterThan(20 + 10)
    api.swim(90, 0)
    for (let i = 0; i < 30; i++) advance(w)
    expect(w.ducks[0].speed).toBe(0)
  })

  it('duvardan çıkamaz', () => {
    const w = world(duel({ kind: 'sitter', x: 90, y: 90 }))
    const api = apiFor(w, w.ducks[0])
    api.swim(180, 100)
    for (let i = 0; i < 100; i++) advance(w)
    expect(w.ducks[0].x).toBeGreaterThanOrEqual(0)
    expect(w.ducks[0].x).toBeLessThan(ARENA / 2)
  })

  it('top menzilde patlar; merkez isabet tam hasar verir, uzak kaçan hasar vermez', () => {
    const w = world(duel({ kind: 'sitter', x: 75, y: 50 }))
    const api = apiFor(w, w.ducks[0])
    api.cannon(0, 55)
    for (let i = 0; i < 30; i++) advance(w)
    expect(w.ducks[1].hp).toBeCloseTo(100 - BLAST_DMG, 5)
    const w2 = world(duel({ kind: 'sitter', x: 75, y: 50 }))
    apiFor(w2, w2.ducks[0]).cannon(0, 40)
    for (let i = 0; i < 30; i++) advance(w2)
    expect(w2.ducks[1].hp).toBe(100)
  })

  it('menzil 70 ile sınırlıdır ve top yeniden dolana kadar boşa gider', () => {
    const w = world(duel({ kind: 'sitter', x: 90, y: 50 }))
    const api = apiFor(w, w.ducks[0])
    api.cannon(0, 500)
    advance(w)
    expect(w.shots[0].range).toBe(MAX_RANGE)
    api.cannon(0, 50)
    advance(w) // hazır değil
    expect(w.shots.length).toBe(1)
    for (let i = 0; i < RELOAD; i++) { api.cannon(0, 50); advance(w) }
    expect(w.shots.length + w.blasts.length).toBeGreaterThan(1)
  })

  it('atan ördek kendi topundan zarar görmez', () => {
    const w = world(duel({ kind: 'sitter', x: 90, y: 90 }))
    apiFor(w, w.ducks[0]).cannon(0, 0)
    for (let i = 0; i < 5; i++) advance(w)
    expect(w.ducks[0].hp).toBe(100)
  })

  it('scan: yön ve çözünürlüğe göre en yakın rakibin uzaklığını verir, yoksa Infinity', () => {
    const w = world({ player: { x: 20, y: 50 }, foes: [{ kind: 'sitter', x: 60, y: 50 }, { kind: 'sitter', x: 40, y: 50 }], maxTicks: 100 })
    const api = apiFor(w, w.ducks[0])
    expect(api.scan(0)).toBeCloseTo(20)
    expect(api.scan(2)).toBeCloseTo(20) // ±2.5° içinde (rakip tam 0°'de)
    expect(api.scan(3)).toBe(Infinity)
    expect(api.scan(10, 5)).toBe(Infinity)
    expect(api.scan(180)).toBe(Infinity)
    expect(api.scan(10, 40)).toBeCloseTo(20)
  })

  it('komutlar saçma değerlerde çökmez (NaN, metin, Infinity)', () => {
    const w = world(duel({ kind: 'sitter', x: 90, y: 90 }))
    const api = apiFor(w, w.ducks[0])
    api.swim(NaN, Infinity)
    api.cannon('x' as unknown as number, -5)
    expect(() => { for (let i = 0; i < 40; i++) advance(w) }).not.toThrow()
    expect(Number.isFinite(w.ducks[0].x)).toBe(true)
  })

  it('aynı tohumla aynı maç, kayıt kareleri her tikte bir', () => {
    const run = (seed: number) => runTextMatch(JS_SOLUTIONS[7], levelData(7), seed)
    const a = run(3), b2 = run(3)
    expect(a.ticks).toBe(b2.ticks)
    expect(a.frames.length).toBeGreaterThanOrEqual(a.ticks + 1)
    const strip = (f: unknown) => JSON.stringify({ ...(f as object), recId: 0 })
    expect(strip(a.frames.at(-1))).toBe(strip(b2.frames.at(-1)))
  })

  it('maç süresi dolunca biter; sıralama sağ kalanları önce koyar', () => {
    const w = world({ player: { x: 20, y: 50 }, foes: [{ kind: 'sitter', x: 80, y: 50 }], maxTicks: 10 })
    for (let i = 0; i < 20; i++) advance(w)
    expect(w.over).toBe(true)
    expect(w.reason).toBe('timeout')
    const f = snapshot(w)
    f.ducks[1].alive = false
    f.ducks[1].diedAt = 3
    expect(ranking(f)[0].name).toBe('Sen')
  })

  it('settle: program bitince havadaki top yerine iner', () => {
    const w = world(duel({ kind: 'sitter', x: 75, y: 50 }))
    apiFor(w, w.ducks[0]).cannon(0, 55)
    advance(w)
    expect(w.shots.length).toBe(1)
    settle(w)
    expect(w.shots.length).toBe(0)
    expect(w.ducks[1].hp).toBeLessThan(100)
  })
})

describe('Gölet: rakipler', () => {
  const play = (kind: 'sitter' | 'wanderer' | 'hunter' | 'sniper' | 'master', ticks = 300) => {
    const w = world({ player: { x: 20, y: 50 }, foes: [{ kind, x: 80, y: 50 }], maxTicks: ticks })
    while (!w.over) advance(w)
    return w
  }
  it('Dümdüz hiç kıpırdamaz ve ateş etmez', () => {
    const w = play('sitter')
    expect(w.ducks[1].x).toBe(80)
    expect(w.ducks[0].hp).toBe(100)
    expect(w.ducks[1].damage).toBe(0)
  })
  it('Gezgin dolaşır ama ateş etmez', () => {
    const w = play('wanderer')
    expect(Math.hypot(w.ducks[1].x - 80, w.ducks[1].y - 50)).toBeGreaterThan(1)
    expect(w.ducks[0].hp).toBe(100)
  })
  for (const kind of ['hunter', 'sniper', 'master'] as const) {
    it(`${kind}: durağan oyuncuyu vurur ve öldürür`, () => {
      const w = play(kind, 600)
      expect(w.ducks[1].damage).toBeGreaterThan(0)
      expect(w.ducks[0].alive).toBe(false)
    })
  }
  it('rakipler sınırlar içinde kalır', () => {
    for (const kind of ['wanderer', 'hunter', 'sniper', 'master'] as const) {
      const w = play(kind, 400)
      for (const d of w.ducks) { expect(d.x).toBeGreaterThanOrEqual(0); expect(d.x).toBeLessThanOrEqual(ARENA) }
    }
  })
})

describe('Gölet: blok kipi', () => {
  it('seviye sayısı 10 ve her seviyede kısa Türkçe giriş ile ipucu var', () => {
    expect(game.levels).toHaveLength(10)
    for (const l of game.levels) { expect(l.intro.length).toBeGreaterThan(20); expect(l.hint?.length ?? 0).toBeGreaterThan(20) }
  })

  it('1v1 seviyeleri 1–5, 1v3 seviyeleri 6–10', () => {
    expect(game.levels.slice(0, 5).map((l) => (l.data as PondData).foes.length)).toEqual([1, 1, 1, 1, 1])
    expect(game.levels.slice(5).map((l) => (l.data as PondData).foes.length)).toEqual([3, 3, 3, 3, 3])
    expect(game.levels.slice(0, 5).map((l) => (l.data as PondData).foes[0].kind)).toEqual(['sitter', 'sitter', 'sitter', 'wanderer', 'hunter'])
  })

  // Tarama gerektiren seviyelerde rakipler tohuma göre başka yerlerde durur; çözüm hepsinde kazanmalı.
  for (const l of [1, 2, 3, 4, 5, 6, 7, 8]) {
    it(`seviye ${l} çözümü farklı tohumlarda kazanır`, () => {
      const level = game.levels[l - 1]
      for (let seed = 1; seed <= 8; seed++) {
        const r = solveLevel(game, level, level.solution, { seed })
        expect(r.outcome.ok, `tohum ${seed}: ${r.outcome.message}`).toBe(true)
      }
    })
  }
  // Final seviyeleri rakiplerin kendi aralarındaki kavgaya da bağlıdır: çözüm çoğu tohumda kazanır (kesin değil).
  for (const [l, min] of [[9, 16], [10, 13]] as const) {
    it(`seviye ${l} çözümü çoğu tohumda kazanır`, () => {
      const level = game.levels[l - 1]
      let wins = 0
      for (let seed = 1; seed <= 20; seed++) if (solveLevel(game, level, level.solution, { seed }).outcome.ok) wins++
      expect(wins).toBeGreaterThanOrEqual(min)
    })
  }

  it('yanlış yöne ateş eden program kazanamaz ve nedenini söyler', () => {
    const wrong = program(b('controls_repeat_ext', {}, { TIMES: 100, DO: b('golet_ates', {}, { DIR: 180, RANGE: 55 }) }))
    const r = solveLevel(game, game.levels[0], wrong)
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).toMatch(/rakip/)
  })

  it('1v3 seviyelerinde yerinde duran oyuncu kazanamaz (savaş başlar, süre dolar ya da yenilir)', () => {
    for (const id of [8, 9, 10]) {
      const lv = game.levels[id - 1]
      const idle = program(b('golet_surekli', {}, { DO: b('golet_yuz', {}, { DIR: 0, SPEED: 0 }) }))
      expect(solveLevel(game, lv, idle).outcome.ok).toBe(false)
    }
  })

  it('düşman yenmeden ateş eden basit saldırı seviye 5\'te yenilir (kaçmak şart)', () => {
    const lv = game.levels[4]
    let loses = 0
    const naive = program(b('golet_surekli', {}, { DO: seq(b('golet_ates', {}, { DIR: 0, RANGE: 60 })) }))
    for (let seed = 1; seed <= 5; seed++) if (!solveLevel(game, lv, naive, { seed }).outcome.ok) loses++
    expect(loses).toBe(5)
  })

  it('"maç bitene kadar tekrarla" içinde eylem yoksa donmaz (ördek bekler) ve süre dolunca durur', () => {
    const lv = game.levels[2]
    const r = solveLevel(game, lv, program(b('golet_surekli', {}, { DO: b('variables_set', { VAR: { id: 'x' } }, { VALUE: 1 }) })))
    expect(r.result.reason).toBe('halted')
    expect(r.outcome.ok).toBe(false)
  })

  it('sensör blokları değer verir (tara menzil dışıysa 999)', () => {
    const run = game.engine.createRun(game.levels[2], { seed: 1 })
    const out: unknown[] = []
    const probe = program(b('golet_yuz', {}, { DIR: b('golet_tara', {}, { DIR: 180 }), SPEED: 0 }))
    runProgramSync(probe, { ...run.api, blocks: { ...run.api.blocks, golet_yuz: (c) => { out.push(c.value('DIR'), run.api.blocks.golet_can(c), run.api.blocks.golet_x(c)) } } })
    expect(out).toEqual([999, 100, 20])
  })

  it('blok sınırı, sayıları ayrı blok olarak sürükleyenlere de yeter (gölge sayılar da sayılsa)', () => {
    for (const l of game.levels) {
      let withLiterals = blockCount(game, l.solution)
      walkBlocks(l.solution, (blk, shadow) => { if (shadow && blk.type === 'math_number') withLiterals++ })
      expect(withLiterals, `seviye ${l.id}`).toBeLessThanOrEqual(l.maxBlocks!)
      expect(l.toolbox).toContain('math_number')
    }
  })

  it('boş program yenilir, kaydedilen kare sayısı tik sayısına uyar', () => {
    const run = game.engine.createRun(game.levels[0], { seed: 1 })
    const res = runProgramSync(emptyProgram(), run.api, {})
    expect(run.evaluate(res).ok).toBe(false)
    const f = run.snapshot()
    expect(getRecording(f.recId)!.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Gölet: JavaScript kipi', () => {
  for (let id = 1; id <= 10; id++) {
    it(`seviye ${id} JavaScript çözümü kazanır`, () => {
      const wins = [1, 2, 3, 4, 5, 6].filter((seed) => runTextMatch(JS_SOLUTIONS[id], levelData(id), seed).won).length
      expect(wins).toBeGreaterThanOrEqual(id >= 9 ? 3 : 5)
      expect(runTextMatch(JS_SOLUTIONS[id], levelData(id), 1).frames.length).toBeGreaterThan(1)
    })
  }
  it('boş kod hiçbir seviyeyi geçmez', () => {
    for (let id = 1; id <= 10; id++) expect(runTextMatch('', levelData(id), 1).won).toBe(false)
  })
  it('örnek kodlar derlenir ve çalışır', () => {
    for (const t of TEMPLATES) {
      expect(compilePlayerCode(t.code).ok, t.name).toBe(true)
      const r = runTextMatch(t.code, levelData(5), 1)
      expect(r.error, t.name).toBeUndefined()
    }
  })
  it('yazım hatası anlaşılır bildirilir', () => {
    const r = runTextMatch('cannon(0, ', levelData(1))
    expect(r.won).toBe(false)
    expect(r.error).toMatch(/yazım hatası/)
  })
  it('çalışma hatası (tanımsız ad) maçı durdurur ve hata ileti verir', () => {
    const r = runTextMatch('uzaklik.x.y', levelData(1))
    expect(r.error).toMatch(/hata verdi/)
    expect(r.reason).toBe('error')
  })
  it('hafiza tikler arası kalır', () => {
    const r = runTextMatch('hafiza.n = (hafiza.n ?? 0) + 1; if (hafiza.n === 5) swim(90, 100);', levelData(1))
    expect(r.frames[r.frames.length - 1].ducks[0].y).toBeGreaterThan(50)
  })
  it('kod yalnızca verilen komutlara erişir (katı kip)', () => {
    const r = runTextMatch('if (this !== undefined) throw new Error("this açık")', levelData(1))
    expect(r.error).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { activityKey, allActivities, getActivity } from './activity'
import { allBlocks, evaluateGoals, runnableScripts, simulate } from './analysis'
import { ALL_BLOCK_TYPES, BACKGROUNDS, CHARACTERS } from './blocks'
import type { Block, Project } from './types'

const ALL = allActivities()

const ids = (p: Project): string[] => {
  const out: string[] = []
  const walk = (blocks: Block[]) => blocks.forEach((b) => { out.push(b.id); if (b.children) walk(b.children) })
  for (const pg of p.pages) {
    out.push(pg.id)
    for (const s of pg.sprites) {
      out.push(s.id)
      for (const sc of s.scripts) { out.push(sc.id); walk(sc.blocks) }
    }
  }
  return out
}

const done = (p: Project, a: NonNullable<ReturnType<typeof getActivity>>) => evaluateGoals(p, a.goals).map((g) => g.done)

describe('Modül 1 etkinlikleri', () => {
  it('on etkinlik var: modülün bütün dersleri uygulamalı', () => {
    const keys = ALL.map(([k]) => k).sort()
    expect(keys).toEqual(
      ['1:1', '1:2', '2:1', '2:2', '3:1', '3:2', '4:1', '4:2', '5:1', '5:2'].map((k) => `scratchjr:${k}`).sort(),
    )
  })

  it('anahtarlar scratchjr modülündeki gerçek hafta/ders konumlarına karşılık gelir', () => {
    const m = allModules.find((x) => x.slug === 'scratchjr')!
    for (const [key] of ALL) {
      const [slug, w, l] = key.split(':')
      expect(slug).toBe('scratchjr')
      const week = m.weeks[Number(w) - 1]
      expect(week, key).toBeDefined()
      expect(week.lessons[Number(l) - 1], key).toBeDefined()
    }
    // Her dersin etkinliği var ve anahtar biçimi activityKey ile aynı.
    m.weeks.forEach((w, wi) => w.lessons.forEach((_, li) => {
      expect(getActivity(activityKey('scratchjr', wi + 1, li + 1)), `${wi + 1}.${li + 1}`).not.toBeNull()
    }))
  })

  it('ders başlıklarında "ekransız" ibaresi ve fiziksel malzeme kalmadı', () => {
    const m = allModules.find((x) => x.slug === 'scratchjr')!
    const banned = /ekransız|scratchjr|tablet|telefon|mağaza|kâğıt|yastık|oyuncak|\bçiz|boya/i
    for (const w of m.weeks)
      for (const l of w.lessons) {
        expect(l.title, l.title).not.toMatch(/ekransız/i)
        expect(`${l.problem}\n${l.contentMd}\n${l.question}`, l.title).not.toMatch(banned)
      }
  })

  for (const [key, a] of ALL) {
    describe(key, () => {
      it('hedefler: benzersiz kimlik, metin ve ipucu var', () => {
        expect(a.goals.length).toBeGreaterThanOrEqual(2)
        expect(new Set(a.goals.map((g) => g.id)).size).toBe(a.goals.length)
        for (const g of a.goals) {
          expect(g.text.length, g.id).toBeGreaterThan(8)
          expect(g.hint && g.hint.length, g.id).toBeGreaterThan(8)
        }
        expect(a.intro && a.intro.length).toBeGreaterThan(10)
      })

      it('starter tüm hedefleri sağlamaz (en az biri eksik)', () => {
        const r = done(a.starter(), a)
        expect(r.every(Boolean)).toBe(false)
      })

      it('solution() tüm hedefleri sağlar', () => {
        expect(a.solution).toBeTypeOf('function')
        const p = a.solution!()
        const res = evaluateGoals(p, a.goals)
        expect(res.filter((g) => !g.done).map((g) => g.id)).toEqual([])
      })

      it('allowedBlocks geçerli; solution yalnız izin verilen bloklarla kurulu', () => {
        expect(a.allowedBlocks).toBeDefined()
        for (const t of a.allowedBlocks!) expect(ALL_BLOCK_TYPES).toContain(t)
        const allowed = new Set(a.allowedBlocks)
        const used = new Set(allBlocks(a.solution!()).map((b) => b.type))
        expect([...used].filter((t) => !allowed.has(t))).toEqual([])
        // Starter de izin verilen bloklarla sınırlı (oyuncu düzenleyebilmeli).
        const startUsed = new Set(allBlocks(a.starter()).map((b) => b.type))
        expect([...startUsed].filter((t) => !allowed.has(t))).toEqual([])
      })

      it('solution sayfa/karakter izinlerine uyar ve geçerli karakter/arka plan kullanır', () => {
        const p = a.solution!()
        if (!a.allowPages) expect(p.pages).toHaveLength(a.starter().pages.length)
        if (!a.allowSprites) {
          expect(p.pages.map((pg) => pg.sprites.length)).toEqual(a.starter().pages.map((pg) => pg.sprites.length))
        }
        for (const proj of [a.starter(), p])
          for (const pg of proj.pages) {
            expect(Object.keys(BACKGROUNDS)).toContain(pg.background)
            for (const s of pg.sprites) expect(Object.keys(CHARACTERS)).toContain(s.character)
          }
      })

      it('iki starter() çağrısı farklı kimlikler üretir', () => {
        const a1 = ids(a.starter())
        const a2 = ids(a.starter())
        expect(a1.length).toBeGreaterThan(0)
        expect(new Set(a1).size).toBe(a1.length)
        expect(a1.filter((x) => a2.includes(x))).toEqual([])
      })

      it('starter() çağrıları birbirini etkilemez', () => {
        const p1 = a.starter()
        p1.pages[0].background = 'night'
        p1.pages[0].sprites = []
        const p2 = a.starter()
        expect(p2.pages[0].sprites.length).toBeGreaterThan(0)
        expect(p2).not.toBe(p1)
      })
    })
  }
})

describe('etkinliklere özgü davranışlar', () => {
  const get = (k: string) => getActivity(k)!

  it('1.1: sıra önemli; dönüş İleri\'den önce gelirse robot yıldıza varamaz', () => {
    const a = get('scratchjr:1:1')
    const p = a.solution!()
    const robot = p.pages[0].sprites.find((s) => s.character === 'robot')!
    const sc = robot.scripts[0]
    // Sağa dön'ü ilk İleri'nin önüne taşı.
    const swapped: Project = structuredClone(p)
    const blocks = swapped.pages[0].sprites[0].scripts[0].blocks
    const turnIdx = blocks.findIndex((b) => b.type === 'turnRight')
    const [turn] = blocks.splice(turnIdx, 1)
    blocks.splice(1, 0, turn)
    expect(sc.blocks[0].type).toBe('flag')
    const res = evaluateGoals(swapped, a.goals)
    expect(res.find((g) => g.id === 'reach')!.done).toBe(false)
    expect(res.find((g) => g.id === 'order')!.done).toBe(false)
  })

  it('1.1: yalnızca izin verilen beş blok', () => {
    expect(get('scratchjr:1:1').allowedBlocks).toEqual(['flag', 'forward', 'turnRight', 'turnLeft', 'hop'])
  })

  it('2.1: starter davranışı çözümle aynı ama blok sayısı fazla', () => {
    const a = get('scratchjr:2:1')
    const res = evaluateGoals(a.starter(), a.goals)
    expect(res.find((g) => g.id === 'same')!.done).toBe(true)
    expect(res.find((g) => g.id === 'short')!.done).toBe(false)
    expect(res.find((g) => g.id === 'use-repeat')!.done).toBe(false)
  })

  it('2.1: Tekrarla sayısı 3 olursa aynı sonuç olmaz', () => {
    const a = get('scratchjr:2:1')
    const p = a.solution!()
    p.pages[0].sprites[0].scripts[0].blocks[1].value = 3
    expect(evaluateGoals(p, a.goals).find((g) => g.id === 'same')!.done).toBe(false)
  })

  it('3.1: bayrağa basınca hiçbir şey olmaz, dokununca olur', () => {
    const p = get('scratchjr:3:1').solution!()
    const flag = simulate(p, { press: 'flag', ms: 3000 })
    expect(flag.events).toEqual([])
    const house = p.pages[0].sprites.find((s) => s.character === 'house')!
    expect(simulate(p, { press: { tap: house.id }, ms: 3000 }).events.some((e) => e.kind === 'say')).toBe(true)
  })

  it('3.2: konuşma dokununca oluşur; bayrakla oluşmaz', () => {
    const p = get('scratchjr:3:2').solution!()
    expect(simulate(p, { press: 'flag', ms: 3000 }).events.filter((e) => e.kind === 'say')).toEqual([])
    const dog = p.pages[0].sprites[0]
    expect(simulate(p, { press: { tap: dog.id }, ms: 3000 }).events.some((e) => e.kind === 'say')).toBe(true)
  })

  it('4.2: sayfa geçişi simülasyonda görülür, 2. sayfada konuşma olur', () => {
    const r = simulate(get('scratchjr:4:2').solution!(), { press: 'flag', ms: 15000 })
    expect(r.events.some((e) => e.kind === 'page' && e.page === 2)).toBe(true)
    expect(r.snapshot.pageIndex).toBe(1)
  })

  it('5.1: starter\'da kasıtlı hatalar var; hiçbiri hedefi sağlamaz', () => {
    const a = get('scratchjr:5:1')
    const p = a.starter()
    expect(done(p, a)).toEqual([false, false])
    const sprites = p.pages[0].sprites
    expect(sprites.some((s) => s.character === 'star' && s.scripts.length === 0)).toBe(true)
    const cat = sprites.find((s) => s.character === 'cat')!
    expect(cat.scripts.some((sc) => !runnableScripts({ pages: [{ ...p.pages[0], sprites: [{ ...cat, scripts: [sc] }] }] }).length)).toBe(true)
  })

  it('5.1: tek hatayı düzeltmek yetmez (başlatmasız betiği silmek tek başına hedefi sağlamaz)', () => {
    const a = get('scratchjr:5:1')
    const p = a.starter()
    const cat = p.pages[0].sprites.find((s) => s.character === 'cat')!
    cat.scripts = cat.scripts.filter((sc) => sc.blocks[0].type === 'flag')
    const res = evaluateGoals(p, a.goals)
    expect(res.find((g) => g.id === 'no-dead')!.done).toBe(true)
    expect(res.find((g) => g.id === 'reach')!.done).toBe(false)
  })

  it('5.2: boş proje hiçbir hedefi sağlamaz; hedefler yaratıcıyı kısıtlamaz (başka bir çözüm de geçer)', () => {
    const a = get('scratchjr:5:2')
    expect(done(a.starter(), a).some(Boolean)).toBe(false)
    const p = a.starter()
    p.pages[0].sprites[0].scripts = [
      { id: 'x1', blocks: [
        { id: 'x2', type: 'tap' },
        { id: 'x3', type: 'forever', children: [{ id: 'x4', type: 'turnRight', value: 30 }, { id: 'x5', type: 'say', text: 'Selam' }] },
      ] },
    ]
    p.pages.push({ id: 'x6', background: 'sea', sprites: [] })
    expect(evaluateGoals(p, a.goals).every((g) => g.done)).toBe(true)
  })

  it('4.1: üç sayfa, her sayfada karakter, iki farklı arka plan', () => {
    const a = get('scratchjr:4:1')
    const p = a.solution!()
    expect(p.pages).toHaveLength(3)
    expect(new Set(p.pages.map((pg) => pg.background)).size).toBeGreaterThanOrEqual(2)
    expect(done(a.starter(), a)).toEqual([false, true, false])
  })
})

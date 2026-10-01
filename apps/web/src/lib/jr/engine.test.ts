import { describe, expect, it } from 'vitest'
import { Engine } from './engine'
import { blk, flagProject, page, proj, script, sprite } from './testkit'
import { STAGE_H, STAGE_W, STEP_UNITS } from './types'

const me = (e: Engine, id = 'a') => e.snapshot.sprites.find((s) => s.id === id)!

describe('Engine hareket', () => {
  it('ileri: adım × STEP_UNITS mesafe, adım × 200 ms süre', () => {
    const e = new Engine(flagProject(blk('forward', 3)))
    e.pressFlag()
    e.tick(300)
    expect(me(e).x).toBeCloseTo(100 + 1.5 * STEP_UNITS, 5)
    expect(e.idle).toBe(false)
    e.tick(300)
    expect(me(e).x).toBeCloseTo(100 + 3 * STEP_UNITS, 5)
    expect(me(e).y).toBeCloseTo(100, 5)
    expect(e.idle).toBe(true)
    expect(e.snapshot.running).toBe(false)
    expect(e.snapshot.time).toBe(600)
  })

  it('ileri tick boyutundan bağımsız aynı sonucu verir', () => {
    const a = new Engine(flagProject(blk('forward', 5), blk('turnRight', 90), blk('forward', 2)))
    const b = new Engine(flagProject(blk('forward', 5), blk('turnRight', 90), blk('forward', 2)))
    a.pressFlag(); b.pressFlag()
    a.tick(2000)
    while (!b.idle) b.tick(7)
    expect(me(a).x).toBeCloseTo(me(b).x, 4)
    expect(me(a).y).toBeCloseTo(me(b).y, 4)
  })

  it('geri: ters yönde gider', () => {
    const e = new Engine(flagProject(blk('back', 2)))
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100 - 2 * STEP_UNITS, 5)
  })

  it('sağa dönüş saat yönünde, süre 300ms×(derece/90)', () => {
    const e = new Engine(flagProject(blk('turnRight', 90)))
    e.pressFlag()
    e.tick(150)
    expect(me(e).heading).toBeCloseTo(45, 4)
    e.tick(150)
    expect(me(e).heading).toBeCloseTo(90, 4)
    expect(e.idle).toBe(true)
  })

  it('sola dönüş ve heading [0,360) aralığına sarar', () => {
    const e = new Engine(flagProject(blk('turnLeft', 90)))
    e.pressFlag()
    e.runUntilIdle(2000)
    expect(me(e).heading).toBeCloseTo(270, 4)
    const f = new Engine(flagProject(blk('turnRight', 270), blk('turnRight', 180)))
    f.pressFlag()
    f.runUntilIdle(5000)
    expect(me(f).heading).toBeCloseTo(90, 4)
    const g = new Engine(flagProject(blk('turnRight', 360)))
    g.pressFlag()
    g.runUntilIdle(5000)
    expect(me(g).heading).toBe(0)
  })

  it('dönüş sonrası ileri yönü değişir (90° = aşağı)', () => {
    const e = new Engine(flagProject(blk('turnRight', 90), blk('forward', 2)))
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100, 4)
    expect(me(e).y).toBeCloseTo(100 + 2 * STEP_UNITS, 4)
  })

  it('sahne kenarında kıstırılır (sağ ve sol/üst)', () => {
    const e = new Engine(proj(page('p', sprite('a', STAGE_W - 10, 10, script('s', blk('flag'), blk('forward', 10))))))
    e.pressFlag()
    e.runUntilIdle(10000)
    expect(me(e).x).toBe(STAGE_W)
    const f = new Engine(proj(page('p', sprite('a', 10, 10, script('s', blk('flag'), blk('turnLeft', 90), blk('forward', 10))))))
    f.pressFlag()
    f.runUntilIdle(10000)
    expect(me(f).y).toBe(0)
    expect(me(f).x).toBeCloseTo(10, 4)
    const g = new Engine(proj(page('p', sprite('a', 10, 10, script('s', blk('flag'), blk('back', 10))))))
    g.pressFlag()
    g.runUntilIdle(10000)
    expect(me(g).x).toBe(0)
  })

  it('hop konumu değiştirmez, süresi 500ms×kez ve hop olayı kaydeder', () => {
    const e = new Engine(flagProject(blk('hop', 2)))
    e.pressFlag()
    e.tick(999)
    expect(e.idle).toBe(false)
    e.tick(1)
    expect(e.idle).toBe(true)
    expect(me(e).x).toBe(100)
    expect(me(e).y).toBe(100)
    const hops = e.events.filter((x) => x.kind === 'hop')
    expect(hops.map((h) => h.t)).toEqual([0, 500])
  })

  it('goHome başlangıç x,y konumuna anında döner, heading değişmez', () => {
    const e = new Engine(flagProject(blk('turnRight', 90), blk('forward', 2), blk('goHome')))
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(me(e).x).toBe(100)
    expect(me(e).y).toBe(100)
    expect(me(e).heading).toBeCloseTo(90, 4)
  })
})

describe('Engine görünüm ve ses', () => {
  it('say 2000 ms gösterir, sonra null; olay kaydedilir', () => {
    const e = new Engine(flagProject(blk('say', undefined, undefined, 'Selam')))
    e.pressFlag()
    expect(me(e).say).toBe('Selam')
    e.tick(1999)
    expect(me(e).say).toBe('Selam')
    expect(e.idle).toBe(false)
    e.tick(1)
    expect(me(e).say).toBeNull()
    expect(e.idle).toBe(true)
    expect(e.events).toEqual([{ t: 0, kind: 'say', spriteId: 'a', text: 'Selam' }])
  })

  it('say süresince iş parçacığı bekler (sonraki blok 2 sn sonra çalışır)', () => {
    const e = new Engine(flagProject(blk('say', undefined, undefined, 'x'), blk('forward', 1)))
    e.pressFlag()
    e.tick(2000)
    expect(me(e).x).toBe(100)
    e.tick(200)
    expect(me(e).x).toBeCloseTo(100 + STEP_UNITS, 4)
  })

  it('grow ×1.25 (en çok 3), shrink ÷1.25 (en az 0.4), resetSize 1; her biri 250ms', () => {
    const e = new Engine(flagProject(blk('grow')))
    e.pressFlag()
    expect(me(e).scale).toBeCloseTo(1.25, 5)
    e.tick(249)
    expect(e.idle).toBe(false)
    e.tick(1)
    expect(e.idle).toBe(true)

    const g = new Engine(flagProject(blk('repeat', 10, [blk('grow')])))
    g.pressFlag()
    g.runUntilIdle(10000)
    expect(me(g).scale).toBe(3)

    const s = new Engine(flagProject(blk('repeat', 10, [blk('shrink')])))
    s.pressFlag()
    s.runUntilIdle(10000)
    expect(me(s).scale).toBeCloseTo(0.4, 5)

    const r = new Engine(flagProject(blk('grow'), blk('grow'), blk('resetSize')))
    r.pressFlag()
    r.tick(749)
    expect(r.idle).toBe(false)
    r.tick(1)
    expect(r.idle).toBe(true)
    expect(me(r).scale).toBe(1)
    expect(r.snapshot.time).toBe(750)
  })

  it('hide/show anında', () => {
    const e = new Engine(flagProject(blk('hide')))
    e.pressFlag()
    expect(me(e).visible).toBe(false)
    expect(e.idle).toBe(true)
    const f = new Engine(flagProject(blk('hide'), blk('show')))
    f.pressFlag()
    expect(me(f).visible).toBe(true)
  })

  it('pop onSound çağırır, olay kaydeder, 300ms sürer', () => {
    const calls: number[] = []
    const e = new Engine(flagProject(blk('pop', 2)), { onSound: (n) => calls.push(n) })
    e.pressFlag()
    expect(calls).toEqual([2])
    e.tick(299)
    expect(e.idle).toBe(false)
    e.tick(1)
    expect(e.idle).toBe(true)
    expect(e.events).toEqual([{ t: 0, kind: 'sound', spriteId: 'a', sound: 2 }])
  })
})

describe('Engine kontrol', () => {
  it('wait value saniye bekler', () => {
    const e = new Engine(flagProject(blk('wait', 1.5), blk('forward', 1)))
    e.pressFlag()
    e.tick(1499)
    expect(me(e).x).toBe(100)
    e.tick(1)
    e.tick(200)
    expect(me(e).x).toBeCloseTo(100 + STEP_UNITS, 4)
    expect(e.snapshot.time).toBe(1700)
  })

  it('repeat 3 ileri 2 → toplam 6 adım', () => {
    const e = new Engine(flagProject(blk('repeat', 3, [blk('forward', 2)])))
    e.pressFlag()
    e.runUntilIdle(10000)
    expect(me(e).x).toBeCloseTo(100 + 6 * STEP_UNITS, 4)
    expect(e.snapshot.time).toBe(1200)
  })

  it('repeat boş çocuklarla hemen biter', () => {
    const e = new Engine(flagProject(blk('repeat', 5, []), blk('forward', 1)))
    e.pressFlag()
    e.tick(200)
    expect(me(e).x).toBeCloseTo(100 + STEP_UNITS, 4)
    const f = new Engine(flagProject(blk('repeat', 5)))
    f.pressFlag()
    expect(f.idle).toBe(true)
  })

  it('iç içe repeat', () => {
    const e = new Engine(flagProject(blk('repeat', 2, [blk('repeat', 3, [blk('forward', 1)])])))
    e.pressFlag()
    e.runUntilIdle(10000)
    expect(me(e).x).toBeCloseTo(100 + 6 * STEP_UNITS, 4)
  })

  it('forever sürer, stop() ile durur ve balonları temizler', () => {
    const e = new Engine(flagProject(blk('forever', undefined, [blk('say', undefined, undefined, 'hey')])))
    e.pressFlag()
    e.tick(10000)
    expect(e.idle).toBe(false)
    expect(e.snapshot.running).toBe(true)
    expect(me(e).say).toBe('hey')
    e.stop()
    expect(e.idle).toBe(true)
    expect(me(e).say).toBeNull()
    const t = e.snapshot.time
    e.tick(1000)
    expect(e.events.length).toBe(6) // 0, 2, 4, 6, 8 ve 10. saniyede başlayan söylemeler
    expect(e.snapshot.time).toBe(t + 1000)
  })

  it('boş forever donmaz; runUntilIdle zaman aşımıyla döner', () => {
    const e = new Engine(flagProject(blk('forever', undefined, [])))
    e.pressFlag()
    e.tick(1000)
    expect(e.snapshot.time).toBe(1000)
    expect(e.idle).toBe(false)
    expect(e.runUntilIdle(500)).toBe(false)
    expect(e.snapshot.time).toBe(1500)
  })

  it('yalnız anlık bloklu forever donmaz', () => {
    const e = new Engine(flagProject(blk('forever', undefined, [blk('hide'), blk('show')])))
    e.pressFlag()
    e.tick(160)
    expect(e.idle).toBe(false)
    expect(me(e).visible).toBe(true)
  })

  it('stop bloğu iş parçacığını bitirir, sonrası çalışmaz', () => {
    const e = new Engine(flagProject(blk('forward', 1), blk('stop'), blk('forward', 5)))
    e.pressFlag()
    e.runUntilIdle(10000)
    expect(me(e).x).toBeCloseTo(100 + STEP_UNITS, 4)
    const f = new Engine(flagProject(blk('repeat', 3, [blk('forward', 1), blk('stop')])))
    f.pressFlag()
    f.runUntilIdle(10000)
    expect(me(f).x).toBeCloseTo(100 + STEP_UNITS, 4)
  })
})

describe('Engine betikler ve paralellik', () => {
  it('iki sprite paralel çalışır', () => {
    const e = new Engine(
      proj(page('p', sprite('a', 50, 50, script('s1', blk('flag'), blk('forward', 2))), sprite('b', 50, 200, script('s2', blk('flag'), blk('forward', 4))))),
    )
    e.pressFlag()
    e.tick(400)
    expect(me(e, 'a').x).toBeCloseTo(50 + 2 * STEP_UNITS, 4)
    expect(me(e, 'b').x).toBeCloseTo(50 + 2 * STEP_UNITS, 4)
    e.tick(400)
    expect(me(e, 'a').x).toBeCloseTo(50 + 2 * STEP_UNITS, 4)
    expect(me(e, 'b').x).toBeCloseTo(50 + 4 * STEP_UNITS, 4)
  })

  it('aynı sprite iki betik paralel çalışır', () => {
    const e = new Engine(
      proj(page('p', sprite('a', 100, 100, script('s1', blk('flag'), blk('forward', 2)), script('s2', blk('flag'), blk('say', undefined, undefined, 'hi'))))),
    )
    e.pressFlag()
    e.tick(400)
    expect(me(e).x).toBeCloseTo(100 + 2 * STEP_UNITS, 4)
    expect(me(e).say).toBe('hi')
  })

  it('aynı sprite paralel iki hareket toplanır', () => {
    const e = new Engine(
      proj(page('p', sprite('a', 100, 100, script('s1', blk('flag'), blk('forward', 2)), script('s2', blk('flag'), blk('forward', 2))))),
    )
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100 + 4 * STEP_UNITS, 4)
  })

  it('tap yalnız o sprite\'ın tap betiğini başlatır', () => {
    const e = new Engine(
      proj(page('p', sprite('a', 100, 100, script('s1', blk('tap'), blk('forward', 1))), sprite('b', 100, 200, script('s2', blk('tap'), blk('forward', 1))))),
    )
    e.tapSprite('a')
    e.runUntilIdle(1000)
    expect(me(e, 'a').x).toBeCloseTo(100 + STEP_UNITS, 4)
    expect(me(e, 'b').x).toBe(100)
  })

  it('tap ile başlamayan betik tap\'te çalışmaz (bayrak betiği)', () => {
    const e = new Engine(flagProject(blk('forward', 1)))
    e.tapSprite('a')
    expect(e.idle).toBe(true)
    expect(me(e).x).toBe(100)
  })

  it('bayrak betiği tap betiğini başlatmaz, tap betiği pressFlag ile çalışmaz', () => {
    const e = new Engine(proj(page('p', sprite('a', 100, 100, script('s1', blk('tap'), blk('forward', 1))))))
    e.pressFlag()
    expect(e.idle).toBe(true)
  })

  it('ilk bloğu başlatma olmayan betik çalışmaz; ortadaki başlatma bloğu yok sayılır', () => {
    const e = new Engine(proj(page('p', sprite('a', 100, 100, script('s1', blk('forward', 1), blk('flag'))))))
    e.pressFlag()
    expect(e.idle).toBe(true)
    expect(me(e).x).toBe(100)
    const f = new Engine(flagProject(blk('forward', 1), blk('flag'), blk('tap'), blk('forward', 1)))
    f.pressFlag()
    f.runUntilIdle(5000)
    expect(me(f).x).toBeCloseTo(100 + 2 * STEP_UNITS, 4)
  })

  it('olmayan sprite için tapSprite sessizce yok sayılır', () => {
    const e = new Engine(flagProject(blk('forward', 1)))
    expect(() => e.tapSprite('yok')).not.toThrow()
    expect(e.idle).toBe(true)
  })

  it('pressFlag tekrarında betik yeniden başlar, çift çalışmaz', () => {
    const e = new Engine(flagProject(blk('forward', 5)))
    e.pressFlag()
    e.tick(400)
    e.pressFlag()
    e.runUntilIdle(10000)
    // 400ms'de 2 adım gitti; yeniden başlayan betik 5 adım daha gider: toplam 7 adım (çift çalışsaydı 12).
    expect(me(e).x).toBeCloseTo(100 + 7 * STEP_UNITS, 3)
  })

  it('yeniden başlatma yarım kalan say balonunu temizler', () => {
    const e = new Engine(flagProject(blk('say', undefined, undefined, 'a'), blk('forward', 1)))
    e.pressFlag()
    e.tick(1000)
    e.pressFlag()
    e.tick(1999)
    expect(me(e).say).toBe('a')
    e.tick(1)
    expect(me(e).say).toBeNull()
  })

  it('pressFlag çalışanları durdurmaz ve sprite\'ları sıfırlamaz', () => {
    const e = new Engine(
      proj(page('p', sprite('a', 100, 100, script('s1', blk('flag'), blk('forward', 1))), sprite('b', 100, 200, script('s2', blk('tap'), blk('forward', 10))))),
    )
    e.tapSprite('b')
    e.tick(400)
    e.pressFlag()
    e.runUntilIdle(10000)
    expect(me(e, 'b').x).toBeCloseTo(100 + 10 * STEP_UNITS, 3)
    expect(me(e, 'a').x).toBeCloseTo(100 + STEP_UNITS, 3)
  })
})

describe('Engine sayfalar', () => {
  const twoPages = () =>
    proj(
      page('p1', sprite('a', 100, 100, script('s1', blk('flag'), blk('wait', 1), blk('goPage', 2)), script('s1b', blk('flag'), blk('forever', undefined, [blk('forward', 1), blk('back', 1)])))),
      page('p2', sprite('c', 200, 200, script('s2', blk('flag'), blk('forward', 2)))),
    )

  it('goPage sayfa değiştirir, eski sayfa iş parçacıklarını keser, yeni sayfanın flag betiğini başlatır', () => {
    const e = new Engine(twoPages())
    e.pressFlag()
    e.tick(1000)
    expect(e.snapshot.pageIndex).toBe(1)
    expect(e.snapshot.sprites.map((s) => s.id)).toEqual(['c'])
    expect(e.events.filter((x) => x.kind === 'page')).toEqual([{ t: 1000, kind: 'page', page: 2 }])
    e.runUntilIdle(5000)
    expect(me(e, 'c').x).toBeCloseTo(200 + 2 * STEP_UNITS, 4)
    expect(e.idle).toBe(true) // eski sayfanın forever'ı kesildi
    e.reset()
    expect(me(e, 'a').x).toBe(100)
  })

  it('olmayan sayfaya goPage etkisizdir', () => {
    const e = new Engine(flagProject(blk('goPage', 5), blk('forward', 1)))
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(e.snapshot.pageIndex).toBe(0)
    expect(me(e).x).toBeCloseTo(100 + STEP_UNITS, 4)
    expect(e.events.filter((x) => x.kind === 'page')).toEqual([])
  })

  it('sayfalar birbirine anında atlıyorsa sonsuz özyineleme olmaz', () => {
    const e = new Engine(
      proj(
        page('p1', sprite('a', 1, 1, script('s1', blk('flag'), blk('goPage', 2)))),
        page('p2', sprite('b', 1, 1, script('s2', blk('flag'), blk('goPage', 1)))),
      ),
    )
    expect(() => e.pressFlag()).not.toThrow()
  })

  it('tapSprite başka sayfadaki sprite\'ı bulamaz', () => {
    const e = new Engine(
      proj(page('p1', sprite('a', 1, 1)), page('p2', sprite('b', 100, 100, script('s', blk('tap'), blk('forward', 1))))),
    )
    e.tapSprite('b')
    expect(e.idle).toBe(true)
  })

  it('reset(pageIndex): etkin sayfayı seçer; pressFlag o sayfanın betiğini çalıştırır', () => {
    const e = new Engine(
      proj(
        page('p1', sprite('a', 100, 100, script('s1', blk('flag'), blk('forward', 1)))),
        page('p2', sprite('c', 100, 100, script('s2', blk('flag'), blk('forward', 2)))),
      ),
    )
    e.reset(1)
    expect(e.snapshot.pageIndex).toBe(1)
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(me(e, 'c').x).toBeCloseTo(100 + 2 * STEP_UNITS, 4)
    e.reset()
    expect(e.snapshot.pageIndex).toBe(0)
    expect(me(e, 'a').x).toBe(100)
    e.reset(1)
    e.reset(9)
    expect(e.snapshot.pageIndex).toBe(0)
    e.reset(-1)
    expect(e.snapshot.pageIndex).toBe(0)
  })
})

describe('Engine genel', () => {
  const prj = () =>
    proj(
      page('p', sprite('a', 50, 50, script('s1', blk('flag'), blk('repeat', 4, [blk('forward', 2), blk('turnRight', 90), blk('say', undefined, undefined, 'x')])), ), sprite('b', 300, 200, script('s2', blk('flag'), blk('forever', undefined, [blk('hop', 1), blk('back', 1)])))),
    )

  it('determinizm: aynı proje iki kez aynı sonucu verir', () => {
    const run = () => {
      const e = new Engine(prj())
      e.pressFlag()
      e.runUntilIdle(7000)
      return { snap: e.snapshot, events: e.events }
    }
    expect(run()).toEqual(run())
  })

  it('tick boyutundan bağımsız olay zamanları', () => {
    const run = (dt: number) => {
      const e = new Engine(prj())
      e.pressFlag()
      for (let i = 0; i < 7000 / dt; i++) e.tick(dt)
      return e.events
    }
    expect(run(10)).toEqual(run(50))
  })

  it('runUntilIdle zaman aşımı: sonsuz betikte maxMs dolunca false döner', () => {
    const e = new Engine(flagProject(blk('forever', undefined, [blk('forward', 1), blk('back', 1)])))
    e.pressFlag()
    expect(e.runUntilIdle(1000)).toBe(false)
    expect(e.snapshot.time).toBe(1000)
    const f = new Engine(flagProject(blk('forward', 1)))
    f.pressFlag()
    expect(f.runUntilIdle(1000)).toBe(true)
    expect(f.snapshot.time).toBe(208) // 16 ms'lik adımların ilk aşımı
  })

  it('reset: sprite durumu, sayfa, zaman ve olaylar başa döner', () => {
    const e = new Engine(flagProject(blk('turnRight', 90), blk('forward', 2), blk('grow'), blk('hide'), blk('say', undefined, undefined, 'a')))
    e.pressFlag()
    e.runUntilIdle(500)
    e.reset()
    expect(e.idle).toBe(true)
    expect(me(e)).toEqual({ id: 'a', character: 'cat', x: 100, y: 100, heading: 0, scale: 1, visible: true, say: null })
    expect(e.snapshot.time).toBe(0)
    expect(e.events).toEqual([])
    expect(e.snapshot.pageIndex).toBe(0)
  })

  it('snapshot bir kopyadır (dışarıdan değiştirmek motoru etkilemez)', () => {
    const e = new Engine(flagProject())
    e.snapshot.sprites[0].x = 999
    expect(me(e).x).toBe(100)
  })

  it('setProject projeyi değiştirir ve resetler', () => {
    const e = new Engine(flagProject(blk('forward', 5)))
    e.pressFlag()
    e.tick(300)
    e.setProject(proj(page('p', sprite('z', 10, 20))))
    expect(e.idle).toBe(true)
    expect(e.snapshot.sprites.map((s) => s.id)).toEqual(['z'])
    expect(e.snapshot.time).toBe(0)
  })

  it('girdi projesini değiştirmez', () => {
    const p = flagProject(blk('forward', 2), blk('repeat', 2, [blk('turnRight', 90)]))
    const copy = JSON.parse(JSON.stringify(p))
    const e = new Engine(p)
    e.pressFlag()
    e.runUntilIdle(5000)
    expect(p).toEqual(copy)
  })

  it('STAGE_H sınırı: aşağı yönde kıstırılır', () => {
    const e = new Engine(flagProject(blk('turnRight', 90), blk('forward', 10), blk('forward', 10), blk('forward', 10)))
    e.pressFlag()
    e.runUntilIdle(10000)
    expect(me(e).y).toBe(STAGE_H)
  })
})

describe('Engine runStack (yığına tıklayınca çalıştır)', () => {
  it('başlatma bloğu varsa atlanır, gerisi çalışır', () => {
    const body = [blk('flag'), blk('forward', 3)]
    const e = new Engine(proj(page('p1', sprite('a', 100, 100, script('s1', blk('flag'), blk('back', 9))))))
    e.runStack('a', body)
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100 + 3 * STEP_UNITS, 5)
  })

  it('başlıksız yığın olduğu gibi çalışır', () => {
    const e = new Engine(proj(page('p1', sprite('a', 100, 100))))
    e.runStack('a', [blk('forward', 2), blk('turnRight', 90), blk('forward', 1)])
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100 + 2 * STEP_UNITS, 5)
    expect(me(e).y).toBeCloseTo(100 + STEP_UNITS, 5)
  })

  it('C bloğu içeren yığın çalışır', () => {
    const e = new Engine(proj(page('p1', sprite('a', 100, 100))))
    e.runStack('a', [blk('tap'), blk('repeat', 3, [blk('forward', 1)])])
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100 + 3 * STEP_UNITS, 5)
  })

  it('aynı sprite\'ın çalışan iş parçacıklarını durdurmaz', () => {
    const e = new Engine(proj(page('p1', sprite('a', 100, 100, script('s1', blk('flag'), blk('wait', 5), blk('say', undefined, undefined, 'bitti'))))))
    e.pressFlag()
    e.tick(100)
    e.runStack('a', [blk('hop', 1)])
    e.runUntilIdle(20000)
    expect(e.events.some((x) => x.kind === 'say' && x.text === 'bitti')).toBe(true)
    expect(e.events.some((x) => x.kind === 'hop')).toBe(true)
  })

  it('aynı yığına tekrar tıklamak yığını baştan başlatır (çift çalışma yok)', () => {
    const stack = [blk('forward', 5)]
    const e = new Engine(proj(page('p1', sprite('a', 100, 100))))
    e.runStack('a', stack)
    e.tick(400)
    e.runStack('a', stack)
    e.runUntilIdle(10000)
    expect(me(e).x).toBeCloseTo(100 + 2 * STEP_UNITS + 5 * STEP_UNITS, 3)
  })

  it('bilinmeyen sprite ya da boş yığın sessizce yok sayılır', () => {
    const e = new Engine(proj(page('p1', sprite('a', 100, 100))))
    e.runStack('zzz', [blk('forward', 2)])
    e.runStack('a', [])
    expect(e.idle).toBe(true)
  })

  it('stop bloğu yalnız o yığını durdurur', () => {
    const e = new Engine(proj(page('p1', sprite('a', 100, 100))))
    e.runStack('a', [blk('forward', 1), blk('stop'), blk('forward', 9)])
    e.runUntilIdle(5000)
    expect(me(e).x).toBeCloseTo(100 + STEP_UNITS, 5)
  })
})

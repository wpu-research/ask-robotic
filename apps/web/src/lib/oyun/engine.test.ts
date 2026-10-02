import { describe, expect, it } from 'vitest'
import { OyunEngine, type OyunWorld, type Sub } from './engine'
import { renderFrame, pixelAt } from './render'
import { SCREEN_H, SCREEN_W } from './types'

const world = (extra: Partial<OyunWorld> = {}): OyunWorld => ({
  images: { kare: { rows: ['cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc'] }, ...extra.images },
  tileset: extra.tileset ?? [], maps: extra.maps ?? [], bg: extra.bg ?? 8,
})
const ticks = (e: OyunEngine, n: number) => { for (let i = 0; i < n; i++) e.tick() }

describe('motor: sprite ve fizik', () => {
  it('hız piksel/sn: 60 kare = 1 sn', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne', 10, 10)
    s.vx = 30; s.vy = -12
    ticks(e, 60)
    expect(s.x).toBeCloseTo(40, 3)
    expect(s.y).toBeCloseTo(-2, 3)
    expect(e.timeMs).toBeCloseTo(1000, 0)
  })

  it('ivme hızı artırır', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne', 0, 0)
    s.ax = 60
    ticks(e, 60)
    expect(s.vx).toBeCloseTo(60, 3)
  })

  it('ömür bitince sprite silinir', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne')
    s.lifeMs = 500
    ticks(e, 29); expect(s.destroyed).toBe(false)
    ticks(e, 3); expect(s.destroyed).toBe(true)
    expect(e.sprites).toHaveLength(0)
  })

  it('dünyadan çıkınca silme yalnızca içeri girdikten sonra işler; dışarıdan gelenler hemen silinmez', () => {
    const e = new OyunEngine(world())
    const dis = e.createSprite('kare', 'nesne', 80, -20)
    dis.autoDestroy = true; dis.vy = 60
    ticks(e, 10); expect(dis.destroyed).toBe(false)
    ticks(e, 60 * 3); expect(dis.destroyed).toBe(true)
    const ic = e.createSprite('kare', 'nesne', 80, 60)
    ic.autoDestroy = true; ic.vx = 200
    ticks(e, 60); expect(ic.destroyed).toBe(true)
  })

  it('ekranda kal: kenarda durur ve değme bilgisi verir', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne', 150, 60)
    s.stay = true; s.vx = 100
    ticks(e, 30)
    expect(s.x).toBeCloseTo(SCREEN_W - 4, 3)
    expect(s.touch.right).toBe(true)
    expect(s.vx).toBe(0)
  })

  it('sekmeli sprite kenardan geri döner', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne', 150, 60)
    s.bounce = true; s.vx = 120
    ticks(e, 20)
    expect(s.vx).toBeLessThan(0)
  })

  it('takip: hedefe yaklaşır ve bırakılınca durmaz (hız kalır)', () => {
    const e = new OyunEngine(world())
    const hedef = e.createSprite('kare', 'nesne', 100, 60)
    const s = e.createSprite('kare', 'dusman', 20, 60)
    s.follow = { target: hedef, speed: 40 }
    ticks(e, 60)
    expect(s.x).toBeCloseTo(60, 0)
    e.destroy(hedef)
    expect(s.follow).toBeNull()
  })

  it('yön: 0 yukarı, 90 sağ, 180 aşağı', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne')
    e.setHeading(s, 90, 10); expect(s.vx).toBeCloseTo(10, 5); expect(s.vy).toBeCloseTo(0, 5)
    e.setHeading(s, 0, 10); expect(s.vx).toBeCloseTo(0, 5); expect(s.vy).toBeCloseTo(-10, 5)
    e.setHeading(s, 180, 10); expect(Math.round(e.heading(s))).toBe(180)
  })

  it('çarpışma kutusu saydam kenarları saymaz', () => {
    const e = new OyunEngine(world({ images: { ince: { rows: ['........', '..cccc..', '..cccc..', '........'] } } }))
    const s = e.createSprite('ince', 'nesne', 50, 50)
    const hb = e.hitbox(s)
    expect(hb.r - hb.l).toBe(4)
    expect(hb.b - hb.t).toBe(2)
  })
})

describe('motor: olaylar', () => {
  const sub = (s: Partial<Sub> & { type: Sub['type'] }, id = 1): Sub => ({ id, ...s })

  it('çakışma olayı üst üste gelince bir kez tetiklenir, ayrılıp yeniden gelince tekrar', () => {
    const e = new OyunEngine(world())
    const hits: number[] = []
    e.setSubs([sub({ type: 'overlap', kind: 'oyuncu', kind2: 'yiyecek' })], (_s, c) => { hits.push(c.other!.id) })
    const a = e.createSprite('kare', 'oyuncu', 50, 50)
    const b = e.createSprite('kare', 'yiyecek', 52, 50)
    ticks(e, 5)
    expect(hits).toHaveLength(1)
    b.x = 120; ticks(e, 2)
    b.x = 52; ticks(e, 2)
    expect(hits).toHaveLength(2)
    expect(a.id).not.toBe(b.id)
    expect(e.stats.overlaps).toBe(2)
  })

  it('her N ms olayı doğru sıklıkta çalışır', () => {
    const e = new OyunEngine(world())
    let n = 0
    e.setSubs([sub({ type: 'every', ms: 500 })], () => { n++ })
    ticks(e, 60 * 3)
    expect(n).toBeGreaterThanOrEqual(5)
    expect(n).toBeLessThanOrEqual(6)
  })

  it('düğme olayı basılınca ve bırakılınca tetiklenir', () => {
    const e = new OyunEngine(world())
    const log: string[] = []
    e.setSubs([sub({ type: 'button', button: 'a', edge: 'press' }, 1), sub({ type: 'button', button: 'a', edge: 'release' }, 2)], (s) => { log.push(`${s.button}:${s.edge}`) })
    e.press('a'); e.press('a'); ticks(e, 2)
    e.release('a'); ticks(e, 1)
    expect(log).toEqual(['a:press', 'a:release'])
  })

  it('başlangıç ve oluşma/silinme olayları', () => {
    const e = new OyunEngine(world())
    const log: string[] = []
    e.setSubs([
      sub({ type: 'start' }, 1), sub({ type: 'created', kind: 'dusman' }, 2), sub({ type: 'destroyed', kind: 'hepsi' }, 3),
    ], (s, c) => { log.push(s.type + (c.sprite ? ':' + c.sprite.kind : '')); if (s.type === 'start') e.createSprite('kare', 'dusman') })
    e.start()
    e.destroy(e.sprites[0])
    expect(log).toEqual(['start', 'created:dusman', 'destroyed:dusman'])
  })

  it('tuş denetimi sprite\'ı yönlendirir', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'oyuncu', 80, 60)
    s.control = { mode: 'four', speed: 60 }
    e.press('right'); e.press('up')
    ticks(e, 30)
    expect(s.x).toBeCloseTo(110, 0)
    expect(s.y).toBeCloseTo(30, 0)
    e.releaseAll(); ticks(e, 1)
    expect(s.vx).toBe(0)
  })

  it('skor, can ve geri sayım: can 0 olunca ve süre bitince oyun biter', () => {
    const e = new OyunEngine(world())
    e.setScore(5); e.setLife(1)
    expect(e.hud.score && e.hud.life).toBe(true)
    e.setLife(0)
    expect(e.state).toBe('over'); expect(e.result).toBe('lose')
    const f = new OyunEngine(world())
    f.startCountdown(2)
    ticks(f, 60 * 2 + 2)
    expect(f.state).toBe('over'); expect(f.overMessage).toBe('SÜRE BİTTİ')
  })

  it('oyun bitince kareler ilerlemez, duraklatınca da', () => {
    const e = new OyunEngine(world())
    const s = e.createSprite('kare', 'nesne'); s.vx = 60
    e.setPaused(true); ticks(e, 30); expect(s.x).toBe(80)
    e.setPaused(false); ticks(e, 30); expect(s.x).toBeCloseTo(110, 0)
    e.gameOver(true); const x = s.x; ticks(e, 30); expect(s.x).toBe(x)
  })

  it('aynı tohum aynı rastgeleliği verir', () => {
    const a = new OyunEngine(world(), { seed: 5 }), b = new OyunEngine(world(), { seed: 5 }), c = new OyunEngine(world(), { seed: 6 })
    const seq = (e: OyunEngine) => Array.from({ length: 5 }, () => e.randomInt(1, 1000))
    expect(seq(a)).toEqual(seq(b))
    expect(seq(a)).not.toEqual(seq(c))
  })
})

describe('motor: karo haritası', () => {
  const mapWorld = () => world({
    images: { duvar: { rows: Array(16).fill('3'.repeat(16)) }, altin: { rows: Array(16).fill('4'.repeat(16)) } },
    tileset: [{ image: 'duvar', wall: true }, { image: 'altin', wall: false }],
    maps: [{ name: 'm', cols: 4, rows: 3, cells: ['....', '....', '1111'] }],
  })

  it('duvar karosu sprite\'ı durdurur ve zemine basma bilgisi verir', () => {
    const e = new OyunEngine(mapWorld())
    expect(e.loadMap('m')).toBe(true)
    // 3. satır tamamen duvar (y >= 32). Sprite 8x8, yerçekimi ile düşer.
    const s = e.createSprite('kare', 'oyuncu', 20, 10)
    s.ay = 400
    ticks(e, 120)
    expect(s.y).toBeCloseTo(32 - 4, 1)
    expect(s.touch.down).toBe(true)
    expect(s.vy).toBe(0)
  })

  it('yatayda duvara çarpar; hayalet duvardan geçer', () => {
    const e = new OyunEngine(mapWorld())
    e.loadMap('m')
    e.setTile(3, 1, 'duvar') // sağda bir duvar
    const s = e.createSprite('kare', 'oyuncu', 20, 20)
    s.vx = 100
    ticks(e, 60)
    expect(s.x).toBeCloseTo(48 - 4, 1)
    expect(s.touch.right).toBe(true)
    const g = e.createSprite('kare', 'oyuncu', 20, 20)
    g.ghost = true; g.vx = 100
    ticks(e, 30)
    expect(g.x).toBeGreaterThan(48)
  })

  it('karoya dokununca olayı bir kez gelir ve olay karosunun yerini bildirir', () => {
    const e = new OyunEngine(mapWorld())
    e.loadMap('m')
    e.setTile(2, 0, 'altin')
    const got: [number | undefined, number | undefined][] = []
    e.setSubs([{ id: 1, type: 'tile', kind: 'oyuncu', image: 'altin' }], (_s, c) => { got.push([c.col, c.row]) })
    const s = e.createSprite('kare', 'oyuncu', 8, 8)
    s.vx = 40
    ticks(e, 60)
    expect(got).toEqual([[2, 0]])
    expect(e.stats.tileTouches).toBe(1)
  })

  it('karoları sprite\'a çevirir, say ve kamera haritayla sınırlıdır', () => {
    const e = new OyunEngine(world({ ...mapWorld(), maps: [{ name: 'b', cols: 20, rows: 3, cells: ['.'.repeat(20), '.2.'.padEnd(20, '.').replace('2', '2'), '.'.repeat(20)] }] }))
    e.loadMap('b')
    expect(e.countTiles('altin')).toBe(1)
    const list = e.tilesToSprites('altin', 'yiyecek')
    expect(list).toHaveLength(1)
    expect(e.countTiles('altin')).toBe(0)
    expect(list[0].x).toBe(1 * 16 + 8)
    const p = e.createSprite('kare', 'oyuncu', 300, 20)
    e.cameraTarget = p
    ticks(e, 1)
    expect(e.camera.x).toBe(20 * 16 - SCREEN_W)
  })
})

describe('çizim', () => {
  it('arka plan rengini ve sprite pikselini doğru yere çizer', () => {
    const e = new OyunEngine(world({ bg: 9 }))
    e.createSprite('kare', 'nesne', 40, 30)
    const f = renderFrame(e)
    expect(f.length).toBe(SCREEN_W * SCREEN_H * 4)
    expect(pixelAt(f, 1, 1)).toBe(9)
    expect(pixelAt(f, 40, 30)).toBe(12)
    expect(pixelAt(f, 44, 34)).toBe(9)
    expect(pixelAt(f, 36, 26)).toBe(12)
    expect(pixelAt(f, 35, 26)).toBe(9)
  })

  it('oyun bitti ekranı çizilir; skor göstergesi çizilir', () => {
    const e = new OyunEngine(world({ bg: 8 }))
    e.setScore(7)
    const f1 = renderFrame(e)
    let white = 0
    for (let y = 0; y < 10; y++) for (let x = 0; x < 40; x++) if (pixelAt(f1, x, y) === 12) white++
    expect(white).toBeGreaterThan(5)
    e.gameOver(false)
    const f2 = renderFrame(e)
    let red = 0
    for (let y = 0; y < SCREEN_H; y++) for (let x = 0; x < SCREEN_W; x++) if (pixelAt(f2, x, y) === 2) red++
    expect(red).toBeGreaterThan(20)
  })
})

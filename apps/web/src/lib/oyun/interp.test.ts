import { describe, expect, it } from 'vitest'
import { abs, add, arith, b, brk, callProc, change, cmp, cont, defProc, div, forRange, ifThen, join, mod, mul, not, or, program, repeat, rnd, set, str, sub, v, whileDo } from './dsl'
import { OyunSession } from './session'
import { emptyProject } from './project'
import type { BlockNode, OyunProject } from './types'

const proj = (tops: BlockNode[], extra: Partial<OyunProject> = {}): OyunProject => ({ ...emptyProject(), blocks: program(tops), ...extra })
const run = (tops: BlockNode[], frames = 2, seed = 1) => new OyunSession(proj(tops), { seed }).start().tick(frames)
const start = (...body: BlockNode[]) => b('oyun_baslangic', {}, body)
/** Değişkenin değerini sonuç olarak döndürür. */
const val = (s: OyunSession, name: string) => s.runner.vars.get(name)

describe('yorumlayıcı: ifadeler', () => {
  it('aritmetik, bölme sıfıra ve işlem sırası', () => {
    const s = run([start(
      set('a', add(2, mul(3, 4))), set('b', div(1, 0)), set('c', arith('POWER', 2, 10)), set('d', mod(17, 5)), set('e', sub(0, abs(-3))),
    )])
    expect([val(s, 'a'), val(s, 'b'), val(s, 'c'), val(s, 'd'), val(s, 'e')]).toEqual([14, 0, 1024, 2, -3])
    expect(s.error).toBeNull()
  })

  it('karşılaştırma, mantık ve metin birleştirme', () => {
    const s = run([start(
      set('a', cmp('LT', 2, 3)), set('b', or(false, not(false))), set('c', cmp('EQ', str('x'), str('x'))), set('d', join('Skor: ', 5, '!')), set('e', cmp('NEQ', 1, 1)),
    )])
    expect([val(s, 'a'), val(s, 'b'), val(s, 'c'), val(s, 'd'), val(s, 'e')]).toEqual([true, true, true, 'Skor: 5!', false])
  })

  it('rastgele sayı tohuma bağlıdır ve aralıktadır', () => {
    const t = [start(set('r', rnd(5, 9)))]
    const a = run(t, 1, 11), b2 = run(t, 1, 11)
    expect(val(a, 'r')).toBe(val(b2, 'r'))
    for (let seed = 1; seed < 30; seed++) { const r = val(run(t, 1, seed), 'r') as number; expect(r).toBeGreaterThanOrEqual(5); expect(r).toBeLessThanOrEqual(9) }
  })
})

describe('yorumlayıcı: denetim akışı', () => {
  it('eğer / değilse / değilse eğer', () => {
    const mk = (x: number) => val(run([start(set('x', x), ifThen(cmp('LT', v('x'), 0), set('r', 'eksi'), set('r', 'artı'), [[cmp('EQ', v('x'), 0), set('r', 'sıfır')]]))]), 'r')
    expect([mk(-1), mk(0), mk(5)]).toEqual(['eksi', 'sıfır', 'artı'])
  })

  it('tekrarla, sayarak döngü, kır ve devam', () => {
    const s = run([start(
      set('t', 0), repeat(5, change('t', 2)),
      set('u', 0), forRange('i', 1, 10, 1, [ifThen(cmp('EQ', mod(v('i'), 2), 0), cont()), ifThen(cmp('GT', v('i'), 7), brk()), change('u', v('i'))]),
      set('w', 0), forRange('j', 5, 1, 2, change('w', 1)),
    )])
    expect([val(s, 't'), val(s, 'u'), val(s, 'w')]).toEqual([10, 1 + 3 + 5 + 7, 3])
  })

  it('iken ve kadar döngüleri', () => {
    const s = run([start(set('n', 0), whileDo(cmp('LT', v('n'), 4), change('n', 1)), set('m', 10), whileDo(cmp('LTE', v('m'), 3), change('m', -3), true))])
    expect([val(s, 'n'), val(s, 'm')]).toEqual([4, 1])
  })

  it('fonksiyonlar: parametre, değer döndürme, özyineleme', () => {
    const s = run([
      defProc('ikiKat', ['x'], undefined, mul(v('x'), 2)),
      defProc('topla', ['a', 'b'], set('sonuc', add(v('a'), v('b')))),
      defProc('faktoriyel', ['n'], undefined, b('logic_ternary', { IF: cmp('LTE', v('n'), 1), THEN: 1, ELSE: mul(v('n'), callProc('faktoriyel', [sub(v('n'), 1)], true)) })),
      start(set('a', callProc('ikiKat', [21], true)), callProc('topla', [3, 4]), set('f', callProc('faktoriyel', [5], true))),
    ])
    expect(s.error).toBeNull()
    expect([val(s, 'a'), val(s, 'sonuc'), val(s, 'f')]).toEqual([42, 7, 120])
  })
})

describe('yorumlayıcı: güvenlik sınırları', () => {
  it('sonsuz döngü açıklamalı bir hata verir ve oyunu dondurmaz', () => {
    const s = run([start(whileDo(true, change('x', 1)))], 1)
    expect(s.error?.message).toMatch(/uzun sürdü|yavaş/)
    expect(s.error?.blockId).toBeTruthy()
  })

  it('iç içe büyük döngüler kare başına toplam adım sınırına takılır', () => {
    const s = new OyunSession(proj([b('oyun_her_kare', {}, [repeat(1000, repeat(1000, change('x', 1)))])]), { limits: { callSteps: 10_000_000, frameSteps: 50_000 } })
    s.start().tick(2)
    expect(s.error).not.toBeNull()
  })

  it('kendini sonsuza çağıran fonksiyon çökertmez', () => {
    const s = run([defProc('f', [], callProc('f', [])), start(callProc('f', []))])
    expect(s.error?.message).toMatch(/derin/)
  })

  it('olay içinde olay zinciri sonsuza gitmez', () => {
    const s = run([
      b('sprite_olusunca', { K: 'hepsi' }, [set('y', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'nesne' }))]),
      start(set('x', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'nesne' }))),
    ])
    expect(s.error).not.toBeNull()
    expect(s.engine.sprites.length).toBeLessThan(40)
  })

  it('bulunamayan resim, boş değişken ve bilinmeyen harita anlaşılır hata verir', () => {
    expect(run([start(set('x', b('sprite_yeni', { IMG: 'yok-boyle-resim', K: 'nesne' })))]).error?.message).toMatch(/resim bulunamadı/)
    expect(run([start(b('sprite_konum', { S: 'bos', X: 1, Y: 1 }))]).error?.message).toMatch(/sprite/)
    expect(run([start(b('harita_yukle', { M: 'yok' }))]).error?.message).toMatch(/harita/)
    expect(run([start(b('harita_karo_koy', { C: 0, R: 0, IMG: 'karo-cimen' }))]).error?.message).toMatch(/haritayı yükle/)
  })

  it('bilinmeyen blok türü hata verir (bozuk içe aktarma)', () => {
    expect(run([start({ type: 'sahte_blok' })]).error?.message).toMatch(/Bilinmeyen blok/)
  })

  it('devre dışı bırakılan bloklar çalışmaz', () => {
    const off = { ...set('x', 5), enabled: false }
    const s = run([start(off, set('y', 1))])
    expect(val(s, 'x')).toBeUndefined()
    expect(val(s, 'y')).toBe(1)
  })

  it('olaya bağlı olmayan bloklar çalışmaz', () => {
    const s = run([set('x', 1)])
    expect(val(s, 'x')).toBeUndefined()
    expect(s.error).toBeNull()
  })
})

describe('yorumlayıcı: oyun blokları', () => {
  it('sprite oluştur, konum/hız/özellik, her biri döngüsü ve silme', () => {
    const s = run([
      start(
        set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })),
        b('sprite_konum', { S: 'a', X: 30, Y: 40 }),
        b('hareket_hiz', { S: 'a', VX: 60, VY: 0 }),
        b('sprite_ozellik_ayarla', { S: 'a', NAME: 'puan', V: 9 }),
        repeat(3, set('e', b('sprite_yeni', { IMG: 'dusman-hayalet', K: 'dusman' }))),
        b('sprite_her_biri', { K: 'dusman' }, b('sprite_konum', { S: b('oyun_bu_sprite'), X: 100, Y: 10 })),
        set('n', b('sprite_sayisi', { K: 'dusman' })),
        set('p', b('sprite_ozellik', { S: 'a', NAME: 'puan' })),
      ),
    ], 60)
    expect(s.error).toBeNull()
    const a = s.first('oyuncu')
    expect(a.x).toBeCloseTo(90, 0)
    expect(val(s, 'n')).toBe(3)
    expect(val(s, 'p')).toBe(9)
    expect(s.sprites('dusman').every((d) => d.x === 100 && d.y === 10)).toBe(true)
  })

  it('"bu sprite" olay içinde olayın sprite\'ıdır; boş sprite girişi "bu sprite" gibi çalışır', () => {
    const s = run([
      start(set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })), b('sprite_konum', { S: b('oyun_bu_sprite'), X: 11, Y: 22 })),
    ])
    expect(s.error).toBeNull()
    expect([s.first('oyuncu').x, s.first('oyuncu').y]).toEqual([11, 22])
  })

  it('çarpışma olayında bu/diğer sprite ve skor/can/oyun bitti', () => {
    const s = run([
      start(
        set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })), set('f', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })),
        b('oyun_skor_ayarla', { N: 0 }), b('oyun_can_ayarla', { N: 2 }),
      ),
      b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
        b('oyun_skor_degistir', { N: 5 }), b('oyun_can_degistir', { N: -2 }), b('sprite_sil', { S: b('oyun_diger_sprite') }),
      ]),
    ], 5)
    expect(s.engine.score).toBe(5)
    expect(s.engine.life).toBe(0)
    expect(s.engine.state).toBe('over')
    expect(s.sprites('yiyecek')).toHaveLength(0)
  })

  it('"diğer sprite" çarpışma dışında hata verir', () => {
    expect(run([start(set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })), b('sprite_sil', { S: b('oyun_diger_sprite') }))]).error?.message).toMatch(/çarpışma/)
  })

  it('düğme, yön ve basılı mı blokları denetleyiciyi okur', () => {
    const s = new OyunSession(proj([
      b('oyun_her_kare', {}, [set('x', b('den_yon', { A: 'x' })), set('bas', b('den_basili', { B: 'a' }))]),
      b('den_dugme', { B: 'b', E: 'press' }, change('b', 1)),
    ]))
    s.start().tick(1)
    s.press('left').press('a').press('b').tick(2)
    expect([val(s, 'x'), val(s, 'bas'), val(s, 'b')]).toEqual([-1, true, 1])
  })

  it('tuş ile hareket ve kamera takibi', () => {
    const s = new OyunSession(proj([start(
      set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })), b('sprite_konum', { S: 'a', X: 20, Y: 60 }), b('den_hareket', { S: 'a', M: 'h', N: 50 }),
    )]))
    s.start().press('right').tick(60)
    expect(s.first('oyuncu').x).toBeCloseTo(70, 0)
    expect(s.first('oyuncu').y).toBe(60)
  })

  it('ses blokları ses olayı üretir', () => {
    const got: string[] = []
    const s = new OyunSession(proj([start(b('ses_bip', { F: 440, MS: 100 }), b('ses_nota', { NOTE: 'C5', MS: 200 }), b('ses_melodi', { M: 'zafer' }))]), { onSound: (e) => got.push(e.kind) })
    s.start()
    expect(got).toEqual(['beep', 'note', 'melody'])
  })

  it('efekt blokları: ekran sarsıntısı, patlama, mesaj, konuşma', () => {
    const s = run([start(
      b('oyun_sarsinti', { N: 500 }), b('oyun_patlama', { X: 50, Y: 50, C: 2 }), b('oyun_mesaj', { T: 'Selam', N: 1 }),
      set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })), b('sprite_konus', { S: 'a', T: 'Merhaba', N: 2 }),
    )], 2)
    expect(s.error).toBeNull()
    expect(s.engine.shakeMs).toBeGreaterThan(0)
    expect(s.engine.particles.length).toBeGreaterThan(5)
    expect(s.engine.toast?.text).toBe('Selam')
    expect(s.first('oyuncu').speech?.text).toBe('Merhaba')
  })
})

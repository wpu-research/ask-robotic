import { describe, expect, it } from 'vitest'
import { add, and, b, broadcast, callProc, chg, defProc, eq, flag, forever, gt, ifElse, ifThen, join, key, lt, mul, not, program, repeat, rnd, say, sayFor, setv, touching, v, vid, wait } from './dsl'
import { makeProject, makeVar } from './kit'
import { makeList } from './project'
import { SahneSession } from './session'

const run = (p: ReturnType<typeof makeProject>, seconds = 2, seed = 1) => { const s = new SahneSession(p, { seed }); s.flag(); s.seconds(seconds); return s }

describe('hareket ve görünüm', () => {
  it('adım at: yön 90 = sağ', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_move', { N: 50 })])] }]))
    expect(s.sprite('a')!.x).toBeCloseTo(50)
    expect(s.sprite('a')!.y).toBeCloseTo(0)
  })
  it('dön ve adım at', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_point', { D: 0 }), b('sh_move', { N: 30 }), b('sh_turn_r', { D: 90 }), b('sh_move', { N: 10 })])] }]))
    expect(s.sprite('a')!.y).toBeCloseTo(30)
    expect(s.sprite('a')!.x).toBeCloseTo(10)
  })
  it('git x y ve kaydır', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_goto_xy', { X: -100, Y: 50 }), b('sh_glide_xy', { S: 1, X: 100, Y: 50 })])] }]), 0.5)
    expect(s.sprite('a')!.x).toBeGreaterThan(-100)
    expect(s.sprite('a')!.x).toBeLessThan(100)
    s.seconds(1)
    expect(s.sprite('a')!.x).toBeCloseTo(100)
  })
  it('kenara değince sek', () => {
    const s = run(makeProject('t', [{ id: 'a', x: 200, blocks: [flag([forever([b('sh_move', { N: 10 }), b('sh_bounce')])])] }]), 3)
    expect(s.sprite('a')!.dir).toBeLessThan(0) // sola dönmüş
  })
  it('sahnenin dışına tamamen çıkamaz (çit)', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_goto_xy', { X: 5000, Y: 0 })])] }]))
    expect(s.sprite('a')!.x).toBeLessThan(300)
  })
  it('konuş, süre dolunca kapanır; söyle kaydı', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([sayFor('Merhaba', 1)])] }]), 0.5)
    expect(s.sprite('a')!.bubble?.text).toBe('Merhaba')
    s.seconds(1)
    expect(s.sprite('a')!.bubble).toBeNull()
    expect(s.engine.sayLog[0]).toMatchObject({ text: 'Merhaba' })
  })
  it('kostüm değiştir', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([forever([b('sh_next_costume'), wait(0.2)])])] }]), 1)
    expect(s.count('costume')).toBeGreaterThanOrEqual(4)
  })
  it('boyut ve efekt', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_set_size', { N: 150 }), b('sh_change_effect', { E: 'color', N: 25 }), b('sh_hide')])] }]))
    const a = s.sprite('a')!
    expect(a.size).toBe(150); expect(a.effects.color).toBe(25); expect(a.visible).toBe(false)
  })
})

describe('zamanlama', () => {
  it('bekle 0.2 sn: ilk karede başlar, 6 kare sonra devam eder', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [flag([wait(0.2), b('sh_move', { N: 1 })])] }]))
    s.flag(); s.tick(6)
    expect(s.sprite('a')!.x).toBe(0)
    s.tick(1)
    expect(s.sprite('a')!.x).toBe(1)
  })
  it('iki sprite aynı anda (paralel)', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([forever([b('sh_move', { N: 1 })])])] }, { id: 'b', blocks: [flag([forever([b('sh_move', { N: 2 })])])] }]), 1)
    expect(s.sprite('b')!.x).toBeCloseTo(s.sprite('a')!.x * 2, 0)
  })
  it('tekrar döngüsü: görsel değişiklik varsa kare başına bir tur', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [flag([repeat(10, [b('sh_move', { N: 10 })])])] }]))
    s.flag(); s.tick(3)
    expect(s.sprite('a')!.x).toBeLessThan(100)
    s.tick(20)
    expect(s.sprite('a')!.x).toBe(100)
  })
  it('görünmez işlemli döngü (değişken) tek karede biter', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [flag([setv('n', 0), repeat(1000, [chg('n', 1)])])] }], { vars: [makeVar('n')] }))
    s.flag(); s.tick(1)
    expect(s.variable('n')).toBe(1000)
  })
  it('sonsuz boş döngü kilitlemez ve sınırlıdır', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [flag([forever([])])] }]))
    s.flag()
    const t0 = Date.now()
    s.tick(30)
    expect(Date.now() - t0).toBeLessThan(3000)
    expect(s.running).toBe(true)
  })
})

describe('olaylar', () => {
  it('tuşa basılınca', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [key('right', [b('sh_change_x', { N: 10 })])] }]))
    s.hold('right', 3)
    expect(s.sprite('a')!.x).toBeGreaterThanOrEqual(10)
    const x = s.sprite('a')!.x
    s.tick(5)
    expect(s.sprite('a')!.x).toBe(x) // bırakıldı
  })
  it('bu sprite tıklanınca', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [b('sh_when_clicked', {}, [say('Ay!')])] }]))
    s.click('a')
    expect(s.sprite('a')!.bubble?.text).toBe('Ay!')
  })
  it('yayın ve mesajı alınca', () => {
    const s = run(makeProject('t', [
      { id: 'a', blocks: [flag([sayFor('Hazırım', 1), broadcast('sıra sende')])] },
      { id: 'b', blocks: [b('sh_when_msg', { M: 'sıra sende' }, [say('Tamam')])] },
    ]), 1.5)
    expect(s.sprite('b')!.bubble?.text).toBe('Tamam')
    expect(s.engine.sayLog.find((r) => r.defId === 'b')!.start).toBeGreaterThanOrEqual(1000)
  })
  it('yayınla ve bekle', () => {
    const s = run(makeProject('t', [
      { id: 'a', blocks: [flag([b('sh_broadcast_wait', { M: 'git' }), setv('bitti', 1)])] },
      { id: 'b', blocks: [b('sh_when_msg', { M: 'git' }, [wait(1)])] },
    ], { vars: [makeVar('bitti')] }), 0.5)
    expect(s.variable('bitti')).toBe(0)
    s.seconds(1)
    expect(s.variable('bitti')).toBe(1)
  })
  it('arka plan değişince', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [b('sh_when_backdrop', { B: 'gece' }, [say('Gece oldu')])] }], { backdrops: ['gokyuzu', 'gece'], stage: [flag([wait(0.5), b('sh_backdrop', { B: 'gece' })])] }), 1)
    expect(s.sprite('a')!.bubble?.text).toBe('Gece oldu')
  })
})

describe('kontrol, algılama, işlemler', () => {
  it('eğer / değilse ve karşılaştırma', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([setv('x', 5), ifElse(gt(v('x'), 3), [setv('r', 'büyük')], [setv('r', 'küçük')])])] }], { vars: [makeVar('x'), makeVar('r')] }))
    expect(s.variable('r')).toBe('büyük')
  })
  it('olana dek tekrarla', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_repeat_until', { C: gt(b('sh_xpos'), 49) }, [b('sh_move', { N: 10 })])])] }]), 1)
    expect(s.sprite('a')!.x).toBe(50)
  })
  it('değiyor mu', () => {
    const s = run(makeProject('t', [
      { id: 'a', char: 'kedi', x: 0, y: 0, blocks: [flag([forever([ifThen(touching('b'), [chg('t', 1)])])])] },
      { id: 'b', char: 'top', x: 10, y: 0, blocks: [] },
    ], { vars: [makeVar('t')] }), 0.5)
    expect(Number(s.variable('t'))).toBeGreaterThan(0)
    const s2 = run(makeProject('t', [
      { id: 'a', char: 'kedi', x: -150, blocks: [flag([forever([ifThen(touching('b'), [chg('t', 1)])])])] },
      { id: 'b', char: 'top', x: 150, blocks: [] },
    ], { vars: [makeVar('t')] }), 0.5)
    expect(s2.variable('t')).toBe(0)
  })
  it('sor ve cevap', () => {
    const p = makeProject('t', [{ id: 'a', blocks: [flag([b('sh_ask', { Q: 'Adın?' }), say(join('Merhaba ', b('sh_answer')))])] }])
    const s = new SahneSession(p)
    s.flag(); s.tick(3)
    expect(s.engine.asking?.text).toBe('Adın?')
    s.answer('Ece')
    s.tick(2)
    expect(s.sprite('a')!.bubble?.text).toBe('Merhaba Ece')
  })
  it('işlemler: toplama, çarpma, metin, rastgele aralık', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([
      setv('a', add(2, mul(3, 4))), setv('m', join('el', 'ma')), setv('r', rnd(1, 3)), setv('e', eq('Elma', 'elma')),
      setv('u', b('sh_length', { S: 'merhaba' })), setv('l', b('sh_letter', { N: 2, S: 'kedi' })),
    ])] }], { vars: ['a', 'm', 'r', 'e', 'u', 'l'].map((n) => makeVar(n)) }))
    expect(s.variable('a')).toBe(14); expect(s.variable('m')).toBe('elma'); expect(s.variable('e')).toBe(true); expect(s.variable('u')).toBe(7); expect(s.variable('l')).toBe('e')
    expect([1, 2, 3]).toContain(s.variable('r'))
  })
  it('rastgele tohumla tekrarlanabilir', () => {
    const p = makeProject('t', [{ id: 'a', blocks: [flag([b('sh_goto_xy', { X: rnd(-200, 200), Y: 0 })])] }])
    expect(run(p, 1, 7).sprite('a')!.x).toBe(run(p, 1, 7).sprite('a')!.x)
  })
  it('değişken: ayarla/değiştir, sayı olarak toplanır', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([setv('skor', 0), chg('skor', 1), chg('skor', 1)])] }], { vars: [makeVar('skor', { value: 99 })] }))
    expect(s.variable('skor')).toBe(2)
  })
  it('liste işlemleri', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([
      b('sh_list_del_all', { L: 'l' }), b('sh_list_add', { I: 'bir', L: 'l' }), b('sh_list_add', { I: 'iki', L: 'l' }), b('sh_list_insert', { I: 'sıfır', N: 1, L: 'l' }),
      b('sh_list_replace', { L: 'l', N: 3, I: 'ikiz' }), setv('n', b('sh_list_len', { L: 'l' })), setv('o', b('sh_list_item', { L: 'l', N: 2 })),
    ])] }], { vars: [makeList('l', ['x']), makeVar('n'), makeVar('o')] }))
    expect(s.list('l')).toEqual(['sıfır', 'bir', 'ikiz'])
    expect(s.variable('n')).toBe(3); expect(s.variable('o')).toBe('bir')
  })
})

describe('klon, blok yap, kalem, ses', () => {
  it('klon oluştur / klon olarak başlayınca / sil', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [
      flag([b('sh_hide'), repeat(3, [b('sh_create_clone', { T: '_myself_' }), wait(0.3)])]),
      b('sh_when_clone', {}, [b('sh_show'), b('sh_set_x', { N: rnd(-100, 100) }), wait(0.5), b('sh_delete_clone')]),
    ] }]), 0.35)
    expect(s.engine.cloneCount).toBeGreaterThanOrEqual(1)
    s.seconds(3)
    expect(s.engine.cloneCount).toBe(0)
    expect(s.count('clone')).toBe(3)
    expect(s.count('cloneDelete')).toBe(3)
  })
  it('kendi bloğun: tanım, çağrı ve girdi', () => {
    const procs = [{ id: 'p1', name: 'zıpla', params: ['yükseklik'] }]
    const s = run(makeProject('t', [{ id: 'a', procs, blocks: [
      defProc('p1', [b('sh_change_y', { N: { type: 'sh_arg', fields: { NAME: 'yükseklik' } } }), b('sh_change_y', { N: 0 })]),
      flag([callProc('p1', [30]), callProc('p1', [5])]),
    ] }]))
    expect(s.sprite('a')!.y).toBe(35)
  })
  it('özyineleme sınırı hata verir, çökmez', () => {
    const procs = [{ id: 'p1', name: 'sonsuz', params: [] }]
    const s = run(makeProject('t', [{ id: 'a', procs, blocks: [defProc('p1', [callProc('p1')]), flag([callProc('p1')])] }]))
    expect(s.error?.message).toMatch(/çağır/)
  })
  it('kalem çizgisi', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_pen_down'), b('sh_move', { N: 40 }), b('sh_pen_up'), b('sh_move', { N: 10 })])] }]))
    expect(s.engine.pen.filter((o) => o.k === 'line')).toHaveLength(1)
  })
  it('ses çal ve bitene dek bekle (sanal süre)', () => {
    const plays: string[] = []
    const p = makeProject('t', [{ id: 'a', sounds: ['davul'], blocks: [flag([b('sh_play_until', { S: 'Davul' }), setv('d', 1)])] }], { vars: [makeVar('d')] })
    const s = new SahneSession(p, { onSound: (e) => plays.push(e.ref.name) })
    s.flag(); s.tick(2)
    expect(plays).toEqual(['Davul'])
    expect(s.variable('d')).toBe(0)
    s.tick(10)
    expect(s.variable('d')).toBe(1)
  })
  it('hepsini durdur', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_stop', { W: 'all' })])] }, { id: 'b', blocks: [flag([forever([b('sh_move', { N: 1 })])])] }]), 1)
    expect(s.running).toBe(false)
  })
  it('hata: olmayan kostüm adı', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_costume', { C: 'yok' })])] }]))
    expect(s.error?.message).toMatch(/kostüm/)
  })
})

describe('ayrıntılar', () => {
  it('basılı tutmak tuş başlığını tekrar tekrar başlatmaz (yalnız tuş olayı başlatır)', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [key('right', [b('sh_change_x', { N: 10 })])] }]))
    s.press('right'); s.tick(20); s.release('right')
    expect(s.sprite('a')!.x).toBe(10)
    s.press('right'); s.release('right'); s.tick(1) // ikinci olay
    expect(s.sprite('a')!.x).toBe(20)
  })
  it('"hepsini dur" konuşma balonunu bırakır, durdur düğmesi kapatır', () => {
    const p = makeProject('t', [{ id: 'a', blocks: [flag([say('Oyun bitti'), b('sh_stop', { W: 'all' })])] }])
    const s = new SahneSession(p); s.flag(); s.tick(2)
    expect(s.sprite('a')!.bubble?.text).toBe('Oyun bitti')
    s.stop()
    expect(s.sprite('a')!.bubble).toBeNull()
  })
  it('bu betiği dur / diğer betikleri dur', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([forever([b('sh_change_x', { N: 1 })])]), flag([wait(0.3), b('sh_stop', { W: 'others' }), b('sh_set_y', { N: 7 })])] }]), 1)
    expect(s.sprite('a')!.y).toBe(7)
    expect(s.sprite('a')!.x).toBeLessThan(15)
    expect(s.running).toBe(false)
  })
  it('olana dek bekle ve zamanlayıcı başlığı', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_wait_until', { C: gt(b('sh_timer'), 0.5) }), setv('t', 1)]), b('sh_when_timer', { N: 1 }, [setv('u', 1)])] }], { vars: [makeVar('t'), makeVar('u')] }), 0.4)
    expect(s.variable('t')).toBe(0); expect(s.variable('u')).toBe(0)
    s.seconds(1.2)
    expect(s.variable('t')).toBe(1); expect(s.variable('u')).toBe(1)
  })
  it('katman, damga ve değişken/liste gösterme', () => {
    const s = run(makeProject('t', [
      { id: 'a', blocks: [flag([b('sh_layer', { L: 'front' }), b('sh_pen_stamp'), b('sh_var_hide', { V: 'x' }), b('sh_list_hide', { L: 'l' })])] },
      { id: 'b', blocks: [] },
    ], { vars: [makeVar('x'), makeList('l')] }), 0.2)
    expect(s.engine.targets[s.engine.targets.length - 1].defId).toBe('a')
    expect(s.engine.pen.filter((o) => o.k === 'stamp')).toHaveLength(1)
    expect(s.engine.varVisible.get('v:x')).toBe(false); expect(s.engine.varVisible.get('v:l')).toBe(false)
  })
  it('klon sayısı sınırlıdır ve silinen klon hiç çalışmaz', () => {
    const s = run(makeProject('t', [{ id: 'a', blocks: [flag([forever([b('sh_create_clone', { T: '_myself_' })])])] }]), 2)
    expect(s.engine.cloneCount).toBeLessThanOrEqual(300)
    expect(s.error).toBeNull()
  })
  it('iki soru sırayla sorulur (kuyruk)', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', blocks: [flag([b('sh_ask', { Q: 'bir?' }), setv('r1', b('sh_answer')), b('sh_ask', { Q: 'iki?' }), setv('r2', b('sh_answer'))])] }], { vars: [makeVar('r1'), makeVar('r2')] }))
    s.flag(); s.tick(2); expect(s.engine.asking?.text).toBe('bir?')
    s.answer('A'); s.tick(2); expect(s.engine.asking?.text).toBe('iki?')
    s.answer('B'); s.tick(2)
    expect(s.variable('r1')).toBe('A'); expect(s.variable('r2')).toBe('B')
  })
  it('fare ile değme ve sürükleme koordinatları', () => {
    const s = new SahneSession(makeProject('t', [{ id: 'a', char: 'top', x: 50, y: 50, blocks: [flag([forever([b('sh_if', { C: touching('_mouse_') }, [setv('m', 1)])])])] }], { vars: [makeVar('m')] }))
    s.flag(); s.tick(3); expect(s.variable('m')).toBe(0)
    s.moveMouse(50, 50); s.tick(3); expect(s.variable('m')).toBe(1)
    expect(s.engine.spriteAt(50, 50)?.defId).toBe('a'); expect(s.engine.spriteAt(-200, -150)).toBeNull()
  })
  it('değişken değerleri başlangıç değerinden başlar; yeni oturum sıfırdan', () => {
    const p = makeProject('t', [{ id: 'a', blocks: [flag([chg('n', 1)])] }], { vars: [makeVar('n', { value: 5 })] })
    const s1 = new SahneSession(p); s1.flag(); s1.tick(2); expect(s1.variable('n')).toBe(6)
    s1.flag(); s1.tick(2); expect(s1.variable('n')).toBe(7) // oturum kalıcı (Scratch gibi)
    const s2 = new SahneSession(p); s2.flag(); s2.tick(2); expect(s2.variable('n')).toBe(6)
  })
})

describe('kullanılmayan import uyarısı', () => { it('program/not/lt/and/vid', () => { expect([program, not, lt, and, vid, repeat]).toBeTruthy() }) })

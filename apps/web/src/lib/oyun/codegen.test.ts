import { describe, expect, it } from 'vitest'
import { toJavaScript, ident } from './codegen'
import { add, b, callProc, change, cmp, defProc, forRange, ifThen, mul, program, repeat, rnd, set, v, whileDo, join, and } from './dsl'
import { emptyProgram } from './dsl'
import { bu, diger, oku } from './samples/kit'

describe('JavaScript sekmesi', () => {
  it('boş program için yönlendirici bir açıklama verir', () => {
    expect(toJavaScript(emptyProgram())).toContain('Henüz blok yok')
  })

  it('olaylar, değişkenler, koşullar ve döngüler okunabilir kod olur', () => {
    const code = toJavaScript(program([
      b('oyun_baslangic', {}, [
        set('hiz', 40),
        set('oyuncu', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })),
        b('sprite_konum', { S: 'oyuncu', X: 80, Y: add(10, mul(2, 3)) }),
        repeat(3, change('hiz', 5)),
        ifThen(cmp('GT', v('hiz'), 50), b('oyun_skor_degistir', { N: 1 }), b('oyun_skor_ayarla', { N: 0 })),
      ]),
      b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('sprite_sil', { S: diger() }), b('oyun_skor_degistir', { N: oku(bu(), 'x') })]),
    ]))
    expect(code).toContain('let hiz, oyuncu')
    expect(code).toContain('oyun.baslayinca(() => {')
    expect(code).toContain('oyuncu = sprite.yeni("oyuncu-kedi", "oyuncu")')
    expect(code).toContain('oyuncu.konum(80, 10 + (2 * 3))')
    expect(code).toContain('for (let i = 0; i < 3; i++) {')
    expect(code).toContain('if (hiz > 50) {')
    expect(code).toContain('} else {')
    expect(code).toContain('sprite.carpisinca("oyuncu", "yiyecek", (bu, diger) => {')
    expect(code).toContain('diger.sil()')
    expect(code).toContain('oyun.skor += bu.x')
  })

  it('iç içe döngüler farklı sayaç adı kullanır; fonksiyonlar ve değer döndürme', () => {
    const code = toJavaScript(program([
      defProc('kare', ['x'], undefined, mul(v('x'), v('x'))),
      b('oyun_her_kare', {}, [repeat(2, repeat(2, set('s', callProc('kare', [3], true)))), forRange('k', 1, 5, 1, change('t', v('k'))), whileDo(and(true, false), set('z', rnd(1, 6)), true)]),
    ]))
    expect(code).toContain('function kare(x) {')
    expect(code).toContain('return x * x')
    expect(code).toContain('for (let i = 0; i < 2; i++) {')
    expect(code).toContain('for (let j = 0; j < 2; j++) {')
    expect(code).toContain('s = kare(3)')
    expect(code).toContain('for (let k = 1; k <= 5; k += 1) {')
    expect(code).toContain('while (!(true && false)) {')
    expect(code).toContain('z = rastgele(1, 6)')
  })

  it('metin birleştirme, çarpışma dışı bloklar ve olaya bağlı olmayanlar', () => {
    const code = toJavaScript(program([
      b('oyun_baslangic', {}, set('mesaj', join('Skor: ', b('oyun_skor')))),
      set('x', 1),
      b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-altin' }, b('harita_karo_sil', { C: b('harita_olay_karo', { A: 'col' }), R: b('harita_olay_karo', { A: 'row' }) })),
    ]))
    expect(code).toContain('mesaj = "" + "Skor: " + oyun.skor')
    expect(code).toContain('harita.karoSil(sutun, satir)')
    expect(code).toContain('bağlı olmadığı için çalışmaz')
  })

  it('Türkçe değişken adlarını geçerli tanımlayıcıya çevirir', () => {
    expect(ident('Büyük Kedi')).toBe('Buyuk_Kedi')
    expect(ident('ışık')).toBe('isik')
    expect(ident('1x')).toBe('_1x')
    expect(ident('???', 'v')).toBe('v')
  })
})

// Hafta 5 (Oyun 1: yakalama oyunu) ve Hafta 6 (Oyun 2: oyunu geliştir) etkinlikleri.
import type { RunReport, SahneActivity } from '../activity'
import { allow } from '../blocks'
import { b, chg, eq, flag, forever, ifThen, keyDown, lt, rnd, say, setv, touching, v, wait } from '../dsl'
import { makeProject, type SpriteSpec } from '../kit'
import { makeVar } from '../project'
import type { BlockNode } from '../types'
import { cpSprite, cpVar } from './ortak'

const OYUN_BLOKLARI = allow('sh_when_flag', 'hareket', 'sh_say', 'sh_say_for', 'sh_wait', 'sh_forever', 'sh_if', 'sh_if_else', 'sh_repeat', 'sh_repeat_until', 'sh_stop', 'sh_touching', 'sh_key_pressed', 'islemler')
const BACK = ['gokyuzu']
const ELMA_Y = 150, SEPET_Y = -140

const sepetKodu = (): BlockNode[] => [flag([
  b('sh_goto_xy', { X: 0, Y: SEPET_Y }),
  forever([ifThen(keyDown('right'), [b('sh_change_x', { N: 10 })]), ifThen(keyDown('left'), [b('sh_change_x', { N: -10 })])]),
])]
const elmaKodu = (extraTouch: BlockNode[] = [], extraGround: BlockNode[] = [], extraLoop: BlockNode[] = []): BlockNode[] => [flag([
  b('sh_goto_xy', { X: 0, Y: ELMA_Y }),
  forever([
    b('sh_change_y', { N: -5 }),
    ifThen(touching('sepet'), [...extraTouch, b('sh_set_y', { N: ELMA_Y })]),
    ifThen(lt(b('sh_ypos'), -150), [...extraGround, b('sh_set_y', { N: ELMA_Y })]),
    ...extraLoop,
  ]),
])]
const sepetSpec = (blocks: BlockNode[] = []): SpriteSpec => ({ id: 'sepet', name: 'Sepet', char: 'sepet', x: 0, y: SEPET_Y, blocks })
const elmaSpec = (blocks: BlockNode[] = []): SpriteSpec => ({ id: 'elma', name: 'Elma', char: 'elma', x: 0, y: ELMA_Y, size: 70, blocks })

// ── 5:1 Hareket et ve yakala ──
export const A_5_1: SahneActivity = {
  id: 'scratch:5:1',
  title: 'Hareket et ve yakala',
  intro: 'Sepeti ok tuşlarıyla yönet, elma yukarıdan aşağı insin. Tuş kontrolünü "sonsuza kadar" bloğunun İÇİNE koy ("sağ ok basılı mı?" ile). Elma sepete değince ya da yere inince tekrar yukarıdan başlasın.',
  allowedBlocks: OYUN_BLOKLARI,
  starter: () => makeProject('Yakalama oyunu', [sepetSpec(), elmaSpec()], { backdrops: BACK }),
  scenario: [
    { do: 'seconds', s: 1.5 }, { do: 'checkpoint', name: 'dusme' },
    { do: 'key', key: 'right', frames: 15 }, { do: 'checkpoint', name: 'sag' },
    { do: 'key', key: 'left', frames: 40 }, { do: 'checkpoint', name: 'sol' },
    { do: 'place', sprite: 'elma', x: 200, y: -170 }, { do: 'wait', frames: 4 }, { do: 'checkpoint', name: 'yer' },
    { do: 'collide', a: 'sepet', b: 'elma' }, { do: 'checkpoint', name: 'yakala' },
  ],
  goals: [
    { id: 'sag', label: 'Sağ ok tuşuyla sepet sağa gidiyor', hint: '"sağ ok tuşuna basılı mı?" bloğunu "eğer" içinde kullan ve x\'i artır.', kind: 'prop', sprite: 'sepet', prop: 'x', op: 'gt', value: 5, at: 'sag' },
    { id: 'sol', label: 'Sol ok tuşuyla sepet sola gidiyor', kind: 'custom', test: (r) => { const a = cpSprite(r, 'sag', 'sepet'), c = cpSprite(r, 'sol', 'sepet'); return !!a && !!c && c.x < a.x - 5 } },
    { id: 'dusme', label: 'Elma yukarıdan aşağı iniyor', hint: 'Elmanın "sonsuza kadar" döngüsünde y\'yi azalt.', kind: 'prop', sprite: 'elma', prop: 'y', op: 'lt', value: 100, at: 'dusme' },
    { id: 'yere', label: 'Elma yere inince tekrar yukarıdan başlıyor', hint: 'y konumu -150\'den küçükse y\'yi 150 yap.', kind: 'prop', sprite: 'elma', prop: 'y', op: 'gt', value: 100, at: 'yer' },
    { id: 'yakala', label: 'Elma sepete değince tekrar yukarıdan başlıyor', kind: 'prop', sprite: 'elma', prop: 'y', op: 'gt', value: 100, at: 'yakala' },
    { id: 'sonsuz', label: 'Hareket kodu "sonsuza kadar" döngüsünün içinde', kind: 'usesBlocks', types: ['sh_forever'] },
  ],
  solution: () => makeProject('Yakalama oyunu', [sepetSpec(sepetKodu()), elmaSpec(elmaKodu())], { backdrops: BACK }),
}

// ── 5:2 Skor: değişkenler ──
const skorKodu = (): BlockNode[] => elmaKodu([chg('skor', 1)])
const altinKodu = (): BlockNode[] => [flag([
  b('sh_goto_xy', { X: 140, Y: ELMA_Y }),
  forever([b('sh_change_y', { N: -8 }), ifThen(touching('sepet'), [chg('skor', 5), b('sh_set_y', { N: ELMA_Y })]), ifThen(lt(b('sh_ypos'), -150), [b('sh_set_y', { N: ELMA_Y })])]),
])]
const altinSpec = (blocks: BlockNode[] = []): SpriteSpec => ({ id: 'altin', name: 'Altın elma', char: 'altin-elma', x: 140, y: ELMA_Y, size: 60, blocks })
export const A_5_2: SahneActivity = {
  id: 'scratch:5:2',
  title: 'Skor tutalım',
  intro: 'Bilgisayar yakaladığın elmaları nerede tutar? Bir DEĞİŞKENDE: üzerine isim yazılı bir kutu. "Değişken oluştur" ile "skor" yap, bayrakta skoru 0 yap, elma sepete değince 1 artır. Bonus: altın elma skoru 5 artırsın.',
  allowedBlocks: allow(...OYUN_BLOKLARI, 'degiskenler'),
  starter: () => makeProject('Yakalama oyunu', [sepetSpec(sepetKodu()), elmaSpec(elmaKodu()), altinSpec()], { backdrops: BACK }),
  scenario: [
    { do: 'seconds', s: 0.3 }, { do: 'setVar', name: 'skor', value: 7 }, { do: 'flag' }, { do: 'wait', frames: 3 }, { do: 'checkpoint', name: 'sifir' },
    { do: 'collide', a: 'sepet', b: 'elma' }, { do: 'checkpoint', name: 'yakala' },
    { do: 'collide', a: 'sepet', b: 'altin' }, { do: 'checkpoint', name: 'altin' },
    { do: 'setVar', name: 'skor', value: 9 }, { do: 'collide', a: 'sepet', b: 'elma' }, { do: 'wait', frames: 6 },
  ],
  goals: [
    { id: 'degisken', label: '"skor" adında bir değişken oluşturdun', kind: 'defined', name: 'skor' },
    { id: 'sifirla', label: 'Yeşil bayrakta skor 0\'a dönüyor', hint: '"skor = 0 yap" bloğunu bayrağın altına koy. Yoksa eski skor kalır!', kind: 'var', name: 'skor', op: 'eq', value: 0, at: 'sifir' },
    { id: 'artar', label: 'Elma sepete değince skor artıyor', kind: 'var', name: 'skor', op: 'gte', value: 1, at: 'yakala' },
    { id: 'gorunur', label: 'Skor sahnede görünüyor', hint: 'Değişkenin yanındaki kutu işaretliyse sahnede görünür.', kind: 'custom', test: (r) => { const id = r.project.variables.find((x) => x.name === 'skor')?.id; return !!id && r.session.engine.varVisible.get(id) !== false } },
    { id: 'bonus', label: 'Bonus: altın elma skoru 5 artırıyor', kind: 'custom', optional: true, test: (r) => cpVar(r, 'altin', 'skor') - cpVar(r, 'yakala', 'skor') >= 5 },
    { id: 'kazandin', label: 'Meydan okuma: skor 10 olunca "Kazandın!" diyor', kind: 'custom', optional: true, test: (r) => r.session.engine.sayLog.some((x) => /kazand/i.test(x.text)) },
  ],
  solution: () => makeProject('Yakalama oyunu', [
    sepetSpec(sepetKodu()),
    elmaSpec([flag([setv('skor', 0), b('sh_goto_xy', { X: 0, Y: ELMA_Y }), forever([
      b('sh_change_y', { N: -5 }),
      ifThen(touching('sepet'), [chg('skor', 1), b('sh_set_y', { N: ELMA_Y })]),
      ifThen(lt(b('sh_ypos'), -150), [b('sh_set_y', { N: ELMA_Y })]),
      ifThen(eq(v('skor'), 10), [say('Kazandın!')]),
    ])])]),
    altinSpec(altinKodu()),
  ], { backdrops: BACK, vars: [makeVar('skor')] }),
}

// ── 6:1 Zamanlayıcı, can ve oyun bitti ──
const bittiMi = (r: RunReport): boolean => r.session.engine.sayLog.filter((x) => /bitti/i.test(x.text)).length
  ? true : false
export const A_6_1: SahneActivity = {
  id: 'scratch:6:1',
  title: 'Can, süre ve oyun bitti',
  intro: 'Oyun sonsuza kadar sürmesin! "can" (3 ile başlasın) ve "süre" (30 ile başlasın) değişkenleri yap. Elma yere düşünce canı azalt, can bitince ya da süre dolunca "Oyun bitti" de ve "hepsini dur". Süre için 1 saniye bekleyip süreyi 1 azalt.',
  allowedBlocks: allow(...OYUN_BLOKLARI, 'degiskenler'),
  starter: () => makeProject('Yakalama oyunu', [
    sepetSpec(sepetKodu()),
    elmaSpec([flag([setv('skor', 0), b('sh_goto_xy', { X: 0, Y: ELMA_Y }), forever([
      b('sh_change_y', { N: -5 }),
      ifThen(touching('sepet'), [chg('skor', 1), b('sh_set_y', { N: ELMA_Y })]),
      ifThen(lt(b('sh_ypos'), -150), [b('sh_set_y', { N: ELMA_Y })]),
    ])])]),
  ], { backdrops: BACK, vars: [makeVar('skor')] }),
  scenario: [
    { do: 'seconds', s: 0.3 }, { do: 'checkpoint', name: 'basla' },
    { do: 'place', sprite: 'elma', x: 200, y: -170 }, { do: 'wait', frames: 4 }, { do: 'checkpoint', name: 'yer' },
    { do: 'seconds', s: 2.5 }, { do: 'checkpoint', name: 'sure' },
    { do: 'setVar', name: 'can', value: 1 }, { do: 'place', sprite: 'elma', x: 200, y: -170 }, { do: 'wait', frames: 20 }, { do: 'checkpoint', name: 'son' },
    { do: 'flag' }, { do: 'seconds', s: 0.3 }, { do: 'setVar', name: 'süre', value: 1 }, { do: 'seconds', s: 2.5 }, { do: 'checkpoint', name: 'sure-son' },
  ],
  goals: [
    { id: 'can', label: '"can" değişkeni var ve 3 ile başlıyor', kind: 'var', name: 'can', op: 'eq', value: 3, at: 'basla' },
    { id: 'sure', label: '"süre" değişkeni var ve 30 ile başlıyor', kind: 'var', name: 'süre', op: 'eq', value: 30, at: 'basla' },
    { id: 'can-azalir', label: 'Elma yere düşünce can 1 azalıyor', kind: 'custom', test: (r) => cpVar(r, 'yer', 'can') === cpVar(r, 'basla', 'can') - 1 },
    { id: 'sure-azalir', label: 'Süre saniyede bir azalıyor', hint: 'Sonsuza kadar içinde: 1 saniye bekle, süreyi -1 değiştir.', kind: 'custom', test: (r) => cpVar(r, 'sure', 'süre') < cpVar(r, 'basla', 'süre') },
    { id: 'bitti', label: 'Can 0 olunca "Oyun bitti" yazıyor', kind: 'custom', test: (r) => bittiMi(r) },
    { id: 'dur', label: 'Oyun bitince bütün sprite\'lar duruyor', hint: '"hepsini dur" bloğunu kullan.', kind: 'custom', test: (r) => { const last = r.checkpoints['sure-son']; return !!last && !r.session.running } },
    { id: 'sure-bitince', label: 'Süre 0 olunca da oyun bitiyor', kind: 'custom', optional: true, test: (r) => r.session.engine.sayLog.filter((x) => /bitti/i.test(x.text)).length >= 2 },
  ],
  solution: () => makeProject('Yakalama oyunu', [
    sepetSpec(sepetKodu()),
    elmaSpec([
      flag([setv('skor', 0), setv('can', 3), setv('süre', 30), b('sh_goto_xy', { X: 0, Y: ELMA_Y }), forever([
        b('sh_change_y', { N: -5 }),
        ifThen(touching('sepet'), [chg('skor', 1), b('sh_set_y', { N: ELMA_Y })]),
        ifThen(lt(b('sh_ypos'), -150), [chg('can', -1), b('sh_set_y', { N: ELMA_Y })]),
        ifThen(lt(v('can'), 1), [say('Oyun bitti'), b('sh_stop', { W: 'all' })]),
      ])]),
      flag([forever([wait(1), chg('süre', -1), ifThen(lt(v('süre'), 1), [say('Oyun bitti'), b('sh_stop', { W: 'all' })])])]),
    ]),
  ], { backdrops: BACK, vars: [makeVar('skor'), makeVar('can', { value: 3 }), makeVar('süre', { value: 30 })] }),
}

// ── 6:2 Rastgele ve klonlar ──
export const A_6_2: SahneActivity = {
  id: 'scratch:6:2',
  title: 'Rastgele ve klonlar',
  intro: 'Her elma aynı yerden düşerse sıkıcı olur. Başlarken x konumunu -200 ile 200 arasında RASTGELE yap. Aynı anda birçok elma düşsün: "kendimin klonunu oluştur" ile her saniye bir klon üret; klon olarak başlayınca elma aşağı insin, sepete değince ya da yere inince kendini silsin.',
  allowedBlocks: allow(...OYUN_BLOKLARI, 'degiskenler', 'sh_create_clone', 'sh_when_clone', 'sh_delete_clone', 'sh_show', 'sh_hide', 'sh_set_x', 'sh_set_y', 'sh_goto_xy', 'sh_repeat_until'),
  starter: () => makeProject('Yakalama oyunu', [
    sepetSpec(sepetKodu()),
    elmaSpec(skorKodu()),
  ], { backdrops: BACK, vars: [makeVar('skor')] }),
  scenario: [{ do: 'seconds', s: 7 }],
  goals: [
    { id: 'rastgele', label: '"rastgele sayı" bloğunu kullandın', kind: 'usesBlocks', types: ['sh_random'] },
    { id: 'klon', label: 'Klon bloklarını kullandın: oluştur, "klon olarak başlayınca" ve "bu klonu sil"', kind: 'usesBlocks', types: ['sh_create_clone', 'sh_when_clone', 'sh_delete_clone'] },
    { id: 'cok-elma', label: 'Aynı anda en az 3 elma düşüyor', hint: 'Klon üretirken 1 saniyeden kısa bekle (ör. 0,7).', kind: 'clonesPeak', min: 3 },
    { id: 'dagilim', label: 'Elmalar farklı yerlerden düşüyor (rastgele x)', kind: 'spread', axis: 'x', min: 3 },
    { id: 'hata-yok', label: 'Oyun hatasız çalışıyor', kind: 'noError' },
  ],
  solution: () => makeProject('Yakalama oyunu', [
    sepetSpec(sepetKodu()),
    elmaSpec([
      flag([setv('skor', 0), b('sh_hide'), forever([b('sh_create_clone', { T: '_myself_' }), wait(0.7)])]),
      b('sh_when_clone', {}, [
        b('sh_show'), b('sh_goto_xy', { X: rnd(-200, 200), Y: ELMA_Y }),
        b('sh_repeat_until', { C: lt(b('sh_ypos'), -150) }, [b('sh_change_y', { N: -5 }), ifThen(touching('sepet'), [chg('skor', 1), b('sh_delete_clone')])]),
        b('sh_delete_clone'),
      ]),
    ]),
  ], { backdrops: BACK, vars: [makeVar('skor')] }),
}


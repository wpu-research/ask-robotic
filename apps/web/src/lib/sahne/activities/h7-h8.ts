// Hafta 7 (Kendi bloğum ve listeler) ve Hafta 8 (Proje) etkinlikleri.
import type { SahneActivity } from '../activity'
import { allow } from '../blocks'
import { arg, b, callProc, chg, defProc, eq, flag, gt, ifElse, join, key, mul, say, sayFor, setv, v, wait } from '../dsl'
import { makeProject } from '../kit'
import { makeList, makeVar } from '../project'
import type { BlockNode, ProcDef } from '../types'
import { hasInteraction, visiblyChanged } from './ortak'

// ── 7:1 Kendi bloğunu yap ──
const ZIPLA: ProcDef = { id: 'zipla', name: 'zıpla', params: ['yükseklik'] }
const DANS: ProcDef = { id: 'dans', name: 'dans et', params: [] }
export const A_7_1: SahneActivity = {
  id: 'scratch:7:1',
  title: 'Kendi bloğunu yap',
  intro: 'Aynı bloklar programın her yerinde tekrar ediyorsa onlara bir ad ver! Bloklarım\'da "Bir blok yap" de, adı "zıpla" olsun ve "yükseklik" girdisi ekle. Altına: y\'yi (yükseklik) değiştir, bekle, sonra y\'yi (0 − yükseklik) değiştir (İşlemler\'deki − bloğu). Sonra ana kodunda birkaç kez çağır; ikinci bir blok da yap (ör. "dans et").',
  allowedBlocks: allow('sh_when_flag', 'sh_when_key', 'sh_change_y', 'sh_set_y', 'sh_wait', 'sh_repeat', 'sh_turn_r', 'sh_turn_l', 'sh_move', 'sh_say', 'sh_say_for', 'sh_play', 'islemler', 'bloklarim'),
  starter: () => makeProject('Bilgi yarışması', [{ id: 'kedi', name: 'Kedi', char: 'kedi', y: 0, sounds: ['ziplama'], blocks: [flag([say('Zıplıyorum!')])] }], { backdrops: ['gokyuzu'] }),
  scenario: [{ do: 'seconds', s: 4 }],
  goals: [
    { id: 'blok', label: 'Kendi bloğunu yaptın ve ana kodunda en az 2 kez çağırdın', hint: 'Bloklarım → "Bir blok yap". Yaptıktan sonra bloğu paletten koda sürükle.', kind: 'procs', min: 1, calls: 2 },
    { id: 'girdi', label: 'Bloğuna bir girdi (ör. yükseklik) ekledin', kind: 'procs', min: 1, withParam: true },
    { id: 'zipladi', label: 'Bloğu çağırınca kedi yukarı zıplıyor', kind: 'moved', sprite: 'kedi', axis: 'y', dir: 'pos', min: 15 },
    { id: 'ikinci', label: 'İkinci bir blok daha yaptın (dans, ses…)', kind: 'procs', min: 2 },
    { id: 'iner', label: 'Zıpladıktan sonra kedi yerine iniyor', kind: 'prop', sprite: 'kedi', prop: 'y', op: 'eq', value: 0, optional: true },
  ],
  solution: () => makeProject('Bilgi yarışması', [{
    id: 'kedi', name: 'Kedi', char: 'kedi', y: 0, sounds: ['ziplama'], procs: [ZIPLA, DANS],
    blocks: [
      defProc('zipla', [b('sh_change_y', { N: arg('yükseklik') }), wait(0.1), b('sh_change_y', { N: mul(arg('yükseklik'), -1) })]),
      defProc('dans', [b('sh_turn_r', { D: 30 }), wait(0.1), b('sh_turn_l', { D: 60 }), wait(0.1), b('sh_turn_r', { D: 30 })]),
      flag([callProc('zipla', [30]), callProc('zipla', [60]), callProc('dans')]),
    ],
  }], { backdrops: ['gokyuzu'] }),
}

// ── 7:2 Liste ile bilgi yarışması ──
const SORULAR = ['Bir elde kaç parmak var?', 'Güneş hangi yönden doğar?', 'Haftada kaç gün var?', 'Üçgenin kaç kenarı var?', 'Arının yaptığı tatlı besin nedir?']
const CEVAPLAR = ['5', 'doğu', '7', '3', 'bal']
const yarismaBaslangic = () => makeProject('Bilgi yarışması', [{ id: 'robot', name: 'Sunucu', char: 'robot', x: 0, y: -20 }], { backdrops: ['sahne'] })
const autoCorrect = (q: string, s: import('../session').SahneSession): string => {
  const soru = s.list('sorular') ?? [], cev = s.list('cevaplar') ?? []
  const i = soru.findIndex((x) => String(x) === q)
  return i >= 0 ? String(cev[i] ?? '') : ''
}
export const A_7_2: SahneActivity = {
  id: 'scratch:7:2',
  title: 'Bilgi yarışması',
  intro: 'Her soruyu ayrı değişkende tutmak yerine LİSTE kullan: "sorular" ve "cevaplar" listeleri yap (4-5 öğe, aynı sırada). "sıra" değişkeniyle sırayla sor; cevap doğruysa "Doğru!" de ve skor değişkenini 1 kadar değiştir, değilse "Yanlış" de. Liste bitince yarışma sona ersin.',
  allowedBlocks: allow('sh_when_flag', 'sh_say', 'sh_say_for', 'sh_wait', 'sh_repeat', 'sh_repeat_until', 'sh_if', 'sh_if_else', 'sh_ask', 'sh_answer', 'sh_stop', 'islemler', 'degiskenler'),
  starter: yarismaBaslangic,
  scenario: [
    { do: 'autoAnswer', fn: () => '???' }, { do: 'seconds', s: 14 }, { do: 'checkpoint', name: 'yanlis' },
    { do: 'autoAnswer', fn: autoCorrect }, { do: 'flag' }, { do: 'seconds', s: 40 }, { do: 'checkpoint', name: 'dogru' },
  ],
  goals: [
    { id: 'sorular', label: '"sorular" listesi var ve en az 4 sorusu var', kind: 'defined', name: 'sorular', list: true, minItems: 4 },
    { id: 'cevaplar', label: '"cevaplar" listesi var ve en az 4 cevabı var (aynı sırada)', kind: 'defined', name: 'cevaplar', list: true, minItems: 4 },
    { id: 'degiskenler', label: '"sıra" ve "skor" değişkenlerin var', kind: 'custom', test: (r) => r.project.variables.some((x) => x.name === 'sıra' && x.type === '') && r.project.variables.some((x) => x.name === 'skor' && x.type === '') },
    { id: 'sor', label: '"sor ve bekle" ile listenin sıradaki sorusunu soruyorsun', kind: 'usesBlocks', types: ['sh_ask', 'sh_list_item'] },
    { id: 'yanlis', label: 'Yanlış cevapta "Yanlış" diyor ve puan vermiyor', kind: 'custom', test: (r) => r.session.engine.sayLog.some((x) => /yanl/i.test(x.text)) && (r.checkpoints.yanlis?.vars.skor ?? 1) == 0 },
    { id: 'dogru', label: 'Doğru cevapların hepsinde "Doğru!" diyor ve skor listedeki soru sayısı kadar oluyor', kind: 'custom', test: (r) => { const n = (r.session.list('sorular') ?? []).length; return n >= 4 && Number(r.checkpoints.dogru?.vars.skor) === n } },
    { id: 'bitis', label: 'Liste bitince yarışma sona eriyor', kind: 'custom', test: (r) => !r.session.running },
  ],
  solution: () => {
    const p = makeProject('Bilgi yarışması', [{
      id: 'robot', name: 'Sunucu', char: 'robot', x: 0, y: -20,
      blocks: [flag([
        setv('sıra', 1), setv('skor', 0),
        b('sh_repeat_until', { C: gt(v('sıra'), b('sh_list_len', { L: 'sorular' })) }, [
          b('sh_ask', { Q: b('sh_list_item', { L: 'sorular', N: v('sıra') }) }),
          ifElse(eq(b('sh_answer'), b('sh_list_item', { L: 'cevaplar', N: v('sıra') })), [sayFor('Doğru!', 0.5), chg('skor', 1)], [sayFor('Yanlış', 0.5)]),
          chg('sıra', 1),
        ]),
        say(join('Yarışma bitti! Skorun: ', v('skor'))),
      ])],
    }], { backdrops: ['sahne'], vars: [makeList('sorular', SORULAR), makeList('cevaplar', CEVAPLAR), makeVar('sıra', { value: 1 }), makeVar('skor')] })
    return p
  },
}

// ── 8:1 Fikir ve plan ──
const planStarter = () => makeProject('Projem', [{ id: 'kedi', name: 'Kedi', char: 'kedi', sounds: ['miyav'] }], { backdrops: ['gokyuzu'] })
export const A_8_1: SahneActivity = {
  id: 'scratch:8:1',
  title: 'Fikir ve plan',
  intro: 'Önce planla: Proje Bilgisi\'nde projene bir ad ver ve planını yaz (kim/ne var, hangi sahneler, hangi bloklar gerekecek). Sonra projenin EN KÜÇÜK çalışan halini yap: bir sprite ve tek bir etkileşim (bir tuşa ya da tıklamaya tepki).',
  allowedBlocks: allow('olaylar', 'hareket', 'gorunum', 'ses', 'kontrol', 'algilama', 'islemler', 'degiskenler', 'bloklarim', 'kalem'),
  starter: planStarter,
  scenario: [{ do: 'checkpoint', name: 'once' }, { do: 'hatKeys' }, { do: 'click' }, { do: 'seconds', s: 1 }],
  goals: [
    { id: 'ad', label: 'Projene bir ad verdin', hint: 'Üstteki "Proje bilgisi" düğmesi.', kind: 'named' },
    { id: 'plan', label: 'Planını yazdın (en az 40 karakter)', kind: 'notes', minChars: 40 },
    { id: 'betik', label: 'En az bir sprite\'ın kodu var', kind: 'scripted', min: 1 },
    { id: 'etkilesim', label: 'Bir etkileşim var: tuşa basınca, tıklayınca ya da mesaj alınca', kind: 'custom', test: (r) => hasInteraction(r.project) },
    { id: 'degisir', label: 'Etkileşime tepki olarak sahnede bir şey değişiyor', kind: 'custom', test: (r) => visiblyChanged(r) },
  ],
  solution: () => {
    const p = makeProject('Kedi yürüyüşü', [{
      id: 'kedi', name: 'Kedi', char: 'kedi', sounds: ['miyav'],
      blocks: [key('right', [b('sh_change_x', { N: 10 }), b('sh_next_costume')]), b('sh_when_clicked', {}, [say('Miyav!'), b('sh_play', { S: 'Miyav' })])],
    }], { backdrops: ['gokyuzu'] })
    p.notes = 'Fikir: kediyi ok tuşlarıyla yürüt. Sprite: kedi. En küçük hali: sağ ok ile yürüme, tıklayınca miyav.'
    return p
  },
}

// ── 8:2 Yap, test et, sergile ──
export const A_8_2: SahneActivity = {
  id: 'scratch:8:2',
  title: 'Yap, test et, sergile',
  intro: 'Planına göre projeni büyüt. Her yeni özellikten sonra yeşil bayrakla dene. En az 2 sprite, bir değişken ya da mesaj ve 10 farklı blok kullan. Proje bilgisine NASIL OYNANACAĞINI yaz (kişisel bilgi yazma!). Bir arkadaşına kullandır: nerede takıldı? En az iki şeyi düzelt.',
  allowedBlocks: allow('olaylar', 'hareket', 'gorunum', 'ses', 'kontrol', 'algilama', 'islemler', 'degiskenler', 'bloklarim', 'kalem'),
  starter: () => makeProject('Projem', [{ id: 'kedi', name: 'Kedi', char: 'kedi', sounds: ['miyav'], blocks: [key('right', [b('sh_change_x', { N: 10 })])] }], { backdrops: ['gokyuzu'] }),
  scenario: [{ do: 'checkpoint', name: 'once' }, { do: 'hatKeys' }, { do: 'click' }, { do: 'seconds', s: 3 }],
  goals: [
    { id: 'ad', label: 'Projenin bir adı var', kind: 'named' },
    { id: 'aciklama', label: 'Proje bilgisine nasıl oynanacağını yazdın (en az 40 karakter)', kind: 'notes', minChars: 40 },
    { id: 'sprite', label: 'En az 2 sprite var', kind: 'sprites', min: 2 },
    { id: 'blok', label: '10 farklı blok kullandın', kind: 'distinctBlocks', min: 10 },
    { id: 'degisken-mesaj', label: 'Bir değişken ya da mesaj kullandın', kind: 'custom', test: (r) => r.project.variables.length > 0 || JSON.stringify(r.project).includes('"sh_broadcast"') },
    { id: 'etkilesim', label: 'Oyuncu tuşa basıyor ya da tıklıyor ve sahne tepki veriyor', kind: 'custom', test: (r) => hasInteraction(r.project) && visiblyChanged(r) },
    { id: 'hata-yok', label: 'Proje hatasız çalışıyor', kind: 'noError' },
  ],
  solution: () => {
    const p = makeProject('Elma toplayan kedi', [
      { id: 'kedi', name: 'Kedi', char: 'kedi', sounds: ['miyav', 'puan'], blocks: [
        flag([setv('skor', 0), b('sh_goto_xy', { X: -150, Y: -60 }), say('Elmayı yakala!')]),
        key('right', [b('sh_change_x', { N: 12 }), b('sh_next_costume')]),
        key('left', [b('sh_change_x', { N: -12 }), b('sh_next_costume')]),
        b('sh_when_clicked', {}, [b('sh_play', { S: 'Miyav' }), b('sh_set_effect', { E: 'color', N: 40 })]),
        b('sh_when_msg', { M: 'yakalandi' }, [b('sh_play', { S: 'Puan' }), chg('skor', 1)]),
      ] },
      { id: 'elma', name: 'Elma', char: 'elma', x: 100, y: -60, size: 60, blocks: [
        flag([b('sh_repeat_until', { C: b('sh_touching', { T: 'kedi' }) }, [b('sh_change_y', { N: 0 }), wait(0.1)]), broadcast2('yakalandi'), b('sh_hide')]),
      ] },
    ], { backdrops: ['gokyuzu'], vars: [makeVar('skor')] })
    p.notes = 'Nasıl oynanır: sağ ve sol ok tuşlarıyla kediyi elmaya yürüt. Kediye tıklarsan miyavlar. Elmaya değince puan kazanırsın.'
    return p
  },
}
function broadcast2(m: string): BlockNode { return b('sh_broadcast', { M: m }) }

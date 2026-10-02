// Hafta 3 (Müzik ve etkileşim) ve Hafta 4 (Hikâye) etkinlikleri.
import type { SahneActivity } from '../activity'
import { allow } from '../blocks'
import { b, broadcast, flag, key, sayFor, wait } from '../dsl'
import { makeProject } from '../kit'

// ── 3:1 Tuşa bas, ses çıksın ──
const SES4 = ['do', 're', 'mi', 'fa', 'miyav']
export const A_3_1: SahneActivity = {
  id: 'scratch:3:1',
  title: 'Tuşa bas, ses çıksın',
  intro: '"… tuşuna basılınca" bloğuyla a, s, d, f tuşlarına farklı sesler bağla. Her tuşta kedinin RENGİ de değişsin. Sonra kediye tıklayınca miyavlasın.',
  allowedBlocks: allow('olaylar', 'sh_play', 'sh_play_until', 'sh_stop_sounds', 'sh_set_effect', 'sh_change_effect', 'sh_clear_effects', 'sh_say', 'sh_wait'),
  starter: () => makeProject('Kendi çalgım', [{ id: 'kedi', name: 'Kedi', char: 'kedi', sounds: SES4 }], { backdrops: ['gece'] }),
  scenario: [{ do: 'hatKeys' }, { do: 'click', sprite: 'kedi' }, { do: 'seconds', s: 1 }],
  goals: [
    { id: 'tuslar', label: 'En az 4 farklı tuşa bir "tuşuna basılınca" bloğu koydun', hint: 'Olaylar kategorisinden "… tuşuna basılınca" bloğunu al, açılır listeden tuşu seç.', kind: 'hats', type: 'sh_when_key', min: 4, distinct: 'K' },
    { id: 'sesler', label: 'Tuşlar 4 farklı ses çalıyor', kind: 'event', name: 'sound', min: 4, distinct: 4 },
    { id: 'renk', label: 'Her tuşta kedinin rengi değişiyor', hint: 'Görünüm\'den "renk efektini … değiştir" bloğunu kullan.', kind: 'event', name: 'effect', min: 4 },
    { id: 'tikla', label: 'Kediye tıklayınca bir ses çalıyor', kind: 'custom', test: (r) => r.session.interp.hats.get('kedi')?.some((h) => h.type === 'sh_when_clicked' && !!h.body) === true && (r.session.engine.counts.sound ?? 0) >= 5 },
  ],
  solution: () => makeProject('Kendi çalgım', [{
    id: 'kedi', name: 'Kedi', char: 'kedi', sounds: SES4,
    blocks: [
      key('a', [b('sh_play', { S: 'Do' }), b('sh_change_effect', { E: 'color', N: 30 })]),
      key('s', [b('sh_play', { S: 'Re' }), b('sh_change_effect', { E: 'color', N: 30 })]),
      key('d', [b('sh_play', { S: 'Mi' }), b('sh_change_effect', { E: 'color', N: 30 })]),
      key('f', [b('sh_play', { S: 'Fa' }), b('sh_change_effect', { E: 'color', N: 30 })]),
      b('sh_when_clicked', {}, [b('sh_play', { S: 'Miyav' })]),
    ],
  }], { backdrops: ['gece'] }),
}

// ── 3:2 Kendi çalgım ──
const pad = (id: string, name: string, i: number, x: number, sound: string) => ({ id, name, char: 'dugme', pick: [i], x, y: -60, sounds: [sound] })
const calgiBaslangic = () => makeProject('Kendi çalgım', [
  pad('d1', 'Kırmızı', 0, -150, 'do'), pad('d2', 'Mavi', 1, -50, 're'), pad('d3', 'Yeşil', 2, 50, 'mi'), pad('d4', 'Sarı', 3, 150, 'fa'),
  { id: 'kayit', name: 'Kayıt', char: 'yildiz', x: 0, y: 100, size: 80, sounds: ['do', 'mi', 'sol', 'do2'] },
], { backdrops: ['sahne'] })
const padKey = (k: string, sound: string) => key(k, [b('sh_play', { S: sound }), b('sh_set_size', { N: 130 }), wait(0.1), b('sh_set_size', { N: 100 })])
export const A_3_2: SahneActivity = {
  id: 'scratch:3:2',
  title: 'Kendi çalgım',
  intro: 'Dört renkli tuşlu bir çalgı yap: her düğme bir tuşa bağlansın, çalınca farklı ses çıksın ve düğme görsel olarak tepki versin (büyüsün, renk değiştirsin). Yıldız "Kayıt" düğmesi olsun: tıklayınca bir melodi kendiliğinden çalsın.',
  allowedBlocks: allow('olaylar', 'ses', 'gorunum', 'kontrol'),
  starter: calgiBaslangic,
  scenario: [{ do: 'hatKeys' }, { do: 'click', sprite: 'kayit' }, { do: 'seconds', s: 5 }],
  goals: [
    { id: 'tuslar', label: 'En az 4 farklı tuşlu bir çalgı yaptın', kind: 'hats', type: 'sh_when_key', min: 4, distinct: 'K' },
    { id: 'sesler', label: 'Her tuş farklı bir ses çalıyor', kind: 'event', name: 'sound', min: 4, distinct: 4 },
    { id: 'gorsel', label: 'Tuşlara basınca düğmeler görsel tepki veriyor (büyüme, renk, kostüm)', kind: 'custom', test: (r) => ['effect', 'size', 'costume'].reduce((n, k) => n + (r.session.engine.counts[k] ?? 0), 0) >= 4 },
    { id: 'kayit', label: 'Kayıt (yıldız) tıklanınca en az 3 notalık bir melodi çalıyor', hint: '"… sesini bitene dek çal" blokları art arda dizilirse sesler sırayla çalar.', kind: 'event', name: 'sound', of: 'kayit', min: 3 },
    { id: 'ses-seviyesi', label: 'Meydan okuma: ses seviyesini değiştiren iki tuş (artır / azalt)', kind: 'usesBlocks', types: ['sh_change_volume', 'sh_set_volume'], mode: 'any', optional: true },
  ],
  solution: () => {
    const p = calgiBaslangic()
    const set = (id: string, blocks: ReturnType<typeof key>[]) => { const sp = p.sprites.find((s) => s.id === id)!; sp.blocks = makeProject('x', [{ id, blocks }]).sprites[0].blocks }
    set('d1', [padKey('a', 'Do')]); set('d2', [padKey('s', 'Re')]); set('d3', [padKey('d', 'Mi')]); set('d4', [padKey('f', 'Fa')])
    set('kayit', [b('sh_when_clicked', {}, [b('sh_play_until', { S: 'Do' }), b('sh_play_until', { S: 'Mi' }), b('sh_play_until', { S: 'Sol' }), b('sh_play_until', { S: 'Tiz Do' })]), key('z', [b('sh_change_volume', { N: -20 })]), key('x', [b('sh_change_volume', { N: 20 })])])
    return p
  },
}

// ── 4:1 Konuşma ve zamanlama ──
const konusmaBaslangic = () => makeProject('İki karakterli hikâye', [
  { id: 'kedi', name: 'Kedi', char: 'kedi', x: -110, y: -30, blocks: [flag([sayFor('Merhaba!', 2)])] },
  { id: 'kopek', name: 'Köpek', char: 'kopek', x: 110, y: -30, blocks: [flag([sayFor('Selam!', 2)])] },
], { backdrops: ['oda'] })
export const A_4_1: SahneActivity = {
  id: 'scratch:4:1',
  title: 'Konuşma ve zamanlama',
  intro: 'İki karakter konuşuyor ama ikisi aynı anda başlıyor! Beklemeleri hesapla: birincinin konuşma süresi + boşluk = ikincinin bekleme süresi. Üç satırlık bir konuşma yaz ve konuşmalar üst üste binmesin.',
  allowedBlocks: allow('sh_when_flag', 'sh_say', 'sh_say_for', 'sh_wait'),
  starter: konusmaBaslangic,
  scenario: [{ do: 'seconds', s: 9 }],
  goals: [
    { id: 'uc-satir', label: 'Konuşma en az 3 satır ve iki karakter konuşuyor', kind: 'dialogue', minLines: 3, minSpeakers: 2 },
    { id: 'sirayla', label: 'Konuşmalar üst üste binmiyor: sırayla konuşuyorlar', hint: 'İkinci karakter başlamadan önce "bekle" bloğuyla birincinin bitmesini bekle.', kind: 'dialogue', minLines: 3, noOverlap: true },
    { id: 'bekle', label: '"Bekle" bloğunu kullandın', kind: 'usesBlocks', types: ['sh_wait'] },
  ],
  solution: () => makeProject('İki karakterli hikâye', [
    { id: 'kedi', name: 'Kedi', char: 'kedi', x: -110, y: -30, blocks: [flag([sayFor('Merhaba!', 2), wait(2), sayFor('Nasılsın?', 2)])] },
    { id: 'kopek', name: 'Köpek', char: 'kopek', x: 110, y: -30, blocks: [flag([wait(2), sayFor('İyiyim, sen?', 2)])] },
  ], { backdrops: ['oda'] }),
}

// ── 4:2 Yayın ve sahne değişimi ──
export const A_4_2: SahneActivity = {
  id: 'scratch:4:2',
  title: 'Yayın ve sahne değişimi',
  intro: 'Beklemeleri hesaplamak kırılgandır. Bekleme bloklarını kaldır: karakter sözünü bitirince bir MESAJ yayınlasın, öbürü o mesajı alınca konuşsun. Mesaj gelince arka planı da değiştir. Hikâyen en az 3 sahne olsun.',
  allowedBlocks: allow('olaylar', 'sh_say', 'sh_say_for', 'sh_wait', 'sh_backdrop', 'sh_next_backdrop'),
  starter: () => makeProject('İki karakterli hikâye', [
    { id: 'kedi', name: 'Kedi', char: 'kedi', x: -110, y: -30, blocks: [flag([sayFor('Merhaba!', 2), wait(2), sayFor('Hadi gidelim!', 2)])] },
    { id: 'kopek', name: 'Köpek', char: 'kopek', x: 110, y: -30, blocks: [flag([wait(2), sayFor('Selam!', 2)])] },
  ], { backdrops: ['oda'] }),
  scenario: [{ do: 'seconds', s: 9 }],
  goals: [
    { id: 'yayin', label: '"Mesajı yayınla" ve "mesajı alınca" bloklarını kullandın', kind: 'usesBlocks', types: ['sh_broadcast', 'sh_when_msg'] },
    { id: 'bekleme-yok', label: 'Beklemeyi mesajla değiştirdin: hikâyede "bekle" bloğu kalmadı', kind: 'custom', test: (r) => !JSON.stringify(r.project).includes('"sh_wait"') },
    { id: 'konusma', label: 'Karakterler sırayla (üst üste binmeden) en az 3 satır konuşuyor', kind: 'dialogue', minLines: 3, minSpeakers: 2, noOverlap: true },
    { id: 'sahneler', label: 'Hikâyenin en az 3 sahnesi (arka planı) var', kind: 'backdrops', min: 3 },
    { id: 'sahne-degisti', label: 'Mesaj gelince arka plan değişiyor (en az 2 kez)', kind: 'event', name: 'backdrop', min: 2 },
  ],
  solution: () => makeProject('İki karakterli hikâye', [
    { id: 'kedi', name: 'Kedi', char: 'kedi', x: -110, y: -30, blocks: [
      flag([sayFor('Merhaba!', 2), broadcast('sira1')]),
      b('sh_when_msg', { M: 'sira2' }, [sayFor('Hadi gidelim!', 2)]),
    ] },
    { id: 'kopek', name: 'Köpek', char: 'kopek', x: 110, y: -30, blocks: [b('sh_when_msg', { M: 'sira1' }, [sayFor('Selam!', 2), broadcast('sira2')])] },
  ], {
    backdrops: ['oda', 'gokyuzu', 'gece'],
    stage: [b('sh_when_msg', { M: 'sira1' }, [b('sh_next_backdrop')]), b('sh_when_msg', { M: 'sira2' }, [b('sh_next_backdrop')])],
  }),
}

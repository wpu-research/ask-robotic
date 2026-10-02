// Hafta 1 (Tanışma) ve Hafta 2 (Animasyon) etkinlikleri.
import type { SahneActivity } from '../activity'
import { allow } from '../blocks'
import { b, flag, repeat, say, wait } from '../dsl'
import { makeProject } from '../kit'
import { commandCount } from './ortak'

// ── 1:1 Programlanmış dans (ekransız dersin sanal karşılığı) ──
export const A_1_1: SahneActivity = {
  id: 'scratch:1:1',
  title: 'Robot dans etsin',
  intro: 'Komut kartlarını sıraya dizerek Robot\'a bir dans öğret. Robot kartlardakini AYNEN yapar, yorum katmaz. Dans çirkin çıkarsa kartları değiştir, ekle, çıkar. Sonra dansa "tekrarla" ekle.',
  allowedBlocks: allow('sh_when_flag', 'sh_move', 'sh_turn_r', 'sh_turn_l', 'sh_play', 'sh_wait', 'sh_repeat'),
  starter: () => makeProject('Programlanmış dans', [{ id: 'robot', name: 'Robot', char: 'robot', x: -120, y: 0, sounds: ['alkis'] }], { backdrops: ['sahne'] }),
  scenario: [{ do: 'seconds', s: 6 }],
  goals: [
    { id: 'kartlar', label: 'Dansında en az 6 komut kartı var', hint: 'Adım at, dön, alkış kartlarını bayrağın altına sırayla tutturup 6 kart yap.', kind: 'custom', test: (r) => commandCount(r.project) >= 6 },
    { id: 'adim-alkis', label: '"Adım at" ve "alkış" (… sesini çal) kartlarını kullandın', kind: 'usesBlocks', types: ['sh_move', 'sh_play'] },
    { id: 'don', label: '"Dön" kartını kullandın', kind: 'usesBlocks', types: ['sh_turn_r', 'sh_turn_l'], mode: 'any' },
    { id: 'dans', label: 'Bayrağa basınca Robot dans ediyor (yer değiştiriyor ve alkışlıyor)', hint: 'Bloklar bayrak bloğuna gerçekten tutturulmuş mu?', kind: 'moved', sprite: 'robot', min: 30 },
    { id: 'tekrar', label: '"3 kere tekrarla: adım, alkış" yaptın', hint: 'Kontrol\'den "tekrarla" bloğunu al, içine adım ve alkışı koy.', kind: 'event', name: 'sound', min: 3 },
    { id: 'tekrar-blok', label: '"Tekrarla" kartını kullandın', kind: 'usesBlocks', types: ['sh_repeat'] },
  ],
  solution: () => makeProject('Programlanmış dans', [{
    id: 'robot', name: 'Robot', char: 'robot', x: -120, y: 0, sounds: ['alkis'],
    blocks: [flag([b('sh_move', { N: 40 }), b('sh_turn_r', { D: 90 }), b('sh_play', { S: 'Alkış' }), wait(0.3), repeat(3, [b('sh_move', { N: 20 }), b('sh_play', { S: 'Alkış' }), wait(0.3)])])],
  }], { backdrops: ['sahne'] }),
}

// ── 1:2 İlk projem ──
export const A_1_2: SahneActivity = {
  id: 'scratch:1:2',
  title: 'İlk projem',
  intro: 'Sahne, sprite ve kod alanını tanı. Kediyi silip yeni bir karakter seç, sahneye bir arka plan ekle, yeşil bayrak bloğuna bir hareket bloğu tutturup bayrağa bas. Meydan okuma: 10 FARKLI blok kullan!',
  allowedBlocks: allow('olaylar', 'hareket', 'gorunum', 'ses', 'kontrol'),
  starter: () => makeProject('İlk projem', [{ id: 'sprite1', name: 'Kedi', char: 'kedi', sounds: ['miyav'] }]),
  scenario: [{ do: 'seconds', s: 4 }],
  goals: [
    { id: 'yeni-sprite', label: 'Kedi yerine yeni bir karakter ekledin', hint: 'Sprite listesinden kediyi sil, sağ alttaki "karakter ekle" düğmesiyle başka bir karakter seç.', kind: 'custom', test: (r) => r.project.sprites.some((s) => !s.costumes[0]?.name.startsWith('kedi')) },
    { id: 'arka-plan', label: 'Sahneye bir arka plan ekledin', hint: 'Sprite listesinin yanındaki "Sahne" düğmesinden arka plan seç.', kind: 'backdrops', min: 2 },
    { id: 'bayrak', label: 'Kod alanında "yeşil bayrak tıklanınca" bloğu var', kind: 'hats', type: 'sh_when_flag', min: 1 },
    { id: 'hareket', label: 'Bayrağın altına bir Hareket (mavi) bloğu tutturdun', kind: 'usesBlocks', types: ['sh_move', 'sh_turn_r', 'sh_turn_l', 'sh_goto_xy', 'sh_change_x', 'sh_change_y', 'sh_glide_xy', 'sh_point'], mode: 'any' },
    { id: 'calisti', label: 'Bayrağa basınca karakter kıpırdıyor', kind: 'moved', sprite: '*', min: 15 },
    { id: 'on-blok', label: 'Meydan okuma: 10 farklı blok kullandın', kind: 'distinctBlocks', min: 10, optional: true },
  ],
  solution: () => makeProject('İlk projem', [{
    id: 'kopek', name: 'Köpek', char: 'kopek', x: -150, sounds: ['hav'],
    blocks: [flag([b('sh_goto_xy', { X: -150, Y: -40 }), b('sh_say_for', { M: 'Merhaba!', S: 1 }), b('sh_set_effect', { E: 'color', N: 60 }), b('sh_change_size', { N: 20 }), b('sh_play', { S: 'Hav' }),
      repeat(10, [b('sh_move', { N: 20 }), b('sh_turn_r', { D: 15 }), b('sh_next_costume'), wait(0.1)])])],
  }], { backdrops: ['beyaz', 'gokyuzu'] }),
}

// ── 2:1 Kostüm değiştir, karakter yürüsün ──
export const A_2_1: SahneActivity = {
  id: 'scratch:2:1',
  title: 'Karakter yürüsün',
  intro: 'Kedinin iki kostümü var: biraz farklı iki resim. Yeşil bayrağın altına "sonraki kostüm" ve "bekle" bloklarını koy, bayrağa bas. Sonra bekleme süresini 0,1 ve 1 saniye yapıp farkı gör (sahne saniyede 30 kare çizer; 0,1 saniye 3 karedir).',
  allowedBlocks: allow('sh_when_flag', 'sh_next_costume', 'sh_costume', 'sh_wait', 'sh_move', 'sh_repeat', 'sh_forever'),
  starter: () => makeProject('Canlı karakter', [{ id: 'kedi', name: 'Kedi', char: 'kedi' }], { backdrops: ['gokyuzu'] }),
  // yeşil bayrağa art arda basmak da (tek "sonraki kostüm" ile) kostümü üç kez değiştirir
  scenario: [{ do: 'seconds', s: 1 }, { do: 'flag' }, { do: 'seconds', s: 1 }, { do: 'flag' }, { do: 'seconds', s: 1 }],
  goals: [
    { id: 'bayrak', label: 'Kodun "yeşil bayrak tıklanınca" ile başlıyor', kind: 'hats', type: 'sh_when_flag', min: 1 },
    { id: 'sonraki', label: '"Sonraki kostüm" bloğunu kullandın', kind: 'usesBlocks', types: ['sh_next_costume'] },
    { id: 'bekle', label: '"Bekle" bloğunu kullandın', hint: 'Kontrol (turuncu) kategorisinde.', kind: 'usesBlocks', types: ['sh_wait'] },
    { id: 'yuruyor', label: 'Karakter yürüyor: kostüm en az 3 kez değişti', hint: 'Bayrağa art arda bas ya da Kontrol\'den "tekrarla" bloğunu kullan.', kind: 'event', name: 'costume', min: 3 },
    { id: 'hizli', label: 'Deney: bekleme süresini 0,1 saniye ya da daha kısa yaptın', kind: 'custom', optional: true, test: (r) => waitValues(r.project).some((v) => v <= 0.1) },
  ],
  solution: () => makeProject('Canlı karakter', [{ id: 'kedi', name: 'Kedi', char: 'kedi', blocks: [flag([repeat(10, [b('sh_next_costume'), wait(0.1)])])] }], { backdrops: ['gokyuzu'] }),
}

function waitValues(p: ReturnType<typeof makeProject>): number[] {
  const out: number[] = []
  const walk = (n: { type: string; inputs?: Record<string, { block?: unknown; shadow?: unknown }>; next?: { block?: unknown }; fields?: Record<string, unknown> } | undefined): void => {
    for (let x = n; x; x = x.next?.block as typeof n) {
      if (x.type === 'sh_wait') { const s = (x.inputs?.S?.shadow ?? x.inputs?.S?.block) as { fields?: { NUM?: number } } | undefined; if (s?.fields?.NUM !== undefined) out.push(Number(s.fields.NUM)) }
      for (const i of Object.values(x.inputs ?? {})) walk(i.block as typeof n)
    }
  }
  for (const s of p.sprites) for (const t of s.blocks.blocks?.blocks ?? []) walk(t as Parameters<typeof walk>[0])
  return out
}

// ── 2:2 Sonsuza kadar ve tekrar ──
export const A_2_2: SahneActivity = {
  id: 'scratch:2:2',
  title: 'Sonsuza kadar ve tekrar',
  intro: '100 blok sürüklemek yerine döngü kullan! Kostüm ve hareket bloklarını "sonsuza kadar" bloğunun İÇİNE al, kenara çarpınca sek. Sonra "10 kere tekrarla" dene ve ikinci bir sprite ekleyip ikisini aynı anda canlandır.',
  allowedBlocks: allow('sh_when_flag', 'sh_move', 'sh_bounce', 'sh_turn_r', 'sh_turn_l', 'sh_next_costume', 'sh_wait', 'sh_repeat', 'sh_forever', 'sh_say', 'sh_say_for', 'sh_rot_style'),
  starter: () => makeProject('Canlı karakter', [{ id: 'kedi', name: 'Kedi', char: 'kedi', x: -100, blocks: [flag([b('sh_next_costume'), wait(0.2)])] }], { backdrops: ['gokyuzu'] }),
  scenario: [{ do: 'seconds', s: 4 }],
  goals: [
    { id: 'sonsuz', label: '"Sonsuza kadar" bloğunu kullandın', kind: 'usesBlocks', types: ['sh_forever'] },
    { id: 'sek', label: 'Karakter kenara çarpınca "sek" bloğu çalışıyor', kind: 'usesBlocks', types: ['sh_bounce'] },
    { id: 'hareket', label: 'Karakter sahnede dolaşıyor', kind: 'moved', sprite: '*', min: 100 },
    { id: 'tekrar', label: '"10 kere tekrarla" gibi sayılı bir döngü kullandın', kind: 'usesBlocks', types: ['sh_repeat'] },
    { id: 'iki', label: 'İki sprite\'ın da kendi kodu var', hint: 'Yeni bir sprite ekle ve ona da yeşil bayrakla başlayan kod yaz.', kind: 'scripted', min: 2 },
    { id: 'meydan', label: 'Meydan okuma: karakter 10 adım atınca durup bir şey söylüyor', kind: 'event', name: 'say', min: 1, optional: true },
  ],
  solution: () => makeProject('Canlı karakter', [
    { id: 'kedi', name: 'Kedi', char: 'kedi', x: -100, blocks: [flag([b('sh_forever', {}, [b('sh_move', { N: 8 }), b('sh_next_costume'), b('sh_bounce'), wait(0.1)])])] },
    { id: 'kopek', name: 'Köpek', char: 'kopek', x: 100, y: -80, blocks: [flag([repeat(10, [b('sh_move', { N: 10 }), b('sh_next_costume'), wait(0.1)]), say('Bitti!')])] },
  ], { backdrops: ['gokyuzu'] }),
}


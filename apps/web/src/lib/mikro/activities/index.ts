// Örnek ders etkinlikleri. Ders yazarları için şablondur (README: "Etkinlik yazımı"). Ders oynatıcıya bağlanınca gerçek dersler
// kendi dosyalarında (activities/<modül>.ts) aynı biçimde yazılır ve burada kayda eklenir.
import type { MikroActivity } from '../activity'
import { afterInputPattern, ledPattern, playsSound, radioReceived, radioSent, showsNumber, usesBlocks, variableIs } from '../goals'
import { ICON_BY_ID } from '../icons'
import { MIKRO_KART_H1_H3 } from './mikro-kart-h1-h3'
import { MIKRO_KART_H456 } from './h456'
import { b, changeVar, cmp, forever, getVar, hatBlock, ifThen, onButton, onStart, project, setVar } from '../program'

const HEART = ICON_BY_ID.heart.rows
const HAPPY = ICON_BY_ID.happy.rows
const SAD = ICON_BY_ID.sad.rows

const ornekKalp: MikroActivity = {
  intro: 'A düğmesine basınca kartın ekranında bir kalp görünsün.',
  allowedBlocks: ['mk_on_button', 'mk_show_icon', 'mk_clear', 'mk_pause'],
  starter: () => project('Kalp', [onButton('A', [])]),
  goals: [
    usesBlocks('blok', "'düğme A basılınca' bloğunu kullan", ['mk_on_button']),
    afterInputPattern('kalp', 'A\'ya basınca ekranda kalp görünsün', 'button:A:press', HEART, { hint: "'simgeyi göster' bloğunu bul ve kalbi seç." }),
  ],
  solution: () => project('Kalp', [onButton('A', [b('mk_show_icon', { f: { ICON: 'heart' } })])]),
  scenario: (s) => { s.press('A'); s.advance(200) },
}

const ornekSayac: MikroActivity = {
  intro: 'A düğmesine her basışta bir sayaç artsın ve ekranda gösterilsin.',
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_show_number', 'variables_get', 'variables_set', 'math_change'],
  starter: () => project('Sayaç', [onStart(), onButton('A', [])]),
  goals: [
    variableIs('degisken', "'sayi' değişkeni 3 olsun (3 kez bas)", 'sayi', 3, { hint: "Bir değişken oluştur, adı 'sayi' olsun; başlangıçta 0 yap, A'ya basınca 1 artır." }),
    showsNumber('gosterim', 'Ekranda 3 sayısı görünsün', 3),
  ],
  solution: () => project('Sayaç', [
    onStart(setVar('sayi', 0)),
    onButton('A', [changeVar('sayi', 1), b('mk_show_number', { i: { VALUE: getVar('sayi') } })]),
  ]),
  scenario: (s) => { for (let i = 0; i < 3; i++) { s.press('A'); s.advance(1200) } },
}

const ornekMelodi: MikroActivity = {
  intro: 'Kartı salladığında Neşe ezgisi çalsın.',
  allowedBlocks: ['mk_on_gesture', 'mk_play_melody', 'mk_play_note', 'mk_show_icon', 'mk_clear'],
  starter: () => project('Melodi', [hatBlock('mk_on_gesture', [], { G: 'shake' })]),
  goals: [
    usesBlocks('hareket', "'kart sallandığında' bloğunu kullan", ['mk_on_gesture']),
    playsSound('ezgi', 'Salladığında Neşe ezgisi çalsın', { melody: 'ode' }),
  ],
  solution: () => project('Melodi', [hatBlock('mk_on_gesture', [b('mk_play_melody', { f: { MEL: 'ode' } })], { G: 'shake' })]),
  scenario: (s) => { s.shake(); s.advance(500) },
}

const ornekRadyo: MikroActivity = {
  intro: 'İki kart aynı radyo grubunda. Birinde A\'ya basınca diğerinde kalp görünsün.',
  cards: 2,
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_number', 'mk_radio_recv', 'mk_show_icon'],
  starter: () => project('Radyo', [onStart(), onButton('A', [])]),
  goals: [
    radioSent('gonder', 'A\'ya basınca radyoyla sayı gönder', { kind: 'num', card: 0 }),
    radioReceived('al', 'İkinci kart mesajı alsın', { card: 1 }),
    ledPattern('kalp', 'İkinci kartta kalp görünsün', HEART, { card: 1 }),
  ],
  solution: () => project('Radyo', [
    onStart(b('mk_radio_group', { i: { G: 3 } })),
    onButton('A', [b('mk_radio_send_number', { i: { VALUE: 1 } })]),
    hatBlock('mk_on_radio', [b('mk_show_icon', { f: { ICON: 'heart' } })]),
  ]),
  scenario: (s) => { s.press('A', 100, 0); s.advance(500) },
}

const ornekSicak: MikroActivity = {
  intro: 'Sıcaklık 30 dereceyi geçince üzgün yüz, değilse mutlu yüz göster.',
  allowedBlocks: ['mk_forever', 'mk_temperature', 'mk_show_icon', 'controls_if', 'logic_compare', 'math_number'],
  starter: () => project('Sıcak uyarısı', [forever()]),
  goals: [
    usesBlocks('sensor', "'sıcaklık' bloğunu kullan", ['mk_temperature']),
    ledPattern('mutlu', 'Serinken mutlu yüz görünsün', HAPPY),
    ledPattern('uzgun', 'Sıcakken üzgün yüz görünsün', SAD),
  ],
  solution: () => project('Sıcak uyarısı', [
    forever(ifThen(cmp('GT', b('mk_temperature'), 30), [b('mk_show_icon', { f: { ICON: 'sad' } })], [b('mk_show_icon', { f: { ICON: 'happy' } })])),
  ]),
  scenario: (s) => { s.advance(500); s.setSensor('temperature', 35); s.advance(500) },
}

/** Anahtar: `<modül slug>:<hafta>:<ders>` (Jr ve Laboratuvar etkinlikleriyle aynı biçim). Bunlar yalnız örnektir. */
export const MIKRO_ACTIVITIES: Record<string, MikroActivity> = {
  'ornek:1:1': ornekKalp,
  'ornek:1:2': ornekSayac,
  'ornek:1:3': ornekMelodi,
  'ornek:2:1': ornekRadyo,
  'ornek:2:2': ornekSicak,
  ...MIKRO_KART_H1_H3,
  ...MIKRO_KART_H456,
}

export const getMikroActivity = (key: string | null | undefined): MikroActivity | null => (key ? MIKRO_ACTIVITIES[key] ?? null : null)
export const allMikroActivities = () => Object.entries(MIKRO_ACTIVITIES)

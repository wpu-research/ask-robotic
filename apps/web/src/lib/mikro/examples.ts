// Örnek proje galerisi: serbest atölyede "Örnekler" menüsünden açılır. Hepsi bu dosyada, blok kurucuyla yazılmış kendi örneklerimizdir.
import { type In, arith, b, callFunc, changeVar, cmp, forever, funcDef, getVar, hatBlock, ifThen, listOf, onButton, onStart, project, randomInt, setVar } from './program'
import type { MikroProject } from './types'

export interface MikroExample {
  id: string
  title: string
  description: string
  /** Yeni projede kaç kart gösterilsin. */
  cards?: 1 | 2
  /** Nasıl denenir (kısa ipucu). */
  tryIt: string
  /** İngilizce görünüm metinleri. */
  en: { title: string; description: string; tryIt: string }
  build(): MikroProject
}

const pause = (ms: In) => b('mk_pause', { i: { MS: ms } })
const icon = (id: string) => b('mk_show_icon', { f: { ICON: id } })
const num = (v: In) => b('mk_show_number', { i: { VALUE: v } })

export const EXAMPLES: MikroExample[] = [
  {
    id: 'kalp-atisi',
    en: { title: 'Heartbeat', description: 'The heart grows and shrinks. Speed it up with A, slow it down with B.', tryIt: 'Press the A and B buttons.' },
    title: 'Kalp atışı',
    description: 'Kalp büyür küçülür. A ile hızlandır, B ile yavaşlat.',
    tryIt: 'A ve B düğmelerine bas.',
    build: () => project('Kalp atışı', [
      onStart(setVar('bekleme', 500)),
      forever(icon('heart'), pause(getVar('bekleme')), icon('smallHeart'), pause(getVar('bekleme'))),
      onButton('A', [setVar('bekleme', b('math_constrain', { i: { VALUE: arith('MINUS', getVar('bekleme'), 100), LOW: 100, HIGH: 1000 } }))]),
      onButton('B', [setVar('bekleme', b('math_constrain', { i: { VALUE: arith('ADD', getVar('bekleme'), 100), LOW: 100, HIGH: 1000 } }))]),
    ]),
  },
  {
    id: 'zar',
    en: { title: 'Dice', description: 'Shake the card to get a random number from 1 to 6.', tryIt: 'Press the "Shake" button or click button A.' },
    title: 'Zar',
    description: 'Kartı salla, 1 ile 6 arasında rastgele bir sayı çıksın.',
    tryIt: '"Salla" düğmesine bas ya da A düğmesine tıkla.',
    build: () => project('Zar', [
      hatBlock('mk_on_gesture', [setVar('zar', randomInt(1, 6)), num(getVar('zar'))], { G: 'shake' }),
      onButton('A', [setVar('zar', randomInt(1, 6)), num(getVar('zar'))]),
    ]),
  },
  {
    id: 'sayac',
    en: { title: 'Counter', description: 'A counts up, B counts down, A+B resets. Uses a variable.', tryIt: 'Try the A, B and A+B buttons.' },
    title: 'Sayaç',
    description: 'A artırır, B azaltır, A+B sıfırlar. Değişken kullanır.',
    tryIt: 'A, B ve A+B düğmelerini dene.',
    build: () => project('Sayaç', [
      onStart(setVar('sayi', 0)),
      onButton('A', [changeVar('sayi', 1), num(getVar('sayi'))]),
      onButton('B', [changeVar('sayi', -1), num(getVar('sayi'))]),
      onButton('AB', [setVar('sayi', 0), num(getVar('sayi'))]),
    ]),
  },
  {
    id: 'pusula',
    en: { title: 'Compass', description: 'The arrow always points north. Press A to read the degrees.', tryIt: 'Turn the compass dial.' },
    title: 'Pusula',
    description: 'Ok her zaman kuzeyi gösterir. A ile derece değerini oku.',
    tryIt: 'Pusula kadranını döndür.',
    build: () => project('Pusula', [
      forever(b('mk_show_arrow_deg', { i: { ANGLE: arith('MINUS', 360, b('mk_compass')) } })),
      onButton('A', [num(b('mk_compass')), pause(300)]),
    ]),
  },
  {
    id: 'termometre',
    en: { title: 'Thermometer', description: 'The LED bar fills up as it gets warmer. Press B to read the degrees.', tryIt: 'Move the temperature slider.' },
    title: 'Termometre',
    description: 'Sıcaklık arttıkça LED çubuğu dolar. B ile derece değerini oku.',
    tryIt: 'Sıcaklık kaydırıcısını oynat.',
    build: () => project('Termometre', [
      forever(b('mk_show_bar', { i: { V: arith('MINUS', b('mk_temperature'), 10), MAX: 25 } })),
      onButton('B', [num(b('mk_temperature')), pause(300)]),
    ]),
  },
  {
    id: 'muzik-kutusu',
    en: { title: 'Music box', description: 'A, B and shaking play different melodies; touching the logo plays a note.', tryIt: 'Press the buttons, touch the logo.' },
    title: 'Müzik kutusu',
    description: 'A, B ve sallama farklı ezgiler çalar; logoya dokununca nota çalar.',
    tryIt: 'Düğmelere bas, logoya dokun.',
    build: () => project('Müzik kutusu', [
      onButton('A', [icon('note'), b('mk_play_melody', { f: { MEL: 'ode' } }), b('mk_clear')]),
      onButton('B', [icon('note'), b('mk_play_melody', { f: { MEL: 'twinkle' } }), b('mk_clear')]),
      hatBlock('mk_on_gesture', [icon('ghost'), b('mk_play_melody', { f: { MEL: 'alarm' } }), b('mk_clear')], { G: 'shake' }),
      hatBlock('mk_on_logo', [b('mk_play_note', { f: { NOTE: 'Sol', BEATS: '1' } })], { EV: 'touch' }),
    ]),
  },
  {
    id: 'radyo-sohbet',
    en: { title: 'Radio chat', description: 'Two cards in the same group. Press A on one and a heart shows on the other; press B and a happy face shows.', tryIt: 'Add the second card, then press a button on one.' },
    title: 'Radyo sohbet',
    description: 'İki kart aynı grupta. Birinde A\'ya basınca kalp, B\'ye basınca mutlu yüz diğerinde görünür.',
    cards: 2,
    tryIt: 'İkinci kartı ekle, birinde düğmeye bas.',
    build: () => project('Radyo sohbet', [
      onStart(b('mk_radio_group', { i: { G: 5 } }), icon('smallHeart')),
      onButton('A', [b('mk_radio_send_number', { i: { VALUE: 1 } })]),
      onButton('B', [b('mk_radio_send_number', { i: { VALUE: 2 } })]),
      hatBlock('mk_on_radio', [
        ifThen(cmp('EQ', b('mk_radio_recv', { f: { KIND: 'number' } }), 1), [icon('heart')], [icon('happy')]),
        pause(1000), icon('smallHeart'),
      ]),
    ]),
  },
  {
    id: 'ses-olcer',
    en: { title: 'Sound meter', description: 'The bar fills up as the room gets louder.', tryIt: 'Move the sound slider.' },
    title: 'Ses ölçer',
    description: 'Ortamdaki ses yükseldikçe çubuk dolar.',
    tryIt: 'Ses kaydırıcısını oynat.',
    build: () => project('Ses ölçer', [
      forever(b('mk_show_bar', { i: { V: b('mk_sound'), MAX: 255 } })),
    ]),
  },
  {
    id: 'gece-lambasi',
    en: { title: 'Night light', description: 'All LEDs light up when it gets dark and turn off when it gets bright.', tryIt: 'Turn the light slider down.' },
    title: 'Gece lambası',
    description: 'Ortam kararınca tüm LED\'ler yanar, aydınlanınca söner.',
    tryIt: 'Işık kaydırıcısını azalt.',
    build: () => project('Gece lambası', [
      forever(ifThen(cmp('LT', b('mk_light'), 50), [b('mk_show_leds', { f: { LEDS: '1'.repeat(25) } })], [b('mk_clear')])),
    ]),
  },
  {
    id: 'tepki-oyunu',
    en: { title: 'Reaction game', description: 'Press A and wait; when the icon appears, press B as fast as you can. Your time shows in ms.', tryIt: 'Press A, wait for the icon, press B.' },
    title: 'Tepki oyunu',
    description: 'A\'ya bas ve bekle; simge çıkınca B\'ye olabildiğince çabuk bas. Süren ms olarak görünür.',
    tryIt: 'A\'ya bas, simgeyi bekle, B\'ye bas.',
    build: () => project('Tepki oyunu', [
      onStart(setVar('durum', 0), b('mk_show_text', { i: { TEXT: 'A' } })),
      onButton('A', [
        ifThen(cmp('EQ', getVar('durum'), 0), [
          setVar('durum', 1), b('mk_clear'), pause(randomInt(1000, 3000)),
          setVar('baslangic', b('mk_runtime')), icon('target'), setVar('durum', 2),
        ]),
      ]),
      onButton('B', [
        ifThen(cmp('EQ', getVar('durum'), 2), [setVar('durum', 0), num(arith('MINUS', b('mk_runtime'), getVar('baslangic')))]),
      ]),
    ]),
  },
  {
    id: 'mesaj-listesi',
    en: { title: 'Message list', description: 'Each time you press A, the next message in the list scrolls by. Uses a list and a function.', tryIt: 'Press button A a few times.' },
    title: 'Mesaj listesi',
    description: 'A\'ya her basışta listedeki sıradaki mesaj kayarak görünür. Liste ve fonksiyon kullanır.',
    tryIt: 'A düğmesine birkaç kez bas.',
    build: () => project('Mesaj listesi', [
      funcDef('sonraki', [], [
        b('mk_show_text', { i: { TEXT: b('mk_list_get', { i: { LIST: getVar('mesajlar'), INDEX: getVar('sira') } }) } }),
        setVar('sira', b('math_modulo', { i: { DIVIDEND: arith('ADD', getVar('sira'), 1), DIVISOR: b('mk_list_length', { i: { LIST: getVar('mesajlar') } }) } })),
      ]),
      onStart(setVar('mesajlar', listOf('Merhaba', 'Selam', 'Hoşgeldin')), setVar('sira', 0)),
      onButton('A', [callFunc('sonraki')]),
    ]),
  },
  {
    id: 'pin-servo',
    en: { title: 'Pin and servo', description: 'The analog value on pin P1 sets the angle of the servo on pin P0.', tryIt: 'Move the P1 analog slider and watch the servo dial.' },
    title: 'Pin ve servo',
    description: 'P1 pinindeki analog değer, P0 pinindeki servonun açısını belirler.',
    tryIt: 'P1 analog kaydırıcısını oynat, servo kadranına bak.',
    build: () => project('Pin ve servo', [
      forever(b('mk_pin_servo', { f: { PIN: 'P0' }, i: { ANGLE: b('mk_map', { i: { V: b('mk_pin_aread', { f: { PIN: 'P1' } }), A: 0, B: 1023, C: 0, D: 180 } }) } })),
      hatBlock('mk_on_pin', [b('mk_pin_dwrite', { f: { PIN: 'P2' }, i: { VALUE: 1 } }), icon('yes')], { PIN: 'P2', EV: 'touch' }),
      hatBlock('mk_on_pin', [b('mk_pin_dwrite', { f: { PIN: 'P2' }, i: { VALUE: 0 } }), b('mk_clear')], { PIN: 'P2', EV: 'release' }),
    ]),
  },
]

export const EXAMPLE_BY_ID: Record<string, MikroExample> = Object.fromEntries(EXAMPLES.map((e) => [e.id, e]))

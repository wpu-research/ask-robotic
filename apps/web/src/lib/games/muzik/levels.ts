// Müzik oyunu: 10 seviye (basit melodi kopyalama → besteleme). Hedefler ve çözümler aynı kısa nota yazımından türer.
import { b, program, seq, type ProgramBlock, type ProgramState } from '../program'
import type { LevelDef } from '../types'
import { noteType } from './blocks'
import type { CopyData, FreeData } from './engine'
import { eventsOf, parseTokens, SOLFEGE, type Inst } from './notes'

const HAT = b('muzik_basla')
const START: ProgramState = program(HAT)

/** Kısa nota yazımından blok listesi. */
export function noteBlocks(src: string): ProgramBlock[] {
  return parseTokens(src).map((k) => {
    const fields = { DUR: String(k.dur) }
    if (k.name === '-') return b('muzik_sus', fields)
    const id = SOLFEGE.find((s) => s.name === k.name)!.id
    return b(noteType(id), { OCT: String(k.oct), ...fields })
  })
}
const chain = (...parts: (string | ProgramBlock)[]): ProgramBlock =>
  seq(...parts.flatMap((p) => (typeof p === 'string' ? noteBlocks(p) : [p])))
const song = (...parts: (string | ProgramBlock)[]): ProgramState => program(seq(HAT, chain(...parts)))
const repeat = (n: number, ...parts: (string | ProgramBlock)[]): ProgramBlock => b('controls_repeat_ext', {}, { TIMES: n, DO: chain(...parts) })
const instr = (i: Inst): ProgramBlock => b('muzik_enstruman', { INST: i })
const parallel = (a: ProgramBlock, c: ProgramBlock): ProgramBlock => b('muzik_es_zamanli', {}, { A: a, B: c })

const copy = (target: ReturnType<typeof eventsOf>, checkInst = false): CopyData => ({ kind: 'copy', target, checkInst })
const times = (n: number, s: string) => Array(n).fill(s).join(' ')

const ALL_NOTES = SOLFEGE.map((s) => noteType(s.id))
const notes3 = ALL_NOTES.slice(0, 3)
const notes5 = ALL_NOTES.slice(0, 5)

// L7: işlev ezgisi
const EZGI = 'Do Re Mi Fa Mi Re'
const fnDef = b('procedures_defnoreturn', { NAME: 'ezgi' }, { STACK: chain(EZGI) })
const fnCall = () => b('procedures_callnoreturn', { NAME: 'ezgi' })

// L8-L9
const MEL8 = 'Do Re Mi Fa Sol Fa Mi Re'
const BAS8 = 'Do,:4 Sol,:4'

const FREE: FreeData = {
  kind: 'free',
  min: { notes: 12, pitches: 5, channels: 2, instruments: 2 },
  goalText: 'En az 12 nota · 5 farklı nota · 2 kanal · 2 enstrüman',
}

export const levels: LevelDef[] = [
  {
    id: 1,
    intro: 'Sahnedeki "Hedefi dinle" düğmesine bas ve duyduğun melodiyi çal: önce Do, sonra Re, sonra Mi.',
    hint: 'Nota bloklarını "çalmaya başla" bloğunun altına sırayla yapıştır, sonra yeşil Çalıştır düğmesine bas.',
    en: { intro: 'Press the "Listen to the target" button on the stage and play the melody you hear: first C, then D, then E.', hint: 'Stick the note blocks under the "start playing" block in order, then press the green Run button.' },
    maxBlocks: 3,
    toolbox: notes3,
    startBlocks: START,
    data: copy(eventsOf('Do Re Mi')),
    solution: song('Do Re Mi'),
  },
  {
    id: 2,
    intro: 'Bu sefer melodi daha uzun: Mi Mi Fa Sol Sol Fa Mi Re. Dinle, sonra aynısını çal.',
    hint: 'Melodi yukarı çıkıyor, sonra aşağı iniyor. Notaların adı blokların üzerinde yazıyor.',
    en: { intro: 'This time the melody is longer: E E F G G F E D. Listen, then play the same thing.', hint: 'The melody goes up, then comes back down. The note names are written on the blocks.' },
    maxBlocks: 8,
    toolbox: ALL_NOTES,
    startBlocks: START,
    data: copy(eventsOf('Mi Mi Fa Sol Sol Fa Mi Re')),
    solution: song('Mi Mi Fa Sol Sol Fa Mi Re'),
  },
  {
    id: 3,
    intro: 'Notaların süresi var! Bazıları uzun çalar, bazı yerlerde sessizlik var. Dinle ve aynısını yap.',
    hint: 'Süreyi nota bloğundaki menüden seç: Sol "yarım", son La "tam". Sessizlik için "sus" bloğunu kullan.',
    en: { intro: 'Notes have lengths! Some play for a long time, and in some places there is silence. Listen and do the same.', hint: 'Pick the length from the menu on the note block: G is "half", the last A is "whole". Use the "rest" block for silence.' },
    maxBlocks: 7,
    toolbox: [...ALL_NOTES, 'muzik_sus'],
    startBlocks: START,
    data: copy(eventsOf('Do Do Sol:2 -:1 La La Sol:4')),
    solution: song('Do Do Sol:2 -:1 La La Sol:4'),
  },
  {
    id: 4,
    intro: 'Aynı dört nota art arda dört kere çalıyor. Çok blok kullanmadan "tekrarla" ile yap.',
    hint: 'Dört notayı bir "tekrarla" bloğunun içine koy ve sayıyı 4 yap.',
    en: { intro: 'The same four notes play four times in a row. Use "repeat" so you don\'t need lots of blocks.', hint: 'Put the four notes inside a "repeat" block and set the number to 4.' },
    maxBlocks: 5,
    toolbox: [...notes5, 'controls_repeat_ext'],
    startBlocks: START,
    data: copy(eventsOf(times(4, 'Do Mi Sol Mi'))),
    solution: song(repeat(4, 'Do Mi Sol Mi')),
  },
  {
    id: 5,
    intro: 'Bu şarkıyı flütle çal! Önce "enstrüman" bloğunu ekle, sonra melodiyi sırala.',
    hint: 'Enstrüman bloğunu "çalmaya başla"nın hemen altına koy ve menüden "flüt" seç. Bütün notalar flütle çalınır.',
    en: { intro: 'Play this song on the flute! First add the "instrument" block, then line up the melody.', hint: 'Put the instrument block right under "start playing" and choose "flute" from the menu. All the notes are played on the flute.' },
    maxBlocks: 15,
    toolbox: [...ALL_NOTES, 'muzik_enstruman'],
    startBlocks: START,
    data: copy(eventsOf('Mi Re Do Re Mi Mi Mi:2 Re Re Re:2 Mi Sol Sol:2', { i: 'flut' }), true),
    solution: song(instr('flut'), 'Mi Re Do Re Mi Mi Mi:2 Re Re Re:2 Mi Sol Sol:2'),
  },
  {
    id: 6,
    intro: 'Şarkıda iki ezgi var ve ikisi de ikişer kere çalıyor. İki "tekrarla" bloğuyla yaz.',
    hint: 'Önce Do Re Mi Do dörtlüsünü 2 kere tekrarla. Sonra Mi Fa ve uzun Sol için ikinci bir tekrarla bloğu al.',
    en: { intro: 'The song has two tunes, and each one plays twice. Write it with two "repeat" blocks.', hint: 'First repeat the four notes C D E C 2 times. Then take a second repeat block for E F and a long G.' },
    maxBlocks: 9,
    toolbox: [...ALL_NOTES, 'controls_repeat_ext'],
    startBlocks: START,
    data: copy(eventsOf(`${times(2, 'Do Re Mi Do')} ${times(2, 'Mi Fa Sol:2')}`)),
    solution: song(repeat(2, 'Do Re Mi Do'), repeat(2, 'Mi Fa Sol:2')),
  },
  {
    id: 7,
    intro: 'Aynı ezgi şarkıda üç kere geçiyor. Bir "işlev" (fonksiyon) yaz ve gerektiğinde çağır.',
    hint: 'İşlevler kategorisinden tanım bloğunu al ve içine Do Re Mi Fa Mi Re notalarını koy. Sonra çağırma bloğunu üç kez kullan, arasına uzun Sol ve La koy.',
    en: { intro: 'The same tune appears three times in the song. Write a "function" and call it whenever you need it.', hint: 'Take the definition block from the Functions category and put the notes C D E F E D inside. Then use the call block three times, with a long G and a long A in between.' },
    maxBlocks: 13,
    toolbox: [...ALL_NOTES, 'procedures_defnoreturn', 'procedures_callnoreturn'],
    startBlocks: START,
    data: copy(eventsOf(`${EZGI} Sol:2 ${EZGI} La:2 ${EZGI}`)),
    solution: program(fnDef, seq(HAT, fnCall(), ...noteBlocks('Sol:2'), fnCall(), ...noteBlocks('La:2'), fnCall())),
  },
  {
    id: 8,
    intro: 'İki kanal birlikte çalsın! 1. kanalda melodi, 2. kanalda altta uzun iki bas nota çalsın.',
    hint: '"Aynı anda çal" bloğunun 1. kanalına melodiyi, 2. kanalına iki uzun alçak notayı koy. Alçak notayı nota bloğundaki "alçak" menüsüyle seç.',
    en: { intro: 'Let two channels play together! Channel 1 plays the melody, and channel 2 plays two long bass notes underneath.', hint: 'Put the melody in channel 1 of the "play together" block and two long low notes in channel 2. Choose the low note with the "low" menu on the note block.' },
    maxBlocks: 12,
    toolbox: [...ALL_NOTES, 'muzik_es_zamanli'],
    startBlocks: START,
    data: copy([...eventsOf(MEL8), ...eventsOf(BAS8, { ch: 1 })]),
    solution: program(seq(HAT, parallel(chain(MEL8), chain(BAS8)))),
  },
  {
    id: 9,
    intro: 'Küçük bir orkestra kur: 1. kanalda keman melodiyi, 2. kanalda zil alçak Do notasını çalsın.',
    hint: 'Her kanalın başına kendi enstrüman bloğunu koy. Notalar "tekrarla" ile kısalır: melodi 2 kere, zil 4 kere.',
    en: { intro: 'Make a little orchestra: on channel 1 a violin plays the melody, on channel 2 a bell plays a low C.', hint: 'Put an instrument block at the start of each channel. "repeat" makes it shorter: the melody 2 times, the bell 4 times.' },
    maxBlocks: 10,
    toolbox: [...ALL_NOTES, 'muzik_enstruman', 'controls_repeat_ext', 'muzik_es_zamanli'],
    startBlocks: START,
    data: copy([...eventsOf(times(2, 'Mi Sol La Sol'), { i: 'keman' }), ...eventsOf(times(4, 'Do,:2'), { i: 'zil', ch: 1 })], true),
    solution: program(seq(HAT, parallel(chain(instr('keman'), repeat(2, 'Mi Sol La Sol')), chain(instr('zil'), repeat(4, 'Do,:2'))))),
  },
  {
    id: 10,
    intro: 'Sıra sende: kendi şarkını besteler! En az 12 nota, 5 farklı nota, 2 kanal ve 2 enstrüman kullan.',
    hint: 'Aklına gelen bir ezgiyi "tekrarla" ile uzat, "aynı anda çal" ile eşlik ekle ve kanallara farklı enstrümanlar ver.',
    en: { intro: 'Your turn: compose your own song! Use at least 12 notes, 5 different notes, 2 channels and 2 instruments.', hint: 'Make a tune longer with "repeat", add an accompaniment with "play together" and give the channels different instruments.' },
    toolbox: [...ALL_NOTES, 'muzik_sus', 'muzik_enstruman', 'controls_repeat_ext', 'muzik_es_zamanli', 'procedures_defnoreturn', 'procedures_callnoreturn'],
    startBlocks: START,
    data: FREE,
    solution: program(seq(HAT, parallel(
      chain(instr('keman'), repeat(2, 'Do Mi Sol La Sol Mi:2')),
      chain(instr('piyano'), repeat(3, "Do,:4 Sol,:2")),
    ))),
  },
]

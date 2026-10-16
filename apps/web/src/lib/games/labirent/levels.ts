import { b, program, seq } from '../program'
import type { LevelDef } from '../types'
import type { MazeData } from './engine'

const START = program(b('labirent_basla'))
/** Çözüm: başlık bloğunun altına bağlı yığın. */
const solve = (...blocks: ReturnType<typeof b>[]) => program(seq(b('labirent_basla'), ...blocks))

const ILERI = b('labirent_ileri')
const SOL = b('labirent_sol')
const SAG = b('labirent_sag')
const forward = (n: number) => Array.from({ length: n }, () => b('labirent_ileri'))
const hedefeKadar = (...body: ReturnType<typeof b>[]) => b('labirent_hedefe_kadar', {}, { DO: seq(...body) })
const eger = (dir: 'AHEAD' | 'LEFT' | 'RIGHT', ...body: ReturnType<typeof b>[]) => b('labirent_eger', { DIR: dir }, { DO: seq(...body) })
const egerDegilse = (dir: 'AHEAD' | 'LEFT' | 'RIGHT', yes: ReturnType<typeof b>[], no: ReturnType<typeof b>[]) =>
  b('labirent_eger_degilse', { DIR: dir }, { DO: seq(...yes), ELSE: seq(...no) })

/** Sol el kuralı: duvardan elini ayırma. */
const solEl = () => solve(hedefeKadar(eger('LEFT', b('labirent_sol')), egerDegilse('AHEAD', [b('labirent_ileri')], [b('labirent_sag')])))

const lvl = (id: number, o: Omit<LevelDef, 'id' | 'startBlocks'> & { data: MazeData }): LevelDef => ({ id, startBlocks: START, ...o })

export const labirentLevels: LevelDef[] = [
  // 1-2: dizi (sıra) kavramı
  lvl(1, {
    intro: 'Küçük yolcu çıkış bayrağına gitmek istiyor. "ileri git" bloklarını ▶ başla bloğunun altına dizerek onu bayrağa ulaştır!',
    hint: 'Her "ileri git" bloğu yolcuyu bir kare ilerletir. Bayrağa kadar kaç kare olduğunu say.',
    en: { intro: 'The little traveler wants to reach the finish flag. Line up "move forward" blocks under the ▶ start block to get them to the flag!', hint: 'Each "move forward" block moves the traveler one square. Count how many squares it is to the flag.' },
    toolbox: ['labirent_ileri'],
    data: { dir: 1, grid: ['#######', '#######', '#S...G#', '#######', '#######'] },
    solution: solve(...forward(4)),
  }),
  lvl(2, {
    intro: 'Yol bir köşede dönüyor. Yolcunun köşede "sağa dön" demesi gerekiyor. Sıra çok önemli!',
    hint: 'Önce üç kare ilerle, sonra sağa dön, sonra iki kare daha ilerle.',
    en: { intro: 'The path turns at a corner. The traveler needs to "turn right" at the corner. Order matters a lot!', hint: 'First move forward three squares, then turn right, then move forward two more squares.' },
    maxBlocks: 8,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag'],
    data: { dir: 1, grid: ['######', '#S...#', '####.#', '####G#', '######'] },
    solution: solve(...forward(3), SAG, ...forward(2)),
  }),
  // 3-4: döngüler
  lvl(3, {
    intro: 'Merdiven gibi bir yol! Aynı hareketleri tekrar tekrar yazmak yerine "tekrarla" bloğunu kullan.',
    hint: 'Bir basamak şu: ileri, sağa dön, ileri, sola dön. Bu dört bloğu "tekrarla" içine koy ve kaç basamak olduğunu say.',
    en: { intro: 'A path like a staircase! Instead of writing the same moves again and again, use the "repeat" block.', hint: 'One step is: forward, turn right, forward, turn left. Put these four blocks inside "repeat" and count the steps.' },
    maxBlocks: 6,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag', 'controls_repeat_ext'],
    data: { dir: 1, grid: ['#######', '#S.####', '##..###', '###..##', '####..#', '#####G#', '#######'] },
    solution: solve(b('controls_repeat_ext', {}, { TIMES: 4, DO: seq(ILERI, SAG, ILERI, SOL) })),
  }),
  lvl(4, {
    intro: 'Bu merdiven daha uzun ve basamak sayısını saymak zor. Yeni blok: "hedefe varana kadar tekrarla"!',
    hint: 'Bu sefer basamak yukarı çıkıyor: ileri, sola dön, ileri, sağa dön. Hepsini yeni döngü bloğunun içine koy.',
    en: { intro: 'This staircase is longer and the steps are hard to count. New block: "repeat until goal"!', hint: 'This time the stairs go up: forward, turn left, forward, turn right. Put them all inside the new loop block.' },
    maxBlocks: 6,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag', 'labirent_hedefe_kadar'],
    data: { dir: 1, grid: ['########', '######G#', '#####..#', '####..##', '###..###', '##..####', '#S.#####', '########'] },
    solution: solve(hedefeKadar(ILERI, SOL, ILERI, SAG)),
  }),
  // 5-7: koşullar
  lvl(5, {
    intro: 'Yolcu artık yolun nereye döndüğünü görebiliyor! "eğer solda yol varsa" bloğunu kullan: yol sola dönüyorsa dönsün, sonra ilerlesin.',
    hint: 'Döngünün içine önce "eğer solda yol varsa → sola dön" koy, hemen altına "ileri git" ekle.',
    en: { intro: 'Now the traveler can see where the path turns! Use the "if path to the left" block: if the path turns left, turn, then move forward.', hint: 'Inside the loop, first put "if path to the left → turn left", and right below it add "move forward".' },
    maxBlocks: 5,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_hedefe_kadar', 'labirent_eger'],
    data: { dir: 1, grid: ['########', '##.....#', '##.###.#', '##.###.#', '##G###.#', '######.#', '#S.....#', '########'] },
    solution: solve(hedefeKadar(eger('LEFT', SOL), ILERI)),
  }),
  lvl(6, {
    intro: 'Bu yol sağa doğru kıvrılıyor. "Eğer önde yol varsa ... değilse ..." bloğuyla yolcu önü kapalıysa sağa dönsün.',
    hint: '"Eğer önde yol varsa" ise ileri git, "değilse" sağa dön. Hepsini hedefe varana kadar tekrarla.',
    en: { intro: 'This path curves to the right. With the "if path ahead ... else ..." block, the traveler turns right when the way ahead is blocked.', hint: '"If path ahead", move forward; "else", turn right. Repeat it all until the goal.' },
    maxBlocks: 5,
    toolbox: ['labirent_ileri', 'labirent_sag', 'labirent_hedefe_kadar', 'labirent_eger_degilse'],
    data: { dir: 1, grid: ['########', '#S.....#', '######.#', '##G###.#', '##.###.#', '##.###.#', '##.....#', '########'] },
    solution: solve(hedefeKadar(egerDegilse('AHEAD', [ILERI], [SAG]))),
  }),
  lvl(7, {
    intro: 'Çıkmaz sokaklar var! Ünlü bir hile: sol elini hep duvarda tut. Sol tarafta yol açılırsa dön, önün açıksa ilerle, değilse sağa dön.',
    hint: 'Döngü içinde iki koşul var. Birincisi: eğer solda yol varsa sola dön. İkincisi: eğer önde yol varsa ileri git, değilse sağa dön.',
    en: { intro: 'There are dead ends! A famous trick: always keep your left hand on the wall. If a path opens on the left, turn; if the way ahead is open, move forward; else turn right.', hint: 'There are two conditions inside the loop. First: if path to the left, turn left. Second: if path ahead, move forward, else turn right.' },
    maxBlocks: 6,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag', 'labirent_hedefe_kadar', 'labirent_eger', 'labirent_eger_degilse'],
    data: { dir: 1, grid: ['########', '######G#', '##.###.#', '##.....#', '######.#', '###.##.#', '#S.....#', '########'] },
    solution: solEl(),
  }),
  // 8-10: karmaşık labirentler
  lvl(8, {
    intro: 'Gerçek bir labirent! Aynı sol el kuralı bütün labirentlerde işe yarar. Yeterince az blokla çöz.',
    hint: 'Yedinci seviyedeki programı hatırla: döngü, eğer solda yol varsa sola dön, eğer önde yol varsa ileri değilse sağa dön.',
    en: { intro: 'A real maze! The same left-hand rule works in every maze. Solve it with few enough blocks.', hint: 'Remember the program from level seven: a loop, if path to the left turn left, if path ahead move forward else turn right.' },
    maxBlocks: 7,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag', 'labirent_hedefe_kadar', 'labirent_eger', 'labirent_eger_degilse'],
    data: { dir: 1, grid: ['#########', '#.......#', '###.###.#', '#...#G#.#', '#.###.#.#', '#...#.#.#', '###.#.#.#', '#S..#...#', '#########'] },
    solution: solEl(),
  }),
  lvl(9, {
    intro: 'Daha büyük bir labirent ve çıkış çok uzakta. Tek bir akıllı program hepsini çözer.',
    hint: 'Programın kısa kalmalı. Yolcu sürekli sola dönmeyi dene, olmazsa ilerlesin, olmazsa sağa dönsün.',
    en: { intro: 'A bigger maze, and the exit is far away. One smart program solves it all.', hint: 'Keep your program short. The traveler always tries to turn left first; if not, moves forward; if not, turns right.' },
    maxBlocks: 7,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag', 'labirent_hedefe_kadar', 'labirent_eger', 'labirent_eger_degilse'],
    data: { dir: 1, grid: ['###########', '#S........#', '#########.#', '#...#.....#', '#.#.#.#####', '#.#.#...#.#', '#.#.###.#.#', '#.#...#...#', '#.###.###.#', '#..G#.....#', '###########'] },
    solution: solEl(),
  }),
  lvl(10, {
    intro: 'Son labirent! Yolcu karşı köşeden başlıyor ve bayrak labirentin ortalarında saklı. Öğrendiğin her şeyi kullan.',
    hint: 'Başlangıç yönü farklı ama program aynı: sol elini duvardan ayırma!',
    en: { intro: 'The last maze! The traveler starts in the opposite corner and the flag is hidden in the middle. Use everything you learned.', hint: 'The starting direction is different, but the program is the same: keep your left hand on the wall!' },
    maxBlocks: 7,
    toolbox: ['labirent_ileri', 'labirent_sol', 'labirent_sag', 'labirent_hedefe_kadar', 'labirent_eger', 'labirent_eger_degilse'],
    data: { dir: 3, grid: ['#############', '#.#.........#', '#.#.#.#####.#', '#...#...#...#', '#.#####.#####', '#.#.#...#...#', '#.#.#.###.#.#', '#...#.....#.#', '###.#######.#', '#...#G..#...#', '#.#####.#.###', '#.......#..S#', '#############'] },
    solution: solEl(),
  }),
]

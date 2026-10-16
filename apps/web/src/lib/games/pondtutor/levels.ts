import { b, program, seq, varField, type ProgramBlock } from '../program'
import type { LevelDef } from '../types'
import type { PondLevelData } from './world'

const swim = (dir: number, speed = 100) => b('pt_swim', { DIR: dir, SPEED: speed })
const wait = (n: number) => b('pt_wait', { N: n })
const cannon = (deg: number, range: number) => b('pt_cannon', { DEG: deg, RANGE: range })
const cannonE = (deg: ProgramBlock, range: ProgramBlock) => b('pt_cannon_e', {}, { DEG: deg, RANGE: range })
const scan = (deg: number | ProgramBlock) => b('pt_scan', {}, { DEG: deg })
const iv = () => b('variables_get', { VAR: varField('i') })
const forever = (body: ProgramBlock) => b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true, DO: body })
const sweep = (from: number, to: number, body: ProgramBlock) => b('controls_for', { VAR: varField('i') }, { FROM: from, TO: to, BY: 10, DO: body })
const ifFound = (then: ProgramBlock) => b('controls_if', {}, { IF0: b('logic_compare', { OP: 'LT' }, { A: scan(iv()), B: 100 }), DO0: then })
/** "Tara, bulursan ateş et, bekle" döngüsünün gövdesi. */
const scanShoot = () => seq(ifFound(cannonE(iv(), scan(iv()))), wait(1))

const base = { health: 100 }

// L9: aynı program, yalnız tarama aralığı yanlış (rakip yukarı-solda).
const l9Prog = (from: number, to: number) => program(forever(sweep(from, to, scanShoot())))

export const pondtutorLevels: LevelDef[] = [
  {
    id: 1,
    intro: 'Gölet Eğitmenine hoş geldin! Sarı ördeğini sağdaki yeşil yaprağa yüzdür. "yüz" bloğu ördeğe yön ve hız verir (0 = sağa). Ördek hareket ederken zamanın geçmesi için "bekle" bloğu gerekir.',
    hint: 'Önce "yüz yön 0 hız 100" koy, sonra altına "bekle" ekle. Ördek yaprağa varmadan program biterse bekleme sayısını artır.',
    en: { intro: 'Welcome to Pond Tutor! Swim your yellow duck to the green leaf on the right. The "swim" block gives the duck a direction and a speed (0 = right). While the duck is moving, you need a "wait" block so time can pass.', hint: 'First put "swim direction 0 speed 100", then add "wait" under it. If the program ends before the duck reaches the leaf, make the wait number bigger.' },
    maxBlocks: 2,
    toolbox: ['pt_swim', 'pt_wait'],
    data: { ...base, start: { x: 10, y: 50 }, goal: 'reach', target: { x: 70, y: 50, r: 8 }, maxTicks: 200 } satisfies PondLevelData,
    solution: program(seq(swim(0, 100), wait(30))),
  },
  {
    id: 2,
    intro: 'Yaprak bu kez sağ üst köşede. Yönler: 0 sağ, 90 yukarı, 180 sol, 270 aşağı. Ördeği çapraz yüzdürmek için ikisinin ortasını seç.',
    hint: 'Sol alttan sağ üste doğru çapraz yön 45 derecedir. Uzak olduğu için uzun beklemen gerekir.',
    en: { intro: 'This time the leaf is in the top right corner. Directions: 0 right, 90 up, 180 left, 270 down. To swim diagonally, pick the one in between.', hint: 'Diagonally from the bottom left to the top right is 45 degrees. It\'s far away, so you need to wait a long time.' },
    maxBlocks: 2,
    toolbox: ['pt_swim', 'pt_wait'],
    data: { ...base, start: { x: 10, y: 10 }, goal: 'reach', target: { x: 70, y: 70, r: 8 }, maxTicks: 250 } satisfies PondLevelData,
    solution: program(seq(swim(45, 100), wait(40))),
  },
  {
    id: 3,
    intro: 'Ortadaki kaya yolunu kapatıyor! Çarparsan hasar alırsın, çarpma hızına göre can gider. Kayanın etrafından dolaşıp sağdaki yaprağa var.',
    hint: 'Önce yukarı doğru çapraz git, sonra düz sağa, sonra aşağı doğru çapraz. Her yön değişikliğinden sonra bir "bekle" gerekir.',
    en: { intro: 'A rock in the middle blocks the way! If you bump into it you get hurt, and you lose health depending on how fast you hit it. Swim around the rock and reach the leaf on the right.', hint: 'First go diagonally up, then straight right, then diagonally down. You need a "wait" after each change of direction.' },
    maxBlocks: 6,
    toolbox: ['pt_swim', 'pt_wait', 'pt_stop'],
    data: { ...base, start: { x: 10, y: 50 }, goal: 'reach', target: { x: 90, y: 50, r: 8 }, rocks: [{ x: 50, y: 50, r: 12 }], maxTicks: 300 } satisfies PondLevelData,
    solution: program(seq(swim(45, 100), wait(15), swim(0, 100), wait(20), swim(-45, 100), wait(15))),
  },
  {
    id: 4,
    intro: 'Şimdi savaş zamanı! Sağda 50 birim ötede bir antrenman ördeği duruyor. "top at" bloğu yön ve menzil ister. Topun yere düşüp patlaması için biraz bekle.',
    hint: 'Rakip tam sağda: yön 0. Menzil, aradaki uzaklık: 50. Atıştan sonra "bekle 8" koy ki top varsın.',
    en: { intro: 'Now it\'s battle time! A practice duck is sitting 50 units to the right. The "fire cannon" block needs a direction and a range. Wait a little so the ball can land and explode.', hint: 'The rival is straight to the right: direction 0. The range is the distance between you: 50. Put "wait 8" after the shot so the ball arrives.' },
    maxBlocks: 2,
    toolbox: ['pt_cannon', 'pt_wait'],
    data: { ...base, start: { x: 10, y: 50 }, goal: 'kill', enemy: { x: 60, y: 50, health: 9 }, maxTicks: 100 } satisfies PondLevelData,
    solution: program(seq(cannon(0, 50), wait(8))),
  },
  {
    id: 5,
    intro: 'Bu rakibin canı daha fazla, tek atış yetmez. Top her atıştan sonra yeniden dolmak için 8 adım ister. Aynı atışı tekrarlayan bir döngü kur. Rakip 30 birim sağda, 40 birim yukarıda!',
    hint: 'Yatay 30, dikey 40 ise uzaklık 50, yön yaklaşık 53 derecedir. Gövdesi: "top at 53, 50" ve "bekle 8". Üç kere tekrarla.',
    en: { intro: 'This rival has more health, one shot isn\'t enough. After each shot the cannon needs 8 steps to reload. Build a loop that repeats the same shot. The rival is 30 units to the right and 40 units up!', hint: 'If it\'s 30 across and 40 up, the distance is 50 and the direction is about 53 degrees. Loop body: "fire cannon 53, 50" and "wait 8". Repeat it three times.' },
    maxBlocks: 4,
    toolbox: ['pt_cannon', 'pt_wait', 'controls_repeat_ext'],
    data: { ...base, start: { x: 10, y: 30 }, goal: 'kill', enemy: { x: 40, y: 70, health: 28 }, maxTicks: 200 } satisfies PondLevelData,
    solution: program(b('controls_repeat_ext', {}, { TIMES: 3, DO: seq(cannon(53, 50), wait(8)) })),
  },
  {
    id: 6,
    intro: 'Rakip bu kez nerede olduğunu söylemiyor! "tara" bloğu bir yöne bakar ve orada rakip varsa uzaklığını söyler; yoksa 9999 der. Her yönü (0, 10, 20, ... 350) tara, rakibi bulunca ateş et.',
    hint: 'Sayarak döngü (i değişkeni) kur: i 0\'dan 350\'ye, 10\'ar 10\'ar. İçinde: eğer tara(i) < 100 ise top at(i, tara(i)). Döngüden sonra topun düşmesi için bekle.',
    en: { intro: 'This time the rival doesn\'t say where it is! The "scan" block looks in one direction and tells you the distance if a rival is there; otherwise it says 9999. Scan every direction (0, 10, 20, ... 350) and fire when you find the rival.', hint: 'Build a counting loop (variable i): i from 0 to 350, in steps of 10. Inside: if scan(i) < 100 then fire cannon(i, scan(i)). After the loop, wait so the ball can land.' },
    maxBlocks: 12,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'controls_for', 'controls_if', 'logic_compare', 'variables_get', 'math_number'],
    data: { ...base, start: { x: 50, y: 50 }, goal: 'kill', enemy: { x: 50 + 45 * Math.cos((130 * Math.PI) / 180), y: 50 + 45 * Math.sin((130 * Math.PI) / 180), health: 9 }, maxTicks: 200 } satisfies PondLevelData,
    solution: program(seq(sweep(0, 350, b('controls_if', {}, { IF0: b('logic_compare', { OP: 'LT' }, { A: scan(iv()), B: 100 }), DO0: cannonE(iv(), scan(iv())) })), wait(10))),
  },
  {
    id: 7,
    intro: 'Rakip artık yerinde durmuyor, aşağı yukarı yüzüyor! Tek tarama yetmez: rakip ölene kadar sonsuz bir döngüde tara, bul, ateş et. Rakip sağ tarafta, yaklaşık -40 ile 40 derece arasında.',
    hint: '"tekrarla ... olduğu sürece" bloğuna "doğru" koy, içine -40\'tan 40\'a, 10\'ar 10\'ar sayan bir döngü. Her turda "bekle 1" koymayı unutma, yoksa zaman geçmez.',
    en: { intro: 'The rival doesn\'t stay still any more, it swims up and down! One scan isn\'t enough: scan, find and fire in a forever loop until the rival is gone. The rival is on the right, between about -40 and 40 degrees.', hint: 'Put "true" into the "repeat while" block, and inside it a loop counting from -40 to 40 in steps of 10. Don\'t forget "wait 1" on every turn, or time won\'t pass.' },
    maxBlocks: 14,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'variables_get', 'math_number'],
    data: { ...base, start: { x: 15, y: 50 }, goal: 'kill', enemy: { x: 85, y: 30, health: 28, move: { to: { x: 85, y: 70 }, speed: 15 } }, maxTicks: 500 } satisfies PondLevelData,
    solution: program(forever(sweep(-40, 40, scanShoot()))),
  },
  {
    id: 8,
    intro: 'Rakip artık karşılık veriyor! Her 16 adımda bir sana top atıyor ve canın azalıyor (60 can). Onu senden önce batırmalısın. Önceki seviyedeki tarama ve ateş programı burada da işe yarar.',
    hint: 'Hızlı ol: sallanmadan düzenli tara ve ateş et. Rakip sağda, tam karşıda duruyor.',
    en: { intro: 'The rival fights back now! Every 16 steps it fires at you and your health goes down (60 health). You must sink it before it sinks you. The scan-and-fire program from the last level works here too.', hint: 'Be quick: scan and fire steadily, without hesitating. The rival is on the right, straight ahead.' },
    maxBlocks: 14,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'pt_health', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'variables_get', 'math_number'],
    data: { health: 60, start: { x: 15, y: 50 }, goal: 'kill', enemy: { x: 85, y: 50, health: 28, shoot: { period: 16, err: 6, first: 10 } }, maxTicks: 400 } satisfies PondLevelData,
    solution: program(forever(sweep(-40, 40, scanShoot()))),
  },
  {
    id: 9,
    intro: 'Hata ayıklama! Aşağıdaki program çalışıyor ama yanlış yöne bakıyor. "Kodu göster" ile JavaScript halini oku. Rakip bu kez sol üstte. Tarama aralığını rakibin olduğu yöne göre düzelt.',
    hint: 'Rakip sol yukarıda: yaklaşık 140 derece. Döngünün başlangıç ve bitiş sayılarını 100 ile 180 yap.',
    en: { intro: 'Debugging! The program below works, but it looks the wrong way. Read its JavaScript version with "Show code". This time the rival is in the top left. Fix the scan range to point where the rival is.', hint: 'The rival is up and to the left: about 140 degrees. Make the loop\'s start and end numbers 100 and 180.' },
    maxBlocks: 14,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'pt_health', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'variables_get', 'math_number'],
    data: { health: 60, start: { x: 75, y: 25 }, goal: 'kill', enemy: { x: 30, y: 65, health: 28, shoot: { period: 18, err: 5, first: 12 } }, maxTicks: 400 } satisfies PondLevelData,
    startBlocks: l9Prog(-40, 40),
    solution: l9Prog(100, 180),
  },
  {
    id: 10,
    intro: 'Büyük düello! Rakip hem aşağı yukarı yüzüyor hem de nişan alıp ateş ediyor, üstelik canı fazla. Şimdiye kadar öğrendiklerinle kazan. Kodu göster ile yazdığın programın JavaScript halini de oku!',
    hint: 'Rakip -20 ile 20 derece arasında gidip geliyor. Çok geniş taramak vakit kaybettirir, çok dar taramak rakibi kaçırır. -30 ile 30 arası iyi bir seçim. Yüzerek yer değiştirmek de serbest.',
    en: { intro: 'The big duel! The rival swims up and down and also aims and fires, and it has lots of health. Win with everything you\'ve learned so far. Read the JavaScript version of your program with Show code too!', hint: 'The rival moves between -20 and 20 degrees. Scanning too wide wastes time, scanning too narrow misses the rival. Between -30 and 30 is a good choice. You may also swim to move around.' },
    maxBlocks: 14,
    toolbox: ['pt_swim_e', 'pt_cannon_e', 'pt_scan', 'pt_wait', 'pt_health', 'pt_x', 'pt_y', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'math_arithmetic', 'variables_get', 'math_number'],
    data: { health: 80, start: { x: 15, y: 50 }, goal: 'kill', enemy: { x: 85, y: 30, health: 60, move: { to: { x: 85, y: 70 }, speed: 20 }, shoot: { period: 12, err: 3, first: 8 } }, maxTicks: 600 } satisfies PondLevelData,
    solution: program(forever(sweep(-30, 30, scanShoot()))),
  },
]

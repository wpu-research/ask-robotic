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
    maxBlocks: 2,
    toolbox: ['pt_swim', 'pt_wait'],
    data: { ...base, start: { x: 10, y: 50 }, goal: 'reach', target: { x: 70, y: 50, r: 8 }, maxTicks: 200 } satisfies PondLevelData,
    solution: program(seq(swim(0, 100), wait(30))),
  },
  {
    id: 2,
    intro: 'Yaprak bu kez sağ üst köşede. Yönler: 0 sağ, 90 yukarı, 180 sol, 270 aşağı. Ördeği çapraz yüzdürmek için ikisinin ortasını seç.',
    hint: 'Sol alttan sağ üste doğru çapraz yön 45 derecedir. Uzak olduğu için uzun beklemen gerekir.',
    maxBlocks: 2,
    toolbox: ['pt_swim', 'pt_wait'],
    data: { ...base, start: { x: 10, y: 10 }, goal: 'reach', target: { x: 70, y: 70, r: 8 }, maxTicks: 250 } satisfies PondLevelData,
    solution: program(seq(swim(45, 100), wait(40))),
  },
  {
    id: 3,
    intro: 'Ortadaki kaya yolunu kapatıyor! Çarparsan hasar alırsın, çarpma hızına göre can gider. Kayanın etrafından dolaşıp sağdaki yaprağa var.',
    hint: 'Önce yukarı doğru çapraz git, sonra düz sağa, sonra aşağı doğru çapraz. Her yön değişikliğinden sonra bir "bekle" gerekir.',
    maxBlocks: 6,
    toolbox: ['pt_swim', 'pt_wait', 'pt_stop'],
    data: { ...base, start: { x: 10, y: 50 }, goal: 'reach', target: { x: 90, y: 50, r: 8 }, rocks: [{ x: 50, y: 50, r: 12 }], maxTicks: 300 } satisfies PondLevelData,
    solution: program(seq(swim(45, 100), wait(15), swim(0, 100), wait(20), swim(-45, 100), wait(15))),
  },
  {
    id: 4,
    intro: 'Şimdi savaş zamanı! Sağda 50 birim ötede bir antrenman ördeği duruyor. "top at" bloğu yön ve menzil ister. Topun yere düşüp patlaması için biraz bekle.',
    hint: 'Rakip tam sağda: yön 0. Menzil, aradaki uzaklık: 50. Atıştan sonra "bekle 8" koy ki top varsın.',
    maxBlocks: 2,
    toolbox: ['pt_cannon', 'pt_wait'],
    data: { ...base, start: { x: 10, y: 50 }, goal: 'kill', enemy: { x: 60, y: 50, health: 9 }, maxTicks: 100 } satisfies PondLevelData,
    solution: program(seq(cannon(0, 50), wait(8))),
  },
  {
    id: 5,
    intro: 'Bu rakibin canı daha fazla, tek atış yetmez. Top her atıştan sonra yeniden dolmak için 8 adım ister. Aynı atışı tekrarlayan bir döngü kur. Rakip 30 birim sağda, 40 birim yukarıda!',
    hint: 'Yatay 30, dikey 40 ise uzaklık 50, yön yaklaşık 53 derecedir. Gövdesi: "top at 53, 50" ve "bekle 8". Üç kere tekrarla.',
    maxBlocks: 4,
    toolbox: ['pt_cannon', 'pt_wait', 'controls_repeat_ext'],
    data: { ...base, start: { x: 10, y: 30 }, goal: 'kill', enemy: { x: 40, y: 70, health: 28 }, maxTicks: 200 } satisfies PondLevelData,
    solution: program(b('controls_repeat_ext', {}, { TIMES: 3, DO: seq(cannon(53, 50), wait(8)) })),
  },
  {
    id: 6,
    intro: 'Rakip bu kez nerede olduğunu söylemiyor! "tara" bloğu bir yöne bakar ve orada rakip varsa uzaklığını söyler; yoksa 9999 der. Her yönü (0, 10, 20, ... 350) tara, rakibi bulunca ateş et.',
    hint: 'Sayarak döngü (i değişkeni) kur: i 0\'dan 350\'ye, 10\'ar 10\'ar. İçinde: eğer tara(i) < 100 ise top at(i, tara(i)). Döngüden sonra topun düşmesi için bekle.',
    maxBlocks: 12,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'controls_for', 'controls_if', 'logic_compare', 'variables_get', 'math_number'],
    data: { ...base, start: { x: 50, y: 50 }, goal: 'kill', enemy: { x: 50 + 45 * Math.cos((130 * Math.PI) / 180), y: 50 + 45 * Math.sin((130 * Math.PI) / 180), health: 9 }, maxTicks: 200 } satisfies PondLevelData,
    solution: program(seq(sweep(0, 350, b('controls_if', {}, { IF0: b('logic_compare', { OP: 'LT' }, { A: scan(iv()), B: 100 }), DO0: cannonE(iv(), scan(iv())) })), wait(10))),
  },
  {
    id: 7,
    intro: 'Rakip artık yerinde durmuyor, aşağı yukarı yüzüyor! Tek tarama yetmez: rakip ölene kadar sonsuz bir döngüde tara, bul, ateş et. Rakip sağ tarafta, yaklaşık -40 ile 40 derece arasında.',
    hint: '"tekrarla ... olduğu sürece" bloğuna "doğru" koy, içine -40\'tan 40\'a, 10\'ar 10\'ar sayan bir döngü. Her turda "bekle 1" koymayı unutma, yoksa zaman geçmez.',
    maxBlocks: 14,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'variables_get', 'math_number'],
    data: { ...base, start: { x: 15, y: 50 }, goal: 'kill', enemy: { x: 85, y: 30, health: 28, move: { to: { x: 85, y: 70 }, speed: 15 } }, maxTicks: 500 } satisfies PondLevelData,
    solution: program(forever(sweep(-40, 40, scanShoot()))),
  },
  {
    id: 8,
    intro: 'Rakip artık karşılık veriyor! Her 16 adımda bir sana top atıyor ve canın azalıyor (60 can). Onu senden önce batırmalısın. Önceki seviyedeki tarama ve ateş programı burada da işe yarar.',
    hint: 'Hızlı ol: sallanmadan düzenli tara ve ateş et. Rakip sağda, tam karşıda duruyor.',
    maxBlocks: 14,
    toolbox: ['pt_cannon_e', 'pt_scan', 'pt_wait', 'pt_health', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'variables_get', 'math_number'],
    data: { health: 60, start: { x: 15, y: 50 }, goal: 'kill', enemy: { x: 85, y: 50, health: 28, shoot: { period: 16, err: 6, first: 10 } }, maxTicks: 400 } satisfies PondLevelData,
    solution: program(forever(sweep(-40, 40, scanShoot()))),
  },
  {
    id: 9,
    intro: 'Hata ayıklama! Aşağıdaki program çalışıyor ama yanlış yöne bakıyor. "Kodu göster" ile JavaScript halini oku. Rakip bu kez sol üstte. Tarama aralığını rakibin olduğu yöne göre düzelt.',
    hint: 'Rakip sol yukarıda: yaklaşık 140 derece. Döngünün başlangıç ve bitiş sayılarını 100 ile 180 yap.',
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
    maxBlocks: 14,
    toolbox: ['pt_swim_e', 'pt_cannon_e', 'pt_scan', 'pt_wait', 'pt_health', 'pt_x', 'pt_y', 'controls_whileUntil', 'controls_for', 'controls_if', 'logic_compare', 'logic_boolean', 'math_arithmetic', 'variables_get', 'math_number'],
    data: { health: 80, start: { x: 15, y: 50 }, goal: 'kill', enemy: { x: 85, y: 30, health: 60, move: { to: { x: 85, y: 70 }, speed: 20 }, shoot: { period: 12, err: 3, first: 8 } }, maxTicks: 600 } satisfies PondLevelData,
    solution: program(forever(sweep(-30, 30, scanShoot()))),
  },
]

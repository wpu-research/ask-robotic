// Dönüşen Robot görevleri: her model için 2-3 kısa görev. Hedefler modelin kinematik durumundan ve günlüğünden denetlenir.
// `handScript`: değerlendirmede (ve arayüzde "otomatik el" açıkken) elin zamanla nasıl yaklaşıp uzaklaştığı. `solution` testte çalıştırılır.
import type { ActivityEn, MikroActivity } from './activity'
import { evaluateGoals, usesBlocks, type GoalCtx, type GoalStatus, type MikroGoal } from './goals'
import { b, cmp, forever, ifThen, onStart, project, repeat } from './program'
import { DonusenBot, type CraneLoad, type DonusenModelId } from './donusen'
import { Simulation } from './sim'
import type { MikroProject, PBlock } from './types'

export interface DonusenMission extends MikroActivity {
  id: string
  title: string
  model: DonusenModelId
  runMs: number
  en: ActivityEn & { title: string }
  loads?: CraneLoad[]
  handScript?: (tMs: number) => number
}

// ---------------- blok kısayolları ----------------
export const walk = (steps: number, dir: 'forward' | 'back' = 'forward') => b('dn_walk', { f: { DIR: dir }, i: { STEPS: steps } })
export const wave = (arm: 'left' | 'right' | 'both') => b('dn_wave', { f: { ARM: arm } })
export const turnAround = () => b('dn_turn_around')
export const say = (text: string) => b('dn_say', { i: { TEXT: text } })
export const drive = (cm: number, dir: 'forward' | 'back' = 'forward') => b('dn_drive', { f: { DIR: dir }, i: { CM: cm } })
export const pose = (p: 'otur' | 'kalk') => b('dn_pose', { f: { POSE: p } })
export const tail = (n: number) => b('dn_tail', { i: { N: n } })
export const strum = () => b('dn_strum')
export const boom = (deg: number) => b('dn_boom', { i: { DEG: deg } })
export const hook = (d: 'down' | 'up') => b('dn_hook', { f: { UPDOWN: d } })
export const grab = (a: 'grab' | 'release') => b('dn_grab', { f: { ACTION: a } })
export const dist = () => b('dn_distance')
const until = (cond: PBlock, body: PBlock[] = []) => b('controls_whileUntil', { f: { MODE: 'UNTIL' }, i: { BOOL: cond }, s: { DO: body } })

const botOf = (c: GoalCtx): DonusenBot | null => c.sim?.device.donusen ?? null
const goal = (id: string, text: string, check: (r: DonusenBot) => boolean, hint?: string): MikroGoal =>
  ({ id, text, hint, check: (c) => { const r = botOf(c); return !!r && check(r) } })

const BASE = ['mk_on_start', 'mk_forever', 'mk_pause', 'mk_show_icon', 'mk_clear', 'mk_play_note', 'dn_say']
/** El yaklaşır (3-6 sn arası 6 cm), sonra uzaklaşır. */
const handNearMid = (t: number) => (t >= 3000 && t < 6000 ? 6 : 60)
/** El uzaktan başlar, 1,5-7,5 sn arası 34 cm'den 4 cm'ye yaklaşır, sonra uzaklaşır. */
const handSweep = (t: number) => (t < 1500 || t >= 7500 ? 80 : Math.round(34 - ((t - 1500) / 6000) * 30))
const crate = (id: string, angle: number, color: string): CraneLoad => ({ id, angle, color, lifted: false })

export const DONUSEN_MISSIONS: DonusenMission[] = [
  // ---------------- İnsansı Robot ----------------
  {
    id: 'merhaba',
    model: 'insansi',
    title: 'Merhaba de',
    en: {
      title: 'Say hello',
      intro: 'Your humanoid robot meets someone new. Make it wave its right arm and say hello with the speech bubble.',
      goals: { salla: { text: 'Wave an arm' }, konus: { text: 'Say something in the speech bubble', hint: 'First the "wave arm" block, then the "say" block.' } },
    },
    intro: 'İnsansı robotun yeni biriyle tanışıyor. Sağ kolunu sallasın ve konuşma balonuyla "Merhaba!" desin.',
    runMs: 6000,
    allowedBlocks: [...BASE, 'dn_wave', 'dn_walk'],
    starter: () => project('Merhaba', [onStart()]),
    goals: [
      goal('salla', 'Kolunu salla', (r) => r.waves >= 1),
      goal('konus', 'Konuşma balonunda bir şey söyle', (r) => r.said.some((s) => s.text.trim() !== ''), 'Önce "kolunu salla", sonra "de" bloğu.'),
    ],
    solution: () => project('Merhaba', [onStart(wave('right'), say('Merhaba!'))]),
  },
  {
    id: 'duvara-yuru',
    model: 'insansi',
    title: 'Duvara kadar yürü',
    en: {
      title: 'Walk to the wall',
      intro: 'The wall is 150 cm away. Walk one step at a time and use the distance sensor on the head: stop when the wall is closer than 20 cm and say "Stop!". Don\'t bump into it.',
      goals: {
        sensor: { text: 'Use the "distance (cm)" block' },
        dur: { text: 'Stop 5-25 cm from the wall without bumping', hint: 'Repeat until the distance is less than 20: walk 1 step.' },
        konus: { text: 'Say something when you stop' },
      },
    },
    intro: 'Duvar 150 cm ileride. Adım adım yürü ve başındaki mesafe sensörünü kullan: duvar 20 cm\'den yakın olunca dur ve "Dur!" de. Duvara çarpma.',
    runMs: 15000,
    allowedBlocks: [...BASE, 'dn_walk', 'dn_wave', 'dn_distance', 'controls_whileUntil', 'controls_repeat_ext', 'controls_if', 'logic_compare'],
    starter: () => project('Duvara yürü', [onStart()]),
    goals: [
      usesBlocks('sensor', '"mesafe (cm)" bloğunu kullan', ['dn_distance']),
      goal('dur', 'Duvara 5-25 cm kala, çarpmadan dur', (r) => !r.bumped && r.distanceCm >= 5 && r.distanceCm <= 25, '"Mesafe 20\'den küçük olana kadar tekrarla": 1 adım yürü.'),
      goal('konus', 'Durunca bir şey söyle', (r) => r.said.some((s) => s.t > 0 && r.distanceCm <= 25)),
    ],
    solution: () => project('Duvara yürü', [onStart(until(cmp('LT', dist(), 20), [walk(1)]), say('Dur!'))]),
  },
  {
    id: 'dans',
    model: 'insansi',
    title: 'Dans et',
    en: {
      title: 'Dance',
      intro: 'Make up a dance: wave the left arm, wave the right arm, turn around. Do it 3 times, but write the moves only once.',
      goals: { tekrar: { text: 'Use the "repeat times" block' }, figur: { text: 'At least 6 arm waves and 3 turns', hint: 'Put wave left, wave right and turn around inside "repeat 3 times".' } },
    },
    intro: 'Bir dans uydur: sol kolunu salla, sağ kolunu salla, arkanı dön. Bunu 3 kez yap, ama hareketleri yalnız bir kez yaz.',
    runMs: 15000,
    allowedBlocks: [...BASE, 'dn_wave', 'dn_turn_around', 'dn_walk', 'controls_repeat_ext'],
    starter: () => project('Dans', [onStart()]),
    goals: [
      usesBlocks('tekrar', '"kez tekrarla" bloğunu kullan', ['controls_repeat_ext']),
      goal('figur', 'En az 6 kol sallama ve 3 dönüş', (r) => r.waves >= 6 && r.turns >= 3, 'Sol salla, sağ salla ve arkanı dön bloklarını "3 kez tekrarla"nın içine koy.'),
    ],
    solution: () => project('Dans', [onStart(repeat(3, [wave('left'), wave('right'), turnAround()]))]),
  },
  // ---------------- Robot Kedi ----------------
  {
    id: 'sev-beni',
    model: 'kedi',
    title: 'Sev beni',
    en: {
      title: 'Pet me',
      intro: 'When your hand comes closer than 10 cm, the robot cat should meow and wag its tail. When the hand is far away, it stays quiet.',
      goals: {
        miyav: { text: 'Meow when the hand is close', hint: 'Forever: if the distance is less than 10, say "Meow" and wag the tail 2 times.' },
        kuyruk: { text: 'Wag the tail' },
        sessiz: { text: 'Stay quiet while the hand is far away' },
      },
    },
    intro: 'Elin 10 cm\'den yakına gelince robot kedi miyavlasın ve kuyruğunu sallasın. El uzaktayken sessiz kalsın.',
    runMs: 9000,
    handScript: handNearMid,
    allowedBlocks: [...BASE, 'dn_tail', 'dn_pose', 'dn_distance', 'controls_if', 'logic_compare'],
    starter: () => project('Sev beni', [forever()]),
    goals: [
      goal('miyav', 'El yakındayken miyavla', (r) => r.said.some((s) => s.hand < 10), 'Sürekli: mesafe 10\'dan küçükse "Miyav" de ve kuyruğunu 2 kez salla.'),
      goal('kuyruk', 'Kuyruğunu salla', (r) => r.tailWags >= 1),
      goal('sessiz', 'El uzaktayken sessiz kal', (r) => r.said.length > 0 && r.said.every((s) => s.hand < 10)),
    ],
    solution: () => project('Sev beni', [forever(ifThen(cmp('LT', dist(), 10), [say('Miyav'), tail(2)]))]),
  },
  {
    id: 'otur-kalk',
    model: 'kedi',
    title: 'Otur ve kalk',
    en: {
      title: 'Sit and stand',
      intro: 'Teach the cat a trick: while the hand is close (less than 10 cm) it sits; when the hand goes away, it stands up.',
      goals: {
        otur: { text: 'Sit while the hand is close' },
        kalk: { text: 'Stand up after the hand goes away', hint: 'Use "if ... else": if the distance is less than 10, sit; otherwise stand.' },
      },
    },
    intro: 'Kediye bir numara öğret: el yakındayken (10 cm\'den az) otursun; el uzaklaşınca kalksın.',
    runMs: 9000,
    handScript: handNearMid,
    allowedBlocks: [...BASE, 'dn_tail', 'dn_pose', 'dn_distance', 'controls_if', 'logic_compare'],
    starter: () => project('Otur kalk', [forever()]),
    goals: [
      goal('otur', 'El yakındayken otur', (r) => r.poseLog.some((p) => p.pose === 'otur' && p.hand < 10)),
      goal('kalk', 'El uzaklaşınca kalk', (r) => {
        const sat = r.poseLog.findIndex((p) => p.pose === 'otur' && p.hand < 10)
        return sat >= 0 && r.poseLog.slice(sat).some((p) => p.pose === 'kalk' && p.hand >= 10) && r.pose === 'kalk'
      }, '"Eğer ... değilse" kullan: mesafe 10\'dan küçükse otur, değilse kalk.'),
    ],
    solution: () => project('Otur kalk', [forever(ifThen(cmp('LT', dist(), 10), [pose('otur')], [pose('kalk')]))]),
  },
  // ---------------- Gezgin Araç ----------------
  {
    id: 'garaja-sur',
    model: 'arac',
    title: 'Garaja sür',
    en: {
      title: 'Drive to the garage',
      intro: 'The garage starts 75 cm ahead and is 10 cm long. Drive the car into the garage and stop there.',
      goals: { garaj: { text: 'Stop inside the garage (75-85 cm)', hint: 'One "drive forward 80 cm" block is enough.' } },
    },
    intro: 'Garaj 75 cm ileride başlıyor ve 10 cm uzunluğunda. Aracı garaja sür ve orada dur.',
    runMs: 10000,
    allowedBlocks: [...BASE, 'dn_drive', 'dn_turn_around'],
    starter: () => project('Garaj', [onStart()]),
    goals: [goal('garaj', 'Garajın içinde dur (75-85 cm)', (r) => r.x >= 75 && r.x <= 85, 'Bir tane "ileri 80 cm sür" bloğu yeter.')],
    solution: () => project('Garaj', [onStart(drive(80))]),
  },
  {
    id: 'git-gel',
    model: 'arac',
    title: 'Git ve geri gel',
    en: {
      title: 'There and back',
      intro: 'Drive to the wall and stop before you touch it (closer than 15 cm), turn around and drive back the same way into the home garage behind the start. Use the distance sensor both ways.',
      goals: {
        duvar: { text: 'Get within 30 cm of the wall' },
        geri: { text: 'Turn around and stop in the home garage without bumping', hint: 'Repeat until the distance is less than 15: drive 5 cm. Then turn around and do the same again.' },
      },
    },
    intro: 'Duvara kadar sür, değmeden (15 cm\'den yakında) dur, arkanı dön ve aynı yoldan başlangıcın arkasındaki ev garajına geri sür. Mesafe sensörünü iki yönde de kullan.',
    runMs: 20000,
    allowedBlocks: [...BASE, 'dn_drive', 'dn_turn_around', 'dn_distance', 'controls_whileUntil', 'controls_repeat_ext', 'controls_if', 'logic_compare'],
    starter: () => project('Git gel', [onStart()]),
    goals: [
      goal('duvar', 'Duvara 30 cm\'den fazla yaklaş', (r) => r.maxX >= 150 - 30 - 6),
      goal('geri', 'Arkanı dön ve çarpmadan ev garajında dur', (r) => r.turns >= 1 && !r.bumped && r.x <= -8 && r.x >= -32,
        '"Mesafe 15\'ten küçük olana kadar tekrarla": 5 cm sür. Sonra arkanı dön ve aynısını yap.'),
    ],
    solution: () => {
      const toWall = () => until(cmp('LT', dist(), 15), [drive(5)])
      return project('Git gel', [onStart(toWall(), turnAround(), toWall())])
    },
  },
  // ---------------- Müzik Aleti ----------------
  {
    id: 'ilk-notalar',
    model: 'muzik',
    title: 'İlk notalar',
    en: {
      title: 'First notes',
      intro: 'Strum the string 4 times. Use the repeat block instead of writing the same block four times.',
      goals: { tekrar: { text: 'Use the "repeat times" block' }, cal: { text: 'Strum the string at least 4 times', hint: 'Put "strum the string" inside "repeat 4 times".' } },
    },
    intro: 'Teli 4 kez çal. Aynı bloğu dört kez yazmak yerine tekrarla bloğunu kullan.',
    runMs: 6000,
    allowedBlocks: [...BASE, 'dn_strum', 'controls_repeat_ext'],
    starter: () => project('İlk notalar', [onStart()]),
    goals: [
      usesBlocks('tekrar', '"kez tekrarla" bloğunu kullan', ['controls_repeat_ext']),
      goal('cal', 'Teli en az 4 kez çal', (r) => r.strums.length >= 4, '"Teli çal" bloğunu "4 kez tekrarla"nın içine koy.'),
    ],
    solution: () => project('İlk notalar', [onStart(repeat(4, [strum()]))]),
  },
  {
    id: 'mesafe-calgisi',
    model: 'muzik',
    title: 'Mesafe çalgısı',
    en: {
      title: 'Distance instrument',
      intro: 'Play without touching! When the hand is closer than 40 cm, strum the string; the note depends on how close the hand is. When the hand is far away, stay silent.',
      goals: {
        uc: { text: 'Play at least 3 different notes', hint: 'Forever: if the distance is less than 40, strum the string.' },
        sessiz: { text: 'Stay silent while the hand is far away' },
      },
    },
    intro: 'Dokunmadan çal! El 40 cm\'den yakınken teli çal; nota elin ne kadar yakın olduğuna göre değişir. El uzaktayken sessiz kal.',
    runMs: 9000,
    handScript: handSweep,
    allowedBlocks: [...BASE, 'dn_strum', 'dn_distance', 'controls_if', 'logic_compare', 'controls_whileUntil'],
    starter: () => project('Mesafe çalgısı', [forever()]),
    goals: [
      goal('uc', 'En az 3 farklı nota çal', (r) => new Set(r.strums.map((s) => s.freq)).size >= 3, 'Sürekli: mesafe 40\'tan küçükse teli çal.'),
      goal('sessiz', 'El uzaktayken sessiz kal', (r) => r.strums.length > 0 && r.strums.every((s) => s.hand < 40)),
    ],
    solution: () => project('Mesafe çalgısı', [forever(ifThen(cmp('LT', dist(), 40), [strum()]))]),
  },
  // ---------------- Vinç ----------------
  {
    id: 'yuk-tasi',
    model: 'vinc',
    title: 'Yükü taşı',
    en: {
      title: 'Move the load',
      intro: 'The orange crate is at 0 degrees, the unloading area is at 165-180 degrees. Turn the arm to the crate, lower the hook, grab it, raise it, carry it to the area and drop it. Raise the hook at the end.',
      goals: {
        tasi: { text: 'Drop the crate in the unloading area', hint: 'Arm to 0 → hook down → grab → hook up → arm to 180 → hook down → release.' },
        kanca: { text: 'Raise the hook at the end' },
      },
    },
    intro: 'Turuncu kasa 0 derecede, boşaltma alanı 165-180 derecede. Kolu kasaya çevir, kancayı indir, tut, kaldır, alana taşı ve bırak. Sonunda kancayı yukarı al.',
    runMs: 15000,
    loads: [crate('y1', 0, '#f97316')],
    allowedBlocks: [...BASE, 'dn_boom', 'dn_hook', 'dn_grab', 'controls_repeat_ext'],
    starter: () => project('Yükü taşı', [onStart()]),
    goals: [
      goal('tasi', 'Kasayı boşaltma alanına bırak', (r) => r.loadOnPad('y1'), 'Kol 0 → kanca aşağı → tut → kanca yukarı → kol 180 → kanca aşağı → bırak.'),
      goal('kanca', 'Sonunda kancayı yukarı al', (r) => r.loadOnPad('y1') && r.hook === 0),
    ],
    solution: () => project('Yükü taşı', [onStart(boom(0), hook('down'), grab('grab'), hook('up'), boom(180), hook('down'), grab('release'), hook('up'))]),
  },
  {
    id: 'iki-yuk',
    model: 'vinc',
    title: 'İki yükü taşı',
    en: {
      title: 'Move two loads',
      intro: 'Now there are two crates: at 0 and 40 degrees. Carry both to the unloading area (165-180 degrees). Tip: you can write the carrying steps once as a function and use it for each crate.',
      goals: {
        bir: { text: 'The first crate is in the unloading area' },
        iki: { text: 'The second crate is in the unloading area', hint: 'Same steps as before, once with the arm at 0 and once at 40 degrees.' },
      },
    },
    intro: 'Şimdi iki kasa var: 0 ve 40 derecede. İkisini de boşaltma alanına (165-180 derece) taşı. İpucu: taşıma adımlarını bir kez işlev olarak yazıp her kasa için kullanabilirsin.',
    runMs: 30000,
    loads: [crate('y1', 0, '#f97316'), crate('y2', 40, '#8b5cf6')],
    allowedBlocks: [...BASE, 'dn_boom', 'dn_hook', 'dn_grab', 'controls_repeat_ext', 'procedures_defnoreturn', 'variables_get', 'variables_set'],
    starter: () => project('İki yük', [onStart()]),
    goals: [
      goal('bir', 'Birinci kasa boşaltma alanında', (r) => r.loadOnPad('y1')),
      goal('iki', 'İkinci kasa boşaltma alanında', (r) => r.loadOnPad('y2'), 'Önceki adımların aynısı: bir kez kol 0\'dayken, bir kez 40 derecedeyken.'),
    ],
    solution: () => {
      const carry = (from: number, to: number) => [boom(from), hook('down'), grab('grab'), hook('up'), boom(to), hook('down'), grab('release'), hook('up')]
      return project('İki yük', [onStart(...carry(0, 180), ...carry(40, 170))])
    },
  },
]

export const DONUSEN_MISSION_BY_ID: Record<string, DonusenMission> = Object.fromEntries(DONUSEN_MISSIONS.map((m) => [m.id, m]))
export const missionsOf = (model: DonusenModelId) => DONUSEN_MISSIONS.filter((m) => m.model === model)

/** Benzetim kurulumu (arayüz ve testler aynısını kullanır). */
export const donusenSetup = (model: DonusenModelId, m?: DonusenMission | null) => ({ model, loads: m?.loads, handScript: m?.handScript })

/** Projeyi görevin kurulumunda başsız çalıştırır; program biterse erken bırakır. */
export function runDonusen(m: DonusenMission, p: MikroProject): Simulation {
  const sim = new Simulation(p, { donusen: donusenSetup(m.model, m) })
  sim.start()
  for (let t = 0; t < m.runMs; t += 100) {
    sim.advance(100)
    if (sim.error || !sim.card.runtime.busy) break
  }
  return sim
}

export function evaluateDonusen(m: DonusenMission, p: MikroProject): { status: GoalStatus[]; done: boolean; error: string | null } {
  const sim = runDonusen(m, p)
  const { status } = evaluateGoals(m.goals, { sim, ws: p.workspace })
  return { status, done: status.every((s) => s.done), error: sim.error?.message ?? null }
}

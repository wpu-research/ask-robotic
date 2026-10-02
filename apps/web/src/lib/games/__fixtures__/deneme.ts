// Örnek (referans) oyun: çerçeveyi uçtan uca denemek ve README'deki kalıbı göstermek için. Kayıt defterinde DEĞİLDİR.
// Dünya: tek satırlık yol; robot sağa gider, hedef kareye varmalı.
import { HaltProgram, type RunApi } from '../interpreter'
import { b, program, seq } from '../program'
import type { GameDef, GameRun, LevelDef } from '../types'

export interface DenemeState { pos: number; goal: number; len: number; crashed: boolean }

const makeApi = (st: DenemeState): RunApi => ({
  blocks: {
    deneme_ileri: () => {
      st.pos++
      if (st.pos > st.len - 1) { st.crashed = true; st.pos = st.len - 1; throw new HaltProgram('Yolun dışına çıktın!') }
    },
    deneme_hedefte: () => st.pos === st.goal,
  },
})

export const denemeGame: GameDef<DenemeState> = {
  slug: 'bulmaca', // yalnız tür uyumu için; kayıt defterine konmaz
  title: 'Deneme',
  tagline: 'Çerçeve denemesi.',
  stepDelay: 300,
  speed: { min: 0.5, max: 3, default: 1 },
  blocks: [
    { type: 'deneme_ileri', category: 'Hareket', colour: '#4c97ff', json: { message0: 'ileri git', previousStatement: null, nextStatement: null, tooltip: 'Bir kare ileri' }, js: 'ileri();' },
    { type: 'deneme_hedefte', category: 'Sorgu', colour: '#ffab19', json: { message0: 'hedefte mi?', output: 'Boolean', tooltip: 'Hedefe vardın mı' }, js: 'hedefteMi()' },
  ],
  levels: ([
    { id: 1, intro: 'Robotu 3 kare ilerlet.', hint: 'Bir "tekrarla" bloğu işini kolaylaştırır.', maxBlocks: 2, toolbox: ['deneme_ileri', 'controls_repeat_ext'], data: { goal: 3, len: 6 },
      solution: program(b('controls_repeat_ext', {}, { TIMES: 3, DO: b('deneme_ileri') })) },
    { id: 2, intro: 'Robot hedefe varana kadar ilerlesin.', maxBlocks: 3, toolbox: ['deneme_ileri', 'deneme_hedefte', 'controls_whileUntil', 'logic_negate'], data: { goal: 7, len: 10 },
      solution: program(b('controls_whileUntil', { MODE: 'UNTIL' }, { BOOL: b('deneme_hedefte'), DO: seq(b('deneme_ileri')) })) },
  ] as LevelDef[]).concat(Array.from({ length: 8 }, (_, i): LevelDef => ({
    id: i + 3, intro: `Robotu ${i + 4} kare ilerlet.`, toolbox: ['deneme_ileri', 'controls_repeat_ext'], data: { goal: i + 4, len: 14 },
    solution: program(b('controls_repeat_ext', {}, { TIMES: i + 4, DO: b('deneme_ileri') })),
  }))),
  engine: {
    createRun(level): GameRun<DenemeState> {
      const d = level.data as { goal: number; len: number }
      const st: DenemeState = { pos: 0, goal: d.goal, len: d.len, crashed: false }
      return {
        api: makeApi(st),
        snapshot: () => ({ ...st }),
        evaluate: (r) => (st.pos === st.goal && r.reason === 'finished' ? { ok: true } : { ok: false, message: st.crashed ? 'Yolun dışına çıktın!' : 'Hedefe tam varamadın.' }),
      }
    },
  },
  scene: async () => ({ default: () => null }),
}

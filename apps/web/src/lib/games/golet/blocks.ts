// Gölet blokları (Blockly). Blok kipinde HER EYLEM BLOĞU bir tik sürer: dünya bir adım ilerler, rakipler de kendi hamlesini yapar.
import type { GameBlockDef } from '../types'

const COL = '#3da8d8'
const COL_Q = '#e8a317'

export const goletBlocks: GameBlockDef[] = [
  {
    type: 'golet_yuz', category: 'Gölet', colour: COL,
    json: {
      message0: 'yüz yön %1 ° hız %2 %', args0: [{ type: 'input_value', name: 'DIR', check: 'Number' }, { type: 'input_value', name: 'SPEED', check: 'Number' }],
      inputsInline: true, previousStatement: null, nextStatement: null,
      tooltip: 'Ördeğin verilen yöne ve hızda yüzer. 0° sağ, 90° yukarı, 180° sol, 270° aşağıdır. Hız 0 ile 100 arasındadır.',
    },
    js: 'swim({DIR}, {SPEED});',
  },
  {
    type: 'golet_ates', category: 'Gölet', colour: COL,
    json: {
      message0: 'top at yön %1 ° menzil %2', args0: [{ type: 'input_value', name: 'DIR', check: 'Number' }, { type: 'input_value', name: 'RANGE', check: 'Number' }],
      inputsInline: true, previousStatement: null, nextStatement: null,
      tooltip: 'Top verilen yönde, verilen menzilde patlar (en çok 70). Patlamaya yakın olan ördek hasar alır. Top 16 tikte bir hazır olur; hazır değilken atış boşa gider. Bir tik sürer.',
    },
    js: 'cannon({DIR}, {RANGE});',
  },
  {
    type: 'golet_surekli', category: 'Gölet', colour: '#59c059',
    json: { message0: 'maç bitene kadar tekrarla %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, tooltip: 'İçindeki bloklar maç bitene kadar tekrar tekrar çalışır. Bir turda hiç eylem yoksa ördek bir tik bekler.' },
    js: 'while (true) {\n{DO}}',
  },
  {
    type: 'golet_tara', category: 'Sensörler', colour: COL_Q,
    json: { message0: 'tara yön %1 °', args0: [{ type: 'input_value', name: 'DIR', check: 'Number' }], output: 'Number', tooltip: 'O yöne bakar (5° genişlikte). En yakın rakibin uzaklığını verir; kimse yoksa 999 verir. Bir tik harcamaz.' },
    js: 'scan({DIR})',
  },
  { type: 'golet_can', category: 'Sensörler', colour: COL_Q, json: { message0: 'canım', output: 'Number', tooltip: 'Kalan canın (0–100).' }, js: 'health()' },
  { type: 'golet_x', category: 'Sensörler', colour: COL_Q, json: { message0: 'x konumum', output: 'Number', tooltip: 'Soldan uzaklığın (0–100).' }, js: 'getX()' },
  { type: 'golet_y', category: 'Sensörler', colour: COL_Q, json: { message0: 'y konumum', output: 'Number', tooltip: 'Aşağıdan yüksekliğin (0–100).' }, js: 'getY()' },
  { type: 'golet_hiz', category: 'Sensörler', colour: COL_Q, json: { message0: 'hızım', output: 'Number', tooltip: 'Şu anki hızın (0–100).' }, js: 'speed()' },
]

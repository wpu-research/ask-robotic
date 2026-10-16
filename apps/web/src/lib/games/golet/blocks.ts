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
    en: { category: 'Pond', json: { message0: 'swim direction %1 ° speed %2 %', tooltip: 'Your duck swims in the given direction and speed. 0° is right, 90° up, 180° left, 270° down. Speed is between 0 and 100.' } },
    js: 'swim({DIR}, {SPEED});',
  },
  {
    type: 'golet_ates', category: 'Gölet', colour: COL,
    json: {
      message0: 'top at yön %1 ° menzil %2', args0: [{ type: 'input_value', name: 'DIR', check: 'Number' }, { type: 'input_value', name: 'RANGE', check: 'Number' }],
      inputsInline: true, previousStatement: null, nextStatement: null,
      tooltip: 'Top verilen yönde, verilen menzilde patlar (en çok 70). Patlamaya yakın olan ördek hasar alır. Top 16 tikte bir hazır olur; hazır değilken atış boşa gider. Bir tik sürer.',
    },
    en: { category: 'Pond', json: { message0: 'fire cannon direction %1 ° range %2', tooltip: 'The ball explodes in the given direction at the given range (at most 70). Ducks close to the blast get hurt. The cannon is ready every 16 ticks; shots fired before that are wasted. Takes one tick.' } },
    js: 'cannon({DIR}, {RANGE});',
  },
  {
    type: 'golet_surekli', category: 'Gölet', colour: '#59c059',
    json: { message0: 'maç bitene kadar tekrarla %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, tooltip: 'İçindeki bloklar maç bitene kadar tekrar tekrar çalışır. Bir turda hiç eylem yoksa ördek bir tik bekler.' },
    en: { category: 'Pond', json: { message0: 'repeat until the match ends %1 %2', tooltip: 'The blocks inside run again and again until the match ends. If a round has no action, the duck waits one tick.' } },
    js: 'while (true) {\n{DO}}',
  },
  {
    type: 'golet_tara', category: 'Sensörler', colour: COL_Q,
    json: { message0: 'tara yön %1 °', args0: [{ type: 'input_value', name: 'DIR', check: 'Number' }], output: 'Number', tooltip: 'O yöne bakar (5° genişlikte). En yakın rakibin uzaklığını verir; kimse yoksa 999 verir. Bir tik harcamaz.' },
    en: { category: 'Sensors', json: { message0: 'scan direction %1 °', tooltip: 'Looks in that direction (5° wide). Gives the distance to the nearest rival; if there is nobody, gives 999. Takes no tick.' } },
    js: 'scan({DIR})',
  },
  { type: 'golet_can', category: 'Sensörler', colour: COL_Q, json: { message0: 'canım', output: 'Number', tooltip: 'Kalan canın (0–100).' }, en: { category: 'Sensors', json: { message0: 'my health', tooltip: 'Your remaining health (0–100).' } }, js: 'health()' },
  { type: 'golet_x', category: 'Sensörler', colour: COL_Q, json: { message0: 'x konumum', output: 'Number', tooltip: 'Soldan uzaklığın (0–100).' }, en: { category: 'Sensors', json: { message0: 'my x position', tooltip: 'Your distance from the left (0–100).' } }, js: 'getX()' },
  { type: 'golet_y', category: 'Sensörler', colour: COL_Q, json: { message0: 'y konumum', output: 'Number', tooltip: 'Aşağıdan yüksekliğin (0–100).' }, en: { category: 'Sensors', json: { message0: 'my y position', tooltip: 'Your height from the bottom (0–100).' } }, js: 'getY()' },
  { type: 'golet_hiz', category: 'Sensörler', colour: COL_Q, json: { message0: 'hızım', output: 'Number', tooltip: 'Şu anki hızın (0–100).' }, en: { category: 'Sensors', json: { message0: 'my speed', tooltip: 'Your current speed (0–100).' } }, js: 'speed()' },
]

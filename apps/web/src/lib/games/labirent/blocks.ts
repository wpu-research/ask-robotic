import type { CodeCtx, GameBlockDef } from '../types'

const MOVE = '#4c97ff'
const COND = '#ffab19'
const LOOP = '#59c059'

const DIR_OPTIONS: Array<[string, string]> = [['önde', 'AHEAD'], ['solda', 'LEFT'], ['sağda', 'RIGHT']]
const DIR_JS: Record<string, string> = { AHEAD: 'ahead', LEFT: 'left', RIGHT: 'right' }
const ind = (s: string) => s.split('\n').map((l) => (l ? `  ${l}` : l)).join('\n')

export const labirentBlocks: GameBlockDef[] = [
  { type: 'labirent_basla', category: 'Başla', colour: '#8e6bd8', hat: true,
    json: { message0: '▶ başla', nextStatement: null, tooltip: 'Program buradan başlar. Bloklarını bunun altına bağla.' }, js: '// program başlar' },
  { type: 'labirent_ileri', category: 'Hareket', colour: MOVE,
    json: { message0: 'ileri git', previousStatement: null, nextStatement: null, tooltip: 'Yolcu baktığı yönde bir kare ilerler.' }, js: 'moveForward();' },
  { type: 'labirent_sol', category: 'Hareket', colour: MOVE,
    json: { message0: 'sola dön ↺', previousStatement: null, nextStatement: null, tooltip: 'Yolcu olduğu yerde sola döner.' }, js: 'turnLeft();' },
  { type: 'labirent_sag', category: 'Hareket', colour: MOVE,
    json: { message0: 'sağa dön ↻', previousStatement: null, nextStatement: null, tooltip: 'Yolcu olduğu yerde sağa döner.' }, js: 'turnRight();' },
  { type: 'labirent_hedefe_kadar', category: 'Döngüler', colour: LOOP,
    json: { message0: 'hedefe varana kadar tekrarla', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, tooltip: 'İçindeki bloklar, yolcu hedefe varana kadar tekrar tekrar çalışır.' },
    js: (c: CodeCtx) => `while (!atGoal()) {\n${ind(c.statements('DO'))}}\n` },
  { type: 'labirent_eger', category: 'Koşullar', colour: COND,
    json: { message0: 'eğer %1 yol varsa', args0: [{ type: 'field_dropdown', name: 'DIR', options: DIR_OPTIONS }], message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, tooltip: 'Seçtiğin yönde yol varsa içindeki bloklar çalışır.' },
    js: (c: CodeCtx) => `if (isPath('${DIR_JS[c.field('DIR')] ?? 'ahead'}')) {\n${ind(c.statements('DO'))}}\n` },
  { type: 'labirent_eger_degilse', category: 'Koşullar', colour: COND,
    json: { message0: 'eğer %1 yol varsa', args0: [{ type: 'field_dropdown', name: 'DIR', options: DIR_OPTIONS }], message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], message2: 'değilse', message3: '%1', args3: [{ type: 'input_statement', name: 'ELSE' }], previousStatement: null, nextStatement: null, tooltip: 'Yol varsa üsttekiler, yoksa "değilse" altındakiler çalışır.' },
    js: (c: CodeCtx) => `if (isPath('${DIR_JS[c.field('DIR')] ?? 'ahead'}')) {\n${ind(c.statements('DO'))}} else {\n${ind(c.statements('ELSE'))}}\n` },
]

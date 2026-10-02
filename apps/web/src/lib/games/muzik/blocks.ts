// Müzik oyunu blokları: yedi nota, sus, enstrüman, "aynı anda çal" (çok kanallı) ve başlık.
import type { GameBlockDef } from '../types'
import { INSTRUMENTS, SOLFEGE } from './notes'

const NOTE_COLOUR = '#e0525c'
const DUR_OPTIONS = [['çeyrek (1)', '1'], ['yarım (2)', '2'], ['tam (4)', '4'], ['sekizlik (½)', '0.5']]
const OCT_OPTIONS = [['orta', '4'], ['alçak', '3'], ['tiz', '5']]

export const noteType = (id: string): string => `muzik_${id}`

const noteBlocks: GameBlockDef[] = SOLFEGE.map((s) => ({
  type: noteType(s.id),
  category: 'Notalar',
  colour: NOTE_COLOUR,
  json: {
    message0: `${s.name} %1 %2`,
    args0: [
      { type: 'field_dropdown', name: 'OCT', options: OCT_OPTIONS },
      { type: 'field_dropdown', name: 'DUR', options: DUR_OPTIONS },
    ],
    previousStatement: null,
    nextStatement: null,
    tooltip: `${s.name} notasını çal. Oktavı ve süreyi menüden seç.`,
  },
  js: `nota('${s.name}', {OCT}, {DUR});`,
}))

export const blocks: GameBlockDef[] = [
  { type: 'muzik_basla', category: 'Başla', colour: '#4c97ff', hat: true,
    json: { message0: 'çalmaya başla', nextStatement: null, tooltip: 'Müzik buradan başlar. Notaları bunun altına ekle.' } },
  ...noteBlocks,
  { type: 'muzik_sus', category: 'Notalar', colour: '#8f98ad',
    json: { message0: 'sus %1', args0: [{ type: 'field_dropdown', name: 'DUR', options: DUR_OPTIONS }], previousStatement: null, nextStatement: null, tooltip: 'Bir süre sessiz bekle.' },
    js: 'sus({DUR});' },
  { type: 'muzik_enstruman', category: 'Enstrüman', colour: '#8a63d2',
    json: { message0: 'enstrüman: %1', args0: [{ type: 'field_dropdown', name: 'INST', options: INSTRUMENTS.map((x) => [x.label, x.id]) }], previousStatement: null, nextStatement: null, tooltip: 'Bundan sonraki notalar bu enstrümanla çalınır.' },
    js: "enstruman('{INST}');" },
  { type: 'muzik_es_zamanli', category: 'Kanallar', colour: '#e08a1e',
    json: {
      message0: 'aynı anda çal',
      message1: '1. kanal %1', args1: [{ type: 'input_statement', name: 'A' }],
      message2: '2. kanal %1', args2: [{ type: 'input_statement', name: 'B' }],
      previousStatement: null, nextStatement: null, tooltip: 'İki kanal aynı anda çalar. Biri melodi, öteki eşlik olabilir.',
    },
    js: (c) => `aynıAnda(() => {\n${c.statements('A')}}, () => {\n${c.statements('B')}});\n` },
]

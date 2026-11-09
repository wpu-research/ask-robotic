// Sınav projelerinin ortak yardımcıları: bağlantı denetimleri (öğrencinin parça kimliklerinden bağımsız) ve kod süzgeçleri.
import type { Circuit, PartType } from '@/lib/lab/contract'
import { part, partsOf, pin, unoOnly, UNO_GNDS, wire } from '@/lib/lab/activities/helpers'
import type { ExamGoalCtx } from '../types'

export { part, partsOf, pin, unoOnly, UNO_GNDS, wire }

/** Yorumları siler (kod hedefleri yorum satırlarına kanmasın). */
export const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

export const toGnd = (ctx: ExamGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
export const to5V = (ctx: ExamGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
export const to3V3 = (ctx: ExamGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '3V3'))
export const toUno = (ctx: ExamGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))

/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var. */
export const viaResistor = (ctx: ExamGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)

/** Bir LED, bir direnç üzerinden Uno pinine (A ucu) ve katodu GND'ye bağlı. */
export const ledOnPin = (ctx: ExamGoalCtx, unoPin: string, color?: string) =>
  partsOf(ctx.circuit, 'led').some((l) => (!color || l.props.color === color) && viaResistor(ctx, pin('uno', unoPin), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))

/** İki uçlu anahtar (buton, reed): bir ucu Uno pinine, öbürü GND'ye. */
export const switchOnPin = (ctx: ExamGoalCtx, type: 'button' | 'reed', unoPin: string) =>
  partsOf(ctx.circuit, type).some((b) => (toUno(ctx, b.id, 'A', unoPin) && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', unoPin) && toGnd(ctx, b.id, 'A')))

/** Devrede bu türden en az n parça var. */
export const has = (c: Circuit, type: PartType, n = 1) => partsOf(c, type).length >= n

/** Kodda (yorumlar hariç) desen geçiyor. */
export const codeHas = (ctx: ExamGoalCtx, re: RegExp) => re.test(noComments(ctx.code))

/** Benzetim durumunda bu türdeki ilk parçanın çalışma bilgisi. */
export const rt = (ctx: { lab: ExamGoalCtx['lab']; circuit: Circuit }, type: PartType) => {
  const p = partsOf(ctx.circuit, type)[0]
  return p && ctx.lab ? ctx.lab.parts[p.id] : undefined
}

/** Bağlantı listesinden devre kurar: [['led1.A','uno.D13'], ...] */
export function build(parts: ReturnType<typeof part>[], wires: Array<[string, string]>): Circuit {
  const c = unoOnly()
  c.parts.push(...parts)
  for (const [a, b] of wires) {
    const [pa, qa] = a.split('.'), [pb, qb] = b.split('.')
    c.wires.push(wire(pin(pa, qa), pin(pb, qb)))
  }
  return c
}

/** Boş setup/loop iskeleti ve görev başlığıyla başlangıç kodu. */
export const skeleton = (title: string) => `// ${title}
// Write your solution below. Pins are given in the task description.

void setup() {

}

void loop() {

}
`

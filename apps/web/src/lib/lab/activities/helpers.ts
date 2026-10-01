import type { Circuit, PartInstance, PartType, PinRef, PropValue } from '../contract'

export const UNO: PartInstance = { id: 'uno', type: 'uno', x: 40, y: 40, rotation: 0, props: {} }

/** Yalnızca Uno içeren taze başlangıç devresi. */
export const unoOnly = (): Circuit => ({ parts: [{ ...UNO, props: {} }], wires: [] })

export const partsOf = (c: Circuit, type: PartType) => c.parts.filter((p) => p.type === type)

export const part = (id: string, type: PartType, x: number, y: number, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x, y, rotation: 0, props })

let n = 0
export const wire = (a: PinRef, b: PinRef) => ({ id: `w${++n}`, a, b })
export const pin = (part: string, pin: string): PinRef => ({ part, pin })

/** Bir pin ('GND', 'GND2', 'GND3') Uno'nun toprağı mı. */
export const UNO_GNDS = ['GND', 'GND2', 'GND3']

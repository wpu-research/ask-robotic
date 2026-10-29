// MuRoKo blok programı: Blockly durumundan (JSON) sade bir ağaca ve benzetim saatiyle ilerleyen bir koşucuya.
// Saf modül: Blockly ve DOM yok, bu yüzden birim testle sınanır.

export type Op =
  | { op: 'set'; name: string; value: number }
  | { op: 'wait'; seconds: number }
  | { op: 'repeat'; times: number; body: Op[] }
  | { op: 'forever'; body: Op[] }
  | { op: 'if'; ch: string; cmp: 'lt' | 'gt'; value: number; then: Op[]; else: Op[] }
  /** motor = sensör × k + c: oransal (P) denetimin en yalın hâli. */
  | { op: 'calc'; name: string; ch: string; k: number; c: number }

export const MAX_REPEAT = 100
export const MAX_OPS = 400

interface BlkJson { type?: string; fields?: Record<string, unknown>; inputs?: Record<string, { block?: BlkJson } | undefined>; next?: { block?: BlkJson } }

const num = (v: unknown, d: number) => { const n = Number(v); return Number.isFinite(n) ? n : d }

function chain(first: BlkJson | undefined, budget: { n: number }): Op[] {
  const out: Op[] = []
  for (let b = first; b && budget.n > 0; b = b.next?.block) {
    budget.n--
    const f = b.fields ?? {}
    if (b.type === 'muroko_set') { if (typeof f.U === 'string' && f.U) out.push({ op: 'set', name: f.U, value: num(f.V, 0) }) }
    else if (b.type === 'muroko_wait') out.push({ op: 'wait', seconds: Math.min(60, Math.max(0, num(f.S, 1))) })
    else if (b.type === 'muroko_repeat') out.push({ op: 'repeat', times: Math.min(MAX_REPEAT, Math.max(0, Math.floor(num(f.N, 3)))), body: chain(b.inputs?.DO?.block, budget) })
    else if (b.type === 'muroko_forever') out.push({ op: 'forever', body: chain(b.inputs?.DO?.block, budget) })
    else if (b.type === 'muroko_if') {
      if (typeof f.S === 'string' && f.S) out.push({ op: 'if', ch: f.S, cmp: f.C === 'gt' ? 'gt' : 'lt', value: num(f.V, 0), then: chain(b.inputs?.DO?.block, budget), else: chain(b.inputs?.ELSE?.block, budget) })
    } else if (b.type === 'muroko_calc') {
      if (typeof f.U === 'string' && f.U && typeof f.S === 'string' && f.S) out.push({ op: 'calc', name: f.U, ch: f.S, k: num(f.K, 1), c: num(f.C, 0) })
    }
  }
  return out
}

/** `Blockly.serialization.workspaces.save(ws)` çıktısındaki üst düzey yığınlar → her biri ayrı program. */
export function compileWorkspace(state: unknown): Op[][] {
  const blocks = (state as { blocks?: { blocks?: BlkJson[] } } | null)?.blocks?.blocks ?? []
  const budget = { n: MAX_OPS }
  return blocks.map((b) => chain(b, budget)).filter((p) => p.length > 0)
}

/** Bir programı benzetim zamanına göre ilerletir. `tick` her çağrıda `apply` ile motor değerlerini yazar. */
export class Runner {
  private it: Generator<number, void, void>
  private resumeAt = 0
  done = false
  constructor(prog: Op[], private apply: (name: string, value: number) => void, private read: (ch: string) => number = () => 0) { this.it = this.run(prog) }

  private *run(ops: Op[]): Generator<number, void, void> {
    for (const o of ops) {
      if (o.op === 'set') this.apply(o.name, o.value)
      else if (o.op === 'wait') yield o.seconds
      else if (o.op === 'calc') this.apply(o.name, this.read(o.ch) * o.k + o.c)
      else if (o.op === 'if') { const v = this.read(o.ch); yield* this.run((o.cmp === 'lt' ? v < o.value : v > o.value) ? o.then : o.else) }
      else if (o.op === 'repeat') for (let i = 0; i < o.times; i++) yield* this.run(o.body)
      else if (o.op === 'forever') {
        let spun = false
        for (;;) {
          const before = this.resumeAt
          yield* this.run(o.body)
          // Gövde hiç beklemiyorsa sonsuz döngü takılmasın: bir benzetim adımı bekle
          if (!spun && this.resumeAt === before) spun = true
          if (spun) yield 0.01
        }
      }
    }
  }

  tick(simTime: number) {
    if (this.done) return
    for (let guard = 0; guard < 1000 && simTime >= this.resumeAt; guard++) {
      const r = this.it.next()
      if (r.done) { this.done = true; return }
      this.resumeAt = Math.max(this.resumeAt, simTime) + r.value
    }
  }
}

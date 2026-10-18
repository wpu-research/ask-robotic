// Kesmeler: EXTI hat eşlemesi (SYSCFG_EXTICR), NVIC öncelik gruplaması (STM32'de 4 öncelik biti) ve kesme zaman çizelgesi
// benzetimi: öncelikli kesme (preemption), bekleme (pending), kuyruk zincirleme (tail-chaining). Küçük sayı = yüksek öncelik.
// Saf fonksiyonlar (irq.test.ts).

export type Port = 'A' | 'B' | 'C'
export interface ExtiPin { port: Port; pin: number }
/** EXTI hattı = pin numarası; hangi portun bağlanacağını EXTICR seçer. Aynı numaralı iki pin aynı hattı paylaşamaz. */
export function extiMap(pins: ExtiPin[]): { lines: Record<number, Port>; conflicts: number[]; irqs: string[] } {
  const lines: Record<number, Port> = {}
  const conflicts: number[] = []
  for (const p of pins) {
    if (lines[p.pin] !== undefined && lines[p.pin] !== p.port) { if (!conflicts.includes(p.pin)) conflicts.push(p.pin) } else lines[p.pin] = p.port
  }
  const irqs = [...new Set(Object.keys(lines).map(Number).map(extiIrq))]
  return { lines, conflicts, irqs }
}
/** EXTI0..4 kendi vektörüne sahip; 5–9 ve 10–15 ortak vektördür (işleyicide PR bitine bakılır). */
export const extiIrq = (line: number) => (line <= 4 ? `EXTI${line}_IRQn` : line <= 9 ? 'EXTI9_5_IRQn' : 'EXTI15_10_IRQn')
/** EXTICR yazmacı ve alan değeri: EXTICR[line/4], 4 bitlik alan, port A=0, B=1, C=2. */
export const exticr = (p: ExtiPin) => ({ reg: Math.floor(p.pin / 4) + 1, shift: (p.pin % 4) * 4, value: ['A', 'B', 'C'].indexOf(p.port) })

/** NVIC_PRIORITYGROUP_n: n bit ön alım (preempt), 4−n bit alt öncelik. HAL varsayılanı grup 4 (4 bit preempt). */
export function splitPriority(group: 0 | 1 | 2 | 3 | 4, preempt: number, sub: number): { ok: boolean; raw: number; preempt: number; sub: number } {
  const pb = group, sb = 4 - group
  const ok = preempt < 1 << pb && sub < 1 << sb
  const p = Math.min(preempt, (1 << pb) - 1), s = Math.min(sub, (1 << sb) - 1)
  return { ok, raw: ((p << sb) | s) << 4, preempt: p, sub: s }
}

export interface Irq { name: string; preempt: number; sub: number; dur: number }
export interface IrqReq { at: number; irq: string }
export interface Segment { start: number; end: number; who: string; depth: number }
/** Giriş/çıkış (yığına kaydetme) maliyeti: Cortex-M4 ~12 çevrim; kuyruk zincirlemede 6. Burada zaman birimi µs. */
export interface IrqTiming { entry: number; exit: number; tail: number }
export const M4_TIMING: IrqTiming = { entry: 0.5, exit: 0.5, tail: 0.25 }

/**
 * Kesme benzetimi. Kural: bekleyen bir kesme, ancak preempt önceliği şu anki işleyicininkinden kesin küçükse araya girer.
 * Eşit preempt'te beklerler; hangisinin önce alınacağına alt öncelik, sonra vektör numarası (burada liste sırası) karar verir.
 * Bir işleyici bittiğinde bekleyen varsa ana programa dönmeden ona geçilir (tail-chaining).
 */
export function simulateIrqs(irqs: Irq[], reqs: IrqReq[], horizon: number, tm: IrqTiming = M4_TIMING, dt = 0.05) {
  const byName = new Map(irqs.map((q, i) => [q.name, { ...q, idx: i }]))
  const pending: string[] = []
  const stack: Array<{ name: string; left: number }> = []
  const segs: Segment[] = []
  const latency: Record<string, number[]> = {}
  const reqTimes: Record<string, number[]> = {}
  let overhead = 0
  const pendingSince: Record<string, number> = {}
  const order = (a: string, b: string) => { const A = byName.get(a)!, B = byName.get(b)!; return A.preempt - B.preempt || A.sub - B.sub || A.idx - B.idx }
  const sorted = [...reqs].sort((a, b) => a.at - b.at)
  let ri = 0, t = 0, lost = 0
  let cur = 'main', curStart = 0, curDepth = 0
  const switchTo = (who: string, depth: number) => { if (who !== cur || depth !== curDepth) { if (t > curStart) segs.push({ start: curStart, end: t, who: cur, depth: curDepth }); cur = who; curStart = t; curDepth = depth } }
  while (t < horizon - 1e-9) {
    while (ri < sorted.length && sorted[ri].at <= t + 1e-9) {
      const n = sorted[ri].irq
      if (!byName.has(n)) { ri++; continue }
      // Aynı kesme zaten bekliyorsa ikinci istek kaybolur (pending biti tek bittir)
      if (pending.includes(n)) lost++
      else { pending.push(n); pendingSince[n] = sorted[ri].at; (reqTimes[n] ??= []).push(sorted[ri].at) }
      ri++
    }
    pending.sort(order)
    const top = stack[stack.length - 1]
    const cand = pending[0]
    if (cand && (!top || byName.get(cand)!.preempt < byName.get(top.name)!.preempt)) {
      pending.shift()
      const cost = tm.entry
      ;(latency[cand] ??= []).push(t - pendingSince[cand] + cost)
      overhead += cost
      stack.push({ name: cand, left: byName.get(cand)!.dur + cost })
    }
    const run = stack[stack.length - 1]
    switchTo(run ? run.name : 'main', stack.length)
    if (run) {
      run.left -= dt
      if (run.left <= 1e-9) {
        stack.pop()
        // Kuyruk zincirleme: bekleyen ve yığındakinden yüksek öncelikli kesme varsa çıkış/giriş yerine kısa geçiş
        pending.sort(order)
        const below = stack[stack.length - 1]
        const next = pending[0]
        if (next && (!below || byName.get(next)!.preempt < byName.get(below.name)!.preempt)) {
          pending.shift()
          ;(latency[next] ??= []).push(t + dt - pendingSince[next] + tm.tail)
          overhead += tm.tail
          stack.push({ name: next, left: byName.get(next)!.dur + tm.tail })
        } else { overhead += tm.exit; if (below) below.left += tm.exit }
      }
    }
    t = Math.round((t + dt) * 1e6) / 1e6
  }
  switchTo('end', 0)
  const maxDepth = Math.max(0, ...segs.map((s) => s.depth))
  return { segs, latency, lost, overhead, maxDepth, reqTimes }
}

/** İşleyicide uzun iş yapma: bu kadar µs süren işleyici, periyodu p olan kesmeyi kaçırır mı? */
export const missesEvents = (handlerUs: number, periodUs: number) => handlerUs >= periodUs

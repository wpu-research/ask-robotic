// Grafik için zaman çizgisi: sabit uzunlukta halka tampon, her kanal için (t, değer). Saf modül.

export class Trace {
  private t: number[] = []
  private v: Record<string, number[]> = {}
  constructor(public window = 10, public maxPoints = 600) {}

  push(time: number, values: Record<string, number>) {
    this.t.push(time)
    for (const k in values) (this.v[k] ??= []).push(values[k])
    // pencere dışına çıkanları at
    while (this.t.length > 1 && time - this.t[0] > this.window) this.shift()
    while (this.t.length > this.maxPoints) this.shift()
  }
  private shift() { this.t.shift(); for (const k in this.v) this.v[k].shift() }
  get times(): readonly number[] { return this.t }
  series(name: string): readonly number[] { return this.v[name] ?? [] }
  get names(): string[] { return Object.keys(this.v) }
  clear() { this.t = []; this.v = {} }
  /** Seçili kanalların ortak değer aralığı (grafik ekseni); düz çizgide aralık açılır. */
  range(names: string[]): [number, number] {
    let lo = Infinity, hi = -Infinity
    for (const n of names) for (const x of this.series(n)) { if (Number.isFinite(x)) { if (x < lo) lo = x; if (x > hi) hi = x } }
    if (!Number.isFinite(lo)) return [-1, 1]
    if (hi - lo < 1e-6) return [lo - 0.5, hi + 0.5]
    const pad = (hi - lo) * 0.08
    return [lo - pad, hi + pad]
  }
}

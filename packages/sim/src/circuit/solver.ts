// Doğrusal-parçalı DC çözücü (modified nodal analysis, yoğun matris + kısmi pivotlu Gauss).
// Düğüm 0 = toprak (0 V). Tüm kaynaklar Thevenin (V, R) biçimindedir: ideal kaynak çok küçük seri dirençle modellenir,
// böylece kısa devre matrisi tekil yapmaz.
//
// Doğrusal olmayan / durumlu elemanlar yinelemeyle çözülür:
//  - diyot/LED (`leds`): eşik gerilimli, açık/kapalı.
//  - NPN (`npns`): kapalı / aktif (Ic = β·Ib) / doyumda (VCE = vsat) üç durumlu.
//  - anahtar (`switches`): düğüm gerilimlerinden hesaplanan kapalı/açık (MOSFET, röle kontağı).
//  - mantık çıkışı (`logic`): düğüm gerilimlerinden hesaplanan Thevenin kaynağı ya da yüksek empedans (L293D, 74HC595).

export interface SolverResistor { a: number; b: number; ohms: number }
/** Düğüm ile toprak arasında V gerilimli, R seri dirençli kaynak. */
export interface SolverSource { node: number; volts: number; ohms: number }
/** Eşik gerilimli diyot: A→K iletirken (vA − vK − vf)/rs akımı; yoksa açık devre. */
export interface SolverLed { a: number; k: number; vf: number; rs: number; disabled?: boolean }
/** NPN: B-E bir diyot (vbe, rbe); aktifken C→E akımı β·Ib; doyumda C-E = vsat (rsat). */
export interface SolverNpn { b: number; c: number; e: number; beta: number; vbe: number; rbe: number; vsat: number; rsat: number }
/** Kontrol fonksiyonu düğüm gerilimlerini ve "yüzen" bayraklarını okur. */
export type Ctrl<T> = (v: Float64Array, floating: boolean[]) => T
/** a-b arası anahtar: kapalıysa `ohms`, açıksa açık devre. */
export interface SolverSwitch { a: number; b: number; ohms: number; closed: Ctrl<boolean> }
/** Düğüme bağlı mantık çıkışı: volts sayı ise `ohms` seri dirençli kaynak, null ise yüksek empedans. */
export interface SolverLogic { node: number; ohms: number; drive: Ctrl<number | null> }

export interface SolverInput {
  nodes: number
  resistors: SolverResistor[]
  sources: SolverSource[]
  leds: SolverLed[]
  npns?: SolverNpn[]
  switches?: SolverSwitch[]
  logic?: SolverLogic[]
}

export type NpnState = 'off' | 'active' | 'sat'

export interface SolverResult {
  volts: Float64Array
  /** Her kaynağın düğüme verdiği akım (A): (V − v)/R. */
  sourceAmps: number[]
  /** Her LED'in A'dan K'ye akımı (A); iletmiyorsa 0. */
  ledAmps: number[]
  ledOn: boolean[]
  /** Toprağa hiçbir iletken yolu olmayan (yüzen) düğümler. */
  floating: boolean[]
  npnState: NpnState[]
  /** Taban akımı (B→E) ve kolektör akımı (C→E), A. */
  npnIb: number[]
  npnIc: number[]
  switchClosed: boolean[]
  /** Mantık çıkışının düğüme verdiği akım (A) ve sürdüğü gerilim (null: yüksek empedans). */
  logicAmps: number[]
  logicVolts: Array<number | null>
  iterations: number
}

export const GMIN = 1e-9
export const R_MIN = 0.01

function gauss(a: Float64Array, b: Float64Array, n: number): void {
  for (let c = 0; c < n; c++) {
    let p = c, best = Math.abs(a[c * n + c])
    for (let r = c + 1; r < n; r++) { const v = Math.abs(a[r * n + c]); if (v > best) { best = v; p = r } }
    if (best < 1e-30) { a[c * n + c] = 1e-30; best = 1e-30 }
    if (p !== c) {
      for (let k = c; k < n; k++) { const t = a[c * n + k]; a[c * n + k] = a[p * n + k]; a[p * n + k] = t }
      const t = b[c]; b[c] = b[p]; b[p] = t
    }
    const piv = a[c * n + c]
    for (let r = c + 1; r < n; r++) {
      const f = a[r * n + c] / piv
      if (f === 0) continue
      for (let k = c; k < n; k++) a[r * n + k] -= f * a[c * n + k]
      b[r] -= f * b[c]
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r]
    for (let k = r + 1; k < n; k++) s -= a[r * n + k] * b[k]
    b[r] = s / a[r * n + r]
  }
}

/** Yinelemenin ayrık durumu. npn: 0 kapalı, 1 aktif, 2 doyum. logic: null = yüksek empedans. */
interface State { on: boolean[]; npn: number[]; sw: boolean[]; lg: Array<number | null> }

function solveLinear(inp: SolverInput, st: State): Float64Array {
  const n = inp.nodes - 1 // 0. düğüm (toprak) matriste yok
  const A = new Float64Array(n * n), B = new Float64Array(n)
  const add = (r: number, c: number, g: number): void => { if (r > 0 && c > 0) A[(r - 1) * n + (c - 1)] += g }
  const stampG = (x: number, y: number, g: number): void => {
    add(x, x, g); add(y, y, g)
    add(x, y, -g); add(y, x, -g)
  }
  const inject = (node: number, i: number): void => { if (node > 0) B[node - 1] += i }
  /** a→k eşikli diyot: g·(v_a − v_k − vf) akımı. */
  const stampDiode = (a: number, k: number, vf: number, rs: number): void => {
    const g = 1 / rs
    stampG(a, k, g)
    inject(a, vf * g)
    inject(k, -vf * g)
  }
  for (let i = 1; i < inp.nodes; i++) A[(i - 1) * n + (i - 1)] += GMIN
  for (const r of inp.resistors) stampG(r.a, r.b, 1 / Math.max(r.ohms, R_MIN))
  for (const s of inp.sources) { const g = 1 / Math.max(s.ohms, R_MIN); stampG(s.node, 0, g); inject(s.node, s.volts * g) }
  inp.leds.forEach((l, i) => { if (st.on[i]) stampDiode(l.a, l.k, l.vf, l.rs) })
  ;(inp.npns ?? []).forEach((q, i) => {
    const s = st.npn[i]
    if (s === 0) return
    stampDiode(q.b, q.e, q.vbe, q.rbe)
    if (s === 1) {
      // Ic (C→E) = β·(vb − ve − vbe)/rbe: C düğümünden çıkan, E düğümüne giren akım
      const gm = q.beta / q.rbe
      add(q.c, q.b, gm); add(q.c, q.e, -gm); add(q.e, q.b, -gm); add(q.e, q.e, gm)
      inject(q.c, gm * q.vbe); inject(q.e, -gm * q.vbe)
    } else stampDiode(q.c, q.e, q.vsat, q.rsat)
  })
  ;(inp.switches ?? []).forEach((s, i) => { if (st.sw[i]) stampG(s.a, s.b, 1 / Math.max(s.ohms, R_MIN)) })
  ;(inp.logic ?? []).forEach((l, i) => {
    const volts = st.lg[i]
    if (volts === null) return
    const g = 1 / Math.max(l.ohms, R_MIN)
    stampG(l.node, 0, g); inject(l.node, volts * g)
  })
  const v = new Float64Array(inp.nodes)
  if (n > 0) { gauss(A, B, n); for (let i = 0; i < n; i++) v[i + 1] = B[i] }
  return v
}

/** Toprağa iletken yolu olmayan düğümler (iletken eleman kümeleriyle). */
function floatingNodes(inp: SolverInput, st: State): boolean[] {
  const parent = Array.from({ length: inp.nodes }, (_, i) => i)
  const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i] } return i }
  const uni = (a: number, b: number): void => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra }
  for (const r of inp.resistors) uni(r.a, r.b)
  for (const s of inp.sources) uni(s.node, 0)
  inp.leds.forEach((l, i) => { if (st.on[i]) uni(l.a, l.k) })
  ;(inp.npns ?? []).forEach((q, i) => { if (st.npn[i] !== 0) { uni(q.b, q.e); uni(q.c, q.e) } })
  ;(inp.switches ?? []).forEach((s, i) => { if (st.sw[i]) uni(s.a, s.b) })
  ;(inp.logic ?? []).forEach((l, i) => { if (st.lg[i] !== null) uni(l.node, 0) })
  const g0 = find(0)
  return Array.from({ length: inp.nodes }, (_, i) => find(i) !== g0)
}

const sameLogic = (a: number | null, b: number | null): boolean => (a === null || b === null ? a === b : Math.abs(a - b) < 1e-3)

export function solve(inp: SolverInput): SolverResult {
  const leds = inp.leds, npns = inp.npns ?? [], sws = inp.switches ?? [], lgs = inp.logic ?? []
  const st: State = { on: leds.map(() => false), npn: npns.map(() => 0), sw: sws.map(() => false), lg: lgs.map(() => null) }
  let v = solveLinear(inp, st)
  let it = 1
  const maxIt = 12 + leds.length * 6 + npns.length * 8 + (sws.length + lgs.length) * 4
  const seen = new Set<string>()
  const sig = (): string => `${st.on.map(Number).join('')}|${st.npn.join('')}|${st.sw.map(Number).join('')}|${st.lg.map((x) => (x === null ? '-' : x.toFixed(4))).join(',')}`
  seen.add(sig())

  const ibOf = (q: SolverNpn): number => (v[q.b] - v[q.e] - q.vbe) / q.rbe

  for (; it < maxIt; it++) {
    // 1) denetimli elemanlar (anahtar, mantık çıkışı): değişenlerin hepsi birlikte güncellenir
    let ctrlChanged = false
    if (sws.length || lgs.length) {
      const fl = floatingNodes(inp, st)
      sws.forEach((s, i) => { const c = s.closed(v, fl); if (c !== st.sw[i]) { st.sw[i] = c; ctrlChanged = true } })
      lgs.forEach((l, i) => { const d = l.drive(v, fl); if (!sameLogic(d, st.lg[i])) { st.lg[i] = d; ctrlChanged = true } })
    }
    if (ctrlChanged) {
      const k = sig()
      if (seen.has(k)) { v = solveLinear(inp, st); break } // döngü: son durumda kal
      seen.add(k)
      v = solveLinear(inp, st)
      continue
    }
    // 2) diyot / NPN: en büyük ihlali bul ve yalnız onu çevir (salınımı önler)
    let worst = -1, worstViol = 1e-9, kind: 'led' | 'npn' = 'led', npnTo = 0
    leds.forEach((l, i) => {
      if (l.disabled) return
      const vak = v[l.a] - v[l.k]
      // iletirken ileri gerilim altına düştüyse (akım < 0) ya da kapalıyken eşiği aştıysa ihlal
      const mag = st.on[i] ? l.vf - vak : vak - l.vf
      if (mag > worstViol) { worstViol = mag; worst = i; kind = 'led' }
    })
    npns.forEach((q, i) => {
      const s = st.npn[i]
      const vbe = v[q.b] - v[q.e]
      if (s === 0) {
        if (vbe - q.vbe > worstViol) { worstViol = vbe - q.vbe; worst = i; kind = 'npn'; npnTo = 1 }
        return
      }
      const ib = ibOf(q)
      if (ib < -1e-9) { // taban akımı yönü ters: kapat
        if (-ib * q.rbe > worstViol) { worstViol = -ib * q.rbe; worst = i; kind = 'npn'; npnTo = 0 }
        return
      }
      if (s === 1) {
        const vce = v[q.c] - v[q.e]
        if (q.vsat - vce > worstViol) { worstViol = q.vsat - vce; worst = i; kind = 'npn'; npnTo = 2 }
      } else {
        const icSat = (v[q.c] - v[q.e] - q.vsat) / q.rsat
        // doyumda devrenin istediği akım β·Ib'yi aşıyorsa aktif bölgeye dön
        if ((icSat - q.beta * ib) * q.rsat > worstViol) { worstViol = (icSat - q.beta * ib) * q.rsat; worst = i; kind = 'npn'; npnTo = 1 }
      }
    })
    if (worst < 0) break
    if (kind === 'led') st.on[worst] = !st.on[worst]
    else st.npn[worst] = npnTo
    const k = sig()
    if (seen.has(k)) { v = solveLinear(inp, st); break }
    seen.add(k)
    v = solveLinear(inp, st)
  }

  const sourceAmps = inp.sources.map((s) => (s.volts - v[s.node]) / Math.max(s.ohms, R_MIN))
  const ledAmps = leds.map((l, i) => {
    const a = st.on[i] ? Math.max(0, (v[l.a] - v[l.k] - l.vf) / l.rs) : 0
    return a < 1e-8 ? 0 : a // GMIN sızıntısı (yüzen uçlar) sıfır sayılır
  })
  const npnIb = npns.map((q, i) => (st.npn[i] === 0 ? 0 : Math.max(0, ibOf(q))))
  const npnIc = npns.map((q, i) => {
    const s = st.npn[i]
    if (s === 0) return 0
    if (s === 1) return q.beta * Math.max(0, ibOf(q))
    return Math.max(0, (v[q.c] - v[q.e] - q.vsat) / q.rsat)
  })
  const logicAmps = lgs.map((l, i) => { const x = st.lg[i]; return x === null ? 0 : (x - v[l.node]) / Math.max(l.ohms, R_MIN) })
  const floating = floatingNodes(inp, st)
  return {
    volts: v, sourceAmps, ledAmps, ledOn: st.on, floating,
    npnState: st.npn.map((s) => (s === 0 ? 'off' : s === 1 ? 'active' : 'sat')),
    npnIb, npnIc, switchClosed: st.sw, logicAmps, logicVolts: st.lg, iterations: it,
  }
}

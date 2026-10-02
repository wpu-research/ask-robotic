// Güvenli blok yorumlayıcı. eval / Function KULLANILMAZ: Blockly'nin JSON programı doğrudan dolaşılır.
// Her olay işleyicisi bir "çağrı"dır ve sonuna kadar çalışır; çağrı başına adım sınırı, kare başına toplam adım sınırı ve
// zaman aşımı vardır (sonsuz döngü oyunu dondurmaz, açıklamalı bir hata verir). Saf TypeScript: Node'da ve tarayıcıda aynı.
import { colorIndex } from './palette'
import { OyunEngine, type EventCtx, type SpriteState, type Sub } from './engine'
import { NOTES } from './blocks'
import { BUTTONS, KIND_IDS, type BlockNode, type BlockState, type Button } from './types'

export class ProgramError extends Error {
  blockId: string | null
  constructor(message: string, blockId: string | null = null) { super(message); this.name = 'ProgramError'; this.blockId = blockId }
}

export type Value = number | string | boolean | null | SpriteState

export interface RunnerLimits {
  /** Bir olay çağrısı başına en çok adım. */
  callSteps: number
  /** Bir oyun karesi başına toplam adım. */
  frameSteps: number
  /** Tek bir çağrının en çok süresi (ms, gerçek zaman). */
  callMillis: number
}
export const DEFAULT_LIMITS: RunnerLimits = { callSteps: 60_000, frameSteps: 300_000, callMillis: 400 }

export const HAT_TYPES = ['oyun_baslangic', 'oyun_her_kare', 'oyun_her_n_ms', 'oyun_can_bitince', 'oyun_sure_bitince', 'den_dugme', 'sprite_carpisinca', 'sprite_olusunca', 'sprite_silinince', 'harita_karoya_dokununca'] as const

const BRK = 1, CNT = 2, RET = 3
type Signal = 0 | 1 | 2 | 3

interface Frame { locals: Map<string, Value> | null; ctx: EventCtx; ret: Value }
interface ProcDef { name: string; params: { name: string; id: string }[]; body: BlockNode | undefined; ret: BlockNode | undefined; node: BlockNode }

export const isEnabled = (b: BlockNode): boolean => b.enabled !== false && b.disabled !== true
const inp = (b: BlockNode, name: string): BlockNode | undefined => b.inputs?.[name]?.block ?? b.inputs?.[name]?.shadow
const isSprite = (v: unknown): v is SpriteState => typeof v === 'object' && v !== null && 'destroyed' in v && 'kind' in v

export function topBlocks(state: BlockState): BlockNode[] { return state.blocks?.blocks ?? [] }

const toNum = (v: Value | undefined): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'string') { const n = parseFloat(v.replace(',', '.')); return Number.isFinite(n) ? n : 0 }
  return 0
}
const fin = (n: number): number => (Number.isFinite(n) ? n : 0)
export const toStr = (v: Value | undefined): string => {
  if (v === null || v === undefined) return ''
  if (isSprite(v)) return `[${v.kind}]`
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6)
  return String(v)
}
const truthy = (v: Value | undefined): boolean => (isSprite(v) ? true : !!v)

function looseEq(a: Value | undefined, b: Value | undefined): boolean {
  if (typeof a === 'number' && typeof b === 'number') return a === b
  if (isSprite(a) || isSprite(b)) return a === b
  if (typeof a === 'string' && typeof b === 'string') return a === b
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return toNum(a) === toNum(b) && String(a) === String(b) ? true : (typeof a === 'boolean' || typeof b === 'boolean') ? truthy(a) === truthy(b) : toNum(a) === toNum(b) && (typeof a === 'number' || typeof b === 'number')
}

export class Runner {
  readonly engine: OyunEngine
  readonly limits: RunnerLimits
  readonly subs: Sub[] = []
  readonly vars = new Map<string, Value>()
  private bodies = new Map<number, BlockNode | undefined>()
  private procs = new Map<string, ProcDef>()
  private varNames = new Map<string, string>()
  private steps = 0
  private frameSteps = 0
  private lastFrame = -1
  private callStart = 0
  private callDepth = 0
  /** Çalışan blok (hata mesajı için) */
  private cur: BlockNode | null = null

  constructor(engine: OyunEngine, state: BlockState, limits: Partial<RunnerLimits> = {}) {
    this.engine = engine
    this.limits = { ...DEFAULT_LIMITS, ...limits }
    for (const v of state.variables ?? []) this.varNames.set(v.id, v.name)
    let nextSub = 1
    for (const b of topBlocks(state)) {
      if (!isEnabled(b)) continue
      if (b.type === 'procedures_defnoreturn' || b.type === 'procedures_defreturn') {
        const name = String(b.fields?.NAME ?? '')
        const params = ((b.extraState as { params?: { name: string; id: string }[] } | undefined)?.params ?? []).map((p) => ({ name: p.name, id: p.id }))
        this.procs.set(name, { name, params, body: inp(b, 'STACK'), ret: b.type === 'procedures_defreturn' ? inp(b, 'RETURN') : undefined, node: b })
        continue
      }
      const sub = this.hatToSub(b, nextSub)
      if (!sub) continue
      nextSub++
      this.subs.push(sub)
      this.bodies.set(sub.id, inp(b, 'DO'))
    }
    engine.setSubs(this.subs, (sub, ctx) => this.run(sub, ctx))
  }

  private hatToSub(b: BlockNode, id: number): Sub | null {
    const f = (n: string) => String(b.fields?.[n] ?? '')
    const k = (n: string) => { const v = f(n); return v === 'hepsi' || KIND_IDS.includes(v) ? v : 'hepsi' }
    switch (b.type) {
      case 'oyun_baslangic': return { id, type: 'start' }
      case 'oyun_her_kare': return { id, type: 'update' }
      case 'oyun_her_n_ms': return { id, type: 'every', ms: Math.max(50, toNum(b.fields?.MS as number) || 1000) }
      case 'oyun_can_bitince': return { id, type: 'lifeEnd' }
      case 'oyun_sure_bitince': return { id, type: 'timeEnd' }
      case 'den_dugme': { const bt = f('B') as Button; return BUTTONS.includes(bt) ? { id, type: 'button', button: bt, edge: f('E') === 'release' ? 'release' : 'press' } : null }
      case 'sprite_carpisinca': return { id, type: 'overlap', kind: k('KA'), kind2: k('KB') }
      case 'sprite_olusunca': return { id, type: 'created', kind: k('K') }
      case 'sprite_silinince': return { id, type: 'destroyed', kind: k('K') }
      case 'harita_karoya_dokununca': { const im = inp(b, 'IMG'); return { id, type: 'tile', kind: k('K'), image: String(im?.fields?.IMG ?? '') } }
      default: return null
    }
  }

  // ---------- çağrı ----------
  run(sub: Sub, ctx: EventCtx): void {
    const body = this.bodies.get(sub.id)
    if (!body) return
    const eng = this.engine
    if (eng.frame !== this.lastFrame) { this.lastFrame = eng.frame; this.frameSteps = 0 }
    const outer = this.callDepth > 0
    const savedSteps = this.steps
    if (!outer) { this.steps = 0; this.callStart = now() }
    this.callDepth++
    try {
      this.execChain(body, { locals: null, ctx: { ...ctx }, ret: null })
    } catch (e) {
      if (e instanceof ProgramError) eng.fail(e.message, e.blockId ?? this.cur?.id ?? null)
      else if (e instanceof RangeError) eng.fail('Fonksiyon çok derin iç içe çağrıldı (kendini sonsuza kadar çağırıyor olabilir).', this.cur?.id ?? null)
      else eng.fail(`Beklenmeyen hata: ${(e as Error)?.message ?? e}`, this.cur?.id ?? null)
    } finally {
      this.callDepth--
      if (outer) this.steps = savedSteps
    }
  }

  private tickStep(b: BlockNode): void {
    this.cur = b
    if (++this.steps > this.limits.callSteps || ++this.frameSteps > this.limits.frameSteps) {
      throw new ProgramError('Programın çok uzun sürdü: bir döngü hiç bitmiyor olabilir. Döngüye bir bitiş koşulu ekle.', b.id ?? null)
    }
    if ((this.steps & 1023) === 0 && now() - this.callStart > this.limits.callMillis) {
      throw new ProgramError('Programın çok yavaş çalıştı: sonsuz döngü olabilir.', b.id ?? null)
    }
  }

  // ---------- deyimler ----------
  private execChain(first: BlockNode | undefined, f: Frame): Signal {
    for (let b = first; b; b = b.next?.block ?? b.next?.shadow) {
      if (!isEnabled(b)) continue
      const sig = this.execStmt(b, f)
      if (sig) return sig
    }
    return 0
  }

  private sp(b: BlockNode, name: string, f: Frame): SpriteState | null {
    const node = inp(b, name)
    let v: Value | undefined
    if (node) v = this.evalExpr(node, f)
    if (v === undefined || v === null) {
      if (node && node.type !== 'oyun_bu_sprite') throw new ProgramError('Burada bir sprite gerekiyor ama değişken boş. Önce "yeni sprite" ile bir sprite oluştur.', b.id ?? null)
      v = f.ctx.sprite ?? this.engine.lastCreated
      if (!v) throw new ProgramError('Henüz hiç sprite yok. Önce "yeni sprite" bloğuyla bir sprite oluştur.', b.id ?? null)
    }
    if (!isSprite(v)) throw new ProgramError('Burada bir sprite gerekiyor.', b.id ?? null)
    return v.destroyed ? null : v
  }
  private n(b: BlockNode, name: string, f: Frame, def = 0): number {
    const node = inp(b, name)
    return node ? toNum(this.evalExpr(node, f)) : def
  }
  private t(b: BlockNode, name: string, f: Frame): string {
    const node = inp(b, name)
    return node ? toStr(this.evalExpr(node, f)) : ''
  }
  private fld(b: BlockNode, name: string): string { return String(b.fields?.[name] ?? '') }
  private img(b: BlockNode, name: string, f: Frame, must = true): string {
    const node = inp(b, name)
    const id = node ? toStr(this.evalExpr(node, f)) : ''
    if (must && !this.engine.imageExists(id)) throw new ProgramError(`'${id || '(boş)'}' adlı resim bulunamadı. Resim sekmesinden ekleyebilirsin.`, b.id ?? null)
    return id
  }
  private kind(b: BlockNode, name = 'K'): string { const v = this.fld(b, name); return v === 'hepsi' || KIND_IDS.includes(v) ? v : 'nesne' }
  private mapOrFail(b: BlockNode) {
    if (!this.engine.map) throw new ProgramError('Önce "haritayı yükle" bloğuyla bir harita yüklemelisin.', b.id ?? null)
    return this.engine.map
  }
  private varId(b: BlockNode): string {
    const v = b.fields?.VAR as { id?: string } | string | undefined
    return typeof v === 'string' ? v : String(v?.id ?? '')
  }
  private getVar(id: string, f: Frame): Value {
    if (f.locals?.has(id)) return f.locals.get(id) ?? null
    return this.vars.get(id) ?? 0
  }
  private setVar(id: string, v: Value, f: Frame): void {
    if (f.locals?.has(id)) f.locals.set(id, v)
    else this.vars.set(id, v)
  }

  private execStmt(b: BlockNode, f: Frame): Signal {
    this.tickStep(b)
    const e = this.engine
    switch (b.type) {
      // —— standart: kontrol ——
      case 'controls_if': {
        const st = (b.extraState ?? {}) as { hasElse?: boolean; elseIfCount?: number }
        const cnt = (st.elseIfCount ?? 0) + 1
        for (let i = 0; i < cnt; i++) {
          const c = inp(b, `IF${i}`)
          if (c && truthy(this.evalExpr(c, f))) return this.execChain(inp(b, `DO${i}`), f)
        }
        if (st.hasElse || inp(b, 'ELSE')) return this.execChain(inp(b, 'ELSE'), f)
        return 0
      }
      case 'controls_repeat_ext': {
        const times = Math.min(100000, Math.floor(this.n(b, 'TIMES', f)))
        for (let i = 0; i < times; i++) {
          this.tickStep(b)
          const sig = this.execChain(inp(b, 'DO'), f)
          if (sig === BRK) break
          if (sig === RET) return RET
        }
        return 0
      }
      case 'controls_whileUntil': {
        const until = this.fld(b, 'MODE') === 'UNTIL'
        for (;;) {
          this.tickStep(b)
          const c = inp(b, 'BOOL')
          const v = c ? truthy(this.evalExpr(c, f)) : false
          if (until ? v : !v) break
          const sig = this.execChain(inp(b, 'DO'), f)
          if (sig === BRK) break
          if (sig === RET) return RET
        }
        return 0
      }
      case 'controls_for': {
        const id = this.varId(b)
        const from = this.n(b, 'FROM', f, 1), to = this.n(b, 'TO', f, 10)
        let by = Math.abs(this.n(b, 'BY', f, 1)) || 1
        by = from <= to ? by : -by
        for (let i = from; by > 0 ? i <= to : i >= to; i += by) {
          this.tickStep(b)
          this.setVar(id, i, f)
          const sig = this.execChain(inp(b, 'DO'), f)
          if (sig === BRK) break
          if (sig === RET) return RET
        }
        return 0
      }
      case 'controls_flow_statements': return this.fld(b, 'FLOW') === 'BREAK' ? BRK : CNT
      case 'variables_set': { const v = inp(b, 'VALUE'); this.setVar(this.varId(b), v ? this.evalExpr(v, f) : 0, f); return 0 }
      case 'math_change': { const id = this.varId(b); this.setVar(id, fin(toNum(this.getVar(id, f)) + this.n(b, 'DELTA', f, 1)), f); return 0 }
      case 'procedures_callnoreturn': this.call(b, f); return 0
      case 'procedures_ifreturn': {
        const c = inp(b, 'CONDITION')
        if (c && truthy(this.evalExpr(c, f))) { const v = inp(b, 'VALUE'); f.ret = v ? this.evalExpr(v, f) : null; return RET }
        return 0
      }

      // —— oyun ——
      case 'oyun_skor_ayarla': e.setScore(this.n(b, 'N', f)); return 0
      case 'oyun_skor_degistir': e.setScore(e.score + this.n(b, 'N', f, 1)); return 0
      case 'oyun_can_ayarla': e.setLife(this.n(b, 'N', f)); return 0
      case 'oyun_can_degistir': e.setLife(e.life + this.n(b, 'N', f, -1)); return 0
      case 'oyun_sure_baslat': e.startCountdown(this.n(b, 'N', f, 30)); return 0
      case 'oyun_bitir': e.gameOver(this.fld(b, 'R') === 'win'); return 0
      case 'oyun_mesaj': e.showMessage(this.t(b, 'T', f), this.n(b, 'N', f, 2)); return 0
      case 'oyun_sarsinti': e.shake(this.n(b, 'N', f, 300)); return 0
      case 'oyun_patlama': e.burst(this.n(b, 'X', f, 80), this.n(b, 'Y', f, 60), colorIndex(b.fields?.C, 4)); return 0

      // —— sprite ——
      case 'sprite_konum': { const s = this.sp(b, 'S', f); if (s) { s.x = this.n(b, 'X', f, 80); s.y = this.n(b, 'Y', f, 60) } return 0 }
      case 'sprite_resim': { const s = this.sp(b, 'S', f); const id = this.img(b, 'IMG', f); if (s) e.setImage(s, id); return 0 }
      case 'sprite_sil': { const s = this.sp(b, 'S', f); if (s) e.destroy(s); return 0 }
      case 'sprite_patlat': { const s = this.sp(b, 'S', f); if (s) { e.burst(s.x, s.y, dominantColor(e, s), 16); e.destroy(s) } return 0 }
      case 'sprite_omur': { const s = this.sp(b, 'S', f); if (s) s.lifeMs = Math.max(0, this.n(b, 'N', f, 2000)); return 0 }
      case 'sprite_bayrak': {
        const s = this.sp(b, 'S', f)
        if (s) {
          const on = this.fld(b, 'ON') === 'true'
          const flag = this.fld(b, 'F')
          if (flag === 'autoDestroy') s.autoDestroy = on
          else if (flag === 'stay') s.stay = on
          else if (flag === 'bounce') s.bounce = on
          else if (flag === 'ghost') s.ghost = on
          else if (flag === 'hidden') s.hidden = on
        }
        return 0
      }
      case 'sprite_bak': { const s = this.sp(b, 'S', f); if (s) s.flipX = this.fld(b, 'D') === 'left'; return 0 }
      case 'sprite_katman': { const s = this.sp(b, 'S', f); if (s) s.z = this.n(b, 'N', f, 1); return 0 }
      case 'sprite_konus': { const s = this.sp(b, 'S', f); const t = this.t(b, 'T', f); if (s) e.say(s, t, this.n(b, 'N', f, 2)); return 0 }
      case 'sprite_takip': {
        const s = this.sp(b, 'S', f), o = this.sp(b, 'O', f), sp = this.n(b, 'N', f, 30)
        if (s && o && s !== o) s.follow = { target: o, speed: sp }
        return 0
      }
      case 'sprite_takip_birak': { const s = this.sp(b, 'S', f); if (s) s.follow = null; return 0 }
      case 'sprite_ozellik_ayarla': {
        const s = this.sp(b, 'S', f)
        const name = this.fld(b, 'NAME').slice(0, 40)
        const vn = inp(b, 'V')
        const v = vn ? this.evalExpr(vn, f) : 0
        if (s && name) {
          if (!(name in s.props) && Object.keys(s.props).length >= 30) throw new ProgramError('Bir sprite en çok 30 özellik taşıyabilir.', b.id ?? null)
          s.props[name] = typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' ? v : 0
        }
        return 0
      }
      case 'sprite_hepsini_sil': { for (const s of e.spritesOfKind(this.kind(b))) e.destroy(s); return 0 }
      case 'sprite_her_biri': {
        const list = e.spritesOfKind(this.kind(b))
        const saved = f.ctx.sprite
        try {
          for (const s of list) {
            if (s.destroyed) continue
            this.tickStep(b)
            f.ctx.sprite = s
            const sig = this.execChain(inp(b, 'DO'), f)
            if (sig === BRK) break
            if (sig === RET) return RET
          }
        } finally { f.ctx.sprite = saved }
        return 0
      }

      // —— hareket ——
      case 'hareket_hiz': { const s = this.sp(b, 'S', f); if (s) { s.vx = this.n(b, 'VX', f); s.vy = this.n(b, 'VY', f) } return 0 }
      case 'hareket_ivme': { const s = this.sp(b, 'S', f); if (s) { s.ax = this.n(b, 'AX', f); s.ay = this.n(b, 'AY', f) } return 0 }
      case 'hareket_yone': { const s = this.sp(b, 'S', f); const d = this.n(b, 'D', f), sp = this.n(b, 'N', f); if (s) e.setHeading(s, d, sp); return 0 }
      case 'hareket_dur': { const s = this.sp(b, 'S', f); if (s) { s.vx = 0; s.vy = 0; s.ax = 0; s.ay = 0; s.follow = null } return 0 }
      case 'hareket_ters': { const s = this.sp(b, 'S', f); if (s) { if (this.fld(b, 'A') === 'x') s.vx = -s.vx; else s.vy = -s.vy } return 0 }
      case 'hareket_kaydir': { const s = this.sp(b, 'S', f); const dx = this.n(b, 'DX', f), dy = this.n(b, 'DY', f); if (s) { s.x += dx; s.y += dy } return 0 }

      // —— denetleyici ——
      case 'den_hareket': {
        const s = this.sp(b, 'S', f); const sp = this.n(b, 'N', f, 60)
        if (s) { const m = this.fld(b, 'M'); s.control = { mode: m === 'h' ? 'h' : m === 'v' ? 'v' : 'four', speed: sp } }
        return 0
      }
      case 'den_hareket_birak': { const s = this.sp(b, 'S', f); if (s) { s.control = null; s.vx = 0; s.vy = 0 } return 0 }

      // —— sahne / harita ——
      case 'sahne_renk': e.bg = colorIndex(b.fields?.C, 0); e.bgTile = null; return 0
      case 'sahne_dosemesi': e.bgTile = this.img(b, 'IMG', f); return 0
      case 'harita_yukle': {
        const id = this.t(b, 'M', f)
        if (!e.loadMap(id)) throw new ProgramError(`'${id}' adlı harita yok. Harita sekmesinden çizebilirsin.`, b.id ?? null)
        return 0
      }
      case 'harita_karo_koy': { this.mapOrFail(b); e.setTile(Math.floor(this.n(b, 'C', f)), Math.floor(this.n(b, 'R', f)), this.img(b, 'IMG', f)); return 0 }
      case 'harita_karo_sil': { this.mapOrFail(b); e.setTile(Math.floor(this.n(b, 'C', f)), Math.floor(this.n(b, 'R', f)), null); return 0 }
      case 'harita_duvar': e.setWallImage(this.img(b, 'IMG', f, false), this.fld(b, 'ON') === 'true'); return 0
      case 'harita_sprite_yap': { this.mapOrFail(b); const id = this.img(b, 'IMG', f); e.tilesToSprites(id, this.kind(b)); return 0 }
      case 'harita_konumla': { const s = this.sp(b, 'S', f); this.mapOrFail(b); const c = this.n(b, 'C', f), r = this.n(b, 'R', f); if (s) e.placeOnTile(s, Math.floor(c), Math.floor(r)); return 0 }
      case 'kamera_takip': { const s = this.sp(b, 'S', f); if (s) e.cameraTarget = s; return 0 }
      case 'kamera_sabit': e.cameraTarget = null; return 0

      // —— ses ——
      case 'ses_bip': e.pushSound({ kind: 'beep', freq: clamp(this.n(b, 'F', f, 440), 40, 4000), ms: clamp(this.n(b, 'MS', f, 150), 20, 2000) }); return 0
      case 'ses_nota': {
        const note = this.fld(b, 'NOTE')
        e.pushSound({ kind: 'note', note: NOTES.some((x) => x.name === note) ? note : 'A4', ms: clamp(this.n(b, 'MS', f, 250), 20, 2000) })
        return 0
      }
      case 'ses_melodi': e.pushSound({ kind: 'melody', name: this.fld(b, 'M') }); return 0

      default:
        // değer blokları deyim olarak yüzüyorsa (yetim) yok sayılır
        if (b.type in VALUE_TYPES) return 0
        throw new ProgramError(`Bilinmeyen blok: ${b.type}`, b.id ?? null)
    }
  }

  private call(b: BlockNode, f: Frame): Value {
    const st = (b.extraState ?? {}) as { name?: string }
    const name = st.name ?? String(b.fields?.NAME ?? '')
    const def = this.procs.get(name)
    if (!def) throw new ProgramError(`'${name}' adlı fonksiyon tanımlı değil.`, b.id ?? null)
    if (this.callDepth > 40) throw new ProgramError('Fonksiyon çok derin iç içe çağrıldı (kendini sonsuza kadar çağırıyor olabilir).', b.id ?? null)
    const locals = new Map<string, Value>()
    def.params.forEach((p, i) => { const a = inp(b, `ARG${i}`); locals.set(p.id, a ? this.evalExpr(a, f) : 0) })
    const nf: Frame = { locals, ctx: f.ctx, ret: null }
    this.callDepth++
    try {
      const sig = this.execChain(def.body, nf)
      if (sig === RET) return nf.ret
      if (def.ret) return this.evalExpr(def.ret, nf)
      return null
    } finally { this.callDepth-- }
  }

  // ---------- ifadeler ----------
  evalExpr(b: BlockNode, f: Frame): Value {
    this.tickStep(b)
    const e = this.engine
    const n = (name: string, def = 0) => this.n(b, name, f, def)
    const v = (name: string): Value => { const x = inp(b, name); return x ? this.evalExpr(x, f) : null }
    switch (b.type) {
      case 'math_number': return toNum(b.fields?.NUM as number)
      case 'text': return String(b.fields?.TEXT ?? '')
      case 'oyun_resim': return String(b.fields?.IMG ?? '')
      case 'oyun_harita': return String(b.fields?.MAP ?? '')
      case 'logic_boolean': return b.fields?.BOOL === 'TRUE'
      case 'logic_null': return null
      case 'logic_negate': return !truthy(v('BOOL'))
      case 'logic_operation': {
        const a = truthy(v('A'))
        return this.fld(b, 'OP') === 'OR' ? a || truthy(v('B')) : a && truthy(v('B'))
      }
      case 'logic_compare': {
        const a = v('A'), c = v('B'), op = this.fld(b, 'OP')
        if (op === 'EQ') return looseEq(a, c)
        if (op === 'NEQ') return !looseEq(a, c)
        const x = toNum(a), y = toNum(c)
        return op === 'LT' ? x < y : op === 'LTE' ? x <= y : op === 'GT' ? x > y : x >= y
      }
      case 'logic_ternary': return truthy(v('IF')) ? v('THEN') : v('ELSE')
      case 'math_arithmetic': {
        const x = n('A'), y = n('B')
        switch (this.fld(b, 'OP')) {
          case 'ADD': return fin(x + y)
          case 'MINUS': return fin(x - y)
          case 'MULTIPLY': return fin(x * y)
          case 'DIVIDE': return y === 0 ? 0 : fin(x / y)
          case 'POWER': return fin(Math.pow(x, y))
          default: return 0
        }
      }
      case 'math_single': {
        const x = n('NUM')
        switch (this.fld(b, 'OP')) {
          case 'ROOT': return x < 0 ? 0 : Math.sqrt(x)
          case 'ABS': return Math.abs(x)
          case 'NEG': return -x
          case 'LN': return x <= 0 ? 0 : Math.log(x)
          case 'LOG10': return x <= 0 ? 0 : Math.log10(x)
          case 'EXP': return fin(Math.exp(x))
          case 'POW10': return fin(Math.pow(10, x))
          default: return x
        }
      }
      case 'math_round': {
        const x = n('NUM'), op = this.fld(b, 'OP')
        return op === 'ROUNDUP' ? Math.ceil(x) : op === 'ROUNDDOWN' ? Math.floor(x) : Math.round(x)
      }
      case 'math_modulo': { const y = n('DIVISOR'); return y === 0 ? 0 : n('DIVIDEND') % y }
      case 'math_random_int': return e.randomInt(n('FROM', 1), n('TO', 100))
      case 'math_constrain': { const lo = n('LOW', 0), hi = n('HIGH', 100); return Math.min(Math.max(n('VALUE'), Math.min(lo, hi)), Math.max(lo, hi)) }
      case 'math_number_property': {
        const x = n('NUMBER_TO_CHECK')
        switch (this.fld(b, 'PROPERTY')) {
          case 'EVEN': return x % 2 === 0
          case 'ODD': return Math.abs(x % 2) === 1
          case 'PRIME': { if (!Number.isInteger(x) || x < 2) return false; for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true }
          case 'WHOLE': return Number.isInteger(x)
          case 'POSITIVE': return x > 0
          case 'NEGATIVE': return x < 0
          case 'DIVISIBLE_BY': { const d = n('DIVISOR'); return d !== 0 && x % d === 0 }
          default: return false
        }
      }
      case 'text_join': {
        const cnt = ((b.extraState as { itemCount?: number } | undefined)?.itemCount) ?? 2
        let s = ''
        for (let i = 0; i < cnt; i++) s += toStr(v(`ADD${i}`))
        return s.slice(0, 500)
      }
      case 'variables_get': return this.getVar(this.varId(b), f)
      case 'procedures_callreturn': return this.call(b, f)

      case 'oyun_skor': return e.score
      case 'oyun_can': return e.life
      case 'oyun_sure': return e.countdownMs === null ? 0 : Math.ceil(e.countdownMs / 1000)
      case 'oyun_zaman': return Math.floor(e.timeMs / 1000)

      case 'sprite_yeni': {
        const id = this.img(b, 'IMG', f)
        return e.createSprite(id, this.kind(b, 'K'))
      }
      case 'oyun_bu_sprite': {
        const s = f.ctx.sprite ?? e.lastCreated
        if (!s) throw new ProgramError('Henüz hiç sprite yok. Önce "yeni sprite" bloğuyla bir sprite oluştur.', b.id ?? null)
        return s
      }
      case 'oyun_diger_sprite': {
        if (!f.ctx.other) throw new ProgramError('"diğer sprite" yalnızca çarpışma olayının içinde kullanılabilir.', b.id ?? null)
        return f.ctx.other
      }
      case 'sprite_ozellik': { const s = this.sp(b, 'S', f); return s ? (s.props[this.fld(b, 'NAME')] ?? 0) : 0 }
      case 'sprite_oku': {
        const s = this.sp(b, 'S', f)
        if (!s) return 0
        switch (this.fld(b, 'P')) {
          case 'x': return s.x
          case 'y': return s.y
          case 'vx': return s.vx
          case 'vy': return s.vy
          case 'w': return s.w
          case 'h': return s.h
          case 'dir': return e.heading(s)
          case 'life': return s.lifeMs ?? 0
          default: return 0
        }
      }
      case 'sprite_cakisiyor': { const a = this.sp(b, 'A', f), c = this.sp(b, 'B', f); return !!a && !!c && e.overlapping(a, c) }
      case 'sprite_dokunuyor': { const s = this.sp(b, 'S', f); const d = this.fld(b, 'D') as 'up' | 'down' | 'left' | 'right'; return !!s && !!s.touch[d] }
      case 'sprite_mesafe': { const a = this.sp(b, 'A', f), c = this.sp(b, 'B', f); return a && c ? Math.hypot(a.x - c.x, a.y - c.y) : 0 }
      case 'sprite_sayisi': return e.spritesOfKind(this.kind(b)).length

      case 'den_basili': return e.isDown(this.fld(b, 'B') as Button)
      case 'den_yon': { const a = e.axis(); return this.fld(b, 'A') === 'y' ? a.y : a.x }

      case 'harita_karo': return e.tileAt(Math.floor(n('C')), Math.floor(n('R'))) ?? ''
      case 'harita_duvar_mu': return e.isWall(Math.floor(n('C')), Math.floor(n('R')))
      case 'sprite_karo': { const s = this.sp(b, 'S', f); if (!s) return 0; return this.fld(b, 'A') === 'row' ? Math.floor(s.y / 16) : Math.floor(s.x / 16) }
      case 'harita_say': return e.countTiles(this.img(b, 'IMG', f, false))
      case 'harita_boyut': { const m = e.map; return m ? (this.fld(b, 'A') === 'rows' ? m.rows : m.cols) : 0 }
      case 'harita_olay_karo': {
        const c = this.fld(b, 'A') === 'row' ? f.ctx.row : f.ctx.col
        if (c === undefined) throw new ProgramError('"olay karosu" yalnızca "karosuna dokununca" olayının içinde kullanılabilir.', b.id ?? null)
        return c
      }
      default:
        throw new ProgramError(`Bilinmeyen blok: ${b.type}`, b.id ?? null)
    }
  }
}

/** Değer bloğu türleri (deyim olarak yüzerse yok sayılır). */
const VALUE_TYPES: Record<string, 1> = Object.fromEntries([
  'math_number', 'text', 'oyun_resim', 'oyun_harita', 'logic_boolean', 'logic_null', 'logic_negate', 'logic_operation', 'logic_compare', 'logic_ternary', 'math_arithmetic', 'math_single', 'math_round',
  'math_modulo', 'math_random_int', 'math_constrain', 'math_number_property', 'text_join', 'variables_get', 'procedures_callreturn', 'oyun_skor', 'oyun_can', 'oyun_sure', 'oyun_zaman', 'sprite_yeni',
  'oyun_bu_sprite', 'oyun_diger_sprite', 'sprite_ozellik', 'sprite_oku', 'sprite_cakisiyor', 'sprite_dokunuyor', 'sprite_mesafe', 'sprite_sayisi', 'den_basili', 'den_yon', 'harita_karo', 'harita_duvar_mu',
  'sprite_karo', 'harita_say', 'harita_boyut', 'harita_olay_karo',
].map((t) => [t, 1]))

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/** Resimdeki en çok kullanılan renk (patlama rengi). */
function dominantColor(e: OyunEngine, s: SpriteState): number {
  const pix = e.info(s.image).pix
  const cnt = new Array(16).fill(0)
  for (let i = 0; i < pix.d.length; i++) if (pix.d[i] >= 0 && pix.d[i] !== 0) cnt[pix.d[i]]++
  let best = 4, bc = 0
  cnt.forEach((c, i) => { if (c > bc) { bc = c; best = i } })
  return best
}

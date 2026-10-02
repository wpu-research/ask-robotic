// Güvenli işbirlikçi blok yorumlayıcı. eval / Function KULLANILMAZ: Blockly'nin JSON programı doğrudan dolaşılır.
// Her betik bir "iş parçacığı"dır (generator). Kare başına bir kez ilerler; bekleme, kayma ve (görsel değişiklik olduysa) döngü sonları
// kareyi bırakır. Sonsuz döngü tarayıcıyı dondurmaz: iş parçacığı başına adım bütçesi ve kare başına toplam adım sınırı vardır
// (bütçe aşılınca iş parçacığı o kareyi bırakır, bir sonraki karede devam eder). Özyineleme derinliği sınırlıdır.
import { compareValues, ProgramError, toBool, toNum, toStr, SahneEngine, type RtTarget, type Value } from './engine'
import { ARG_BLOCK, HAT_TYPES, PROC_CALL_PREFIX, PROC_DEF_PREFIX, VAR_GET } from './blocks'
import { rad } from './geometry'
import type { BlockNode, SahneProject } from './types'

/** Bir iş parçacığının bir kareden önce yapabileceği en çok adım. */
export const THREAD_STEP_BUDGET = 3_000
/** Bir karede tüm iş parçacıklarının toplam adım sınırı. */
export const FRAME_STEP_CAP = 300_000
export const MAX_DEPTH = 120

export interface HatInfo {
  /** Üst düzey blok kimliği (parıltı için). */
  id: string
  defId: string
  type: string
  node: BlockNode
  body: BlockNode | undefined
}

export interface Thread {
  id: number
  target: RtTarget
  hat: HatInfo | null
  topId: string
  gen: Generator<void, void, void>
  done: boolean
}

interface Ctx { t: RtTarget; thread: Thread; locals: Map<string, Value> | null; depth: number }

const STOP = { stop: true } as const
const nextOf = (b: BlockNode): BlockNode | undefined => b.next?.block ?? b.next?.shadow
const inp = (b: BlockNode, name: string): BlockNode | undefined => b.inputs?.[name]?.block ?? b.inputs?.[name]?.shadow
export const isEnabled = (b: BlockNode): boolean => b.enabled !== false && b.disabled !== true
const fld = (b: BlockNode, name: string): string => {
  const v = b.fields?.[name]
  return typeof v === 'object' && v !== null ? String((v as { id?: string }).id ?? '') : String(v ?? '')
}
const varId = (b: BlockNode, name: string): string => {
  const v = b.fields?.[name] as { id?: string } | string | undefined
  return typeof v === 'string' ? v : String(v?.id ?? '')
}
const normMsg = (s: string): string => s.trim().toLowerCase()

export class Interpreter {
  readonly engine: SahneEngine
  readonly project: SahneProject
  threads: Thread[] = []
  readonly hats = new Map<string, HatInfo[]>()
  private procs = new Map<string, Map<string, BlockNode | undefined>>()
  private pendingKeys = new Set<string>()
  private timerPrev = new Map<string, boolean>()
  private nextThread = 1
  private steps = 0
  private runStart = 0
  private frameSteps = 0
  private cur: BlockNode | null = null

  constructor(engine: SahneEngine, project: SahneProject) {
    this.engine = engine
    this.project = project
    const defs: { id: string; blocks: { blocks?: { blocks?: BlockNode[] } } }[] = [{ id: 'stage', blocks: project.stage.blocks }, ...project.sprites.map((s) => ({ id: s.id, blocks: s.blocks }))]
    for (const d of defs) {
      const list: HatInfo[] = []
      const pm = new Map<string, BlockNode | undefined>()
      for (const b of d.blocks.blocks?.blocks ?? []) {
        if (!isEnabled(b)) continue
        if (b.type.startsWith(PROC_DEF_PREFIX)) { pm.set(b.type.slice(PROC_DEF_PREFIX.length), nextOf(b)); continue }
        if (HAT_TYPES.includes(b.type)) list.push({ id: b.id ?? `${d.id}:${list.length}`, defId: d.id, type: b.type, node: b, body: nextOf(b) })
      }
      this.hats.set(d.id, list)
      this.procs.set(d.id, pm)
    }
    engine.hooks = {
      backdrop: (name) => this.startBackdrop(name),
      cloneCreated: (t) => this.startHatsOfType('sh_when_clone', t),
      cloneDeleted: (t) => this.killTarget(t),
    }
  }

  get running(): boolean { return this.threads.some((t) => !t.done) }
  /** Çalışan üst düzey blok kimlikleri (parıltı). */
  runningTopIds(defId: string): string[] { return this.threads.filter((t) => !t.done && t.target.defId === defId).map((t) => t.topId) }

  // ───────── başlatma ─────────
  private spawn(t: RtTarget, hat: HatInfo | null, body: BlockNode | undefined, topId: string, restart: boolean): Thread | null {
    if (!body) return null
    if (restart && hat) {
      const old = this.threads.findIndex((x) => !x.done && x.hat === hat && x.target === t)
      if (old >= 0) {
        const th = this.makeThread(t, hat, body, topId)
        this.threads[old].done = true
        this.threads[old] = th
        return th
      }
    } else if (hat && this.threads.some((x) => !x.done && x.hat === hat && x.target === t)) return null
    const th = this.makeThread(t, hat, body, topId)
    this.threads.push(th)
    return th
  }
  private makeThread(t: RtTarget, hat: HatInfo | null, body: BlockNode, topId: string): Thread {
    const th = { id: this.nextThread++, target: t, hat, topId, done: false } as Thread
    th.gen = this.chain(body, { t, thread: th, locals: null, depth: 0 })
    return th
  }

  private startHat(h: HatInfo, t: RtTarget, restart = true): Thread | null { return this.spawn(t, h, h.body, h.id, restart) }
  private startHatsOfType(type: string, t: RtTarget, filter?: (h: HatInfo) => boolean, restart = true): Thread[] {
    const out: Thread[] = []
    for (const h of this.hats.get(t.defId) ?? []) {
      if (h.type !== type || (filter && !filter(h))) continue
      const th = this.startHat(h, t, restart)
      if (th) out.push(th)
    }
    return out
  }
  private everyTarget(): RtTarget[] { return [this.engine.stage, ...this.engine.targets] }

  /** Yeşil bayrak: her şeyi durdurur, klonları siler, bayrak başlıklarını başlatır. */
  greenFlag(): void {
    this.stopAll()
    for (const t of this.everyTarget()) this.startHatsOfType('sh_when_flag', t)
  }
  /** Her şeyi durdurur. `clearBubbles`: konuşma balonlarını da kapat (durdur düğmesi ve bayrak); "hepsini dur" bloğu balonları bırakır. */
  stopAll(clearBubbles = true): void {
    for (const th of this.threads) th.done = true
    this.engine.deleteAllClones()
    if (clearBubbles) for (const t of this.everyTarget()) { if (t.bubble) this.engine.endSay(t, t.bubble.seq) }
    this.engine.asking = null
    this.engine.stopSounds()
    this.pendingKeys.clear()
  }
  private killTarget(t: RtTarget): void { for (const th of this.threads) if (th.target === t) th.done = true }

  pressKey(k: string): void { this.engine.keys.add(k); this.pendingKeys.add(k) }
  releaseKey(k: string): void { this.engine.keys.delete(k) }
  releaseAllKeys(): void { this.engine.keys.clear() }

  /** Sprite'a tıklandı ("bu sprite tıklanınca" başlıkları). */
  click(t: RtTarget): void { this.startHatsOfType('sh_when_clicked', t) }

  startMessage(msg: string): Thread[] {
    const key = normMsg(msg)
    const out: Thread[] = []
    for (const t of this.everyTarget()) out.push(...this.startHatsOfType('sh_when_msg', t, (h) => normMsg(fld(h.node, 'M')) === key))
    this.engine.emit('broadcast', null, msg)
    return out
  }
  private startBackdrop(name: string): void {
    for (const t of this.everyTarget()) this.startHatsOfType('sh_when_backdrop', t, (h) => fld(h.node, 'B') === name)
  }

  /** Çalışma alanında bir yığına tıklandı: o yığını `target` için çalıştırır. */
  runStack(t: RtTarget, topId: string): boolean {
    const defs = t.isStage ? this.project.stage.blocks : this.project.sprites.find((s) => s.id === t.defId)?.blocks
    const top = defs?.blocks?.blocks?.find((b) => b.id === topId)
    if (!top) return false
    const hat = (this.hats.get(t.defId) ?? []).find((h) => h.id === topId) ?? null
    const body = HAT_TYPES.includes(top.type) ? nextOf(top) : top.type.startsWith(PROC_DEF_PREFIX) ? undefined : top
    return !!this.spawn(t, hat, body, topId, true)
  }

  // ───────── kare ─────────
  /** Bir kare ilerletir (motor zamanı önceden ilerletilmiş olmalı). `wallMs`: gerçek zaman bütçesi (yalnız tarayıcı). */
  tick(wallMs?: number): void {
    const eng = this.engine
    if (eng.error) return
    eng.redraw = false
    this.frameSteps = 0
    // tuş başlıkları: tuş OLAYLARI (basma ve işletim sisteminin tekrar olayları) başlatır; basılı tutmak tek başına başlatmaz (Scratch gibi)
    const keys = new Set(this.pendingKeys)
    this.pendingKeys.clear()
    if (keys.size) {
      for (const t of this.everyTarget()) {
        this.startHatsOfType('sh_when_key', t, (h) => { const k = fld(h.node, 'K'); return keys.has(k) || (k === 'any' && keys.size > 0) }, false)
      }
    }
    // zamanlayıcı başlıkları (kenar tetiklemeli)
    for (const t of this.everyTarget()) {
      for (const h of this.hats.get(t.defId) ?? []) {
        if (h.type !== 'sh_when_timer') continue
        const limit = toNum(this.value(inp(h.node, 'N'), { t, thread: null as unknown as Thread, locals: null, depth: 0 }))
        const key = `${h.id}:${t.uid}`
        const now = eng.timer > limit
        if (now && !this.timerPrev.get(key)) this.startHat(h, t)
        this.timerPrev.set(key, now)
      }
    }
    const t0 = wallMs !== undefined && typeof performance !== 'undefined' ? performance.now() : 0
    for (let i = 0; i < this.threads.length; i++) {
      const th = this.threads[i]
      if (th.done || th.target.deleted) { th.done = true; continue }
      this.runThread(th)
      if (this.frameSteps > FRAME_STEP_CAP) break
      if (wallMs !== undefined && performance.now() - t0 > wallMs) break
      if (eng.error) break
    }
    this.threads = this.threads.filter((t) => !t.done)
  }

  private runThread(th: Thread): void {
    this.runStart = this.steps
    try {
      const r = th.gen.next()
      if (r.done) th.done = true
    } catch (e) {
      th.done = true
      if (e === STOP) return
      if (e instanceof ProgramError) this.engine.fail(e.message, e.blockId ?? this.cur?.id ?? null)
      else if (e instanceof RangeError) this.engine.fail('Bir blok kendini sonsuza kadar çağırıyor olabilir (çok derin iç içe çağrı).', this.cur?.id ?? null)
      else this.engine.fail(`Beklenmeyen hata: ${(e as Error)?.message ?? e}`, this.cur?.id ?? null)
    }
    this.frameSteps += this.steps - this.runStart
  }

  private yieldNow(): boolean { return this.engine.redraw || this.steps - this.runStart > THREAD_STEP_BUDGET }

  // ───────── deyimler ─────────
  private *chain(first: BlockNode | undefined, c: Ctx): Generator<void, void, void> {
    for (let b = first; b; b = nextOf(b)) {
      if (!isEnabled(b)) continue
      yield* this.exec(b, c)
    }
  }

  private n(b: BlockNode, name: string, c: Ctx): number { return toNum(this.value(inp(b, name), c)) }
  private s(b: BlockNode, name: string, c: Ctx): string { return toStr(this.value(inp(b, name), c)) }

  private *waitMs(ms: number): Generator<void, void, void> {
    const eng = this.engine
    const end = eng.time + Math.max(0, ms)
    do { yield } while (eng.time < end - 1e-6)
  }

  private spriteOrFail(b: BlockNode, c: Ctx): RtTarget {
    if (c.t.isStage) throw new ProgramError('Bu blok yalnız sprite\'larda çalışır, sahnede değil.', b.id ?? null)
    return c.t
  }

  private *exec(b: BlockNode, c: Ctx): Generator<void, void, void> {
    this.cur = b
    this.steps++
    const eng = this.engine
    const t = c.t
    switch (b.type) {
      // ── hareket ──
      case 'sh_move': eng.moveSteps(this.spriteOrFail(b, c), this.n(b, 'N', c)); return
      case 'sh_turn_r': eng.setDir(this.spriteOrFail(b, c), t.dir + this.n(b, 'D', c)); return
      case 'sh_turn_l': eng.setDir(this.spriteOrFail(b, c), t.dir - this.n(b, 'D', c)); return
      case 'sh_goto_xy': eng.setXY(this.spriteOrFail(b, c), this.n(b, 'X', c), this.n(b, 'Y', c)); return
      case 'sh_goto': { this.spriteOrFail(b, c); const p = this.place(fld(b, 'T'), t); if (p) eng.setXY(t, p[0], p[1]); return }
      case 'sh_glide_xy': case 'sh_glide_to': {
        this.spriteOrFail(b, c)
        const secs = this.n(b, 'S', c)
        let tx = 0, ty = 0
        if (b.type === 'sh_glide_xy') { tx = this.n(b, 'X', c); ty = this.n(b, 'Y', c) } else { const p = this.place(fld(b, 'T'), t); if (!p) return; tx = p[0]; ty = p[1] }
        const x0 = t.x, y0 = t.y, start = eng.time, dur = secs * 1000
        if (dur <= 0) { eng.setXY(t, tx, ty); return }
        do {
          yield
          const f = Math.min(1, (eng.time - start) / dur)
          eng.setXY(t, x0 + (tx - x0) * f, y0 + (ty - y0) * f)
        } while (eng.time - start < dur - 1e-6)
        return
      }
      case 'sh_point': eng.setDir(this.spriteOrFail(b, c), this.n(b, 'D', c)); return
      case 'sh_point_towards': { this.spriteOrFail(b, c); const p = this.place(fld(b, 'T'), t); if (p) eng.pointTowards(t, p[0], p[1]); return }
      case 'sh_change_x': eng.setXY(this.spriteOrFail(b, c), t.x + this.n(b, 'N', c), t.y); return
      case 'sh_set_x': eng.setXY(this.spriteOrFail(b, c), this.n(b, 'N', c), t.y); return
      case 'sh_change_y': eng.setXY(this.spriteOrFail(b, c), t.x, t.y + this.n(b, 'N', c)); return
      case 'sh_set_y': eng.setXY(this.spriteOrFail(b, c), t.x, this.n(b, 'N', c)); return
      case 'sh_bounce': eng.bounceOnEdge(this.spriteOrFail(b, c)); return
      case 'sh_rot_style': { const v = fld(b, 'S'); t.rotationStyle = v === 'lr' || v === 'none' ? v : 'all'; eng.redraw = true; return }

      // ── görünüm ──
      case 'sh_say': eng.say(t, this.s(b, 'M', c)); return
      case 'sh_think': eng.say(t, this.s(b, 'M', c), true); return
      case 'sh_say_for': case 'sh_think_for': {
        eng.say(t, this.s(b, 'M', c), b.type === 'sh_think_for')
        const seq = t.bubble?.seq ?? -1
        yield* this.waitMs(this.n(b, 'S', c) * 1000)
        eng.endSay(t, seq)
        return
      }
      case 'sh_costume': { const name = fld(b, 'C'); if (!eng.setCostumeByName(t, name)) throw new ProgramError(`'${name}' adlı kostüm bulunamadı. Kostümler sekmesinden kontrol et.`, b.id ?? null); return }
      case 'sh_next_costume': eng.nextCostume(t); return
      case 'sh_backdrop': { const name = fld(b, 'B'); if (!eng.setCostumeByName(eng.stage, name)) throw new ProgramError(`'${name}' adlı arka plan bulunamadı.`, b.id ?? null); return }
      case 'sh_next_backdrop': eng.nextCostume(eng.stage); return
      case 'sh_change_size': eng.setSize(this.spriteOrFail(b, c), t.size + this.n(b, 'N', c)); return
      case 'sh_set_size': eng.setSize(this.spriteOrFail(b, c), this.n(b, 'N', c)); return
      case 'sh_change_effect': eng.setEffect(t, fld(b, 'E'), eng.getEffect(t, fld(b, 'E')) + this.n(b, 'N', c)); return
      case 'sh_set_effect': eng.setEffect(t, fld(b, 'E'), this.n(b, 'N', c)); return
      case 'sh_clear_effects': for (const e of ['color', 'ghost', 'brightness']) eng.setEffect(t, e, 0); return
      case 'sh_show': eng.setVisible(this.spriteOrFail(b, c), true); return
      case 'sh_hide': eng.setVisible(this.spriteOrFail(b, c), false); return
      case 'sh_layer': eng.goLayer(this.spriteOrFail(b, c), fld(b, 'L') === 'back' ? 'back' : 'front'); return
      case 'sh_layer_by': eng.goLayerBy(this.spriteOrFail(b, c), Math.max(0, Math.round(this.n(b, 'N', c))), fld(b, 'D') === 'backward' ? 'backward' : 'forward'); return

      // ── ses ──
      case 'sh_play': eng.playSound(t, fld(b, 'S')); return
      case 'sh_play_until': { const ms = eng.playSound(t, fld(b, 'S')); if (ms > 0) yield* this.waitMs(ms); return }
      case 'sh_stop_sounds': eng.stopSounds(); return
      case 'sh_play_note': { const ms = eng.playNote(t, toNum(fld(b, 'NOTE')), this.n(b, 'B', c)); yield* this.waitMs(ms); return }
      case 'sh_change_pitch': t.pitch = Math.max(-360, Math.min(360, t.pitch + this.n(b, 'N', c))); return
      case 'sh_set_pitch': t.pitch = Math.max(-360, Math.min(360, this.n(b, 'N', c))); return
      case 'sh_clear_sfx': t.pitch = 0; return
      case 'sh_change_volume': t.volume = Math.max(0, Math.min(100, t.volume + this.n(b, 'N', c))); return
      case 'sh_set_volume': t.volume = Math.max(0, Math.min(100, this.n(b, 'N', c))); return

      // ── olaylar ──
      case 'sh_broadcast': this.startMessage(fld(b, 'M')); return
      case 'sh_broadcast_wait': {
        const started = this.startMessage(fld(b, 'M'))
        while (started.some((x) => !x.done)) yield
        return
      }

      // ── kontrol ──
      case 'sh_wait': yield* this.waitMs(this.n(b, 'S', c) * 1000); return
      case 'sh_repeat': {
        const n = Math.max(0, Math.round(this.n(b, 'N', c)))
        const body = inp(b, 'DO')
        for (let i = 0; i < n; i++) {
          yield* this.chain(body, c)
          if (this.yieldNow()) yield
        }
        return
      }
      case 'sh_forever': {
        const body = inp(b, 'DO')
        for (;;) {
          yield* this.chain(body, c)
          if (this.yieldNow() || !body) yield
        }
      }
      case 'sh_if': if (toBool(this.value(inp(b, 'C'), c))) yield* this.chain(inp(b, 'DO'), c); return
      case 'sh_if_else': yield* this.chain(toBool(this.value(inp(b, 'C'), c)) ? inp(b, 'DO') : inp(b, 'ELSE'), c); return
      case 'sh_wait_until': while (!toBool(this.value(inp(b, 'C'), c))) yield; return
      case 'sh_repeat_until': {
        const body = inp(b, 'DO')
        while (!toBool(this.value(inp(b, 'C'), c))) {
          yield* this.chain(body, c)
          if (this.yieldNow() || !body) yield
        }
        return
      }
      case 'sh_stop': {
        const w = fld(b, 'W')
        if (w === 'all') { this.stopAll(false); throw STOP }
        if (w === 'others') { for (const th of this.threads) if (th !== c.thread && th.target === t) th.done = true; return }
        throw STOP
      }
      case 'sh_create_clone': {
        const w = fld(b, 'T')
        const src = w === '_myself_' || w === '' ? t : eng.original(w)
        if (src) eng.createClone(src)
        return
      }
      case 'sh_delete_clone': if (t.isClone) { eng.deleteClone(t); throw STOP } return

      // ── algılama ──
      case 'sh_ask': {
        const q = this.s(b, 'Q', c)
        while (eng.asking) yield
        const mine = { uid: t.uid, text: q, target: t }
        eng.asking = mine
        eng.emit('ask', t, q)
        eng.redraw = true
        while (eng.asking === mine) yield
        return
      }
      case 'sh_reset_timer': eng.resetTimer(); return

      // ── değişkenler ──
      case 'sh_var_set': eng.setVar(varId(b, 'V'), this.value(inp(b, 'N'), c)); return
      case 'sh_var_change': { const id = varId(b, 'V'); eng.setVar(id, toNum(eng.getVar(id)) + this.n(b, 'N', c)); return }
      case 'sh_var_show': eng.varVisible.set(varId(b, 'V'), true); return
      case 'sh_var_hide': eng.varVisible.set(varId(b, 'V'), false); return
      case 'sh_list_show': eng.varVisible.set(varId(b, 'L'), true); return
      case 'sh_list_hide': eng.varVisible.set(varId(b, 'L'), false); return
      case 'sh_list_add': eng.listAdd(varId(b, 'L'), this.value(inp(b, 'I'), c)); return
      case 'sh_list_del_all': eng.list(varId(b, 'L')).length = 0; return
      case 'sh_list_del': { const l = eng.list(varId(b, 'L')); const i = Math.round(this.n(b, 'N', c)); if (i >= 1 && i <= l.length) l.splice(i - 1, 1); return }
      case 'sh_list_insert': { const l = eng.list(varId(b, 'L')); const i = Math.round(this.n(b, 'N', c)); const v = this.value(inp(b, 'I'), c); if (i >= 1 && i <= l.length + 1) l.splice(i - 1, 0, v); return }
      case 'sh_list_replace': { const l = eng.list(varId(b, 'L')); const i = Math.round(this.n(b, 'N', c)); const v = this.value(inp(b, 'I'), c); if (i >= 1 && i <= l.length) l[i - 1] = v; return }

      // ── kalem ──
      case 'sh_pen_down': eng.setPenDown(this.spriteOrFail(b, c), true); return
      case 'sh_pen_up': t.penDown = false; return
      case 'sh_pen_clear': eng.penClear(); return
      case 'sh_pen_stamp': eng.penStamp(t); return
      case 'sh_pen_color': t.penColor = fld(b, 'C') || '#1e88e5'; return
      case 'sh_pen_set_size': t.penSize = Math.max(1, Math.min(200, this.n(b, 'N', c))); return
      case 'sh_pen_change_size': t.penSize = Math.max(1, Math.min(200, t.penSize + this.n(b, 'N', c))); return

      default: {
        if (b.type.startsWith(PROC_CALL_PREFIX)) {
          const id = b.type.slice(PROC_CALL_PREFIX.length)
          const proc = t.procs.find((p) => p.id === id)
          const body = this.procs.get(t.defId)?.get(id)
          if (!proc || (!body && !this.procs.get(t.defId)?.has(id))) return
          if (c.depth >= MAX_DEPTH) throw new ProgramError(`'${proc.name}' bloğu kendini çok kez çağırdı (en çok ${MAX_DEPTH} iç içe çağrı). Bir bitiş koşulu ekle.`, b.id ?? null)
          const locals = new Map<string, Value>()
          proc.params.forEach((p, i) => locals.set(p, this.value(inp(b, `P${i}`), c)))
          yield* this.chain(body, { t, thread: c.thread, locals, depth: c.depth + 1 })
          return
        }
        // değer bloğu deyim olarak: yok say
        return
      }
    }
  }

  /** "Şuraya git / şuraya dön" hedefinin konumu. */
  private place(w: string, _self: RtTarget): [number, number] | null {
    const eng = this.engine
    if (w === '_mouse_') return [eng.mouse.x, eng.mouse.y]
    if (w === '_random_') return [Math.round(eng.rand() * 480 - 240), Math.round(eng.rand() * 360 - 180)]
    const o = eng.original(w)
    return o ? [o.x, o.y] : null
  }

  // ───────── ifadeler ─────────
  value(b: BlockNode | undefined, c: Ctx): Value {
    if (!b) return 0
    const eng = this.engine
    const t = c.t
    const num = (name: string): number => toNum(this.value(inp(b, name), c))
    const str = (name: string): string => toStr(this.value(inp(b, name), c))
    switch (b.type) {
      case 'math_number': return toNum(b.fields?.NUM as Value)
      case 'text': return String(b.fields?.TEXT ?? '')
      case VAR_GET: return eng.getVar(varId(b, 'VAR'))
      case ARG_BLOCK: return c.locals?.get(fld(b, 'NAME')) ?? 0
      // hareket
      case 'sh_xpos': return Math.round(t.x * 100) / 100
      case 'sh_ypos': return Math.round(t.y * 100) / 100
      case 'sh_dir': return t.dir
      // görünüm
      case 'sh_costume_info': { const cs = t.costumes[t.costume]; return fld(b, 'P') === 'name' ? cs?.name ?? '' : t.costume + 1 }
      case 'sh_backdrop_info': { const cs = eng.stage.costumes[eng.stage.costume]; return fld(b, 'P') === 'name' ? cs?.name ?? '' : eng.stage.costume + 1 }
      case 'sh_size': return Math.round(t.size)
      case 'sh_volume': return t.volume
      // algılama
      case 'sh_touching': return eng.touching(t, fld(b, 'T'))
      case 'sh_distance': return eng.distanceTo(t, fld(b, 'T'))
      case 'sh_answer': return eng.answer
      case 'sh_key_pressed': { const k = fld(b, 'K'); return k === 'any' ? eng.keys.size > 0 : eng.keys.has(k) }
      case 'sh_mouse_down': return eng.mouse.down
      case 'sh_mouse_x': return Math.round(eng.mouse.x)
      case 'sh_mouse_y': return Math.round(eng.mouse.y)
      case 'sh_timer': return Math.round(eng.timer * 100) / 100
      case 'sh_of': {
        const w = fld(b, 'T')
        const o = w === '_stage_' ? eng.stage : eng.original(w)
        if (!o) return 0
        switch (fld(b, 'P')) { case 'x': return o.x; case 'y': return o.y; case 'dir': return o.dir; case 'costume': return o.costume + 1; case 'size': return o.size; default: return 0 }
      }
      case 'sh_current': {
        const d = new Date()
        switch (fld(b, 'U')) {
          case 'year': return d.getFullYear(); case 'month': return d.getMonth() + 1; case 'date': return d.getDate(); case 'dayofweek': return d.getDay() + 1
          case 'hour': return d.getHours(); case 'minute': return d.getMinutes(); default: return d.getSeconds()
        }
      }
      // işlemler
      case 'sh_add': return num('A') + num('B')
      case 'sh_sub': return num('A') - num('B')
      case 'sh_mul': return num('A') * num('B')
      case 'sh_div': { const d = num('B'); return d === 0 ? 0 : num('A') / d }
      case 'sh_mod': { const a = num('A'), d = num('B'); if (d === 0) return 0; const m = a % d; return m !== 0 && (m < 0) !== (d < 0) ? m + d : m }
      case 'sh_round': return Math.round(num('N'))
      case 'sh_random': {
        const av = this.value(inp(b, 'A'), c), bv = this.value(inp(b, 'B'), c)
        let lo = toNum(av), hi = toNum(bv)
        if (lo > hi) [lo, hi] = [hi, lo]
        const whole = (v: Value) => Number.isInteger(toNum(v)) && !(typeof v === 'string' && /[.,]/.test(v))
        if (whole(av) && whole(bv)) return Math.floor(eng.rand() * (hi - lo + 1)) + lo
        return eng.rand() * (hi - lo) + lo
      }
      case 'sh_gt': return compareValues(this.value(inp(b, 'A'), c), this.value(inp(b, 'B'), c)) > 0
      case 'sh_lt': return compareValues(this.value(inp(b, 'A'), c), this.value(inp(b, 'B'), c)) < 0
      case 'sh_eq': return compareValues(this.value(inp(b, 'A'), c), this.value(inp(b, 'B'), c)) === 0
      case 'sh_and': return toBool(this.value(inp(b, 'A'), c)) && toBool(this.value(inp(b, 'B'), c))
      case 'sh_or': return toBool(this.value(inp(b, 'A'), c)) || toBool(this.value(inp(b, 'B'), c))
      case 'sh_not': return !toBool(this.value(inp(b, 'A'), c))
      case 'sh_join': return (str('A') + str('B')).slice(0, 10000)
      case 'sh_letter': { const i = Math.round(num('N')); const s = str('S'); return i >= 1 && i <= s.length ? s[i - 1] : '' }
      case 'sh_length': return str('S').length
      case 'sh_contains': return str('A').toLowerCase().includes(str('B').toLowerCase())
      case 'sh_math': {
        const x = num('N')
        switch (fld(b, 'OP')) {
          case 'abs': return Math.abs(x)
          case 'floor': return Math.floor(x)
          case 'ceiling': return Math.ceil(x)
          case 'sqrt': return x < 0 ? 0 : Math.sqrt(x)
          case 'sin': return Math.round(Math.sin(rad(x)) * 1e10) / 1e10
          case 'cos': return Math.round(Math.cos(rad(x)) * 1e10) / 1e10
          case 'tan': return Math.round(Math.tan(rad(x)) * 1e10) / 1e10
          case 'ln': return x > 0 ? Math.log(x) : 0
          case 'log': return x > 0 ? Math.log10(x) : 0
          default: return 0
        }
      }
      // listeler
      case 'sh_list_item': { const l = eng.list(varId(b, 'L')); const i = Math.round(num('N')); return i >= 1 && i <= l.length ? l[i - 1] : '' }
      case 'sh_list_index': { const l = eng.list(varId(b, 'L')); const v = this.value(inp(b, 'I'), c); const i = l.findIndex((x) => compareValues(x, v) === 0); return i + 1 }
      case 'sh_list_len': return eng.list(varId(b, 'L')).length
      case 'sh_list_has': { const l = eng.list(varId(b, 'L')); const v = this.value(inp(b, 'I'), c); return l.some((x) => compareValues(x, v) === 0) }
      case 'sh_list_ref': { const l = eng.list(varId(b, 'L')).map(toStr); return l.every((x) => x.length === 1) ? l.join('') : l.join(' ') }
      default: return 0
    }
  }
}


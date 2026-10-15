'use client'
// Mikro Kart — Blockly blok çalışma alanı (Scratch benzeri zelos çizici, kendi blok setimiz). Yalnız istemcide, dinamik import ile yüklenir.
import { useEffect, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { MESSAGES_TR } from '@/lib/mikro/messages'
import { BLOCK_BY_TYPE, BLOCK_JSON, CATEGORIES, shade, styleName, toolboxJson } from '@/lib/mikro/blocks'
import type { RobotProfile } from '@/lib/mikro/robot'
import type { WorkspaceState } from '@/lib/mikro/types'
import { askText } from './dialogs'
import './mikro-blockly.css'

type B = typeof BlocklyNS

export interface BlocklyPaneProps {
  workspace: WorkspaceState
  onChange: (ws: WorkspaceState) => void
  /** Paletteki blok türleri (yoksa hepsi). */
  allowedBlocks?: string[] | null
  /** Değişince çalışma alanı `workspace` ile yeniden yüklenir (yeni proje, örnek, sıfırlama). */
  resetKey?: string
  /** Şu an çalışan başlık blokları parlar. */
  activeHatIds?: string[]
  /** Hata veren blok seçilip görünür yapılır. */
  errorBlockId?: string | null
  /** Kart bir robot gövdesine takılıysa: Robot kategorisi bu gövdenin bloklarıyla açılır. */
  robot?: RobotProfile | null
}

let defined = false
function defineOnce(Blockly: B) {
  if (defined) return
  defined = true

  // 5x5 LED deseni alanı: 25 karakterlik '0'/'1' dizisi; kutulara tıklayarak yakılır/söndürülür.
  const CELL = 13, GAP = 3
  class FieldLeds extends Blockly.Field<string> {
    private cells?: SVGRectElement[]
    SERIALIZABLE = true
    CURSOR = 'pointer'
    constructor(value?: string) { super(value ?? '0'.repeat(25)) }
    static fromJson(options: BlocklyNS.FieldConfig & { value?: string }) { return new FieldLeds(options.value) }
    protected doClassValidator_(v?: unknown): string | null | undefined {
      const s = String(v ?? '')
      return /^[01]{25}$/.test(s) ? s : null
    }
    protected initView() {
      const g = this.fieldGroup_ as SVGGElement
      const bg = Blockly.utils.dom.createSvgElement('rect', { x: 0, y: 0, width: 5 * (CELL + GAP) + GAP, height: 5 * (CELL + GAP) + GAP, rx: 6, class: 'mkb-led-bg' }, g)
      void bg
      this.cells = []
      for (let i = 0; i < 25; i++) {
        const x = GAP + (i % 5) * (CELL + GAP), y = GAP + Math.floor(i / 5) * (CELL + GAP)
        const r = Blockly.utils.dom.createSvgElement('rect', { x, y, width: CELL, height: CELL, rx: 3, class: 'mkb-led', 'data-i': String(i) }, g) as SVGRectElement
        this.cells.push(r)
      }
      this.paint()
    }
    protected updateSize_() {
      const w = 5 * (CELL + GAP) + GAP
      this.size_ = new Blockly.utils.Size(w, w)
    }
    protected render_() { this.paint(); this.updateSize_() }
    private paint() {
      const v = String(this.getValue() ?? '')
      this.cells?.forEach((c, i) => c.classList.toggle('on', v[i] === '1'))
    }
    protected showEditor_(e?: Event) {
      const t = e?.target as Element | undefined
      const i = Number(t?.getAttribute?.('data-i'))
      if (!Number.isInteger(i) || i < 0 || i > 24) return
      const v = String(this.getValue() ?? '0'.repeat(25)).split('')
      v[i] = v[i] === '1' ? '0' : '1'
      this.setValue(v.join(''))
    }
    protected doValueUpdate_(v: unknown) { super.doValueUpdate_(v as string); this.paint() }
    getText_(): string { return '' }
  }
  Blockly.fieldRegistry.register('field_mk_leds', FieldLeds as unknown as Parameters<typeof Blockly.fieldRegistry.register>[1])
  Blockly.defineBlocksWithJsonArray(BLOCK_JSON as unknown as object[])
}

const BUILTIN_STYLE: Record<string, string> = {
  loop_blocks: 'loops', logic_blocks: 'logic', math_blocks: 'math', text_blocks: 'text', list_blocks: 'list',
  variable_blocks: 'vars', variable_dynamic_blocks: 'vars', procedure_blocks: 'func',
}

function makeTheme(Blockly: B) {
  const colorOf = (k: string) => CATEGORIES.find((c) => c.key === k)!.color
  const style = (hex: string) => ({ colourPrimary: hex, colourSecondary: shade(hex, 0.25), colourTertiary: shade(hex, -0.25), hat: 'cap' })
  const blockStyles: Record<string, ReturnType<typeof style>> = {}
  for (const c of CATEGORIES) blockStyles[styleName(c.key)] = style(c.color)
  for (const [name, key] of Object.entries(BUILTIN_STYLE)) blockStyles[name] = style(colorOf(key))
  const categoryStyles = Object.fromEntries(CATEGORIES.map((c) => [`mk_cat_${c.key}`, { colour: c.color }]))
  return Blockly.Theme.defineTheme('mk_scratch', {
    name: 'mk_scratch',
    base: Blockly.Themes.Classic,
    blockStyles,
    categoryStyles,
    componentStyles: {
      workspaceBackgroundColour: '#f3f6fc',
      toolboxBackgroundColour: '#ffffff',
      toolboxForegroundColour: '#575e75',
      flyoutBackgroundColour: '#e6edf7',
      flyoutOpacity: 1,
      scrollbarColour: '#8b97ad',
      scrollbarOpacity: 0.5,
      insertionMarkerColour: '#000000',
      insertionMarkerOpacity: 0.25,
      selectedGlowColour: '#ffd23f',
      selectedGlowOpacity: 0.9,
    },
    fontStyle: { family: 'system-ui, "Segoe UI", Roboto, "Noto Color Emoji", sans-serif', weight: '700', size: 14 },
    startHats: true,
  })
}

const iconCss = () => CATEGORIES.map((c) => `.mkb-ic-${c.key}{--mkb-c:${c.color}}.mkb-ic-${c.key}::after{content:'${c.icon}'}`).join('\n')

/** Yığınlar üst üste biniyorsa (örnek/etkinlik projeleri konumsuz yazılır) alt alta dizer; sonra sol üst köşeyi görünür yapar. */
function showTopLeft(ws: BlocklyNS.WorkspaceSvg) {
  try {
    const tops = ws.getTopBlocks(true)
    const rects = tops.map((t) => t.getBoundingRectangle())
    let overlap = false
    for (let i = 0; i < rects.length && !overlap; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j]
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) { overlap = true; break }
    }
    if (overlap) ws.cleanUp()
    const bb = ws.getBlocksBoundingBox()
    ws.scroll(24 - bb.left * ws.scale, 24 - bb.top * ws.scale)
  } catch { /* yoksay */ }
}

const isHatLike = (type: string) => BLOCK_BY_TYPE[type]?.kind === 'hat' || type === 'procedures_defnoreturn' || type === 'procedures_defreturn'

export function BlocklyPane({ workspace, onChange, allowedBlocks, resetKey, activeHatIds, errorBlockId, robot }: BlocklyPaneProps) {
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const blocklyRef = useRef<B | null>(null)
  const [ready, setReady] = useState(false)
  const [empty, setEmpty] = useState(!(workspace.blocks?.blocks?.length))
  const [failed, setFailed] = useState(false)
  const cb = useRef({ onChange, allowedBlocks, robot })
  cb.current = { onChange, allowedBlocks, robot }
  const lastSig = useRef<string | null>(null)
  const lastReset = useRef<string | undefined>(undefined)
  const loading = useRef(false)
  const wsPropRef = useRef(workspace)
  wsPropRef.current = workspace
  const glowRef = useRef<string[]>(activeHatIds ?? [])
  glowRef.current = activeHatIds ?? []

  const decorate = () => {
    const ws = wsRef.current
    if (!ws) return
    const glow = new Set(glowRef.current)
    for (const b of ws.getTopBlocks(false)) {
      const el = b.getSvgRoot()
      el.classList.toggle('mkb-orphan', !isHatLike(b.type))
      el.classList.toggle('mkb-running', glow.has(b.id))
    }
  }

  // ---- kurulum ----
  useEffect(() => {
    let disposed = false
    let ws: BlocklyNS.WorkspaceSvg | null = null
    let ro: ResizeObserver | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    ;(async () => {
      try {
        const Blockly = await import('blockly')
        const Tr = await import('blockly/msg/tr').catch(() => null)
        if (disposed || !host.current) return
        if (Tr) Blockly.setLocale(Tr as unknown as Parameters<typeof Blockly.setLocale>[0])
        Object.assign(Blockly.Msg, MESSAGES_TR)
        defineOnce(Blockly)
        Blockly.dialog.setPrompt((message, defaultValue, callback) => askText(message, defaultValue, callback))
        Blockly.dialog.setConfirm((message, callback) => callback(window.confirm(message)))
        Blockly.dialog.setAlert((message, callback) => { window.alert(message); callback?.() })
        blocklyRef.current = Blockly
        ws = Blockly.inject(host.current, {
          renderer: 'zelos',
          theme: makeTheme(Blockly),
          toolbox: toolboxJson(cb.current.allowedBlocks, cb.current.robot) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo,
          media: '/blockly/media/',
          sounds: false,
          grid: { spacing: 0, length: 0, colour: '#0000', snap: false },
          trashcan: true,
          scrollbars: true,
          move: { scrollbars: true, drag: true, wheel: true },
          zoom: { controls: true, wheel: false, pinch: true, startScale: host.current.clientWidth < 560 ? 0.7 : 0.85, minScale: 0.4, maxScale: 2.2, scaleSpeed: 1.2 },
          collapse: false,
          comments: false,
          disable: true,
        })
        wsRef.current = ws
        const w = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws // test/hata ayıklama için

        const emit = () => {
          timer = null
          if (disposed) return
          if (w.isDragging()) { timer = setTimeout(emit, 150); return }
          const state = Blockly.serialization.workspaces.save(w) as unknown as WorkspaceState
          lastSig.current = JSON.stringify(state)
          cb.current.onChange(state)
        }
        w.addChangeListener((e: BlocklyNS.Events.Abstract) => {
          if (loading.current || e.isUiEvent) return
          const t = e.type
          if (t === Blockly.Events.BLOCK_CREATE || t === Blockly.Events.BLOCK_DELETE || t === Blockly.Events.BLOCK_CHANGE || t === Blockly.Events.BLOCK_MOVE || t === Blockly.Events.VAR_CREATE || t === Blockly.Events.VAR_DELETE || t === Blockly.Events.VAR_RENAME || t === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
            setEmpty(w.getTopBlocks(false).length === 0)
            decorate()
            if (timer) clearTimeout(timer)
            timer = setTimeout(emit, 150)
          }
        })
        ro = new ResizeObserver(() => { if (wsRef.current) Blockly.svgResize(wsRef.current) })
        ro.observe(host.current)
        setReady(true)
      } catch (err) {
        console.error('Blockly yüklenemedi', err)
        setFailed(true)
      }
    })()
    return () => {
      disposed = true
      if (timer) clearTimeout(timer)
      ro?.disconnect()
      ws?.dispose()
      wsRef.current = null
      setReady(false)
    }
  }, [])

  // ---- dışarıdan gelen proje / sıfırlama ----
  useEffect(() => {
    const ws = wsRef.current
    const Blockly = blocklyRef.current
    if (!ready || !ws || !Blockly) return
    const sig = JSON.stringify(workspace)
    if (lastSig.current === sig && lastReset.current === resetKey) return
    lastSig.current = sig
    lastReset.current = resetKey
    loading.current = true
    Blockly.Events.disable()
    try {
      ws.clear()
      Blockly.serialization.workspaces.load(workspace as unknown as object, ws, { recordUndo: false })
      ws.clearUndo()
      if (workspace.blocks?.blocks?.length) showTopLeft(ws)
    } catch (err) {
      console.error('Proje yüklenemedi', err)
    } finally {
      Blockly.Events.enable()
      loading.current = false
    }
    setEmpty(ws.getTopBlocks(false).length === 0)
    decorate()
  }, [workspace, resetKey, ready])

  // ---- palet ----
  const allowSig = `${(allowedBlocks ?? ['*']).join(',')}|${robot?.id ?? ''}`
  useEffect(() => {
    if (!ready || !wsRef.current) return
    wsRef.current.updateToolbox(toolboxJson(cb.current.allowedBlocks, cb.current.robot) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo)
  }, [allowSig, ready])

  const glowSig = (activeHatIds ?? []).join(',')
  useEffect(() => { decorate() }, [glowSig, ready])

  // ---- hatalı blok ----
  useEffect(() => {
    const ws = wsRef.current
    if (!ready || !ws) return
    for (const b of ws.getAllBlocks(false)) b.getSvgRoot()?.classList.remove('mkb-error')
    if (!errorBlockId) return
    const blk = ws.getBlockById(errorBlockId)
    if (!blk) return
    blk.getSvgRoot().classList.add('mkb-error')
    try { ws.centerOnBlock(errorBlockId) } catch { /* yoksay */ }
  }, [errorBlockId, ready])

  return (
    <div className="mkb-ws" data-blockly-ready={ready} data-testid="mikro-blockly">
      <style>{iconCss()}</style>
      <div ref={host} className="mkb-host" />
      {ready && empty && <div className="mkb-hint" aria-hidden="true">Soldan bir <b>başlık</b> bloğu seç ve buraya sürükle</div>}
      {failed && <p className="mkb-fail" role="alert">Blok editörü yüklenemedi. Sayfayı yenile.</p>}
    </div>
  )
}

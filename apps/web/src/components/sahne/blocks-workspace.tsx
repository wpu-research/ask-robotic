'use client'
// Sahne Atölyesi — Blockly (zelos) blok çalışma alanı. Yalnız istemcide, dinamik import ile yüklenir.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { CATEGORIES, PROC_DEF_PREFIX, toolboxJson } from '@/lib/sahne/blocks'
import { defineProcBlocks, defineSahneBlocks, makeTheme, registerFlyouts } from '@/lib/sahne/blockly-defs'
import type { BlockState, ProcDef, VarDef } from '@/lib/sahne/types'

type B = typeof BlocklyNS

export interface BlocksHandle {
  undo: () => void
  redo: () => void
  /** Blokları düzenli bir sütuna dizer. */
  arrange: () => void
  focusBlock: (id: string | null | undefined) => void
  /** "Bir blok yap" sonrası tanım bloğunu çalışma alanına koyar. */
  addProcDef: (p: ProcDef) => void
}

export interface BlocksWorkspaceProps {
  /** Etkin hedefin blokları (değişken listesi dahil). Yalnız `loadKey` değişince (ya da ilk kurulumda) yüklenir. */
  state: BlockState
  loadKey: string
  /** `loadKey`: çıktının ait olduğu yükleme anahtarı (hedef geçişinde bekleyen düzenleme eski hedefe yazılsın diye). */
  onChange: (s: BlockState, loadKey: string) => void
  allowedBlocks?: readonly string[]
  /** Etkin hedefin kendi blokları ve projenin değişkenleri. */
  procs: ProcDef[]
  /** Hepsinin (tüm hedeflerin) blok tanımları: Blockly'de tür olarak kayıtlı olmalı. */
  allProcs: ProcDef[]
  vars: VarDef[]
  onNewVar: (kind: 'var' | 'list') => void
  onNewProc: () => void
  /** Çalışan üst düzey blok kimlikleri (parıltı). */
  glowIds?: string[]
  /** Çalışma alanında bir yığına tıklandı. */
  onRunStack?: (topId: string) => void
}

const iconCss = CATEGORIES.map((c) => `.blocklyToolboxCategory:has(.shb-ic-${c.key}), .shb-ic-${c.key}{--shb-c:${c.colour}}\n.shb-ws .shb-ic-${c.key}::after{content:'${c.icon}'}`).join('\n')

export const BlocksWorkspace = forwardRef<BlocksHandle, BlocksWorkspaceProps>(function BlocksWorkspace(props, ref) {
  const { state, loadKey, onChange, allowedBlocks, procs, allProcs, vars, glowIds } = props
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const blocklyRef = useRef<B | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [empty, setEmpty] = useState(true)

  const live = useRef(props)
  live.current = props
  const loading = useRef(false)
  const lastLoad = useRef<string | null>(null)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emitNow = useRef<() => void>(() => undefined)
  const glowRef = useRef<string[]>(glowIds ?? [])
  glowRef.current = glowIds ?? []

  useImperativeHandle(ref, () => ({
    undo: () => wsRef.current?.undo(false),
    redo: () => wsRef.current?.undo(true),
    arrange: () => { (wsRef.current as unknown as { cleanUp?: () => void } | null)?.cleanUp?.() },
    focusBlock: (id) => {
      const ws = wsRef.current, Bk = blocklyRef.current
      if (!ws || !Bk || !id) return
      const b = ws.getBlockById(id)
      if (!b) return
      try { Bk.common.setMainWorkspace(ws); b.select(); ws.centerOnBlock(id) } catch { /* sürüm farkı: yok say */ }
    },
    addProcDef: (p) => {
      const ws = wsRef.current, Bk = blocklyRef.current
      if (!ws || !Bk) return
      defineProcBlocks(Bk, live.current.allProcs)
      const type = PROC_DEF_PREFIX + p.id
      const blk = ws.newBlock(type)
      blk.initSvg()
      blk.render()
      const others = ws.getTopBlocks(false).filter((x) => x.id !== blk.id)
      const bottom = others.reduce((m, x) => Math.max(m, x.getBoundingRectangle().bottom), 0)
      blk.moveBy(40, others.length ? bottom + 40 : 40)
      blk.select()
      ws.centerOnBlock(blk.id)
    },
  }), [])

  /** Çalışan yığınlara parıltı verir. */
  const decorate = () => {
    const ws = wsRef.current
    if (!ws) return
    const glow = new Set(glowRef.current)
    for (const b of ws.getTopBlocks(false)) b.getSvgRoot()?.classList.toggle('shb-running', glow.has(b.id))
  }

  // ---- kurulum ----
  useEffect(() => {
    let disposed = false
    let ws: BlocklyNS.WorkspaceSvg | null = null
    let ro: ResizeObserver | null = null
    ;(async () => {
      try {
        const Blockly = await import('blockly')
        const Tr = await import('blockly/msg/tr').catch(() => null)
        if (disposed || !host.current) return
        if (Tr) Blockly.setLocale(Tr as unknown as Parameters<typeof Blockly.setLocale>[0])
        defineSahneBlocks(Blockly)
        defineProcBlocks(Blockly, live.current.allProcs)
        blocklyRef.current = Blockly
        ws = Blockly.inject(host.current, {
          renderer: 'zelos',
          theme: makeTheme(Blockly),
          toolbox: toolboxJson(live.current.allowedBlocks) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo,
          media: '/blockly/media/',
          sounds: false,
          grid: { spacing: 0, length: 0, colour: '#0000', snap: false },
          trashcan: true,
          scrollbars: true,
          move: { scrollbars: true, drag: true, wheel: true },
          zoom: { controls: true, wheel: false, pinch: true, startScale: host.current.clientWidth < 520 ? 0.8 : 0.95, minScale: 0.4, maxScale: 2, scaleSpeed: 1.2 },
          collapse: false,
          comments: false,
          disable: false,
        })
        wsRef.current = ws
        const w = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws // test/hata ayıklama için
        registerFlyouts(w, {
          vars: () => live.current.vars,
          procs: () => live.current.procs,
          allowed: () => (live.current.allowedBlocks ? new Set(live.current.allowedBlocks) : null),
          newVar: () => live.current.onNewVar('var'),
          newList: () => live.current.onNewVar('list'),
          newProc: () => live.current.onNewProc(),
        })

        const emit = () => {
          pending.current = null
          if (disposed) return
          if (w.isDragging()) { pending.current = setTimeout(emit, 150); return }
          live.current.onChange(Blockly.serialization.workspaces.save(w) as unknown as BlockState, lastLoad.current ?? '')
        }
        emitNow.current = () => { if (pending.current) { clearTimeout(pending.current); emit() } }

        w.addChangeListener((e: BlocklyNS.Events.Abstract) => {
          if (loading.current) return
          const t = e.type
          if (t === Blockly.Events.CLICK) {
            const ce = e as BlocklyNS.Events.Click
            if (ce.targetType === 'block' && ce.blockId) {
              const blk = w.getBlockById(ce.blockId)
              if (blk) live.current.onRunStack?.(blk.getRootBlock().id)
            }
            return
          }
          if (e.isUiEvent) return
          if (t === Blockly.Events.VAR_CREATE) return
          setEmpty(w.getTopBlocks(false).length === 0)
          decorate()
          if (pending.current) clearTimeout(pending.current)
          pending.current = setTimeout(emit, 180)
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
      if (pending.current) clearTimeout(pending.current)
      ro?.disconnect()
      ws?.dispose()
      wsRef.current = null
      setReady(false)
    }
  }, [])

  // ---- hedef değişince / dışarıdan sıfırlanınca yükle ----
  useEffect(() => {
    const ws = wsRef.current, Blockly = blocklyRef.current
    if (!ready || !ws || !Blockly) return
    if (lastLoad.current === loadKey) return
    emitNow.current() // bekleyen düzenleme önceki hedefe yazılsın
    lastLoad.current = loadKey
    loading.current = true
    Blockly.Events.disable()
    try {
      defineProcBlocks(Blockly, live.current.allProcs)
      ws.clear()
      Blockly.serialization.workspaces.load(state as never, ws, { recordUndo: false })
      ws.clearUndo()
    } catch (err) {
      console.error('Program yüklenemedi', err)
    } finally {
      Blockly.Events.enable()
      loading.current = false
    }
    setEmpty(ws.getTopBlocks(false).length === 0)
    ws.getToolbox()?.refreshSelection()
    decorate()
  }, [loadKey, ready])

  // ---- değişken listesi değişince çalışma alanı modelini eşitle ----
  const varSig = vars.map((v) => `${v.id}|${v.name}|${v.type}`).join(',')
  useEffect(() => {
    const ws = wsRef.current, Blockly = blocklyRef.current
    if (!ready || !ws || !Blockly) return
    loading.current = true
    Blockly.Events.disable()
    try {
      const map = ws.getVariableMap()
      for (const v of live.current.vars) if (!map.getVariableById(v.id)) map.createVariable(v.name, v.type, v.id)
    } finally {
      Blockly.Events.enable()
      loading.current = false
    }
    ws.getToolbox()?.refreshSelection()
  }, [varSig, ready])

  // ---- Bloklarım listesi değişince ----
  const procSig = allProcs.map((p) => `${p.id}|${p.name}|${p.params.join(',')}`).join(';') + '#' + procs.map((p) => p.id).join(',')
  useEffect(() => {
    const ws = wsRef.current, Blockly = blocklyRef.current
    if (!ready || !ws || !Blockly) return
    defineProcBlocks(Blockly, live.current.allProcs)
    ws.getToolbox()?.refreshSelection()
  }, [procSig, ready])

  // ---- izinli blok listesi ----
  const allowSig = (allowedBlocks ?? ['*']).join(',')
  useEffect(() => {
    if (!ready || !wsRef.current) return
    wsRef.current.updateToolbox(toolboxJson(live.current.allowedBlocks) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo)
  }, [allowSig, ready])

  const glowSig = (glowIds ?? []).join(',')
  useEffect(() => { decorate() }, [glowSig, ready])

  return (
    <div className="shb-ws" data-blockly-ready={ready} data-testid="sahne-blockly">
      <style>{iconCss}</style>
      <div ref={host} className="shb-host" />
      {ready && empty && <div className="shb-hint" aria-hidden="true">Soldan bir blok seç ve buraya sürükle. Önce bir <b>olay</b> bloğu (ör. 🏁 tıklanınca) ile başla.</div>}
      {failed && <p className="shb-fail" role="alert">Blok editörü yüklenemedi. Sayfayı yenile.</p>}
    </div>
  )
})

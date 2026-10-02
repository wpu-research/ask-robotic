'use client'
// Oyun Atölyesi — Blockly (zelos) blok çalışma alanı. Yalnız istemcide, dinamik import ile yüklenir.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { defineOyunBlocks, makeTheme, setOptionProviders, type ImageRef } from '@/lib/oyun/blockly-defs'
import { CATEGORIES, toolboxJson } from '@/lib/oyun/blocks'
import type { BlockState } from '@/lib/oyun/types'

type B = typeof BlocklyNS

export interface BlocksHandle {
  /** Blokları düzenli bir sütuna dizer. */
  arrange: () => void
  /** Hatalı bloğu seçip görünüme getirir. */
  focusBlock: (id: string | null | undefined) => void
  undo: () => void
  redo: () => void
}

export interface BlocksWorkspaceProps {
  state: BlockState
  onChange: (s: BlockState) => void
  /** Araç kutusundaki blok türleri (verilmezse hepsi). */
  allowedBlocks?: readonly string[]
  /** Resim açılır listesindeki resimler. */
  images: ImageRef[]
  /** Harita açılır listesindeki adlar. */
  maps: string[]
  /** Değişince çalışma alanı `state` ile yeniden yüklenir (örnek açma, içe aktarma). */
  resetKey?: string | number
}

const iconCss = CATEGORIES.map((c) => `.oyb-ic-${c.key}{--oyb-c:${c.colour}}`).join('\n')

export const BlocksWorkspace = forwardRef<BlocksHandle, BlocksWorkspaceProps>(function BlocksWorkspace({ state, onChange, allowedBlocks, images, maps, resetKey }, ref) {
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const blocklyRef = useRef<B | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [empty, setEmpty] = useState(true)

  const imagesRef = useRef(images); imagesRef.current = images
  const mapsRef = useRef(maps); mapsRef.current = maps
  const onChangeRef = useRef(onChange); onChangeRef.current = onChange
  const allowedRef = useRef(allowedBlocks); allowedRef.current = allowedBlocks
  const lastSig = useRef<string | null>(null)
  const lastReset = useRef<string | number | undefined>(undefined)
  const loading = useRef(false)

  useImperativeHandle(ref, () => ({
    arrange: () => { const ws = wsRef.current; if (ws) { (ws as unknown as { cleanUp: () => void }).cleanUp() } },
    focusBlock: (id) => {
      const ws = wsRef.current, Bk = blocklyRef.current
      if (!ws || !Bk || !id) return
      const b = ws.getBlockById(id)
      if (!b) return
      try { Bk.common.setMainWorkspace(ws); b.select(); ws.centerOnBlock(id) } catch { /* sürüm farkı: yok say */ }
    },
    undo: () => wsRef.current?.undo(false),
    redo: () => wsRef.current?.undo(true),
  }), [])

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
        setOptionProviders({ images: () => imagesRef.current, maps: () => mapsRef.current })
        defineOyunBlocks(Blockly)
        blocklyRef.current = Blockly
        ws = Blockly.inject(host.current, {
          renderer: 'zelos',
          theme: makeTheme(Blockly),
          toolbox: toolboxJson(allowedRef.current) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo,
          media: '/blockly/media/',
          sounds: false,
          grid: { spacing: 0, length: 0, colour: '#0000', snap: false },
          trashcan: true,
          scrollbars: true,
          move: { scrollbars: true, drag: true, wheel: true },
          zoom: { controls: true, wheel: false, pinch: true, startScale: host.current.clientWidth < 520 ? 0.8 : 0.95, minScale: 0.4, maxScale: 2, scaleSpeed: 1.2 },
          collapse: false,
          comments: false,
          disable: true,
        })
        wsRef.current = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws
        const w = ws
        const emit = () => {
          timer = null
          if (disposed) return
          if (w.isDragging()) { timer = setTimeout(emit, 150); return }
          const saved = Blockly.serialization.workspaces.save(w) as unknown as BlockState
          lastSig.current = JSON.stringify(saved)
          onChangeRef.current(saved)
        }
        w.addChangeListener((e: BlocklyNS.Events.Abstract) => {
          if (loading.current || e.isUiEvent) return
          setEmpty(w.getTopBlocks(false).length === 0)
          if (timer) clearTimeout(timer)
          timer = setTimeout(emit, 200)
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

  // ---- dışarıdan gelen program ----
  useEffect(() => {
    const ws = wsRef.current, Blockly = blocklyRef.current
    if (!ready || !ws || !Blockly) return
    const sig = JSON.stringify(state)
    if (lastSig.current === sig && lastReset.current === resetKey) return
    lastSig.current = sig
    lastReset.current = resetKey
    loading.current = true
    Blockly.Events.disable()
    try {
      Blockly.serialization.workspaces.load(state as never, ws, { recordUndo: false })
      ws.clearUndo()
    } catch (err) {
      console.error('Program yüklenemedi', err)
    } finally {
      Blockly.Events.enable()
      loading.current = false
    }
    setEmpty(ws.getTopBlocks(false).length === 0)
  }, [state, resetKey, ready])

  // ---- izinli blok listesi ----
  const allowSig = (allowedBlocks ?? ['*']).join(',')
  useEffect(() => {
    if (!ready || !wsRef.current) return
    wsRef.current.updateToolbox(toolboxJson(allowedRef.current) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo)
  }, [allowSig, ready])

  return (
    <div className="oy-blocks" data-blockly-ready={ready} data-testid="oyun-blockly">
      <style>{iconCss}</style>
      <div ref={host} className="oy-blocks-host" />
      {ready && empty && <div className="oy-blocks-hint" aria-hidden="true">Soldan bir <b>olay</b> bloğu seç (ör. Oyun → &quot;oyun başlayınca&quot;) ve buraya sürükle</div>}
      {failed && <p className="oy-blocks-fail" role="alert">Blok editörü yüklenemedi. Sayfayı yenile.</p>}
    </div>
  )
})

'use client'
// ASK Jr — Blockly tabanlı blok çalışma alanı (Scratch görünümü: zelos çizici). Yalnız istemcide, dinamik import ile yüklenir.
import { useEffect, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { TEXT_LIMIT, blockJsonFor, blockStyles, toolboxJson, typeOfName } from '@/lib/jr/blockly-blocks'
import { blockChainFromJson, scriptsToState, stateToScripts, type BlocklyJsonBlock } from '@/lib/jr/blockly-convert'
import { BLOCK_BY_TYPE, CATEGORIES } from '@/lib/jr/blocks'
import type { Block, BlockType, Script } from '@/lib/jr/types'
import { useLocale, useT } from '@/i18n/client'
import type { Locale } from '@/i18n'
import './jr-blockly.css'

type B = typeof BlocklyNS

export interface BlockWorkspaceProps {
  scripts: Script[]
  onChange: (scripts: Script[]) => void
  allowedBlocks: BlockType[]
  /** Bir yığına tıklanınca (Scratch gibi) o yığının blokları iletilir. */
  onRunStack?: (blocks: Block[]) => void
  /** Değişince çalışma alanı `scripts` ile yeniden yüklenir (karakter/sayfa değişimi). */
  resetKey?: string
  /** Parıldayacak üst düzey blok kimlikleri (çalışan yığınlar). */
  glowIds?: string[]
}

let extDefined = false
let definedLocale: Locale | null = null
/** Uzantıyı bir kez kaydeder; blok tanımlarını etkin dile göre (dil değişince yeniden) kaydeder. */
function defineFor(Blockly: B, locale: Locale) {
  if (!extDefined) {
    extDefined = true
    Blockly.Extensions.register('jr_text_limit', function (this: BlocklyNS.Block) {
      this.getField('TEXT')?.setValidator((v: unknown) => String(v ?? '').slice(0, TEXT_LIMIT))
    })
  }
  if (definedLocale === locale) return
  definedLocale = locale
  Blockly.defineBlocksWithJsonArray(blockJsonFor(locale) as unknown as object[])
}

function makeTheme(Blockly: B) {
  const categoryStyles = Object.fromEntries(CATEGORIES.map((c) => [`jr_cat_${c.key}`, { colour: c.color }]))
  return Blockly.Theme.defineTheme('jr_scratch', {
    name: 'jr_scratch',
    base: Blockly.Themes.Classic,
    blockStyles: blockStyles(),
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
    fontStyle: { family: 'system-ui, "Segoe UI", Roboto, "Noto Color Emoji", sans-serif', weight: '700', size: 17 },
    startHats: true,
  })
}

const iconCss = () =>
  CATEGORIES.map((c) => `.blocklyToolboxCategory:has(.jrb-ic-${c.key}), .jrb-ic-${c.key}{--jrb-c:${c.color}}`).join('\n')

export function BlockWorkspace({ scripts, onChange, allowedBlocks, onRunStack, resetKey, glowIds }: BlockWorkspaceProps) {
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const blocklyRef = useRef<B | null>(null)
  const [ready, setReady] = useState(false)
  const [empty, setEmpty] = useState(scripts.length === 0)
  const [failed, setFailed] = useState(false)
  const t = useT()
  const locale = useLocale()
  const localeRef = useRef(locale)
  localeRef.current = locale

  const cb = useRef({ onChange, onRunStack, allowedBlocks })
  cb.current = { onChange, onRunStack, allowedBlocks }
  const lastSig = useRef<string | null>(null)
  const lastReset = useRef<string | undefined>(undefined)
  const loading = useRef(false)
  const flyoutClickAt = useRef(-1e9)
  const lastTouched = useRef<string | null>(null)
  const scriptsRef = useRef(scripts)
  scriptsRef.current = scripts
  const glowRef = useRef<string[]>(glowIds ?? [])
  glowRef.current = glowIds ?? []

  /** Yetim (başlıksız) yığınları soluklaştırır, çalışan yığınlara parıltı verir. */
  const decorate = () => {
    const ws = wsRef.current
    if (!ws) return
    const glow = new Set(glowRef.current)
    for (const b of ws.getTopBlocks(false)) {
      const t = typeOfName(b.type)
      const el = b.getSvgRoot()
      el.classList.toggle('jrb-orphan', !!t && !BLOCK_BY_TYPE[t].trigger)
      el.classList.toggle('jrb-running', glow.has(b.id))
    }
  }

  /** Araç kutusunda tek tıklama ile oluşan bloğu yığının sonuna ekler (yığın yoksa ya da başlıksa yeni yığın). */
  const autoPlace = (Blockly: B, w: BlocklyNS.WorkspaceSvg, id: string) => {
    const nb = w.getBlockById(id)
    if (!nb || nb.getParent()) return
    const t = typeOfName(nb.type)
    if (!t) return
    Blockly.Events.setGroup(true)
    try {
      if (!BLOCK_BY_TYPE[t].trigger) {
        const tops = w.getTopBlocks(true).filter((b) => b.id !== nb.id)
        const touched = tops.find((b) => b.id === lastTouched.current)
        const order = [...(touched ? [touched] : []), ...tops.filter((b) => b !== touched).reverse()]
        for (const root of order) {
          let last: BlocklyNS.Block = root
          while (last.getNextBlock()) last = last.getNextBlock()!
          if (last.nextConnection && nb.previousConnection && w.connectionChecker.canConnect(last.nextConnection, nb.previousConnection, false)) {
            last.nextConnection.connect(nb.previousConnection)
            nb.select()
            return
          }
        }
      }
      // yeni yığın: diğerlerinin altında boş bir yere
      const others = w.getTopBlocks(false).filter((b) => b.id !== nb.id)
      const bottom = others.reduce((m, b) => Math.max(m, b.getBoundingRectangle().bottom), 0)
      const left = others.reduce((m, b) => Math.min(m, b.getBoundingRectangle().left), 24)
      const cur = nb.getRelativeToSurfaceXY()
      const y = others.length ? bottom + 24 : cur.y
      nb.moveBy(Math.max(left, 24) - cur.x, y - cur.y)
      nb.select()
    } finally {
      Blockly.Events.setGroup(false)
    }
  }

  // ---- Kurulum ----
  useEffect(() => {
    let disposed = false
    let ws: BlocklyNS.WorkspaceSvg | null = null
    let ro: ResizeObserver | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let removeListeners: (() => void) | null = null
    ;(async () => {
      try {
        const Blockly = await import('blockly')
        const Msg = await (locale === 'en' ? import('blockly/msg/en') : import('blockly/msg/tr')).catch(() => null)
        if (disposed || !host.current) return
        if (Msg) Blockly.setLocale(Msg as unknown as Parameters<typeof Blockly.setLocale>[0])
        defineFor(Blockly, locale)
        blocklyRef.current = Blockly
        ws = Blockly.inject(host.current, {
          renderer: 'zelos',
          theme: makeTheme(Blockly),
          toolbox: toolboxJson(cb.current.allowedBlocks, locale) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo,
          media: '/blockly/media/',
          sounds: false,
          grid: { spacing: 0, length: 0, colour: '#0000', snap: false },
          trashcan: true,
          scrollbars: true,
          move: { scrollbars: true, drag: true, wheel: true },
          zoom: { controls: true, wheel: false, pinch: true, startScale: host.current.clientWidth < 520 ? 0.9 : 1.15, minScale: 0.5, maxScale: 2.2, scaleSpeed: 1.2 },
          collapse: false,
          comments: false,
          disable: false,
        })
        wsRef.current = ws
        const w = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws // test/hata ayıklama için

        const emit = () => {
          timer = null
          if (disposed) return
          if (w.isDragging()) { timer = setTimeout(emit, 150); return }
          const state = Blockly.serialization.workspaces.save(w) as unknown
          const next = stateToScripts(state)
          lastSig.current = JSON.stringify(next)
          cb.current.onChange(next)
        }

        // Araç kutusunda sürüklemeden tek tıklama (tıkla-ekle) tespiti
        const el = host.current
        let downInFlyout = false
        let downAt = { x: 0, y: 0 }
        const onDown = (ev: PointerEvent) => { downInFlyout = !!(ev.target as Element).closest('.blocklyFlyout'); downAt = { x: ev.clientX, y: ev.clientY } }
        const onUp = (ev: PointerEvent) => {
          if (downInFlyout && Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y) < 8) flyoutClickAt.current = performance.now()
          downInFlyout = false
        }
        el.addEventListener('pointerdown', onDown, true)
        el.addEventListener('pointerup', onUp, true)
        removeListeners = () => { el.removeEventListener('pointerdown', onDown, true); el.removeEventListener('pointerup', onUp, true) }

        w.addChangeListener((e: BlocklyNS.Events.Abstract) => {
          if (loading.current) return
          const t = e.type
          if (t === Blockly.Events.BLOCK_CREATE && !e.isUiEvent && performance.now() - flyoutClickAt.current < 400) {
            flyoutClickAt.current = -1e9
            const id = (e as BlocklyNS.Events.BlockBase).blockId
            if (id) setTimeout(() => { if (!disposed) autoPlace(Blockly, w, id) }, 0)
          }
          if (t === Blockly.Events.CLICK) {
            const ce = e as BlocklyNS.Events.Click
            if (ce.targetType === 'block' && ce.blockId) {
              const blk = w.getBlockById(ce.blockId)
              if (blk && cb.current.onRunStack) {
                const root = blk.getRootBlock()
                lastTouched.current = root.id
                const json = Blockly.serialization.blocks.save(root) as unknown as BlocklyJsonBlock
                const blocks = blockChainFromJson(json)
                if (blocks.length) cb.current.onRunStack(blocks)
              }
            }
            return
          }
          if (e.isUiEvent) return
          if (t === Blockly.Events.BLOCK_CREATE || t === Blockly.Events.BLOCK_DELETE || t === Blockly.Events.BLOCK_CHANGE || t === Blockly.Events.BLOCK_MOVE) {
            const be = e as BlocklyNS.Events.BlockBase
            if (be.blockId && t !== Blockly.Events.BLOCK_DELETE) {
              const b = w.getBlockById(be.blockId)
              if (b) lastTouched.current = b.getRootBlock().id
            }
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
      removeListeners?.()
      ws?.dispose()
      wsRef.current = null
      lastSig.current = null // dil değişince yeni çalışma alanı betikleri yeniden yüklesin
      setReady(false)
    }
  }, [locale])

  // ---- Dışarıdan gelen betikler / sıfırlama ----
  useEffect(() => {
    const ws = wsRef.current
    const Blockly = blocklyRef.current
    if (!ready || !ws || !Blockly) return
    const sig = JSON.stringify(scripts)
    if (lastSig.current === sig && lastReset.current === resetKey) return
    lastSig.current = sig
    lastReset.current = resetKey
    loading.current = true
    Blockly.Events.disable()
    try {
      Blockly.serialization.workspaces.load(scriptsToState(scripts), ws, { recordUndo: false })
      ws.clearUndo()
    } finally {
      Blockly.Events.enable()
      loading.current = false
    }
    lastTouched.current = null
    setEmpty(scripts.length === 0)
    decorate()
  }, [scripts, resetKey, ready])

  // ---- İzinli blok listesi değişince araç kutusu ----
  const allowSig = allowedBlocks.join(',')
  useEffect(() => {
    if (!ready || !wsRef.current) return
    wsRef.current.updateToolbox(toolboxJson(cb.current.allowedBlocks, localeRef.current) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo)
  }, [allowSig, ready])

  const glowSig = (glowIds ?? []).join(',')
  useEffect(() => { decorate() }, [glowSig, ready])

  return (
    <div className="jrb-ws" data-blockly-ready={ready} data-testid="jr-blockly">
      <style>{iconCss()}</style>
      <div ref={host} className="jrb-host" />
      {ready && empty && <div className="jrb-hint" aria-hidden="true">{t('studios.jr.workspace.hint')}</div>}
      {failed && <p className="jrb-fail" role="alert">{t('studios.jr.workspace.failed')}</p>}
    </div>
  )
}

'use client'
// Oyun çerçevesi — Blockly (zelos) çalışma alanı. Yalnız istemcide; Blockly dinamik import ile yüklenir.
// Seviye değişince bileşen yeniden bağlanır (key), böylece araç kutusu ve blok sınırı temiz kurulur.
import { useEffect, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { blockCount, buildToolbox, toolboxCategories } from '@/lib/games/toolbox'
import type { ProgramState } from '@/lib/games/program'
import type { GameDef, LevelDef } from '@/lib/games/types'

type B = typeof BlocklyNS

export interface GameWorkspaceProps {
  game: GameDef
  level: LevelDef
  /** Açılışta yüklenecek program (kayıtlı ya da startBlocks); yoksa boş. */
  initial: ProgramState | null
  /** Çalışırken düzenleme kapalı. */
  readOnly: boolean
  /** Çalışan bloğun kimliği (vurgulanır). */
  highlightId: string | null
  /** Program her değiştiğinde (kısa gecikmeyle) serileştirilmiş program ve sayılan blok sayısı. */
  onChange: (program: ProgramState, blocks: number) => void
}

const defined = new Set<string>()
function defineGameBlocks(Blockly: B, game: GameDef) {
  const fresh = game.blocks
    .filter((d) => !defined.has(d.type))
    .map((d) => ({ colour: d.colour, ...d.json, type: d.type }))
  if (fresh.length) Blockly.defineBlocksWithJsonArray(fresh)
  for (const d of game.blocks) defined.add(d.type)
}

function makeTheme(Blockly: B) {
  return Blockly.Theme.defineTheme('game_zelos', {
    name: 'game_zelos',
    base: Blockly.Themes.Classic,
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
    fontStyle: { family: 'system-ui, "Segoe UI", Roboto, "Noto Color Emoji", sans-serif', weight: '700', size: 16 },
    startHats: true,
  })
}

export function GameWorkspace({ game, level, initial, readOnly, highlightId, onChange }: GameWorkspaceProps) {
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [empty, setEmpty] = useState(true)
  const cb = useRef(onChange)
  cb.current = onChange
  const lastHl = useRef<string | null>(null)

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
        defineGameBlocks(Blockly, game)
        ws = Blockly.inject(host.current, {
          renderer: 'zelos',
          theme: makeTheme(Blockly),
          toolbox: buildToolbox(game, level) as unknown as BlocklyNS.utils.toolbox.ToolboxInfo,
          media: '/blockly/media/',
          sounds: false,
          grid: { spacing: 0, length: 0, colour: '#0000', snap: false },
          trashcan: true,
          scrollbars: true,
          move: { scrollbars: true, drag: true, wheel: true },
          zoom: { controls: true, wheel: false, pinch: true, startScale: host.current.clientWidth < 520 ? 0.85 : 1, minScale: 0.5, maxScale: 2, scaleSpeed: 1.2 },
          collapse: false,
          comments: false,
          disable: false,
          // Blok sınırı Blockly'nin maxBlocks'uyla DEĞİL, çerçevenin kendi sayacıyla uygulanır (gölge/ücretsiz blokları doğru saymak için).
        })
        const w = ws
        wsRef.current = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws // test/hata ayıklama

        if (initial) {
          Blockly.Events.disable()
          try { Blockly.serialization.workspaces.load(initial, w, { recordUndo: false }) } catch (e) { console.warn('Program yüklenemedi', e) }
          Blockly.Events.enable()
        }
        const emit = () => {
          timer = null
          if (disposed) return
          const state = Blockly.serialization.workspaces.save(w) as unknown as ProgramState
          const prog: ProgramState = state?.blocks ? state : { blocks: { languageVersion: 0, blocks: [] } }
          setEmpty(w.getTopBlocks(false).length === 0)
          cb.current(prog, blockCount(game, prog))
        }
        emit()
        w.addChangeListener((e: BlocklyNS.Events.Abstract) => {
          if (e.isUiEvent) return
          if (timer) clearTimeout(timer)
          timer = setTimeout(emit, 120)
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
    // Seviye/oyun değişince üst bileşen `key` ile yeniden bağlar; burada bilinçli olarak yalnız ilk değerler kullanılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ws = wsRef.current
    if (!ready || !ws) return
    ws.setIsReadOnly(readOnly)
  }, [readOnly, ready])

  useEffect(() => {
    const ws = wsRef.current
    if (!ready || !ws) return
    if (lastHl.current) ws.highlightBlock(null)
    if (highlightId) ws.highlightBlock(highlightId)
    lastHl.current = highlightId
  }, [highlightId, ready])

  const cats = toolboxCategories(game, level)
  const iconCss = cats.map((c, i) => `.blocklyToolboxCategory:has(.gm-ic-${i}), .gm-ic-${i}{--gm-c:${c.colour}}`).join('\n')

  return (
    <div className="gm-ws" data-blockly-ready={ready} data-testid="game-blockly">
      <style>{iconCss}</style>
      <div ref={host} className="gm-ws-host" />
      {ready && empty && <div className="gm-ws-hint" aria-hidden="true">Soldan bir blok seç ve buraya sürükle</div>}
      {failed && <p className="gm-ws-fail" role="alert">Blok editörü yüklenemedi. Sayfayı yenile.</p>}
    </div>
  )
}

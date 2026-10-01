'use client'
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react'
import type { Circuit, LabState, PinRef } from '@/lib/lab/contract'
import { PART_DEFS, WORLD, partBounds, pinDir, pinWorld, snap, wireCurve, wirePreview, type Pt } from '@/lib/lab/geometry'
import { addWire, canAddWire, formatOhms, movePart, removePart, removeWire, rotatePart, wireColor } from '@/lib/lab/ops'
import { PartArt } from './part-art'

export type Selection = { kind: 'part'; id: string } | { kind: 'wire'; id: string } | null

export interface CanvasApi {
  /** Ekran koordinatını tuval (dünya) koordinatına çevirir; tuvalin dışındaysa null. */
  screenToWorld(clientX: number, clientY: number): Pt | null
  fit(): void
}

interface Props {
  circuit: Circuit
  onChange: (c: Circuit) => void
  lockedIds: ReadonlySet<string>
  /** Benzetim sürüyor: kablo/parça düzenleme kilitli. */
  editLocked: boolean
  runtime: LabState | null
  selection: Selection
  onSelect: (s: Selection) => void
  warnParts: ReadonlySet<string>
  /** Çalışırken buton parçasına basma/bırakma. */
  onPress: (partId: string, down: boolean) => void
  /** Değişirse görünüm içeriğe sığdırılır (ör. kayıtlı devre yüklenince). */
  fitKey?: string | number
  apiRef?: Ref<CanvasApi>
  height: number
  onNotice?: (msg: string) => void
}

type Gesture =
  | { kind: 'pan'; sx: number; sy: number; tx: number; ty: number }
  | { kind: 'move'; id: string; offX: number; offY: number; moved: boolean }
  | { kind: 'wire'; from: PinRef }
  | { kind: 'press'; id: string }
  | { kind: 'pinch'; dist: number; k: number }

const K_MIN = 0.3, K_MAX = 2.6

const partLabel = (type: string, id: string) => `${PART_DEFS[type as keyof typeof PART_DEFS]?.name ?? type} (${id})`

export function LabCanvas({ circuit, onChange, lockedIds, editLocked, runtime, selection, onSelect, warnParts, onPress, fitKey, apiRef, height, onNotice }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState({ tx: 8, ty: 8, k: 1 })
  const viewRef = useRef(view)
  viewRef.current = view
  const [draft, setDraft] = useState<{ from: PinRef; x: number; y: number; target: PinRef | null } | null>(null)
  const gesture = useRef<Gesture | null>(null)
  const pointers = useRef(new Map<number, Pt>())
  const circuitRef = useRef(circuit)
  circuitRef.current = circuit

  const toWorld = useCallback((cx: number, cy: number): Pt | null => {
    const el = svgRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    const v = viewRef.current
    return { x: (cx - r.left - v.tx) / v.k, y: (cy - r.top - v.ty) / v.k }
  }, [])

  const fit = useCallback(() => {
    const el = svgRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width < 10) return
    const b = circuitRef.current.parts.map(partBounds)
    if (!b.length) { setView({ tx: 8, ty: 8, k: 1 }); return }
    const x0 = Math.min(...b.map((p) => p.x)), y0 = Math.min(...b.map((p) => p.y))
    const x1 = Math.max(...b.map((p) => p.x + p.w)), y1 = Math.max(...b.map((p) => p.y + p.h))
    const pad = 28
    // Çalışma alanının en az 640x360'lık kısmı görünsün: yeni parçalar için boş yer kalır.
    const bw = Math.max(x1 - x0, 560), bh = Math.max(y1 - y0, 330)
    const k = Math.max(K_MIN, Math.min(1.2, (r.width - 2 * pad) / bw, (r.height - 2 * pad) / bh))
    setView({ k, tx: pad - x0 * k, ty: pad - y0 * k })
  }, [])

  useImperativeHandle(apiRef, () => ({
    screenToWorld: (cx, cy) => {
      const el = svgRef.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null
      return toWorld(cx, cy)
    },
    fit,
  }), [toWorld, fit])

  useLayoutEffect(() => { fit() }, [fit, fitKey])
  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    const el = svgRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (cx ?? r.left + r.width / 2) - r.left, py = (cy ?? r.top + r.height / 2) - r.top
    setView((v) => {
      const k = Math.max(K_MIN, Math.min(K_MAX, v.k * factor))
      const f = k / v.k
      return { k, tx: px - (px - v.tx) * f, ty: py - (py - v.ty) * f }
    })
  }, [])

  // Fare tekerleği (pasif olmayan dinleyici: sayfa kaymasın)
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const h = (e: WheelEvent) => { e.preventDefault(); zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY) }
    el.addEventListener('wheel', h, { passive: false })
    return () => el.removeEventListener('wheel', h)
  }, [zoomAt])

  const pinAt = (cx: number, cy: number): PinRef | null => {
    const el = document.elementFromPoint(cx, cy)?.closest('[data-pin-part]') as SVGElement | null
    return el ? { part: el.dataset.pinPart!, pin: el.dataset.pinName! } : null
  }

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const svg = svgRef.current!
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    svg.setPointerCapture(e.pointerId)
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = { kind: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), k: viewRef.current.k }
      setDraft(null)
      return
    }
    const t = e.target as Element
    const pinEl = t.closest('[data-pin-part]') as SVGElement | null
    const partEl = t.closest('[data-part]') as SVGElement | null
    const wireEl = t.closest('[data-wire]') as SVGElement | null
    const w = toWorld(e.clientX, e.clientY)!
    if (pinEl) {
      if (editLocked) { onNotice?.('Benzetim çalışırken kablo çizemezsin. Önce Dur\'a bas.'); return }
      const from = { part: pinEl.dataset.pinPart!, pin: pinEl.dataset.pinName! }
      gesture.current = { kind: 'wire', from }
      setDraft({ from, x: w.x, y: w.y, target: null })
      e.preventDefault()
      return
    }
    if (partEl) {
      const id = partEl.dataset.part!
      const part = circuitRef.current.parts.find((p) => p.id === id)
      if (!part) return
      onSelect({ kind: 'part', id })
      if (editLocked) {
        if (part.type === 'button') { gesture.current = { kind: 'press', id }; onPress(id, true); return }
        gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, tx: viewRef.current.tx, ty: viewRef.current.ty }
        return
      }
      if (lockedIds.has(id)) {
        gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, tx: viewRef.current.tx, ty: viewRef.current.ty }
        return
      }
      gesture.current = { kind: 'move', id, offX: w.x - part.x, offY: w.y - part.y, moved: false }
      return
    }
    if (wireEl) { onSelect({ kind: 'wire', id: wireEl.dataset.wire! }); return }
    onSelect(null)
    gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, tx: viewRef.current.tx, ty: viewRef.current.ty }
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (!g) return
    if (g.kind === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (g.dist > 0) {
        const target = Math.max(K_MIN, Math.min(K_MAX, g.k * (d / g.dist)))
        zoomAt(target / viewRef.current.k, (a.x + b.x) / 2, (a.y + b.y) / 2)
      }
      return
    }
    if (g.kind === 'pan') {
      setView((v) => ({ ...v, tx: g.tx + (e.clientX - g.sx), ty: g.ty + (e.clientY - g.sy) }))
    } else if (g.kind === 'move') {
      const w = toWorld(e.clientX, e.clientY)!
      const nx = snap(w.x - g.offX), ny = snap(w.y - g.offY)
      const cur = circuitRef.current.parts.find((p) => p.id === g.id)
      if (cur && (cur.x !== nx || cur.y !== ny)) { g.moved = true; onChange(movePart(circuitRef.current, g.id, nx, ny)) }
    } else if (g.kind === 'wire') {
      const w = toWorld(e.clientX, e.clientY)!
      setDraft({ from: g.from, x: w.x, y: w.y, target: pinAt(e.clientX, e.clientY) })
    }
  }

  const endPointer = (e: React.PointerEvent<SVGSVGElement>, cancel = false) => {
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (g?.kind === 'pinch') { if (pointers.current.size < 2) gesture.current = null; return }
    gesture.current = null
    if (!g) return
    if (g.kind === 'wire') {
      setDraft(null)
      if (cancel) return
      const to = pinAt(e.clientX, e.clientY)
      if (!to) return
      const chk = canAddWire(circuitRef.current, g.from, to)
      if (!chk.ok) { if (to.part !== g.from.part || to.pin !== g.from.pin) onNotice?.(chk.reason); return }
      const r = addWire(circuitRef.current, g.from, to)
      if (r) { onChange(r.circuit); onSelect({ kind: 'wire', id: r.wire.id }) }
    } else if (g.kind === 'press') {
      onPress(g.id, false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!selection) return
    const c = circuitRef.current
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (editLocked) { onNotice?.('Benzetim çalışırken silemezsin. Önce Dur\'a bas.'); return }
      if (selection.kind === 'wire') { onChange(removeWire(c, selection.id)); onSelect(null); e.preventDefault() }
      else if (!lockedIds.has(selection.id)) { onChange(removePart(c, selection.id)); onSelect(null); e.preventDefault() }
      return
    }
    if (selection.kind !== 'part' || editLocked || lockedIds.has(selection.id)) return
    const p = c.parts.find((x) => x.id === selection.id)
    if (!p) return
    if (e.key === 'r' || e.key === 'R') { onChange(rotatePart(c, p.id)); e.preventDefault(); return }
    const step = e.shiftKey ? 50 : 10
    const d = e.key === 'ArrowLeft' ? [-step, 0] : e.key === 'ArrowRight' ? [step, 0] : e.key === 'ArrowUp' ? [0, -step] : e.key === 'ArrowDown' ? [0, step] : null
    if (d) { onChange(movePart(c, p.id, p.x + d[0], p.y + d[1])); e.preventDefault() }
  }

  const partsById = useMemo(() => new Map(circuit.parts.map((p) => [p.id, p])), [circuit.parts])
  const connected = useMemo(() => {
    const s = new Set<string>()
    for (const w of circuit.wires) { s.add(`${w.a.part}:${w.a.pin}`); s.add(`${w.b.part}:${w.b.pin}`) }
    return s
  }, [circuit.wires])
  const pinDirOf = (r: PinRef): Pt => {
    const p = partsById.get(r.part)
    return p ? pinDir(p, r.pin) : { x: 0, y: 1 }
  }
  const pinPos = (r: PinRef): Pt | null => {
    const p = partsById.get(r.part)
    return p ? pinWorld(p, r.pin) : null
  }

  const caption = (id: string): string | null => {
    const p = partsById.get(id)!
    const n = (k: string, d: number) => (typeof p.props[k] === 'number' ? (p.props[k] as number) : d)
    switch (p.type) {
      case 'resistor': return formatOhms(n('ohms', 330))
      case 'pot': return `%${Math.round(n('position', 0.5) * 100)}`
      case 'ntc': return `${n('tempC', 25)} °C`
      case 'ldr': return `ışık %${Math.round(n('light', 0.5) * 100)}`
      case 'uno': return null
      default: return null
    }
  }

  return (
    <div className="lab-canvas-wrap" style={{ height: `clamp(320px, 75vw, ${height}px)` }}>
      <svg
        ref={svgRef} className="lab-canvas" data-testid="lab-canvas" tabIndex={0} role="application"
        aria-label="Devre tuvali. Parçaları sürükleyip taşı, pinlerden kablo çek. Seçili parçayı ok tuşlarıyla taşı, R ile döndür, Delete ile sil."
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={(e) => endPointer(e, true)}
        onKeyDown={onKeyDown}
      >
        <defs>
          <filter id="lab-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
          <pattern id="lab-grid" width={20} height={20} patternUnits="userSpaceOnUse"><circle cx={1} cy={1} r={1} className="lab-grid-dot" /></pattern>
        </defs>
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
          <rect x={0} y={0} width={WORLD.w} height={WORLD.h} className="lab-world" />
          <rect x={0} y={0} width={WORLD.w} height={WORLD.h} fill="url(#lab-grid)" pointerEvents="none" />

          <g className="lab-wires">
            {circuit.wires.map((w, i) => {
              const a = pinPos(w.a), b = pinPos(w.b)
              if (!a || !b) return null
              const d = wireCurve(a, pinDirOf(w.a), b, pinDirOf(w.b), ((i % 3) - 1) * 8)
              const sel = selection?.kind === 'wire' && selection.id === w.id
              const col = w.color ?? '#3b82f6'
              return (
                <g key={w.id} data-wire={w.id} data-color={col} role="button" aria-label={`Kablo: ${w.a.part} ${w.a.pin} ile ${w.b.part} ${w.b.pin} arası${sel ? ' (seçili)' : ''}`} className={sel ? 'lab-wire sel' : 'lab-wire'}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth={14} strokeLinecap="round" />
                  {sel && <path d={d} fill="none" stroke="var(--primary)" strokeOpacity={0.4} strokeWidth={11} strokeLinecap="round" />}
                  <path d={d} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={(sel ? 6.6 : 4.6) + 1.6} strokeLinecap="round" pointerEvents="none" />
                  <path d={d} fill="none" stroke={col} strokeWidth={sel ? 6 : 3.6} strokeLinecap="round" pointerEvents="none" />
                  <circle cx={a.x} cy={a.y} r={sel ? 5 : 4} fill={col} stroke="#fff" strokeOpacity={0.5} strokeWidth={1} pointerEvents="none" />
                  <circle cx={b.x} cy={b.y} r={sel ? 5 : 4} fill={col} stroke="#fff" strokeOpacity={0.5} strokeWidth={1} pointerEvents="none" />
                </g>
              )
            })}
          </g>

          <g className="lab-parts">
            {circuit.parts.map((p) => {
              const d = PART_DEFS[p.type]
              const sel = selection?.kind === 'part' && selection.id === p.id
              return (
                <g
                  key={p.id} data-part={p.id} data-type={p.type} tabIndex={0} role="button"
                  aria-label={`${partLabel(p.type, p.id)}${lockedIds.has(p.id) ? ', kilitli' : ''}${sel ? ', seçili' : ''}`}
                  className={`lab-part${sel ? ' sel' : ''}${lockedIds.has(p.id) ? ' locked' : ''}`}
                  transform={`translate(${p.x} ${p.y}) rotate(${p.rotation} ${d.w / 2} ${d.h / 2})`}
                  onFocus={() => { if (!sel) onSelect({ kind: 'part', id: p.id }) }}
                >
                  <rect x={-2} y={-2} width={d.w + 4} height={d.h + 4} fill="transparent" />
                  <PartArt part={p} runtime={runtime?.parts[p.id]} pins={runtime?.pins} />
                </g>
              )
            })}
          </g>

          <g className="lab-overlay" pointerEvents="none">
            {circuit.parts.map((p) => {
              const b = partBounds(p)
              const sel = selection?.kind === 'part' && selection.id === p.id
              const warn = warnParts.has(p.id)
              const cap = caption(p.id)
              return (
                <g key={p.id}>
                  {(sel || warn) && <rect x={b.x - 5} y={b.y - 5} width={b.w + 10} height={b.h + 10} rx={8} className={warn ? 'lab-warn-ring' : 'lab-sel-ring'} data-warn={warn ? p.id : undefined} />}
                  {cap && <text x={b.x + b.w / 2} y={b.y + b.h + 26} textAnchor="middle" className="lab-caption">{cap}</text>}
                </g>
              )
            })}
          </g>

          <g className="lab-pins">
            {circuit.parts.map((p) => Object.keys(PART_DEFS[p.type].pins).map((pin) => {
              const pt = pinWorld(p, pin)!
              const isTarget = draft?.target?.part === p.id && draft.target.pin === pin
              const isFrom = draft?.from.part === p.id && draft.from.pin === pin
              const b = partBounds(p)
              // etiket: parçanın merkezinden dışarı doğru
              const cx = b.x + b.w / 2, cy = b.y + b.h / 2
              const dx = pt.x - cx, dy = pt.y - cy
              const horiz = Math.abs(dx) / (b.w || 1) > Math.abs(dy) / (b.h || 1)
              const lx = horiz ? Math.sign(dx) * 11 : 0, ly = horiz ? 3 : Math.sign(dy) * 12
              const cls = `lab-pin${connected.has(`${p.id}:${pin}`) ? ' wired' : ''}${isTarget ? ' target' : ''}${isFrom ? ' from' : ''}`
              return (
                <g key={`${p.id}:${pin}`} className={cls} data-pin-part={p.id} data-pin-name={pin} transform={`translate(${pt.x} ${pt.y})`} role="button" aria-label={`${PART_DEFS[p.type].name} ${p.id}, pin ${pin}`}>
                  <circle r={9} fill="transparent" className="lab-pin-hit" />
                  <circle r={3.6} className="lab-pin-dot" />
                  {p.type !== 'uno' && <text x={lx} y={ly} textAnchor={horiz ? (dx < 0 ? 'end' : 'start') : 'middle'} className="lab-pin-label" pointerEvents="none">{pin}</text>}
                </g>
              )
            }))}
          </g>

          {draft && (() => {
            const a = pinPos(draft.from)
            if (!a) return null
            const tp = draft.target ? pinPos(draft.target) : null
            const end = tp ?? { x: draft.x, y: draft.y }
            const col = draft.target ? wireColor(circuit, draft.from, draft.target) : 'var(--primary)'
            const d = tp && draft.target ? wireCurve(a, pinDirOf(draft.from), tp, pinDirOf(draft.target)) : wirePreview(a, pinDirOf(draft.from), end)
            return (
              <g pointerEvents="none" data-draft>
                <path d={d} fill="none" stroke={col} strokeOpacity={0.9} strokeWidth={3.6} strokeDasharray="1 7" strokeLinecap="round" />
                <circle cx={end.x} cy={end.y} r={5} fill={col} opacity={0.8} />
              </g>
            )
          })()}
        </g>
      </svg>
      <div className="lab-zoom" role="group" aria-label="Yakınlaştırma">
        <button type="button" className="lab-zbtn" onClick={() => zoomAt(1.25)} aria-label="Yakınlaştır">+</button>
        <button type="button" className="lab-zbtn" onClick={() => zoomAt(0.8)} aria-label="Uzaklaştır">−</button>
        <button type="button" className="lab-zbtn" onClick={fit} aria-label="Sığdır" title="Sığdır">⤢</button>
      </div>
    </div>
  )
}

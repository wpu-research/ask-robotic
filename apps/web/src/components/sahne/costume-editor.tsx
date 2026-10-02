'use client'
// Kostüm / arka plan editörü: vektör çizim (fırça, çizgi, dikdörtgen, daire, doldur, silgi, seç/taşı) ve "bitmap'e çevir" ile piksel kipi.
// Vektör kipinde şekiller ayrı nesnelerdir (silgi şekil siler, doldur şeklin rengini değiştirir); bitmap kipinde piksel boyanır.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { floodFill, parseColor } from '@/lib/sahne/bitmap'
import { flipShape, hitShape, topShapeAt, translateShape } from '@/lib/sahne/geometry'
import { cloneCostume, emptyCostume, newId } from '@/lib/sahne/project'
import { RES, drawShapes, onBitmapLoaded, paintThumb } from '@/lib/sahne/render'
import { MAX_COSTUMES, type Costume, type Shape } from '@/lib/sahne/types'

type Tool = 'select' | 'brush' | 'line' | 'rect' | 'ellipse' | 'fill' | 'eraser'
const TOOLS: { id: Tool; label: string; icon: string; bitmap?: boolean }[] = [
  { id: 'select', label: 'Seç ve taşı', icon: '⇱', bitmap: false },
  { id: 'brush', label: 'Fırça', icon: '🖌' },
  { id: 'line', label: 'Çizgi', icon: '╱' },
  { id: 'rect', label: 'Dikdörtgen', icon: '▭' },
  { id: 'ellipse', label: 'Daire / oval', icon: '◯' },
  { id: 'fill', label: 'Doldur', icon: '🪣' },
  { id: 'eraser', label: 'Silgi', icon: '⌫' },
]
const PALETTE = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#00acc1', '#6d4c41', '#212121', '#9e9e9e', '#ffffff', '#f59e0b', '#38bdf8', '#a3e635', '#fcd9b6']
const BMP_RES = 2

export interface CostumeEditorProps {
  /** Sprite kostümleri ya da sahne arka planları. */
  costumes: Costume[]
  index: number
  kind: 'sprite' | 'backdrop'
  onChange: (costumes: Costume[], index: number) => void
  /** Bir kostümün adı değişti (bloklardaki başvuruları güncellemek için). */
  onRename: (from: string, to: string) => void
  onOpenGallery: () => void
}

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src })
const nameFor = (list: Costume[], base: string): string => { let n = 1; while (list.some((c) => c.name === `${base}${n}`)) n++; return `${base}${n}` }

function ColorRow({ label, value, onChange, allowNone }: { label: string; value: string | null; onChange: (c: string | null) => void; allowNone?: boolean }) {
  return (
    <div className="sh-ce-colors" role="group" aria-label={label}>
      <span className="sh-ce-lab">{label}</span>
      <div className="sh-swatches">
        {allowNone && <button type="button" className="sh-sw sh-sw-none" aria-pressed={value === null} aria-label={`${label}: yok`} title="Yok" onClick={() => onChange(null)}>∅</button>}
        {PALETTE.map((c) => <button key={c} type="button" className="sh-sw" style={{ background: c }} aria-pressed={value === c} aria-label={`${label}: ${c}`} onClick={() => onChange(c)} />)}
        <input type="color" className="sh-sw-pick" value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={`${label}: özel renk`} title="Özel renk" />
      </div>
    </div>
  )
}

export function CostumeEditor({ costumes, index, kind, onChange, onRename, onOpenGallery }: CostumeEditorProps) {
  const cur: Costume | undefined = costumes[index]
  const [tool, setTool] = useState<Tool>('brush')
  const [fill, setFill] = useState<string | null>('#f59e0b')
  const [line, setLine] = useState<string | null>('#212121')
  const [width, setWidth] = useState(5)
  const [sel, setSel] = useState(-1)
  const [, bump] = useState(0)
  const cv = useRef<HTMLCanvasElement>(null)
  const work = useRef<HTMLCanvasElement | null>(null)
  const workKey = useRef<string>('')
  const draft = useRef<{ tool: Tool; pts: number[]; sx: number; sy: number; ex: number; ey: number; shapes?: Shape[]; moved?: boolean; baseIdx?: number; erased?: boolean } | null>(null)
  const hist = useRef(new Map<string, { past: Costume[]; future: Costume[] }>())
  const raf = useRef(0)
  const curRef = useRef(cur); curRef.current = cur
  const isBitmap = !!cur?.bitmap

  const h = (id: string) => { let x = hist.current.get(id); if (!x) { x = { past: [], future: [] }; hist.current.set(id, x) } return x }
  const replace = useCallback((next: Costume, pushHistory = true) => {
    const c = curRef.current
    if (!c) return
    if (pushHistory) { const x = h(c.id); x.past.push(c); if (x.past.length > 60) x.past.shift(); x.future = [] }
    onChange(costumes.map((k, i) => (i === index ? next : k)), index)
  }, [costumes, index, onChange])
  const undo = () => { if (!cur) return; const x = h(cur.id); const p = x.past.pop(); if (!p) return; x.future.push(cur); setSel(-1); onChange(costumes.map((k, i) => (i === index ? p : k)), index) }
  const redo = () => { if (!cur) return; const x = h(cur.id); const f = x.future.pop(); if (!f) return; x.past.push(cur); setSel(-1); onChange(costumes.map((k, i) => (i === index ? f : k)), index) }

  // ---- bitmap çalışma tuvali ----
  useEffect(() => {
    if (!cur?.bitmap) { work.current = null; workKey.current = ''; return }
    const key = `${cur.id}|${cur.bitmap}`
    if (workKey.current === key && work.current) return
    let dead = false
    ;(async () => {
      const w = document.createElement('canvas')
      w.width = Math.round(cur.w * BMP_RES); w.height = Math.round(cur.h * BMP_RES)
      try { const im = await loadImage(cur.bitmap!); w.getContext('2d')!.drawImage(im, 0, 0, w.width, w.height) } catch { /* boş */ }
      if (dead) return
      work.current = w; workKey.current = key; bump((n) => n + 1)
    })()
    return () => { dead = true }
  }, [cur?.id, cur?.bitmap, cur?.w, cur?.h])

  // ---- çizim ----
  const repaint = useCallback(() => {
    const c = curRef.current, el = cv.current
    if (!c || !el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const W = Math.round(c.w * RES), H = Math.round(c.h * RES)
    if (el.width !== W || el.height !== H) { el.width = W; el.height = H }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.scale(RES, RES)
    if (c.bitmap && work.current) ctx.drawImage(work.current, 0, 0, c.w, c.h)
    const d = draft.current
    drawShapes(ctx, d?.shapes ?? c.shapes)
    // taslak
    if (d && (d.tool === 'brush' || d.tool === 'line' || d.tool === 'rect' || d.tool === 'ellipse')) {
      const sh = previewShape(d)
      if (sh) drawShapes(ctx, [sh])
    }
    // seçim çerçevesi ve dönme merkezi
    if (kind === 'sprite') {
      ctx.save(); ctx.strokeStyle = 'rgba(76,151,255,.55)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(c.w / 2 - 6, c.h / 2); ctx.lineTo(c.w / 2 + 6, c.h / 2); ctx.moveTo(c.w / 2, c.h / 2 - 6); ctx.lineTo(c.w / 2, c.h / 2 + 6); ctx.stroke(); ctx.restore()
    }
    const shapes = d?.shapes ?? c.shapes
    if (tool === 'select' && sel >= 0 && shapes[sel]) {
      const b = shapeBox(shapes[sel])
      ctx.save(); ctx.strokeStyle = '#4c97ff'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeRect(b.x0 - 3, b.y0 - 3, b.x1 - b.x0 + 6, b.y1 - b.y0 + 6); ctx.restore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, tool, sel, fill, line, width])
  const schedule = useCallback(() => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(repaint) }, [repaint])
  useEffect(() => { repaint() })
  useEffect(() => onBitmapLoaded(() => schedule()), [schedule])

  function previewShape(d: NonNullable<typeof draft.current>): Shape | null {
    if (d.tool === 'brush') return d.pts.length >= 2 && line ? { t: 'path', pts: d.pts, c: line, w: width } : null
    if (d.tool === 'line') return line ? { t: 'path', pts: [d.sx, d.sy, d.ex, d.ey], c: line, w: width } : null
    if (d.tool === 'rect') return { t: 'rect', x: Math.min(d.sx, d.ex), y: Math.min(d.sy, d.ey), w: Math.abs(d.ex - d.sx), h: Math.abs(d.ey - d.sy), f: fill, s: line, sw: line ? width : 0 }
    if (d.tool === 'ellipse') return { t: 'ellipse', cx: (d.sx + d.ex) / 2, cy: (d.sy + d.ey) / 2, rx: Math.abs(d.ex - d.sx) / 2, ry: Math.abs(d.ey - d.sy) / 2, f: fill, s: line, sw: line ? width : 0 }
    return null
  }

  const pos = (e: React.PointerEvent): { x: number; y: number } => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const c = curRef.current!
    return { x: ((e.clientX - r.left) / r.width) * c.w, y: ((e.clientY - r.top) / r.height) * c.h }
  }

  // bitmap üzerine çizim (fırça / silgi parçası, şekil)
  const bmpCtx = (): CanvasRenderingContext2D | null => work.current?.getContext('2d') ?? null
  const bmpStroke = (pts: number[], color: string | null, erase: boolean) => {
    const ctx = bmpCtx(); if (!ctx || (!color && !erase)) return
    ctx.save(); ctx.setTransform(BMP_RES, 0, 0, BMP_RES, 0, 0)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = width; ctx.strokeStyle = erase ? '#000' : color!
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1])
    if (pts.length === 2) ctx.lineTo(pts[0] + 0.01, pts[1])
    for (let i = 2; i + 1 < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1])
    ctx.stroke(); ctx.restore()
  }
  const commitBitmap = () => {
    const c = curRef.current, w = work.current
    if (!c || !w) return
    const url = w.toDataURL('image/png')
    workKey.current = `${c.id}|${url}`
    replace({ ...c, bitmap: url })
  }

  const down = (e: React.PointerEvent) => {
    const c = curRef.current
    if (!c) return
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    const p = pos(e)
    const d = { tool, pts: [p.x, p.y], sx: p.x, sy: p.y, ex: p.x, ey: p.y }
    if (isBitmap && !work.current) return
    if (tool === 'fill') {
      if (isBitmap) {
        const ctx = bmpCtx(); const w = work.current!
        if (ctx && fill) {
          const img = ctx.getImageData(0, 0, w.width, w.height)
          if (floodFill(img.data, w.width, w.height, p.x * BMP_RES, p.y * BMP_RES, parseColor(fill))) { ctx.putImageData(img, 0, 0); commitBitmap() }
        }
      } else if (fill) {
        const i = topShapeAt(c.shapes, p.x, p.y, 2)
        if (i >= 0) replace({ ...c, shapes: c.shapes.map((s, k) => (k !== i ? s : s.t === 'path' ? { ...s, c: fill } : { ...s, f: fill })) })
      }
      return
    }
    if (tool === 'select') {
      if (isBitmap && !c.shapes.length) return
      const i = topShapeAt(c.shapes, p.x, p.y, 4)
      setSel(i)
      if (i >= 0) draft.current = { ...d, shapes: c.shapes, baseIdx: i }
      schedule()
      return
    }
    if (tool === 'eraser') {
      draft.current = { ...d, shapes: isBitmap ? undefined : c.shapes }
      if (isBitmap) bmpStroke(d.pts, null, true)
      else eraseAt(p.x, p.y)
      schedule()
      return
    }
    if (tool === 'brush' && isBitmap) bmpStroke(d.pts, line, false)
    draft.current = d
    schedule()
  }

  function eraseAt(x: number, y: number) {
    const d = draft.current
    if (!d?.shapes) return
    const keep = d.shapes.filter((s) => !hitShape(s, x, y, width / 2))
    if (keep.length !== d.shapes.length) { d.shapes = keep; d.erased = true }
  }

  const move = (e: React.PointerEvent) => {
    const d = draft.current
    if (!d) return
    const p = pos(e)
    const lastX = d.ex, lastY = d.ey
    d.ex = p.x; d.ey = p.y
    if (d.tool === 'brush') {
      if (Math.hypot(p.x - d.pts[d.pts.length - 2], p.y - d.pts[d.pts.length - 1]) >= 1.2) {
        d.pts.push(p.x, p.y)
        if (isBitmap) bmpStroke(d.pts.slice(-4), line, false)
      }
    } else if (d.tool === 'eraser') {
      if (isBitmap) bmpStroke([lastX, lastY, p.x, p.y], null, true)
      else eraseAt(p.x, p.y)
    } else if (d.tool === 'select' && d.shapes && d.baseIdx !== undefined) {
      const dx = p.x - lastX, dy = p.y - lastY
      d.moved = true
      d.shapes = d.shapes.map((s, k) => (k === d.baseIdx ? translateShape(s, dx, dy) : s))
    }
    schedule()
  }

  const up = () => {
    const d = draft.current
    draft.current = null
    const c = curRef.current
    if (!d || !c) return
    if (d.tool === 'brush') {
      if (isBitmap) commitBitmap()
      else if (line) replace({ ...c, shapes: [...c.shapes, { t: 'path', pts: d.pts.length === 2 ? [d.pts[0], d.pts[1], d.pts[0], d.pts[1]] : d.pts, c: line, w: width }] })
    } else if (d.tool === 'line') {
      if (Math.hypot(d.ex - d.sx, d.ey - d.sy) < 2) { schedule(); return }
      if (isBitmap) { bmpStroke([d.sx, d.sy, d.ex, d.ey], line, false); commitBitmap() } else if (line) replace({ ...c, shapes: [...c.shapes, { t: 'path', pts: [d.sx, d.sy, d.ex, d.ey], c: line, w: width }] })
    } else if (d.tool === 'rect' || d.tool === 'ellipse') {
      const sh = previewShape(d)
      if (!sh || Math.abs(d.ex - d.sx) < 2 || Math.abs(d.ey - d.sy) < 2) { schedule(); return }
      if (isBitmap) {
        const ctx = bmpCtx()
        if (ctx) { ctx.save(); ctx.setTransform(BMP_RES, 0, 0, BMP_RES, 0, 0); drawShapes(ctx, [sh]); ctx.restore(); commitBitmap() }
      } else replace({ ...c, shapes: [...c.shapes, sh] })
    } else if (d.tool === 'eraser') {
      if (isBitmap) commitBitmap()
      else if (d.erased && d.shapes) { replace({ ...c, shapes: d.shapes }); setSel(-1) }
    } else if (d.tool === 'select' && d.moved && d.shapes) replace({ ...c, shapes: d.shapes })
    schedule()
  }

  // ---- seçim işlemleri ----
  const selShape = !isBitmap || cur?.shapes.length ? sel : -1
  const withSel = (fn: (shapes: Shape[], i: number) => Shape[]) => { if (!cur || selShape < 0 || !cur.shapes[selShape]) return; replace({ ...cur, shapes: fn(cur.shapes, selShape) }) }
  const delSel = () => withSel((s, i) => s.filter((_, k) => k !== i))
  const front = () => { withSel((s, i) => [...s.filter((_, k) => k !== i), s[i]]); setSel((cur?.shapes.length ?? 1) - 1) }
  const back = () => { withSel((s, i) => [s[i], ...s.filter((_, k) => k !== i)]); setSel(0) }
  const dup = () => { withSel((s, i) => [...s, translateShape(s[i], 8, 8)]); setSel((cur?.shapes.length ?? 0)) }
  const flip = async (axis: 'h' | 'v') => {
    if (!cur) return
    let next: Costume = { ...cur, shapes: cur.shapes.map((s, i) => (selShape >= 0 && i !== selShape ? s : flipShape(s, cur.w, cur.h, axis))) }
    if (isBitmap && work.current && selShape < 0) {
      const w = work.current, t = document.createElement('canvas'); t.width = w.width; t.height = w.height
      const tc = t.getContext('2d')!; tc.translate(axis === 'h' ? w.width : 0, axis === 'v' ? w.height : 0); tc.scale(axis === 'h' ? -1 : 1, axis === 'v' ? -1 : 1); tc.drawImage(w, 0, 0)
      const wc = w.getContext('2d')!; wc.clearRect(0, 0, w.width, w.height); wc.drawImage(t, 0, 0)
      const url = w.toDataURL('image/png'); workKey.current = `${cur.id}|${url}`
      next = { ...next, bitmap: url }
    }
    replace(next)
  }
  const toBitmap = async () => {
    if (!cur || cur.bitmap) return
    const w = document.createElement('canvas'); w.width = Math.round(cur.w * BMP_RES); w.height = Math.round(cur.h * BMP_RES)
    const ctx = w.getContext('2d')!; ctx.setTransform(BMP_RES, 0, 0, BMP_RES, 0, 0); drawShapes(ctx, cur.shapes); ctx.setTransform(1, 0, 0, 1, 0, 0)
    const url = w.toDataURL('image/png')
    work.current = w; workKey.current = `${cur.id}|${url}`
    setSel(-1)
    replace({ ...cur, bitmap: url, shapes: [] })
  }
  const clearAll = () => { if (cur && window.confirm('Bu kostümdeki tüm çizim silinsin mi?')) { if (work.current) { work.current.getContext('2d')!.clearRect(0, 0, work.current.width, work.current.height) } replace({ ...cur, shapes: [], bitmap: cur.bitmap ? work.current?.toDataURL('image/png') : undefined }); setSel(-1) } }

  // ---- kostüm listesi işlemleri ----
  const select = (i: number) => { setSel(-1); onChange(costumes, i) }
  const addBlank = () => {
    if (costumes.length >= MAX_COSTUMES) return
    const c = kind === 'backdrop' ? { ...emptyCostume(nameFor(costumes, 'arka plan'), 480, 360), shapes: [{ t: 'rect', x: 0, y: 0, w: 480, h: 360, f: '#ffffff', s: null, sw: 0 } as Shape] } : emptyCostume(nameFor(costumes, 'kostüm'))
    const list = [...costumes.slice(0, index + 1), c, ...costumes.slice(index + 1)]
    setSel(-1); onChange(list, index + 1)
  }
  const duplicate = () => {
    if (!cur || costumes.length >= MAX_COSTUMES) return
    const c = cloneCostume(cur, newId('c'), nameFor(costumes, cur.name.replace(/\d+$/, '')))
    const list = [...costumes.slice(0, index + 1), c, ...costumes.slice(index + 1)]
    setSel(-1); onChange(list, index + 1)
  }
  const remove = (i: number) => {
    if (costumes.length <= 1) return
    const list = costumes.filter((_, k) => k !== i)
    setSel(-1); onChange(list, Math.min(index > i ? index - 1 : index, list.length - 1))
  }
  const rename = (name: string) => {
    if (!cur) return
    const clean = name.slice(0, 30)
    onChange(costumes.map((k, i) => (i === index ? { ...k, name: clean } : k)), index)
  }
  const renameDone = (from: string) => {
    if (!cur) return
    let to = cur.name.trim() || from
    if (costumes.some((k, i) => i !== index && k.name === to)) to = nameFor(costumes.filter((_, i) => i !== index), to.replace(/\d+$/, ''))
    if (to !== cur.name) onChange(costumes.map((k, i) => (i === index ? { ...k, name: to } : k)), index)
    if (to !== from) onRename(from, to)
  }
  const nameAtFocus = useRef('')

  const thumbs = useMemo(() => costumes, [costumes])

  if (!cur) return <p className="muted" style={{ padding: 16 }}>Bu hedefte kostüm yok.</p>
  const toolList = TOOLS.filter((t) => !(isBitmap && t.id === 'select' && !cur.shapes.length))
  const canSel = selShape >= 0 && !!cur.shapes[selShape]

  return (
    <div className="sh-ce" data-kind={kind} data-testid="sahne-costume-editor">
      <aside className="sh-ce-list" aria-label={kind === 'sprite' ? 'Kostümler' : 'Arka planlar'}>
        <ol>
          {thumbs.map((c, i) => (
            <li key={c.id}>
              <div role="button" tabIndex={0} className="sh-ce-item" aria-current={i === index} onClick={() => select(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i) } }} data-testid={`sahne-costume-${i}`}>
                <span className="sh-ce-no">{i + 1}</span>
                <Thumb c={c} />
                <span className="sh-ce-nm">{c.name}</span>
                {costumes.length > 1 && <button type="button" className="sh-ce-del" aria-label={`${c.name} kostümünü sil`} title="Sil" onClick={(e) => { e.stopPropagation(); remove(i) }}>✕</button>}
              </div>
            </li>
          ))}
        </ol>
        <div className="sh-ce-add">
          <button type="button" className="btn btn-sm" onClick={addBlank} data-testid="sahne-costume-new">＋ Çiz</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenGallery} data-testid="sahne-costume-gallery">🖼 Galeri</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={duplicate}>⧉ Kopyala</button>
        </div>
      </aside>

      <section className="sh-ce-main">
        <div className="sh-ce-top">
          <label className="sh-ce-name"><span>{kind === 'sprite' ? 'Kostüm adı' : 'Arka plan adı'}</span>
            <input type="text" value={cur.name} maxLength={30} onFocus={() => { nameAtFocus.current = cur.name }} onChange={(e) => rename(e.target.value)} onBlur={() => renameDone(nameAtFocus.current || cur.name)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).blur() }} data-testid="sahne-costume-name" />
          </label>
          <span className="sh-spacer" />
          <span className="sh-ce-mode" data-bitmap={isBitmap} title={isBitmap ? 'Piksel (bitmap) kipi: boyadığın yerler piksel olur.' : 'Vektör kipi: çizdiklerin ayrı şekillerdir, seçip taşıyabilirsin.'}>{isBitmap ? 'Bitmap kipi' : 'Vektör kipi'}</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={undo} disabled={!h(cur.id).past.length} title="Geri al" aria-label="Geri al">↶</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={redo} disabled={!h(cur.id).future.length} title="Yinele" aria-label="Yinele">↷</button>
        </div>

        <div className="sh-ce-tools" role="toolbar" aria-label="Çizim araçları">
          {toolList.map((t) => (
            <button key={t.id} type="button" className="sh-tool" aria-pressed={tool === t.id} onClick={() => { setTool(t.id); if (t.id !== 'select') setSel(-1) }} title={t.label} aria-label={t.label} data-testid={`sahne-tool-${t.id}`}>
              <span aria-hidden="true">{t.icon}</span><small>{t.label}</small>
            </button>
          ))}
        </div>

        <div className="sh-ce-canvaswrap" data-backdrop={kind === 'backdrop'} style={{ aspectRatio: `${cur.w} / ${cur.h}` }}>
          <canvas ref={cv} className="sh-ce-canvas" data-testid="sahne-costume-canvas" aria-label="Çizim alanı" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-tool={tool} />
        </div>

        <div className="sh-ce-opts">
          <ColorRow label="Dolgu" value={fill} onChange={setFill} allowNone />
          <ColorRow label="Çizgi" value={line} onChange={setLine} allowNone />
          <label className="sh-ce-width"><span>Kalınlık {width}</span><input type="range" min={1} max={40} value={width} onChange={(e) => setWidth(Number(e.target.value))} aria-label="Çizgi kalınlığı" /></label>
        </div>

        <div className="sh-ce-actions">
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { void flip('h') }} title="Yatay çevir">⇋ Yatay çevir</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { void flip('v') }} title="Dikey çevir">⇅ Dikey çevir</button>
          {tool === 'select' && (
            <>
              <button type="button" className="btn btn-sm btn-ghost" onClick={front} disabled={!canSel}>Öne al</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={back} disabled={!canSel}>Arkaya al</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={dup} disabled={!canSel}>Şekli kopyala</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={delSel} disabled={!canSel}>Şekli sil</button>
            </>
          )}
          <span className="sh-spacer" />
          {!isBitmap && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { void toBitmap() }} title="Çizimi piksellere çevir: sonra fırçayla pikselleri boyayabilir, silgiyle silebilirsin" data-testid="sahne-to-bitmap">Bitmap&apos;e çevir</button>}
          <button type="button" className="btn btn-sm btn-ghost" onClick={clearAll}>Temizle</button>
        </div>
      </section>
    </div>
  )
}

function Thumb({ c }: { c: Costume }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [n, setN] = useState(0)
  useEffect(() => onBitmapLoaded(() => setN((x) => x + 1)), [])
  useEffect(() => { if (ref.current) paintThumb(ref.current, c, c.w > 200 ? '#fff' : undefined) }, [c, n])
  return <canvas ref={ref} className="sh-thumb" width={72} height={54} aria-hidden="true" />
}

function shapeBox(s: Shape): { x0: number; y0: number; x1: number; y1: number } {
  switch (s.t) {
    case 'rect': return { x0: s.x, y0: s.y, x1: s.x + s.w, y1: s.y + s.h }
    case 'ellipse': return { x0: s.cx - s.rx, y0: s.cy - s.ry, x1: s.cx + s.rx, y1: s.cy + s.ry }
    default: {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      for (let i = 0; i + 1 < s.pts.length; i += 2) { x0 = Math.min(x0, s.pts[i]); x1 = Math.max(x1, s.pts[i]); y0 = Math.min(y0, s.pts[i + 1]); y1 = Math.max(y1, s.pts[i + 1]) }
      return { x0, y0, x1, y1 }
    }
  }
}

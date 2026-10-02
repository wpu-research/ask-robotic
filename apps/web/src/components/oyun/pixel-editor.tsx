'use client'
// Piksel resim editörü (8x8, 16x16 ve benzeri boyutlar; 16 renkli kendi paletimiz) + resim yöneticisi (liste, galeri).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORY_LABEL, GALLERY, GALLERY_CATEGORIES, galleryImage, type AssetCategory } from '@/lib/oyun/assets'
import { PALETTE, PALETTE_RGB } from '@/lib/oyun/palette'
import { T, blank, clone, flipH, flipV, floodFill, get, line, parse, rotateCW, set, shift, toRows, type Pix } from '@/lib/oyun/pixels'
import { MAX_IMAGES, type OyunImage } from '@/lib/oyun/types'
import { uniqueImageId } from '@/lib/oyun/project'
import { PixelThumb } from './pixel-thumb'

type Tool = 'pencil' | 'eraser' | 'fill' | 'line' | 'pick'
const TOOLS: { id: Tool; label: string; icon: string; key: string }[] = [
  { id: 'pencil', label: 'Kalem', icon: '✏️', key: 'K' },
  { id: 'eraser', label: 'Silgi', icon: '🧽', key: 'S' },
  { id: 'fill', label: 'Doldur', icon: '🪣', key: 'D' },
  { id: 'line', label: 'Çizgi', icon: '📏', key: 'C' },
  { id: 'pick', label: 'Renk seç', icon: '💧', key: 'R' },
]

export interface PixelEditorProps {
  rows: string[]
  onChange: (rows: string[]) => void
  /** Hücre piksel boyutu (varsayılan: sığdırılır). */
  maxCanvas?: number
}

/** Tek bir resmi düzenleyen bileşen. Resim değiştirilince `key` ile yeniden bağla. */
export function PixelEditor({ rows, onChange, maxCanvas = 336 }: PixelEditorProps) {
  const [pix, setPix] = useState<Pix>(() => parse(rows))
  const [color, setColor] = useState(2)
  const [tool, setTool] = useState<Tool>('pencil')
  const [mirror, setMirror] = useState(false)
  const [grid, setGrid] = useState(true)
  const undo = useRef<Pix[]>([])
  const redo = useRef<Pix[]>([])
  const cv = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number; base: Pix; paint: number } | null>(null)
  const [, force] = useState(0)

  const cell = Math.max(8, Math.floor(maxCanvas / Math.max(pix.w, pix.h)))
  const pixRef = useRef(pix); pixRef.current = pix

  const commit = useCallback((next: Pix, record = true) => {
    if (record) { undo.current.push(clone(pixRef.current)); if (undo.current.length > 60) undo.current.shift(); redo.current = [] }
    pixRef.current = next
    setPix(next)
    onChange(toRows(next))
  }, [onChange])

  // ---- çizim ----
  useEffect(() => {
    const c = cv.current
    if (!c) return
    c.width = pix.w * cell
    c.height = pix.h * cell
    const ctx = c.getContext('2d')
    if (!ctx) return
    for (let y = 0; y < pix.h; y++) for (let x = 0; x < pix.w; x++) {
      const v = pix.d[y * pix.w + x]
      if (v < 0) { ctx.fillStyle = (x + y) % 2 ? '#d9deea' : '#eef1f8'; ctx.fillRect(x * cell, y * cell, cell, cell) }
      else { const [r, g, b] = PALETTE_RGB[v]; ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(x * cell, y * cell, cell, cell) }
    }
    if (grid && cell >= 10) {
      ctx.strokeStyle = 'rgba(21,19,31,.18)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= pix.w; x++) { ctx.moveTo(x * cell + 0.5, 0); ctx.lineTo(x * cell + 0.5, pix.h * cell) }
      for (let y = 0; y <= pix.h; y++) { ctx.moveTo(0, y * cell + 0.5); ctx.lineTo(pix.w * cell, y * cell + 0.5) }
      ctx.stroke()
      if (pix.w >= 16) { // 8'lik bölme çizgileri
        ctx.strokeStyle = 'rgba(21,19,31,.4)'
        ctx.beginPath()
        for (let x = 8; x < pix.w; x += 8) { ctx.moveTo(x * cell + 0.5, 0); ctx.lineTo(x * cell + 0.5, pix.h * cell) }
        for (let y = 8; y < pix.h; y += 8) { ctx.moveTo(0, y * cell + 0.5); ctx.lineTo(pix.w * cell, y * cell + 0.5) }
        ctx.stroke()
      }
    }
    if (mirror) { ctx.strokeStyle = 'rgba(214,51,90,.9)'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo((pix.w * cell) / 2, 0); ctx.lineTo((pix.w * cell) / 2, pix.h * cell); ctx.stroke(); ctx.setLineDash([]) }
  }, [pix, cell, grid, mirror])

  const at = (e: React.PointerEvent): [number, number] => {
    const r = cv.current!.getBoundingClientRect()
    return [Math.floor(((e.clientX - r.left) / r.width) * pix.w), Math.floor(((e.clientY - r.top) / r.height) * pix.h)]
  }
  const stamp = (p: Pix, x: number, y: number, v: number) => { set(p, x, y, v); if (mirror) set(p, p.w - 1 - x, y, v) }

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    const [x, y] = at(e)
    const base = clone(pixRef.current)
    if (tool === 'pick') { const v = get(base, x, y); if (v >= 0) setColor(v); else setTool('eraser'); return }
    if (tool === 'fill') {
      const n = clone(base)
      floodFill(n, x, y, color)
      if (mirror) floodFill(n, n.w - 1 - x, y, color)
      commit(n)
      return
    }
    drag.current = { x, y, base, paint: tool === 'eraser' ? T : color }
    const n = clone(base)
    stamp(n, x, y, drag.current.paint)
    pixRef.current = n; setPix(n)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const [x, y] = at(e)
    if (tool === 'line') {
      const n = clone(d.base)
      for (const [px, py] of line(d.x, d.y, x, y)) stamp(n, px, py, d.paint)
      pixRef.current = n; setPix(n)
      return
    }
    if (x === d.x && y === d.y) return
    const n = clone(pixRef.current)
    for (const [px, py] of line(d.x, d.y, x, y)) stamp(n, px, py, d.paint)
    d.x = x; d.y = y
    pixRef.current = n; setPix(n)
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    undo.current.push(d.base); if (undo.current.length > 60) undo.current.shift(); redo.current = []
    onChange(toRows(pixRef.current))
    force((n) => n + 1)
  }

  const doUndo = () => { const p = undo.current.pop(); if (!p) return; redo.current.push(clone(pixRef.current)); pixRef.current = p; setPix(p); onChange(toRows(p)) }
  const doRedo = () => { const p = redo.current.pop(); if (!p) return; undo.current.push(clone(pixRef.current)); pixRef.current = p; setPix(p); onChange(toRows(p)) }

  // klavye kısayolları (yalnız editör odaktayken)
  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const t = TOOLS.find((x) => x.key.toLowerCase() === e.key.toLowerCase())
    if (t) { setTool(t.id); return }
    if (/^[0-9a-f]$/i.test(e.key)) setColor(parseInt(e.key, 16))
  }

  const square = pix.w === pix.h
  const actions: { label: string; icon: string; run: () => void; disabled?: boolean }[] = [
    { label: 'Yatay çevir', icon: '↔', run: () => commit(flipH(pix)) },
    { label: 'Dikey çevir', icon: '↕', run: () => commit(flipV(pix)) },
    { label: square ? 'Sağa döndür' : 'Döndür (yalnız kare resimde)', icon: '⟳', run: () => commit(rotateCW(pix)), disabled: !square },
    { label: 'Sola kaydır', icon: '←', run: () => commit(shift(pix, -1, 0)) },
    { label: 'Sağa kaydır', icon: '→', run: () => commit(shift(pix, 1, 0)) },
    { label: 'Yukarı kaydır', icon: '↑', run: () => commit(shift(pix, 0, -1)) },
    { label: 'Aşağı kaydır', icon: '↓', run: () => commit(shift(pix, 0, 1)) },
    { label: 'Temizle', icon: '🗑', run: () => commit(blank(pix.w, pix.h)) },
  ]

  return (
    <div className="oy-pixed" tabIndex={0} onKeyDown={onKey} data-testid="oyun-pixel-editor">
      <div className="oy-pixed-tools" role="toolbar" aria-label="Çizim araçları">
        {TOOLS.map((t) => (
          <button key={t.id} type="button" className="oy-tool" aria-pressed={tool === t.id} title={`${t.label} (${t.key})`} onClick={() => setTool(t.id)}>
            <span aria-hidden="true">{t.icon}</span><span className="oy-tool-l">{t.label}</span>
          </button>
        ))}
        <button type="button" className="oy-tool" aria-pressed={mirror} title="Aynalı çizim: sol yarıya çizdiğin sağ yarıya da çizilir" onClick={() => setMirror((m) => !m)}>
          <span aria-hidden="true">🪞</span><span className="oy-tool-l">Aynalı</span>
        </button>
        <button type="button" className="oy-tool" aria-pressed={grid} title="Izgarayı göster/gizle" onClick={() => setGrid((g) => !g)}>
          <span aria-hidden="true">▦</span><span className="oy-tool-l">Izgara</span>
        </button>
        <span className="oy-spacer" />
        <button type="button" className="oy-tool" onClick={doUndo} disabled={!undo.current.length} title="Geri al (Ctrl+Z)"><span aria-hidden="true">↶</span><span className="oy-tool-l">Geri al</span></button>
        <button type="button" className="oy-tool" onClick={doRedo} disabled={!redo.current.length} title="Yinele (Ctrl+Shift+Z)"><span aria-hidden="true">↷</span><span className="oy-tool-l">Yinele</span></button>
      </div>
      <div className="oy-pixed-body">
        <div className="oy-pixed-canvaswrap">
          <canvas ref={cv} className="oy-pixed-canvas" style={{ width: pix.w * cell, height: pix.h * cell }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-label={`${pix.w} x ${pix.h} piksel çizim alanı`} />
        </div>
        <div className="oy-pixed-side">
          <div className="oy-palette" role="radiogroup" aria-label="Renk paleti">
            {PALETTE.map((c) => (
              <button key={c.index} type="button" role="radio" aria-checked={tool !== 'eraser' && color === c.index} aria-label={c.name} title={`${c.name} (${c.ch})`} className="oy-swatch" style={{ background: c.hex }} onClick={() => { setColor(c.index); if (tool === 'eraser' || tool === 'pick') setTool('pencil') }} />
            ))}
          </div>
          <button type="button" className="oy-tool" aria-pressed={tool === 'eraser'} onClick={() => setTool('eraser')} title="Saydam renk (silgi)">▫ Saydam</button>
          <div className="oy-pixed-actions">
            {actions.map((a) => (
              <button key={a.label} type="button" className="oy-tool oy-tool-sq" title={a.label} aria-label={a.label} disabled={a.disabled} onClick={a.run}>{a.icon}</button>
            ))}
          </div>
          <div className="oy-preview" aria-label="Önizleme">
            <span className="oy-label">Önizleme</span>
            <div className="oy-preview-row">
              {[1, 2, 4].map((s) => <span key={s} className="oy-preview-box"><PixelThumb rows={toRows(pix)} scale={s} /></span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ───────── Resim yöneticisi ─────────
export interface ImageManagerProps {
  images: Record<string, OyunImage>
  onChange: (images: Record<string, OyunImage>) => void
  /** Blokların kullandığı resim kimlikleri (silmeden önce uyarı için). */
  usedIds: ReadonlySet<string>
  /** Karo takımında kullanılan resim kimlikleri (silmeden önce uyarı için). */
  tileIds?: ReadonlySet<string>
  /** Seçili resmi dışarıdan seçtir. */
  initialId?: string
}

const NEW_SIZES: { w: number; h: number; label: string }[] = [
  { w: 16, h: 16, label: '16 × 16 (sprite / karo)' },
  { w: 8, h: 8, label: '8 × 8 (küçük)' },
  { w: 16, h: 8, label: '16 × 8 (geniş)' },
  { w: 8, h: 16, label: '8 × 16 (uzun)' },
]

export function ImageManager({ images, onChange, usedIds, tileIds, initialId }: ImageManagerProps) {
  const ids = Object.keys(images)
  const [sel, setSel] = useState<string | null>(initialId && images[initialId] ? initialId : ids[0] ?? null)
  const [gallery, setGallery] = useState(false)
  const [cat, setCat] = useState<AssetCategory>('oyuncu')
  const [sizeOpen, setSizeOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const current = sel && images[sel] ? sel : ids[0] ?? null

  const add = (id: string, img: OyunImage) => { onChange({ ...images, [id]: img }); setSel(id) }
  const full = ids.length >= MAX_IMAGES

  const newImage = (w: number, h: number) => {
    if (full) { setMsg(`En çok ${MAX_IMAGES} resim ekleyebilirsin.`); return }
    const id = uniqueImageId(images, 'resim')
    add(id, { name: 'Yeni resim', rows: Array.from({ length: h }, () => '.'.repeat(w)) })
    setSizeOpen(false); setGallery(false); setMsg(null)
  }
  const fromGallery = (gid: string) => {
    if (full) { setMsg(`En çok ${MAX_IMAGES} resim ekleyebilirsin.`); return }
    const g = galleryImage(gid)
    const id = gid in images ? uniqueImageId(images, gid) : gid
    add(id, g)
    setMsg(`"${g.name}" projene eklendi; istersen düzenle.`)
  }
  const duplicate = () => {
    if (!current) return
    if (full) { setMsg(`En çok ${MAX_IMAGES} resim ekleyebilirsin.`); return }
    const src = images[current]
    add(uniqueImageId(images, current), { name: `${src.name ?? current} kopya`, rows: [...src.rows] })
  }
  const remove = () => {
    if (!current) return
    const warn = usedIds.has(current) ? 'Bu resim bloklarında kullanılıyor; silersen o bloklar hata verir. ' : tileIds?.has(current) ? 'Bu resim karo takımında kullanılıyor. ' : ''
    if (!window.confirm(`${warn}"${images[current].name ?? current}" resmini silmek istiyor musun?`)) return
    const next = { ...images }
    delete next[current]
    onChange(next)
    setSel(Object.keys(next)[0] ?? null)
  }
  const catList = useMemo(() => GALLERY.filter((a) => a.category === cat), [cat])

  return (
    <div className="oy-imgs" data-testid="oyun-images">
      <div className="oy-imgs-list">
        <div className="oy-imgs-head">
          <div className="oy-menuwrap">
            <button type="button" className="btn btn-sm btn-primary" onClick={() => { setSizeOpen((o) => !o); setGallery(false) }} aria-expanded={sizeOpen}>＋ Yeni resim</button>
            {sizeOpen && (
              <div className="oy-menu" role="menu">
                {NEW_SIZES.map((s) => <button key={s.label} type="button" role="menuitem" onClick={() => newImage(s.w, s.h)}>{s.label}</button>)}
              </div>
            )}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" aria-pressed={gallery} onClick={() => { setGallery((g) => !g); setSizeOpen(false) }}>🖼 Galeri ({GALLERY.length})</button>
        </div>
        {msg && <p className="oy-note" role="status">{msg}</p>}
        <ul className="oy-imgs-grid" aria-label="Projedeki resimler">
          {ids.map((id) => (
            <li key={id}>
              <button type="button" className="oy-imgbtn" aria-pressed={id === current} onClick={() => { setSel(id); setGallery(false) }} title={images[id].name ?? id}>
                <span className="oy-imgbtn-art"><PixelThumb rows={images[id].rows} scale={images[id].rows[0].length >= 24 ? 1 : 2} /></span>
                <span className="oy-imgbtn-name">{images[id].name ?? id}</span>
              </button>
            </li>
          ))}
          {!ids.length && <li className="oy-empty">Projede henüz resim yok. Galeriden ekle ya da yeni bir tane çiz.</li>}
        </ul>
      </div>
      <div className="oy-imgs-main">
        {gallery ? (
          <div className="oy-gallery">
            <div className="oy-tabs-sm" role="tablist" aria-label="Galeri kategorileri">
              {GALLERY_CATEGORIES.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)}>{CATEGORY_LABEL[c]}</button>
              ))}
            </div>
            <ul className="oy-gallery-grid">
              {catList.map((a) => (
                <li key={a.id}>
                  <button type="button" className="oy-imgbtn" onClick={() => fromGallery(a.id)} title={`${a.name} — projeye ekle`}>
                    <span className="oy-imgbtn-art"><PixelThumb rows={a.rows} scale={a.rows[0].length >= 24 ? 1 : 3} /></span>
                    <span className="oy-imgbtn-name">{a.name}</span>
                    {a.id in images && <span className="oy-badge">var</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : current ? (
          <div className="oy-imgs-edit">
            <div className="oy-imgs-meta">
              <label className="oy-field">
                <span className="oy-label">Adı</span>
                <input type="text" value={images[current].name ?? ''} maxLength={40} onChange={(e) => onChange({ ...images, [current]: { ...images[current], name: e.target.value } })} placeholder={current} />
              </label>
              <code className="oy-id" title="Resim kimliği (blokların kullandığı ad)">{current}</code>
              <span className="oy-spacer" />
              <button type="button" className="btn btn-sm btn-ghost" onClick={duplicate}>Kopyala</button>
              <button type="button" className="btn btn-sm btn-ghost oy-danger" onClick={remove}>Sil</button>
            </div>
            <PixelEditor key={current} rows={images[current].rows} onChange={(rows) => onChange({ ...images, [current]: { ...images[current], rows } })} />
          </div>
        ) : (
          <p className="oy-empty">Bir resim seç, galeriden ekle ya da yeni resim çiz.</p>
        )}
      </div>
    </div>
  )
}


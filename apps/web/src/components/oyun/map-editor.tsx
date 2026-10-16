'use client'
// Karo haritası editörü: harita seç / oluştur, karo takımı (duvar işareti) ve boyama.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useT } from '@/i18n/client'
import { ASSET_NAME_EN } from '@/lib/oyun/i18n-en'
import { PALETTE_RGB } from '@/lib/oyun/palette'
import { parse } from '@/lib/oyun/pixels'
import { ensureTile, newMap, removeTileEntry, renameMapRefs, resizeMap, setCell, tileKey } from '@/lib/oyun/project'
import { MAX_MAP_COLS, MAX_MAP_ROWS, MAX_TILESET, TILE, TILE_KEYS, type OyunMap, type OyunProject } from '@/lib/oyun/types'
import { GALLERY_BY_ID, galleryOf } from '@/lib/oyun/assets'
import { PixelThumb } from './pixel-thumb'

type MTool = 'paint' | 'erase' | 'fill'
const ZOOM = 2

const rowsOf = (p: OyunProject, id: string): string[] | null => p.images[id]?.rows ?? GALLERY_BY_ID[id]?.rows ?? null

function floodCells(m: OyunMap, col: number, row: number, ch: string): OyunMap {
  const target = m.cells[row]?.[col]
  if (target === undefined || target === ch) return m
  const cells = m.cells.map((r) => r.split(''))
  const stack: [number, number][] = [[col, row]]
  while (stack.length) {
    const [c, r] = stack.pop()!
    if (c < 0 || r < 0 || c >= m.cols || r >= m.rows || cells[r][c] !== target) continue
    cells[r][c] = ch
    stack.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1])
  }
  return { ...m, cells: cells.map((r) => r.join('')) }
}

/** Yazarken taslağı tutar, bırakınca (blur/Enter) uygular. */
function DraftInput({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [v, setV] = useState(value)
  return <input type="text" value={v} maxLength={24} onChange={(e) => setV(e.target.value)} onBlur={() => onCommit(v)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} />
}

export interface MapEditorProps { project: OyunProject; onChange: (p: OyunProject) => void }

export function MapEditor({ project, onChange }: MapEditorProps) {
  const t = useT()
  const locale = useLocale()
  const [sel, setSel] = useState(0)
  const [tile, setTile] = useState(0)
  const [tool, setTool] = useState<MTool>('paint')
  const [addOpen, setAddOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const painting = useRef(false)
  const cache = useRef(new Map<string, HTMLCanvasElement>())
  const map = project.maps[Math.min(sel, project.maps.length - 1)] ?? null
  const mapIndex = map ? project.maps.indexOf(map) : -1

  const tileCanvas = useCallback((id: string): HTMLCanvasElement | null => {
    const rows = rowsOf(project, id)
    if (!rows) return null
    const key = id + '|' + rows.join('')
    const hit = cache.current.get(key)
    if (hit) return hit
    const p = parse(rows)
    const c = document.createElement('canvas')
    c.width = p.w; c.height = p.h
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(p.w, p.h)
    for (let i = 0; i < p.d.length; i++) {
      const v = p.d[i]
      if (v < 0) continue
      const [r, g, b] = PALETTE_RGB[v]
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    if (cache.current.size > 200) cache.current.clear()
    cache.current.set(key, c)
    return c
  }, [project])

  useEffect(() => {
    const c = cv.current
    if (!c || !map) return
    const S = TILE * ZOOM
    c.width = map.cols * S
    c.height = map.rows * S
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    for (let y = 0; y < map.rows; y++) for (let x = 0; x < map.cols; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#d9deea' : '#eef1f8'
      ctx.fillRect(x * S, y * S, S, S)
      const k = TILE_KEYS.indexOf(map.cells[y][x])
      const t = k >= 0 ? project.tileset[k] : undefined
      if (t) {
        const tc = tileCanvas(t.image)
        if (tc) ctx.drawImage(tc, x * S, y * S, tc.width * ZOOM, tc.height * ZOOM)
        else { ctx.fillStyle = '#d6335a'; ctx.fillRect(x * S, y * S, S, S) }
        if (t.wall) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1; ctx.strokeRect(x * S + 1.5, y * S + 1.5, S - 3, S - 3) }
      }
    }
    ctx.strokeStyle = 'rgba(21,19,31,.15)'
    ctx.beginPath()
    for (let x = 0; x <= map.cols; x++) { ctx.moveTo(x * S + 0.5, 0); ctx.lineTo(x * S + 0.5, map.rows * S) }
    for (let y = 0; y <= map.rows; y++) { ctx.moveTo(0, y * S + 0.5); ctx.lineTo(map.cols * S, y * S + 0.5) }
    ctx.stroke()
    // 160x120'lik ekran çerçevesi (başlangıç görünümü)
    ctx.strokeStyle = 'rgba(214,51,90,.9)'
    ctx.setLineDash([6, 4])
    ctx.strokeRect(0.5, 0.5, Math.min(map.cols * S, 160 * ZOOM) - 1, Math.min(map.rows * S, 120 * ZOOM) - 1)
    ctx.setLineDash([])
  }, [map, project, tileCanvas])

  const updateMap = (m: OyunMap) => onChange({ ...project, maps: project.maps.map((x, i) => (i === mapIndex ? m : x)) })

  const cellAt = (e: React.PointerEvent): [number, number] | null => {
    if (!map) return null
    const r = cv.current!.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * map.cols), y = Math.floor(((e.clientY - r.top) / r.height) * map.rows)
    return x < 0 || y < 0 || x >= map.cols || y >= map.rows ? null : [x, y]
  }
  const paintAt = (m: OyunMap, x: number, y: number): OyunMap => {
    const ch = tool === 'erase' ? '.' : tileKey(tile)
    return setCell(m, x, y, ch)
  }
  const down = (e: React.PointerEvent) => {
    if (!map) return
    const c = cellAt(e)
    if (!c) return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    if (tool === 'fill') { updateMap(floodCells(map, c[0], c[1], tileKey(tile))); return }
    if (tool === 'paint' && !project.tileset[tile]) { setMsg(t('studios.oyun.map.pickTileFirst')); return }
    painting.current = true
    updateMap(paintAt(map, c[0], c[1]))
  }
  const move = (e: React.PointerEvent) => {
    if (!painting.current || !map) return
    const c = cellAt(e)
    if (!c) return
    const cur = project.maps[mapIndex]
    if (tool === 'erase' ? cur.cells[c[1]][c[0]] === '.' : cur.cells[c[1]][c[0]] === tileKey(tile)) return
    updateMap(paintAt(cur, c[0], c[1]))
  }
  const up = () => { painting.current = false }

  const addMap = () => {
    let n = project.maps.length + 1
    while (project.maps.some((m) => m.name === `harita${n}`)) n++
    onChange({ ...project, maps: [...project.maps, newMap(`harita${n}`, 20, 15)] })
    setSel(project.maps.length)
  }
  const removeMap = () => {
    if (!map || !window.confirm(t('studios.oyun.map.confirmDelete', { name: map.name }))) return
    onChange({ ...project, maps: project.maps.filter((_, i) => i !== mapIndex) })
    setSel(0)
  }
  const rename = (name: string) => {
    if (!map) return
    const clean = name.replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 24)
    if (!clean || clean === map.name || project.maps.some((m, i) => i !== mapIndex && m.name === clean)) return
    const renamed = renameMapRefs(project, map.name, clean)
    onChange({ ...renamed, maps: renamed.maps.map((x, i) => (i === mapIndex ? { ...x, name: clean } : x)) })
  }
  const resize = (cols: number, rows: number) => { if (map) updateMap(resizeMap(map, Math.max(1, Math.min(MAX_MAP_COLS, cols || 1)), Math.max(1, Math.min(MAX_MAP_ROWS, rows || 1)))) }

  const addTile = (image: string) => {
    const p = { ...project, tileset: [...project.tileset] }
    const idx = ensureTile(p, image, false)
    if (idx < 0) { setMsg(t('studios.oyun.map.tilesetFull', { n: MAX_TILESET })); return }
    onChange(p)
    setTile(idx)
    setAddOpen(false)
    setMsg(null)
  }
  const toggleWall = (i: number) => onChange({ ...project, tileset: project.tileset.map((t, k) => (k === i ? { ...t, wall: !t.wall } : t)) })
  const removeTile = (i: number) => {
    if (!window.confirm(t('studios.oyun.map.confirmRemoveTile'))) return
    onChange(removeTileEntry(project, i))
    setTile(0)
  }

  const own = Object.entries(project.images).filter(([, im]) => im.rows.length === 16 && im.rows[0].length === 16)
  const tileImages: [string, { name?: string; rows: string[] }][] = [...own, ...galleryOf('karo').filter((a) => !project.images[a.id]).map((a) => [a.id, { name: locale === 'en' ? ASSET_NAME_EN[a.id] ?? a.name : a.name, rows: a.rows }] as [string, { name?: string; rows: string[] }])]

  return (
    <div className="oy-mapEd" data-testid="oyun-map-editor">
      <div className="oy-map-top">
        <label className="oy-field">
          <span className="oy-label">{t('studios.oyun.map.map')}</span>
          <select value={Math.max(0, mapIndex)} onChange={(e) => setSel(Number(e.target.value))} disabled={!project.maps.length}>
            {project.maps.map((m, i) => <option key={m.name} value={i}>{m.name}</option>)}
            {!project.maps.length && <option>{t('studios.oyun.map.none')}</option>}
          </select>
        </label>
        <button type="button" className="btn btn-sm btn-primary" onClick={addMap}>{t('studios.oyun.map.newMap')}</button>
        {map && <>
          <label className="oy-field"><span className="oy-label">{t('studios.oyun.map.name')}</span><DraftInput key={map.name + mapIndex} value={map.name} onCommit={rename} /></label>
          <label className="oy-field oy-num"><span className="oy-label">{t('studios.oyun.map.cols')}</span><input type="number" min={1} max={MAX_MAP_COLS} value={map.cols} onChange={(e) => resize(Number(e.target.value), map.rows)} /></label>
          <label className="oy-field oy-num"><span className="oy-label">{t('studios.oyun.map.rows')}</span><input type="number" min={1} max={MAX_MAP_ROWS} value={map.rows} onChange={(e) => resize(map.cols, Number(e.target.value))} /></label>
          <button type="button" className="btn btn-sm btn-ghost oy-danger" onClick={removeMap}>{t('studios.oyun.map.delete')}</button>
        </>}
      </div>
      {msg && <p className="oy-note" role="status">{msg}</p>}
      <div className="oy-map-body">
        <div className="oy-map-side">
          <div className="oy-tools-row" role="toolbar" aria-label={t('studios.oyun.map.tools')}>
            {([['paint', '✏️', t('studios.oyun.map.paint')], ['erase', '🧽', t('studios.oyun.map.erase')], ['fill', '🪣', t('studios.oyun.map.fill')]] as const).map(([id, ic, label]) => (
              <button key={id} type="button" className="oy-tool" aria-pressed={tool === id} onClick={() => setTool(id)}><span aria-hidden="true">{ic}</span><span className="oy-tool-l">{label}</span></button>
            ))}
          </div>
          <span className="oy-label">{t('studios.oyun.map.tileset')}</span>
          <ul className="oy-tileset" aria-label={t('studios.oyun.map.tileset')}>
            {project.tileset.map((tl, i) => {
              const rows = rowsOf(project, tl.image)
              return (
                <li key={`${tl.image}-${i}`} className="oy-tile" data-selected={i === tile && tool !== 'erase'}>
                  <button type="button" className="oy-tile-pick" onClick={() => { setTile(i); if (tool === 'erase') setTool('paint') }} title={`${tl.image}`}>
                    {rows ? <PixelThumb rows={rows} scale={2} /> : <span className="oy-missing">?</span>}
                  </button>
                  <label className="oy-wall" title={t('studios.oyun.map.wallTitle')}><input type="checkbox" checked={tl.wall} onChange={() => toggleWall(i)} /> {t('studios.oyun.map.wall')}</label>
                  <button type="button" className="oy-x" aria-label={t('studios.oyun.map.removeTile')} onClick={() => removeTile(i)}>×</button>
                </li>
              )
            })}
          </ul>
          <div className="oy-menuwrap">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAddOpen((o) => !o)} aria-expanded={addOpen}>{t('studios.oyun.map.addTile')}</button>
            {addOpen && (
              <div className="oy-menu oy-menu-tiles">
                {tileImages.length ? tileImages.map(([id, im]) => (
                  <button key={id} type="button" onClick={() => addTile(id)} title={im.name ?? id}><PixelThumb rows={im.rows} scale={2} /></button>
                )) : <span className="oy-empty">{t('studios.oyun.map.noTileImages')}</span>}
              </div>
            )}
          </div>
          <p className="oy-hint">{t('studios.oyun.map.hint')}</p>
        </div>
        <div className="oy-map-canvaswrap">
          {map ? (
            <canvas ref={cv} className="oy-map-canvas" style={{ width: map.cols * TILE * ZOOM, height: map.rows * TILE * ZOOM }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label={t('studios.oyun.map.canvas', { cols: map.cols, rows: map.rows })} />
          ) : (
            <p className="oy-empty">{t('studios.oyun.map.empty')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

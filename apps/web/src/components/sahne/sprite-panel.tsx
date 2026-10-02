'use client'
// Sprite listesi (Scratch'i çağrıştıran): küçük resimli karakterler, sahne (arka plan) kutusu ve yüzen "karakter ekle" düğmeleri.
import { useEffect, useRef, useState } from 'react'
import { onBitmapLoaded, paintThumb } from '@/lib/sahne/render'
import type { SahneProject } from '@/lib/sahne/types'

function SpriteThumb({ c, bg }: { c: SahneProject['sprites'][number]['costumes'][number] | undefined; bg?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [n, setN] = useState(0)
  useEffect(() => onBitmapLoaded(() => setN((x) => x + 1)), [])
  useEffect(() => { if (ref.current) paintThumb(ref.current, c, bg) }, [c, bg, n])
  return <canvas ref={ref} width={64} height={64} className="sh-thumb" aria-hidden="true" />
}

export interface SpritePanelProps {
  project: SahneProject
  selected: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onAddCharacter: () => void
  onDraw: () => void
  onRandom: () => void
  onAddBackdrop: () => void
  canAdd: boolean
}

export function SpritePanel({ project, selected, onSelect, onDelete, onAddCharacter, onDraw, onRandom, onAddBackdrop, canAdd }: SpritePanelProps) {
  const stageCostume = project.stage.backdrops[project.stage.backdrop]
  return (
    <div className="sh-sprites" data-testid="sahne-sprites">
      <ul className="sh-sprite-tiles" aria-label="Sprite listesi">
        {project.sprites.map((s, i) => (
          <li key={s.id}>
            <div role="button" tabIndex={0} className="sh-tile" aria-pressed={selected === s.id} data-testid={`sahne-sprite-${s.id}`}
              onClick={() => onSelect(s.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(s.id) } }}>
              <span className="sh-tile-no">{i + 1}</span>
              <SpriteThumb c={s.costumes[s.costume]} />
              <span className="sh-tile-nm">{s.name}</span>
              {selected === s.id && <button type="button" className="sh-tile-del" aria-label={`${s.name} sprite'ını sil`} title="Sil" onClick={(e) => { e.stopPropagation(); onDelete(s.id) }} data-testid="sahne-sprite-delete">✕</button>}
            </div>
          </li>
        ))}
      </ul>
      <div className="sh-stagetile">
        <span className="sh-stagetile-lab">Sahne</span>
        <div role="button" tabIndex={0} className="sh-tile sh-tile-stage" aria-pressed={selected === 'stage'} data-testid="sahne-stage-tile" onClick={() => onSelect('stage')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('stage') } }}>
          <SpriteThumb c={stageCostume} bg="#fff" />
          <span className="sh-tile-nm">{project.stage.backdrops.length} arka plan</span>
        </div>
      </div>
      <div className="sh-fab" role="group" aria-label="Ekle">
        <button type="button" className="sh-fab-btn sh-fab-main" onClick={onAddCharacter} disabled={!canAdd} title="Karakter ekle" aria-label="Karakter ekle" data-testid="sahne-add-sprite">🐱<small>Karakter</small></button>
        <button type="button" className="sh-fab-btn" onClick={onDraw} disabled={!canAdd} title="Kendin çiz" aria-label="Kendin çiz" data-testid="sahne-draw-sprite">🎨</button>
        <button type="button" className="sh-fab-btn" onClick={onRandom} disabled={!canAdd} title="Rastgele karakter" aria-label="Rastgele karakter">🎲</button>
        <button type="button" className="sh-fab-btn sh-fab-bg" onClick={onAddBackdrop} title="Arka plan ekle" aria-label="Arka plan ekle" data-testid="sahne-add-backdrop">🖼<small>Arka plan</small></button>
      </div>
    </div>
  )
}

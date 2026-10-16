'use client'
// Sprite listesi (Scratch'i çağrıştıran): küçük resimli karakterler, sahne (arka plan) kutusu ve yüzen "karakter ekle" düğmeleri.
import { useEffect, useRef, useState } from 'react'
import { onBitmapLoaded, paintThumb } from '@/lib/sahne/render'
import type { SahneProject } from '@/lib/sahne/types'
import { useT } from '@/i18n/client'

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
  const t = useT()
  const stageCostume = project.stage.backdrops[project.stage.backdrop]
  return (
    <div className="sh-sprites" data-testid="sahne-sprites">
      <ul className="sh-sprite-tiles" aria-label={t('studios.sahne.sprites.list')}>
        {project.sprites.map((s, i) => (
          <li key={s.id}>
            <div role="button" tabIndex={0} className="sh-tile" aria-pressed={selected === s.id} data-testid={`sahne-sprite-${s.id}`}
              onClick={() => onSelect(s.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(s.id) } }}>
              <span className="sh-tile-no">{i + 1}</span>
              <SpriteThumb c={s.costumes[s.costume]} />
              <span className="sh-tile-nm">{s.name}</span>
              {selected === s.id && <button type="button" className="sh-tile-del" aria-label={t('studios.sahne.sprites.deleteSprite', { name: s.name })} title={t('studios.sahne.sprites.delete')} onClick={(e) => { e.stopPropagation(); onDelete(s.id) }} data-testid="sahne-sprite-delete">✕</button>}
            </div>
          </li>
        ))}
      </ul>
      <div className="sh-stagetile">
        <span className="sh-stagetile-lab">{t('studios.sahne.sprites.stage')}</span>
        <div role="button" tabIndex={0} className="sh-tile sh-tile-stage" aria-pressed={selected === 'stage'} data-testid="sahne-stage-tile" onClick={() => onSelect('stage')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('stage') } }}>
          <SpriteThumb c={stageCostume} bg="#fff" />
          <span className="sh-tile-nm">{t('studios.sahne.sprites.backdropCount', { n: project.stage.backdrops.length })}</span>
        </div>
      </div>
      <div className="sh-fab" role="group" aria-label={t('studios.sahne.sprites.add')}>
        <button type="button" className="sh-fab-btn sh-fab-main" onClick={onAddCharacter} disabled={!canAdd} title={t('studios.sahne.sprites.addCharacter')} aria-label={t('studios.sahne.sprites.addCharacter')} data-testid="sahne-add-sprite">🐱<small>{t('studios.sahne.sprites.character')}</small></button>
        <button type="button" className="sh-fab-btn" onClick={onDraw} disabled={!canAdd} title={t('studios.sahne.sprites.drawOwn')} aria-label={t('studios.sahne.sprites.drawOwn')} data-testid="sahne-draw-sprite">🎨</button>
        <button type="button" className="sh-fab-btn" onClick={onRandom} disabled={!canAdd} title={t('studios.sahne.sprites.random')} aria-label={t('studios.sahne.sprites.random')}>🎲</button>
        <button type="button" className="sh-fab-btn sh-fab-bg" onClick={onAddBackdrop} title={t('studios.sahne.sprites.addBackdrop')} aria-label={t('studios.sahne.sprites.addBackdrop')} data-testid="sahne-add-backdrop">🖼<small>{t('studios.sahne.sprites.backdrop')}</small></button>
      </div>
    </div>
  )
}

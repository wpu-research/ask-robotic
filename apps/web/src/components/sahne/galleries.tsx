'use client'
// Galeriler: karakter, arka plan, ses. Hepsi bu projede çizilmiş/sentezlenmiş içeriktir.
import { useEffect, useMemo, useRef, useState } from 'react'
import { BACKDROPS } from '@/lib/sahne/gallery/backdrops'
import { CHARACTERS, CHARACTER_GROUPS } from '@/lib/sahne/gallery/characters'
import { paintThumb } from '@/lib/sahne/render'
import { SOUND_GALLERY, SOUND_GROUPS, SahneAudio, soundSteps } from '@/lib/sahne/sounds'
import type { Costume } from '@/lib/sahne/types'
import { Modal } from './dialogs'

function ThumbCanvas({ c, w = 96, h = 72, bg }: { c: Costume; w?: number; h?: number; bg?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => { if (ref.current) paintThumb(ref.current, c, bg) }, [c, bg])
  return <canvas ref={ref} width={w} height={h} className="sh-gthumb" aria-hidden="true" />
}

export function CharacterGallery({ onPick, onDraw, onClose }: { onPick: (charId: string) => void; onDraw: () => void; onClose: () => void }) {
  const [group, setGroup] = useState<string>('hepsi')
  const list = useMemo(() => CHARACTERS.filter((c) => group === 'hepsi' || c.group === group), [group])
  return (
    <Modal title="Karakter seç" onClose={onClose} wide testid="sahne-gallery-characters">
      <div className="sh-gtabs" role="tablist" aria-label="Karakter grupları">
        {[{ id: 'hepsi', label: 'Hepsi' }, ...CHARACTER_GROUPS].map((g) => <button key={g.id} type="button" role="tab" aria-selected={group === g.id} className="sh-gtab" onClick={() => setGroup(g.id)}>{g.label}</button>)}
      </div>
      <ul className="sh-ggrid">
        <li><button type="button" className="sh-gcard sh-gcard-draw" onClick={onDraw} data-testid="sahne-gallery-draw"><span className="sh-gplus">🎨</span><b>Kendin çiz</b><small>Boş bir kostüm</small></button></li>
        {list.map((c) => (
          <li key={c.id}>
            <button type="button" className="sh-gcard" onClick={() => onPick(c.id)} data-testid={`sahne-char-${c.id}`}>
              <ThumbCanvas c={c.costumes[0]} /><b>{c.name}</b>{c.costumes.length > 1 && <small>{c.costumes.length} kostüm</small>}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export function BackdropGallery({ onPick, onClose }: { onPick: (id: string) => void; onClose: () => void }) {
  return (
    <Modal title="Arka plan seç" onClose={onClose} wide testid="sahne-gallery-backdrops">
      <ul className="sh-ggrid">
        {BACKDROPS.map((b) => (
          <li key={b.id}>
            <button type="button" className="sh-gcard" onClick={() => onPick(b.id)} data-testid={`sahne-backdrop-${b.id}`}>
              <ThumbCanvas c={b.costume} w={128} h={96} bg="#fff" /><b>{b.name}</b>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export function SoundGallery({ onPick, onClose }: { onPick: (gid: string) => void; onClose: () => void }) {
  const audio = useRef<SahneAudio | null>(null)
  useEffect(() => () => { audio.current?.dispose() }, [])
  const play = (gid: string) => { audio.current ??= new SahneAudio(); audio.current.unlock(); audio.current.playSteps(soundSteps({ name: gid, gid }), 1) }
  return (
    <Modal title="Ses seç" onClose={onClose} wide testid="sahne-gallery-sounds">
      {SOUND_GROUPS.map((g) => (
        <section key={g.id} className="sh-sgroup">
          <h4>{g.label}</h4>
          <ul className="sh-sgrid">
            {SOUND_GALLERY.filter((s) => s.group === g.id).map((s) => (
              <li key={s.id} className="sh-scard">
                <button type="button" className="sh-splay" onClick={() => play(s.id)} aria-label={`${s.name} sesini dinle`} title="Dinle">▶</button>
                <span>{s.name}</span>
                <button type="button" className="btn btn-sm" onClick={() => onPick(s.id)} data-testid={`sahne-sound-${s.id}`}>Ekle</button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Modal>
  )
}

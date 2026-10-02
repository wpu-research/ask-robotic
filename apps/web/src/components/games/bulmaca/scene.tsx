'use client'
// Bulmaca sahnesi: solda hedef kart, sağda bloklarla kurulan hayvan. Altta parça sayacı rozetleri.
import type { CSSProperties } from 'react'
import type { PuzzleState } from '@/lib/games/bulmaca/engine'
import { COLORS, FEATURE_INFO, FEATURE_ORDER, featureCount, firstDifference } from '@/lib/games/bulmaca/features'
import type { SceneProps } from '@/lib/games/types'
import { Animal } from './animal'
import './bulmaca.css'

export default function Scene({ frame, running, speed, outcome }: SceneProps<PuzzleState>) {
  const { target, built, targetTitle, multi, cards, index, results } = frame
  const matched = firstDifference(target, built) === null
  const success = !!outcome?.ok || (multi ? results[index] === true : false)
  const state = success ? 'ok' : !running && outcome && !outcome.ok ? 'bad' : 'idle'
  const chips = FEATURE_ORDER.filter((k) => featureCount(target, k) > 0 || featureCount(built, k) > 0).map((k) => {
    const t = featureCount(target, k), c = featureCount(built, k)
    return { key: k, label: `${FEATURE_INFO[k].label} ${c}/${t}`, ok: t === c, touched: c > 0 }
  })
  if (target.color !== 'VARSAYILAN' || built.color !== 'VARSAYILAN') chips.push({ key: 'RENK' as never, label: `renk: ${COLORS[built.color].label}`, ok: target.color === built.color, touched: built.color !== 'VARSAYILAN' })
  if (target.name || built.name) chips.push({ key: 'AD' as never, label: 'ad', ok: target.name.trim().toLocaleLowerCase('tr-TR') === built.name.trim().toLocaleLowerCase('tr-TR'), touched: !!built.name })

  return (
    <div className="bul" style={{ ['--bul-speed' as string]: Math.max(0.3, speed) } as CSSProperties}>
      <div className="bul-panels">
        <figure className="bul-panel bul-card">
          <figcaption className="bul-cap">
            <span>{multi ? `Kart ${index + 1}/${cards.length}` : 'Kart'}</span>
            <span>{targetTitle}</span>
          </figcaption>
          <Animal f={target} label={`Hedef kart: ${targetTitle}`} />
          <p className="bul-tag">{target.name}</p>
        </figure>
        <figure className="bul-panel bul-built" data-state={state}>
          <figcaption className="bul-cap"><span>Senin hayvanın</span></figcaption>
          <Animal f={built} animate label="Senin hayvanın" />
          <p className="bul-tag">{built.name}</p>
          {success && matched && <span className="bul-ok-mark" aria-hidden>✓</span>}
        </figure>
      </div>
      <div className="bul-bottom">
        {multi && (
          <ol className="bul-dots" aria-label="Kart sonuçları">
            {results.map((r, i) => <li key={i} className="bul-dot" data-s={r === true ? 'ok' : r === false ? 'bad' : 'none'} data-cur={i === index} aria-label={`Kart ${i + 1}: ${r === true ? 'doğru' : r === false ? 'yanlış' : 'bekliyor'}`} />)}
          </ol>
        )}
        <ul className="bul-chips" aria-label="Parça sayıları (sende/kartta)">
          {chips.map((c) => <li key={c.key} className="bul-chip" data-ok={c.ok} data-touched={c.touched}>{c.label}</li>)}
        </ul>
      </div>
    </div>
  )
}

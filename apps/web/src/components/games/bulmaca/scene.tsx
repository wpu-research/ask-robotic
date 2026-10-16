'use client'
// Bulmaca sahnesi: solda hedef kart, sağda bloklarla kurulan hayvan. Altta parça sayacı rozetleri.
import type { CSSProperties } from 'react'
import { useLocale, useT } from '@/i18n/client'
import type { PuzzleState } from '@/lib/games/bulmaca/engine'
import { COLORS, FEATURE_INFO, FEATURE_ORDER, featureCount, firstDifference } from '@/lib/games/bulmaca/features'
import type { SceneProps } from '@/lib/games/types'
import { Animal } from './animal'
import './bulmaca.css'

export default function Scene({ frame, running, speed, outcome }: SceneProps<PuzzleState>) {
  const t = useT()
  const en = useLocale() === 'en'
  const { target, built, multi, cards, index, results } = frame
  const targetTitle = en ? (frame.targetTitleEn ?? frame.targetTitle) : frame.targetTitle
  const featLabel = (k: keyof typeof FEATURE_INFO) => (en ? FEATURE_INFO[k].en.other : FEATURE_INFO[k].label)
  const colorLabel = (k: keyof typeof COLORS) => (en ? COLORS[k].labelEn : COLORS[k].label)
  const matched = firstDifference(target, built) === null
  const success = !!outcome?.ok || (multi ? results[index] === true : false)
  const state = success ? 'ok' : !running && outcome && !outcome.ok ? 'bad' : 'idle'
  const chips = FEATURE_ORDER.filter((k) => featureCount(target, k) > 0 || featureCount(built, k) > 0).map((k) => {
    const tc = featureCount(target, k), c = featureCount(built, k)
    return { key: k, label: `${featLabel(k)} ${c}/${tc}`, ok: tc === c, touched: c > 0 }
  })
  if (target.color !== 'VARSAYILAN' || built.color !== 'VARSAYILAN') chips.push({ key: 'RENK' as never, label: t('studios.games.bulmaca.colorChip', { color: colorLabel(built.color) }), ok: target.color === built.color, touched: built.color !== 'VARSAYILAN' })
  if (target.name || built.name) chips.push({ key: 'AD' as never, label: t('studios.games.bulmaca.nameChip'), ok: target.name.trim().toLocaleLowerCase('tr-TR') === built.name.trim().toLocaleLowerCase('tr-TR'), touched: !!built.name })

  return (
    <div className="bul" style={{ ['--bul-speed' as string]: Math.max(0.3, speed) } as CSSProperties}>
      <div className="bul-panels">
        <figure className="bul-panel bul-card">
          <figcaption className="bul-cap">
            <span>{multi ? t('studios.games.bulmaca.cardN', { n: index + 1, total: cards.length }) : t('studios.games.bulmaca.card')}</span>
            <span>{targetTitle}</span>
          </figcaption>
          <Animal f={target} label={t('studios.games.bulmaca.targetAria', { title: targetTitle })} />
          <p className="bul-tag">{target.name}</p>
        </figure>
        <figure className="bul-panel bul-built" data-state={state}>
          <figcaption className="bul-cap"><span>{t('studios.games.bulmaca.yours')}</span></figcaption>
          <Animal f={built} animate label={t('studios.games.bulmaca.yours')} />
          <p className="bul-tag">{built.name}</p>
          {success && matched && <span className="bul-ok-mark" aria-hidden>✓</span>}
        </figure>
      </div>
      <div className="bul-bottom">
        {multi && (
          <ol className="bul-dots" aria-label={t('studios.games.bulmaca.resultsAria')}>
            {results.map((r, i) => <li key={i} className="bul-dot" data-s={r === true ? 'ok' : r === false ? 'bad' : 'none'} data-cur={i === index} aria-label={t(r === true ? 'studios.games.bulmaca.resultOk' : r === false ? 'studios.games.bulmaca.resultBad' : 'studios.games.bulmaca.resultWait', { n: i + 1 })} />)}
          </ol>
        )}
        <ul className="bul-chips" aria-label={t('studios.games.bulmaca.chipsAria')}>
          {chips.map((c) => <li key={c.key} className="bul-chip" data-ok={c.ok} data-touched={c.touched}>{c.label}</li>)}
        </ul>
      </div>
    </div>
  )
}

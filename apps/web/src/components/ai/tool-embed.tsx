'use client'
import { useMemo } from 'react'
import { sharedTerms, type Method } from '@/lib/ai/embedding'
import type { EmbedState } from '@/lib/ai/activity'
import { docsFor, embedRank } from '@/lib/ai/views'
import { useT } from '@/i18n/client'
import { Bar, type ToolProps } from './ui'

export function EmbedTool({ state, onChange, lang = 'tr' }: ToolProps<EmbedState>) {
  const t = useT()
  const docs = docsFor(lang)
  const ranked = useMemo(() => embedRank(state, lang), [state, lang])
  const best = ranked[0]
  return (
    <div className="ai-main">
      <div className="ai-card">
        <div className="ai-row">
          <label className="ai-field" style={{ flex: '3 1 260px' }}><span>{t('studios.ai.embed.query')}</span>
            <input type="text" value={state.query} onChange={(e) => onChange({ ...state, query: e.target.value })} placeholder={lang === 'en' ? 'sound wave' : 'ses dalgası'} />
          </label>
          <label className="ai-field"><span>{t('studios.ai.embed.method')}</span>
            <select value={state.method} onChange={(e) => onChange({ ...state, method: e.target.value as Method })}>
              <option value="sayim">{t('studios.ai.embed.count')}</option>
              <option value="tfidf">TF-IDF</option>
            </select>
          </label>
        </div>
        <p className="muted" style={{ margin: '10px 0 0', fontSize: '.85rem' }}>
          {lang === 'en' ? t('studios.ai.embed.explainEn') : t('studios.ai.embed.explain')}
        </p>
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.embed.ranking')}</h3>
        <ul className="ai-bars" aria-live="polite">
          {ranked.map((r) => <Bar key={r.item.id} name={docs.find((d) => d.id === r.item.id)?.title ?? r.item.id} value={r.score} label={r.score.toFixed(2)} kind={r === best && r.score > 0 ? 'ok' : undefined} />)}
        </ul>
        {best && best.score > 0 ? (
          <p style={{ margin: '10px 0 0' }}>{t('studios.ai.embed.closest')} <b>{docs.find((d) => d.id === best.item.id)?.title}</b>. {t('studios.ai.embed.shared')} <b>{sharedTerms(state.query, best.item.text, true, lang).join(', ') || '-'}</b></p>
        ) : (
          <p style={{ margin: '10px 0 0' }}><b>{t('studios.ai.embed.noneTitle')}</b> {t('studios.ai.embed.noneBody')}</p>
        )}
        <h4>{t('studios.ai.embed.docs')}</h4>
        <ul className="ai-chunks">
          {docs.map((d) => <li key={d.id} className="ai-chunk" data-hit={best?.item.id === d.id && best.score > 0}><small>{d.title}</small>{d.text}</li>)}
        </ul>
      </div>
    </div>
  )
}

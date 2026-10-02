'use client'
import { useMemo } from 'react'
import { DOCS_ROBOT } from '@/lib/ai/corpus'
import { sharedTerms, type Method } from '@/lib/ai/embedding'
import type { EmbedState } from '@/lib/ai/activity'
import { embedRank } from '@/lib/ai/views'
import { Bar, type ToolProps } from './ui'

export function EmbedTool({ state, onChange }: ToolProps<EmbedState>) {
  const ranked = useMemo(() => embedRank(state), [state])
  const best = ranked[0]
  return (
    <div className="ai-main">
      <div className="ai-card">
        <div className="ai-row">
          <label className="ai-field" style={{ flex: '3 1 260px' }}><span>Sorgu</span>
            <input type="text" value={state.query} onChange={(e) => onChange({ ...state, query: e.target.value })} placeholder="ses dalgası" />
          </label>
          <label className="ai-field"><span>Vektör yöntemi</span>
            <select value={state.method} onChange={(e) => onChange({ ...state, method: e.target.value as Method })}>
              <option value="sayim">Kelime sayımı</option>
              <option value="tfidf">TF-IDF</option>
            </select>
          </label>
        </div>
        <p className="muted" style={{ margin: '10px 0 0', fontSize: '.85rem' }}>
          Kelimeler küçük harfe çevrilir, bağlaçlar atılır, kelimelerin ilk 5 harfi tutulur (çok basit gövdeleme). Benzerlik = iki vektörün kosinüsü (1 = aynı yönde, 0 = ortak kelime yok). Bu bir ANLAM vektörü değil, kelime vektörüdür: "mesafe" ile "uzaklık" eşleşmez.
        </p>
      </div>
      <div className="ai-card">
        <h3>Benzerliğe göre sıralama</h3>
        <ul className="ai-bars" aria-live="polite">
          {ranked.map((r) => <Bar key={r.item.id} name={DOCS_ROBOT.find((d) => d.id === r.item.id)?.title ?? r.item.id} value={r.score} label={r.score.toFixed(2)} kind={r === best && r.score > 0 ? 'ok' : undefined} />)}
        </ul>
        {best && best.score > 0 ? (
          <p style={{ margin: '10px 0 0' }}>En yakın belge: <b>{DOCS_ROBOT.find((d) => d.id === best.item.id)?.title}</b>. Ortak terimler: <b>{sharedTerms(state.query, best.item.text).join(', ') || '-'}</b></p>
        ) : (
          <p style={{ margin: '10px 0 0' }}><b>Hiçbir belgeyle ortak kelime yok.</b> Sorgu anlamca ilgili olsa bile sayım vektörü bunu göremez.</p>
        )}
        <h4>Belgeler</h4>
        <ul className="ai-chunks">
          {DOCS_ROBOT.map((d) => <li key={d.id} className="ai-chunk" data-hit={best?.item.id === d.id && best.score > 0}><small>{d.title}</small>{d.text}</li>)}
        </ul>
      </div>
    </div>
  )
}

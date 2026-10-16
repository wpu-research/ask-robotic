'use client'
import { useMemo } from 'react'
import type { RagState } from '@/lib/ai/activity'
import { ragGuideFor, ragView } from '@/lib/ai/views'
import { useT } from '@/i18n/client'
import { Bar, Simulation, type ToolProps } from './ui'

export function RagTool({ state, onChange, lang = 'tr' }: ToolProps<RagState>) {
  const t = useT()
  const run = useMemo(() => ragView(state, lang), [state, lang])
  const hit = new Set(run.retrieved.map((r) => r.item.id))
  const set = (p: Partial<RagState>) => onChange({ ...state, ...p })
  return (
    <div className="ai-main">
      <div className="ai-card">
        <h3>{t('studios.ai.rag.doc')}</h3>
        <p className="ai-intro" style={{ fontSize: '.9rem' }}>{ragGuideFor(lang)}</p>
        <p className="muted" style={{ margin: '6px 0 0', fontSize: '.82rem' }}>{t('studios.ai.rag.fictional')}</p>
      </div>
      <div className="ai-card">
        <label className="ai-field"><span>{t('studios.ai.rag.question')}</span>
          <input type="text" value={state.question} onChange={(e) => set({ question: e.target.value })} />
        </label>
        <div className="ai-row" style={{ marginTop: 10 }}>
          <label className="ai-field"><span>{t('studios.ai.rag.size')} <b className="ai-val">{t('studios.ai.rag.words', { n: state.size })}</b></span>
            <input type="range" min={10} max={120} value={state.size} onChange={(e) => { const size = Number(e.target.value); set({ size, overlap: Math.min(state.overlap, size - 1) }) }} />
          </label>
          <label className="ai-field"><span>{t('studios.ai.rag.overlap')} <b className="ai-val">{t('studios.ai.rag.words', { n: state.overlap })}</b></span>
            <input type="range" min={0} max={Math.max(0, Math.floor(state.size / 2))} value={Math.min(state.overlap, Math.floor(state.size / 2))} onChange={(e) => set({ overlap: Number(e.target.value) })} />
          </label>
          <label className="ai-field"><span>{t('studios.ai.rag.topK')} <b className="ai-val">{state.topK}</b></span>
            <input type="range" min={1} max={5} value={state.topK} onChange={(e) => set({ topK: Number(e.target.value) })} />
          </label>
        </div>
      </div>
      <div className="ai-steps">
        <section className="ai-step"><h4>{t('studios.ai.rag.chunkStep', { n: run.chunks.length })}</h4>
          <ul className="ai-chunks">{run.chunks.map((c) => <li key={c.id} className="ai-chunk" data-hit={hit.has(c.id)}><small>{c.id} · {t('studios.ai.rag.wordRange', { from: c.startWord + 1, to: c.endWord })}</small>{c.text}</li>)}</ul>
        </section>
        <section className="ai-step"><h4>{t('studios.ai.rag.vecStep')}</h4>
          <p style={{ margin: 0, fontSize: '.9rem' }}>{t('studios.ai.rag.vecBody')}</p>
        </section>
        <section className="ai-step"><h4>{t('studios.ai.rag.getStep', { n: state.topK })}</h4>
          <ul className="ai-bars">{run.ranked.slice(0, 6).map((r) => <Bar key={r.item.id} name={r.item.id} value={r.score} label={r.score.toFixed(2)} kind={hit.has(r.item.id) ? 'ok' : undefined} />)}</ul>
        </section>
        <section className="ai-step"><h4>{t('studios.ai.rag.promptStep')}</h4>
          <pre className="ai-pre">{run.prompt}</pre>
        </section>
        <section className="ai-step" data-sim="true"><h4>{t('studios.ai.rag.synthStep')}</h4>
          <Simulation>{t('studios.ai.rag.synthSim')}</Simulation>
          <p style={{ margin: '8px 0 0' }}><b>{run.template.text}</b></p>
        </section>
      </div>
    </div>
  )
}

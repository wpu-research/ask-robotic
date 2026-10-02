'use client'
import { useMemo } from 'react'
import { RAG_GUIDE } from '@/lib/ai/corpus'
import type { RagState } from '@/lib/ai/activity'
import { ragView } from '@/lib/ai/views'
import { Bar, Simulation, type ToolProps } from './ui'

export function RagTool({ state, onChange }: ToolProps<RagState>) {
  const run = useMemo(() => ragView(state), [state])
  const hit = new Set(run.retrieved.map((r) => r.item.id))
  const set = (p: Partial<RagState>) => onChange({ ...state, ...p })
  return (
    <div className="ai-main">
      <div className="ai-card">
        <h3>Belge (kurgusal rehber)</h3>
        <p className="ai-intro" style={{ fontSize: '.9rem' }}>{RAG_GUIDE}</p>
        <p className="muted" style={{ margin: '6px 0 0', fontSize: '.82rem' }}>Bu rehber ders için uydurulmuştur; gerçek bir kuruluşa ait değildir.</p>
      </div>
      <div className="ai-card">
        <label className="ai-field"><span>Soru</span>
          <input type="text" value={state.question} onChange={(e) => set({ question: e.target.value })} />
        </label>
        <div className="ai-row" style={{ marginTop: 10 }}>
          <label className="ai-field"><span>Parça boyu: <b className="ai-val">{state.size} kelime</b></span>
            <input type="range" min={10} max={120} value={state.size} onChange={(e) => { const size = Number(e.target.value); set({ size, overlap: Math.min(state.overlap, size - 1) }) }} />
          </label>
          <label className="ai-field"><span>Örtüşme: <b className="ai-val">{state.overlap} kelime</b></span>
            <input type="range" min={0} max={Math.max(0, Math.floor(state.size / 2))} value={Math.min(state.overlap, Math.floor(state.size / 2))} onChange={(e) => set({ overlap: Number(e.target.value) })} />
          </label>
          <label className="ai-field"><span>Getirilecek parça (K): <b className="ai-val">{state.topK}</b></span>
            <input type="range" min={1} max={5} value={state.topK} onChange={(e) => set({ topK: Number(e.target.value) })} />
          </label>
        </div>
      </div>
      <div className="ai-steps">
        <section className="ai-step"><h4>Parçala: {run.chunks.length} parça</h4>
          <ul className="ai-chunks">{run.chunks.map((c) => <li key={c.id} className="ai-chunk" data-hit={hit.has(c.id)}><small>{c.id} · kelime {c.startWord + 1}-{c.endWord}</small>{c.text}</li>)}</ul>
        </section>
        <section className="ai-step"><h4>Vektörleştir</h4>
          <p style={{ margin: 0, fontSize: '.9rem' }}>Her parça ve soru, TF-IDF terim vektörüne çevrilir (anlam vektörü değil, kelime vektörü; ilk 5 harf gövdeleme).</p>
        </section>
        <section className="ai-step"><h4>Getir: kosinüs benzerliğine göre ilk {state.topK}</h4>
          <ul className="ai-bars">{run.ranked.slice(0, 6).map((r) => <Bar key={r.item.id} name={r.item.id} value={r.score} label={r.score.toFixed(2)} kind={hit.has(r.item.id) ? 'ok' : undefined} />)}</ul>
        </section>
        <section className="ai-step"><h4>Bağlama yerleştir: modele giden prompt</h4>
          <pre className="ai-pre">{run.prompt}</pre>
        </section>
        <section className="ai-step" data-sim="true"><h4>Sentez (ŞABLON)</h4>
          <Simulation>Sentez adımı burada gerçek bir model olurdu. Bu kutu yalnız getirilen bağlamdaki en çok eşleşen cümleyi alıntılar; yorum yapmaz, özetlemez.</Simulation>
          <p style={{ margin: '8px 0 0' }}><b>{run.template.text}</b></p>
        </section>
      </div>
    </div>
  )
}

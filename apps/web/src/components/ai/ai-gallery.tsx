'use client'
// Serbest araç galerisi: dokuz aracı etkinlik/hedef olmadan dene.
import { useState } from 'react'
import { AI_TOOLS, type AiTool } from '@/lib/ai/activity'
import { AiEditor } from './ai-editor'
import './ai.css'

export function AiGallery() {
  const [tool, setTool] = useState<AiTool>('tokenizer')
  const meta = AI_TOOLS.find((t) => t.id === tool)!
  return (
    <div className="ai-main">
      <div className="ai-tabs" role="tablist" aria-label="Araçlar">
        {AI_TOOLS.map((t) => <button key={t.id} type="button" role="tab" id={`ai-tab-${t.id}`} aria-controls="ai-panel" className="ai-tab" aria-selected={t.id === tool} onClick={() => setTool(t.id)}>{t.title}</button>)}
      </div>
      <p className="muted" style={{ margin: 0 }}>{meta.about}</p>
      <div id="ai-panel" role="tabpanel" aria-labelledby={`ai-tab-${tool}`}>
        <AiEditor key={tool} tool={tool} storageKey={`free:${tool}`} />
      </div>
    </div>
  )
}

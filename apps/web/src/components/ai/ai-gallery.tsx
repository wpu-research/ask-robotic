'use client'
// Serbest araç galerisi: dokuz aracı etkinlik/hedef olmadan dene.
import { useState } from 'react'
import { AI_TOOLS, type AiTool } from '@/lib/ai/activity'
import { useT } from '@/i18n/client'
import { AiEditor } from './ai-editor'
import './ai.css'

export function AiGallery() {
  const [tool, setTool] = useState<AiTool>('tokenizer')
  const t = useT()
  return (
    <div className="ai-main">
      <div className="ai-tabs" role="tablist" aria-label={t('studios.ai.gallery.toolsAria')}>
        {AI_TOOLS.map((x) => <button key={x.id} type="button" role="tab" id={`ai-tab-${x.id}`} aria-controls="ai-panel" className="ai-tab" aria-selected={x.id === tool} onClick={() => setTool(x.id)}>{t(`studios.ai.tools.${x.id}.title`)}</button>)}
      </div>
      <p className="muted" style={{ margin: 0 }}>{t(`studios.ai.tools.${tool}.about`)}</p>
      <div id="ai-panel" role="tabpanel" aria-labelledby={`ai-tab-${tool}`}>
        <AiEditor key={tool} tool={tool} storageKey={`free:${tool}`} />
      </div>
    </div>
  )
}

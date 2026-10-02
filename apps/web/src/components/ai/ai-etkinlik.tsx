'use client'
// Araç türüne göre doğru etkileşimli aracı çizer. Ders oynatıcıya bağlanacak bileşenlerden biri: AiEditor (hedefler + kayıt dahil).
import type { AiTool, ToolStates } from '@/lib/ai/activity'
import { AgentTool } from './tool-agent'
import { DetectiveTool } from './tool-detective'
import { EmbedTool } from './tool-embed'
import { EvalTool } from './tool-eval'
import { InjectionTool } from './tool-injection'
import { NextwordTool } from './tool-nextword'
import { PromptTool } from './tool-prompt'
import { RagTool } from './tool-rag'
import { TokenizerTool } from './tool-tokenizer'
import './ai.css'

export interface AiEtkinlikBilesenProps<K extends AiTool = AiTool> {
  tool: K
  state: ToolStates[K]
  onChange: (s: ToolStates[K]) => void
  /** Etkinlik kipinde görev bağlamı (dünya, hedef sistem, iddia seti, görev) kilitlenir. */
  locked?: boolean
}

export function AiEtkinlikBilesen<K extends AiTool>({ tool, state, onChange, locked }: AiEtkinlikBilesenProps<K>) {
  // Tür, `tool` ayırt edicisine göre daraltılır; üst bileşen aynı türdeki durumu verir.
  const p = { state, onChange, locked } as never
  switch (tool as AiTool) {
    case 'tokenizer': return <TokenizerTool {...(p as Parameters<typeof TokenizerTool>[0])} />
    case 'nextword': return <NextwordTool {...(p as Parameters<typeof NextwordTool>[0])} />
    case 'embed': return <EmbedTool {...(p as Parameters<typeof EmbedTool>[0])} />
    case 'rag': return <RagTool {...(p as Parameters<typeof RagTool>[0])} />
    case 'agent': return <AgentTool {...(p as Parameters<typeof AgentTool>[0])} />
    case 'prompt': return <PromptTool {...(p as Parameters<typeof PromptTool>[0])} />
    case 'injection': return <InjectionTool {...(p as Parameters<typeof InjectionTool>[0])} />
    case 'eval': return <EvalTool {...(p as Parameters<typeof EvalTool>[0])} />
    case 'detective': return <DetectiveTool {...(p as Parameters<typeof DetectiveTool>[0])} />
  }
}
/** Türkçe karakterli ad (ders oynatıcı spesifikasyonundaki isim). */
export const AiEtkinlikBileşeni = AiEtkinlikBilesen

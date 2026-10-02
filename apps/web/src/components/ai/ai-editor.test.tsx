import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AiEditor } from './ai-editor'
import { ALL_AI_ACTIVITIES } from '@/lib/ai/activities'

describe('AiEditor (sunucu çıktısı)', () => {
  for (const a of ALL_AI_ACTIVITIES) {
    it(`${a.id} çökmeden çizilir ve hedefleri gösterir`, () => {
      const html = renderToString(<AiEditor activity={a} storageKey={`t:${a.id}`} />)
      expect(html).toContain(a.title.replaceAll("'", '&#x27;'))
      expect(html).toContain('Hedefler')
      expect(html).toContain('Tamamen yerel')
    })
  }
})

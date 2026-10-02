import { describe, expect, it } from 'vitest'
import { GAME_META, GAME_SLUGS, isGameSlug, metaOf } from './meta'
import { GAME_LOADERS, loadGame } from './registry'

describe('oyun kaydı', () => {
  it('8 oyun, benzersiz slug ve dolu metin', () => {
    expect(GAME_META).toHaveLength(8)
    expect(new Set(GAME_SLUGS).size).toBe(8)
    for (const g of GAME_META) { expect(g.title.length).toBeGreaterThan(2); expect(g.tagline.endsWith('.')).toBe(true) }
  })
  it('her slug için yükleyici var; slug doğrulaması', () => {
    expect(Object.keys(GAME_LOADERS).sort()).toEqual([...GAME_SLUGS].sort())
    expect(isGameSlug('labirent')).toBe(true)
    expect(isGameSlug('yok')).toBe(false)
    expect(metaOf('golet-egitmeni')?.title).toBe('Gölet Eğitmeni')
  })
  it('yüklenen oyun (varsa) meta ile uyumlu; yoksa null', async () => {
    for (const slug of GAME_SLUGS) {
      const g = await loadGame(slug)
      if (!g) continue
      expect(g.slug).toBe(slug)
      expect(g.levels.length).toBeGreaterThan(0)
    }
    expect(await loadGame('yok')).toBeNull()
  })
})

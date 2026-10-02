import { describe, expect, it } from 'vitest'
import { getArenaActivity } from './activity'
import { variantsForScene, variantsOfKey } from './variants'

describe('ders yolları (A/B/C)', () => {
  it('112 ve 113: temel + kol + takip; temel ilk sırada', () => {
    for (const key of ['robotik:8:2', 'robotik:8:3']) {
      const v = variantsOfKey(key)
      expect(v.map((x) => x.key)).toEqual([key, `${key}:kol`, `${key}:takip`])
      expect(v.map((x) => x.activity.variant?.id)).toEqual(['arac', 'kol', 'takip'])
    }
  })
  it('yolu olmayan derste boş döner; bilinmeyen anahtarda da', () => {
    expect(variantsOfKey('robotik:1:4')).toEqual([])
    expect(variantsOfKey('robotik:99:1')).toEqual([])
  })
  it('sahne kimliğinden (temel ya da yol) aynı listeye ulaşılır; sahne kimlikleri benzersizdir', () => {
    const list = variantsOfKey('robotik:8:3')
    for (const v of list) expect(variantsForScene(v.activity.scene.id)).toEqual(list)
    expect(new Set(list.map((v) => v.activity.scene.id)).size).toBe(list.length)
    expect(variantsForScene('r6-104')).toBeNull()
  })
  it('getArenaActivity dördüncü bölümlü anahtarı çözer', () => {
    expect(getArenaActivity('robotik:8:3:kol')?.scene.kind).toBe('arm')
    expect(getArenaActivity('robotik:8:3:takip')?.scene.kind).toBe('rover')
    expect(getArenaActivity('robotik:8:3:yok')).toBeNull()
  })
  it('B yolu kol sahnesi, C yolu hareketli hedefli robot sahnesidir', () => {
    const b = getArenaActivity('robotik:8:2:kol')!.scene, c = getArenaActivity('robotik:8:3:takip')!.scene
    expect(b.kind).toBe('arm')
    expect(c.kind === 'rover' && c.movers?.length).toBe(1)
    expect(c.kind === 'rover' && c.sensors.ultrasonic).toBe(true)
  })
})

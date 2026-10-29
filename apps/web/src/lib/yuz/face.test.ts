import { describe, expect, it } from 'vitest'
import { blinkAt, emotionForText, EMOTIONS, lerpPose, mouthFromLevel, POSES, pseudoSpeechLevel } from './face'

describe('face', () => {
  it('her duygunun pozu tanımlı ve makul aralıkta', () => {
    for (const e of EMOTIONS) {
      const p = POSES[e]
      expect(p.smile).toBeGreaterThanOrEqual(-1); expect(p.smile).toBeLessThanOrEqual(1)
      expect(p.open).toBeGreaterThanOrEqual(0); expect(p.lid).toBeGreaterThanOrEqual(0); expect(p.eye).toBeGreaterThan(0.5)
    }
  })
  it('lerpPose uçlarda tam değeri verir', () => {
    expect(lerpPose(POSES.notr, POSES.mutlu, 0)).toEqual(POSES.notr)
    expect(lerpPose(POSES.notr, POSES.mutlu, 1)).toEqual(POSES.mutlu)
  })
  it('göz kırpma kısa süreli: çoğu zaman açık, sınırlarda 0..1', () => {
    expect(blinkAt(1)).toBe(0)
    const v = blinkAt(0.08); expect(v).toBeGreaterThan(0.9); expect(v).toBeLessThanOrEqual(1)
    expect(blinkAt(3.4 + 0.5)).toBe(0)
  })
  it('ağız: sessizlikte kapanır, sesle açılır, 0..1 dışına çıkmaz', () => {
    let m = 0
    for (let i = 0; i < 20; i++) m = mouthFromLevel(0.5, m)
    expect(m).toBeGreaterThan(0.9); expect(m).toBeLessThanOrEqual(1)
    for (let i = 0; i < 40; i++) m = mouthFromLevel(0, m)
    expect(m).toBeLessThan(0.01)
    expect(mouthFromLevel(0.02, 0)).toBe(0)
  })
  it('sahte konuşma seviyesi 0..1 ve hareketli', () => {
    const xs = Array.from({ length: 200 }, (_, i) => pseudoSpeechLevel(i * 0.03))
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0); expect(Math.max(...xs)).toBeLessThanOrEqual(1)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(0.3)
  })
  it('metinden duygu', () => {
    expect(emotionForText('Bu mu?')).toBe('saskin')
    expect(emotionForText('Harika bir gün!')).toBe('mutlu')
    expect(emotionForText('Çok üzgünüm')).toBe('uzgun')
    expect(emotionForText('Rezistans akımı sınırlar.')).toBe('notr')
  })
})

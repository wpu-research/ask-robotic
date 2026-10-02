import { describe, expect, it } from 'vitest'
import { engel, runEval, sentiment } from './evals'

describe('eval', () => {
  it('sınıflandırıcılar', () => {
    expect(sentiment('Bu uygulama çok güzel')).toBe('olumlu')
    expect(sentiment('Berbat ve yavaş')).toBe('olumsuz')
    expect(sentiment('Kolay değil')).toBe('olumsuz')
    expect(sentiment('Ders salı günü')).toBe('belirsiz')
    expect(sentiment('Harika, yine bozuldu')).not.toBe('olumsuz') // bilinen zayıflık: alay
    expect(engel('mesafe=19')).toBe('dur')
    expect(engel('mesafe=20')).toBe('yavaşla')
    expect(engel('mesafe=50 hız=10')).toBe('devam')
    expect(engel('hız=10')).toBe('hata')
    expect(engel('mesafe=40 hız=100')).toBe('yavaşla') // hız hesaba katılmaz
  })
  it('doğruluk ve etiket başına geri çağırma gerçekten hesaplanır', () => {
    const r = runEval('sentiment', [
      { text: 'çok güzel', expected: 'olumlu' },
      { text: 'berbat', expected: 'olumsuz' },
      { text: 'Harika, yine bozuldu', expected: 'olumsuz' },
      { text: 'fena değil', expected: 'olumlu' },
    ])
    expect(r.total).toBe(4)
    expect(r.correct).toBe(2)
    expect(r.accuracy).toBe(0.5)
    expect(r.recall['olumsuz']).toEqual({ n: 2, ok: 1 })
    expect(r.recall['olumlu']).toEqual({ n: 2, ok: 1 })
  })
  it('boş vakalar sayılmaz, tekrarlar bulunur', () => {
    const r = runEval('sentiment', [{ text: '', expected: 'olumlu' }, { text: 'güzel', expected: 'olumlu' }, { text: 'Güzel', expected: 'olumlu' }])
    expect(r.total).toBe(2)
    expect(r.duplicates).toBe(1)
    expect(runEval('engel', []).accuracy).toBe(0)
  })
})

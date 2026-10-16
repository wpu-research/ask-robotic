import { describe, expect, it } from 'vitest'
import { historyForRequest, tutorErrorText, OFFLINE_TEXT } from './client'
import { visibleText, REPLACE } from './protocol'
import { parseTutorRequest } from './request'

const ok = {
  lessonId: 3, stepIndex: 1, status: 'wrong', attempts: 1, answerSnapshot: 'Seçtiği: A',
  messages: [{ role: 'user', content: 'İpucu ver' }], deviceId: '0123456789abcdef0123456789abcdef',
}

describe('parseTutorRequest', () => {
  it('geçerli gövde', () => {
    const r = parseTutorRequest(ok)
    expect(r.ok).toBe(true)
    expect(parseTutorRequest({ ...ok, answerSnapshot: undefined }).ok).toBe(true)
  })
  it('sınırlar: ≤ 12 mesaj, her biri ≤ 600 karakter', () => {
    const many = Array.from({ length: 13 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'a' }))
    expect(parseTutorRequest({ ...ok, messages: many }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, messages: many.slice(0, 11) }).ok).toBe(true)
    expect(parseTutorRequest({ ...ok, messages: [{ role: 'user', content: 'a'.repeat(601) }] }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, messages: [{ role: 'user', content: '   ' }] }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, messages: [] }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, answerSnapshot: 'x'.repeat(601) }).ok).toBe(false)
  })
  it('öğrenciyle başlar ve biter; sistem rolü ve fazladan alan yok', () => {
    expect(parseTutorRequest({ ...ok, messages: [{ role: 'assistant', content: 'a' }, { role: 'user', content: 'b' }] }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, messages: [{ role: 'system', content: 'a' }] }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, step: { kind: 'choice' } }).ok).toBe(false) // adım verisi istemciden alınmaz
  })
  it('alan türleri', () => {
    expect(parseTutorRequest({ ...ok, lessonId: '3' }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, status: 'done' }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, attempts: -1 }).ok).toBe(false)
    expect(parseTutorRequest({ ...ok, deviceId: 'kötü id' }).ok).toBe(false)
    expect(parseTutorRequest(null).ok).toBe(false)
  })
})

describe('istemci yardımcıları', () => {
  it('historyForRequest: yerel notları atar, 12 ile sınırlar, öğrenciyle başlatır, 600 karakterde keser', () => {
    const msgs = [
      { role: 'user' as const, content: 'a' },
      { role: 'assistant' as const, content: 'çevrimdışı', local: true },
      ...Array.from({ length: 14 }, (_, i) => ({ role: (i % 2 ? 'user' : 'assistant') as 'user' | 'assistant', content: `m${i}` })),
      { role: 'assistant' as const, content: 'x'.repeat(900) },
      { role: 'user' as const, content: 'son' },
    ]
    const h = historyForRequest(msgs)
    expect(h.length).toBeLessThanOrEqual(12)
    expect(h[0].role).toBe('user')
    expect(h[h.length - 1]).toEqual({ role: 'user', content: 'son' })
    expect(h.every((m) => m.content.length <= 600)).toBe(true)
    expect(h.some((m) => m.content === 'çevrimdışı')).toBe(false)
    expect(parseTutorRequest({ ...ok, messages: h }).ok).toBe(true)
  })
  it('hata metinleri ve akış ayırıcı', () => {
    expect(tutorErrorText('tutor_disabled')).toBe(OFFLINE_TEXT)
    expect(OFFLINE_TEXT).toMatch(/Mac şu an çevrimdışı/)
    expect(tutorErrorText('daily_limit')).toMatch(/Bugünlük/)
    expect(visibleText('yarım cevap')).toBe('yarım cevap')
    expect(visibleText(`yarım${REPLACE}yedek`)).toBe('yedek')
  })
})

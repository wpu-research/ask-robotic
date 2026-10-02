import { describe, expect, it } from 'vitest'
import { MELODY_STEPS, noteFreq, stepsOf } from './sound'
import { MELODIES, NOTES } from './blocks'

describe('ses verisi', () => {
  it('bloklardaki her melodi için notalar tanımlı', () => {
    for (const [, id] of MELODIES) expect(MELODY_STEPS[id]?.length, id).toBeGreaterThan(0)
  })
  it('nota frekansları artan ve A4 = 440 Hz', () => {
    expect(noteFreq('A4')).toBe(440)
    for (let i = 1; i < NOTES.length; i++) expect(NOTES[i].freq).toBeGreaterThan(NOTES[i - 1].freq)
    expect(noteFreq('bilinmeyen')).toBe(440)
  })
  it('ses olayları çalınacak adımlara çevrilir', () => {
    expect(stepsOf({ kind: 'beep', freq: 300, ms: 90 })).toEqual([{ freq: 300, at: 0, ms: 90, wave: 'square', vol: 0.12 }])
    expect(stepsOf({ kind: 'note', note: 'C5', ms: 200 })[0].freq).toBeCloseTo(523.25, 1)
    expect(stepsOf({ kind: 'melody', name: 'yok' })).toEqual([])
    expect(stepsOf({ kind: 'melody', name: 'zafer' }).length).toBe(4)
  })
})

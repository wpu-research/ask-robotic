import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { mirrorSteps, validateSteps } from '../../../../tools/content/ek.mjs'
import { SKILLS } from './skills'
import { activityKey } from './jr/activity'
import { catalogHasActivity } from './steps-content-helpers'

// Etkileşimli ders (v2) içerikleri: biçim (validateSteps) ve etkinlik adımının gerçekten bir etkinliğe bağlı olması.
const skillIds = new Set(SKILLS.map((s) => s.id))
const withSteps = allModules.flatMap((m) => m.weeks.flatMap((w, wi) => w.lessons.flatMap((l, li) => (l.steps ? [{ m, wi, li, l }] : []))))

describe('v2 adım içerikleri', () => {
  it('en az bir pilot ders var', () => { expect(withSteps.length).toBeGreaterThan(0) })
  for (const { m, wi, li, l } of withSteps) {
    const where = `${m.slug}:${wi + 1}:${li + 1}`
    it(`${where} biçim`, () => { expect(() => validateSteps(l.steps, where, skillIds)).not.toThrow() })
    if (l.steps!.some((s) => s.kind === 'activity')) {
      it(`${where} etkinlik adımı bir etkinliğe bağlı`, () => { expect(catalogHasActivity(activityKey(m.slug, wi + 1, li + 1))).toBe(true) })
    }
  }
})

// İngilizce sürümler (NN.adimlar.en.json / extras stepsEn): biçim + Türkçeyle yapısal ayna
const withEn = withSteps.filter(({ l }) => l.stepsEn)

describe('v2 adımların İngilizcesi', () => {
  it('11 pilot dersin İngilizcesi var', () => { expect(withEn.length).toBeGreaterThanOrEqual(11) })
  it('stepsEn yalnız steps olan derslerde', () => {
    expect(allModules.flatMap((m) => m.weeks.flatMap((w) => w.lessons)).filter((l) => l.stepsEn && !l.steps)).toEqual([])
  })
  for (const { m, wi, li, l } of withEn) {
    const where = `${m.slug}:${wi + 1}:${li + 1} (en)`
    it(`${where} biçim`, () => { expect(() => validateSteps(l.stepsEn, where, skillIds)).not.toThrow() })
    it(`${where} Türkçeyle ayna`, () => { expect(() => mirrorSteps(l.steps, l.stepsEn, where)).not.toThrow() })
  }
})

describe('mirrorSteps', () => {
  const tr = [
    { kind: 'intro', title: 'Merhaba', body: 'Işık yakalım.' },
    { kind: 'choice', prompt: 'Hangisi?', code: 'delay(500);', options: ['Bir', 'İki'], answer: 1, why: 'Çünkü.' },
    { kind: 'numeric', prompt: 'Kaç?', answer: 5, tolerance: 0.1, unit: 'adım', why: 'Beş.' },
    { kind: 'fill', prompt: 'Doldur', code: 'pinMode(13, ___);\n// ___', tokens: ['OUTPUT', 'çıkış', 'giriş'], answer: ['OUTPUT', 'çıkış'], why: 'Çıkış.' },
    { kind: 'widget', prompt: 'Ayarla', widget: { type: 'ohm', v: 5 }, goals: [{ label: 'LED yansın', metric: 'ledOn', min: 1 }], why: 'Akım.' },
  ]
  const en = [
    { kind: 'intro', title: 'Hello', body: "Let's light it up." },
    { kind: 'choice', prompt: 'Which one?', code: 'delay(500);', options: ['One', 'Two'], answer: 1, why: 'Because.' },
    { kind: 'numeric', prompt: 'How many?', answer: 5, tolerance: 0.1, unit: 'steps', why: 'Five.' },
    { kind: 'fill', prompt: 'Fill in', code: 'pinMode(13, ___);\n// ___', tokens: ['OUTPUT', 'output', 'input'], answer: ['OUTPUT', 'output'], why: 'Output.' },
    { kind: 'widget', prompt: 'Adjust', widget: { type: 'ohm', v: 5 }, goals: [{ label: 'Light the LED', metric: 'ledOn', min: 1 }], why: 'Current.' },
  ]
  const tweak = (i: number, patch: Record<string, unknown>) => en.map((s, k) => (k === i ? { ...s, ...patch } : s))
  it('ayna geçerli', () => { expect(() => mirrorSteps(tr, en, 't')).not.toThrow() })
  it('farklar yakalanır', () => {
    expect(() => mirrorSteps(tr, en.slice(1), 't')).toThrow(/adım olmalı/)
    expect(() => mirrorSteps(tr, tweak(0, { kind: 'explain' }), 't')).toThrow(/kind/)
    expect(() => mirrorSteps(tr, tweak(1, { answer: 0 }), 't')).toThrow(/answer/)
    expect(() => mirrorSteps(tr, tweak(1, { code: 'delay(50);' }), 't')).toThrow(/code/)
    expect(() => mirrorSteps(tr, tweak(1, { options: ['One', 'Two', 'Three'] }), 't')).toThrow(/options/)
    expect(() => mirrorSteps(tr, tweak(2, { answer: 6 }), 't')).toThrow(/answer/)
    expect(() => mirrorSteps(tr, tweak(3, { answer: ['OUTPUT', 'input'] }), 't')).toThrow(/çip eşlemesi/)
    expect(() => mirrorSteps(tr, tweak(4, { goals: [{ label: 'x', metric: 'ledOn', min: 0 }] }), 't')).toThrow(/goals/)
    expect(() => mirrorSteps(tr, tweak(4, { widget: { type: 'ohm', v: 9 } }), 't')).toThrow(/widget/)
  })
})

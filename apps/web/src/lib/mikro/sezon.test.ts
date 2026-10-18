import { describe, expect, it } from 'vitest'
import { SEASONS, SEASON_BY_FIELD, runSeasonField, seasonMaxScore, seasonPhase } from './sezon'
import { SKILL_BY_ID } from './beceri'
import { b, onStart, project } from './program'
import { lights, motors, move, turn } from './robot-missions'

const season = SEASONS[0]
const field = season.field
const part = (r: ReturnType<typeof runSeasonField>, tr: string) => r.parts.find((p) => p.label.startsWith(tr))!.points

describe('yarışma sezonları: alan tanımı', () => {
  it('kimlikler eşsiz, Sanal Beceri sahalarıyla çakışmaz; 6-8 alt görev + zaman bonusu', () => {
    expect(new Set(SEASONS.map((s) => s.id)).size).toBe(SEASONS.length)
    for (const s of SEASONS) {
      expect(SKILL_BY_ID[s.field.id]).toBeUndefined()
      expect(SEASON_BY_FIELD[s.field.id]).toBe(s)
      const scoring = s.subMissions.filter((x) => x.id !== 'zaman')
      expect(scoring.length).toBeGreaterThanOrEqual(6)
      expect(scoring.length).toBeLessThanOrEqual(8)
      expect(s.penalties.length).toBeGreaterThan(0)
      expect(s.penalties.every((p) => p.points < 0)).toBe(true)
      expect(new Date(s.startsAt) < new Date(s.endsAt)).toBe(true)
    }
  })

  it('kurallar tablosu ve puan dökümü aynı sırada, iki dilde metin var', () => {
    const r = runSeasonField(season, project('boş', [onStart()]))
    expect(r.parts.map((p) => p.label.replace(/ \(.*$/, ''))).toEqual([...season.subMissions.map((s) => s.title), ...season.penalties.map((p) => p.title)])
    for (const x of [...season.subMissions, ...season.penalties]) {
      expect(x.how.length).toBeGreaterThan(10)
      expect(x.en.how.length).toBeGreaterThan(10)
      expect(x.en.title).not.toBe(x.title)
    }
    expect(field.rules.length).toBe(field.en.rules.length)
  })

  it('sezon evresi tarihe göre', () => {
    expect(seasonPhase(season, new Date('2026-08-01T00:00:00Z'))).toBe('yakinda')
    expect(seasonPhase(season, new Date('2026-10-19T12:00:00Z'))).toBe('acik')
    expect(seasonPhase(season, new Date('2027-03-01T00:00:00Z'))).toBe('bitti')
  })
})

describe('yarışma sezonları: puanlama', () => {
  it('örnek çözüm bütün alt görevleri yapar, cezasız bitirir; puan her seferinde aynı (belirlenimci)', () => {
    const a = runSeasonField(season, field.sample())
    expect(a.error).toBeNull()
    expect(a.finishMs).not.toBeNull()
    for (const s of season.subMissions) if (s.id !== 'zaman') expect(part(a, s.title), s.id).toBe(s.max)
    for (const p of season.penalties) expect(part(a, p.title), p.id).toBe(0)
    expect(a.score).toBeLessThanOrEqual(seasonMaxScore(season))
    for (let i = 0; i < 3; i++) expect(runSeasonField(season, field.sample())).toEqual(a)
  })

  it('boş program 0 puan, süre dolana kadar çalışır ama bitiş yok', () => {
    const r = runSeasonField(season, project('boş', [onStart()]))
    expect(r.score).toBe(0)
    expect(r.finishMs).toBeNull()
  })

  it('çarpma cezası her çarpma için -5; puan eksiye inmez', () => {
    const r = runSeasonField(season, project('duvar', [onStart(turn(90, 'right'), motors(100, 100))]))
    expect(part(r, 'Çarpma')).toBeLessThan(0)
    expect(Math.abs(part(r, 'Çarpma')) % 5).toBe(0)
    expect(r.score).toBe(0)
    expect(r.timeMs).toBe(field.timeLimitS * 1000)
  })

  it('yeşil alana girme bir kez -10', () => {
    // 15 cm doğu, sonra kuzeye 47 cm: merkez yeşil alan dairesinin ortasına gelir.
    const r = runSeasonField(season, project('park', [onStart(move(15), turn(90), move(47))]))
    expect(part(r, 'Yeşil alana girme')).toBe(-10)
  })

  it('kavşaktan kırmızı ışıkla geçmek -10, yeşille +10; ikisi aynı çalıştırmada ayrı ayrı sayılır', () => {
    const route = [b('rb_speed', { i: { P: 80 } }), move(65), turn(90), move(45), turn(90, 'right')]
    const red = runSeasonField(season, project('kırmızı', [onStart(...route, lights('kirmizi'), move(60))]))
    expect(part(red, 'Kırmızı ışıkta geçiş')).toBe(-10)
    expect(part(red, 'Yeşil dalga')).toBe(0)
    const green = runSeasonField(season, project('yeşil', [onStart(...route, lights('yesil'), move(60))]))
    expect(part(green, 'Kırmızı ışıkta geçiş')).toBe(0)
    expect(part(green, 'Yeşil dalga')).toBe(10)
  })

  it('yanlış teslimat küp başına -10', () => {
    const wrong = { ...season, field: { ...field, scene: () => {
      const s = field.scene()
      return { ...s, objects: [{ id: 'paket', x: 1.55, y: 0.9, color: 'sari' as const }, { id: 'atik', x: 0.9, y: 0.96, color: 'yesil' as const }] }
    } } }
    const r = runSeasonField(wrong, project('boş', [onStart()]))
    expect(part(r, 'Yanlış teslimat')).toBe(-20)
    expect(part(r, 'Kargo teslimatı')).toBe(0)
  })

  it('acil çağrı yalnız ilk 20 saniyede sayılır', () => {
    const late = runSeasonField(season, project('geç', [onStart(b('mk_pause', { i: { MS: 21000 } }), move(45))]))
    expect(part(late, 'Acil çağrı')).toBe(0)
    const early = runSeasonField(season, project('erken', [onStart(move(45))]))
    expect(part(early, 'Acil çağrı')).toBe(15)
  })
})

// Kariyer anketi: sorular ve ağırlıklar tutarlı, her hedef bir cevap birleşimiyle birinci çıkabilir, doğrulama zorunlu
// alanları ister, sunucu sonucu cevaplardan yeniden hesaplar, CSV kaçışları doğru; sayfa kayıtları.
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { STATIC_ITEMS } from './command-palette'
import { CAREERS } from './kariyer'
import { QUESTIONS, complete, rank, surveySchema, top3, weeklyHours, type Answers } from './kariyer-anket'
import { storeSurvey, surveysCsv, type SurveyRow } from './kariyer-anket-server'

const SLUGS = new Set(CAREERS.map((c) => c.slug))
const first = (): Answers => Object.fromEntries(QUESTIONS.map((q) => [q.id, q.opts[0].id]))
const valid = { name: 'Ayşe Yılmaz', email: 'Ayse@Example.com ', answers: first(), consentKvkk: true }

/** Bütün cevap birleşimleri (yaklaşık 300 bin). */
function* combos(i = 0, acc: Answers = {}): Generator<Answers> {
  if (i === QUESTIONS.length) { yield acc; return }
  for (const o of QUESTIONS[i].opts) yield* combos(i + 1, { ...acc, [QUESTIONS[i].id]: o.id })
}

describe('kariyer anketi verisi', () => {
  it('soru ve seçenek kimlikleri benzersiz, TR/EN dolu, ağırlıklar bilinen hedeflere', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length)
    for (const q of QUESTIONS) {
      expect(q.tr && q.en, q.id).toBeTruthy()
      expect(new Set(q.opts.map((o) => o.id)).size, q.id).toBe(q.opts.length)
      for (const o of q.opts) {
        expect(o.tr && o.en, `${q.id}.${o.id}`).toBeTruthy()
        for (const [s, w] of Object.entries(o.w)) { expect(SLUGS.has(s), `${q.id}.${o.id}: ${s}`).toBe(true); expect(w).toBeGreaterThan(0) }
      }
    }
  })
  it('her hedef en az bir cevap birleşiminde birinci çıkar', () => {
    const winners = new Set<string>()
    for (const a of combos()) { winners.add(rank(a)[0].slug); if (winners.size === SLUGS.size) break }
    expect([...winners].sort()).toEqual([...SLUGS].sort())
  })
  it('sıralama bütün hedefleri içerir, yüzdeler 0-100, azalan; ilk üç ayrı', () => {
    const r = rank(first())
    expect(r).toHaveLength(CAREERS.length)
    for (let i = 1; i < r.length; i++) expect(r[i - 1].pct).toBeGreaterThanOrEqual(r[i].pct)
    for (const m of r) { expect(m.pct).toBeGreaterThanOrEqual(0); expect(m.pct).toBeLessThanOrEqual(100) }
    expect(new Set(top3(first()).map((m) => m.slug)).size).toBe(3)
  })
  it('belirgin cevaplar beklenen hedefi öne çıkarır', () => {
    const drone: Answers = { an: 'drone', hafta: 'rc', ders: 'fizik', ekran: 'donanim', yer: 'savunma', sorun: 'tarla', matematik: 'severim', tarz: 'saha', saat: '6' }
    expect(top3(drone)[0].slug).toBe('drone-iha')
    const llm: Answers = { an: 'asistan', hafta: 'kod', ders: 'bilgisayar', ekran: 'ekran', yer: 'yazilim', sorun: 'asistan', matematik: 'uygulama', tarz: 'urun', saat: '12' }
    expect(top3(llm)[0].slug).toBe('yapay-zeka-uygulama')
    expect(weeklyHours(llm)).toBe(12)
  })
})

describe('kariyer anketi doğrulama', () => {
  it('geçerli gövdeyi kabul eder, e-postayı küçültür, iletişim izni varsayılan kapalı', () => {
    const r = surveySchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) { expect(r.data.email).toBe('ayse@example.com'); expect(r.data.consentContact).toBe(false); expect(complete(r.data.answers)).toBe(true) }
  })
  it('KVKK onayı, ad, geçerli e-posta ve bütün cevaplar zorunlu', () => {
    expect(surveySchema.safeParse({ ...valid, consentKvkk: false }).success).toBe(false)
    expect(surveySchema.safeParse({ ...valid, consentKvkk: undefined }).success).toBe(false)
    expect(surveySchema.safeParse({ ...valid, name: 'A' }).success).toBe(false)
    expect(surveySchema.safeParse({ ...valid, email: 'ayse' }).success).toBe(false)
    const { an: _, ...missing } = first()
    expect(surveySchema.safeParse({ ...valid, answers: missing }).success).toBe(false)
    expect(surveySchema.safeParse({ ...valid, answers: { ...first(), an: 'yok' } }).success).toBe(false)
  })
  it('bilinmeyen cevap anahtarları atılır', () => {
    const r = surveySchema.parse({ ...valid, answers: { ...first(), fazladan: 'x' } })
    expect(Object.keys(r.answers).sort()).toEqual(QUESTIONS.map((q) => q.id).sort())
  })
})

describe('kariyer anketi sunucu', () => {
  it('sonucu cevaplardan hesaplayıp kaydeder', async () => {
    let saved: Record<string, unknown> | null = null
    const db = { insert: () => ({ values: async (v: Record<string, unknown>) => { saved = v } }) } as never
    const input = surveySchema.parse({ ...valid, consentContact: true })
    const result = await storeSurvey(db, input, null)
    expect(result).toEqual(top3(input.answers))
    expect(saved).toMatchObject({ name: 'Ayşe Yılmaz', email: 'ayse@example.com', consentKvkk: true, consentContact: true, result, userId: null })
  })
  it('CSV: BOM, noktalı virgül, kaçış', () => {
    const row = { id: 'x', name: 'Ali; "Can"', email: 'a@b.co', answers: { an: 'drone' }, result: [{ slug: 'drone-iha', pct: 90 }], locale: 'tr', consentKvkk: true, consentContact: true, userId: null, createdAt: new Date('2026-10-23T10:00:00Z') } satisfies SurveyRow
    const csv = surveysCsv([row], (s) => (s === 'drone-iha' ? 'Drone / İHA mühendisi' : s))
    expect(csv.startsWith('﻿Tarih;Ad;E-posta')).toBe(true)
    expect(csv).toContain('"Ali; ""Can"""')
    expect(csv).toContain('Drone / İHA mühendisi (%90)')
    expect(csv).toContain(';evet;')
  })
})

describe('kariyer anketi kayıtları', () => {
  it('komut paleti ve site haritası', () => {
    expect(STATIC_ITEMS.map((i) => i.href)).toContain('/yol-haritasi/anket')
    expect(sitemap().some((u) => u.url.endsWith('/yol-haritasi/anket'))).toBe(true)
  })
})

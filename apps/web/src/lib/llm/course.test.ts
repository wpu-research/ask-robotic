// LLM dersi verisi: 10 ünite, iki dil eşit yapıda, simülasyon ve ilgili sayfa bağlantıları geçerli, API örnekleri kurala
// uygun (Anthropic SDK, claude-sonnet-5-5, anahtar ortam değişkeninden), bitirme teslimleri sıralı.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LLM_SIM_META } from '@/components/llm/sim-meta'
import { LESSONS } from '@/lib/ml/lessons'
import { API_MODEL, LLM_COURSE, UNITS } from './course'
import { CAPSTONE } from './project'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')
const APP = join(__dirname, '..', '..', 'app')
const routeExists = (href: string) => {
  const ml = /^\/makine-ogrenmesi\/(.+)$/.exec(href)
  if (ml) return LESSONS.some((l) => l.slug === ml[1])
  const mod = /^\/moduller\/(.+)$/.exec(href)
  if (mod) return existsSync(join(APP, 'moduller', '[slug]', 'page.tsx'))
  return existsSync(join(APP, ...href.split('/').filter(Boolean), 'page.tsx'))
}

describe('LLM üniteleri', () => {
  it('10 ünite, sıralı; her ünitede bir simülasyon; her simülasyon bir ünitede', () => {
    expect(UNITS.map((u) => u.n)).toEqual([...Array(10)].map((_, i) => i + 1))
    for (const u of UNITS) expect(u.sims.length, `ünite ${u.n}`).toBeGreaterThan(0)
    expect(new Set(UNITS.flatMap((u) => u.sims))).toEqual(new Set(Object.keys(LLM_SIM_META)))
  })
  it('TR ve EN aynı yapıda: hedef/kod/hata sayısı, HTML etiket dizisi, quiz cevapları', () => {
    for (const u of UNITS) {
      for (const l of ['tr', 'en'] as const) {
        const t = u[l]
        expect(t.title.length, `${u.n} ${l}`).toBeGreaterThan(10)
        expect(t.notes.length, `${u.n} ${l}`).toBeGreaterThan(1200)
        expect(t.lab.length, `${u.n} ${l}`).toBeGreaterThan(120)
        expect(t.lab, `${u.n} ${l}: görev düz metin`).not.toMatch(/<[a-z]/)
        expect(t.pitfalls.length, `${u.n} ${l}`).toBeGreaterThanOrEqual(4)
        expect(t.code.length, `${u.n} ${l}`).toBeGreaterThanOrEqual(2)
        expect(t.quiz, `${u.n} ${l}`).toHaveLength(4)
        for (const q of t.quiz) { expect(q.options).toHaveLength(4); expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4) }
        expect(t.notes + t.se + t.lab + t.summary, `${u.n} ${l}: uzun tire yok`).not.toContain('—')
      }
      expect(u.tr.goals.length, `ünite ${u.n}`).toBe(u.en.goals.length)
      expect(u.tr.pitfalls.length, `ünite ${u.n}`).toBe(u.en.pitfalls.length)
      expect(tags(u.tr.notes), `ünite ${u.n}`).toBe(tags(u.en.notes))
      expect(tags(u.tr.se), `ünite ${u.n}`).toBe(tags(u.en.se))
      expect(u.tr.quiz.map((q) => q.answer), `ünite ${u.n}`).toEqual(u.en.quiz.map((q) => q.answer))
      u.tr.code.forEach((c, i) => expect(c.src.split('\n').length, `ünite ${u.n} kod ${i}`).toBe(u.en.code[i].src.split('\n').length))
    }
  })
  it('quiz cevapları tek bir şıkta toplanmıyor', () => {
    const counts = [0, 0, 0, 0]
    for (const u of UNITS) for (const q of u.tr.quiz) counts[q.answer]++
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(6)
  })
  it('İngilizce metinlerde Türkçe karakter kalmadı (çeviri eksik değil)', () => {
    const trChars = /[çğıöşüÇĞİÖŞÜ]/
    for (const u of UNITS) {
      const en = [u.en.title, u.en.summary, ...u.en.goals, u.en.lab, ...u.en.pitfalls, ...u.en.quiz.flatMap((q) => [q.q, ...q.options, q.why])]
      for (const s of en) expect(trChars.test(s), `${u.n}: ${s}`).toBe(false)
    }
  })
  it('ilgili sayfalar var (AI atölyesi, modüller, ML dersleri)', () => {
    for (const u of UNITS) for (const r of u.related) expect(routeExists(r.href), `${u.n}: ${r.href}`).toBe(true)
    const all = new Set(UNITS.flatMap((u) => u.related.map((r) => r.href)))
    for (const h of ['/makine-ogrenmesi/kelime-vektorleri', '/makine-ogrenmesi/rag', '/makine-ogrenmesi/dikkat-mekanizmasi', '/makine-ogrenmesi/mini-dil-modeli', '/ai-atolyesi']) expect(all.has(h), h).toBe(true)
  })
  it('API örnekleri: Anthropic SDK, tek model kimliği, anahtar koda yazılmıyor', () => {
    const srcs = UNITS.flatMap((u) => [...u.tr.code, ...u.en.code].map((c) => c.src))
    const models = new Set(srcs.flatMap((s) => [...s.matchAll(/model[=:]\s*"([^"]+)"/g)].map((m) => m[1])))
    expect([...models]).toEqual([API_MODEL])
    expect(srcs.some((s) => s.includes('import anthropic'))).toBe(true)
    expect(srcs.some((s) => s.includes('@anthropic-ai/sdk'))).toBe(true)
    for (const s of srcs) {
      expect(s, 'gizli anahtar yok').not.toMatch(/sk-ant-|api_key\s*=\s*"|apiKey:\s*"/)
      expect(s, 'başka sağlayıcı yok').not.toMatch(/openai|gpt-4|gpt-5/i)
    }
  })
  it('ders künyesi: saat, kazanımlar TR/EN eşit, katılım belgesi', () => {
    expect(LLM_COURSE.hours).toBeGreaterThanOrEqual(30)
    expect(LLM_COURSE.tr.outcomes.length).toBe(LLM_COURSE.en.outcomes.length)
    expect(LLM_COURSE.tr.cert).toContain('Macademia katılım belgesi')
    expect(JSON.stringify(LLM_COURSE)).not.toMatch(/İBB|İSMEK|ISMEK/)
  })
})

describe('bitirme projesi', () => {
  it('gereksinim/mimari/test TR-EN eşit; teslimler ünitelere sıralı bağlı', () => {
    for (const k of ['requirements', 'architecture', 'tests'] as const) expect(CAPSTONE.tr[k].length, k).toBe(CAPSTONE.en[k].length)
    const after = CAPSTONE.deliverables.map((d) => d.afterUnit)
    expect(after).toEqual([...after].sort((a, b) => a - b))
    expect(after.at(-1)).toBe(10)
    expect(CAPSTONE.tr.title).toMatch(/soru-cevap asistanı/)
  })
})

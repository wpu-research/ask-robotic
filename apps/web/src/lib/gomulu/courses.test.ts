// Gömülü kurslar (Raspberry Pi, ARM STM32): ünite yapısı, TR/EN eşitliği, simülasyon/Hyvex/veri seti bağlantıları,
// bitirme teslimleri, komut arayüzü ve site kayıtları (menü, komut paleti, site haritası).
import { describe, expect, it } from 'vitest'
import { NAV } from '@/components/shell/nav-items'
import { STATIC_ITEMS } from '@/lib/command-palette'
import { datasetById } from '@/lib/ml/veri'
import { partBySlug } from '@/lib/muhendislik/catalog'
import { RPI_COURSE } from '@/lib/rpi/course'
import { command, newMotor } from '@/lib/stm32/cmd'
import { STM32_COURSE } from '@/lib/stm32/course'
import sitemap from '@/app/sitemap'
import type { CourseDef } from './types'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COURSES: Array<[string, CourseDef<any>, number]> = [['rpi', RPI_COURSE, 10], ['stm32', STM32_COURSE, 11]]

describe.each(COURSES)('%s kursu', (_k, c, count) => {
  it('üniteler sıralı; her ünitede simülasyon, kod, 4 soruluk quiz, en az 4 hata', () => {
    expect(c.units.map((u) => u.n)).toEqual([...Array(count)].map((_, i) => i + 1))
    for (const u of c.units) {
      expect(u.sims.length, `ünite ${u.n}`).toBeGreaterThan(0)
      for (const l of ['tr', 'en'] as const) {
        const t = u[l]
        expect(t.notes.length, `${u.n} ${l}`).toBeGreaterThan(800)
        expect(t.tryIt.length, `${u.n} ${l}`).toBeGreaterThan(80)
        expect(t.pitfalls.length, `${u.n} ${l}`).toBeGreaterThanOrEqual(4)
        expect(t.code.length, `${u.n} ${l}`).toBeGreaterThan(0)
        expect(t.quiz).toHaveLength(4)
        for (const q of t.quiz) { expect(q.options).toHaveLength(4); expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4) }
        expect(t.notes + t.se + t.tryIt, `${u.n} ${l}: uzun tire yok`).not.toContain('—')
      }
    }
  })
  it('TR ve EN aynı yapıda: HTML etiketleri, sayılar, quiz cevapları, kod satırları', () => {
    for (const u of c.units) {
      expect(tags(u.tr.notes), `ünite ${u.n}`).toBe(tags(u.en.notes))
      expect(tags(u.tr.se), `ünite ${u.n}`).toBe(tags(u.en.se))
      expect(u.tr.goals.length).toBe(u.en.goals.length)
      expect(u.tr.pitfalls.length).toBe(u.en.pitfalls.length)
      expect(u.tr.quiz.map((q) => q.answer), `ünite ${u.n}`).toEqual(u.en.quiz.map((q) => q.answer))
      u.tr.code.forEach((b, i) => { expect(b.src.split('\n').length, `ünite ${u.n} kod ${i}`).toBe(u.en.code[i].src.split('\n').length); expect(b.src.length).toBeGreaterThan(200) })
      if (u.wokwi) { expect(u.wokwi.tr.length).toBe(u.wokwi.en.length); expect(u.wokwi.url).toBe('https://wokwi.com') }
    }
  })
  it('İngilizce metinlerde Türkçe karakter yok', () => {
    const tr = /[çğıöşüÇĞİÖŞÜ]/
    for (const u of c.units) {
      const en = [u.en.title, u.en.summary, u.en.tryIt, ...u.en.goals, ...u.en.pitfalls, ...u.en.quiz.flatMap((q) => [q.q, ...q.options, q.why]), u.en.notes, u.en.se]
      for (const s of en) expect(tr.test(s), `${u.n}: ${s.slice(0, 80)}`).toBe(false)
    }
    const t = c.text.en
    for (const s of [t.title, t.lede, t.audience, t.duration, t.prereq, t.certificate, ...t.outcomes, ...t.tools]) expect(tr.test(s), s).toBe(false)
  })
  it('simülasyon, Hyvex ve veri seti bağlantıları geçerli; her simülasyon bir ünitede', () => {
    for (const u of c.units) {
      for (const s of u.sims) expect(c.sims[s], `${u.n}: ${s}`).toBeTruthy()
      for (const h of u.hyvex) expect(partBySlug(h), `${u.n}: ${h}`).toBeTruthy()
      for (const d of u.py?.datasets ?? []) expect(datasetById(d), d).toBeTruthy()
    }
    expect(new Set(c.units.flatMap((u) => u.sims))).toEqual(new Set(Object.keys(c.sims)))
  })
  it('künye: 16+, süre, sertifika "Macademia katılım belgesi"; İBB/İSMEK adı geçmez', () => {
    expect(c.text.tr.audience).toContain('16')
    expect(c.text.tr.certificate).toContain('Macademia katılım belgesi')
    expect(c.text.tr.outcomes.length).toBe(c.text.en.outcomes.length)
    expect(JSON.stringify(c)).not.toMatch(/İBB|IBB|İSMEK|ISMEK|Enstitü/)
  })
  it('bitirme projesi: TR/EN eşit, teslimler ünitelere sıralı, parçalar geçerli, başlangıç kodu iki dilde', () => {
    for (const k of ['requirements', 'architecture', 'tests', 'demo'] as const) expect(c.capstone.tr[k].length, k).toBe(c.capstone.en[k].length)
    const after = c.capstone.deliverables.map((d) => d.afterUnit)
    expect(after).toEqual([...after].sort((a, b) => a - b))
    expect(after.at(-1)).toBe(count)
    for (const s of c.capstone.hyvex) expect(partBySlug(s), s).toBeTruthy()
    expect(c.capstone.grading.tr.length).toBe(c.capstone.grading.en.length)
    c.starter('tr').forEach((b, i) => expect(b.src.split('\n').length).toBe(c.starter('en')[i].src.split('\n').length))
  })
  it('site kayıtları: menü, komut paleti, site haritası', () => {
    const href = `/muhendislik/${c.slug}`
    expect(NAV.find((g) => g.key === 'shell.groups.adults')?.items.some((i) => i.href === href)).toBe(true)
    expect(STATIC_ITEMS.some((p) => p.href === href)).toBe(true)
    const urls = sitemap().map((s) => s.url)
    expect(urls.some((u) => u.endsWith(`${href}/unite/${count}`))).toBe(true)
    expect(urls.some((u) => u.endsWith(`${href}/proje`))).toBe(true)
  })
})

describe('STM32 bitirme projesi komut arayüzü', () => {
  it('PWM, START, DIR kuralı, FREQ ve hatalar', () => {
    let s = newMotor()
    const run = (l: string) => { const r = command(s, l); s = r.state; return r.reply }
    expect(run('pwm 40')).toBe('OK PWM 40 CCR 0')
    expect(run('START')).toBe('OK START CCR 1680')
    expect(run('DIR R')).toBe('ERR stop before reversing')
    expect(run('STOP')).toBe('OK STOP')
    expect(run('DIR R')).toBe('OK DIR R')
    expect(run('FREQ 1000')).toBe('OK FREQ 1000 PSC 1 ARR 41999')
    expect(run('PWM 150')).toMatch(/^ERR/)
    expect(s.duty).toBe(40)
    expect(run('JUMP')).toBe('ERR unknown command JUMP')
    expect(s.faults).toBe(1)
    expect(run('PWM 1 2')).toBe('ERR too many arguments')
    expect(run('STATUS')).toBe('OK IDLE PWM 40 DIR R FREQ 1000')
  })
})

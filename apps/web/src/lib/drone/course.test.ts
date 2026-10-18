// Drone dersi verisi: 10 ünite, iki dil eşit yapıda, simülasyon/parça/Hyvex bağlantıları geçerli, bitirme teslimleri sıralı.
import { describe, expect, it } from 'vitest'
import { DRONE_SIM_META } from '@/components/drone/sim-meta'
import { SIM_META } from '@/components/robotik/sim-meta'
import { partBySlug } from '@/lib/muhendislik/catalog'
import { PROJECTS } from '@/lib/robotik/projects'
import { UNITS } from './course'
import { DRONE_PARTS, dronePartOf } from './parts'
import { CAPSTONE } from './project'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')

describe('drone üniteleri', () => {
  it('10 ünite, sıralı; her ünitede en az bir simülasyon', () => {
    expect(UNITS.map((u) => u.n)).toEqual([...Array(10)].map((_, i) => i + 1))
    for (const u of UNITS) expect(u.sims.length + (u.esofSims?.length ?? 0), `ünite ${u.n}`).toBeGreaterThan(0)
  })
  it('TR ve EN aynı yapıda: hedef/kod/hata sayısı, HTML etiket dizisi, quiz cevapları', () => {
    for (const u of UNITS) {
      for (const l of ['tr', 'en'] as const) {
        const t = u[l]
        expect(t.title.length, `${u.n} ${l}`).toBeGreaterThan(10)
        expect(t.notes.length, `${u.n} ${l}`).toBeGreaterThan(800)
        expect(t.lab.length, `${u.n} ${l}`).toBeGreaterThan(80)
        expect(t.pitfalls.length, `${u.n} ${l}`).toBeGreaterThanOrEqual(4)
        expect(t.code.length, `${u.n} ${l}`).toBeGreaterThan(0)
        expect(t.quiz, `${u.n} ${l}`).toHaveLength(4)
        for (const q of t.quiz) { expect(q.options).toHaveLength(4); expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4) }
        expect(t.notes + t.se + t.lab, `${u.n} ${l}: uzun tire yok`).not.toContain('—')
      }
      expect(u.tr.goals.length, `ünite ${u.n}`).toBe(u.en.goals.length)
      expect(u.tr.code.length, `ünite ${u.n}`).toBe(u.en.code.length)
      expect(u.tr.pitfalls.length, `ünite ${u.n}`).toBe(u.en.pitfalls.length)
      expect(tags(u.tr.notes), `ünite ${u.n}`).toBe(tags(u.en.notes))
      expect(tags(u.tr.se), `ünite ${u.n}`).toBe(tags(u.en.se))
      expect(u.tr.quiz.map((q) => q.answer), `ünite ${u.n}`).toEqual(u.en.quiz.map((q) => q.answer))
      // kod aynı, yalnız yorumlar çevrilir: satır sayısı eşit
      u.tr.code.forEach((c, i) => expect(c.src.split('\n').length, `ünite ${u.n} kod ${i}`).toBe(u.en.code[i].src.split('\n').length))
    }
  })
  it('İngilizce metinlerde Türkçe karakter kalmadı (çeviri eksik değil)', () => {
    const trChars = /[çğıöşüÇĞİÖŞÜ]/
    for (const u of UNITS) {
      const en = [u.en.title, u.en.summary, ...u.en.goals, u.en.lab, ...u.en.pitfalls, ...u.en.quiz.flatMap((q) => [q.q, ...q.options, q.why])]
      // Türkçe özel adlar (Türkiye, SHGM metinleri) hariç
      for (const s of en) expect(trChars.test(s.replace(/Türkiye/g, '')), `${u.n}: ${s}`).toBe(false)
    }
  })
  it('simülasyon, drone parçası ve ESOF simülasyonu bağlantıları geçerli; her drone simülasyonu bir ünitede', () => {
    for (const u of UNITS) {
      for (const s of u.sims) expect(DRONE_SIM_META[s], `${u.n}: ${s}`).toBeTruthy()
      for (const s of u.esofSims ?? []) expect(SIM_META[s], `${u.n}: ${s}`).toBeTruthy()
      for (const p of u.parts) expect(dronePartOf(p), `${u.n}: ${p}`).toBeTruthy()
    }
    expect(new Set(UNITS.flatMap((u) => u.sims))).toEqual(new Set(Object.keys(DRONE_SIM_META)))
  })
  it('üç ayak dersin bütününde var; her parça en az bir ünitede geçer', () => {
    expect(new Set(UNITS.flatMap((u) => u.pillars))).toEqual(new Set(['parca', 'sim', 'yazilim']))
    const used = new Set(UNITS.flatMap((u) => u.parts))
    for (const p of DRONE_PARTS) expect(used.has(p.key), p.key).toBe(true)
  })
})

describe('drone parçaları', () => {
  it('15 benzersiz parça; Hyvex bağlantıları geçerli; TR/EN eşit', () => {
    expect(DRONE_PARTS).toHaveLength(15)
    expect(new Set(DRONE_PARTS.map((p) => p.key)).size).toBe(15)
    for (const p of DRONE_PARTS) {
      for (const s of p.hyvex) expect(partBySlug(s), `${p.key}: ${s}`).toBeTruthy()
      if (p.sim) expect(DRONE_SIM_META[p.sim], p.key).toBeTruthy()
      expect(p.tr.specs.length, p.key).toBe(p.en.specs.length)
      for (const l of ['tr', 'en'] as const) { expect(p[l].body.length, `${p.key} ${l}`).toBeGreaterThan(200); expect(p[l].choose.length).toBeGreaterThan(40) }
    }
  })
  it('laboratuvar kiti olan drone parçaları bağlı (ESC, LiPo, IMU, barometre)', () => {
    const labs = new Set(DRONE_PARTS.flatMap((p) => p.hyvex).filter((s) => partBySlug(s)?.lab))
    for (const s of ['esc-blheli-s-32', 'bldc-fircasiz-motor', 'lipo-batarya', 'mpu6050', 'bme280']) expect(labs.has(s), s).toBe(true)
  })
})

describe('bitirme projesi', () => {
  it('gereksinim/mimari/test TR-EN eşit; teslimler ünitelere sıralı bağlı; ESOF drone koluyla eşleşir', () => {
    for (const k of ['requirements', 'architecture', 'tests'] as const) expect(CAPSTONE.tr[k].length, k).toBe(CAPSTONE.en[k].length)
    expect(CAPSTONE.deliverables.map((d) => d.afterUnit)).toEqual([3, 6, 8, 9, 10])
    for (const s of CAPSTONE.hyvex) expect(partBySlug(s), s).toBeTruthy()
    for (const p of CAPSTONE.parts) expect(dronePartOf(p), p).toBeTruthy()
    expect(PROJECTS.some((p) => p.slug === CAPSTONE.esofProject)).toBe(true)
  })
})

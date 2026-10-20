// Robot kolu dersi verisi: 10 ünite, iki dil eşit yapıda, simülasyon ve ilgili sayfa bağlantıları geçerli, ArmScript blokları
// yorumlayıcıdan geçiyor, ESOF 323 ön koşulu bağlı, markasız ad, bitirme teslimleri sıralı.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROBOT_SIM_META } from '@/components/robot-kolu/sim-meta'
import { SIM_META as ESOF_SIMS } from '@/components/robotik/sim-meta'
import { partBySlug } from '@/lib/muhendislik/catalog'
import { projectOf } from '@/lib/robotik/projects'
import weeks from '@/lib/robotik/weeks.json'
import { runProgram } from './armscript'
import { PREREQ, ROBOT_COURSE, UNITS } from './course'
import { CAPSTONE } from './project'
import { SAMPLE_IDS, SAMPLES, sampleCell, sampleSrc } from './samples'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')
const APP = join(__dirname, '..', '..', 'app')
const routeExists = (href: string) => {
  const wk = /^\/muhendislik\/robotik\/hafta\/(\d+)$/.exec(href)
  if (wk) return weeks.some((w) => w.n === Number(wk[1]))
  const pr = /^\/muhendislik\/robotik\/proje\/(.+)$/.exec(href)
  if (pr) return !!projectOf(pr[1])
  const pa = /^\/muhendislik\/parca\/(.+)$/.exec(href)
  if (pa) return !!partBySlug(pa[1])
  return existsSync(join(APP, ...href.split('/').filter(Boolean), 'page.tsx'))
}
/** Bu dosyadaki tüm kullanıcıya görünen metinler: markalı ad geçmemeli. */
const allText = () => JSON.stringify([UNITS, ROBOT_COURSE, CAPSTONE, ROBOT_SIM_META])

describe('Robot kolu üniteleri', () => {
  it('10 ünite, sıralı; her ünitede en az bir simülasyon; her simülasyon bir ünitede', () => {
    expect(UNITS.map((u) => u.n)).toEqual([...Array(10)].map((_, i) => i + 1))
    for (const u of UNITS) expect(u.sims.length, `ünite ${u.n}`).toBeGreaterThan(0)
    expect(new Set(UNITS.flatMap((u) => u.sims))).toEqual(new Set(Object.keys(ROBOT_SIM_META)))
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
      const en = [u.en.title, u.en.summary, ...u.en.goals, u.en.lab, ...u.en.pitfalls, ...u.en.quiz.flatMap((q) => [q.q, ...q.options, q.why]), ...u.related.map((r) => r.en)]
      for (const s of en) expect(trChars.test(s), `${u.n}: ${s}`).toBe(false)
      // ders notlarında da (kod blokları hariç tutulan HTML)
      expect(trChars.test(u.en.notes.replace(/<[^>]+>/g, '')), `${u.n}: notlar`).toBe(false)
      expect(trChars.test(u.en.se.replace(/<[^>]+>/g, '')), `${u.n}: se`).toBe(false)
    }
  })
  it('ilgili sayfalar ve ESOF 323 bağlantıları gerçek bir rotaya gidiyor', () => {
    for (const u of UNITS) for (const r of u.related) expect(routeExists(r.href), `${u.n}: ${r.href}`).toBe(true)
    const all = new Set(UNITS.flatMap((u) => u.related.map((r) => r.href)))
    expect(all.has(PREREQ.week)).toBe(true)
    expect(all.has(PREREQ.project)).toBe(true)
  })
  it('ESOF 323 ön koşulu: 7. hafta gerçekten manipülatör kinematiği ve "arm" simülasyonu; ünite 2 ve 3 aynı simülasyonu yeniden kullanır', () => {
    const w7 = weeks.find((w) => w.n === 7)!
    expect(w7.sims).toContain(PREREQ.sim)
    expect(w7.en.title).toMatch(/manipulator kinematics/i)
    expect(ESOF_SIMS[PREREQ.sim].en.title).toMatch(/arm/i)
    expect(UNITS.filter((u) => u.esofSims?.includes(PREREQ.sim)).map((u) => u.n)).toEqual([2, 3])
    expect(ROBOT_COURSE.tr.prereq).toContain('ESOF 323')
    expect(ROBOT_COURSE.en.prereq).toContain('ESOF 323')
  })
  it('ArmScript kod blokları yorumlayıcıdan geçer, hata örnekleri beklenen hatayı verir', () => {
    let n = 0
    for (const u of UNITS) for (const l of ['tr', 'en'] as const) for (const c of u[l].code) {
      if (!c.title.startsWith('ArmScript:')) continue
      n++
      const id = SAMPLE_IDS.find((s) => sampleSrc(s, l) === c.src)
      expect(id, `${u.n} ${l}: ${c.title} samples.ts'ten`).toBeDefined()
      const r = runProgram(c.src, { cell: sampleCell(id!) })
      const want = SAMPLES[id!].expect
      if (want === 'ok') expect(r.error, `${u.n} ${l} ${c.title}`).toBeUndefined()
      else expect(r.error?.code, `${u.n} ${l} ${c.title}`).toBe(want)
    }
    expect(n).toBeGreaterThanOrEqual(20)
  })
  it('Python blokları: yalnız standart kütüphane, gizli bilgi ve ağ yok', () => {
    for (const u of UNITS) for (const l of ['tr', 'en'] as const) for (const c of u[l].code) {
      if (!c.title.startsWith('Python:')) continue
      expect(c.src, c.title).not.toMatch(/import (numpy|scipy|requests|os|subprocess)|urllib|socket|open\(|eval\(|exec\(/)
    }
  })
  it('ders künyesi: saat, kazanımlar TR/EN eşit, katılım belgesi, resmî eğitim değil uyarısı', () => {
    expect(ROBOT_COURSE.hours).toBeGreaterThanOrEqual(30)
    expect(ROBOT_COURSE.tr.outcomes.length).toBe(ROBOT_COURSE.en.outcomes.length)
    expect(ROBOT_COURSE.tr.cert).toContain('Macademia katılım belgesi')
    expect(ROBOT_COURSE.tr.teaching).toMatch(/resmî .*eğitimi değildir/)
    expect(ROBOT_COURSE.en.teaching).toMatch(/not official manufacturer training/)
    expect(JSON.stringify(ROBOT_COURSE)).not.toMatch(/İBB|İSMEK|ISMEK/)
  })
})

describe('markasız ad ve içerik', () => {
  it('ders metinlerinde, kodunda ve rotalarında marka adı yok', () => {
    const txt = allText()
    for (const bad of [/KUKA/i, /\bKRL\b/i, /WorkVisual/i, /KUKA\.Sim/i, /\bFANUC\b/i, /\bABB\b/, /Yaskawa/i, /Universal Robots/i, /\bRAPID\b/, /\bKAREL\b/i]) expect(txt, String(bad)).not.toMatch(bad)
    const dir = join(__dirname)
    for (const f of ['armscript.ts', 'samples.ts', 'code.ts', 'cell.ts', 'kinematics.ts', 'motion.ts', 'planner.ts', 'units-a.ts', 'units-b.ts', 'project.ts']) {
      const src = readFileSync(join(dir, f), 'utf8')
      expect(src, f).not.toMatch(/KUKA|WorkVisual|\bKRL\b/i)
    }
    expect(ROBOT_COURSE.tr.title).toBe('Robot Kolu Mühendisliği')
    expect(ROBOT_COURSE.en.title).toBe('Robot Arm Engineering')
  })
  it('robot dili adı nötr (ArmScript) ve "resmî eğitim" izlenimi yok: üreticiyle uyumlu olduğu iddia edilmez', () => {
    const txt = allText()
    expect(txt).toContain('ArmScript')
    expect(txt).not.toMatch(/resmî\s+(KUKA|üretici)\s+eğitimi\s+(olarak|sunar)/i)
    expect(UNITS[5].tr.notes).toContain('hiçbir üreticinin robot dilinden alınmadı')
    expect(UNITS[5].en.notes).toContain('none is taken from any manufacturer')
  })
})

describe('bitirme projesi', () => {
  it('gereksinim/mimari/test TR-EN eşit; teslimler ünitelere sıralı bağlı', () => {
    for (const k of ['requirements', 'architecture', 'tests'] as const) expect(CAPSTONE.tr[k].length, k).toBe(CAPSTONE.en[k].length)
    const after = CAPSTONE.deliverables.map((d) => d.afterUnit)
    expect(after).toEqual([...after].sort((a, b) => a - b))
    expect(after.at(-1)).toBe(10)
    expect(CAPSTONE.tr.title).toMatch(/paletleme/)
    expect(CAPSTONE.tr.requirements.length).toBeGreaterThanOrEqual(5)
    expect(CAPSTONE.en.title + CAPSTONE.en.summary + CAPSTONE.en.scenario).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/)
  })
})

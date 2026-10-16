// ESOF 323 ders verisi: 14 hafta, iki dil eşit yapıda, donanım ve kit bağlantıları geçerli, simülasyon kimlikleri tanımlı.
import { describe, expect, it } from 'vitest'
import { SIM_META } from '@/components/robotik/sim-meta'
import { partBySlug } from '@/lib/muhendislik/catalog'
import { WEEKS } from './course'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')

describe('ESOF 323 haftaları', () => {
  it('14 hafta, sıralı; 8. hafta ara sınav', () => {
    expect(WEEKS.map((w) => w.n)).toEqual([...Array(14)].map((_, i) => i + 1))
    expect(WEEKS.filter((w) => w.exam).map((w) => w.n)).toEqual([8])
  })
  it('TR ve EN aynı yapıda: başlık, hedef sayısı, HTML etiket dizisi, kod sayısı', () => {
    for (const w of WEEKS) {
      for (const l of ['tr', 'en'] as const) {
        expect(w[l].title.length, `${w.n} ${l}`).toBeGreaterThan(3)
        expect(w[l].notes.length, `${w.n} ${l}`).toBeGreaterThan(400)
      }
      expect(w.tr.goals.length, `hafta ${w.n}`).toBe(w.en.goals.length)
      expect(w.tr.code.length, `hafta ${w.n}`).toBe(w.en.code.length)
      expect(tags(w.tr.notes), `hafta ${w.n}`).toBe(tags(w.en.notes))
      expect(!!w.tr.lab, `hafta ${w.n}`).toBe(!!w.en.lab)
    }
  })
  it('simülasyon, Hyvex parça ve kit bağlantıları geçerli', () => {
    for (const w of WEEKS) {
      for (const s of w.sims) expect(SIM_META[s], `${w.n}: ${s}`).toBeTruthy()
      for (const s of w.parts) expect(partBySlug(s), `${w.n}: ${s}`).toBeTruthy()
      for (const s of w.kits) expect(partBySlug(s)?.lab, `${w.n}: ${s} laboratuvarda açılmalı`).toBeTruthy()
    }
    // tüm ESOF simülasyonları en az bir haftada
    expect(new Set(WEEKS.flatMap((w) => w.sims))).toEqual(new Set(Object.keys(SIM_META)))
  })
  it('kart merdiveni: UNO, ESP32, STM32, Raspberry Pi ve Jetson derste geçer', () => {
    const all = new Set(WEEKS.flatMap((w) => w.parts))
    for (const s of ['arduino-uno-atmega328p', 'esp32-esp32-wroom-devkit', 'stm32', 'raspberry-pi-4b', 'jetson-orin-nano']) expect(all.has(s), s).toBe(true)
  })
})

// ---------------------------------------------------------------- derse özel laboratuvar kitleri
import { vi } from 'vitest'
import * as HEX from '../../../../../packages/sim/src/circuit/lab-fixtures-d'
import { analyze, createRuntime } from '@/lib/lab/runtime'
import { COURSE_KITS } from './kits'

describe('ESOF 323 laboratuvar kitleri', () => {
  vi.setConfig({ testTimeout: 120_000 })
  const hexOf = (s: string) => (HEX as Record<string, string>)[`${s.toUpperCase()}_HEX`]
  const lines = (s: string) => s.trim().split(/\r?\n/).filter(Boolean)
  it('statik uyarı yok', () => {
    for (const [k, kit] of Object.entries(COURSE_KITS)) {
      const w = analyze(kit.circuit()).warnings.filter((x) => x.kind !== 'floating-input' || x.partId !== 'uno')
      expect(w, k).toEqual([])
    }
  })
  it('çizgi izleyen: ikisi görür → düz, yalnız sol → sola (sol motor durur), hiçbiri → kayıp', () => {
    const lab = createRuntime(COURSE_KITS.cizgi.circuit(), hexOf('cizgi_izleyen'))
    lab.advance(300)
    expect(lines(lab.state.serial).at(-1)).toBe('duz')
    expect(lab.state.parts.ml.dcmotor!.speed).toBeGreaterThan(0.2)
    lab.setProp('irr', 'proximity', 0.1); lab.advance(300)
    expect(lines(lab.state.serial).at(-1)).toBe('sola')
    expect(lab.state.parts.ml.dcmotor!.speed).toBe(0)
    expect(lab.state.parts.mr.dcmotor!.speed).toBeGreaterThan(0.2)
    lab.setProp('irl', 'proximity', 0.1); lab.advance(300)
    expect(lines(lab.state.serial).at(-1)).toBe('kayip')
  })
  it('trafik ışığı: 4,5 sn sonra sarı yanar, potansiyometre gerilimi yazılır', () => {
    const lab = createRuntime(COURSE_KITS.trafik.circuit(), hexOf('trafik_fsm'))
    lab.advance(1000)
    expect(lab.state.parts.lg.led!.on).toBe(true)
    expect(lines(lab.state.serial).at(-1)).toBe('V=2.50')
    lab.advance(3500)
    expect(lab.state.parts.ly.led!.on).toBe(true)
    expect(lab.state.parts.lg.led!.on).toBe(false)
  })
  it('kesme: 3 tık → 6 sayım, 2 tık geri → 2', () => {
    const lab = createRuntime(COURSE_KITS.kesme.circuit(), hexOf('kesme_enkoder'))
    lab.advance(200)
    lab.setProp('enc', 'position', 3); lab.advance(600)
    expect(lines(lab.state.serial).at(-1)).toBe('tik=6')   // CHANGE: tık başına iki kenar
    lab.setProp('enc', 'position', 1); lab.advance(600)
    expect(lines(lab.state.serial).at(-1)).toBe('tik=2')
  })
})

// ---------------------------------------------------------------- dönem projeleri
import { PROJECTS, milestonesOfWeek } from './projects'

describe('ESOF 323 dönem projeleri', () => {
  it('üç kol; Hyvex listesi geçerli; TR/EN eşit; ara teslimler 8 → 14', () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual(['otonom-arac', 'drone-gorevi', 'robot-kol'])
    for (const p of PROJECTS) {
      for (const s of p.bom) expect(partBySlug(s), `${p.slug}: ${s}`).toBeTruthy()
      expect(p.tr.setup.length).toBe(p.en.setup.length)
      expect(p.tr.acceptance.length).toBe(p.en.acceptance.length)
      expect(p.milestones.map((m) => m.week)).toEqual([8, 9, 10, 11, 12, 13, 14])
      expect(p.starter.src.length).toBeGreaterThan(300)
    }
    expect(milestonesOfWeek(11)).toHaveLength(3)
    expect(milestonesOfWeek(3)).toHaveLength(0)
  })
})

describe('genişletilmiş içerik', () => {
  it('her haftada derinlemesine, hatalar, YM bağlantısı ve 4 soru; TR/EN cevapları aynı', () => {
    for (const w of WEEKS) {
      for (const l of ['tr', 'en'] as const) {
        expect(w[l].deep.length, `${w.n} ${l}`).toBeGreaterThan(800)
        expect(w[l].pitfalls.length, `${w.n} ${l}`).toBeGreaterThanOrEqual(4)
        expect(w[l].quiz, `${w.n} ${l}`).toHaveLength(4)
        for (const q of w[l].quiz) { expect(q.options).toHaveLength(4); expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4) }
        expect(w[l].deep + w[l].se, `${w.n} ${l}`).not.toContain('—')
      }
      expect(w.tr.quiz.map((q) => q.answer)).toEqual(w.en.quiz.map((q) => q.answer))
      expect(tags(w.tr.deep)).toBe(tags(w.en.deep))
    }
  })
})

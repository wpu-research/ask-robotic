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

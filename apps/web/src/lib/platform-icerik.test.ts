import { describe, expect, it } from 'vitest'
import { allComponents, allModules, type QuizQuestion } from '@ask/db'
import { PINS, PROPS } from './lab/contract'
import { ledVf, MODEL } from '../../../../packages/sim/src/circuit/model'
import { isCorrect } from './quiz'
import { LESSON_SKILLS, SKILL_IDS, SKILLS } from './skills'
import { guideBySlug, guideForPartType, parseLessonKey, searchGuides } from './parca-rehberi'

const modul3 = allModules.find((m) => m.slug === 'arduino-temelleri')!
const hafta1 = modul3.weeks[0]
const keyOf = (i: number) => `arduino-temelleri:1:${i + 1}`
const allQ: { q: QuizQuestion; lesson: number }[] = hafta1.lessons.flatMap((l, i) => (l.quiz ?? []).map((q) => ({ q, lesson: i })))
const find = (id: string) => allQ.find((x) => x.q.id === id)!.q

describe('pilot içerik: Modül 3 Hafta 1', () => {
  it('her derste anlatım, 3-6 kavram kartı ve 3-5 soruluk test var', () => {
    expect(hafta1.lessons).toHaveLength(5)
    for (const l of hafta1.lessons) {
      expect(l.explainerMd, l.title).toContain('### Bu derste öğreneceklerin')
      expect(l.explainerMd, l.title).toContain('### Önceden bilmen gerekenler')
      expect(l.explainerMd, l.title).toContain('### Özet')
      expect(l.concepts!.length, l.title).toBeGreaterThanOrEqual(3)
      expect(l.concepts!.length, l.title).toBeLessThanOrEqual(6)
      expect(l.quiz!.length, l.title).toBeGreaterThanOrEqual(3)
      expect(l.quiz!.length, l.title).toBeLessThanOrEqual(5)
    }
  })
  it('haftalık rehber tüm zorunlu bölümleri içerir', () => {
    for (const h of ['Hafta hedefleri', 'Haftanın planı', 'Ön koşul kontrolü', 'Kavram haritası', 'Sık yapılan hatalar', 'Hafta sonu tekrarı', 'Proje değerlendirme ölçütü', 'Veli ve öğretmen notu'])
      expect(hafta1.guideMd, h).toContain(`### ${h}`)
    // gün gün plan: beş ders de tabloda adıyla geçer
    for (const l of hafta1.lessons) expect(hafta1.guideMd, l.title).toContain(l.title)
  })
  it('soru kimlikleri benzersiz; beceriler tanımlı ve dersin beceri eşlemesinin içinde', () => {
    expect(new Set(allQ.map((x) => x.q.id)).size).toBe(allQ.length)
    for (const { q, lesson } of allQ) {
      expect(q.skills.length, q.id).toBeGreaterThan(0)
      for (const s of q.skills) {
        expect(SKILL_IDS.has(s), `${q.id}: ${s}`).toBe(true)
        expect(LESSON_SKILLS[keyOf(lesson)], `${q.id}: ${s}`).toContain(s)
      }
    }
  })
  it('soru biçimleri geçerli (seçenek sayısı, cevap aralığı, benzersiz seçenekler)', () => {
    for (const { q } of allQ) {
      expect(q.prompt.length, q.id).toBeGreaterThan(10)
      expect(q.explanation.length, q.id).toBeGreaterThan(20)
      if (q.kind === 'numeric') { expect(q.options, q.id).toBeUndefined(); expect(Number.isFinite(q.answer)).toBe(true) }
      else {
        expect(q.options!.length, q.id).toBeGreaterThanOrEqual(2)
        expect(new Set(q.options).size, q.id).toBe(q.options!.length)
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
        expect(q.answer, q.id).toBeLessThan(q.options!.length)
      }
    }
    // doğru cevap hep aynı seçenekte olmasın
    expect(new Set(allQ.filter((x) => x.q.kind !== 'numeric').map((x) => x.q.answer)).size).toBeGreaterThan(1)
  })
  it('sayısal cevaplar formülle doğrulanır', () => {
    const ma = (v: number) => v * 1000
    expect(isCorrect(find('m3h1d2-q1'), ma(5 / 1000))).toBe(true) // I = V/R, mA
    expect(isCorrect(find('m3h1d2-q2'), 5 / 0.01)).toBe(true) // R = V/I
    expect(isCorrect(find('m3h1d5-q1'), 5 + 5 + 2)).toBe(true)
    expect(isCorrect(find('m3h1d5-q3'), 5 * 1000)).toBe(true)
    expect(isCorrect(find('m3h1d5-q5'), ma((5 - 2) / 330))).toBe(true) // ≈ 9,09 mA
    expect(isCorrect(find('m3h1d3-q1'), 1000 + 1000)).toBe(true)
    expect(isCorrect(find('m3h1d3-q5'), (100 / (100 + 900)) * 100)).toBe(true)
    expect(isCorrect(find('m3h1d4-q4'), (4 + 2) * 200)).toBe(true)
    expect(isCorrect(find('m3h1d1-q5'), PINS.uno.filter((p) => /^D\d+$/.test(p)).length)).toBe(true)
    // for döngüleri: tur sayısı gerçekten çalıştırılarak
    let n = 0
    for (let pin = 10; pin <= 13; pin++) n++
    expect(isCorrect(find('m3h1d4-q2'), n)).toBe(true)
    let m = 0
    for (let i = 2; i >= 1; i--) m++
    expect(isCorrect(find('m3h1d4-q5'), m)).toBe(true)
    // dizi indeksi
    expect([13, 12, 11, 10][2]).toBe(Number(find('m3h1d4-q1').options![find('m3h1d4-q1').answer]))
  })
  it('Ohm yasası açıklaması laboratuvar modeliyle tutarlı (330 Ω: yaklaşık 8,6 mA)', () => {
    const i = (5 - ledVf('red')) / (330 + MODEL.pinOhms + MODEL.ledSeriesOhms)
    expect(i * 1000).toBeGreaterThan(8.5)
    expect(i * 1000).toBeLessThan(8.7)
    expect(hafta1.lessons[1].explainerMd).toContain('8,6 mA')
  })
})

describe('parça ansiklopedisi', () => {
  it('pilotta 6 parça var; slug ve parça türü benzersiz', () => {
    expect(allComponents.map((g) => g.slug).sort()).toEqual(['arduino-uno', 'buton', 'buzzer', 'direnc', 'led', 'potansiyometre'])
    expect(new Set(allComponents.map((g) => g.partType)).size).toBe(6)
  })
  it('pin adları laboratuvar sözleşmesiyle (contract.ts) birebir aynı', () => {
    for (const g of allComponents) {
      const pins = PINS[g.partType as keyof typeof PINS]
      expect(pins, g.slug).toBeDefined()
      expect(g.pins.map((p) => p.name), g.slug).toEqual([...pins])
      for (const p of g.pins) expect(p.description.length, `${g.slug}:${p.name}`).toBeGreaterThan(5)
    }
  })
  it('her maddede tüm bölümler dolu', () => {
    for (const g of allComponents) {
      for (const f of [g.summary, g.howItWorksMd, g.wiringMd, g.commonMistakesMd]) expect(f.length, g.slug).toBeGreaterThan(40)
      expect(g.typicalValues.length, g.slug).toBeGreaterThanOrEqual(3)
      expect(g.relatedLessons.length, g.slug).toBeGreaterThanOrEqual(2)
    }
  })
  it('ilgili ders anahtarları gerçek derslere çözülür', () => {
    for (const g of allComponents)
      for (const k of g.relatedLessons) {
        const p = parseLessonKey(k)!
        expect(p, `${g.slug}: ${k}`).not.toBeNull()
        const mod = allModules.find((m) => m.slug === p.moduleSlug)
        expect(mod?.weeks[p.week - 1]?.lessons[p.lesson - 1], `${g.slug}: ${k}`).toBeDefined()
      }
  })
  it('LED, direnç, pot ve buzzer değerleri model sabitleriyle uyumlu', () => {
    const led = guideBySlug('led')!
    const get = (l: string) => led.typicalValues.find((v) => v.label.startsWith(l))!.value
    const volts = (l: string) => Number(get(l).replace(' V', '').replace(',', '.'))
    expect(volts('Kırmızı LED Vf')).toBe(ledVf('red'))
    expect(volts('Sarı LED Vf')).toBe(ledVf('yellow'))
    expect(volts('Yeşil LED Vf')).toBe(ledVf('green'))
    expect(volts('Mavi ve beyaz LED Vf')).toBe(ledVf('blue'))
    expect(ledVf('blue')).toBe(ledVf('white'))
    expect(led.typicalValues.find((v) => v.label === 'Uyarı sınırı')!.value).toBe(`${MODEL.ledNoResistorA * 1000} mA`)
    expect(led.typicalValues.find((v) => v.label === 'Yanma sınırı')!.value).toBe(`${MODEL.ledBurnA * 1000} mA`)
    expect(PROPS.resistor[0].default).toBe(330)
    expect(PROPS.pot.find((p) => p.key === 'ohms')!.default).toBe(10_000)
    expect(PROPS.buzzer[0].default).toBe('passive')
    expect(MODEL.activeBuzzerHz).toBe(2000)
    expect(MODEL.buttonOnOhms).toBe(0.1)
    expect(MODEL.digitalThreshold).toBe(2.5)
    expect(guideBySlug('buzzer')!.typicalValues.some((v) => v.value.includes(String(MODEL.activeBuzzerHz)))).toBe(true)
  })
  it('arama Türkçe aksan ve büyük/küçük harf duyarsızdır', () => {
    expect(searchGuides(allComponents, 'DİRENÇ').map((g) => g.slug)).toContain('direnc')
    expect(searchGuides(allComponents, 'direnc')[0].slug).toBe('direnc')
    expect(searchGuides(allComponents, 'ses').map((g) => g.slug)).toContain('buzzer')
    expect(searchGuides(allComponents, 'xyzyok')).toHaveLength(0)
    expect(searchGuides(allComponents, '')).toHaveLength(allComponents.length)
  })
  it('parça türünden rehber bulunur (laboratuvardaki "Bu parça nedir?" bağlantısı)', () => {
    expect(guideForPartType('led')?.slug).toBe('led')
    expect(guideForPartType('pot')?.slug).toBe('potansiyometre')
    expect(guideForPartType('servo')).toBeUndefined()
  })
  it('beceri kimlikleri benzersiz', () => {
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(SKILLS.length)
  })
})

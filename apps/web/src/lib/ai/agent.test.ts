import { describe, expect, it } from 'vitest'
import { DEMO_SCRIPTED, calc, demoScript, runAgent } from './agent'

describe('hesap makinesi', () => {
  it('işlem önceliği ve parantez', () => {
    expect(calc('2+3*4')).toBe(14)
    expect(calc('(2+3)*4')).toBe(20)
    expect(calc('-3+10/4')).toBe(-0.5)
    expect(calc('7%4')).toBe(3)
    expect(calc('3<5')).toBe(1)
    expect(calc('5<=3')).toBe(0)
  })
  it('hata: sıfıra bölme, geçersiz ifade, kod enjeksiyonu yok', () => {
    expect(() => calc('1/0')).toThrow(/sıfıra/)
    expect(() => calc('2+')).toThrow()
    expect(() => calc('process.exit()')).toThrow()
    expect(() => calc('')).toThrow()
  })
})

describe('ajan döngüsü', () => {
  it('hesap: sonuçlar $1 ile taşınır', () => {
    const r = runAgent('hesapla(12*7)\nbitir($1)', 'hesap')
    expect(r.finalNumber).toBe(84)
    expect(r.steps.map((s) => s.tool)).toEqual(['hesapla', 'bitir'])
  })
  it('bilgi tabanı: bulunamayan arama hata gözlemi verir', () => {
    const r = runAgent('ara(yıldız sayısı)\nbitir(?)', 'bilgi')
    expect(r.steps[0]!.ok).toBe(false)
    expect(r.steps[0]!.observation).toBe('bulunamadı')
  })
  it('betikli demo doğru sonuca varır', () => {
    const r = runAgent(demoScript(), DEMO_SCRIPTED.world)
    expect(r.finalNumber).toBe(6)
    expect(r.error).toBeNull()
  })
  it('robot: mesafe, ilerleme ve durma', () => {
    const r = runAgent('mesafe()\nileri(30)\nmesafe()\ndur()\nbitir(tamam)', 'robot')
    expect(r.steps.map((s) => s.observation)).toEqual(['100', '70', '70', 'durdu', 'tamam'])
    expect(r.position).toBe(30)
    expect(r.stopped).toBe(true)
  })
  it('robot duvara çarpar ve ajan durur', () => {
    const r = runAgent('ileri(60)\nileri(60)\nbitir(x)', 'robot')
    expect(r.crashed).toBe(true)
    expect(r.error).toMatch(/çarptı/)
    expect(r.final).toBeNull()
  })
  it('tekrar ve eğer çalışır', () => {
    const r = runAgent('tekrar 3: ileri(20)\nmesafe()\neğer $son < 50: dur()\nbitir(ok)', 'robot')
    expect(r.position).toBe(60)
    expect(r.stopped).toBe(true)
    const r2 = runAgent('ileri(10)\neğer $son < 50: dur()\nbitir(ok)', 'robot')
    expect(r2.stopped).toBe(false)
  })
  it('durdurulan robot ilerleyemez', () => {
    const r = runAgent('dur()\nileri(10)', 'robot')
    expect(r.steps[1]!.ok).toBe(false)
  })
  it('adım sınırı sonsuz döngüyü keser', () => {
    const r = runAgent('tekrar 99: hesapla(1)\ntekrar 99: hesapla(1)', 'hesap')
    expect(r.limit).toBe(true)
    expect(r.steps.length).toBeLessThanOrEqual(30)
  })
  it('anlaşılmayan satır hata verir; yorumlar yok sayılır', () => {
    expect(runAgent('merhaba dünya', 'hesap').error).toMatch(/anlaşılamadı/)
    expect(runAgent('# yalnız yorum\nhesapla(1+1) # not\nbitir($1)', 'hesap').finalNumber).toBe(2)
  })
  it('bilinmeyen araç ve robotsuz dünyada robot aracı hata verir', () => {
    expect(runAgent('uç()', 'hesap').steps[0]!.observation).toMatch(/bilinmeyen/)
    expect(runAgent('mesafe()', 'hesap').steps[0]!.ok).toBe(false)
  })
})

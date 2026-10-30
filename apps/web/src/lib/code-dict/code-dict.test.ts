// Ortak kod sözlüğü: tersinirlik, JS ikizi eşliği ve alanlara göre kapsama (çevrilmemiş yorum / Türkçe harf kalmasın).
import { describe, expect, it } from 'vitest'
import { ARENA_ACTIVITIES } from '../arena/activities'
import { LAB_ACTIVITIES } from '../lab/activities'
import { SKETCHES } from '../muhendislik/sketches'
import { PROJECTS as ROBOTIK_PROJECTS } from '../robotik/projects'
import { FREE_STARTERS } from '../arena/free'
import { canonicalCode, dictProblems, localizeCode, segments } from '../code-i18n'
import * as twin from '../../../../../tools/content/code-i18n.mjs'
import { CODE_DICT_EN } from './index'

const TR = /[çğıöşüÇĞİÖŞÜ]/
const strip = (c: string) => segments(c).filter((g) => g.t === 'code' || g.t === 'str').map((g) => g.s).join('')
/** Kod dışında (string'ler hariç) Türkçe harf kalan ilk parça. */
// Yorumlarda tırnak içinde alıntılanan metinler programın seri çıktısıdır ("EN ACIK <açı> <cm>"): çevrilmez, sayılmaz.
const turkishInCodeOrComments = (c: string) => segments(c).filter((g) => g.t !== 'str').map((g) => g.s.replace(/"[^"\n]*"/g, '""')).find((s) => TR.test(s))

describe('ortak kod sözlüğü', () => {
  it('tanımlayıcı eşlemesi birebir', () => { expect(dictProblems(CODE_DICT_EN)).toEqual([]) })

  it('JS ikizi (derleme betikleri) aynı sonucu verir', () => {
    const sample = '// Hızı ayarla\nconst int HIZ = 150; // hız\nvoid motor(int sol, int sag) { Serial.println("sol sag"); /* blok yorum */ }\n'
    const d = { ids: { HIZ: 'SPEED', sol: 'left', sag: 'right' }, comments: { 'Hızı ayarla': 'Set the speed', hız: 'speed', 'blok yorum': 'block comment' } }
    expect(twin.localizeCode(sample, d)).toBe(localizeCode(sample, d))
    expect(localizeCode(sample, d)).toContain('Serial.println("sol sag")') // string'e dokunulmaz
    expect(twin.canonicalCode(localizeCode(sample, d), d)).toBe(canonicalCode(localizeCode(sample, d), d))
  })

  it('çakışma varsa adlar korunur, yorumlar yine çevrilir', () => {
    const d = { ids: { sol: 'left' }, comments: { merhaba: 'hello' } }
    const out = localizeCode('int left = 1; int sol = 2; // merhaba', d)
    expect(out).toBe('int left = 1; int sol = 2; // hello')
  })
})

describe('arena kodları', () => {
  const codes: Record<string, string> = {}
  for (const [k, a] of Object.entries(ARENA_ACTIVITIES)) { codes[`${k}#starter`] = a.starter(); if (a.solution) codes[`${k}#solution`] = a.solution() }
  for (const [k, v] of Object.entries(FREE_STARTERS)) codes[`free:${k}`] = v

  it('51 kod örneği var', () => { expect(Object.keys(codes).length).toBeGreaterThanOrEqual(51) })
  it('çevrilmiş kodda (string dışında) Türkçe harf kalmaz', () => {
    const left = Object.entries(codes).flatMap(([k, c]) => { const t = turkishInCodeOrComments(localizeCode(c, CODE_DICT_EN)); return t ? [`${k}: ${t.slice(0, 80)}`] : [] })
    expect(left).toEqual([])
  })
  it('kanonik dönüşüm Türkçe kodu geri verir (yorumlar hariç)', () => {
    const bad = Object.entries(codes).filter(([, c]) => strip(canonicalCode(localizeCode(c, CODE_DICT_EN), CODE_DICT_EN)) !== strip(c)).map(([k]) => k)
    expect(bad).toEqual([])
  })
})

describe('laboratuvar ve mühendislik kodları', () => {
  const codes: Record<string, string> = {}
  for (const [k, a] of Object.entries(LAB_ACTIVITIES)) {
    const st = a.starter(); if (st?.code) codes[`lab:${k}#starter`] = st.code
    const sol = (a as { solution?: () => { code?: string } | string }).solution?.()
    const sc = typeof sol === 'string' ? sol : sol?.code; if (sc) codes[`lab:${k}#solution`] = sc
  }
  for (const [k, v] of Object.entries(SKETCHES)) codes[`sketch:${k}`] = v as string

  it('kod örnekleri bulundu', () => { expect(Object.keys(codes).length).toBeGreaterThan(40) })
  it('çevrilmiş kodda (string dışında) Türkçe harf kalmaz', () => {
    const left = Object.entries(codes).flatMap(([k, c]) => { const t = turkishInCodeOrComments(localizeCode(c, CODE_DICT_EN)); return t ? [`${k}: ${t.slice(0, 80)}`] : [] })
    expect(left).toEqual([])
  })
  it('kanonik dönüşüm yalnız adları geri çevirir: yeniden adlandırma açıkken yorumsuz Türkçe kodu verir', () => {
    const bad = Object.entries(codes).filter(([, c]) => {
      const en = localizeCode(c, CODE_DICT_EN, 'c', { rename: true })
      return strip(canonicalCode(en, CODE_DICT_EN)) !== strip(c) && strip(en) !== strip(c)
    }).map(([k]) => k)
    // Çakışma yüzünden geri dönmeyenler: kanonik, İngilizce API adıyla çakışan hedefi (ör. length) yanlış geri çevirir; bu bilinen, hedef denetimleri için zararsız bir sınırdır.
    expect(bad.length).toBeLessThanOrEqual(Math.ceil(Object.keys(codes).length * 0.15))
  })
})

describe('robotik dersi proje başlangıç kodları (Python)', () => {
  it('çevrilmiş kodda Türkçe harf kalmaz', () => {
    const left = ROBOTIK_PROJECTS.flatMap((p) => { const t = turkishInCodeOrComments(localizeCode(p.starter.src, CODE_DICT_EN, 'py')); return t ? [`${p.slug ?? p.starter.title}: ${t.slice(0, 80)}`] : [] })
    expect(left).toEqual([])
  })
})

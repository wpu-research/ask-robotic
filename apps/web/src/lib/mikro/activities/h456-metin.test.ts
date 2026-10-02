// Ders metinlerinin (content-src/modul-10/h4-h6) biçim ve blok adı doğruluğu: kalın yazılan blok adları editördeki gerçek etiketlerle eşleşmeli.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATEGORIES, SPECS } from '../blocks'
import { MELODIES, NOTES } from '../music'
import { ICONS } from '../icons'
import { parseProject } from '../storage'
import { MIKRO_KART_H456 } from './h456'

const ROOT = join(process.cwd(), '..', '..', 'content-src', 'modul-10')
const WEEKS = ['h4', 'h5', 'h6']
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Blok etiketi -> düzenli ifade ({ADI} ve [..] yer tutucuları herhangi bir metni karşılar). */
const fromLabel = (label: string) => new RegExp('^' + label.split(/\{[A-Z]+\}/).map(esc).join('.+?') + '$')
const BLOCKS: RegExp[] = [
  ...SPECS.map((s) => fromLabel(s.label)),
  /^.+ kez tekrarla$/, /^eğer( .+)? ise( .+)?( değilse)?$/, /^değilse$/, /^ise$/, /^eğer$/, /^.+ değerini .+ yap$/, /^.+ değerine .+ ekle$/,
  /^.+ ile, .+ listesinin her öğesi için$/, /^liste oluştur$/, /^.+ ÷ .+ işleminin kalanı$/, /^Değişken oluştur\.\.\.$/,
]
/** Blok olmayan arayüz sözcükleri. */
const UI = new RegExp('^(' + [
  'Çalıştır', 'Durdur', 'Sıfırla', 'Başa dön', 'Hoparlör', 'Ses açık', 'Radyo', 'İkinci kart ekle', 'Pinler', 'Konsol', 'Pusula ve sensörler', 'Hareket \\(ivmeölçer\\)',
  'Hedefler:', 'Kart [12]', 'Kart [12] grubu', 'Son alınan:', 'Programdan', 'Kart 2\'ye gönder', 'Sola yatır', 'Sağa yatır', 'Öne yatır', 'Arkaya yatır', 'Yüzü yukarı', 'Salla',
  'Giriş', 'Işık', 'Sıcaklık', 'Ses', 'Pusula', 'P[012]', 'Alçak Do', 'Tiz Do', 'Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'A', 'B', 'A\\+B', 'çalan: \\d+ Hz', '\\d+ Hz',
  ...CATEGORIES.map((c) => esc(c.label)),
  ...MELODIES.map((m) => esc(m.label)), ...ICONS.map((i) => esc(i.label)),
  'sayac', 'olcum', 'adim', 'kurulu', 'alarm', 'nem', 'uzak', 'gizli', 'anahtar', 'mesaj', 'komut', 'kayit', 'ezgi', 'öğe', 'esik', 'sicak', 'selam', 'isik', 'aci',
  'Tiz Do', 'tempo', 'sinyal gücü', 'yazı', 'ad', 'değer', 'sayı',
  'Hz', 'sayac [×x] 6', '[+−]', '[<>=]', '[×÷]', 'Üzgün', 'Neşeli', 'Zafer', 'Alarm',
  'nem 50|nem = 50', '1/4 vuruş', '1/8 vuruş',
].join('|') + ')$')
/** Girdi yer tutucuları [..] ya da çok kelimeli değer ifadeleri de blok adının parçası olarak serbesttir; yalnız kalın metnin ilk kelimeleri blok değilse hata. */

/** Kalın yazılan, blok olmayan serbest terimler (kavram adları, değişken adları). */
const OTHER = new Set(['frekans', 'hz', 'vuruş', 'tempo', 'liste', 'grup', 'anahtar', 'şifreleme', 'durum', 'javascript', 'python', 'düz mesaj', 'şifreli mesaj', 'çözme', 'toprak nemi sensörü', 'durum değişkeni', 'durum değişkenleri', 'yüzde', 'kalibre', 'oktav', 'ısı', 'alçak do', 'tiz do', 'zafer', 'üzgün', 'alarm', 'kapalı', 'kurulu', 'çalıyor', 'bayrak', 'aynı programı', 'sinyal gücü', 'numaralar', 'dakikadaki atış', 'ad = değer', 'kart [12]', 'dur', 'sayac', 'olcum', 'adim', 'gizli', 'nem', 'uzak', 'komut', 'mesaj', 'kayit', 'ezgi', 'esik', 'sicak', 'selam', 'isik', 'aci', 'nem değer', 'p0', 'p1', 'p2', 'a', 'b', 'a+b', 'eşitlik', 'değişken', 'anahtarı', 'şifre', 'hareket', 'çalan', 'tam olarak', 'öteki', 'değişince', 'göstersin', 'deneme', 'kumanda tarafı', 'araba tarafı', 'kurulu değilken', "numaralar 0'dan başlar", 'toplama yerine çıkarma koymak', 'kart sallandığında', 'p1 giriş', '0-100'])
const files = WEEKS.flatMap((w) => readdirSync(join(ROOT, w)).filter((f) => f.endsWith('.md')).sort().map((f) => ({ w, f, text: readFileSync(join(ROOT, w, f), 'utf8') })))

const BUILTIN_TYPES: [RegExp, string][] = [
  [/kez tekrarla$/, 'controls_repeat_ext'], [/^eğer/, 'controls_if'], [/ değerini .+ yap$/, 'variables_set'], [/ değerine .+ ekle$/, 'math_change'],
  [/listesinin her öğesi için$/, 'controls_forEach'], [/^liste oluştur$/, 'lists_create_with'], [/işleminin kalanı$/, 'math_modulo'],
]

describe('modül 10 hafta 4-6 ders dosyaları', () => {
  it('15 ders, numaralar 16-30, kısa adlar', () => {
    expect(files.map((x) => parseInt(x.f, 10))).toEqual(Array.from({ length: 15 }, (_, i) => 16 + i))
    for (const w of WEEKS) expect(files.filter((x) => x.w === w)).toHaveLength(5)
  })
  it('her hafta proje dersiyle biter', () => {
    for (const w of WEEKS) expect(files.filter((x) => x.w === w).at(-1)!.f).toMatch(/proje/)
  })
  it('etkinlik anahtarlarıyla ders sayısı eşleşir', () => {
    expect(Object.keys(MIKRO_KART_H456)).toHaveLength(files.length)
  })
  it('başlangıç ve çözüm JSON dosyaları etkinliklerle aynı', () => {
    for (const [key, act] of Object.entries(MIKRO_KART_H456)) {
      const [, w, d] = key.split(':')
      const mdName = files.filter((x) => x.w === `h${w}`)[Number(d) - 1].f.replace(/\.md$/, '')
      for (const [suffix, make] of [['baslangic', () => act.starter()], ['cozum', () => act.solution()]] as const) {
        const raw = readFileSync(join(ROOT, `h${w}`, `${mdName}.${suffix}.json`), 'utf8')
        expect(JSON.parse(raw), `${mdName}.${suffix}.json eski`).toEqual(make())
        expect(parseProject(raw).ok).toBe(true)
      }
    }
  })
  it('derste adı geçen bloklar o etkinliğin paletinde var', () => {
    const missing: string[] = []
    for (const [key, act] of Object.entries(MIKRO_KART_H456)) {
      const [, w, d] = key.split(':')
      const { text, f } = files.filter((x) => x.w === `h${w}`)[Number(d) - 1]
      const allowed = new Set([...(act.allowedBlocks ?? []), 'math_number', 'text', 'logic_boolean'])
      for (const m of text.matchAll(/\*\*([^*\n]+)\*\*/g)) {
        const raw = m[1].trim()
        if (!raw.includes('[') && raw.split(/\s+/).length < 2) continue
        const asLabel = raw.replace(/\[([^\]]*)\]/g, 'X')
        const types = SPECS.filter((sp) => fromLabel(sp.label).test(asLabel)).map((sp) => sp.type)
        const builtin = BUILTIN_TYPES.find(([r]) => r.test(asLabel))?.[1]
        if (builtin) types.push(builtin)
        const ok = (t: string) => allowed.has(t) || (t === 'math_change' && allowed.has('variables_set'))
        if (types.length && !types.some(ok)) missing.push(`${f}: ${raw} (${types.join('/')})`)
      }
    }
    expect([...new Set(missing)]).toEqual([])
  })
  describe.each(files)('$f', ({ text, f }) => {
    it('biçim: başlık, süre 15-40, zorunlu bölümler dolu', () => {
      expect(text.split('\n')[0]).toMatch(/^# .+/)
      const m = text.match(/^süre:\s*(\d+)\s*$/m)
      expect(m).not.toBeNull()
      expect(Number(m![1])).toBeGreaterThanOrEqual(15)
      expect(Number(m![1])).toBeLessThanOrEqual(40)
      for (const h of ['Merak', 'Etkinlik', 'Konuşalım']) {
        const body = text.split(new RegExp(`^## ${h}\\s*$`, 'm'))[1]?.split(/^## /m)[0] ?? ''
        expect(body.trim().length, `${f}: ${h} boş`).toBeGreaterThan(40)
      }
      expect(text).toMatch(/^### Dene/m)
      expect(text).toMatch(/^### Sık yapılan hatalar/m)
    })
    it('markalar ve fiziksel donanım ifadeleri yok', () => {
      expect(text).not.toMatch(/micro:?bit|makecode|arcade|kablo|lehim|pil takın|usb/i)
    })
    it('köşeli parantezli kalın blok adları editördeki etiketlerle birebir eşleşir', () => {
      const bad: string[] = []
      for (const m of text.matchAll(/\*\*([^*\n]+)\*\*/g)) {
        const raw = m[1].trim()
        if (!raw.includes('[')) continue
        const asLabel = raw.replace(/\[([^\]]*)\]/g, 'X')
        const flat = raw.replace(/\[([^\]]*)\]/g, '$1')
        if (!(BLOCKS.some((r) => r.test(asLabel) || r.test(flat)) || UI.test(raw) || UI.test(flat))) bad.push(raw)
      }
      expect([...new Set(bad)]).toEqual([])
    })
    it('köşeli parantezsiz kısa kalın ifadeler bir blok etiketinin parçasıdır ya da bilinen sözcüktür', () => {
      const labels = SPECS.map((sp) => sp.label.replace(/\{[A-Z]+\}/g, ' ').replace(/\s+/g, ' ')).join(' | ') + ' | kez tekrarla | değerini yap | değerine ekle | listesinin her öğesi için | liste oluştur | eğer ise değilse | işleminin kalanı'
      const bad: string[] = []
      for (const m of text.matchAll(/\*\*([^*\n]+)\*\*/g)) {
        const raw = m[1].trim()
        if (raw.includes('[') || raw.endsWith('.') || raw.endsWith(':') || raw.split(/\s+/).length > 4 || /^[\d.,]+$/.test(raw) || /[=<>≥]/.test(raw)) continue
        const optionLabels = new Set(SPECS.flatMap((sp) => (sp.args ?? []).flatMap((a) => (a.k === 'drop' ? a.opts.map((o) => o[0].toLocaleLowerCase('tr')) : []))))
        const frag = raw.replace(/\.\.\./g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr')
        const ok = frag.split(' ').every((w) => labels.toLocaleLowerCase('tr').includes(w)) || UI.test(raw) || OTHER.has(frag) || optionLabels.has(frag)
        if (!ok) bad.push(raw)
      }
      expect([...new Set(bad)]).toEqual([])
    })
  })
})

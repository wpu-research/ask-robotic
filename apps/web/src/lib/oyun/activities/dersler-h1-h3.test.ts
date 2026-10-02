// Modül 11 (Oyun Atölyesi) hafta 1-3: ders metni ↔ etkinlik tutarlılığı ve etkinlik davranış testleri.
// JSON proje dosyalarını yeniden yazmak için: OYUN_YAZ=1 pnpm vitest run src/lib/oyun/activities/dersler-h1-h3.test.ts
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { disallowedBlocks, evaluateGoals } from '../activity'
import { BLOCKS } from '../blocks'
import { gameSignature, parseProject, exportProject, validateProject } from '../project'
import { OyunSession } from '../session'
import { ulasilabilir } from './ders-kit'
import { DERS_ETKINLIKLERI_H1_H3 as DERSLER } from './dersler-h1-h3'
import { MAGARA_ELMAS, MAGARA_SATIRLAR } from './d13-hazine-toplama'
import { OVA_SATIRLAR } from './d14-kamera-ve-dunya'
import { ADA_ANAHTAR, ADA_DUVARLAR, ADA_ELMAS, ADA_KAPI, ADA_SANDIK, ADA_SATIRLAR } from './d15-proje-hazine-adasi'
import { LABIRENT_SATIRLAR } from './d12-labirent'
import { BOS_ODA, DOLU_ODA } from './d11-ilk-harita'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../../../../../content-src/modul-11')
const HAFTA = (i: number) => `h${Math.floor(i / 5) + 1}`
const dersDosyalari = (): { file: string; path: string; n: number }[] =>
  [1, 2, 3].flatMap((h) => readdirSync(join(KOK, `h${h}`)).filter((f) => /^\d{2}-.+\.md$/.test(f)).sort().map((f) => ({ file: f, path: join(KOK, `h${h}`, f), n: parseInt(f, 10) })))

// ───────── Ders metni ─────────
const STD: { type: string; norm: string }[] = [
  { type: 'variables_set', norm: 'değişkenini yap' }, { type: 'math_change', norm: 'değişkenini kadar değiştir' }, { type: 'controls_if', norm: 'eğer ise' },
  { type: 'controls_repeat_ext', norm: 'kez tekrarla' }, { type: 'math_random_int', norm: 'ile arasında rastgele sayı' }, { type: 'text_join', norm: 'birleştir' },
]
const normalize = (x: string): string => x.replace(/\[[^\]]*\]/g, ' ').replace(/\{[A-Z0-9_]+\}/g, ' ').replace(/\s+/g, ' ').trim()
const KATALOG = [...BLOCKS.map((b) => ({ type: b.type, norm: normalize(b.msg) })), ...STD]

describe('ders metinleri (modul-11 h1-h3)', () => {
  const dosyalar = dersDosyalari()
  it('15 ders var, numaralar 01-15, haftada 5', () => {
    expect(dosyalar.map((d) => d.n)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))
  })
  it('module.json 6 hafta tanımlar ve h1-h3 beşer ders içerir', () => {
    const m = JSON.parse(readFileSync(join(KOK, 'module.json'), 'utf8'))
    expect(m).toMatchObject({ slug: 'oyun-atolyesi', title: 'Oyun Atölyesi', track: 'maker', position: 11, minAge: 8 })
    expect(m.weeks).toHaveLength(6)
    for (const w of m.weeks) expect(w.lessons).toBe(5)
  })
  for (const d of dosyalar) {
    describe(d.file, () => {
      const metin = readFileSync(d.path, 'utf8')
      const etkinlik = DERSLER[d.n - 1]
      it('biçim: başlık, süre 15-40, dolu Merak/Etkinlik/Konuşalım', () => {
        expect(metin.split('\n').find((l) => l.startsWith('# '))).toBeTruthy()
        const sure = Number(metin.match(/^süre:\s*(\d+)\s*$/m)?.[1])
        expect(sure).toBeGreaterThanOrEqual(15)
        expect(sure).toBeLessThanOrEqual(d.n % 5 === 0 ? 40 : 25)
        for (const k of ['Merak', 'Etkinlik', 'Konuşalım']) {
          const m = metin.match(new RegExp(`^## ${k}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))
          expect(m, k).toBeTruthy()
          expect(m![1].trim().length, k).toBeGreaterThan(40)
        }
        for (const k of ['### Nasıl çalışıyor?', '### Sık yapılan hatalar']) expect(metin, k).toContain(k)
        expect(metin.includes('### Dene') || metin.includes('### Kendi dokunuşunu kat')).toBe(true)
        expect(metin).toContain('Beklenen sonuç')
      })
      it('marka adı ve emoji yok', () => {
        expect(metin).not.toMatch(/micro:?bit|makecode|arcade|scratch/i)
        expect(metin).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
      })
      it('her `blok` gerçek bir blok adıdır ve etkinliğin araç kutusunda vardır', () => {
        const kodlar = [...metin.matchAll(/`([^`\n]+)`/g)].map((m) => m[1])
        expect(kodlar.length).toBeGreaterThan(3)
        const izinli = new Set([...etkinlik.allowedBlocks, 'oyun_resim', 'oyun_harita', 'math_number', 'text', 'variables_get', 'oyun_bu_sprite'])
        const sorunlar: string[] = []
        for (const k of kodlar) {
          const norm = normalize(k)
          if (!norm) continue // yalnız değer (ör. `[Elmaslar: ]`)
          const hit = KATALOG.filter((b) => b.norm === norm)
          if (!hit.length && /^[a-zçğıöşü0-9]+$/.test(k)) continue // değişken adı (ör. `kedi`)
          if (!hit.length) sorunlar.push(`bilinmeyen blok: ${k}`)
          else if (!hit.some((h) => izinli.has(h.type))) sorunlar.push(`etkinlikte izinli değil: ${k} (${hit.map((h) => h.type).join('/')})`)
        }
        expect(sorunlar).toEqual([])
      })
      it('etkinlik hedef sayısı metindeki sayıyla uyumlu (varsa)', () => {
        const sayi: Record<string, number> = { dört: 4, beş: 5, altı: 6, yedi: 7 }
        const m = metin.match(/(dört|beş|altı|yedi) (?:madde|hedef)/)
        if (m) expect(etkinlik.goals.length).toBe(sayi[m[1]])
      })
    })
  }
})

// ───────── Etkinlikler ─────────
describe('etkinlik sözleşmesi (modul-11 h1-h3)', () => {
  it('15 etkinlik, kimlikler benzersiz', () => {
    expect(DERSLER).toHaveLength(15)
    expect(new Set(DERSLER.map((a) => a.id)).size).toBe(15)
  })
  DERSLER.forEach((a, i) => {
    describe(a.id, () => {
      it('başlangıç çalışır (hata yok), hedeflerin hepsini sağlamaz; çözüm hepsini sağlar', () => {
        const s = evaluateGoals(a, a.starter()), c = evaluateGoals(a, a.solution())
        expect(s.error).toBeNull()
        expect(s.allPassed).toBe(false)
        expect(c.error).toBeNull()
        expect(c.results.filter((r) => !r.ok).map((r) => r.id)).toEqual([])
        expect(disallowedBlocks(a.solution(), a.allowedBlocks)).toEqual([])
        expect(HAFTA(i)).toMatch(/^h[123]$/)
      })
      it('başlangıç ve çözüm her çağrıda yeni, geçerli proje', () => {
        for (const f of [a.starter, a.solution]) {
          const x = f(), y = f()
          expect(x).not.toBe(y)
          expect(validateProject(JSON.parse(JSON.stringify(x)))).not.toBeNull()
          expect(gameSignature(x)).toBe(gameSignature(y))
        }
      })
      it('başlangıçta en az bir hedef zaten sağlanmıyor ve en az bir hedef çözümle yeşile dönüyor', () => {
        const s = evaluateGoals(a, a.starter())
        expect(s.results.some((r) => !r.ok)).toBe(true)
        expect(a.goals.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  it('d13: lav kediyi başlangıç karosuna geri gönderir ve tek dokunuşta bir can alır', () => {
    const s = new OyunSession(DERSLER[12].solution(), { seed: 1 })
    s.start(); s.tick(2)
    const k = s.first('oyuncu')
    s.engine.placeOnTile(k, 5, 2); s.tick(3)
    expect(s.engine.life).toBe(2)
    expect([k.x, k.y]).toEqual([24, 24])
  })
  it('d15: kapı anahtar alınana kadar kapalıdır (kahraman geçemez)', () => {
    const s = new OyunSession(DERSLER[14].solution(), { seed: 1 })
    s.start(); s.tick(2)
    const k = s.first('oyuncu')
    s.engine.placeOnTile(k, 8, ADA_KAPI[1]); s.tick(2)
    s.hold('right', 120)
    expect(k.x).toBeLessThan(10 * 16)
    s.engine.placeOnTile(k, ADA_ANAHTAR[0], ADA_ANAHTAR[1]); s.tick(3)
    expect(s.engine.countTiles('nesne-kapi')).toBe(0)
    s.engine.placeOnTile(k, 8, ADA_KAPI[1]); s.tick(2)
    s.hold('right', 120)
    expect(k.x).toBeGreaterThan(11 * 16)
  })
  it('d11: boş oda duvarsızdır, dolu oda kapalı bir odadır', () => {
    expect(BOS_ODA().cells.join('')).toMatch(/^\.+$/)
    const d = DOLU_ODA()
    expect(d.cols).toBe(10); expect(d.rows).toBe(7)
    expect(d.cells[0]).toBe('1'.repeat(10))
    expect(d.cells[6]).toBe('1'.repeat(10))
  })
})

// ───────── Haritalar ─────────
describe('haritalar (modul-11 h1-h3)', () => {
  const duzgun = (rows: readonly string[]) => rows.every((r) => r.length === rows[0].length)
  it('satır uzunlukları eşit', () => {
    for (const r of [LABIRENT_SATIRLAR, MAGARA_SATIRLAR, OVA_SATIRLAR, ADA_SATIRLAR]) expect(duzgun(r)).toBe(true)
    expect([OVA_SATIRLAR[0].length, OVA_SATIRLAR.length]).toEqual([30, 8])
  })
  it('labirentte başlangıçtan çıkışa yol var', () => {
    expect(ulasilabilir(LABIRENT_SATIRLAR, [1, 1], [10, 7], new Set(['#']))).toBe(true)
  })
  it('mağarada her elmasa lavdan geçmeden ulaşılır', () => {
    for (const e of MAGARA_ELMAS) expect(ulasilabilir(MAGARA_SATIRLAR, [1, 1], e, new Set(['#', 'L']))).toBe(true)
  })
  it('ovada kedinin yolu (4. satır) boş; elmalar ulaşılabilir', () => {
    expect(OVA_SATIRLAR[4].slice(1, 29)).toMatch(/^[.a]+$/)
    expect(ulasilabilir(OVA_SATIRLAR, [1, 4], [26, 4], new Set(['#', 'T']))).toBe(true)
  })
  it('adada: kapı kapalıyken sandığa yol yok; kapı açılınca (anahtar → kapı → sandık) yol var; anahtar ve elmaslar lavsız ulaşılır', () => {
    const kapali = new Set([...ADA_DUVARLAR, 'L'])
    expect(ulasilabilir(ADA_SATIRLAR, [1, 1], ADA_SANDIK, kapali)).toBe(false)
    expect(ulasilabilir(ADA_SATIRLAR, [1, 1], ADA_ANAHTAR, kapali)).toBe(true)
    expect(ulasilabilir(ADA_SATIRLAR, [1, 1], ADA_SANDIK, new Set(['#', 'W', 'L']))).toBe(true)
    for (const e of ADA_ELMAS) expect(ulasilabilir(ADA_SATIRLAR, [1, 1], e, new Set(['#', 'D', 'W', 'L'])) || ulasilabilir(ADA_SATIRLAR, [1, 1], e, new Set(['#', 'W', 'L']))).toBe(true)
  })
})

// ───────── JSON proje dosyaları ─────────
describe('proje dosyaları (content-src/modul-11/hN/projeler)', () => {
  const yaz = process.env.OYUN_YAZ === '1'
  dersDosyalari().forEach((d) => {
    const a = DERSLER[d.n - 1]
    const ad = d.file.replace(/\.md$/, '')
    const klasor = join(KOK, `h${Math.floor((d.n - 1) / 5) + 1}`, 'projeler')
    for (const [soyad, f] of [['baslangic', a.starter], ['cozum', a.solution]] as const) {
      it(`${ad}.${soyad}.json etkinlikle aynı`, () => {
        const yol = join(klasor, `${ad}.${soyad}.json`)
        if (yaz) { mkdirSync(klasor, { recursive: true }); writeFileSync(yol, exportProject(f()) + '\n') }
        expect(existsSync(yol), yol).toBe(true)
        const p = parseProject(readFileSync(yol, 'utf8'))
        expect(p).not.toBeNull()
        expect(gameSignature(p!)).toBe(gameSignature(f()))
        const ev = evaluateGoals(a, p!)
        expect(ev.error).toBeNull()
        expect(ev.allPassed).toBe(soyad === 'cozum')
      })
    }
  })
})

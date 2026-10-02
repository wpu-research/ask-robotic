import { describe, expect, it } from 'vitest'
import { allModules, type QuizQuestion } from '@ask/db'
import { LESSON_SKILLS, SKILL_IDS } from './skills'
import { validateConcepts, validateQuiz } from '../../../../tools/content/ek.mjs'
import { simulate } from './jr/analysis'
import { scriptIsRunnable } from './jr/ops'
import { block, emptyProject, script } from './jr/starters'
import { MODUL1_ACTIVITIES } from './jr/activities/modul1'
import { STEP_UNITS } from './jr/types'
import type { Block, BlockType, Project } from './jr/types'
import { isCorrect } from './quiz'

const modul = allModules.find((m) => m.slug === 'scratchjr')!
const allQ: { q: QuizQuestion; w: number; l: number }[] = modul.weeks.flatMap((wk, w) =>
  wk.lessons.flatMap((ls, l) => (ls.quiz ?? []).map((q) => ({ q, w: w + 1, l: l + 1 }))),
)
const find = (id: string) => allQ.find((x) => x.q.id === id)!.q
const sk = (...ids: string[]) => ids

// Blok kısayolları (betik oluşturmak için)
const B = (type: BlockType, value?: number, children?: Block[], text?: string): Block =>
  block(type, { ...(value !== undefined ? { value } : {}), ...(text !== undefined ? { text } : {}), ...(children ? { children } : {}) })

/** Tek karakterli, verilen betiklerle proje. Karakter sahnenin solunda (x=120) başlar. */
function proje(character: string, ...scripts: ReturnType<typeof script>[]): Project {
  const p = emptyProject(character, 'plain')
  p.pages[0].sprites[0].x = 120
  p.pages[0].sprites[0].y = 180
  p.pages[0].sprites[0].scripts = scripts
  return p
}
const run = (p: Project, ms = 30000) => simulate(p, { press: 'flag', ms })
const son = (p: Project, ms = 30000) => run(p, ms).snapshot.sprites[0]

describe('Modül 1 platform katmanı: yapı', () => {
  it('5 hafta, her hafta 2 ders; her derste anlatım, 3-6 kavram, 3-5 soru', () => {
    expect(modul.weeks).toHaveLength(5)
    for (const wk of modul.weeks) {
      expect(wk.lessons).toHaveLength(2)
      for (const l of wk.lessons) {
        expect(l.explainerMd, l.title).toBeTruthy()
        expect(l.concepts!.length, l.title).toBeGreaterThanOrEqual(3)
        expect(l.concepts!.length, l.title).toBeLessThanOrEqual(6)
        expect(l.quiz!.length, l.title).toBeGreaterThanOrEqual(3)
        expect(l.quiz!.length, l.title).toBeLessThanOrEqual(5)
      }
    }
    expect(allQ.length).toBeGreaterThanOrEqual(30)
  })

  it('anlatım kısa (120-250 sözcük), üç zorunlu başlık ve Birlikte konuşun var; ekransız etkinlik önerilmez', () => {
    for (const l of modul.weeks.flatMap((w) => w.lessons)) {
      const md = l.explainerMd!
      const words = md.replace(/[#*`\-]/g, ' ').split(/\s+/).filter(Boolean).length
      expect(words, `${l.title}: ${words} sözcük`).toBeGreaterThanOrEqual(120)
      expect(words, `${l.title}: ${words} sözcük`).toBeLessThanOrEqual(250)
      for (const h of ['Bu derste öğreneceklerin', 'Önceden bilmen gerekenler', 'Birlikte konuşun', 'Özet']) expect(md, `${l.title}: ${h}`).toContain(`### ${h}`)
      expect(md).not.toMatch(/\/\/ sketch:/)
    }
  })

  it('kavram kartları ve sorular ek.mjs doğrulayıcılarından geçer (becerilerle birlikte)', () => {
    for (const l of modul.weeks.flatMap((w) => w.lessons)) {
      expect(() => validateConcepts(l.concepts, l.title)).not.toThrow()
      expect(() => validateQuiz(l.quiz, l.title, SKILL_IDS)).not.toThrow()
    }
  })

  it('soru kimlikleri m1h<hafta>d<ders>-q<n> biçiminde ve benzersiz', () => {
    expect(new Set(allQ.map((x) => x.q.id)).size).toBe(allQ.length)
    for (const { q, w, l } of allQ) expect(q.id).toMatch(new RegExp(`^m1h${w}d${l}-q\\d+$`))
  })

  it('okuma yükü düşük: seçmeli sorularda en çok 3 seçenek; doğru cevap hep aynı yerde değil', () => {
    for (const { q } of allQ) {
      if (q.kind !== 'numeric') expect(q.options!.length, q.id).toBeLessThanOrEqual(3)
      expect(q.explanation.length, q.id).toBeGreaterThan(20)
    }
    const pos = allQ.filter((x) => x.q.kind !== 'numeric').map((x) => x.q.answer)
    expect(new Set(pos).size).toBeGreaterThan(1)
  })

  it('her derste kavram sorusu ve (sayı ya da hata ayıklama) sorusu var', () => {
    for (const l of modul.weeks.flatMap((w) => w.lessons)) {
      const kinds = new Set(l.quiz!.map((q) => q.kind))
      expect(kinds.has('mcq') || kinds.has('predict-output'), l.title).toBe(true)
      expect(kinds.has('numeric') || kinds.has('find-bug') || kinds.has('predict-output'), l.title).toBe(true)
    }
  })

  it('beceriler tanımlı ve dersin beceri eşlemesinin içinde', () => {
    for (const { q, w, l } of allQ) {
      expect(q.skills.length, q.id).toBeGreaterThan(0)
      for (const s of q.skills) {
        expect(SKILL_IDS.has(s), `${q.id}: ${s}`).toBe(true)
        expect(LESSON_SKILLS[`scratchjr:${w}:${l}`], `${q.id}: ${s}`).toContain(s)
      }
    }
  })

  it('her haftanın rehberi sekiz bölümü içerir ve iki dersin adı planda geçer', () => {
    for (const wk of modul.weeks) {
      for (const h of ['Hafta hedefleri', 'Haftanın planı', 'Ön koşul kontrolü', 'Kavram haritası', 'Sık yapılan hatalar', 'Hafta sonu tekrarı', 'Proje değerlendirme ölçütü', 'Veli ve öğretmen notu'])
        expect(wk.guideMd, `${wk.title}: ${h}`).toContain(`### ${h}`)
      for (const l of wk.lessons) expect(wk.guideMd, l.title).toContain(l.title)
    }
  })

  it('her ders için etkinlik tanımı var (anahtar eşlemesi bozulmamış)', () => {
    for (let w = 1; w <= 5; w++) for (let l = 1; l <= 2; l++) expect(MODUL1_ACTIVITIES[`scratchjr:${w}:${l}`], `${w}:${l}`).toBeTruthy()
  })
})

describe('Modül 1 cevapları motorla doğrulanır', () => {
  it('1.1 robot: 7 + 6 = 13 adım; Sağa dön sonrası aşağı yürür; yıldıza varır', () => {
    const p = MODUL1_ACTIVITIES['scratchjr:1:1'].solution!()
    const robot = () => p.pages[0].sprites.find((s) => s.character === 'robot')!
    const start = { x: robot().x, y: robot().y }
    const end = simulate(p, { press: 'flag', ms: 20000 }).snapshot.sprites.find((s) => s.character === 'robot')!
    const star = p.pages[0].sprites.find((s) => s.character === 'star')!
    expect(Math.hypot(end.x - star.x, end.y - star.y)).toBeLessThanOrEqual(36)
    expect(end.y).toBeGreaterThan(start.y) // aşağı
    expect(isCorrect(find('m1h1d1-q4'), 7 + 6)).toBe(true)
    expect(find('m1h1d1-q2').options![find('m1h1d1-q2').answer]).toContain('Aşağı')
    // yürüme yolu: önce 7 adım sağa, sonra 6 adım aşağı
    expect(end.x - start.x).toBeCloseTo(7 * STEP_UNITS, 3)
    expect(end.y - start.y).toBeCloseTo(6 * STEP_UNITS, 3)
    // q3: B betiği (önce dön) robotu sağa hiç götürmez
    const b = proje('robot', script(B('flag'), B('turnRight', 90), B('forward', 7), B('forward', 6)))
    expect(son(b).x).toBeCloseTo(120, 3)
    expect(find('m1h1d1-q3').options![find('m1h1d1-q3').answer]).toBe('B hatalı')
  })

  it('1.2 kedi: 3+3+3 = 9 adım; İleri 3 sonra Geri 3 başa döner; bayraksız betik çalışmaz', () => {
    const p = proje('cat', script(B('flag'), B('forward', 3), B('forward', 3), B('forward', 3)))
    expect(son(p).x - 120).toBeCloseTo(9 * STEP_UNITS, 3)
    expect(isCorrect(find('m1h1d2-q2'), 9)).toBe(true)
    const geri = proje('cat', script(B('flag'), B('forward', 3), B('back', 3)))
    expect(son(geri).x).toBeCloseTo(120, 3)
    expect(find('m1h1d2-q3').answer).toBe(0)
    const bayraksiz = proje('cat', script(B('forward', 3), B('forward', 3), B('forward', 3)))
    expect(scriptIsRunnable(bayraksiz.pages[0].sprites[0].scripts[0])).toBe(false)
    expect(son(bayraksiz).x).toBeCloseTo(120, 3)
    expect(find('m1h1d2-q4').options![find('m1h1d2-q4').answer]).toContain('Yeşil bayrak yok')
  })

  it('2.1 tekrar: Tekrarla 4 { Zıpla } = 4 zıplama; Tekrarla 3 { İleri 2 } = 6 adım; Zıpla dışarıdaysa 1 kez', () => {
    const hop4 = run(proje('cat', script(B('flag'), B('repeat', 4, [B('hop', 1)]))))
    expect(hop4.events.filter((e) => e.kind === 'hop')).toHaveLength(4)
    expect(isCorrect(find('m1h2d1-q2'), 4)).toBe(true)
    const walk6 = proje('cat', script(B('flag'), B('repeat', 3, [B('forward', 2)])))
    expect(son(walk6).x - 120).toBeCloseTo(6 * STEP_UNITS, 3)
    expect(find('m1h2d1-q3').options![find('m1h2d1-q3').answer]).toBe('6 adım')
    const dis = run(proje('cat', script(B('flag'), B('repeat', 4, [B('forward', 1)]), B('hop', 1))))
    expect(dis.events.filter((e) => e.kind === 'hop')).toHaveLength(1)
    expect(find('m1h2d1-q4').options![find('m1h2d1-q4').answer]).toContain('dışında')
  })

  it('2.2 dans: Büyü iki kez (Tekrarla 2); Tekrarla 5 { İleri 2 } = 10 adım; Sonsuza kadar Dur olmadan sürer', () => {
    const grow = son(proje('cat', script(B('flag'), B('repeat', 2, [B('hop', 1), B('grow')]))))
    expect(grow.scale).toBeCloseTo(1.25 * 1.25, 3) // iki kez büyüdü
    expect(find('m1h2d2-q4').options![find('m1h2d2-q4').answer]).toBe('2 kez')
    const yurume = proje('cat', script(B('flag'), B('repeat', 5, [B('forward', 2)])))
    expect(son(yurume).x - 120).toBeCloseTo(10 * STEP_UNITS, 3)
    expect(isCorrect(find('m1h2d2-q5'), 10)).toBe(true)
    // Sonsuza kadar uzun sürede bile hâlâ zıplıyor; ardından blok eklenemeyen (terminal) blok
    const sonsuz = run(proje('cat', script(B('flag'), B('forever', undefined, [B('hop', 1)]))), 20000)
    expect(sonsuz.events.filter((e) => e.kind === 'hop').length).toBeGreaterThan(20)
    expect(find('m1h2d2-q3').options![find('m1h2d2-q3').answer]).toContain('hiç bitmez')
  })

  it('3.1 olay: betiği olmayan karakter bir şey yapmaz; bayraklı betik dokununca çalışmaz; söyle-bekle-söyle sırası', () => {
    const bos = proje('cat')
    expect(run(bos).events).toHaveLength(0)
    const p = proje('cat', script(B('flag'), B('hop', 1)))
    const id = p.pages[0].sprites[0].id
    expect(simulate(p, { press: { tap: id }, ms: 5000 }).events.filter((e) => e.kind === 'hop')).toHaveLength(0)
    expect(find('m1h3d1-q4').options![find('m1h3d1-q4').answer]).toContain('Dokununca')
    const ev = proje('house', script(B('tap'), B('say', undefined, undefined, 'Kim o?'), B('wait', 1), B('say', undefined, undefined, 'Gir!')))
    const evId = ev.pages[0].sprites[0].id
    const says = simulate(ev, { press: { tap: evId }, ms: 10000 }).events.filter((e) => e.kind === 'say')
    expect(says.map((e) => (e.kind === 'say' ? e.text : ''))).toEqual(['Kim o?', 'Gir!'])
    expect(find('m1h3d1-q3').answer).toBe(0)
  })

  it('3.2 konuşan hayvan: betik yalnız kendi karakterinde; iki Söyle = 2 cümle; Başlat gerekmez', () => {
    const p = proje('dog', script(B('tap'), B('say', undefined, undefined, 'Merhaba!'), B('wait', 1), B('say', undefined, undefined, 'Oynar mısın?')))
    p.pages[0].sprites.push({ id: 'ball1', character: 'ball', x: 300, y: 200, scripts: [] })
    const dogId = p.pages[0].sprites[0].id
    const dogTap = simulate(p, { press: { tap: dogId }, ms: 10000 }).events
    expect(dogTap.filter((e) => e.kind === 'say')).toHaveLength(2)
    expect(isCorrect(find('m1h3d2-q3'), 2)).toBe(true)
    const topTap = simulate(p, { press: { tap: 'ball1' }, ms: 10000 }).events
    expect(topTap.filter((e) => e.kind === 'say')).toHaveLength(0)
    expect(find('m1h3d2-q1').options![find('m1h3d2-q1').answer]).toBe('Köpeğe dokununca')
    // Başlat'a (Yeşil bayrak) basınca Dokununca betiği çalışmaz
    expect(run(p).events.filter((e) => e.kind === 'say')).toHaveLength(0)
  })

  it('4.1 sayfalar: 1 sayfa + 2 ekleme = 3; 2 + 2 = 4', () => {
    expect(isCorrect(find('m1h4d1-q2'), 1 + 2)).toBe(true)
    expect(isCorrect(find('m1h4d2-q5'), 2 + 2)).toBe(true)
  })

  it('4.2 hikâye: Sayfaya git 2 ikinci sayfaya geçer ve oradaki bayraklı betik çalışır; bayraksız betik çalışmaz', () => {
    const p = MODUL1_ACTIVITIES['scratchjr:4:2'].solution!()
    const events = simulate(p, { press: 'flag', ms: 15000 }).events
    const sayIdx = events.findIndex((e) => e.kind === 'say')
    const pageIdx = events.findIndex((e) => e.kind === 'page')
    expect(sayIdx).toBeGreaterThanOrEqual(0)
    expect(pageIdx).toBeGreaterThan(sayIdx)
    expect(events.filter((e) => e.kind === 'say').length).toBe(2) // kedi, sonra ev
    const pg = events[pageIdx]
    expect(pg.kind === 'page' && pg.page).toBe(2)
    // bayraksız ikinci sayfa betiği
    const q = MODUL1_ACTIVITIES['scratchjr:4:2'].solution!()
    q.pages[1].sprites[0].scripts = [script(B('say', undefined, undefined, 'Hoş geldin!'))]
    expect(simulate(q, { press: 'flag', ms: 15000 }).events.filter((e) => e.kind === 'say')).toHaveLength(1)
    expect(find('m1h4d2-q3').answer).toBe(1)
    expect(find('m1h4d2-q2').options![find('m1h4d2-q2').answer]).toBe('2. sayfaya git')
  })

  it('5.1 hata avı: bozuk başlangıç yıldıza varmaz; düzeltmeler (3 tur, Sola dön) varır; 3 × 3 = 9 adım', () => {
    const act = MODUL1_ACTIVITIES['scratchjr:5:1']
    const yakin = (p: Project) => {
      const snap = simulate(p, { press: 'flag', ms: 20000 }).snapshot
      const star = snap.sprites.find((s) => s.character === 'star')!
      return snap.sprites.some((s) => s.character === 'cat' && Math.hypot(s.x - star.x, s.y - star.y) <= 36)
    }
    expect(yakin(act.starter())).toBe(false)
    expect(yakin(act.solution!())).toBe(true)
    // q3: yalnızca Tekrarla 2 -> 3 yapılırsa (Sola dön, İleri 8) varır; Tekrarla 2 ile varmaz
    const build = (n: number) => {
      const p = act.solution!()
      const cat = p.pages[0].sprites.find((s) => s.character === 'cat')!
      cat.scripts = [script(B('flag'), B('repeat', n, [B('forward', 3)]), B('turnLeft', 90), B('forward', 8))]
      return p
    }
    expect(yakin(build(2))).toBe(false)
    expect(yakin(build(3))).toBe(true)
    expect(find('m1h5d1-q3').options![find('m1h5d1-q3').answer]).toContain('3 olmalı')
    expect(isCorrect(find('m1h5d1-q4'), 3 * 3)).toBe(true)
    // q2: Sağa dön sonrası İleri 8 aşağı (y artar)
    const asagi = proje('cat', script(B('flag'), B('turnRight', 90), B('forward', 8)))
    expect(son(asagi).y).toBeGreaterThan(180)
    expect(find('m1h5d1-q2').options![find('m1h5d1-q2').answer]).toContain('Aşağı')
    // q5: başlatma bloğu olmayan betik çalışmaz
    expect(son(proje('cat', script(B('forward', 8)))).x).toBeCloseTo(120, 3)
    expect(find('m1h5d1-q5').options![find('m1h5d1-q5').answer]).toBe('Çalışmaz')
  })

  it('5.2 final: Tekrarla 2 { İleri 2, Zıpla } = 4 adım; Sonsuza kadar kendiliğinden bitmez', () => {
    const p = proje('cat', script(B('flag'), B('repeat', 2, [B('forward', 2), B('hop', 1)]), B('say', undefined, undefined, 'Yoruldum!')))
    expect(son(p).x - 120).toBeCloseTo(4 * STEP_UNITS, 3)
    expect(isCorrect(find('m1h5d2-q3'), 4)).toBe(true)
    const s = run(proje('cat', script(B('flag'), B('forever', undefined, [B('hop', 1)]))), 25000)
    expect(s.events.filter((e) => e.kind === 'hop').length).toBeGreaterThan(30)
    expect(find('m1h5d2-q5').options![find('m1h5d2-q5').answer]).toContain('Dur')
  })

  it('blok adları gerçek: açıklama ve sorularda yalnız editördeki bloklar geçer', () => {
    const adlar = ['İleri', 'Geri', 'Sağa dön', 'Sola dön', 'Zıpla', 'Eve dön', 'Söyle', 'Büyü', 'Küçül', 'Boyutu sıfırla', 'Gizle', 'Göster', 'Ses çal', 'Bekle', 'Tekrarla', 'Sonsuza kadar', 'Sayfaya git', 'Dur', 'Yeşil bayrak', 'Dokununca']
    for (const x of [/(?:^|\s)Atla\b/, /\bDön\b(?! )/, /\bSıçra\b/, /\bYürü bloğu/]) {
      for (const l of modul.weeks.flatMap((w) => w.lessons)) expect(`${l.explainerMd}\n${JSON.stringify(l.concepts)}\n${JSON.stringify(l.quiz)}`).not.toMatch(x)
    }
    expect(adlar).toContain('Tekrarla')
  })
})

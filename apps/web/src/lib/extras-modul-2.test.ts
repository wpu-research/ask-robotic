import { describe, expect, it } from 'vitest'
import { allModules, type LessonContent, type QuizQuestion } from '@ask/db'
import { validateConcepts, validateQuiz } from '../../../../tools/content/ek.mjs'
import { isCorrect } from './quiz'
import { LESSON_SKILLS, SKILL_IDS } from './skills'
import { BLOCKS } from './sahne/blocks'
import { arg, b, broadcast, callProc, chg, defProc, eq, flag, forever, gt, ifElse, ifThen, join, key, lt, mul, repeat, rnd, say, sayFor, setv, v, wait, keyDown } from './sahne/dsl'
import { makeProject, makeVar, type SpriteSpec } from './sahne/kit'
import { makeList } from './sahne/project'
import { SahneSession } from './sahne/session'
import type { BlockNode, ProcDef, SahneProject } from './sahne/types'

const modul = allModules.find((m) => m.slug === 'scratch')!
const lessonsFlat: { w: number; l: number; lesson: LessonContent }[] = modul.weeks.flatMap((wk, wi) => wk.lessons.map((lesson, li) => ({ w: wi + 1, l: li + 1, lesson })))
const allQ: { q: QuizQuestion; key: string }[] = lessonsFlat.flatMap((x) => (x.lesson.quiz ?? []).map((q) => ({ q, key: `scratch:${x.w}:${x.l}` })))
const Q = (id: string): QuizQuestion => {
  const f = allQ.find((x) => x.q.id === id)
  if (!f) throw new Error(`soru yok: ${id}`)
  return f.q
}
/** Seçmeli sorunun doğru seçeneğinin metni. */
const right = (id: string): string => { const q = Q(id); return q.options![q.answer] }

// ───────── yapı ─────────
describe('Modül 2 platform katmanı: yapı', () => {
  it('8 hafta, haftada 2 ders (toplam 16)', () => {
    expect(modul.weeks).toHaveLength(8)
    for (const wk of modul.weeks) expect(wk.lessons).toHaveLength(2)
    expect(lessonsFlat).toHaveLength(16)
  })

  it('her derste 200-400 sözcüklük anlatım, 3-6 kavram kartı ve 3-5 soru var', () => {
    for (const { w, l, lesson } of lessonsFlat) {
      const name = `${w}:${l} ${lesson.title}`
      const md = lesson.explainerMd ?? ''
      for (const h of ['### Bu derste öğreneceklerin', '### Önceden bilmen gerekenler', '### Özet']) expect(md, `${name}: ${h}`).toContain(h)
      const words = md.split(/\s+/).filter(Boolean).length
      expect(words, `${name}: sözcük sayısı ${words}`).toBeGreaterThanOrEqual(200)
      expect(words, `${name}: sözcük sayısı ${words}`).toBeLessThanOrEqual(400)
      expect(lesson.concepts!.length, name).toBeGreaterThanOrEqual(3)
      expect(lesson.concepts!.length, name).toBeLessThanOrEqual(6)
      expect(lesson.quiz!.length, name).toBeGreaterThanOrEqual(3)
      expect(lesson.quiz!.length, name).toBeLessThanOrEqual(5)
      // kavram, tahmin/hata bulma ve hesap sorularından en az ikisi
      const kinds = new Set(lesson.quiz!.map((q) => q.kind))
      expect(kinds.size, name).toBeGreaterThanOrEqual(2)
      expect(lesson.quiz!.some((q) => q.kind === 'mcq' || q.kind === 'predict-output'), name).toBe(true)
      expect(lesson.quiz!.some((q) => q.kind === 'find-bug' || q.kind === 'numeric'), name).toBe(true)
    }
  })

  it('her derste en az bir hata bulma ya da tahmin sorusu (derslerin çoğunda), modül genelinde dört tür de var', () => {
    const kinds = new Set(allQ.map((x) => x.q.kind))
    for (const k of ['mcq', 'predict-output', 'find-bug', 'numeric']) expect(kinds.has(k as QuizQuestion['kind']), k).toBe(true)
    expect(allQ.filter((x) => x.q.kind === 'find-bug').length).toBeGreaterThanOrEqual(14)
    expect(allQ.filter((x) => x.q.kind === 'numeric').length).toBeGreaterThanOrEqual(14)
    expect(allQ.filter((x) => x.q.kind === 'predict-output').length).toBeGreaterThanOrEqual(8)
  })

  it('kavram ve soru doğrulayıcıları (tools/content/ek.mjs) hatasız geçer', () => {
    for (const { w, l, lesson } of lessonsFlat) {
      const where = `modul-2/h${w}/${l}`
      expect(() => validateConcepts(lesson.concepts, where)).not.toThrow()
      expect(() => validateQuiz(lesson.quiz, where, SKILL_IDS)).not.toThrow()
    }
  })

  it('her haftanın rehberi sekiz bölümü sırayla içerir ve derslerin adlarını anar', () => {
    const SECTIONS = ['Hafta hedefleri', 'Haftanın planı', 'Ön koşul kontrolü', 'Kavram haritası', 'Sık yapılan hatalar', 'Hafta sonu tekrarı', 'Proje değerlendirme ölçütü', 'Veli ve öğretmen notu']
    for (const [wi, wk] of modul.weeks.entries()) {
      const g = wk.guideMd ?? ''
      let last = -1
      for (const s of SECTIONS) {
        const at = g.indexOf(`### ${s}`)
        expect(at, `hafta ${wi + 1}: ${s}`).toBeGreaterThan(last)
        last = at
      }
      for (const les of wk.lessons) expect(g, `hafta ${wi + 1}: ${les.title}`).toContain(les.title)
      expect(g, `hafta ${wi + 1} proje`).toContain(wk.project)
      expect(g, `hafta ${wi + 1}: Gelişmeli/Yeterli/İleri`).toMatch(/\| Ölçüt \| Gelişmeli \| Yeterli \| İleri \|/)
    }
  })

  it('soru kimlikleri benzersiz ve m2h<hafta>d<ders> biçiminde; beceriler tanımlı ve dersin eşlemesinin içinde', () => {
    expect(new Set(allQ.map((x) => x.q.id)).size).toBe(allQ.length)
    for (const x of lessonsFlat) {
      for (const q of x.lesson.quiz!) {
        expect(q.id.startsWith(`m2h${x.w}d${x.l}-q`), q.id).toBe(true)
        expect(q.skills.length, q.id).toBeGreaterThan(0)
        for (const s of q.skills) {
          expect(SKILL_IDS.has(s), `${q.id}: ${s}`).toBe(true)
          expect(LESSON_SKILLS[`scratch:${x.w}:${x.l}`], `${q.id}: ${s}`).toContain(s)
        }
      }
    }
  })

  it('soru biçimleri geçerli; doğru seçenek dağılımı dengeli', () => {
    for (const { q } of allQ) {
      expect(q.prompt.length, q.id).toBeGreaterThan(15)
      expect(q.explanation.length, q.id).toBeGreaterThan(40)
      if (q.kind === 'numeric') { expect(q.options, q.id).toBeUndefined(); expect(Number.isFinite(q.answer), q.id).toBe(true) } else {
        expect(q.options!.length, q.id).toBeGreaterThanOrEqual(2)
        expect(new Set(q.options).size, q.id).toBe(q.options!.length)
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
        expect(q.answer, q.id).toBeLessThan(q.options!.length)
      }
      if (q.kind === 'predict-output' || q.kind === 'find-bug') expect(q.prompt, q.id).toContain('```')
    }
    const choice = allQ.filter((x) => x.q.kind !== 'numeric')
    const dist = [0, 0, 0, 0, 0]
    for (const x of choice) dist[x.q.answer]++
    expect(new Set(choice.map((x) => x.q.answer)).size).toBeGreaterThan(2)
    expect(Math.max(...dist) / choice.length, `dağılım ${dist}`).toBeLessThan(0.6)
  })

  it('kod bloklarındaki her satır Sahne Atölyesi\'nin gerçek blok adlarıyla yazılmış (uydurma blok adı yok)', () => {
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const tpl = BLOCKS.filter((d) => d.msg.replace(/\{\w+\}/g, '').trim().length >= 2).map((d) => new RegExp('^' + esc(d.msg).replace(/\\\{\w+\\\}/g, '.+?') + '$'))
    tpl.push(/^yeşil bayrak tıklanınca$/) // 🏁 tıklanınca bloğunun yazılışı (emojisiz)
    tpl.push(/^değilse$/) // eğer/değilse bloğunun ikinci ağzı
    tpl.push(/^tanım: [^\s].*$/, /^(zıpla|dans et)( \d+)?$/) // "Bir blok yap" tanımı ve çağrıları
    const extra = [/^\(boş\)$/, /^\(bir soru sor\)$/, /^\S+ kod alanı:$/, /^(sorular|cevaplar): \[.*\]$/]
    const ok = (line: string): boolean => {
      const s = line.replace(/\s{2,}\(.*\)$/, '').trim()
      if (!s) return true
      const cands = [s, s.replace(/^[A-ZÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ']*: /, '')]
      return cands.some((c) => tpl.some((r) => r.test(c)) || extra.some((r) => r.test(c)))
    }
    const bad: string[] = []
    const scan = (where: string, text: string) => {
      for (const m of text.matchAll(/```\n([\s\S]*?)\n```/g)) for (const line of m[1].split('\n')) if (!ok(line)) bad.push(`${where}: ${line}`)
    }
    for (const { w, l, lesson } of lessonsFlat) {
      scan(`${w}:${l} anlatım`, lesson.explainerMd ?? '')
      for (const q of lesson.quiz!) scan(q.id, q.prompt)
    }
    expect(bad, bad.join('\n')).toEqual([])
  })
})

// ───────── Sahne Atölyesi ile doğrulama ─────────
const sp = (id: string, blocks: BlockNode[], o: Partial<SpriteSpec> = {}): SpriteSpec => ({ id, name: id, char: 'kedi', blocks, ...o })
const proj = (sprites: SpriteSpec[], o: Parameters<typeof makeProject>[2] = {}): SahneProject => makeProject('t', sprites, o)
const go = (p: SahneProject, seconds = 2, seed = 1): SahneSession => { const s = new SahneSession(p, { seed }); s.flag(); s.seconds(seconds); return s }
const at = (s: SahneSession, id = 'kedi') => s.sprite(id)!
const say1 = (s: SahneSession, id = 'kedi') => s.engine.sayLog.filter((x) => x.defId === id)
const soundNames = (s: SahneSession) => s.engine.events.filter((e) => e.kind === 'sound').map((e) => e.detail)
const SES = ['do', 're', 'mi', 'fa', 'sol', 'miyav']
const R1 = (n: number) => Math.round(n * 10) / 10

describe('Hafta 1: program, sahne, koordinat', () => {
  it('d1: sıra ve yön (q2), adım toplamı (q3), bağlı olmayan bloklar (q4)', () => {
    const s = go(proj([sp('kedi', [flag([b('sh_move', { N: 20 }), b('sh_turn_r', { D: 90 }), b('sh_move', { N: 30 })])])]))
    expect(at(s).x).toBeCloseTo(20)
    expect(at(s).y).toBeCloseTo(-30) // önce sağa 20, sonra aşağı 30
    expect(right('m2h1d1-q2')).toContain('sağa 20')
    expect(right('m2h1d1-q2')).toContain('aşağı')

    const n = go(proj([sp('kedi', [flag([b('sh_move', { N: 10 }), repeat(4, [b('sh_move', { N: 5 })])])])]))
    expect(isCorrect(Q('m2h1d1-q3'), at(n).x)).toBe(true)

    const loose = new SahneSession(proj([sp('kedi', [flag([]), b('sh_turn_r', { D: 90 }), b('sh_play', { S: 'Alkış' })])], { backdrops: ['sahne'] }))
    loose.flag(); loose.seconds(1)
    expect(at(loose).dir).toBe(90) // bayrağa bağlı olmayan dönme çalışmadı
    expect(soundNames(loose)).toHaveLength(0)
    expect(right('m2h1d1-q4')).toContain('tutturulmamış')
  })

  it('d2: koordinatlar (q3, q4), her sprite\'ın kendi kodu (q5)', () => {
    const p = go(proj([sp('kedi', [flag([b('sh_goto_xy', { X: -100, Y: 50 }), b('sh_change_x', { N: 30 }), b('sh_change_y', { N: -80 })])])]))
    expect([at(p).x, at(p).y]).toEqual([-70, -30])
    expect(right('m2h1d2-q3')).toBe('(-70, -30)')

    const n = go(proj([sp('kedi', [flag([repeat(4, [b('sh_change_x', { N: 30 })])])], { x: -150 })]))
    expect(isCorrect(Q('m2h1d2-q4'), at(n).x)).toBe(true)

    const two = go(proj([sp('kedi', [flag([b('sh_move', { N: 20 })])]), sp('kopek', [], { char: 'kopek', x: 100 })]))
    expect(at(two).x).toBeCloseTo(20)
    expect(at(two, 'kopek').x).toBe(100) // köpeğin kendi kodu yok, kıpırdamadı
    expect(right('m2h1d2-q5')).toContain('kendi kodu yok')
  })
})

describe('Hafta 2: kostüm ve döngü', () => {
  it('d1: kostüm sırası başa döner (q2), süre (q3), hız (q4), bekle yok (q5)', () => {
    const s = go(proj([sp('kedi', [flag([b('sh_next_costume'), b('sh_next_costume'), b('sh_next_costume')])])]))
    expect(at(s).costumes).toHaveLength(2)
    expect(at(s).costume + 1).toBe(2)
    expect(right('m2h2d1-q2')).toBe('2. kostüm')

    const t = new SahneSession(proj([sp('kedi', [flag([repeat(12, [b('sh_next_costume'), wait(0.1)])])])]))
    t.flag()
    const frames = t.runUntilIdle()
    expect(R1(frames / 30)).toBe(1.2)
    expect(isCorrect(Q('m2h2d1-q3'), R1(frames / 30))).toBe(true)

    const rate = new SahneSession(proj([sp('kedi', [flag([forever([b('sh_next_costume'), wait(0.1)])])])]))
    rate.flag(); rate.seconds(1)
    expect(rate.count('costume')).toBeGreaterThanOrEqual(9)
    expect(rate.count('costume')).toBeLessThanOrEqual(11) // 0,1 saniye = tam 3 kare
    expect(isCorrect(Q('m2h2d1-q4'), 1 / 0.1)).toBe(true)

    const fast = new SahneSession(proj([sp('kedi', [flag([repeat(10, [b('sh_next_costume')])])])]))
    fast.flag()
    const ff = fast.runUntilIdle()
    expect(fast.count('costume')).toBe(10)
    expect(ff).toBeLessThanOrEqual(12) // 10 değişim 0,4 saniyeden kısa: göz seçemez
    expect(right('m2h2d1-q5')).toContain('bekle yok')
  })

  it('d2: tekrarla (q2), sekme (q3), döngü dışı (q4), paralel (q5)', () => {
    const s = go(proj([sp('kedi', [flag([b('sh_goto_xy', { X: -100, Y: 0 }), repeat(8, [b('sh_move', { N: 15 })])])])]))
    expect(isCorrect(Q('m2h2d2-q2'), at(s).x)).toBe(true)

    const bounce = new SahneSession(proj([sp('kedi', [flag([forever([b('sh_move', { N: 10 }), b('sh_bounce'), wait(0.05)])])])]))
    bounce.flag()
    const xs: number[] = []
    for (let i = 0; i < 400; i++) { bounce.tick(); xs.push(at(bounce).x) }
    const top = Math.max(...xs)
    expect(top).toBeGreaterThanOrEqual(150)
    expect(top).toBeLessThan(300) // sahneden çıkıp kaybolmaz
    const topAt = xs.indexOf(top)
    expect(Math.min(...xs.slice(topAt))).toBeLessThan(top - 100) // geri döndü
    expect(Math.min(...xs.slice(topAt))).toBeLessThan(0) // sola doğru gidiyor
    expect(right('m2h2d2-q3')).toContain('gidip gelir')

    const out = go(proj([sp('kedi', [flag([b('sh_move', { N: 10 }), b('sh_next_costume'), forever([wait(0.2)])])])]), 4)
    expect(at(out).x).toBeCloseTo(10) // döngü dışındaki bloklar bir kez çalıştı
    expect(right('m2h2d2-q4')).toContain('dışında')

    const par = go(proj([sp('kedi', [flag([forever([b('sh_move', { N: 1 }), wait(0.1)])])]), sp('kopek', [flag([forever([b('sh_move', { N: 1 }), wait(0.1)])])], { char: 'kopek', y: -80 })]), 1)
    expect(at(par).x).toBeGreaterThan(5)
    expect(at(par, 'kopek').x).toBeGreaterThan(5)
    expect(right('m2h2d2-q5')).toBe('İkisi aynı anda çalışır')
  })
})

describe('Hafta 3: olaylar ve ses', () => {
  const keys = () => [key('a', [b('sh_play', { S: 'Do' })]), key('s', [b('sh_play', { S: 'Re' })]), key('d', [b('sh_play', { S: 'Mi' })]), key('f', [b('sh_play', { S: 'Fa' })])]
  it('d1: tuş başlıkları (q2, q4) ve tıklama başlığı (q3)', () => {
    const two = new SahneSession(proj([sp('kedi', [key('a', [b('sh_play', { S: 'Do' })]), key('s', [b('sh_play', { S: 'Re' })])], { sounds: SES })]))
    two.flag(); two.tick(2)
    for (const k of ['a', 'd', 's']) two.tap(k)
    expect(soundNames(two)).toEqual(['Do', 'Re'])
    expect(right('m2h3d1-q2')).toBe('Do, Re')

    const four = new SahneSession(proj([sp('kedi', keys(), { sounds: SES })]))
    four.flag(); four.tick(2)
    for (const k of ['a', 's', 'd', 'f', 'a', 'a']) four.tap(k)
    expect(isCorrect(Q('m2h3d1-q4'), four.count('sound'))).toBe(true)

    // hatalı: bayrak başlığı altındaki ses, tıklamayla çalmaz; doğru başlıkla çalar
    const wrong = new SahneSession(proj([sp('kedi', [flag([b('sh_play', { S: 'Miyav' })])], { sounds: SES })]))
    wrong.click('kedi'); wrong.tick(3)
    expect(wrong.count('sound')).toBe(0)
    const fixed = new SahneSession(proj([sp('kedi', [b('sh_when_clicked', {}, [b('sh_play', { S: 'Miyav' })])], { sounds: SES })]))
    fixed.click('kedi'); fixed.tick(3)
    expect(fixed.count('sound')).toBe(1)
    expect(right('m2h3d1-q3')).toContain('bu sprite tıklanınca')
  })

  it('d2: bitene dek çal sırayla (q1), çal üst üste (q2), süre (q3), büyüklük geri alınmıyor (q4), ses seviyesi (q5)', () => {
    const seq = new SahneSession(proj([sp('kedi', [b('sh_when_clicked', {}, [b('sh_play_until', { S: 'Do' }), b('sh_play_until', { S: 'Mi' }), b('sh_play_until', { S: 'Sol' })])], { sounds: SES })]))
    seq.click('kedi'); seq.seconds(6)
    const ts = seq.engine.events.filter((e) => e.kind === 'sound').map((e) => e.t)
    expect(ts).toHaveLength(3)
    expect(ts[1]).toBeGreaterThan(ts[0]); expect(ts[2]).toBeGreaterThan(ts[1])
    expect(right('m2h3d2-q1')).toContain('bitene dek çal')

    const par = new SahneSession(proj([sp('kedi', [b('sh_when_clicked', {}, [b('sh_play', { S: 'Do' }), b('sh_play', { S: 'Mi' }), b('sh_play', { S: 'Sol' })])], { sounds: SES })]))
    par.click('kedi'); par.seconds(1)
    const tp = par.engine.events.filter((e) => e.kind === 'sound').map((e) => e.t)
    expect(tp).toHaveLength(3)
    expect(new Set(tp).size).toBe(1) // üçü de aynı anda başladı
    expect(right('m2h3d2-q2')).toBe('Üç ses aynı anda başlar')

    const dur = new SahneSession(proj([sp('kedi', [b('sh_when_clicked', {}, [repeat(3, [b('sh_play', { S: 'Do' }), wait(0.4)]), wait(1)])], { sounds: SES })]))
    dur.click('kedi')
    const fr = dur.runUntilIdle()
    expect(R1(fr / 30)).toBe(2.2)
    expect(isCorrect(Q('m2h3d2-q3'), R1(fr / 30))).toBe(true)

    const big = new SahneSession(proj([sp('kedi', [key('a', [b('sh_play', { S: 'Do' }), b('sh_set_size', { N: 130 })])], { sounds: SES })]))
    big.flag(); big.tick(2); big.tap('a'); big.seconds(2)
    expect(at(big).size).toBe(130) // eski boyuta dönmedi
    expect(right('m2h3d2-q4')).toContain('(% 100)')

    const vol = go(proj([sp('kedi', [flag([b('sh_change_volume', { N: 20 }), b('sh_change_volume', { N: -20 }), b('sh_change_volume', { N: -20 })])])]))
    expect(at(vol).volume).toBe(60)
    expect(isCorrect(Q('m2h3d2-q5'), at(vol).volume)).toBe(true)
  })
})

describe('Hafta 4: konuşma ve mesaj', () => {
  it('d1: aynı anda konuşma (q1), bekleme hesabı (q2, q3), çakışma (q4), süresiz de (q5)', () => {
    const both = go(proj([sp('kedi', [flag([sayFor('Merhaba!', 2)])]), sp('kopek', [flag([sayFor('Selam!', 2)])], { char: 'kopek' })]), 3)
    expect(say1(both, 'kedi')[0].start).toBe(say1(both, 'kopek')[0].start)
    expect(right('m2h4d1-q1')).toContain('aynı anda')

    const gap = go(proj([sp('kedi', [flag([sayFor('Nasılsın?', 3)])]), sp('kopek', [flag([wait(3.5), sayFor('İyiyim!', 2)])], { char: 'kopek' })]), 7)
    const ms = say1(gap, 'kopek')[0].start - say1(gap, 'kedi')[0].end!
    expect(Math.abs(ms - 500)).toBeLessThan(40) // 3 + 0,5 = 3,5 saniye bekleyen köpek, kedi bittikten yarım saniye sonra konuşur
    expect(isCorrect(Q('m2h4d1-q2'), 3 + 0.5)).toBe(true)

    const three = go(proj([
      sp('kedi', [flag([sayFor('Merhaba!', 2), wait(2), sayFor('Nasılsın?', 2)])]),
      sp('kopek', [flag([wait(2), sayFor('İyiyim!', 2)])], { char: 'kopek' }),
    ]), 7)
    const second = say1(three, 'kedi')[1].start / 1000
    expect(Math.abs(second - 4)).toBeLessThan(0.07)
    expect(isCorrect(Q('m2h4d1-q3'), Math.round(second))).toBe(true)
    expect(say1(three, 'kopek')[0].start / 1000).toBeCloseTo(2, 1)
    expect(say1(three, 'kopek')[0].end!).toBeLessThanOrEqual(say1(three, 'kedi')[1].start + 40) // çakışmıyorlar

    const bug = go(proj([sp('kedi', [flag([sayFor('Nasılsın?', 3)])]), sp('kopek', [flag([wait(2), sayFor('İyiyim!', 2)])], { char: 'kopek' })]), 6)
    expect(say1(bug, 'kopek')[0].start).toBeLessThan(say1(bug, 'kedi')[0].end! - 800) // 1 saniyelik çakışma
    expect(right('m2h4d1-q4')).toContain('kısa')

    const stay = go(proj([sp('kedi', [flag([say('Merhaba!')])])]), 5)
    expect(at(stay).bubble?.text).toBe('Merhaba!') // süresiz de: balon kalır
    expect(right('m2h4d1-q5')).toContain('program bitene kadar')
  })

  it('d2: mesajla sıra (q2), yanlış mesaj adı (q3), sonraki arka plan döner (q4)', () => {
    const ok = go(proj([
      sp('kedi', [flag([sayFor('Hazır mısın?', 2), broadcast('başla')])]),
      sp('kopek', [b('sh_when_msg', { M: 'başla' }, [sayFor('Hazırım!', 1)])], { char: 'kopek' }),
    ]), 5)
    expect(Math.abs(say1(ok, 'kopek')[0].start / 1000 - 2)).toBeLessThan(0.07)
    expect(right('m2h4d2-q2')).toContain('2. saniyede')

    const bad = go(proj([
      sp('kedi', [flag([sayFor('Merhaba!', 2), broadcast('sıra1')])]),
      sp('kopek', [b('sh_when_msg', { M: 'sıra2' }, [sayFor('Selam!', 2)])], { char: 'kopek' }),
    ]), 6)
    expect(say1(bad, 'kopek')).toHaveLength(0)
    expect(right('m2h4d2-q3')).toContain('mesaj adları farklı')

    const bg = go(proj([sp('kedi', [flag([repeat(5, [broadcast('sıra'), wait(0.1)])])])], {
      backdrops: ['oda', 'gokyuzu', 'gece'],
      stage: [b('sh_when_msg', { M: 'sıra' }, [b('sh_next_backdrop')])],
    }), 3)
    expect(bg.engine.stage.costume + 1).toBe(3)
    expect(isCorrect(Q('m2h4d2-q4'), bg.engine.stage.costume + 1)).toBe(true)
  })
})

describe('Hafta 5: tuş, koşul, değişken', () => {
  it('d1: basılı tutma ve döngü (q1, q5), 9 sağ 2 sol (q2), düşen elma (q3, q4)', () => {
    const loopSp = (withLoop: boolean) => {
      const checks = [ifThen(keyDown('right'), [b('sh_change_x', { N: 10 })]), ifThen(keyDown('left'), [b('sh_change_x', { N: -10 })])]
      return sp('kedi', [flag(withLoop ? [forever(checks)] : checks)])
    }
    const held = new SahneSession(proj([loopSp(true)]))
    held.flag(); held.tick(2); held.press('right'); held.tick(10)
    const hatOnly = new SahneSession(proj([sp('kedi', [key('right', [b('sh_change_x', { N: 10 })])])]))
    hatOnly.flag(); hatOnly.tick(2); hatOnly.press('right'); hatOnly.tick(10)
    expect(at(held).x).toBeGreaterThan(at(hatOnly).x * 3) // döngü basılı tuşu sürekli izler
    expect(right('m2h5d1-q1')).toContain('sonsuza kadar')

    const none = new SahneSession(proj([loopSp(false)]))
    none.flag(); none.tick(2); none.press('right'); none.tick(10)
    expect(at(none).x).toBe(0) // döngü yok: tuşa yalnız bir kez bakıldı
    expect(right('m2h5d1-q5')).toContain('yalnız bir kez')

    // 9 tur sağ, 2 tur sol: koşul bloklarıyla gerçekten çalıştırılır
    const tur = go(proj([sp('kedi', [flag([setv('t', 0), repeat(11, [chg('t', 1), ifThen(lt(v('t'), 10), [b('sh_change_x', { N: 10 })]), ifThen(gt(v('t'), 9), [b('sh_change_x', { N: -10 })])])])])], { vars: [makeVar('t')] }), 3)
    expect(isCorrect(Q('m2h5d1-q2'), at(tur).x)).toBe(true)

    const elma = new SahneSession(proj([sp('kedi', [flag([b('sh_goto_xy', { X: 0, Y: 150 }), forever([b('sh_change_y', { N: -5 }), ifThen(lt(b('sh_ypos'), -150), [b('sh_set_y', { N: 150 })])])])], { char: 'elma', y: 150 })]))
    elma.flag()
    const ys: number[] = []
    for (let i = 0; i < 140; i++) { elma.tick(); ys.push(at(elma).y) }
    const low = ys.findIndex((y) => y < -149)
    expect(low).toBeGreaterThan(0)
    expect(ys.slice(low + 1).some((y) => y > 100)).toBe(true) // yere inince yeniden yukarıda
    expect(right('m2h5d1-q3')).toContain('y = 150')

    // 150'den -100'e 5'er 5'er: 50 tur
    const cnt = go(proj([sp('kedi', [flag([setv('n', 0), b('sh_goto_xy', { X: 0, Y: 150 }), b('sh_repeat_until', { C: lt(b('sh_ypos'), -99) }, [b('sh_change_y', { N: -5 }), chg('n', 1)])])], { char: 'elma', y: 150 })], { vars: [makeVar('n')] }), 3)
    expect(cnt.variable('n')).toBe(50)
    expect(isCorrect(Q('m2h5d1-q4'), Number(cnt.variable('n')))).toBe(true)
  })

  it('d2: skor hesapları (q2, q3), sıfırlanmayan skor (q4), konuşma (q5)', () => {
    const vars = { vars: [makeVar('skor')] }
    const a = go(proj([sp('kedi', [flag([setv('skor', 0), repeat(4, [chg('skor', 2)]), chg('skor', -3)])])], vars))
    expect(isCorrect(Q('m2h5d2-q2'), Number(a.variable('skor')))).toBe(true)

    const g = go(proj([sp('kedi', [flag([setv('skor', 0), repeat(4, [chg('skor', 1)]), repeat(2, [chg('skor', 5)])])])], vars))
    expect(isCorrect(Q('m2h5d2-q3'), Number(g.variable('skor')))).toBe(true)

    // sıfırlama yok: eski skor kalıyor
    const carry = new SahneSession(proj([sp('kedi', [flag([forever([b('sh_change_y', { N: -5 }), ifThen(lt(b('sh_ypos'), -150), [chg('skor', 1), b('sh_set_y', { N: 150 })])])])], { char: 'elma', y: 150 })], vars))
    carry.engine.setVar(carry.engine.idOf('skor')!, 7)
    carry.flag(); carry.tick(5)
    expect(Number(carry.variable('skor'))).toBeGreaterThanOrEqual(7)
    expect(right('m2h5d2-q4')).toContain('skor = 0 yap')

    const sayS = go(proj([sp('kedi', [flag([setv('skor', 10), chg('skor', -4), setv('skor', 3), chg('skor', 1), say(join('Skor: ', v('skor')))])])], vars))
    expect(say1(sayS).at(-1)!.text).toBe('Skor: 4')
    expect(right('m2h5d2-q5')).toBe('Skor: 4')
  })
})

describe('Hafta 6: can, süre, rastgele, klon', () => {
  const fallSp = (cond: BlockNode, drop: number) => sp('kedi', [flag([forever([b('sh_change_y', { N: -5 }), ifThen(lt(b('sh_ypos'), -150), [chg('can', -drop), b('sh_set_y', { N: 150 })]), ifThen(cond, [say('Oyun bitti'), b('sh_stop', { W: 'all' })])])])], { char: 'elma', y: 150 })
  const canVar = { vars: [makeVar('can', { value: 3 })] }

  it('d1: can (q1), süre (q2), = ve < (q3), dur blokları (q4), tur içi koşul (q5)', () => {
    const lose = go(proj([sp('kedi', [flag([setv('can', 3), repeat(2, [chg('can', -1)])])])], canVar))
    expect(isCorrect(Q('m2h6d1-q1'), Number(lose.variable('can')))).toBe(true)

    const t = go(proj([sp('kedi', [flag([setv('süre', 4), forever([wait(1), chg('süre', -1), ifThen(lt(v('süre'), 1), [say('Süre doldu'), b('sh_stop', { W: 'all' })])])])])], { vars: [makeVar('süre')] }), 6)
    const at4 = say1(t)[0].start / 1000
    expect(Math.abs(at4 - 4)).toBeLessThan(0.1)
    expect(isCorrect(Q('m2h6d1-q2'), Math.round(at4))).toBe(true)

    const eqBug = go(proj([fallSp(eq(v('can'), 0), 2)], canVar), 12)
    expect(say1(eqBug)).toHaveLength(0) // 3, 1, -1... hiç 0 olmaz: "Oyun bitti" çıkmaz
    const ltFix = go(proj([fallSp(lt(v('can'), 1), 2)], canVar), 12)
    expect(say1(ltFix).length).toBeGreaterThan(0)
    expect(ltFix.running).toBe(false)
    expect(right('m2h6d1-q3')).toContain('hiç 0 olmuyor')

    // "bu betiği dur" diğer betikleri durdurmaz, "hepsini dur" durdurur
    const mk = (w: 'this' | 'all') => proj([sp('kedi', [flag([wait(0.3), b('sh_stop', { W: w })]), flag([forever([b('sh_change_x', { N: 1 }), wait(0.1)])])])])
    const thisStop = go(mk('this'), 2)
    expect(thisStop.running).toBe(true)
    const allStop = go(mk('all'), 2)
    expect(allStop.running).toBe(false)
    expect(right('m2h6d1-q4')).toBe('hepsini dur')

    const sk = go(proj([sp('kedi', [flag([setv('can', 3), setv('skor', 0), repeat(3, [chg('can', -2), ifThen(lt(v('can'), 1), [chg('skor', 1)])])])])], { vars: [makeVar('can'), makeVar('skor')] }))
    expect(sk.variable('skor')).toBe(2)
    expect(right('m2h6d1-q5')).toBe('2')
  })

  it('d2: rastgele aralık (q1, q5), klon sayısı (q2, q3), klonun kodu (q4)', () => {
    const seen = new Set<number>()
    for (let seed = 1; seed <= 300; seed++) {
      const s = go(proj([sp('kedi', [flag([setv('r', rnd(1, 6))])])], { vars: [makeVar('r')] }), 0.2, seed)
      seen.add(Number(s.variable('r')))
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]) // uçlar dahil, 0 ve 7 yok
    expect(right('m2h6d2-q1')).toContain('1, 2, 3, 4, 5 ve 6')

    const clones = go(proj([sp('kedi', [flag([repeat(5, [b('sh_create_clone', { T: '_myself_' })])])], { char: 'elma' })]), 1)
    expect(clones.engine.targets).toHaveLength(6)
    expect(isCorrect(Q('m2h6d2-q2'), clones.engine.targets.length)).toBe(true)

    const vis = go(proj([sp('kedi', [flag([b('sh_hide'), repeat(3, [b('sh_create_clone', { T: '_myself_' }), wait(1)])]), b('sh_when_clone', {}, [b('sh_show')])], { char: 'elma' })]), 4)
    expect(vis.engine.targets.filter((t) => t.visible)).toHaveLength(3)
    expect(right('m2h6d2-q3')).toBe('3')

    // klon davranışı bayrak altında: yalnız ana elma düşer, klonlar donar
    const fall = (bugged: boolean) => proj([sp('kedi', [
      flag([b('sh_hide'), forever([b('sh_create_clone', { T: '_myself_' }), wait(1)])]),
      bugged ? flag([b('sh_show'), b('sh_goto_xy', { X: 0, Y: 150 }), b('sh_repeat_until', { C: lt(b('sh_ypos'), -150) }, [b('sh_change_y', { N: -5 })]), b('sh_delete_clone')])
        : b('sh_when_clone', {}, [b('sh_show'), b('sh_goto_xy', { X: 0, Y: 150 }), b('sh_repeat_until', { C: lt(b('sh_ypos'), -150) }, [b('sh_change_y', { N: -5 })]), b('sh_delete_clone')]),
    ], { char: 'elma', y: 150 })])
    const bug = go(fall(true), 3)
    const frozen = bug.engine.targets.filter((t) => t.isClone).map((t) => t.y)
    expect(frozen.length).toBeGreaterThanOrEqual(2)
    bug.seconds(1)
    const later = bug.engine.targets.filter((t) => t.isClone).slice(0, frozen.length).map((t) => t.y)
    expect(later).toEqual(frozen) // klonlar kıpırdamıyor
    const fixed = go(fall(false), 3)
    const moving = fixed.engine.targets.filter((t) => t.isClone)
    expect(moving.length).toBeGreaterThanOrEqual(2)
    expect(moving.some((t) => t.y < 140)).toBe(true) // klonlar düşüyor
    expect(right('m2h6d2-q4')).toContain('klon olarak başlayınca')

    // -200..200 aralığında uçlar dahil 401 olası değer: 3000 çekilişte hepsine yakın görünür
    const lst = makeList('xler', [])
    const draw = go(proj([sp('kedi', [flag([repeat(3000, [b('sh_list_add', { I: rnd(-200, 200), L: 'xler' })])])])], { vars: [lst] }), 20, 7)
    const xs = draw.list('xler')!.map(Number)
    expect(xs.length).toBe(3000)
    expect(Math.min(...xs)).toBe(-200)
    expect(Math.max(...xs)).toBe(200)
    expect(isCorrect(Q('m2h6d2-q5'), 200 - -200 + 1)).toBe(true)
  })
})

describe('Hafta 7: kendi blok ve liste', () => {
  const ZIPLA: ProcDef = { id: 'zipla', name: 'zıpla', params: ['yükseklik'] }
  const DANS: ProcDef = { id: 'dans', name: 'dans et', params: [] }
  const ziplaDef = (): BlockNode => defProc('zipla', [b('sh_change_y', { N: arg('yükseklik') }), wait(0.1), b('sh_change_y', { N: mul(arg('yükseklik'), -1) })])

  it('d1: en yüksek nokta (q2), çağrılmayan tanım (q3), net dönüş (q4)', () => {
    const jump = new SahneSession(proj([sp('kedi', [ziplaDef(), flag([callProc('zipla', [25]), callProc('zipla', [45]), b('sh_change_y', { N: 10 })])], { procs: [ZIPLA] })]))
    jump.flag()
    let top = -Infinity
    for (let i = 0; i < 90; i++) { jump.tick(); top = Math.max(top, at(jump).y) }
    expect(top).toBe(45)
    expect(at(jump).y).toBe(10)
    expect(isCorrect(Q('m2h7d1-q2'), top)).toBe(true)

    const uncalled = go(proj([sp('kedi', [ziplaDef(), flag([b('sh_change_x', { N: 10 })])], { procs: [ZIPLA] })]))
    expect(at(uncalled).x).toBe(10)
    expect(at(uncalled).y).toBe(0) // zıpla hiç çalışmadı
    expect(right('m2h7d1-q3')).toContain('hiç çağrılmamış')

    const dans = go(proj([sp('kedi', [defProc('dans', [b('sh_turn_r', { D: 30 }), wait(0.1), b('sh_turn_l', { D: 10 })]), flag([callProc('dans'), callProc('dans'), callProc('dans')])], { procs: [DANS] })]), 3)
    expect(at(dans).dir).toBe(150)
    expect(right('m2h7d1-q4')).toBe('150 yönüne')
  })

  const SORULAR = ['Haftada kaç gün var?', 'Üçgenin kaç kenarı var?', 'Arının yaptığı tatlı besin nedir?', 'Güneş hangi yönden doğar?', 'Bir elde kaç parmak var?']
  const CEVAPLAR = ['7', '3', 'bal', 'doğu', '5']
  const quizSprite = (opts: { increment?: boolean } = {}): SpriteSpec => sp('robot', [flag([
    setv('sıra', 1), setv('skor', 0),
    b('sh_repeat_until', { C: gt(v('sıra'), b('sh_list_len', { L: 'sorular' })) }, [
      b('sh_ask', { Q: b('sh_list_item', { L: 'sorular', N: v('sıra') }) }),
      ifElse(eq(b('sh_answer'), b('sh_list_item', { L: 'cevaplar', N: v('sıra') })), [sayFor('Doğru!', 0.5), chg('skor', 1)], [sayFor('Yanlış', 0.5)]),
      ...(opts.increment === false ? [] : [chg('sıra', 1)]),
    ]),
  ])], { char: 'robot' })
  const quizVars = (q: string[], c: string[]) => [makeList('sorular', q), makeList('cevaplar', c), makeVar('sıra', { value: 1 }), makeVar('skor')]
  const truth = (q: string): string => CEVAPLAR[SORULAR.indexOf(q)] ?? ''

  it('d2: liste sırası (q1), tur sayısı (q2), uyuşmayan listeler (q3), artmayan sıra (q4), yeni soru (q5)', () => {
    const ins = go(proj([sp('kedi', [flag([b('sh_list_insert', { I: 'muz', N: 1, L: 'meyveler' }), say(b('sh_list_item', { L: 'meyveler', N: 3 }))])])], { vars: [makeList('meyveler', ['elma', 'armut', 'kiraz'])] }))
    expect(say1(ins)[0].text).toBe('armut')
    expect(right('m2h7d2-q1')).toBe('armut')

    const turns = go(proj([sp('kedi', [flag([setv('sıra', 3), setv('tur', 0), b('sh_repeat_until', { C: gt(v('sıra'), b('sh_list_len', { L: 'sorular' })) }, [chg('tur', 1), chg('sıra', 1)])])])], {
      vars: [makeList('sorular', ['1', '2', '3', '4', '5', '6', '7', '8']), makeVar('sıra'), makeVar('tur')],
    }))
    expect(turns.variable('tur')).toBe(6)
    expect(isCorrect(Q('m2h7d2-q2'), Number(turns.variable('tur')))).toBe(true)

    // q3: sorular ve cevaplar listesi farklı sırada
    const mismatch = new SahneSession(proj([quizSprite()], { vars: quizVars(['Haftada kaç gün var?', 'Üçgenin kaç kenarı var?'], ['3', '7']) }))
    mismatch.autoAnswer = (q) => truth(q)
    mismatch.flag(); mismatch.seconds(8)
    expect(Number(mismatch.variable('skor'))).toBe(0) // doğru cevaplar yanlış sayıldı
    expect(say1(mismatch, 'robot').every((x) => x.text === 'Yanlış')).toBe(true)
    const okQuiz = new SahneSession(proj([quizSprite()], { vars: quizVars(['Haftada kaç gün var?', 'Üçgenin kaç kenarı var?'], ['7', '3']) }))
    okQuiz.autoAnswer = (q) => truth(q)
    okQuiz.flag(); okQuiz.seconds(8)
    expect(Number(okQuiz.variable('skor'))).toBe(2)
    expect(right('m2h7d2-q3')).toContain('sırası uyuşmuyor')

    // q4: sıra artmıyor, hep ilk soru
    const stuck = new SahneSession(proj([quizSprite({ increment: false })], { vars: quizVars(SORULAR, CEVAPLAR) }))
    const asked: string[] = []
    stuck.autoAnswer = (q) => { asked.push(q); return truth(q) }
    stuck.flag(); stuck.seconds(6)
    expect(asked.length).toBeGreaterThanOrEqual(4)
    expect(new Set(asked).size).toBe(1)
    expect(stuck.running).toBe(true) // yarışma hiç bitmiyor
    expect(right('m2h7d2-q4')).toContain('artırılmıyor')

    // q5: 6. soru yalnız listelere eklenir, kod aynı kalır
    const six = new SahneSession(proj([quizSprite()], { vars: quizVars([...SORULAR, 'Bir yılda kaç ay var?'], [...CEVAPLAR, '12']) }))
    six.autoAnswer = (q) => (q === 'Bir yılda kaç ay var?' ? '12' : truth(q))
    six.flag(); six.seconds(20)
    expect(Number(six.variable('skor'))).toBe(6)
    expect(right('m2h7d2-q5')).toContain('kod değişmez')
  })
})

describe('Hafta 8: plan, test, sergi', () => {
  const kediX = (key_: string) => sp('kedi', [key(key_, [b('sh_change_x', { N: 10 }), b('sh_next_costume')]), b('sh_when_clicked', {}, [sayFor('Miyav!', 1)])], { sounds: ['miyav'] })

  it('d1: etkileşim (q2), plana uymayan tuş (q3)', () => {
    const right3 = new SahneSession(proj([kediX('right')]))
    right3.flag(); right3.tick(2)
    for (let i = 0; i < 3; i++) right3.tap('right')
    right3.click('kedi'); right3.tick(3)
    expect(isCorrect(Q('m2h8d1-q2'), at(right3).x)).toBe(true)
    expect(say1(right3)[0].text).toBe('Miyav!')

    const wrong = new SahneSession(proj([kediX('a')]))
    wrong.flag(); wrong.tick(2); wrong.tap('right'); wrong.tick(2)
    expect(at(wrong).x).toBe(0) // plandaki tuş çalışmıyor
    wrong.tap('a'); wrong.tick(2)
    expect(at(wrong).x).toBe(10)
    expect(right('m2h8d1-q3')).toContain('"a" tuşu')
  })

  it('d2: sekiz basış (q2), gizli kalan elma (q3), yüzde (q5)', () => {
    const k = new SahneSession(proj([sp('kedi', [key('right', [b('sh_change_x', { N: 12 })])], { x: -150 })]))
    k.flag(); k.tick(2)
    for (let i = 0; i < 8; i++) k.tap('right')
    expect(isCorrect(Q('m2h8d2-q2'), at(k).x)).toBe(true)

    // gizle sonrası yeniden başlayınca elma hâlâ gizli
    const elma = new SahneSession(proj([sp('kedi', [flag([b('sh_repeat_until', { C: lt(b('sh_ypos'), -99) }, [b('sh_change_y', { N: -5 })]), b('sh_hide')])], { char: 'elma' })]))
    elma.flag(); elma.runUntilIdle()
    expect(at(elma).visible).toBe(false)
    elma.flag(); elma.tick(5)
    expect(at(elma).visible).toBe(false) // ikinci oyunda hâlâ görünmüyor
    expect(right('m2h8d2-q3')).toContain('göstermek')

    expect(isCorrect(Q('m2h8d2-q5'), (3 / 5) * 100)).toBe(true)
  })
})

describe('anlatımdaki yardımcı iddialar', () => {
  it('liste karşılaştırması büyük/küçük harfe duyarsız (Ders 14 anlatımı)', () => {
    const s = go(proj([sp('kedi', [flag([ifElse(eq('Doğu', 'doğu'), [say('eşit')], [say('farklı')])])])]))
    expect(say1(s)[0].text).toBe('eşit')
  })
  it('bekleme süreleri kareye yuvarlanır: 0,1 saniye = 3 kare, 0,05 saniye = 2 kare (Ders 3 anlatımındaki not)', () => {
    const run = (sec: number) => { const s = new SahneSession(proj([sp('kedi', [flag([repeat(10, [b('sh_next_costume'), wait(sec)])])])])); s.flag(); return s.runUntilIdle() }
    expect(run(0.1)).toBeGreaterThanOrEqual(30) // 10 tur x 3 kare (+1 başlangıç karesi)
    expect(run(0.1)).toBeLessThanOrEqual(31)
    expect(run(0.05)).toBeGreaterThanOrEqual(20) // 10 tur x 2 kare: saniyede 20 değil, 15 değişim
    expect(run(0.05)).toBeLessThanOrEqual(21)
  })
})

describe('toplu doğrulama', () => {
  it('her sayısal sorunun kimliği ve tek tek doğrulanan cevapları kapsanır', () => {
    // Bu dosyadaki testlerde Q("...") ile okunan sayısal sorular; kalanlar saf hesap/kavram sorusudur ve aşağıda listelenir.
    const hesapla: Record<string, number> = {
      'm2h2d1-q4': 1 / 0.1,
      'm2h5d2-q3': 4 * 1 + 2 * 5,
      'm2h6d1-q1': 3 - 2,
      'm2h6d2-q5': 401,
      'm2h8d2-q5': 60,
    }
    for (const [id, val] of Object.entries(hesapla)) expect(isCorrect(Q(id), val), id).toBe(true)
    for (const { q } of allQ.filter((x) => x.q.kind === 'numeric')) {
      expect(q.tolerance ?? 0, q.id).toBeLessThanOrEqual(0.05)
      expect(q.unit, q.id).toBeTruthy()
    }
  })
})

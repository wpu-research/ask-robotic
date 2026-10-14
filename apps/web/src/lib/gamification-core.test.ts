import { describe, expect, it } from 'vitest'
import { addDays, clampGame, emptyGame, goalXp, mergeGame, parseGame, reconcile, recordLesson, recordStep, streak, weekStrip, XP, type GameState } from './gamification-core'
import { bandForAge, recommend } from './learning-paths'

const D = '2026-10-14' // Çarşamba

function activeOn(days: string[]) {
  let s = emptyGame()
  for (const d of days) s = recordLesson(s, d, 1)
  return s
}

describe('XP', () => {
  it('ilk deneme 15, tekrar 10, ders 20; aynı ders aynı gün bir kez', () => {
    let s = recordStep(emptyGame(), D, true)
    s = recordStep(s, D, false)
    s = recordLesson(s, D, 7)
    s = recordLesson(s, D, 7)
    expect(s.xp).toBe(XP.firstTry + XP.retry + XP.lesson)
    expect(s.days[D]).toEqual({ xp: 45, correct: 2, lessons: 1 })
    expect(recordLesson(s, addDays(D, 1), 7).xp).toBe(s.xp + XP.lesson)
  })
  it('ders bitirmek şarj verir, en çok 2', () => {
    let s = emptyGame()
    for (let i = 0; i < 4; i++) s = recordLesson(s, D, i)
    expect(s.charges).toBe(2)
  })
})

describe('seri', () => {
  it('3 doğru adım günü aktif yapar, 2 yapmaz', () => {
    let s = emptyGame()
    s = recordStep(recordStep(s, D, true), D, true)
    expect(streak(s, D)).toBe(0)
    s = recordStep(s, D, true)
    expect(streak(s, D)).toBe(1)
  })
  it('bugün henüz çalışılmadıysa dünden sayar', () => {
    const s = activeOn([addDays(D, -2), addDays(D, -1)])
    expect(streak(s, D)).toBe(2)
  })
  it('boş gün seriyi kırar', () => {
    const s = activeOn([addDays(D, -3), addDays(D, -1)])
    expect(streak(s, D)).toBe(1)
  })
  it('şarj boş günü kapatır: seri sürer ama artmaz', () => {
    let s = activeOn([addDays(D, -3)]) // 1 şarj
    s = { ...s, checked: addDays(D, -3) }
    s = reconcile(s, addDays(D, -1)) // dün açtı: D-2 boş → şarj
    expect(s.frozen).toEqual([addDays(D, -2)])
    expect(s.charges).toBe(0)
    expect(streak(s, addDays(D, -1))).toBe(1)
    s = recordLesson(s, addDays(D, -1), 2)
    expect(streak(s, addDays(D, -1))).toBe(2)
  })
  it('şarj yetmezse seri kırılır ve şarj harcanmaz', () => {
    let s = activeOn([addDays(D, -5)])
    s = { ...s, charges: 1, checked: addDays(D, -5) }
    s = reconcile(s, D) // D-4..D-1 boş: ilkine şarj, sonra kırılır
    expect(s.frozen).toEqual([addDays(D, -4)])
    expect(streak(s, D)).toBe(0)
    expect(s.checked).toBe(addDays(D, -1))
  })
  it('seri yokken şarj harcanmaz', () => {
    let s: GameState = { ...emptyGame(), charges: 2, checked: addDays(D, -3) }
    s = reconcile(s, D)
    expect(s.charges).toBe(2)
  })
})

describe('yardımcılar', () => {
  it('hafta şeridi pazartesiden başlar', () => {
    const w = weekStrip(activeOn([D]), D)
    expect(w.map((x) => x.label)).toEqual(['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'])
    expect(w[2]).toMatchObject({ day: D, state: 'active', today: true })
    expect(w[3].state).toBe('future')
  })
  it('bozuk kayıt boş duruma düşer', () => {
    expect(parseGame('{bozuk')).toEqual(emptyGame())
    expect(parseGame(JSON.stringify({ xp: 5, charges: 9 })).charges).toBe(2)
  })
  it('günlük hedef', () => { expect(goalXp(20)).toBe(100); expect(goalXp(1)).toBe(25) })
})

describe('öğrenme yolu önerisi', () => {
  it('yaş bantları', () => {
    expect([5, 8, 10, 12, 16].map((a) => bandForAge(a).key)).toEqual(['minikler', 'kasifler', 'yapicilar', 'muhendis-adaylari', 'muhendisler'])
  })
  it('küçükler blokla başlar, ilgi ne olursa olsun', () => {
    expect(recommend({ age: 6, interests: ['ai'], level: 'yeni' }).course).toBe('scratchjr')
  })
  it('8-11: elektronik → Mikro Kart, deneyimli → Oyun Atölyesi, yoksa Scratch', () => {
    expect(recommend({ age: 9, interests: ['elektronik'], level: 'yeni' }).course).toBe('mikro-kart')
    expect(recommend({ age: 10, interests: ['oyun'], level: 'orta' }).course).toBe('oyun-atolyesi')
    expect(recommend({ age: 10, interests: ['kodlama'], level: 'yeni' }).course).toBe('scratch')
  })
  it('12+: AI (13+), robotik ileri, varsayılan Arduino; yaş kapısı korunur', () => {
    expect(recommend({ age: 15, interests: ['ai'], level: 'yeni' }).course).toBe('ai-muhendisligi')
    expect(recommend({ age: 12, interests: ['ai'], level: 'yeni' }).course).toBe('arduino-temelleri')
    expect(recommend({ age: 16, interests: ['robotik'], level: 'ileri' }).course).toBe('robotik')
    expect(recommend({ age: 13, interests: ['elektronik'], level: 'ileri' }).course).toBe('sensorler-ve-projeler')
    expect(recommend({ age: 14, interests: [], level: 'yeni' }).course).toBe('arduino-temelleri')
  })
})

describe('mergeGame (cihazlar arası birleştirme)', () => {
  const A = (() => { let s = recordLesson(emptyGame(), '2026-10-12', 1); s = recordStep(s, '2026-10-13', true); return reconcile(s, D) })()
  const B = (() => { let s = recordStep(emptyGame(), '2026-10-13', false); s = recordStep(s, '2026-10-13', false); s = recordLesson(s, D, 2); return { ...s, frozen: ['2026-10-01'] } })()

  it('gün başına alan alan max; xp = birleşik günlerin toplamı', () => {
    const m = mergeGame(A, B)
    expect(m.days['2026-10-12']).toEqual({ xp: 20, correct: 0, lessons: 1 })
    expect(m.days['2026-10-13']).toEqual({ xp: 20, correct: 2, lessons: 0 }) // xp max(15, 20), correct max(1, 2)
    expect(m.days[D]).toEqual({ xp: 20, correct: 0, lessons: 1 })
    expect(m.xp).toBe(60)
  })
  it('frozen/lessonXp birleşim, charges ve checked max', () => {
    const m = mergeGame(A, B)
    expect(m.frozen).toEqual(['2026-10-01'])
    expect(m.lessonXp).toEqual(['1@2026-10-12', `2@${D}`])
    expect(m.charges).toBe(1)
    expect(m.checked).toBe(A.checked)
  })
  it('değişmeli ve eşgüçlü: tekrar gönderim XP şişirmez', () => {
    expect(mergeGame(A, B)).toEqual(mergeGame(B, A))
    expect(mergeGame(A, A)).toEqual(A)
    const m = mergeGame(A, B)
    expect(mergeGame(m, B)).toEqual(m)
    expect(mergeGame(emptyGame(), emptyGame())).toEqual(emptyGame())
  })
  it('lessonXp gün sırasıyla son 200 kayıt', () => {
    const many = { ...emptyGame(), lessonXp: Array.from({ length: 150 }, (_, i) => `${i}@2026-01-01`) }
    const newer = { ...emptyGame(), lessonXp: Array.from({ length: 100 }, (_, i) => `${i}@2026-02-01`) }
    const m = mergeGame(many, newer)
    expect(m.lessonXp).toHaveLength(200)
    expect(m.lessonXp.filter((t) => t.endsWith('2026-02-01'))).toHaveLength(100)
  })
})

describe('clampGame (istemci girdisi)', () => {
  it('gün başı xp 2000 ile sınırlanır, toplam yeniden hesaplanır', () => {
    const g = clampGame({ xp: 1e9, days: { [D]: { xp: 999999, correct: 5000, lessons: -3 } }, frozen: [], charges: 2, lessonXp: [] }, D)
    expect(g.days[D]).toEqual({ xp: 2000, correct: 200, lessons: 0 })
    expect(g.xp).toBe(2000)
  })
  it('gelecek günler, bozuk anahtarlar ve etiketler atılır', () => {
    const g = clampGame({ days: { '2099-01-01': { xp: 10, correct: 1, lessons: 0 }, bozuk: { xp: 5 }, [D]: { xp: 15, correct: 1, lessons: 0 } }, frozen: ['2099-01-01', 'x', '2026-10-01'], lessonXp: ['1@2099-01-01', 'abc', '3@2026-10-01'], charges: 99, checked: '2099-01-01' }, D)
    expect(Object.keys(g.days)).toEqual([D])
    expect(g.frozen).toEqual(['2026-10-01'])
    expect(g.lessonXp).toEqual(['3@2026-10-01'])
    expect(g.charges).toBe(2)
    expect(g.checked).toBeUndefined()
  })
  it('çöp girdi boş oyundur', () => {
    expect(clampGame('saçma', D)).toEqual(emptyGame())
    expect(clampGame(null, D)).toEqual(emptyGame())
  })
})

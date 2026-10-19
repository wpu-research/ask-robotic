// Ünite tabanlı derslerin içerik denetimi (testler kullanır): iki dil aynı yapıda, HTML etiket dizileri eşit, kodun satır
// sayısı eşit (yalnız yorumlar çevrilir), 4 seçenekli 4 soruluk quiz, İngilizcede Türkçe karakter yok, uzun tire yok.
// Boş dizi = sorun yok; her sorun "ünite n: açıklama" biçiminde döner.
import { partBySlug } from '@/lib/muhendislik/catalog'
import type { CourseUnit } from './types'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')
const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/

export function checkUnits<S extends string>(units: readonly CourseUnit<S>[], simIds: readonly S[]): string[] {
  const err: string[] = []
  const e = (n: number, m: string) => err.push(`ünite ${n}: ${m}`)
  units.forEach((u, i) => {
    if (u.n !== i + 1) e(u.n, `sıra ${i + 1} olmalı`)
    if (!u.sims.length) e(u.n, 'simülasyon yok')
    for (const s of u.sims) if (!simIds.includes(s)) e(u.n, `bilinmeyen simülasyon ${s}`)
    for (const p of u.parts) if (!partBySlug(p)) e(u.n, `bilinmeyen parça ${p}`)
    for (const l of ['tr', 'en'] as const) {
      const t = u[l]
      if (t.title.length < 10) e(u.n, `${l} başlık kısa`)
      if (t.summary.length < 30) e(u.n, `${l} özet kısa`)
      if (t.notes.length < 800) e(u.n, `${l} notlar kısa (${t.notes.length})`)
      if (t.lab.length < 80) e(u.n, `${l} kendin dene kısa`)
      if (t.pitfalls.length < 4) e(u.n, `${l} en az 4 sık hata`)
      if (t.goals.length < 3) e(u.n, `${l} en az 3 hedef`)
      if (!t.code.length) e(u.n, `${l} kod yok`)
      if (t.quiz.length !== 4) e(u.n, `${l} quiz 4 soru olmalı`)
      for (const q of t.quiz) if (q.options.length !== 4 || q.answer < 0 || q.answer > 3 || !q.why) e(u.n, `${l} quiz biçimi: ${q.q}`)
      if ((t.notes + t.se + t.lab + t.summary).includes('—')) e(u.n, `${l} uzun tire`)
    }
    if (u.tr.goals.length !== u.en.goals.length) e(u.n, 'hedef sayısı farklı')
    if (u.tr.pitfalls.length !== u.en.pitfalls.length) e(u.n, 'sık hata sayısı farklı')
    if (u.tr.code.length !== u.en.code.length) e(u.n, 'kod bloğu sayısı farklı')
    if (tags(u.tr.notes) !== tags(u.en.notes)) e(u.n, 'notlar HTML etiket dizisi farklı')
    if (tags(u.tr.se) !== tags(u.en.se)) e(u.n, 'YM bağlantısı HTML etiket dizisi farklı')
    if (u.tr.quiz.map((q) => q.answer).join() !== u.en.quiz.map((q) => q.answer).join()) e(u.n, 'quiz cevapları farklı')
    u.tr.code.forEach((c, k) => { const o = u.en.code[k]; if (o && c.src.split('\n').length !== o.src.split('\n').length) e(u.n, `kod ${k} satır sayısı farklı`) })
    const en = [u.en.title, u.en.summary, ...u.en.goals, u.en.lab, ...u.en.pitfalls, u.en.notes, u.en.se, ...u.en.quiz.flatMap((q) => [q.q, ...q.options, q.why])]
    for (const s of en) if (TR_CHARS.test(s.replace(/Türkiye/g, ''))) e(u.n, `İngilizcede Türkçe karakter: ${s.slice(0, 60)}`)
    if (u.py) {
      if (!/\.py$/.test(u.py.file)) e(u.n, 'py dosya adı')
      for (const [c, tr, en2] of u.py.code) { if (TR_CHARS.test(c)) e(u.n, `py kodunda Türkçe karakter: ${c}`); if ((tr ? 1 : 0) !== (en2 ? 1 : 0)) e(u.n, `py yorumu tek dilde: ${c}`); if (en2 && TR_CHARS.test(en2)) e(u.n, `py EN yorumunda Türkçe: ${en2}`) }
    }
  })
  const used = new Set(units.flatMap((u) => u.sims))
  for (const s of simIds) if (!used.has(s)) err.push(`simülasyon hiçbir ünitede yok: ${s}`)
  return err
}

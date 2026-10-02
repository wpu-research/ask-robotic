// Eval (değerlendirme) etkinliği. Test edilen şey bir MODEL DEĞİL, kural tabanlı küçük bir sınıflandırıcıdır;
// doğruluk, hedef etiketlere karşı gerçekten hesaplanır.
import { trLower, words } from './text'

export type TargetId = 'sentiment' | 'engel'
export interface EvalCase { text: string; expected: string }
export interface Target { id: TargetId; title: string; labels: string[]; about: string; placeholder: string; run: (text: string) => string }

const POS = new Set(['güzel', 'harika', 'mükemmel', 'süper', 'iyi', 'başarılı', 'sevdim', 'beğendim', 'eğlenceli', 'kolay', 'hızlı', 'faydalı'])
const NEG = new Set(['kötü', 'berbat', 'yavaş', 'zor', 'sıkıcı', 'bozuk', 'hata', 'sevmedim', 'beğenmedim', 'yetersiz', 'korkunç', 'kullanışsız'])

export function sentiment(text: string): string {
  const w = words(text)
  let s = 0
  w.forEach((x, i) => {
    const p = POS.has(x) ? 1 : NEG.has(x) ? -1 : 0
    s += w[i + 1] === 'değil' ? -p : p
  })
  return s > 0 ? 'olumlu' : s < 0 ? 'olumsuz' : 'belirsiz'
}

/** "mesafe=25 hız=40" → dur / yavaşla / devam. Hız HESABA KATILMAZ (bilinçli eksik: öğrenci testle bulacak). */
export function engel(text: string): string {
  const m = /mesafe\s*=\s*(\d+(?:\.\d+)?)/i.exec(trLower(text))
  if (!m) return 'hata'
  const d = parseFloat(m[1]!)
  return d < 20 ? 'dur' : d < 50 ? 'yavaşla' : 'devam'
}

export const TARGETS: Record<TargetId, Target> = {
  sentiment: { id: 'sentiment', title: 'Yorum duygu sınıflandırıcısı (kural tabanlı)', labels: ['olumlu', 'olumsuz', 'belirsiz'], placeholder: 'Bu uygulama çok güzel', about: 'Olumlu ve olumsuz sözcük listelerine bakar; "değil" kelimesi bir önceki sözcüğün anlamını ters çevirir.', run: sentiment },
  engel: { id: 'engel', title: 'Robot engel kararı (kural tabanlı)', labels: ['dur', 'yavaşla', 'devam', 'hata'], placeholder: 'mesafe=25 hız=40', about: 'Girdi "mesafe=<cm> hız=<cm/sn>" biçimindedir. Karar: dur, yavaşla ya da devam.', run: engel },
}

export interface EvalReport {
  total: number; correct: number; accuracy: number
  rows: { text: string; expected: string; got: string; ok: boolean }[]
  recall: Record<string, { n: number; ok: number }>
  duplicates: number
}

export function runEval(target: TargetId, cases: EvalCase[]): EvalReport {
  const t = TARGETS[target]
  const valid = cases.filter((c) => c.text.trim() !== '' && c.expected.trim() !== '')
  const rows = valid.map((c) => { const got = t.run(c.text); return { text: c.text, expected: c.expected, got, ok: got === c.expected } })
  const recall: EvalReport['recall'] = {}
  for (const r of rows) { const e = (recall[r.expected] ??= { n: 0, ok: 0 }); e.n++; if (r.ok) e.ok++ }
  const seen = new Set<string>(); let dup = 0
  for (const c of valid) { const k = trLower(c.text.trim()); if (seen.has(k)) dup++; seen.add(k) }
  const correct = rows.filter((r) => r.ok).length
  return { total: rows.length, correct, accuracy: rows.length ? correct / rows.length : 0, rows, recall, duplicates: dup }
}

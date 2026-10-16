// Eval (değerlendirme) etkinliği. Test edilen şey bir MODEL DEĞİL, kural tabanlı küçük bir sınıflandırıcıdır;
// doğruluk, hedef etiketlere karşı gerçekten hesaplanır.
import { lowerOf, words, type ContentLang } from './text'

export type TargetId = 'sentiment' | 'engel'
export interface EvalCase { text: string; expected: string }
export interface Target { id: TargetId; title: string; labels: string[]; about: string; placeholder: string; run: (text: string, lang?: ContentLang) => string; en: { title: string; about: string; placeholder: string } }

/** Etiket kimlikleri Türkçedir (kayıtlı vakalarda saklanır); İngilizce görünen adları. */
export const LABEL_EN: Readonly<Record<string, string>> = { olumlu: 'positive', olumsuz: 'negative', belirsiz: 'unclear', dur: 'stop', 'yavaşla': 'slow down', devam: 'continue', hata: 'error' }

const POS = new Set(['güzel', 'harika', 'mükemmel', 'süper', 'iyi', 'başarılı', 'sevdim', 'beğendim', 'eğlenceli', 'kolay', 'hızlı', 'faydalı'])
const NEG = new Set(['kötü', 'berbat', 'yavaş', 'zor', 'sıkıcı', 'bozuk', 'hata', 'sevmedim', 'beğenmedim', 'yetersiz', 'korkunç', 'kullanışsız'])

const POS_EN = new Set(['good', 'great', 'excellent', 'super', 'awesome', 'nice', 'successful', 'love', 'loved', 'liked', 'fun', 'easy', 'fast', 'useful', 'helpful'])
const NEG_EN = new Set(['bad', 'terrible', 'awful', 'slow', 'hard', 'boring', 'broken', 'buggy', 'hate', 'hated', 'disliked', 'poor', 'horrible', 'useless'])
const NEGATORS_EN = new Set(['not', "don't", 'dont', "didn't", 'didnt', "isn't", 'isnt', 'never', 'no'])

/** Türkçede "değil" bir SONRAKİ konumdadır ("güzel değil"); İngilizcede olumsuzlayıcı bir ÖNCEKİ konumdadır ("not good"). */
export function sentiment(text: string, lang: ContentLang = 'tr'): string {
  let s = 0
  if (lang === 'en') {
    const w = lowerOf(text, 'en').match(/[\p{L}\p{N}']+/gu) ?? []
    w.forEach((x, i) => {
      const p = POS_EN.has(x) ? 1 : NEG_EN.has(x) ? -1 : 0
      s += i > 0 && NEGATORS_EN.has(w[i - 1]!) ? -p : p
    })
    return s > 0 ? 'olumlu' : s < 0 ? 'olumsuz' : 'belirsiz'
  }
  const w = words(text)
  w.forEach((x, i) => {
    const p = POS.has(x) ? 1 : NEG.has(x) ? -1 : 0
    s += w[i + 1] === 'değil' ? -p : p
  })
  return s > 0 ? 'olumlu' : s < 0 ? 'olumsuz' : 'belirsiz'
}

/** "mesafe=25 hız=40" → dur / yavaşla / devam. Hız HESABA KATILMAZ (bilinçli eksik: öğrenci testle bulacak). */
export function engel(text: string, lang: ContentLang = 'tr'): string {
  const m = (lang === 'en' ? /(?:mesafe|distance)\s*=\s*(\d+(?:\.\d+)?)/i : /mesafe\s*=\s*(\d+(?:\.\d+)?)/i).exec(lowerOf(text, lang))
  if (!m) return 'hata'
  const d = parseFloat(m[1]!)
  return d < 20 ? 'dur' : d < 50 ? 'yavaşla' : 'devam'
}

export const TARGETS: Record<TargetId, Target> = {
  sentiment: { id: 'sentiment', title: 'Yorum duygu sınıflandırıcısı (kural tabanlı)', labels: ['olumlu', 'olumsuz', 'belirsiz'], placeholder: 'Bu uygulama çok güzel', about: 'Olumlu ve olumsuz sözcük listelerine bakar; "değil" kelimesi bir önceki sözcüğün anlamını ters çevirir.', run: sentiment,
    en: { title: 'Comment sentiment classifier (rule-based)', placeholder: 'This app is great', about: 'It looks at lists of positive and negative words; "not" (or "don\'t", "never"…) flips the meaning of the next word.' } },
  engel: { id: 'engel', title: 'Robot engel kararı (kural tabanlı)', labels: ['dur', 'yavaşla', 'devam', 'hata'], placeholder: 'mesafe=25 hız=40', about: 'Girdi "mesafe=<cm> hız=<cm/sn>" biçimindedir. Karar: dur, yavaşla ya da devam.', run: engel,
    en: { title: 'Robot obstacle decision (rule-based)', placeholder: 'distance=25 speed=40', about: 'Input has the form "distance=<cm> speed=<cm/s>". Decision: stop, slow down or continue.' } },
}

export interface EvalReport {
  total: number; correct: number; accuracy: number
  rows: { text: string; expected: string; got: string; ok: boolean }[]
  recall: Record<string, { n: number; ok: number }>
  duplicates: number
}

export function runEval(target: TargetId, cases: EvalCase[], lang: ContentLang = 'tr'): EvalReport {
  const t = TARGETS[target]
  const valid = cases.filter((c) => c.text.trim() !== '' && c.expected.trim() !== '')
  const rows = valid.map((c) => { const got = t.run(c.text, lang); return { text: c.text, expected: c.expected, got, ok: got === c.expected } })
  const recall: EvalReport['recall'] = {}
  for (const r of rows) { const e = (recall[r.expected] ??= { n: 0, ok: 0 }); e.n++; if (r.ok) e.ok++ }
  const seen = new Set<string>(); let dup = 0
  for (const c of valid) { const k = lowerOf(c.text.trim(), lang); if (seen.has(k)) dup++; seen.add(k) }
  const correct = rows.filter((r) => r.ok).length
  return { total: rows.length, correct, accuracy: rows.length ? correct / rows.length : 0, rows, recall, duplicates: dup }
}

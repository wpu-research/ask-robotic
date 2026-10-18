// Değerlendirme tezgâhı (saf mantık): sekiz soruluk test kümesinde iki sistemin cevapları; tam eşleşme, normalize
// eşleşme, token F1, rubrik ve kaynağa dayanaklılık (cevaptaki her sayı kaynak notta geçiyor mu) ölçütleri.
// LLM hakem yalnız prompt olarak kurulur, çalıştırılmaz. Notlar lib/llm/docs.ts'tekilerdir.
import { lowerOf, type ContentLang } from '@/lib/ai/text'
import { notesFor } from './docs'

export interface EvalCase { q: string; gold: string; source: string; a: string; b: string }
export type SystemId = 'a' | 'b'
export type MetricId = 'em' | 'nm' | 'f1' | 'rubrik' | 'dayanak'
export const METRICS: MetricId[] = ['em', 'nm', 'f1', 'rubrik', 'dayanak']
export const METRIC_TEXT: Record<MetricId, { tr: string; en: string }> = {
  em: { tr: 'Tam eşleşme', en: 'Exact match' },
  nm: { tr: 'Normalize eşleşme', en: 'Normalised match' },
  f1: { tr: 'Token F1', en: 'Token F1' },
  rubrik: { tr: 'Rubrik (0–4)', en: 'Rubric (0–4)' },
  dayanak: { tr: 'Dayanaklılık', en: 'Groundedness' },
}

export const CASES: Record<ContentLang, EvalCase[]> = {
  tr: [
    { q: 'Dönem projesinin not ağırlığı nedir?', gold: 'yüzde 45', source: 'kurallar', a: 'yüzde 45 [kurallar]', b: 'Dönem projesi notun yüzde 45\'idir, derse katılım da yüzde 5 ekler.' },
    { q: 'MPU6050\'nin varsayılan I2C adresi nedir?', gold: '0x68', source: 'i2c', a: '0x68 [i2c]', b: 'Varsayılan adres 0x68\'dir; AD0 bacağı yüksekse 0x69 olur.' },
    { q: '5 V\'tan 20 mA ile sürülen kırmızı LED için kaç ohm direnç gerekir?', gold: '150 ohm', source: 'ohm', a: '150 ohm [ohm]', b: '220 ohm kullanılır, daha güvenlidir.' },
    { q: 'LiPo hücre gerilimi en düşük kaç volta inebilir?', gold: '3,0 V', source: 'lipo', a: '3,0 V [lipo]', b: 'Hücre 3,0 V\'un altına inmemeli. Depolama için 3,8 V uygundur.' },
    { q: 'I2C hızlı kip kaç kHz\'dir?', gold: '400 kHz', source: 'i2c', a: '400 kHz [i2c]', b: 'Hızlı kip 1 MHz\'dir.' },
    { q: 'Tamamlayıcı süzgeçte jiroskop teriminin katsayısı nedir?', gold: '0,98', source: 'fuzyon', a: '0,98 [fuzyon]', b: 'Genelde 0,98 alınır ama 0,95 de olur.' },
    { q: 'Geç teslimde günde yüzde kaç kesilir?', gold: 'yüzde 10', source: 'kurallar', a: 'Yüzde 10.', b: 'Her gün için yüzde 10 kesilir ve üç günden sonra proje kabul edilmez.' },
    { q: 'Proje ekipleri en fazla kaç kişidir?', gold: 'üç kişi', source: 'kurallar', a: 'En fazla üç kişi [kurallar]', b: 'Ekipler 4 kişiye kadar olabilir.' },
  ],
  en: [
    { q: 'What is the weight of the term project in the grade?', gold: '45 percent', source: 'kurallar', a: '45 percent [kurallar]', b: 'The term project is 45 percent of the grade, and class participation adds 5 percent.' },
    { q: 'What is the default I2C address of the MPU6050?', gold: '0x68', source: 'i2c', a: '0x68 [i2c]', b: 'The default address is 0x68; if the AD0 pin is high it becomes 0x69.' },
    { q: 'What resistor does a red LED driven from 5 V at 20 mA need?', gold: '150 ohms', source: 'ohm', a: '150 ohms [ohm]', b: 'Use 220 ohms, it is safer.' },
    { q: 'What is the lowest voltage a LiPo cell may reach?', gold: '3.0 V', source: 'lipo', a: '3.0 V [lipo]', b: 'The cell must not go below 3.0 V. About 3.8 V is right for storage.' },
    { q: 'How many kHz is I2C fast mode?', gold: '400 kHz', source: 'i2c', a: '400 kHz [i2c]', b: 'Fast mode is 1 MHz.' },
    { q: 'What is the gyroscope coefficient in the complementary filter?', gold: '0.98', source: 'fuzyon', a: '0.98 [fuzyon]', b: 'Usually 0.98, but 0.95 also works.' },
    { q: 'What percentage is deducted per day for late submission?', gold: '10 percent', source: 'kurallar', a: '10 percent.', b: 'Late submissions lose 10 percent per day and after three days the project is not accepted.' },
    { q: 'At most how many people can a project team have?', gold: 'three people', source: 'kurallar', a: 'At most three people [kurallar]', b: 'Teams can have up to 4 people.' },
  ],
}

/** Küçük harf (Türkçe I/İ doğru), kaynak etiketi ve noktalama atılır; sayıların içindeki nokta ve virgül korunur. */
export function normalize(s: string, lang: ContentLang = 'tr'): string {
  return lowerOf(s, lang).normalize('NFKC')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^\p{L}\p{N}\s%.,]/gu, ' ')
    .replace(/(?<!\d)[.,]|[.,](?!\d)/g, ' ')
    .split(/\s+/).filter(Boolean).join(' ')
}
export const exactMatch = (pred: string, gold: string): number => (pred.trim() === gold.trim() ? 1 : 0)
export const normalizedMatch = (pred: string, gold: string, lang: ContentLang = 'tr'): number => (normalize(pred, lang) === normalize(gold, lang) ? 1 : 0)

export function tokenF1(pred: string, gold: string, lang: ContentLang = 'tr'): number {
  const p = normalize(pred, lang).split(' ').filter(Boolean), g = normalize(gold, lang).split(' ').filter(Boolean)
  const count = new Map<string, number>()
  for (const t of g) count.set(t, (count.get(t) ?? 0) + 1)
  let common = 0
  for (const t of p) { const c = count.get(t) ?? 0; if (c > 0) { common++; count.set(t, c - 1) } }
  if (common === 0) return 0
  const precision = common / p.length, recall = common / g.length
  return (2 * precision * recall) / (precision + recall)
}

/** Metindeki sayılar (0x68 gibi onaltılıklar dahil; MPU6050, AD0 gibi adların içindekiler hariç), ondalık virgül noktaya çevrilmiş. */
export function numbersIn(s: string): string[] {
  return (s.replace(/\[[^\]]*\]/g, ' ').match(/(?<![\p{L}\d])(?:0x[0-9a-f]+|\d+(?:[.,]\d+)?)/giu) ?? []).map((n) => n.toLowerCase().replace(',', '.'))
}

export interface Grounding { ok: boolean; unsupported: string[] }
/** Dayanaklılık: cevaptaki her sayı kaynak notta geçmeli (anlam denetimi değil, uydurma sayıyı yakalayan ucuz kontrol). */
export function groundedness(pred: string, sourceId: string, lang: ContentLang = 'tr'): Grounding {
  const note = notesFor(lang).find((n) => n.id === sourceId)
  const have = new Set(numbersIn(note ? `${note.title} ${note.text}` : ''))
  const unsupported = [...new Set(numbersIn(pred).filter((n) => !have.has(n)))]
  return { ok: unsupported.length === 0, unsupported }
}

export interface RubricScore { dogru: boolean; kaynak: boolean; kisa: boolean; dayanakli: boolean; total: number }
export const RUBRIC_TEXT: Record<keyof Omit<RubricScore, 'total'>, { tr: string; en: string }> = {
  dogru: { tr: 'Doğru: altın cevabı içeriyor', en: 'Correct: contains the gold answer' },
  kaynak: { tr: 'Kaynak gösteriyor: [not] etiketi', en: 'Cites a source: [note] tag' },
  kisa: { tr: 'Kısa: en fazla 25 kelime', en: 'Concise: at most 25 words' },
  dayanakli: { tr: 'Dayanaklı: uydurma sayı yok', en: 'Grounded: no made-up numbers' },
}
export function rubric(c: EvalCase, pred: string, lang: ContentLang = 'tr'): RubricScore {
  const np = ` ${normalize(pred, lang)} `, ng = normalize(c.gold, lang)
  const dogru = np.includes(` ${ng} `)
  const kaynak = /\[[a-z]+(?:#\d+)?\]/.test(pred)
  const kisa = pred.split(/\s+/).filter(Boolean).length <= 25
  const dayanakli = groundedness(pred, c.source, lang).ok
  return { dogru, kaynak, kisa, dayanakli, total: [dogru, kaynak, kisa, dayanakli].filter(Boolean).length }
}

export interface CaseResult { em: number; nm: number; f1: number; rubric: RubricScore; ground: Grounding }
export interface SystemReport { rows: CaseResult[]; mean: Record<MetricId, number> }
export function evaluate(system: SystemId, lang: ContentLang = 'tr'): SystemReport {
  const rows = CASES[lang].map((c) => {
    const pred = c[system]
    return { em: exactMatch(pred, c.gold), nm: normalizedMatch(pred, c.gold, lang), f1: tokenF1(pred, c.gold, lang), rubric: rubric(c, pred, lang), ground: groundedness(pred, c.source, lang) }
  })
  const avg = (f: (r: CaseResult) => number) => rows.reduce((s, r) => s + f(r), 0) / rows.length
  return { rows, mean: { em: avg((r) => r.em), nm: avg((r) => r.nm), f1: avg((r) => r.f1), rubrik: avg((r) => r.rubric.total), dayanak: avg((r) => (r.ground.ok ? 1 : 0)) } }
}

/** LLM hakem promptu (gösterilir, çalıştırılmaz): rubrik, kaynak ve JSON çıktı. Hakemin de değerlendirilmesi gerekir. */
export function judgePrompt(c: EvalCase, pred: string, lang: ContentLang = 'tr'): string {
  const note = notesFor(lang).find((n) => n.id === c.source)
  return lang === 'en'
    ? `You are grading an answer against a source and a rubric. Grade only what is asked.\n<source id="${c.source}">${note?.text ?? ''}</source>\n<question>${c.q}</question>\n<reference>${c.gold}</reference>\n<answer>${pred}</answer>\nRubric (1 point each): correct, cites a source, concise, every claim supported by the source.\nThink about each criterion, then reply with JSON only: {"correct": 0|1, "cites": 0|1, "concise": 0|1, "grounded": 0|1, "reason": "<one sentence>"}`
    : `Bir cevabı kaynağa ve rubriğe göre puanlıyorsun. Yalnız sorulanı puanla.\n<kaynak id="${c.source}">${note?.text ?? ''}</kaynak>\n<soru>${c.q}</soru>\n<referans>${c.gold}</referans>\n<cevap>${pred}</cevap>\nRubrik (her biri 1 puan): doğru, kaynak gösteriyor, kısa, her iddia kaynakta var.\nHer ölçütü düşün, sonra yalnız JSON döndür: {"dogru": 0|1, "kaynak": 0|1, "kisa": 0|1, "dayanakli": 0|1, "gerekce": "<tek cümle>"}`
}

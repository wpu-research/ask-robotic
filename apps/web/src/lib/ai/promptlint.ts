// Kural tabanlı prompt denetleyicisi. BİR YAPAY ZEKÂ DEĞİL: anahtar sözcüklere ve biçime bakar, anlamı anlamaz.
// Amaç: iyi bir prompt'ta bulunması gereken parçaları (görev, rol, bağlam, örnek, biçim, kısıt) fark ettirmek.
import { lowerOf, trLower, words, type ContentLang } from './text'

export interface LintRule { id: string; label: string; weight: number; hint: string; test: (raw: string, lower: string, w: string[]) => boolean }

const VERBS = ['yaz', 'açıkla', 'özetle', 'listele', 'sınıflandır', 'çevir', 'karşılaştır', 'üret', 'hazırla', 'bul', 'düzelt', 'oluştur', 'anlat', 'hesapla', 'çıkar', 'incele', 'tahmin', 'öner', 'sırala', 'say', 'ver', 'belirle', 'değerlendir']
const hasAny = (lower: string, list: string[]) => list.some((x) => lower.includes(x))

export const RULES: LintRule[] = [
  { id: 'gorev', label: 'Açık görev (ne yapılacak?)', weight: 20, hint: 'Bir eylem fiiliyle başla: "özetle", "sınıflandır", "listele"…',
    test: (_r, _l, w) => w.some((x) => VERBS.some((v) => x === v || (x.startsWith(v) && x.length <= v.length + 4))) },
  { id: 'rol', label: 'Rol (modelin kim olduğu)', weight: 15, hint: 'Örn. "Sen deneyimli bir robotik öğretmenisin."',
    test: (_r, l) => /(^|[^\p{L}])sen\s+(\S+\s+){0,2}bir\s+\S+/u.test(l) || hasAny(l, ['rolün', 'gibi davran', 'olarak davran', 'rolünde']) },
  { id: 'baglam', label: 'Bağlam (kim için, ne amaçla?)', weight: 15, hint: 'En az 12 kelime yaz ve hedef kitleyi ya da amacı belirt ("13 yaşındaki öğrenciler için…").',
    test: (_r, l, w) => w.length >= 12 && hasAny(l, ['için', 'çünkü', 'amaç', 'hedef', 'okuyucu', 'öğrenci', 'yaş', 'seviye', 'kitle', 'bağlam', 'durum']) },
  { id: 'ornek', label: 'Örnek (nasıl bir cevap istiyorsun?)', weight: 20, hint: 'Bir örnek ekle: "Örnek: Girdi: … Çıktı: …"',
    test: (r, l) => l.includes('örnek') || (/girdi\s*:/.test(l) && /çıktı\s*:/.test(l)) || (r.match(/→|->/g) ?? []).length >= 2 },
  { id: 'bicim', label: 'Çıktı biçimi', weight: 20, hint: 'Biçimi söyle: madde işareti, tablo, JSON, "en fazla 3 cümle"…',
    test: (_r, l) => hasAny(l, ['madde', 'tablo', 'json', 'satır', 'cümle', 'paragraf', 'başlık', 'kelime', 'numaralı', 'csv', 'liste']) },
  { id: 'kisit', label: 'Kısıt (sınır koyma)', weight: 10, hint: 'Sınır koy: "en fazla", "yalnızca", "… kullanma".',
    test: (_r, l) => hasAny(l, ['en fazla', 'en az', 'yalnız', 'sadece', 'kullanma', 'asla', 'dışında', 'geçme', 'aşma']) },
]

// İngilizce kip: aynı kurallar (aynı kimlik ve ağırlık), İngilizce anahtar sözcüklerle. Etiket/ipucu metinleri arayüz sözlüğündedir.
const VERBS_EN = ['write', 'explain', 'summarize', 'summarise', 'list', 'classify', 'translate', 'compare', 'generate', 'create', 'prepare', 'find', 'fix', 'describe', 'calculate', 'extract', 'review', 'predict', 'suggest', 'sort', 'count', 'give', 'identify', 'evaluate', 'rewrite', 'answer']
const hasWord = (w: string[], list: string[]) => w.some((x) => list.includes(x))
export const RULES_EN: LintRule[] = [
  { id: 'gorev', label: 'Clear task (what to do?)', weight: 20, hint: 'Start with an action verb: "summarize", "classify", "list"…',
    test: (_r, _l, w) => w.some((x) => VERBS_EN.some((v) => x === v || (x.startsWith(v) && x.length <= v.length + 3))) },
  { id: 'rol', label: 'Role (who the model is)', weight: 15, hint: 'E.g. "You are an experienced robotics teacher."',
    test: (_r, l) => /(^|[^\p{L}])you\s+are\s+(\S+\s+){0,2}(a|an|the)\s+\S+/u.test(l) || hasAny(l, ['your role', 'act as', 'acting as', 'pretend to be', 'role of']) },
  { id: 'baglam', label: 'Context (for whom, for what purpose?)', weight: 15, hint: 'Write at least 12 words and name the audience or goal ("for 13-year-old students…").',
    test: (_r, _l, w) => w.length >= 12 && hasWord(w, ['for', 'because', 'goal', 'purpose', 'aim', 'reader', 'readers', 'student', 'students', 'age', 'level', 'audience', 'context', 'situation', 'beginners']) },
  { id: 'ornek', label: 'Example (what kind of answer do you want?)', weight: 20, hint: 'Add an example: "Example: Input: … Output: …"',
    test: (r, l) => l.includes('example') || l.includes('e.g.') || (/input\s*:/.test(l) && /output\s*:/.test(l)) || (r.match(/→|->/g) ?? []).length >= 2 },
  { id: 'bicim', label: 'Output format', weight: 20, hint: 'Name the format: bullet points, table, JSON, "at most 3 sentences"…',
    test: (_r, _l, w) => hasWord(w, ['bullet', 'bullets', 'table', 'json', 'line', 'lines', 'sentence', 'sentences', 'paragraph', 'paragraphs', 'heading', 'headings', 'word', 'words', 'numbered', 'csv', 'list']) },
  { id: 'kisit', label: 'Constraint (set a limit)', weight: 10, hint: 'Set a limit: "at most", "only", "do not use…".',
    test: (_r, l) => hasAny(l, ['at most', 'at least', 'only', 'do not', "don't", 'never', 'except', 'no more than', 'must not', 'without', 'maximum', 'limit']) },
]
export const rulesFor = (lang: ContentLang = 'tr'): LintRule[] => (lang === 'en' ? RULES_EN : RULES)

export interface LintResult { score: number; wordCount: number; rules: Record<string, boolean>; missing: LintRule[]; tooShort: boolean }

export function lintPrompt(prompt: string, lang: ContentLang = 'tr'): LintResult {
  const lower = lowerOf(prompt, lang)
  const w = words(prompt, lang)
  const RULES = rulesFor(lang)
  const rules: Record<string, boolean> = {}
  let score = 0
  for (const r of RULES) { const ok = w.length > 0 && r.test(prompt, lower, w); rules[r.id] = ok; if (ok) score += r.weight }
  const tooShort = w.length < 6
  if (tooShort) score = Math.min(score, 30) // çok kısa istem asla yüksek puan almaz
  return { score, wordCount: w.length, rules, missing: RULES.filter((r) => !rules[r.id]), tooShort }
}

export const mentions = (prompt: string, ...needles: string[]): boolean => {
  const l = trLower(prompt)
  return needles.every((n) => l.includes(trLower(n)))
}
export const mentionsAny = (prompt: string, ...needles: string[]): boolean => {
  const l = trLower(prompt)
  return needles.some((n) => l.includes(trLower(n)))
}

export interface PromptTask { id: string; title: string; brief: string; topic: string[]; en: { title: string; brief: string; topic: string[] } }
export const PROMPT_TASKS: Record<string, PromptTask> = {
  ozet: { id: 'ozet', title: 'Duyuru özeti', brief: 'Bir robot kulübü duyurusunu 13 yaşındaki öğrenciler için özetletecek bir prompt yaz.', topic: ['duyuru', 'özet'], en: { title: 'Announcement summary', brief: 'Write a prompt that gets a robotics club announcement summarized for 13-year-old students.', topic: ['announcement', 'summar'] } },
  siniflandir: { id: 'siniflandir', title: 'Yorum sınıflandırma', brief: 'Öğrenci yorumlarını "olumlu" ya da "olumsuz" diye sınıflandırtacak bir prompt yaz.', topic: ['yorum', 'olumlu'], en: { title: 'Comment classification', brief: 'Write a prompt that gets student comments classified as "positive" or "negative".', topic: ['comment', 'positive'] } },
  kod: { id: 'kod', title: 'Hata bulma', brief: 'Bir Python fonksiyonundaki hatayı bulup açıklatacak bir prompt yaz.', topic: ['python', 'hata'], en: { title: 'Bug finding', brief: 'Write a prompt that gets the bug in a Python function found and explained.', topic: ['python', 'bug'] } },
  json: { id: 'json', title: 'JSON çıkarımı', brief: 'Bir öğrenci yorumundan duygu ve konu bilgisini JSON olarak çıkartacak bir prompt yaz.', topic: ['json'], en: { title: 'JSON extraction', brief: 'Write a prompt that extracts the sentiment and topic of a student comment as JSON.', topic: ['json'] } },
  serbest: { id: 'serbest', title: 'Serbest', brief: 'İstediğin bir görev için prompt yaz.', topic: [], en: { title: 'Free', brief: 'Write a prompt for any task you like.', topic: [] } },
}
export const onTopic = (task: string, prompt: string, lang: ContentLang = 'tr'): boolean => {
  const t = PROMPT_TASKS[task]
  if (!t) return true
  const topic = lang === 'en' ? t.en.topic : t.topic
  return topic.length === 0 || topic.every((x) => (lang === 'en' ? lowerOf(prompt, 'en').includes(x) : mentions(prompt, x)))
}

/** JSON çıktı denetimi (yapılandırılmış çıktı dersi için): yanıt geçerli JSON mu ve istenen anahtarlar var mı? */
export function checkJson(text: string, keys: string[]): { ok: boolean; error?: string } {
  try {
    const o: unknown = JSON.parse(text)
    if (o === null || typeof o !== 'object' || Array.isArray(o)) return { ok: false, error: 'nesne ({...}) olmalı' }
    const miss = keys.filter((k) => !(k in (o as Record<string, unknown>)))
    return miss.length ? { ok: false, error: `eksik anahtar: ${miss.join(', ')}` } : { ok: true }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

// Kural tabanlı prompt denetleyicisi. BİR YAPAY ZEKÂ DEĞİL: anahtar sözcüklere ve biçime bakar, anlamı anlamaz.
// Amaç: iyi bir prompt'ta bulunması gereken parçaları (görev, rol, bağlam, örnek, biçim, kısıt) fark ettirmek.
import { trLower, words } from './text'

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

export interface LintResult { score: number; wordCount: number; rules: Record<string, boolean>; missing: LintRule[]; tooShort: boolean }

export function lintPrompt(prompt: string): LintResult {
  const lower = trLower(prompt)
  const w = words(prompt)
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

export interface PromptTask { id: string; title: string; brief: string; topic: string[] }
export const PROMPT_TASKS: Record<string, PromptTask> = {
  ozet: { id: 'ozet', title: 'Duyuru özeti', brief: 'Bir robot kulübü duyurusunu 13 yaşındaki öğrenciler için özetletecek bir prompt yaz.', topic: ['duyuru', 'özet'] },
  siniflandir: { id: 'siniflandir', title: 'Yorum sınıflandırma', brief: 'Öğrenci yorumlarını "olumlu" ya da "olumsuz" diye sınıflandırtacak bir prompt yaz.', topic: ['yorum', 'olumlu'] },
  kod: { id: 'kod', title: 'Hata bulma', brief: 'Bir Python fonksiyonundaki hatayı bulup açıklatacak bir prompt yaz.', topic: ['python', 'hata'] },
  json: { id: 'json', title: 'JSON çıkarımı', brief: 'Bir öğrenci yorumundan duygu ve konu bilgisini JSON olarak çıkartacak bir prompt yaz.', topic: ['json'] },
  serbest: { id: 'serbest', title: 'Serbest', brief: 'İstediğin bir görev için prompt yaz.', topic: [] },
}
export const onTopic = (task: string, prompt: string): boolean => {
  const t = PROMPT_TASKS[task]
  return !t || t.topic.length === 0 || t.topic.every((x) => mentions(prompt, x))
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

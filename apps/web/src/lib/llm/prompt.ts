// Prompt kalıpları atölyesi (saf mantık): aynı görev beş kalıpla kurulur; prompt renkli bölümler hâlinde döner,
// yaklaşık token sayısı (lib/ai/tokenizer BPE'si) ve bir kontrol listesi hesaplanır. Model çağrısı yoktur.
import { tokenStats } from '@/lib/ai/tokenizer'
import type { ContentLang } from '@/lib/ai/text'

export type PatternId = 'sifir' | 'ornekli' | 'rol' | 'adim' | 'etiket'
export const PATTERNS: PatternId[] = ['sifir', 'ornekli', 'rol', 'adim', 'etiket']
export type TaskId = 'sinif' | 'ozet'
export const TASKS: TaskId[] = ['sinif', 'ozet']
export type SectionKind = 'rol' | 'gorev' | 'kural' | 'ornek' | 'adim' | 'veri' | 'bicim' | 'belirsiz'
export interface Section { kind: SectionKind; text: string }
export type CheckId = 'rol' | 'gorev' | 'bicim' | 'ornek' | 'ayrac' | 'belirsiz'
export const CHECKS: CheckId[] = ['rol', 'gorev', 'bicim', 'ornek', 'ayrac', 'belirsiz']

export const PATTERN_TEXT: Record<PatternId, { tr: string; en: string }> = {
  sifir: { tr: 'Sıfır atış', en: 'Zero-shot' },
  ornekli: { tr: 'Birkaç örnekli', en: 'Few-shot' },
  rol: { tr: 'Rol ve kurallar', en: 'Role and rules' },
  adim: { tr: 'Adım adım plan', en: 'Step-by-step plan' },
  etiket: { tr: 'Etiketlerle ayrılmış veri', en: 'Data separated by tags' },
}
export const TASK_TEXT: Record<TaskId, { tr: string; en: string }> = {
  sinif: { tr: 'Öğrenci sorusunu konuya ayır', en: 'Route a student question to a topic' },
  ozet: { tr: 'Ders notunu özetle', en: 'Summarise a course note' },
}
export const CHECK_TEXT: Record<CheckId, { tr: string; en: string }> = {
  rol: { tr: 'Rol ya da bağlam verildi', en: 'Role or context given' },
  gorev: { tr: 'Görev açık bir fiille söylendi', en: 'Task stated with a clear verb' },
  bicim: { tr: 'Çıktı biçimi tanımlı', en: 'Output format defined' },
  ornek: { tr: 'En az bir örnek var', en: 'At least one example' },
  ayrac: { tr: 'Veri talimattan ayraçla ayrıldı', en: 'Data separated from instructions by delimiters' },
  belirsiz: { tr: 'Belirsizlikte ne yapılacağı söylendi', en: 'Says what to do when unsure' },
}

interface TaskData { input: string; role: string; task: string; rules: string[]; examples: Array<[string, string]>; steps: string[]; format: string; unsure: string }

function taskData(task: TaskId, lang: ContentLang): TaskData {
  const en = lang === 'en'
  if (task === 'sinif') {
    return en
      ? {
          input: 'My servo jitters when the motor starts, is it the battery?',
          role: 'You are the teaching assistant of an introductory embedded systems course.',
          task: 'Classify the student question into exactly one topic: power, communication, control, safety, rules.',
          rules: ['Use only the topic names in the list.', 'Do not answer the question itself.'],
          examples: [['What address does the MPU6050 use?', 'communication'], ['How many labs can I miss?', 'rules']],
          steps: ['Find the main noun of the question.', 'Match it to the closest topic.', 'If two topics fit, choose the one the student is asking about, not the one mentioned in passing.'],
          format: 'Reply with JSON only: {"topic": "<topic>", "confidence": <0..1>}',
          unsure: 'If no topic fits, use "topic": "unknown" instead of guessing.',
        }
      : {
          input: 'Motor çalışınca servom titriyor, batarya mı sorun?',
          role: 'Sen giriş düzeyi bir gömülü sistemler dersinin asistanısın.',
          task: 'Öğrenci sorusunu tam olarak bir konuya ayır: güç, haberleşme, denetim, güvenlik, kurallar.',
          rules: ['Yalnız listedeki konu adlarını kullan.', 'Sorunun kendisini cevaplama.'],
          examples: [['MPU6050 hangi adresi kullanır?', 'haberleşme'], ['Kaç laboratuvara gelmeyebilirim?', 'kurallar']],
          steps: ['Sorunun ana ismini bul.', 'En yakın konuyla eşleştir.', 'İki konu uyuyorsa öğrencinin asıl sorduğunu seç, geçerken andığını değil.'],
          format: 'Yalnız JSON döndür: {"konu": "<konu>", "guven": <0..1>}',
          unsure: 'Hiçbir konu uymuyorsa tahmin etmek yerine "konu": "bilinmiyor" yaz.',
        }
  }
  return en
    ? {
        input: 'A LiPo cell has a nominal voltage of 3.7 V and a full charge voltage of 4.2 V. The cell voltage must not go below 3.0 V. Charging is always done with a balance charger and under supervision.',
        role: 'You write short revision cards for students.',
        task: 'Summarise the course note in three bullet points.',
        rules: ['Keep every number exactly as written.', 'Add nothing that is not in the note.'],
        examples: [['Ohm\'s law: V = I × R ...', '- V = I × R\n- a series resistor limits LED current\n- P = V × I']],
        steps: ['List the facts with numbers.', 'List the safety rules.', 'Merge them into three bullets of at most 15 words.'],
        format: 'Output exactly three lines, each starting with "- ".',
        unsure: 'If the note has fewer than three facts, write fewer bullets; do not invent one.',
      }
    : {
        input: 'LiPo hücrenin anma gerilimi 3,7 V, tam dolu gerilimi 4,2 V\'tur. Hücre gerilimi 3,0 V\'un altına indirilmemelidir. Şarj her zaman dengeleyici şarj cihazıyla ve gözetim altında yapılır.',
        role: 'Sen öğrenciler için kısa tekrar kartları yazıyorsun.',
        task: 'Ders notunu üç maddede özetle.',
        rules: ['Her sayıyı yazıldığı gibi koru.', 'Notta olmayan hiçbir şey ekleme.'],
        examples: [['Ohm yasası: V = I × R ...', '- V = I × R\n- seri direnç LED akımını sınırlar\n- P = V × I']],
        steps: ['Sayılı bilgileri listele.', 'Güvenlik kurallarını listele.', 'En fazla 15 kelimelik üç maddede birleştir.'],
        format: 'Tam üç satır yaz, her satır "- " ile başlasın.',
        unsure: 'Notta üçten az bilgi varsa daha az madde yaz; uydurma madde ekleme.',
      }
}

/** Kalıba göre promptun bölümleri. Kalıplar birikimli değil: her biri kendi tipik biçimini kurar. */
export function buildSections(pattern: PatternId, task: TaskId, lang: ContentLang = 'tr'): Section[] {
  const d = taskData(task, lang)
  const en = lang === 'en'
  const tag = en ? 'input' : 'girdi'
  const plain: Section = { kind: 'veri', text: d.input }
  const tagged: Section = { kind: 'veri', text: `<${tag}>\n${d.input}\n</${tag}>` }
  const exampleText = d.examples.map(([q, a]) => (en ? `Example input: ${q}\nExample output: ${a}` : `Örnek girdi: ${q}\nÖrnek çıktı: ${a}`)).join('\n\n')
  switch (pattern) {
    case 'sifir':
      return [{ kind: 'gorev', text: d.task }, plain]
    case 'ornekli':
      return [{ kind: 'gorev', text: d.task }, { kind: 'ornek', text: exampleText }, plain]
    case 'rol':
      return [{ kind: 'rol', text: d.role }, { kind: 'gorev', text: d.task }, { kind: 'kural', text: d.rules.map((r) => `- ${r}`).join('\n') }, { kind: 'bicim', text: d.format }, plain]
    case 'adim':
      return [{ kind: 'rol', text: d.role }, { kind: 'gorev', text: d.task }, { kind: 'adim', text: d.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') }, { kind: 'bicim', text: d.format }, tagged]
    case 'etiket':
      return [
        { kind: 'rol', text: d.role }, { kind: 'gorev', text: d.task }, { kind: 'kural', text: d.rules.map((r) => `- ${r}`).join('\n') },
        { kind: 'ornek', text: exampleText }, tagged, { kind: 'bicim', text: d.format }, { kind: 'belirsiz', text: d.unsure },
      ]
  }
}

export const joinSections = (s: readonly Section[]): string => s.map((x) => x.text).join('\n\n')

/** Kontrol listesi: bölüm türlerinden okunur (metin taraması değil, yapı). */
export function checklist(sections: readonly Section[]): Record<CheckId, boolean> {
  const has = (k: SectionKind) => sections.some((s) => s.kind === k)
  return {
    rol: has('rol'), gorev: has('gorev'), bicim: has('bicim'), ornek: has('ornek'),
    ayrac: sections.some((s) => s.kind === 'veri' && /^<[a-z]+>/.test(s.text)), belirsiz: has('belirsiz'),
  }
}

export interface PromptReport { sections: Section[]; text: string; tokens: number; checks: Record<CheckId, boolean>; score: number }
export function promptReport(pattern: PatternId, task: TaskId, lang: ContentLang = 'tr'): PromptReport {
  const sections = buildSections(pattern, task, lang)
  const text = joinSections(sections)
  const checks = checklist(sections)
  return { sections, text, tokens: tokenStats(text, lang === 'en' ? 'en' : 'tr', 120).count, checks, score: CHECKS.filter((c) => checks[c]).length }
}

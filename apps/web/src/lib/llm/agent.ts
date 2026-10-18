// Ajan döngüsü (öğretim modeli): düşün → araç çağır → gözle, adım sınırı ve araç hatasıyla. "Politika" bir dil modeli
// DEĞİLDİR: her görev için yazılmış bir plandır; ama argümanlar önceki gözlemlerden çıkarılır ve araçlar gerçekten çalışır
// (hesap makinesi lib/ai/agent.ts'teki güvenli ayrıştırıcıdır, not araması mini RAG'dir).
import { calc } from '@/lib/ai/agent'
import type { ContentLang } from '@/lib/ai/text'
import { notesFor } from './docs'
import { RAG_DEFAULTS, buildIndex, runRag, type RagChunk } from './rag'

export type ToolName = 'not_ara' | 'hesapla' | 'birim_cevir' | 'takvim'
export const TOOLS: ToolName[] = ['not_ara', 'hesapla', 'birim_cevir', 'takvim']
export type Args = Record<string, string | number>
export interface ToolResult { ok: boolean; text: string }

/** Dönemin ilk pazartesisi (kurgusal ders takvimi). */
export const TERM_START = Date.UTC(2026, 8, 21)
const DAYS_TR = ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma']
const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** `hafta` (1'den) ve gün adından tarih: dönem başı + (hafta − 1) × 7 + gün. */
export function weekDay(week: number, day: string, lang: ContentLang = 'tr'): string {
  const di = Math.max(0, [...DAYS_TR, ...DAYS_EN].indexOf(day.toLocaleLowerCase(lang === 'en' ? 'en-US' : 'tr-TR')) % 5)
  const d = new Date(TERM_START + ((week - 1) * 7 + di) * 86400000)
  return lang === 'en' ? `${d.getUTCDate()} ${MONTHS_EN[d.getUTCMonth()]} ${d.getUTCFullYear()}` : `${d.getUTCDate()} ${MONTHS_TR[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

const UNIT: Record<string, [string, number]> = { mv: ['v', 1e-3], v: ['v', 1], ma: ['a', 1e-3], a: ['a', 1], ohm: ['ohm', 1], kohm: ['ohm', 1e3], mw: ['w', 1e-3], w: ['w', 1] }
export function convert(value: number, from: string, to: string): number {
  const f = UNIT[from.toLowerCase()], t = UNIT[to.toLowerCase()]
  if (!f || !t || f[0] !== t[0]) throw new Error(`${from} → ${to}`)
  return Math.round((value * f[1]) / t[1] * 1e9) / 1e9
}

const num = (s: string): string => String(Math.round(Number(s) * 1e6) / 1e6)

/** Araçları çalıştırır; `broken` araç her çağrıda geçici hata döndürür. */
export function runTool(name: ToolName, args: Args, index: readonly RagChunk[], lang: ContentLang, broken: ToolName | null): ToolResult {
  if (name === broken) return { ok: false, text: lang === 'en' ? 'error 503: tool temporarily unavailable' : 'hata 503: araç geçici olarak kullanılamıyor' }
  try {
    if (name === 'hesapla') return { ok: true, text: num(String(calc(String(args.ifade), lang))) }
    if (name === 'birim_cevir') return { ok: true, text: `${num(String(convert(Number(args.deger), String(args.kaynak), String(args.hedef))))} ${args.hedef}` }
    if (name === 'takvim') return { ok: true, text: weekDay(Number(args.hafta), String(args.gun), lang) }
    const r = runRag(index, String(args.sorgu), { ...RAG_DEFAULTS, k: 2 }, lang)
    return r.answered ? { ok: true, text: r.answer } : { ok: false, text: r.answer }
  } catch (e) {
    return { ok: false, text: (e as Error).message }
  }
}

interface PlanStep { thought: (obs: string[]) => string; tool: ToolName; args: (obs: string[]) => Args }
interface Scenario { task: string; steps: PlanStep[]; final: (obs: string[]) => string }
export type ScenarioId = 'direnc' | 'teslim' | 'batarya'
export const SCENARIOS: ScenarioId[] = ['direnc', 'teslim', 'batarya']

/** Gözlem metninden ilk sayıyı (virgüllü ya da noktalı) çeker. */
export function firstNumber(s: string, after = ''): number {
  const at = after ? s.toLocaleLowerCase('tr-TR').indexOf(after.toLocaleLowerCase('tr-TR')) : 0
  const m = /(\d+(?:[.,]\d+)?)/.exec(s.slice(Math.max(0, at)))
  return m ? Number(m[1].replace(',', '.')) : NaN
}

function scenarios(lang: ContentLang): Record<ScenarioId, Scenario> {
  const en = lang === 'en'
  const t = (tr: string, e: string) => (en ? e : tr)
  return {
    direnc: {
      task: t('5 V kaynaktan kırmızı bir LED\'i 20 mA ile süreceğim. Kaç ohm seri direnç gerekir ve çeyrek watt direnç yeter mi?', 'I will drive a red LED from a 5 V supply at 20 mA. What series resistor do I need, and is a quarter watt resistor enough?'),
      steps: [
        { thought: () => t('Kırmızı LED\'in gerilim düşümünü bilmiyorum; ders notlarında arayayım.', 'I do not know the voltage drop of a red LED; let me search the course notes.'), tool: 'not_ara', args: () => ({ sorgu: t('kırmızı LED gerilim düşürür direnç', 'red LED voltage drop resistor') }) },
        { thought: (o) => t(`Notlara göre LED yaklaşık ${firstNumber(o[0], 'yaklaşık') || 2} V düşürüyor. R = (5 − V_LED) / 0,02 hesaplayayım.`, `The notes say the LED drops about ${firstNumber(o[0], 'drops') || 2} V. Let me compute R = (5 − V_LED) / 0.02.`), tool: 'hesapla', args: (o) => ({ ifade: `(5-${firstNumber(o[0], en ? 'drops' : 'yaklaşık') || 2})/0.02` }) },
        { thought: () => t('Şimdi dirençteki gücü P = V × I ile bulayım.', 'Now let me find the power in the resistor with P = V × I.'), tool: 'hesapla', args: (o) => ({ ifade: `(5-${firstNumber(o[0], en ? 'drops' : 'yaklaşık') || 2})*0.02` }) },
      ],
      final: (o) => t(`${o[1]} ohm seri direnç gerekir. Dirençte ${o[2]} W harcanır; bu 0,25 W\'tan küçük olduğu için çeyrek watt direnç yeter. Kaynak: ders notu "Ohm yasası ve güç".`, `You need a ${o[1]} ohm series resistor. It dissipates ${o[2]} W, which is below 0.25 W, so a quarter watt resistor is enough. Source: course note "Ohm's law and power".`),
    },
    teslim: {
      task: t('Dönem projesi hangi tarihte teslim ediliyor? İki gün geç teslim edersem yüzde kaç kesilir?', 'On what date is the term project due? If I submit two days late, what percentage is deducted?'),
      steps: [
        { thought: () => t('Teslim kuralı ders notlarında olmalı; arayayım.', 'The deadline rule should be in the course notes; let me search.'), tool: 'not_ara', args: () => ({ sorgu: t('dönem projesi teslim haftası', 'term project due week') }) },
        { thought: (o) => t(`Notlar ${firstNumber(o[0], 'proje') || 12}. haftanın cuma gününü söylüyor. Takvim aracıyla tarihe çevireyim.`, `The notes say Friday of week ${firstNumber(o[0], 'week') || 12}. Let me turn that into a date with the calendar tool.`), tool: 'takvim', args: (o) => ({ hafta: firstNumber(o[0], en ? 'week' : 'proje') || 12, gun: t('cuma', 'friday') }) },
        { thought: () => t('Geç teslim cezasını da notlardan bulayım.', 'Let me also find the late penalty in the notes.'), tool: 'not_ara', args: () => ({ sorgu: t('geç teslim gün yüzde kesilir', 'late submissions lose percent per day') }) },
        { thought: (o) => t(`Günde yüzde ${firstNumber(o[2], 'yüzde') || 10}; iki gün için çarpayım.`, `${firstNumber(o[2], 'lose') || 10} percent per day; let me multiply by two days.`), tool: 'hesapla', args: (o) => ({ ifade: `2*${firstNumber(o[2], en ? 'lose' : 'yüzde') || 10}` }) },
      ],
      final: (o) => t(`Dönem projesi ${o[1]} cuma günü saat 17.00\'ye kadar teslim edilir. İki gün geç teslimde yüzde ${o[3]} kesilir (üç günden sonra kabul edilmez). Kaynak: "Ders kuralları ve değerlendirme".`, `The term project is due on Friday ${o[1]} at 17.00. Two days late costs ${o[3]} percent (after three days it is not accepted). Source: "Course rules and grading".`),
    },
    batarya: {
      task: t('3 hücreli (3S) bir LiPo paketinin en düşük güvenli gerilimi kaç milivolttur?', 'What is the lowest safe voltage of a 3-cell (3S) LiPo pack, in millivolts?'),
      steps: [
        { thought: () => t('Hücre başına alt sınırı notlardan bulayım.', 'Let me find the per-cell lower limit in the notes.'), tool: 'not_ara', args: () => ({ sorgu: t('LiPo hücre gerilimi altına indirilmemelidir', 'LiPo cell voltage must not go below') }) },
        { thought: (o) => t(`Hücre başına ${firstNumber(o[0], 'gerilimi') || 3} V. Üç hücre seri: çarpayım.`, `${firstNumber(o[0], 'below') || 3} V per cell. Three cells in series: let me multiply.`), tool: 'hesapla', args: (o) => ({ ifade: `3*${firstNumber(o[0], en ? 'below' : 'gerilimi') || 3}` }) },
        { thought: () => t('Soru milivolt istiyor; birim çeviriciyi kullanayım.', 'The question asks for millivolts; let me use the unit converter.'), tool: 'birim_cevir', args: (o) => ({ deger: Number(o[1]), kaynak: 'V', hedef: 'mV' }) },
      ],
      final: (o) => t(`3S paketin en düşük güvenli gerilimi ${o[2]} (hücre başına 3,0 V × 3). Kaynak: "LiPo batarya güvenliği".`, `The lowest safe voltage of a 3S pack is ${o[2]} (3.0 V per cell × 3). Source: "LiPo battery safety".`),
    },
  }
}

export const taskOf = (id: ScenarioId, lang: ContentLang = 'tr'): string => scenarios(lang)[id].task

export interface AgentStep { n: number; thought: string; tool: ToolName; args: Args; result: ToolResult; retry: boolean }
export type StopReason = 'done' | 'limit' | 'tool_failed'
export interface AgentRun { task: string; steps: AgentStep[]; stop: StopReason; final: string }

/** Döngüyü çalıştırır. Her araç çağrısı bir adımdır; başarısız çağrı bir kez yeniden denenir. */
export function runAgent(id: ScenarioId, opts: { maxSteps: number; broken: ToolName | null }, lang: ContentLang = 'tr'): AgentRun {
  const sc = scenarios(lang)[id]
  const index = buildIndex(notesFor(lang), RAG_DEFAULTS.size, RAG_DEFAULTS.overlap, lang)
  const obs: string[] = []
  const steps: AgentStep[] = []
  const en = lang === 'en'
  for (const p of sc.steps) {
    let retry = false
    for (;;) {
      if (steps.length >= opts.maxSteps) {
        return { task: sc.task, steps, stop: 'limit', final: en ? `Step limit (${opts.maxSteps}) reached before the task was finished. I stop here instead of looping on; partial findings: ${obs.join(' | ') || 'none'}.` : `Görev bitmeden adım sınırına (${opts.maxSteps}) ulaşıldı. Döngüyü sürdürmek yerine burada duruyorum; şimdiye kadarki bulgular: ${obs.join(' | ') || 'yok'}.` }
      }
      const args = p.args(obs)
      const thought = retry ? (en ? `The tool returned an error; I will retry once with the same arguments.` : 'Araç hata döndürdü; aynı argümanlarla bir kez yeniden deneyeceğim.') : p.thought(obs)
      const result = runTool(p.tool, args, index, lang, opts.broken)
      steps.push({ n: steps.length + 1, thought, tool: p.tool, args, result, retry })
      if (result.ok) { obs.push(result.text); break }
      if (retry) {
        return { task: sc.task, steps, stop: 'tool_failed', final: en ? `The ${p.tool} tool failed twice, so I cannot finish the task reliably. I report this instead of guessing; you can try again later or do this step by hand.` : `${p.tool} aracı iki kez hata verdi; görevi güvenilir biçimde bitiremiyorum. Tahmin etmek yerine bunu bildiriyorum; daha sonra yeniden deneyebilir ya da bu adımı elle yapabilirsin.` }
      }
      retry = true
    }
  }
  return { task: sc.task, steps, stop: 'done', final: sc.final(obs) }
}

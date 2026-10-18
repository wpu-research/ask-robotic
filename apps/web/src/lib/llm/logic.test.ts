// LLM dersinin saf mantığı: öğretim gömmesi, mini RAG, ajan döngüsü, JSON şema, prompt kalıpları, değerlendirme,
// kişisel veri ve enjeksiyon süzgeci, maliyet ve akış ayrıştırıcı. Hepsi deterministik; aynı girdi aynı sonuç.
import { describe, expect, it } from 'vitest'
import { runAgent, convert, weekDay } from './agent'
import { COST_DEFAULTS, DEFAULT_PRICES, contextBudget, costReport, latency } from './cost'
import { NOTES_EN, NOTES_TR } from './docs'
import { DIM, cosine, embed, fnv1a, nearest, pca2 } from './embed'
import { CASES, evaluate, groundedness, normalize, normalizedMatch, rubric, tokenF1 } from './evalbench'
import { findPii, luhn, maskPii, scanInjection, unmask, validIban, validTckn, wrapUntrusted, INJECTION_SAMPLE, PII_SAMPLE } from './guard'
import { PATTERNS, TASKS, checklist, promptReport } from './prompt'
import { RAG_DEFAULTS, buildIndex, runRag } from './rag'
import { LAB_SCHEMA, extractJson, samplesFor, validate } from './schema'
import { SseParser, chunkBytes, eventsFor, parseAll, serializeSse, splitsChar } from './stream'

describe('öğretim gömmesi', () => {
  it('deterministik, birim uzunlukta, 64 boyut', () => {
    const v = embed('PWM ile motor hızı ayarlanır')
    expect(v).toHaveLength(DIM)
    expect(Math.hypot(...v)).toBeCloseTo(1, 9)
    expect(embed('PWM ile motor hızı ayarlanır')).toEqual(v)
    expect(fnv1a('a')).toBe(0xe40c292c)
  })
  it('yüzey örtüşmesi benzerliği artırır; ilgisiz metin uzak düşer', () => {
    const q = embed('LiPo batarya hücre gerilimi')
    expect(cosine(q, embed(NOTES_TR[4].text))).toBeGreaterThan(cosine(q, embed(NOTES_TR[2].text)))
  })
  it('PCA iki dik eksen verir; en yakın komşu kendisidir', () => {
    const X = NOTES_TR.map((n) => embed(n.text))
    const p = pca2(X)
    expect(Math.abs(p.axes[0].reduce((s, x, i) => s + x * p.axes[1][i], 0))).toBeLessThan(1e-6)
    expect(nearest(X[3], X, 1)[0].index).toBe(3)
  })
})

describe('mini RAG', () => {
  const idx = buildIndex(NOTES_TR, RAG_DEFAULTS.size, RAG_DEFAULTS.overlap)
  it('notlardaki soruya kaynaklı cevap verir', () => {
    const r = runRag(idx, 'MPU6050 ivmeölçerin varsayılan adresi nedir?', RAG_DEFAULTS)
    expect(r.answered).toBe(true)
    expect(r.answer).toContain('0x68')
    expect(r.sources[0]).toMatch(/^i2c#/)
  })
  it('notlarda olmayan soruya "notlarda yok" der', () => {
    const r = runRag(idx, 'Fransa\'nın başkenti neresidir?', RAG_DEFAULTS)
    expect(r.answered).toBe(false)
    expect(r.answer).toMatch(/notlarında yok/)
  })
  it('İngilizce notlarla da çalışır', () => {
    const en = buildIndex(NOTES_EN, 40, 10, 'en')
    expect(runRag(en, 'When is the term project due?', RAG_DEFAULTS, 'en').answer).toMatch(/week 12/)
  })
})

describe('ajan döngüsü', () => {
  it('direnç görevini araçlarla bitirir: 150 ohm, 0,06 W', () => {
    const r = runAgent('direnc', { maxSteps: 6, broken: null })
    expect(r.stop).toBe('done')
    expect(r.steps.map((s) => s.tool)).toEqual(['not_ara', 'hesapla', 'hesapla'])
    expect(r.final).toContain('150')
    expect(r.final).toContain('0.06')
  })
  it('adım sınırında durur, bozuk araçta bir kez yeniden dener sonra bildirir', () => {
    expect(runAgent('teslim', { maxSteps: 2, broken: null }).stop).toBe('limit')
    const b = runAgent('batarya', { maxSteps: 8, broken: 'hesapla' })
    expect(b.stop).toBe('tool_failed')
    expect(b.steps.filter((s) => s.retry)).toHaveLength(1)
  })
  it('takvim ve birim araçları', () => {
    expect(weekDay(12, 'cuma')).toBe('11 Aralık 2026')
    expect(convert(9, 'V', 'mV')).toBe(9000)
    expect(runAgent('batarya', { maxSteps: 8, broken: null }, 'en').final).toContain('9000 mV')
  })
})

describe('JSON şema doğrulayıcı', () => {
  it('örnekler beklenen hataları verir', () => {
    const s = samplesFor('tr')
    const check = (txt: string) => { const e = extractJson(txt); return e.ok ? validate(LAB_SCHEMA, e.value!) : null }
    expect(check(s.gecerli)).toEqual([])
    expect(check(s.eksik)!.some((e) => e.code === 'required')).toBe(true)
    expect(check(s.tur)!.some((e) => e.code === 'type')).toBe(true)
    expect(check(s.enum)!.some((e) => e.code === 'enum')).toBe(true)
    expect(extractJson(s.metin).trimmed).toBe(true)
    expect(extractJson(s.bozuk).ok).toBe(false)
  })
})

describe('prompt kalıpları', () => {
  it('etiketli kalıp kontrol listesinin tamamını karşılar, sıfır atış yalnız görevi', () => {
    for (const t of TASKS) {
      expect(promptReport('etiket', t).score).toBe(6)
      expect(promptReport('sifir', t).score).toBe(1)
    }
    const scores = PATTERNS.map((p) => promptReport(p, 'sinif').score)
    expect(scores).toEqual([...scores].sort((a, b) => a - b))
  })
  it('daha zengin prompt daha çok token; ayraç yalnız etiketli veride', () => {
    expect(promptReport('etiket', 'ozet', 'en').tokens).toBeGreaterThan(promptReport('sifir', 'ozet', 'en').tokens)
    expect(checklist(promptReport('rol', 'sinif').sections).ayrac).toBe(false)
    expect(checklist(promptReport('adim', 'sinif').sections).ayrac).toBe(true)
  })
})

describe('değerlendirme', () => {
  it('normalize Türkçe harfleri ve noktalamayı doğru işler, ondalığı korur', () => {
    expect(normalize('Yüzde 10.')).toBe('yüzde 10')
    expect(normalize('IŞIK 0,98 [fuzyon]')).toBe('ışık 0,98')
    expect(normalizedMatch('Yüzde 10.', 'yüzde 10')).toBe(1)
    expect(tokenF1('yüzde 45 idir', 'yüzde 45')).toBeCloseTo(0.8, 6)
  })
  it('dayanaklılık uydurma sayıyı yakalar', () => {
    expect(groundedness('0x68, AD0 yüksekse 0x69', 'i2c')).toEqual({ ok: false, unsupported: ['0x69'] })
    expect(groundedness('3,0 V ve 3,8 V', 'lipo').ok).toBe(true)
  })
  it('A sistemi her ölçütte B\'den iyi ya da eşit; tam eşleşme ikisinde de düşük', () => {
    for (const lang of ['tr', 'en'] as const) {
      const a = evaluate('a', lang), b = evaluate('b', lang)
      expect(a.mean.nm).toBeGreaterThan(b.mean.nm)
      expect(a.mean.rubrik).toBeGreaterThan(b.mean.rubrik)
      expect(a.mean.dayanak).toBe(1)
      expect(b.mean.dayanak).toBeLessThan(1)
      expect(a.mean.em).toBe(0)
      expect(CASES[lang]).toHaveLength(8)
    }
    expect(rubric(CASES.tr[6], CASES.tr[6].a).kaynak).toBe(false)
  })
})

describe('kişisel veri ve enjeksiyon', () => {
  it('sağlama haneleri', () => {
    expect(validTckn('10000000146')).toBe(true)
    expect(validTckn('10000000147')).toBe(false)
    expect(validIban('TR33 0006 1005 1978 6457 8413 26')).toBe(true)
    expect(validIban('TR34 0006 1005 1978 6457 8413 26')).toBe(false)
    expect(luhn('4111 1111 1111 1111')).toBe(true)
    expect(luhn('4111 1111 1111 1112')).toBe(false)
  })
  it('örnek metindeki beş türü bulur, öğrenci numarasını bulmaz; maske geri açılır', () => {
    for (const lang of ['tr', 'en'] as const) {
      const hits = findPii(PII_SAMPLE[lang])
      expect(hits.map((h) => h.kind).sort()).toEqual(['EPOSTA', 'IBAN', 'KART', 'TCKN', 'TELEFON'])
      const m = maskPii(PII_SAMPLE[lang])
      expect(m.masked).toContain('[EPOSTA_1]')
      expect(m.masked).toContain('20231045')
      expect(unmask(m.masked, m.map)).toBe(PII_SAMPLE[lang])
    }
    // geçersiz kimlik numarası maskelenmez
    expect(findPii('no: 12345678901')).toEqual([])
  })
  it('enjeksiyon belirtileri ve sarmalama', () => {
    for (const lang of ['tr', 'en'] as const) {
      const s = scanInjection(INJECTION_SAMPLE[lang])
      expect(s.risk).toBe('yuksek')
      for (const id of ['yoksay', 'rol', 'sizinti', 'gizli', 'disari', 'etiket'] as const) expect(s.signals, `${lang} ${id}`).toContain(id)
      const w = wrapUntrusted(INJECTION_SAMPLE[lang], lang)
      expect(w.match(lang === 'en' ? /<\/document>/g : /<\/belge>/g)).toHaveLength(1)
    }
    expect(scanInjection(NOTES_TR[1].text).risk).toBe('dusuk')
  })
})

describe('maliyet ve gecikme', () => {
  it('önbelleksiz istek başı maliyet fiyatlardan çıkar; önbellek ve toplu işleme düşürür', () => {
    const base = { ...COST_DEFAULTS, prices: DEFAULT_PRICES, cachedShare: 0, hitRate: 0, batchShare: 0 }
    const r = costReport(base)
    expect(r.plainPerRequest).toBeCloseTo((6000 * 2 + 400 * 10) / 1e6, 12)
    expect(r.perRequest).toBeCloseTo(r.plainPerRequest, 12)
    const c = costReport({ ...base, cachedShare: 0.8, hitRate: 1 })
    expect(c.perRequest).toBeLessThan(r.perRequest)
    expect(c.cacheSaving).toBeCloseTo((r.plainPerRequest - c.perRequest) * 2000 * 30, 6)
    const b = costReport({ ...base, batchShare: 1 })
    expect(b.perRequest).toBeCloseTo(r.perRequest / 2, 12)
  })
  it('önbellek ilk token süresini kısaltır; bağlam bütçesi', () => {
    const cold = latency({ inputTokens: 20000, outputTokens: 300, cachedShare: 0.9, hitRate: 0 })
    const warm = latency({ inputTokens: 20000, outputTokens: 300, cachedShare: 0.9, hitRate: 1 })
    expect(warm.ttftMs).toBeLessThan(cold.ttftMs)
    expect(warm.generateMs).toBe(cold.generateMs)
    expect(contextBudget(1000, { system: 200, history: 300, docs: 400, maxOutput: 200 }).fits).toBe(false)
  })
})

describe('akış ayrıştırıcı', () => {
  const text = 'Dönem projesi 12. haftanın cuma günü saat 17.00\'ye kadar teslim edilir; geç teslimde günde yüzde 10 kesilir.'
  const sse = serializeSse(eventsFor(text))
  it('rastgele bayt sınırlarından kesilse de (Türkçe karakter ortadan bölünse de) metin aynen birleşir', () => {
    for (const seed of [1, 2, 3, 7, 42]) {
      const chunks = chunkBytes(sse, seed, 9)
      const p = parseAll(chunks)
      expect(p.text).toBe(text)
      expect(p.done).toBe(true)
      expect(p.stopReason).toBe('end_turn')
    }
    expect(chunkBytes(sse, 3, 9).some(splitsChar)).toBe(true)
  })
  it('yarım olay tamponda bekler', () => {
    const p = new SseParser()
    const bytes = new TextEncoder().encode(sse)
    const cut = sse.indexOf('\n\n') - 3
    expect(p.push(bytes.slice(0, cut))).toEqual([])
    expect(p.push(bytes.slice(cut, cut + 10))[0].event).toBe('message_start')
  })
})

// Öğrenme platformu katmanları: ders ekleri (anlatım, kavram kartları, mini test), hafta rehberi ve parça ansiklopedisi.
// build.mjs kullanır; kurallar docs/ogrenme-platformu-kapsam.md ve content-src/modul-3/YAZAR-REHBERI.md'de.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { localizeSteps } from './code-localize.mjs'
import { join } from 'node:path'
import { SRC } from '../sim/lessons.mjs'

export const QUIZ_KINDS = ['mcq', 'predict-output', 'find-bug', 'numeric']

const pad = (n) => String(n).padStart(2, '0')

/** <hafta>/ek/NN.anlatim.md + NN.json ({ concepts, quiz }) okur; doğrular. Dosya yoksa {}. */
export function loadLessonExtras(moduleDir, weekDir, number, skillIds) {
  const dir = join(SRC, moduleDir, weekDir, 'ek')
  const where = `${moduleDir}/${weekDir}/ek/${pad(number)}`
  const out = {}
  const md = join(dir, `${pad(number)}.anlatim.md`)
  if (existsSync(md)) {
    const t = readFileSync(md, 'utf8').trim()
    if (!t) throw new Error(`${where}.anlatim.md boş`)
    out.explainerMd = t
  }
  const js = join(dir, `${pad(number)}.json`)
  if (existsSync(js)) {
    let j
    try { j = JSON.parse(readFileSync(js, 'utf8')) } catch (e) { throw new Error(`${where}.json geçersiz JSON: ${e.message}`) }
    if (j.concepts !== undefined) out.concepts = validateConcepts(j.concepts, `${where}.json`)
    if (j.quiz !== undefined) out.quiz = validateQuiz(j.quiz, `${where}.json`, skillIds)
  }
  const st = join(dir, `${pad(number)}.adimlar.json`)
  if (existsSync(st)) {
    let j
    try { j = JSON.parse(readFileSync(st, 'utf8')) } catch (e) { throw new Error(`${where}.adimlar.json geçersiz JSON: ${e.message}`) }
    out.steps = validateSteps(j, `${where}.adimlar.json`, skillIds)
  }
  // İngilizce sürüm (NN.adimlar.en.json): aynı biçim kuralları + Türkçeyle yapısal ayna (mirrorSteps)
  const stEn = join(dir, `${pad(number)}.adimlar.en.json`)
  if (existsSync(stEn)) {
    if (!out.steps) throw new Error(`${where}.adimlar.en.json var ama ${where}.adimlar.json yok`)
    let j
    try { j = JSON.parse(readFileSync(stEn, 'utf8')) } catch (e) { throw new Error(`${where}.adimlar.en.json geçersiz JSON: ${e.message}`) }
    out.stepsEn = validateSteps(j, `${where}.adimlar.en.json`, skillIds)
    mirrorSteps(out.steps, out.stepsEn, `${where}.adimlar.en.json`)
    out.stepsEn = localizeSteps(out.stepsEn) // kodun değişken adları ve yorumları İngilizce (kaynak Türkçeyle aynı kalır)
  }
  return out
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Çeviri aynası: `en`, `tr` ile aynı yapıda olmalı; yalnız insan metni değişir.
 * Aynı uzunluk ve adım türleri; kod, art, beceriler, seçenek sayısı ve cevap sırası, sayısal cevap/tolerans,
 * widget ayarı ve hedef metrik/aralıkları, sıralama satır sayısı birebir. Boşluk doldurmada çipler sırayla eşlenir
 * (tokens_en[j] = tokens_tr[j]'nin çevirisi) ve cevaplar bu eşlemeyle tutarlı olmalı.
 */
export function mirrorSteps(tr, en, where) {
  if (!Array.isArray(tr) || !Array.isArray(en)) throw new Error(`${where}: adım listesi yok`)
  if (tr.length !== en.length) throw new Error(`${where}: ${tr.length} adım olmalı (${en.length} var)`)
  tr.forEach((a, i) => {
    const b = en[i]
    const w = `${where}: [${i}]`
    if (a.kind !== b?.kind) throw new Error(`${w}.kind "${a.kind}" olmalı (${b?.kind})`)
    for (const k of ['code', 'art', 'skills']) if (!same(a[k], b[k])) throw new Error(`${w}.${k} Türkçe sürümle aynı olmalı`)
    switch (a.kind) {
      case 'choice':
        if (a.options.length !== b.options?.length) throw new Error(`${w}.options ${a.options.length} seçenek olmalı`)
        if (a.answer !== b.answer) throw new Error(`${w}.answer ${a.answer} olmalı`)
        break
      case 'numeric':
        if (a.answer !== b.answer) throw new Error(`${w}.answer ${a.answer} olmalı`)
        if (a.tolerance !== b.tolerance) throw new Error(`${w}.tolerance ${a.tolerance} olmalı`)
        break
      case 'fill': {
        if (a.tokens.length !== b.tokens?.length) throw new Error(`${w}.tokens ${a.tokens.length} çip olmalı`)
        if (a.answer.length !== b.answer?.length) throw new Error(`${w}.answer ${a.answer.length} öğe olmalı`)
        a.answer.forEach((ans, k) => {
          const expect = b.tokens[a.tokens.indexOf(ans)]
          if (b.answer[k] !== expect) throw new Error(`${w}.answer[${k}] "${expect}" olmalı (çip eşlemesi)`)
        })
        break
      }
      case 'order':
        if (a.lines.length !== b.lines?.length) throw new Error(`${w}.lines ${a.lines.length} satır olmalı`)
        break
      case 'widget':
        if (!same(a.widget, b.widget)) throw new Error(`${w}.widget Türkçe sürümle aynı olmalı`)
        if (a.goals.length !== b.goals?.length) throw new Error(`${w}.goals ${a.goals.length} hedef olmalı`)
        a.goals.forEach((g, gi) => {
          const h = b.goals[gi]
          if (g.metric !== h.metric || g.min !== h.min || g.max !== h.max) throw new Error(`${w}.goals[${gi}] metrik/aralık aynı olmalı`)
        })
        break
    }
  })
  return en
}

// ---- Etkileşimli ders (v2) adımları: <hafta>/ek/NN.adimlar.json = LessonStep[] (packages/db/src/content/types.ts) ----
export const STEP_KINDS = ['intro', 'explain', 'choice', 'numeric', 'fill', 'order', 'widget', 'activity', 'reflect']
export const WIDGET_METRICS = {
  ohm: ['V', 'R', 'I_mA', 'P_mW', 'ledOn'],
  blink: ['onMs', 'offMs', 'periodMs', 'hz', 'duty'],
}
const BLANK = '___'

export function validateSteps(list, where, skillIds) {
  if (!Array.isArray(list) || list.length < 6 || list.length > 30) throw new Error(`${where}: 6-30 adım olmalı`)
  if (list[0]?.kind !== 'intro') throw new Error(`${where}: ilk adım intro olmalı`)
  const interactive = list.filter((s) => ['choice', 'numeric', 'fill', 'order', 'widget', 'activity'].includes(s?.kind)).length
  if (interactive < 4) throw new Error(`${where}: en az 4 etkileşimli adım olmalı (${interactive} var)`)
  list.forEach((s, i) => {
    const w = `${where}: [${i}]`
    const need = (...keys) => { for (const k of keys) if (!str(s[k])) throw new Error(`${w}.${k} eksik`) }
    if (!STEP_KINDS.includes(s?.kind)) throw new Error(`${w}.kind geçersiz: ${s?.kind}`)
    if (s.skills !== undefined) {
      if (!Array.isArray(s.skills) || !s.skills.length) throw new Error(`${w}.skills boş`)
      for (const k of s.skills) if (skillIds && !skillIds.has(k)) throw new Error(`${w}: bilinmeyen beceri "${k}"`)
    }
    switch (s.kind) {
      case 'intro': need('title', 'body'); break
      case 'explain': need('body'); break
      case 'reflect': need('prompt'); break
      case 'activity': need('prompt'); break
      case 'choice':
        need('prompt', 'why')
        if (!Array.isArray(s.options) || s.options.length < 2 || s.options.length > 5 || !s.options.every(str)) throw new Error(`${w}.options 2-5 dolu seçenek olmalı`)
        if (new Set(s.options).size !== s.options.length) throw new Error(`${w}.options tekrar içeriyor`)
        if (!Number.isInteger(s.answer) || s.answer < 0 || s.answer >= s.options.length) throw new Error(`${w}.answer seçenek sırası olmalı`)
        break
      case 'numeric':
        need('prompt', 'why')
        if (typeof s.answer !== 'number' || !Number.isFinite(s.answer)) throw new Error(`${w}.answer sayı olmalı`)
        if (s.tolerance !== undefined && !(s.tolerance >= 0)) throw new Error(`${w}.tolerance ≥ 0 olmalı`)
        break
      case 'fill': {
        need('prompt', 'code', 'why')
        const blanks = s.code.split(BLANK).length - 1
        if (blanks < 1) throw new Error(`${w}.code içinde ${BLANK} boşluğu yok`)
        if (!Array.isArray(s.answer) || s.answer.length !== blanks) throw new Error(`${w}.answer ${blanks} öğe olmalı`)
        if (!Array.isArray(s.tokens) || s.tokens.length < 2 || !s.tokens.every(str)) throw new Error(`${w}.tokens en az 2 çip olmalı`)
        for (const a of s.answer) if (!s.tokens.includes(a)) throw new Error(`${w}: cevap "${a}" tokens içinde yok`)
        break
      }
      case 'order':
        need('prompt', 'why')
        if (!Array.isArray(s.lines) || s.lines.length < 3 || s.lines.length > 8 || !s.lines.every(str)) throw new Error(`${w}.lines 3-8 satır olmalı`)
        if (new Set(s.lines).size !== s.lines.length) throw new Error(`${w}.lines tekrar içeriyor`)
        break
      case 'widget': {
        need('prompt', 'why')
        const metrics = WIDGET_METRICS[s.widget?.type]
        if (!metrics) throw new Error(`${w}.widget.type geçersiz: ${s.widget?.type}`)
        if (!Array.isArray(s.goals) || !s.goals.length) throw new Error(`${w}.goals boş`)
        s.goals.forEach((g, gi) => {
          if (!str(g.label)) throw new Error(`${w}.goals[${gi}].label eksik`)
          if (!metrics.includes(g.metric)) throw new Error(`${w}.goals[${gi}].metric "${g.metric}" ${s.widget.type} için yok (${metrics.join(', ')})`)
          if (g.min === undefined && g.max === undefined) throw new Error(`${w}.goals[${gi}] min ya da max ister`)
        })
        break
      }
    }
  })
  return list
}

export function loadWeekGuide(moduleDir, weekDir) {
  const f = join(SRC, moduleDir, weekDir, 'ek', 'rehber.md')
  if (!existsSync(f)) return undefined
  const t = readFileSync(f, 'utf8').trim()
  if (!t) throw new Error(`${moduleDir}/${weekDir}/ek/rehber.md boş`)
  return t
}

const str = (v) => typeof v === 'string' && v.trim().length > 0

export function validateConcepts(list, where) {
  if (!Array.isArray(list) || list.length < 3 || list.length > 6) throw new Error(`${where}: concepts 3-6 kart olmalı`)
  const seen = new Set()
  list.forEach((c, i) => {
    for (const k of ['term', 'definition', 'example', 'pitfall']) if (!str(c?.[k])) throw new Error(`${where}: concepts[${i}].${k} eksik`)
    if (seen.has(c.term)) throw new Error(`${where}: concepts terimi tekrar: ${c.term}`)
    seen.add(c.term)
  })
  return list.map(({ term, definition, example, pitfall }) => ({ term, definition, example, pitfall }))
}

export function validateQuiz(list, where, skillIds) {
  if (!Array.isArray(list) || list.length < 3 || list.length > 5) throw new Error(`${where}: quiz 3-5 soru olmalı`)
  const ids = new Set()
  list.forEach((q, i) => {
    const w = `${where}: quiz[${i}]`
    if (!str(q.id) || !/^[\w-]+$/.test(q.id)) throw new Error(`${w}.id geçersiz`)
    if (ids.has(q.id)) throw new Error(`${w}.id tekrar: ${q.id}`)
    ids.add(q.id)
    if (!QUIZ_KINDS.includes(q.kind)) throw new Error(`${w}.kind geçersiz: ${q.kind}`)
    if (!str(q.prompt)) throw new Error(`${w}.prompt eksik`)
    if (!str(q.explanation)) throw new Error(`${w}.explanation eksik`)
    if (!Array.isArray(q.skills) || q.skills.length === 0) throw new Error(`${w}.skills boş`)
    for (const s of q.skills) if (skillIds && !skillIds.has(s)) throw new Error(`${w}: bilinmeyen beceri "${s}" (apps/web/src/lib/skills.ts)`)
    if (q.kind === 'numeric') {
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) throw new Error(`${w}.answer sayı olmalı`)
      if (q.options !== undefined) throw new Error(`${w}: numeric soruda options olmaz`)
    } else {
      if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 5 || !q.options.every(str)) throw new Error(`${w}.options 2-5 dolu seçenek olmalı`)
      if (new Set(q.options).size !== q.options.length) throw new Error(`${w}.options tekrar içeriyor`)
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) throw new Error(`${w}.answer seçenek sırası olmalı`)
    }
  })
  return list.map((q) => {
    const o = { id: q.id, kind: q.kind, prompt: q.prompt }
    if (q.options) o.options = q.options
    o.answer = q.answer
    if (q.tolerance !== undefined) o.tolerance = q.tolerance
    if (q.unit !== undefined) o.unit = q.unit
    o.explanation = q.explanation
    o.skills = q.skills
    return o
  })
}

// ---- Parça ansiklopedisi: content-src/parcalar/<slug>.md ----
const SECTION = {
  'Pinler': 'pins', 'Nasıl çalışır': 'how', 'Laboratuvarda bağlantı': 'wiring', 'Tipik değerler': 'values', 'Sık hatalar': 'mistakes', 'İlgili dersler': 'lessons',
}

export function parsePart(text, file) {
  const fail = (m) => { throw new Error(`${file}: ${m}`) }
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim()
  if (!title) fail('"# Başlık" yok')
  const head = {}
  const sections = {}
  let cur = null
  for (const l of lines) {
    const m = l.match(/^## (.+?)\s*$/)
    if (m) { cur = SECTION[m[1]]; if (!cur) fail(`bilinmeyen bölüm "${m[1]}"`); sections[cur] = []; continue }
    if (cur) { sections[cur].push(l); continue }
    const h = l.match(/^(slug|parça|kategori|özet):\s*(.+)$/)
    if (h) head[h[1]] = h[2].trim()
  }
  for (const k of ['slug', 'parça', 'kategori', 'özet']) if (!head[k]) fail(`"${k}:" satırı yok`)
  for (const k of Object.values(SECTION)) if (!sections[k] || !sections[k].join('').trim()) fail(`"${Object.keys(SECTION).find((x) => SECTION[x] === k)}" bölümü yok ya da boş`)
  const bullets = (k) => sections[k].filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim())
  const pins = bullets('pins').map((b) => {
    const m = b.match(/^`?([\w+\-]+)`?:\s*(.+)$/)
    if (!m) fail(`pin satırı "ad: açıklama" olmalı: ${b}`)
    return { name: m[1], description: m[2] }
  })
  const typicalValues = bullets('values').map((b) => {
    const [label, value, note] = b.split('|').map((x) => x.trim())
    if (!label || !value) fail(`tipik değer satırı "etiket | değer | not" olmalı: ${b}`)
    return note ? { label, value, note } : { label, value }
  })
  return {
    slug: head.slug, title, partType: head['parça'], category: head.kategori, summary: head['özet'],
    pins,
    howItWorksMd: sections.how.join('\n').trim(),
    wiringMd: sections.wiring.join('\n').trim(),
    typicalValues,
    commonMistakesMd: sections.mistakes.join('\n').trim(),
    relatedLessons: bullets('lessons'),
  }
}

export function loadParts() {
  const dir = join(SRC, 'parcalar')
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort().map((f) => parsePart(readFileSync(join(dir, f), 'utf8'), `parcalar/${f}`))
}

// ---- Parça ansiklopedisi, İngilizce: content-src/parcalar/en/<slug>.md ----
// Biçim Türkçeyle aynı; başlık satırları `slug:`, `category:`, `summary:`; bölümler İngilizce adlı.
// "İlgili dersler" bölümü yoktur (Türkçeden gelir). Pin adları/sırası ve tipik değer sayısı Türkçeyle birebir olmalı (mirrorPart).
const SECTION_EN = {
  'Pins': 'pins', 'How it works': 'how', 'Wiring in the lab': 'wiring', 'Typical values': 'values', 'Common mistakes': 'mistakes',
}

export function parsePartEn(text, file) {
  const fail = (m) => { throw new Error(`${file}: ${m}`) }
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim()
  if (!title) fail('"# Title" yok')
  const head = {}
  const sections = {}
  let cur = null
  for (const l of lines) {
    const m = l.match(/^## (.+?)\s*$/)
    if (m) { cur = SECTION_EN[m[1]]; if (!cur) fail(`bilinmeyen bölüm "${m[1]}" (${Object.keys(SECTION_EN).join(', ')})`); sections[cur] = []; continue }
    if (cur) { sections[cur].push(l); continue }
    const h = l.match(/^(slug|category|summary):\s*(.+)$/)
    if (h) head[h[1]] = h[2].trim()
  }
  for (const k of ['slug', 'category', 'summary']) if (!head[k]) fail(`"${k}:" satırı yok`)
  for (const k of Object.values(SECTION_EN)) if (!sections[k] || !sections[k].join('').trim()) fail(`"${Object.keys(SECTION_EN).find((x) => SECTION_EN[x] === k)}" bölümü yok ya da boş`)
  const bullets = (k) => sections[k].filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim())
  const pins = bullets('pins').map((b) => {
    const m = b.match(/^`?([\w+\-]+)`?:\s*(.+)$/)
    if (!m) fail(`pin satırı "name: description" olmalı: ${b}`)
    return { name: m[1], description: m[2] }
  })
  const typicalValues = bullets('values').map((b) => {
    const [label, value, note] = b.split('|').map((x) => x.trim())
    if (!label || !value) fail(`tipik değer satırı "label | value | note" olmalı: ${b}`)
    return note ? { label, value, note } : { label, value }
  })
  return {
    slug: head.slug, title, category: head.category, summary: head.summary,
    pins,
    howItWorksMd: sections.how.join('\n').trim(),
    wiringMd: sections.wiring.join('\n').trim(),
    typicalValues,
    commonMistakesMd: sections.mistakes.join('\n').trim(),
  }
}

/** İngilizce parça, Türkçesinin aynası olmalı: aynı pin adları (aynı sıra), aynı sayıda tipik değer, not varlığı aynı. */
export function mirrorPart(tr, en, where) {
  if (tr.slug !== en.slug) throw new Error(`${where}: slug "${tr.slug}" olmalı (${en.slug})`)
  const a = tr.pins.map((p) => p.name).join(','), b = en.pins.map((p) => p.name).join(',')
  if (a !== b) throw new Error(`${where}: pinler Türkçeyle aynı olmalı (${a} ≠ ${b})`)
  if (tr.typicalValues.length !== en.typicalValues.length) throw new Error(`${where}: ${tr.typicalValues.length} tipik değer olmalı (${en.typicalValues.length} var)`)
  tr.typicalValues.forEach((v, i) => {
    if (!!v.note !== !!en.typicalValues[i].note) throw new Error(`${where}: tipik değer [${i}] notu Türkçeyle aynı biçimde olmalı`)
  })
  return en
}

/** content-src/parcalar/en/*.md: slug -> İngilizce metin. Her İngilizce dosyanın Türkçesi olmalı; kategori çevirileri tutarlı olmalı. */
export function loadPartsEn(trParts) {
  const dir = join(SRC, 'parcalar', 'en')
  if (!existsSync(dir)) return {}
  const bySlug = new Map(trParts.map((p) => [p.slug, p]))
  const cats = new Map()
  const out = {}
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md') && !x.startsWith('_')).sort()) {
    const where = `parcalar/en/${f}`
    const en = parsePartEn(readFileSync(join(dir, f), 'utf8'), where)
    const tr = bySlug.get(en.slug)
    if (!tr) throw new Error(`${where}: Türkçe parça yok (${en.slug})`)
    if (out[en.slug]) throw new Error(`${where}: slug tekrar: ${en.slug}`)
    mirrorPart(tr, en, where)
    const prev = cats.get(tr.category)
    if (prev && prev !== en.category) throw new Error(`${where}: "${tr.category}" kategorisi başka dosyada "${prev}" diye çevrildi (${en.category})`)
    cats.set(tr.category, en.category)
    const { slug, ...text } = en
    out[slug] = text
  }
  return out
}

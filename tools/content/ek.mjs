// Öğrenme platformu katmanları: ders ekleri (anlatım, kavram kartları, mini test), hafta rehberi ve parça ansiklopedisi.
// build.mjs kullanır; kurallar docs/ogrenme-platformu-kapsam.md ve content-src/modul-3/YAZAR-REHBERI.md'de.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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
  return out
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

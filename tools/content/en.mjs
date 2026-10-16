// İngilizce ders içeriği: content-src/<modül>/<hafta>/en/ altında Türkçe dosyaların aynası.
//   en/NN-<ad>.md       ders (# Title / duration: N / ## Wonder / ## Activity / ## Discuss)
//   en/NN.anlatim.md    anlatım
//   en/NN.json          { concepts, quiz } (Türkçe NN.json ile aynı yapı)
//   en/rehber.md        hafta rehberi
// Ayna kuralları: dil etiketli kod blokları (```cpp …) birebir aynı, etiketsizler (formül, çıktı) çevrilebilir, sayıları aynı; test soruları aynı kimlik, tür, cevap, tolerans,
// seçenek sayısı ve beceriler; kavram kartı sayısı aynı; kod ve satır içi kod dışında Türkçe harf kalmaz.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SRC } from '../sim/lessons.mjs'
import { validateConcepts, validateQuiz } from './ek.mjs'

const pad = (n) => String(n).padStart(2, '0')
const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/

/** Kod blokları (``` … ```), sırasıyla. */
export const codeBlocks = (md) => [...md.matchAll(/```[\s\S]*?```/g)].map((m) => m[0])
/** Kod ve satır içi kod çıkarılmış metinde Türkçe harf geçen ilk parça (yoksa null). */
export function turkishLeft(text) {
  const plain = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const m = plain.match(new RegExp(`[^\\n]{0,30}${TR_CHARS.source}[^\\n]{0,30}`))
  return m ? m[0] : null
}

/** İngilizce ders dosyası: # Title / duration: N / ## Wonder / ## Activity / ## Discuss */
export function parseLessonEn(text, file) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const fail = (m) => { throw new Error(`${file}: ${m}`) }
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim()
  if (!title) fail('"# Title" satırı yok')
  const dur = text.match(/^duration:\s*(\d+)\s*$/m)
  if (!dur) fail('"duration: N" satırı yok')
  const sections = {}
  let cur = null
  for (const l of lines) {
    const m = l.match(/^## (Wonder|Activity|Discuss)\s*$/)
    if (m) { cur = m[1]; sections[cur] = []; continue }
    if (cur) sections[cur].push(l)
  }
  for (const k of ['Wonder', 'Activity', 'Discuss']) if (!sections[k] || !sections[k].join('').trim()) fail(`"## ${k}" bölümü yok ya da boş`)
  return { title, durationMin: Number(dur[1]), problem: sections.Wonder.join('\n').trim(), contentMd: sections.Activity.join('\n').trim(), question: sections.Discuss.join('\n').trim() }
}

/** Dil etiketli bloklar (```cpp, ```python…) program kodudur: birebir aynı kalır. Etiketsiz ve ```text/```md bloklar (formül, şablon, çıktı örneği) çevrilebilir. */
const tagged = (block) => /^```(?!(?:text|txt|md|markdown|plaintext)\b)[A-Za-z0-9+#-]+/.test(block)
function sameCode(tr, en, where) {
  const a = codeBlocks(tr), b = codeBlocks(en)
  if (a.length !== b.length) throw new Error(`${where}: ${a.length} kod bloğu olmalı (${b.length} var)`)
  a.forEach((c, i) => {
    if (c.split('\n')[0] !== b[i].split('\n')[0]) throw new Error(`${where}: ${i + 1}. kod bloğunun dil etiketi aynı olmalı`)
    if (tagged(c) && c !== b[i]) throw new Error(`${where}: ${i + 1}. kod bloğu (${c.split('\n')[0]}) Türkçe sürümle birebir aynı olmalı`)
  })
}
function noTurkish(text, where) {
  const t = turkishLeft(text)
  if (t) throw new Error(`${where}: Türkçe metin kalmış: "${t}"`)
}

/** Test ve kavramlar aynası: kimlik, tür, cevap, tolerans, seçenek sayısı, beceriler aynı. */
export function mirrorQuiz(tr, en, where) {
  if (tr.length !== en.length) throw new Error(`${where}: ${tr.length} soru olmalı`)
  tr.forEach((a, i) => {
    const b = en[i], w = `${where}: quiz[${i}]`
    for (const k of ['id', 'kind', 'answer', 'tolerance']) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) throw new Error(`${w}.${k} Türkçe sürümle aynı olmalı (${JSON.stringify(a[k])})`)
    if (JSON.stringify(a.skills) !== JSON.stringify(b.skills)) throw new Error(`${w}.skills aynı olmalı`)
    if ((a.options?.length ?? 0) !== (b.options?.length ?? 0)) throw new Error(`${w}.options ${a.options?.length ?? 0} seçenek olmalı`)
    sameCode(a.prompt, b.prompt, `${w}.prompt`)
  })
}

/**
 * Bir dersin İngilizcesi (varsa): { title, problem, contentMd, question, explainerMd?, concepts?, quiz? }.
 * `tr`: aynı dersin Türkçe alanları (loadWeek + loadLessonExtras çıktısı). Kısmi çeviri hata: ders dosyası varsa
 * Türkçede olan anlatım ve test de çevrilmiş olmalı.
 */
export function loadLessonEn(moduleDir, weekDir, number, tr, skillIds) {
  const dir = join(SRC, moduleDir, weekDir, 'en')
  if (!existsSync(dir)) return undefined
  const where = `${moduleDir}/${weekDir}/en/${pad(number)}`
  const file = readdirSync(dir).find((f) => new RegExp(`^${pad(number)}-.+\\.md$`).test(f) || new RegExp(`^${number}-.+\\.md$`).test(f))
  if (!file) return undefined
  const L = parseLessonEn(readFileSync(join(dir, file), 'utf8'), `${moduleDir}/${weekDir}/en/${file}`)
  if (L.durationMin !== tr.durationMin) throw new Error(`${where}: duration ${tr.durationMin} olmalı`)
  for (const k of ['problem', 'contentMd', 'question']) { sameCode(tr[k], L[k], `${where}.${k}`); noTurkish(L[k], `${where}.${k}`) }
  noTurkish(L.title, `${where}.title`)
  const out = { title: L.title, problem: L.problem, contentMd: L.contentMd, question: L.question }
  if (tr.explainerMd) {
    const f = join(dir, `${pad(number)}.anlatim.md`)
    if (!existsSync(f)) throw new Error(`${where}.anlatim.md eksik (Türkçe anlatım var)`)
    const t = readFileSync(f, 'utf8').trim()
    sameCode(tr.explainerMd, t, `${where}.anlatim.md`); noTurkish(t, `${where}.anlatim.md`)
    out.explainerMd = t
  }
  if (tr.concepts || tr.quiz) {
    const f = join(dir, `${pad(number)}.json`)
    if (!existsSync(f)) throw new Error(`${where}.json eksik (Türkçe kavram/test var)`)
    let j
    try { j = JSON.parse(readFileSync(f, 'utf8')) } catch (e) { throw new Error(`${where}.json geçersiz JSON: ${e.message}`) }
    if (tr.concepts) {
      const c = validateConcepts(j.concepts, `${where}.json`)
      if (c.length !== tr.concepts.length) throw new Error(`${where}.json: ${tr.concepts.length} kavram olmalı`)
      noTurkish(JSON.stringify(c), `${where}.json concepts`)
      out.concepts = c
    }
    if (tr.quiz) {
      const q = validateQuiz(j.quiz, `${where}.json`, skillIds)
      mirrorQuiz(tr.quiz, q, `${where}.json`)
      noTurkish(q.map((x) => [x.prompt, ...(x.options ?? []), x.explanation, x.unit ?? ''].join('\n')).join('\n'), `${where}.json quiz`)
      out.quiz = q
    }
  }
  return out
}

export function loadWeekGuideEn(moduleDir, weekDir, trGuide) {
  const f = join(SRC, moduleDir, weekDir, 'en', 'rehber.md')
  if (!existsSync(f)) return undefined
  const t = readFileSync(f, 'utf8').trim()
  const where = `${moduleDir}/${weekDir}/en/rehber.md`
  if (!t) throw new Error(`${where} boş`)
  if (trGuide) sameCode(trGuide, t, where)
  noTurkish(t, where)
  return t
}

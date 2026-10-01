// Ders Markdown dosyalarını okur/ayrıştırır. Hem denetleyici hem içerik üretici kullanır.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const SRC = join(ROOT, 'content-src')

/** Biçim:  # Başlık / süre: N / ## Merak / ## Etkinlik / ## Konuşalım */
export function parseLesson(text, file = '') {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const fail = (m) => { throw new Error(`${file}: ${m}`) }
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim()
  if (!title) fail('"# Başlık" satırı yok')
  const dur = text.match(/^süre:\s*(\d+)\s*$/m)
  if (!dur) fail('"süre: N" satırı yok')
  const sections = {}
  let cur = null
  for (const l of lines) {
    const m = l.match(/^## (Merak|Etkinlik|Konuşalım)\s*$/)
    if (m) { cur = m[1]; sections[cur] = []; continue }
    if (cur) sections[cur].push(l)
  }
  for (const k of ['Merak', 'Etkinlik', 'Konuşalım'])
    if (!sections[k] || !sections[k].join('').trim()) fail(`"## ${k}" bölümü yok ya da boş`)
  return {
    title,
    durationMin: Number(dur[1]),
    problem: sections.Merak.join('\n').trim(),
    contentMd: sections.Etkinlik.join('\n').trim(),
    question: sections['Konuşalım'].join('\n').trim(),
  }
}

/** Etkinlik içindeki ```cpp bloklarından "// sketch: ad" ile başlayanları çıkarır. */
export function extractSketches(contentMd) {
  const out = []
  const re = /```cpp\n([\s\S]*?)```/g
  let m
  while ((m = re.exec(contentMd))) {
    const first = m[1].split('\n')[0].match(/^\/\/\s*sketch:\s*([\w-]+)\s*$/)
    if (first) out.push({ name: first[1], source: m[1] })
  }
  return out
}

export function loadWeek(moduleDir, weekDir) {
  const dir = join(SRC, moduleDir, weekDir)
  return readdirSync(dir)
    .filter((f) => /^\d{2,3}-.+\.md$/.test(f))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((f) => {
      const lesson = parseLesson(readFileSync(join(dir, f), 'utf8'), `${moduleDir}/${weekDir}/${f}`)
      return { file: f, number: parseInt(f, 10), ...lesson, sketches: extractSketches(lesson.contentMd) }
    })
}

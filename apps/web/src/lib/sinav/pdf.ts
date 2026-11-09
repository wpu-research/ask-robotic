// Sınav kâğıdı PDF'i (Nişantaşı Üniversitesi "Exam Question and Answer Sheet" biçimi). Kapak: logo, puan tablosu, ders
// bilgileri, kurallar, öğrenci kimliği ve elektronik teslim. Sonraki sayfalar: proje görevi, gereksinim puanları, kod,
// devre bağlantıları, seri çıktı, sınav kaydı (ve varsa çoktan seçmeli / tanım bölümleri). Yalnız sunucu.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib'
import type { Circuit } from '@/lib/lab/contract'
import { examProject } from './projects'
import { DEFINITION_BANK, MCQ_BANK } from './questions'
import { totalScore, type ExamAttempt, type ExamSession } from './service'
import type { ProjectGrade } from './types'

const A4: [number, number] = [595.28, 841.89]
const M = 50
const W = A4[0] - 2 * M
const BLACK = rgb(0, 0, 0), GREY = rgb(0.4, 0.4, 0.4), GREEN = rgb(0.08, 0.5, 0.2), RED = rgb(0.72, 0.15, 0.12), LIGHT = rgb(0.94, 0.94, 0.94)
const TZ = 'Europe/Istanbul'

type Cell = { t: string; bold?: boolean; color?: ReturnType<typeof rgb>; mono?: boolean }

interface Fonts { reg: PDFFont; bold: PDFFont; mono: PDFFont; logo: PDFImage | null }

let assets: Promise<{ reg: Buffer; bold: Buffer; mono: Buffer; logo: Buffer | null }> | null = null
function loadAssets() {
  const dir = path.join(process.cwd(), 'public', 'sinav')
  return (assets ??= Promise.all([
    readFile(path.join(dir, 'DejaVuSans.ttf')), readFile(path.join(dir, 'DejaVuSans-Bold.ttf')), readFile(path.join(dir, 'DejaVuSansMono.ttf')),
    readFile(path.join(dir, 'nisantasi-logo.png')).catch(() => null),
  ]).then(([reg, bold, mono, logo]) => ({ reg, bold, mono, logo })))
}

async function embed(doc: PDFDocument): Promise<Fonts> {
  doc.registerFontkit(fontkit)
  const a = await loadAssets()
  return {
    reg: await doc.embedFont(a.reg, { subset: true }), bold: await doc.embedFont(a.bold, { subset: true }),
    mono: await doc.embedFont(a.mono, { subset: true }), logo: a.logo ? await doc.embedPng(a.logo) : null,
  }
}

const fmtDate = (d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).format(d).replace(/\//g, '.')
const fmtDateTime = (d: Date) => `${fmtDate(d)} ${new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d)}`
const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
// Yazı tipinde olmayan karakterleri (ör. emoji) güvenli karşılıklarla değiştir
const clean = (s: string) => s.replace(/\t/g, '  ').replace(/[^\n\x20-\x7E -ɏͰ-Ͽ‐-‧‰-⁞←-⇿∀-⋿─-◿✓✗]/g, '?')

/** Metni genişliğe göre satırlara böler (\n korunur, çok uzun sözcükler kırılır). */
function wrap(text: string, font: PDFFont, size: number, max: number): string[] {
  const out: string[] = []
  for (const para of clean(text).split('\n')) {
    let line = ''
    for (const word of para.split(/(\s+)/)) {
      if (!word) continue
      const next = line + word
      if (font.widthOfTextAtSize(next, size) <= max) { line = next; continue }
      if (line.trim()) out.push(line.trimEnd())
      let w = word.trimStart()
      while (font.widthOfTextAtSize(w, size) > max) {
        let i = w.length
        while (i > 1 && font.widthOfTextAtSize(w.slice(0, i), size) > max) i--
        out.push(w.slice(0, i)); w = w.slice(i)
      }
      line = w
    }
    out.push(line.trimEnd())
  }
  return out
}

/** Sayfa akışı: y imleci, gerekince yeni sayfa. */
class Flow {
  page!: PDFPage
  y = 0
  constructor(private doc: PDFDocument, private f: Fonts, private header: string) { this.newPage() }
  newPage() {
    this.page = this.doc.addPage(A4)
    this.y = A4[1] - M
    this.page.drawText(clean(this.header), { x: M, y: A4[1] - 30, size: 7.5, font: this.f.reg, color: GREY })
  }
  need(h: number) { if (this.y - h < M) this.newPage() }
  gap(h: number) { this.y -= h }
  text(t: string, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; indent?: number; lead?: number } = {}) {
    const size = o.size ?? 10, font = o.font ?? this.f.reg, lead = o.lead ?? size * 1.35, x = M + (o.indent ?? 0)
    for (const line of wrap(t, font, size, W - (o.indent ?? 0))) {
      this.need(lead)
      this.y -= lead
      this.page.drawText(line, { x, y: this.y + size * 0.28, size, font, color: o.color ?? BLACK })
    }
  }
  heading(t: string) { this.gap(8); this.need(40); this.text(t, { size: 12, font: this.f.bold }); this.gap(3) }
  /** Kenarlıklı tablo; ilk satır başlık. widths toplamı W. */
  table(rows: Array<Array<{ t: string; bold?: boolean; color?: ReturnType<typeof rgb>; mono?: boolean }>>, widths: number[], size = 9) {
    const pad = 4
    rows.forEach((row, ri) => {
      const cells = row.map((c, i) => wrap(c.t, c.mono ? this.f.mono : c.bold || ri === 0 ? this.f.bold : this.f.reg, size, widths[i] - 2 * pad))
      const h = Math.max(...cells.map((l) => l.length)) * size * 1.3 + 2 * pad
      this.need(h)
      let x = M
      row.forEach((c, i) => {
        if (ri === 0) this.page.drawRectangle({ x, y: this.y - h, width: widths[i], height: h, color: LIGHT })
        this.page.drawRectangle({ x, y: this.y - h, width: widths[i], height: h, borderColor: BLACK, borderWidth: 0.6 })
        cells[i].forEach((line, li) => this.page.drawText(line, {
          x: x + pad, y: this.y - pad - (li + 1) * size * 1.3 + size * 0.32, size,
          font: c.mono ? this.f.mono : c.bold || ri === 0 ? this.f.bold : this.f.reg, color: c.color ?? BLACK,
        }))
        x += widths[i]
      })
      this.y -= h
    })
  }
}

// ---------------------------------------------------------------- kapak
function cover(doc: PDFDocument, f: Fonts, s: ExamSession, a: ExamAttempt, cols: Array<{ label: string; points: number; grade: number | null }>, total: { total: number; max: number }) {
  const page = doc.addPage(A4)
  let y = A4[1] - 50
  if (f.logo) {
    const w = 120, h = (f.logo.height / f.logo.width) * w
    page.drawImage(f.logo, { x: M + 10, y: y - h, width: w, height: h })
    y -= h + 30
  } else y -= 60
  const title = 'EXAM QUESTION AND ANSWER SHEET'
  page.drawText(title, { x: (A4[0] - f.bold.widthOfTextAtSize(title, 14)) / 2, y, size: 14, font: f.bold })
  y -= 22

  // Puan tablosu
  const first = 110, rest = Math.min(60, (W - 40 - first) / (cols.length + 1))
  const tw = first + rest * (cols.length + 1)
  const x0 = M + (W - tw) / 2
  const rowH = 15
  const grid: Array<[string, string[]]> = [
    ['Question #', [...cols.map((c) => c.label), 'Total']],
    ['Points', [...cols.map((c) => num(c.points)), num(total.max)]],
    ['Grade', [...cols.map((c) => (c.grade == null ? '' : num(c.grade))), a.submittedAt ? num(total.total) : '']],
    ['Corresponding C.O.', cols.map(() => '').concat([''])],
  ]
  grid.forEach(([head, vals], r) => {
    const h = r === 2 ? rowH + 6 : rowH
    page.drawRectangle({ x: x0, y: y - h, width: first, height: h, borderColor: BLACK, borderWidth: 0.6 })
    page.drawText(head, { x: x0 + (first - f.bold.widthOfTextAtSize(head, 8)) / 2, y: y - h + 4, size: 8, font: f.bold })
    vals.forEach((v, i) => {
      const x = x0 + first + i * rest
      page.drawRectangle({ x, y: y - h, width: rest, height: h, borderColor: BLACK, borderWidth: 0.6 })
      const fnt = r === 0 || (r === 2 && i === vals.length - 1) ? f.bold : f.reg
      const size = r === 0 ? 7.5 : r === 2 ? 10 : 8
      page.drawText(v, { x: x + (rest - fnt.widthOfTextAtSize(v, size)) / 2, y: y - h + 4, size, font: fnt, color: r === 2 ? RED : BLACK })
    })
    y -= h
  })

  // Bilgi kutusu
  const date = a.submittedAt ?? a.startedAt
  const yr = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric' }).format(date))
  const mo = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, month: 'numeric' }).format(date))
  const ay = mo >= 8 ? `${yr}-${yr + 1}` : `${yr - 1}-${yr}`
  const term = mo >= 9 || mo === 1 ? 'Fall' : mo <= 6 ? 'Spring' : 'Summer'
  const box = (t: string) => (t === term ? '■' : '□')
  const type = /final/i.test(s.title) ? 'Final' : /mid|ara/i.test(s.title) ? 'Midterm' : 'Other'
  const tb = (t: string) => (t === type ? '■' : '□')
  const size = 10.5, lead = 13.5, pad = 4
  const rows: Array<Array<[string, number]>> = [
    [['Faculty-School: Faculty of Engineering-Architecture', 0.5], [`Academic Year: ${ay}`, 0.22], [`Term: ${box('Fall')} Fall ${box('Spring')} Spring ${box('Summer')} Summer`, 0.28]],
    [['Course Code and Name: ESOF323 Robotics', 1]],
    [[`Exam Type: ${tb('Midterm')} Midterm ${tb('Final')} Final ${tb('Other')} Other`, 0.5], [`Exam Date: ${fmtDate(date)}`, 0.22], [`Exam Duration: ${s.durationMin} mins`, 0.28]],
    [[[
      '*This exam is taken online in the MacademiaX lab (robotix.macademia.com.tr). Only the exam window may be used; leaving the window is recorded.',
      '*Your personal information (Name, Surname, Student Number) must be entered correctly for your answers to be evaluated.',
      '*All kinds of unethical conducts including cheating or attempts to cheat and all kinds of communications during the exams are illegal actions. If and when conducted necessary actions will be taken against such conducts in line with the relevant articles of the Student Disciplinary Regulations of Higher Education Council and your exam will be considered invalid.',
      '*No extra time will be given to students during the exam. When the time is up, the last saved answers are submitted automatically.',
      'I HAVE READ and UNDERSTOOD the EXAM RULES.',
    ].join('\n'), 1]],
    [[`Name-Surname: ${a.studentName}`, 0.65], [`Student Number: ${a.studentNo}`, 0.35]],
    [['Department: Software Engineering', 0.65], [`Signature: ${a.submittedAt ? `submitted electronically ${fmtDateTime(a.submittedAt)}` : 'not submitted'}`, 0.35]],
  ]
  y -= 0
  for (const row of rows) {
    const cells = row.map(([t, w]) => ({ lines: wrap(t, f.reg, size, W * w - 2 * pad), w: W * w }))
    const h = Math.max(...cells.map((c) => c.lines.length)) * lead + 2 * pad
    let x = M
    for (const c of cells) {
      page.drawRectangle({ x, y: y - h, width: c.w, height: h, borderColor: BLACK, borderWidth: 0.6 })
      c.lines.forEach((l, i) => page.drawText(l, { x: x + pad, y: y - pad - (i + 1) * lead + 3.5, size, font: f.reg }))
      x += c.w
    }
    y -= h
  }
  page.drawText('Document No:  / Release Date: 11.08.2022 / Revision Date: 14.11.2025 / Revision No:', { x: M + 5, y: 70, size: 7.5, font: f.bold })
}

// ---------------------------------------------------------------- tek öğrenci
async function addAttempt(doc: PDFDocument, f: Fonts, s: ExamSession, a: ExamAttempt) {
  const p = examProject(a.projectId)
  const g = (a.projectGrade ?? null) as (ProjectGrade & { error?: string }) | null
  const cfg = s.config
  const t = totalScore(a, cfg)
  const pp = cfg.projectPoints / 100
  const kinds = [['circuit', 'Circuit'], ['code', 'Code'], ['behavior', 'Behaviour']] as const
  const cols: Array<{ label: string; points: number; grade: number | null }> = []
  if (a.mcq.length) cols.push({ label: 'MCQ', points: a.mcq.length * cfg.mcqPoints, grade: a.submittedAt ? a.mcqScore ?? 0 : null })
  if (cfg.definitionPoints > 0) cols.push({ label: 'Definition', points: cfg.definitionPoints, grade: a.definitionScore })
  const overridden = g?.goals && a.projectScore != null && a.projectScore !== g.score
  if (p && !overridden) {
    for (const [k, label] of kinds) {
      const goals = p.goals.filter((x) => x.kind === k)
      const max = goals.reduce((n, x) => n + x.points, 0) * pp
      const earned = g?.goals ? g.goals.filter((x) => x.kind === k).reduce((n, x) => n + x.earned, 0) * pp : null
      cols.push({ label, points: Math.round(max * 10) / 10, grade: earned == null ? null : Math.round(earned * 10) / 10 })
    }
  } else cols.push({ label: 'Project', points: cfg.projectPoints, grade: t.project })
  cover(doc, f, s, a, cols, t)

  const fl = new Flow(doc, f, `ESOF323 Robotics · ${s.title} · ${a.studentNo} ${a.studentName}`)
  if (p) {
    fl.heading(`Project ${p.id.toUpperCase()}: ${p.title} (${cfg.projectPoints} points)`)
    fl.text(p.story, { color: GREY })
    fl.gap(4)
    fl.text(p.brief, { size: 9.5 })
    fl.heading('Graded requirements')
    const rows: Cell[][] = [[{ t: 'Type' }, { t: 'Requirement' }, { t: 'Points' }, { t: 'Result' }]]
    for (const goal of p.goals) {
      const r = g?.goals?.find((x) => x.id === goal.id)
      rows.push([
        { t: goal.kind === 'behavior' ? 'behaviour' : goal.kind }, { t: goal.text }, { t: String(goal.points) },
        r ? { t: r.earned ? `✓ ${r.earned}` : '✗ 0', color: r.earned ? GREEN : RED, bold: true } : { t: '–' },
      ])
    }
    rows.push([{ t: '' }, { t: 'Project score (out of 100)', bold: true }, { t: '100', bold: true }, { t: a.projectScore == null ? '–' : String(a.projectScore), bold: true }])
    fl.table(rows, [62, W - 62 - 50 - 55, 50, 55])
    fl.gap(4)
    if (overridden) fl.text(`The instructor adjusted the project score from ${g!.score} to ${a.projectScore}.`, { size: 9, color: RED })
    fl.text(`Weighted project grade: ${t.project ?? '–'} / ${cfg.projectPoints}. Compiled: ${g ? (g.compiled ? 'yes' : 'no') : 'not graded yet'}.`, { size: 9 })
    if (g?.compileError) fl.text(g.compileError, { size: 8.5, font: f.mono, color: RED })
    if (g?.error) fl.text(g.error, { size: 8.5, color: RED })
  }

  fl.heading('Exam record')
  fl.table([
    [{ t: 'Started' }, { t: 'Submitted' }, { t: 'Left exam window' }, { t: 'Large pastes' }, { t: 'Total' }],
    [{ t: fmtDateTime(a.startedAt) }, { t: a.submittedAt ? fmtDateTime(a.submittedAt) : 'not submitted' }, { t: `${a.flags.blur} times` }, { t: String(a.flags.pastes) }, { t: `${t.total} / ${t.max}`, bold: true }],
  ], [W * 0.24, W * 0.24, W * 0.2, W * 0.14, W * 0.18])
  if (a.teacherNote) { fl.gap(4); fl.text(`Instructor note: ${a.teacherNote}`, { size: 9.5 }) }

  if (cfg.definitionPoints > 0) {
    const d = DEFINITION_BANK.find((x) => x.id === a.definitionId)
    fl.heading(`Definition question (${cfg.definitionPoints} points) – score: ${a.definitionScore ?? 'not graded'}`)
    if (d) fl.text(d.prompt, { size: 9.5, font: f.bold })
    fl.gap(3)
    fl.text(a.answers.definition || '(no answer)', { size: 9.5 })
  }

  if (a.mcq.length) {
    fl.heading(`Multiple choice (${a.mcq.length} × ${cfg.mcqPoints} points) – score: ${a.mcqScore ?? 0}`)
    a.mcq.forEach((m, i) => {
      const q = MCQ_BANK.find((x) => x.id === m.id)
      if (!q) return
      const given = a.answers.mcq[m.id]
      const ok = given === q.answer
      fl.text(`${i + 1}. ${q.q}`, { size: 9, font: f.bold })
      fl.text(`Answer: ${given == null ? '(blank)' : q.options[given]}   ${ok ? '✓' : `✗  correct: ${q.options[q.answer]}`}`, { size: 9, color: ok ? GREEN : RED, indent: 12 })
      fl.gap(2)
    })
  }

  fl.heading('Student code (sketch.ino)')
  const code = (a.code ?? '').replace(/\r/g, '')
  code.split('\n').forEach((line, i) => fl.text(`${String(i + 1).padStart(3)}  ${line}`, { size: 7.5, font: f.mono, lead: 9.6 }))

  const c = a.circuit as Circuit | null
  if (c?.parts) {
    fl.heading('Circuit: parts and connections')
    const props = (o: Record<string, unknown>) => Object.entries(o ?? {}).map(([k, v]) => `${k}=${v}`).join(', ')
    fl.table([[{ t: 'Part' }, { t: 'Type' }, { t: 'Settings' }], ...c.parts.map((x) => [{ t: x.id, mono: true }, { t: x.type }, { t: props(x.props) || '–' }])], [W * 0.22, W * 0.22, W * 0.56], 8.5)
    fl.gap(6)
    const wires = c.wires.map((w) => `${w.a.part}.${w.a.pin}  —  ${w.b.part}.${w.b.pin}`)
    fl.text(`Wires (${wires.length}):`, { size: 9, font: f.bold })
    for (let i = 0; i < wires.length; i += 2) fl.text(wires.slice(i, i + 2).map((w) => w.padEnd(44)).join(''), { size: 7.5, font: f.mono, lead: 9.6 })
  }

  if (g?.serialTail) {
    fl.heading('Serial output during automatic grading')
    g.serialTail.replace(/\r/g, '').split('\n').slice(-60).forEach((l) => fl.text(l, { size: 7.5, font: f.mono, lead: 9.6 }))
  }
}

export async function attemptPdf(s: ExamSession, a: ExamAttempt) {
  const doc = await PDFDocument.create()
  doc.setTitle(`ESOF323 ${s.title} - ${a.studentNo} ${a.studentName}`)
  doc.setAuthor('MacademiaX exam system')
  await addAttempt(doc, await embed(doc), s, a)
  return doc.save()
}

/** Tüm öğrenciler tek dosyada (öğrenci numarasına göre). */
export async function sessionPdf(s: ExamSession, attempts: ExamAttempt[]) {
  const doc = await PDFDocument.create()
  doc.setTitle(`ESOF323 ${s.title} - all students`)
  const f = await embed(doc)
  for (const a of [...attempts].sort((x, y) => x.studentNo.localeCompare(y.studentNo))) await addAttempt(doc, f, s, a)
  if (!attempts.length) doc.addPage(A4).drawText('No students.', { x: M, y: A4[1] - M, size: 12, font: f.reg })
  return doc.save()
}

/** Dosya adı: ESOF323-<sınav kodu>-<no>-<ad>.pdf (ASCII). */
export const pdfName = (s: ExamSession, a?: ExamAttempt) => {
  const ascii = (x: string) => x.normalize('NFKD').replace(/[ıİ]/g, 'i').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return a ? `ESOF323-${s.code}-${ascii(a.studentNo)}-${ascii(a.studentName)}.pdf` : `ESOF323-${s.code}-all-students.pdf`
}

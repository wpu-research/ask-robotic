// LLM dersi tarayıcı simülasyonları: yalnız girdi toplama ve gösterim. Hesabın tamamı lib/llm/* ve lib/ai/tokenizer'da
// (saf, testli). Hiçbir simülasyon ağ isteği atmaz; hepsi öğretim modelidir. Görünüm ESOF 323 .rb-sim kutusuyla aynı;
// LLM'e özgü parçalar llm.css'te (.lm-*). mountLlmSim() durdurma fonksiyonu döndürür.
import { displayToken, encode, getBpe, trainBpe, utf8Bytes, type Bpe, type CorpusId } from '@/lib/ai/tokenizer'
import { SCENARIOS, TOOLS, runAgent, taskOf, type ScenarioId, type ToolName } from '@/lib/llm/agent'
import { COST_DEFAULTS, DEFAULT_PRICES, costReport, latency } from '@/lib/llm/cost'
import { notesFor } from '@/lib/llm/docs'
import { embed, nearest, pca2, project, sentencesOf, type Features } from '@/lib/llm/embed'
import { CASES, METRICS, METRIC_TEXT, RUBRIC_TEXT, evaluate, judgePrompt, type MetricId } from '@/lib/llm/evalbench'
import { INJECTION_SAMPLE, PII_LABEL, PII_SAMPLE, SIGNAL_TEXT, maskPii, scanInjection, wrapUntrusted } from '@/lib/llm/guard'
import { CHECKS, CHECK_TEXT, PATTERNS, PATTERN_TEXT, TASKS, TASK_TEXT, promptReport, type PatternId, type TaskId } from '@/lib/llm/prompt'
import { RAG_DEFAULTS, buildIndex, runRag } from '@/lib/llm/rag'
import { LAB_SCHEMA, extractJson, repairMessage, samplesFor, validate, type SampleId } from '@/lib/llm/schema'
import { SseParser, chunkBytes, eventsFor, serializeSse, splitsChar } from '@/lib/llm/stream'
import type { LlmSimId } from './sim-meta'
import { attn3dSim, rag3dSim, space3dSim } from './sims3d'
import { box, button, check, controls, el, nf, pre, readout, select, slider, T, textInput, type Cfg, type Ctl, type Lang, type Mount } from './dom'

/* ---------------- 1. BPE ---------------- */
const bpe: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const corpus = select(c, t('Derlem', 'Corpus'), [['tr', t('Türkçe mini derlem', 'Turkish mini corpus')], ['en', t('İngilizce mini derlem', 'English mini corpus')], ['karma', t('Karma (TR + EN)', 'Mixed (TR + EN)')], ['ozel', t('Kendi derlemim', 'My own corpus')]], cfg.corpus ?? (lang === 'en' ? 'en' : 'tr'), () => { custom = null; draw() })
  const merges = slider(c, t('Birleştirme sayısı', 'Number of merges'), 0, 120, 1, Number(cfg.merges ?? 40), String, () => draw())
  const sentence = textInput(c, t('Cümlen', 'Your sentence'), t('Öğrenciler motor sürücüsünü bağladılar.', 'The students connected the motor driver.'), () => draw())
  const own = textInput(c, t('Kendi derlemin (Kendi derlemim seçiliyken)', 'Your corpus (when My own corpus is selected)'), t('robot robotlar robotik robotun motor motorlar motorun sensör sensörler', 'robot robots robotic robotics motor motors motoring sensor sensors'), () => { custom = null; draw() }, 3)
  let custom: Bpe | null = null
  const chips = el('div', { class: 'lm-chips' })
  const stats = readout(stage)
  const list = el('ol', { class: 'lm-merges' })
  stage.prepend(box(t('Tokenlar', 'Tokens'), chips))
  stage.append(box(t('Son birleştirmeler (sırayla uygulanır)', 'Latest merges (applied in order)'), list))
  function model(): Bpe {
    if (corpus.v !== 'ozel') return getBpe(corpus.v as CorpusId)
    custom ??= trainBpe(own.v.slice(0, 4000), 120)
    return custom
  }
  function draw() {
    const m = model()
    const n = Math.min(merges.v, m.merges.length)
    const toks = encode(sentence.v, m, n)
    chips.replaceChildren(...toks.map((tk, i) => el('span', { class: `lm-chip c${i % 6}` }, displayToken(tk))))
    const chars = Array.from(sentence.v.replace(/\s+/g, '')).length
    stats.textContent = `${t('Token', 'Tokens')}: ${toks.length} · ${t('karakter', 'characters')}: ${chars} · ${t('token/karakter', 'tokens/char')}: ${chars ? nf(lang)(toks.length / chars) : '0'} · UTF-8 ${t('bayt', 'bytes')}: ${utf8Bytes(sentence.v)}\n${t('Birleştirme', 'Merges')}: ${n}/${m.merges.length}. ${t('· kelime başını gösterir.', '· marks the start of a word.')}`
    const from = Math.max(0, n - 12)
    list.replaceChildren(...m.merges.slice(from, n).map(([a, b], i) => el('li', { value: String(from + i + 1) }, `${displayToken(a)} + ${displayToken(b)} → ${displayToken(a + b)}`)))
  }
  draw()
  return () => {}
}

/* ---------------- 2. Gömme ve benzerlik ---------------- */
const embedSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const notes = notesFor(lang)
  const sents = notes.flatMap((n, ni) => sentencesOf(n.text).map((s) => ({ s, ni, title: n.title })))
  const c = controls(side)
  const feat = select(c, t('Özellikler', 'Features'), [['ikisi', t('Kelime + harf üçlüsü', 'Words + trigrams')], ['kelime', t('Yalnız kelime gövdesi', 'Word stems only')], ['uclu', t('Yalnız harf üçlüsü', 'Character trigrams only')]], cfg.features ?? 'ikisi', () => draw())
  const q = textInput(c, t('Soru', 'Question'), t('LiPo hücre gerilimi en az kaç volt olmalı?', 'What voltage must a LiPo cell not go below?'), () => draw())
  const legend = el('ul', { class: 'lm-legend' })
  c.append(legend)
  const cv = el('canvas', { class: 'sim-canvas', role: 'img', 'aria-label': t('Gömme vektörlerinin 2B izdüşümü', '2D projection of the embedding vectors') })
  cv.style.aspectRatio = '640 / 400'
  stage.append(cv)
  const out = readout(stage)
  const COLORS = ['#0f766e', '#b7791f', '#2c6cb0', '#c43d36', '#7c3aed', '#2f8a57', '#db2777', '#6b5848']
  function draw() {
    const mode = feat.v as Features
    const X = sents.map((x) => embed(x.s, mode, lang))
    const p = pca2(X)
    const qv = embed(q.v, mode, lang)
    const qp = project(qv, p)
    const nn = nearest(qv, X, 3)
    const W = 640, H = 400
    const dpr = Math.min(3, window.devicePixelRatio || 1), cssW = cv.clientWidth || W, k = cssW / W
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * H / W * dpr)
    const ctx = cv.getContext('2d')!
    ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0)
    const cs = getComputedStyle(cv.closest('.rb-sim') ?? cv)
    const g = (n: string) => cs.getPropertyValue(n).trim() || '#888'
    ctx.fillStyle = g('--sim-bg'); ctx.fillRect(0, 0, W, H)
    const all = [...p.points, qp]
    const xs = all.map((a) => a[0]), ys = all.map((a) => a[1])
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
    const sx = (v: number) => 30 + (v - x0) / (x1 - x0 || 1) * (W - 60), sy = (v: number) => H - 30 - (v - y0) / (y1 - y0 || 1) * (H - 60)
    ctx.strokeStyle = g('--gold'); ctx.lineWidth = 1.5
    for (const n of nn) { ctx.beginPath(); ctx.moveTo(sx(qp[0]), sy(qp[1])); ctx.lineTo(sx(p.points[n.index][0]), sy(p.points[n.index][1])); ctx.stroke() }
    p.points.forEach(([a, b], i) => { ctx.fillStyle = COLORS[sents[i].ni % COLORS.length]; ctx.beginPath(); ctx.arc(sx(a), sy(b), nn.some((n) => n.index === i) ? 7 : 4.5, 0, Math.PI * 2); ctx.fill() })
    ctx.fillStyle = g('--ink'); ctx.beginPath(); ctx.moveTo(sx(qp[0]), sy(qp[1]) - 9); ctx.lineTo(sx(qp[0]) + 8, sy(qp[1]) + 6); ctx.lineTo(sx(qp[0]) - 8, sy(qp[1]) + 6); ctx.closePath(); ctx.fill()
    ctx.font = '600 13px Poppins, system-ui, sans-serif'; ctx.fillText(t('soru', 'question'), sx(qp[0]) + 10, sy(qp[1]) - 8)
    out.textContent = `${t('En yakın üç cümle (kosinüs benzerliği):', 'Three nearest sentences (cosine similarity):')}\n${nn.map((n, i) => `${i + 1}. ${nf(lang, 3)(n.score)} · [${sents[n.index].title}] ${sents[n.index].s}`).join('\n')}\n\n${t('Öğretim gömmesi: anlamı değil yüzey örtüşmesini (kelime ve harf üçlüsü) yakalar.', 'Teaching embedding: it captures surface overlap (words and trigrams), not meaning.')}`
  }
  legend.replaceChildren(...notes.map((n, i) => el('li', {}, el('span', { class: 'lm-dot', style: `background:${COLORS[i % COLORS.length]}` }), n.title)))
  draw()
  let lastW = cv.clientWidth
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (cv.clientWidth !== lastW) { lastW = cv.clientWidth; draw() } }) : null
  ro?.observe(cv)
  return () => ro?.disconnect()
}

/* ---------------- 3. Prompt kalıpları ---------------- */
const promptSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const task = select(c, t('Görev', 'Task'), TASKS.map((x) => [x, TASK_TEXT[x][lang]]), cfg.task ?? 'sinif', () => draw())
  const pat = select(c, t('Kalıp', 'Pattern'), PATTERNS.map((x) => [x, PATTERN_TEXT[x][lang]]), cfg.pattern ?? 'etiket', () => draw())
  const checks = el('ul', { class: 'lm-checks' })
  c.append(checks)
  const view = el('div', { class: 'lm-sections' })
  stage.append(view)
  const out = readout(stage)
  const KIND: Record<string, [string, string]> = { rol: ['rol', 'role'], gorev: ['görev', 'task'], kural: ['kurallar', 'rules'], ornek: ['örnekler', 'examples'], adim: ['adımlar', 'steps'], veri: ['veri', 'data'], bicim: ['çıktı biçimi', 'output format'], belirsiz: ['belirsizlikte', 'when unsure'] }
  function draw() {
    const r = promptReport(pat.v as PatternId, task.v as TaskId, lang)
    view.replaceChildren(...r.sections.map((s) => el('div', { class: `lm-sec k-${s.kind}` }, el('small', {}, KIND[s.kind][lang === 'en' ? 1 : 0]), el('pre', {}, s.text))))
    checks.replaceChildren(...CHECKS.map((k) => el('li', { class: r.checks[k] ? 'ok' : 'no' }, `${r.checks[k] ? '✓' : '✗'} ${CHECK_TEXT[k][lang]}`)))
    out.textContent = `${t('Yaklaşık token (öğretim BPE\'si)', 'Approximate tokens (teaching BPE)')}: ${r.tokens} · ${t('kontrol listesi', 'checklist')}: ${r.score}/${CHECKS.length}\n${t('Daha uzun prompt her istekte daha çok giriş tokenı demektir; kararlı kısımlar önbelleğe alınabilir (9. ünite).', 'A longer prompt means more input tokens on every request; the stable parts can be cached (unit 9).')}`
  }
  draw()
  return () => {}
}

/* ---------------- 4. JSON şema ---------------- */
const schemaSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const samples = samplesFor(lang)
  const NAMES: Record<SampleId, [string, string]> = { gecerli: ['Geçerli', 'Valid'], eksik: ['Eksik alan', 'Missing field'], tur: ['Yanlış tür', 'Wrong type'], metin: ['Çevresinde metin', 'Text around it'], enum: ['İzin verilmeyen değerler', 'Values not allowed'], bozuk: ['Bozuk JSON', 'Broken JSON'] }
  const c = controls(side)
  const preset = select(c, t('Örnek çıktı', 'Sample output'), (Object.keys(NAMES) as SampleId[]).map((k) => [k, NAMES[k][lang === 'en' ? 1 : 0]]), cfg.sample ?? 'eksik', () => { ta.value = samples[preset.v as SampleId]; draw() })
  const grid = el('div', { class: 'lm-two' })
  const ta = el('textarea', { class: 'lm-ta lm-code', rows: '8', 'aria-label': t('Model çıktısı', 'Model output'), spellcheck: 'false' })
  ta.value = samples[preset.v as SampleId]
  ta.addEventListener('input', () => draw())
  grid.append(box(t('Şema', 'Schema'), pre(JSON.stringify(LAB_SCHEMA, null, 2), 'lm-code')), box(t('Model çıktısı (düzenleyebilirsin)', 'Model output (you can edit it)'), ta))
  stage.append(grid)
  const out = readout(stage, 'log')
  function draw() {
    const ex = extractJson(ta.value)
    if (!ex.ok) { out.textContent = `✗ ${t('JSON ayrıştırılamadı', 'JSON could not be parsed')}: ${ex.error}\n\n${t('Onarım mesajı', 'Repair message')}:\n${repairMessage([], ex.error, lang)}`; return }
    const errs = validate(LAB_SCHEMA, ex.value!)
    const head = ex.trimmed ? `${t('Not: JSON çevresindeki metin atıldı.', 'Note: the text around the JSON was dropped.')}\n` : ''
    out.textContent = errs.length === 0
      ? `${head}✓ ${t('Şemaya uyuyor. Uygulama bu nesneye güvenebilir.', 'Matches the schema. The application can trust this object.')}`
      : `${head}✗ ${t('Hata', 'Errors')}: ${errs.length}\n${errs.map((e) => `  ${e.path}: ${e.code} (${e.detail})`).join('\n')}\n\n${t('Onarım mesajı (modele geri gider)', 'Repair message (goes back to the model)')}:\n${repairMessage(errs, undefined, lang)}`
  }
  draw()
  return () => {}
}

/* ---------------- 5. Mini RAG ---------------- */
const ragSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const notes = notesFor(lang)
  const c = controls(side)
  const QS = lang === 'en'
    ? ['When is the term project due?', 'What is the default address of the MPU6050?', 'Why should a motor not be wired straight to the pin?', 'What is the capital of France?']
    : ['Dönem projesi ne zaman teslim edilir?', 'MPU6050 varsayılan adresi nedir?', 'Motor neden doğrudan pine bağlanmaz?', 'Fransa\'nın başkenti neresidir?']
  const qsel = select(c, t('Hazır soru', 'Preset question'), QS.map((q) => [q, q]), QS[Number(cfg.q ?? 0)] ?? QS[0], () => { qin.value = qsel.v; q.v = qsel.v; draw() })
  const q = textInput(c, t('Soru', 'Question'), qsel.v, () => draw())
  const qin = c.querySelector<HTMLInputElement>('input.lm-in')!
  const size = slider(c, t('Parça boyu (kelime)', 'Chunk size (words)'), 15, 80, 5, RAG_DEFAULTS.size, String, () => draw())
  const overlap = slider(c, t('Örtüşme (kelime)', 'Overlap (words)'), 0, 20, 1, RAG_DEFAULTS.overlap, String, () => draw())
  const k = slider(c, 'k', 1, 5, 1, RAG_DEFAULTS.k, String, () => draw())
  const th = slider(c, t('Benzerlik eşiği', 'Similarity threshold'), 0, 0.6, 0.02, RAG_DEFAULTS.threshold, nf(lang), () => draw())
  const rr = check(c, t('Yeniden sırala (hibrit: vektör + anahtar kelime)', 'Rerank (hybrid: vector + keyword)'), RAG_DEFAULTS.rerank, () => draw())
  const steps = el('ol', { class: 'lm-pipe' })
  const table = el('div', { class: 'rb-scroll' })
  const ans = el('div', { class: 'lm-answer' })
  const prompt = el('details', { class: 'lm-details' })
  stage.append(steps, table, ans, prompt)
  function draw() {
    const idx = buildIndex(notes, size.v, Math.min(overlap.v, size.v - 5), lang)
    const r = runRag(idx, q.v, { size: size.v, overlap: overlap.v, k: k.v, rerank: rr.v, threshold: th.v }, lang)
    steps.replaceChildren(
      el('li', {}, `${t('Parçala', 'Chunk')}: ${notes.length} ${t('not', 'notes')} → ${r.chunks} ${t('parça', 'chunks')}`),
      el('li', {}, `${t('Göm', 'Embed')}: ${t('64 boyutlu öğretim gömmesi', '64-dimensional teaching embedding')}`),
      el('li', {}, `${t('Ara', 'Search')}: ${t('en yakın', 'nearest')} ${k.v}${rr.v ? ` → ${t('yeniden sırala', 'rerank')}` : ''}`),
      el('li', {}, `${t('Eşik', 'Threshold')} ≥ ${nf(lang)(th.v)}: ${r.used.length} ${t('parça kullanıldı', 'chunks used')}`),
    )
    const rows = r.reranked.map((h) => el('tr', { class: r.used.includes(h) ? 'on' : '' }, el('td', {}, h.chunk.id), el('td', {}, nf(lang, 3)(h.vector)), el('td', {}, nf(lang, 2)(h.keyword)), el('td', {}, nf(lang, 3)(h.score)), el('td', { class: 'lm-snip' }, `${h.chunk.text.slice(0, 90)}…`)))
    table.replaceChildren(el('table', { class: 'rb-table lm-table' }, el('thead', {}, el('tr', {}, ...[t('Parça', 'Chunk'), t('Vektör', 'Vector'), t('Anahtar k.', 'Keyword'), t('Puan', 'Score'), t('Metin', 'Text')].map((h) => el('th', {}, h)))), el('tbody', {}, ...rows)))
    ans.className = `lm-answer ${r.answered ? 'ok' : 'no'}`
    ans.replaceChildren(el('small', {}, r.answered ? t('Cevap (alıntı şablonu, gerçek model değil)', 'Answer (quoting template, not a real model)') : t('Cevap yok', 'No answer')), el('p', {}, r.answer))
    prompt.replaceChildren(el('summary', {}, t('Modele gidecek prompt', 'Prompt that would go to the model')), pre(r.prompt))
  }
  draw()
  return () => {}
}

/* ---------------- 6. Ajan döngüsü ---------------- */
const agentSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const TN: Record<string, [string, string]> = { direnc: ['LED direnci', 'LED resistor'], teslim: ['Proje teslimi', 'Project deadline'], batarya: ['3S LiPo alt sınırı', '3S LiPo lower limit'] }
  const sc = select(c, t('Görev', 'Task'), SCENARIOS.map((s) => [s, TN[s][lang === 'en' ? 1 : 0]]), cfg.scenario ?? 'teslim', () => reset())
  const max = slider(c, t('Azami adım', 'Step limit'), 1, 8, 1, 6, String, () => reset())
  const broken = select(c, t('Bozuk araç', 'Broken tool'), [['', t('yok', 'none')], ...TOOLS.map((x): [string, string] => [x, x])], '', () => reset())
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Bir adım', 'One step'), () => { shown++; draw() })
  button(row, t('Tümü', 'All'), () => { shown = 99; draw() }, 'ghost')
  button(row, t('Sıfırla', 'Reset'), () => reset(), 'ghost')
  const task = el('p', { class: 'lm-task' })
  const tl = el('ol', { class: 'lm-timeline' })
  const fin = el('div', { class: 'lm-answer' })
  stage.append(task, tl, fin)
  let shown = 0
  function reset() { shown = 0; draw() }
  function draw() {
    const run = runAgent(sc.v as ScenarioId, { maxSteps: max.v, broken: (broken.v || null) as ToolName | null }, lang)
    task.textContent = `${t('Görev', 'Task')}: ${taskOf(sc.v as ScenarioId, lang)}`
    const vis = run.steps.slice(0, shown)
    tl.replaceChildren(...vis.map((s) => el('li', { class: s.result.ok ? 'ok' : 'no' },
      el('div', { class: 'lm-th' }, `${s.n}. ${t('Düşünce', 'Thought')}: ${s.thought}`),
      el('code', {}, `${s.tool}(${JSON.stringify(s.args)})`),
      el('div', { class: 'lm-obs' }, `${t('Gözlem', 'Observation')}: ${s.result.text}`))))
    const doneShow = shown >= run.steps.length
    const STOP = { done: t('görev bitti', 'task finished'), limit: t('adım sınırı', 'step limit'), tool_failed: t('araç hatası', 'tool failure') }
    fin.className = `lm-answer ${run.stop === 'done' ? 'ok' : 'no'}`
    fin.replaceChildren(...(doneShow ? [el('small', {}, `${t('Durma nedeni', 'Stop reason')}: ${STOP[run.stop]}`), el('p', {}, run.final)] : [el('small', {}, `${shown}/${run.steps.length} ${t('adım gösterildi', 'steps shown')}`)]))
  }
  draw()
  return () => {}
}

/* ---------------- 7. Değerlendirme ---------------- */
const evalSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const on: Record<MetricId, Ctl<boolean>> = {} as Record<MetricId, Ctl<boolean>>
  for (const m of METRICS) on[m] = check(c, METRIC_TEXT[m][lang], m !== 'em' || cfg.em === '1', () => draw())
  const cases = CASES[lang]
  const pick = select(c, t('Hakem promptu için soru', 'Question for the judge prompt'), cases.map((x, i) => [String(i), `${i + 1}. ${x.q}`]), '1', () => draw())
  const sys = select(c, t('Hakeme giden cevap', 'Answer sent to the judge'), [['b', 'B'], ['a', 'A']], 'b', () => draw())
  const table = el('div', { class: 'rb-scroll' })
  const sum = readout(stage)
  const judge = el('details', { class: 'lm-details' })
  stage.prepend(table)
  stage.append(judge)
  function draw() {
    const A = evaluate('a', lang), B = evaluate('b', lang)
    const ms = METRICS.filter((m) => on[m].v)
    const cell = (r: typeof A.rows[number], m: MetricId) => {
      const v = m === 'em' ? r.em : m === 'nm' ? r.nm : m === 'f1' ? r.f1 : m === 'rubrik' ? r.rubric.total : r.ground.ok ? 1 : 0
      const txt = m === 'f1' ? nf(lang)(v) : m === 'rubrik' ? `${v}/4` : m === 'dayanak' ? (r.ground.ok ? '✓' : `✗ ${r.ground.unsupported.join(', ')}`) : v ? '✓' : '✗'
      const good = m === 'rubrik' ? v >= 3 : m === 'f1' ? v >= 0.5 : v === 1
      return el('td', { class: good ? 'ok' : 'no' }, txt)
    }
    const head = el('tr', {}, el('th', {}, '#'), el('th', {}, t('Soru / altın cevap', 'Question / gold')), el('th', {}, t('Cevaplar', 'Answers')), ...ms.flatMap((m) => [el('th', {}, `A · ${METRIC_TEXT[m][lang]}`), el('th', {}, `B · ${METRIC_TEXT[m][lang]}`)]))
    const rows = cases.map((x, i) => el('tr', {}, el('td', {}, String(i + 1)), el('td', {}, x.q, el('br'), el('b', {}, x.gold)), el('td', { class: 'lm-snip' }, `A: ${x.a}`, el('br'), `B: ${x.b}`), ...ms.flatMap((m) => [cell(A.rows[i], m), cell(B.rows[i], m)])))
    table.replaceChildren(el('table', { class: 'rb-table lm-table' }, el('thead', {}, head), el('tbody', {}, ...rows)))
    sum.textContent = `${t('Ortalama', 'Mean')}:\n${ms.map((m) => `${METRIC_TEXT[m][lang]}: A ${nf(lang)(A.mean[m])} · B ${nf(lang)(B.mean[m])}`).join('\n')}\n\n${t('Rubrik ölçütleri', 'Rubric criteria')}: ${Object.values(RUBRIC_TEXT).map((r) => r[lang]).join(' · ')}`
    const cs = cases[Number(pick.v)]
    judge.replaceChildren(el('summary', {}, t('LLM hakem promptu (gösterilir, çalıştırılmaz)', 'LLM-as-judge prompt (shown, not run)')), pre(judgePrompt(cs, sys.v === 'a' ? cs.a : cs.b, lang)))
  }
  draw()
  return () => {}
}

/* ---------------- 8. Gizlilik ve güvenlik ---------------- */
const guardSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const tab = select(c, t('Sekme', 'Tab'), [['pii', t('Kişisel veri maskeleme', 'Personal data masking')], ['inj', t('Enjeksiyon taraması', 'Injection scan')]], cfg.tab ?? 'pii', () => { ta.value = tab.v === 'pii' ? PII_SAMPLE[lang] : INJECTION_SAMPLE[lang]; draw() })
  const legend = el('p', { class: 'muted rb-small' }, t('Desen tabanlı süzgeç bir katmandır, tek başına yetmez: öğrenci numarası gibi biçimsiz kişisel veriyi yakalamaz.', 'A pattern-based filter is one layer, never enough alone: it does not catch unformatted personal data such as a student number.'))
  c.append(legend)
  const ta = el('textarea', { class: 'lm-ta', rows: '6', 'aria-label': t('Girdi metni', 'Input text'), spellcheck: 'false' })
  ta.value = tab.v === 'pii' ? PII_SAMPLE[lang] : INJECTION_SAMPLE[lang]
  ta.addEventListener('input', () => draw())
  stage.append(box(t('Girdi (düzenleyebilirsin)', 'Input (you can edit it)'), ta))
  const res = el('div', {})
  stage.append(res)
  function draw() {
    if (tab.v === 'pii') {
      const m = maskPii(ta.value)
      const marked = el('p', { class: 'lm-masked' })
      let at = 0
      for (const h of m.hits) { marked.append(ta.value.slice(at, h.start), el('mark', { title: PII_LABEL[h.kind][lang] }, h.text)); at = h.end }
      marked.append(ta.value.slice(at))
      res.replaceChildren(
        box(t('Bulunanlar', 'Found'), marked, el('p', { class: 'rb-small' }, m.hits.length ? m.hits.map((h) => PII_LABEL[h.kind][lang]).join(' · ') : t('kişisel veri bulunamadı', 'no personal data found'))),
        box(t('Modele giden metin', 'Text that goes to the model'), pre(m.masked)),
        box(t('Eşleme (yalnız sunucuda, şifreli kayıt)', 'Mapping (server only, encrypted storage)'), pre(Object.entries(m.map).map(([k, v]) => `${k} = ${v}`).join('\n') || '—')),
      )
    } else {
      const s = scanInjection(ta.value)
      const RISK = { dusuk: t('düşük', 'low'), orta: t('orta', 'medium'), yuksek: t('yüksek', 'high') }
      res.replaceChildren(
        box(`${t('Risk', 'Risk')}: ${RISK[s.risk]}`, el('ul', { class: 'lm-checks' }, ...(s.signals.length ? s.signals.map((x) => el('li', { class: 'no' }, `⚠ ${SIGNAL_TEXT[x][lang]}`)) : [el('li', { class: 'ok' }, t('✓ belirti bulunamadı', '✓ no signs found'))]))),
        box(t('Veri olarak sarmalanmış hâli', 'Wrapped as data'), pre(wrapUntrusted(ta.value, lang))),
      )
    }
  }
  draw()
  return () => {}
}

/* ---------------- 9. Maliyet ---------------- */
const costSim: Mount = (stage, side, _cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const int = (v: number) => Math.round(v).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR')
  const rpd = slider(c, t('Günlük istek', 'Requests per day'), 100, 50000, 100, COST_DEFAULTS.requestsPerDay, int, () => draw())
  const inp = slider(c, t('Giriş tokenı / istek', 'Input tokens / request'), 200, 50000, 100, COST_DEFAULTS.inputTokens, int, () => draw())
  const outp = slider(c, t('Çıkış tokenı / istek', 'Output tokens / request'), 50, 4000, 50, COST_DEFAULTS.outputTokens, int, () => draw())
  const pct = (v: number) => `%${Math.round(v * 100)}`
  const cs = slider(c, t('Önbelleklenebilir ön ek payı', 'Cacheable prefix share'), 0, 1, 0.05, COST_DEFAULTS.cachedShare, pct, () => draw())
  const hit = slider(c, t('Önbellek isabeti', 'Cache hit rate'), 0, 1, 0.05, COST_DEFAULTS.hitRate, pct, () => draw())
  const bs = slider(c, t('Toplu işlemeye uygun pay', 'Share fit for batch'), 0, 1, 0.05, 0, pct, () => draw())
  const pin = slider(c, t('Giriş fiyatı ($ / M token)', 'Input price ($ / M tokens)'), 0.1, 20, 0.1, DEFAULT_PRICES.input, nf(lang), () => draw())
  const pout = slider(c, t('Çıkış fiyatı ($ / M token)', 'Output price ($ / M tokens)'), 0.5, 100, 0.5, DEFAULT_PRICES.output, nf(lang), () => draw())
  const bars = el('div', { class: 'lm-bars' })
  stage.append(bars)
  const out = readout(stage)
  const bar = (label: string, v: number, max: number, cls: string, txt: string) => el('div', { class: 'lm-bar' }, el('span', {}, label), el('i', { class: cls, style: `width:${Math.max(1, (v / (max || 1)) * 100)}%` }), el('b', {}, txt))
  function draw() {
    const prices = { ...DEFAULT_PRICES, input: pin.v, output: pout.v, cacheRead: pin.v * 0.1, cacheWrite: pin.v * 1.25 }
    const r = costReport({ requestsPerDay: rpd.v, inputTokens: inp.v, outputTokens: outp.v, cachedShare: cs.v, hitRate: hit.v, batchShare: bs.v, prices })
    const cold = latency({ inputTokens: inp.v, outputTokens: outp.v, cachedShare: cs.v, hitRate: 0 })
    const warm = latency({ inputTokens: inp.v, outputTokens: outp.v, cachedShare: cs.v, hitRate: 1 })
    const usd = (v: number) => (v === 0 ? '$0' : `$${v < 1 ? v.toFixed(5) : int(v)}`)
    bars.replaceChildren(
      bar(t('Aylık, önbelleksiz', 'Monthly, no cache'), r.plainPerMonth, r.plainPerMonth, 'b0', usd(r.plainPerMonth)),
      bar(t('Aylık, seçtiğin ayarla', 'Monthly, your settings'), r.perMonth, r.plainPerMonth, 'b1', usd(r.perMonth)),
      bar(t('İlk token, önbellek soğuk', 'First token, cold cache'), cold.ttftMs, cold.totalMs, 'b2', `${int(cold.ttftMs)} ms`),
      bar(t('İlk token, önbellek sıcak', 'First token, warm cache'), warm.ttftMs, cold.totalMs, 'b3', `${int(warm.ttftMs)} ms`),
      bar(t('Toplam cevap süresi', 'Total response time'), cold.totalMs, cold.totalMs, 'b0', `${int(cold.totalMs)} ms`),
    )
    out.textContent = `${t('İstek başı', 'Per request')}: ${usd(r.perRequest)} (${t('önbelleksiz', 'no cache')} ${usd(r.plainPerRequest)})\n${t('Aylık token', 'Monthly tokens')}: ${int(r.monthInput)} ${t('giriş', 'input')} · ${int(r.monthOutput)} ${t('çıkış', 'output')}\n${t('Önbellek kazancı', 'Cache saving')}: ${usd(r.cacheSaving)} · ${t('toplu işleme kazancı', 'batch saving')}: ${usd(r.batchSaving)}\n${t('Önbellek okuma girişin %10\'u, yazma %125\'i sayıldı. Gecikme modeli öğretim amaçlıdır, ölçüm değildir. Fiyatlar örnektir; güncelini kontrol et.', 'Cache reads counted at 10% of input, writes at 125%. The latency model is for teaching, not a measurement. Prices are examples; check the current ones.')}`
  }
  draw()
  return () => {}
}

/* ---------------- 10. Akışlı sohbet ---------------- */
const streamSim: Mount = (stage, side, _cfg, lang) => {
  const t = T(lang)
  const notes = notesFor(lang)
  const idx = buildIndex(notes, RAG_DEFAULTS.size, RAG_DEFAULTS.overlap, lang)
  const QS = lang === 'en'
    ? ['When is the term project due?', 'What should be used to charge a LiPo?', 'What does the derivative term do?']
    : ['Dönem projesi ne zaman teslim edilir?', 'LiPo ne ile şarj edilir?', 'Türev terim ne işe yarar?']
  const c = controls(side)
  const q = select(c, t('Soru', 'Question'), QS.map((x) => [x, x]), QS[0], () => stop())
  const speed = slider(c, t('Hız (parça / kare)', 'Speed (chunks / frame)'), 1, 8, 1, 1, String, () => {})
  const maxLen = slider(c, t('Azami parça boyu (bayt)', 'Max chunk size (bytes)'), 4, 64, 4, 16, String, () => {})
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Gönder', 'Send'), () => start())
  button(row, t('Durdur', 'Stop'), () => stop(), 'ghost')
  const chat = el('div', { class: 'lm-chat' })
  const meta = readout(stage)
  const log = readout(stage, 'log')
  stage.prepend(chat)
  let raf = 0, chunks: Uint8Array[] = [], i = 0, parser = new SseParser(), bubble: HTMLElement | null = null
  function stop() { cancelAnimationFrame(raf); raf = 0; if (bubble && !parser.done) bubble.classList.add('cut') }
  function start() {
    stop()
    const r = runRag(idx, q.v, RAG_DEFAULTS, lang)
    chunks = chunkBytes(serializeSse(eventsFor(r.answer)), Date.now() % 1000, maxLen.v)
    i = 0; parser = new SseParser()
    chat.replaceChildren(el('div', { class: 'lm-msg u' }, q.v))
    bubble = el('div', { class: 'lm-msg a' }); chat.append(bubble)
    log.textContent = ''
    const dec = new TextDecoder('utf-8', { fatal: false })
    const tick = () => {
      for (let s = 0; s < speed.v && i < chunks.length; s++, i++) {
        const ch = chunks[i]
        const evs = parser.push(ch)
        const shown = dec.decode(ch).replace(/\n/g, '⏎')
        log.textContent = `${log.textContent}#${i + 1} (${ch.length} B${splitsChar(ch) ? `, ${t('karakter bölündü', 'char split')}` : ''}): ${shown}${evs.length ? `  → ${evs.map((e) => e.event).join(', ')}` : ''}\n`
        log.scrollTop = log.scrollHeight
      }
      bubble!.textContent = parser.text
      meta.textContent = `${t('Parça', 'Chunks')}: ${i}/${chunks.length} · ${t('olay', 'events')}: ${parser.events} · stop_reason: ${parser.stopReason ?? '—'}${parser.done ? ` · ${t('bitti', 'done')}` : ''}`
      if (i < chunks.length) raf = requestAnimationFrame(tick); else raf = 0
    }
    raf = requestAnimationFrame(tick)
  }
  meta.textContent = t('Bir soru seçip Gönder\'e bas. Cevap ders notlarından (mini RAG) gelir; sunucu ve ağ sahtedir.', 'Pick a question and press Send. The answer comes from the course notes (mini RAG); the server and network are fake.')
  return () => cancelAnimationFrame(raf)
}

const SIMS: Record<LlmSimId, Mount> = { bpe, embed: embedSim, prompt: promptSim, schema: schemaSim, rag: ragSim, agent: agentSim, eval: evalSim, guard: guardSim, cost: costSim, stream: streamSim, space3d: space3dSim, rag3d: rag3dSim, attn3d: attn3dSim }

export function mountLlmSim(id: LlmSimId, stage: HTMLElement, side: HTMLElement, cfg: Cfg, lang: Lang): () => void {
  return SIMS[id](stage, side, cfg, lang)
}

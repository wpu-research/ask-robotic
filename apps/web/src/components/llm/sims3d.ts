// LLM dersi 3B simülasyonları: 3B gömme uzayı, RAG geri getirme animasyonu ve dikkat yayları. Denetimler ve metin burada;
// bütün durum lib/llm/space3d ve lib/llm/attn3d'den (saf, testli) gelir. three.js sahneleri (scenes3d.ts) yalnız istemcide,
// dinamik import ile yüklenir. Hareket azaltma tercihi varsa hiçbir şey kendiliğinden oynamaz; geçişler anında olur.
import { attnScene } from '@/lib/llm/attn3d'
import { notesFor } from '@/lib/llm/docs'
import type { Features } from '@/lib/llm/embed'
import { RAG_DEFAULTS, buildIndex, type RagChunk } from '@/lib/llm/rag'
import { RAG_STEPS, STEP_TEXT, buildSpace, chunkItems, ease, lerp3, queryPosAt, queryState, ragAnimation, sentenceItems, stepAt, stepStart, totalSec, type RagAnim, type Space, type V3 } from '@/lib/llm/space3d'
import { button, check, controls, el, nf, readout, select, slider, T, textInput, type Lang, type Mount } from './dom'
import type { SceneHandle, SpaceDraw } from './scenes3d'

const reduceMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** 3B tuval kutusu; three.js yüklenince sahne kurulur. WebGL yoksa açıklama kalır, okuma kutusu yine çalışır. */
function host3d(stage: HTMLElement, lang: Lang, label: string) {
  const t = T(lang)
  const h = el('div', { class: 'lm-3d', role: 'img', 'aria-label': label, 'data-testid': 'llm-3d', 'data-gl': 'wait' })
  const msg = el('p', { class: 'lm-3d-msg' }, t('3B sahne yükleniyor…', 'Loading the 3D scene…'))
  h.append(msg)
  const hint = el('p', { class: 'lm-3d-hint' }, t('Sürükle: döndür · iki parmak / tekerlek: yakınlaş', 'Drag: orbit · pinch / wheel: zoom'))
  stage.append(h, hint)
  let handle: SceneHandle | null = null, dead = false
  return {
    el: h,
    async start(make: (m: typeof import('./scenes3d')) => SceneHandle) {
      const m = await import('./scenes3d')
      if (dead) return
      if (!m.webglOk()) { h.dataset.gl = 'none'; msg.textContent = t('3B görünüm için WebGL gerekli; aşağıdaki sonuçlar yine de güncellenir.', '3D view needs WebGL; the results below still update.'); return }
      msg.remove()
      handle = make(m)
      h.dataset.gl = 'ok'
    },
    get handle() { return handle },
    stop() { dead = true; handle?.dispose(); handle = null },
  }
}

function legend(side: HTMLElement, titles: readonly string[], colors: readonly string[]) {
  side.append(el('ul', { class: 'lm-legend' }, ...titles.map((n, i) => el('li', {}, el('span', { class: 'lm-dot', style: `background:${colors[i % colors.length]}` }), n))))
}
const COLORS = ['#0f766e', '#b7791f', '#2c6cb0', '#c43d36', '#7c3aed', '#2f8a57', '#db2777', '#6b5848']
const pct = (lang: Lang, v: number) => (lang === 'en' ? `${Math.round(v * 100)}%` : `%${Math.round(v * 100)}`)
function axesOf(sp: Space, lang: Lang): [string, string, string] {
  const v = sp.pca.variance, tot = sp.pca.total || 1
  return [0, 1, 2].map((i) => `PC${i + 1} · ${pct(lang, v[i] / tot)}`) as [string, string, string]
}
function flatToggle(c: HTMLElement, lang: Lang, start: boolean, on: (flat: boolean) => void) {
  const t = T(lang)
  let flat = start
  const b = button(c, '', () => { flat = !flat; paint(); on(flat) }, 'ghost')
  b.setAttribute('data-testid', 'llm-3d-flat')
  const paint = () => { b.textContent = flat ? t('3B görünüme geç', 'Switch to 3D') : t('2B görünüme geç (PC1–PC2)', 'Switch to 2D (PC1–PC2)'); b.setAttribute('aria-pressed', String(flat)) }
  paint()
}

/* ---------------- 3B gömme uzayı ---------------- */
export const space3dSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const notes = notesFor(lang)
  const c = controls(side)
  const feat = select(c, t('Özellikler', 'Features'), [['ikisi', t('Kelime + harf üçlüsü', 'Words + trigrams')], ['kelime', t('Yalnız kelime gövdesi', 'Word stems only')], ['uclu', t('Yalnız harf üçlüsü', 'Character trigrams only')]], cfg.features ?? 'ikisi', () => rebuild())
  const q = textInput(c, t('Soru', 'Question'), t('LiPo hücre gerilimi en az kaç volt olmalı?', 'What voltage must a LiPo cell not go below?'), () => update())
  const k = slider(c, t('Komşu sayısı k', 'Neighbours k'), 1, 6, 1, 3, String, () => update())
  const draw: SpaceDraw = { version: 0, points: [], axes: ['PC1', 'PC2', 'PC3'], query: null, queryLabel: t('soru', 'question'), links: [], grow: 1, labels: [], hot: [], flat: cfg.flat === '1' }
  flatToggle(c, lang, draw.flat, (f) => { draw.flat = f })
  legend(c, notes.map((n) => n.title), COLORS)
  const h = host3d(stage, lang, t('Gömme vektörlerinin 3B izdüşümü', '3D projection of the embedding vectors'))
  const out = readout(stage)
  const reduce = reduceMotion()
  let space: Space = buildSpace([], [])
  let from: V3 = [0, 0, 0], to: V3 = [0, 0, 0], tq = 1
  function rebuild() {
    const mode = feat.v as Features
    space = buildSpace(sentenceItems(notes, mode, lang), notes.map((n) => n.title), mode)
    draw.version++
    draw.points = space.points.map((p) => ({ pos: p.pos, group: p.group }))
    draw.axes = axesOf(space, lang)
    update()
  }
  function update() {
    const st = queryState(space, q.v, k.v, lang)
    from = draw.query ?? [0, 0, 0]
    to = st.pos
    tq = reduce || !h.handle ? 1 : 0
    draw.query = tq >= 1 ? to : from
    draw.grow = tq
    draw.links = st.neighbours.map((n) => ({ index: n.index, score: n.score, kind: 'ust' as const, label: nf(lang, 3)(n.score) }))
    // aynı nottan birden çok komşu varsa başlık yalnız ilkinde yazılır (etiketler üst üste binmesin)
    const seen = new Set<string>()
    draw.labels = st.neighbours.map((n, i) => {
      const title = space.points[n.index].label
      const first = !seen.has(title)
      seen.add(title)
      return { index: n.index, text: first ? `${i + 1}. ${title}` : `${i + 1}` }
    })
    draw.hot = st.neighbours.map((n) => n.index)
    const v = space.pca.variance, tot = space.pca.total || 1
    out.textContent = `${t(`En yakın ${k.v} cümle (kosinüs, 64 boyutta):`, `Nearest ${k.v} sentences (cosine, in 64 dimensions):`)}\n${st.neighbours.map((n, i) => `${i + 1}. ${nf(lang, 3)(n.score)} · [${space.points[n.index].label}] ${space.points[n.index].text}`).join('\n')}\n\n${t('Üç eksenin açıkladığı varyans', 'Variance explained by the three axes')}: ${v.map((x) => pct(lang, x / tot)).join(' · ')} (${t('toplam', 'total')} ${pct(lang, (v[0] + v[1] + v[2]) / tot)}). ${t('Komşular izdüşümde değil 64 boyutta bulunur; 3B\'de uzak görünen bir komşu kalan boyutlarda yakındır.', 'Neighbours are found in 64 dimensions, not in the projection; a neighbour that looks far in 3D is close in the remaining dimensions.')}`
  }
  rebuild()
  void h.start((m) => m.mountSpaceScene(h.el, () => draw, (dt) => {
    if (tq < 1) { tq = Math.min(1, tq + dt / 0.7); draw.query = lerp3(from, to, ease(tq)); draw.grow = ease(tq) }
  }))
  return () => h.stop()
}

/* ---------------- 3B RAG geri getirme ---------------- */
export const rag3dSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const notes = notesFor(lang)
  const c = controls(side)
  const QS = lang === 'en'
    ? ['What is the default address of the MPU6050?', 'When is the term project due?', 'Why should a motor not be wired straight to the pin?', 'What is the capital of France?']
    : ['MPU6050 varsayılan adresi nedir?', 'Dönem projesi ne zaman teslim edilir?', 'Motor neden doğrudan pine bağlanmaz?', 'Fransa\'nın başkenti neresidir?']
  const qsel = select(c, t('Hazır soru', 'Preset question'), QS.map((x) => [x, x]), QS[Number(cfg.q ?? 0)] ?? QS[0], () => { qin.value = qsel.v; q.v = qsel.v; restart() })
  const q = textInput(c, t('Soru', 'Question'), qsel.v, () => restart())
  const qin = c.querySelector<HTMLInputElement>('input.lm-in')!
  const k = slider(c, 'k', 1, 5, 1, RAG_DEFAULTS.k, String, () => restart())
  const th = slider(c, t('Benzerlik eşiği', 'Similarity threshold'), 0, 0.6, 0.02, RAG_DEFAULTS.threshold, nf(lang), () => restart())
  const rr = check(c, t('Yeniden sırala (hibrit)', 'Rerank (hybrid)'), RAG_DEFAULTS.rerank, () => restart())
  const row = el('div', { class: 'row' })
  c.append(row)
  const playB = button(row, '', () => { if (clock >= totalSec(anim.frames)) clock = 0; playing = !playing; paint() })
  playB.setAttribute('data-testid', 'llm-rag3d-play')
  button(row, t('Adım ▸', 'Step ▸'), () => {
    playing = false
    const f = anim.frames, s = stepAt(f, clock)
    clock = s.done ? 0 : s.i + 1 >= f.length ? totalSec(f) : stepStart(f, s.i + 1)
    paint()
  }, 'ghost')
  const draw: SpaceDraw = { version: 0, points: [], axes: ['PC1', 'PC2', 'PC3'], query: null, queryLabel: t('soru', 'question'), links: [], grow: 1, labels: [], hot: [], flat: false }
  flatToggle(c, lang, false, (f) => { draw.flat = f })
  legend(c, notes.map((n) => n.title), COLORS)
  const h = host3d(stage, lang, t('Ders notu parçalarının 3B gömme uzayında RAG geri getirme', 'RAG retrieval in the 3D embedding space of the course-note chunks'))
  const steps = el('ol', { class: 'lm-steps3d', 'data-testid': 'llm-rag3d-steps' }, ...RAG_STEPS.map((s) => el('li', {}, STEP_TEXT[s][lang])))
  const ans = el('div', { class: 'lm-answer' })
  const out = readout(stage)
  stage.append(steps, ans)
  stage.insertBefore(out, steps.nextSibling)
  const reduce = reduceMotion()
  const index: RagChunk[] = buildIndex(notes, RAG_DEFAULTS.size, RAG_DEFAULTS.overlap, lang)
  const space = buildSpace(chunkItems(index, notes), notes.map((n) => n.title))
  draw.version = 1
  draw.points = space.points.map((p) => ({ pos: p.pos, group: p.group }))
  draw.axes = axesOf(space, lang)
  let anim: RagAnim = ragAnimation(space, index, q.v, { ...RAG_DEFAULTS }, lang)
  let clock = 0, playing = false, lastStep = -2
  function paint() {
    const f = anim.frames, s = stepAt(f, clock)
    playB.textContent = playing ? t('Duraklat', 'Pause') : s.done ? t('Baştan oynat', 'Replay') : t('Oynat', 'Play')
    const fr = f[s.i]
    draw.query = queryPosAt(anim, clock)
    draw.grow = s.i === 0 ? 0 : reduce ? 1 : ease(Math.min(1, s.p * 2.2))
    const scoreFmt = nf(lang, 3)
    draw.links = fr.links.map((l) => ({ ...l, label: fr.kind === 'sirala' && rr.v ? `${t('hibrit', 'hybrid')} ${scoreFmt(l.score)}` : scoreFmt(l.score) }))
    draw.hot = fr.links.filter((l) => l.kind !== 'aday' && l.kind !== 'elenen').map((l) => l.index)
    draw.labels = fr.links.filter((l) => l.kind !== 'aday').map((l) => ({ index: l.index, text: space.points[l.index].id }))
    if (s.i !== lastStep) {
      lastStep = s.i
      steps.querySelectorAll('li').forEach((li, i) => { li.className = i < s.i ? 'done' : i === s.i ? 'on' : '' })
      const lines = fr.links.map((l, i) => `${i + 1}. ${space.points[l.index].id} · ${draw.links[i].label}${l.kind === 'kullanilan' ? ` ✓ ${t('kullanıldı', 'used')}` : l.kind === 'elenen' ? ` ✗ ${t('eşik/örtüşme altında', 'below threshold/overlap')}` : ''}`)
      out.textContent = `${t('Adım', 'Step')} ${s.i + 1}/${f.length}: ${fr.text[lang]}${lines.length ? `\n${lines.join('\n')}` : `\n${t('Sorgu 64 boyutlu öğretim gömmesine çevrildi ve aynı PCA ile uzaya yerleştirildi.', 'The query was turned into the 64-dimensional teaching embedding and placed in the space with the same PCA.')}`}`
      const last = s.i === f.length - 1
      ans.hidden = !last
      ans.className = `lm-answer ${anim.result.answered ? 'ok' : 'no'}`
      ans.replaceChildren(el('small', {}, anim.result.answered ? t('Cevap (alıntı şablonu, gerçek model değil)', 'Answer (quoting template, not a real model)') : t('Cevap yok', 'No answer')), el('p', {}, anim.result.answer))
    }
  }
  function restart() {
    anim = ragAnimation(space, index, q.v, { ...RAG_DEFAULTS, k: k.v, threshold: th.v, rerank: rr.v }, lang)
    lastStep = -2
    // hareket azaltma tercihinde ya da WebGL yoksa son durum doğrudan gösterilir
    if (reduce || h.el.dataset.gl === 'none') { clock = totalSec(anim.frames); playing = false } else { clock = 0; playing = true }
    paint()
  }
  clock = totalSec(anim.frames)
  paint()
  void h.start((m) => m.mountSpaceScene(h.el, () => draw, (dt) => {
    if (!playing) return
    clock += dt
    if (clock >= totalSec(anim.frames)) { clock = totalSec(anim.frames); playing = false }
    paint()
  })).then(() => { if (!reduce && h.handle) { clock = 0; playing = true; lastStep = -2; paint() } })
  return () => h.stop()
}

/* ---------------- 3B dikkat yayları ---------------- */
export const attn3dSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const variant = select(c, t('Cümle', 'Sentence'), [['0', t('robot kutuyu aldı çünkü o hafifti', 'the robot picked up the box because it was light')], ['1', t('robot kutuyu aldı çünkü o güçlüydü', 'the robot picked up the box because it was strong')]], cfg.variant ?? '0', () => update())
  const tokSel = select(c, t('Sorgu tokenı (ya da sahnede dokun)', 'Query token (or tap it in the scene)'), attnScene(0, 1, 0, lang).tokens.map((x, i) => [String(i), x.text]), cfg.q ?? '4', () => update())
  const tokEl = c.querySelectorAll('select')[1] as HTMLSelectElement
  const tau = slider(c, t('Sıcaklık τ', 'Temperature τ'), 0.25, 3, 0.25, 1, nf(lang), () => update())
  const h = host3d(stage, lang, t('Dikkat ağırlıkları tokenlar arasında 3B yaylar olarak', 'Attention weights as 3D arcs between tokens'))
  const out = readout(stage)
  let draw = { scene: attnScene(0, 1, 4, lang), query: 4, key: '' }
  function update() {
    const qi = Number(tokSel.v)
    const sc = attnScene(Number(variant.v), tau.v, qi, lang)
    // ikinci cümlede son tokenın metni değişir
    tokEl.options[tokEl.options.length - 1].textContent = sc.tokens[sc.tokens.length - 1].text
    draw = { scene: sc, query: qi, key: `${variant.v}|${tau.v}|${qi}` }
    out.textContent = `${t('Sorgu', 'Query')} "${sc.tokens[qi].text}" → ${sc.tokens.map((x, i) => `${x.text} ${pct(lang, sc.weights[i])}`).join(' · ')}\n${t('En çok baktığı', 'Attends most to')}: "${sc.tokens[sc.best].text}". ${t('Yayın yüksekliği ve kalınlığı ağırlıkla orantılı; ağırlıkların toplamı 1. Hesap ML dersindeki dikkat mekanizmasıyla aynı: softmax(QKᵀ / (√d · τ)).', 'Arc height and thickness are proportional to the weight; the weights add up to 1. The computation is the same as in the ML attention lesson: softmax(QKᵀ / (√d · τ)).')}`
  }
  update()
  void h.start((m) => m.mountAttnScene(h.el, lang, () => draw, (i) => { tokSel.v = String(i); tokEl.value = String(i); update() }))
  return () => h.stop()
}

// Robot Kolu dersi tarayıcı simülasyonları: yalnız girdi toplama ve gösterim. Hesabın tamamı lib/robot-kolu/* içindedir
// (saf, testli); 3B sahne (scene3d.ts, three.js) yalnız istemcide, dinamik import ile yüklenir. Hiçbir simülasyon ağ isteği
// atmaz. Hareket azaltma tercihi varsa hiçbir şey kendiliğinden oynamaz. mountRobotSim() durdurma fonksiyonu döndürür.
import { box, button, check, controls, el, nf, pre, readout, select, T, type Cfg, type Lang, type Mount } from '@/components/llm/dom'
import { describeError, runProgram, type RunResult } from '@/lib/robot-kolu/armscript'
import { SAFETY, defaultCell, violation, type Cell, type Item } from '@/lib/robot-kolu/cell'
import { DEG, HOME, HOME_DEG, LIMITS, fk, ik, poseDown, singularities, toRad, toolTilt, type Joints, type Pose } from '@/lib/robot-kolu/kinematics'
import { frameAt, itemsAt } from '@/lib/robot-kolu/playback'
import { SAMPLES, SAMPLE_IDS, sampleSrc, type SampleId } from '@/lib/robot-kolu/samples'
import {
  MOTION_PAIRS, ZONE_DEMO, compareMotion, ikReport, planDemo, shuttleMotion, shuttleStep, solutionLabel, wallCell, workspaceInfo, type MotionPairId, type Shuttle,
} from '@/lib/robot-kolu/simlogic'
import type { RobotSimId } from './sim-meta'
import type { ArmView } from './scene3d'

const reduceMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ---------------- 3B sahne kutusu ---------------- */
interface Scene {
  /** Anahtarlı çizim işlevi: sahne hazır olunca (ya da hemen) çalışır; aynı anahtar bir öncekinin yerini alır. */
  use(fn: (v: ArmView) => void, key?: string): void
  /** Her karede çağrılacak işlev (dt saniye). */
  frame(cb: ((dt: number) => void) | null): void
  dispose(): void
}
function makeScene(stage: HTMLElement, lang: Lang, label: string): Scene {
  const t = T(lang)
  const h = el('div', { class: 'lm-3d rk-3d', role: 'img', 'aria-label': label, 'data-testid': 'robot-3d', 'data-gl': 'wait' })
  const msg = el('p', { class: 'lm-3d-msg' }, t('3B sahne yükleniyor…', 'Loading the 3D scene…'))
  h.append(msg)
  stage.append(h, el('p', { class: 'lm-3d-hint' }, t('Sürükle: döndür · iki parmak / tekerlek: yakınlaş', 'Drag: orbit · pinch / wheel: zoom')))
  let view: ArmView | null = null, dead = false
  const pending = new Map<string, (v: ArmView) => void>()
  let onFrame: ((dt: number) => void) | null = null
  void (async () => {
    const m = await import('./scene3d')
    if (dead) return
    if (!m.webglOk()) { h.dataset.gl = 'none'; msg.textContent = t('3B görünüm için WebGL gerekli; aşağıdaki sayılar yine de güncellenir.', '3D view needs WebGL; the numbers below still update.'); return }
    msg.remove()
    view = m.createArmView(h)
    view.onFrame = onFrame
    h.dataset.gl = 'ok'
    for (const fn of pending.values()) fn(view)
    pending.clear()
  })()
  return {
    use(fn, key = 'draw') { if (view) fn(view); else pending.set(key, fn) },
    frame(cb) { onFrame = cb; if (view) view.onFrame = cb },
    dispose() { dead = true; view?.dispose(); view = null },
  }
}

/* ---------------- ortak denetimler ---------------- */
interface Sl { readonly v: number; set(n: number): void }
/** dom.slider gibi, ama programdan değeri değiştirilebilir. */
function rslider(p: HTMLElement, label: string, min: number, max: number, step: number, val: number, fmt: (v: number) => string, on: () => void): Sl {
  const out = el('output', {}, fmt(val))
  const inp = el('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(val), 'aria-label': label })
  let v = +inp.value
  inp.addEventListener('input', () => { v = +inp.value; out.textContent = fmt(v); on() })
  p.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, el('span', {}, label), out), inp))
  return { get v() { return v }, set(n) { inp.value = String(n); v = +inp.value; out.textContent = fmt(v) } }
}
const f3 = (lang: Lang) => nf(lang, 3)
const mm = (lang: Lang) => (v: number) => `${nf(lang, 0)(v * 1000)} mm`

/** Çalıştırma sonucunu 3B sahnede oynatan denetim (oynat/duraklat, baştan, hız, zaman çubuğu). */
function makePlayer(sc: Scene, host: HTMLElement, lang: Lang, baseItems: () => Item[]) {
  const t = T(lang)
  let res: RunResult | null = null
  let base: Item[] = baseItems()
  let tm = 0, playing = false, speed = 1
  const bar = el('div', { class: 'rk-bar' })
  const play = button(bar, '', () => { if (!res) return; if (tm >= res.duration) tm = 0; playing = !playing; paint() }, '')
  button(bar, t('Baştan', 'Restart'), () => { tm = 0; playing = false; paint() }, 'ghost')
  const spd = el('select', { 'aria-label': t('Oynatma hızı', 'Playback speed') })
  for (const s of [0.5, 1, 2, 4]) spd.append(el('option', { value: String(s) }, `${String(s).replace('.', lang === 'en' ? '.' : ',')}×`))
  spd.value = '1'
  spd.addEventListener('change', () => { speed = +spd.value })
  bar.append(spd)
  const scrub = el('input', { type: 'range', min: '0', max: '0', step: '0.02', value: '0', 'aria-label': t('Zaman', 'Time'), class: 'rk-scrub' })
  scrub.addEventListener('input', () => { tm = +scrub.value; playing = false; paint() })
  const clock = el('span', { class: 'rk-clock' }, '0.00 s')
  host.append(bar, el('div', { class: 'rk-scrub-row' }, scrub, clock))
  function paint() {
    play.textContent = playing ? t('Duraklat', 'Pause') : t('Oynat', 'Play')
    scrub.value = String(tm)
    const dur = res?.duration ?? 0
    clock.textContent = `${nf(lang, 2)(tm)} / ${nf(lang, 2)(dur)} s`
    const r = res, b = base, now = tm
    sc.use((v) => {
      if (r && r.frames.length) {
        const f = frameAt(r.frames, now)
        const s = itemsAt(b, r.events, now)
        v.setQ(f.q); v.setGrip(f.grip); v.setHeld(s.held); v.setItems(s.items)
      } else { v.setQ(HOME); v.setGrip(1); v.setHeld(null); v.setItems(b) }
    })
  }
  sc.frame((dt) => {
    if (!playing || !res) return
    tm = Math.min(res.duration, tm + dt * speed)
    if (tm >= res.duration) playing = false
    paint()
  })
  return {
    load(r: RunResult | null, items: Item[], autoplay: boolean) {
      res = r; base = items; tm = 0
      scrub.max = String(r?.duration ?? 0)
      playing = !!r && autoplay && !reduceMotion() && r.duration > 0
      paint()
    },
    dispose() { playing = false },
  }
}

/* ---------------- 1. çalışma alanı ---------------- */
const workspace: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const z = rslider(c, t('TCP yüksekliği z', 'TCP height z'), 0.03, 0.6, 0.01, Number(cfg.z ?? 0.03), (v) => `${nf(lang, 2)(v)} m`, () => update())
  const r = rslider(c, t('Hedefin eksenden uzaklığı r', 'Distance of the target from the axis r'), 0.1, 1.2, 0.01, 0.55, (v) => `${nf(lang, 2)(v)} m`, () => update())
  const lab = check(c, t('A ve B etiketleri', 'A and B labels'), true, () => update())
  const sc = makeScene(stage, lang, t('Kolun çalışma alanı', 'The arm\'s workspace'))
  const out = readout(stage)
  const items = defaultCell().items
  function update() {
    const info = workspaceInfo(z.v, r.v)
    const q = info.q
    sc.use((v) => {
      v.setItems(items); v.setLabels(lab.v)
      v.setRing(z.v, info.reach?.min ?? 0, info.reach?.max ?? 0)
      v.setTarget([r.v, 0, z.v])
      v.setQ(q ?? HOME); v.setGrip(1)
    })
    const n = f3(lang)
    out.textContent = [
      t(`z = ${n(z.v)} m için yatay erişim (geometrik): ${n(info.reach?.min ?? 0)} ile ${n(info.reach?.max ?? 0)} m`, `Horizontal reach at z = ${n(z.v)} m (geometric): ${n(info.reach?.min ?? 0)} to ${n(info.reach?.max ?? 0)} m`),
      t(`Hedef r = ${n(r.v)} m: ${info.reachable ? `erişilebilir (${info.solutions} çözüm, eklem sınırlarıyla)` : 'ERİŞİLEMİYOR'}`, `Target r = ${n(r.v)} m: ${info.reachable ? `reachable (${info.solutions} solutions, with joint limits)` : 'OUT OF REACH'}`),
      t('A ve B tabandan 0,55 m ileride, y = ∓0,32 m (r ≈ 0,64 m).', 'A and B are 0.55 m in front of the base at y = ∓0.32 m (r ≈ 0.64 m).'),
    ].join('\n')
  }
  update()
  return () => sc.dispose()
}

/* ---------------- 2. ileri kinematik ---------------- */
const fkSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const sl: Sl[] = LIMITS.map(([lo, hi], i) => rslider(c, `q${i + 1}`, Math.round(lo / DEG), Math.round(hi / DEG), 1, HOME_DEG[i], (v) => `${v}°`, () => update()))
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('HOME', 'HOME'), () => { HOME_DEG.forEach((d, i) => sl[i].set(d)); update() }, 'ghost')
  button(row, t('Sıfır duruşu', 'Zero pose'), () => { sl.forEach((s) => s.set(0)); update() }, 'ghost')
  const sc = makeScene(stage, lang, t('Eklem kaydırıcılarıyla sürülen kol', 'The arm driven by the joint sliders'))
  const out = readout(stage)
  const cell = defaultCell(false)
  function update() {
    const q = toRad(sl.map((s) => s.v)) as Joints
    sc.use((v) => { v.setItems(cell.items); v.setQ(q); v.setGrip(1) })
    const f = fk(q)
    const wc = (() => { const R = f.R; return [f.p[0] - R[2] * 0.22, f.p[1] - R[5] * 0.22, f.p[2] - R[8] * 0.22] })()
    const n = f3(lang), sing = singularities(q), vio = violation(q, cell)
    const sname = (s: string) => (s === 'shoulder' ? t('omuz', 'shoulder') : s === 'elbow' ? t('dirsek', 'elbow') : t('bilek', 'wrist'))
    out.textContent = [
      `TCP: x ${n(f.p[0])}  y ${n(f.p[1])}  z ${n(f.p[2])} m`,
      t(`Bilek merkezi: x ${n(wc[0])}  y ${n(wc[1])}  z ${n(wc[2])} m`, `Wrist centre: x ${n(wc[0])}  y ${n(wc[1])}  z ${n(wc[2])} m`),
      t(`Tutucunun aşağıdan sapması: ${nf(lang, 1)(toolTilt(f.R))}°`, `Gripper tilt from down: ${nf(lang, 1)(toolTilt(f.R))}°`),
      t(`Yakın tekillik: ${sing.length ? sing.map(sname).join(', ') : 'yok'}`, `Near singularity: ${sing.length ? sing.map(sname).join(', ') : 'none'}`),
      t(`Hücre: ${!vio ? 'ihlal yok' : vio.kind === 'collision' ? `çarpışma (${vio.with === 'table' ? 'masa' : vio.with})` : vio.kind === 'limit' ? 'eklem sınırı' : 'yasak bölge'}`, `Cell: ${!vio ? 'no violation' : vio.kind === 'collision' ? `collision (${vio.with})` : vio.kind === 'limit' ? 'joint limit' : 'restricted zone'}`),
    ].join('\n')
  }
  update()
  return () => sc.dispose()
}

/* ---------------- 3. ters kinematik ---------------- */
const ikSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const x = rslider(c, 'x', 0, 0.95, 0.01, Number(cfg.x ?? 0.55), (v) => `${nf(lang, 2)(v)} m`, () => update())
  const y = rslider(c, 'y', -0.8, 0.8, 0.01, Number(cfg.y ?? -0.32), (v) => `${nf(lang, 2)(v)} m`, () => update())
  const z = rslider(c, 'z', 0, 0.8, 0.01, Number(cfg.z ?? 0.25), (v) => `${nf(lang, 2)(v)} m`, () => update())
  const yaw = rslider(c, t('Tutucu yaw', 'Gripper yaw'), -180, 180, 1, 0, (v) => `${v}°`, () => update())
  const solSel = el('select', { 'aria-label': t('Çözüm', 'Solution') })
  solSel.addEventListener('change', () => draw())
  c.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, t('Çözüm', 'Solution')), solSel))
  const sc = makeScene(stage, lang, t('Hedefe ters kinematikle götürülen kol', 'The arm taken to the target with inverse kinematics'))
  const out = readout(stage)
  const cell = defaultCell(false)
  let target: Pose = poseDown(0, 0, 0), sols: Joints[] = [], last: Joints = HOME
  function update() {
    target = poseDown(x.v, y.v, z.v, yaw.v)
    sols = ik(target, last)
    const keep = Math.min(solSel.selectedIndex < 0 ? 0 : solSel.selectedIndex, Math.max(0, sols.length - 1))
    solSel.replaceChildren(...sols.map((q, i) => el('option', { value: String(i) }, `${i + 1}: ${solutionLabel(q, target, lang)}`)))
    if (sols.length) solSel.selectedIndex = keep
    draw()
  }
  function draw() {
    const q = sols[solSel.selectedIndex] ?? null
    if (q) last = q
    sc.use((v) => { v.setItems(cell.items); v.setTarget(target.p, yaw.v); v.setGrip(1); v.setQ(q ?? last) })
    const n = f3(lang)
    if (!q) { out.textContent = t(`Hedef (${n(x.v)}; ${n(y.v)}; ${n(z.v)}) erişilemiyor: çözüm sayısı 0. Kol son çözümde kalır.`, `Target (${n(x.v)}; ${n(y.v)}; ${n(z.v)}) is out of reach: 0 solutions. The arm stays at the last solution.`); return }
    const rep = ikReport(target, q)
    out.textContent = [
      t(`Çözüm sayısı: ${sols.length} (en çok 8)`, `Number of solutions: ${sols.length} (at most 8)`),
      `q (°): ${rep.deg.map((d) => nf(lang, 1)(d)).join('  ')}`,
      t(`Doğrulama: FK(IK) farkı ${rep.err.toExponential(1)}`, `Verification: FK(IK) difference ${rep.err.toExponential(1)}`),
      rep.singular.length ? t('Bu çözüm tekilliğe yakın.', 'This solution is near a singularity.') : t('Tekillik yok.', 'No singularity.'),
    ].join('\n')
  }
  update()
  return () => sc.dispose()
}

/* ---------------- 4. PTP ve LIN ---------------- */
const motionSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const pair = select(c, t('Duruş çifti', 'Pose pair'), (Object.keys(MOTION_PAIRS) as MotionPairId[]).map((k) => [k, MOTION_PAIRS[k][lang]] as [string, string]), cfg.pair ?? 'a-b', () => update())
  const spd = rslider(c, t('Hız yüzdesi', 'Speed percentage'), 5, 100, 5, 100, (v) => `${v}%`, () => update())
  const mode = select(c, t('Oynatılan hareket', 'Motion to play'), [['ptp', 'PTP'], ['lin', 'LIN']], 'ptp', () => { tm = 0; playing = false; apply() })
  const row = el('div', { class: 'row' }); c.append(row)
  const playBtn = button(row, '', () => { if (tm >= dur()) tm = 0; playing = !playing; playBtn.textContent = playing ? t('Duraklat', 'Pause') : t('Oynat', 'Play') }, '')
  button(row, t('Baştan', 'Restart'), () => { tm = 0; playing = false; playBtn.textContent = t('Oynat', 'Play'); apply() }, 'ghost')
  playBtn.textContent = t('Oynat', 'Play')
  const sc = makeScene(stage, lang, t('PTP ve LIN izleri', 'PTP and LIN traces'))
  const out = readout(stage)
  const cell = defaultCell(false)
  let cmp = compareMotion('a-b', 100), tm = 0, playing = false
  const dur = () => (mode.v === 'lin' ? (cmp.lin.ok ? cmp.lin.duration : 0) : cmp.ptp.duration)
  const qNow = (): Joints => (mode.v === 'lin' && cmp.lin.ok ? cmp.lin.at(tm) : cmp.ptp.motion.at(tm))
  function apply() { const q = qNow(); sc.use((v) => { v.setQ(q) }) }
  function update() {
    cmp = compareMotion(pair.v as MotionPairId, spd.v)
    tm = 0; playing = false; playBtn.textContent = t('Oynat', 'Play')
    const { to } = MOTION_PAIRS[pair.v as MotionPairId]
    sc.use((v) => {
      v.setItems(cell.items); v.setGrip(1); v.setTarget(to.p)
      v.setTrace('ptp', cmp.ptp.trace, 0x2c6cb0)
      v.setTrace('lin', cmp.lin.ok ? cmp.lin.trace : null, 0x2f8a57)
    })
    apply()
    const n = nf(lang, 2), cm = (v: number) => `${nf(lang, 1)(v * 100)} cm`
    out.textContent = [
      t(`PTP (mavi): ${n(cmp.ptp.duration)} s, yol ${nf(lang, 3)(cmp.ptp.length)} m, doğrudan en çok ${cm(cmp.ptp.maxDev)} sapma`, `PTP (blue): ${n(cmp.ptp.duration)} s, path ${nf(lang, 3)(cmp.ptp.length)} m, up to ${cm(cmp.ptp.maxDev)} off the line`),
      cmp.lin.ok
        ? t(`LIN (yeşil): ${n(cmp.lin.duration)} s, yol ${nf(lang, 3)(cmp.lin.length)} m, sapma ${nf(lang, 6)(cmp.lin.maxDev * 100)} cm`, `LIN (green): ${n(cmp.lin.duration)} s, path ${nf(lang, 3)(cmp.lin.length)} m, deviation ${nf(lang, 6)(cmp.lin.maxDev * 100)} cm`)
        : t(`LIN BAŞARISIZ: ${cmp.lin.fail.kind === 'flip' ? 'kol yapılandırma değiştirmek zorunda (tekillik civarı)' : 'hedef erişilemiyor'}, ${n(cmp.lin.fail.t)} s`, `LIN FAILED: ${cmp.lin.fail.kind === 'flip' ? 'the arm would have to change configuration (near a singularity)' : 'target out of reach'}, at ${n(cmp.lin.fail.t)} s`),
    ].join('\n')
  }
  sc.frame((dt) => {
    if (!playing) return
    tm = Math.min(dur(), tm + dt)
    if (tm >= dur()) { playing = false; playBtn.textContent = t('Oynat', 'Play') }
    apply()
  })
  update()
  return () => sc.dispose()
}

/* ---------------- program çalıştırma yardımcısı (5, 6) ---------------- */
function statsLines(r: RunResult, lang: Lang): string[] {
  const t = T(lang), s = r.stats
  return [
    t(`Süre ${nf(lang, 2)(r.duration)} s · komut ${s.commands} (ptp ${s.ptp}, lin ${s.lin}, plan ${s.plan})`, `Time ${nf(lang, 2)(r.duration)} s · commands ${s.commands} (ptp ${s.ptp}, lin ${s.lin}, plan ${s.plan})`),
    t(`Tutma ${s.picks} · bırakma ${s.places} · düşürme ${s.drops} · adım ${s.steps}`, `Grasps ${s.picks} · releases ${s.places} · drops ${s.drops} · steps ${s.steps}`),
  ]
}

/* ---------------- 5. tutucu ve al-bırak ---------------- */
const pickSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const size = rslider(c, t('Parça boyutu', 'Part size'), 0.04, 0.1, 0.01, Number(cfg.size ?? 0.06), (v) => `${nf(lang, 2)(v)} m`, () => run(false))
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Çalıştır', 'Run'), () => run(true), '')
  const sc = makeScene(stage, lang, t('Al-bırak programı', 'The pick-and-place program'))
  const playerHost = el('div', { class: 'rk-player' }); stage.append(playerHost)
  const src = sampleSrc('al-birak', lang)
  stage.append(box(t('Program (ArmScript)', 'Program (ArmScript)'), pre(src, 'rk-code')))
  const out = readout(stage)
  const pl = makePlayer(sc, playerHost, lang, () => cellOf().items)
  function cellOf(): Cell { const cl = defaultCell(false); cl.items = cl.items.slice(0, 1).map((i) => ({ ...i, size: size.v, pos: [i.pos[0], i.pos[1], size.v / 2] })); return cl }
  function run(auto: boolean) {
    const cl = cellOf()
    const r = runProgram(src, { cell: cl })
    sc.use((v) => { v.setObstacles(cl.obstacles); v.setGrip(1) }, 'setup')
    pl.load(r, cl.items, auto)
    out.textContent = [
      ...statsLines(r, lang),
      r.error ? describeError(r.error, lang) : r.output.join('\n'),
      size.v > 0.08 ? t('Parça 0,08 m açıklıktan geniş: tutucu tutamaz, holding() false.', 'The part is wider than the 0.08 m opening: the gripper cannot take it, holding() is false.') : '',
    ].filter(Boolean).join('\n')
  }
  run(false)
  return () => { pl.dispose(); sc.dispose() }
}

/* ---------------- 6. ArmScript ---------------- */
const SAMPLE_TITLE: Record<SampleId, [string, string]> = {
  'ilk': ['İlk program', 'First program'], 'al-birak': ['Al-bırak', 'Pick-and-place'], 'istif': ['Üç parçayı istifle', 'Stack three parts'], 'duvar': ['Duvarın üstünden taşı (plan)', 'Carry over the wall (plan)'],
  'hata-carpisma': ['Hata: duvara ptp', 'Error: ptp into the wall'], 'hata-erisim': ['Hata: erişim dışı hedef', 'Error: out-of-reach target'], 'hata-sonsuz': ['Hata: sonsuz döngü', 'Error: infinite loop'], 'bitirme': ['Bitirme: paletleme', 'Capstone: palletising'],
}
const scriptSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const first: SampleId = (SAMPLE_IDS as string[]).includes(cfg.sample ?? '') ? (cfg.sample as SampleId) : 'ilk'
  const c = controls(side)
  const sample = select(c, t('Örnek program', 'Example program'), SAMPLE_IDS.map((id) => [id, SAMPLE_TITLE[id][lang === 'en' ? 1 : 0]] as [string, string]), first, () => load())
  const wall = check(c, t('Hücrede duvar var', 'Wall in the cell'), SAMPLES[first].wall, () => run(false))
  const ta = el('textarea', { rows: '16', 'aria-label': t('ArmScript programı', 'ArmScript program'), class: 'lm-ta rk-ta', spellcheck: 'false', 'data-testid': 'armscript-editor' })
  ta.value = sampleSrc(first, lang)
  c.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, t('Program', 'Program')), ta))
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Çalıştır', 'Run'), () => run(true), '').setAttribute('data-testid', 'armscript-run')
  button(row, t('Örneği geri yükle', 'Reload example'), () => load(), 'ghost')
  const sc = makeScene(stage, lang, t('ArmScript programının çalıştığı hücre', 'The cell where the ArmScript program runs'))
  const playerHost = el('div', { class: 'rk-player' }); stage.append(playerHost)
  const log = readout(stage, 'log'); log.setAttribute('data-testid', 'armscript-console')
  const stats = readout(stage)
  let cell: Cell = defaultCell(wall.v)
  const pl = makePlayer(sc, playerHost, lang, () => cell.items)
  function load() {
    const id = sample.v as SampleId
    ta.value = sampleSrc(id, lang)
    wall.v = SAMPLES[id].wall
    const cb = side.querySelector<HTMLInputElement>('input[type=checkbox]') // duvar kutusu, yan panelin tek onay kutusu
    if (cb) cb.checked = wall.v
    run(false)
  }
  function run(auto: boolean) {
    cell = defaultCell(wall.v)
    const r = runProgram(ta.value, { cell })
    sc.use((v) => { v.setObstacles(cell.obstacles); v.setGrip(1) }, 'setup')
    pl.load(r, cell.items, auto)
    log.textContent = [...r.output, r.error ? describeError(r.error, lang) : r.halted ? t('halt ile bitti', 'ended with halt') : t('Program bitti.', 'Program finished.')].join('\n')
    log.classList.toggle('rk-err', !!r.error)
    stats.textContent = statsLines(r, lang).join('\n')
  }
  run(false)
  return () => { pl.dispose(); sc.dispose() }
}

/* ---------------- 7. planlama ---------------- */
const planSim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const h = rslider(c, t('Duvar yüksekliği', 'Wall height'), 0.1, 0.6, 0.02, Number(cfg.h ?? 0.42), (v) => `${nf(lang, 2)(v)} m`, () => reset())
  const seed = rslider(c, t('Tohum', 'Seed'), 1, 20, 1, 1, String, () => reset())
  const budget = select(c, t('Yineleme bütçesi', 'Iteration budget'), [['2', '2'], ['20', '20'], ['200', '200'], ['4000', '4000']], '4000', () => reset())
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Doğrudan PTP', 'Direct PTP'), () => direct(), 'ghost').setAttribute('data-testid', 'plan-direct')
  button(row, t('Planla', 'Plan'), () => plan(), '').setAttribute('data-testid', 'plan-run')
  const sc = makeScene(stage, lang, t('Duvarlı hücrede planlama', 'Planning in the cell with the wall'))
  const out = readout(stage)
  let motion: { duration: number; at(t: number): Joints } | null = null, stopAt = Infinity, tm = 0, playing = false
  const cellItems = defaultCell(false).items
  const q0 = ik(poseDown(0.55, -0.32, 0.25), HOME)[0]
  function reset() {
    motion = null; playing = false; tm = 0
    const cell = wallCell(h.v)
    sc.use((v) => { v.setItems(cellItems); v.setGrip(1); v.setObstacles(cell.obstacles); v.setTrace('direct', null); v.setTrace('plan', null); v.setQ(q0) }, 'setup')
    out.textContent = t('Önce "Doğrudan PTP" ile doğrudan hareketi dene, sonra "Planla".', 'First try the direct move with "Direct PTP", then "Plan".')
  }
  function direct() {
    const d = planDemo(h.v, seed.v, 1)
    motion = d.directMotion; tm = 0; playing = !reduceMotion()
    stopAt = d.direct ? d.direct.at * d.directMotion.duration : Infinity
    const trace = Array.from({ length: 81 }, (_, i) => fkP(d.directMotion.at((i / 80) * d.directMotion.duration)))
    sc.use((v) => v.setTrace('direct', trace, 0xdc2626))
    out.textContent = d.direct
      ? t(`Doğrudan PTP ÇARPIŞIR: hareketin %${nf(lang, 0)(d.direct.at * 100)}'inde, ${d.direct.v.kind === 'collision' ? `uzuv ${d.direct.v.link} (${['taban', 'üst kol', 'ön kol', 'bilek-tutucu'][d.direct.v.link]}) ile ${d.direct.v.with === 'wall' ? 'duvar' : d.direct.v.with}` : 'ihlal'}. Kol çarpmadan hemen önce durur.`,
          `Direct PTP COLLIDES: at ${nf(lang, 0)(d.direct.at * 100)}% of the motion, link ${d.direct.v.kind === 'collision' ? `${d.direct.v.link} (${['base', 'upper arm', 'forearm', 'wrist-gripper'][d.direct.v.link]}) with ${d.direct.v.with}` : 'violation'}. The arm stops just before it hits.`)
      : t('Bu duvar yüksekliğinde doğrudan PTP çarpışmıyor.', 'At this wall height the direct PTP does not collide.')
  }
  function plan() {
    const d = planDemo(h.v, seed.v, Number(budget.v))
    playing = false; tm = 0; stopAt = Infinity
    if (!d.plan.ok || !d.motion) {
      motion = null
      sc.use((v) => { v.setTrace('plan', null); v.setQ(q0) })
      out.textContent = t(`plan-failed: ${d.plan.reason === 'no-path' ? `${d.plan.iterations} yinelemede yol bulunamadı (yol olmadığı anlamına gelmez; bütçeyi artır ya da tohumu değiştir)` : d.plan.reason}. Düğüm: ${d.plan.nodes}.`,
        `plan-failed: ${d.plan.reason === 'no-path' ? `no path found in ${d.plan.iterations} iterations (this does not mean there is none; raise the budget or change the seed)` : d.plan.reason}. Nodes: ${d.plan.nodes}.`)
      return
    }
    motion = d.motion; playing = !reduceMotion()
    sc.use((v) => { v.setTrace('plan', d.trace, 0x2f8a57); v.setTrace('direct', null) })
    out.textContent = t(`Yol bulundu: ${d.plan.iterations} yineleme, ${d.plan.nodes} düğüm; ham yol ${d.plan.rawLength}, düzleştirilmiş ${d.plan.path.length} nokta; süre ${nf(lang, 2)(d.motion.duration)} s. Çarpışmasız.`,
      `Path found: ${d.plan.iterations} iterations, ${d.plan.nodes} nodes; raw path ${d.plan.rawLength}, smoothed ${d.plan.path.length} points; time ${nf(lang, 2)(d.motion.duration)} s. Collision-free.`)
  }
  sc.frame((dt) => {
    if (!playing || !motion) return
    tm = Math.min(Math.min(motion.duration, stopAt), tm + dt)
    if (tm >= Math.min(motion.duration, stopAt)) playing = false
    const q = motion.at(tm)
    sc.use((v) => v.setQ(q))
  })
  reset()
  return () => sc.dispose()
}
const fkP = (q: Joints) => fk(q).p

/* ---------------- 8. hücre güvenliği ---------------- */
const REASON: Record<string, [string, string]> = {
  estop: ['acil durdurma', 'emergency stop'], 'human-stop': ['insan çok yakın', 'person too close'], 'human-slow': ['insan yakın: yavaş', 'person near: slow'], zone: ['yasak bölge', 'restricted zone'], manual: ['elle kipi', 'manual mode'],
}
const safetySim: Mount = (stage, side, cfg, lang) => {
  const t = T(lang)
  const c = controls(side)
  const present = check(c, t('İnsan hücrede', 'A person is in the cell'), cfg.human !== '0', () => tick(0))
  const hx = rslider(c, t('İnsan x', 'Person x'), -1.2, 1.2, 0.05, 1, (v) => `${nf(lang, 2)(v)} m`, () => tick(0))
  const hy = rslider(c, t('İnsan y', 'Person y'), -1.2, 1.2, 0.05, 0.9, (v) => `${nf(lang, 2)(v)} m`, () => tick(0))
  const manual = check(c, t('Elle kipi (hız tavanı)', 'Manual mode (speed cap)'), false, () => tick(0))
  const zone = check(c, t('Yasak bölge', 'Restricted zone'), false, () => { sc.use((v) => v.setZones(zone.v ? [ZONE_DEMO] : [])); tick(0) })
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Acil durdurma', 'Emergency stop'), () => { eStop = true; tick(0) }, '').setAttribute('data-testid', 'safety-estop')
  button(row, t('Sıfırla', 'Reset'), () => { reset() }, 'ghost').setAttribute('data-testid', 'safety-reset')
  const playBtn = button(row, '', () => { playing = !playing; playBtn.textContent = playing ? t('Duraklat', 'Pause') : t('Oynat', 'Play') }, 'ghost')
  const sc = makeScene(stage, lang, t('Hücrede mekik yapan kol ve insan', 'The shuttling arm and a person in the cell'))
  const out = readout(stage)
  const m = shuttleMotion()
  const cell = defaultCell(false)
  let s: Shuttle = { t: 0, dir: 1 }, eStop = false, playing = !reduceMotion(), msg = '', acc = 0
  playBtn.textContent = playing ? t('Duraklat', 'Pause') : t('Oynat', 'Play')
  const env = () => ({ human: present.v ? ([hx.v, hy.v] as [number, number]) : null, eStop, manual: manual.v, zones: zone.v ? [ZONE_DEMO] : [] })
  function reset() {
    const e = env()
    const r = shuttleStep(s, 0, { ...e, eStop: false }, m)
    if (r.safety.state === 'stop') msg = t('Sıfırlanamadı: başka bir durdurma nedeni sürüyor (insan çok yakın ya da yasak bölge).', 'Cannot reset: another stop reason remains (person too close or restricted zone).')
    else { eStop = false; msg = t('Acil durdurma sıfırlandı.', 'Emergency stop reset.') }
    tick(0)
  }
  function tick(dt: number) {
    const r = shuttleStep(s, dt, env(), m)
    s = r.s
    sc.use((v) => {
      v.setItems(cell.items); v.setGrip(1); v.setQ(r.q)
      v.setHuman(present.v ? [hx.v, hy.v] : null, r.safety.state === 'ok' ? 'ok' : r.safety.state === 'slow' ? 'slow' : 'stop')
    })
    acc += dt
    if (dt === 0 || acc > 0.1) {
      acc = 0
      const st = { ok: t('NORMAL', 'NORMAL'), slow: t('YAVAŞ', 'SLOW'), stop: t('DUR', 'STOP') }[r.safety.state]
      out.textContent = [
        t(`Durum: ${st} · hız ölçeği ${nf(lang, 2)(r.safety.speedScale)}`, `State: ${st} · speed scale ${nf(lang, 2)(r.safety.speedScale)}`),
        r.safety.humanDist === null ? t('İnsan: yok', 'Person: none') : t(`İnsan–kol uzaklığı: ${nf(lang, 2)(r.safety.humanDist)} m (yavaşla ≤ ${SAFETY.slowDist} m, dur ≤ ${SAFETY.stopDist} m)`, `Person–arm distance: ${nf(lang, 2)(r.safety.humanDist)} m (slow ≤ ${SAFETY.slowDist} m, stop ≤ ${SAFETY.stopDist} m)`),
        t(`Nedenler: ${r.safety.reasons.length ? r.safety.reasons.map((x) => REASON[x][0]).join(', ') : 'yok'}`, `Reasons: ${r.safety.reasons.length ? r.safety.reasons.map((x) => REASON[x][1]).join(', ') : 'none'}`),
        eStop ? t('Acil durdurma BASILI (mandallı): Sıfırla ile açılır.', 'Emergency stop PRESSED (latched): release with Reset.') : '',
        msg,
      ].filter(Boolean).join('\n')
    }
  }
  sc.use((v) => v.setZones([]), 'setup')
  sc.frame((dt) => { if (playing) tick(dt) })
  tick(0)
  return () => sc.dispose()
}

/* ---------------- kayıt ---------------- */
const SIMS: Record<RobotSimId, Mount> = { workspace, fk: fkSim, ik: ikSim, motion: motionSim, pick: pickSim, script: scriptSim, plan: planSim, safety: safetySim }
export function mountRobotSim(id: RobotSimId, stage: HTMLElement, side: HTMLElement, cfg: Cfg, lang: Lang): () => void {
  return SIMS[id](stage, side, cfg, lang)
}

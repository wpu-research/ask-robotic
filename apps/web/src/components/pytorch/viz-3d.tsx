'use client'
// PyTorch 3B görselleştiricileri: kayıp yüzeyinde SGD/Momentum/RMSprop/Adam yörüngeleri ve eğitilmiş CNN'in öznitelik
// haritalarının katman katman 3B görünümü. Sayılar lib/pytorch (nets, scene3d, cnn) saf fonksiyonlarından; three.js yalnız çizer.
// prefers-reduced-motion açıksa yörüngeler kendiliğinden oynamaz, tamamı hemen gösterilir.
import { useMemo, useState } from 'react'
import { OPTS, type OptK, type Surface } from '@/lib/pytorch/nets'
import { cnnLayout, surfaceGrid, trajectories, type Plane } from '@/lib/pytorch/scene3d'
import { runCnn, type CnnTrace } from '@/lib/pytorch/cnn'
import { reducedMotion, Stage3DHost, type Mount3D, type Three } from '@/components/kurs/stage3d-host'
import { Check, Readout, Select, Slider, Stage, tx, type L } from '@/components/opencv/cv-ui'
import { OPT_COL } from './viz-a'
import { DrawPad, Probs, useCnn } from './viz-b'

// ---------------------------------------------------------------- kayıp yüzeyi
interface LossState { s: Surface; paths: Record<string, Array<[number, number, number]>> }
const mountLoss: Mount3D<LossState> = (T, stage, st0) => {
  const S = stage.scene
  let surface: InstanceType<Three['Mesh']> | null = null, curSurf: Surface | null = null
  const group = new T.Group(); S.add(group)
  const balls: Record<string, InstanceType<Three['Mesh']>> = {}
  for (const k of OPTS) { const b = new T.Mesh(new T.SphereGeometry(0.05, 16, 12), new T.MeshStandardMaterial({ color: OPT_COL[k] })); balls[k] = b; S.add(b) }
  let st = st0, t = 0
  const animate = !reducedMotion()
  const build = () => {
    if (st.s !== curSurf) {
      if (surface) { S.remove(surface); surface.geometry.dispose(); (surface.material as InstanceType<Three['Material']>).dispose() }
      const g = surfaceGrid(st.s, 56), geo = new T.BufferGeometry(), n = g.n, idx: number[] = [], col = new Float32Array(g.val.length * 3)
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1; idx.push(a, c, b, b, c, d) }
      g.val.forEach((v, k) => { const c = new T.Color().setHSL((220 - 200 * v) / 360, 0.6, 0.35 + 0.35 * v); col.set([c.r, c.g, c.b], k * 3) })
      geo.setAttribute('position', new T.BufferAttribute(g.pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals()
      surface = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, side: T.DoubleSide, roughness: 0.9, transparent: true, opacity: 0.92 }))
      S.add(surface); curSurf = st.s
    }
    group.children.slice().forEach((c) => { group.remove(c); (c as InstanceType<Three['Line']>).geometry.dispose() })
    for (const k of OPTS) {
      const p = st.paths[k]
      balls[k].visible = !!p?.length
      if (!p?.length) continue
      const line = new T.Line(new T.BufferGeometry().setFromPoints(p.map(([x, y, z]) => new T.Vector3(x, y + 0.02, z))), new T.LineBasicMaterial({ color: OPT_COL[k] }))
      group.add(line)
    }
    t = animate ? 0 : 1e9
  }
  build()
  return {
    update(s) { st = s; build() },
    frame(dt) {
      t += dt * 25
      for (const k of OPTS) { const p = st.paths[k]; if (!p?.length) continue; const q = p[Math.min(p.length - 1, Math.floor(t))]; balls[k].position.set(q[0], q[1] + 0.05, q[2]) }
      if (animate && t > 160) t = 0
    },
  }
}
export function Loss3DViz({ lang }: { lang: L }) {
  const [s, setS] = useState<Surface>('valley'), [lr, setLr] = useState(0.05), [alr, setAlr] = useState(0.3), [steps, setSteps] = useState(120)
  const [on, setOn] = useState<Record<OptK, boolean>>({ sgd: true, momentum: true, rmsprop: false, adam: true })
  const paths = useMemo(() => trajectories(s, { sgd: lr, momentum: lr, rmsprop: alr, adam: alr }, steps, OPTS.filter((k) => on[k])), [s, lr, alr, steps, on])
  const state = useMemo<LossState>(() => ({ s, paths }), [s, paths])
  return (
    <Stage side={<>
      <Select label={tx(lang, 'Yüzey', 'Surface')} value={s} onChange={setS} options={[['valley', tx(lang, 'Dar vadi', 'Narrow valley')], ['rosenbrock', 'Rosenbrock'], ['saddle', tx(lang, 'Eyer', 'Saddle')]]} />
      <Slider label="lr (SGD, Momentum)" value={lr} min={0.001} max={1.1} step={0.001} onChange={setLr} fmt={(v) => v.toFixed(3)} />
      <Slider label="lr (RMSprop, Adam)" value={alr} min={0.005} max={1} step={0.005} onChange={setAlr} fmt={(v) => v.toFixed(3)} />
      <Slider label={tx(lang, 'Adım', 'Steps')} value={steps} min={10} max={300} step={10} onChange={setSteps} />
      {OPTS.map((k) => <Check key={k} label={k} value={on[k]} onChange={(v) => setOn({ ...on, [k]: v })} />)}
      <Readout testId="pt-loss3d">{OPTS.filter((k) => on[k]).map((k) => `${k.padEnd(8)} ${paths[k]?.length ?? 0} ${tx(lang, 'nokta', 'points')}${(paths[k]?.length ?? 0) < steps + 1 ? ` · ${tx(lang, 'ıraksadı', 'diverged')}` : ''}`).join('\n')}</Readout>
    </>}>
      <Stage3DHost lang={lang} mount={mountLoss} state={state} view={{ pos: [3.2, 3, 3.6], target: [0, 0.2, 0] }} label={tx(lang, 'Kayıp yüzeyi (yükseklik: log(1 + f)) ve optimize edici yörüngeleri', 'Loss surface (height: log(1 + f)) and optimiser trajectories')} height={360} testId="pt-3d-loss" />
      <p className="rb-small muted">{OPTS.map((k) => <span key={k} style={{ color: OPT_COL[k], marginRight: 12 }}>■ {k}</span>)}</p>
    </Stage>
  )
}

// ---------------------------------------------------------------- CNN katmanları
function mapTexture(T: Three, p: Plane) {
  const { fm, ch } = p, n = fm.w * fm.h, off = ch * n, data = new Uint8Array(n * 4)
  let mx = 1e-6; for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(fm.data[off + i]))
  for (let y = 0; y < fm.h; y++) for (let x = 0; x < fm.w; x++) {
    // DataTexture alttan başlar: satırları ters yaz
    const v = fm.data[off + y * fm.w + x] / mx, o = ((fm.h - 1 - y) * fm.w + x) * 4
    if (p.key === 'input') { const g = Math.round(127 + 127 * Math.max(-1, Math.min(1, v))); data[o] = data[o + 1] = data[o + 2] = g }
    else { data[o] = 255 * Math.max(0, v); data[o + 1] = 160 * Math.abs(v); data[o + 2] = 60 * Math.abs(v) }
    data[o + 3] = 255
  }
  const t = new T.DataTexture(data, fm.w, fm.h); t.magFilter = T.NearestFilter; t.needsUpdate = true
  return t
}
const mountCnn: Mount3D<CnnTrace | null> = (T, stage, tr0) => {
  const group = new T.Group(); stage.scene.add(group)
  const clear = () => group.children.slice().forEach((c) => { group.remove(c); const m = c as InstanceType<Three['Mesh']>; m.geometry?.dispose(); const mat = m.material as InstanceType<Three['MeshBasicMaterial']>; mat?.map?.dispose(); mat?.dispose() })
  const build = (tr: CnnTrace | null) => {
    clear()
    if (!tr) return
    for (const p of cnnLayout(tr)) {
      const m = new T.Mesh(new T.PlaneGeometry(p.size, p.size), new T.MeshBasicMaterial({ map: mapTexture(T, p), side: T.DoubleSide }))
      m.position.set(...p.pos); group.add(m)
    }
  }
  build(tr0)
  return { update: build, dispose: clear }
}
export function Cnn3DViz({ lang }: { lang: L }) {
  const W = useCnn()
  const [px, setPx] = useState<Uint8ClampedArray | null>(null)
  const tr = useMemo(() => (W && px ? runCnn(W, px) : null), [W, px])
  return (
    <Stage side={<>
      <DrawPad lang={lang} onDigit={setPx} />
      <Readout testId="pt-cnn3d">{!W ? tx(lang, 'Ağırlıklar yükleniyor…', 'Loading weights…') : tr ? `${tx(lang, 'tahmin', 'prediction')}: ${tr.pred}\n${tx(lang, 'katmanlar', 'layers')}: 1×28² → 8×28² → 8×14² → 16×14² → 16×7² → 10` : tx(lang, 'Bir rakam çiz; katmanlar 3B sahnede belirir.', 'Draw a digit; the layers appear in the 3D scene.')}</Readout>
      {tr && <Probs probs={tr.probs} lang={lang} />}
    </>}>
      <Stage3DHost lang={lang} mount={mountCnn} state={tr} view={{ pos: [4.2, 2.6, 2.4], target: [0, 1, -3.2] }} label={tx(lang, 'Girdi, conv1, pool1, conv2, pool2: her düzlem bir öznitelik haritası', 'Input, conv1, pool1, conv2, pool2: each plane is a feature map')} height={360} testId="pt-3d-cnn" />
    </Stage>
  )
}

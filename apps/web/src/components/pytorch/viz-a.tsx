'use client'
// PyTorch görselleştiricileri 1: şekil oyun alanı, autograd grafiği, katman kurucu, optimize edici yarışı, DataLoader,
// evrişim aritmetiği. Hesaplar lib/pytorch'taki saf fonksiyonlarla (testli); PyTorch tarayıcıda çalışmaz, bunlar aynı
// matematiği gösterir.
import { useMemo, useState } from 'react'
import { broadcast, batches, convOut, fmtShape, matmul, parseShape, receptive, stepsPerEpoch, view, type ShapeResult } from '@/lib/pytorch/tensor'
import { backward, DEFAULT_LEAVES, forward, GRAPH, numericGrad, sgdStep, type Leaves, type NodeId } from '@/lib/pytorch/autograd'
import { layerText, OPTS, optimize, summary, surf, SURF_MIN, SURF_START, type Layer, type OptK, type Surface } from '@/lib/pytorch/nets'
import { Check, Readout, Select, Slider, Stage, tx, type L } from '@/components/opencv/cv-ui'

export const OPT_COL: Record<OptK, string> = { sgd: '#e6194b', momentum: '#f58231', rmsprop: '#3cb44b', adam: '#4363d8' }
const f3 = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : 'NaN')

// ---------------------------------------------------------------- 1. şekiller
type TOp = 'add' | 'matmul' | 'view' | 'reshape'
export function TensorViz({ lang }: { lang: L }) {
  const [op, setOp] = useState<TOp>('add'), [a, setA] = useState('8, 1, 6, 1'), [b, setB] = useState('7, 1, 5'), [contig, setContig] = useState(true)
  const sa = parseShape(a), sb = parseShape(b)
  const res: ShapeResult | null = !sa || !sb ? null : op === 'add' ? broadcast(sa, sb) : op === 'matmul' ? matmul(sa, sb) : view(sa, sb, contig, op)
  const presets: Record<TOp, Array<[string, string]>> = {
    add: [['8, 1, 6, 1', '7, 1, 5'], ['64', '64, 1'], ['3, 4', '4'], ['3, 4', '3']],
    matmul: [['64, 784', '784, 10'], ['64, 784', '128, 10'], ['10, 2, 3', '3, 4'], ['3', '3']],
    view: [['4, 3, 28, 28', '4, -1'], ['6', '4, -1'], ['2, 3', '3, 2']],
    reshape: [['2, 3', '3, 2'], ['4, 3, 28, 28', '-1, 784']],
  }
  // yayınlama hizalaması: sağdan
  const align = op === 'add' && sa && sb ? (() => { const n = Math.max(sa.length, sb.length); return Array.from({ length: n }, (_, i) => [sa[sa.length - n + i], sb[sb.length - n + i]]) })() : null
  return (
    <Stage side={<>
      <Select label={tx(lang, 'İşlem', 'Operation')} value={op} onChange={(v) => { setOp(v); setA(presets[v][0][0]); setB(presets[v][0][1]) }} options={[['add', tx(lang, 'a + b (yayınlama)', 'a + b (broadcasting)')], ['matmul', 'a @ b (matmul)'], ['view', 'a.view(b)'], ['reshape', 'a.reshape(b)']]} />
      <label className="sl"><span className="sl-h"><span>{op === 'view' || op === 'reshape' ? tx(lang, 'a şekli', 'shape of a') : tx(lang, 'a şekli', 'shape of a')}</span></span><input className="pt-input" value={a} onChange={(e) => setA(e.target.value)} data-testid="pt-shape-a" /></label>
      <label className="sl"><span className="sl-h"><span>{op === 'view' || op === 'reshape' ? tx(lang, 'hedef şekil (-1 olabilir)', 'target shape (may use -1)') : tx(lang, 'b şekli', 'shape of b')}</span></span><input className="pt-input" value={b} onChange={(e) => setB(e.target.value)} /></label>
      {(op === 'view' || op === 'reshape') && <Check label={tx(lang, 'a bitişik değil (ör. a = x.T)', 'a is not contiguous (e.g. a = x.T)')} value={!contig} onChange={(v) => setContig(!v)} />}
      <div className="row">{presets[op].map(([p, q]) => <button key={p + q} type="button" className="sbtn ghost" onClick={() => { setA(p); setB(q) }}>{`(${p}) ${op === 'add' ? '+' : op === 'matmul' ? '@' : '→'} (${q})`}</button>)}</div>
    </>}>
      <div className="readout pt-mono" data-testid="pt-shape-out">
        {!res ? tx(lang, 'Şekli virgülle ayrılmış tam sayılar olarak yaz.', 'Type the shape as comma-separated integers.')
          : res.ok ? <><span className="pt-ok">✓ {fmtShape(res.shape)}</span>{res.note && <><br />{res.note}</>}</> : <span className="pt-bad">{res.error}</span>}
      </div>
      {align && (
        <table className="rb-table cv-table">
          <thead><tr><th>{tx(lang, 'boyut (sağdan hizalı)', 'dim (right-aligned)')}</th>{align.map((_, i) => <th key={i}>{i - align.length}</th>)}</tr></thead>
          <tbody>
            <tr><td>a</td>{align.map(([x], i) => <td key={i}>{x ?? '·'}</td>)}</tr>
            <tr><td>b</td>{align.map(([, y], i) => <td key={i}>{y ?? '·'}</td>)}</tr>
            <tr><td>{tx(lang, 'uyum', 'match')}</td>{align.map(([x, y], i) => { const X = x ?? 1, Y = y ?? 1; const ok = X === Y || X === 1 || Y === 1; return <td key={i} className={ok ? 'pt-ok' : 'pt-bad'}>{ok ? Math.max(X, Y) : '✗'}</td> })}</tr>
          </tbody>
        </table>
      )}
    </Stage>
  )
}

// ---------------------------------------------------------------- 2. autograd
const POS: Record<NodeId, [number, number]> = { x1: [40, 40], w1: [40, 95], x2: [40, 160], w2: [40, 215], b: [40, 275], t: [520, 275], m1: [165, 68], m2: [165, 188], s: [280, 128], z: [370, 185], y: [470, 185], d: [570, 215], L: [650, 215] }
export function AutogradViz({ lang }: { lang: L }) {
  const [lv, setLv] = useState<Leaves>(DEFAULT_LEAVES)
  const [phase, setPhase] = useState<'none' | 'fwd' | 'bwd'>('none'), [k, setK] = useState(0)
  const v = useMemo(() => forward(lv), [lv]), bw = useMemo(() => backward(v), [v])
  const shownGrad = new Set<NodeId>(phase === 'bwd' ? ['L', ...bw.steps.slice(0, k).flatMap((s) => s.pass.map((p) => p.to))] : [])
  const nodeTxt = (id: NodeId) => { const n = GRAPH.find((g) => g.id === id)!; return n.label }
  return (
    <Stage side={<>
      {(['x1', 'w1', 'x2', 'w2', 'b', 't'] as const).map((key) => <Slider key={key} label={key} value={lv[key]} min={-3} max={3} step={0.1} onChange={(x) => { setLv({ ...lv, [key]: x }); setPhase('fwd') }} fmt={(x) => x.toFixed(1)} />)}
      <div className="row">
        <button type="button" className="sbtn" onClick={() => { setPhase('fwd'); setK(0) }}>{tx(lang, 'İleri', 'Forward')}</button>
        <button type="button" className="sbtn" onClick={() => { setPhase('bwd'); setK((x) => Math.min(bw.steps.length, phase === 'bwd' ? x + 1 : 1)) }} data-testid="pt-backward">{tx(lang, 'Geri (adım)', 'Backward (step)')}</button>
        <button type="button" className="sbtn ghost" onClick={() => { setPhase('bwd'); setK(bw.steps.length) }}>{tx(lang, 'Tümü', 'All')}</button>
        <button type="button" className="sbtn ghost" onClick={() => { setLv(sgdStep(lv, 0.1)); setPhase('fwd') }}>{tx(lang, 'SGD adımı (lr 0,1)', 'SGD step (lr 0.1)')}</button>
      </div>
      <Readout testId="pt-grad">{`L = ${f3(v.L)}\n∂L/∂w₁ = ${f3(bw.grads.w1)}  (${tx(lang, 'sayısal', 'numeric')} ${f3(numericGrad(lv, 'w1'))})\n∂L/∂w₂ = ${f3(bw.grads.w2)}  (${f3(numericGrad(lv, 'w2'))})\n∂L/∂b  = ${f3(bw.grads.b)}  (${f3(numericGrad(lv, 'b'))})`}</Readout>
      {phase === 'bwd' && k > 0 && <Readout>{(() => { const s = bw.steps[k - 1]; return `${nodeTxt(s.node)}: ${tx(lang, 'gelen', 'incoming')} ${f3(s.grad)}\n${s.pass.map((p) => `→ ${p.to}: ${tx(lang, 'yerel', 'local')} ${f3(p.local)} × ${f3(s.grad)} = ${f3(p.contrib)}`).join('\n')}` })()}</Readout>}
    </>}>
      <svg viewBox="0 0 700 310" className="pt-svg" role="img" aria-label={tx(lang, 'Hesaplama grafiği', 'Computational graph')}>
        <defs><marker id="pt-ar" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor" /></marker></defs>
        {GRAPH.filter((n) => n.inputs.length).flatMap((n) => n.inputs.map((i) => {
          const [x1, y1] = POS[i], [x2, y2] = POS[n.id]
          const active = phase === 'bwd' && bw.steps.slice(0, k).some((s) => s.node === n.id)
          return <line key={i + n.id} x1={x1 + 28} y1={y1} x2={x2 - 34} y2={y2} stroke={active ? '#d33682' : '#888'} strokeWidth={active ? 2.5 : 1.2} markerEnd="url(#pt-ar)" style={{ color: active ? '#d33682' : '#888' }} />
        }))}
        {GRAPH.map((n) => {
          const [x, y] = POS[n.id], param = n.requiresGrad
          return (
            <g key={n.id} transform={`translate(${x},${y})`}>
              <rect x={-34} y={-20} width={68} height={40} rx={8} fill={param ? 'rgba(67,99,216,.15)' : 'rgba(128,128,128,.12)'} stroke={param ? '#4363d8' : '#888'} />
              <text textAnchor="middle" y={-6}>{n.label.length > 11 ? n.id : n.label}</text>
              {phase !== 'none' && <text textAnchor="middle" y={7} className="mut">{f3(v[n.id])}</text>}
              {shownGrad.has(n.id) && <text textAnchor="middle" y={18} fill="#d33682" style={{ fill: '#d33682' }}>∇ {f3(bw.grads[n.id])}</text>}
            </g>
          )
        })}
      </svg>
      <p className="rb-small muted">{tx(lang, 'Mavi kutular requires_grad=True yapraklar (parametreler). Gri sayı: ileri değer; pembe ∇: ∂L/∂düğüm.', 'Blue boxes are requires_grad=True leaves (parameters). Gray number: forward value; pink ∇: ∂L/∂node.')}</p>
    </Stage>
  )
}

// ---------------------------------------------------------------- 3. katmanlar
const MNIST_CNN: Layer[] = [{ kind: 'Conv2d', in: 1, out: 8, k: 3, s: 1, p: 1 }, { kind: 'ReLU' }, { kind: 'MaxPool2d', k: 2, s: 2 }, { kind: 'Conv2d', in: 8, out: 16, k: 3, s: 1, p: 1 }, { kind: 'ReLU' }, { kind: 'MaxPool2d', k: 2, s: 2 }, { kind: 'Flatten' }, { kind: 'Linear', in: 784, out: 10 }]
const MLP: Layer[] = [{ kind: 'Flatten' }, { kind: 'Linear', in: 784, out: 128 }, { kind: 'ReLU' }, { kind: 'Dropout', p: 0.2 }, { kind: 'Linear', in: 128, out: 10 }]
type AddK = 'Linear' | 'Conv2d' | 'MaxPool2d' | 'ReLU' | 'Flatten' | 'Dropout' | 'BatchNorm2d'
export function LayersViz({ lang }: { lang: L }) {
  const [layers, setLayers] = useState<Layer[]>(MNIST_CNN), [inp, setInp] = useState('1, 28, 28')
  const [add, setAdd] = useState<AddK>('Linear'), [n1, setN1] = useState(10), [n2, setN2] = useState(10), [k, setK] = useState(3)
  const shape = parseShape(inp) ?? [1, 28, 28]
  const s = useMemo(() => summary(shape, layers), [shape.join(','), layers]) // eslint-disable-line react-hooks/exhaustive-deps
  const mk = (): Layer => add === 'Linear' ? { kind: 'Linear', in: n1, out: n2 } : add === 'Conv2d' ? { kind: 'Conv2d', in: n1, out: n2, k, s: 1, p: Math.floor(k / 2) } : add === 'MaxPool2d' ? { kind: 'MaxPool2d', k: 2, s: 2 } : add === 'Dropout' ? { kind: 'Dropout', p: 0.3 } : add === 'BatchNorm2d' ? { kind: 'BatchNorm2d', c: n1 } : { kind: add }
  const edit = (i: number, l: Layer) => setLayers(layers.map((x, j) => (j === i ? l : x)))
  return (
    <Stage side={<>
      <label className="sl"><span className="sl-h"><span>{tx(lang, 'Girdi şekli (yığın hariç)', 'Input shape (without batch)')}</span></span><input className="pt-input" value={inp} onChange={(e) => setInp(e.target.value)} /></label>
      <div className="row">
        <button type="button" className="sbtn ghost" onClick={() => { setLayers(MNIST_CNN); setInp('1, 28, 28') }}>MNIST CNN</button>
        <button type="button" className="sbtn ghost" onClick={() => { setLayers(MLP); setInp('1, 28, 28') }}>MLP</button>
        <button type="button" className="sbtn ghost" onClick={() => setLayers([])}>{tx(lang, 'Temizle', 'Clear')}</button>
      </div>
      <Select label={tx(lang, 'Katman ekle', 'Add a layer')} value={add} onChange={setAdd} options={(['Linear', 'Conv2d', 'MaxPool2d', 'ReLU', 'Flatten', 'Dropout', 'BatchNorm2d'] as AddK[]).map((x) => [x, x])} />
      {(add === 'Linear' || add === 'Conv2d' || add === 'BatchNorm2d') && <Slider label={add === 'Linear' ? 'in_features' : 'in_channels'} value={n1} min={1} max={1024} onChange={setN1} />}
      {(add === 'Linear' || add === 'Conv2d') && <Slider label={add === 'Linear' ? 'out_features' : 'out_channels'} value={n2} min={1} max={512} onChange={setN2} />}
      {add === 'Conv2d' && <Slider label="kernel_size" value={k} min={1} max={7} step={2} onChange={setK} />}
      <button type="button" className="sbtn" onClick={() => setLayers([...layers, mk()])}>{tx(lang, 'Ekle', 'Add')}</button>
      <Readout testId="pt-params">{`${tx(lang, 'toplam parametre', 'total parameters')}: ${s.total.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}\n${s.ok ? '✓' : '✗ ' + tx(lang, 'şekil hatası', 'shape error')}`}</Readout>
    </>}>
      <ol className="pt-layers" data-testid="pt-layers">
        <li><span>{tx(lang, 'girdi', 'input')}</span><span>[N, {shape.join(', ')}]</span><span /></li>
        {s.rows.map((r, i) => (
          <li key={i} className={r.error ? 'err' : undefined}>
            <span>
              {layerText(r.layer)}
              {r.layer.kind === 'Linear' && r.error && <button type="button" onClick={() => { const prev = i ? s.rows[i - 1].out : shape; if (prev) edit(i, { ...(r.layer as Extract<Layer, { kind: 'Linear' }>), in: prev[prev.length - 1] }) }}> {tx(lang, '[düzelt]', '[fix]')}</button>}
              {r.error && <><br /><small className="pt-bad">{r.error}</small></>}
            </span>
            <span>{r.out ? `[N, ${r.out.join(', ')}]` : '—'}</span>
            <span>{r.params ? r.params.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR') : ''} <button type="button" aria-label={tx(lang, 'Sil', 'Delete')} onClick={() => setLayers(layers.filter((_, j) => j !== i))}>✕</button></span>
          </li>
        ))}
      </ol>
    </Stage>
  )
}

// ---------------------------------------------------------------- 4. optimize ediciler
export function OptimViz({ lang }: { lang: L }) {
  const [s, setS] = useState<Surface>('valley'), [lr, setLr] = useState(0.05), [steps, setSteps] = useState(100), [on, setOn] = useState<Record<OptK, boolean>>({ sgd: true, momentum: true, rmsprop: true, adam: true })
  const [adamLr, setAdamLr] = useState(0.3)
  const paths = useMemo(() => Object.fromEntries(OPTS.map((k) => [k, optimize(k, s, k === 'adam' || k === 'rmsprop' ? adamLr : lr, steps)])) as Record<OptK, Array<[number, number, number]>>, [s, lr, adamLr, steps])
  const box = s === 'valley' ? { x0: -10, x1: 10, y0: -3, y1: 3 } : s === 'rosenbrock' ? { x0: -2, x1: 2, y0: -1, y1: 3 } : { x0: -4, x1: 4, y0: -2, y1: 4 }
  const W = 640, H = 300, X = (x: number) => ((x - box.x0) / (box.x1 - box.x0)) * W, Y = (y: number) => H - ((y - box.y0) / (box.y1 - box.y0)) * H
  // kontur: ızgarada log f, eşit aralıklı renk bantları
  const cells = useMemo(() => {
    const out: Array<{ x: number; y: number; v: number }> = [], n = 48, m = 24
    let lo = Infinity, hi = -Infinity
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const x = box.x0 + ((i + 0.5) / n) * (box.x1 - box.x0), y = box.y0 + ((j + 0.5) / m) * (box.y1 - box.y0)
      const v = Math.log(1e-3 + Math.abs(surf(s, x, y).f)); lo = Math.min(lo, v); hi = Math.max(hi, v); out.push({ x: i, y: j, v })
    }
    return out.map((c) => ({ ...c, v: (c.v - lo) / (hi - lo) }))
  }, [s]) // eslint-disable-line react-hooks/exhaustive-deps
  const [mx, my] = SURF_MIN[s]
  return (
    <Stage side={<>
      <Select label={tx(lang, 'Yüzey', 'Surface')} value={s} onChange={setS} options={[['valley', tx(lang, 'Dar vadi', 'Narrow valley')], ['rosenbrock', 'Rosenbrock'], ['saddle', tx(lang, 'Eyer', 'Saddle')]]} />
      <Slider label={tx(lang, 'lr (SGD, Momentum)', 'lr (SGD, Momentum)')} value={lr} min={0.001} max={1.2} step={0.001} onChange={setLr} fmt={f3} />
      <Slider label={tx(lang, 'lr (RMSprop, Adam)', 'lr (RMSprop, Adam)')} value={adamLr} min={0.005} max={1} step={0.005} onChange={setAdamLr} fmt={f3} />
      <Slider label={tx(lang, 'Adım', 'Steps')} value={steps} min={10} max={500} step={10} onChange={setSteps} />
      {OPTS.map((k) => <Check key={k} label={k === 'sgd' ? 'SGD' : k === 'momentum' ? 'SGD + momentum 0,9' : k === 'rmsprop' ? 'RMSprop' : 'Adam'} value={on[k]} onChange={(v) => setOn({ ...on, [k]: v })} />)}
      <Readout testId="pt-optim">{OPTS.filter((k) => on[k]).map((k) => { const p = paths[k].at(-1)!; return `${k.padEnd(8)} f = ${Number.isFinite(p[2]) ? p[2].toExponential(2) : tx(lang, 'ıraksadı', 'diverged')}` }).join('\n')}</Readout>
    </>}>
      <svg viewBox={`0 0 ${W} ${H}`} className="pt-svg" role="img" aria-label={tx(lang, 'Kayıp yüzeyi ve yörüngeler', 'Loss surface and trajectories')}>
        {cells.map((c) => <rect key={c.x + '-' + c.y} x={(c.x / 48) * W} y={H - ((c.y + 1) / 24) * H} width={W / 48 + 0.5} height={H / 24 + 0.5} fill={`hsl(${220 - 200 * c.v}, 60%, ${30 + 40 * c.v}%)`} opacity={0.55} />)}
        <circle cx={X(mx)} cy={Y(my)} r={6} fill="none" stroke="#fff" strokeWidth={2} />
        <circle cx={X(SURF_START[s][0])} cy={Y(SURF_START[s][1])} r={5} fill="#fff" />
        {OPTS.filter((k) => on[k]).map((k) => <polyline key={k} fill="none" stroke={OPT_COL[k]} strokeWidth={2} points={paths[k].filter((p) => Number.isFinite(p[0])).map((p) => `${X(Math.max(box.x0 - 5, Math.min(box.x1 + 5, p[0])))},${Y(Math.max(box.y0 - 5, Math.min(box.y1 + 5, p[1])))}`).join(' ')} />)}
      </svg>
      <p className="rb-small muted">{OPTS.map((k) => <span key={k} style={{ color: OPT_COL[k], marginRight: 12 }}>■ {k}</span>)}{tx(lang, ' · beyaz halka: minimum', ' · white ring: minimum')}</p>
    </Stage>
  )
}

// ---------------------------------------------------------------- 6. DataLoader
export function LoaderViz({ lang }: { lang: L }) {
  const [n, setN] = useState(50), [bs, setBs] = useState(8), [shuffle, setShuffle] = useState(true), [drop, setDrop] = useState(false), [seed, setSeed] = useState(0), [epoch, setEpoch] = useState(0)
  const bt = useMemo(() => batches(n, bs, { shuffle, dropLast: drop, seed, epoch }), [n, bs, shuffle, drop, seed, epoch])
  const seen = new Set(bt.flat())
  const col = (i: number) => `hsl(${(i * 47) % 360}, 55%, 45%)`
  return (
    <Stage side={<>
      <Slider label={tx(lang, 'Örnek sayısı N', 'Number of samples N')} value={n} min={5} max={120} onChange={setN} />
      <Slider label="batch_size" value={bs} min={1} max={32} onChange={setBs} />
      <Check label="shuffle=True" value={shuffle} onChange={setShuffle} />
      <Check label="drop_last=True" value={drop} onChange={setDrop} />
      <Slider label={tx(lang, 'Tohum (Generator)', 'Seed (Generator)')} value={seed} min={0} max={9} onChange={setSeed} />
      <Slider label={tx(lang, 'Tur (epoch)', 'Epoch')} value={epoch} min={0} max={5} onChange={setEpoch} />
      <Readout testId="pt-loader">{`len(loader) = ${stepsPerEpoch(n, bs, drop)}\n${tx(lang, 'son yığın', 'last batch')}: ${bt.at(-1)?.length ?? 0}\n${tx(lang, 'bu tur görülmeyen', 'unseen this epoch')}: ${n - seen.size}`}</Readout>
    </>}>
      <p className="rb-small muted">{tx(lang, 'Veri kümesi (renk: düştüğü yığın; gri: bu tur görülmedi)', 'Dataset (colour: the batch it falls into; gray: not seen this epoch)')}</p>
      <div className="pt-cells">{Array.from({ length: n }, (_, i) => { const b = bt.findIndex((x) => x.includes(i)); return <span key={i} style={{ background: b < 0 ? '#999' : col(b) }}>{i}</span> })}</div>
      <p className="rb-small muted">{tx(lang, 'Yığınlar, sırayla', 'Batches, in order')}</p>
      <div className="pt-grid">{bt.map((b, i) => <div key={i} className="pt-cells"><b style={{ width: 52, fontSize: '.8rem' }}>#{i}</b>{b.map((x) => <span key={x} style={{ background: col(i) }}>{x}</span>)}</div>)}</div>
    </Stage>
  )
}

// ---------------------------------------------------------------- 7a. evrişim aritmetiği
export function ConvViz({ lang }: { lang: L }) {
  const [n, setN] = useState(7), [k, setK] = useState(3), [s, setS] = useState(1), [p, setP] = useState(0), [d, setD] = useState(1), [i, setI] = useState(0)
  const out = convOut(n, k, s, p, d)
  const ii = Math.min(Math.max(0, out - 1), i)
  const cells = receptive(ii, k, s, p, d)
  const C = 34, total = n + 2 * p
  return (
    <Stage side={<>
      <Slider label={tx(lang, 'Giriş boyu n', 'Input size n')} value={n} min={3} max={14} onChange={setN} />
      <Slider label="kernel_size k" value={k} min={1} max={7} onChange={setK} />
      <Slider label="stride s" value={s} min={1} max={4} onChange={setS} />
      <Slider label="padding p" value={p} min={0} max={3} onChange={setP} />
      <Slider label="dilation d" value={d} min={1} max={3} onChange={setD} />
      <Slider label={tx(lang, 'Çıkış hücresi i', 'Output cell i')} value={ii} min={0} max={Math.max(0, out - 1)} onChange={setI} />
      <Readout testId="pt-conv">{`⌊(${n} + 2·${p} − ${d}·(${k} − 1) − 1) / ${s}⌋ + 1 = ${out}${out <= 0 ? `\n${tx(lang, 'geçersiz: çekirdek girdiden büyük', 'invalid: kernel larger than input')}` : ''}`}</Readout>
    </>}>
      <svg viewBox={`0 0 ${Math.max(total, 1) * C + 20} ${2 * C + 80}`} className="pt-svg" role="img" aria-label={tx(lang, '1B evrişim ızgarası', '1D convolution grid')}>
        <text x={4} y={14} className="mut">{tx(lang, 'giriş (dolgu kesikli)', 'input (padding dashed)')}</text>
        {Array.from({ length: total }, (_, j) => {
          const idx = j - p, pad = idx < 0 || idx >= n, hit = cells.includes(idx)
          return <g key={j}><rect x={10 + j * C} y={22} width={C - 4} height={C - 4} rx={4} fill={hit ? 'rgba(67,99,216,.55)' : pad ? 'none' : 'rgba(128,128,128,.18)'} stroke="#888" strokeDasharray={pad ? '3 3' : undefined} /><text x={10 + j * C + (C - 4) / 2} y={22 + C / 2} textAnchor="middle">{pad ? '0' : idx}</text></g>
        })}
        <text x={4} y={C + 52} className="mut">{tx(lang, 'çıkış', 'output')}</text>
        {Array.from({ length: Math.max(0, out) }, (_, j) => <g key={j}><rect x={10 + (j * s + p - p) * C} y={C + 58} width={C - 4} height={C - 4} rx={4} fill={j === ii ? '#d33682' : 'rgba(211,54,130,.2)'} stroke="#d33682" /><text x={10 + j * s * C + (C - 4) / 2} y={C + 58 + C / 2} textAnchor="middle">{j}</text></g>)}
      </svg>
      <p className="rb-small muted">{tx(lang, 'Mavi hücreler seçilen çıkış hücresinin gördüğü giriş konumları. 2B\'de aynı formül yükseklik ve genişliğe ayrı ayrı uygulanır.', 'Blue cells are the input positions seen by the selected output cell. In 2D the same formula applies to height and width separately.')}</p>
    </Stage>
  )
}

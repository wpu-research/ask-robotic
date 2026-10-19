'use client'
// PyTorch görselleştiricileri 2: tarayıcıda gerçek eğitim (iki ay), düzenlileştirme deneyi, RNN/LSTM gradyan akışı,
// dikkat (makine öğrenmesi dersinin hesabı), eğitilmiş CNN'in öznitelik haritaları, aktarım/nicemleme ve rakam tanıyıcı.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { predict, trainMlp, type Epoch, type TrainResult } from '@/lib/pytorch/nets'
import { gradientFlow, memorySpan } from '@/lib/pytorch/seq'
import { accuracy, paramCount, parseTestBin, quantizeWeights, runCnn, toMnist, type CnnWeights, type Fm } from '@/lib/pytorch/cnn'
import { RESNET18, transferPlan } from '@/lib/pytorch/deploy'
import { attention } from '@/lib/ml/dikkat-mekanizmasi'
import { Check, Readout, Select, Slider, Stage, tx, useAnim, type L } from '@/components/opencv/cv-ui'

const f3 = (v: number) => v.toFixed(3)

/** Basit çizgi grafik (SVG): birden çok seri, y ekseni otomatik. */
export function LineChart({ series, w = 520, h = 200, yLabel, logY = false, mark }: { series: Array<{ name: string; color: string; pts: number[]; dash?: boolean }>; w?: number; h?: number; yLabel: string; logY?: boolean; mark?: number }) {
  const all = series.flatMap((s) => s.pts).filter(Number.isFinite)
  const tr = (v: number) => (logY ? Math.log10(Math.max(v, 1e-6)) : v)
  const lo = Math.min(...all.map(tr), logY ? -6 : 0), hi = Math.max(...all.map(tr), lo + 1e-6)
  const n = Math.max(2, ...series.map((s) => s.pts.length))
  const X = (i: number) => 36 + (i / (n - 1)) * (w - 46), Y = (v: number) => h - 22 - ((tr(v) - lo) / (hi - lo)) * (h - 34)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="pt-svg" role="img" aria-label={yLabel}>
      <line x1={36} y1={h - 22} x2={w - 10} y2={h - 22} stroke="#888" /><line x1={36} y1={10} x2={36} y2={h - 22} stroke="#888" />
      <text x={4} y={12} className="mut">{logY ? `10^${hi.toFixed(0)}` : hi.toFixed(2)}</text>
      <text x={4} y={h - 24} className="mut">{logY ? `10^${lo.toFixed(0)}` : lo.toFixed(2)}</text>
      <text x={40} y={h - 6} className="mut">{yLabel}</text>
      {mark !== undefined && <line x1={X(mark)} x2={X(mark)} y1={10} y2={h - 22} stroke="#d33682" strokeDasharray="4 3" />}
      {series.map((s) => <polyline key={s.name} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.dash ? '5 4' : undefined} points={s.pts.map((v, i) => (Number.isFinite(v) ? `${X(i)},${Y(v)}` : '')).filter(Boolean).join(' ')} />)}
      {series.map((s, i) => <text key={s.name} x={w - 150} y={18 + i * 14} style={{ fill: s.color }}>■ {s.name}</text>)}
    </svg>
  )
}

/** Karar sınırı ve noktalar (iki ay, [-1.5, 2.5] × [-1, 1.5]). */
function Boundary({ r, lang }: { r: TrainResult; lang: L }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!, W = (c.width = 300), H = (c.height = 200), ctx = c.getContext('2d')!
    const X = (x: number) => ((x + 1.5) / 4) * W, Y = (y: number) => H - ((y + 1) / 2.5) * H
    const img = ctx.createImageData(W, H)
    for (let py = 0; py < H; py += 4) for (let px = 0; px < W; px += 4) {
      const p = predict(r.net, -1.5 + (px / W) * 4, -1 + ((H - py) / H) * 2.5)
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) { const i = ((py + dy) * W + px + dx) * 4; img.data[i] = 60 + 160 * p; img.data[i + 1] = 90; img.data[i + 2] = 220 - 160 * p; img.data[i + 3] = 90 }
    }
    ctx.putImageData(img, 0, 0)
    for (const [pts, val] of [[r.train, false], [r.val, true]] as const) for (const p of pts) {
      ctx.fillStyle = p.c ? '#e6194b' : '#4363d8'; ctx.strokeStyle = '#fff'
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), val ? 2 : 3, 0, 7); if (val) ctx.stroke(); else ctx.fill()
    }
  }, [r])
  return <figure className="cv-img"><canvas ref={ref} className="sim-canvas" role="img" aria-label={tx(lang, 'Karar sınırı', 'Decision boundary')} /><figcaption>{tx(lang, 'Karar sınırı; dolu: eğitim, halka: doğrulama', 'Decision boundary; filled: training, ring: validation')}</figcaption></figure>
}

function useReveal(total: number, deps: unknown[]) {
  const [k, setK] = useState(0)
  const [on, setOn] = useState(false)
  useEffect(() => { setK(0); setOn(true) }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  const acc = useRef(0)
  useAnim(on, (_t, dt) => { acc.current += dt; if (acc.current > 0.04) { acc.current = 0; setK((x) => { if (x + 1 >= total) setOn(false); return Math.min(total, x + 1) }) } })
  return k
}

// ---------------------------------------------------------------- 5. eğitim döngüsü
export function TrainViz({ lang }: { lang: L }) {
  const [hidden, setHidden] = useState(16), [layers, setLayers] = useState(2), [lr, setLr] = useState(0.01), [epochs, setEpochs] = useState(60), [seed, setSeed] = useState(1), [run, setRun] = useState(0)
  const r = useMemo(() => trainMlp({ hidden: Array(layers).fill(hidden), lr, epochs, batch: 32, seed, noise: 0.15 }), [hidden, layers, lr, epochs, seed, run]) // eslint-disable-line react-hooks/exhaustive-deps
  const k = useReveal(r.history.length, [r])
  const h: Epoch[] = r.history.slice(0, Math.max(1, k))
  const last = h[h.length - 1]
  return (
    <Stage side={<>
      <Slider label={tx(lang, 'Gizli katman sayısı', 'Hidden layers')} value={layers} min={1} max={3} onChange={setLayers} />
      <Slider label={tx(lang, 'Katman başına nöron', 'Neurons per layer')} value={hidden} min={2} max={32} onChange={setHidden} />
      <Slider label={tx(lang, 'Öğrenme oranı (Adam)', 'Learning rate (Adam)')} value={lr} min={0.001} max={0.2} step={0.001} onChange={setLr} fmt={f3} />
      <Slider label={tx(lang, 'Tur', 'Epochs')} value={epochs} min={10} max={150} step={10} onChange={setEpochs} />
      <Slider label={tx(lang, 'Tohum', 'Seed')} value={seed} min={1} max={9} onChange={setSeed} />
      <button type="button" className="sbtn" onClick={() => setRun((x) => x + 1)}>{tx(lang, 'Yeniden eğit', 'Train again')}</button>
      <Readout testId="pt-train">{`epoch ${last.epoch}\ntrain loss ${f3(last.trainLoss)}  acc ${f3(last.trainAcc)}\nval   loss ${f3(last.valLoss)}  acc ${f3(last.valAcc)}`}</Readout>
    </>}>
      <LineChart yLabel={tx(lang, 'kayıp (BCE) / tur', 'loss (BCE) / epoch')} series={[{ name: tx(lang, 'eğitim', 'train'), color: '#4363d8', pts: h.map((e) => e.trainLoss) }, { name: tx(lang, 'doğrulama', 'validation'), color: '#e6194b', pts: h.map((e) => e.valLoss) }]} />
      <Boundary r={r} lang={lang} />
    </Stage>
  )
}

// ---------------------------------------------------------------- 8. düzenlileştirme
export function RegulViz({ lang }: { lang: L }) {
  const [drop, setDrop] = useState(0), [wd, setWd] = useState(0), [es, setEs] = useState(false), [nTrain, setNTrain] = useState(40), [go, setGo] = useState(0)
  const base = { hidden: [64, 64], lr: 0.01, epochs: 150, batch: 16, seed: 2, noise: 0.3, nTrain, nVal: 300 }
  const ref = useMemo(() => trainMlp(base), [nTrain, go]) // eslint-disable-line react-hooks/exhaustive-deps
  const r = useMemo(() => trainMlp({ ...base, dropout: drop, weightDecay: wd, earlyStop: es ? 15 : undefined }), [drop, wd, es, nTrain, go]) // eslint-disable-line react-hooks/exhaustive-deps
  const L0 = r.history.at(-1)!
  return (
    <Stage side={<>
      <Slider label="Dropout p" value={drop} min={0} max={0.6} step={0.05} onChange={setDrop} fmt={(v) => v.toFixed(2)} />
      <Slider label="weight_decay" value={wd} min={0} max={0.05} step={0.005} onChange={setWd} fmt={f3} />
      <Check label={tx(lang, 'Erken durdurma (sabır 15)', 'Early stopping (patience 15)')} value={es} onChange={setEs} />
      <Slider label={tx(lang, 'Eğitim örneği', 'Training samples')} value={nTrain} min={20} max={300} step={20} onChange={setNTrain} />
      <button type="button" className="sbtn ghost" onClick={() => setGo((x) => x + 1)}>{tx(lang, 'Yeniden çalıştır', 'Run again')}</button>
      <Readout testId="pt-regul">{`${tx(lang, 'düzenlileştirmesiz', 'no regularisation')}: val ${f3(ref.history.at(-1)!.valLoss)}, ${tx(lang, 'açık', 'gap')} ${f3(ref.history.at(-1)!.valLoss - ref.history.at(-1)!.trainLoss)}\n${tx(lang, 'bu ayarla', 'this setting')}: val ${f3(L0.valLoss)}, ${tx(lang, 'açık', 'gap')} ${f3(L0.valLoss - L0.trainLoss)}\n${tx(lang, 'en iyi tur', 'best epoch')}: ${r.bestEpoch}${r.stoppedAt ? `, ${tx(lang, 'durdu', 'stopped')}: ${r.stoppedAt}` : ''}\nval acc ${f3(L0.valAcc)}`}</Readout>
    </>}>
      <LineChart yLabel={tx(lang, 'kayıp / tur (kesikli: düzenlileştirmesiz)', 'loss / epoch (dashed: no regularisation)')} mark={r.stoppedAt ? r.bestEpoch - 1 : undefined} series={[
        { name: tx(lang, 'eğitim', 'train'), color: '#4363d8', pts: r.history.map((e) => e.trainLoss) },
        { name: tx(lang, 'doğrulama', 'validation'), color: '#e6194b', pts: r.history.map((e) => e.valLoss) },
        { name: tx(lang, 'eğitim (ref)', 'train (ref)'), color: '#4363d8', dash: true, pts: ref.history.map((e) => e.trainLoss) },
        { name: tx(lang, 'doğr. (ref)', 'val (ref)'), color: '#e6194b', dash: true, pts: ref.history.map((e) => e.valLoss) },
      ]} />
      <Boundary r={r} lang={lang} />
    </Stage>
  )
}

// ---------------------------------------------------------------- 9a. RNN / LSTM
export function LstmViz({ lang }: { lang: L }) {
  const [T, setT] = useState(50), [w, setW] = useState(0.9), [fb, setFb] = useState(1)
  const r = useMemo(() => gradientFlow({ T, w, forgetBias: fb }), [T, w, fb])
  return (
    <Stage side={<>
      <Slider label={tx(lang, 'Dizi boyu T', 'Sequence length T')} value={T} min={10} max={120} step={5} onChange={setT} />
      <Slider label={tx(lang, 'RNN özyineli ağırlık w', 'RNN recurrent weight w')} value={w} min={0.2} max={2} step={0.05} onChange={setW} fmt={(v) => v.toFixed(2)} />
      <Slider label={tx(lang, 'LSTM unutma kapısı ön yargısı', 'LSTM forget-gate bias')} value={fb} min={-2} max={5} step={0.5} onChange={setFb} fmt={(v) => v.toFixed(1)} />
      <Readout testId="pt-lstm">{`${tx(lang, 'etkili bellek (|∂h_T/∂h_t| ≥ 0,01)', 'effective memory (|∂h_T/∂h_t| ≥ 0.01)')}\nRNN:  ${memorySpan(r.rnnGrad)} ${tx(lang, 'adım', 'steps')}\nLSTM: ${memorySpan(r.lstmGrad)} ${tx(lang, 'adım', 'steps')}\n${tx(lang, 'ortalama f', 'mean f')}: ${f3(r.lstmF.reduce((a, b) => a + b, 0) / T)}`}</Readout>
    </>}>
      <LineChart logY yLabel={tx(lang, '|∂h_T/∂h_t| (log), t = 0 … T−1', '|∂h_T/∂h_t| (log), t = 0 … T−1')} series={[{ name: 'RNN', color: '#e6194b', pts: r.rnnGrad }, { name: tx(lang, 'LSTM hücre yolu', 'LSTM cell path'), color: '#3cb44b', pts: r.lstmGrad }]} />
    </Stage>
  )
}

// ---------------------------------------------------------------- 9b. dikkat
export function AttentionViz({ lang }: { lang: L }) {
  const [variant, setVariant] = useState(0), [tau, setTau] = useState(1)
  const a = useMemo(() => attention(variant, tau), [variant, tau])
  const C = 54
  return (
    <Stage side={<>
      <Select label={tx(lang, 'Cümle', 'Sentence')} value={String(variant) as '0' | '1'} onChange={(v) => setVariant(Number(v))} options={[['0', tx(lang, '…çünkü o hafifti', '…because it was light')], ['1', tx(lang, '…çünkü o güçlüydü', '…because it was strong')]]} />
      <Slider label={tx(lang, 'Sıcaklık τ', 'Temperature τ')} value={tau} min={0.2} max={4} step={0.1} onChange={setTau} fmt={(v) => v.toFixed(1)} />
      <Readout testId="pt-attn">{`"${a.words[4][lang]}" → ${a.words.map((w, j) => `${w[lang]} ${(a.A[4][j] * 100).toFixed(0)}%`).join(', ')}`}</Readout>
      <p className="rb-small muted">{tx(lang, 'Aynı hesap, makine öğrenmesi dersindeki dikkat dersinden (lib/ml).', 'The same computation as the attention lesson in the machine learning course (lib/ml).')}</p>
    </>}>
      <svg viewBox={`0 0 ${C * 6 + 120} ${C * 6 + 40}`} className="pt-svg" role="img" aria-label={tx(lang, 'Dikkat ısı haritası', 'Attention heatmap')}>
        {a.words.map((w, j) => <text key={'c' + j} x={110 + j * C + C / 2} y={14} textAnchor="middle" className="mut">{w[lang].slice(0, 9)}</text>)}
        {a.A.map((row, i) => (
          <g key={i}>
            <text x={104} y={30 + i * C + C / 2} textAnchor="end">{a.words[i][lang].slice(0, 12)}</text>
            {row.map((v, j) => <g key={j}><rect x={110 + j * C} y={24 + i * C} width={C - 3} height={C - 3} rx={4} fill={`rgba(67,99,216,${0.08 + 0.92 * v})`} stroke={i === 4 ? '#d33682' : 'none'} /><text x={110 + j * C + C / 2} y={24 + i * C + C / 2 + 4} textAnchor="middle">{(v * 100).toFixed(0)}</text></g>)}
          </g>
        ))}
      </svg>
    </Stage>
  )
}

// ---------------------------------------------------------------- CNN ağırlıkları ve çizim
let wCache: Promise<CnnWeights> | null = null
export function useCnn(): CnnWeights | null {
  const [w, setW] = useState<CnnWeights | null>(null)
  useEffect(() => { wCache ??= fetch('/veri/pytorch/mnist-cnn.json').then((r) => r.json()); wCache.then(setW).catch(() => { wCache = null }) }, [])
  return w
}
/** Siyah zeminde beyaz kalemle 280×280 çizim alanı; her vuruştan sonra 28×28 MNIST görüntüsünü bildirir. */
export function DrawPad({ lang, onDigit }: { lang: L; onDigit: (px: Uint8ClampedArray | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null), last = useRef<{ x: number; y: number } | null>(null)
  const clear = useCallback(() => { const c = ref.current!; const ctx = c.getContext('2d')!; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 280, 280); onDigit(null) }, [onDigit])
  useEffect(() => { const c = ref.current!; c.width = 280; c.height = 280; clear() }, [clear])
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 280, y: ((e.clientY - r.top) / r.height) * 280 } }
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => { const ctx = ref.current!.getContext('2d')!; ctx.strokeStyle = '#fff'; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke() }
  const emit = () => { const d = ref.current!.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, 280, 280).data; const g = new Uint8ClampedArray(280 * 280); for (let i = 0; i < g.length; i++) g[i] = d[i * 4]; onDigit(toMnist(g, 280)) }
  return (
    <div className="cv-src">
      <canvas ref={ref} className="sim-canvas pt-draw" data-testid="pt-draw" aria-label={tx(lang, 'Rakam çizim alanı', 'Digit drawing area')}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = pos(e); line(last.current, last.current) }}
        onPointerMove={(e) => { if (!last.current) return; const p = pos(e); line(last.current, p); last.current = p }}
        onPointerUp={() => { last.current = null; emit() }} />
      <button type="button" className="sbtn ghost" onClick={clear}>{tx(lang, 'Temizle', 'Clear')}</button>
    </div>
  )
}
function MapCanvas({ fm, ch, label }: { fm: Fm; ch: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!; c.width = fm.w; c.height = fm.h
    const ctx = c.getContext('2d')!, img = ctx.createImageData(fm.w, fm.h), off = ch * fm.w * fm.h
    let mx = 1e-6; for (let i = 0; i < fm.w * fm.h; i++) mx = Math.max(mx, Math.abs(fm.data[off + i]))
    for (let i = 0; i < fm.w * fm.h; i++) { const v = fm.data[off + i] / mx; img.data[i * 4] = v > 0 ? 255 * v : 0; img.data[i * 4 + 1] = 255 * Math.abs(v) * 0.6; img.data[i * 4 + 2] = v < 0 ? -255 * v : 40 * Math.abs(v); img.data[i * 4 + 3] = 255 }
    ctx.putImageData(img, 0, 0)
  }, [fm, ch])
  return <canvas ref={ref} title={label} aria-label={label} />
}
export function Probs({ probs, lang }: { probs: number[]; lang: L }) {
  const best = probs.indexOf(Math.max(...probs))
  return <div className="pt-bars" aria-label={tx(lang, 'Sınıf olasılıkları', 'Class probabilities')}>{probs.map((p, i) => <div key={i} className={`pt-bar${i === best ? ' top' : ''}`}><b>{i}</b><i style={{ width: `${Math.max(1, p * 100)}%` }} /><span>{(p * 100).toFixed(1)}%</span></div>)}</div>
}

// ---------------------------------------------------------------- 7b. öznitelik haritaları
export function FeatureMapsViz({ lang }: { lang: L }) {
  const W = useCnn()
  const [px, setPx] = useState<Uint8ClampedArray | null>(null)
  const tr = useMemo(() => (W && px ? runCnn(W, px) : null), [W, px])
  const kern = W ? { w: W.conv1.w, c: 8 } : null
  return (
    <Stage side={<>
      <DrawPad lang={lang} onDigit={setPx} />
      <Readout testId="pt-fm">{!W ? tx(lang, 'Ağırlıklar yükleniyor…', 'Loading weights…') : tr ? `${tx(lang, 'tahmin', 'prediction')}: ${tr.pred} (${(tr.probs[tr.pred] * 100).toFixed(1)}%)` : tx(lang, 'Kutuya bir rakam çiz.', 'Draw a digit in the box.')}</Readout>
    </>}>
      {kern && <><p className="rb-small muted">{tx(lang, 'conv1: öğrenilmiş 8 çekirdek (3×3; kırmızı +, mavi −)', 'conv1: 8 learned kernels (3×3; red +, blue −)')}</p>
        <div className="pt-maps">{Array.from({ length: 8 }, (_, i) => <MapCanvas key={i} fm={{ c: 8, h: 3, w: 3, data: Float32Array.from(kern.w) }} ch={i} label={`kernel ${i}`} />)}</div></>}
      {tr && <>
        <p className="rb-small muted">{tx(lang, 'conv1 + ReLU: 8 öznitelik haritası (28×28)', 'conv1 + ReLU: 8 feature maps (28×28)')}</p>
        <div className="pt-maps">{Array.from({ length: 8 }, (_, i) => <MapCanvas key={i} fm={tr.c1} ch={i} label={`conv1 ${i}`} />)}</div>
        <p className="rb-small muted">{tx(lang, 'conv2 + ReLU + havuzlama: 16 harita (7×7) → Linear(784, 10)', 'conv2 + ReLU + pooling: 16 maps (7×7) → Linear(784, 10)')}</p>
        <div className="pt-maps">{Array.from({ length: 16 }, (_, i) => <MapCanvas key={i} fm={tr.p2} ch={i} label={`pool2 ${i}`} />)}</div>
        <Probs probs={tr.probs} lang={lang} />
      </>}
    </Stage>
  )
}

// ---------------------------------------------------------------- 10. aktarım ve nicemleme
export function DeployViz({ lang }: { lang: L }) {
  const W = useCnn()
  const [frozen, setFrozen] = useState<Record<string, boolean>>({ stem: true, layer1: true, layer2: true, layer3: true, layer4: true }), [classes, setClasses] = useState(5)
  const plan = transferPlan(frozen, classes)
  const [m, setM] = useState<null | { a32: number; a8: number; t32: number; t8: number; b32: number; b8: number; err: number }>(null)
  const [busy, setBusy] = useState(false)
  const measure = async () => {
    if (!W) return
    setBusy(true)
    const buf = await fetch('/veri/pytorch/mnist-test-200.bin').then((r) => r.arrayBuffer())
    const set = parseTestBin(buf), q = quantizeWeights(W)
    let t = performance.now(); const a32 = accuracy(W, set); const t32 = (performance.now() - t) / set.length
    t = performance.now(); const a8 = accuracy(q.W, set); const t8 = (performance.now() - t) / set.length
    setM({ a32, a8, t32, t8, b32: q.bytesFp32, b8: q.bytesInt8, err: q.maxErr }); setBusy(false)
  }
  const fmtN = (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')
  return (
    <Stage side={<>
      <p className="rb-small"><b>ResNet-18</b></p>
      {RESNET18.map((b) => <Check key={b.key} label={`${tx(lang, 'dondur', 'freeze')}: ${b[lang]} (${fmtN(b.params)})`} value={!!frozen[b.key]} onChange={(v) => setFrozen({ ...frozen, [b.key]: v })} />)}
      <Slider label={tx(lang, 'Sınıf sayısı (yeni baş)', 'Number of classes (new head)')} value={classes} min={2} max={100} onChange={setClasses} />
      <Readout testId="pt-transfer">{`${tx(lang, 'eğitilen', 'trainable')}: ${fmtN(plan.trainable)} / ${fmtN(plan.total)}\n${tx(lang, 'ağırlıklar', 'weights')}: ${plan.weightsMB.toFixed(1)} MB\n${tx(lang, 'grad + Adam durumu', 'grad + Adam state')}: ${plan.trainMB.toFixed(2)} MB`}</Readout>
      <button type="button" className="sbtn" onClick={measure} disabled={!W || busy} data-testid="pt-measure">{busy ? tx(lang, 'Ölçülüyor…', 'Measuring…') : tx(lang, 'Nicemle ve ölç', 'Quantise and measure')}</button>
    </>}>
      <div className="pt-bars">{RESNET18.map((b) => <div key={b.key} className="pt-bar"><b style={{ width: 'auto' }}>{frozen[b.key] ? '■' : '□'}</b><i style={{ width: `${Math.max(1, (b.params / 8393728) * 100)}%`, opacity: frozen[b.key] ? 0.35 : 1 }} /><span>{b.key}</span></div>)}</div>
      <p className="rb-small muted">{tx(lang, 'Çubuk boyu: bloğun parametre sayısı (layer4 = 8,4 M). Soluk: dondurulmuş.', 'Bar length: block parameter count (layer4 = 8.4 M). Faded: frozen.')}</p>
      {W && <Readout testId="pt-quant">{m
        ? `${tx(lang, 'bitirme CNN\'i', 'capstone CNN')} (${fmtN(paramCount(W))} ${tx(lang, 'parametre', 'parameters')}), 200 ${tx(lang, 'test örneği', 'test samples')}\nfp32: ${(m.b32 / 1024).toFixed(1)} KB, ${tx(lang, 'doğruluk', 'accuracy')} ${(m.a32 * 100).toFixed(1)}%, ${m.t32.toFixed(2)} ms/${tx(lang, 'örnek', 'sample')}\nint8: ${(m.b8 / 1024).toFixed(1)} KB, ${tx(lang, 'doğruluk', 'accuracy')} ${(m.a8 * 100).toFixed(1)}%, ${m.t8.toFixed(2)} ms/${tx(lang, 'örnek', 'sample')}\n${tx(lang, 'en büyük ağırlık hatası', 'max weight error')}: ${m.err.toExponential(2)}\n${tx(lang, 'Not: burada int8 ağırlıklar geri çevrilip float ile hesaplanır; hız kazancı int8 çekirdekli donanımda görülür.', 'Note: here int8 weights are dequantised and computed in float; the speed-up shows on hardware with int8 kernels.')}`
        : tx(lang, '"Nicemle ve ölç" bitirme CNN\'ini int8\'e çevirir ve 200 MNIST test örneğinde ölçer.', '"Quantise and measure" converts the capstone CNN to int8 and measures it on 200 MNIST test samples.')}</Readout>}
    </Stage>
  )
}

// ---------------------------------------------------------------- bitirme: rakam tanıyıcı
export function DigitsViz({ lang }: { lang: L }) {
  const W0 = useCnn()
  const [own, setOwn] = useState<CnnWeights | null>(null), [err, setErr] = useState('')
  const W = own ?? W0
  const [px, setPx] = useState<Uint8ClampedArray | null>(null)
  const tr = useMemo(() => (W && px ? runCnn(W, px) : null), [W, px])
  const onFile = async (f?: File) => {
    if (!f) return
    try { const j = JSON.parse(await f.text()) as CnnWeights; if (j.conv1?.w?.length !== 72 || j.conv2?.w?.length !== 1152 || j.fc?.w?.length !== 7840) throw new Error('shape'); setOwn({ ...j, mean: j.mean ?? 0.1307, std: j.std ?? 0.3081 }); setErr('') }
    catch { setErr(tx(lang, 'Dosya bu mimariye uymuyor (conv1 72, conv2 1152, fc 7840 ağırlık bekleniyor).', 'The file does not fit this architecture (expected 72, 1152 and 7840 weights for conv1, conv2, fc).')) }
  }
  const prep = useRef<HTMLCanvasElement>(null)
  useEffect(() => { const c = prep.current; if (!c) return; c.width = 28; c.height = 28; const ctx = c.getContext('2d')!, im = ctx.createImageData(28, 28); for (let i = 0; i < 784; i++) { const v = px ? px[i] : 0; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255 } ctx.putImageData(im, 0, 0) }, [px])
  return (
    <Stage side={<>
      <DrawPad lang={lang} onDigit={setPx} />
      <label className="sbtn ghost" style={{ textAlign: 'center' }}>{tx(lang, 'Kendi ağırlıklarını yükle (.json)', 'Load your own weights (.json)')}<input type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
      {own && <button type="button" className="sbtn ghost" onClick={() => setOwn(null)}>{tx(lang, 'Ders ağırlıklarına dön', 'Back to course weights')}</button>}
      {err && <p className="cv-err" role="alert">{err}</p>}
      <Readout testId="pt-digit">{!W ? tx(lang, 'Ağırlıklar yükleniyor…', 'Loading weights…') : `${own ? tx(lang, 'senin ağırlıkların', 'your weights') : `${tx(lang, 'ders ağırlıkları, MNIST test', 'course weights, MNIST test')} ${((W.testAcc ?? 0) * 100).toFixed(1)}%`}\n${tr ? `${tx(lang, 'tahmin', 'prediction')}: ${tr.pred}` : tx(lang, 'Bir rakam çiz.', 'Draw a digit.')}`}</Readout>
    </>}>
      <div className="cv-pair">
        <figure className="cv-img"><canvas ref={prep} className="sim-canvas" style={{ imageRendering: 'pixelated', maxWidth: 196 }} /><figcaption>{tx(lang, 'Ağın gördüğü: 28×28, kutuya sığdırılmış ve kütle merkezine göre ortalanmış', 'What the network sees: 28×28, fitted to a box and centred by mass')}</figcaption></figure>
        {tr ? <Probs probs={tr.probs} lang={lang} /> : <div />}
      </div>
    </Stage>
  )
}

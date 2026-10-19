'use client'
// OpenCV oyun alanları 1–7: kanallar, nokta işlemleri, eşikleme, filtreler, kenarlar, morfoloji, konturlar.
// Tüm hesap lib/opencv'deki saf fonksiyonlarla; kaydırıcı her değiştiğinde yeniden hesaplanır (görüntü en çok 320×240).
import { useCallback, useMemo, useState } from 'react'
import {
  adaptiveThreshold, addNoise, applyLut, boxBlur, canny, channel, countNonZero, EMBOSS, equalizeRgba, fieldToGray, filter2D, fieldToU8,
  gaussianBlur, gaussianKernel, histogram, hsvPlanes, LAPLACE, meanStd, medianBlur, morphology, otsu, perChannel, pointLut, psnr, rgbToHsv, SHARPEN,
  sobel, threshold, toGray, type Gray, type MorphOp, type Rgba, type SeShape,
} from '@/lib/opencv/ops'
import { describe as describeContour, findContours, SHAPE_TEXT, shapeName, type ContourInfo } from '@/lib/opencv/contours'
import { rng } from '@/lib/opencv/samples'
import { Check, Histogram, Img, Pair, Readout, Select, Slider, SourcePicker, Stage, tx, useSource, type L } from './cv-ui'

const f1 = (v: number) => v.toFixed(1)
const f2 = (v: number) => v.toFixed(2)

// ---------------------------------------------------------------- 1. kanallar
type Ch = 'rgb' | 'b' | 'g' | 'r' | 'gray' | 'h' | 's' | 'v'
export function ChannelsTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('shapes')
  const [ch, setCh] = useState<Ch>('b')
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const out = useMemo<Rgba | Gray>(() => {
    if (ch === 'rgb') return img
    if (ch === 'gray') return toGray(img)
    if (ch === 'b' || ch === 'g' || ch === 'r') return channel(img, ch)
    const p = hsvPlanes(img)
    if (ch === 'h') { const g = { ...p.h, data: new Uint8ClampedArray(p.h.data.length) }; for (let i = 0; i < g.data.length; i++) g.data[i] = (p.h.data[i] * 255) / 179; return g }
    return ch === 's' ? p.s : p.v
  }, [img, ch])
  const px = hover ? (() => {
    const x = Math.min(img.w - 1, Math.max(0, Math.floor(hover.x))), y = Math.min(img.h - 1, Math.max(0, Math.floor(hover.y))), i = (y * img.w + x) * 4
    const [r, g, b] = [img.data[i], img.data[i + 1], img.data[i + 2]]
    return { x, y, r, g, b, hsv: rgbToHsv(r, g, b), gray: Math.round(0.299 * r + 0.587 * g + 0.114 * b) }
  })() : null
  const draw = useCallback((ctx: CanvasRenderingContext2D) => { if (hover) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(Math.floor(hover.x) - 3.5, Math.floor(hover.y) - 3.5, 8, 8) } }, [hover])
  const names: Array<[Ch, string]> = [['rgb', tx(lang, 'Renkli (hepsi)', 'Colour (all)')], ['b', 'B'], ['g', 'G'], ['r', 'R'], ['gray', tx(lang, 'Gri', 'Gray')], ['h', 'H (0–179 → 0–255)'], ['s', 'S'], ['v', 'V']]
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Select label={tx(lang, 'Kanal', 'Channel')} value={ch} options={names} onChange={setCh} />
      <Readout testId="cv-pixel">{px
        ? `img[${px.y}, ${px.x}]\nB, G, R = ${px.b}, ${px.g}, ${px.r}\nH, S, V = ${px.hsv.join(', ')}\n${tx(lang, 'gri', 'gray')} = ${px.gray}`
        : tx(lang, 'İmleci sol görüntünün üstünde gezdir.', 'Move the pointer over the left image.')}</Readout>
      <Readout>{`shape = (${img.h}, ${img.w}, 3)\ndtype = uint8\n${tx(lang, 'sayı', 'values')} = ${(img.w * img.h * 3).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}`}</Readout>
    </>}>
      <Pair>
        <Img img={img} label={tx(lang, 'Önce: kaynak (BGR olarak okunur)', 'Before: source (read as BGR)')} draw={draw} onPointer={(x, y, k) => setHover(k === 'leave' ? null : { x, y })} />
        <Img img={out} label={tx(lang, `Sonra: ${names.find((n) => n[0] === ch)![1]} kanalı`, `After: ${names.find((n) => n[0] === ch)![1]} channel`)} testId="cv-out" />
      </Pair>
    </Stage>
  )
}

// ---------------------------------------------------------------- 2. nokta işlemleri
export function PointTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('lowlight')
  const [a, setA] = useState(1), [b, setB] = useState(0), [g, setG] = useState(1), [eq, setEq] = useState(false)
  const out = useMemo(() => { const o = applyLut(img, pointLut(a, b, g)); return eq ? equalizeRgba(o) : o }, [img, a, b, g, eq])
  const g0 = useMemo(() => toGray(img), [img]), g1 = useMemo(() => toGray(out), [out])
  const s0 = meanStd(g0), s1 = meanStd(g1)
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Slider label={tx(lang, 'α (karşıtlık)', 'α (contrast)')} value={a} min={0.2} max={4} step={0.05} onChange={setA} fmt={f2} />
      <Slider label={tx(lang, 'β (parlaklık)', 'β (brightness)')} value={b} min={-100} max={150} onChange={setB} />
      <Slider label={tx(lang, 'γ (gama; >1 koyuyu açar)', 'γ (gamma; >1 lifts darks)')} value={g} min={0.3} max={3} step={0.05} onChange={setG} fmt={f2} />
      <Check label={tx(lang, 'Histogram eşitleme (parlaklık)', 'Histogram equalisation (brightness)')} value={eq} onChange={setEq} />
      <button type="button" className="sbtn ghost" onClick={() => { setA(1); setB(0); setG(1); setEq(false) }}>{tx(lang, 'Sıfırla', 'Reset')}</button>
      <Readout testId="cv-point-stats">{`${tx(lang, 'önce', 'before')}: ${tx(lang, 'ort', 'mean')} ${f1(s0.mean)}, std ${f1(s0.std)}\n${tx(lang, 'sonra', 'after')}: ${tx(lang, 'ort', 'mean')} ${f1(s1.mean)}, std ${f1(s1.std)}\nstd × ${f2(s1.std / Math.max(1e-9, s0.std))}`}</Readout>
    </>}>
      <Pair>
        <Img img={img} label={tx(lang, 'Önce', 'Before')} />
        <Img img={out} label={tx(lang, 'Sonra', 'After')} testId="cv-out" />
      </Pair>
      <Histogram before={histogram(g0)} after={histogram(g1)} label={tx(lang, 'Gri histogram: önce (gri) ve sonra (renkli)', 'Gray histogram: before (gray) and after (coloured)')} />
    </Stage>
  )
}

// ---------------------------------------------------------------- 3. eşikleme
type TMethod = 'fixed' | 'otsu' | 'adaptive'
export function ThresholdTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('page')
  const [m, setM] = useState<TMethod>('fixed'), [t, setT] = useState(127), [block, setBlock] = useState(25), [C, setC] = useState(10), [inv, setInv] = useState(false), [blur, setBlur] = useState(true)
  const g = useMemo(() => { const x = toGray(img); return blur ? gaussianBlur(x, 5, 0) : x }, [img, blur])
  const ot = useMemo(() => otsu(g), [g])
  const out = useMemo(() => (m === 'adaptive' ? adaptiveThreshold(g, block, C, 'mean', inv) : threshold(g, m === 'otsu' ? ot.t : t, inv)), [g, m, t, ot, block, C, inv])
  const white = countNonZero(out) / (out.w * out.h)
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Select label={tx(lang, 'Yöntem', 'Method')} value={m} onChange={setM} options={[['fixed', tx(lang, 'Sabit eşik', 'Fixed threshold')], ['otsu', 'Otsu'], ['adaptive', tx(lang, 'Uyarlamalı (ortalama)', 'Adaptive (mean)')]]} />
      {m === 'fixed' && <Slider label={tx(lang, 'Eşik t', 'Threshold t')} value={t} min={0} max={255} onChange={setT} />}
      {m === 'adaptive' && <>
        <Slider label={tx(lang, 'Blok boyu (tek)', 'Block size (odd)')} value={block} min={3} max={61} step={2} onChange={setBlock} />
        <Slider label="C" value={C} min={-10} max={40} onChange={setC} />
      </>}
      <Check label={tx(lang, 'Ters (THRESH_BINARY_INV)', 'Inverted (THRESH_BINARY_INV)')} value={inv} onChange={setInv} />
      <Check label={tx(lang, 'Önce Gauss 5×5', 'Gaussian 5×5 first')} value={blur} onChange={setBlur} />
      <Readout testId="cv-thr">{`${tx(lang, 'Otsu eşiği', 'Otsu threshold')}: ${ot.t}\n${tx(lang, 'beyaz oranı', 'white ratio')}: ${f2(white)}`}</Readout>
    </>}>
      <Pair>
        <Img img={g} label={tx(lang, 'Önce: gri', 'Before: gray')} />
        <Img img={out} label={tx(lang, 'Sonra: ikili maske', 'After: binary mask')} testId="cv-out" />
      </Pair>
      <Histogram before={histogram(g)} mark={m === 'adaptive' ? undefined : m === 'otsu' ? ot.t : t} curve={m === 'otsu' ? ot.sigmaB : undefined}
        label={m === 'otsu' ? tx(lang, 'Histogram ve sınıflar arası varyans σ²_B(t) (pembe); kırmızı çizgi seçilen eşik', 'Histogram and between-class variance σ²_B(t) (pink); red line is the chosen threshold') : tx(lang, 'Gri histogram; kırmızı çizgi eşik', 'Gray histogram; red line is the threshold')} />
    </Stage>
  )
}

// ---------------------------------------------------------------- 4. filtreler
type FK = 'none' | 'box' | 'gauss' | 'median' | 'sharpen' | 'laplace' | 'emboss'
type NK = 'none' | 'saltpepper' | 'gauss'
const KERNEL_OF: Partial<Record<FK, number[]>> = { sharpen: SHARPEN, laplace: LAPLACE, emboss: EMBOSS }
export function FilterTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('shapes')
  const [nk, setNk] = useState<NK>('saltpepper'), [amt, setAmt] = useState(0.05), [fk, setFk] = useState<FK>('median'), [k, setK] = useState(3)
  const noisy = useMemo(() => addNoise(img, nk, nk === 'gauss' ? amt * 200 : amt, rng(7)), [img, nk, amt])
  const out = useMemo(() => {
    switch (fk) {
      case 'none': return noisy
      case 'box': return perChannel(noisy, (c) => boxBlur(c, k))
      case 'gauss': return perChannel(noisy, (c) => gaussianBlur(c, k, 0))
      case 'median': return perChannel(noisy, (c) => medianBlur(c, k))
      case 'laplace': return perChannel(noisy, (c) => fieldToGray(filter2D(c, LAPLACE, 3, 3)))
      default: return perChannel(noisy, (c) => { const f = filter2D(c, KERNEL_OF[fk]!, 3, 3); if (fk === 'emboss') for (let i = 0; i < f.data.length; i++) f.data[i] += 128; return fieldToU8(f) })
    }
  }, [noisy, fk, k])
  const kernel = KERNEL_OF[fk] ? { n: 3, v: KERNEL_OF[fk]! } : fk === 'box' ? { n: k, v: new Array(k * k).fill(1 / (k * k)) } : fk === 'gauss' ? (() => { const g = gaussianKernel(k, 0); return { n: k, v: g.flatMap((a) => g.map((b) => a * b)) } })() : null
  const sized = fk === 'box' || fk === 'gauss' || fk === 'median'
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Select label={tx(lang, 'Gürültü', 'Noise')} value={nk} onChange={setNk} options={[['none', tx(lang, 'Yok', 'None')], ['saltpepper', tx(lang, 'Tuz-biber', 'Salt-and-pepper')], ['gauss', 'Gauss']]} />
      {nk !== 'none' && <Slider label={tx(lang, 'Miktar', 'Amount')} value={amt} min={0.01} max={0.2} step={0.01} onChange={setAmt} fmt={f2} />}
      <Select label={tx(lang, 'Filtre', 'Filter')} value={fk} onChange={setFk} options={[['none', tx(lang, 'Yok', 'None')], ['box', tx(lang, 'Kutu (blur)', 'Box (blur)')], ['gauss', 'GaussianBlur'], ['median', 'medianBlur'], ['sharpen', tx(lang, 'Keskinleştirme', 'Sharpen')], ['laplace', 'Laplace'], ['emboss', tx(lang, 'Kabartma', 'Emboss')]]} />
      {sized && <Slider label={tx(lang, 'Çekirdek boyu', 'Kernel size')} value={k} min={3} max={9} step={2} onChange={setK} />}
      {kernel && kernel.n <= 5 && <Readout>{Array.from({ length: kernel.n }, (_, r) => kernel.v.slice(r * kernel.n, r * kernel.n + kernel.n).map((x) => (Math.abs(x) < 1 && x !== 0 ? x.toFixed(3) : String(x)).padStart(6)).join(' ')).join('\n')}</Readout>}
      <Readout testId="cv-psnr">{`PSNR ${tx(lang, 'gürültülü', 'noisy')}: ${nk === 'none' ? '∞' : f1(psnr(img, noisy))} dB\nPSNR ${tx(lang, 'filtreli', 'filtered')}: ${(() => { const p = psnr(img, out); return Number.isFinite(p) ? f1(p) : '∞' })()} dB`}</Readout>
    </>}>
      <Pair>
        <Img img={noisy} label={tx(lang, 'Önce: gürültülü', 'Before: noisy')} />
        <Img img={out} label={tx(lang, 'Sonra: filtreli', 'After: filtered')} testId="cv-out" />
      </Pair>
    </Stage>
  )
}

// ---------------------------------------------------------------- 5. kenarlar
type EM = 'gx' | 'gy' | 'mag' | 'canny'
export function EdgesTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('blocks')
  const [m, setM] = useState<EM>('canny'), [lo, setLo] = useState(50), [hi, setHi] = useState(150), [bk, setBk] = useState(5)
  const g = useMemo(() => toGray(img), [img])
  const c = useMemo(() => canny(g, Math.min(lo, hi), hi, bk, bk > 1 ? 0 : 1), [g, lo, hi, bk])
  const sb = useMemo(() => sobel(c.blur), [c])
  const out = m === 'canny' ? c.edges : fieldToGray(m === 'gx' ? sb.gx : m === 'gy' ? sb.gy : sb.mag)
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Select label={tx(lang, 'Çıktı', 'Output')} value={m} onChange={setM} options={[['gx', 'Sobel Gx (|∂/∂x|)'], ['gy', 'Sobel Gy (|∂/∂y|)'], ['mag', tx(lang, 'Gradyan büyüklüğü', 'Gradient magnitude')], ['canny', 'Canny']]} />
      <Slider label={tx(lang, 'Gauss çekirdeği (1 = yok)', 'Gaussian kernel (1 = none)')} value={bk} min={1} max={9} step={2} onChange={setBk} />
      {m === 'canny' && <>
        <Slider label={tx(lang, 'Alt eşik', 'Low threshold')} value={lo} min={0} max={400} step={5} onChange={setLo} />
        <Slider label={tx(lang, 'Üst eşik', 'High threshold')} value={hi} min={10} max={600} step={5} onChange={setHi} />
      </>}
      <Readout testId="cv-edges">{`${tx(lang, 'kenar pikseli', 'edge pixels')}: ${countNonZero(c.edges)}\n${tx(lang, 'güçlü', 'strong')}: ${c.strong}, ${tx(lang, 'zayıf aday', 'weak candidates')}: ${c.weak}`}</Readout>
    </>}>
      <Pair>
        <Img img={img} label={tx(lang, 'Önce', 'Before')} />
        <Img img={out} label={tx(lang, 'Sonra', 'After')} testId="cv-out" />
      </Pair>
      {m === 'canny' && <div className="cv-grid4">
        <Img img={c.blur} label={tx(lang, '1. Gauss', '1. Gaussian')} />
        <Img img={fieldToGray(c.mag)} label={tx(lang, '2. Sobel büyüklüğü', '2. Sobel magnitude')} />
        <Img img={fieldToGray(c.nms)} label="3. NMS" />
        <Img img={c.edges} label={tx(lang, '4. Histerezis', '4. Hysteresis')} />
      </div>}
    </Stage>
  )
}

// ---------------------------------------------------------------- 6. morfoloji
export function MorphTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('coins')
  const [op, setOp] = useState<MorphOp>('open'), [shape, setShape] = useState<SeShape>('ellipse'), [k, setK] = useState(3), [it, setIt] = useState(1), [inv, setInv] = useState(false)
  const bin = useMemo(() => { const g = toGray(img); return threshold(g, otsu(g).t, inv) }, [img, inv])
  const out = useMemo(() => morphology(bin, op, shape, k, it), [bin, op, shape, k, it])
  const n0 = useMemo(() => findContours(bin, 0).length, [bin]), n1 = useMemo(() => findContours(out, 0).length, [out])
  const ops: Array<[MorphOp, string]> = [['erode', tx(lang, 'Aşındırma', 'Erode')], ['dilate', tx(lang, 'Genişletme', 'Dilate')], ['open', tx(lang, 'Açma', 'Open')], ['close', tx(lang, 'Kapama', 'Close')], ['gradient', tx(lang, 'Gradyan', 'Gradient')], ['tophat', 'Top-hat'], ['blackhat', 'Black-hat']]
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Check label={tx(lang, 'Maskeyi ters çevir (koyu nesne)', 'Invert the mask (dark objects)')} value={inv} onChange={setInv} />
      <Select label={tx(lang, 'İşlem', 'Operation')} value={op} onChange={setOp} options={ops} />
      <Select label={tx(lang, 'Yapı elemanı', 'Structuring element')} value={shape} onChange={setShape} options={[['rect', 'MORPH_RECT'], ['ellipse', 'MORPH_ELLIPSE'], ['cross', 'MORPH_CROSS']]} />
      <Slider label={tx(lang, 'Çekirdek boyu', 'Kernel size')} value={k} min={3} max={15} step={2} onChange={setK} />
      <Slider label={tx(lang, 'Yineleme', 'Iterations')} value={it} min={1} max={4} onChange={setIt} />
      <Readout testId="cv-morph">{`${tx(lang, 'kontur (önce)', 'contours (before)')}: ${n0}\n${tx(lang, 'kontur (sonra)', 'contours (after)')}: ${n1}\n${tx(lang, 'beyaz piksel', 'white pixels')}: ${countNonZero(bin)} → ${countNonZero(out)}`}</Readout>
    </>}>
      <Pair>
        <Img img={bin} label={tx(lang, 'Önce: Otsu maskesi', 'Before: Otsu mask')} />
        <Img img={out} label={tx(lang, 'Sonra', 'After')} testId="cv-out" />
      </Pair>
    </Stage>
  )
}

// ---------------------------------------------------------------- 7. konturlar
const PALETTE = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324', '#469990', '#000075']
export function ContoursTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('shapes')
  const [inv, setInv] = useState(true), [minA, setMinA] = useState(80), [eps, setEps] = useState(2), [open, setOpen] = useState(false)
  const bin = useMemo(() => { const g = gaussianBlur(toGray(img), 5, 0); let m = threshold(g, otsu(g).t, inv); if (open) m = morphology(m, 'open', 'ellipse', 3); return m }, [img, inv, open])
  const cs = useMemo<ContourInfo[]>(() => findContours(bin, minA).map((c) => describeContour(c, eps / 100)).sort((a, b) => b.area - a.area).slice(0, 30), [bin, minA, eps])
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    cs.forEach((c, i) => {
      const col = PALETTE[i % PALETTE.length]
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath()
      c.approx.forEach((p, j) => (j ? ctx.lineTo(p.x + 0.5, p.y + 0.5) : ctx.moveTo(p.x + 0.5, p.y + 0.5))); ctx.closePath(); ctx.stroke()
      ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeRect(c.box.x + 0.5, c.box.y + 0.5, c.box.w, c.box.h); ctx.setLineDash([])
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(c.cx, c.cy, 3, 0, 7); ctx.fill()
      ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#000'; ctx.fillText(String(i + 1), c.cx + 5, c.cy - 4)
    })
  }, [cs])
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Check label={tx(lang, 'Koyu nesne, açık zemin (ters eşik)', 'Dark object on light background (inverted)')} value={inv} onChange={setInv} />
      <Check label={tx(lang, 'Önce açma (3×3)', 'Opening first (3×3)')} value={open} onChange={setOpen} />
      <Slider label={tx(lang, 'En küçük alan (px)', 'Minimum area (px)')} value={minA} min={0} max={2000} step={10} onChange={setMinA} />
      <Slider label={tx(lang, 'ε (çevrenin %\'si)', 'ε (% of perimeter)')} value={eps} min={0.5} max={10} step={0.5} onChange={setEps} fmt={f1} />
      <Readout testId="cv-count">{`${tx(lang, 'nesne sayısı', 'object count')}: ${cs.length}`}</Readout>
    </>}>
      <Pair>
        <Img img={bin} label={tx(lang, 'Önce: ikili maske', 'Before: binary mask')} />
        <Img img={img} draw={draw} label={tx(lang, 'Sonra: konturlar, çokgen ve kutu', 'After: contours, polygon and box')} testId="cv-out" />
      </Pair>
      <div className="rb-scroll">
        <table className="rb-table cv-table">
          <thead><tr><th>#</th><th>{tx(lang, 'Alan', 'Area')}</th><th>{tx(lang, 'Çevre', 'Perimeter')}</th><th>{tx(lang, 'Dairesellik', 'Circularity')}</th><th>{tx(lang, 'Köşe', 'Vertices')}</th><th>{tx(lang, 'Kutu', 'Box')}</th><th>{tx(lang, 'Şekil', 'Shape')}</th></tr></thead>
          <tbody>{cs.map((c, i) => <tr key={i}><td>{i + 1}</td><td>{Math.round(c.area)}</td><td>{f1(c.perimeter)}</td><td>{f2(c.circularity)}</td><td>{c.approx.length}</td><td>{c.box.w}×{c.box.h}</td><td>{SHAPE_TEXT[shapeName(c)][lang]}</td></tr>)}</tbody>
        </table>
      </div>
    </Stage>
  )
}



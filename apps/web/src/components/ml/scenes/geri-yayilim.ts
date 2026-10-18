// Geri yayılım sahnesi: solda 2 → 2 → 1 ağ (kenarlarda ağırlık ve gradyan, düğümlerde değer ve suç), sağda çıktı çubuğu,
// kontrol tablosu (geri yayılım ve ölçüm) ve adım başına çıktı grafiği.
import { alpha, clear, dot, FONT, inset, tag, text, type Draw, type Pal } from '../draw'
import { X_IN, type BpFrame, type BpPhase } from '@/lib/ml/geri-yayilim'

const ORDER: BpPhase[] = ['net', 'hid', 'out', 'loss', 'blameOut', 'gradOut', 'blameHid', 'gradIn', 'check', 'update', 'train']
const at = (f: BpFrame, ph: BpPhase) => ORDER.indexOf(f.phase) >= ORDER.indexOf(ph)

function sgn(x: number, d: number, tr: boolean) {
  const s = Math.abs(x).toFixed(d)
  return (x < 0 ? '−' : '') + (tr ? s.replace('.', ',') : s)
}

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, p: Pal, stroke: string) {
  ctx.fillStyle = p.bg; ctx.strokeStyle = stroke; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as BpFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const IN: Array<[number, number]> = [[50, 122], [50, 330]]
  const HID: Array<[number, number]> = [[250, 122], [250, 330]]
  const OUT: [number, number] = [430, 226]
  const R = 24
  const train = f.phase === 'train'
  const showG = !train && at(f, 'gradOut') && f.phase !== 'update'
  const showGin = !train && at(f, 'gradIn') && f.phase !== 'update'
  const back = !train && at(f, 'blameOut') && f.phase !== 'update'

  // kenarlar: renk işarete, kalınlık büyüklüğe göre
  const edge = (a: [number, number], b: [number, number], w: number, hot: boolean) => {
    const m = Math.min(1, Math.abs(w) / 1.5)
    ctx.strokeStyle = alpha(w >= 0 ? p.groups[1] : p.groups[0], 0.35 + 0.55 * m); ctx.lineWidth = 1.2 + 3.5 * m
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
    if (hot) { ctx.strokeStyle = alpha(p.brand, 0.5); ctx.lineWidth = 1; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]) }
  }
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) edge(IN[i], HID[j], f.W1[i][j], back && at(f, 'blameHid'))
  for (let j = 0; j < 2; j++) edge(HID[j], OUT, f.W2[j], back)

  // kenar etiketleri: ağırlık ve (varsa) gradyan
  const label = (a: [number, number], b: [number, number], t: number, w: number, g: number | null, prevW?: number) => {
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t
    const bw = 86, bh = g === null ? 20 : 34
    box(ctx, x - bw / 2, y - bh / 2, bw, bh, p, p.line)
    const up = prevW !== undefined && w > prevW
    text(ctx, `w ${sgn(w, 3, tr)}${up ? ' ↑' : ''}`, x, y + (g === null ? 4 : -3), up ? p.groups[3] : p.ink, 11, 'center', 600)
    if (g !== null) text(ctx, `∂ ${sgn(g, 4, tr)}`, x, y + 12, p.brand, 11, 'center', 600)
  }
  const gW1 = f.g.gW1, gW2 = f.g.gW2
  // W1[i][j]: girdi i → gizli j. Düz kenarlar t = 0,55, çapraz kenarlar t = 0,27 (çarpışmasın)
  label(IN[0], HID[0], 0.55, f.W1[0][0], showGin ? gW1[0][0] : null, f.prev?.W1[0][0])
  label(IN[1], HID[1], 0.55, f.W1[1][1], showGin ? gW1[1][1] : null, f.prev?.W1[1][1])
  label(IN[0], HID[1], 0.27, f.W1[0][1], showGin ? gW1[0][1] : null, f.prev?.W1[0][1])
  label(IN[1], HID[0], 0.27, f.W1[1][0], showGin ? gW1[1][0] : null, f.prev?.W1[1][0])
  label(HID[0], OUT, 0.42, f.W2[0], showG ? gW2[0] : null, f.prev?.W2[0])
  label(HID[1], OUT, 0.42, f.W2[1], showG ? gW2[1] : null, f.prev?.W2[1])

  // düğümler
  const node = (c: [number, number], val: string | null, name: string, lit: boolean, blame?: string, above = false) => {
    dot(ctx, c[0], c[1], R, p.bg)
    if (lit) dot(ctx, c[0], c[1], R, alpha(p.brand, 0.12))
    ctx.strokeStyle = lit ? p.brand : p.ink; ctx.lineWidth = lit ? 2.5 : 1.5
    ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, Math.PI * 2); ctx.stroke()
    if (val) text(ctx, val, c[0], c[1] + 4, p.ink, 12, 'center', 700)
    text(ctx, name, c[0], c[1] - R - 8, p.muted, 11, 'center', 600)
    if (blame) { ctx.font = `600 12px ${FONT}`; tag(ctx, blame, c[0] - ctx.measureText(blame).width / 2 - 8, above ? c[1] - R - 56 : c[1] + R + 6, p, p.groups[0]) }
  }
  const names = tr ? ['basınç', 'kayma'] : ['pressure', 'slip']
  node(IN[0], sgn(X_IN[0], 1, tr), names[0], f.phase === 'gradIn')
  node(IN[1], sgn(X_IN[1], 1, tr), names[1], f.phase === 'gradIn')
  const hidOn = at(f, 'hid')
  const bl = (s: number) => `${tr ? 'suç' : 'blame'} ${sgn(s, 4, tr)}`
  for (let j = 0; j < 2; j++) node(HID[j], hidOn ? sgn(f.g.h[j], 2, tr) : null, `${tr ? 'gizli' : 'hidden'} ${j + 1}`, f.phase === 'hid' || f.phase === 'blameHid' || f.phase === 'gradOut', back && at(f, 'blameHid') ? bl(f.g.sh[j]) : undefined, j === 0)
  node(OUT, at(f, 'out') ? sgn(f.g.o, 3, tr) : null, tr ? 'çıktı' : 'output', f.phase === 'out' || f.phase === 'blameOut' || f.phase === 'loss', back ? bl(f.g.so) : undefined)

  // yön oku (ileri / geri)
  if (f.phase !== 'net' && f.phase !== 'train' && f.phase !== 'check' && f.phase !== 'update') {
    const fwd = !back
    text(ctx, fwd ? (tr ? 'ileri geçiş →' : 'forward pass →') : (tr ? '← suç geriye akar' : '← blame flows back'), 260, 28, fwd ? p.groups[1] : p.groups[0], 13, 'center', 700)
  }
  if (f.phase === 'update') text(ctx, tr ? 'her ağırlık gradyanının tersine: hepsi artar' : 'every weight against its gradient: all go up', 260, 28, p.groups[3], 13, 'center', 700)
  if (train) text(ctx, `${tr ? 'adım' : 'step'} ${f.step}`, 260, 28, p.muted, 13, 'center', 700)

  // altta o karenin formülü
  const FORM: Partial<Record<BpPhase, [string, string]>> = {
    hid: ['h = sig(girdi · W1)', 'h = sig(input · W1)'],
    out: ['çıktı = sig(h · W2)', 'output = sig(h · W2)'],
    loss: ['kayıp = (çıktı − hedef)²', 'loss = (output − target)²'],
    blameOut: ['suç = 2 · (çıktı − hedef) · çıktı · (1 − çıktı)', 'blame = 2 · (output − target) · output · (1 − output)'],
    gradOut: ['∂w = çıkışın suçu × gizli nöronun değeri', "∂w = output's blame × hidden value"],
    blameHid: ['gizli suç = çıkışın suçu × w × h · (1 − h)', "hidden blame = output's blame × w × h · (1 − h)"],
    gradIn: ['∂w = gizli nöronun suçu × girdi', "∂w = hidden neuron's blame × input"],
    check: ['ölçüm = (kayıp(w + e) − kayıp(w − e)) / 2e', 'measured = (loss(w + e) − loss(w − e)) / 2e'],
    update: ['w ← w − öğrenme oranı × ∂w', 'w ← w − learning rate × ∂w'],
  }
  const fm = FORM[f.phase]
  if (fm) text(ctx, fm[tr ? 0 : 1], 24, 430, p.ink, 13, 'left', 600)

  // sağ panel
  const rx = 494, rw = 214
  if (f.phase === 'check' && f.num) {
    box(ctx, rx, 20, rw, 250, p, p.line)
    text(ctx, tr ? 'kontrol (±0,000001 oynat)' : 'check (wiggle ±0.000001)', rx + 10, 38, p.muted, 10, 'left', 600)
    text(ctx, tr ? 'geri yayılım' : 'backprop', rx + 108, 58, p.brand, 10, 'right', 600)
    text(ctx, tr ? 'ölçüm' : 'measured', rx + rw - 10, 58, p.ink, 10, 'right', 600)
    const ana = [gW1[0][0], gW1[0][1], gW1[1][0], gW1[1][1], gW2[0], gW2[1]]
    const nm = ['W1 1→1', 'W1 1→2', 'W1 2→1', 'W1 2→2', 'W2 1', 'W2 2']
    ana.forEach((a, i) => {
      const y = 84 + i * 30
      text(ctx, nm[i], rx + 10, y - 12, p.muted, 9, 'left', 600)
      text(ctx, sgn(a, 9, tr), rx + 108, y + 2, p.brand, 11, 'right', 600)
      text(ctx, sgn(f.num![i], 9, tr), rx + rw - 10, y + 2, p.ink, 11, 'right', 600)
    })
  } else {
    // çıktı çubuğu: 0 … 1, hedef çizgisi
    box(ctx, rx, 20, rw, 250, p, p.line)
    text(ctx, tr ? 'çıktı ve hedef' : 'output and target', rx + 10, 38, p.muted, 10, 'left', 600)
    const bx = rx + 26, bw = 44, by0 = 250, by1 = 62
    const Y = (v: number) => by0 - v * (by0 - by1)
    ctx.fillStyle = p.soft; ctx.fillRect(bx, by1, bw, by0 - by1)
    if (at(f, 'out')) { ctx.fillStyle = alpha(p.brand, 0.75); ctx.fillRect(bx, Y(f.g.o), bw, by0 - Y(f.g.o)) }
    ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(bx - 2, Y(1)); ctx.lineTo(bx + bw + 8, Y(1)); ctx.stroke(); ctx.setLineDash([])
    for (const v of [0, 0.5, 1]) text(ctx, sgn(v, 1, tr), bx - 6, Y(v) + 4, p.muted, 9, 'right', 400)
    const tx = bx + bw + 18
    text(ctx, tr ? 'hedef' : 'target', tx, Y(1) + 4, p.groups[3], 11, 'left', 600)
    if (at(f, 'out')) {
      text(ctx, tr ? 'çıktı' : 'output', tx, 128, p.muted, 11, 'left', 600)
      text(ctx, sgn(f.g.o, 3, tr), tx, 154, p.ink, 22, 'left', 700)
    }
    if (at(f, 'loss')) {
      text(ctx, tr ? 'kayıp' : 'loss', tx, 192, p.muted, 11, 'left', 600)
      text(ctx, sgn(f.g.loss, 4, tr), tx, 218, f.phase === 'loss' ? p.groups[0] : p.ink, 22, 'left', 700)
    }
  }
  if (f.k > 1) inset(ctx, rx, 286, rw, 130, [{ v: f.outs.slice(0, f.k), col: p.brand }], tr ? 'çıktı · adım 0–60' : 'output · steps 0–60', p, { n: f.outs.length })
  text(ctx, `${tr ? 'öğrenme oranı' : 'learning rate'} ${sgn(f.lr, 1, tr)}`, rx, 436, p.muted, 11, 'left', 500)
}

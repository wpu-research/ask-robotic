// Ders sahnesi: CI/CD hattı. Üstte aşama kutuları ve banttaki commit, ortada durduğu aşamaya göre commit geçmişi,
// altta 200 robotluk filo (canary %10 → %50 → %100) ve canary hata oranı ile %2 eşiği.
import { alpha, clear, text, type Draw } from '../draw'
import { THRESH, type CiFrame } from '@/lib/ml/ci-cd-hatti'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as CiFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const OK = p.groups[3], BAD = p.groups[0]
  const names = tr ? ['commit', 'derleme', 'birim test', 'entegrasyon', 'hazırlık', 'üretim'] : ['commit', 'build', 'unit tests', 'integration', 'staging', 'production']
  const BW = 104, GX = 13, X0 = 12, BY = 44, BH = 52
  const bx = (i: number) => X0 + i * (BW + GX)
  const cur = f.cur >= 0 ? f.commits[f.cur] : null
  const boxStage = Math.min(5, f.stage)
  // bant
  ctx.strokeStyle = p.line; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(bx(0) + 10, BY + BH / 2); ctx.lineTo(bx(5) + BW - 10, BY + BH / 2); ctx.stroke()
  names.forEach((nm, i) => {
    const active = cur && i === boxStage
    let stroke = p.line, fill = p.soft
    if (active) {
      if (f.status === 'fail') { stroke = BAD; fill = alpha(BAD, 0.15) }
      else if (f.status === 'pass') { stroke = OK; fill = alpha(OK, 0.15) }
      else { stroke = p.brand; fill = alpha(p.brand, 0.12) }
    } else if (cur && i < boxStage) { stroke = OK; fill = alpha(OK, 0.07) }
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = active ? 2.5 : 1.5
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx(i), BY, BW, BH, 8); else ctx.rect(bx(i), BY, BW, BH); ctx.fill(); ctx.stroke()
    text(ctx, nm, bx(i) + BW / 2, BY + 22, p.ink, 12, 'center', 700)
    if (i === 5) {
      const ro = cur && f.stage >= 5 ? f.rollout : 0
      text(ctx, ro ? (tr ? `%${ro} filo` : `${ro}% fleet`) : (tr ? 'filo' : 'fleet'), bx(i) + BW / 2, BY + 40, ro ? p.brand : p.muted, 11, 'center', 600)
    } else if (active) {
      const st = f.status === 'fail' ? (tr ? '✗ kırmızı' : '✗ red') : f.status === 'pass' ? (tr ? '✓ yeşil' : '✓ green') : (tr ? 'koşuyor…' : 'running…')
      text(ctx, st, bx(i) + BW / 2, BY + 40, f.status === 'fail' ? BAD : f.status === 'pass' ? OK : p.brand, 11, 'center', 600)
    }
    if (i < 5) { ctx.fillStyle = p.muted; ctx.beginPath(); const ax = bx(i) + BW + GX / 2; ctx.moveTo(ax - 3, BY + BH / 2 - 5); ctx.lineTo(ax + 4, BY + BH / 2); ctx.lineTo(ax - 3, BY + BH / 2 + 5); ctx.fill() }
  })
  // başlık satırı
  if (cur) text(ctx, `commit #${cur.n + 1} · ${cur.id}`, 14, 26, p.ink, 13, 'left', 700)
  text(ctx, tr ? `filo sürümü v1.${f.version}` : `fleet version v1.${f.version}`, W - 14, 26, p.brand, 13, 'right', 700)
  // banttaki commit
  if (cur) {
    const cx = bx(boxStage) + BW / 2, cy = BY + BH + 16
    const col = f.status === 'fail' ? BAD : f.status === 'pass' ? OK : p.brand
    ctx.fillStyle = col; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(cx - 24, cy - 10, 48, 20, 10); else ctx.rect(cx - 24, cy - 10, 48, 20); ctx.fill()
    text(ctx, `#${cur.n + 1}`, cx, cy + 4, p.bg, 11, 'center', 700)
  }
  // geçmiş: önceki commit'ler durdukları aşamanın altında
  const HY = 150
  text(ctx, tr ? 'durdukları yer' : 'where they stopped', 14, HY - 8, p.muted, 10, 'left', 600)
  const counts = [0, 0, 0, 0, 0, 0]
  const upto = f.cur < 0 ? (f.done ? f.commits.length : 0) : f.cur
  for (let j = 0; j < upto; j++) {
    const c = f.commits[j]
    const col5 = Math.min(5, c.stopAt)
    const k = counts[col5]++
    const x = bx(col5) + 4 + (k % 4) * 25, y = HY + Math.floor(k / 4) * 20
    const colr = c.stopAt === 6 ? OK : c.stopAt === 5 ? p.groups[2] : BAD
    ctx.fillStyle = alpha(colr, 0.85); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, 22, 16, 5); else ctx.rect(x, y, 22, 16); ctx.fill()
    text(ctx, String(c.n + 1), x + 11, y + 12, p.bg, 9.5, 'center', 700)
  }
  // açıklama
  const ly = 238
  const leg: Array<[string, string]> = [[OK, tr ? 'üretime çıktı' : 'shipped'], [p.groups[2], tr ? 'canary geri aldı' : 'canary rolled back'], [BAD, tr ? 'testte durdu' : 'stopped in tests']]
  let lx = 14
  for (const [c, s] of leg) { ctx.fillStyle = c; ctx.fillRect(lx, ly - 9, 12, 10); text(ctx, s, lx + 16, ly, p.muted, 10); ctx.font = `500 10px Poppins, system-ui, sans-serif`; lx += ctx.measureText(s).width + 36 }

  // filo: 200 robot (20 × 10)
  const FX = 20, FY = 268, cell = 16
  text(ctx, tr ? 'filo: 200 robot' : 'fleet: 200 robots', FX, FY - 10, p.ink, 12, 'left', 700)
  const ro = cur && f.stage >= 5 ? f.rollout : 0
  for (let i = 0; i < 200; i++) {
    const x = FX + (i % 20) * cell + cell / 2, y = FY + Math.floor(i / 20) * cell + cell / 2
    const isNew = i < (ro / 100) * 200
    let col = f.version ? alpha(OK, 0.45) : alpha(p.muted, 0.35)
    if (isNew) col = f.rolledBack ? alpha(p.groups[2], 0.5) : p.brand
    if (isNew && cur?.errs && i < 20 && cur.errs[i] >= 4 && f.stage === 5) col = BAD
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill()
  }
  const LY = FY + 10 * cell + 16
  ctx.fillStyle = p.brand; ctx.beginPath(); ctx.arc(FX + 4, LY - 4, 4.5, 0, Math.PI * 2); ctx.fill()
  text(ctx, tr ? 'yeni sürüm' : 'new version', FX + 13, LY, p.muted, 10)
  ctx.fillStyle = alpha(OK, 0.45); ctx.beginPath(); ctx.arc(FX + 100, LY - 4, 4.5, 0, Math.PI * 2); ctx.fill()
  text(ctx, tr ? 'mevcut sürüm' : 'current version', FX + 109, LY, p.muted, 10)
  ctx.fillStyle = BAD; ctx.beginPath(); ctx.arc(FX + 196, LY - 4, 4.5, 0, Math.PI * 2); ctx.fill()
  text(ctx, tr ? 'hata yapan robot' : 'robot with errors', FX + 205, LY, p.muted, 10)

  // canary paneli
  const PX = 380, PY = 262
  text(ctx, tr ? 'canary hata oranı (20 robot × 50 görev)' : 'canary error rate (20 robots × 50 missions)', PX, PY, p.ink, 12, 'left', 700)
  const maxR = 0.15, bw = 300
  const bxp = (r: number) => PX + (Math.min(r, maxR) / maxR) * bw
  ctx.fillStyle = p.soft; ctx.fillRect(PX, PY + 14, bw, 26)
  const rate = cur?.rate
  if (rate !== undefined && f.stage >= 5) {
    ctx.fillStyle = rate > THRESH ? BAD : OK
    ctx.fillRect(PX, PY + 14, Math.max(2, bxp(rate) - PX), 26)
    const rs = tr ? `%${(100 * rate).toFixed(1).replace('.', ',')}` : `${(100 * rate).toFixed(1)}%`
    text(ctx, rs, Math.min(PX + bw - 4, Math.max(bxp(rate), bxp(THRESH)) + 6), PY + 32, p.ink, 12, bxp(rate) + 50 > PX + bw ? 'right' : 'left', 700)
  }
  ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bxp(THRESH), PY + 8); ctx.lineTo(bxp(THRESH), PY + 46); ctx.stroke()
  text(ctx, tr ? 'eşik %2' : 'threshold 2%', bxp(THRESH), PY + 60, p.ink, 10, 'center', 600)
  ;[0, 0.05, 0.1, 0.15].forEach((r) => text(ctx, tr ? `%${Math.round(100 * r)}` : `${Math.round(100 * r)}%`, bxp(r), PY + 76, p.muted, 9, 'center'))
  // kademeler
  const steps = [10, 50, 100]
  steps.forEach((s, i) => {
    const x = PX + i * 104, y = PY + 96
    const on = ro >= s && !f.rolledBack
    const fail = f.rolledBack && s === 10
    ctx.fillStyle = fail ? alpha(BAD, 0.15) : on ? alpha(OK, 0.15) : p.soft; ctx.strokeStyle = fail ? BAD : on ? OK : p.line; ctx.lineWidth = 1.5
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, 92, 34, 8); else ctx.rect(x, y, 92, 34); ctx.fill(); ctx.stroke()
    text(ctx, tr ? `%${s}` : `${s}%`, x + 46, y + 22, fail ? BAD : on ? OK : p.muted, 13, 'center', 700)
  })
  if (f.rolledBack) text(ctx, tr ? '↺ geri alındı: 20 robot eski sürüme döndü' : '↺ rolled back: 20 robots back on the old version', PX, PY + 156, BAD, 12, 'left', 700)
  if (f.done) {
    const prod = f.commits.filter((c) => c.stopAt === 6)
    const bad = prod.filter((c) => c.bug !== 'yok').length
    text(ctx, tr ? `üretime çıkan ${prod.length} sürümde hatalı: ${bad}` : `buggy among ${prod.length} shipped versions: ${bad}`, PX, PY + 156, bad ? BAD : OK, 13, 'left', 700)
  }
}

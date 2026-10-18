'use client'
// Dönüşen Robot görünümü: aynı 11 parça seçilen modele göre dizilir (eklemler durumdan gelen açıyla oynar).
// `ModelFigure` hem kurulum adımlarında (parçalar kutudan yerine kayar) hem sahnede kullanılır. 1 birim = model kutusunun 1/120'si.
import { useEffect, useRef, useState } from 'react'
import { BACK_CM, CRANE_PAD, DONUSEN_MODELS, PART_IDS, PARTS, WALL_CM, type DonusenBot, type DonusenModelId, type Joint, type PartId } from '@/lib/mikro/donusen'
import { useI18n } from '@/i18n/client'

/** Parça kutusu: kurulmamış parçalar modelin altında sırayla durur. */
const TRAY: Record<PartId, { x: number; y: number; r?: number }> = {
  hub: { x: 14, y: 112 }, eye: { x: 34, y: 108 }, motorA: { x: 50, y: 108 }, motorB: { x: 66, y: 108 },
  wheel1: { x: 82, y: 110 }, wheel2: { x: 98, y: 110 }, plate: { x: 110, y: 122 },
  beam1: { x: 26, y: 124 }, beam2: { x: 26, y: 131 }, beam3: { x: 70, y: 124 }, beam4: { x: 70, y: 131 },
}

function PartShape({ id }: { id: PartId }) {
  switch (PARTS[id].shape) {
    case 'card': return (<g><rect x={-12} y={-9} width={24} height={18} rx={2.5} fill="#0f766e" stroke="#0f172a" strokeWidth={0.6} /><rect x={-6} y={-6} width={12} height={12} rx={1} fill="#111827" />{[0, 1, 2].map((i) => <circle key={i} cx={-3 + i * 3} cy={0} r={0.9} fill="#f87171" />)}</g>)
    case 'eye': return (<g><rect x={-7} y={-3.5} width={14} height={7} rx={1.5} fill="#e2e8f0" stroke="#0f172a" strokeWidth={0.5} /><circle cx={-3.2} cy={0} r={2.2} fill="#1e293b" /><circle cx={3.2} cy={0} r={2.2} fill="#1e293b" /></g>)
    case 'motor': return (<g><rect x={-7} y={-5} width={14} height={10} rx={2} fill="#f8fafc" stroke="#0f172a" strokeWidth={0.5} /><circle r={2.4} fill="#f97316" stroke="#0f172a" strokeWidth={0.4} /></g>)
    case 'beam': return (<g><rect x={-20} y={-2.5} width={40} height={5} rx={2.5} fill="#2563eb" stroke="#0f172a" strokeWidth={0.4} />{Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-15 + i * 5} cy={0} r={0.9} fill="#0f172a" opacity={0.5} />)}</g>)
    case 'short': return (<g><rect x={-12} y={-2.5} width={24} height={5} rx={2.5} fill="#16a34a" stroke="#0f172a" strokeWidth={0.4} />{Array.from({ length: 4 }, (_, i) => <circle key={i} cx={-7.5 + i * 5} cy={0} r={0.9} fill="#0f172a" opacity={0.5} />)}</g>)
    case 'wheel': return (<g><circle r={6.5} fill="#1f2937" /><circle r={2.6} fill="#e5e7eb" /><rect x={-0.6} y={-6} width={1.2} height={3.4} fill="#94a3b8" /></g>)
    case 'plate': return (<rect x={-16} y={-3} width={32} height={6} rx={1.5} fill="#facc15" stroke="#0f172a" strokeWidth={0.4} />)
  }
}

/** Bir eklemin SVG dönüşümü (pivot etrafında). Vinç kolu yandan görünüşte açının kosinüsüyle kısalır; kanca kol ucunu izler ve iner. */
function jointTransform(j: Joint | undefined, pivot: [number, number] | undefined, bot: DonusenBot | null): string | undefined {
  if (!j || !bot) return undefined
  const [px, py] = pivot ?? [0, 0]
  if (j === 'boom') { const c = Math.cos((bot.boom * Math.PI) / 180); return `translate(${px} ${py}) scale(${Math.abs(c) < 0.04 ? 0.04 * Math.sign(c || 1) : c} 1) translate(${-px} ${-py})` }
  if (j === 'hook') { const c = Math.cos((bot.boom * Math.PI) / 180); return `translate(${(c - 1) * 38} ${bot.hook * 22})` }
  const a = bot.jointAngle(j)
  return a ? `rotate(${a.toFixed(1)} ${px} ${py})` : undefined
}

/** Modeli çizer. `placed` verilirse yalnız o parçalar yerinde, ötekiler kutuda (kurulum görünümü). */
export function ModelFigure({ model, bot, placed }: { model: DonusenModelId; bot?: DonusenBot | null; placed?: ReadonlySet<PartId> }) {
  const m = DONUSEN_MODELS[model]
  return (
    <g>
      {PART_IDS.map((id) => {
        const on = !placed || placed.has(id)
        const p = on ? m.poses[id] : { ...TRAY[id], joint: undefined, pivot: undefined }
        return (
          <g key={id} transform={on ? jointTransform(p.joint, p.pivot, bot ?? null) : undefined} data-part={id} data-placed={on || undefined}>
            <g className="dn-part" style={{ transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r ?? 0}deg)` }}><PartShape id={id} /></g>
          </g>
        )
      })}
    </g>
  )
}

/** Kurulum adımları: kart dizisi + canlandırma. Model değişince parçalar kutudan baştan kurulur (oynatma kendiliğinden başlar). */
export function BuildSteps({ model }: { model: DonusenModelId }) {
  const { locale, t } = useI18n()
  const en = locale === 'en'
  const m = DONUSEN_MODELS[model]
  const [idx, setIdx] = useState(-1)
  const [playing, setPlaying] = useState(true)
  useEffect(() => { setIdx(-1); setPlaying(true) }, [model])
  useEffect(() => {
    if (!playing) return
    if (idx >= m.build.length - 1) { setPlaying(false); return }
    const h = setTimeout(() => setIdx((i) => i + 1), idx < 0 ? 500 : 1300)
    return () => clearTimeout(h)
  }, [playing, idx, m.build.length])
  const placed = new Set(m.build.slice(0, idx + 1).flatMap((s) => s.parts))
  const cur = idx >= 0 ? m.build[idx] : null
  return (
    <figure className="dn-build" data-testid="donusen-build" data-step={idx + 1}>
      <svg viewBox="0 0 120 136" role="img" aria-label={t('mikro.donusen.buildAria', { model: en ? m.en.title : m.title })}>
        <rect x={2} y={100} width={116} height={34} rx={3} className="dn-tray" />
        <ModelFigure model={model} placed={placed} />
      </svg>
      <figcaption>
        <b>{cur ? t('mikro.donusen.stepN', { n: idx + 1, total: m.build.length }) : t('mikro.donusen.parts')}</b>
        <span aria-live="polite">{cur ? (en ? cur.en : cur.text) : t('mikro.donusen.partsHint')}</span>
        <div className="dn-build-btns">
          <button type="button" className="mk-btn" onClick={() => { setPlaying(false); setIdx((i) => Math.max(-1, i - 1)) }} disabled={idx < 0}>{t('mikro.donusen.prev')}</button>
          <button type="button" className="mk-btn" onClick={() => { setPlaying(false); setIdx((i) => Math.min(m.build.length - 1, i + 1)) }} disabled={idx >= m.build.length - 1} data-testid="donusen-next">{t('mikro.donusen.next')}</button>
          <button type="button" className="mk-btn" onClick={() => { setIdx(-1); setPlaying(true) }}>{t('mikro.donusen.replay')}</button>
        </div>
      </figcaption>
    </figure>
  )
}

// ---------------- sahne ----------------
const PX = 2.4
const trackX = (cm: number) => 40 + (cm - BACK_CM) * PX

function Bubble({ x, y, text }: { x: number; y: number; text: string }) {
  const w = Math.max(36, text.length * 6.4 + 16)
  return (
    <g className="dn-bubble" data-testid="donusen-bubble">
      <rect x={x - w / 2} y={y - 26} width={w} height={22} rx={8} />
      <path d={`M${x - 5} ${y - 4.5}L${x} ${y + 4}L${x + 5} ${y - 4.5}`} />
      <text x={x} y={y - 11} textAnchor="middle">{text}</text>
    </g>
  )
}

/** Dönüşen Robot sahnesi: pist (duvar, garaj), el ve kaydırıcı ya da vinç kadranı. `tick` yeniden çizdirir. */
export function DonusenStage({ bot, tick }: { bot: DonusenBot; tick: number }) {
  const { locale, t } = useI18n()
  const en = locale === 'en'
  const m = bot.model
  const [, force] = useState(0)
  const autoRef = useRef(bot.handScript)
  useEffect(() => { autoRef.current = bot.handScript }, [bot])
  const auto = !!bot.handScript
  const speech = bot.speaking
  const title = en ? m.en.title : m.title

  let scene: React.ReactNode
  if (m.sees === 'wall') {
    const S = 1.4
    const cx = trackX(bot.x - bot.dir * 16)
    const flip = bot.dir === -1
    scene = (
      <>
        <line x1={20} y1={190} x2={590} y2={190} className="dn-floor" />
        <rect x={trackX(WALL_CM)} y={70} width={10} height={120} className="dn-wall" />
        <rect x={trackX(BACK_CM) - 10} y={70} width={10} height={120} className="dn-wall" />
        {m.id === 'arac' && <>
          <rect x={trackX(39)} y={120} width={(89 - 39) * PX} height={70} className="dn-garage" /><text x={trackX(64)} y={116} textAnchor="middle" className="dn-label">{t('mikro.donusen.garage')}</text>
          <rect x={trackX(BACK_CM)} y={120} width={32 * PX} height={70} className="dn-garage home" /><text x={trackX(BACK_CM + 16)} y={116} textAnchor="middle" className="dn-label">{t('mikro.donusen.home')}</text>
        </>}
        {[0, 50, 100, 150].map((c) => <text key={c} x={trackX(c)} y={206} textAnchor="middle" className="dn-label">{c} cm</text>)}
        <g transform={`translate(${cx} ${190 - 92 * S}) scale(${flip ? -S : S} ${S}) translate(-60 0)`}><ModelFigure model={m.id} bot={bot} /></g>
        {speech && <Bubble x={cx} y={190 - 92 * S + 14} text={speech} />}
      </>
    )
  } else if (m.sees === 'hand') {
    const S = 1.6, tx = 60, ty = 190 - 95 * S
    const eye = m.poses.eye
    const ex = tx + (eye.x + 8) * S, ey = ty + eye.y * S
    const hx = ex + 14 + Math.min(100, bot.handCm) * 3
    scene = (
      <>
        <line x1={20} y1={190} x2={590} y2={190} className="dn-floor" />
        <g transform={`translate(${tx} ${ty}) scale(${S})`}><ModelFigure model={m.id} bot={bot} /></g>
        <line x1={ex} y1={ey} x2={hx - 14} y2={ey} className="dn-ray" />
        <g className="dn-hand" transform={`translate(${hx} ${ey})`} data-testid="donusen-hand">
          <rect x={0} y={-12} width={34} height={24} rx={10} /><rect x={-14} y={-9} width={18} height={6} rx={3} /><rect x={-16} y={-2} width={20} height={6} rx={3} /><rect x={-14} y={5} width={18} height={6} rx={3} />
        </g>
        <text x={hx + 16} y={ey - 18} textAnchor="middle" className="dn-label">{Math.round(bot.handCm)} cm</text>
        {bot.stringAmp > 0 && <text x={tx + 70 * S} y={ty + 20} className="dn-note">♪ ♫</text>}
        {speech && <Bubble x={tx + 70 * S} y={ty + 30 * S} text={speech} />}
      </>
    )
  } else {
    const R = 52, cxd = 470, cyd = 110
    const CS = 1.7, CX = 60, CY = 190 - 92 * CS
    const pt = (deg: number, r = R): [number, number] => [cxd - Math.cos((deg * Math.PI) / 180) * r, cyd - Math.sin((deg * Math.PI) / 180) * r]
    const [bx, by] = pt(bot.boom, R + 6)
    const [p1x, p1y] = pt(CRANE_PAD.from, R + 14), [p2x, p2y] = pt(CRANE_PAD.to, R + 14)
    scene = (
      <>
        <line x1={20} y1={190} x2={590} y2={190} className="dn-floor" />
        <g transform={`translate(${CX} ${CY}) scale(${CS})`}><ModelFigure model={m.id} bot={bot} /></g>
        {bot.loads.filter((l) => l.lifted).map((l) => <rect key={l.id} x={CX + (60 + Math.cos((bot.boom * Math.PI) / 180) * 38) * CS - 8} y={CY + (34 + bot.hook * 22 + 7) * CS} width={16} height={14} fill={l.color} className="dn-crate" />)}
        <g data-testid="donusen-dial">
          <circle cx={cxd} cy={cyd} r={R + 14} className="dn-dial" />
          <path d={`M${cxd} ${cyd}L${p1x} ${p1y}A${R + 14} ${R + 14} 0 0 0 ${p2x} ${p2y}Z`} className="dn-pad" />
          <line x1={cxd} y1={cyd} x2={bx} y2={by} className="dn-boom" />
          {bot.loads.map((l) => { const [lx, ly] = pt(l.angle, l.lifted ? R + 6 : R); return <rect key={l.id} x={lx - 6} y={ly - 6} width={12} height={12} rx={2} fill={l.color} className="dn-crate" data-lifted={l.lifted || undefined} /> })}
          <text x={cxd} y={cyd + R + 30} textAnchor="middle" className="dn-label">{t('mikro.donusen.arm', { deg: Math.round(bot.boom) })}</text>
        </g>
        {speech && <Bubble x={150} y={60} text={speech} />}
      </>
    )
  }

  return (
    <figure className="dn-stage" data-testid="donusen-stage" data-tick={tick} data-model={m.id}>
      <svg viewBox="0 0 600 215" role="img" aria-label={t('mikro.donusen.stageAria', { model: title })}>{scene}</svg>
      <figcaption className="rb-readout">
        <span>{t('mikro.donusen.model')} <b>{title}</b></span>
        {m.sees !== 'none' && <span>{t('mikro.arena.distance')} <b>{bot.distanceCm} cm</b></span>}
        {m.sees === 'wall' && <span>{t('mikro.arena.path')} <b>{Math.round(bot.x)} cm</b></span>}
        {bot.bumped && <span className="bad">{t('mikro.donusen.bumped')}</span>}
      </figcaption>
      {m.sees === 'hand' && (
        <div className="dn-handctl">
          <label>{t('mikro.donusen.hand')}
            <input type="range" min={0} max={100} value={Math.round(bot.handCm)} disabled={auto}
              onChange={(e) => { bot.handCm = Number(e.target.value); force((n) => n + 1) }} data-testid="donusen-hand-range" />
          </label>
          {autoRef.current && (
            <label className="dn-auto"><input type="checkbox" checked={auto} onChange={(e) => { bot.handScript = e.target.checked ? autoRef.current : null; force((n) => n + 1) }} /> {t('mikro.donusen.autoHand')}</label>
          )}
        </div>
      )}
    </figure>
  )
}

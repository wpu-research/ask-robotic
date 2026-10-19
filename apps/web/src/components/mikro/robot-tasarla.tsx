'use client'
// Robotunu Tasarla: parça paleti + 3B tezgâh (ızgaraya oturan yerleştirme) + üstten ızgara + özellikler ve doğrulama +
// tasarımı aynı blok programlarıyla görevlerde, serbest arenada ve tasarım yarışmalarında deneme.
// Tasarımlar tarayıcıda saklanır (bu uygulamada kullanıcı başına tasarım deposu yok); JSON olarak dışa/içe aktarılır.
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MikroEditor } from './mikro-editor'
import {
  CHASSIS, CHASSIS_IDS, PARTS, PART_GROUPS, PART_TYPES, TEMPLATES, canPlace, cardCells, deriveDesign, emptyDesign, exportDesign,
  importDesign, placePart, removePart, rotatePart, setChassis, type ChassisId, type PartType, type RobotDesign,
} from '@/lib/mikro/tasarim'
import { DESIGN_CHALLENGES, runDesignChallenge, type DesignResult } from '@/lib/mikro/tasarim-gorevleri'
import { ROBOT_MISSIONS, freeScene } from '@/lib/mikro/robot-missions'
import { onStart, project } from '@/lib/mikro/program'
import type { MikroProject } from '@/lib/mikro/types'
import { hasWebGL } from '../three/core'
import { useI18n } from '@/i18n/client'
import './robot.css'
import './tasarim.css'

const Tasarim3D = dynamic(() => import('./tasarim-3d').then((m) => m.Tasarim3D), { ssr: false, loading: () => <div className="rt-3d" /> })

const CUR_KEY = 'ask:tasarim:current:v1'
const LIST_KEY = 'ask:tasarim:list:v1'
const MODE_KEY = 'ask:tasarim:mode:v1'
type Tool = { kind: 'part'; type: PartType } | { kind: 'select' } | { kind: 'erase' }
type Target = { kind: 'free' } | { kind: 'mission'; id: string } | { kind: 'challenge'; id: string }
interface Saved { name: string; at: number; design: RobotDesign }

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d } catch { return d } }
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* gizli pencere */ } }

/** Çocuk kipinde 0-5 yıldız: değeri aralığa oturtur. */
const stars = (v: number, lo: number, hi: number) => Math.max(0, Math.min(5, Math.round(((v - lo) / (hi - lo)) * 5)))

export function RobotTasarla() {
  const { locale } = useI18n()
  const en = locale === 'en'
  const L = (tr: string, e: string) => (en ? e : tr)
  const [design, setDesign] = useState<RobotDesign>(() => TEMPLATES[0].design)
  const [loaded, setLoaded] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [tool, setTool] = useState<Tool>({ kind: 'part', type: 'teker-buyuk' })
  const [selected, setSelected] = useState<string | null>(null)
  const [cones, setCones] = useState(true)
  const [saved, setSaved] = useState<Saved[]>([])
  const [msg, setMsg] = useState('')
  const [target, setTarget] = useState<Target>({ kind: 'free' })
  const [testing, setTesting] = useState(false)
  const [gl, setGl] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const cur = importDesign(load<unknown>(CUR_KEY, null))
    if (cur.ok) setDesign(cur.design)
    setSaved(load<Saved[]>(LIST_KEY, []).filter((s) => importDesign(s.design).ok))
    setAdvanced(load<boolean>(MODE_KEY, false))
    setGl(hasWebGL())
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) save(CUR_KEY, JSON.parse(exportDesign(design))) }, [design, loaded])
  useEffect(() => { if (loaded) save(MODE_KEY, advanced) }, [advanced, loaded])
  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500) }

  const dd = useMemo(() => deriveDesign(design), [design])
  const ch = CHASSIS[design.chassis]
  const sel = design.parts.find((p) => p.id === selected) ?? null

  const onCell = useCallback((c: number, r: number) => {
    const hit = design.parts.find((p) => p.c === c && p.r === r)
    if (tool.kind === 'erase') { if (hit) { setDesign(removePart(design, hit.id)); setSelected(null) } return }
    if (tool.kind === 'select' || hit) { setSelected(hit?.id ?? null); return }
    const ok = canPlace(design, tool.type, c, r)
    if (!ok.ok) { say(en ? ok.whyEn : ok.why); return }
    const next = placePart(design, tool.type, c, r, { autoMotor: !advanced })
    setDesign(next)
    setSelected(next.parts[design.parts.length]?.id ?? null)
  }, [design, tool, advanced, en])
  const canDrop = useCallback((c: number, r: number) => tool.kind !== 'part' || canPlace(design, tool.type, c, r).ok, [design, tool])

  // ---- kaydet / aç ----
  const saveNamed = () => {
    const name = design.name.trim() || L('Robotum', 'My robot')
    const list = [{ name, at: Date.now(), design }, ...saved.filter((s) => s.name !== name)].slice(0, 20)
    setSaved(list); save(LIST_KEY, list); say(L(`"${name}" kaydedildi.`, `"${name}" saved.`))
  }
  const download = () => {
    const blob = new Blob([exportDesign(design)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(design.name || 'robot').replace(/[^\p{L}\p{N}_-]+/gu, '-')}.robot.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const upload = async (f: File | undefined) => {
    if (!f) return
    const r = importDesign(await f.text())
    if (r.ok) { setDesign(r.design); setSelected(null); say(L('Tasarım açıldı.', 'Design opened.')) } else say(r.error)
  }

  // ---- deneme ----
  const mission = target.kind === 'mission' ? ROBOT_MISSIONS.find((m) => m.id === target.id) ?? null : null
  const challenge = target.kind === 'challenge' ? DESIGN_CHALLENGES.find((c) => c.id === target.id) ?? null : null
  const robot = useMemo(() => ({ profile: dd.profile, scene: mission ? mission.scene : challenge ? challenge.scene : freeScene }), [dd.profile, mission, challenge])
  const targetKey = target.kind === 'free' ? 'serbest' : `${target.kind}:${target.id}`
  const sig = useMemo(() => JSON.stringify([design.chassis, design.parts.map((p) => [p.type, p.c, p.r, p.rot ?? 0])]), [design])
  const freeStart = useMemo(() => project(challenge ? (en ? challenge.en.title : challenge.title) : design.name || 'Robot', [onStart()]), [challenge, design.name, en])
  const [current, setCurrent] = useState<MikroProject | null>(null)

  const errors = dd.issues.filter((i) => i.level === 'hata')
  const warns = dd.issues.filter((i) => i.level === 'uyari')
  const num = (v: number, d = 0) => (en ? v.toFixed(d) : v.toFixed(d).replace('.', ','))

  const partBtn = (t: PartType) => {
    const s = PARTS[t]
    const on = tool.kind === 'part' && tool.type === t
    return (
      <li key={t}>
        <button type="button" className="rt-part" aria-pressed={on} onClick={() => { setTool({ kind: 'part', type: t }); setSelected(null) }} data-testid={`rt-part-${t}`}>
          <span className="rt-sw" style={{ background: s.color }} aria-hidden="true" />
          <span className="rt-pt"><b>{en ? s.en : s.title}</b>
            <small>{advanced ? partNumbers(t, en) : en ? s.tipEn : s.tip}</small>
          </span>
        </button>
      </li>
    )
  }

  return (
    <div className="rt" data-testid="robot-tasarla">
      <div className="rt-bar">
        <label className="rt-name">{L('Adı', 'Name')} <input value={design.name} maxLength={40} onChange={(e) => setDesign({ ...design, name: e.target.value })} data-testid="rt-name" /></label>
        <label>{L('Şasi', 'Chassis')} <select value={design.chassis} onChange={(e) => setDesign(setChassis(design, e.target.value as ChassisId))} data-testid="rt-chassis">
          {CHASSIS_IDS.map((id) => <option key={id} value={id}>{en ? CHASSIS[id].en : CHASSIS[id].title} ({CHASSIS[id].cols * 2}×{CHASSIS[id].rows * 2} cm)</option>)}
        </select></label>
        <label>{L('Hazır', 'Template')} <select value="" onChange={(e) => { const t = TEMPLATES.find((x) => x.id === e.target.value); if (t) { setDesign(t.design); setSelected(null) } else if (e.target.value === 'bos') setDesign(emptyDesign(L('Benim robotum', 'My robot'), design.chassis)) }} data-testid="rt-template">
          <option value="">{L('Seç…', 'Pick…')}</option>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{en ? t.en : t.design.name}</option>)}
          <option value="bos">{L('Boş şasi', 'Empty chassis')}</option>
        </select></label>
        <div className="rt-mode" role="group" aria-label={L('Görünüm kipi', 'View mode')}>
          <button type="button" aria-pressed={!advanced} onClick={() => setAdvanced(false)} data-testid="rt-simple">{L('Basit', 'Simple')}</button>
          <button type="button" aria-pressed={advanced} onClick={() => setAdvanced(true)} data-testid="rt-advanced">{L('İleri (sayılar)', 'Advanced (numbers)')}</button>
        </div>
      </div>

      <div className="rt-main">
        <aside className="rt-palette" aria-label={L('Parçalar', 'Parts')}>
          <div className="rt-tools">
            <button type="button" className="rt-tool" aria-pressed={tool.kind === 'select'} onClick={() => setTool({ kind: 'select' })}>{L('Seç', 'Select')}</button>
            <button type="button" className="rt-tool" aria-pressed={tool.kind === 'erase'} onClick={() => setTool({ kind: 'erase' })} data-testid="rt-erase">{L('Sil', 'Erase')}</button>
          </div>
          {PART_GROUPS.map((g) => (
            <section key={g.id}>
              <h3>{en ? g.en : g.title}</h3>
              <ul>{PART_TYPES.filter((t) => PARTS[t].group === g.id).map(partBtn)}</ul>
            </section>
          ))}
        </aside>

        <section className="rt-stage" aria-label={L('Tasarım tezgâhı', 'Build bench')}>
          {gl && <Tasarim3D design={design} selectedId={selected} showCones={cones} onCell={onCell} canDrop={canDrop} label={L('Robotun 3B görünüşü', '3D view of the robot')} />}
          <div className="rt-stage-bar">
            <label><input type="checkbox" checked={cones} onChange={(e) => setCones(e.target.checked)} /> {L('Sensör görüş konileri', 'Sensor view cones')}</label>
            <span className="rt-legend"><i className="ok" /> {L('ağırlık merkezi ve destek alanı', 'center of mass and support area')}</span>
          </div>
          <TopGrid design={design} selected={selected} onCell={onCell} canDrop={canDrop} en={en} />
          {sel && (
            <div className="rt-sel" data-testid="rt-selected">
              <b>{en ? PARTS[sel.type].en : PARTS[sel.type].title}</b>
              <span className="muted">{en ? PARTS[sel.type].tipEn : PARTS[sel.type].tip}</span>
              <button type="button" className="mk-btn small" onClick={() => setDesign(rotatePart(design, sel.id))} data-testid="rt-rotate">{L('Döndür', 'Rotate')} ↻</button>
              <button type="button" className="mk-btn small" onClick={() => { setDesign(removePart(design, sel.id)); setSelected(null) }}>{L('Çıkar', 'Remove')}</button>
            </div>
          )}
          {msg && <p className="rt-msg" role="status">{msg}</p>}
        </section>

        <aside className="rt-props" aria-label={L('Robotun özellikleri', 'Robot properties')}>
          <h3>{L('Robotun özellikleri', 'Robot properties')}</h3>
          {advanced ? (
            <dl className="rt-nums" data-testid="rt-numbers">
              <dt>{L('Kütle', 'Mass')}</dt><dd>{dd.massG} g</dd>
              <dt>{L('Ağırlık merkezi', 'Center of mass')}</dt><dd>x {num(dd.com.x * 1000)} · y {num(dd.com.y * 1000)} · z {num(dd.com.z * 1000)} mm</dd>
              <dt>{L('Devrilme açısı', 'Tip-over angle')}</dt><dd>{num(dd.tipAngleDeg)}°</dd>
              <dt>{L('Teker açıklığı / çapı', 'Wheel base / diameter')}</dt><dd>{num(dd.wheelBase * 1000)} / {num(dd.profile.wheelDiameter * 1000)} mm</dd>
              <dt>{L('En yüksek hız', 'Top speed')}</dt><dd>{dd.speedCmS} cm/s ({dd.maxDegPerS}°/s)</dd>
              <dt>{L('Yerinde dönüş', 'Spin rate')}</dt><dd>{dd.turnDegS}°/s · {L('kayma', 'slip')} {num(dd.turnSlip, 2)}</dd>
              <dt>{L('Hızlanma süresi (τ)', 'Response time (τ)')}</dt><dd>{num(dd.tauS * 1000)} ms</dd>
              <dt>{L('Motor yükü', 'Motor load')}</dt><dd>%{num(Math.min(999, dd.loadRatio * 100))}</dd>
              <dt>{L('Gerilim', 'Voltage')}</dt><dd>{num(dd.voltage, 1)} V</dd>
              <dt>{L('Akım (tipik / tepe)', 'Current (typ / peak)')}</dt><dd>{dd.currentMA} / {dd.peakMA} mA{dd.battery?.battery ? ` ≤ ${dd.battery.battery.maxMA}` : ''}</dd>
              <dt>{L('Pil süresi', 'Battery life')}</dt><dd>~{dd.runtimeMin} {L('dk', 'min')}</dd>
              <dt>{L('Mikro Kart portları', 'Micro Card ports')}</dt><dd>{L('motor', 'motor')} {dd.motorPortsUsed}/4 · {L('sensör', 'sensor')} {dd.sensorPortsUsed}/4</dd>
            </dl>
          ) : (
            <ul className="rt-stars" data-testid="rt-stars">
              {[
                [L('Hız', 'Speed'), stars(dd.speedCmS, 0, 60)],
                [L('Dönüş', 'Turning'), stars(dd.turnDegS, 0, 500)],
                [L('Denge', 'Balance'), stars(dd.tipAngleDeg, 0, 45)],
                [L('Pil', 'Battery'), stars(dd.runtimeMin, 0, 300)],
                [L('Hafiflik', 'Lightness'), stars(900 - dd.massG, 0, 700)],
              ].map(([k, v]) => <li key={k as string}><span>{k}</span><span className="rt-star" aria-label={`${v}/5`}>{'★'.repeat(v as number)}<i>{'★'.repeat(5 - (v as number))}</i></span></li>)}
              <li><span>{L('Ağırlık', 'Weight')}</span><b>{dd.massG} g</b></li>
            </ul>
          )}
          <h3>{errors.length ? L('Düzeltilmesi gerekenler', 'Needs fixing') : warns.length ? L('Dikkat', 'Heads-up') : L('Hazır!', 'Ready!')}</h3>
          <ul className="rt-issues" data-testid="rt-issues">
            {dd.issues.map((i) => <li key={i.code + (i.partId ?? '')} className={i.level === 'hata' ? 'err' : 'warn'} onClick={() => i.partId && setSelected(i.partId)}>{en ? i.en : i.text}</li>)}
            {!dd.issues.length && <li className="ok">{L('Robotun çalışmaya hazır. Aşağıdan bir görevde dene.', 'Your robot is ready. Try it in a mission below.')}</li>}
          </ul>
          <div className="rt-files">
            <button type="button" className="mk-btn small" onClick={saveNamed} data-testid="rt-save">{L('Kaydet', 'Save')}</button>
            <button type="button" className="mk-btn small" onClick={download} data-testid="rt-export">{L('Dışa aktar (JSON)', 'Export (JSON)')}</button>
            <button type="button" className="mk-btn small" onClick={() => fileRef.current?.click()}>{L('İçe aktar', 'Import')}</button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} data-testid="rt-import" />
          </div>
          {!!saved.length && (
            <details className="rt-saved">
              <summary>{L('Kayıtlı tasarımlarım', 'My saved designs')} ({saved.length})</summary>
              <ul>{saved.map((s) => (
                <li key={s.name}><button type="button" className="rt-link" onClick={() => { const r = importDesign(s.design); if (r.ok) { setDesign(r.design); setSelected(null) } }}>{s.name}</button>
                  <button type="button" className="rt-x" aria-label={L(`${s.name} sil`, `Delete ${s.name}`)} onClick={() => { const l = saved.filter((x) => x.name !== s.name); setSaved(l); save(LIST_KEY, l) }}>×</button></li>
              ))}</ul>
              <p className="muted">{L('Tasarımlar bu tarayıcıda saklanır; başka cihaza taşımak için dışa aktar.', 'Designs are kept in this browser; export to move them to another device.')}</p>
            </details>
          )}
        </aside>
      </div>

      <section className="rt-try" aria-labelledby="rt-try-h">
        <h2 id="rt-try-h">{L('Robotunu dene', 'Try your robot')}</h2>
        <p className="muted">{L('Robot Atölyesi görevlerindeki blok programları tasarladığın robotla da çalışır. Robotun hızı, dönüşü, sensörlerin yeri ve menzili tasarımından gelir.', 'The block programs from the Robot Workshop missions also run on your robot. Speed, turning, sensor positions and range come from your design.')}</p>
        <div className="rt-targets">
          <label>{L('Nerede?', 'Where?')} <select value={targetKey} onChange={(e) => {
            const v = e.target.value
            setTarget(v === 'serbest' ? { kind: 'free' } : v.startsWith('mission:') ? { kind: 'mission', id: v.slice(8) } : { kind: 'challenge', id: v.slice(10) })
          }} data-testid="rt-target">
            <option value="serbest">{L('Serbest arena', 'Free arena')}</option>
            <optgroup label={L('Tasarım yarışmaları', 'Design challenges')}>{DESIGN_CHALLENGES.map((c) => <option key={c.id} value={`challenge:${c.id}`}>{en ? c.en.title : c.title}</option>)}</optgroup>
            <optgroup label={L('Görevler', 'Missions')}>{ROBOT_MISSIONS.map((m) => <option key={m.id} value={`mission:${m.id}`}>{en ? m.en.title : m.title}</option>)}</optgroup>
          </select></label>
          <button type="button" className="mk-btn mk-btn-primary" disabled={!dd.ok} onClick={() => setTesting(true)} data-testid="rt-test">{testing ? L('Benzetim açık', 'Simulator open') : L('Benzetimde dene', 'Open simulator')}</button>
          {!dd.ok && <span className="sk-err">{L('Önce kırmızı hataları düzelt.', 'Fix the red errors first.')}</span>}
          <Link href="/robot-atolyesi" className="rt-link">{L('Robot Atölyesi görevleri', 'Robot Workshop missions')}</Link>
        </div>
        {challenge && <DesignChallengePanel key={challenge.id} id={challenge.id} design={design} project={current} ok={dd.ok} en={en} />}
        {testing && dd.ok && (
          <MikroEditor key={`${targetKey}|${sig}`} storageKey={`ask:tasarim:ed:${targetKey}:v1`} activity={mission ?? undefined} robot={robot} initialProject={mission ? undefined : freeStart} onProjectChange={setCurrent} />
        )}
      </section>
    </div>
  )
}

function partNumbers(t: PartType, en: boolean): string {
  const s = PARTS[t]
  const f = (v: number, d = 0) => (en ? v.toFixed(d) : v.toFixed(d).replace('.', ','))
  const bits = [`${s.massG} g`]
  if (s.wheel) bits.push(`⌀${f(s.wheel.d * 1000)} mm`, `${en ? 'slip' : 'kayma'} ${f(s.wheel.slip, 2)}`)
  if (s.motor) bits.push(`${s.motor.rpmDeg}°/s`, `${f(s.motor.stallNm * 100)} N·cm`, `${s.peakMA} mA`)
  if (s.sensor && s.sensor.rangeCm > 2) bits.push(`${s.sensor.rangeCm} cm`, `${s.sensor.fovDeg}°`)
  if (s.battery) bits.push(`${f(s.battery.v, 1)} V`, `${s.battery.mAh} mAh`, `≤${s.battery.maxMA} mA`)
  if (s.mA && !s.motor) bits.push(`${s.mA} mA`)
  return bits.join(' · ')
}

/** Üstten ızgara: her hücre bir düğme (klavye ve dokunmatikle de yerleştirilir). Ön yön sağda. */
function TopGrid({ design, selected, onCell, canDrop, en }: { design: RobotDesign; selected: string | null; onCell(c: number, r: number): void; canDrop(c: number, r: number): boolean; en: boolean }) {
  const ch = CHASSIS[design.chassis]
  const card = cardCells(ch)
  return (
    <div className="rt-grid-wrap">
      <span className="rt-front" aria-hidden="true">{en ? 'front →' : 'ön →'}</span>
      <div className="rt-grid" role="grid" aria-label={en ? 'Chassis grid seen from above' : 'Şasi ızgarası, üstten'} style={{ gridTemplateColumns: `repeat(${ch.cols}, 1fr)` }} data-testid="rt-grid">
        {Array.from({ length: ch.rows }, (_, r) => Array.from({ length: ch.cols }, (_, c) => {
          const p = design.parts.find((q) => q.c === c && q.r === r)
          const isCard = card.some(([a, b]) => a === c && b === r)
          const s = p ? PARTS[p.type] : null
          return (
            <button key={`${c},${r}`} type="button" role="gridcell" className={`rt-cell${isCard ? ' card' : ''}${p && p.id === selected ? ' sel' : ''}${!p && !isCard && canDrop(c, r) ? ' can' : ''}`}
              style={s ? { background: s.color } : undefined} onClick={() => onCell(c, r)} disabled={isCard} data-cell={`${c},${r}`}
              aria-label={isCard ? 'Mikro Kart' : s ? `${en ? s.en : s.title} (${c + 1}, ${r + 1})` : `${en ? 'empty' : 'boş'} (${c + 1}, ${r + 1})`} title={s ? (en ? s.en : s.title) : undefined}>
              {s && <span className="rt-glyph" style={{ transform: `rotate(${-(p!.rot ?? 0) * 90}deg)` }}>{GLYPH[s.group]}</span>}
            </button>
          )
        }))}
      </div>
    </div>
  )
}
const GLYPH: Record<string, string> = { teker: '●', motor: '⚙', sensor: '➤', eyleyici: '⊐', pil: '▮' }

function DesignChallengePanel({ id, design, project: p, ok, en }: { id: string; design: RobotDesign; project: MikroProject | null; ok: boolean; en: boolean }) {
  const ch = DESIGN_CHALLENGES.find((c) => c.id === id)!
  const [res, setRes] = useState<DesignResult | null>(null)
  const [best, setBest] = useState<number | null>(null)
  const [signed, setSigned] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  useEffect(() => {
    fetch('/api/tasarim', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) { setSigned(!!j.signedIn); setBest(j.best?.[id] ?? null) } }).catch(() => {})
  }, [id])
  const calc = () => { if (p) setRes(runDesignChallenge(ch, design, p)) }
  const send = async () => {
    if (!p) return
    setBusy(true); setNote('')
    try {
      const r = await fetch('/api/tasarim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ challengeId: id, design: JSON.parse(exportDesign(design)), project: p }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setNote(j.error ?? (en ? 'Could not send' : 'Gönderilemedi')); return }
      setRes(j)
      if (j.saved) { setBest(j.best); setNote(en ? `Server score: ${j.score} (best ${j.best})` : `Sunucu puanı: ${j.score} (en iyi ${j.best})`) }
      else setNote(en ? `Server score: ${j.score}. Sign in to save it.` : `Sunucu puanı: ${j.score}. Kaydetmek için giriş yap.`)
    } catch { setNote(en ? 'No connection' : 'Bağlantı yok') } finally { setBusy(false) }
  }
  return (
    <section className="sk-panel" data-testid="rt-challenge">
      <div className="sk-head">
        <div>
          <p className="sk-eyebrow">{en ? `Design challenge · ${ch.timeLimitS} s` : `Tasarım yarışması · ${ch.timeLimitS} sn`}</p>
          <h2>{en ? ch.en.title : ch.title}</h2>
          <p className="sk-sum">{en ? ch.en.summary : ch.summary}</p>
        </div>
        {best != null && <p className="sk-best">{en ? 'Your best' : 'En iyin'} <b>{best}</b></p>}
      </div>
      <details className="sk-rules" open>
        <summary>{en ? 'Rules' : 'Kurallar'}</summary>
        <ul>{(en ? ch.en.rules : ch.rules).map((r) => <li key={r}>{r}</li>)}</ul>
        <p>{en ? 'The score is computed again on the server from your design and program.' : 'Puan, tasarımından ve programından sunucuda yeniden hesaplanır.'}</p>
      </details>
      <div className="sk-actions">
        <button type="button" className="mk-btn" disabled={!p || !ok} onClick={calc} data-testid="rt-calc">{en ? 'Calculate score' : 'Puanı hesapla'}</button>
        <button type="button" className="mk-btn sk-send" disabled={!p || !ok || busy} onClick={send} data-testid="rt-send">{busy ? '…' : en ? 'Send to server' : 'Sunucuya gönder'}</button>
        {signed === false && <span className="sk-note"><Link href="/giris?next=/robot-atolyesi/tasarla">{en ? 'Sign in' : 'Giriş yap'}</Link>{en ? ' to save your scores.' : ', puanların kaydedilsin.'}</span>}
        {!p && <span className="sk-note">{en ? 'Open the simulator and write a program first.' : 'Önce benzetimi açıp program yaz.'}</span>}
      </div>
      {note && <p role="status" className="sk-ok">{note}</p>}
      {res && (
        <table className="sk-score" data-testid="rt-result"><tbody>
          {res.parts.map((x) => <tr key={x.label}><td>{en && x.en ? x.en : x.label}</td><td>{x.points > 0 ? `+${x.points}` : x.points}</td></tr>)}
          <tr className="sk-total"><td>{en ? 'Total' : 'Toplam'}</td><td>{res.score}</td></tr>
        </tbody></table>
      )}
      {res?.error && <p className="sk-err">{res.error}</p>}
    </section>
  )
}

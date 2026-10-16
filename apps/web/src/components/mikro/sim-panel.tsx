'use client'
// Sanal kart denetimleri: hareket, pusula, sensörler, pinler, radyo, hoparlör, konsol.
import { useRef, useState } from 'react'
import type { Simulation } from '@/lib/mikro/sim'
import type { GestureName, PinName } from '@/lib/mikro/types'
import { PINS } from '@/lib/mikro/types'

export interface SimPanelProps {
  sim: Simulation
  tick: number
  bump(): void
  twoCards: boolean
  onToggleTwo(): void
  muted: boolean
  onMute(): void
  /** Robot Atölyesi: ikinci kart, radyo ve kart sensörü (ivme, pusula, pin) denetimleri gösterilmez. */
  noRadio?: boolean
}

const GESTURES: [GestureName, string][] = [
  ['shake', 'Salla'], ['tiltLeft', 'Sola yatır'], ['tiltRight', 'Sağa yatır'], ['tiltForward', 'Öne yatır'],
  ['tiltBack', 'Arkaya yatır'], ['faceUp', 'Yüzü yukarı'], ['faceDown', 'Yüzü aşağı'], ['freeFall', 'Serbest düşüş'],
]
const CARDINAL = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB']
const cardinal = (deg: number) => CARDINAL[Math.round(deg / 45) % 8]

function Slider({ label, value, min, max, onChange, unit, testId, step = 1 }: { label: string; value: number; min: number; max: number; onChange(v: number): void; unit?: string; testId: string; step?: number }) {
  return (
    <label className="mk-slider">
      <span className="mk-slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} data-testid={testId} aria-label={label} />
      <output className="mk-slider-val">{value}{unit ?? ''}</output>
    </label>
  )
}

function CompassDial({ deg, onChange }: { deg: number; onChange(d: number): void }) {
  const ref = useRef<SVGSVGElement>(null)
  const drag = useRef(false)
  const setFrom = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
    onChange(((Math.round((Math.atan2(dx, -dy) * 180) / Math.PI) % 360) + 360) % 360)
  }
  return (
    <svg ref={ref} viewBox="-60 -60 120 120" className="mk-dial" role="slider" aria-label="Pusula yönü" aria-valuemin={0} aria-valuemax={359} aria-valuenow={deg} tabIndex={0} data-testid="mikro-compass-dial"
      onPointerDown={(e) => { drag.current = true; (e.currentTarget as Element).setPointerCapture(e.pointerId); setFrom(e) }}
      onPointerMove={(e) => { if (drag.current) setFrom(e) }}
      onPointerUp={() => { drag.current = false }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange((deg + 5) % 360); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange((deg + 355) % 360) }}>
      <circle r="52" className="mk-dial-face" />
      {[0, 90, 180, 270].map((a, i) => <text key={a} x={Math.sin((a * Math.PI) / 180) * 40} y={-Math.cos((a * Math.PI) / 180) * 40 + 4} textAnchor="middle" className="mk-dial-t">{['K', 'D', 'G', 'B'][i]}</text>)}
      <g transform={`rotate(${deg})`}>
        <polygon points="0,-34 6,0 -6,0" className="mk-needle-n" />
        <polygon points="0,34 6,0 -6,0" className="mk-needle-s" />
        <circle r="4" className="mk-needle-c" />
      </g>
    </svg>
  )
}

function ServoDial({ angle }: { angle: number }) {
  return (
    <svg viewBox="-30 -30 60 36" className="mk-servo" aria-hidden="true">
      <path d="M -24 0 A 24 24 0 0 1 24 0" className="mk-servo-arc" />
      <g transform={`rotate(${angle - 90})`}><line x1="0" y1="0" x2="0" y2="-22" className="mk-servo-hand" /></g>
      <circle r="3" className="mk-needle-c" />
    </svg>
  )
}

export function SimPanel({ sim, tick, bump, twoCards, onToggleTwo, muted, onMute, noRadio }: SimPanelProps) {
  void tick
  const [sel, setSel] = useState(0)
  const [msgKind, setMsgKind] = useState<'num' | 'str' | 'kv'>('num')
  const [msgText, setMsgText] = useState('1')
  const [msgName, setMsgName] = useState('ad')
  const idx = Math.min(sel, sim.cards.length - 1)
  const card = sim.cards[idx]
  const d = card.device
  const acc = d.accelNow()
  const two = sim.cards.length > 1

  const sendMsg = () => {
    if (msgKind === 'num') sim.injectRadio(idx, { kind: 'num', num: Number(msgText) || 0 })
    else if (msgKind === 'str') sim.injectRadio(idx, { kind: 'str', str: msgText.slice(0, 32) })
    else sim.injectRadio(idx, { kind: 'kv', name: msgName.slice(0, 12), value: Number(msgText) || 0 })
    bump()
  }

  return (
    <div className="mk-panel" data-testid="mikro-panel">
      {two && (
        <div className="mk-seg" role="tablist" aria-label="Denetlenen kart">
          {sim.cards.map((_, i) => <button key={i} role="tab" aria-selected={idx === i} className={idx === i ? 'on' : ''} onClick={() => setSel(i)} data-testid={`mikro-sel-${i}`}>Kart {i + 1}</button>)}
        </div>
      )}

      {!noRadio && <>
      <details open>
        <summary>Hareket (ivmeölçer)</summary>
        <div className="mk-grid-btns">
          {GESTURES.map(([g, label]) => <button key={g} className="mk-chip" onClick={() => { d.perform(g); bump() }} data-testid={`mikro-gesture-${g}`} aria-pressed={d.isGesture(g)}>{label}</button>)}
        </div>
        <Slider label="x (yan)" value={acc.x} min={-1024} max={1024} step={16} onChange={(v) => { d.setAccel(v, d.accel.y, d.accel.z); bump() }} testId="mikro-acc-x" />
        <Slider label="y (ön-arka)" value={acc.y} min={-1024} max={1024} step={16} onChange={(v) => { d.setAccel(d.accel.x, v, d.accel.z); bump() }} testId="mikro-acc-y" />
        <Slider label="z (yüz)" value={acc.z} min={-1024} max={1024} step={16} onChange={(v) => { d.setAccel(d.accel.x, d.accel.y, v); bump() }} testId="mikro-acc-z" />
        <p className="mk-readout">güç <b>{d.strength()}</b> · boy eğimi <b>{d.pitch()}°</b> · yan eğim <b>{d.roll()}°</b></p>
      </details>

      <details open>
        <summary>Pusula ve sensörler</summary>
        <div className="mk-compass-row">
          <CompassDial deg={d.compass} onChange={(v) => { d.setCompass(v); bump() }} />
          <div className="mk-compass-read">
            <b data-testid="mikro-compass-val">{d.compass}°</b>
            <span>{cardinal(d.compass)}</span>
            <button className="mk-chip" onClick={() => { d.setCompass(0); bump() }}>Kuzeye çevir</button>
          </div>
        </div>
        <Slider label="Pusula" value={d.compass} min={0} max={359} unit="°" onChange={(v) => { d.setCompass(v); bump() }} testId="mikro-compass" />
        <Slider label="Sıcaklık" value={d.temperature} min={-5} max={50} unit=" °C" onChange={(v) => { d.setSensor('temperature', v); bump() }} testId="mikro-temp" />
        <Slider label="Işık" value={d.light} min={0} max={255} onChange={(v) => { d.setSensor('light', v); bump() }} testId="mikro-light" />
        <Slider label="Ses" value={d.soundLevel} min={0} max={255} onChange={(v) => { d.setSensor('sound', v); bump() }} testId="mikro-sound" />
      </details>

      <details>
        <summary>Pinler</summary>
        {PINS.map((p: PinName) => {
          const s = d.pins[p]
          return (
            <div key={p} className="mk-pinrow" data-testid={`mikro-pinrow-${p}`}>
              <div className="mk-pinhead">
                <b>{p}</b>
                <button className="mk-chip" aria-pressed={s.touch} onClick={() => { d.setPinTouch(p, !s.touch); bump() }} data-testid={`mikro-pintouch-${p}`}>{s.touch ? 'Dokunuluyor' : 'Dokun'}</button>
                <span className="mk-pinout" data-testid={`mikro-pinout-${p}`}>
                  {s.out ? (s.out.mode === 'servo' ? <><ServoDial angle={s.out.value} /> servo {s.out.value}°</> : s.out.mode === 'digital' ? <><i className={`mk-dot${s.out.value ? ' on' : ''}`} /> dijital {s.out.value}</> : <><i className="mk-bar"><i style={{ width: `${(s.out.value / 1023) * 100}%` }} /></i> analog {s.out.value}</>) : <span className="muted">çıkış yok</span>}
                </span>
              </div>
              <Slider label="Giriş" value={s.input} min={0} max={1023} step={1} onChange={(v) => { d.setPinInput(p, v); bump() }} testId={`mikro-pinin-${p}`} />
            </div>
          )
        })}
      </details>
      </>}

      {!noRadio && <details open={twoCards}>
        <summary>Radyo</summary>
        <div className="mk-radio-top">
          <button className="mk-chip strong" onClick={onToggleTwo} data-testid="mikro-toggle-two" aria-pressed={twoCards}>{twoCards ? 'İkinci kartı çıkar' : 'İkinci kart ekle'}</button>
          <span className="mk-readout">Kart 1 grubu: <b data-testid="mikro-group-0">{sim.cards[0].device.radioGroup}</b>{two && <> · Kart 2 grubu: <b data-testid="mikro-group-1">{sim.cards[1].device.radioGroup}</b></>}</span>
        </div>
        {two && (
          <label className="mk-inline">Kart 2 grubu
            <select value={sim.cards[1].device.radioLocked ? String(sim.cards[1].device.radioGroup) : 'auto'} data-testid="mikro-group-select"
              onChange={(e) => { const dv = sim.cards[1].device; if (e.target.value === 'auto') dv.radioLocked = false; else { dv.radioLocked = true; dv.radioGroup = Number(e.target.value) } bump() }}>
              <option value="auto">Programdan</option>
              {Array.from({ length: 10 }, (_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
        )}
        <div className="mk-radio-send">
          <select value={msgKind} onChange={(e) => { const k = e.target.value as 'num' | 'str' | 'kv'; setMsgKind(k); setMsgText(k === 'str' ? 'merhaba' : '1') }} aria-label="Mesaj türü" data-testid="mikro-msg-kind">
            <option value="num">sayı</option><option value="str">yazı</option><option value="kv">ad = değer</option>
          </select>
          {msgKind === 'kv' && <input value={msgName} onChange={(e) => setMsgName(e.target.value)} aria-label="Ad" size={6} maxLength={12} />}
          <input value={msgText} onChange={(e) => setMsgText(e.target.value)} aria-label="Mesaj" size={8} maxLength={32} data-testid="mikro-msg-text" />
          <button className="mk-chip" onClick={sendMsg} data-testid="mikro-msg-send">Kart {idx + 1}&apos;e gönder</button>
        </div>
        <p className="mk-readout">Son alınan: <b data-testid="mikro-last-radio">{d.lastRadio ? (d.lastRadio.kind === 'num' ? d.lastRadio.num : d.lastRadio.kind === 'str' ? `"${d.lastRadio.str}"` : `${d.lastRadio.name} = ${d.lastRadio.value}`) : 'yok'}</b></p>
      </details>}

      <details>
        <summary>Hoparlör</summary>
        <div className="mk-speaker">
          <button className="mk-chip" onClick={onMute} aria-pressed={muted} data-testid="mikro-mute">{muted ? 'Ses kapalı' : 'Ses açık'}</button>
          <span className="mk-readout">çalan: <b data-testid="mikro-tone">{d.toneNow() ? `${d.toneNow()} Hz` : 'sessiz'}</b> · seviye <b>{d.volume}</b> · tempo <b>{d.tempo}</b></span>
        </div>
      </details>

      <details open>
        <summary>Konsol</summary>
        <pre className="mk-console" data-testid="mikro-console" aria-live="polite">{d.serial.length ? d.serial.slice(-30).join('\n') : 'Henüz bir şey yazılmadı.'}</pre>
        {d.serial.length > 0 && <button className="mk-chip" onClick={() => { d.serial.length = 0; bump() }}>Temizle</button>}
      </details>
    </div>
  )
}

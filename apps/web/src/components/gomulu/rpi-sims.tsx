'use client'
// Raspberry Pi dersinin tarayıcı simülasyonları. Hesap lib/rpi altındaki saf fonksiyonlarda (testli); burada yalnız
// girdi toplama, çizim (SVG/tuval) ve canlandırma var.
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { commandToPins, newRobot3D, pinsToWheels, seeBall, type MotorPins } from '@/lib/rpi/robot3d'
import type { RpiLive } from './scene3d-rpi'
import { BOARDS, NEEDS, recommend, scoreOf, type Board, type Need } from '@/lib/rpi/board'
import { HEADER, checkWiring, ledCurrent, newMem, programSource, stepProgram, type Device, type Program } from '@/lib/rpi/gpio'
import { arcade, integrate, l298n, motorStep, piStep, quadState, quadStep, wheelSpeeds, type Pose } from '@/lib/rpi/motion'
import { CMDS, cmdToWheels, handle, newRobot, watchdog, type Cmd, type Req } from '@/lib/rpi/net'
import { NODES, graph, topicList, type NodeId } from '@/lib/rpi/ros'
import { I2C_DEVICES, adc10, codeToVolts, i2cBus, makeW1Slave, mcp3008Decode, mcp3008Rx, mcp3008Tx, parseW1Slave, type I2cId } from '@/lib/rpi/sensors'
import type { RpiSimId } from '@/lib/rpi/sims'
import { SERVICE_UNIT, TERM_TASKS, exec, getNode, i2cdetectLines, initialState, prompt, saveFile } from '@/lib/rpi/terminal'
import { PRESETS, centroid, inRange, openMask, steer, synthFrame, type HsvRange } from '@/lib/rpi/vision'
import { Badge, Body, Btn, Check, Readout, Select, Slider, Tabs, nf, tx, wavePath, type Lang } from './ui'

type Cfg = Record<string, string>
const hex2 = (n: number) => `0x${n.toString(16).padStart(2, '0')}`

// ---------- 1. Kart seçici ----------
function BoardSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [needs, setNeeds] = useState<Need[]>(['vision', 'network'])
  const ranked = recommend(needs)
  const best = ranked[0]
  const max = Math.max(1, ...ranked.map((r) => Math.abs(r.score)))
  return (
    <Body
      stage={
        <div className="gm-bars" data-testid="rpi-board-result">
          {ranked.map((r) => (
            <div key={r.board} className={`gm-bar${r.board === best.board && needs.length ? ' best' : ''}`}>
              <span className="gm-bar-l"><b>{BOARDS[r.board].name}</b><small>{BOARDS[r.board][lang]}</small></span>
              <span className="gm-bar-track"><span className={r.score >= 0 ? 'pos' : 'neg'} style={{ width: `${(Math.abs(r.score) / max) * 100}%` }} /></span>
              <output>{r.score > 0 ? `+${r.score}` : r.score}</output>
            </div>
          ))}
          {needs.length > 0 && (
            <Readout>
              {t('Öneri: ', 'Recommendation: ')}<b>{BOARDS[best.board].name}</b>{'\n'}
              {needs.map((n) => `${scoreOf(n, best.board) >= 0 ? '+' : ''}${scoreOf(n, best.board)}  ${NEEDS[n][lang]}`).join('\n')}
            </Readout>
          )}
        </div>
      }
      side={
        <>
          <p className="gm-hint">{t('Projenin gereksinimleri:', 'Your project needs:')}</p>
          {(Object.keys(NEEDS) as Need[]).map((n) => (
            <Check key={n} label={NEEDS[n][lang]} checked={needs.includes(n)} onChange={(v) => setNeeds((s) => (v ? [...s, n] : s.filter((x) => x !== n)))} />
          ))}
        </>
      }
    />
  )
}

// ---------- 2. Terminal ----------
type TermLine = { text: string; kind: 'in' | 'out' }
function TerminalSim({ lang, cfg }: { lang: Lang; cfg: Cfg }) {
  const t = tx(lang)
  const taskSet = (cfg.tasks as keyof typeof TERM_TASKS) ?? 'linux'
  const st = useRef(initialState())
  const [lines, setLines] = useState<TermLine[]>(() => [{ text: t('Raspberry Pi OS benzetimi. "help" yaz.', 'Raspberry Pi OS simulation. Type "help".'), kind: 'out' }])
  const [input, setInput] = useState('')
  const [hist, setHist] = useState(-1)
  const [edit, setEdit] = useState<{ path: string; sudo: boolean; ro: boolean; text: string } | null>(null)
  const [, force] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight }) }, [lines])

  const run = (line: string) => {
    const p = prompt(st.current)
    const r = exec(st.current, line, lang)
    if (r.clear) { setLines([]); return }
    setLines((ls) => [...ls, { text: `${p} ${line}`, kind: 'in' }, ...r.out.map((text) => ({ text, kind: 'out' as const }))])
    if (r.edit) {
      const ro = r.edit.startsWith('ro:'), sudo = r.edit.startsWith('sudo:')
      const path = r.edit.replace(/^(ro|sudo):/, '')
      const n = getNode(st.current, path)
      const text = n?.type === 'file' ? n.content : path.endsWith('robot.service') ? SERVICE_UNIT : ''
      setEdit({ path, sudo, ro, text })
    }
    force((x) => x + 1)
  }
  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const h = st.current.history
    if (e.key === 'Enter') { run(input); setInput(''); setHist(-1) }
    else if (e.key === 'ArrowUp' && h.length) { e.preventDefault(); const i = hist < 0 ? h.length - 1 : Math.max(0, hist - 1); setHist(i); setInput(h[i]) }
    else if (e.key === 'ArrowDown' && hist >= 0) { e.preventDefault(); const i = hist + 1; if (i >= h.length) { setHist(-1); setInput('') } else { setHist(i); setInput(h[i]) } }
  }
  const save = () => {
    if (!edit) return
    const err = edit.ro ? 'Permission denied' : saveFile(st.current, edit.path, edit.text, edit.sudo)
    setLines((ls) => [...ls, { text: err ? `[ ${t('Kaydedilemedi', 'Could not save')}: ${err} ]` : `[ ${t('Yazıldı', 'Wrote')} ${edit.text.split('\n').length} ${t('satır', 'lines')}: ${edit.path} ]`, kind: 'out' }])
    if (!err) setEdit(null)
    force((x) => x + 1)
  }
  const tasks = TERM_TASKS[taskSet] ?? TERM_TASKS.linux
  const done = tasks.filter((k) => k.done(st.current)).length
  const quick = taskSet === 'systemd'
    ? ['sudo nano /etc/systemd/system/robot.service', 'sudo systemctl daemon-reload', 'sudo systemctl enable robot', 'sudo systemctl start robot', 'systemctl status robot', 'journalctl -u robot']
    : taskSet === 'python' ? ['python3 --version', 'python3 blink.py', 'nano blink.py', 'nano hello.py', 'python3 hello.py'] : ['ls -l', 'cd robot', 'cat notes.txt', 'mkdir -p robot/logs', 'chmod +x start.sh', 'sudo apt install i2c-tools']
  return (
    <Body
      stage={
        <div className="gm-term" data-testid="rpi-terminal">
          {edit ? (
            <div className="gm-nano">
              <div className="gm-nano-bar">GNU nano 7.2 &nbsp; {edit.path}{edit.ro ? t(' (salt okunur)', ' (read-only)') : ''}</div>
              <textarea value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} spellCheck={false} aria-label="nano" rows={14}
                onKeyDown={(e) => { if (e.ctrlKey && (e.key === 'o' || e.key === 's')) { e.preventDefault(); save() } if (e.ctrlKey && e.key === 'x') { e.preventDefault(); setEdit(null) } }} />
              <div className="gm-nano-bar"><button type="button" onClick={save}>^O {t('Kaydet', 'Write Out')}</button><button type="button" onClick={() => setEdit(null)}>^X {t('Çık', 'Exit')}</button></div>
            </div>
          ) : (
            <div className="gm-term-out" ref={scroller} onClick={() => scroller.current?.parentElement?.querySelector('input')?.focus()}>
              {lines.map((l, i) => <div key={i} className={l.kind === 'in' ? 'in' : undefined}>{l.text || ' '}</div>)}
              <label className="gm-term-in"><span>{prompt(st.current)}</span><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label={t('Komut', 'Command')} /></label>
            </div>
          )}
        </div>
      }
      side={
        <>
          <p className="gm-hint"><b>{t('Görevler', 'Tasks')}</b> · {done}/{tasks.length}</p>
          <ul className="gm-tasks">{tasks.map((k) => <li key={k.id} className={k.done(st.current) ? 'ok' : undefined}>{k[lang]}</li>)}</ul>
          <p className="gm-hint">{t('Hızlı komutlar (dokun, Enter\'a bas):', 'Quick commands (tap, press Enter):')}</p>
          <div className="row">{quick.map((q) => <button key={q} type="button" className="gm-chip" onClick={() => setInput(q)}>{q}</button>)}</div>
          <Btn ghost onClick={() => { st.current = initialState(); setLines([]); setEdit(null); force((x) => x + 1) }}>{t('Sıfırla', 'Reset')}</Btn>
        </>
      }
    />
  )
}

// ---------- 3. GPIO ----------
const DEVICES: Device[] = ['led', 'button', 'buzzer', 'servo']
const DEV_TEXT: Record<Device, { tr: string; en: string }> = { led: { tr: 'LED (220 Ω)', en: 'LED (220 Ω)' }, button: { tr: 'Buton', en: 'Button' }, buzzer: { tr: 'Aktif buzzer', en: 'Active buzzer' }, servo: { tr: 'Servo (SG90)', en: 'Servo (SG90)' } }
const PROGRAMS: Array<[Program, { tr: string; en: string }]> = [['blink', { tr: 'Yanıp sönme', en: 'Blink' }], ['button-led', { tr: 'Butonla LED', en: 'Button LED' }], ['alarm', { tr: 'Alarm', en: 'Alarm' }], ['pwm-led', { tr: 'PWM nefes', en: 'PWM breathing' }], ['servo-sweep', { tr: 'Servo tarama', en: 'Servo sweep' }]]
const PIN_COLOR: Record<string, string> = { '3v3': 'var(--gold)', '5v': 'var(--red)', gnd: 'var(--ink)', gpio: 'var(--sim-a)', id: 'var(--mute)' }

function GpioSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [pins, setPins] = useState<Record<Device, number>>({ led: 11, button: 13, buzzer: 15, servo: 12 })
  const [sel, setSel] = useState<Device>('led')
  const [prog, setProg] = useState<Program>('alarm')
  const [pressed, setPressed] = useState(false)
  const [out, setOut] = useState({ led: 0, buzzer: false, servo: null as number | null })
  const mem = useRef(newMem())
  const press = useRef(false)
  useEffect(() => { press.current = pressed }, [pressed])
  useEffect(() => {
    mem.current = newMem()
    let raf = 0
    const t0 = performance.now()
    const loop = () => { setOut(stepProgram(prog, (performance.now() - t0) / 1000, press.current, mem.current)); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [prog])
  const checks = DEVICES.map((d) => ({ d, c: checkWiring(d, pins[d]) }))
  const ok = (d: Device) => checkWiring(d, pins[d]).severity !== 'error'
  const usedBy = (phys: number) => DEVICES.find((d) => pins[d] === phys)
  const W = 560, H = 360
  return (
    <Body
      stage={
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="sim-canvas gm-svg" role="img" aria-label={t('40 pinli başlık ve devre', '40-pin header and circuit')} data-testid="rpi-gpio-svg">
            <rect x="20" y="10" width="92" height="340" rx="8" fill="var(--sim-grid)" stroke="var(--line)" />
            {HEADER.map((p) => {
              const col = (p.phys - 1) % 2, row = Math.floor((p.phys - 1) / 2)
              const x = 46 + col * 40, y = 26 + row * 16.4
              const dev = usedBy(p.phys)
              return (
                <g key={p.phys} onClick={() => setPins((s) => ({ ...s, [sel]: p.phys }))} style={{ cursor: 'pointer' }}>
                  <title>{`${p.phys}: ${p.kind === 'gpio' ? `GPIO${p.bcm}` : p.kind.toUpperCase()}${p.alt ? ` (${p.alt})` : ''}`}</title>
                  <circle cx={x} cy={y} r={dev ? 7 : 5.5} fill={dev ? 'var(--sim-bg)' : PIN_COLOR[p.kind]} stroke={PIN_COLOR[p.kind]} strokeWidth={dev ? 3 : 1} />
                  <text x={col ? x + 12 : x - 12} y={y + 3.5} fontSize="9" textAnchor={col ? 'start' : 'end'} fill="var(--mute)">{p.kind === 'gpio' ? p.bcm : p.kind === 'gnd' ? 'G' : p.kind === '3v3' ? '3V3' : p.kind === '5v' ? '5V' : 'ID'}</text>
                </g>
              )
            })}
            {DEVICES.map((d, i) => {
              const p = pins[d], col = (p - 1) % 2, row = Math.floor((p - 1) / 2)
              const px = 46 + col * 40, py = 26 + row * 16.4
              const dx = 300, dy = 40 + i * 80
              const sev = checkWiring(d, p).severity
              const stroke = sev === 'error' ? 'var(--red)' : sev === 'warn' ? 'var(--gold)' : 'var(--sim-a)'
              const live = ok(d)
              return (
                <g key={d}>
                  <path d={`M${px},${py} C${180},${py} ${220},${dy} ${dx - 30},${dy}`} fill="none" stroke={stroke} strokeWidth={d === sel ? 3 : 2} strokeDasharray={sev === 'error' ? '6 4' : undefined} />
                  <text x={dx + 150} y={dy + 4} fontSize="12" fill="var(--ink)">{DEV_TEXT[d][lang]}</text>
                  {d === 'led' && <><circle cx={dx} cy={dy} r="16" fill={live && out.led > 0 ? 'var(--red)' : 'var(--sim-grid)'} opacity={live ? 0.25 + 0.75 * out.led : 1} stroke="var(--red)" /><text x={dx + 26} y={dy + 4} fontSize="11" fill="var(--mute)">{live ? `${Math.round(out.led * 100)}%` : '—'}</text></>}
                  {d === 'button' && <g onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)} style={{ cursor: 'pointer' }}><rect x={dx - 18} y={dy - 14} width="36" height="28" rx="6" fill={pressed ? 'var(--sim-a)' : 'var(--sim-grid)'} stroke="var(--ink)" /><text x={dx} y={dy + 4} fontSize="10" textAnchor="middle" fill={pressed ? 'var(--sim-bg)' : 'var(--ink)'}>{t('BAS', 'PRESS')}</text></g>}
                  {d === 'buzzer' && <><circle cx={dx} cy={dy} r="14" fill="var(--ink)" /><text x={dx + 24} y={dy + 4} fontSize="16" fill="var(--gold)">{live && out.buzzer ? '♪ ♫' : ''}</text></>}
                  {d === 'servo' && <><rect x={dx - 20} y={dy - 12} width="40" height="24" rx="4" fill="var(--sky)" opacity=".3" stroke="var(--sky)" /><line x1={dx} y1={dy} x2={dx + 28 * Math.cos(((out.servo ?? 0) - 90) * Math.PI / 180)} y2={dy + 28 * Math.sin(((out.servo ?? 0) - 90) * Math.PI / 180)} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" /><text x={dx + 32} y={dy + 22} fontSize="11" fill="var(--mute)">{live && out.servo !== null ? `${out.servo}°` : '—'}</text></>}
                </g>
              )
            })}
          </svg>
          <pre className="gm-code" data-testid="rpi-gpio-code">{programSource(prog, pins)}</pre>
        </>
      }
      side={
        <>
          <Select label={t('Program', 'Program')} value={prog} options={PROGRAMS.map(([v, l]) => [v, l[lang]])} onChange={setProg} />
          <Select label={t('Bağlanacak cihaz (sonra pine tıkla)', 'Device to wire (then click a pin)')} value={sel} options={DEVICES.map((d) => [d, `${DEV_TEXT[d][lang]} → ${pins[d]}`])} onChange={setSel} />
          <Slider label={t(`${DEV_TEXT[sel][lang]}: fiziksel pin`, `${DEV_TEXT[sel][lang]}: physical pin`)} value={pins[sel]} min={1} max={40} onChange={(v) => setPins((s) => ({ ...s, [sel]: v }))} />
          <Btn onClick={() => setPressed((p) => !p)} pressed={pressed} testId="rpi-gpio-button">{pressed ? t('Butonu bırak', 'Release button') : t('Butona bas', 'Press button')}</Btn>
          <div className="gm-checks">
            {checks.map(({ d, c }) => <p key={d}><Badge kind={c.severity}>{DEV_TEXT[d][lang]}</Badge> {c[lang]}</p>)}
          </div>
          <Readout>{t('LED akımı (V_f 2 V, 220 Ω): ', 'LED current (V_f 2 V, 220 Ω): ')}{nf(lang, 1)(ledCurrent(2, 220))} mA</Readout>
        </>
      }
    />
  )
}

// ---------- 4. Veri yolları ----------
function BusSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [tab, setTab] = useState<'w1' | 'i2c' | 'spi'>('w1')
  const [temp, setTemp] = useState(20.6875)
  const [corrupt, setCorrupt] = useState(false)
  const [devs, setDevs] = useState<Array<{ id: I2cId; alt: boolean }>>([{ id: 'bme280', alt: false }, { id: 'ssd1306', alt: false }])
  const [volts, setVolts] = useState(2.5)
  const [ch, setCh] = useState(0)
  const w1 = makeW1Slave(temp, corrupt)
  const parsed = parseW1Slave(w1)
  const bus = i2cBus(devs)
  const tx3 = mcp3008Tx(ch), code = adc10(volts), rx = mcp3008Rx(code)
  return (
    <Body
      stage={
        <>
          <Tabs label={t('Veri yolu', 'Bus')} value={tab} tabs={[['w1', '1-Wire'], ['i2c', 'I²C'], ['spi', 'SPI']]} onChange={setTab} />
          {tab === 'w1' && (
            <>
              <p className="gm-hint">$ cat /sys/bus/w1/devices/28-0316a2794c5f/w1_slave</p>
              <pre className="gm-code" data-testid="rpi-w1">{w1}</pre>
              <Readout>{parsed.crcOk ? <><Badge kind="ok">CRC YES</Badge> {t('Sıcaklık', 'Temperature')}: {nf(lang, 3)(parsed.tempC!)} °C ({t('ham', 'raw')} {Math.round(temp * 16)} / 16)</> : <><Badge kind="error">CRC NO</Badge> {t('Ölçüm reddedildi: yeniden oku.', 'Reading rejected: read again.')}</>}</Readout>
            </>
          )}
          {tab === 'i2c' && (
            <>
              <p className="gm-hint">$ i2cdetect -y 1</p>
              <pre className="gm-code" data-testid="rpi-i2c">{i2cdetectLines(bus.addrs).join('\n')}</pre>
              <Readout>{bus.conflicts.length ? bus.conflicts.map((c) => <span key={c.addr}><Badge kind="error">{hex2(c.addr)}</Badge> {t('çakışma', 'clash')}: {c.ids.join(' + ')}. {t('Adres pinini değiştir ya da TCA9548A kullan.', 'Change an address pin or use a TCA9548A.')}{'\n'}</span>) : <><Badge kind="ok">OK</Badge> {t('Adres çakışması yok.', 'No address clash.')}</>}</Readout>
            </>
          )}
          {tab === 'spi' && (
            <>
              <svg viewBox="0 0 560 150" className="sim-canvas gm-svg" role="img" aria-label="SPI">
                {[['MOSI', tx3], ['MISO', rx]].map(([name, bytes], r) => (
                  <g key={name as string}>
                    <text x="10" y={40 + r * 60} fontSize="12" fill="var(--ink)">{name as string}</text>
                    {(bytes as number[]).map((b, i) => (
                      <g key={i}>
                        <rect x={70 + i * 160} y={20 + r * 60} width="150" height="32" rx="6" fill="var(--sim-grid)" stroke={r ? 'var(--sky)' : 'var(--sim-a)'} />
                        <text x={145 + i * 160} y={41 + r * 60} fontSize="13" textAnchor="middle" fill="var(--ink)" fontFamily="monospace">{hex2(b)} · {b.toString(2).padStart(8, '0')}</text>
                      </g>
                    ))}
                  </g>
                ))}
              </svg>
              <Readout>{t('Giden', 'Sent')}: [{tx3.map(hex2).join(', ')}] → {t('başla, tek uçlu, kanal', 'start, single-ended, channel')} {ch}{'\n'}{t('Gelen', 'Received')}: [{rx.map(hex2).join(', ')}] → (({hex2(rx[1])} & 0x03) &lt;&lt; 8) | {hex2(rx[2])} = <b>{mcp3008Decode(rx)}</b> → {nf(lang, 3)(codeToVolts(mcp3008Decode(rx)))} V</Readout>
            </>
          )}
        </>
      }
      side={
        <>
          {tab === 'w1' && <><Slider label={t('Gerçek sıcaklık', 'True temperature')} value={temp} min={-20} max={85} step={0.0625} onChange={setTemp} fmt={(v) => `${nf(lang, 2)(v)} °C`} /><Check label={t('CRC bozuk (gürültülü hat)', 'Corrupt CRC (noisy line)')} checked={corrupt} onChange={setCorrupt} /></>}
          {tab === 'i2c' && I2C_DEVICES.map((d) => {
            const on = devs.find((x) => x.id === d.id)
            return (
              <div key={d.id} className="gm-dev">
                <Check label={`${d.name} (${d.addrs.map(hex2).join('/')})`} checked={!!on} onChange={(v) => setDevs((s) => (v ? [...s, { id: d.id, alt: false }] : s.filter((x) => x.id !== d.id)))} />
                {on && d.addrs.length > 1 && <Check label={t('ikinci adres (adres pini 1)', 'second address (address pin 1)')} checked={on.alt} onChange={(v) => setDevs((s) => s.map((x) => (x.id === d.id ? { ...x, alt: v } : x)))} />}
              </div>
            )
          })}
          {tab === 'spi' && <><Slider label={t('Potansiyometre gerilimi', 'Potentiometer voltage')} value={volts} min={0} max={3.3} step={0.01} onChange={setVolts} fmt={(v) => `${nf(lang, 2)(v)} V`} /><Slider label={t('MCP3008 kanalı', 'MCP3008 channel')} value={ch} min={0} max={7} onChange={setCh} /></>}
        </>
      }
    />
  )
}

// ---------- 5. Görüntü ----------
const VW = 80, VH = 60
function VisionSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [bx, setBx] = useState(56)
  const [color, setColor] = useState<keyof typeof PRESETS>('red')
  const [noise, setNoise] = useState(25)
  const [light, setLight] = useState(1)
  const [open, setOpen] = useState(true)
  const [vlo, setVlo] = useState(PRESETS.red.lo[2])
  const cam = useRef<HTMLCanvasElement>(null), msk = useRef<HTMLCanvasElement>(null)
  const ballColor: Record<keyof typeof PRESETS, [number, number, number]> = { red: [215, 35, 35], green: [40, 190, 70], blue: [40, 70, 210], yellow: [230, 200, 40] }
  const res = useMemo(() => {
    const f = synthFrame(VW, VH, [{ x: bx, y: 32, r: 8, color: ballColor[color] }, { x: 14, y: 14, r: 4, color: color === 'red' ? ballColor.blue : ballColor.red }], noise, 7, light)
    const range: HsvRange = { lo: [PRESETS[color].lo[0], PRESETS[color].lo[1], vlo], hi: PRESETS[color].hi }
    const raw = inRange(f, range)
    const mask = open ? openMask(raw, VW, VH) : raw
    const c = centroid(mask, VW)
    return { f, raw, mask, c, s: steer(c, VW, 25, 1), noisePx: raw.reduce((a, b) => a + b, 0) - mask.reduce((a, b) => a + b, 0) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bx, color, noise, light, open, vlo])
  useEffect(() => {
    const draw = (cv: HTMLCanvasElement | null, px: (i: number) => [number, number, number]) => {
      if (!cv) return
      const ctx = cv.getContext('2d')!
      const img = ctx.createImageData(VW, VH)
      for (let i = 0; i < VW * VH; i++) { const [r, g, b] = px(i); img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255 }
      ctx.putImageData(img, 0, 0)
    }
    draw(cam.current, (i) => [res.f.rgb[i * 3], res.f.rgb[i * 3 + 1], res.f.rgb[i * 3 + 2]])
    draw(msk.current, (i) => (res.mask[i] ? [255, 255, 255] : res.raw[i] ? [200, 60, 60] : [20, 20, 20]))
    if (res.c && msk.current) {
      const ctx = msk.current.getContext('2d')!
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(Math.round(res.c.x) - 1, Math.round(res.c.y) - 1, 3, 3)
    }
  }, [res])
  return (
    <Body
      stage={
        <>
          <div className="gm-frames">
            <figure><canvas ref={cam} width={VW} height={VH} className="gm-pix" aria-label={t('Kamera karesi', 'Camera frame')} /><figcaption>{t('Kamera (BGR → HSV)', 'Camera (BGR → HSV)')}</figcaption></figure>
            <figure><canvas ref={msk} width={VW} height={VH} className="gm-pix" aria-label={t('Maske', 'Mask')} /><figcaption>{t('Maske: beyaz = kalan, kırmızı = açmayla silinen', 'Mask: white = kept, red = removed by opening')}</figcaption></figure>
          </div>
          <div className="gm-steer" aria-hidden="true"><span style={{ left: `${50 + res.s.turn * 50}%` }} /></div>
          <Readout live>
            {res.c ? `${t('alan', 'area')} m00 = ${res.c.area} px · cx = ${nf(lang, 1)(res.c.x)} · cy = ${nf(lang, 1)(res.c.y)}\n` : `${t('leke yok', 'no blob')}\n`}
            {t('dönüş', 'turn')} = {res.s.seen ? `${res.s.turn >= 0 ? '+' : ''}${nf(lang, 2)(res.s.turn)} (${res.s.turn > 0.05 ? t('sağa', 'right') : res.s.turn < -0.05 ? t('sola', 'left') : t('düz', 'straight')})` : t('hedef yok: dur', 'no target: stop')}{'\n'}
            {t('açmanın sildiği gürültü', 'noise removed by opening')}: {res.noisePx} px
          </Readout>
        </>
      }
      side={
        <>
          <Select label={t('Hedef rengi', 'Target colour')} value={color} options={[['red', t('kırmızı', 'red')], ['green', t('yeşil', 'green')], ['blue', t('mavi', 'blue')], ['yellow', t('sarı', 'yellow')]]} onChange={(c) => { setColor(c); setVlo(PRESETS[c].lo[2]) }} />
          <Slider label={t('Topun yatay konumu', 'Ball x position')} value={bx} min={8} max={72} onChange={setBx} fmt={(v) => `${v} px`} />
          <Slider label={t('Gürültü', 'Noise')} value={noise} min={0} max={80} onChange={setNoise} />
          <Slider label={t('Işık', 'Light')} value={light} min={0.3} max={1.2} step={0.05} onChange={setLight} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Slider label={t('V alt sınırı', 'V lower bound')} value={vlo} min={0} max={200} onChange={setVlo} />
          <Check label={t('Açma (aşındır + genişlet)', 'Opening (erode + dilate)')} checked={open} onChange={setOpen} />
          <p className="gm-hint">HSV lo [{PRESETS[color].lo[0]}, {PRESETS[color].lo[1]}, {vlo}] hi [{PRESETS[color].hi.join(', ')}]</p>
        </>
      }
    />
  )
}

// ---------- 6. Motor ve enkoder ----------
function MotorSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [in1, setIn1] = useState(true), [in2, setIn2] = useState(false)
  const [en, setEn] = useState(0.6), [load, setLoad] = useState(0)
  const [pi, setPi] = useState(false), [target, setTarget] = useState(90)
  const [view, setView] = useState({ rpm: 0, count: 0, hist: [] as number[], ab: [] as number[], err: 0, mode: 'coast', dir: 0 })
  const ref = useRef({ in1, in2, en, load, pi, target })
  useEffect(() => { ref.current = { in1, in2, en, load, pi, target } }, [in1, in2, en, load, pi, target])
  useEffect(() => {
    const s = { rpm: 0, pos: 0, count: 0, prevAb: quadState(0), hist: [] as number[], ab: [] as number[], pi: { i: 0 }, err: 0, dir: 0 }
    const CPR = 1400, dt = 0.005
    let raf = 0, frame = 0
    const loop = () => {
      const c = ref.current
      let mode = 'coast', volts = 0
      for (let k = 0; k < 4; k++) {
        if (c.pi) {
          const u = piStep(s.pi, c.target, s.rpm, 0.004, 0.03, dt)
          const r = l298n(u >= 0, u < 0, Math.abs(u)); mode = r.mode; volts = r.volts
        } else { const r = l298n(c.in1, c.in2, c.en); mode = r.mode; volts = r.volts }
        s.rpm = motorStep(s.rpm, volts, mode as 'forward', dt, c.load)
        // Enkoder: konum (sayım) gerçek dönüşten; her 1/4 sayım değişiminde bir kenar
        s.pos += (s.rpm / 60) * CPR * dt
        const target = Math.round(s.pos)
        while (s.count !== target) {
          s.count += Math.sign(target - s.count)
          const ab = quadState(s.count)
          const st = quadStep(s.prevAb, ab)
          if (st === 'error') s.err++
          else if (st !== 0) s.dir = st
          s.prevAb = ab
        }
      }
      s.hist.push(s.rpm); if (s.hist.length > 240) s.hist.shift()
      s.ab.push(s.prevAb); if (s.ab.length > 48) s.ab.shift()
      if (++frame % 2 === 0) setView({ rpm: s.rpm, count: s.count, hist: [...s.hist], ab: [...s.ab], err: s.err, mode, dir: s.dir })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  const W = 560, H = 260, maxR = 200
  const y = (r: number) => 110 - (r / maxR) * 95
  const poly = view.hist.map((r, i) => `${40 + (i / 240) * 500},${y(r)}`).join(' ')
  const A = view.ab.map((s) => (s >> 1) & 1), B = view.ab.map((s) => s & 1)
  return (
    <Body
      stage={
        <svg viewBox={`0 0 ${W} ${H}`} className="sim-canvas gm-svg" role="img" aria-label={t('Motor hızı ve enkoder kanalları', 'Motor speed and encoder channels')} data-testid="rpi-motor-svg">
          {[-200, -100, 0, 100, 200].map((r) => <g key={r}><line x1="40" x2="540" y1={y(r)} y2={y(r)} stroke="var(--sim-grid)" /><text x="34" y={y(r) + 4} fontSize="10" textAnchor="end" fill="var(--mute)">{r}</text></g>)}
          {pi && <line x1="40" x2="540" y1={y(target)} y2={y(target)} stroke="var(--gold)" strokeDasharray="5 4" />}
          <polyline points={poly} fill="none" stroke="var(--sim-a)" strokeWidth="2.5" />
          <text x="44" y="14" fontSize="11" fill="var(--mute)">rpm</text>
          <text x="10" y="196" fontSize="11" fill="var(--ink)">A</text><path d={wavePath(A, 40, 500, 184, 200)} fill="none" stroke="var(--sky)" strokeWidth="2" />
          <text x="10" y="236" fontSize="11" fill="var(--ink)">B</text><path d={wavePath(B, 40, 500, 224, 240)} fill="none" stroke="var(--red)" strokeWidth="2" />
        </svg>
      }
      side={
        <>
          <Check label="PI" checked={pi} onChange={setPi} />
          {pi ? <Slider label={t('Hedef hız', 'Target speed')} value={target} min={-160} max={160} step={5} onChange={setTarget} fmt={(v) => `${v} rpm`} /> : (
            <>
              <div className="row"><Check label="IN1" checked={in1} onChange={setIn1} /><Check label="IN2" checked={in2} onChange={setIn2} /></div>
              <Slider label={t('EN (PWM görev oranı)', 'EN (PWM duty)')} value={en} min={0} max={1} step={0.01} onChange={setEn} fmt={(v) => `${Math.round(v * 100)}%`} />
            </>
          )}
          <Slider label={t('Yük', 'Load')} value={load} min={0} max={0.8} step={0.05} onChange={setLoad} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Readout live>
            {t('kip', 'mode')}: {view.mode}{'\n'}{t('hız', 'speed')}: {nf(lang, 0)(view.rpm)} rpm{'\n'}{t('sayım', 'count')}: {view.count}{'\n'}{t('enkoder yönü', 'encoder direction')}: {view.dir > 0 ? t('ileri', 'forward') : view.dir < 0 ? t('geri', 'reverse') : '—'}{'\n'}AB: {(view.ab.at(-1) ?? 0).toString(2).padStart(2, '0')}
          </Readout>
        </>
      }
    />
  )
}

// ---------- 7. Diferansiyel sürüş ----------
const L = 0.15, CPR = 1400, D = 0.065
function RobotSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [diamErr, setDiamErr] = useState(0)
  const [slip, setSlip] = useState(false)
  const [view, setView] = useState({ truth: { x: 0, y: 0, th: 0 } as Pose, odom: { x: 0, y: 0, th: 0 } as Pose, tt: [] as Array<[number, number]>, ot: [] as Array<[number, number]>, ticks: [0, 0] })
  const keys = useRef({ f: 0, r: 0 })
  const cfg = useRef({ diamErr, slip })
  useEffect(() => { cfg.current = { diamErr, slip } }, [diamErr, slip])
  const [reset, setReset] = useState(0)
  useEffect(() => {
    const s = { truth: { x: 0, y: 0, th: 0 } as Pose, odom: { x: 0, y: 0, th: 0 } as Pose, tt: [] as Array<[number, number]>, ot: [] as Array<[number, number]>, ticks: [0, 0], rnd: 1 }
    const rand = () => ((s.rnd = (s.rnd * 16807) % 2147483647) / 2147483647)
    const dt = 1 / 60
    let raf = 0, n = 0
    const loop = () => {
      const { v, w } = arcade(keys.current.f, keys.current.r, 0.35, 2.2)
      const { vl, vr } = wheelSpeeds(v, w, L)
      // Tekerleğin döndüğü yol (enkoder bunu görür) ve zemine aktarılan yol (kayma varsa daha az)
      const wl = vl * dt, wr = vr * dt
      const sl = cfg.current.slip ? 1 - Math.min(0.3, Math.abs(w) * 0.08 * (0.5 + rand())) : 1
      const sr = cfg.current.slip ? 1 - Math.min(0.3, Math.abs(w) * 0.08 * (0.5 + rand())) : 1
      s.truth = integrate(s.truth, wl * sl, wr * sr, L)
      const tl = Math.round((wl / (Math.PI * D)) * CPR * 1000) / 1000, tr = Math.round((wr / (Math.PI * D)) * CPR * 1000) / 1000
      s.ticks[0] += tl; s.ticks[1] += tr
      const k = Math.PI * D * (1 + cfg.current.diamErr / 100) / CPR // yanlış ölçülmüş çap
      s.odom = integrate(s.odom, tl * k, tr * k, L)
      if (++n % 4 === 0) {
        s.tt.push([s.truth.x, s.truth.y]); s.ot.push([s.odom.x, s.odom.y])
        if (s.tt.length > 600) { s.tt.shift(); s.ot.shift() }
        setView({ truth: s.truth, odom: s.odom, tt: [...s.tt], ot: [...s.ot], ticks: [Math.round(s.ticks[0]), Math.round(s.ticks[1])] })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reset])
  const onKey = (down: boolean) => (e: ReactKeyboardEvent) => {
    const k = e.key.toLowerCase()
    const map: Record<string, ['f' | 'r', number]> = { w: ['f', 1], arrowup: ['f', 1], s: ['f', -1], arrowdown: ['f', -1], a: ['r', -1], arrowleft: ['r', -1], d: ['r', 1], arrowright: ['r', 1] }
    const m = map[k]
    if (!m) return
    e.preventDefault()
    keys.current[m[0]] = down ? m[1] : 0
  }
  const S = 110, W = 560, H = 360, cx = W / 2, cy = H / 2
  const P = (x: number, y: number) => `${cx + x * S},${cy - y * S}`
  const robot = (p: Pose, color: string) => (
    <g transform={`translate(${cx + p.x * S},${cy - p.y * S}) rotate(${(-p.th * 180) / Math.PI})`}>
      <rect x="-12" y="-10" width="24" height="20" rx="4" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="0" y1="0" x2="16" y2="0" stroke={color} strokeWidth="2.5" />
    </g>
  )
  const hold = (f: number, r: number) => ({
    onPointerDown: () => { keys.current = { f, r } },
    onPointerUp: () => { keys.current = { f: 0, r: 0 } },
    onPointerLeave: () => { keys.current = { f: 0, r: 0 } },
  })
  const dist = Math.hypot(view.truth.x - view.odom.x, view.truth.y - view.odom.y)
  return (
    <Body
      stage={
        <div tabIndex={0} onKeyDown={onKey(true)} onKeyUp={onKey(false)} className="gm-focus" aria-label={t('Robot sahası: W A S D ile sür', 'Robot field: drive with W A S D')}>
          <svg viewBox={`0 0 ${W} ${H}`} className="sim-canvas gm-svg" role="img" data-testid="rpi-robot-svg">
            {[-2, -1, 0, 1, 2].map((g) => <g key={g}><line x1={cx + g * S} x2={cx + g * S} y1="0" y2={H} stroke="var(--sim-grid)" /><line y1={cy + g * S} y2={cy + g * S} x1="0" x2={W} stroke="var(--sim-grid)" /></g>)}
            <polyline points={view.tt.map(([x, y]) => P(x, y)).join(' ')} fill="none" stroke="var(--green)" strokeWidth="2" />
            <polyline points={view.ot.map(([x, y]) => P(x, y)).join(' ')} fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="5 3" />
            {robot(view.odom, 'var(--gold)')}{robot(view.truth, 'var(--green)')}
            <text x="10" y="18" fontSize="11" fill="var(--green)">{t('gerçek', 'true')}</text><text x="60" y="18" fontSize="11" fill="var(--gold)">{t('odometri', 'odometry')}</text>
            <text x={W - 10} y={H - 8} fontSize="10" textAnchor="end" fill="var(--mute)">1 {t('kare', 'square')} = 1 m</text>
          </svg>
        </div>
      }
      side={
        <>
          <div className="gm-pad">
            <span /><button type="button" className="sbtn ghost" {...hold(1, 0)} aria-label={t('İleri', 'Forward')}>W</button><span />
            <button type="button" className="sbtn ghost" {...hold(0, -1)} aria-label={t('Sol', 'Left')}>A</button><button type="button" className="sbtn ghost" {...hold(-1, 0)} aria-label={t('Geri', 'Back')}>S</button><button type="button" className="sbtn ghost" {...hold(0, 1)} aria-label={t('Sağ', 'Right')}>D</button>
          </div>
          <Slider label={t('Tekerlek çapı hatası', 'Wheel-diameter error')} value={diamErr} min={-5} max={5} step={0.5} onChange={setDiamErr} fmt={(v) => `${v > 0 ? '+' : ''}${v}%`} />
          <Check label={t('Dönüşlerde kayma', 'Slip on turns')} checked={slip} onChange={setSlip} />
          <Btn ghost onClick={() => setReset((r) => r + 1)}>{t('Başa al', 'Reset')}</Btn>
          <Readout live>
            {t('gerçek', 'true')}: x {nf(lang, 2)(view.truth.x)} y {nf(lang, 2)(view.truth.y)} θ {nf(lang, 0)((view.truth.th * 180) / Math.PI)}°{'\n'}
            {t('odometri', 'odometry')}: x {nf(lang, 2)(view.odom.x)} y {nf(lang, 2)(view.odom.y)} θ {nf(lang, 0)((view.odom.th * 180) / Math.PI)}°{'\n'}
            {t('fark', 'difference')}: {nf(lang, 1)(dist * 100)} cm{'\n'}{t('sayım', 'ticks')} L/R: {view.ticks[0]} / {view.ticks[1]}
          </Readout>
        </>
      }
    />
  )
}

// ---------- 8. Flask paneli ----------
interface LogRow { req: string; status: number; body: string }
function FlaskSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const robot = useRef(newRobot())
  const [, force] = useState(0)
  const [log, setLog] = useState<LogRow[]>([])
  const [speed, setSpeed] = useState(0.5)
  const [repeat, setRepeat] = useState(true)
  const [wd, setWd] = useState(true)
  const [cut, setCut] = useState(false)
  const [needToken, setNeedToken] = useState(false)
  const [sendToken, setSendToken] = useState(true)
  const [custom, setCustom] = useState('{"cmd": "jump"}')
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const opts = useRef({ cut, needToken, sendToken, speed, wd })
  useEffect(() => { opts.current = { cut, needToken, sendToken, speed, wd } }, [cut, needToken, sendToken, speed, wd])
  const now = () => performance.now() / 1000
  const send = (req: Req, quiet = false) => {
    const o = opts.current
    if (o.cut) { if (!quiet) setLog((l) => [{ req: `${req.method} ${req.path}`, status: 0, body: t('bağlantı yok: istek ulaşmadı', 'no link: request never arrived') }, ...l].slice(0, 12)); return }
    const r = handle(robot.current, { ...req, token: o.sendToken ? 'tok' : undefined }, now(), o.needToken ? 'tok' : undefined)
    if (!quiet || r.status !== 200) setLog((l) => [{ req: `${req.method} ${req.path}${req.body ? ' ' + JSON.stringify(req.body) : ''}`, status: r.status, body: typeof r.body === 'string' ? r.body : JSON.stringify(r.body) }, ...l].slice(0, 12))
    force((x) => x + 1)
  }
  const drive = (cmd: Cmd, quiet = false) => send({ method: 'POST', path: '/api/drive', body: { cmd, speed: opts.current.speed } }, quiet)
  useEffect(() => {
    const id = setInterval(() => { if (watchdog(robot.current, now(), opts.current.wd)) { setLog((l) => [{ req: 'watchdog', status: 0, body: t('1 s komut yok: DUR', 'no command for 1 s: STOP') }, ...l].slice(0, 12)) } force((x) => x + 1) }, 100)
    return () => { clearInterval(id); if (holdTimer.current) clearInterval(holdTimer.current) }
  }, [t])
  const press = (cmd: Cmd) => { drive(cmd); if (repeat) holdTimer.current = setInterval(() => drive(cmd, true), 200) }
  const release = () => { if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; drive('stop', true) } }
  const [l, r] = cmdToWheels(robot.current.cmd, robot.current.speed)
  const arrows: Record<Cmd, string> = { forward: '▲', back: '▼', left: '◀', right: '▶', stop: '■' }
  return (
    <Body
      stage={
        <>
          <div className="gm-panel" data-testid="rpi-flask-panel">
            <div className="gm-panel-head">http://raspberrypi.local:5000/</div>
            <div className="gm-drive">
              {CMDS.map((c) => (
                <button key={c} type="button" className={`gm-dbtn gm-d-${c}`} onPointerDown={() => press(c)} onPointerUp={release} onPointerLeave={release} aria-label={c}>{arrows[c]}</button>
              ))}
            </div>
            <div className="gm-wheels">
              {[['L', l], ['R', r]].map(([n, v]) => <div key={n as string}><span>{n as string}</span><span className="gm-bar-track"><span className={(v as number) >= 0 ? 'pos' : 'neg'} style={{ width: `${Math.abs(v as number) * 100}%` }} /></span><output>{nf(lang, 2)(v as number)}</output></div>)}
            </div>
            <p className="gm-hint">{t('Robot', 'Robot')}: <b>{robot.current.cmd}</b> · {t('hız', 'speed')} {nf(lang, 2)(robot.current.speed)}{robot.current.stoppedByWatchdog ? ` · ${t('bekçi durdurdu', 'stopped by watchdog')}` : ''}</p>
          </div>
          <Readout log>{log.map((x, i) => <div key={i}><b className={x.status >= 400 || x.status === 0 ? 'gm-err' : 'gm-ok'}>{x.status || '—'}</b> {x.req}{'\n'}  → {x.body}</div>)}</Readout>
        </>
      }
      side={
        <>
          <Slider label={t('Hız', 'Speed')} value={speed} min={0} max={1.5} step={0.05} onChange={setSpeed} fmt={(v) => nf(lang, 2)(v)} />
          <Check label={t('Basılıyken 200 ms\'de bir yinele', 'Repeat every 200 ms while held')} checked={repeat} onChange={setRepeat} />
          <Check label={t('Bekçi (1 s)', 'Watchdog (1 s)')} checked={wd} onChange={setWd} />
          <Check label={t('Bağlantıyı kes (Wi-Fi koptu)', 'Cut the link (Wi-Fi dropped)')} checked={cut} onChange={setCut} />
          <Check label={t('Sunucu belirteç istesin', 'Server requires a token')} checked={needToken} onChange={setNeedToken} />
          <Check label={t('İstemci X-Token göndersin', 'Client sends X-Token')} checked={sendToken} onChange={setSendToken} />
          <label className="sl"><span className="sl-h"><span>POST /api/drive</span></span><input className="gm-input" value={custom} onChange={(e) => setCustom(e.target.value)} spellCheck={false} /></label>
          <div className="row">
            <Btn ghost onClick={() => { let body: Record<string, unknown> | undefined; try { body = JSON.parse(custom) } catch { body = undefined } send({ method: 'POST', path: '/api/drive', body }) }}>POST</Btn>
            <Btn ghost onClick={() => send({ method: 'GET', path: '/api/drive' })}>GET /api/drive</Btn>
            <Btn ghost onClick={() => send({ method: 'GET', path: '/api/status' })}>GET /api/status</Btn>
          </div>
        </>
      }
    />
  )
}

// ---------- 9. ROS 2 grafiği ----------
const NODE_POS: Record<NodeId, [number, number]> = { camera: [70, 60], detector: [210, 60], follower: [350, 60], teleop: [210, 190], web: [210, 290], mux: [420, 200], motor: [500, 300] }
function RosSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [active, setActive] = useState<NodeId[]>(['camera', 'detector', 'follower', 'teleop', 'mux', 'motor'])
  const g = graph(active)
  const W = 580, H = 360
  const topicPos = (name: string): [number, number] => {
    const pubs = g.nodes.filter((n) => n.pubs.includes(name)).map((n) => NODE_POS[n.id])
    const subs = g.nodes.filter((n) => n.subs.includes(name)).map((n) => NODE_POS[n.id])
    const all = [...pubs, ...subs]
    if (!all.length) return [W / 2, H / 2]
    const mx = all.reduce((a, p) => a + p[0], 0) / all.length, my = all.reduce((a, p) => a + p[1], 0) / all.length
    return [mx + (subs.length && pubs.length ? 0 : 40), my + 34]
  }
  const issueText = (k: string, topic: string) => k === 'no-publisher' ? t(`${topic}: abone var, yayıncı yok (düğüm bekliyor)`, `${topic}: subscriber but no publisher (node is waiting)`) : k === 'multi-publisher' ? t(`${topic}: birden fazla yayıncı (komutlar çakışır)`, `${topic}: more than one publisher (commands clash)`) : t(`${topic}: yayıncı var, dinleyen yok`, `${topic}: published but nobody listens`)
  return (
    <Body
      stage={
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="sim-canvas gm-svg" role="img" aria-label="rqt_graph" data-testid="rpi-ros-svg">
            <defs><marker id="gm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--mute)" /></marker></defs>
            {g.topics.map((tp) => {
              const [tx_, ty] = topicPos(tp.name)
              const bad = g.issues.some((i) => i.topic === tp.name && i.kind !== 'no-subscriber')
              return (
                <g key={tp.name}>
                  {g.nodes.filter((n) => n.pubs.includes(tp.name)).map((n) => <line key={`p${n.id}`} x1={NODE_POS[n.id][0]} y1={NODE_POS[n.id][1]} x2={tx_} y2={ty} stroke="var(--mute)" markerEnd="url(#gm-arr)" />)}
                  {g.nodes.filter((n) => n.subs.includes(tp.name)).map((n) => <line key={`s${n.id}`} x1={tx_} y1={ty} x2={NODE_POS[n.id][0]} y2={NODE_POS[n.id][1]} stroke="var(--mute)" markerEnd="url(#gm-arr)" />)}
                  <rect x={tx_ - 52} y={ty - 11} width="104" height="22" rx="4" fill="var(--sim-bg)" stroke={bad ? 'var(--red)' : 'var(--sky)'} strokeWidth={bad ? 2.5 : 1.5} />
                  <text x={tx_} y={ty + 4} fontSize="10.5" textAnchor="middle" fill="var(--ink)" fontFamily="monospace">{tp.name}</text>
                </g>
              )
            })}
            {g.nodes.map((n) => (
              <g key={n.id}>
                <ellipse cx={NODE_POS[n.id][0]} cy={NODE_POS[n.id][1]} rx="56" ry="18" fill="var(--sim-grid)" stroke="var(--sim-a)" strokeWidth="2" />
                <text x={NODE_POS[n.id][0]} y={NODE_POS[n.id][1] + 4} fontSize="11" textAnchor="middle" fill="var(--ink)" fontFamily="monospace">{n.name}</text>
              </g>
            ))}
          </svg>
          <Readout log>{'$ ros2 topic list\n'}{topicList(active).join('\n')}{'\n\n'}{g.issues.length ? g.issues.map((i) => `! ${issueText(i.kind, i.topic)}`).join('\n') : t('Sorun yok.', 'No problems.')}</Readout>
        </>
      }
      side={
        <>
          <p className="gm-hint">{t('Çalışan düğümler:', 'Running nodes:')}</p>
          {NODES.map((n) => <Check key={n.id} label={n.name} checked={active.includes(n.id)} onChange={(v) => setActive((s) => (v ? [...s, n.id] : s.filter((x) => x !== n.id)))} />)}
        </>
      }
    />
  )
}

// ---------- 10. 3B keşif robotu ----------
const RpiRobot3D = dynamic(() => import('./scene3d-rpi'), { ssr: false, loading: () => <div className="gm-3d" /> })
const STOP_PINS: MotorPins = { in1: false, in2: false, ena: 0, in3: false, in4: false, enb: 0 }
function Robot3DSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const live = useRef<RpiLive>({ robot: newRobot3D(), pins: STOP_PINS, follow: false, wheelAngle: [0, 0] })
  const [snap, setSnap] = useState({ pins: STOP_PINS, pose: live.current.robot.pose, bumped: false, follow: false })
  useEffect(() => {
    const id = setInterval(() => { const L = live.current; setSnap({ pins: L.pins, pose: L.robot.pose, bumped: L.robot.bumped, follow: L.follow }) }, 150)
    return () => clearInterval(id)
  }, [])
  const setPins = (p: Partial<MotorPins>) => { live.current.follow = false; live.current.pins = { ...live.current.pins, ...p } }
  const hold = (f: number, r: number) => ({
    onPointerDown: () => { live.current.follow = false; live.current.pins = commandToPins(f, r) },
    onPointerUp: () => { live.current.pins = STOP_PINS },
    onPointerLeave: () => { if (!live.current.follow) live.current.pins = STOP_PINS },
  })
  const p = snap.pins, w = pinsToWheels(p), v = seeBall(snap.pose)
  const pin = (k: 'in1' | 'in2' | 'in3' | 'in4', bcm: number) => <Check key={k} label={`${k.toUpperCase()} (GPIO${bcm})`} checked={p[k]} onChange={(x) => setPins({ [k]: x })} />
  return (
    <Body
      stage={
        <>
          <RpiRobot3D live={live} label={t('3B keşif robotu sahnesi: sürükleyerek döndür, iki parmakla yakınlaştır', '3D exploration robot scene: drag to orbit, pinch to zoom')} />
          <Readout live>
            {`gpiozero Robot(left=(5, 6), right=(13, 19))  ENA=GPIO12  ENB=GPIO18\n`}
            IN1 {+p.in1} IN2 {+p.in2} ENA {Math.round(p.ena * 100)}% · IN3 {+p.in3} IN4 {+p.in4} ENB {Math.round(p.enb * 100)}%{'\n'}
            v_L {nf(lang, 2)(w.vl)} m/s · v_R {nf(lang, 2)(w.vr)} m/s · x {nf(lang, 2)(snap.pose.x)} y {nf(lang, 2)(snap.pose.y)} θ {nf(lang, 0)((snap.pose.th * 180) / Math.PI)}°{'\n'}
            {t('kamera', 'camera')}: {v.seen ? `${t('top görünüyor', 'ball in view')} · ${nf(lang, 2)(v.dist)} m · x = ${nf(lang, 2)(v.x)}` : t('top görüş konisinde değil', 'ball not in the view cone')}{snap.bumped ? ` · ${t('TAMPON: engel', 'BUMPER: obstacle')}` : ''}
          </Readout>
        </>
      }
      side={
        <>
          <div className="gm-pad">
            <span /><button type="button" className="sbtn ghost" {...hold(0.8, 0)} aria-label={t('İleri', 'Forward')}>▲</button><span />
            <button type="button" className="sbtn ghost" {...hold(0, -0.5)} aria-label={t('Sol', 'Left')}>◀</button><button type="button" className="sbtn ghost" {...hold(-0.6, 0)} aria-label={t('Geri', 'Back')}>▼</button><button type="button" className="sbtn ghost" {...hold(0, 0.5)} aria-label={t('Sağ', 'Right')}>▶</button>
          </div>
          <Btn onClick={() => { live.current.follow = !live.current.follow; if (!live.current.follow) live.current.pins = STOP_PINS }} pressed={snap.follow} testId="rpi-robot3d-follow">{snap.follow ? t('İzlemeyi durdur', 'Stop following') : t('İzle kipi: topu bul', 'Follow mode: find the ball')}</Btn>
          <p className="gm-hint">{t('Ya da pinleri elle sür (L298N):', 'Or drive the pins by hand (L298N):')}</p>
          <div className="row">{pin('in1', 5)}{pin('in2', 6)}</div>
          <Slider label="ENA (PWM)" value={p.ena} min={0} max={1} step={0.05} onChange={(x) => setPins({ ena: x })} fmt={(x) => `${Math.round(x * 100)}%`} />
          <div className="row">{pin('in3', 13)}{pin('in4', 19)}</div>
          <Slider label="ENB (PWM)" value={p.enb} min={0} max={1} step={0.05} onChange={(x) => setPins({ enb: x })} fmt={(x) => `${Math.round(x * 100)}%`} />
          <Btn ghost onClick={() => { live.current = { robot: newRobot3D(), pins: STOP_PINS, follow: false, wheelAngle: [0, 0] } }}>{t('Başa al', 'Reset')}</Btn>
        </>
      }
    />
  )
}

export function RpiSim({ id, lang, cfg }: { id: RpiSimId; lang: Lang; cfg: Cfg }) {
  switch (id) {
    case 'board': return <BoardSim lang={lang} />
    case 'terminal': return <TerminalSim lang={lang} cfg={cfg} />
    case 'gpio': return <GpioSim lang={lang} />
    case 'bus': return <BusSim lang={lang} />
    case 'vision': return <VisionSim lang={lang} />
    case 'motor': return <MotorSim lang={lang} />
    case 'robot': return <RobotSim lang={lang} />
    case 'flask': return <FlaskSim lang={lang} />
    case 'ros': return <RosSim lang={lang} />
    case 'robot3d': return <Robot3DSim lang={lang} />
  }
}
export type { Board }

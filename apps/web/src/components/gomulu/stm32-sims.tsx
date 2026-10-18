'use client'
// ARM (STM32) dersinin tarayıcı simülasyonları. Hesap lib/stm32 altındaki saf fonksiyonlarda (testli); burada yalnız
// girdi toplama ve SVG çizimi var.
import { useState } from 'react'
import { command, newMotor } from '@/lib/stm32/cmd'
import {
  ADDR, F407, F411, GPIO_OFFSETS, MEMORY_MAP, clockTree, computeIDR, contention, flashWaitStates, hex32, memoryUse, modeOf, openDrain, peripheralAt, pinLevel,
  pullOf, regionOf, registerCode, resetRegs, setMode, setOpenDrain, setPull, toggleBit, usbOk, writeBSRR, type GpioRegs, type Mode, type PllCfg, type Pull,
} from '@/lib/stm32/core'
import { simulateIrqs, extiMap, extiIrq, type Port } from '@/lib/stm32/irq'
import { i2cWave, spiMismatch, spiWave } from '@/lib/stm32/bus'
import { adc12, brr, decodeBits, frameString, pwmBits, pwmDuty, pwmFreq, simulateDma, solvePwm, type Parity } from '@/lib/stm32/periph'
import { MODE_MA, MODE_TEXT, batteryLife, rmBound, schedule, type PowerMode, type Task } from '@/lib/stm32/rtos'
import type { StmSimId } from '@/lib/stm32/sims'
import { Badge, Body, Btn, Check, Readout, Select, Slider, Tabs, nf, tx, wavePath, type Lang } from './ui'

type Cfg = Record<string, string>
const mhz = (lang: Lang, v: number) => `${nf(lang, v % 1 ? 2 : 0)(v)} MHz`
const hz = (lang: Lang, v: number) => (v >= 1e6 ? `${nf(lang, 3)(v / 1e6)} MHz` : v >= 1e3 ? `${nf(lang, 3)(v / 1e3)} kHz` : `${nf(lang, 2)(v)} Hz`)

// ---------- 1. Bellek haritası ----------
function MemmapSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [text, setText] = useState('0x40020014')
  const addr = Number.parseInt(text.replace(/_/g, ''), 16)
  const valid = Number.isFinite(addr) && addr >= 0 && addr <= 0xffffffff
  const reg = valid ? regionOf(addr) : undefined
  const per = valid ? peripheralAt(addr) : null
  const gpioReg = per && per.name.startsWith('GPIO') ? Object.entries(GPIO_OFFSETS).find(([, o]) => o === per.offset)?.[0] : undefined
  const H = 360, W = 560
  const y = (a: number) => 10 + (a / 0x1_0000_0000) * (H - 20)
  return (
    <Body
      stage={
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="sim-canvas gm-svg" role="img" aria-label={t('Bellek haritası', 'Memory map')} data-testid="stm-memmap-svg">
            {MEMORY_MAP.map((r, i) => (
              <g key={r.name} onClick={() => setText(hex32(r.start))} style={{ cursor: 'pointer' }}>
                <rect x="60" y={y(r.start)} width="170" height={y(r.end + 1) - y(r.start)} fill={reg === r ? 'var(--sim-a)' : i % 2 ? 'var(--sim-grid)' : 'var(--sim-bg)'} opacity={reg === r ? 0.35 : 1} stroke="var(--line)" />
                <text x="145" y={(y(r.start) + y(r.end + 1)) / 2 + 4} fontSize="11" textAnchor="middle" fill="var(--ink)">{r.name}</text>
                <text x="54" y={y(r.start) + 10} fontSize="9" textAnchor="end" fill="var(--mute)" fontFamily="monospace">{hex32(r.start)}</text>
              </g>
            ))}
            {valid && <><line x1="40" x2="250" y1={y(addr)} y2={y(addr)} stroke="var(--red)" strokeWidth="2" /><circle cx="250" cy={y(addr)} r="4" fill="var(--red)" /></>}
            {Object.entries(ADDR).map(([name, a], i) => (
              <g key={name} onClick={() => setText(hex32(a))} style={{ cursor: 'pointer' }}>
                <text x={300 + (i % 2) * 130} y={24 + Math.floor(i / 2) * 22} fontSize="11" fill={per?.name === name ? 'var(--red)' : 'var(--ink)'} fontFamily="monospace">{name}</text>
                <text x={300 + (i % 2) * 130} y={35 + Math.floor(i / 2) * 22} fontSize="8.5" fill="var(--mute)" fontFamily="monospace">{hex32(a)}</text>
              </g>
            ))}
          </svg>
          <Readout live>
            {!valid ? t('Geçersiz adres', 'Invalid address') : <>
              <b>{hex32(addr)}</b> · {reg?.name}{'\n'}{reg?.[lang]}{'\n'}
              {per ? `${per.name} + 0x${per.offset.toString(16).toUpperCase()}${gpioReg ? ` = ${per.name}->${gpioReg}` : ''}` : t('Bilinen bir birimin ilk 1 KB\'ında değil.', 'Not within the first 1 KB of a known block.')}
            </>}
          </Readout>
        </>
      }
      side={
        <>
          <label className="sl"><span className="sl-h"><span>{t('Adres (onaltılı)', 'Address (hex)')}</span></span><input className="gm-input" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} data-testid="stm-memmap-input" /></label>
          <div className="row">{['0x40020014', '0x40020410', '0x20000400', '0xE000E100', '0x40023830'].map((a) => <button key={a} type="button" className="gm-chip" onClick={() => setText(a)}>{a}</button>)}</div>
          <p className="gm-hint">{t('Sol: bölgeler (ölçeksiz değil, 4 GB doğrusal). Sağ: bilinen birimlere tıkla.', 'Left: regions (linear over 4 GB). Right: click a known block.')}</p>
        </>
      }
    />
  )
}

// ---------- 2. Bağlayıcı bölümleri ----------
const TARGETS = { f401: { name: 'STM32F401RE', flash: 512, ram: 96 }, f103: { name: 'STM32F103C8', flash: 64, ram: 20 }, f030: { name: 'STM32F030F4', flash: 16, ram: 4 } } as const
function LinkerSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [tgt, setTgt] = useState<keyof typeof TARGETS>('f103')
  const [s, setS] = useState({ text: 9000, rodata: 800, data: 200, bss: 1200, stack: 1024, heap: 512 })
  const [pf, setPf] = useState(false)
  const T = TARGETS[tgt]
  const eff = pf ? { ...s, text: s.text + 22_000, rodata: s.rodata + 1_800, heap: s.heap + 1_024 } : s
  const m = memoryUse(eff, T.flash, T.ram)
  const keys = ['text', 'rodata', 'data', 'bss', 'stack', 'heap'] as const
  const color: Record<string, string> = { text: 'var(--sim-a)', rodata: 'var(--sky)', data: 'var(--gold)', bss: 'var(--green)', stack: 'var(--red)', heap: 'var(--mute)' }
  const bar = (title: string, cap: number, parts: Array<[string, number]>, y: number) => {
    let x = 120
    const W = 420
    return (
      <g>
        <text x="10" y={y + 18} fontSize="12" fill="var(--ink)">{title}</text>
        <rect x="120" y={y} width={W} height="28" fill="var(--sim-grid)" stroke="var(--line)" />
        {parts.map(([k, v]) => { const w = Math.min(W, (v / cap) * W); const el = <rect key={k} x={x} y={y} width={Math.max(0, Math.min(w, 540 - x))} height="28" fill={color[k]} opacity=".8"><title>{`.${k}: ${v} B`}</title></rect>; x += w; return el })}
        <text x="540" y={y + 44} fontSize="11" textAnchor="end" fill={parts.reduce((a, [, v]) => a + v, 0) > cap ? 'var(--red)' : 'var(--mute)'}>{nf(lang, 1)(parts.reduce((a, [, v]) => a + v, 0) / 1024)} / {cap / 1024} KB</text>
      </g>
    )
  }
  return (
    <Body
      stage={
        <>
          <svg viewBox="0 0 560 170" className="sim-canvas gm-svg" role="img" aria-label="Flash / RAM" data-testid="stm-linker-svg">
            {bar('Flash', T.flash * 1024, [['text', eff.text], ['rodata', eff.rodata], ['data', eff.data]], 16)}
            {bar('RAM', T.ram * 1024, [['data', eff.data], ['bss', eff.bss], ['stack', eff.stack], ['heap', eff.heap]], 90)}
          </svg>
          <div className="gm-legend">{keys.map((k) => <span key={k}><i style={{ background: color[k] }} />.{k}</span>)}</div>
          <Readout live>
            {'$ arm-none-eabi-size firmware.elf\n'}{'   text    data     bss\n'}
            {`${String(eff.text + eff.rodata).padStart(7)} ${String(eff.data).padStart(7)} ${String(eff.bss).padStart(7)}\n\n`}
            Flash {nf(lang, 1)(m.flashPct * 100)}% · RAM {nf(lang, 1)(m.ramPct * 100)}% · {m.fits ? <Badge kind="ok">{t('sığıyor', 'fits')}</Badge> : <Badge kind="error">{t('sığmıyor', 'does not fit')}</Badge>}
          </Readout>
        </>
      }
      side={
        <>
          <Select label={t('Hedef', 'Target')} value={tgt} options={(Object.keys(TARGETS) as Array<keyof typeof TARGETS>).map((k) => [k, `${TARGETS[k].name} (${TARGETS[k].flash}/${TARGETS[k].ram} KB)`])} onChange={setTgt} />
          {keys.map((k) => <Slider key={k} label={`.${k}`} value={s[k]} min={0} max={k === 'text' ? 60_000 : 8_000} step={k === 'text' ? 500 : 64} onChange={(v) => setS((x) => ({ ...x, [k]: v }))} fmt={(v) => `${nf(lang, 1)(v / 1024)} KB`} />)}
          <Check label={t('printf("%f") + float kütüphanesi', 'printf("%f") + float library')} checked={pf} onChange={setPf} />
        </>
      }
    />
  )
}

// ---------- 3. GPIO yazmaçları ----------
const MODE_LABEL: Record<Mode, string> = { input: '00 in', output: '01 out', af: '10 AF', analog: '11 an' }
function RegsSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [ports, setPorts] = useState<Record<'A' | 'C', GpioRegs>>({ A: resetRegs(), C: setPull(resetRegs(), 13, 'none') })
  const [clk, setClk] = useState({ A: false, C: false })
  const [port, setPort] = useState<'A' | 'C'>('A')
  const [pin, setPin] = useState(5)
  const [pressed, setPressed] = useState(false)
  const [extGnd, setExtGnd] = useState(false)
  const [noise, setNoise] = useState(0)
  // Nucleo: B1 (PC13) dış pull-up'lıdır; burada eğitim için dış direnci kaldırılmış kabul edilir (PUPDR'nin etkisi görünsün)
  const extOf = (p: 'A' | 'C', n: number): boolean | null => (p === 'C' && n === 13 ? (pressed ? false : null) : p === 'A' && n === 5 && extGnd ? false : null)
  const r = ports[port]
  const upd = (f: (g: GpioRegs) => GpioRegs) => { if (!clk[port]) return; setPorts((s) => ({ ...s, [port]: f(s[port]) })) }
  const idr = (p: 'A' | 'C') => computeIDR(ports[p], Array.from({ length: 16 }, (_, i) => extOf(p, i)), noise)
  const lvA5 = clk.A ? pinLevel(ports.A, 5, extOf('A', 5)) : 'float'
  const ledOn = lvA5 === 1
  const short = clk.A && contention(ports.A, 5, extOf('A', 5))
  const code = registerCode(port, pin, r)
  const bits = (v: number, n: number, w = 1, onClick?: (i: number) => void, hl?: number) => (
    <div className="gm-bits" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }, (_, k) => n - 1 - k).map((i) => (
        <button key={i} type="button" disabled={!onClick} className={`${(v >>> (i * w)) & ((1 << w) - 1) ? 'on' : ''}${hl === i ? ' hl' : ''}`} onClick={() => onClick?.(i)} title={`${i}`}>
          {((v >>> (i * w)) & ((1 << w) - 1)).toString(2).padStart(w, '0')}
        </button>
      ))}
    </div>
  )
  return (
    <Body
      stage={
        <div className="gm-regs" data-testid="stm-regs">
          <svg viewBox="0 0 560 120" className="sim-canvas gm-svg" role="img" aria-label={t('Nucleo: PA5 LED, PC13 buton', 'Nucleo: PA5 LED, PC13 button')}>
            <rect x="10" y="10" width="540" height="100" rx="10" fill="var(--sim-grid)" stroke="var(--line)" />
            <text x="24" y="32" fontSize="12" fill="var(--ink)">Nucleo-F401RE</text>
            <circle cx="140" cy="70" r="16" fill={ledOn ? 'var(--green)' : 'var(--sim-bg)'} stroke="var(--green)" strokeWidth="2" />
            <text x="140" y="104" fontSize="10" textAnchor="middle" fill="var(--mute)">LD2 · PA5 = {String(lvA5)}</text>
            <g onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)} style={{ cursor: 'pointer' }}>
              <rect x="260" y="50" width="56" height="40" rx="8" fill={pressed ? 'var(--sky)' : 'var(--sim-bg)'} stroke="var(--sky)" strokeWidth="2" />
              <text x="288" y="75" fontSize="11" textAnchor="middle" fill="var(--ink)">B1</text>
            </g>
            <text x="288" y="104" fontSize="10" textAnchor="middle" fill="var(--mute)">PC13 IDR = {(idr('C') >> 13) & 1}{clk.C ? '' : ' (clk off)'}</text>
            {short && <text x="400" y="74" fontSize="13" fill="var(--red)">{t('KISA DEVRE!', 'SHORT CIRCUIT!')}</text>}
          </svg>
          <table className="gm-regtable">
            <tbody>
              <tr><th>MODER</th><td>{bits(r.MODER, 16, 2, (i) => upd((g) => setMode(g, i, (['input', 'output', 'af', 'analog'] as Mode[])[(['input', 'output', 'af', 'analog'].indexOf(modeOf(g, i)) + 1) % 4])), pin)}</td><td className="gm-hex">{hex32(r.MODER)}</td></tr>
              <tr><th>OTYPER</th><td>{bits(r.OTYPER, 16, 1, (i) => upd((g) => setOpenDrain(g, i, !openDrain(g, i))), pin)}</td><td className="gm-hex">{hex32(r.OTYPER)}</td></tr>
              <tr><th>PUPDR</th><td>{bits(r.PUPDR, 16, 2, (i) => upd((g) => setPull(g, i, (['none', 'up', 'down'] as Pull[])[(['none', 'up', 'down'].indexOf(pullOf(g, i)) + 1) % 3])), pin)}</td><td className="gm-hex">{hex32(r.PUPDR)}</td></tr>
              <tr><th>ODR</th><td>{bits(r.ODR, 16, 1, (i) => upd((g) => ({ ...g, ODR: toggleBit(g.ODR, i) })), pin)}</td><td className="gm-hex">{hex32(r.ODR)}</td></tr>
              <tr><th>IDR</th><td>{bits(clk[port] ? idr(port) : 0, 16, 1, undefined, pin)}</td><td className="gm-hex">{hex32(clk[port] ? idr(port) : 0)}</td></tr>
            </tbody>
          </table>
          <p className="gm-hint">GPIO{port}{pin}: {modeOf(r, pin)} · {openDrain(r, pin) ? 'open-drain' : 'push-pull'} · pull {pullOf(r, pin)} · {MODE_LABEL[modeOf(r, pin)]}</p>
          <div className="gm-code2">
            <pre className="gm-code">{`/* ${t('kayıt düzeyi', 'register level')} */\n${code.reg.join('\n')}`}</pre>
            <pre className="gm-code">{`/* HAL */\n${code.hal.join('\n')}`}</pre>
          </div>
        </div>
      }
      side={
        <>
          <Check label={`RCC->AHB1ENR: GPIOAEN`} checked={clk.A} onChange={(v) => setClk((c) => ({ ...c, A: v }))} />
          <Check label={`RCC->AHB1ENR: GPIOCEN`} checked={clk.C} onChange={(v) => setClk((c) => ({ ...c, C: v }))} />
          {!clk[port] && <p className="gm-hint"><Badge kind="warn">{t('Saat kapalı', 'Clock off')}</Badge> {t('yazmaçlara yazılanlar yok sayılır.', 'writes to the registers are ignored.')}</p>}
          <Select label={t('Port', 'Port')} value={port} options={[['A', 'GPIOA'], ['C', 'GPIOC']]} onChange={(p) => { setPort(p); setPin(p === 'A' ? 5 : 13) }} />
          <Slider label={t('Pin (vurgulu bitler)', 'Pin (highlighted bits)')} value={pin} min={0} max={15} onChange={setPin} />
          <div className="row">
            <Btn ghost onClick={() => upd((g) => writeBSRR(g, 1 << pin))}>BSRR = 1&lt;&lt;{pin}</Btn>
            <Btn ghost onClick={() => upd((g) => writeBSRR(g, 1 << (pin + 16)))}>BSRR = 1&lt;&lt;{pin + 16}</Btn>
          </div>
          <Btn onClick={() => setPressed((p) => !p)} pressed={pressed}>{pressed ? t('B1\'i bırak', 'Release B1') : t('B1\'e bas (PC13 → GND)', 'Press B1 (PC13 → GND)')}</Btn>
          <Check label={t('PA5\'i dışarıdan GND\'ye çek', 'Pull PA5 to GND externally')} checked={extGnd} onChange={setExtGnd} />
          <Btn ghost onClick={() => setNoise(Math.floor(Math.random() * 0xffff))}>{t('Yüzen pinleri yeniden oku', 'Re-read floating pins')}</Btn>
        </>
      }
    />
  )
}

// ---------- 4. Saat ağacı ----------
function ClockSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [chip, setChip] = useState<'f407' | 'f411'>('f407')
  const [c, setC] = useState<PllCfg>({ src: 'HSE', hse: 8, M: 8, N: 336, P: 2, Q: 7, ahb: 1, apb1: 4, apb2: 2 })
  const lim = chip === 'f407' ? F407 : F411
  const tr = clockTree(c, lim)
  const set = (k: keyof PllCfg) => (v: number | string) => setC((x) => ({ ...x, [k]: v }))
  const box = (x: number, y: number, label: string, val: string, bad = false) => (
    <g><rect x={x} y={y} width="112" height="42" rx="6" fill="var(--sim-bg)" stroke={bad ? 'var(--red)' : 'var(--sim-a)'} strokeWidth={bad ? 2.5 : 1.5} /><text x={x + 56} y={y + 16} fontSize="10" textAnchor="middle" fill="var(--mute)">{label}</text><text x={x + 56} y={y + 33} fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="700">{val}</text></g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, l?: string) => <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--mute)" markerEnd="url(#gm-arr2)" />{l && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} fontSize="9.5" textAnchor="middle" fill="var(--mute)">{l}</text>}</g>
  const err = (s: string) => tr.errors.some((e) => e.en.startsWith(s))
  return (
    <Body
      stage={
        <>
          <svg viewBox="0 0 580 300" className="sim-canvas gm-svg" role="img" aria-label="RCC" data-testid="stm-clock-svg">
            <defs><marker id="gm-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--mute)" /></marker></defs>
            {box(8, 20, c.src, mhz(lang, c.src === 'HSE' ? c.hse : 16))}
            {arrow(120, 41, 150, 41, `/M ${c.M}`)}
            {box(150, 20, t('VCO giriş', 'VCO in'), mhz(lang, tr.vcoIn), err('VCO input'))}
            {arrow(262, 41, 292, 41, `×N ${c.N}`)}
            {box(292, 20, 'VCO', mhz(lang, tr.vco), err('VCO output'))}
            {arrow(348, 62, 348, 100, `/P ${c.P}`)}
            {arrow(404, 41, 452, 41, `/Q ${c.Q}`)}
            {box(452, 20, 'USB', mhz(lang, tr.usb), !usbOk(tr))}
            {box(292, 100, 'SYSCLK', mhz(lang, tr.sys), err('SYSCLK'))}
            {arrow(348, 142, 348, 170, `/AHB ${c.ahb}`)}
            {box(292, 170, 'HCLK', mhz(lang, tr.hclk))}
            {arrow(300, 212, 130, 236, `/${c.apb1}`)}
            {arrow(396, 212, 470, 236, `/${c.apb2}`)}
            {box(20, 236, 'APB1 (PCLK1)', mhz(lang, tr.pclk1), err('APB1'))}
            {box(150, 236, 'TIM2-5', mhz(lang, tr.tim2))}
            {box(320, 236, 'APB2 (PCLK2)', mhz(lang, tr.pclk2), err('APB2'))}
            {box(452, 236, 'TIM1', mhz(lang, tr.tim1))}
          </svg>
          <Readout live>
            {tr.errors.length ? tr.errors.map((e) => `✗ ${e[lang]}`).join('\n') : <><Badge kind="ok">OK</Badge> {t('Tüm sınırlar içinde.', 'All within limits.')}</>}{'\n'}
            USB 48 MHz: {usbOk(tr) ? t('evet', 'yes') : t('hayır', 'no')} · {t('Flash bekleme', 'Flash wait states')}: {flashWaitStates(tr.hclk)}
          </Readout>
        </>
      }
      side={
        <>
          <Select label={t('Yonga', 'Chip')} value={chip} options={[['f407', 'STM32F407 (168 MHz)'], ['f411', 'STM32F411 (100 MHz)']]} onChange={setChip} />
          <Select label={t('PLL kaynağı', 'PLL source')} value={c.src} options={[['HSE', 'HSE'], ['HSI', 'HSI 16 MHz']]} onChange={set('src')} />
          {c.src === 'HSE' && <Select label="HSE" value={c.hse} options={[[8, '8 MHz'], [25, '25 MHz'], [12, '12 MHz']]} onChange={set('hse')} />}
          <Slider label="PLLM" value={c.M} min={2} max={63} onChange={set('M')} />
          <Slider label="PLLN" value={c.N} min={50} max={432} onChange={set('N')} />
          <Select label="PLLP" value={c.P} options={[[2, '2'], [4, '4'], [6, '6'], [8, '8']]} onChange={set('P')} />
          <Slider label="PLLQ" value={c.Q} min={2} max={15} onChange={set('Q')} />
          <Select label={t('APB1 bölücü', 'APB1 divider')} value={c.apb1} options={[[1, '1'], [2, '2'], [4, '4'], [8, '8']]} onChange={set('apb1')} />
          <Select label={t('APB2 bölücü', 'APB2 divider')} value={c.apb2} options={[[1, '1'], [2, '2'], [4, '4']]} onChange={set('apb2')} />
        </>
      }
    />
  )
}

// ---------- 5. PWM ----------
function PwmSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [fTim, setFTim] = useState(84e6)
  const [target, setTarget] = useState(20000)
  const [psc, setPsc] = useState(0), [arr, setArr] = useState(4199), [ccr, setCcr] = useState(1050)
  const f = pwmFreq({ fTim, psc, arr }), duty = pwmDuty({ arr, ccr })
  const solve = () => { const s = solvePwm(fTim, target); if (s) { setPsc(s.psc); setArr(s.arr); setCcr(Math.round(duty * (s.arr + 1))) } }
  const servo = () => { setPsc(fTim / 1e6 - 1); setArr(19999); setCcr(1500) }
  const periods = 3, W = 560, x0 = 40, pw = (W - x0 - 10) / periods
  const saw = Array.from({ length: periods }, (_, p) => `M${x0 + p * pw},150 L${x0 + (p + 1) * pw},40`).join(' ')
  const ccrY = 150 - Math.min(1, ccr / (arr + 1)) * 110
  const out = Array.from({ length: periods * 100 }, (_, i) => ((i % 100) / 100 < duty ? 1 : 0))
  return (
    <Body
      stage={
        <>
          <svg viewBox={`0 0 ${W} 250`} className="sim-canvas gm-svg" role="img" aria-label="PWM" data-testid="stm-pwm-svg">
            <text x="6" y="44" fontSize="10" fill="var(--mute)">ARR</text><text x="6" y={ccrY + 4} fontSize="10" fill="var(--gold)">CCR</text><text x="6" y="154" fontSize="10" fill="var(--mute)">0</text>
            <line x1={x0} x2={W - 10} y1="40" y2="40" stroke="var(--sim-grid)" />
            <path d={saw} stroke="var(--sim-a)" strokeWidth="2" fill="none" />
            <line x1={x0} x2={W - 10} y1={ccrY} y2={ccrY} stroke="var(--gold)" strokeDasharray="5 4" />
            <text x="6" y="200" fontSize="10" fill="var(--ink)">OC1</text>
            <path d={wavePath(out, x0, W - x0 - 10, 185, 225)} stroke="var(--red)" strokeWidth="2" fill="none" />
          </svg>
          <Readout live>
            f = {fTim / 1e6} MHz / ({psc} + 1) / ({arr} + 1) = <b>{hz(lang, f)}</b>{'\n'}
            {t('görev', 'duty')} = {ccr} / {arr + 1} = <b>{nf(lang, 1)(duty * 100)}%</b> · {t('çözünürlük', 'resolution')} {nf(lang, 1)(pwmBits(arr))} bit{'\n'}
            {t('sayım adımı', 'tick')} = {nf(lang, 3)(((psc + 1) / fTim) * 1e6)} µs{arr > 0xffff ? '\n✗ ARR > 65535' : ''}
          </Readout>
        </>
      }
      side={
        <>
          <Select label={t('Zamanlayıcı saati', 'Timer clock')} value={fTim} options={[[84e6, '84 MHz'], [168e6, '168 MHz'], [16e6, '16 MHz (HSI)']]} onChange={setFTim} />
          <label className="sl"><span className="sl-h"><span>{t('İstenen frekans (Hz)', 'Target frequency (Hz)')}</span></span><input className="gm-input" type="number" value={target} min={1} onChange={(e) => setTarget(Number(e.target.value))} /></label>
          <div className="row"><Btn onClick={solve} testId="stm-pwm-solve">{t('PSC/ARR bul', 'Solve PSC/ARR')}</Btn><Btn ghost onClick={servo}>{t('Servo 50 Hz', 'Servo 50 Hz')}</Btn></div>
          <Slider label="PSC" value={psc} min={0} max={999} onChange={setPsc} />
          <Slider label="ARR" value={arr} min={1} max={Math.max(65535, arr)} onChange={setArr} />
          <Slider label="CCR" value={ccr} min={0} max={Math.max(arr + 200, 10)} onChange={setCcr} />
        </>
      }
    />
  )
}

// ---------- 6. NVIC ----------
const IRQ_COLOR: Record<string, string> = { EXTI0: 'var(--red)', TIM2: 'var(--sim-a)', USART2: 'var(--sky)', main: 'var(--sim-grid)' }
function NvicSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [tab, setTab] = useState<'nvic' | 'exti'>('nvic')
  const [p, setP] = useState({ EXTI0: 1, TIM2: 2, USART2: 3 })
  const [d, setD] = useState({ EXTI0: 2, TIM2: 4, USART2: 2 })
  const [at, setAt] = useState({ TIM2: 1, EXTI0: 2, USART2: 2.5, USART2b: 3 })
  const [extiPins, setExtiPins] = useState<Array<{ port: Port; pin: number }>>([{ port: 'C', pin: 13 }, { port: 'A', pin: 0 }])
  const names = ['EXTI0', 'TIM2', 'USART2'] as const
  const r = simulateIrqs(names.map((n) => ({ name: n, preempt: p[n], sub: 0, dur: d[n] })), [{ at: at.TIM2, irq: 'TIM2' }, { at: at.EXTI0, irq: 'EXTI0' }, { at: at.USART2, irq: 'USART2' }, { at: at.USART2b, irq: 'USART2' }], 16)
  const W = 560, x = (v: number) => 40 + (v / 16) * 510
  const ex = extiMap(extiPins)
  return (
    <Body
      stage={
        <>
          <Tabs label="NVIC/EXTI" value={tab} tabs={[['nvic', t('Zaman çizelgesi', 'Timeline')], ['exti', 'EXTI']]} onChange={setTab} />
          {tab === 'nvic' ? (
            <>
              <svg viewBox={`0 0 ${W} 200`} className="sim-canvas gm-svg" role="img" aria-label={t('Kesme zaman çizelgesi', 'Interrupt timeline')} data-testid="stm-nvic-svg">
                {[0, 1, 2, 3].map((k) => <text key={k} x="6" y={160 - k * 36 + 4} fontSize="10" fill="var(--mute)">{k === 0 ? 'main' : `L${k}`}</text>)}
                {r.segs.filter((s) => s.who !== 'end').map((s, i) => <rect key={i} x={x(s.start)} y={150 - s.depth * 36} width={Math.max(0.5, x(s.end) - x(s.start))} height="22" fill={IRQ_COLOR[s.who] ?? 'var(--gold)'} opacity={s.who === 'main' ? 1 : 0.85}><title>{`${s.who} ${s.start.toFixed(2)}–${s.end.toFixed(2)} µs`}</title></rect>)}
                {Object.entries(r.reqTimes).flatMap(([n, ts]) => ts.map((tt, i) => <g key={`${n}${i}`}><line x1={x(tt)} x2={x(tt)} y1="10" y2="182" stroke={IRQ_COLOR[n]} strokeDasharray="3 3" /><text x={x(tt) + 2} y="20" fontSize="9" fill={IRQ_COLOR[n]}>{n}</text></g>))}
                {[0, 4, 8, 12, 16].map((v) => <text key={v} x={x(v)} y="196" fontSize="9" textAnchor="middle" fill="var(--mute)">{v} µs</text>)}
              </svg>
              <div className="gm-legend">{names.map((n) => <span key={n}><i style={{ background: IRQ_COLOR[n] }} />{n} (preempt {p[n]})</span>)}</div>
              <Readout live>
                {t('en derin iç içe', 'max nesting')}: {r.maxDepth} · {t('kaybolan istek', 'lost requests')}: {r.lost}{'\n'}
                {names.map((n) => `${n} ${t('gecikme', 'latency')}: ${(r.latency[n] ?? []).map((v) => nf(lang, 2)(v)).join(', ') || '—'} µs`).join('\n')}
              </Readout>
            </>
          ) : (
            <Readout>
              {ex.conflicts.length ? ex.conflicts.map((c) => <span key={c}><Badge kind="error">EXTI{c}</Badge> {t('aynı hat iki porta bağlanamaz', 'one line cannot connect to two ports')}{'\n'}</span>) : <><Badge kind="ok">OK</Badge>{'\n'}</>}
              {Object.entries(ex.lines).map(([line, prt]) => `EXTI${line} ← P${prt}${line} · ${extiIrq(Number(line))} · SYSCFG_EXTICR${Math.floor(Number(line) / 4) + 1}`).join('\n')}
            </Readout>
          )}
        </>
      }
      side={tab === 'nvic' ? (
        <>
          {names.map((n) => <div key={n} className="gm-dev"><b className="gm-small">{n}</b><Slider label="preempt" value={p[n]} min={0} max={15} onChange={(v) => setP((s) => ({ ...s, [n]: v }))} /><Slider label={t('süre', 'duration')} value={d[n]} min={0.5} max={6} step={0.5} onChange={(v) => setD((s) => ({ ...s, [n]: v }))} fmt={(v) => `${v} µs`} /></div>)}
          <Slider label={t('EXTI0 istek anı', 'EXTI0 request time')} value={at.EXTI0} min={0} max={12} step={0.25} onChange={(v) => setAt((s) => ({ ...s, EXTI0: v }))} fmt={(v) => `${v} µs`} />
          <Slider label={t('2. USART2 isteği', '2nd USART2 request')} value={at.USART2b} min={0} max={12} step={0.25} onChange={(v) => setAt((s) => ({ ...s, USART2b: v }))} fmt={(v) => `${v} µs`} />
        </>
      ) : (
        <>
          {(['A', 'B', 'C'] as Port[]).flatMap((prt) => [0, 3, 13].map((pin) => {
            const on = extiPins.some((e) => e.port === prt && e.pin === pin)
            return <Check key={`${prt}${pin}`} label={`P${prt}${pin}`} checked={on} onChange={(v) => setExtiPins((s) => (v ? [...s, { port: prt, pin }] : s.filter((e) => !(e.port === prt && e.pin === pin))))} />
          }))}
        </>
      )}
    />
  )
}

// ---------- 7. UART ----------
function UartSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [tab, setTab] = useState<'frame' | 'brr' | 'cmd'>('frame')
  const [text, setText] = useState('OK')
  const [parity, setParity] = useState<Parity>('none')
  const [stop, setStop] = useState<1 | 2>(1)
  const [flip, setFlip] = useState(-1)
  const [fck, setFck] = useState(42e6), [baud, setBaud] = useState(115200)
  const [motor, setMotor] = useState(newMotor())
  const [con, setCon] = useState<string[]>(['> HELP', 'OK PWM <0-100> | DIR F|R | FREQ <100-50000> | START | STOP | STATUS'])
  const [line, setLine] = useState('')
  const bitsAll = frameString(text.slice(0, 4), { parity, stop })
  const levels = bitsAll.map((b, i) => (i === flip ? ((1 - b.v) as 0 | 1) : b.v))
  const dec = decodeBits(levels, { parity, stop })
  const b = brr(fck, baud)
  const kindColor: Record<string, string> = { idle: 'var(--mute)', start: 'var(--red)', data: 'var(--sim-a)', parity: 'var(--gold)', stop: 'var(--sky)' }
  const W = 560, x0 = 20, bw = (W - 30) / Math.max(1, levels.length)
  const send = () => { const r = command(motor, line); setMotor(r.state); setCon((c) => [...c, `> ${line}`, r.reply].slice(-14)); setLine('') }
  return (
    <Body
      stage={
        <>
          <Tabs label="UART" value={tab} tabs={[['frame', t('Çerçeve', 'Frame')], ['brr', 'BRR'], ['cmd', t('Komut', 'Command')]]} onChange={setTab} />
          {tab === 'frame' && (
            <>
              <svg viewBox={`0 0 ${W} 140`} className="sim-canvas gm-svg" role="img" aria-label="TX" data-testid="stm-uart-svg">
                {bitsAll.map((bit, i) => (
                  <g key={i} onClick={() => setFlip(i === flip ? -1 : i)} style={{ cursor: 'pointer' }}>
                    <rect x={x0 + i * bw} y="20" width={bw} height="70" fill={kindColor[bit.kind]} opacity={i === flip ? 0.45 : 0.12} />
                    <text x={x0 + i * bw + bw / 2} y="110" fontSize={bw > 14 ? 9 : 7} textAnchor="middle" fill={kindColor[bit.kind]}>{bit.kind === 'data' ? `D${bit.i}` : bit.kind === 'idle' ? '' : bit.kind[0].toUpperCase()}</text>
                  </g>
                ))}
                <path d={wavePath(levels, x0, levels.length * bw, 30, 80)} stroke="var(--ink)" strokeWidth="2" fill="none" />
                <text x="20" y="130" fontSize="10" fill="var(--mute)">{t('Bir bite tıkla: boz', 'Click a bit: corrupt it')} · S start · D veri/data · P parity · S stop</text>
              </svg>
              <Readout live>
                {t('Alıcı', 'Receiver')}: {dec.map((d, i) => <span key={i}>{JSON.stringify(String.fromCharCode(d.byte))} (0x{d.byte.toString(16).padStart(2, '0')}){d.fe ? ' FE' : ''}{d.pe ? ' PE' : ''}{'  '}</span>)}{'\n'}
                {t('Bit süresi', 'Bit time')} @115200: {nf(lang, 2)(1e6 / 115200)} µs
              </Readout>
            </>
          )}
          {tab === 'brr' && (
            <Readout live>
              USARTDIV = {fck / 1e6} MHz / (16 × {baud}) = {nf(lang, 4)(fck / (16 * baud))}{'\n'}
              {t('mantis', 'mantissa')} = {b.mantissa}, {t('kesir', 'fraction')} = {b.fraction}/16 → BRR = 0x{b.reg.toString(16).toUpperCase()}{'\n'}
              {t('gerçek baud', 'actual baud')} = {nf(lang, 0)(b.actual)} · {t('hata', 'error')} = {nf(lang, 3)(b.errPct)}% {Math.abs(b.errPct) < 2 ? <Badge kind="ok">OK</Badge> : <Badge kind="error">{t('riskli', 'risky')}</Badge>}
            </Readout>
          )}
          {tab === 'cmd' && (
            <>
              <div className="gm-term"><div className="gm-term-out">{con.map((c, i) => <div key={i} className={c.startsWith('>') ? 'in' : c.startsWith('ERR') ? 'gm-err' : undefined}>{c}</div>)}
                <label className="gm-term-in"><span>&gt;</span><input value={line} onChange={(e) => setLine(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} aria-label={t('Komut', 'Command')} spellCheck={false} autoCapitalize="off" data-testid="stm-uart-cmd" /></label></div></div>
              <svg viewBox="0 0 560 80" className="sim-canvas gm-svg" role="img" aria-label={t('Motor', 'Motor')}>
                <circle cx="60" cy="40" r="28" fill="var(--sim-grid)" stroke="var(--ink)" />
                <line x1="60" y1="40" x2="60" y2="16" stroke="var(--sim-a)" strokeWidth="4" strokeLinecap="round" className={motor.running && motor.duty > 0 ? (motor.dir === 'F' ? 'gm-spin' : 'gm-spin gm-rev') : undefined} style={{ animationDuration: `${Math.max(0.15, 2 - motor.duty / 55)}s`, transformOrigin: '60px 40px' }} />
                <text x="110" y="34" fontSize="12" fill="var(--ink)" fontFamily="monospace">TIM3: PSC {motor.psc} ARR {motor.arr} CCR {motor.ccr}</text>
                <text x="110" y="54" fontSize="12" fill="var(--mute)" fontFamily="monospace">{motor.running ? 'RUN' : 'IDLE'} · {motor.duty}% · DIR {motor.dir} · {motor.freq} Hz</text>
              </svg>
            </>
          )}
        </>
      }
      side={
        <>
          {tab === 'frame' && <>
            <label className="sl"><span className="sl-h"><span>{t('Gönderilecek metin (≤ 4)', 'Text to send (≤ 4)')}</span></span><input className="gm-input" value={text} maxLength={4} onChange={(e) => { setText(e.target.value); setFlip(-1) }} /></label>
            <Select label={t('Parite', 'Parity')} value={parity} options={[['none', 'none (8N1)'], ['even', 'even'], ['odd', 'odd']]} onChange={(v) => { setParity(v); setFlip(-1) }} />
            <Select label={t('Stop biti', 'Stop bits')} value={stop} options={[[1, '1'], [2, '2']]} onChange={(v) => { setStop(v); setFlip(-1) }} />
            <Btn ghost onClick={() => setFlip(-1)}>{t('Bozmayı kaldır', 'Clear corruption')}</Btn>
          </>}
          {tab === 'brr' && <>
            <Select label="f_ck" value={fck} options={[[42e6, '42 MHz (APB1)'], [84e6, '84 MHz (APB2)'], [16e6, '16 MHz (HSI)'], [8e6, '8 MHz']]} onChange={setFck} />
            <Select label="baud" value={baud} options={[[9600, '9600'], [57600, '57600'], [115200, '115200'], [460800, '460800'], [921600, '921600']]} onChange={setBaud} />
          </>}
          {tab === 'cmd' && <div className="row">{['PWM 40', 'START', 'DIR R', 'STOP', 'DIR R', 'FREQ 1000', 'STATUS', 'JUMP'].map((q, i) => <button key={i} type="button" className="gm-chip" onClick={() => setLine(q)}>{q}</button>)}</div>}
        </>
      }
    />
  )
}

// ---------- 8. ADC + DMA ----------
function DmaSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [len, setLen] = useState(16)
  const [sampleUs, setSampleUs] = useState(10)
  const [cpuUs, setCpuUs] = useState(50)
  const samples = Array.from({ length: len * 4 }, (_, i) => adc12(1.65 + 1.2 * Math.sin(i / 5) + 0.15 * Math.sin(i * 7.3)))
  const r = simulateDma(samples, len, sampleUs, cpuUs)
  const total = samples.length * sampleUs
  const W = 560, x = (v: number) => 30 + (v / total) * 520
  const half = r.halfTimeUs
  let busy = 0
  const cpu = r.events.map((e) => { const s = Math.max(busy, e.t); busy = s + cpuUs; return { s, e: s + cpuUs, over: s > e.t + 1e-9 } })
  return (
    <Body
      stage={
        <>
          <svg viewBox={`0 0 ${W} 220`} className="sim-canvas gm-svg" role="img" aria-label="DMA" data-testid="stm-dma-svg">
            <polyline points={samples.map((s, i) => `${x((i + 1) * sampleUs)},${90 - (s / 4095) * 70}`).join(' ')} fill="none" stroke="var(--sim-a)" strokeWidth="1.5" />
            <text x="4" y="24" fontSize="10" fill="var(--mute)">ADC</text>
            {r.events.map((e, i) => <g key={i}><line x1={x(e.t)} x2={x(e.t)} y1="100" y2="130" stroke={e.kind === 'half' ? 'var(--gold)' : 'var(--sky)'} strokeWidth="2" /><text x={x(e.t)} y="142" fontSize="9" textAnchor="middle" fill={e.kind === 'half' ? 'var(--gold)' : 'var(--sky)'}>{e.kind === 'half' ? 'HT' : 'TC'}</text></g>)}
            <text x="4" y="186" fontSize="10" fill="var(--mute)">CPU</text>
            {cpu.map((c, i) => <rect key={i} x={x(c.s)} y="170" width={Math.max(1, x(c.e) - x(c.s))} height="22" fill={c.over ? 'var(--red)' : 'var(--green)'} opacity=".75" />)}
          </svg>
          <div className="gm-cells">{r.buf.map((v, i) => <span key={i} className={i < len / 2 ? 'lo' : 'hi'} title={String(v)}>{v}</span>)}</div>
          <Readout live>
            {t('yarım tampon süresi', 'half-buffer time')} = {len / 2} × {sampleUs} µs = {half} µs{'\n'}
            {t('işlemci yükü', 'CPU load')} = {cpuUs} / {half} = {nf(lang, 0)(r.cpuLoad * 100)}%{'\n'}
            {r.overruns ? <><Badge kind="error">overrun × {r.overruns}</Badge> {t('işlemci yetişemiyor', 'the CPU cannot keep up')}</> : <Badge kind="ok">{t('taşma yok', 'no overrun')}</Badge>}{'\n'}
            {t('son yarıların ortalaması', 'mean of the last halves')}: {r.events.slice(-2).map((e) => nf(lang, 0)(e.filled.reduce((a, b) => a + b, 0) / e.filled.length)).join(' / ')}
          </Readout>
        </>
      }
      side={
        <>
          <Select label={t('Tampon (hücre)', 'Buffer (cells)')} value={len} options={[[8, '8'], [16, '16'], [32, '32'], [64, '64']]} onChange={setLen} />
          <Slider label={t('Örnek aralığı', 'Sample interval')} value={sampleUs} min={2} max={40} onChange={setSampleUs} fmt={(v) => `${v} µs`} />
          <Slider label={t('Yarı başına işleme süresi', 'Processing time per half')} value={cpuUs} min={5} max={400} step={5} onChange={setCpuUs} fmt={(v) => `${v} µs`} />
        </>
      }
    />
  )
}

// ---------- 9. I²C / SPI ----------
function BusSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [tab, setTab] = useState<'i2c' | 'spi'>('i2c')
  const [addr, setAddr] = useState(0x76)
  const [read, setRead] = useState(true)
  const [present, setPresent] = useState(true)
  const [nbytes, setNbytes] = useState(1)
  const [mode, setMode] = useState(0), [slaveMode, setSlaveMode] = useState(0)
  const [byte, setByte] = useState(0xa5)
  const data = read ? [0x60, 0x12, 0x34].slice(0, nbytes) : [0xd0, 0xb6, 0x00].slice(0, nbytes)
  const w = i2cWave({ addr, read, data, present })
  const W = 560, x0 = 40, n = w.samples.length, dx = (W - x0 - 10) / n
  const cpol = (mode >> 1) as 0 | 1, cpha = (mode & 1) as 0 | 1
  const sw = spiWave(byte, byte ^ 0xff, cpol, cpha)
  const sdx = (W - x0 - 10) / sw.length
  const got = spiMismatch(byte, [(slaveMode >> 1) as 0 | 1, (slaveMode & 1) as 0 | 1], [cpol, cpha])
  return (
    <Body
      stage={
        <>
          <Tabs label="Bus" value={tab} tabs={[['i2c', 'I²C'], ['spi', 'SPI']]} onChange={setTab} />
          {tab === 'i2c' ? (
            <svg viewBox={`0 0 ${W} 170`} className="sim-canvas gm-svg" role="img" aria-label="I2C" data-testid="stm-i2c-svg">
              <text x="4" y="40" fontSize="11" fill="var(--ink)">SCL</text><text x="4" y="100" fontSize="11" fill="var(--ink)">SDA</text>
              <path d={wavePath(w.samples.map((s) => s.scl), x0, n * dx, 28, 52)} stroke="var(--sky)" strokeWidth="2" fill="none" />
              <path d={wavePath(w.samples.map((s) => s.sda), x0, n * dx, 88, 112)} stroke="var(--sim-a)" strokeWidth="2" fill="none" />
              {w.samples.map((s, i) => s.label ? <text key={i} x={x0 + i * dx} y="76" fontSize="11" fill="var(--red)" fontWeight="700">{s.label}</text> : null)}
              {w.fields.map((f, i) => <g key={i}><rect x={x0 + f.from * dx} y="124" width={(f.to - f.from) * dx - 2} height="20" rx="3" fill={f.text === 'NACK' ? 'var(--red)' : f.text === 'ACK' ? 'var(--green)' : 'var(--sim-grid)'} opacity={f.text.endsWith('ACK') ? 0.35 : 1} /><text x={x0 + ((f.from + f.to) / 2) * dx} y="138" fontSize="9.5" textAnchor="middle" fill="var(--ink)">{f.text}</text></g>)}
            </svg>
          ) : (
            <svg viewBox={`0 0 ${W} 210`} className="sim-canvas gm-svg" role="img" aria-label="SPI" data-testid="stm-spi-svg">
              {(['cs', 'sck', 'mosi', 'miso'] as const).map((k, r) => (
                <g key={k}>
                  <text x="4" y={34 + r * 46} fontSize="11" fill="var(--ink)">{k.toUpperCase()}</text>
                  <path d={wavePath(sw.map((s) => s[k]), x0, sw.length * sdx, 20 + r * 46, 42 + r * 46)} stroke={['var(--mute)', 'var(--sky)', 'var(--sim-a)', 'var(--gold)'][r]} strokeWidth="2" fill="none" />
                </g>
              ))}
              {sw.map((s, i) => s.sampleAt ? <line key={i} x1={x0 + i * sdx} x2={x0 + i * sdx} y1="62" y2="200" stroke="var(--red)" strokeDasharray="2 3" /> : null)}
            </svg>
          )}
          <Readout live>
            {tab === 'i2c'
              ? <>{w.acked ? <Badge kind="ok">ACK</Badge> : <Badge kind="error">NACK</Badge>} HAL {t('adresi', 'address')}: 0x{(addr << 1).toString(16).toUpperCase()} · {t('süre', 'time')} @100 kHz ≈ {Math.round(((data.length + 1) * 9 + 2) * 10)} µs</>
              : <>{t('kip', 'mode')} {mode} (CPOL {cpol}, CPHA {cpha}) · {t('köle kipi', 'slave mode')} {slaveMode}{'\n'}{t('gönderilen', 'sent')} 0x{byte.toString(16).padStart(2, '0')} → {t('okunan', 'read')} 0x{got.toString(16).padStart(2, '0')} {got === byte ? <Badge kind="ok">OK</Badge> : <Badge kind="error">{t('kip uyuşmazlığı', 'mode mismatch')}</Badge>}</>}
          </Readout>
        </>
      }
      side={tab === 'i2c' ? (
        <>
          <Select label={t('Adres (7 bit)', 'Address (7-bit)')} value={addr} options={[[0x76, '0x76 BME280'], [0x3c, '0x3C SSD1306'], [0x68, '0x68 MPU6050'], [0x50, '0x50 EEPROM']]} onChange={setAddr} />
          <Check label={t('Okuma (R/W = 1)', 'Read (R/W = 1)')} checked={read} onChange={setRead} />
          <Check label={t('Cihaz bağlı', 'Device present')} checked={present} onChange={setPresent} />
          <Slider label={t('Veri baytı', 'Data bytes')} value={nbytes} min={1} max={3} onChange={setNbytes} />
        </>
      ) : (
        <>
          <Select label={t('Efendi kipi', 'Master mode')} value={mode} options={[[0, '0 (CPOL0 CPHA0)'], [1, '1 (CPOL0 CPHA1)'], [2, '2 (CPOL1 CPHA0)'], [3, '3 (CPOL1 CPHA1)']]} onChange={setMode} />
          <Select label={t('Köle kipi', 'Slave mode')} value={slaveMode} options={[[0, '0'], [1, '1'], [2, '2'], [3, '3']]} onChange={setSlaveMode} />
          <Slider label="MOSI" value={byte} min={0} max={255} onChange={setByte} fmt={(v) => `0x${v.toString(16).padStart(2, '0')}`} />
        </>
      )}
    />
  )
}

// ---------- 10. Güç ----------
function PowerSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [mAh, setMah] = useState(2000)
  const [period, setPeriod] = useState(1000)
  const [active, setActive] = useState(10)
  const modes: PowerMode[] = ['run', 'sleep', 'stop', 'standby']
  const res = modes.map((m) => ({ m, r: m === 'run' ? batteryLife(mAh, period, period, 'run') : batteryLife(mAh, period, active, m) }))
  const maxLog = Math.log10(Math.max(...res.map((x) => x.r.hours)) + 1)
  return (
    <Body
      stage={
        <div className="gm-bars" data-testid="stm-power">
          {res.map(({ m, r }) => (
            <div key={m} className="gm-bar">
              <span className="gm-bar-l"><b>{m.toUpperCase()}</b><small>{MODE_TEXT[m][lang]}</small></span>
              <span className="gm-bar-track"><span className="pos" style={{ width: `${(Math.log10(r.hours + 1) / maxLog) * 100}%` }} /></span>
              <output>{r.days >= 2 ? `${nf(lang, 0)(r.days)} ${t('gün', 'd')}` : `${nf(lang, 1)(r.hours)} ${t('sa', 'h')}`}</output>
            </div>
          ))}
          <Readout>{res.map(({ m, r }) => `${m.padEnd(8)} ${MODE_MA[m]} mA · I_avg = ${nf(lang, 3)(r.avgMa)} mA · ${MODE_TEXT[m].inst}`).join('\n')}{'\n'}{t('Çubuklar logaritmik ölçekte.', 'Bars are on a log scale.')}</Readout>
        </div>
      }
      side={
        <>
          <Slider label={t('Pil', 'Battery')} value={mAh} min={200} max={5000} step={100} onChange={setMah} fmt={(v) => `${v} mAh`} />
          <Slider label={t('Periyot', 'Period')} value={period} min={100} max={60_000} step={100} onChange={setPeriod} fmt={(v) => `${nf(lang, 1)(v / 1000)} s`} />
          <Slider label={t('Uyanık süre', 'Awake time')} value={active} min={1} max={Math.min(500, period)} onChange={setActive} fmt={(v) => `${v} ms`} />
        </>
      }
    />
  )
}

// ---------- 11. FreeRTOS ----------
const SCEN: Record<'default' | 'overload' | 'inversion' | 'equal', Task[]> = {
  default: [{ name: 'motor', prio: 3, period: 5, wcet: 1 }, { name: 'uart', prio: 2, period: 10, wcet: 3 }, { name: 'log', prio: 1, period: 20, wcet: 4 }],
  overload: [{ name: 'motor', prio: 3, period: 5, wcet: 2 }, { name: 'uart', prio: 2, period: 10, wcet: 4 }, { name: 'log', prio: 1, period: 20, wcet: 6 }],
  inversion: [{ name: 'high', prio: 3, period: 40, wcet: 2, offset: 2, lockTicks: [0, 2] }, { name: 'mid', prio: 2, period: 40, wcet: 6, offset: 3 }, { name: 'low', prio: 1, period: 40, wcet: 4, lockTicks: [0, 4] }],
  equal: [{ name: 'a', prio: 2, period: 12, wcet: 3 }, { name: 'b', prio: 2, period: 12, wcet: 3 }, { name: 'c', prio: 1, period: 12, wcet: 2 }],
}
const TASK_COLOR = ['var(--red)', 'var(--sim-a)', 'var(--sky)', 'var(--gold)']
function RtosSim({ lang }: { lang: Lang }) {
  const t = tx(lang)
  const [scen, setScen] = useState<keyof typeof SCEN>('default')
  const [tasks, setTasks] = useState<Task[]>(SCEN.default)
  const [inh, setInh] = useState(false)
  const [slice, setSlice] = useState(true)
  const H = 40
  const r = schedule(tasks, H, { inheritance: inh, timeSlice: slice })
  const W = 560, x0 = 60, cw = (W - x0 - 10) / H
  const names = [...tasks.map((k) => k.name), 'idle']
  return (
    <Body
      stage={
        <>
          <svg viewBox={`0 0 ${W} ${names.length * 30 + 40}`} className="sim-canvas gm-svg" role="img" aria-label={t('Zamanlayıcı çizelgesi', 'Scheduler chart')} data-testid="stm-rtos-svg">
            {names.map((n, i) => <text key={n} x="6" y={24 + i * 30} fontSize="11" fill="var(--ink)">{n}</text>)}
            {r.timeline.map((rec) => {
              const i = names.indexOf(rec.run)
              return <rect key={rec.t} x={x0 + rec.t * cw} y={10 + i * 30} width={cw - 1} height="20" fill={rec.run === 'idle' ? 'var(--sim-grid)' : TASK_COLOR[i]} opacity=".85"><title>{`t=${rec.t} ${rec.run}${rec.event ? ' · ' + rec.event : ''}`}</title></rect>
            })}
            {tasks.flatMap((k, i) => Array.from({ length: Math.ceil(H / k.period) }, (_, j) => (k.offset ?? 0) + j * k.period).filter((tt) => tt < H).map((tt) => <path key={`${i}-${tt}`} d={`M${x0 + tt * cw},${8 + i * 30} l-3,-5 h6 z`} fill={TASK_COLOR[i]} />))}
            {r.misses.map((m, i) => <text key={i} x={x0 + m.at * cw} y={24 + names.indexOf(m.task) * 30} fontSize="12" fill="var(--red)" fontWeight="700">✗</text>)}
            {Array.from({ length: H / 5 + 1 }, (_, i) => <text key={i} x={x0 + i * 5 * cw} y={names.length * 30 + 30} fontSize="9" textAnchor="middle" fill="var(--mute)">{i * 5}</text>)}
          </svg>
          <Readout live>
            U = {nf(lang, 2)(r.util)} · RM {t('sınırı', 'bound')} = {nf(lang, 3)(rmBound(tasks.length))} · {t('boşta', 'idle')} {nf(lang, 0)(r.idlePct * 100)}% · {t('bağlam değişimi', 'context switches')} {r.switches}{'\n'}
            {t('en kötü yanıt', 'worst response')}: {tasks.map((k) => `${k.name} ${r.responseMax[k.name] ?? '—'}`).join(' · ')} tick{'\n'}
            {r.misses.length ? <Badge kind="error">{t('kaçan son tarih', 'missed deadlines')}: {r.misses.length}</Badge> : <Badge kind="ok">{t('tüm son tarihler tuttu', 'all deadlines met')}</Badge>}
          </Readout>
        </>
      }
      side={
        <>
          <Select label={t('Senaryo', 'Scenario')} value={scen} options={[['default', t('Motor + UART + günlük', 'Motor + UART + log')], ['overload', t('Aşırı yük', 'Overload')], ['inversion', t('Öncelik tersine dönmesi', 'Priority inversion')], ['equal', t('Eşit öncelik', 'Equal priority')]]} onChange={(s) => { setScen(s); setTasks(SCEN[s]) }} />
          {scen === 'inversion' && <Check label={t('Mutex öncelik kalıtımı', 'Mutex priority inheritance')} checked={inh} onChange={setInh} />}
          <Check label={t('Zaman dilimleme', 'Time slicing')} checked={slice} onChange={setSlice} />
          {tasks.map((k, i) => (
            <div key={k.name} className="gm-dev">
              <b className="gm-small" style={{ color: TASK_COLOR[i] }}>{k.name}{k.lockTicks ? ' (mutex)' : ''}</b>
              <Slider label={t('öncelik', 'priority')} value={k.prio} min={1} max={5} onChange={(v) => setTasks((s) => s.map((x, j) => (j === i ? { ...x, prio: v } : x)))} />
              <Slider label={t('süre (tick)', 'run time (ticks)')} value={k.wcet} min={1} max={10} onChange={(v) => setTasks((s) => s.map((x, j) => (j === i ? { ...x, wcet: v, lockTicks: x.lockTicks ? [0, Math.min(v, x.lockTicks[1])] : undefined } : x)))} />
              <Slider label={t('periyot (tick)', 'period (ticks)')} value={k.period} min={2} max={40} onChange={(v) => setTasks((s) => s.map((x, j) => (j === i ? { ...x, period: v } : x)))} />
            </div>
          ))}
        </>
      }
    />
  )
}

export function StmSim({ id, lang }: { id: StmSimId; lang: Lang; cfg: Cfg }) {
  switch (id) {
    case 'memmap': return <MemmapSim lang={lang} />
    case 'linker': return <LinkerSim lang={lang} />
    case 'regs': return <RegsSim lang={lang} />
    case 'clock': return <ClockSim lang={lang} />
    case 'pwm': return <PwmSim lang={lang} />
    case 'nvic': return <NvicSim lang={lang} />
    case 'uart': return <UartSim lang={lang} />
    case 'dma': return <DmaSim lang={lang} />
    case 'bus': return <BusSim lang={lang} />
    case 'power': return <PowerSim lang={lang} />
    case 'rtos': return <RtosSim lang={lang} />
  }
}

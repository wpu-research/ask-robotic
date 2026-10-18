// STM32 dersi saf mantığı: bellek haritası, GPIO yazmaçları, PLL, PWM, UART, ADC/DMA, EXTI/NVIC, I²C/SPI, FreeRTOS, güç.
import { describe, expect, it } from 'vitest'
import { ADDR, F407, F411, clockTree, computeIDR, contention, flashWaitStates, hex32, memoryUse, modeOf, peripheralAt, pinLevel, regionOf, registerCode, resetRegs, setMode, setOpenDrain, setPull, timerClock, toggleBit, usbOk, writeBSRR } from './core'
import { adc12, brr, ccrFor, codeToV, convTimeUs, decodeBits, frameBits, frameString, pwmBits, pwmDuty, pwmFreq, servoCcr, simulateDma, solvePwm } from './periph'
import { extiIrq, extiMap, exticr, simulateIrqs, splitPriority } from './irq'
import { i2cDurationUs, i2cWave, pullupMaxOhm, pullupMinOhm, spiMismatch, spiRead, spiWave } from './bus'
import { batteryLife, rmBound, schedule, utilization } from './rtos'

describe('bellek haritası', () => {
  it('bölgeler ve birimler', () => {
    expect(regionOf(ADDR.FLASH)?.name).toBe('Code / Flash')
    expect(regionOf(0x2000_1000)?.name).toBe('SRAM')
    expect(regionOf(ADDR.GPIOA + 0x14)?.name).toBe('Peripheral')
    expect(regionOf(ADDR.NVIC_ISER)?.name).toBe('Private Peripheral Bus')
    expect(peripheralAt(ADDR.GPIOA + 0x14)).toEqual({ name: 'GPIOA', offset: 0x14 })
    expect(hex32(0x40020014)).toBe('0x4002_0014')
  })
  it('bağlayıcı bölümleri: .data hem Flash hem RAM tutar', () => {
    const m = memoryUse({ text: 10_000, rodata: 2_000, data: 500, bss: 1_500, stack: 1024, heap: 512 }, 64, 20)
    expect(m.flash).toBe(12_500)
    expect(m.ram).toBe(3_536)
    expect(m.fits).toBe(true)
    expect(memoryUse({ text: 70_000, rodata: 0, data: 0, bss: 0, stack: 0, heap: 0 }, 64, 20).fits).toBe(false)
  })
})

describe('GPIO yazmaçları', () => {
  it('MODER 2 bit/pin; PA5 çıkış = 01 << 10', () => {
    const r = setMode(resetRegs(), 5, 'output')
    expect(r.MODER).toBe(1 << 10)
    expect(modeOf(r, 5)).toBe('output')
    expect(modeOf(setMode(r, 5, 'analog'), 5)).toBe('analog')
  })
  it('ODR ile push-pull çıkış pini sürer; BSRR atomik set/reset, ikisi birden: set kazanır', () => {
    let r = setMode(resetRegs(), 5, 'output')
    expect(pinLevel(r, 5, null)).toBe(0)
    r = { ...r, ODR: toggleBit(r.ODR, 5) }
    expect(pinLevel(r, 5, null)).toBe(1)
    r = writeBSRR(r, 1 << (5 + 16))
    expect(r.ODR).toBe(0)
    r = writeBSRR(r, (1 << 5) | (1 << 21))
    expect((r.ODR >> 5) & 1).toBe(1)
  })
  it('giriş: pull-up boşta 1, buton GND\'ye çekince 0; çekmesiz yüzer', () => {
    let r = setPull(resetRegs(), 13, 'up')
    expect(pinLevel(r, 13, null)).toBe(1)
    expect(pinLevel(r, 13, false)).toBe(0)
    r = setPull(r, 13, 'none')
    expect(pinLevel(r, 13, null)).toBe('float')
    expect((computeIDR(setPull(resetRegs(), 13, 'up'), []) >> 13) & 1).toBe(1)
    // analog kipte dijital tampon kapalı: 0 okunur
    expect(computeIDR(setMode(setPull(resetRegs(), 0, 'up'), 0, 'analog'), [], 0xffff) & 1).toBe(0)
  })
  it('open-drain: 1 yazınca yalnız pull-up ile 1; çakışma tespiti', () => {
    let r = setOpenDrain(setMode(resetRegs(), 6, 'output'), 6, true)
    r = writeBSRR(r, 1 << 6)
    expect(pinLevel(r, 6, null)).toBe('float')
    expect(pinLevel(setPull(r, 6, 'up'), 6, null)).toBe(1)
    const pp = writeBSRR(setMode(resetRegs(), 6, 'output'), 1 << 6)
    expect(contention(pp, 6, false)).toBe(true)
    expect(contention(r, 6, false)).toBe(false)
  })
  it('üretilen C kodu kipe uyar', () => {
    const c = registerCode('A', 5, writeBSRR(setMode(resetRegs(), 5, 'output'), 1 << 5))
    expect(c.reg.join('\n')).toContain('GPIOA->BSRR = 1U << (5);')
    expect(c.hal.join('\n')).toContain('GPIO_MODE_OUTPUT_PP')
    expect(registerCode('C', 13, setPull(resetRegs(), 13, 'up')).hal.join('\n')).toContain('HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13)')
  })
})

describe('RCC / PLL', () => {
  it('F407 klasik: HSE 8, M8 N336 P2 Q7 → 168 MHz, USB 48, APB1 42, APB2 84, zamanlayıcılar ×2', () => {
    const t = clockTree({ src: 'HSE', hse: 8, M: 8, N: 336, P: 2, Q: 7, ahb: 1, apb1: 4, apb2: 2 }, F407)
    expect(t.sys).toBe(168); expect(t.pclk1).toBe(42); expect(t.pclk2).toBe(84)
    expect(t.tim2).toBe(84); expect(t.tim1).toBe(168)
    expect(usbOk(t)).toBe(true)
    expect(t.errors).toHaveLength(0)
    expect(flashWaitStates(168)).toBe(5)
  })
  it('sınır aşımları raporlanır', () => {
    const t = clockTree({ src: 'HSE', hse: 8, M: 8, N: 336, P: 2, Q: 7, ahb: 1, apb1: 2, apb2: 2 }, F407)
    expect(t.errors.some((e) => e.en.startsWith('APB1'))).toBe(true)
    expect(clockTree({ src: 'HSI', hse: 0, M: 4, N: 100, P: 2, Q: 4, ahb: 1, apb1: 2, apb2: 1 }, F411).errors.some((e) => e.en.startsWith('VCO input'))).toBe(true)
    expect(timerClock(42, 1)).toBe(42)
  })
})

describe('zamanlayıcı ve PWM', () => {
  it('84 MHz, PSC 83, ARR 999 → 1 kHz; CCR 250 → %25', () => {
    expect(pwmFreq({ fTim: 84e6, psc: 83, arr: 999 })).toBeCloseTo(1000)
    expect(pwmDuty({ arr: 999, ccr: 250 })).toBe(0.25)
    expect(pwmDuty({ arr: 999, ccr: 2000 })).toBe(1)
    expect(pwmBits(999)).toBeCloseTo(9.97, 2)
    expect(ccrFor(0.5, 999)).toBe(500)
  })
  it('çözücü 16 bit sınırında en küçük PSC\'yi seçer', () => {
    const s = solvePwm(84e6, 20_000)!
    expect(s.psc).toBe(0); expect(s.arr).toBe(4199); expect(Math.abs(s.errPct)).toBeLessThan(0.01)
    const slow = solvePwm(84e6, 50)!
    expect(slow.arr).toBeLessThanOrEqual(0xffff)
    expect(Math.abs(slow.errPct)).toBeLessThan(0.1)
    expect(solvePwm(84e6, 0)).toBeNull()
    expect(servoCcr(90)).toBe(1500)
  })
})

describe('UART', () => {
  it('8N1 çerçeve: start 0, LSB önce, stop 1', () => {
    const b = frameBits(0x41, { parity: 'none', stop: 1 })
    expect(b.map((x) => x.v)).toEqual([0, 1, 0, 0, 0, 0, 0, 1, 0, 1])
    const e = frameBits(0x41, { parity: 'even', stop: 1 })
    expect(e[9]).toEqual({ v: 0, kind: 'parity' }) // iki adet 1: çift parite 0
  })
  it('çöz: doğru çerçeve, bozuk stop biti → FE, bozuk parite → PE', () => {
    const lv = frameString('OK', { parity: 'none', stop: 1 }).map((x) => x.v)
    expect(decodeBits(lv, { parity: 'none', stop: 1 }).map((d) => String.fromCharCode(d.byte))).toEqual(['O', 'K'])
    const bad = frameBits(0x55, { parity: 'none', stop: 1 }).map((x) => x.v); bad[9] = 0
    expect(decodeBits([1, ...bad, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], { parity: 'none', stop: 1 })[0].fe).toBe(true)
    const p = frameBits(0x55, { parity: 'odd', stop: 1 }).map((x) => x.v); p[9] ^= 1
    expect(decodeBits(p, { parity: 'odd', stop: 1 })[0].pe).toBe(true)
  })
  it('BRR: 84 MHz, 115200 → 45,5625 (0x2D9), hata < %0,1', () => {
    const r = brr(84e6, 115200)
    expect(r.mantissa).toBe(45); expect(r.fraction).toBe(9); expect(r.reg).toBe(0x2d9)
    expect(Math.abs(r.errPct)).toBeLessThan(0.1)
  })
})

describe('ADC ve DMA', () => {
  it('12 bit kod ve dönüşüm süresi', () => {
    expect(adc12(1.65)).toBe(2048); expect(adc12(5)).toBe(4095)
    expect(codeToV(4096)).toBeCloseTo(3.3)
    expect(convTimeUs(3, 21)).toBeCloseTo(15 / 21)
  })
  it('dairesel DMA: yarım/tam kesmeler sırayla, işlemci yetişmezse taşma', () => {
    const s = Array.from({ length: 64 }, (_, i) => i)
    const ok = simulateDma(s, 16, 10, 50)
    expect(ok.events.map((e) => e.kind).slice(0, 4)).toEqual(['half', 'full', 'half', 'full'])
    expect(ok.events[1].filled).toEqual([8, 9, 10, 11, 12, 13, 14, 15])
    expect(ok.overruns).toBe(0)
    expect(simulateDma(s, 16, 10, 120).overruns).toBeGreaterThan(0)
  })
})

describe('EXTI ve NVIC', () => {
  it('EXTI hatları pin numarasıdır; PA0 ve PB0 çakışır', () => {
    expect(extiMap([{ port: 'A', pin: 0 }, { port: 'B', pin: 0 }]).conflicts).toEqual([0])
    expect(extiMap([{ port: 'C', pin: 13 }, { port: 'A', pin: 7 }]).irqs.sort()).toEqual(['EXTI15_10_IRQn', 'EXTI9_5_IRQn'])
    expect(extiIrq(3)).toBe('EXTI3_IRQn')
    expect(exticr({ port: 'C', pin: 13 })).toEqual({ reg: 4, shift: 4, value: 2 })
  })
  it('öncelik grubu', () => {
    expect(splitPriority(4, 5, 0)).toEqual({ ok: true, raw: 5 << 4, preempt: 5, sub: 0 })
    expect(splitPriority(2, 5, 1).ok).toBe(false)
  })
  it('yüksek öncelik araya girer, düşük bekler; aynı kesmenin ikinci isteği kaybolur', () => {
    const irqs = [{ name: 'TIM2', preempt: 2, sub: 0, dur: 4 }, { name: 'EXTI0', preempt: 1, sub: 0, dur: 2 }, { name: 'USART2', preempt: 3, sub: 0, dur: 2 }]
    const r = simulateIrqs(irqs, [{ at: 1, irq: 'TIM2' }, { at: 2, irq: 'EXTI0' }, { at: 2.5, irq: 'USART2' }], 20)
    expect(r.maxDepth).toBe(2)
    const order = r.segs.filter((s) => s.who !== 'main' && s.who !== 'end').map((s) => s.who)
    expect(order.indexOf('EXTI0')).toBeLessThan(order.lastIndexOf('TIM2'))
    expect(order.indexOf('USART2')).toBeGreaterThan(order.lastIndexOf('TIM2'))
    const dup = simulateIrqs([{ name: 'A', preempt: 0, sub: 0, dur: 3 }, { name: 'B', preempt: 1, sub: 0, dur: 1 }], [{ at: 0, irq: 'A' }, { at: 0.5, irq: 'B' }, { at: 1, irq: 'B' }], 10)
    expect(dup.lost).toBe(1)
  })
})

describe('I²C ve SPI', () => {
  it('I²C: START, 8 adres biti, ACK, veri, STOP; cihaz yoksa NACK ve veri yok', () => {
    const w = i2cWave({ addr: 0x3c, read: false, data: [0xaf], present: true })
    expect(w.samples[1].label).toBe('S')
    expect(w.samples.at(-1)?.label).toBe('P')
    expect(w.fields.map((f) => f.text)).toEqual(['0x3c W', 'ACK', '0xaf', 'ACK'])
    // SCL yüksekken SDA değişmez (START/STOP hariç)
    const s = w.samples
    for (let i = 2; i < s.length - 1; i++) if (s[i].scl === 1 && s[i - 1].scl === 1) expect(s[i].sda).toBe(s[i - 1].sda)
    expect(i2cWave({ addr: 0x50, read: true, data: [1], present: false }).fields.map((f) => f.text)).toEqual(['0x50 R', 'NACK'])
    expect(i2cWave({ addr: 0x50, read: true, data: [1, 2], present: true }).fields.at(-1)?.text).toBe('NACK')
    expect(i2cDurationUs(3, 100)).toBeCloseTo(290)
    expect(pullupMaxOhm(200, false)).toBeGreaterThan(pullupMinOhm())
  })
  it('SPI: dört kipte de doğru kipte okunan bayt aynı; faz uyuşmazlığı bitleri kaydırır', () => {
    for (const [cpol, cpha] of [[0, 0], [0, 1], [1, 0], [1, 1]] as const) {
      const w = spiWave(0xa5, 0x3c, cpol, cpha)
      expect(spiRead(w, 'mosi')).toBe(0xa5); expect(spiRead(w, 'miso')).toBe(0x3c)
      expect(w.filter((x) => x.sampleAt).every((x) => x.sck === (cpha === 0 ? 1 - cpol : cpol))).toBe(true)
    }
    expect(spiMismatch(0x81, [0, 0], [0, 0])).toBe(0x81)
    expect(spiMismatch(0x81, [0, 0], [0, 1])).not.toBe(0x81)
  })
})

describe('FreeRTOS ve güç', () => {
  it('yüksek öncelik kesintiye uğratır; U ve RM sınırı', () => {
    const ts = [{ name: 'motor', prio: 3, period: 5, wcet: 1 }, { name: 'uart', prio: 2, period: 10, wcet: 3 }, { name: 'log', prio: 1, period: 20, wcet: 4 }]
    const r = schedule(ts, 40)
    expect(r.misses).toHaveLength(0)
    expect(r.timeline[0].run).toBe('motor')
    expect(r.timeline[5].run).toBe('motor')
    expect(utilization(ts)).toBeCloseTo(0.2 + 0.3 + 0.2)
    expect(rmBound(3)).toBeCloseTo(0.7798, 3)
    expect(r.idlePct).toBeCloseTo(0.3, 5)
  })
  it('aşırı yükte son tarih kaçar; eşit öncelikte zaman dilimleme', () => {
    expect(schedule([{ name: 'a', prio: 2, period: 4, wcet: 3 }, { name: 'b', prio: 1, period: 4, wcet: 2 }], 16).misses.length).toBeGreaterThan(0)
    const rr = schedule([{ name: 'a', prio: 1, period: 10, wcet: 3 }, { name: 'b', prio: 1, period: 10, wcet: 3 }], 6)
    expect(rr.timeline.slice(0, 4).map((x) => x.run)).toEqual(['a', 'b', 'a', 'b'])
    const fifo = schedule([{ name: 'a', prio: 1, period: 10, wcet: 3 }, { name: 'b', prio: 1, period: 10, wcet: 3 }], 6, { timeSlice: false })
    expect(fifo.timeline.slice(0, 4).map((x) => x.run)).toEqual(['a', 'a', 'a', 'b'])
  })
  it('öncelik tersine dönmesi: kalıtım yüksek önceliğin yanıt süresini kısaltır', () => {
    const ts = [
      { name: 'high', prio: 3, period: 40, wcet: 2, offset: 2, lockTicks: [0, 2] as [number, number] },
      { name: 'mid', prio: 2, period: 40, wcet: 6, offset: 3 },
      { name: 'low', prio: 1, period: 40, wcet: 4, lockTicks: [0, 4] as [number, number] },
    ]
    const without = schedule(ts, 30, { timeSlice: false })
    const withInh = schedule(ts, 30, { timeSlice: false, inheritance: true })
    expect(withInh.responseMax.high).toBeLessThan(without.responseMax.high)
  })
  it('düşük güç: stop kipi pil ömrünü uzatır', () => {
    const run = batteryLife(1000, 1000, 1000, 'run')
    const stop = batteryLife(1000, 1000, 10, 'stop')
    expect(run.hours).toBeCloseTo(50)
    expect(stop.hours).toBeGreaterThan(run.hours * 20)
  })
})

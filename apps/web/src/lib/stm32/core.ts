// STM32 (Cortex-M4, STM32F4 ailesi örnek alınarak) çekirdek modeli: bellek haritası, GPIO yazmaçları (MODER, OTYPER,
// PUPDR, IDR, ODR, BSRR), RCC saat ağacı ve PLL hesabı. Adresler ve bit düzeni RM0090/RM0368 başvuru kılavuzlarındaki
// düzendir; C0/G0/L4 gibi aileler aynı GPIO düzenini farklı taban adreslerle kullanır. Saf fonksiyonlar (core.test.ts).

/** Cortex-M'in sabit 4 GB adres haritası ve STM32F4'teki karşılıkları. */
export interface Region { name: string; start: number; end: number; tr: string; en: string }
export const MEMORY_MAP: readonly Region[] = [
  { name: 'Code / Flash', start: 0x0000_0000, end: 0x1fff_ffff, tr: 'Flash 0x0800_0000\'dan başlar; açılışta 0x0000_0000\'a eşlenir. Vektör tablosu ve program kodu burada.', en: 'Flash starts at 0x0800_0000 and is aliased to 0x0000_0000 at boot. The vector table and program code live here.' },
  { name: 'SRAM', start: 0x2000_0000, end: 0x3fff_ffff, tr: 'Değişkenler, yığın (stack) ve öbek (heap). .data ve .bss bölümleri buraya kopyalanır.', en: 'Variables, the stack and the heap. The .data and .bss sections are placed here.' },
  { name: 'Peripheral', start: 0x4000_0000, end: 0x5fff_ffff, tr: 'Çevre birimleri: APB1 (0x4000_0000), APB2 (0x4001_0000), AHB1 (0x4002_0000; GPIO, RCC, DMA).', en: 'Peripherals: APB1 (0x4000_0000), APB2 (0x4001_0000), AHB1 (0x4002_0000; GPIO, RCC, DMA).' },
  { name: 'External RAM', start: 0x6000_0000, end: 0x9fff_ffff, tr: 'Harici bellek denetleyicisi (FSMC/FMC) için.', en: 'For the external memory controller (FSMC/FMC).' },
  { name: 'External device', start: 0xa000_0000, end: 0xdfff_ffff, tr: 'Harici aygıtlar; çoğu küçük kartta boş.', en: 'External devices; empty on most small boards.' },
  { name: 'Private Peripheral Bus', start: 0xe000_0000, end: 0xffff_ffff, tr: 'Çekirdeğin kendi birimleri: NVIC 0xE000_E100, SysTick 0xE000_E010, SCB 0xE000_ED00.', en: 'The core\'s own blocks: NVIC 0xE000_E100, SysTick 0xE000_E010, SCB 0xE000_ED00.' },
]

/** Bilinen adresler (STM32F4). */
export const ADDR = {
  FLASH: 0x0800_0000, SRAM: 0x2000_0000, TIM2: 0x4000_0000, USART2: 0x4000_4400, I2C1: 0x4000_5400, TIM1: 0x4001_0000, USART1: 0x4001_1000,
  ADC1: 0x4001_2000, SPI1: 0x4001_3000, EXTI: 0x4001_3c00, GPIOA: 0x4002_0000, GPIOB: 0x4002_0400, GPIOC: 0x4002_0800, RCC: 0x4002_3800,
  DMA2: 0x4002_6400, SYSTICK: 0xe000_e010, NVIC_ISER: 0xe000_e100, SCB: 0xe000_ed00,
} as const

export const hex32 = (n: number) => `0x${(n >>> 0).toString(16).toUpperCase().padStart(8, '0').replace(/(.{4})$/, '_$1')}`
export const regionOf = (addr: number) => MEMORY_MAP.find((r) => addr >>> 0 >= r.start && addr >>> 0 <= r.end)
/** Bir adrese en yakın (altındaki) bilinen birim. */
export function peripheralAt(addr: number): { name: string; offset: number } | null {
  let best: { name: string; offset: number } | null = null
  for (const [name, base] of Object.entries(ADDR)) {
    const off = (addr >>> 0) - base
    if (off >= 0 && off < 0x400 && (!best || off < best.offset)) best = { name, offset: off }
  }
  return best
}

/** Bağlayıcı (linker) çıktısı: Flash = .text + .rodata + .data (ilk değerler), RAM = .data + .bss + yığın + öbek. */
export function memoryUse(s: { text: number; rodata: number; data: number; bss: number; stack: number; heap: number }, flashKb: number, ramKb: number) {
  const flash = s.text + s.rodata + s.data, ram = s.data + s.bss + s.stack + s.heap
  return { flash, ram, flashPct: flash / (flashKb * 1024), ramPct: ram / (ramKb * 1024), fits: flash <= flashKb * 1024 && ram <= ramKb * 1024 }
}

// ---------- GPIO ----------
export type Mode = 'input' | 'output' | 'af' | 'analog'
export const MODES: Mode[] = ['input', 'output', 'af', 'analog']
export type Pull = 'none' | 'up' | 'down'
export interface GpioRegs { MODER: number; OTYPER: number; PUPDR: number; IDR: number; ODR: number }
/** Sıfırlama değerleri (GPIOA'da PA13/14/15 hata ayıklama için AF; burada sadelik için 0 alınır, notlarda açıklanır). */
export const resetRegs = (): GpioRegs => ({ MODER: 0, OTYPER: 0, PUPDR: 0, IDR: 0, ODR: 0 })
export const GPIO_OFFSETS: Record<keyof GpioRegs | 'BSRR', number> = { MODER: 0x00, OTYPER: 0x04, PUPDR: 0x0c, IDR: 0x10, ODR: 0x14, BSRR: 0x18 }

const field = (reg: number, pin: number, width: number) => (reg >>> (pin * width)) & ((1 << width) - 1)
const setField = (reg: number, pin: number, width: number, v: number) => ((reg & ~(((1 << width) - 1) << (pin * width))) | (v << (pin * width))) >>> 0

export const modeOf = (r: GpioRegs, pin: number): Mode => MODES[field(r.MODER, pin, 2)]
export const setMode = (r: GpioRegs, pin: number, m: Mode): GpioRegs => ({ ...r, MODER: setField(r.MODER, pin, 2, MODES.indexOf(m)) })
export const pullOf = (r: GpioRegs, pin: number): Pull => (['none', 'up', 'down', 'none'] as const)[field(r.PUPDR, pin, 2)]
export const setPull = (r: GpioRegs, pin: number, p: Pull): GpioRegs => ({ ...r, PUPDR: setField(r.PUPDR, pin, 2, ['none', 'up', 'down'].indexOf(p)) })
export const openDrain = (r: GpioRegs, pin: number) => field(r.OTYPER, pin, 1) === 1
export const setOpenDrain = (r: GpioRegs, pin: number, od: boolean): GpioRegs => ({ ...r, OTYPER: setField(r.OTYPER, pin, 1, od ? 1 : 0) })
export const toggleBit = (v: number, bit: number) => (v ^ (1 << bit)) >>> 0
/** BSRR: alt 16 bit "set", üst 16 bit "reset"; ikisi birden 1 ise set kazanır. Tek yazma, oku-değiştir-yaz yok (atomik). */
export function writeBSRR(r: GpioRegs, value: number): GpioRegs {
  const set = value & 0xffff, reset = (value >>> 16) & 0xffff
  return { ...r, ODR: ((r.ODR & ~reset) | set) & 0xffff }
}

/** Dış dünya: pine ne bağlı? null = boşta (yüzer), true/false = bir buton/sinyal o seviyeyi sürüyor. */
export type Ext = boolean | null
/** Pinin fiziksel seviyesi: 1, 0 ya da 'float' (tanımsız). Çıkış kipinde ODR sürer; open-drain'de 1 yalnız pull-up ile. */
export function pinLevel(r: GpioRegs, pin: number, ext: Ext): 0 | 1 | 'float' {
  const m = modeOf(r, pin), pull = pullOf(r, pin)
  if (m === 'output') {
    const out = (r.ODR >>> pin) & 1
    if (!openDrain(r, pin)) return out ? 1 : 0
    if (!out) return 0
    if (ext !== null) return ext ? 1 : 0
    return pull === 'up' ? 1 : 'float'
  }
  if (m === 'analog') return 'float'
  if (ext !== null) return ext ? 1 : 0
  return pull === 'up' ? 1 : pull === 'down' ? 0 : 'float'
}
/** IDR'nin hesaplanması (dijital giriş tamponu analog kipte kapalıdır, 0 okunur). Yüzen pin rastgele okunur: burada 'noise' ile. */
export function computeIDR(r: GpioRegs, ext: Ext[], noise = 0): number {
  let idr = 0
  for (let pin = 0; pin < 16; pin++) {
    if (modeOf(r, pin) === 'analog') continue
    const lv = pinLevel(r, pin, ext[pin] ?? null)
    const bit = lv === 'float' ? (noise >>> pin) & 1 : lv
    idr |= bit << pin
  }
  return idr >>> 0
}
/** Çıkış ile dış sürücü çarpışması (kısa devre): push-pull çıkış 1 sürerken buton GND'ye çekiyor vb. */
export function contention(r: GpioRegs, pin: number, ext: Ext): boolean {
  if (modeOf(r, pin) !== 'output' || ext === null) return false
  const out = (r.ODR >>> pin) & 1
  if (openDrain(r, pin)) return out === 0 && ext === true
  return out !== (ext ? 1 : 0)
}

/** Yazmaç durumundan C kodu: aynı işi yapan kayıt düzeyi ve HAL satırları. */
export function registerCode(port: 'A' | 'B' | 'C', pin: number, r: GpioRegs): { reg: string[]; hal: string[] } {
  const m = modeOf(r, pin), pull = pullOf(r, pin), od = openDrain(r, pin), hi = ((r.ODR >>> pin) & 1) === 1
  const P = `GPIO${port}`
  const reg = [
    `RCC->AHB1ENR |= RCC_AHB1ENR_GPIO${port}EN;`,
    `${P}->MODER = (${P}->MODER & ~(3U << (${pin} * 2))) | (${MODES.indexOf(m)}U << (${pin} * 2));`,
  ]
  if (m === 'output') reg.push(`${P}->OTYPER ${od ? '|=' : '&='} ${od ? '' : '~'}(1U << ${pin});`)
  reg.push(`${P}->PUPDR = (${P}->PUPDR & ~(3U << (${pin} * 2))) | (${['none', 'up', 'down'].indexOf(pull)}U << (${pin} * 2));`)
  if (m === 'output') reg.push(`${P}->BSRR = 1U << (${pin}${hi ? '' : ' + 16'});`)
  if (m === 'input') reg.push(`uint32_t level = (${P}->IDR >> ${pin}) & 1U;`)
  const halMode = { input: 'GPIO_MODE_INPUT', output: od ? 'GPIO_MODE_OUTPUT_OD' : 'GPIO_MODE_OUTPUT_PP', af: 'GPIO_MODE_AF_PP', analog: 'GPIO_MODE_ANALOG' }[m]
  const hal = [
    `__HAL_RCC_GPIO${port}_CLK_ENABLE();`,
    `GPIO_InitTypeDef g = {0};`,
    `g.Pin = GPIO_PIN_${pin}; g.Mode = ${halMode}; g.Pull = ${{ none: 'GPIO_NOPULL', up: 'GPIO_PULLUP', down: 'GPIO_PULLDOWN' }[pull]};`,
    `HAL_GPIO_Init(${P}, &g);`,
  ]
  if (m === 'output') hal.push(`HAL_GPIO_WritePin(${P}, GPIO_PIN_${pin}, ${hi ? 'GPIO_PIN_SET' : 'GPIO_PIN_RESET'});`)
  if (m === 'input') hal.push(`GPIO_PinState level = HAL_GPIO_ReadPin(${P}, GPIO_PIN_${pin});`)
  return { reg, hal }
}

// ---------- RCC / PLL ----------
export interface PllCfg { src: 'HSI' | 'HSE'; hse: number; M: number; N: number; P: 2 | 4 | 6 | 8; Q: number; ahb: number; apb1: number; apb2: number }
/** STM32F407 sınırları (MHz). F401: 84/42/84, F411: 100/50/100. */
export interface Limits { sys: number; apb1: number; apb2: number }
export const F407: Limits = { sys: 168, apb1: 42, apb2: 84 }
export const F411: Limits = { sys: 100, apb1: 50, apb2: 100 }
export const HSI_MHZ = 16

export interface ClockTree { vcoIn: number; vco: number; sys: number; usb: number; hclk: number; pclk1: number; pclk2: number; tim1: number; tim2: number; errors: Array<{ tr: string; en: string }> }
/** Zamanlayıcı saati: APB bölücüsü 1 değilse çevre biriminin 2 katı (STM32F4 kuralı). */
export const timerClock = (pclk: number, apbDiv: number) => (apbDiv === 1 ? pclk : pclk * 2)

export function clockTree(c: PllCfg, lim: Limits = F407): ClockTree {
  const input = c.src === 'HSE' ? c.hse : HSI_MHZ
  const vcoIn = input / c.M, vco = vcoIn * c.N, sys = vco / c.P, usb = vco / c.Q
  const hclk = sys / c.ahb, pclk1 = hclk / c.apb1, pclk2 = hclk / c.apb2
  const errors: Array<{ tr: string; en: string }> = []
  if (c.M < 2 || c.M > 63) errors.push({ tr: 'PLLM 2..63 olmalı.', en: 'PLLM must be 2..63.' })
  if (vcoIn < 1 || vcoIn > 2) errors.push({ tr: `VCO girişi ${vcoIn.toFixed(2)} MHz: 1–2 MHz arası olmalı (2 MHz önerilir, titreşim az).`, en: `VCO input ${vcoIn.toFixed(2)} MHz: must be 1–2 MHz (2 MHz recommended, lower jitter).` })
  if (c.N < 50 || c.N > 432) errors.push({ tr: 'PLLN 50..432 olmalı.', en: 'PLLN must be 50..432.' })
  if (vco < 100 || vco > 432) errors.push({ tr: `VCO çıkışı ${vco.toFixed(0)} MHz: 100–432 MHz arası olmalı.`, en: `VCO output ${vco.toFixed(0)} MHz: must be 100–432 MHz.` })
  if (sys > lim.sys + 1e-9) errors.push({ tr: `SYSCLK ${sys.toFixed(1)} MHz, sınır ${lim.sys} MHz.`, en: `SYSCLK ${sys.toFixed(1)} MHz, limit ${lim.sys} MHz.` })
  if (pclk1 > lim.apb1 + 1e-9) errors.push({ tr: `APB1 ${pclk1.toFixed(1)} MHz, sınır ${lim.apb1} MHz: APB1 bölücüsünü büyüt.`, en: `APB1 ${pclk1.toFixed(1)} MHz, limit ${lim.apb1} MHz: raise the APB1 divider.` })
  if (pclk2 > lim.apb2 + 1e-9) errors.push({ tr: `APB2 ${pclk2.toFixed(1)} MHz, sınır ${lim.apb2} MHz.`, en: `APB2 ${pclk2.toFixed(1)} MHz, limit ${lim.apb2} MHz.` })
  return { vcoIn, vco, sys, usb, hclk, pclk1, pclk2, tim1: timerClock(pclk2, c.apb2), tim2: timerClock(pclk1, c.apb1), errors }
}
/** USB için tam 48 MHz gerekir. */
export const usbOk = (t: ClockTree) => Math.abs(t.usb - 48) < 1e-6
/** Flash bekleme durumu (3,3 V, RM0090 tablosu): her 30 MHz için bir bekleme. */
export const flashWaitStates = (hclk: number) => Math.max(0, Math.ceil(hclk / 30) - 1)

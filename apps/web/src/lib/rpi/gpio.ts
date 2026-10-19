// Raspberry Pi 40 pinli başlık: fiziksel pin ↔ BCM numarası, pin türleri, kablolama denetimi, PWM/servo hesapları ve
// derste kullanılan gpiozero programlarının adım adım benzetimi. Saf fonksiyonlar (gpio.test.ts).

export type PinKind = '3v3' | '5v' | 'gnd' | 'gpio' | 'id'
export interface HeaderPin { phys: number; kind: PinKind; bcm?: number; alt?: string }

const G = (phys: number, bcm: number, alt?: string): HeaderPin => ({ phys, kind: 'gpio', bcm, alt })
const P = (phys: number, kind: PinKind, alt?: string): HeaderPin => ({ phys, kind, alt })

/** Raspberry Pi 2/3/4/5 ve Zero için ortak 40 pinli başlık. */
export const HEADER: readonly HeaderPin[] = [
  P(1, '3v3'), P(2, '5v'), G(3, 2, 'SDA1'), P(4, '5v'), G(5, 3, 'SCL1'), P(6, 'gnd'), G(7, 4, 'GPCLK0 · 1-Wire'), G(8, 14, 'TXD'),
  P(9, 'gnd'), G(10, 15, 'RXD'), G(11, 17), G(12, 18, 'PWM0'), G(13, 27), P(14, 'gnd'), G(15, 22), G(16, 23),
  P(17, '3v3'), G(18, 24), G(19, 10, 'MOSI'), P(20, 'gnd'), G(21, 9, 'MISO'), G(22, 25), G(23, 11, 'SCLK'), G(24, 8, 'CE0'),
  P(25, 'gnd'), G(26, 7, 'CE1'), { phys: 27, kind: 'id', bcm: 0, alt: 'ID_SD' }, { phys: 28, kind: 'id', bcm: 1, alt: 'ID_SC' }, G(29, 5), P(30, 'gnd'), G(31, 6), G(32, 12, 'PWM0'),
  G(33, 13, 'PWM1'), P(34, 'gnd'), G(35, 19, 'PWM1 · MISO1'), G(36, 16), G(37, 26), G(38, 20, 'MOSI1'), P(39, 'gnd'), G(40, 21, 'SCLK1'),
]
export const pinAt = (phys: number) => HEADER.find((p) => p.phys === phys)
export const physOf = (bcm: number) => HEADER.find((p) => p.kind === 'gpio' && p.bcm === bcm)?.phys
/** Donanım PWM'i olan BCM pinleri (iki kanal: PWM0 = 12/18, PWM1 = 13/19). */
export const HW_PWM = [12, 13, 18, 19]

/** Bir GPIO pininden çekilmesi önerilen en yüksek akım (mA) ve mantık gerilimi. */
export const GPIO_MAX_MA = 16
export const LOGIC_V = 3.3

/** LED ön direnci: R = (V − Vf) / I (Ω). */
export const ledResistor = (vf: number, mA: number, v = LOGIC_V) => (v - vf) / (mA / 1000)
/** Verilen dirençle LED akımı (mA). */
export const ledCurrent = (vf: number, ohm: number, v = LOGIC_V) => Math.max(0, (v - vf) / ohm) * 1000

export type Device = 'led' | 'button' | 'buzzer' | 'servo'
export type Severity = 'ok' | 'warn' | 'error'
export interface WiringCheck { severity: Severity; tr: string; en: string }

/** Cihazın sinyal ucunu bir fiziksel pine bağlamanın sonucu. */
export function checkWiring(dev: Device, phys: number): WiringCheck {
  const pin = pinAt(phys)
  if (!pin) return { severity: 'error', tr: 'Böyle bir pin yok.', en: 'No such pin.' }
  if (pin.kind === '5v') return { severity: 'error', tr: '5 V pini bir güç çıkışıdır, GPIO değil. Buton buraya bağlanıp bir GPIO\'ya giderse pin 5 V görür: Pi\'nin GPIO\'ları yalnız 3,3 V dayanır.', en: '5 V is a power output, not a GPIO. A button wired here into a GPIO would put 5 V on the pin: the Pi\'s GPIOs tolerate only 3.3 V.' }
  if (pin.kind === '3v3') return { severity: 'error', tr: '3,3 V pini güç verir; programla açıp kapatamazsın.', en: '3.3 V is a power pin; you cannot switch it from code.' }
  if (pin.kind === 'gnd') return { severity: 'error', tr: 'GND pini toprak; sinyal ucu bir GPIO\'ya gitmeli.', en: 'GND is ground; the signal lead must go to a GPIO.' }
  if (pin.kind === 'id') return { severity: 'error', tr: 'ID_SD/ID_SC, HAT kartlarının EEPROM\'u için ayrılmıştır; kullanma.', en: 'ID_SD/ID_SC are reserved for the HAT EEPROM; do not use them.' }
  const bcm = pin.bcm!
  if (dev === 'servo' && !HW_PWM.includes(bcm)) return { severity: 'warn', tr: `GPIO${bcm} donanım PWM'i değil: gpiozero yazılım PWM'i kullanır, servo titreyebilir. GPIO12/13/18/19 seç ya da pigpio fabrikası kullan.`, en: `GPIO${bcm} has no hardware PWM: gpiozero falls back to software PWM and the servo may jitter. Pick GPIO12/13/18/19 or use the pigpio pin factory.` }
  if (pin.alt && /SDA|SCL|TXD|RXD|MOSI|MISO|SCLK|CE/.test(pin.alt)) return { severity: 'warn', tr: `GPIO${bcm} aynı zamanda ${pin.alt}. Bu veri yolunu kullanacaksan başka pin seç.`, en: `GPIO${bcm} is also ${pin.alt}. Pick another pin if you will use that bus.` }
  if (dev === 'buzzer') return { severity: 'ok', tr: `GPIO${bcm}: aktif buzzer küçük bir akım çeker; büyük buzzer için transistör kullan.`, en: `GPIO${bcm}: an active buzzer draws little current; use a transistor for a big one.` }
  return { severity: 'ok', tr: `GPIO${bcm} (fiziksel ${phys}) uygun.`, en: `GPIO${bcm} (physical ${phys}) is fine.` }
}

/** gpiozero AngularServo varsayılanları: −90°…+90° → 1…2 ms darbe, 50 Hz. */
export function servoPulseMs(angle: number, minMs = 1, maxMs = 2, minA = -90, maxA = 90): number {
  const a = Math.min(maxA, Math.max(minA, angle))
  return minMs + ((a - minA) / (maxA - minA)) * (maxMs - minMs)
}
export const dutyOf = (pulseMs: number, hz = 50) => (pulseMs / (1000 / hz))
/** PWM ortalama gerilimi. */
export const pwmAverage = (duty: number, v = LOGIC_V) => duty * v

export type Program = 'blink' | 'button-led' | 'alarm' | 'pwm-led' | 'servo-sweep'
export interface ProgMem { armed: boolean; lastBtn: boolean }
export interface ProgOut { led: number; buzzer: boolean; servo: number | null }
export const newMem = (): ProgMem => ({ armed: false, lastBtn: false })

/** Programın t anındaki çıkışları (t saniye). Düğme kenarları mem'de izlenir. */
export function stepProgram(prog: Program, t: number, button: boolean, mem: ProgMem): ProgOut {
  const rising = button && !mem.lastBtn
  mem.lastBtn = button
  switch (prog) {
    case 'blink': return { led: Math.floor(t / 0.5) % 2 === 0 ? 1 : 0, buzzer: false, servo: null }
    case 'button-led': return { led: button ? 1 : 0, buzzer: false, servo: null }
    case 'alarm': {
      if (rising) mem.armed = !mem.armed
      const beep = mem.armed && Math.floor(t / 0.2) % 2 === 0
      return { led: mem.armed ? 1 : 0, buzzer: beep, servo: null }
    }
    case 'pwm-led': { const ph = (t % 2) / 2; return { led: ph < 0.5 ? ph * 2 : 2 - ph * 2, buzzer: false, servo: null } }
    case 'servo-sweep': return { led: 0, buzzer: false, servo: Math.round(90 * Math.sin((2 * Math.PI * t) / 4)) }
  }
}

/** Programların gpiozero kaynağı; pin numaraları kablolamadan gelir. */
export function programSource(prog: Program, pins: Record<Device, number>): string {
  const b = (d: Device) => pinAt(pins[d])?.bcm ?? '?'
  switch (prog) {
    case 'blink': return `from gpiozero import LED\nfrom signal import pause\n\nled = LED(${b('led')})\nled.blink(on_time=0.5, off_time=0.5)\npause()`
    case 'button-led': return `from gpiozero import LED, Button\nfrom signal import pause\n\nled = LED(${b('led')})\nbutton = Button(${b('button')})   # pull_up=True\nbutton.when_pressed = led.on\nbutton.when_released = led.off\npause()`
    case 'alarm': return `from gpiozero import LED, Button, Buzzer\nfrom signal import pause\n\nled, buzzer = LED(${b('led')}), Buzzer(${b('buzzer')})\nbutton = Button(${b('button')}, bounce_time=0.05)\n\ndef toggle():\n    if led.is_lit:\n        led.off(); buzzer.off()\n    else:\n        led.on(); buzzer.beep(on_time=0.2, off_time=0.2)\n\nbutton.when_pressed = toggle\npause()`
    case 'pwm-led': return `from gpiozero import PWMLED\nfrom signal import pause\n\nled = PWMLED(${b('led')}, frequency=100)\nled.pulse(fade_in_time=1, fade_out_time=1)\npause()`
    case 'servo-sweep': return `from gpiozero import AngularServo\nfrom math import sin, pi\nfrom time import sleep, monotonic\n\nservo = AngularServo(${b('servo')}, min_angle=-90, max_angle=90)\nt0 = monotonic()\nwhile True:\n    servo.angle = round(90 * sin(2 * pi * (monotonic() - t0) / 4))\n    sleep(0.02)`
  }
}

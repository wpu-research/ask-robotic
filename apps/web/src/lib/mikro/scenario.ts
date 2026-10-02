// Senaryo: öğrencinin yapacağı etkileşimleri (düğme bas, salla, zaman ilerlet) başsız çalıştırır. Etkinlik testleri ve README örnekleri kullanır.
import type { Device } from './device'
import { Simulation, type SimOptions } from './sim'
import type { ButtonName, GestureName, MikroProject, PinName, RadioMessage } from './types'

export interface MikroScenario {
  /** Sanal zamanı ms ilerletir. */
  advance(ms: number): void
  /** Düğmeye `holdMs` süre basıp bırakır (kart numarası isteğe bağlı). */
  press(btn: ButtonName, holdMs?: number, card?: number): void
  shake(card?: number): void
  /** Hazır duruş/hareket: tiltLeft, tiltRight, tiltForward, tiltBack, faceUp, faceDown, freeFall, shake. */
  gesture(g: GestureName, card?: number): void
  touchLogo(holdMs?: number, card?: number): void
  touchPin(pin: PinName, holdMs?: number, card?: number): void
  setSensor(name: 'temperature' | 'light' | 'sound', v: number, card?: number): void
  setCompass(deg: number, card?: number): void
  setPinInput(pin: PinName, v: number, card?: number): void
  /** Dışarıdan radyo mesajı yollar. */
  radio(card: number, msg: Omit<RadioMessage, 'signal' | 'from'>): void
  /** Aygıt (kart) erişimi. */
  device(card?: number): Device
  readonly sim: Simulation
}

export function makeScenario(sim: Simulation): MikroScenario {
  const dev = (i = 0) => sim.cards[i].device
  const s: MikroScenario = {
    sim,
    advance: (ms) => { sim.advance(ms) },
    press(btn, holdMs = 100, card = 0) { dev(card).press(btn); sim.advance(holdMs); dev(card).release(btn); sim.advance(50) },
    shake(card = 0) { dev(card).perform('shake'); sim.advance(100) },
    gesture(g, card = 0) { dev(card).perform(g); sim.advance(100) },
    touchLogo(holdMs = 100, card = 0) { dev(card).setLogo(true); sim.advance(holdMs); dev(card).setLogo(false); sim.advance(50) },
    touchPin(pin, holdMs = 100, card = 0) { dev(card).setPinTouch(pin, true); sim.advance(holdMs); dev(card).setPinTouch(pin, false); sim.advance(50) },
    setSensor(name, v, card = 0) { dev(card).setSensor(name, v) },
    setCompass(deg, card = 0) { dev(card).setCompass(deg) },
    setPinInput(pin, v, card = 0) { dev(card).setPinInput(pin, v) },
    radio(card, msg) { sim.injectRadio(card, msg); sim.advance(50) },
    device: dev,
  }
  return s
}

/** Projeyi başlatır, senaryoyu çalıştırır (yoksa `defaultMs` bekler) ve benzetimi döndürür. */
export function runScenario(project: MikroProject, scenario?: (s: MikroScenario) => void, opts: SimOptions & { defaultMs?: number } = {}): Simulation {
  const sim = new Simulation(project, opts)
  sim.start()
  sim.advance(50)
  const s = makeScenario(sim)
  if (scenario) scenario(s)
  else sim.advance(opts.defaultMs ?? 3000)
  return sim
}

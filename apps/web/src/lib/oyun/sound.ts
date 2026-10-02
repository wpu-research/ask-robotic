// Ses: kendi sentezimiz (WebAudio). Hazır dosya yok. Veri kısmı saftır (Node'da test edilir); çalma kısmı yalnız tarayıcıda çalışır.
import { NOTES } from './blocks'
import type { SoundEvent } from './engine'

export interface ToneStep {
  /** Hz; `to` verilirse süre boyunca oraya kayar. */
  freq: number
  to?: number
  /** Başlangıç (ms) ve süre (ms). */
  at: number
  ms: number
  wave: 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise'
  vol?: number
}

const seq = (freqs: number[], step: number, ms: number, wave: ToneStep['wave'], vol = 0.12): ToneStep[] => freqs.map((f, i) => ({ freq: f, at: i * step, ms, wave, vol }))

export const MELODY_STEPS: Record<string, ToneStep[]> = {
  zafer: seq([523.25, 659.25, 783.99, 1046.5], 100, 140, 'square'),
  kayip: seq([392, 329.63, 261.63, 196], 170, 220, 'triangle', 0.2),
  ziplama: [{ freq: 260, to: 720, at: 0, ms: 130, wave: 'triangle', vol: 0.2 }],
  puan: [{ freq: 880, at: 0, ms: 70, wave: 'square', vol: 0.1 }, { freq: 1318.5, at: 70, ms: 110, wave: 'square', vol: 0.1 }],
  patlama: [{ freq: 0, at: 0, ms: 300, wave: 'noise', vol: 0.25 }],
  guc: seq([523.25, 659.25, 783.99, 987.77, 1046.5], 55, 90, 'square', 0.1),
  lazer: [{ freq: 1300, to: 180, at: 0, ms: 140, wave: 'sawtooth', vol: 0.1 }],
  baslangic: seq([261.63, 392, 523.25], 110, 160, 'square', 0.1),
}

export const noteFreq = (name: string): number => NOTES.find((n) => n.name === name)?.freq ?? 440

/** Bir ses olayının çalacağı notalar (test edilebilir). */
export function stepsOf(e: SoundEvent): ToneStep[] {
  if (e.kind === 'beep') return [{ freq: e.freq, at: 0, ms: e.ms, wave: 'square', vol: 0.12 }]
  if (e.kind === 'note') return [{ freq: noteFreq(e.note), at: 0, ms: e.ms, wave: 'triangle', vol: 0.2 }]
  return MELODY_STEPS[e.name] ?? []
}

export class OyunAudio {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  muted = false
  private lastAt = new Map<string, number>()

  private context(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      try { this.ctx = new Ctor() } catch { return null }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined)
    return this.ctx
  }

  /** Tarayıcı izin verirse ses bağlamını açar (bir tıklamada çağır). */
  unlock(): void { this.context() }

  play(e: SoundEvent): void {
    if (this.muted) return
    try {
      // aynı sesi çok sık çalma (kare başına yüzlerce olay kulağı patlatmasın)
      const key = e.kind === 'melody' ? `m:${e.name}` : e.kind === 'note' ? `n:${e.note}` : `b:${Math.round(e.freq)}`
      const nowMs = performance.now()
      if (nowMs - (this.lastAt.get(key) ?? -1e9) < 40) return
      this.lastAt.set(key, nowMs)
      const c = this.context()
      if (!c) return
      for (const s of stepsOf(e)) this.tone(c, s)
    } catch { /* ses çalınamadı: sorun değil */ }
  }

  private tone(c: AudioContext, s: ToneStep): void {
    const t = c.currentTime + s.at / 1000
    const dur = s.ms / 1000
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, s.vol ?? 0.12), t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    g.connect(c.destination)
    if (s.wave === 'noise') {
      if (!this.noise) {
        const len = Math.floor(c.sampleRate * 0.4)
        this.noise = c.createBuffer(1, len, c.sampleRate)
        const d = this.noise.getChannelData(0)
        let seed = 12345
        for (let i = 0; i < len; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; d[i] = (seed / 4294967296) * 2 - 1 }
      }
      const src = c.createBufferSource()
      src.buffer = this.noise
      src.connect(g)
      src.start(t)
      src.stop(t + dur + 0.02)
      return
    }
    const o = c.createOscillator()
    o.type = s.wave
    o.frequency.setValueAtTime(s.freq, t)
    if (s.to) o.frequency.exponentialRampToValueAtTime(s.to, t + dur)
    o.connect(g)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  dispose(): void { void this.ctx?.close().catch(() => undefined); this.ctx = null }
}

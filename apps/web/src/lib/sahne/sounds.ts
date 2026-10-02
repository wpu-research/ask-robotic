// Ses: hazır kısa sesler WebAudio ile SENTEZLENİR (ses dosyası yok, kayıt yok). Veri kısmı saftır (Node'da test edilir);
// çalma kısmı (SahneAudio) yalnız tarayıcıda çalışır.
import type { SoundRef } from './types'

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

const seq = (freqs: number[], step: number, ms: number, wave: ToneStep['wave'], vol = 0.14): ToneStep[] => freqs.map((f, i) => ({ freq: f, at: i * step, ms, wave, vol }))
const note = (freq: number): ToneStep[] => [
  { freq, at: 0, ms: 520, wave: 'triangle', vol: 0.26 },
  { freq: freq * 2, at: 0, ms: 260, wave: 'sine', vol: 0.06 },
]

export interface SoundGalleryItem { id: string; name: string; group: 'notalar' | 'efektler' | 'hayvanlar' | 'oyun'; steps: ToneStep[] }

export const SOUND_GALLERY: readonly SoundGalleryItem[] = [
  { id: 'do', name: 'Do', group: 'notalar', steps: note(261.63) },
  { id: 're', name: 'Re', group: 'notalar', steps: note(293.66) },
  { id: 'mi', name: 'Mi', group: 'notalar', steps: note(329.63) },
  { id: 'fa', name: 'Fa', group: 'notalar', steps: note(349.23) },
  { id: 'sol', name: 'Sol', group: 'notalar', steps: note(392) },
  { id: 'la', name: 'La', group: 'notalar', steps: note(440) },
  { id: 'si', name: 'Si', group: 'notalar', steps: note(493.88) },
  { id: 'do2', name: 'Tiz Do', group: 'notalar', steps: note(523.25) },
  { id: 'davul', name: 'Davul', group: 'efektler', steps: [{ freq: 140, to: 50, at: 0, ms: 220, wave: 'sine', vol: 0.4 }, { freq: 0, at: 0, ms: 60, wave: 'noise', vol: 0.12 }] },
  { id: 'zil', name: 'Zil', group: 'efektler', steps: [{ freq: 1760, at: 0, ms: 600, wave: 'sine', vol: 0.12 }, { freq: 2637, at: 0, ms: 420, wave: 'sine', vol: 0.07 }] },
  { id: 'alkis', name: 'Alkış', group: 'efektler', steps: [0, 90, 190, 260, 360, 430].map((at) => ({ freq: 0, at, ms: 70, wave: 'noise' as const, vol: 0.16 })) },
  { id: 'bip', name: 'Bip', group: 'efektler', steps: [{ freq: 880, at: 0, ms: 110, wave: 'square', vol: 0.1 }] },
  { id: 'pop', name: 'Pop', group: 'efektler', steps: [{ freq: 520, to: 1200, at: 0, ms: 70, wave: 'sine', vol: 0.25 }] },
  { id: 'lazer', name: 'Lazer', group: 'efektler', steps: [{ freq: 1300, to: 180, at: 0, ms: 200, wave: 'sawtooth', vol: 0.1 }] },
  { id: 'patlama', name: 'Patlama', group: 'efektler', steps: [{ freq: 0, at: 0, ms: 380, wave: 'noise', vol: 0.28 }] },
  { id: 'ziplama', name: 'Zıplama', group: 'oyun', steps: [{ freq: 260, to: 720, at: 0, ms: 150, wave: 'triangle', vol: 0.22 }] },
  { id: 'puan', name: 'Puan', group: 'oyun', steps: [{ freq: 880, at: 0, ms: 80, wave: 'square', vol: 0.1 }, { freq: 1318.5, at: 80, ms: 140, wave: 'square', vol: 0.1 }] },
  { id: 'kazan', name: 'Kazandın', group: 'oyun', steps: seq([523.25, 659.25, 783.99, 1046.5], 110, 150, 'square') },
  { id: 'kaybet', name: 'Kaybettin', group: 'oyun', steps: seq([392, 329.63, 261.63, 196], 180, 230, 'triangle', 0.22) },
  { id: 'miyav', name: 'Miyav', group: 'hayvanlar', steps: [{ freq: 560, to: 920, at: 0, ms: 160, wave: 'sawtooth', vol: 0.1 }, { freq: 920, to: 460, at: 160, ms: 260, wave: 'sawtooth', vol: 0.1 }] },
  { id: 'hav', name: 'Hav', group: 'hayvanlar', steps: [{ freq: 320, to: 180, at: 0, ms: 130, wave: 'square', vol: 0.12 }, { freq: 300, to: 170, at: 190, ms: 130, wave: 'square', vol: 0.12 }] },
  { id: 'cik', name: 'Cik cik', group: 'hayvanlar', steps: [0, 120, 240].map((at) => ({ freq: 2300, to: 3100, at, ms: 70, wave: 'sine' as const, vol: 0.1 })) },
]
export const SOUND_BY_ID: Readonly<Record<string, SoundGalleryItem>> = Object.fromEntries(SOUND_GALLERY.map((s) => [s.id, s]))
export const SOUND_GROUPS: readonly { id: SoundGalleryItem['group']; label: string }[] = [
  { id: 'notalar', label: 'Notalar' }, { id: 'efektler', label: 'Efektler' }, { id: 'oyun', label: 'Oyun' }, { id: 'hayvanlar', label: 'Hayvanlar' },
]

export const makeSound = (gid: string, name?: string): SoundRef => ({ name: name ?? SOUND_BY_ID[gid]?.name ?? gid, gid })

export const stepsEnd = (steps: ToneStep[]): number => steps.reduce((m, s) => Math.max(m, s.at + s.ms), 0)

/** Bir ses nesnesinin efektleri (hız, perde, ters) uygulanmış notaları. */
export function soundSteps(ref: SoundRef, extraPitch = 1): ToneStep[] {
  const base = SOUND_BY_ID[ref.gid]?.steps ?? []
  const speed = ref.speed && ref.speed > 0 ? ref.speed : 1
  const pitch = (ref.pitch && ref.pitch > 0 ? ref.pitch : 1) * extraPitch
  const gain = ref.gain === undefined ? 1 : Math.max(0, Math.min(1, ref.gain))
  const end = stepsEnd(base)
  return base.map((s) => {
    const at = ref.reverse ? end - (s.at + s.ms) : s.at
    return {
      ...s,
      at: at / speed,
      ms: Math.max(10, s.ms / speed),
      freq: s.freq * pitch,
      to: s.to ? s.to * pitch : undefined,
      vol: (s.vol ?? 0.12) * gain,
    }
  })
}
export const soundDuration = (ref: SoundRef, extraPitch = 1): number => stepsEnd(soundSteps(ref, extraPitch))

/** Dalga biçimi görüntüsü için genlik özeti (0..1, `n` sütun). */
export function envelope(steps: ToneStep[], n = 48): number[] {
  const total = Math.max(1, stepsEnd(steps))
  const out = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) / n) * total
    let a = 0
    for (const s of steps) {
      if (t < s.at || t > s.at + s.ms) continue
      const p = (t - s.at) / s.ms
      a += (s.vol ?? 0.12) * Math.exp(-3 * p) * (s.wave === 'noise' ? 0.8 + 0.2 * Math.sin(i * 12.9898) : 1)
    }
    out[i] = a
  }
  const mx = Math.max(0.0001, ...out)
  return out.map((v) => Math.min(1, v / mx))
}

/** MIDI nota numarası → Hz. */
export const midiFreq = (n: number): number => 440 * 2 ** ((n - 69) / 12)

export function noteSteps(midi: number, beats: number): ToneStep[] {
  const ms = Math.max(60, Math.min(4000, beats * 1000))
  return [{ freq: midiFreq(midi), at: 0, ms: ms * 0.95, wave: 'triangle', vol: 0.26 }, { freq: midiFreq(midi) * 2, at: 0, ms: ms * 0.5, wave: 'sine', vol: 0.05 }]
}

// ───────── Tarayıcı çalıcısı ─────────
export class SahneAudio {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  private live = new Set<{ stop: () => void }>()
  muted = false

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

  /** `volume` 0-1 (sprite ses seviyesi). */
  playSteps(steps: ToneStep[], volume = 1): void {
    if (this.muted || volume <= 0) return
    try {
      const c = this.context()
      if (!c) return
      for (const s of steps) this.tone(c, s, volume)
    } catch { /* ses çalınamadı: sorun değil */ }
  }

  stopAll(): void {
    for (const n of this.live) { try { n.stop() } catch { /* zaten durmuş */ } }
    this.live.clear()
  }

  private tone(c: AudioContext, s: ToneStep, volume: number): void {
    const t = c.currentTime + s.at / 1000
    const dur = s.ms / 1000
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, (s.vol ?? 0.12) * volume), t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    g.connect(c.destination)
    let node: AudioScheduledSourceNode
    if (s.wave === 'noise') {
      if (!this.noise) {
        const len = Math.floor(c.sampleRate * 0.5)
        this.noise = c.createBuffer(1, len, c.sampleRate)
        const d = this.noise.getChannelData(0)
        let seed = 12345
        for (let i = 0; i < len; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; d[i] = (seed / 4294967296) * 2 - 1 }
      }
      const src = c.createBufferSource()
      src.buffer = this.noise
      src.connect(g)
      node = src
    } else {
      const o = c.createOscillator()
      o.type = s.wave
      o.frequency.setValueAtTime(Math.max(20, s.freq), t)
      if (s.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, s.to), t + dur)
      o.connect(g)
      node = o
    }
    node.start(t)
    node.stop(t + dur + 0.02)
    const handle = { stop: () => { try { node.stop() } catch { /* */ } g.disconnect() } }
    this.live.add(handle)
    node.onended = () => { this.live.delete(handle); g.disconnect() }
  }

  dispose(): void { this.stopAll(); void this.ctx?.close().catch(() => undefined); this.ctx = null }
}

// Hoparlör: WebAudio ile ton çalar. Yalnız tarayıcıda; AudioContext ilk kullanıcı etkileşiminden sonra açılır.
import type { SoundHook } from './device'

let ctx: AudioContext | null = null
let muted = false
type AC = typeof AudioContext
const Ctor = (): AC | null => (typeof window === 'undefined' ? null : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext ?? null))

/** Kullanıcı etkileşimi içinde çağır (ör. ▶ düğmesi). */
export function unlockAudio() {
  const C = Ctor()
  if (!C) return
  try {
    ctx ??= new C()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch { /* ses yok */ }
}
export const isMuted = () => muted
export function setMuted(m: boolean) { muted = m }

/** Bir kart için ses kancası; her kartın kendi tek sesi vardır. */
export function makeSoundHook(): SoundHook {
  let cur: { osc: OscillatorNode; gain: GainNode } | null = null
  const stop = () => {
    if (!cur || !ctx) { cur = null; return }
    try {
      const t = ctx.currentTime
      cur.gain.gain.cancelScheduledValues(t)
      cur.gain.gain.setTargetAtTime(0, t, 0.01)
      cur.osc.stop(t + 0.05)
    } catch { /* yoksay */ }
    cur = null
  }
  return (e) => {
    if (e.kind === 'stop') { stop(); return }
    if (!ctx || muted || ctx.state !== 'running') return
    stop()
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = e.freq
      const peak = 0.02 + (e.volume / 255) * 0.16
      const t = ctx.currentTime
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(peak, t + 0.01)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(t)
      if (e.ms > 0) {
        const end = t + e.ms / 1000
        gain.gain.setValueAtTime(peak, Math.max(t + 0.02, end - 0.03))
        gain.gain.linearRampToValueAtTime(0, end)
        osc.stop(end + 0.02)
        cur = { osc, gain }
      } else cur = { osc, gain }
    } catch { cur = null }
  }
}

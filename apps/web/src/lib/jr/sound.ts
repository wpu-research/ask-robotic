// WebAudio ile üç kısa ses. Ek ses dosyası gerekmez; tarayıcı izin vermezse sessizce geçilir.
let ctx: AudioContext | null = null
let muted = false

export const setMuted = (m: boolean) => { muted = m }
export const isMuted = () => muted

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx ??= new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  const t = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

/** 1 = pop, 2 = zıplama, 3 = fanfar. */
export function playSound(n: number) {
  if (muted) return
  try {
    const c = context()
    if (!c) return
    if (n === 2) tone(c, 200, 0, 0.28, 'triangle', 0.22, 760)
    else if (n === 3) [523, 659, 784].forEach((f, i) => tone(c, f, i * 0.09, 0.16, 'square', 0.1))
    else tone(c, 900, 0, 0.12, 'sine', 0.25, 280)
  } catch { /* ses çalınamadı: sorun değil */ }
}

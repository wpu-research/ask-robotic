// Buzzer sesi (WebAudio). AudioContext yalnız ilk kullanıcı etkileşiminden sonra (resume) açılır.
let ctx: AudioContext | null = null
let osc: OscillatorNode | null = null
let gain: GainNode | null = null
let muted = false

type AC = typeof AudioContext
const Ctor = (): AC | null => (typeof window === 'undefined' ? null : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext ?? null))

/** Kullanıcı etkileşimi içinde çağır (ör. Çalıştır düğmesi). */
export function unlockAudio() {
  const C = Ctor()
  if (!C) return
  try {
    ctx ??= new C()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch { /* ses yok */ }
}

export function setBuzzerMuted(m: boolean) { muted = m; if (m) setBuzzer(false, 0) }
export const isBuzzerMuted = () => muted

export function setBuzzer(on: boolean, freqHz: number) {
  if (!ctx) return
  try {
    if (on && !muted && freqHz > 0) {
      if (!osc) {
        osc = ctx.createOscillator(); gain = ctx.createGain()
        osc.type = 'square'; gain.gain.value = 0.04
        osc.connect(gain); gain.connect(ctx.destination); osc.start()
      }
      osc.frequency.setTargetAtTime(Math.min(8000, Math.max(20, freqHz)), ctx.currentTime, 0.01)
    } else if (osc) {
      osc.stop(); osc.disconnect(); gain?.disconnect(); osc = null; gain = null
    }
  } catch { osc = null; gain = null }
}

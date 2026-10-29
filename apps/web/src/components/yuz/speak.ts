// Konuşan Yüz'ün sesi: önce sunucunun doğal sesi (/api/tts), olmazsa tarayıcı sesi.
// Dudak için `onLevel` her karede 0..1 ses seviyesi alır: doğal seste gerçek ses genliği, tarayıcı sesinde hece ritmi.
import { getDeviceId } from '@/lib/events'
import { pseudoSpeechLevel } from '@/lib/yuz/face'

export const MAX_SPEAK_CHARS = 500
type Locale = 'tr' | 'en'

export interface Speaking { stop: () => void; done: Promise<void> }

let audio: HTMLAudioElement | null = null
let ctx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let naturalBroken = false

/** Dokunma anında çağır (iOS/Safari ses kilidi): sessiz bir çalma ve AudioContext'i uyandırma. */
export function unlockAudio() {
  try {
    audio ??= new Audio()
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
      analyser = ctx.createAnalyser(); analyser.fftSize = 512
      ctx.createMediaElementSource(audio).connect(analyser)
      analyser.connect(ctx.destination)
    }
    void ctx.resume()
  } catch { /* ses yok: tarayıcı sesine düşer */ }
}

export const browserVoice = () => typeof window !== 'undefined' && 'speechSynthesis' in window

function rms(): number {
  if (!analyser) return 0
  const buf = new Uint8Array(analyser.fftSize)
  analyser.getByteTimeDomainData(buf)
  let s = 0
  for (const v of buf) { const x = (v - 128) / 128; s += x * x }
  return Math.sqrt(s / buf.length)
}

async function fetchNatural(text: string, locale: Locale): Promise<string> {
  const res = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, locale, deviceId: getDeviceId() }) })
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: string } | null
    if (err?.error === 'tts_disabled') naturalBroken = true
    throw new Error(err?.error ?? 'tts')
  }
  return URL.createObjectURL(await res.blob())
}

export function speak(raw: string, locale: Locale, onLevel: (v: number) => void): Speaking {
  const text = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_SPEAK_CHARS)
  let stopped = false
  let raf = 0
  let finish: () => void = () => {}
  const done = new Promise<void>((r) => { finish = r })
  const end = () => { cancelAnimationFrame(raf); onLevel(0); finish() }
  const stop = () => {
    stopped = true
    if (audio) { audio.pause(); audio.onended = null; audio.onerror = null }
    if (browserVoice()) window.speechSynthesis.cancel()
    end()
  }

  const viaBrowser = () => {
    if (stopped) return
    if (!browserVoice()) { end(); return }
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = locale === 'en' ? 'en-US' : 'tr-TR'
    const v = synth.getVoices().find((x) => x.lang.toLowerCase().startsWith(locale))
    if (v) u.voice = v
    u.pitch = 1.25; u.rate = 0.95
    const t0 = performance.now()
    const loop = () => { onLevel(pseudoSpeechLevel((performance.now() - t0) / 1000)); raf = requestAnimationFrame(loop) }
    u.onstart = () => { raf = requestAnimationFrame(loop) }
    u.onend = u.onerror = end
    synth.speak(u)
  }

  if (!text) { end(); return { stop, done } }
  if (naturalBroken || !analyser) { viaBrowser(); return { stop, done } }
  fetchNatural(text, locale).then((url) => {
    if (stopped) return
    const a = audio!
    a.onended = () => { URL.revokeObjectURL(url); end() }
    a.onerror = () => { URL.revokeObjectURL(url); viaBrowser() }
    a.src = url
    a.play().then(() => {
      const loop = () => { onLevel(rms()); raf = requestAnimationFrame(loop) }
      raf = requestAnimationFrame(loop)
    }).catch(viaBrowser)
  }).catch(viaBrowser)
  return { stop, done }
}

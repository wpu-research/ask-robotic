'use client'
import { createContext, createElement, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { useLocale } from '@/i18n/client'
import { getDeviceId } from '@/lib/events'

// Sesli anlatım ve Robi'nin sesi. Sunucuda doğal ses servisi (TTS_PROVIDER, /api/tts) varsa o çalınır; yoksa ya da
// hata verirse tarayıcının konuşma sentezi (Web Speech API, tr-TR / en-US). Okuma bilmeyen küçükler için şart.
// Tercih (açık/kapalı) tarayıcıda; hiçbir ses yolu yoksa düğme gizlenir.
const KEY = 'ask:voice:v1'
const EVENT = 'ask-voice'
const CHUNK = 1200 // /api/tts üst sınırı (lib/tts/quota.ts TTS_MAX_CHARS)

const read = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb) }

export const voiceSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window
const noop = () => () => {}

/** Sunucuda doğal ses servisi açık mı (kök yerleşimden; lib/tts/providers.ts ttsEnabled). */
const NaturalCtx = createContext(false)
export function VoiceProvider({ natural, children }: { natural: boolean; children: ReactNode }) {
  return createElement(NaturalCtx.Provider, { value: natural }, children)
}

// ---- Çalma kuyruğu (sayfa başına tek ses; yeni say() öncekini keser) ----
let audio: HTMLAudioElement | null = null
let generation = 0
/** Bu oturumda servis kapalı/yetkisiz döndüyse bir daha denenmez. */
let naturalBroken = false
const urls = new Map<string, string>() // metin → blob URL (aynı adım tekrar okununca yeniden indirilmez)
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

const ensureAudio = () => (audio ??= new Audio())

/** Uzun metni cümle sınırlarından ≤ 1200 karakterlik parçalara böler. */
export function chunkText(text: string, max = CHUNK): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean ? [clean] : []
  const out: string[] = []
  let cur = ''
  for (const s of clean.match(/[^.!?…]+[.!?…]*\s*/g) ?? [clean]) {
    if ((cur + s).length > max && cur) { out.push(cur.trim()); cur = '' }
    if (s.length > max) { for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max).trim()); continue }
    cur += s
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

async function fetchUrl(text: string, locale: string): Promise<string> {
  const k = `${locale}|${text}`
  const hit = urls.get(k)
  if (hit) return hit
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, locale, deviceId: getDeviceId() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: string } | null
    if (err?.error === 'tts_disabled') naturalBroken = true
    throw new Error(err?.error ?? 'tts')
  }
  const url = URL.createObjectURL(await res.blob())
  urls.set(k, url)
  if (urls.size > 80) { const [first, u] = urls.entries().next().value!; URL.revokeObjectURL(u); urls.delete(first) }
  return url
}

function playUrl(url: string, gen: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gen !== generation) return resolve()
    const a = ensureAudio()
    a.onended = () => resolve()
    a.onerror = () => reject(new Error('audio'))
    a.src = url
    a.play().catch(reject)
  })
}

function speakBrowser(text: string, locale: string) {
  if (!voiceSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const en = locale === 'en'
  u.lang = en ? 'en-US' : 'tr-TR'
  u.rate = 0.95
  const voices = synth.getVoices()
  const v = en
    ? voices.find((x) => x.lang.toLowerCase().replace('_', '-') === 'en-us') ?? voices.find((x) => x.lang.toLowerCase().startsWith('en'))
    : voices.find((x) => x.lang.toLowerCase().startsWith('tr'))
  if (v) u.voice = v
  synth.speak(u)
}

function stopAll() {
  generation++
  if (audio) { audio.pause(); audio.onended = null; audio.onerror = null }
  if (voiceSupported()) window.speechSynthesis.cancel()
}

async function speakNatural(text: string, locale: string, gen: number) {
  const parts = chunkText(text)
  // Sıradaki parçayı çalarken bir sonrakini indir
  let next = parts.length ? fetchUrl(parts[0], locale) : null
  for (let i = 0; i < parts.length; i++) {
    const url = await next!
    next = i + 1 < parts.length ? fetchUrl(parts[i + 1], locale) : null
    next?.catch(() => {}) // hata sırası gelince ele alınır
    if (gen !== generation) return
    await playUrl(url, gen)
  }
}

export function useVoice(): { supported: boolean; on: boolean; natural: boolean; toggle: () => void; say: (text: string) => void; stop: () => void } {
  const on = useSyncExternalStore(subscribe, read, () => false)
  const locale = useLocale()
  const natural = useContext(NaturalCtx)
  // Sunucuda false: düğme hidrasyondan sonra görünür (eşleşmezlik olmasın)
  const browser = useSyncExternalStore(noop, voiceSupported, () => false)
  const hydrated = useSyncExternalStore(noop, () => true, () => false)
  const stop = useCallback(() => stopAll(), [])
  const say = useCallback((text: string) => {
    if (!read() || !text.trim()) return
    stopAll()
    const gen = generation
    if (natural && !naturalBroken) {
      speakNatural(text, locale, gen).catch(() => { if (gen === generation) speakBrowser(text, locale) })
    } else speakBrowser(text, locale)
  }, [locale, natural])
  const toggle = useCallback(() => {
    const next = !read()
    try { localStorage.setItem(KEY, next ? '1' : '0') } catch { /* yoksay */ }
    if (next && natural) {
      // iOS Safari: ses öğesi bir kullanıcı dokunuşunda bir kez çalınınca sonraki (eşzamansız) çalmalar serbest kalır
      const a = ensureAudio()
      a.src = SILENT
      a.play().catch(() => {})
    }
    if (!next) stopAll()
    window.dispatchEvent(new Event(EVENT))
  }, [natural])
  return { supported: hydrated && (natural || browser), on, natural, toggle, say, stop }
}

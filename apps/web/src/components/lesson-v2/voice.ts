'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { useLocale } from '@/i18n/client'

// Sesli anlatım: tarayıcının konuşma sentezi (Web Speech API); arayüz diline göre Türkçe (tr-TR) ya da İngilizce (en-US) ses. Okuma bilmeyen küçükler için şart.
// Tercih tarayıcıda; ses yoksa düğme gizlenir.
const KEY = 'ask:voice:v1'
const EVENT = 'ask-voice'

const read = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb) }

export const voiceSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window
const noop = () => () => {}

export function useVoice(): { supported: boolean; on: boolean; toggle: () => void; say: (text: string) => void; stop: () => void } {
  const on = useSyncExternalStore(subscribe, read, () => false)
  const locale = useLocale()
  // Sunucuda false: düğme hidrasyondan sonra görünür (eşleşmezlik olmasın)
  const supported = useSyncExternalStore(noop, voiceSupported, () => false)
  const stop = useCallback(() => { if (voiceSupported()) window.speechSynthesis.cancel() }, [])
  const say = useCallback((text: string) => {
    if (!voiceSupported() || !read() || !text.trim()) return
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
  }, [locale])
  const toggle = useCallback(() => {
    const next = !read()
    try { localStorage.setItem(KEY, next ? '1' : '0') } catch { /* yoksay */ }
    if (!next) stop()
    window.dispatchEvent(new Event(EVENT))
  }, [stop])
  return { supported, on, toggle, say, stop }
}

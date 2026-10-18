// Mac'in doğal sesi: metinden konuşma (TTS) servisleri. Yalnız sunucu. Servis ve anahtar ortam değişkenlerinden:
//   TTS_PROVIDER = azure | google | elevenlabs | openai   (yoksa doğal ses kapalı; tarayıcı sesi kullanılır)
//   azure:      AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (ör. westeurope)
//   google:     GOOGLE_TTS_API_KEY
//   elevenlabs: ELEVENLABS_API_KEY (+ ELEVENLABS_MODEL, varsayılan eleven_multilingual_v2)
//   openai:     OPENAI_API_KEY (+ OPENAI_TTS_MODEL, varsayılan gpt-4o-mini-tts)
//   Ses seçimi (isteğe bağlı): TTS_VOICE_TR, TTS_VOICE_EN; ikisi için tek ses: TTS_VOICE (ElevenLabs'te ses kimliği).
// Hepsi MP3 döndürür.

export type TtsLocale = 'tr' | 'en'
export type TtsProviderName = 'azure' | 'google' | 'elevenlabs' | 'openai'
export const TTS_PROVIDERS: readonly TtsProviderName[] = ['azure', 'google', 'elevenlabs', 'openai']

/** Varsayılan sesler (TTS_VOICE_* ile değiştirilebilir). ElevenLabs çok dilli tek ses kullanır: Mac iki dilde de aynı karakter. */
export const DEFAULT_VOICES: Record<TtsProviderName, Record<TtsLocale, string>> = {
  azure: { tr: 'tr-TR-EmelNeural', en: 'en-US-JennyNeural' },
  google: { tr: 'tr-TR-Wavenet-A', en: 'en-US-Wavenet-F' },
  elevenlabs: { tr: '21m00Tcm4TlvDq8ikWAM', en: '21m00Tcm4TlvDq8ikWAM' },
  openai: { tr: 'coral', en: 'coral' },
}

const env = (k: string) => process.env[k]?.trim() || undefined

/** Yapılandırılmış servis; anahtarı eksikse null (doğal ses kapalı). */
export function ttsProvider(): TtsProviderName | null {
  const p = env('TTS_PROVIDER')?.toLowerCase() as TtsProviderName | undefined
  if (!p || !TTS_PROVIDERS.includes(p)) return null
  const ok = p === 'azure' ? !!(env('AZURE_SPEECH_KEY') && env('AZURE_SPEECH_REGION'))
    : p === 'google' ? !!env('GOOGLE_TTS_API_KEY')
    : p === 'elevenlabs' ? !!env('ELEVENLABS_API_KEY')
    : !!env('OPENAI_API_KEY')
  return ok ? p : null
}
export const ttsEnabled = () => ttsProvider() !== null

export function ttsVoice(p: TtsProviderName, locale: TtsLocale): string {
  return env(locale === 'en' ? 'TTS_VOICE_EN' : 'TTS_VOICE_TR') ?? env('TTS_VOICE') ?? DEFAULT_VOICES[p][locale]
}

export const xmlEscape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

export interface TtsRequest { url: string; init: RequestInit; /** Yanıt JSON içinde base64 ses (Google). */ base64Field?: string }

/** Servise gidecek HTTP isteği. Saf: test edilebilir, ağ yok. */
export function buildTtsRequest(p: TtsProviderName, text: string, locale: TtsLocale): TtsRequest {
  const voice = ttsVoice(p, locale)
  const lang = locale === 'en' ? 'en-US' : 'tr-TR'
  switch (p) {
    case 'azure':
      return {
        url: `https://${env('AZURE_SPEECH_REGION')}.tts.speech.microsoft.com/cognitiveservices/v1`,
        init: {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': env('AZURE_SPEECH_KEY')!,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'User-Agent': 'macademiax',
          },
          body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${xmlEscape(voice)}"><prosody rate="-5%">${xmlEscape(text)}</prosody></voice></speak>`,
        },
      }
    case 'google':
      return {
        url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env('GOOGLE_TTS_API_KEY')! },
          body: JSON.stringify({ input: { text }, voice: { languageCode: lang, name: voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 } }),
        },
        base64Field: 'audioContent',
      }
    case 'elevenlabs':
      return {
        url: `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`,
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': env('ELEVENLABS_API_KEY')!, Accept: 'audio/mpeg' },
          body: JSON.stringify({ text, model_id: env('ELEVENLABS_MODEL') ?? 'eleven_multilingual_v2' }),
        },
      }
    case 'openai':
      return {
        url: 'https://api.openai.com/v1/audio/speech',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('OPENAI_API_KEY')}` },
          body: JSON.stringify({
            model: env('OPENAI_TTS_MODEL') ?? 'gpt-4o-mini-tts',
            voice,
            input: text,
            response_format: 'mp3',
            instructions: locale === 'en'
              ? 'You are Mac, a friendly robot tutor for children. Speak clearly, warmly and a little slowly.'
              : 'Sen Mac\'sin, çocuklara ders anlatan sevimli bir robot. Türkçeyi doğal bir Türk aksanıyla, net, sıcak ve biraz yavaş konuş.',
          }),
        },
      }
  }
}

export class TtsError extends Error { constructor(public status: number, message: string) { super(message) } }

/** Metni sese çevirir (MP3). Hata: TtsError (status = servisin HTTP durumu; ağ hatası 0). */
export async function synthesize(p: TtsProviderName, text: string, locale: TtsLocale, signal?: AbortSignal): Promise<Uint8Array> {
  const { url, init, base64Field } = buildTtsRequest(p, text, locale)
  let res: Response
  try {
    res = await fetch(url, { ...init, signal: signal ?? AbortSignal.timeout(20_000) })
  } catch (e) {
    throw new TtsError(0, e instanceof Error ? e.message : 'network')
  }
  if (!res.ok) throw new TtsError(res.status, (await res.text().catch(() => '')).slice(0, 300))
  if (base64Field) {
    const data = await res.json().catch(() => null) as Record<string, unknown> | null
    const b64 = data?.[base64Field]
    if (typeof b64 !== 'string' || !b64) throw new TtsError(502, 'boş ses')
    return new Uint8Array(Buffer.from(b64, 'base64'))
  }
  const buf = new Uint8Array(await res.arrayBuffer())
  if (!buf.length) throw new TtsError(502, 'boş ses')
  return buf
}

// ---- Önbellek: ders anlatımı sabit metin; aynı cümle ikinci kez servise gitmez (bellek içi, en çok ~48 MB) ----
const CACHE_MAX_BYTES = 48 * 1024 * 1024
const cache = new Map<string, Uint8Array>()
let cacheBytes = 0

export function cacheGet(key: string): Uint8Array | undefined {
  const v = cache.get(key)
  if (v) { cache.delete(key); cache.set(key, v) } // en son kullanılan sona
  return v
}
export function cacheSet(key: string, v: Uint8Array) {
  if (v.length > CACHE_MAX_BYTES / 8) return
  const old = cache.get(key)
  if (old) { cacheBytes -= old.length; cache.delete(key) }
  cache.set(key, v); cacheBytes += v.length
  for (const [k, b] of cache) { if (cacheBytes <= CACHE_MAX_BYTES) break; cache.delete(k); cacheBytes -= b.length }
}
/** Yalnız testler için. */
export function resetTtsCache() { cache.clear(); cacheBytes = 0 }

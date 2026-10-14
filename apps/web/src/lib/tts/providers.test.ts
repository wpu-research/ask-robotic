import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildTtsRequest, cacheGet, cacheSet, resetTtsCache, synthesize, ttsProvider, ttsVoice, xmlEscape } from './providers'
import { chunkText } from '@/components/lesson-v2/voice'

const KEYS = ['TTS_PROVIDER', 'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION', 'GOOGLE_TTS_API_KEY', 'ELEVENLABS_API_KEY', 'OPENAI_API_KEY', 'TTS_VOICE', 'TTS_VOICE_TR', 'TTS_VOICE_EN']
afterEach(() => { for (const k of KEYS) delete process.env[k]; vi.unstubAllGlobals(); resetTtsCache() })

describe('ttsProvider', () => {
  it('servis + anahtar gerekir', () => {
    expect(ttsProvider()).toBeNull()
    process.env.TTS_PROVIDER = 'azure'
    expect(ttsProvider()).toBeNull()
    process.env.AZURE_SPEECH_KEY = 'k'; process.env.AZURE_SPEECH_REGION = 'westeurope'
    expect(ttsProvider()).toBe('azure')
    process.env.TTS_PROVIDER = 'bilinmeyen'
    expect(ttsProvider()).toBeNull()
  })
  it('ses seçimi: dile özel > ortak > varsayılan', () => {
    expect(ttsVoice('azure', 'tr')).toBe('tr-TR-EmelNeural')
    process.env.TTS_VOICE = 'ortak'
    expect(ttsVoice('azure', 'en')).toBe('ortak')
    process.env.TTS_VOICE_EN = 'en-ozel'
    expect(ttsVoice('azure', 'en')).toBe('en-ozel')
  })
})

describe('buildTtsRequest', () => {
  it('azure SSML kaçışlı', () => {
    process.env.AZURE_SPEECH_KEY = 'k'; process.env.AZURE_SPEECH_REGION = 'westeurope'
    const r = buildTtsRequest('azure', 'a < b & "c"', 'tr')
    expect(r.url).toBe('https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1')
    expect(String(r.init.body)).toContain('a &lt; b &amp; &quot;c&quot;')
    expect(String(r.init.body)).toContain('xml:lang="tr-TR"')
    expect(xmlEscape("'")).toBe('&apos;')
  })
  it('google, elevenlabs, openai gövdeleri', () => {
    process.env.GOOGLE_TTS_API_KEY = 'g'; process.env.ELEVENLABS_API_KEY = 'e'; process.env.OPENAI_API_KEY = 'o'
    const g = buildTtsRequest('google', 'Merhaba', 'tr')
    expect(JSON.parse(String(g.init.body)).voice).toEqual({ languageCode: 'tr-TR', name: 'tr-TR-Wavenet-A' })
    expect(g.base64Field).toBe('audioContent')
    expect(buildTtsRequest('elevenlabs', 'Hi', 'en').url).toContain('/v1/text-to-speech/')
    const o = JSON.parse(String(buildTtsRequest('openai', 'Hi', 'en').init.body))
    expect(o).toMatchObject({ model: 'gpt-4o-mini-tts', voice: 'coral', input: 'Hi', response_format: 'mp3' })
  })
})

describe('synthesize', () => {
  it('google base64 çözülür; hata durumu taşınır', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'g'
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ audioContent: Buffer.from('MP3').toString('base64') })))
    expect(Buffer.from(await synthesize('google', 'x', 'tr')).toString()).toBe('MP3')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 401 })))
    await expect(synthesize('google', 'x', 'tr')).rejects.toMatchObject({ status: 401 })
  })
})

describe('önbellek ve parçalama', () => {
  it('cacheGet/Set', () => {
    cacheSet('a', new Uint8Array([1, 2]))
    expect(cacheGet('a')).toEqual(new Uint8Array([1, 2]))
    expect(cacheGet('b')).toBeUndefined()
  })
  it('chunkText cümle sınırından böler, sınırı aşmaz', () => {
    expect(chunkText('  Kısa   metin. ')).toEqual(['Kısa metin.'])
    const long = Array.from({ length: 60 }, (_, i) => `Bu ${i}. cümle biraz uzunca bir cümledir.`).join(' ')
    const parts = chunkText(long, 200)
    expect(parts.length).toBeGreaterThan(1)
    expect(parts.every((p) => p.length <= 200)).toBe(true)
    expect(parts.join(' ')).toBe(long)
    expect(chunkText('x'.repeat(450), 200).map((p) => p.length)).toEqual([200, 200, 50])
  })
})

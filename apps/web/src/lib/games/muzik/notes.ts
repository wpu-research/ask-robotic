// Müzik oyunu: nota/süre modeli, kısa nota yazımı ve karşılaştırma yardımcıları. Saf TypeScript (DOM yok).

export type Inst = 'piyano' | 'flut' | 'keman' | 'zil'
export const INSTRUMENTS: readonly { id: Inst; label: string; labelEn: string }[] = [
  { id: 'piyano', label: 'piyano', labelEn: 'piano' },
  { id: 'flut', label: 'flüt', labelEn: 'flute' },
  { id: 'keman', label: 'keman', labelEn: 'violin' },
  { id: 'zil', label: 'zil', labelEn: 'bell' },
]

/** Bir vuruşun uzunluğu (ms, hız 1'de). 120 vuruş/dakika. */
export const BEAT_MS = 500
/** Bir programın çalabileceği en çok nota (sonsuz döngü koruması). */
export const MAX_EVENTS = 300

/** Olay: `p` MIDI numarası (null: sus), `t` başlangıç ve `d` süre vuruş olarak, `ch` kanal. */
export interface Ev { t: number; d: number; p: number | null; i: Inst; ch: number }

export interface MusicState {
  events: Ev[]
  /** Şimdiye kadar çalan en son vuruş (toplam uzunluk). */
  total: number
}

/** Solfej adları ve yarım ton uzaklıkları. `en`: İngilizce arayüzde gösterilen harf adı (yalnız görünüm). */
export const SOLFEGE = [
  { name: 'Do', id: 'do', semi: 0, en: 'C' },
  { name: 'Re', id: 're', semi: 2, en: 'D' },
  { name: 'Mi', id: 'mi', semi: 4, en: 'E' },
  { name: 'Fa', id: 'fa', semi: 5, en: 'F' },
  { name: 'Sol', id: 'sol', semi: 7, en: 'G' },
  { name: 'La', id: 'la', semi: 9, en: 'A' },
  { name: 'Si', id: 'si', semi: 11, en: 'B' },
] as const

export const midiOf = (semi: number, oct: number): number => 12 * (oct + 1) + semi

/** MIDI numarasından solfej adı ve oktav (diyatonik beyaz tuş yoksa null). */
export function solfegeOf(midi: number): { name: string; en: string; oct: number; diatonic: number } | null {
  const oct = Math.floor(midi / 12) - 1
  const semi = midi - 12 * (oct + 1)
  const idx = SOLFEGE.findIndex((s) => s.semi === semi)
  if (idx < 0) return null
  return { name: SOLFEGE[idx].name, en: SOLFEGE[idx].en, oct, diatonic: oct * 7 + idx }
}

export const OCT_LABELS: Record<number, string> = { 3: 'alçak', 4: 'orta', 5: 'tiz' }
export const OCT_LABELS_EN: Record<number, string> = { 3: 'low', 4: 'middle', 5: 'high' }

export interface Token { name: string; oct: number; dur: number }

/**
 * Kısa yazım: "Do Re Mi:2 -:1 Sol'" → boşlukla ayrılmış belirteçler.
 * `,` alçak oktav, `'` tiz oktav, `:süre` vuruş (varsayılan 1), `-` sus.
 */
export function parseTokens(src: string): Token[] {
  return src.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const m = /^(Do|Re|Mi|Fa|Sol|La|Si|-)([,']?)(?::(\d+(?:\.\d+)?))?$/.exec(tok)
    if (!m) throw new Error(`Geçersiz nota: ${tok}`)
    return { name: m[1], oct: m[2] === ',' ? 3 : m[2] === "'" ? 5 : 4, dur: m[3] ? Number(m[3]) : 1 }
  })
}

/** Belirteçlerden olay listesi (hedef melodi). */
export function eventsOf(src: string, opts: { i?: Inst; ch?: number; t0?: number } = {}): Ev[] {
  let t = opts.t0 ?? 0
  const out: Ev[] = []
  for (const k of parseTokens(src)) {
    if (k.name !== '-') {
      const semi = SOLFEGE.find((s) => s.name === k.name)!.semi
      out.push({ t, d: k.dur, p: midiOf(semi, k.oct), i: opts.i ?? 'piyano', ch: opts.ch ?? 0 })
    }
    t += k.dur
  }
  return out
}

export const notesOnly = (ev: readonly Ev[]): Ev[] =>
  ev.filter((e) => e.p !== null).sort((a, b) => a.t - b.t || (a.p as number) - (b.p as number) || a.d - b.d)

/** İki melodiyi karşılaştırır: null = aynı, aksi halde çocuk dostu fark açıklaması (`en`: İngilizcesi). */
export function compareMelodies(played: readonly Ev[], target: readonly Ev[], checkInst: boolean, en = false): string | null {
  const a = notesOnly(played), b = notesOnly(target)
  if (!a.length) return en ? 'You didn\'t play any notes. Add notes under the "start playing" block.' : 'Hiç nota çalmadın. Notaları "çalmaya başla" bloğunun altına ekle.'
  const n = Math.min(a.length, b.length)
  for (let k = 0; k < n; k++) {
    const x = a[k], y = b[k]
    if (x.p !== y.p) return en ? `Note ${k + 1} is different. Listen and try again.` : `${k + 1}. nota farklı. Dinle ve bir daha dene.`
    if (x.t !== y.t) return en ? `Note ${k + 1} plays at the wrong time. Check the lengths and rests.` : `${k + 1}. nota yanlış zamanda çalıyor. Süreleri ve susları kontrol et.`
    if (x.d !== y.d) return en ? `Note ${k + 1} has a different length.` : `${k + 1}. notanın süresi farklı.`
    if (checkInst && x.i !== y.i) return en ? `Note ${k + 1} was played with a different instrument.` : `${k + 1}. nota başka bir enstrümanla çalındı.`
  }
  if (a.length < b.length) return en ? `The melody is missing ${b.length - a.length} more note(s).` : `Melodi eksik: ${b.length - a.length} nota daha gerekiyor.`
  if (a.length > b.length) return en ? `You played too many notes: ${a.length - b.length} extra.` : `Fazla nota çaldın: ${a.length - b.length} nota fazla.`
  return null
}

export const freqOf = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12)

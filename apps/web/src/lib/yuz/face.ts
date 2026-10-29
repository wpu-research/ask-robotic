// Konuşan Yüz: duygu pozları ve animasyon matematiği. Saf modül (three.js yok), bu yüzden birim testle sınanır.

export const EMOTIONS = ['notr', 'mutlu', 'uzgun', 'saskin', 'kizgin'] as const
export type Emotion = (typeof EMOTIONS)[number]

/** Yüzün ayar noktaları. Hepsi sezgisel aralıkta: kaş yüksekliği/eğimi, göz kapağı, gülümseme (-1 üzgün … 1 gülen), ağız açıklığı, göz boyu. */
export interface Pose { browY: number; browTilt: number; lid: number; smile: number; open: number; eye: number }

export const POSES: Record<Emotion, Pose> = {
  notr: { browY: 0, browTilt: 0, lid: 0, smile: 0.25, open: 0, eye: 1 },
  mutlu: { browY: 0.05, browTilt: 0.05, lid: 0.12, smile: 1, open: 0.12, eye: 1 },
  uzgun: { browY: 0.04, browTilt: -0.45, lid: 0.3, smile: -0.85, open: 0, eye: 0.95 },
  saskin: { browY: 0.16, browTilt: 0, lid: 0, smile: 0, open: 0.55, eye: 1.25 },
  kizgin: { browY: -0.06, browTilt: 0.5, lid: 0.3, smile: -0.45, open: 0, eye: 0.9 },
}

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k
export function lerpPose(a: Pose, b: Pose, k: number): Pose {
  return { browY: lerp(a.browY, b.browY, k), browTilt: lerp(a.browTilt, b.browTilt, k), lid: lerp(a.lid, b.lid, k), smile: lerp(a.smile, b.smile, k), open: lerp(a.open, b.open, k), eye: lerp(a.eye, b.eye, k) }
}

/** Göz kırpma: her ~3,4 sn'de 0,16 sn süren kapanma (0 açık, 1 kapalı). */
export function blinkAt(t: number): number {
  const p = (t % 3.4) / 0.16
  return p >= 0 && p < 1 ? Math.sin(p * Math.PI) : 0
}

/** Ses seviyesinden (0..1) ağız açıklığı: hızlı açılır, yavaş kapanır; küçük gürültü kapıdan elenir. */
export function mouthFromLevel(level: number, prev: number): number {
  const target = level < 0.04 ? 0 : Math.min(1, level * 3.2)
  return target > prev ? lerp(prev, target, 0.6) : lerp(prev, target, 0.25)
}

/** Ses akışı yokken (tarayıcı sesi) konuşuyormuş gibi hece ritmi: 0..1. */
export function pseudoSpeechLevel(t: number): number {
  const v = Math.abs(Math.sin(t * 13)) * (0.55 + 0.45 * Math.sin(t * 3.1 + 1)) * (0.6 + 0.4 * Math.sin(t * 5.7))
  return Math.max(0, Math.min(1, v))
}

/** Metni duyguya yakıştırma: sorular şaşkın, ünlem mutlu, "üzgünüm" üzgün. Basit sezgi, yalnız yüze renk katar. */
export function emotionForText(text: string, locale: 'tr' | 'en' = 'tr'): Emotion {
  const s = text.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
  if (/üzgün|uzgun|sorry|sad|maalesef|unfortunately/.test(s)) return 'uzgun'
  if (/kızgın|kizgin|angry|sinir/.test(s)) return 'kizgin'
  if (/\?\s*$/.test(s.trim())) return 'saskin'
  if (/!|harika|süper|great|awesome|merhaba|hello|hi\b/.test(s)) return 'mutlu'
  return 'notr'
}

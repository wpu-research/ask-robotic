// Ders videoları (YouTube). DB'de değil, burada: migration gerekmez.
//
// Anahtar: "modül-slug:hafta:ders" (sıralar 1'den başlar) — lib/jr/activity.ts activityKey ve
// lib/lesson-titles-en.ts ile aynı biçim. Ortamdan ortama değişen /ders/<id> sayısı KULLANILMAZ.
// Bir dersin anahtarını bulmak için: modül slug'ı /moduller/<slug> adresinden, hafta ve ders sırası
// modül sayfasındaki sıradan (ör. Arduino Temelleri 1. hafta 3. ders → "arduino-temelleri:1:3").
//
// Girdi eklemek:
//   'arduino-temelleri:1:3': { youtubeId: 'dQw4w9WgXcQ', lang: 'tr', title: 'LED yakıp söndürme' },
// youtubeId, youtube.com/watch?v=<BURASI> ya da youtu.be/<BURASI> kısmıdır (11 karakter).
// Video youtube-nocookie.com üzerinden gömülür (izleyene kadar çerez yok). Girdi yoksa ders sayfasında video bölümü çıkmaz.

export interface LessonVideo {
  youtubeId: string
  /** Videonun konuşma dili; arayüz dilinden farklıysa küçük bir not gösterilir */
  lang: 'tr' | 'en'
  /** Ekran okuyucu ve iframe başlığı; yoksa ders başlığı kullanılır */
  title?: string
}

export const LESSON_VIDEOS: Readonly<Record<string, LessonVideo>> = {
}

const YOUTUBE_ID = /^[\w-]{11}$/

/** Dersin videosu; girdi yoksa ya da kimlik bozuksa null. */
export function lessonVideoFor(key: string | null | undefined, videos: Readonly<Record<string, LessonVideo>> = LESSON_VIDEOS): LessonVideo | null {
  if (!key || !Object.hasOwn(videos, key)) return null
  const v = videos[key]
  return YOUTUBE_ID.test(v.youtubeId) ? v : null
}

export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`

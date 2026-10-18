import { youtubeEmbedUrl, type LessonVideo as Video } from '@/lib/lesson-videos'

/**
 * Ders videosu: youtube-nocookie gömme, tembel yüklenen 16:9 iframe. Hook yok; hem sunucu (klasik ders)
 * hem istemci (v2 oynatıcı) bileşeninden metinler dışarıdan verilerek çizilir. Video yoksa hiçbir şey çizmez.
 */
export function LessonVideo({ video, heading, frameTitle, langNote, id = 'ders-video' }: {
  video: Video | null
  heading: string
  frameTitle: string
  /** Video dili arayüz dilinden farklıysa gösterilecek not */
  langNote?: string
  id?: string
}) {
  if (!video) return null
  return (
    <section className="lesson-video" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      {langNote && <p className="lesson-video-note">{langNote}</p>}
      <div className="lesson-video-frame">
        <iframe
          src={youtubeEmbedUrl(video.youtubeId)}
          title={frameTitle}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  )
}

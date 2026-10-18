import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LessonVideo } from './lesson-video'

const video = { youtubeId: 'dQw4w9WgXcQ', lang: 'tr' as const }

describe('LessonVideo', () => {
  it('video yoksa hiçbir şey çizmez', () => {
    expect(renderToString(<LessonVideo video={null} heading="Video" frameTitle="x" />)).toBe('')
  })
  it('çerezsiz, tembel yüklenen, başlıklı iframe çizer', () => {
    const h = renderToString(<LessonVideo video={video} heading="Video" frameTitle="Ders videosu: LED" />)
    expect(h).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0"')
    expect(h).toContain('loading="lazy"')
    expect(h).toContain('title="Ders videosu: LED"')
    expect(h).toContain('class="lesson-video-frame"')
    expect(h).toContain('aria-labelledby="ders-video"')
    expect(h).not.toContain('youtube.com/embed')
  })
  it('dil notu yalnız verildiğinde görünür', () => {
    expect(renderToString(<LessonVideo video={video} heading="Video" frameTitle="x" langNote="Video in Turkish" />)).toContain('Video in Turkish')
    expect(renderToString(<LessonVideo video={video} heading="Video" frameTitle="x" />)).not.toContain('lesson-video-note')
  })
})

import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { LessonMarkdown, stripSketchMarkers } from './lesson-markdown'

const blink = allModules.find((m) => m.slug === 'arduino-temelleri')!.weeks[0].lessons[2]
const render = (md: string) => renderToString(<LessonMarkdown>{md}</LessonMarkdown>)
const plain = (h: string) => h.replace(/<[^>]+>/g, '').replaceAll('&quot;', '"').replaceAll('&#x27;', "'")

describe('LessonMarkdown', () => {
  it('devre tablosunu <table> olarak çizer', () => {
    const html = render(blink.contentMd)
    expect(html).toContain('<table')
    expect(html).toContain('<th>Parça</th>')
  })
  it('kod bloğunu başlık çubuğu ve kopyala düğmesiyle çizer, sketch kodunu korur', () => {
    const html = render(blink.contentMd)
    expect(html).toContain('class="codeblock"')
    expect(html).toContain('Arduino C++')
    expect(html).toContain('Kopyala')
    expect(plain(html)).toContain('pinMode(13, OUTPUT);')
  })
  it('kod renklendirir (hljs sınıfları)', () => {
    expect(render(blink.contentMd)).toContain('hljs-')
  })
  it('denetleyici işaret satırını (// sketch: ad) öğrenciye göstermez', () => {
    expect(blink.contentMd).toContain('// sketch: blink')
    expect(plain(render(blink.contentMd))).not.toContain('sketch: blink')
  })
  it('işaret satırı yalnız kod bloğunun ilk satırından silinir, başka yorumlara dokunmaz', () => {
    const md = '```cpp\n// sketch: a\nint x; // sketch: not-a-marker\n```'
    expect(stripSketchMarkers(md)).toBe('```cpp\nint x; // sketch: not-a-marker\n```')
  })
  it('ham HTML çalıştırmaz', () => {
    expect(render('<script>alert(1)</script>')).not.toContain('<script>')
  })
})

import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { LessonMarkdown } from './lesson-markdown'

const blink = allModules.find((m) => m.slug === 'arduino-temelleri')!.weeks[0].lessons[2]

describe('LessonMarkdown', () => {
  it('devre tablosunu <table> olarak çizer', () => {
    const html = renderToString(<LessonMarkdown>{blink.contentMd}</LessonMarkdown>)
    expect(html).toContain('<table')
    expect(html).toContain('<th>Parça</th>')
  })
  it('kod bloğunu <pre><code> içinde çizer ve sketch kodunu korur', () => {
    const html = renderToString(<LessonMarkdown>{blink.contentMd}</LessonMarkdown>)
    expect(html).toContain('<pre>')
    expect(html).toContain('pinMode(13, OUTPUT);')
  })
  it('ham HTML çalıştırmaz', () => {
    const html = renderToString(<LessonMarkdown>{'<script>alert(1)</script>'}</LessonMarkdown>)
    expect(html).not.toContain('<script>')
  })
})

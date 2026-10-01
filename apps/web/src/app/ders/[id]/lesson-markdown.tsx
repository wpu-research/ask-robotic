'use client'

import { Children, isValidElement, useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

/** Derleme denetleyicisinin sketch işaret satırını (// sketch: ad) öğrenciye göstermeden kaldırır. */
export function stripSketchMarkers(md: string): string {
  return md.replace(/(```cpp\n)\/\/\s*sketch:\s*[\w-]+\n/g, '$1')
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

const LANG: Record<string, string> = { cpp: 'Arduino C++', c: 'C', python: 'Python', json: 'JSON', bash: 'Terminal' }

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const code = Children.toArray(children)[0]
  const cls = isValidElement<{ className?: string }>(code) ? code.props.className ?? '' : ''
  const lang = /language-(\w+)/.exec(cls)?.[1]
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textOf(children).replace(/\n$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* pano erişimi yok: sessizce geç */ }
  }
  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span>{lang ? LANG[lang] ?? lang : 'Kod'}</span>
        <button type="button" className="copy-btn" onClick={copy}>{copied ? 'Kopyalandı' : 'Kopyala'}</button>
      </div>
      <pre>{children}</pre>
    </div>
  )
}

// Ham HTML kapalıdır (react-markdown varsayılanı); GFM tabloları ve kod renklendirme açık.
export function LessonMarkdown({ children }: { children: string }) {
  return (
    <div className="lesson-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false }]]}
        components={{ pre: CodeBlock }}
      >
        {stripSketchMarkers(children)}
      </ReactMarkdown>
    </div>
  )
}

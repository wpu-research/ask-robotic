// Salt okunur kod görünümü için çok küçük sözdizimi renklendirici (JS ve Python).
import type { ReactNode } from 'react'
import type { Lang } from '@/lib/mikro/codegen'

const KW_JS = new Set(['let', 'function', 'if', 'else', 'for', 'while', 'return', 'true', 'false', 'of', 'break', 'continue'])
const KW_PY = new Set(['def', 'if', 'elif', 'else', 'for', 'while', 'return', 'True', 'False', 'and', 'or', 'not', 'in', 'pass', 'global', 'from', 'import', 'break', 'continue', 'range'])
const API = new Set(['card', 'screen', 'input', 'music', 'radio', 'pins', 'console', 'lists'])

const TOKEN = /(\/\/.*|#.*)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g

export function highlightLine(line: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = []
  const kw = lang === 'js' ? KW_JS : KW_PY
  let last = 0
  let m: RegExpExecArray | null
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const [tok, com, str, num, id] = m
    const k = out.length
    if (com) out.push(<span key={k} className="tk-c">{tok}</span>)
    else if (str) out.push(<span key={k} className="tk-s">{tok}</span>)
    else if (num) out.push(<span key={k} className="tk-n">{tok}</span>)
    else if (id && kw.has(id)) out.push(<span key={k} className="tk-k">{tok}</span>)
    else if (id && API.has(id) && line[m.index + tok.length] === '.') out.push(<span key={k} className="tk-a">{tok}</span>)
    else out.push(tok)
    last = m.index + tok.length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export function CodeView({ code, lang }: { code: string; lang: Lang }) {
  const lines = code.replace(/\n$/, '').split('\n')
  return (
    <pre className="mk-code" data-testid={`mikro-code-${lang}`} tabIndex={0} aria-label={lang === 'js' ? 'JavaScript kodu' : 'Python kodu'}>
      {lines.map((l, i) => (
        <div key={i} className="mk-code-line"><span className="mk-code-no" aria-hidden="true">{i + 1}</span><span>{highlightLine(l, lang)}{l === '' ? ' ' : ''}</span></div>
      ))}
    </pre>
  )
}

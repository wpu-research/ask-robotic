import { Fragment, type ReactNode } from 'react'

/** Satır içi Markdown: `kod`, **kalın**, _eğik_ ve satır sonları. Adım metinleri kısa olduğundan blok Markdown gerekmez. */
export function InlineMd({ text }: { text: string }) {
  return <>{text.split('\n').map((line, i) => <Fragment key={i}>{i > 0 && <br />}{inline(line)}</Fragment>)}</>
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|_([^_]+)_/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index))
    if (m[1] !== undefined) out.push(<code key={m.index}>{m[1]}</code>)
    else if (m[2] !== undefined) out.push(<strong key={m.index}>{m[2]}</strong>)
    else out.push(<em key={m.index}>{m[3]}</em>)
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}

/** Konuşma sentezi için düz metin. */
export const plain = (s: string) => s.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/_([^_]+)_/g, '$1')

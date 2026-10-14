import { Fragment, type ReactNode } from 'react'

/** Sözlük metnindeki `{ad}` yer tutucularını öğelerle (bağlantı vb.) değiştirir: rich(t('…'), { form: <Link/> }). */
export function rich(text: string, parts: Record<string, ReactNode>): ReactNode[] {
  return text.split(/(\{\w+\})/).filter(Boolean).map((seg, i) => {
    const m = seg.match(/^\{(\w+)\}$/)
    return <Fragment key={i}>{m && m[1] in parts ? parts[m[1]] : seg}</Fragment>
  })
}

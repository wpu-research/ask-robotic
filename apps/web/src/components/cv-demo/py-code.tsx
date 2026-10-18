// Python kod bloğu (sunucuda çizilir): satır numaraları ve küçük renklendirici (yorum, metin, sayı, anahtar sözcük, kütüphane).
const RE = /(f?'[^']*'|f?"[^"]*")|(\b\d+(?:\.\d+)?\b)|\b(import|from|as|for|in|while|True|False|None|if|else|elif|break|continue|return|def|and|or|not|lambda|is)\b|\b(print|len|range|min|max|abs|sum|int|float|tuple|np|cv2|mp|math|time)\b/g

function Line({ src }: { src: string }) {
  let hash = -1, q: string | null = null
  for (let i = 0; i < src.length; i++) { const ch = src[i]; if (q) { if (ch === q) q = null } else if (ch === '"' || ch === "'") q = ch; else if (ch === '#') { hash = i; break } }
  const code = hash >= 0 ? src.slice(0, hash) : src, comment = hash >= 0 ? src.slice(hash) : ''
  const parts: React.ReactNode[] = []
  let last = 0, m: RegExpExecArray | null, k = 0
  RE.lastIndex = 0
  while ((m = RE.exec(code))) {
    if (m.index > last) parts.push(code.slice(last, m.index))
    parts.push(<span key={k++} className={m[1] ? 'py-s' : m[2] ? 'py-n' : m[3] ? 'py-k' : 'py-b'}>{m[0]}</span>)
    last = m.index + m[0].length
  }
  if (last < code.length) parts.push(code.slice(last))
  if (comment) parts.push(<span key="c" className="py-c">{comment}</span>)
  return <>{parts}</>
}

export function PyCode({ code, title }: { code: string; title: string }) {
  return (
    <div className="cvd-code">
      <div className="cvd-code-head"><span className="cvd-dots" aria-hidden="true"><i /><i /><i /></span><b>{title}</b></div>
      <ol>{code.split('\n').map((l, i) => <li key={i}><code><Line src={l} /></code></li>)}</ol>
    </div>
  )
}

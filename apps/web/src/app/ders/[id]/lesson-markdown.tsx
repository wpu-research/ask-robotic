import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Devre tabloları (GFM) ve kod blokları için. Ham HTML kapalıdır (react-markdown varsayılanı).
export function LessonMarkdown({ children }: { children: string }) {
  return (
    <div className="lesson-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

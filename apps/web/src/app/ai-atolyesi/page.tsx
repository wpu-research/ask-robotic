import type { Metadata } from 'next'
import { AiGallery } from '@/components/ai/ai-gallery'

export const metadata: Metadata = { title: 'Yapay Zekâ Atölyesi' }

export default function AiAtolyesi() {
  return (
    <div className="page page-tool">
      <header className="page-title">
        <h1>Yapay Zekâ Atölyesi</h1>
        <p className="muted">
          Yapay zekâ mühendisliğinin temel fikirlerini kendin dene: token ve BPE, sonraki kelime olasılığı ve sıcaklık, metin benzerliği, RAG hattı, ajan döngüsü, prompt denetimi, prompt injection, eval ve halüsinasyon. Her şey tarayıcında çalışır; dış servis ya da anahtar yok. Hesaplar gerçektir, bir modelin yerini tutan adımlar ise açıkça "simülasyon" diye etiketlidir.
        </p>
      </header>
      <div className="tool-body">
        <AiGallery />
      </div>
    </div>
  )
}

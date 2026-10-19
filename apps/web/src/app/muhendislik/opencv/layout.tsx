// OpenCV dersi ESOF 323'ün görünümünü (robotik.css) paylaşır; üstüne ortak ders ekleri (kurs.css).
import '../robotik/robotik.css'
import '@/components/kurs/kurs.css'

export default function OpencvLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

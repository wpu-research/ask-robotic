// IoT dersi ESOF 323 / drone görünümünü (robotik.css) ve ünite tabanlı derslerin ortak eklerini (kurs.css) kullanır.
import '../robotik/robotik.css'
import '@/components/kurs/kurs.css'

export default function IotLayout({ children }: { children: React.ReactNode }) {
  return <div className="ks-root">{children}</div>
}

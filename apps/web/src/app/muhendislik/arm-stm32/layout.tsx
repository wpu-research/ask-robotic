// Gömülü kurs sayfaları ESOF 323 ve Drone dersinin görünümünü paylaşır; üstüne gomulu.css (simülasyon denetimleri).
import '../robotik/robotik.css'
import '../drone/drone.css'
import '../gomulu.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="dr-root">{children}</div>
}

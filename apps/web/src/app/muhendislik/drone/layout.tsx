// Drone dersi ESOF 323'ün hafta/simülasyon/test bileşenlerini ve görünümünü paylaşır; üstüne yalnız kendi küçük eklerini koyar.
// .dr-root (display: contents) yalnız drone sayfalarına özgü mobil kuralları kapsamlar; ESOF 323 sayfaları etkilenmez.
import '../robotik/robotik.css'
import './drone.css'

export default function DroneLayout({ children }: { children: React.ReactNode }) {
  return <div className="dr-root">{children}</div>
}

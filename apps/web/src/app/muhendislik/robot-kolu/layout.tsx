// Robot kolu dersi ESOF 323'ün hafta/simülasyon/test bileşenlerini ve görünümünü, Drone ve LLM derslerinin küçük eklerini paylaşır;
// üstüne yalnız kendi parçalarını (robot-kolu.css, .rk-*) koyar. .lm-root ve .dr-root (display: contents) kuralları kapsamlar.
import '../robotik/robotik.css'
import '../drone/drone.css'
import '../llm/llm.css'
import './robot-kolu.css'

export default function RobotKoluLayout({ children }: { children: React.ReactNode }) {
  return <div className="rk-root lm-root dr-root">{children}</div>
}

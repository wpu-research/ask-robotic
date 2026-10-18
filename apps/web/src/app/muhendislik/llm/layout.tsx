// LLM dersi ESOF 323'ün hafta/simülasyon/test bileşenlerini ve görünümünü, Drone dersinin küçük eklerini paylaşır;
// üstüne yalnız kendi gösterim parçalarını (llm.css, .lm-*) koyar. .lm-root (display: contents) kuralları kapsamlar.
import '../robotik/robotik.css'
import '../drone/drone.css'
import './llm.css'

export default function LlmLayout({ children }: { children: React.ReactNode }) {
  return <div className="lm-root dr-root">{children}</div>
}

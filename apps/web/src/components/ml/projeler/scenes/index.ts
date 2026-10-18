// Proje sahneleri: three.js ağır olduğu için her sahne ayrı parça olarak, yalnız istemcide ve gerektiğinde yüklenir.
import type { MountScene } from '../stage3d'

type Loader = () => Promise<{ mount: MountScene }>
export const SCENE_LOADERS: Record<string, Loader> = {
  'otonom-arac': () => import('./otonom-arac'),
  'robot-kol': () => import('./robot-kol'),
  'drone-inis': () => import('./drone-inis'),
  'depo-siniflandirma': () => import('./depo-siniflandirma'),
  'nokta-bulutu': () => import('./nokta-bulutu'),
}

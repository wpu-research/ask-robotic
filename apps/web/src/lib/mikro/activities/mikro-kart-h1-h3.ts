// Mikro Kart modülü (content-src/modul-10, slug 'mikro-kart'): 1-3. haftaların ders etkinlikleri.
// Anahtar: `<modül slug>:<hafta>:<haftadaki ders sırası>` (activityKey ile aynı biçim).
import type { MikroActivity } from '../activity'
import { h1d1 } from './h1-01-merhaba-kart'
import { h1d2 } from './h1-02-led-koordinat'
import { h1d3 } from './h1-03-simge-desen'
import { h1d4 } from './h1-04-sira-tekrar'
import { h1d5 } from './h1-05-proje-atan-kalp'
import { h2d1 } from './h2-06-dugmeler'
import { h2d2 } from './h2-07-sayac'
import { h2d3 } from './h2-08-zar'
import { h2d4 } from './h2-09-logo-uzun-basis'
import { h2d5 } from './h2-10-proje-zar-skor'
import { h3d1 } from './h3-11-ivme-salla'
import { h3d2 } from './h3-12-sicaklik-isik'
import { h3d3 } from './h3-13-pusula'
import { h3d4 } from './h3-14-ses-seviyesi'
import { h3d5 } from './h3-15-proje-cevre-istasyonu'

export const MIKRO_KART_H1_H3: Record<string, MikroActivity> = {
  'mikro-kart:1:1': h1d1, 'mikro-kart:1:2': h1d2, 'mikro-kart:1:3': h1d3, 'mikro-kart:1:4': h1d4, 'mikro-kart:1:5': h1d5,
  'mikro-kart:2:1': h2d1, 'mikro-kart:2:2': h2d2, 'mikro-kart:2:3': h2d3, 'mikro-kart:2:4': h2d4, 'mikro-kart:2:5': h2d5,
  'mikro-kart:3:1': h3d1, 'mikro-kart:3:2': h3d2, 'mikro-kart:3:3': h3d3, 'mikro-kart:3:4': h3d4, 'mikro-kart:3:5': h3d5,
}

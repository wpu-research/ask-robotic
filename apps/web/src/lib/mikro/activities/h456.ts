// Mikro Kart, hafta 4-6 (Müzik ve ses, Radyo ve iletişim, Projeler) ders etkinlikleri.
// Anahtar biçimi: "<modül slug>:<hafta>:<ders>" (ders: haftadaki sıra, 1-5). Koordinatör bunu activities/index.ts kaydına ekler.
import type { MikroActivity } from '../activity'
import { ders16 } from './16-ilk-nota'
import { ders17 } from './17-sure-sus-tempo'
import { ders18 } from './18-ezgiler-listeler'
import { ders19 } from './19-enstruman'
import { ders20 } from './20-sanal-piyano'
import { ders21 } from './21-mesaj-gonder'
import { ders22 } from './22-yazi-ad-deger'
import { ders23 } from './23-sifreli-mesaj'
import { ders24 } from './24-sohbet'
import { ders25 } from './25-uzaktan-kumanda'
import { ders26 } from './26-nabiz-olcer'
import { ders27 } from './27-adimsayar'
import { ders28 } from './28-alarm'
import { ders29 } from './29-nem-sicaklik-istasyonu'
import { ders30 } from './30-akilli-saksi'

export const MIKRO_KART_H456: Record<string, MikroActivity> = {
  'mikro-kart:4:1': ders16, 'mikro-kart:4:2': ders17, 'mikro-kart:4:3': ders18, 'mikro-kart:4:4': ders19, 'mikro-kart:4:5': ders20,
  'mikro-kart:5:1': ders21, 'mikro-kart:5:2': ders22, 'mikro-kart:5:3': ders23, 'mikro-kart:5:4': ders24, 'mikro-kart:5:5': ders25,
  'mikro-kart:6:1': ders26, 'mikro-kart:6:2': ders27, 'mikro-kart:6:3': ders28, 'mikro-kart:6:4': ders29, 'mikro-kart:6:5': ders30,
}

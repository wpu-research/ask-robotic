import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject } from '../samples/kit'
import { konum, resimler, yeni } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'oyuncu-robot', 'yiyecek-elma', 'yiyecek-portakal', 'nesne-yildiz')
const proje = (govde: ReturnType<typeof b>[]) => makeProject('Sahne ve sprite', [b('oyun_baslangic', {}, govde)], { bg: 8, images: IMAGES })

export const DERS_01: OyunActivity = {
  id: 'ders-01-sahne-ve-sprite',
  title: 'Sahneni kur: renk, kedi ve elma',
  intro: 'Oyun başlayınca arka plan rengini değiştir, bir kedi (Oyuncu) ve bir elma (Yiyecek) oluştur. Kediyi sol tarafa, elmayı sağ tarafa koy.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'degisken', 'math_number'),
  starter: () => proje([]),
  goals: [
    { id: 'renk', label: 'Arka plan rengini değiştirdin', hint: 'Sahne / Harita kategorisinde "arka plan rengi" bloğu var.', kind: 'custom', test: (r) => r.engine.bg !== r.project.bg },
    { id: 'kedi', label: 'Bir Oyuncu sprite\'ı oluşturdun', hint: '"yeni sprite" bloğunu bir değişkene koy. Türü Oyuncu olsun.', kind: 'sprites', of: 'oyuncu', min: 1 },
    { id: 'elma', label: 'Bir Yiyecek sprite\'ı oluşturdun', hint: 'Türü Yiyecek olan ikinci bir sprite oluştur.', kind: 'sprites', of: 'yiyecek', min: 1 },
    {
      id: 'ayri', label: 'Kedi ile elma birbirinden uzakta (en az 40 piksel)', hint: '"konumu x y" bloğunda x değerlerini farklı yap.',
      kind: 'custom', test: (r) => { const k = r.engine.spritesOfKind('oyuncu')[0], e = r.engine.spritesOfKind('yiyecek')[0]; return !!k && !!e && Math.abs(k.x - e.x) >= 40 },
    },
  ],
  solution: () => proje([
    b('sahne_renk', { C: 10 }),
    yeni('kedi', 'oyuncu-kedi', 'oyuncu'), konum('kedi', 40, 80),
    yeni('elma', 'yiyecek-elma', 'yiyecek'), konum('elma', 120, 80),
  ]),
}

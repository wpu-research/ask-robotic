import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'oyuncu-robot', 'oyuncu-astronot', 'oyuncu-ninja')
const baslangic = () => b('oyun_baslangic', {}, [b('sahne_renk', { C: 10 }), yeni('kedi', 'oyuncu-kedi', 'oyuncu'), konum('kedi', 80, 60), ...yuruyen('kedi', 60)])
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Düğme ve konuşma', [baslangic(), ...ek], { bg: 8, images: IMAGES })

export const DERS_03: OyunActivity = {
  id: 'ders-03-dugme-ve-konusma',
  title: 'A düğmesine basınca değiş ve konuş',
  intro: 'A düğmesine basınca kedi bir robota dönüşsün ve "Merhaba!" desin. Sola yürürken kedinin yüzü sola baksın.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'den_dugme', 'sprite_resim', 'sprite_konus', 'sprite_bak', 'metin', 'degisken', 'math_number'),
  starter: () => proje([]),
  scenario: [{ do: 'press', button: 'right', frames: 6 }, { do: 'press', button: 'left', frames: 10 }, { do: 'tap', button: 'a' }],
  goals: [
    { id: 'dugme', label: 'A düğmesine basılınca bir olay çalışıyor', hint: 'Denetleyici kategorisinde "A düğmesine basılınca" bloğu var.', kind: 'event', name: 'buttonPress' },
    { id: 'resim', label: 'A\'ya basınca kedinin resmi değişiyor', hint: '"resmi …" bloğu ile başka bir resim seç.', kind: 'spriteProp', of: 'oyuncu', prop: 'image', op: 'neq', value: 'oyuncu-kedi' },
    { id: 'konus', label: 'Kedi konuşma balonuyla konuşuyor', hint: '"… desin, … saniye" bloğunu ekle.', kind: 'custom', test: (r) => !!r.engine.spritesOfKind('oyuncu')[0]?.speech },
    { id: 'bak', label: 'Sol tuşuna basınca kedi sola bakıyor', hint: '"sol düğmesine basılınca" içinde "sola baksın" kullan.', kind: 'custom', test: (r) => r.engine.spritesOfKind('oyuncu')[0]?.flipX === true },
  ],
  solution: () => proje([
    b('den_dugme', { B: 'a', E: 'press' }, [b('sprite_resim', { S: 'kedi', IMG: 'oyuncu-robot' }), b('sprite_konus', { S: 'kedi', T: 'Merhaba!', N: 2 })]),
    b('den_dugme', { B: 'left', E: 'press' }, b('sprite_bak', { S: 'kedi', D: 'left' })),
    b('den_dugme', { B: 'right', E: 'press' }, b('sprite_bak', { S: 'kedi', D: 'right' })),
  ]),
}

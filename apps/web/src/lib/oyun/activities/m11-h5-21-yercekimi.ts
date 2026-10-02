// Ders 21 — Yerçekimi: aşağı yönlü ivme + zemin karoları.
import { allow, type OyunActivity } from '../activity'
import { b, first, makeProject, mapFromRows, tiles, yeniSprite } from './m11-ortak'

const harita = () => mapFromRows('zemin', [
  '..........', '..........', '..........', '..........', '..........', '..........', 'GGGGGGGGGG', 'TTTTTTTTTT',
], { G: 0, T: 1 })
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Yerçekimi', tops, { bg: 10, tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true]), maps: [harita()] })
const baslangic = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [b('harita_yukle', { M: 'zemin' }), ...yeniSprite('kahraman', 'oyuncu-kahraman', 'oyuncu', 80, 24), b('sprite_bayrak', { S: 'kahraman', F: 'stay', ON: 'true' }), ...ek])

export const OA_21_YERCEKIMI: OyunActivity = {
  id: 'ders-21-yercekimi',
  title: 'Kahraman yere insin',
  intro: 'Kahraman havada asılı duruyor. Ona aşağı yönlü bir ivme (yerçekimi) ver: 520 iyi bir değerdir. Kahraman zemine inip durmalı, sonra sağa-sola yürüyebilmeli.',
  allowedBlocks: allow('oyun_baslangic', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'hareket_ivme', 'den_hareket', 'degisken', 'math_number'),
  starter: () => proje([baslangic()]),
  scenario: [{ do: 'seconds', s: 1.5 }, { do: 'press', button: 'right', frames: 30 }],
  goals: [
    { id: 'duser', label: 'Kahraman aşağı düştü (y > 70)', hint: '"ivmesi x … y …" bloğunda y\'ye 520 yaz.', kind: 'spriteProp', of: 'oyuncu', prop: 'y', op: 'gt', value: 70 },
    { id: 'zeminde', label: 'Kahraman zeminde duruyor ("alttan bir duvara dokunuyor")', hint: 'Yerçekimi olmadan zemine inmez; ivme bloğunu "oyun başlayınca" içine koy.', kind: 'custom', test: (r) => !!first(r, 'oyuncu')?.touch.down },
    { id: 'yurur', label: 'Sağ tuşuyla yürüyor (en az 15 piksel)', hint: '"oyuncu tuşlarıyla sağa-sola hareket etsin" bloğunu ekle.', kind: 'moved', of: 'oyuncu', axis: 'x', min: 15 },
  ],
  solution: () => proje([baslangic([b('hareket_ivme', { S: 'kahraman', AX: 0, AY: 520 }), b('den_hareket', { S: 'kahraman', M: 'h', N: 70 })])]),
}

// Ders 30 (final) — Kendi oyunun: hedefler tasarımı kısıtlamaz, bir oyunun tam olma ölçütlerini sınar.
import { ALL_ALLOWED, type OyunActivity, type ScenarioStep } from '../activity'
import { b, bu, cmp, diger, ifThen, makeProject, rnd, set, yeniSprite } from './m11-ortak'

const TOPLANABILIR = ['yiyecek', 'bonus', 'hedef', 'nesne']
const TEHLIKE = ['dusman', 'engel']
const SC: ScenarioStep[] = [
  { do: 'seconds', s: 2 },
  { do: 'press', button: 'right', frames: 30 }, { do: 'press', button: 'down', frames: 20 },
  ...[...TOPLANABILIR, ...TEHLIKE].map((k): ScenarioStep => ({ do: 'collide', a: 'oyuncu', b: k })),
]

export const OA_30_FINAL: OyunActivity = {
  id: 'ders-30-final-kendi-oyunun',
  title: 'Final: Kendi oyunun',
  intro: 'Boş bir sahneyle başla ve kendi oyununu yap. Fikir sende; ama her tam oyunda bunlar vardır: ok tuşlarıyla oynanan bir oyuncu, toplanacak bir şey, kaçınılacak bir tehlike, skor, can, ses ve bir bitiş. Hedef listesi seni kontrol eder; çözüm yolunu sen seçersin.',
  allowedBlocks: ALL_ALLOWED,
  starter: () => makeProject('Kendi oyunum', [b('oyun_baslangic', {}, [b('sahne_renk', { C: 8 })])]),
  scenario: SC,
  goals: [
    { id: 'oyuncu', label: 'Oyuncu sprite\'ın ok tuşlarıyla hareket ediyor', hint: 'Türü "oyuncu" olan bir sprite oluştur ve "oyuncu tuşlarıyla … hareket etsin" ekle.', kind: 'moved', of: 'oyuncu', axis: 'any', min: 15 },
    { id: 'toplanir', label: 'Toplanacak bir şey var (tür: yiyecek, bonus, hedef ya da nesne)', hint: 'Zamanlayıcıyla ya da başlangıçta yiyecek oluştur.', kind: 'custom', test: (r) => TOPLANABILIR.some((k) => (r.peakByKind[k] ?? 0) > 0) },
    { id: 'tehlike', label: 'Kaçınılacak bir tehlike var (tür: düşman ya da engel)', hint: 'Düşman oluştur; hareket etsin ya da seni kovalasın.', kind: 'custom', test: (r) => TEHLIKE.some((k) => (r.peakByKind[k] ?? 0) > 0) },
    { id: 'skor', label: 'Toplayınca skor artıyor', hint: '"çarpınca" olayında skoru değiştir.', kind: 'score', op: 'increased' },
    { id: 'can', label: 'Tehlikeye değince can azalıyor', hint: '"çarpınca" olayında canı -1 değiştir.', kind: 'life', op: 'decreased' },
    { id: 'bitis', label: 'Oyunun bir bitişi var ("oyunu bitir" bloğu kullanılmış)', hint: 'Skor yeterli olunca ya da süre dolunca oyunu bitir: kazandın.', kind: 'usesBlocks', types: ['oyun_bitir'] },
    { id: 'ses', label: 'Oyunda ses var', hint: 'Bir melodi ya da bip ekle.', kind: 'event', name: 'sound' },
    { id: 'cila', label: 'Bir cila efekti var (sarsıntı, patlama ya da mesaj)', hint: '"ekranı salla", "patlama" ya da "ekranda … yaz".', kind: 'custom', test: (r) => r.engine.stats.shakes + r.engine.stats.bursts + r.engine.stats.messages > 0 },
  ],
  solution: () => makeProject('Meyve avcısı', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 10 }),
      ...yeniSprite('kedi', 'oyuncu-kedi', 'oyuncu', 80, 100),
      b('den_hareket', { S: 'kedi', M: 'four', N: 70 }),
      b('sprite_bayrak', { S: 'kedi', F: 'stay', ON: 'true' }),
      ...yeniSprite('hayalet', 'dusman-hayalet', 'dusman', 30, 30),
      b('hareket_hiz', { S: 'hayalet', VX: 35, VY: 20 }),
      b('sprite_bayrak', { S: 'hayalet', F: 'bounce', ON: 'true' }),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 3 }),
    ]),
    b('oyun_her_n_ms', { MS: 1000 }, [
      set('meyve', b('sprite_yeni', { IMG: 'yiyecek-kiraz', K: 'yiyecek' })),
      b('sprite_konum', { S: 'meyve', X: rnd(12, 148), Y: rnd(12, 108) }),
      b('sprite_omur', { S: 'meyve', N: 5000 }),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
      b('sprite_sil', { S: diger() }),
      ifThen(cmp('GTE', b('oyun_skor'), 5), [b('oyun_mesaj', { T: 'Avcı kazandı!', N: 2 }), b('oyun_bitir', { R: 'win' })]),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
      b('oyun_can_degistir', { N: -1 }),
      b('oyun_sarsinti', { N: 250 }),
      b('ses_melodi', { M: 'kayip' }),
      b('sprite_konum', { S: bu(), X: 80, Y: 100 }),
    ]),
  ]),
}

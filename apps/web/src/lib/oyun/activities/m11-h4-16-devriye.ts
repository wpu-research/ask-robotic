// Ders 16 — Devriye: düşman kendi ritmiyle gidip gelir (zamanlayıcı + hızı ters çevirme).
import { allow, type OyunActivity } from '../activity'
import { b, first, makeProject, yeniSprite } from './m11-ortak'

const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 8 }),
  ...yeniSprite('yarasa', 'dusman-yarasa', 'dusman', 40, 60),
  b('hareket_hiz', { S: 'yarasa', VX: 40, VY: 0 }),
])

export const OA_16_DEVRIYE: OyunActivity = {
  id: 'ders-16-devriye',
  title: 'Yarasa devriyesi',
  intro: 'Yarasa sağa doğru uçup ekrandan çıkıyor. Onu devriyeye çıkar: her 1500 ms\'de bir x hızını ters çevirsin. Yarasa 6 saniye sonra başladığı yere dönmüş olmalı.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_n_ms', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'hareket_hiz', 'hareket_ters', 'sprite_bak', 'sprite_oku', 'mantik', 'degisken', 'math_number'),
  starter: () => makeProject('Devriye', [baslangic()]),
  scenario: [{ do: 'seconds', s: 6 }],
  goals: [
    { id: 'gider', label: 'Yarasa yatayda en az 50 piksel uzaklaşıyor', hint: 'Başlangıçtaki "hızı x 40 y 0" bloğunu silme.', kind: 'moved', of: 'dusman', axis: 'x', min: 50 },
    { id: 'zaman', label: 'Programın zamanlayıcı ve ters çevirme bloğu kullanıyor', hint: '"her … ms\'de bir" olayının içine "… x hızını ters çevir" bloğunu koy.', kind: 'usesBlocks', types: ['oyun_her_n_ms', 'hareket_ters'] },
    { id: 'doner', label: '6 saniye sonra yarasa başladığı yere yakın (devriye)', hint: 'Zamanlayıcıyı 1500 ms yap: 1,5 sn gider, 1,5 sn döner.', kind: 'custom', test: (r) => { const s = first(r, 'dusman'); return !!s && Math.abs(s.x - 40) < 15 } },
  ],
  solution: () => makeProject('Devriye', [baslangic(), b('oyun_her_n_ms', { MS: 1500 }, [b('hareket_ters', { S: 'yarasa', A: 'x' })])]),
}

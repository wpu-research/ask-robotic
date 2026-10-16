// Serbest atölyenin "Örnekler" listesi: açıp çalıştırılabilen, değiştirilebilen hazır projeler.
import { A_3_2, A_4_2 } from './activities/h3-h4'
import { A_6_2 } from './activities/h5-h6'
import { A_7_2 } from './activities/h7-h8'
import { b, flag, forever, repeat, say, wait } from './dsl'
import { makeProject } from './kit'
import type { SahneProject } from './types'

export interface SahneSample { id: string; name: string; desc: string; nameEn: string; descEn: string; icon: string; project: () => SahneProject }

export const SAMPLES: readonly SahneSample[] = [
  {
    id: 'yildiz-kalem', name: 'Yıldız çizen kalem', icon: '✎', desc: 'Kalemi indir, 5 kere "ilerle ve 144 derece dön": yıldız çıkar. Açıyı değiştirip başka şekiller dene.',
    nameEn: 'Star-drawing pen', descEn: 'Put the pen down and "move, then turn 144 degrees" 5 times: you get a star! Change the angle to try other shapes.',
    project: () => makeProject('Yıldız çizen kalem', [{
      id: 'kalem', name: 'Kalem', char: 'yildiz', x: -70, y: -50, size: 28,
      blocks: [flag([b('sh_pen_clear'), b('sh_goto_xy', { X: -70, Y: -50 }), b('sh_point', { D: 72 }), b('sh_pen_color', { C: '#e53935' }), b('sh_pen_set_size', { N: 4 }), b('sh_pen_down'),
        repeat(5, [b('sh_move', { N: 140 }), b('sh_turn_r', { D: 144 })]), b('sh_pen_up'), say('Yıldız!')])],
    }], { backdrops: ['beyaz'] }),
  },
  {
    id: 'dans-robot', name: 'Dans eden robot', icon: '🤖', desc: 'Bayrağa basınca robot dans eder; robota tıklarsan konuşur ve ses çıkarır.',
    nameEn: 'Dancing robot', descEn: 'Click the flag and the robot dances. Click the robot and it talks and makes a sound.',
    project: () => makeProject('Dans eden robot', [{
      id: 'robot', name: 'Robot', char: 'robot', sounds: ['bip', 'davul'],
      blocks: [
        flag([forever([b('sh_next_costume'), b('sh_turn_r', { D: 10 }), b('sh_play', { S: 'Davul' }), wait(0.3), b('sh_turn_l', { D: 10 })])]),
        b('sh_when_clicked', {}, [say('Dans zamanı!'), b('sh_play', { S: 'Bip' })]),
      ],
    }], { backdrops: ['sahne'] }),
  },
  { id: 'elma-yagmuru', name: 'Elma yağmuru', icon: '🍎', desc: 'Klonlarla düşen elmaları sepetle yakala. Oklarla yönet.', nameEn: 'Apple rain', descEn: 'Catch the falling apple clones with the basket. Steer with the arrow keys.', project: () => { const p = A_6_2.solution(); p.name = 'Elma yağmuru'; return p } },
  { id: 'calgi', name: 'Renkli çalgı', icon: '🎹', desc: 'a, s, d, f tuşlarıyla çal; yıldıza tıklayınca melodi çalar.', nameEn: 'Colorful instrument', descEn: 'Play with the a, s, d, f keys. Click the star to hear a tune.', project: () => { const p = A_3_2.solution(); p.name = 'Renkli çalgı'; return p } },
  { id: 'hikaye', name: 'İki karakterli hikâye', icon: '💬', desc: 'Mesajlaşan iki karakter ve değişen sahneler.', nameEn: 'Two-character story', descEn: 'Two characters sending messages and changing scenes.', project: () => { const p = A_4_2.solution(); p.name = 'İki karakterli hikâye'; return p } },
  { id: 'yarisma', name: 'Bilgi yarışması', icon: '❓', desc: 'Liste ve değişkenlerle soru-cevap oyunu. Soruları değiştir!', nameEn: 'Quiz game', descEn: 'A question-and-answer game with lists and variables. Change the questions!', project: () => { const p = A_7_2.solution(); p.name = 'Bilgi yarışması'; return p } },
]

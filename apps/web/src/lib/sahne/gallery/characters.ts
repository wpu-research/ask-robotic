// Karakter galerisi: elle çizilmiş vektör karakterler (her biri 96x96). Birden çok kostümlü olanlar "kostüm değiştir" derslerinde yürüyüş/hareket verir.
import type { Costume } from '../types'
import { C, E, INK, L, P, R, costume, star } from './draw'

export interface GalleryCharacter { id: string; name: string; group: 'hayvan' | 'nesne' | 'insan' | 'oyun'; costumes: Costume[] }

const kedi = (alt: boolean): Costume => costume(alt ? 'kedi-b' : 'kedi-a', alt ? 'kedi-b' : 'kedi-a', [
  L(alt ? [72, 66, 88, 66, 90, 52] : [72, 66, 86, 58, 84, 42], '#f59e0b', 7),
  E(48, 64, 24, 20, '#f59e0b'),
  E(alt ? 31 : 35, 82, 8, 6, '#f59e0b'), E(alt ? 65 : 61, 82, 8, 6, '#f59e0b'),
  E(48, 66, 13, 12, '#fde7b3'),
  E(48, 38, 20, 17, '#f59e0b'),
  P([30, 30, 32, 8, 44, 22], '#f59e0b'), P([66, 30, 64, 8, 52, 22], '#f59e0b'),
  P([33, 26, 34, 14, 40, 22], '#f9a8d4'), P([63, 26, 62, 14, 56, 22], '#f9a8d4'),
  L([44, 23, 44, 29], '#c2410c', 3), L([48, 21, 48, 28], '#c2410c', 3), L([52, 23, 52, 29], '#c2410c', 3),
  E(40, 38, 3.5, 4.5, INK), E(56, 38, 3.5, 4.5, INK), C(41, 36.5, 1.2, '#fff'), C(57, 36.5, 1.2, '#fff'),
  P([45.5, 43, 50.5, 43, 48, 46], '#ec4899'),
  L([48, 46, 48, 48, 45, 50], INK, 1.6), L([48, 48, 51, 50], INK, 1.6),
  L([35, 44, 22, 41], INK, 1.4), L([35, 47, 22, 49], INK, 1.4), L([61, 44, 74, 41], INK, 1.4), L([61, 47, 74, 49], INK, 1.4),
])

const kopek = (alt: boolean): Costume => costume(alt ? 'kopek-b' : 'kopek-a', alt ? 'köpek-b' : 'köpek-a', [
  L(alt ? [74, 62, 86, 54] : [74, 62, 86, 66], '#a16207', 7),
  E(46, 64, 25, 17, '#c28a4a'),
  R(alt ? 26 : 30, 72, 9, 16, '#c28a4a', null, 0, 4), R(alt ? 60 : 56, 72, 9, 16, '#c28a4a', null, 0, 4), R(alt ? 38 : 40, 74, 9, 14, '#a16207', null, 0, 4),
  E(48, 38, 19, 17, '#c28a4a'),
  E(28, 40, 8, 15, '#7c4a0f'), E(68, 40, 8, 15, '#7c4a0f'),
  E(48, 46, 11, 8, '#f3dcb8'),
  E(41, 35, 3.5, 4, INK), E(55, 35, 3.5, 4, INK), C(42, 34, 1.1, '#fff'), C(56, 34, 1.1, '#fff'),
  E(48, 42, 4.5, 3, INK), L([48, 44, 48, 49], INK, 1.6), P([44, 50, 52, 50, 48, 56], '#f472b6'),
])

const balik = (alt: boolean): Costume => costume(alt ? 'balik-b' : 'balik-a', alt ? 'balık-b' : 'balık-a', [
  P(alt ? [66, 48, 90, 30, 88, 66] : [66, 48, 90, 38, 90, 58], '#fb923c'),
  E(44, 48, 28, 20, '#38bdf8'),
  P([34, 30, 46, 22, 56, 32], '#0ea5e9'),
  E(44, 54, 18, 9, '#bae6fd'),
  C(30, 44, 5, '#fff'), C(29, 44, 2.6, INK),
  L([20, 54, 26, 57], INK, 2),
  L([52, 40, 52, 56], '#0284c7', 2), L([60, 41, 60, 55], '#0284c7', 2),
])

const kus = (alt: boolean): Costume => costume(alt ? 'kus-b' : 'kus-a', alt ? 'kuş-b' : 'kuş-a', [
  P([20, 50, 6, 40, 8, 58], '#ef4444'),
  E(46, 50, 26, 22, '#ef4444'),
  E(48, 58, 16, 12, '#fecaca'),
  alt ? E(42, 66, 16, 8, '#b91c1c') : E(42, 36, 16, 10, '#b91c1c'),
  C(36, 44, 5, '#fff'), C(35, 44, 2.6, INK),
  P([20, 44, 6, 50, 20, 54], '#fbbf24'),
  L([42, 72, 42, 82], '#d97706', 3), L([54, 72, 54, 82], '#d97706', 3),
])

const robot = (alt: boolean): Costume => costume(alt ? 'robot-b' : 'robot-a', alt ? 'robot-b' : 'robot-a', [
  L([48, 8, 48, 18], '#64748b', 3), C(48, 8, 4, '#ef4444'),
  R(26, 18, 44, 30, '#94a3b8', '#475569', 2.5, 8),
  R(34, 26, 12, 12, '#fef08a', INK, 2, 3), R(52, 26, 12, 12, '#fef08a', INK, 2, 3), C(40, 32, 2.5, INK), C(58, 32, 2.5, INK),
  R(38, 40, 20, 4, INK, null, 0, 2),
  R(30, 52, 36, 26, '#60a5fa', '#475569', 2.5, 6), C(48, 65, 6, '#fde047', INK, 2),
  alt ? R(12, 40, 14, 6, '#94a3b8', '#475569', 2, 3) : R(12, 54, 14, 6, '#94a3b8', '#475569', 2, 3),
  alt ? R(70, 54, 14, 6, '#94a3b8', '#475569', 2, 3) : R(70, 40, 14, 6, '#94a3b8', '#475569', 2, 3),
  R(34, 78, 10, 12, '#475569', null, 0, 3), R(52, 78, 10, 12, '#475569', null, 0, 3),
])

const gemi = (alt: boolean): Costume => costume(alt ? 'gemi-b' : 'gemi-a', alt ? 'gemi-b' : 'gemi-a', [
  alt ? P([40, 70, 56, 70, 48, 94], '#f97316') : P([42, 70, 54, 70, 48, 86], '#fbbf24'),
  alt ? P([44, 70, 52, 70, 48, 84], '#fde047') : P([45, 70, 51, 70, 48, 78], '#fff7ae'),
  P([48, 6, 62, 40, 62, 68, 34, 68, 34, 40], '#e5e7eb', INK, 2),
  C(48, 38, 8, '#38bdf8', INK, 2),
  P([34, 52, 18, 72, 34, 68], '#ef4444', INK, 2), P([62, 52, 78, 72, 62, 68], '#ef4444', INK, 2),
  P([40, 22, 48, 6, 56, 22], '#ef4444', INK, 2),
])

const elma = (gold: boolean): Costume => costume(gold ? 'altin-elma' : 'elma', gold ? 'altın elma' : 'elma', [
  E(48, 56, 30, 28, gold ? '#fbbf24' : '#ef4444'),
  E(38, 48, 8, 12, gold ? '#fde68a' : '#f87171'),
  L([48, 30, 50, 16], '#78350f', 4),
  P([50, 20, 66, 12, 62, 28], '#22c55e'),
])
const sepet: Costume = costume('sepet', 'sepet', [
  P([14, 40, 82, 40, 72, 86, 24, 86], '#b45309', '#78350f', 2.5),
  L([20, 52, 76, 52], '#78350f', 2), L([22, 64, 74, 64], '#78350f', 2), L([24, 76, 72, 76], '#78350f', 2),
  R(10, 34, 76, 10, '#d97706', '#78350f', 2.5, 5),
])
const top: Costume = costume('top', 'top', [
  C(48, 48, 34, '#38bdf8', INK, 2.5), P([48, 14, 58, 36, 40, 38], '#fff'), P([14, 52, 36, 54, 30, 76], '#fff'), P([82, 52, 60, 54, 68, 76], '#fff'),
  L([48, 14, 48, 82], INK, 1.5),
])
const yildiz: Costume = costume('yildiz', 'yıldız', [P(star(48, 50, 40, 17), '#fbbf24', '#b45309', 3), C(40, 44, 3, INK), C(56, 44, 3, INK), L([42, 56, 48, 61, 54, 56], INK, 2.5)])
const balon: Costume = costume('balon', 'balon', [
  L([48, 70, 44, 82, 50, 92], '#64748b', 2),
  E(48, 38, 26, 32, '#ec4899'), E(38, 26, 7, 11, '#f9a8d4'), P([42, 69, 54, 69, 48, 63], '#be185d'),
])
const cicek: Costume = costume('cicek', 'çiçek', [
  L([48, 50, 48, 92], '#16a34a', 5), P([48, 78, 68, 66, 62, 82], '#22c55e'),
  ...[0, 72, 144, 216, 288].map((a) => C(48 + 20 * Math.cos(((a - 90) * Math.PI) / 180), 34 + 20 * Math.sin(((a - 90) * Math.PI) / 180), 13, '#f472b6')),
  C(48, 34, 11, '#fbbf24', '#b45309', 2),
])
const davul: Costume = costume('davul', 'davul', [
  L([18, 8, 42, 36], '#d6a35c', 5), L([78, 8, 54, 36], '#d6a35c', 5),
  R(14, 40, 68, 42, '#ef4444', '#7f1d1d', 2.5, 4), E(48, 40, 34, 11, '#fef3c7', '#7f1d1d', 2.5),
  L([18, 44, 36, 80], '#fff', 2), L([36, 50, 48, 80], '#fff', 2), L([60, 50, 48, 80], '#fff', 2), L([78, 44, 60, 80], '#fff', 2),
])
const dugme = (name: string, c: string, d: string, id = name): Costume => costume(`dugme-${id}`, name, [C(48, 52, 34, d), C(48, 46, 34, c, INK, 2.5), E(38, 34, 12, 7, 'rgba(255,255,255,0.45)')])
const cocuk = (alt: boolean): Costume => costume(alt ? 'cocuk-b' : 'cocuk-a', alt ? 'çocuk-b' : 'çocuk-a', [
  R(alt ? 33 : 38, 62, 10, 26, '#1d4ed8', null, 0, 4), R(alt ? 53 : 48, 62, 10, 26, '#1d4ed8', null, 0, 4),
  E(alt ? 38 : 43, 90, 8, 4, '#111827'), E(alt ? 58 : 53, 90, 8, 4, '#111827'),
  R(30, 36, 36, 32, '#f43f5e', null, 0, 8),
  R(alt ? 18 : 22, alt ? 38 : 44, 12, 22, '#fcd9b6', null, 0, 5), R(alt ? 66 : 62, alt ? 44 : 38, 12, 22, '#fcd9b6', null, 0, 5),
  C(48, 24, 15, '#fcd9b6'), P([33, 22, 40, 8, 60, 8, 63, 22, 55, 16, 41, 16], '#7c2d12'),
  C(43, 26, 2, INK), C(53, 26, 2, INK), L([44, 32, 48, 34, 52, 32], '#b91c1c', 2),
])
const bulut: Costume = costume('bulut', 'bulut', [C(30, 56, 20, '#f1f5f9'), C(50, 44, 24, '#f8fafc'), C(70, 56, 20, '#f1f5f9'), R(30, 56, 40, 20, '#f1f5f9'), E(48, 72, 36, 8, '#e2e8f0')])
const araba: Costume = costume('araba', 'araba', [
  R(6, 46, 84, 24, '#ef4444', '#7f1d1d', 2.5, 8), P([22, 46, 32, 26, 62, 26, 74, 46], '#ef4444', '#7f1d1d', 2.5),
  P([27, 44, 34, 30, 46, 30, 46, 44], '#bae6fd'), P([50, 44, 50, 30, 60, 30, 69, 44], '#bae6fd'),
  C(26, 72, 10, INK), C(26, 72, 4, '#d1d5db'), C(70, 72, 10, INK), C(70, 72, 4, '#d1d5db'), E(86, 56, 4, 5, '#fde047'),
])
const kalp: Costume = costume('kalp', 'kalp', [P([48, 84, 12, 48, 12, 30, 28, 14, 48, 30, 68, 14, 84, 30, 84, 48], '#e11d48', '#9f1239', 3), E(30, 30, 6, 9, '#fb7185')])
const agac: Costume = costume('agac', 'ağaç', [R(42, 56, 14, 38, '#92400e'), C(48, 36, 28, '#22c55e'), C(30, 48, 18, '#16a34a'), C(66, 48, 18, '#16a34a'), C(40, 28, 10, '#4ade80')])
const hayalet: Costume = costume('hayalet', 'hayalet', [
  P([20, 90, 20, 40, 28, 20, 48, 10, 68, 20, 76, 40, 76, 90, 66, 80, 57, 90, 48, 80, 39, 90, 30, 80], '#f1f5f9', '#94a3b8', 2.5),
  E(38, 42, 5, 8, INK), E(58, 42, 5, 8, INK), E(48, 60, 6, 8, INK),
])
const dino: Costume = costume('dino', 'dinozor', [
  P([14, 60, 4, 52, 20, 52], '#22c55e'),
  E(38, 60, 26, 20, '#22c55e'), R(58, 20, 28, 22, '#22c55e', null, 0, 10), R(52, 30, 16, 36, '#22c55e', null, 0, 6),
  R(28, 74, 10, 16, '#16a34a', null, 0, 4), R(46, 74, 10, 16, '#16a34a', null, 0, 4),
  C(74, 28, 3.2, INK), L([80, 38, 86, 38], '#14532d', 2),
  P([26, 42, 30, 34, 34, 42], '#facc15'), P([36, 42, 40, 32, 44, 42], '#facc15'), P([46, 44, 50, 36, 54, 44], '#facc15'),
])

export const CHARACTERS: readonly GalleryCharacter[] = [
  { id: 'kedi', name: 'Tombik Kedi', group: 'hayvan', costumes: [kedi(false), kedi(true)] },
  { id: 'kopek', name: 'Sevimli Köpek', group: 'hayvan', costumes: [kopek(false), kopek(true)] },
  { id: 'balik', name: 'Balık', group: 'hayvan', costumes: [balik(false), balik(true)] },
  { id: 'kus', name: 'Kırmızı Kuş', group: 'hayvan', costumes: [kus(false), kus(true)] },
  { id: 'dino', name: 'Dinozor', group: 'hayvan', costumes: [dino] },
  { id: 'robot', name: 'Robot', group: 'insan', costumes: [robot(false), robot(true)] },
  { id: 'cocuk', name: 'Çocuk', group: 'insan', costumes: [cocuk(false), cocuk(true)] },
  { id: 'gemi', name: 'Uzay Gemisi', group: 'nesne', costumes: [gemi(false), gemi(true)] },
  { id: 'araba', name: 'Araba', group: 'nesne', costumes: [araba] },
  { id: 'elma', name: 'Elma', group: 'oyun', costumes: [elma(false)] },
  { id: 'altin-elma', name: 'Altın Elma', group: 'oyun', costumes: [elma(true)] },
  { id: 'sepet', name: 'Sepet', group: 'oyun', costumes: [sepet] },
  { id: 'top', name: 'Top', group: 'oyun', costumes: [top] },
  { id: 'yildiz', name: 'Yıldız', group: 'oyun', costumes: [yildiz] },
  { id: 'kalp', name: 'Kalp', group: 'oyun', costumes: [kalp] },
  { id: 'hayalet', name: 'Hayalet', group: 'oyun', costumes: [hayalet] },
  { id: 'balon', name: 'Balon', group: 'nesne', costumes: [balon] },
  { id: 'cicek', name: 'Çiçek', group: 'nesne', costumes: [cicek] },
  { id: 'agac', name: 'Ağaç', group: 'nesne', costumes: [agac] },
  { id: 'bulut', name: 'Bulut', group: 'nesne', costumes: [bulut] },
  { id: 'davul', name: 'Davul', group: 'nesne', costumes: [davul] },
  { id: 'dugme', name: 'Renkli Düğme', group: 'nesne', costumes: [dugme('kırmızı', '#ef4444', '#991b1b', 'kirmizi'), dugme('mavi', '#3b82f6', '#1e3a8a'), dugme('yeşil', '#22c55e', '#14532d', 'yesil'), dugme('sarı', '#facc15', '#a16207', 'sari')] },
]
export const CHARACTER_BY_ID: Readonly<Record<string, GalleryCharacter>> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]))
export const CHARACTER_GROUPS: readonly { id: GalleryCharacter['group']; label: string }[] = [
  { id: 'hayvan', label: 'Hayvanlar' }, { id: 'insan', label: 'İnsanlar ve robotlar' }, { id: 'oyun', label: 'Oyun nesneleri' }, { id: 'nesne', label: 'Nesneler' },
]

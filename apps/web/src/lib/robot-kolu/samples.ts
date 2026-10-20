// ArmScript örnek programları (TR/EN, satır sayıları eşit). Testler hepsini yorumlayıcıdan geçirir; dersteki ve
// simülasyondaki ArmScript kodu bu dosyadan gelir, yani gösterilen kod gerçekten çalışır.
import { defaultCell, type Cell } from './cell'

export type Lang = 'tr' | 'en'
export type SampleId = 'ilk' | 'al-birak' | 'istif' | 'duvar' | 'hata-carpisma' | 'hata-erisim' | 'hata-sonsuz' | 'bitirme'
interface SampleDef { wall: boolean; expect: 'ok' | 'collision' | 'unreachable' | 'step-limit'; tr: string; en: string }

export const SAMPLES: Record<SampleId, SampleDef> = {
  'ilk': {
    wall: false, expect: 'ok',
    tr: `# ArmScript ilk program
speed 40            # hız yüzdesi
ptp joints(0, 30, 60, 0, 90, 0)   # eklem uzayı: açılar derece
print "bekleme duruşu", here()    # TCP'nin konumu
ptp pose(0.5, 0.2, 0.3)           # kartezyen hedef, tutucu aşağı bakar
print "hedefe vardı", here()`,
    en: `# first ArmScript program
speed 40            # speed percentage
ptp joints(0, 30, 60, 0, 90, 0)   # joint space: angles in degrees
print "home pose", here()         # position of the TCP
ptp pose(0.5, 0.2, 0.3)           # Cartesian target, gripper points down
print "reached target", here()`,
  },
  'al-birak': {
    wall: false, expect: 'ok',
    tr: `# A noktasından parça al, B noktasına bırak
var ust_a = pose(0.55, -0.32, 0.25)   # A'nın üstü
var al_a = pose(0.55, -0.32, 0.03)    # parçanın tutulacağı yer
var ust_b = pose(0.55, 0.32, 0.25)
var koy_b = pose(0.55, 0.32, 0.03)
open
ptp ust_a          # serbest uçuş: eklem uzayı
lin al_a           # dikey iniş: doğru çizgi
close
lin ust_a
ptp ust_b
lin koy_b
open
lin ust_b
print "tutuyor mu:", holding()`,
    en: `# pick a part at A and put it down at B
var above_a = pose(0.55, -0.32, 0.25)   # above A
var pick_a = pose(0.55, -0.32, 0.03)    # where the part is gripped
var above_b = pose(0.55, 0.32, 0.25)
var put_b = pose(0.55, 0.32, 0.03)
open
ptp above_a        # free flight: joint space
lin pick_a         # vertical descent: straight line
close
lin above_a
ptp above_b
lin put_b
open
lin above_b
print "holding:", holding()`,
  },
  'istif': {
    wall: false, expect: 'ok',
    tr: `# üç parçayı sırayla alıp B'de üst üste diz
proc al(x, y)
  open
  ptp pose(x, y, 0.25)
  lin pose(x, y, 0.03)
  close
  lin pose(x, y, 0.25)
end
proc koy(x, y, z)
  ptp pose(x, y, z + 0.22)
  lin pose(x, y, z)
  open
  lin pose(x, y, z + 0.22)
end
for i = 1 to items()
  call al(item_x(i), item_y(i))
  call koy(0.55, 0.32, 0.03 + 0.06 * (i - 1))
  print "parça", i, "yerleşti"
end`,
    en: `# pick the three parts in turn and stack them at B
proc pick(x, y)
  open
  ptp pose(x, y, 0.25)
  lin pose(x, y, 0.03)
  close
  lin pose(x, y, 0.25)
end
proc put(x, y, z)
  ptp pose(x, y, z + 0.22)
  lin pose(x, y, z)
  open
  lin pose(x, y, z + 0.22)
end
for i = 1 to items()
  call pick(item_x(i), item_y(i))
  call put(0.55, 0.32, 0.03 + 0.06 * (i - 1))
  print "part", i, "placed"
end`,
  },
  'duvar': {
    wall: true, expect: 'ok',
    tr: `# A ile B arasında duvar var: yük taşırken plan kullan
var ust_a = pose(0.55, -0.32, 0.25)
var al_a = pose(0.55, -0.32, 0.03)
var ust_b = pose(0.55, 0.32, 0.25)
var koy_b = pose(0.55, 0.32, 0.03)
open
plan ust_a         # çarpışmasız yol iste
lin al_a
close
lin ust_a
plan ust_b         # duvarın üstünden ya da çevresinden
lin koy_b
open
lin ust_b
print "bitti, parça B'de"`,
    en: `# there is a wall between A and B: use plan while carrying
var above_a = pose(0.55, -0.32, 0.25)
var pick_a = pose(0.55, -0.32, 0.03)
var above_b = pose(0.55, 0.32, 0.25)
var put_b = pose(0.55, 0.32, 0.03)
open
plan above_a       # ask for a collision-free path
lin pick_a
close
lin above_a
plan above_b       # over or around the wall
lin put_b
open
lin above_b
print "done, part is at B"`,
  },
  'hata-carpisma': {
    wall: true, expect: 'collision',
    tr: `# YANLIŞ: duvarın karşısına ptp ile gitmek
ptp pose(0.55, -0.32, 0.25)
ptp pose(0.55, 0.32, 0.25)   # eklem uzayı yolu duvara çarpar`,
    en: `# WRONG: going across the wall with ptp
ptp pose(0.55, -0.32, 0.25)
ptp pose(0.55, 0.32, 0.25)   # the joint-space path hits the wall`,
  },
  'hata-erisim': {
    wall: false, expect: 'unreachable',
    tr: `# YANLIŞ: erişim alanının dışında hedef
ptp pose(1.2, 0.0, 0.2)      # kol 0,9 m'den uzağa uzanamaz`,
    en: `# WRONG: a target outside the workspace
ptp pose(1.2, 0.0, 0.2)      # the arm cannot reach beyond 0.9 m`,
  },
  'hata-sonsuz': {
    wall: false, expect: 'step-limit',
    tr: `# YANLIŞ: bitmeyen döngü, yorumlayıcı adım sınırında durdurur
var n = 0
while true
  n = n + 1
end`,
    en: `# WRONG: a loop that never ends; the interpreter stops it at the step limit
var n = 0
while true
  n = n + 1
end`,
  },
  'bitirme': {
    wall: true, expect: 'ok',
    tr: `# bitirme: paletleme, 2x2 düzen, duvar aşılarak
proc tasi(x, y, px, py)
  open
  plan pose(x, y, 0.25)
  lin pose(x, y, 0.03)
  close
  lin pose(x, y, 0.25)
  plan pose(px, py, 0.25)
  lin pose(px, py, 0.03)
  open
  lin pose(px, py, 0.25)
end
var n = 0
for i = 1 to 3
  call tasi(item_x(i), item_y(i), 0.5 + 0.09 * (i % 2), 0.28 + 0.09 * floor(i / 2))
  n = n + 1
end
print "taşınan parça sayısı:", n`,
    en: `# capstone: palletising in a 2x2 layout, over the wall
proc move_part(x, y, px, py)
  open
  plan pose(x, y, 0.25)
  lin pose(x, y, 0.03)
  close
  lin pose(x, y, 0.25)
  plan pose(px, py, 0.25)
  lin pose(px, py, 0.03)
  open
  lin pose(px, py, 0.25)
end
var n = 0
for i = 1 to 3
  call move_part(item_x(i), item_y(i), 0.5 + 0.09 * (i % 2), 0.28 + 0.09 * floor(i / 2))
  n = n + 1
end
print "parts moved:", n`,
  },
}
export const SAMPLE_IDS = Object.keys(SAMPLES) as SampleId[]
export const sampleSrc = (id: SampleId, lang: Lang) => SAMPLES[id][lang]
export const sampleCell = (id: SampleId): Cell => defaultCell(SAMPLES[id].wall)

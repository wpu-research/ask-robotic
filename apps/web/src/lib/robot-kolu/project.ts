// Robot kolu dersi bitirme projesi: paletleme hücresi (ArmScript programı + çarpışmasız yol + hücre güvenliği + ölçümler).
// Teslimler Drone ve LLM dersleriyle aynı düzende (öneri → ara kontrol → sunum); ünitelere bağlı. Gereksinimlerdeki sayılar
// ders modelinin ölçülebilir çıktılarıdır (süre, parça, düşürme) ve bitirme örneği bunları sağlar (testlerde doğrulanır).

interface Text { title: string; summary: string; scenario: string; requirements: string[]; architecture: string[]; tests: string[] }
export interface Deliverable { afterUnit: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }

const D = (afterUnit: number, tr: [string, string], en: [string, string]): Deliverable => ({ afterUnit, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

export const CAPSTONE: { tr: Text; en: Text; deliverables: Deliverable[] } = {
  tr: {
    title: 'Bitirme projesi: paletleme hücresi',
    summary: 'Duvarlı sanal hücrede alma bölgesindeki üç parçayı alıp bırakma bölgesinde bir palet düzenine yerleştiren, çarpışmasız, ölçülen ve test edilen bir ArmScript programı.',
    scenario: 'Hücrede alma bölgesi A\'da üç küp (0,06 m), bırakma bölgesi B\'de boş bir palet ve aralarında 0,42 m yüksekliğinde bir duvar var. Program parçaları tek tek alır, duvarın üstünden ya da çevresinden taşır ve 2x2 düzenin hücrelerine koyar. Sonunda kaç parça taşındığını yazar.',
    requirements: [
      'G1: Program hatasız biter (yorumlayıcı hata vermez) ve üç parçanın üçü de bırakma bölgesinde, birbirinden en az 0,08 m uzakta durur.',
      'G2: Hiçbir benzetim karesinde kol masaya, duvara ya da yasak bölgeye değmez (kare kare denetlenir).',
      'G3: Parça düşürülmez: her bırakma, TCP parçanın merkez yüksekliğindeyken yapılır (düşürme sayısı 0).',
      'G4: Duvarı aşan serbest uçuşlar plan ile, parçaya dikey iniş ve kalkışlar lin ile yapılır.',
      'G5: Toplam benzetim süresi 30 saniyenin altındadır; süre ve plan sayısı rapora yazılır.',
      'G6: Program tutma sonrası holding() ile kendini denetler ve başarısızlıkta halt eder.',
    ],
    architecture: [
      'Program: yordamlar (al, taşı, bırak), hedefler tek yerde tanımlı değişkenlerle; sihirli sayı yok.',
      'Hareket seçimi tablosu: serbest uçuş duvarsız yarıda ptp, duvarı aşarken plan, dikey hareketlerde lin; gerekçesiyle.',
      'Hücre: alma ve bırakma bölgeleri, duvar, isteğe bağlı yasak bölge ve parça listesi tek bir hücre tanımında.',
      'Ölçüm: parça, düşürme, plan sayısı, süre ve çıktı satırı her çalıştırmada kaydedilir.',
      'Sınır notları: çarpışma modeli kapsül–kutu yaklaşığıdır, güvenlik katmanı öğretim modelidir.',
    ],
    tests: [
      'Birim: ArmScript yordamları tek tek çalıştırılır (bu dersin testleri gibi); hedeflerin erişilebilir olduğu ileri/ters kinematikle doğrulanır.',
      'Özellik: bütün karelerde violation() null; aynı program iki çalıştırmada aynı kareleri verir.',
      'Hata: bilerek erişim dışı hedef, duvara ptp ve sonsuz döngü; her biri beklenen hata koduyla durur.',
      'Ölçüm: parça 3, düşürme 0, plan sayısı ve süre eşikleri otomatik denetlenir (G1, G3, G5).',
      'Güvenlik: yasak bölge eklendiğinde program ona girmez ya da zone hatasıyla durur (G2).',
    ],
  },
  en: {
    title: 'Capstone: a palletising cell',
    summary: 'A collision-free, measured and tested ArmScript program that picks three parts from the pick area of the virtual cell with a wall and places them in a pallet layout in the place area.',
    scenario: 'The cell has three cubes (0.06 m) in pick area A, an empty pallet in place area B and a wall 0.42 m high between them. The program takes the parts one at a time, carries them over or around the wall and puts them in the cells of a 2x2 layout. At the end it prints how many parts were moved.',
    requirements: [
      'R1: The program ends without an error (the interpreter raises none) and all three parts stand in the place area at least 0.08 m apart.',
      'R2: In no simulation frame does the arm touch the table, the wall or a restricted zone (checked frame by frame).',
      'R3: No part is dropped: every release is made with the TCP at the part\'s centre height (drop count 0).',
      'R4: Free flights across the wall use plan, and vertical descents and lifts onto parts use lin.',
      'R5: The total simulated time is under 30 seconds; the time and plan count go in the report.',
      'R6: After gripping, the program checks itself with holding() and halts on failure.',
    ],
    architecture: [
      'Program: procedures (pick, carry, release), targets in variables defined in one place; no magic numbers.',
      'A motion-choice table: free flight ptp on the half without the wall, plan when crossing the wall, lin for vertical moves; with reasons.',
      'Cell: pick and place areas, the wall, an optional restricted zone and the part list in a single cell definition.',
      'Measurement: parts, drops, plan count, time and the output line recorded on every run.',
      'Limit notes: the collision model is a capsule–box approximation, the safety layer is a teaching model.',
    ],
    tests: [
      'Unit: ArmScript procedures run one by one (like this course\'s tests); the targets are verified reachable with forward/inverse kinematics.',
      'Property: violation() is null in all frames; the same program gives the same frames on two runs.',
      'Error: a deliberately unreachable target, a ptp into the wall and an infinite loop; each stops with the expected error code.',
      'Measurement: parts 3, drops 0, plan count and time thresholds are checked automatically (R1, R3, R5).',
      'Safety: when a restricted zone is added, the program does not enter it or stops with a zone error (R2).',
    ],
  },
  deliverables: [
    D(3, ['Hücre ve erişim raporu', 'Alma ve bırakma noktalarının ileri/ters kinematikle erişilebilirliği ve çözüm sayıları.'], ['Cell and reach report', 'Reachability of the pick and place points and their solution counts, using forward/inverse kinematics.']),
    D(5, ['Tek parça al-bırak', 'Duvarsız hücrede bir parçanın al-bırakı; süre ve düşürme ölçümü.'], ['Single-part pick-and-place', 'Pick-and-place of one part in the cell without the wall; time and drop measurement.']),
    D(7, ['Yordamlı program', 'Üç parçayı yordamlarla ve döngüyle taşıyan, hata iletileri denenmiş program.'], ['Program with procedures', 'A program that carries three parts with procedures and a loop, with its error messages tried out.']),
    D(8, ['Duvarlı hücrede plan', 'Programın duvarı plan ile aşması; kare kare çarpışma testi ve tohum.'], ['Planning in the cell with the wall', 'The program crossing the wall with plan; a frame-by-frame collision test and the seed.']),
    D(9, ['Güvenlik notu', 'Bir yasak bölge ekleme ve programın ona girmediğini gösterme; sınırların açıkça yazıldığı not.'], ['Safety note', 'Adding a restricted zone and showing the program does not enter it; a note that states the limits openly.']),
    D(10, ['Rapor ve sunum', 'Gereksinimler, mimari, ölçümler (parça, düşürme, plan, süre), sınırlar; canlı çalıştırma ve bilerek üretilmiş bir hata.'], ['Report and presentation', 'Requirements, architecture, measurements (parts, drops, plans, time), limits; a live run and one deliberately produced error.']),
  ],
}

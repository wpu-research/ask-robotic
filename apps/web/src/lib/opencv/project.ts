// OpenCV dersi bitirme projesi: belge tarayıcı. Tarayıcıdaki "Belge tarayıcı hattı" aracı ile aynı aşamalar; öğrenci aynı
// hattı Python cv2 ile kurar, test eder ve sunar. Teslimler ünitelere bağlı (öneri → ara kontrol → demo).
import { D, type KursCapstone } from '@/lib/kurs/types'

export const CV_CAPSTONE: KursCapstone = {
  tr: {
    title: 'Bitirme projesi: belge tarayıcı',
    summary: 'Telefonla eğik çekilmiş bir sayfa fotoğrafından düz, okunur, siyah-beyaz bir tarama üreten hat: kenar, kontur, perspektif düzeltme ve uyarlamalı eşik. Önce tarayıcıda, sonra kendi Python kodunla.',
    scenario: 'Kullanıcı masadaki bir sayfanın fotoğrafını çeker. Program sayfanın dört köşesini bulur (bulamazsa kullanıcıdan dört tıklama ister), sayfayı A4 oranında düzler, gölge ve düzensiz ışığa rağmen yazıyı temiz bir siyah-beyaz görüntüye çevirir ve PNG olarak kaydeder. Bir klasördeki tüm fotoğrafları toplu işleyebilir.',
    requirements: [
      'G1: Test setindeki 20 fotoğrafın en az 17\'sinde köşeler otomatik bulunur; bulunan her köşe elle işaretlenmiş köşeye 2 %\'lik (görüntü köşegeninin) mesafeden yakındır.',
      'G2: Köşe bulunamazsa program çökmez; kullanıcıdan dört nokta ister ve aynı hattı sürdürür.',
      'G3: Çıktı A4 oranındadır (1 : 1,414 ± %2) ve satırlar yataydan en fazla 1° sapar.',
      'G4: Düzensiz ışıkta (bir yanı gölgede) çekilmiş sayfada zemin beyaz kalır: zeminin %95\'i 255.',
      'G5: 12 MP bir fotoğraf dizüstü bilgisayarda 1 saniyeden kısa sürede işlenir (işlem önce 1000 px\'e küçültülür, köşeler geri ölçeklenir).',
      'G6: Komut satırı arayüzü: tarayici.py girdi_klasoru cikti_klasoru [--debug]; --debug her aşamanın ara görüntüsünü kaydeder.',
    ],
    architecture: [
      'onisle(img) → küçültme ölçeği ve gri, bulanık görüntü (2. ve 4. üniteler).',
      'kenarlar(gri) → Canny + genişletme ile kapalı sınırlar (5. ve 6. üniteler).',
      'kose_bul(kenar) → en büyük dışbükey dörtgen kontur, sıralı dört köşe ya da None (7. ünite).',
      'duzle(img, koseler) → homografi ve warpPerspective, A4 oranında hedef (9. ünite).',
      'taranmis(duz) → uyarlamalı eşik ya da black-hat ile siyah-beyaz (3. ve 6. üniteler).',
      'Her fonksiyon saf: görüntü alır, görüntü/değer döner; G/Ç (dosya, kamera, tıklama) yalnız ana modülde.',
    ],
    tests: [
      'Birim: kose_sirala dört noktayı her girdi sırasında aynı sıraya koyar (24 permütasyon).',
      'Birim: sentetik eğik dikdörtgen (bilinen köşeler) üretip kose_bul\'un 2 px içinde bulduğunu sına (bu dersteki örnek sahne gibi).',
      'Birim: duzle sonrası dört köşe hedef dikdörtgenin köşelerine 0,5 px içinde düşer (gidiş-dönüş).',
      'Kabul: 20 fotoğraflık altın set; G1, G3 ve G4 ölçütlerini hesaplayan bir betik ve sonuç tablosu.',
      'Performans: 20 fotoğrafın ortalama ve en kötü işlem süresi; G5\'i aşan fotoğraf sayısı.',
      'Hata durumları: boş görüntü, tamamen siyah görüntü, sayfa yok, iki sayfa yan yana.',
    ],
    demo: [
      'Canlı demo: o an çekilen bir fotoğrafı tara, --debug ara görüntülerini göster.',
      'Başarısız bir örneği göster ve nedenini aşama aşama açıkla (hangi aşama, hangi parametre).',
      'Test tablosu: G1–G6 için ölçülen değerler ve geçti/kaldı.',
      'Sonraki adım önerisi: OCR (Tesseract) ya da kamerada canlı köşe izleme.',
    ],
  },
  en: {
    title: 'Capstone project: document scanner',
    summary: 'A pipeline that turns a phone photo of a page shot at an angle into a flat, readable, black-and-white scan: edges, contours, perspective correction and adaptive thresholding. First in the browser, then with your own Python code.',
    scenario: 'The user takes a photo of a page on a desk. The program finds the page\'s four corners (if it cannot, it asks the user for four clicks), flattens the page to A4 proportions, turns the text into a clean black-and-white image despite shadows and uneven light, and saves it as PNG. It can batch-process all photos in a folder.',
    requirements: [
      'R1: Corners are found automatically in at least 17 of the 20 test photos; each found corner is within 2% (of the image diagonal) of the hand-marked corner.',
      'R2: If no corners are found the program does not crash; it asks the user for four points and continues with the same pipeline.',
      'R3: The output has A4 proportions (1 : 1.414 ± 2%) and lines deviate from horizontal by at most 1°.',
      'R4: On a page shot under uneven light (one side in shadow) the background stays white: 95% of the background is 255.',
      'R5: A 12 MP photo is processed in under 1 second on a laptop (processing is first downscaled to 1000 px and corners are scaled back).',
      'R6: Command-line interface: scanner.py input_folder output_folder [--debug]; --debug saves the intermediate image of every stage.',
    ],
    architecture: [
      'preprocess(img) → downscale factor and a gray, blurred image (units 2 and 4).',
      'edges(gray) → closed boundaries with Canny + dilation (units 5 and 6).',
      'find_corners(edges) → the largest convex quadrilateral contour, four ordered corners or None (unit 7).',
      'flatten(img, corners) → homography and warpPerspective to an A4-shaped target (unit 9).',
      'scanned(flat) → black and white with an adaptive threshold or black-hat (units 3 and 6).',
      'Every function is pure: takes an image, returns an image/value; I/O (files, camera, clicks) only in the main module.',
    ],
    tests: [
      'Unit: order_corners puts four points into the same order for every input order (24 permutations).',
      'Unit: generate a synthetic tilted rectangle (known corners) and check that find_corners finds them within 2 px (like the sample scene in this course).',
      'Unit: after flatten the four corners land within 0.5 px of the target rectangle\'s corners (round trip).',
      'Acceptance: a 20-photo golden set; a script that computes the R1, R3 and R4 criteria and a results table.',
      'Performance: mean and worst processing time over the 20 photos; the number of photos exceeding R5.',
      'Error cases: empty image, all-black image, no page, two pages side by side.',
    ],
    demo: [
      'Live demo: scan a photo taken on the spot, show the --debug intermediate images.',
      'Show a failing example and explain why stage by stage (which stage, which parameter).',
      'Test table: measured values and pass/fail for R1–R6.',
      'Proposed next step: OCR (Tesseract) or live corner tracking on the camera.',
    ],
  },
  deliverables: [
    D(3, ['Öneri ve test seti', 'Kapsam, gereksinimler (G1–G6) ve 20 fotoğraflık altın set: her fotoğrafta köşeler elle işaretlenmiş (JSON).'], ['Proposal and test set', 'Scope, requirements (R1–R6) and a 20-photo golden set: corners hand-marked on every photo (JSON).']),
    D(6, ['Ön işleme ve kenarlar', 'onisle ve kenarlar fonksiyonları, --debug çıktıları ve birim testleri.'], ['Preprocessing and edges', 'The preprocess and edges functions, --debug outputs and unit tests.']),
    D(7, ['Köşe bulma', 'kose_bul ve kose_sirala; altın sette G1 ölçümü ve başarısız örneklerin listesi.'], ['Corner finding', 'find_corners and order_corners; R1 measured on the golden set and a list of failures.']),
    D(9, ['Düzleme ve tarama', 'duzle ve taranmis; G3 ve G4 ölçümleri, elle köşe girişi (G2).'], ['Flattening and scanning', 'flatten and scanned; R3 and R4 measurements, manual corner input (R2).']),
    D(12, ['Demo ve rapor', 'Komut satırı aracı, performans ölçümü (G5), test tablosu, 5 dakikalık demo ve kısa rapor.'], ['Demo and report', 'Command-line tool, performance measurement (R5), test table, a 5-minute demo and a short report.']),
  ],
}

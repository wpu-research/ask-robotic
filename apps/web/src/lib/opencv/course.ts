// OpenCV ile Görüntü İşleme (büyükler için, 16+): 12 ünite, TR/EN. Her ünitede tarayıcıda çalışan bir oyun alanı (örnek
// görüntü, yükleme ya da kamera; önce/sonra), eşdeğer Python cv2 kodu (Pyodide + opencv-python ile tarayıcıda da çalışır),
// "Kendin dene" ve 4 soruluk quiz. Bitirme: belge tarayıcı.
import type { KursMeta, KursUnit } from '@/lib/kurs/types'
import type { CvToolId } from './tools'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

export type CvUnit = KursUnit<CvToolId>
export const CV_UNITS: readonly CvUnit[] = [...UNITS_A, ...UNITS_B]
export const cvUnitOf = (n: number): CvUnit | undefined => CV_UNITS.find((u) => u.n === n)
export const CV_BASE = '/muhendislik/opencv'

export const CV_COURSE: KursMeta = {
  slug: 'opencv',
  code: 'OPENCV',
  hours: 36,
  tr: {
    title: 'OpenCV ile Görüntü İşleme',
    lede: 'Bir görüntünün sayılardan oluşan bir dizi olduğunu görmekten başla; eşikleme, filtreler, kenarlar, morfoloji, konturlar, renk takibi, perspektif düzeltme, öznitelik eşleştirme, yüz algılama ve arka plan çıkarmayla bitir. Her ünitede işlem tarayıcıda örnek görüntü, kendi fotoğrafın ya da kameran üstünde çalışır; yanında aynı işin Python cv2 kodu.',
    audience: 'Büyükler için · 16 yaş ve üstü: lise son sınıf, meslek okulu, üniversite ve meslekten öğrenenler',
    prereq: 'Temel Python (değişken, döngü, fonksiyon, liste). NumPy bilmek yardımcı olur; ilk ünitede gereken kadarı anlatılır.',
    outcomes: [
      'Görüntüyü NumPy dizisi olarak okumak, kanallarını ve renk uzaylarını (BGR, gri, HSV) seçmek',
      'Histogram, eşitleme ve Otsu ile uyarlamalı eşiklemeyi duruma göre seçmek',
      'Evrişimi elle hesaplamak; bulanıklaştırma, keskinleştirme ve kenar algılamayı ayarlamak',
      'Morfoloji ve konturlarla nesneleri ayırmak, saymak ve şekillerini ölçmek',
      'HSV maskesiyle renkli bir nesneyi izlemek, perspektifi düzeltip belge taramak',
      'Köşe ve öznitelik eşleştirmeyi, Haar kademesini ve modern yüz algılayıcıları karşılaştırmak',
      'Videoda arka plan çıkarma, izleme ve sayım yapan küçük bir hat kurup test etmek',
    ],
  },
  en: {
    title: 'Image Processing with OpenCV',
    lede: 'Start by seeing that an image is an array of numbers; finish with thresholding, filters, edges, morphology, contours, colour tracking, perspective correction, feature matching, face detection and background subtraction. In every unit the operation runs in your browser on a sample image, your own photo or your camera, next to the Python cv2 code for the same job.',
    audience: 'For adults · ages 16 and up: final-year high school, vocational school, university and working learners',
    prereq: 'Basic Python (variables, loops, functions, lists). Knowing NumPy helps; the first unit covers what you need.',
    outcomes: [
      'Read an image as a NumPy array and pick its channels and colour spaces (BGR, gray, HSV)',
      'Choose between histograms, equalisation, Otsu and adaptive thresholding for the situation',
      'Compute a convolution by hand; tune blurring, sharpening and edge detection',
      'Separate, count and measure objects with morphology and contours',
      'Track a coloured object with an HSV mask; correct perspective and scan a document',
      'Compare corner and feature matching, the Haar cascade and modern face detectors',
      'Build and test a small video pipeline with background subtraction, tracking and counting',
    ],
  },
}

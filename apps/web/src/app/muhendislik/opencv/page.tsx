import type { Metadata } from 'next'
import { KursOverview } from '@/components/kurs/kurs-pages'
import { CV_CONFIG } from '@/components/opencv/cv-course'
import { getLocale } from '@/i18n/server'

export const metadata: Metadata = {
  title: 'OpenCV ile Görüntü İşleme',
  description: 'Büyükler için (16+) görüntü işleme dersi: 12 ünite, her ünitede tarayıcıda çalışan oyun alanı ve Python cv2 kodu; bitirme projesi belge tarayıcı.',
}

export default async function OpencvDersi() {
  return <KursOverview c={CV_CONFIG} lang={await getLocale()} />
}

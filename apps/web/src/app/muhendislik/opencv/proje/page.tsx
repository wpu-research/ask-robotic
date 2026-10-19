import type { Metadata } from 'next'
import { KursCapstonePage } from '@/components/kurs/kurs-pages'
import { CV_CONFIG } from '@/components/opencv/cv-course'
import { getLocale } from '@/i18n/server'

export const metadata: Metadata = { title: 'OpenCV bitirme projesi: belge tarayıcı', description: 'Eğik çekilmiş sayfadan düz, okunur tarama: gereksinimler, mimari, testler, teslimler ve tarayıcıda çalışan hat.' }

export default async function OpencvProje() {
  return <KursCapstonePage c={CV_CONFIG} lang={await getLocale()} />
}

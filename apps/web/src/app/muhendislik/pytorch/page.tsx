import type { Metadata } from 'next'
import { KursOverview } from '@/components/kurs/kurs-pages'
import { PT_CONFIG } from '@/components/pytorch/pt-course'
import { getLocale } from '@/i18n/server'

export const metadata: Metadata = {
  title: 'PyTorch ile Derin Öğrenme',
  description: 'Büyükler için (16+) derin öğrenme dersi: 10 ünite, her ünitede tarayıcıda görselleştirici, gerçek PyTorch kodu ve Colab defteri; bitirme projesi rakam tanıyan CNN.',
}

export default async function PytorchDersi() {
  return <KursOverview c={PT_CONFIG} lang={await getLocale()} />
}

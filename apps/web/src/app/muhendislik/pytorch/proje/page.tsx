import type { Metadata } from 'next'
import { KursCapstonePage } from '@/components/kurs/kurs-pages'
import { PT_CONFIG } from '@/components/pytorch/pt-course'
import { getLocale } from '@/i18n/server'

export const metadata: Metadata = { title: 'PyTorch bitirme projesi: rakam tanıyan CNN', description: 'MNIST\'te küçük CNN: eğitim, değerlendirme, dışa aktarma ve tarayıcıda çalışan tanıyıcı; gereksinimler, testler ve teslimler.' }

export default async function PytorchProje() {
  return <KursCapstonePage c={PT_CONFIG} lang={await getLocale()} />
}

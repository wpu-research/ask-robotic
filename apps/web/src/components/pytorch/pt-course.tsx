// PyTorch dersinin sayfa yapılandırması (sunucu modülü): ortak ders iskeletine görselleştiricileri ve Colab defterlerini bağlar.
import Link from 'next/link'
import type { KursConfig } from '@/components/kurs/kurs-pages'
import { digitsPy } from '@/lib/pytorch/code'
import { notebookHref, PT_BASE, PT_COURSE, PT_UNITS } from '@/lib/pytorch/course'
import { PT_CAPSTONE } from '@/lib/pytorch/project'
import { PT_VIZ_META, type PtVizId } from '@/lib/pytorch/tools'
import { PtVizBox } from './pt-viz-box'

export const PT_CONFIG: KursConfig<PtVizId> = {
  base: PT_BASE,
  meta: PT_COURSE,
  units: PT_UNITS,
  capstone: PT_CAPSTONE,
  testId: 'pt',
  eyebrow: { tr: 'Büyükler için · görselleştirici + gerçek PyTorch kodu + Colab defteri', en: 'For adults · visualiser + real PyTorch code + Colab notebook' },
  toolsHeading: { tr: ['Görselleştirici', 'Görselleştiriciler'], en: ['Visualiser', 'Visualisers'] },
  toolTitle: (id, lang) => PT_VIZ_META[id][lang].title,
  renderTool: (id, lang) => <PtVizBox id={id} lang={lang} />,
  notebookHref,
  capstoneTool: (lang) => <PtVizBox id="digits" lang={lang} />,
  capstoneCode: (lang) => [digitsPy(lang)],
  extra: (lang) => (
    <section className="panel" aria-labelledby="pt-how">
      <h2 id="pt-how" className="panel-title">{lang === 'en' ? 'How it works' : 'Nasıl çalışır'}</h2>
      <ul className="eng-list">
        <li>{lang === 'en' ? 'PyTorch cannot run in the browser. Each unit has an honest visualiser that does the same maths in TypeScript (real training of small networks, a real trained CNN), next to real PyTorch code.' : 'PyTorch tarayıcıda çalışamaz. Her ünitede aynı matematiği TypeScript\'te yapan dürüst bir görselleştirici (küçük ağların gerçek eğitimi, gerçekten eğitilmiş bir CNN) ve yanında gerçek PyTorch kodu var.'}</li>
        <li>{lang === 'en' ? 'Every unit has a downloadable notebook: open it in Google Colab with "File → Upload notebook" and run it on a free GPU.' : 'Her ünitenin indirilebilir bir defteri var: Google Colab\'da "Dosya → Not defteri yükle" ile açıp ücretsiz GPU\'da çalıştır.'}</li>
        <li><Link href="/makine-ogrenmesi">{lang === 'en' ? 'Machine learning course: linear regression, gradient descent, neural networks, attention' : 'Makine öğrenmesi dersi: doğrusal regresyon, gradyan inişi, sinir ağları, dikkat'}</Link></li>
        <li><Link href="/muhendislik/robotik/hafta/11">{lang === 'en' ? 'ESOF 323, week 11: deep learning and edge AI in robots' : 'ESOF 323, 11. hafta: robotlarda derin öğrenme ve uçta yapay zekâ'}</Link></li>
      </ul>
    </section>
  ),
}

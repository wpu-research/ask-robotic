// OpenCV dersinin sayfa yapılandırması (sunucu modülü): ortak ders iskeletine araç kutusu, çalıştırılabilir kod ve ek
// bölümleri bağlar. Araçlar istemci bileşenidir; burada yalnız oluşturulur.
import Link from 'next/link'
import type { KursConfig } from '@/components/kurs/kurs-pages'
import { CV_BASE, CV_COURSE, CV_UNITS } from '@/lib/opencv/course'
import { scannerPy } from '@/lib/opencv/code'
import { CV_CAPSTONE } from '@/lib/opencv/project'
import { CV_TOOL_META, type CvToolId } from '@/lib/opencv/tools'
import type { SampleId } from '@/lib/opencv/samples'
import { CvToolBox } from './cv-tool-box'
import { CvCode } from './cv-code'

/** Her ünitenin tarayıcıda çalıştırılan koduna verilecek varsayılan girdi görüntüsü. */
const RUN_SAMPLE: Record<number, SampleId> = { 1: 'shapes', 2: 'lowlight', 3: 'page', 4: 'shapes', 5: 'blocks', 6: 'coins', 7: 'shapes', 8: 'fruit', 9: 'document', 10: 'blocks', 11: 'face', 12: 'shapes' }

export const CV_CONFIG: KursConfig<CvToolId> = {
  base: CV_BASE,
  meta: CV_COURSE,
  units: CV_UNITS,
  capstone: CV_CAPSTONE,
  testId: 'cv',
  eyebrow: { tr: 'Büyükler için · tarayıcıda görüntü işleme + Python cv2', en: 'For adults · image processing in the browser + Python cv2' },
  toolsHeading: { tr: ['Oyun alanı', 'Oyun alanları'], en: ['Playground', 'Playgrounds'] },
  toolTitle: (id, lang) => CV_TOOL_META[id][lang].title,
  renderTool: (id, lang) => <CvToolBox id={id} lang={lang} />,
  renderCode: (k, lang, u) => <CvCode block={k} lang={lang} sampleId={RUN_SAMPLE[u.n] ?? 'shapes'} />,
  capstoneTool: (lang) => <CvToolBox id="scanner" lang={lang} />,
  capstoneCode: (lang) => [scannerPy(lang)],
  extra: (lang) => (
    <section className="panel" aria-labelledby="cv-how">
      <h2 id="cv-how" className="panel-title">{lang === 'en' ? 'How it works' : 'Nasıl çalışır'}</h2>
      <ul className="eng-list">
        <li>{lang === 'en' ? 'Every unit has a playground: sample images we generated, your own photo or a camera frame; before/after side by side. Nothing leaves your device.' : 'Her ünitede bir oyun alanı: kendi ürettiğimiz örnek görüntüler, kendi fotoğrafın ya da kameradan bir kare; önce/sonra yan yana. Hiçbir şey cihazından çıkmaz.'}</li>
        <li>{lang === 'en' ? 'The Python cv2 code next to it runs in the browser too (Pyodide + OpenCV) on the same image; then on your own computer with pip install opencv-python.' : 'Yanındaki Python cv2 kodu da tarayıcıda (Pyodide + OpenCV) aynı görüntü üstünde çalışır; sonra kendi bilgisayarında pip install opencv-python ile.'}</li>
        <li><Link href="/robotun-gozleri/demolar">{lang === 'en' ? 'Real-Life Demos: the same methods in eight on-device applications' : 'Gerçek Hayat Demoları: aynı yöntemler sekiz cihaz içi uygulamada'}</Link></li>
        <li><Link href="/muhendislik/robotik/hafta/10">{lang === 'en' ? 'ESOF 323, week 10: computer vision for robots' : 'ESOF 323, 10. hafta: robotlar için bilgisayarlı görü'}</Link></li>
      </ul>
    </section>
  ),
}

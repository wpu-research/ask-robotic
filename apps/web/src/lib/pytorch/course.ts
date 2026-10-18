// PyTorch ile Derin Öğrenme (büyükler için, 16+): 10 ünite, TR/EN. PyTorch tarayıcıda (Pyodide'de) çalışmaz; bu yüzden her
// ünitede (a) aynı matematiği TypeScript'te yapan dürüst bir görselleştirici, (b) gerçek PyTorch kodu, (c) Google Colab'da
// çalışan indirilebilir bir defter (public/defterler/pytorch) var. Bitirme: el yazısı rakam tanıyan CNN, uçtan uca.
import type { KursMeta, KursUnit } from '@/lib/kurs/types'
import type { PtVizId } from './tools'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

export type PtUnit = KursUnit<PtVizId>
export const PT_UNITS: readonly PtUnit[] = [...UNITS_A, ...UNITS_B]
export const ptUnitOf = (n: number): PtUnit | undefined => PT_UNITS.find((u) => u.n === n)
export const PT_BASE = '/muhendislik/pytorch'
/** Defterlerin sunulduğu klasör (public altında). */
export const NOTEBOOK_DIR = '/defterler/pytorch'
export const notebookHref = (name: string, lang: 'tr' | 'en') => `${NOTEBOOK_DIR}/${name}${lang === 'en' ? '.en' : ''}.ipynb`

export const PT_COURSE: KursMeta = {
  slug: 'pytorch',
  code: 'PYTORCH',
  hours: 40,
  tr: {
    title: 'PyTorch ile Derin Öğrenme',
    lede: 'Tensörlerden ve otomatik türevden başlayıp nn.Module, kayıp ve optimize ediciler, eğitim döngüsü, DataLoader, evrişimli ağlar, düzenlileştirme, RNN/LSTM ve dikkat, aktarım öğrenmesi ve dağıtıma kadar. Her ünitede matematiği tarayıcıda adım adım gösteren bir görselleştirici, gerçek PyTorch kodu ve Google Colab\'da çalıştıracağın bir defter var.',
    audience: 'Büyükler için · 16 yaş ve üstü: lise son sınıf, meslek okulu, üniversite ve meslekten öğrenenler',
    prereq: 'Python ve temel NumPy; türevin ne olduğunu bilmek. Makine öğrenmesi dersindeki doğrusal regresyon, gradyan inişi ve sinir ağı derslerini bitirmiş olmak çok yardımcı olur.',
    outcomes: [
      'Tensör şekillerini, yayınlamayı ve cihaz (CPU/GPU) ayrımını hatasız yönetmek',
      'Autograd\'ın hesaplama grafiği üstünde gradyanı nasıl bulduğunu açıklamak ve doğrulamak',
      'nn.Module ile model yazmak; kayıp, optimize edici ve öğrenme oranını seçmek',
      'Eğitim/doğrulama ayrımlı, tekrarlanabilir bir eğitim döngüsü ve DataLoader kurmak',
      'Evrişimli ağ tasarlamak, öznitelik haritalarını okumak, aşırı öğrenmeyi düzenlileştirmeyle önlemek',
      'RNN, LSTM ve dikkatin hangi sorunu çözdüğünü açıklamak',
      'Önceden eğitilmiş modeli ince ayarlamak; TorchScript, ONNX ve nicemleme ile dağıtıma hazırlamak',
    ],
  },
  en: {
    title: 'Deep Learning with PyTorch',
    lede: 'From tensors and automatic differentiation to nn.Module, losses and optimisers, the training loop, DataLoader, convolutional networks, regularisation, RNN/LSTM and attention, transfer learning and deployment. Every unit has a visualiser that shows the maths step by step in the browser, real PyTorch code and a notebook you run in Google Colab.',
    audience: 'For adults · ages 16 and up: final-year high school, vocational school, university and working learners',
    prereq: 'Python and basic NumPy; knowing what a derivative is. Having finished the linear regression, gradient descent and neural network lessons of the machine learning course helps a lot.',
    outcomes: [
      'Handle tensor shapes, broadcasting and devices (CPU/GPU) without errors',
      'Explain and verify how autograd finds gradients on the computational graph',
      'Write models with nn.Module; choose the loss, the optimiser and the learning rate',
      'Build a reproducible training loop with a train/validation split and a DataLoader',
      'Design a convolutional network, read its feature maps, prevent overfitting with regularisation',
      'Explain which problem RNNs, LSTMs and attention solve',
      'Fine-tune a pretrained model; prepare it for deployment with TorchScript, ONNX and quantisation',
    ],
  },
}

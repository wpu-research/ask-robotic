// PyTorch dersi bitirme projesi: el yazısı rakam tanıyan CNN, uçtan uca (veri → eğitim → değerlendirme → dışa aktarma →
// tarayıcıda çalıştırma). Tarayıcıdaki "Rakam tanıyıcı" aracı aynı mimariyi kullanır; öğrencinin defterden indirdiği ağırlık
// JSON'u araca yüklenip denenebilir.
import { D, type KursCapstone } from '@/lib/kurs/types'

export const PT_CAPSTONE: KursCapstone = {
  notebook: 'bitirme-rakam-cnn',
  tr: {
    title: 'Bitirme projesi: el yazısı rakam tanıyan CNN',
    summary: 'MNIST\'te küçük bir evrişimli ağ eğit, ölç, hatalarını incele, dışa aktar ve tarayıcıda kendi çizdiğin rakamlarla dene. Colab defteri ve tarayıcıdaki tanıyıcı aynı mimariyi kullanır.',
    scenario: 'Bir okul, öğrencilerin tablete yazdığı tek haneli cevapları otomatik okumak istiyor. Model telefonda ve tarayıcıda, internete görüntü göndermeden çalışmalı. Sen modeli eğitir, sınırlarını ölçer, dağıtıma hazırlar ve bir demo sayfasında gösterirsin.',
    requirements: [
      'G1: MNIST test kümesinde doğruluk en az %98.',
      'G2: Model 50 000 parametreden küçük; fp32 ağırlık dosyası 200 KB\'den küçük.',
      'G3: Karışıklık matrisi ve en çok karıştırılan üç sınıf çifti raporlanır; her biri için 5 yanlış örnek gösterilir.',
      'G4: Eğitim tekrarlanabilir: aynı tohumla iki çalıştırmada test doğruluğu ±%0,1 içinde.',
      'G5: Ağırlıklar JSON (tarayıcı) ve ONNX olarak dışa aktarılır; tarayıcıdaki tanıyıcıya yüklenince aynı 200 test örneğinde PyTorch ile aynı tahminleri verir.',
      'G6: Kendi çizdiğin 30 rakamlık bir küme (her rakamdan 3) toplanır ve doğruluğu ayrıca raporlanır (dağılım kayması).',
    ],
    architecture: [
      'Veri: torchvision.datasets.MNIST, eğitimden %10 doğrulama ayrımı (sabit tohum), Normalize(0,1307, 0,3081) (5. ve 6. üniteler).',
      'Model: Conv2d(1,8,3,p=1) → ReLU → MaxPool → Conv2d(8,16,3,p=1) → ReLU → MaxPool → Linear(784,10); isteğe bağlı Dropout (3., 7. ve 8. üniteler).',
      'Eğitim: Adam lr = 1e-3, 4–8 tur, erken durdurma ve en iyi checkpoint (4. ve 5. üniteler).',
      'Değerlendirme: doğruluk, karışıklık matrisi, yanlış örnek galerisi, öznitelik haritaları (7. ünite).',
      'Dağıtım: state_dict, JSON ve ONNX; int8 nicemleme denemesi ve ölçümü (10. ünite).',
      'Demo: bu sayfadaki tarayıcı tanıyıcı (kendi ağırlık JSON\'unla) ya da onnxruntime-web ile kendi sayfan.',
    ],
    tests: [
      'Birim: model rastgele (4, 1, 28, 28) girdide (4, 10) çıkış verir; parametre sayısı beklenen değerde.',
      'Birim: tek bir küçük yığını (32 örnek) 200 adımda ezberleyebilir (kayıp < 0,01): döngüde hata yok.',
      'Birim: Dataset ve DataLoader şekil ve tip testleri; doğrulama ayrımı tohumla aynı.',
      'Tutarlılık: PyTorch ve tarayıcı (JSON) tahminleri 200 test örneğinde aynı (G5).',
      'Kabul: G1–G6 ölçütlerini hesaplayan son defter hücresi ve sonuç tablosu.',
      'Gürbüzlük: ±2 piksel kaydırılmış ve hafif döndürülmüş test görüntülerinde doğruluk.',
    ],
    demo: [
      'Canlı demo: tarayıcıda rakam çiz; olasılıklar ve öznitelik haritaları.',
      'Karışıklık matrisinden bir hata türünü seç ve neden olduğunu örneklerle açıkla.',
      'Nicemleme öncesi/sonrası: boyut, doğruluk, süre.',
      'Kendi çizimlerindeki doğruluk ile MNIST doğruluğu arasındaki farkı ve nedenini (veri dağılımı) tartış.',
    ],
  },
  en: {
    title: 'Capstone project: a CNN that reads handwritten digits',
    summary: 'Train a small convolutional network on MNIST, measure it, study its mistakes, export it and try it in the browser with digits you draw. The Colab notebook and the in-browser recogniser use the same architecture.',
    scenario: 'A school wants to read single-digit answers that students write on a tablet automatically. The model must run on the phone and in the browser without sending images to the internet. You train the model, measure its limits, prepare it for deployment and show it on a demo page.',
    requirements: [
      'R1: At least 98% accuracy on the MNIST test set.',
      'R2: The model has fewer than 50,000 parameters; the fp32 weights file is smaller than 200 KB.',
      'R3: A confusion matrix and the three most confused class pairs are reported; 5 wrong examples are shown for each.',
      'R4: Training is reproducible: two runs with the same seed give test accuracy within ±0.1%.',
      'R5: The weights are exported as JSON (browser) and ONNX; loaded into the in-browser recogniser they give the same predictions as PyTorch on the same 200 test samples.',
      'R6: A set of 30 digits you draw yourself (3 of each digit) is collected and its accuracy is reported separately (distribution shift).',
    ],
    architecture: [
      'Data: torchvision.datasets.MNIST, a 10% validation split of the training set (fixed seed), Normalize(0.1307, 0.3081) (units 5 and 6).',
      'Model: Conv2d(1,8,3,p=1) → ReLU → MaxPool → Conv2d(8,16,3,p=1) → ReLU → MaxPool → Linear(784,10); optional Dropout (units 3, 7 and 8).',
      'Training: Adam lr = 1e-3, 4–8 epochs, early stopping and the best checkpoint (units 4 and 5).',
      'Evaluation: accuracy, confusion matrix, a gallery of wrong examples, feature maps (unit 7).',
      'Deployment: state_dict, JSON and ONNX; an int8 quantisation trial and measurement (unit 10).',
      'Demo: the in-browser recogniser on this page (with your own weights JSON) or your own page with onnxruntime-web.',
    ],
    tests: [
      'Unit: the model gives a (4, 10) output on a random (4, 1, 28, 28) input; the parameter count is as expected.',
      'Unit: it can memorise a single small batch (32 samples) in 200 steps (loss < 0.01): no bug in the loop.',
      'Unit: shape and type tests for the Dataset and DataLoader; the validation split is the same with the seed.',
      'Consistency: PyTorch and browser (JSON) predictions agree on the 200 test samples (R5).',
      'Acceptance: a final notebook cell that computes the R1–R6 criteria and a results table.',
      'Robustness: accuracy on test images shifted by ±2 pixels and slightly rotated.',
    ],
    demo: [
      'Live demo: draw a digit in the browser; probabilities and feature maps.',
      'Pick one error type from the confusion matrix and explain its cause with examples.',
      'Before/after quantisation: size, accuracy, time.',
      'Discuss the gap between accuracy on your own drawings and on MNIST, and its cause (data distribution).',
    ],
  },
  deliverables: [
    D(3, ['Öneri ve model taslağı', 'Kapsam, gereksinimler (G1–G6), model sınıfı ve şekil testi.'], ['Proposal and model draft', 'Scope, requirements (R1–R6), the model class and its shape test.']),
    D(6, ['Veri hattı ve ilk eğitim', 'Dataset/DataLoader, doğrulama ayrımı, ilk eğitim eğrileri ve tek yığın ezberleme testi.'], ['Data pipeline and first training', 'Dataset/DataLoader, validation split, first training curves and the single-batch memorisation test.']),
    D(8, ['Değerlendirme ve iyileştirme', 'G1 ve G4; karışıklık matrisi, yanlış örnekler, düzenlileştirme ablasyonu.'], ['Evaluation and improvement', 'R1 and R4; confusion matrix, wrong examples, a regularisation ablation.']),
    D(10, ['Dağıtım ve demo', 'JSON ve ONNX dışa aktarma, tarayıcıda tutarlılık testi (G5), nicemleme ölçümü, kendi çizim kümen (G6), 5 dakikalık demo ve kısa rapor.'], ['Deployment and demo', 'JSON and ONNX export, in-browser consistency test (R5), quantisation measurement, your own drawing set (R6), a 5-minute demo and a short report.']),
  ],
}

// Makine Öğrenmesi kursunun bölümleri, sırasıyla. Her bölüm ders slug'larını sırasıyla listeler; lessons.ts numaraları buradan verir.
import type { Bi } from './core'

export interface Section { id: string; title: Bi; sub: Bi; slugs: string[] }

export const SECTIONS: Section[] = [
  {
    id: 'temeller',
    title: { tr: 'Temeller', en: 'Foundations' },
    sub: { tr: 'Bir doğrudan küçük bir sinir ağına: öğrenmenin hep aynı döngüsü ve ezberlemenin tehlikesi.', en: 'From a straight line to a small neural network: the same learning loop every time, and the danger of memorising.' },
    slugs: ['dogrusal-regresyon', 'lojistik-noron', 'perceptron', 'sinir-agi', 'asiri-ogrenme', 'ayni-kod-uc-urun'],
  },
  {
    id: 'ogrenmenin-motoru',
    title: { tr: 'Öğrenmenin motoru', en: 'The engine of learning' },
    sub: { tr: 'Aktivasyon eğrileri, kayıp arazisinde yokuş aşağı yürümek ve hatayı ağırlıklara paylaştıran geri yayılım.', en: 'Activation curves, walking downhill on the loss landscape, and backpropagation sharing the blame among the weights.' },
    slugs: ['aktivasyon-fonksiyonlari', 'gradyan-inisi', 'geri-yayilim', 'zincir-kurali'],
  },
  {
    id: 'klasik-algoritmalar',
    title: { tr: 'Klasik algoritmalar', en: 'Classic algorithms' },
    sub: { tr: 'Komşulara bakmak, olasılık saymak, soru sormak, ağaçları oylatmak ve etiketsiz veride grup bulmak.', en: 'Asking the neighbours, counting probabilities, asking questions, letting trees vote and finding groups in unlabelled data.' },
    slugs: ['k-en-yakin-komsu', 'naive-bayes', 'spam-filtresi', 'karar-agaci', 'rastgele-orman', 'gradyan-artirma', 'destek-vektor-makinesi', 'k-means', 'dbscan', 'pca'],
  },
  {
    id: 'goren-ve-yazan',
    title: { tr: 'Gören ve yazan modeller', en: 'Models that see and write' },
    sub: { tr: 'Pikselden rakam okuyan, kelimeden kelime türeten ve iki sayıdan yeni bir resim boyayan modeller.', en: 'Models that read digits from pixels, generate word after word and paint a new picture from two numbers.' },
    slugs: ['rakam-tanima', 'mini-dil-modeli', 'goruntu-ureteci'],
  },
  {
    id: 'deneyerek-ogrenen',
    title: { tr: 'Deneyerek öğrenen ve öneren sistemler', en: 'Systems that learn by trying and recommend' },
    sub: { tr: 'Labirentte deneme yanılmayla yol bulan bir ajan ve kimin neyi seveceğini tahmin eden bir öneri sistemi.', en: 'An agent that finds its way through a maze by trial and error, and a recommender that guesses who will like what.' },
    slugs: ['q-ogrenme', 'oneri-sistemi'],
  },
  {
    id: 'olcmek-ve-aciklamak',
    title: { tr: 'Modeli ölçmek ve açıklamak', en: 'Measuring and explaining a model' },
    sub: { tr: 'Doğruluk yetmez: kesinlik ve duyarlılık, her özelliğin tahmine katkısı ve gerçekten işe yarayan sensörler.', en: 'Accuracy is not enough: precision and recall, each feature’s share of a prediction, and the sensors that really matter.' },
    slugs: ['kesinlik-duyarlilik', 'shap-degerleri', 'boruta'],
  },
  {
    id: 'goruntu-isleme',
    title: { tr: 'Görüntü işleme', en: 'Computer vision' },
    sub: { tr: 'Kameradan gelen tespitleri takip etmek, düşmeyi fark etmek, tehlikeli bölgeyi korumak ve yüz doğrulamak.', en: 'Tracking detections from a camera, noticing a fall, guarding a danger zone and verifying a face.' },
    slugs: ['nesne-takibi', 'dusme-tespiti', 'bolge-ihlali', 'yuz-dogrulama'],
  },
  {
    id: 'dil-modelleri',
    title: { tr: 'Büyük dil modellerinin parçaları', en: 'The parts of a large language model' },
    sub: { tr: 'Kelimelerin sayıya dönüşmesi, dikkat, belgeden cevap bulma, araç kullanan ajanlar ve büyük modelden küçük model.', en: 'Words becoming numbers, attention, answering from documents, agents that use tools, and a small model from a big one.' },
    slugs: ['kelime-vektorleri', 'dikkat-mekanizmasi', 'rag', 'yapay-zeka-ajani', 'model-damitma'],
  },
  {
    id: 'yazilimin-ici',
    title: { tr: 'Yazılımın içi', en: 'Inside the software' },
    sub: { tr: 'Robot yazılımını ayakta tutan mühendislik: arama ve sıralama, bellek, eşzamanlılık, Git, test hattı ve sunucular.', en: 'The engineering that keeps robot software running: searching and sorting, memory, concurrency, Git, pipelines and servers.' },
    slugs: ['ikili-arama', 'siralama-algoritmalari', 'onbellek', 'cop-toplama', 'yigin-ve-obek', 'olay-dongusu', 'kilitlenme', 'git-dallari', 'ci-cd-hatti', 'konteyner-olcekleme', 'hiz-siniri'],
  },
]

// PyTorch dersi üniteleri 6–10: Dataset ve DataLoader, evrişimli ağlar, düzenlileştirme, RNN/LSTM ve dikkat, aktarım
// öğrenmesi ve dağıtım. HTML iki dilde aynı etiket dizisinde.
import type { KursUnit } from '@/lib/kurs/types'
import type { PtVizId } from './tools'
import { cnnPy, loaderPy, regulPy, rnnPy, transferPy } from './code'

export const UNITS_B: KursUnit<PtVizId>[] = [
  {
    n: 6, tools: ['loader'], notebook: '06-dataloader',
    tr: {
      title: 'Dataset ve DataLoader: veriyi yığınlar hâlinde beslemek',
      summary: 'Dataset arayüzü (__len__, __getitem__), DataLoader, batch_size, shuffle, drop_last, random_split, dönüşümler, num_workers.',
      goals: ['Kendi verin için bir Dataset sınıfı yazmak', 'batch_size, shuffle ve drop_last\'in tur başına adım sayısına etkisini hesaplamak', 'Eğitimde karıştırmanın, doğrulamada karıştırmamanın nedenini açıklamak', 'Tekrarlanabilir veri ayrımı ve karıştırma için Generator tohumu kullanmak'],
      notes: `<p>Model veriyi tek tek değil <b>yığınlar</b> (mini-batch) hâlinde görür: gradyan birkaç örneğin ortalamasıdır, GPU paralel çalışır. PyTorch bu işi iki parçaya ayırır.</p>
<h3>Dataset</h3>
<p>Bir <code>Dataset</code> iki şey bilir: kaç örnek var (<code>__len__</code>) ve i. örnek nedir (<code>__getitem__</code>). Dosya okuma, ön işleme ve veri artırma (<code>transforms</code>) burada, örnek başına yapılır. Hazır kümeler (torchvision.datasets.MNIST gibi) de aynı arayüzü uygular.</p>
<h3>DataLoader</h3>
<p><code>DataLoader</code> örnekleri yığınlara toplar (<code>collate</code>), isteğe bağlı karıştırır ve paralel işçilerle (<code>num_workers</code>) yükler.</p>
<div class="eq">adım/tur = ⌈N / B⌉ &nbsp; (drop_last=True ise ⌊N / B⌋)</div>
<p><b>shuffle=True</b> eğitimde her tur sırayı değiştirir; aynı sırayla gelen yığınlar gradyanlara bir örüntü katar. Doğrulamada sıra sonucu değiştirmez, karıştırmaya gerek yoktur. <b>drop_last</b>, BatchNorm gibi yığın istatistiği kullanan katmanlarda tek örnekli son yığının sorun çıkarmasını önler.</p>
<h3>Tekrarlanabilirlik</h3>
<p><code>random_split</code> ve <code>DataLoader</code>\'a <code>generator=torch.Generator().manual_seed(42)</code> ver: aynı tohum aynı ayrımı ve aynı sırayı verir. Bu, iki deneyi adil karşılaştırmanın ön şartıdır.</p>`,
      code: [loaderPy('tr')],
      lab: 'DataLoader görselleştiricisinde N = 50, batch_size = 8 yap: kaç adım var, son yığın kaç örnekli? drop_last\'ı aç: hangi örnekler bu turda hiç görülmedi? shuffle\'ı açıp turu 1, 2, 3 yap: her turda sıra değişiyor mu? Tohumu aynı bırakıp sayfayı yenile: sıra aynı mı kaldı?',
      pitfalls: ['Doğrulama DataLoader\'ında shuffle=True: zararsız ama gereksiz; asıl hata eğitimde shuffle=False bırakıp sıralı (ör. sınıfa göre dizilmiş) veriyle eğitmek.', '__getitem__ içinde her seferinde tüm dosyayı okumak: eğitim yavaşlar. Bir kez yükle ya da önbellekle.', 'Windows/macOS\'ta num_workers > 0 ile if __name__ == "__main__" koruması olmadan çalıştırmak: süreçler sonsuz başlar.', 'Veri artırmayı doğrulama kümesine de uygulamak: ölçüm gürültülenir. Doğrulamada yalnız normalleştirme.'],
      se: `<p>Dataset, veri katmanını model kodundan ayıran bir <b>arayüzdür</b> (adaptör deseni). Model, verinin diskte mi, veritabanında mı, sensörden mi geldiğini bilmez.</p>
<ul><li>Dataset için birim testi: uzunluk, bir örneğin şekli ve tipi, etiket aralığı.</li><li>Veri sürümünü (dosya özeti, tarih) deney kaydına ekle; "aynı kod, farklı veri" hatalarını yakalar.</li></ul>`,
      quiz: [
        { q: 'N = 1000, batch_size = 64, drop_last = False. Bir turda kaç adım vardır?', options: ['15', '16', '64', '1000'], answer: 1, why: '⌈1000 / 64⌉ = 16; son yığın 1000 − 15·64 = 40 örneklidir.' },
        { q: 'Aynı ayarla drop_last = True yapılırsa?', options: ['15 adım, 40 örnek bu tur görülmez', '16 adım', '17 adım', 'Değişmez'], answer: 0, why: '⌊1000 / 64⌋ = 15; eksik kalan son yığın atılır.' },
        { q: 'Bir Dataset sınıfının mutlaka uygulaması gereken iki yöntem hangileridir?', options: ['forward ve backward', '__len__ ve __getitem__', '__init__ ve step', 'load ve save'], answer: 1, why: 'Harita tarzı Dataset: kaç örnek var ve i. örnek nedir.' },
        { q: 'Eğitimde shuffle=True neden önemlidir?', options: ['Hızlandırır', 'Yığınlar her tur farklı karışır; sıralı veriden kaynaklanan yanlı gradyanları önler', 'Bellek kazandırır', 'Doğrulama doğruluğunu ölçer'], answer: 1, why: 'Veri sınıfa göre sıralıysa ardışık yığınlar tek sınıftan olur; model salınır ve kötü öğrenir.' },
      ],
    },
    en: {
      title: 'Dataset and DataLoader: feeding data in batches',
      summary: 'The Dataset interface (__len__, __getitem__), DataLoader, batch_size, shuffle, drop_last, random_split, transforms, num_workers.',
      goals: ['Write a Dataset class for your own data', 'Compute how batch_size, shuffle and drop_last affect the number of steps per epoch', 'Explain why you shuffle for training and not for validation', 'Use a Generator seed for reproducible splits and shuffling'],
      notes: `<p>A model sees data not one sample at a time but in <b>batches</b> (mini-batches): the gradient is an average over several samples and the GPU works in parallel. PyTorch splits this job into two parts.</p>
<h3>Dataset</h3>
<p>A <code>Dataset</code> knows two things: how many samples there are (<code>__len__</code>) and what the i-th sample is (<code>__getitem__</code>). File reading, preprocessing and data augmentation (<code>transforms</code>) happen here, per sample. Ready-made sets (such as torchvision.datasets.MNIST) implement the same interface.</p>
<h3>DataLoader</h3>
<p>A <code>DataLoader</code> collects samples into batches (<code>collate</code>), optionally shuffles them and loads them with parallel workers (<code>num_workers</code>).</p>
<div class="eq">steps/epoch = ⌈N / B⌉ &nbsp; (⌊N / B⌋ with drop_last=True)</div>
<p><b>shuffle=True</b> changes the order every epoch during training; batches arriving in the same order add a pattern to the gradients. In validation the order does not change the result, so there is no need to shuffle. <b>drop_last</b> prevents a one-sample final batch from causing trouble in layers that use batch statistics, such as BatchNorm.</p>
<h3>Reproducibility</h3>
<p>Pass <code>generator=torch.Generator().manual_seed(42)</code> to <code>random_split</code> and <code>DataLoader</code>: the same seed gives the same split and the same order. That is a prerequisite for comparing two experiments fairly.</p>`,
      code: [loaderPy('en')],
      lab: 'In the DataLoader visualiser set N = 50 and batch_size = 8: how many steps are there, and how many samples are in the last batch? Turn on drop_last: which samples were never seen this epoch? Turn on shuffle and set the epoch to 1, 2, 3: does the order change every epoch? Keep the seed and reload the page: did the order stay the same?',
      pitfalls: ['shuffle=True in the validation DataLoader: harmless but unnecessary; the real mistake is leaving shuffle=False for training on ordered (e.g. sorted by class) data.', 'Reading the whole file in __getitem__ every time: training slows down. Load once or cache.', 'Running with num_workers > 0 on Windows/macOS without an if __name__ == "__main__" guard: processes start endlessly.', 'Applying data augmentation to the validation set too: the measurement becomes noisy. Only normalise for validation.'],
      se: `<p>A Dataset is an <b>interface</b> (the adapter pattern) that separates the data layer from model code. The model does not know whether the data comes from disk, a database or a sensor.</p>
<ul><li>Unit-test the Dataset: length, the shape and type of one sample, the label range.</li><li>Add the data version (file hash, date) to the experiment record; it catches "same code, different data" bugs.</li></ul>`,
      quiz: [
        { q: 'N = 1000, batch_size = 64, drop_last = False. How many steps are there in an epoch?', options: ['15', '16', '64', '1000'], answer: 1, why: '⌈1000 / 64⌉ = 16; the last batch has 1000 − 15·64 = 40 samples.' },
        { q: 'With the same settings and drop_last = True?', options: ['15 steps, 40 samples are not seen this epoch', '16 steps', '17 steps', 'No change'], answer: 0, why: '⌊1000 / 64⌋ = 15; the incomplete last batch is dropped.' },
        { q: 'Which two methods must a Dataset class implement?', options: ['forward and backward', '__len__ and __getitem__', '__init__ and step', 'load and save'], answer: 1, why: 'A map-style Dataset: how many samples there are and what the i-th sample is.' },
        { q: 'Why is shuffle=True important for training?', options: ['It speeds things up', 'Batches mix differently every epoch; it prevents biased gradients from ordered data', 'It saves memory', 'It measures validation accuracy'], answer: 1, why: 'If data is sorted by class, consecutive batches come from one class; the model oscillates and learns badly.' },
      ],
    },
  },
  {
    n: 7, tools: ['conv', 'featuremaps', 'cnn3d'], notebook: '07-cnn',
    tr: {
      title: 'Evrişimli sinir ağları (CNN)',
      summary: 'Evrişim katmanı, çekirdek, adım, dolgu, genişleme; havuzlama; alıcı alan; öznitelik haritaları; küçük bir MNIST CNN\'i.',
      goals: ['Conv2d çıkış boyunu formülle hesaplamak', 'Evrişimin tam bağlı katmana göre neden çok daha az parametreyle görüntüde iyi çalıştığını açıklamak', 'Havuzlama ve derinliğin alıcı alanı nasıl büyüttüğünü göstermek', 'Eğitilmiş bir ağın öznitelik haritalarını kancayla çıkarıp yorumlamak'],
      notes: `<p>OpenCV dersinde çekirdekleri <b>elle</b> seçtik (Sobel, Gauss). CNN\'de çekirdeklerin sayıları <b>öğrenilir</b>. Bir <code>Conv2d(c<sub>in</sub>, c<sub>out</sub>, k)</code> katmanı c<sub>out</sub> tane k×k×c<sub>in</sub> çekirdek içerir; her biri tüm görüntü üstünde kayar ve bir <b>öznitelik haritası</b> üretir.</p>
<div class="eq">çıkış = ⌊(n + 2p − d(k − 1) − 1) / s⌋ + 1</div>
<p>n giriş boyu, k çekirdek, s adım (stride), p dolgu (padding), d genişleme (dilation). 3×3 çekirdek ve p = 1 boyu korur; s = 2 yarıya indirir.</p>
<h3>Neden evrişim?</h3>
<ul><li><b>Ağırlık paylaşımı</b>: aynı çekirdek her konumda kullanılır; 28×28 bir görüntüde 3×3 çekirdek 9 ağırlıktır, tam bağlı bir nöron 784.</li><li><b>Yerellik</b>: komşu pikseller ilişkilidir; çekirdek yerel desenleri (kenar, köşe) yakalar.</li><li><b>Kaymaya eşdeğerlik</b>: nesne kayarsa öznitelik haritası da kayar.</li></ul>
<h3>Havuzlama ve derinlik</h3>
<p><code>MaxPool2d(2)</code> her 2×2 bölgeden en büyüğünü alır: boy yarıya iner, küçük kaymalara dayanıklılık artar. Katmanlar derinleştikçe bir nöronun gördüğü girdi bölgesi (<b>alıcı alan</b>) büyür: ilk katman kenar, sonrakiler kenar birleşimleri (köşe, eğri), en sonuncular parça ve nesne desenleri öğrenir. Bu derste eğittiğimiz küçük ağ (9 098 parametre) MNIST\'te %98,6 doğruluğa ulaşır.</p>`,
      code: [cnnPy('tr')],
      lab: 'Evrişim aritmetiği aracında n = 7, k = 3 ile başla; adımı 2, dolguyu 1 yap ve çıkış boyunu önce formülle hesapla. Genişlemeyi 2 yap: çekirdek girdi üstünde nasıl seyreldi? Öznitelik haritaları aracında 1, 7 ve 0 çiz: ilk katmanın hangi haritaları yatay, hangileri dikey kenarlara tepki veriyor? Rakamı kutunun köşesine çizince tahmin değişiyor mu?',
      pitfalls: ['Girdiyi (N, H, W, C) sırasıyla vermek: PyTorch (N, C, H, W) ister; NumPy/PIL\'den gelen görüntüde permute(0, 3, 1, 2) gerekir.', 'Tek görüntüyü yığın boyutu olmadan vermek: x.unsqueeze(0) ile (1, C, H, W) yap.', 'Eğitimdeki normalleştirmeyi (ortalama, std) çıkarımda unutmak: tahminler anlamsızlaşır.', 'Havuzlamayla boyu tek sayıya düşürüp sonraki katmanın boyunu yanlış hesaplamak: 7 → MaxPool2d(2) → 3 (taban alınır).'],
      se: `<p>CNN mimarisi de kod gibi gözden geçirilmelidir: her katmanın neden orada olduğu ve çıkış şekli belgelenmelidir.</p>
<ul><li>Modelin özetini (torchinfo) ve parametre sayısını deney kaydına ekle; beklenmedik bir artış hataya işarettir.</li><li>Öznitelik haritalarını ve yanlış sınıflanan örnekleri görselleştirmek, modeli "kara kutu" olmaktan çıkarır ve hata ayıklamayı hızlandırır.</li></ul>`,
      quiz: [
        { q: '32×32 girişe Conv2d(k=5, s=1, p=0) uygulanırsa çıkış boyu nedir?', options: ['32', '30', '28', '27'], answer: 2, why: '⌊(32 + 0 − 4 − 1)/1⌋ + 1 = 28.' },
        { q: 'Conv2d(1, 8, 3) ile 28×28 görüntüde çalışan, tam bağlı bir katmana göre temel üstünlük nedir?', options: ['Daha çok parametre', 'Ağırlık paylaşımı: aynı küçük çekirdek her konumda kullanılır', 'Renk kullanması', 'Havuzlama gerektirmemesi'], answer: 1, why: 'Her çekirdek 9 ağırlıktır ve tüm konumlarda paylaşılır; tam bağlı katmanda her konum için ayrı ağırlık gerekirdi.' },
        { q: 'MaxPool2d(2) 14×14 bir haritayı hangi boya indirir?', options: ['13×13', '7×7', '12×12', '28×28'], answer: 1, why: 'Her 2×2 bölgeden bir değer: 14/2 = 7.' },
        { q: 'Ağ derinleştikçe sondaki katmanların nöronları için ne doğrudur?', options: ['Alıcı alanları küçülür', 'Alıcı alanları büyür, daha karmaşık desenlere tepki verirler', 'Yalnız renge tepki verirler', 'Parametreleri sıfırlanır'], answer: 1, why: 'Her evrişim ve havuzlama bir nöronun gördüğü girdi bölgesini genişletir; kenarlardan parçalara, parçalardan nesnelere.' },
      ],
    },
    en: {
      title: 'Convolutional neural networks (CNNs)',
      summary: 'The convolution layer, kernel, stride, padding, dilation; pooling; receptive fields; feature maps; a small MNIST CNN.',
      goals: ['Compute a Conv2d output size with the formula', 'Explain why convolution works well on images with far fewer parameters than a fully connected layer', 'Show how pooling and depth grow the receptive field', 'Extract and interpret the feature maps of a trained network with a hook'],
      notes: `<p>In the OpenCV course we chose kernels <b>by hand</b> (Sobel, Gaussian). In a CNN the kernel numbers are <b>learned</b>. A <code>Conv2d(c<sub>in</sub>, c<sub>out</sub>, k)</code> layer contains c<sub>out</sub> kernels of size k×k×c<sub>in</sub>; each slides over the whole image and produces a <b>feature map</b>.</p>
<div class="eq">out = ⌊(n + 2p − d(k − 1) − 1) / s⌋ + 1</div>
<p>n is the input size, k the kernel, s the stride, p the padding, d the dilation. A 3×3 kernel with p = 1 keeps the size; s = 2 halves it.</p>
<h3>Why convolution?</h3>
<ul><li><b>Weight sharing</b>: the same kernel is used at every position; on a 28×28 image a 3×3 kernel is 9 weights, a fully connected neuron 784.</li><li><b>Locality</b>: neighbouring pixels are related; the kernel captures local patterns (edges, corners).</li><li><b>Translation equivariance</b>: if the object shifts, the feature map shifts too.</li></ul>
<h3>Pooling and depth</h3>
<p><code>MaxPool2d(2)</code> takes the largest value from each 2×2 region: the size halves and robustness to small shifts grows. As layers get deeper the input region a neuron sees (the <b>receptive field</b>) grows: the first layer learns edges, later ones combinations of edges (corners, curves), the last ones part and object patterns. The small network we trained for this course (9,098 parameters) reaches 98.6% accuracy on MNIST.</p>`,
      code: [cnnPy('en')],
      lab: 'In the convolution arithmetic tool start with n = 7, k = 3; set stride 2, padding 1 and compute the output size with the formula first. Set dilation to 2: how did the kernel spread out over the input? In the feature maps tool draw 1, 7 and 0: which maps of the first layer respond to horizontal edges and which to vertical ones? Does the prediction change when you draw the digit in the corner of the box?',
      pitfalls: ['Passing input in (N, H, W, C) order: PyTorch wants (N, C, H, W); an image from NumPy/PIL needs permute(0, 3, 1, 2).', 'Passing a single image without a batch dimension: make it (1, C, H, W) with x.unsqueeze(0).', 'Forgetting the training normalisation (mean, std) at inference: predictions become meaningless.', 'Pooling down to an odd size and computing the next layer\'s size wrongly: 7 → MaxPool2d(2) → 3 (floor).'],
      se: `<p>A CNN architecture should be reviewed like code: why each layer is there and its output shape should be documented.</p>
<ul><li>Add the model summary (torchinfo) and parameter count to the experiment record; an unexpected jump points to a bug.</li><li>Visualising feature maps and misclassified examples takes the model out of the "black box" and speeds up debugging.</li></ul>`,
      quiz: [
        { q: 'Applying Conv2d(k=5, s=1, p=0) to a 32×32 input gives what output size?', options: ['32', '30', '28', '27'], answer: 2, why: '⌊(32 + 0 − 4 − 1)/1⌋ + 1 = 28.' },
        { q: 'What is the main advantage of Conv2d(1, 8, 3) on a 28×28 image over a fully connected layer?', options: ['More parameters', 'Weight sharing: the same small kernel is used at every position', 'It uses colour', 'It needs no pooling'], answer: 1, why: 'Each kernel is 9 weights shared across all positions; a fully connected layer would need separate weights for every position.' },
        { q: 'MaxPool2d(2) reduces a 14×14 map to what size?', options: ['13×13', '7×7', '12×12', '28×28'], answer: 1, why: 'One value from each 2×2 region: 14/2 = 7.' },
        { q: 'As a network gets deeper, what is true for neurons in the last layers?', options: ['Their receptive fields shrink', 'Their receptive fields grow and they respond to more complex patterns', 'They respond only to colour', 'Their parameters are reset'], answer: 1, why: 'Every convolution and pooling widens the input region a neuron sees; from edges to parts, from parts to objects.' },
      ],
    },
  },
  {
    n: 8, tools: ['regul'], notebook: '08-duzenlilestirme',
    tr: {
      title: 'Aşırı öğrenme ve düzenlileştirme',
      summary: 'Yanlılık–varyans, aşırı öğrenme belirtileri; dropout, ağırlık sönümü (L2 / AdamW), erken durdurma, veri artırma, BatchNorm.',
      goals: ['Kayıp eğrilerinden aşırı ve yetersiz öğrenmeyi ayırt etmek', 'Dropout\'un eğitim ve çıkarımda nasıl farklı çalıştığını açıklamak', 'Ağırlık sönümünü ve erken durdurmayı uygulayıp etkisini ölçmek', 'Veri artırma ve daha çok verinin neden en güçlü düzenlileştirme olduğunu tartışmak'],
      notes: `<p>Az ve gürültülü veride büyük bir ağ, genel deseni değil tek tek örnekleri (gürültü dahil) <b>ezberler</b>: eğitim kaybı sıfıra iner, doğrulama kaybı bir noktadan sonra yükselir. Aradaki açık <b>genelleme hatasıdır</b>. <b>Düzenlileştirme</b>, modelin ezberleme kapasitesini kısıtlayan her yöntemdir.</p>
<h3>Yöntemler</h3>
<ul><li><b>Dropout(p)</b>: eğitimde her ileri geçişte nöronların p oranını rastgele sıfırlar, kalanları 1/(1 − p) ile ölçekler. Ağ tek bir nörona güvenemez. <code>model.eval()</code>\'da kapalıdır.</li><li><b>Ağırlık sönümü</b>: her adımda ağırlıkları sıfıra doğru biraz çeker (L2 cezası). Adam ile <code>AdamW</code>\'nun ayrık sönümü tercih edilir.</li><li><b>Erken durdurma</b>: doğrulama kaybı belirli bir sabır süresince iyileşmezse dur ve en iyi ağırlıklara dön.</li><li><b>Veri artırma</b>: döndürme, kırpma, renk oynatma; model aynı nesnenin çeşitlemelerini görür.</li><li><b>BatchNorm</b>: ara aktivasyonları normalleştirir; eğitimi hızlandırır, hafif düzenlileştirici etkisi vardır.</li></ul>
<div class="eq">L<sub>toplam</sub> = L<sub>veri</sub> + λ · Σ w²</div>
<p>En güçlü düzenlileştirme <b>daha çok ve daha çeşitli veridir</b>. Düzenlileştirme fazla olursa model <b>yetersiz öğrenir</b>: iki eğri de yüksek kalır.</p>`,
      code: [regulPy('tr')],
      lab: 'Düzenlileştirme deneyinde önce hiçbir şey açmadan eğit: doğrulama kaybı hangi turdan sonra yükselmeye başladı? Sonra yalnız dropout 0,3, sonra yalnız ağırlık sönümü 0,01, sonra yalnız erken durdurma ile tekrar et; her birinde son doğrulama kaybını ve eğitim–doğrulama açığını tabloya yaz. Eğitim örneğini 40\'tan 200\'e çıkar: düzenlileştirmesiz açık ne oldu?',
      pitfalls: ['Dropout\'u çıkarımda açık bırakmak (model.eval() unutulur): her tahmin farklı çıkar.', 'Erken durdurmada son ağırlıkları kullanmak: en iyi turdaki ağırlıklara (state_dict kopyası) dönülmeli.', 'Adam ile weight_decay\'i L2 sanmak: Adam\'da uyarlamalı ölçekle karışır; ayrık sönüm için AdamW kullan.', 'Aşırı öğrenmeyi yalnız eğitim doğruluğuna bakarak değerlendirmek: doğrulama eğrisi olmadan görülmez.'],
      se: `<p>Düzenlileştirme denemeleri birer <b>kontrollü deneydir</b>: her seferinde tek bir şeyi değiştir.</p>
<ul><li>Aynı tohum ve aynı veri ayrımıyla karşılaştır (bu sayfadaki deney gibi); farkın gürültü olmadığından emin olmak için birkaç tohumla tekrarla.</li><li>Sonuçları ablasyon tablosu olarak raporla: temel, +dropout, +sönüm, +erken durdurma.</li></ul>`,
      quiz: [
        { q: 'Dropout(0,5) çıkarımda (model.eval()) ne yapar?', options: ['Nöronların yarısını sıfırlar', 'Hiçbir şey yapmaz; tüm nöronlar kullanılır', 'Çıkışı ikiye böler', 'Ağırlıkları sıfırlar'], answer: 1, why: 'Ters ölçekli dropout eğitimde 1/(1 − p) ile ölçekler; böylece çıkarımda düzeltme gerekmez ve dropout kapalıdır.' },
        { q: 'Erken durdurma neye bakarak durur?', options: ['Eğitim kaybına', 'Doğrulama kaybının belirli sayıda tur iyileşmemesine', 'Öğrenme oranına', 'Parametre sayısına'], answer: 1, why: 'Doğrulama kaybı sabır süresince düşmezse eğitim durur ve en iyi ağırlıklar geri yüklenir.' },
        { q: 'Eğitim ve doğrulama kaybının ikisi de yüksek kalıyorsa ne yapılmalı?', options: ['Daha çok dropout', 'Modelin kapasitesini artırmak ya da düzenlileştirmeyi azaltmak', 'Daha erken durdurmak', 'Ağırlık sönümünü artırmak'], answer: 1, why: 'Bu yetersiz öğrenmedir; model veriyi bile öğrenemiyor, kısıt değil kapasite gerekir.' },
        { q: 'Ağırlık sönümü (L2) ağırlıklara ne yapar?', options: ['Büyütür', 'Her adımda sıfıra doğru küçültür, büyük ağırlıkları cezalandırır', 'Rastgele sıfırlar', 'Nicemler'], answer: 1, why: 'λΣw² cezası gradyana λw ekler; ağırlıklar küçük tutulur, fonksiyon daha düzgün olur.' },
      ],
    },
    en: {
      title: 'Overfitting and regularisation',
      summary: 'Bias–variance, symptoms of overfitting; dropout, weight decay (L2 / AdamW), early stopping, data augmentation, BatchNorm.',
      goals: ['Tell overfitting from underfitting by the loss curves', 'Explain how dropout behaves differently in training and inference', 'Apply weight decay and early stopping and measure their effect', 'Discuss why data augmentation and more data are the strongest regularisers'],
      notes: `<p>On little, noisy data a big network <b>memorises</b> individual samples (noise included) instead of the general pattern: training loss goes to zero, and after some point validation loss rises. The gap between them is the <b>generalisation error</b>. <b>Regularisation</b> is any method that limits the model\'s capacity to memorise.</p>
<h3>Methods</h3>
<ul><li><b>Dropout(p)</b>: during training, on every forward pass it randomly zeroes a fraction p of neurons and scales the rest by 1/(1 − p). The network cannot rely on a single neuron. It is off in <code>model.eval()</code>.</li><li><b>Weight decay</b>: pulls weights a little towards zero every step (an L2 penalty). With Adam, prefer <code>AdamW</code>\'s decoupled decay.</li><li><b>Early stopping</b>: if validation loss does not improve for a patience period, stop and go back to the best weights.</li><li><b>Data augmentation</b>: rotation, cropping, colour jitter; the model sees variations of the same object.</li><li><b>BatchNorm</b>: normalises intermediate activations; speeds up training and has a mild regularising effect.</li></ul>
<div class="eq">L<sub>total</sub> = L<sub>data</sub> + λ · Σ w²</div>
<p>The strongest regulariser is <b>more and more varied data</b>. With too much regularisation the model <b>underfits</b>: both curves stay high.</p>`,
      code: [regulPy('en')],
      lab: 'In the regularisation experiment first train with nothing turned on: after which epoch did validation loss start rising? Then repeat with only dropout 0.3, then only weight decay 0.01, then only early stopping; for each write the final validation loss and the train–validation gap in a table. Raise the training samples from 40 to 200: what happened to the gap without regularisation?',
      pitfalls: ['Leaving dropout on at inference (model.eval() forgotten): every prediction comes out different.', 'Using the final weights with early stopping: you must go back to the weights from the best epoch (a state_dict copy).', 'Thinking weight_decay with Adam is L2: in Adam it mixes with the adaptive scaling; use AdamW for decoupled decay.', 'Judging overfitting from training accuracy alone: it is invisible without the validation curve.'],
      se: `<p>Regularisation trials are <b>controlled experiments</b>: change one thing at a time.</p>
<ul><li>Compare with the same seed and the same data split (like the experiment on this page); repeat with a few seeds to make sure a difference is not noise.</li><li>Report results as an ablation table: baseline, +dropout, +decay, +early stopping.</li></ul>`,
      quiz: [
        { q: 'What does Dropout(0.5) do at inference (model.eval())?', options: ['Zeroes half the neurons', 'Nothing; all neurons are used', 'Halves the output', 'Zeroes the weights'], answer: 1, why: 'Inverted dropout scales by 1/(1 − p) during training, so no correction is needed at inference and dropout is off.' },
        { q: 'What does early stopping watch to decide when to stop?', options: ['The training loss', 'Validation loss not improving for a number of epochs', 'The learning rate', 'The parameter count'], answer: 1, why: 'If validation loss does not fall for the patience period, training stops and the best weights are restored.' },
        { q: 'If both training and validation losses stay high, what should you do?', options: ['More dropout', 'Increase the model\'s capacity or reduce regularisation', 'Stop earlier', 'Increase weight decay'], answer: 1, why: 'This is underfitting; the model cannot even learn the data, so it needs capacity, not constraints.' },
        { q: 'What does weight decay (L2) do to the weights?', options: ['Enlarges them', 'Shrinks them towards zero every step, penalising large weights', 'Zeroes them randomly', 'Quantises them'], answer: 1, why: 'The λΣw² penalty adds λw to the gradient; weights stay small and the function smoother.' },
      ],
    },
  },
  {
    n: 9, tools: ['lstm', 'attention'], notebook: '09-rnn-lstm-dikkat',
    tr: {
      title: 'Diziler: RNN, LSTM ve dikkat',
      summary: 'Gizli durum, zaman boyunca geri yayılım, sönen gradyan; LSTM kapıları ve hücre durumu; ölçekli nokta çarpımı dikkati ve Transformer fikri.',
      goals: ['RNN\'in gizli durumla diziyi nasıl özetlediğini açıklamak', 'Sönen gradyan sorununu zincir kuralıyla göstermek', 'LSTM\'in unutma kapısının bu sorunu nasıl hafiflettiğini açıklamak', 'Dikkat mekanizmasının formülünü ve Transformer\'daki yerini anlatmak'],
      notes: `<p>Sensör ölçümleri, konuşma, metin: sıranın önemli olduğu verilerdir. Bir <b>RNN</b> her adımda aynı ağırlıklarla yeni girdiyi ve önceki <b>gizli durumu</b> birleştirir: <i>h<sub>t</sub> = tanh(W·h<sub>t−1</sub> + U·x<sub>t</sub> + b)</i>. Gizli durum, o ana kadarki dizinin özetidir.</p>
<h3>Sönen gradyan</h3>
<p>Eğitimde gradyan diziyi tersten dolaşır (zaman boyunca geri yayılım). Her adımda <i>W·tanh′</i> ile çarpılır; bu çarpan 1\'den küçükse gradyan <b>üstel olarak söner</b>, büyükse patlar. Sonuç: düz RNN 10–20 adımdan uzak bağlantıları öğrenemez.</p>
<div class="eq">∂h<sub>T</sub>/∂h<sub>t</sub> = Π<sub>k=t+1..T</sub> W · (1 − h<sub>k</sub>²)</div>
<h3>LSTM</h3>
<p><b>LSTM</b>, gizli durumun yanında bir <b>hücre durumu</b> c taşır ve onu kapılarla toplamsal olarak günceller: <i>c<sub>t</sub> = f<sub>t</sub>·c<sub>t−1</sub> + i<sub>t</sub>·g<sub>t</sub></i>. Hücre yolu boyunca gradyan yalnız unutma kapısıyla (f) çarpılır; f ≈ 1 iken bilgi ve gradyan uzun mesafe taşınır. Bu yüzden unutma kapısının ön yargısı genelde pozitif başlatılır. GRU benzer, daha az kapılı bir türdür.</p>
<h3>Dikkat</h3>
<p><b>Dikkat</b>, diziyi adım adım taşımak yerine her öğenin diğer tüm öğelere doğrudan bakmasını sağlar: <i>softmax(QKᵀ/√d)·V</i>. Uzaklık sorun olmaktan çıkar, hesap paralel yapılır. Transformer yalnız dikkat ve tam bağlı katmanlardan oluşur; büyük dil modellerinin temelidir. Makine öğrenmesi dersindeki dikkat dersi aynı hesabı adım adım gösterir.</p>`,
      code: [rnnPy('tr')],
      lab: 'Gradyan akışı aracında dizi boyunu 50, ağırlığı 0,9 yap: RNN eğrisi kaç adımda %1\'in altına düştü? Ağırlığı 1,5\'e çıkar: ne oldu? LSTM\'de unutma kapısı ön yargısını −1, 1 ve 3 yap ve etkili bellek uzunluğunu karşılaştır. Dikkat aracında sıcaklığı düşürüp yükselt: satırlar neden keskinleşip düzleşiyor?',
      pitfalls: ['nn.LSTM\'e (T, N, özellik) sırası bekliyorken (N, T, özellik) vermek: batch_first=True ayarını kontrol et.', 'Farklı uzunluktaki dizileri sıfırla doldurup maskelememek: dolgu da öğrenilir. pack_padded_sequence ya da maske kullan.', 'RNN\'de gradyan patlamasını görmezden gelmek: clip_grad_norm_ ile kırp.', 'Dikkatte √d ölçeklemesini atlamak: büyük boyutta softmax doyar, gradyan küçülür.'],
      se: `<p>Dizi modellerinde veri hazırlama (pencereleme, dolgu, maske) modelden daha çok hataya açıktır.</p>
<ul><li>Pencereleme fonksiyonunu ayrı yaz ve sına: gelecekten bilgi sızmadığını (etiketin pencereden sonra geldiğini) kontrol eden bir test ekle.</li><li>Zaman serisinde eğitim/doğrulama ayrımını rastgele değil zamana göre yap.</li></ul>`,
      quiz: [
        { q: 'Düz bir RNN\'de uzak geçmişin gradyanı neden söner?', options: ['Öğrenme oranı küçüktür', 'Her adımda 1\'den küçük bir çarpanla (W·tanh′) çarpılır; çarpım üstel küçülür', 'Dropout yüzünden', 'Veri azdır'], answer: 1, why: 'Zincir kuralı adım sayısı kadar çarpan üretir; hepsi 1\'den küçükse çarpım hızla sıfıra gider.' },
        { q: 'LSTM\'de hücre durumu boyunca gradyanı taşıyan çarpan hangisidir?', options: ['Giriş kapısı', 'Çıkış kapısı', 'Unutma kapısı f', 'tanh türevi'], answer: 2, why: 'c_t = f_t·c_{t−1} + … olduğundan ∂c_t/∂c_{t−1} = f_t; f ≈ 1 iken gradyan sönmez.' },
        { q: 'Ölçekli nokta çarpımı dikkatinde √d\'ye bölmenin amacı nedir?', options: ['Hızlandırmak', 'Büyük boyutta skorların büyüyüp softmax\'ı doyurmasını önlemek', 'Olasılıkların toplamını 1 yapmak', 'Maskelemek'], answer: 1, why: 'd boyutlu rastgele vektörlerin iç çarpımının varyansı d ile büyür; √d ile bölmek ölçeği sabit tutar.' },
        { q: 'Transformer\'ın RNN\'e göre temel üstünlüğü nedir?', options: ['Daha az parametre', 'Her öğe diğerlerine doğrudan bakar; uzun bağlantı ve paralel hesap', 'Gizli durum kullanması', 'Sıra bilgisine ihtiyaç duymaması'], answer: 1, why: 'Dikkat iki öğe arasındaki yolu tek adıma indirir ve tüm diziyi aynı anda işler.' },
      ],
    },
    en: {
      title: 'Sequences: RNN, LSTM and attention',
      summary: 'Hidden state, backpropagation through time, vanishing gradients; LSTM gates and cell state; scaled dot-product attention and the Transformer idea.',
      goals: ['Explain how an RNN summarises a sequence with its hidden state', 'Show the vanishing gradient problem with the chain rule', 'Explain how the LSTM forget gate eases this problem', 'Describe the attention formula and its place in the Transformer'],
      notes: `<p>Sensor readings, speech, text: data where order matters. An <b>RNN</b> combines the new input and the previous <b>hidden state</b> with the same weights at every step: <i>h<sub>t</sub> = tanh(W·h<sub>t−1</sub> + U·x<sub>t</sub> + b)</i>. The hidden state is a summary of the sequence so far.</p>
<h3>Vanishing gradients</h3>
<p>During training the gradient walks the sequence backwards (backpropagation through time). At every step it is multiplied by <i>W·tanh′</i>; if this factor is below 1 the gradient <b>vanishes exponentially</b>, if above it explodes. The result: a plain RNN cannot learn links further than 10–20 steps.</p>
<div class="eq">∂h<sub>T</sub>/∂h<sub>t</sub> = Π<sub>k=t+1..T</sub> W · (1 − h<sub>k</sub>²)</div>
<h3>LSTM</h3>
<p>An <b>LSTM</b> carries a <b>cell state</b> c alongside the hidden state and updates it additively through gates: <i>c<sub>t</sub> = f<sub>t</sub>·c<sub>t−1</sub> + i<sub>t</sub>·g<sub>t</sub></i>. Along the cell path the gradient is multiplied only by the forget gate (f); with f ≈ 1, information and gradient travel a long way. That is why the forget gate bias is usually initialised positive. A GRU is a similar variant with fewer gates.</p>
<h3>Attention</h3>
<p><b>Attention</b> lets every element look directly at all others instead of carrying the sequence step by step: <i>softmax(QKᵀ/√d)·V</i>. Distance stops being a problem and the computation runs in parallel. A Transformer consists only of attention and fully connected layers; it is the basis of large language models. The attention lesson in the machine learning course shows the same computation step by step.</p>`,
      code: [rnnPy('en')],
      lab: 'In the gradient flow tool set the sequence length to 50 and the weight to 0.9: after how many steps does the RNN curve drop below 1%? Raise the weight to 1.5: what happened? In the LSTM set the forget-gate bias to −1, 1 and 3 and compare the effective memory length. In the attention tool lower and raise the temperature: why do the rows sharpen and flatten?',
      pitfalls: ['Passing (N, T, features) to nn.LSTM when it expects (T, N, features): check the batch_first=True setting.', 'Padding sequences of different lengths with zeros and not masking: the padding gets learned too. Use pack_padded_sequence or a mask.', 'Ignoring exploding gradients in an RNN: clip with clip_grad_norm_.', 'Skipping the √d scaling in attention: at large dimensions softmax saturates and gradients shrink.'],
      se: `<p>In sequence models data preparation (windowing, padding, masks) is more error-prone than the model.</p>
<ul><li>Write and test the windowing function separately: add a test that checks no information leaks from the future (the label comes after the window).</li><li>For time series split training/validation by time, not randomly.</li></ul>`,
      quiz: [
        { q: 'Why does the gradient from the distant past vanish in a plain RNN?', options: ['The learning rate is small', 'It is multiplied by a factor below 1 (W·tanh′) at every step; the product shrinks exponentially', 'Because of dropout', 'There is too little data'], answer: 1, why: 'The chain rule produces as many factors as there are steps; if all are below 1 the product quickly goes to zero.' },
        { q: 'In an LSTM, which factor carries the gradient along the cell state?', options: ['The input gate', 'The output gate', 'The forget gate f', 'The tanh derivative'], answer: 2, why: 'Since c_t = f_t·c_{t−1} + …, ∂c_t/∂c_{t−1} = f_t; with f ≈ 1 the gradient does not vanish.' },
        { q: 'What is the purpose of dividing by √d in scaled dot-product attention?', options: ['To speed up', 'To stop scores growing at large dimensions and saturating softmax', 'To make probabilities sum to 1', 'To mask'], answer: 1, why: 'The variance of the dot product of random d-dimensional vectors grows with d; dividing by √d keeps the scale constant.' },
        { q: 'What is the Transformer\'s main advantage over an RNN?', options: ['Fewer parameters', 'Every element looks directly at the others; long-range links and parallel computation', 'It uses a hidden state', 'It does not need order information'], answer: 1, why: 'Attention shortens the path between any two elements to one step and processes the whole sequence at once.' },
      ],
    },
  },
  {
    n: 10, tools: ['deploy'], notebook: '10-aktarim-dagitim',
    tr: {
      title: 'Aktarım öğrenmesi ve dağıtım',
      summary: 'Önceden eğitilmiş modeller, dondurma ve ince ayar; state_dict, TorchScript, ONNX; int8 nicemleme; uçta ve tarayıcıda çıkarım.',
      goals: ['Önceden eğitilmiş bir modelin omurgasını dondurup yeni bir baş eğitmek', 'Dondurmanın eğitilen parametre ve bellek üstündeki etkisini hesaplamak', 'Modeli TorchScript ya da ONNX olarak dışa aktarmak', 'Nicemlemenin boyut, hız ve doğruluk üstündeki etkisini ölçmek'],
      notes: `<p>Bir görüntü sınıflandırıcıyı sıfırdan eğitmek milyonlarca etiketli görüntü ister. <b>Aktarım öğrenmesi</b>, ImageNet gibi büyük bir veride eğitilmiş bir modelin genel özniteliklerini (kenar, doku, parça) kendi küçük verine taşır.</p>
<h3>Dondur ya da ince ayarla</h3>
<ul><li><b>Öznitelik çıkarıcı</b>: tüm katmanları dondur (<code>requires_grad = False</code>), yalnız yeni sınıflandırma başını eğit. Az veri için hızlı ve güvenli.</li><li><b>İnce ayar</b>: son blokları da çöz, küçük bir öğrenme oranıyla eğit. Daha çok veri varsa daha iyi sonuç.</li></ul>
<p>Dondurulan parametrelerin gradyanı ve optimize edici durumu tutulmaz: Adam\'da parametre başına 12 bayt (gradyan + iki moment) kazanılır.</p>
<h3>Dağıtım</h3>
<p>Eğitim Python\'da, çıkarım her yerde olabilir. <code>state_dict</code> ağırlıkları saklar ama sınıf kodunu ister. <b>TorchScript</b> (<code>torch.jit.script</code>) ve <b>ONNX</b> (<code>torch.onnx.export</code>) modeli koddan bağımsız bir grafiğe çevirir: C++, mobil, ONNX Runtime ya da tarayıcı (onnxruntime-web) çalıştırabilir. <code>model.eval()</code> ve örnek girdiyle dışa aktarılır.</p>
<h3>Nicemleme</h3>
<div class="eq">q = round(w / ölçek), ölçek = max|w| / 127 &nbsp; (int8)</div>
<p>32 bitlik ağırlıklar 8 bite inince dosya yaklaşık 4 kat küçülür ve uygun donanımda çıkarım hızlanır; doğruluk genellikle çok az düşer. Bu ünitenin aracı, bitirme projesindeki CNN\'i tarayıcıda gerçekten nicemler ve 200 test örneğinde ölçer.</p>`,
      code: [transferPy('tr')],
      lab: 'Aktarım aracında ResNet-18\'in tüm bloklarını dondur ve 5 sınıflı baş için eğitilen parametre sayısını oku. Sonra yalnız layer4\'ü çöz: eğitim belleği kaç kat arttı? Nicemleme bölümünde "Ölç"e bas: fp32 ve int8 dosya boyunu, 200 örnekteki doğruluğu ve çıkarım süresini yaz. Doğruluk kaç puan değişti?',
      pitfalls: ['Önceden eğitilmiş modelin beklediği normalleştirmeyi (ImageNet ortalama ve std, 224×224) uygulamamak: öznitelikler bozulur.', 'Dondurduktan sonra optimize ediciye tüm parametreleri vermek: zararsız ama gereksiz; yalnız requires_grad olanları ver.', 'Dışa aktarmadan önce model.eval() demeyi unutmak: dropout ve batchnorm eğitim kipinde dışa aktarılır.', 'Nicemlenmiş modelin doğruluğunu ölçmeden yayına almak: her zaman aynı test kümesinde önce/sonra karşılaştır.'],
      se: `<p>Model bir <b>yazılım ürünüdür</b>: sürümü, bağımlılıkları, testleri ve geri alma planı olmalıdır.</p>
<ul><li>Model dosyasını sürümle (model kartı: veri, metrik, tarih, kod sürümü), dosya özetini (SHA-256) kaydet.</li><li>Dağıtımdan önce otomatik "kabul testi": sabit bir test kümesinde doğruluk eşiğin altındaysa yayını durdur; çıkarım süresini de ölç.</li></ul>`,
      quiz: [
        { q: 'ResNet-18\'in tüm omurgası dondurulup 5 sınıflı yeni bir baş (Linear(512, 5)) eklenirse kaç parametre eğitilir?', options: ['11,7 milyon', '2 565', '512', '5'], answer: 1, why: '512 · 5 ağırlık + 5 bias = 2 565.' },
        { q: 'Az etiketli veriyle (sınıf başına birkaç yüz görüntü) başlarken en güvenli yaklaşım hangisidir?', options: ['Sıfırdan eğitmek', 'Önceden eğitilmiş omurgayı dondurup yalnız yeni başı eğitmek', 'Tüm katmanları büyük öğrenme oranıyla eğitmek', 'Modeli nicemlemek'], answer: 1, why: 'Genel öznitelikler korunur, az parametre eğitildiği için aşırı öğrenme riski düşüktür.' },
        { q: 'int8 nicemleme ağırlık dosyasının boyunu yaklaşık ne kadar değiştirir?', options: ['2 kat büyütür', 'Değiştirmez', 'Yaklaşık 4 kat küçültür', '32 kat küçültür'], answer: 2, why: '32 bit yerine 8 bit: dörtte bir (küçük ölçek değerleri hariç).' },
        { q: 'ONNX\'e dışa aktarmanın temel yararı nedir?', options: ['Eğitimi hızlandırır', 'Modeli Python ve PyTorch olmadan farklı çalışma ortamlarında çalıştırabilmek', 'Doğruluğu artırır', 'Veriyi şifreler'], answer: 1, why: 'ONNX, birçok çalışma zamanının (ONNX Runtime, mobil, tarayıcı) okuyabildiği koddan bağımsız bir grafik biçimidir.' },
      ],
    },
    en: {
      title: 'Transfer learning and deployment',
      summary: 'Pretrained models, freezing and fine-tuning; state_dict, TorchScript, ONNX; int8 quantisation; inference at the edge and in the browser.',
      goals: ['Freeze a pretrained model\'s backbone and train a new head', 'Compute the effect of freezing on trainable parameters and memory', 'Export a model as TorchScript or ONNX', 'Measure the effect of quantisation on size, speed and accuracy'],
      notes: `<p>Training an image classifier from scratch needs millions of labelled images. <b>Transfer learning</b> carries the general features (edges, textures, parts) of a model trained on large data such as ImageNet over to your own small dataset.</p>
<h3>Freeze or fine-tune</h3>
<ul><li><b>Feature extractor</b>: freeze all layers (<code>requires_grad = False</code>) and train only the new classification head. Fast and safe for little data.</li><li><b>Fine-tuning</b>: also unfreeze the last blocks and train with a small learning rate. Better results when there is more data.</li></ul>
<p>Frozen parameters keep no gradient or optimiser state: with Adam, 12 bytes per parameter (gradient + two moments) are saved.</p>
<h3>Deployment</h3>
<p>Training happens in Python; inference can happen anywhere. A <code>state_dict</code> stores the weights but needs the class code. <b>TorchScript</b> (<code>torch.jit.script</code>) and <b>ONNX</b> (<code>torch.onnx.export</code>) turn the model into a code-independent graph that C++, mobile, ONNX Runtime or the browser (onnxruntime-web) can run. Export with <code>model.eval()</code> and an example input.</p>
<h3>Quantisation</h3>
<div class="eq">q = round(w / scale), scale = max|w| / 127 &nbsp; (int8)</div>
<p>When 32-bit weights become 8-bit the file shrinks about 4 times and inference speeds up on suitable hardware; accuracy usually drops very little. This unit\'s tool really quantises the capstone CNN in the browser and measures it on 200 test samples.</p>`,
      code: [transferPy('en')],
      lab: 'In the transfer tool freeze all of ResNet-18\'s blocks and read the number of trainable parameters for a 5-class head. Then unfreeze only layer4: how many times did the training memory grow? In the quantisation section press "Measure": write down the fp32 and int8 file sizes, the accuracy on 200 samples and the inference time. By how many points did the accuracy change?',
      pitfalls: ['Not applying the normalisation the pretrained model expects (ImageNet mean and std, 224×224): the features break.', 'Giving all parameters to the optimiser after freezing: harmless but unnecessary; pass only those with requires_grad.', 'Forgetting model.eval() before exporting: dropout and batchnorm are exported in training mode.', 'Shipping a quantised model without measuring its accuracy: always compare before/after on the same test set.'],
      se: `<p>A model is a <b>software product</b>: it needs a version, dependencies, tests and a rollback plan.</p>
<ul><li>Version the model file (a model card: data, metrics, date, code version) and record its hash (SHA-256).</li><li>An automatic "acceptance test" before deployment: if accuracy on a fixed test set is below the threshold, stop the release; measure inference time too.</li></ul>`,
      quiz: [
        { q: 'If ResNet-18\'s whole backbone is frozen and a new 5-class head (Linear(512, 5)) is added, how many parameters are trained?', options: ['11.7 million', '2,565', '512', '5'], answer: 1, why: '512 · 5 weights + 5 biases = 2,565.' },
        { q: 'Starting with little labelled data (a few hundred images per class), what is the safest approach?', options: ['Train from scratch', 'Freeze the pretrained backbone and train only the new head', 'Train all layers with a large learning rate', 'Quantise the model'], answer: 1, why: 'The general features are kept and few parameters are trained, so the risk of overfitting is low.' },
        { q: 'Roughly how does int8 quantisation change the size of the weights file?', options: ['Doubles it', 'No change', 'Shrinks it about 4 times', 'Shrinks it 32 times'], answer: 2, why: '8 bits instead of 32: a quarter (apart from small scale values).' },
        { q: 'What is the main benefit of exporting to ONNX?', options: ['It speeds up training', 'Running the model in different runtimes without Python and PyTorch', 'It improves accuracy', 'It encrypts the data'], answer: 1, why: 'ONNX is a code-independent graph format that many runtimes (ONNX Runtime, mobile, browser) can read.' },
      ],
    },
  },
]

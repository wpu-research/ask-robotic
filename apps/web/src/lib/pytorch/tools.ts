// PyTorch dersi tarayıcı görselleştiricilerinin kimlikleri, başlık ve açıklamaları (TR/EN). PyTorch tarayıcıda çalışmaz;
// görselleştiriciler aynı matematiği TypeScript'te dürüstçe yapar (lib/pytorch, saf ve testli), gerçek kod Colab defterinde.
export type PtVizId =
  | 'tensor' | 'autograd' | 'layers' | 'optim' | 'loss3d' | 'train' | 'loader' | 'conv' | 'featuremaps' | 'cnn3d'
  | 'regul' | 'lstm' | 'attention' | 'deploy' | 'digits'

interface Text { title: string; desc: string }

export const PT_VIZ_META: Record<PtVizId, { tr: Text; en: Text }> = {
  tensor: {
    tr: { title: 'Şekil oyun alanı: yayınlama, matmul, view', desc: 'İki tensörün şeklini yaz. Yayınlama (broadcasting) kuralı sağdan sola boyutları eşler; matmul iç boyutların eşitliğini ister; view eleman sayısının korunmasını ve bitişik belleği. Hata varsa PyTorch\'un vereceği iletinin özü gösterilir.' },
    en: { title: 'Shape playground: broadcasting, matmul, view', desc: 'Type the shapes of two tensors. Broadcasting matches dimensions from right to left; matmul needs equal inner dimensions; view needs the same number of elements and contiguous memory. When it fails, the gist of the PyTorch error is shown.' },
  },
  autograd: {
    tr: { title: 'Hesaplama grafiği ve geri yayılım, adım adım', desc: 'Küçük bir ifade (bir nöron: y = tanh(w₁x₁ + w₂x₂ + b), kayıp (y − t)²) grafiğe dönüşür. İleri geçişte değerler, geri geçişte zincir kuralıyla gradyanlar düğüm düğüm dolar. Sonuç sayısal türevle karşılaştırılır.' },
    en: { title: 'Computational graph and backprop, step by step', desc: 'A small expression (one neuron: y = tanh(w₁x₁ + w₂x₂ + b), loss (y − t)²) becomes a graph. In the forward pass values fill in, in the backward pass gradients fill in node by node via the chain rule. The result is checked against a numerical derivative.' },
  },
  layers: {
    tr: { title: 'nn.Sequential kurucu: şekiller ve parametre sayısı', desc: 'Katmanları sırayla ekle (Linear, Conv2d, ReLU, MaxPool2d, Flatten, Dropout). Her katmanın çıkış şekli ve parametre sayısı torchinfo özeti gibi hesaplanır; şekil uyuşmazlığı hangi katmanda olduğunu söyler.' },
    en: { title: 'nn.Sequential builder: shapes and parameter count', desc: 'Add layers in order (Linear, Conv2d, ReLU, MaxPool2d, Flatten, Dropout). The output shape and parameter count of each layer are computed like a torchinfo summary; a shape mismatch tells you which layer it is in.' },
  },
  optim: {
    tr: { title: 'Optimize ediciler yarışı: SGD, Momentum, RMSprop, Adam', desc: 'Uzun, dar bir vadide (ve Rosenbrock\'ta) dört optimize edici aynı noktadan başlar. Öğrenme oranını değiştir: SGD zikzak yapar, momentum hız kazanır, Adam her parametrenin adımını kendi ölçeğine göre ayarlar.' },
    en: { title: 'Optimiser race: SGD, Momentum, RMSprop, Adam', desc: 'In a long, narrow valley (and on Rosenbrock) four optimisers start from the same point. Change the learning rate: SGD zigzags, momentum builds up speed, Adam scales each parameter\'s step to its own size.' },
  },
  loss3d: {
    tr: { title: '3B kayıp yüzeyi ve yörüngeler', desc: 'Aynı optimize ediciler, bu kez kayıp yüzeyinin üstünde 3B: yükseklik log(1 + f). Yüzeyi döndür, vadinin ne kadar dar olduğunu yandan gör; toplar her optimize edicinin adımlarını sırayla izler.' },
    en: { title: '3D loss surface and trajectories', desc: 'The same optimisers, this time on top of the loss surface in 3D: height log(1 + f). Rotate the surface and see from the side how narrow the valley is; the balls follow each optimiser\'s steps in turn.' },
  },
  train: {
    tr: { title: 'Eğitim döngüsü: tarayıcıda gerçek bir küçük ağ', desc: 'İki ay veri kümesinde 2-16-16-1 ağ, eğitim ve doğrulama ayrımıyla gerçekten eğitilir (Adam, ikili çapraz entropi). Her turda iki kayıp eğrisi ve doğruluk; karar sınırı arkada. Gizli katman ve öğrenme oranı senin.' },
    en: { title: 'Training loop: a real small network in the browser', desc: 'A 2-16-16-1 network is really trained on the two-moons data with a train/validation split (Adam, binary cross-entropy). Two loss curves and accuracy each epoch; the decision boundary behind. Hidden size and learning rate are yours.' },
  },
  loader: {
    tr: { title: 'DataLoader: karıştırma, yığın ve tur', desc: 'Veri kümesi 0..N−1 numaralı hücreler. batch_size, shuffle, drop_last ve tohumu (seed) değiştir; her turda hangi örneğin hangi yığına düştüğünü, tur başına adım sayısını ve son yığının boyunu gör.' },
    en: { title: 'DataLoader: shuffling, batches and epochs', desc: 'The dataset is cells numbered 0..N−1. Change batch_size, shuffle, drop_last and the seed; see which sample lands in which batch each epoch, the number of steps per epoch and the size of the last batch.' },
  },
  conv: {
    tr: { title: 'Evrişim aritmetiği: çekirdek, adım, dolgu, genişleme', desc: 'Giriş boyu, çekirdek, adım (stride), dolgu (padding) ve genişlemeyi (dilation) değiştir: çekirdek giriş üstünde kayar, çıkış boyu formülle ve ızgarada birlikte görünür. Havuzlama da aynı formülü kullanır.' },
    en: { title: 'Convolution arithmetic: kernel, stride, padding, dilation', desc: 'Change the input size, kernel, stride, padding and dilation: the kernel slides over the input, the output size appears both from the formula and on the grid. Pooling uses the same formula.' },
  },
  featuremaps: {
    tr: { title: 'Öznitelik haritaları: eğitilmiş CNN\'in içi', desc: 'Bir rakam çiz. MNIST\'te eğitilmiş küçük CNN\'in (bitirme defteriyle eğitildi) ilk evrişim katmanının 8 çekirdeği, 8 öznitelik haritası ve havuzlamadan sonraki 16 harita gösterilir. Hesap tarayıcıda, aynı ağırlıklarla.' },
    en: { title: 'Feature maps: inside a trained CNN', desc: 'Draw a digit. The 8 kernels and 8 feature maps of the first convolution layer of a small CNN trained on MNIST (with the capstone notebook) are shown, then the 16 maps after pooling. Computed in the browser with the same weights.' },
  },
  cnn3d: {
    tr: { title: 'CNN katmanları 3B', desc: 'Bir rakam çiz: girdi, conv1 (8 harita), pool1, conv2 (16 harita) ve pool2 derinlik boyunca art arda dizilir. Haritalar küçülürken sayıları artar; ağ uzamsal bilgiyi kanallara taşır. Hesap tarayıcıda, eğitilmiş ağırlıklarla.' },
    en: { title: 'CNN layers in 3D', desc: 'Draw a digit: the input, conv1 (8 maps), pool1, conv2 (16 maps) and pool2 are lined up in depth. As the maps shrink their number grows; the network moves spatial information into channels. Computed in the browser with the trained weights.' },
  },
  regul: {
    tr: { title: 'Aşırı öğrenme ve düzenlileştirme deneyi', desc: 'Az ve gürültülü veride büyük bir ağ ezberler: eğitim kaybı düşer, doğrulama kaybı yükselir. Dropout, ağırlık sönümü (weight decay) ve erken durdurmayı aç; aynı tohumla iki eğrinin arasındaki farkın nasıl kapandığını gör.' },
    en: { title: 'Overfitting and regularisation experiment', desc: 'On little, noisy data a big network memorises: training loss falls, validation loss rises. Turn on dropout, weight decay and early stopping; with the same seed, see how the gap between the two curves closes.' },
  },
  lstm: {
    tr: { title: 'RNN ve LSTM: gradyan bir dizide ne kadar yol alır', desc: 'Basit RNN\'de geri yayılan sinyal her adımda w·tanh′ ile çarpılır ve söner; LSTM\'in hücre durumunda unutma kapısıyla (f) çarpılır. Dizi boyunu, ağırlığı ve unutma kapısı ön yargısını değiştir; ∂h_T/∂h_t eğrilerini karşılaştır.' },
    en: { title: 'RNN and LSTM: how far a gradient travels along a sequence', desc: 'In a plain RNN the back-propagated signal is multiplied by w·tanh′ each step and fades; in an LSTM\'s cell state it is multiplied by the forget gate (f). Change the sequence length, the weight and the forget-gate bias; compare the ∂h_T/∂h_t curves.' },
  },
  attention: {
    tr: { title: 'Ölçekli nokta çarpımı dikkati', desc: 'softmax(QKᵀ/√d)·V: her sözcük diğerlerine bir ağırlık dağıtır. Sıcaklığı değiştir, ısı haritasında satırların keskinleştiğini ya da düzleştiğini gör. Makine öğrenmesi dersindeki dikkat dersiyle aynı hesap.' },
    en: { title: 'Scaled dot-product attention', desc: 'softmax(QKᵀ/√d)·V: each word distributes a weight over the others. Change the temperature and watch the rows of the heatmap sharpen or flatten. The same computation as the attention lesson in the machine learning course.' },
  },
  deploy: {
    tr: { title: 'Aktarım öğrenmesi ve dağıtım: dondur, nicemle, ölç', desc: 'ResNet-18\'in bloklarını dondur ya da çöz: eğitilecek parametre sayısı ve iyileştirici belleği değişir. Sonra küçük MNIST CNN\'ini int8\'e nicemle: dosya boyu, 200 test örneğindeki doğruluk ve tarayıcıdaki çıkarım süresi önce ve sonra.' },
    en: { title: 'Transfer learning and deployment: freeze, quantise, measure', desc: 'Freeze or unfreeze the blocks of ResNet-18: the number of trainable parameters and the optimiser memory change. Then quantise the small MNIST CNN to int8: file size, accuracy on 200 test samples and in-browser inference time before and after.' },
  },
  digits: {
    tr: { title: 'El yazısı rakam tanıyıcı (CNN, tarayıcıda)', desc: 'Kutucuğa bir rakam çiz. Çizim MNIST gibi hazırlanır (kırp, 20×20\'ye sığdır, kütle merkezine göre 28×28\'e ortala), CNN tarayıcıda çalışır ve on olasılığı verir. Kendi Colab defterinden indirdiğin ağırlık dosyasını yükleyip onu da deneyebilirsin.' },
    en: { title: 'Handwritten digit recogniser (CNN, in the browser)', desc: 'Draw a digit in the box. The drawing is prepared like MNIST (crop, fit into 20×20, centre by mass in 28×28), the CNN runs in the browser and gives ten probabilities. You can upload the weights file downloaded from your own Colab notebook and try that too.' },
  },
}

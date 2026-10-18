// PyTorch dersi üniteleri 1–5: tensörler, autograd, nn.Module, kayıp ve optimize ediciler, eğitim döngüsü ve doğrulama.
// HTML iki dilde aynı etiket dizisinde. Her ünitenin Colab defteri public/defterler/pytorch/<notebook>(.en).ipynb.
import type { KursUnit } from '@/lib/kurs/types'
import type { PtVizId } from './tools'
import { autogradPy, lossPy, modulePy, tensorPy, trainPy } from './code'

export const UNITS_A: KursUnit<PtVizId>[] = [
  {
    n: 1, tools: ['tensor'], notebook: '01-tensorler',
    tr: {
      title: 'Tensörler: şekil, veri tipi, yayınlama ve cihaz',
      summary: 'torch.Tensor, shape ve dtype, dilimleme, yayınlama kuralı, matmul, view ve reshape, CPU ve GPU.',
      goals: ['Bir tensörün şeklini, veri tipini ve cihazını okumak ve değiştirmek', 'Yayınlama kuralını sağdan sola uygulayarak işlem sonucunun şeklini önceden söylemek', 'matmul\'un şekil şartını ve yığın boyutlarının nasıl yayınlandığını açıklamak', 'view ile reshape arasındaki farkı (bitişik bellek) bilmek'],
      notes: `<p>PyTorch\'taki her şey bir <b>tensördür</b>: çok boyutlu bir sayı dizisi. NumPy dizisine benzer, iki farkı vardır: <b>GPU\'da</b> çalışabilir ve üstünde yapılan işlemler otomatik türev için kaydedilebilir (2. ünite).</p>
<h3>Şekil, tip, cihaz</h3>
<p>Bir görüntü yığını <code>(N, C, H, W)</code> şeklindedir: örnek sayısı, kanal, yükseklik, genişlik. Ağırlıklar çoğunlukla <code>float32</code>, sınıf etiketleri <code>int64</code> (long) olur. Model ve veri <b>aynı cihazda</b> olmalıdır: <code>.to(device)</code>.</p>
<h3>Yayınlama</h3>
<p>Farklı şekilli iki tensörle işlem yaparken PyTorch boyutları <b>sağdan</b> hizalar. Her çift ya eşit olmalı ya da biri 1 olmalı; 1 olan boyut kopyalanmış gibi davranır (bellek kopyalanmaz).</p>
<div class="eq">(8, 1, 6, 1) + (7, 1, 5) → (8, 7, 6, 5)</div>
<p>Yayınlama çok kullanışlıdır (her satırdan ortalamayı çıkarmak gibi) ama sessiz hatalara da yol açar: <code>(64,)</code> ile <code>(64, 1)</code> toplanınca <code>(64, 64)</code> çıkar.</p>
<h3>matmul ve view</h3>
<p><code>A @ B</code> için A\'nın son boyutu B\'nin sondan ikinci boyutuna eşit olmalıdır; daha öndeki boyutlar yayınlanır. <code>view</code> veriyi kopyalamadan yeni bir şekille okur; bunun için bellek <b>bitişik</b> olmalıdır. Devrik (<code>.T</code>) gibi işlemlerden sonra <code>reshape</code> (gerekirse kopyalar) ya da <code>.contiguous().view()</code> gerekir.</p>`,
      code: [tensorPy('tr')],
      lab: 'Şekil oyun alanında (8, 1, 6, 1) + (7, 1, 5) dene ve sonucu önce kâğıtta bul. Sonra (64,) ile (64, 1) topla: neden (64, 64) çıktı? matmul\'a geç: (64, 784) @ (784, 10) ve (64, 784) @ (128, 10) dene, hata iletisini oku. view kipinde (4, 3, 28, 28) → (4, -1) yap; "bitişik değil" kutusunu işaretleyip reshape ile farkı gör.',
      pitfalls: ['(N,) şekilli tahmini (N, 1) şekilli hedefle karşılaştırmak: yayınlama sessizce (N, N) üretir, kayıp yanlış ama hata yok.', 'Model GPU\'da, veri CPU\'da: "Expected all tensors to be on the same device" hatası. Her yığını .to(device) ile taşı.', 'Sınıf etiketini float vermek: CrossEntropyLoss long (int64) indeks ister.', 'Devrik sonrası view kullanmak: bitişik olmayan bellekte hata verir; reshape kullan.'],
      se: `<p>Şekil hataları, derin öğrenme kodunda en sık karşılaşılan hatadır. Bunlara karşı en ucuz savunma <b>şekil sözleşmeleri</b>dir.</p>
<ul><li>Fonksiyonların başına <code>assert x.shape[1:] == (1, 28, 28)</code> gibi kontroller koy; yorumda şekli yaz: <code># (N, C, H, W)</code>.</li><li>Her modele, rastgele bir girdiyle çıkış şeklini sınayan tek satırlık bir birim testi yaz.</li></ul>`,
      quiz: [
        { q: '(5, 1, 4) ve (3, 1) şekilli iki tensör toplanırsa sonuç ne olur?', options: ['Hata', '(5, 3, 4)', '(5, 1, 4)', '(15, 4)'], answer: 1, why: 'Sağdan hizala: 4 ve 1 → 4; 1 ve 3 → 3; 5 ve (yok) → 5. Sonuç (5, 3, 4).' },
        { q: '(32, 100) @ (100, 10) işleminin sonucu hangi şekildedir?', options: ['(32, 10)', '(100, 100)', '(10, 32)', 'Hata'], answer: 0, why: 'İç boyutlar (100) eşleşir, dış boyutlar kalır: (32, 10).' },
        { q: 'x.T.view(-1) neden hata verebilir?', options: ['-1 geçersizdir', 'Devrik tensör bellekte bitişik değildir; view kopyalamadan yeniden yorumlayamaz', 'Eleman sayısı değişir', 'GPU gerekir'], answer: 1, why: 'view veriyi kopyalamaz; adımları (stride) uyumsuz bitişik olmayan bir tensörde çalışmaz. reshape gerekirse kopyalar.' },
        { q: 'Tahmin (64,), hedef (64, 1) şeklindeyse (pred − target) ** 2 hangi şekilde çıkar?', options: ['(64,)', '(64, 1)', '(64, 64)', 'Hata'], answer: 2, why: 'Yayınlama: (64,) → (1, 64); (64, 1) ile birlikte (64, 64). Hata yok ama kayıp yanlış: sessiz hata.' },
      ],
    },
    en: {
      title: 'Tensors: shape, dtype, broadcasting and device',
      summary: 'torch.Tensor, shape and dtype, slicing, the broadcasting rule, matmul, view and reshape, CPU and GPU.',
      goals: ['Read and change a tensor\'s shape, data type and device', 'Predict the shape of a result by applying the broadcasting rule from right to left', 'Explain matmul\'s shape condition and how batch dimensions broadcast', 'Know the difference between view and reshape (contiguous memory)'],
      notes: `<p>Everything in PyTorch is a <b>tensor</b>: a multi-dimensional array of numbers. It resembles a NumPy array with two differences: it can run on a <b>GPU</b>, and operations on it can be recorded for automatic differentiation (unit 2).</p>
<h3>Shape, type, device</h3>
<p>A batch of images has shape <code>(N, C, H, W)</code>: samples, channels, height, width. Weights are mostly <code>float32</code>, class labels <code>int64</code> (long). The model and the data must be <b>on the same device</b>: <code>.to(device)</code>.</p>
<h3>Broadcasting</h3>
<p>When operating on two tensors of different shapes, PyTorch aligns the dimensions <b>from the right</b>. Each pair must be equal or one of them must be 1; a dimension of 1 behaves as if copied (no memory is copied).</p>
<div class="eq">(8, 1, 6, 1) + (7, 1, 5) → (8, 7, 6, 5)</div>
<p>Broadcasting is very handy (subtracting each row\'s mean, for example) but it also causes silent bugs: adding <code>(64,)</code> and <code>(64, 1)</code> gives <code>(64, 64)</code>.</p>
<h3>matmul and view</h3>
<p>For <code>A @ B</code> the last dimension of A must equal the second-to-last of B; earlier dimensions broadcast. <code>view</code> reads the data with a new shape without copying; for that the memory must be <b>contiguous</b>. After operations such as a transpose (<code>.T</code>) you need <code>reshape</code> (copies if needed) or <code>.contiguous().view()</code>.</p>`,
      code: [tensorPy('en')],
      lab: 'In the shape playground try (8, 1, 6, 1) + (7, 1, 5) and work out the result on paper first. Then add (64,) and (64, 1): why did (64, 64) come out? Switch to matmul: try (64, 784) @ (784, 10) and (64, 784) @ (128, 10) and read the error message. In view mode turn (4, 3, 28, 28) into (4, -1); tick "not contiguous" and see the difference with reshape.',
      pitfalls: ['Comparing an (N,) prediction with an (N, 1) target: broadcasting silently produces (N, N); the loss is wrong but there is no error.', 'Model on the GPU, data on the CPU: "Expected all tensors to be on the same device". Move every batch with .to(device).', 'Passing class labels as float: CrossEntropyLoss wants long (int64) indices.', 'Using view after a transpose: it fails on non-contiguous memory; use reshape.'],
      se: `<p>Shape errors are the most common bug in deep learning code. The cheapest defence against them is <b>shape contracts</b>.</p>
<ul><li>Put checks such as <code>assert x.shape[1:] == (1, 28, 28)</code> at the top of functions; write the shape in a comment: <code># (N, C, H, W)</code>.</li><li>Write a one-line unit test for every model that checks the output shape on a random input.</li></ul>`,
      quiz: [
        { q: 'What is the result of adding tensors of shapes (5, 1, 4) and (3, 1)?', options: ['An error', '(5, 3, 4)', '(5, 1, 4)', '(15, 4)'], answer: 1, why: 'Align from the right: 4 and 1 → 4; 1 and 3 → 3; 5 and (none) → 5. The result is (5, 3, 4).' },
        { q: 'What shape does (32, 100) @ (100, 10) produce?', options: ['(32, 10)', '(100, 100)', '(10, 32)', 'An error'], answer: 0, why: 'The inner dimensions (100) match and the outer ones remain: (32, 10).' },
        { q: 'Why can x.T.view(-1) fail?', options: ['-1 is invalid', 'A transposed tensor is not contiguous in memory; view cannot reinterpret it without copying', 'The number of elements changes', 'It needs a GPU'], answer: 1, why: 'view does not copy; it does not work on a non-contiguous tensor with incompatible strides. reshape copies if needed.' },
        { q: 'If the prediction has shape (64,) and the target (64, 1), what shape does (pred − target) ** 2 have?', options: ['(64,)', '(64, 1)', '(64, 64)', 'An error'], answer: 2, why: 'Broadcasting: (64,) → (1, 64); together with (64, 1) it becomes (64, 64). No error, but the loss is wrong: a silent bug.' },
      ],
    },
  },
  {
    n: 2, tools: ['autograd'], notebook: '02-autograd',
    tr: {
      title: 'Autograd: hesaplama grafiği ve geri yayılım',
      summary: 'requires_grad, grad_fn, dinamik grafik, backward ve zincir kuralı, gradyan birikimi, no_grad, sayısal kontrol.',
      goals: ['İleri geçişte hesaplama grafiğinin nasıl kurulduğunu açıklamak', 'Zincir kuralıyla küçük bir grafikte gradyanları elle hesaplamak ve autograd ile karşılaştırmak', 'Gradyan birikimini ve zero_grad\'ın neden gerektiğini göstermek', 'torch.no_grad ve detach\'ın ne zaman kullanılacağını bilmek'],
      notes: `<p>Bir sinir ağını eğitmek, kaybı her parametreye göre türevlemek ve parametreyi gradyanın tersi yönünde biraz kaydırmaktır. Milyonlarca parametre için türevi elle yazmak imkânsızdır; PyTorch bunu <b>autograd</b> ile yapar.</p>
<h3>Grafik, ileri geçişte kurulur</h3>
<p><code>requires_grad=True</code> olan bir tensörle yapılan her işlem bir düğüm olarak kaydedilir; sonuç tensörünün <code>grad_fn</code> alanı o düğümü gösterir. Grafik <b>dinamiktir</b>: her ileri geçişte yeniden kurulur, Python\'daki if ve döngüler olduğu gibi çalışır.</p>
<h3>Geri geçiş: zincir kuralı</h3>
<p><code>L.backward()</code>, L\'den başlayıp grafiği tersten dolaşır. Her düğüm kendi <b>yerel türevini</b> bilir ve gelen gradyanı onunla çarpıp girdilerine aktarır:</p>
<div class="eq">∂L/∂w₁ = ∂L/∂y · ∂y/∂z · ∂z/∂w₁ = 2(y − t) · (1 − y²) · x₁</div>
<p>Yaprak tensörlerin (parametrelerin) <code>.grad</code> alanı dolar. Bir değişken birden çok yerde kullanılırsa katkılar <b>toplanır</b>; bu yüzden gradyanlar çağrılar arasında da birikir ve her adımda <code>optimizer.zero_grad()</code> gerekir.</p>
<h3>Grafiğin dışında kalmak</h3>
<p>Doğrulama ve çıkarımda grafiğe gerek yoktur: <code>with torch.no_grad():</code> bellek ve zaman kazandırır. <code>.detach()</code> bir tensörü grafikten koparır. Gradyanı doğrulamanın en iyi yolu <b>sayısal türevdir</b>: (L(θ + h) − L(θ − h)) / 2h.</p>`,
      code: [autogradPy('tr')],
      lab: 'Grafik görselleştiricisinde "İleri" ile değerleri doldur, sonra "Geri" ile gradyanların L\'den yapraklara doğru nasıl aktığını adım adım izle. w₁\'in gradyanını notlardaki formülle elle hesapla ve sağdaki sayısal türevle karşılaştır. "SGD adımı"na 10 kez bas: kayıp nasıl değişti? x₁\'i 0 yap: w₁\'in gradyanına ne oldu, neden?',
      pitfalls: ['optimizer.zero_grad() çağırmayı unutmak: gradyanlar her yığında birikir, adımlar giderek büyür.', 'Parametreyi with torch.no_grad() dışında elle güncellemek: güncelleme grafiğe girer ve "a leaf Variable that requires grad is being used in an in-place operation" hatası çıkar.', 'Doğrulamada no_grad kullanmamak: bellek gereksiz yere dolar, büyük modelde GPU belleği taşar.', 'Kaybı listeye eklerken .item() demeden saklamak: tüm grafikler bellekte kalır.'],
      se: `<p>Gradyan kontrolü (gradient check) yeni bir katman ya da kayıp fonksiyonu yazarken kullanılan klasik bir <b>doğrulama testidir</b>.</p>
<ul><li><code>torch.autograd.gradcheck</code>, float64 girdilerle analitik ve sayısal türevi karşılaştırır; özel katmanların birim testine ekle.</li><li>Tekrarlanabilirlik için tohumu sabitle (<code>torch.manual_seed</code>) ve testte küçük boyutlar kullan.</li></ul>`,
      quiz: [
        { q: 'L = (y − t)² ve y = tanh(z) ise ∂L/∂z nedir?', options: ['2(y − t)', '2(y − t)(1 − y²)', '(1 − y²)', 'tanh(z) − t'], answer: 1, why: 'Zincir kuralı: ∂L/∂y = 2(y − t), ∂y/∂z = 1 − tanh²(z) = 1 − y². Çarpımları.' },
        { q: 'Aynı parametreyle iki kez backward() çağrılır ve arada zero_grad yoksa .grad ne olur?', options: ['Son çağrının gradyanı', 'Sıfır', 'İki gradyanın toplamı', 'Hata'], answer: 2, why: 'PyTorch gradyanları biriktirir (toplar); bu, yığınları bölüp biriktirmek için bilerek böyle tasarlanmıştır.' },
        { q: 'with torch.no_grad(): bloğunun ana amacı nedir?', options: ['Modeli eğitim kipine almak', 'İşlemlerin grafiğe kaydedilmemesi: çıkarımda bellek ve zaman kazancı', 'Gradyanları sıfırlamak', 'GPU\'yu kapatmak'], answer: 1, why: 'Grafik kurulmadığından ara değerler saklanmaz; doğrulama ve çıkarım daha hızlı ve az bellekli olur.' },
        { q: 'z = w·x ise ∂z/∂w nedir?', options: ['w', 'x', '1', 'w·x'], answer: 1, why: 'Çarpma düğümünün bir girdiye göre yerel türevi öbür girdidir.' },
      ],
    },
    en: {
      title: 'Autograd: the computational graph and backpropagation',
      summary: 'requires_grad, grad_fn, the dynamic graph, backward and the chain rule, gradient accumulation, no_grad, numerical checks.',
      goals: ['Explain how the computational graph is built during the forward pass', 'Compute gradients on a small graph by hand with the chain rule and compare with autograd', 'Show gradient accumulation and why zero_grad is needed', 'Know when to use torch.no_grad and detach'],
      notes: `<p>Training a neural network means differentiating the loss with respect to every parameter and nudging each parameter against its gradient. Writing derivatives by hand for millions of parameters is impossible; PyTorch does it with <b>autograd</b>.</p>
<h3>The graph is built in the forward pass</h3>
<p>Every operation on a tensor with <code>requires_grad=True</code> is recorded as a node; the result tensor\'s <code>grad_fn</code> points to that node. The graph is <b>dynamic</b>: it is rebuilt on every forward pass, and Python ifs and loops work as they are.</p>
<h3>Backward pass: the chain rule</h3>
<p><code>L.backward()</code> starts at L and walks the graph backwards. Each node knows its <b>local derivative</b>, multiplies the incoming gradient by it and passes it on to its inputs:</p>
<div class="eq">∂L/∂w₁ = ∂L/∂y · ∂y/∂z · ∂z/∂w₁ = 2(y − t) · (1 − y²) · x₁</div>
<p>The <code>.grad</code> fields of the leaf tensors (parameters) fill up. If a variable is used in several places the contributions are <b>summed</b>; that is why gradients also accumulate between calls and every step needs <code>optimizer.zero_grad()</code>.</p>
<h3>Staying out of the graph</h3>
<p>Validation and inference need no graph: <code>with torch.no_grad():</code> saves memory and time. <code>.detach()</code> cuts a tensor off the graph. The best way to verify a gradient is the <b>numerical derivative</b>: (L(θ + h) − L(θ − h)) / 2h.</p>`,
      code: [autogradPy('en')],
      lab: 'In the graph visualiser fill the values with "Forward", then follow step by step with "Backward" how gradients flow from L to the leaves. Compute w₁\'s gradient by hand with the formula in the notes and compare with the numerical derivative on the right. Press "SGD step" 10 times: how did the loss change? Set x₁ to 0: what happened to w₁\'s gradient, and why?',
      pitfalls: ['Forgetting optimizer.zero_grad(): gradients accumulate every batch and steps keep growing.', 'Updating a parameter by hand outside with torch.no_grad(): the update enters the graph and you get "a leaf Variable that requires grad is being used in an in-place operation".', 'Not using no_grad during validation: memory fills needlessly and on a big model the GPU runs out.', 'Storing the loss in a list without .item(): every graph stays in memory.'],
      se: `<p>Gradient checking is a classic <b>verification test</b> used when writing a new layer or loss function.</p>
<ul><li><code>torch.autograd.gradcheck</code> compares analytic and numerical derivatives with float64 inputs; add it to the unit tests of custom layers.</li><li>Fix the seed for reproducibility (<code>torch.manual_seed</code>) and use small sizes in tests.</li></ul>`,
      quiz: [
        { q: 'If L = (y − t)² and y = tanh(z), what is ∂L/∂z?', options: ['2(y − t)', '2(y − t)(1 − y²)', '(1 − y²)', 'tanh(z) − t'], answer: 1, why: 'Chain rule: ∂L/∂y = 2(y − t), ∂y/∂z = 1 − tanh²(z) = 1 − y². Their product.' },
        { q: 'backward() is called twice for the same parameter with no zero_grad in between. What is .grad?', options: ['The last call\'s gradient', 'Zero', 'The sum of the two gradients', 'An error'], answer: 2, why: 'PyTorch accumulates (sums) gradients; this is deliberate, so that batches can be split and accumulated.' },
        { q: 'What is the main purpose of a with torch.no_grad(): block?', options: ['To put the model in training mode', 'Operations are not recorded in the graph: memory and time savings during inference', 'To zero the gradients', 'To turn off the GPU'], answer: 1, why: 'No graph is built, so intermediate values are not stored; validation and inference are faster and use less memory.' },
        { q: 'If z = w·x, what is ∂z/∂w?', options: ['w', 'x', '1', 'w·x'], answer: 1, why: 'The local derivative of a multiply node with respect to one input is the other input.' },
      ],
    },
  },
  {
    n: 3, tools: ['layers'], notebook: '03-nn-module',
    tr: {
      title: 'nn.Module: katmanlar, parametreler ve model yazmak',
      summary: 'nn.Module alt sınıfı, __init__ ve forward, nn.Sequential, Linear ve Conv2d, parametre sayımı, state_dict.',
      goals: ['nn.Module alt sınıfı yazıp katmanları __init__\'te, hesabı forward\'da tanımlamak', 'Linear ve Conv2d katmanlarının parametre sayısını elle hesaplamak', 'Katman katman şekil izleyip uyuşmazlığı bulmak', 'state_dict ile ağırlıkları kaydetmek ve yüklemek'],
      notes: `<p>PyTorch\'ta bir model, <code>nn.Module</code>\'den türeyen bir sınıftır. <code>__init__</code>\'te katmanlar oluşturulur ve <b>özellik olarak atanır</b>; PyTorch bu atamaları izleyerek tüm parametreleri bulur (<code>model.parameters()</code>). <code>forward</code> verinin nasıl aktığını tanımlar; modeli <code>model(x)</code> diye çağırırsın, <code>forward</code>\'u doğrudan değil.</p>
<h3>Parametre sayısı</h3>
<div class="eq">Linear(n, m): n·m + m &nbsp;&nbsp; Conv2d(c<sub>in</sub>, c<sub>out</sub>, k): c<sub>out</sub>·c<sub>in</sub>·k² + c<sub>out</sub></div>
<p>Evrişim katmanının parametre sayısı görüntü boyundan bağımsızdır; tam bağlı katmanınki girdinin boyuna bağlıdır. Bu yüzden CNN\'lerde parametrelerin çoğu sondaki <code>Linear</code>\'dadır.</p>
<h3>Şekil izleme</h3>
<p>Katmanlar arasındaki en sık hata <code>Flatten</code>\'dan sonraki <code>Linear</code>\'ın giriş boyudur: 16 kanal × 7 × 7 = 784. Bunu her seferinde elle hesaplamak yerine rastgele bir girdiyi modelden geçirip ara şekilleri yazdırmak (ya da <code>torchinfo.summary</code>) en güvenli yoldur. <code>nn.LazyLinear</code> giriş boyunu ilk çağrıda kendisi bulur.</p>
<h3>Kaydetme</h3>
<p><code>model.state_dict()</code>, parametre adlarından tensörlere bir sözlüktür. <code>torch.save(model.state_dict(), "m.pt")</code> ile kaydedilir, aynı sınıftan yeni bir model kurulup <code>load_state_dict</code> ile yüklenir. Tüm nesneyi pickle\'lamak sınıf kodu değişince kırılır.</p>`,
      code: [modulePy('tr')],
      lab: 'Katman kurucusunda hazır "MNIST CNN"i yükle ve her satırdaki şekli ve parametre sayısını formülle doğrula. Sonra son Linear\'ın girişini 100 yap: hata hangi satırda çıktı, ileti ne diyor? İkinci MaxPool2d\'yi sil ve Linear\'ın yeni giriş boyunu bul. Son olarak parametrelerin yüzde kaçının son katmanda olduğunu hesapla.',
      pitfalls: ['super().__init__() çağırmayı unutmak: "cannot assign module before Module.__init__() call" hatası.', 'Katmanları sıradan bir Python listesinde tutmak: parametreler model.parameters()\'ta görünmez, eğitilmez. nn.ModuleList kullan.', 'forward\'u doğrudan çağırmak (model.forward(x)): kancalar (hook) çalışmaz; model(x) kullan.', 'Flatten sonrası giriş boyunu yanlış hesaplamak: "mat1 and mat2 shapes cannot be multiplied" hatası.'],
      se: `<p>nn.Module, <b>bileşim</b> (composition) ilkesinin güzel bir örneğidir: büyük model küçük modüllerden kurulur, her biri ayrı test edilebilir.</p>
<ul><li>Bloklar (ör. evrişim + ReLU + havuzlama) için ayrı sınıflar yaz; her biri için şekil testi ekle.</li><li>Model yapılandırmasını (katman sayısı, genişlik) bir veri sınıfında tut; deneyleri kodu değiştirmeden yapılandırmayla değiştir.</li></ul>`,
      quiz: [
        { q: 'nn.Linear(128, 10) kaç parametre içerir?', options: ['1280', '1290', '138', '10'], answer: 1, why: '128·10 ağırlık + 10 bias = 1290.' },
        { q: 'nn.Conv2d(3, 16, 3) kaç parametre içerir?', options: ['144', '432', '448', '16'], answer: 2, why: '16·3·3·3 = 432 ağırlık + 16 bias = 448. Görüntü boyundan bağımsız.' },
        { q: 'Katmanları self.katmanlar = [nn.Linear(...), ...] diye sıradan listede tutarsan ne olur?', options: ['Sorun olmaz', 'Parametreler kaydedilmez, optimize edici onları görmez', 'Model hızlanır', 'Hata verir'], answer: 1, why: 'PyTorch yalnız nn.Module, nn.ModuleList, nn.ModuleDict gibi özellikleri izler; düz liste görünmez kalır.' },
        { q: '(16, 7, 7) şekilli öznitelik haritası Flatten\'dan sonra Linear\'a girecek. Linear\'ın giriş boyu ne olmalı?', options: ['16', '49', '112', '784'], answer: 3, why: '16 · 7 · 7 = 784.' },
      ],
    },
    en: {
      title: 'nn.Module: layers, parameters and writing models',
      summary: 'Subclassing nn.Module, __init__ and forward, nn.Sequential, Linear and Conv2d, counting parameters, state_dict.',
      goals: ['Write an nn.Module subclass with layers in __init__ and the computation in forward', 'Compute the parameter count of Linear and Conv2d layers by hand', 'Trace shapes layer by layer and find a mismatch', 'Save and load weights with state_dict'],
      notes: `<p>In PyTorch a model is a class derived from <code>nn.Module</code>. Layers are created in <code>__init__</code> and <b>assigned as attributes</b>; PyTorch tracks these assignments to find all parameters (<code>model.parameters()</code>). <code>forward</code> defines how the data flows; you call the model as <code>model(x)</code>, not <code>forward</code> directly.</p>
<h3>Parameter count</h3>
<div class="eq">Linear(n, m): n·m + m &nbsp;&nbsp; Conv2d(c<sub>in</sub>, c<sub>out</sub>, k): c<sub>out</sub>·c<sub>in</sub>·k² + c<sub>out</sub></div>
<p>A convolution layer\'s parameter count does not depend on image size; a fully connected layer\'s depends on its input size. That is why in CNNs most parameters sit in the final <code>Linear</code>.</p>
<h3>Tracing shapes</h3>
<p>The most common bug between layers is the input size of the <code>Linear</code> after <code>Flatten</code>: 16 channels × 7 × 7 = 784. Rather than computing it by hand every time, the safest way is to pass a random input through the model and print the intermediate shapes (or use <code>torchinfo.summary</code>). <code>nn.LazyLinear</code> finds its input size on the first call.</p>
<h3>Saving</h3>
<p><code>model.state_dict()</code> is a dictionary from parameter names to tensors. Save it with <code>torch.save(model.state_dict(), "m.pt")</code>, build a new model from the same class and load it with <code>load_state_dict</code>. Pickling the whole object breaks when the class code changes.</p>`,
      code: [modulePy('en')],
      lab: 'In the layer builder load the ready "MNIST CNN" and check the shape and parameter count on every row with the formula. Then set the last Linear\'s input to 100: on which row did the error appear and what does the message say? Delete the second MaxPool2d and find the Linear\'s new input size. Finally compute what percentage of the parameters is in the last layer.',
      pitfalls: ['Forgetting to call super().__init__(): "cannot assign module before Module.__init__() call".', 'Keeping layers in a plain Python list: the parameters do not appear in model.parameters() and are not trained. Use nn.ModuleList.', 'Calling forward directly (model.forward(x)): hooks do not run; use model(x).', 'Computing the input size after Flatten wrongly: "mat1 and mat2 shapes cannot be multiplied".'],
      se: `<p>nn.Module is a nice example of the <b>composition</b> principle: a large model is built from small modules, each testable on its own.</p>
<ul><li>Write separate classes for blocks (e.g. convolution + ReLU + pooling); add a shape test for each.</li><li>Keep the model configuration (number of layers, width) in a data class; change experiments through configuration without touching code.</li></ul>`,
      quiz: [
        { q: 'How many parameters does nn.Linear(128, 10) have?', options: ['1280', '1290', '138', '10'], answer: 1, why: '128·10 weights + 10 biases = 1290.' },
        { q: 'How many parameters does nn.Conv2d(3, 16, 3) have?', options: ['144', '432', '448', '16'], answer: 2, why: '16·3·3·3 = 432 weights + 16 biases = 448. Independent of image size.' },
        { q: 'What happens if you keep layers in a plain list, self.layers = [nn.Linear(...), ...]?', options: ['Nothing goes wrong', 'The parameters are not registered and the optimiser does not see them', 'The model gets faster', 'It raises an error'], answer: 1, why: 'PyTorch only tracks attributes such as nn.Module, nn.ModuleList and nn.ModuleDict; a plain list stays invisible.' },
        { q: 'A (16, 7, 7) feature map goes into a Linear after Flatten. What must the Linear\'s input size be?', options: ['16', '49', '112', '784'], answer: 3, why: '16 · 7 · 7 = 784.' },
      ],
    },
  },
  {
    n: 4, tools: ['optim'], notebook: '04-kayip-optimizasyon',
    tr: {
      title: 'Kayıp fonksiyonları ve optimize ediciler',
      summary: 'MSE, ikili ve çok sınıflı çapraz entropi, logit; SGD, momentum, RMSprop, Adam; öğrenme oranı ve zamanlayıcılar.',
      goals: ['Probleme göre kayıp fonksiyonu seçmek (regresyon, ikili, çok sınıflı)', 'CrossEntropyLoss\'un logit beklediğini ve neden softmax uygulanmaması gerektiğini açıklamak', 'SGD, momentum ve Adam\'ın güncelleme kurallarını karşılaştırmak', 'Öğrenme oranının çok küçük ve çok büyük olmasının belirtilerini tanımak'],
      notes: `<h3>Kayıp fonksiyonu</h3>
<ul><li><b>Regresyon</b>: <code>nn.MSELoss</code> (aykırılara duyarlı) ya da <code>nn.L1Loss</code> / <code>SmoothL1Loss</code>.</li><li><b>İkili sınıflandırma</b>: <code>nn.BCEWithLogitsLoss</code>: sigmoid ve log\'u birlikte, sayısal olarak kararlı hesaplar.</li><li><b>Çok sınıflı</b>: <code>nn.CrossEntropyLoss</code>: girdisi ham skorlar (logit), hedefi sınıf indeksi; içinde log_softmax vardır.</li></ul>
<div class="eq">CE = −log( e<sup>z<sub>y</sub></sup> / Σ<sub>k</sub> e<sup>z<sub>k</sub></sup> )</div>
<h3>Optimize ediciler</h3>
<p><b>SGD</b> gradyanın tersine sabit oranla adım atar: θ ← θ − η·g. Dar ve uzun bir vadide (bir yönde dik, öbüründe sığ) dik yönde zikzak yapar, sığ yönde yavaş ilerler. <b>Momentum</b> geçmiş gradyanların hareketli toplamını kullanır (v ← μv + g); zikzaklar birbirini sönümler, tutarlı yönde hız birikir. <b>RMSprop</b> ve <b>Adam</b> her parametrenin adımını o parametrenin gradyan büyüklüğünün karekök ortalamasına böler: dik yönde küçük, sığ yönde büyük adım. Adam ayrıca momentum ve başlangıç sapması düzeltmesi içerir; pratikte iyi bir varsayılandır (lr = 1e-3).</p>
<h3>Öğrenme oranı</h3>
<p>Çok küçükse kayıp yavaş azalır; çok büyükse kayıp zıplar ya da <b>NaN</b> olur. Zamanlayıcılar (<code>StepLR</code>, <code>CosineAnnealingLR</code>, <code>OneCycleLR</code>) eğitim boyunca oranı değiştirir.</p>`,
      code: [lossPy('tr')],
      lab: 'Optimize edici yarışında vadi yüzeyini seç ve öğrenme oranını 0,05\'te tut: 100 adımda hangisi minimuma en yakın? SGD\'nin oranını yavaşça artır: hangi değerde zikzak başlıyor, hangi değerde ıraksıyor? Rosenbrock\'a geç: Adam ve momentum muz biçimli vadiyi nasıl izliyor? Eyer yüzeyinde SGD neden eyer noktasında takılıyor?',
      pitfalls: ['CrossEntropyLoss\'tan önce softmax uygulamak: kayıp içinde zaten log_softmax var; çift softmax öğrenmeyi yavaşlatır.', 'BCELoss\'a logit vermek: [0, 1] olasılık bekler; logit için BCEWithLogitsLoss kullan.', 'Optimize ediciyi model.to(device)\'dan önce kurup sonra modeli taşımak: genelde sorun olmaz ama optimizer durumunu yüklerken cihazlar karışır; önce modeli taşı.', 'Kayıp NaN olunca eğitimi sürdürmek: öğrenme oranını düşür, gradyan kırpma (clip_grad_norm_) dene, girdiyi normalleştir.'],
      se: `<p>Optimize edici ve kayıp seçimi deneysel bir karardır; kararı <b>kayıt altına al</b>.</p>
<ul><li>Her deneyin yapılandırmasını (lr, optimize edici, tohum) ve sonucunu bir tabloya ya da TensorBoard/W&amp;B gibi bir izleme aracına yaz.</li><li>Kayıp NaN olduğunda eğitimi durduran bir koruma (assert torch.isfinite(loss)) ekle; sessizce bozuk model kaydetme.</li></ul>`,
      quiz: [
        { q: '10 sınıflı bir sınıflandırma için hangi kayıp fonksiyonu ve girdi doğrudur?', options: ['MSELoss ve olasılıklar', 'CrossEntropyLoss ve ham skorlar (logit)', 'BCELoss ve logit', 'CrossEntropyLoss ve softmax olasılıkları'], answer: 1, why: 'CrossEntropyLoss log_softmax\'ı kendisi uygular; ona ham skorlar ve sınıf indeksleri verilir.' },
        { q: 'Dar bir vadide SGD neden zikzak yapar?', options: ['Öğrenme oranı sıfırdır', 'Dik yöndeki büyük gradyan her adımda karşı yamaca aşırı adım attırır', 'Gradyan yanlış hesaplanır', 'Momentum çok büyüktür'], answer: 1, why: 'Aynı oran dik yönde fazla, sığ yönde az gelir; dik yönde salınım, sığ yönde yavaş ilerleme olur.' },
        { q: 'Adam\'ın her parametre için adımı ayarlamasının kaynağı nedir?', options: ['Rastgelelik', 'Gradyan karelerinin hareketli ortalamasına bölmek', 'Kaybı normalleştirmek', 'Parametre sayısı'], answer: 1, why: 'Adım ≈ η·m̂/√v̂: gradyanı sürekli büyük olan parametrede küçük, küçük olanda büyük adım.' },
        { q: 'Eğitimin ilk birkaç adımında kayıp NaN oluyorsa en olası neden nedir?', options: ['Öğrenme oranı çok büyük', 'Çok az veri', 'Dropout', 'Doğrulama kümesi küçük'], answer: 0, why: 'Büyük adımlar parametreleri ıraksatır; değerler taşar ve NaN olur.' },
      ],
    },
    en: {
      title: 'Loss functions and optimisers',
      summary: 'MSE, binary and multi-class cross-entropy, logits; SGD, momentum, RMSprop, Adam; learning rates and schedulers.',
      goals: ['Choose a loss function by problem (regression, binary, multi-class)', 'Explain that CrossEntropyLoss expects logits and why softmax must not be applied', 'Compare the update rules of SGD, momentum and Adam', 'Recognise the symptoms of a learning rate that is too small or too large'],
      notes: `<h3>Loss function</h3>
<ul><li><b>Regression</b>: <code>nn.MSELoss</code> (sensitive to outliers) or <code>nn.L1Loss</code> / <code>SmoothL1Loss</code>.</li><li><b>Binary classification</b>: <code>nn.BCEWithLogitsLoss</code>: computes sigmoid and log together, numerically stable.</li><li><b>Multi-class</b>: <code>nn.CrossEntropyLoss</code>: its input is raw scores (logits), its target a class index; it contains log_softmax.</li></ul>
<div class="eq">CE = −log( e<sup>z<sub>y</sub></sup> / Σ<sub>k</sub> e<sup>z<sub>k</sub></sup> )</div>
<h3>Optimisers</h3>
<p><b>SGD</b> steps against the gradient at a fixed rate: θ ← θ − η·g. In a long, narrow valley (steep in one direction, shallow in the other) it zigzags in the steep direction and crawls in the shallow one. <b>Momentum</b> uses a running sum of past gradients (v ← μv + g); zigzags cancel and speed builds up in a consistent direction. <b>RMSprop</b> and <b>Adam</b> divide each parameter\'s step by the root mean square of that parameter\'s gradient: small steps in the steep direction, big ones in the shallow one. Adam also includes momentum and bias correction; in practice it is a good default (lr = 1e-3).</p>
<h3>Learning rate</h3>
<p>Too small and the loss falls slowly; too large and the loss jumps around or becomes <b>NaN</b>. Schedulers (<code>StepLR</code>, <code>CosineAnnealingLR</code>, <code>OneCycleLR</code>) change the rate during training.</p>`,
      code: [lossPy('en')],
      lab: 'In the optimiser race choose the valley surface and keep the learning rate at 0.05: which gets closest to the minimum in 100 steps? Slowly raise SGD\'s rate: at what value does the zigzag start, and at what value does it diverge? Switch to Rosenbrock: how do Adam and momentum follow the banana-shaped valley? On the saddle surface, why does SGD get stuck at the saddle point?',
      pitfalls: ['Applying softmax before CrossEntropyLoss: the loss already contains log_softmax; a double softmax slows learning.', 'Passing logits to BCELoss: it expects probabilities in [0, 1]; use BCEWithLogitsLoss for logits.', 'Creating the optimiser before model.to(device) and moving the model afterwards: usually fine, but devices get mixed up when loading optimiser state; move the model first.', 'Continuing training when the loss becomes NaN: lower the learning rate, try gradient clipping (clip_grad_norm_), normalise the input.'],
      se: `<p>Choosing the optimiser and the loss is an experimental decision; <b>record it</b>.</p>
<ul><li>Write each experiment\'s configuration (lr, optimiser, seed) and result to a table or a tracking tool such as TensorBoard/W&amp;B.</li><li>Add a guard that stops training when the loss is NaN (assert torch.isfinite(loss)); do not silently save a broken model.</li></ul>`,
      quiz: [
        { q: 'Which loss function and input are correct for a 10-class classification?', options: ['MSELoss with probabilities', 'CrossEntropyLoss with raw scores (logits)', 'BCELoss with logits', 'CrossEntropyLoss with softmax probabilities'], answer: 1, why: 'CrossEntropyLoss applies log_softmax itself; it is given raw scores and class indices.' },
        { q: 'Why does SGD zigzag in a narrow valley?', options: ['The learning rate is zero', 'The large gradient in the steep direction makes it overshoot to the opposite slope every step', 'The gradient is computed wrongly', 'Momentum is too large'], answer: 1, why: 'The same rate is too much in the steep direction and too little in the shallow one; it oscillates in one and crawls in the other.' },
        { q: 'Where does Adam\'s per-parameter step size come from?', options: ['Randomness', 'Dividing by a moving average of squared gradients', 'Normalising the loss', 'The number of parameters'], answer: 1, why: 'Step ≈ η·m̂/√v̂: small steps for parameters with consistently large gradients, large steps for small ones.' },
        { q: 'If the loss becomes NaN in the first few steps of training, what is the most likely cause?', options: ['The learning rate is too large', 'Too little data', 'Dropout', 'A small validation set'], answer: 0, why: 'Large steps make the parameters diverge; values overflow and become NaN.' },
      ],
    },
  },
  {
    n: 5, tools: ['train'], notebook: '05-egitim-dongusu',
    tr: {
      title: 'Eğitim döngüsü ve doğrulama',
      summary: 'Dört adımlı döngü, tur ve yığın, model.train / model.eval, eğitim–doğrulama–test ayrımı, metrikler, tekrarlanabilirlik.',
      goals: ['Dört adımlı eğitim döngüsünü (zero_grad, ileri, backward, step) hatasız yazmak', 'Veriyi eğitim, doğrulama ve test olarak ayırmanın nedenini açıklamak', 'Kayıp ve doğruluk eğrilerinden öğrenmenin gidişini okumak', 'Tohumlarla tekrarlanabilir bir deney kurmak'],
      notes: `<p>PyTorch\'ta eğitim döngüsünü sen yazarsın. Her yığın için dört adım:</p>
<ol><li><code>optimizer.zero_grad()</code>: önceki gradyanları sil.</li><li><code>loss = loss_fn(model(xb), yb)</code>: ileri geçiş ve kayıp.</li><li><code>loss.backward()</code>: gradyanlar.</li><li><code>optimizer.step()</code>: parametreleri güncelle.</li></ol>
<p>Verinin tamamı bir kez görülünce bir <b>tur</b> (epoch) biter. Her turun sonunda model <b>doğrulama kümesinde</b> ölçülür: <code>model.eval()</code> ve <code>torch.no_grad()</code> ile.</p>
<h3>Neden üç küme?</h3>
<p>Eğitim kaybı, modelin ezberleyip ezberlemediğini söylemez. <b>Doğrulama</b> kümesi model ve hiperparametre seçimi (öğrenme oranı, katman sayısı, ne zaman durulacağı) için kullanılır; seçim yapıldıkça ona da "uyum" sağlanır. Bu yüzden son raporlanan sayı, hiç dokunulmamış bir <b>test</b> kümesinden gelmelidir.</p>
<h3>Eğrileri okumak</h3>
<p>İki eğri birlikte düşüyorsa öğrenme sürüyor. Eğitim düşer ama doğrulama yükselirse <b>aşırı öğrenme</b> (8. ünite). İkisi de yüksek kalırsa model ya da öğrenme oranı yetersizdir. <b>Tekrarlanabilirlik</b> için <code>torch.manual_seed</code>, NumPy ve Python tohumlarını sabitle; aynı tohum aynı eğriyi vermeli (bu sayfadaki ağ da tohumludur).</p>`,
      code: [trainPy('tr')],
      lab: 'Eğitim görselleştiricisinde varsayılan ayarla 60 tur eğit ve iki kayıp eğrisini izle. Öğrenme oranını 0,001 ve 0,1 yap: eğriler nasıl değişti? Gizli katmanı 2 nörona indir: karar sınırı neden iki ayı ayıramıyor? Tohumu değiştirip aynı ayarla iki kez eğit: son doğrulama doğruluğu ne kadar oynuyor?',
      pitfalls: ['model.eval()\'ı unutmak: dropout ve batchnorm doğrulamada da eğitim kipinde çalışır, sonuçlar gürültülü ve kötü çıkar.', 'Doğrulama kümesiyle hiperparametre seçip aynı sayıyı "test doğruluğu" diye raporlamak: iyimser sonuç.', 'Normalleştirme istatistiklerini (ortalama, std) tüm veriden hesaplamak: test bilgisi eğitime sızar. Yalnız eğitim kümesinden hesapla.', 'Kaybı tur sonunda yalnız son yığından raporlamak: gürültülüdür; tur boyunca ortala.'],
      se: `<p>Eğitim döngüsü, yeniden kullanılabilir bir <b>altyapı kodudur</b>; her deneyde baştan yazma.</p>
<ul><li>train_one_epoch ve evaluate fonksiyonlarını ayır, metrikleri sözlük olarak döndür, en iyi modeli kaydet (checkpoint).</li><li>Hızlı bir "duman testi": tek bir küçük yığında modelin kaybı sıfıra yakın ezberleyebildiğini sına; ezberleyemiyorsa kodda hata vardır.</li></ul>`,
      quiz: [
        { q: 'Eğitim döngüsünde doğru adım sırası hangisidir?', options: ['step, backward, zero_grad, ileri', 'zero_grad, ileri + kayıp, backward, step', 'ileri, step, backward, zero_grad', 'backward, ileri, step, zero_grad'], answer: 1, why: 'Önce eski gradyanlar silinir, sonra kayıp hesaplanır, gradyanlar bulunur, en son parametreler güncellenir.' },
        { q: 'Test kümesinin doğrulama kümesinden farkı nedir?', options: ['Daha büyüktür', 'Model ve hiperparametre seçiminde hiç kullanılmaz; yalnız son raporda bir kez kullanılır', 'Eğitimde kullanılır', 'Fark yoktur'], answer: 1, why: 'Doğrulama seçim için kullanıldıkça ona uyum sağlanır; tarafsız tahmin için hiç dokunulmamış bir küme gerekir.' },
        { q: 'Eğitim kaybı düşerken doğrulama kaybı yükseliyorsa ne oluyor?', options: ['Yetersiz öğrenme', 'Aşırı öğrenme (ezberleme)', 'Öğrenme oranı sıfır', 'Veri sızıntısı yok'], answer: 1, why: 'Model eğitim verisine özgü ayrıntıları ezberliyor, yeni veriye genelleyemiyor.' },
        { q: 'model.eval() ne yapar?', options: ['Gradyanları kapatır', 'Dropout ve BatchNorm gibi katmanları çıkarım kipine alır', 'Modeli GPU\'ya taşır', 'Kaybı hesaplar'], answer: 1, why: 'eval() katmanların davranışını değiştirir; gradyanları kapatan torch.no_grad()\'dır. İkisi birlikte kullanılır.' },
      ],
    },
    en: {
      title: 'The training loop and validation',
      summary: 'The four-step loop, epochs and batches, model.train / model.eval, train–validation–test splits, metrics, reproducibility.',
      goals: ['Write the four-step training loop (zero_grad, forward, backward, step) without errors', 'Explain why data is split into training, validation and test sets', 'Read the progress of learning from loss and accuracy curves', 'Set up a reproducible experiment with seeds'],
      notes: `<p>In PyTorch you write the training loop yourself. Four steps per batch:</p>
<ol><li><code>optimizer.zero_grad()</code>: clear the previous gradients.</li><li><code>loss = loss_fn(model(xb), yb)</code>: forward pass and loss.</li><li><code>loss.backward()</code>: gradients.</li><li><code>optimizer.step()</code>: update the parameters.</li></ol>
<p>When all the data has been seen once an <b>epoch</b> ends. At the end of each epoch the model is measured on the <b>validation set</b>: with <code>model.eval()</code> and <code>torch.no_grad()</code>.</p>
<h3>Why three sets?</h3>
<p>Training loss does not tell you whether the model is memorising. The <b>validation</b> set is used to choose models and hyperparameters (learning rate, number of layers, when to stop); the more you choose, the more you "fit" to it too. That is why the final reported number must come from an untouched <b>test</b> set.</p>
<h3>Reading curves</h3>
<p>If both curves fall together, learning continues. If training falls but validation rises, that is <b>overfitting</b> (unit 8). If both stay high, the model or the learning rate is inadequate. For <b>reproducibility</b> fix <code>torch.manual_seed</code>, NumPy and Python seeds; the same seed must give the same curve (the network on this page is seeded too).</p>`,
      code: [trainPy('en')],
      lab: 'In the training visualiser train for 60 epochs with the default settings and watch the two loss curves. Set the learning rate to 0.001 and 0.1: how did the curves change? Reduce the hidden layer to 2 neurons: why can the decision boundary not separate the two moons? Change the seed and train twice with the same settings: how much does the final validation accuracy vary?',
      pitfalls: ['Forgetting model.eval(): dropout and batchnorm run in training mode during validation too, and results come out noisy and worse.', 'Choosing hyperparameters on the validation set and reporting the same number as "test accuracy": an optimistic result.', 'Computing normalisation statistics (mean, std) on all the data: test information leaks into training. Compute them on the training set only.', 'Reporting only the last batch\'s loss at the end of an epoch: it is noisy; average over the epoch.'],
      se: `<p>The training loop is reusable <b>infrastructure code</b>; do not rewrite it for every experiment.</p>
<ul><li>Separate train_one_epoch and evaluate functions, return metrics as a dictionary, save the best model (checkpoint).</li><li>A quick "smoke test": check that the model can memorise a single small batch down to near-zero loss; if it cannot, there is a bug in the code.</li></ul>`,
      quiz: [
        { q: 'Which is the correct order of steps in the training loop?', options: ['step, backward, zero_grad, forward', 'zero_grad, forward + loss, backward, step', 'forward, step, backward, zero_grad', 'backward, forward, step, zero_grad'], answer: 1, why: 'First old gradients are cleared, then the loss is computed, gradients are found and finally parameters are updated.' },
        { q: 'How does the test set differ from the validation set?', options: ['It is larger', 'It is never used for choosing models or hyperparameters; only once, for the final report', 'It is used in training', 'There is no difference'], answer: 1, why: 'The more the validation set is used for choices, the more you fit to it; an unbiased estimate needs an untouched set.' },
        { q: 'If training loss falls while validation loss rises, what is happening?', options: ['Underfitting', 'Overfitting (memorising)', 'The learning rate is zero', 'No data leakage'], answer: 1, why: 'The model memorises details specific to the training data and cannot generalise to new data.' },
        { q: 'What does model.eval() do?', options: ['Turns off gradients', 'Puts layers such as Dropout and BatchNorm into inference mode', 'Moves the model to the GPU', 'Computes the loss'], answer: 1, why: 'eval() changes layer behaviour; torch.no_grad() is what turns off gradients. They are used together.' },
      ],
    },
  },
]

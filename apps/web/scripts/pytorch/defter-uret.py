# PyTorch dersi: Colab defterlerini (nbformat v4) üretir → public/defterler/pytorch/<ad>.ipynb (TR) ve <ad>.en.ipynb (EN).
# Kod hücreleri iki dilde aynı, yalnız yorumlar ve açıklamalar çevrilir: C('tr', 'en') yorum, M(tr, en) markdown hücresi.
# Kullanım: python3 scripts/pytorch/defter-uret.py public/defterler/pytorch
import json, os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/defterler/pytorch'


def M(tr, en):
    return ('md', tr, en)


def K(src):
    """Kod hücresi; içinde «tr|en» biçiminde iki dilli yorum parçaları olabilir."""
    return ('code', src, None)


def pick(s, lang):
    out, i = [], 0
    while True:
        a = s.find('«', i)
        if a < 0:
            out.append(s[i:]); break
        b = s.find('»', a)
        tr, en = s[a + 1:b].split('|', 1)
        out.append(s[i:a]); out.append(tr if lang == 'tr' else en)
        i = b + 1
    return ''.join(out)


COLAB = M(
    '> **Colab\'da çalıştırma:** Bu dosyayı [colab.research.google.com](https://colab.research.google.com) adresinde **Dosya → Not defteri yükle** ile aç. GPU için **Çalışma zamanı → Çalışma zamanı türünü değiştir → T4 GPU** seç. Hücreleri yukarıdan aşağı sırayla çalıştır (Shift + Enter). PyTorch Colab\'da kuruludur; bilgisayarında çalıştırmak istersen `pip install torch torchvision`.',
    '> **Running in Colab:** Open this file at [colab.research.google.com](https://colab.research.google.com) with **File → Upload notebook**. For a GPU choose **Runtime → Change runtime type → T4 GPU**. Run the cells from top to bottom (Shift + Enter). PyTorch is preinstalled in Colab; to run on your own computer use `pip install torch torchvision`.')
SETUP = K('''import torch, random, numpy as np
torch.manual_seed(0); random.seed(0); np.random.seed(0)          # «tekrarlanabilirlik|reproducibility»
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print('PyTorch', torch.__version__, '| device:', device)''')

NB = {}

NB['01-tensorler'] = ('Tensörler: şekil, veri tipi, yayınlama ve cihaz', 'Tensors: shape, dtype, broadcasting and device', [
    M('## 1. Tensör oluşturma\nTensör, çok boyutlu bir sayı dizisidir. Şekli (`shape`), veri tipi (`dtype`) ve cihazı (`device`) vardır.',
      '## 1. Creating tensors\nA tensor is a multi-dimensional array of numbers. It has a shape (`shape`), a data type (`dtype`) and a device (`device`).'),
    K('''x = torch.arange(12, dtype=torch.float32).reshape(3, 4)
print(x)
print(x.shape, x.dtype, x.device)
z = torch.zeros(2, 3); o = torch.ones(2, 3); r = torch.randn(2, 3)   # «sıfırlar, birler, normal dağılım|zeros, ones, normal distribution»
print(torch.from_numpy(np.array([1, 2, 3])).dtype)                  # «NumPy'dan: int64|from NumPy: int64»'''),
    M('## 2. Dilimleme\n`x[satır, sütun]`; dilim bir **görünümdür** (kopya değildir).', '## 2. Slicing\n`x[row, col]`; a slice is a **view** (not a copy).'),
    K('''print(x[0], x[:, 1], x[1:, 2:])
v = x[0]; v[0] = 100                                                 # «görünüm: x de değişir|a view: x changes too»
print(x[0, 0])'''),
    M('## 3. Yayınlama\nBoyutlar **sağdan** hizalanır; her çift eşit olmalı ya da biri 1 olmalı.', '## 3. Broadcasting\nDimensions are aligned **from the right**; each pair must be equal or one of them must be 1.'),
    K('''a = torch.ones(8, 1, 6, 1); b = torch.ones(7, 1, 5)
print((a + b).shape)                                                 # torch.Size([8, 7, 6, 5])
pred, target = torch.randn(64), torch.randn(64, 1)
print((pred - target).shape, '«← sessiz hata!|← silent bug!»')         # torch.Size([64, 64])
print((pred - target.squeeze(1)).shape)                              # «doğrusu|the correct way»: torch.Size([64])'''),
    M('## 4. matmul, view ve reshape', '## 4. matmul, view and reshape'),
    K('''W = torch.randn(4, 2)
print((x @ W).shape)                                                 # (3,4) @ (4,2) → (3,2)
try:
    torch.randn(64, 784) @ torch.randn(128, 10)
except RuntimeError as e:
    print('RuntimeError:', e)
t = x.T
print(t.is_contiguous())
try:
    t.view(-1)
except RuntimeError as e:
    print('view:', str(e)[:80])
print(t.reshape(-1).shape, t.contiguous().view(-1).shape)'''),
    M('## 5. Cihaz\nModel ve veri aynı cihazda olmalı.', '## 5. Device\nThe model and the data must be on the same device.'),
    K('''x = x.to(device)
print(x.device)
print((x * 2).sum().item())                                          # «.item(): Python sayısı|.item(): a Python number»'''),
    M('## Alıştırmalar\n1. `(5, 1, 4) + (3, 1)` sonucunun şeklini önce kâğıtta bul, sonra dene.\n2. 4 görüntülük `(4, 3, 32, 32)` bir yığını `(4, 3072)`\'ye çevir.\n3. Her satırdan kendi ortalamasını çıkar (`keepdim=True` ile).',
      '## Exercises\n1. Work out the shape of `(5, 1, 4) + (3, 1)` on paper first, then try it.\n2. Turn a batch of 4 images `(4, 3, 32, 32)` into `(4, 3072)`.\n3. Subtract each row\'s own mean from it (with `keepdim=True`).'),
    K('''# «Alıştırma 3 için başlangıç|Starter for exercise 3»
m = torch.randn(5, 4)
centered = m - m.mean(dim=1, keepdim=True)
print(centered.mean(dim=1))                                          # «≈ 0|≈ 0»'''),
])

NB['02-autograd'] = ('Autograd: hesaplama grafiği ve geri yayılım', 'Autograd: the computational graph and backpropagation', [
    M('## 1. Tek nöron\n$z = w_1x_1 + w_2x_2 + b$, $y = \\tanh(z)$, $L = (y - t)^2$', '## 1. One neuron\n$z = w_1x_1 + w_2x_2 + b$, $y = \\tanh(z)$, $L = (y - t)^2$'),
    K('''x1, x2, t = torch.tensor(2.0), torch.tensor(0.5), torch.tensor(0.8)
w1 = torch.tensor(-0.5, requires_grad=True)
w2 = torch.tensor(1.2, requires_grad=True)
b = torch.tensor(0.3, requires_grad=True)
y = torch.tanh(w1 * x1 + w2 * x2 + b)
L = (y - t) ** 2
print('y =', y.item(), 'L =', L.item())
print(L.grad_fn, '->', L.grad_fn.next_functions)                     # «grafik düğümleri|graph nodes»'''),
    M('## 2. Geri yayılım ve elle kontrol', '## 2. Backpropagation and a manual check'),
    K('''L.backward()
manual = 2 * (y - t) * (1 - y ** 2) * x1                              # «zincir kuralı|chain rule»
print('autograd:', w1.grad.item(), '| «elle|manual»:', manual.item())'''),
    M('## 3. Sayısal türev\nMerkezî fark: $(L(\\theta+h) - L(\\theta-h)) / 2h$', '## 3. Numerical derivative\nCentral difference: $(L(\\theta+h) - L(\\theta-h)) / 2h$'),
    K('''def loss(w):
    return ((torch.tanh(w * x1 + w2 * x2 + b) - t) ** 2).item()
h = 1e-4
print('«sayısal|numeric»:', (loss(w1.item() + h) - loss(w1.item() - h)) / (2 * h))
print(torch.autograd.gradcheck(lambda w: torch.tanh(w * 2.0) ** 2, torch.tensor([0.3], dtype=torch.float64, requires_grad=True)))'''),
    M('## 4. Gradyanlar birikir', '## 4. Gradients accumulate'),
    K('''w = torch.tensor(1.0, requires_grad=True)
for i in range(3):
    (w * 3).backward()
    print(i, w.grad.item())                                          # «3, 6, 9: birikir|3, 6, 9: accumulates»
w.grad = None'''),
    M('## 5. Elle gradyan inişi', '## 5. Gradient descent by hand'),
    K('''for step in range(20):
    y = torch.tanh(w1 * x1 + w2 * x2 + b)
    L = (y - t) ** 2
    L.backward()
    with torch.no_grad():                                            # «güncelleme grafiğe girmesin|keep the update out of the graph»
        for p in (w1, w2, b):
            p -= 0.1 * p.grad
            p.grad = None
    if step % 5 == 0:
        print(step, round(L.item(), 5))'''),
    M('## Alıştırmalar\n1. $x_1 = 0$ yap: $w_1$\'in gradyanı neden sıfır?\n2. `detach()` ile $y$\'yi grafikten kopar ve `backward` dene: ne oldu?\n3. Kendi fonksiyonun için `gradcheck` yaz.',
      '## Exercises\n1. Set $x_1 = 0$: why is $w_1$\'s gradient zero?\n2. Cut $y$ off the graph with `detach()` and try `backward`: what happened?\n3. Write a `gradcheck` for your own function.'),
])

NB['03-nn-module'] = ('nn.Module: katmanlar, parametreler ve model yazmak', 'nn.Module: layers, parameters and writing models', [
    M('## 1. Bir model sınıfı', '## 1. A model class'),
    K('''from torch import nn

class Siniflandirici(nn.Module):
    def __init__(self, n_in=2, gizli=16, n_out=1):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(n_in, gizli), nn.ReLU(), nn.Linear(gizli, gizli), nn.ReLU(), nn.Linear(gizli, n_out))
    def forward(self, x):
        return self.net(x)

model = Siniflandirici()
print(model)
print(sum(p.numel() for p in model.parameters()), '«parametre|parameters»')
for name, p in model.named_parameters():
    print(f'{name:14s} {tuple(p.shape)}')'''),
    M('## 2. Katman katman şekil izleme', '## 2. Tracing shapes layer by layer'),
    K('''cnn = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                    nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
                    nn.Flatten(), nn.Linear(16 * 7 * 7, 10))
x = torch.randn(1, 1, 28, 28)
for layer in cnn:
    x = layer(x)
    n = sum(p.numel() for p in layer.parameters())
    print(f'{layer.__class__.__name__:10s} {str(tuple(x.shape)):18s} {n}')'''),
    M('## 3. Düz liste tuzağı', '## 3. The plain-list trap'),
    K('''class Yanlis(nn.Module):
    def __init__(self):
        super().__init__()
        self.katmanlar = [nn.Linear(4, 4) for _ in range(3)]          # «düz liste: görünmez|plain list: invisible»
class Dogru(nn.Module):
    def __init__(self):
        super().__init__()
        self.katmanlar = nn.ModuleList([nn.Linear(4, 4) for _ in range(3)])
print(len(list(Yanlis().parameters())), len(list(Dogru().parameters())))   # 0 6'''),
    M('## 4. Kaydet ve yükle', '## 4. Save and load'),
    K('''torch.save(model.state_dict(), 'model.pt')
yeni = Siniflandirici()
yeni.load_state_dict(torch.load('model.pt'))
x = torch.randn(3, 2)
print(torch.allclose(model(x), yeni(x)))'''),
    M('## Alıştırmalar\n1. `nn.Conv2d(3, 16, 3)`\'ün parametre sayısını önce elle hesapla.\n2. Yukarıdaki CNN\'de ikinci `MaxPool2d`\'yi kaldır: `Linear`\'ın girişi ne olmalı?\n3. `nn.LazyLinear` ile giriş boyunu otomatik bulduran bir model yaz.',
      '## Exercises\n1. Compute the parameter count of `nn.Conv2d(3, 16, 3)` by hand first.\n2. Remove the second `MaxPool2d` from the CNN above: what must the `Linear` input be?\n3. Write a model that finds its input size automatically with `nn.LazyLinear`.'),
])

NB['04-kayip-optimizasyon'] = ('Kayıp fonksiyonları ve optimize ediciler', 'Loss functions and optimisers', [
    M('## 1. Kayıp fonksiyonları', '## 1. Loss functions'),
    K('''from torch import nn
logits = torch.tensor([[2.0, 0.5, -1.0]]); target = torch.tensor([0])
ce = nn.CrossEntropyLoss()(logits, target)
manual = -torch.log_softmax(logits, dim=1)[0, 0]
print('CE', ce.item(), '| «elle|manual»', manual.item())
print('«çift softmax (yanlış)|double softmax (wrong)»:', nn.CrossEntropyLoss()(torch.softmax(logits, 1), target).item())
print('BCEWithLogits', nn.BCEWithLogitsLoss()(torch.tensor([1.2]), torch.tensor([1.0])).item())'''),
    M('## 2. Dar bir vadide optimize ediciler\n$f(x, y) = 0{,}04x^2 + y^2$', '## 2. Optimisers in a narrow valley\n$f(x, y) = 0.04x^2 + y^2$'),
    K('''import matplotlib.pyplot as plt
def run(make, steps=100):
    xy = torch.tensor([-8.0, 1.6], requires_grad=True); opt = make([xy]); path = [xy.detach().clone()]
    for _ in range(steps):
        opt.zero_grad(); f = 0.04 * xy[0] ** 2 + xy[1] ** 2; f.backward(); opt.step(); path.append(xy.detach().clone())
    return torch.stack(path)
opts = {'SGD': lambda p: torch.optim.SGD(p, lr=0.05), 'Momentum': lambda p: torch.optim.SGD(p, lr=0.05, momentum=0.9),
        'RMSprop': lambda p: torch.optim.RMSprop(p, lr=0.3), 'Adam': lambda p: torch.optim.Adam(p, lr=0.3)}
X, Y = np.meshgrid(np.linspace(-10, 10, 200), np.linspace(-3, 3, 100))
plt.contour(X, Y, 0.04 * X ** 2 + Y ** 2, levels=20, cmap='gray')
for name, make in opts.items():
    p = run(make); plt.plot(p[:, 0], p[:, 1], label=name)
plt.legend(); plt.title('«Optimize edici yarışı|Optimiser race»'); plt.show()'''),
    M('## 3. Öğrenme oranı taraması', '## 3. Learning-rate sweep'),
    K('''for lr in [0.001, 0.01, 0.1, 0.5, 1.0, 1.1]:
    p = run(lambda q: torch.optim.SGD(q, lr=lr))
    f = (0.04 * p[-1, 0] ** 2 + p[-1, 1] ** 2).item()
    print(f'lr={lr:<6} f={f:.3e}')                                   # «1,0 üstünde ıraksar|diverges above 1.0»'''),
    M('## 4. Zamanlayıcı', '## 4. Scheduler'),
    K('''w = torch.zeros(1, requires_grad=True)
opt = torch.optim.SGD([w], lr=0.1)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=20)
lrs = []
for _ in range(20):
    opt.step(); sched.step(); lrs.append(opt.param_groups[0]['lr'])
plt.plot(lrs); plt.title('CosineAnnealingLR'); plt.show()'''),
    M('## Alıştırmalar\n1. Rosenbrock fonksiyonunda (`(1-x)^2 + 10(y-x^2)^2`) aynı yarışı yap.\n2. Momentumu 0,5 ve 0,99 yap; yörüngeyi karşılaştır.\n3. `OneCycleLR` ile öğrenme oranı eğrisini çiz.',
      '## Exercises\n1. Run the same race on the Rosenbrock function (`(1-x)^2 + 10(y-x^2)^2`).\n2. Set momentum to 0.5 and 0.99; compare the trajectories.\n3. Plot the learning-rate curve of `OneCycleLR`.'),
])

TRAIN_COMMON = '''from torch import nn
from sklearn.datasets import make_moons
def moons(n, seed):                                                  # «eğitim ve doğrulama ayrı üretilir|train and validation generated separately»
    X, y = make_moons(n, noise=0.2, random_state=seed)
    return torch.tensor(X, dtype=torch.float32).to(device), torch.tensor(y, dtype=torch.float32).unsqueeze(1).to(device)
Xtr, ytr = moons(300, 0)
Xva, yva = moons(100, 1)'''

NB['05-egitim-dongusu'] = ('Eğitim döngüsü ve doğrulama', 'The training loop and validation', [
    M('## 1. Veri ve ayrım', '## 1. Data and split'), K(TRAIN_COMMON + "\nprint(Xtr.shape, Xva.shape)"),
    M('## 2. Dört adımlı döngü', '## 2. The four-step loop'),
    K('''def make_model(h=16):
    return nn.Sequential(nn.Linear(2, h), nn.ReLU(), nn.Linear(h, h), nn.ReLU(), nn.Linear(h, 1)).to(device)

def train(model, epochs=100, lr=0.01, bs=32):
    opt = torch.optim.Adam(model.parameters(), lr=lr); loss_fn = nn.BCEWithLogitsLoss(); hist = []
    for epoch in range(epochs):
        model.train(); perm = torch.randperm(len(Xtr)); tot = 0.0
        for i in range(0, len(Xtr), bs):
            idx = perm[i:i + bs]
            opt.zero_grad()                                          # «1) sıfırla|1) zero»
            loss = loss_fn(model(Xtr[idx]), ytr[idx])                # «2) ileri + kayıp|2) forward + loss»
            loss.backward()                                          # «3) geri|3) backward»
            opt.step()                                               # «4) güncelle|4) update»
            tot += loss.item() * len(idx)
        model.eval()
        with torch.no_grad():
            va = loss_fn(model(Xva), yva).item(); acc = ((model(Xva) > 0).float() == yva).float().mean().item()
        hist.append((tot / len(Xtr), va, acc))
    return hist

hist = train(make_model())
print('«son|final»: train %.3f val %.3f acc %.3f' % hist[-1])'''),
    M('## 3. Eğriler ve karar sınırı', '## 3. Curves and decision boundary'),
    K('''import matplotlib.pyplot as plt
h = np.array(hist)
plt.plot(h[:, 0], label='train'); plt.plot(h[:, 1], label='val'); plt.legend(); plt.xlabel('epoch'); plt.show()'''),
    M('## 4. Duman testi: tek yığını ezberle', '## 4. Smoke test: memorise a single batch'),
    K('''m = make_model(64); opt = torch.optim.Adam(m.parameters(), lr=0.01)
xb, yb = Xtr[:32], ytr[:32]
for _ in range(300):
    opt.zero_grad(); l = nn.BCEWithLogitsLoss()(m(xb), yb); l.backward(); opt.step()
print('«tek yığın kaybı|single-batch loss»:', l.item())                     # «≈ 0 olmalı|should be ≈ 0»'''),
    M('## Alıştırmalar\n1. Öğrenme oranını 0,001 ve 0,1 yap; eğrileri karşılaştır.\n2. Aynı tohumla iki kez çalıştır: sonuç aynı mı?\n3. En iyi doğrulama kaybındaki modeli kaydeden bir checkpoint ekle.',
      '## Exercises\n1. Set the learning rate to 0.001 and 0.1; compare the curves.\n2. Run twice with the same seed: is the result the same?\n3. Add a checkpoint that saves the model with the best validation loss.'),
])

NB['06-dataloader'] = ('Dataset ve DataLoader', 'Dataset and DataLoader', [
    M('## 1. Kendi Dataset sınıfın', '## 1. Your own Dataset class'),
    K('''from torch.utils.data import Dataset, DataLoader, random_split
class SensorVerisi(Dataset):
    def __init__(self, n=1000):
        g = torch.Generator().manual_seed(0)
        self.X = torch.randn(n, 3, generator=g); self.y = (self.X.sum(1) > 0).long()
    def __len__(self):
        return len(self.X)
    def __getitem__(self, i):
        return self.X[i], self.y[i]
ds = SensorVerisi()
print(len(ds), ds[0])'''),
    M('## 2. Ayrım ve yığınlar', '## 2. Split and batches'),
    K('''tr, va = random_split(ds, [800, 200], generator=torch.Generator().manual_seed(42))
for bs, drop in [(64, False), (64, True), (100, False)]:
    dl = DataLoader(tr, batch_size=bs, shuffle=True, drop_last=drop)
    sizes = [len(xb) for xb, _ in dl]
    print(f'bs={bs} drop_last={drop}: len={len(dl)} last={sizes[-1]}')                # «son yığın boyu|last batch size»'''),
    M('## 3. Karıştırma tekrarlanabilir mi?', '## 3. Is shuffling reproducible?'),
    K('''def first_batch(seed):
    dl = DataLoader(range(20), batch_size=5, shuffle=True, generator=torch.Generator().manual_seed(seed))
    return next(iter(dl)).tolist()
print(first_batch(1), first_batch(1), first_batch(2))'''),
    M('## 4. Bir eğitim döngüsünde kullanmak', '## 4. Using it in a training loop'),
    K('''from torch import nn
model = nn.Sequential(nn.Linear(3, 16), nn.ReLU(), nn.Linear(16, 2)).to(device)
opt = torch.optim.Adam(model.parameters(), lr=0.01)
tr_dl = DataLoader(tr, batch_size=64, shuffle=True); va_dl = DataLoader(va, batch_size=256)
for epoch in range(5):
    model.train()
    for xb, yb in tr_dl:
        xb, yb = xb.to(device), yb.to(device)
        opt.zero_grad(); nn.functional.cross_entropy(model(xb), yb).backward(); opt.step()
    model.eval(); ok = 0
    with torch.no_grad():
        for xb, yb in va_dl:
            ok += (model(xb.to(device)).argmax(1).cpu() == yb).sum().item()
    print(epoch, ok / len(va))'''),
    M('## Alıştırmalar\n1. Bir CSV dosyasını okuyan bir Dataset yaz.\n2. `num_workers=2` dene ve süreyi ölç.\n3. Sınıfa göre sıralı veride `shuffle=False` ile eğit; sonucu karşılaştır.',
      '## Exercises\n1. Write a Dataset that reads a CSV file.\n2. Try `num_workers=2` and measure the time.\n3. Train on class-sorted data with `shuffle=False`; compare the result.'),
])

CNN_CLASS = '''from torch import nn
class KucukCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, 3, padding=1)
        self.conv2 = nn.Conv2d(8, 16, 3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.fc = nn.Linear(16 * 7 * 7, 10)
    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))                     # (N, 8, 14, 14)
        x = self.pool(torch.relu(self.conv2(x)))                     # (N, 16, 7, 7)
        return self.fc(x.flatten(1))                                 # (N, 10)'''
MNIST_LOAD = '''from torch.utils.data import DataLoader
from torchvision import datasets, transforms
tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
tr = datasets.MNIST('veri', train=True, download=True, transform=tf)
te = datasets.MNIST('veri', train=False, download=True, transform=tf)
tr_dl = DataLoader(tr, batch_size=64, shuffle=True); te_dl = DataLoader(te, batch_size=1000)
print(len(tr), len(te))'''
TRAIN_CNN = '''def evaluate(model):
    model.eval(); ok = 0
    with torch.no_grad():
        for xb, yb in te_dl:
            ok += (model(xb.to(device)).argmax(1).cpu() == yb).sum().item()
    return ok / len(te)

model = KucukCNN().to(device)
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
for epoch in range(4):
    model.train()
    for xb, yb in tr_dl:
        xb, yb = xb.to(device), yb.to(device)
        opt.zero_grad(); nn.functional.cross_entropy(model(xb), yb).backward(); opt.step()
    print(f'epoch {epoch + 1}: test acc {evaluate(model):.4f}')'''

NB['07-cnn'] = ('Evrişimli sinir ağları (CNN)', 'Convolutional neural networks (CNNs)', [
    M('## 1. Evrişim aritmetiği', '## 1. Convolution arithmetic'),
    K('''from torch import nn
x = torch.randn(1, 1, 28, 28)
for k, s, p in [(3, 1, 1), (3, 2, 1), (5, 1, 0), (7, 2, 3)]:
    out = nn.Conv2d(1, 4, k, stride=s, padding=p)(x)
    formul = (28 + 2 * p - (k - 1) - 1) // s + 1
    print(f'k={k} s={s} p={p}: {tuple(out.shape)} formula={formul}')            # «formülle aynı|same as the formula»'''),
    M('## 2. Model ve MNIST', '## 2. Model and MNIST'), K(CNN_CLASS + "\nprint(sum(p.numel() for p in KucukCNN().parameters()))"), K(MNIST_LOAD), K(TRAIN_CNN),
    M('## 3. Öznitelik haritaları', '## 3. Feature maps'),
    K('''import matplotlib.pyplot as plt
maps = {}
model.conv1.register_forward_hook(lambda m, i, o: maps.__setitem__('c1', o.detach().cpu()))
img, label = te[0]
model(img.unsqueeze(0).to(device))
fig, ax = plt.subplots(2, 8, figsize=(12, 3))
for i in range(8):
    ax[0, i].imshow(model.conv1.weight[i, 0].detach().cpu(), cmap='bwr'); ax[0, i].axis('off')
    ax[1, i].imshow(maps['c1'][0, i], cmap='magma'); ax[1, i].axis('off')
plt.suptitle(f'«çekirdekler ve haritalar, etiket|kernels and maps, label»: {label}'); plt.show()'''),
    M('## Alıştırmalar\n1. Kanal sayılarını iki katına çıkar; parametre ve doğruluk nasıl değişti?\n2. `nn.BatchNorm2d` ekle.\n3. Yanlış sınıflanan 10 görüntüyü göster.',
      '## Exercises\n1. Double the channel counts; how did parameters and accuracy change?\n2. Add `nn.BatchNorm2d`.\n3. Show 10 misclassified images.'),
])

NB['08-duzenlilestirme'] = ('Aşırı öğrenme ve düzenlileştirme', 'Overfitting and regularisation', [
    M('## 1. Az ve gürültülü veri', '## 1. Little, noisy data'),
    K('''from torch import nn
from sklearn.datasets import make_moons
Xa, ya = make_moons(40, noise=0.3, random_state=1); Xb, yb = make_moons(300, noise=0.3, random_state=2)
Xtr, ytr = torch.tensor(Xa, dtype=torch.float32), torch.tensor(ya, dtype=torch.float32).unsqueeze(1)
Xva, yva = torch.tensor(Xb, dtype=torch.float32), torch.tensor(yb, dtype=torch.float32).unsqueeze(1)'''),
    M('## 2. Deney fonksiyonu', '## 2. Experiment function'),
    K('''import copy
def deney(p=0.0, wd=0.0, sabir=None, epochs=300, seed=0):
    torch.manual_seed(seed)
    m = nn.Sequential(nn.Linear(2, 64), nn.ReLU(), nn.Dropout(p), nn.Linear(64, 64), nn.ReLU(), nn.Dropout(p), nn.Linear(64, 1))
    opt = torch.optim.AdamW(m.parameters(), lr=0.01, weight_decay=wd); f = nn.BCEWithLogitsLoss()
    best, state, bekle, hist = 1e9, None, 0, []
    for ep in range(epochs):
        m.train(); opt.zero_grad(); f(m(Xtr), ytr).backward(); opt.step()
        m.eval()
        with torch.no_grad():
            tl, vl = f(m(Xtr), ytr).item(), f(m(Xva), yva).item()
        hist.append((tl, vl))
        if vl < best - 1e-4:
            best, state, bekle = vl, copy.deepcopy(m.state_dict()), 0
        else:
            bekle += 1
            if sabir and bekle >= sabir:
                break
    return np.array(hist), best'''),
    M('## 3. Ablasyon tablosu', '## 3. Ablation table'),
    K('''import matplotlib.pyplot as plt
for name, kw in [('«temel|baseline»', {}), ('dropout 0.3', {'p': 0.3}), ('weight_decay 0.01', {'wd': 0.01}), ('«erken durdurma|early stopping»', {'sabir': 30})]:
    h, best = deney(**kw)
    print(f'{name:22s} val={h[-1, 1]:.3f} best={best:.3f} gap={h[-1, 1] - h[-1, 0]:.3f}')
    plt.plot(h[:, 1], label=name)
plt.legend(); plt.ylabel('val loss'); plt.show()'''),
    M('## Alıştırmalar\n1. Eğitim örneğini 200\'e çıkar; açık ne oldu?\n2. Üç farklı tohumla tekrarla ve ortalama al.\n3. Görüntü verisinde `transforms.RandomRotation` ile veri artırma dene.',
      '## Exercises\n1. Raise the training samples to 200; what happened to the gap?\n2. Repeat with three different seeds and average.\n3. Try data augmentation on image data with `transforms.RandomRotation`.'),
])

NB['09-rnn-lstm-dikkat'] = ('Diziler: RNN, LSTM ve dikkat', 'Sequences: RNN, LSTM and attention', [
    M('## 1. Görev: dizinin başındaki işareti hatırla\nDizinin ilk adımındaki değerin işareti etiketi belirler; arası gürültü. Uzun dizilerde RNN zorlanır.',
      '## 1. Task: remember the sign at the start of the sequence\nThe sign of the first step decides the label; the rest is noise. On long sequences an RNN struggles.'),
    K('''from torch import nn
def veri(n, T):
    x = torch.randn(n, T, 1) * 0.5
    y = (x[:, 0, 0] > 0).long()
    x[:, 0, 0] = torch.where(y == 1, 1.0, -1.0)
    return x, y
class Model(nn.Module):
    def __init__(self, kind='lstm', h=32):
        super().__init__()
        self.rnn = (nn.LSTM if kind == 'lstm' else nn.RNN)(1, h, batch_first=True); self.fc = nn.Linear(h, 2)
    def forward(self, x):
        out, _ = self.rnn(x)
        return self.fc(out[:, -1])'''),
    M('## 2. RNN ve LSTM karşılaştırması', '## 2. RNN vs LSTM'),
    K('''def egit(kind, T, steps=300):
    torch.manual_seed(0); m = Model(kind).to(device); opt = torch.optim.Adam(m.parameters(), lr=3e-3)
    for _ in range(steps):
        x, y = veri(64, T); x, y = x.to(device), y.to(device)
        opt.zero_grad(); l = nn.functional.cross_entropy(m(x), y); l.backward()
        nn.utils.clip_grad_norm_(m.parameters(), 1.0); opt.step()
    x, y = veri(500, T)
    with torch.no_grad():
        return (m(x.to(device)).argmax(1).cpu() == y).float().mean().item()
for T in [10, 50, 100]:
    print(f'T={T:3d}  RNN {egit("rnn", T):.2f}  LSTM {egit("lstm", T):.2f}')'''),
    M('## 3. Ölçekli nokta çarpımı dikkati', '## 3. Scaled dot-product attention'),
    K('''import torch.nn.functional as F
Q = K_ = V = torch.randn(1, 5, 16)
w = torch.softmax(Q @ K_.transpose(-2, -1) / 16 ** 0.5, dim=-1)
print(w.sum(-1))
print(torch.allclose(w @ V, F.scaled_dot_product_attention(Q, K_, V), atol=1e-6))
mha = nn.MultiheadAttention(16, num_heads=4, batch_first=True)
out, att = mha(Q, K_, V)
print(out.shape, att.shape)'''),
    M('## Alıştırmalar\n1. `nn.GRU` ile aynı karşılaştırmayı yap.\n2. Gradyan kırpmayı kaldır; RNN\'de ne oldu?\n3. Dikkat ağırlıklarını ısı haritası olarak çiz.',
      '## Exercises\n1. Run the same comparison with `nn.GRU`.\n2. Remove gradient clipping; what happened to the RNN?\n3. Plot the attention weights as a heatmap.'),
])

NB['10-aktarim-dagitim'] = ('Aktarım öğrenmesi ve dağıtım', 'Transfer learning and deployment', [
    M('## 1. Önceden eğitilmiş ResNet-18', '## 1. Pretrained ResNet-18'),
    K('''from torch import nn
from torchvision import models
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
print(sum(p.numel() for p in model.parameters()))                   # 11 689 512
for name, mod in [('stem', nn.Sequential(model.conv1, model.bn1)), ('layer1', model.layer1), ('layer2', model.layer2), ('layer3', model.layer3), ('layer4', model.layer4)]:
    print(name, sum(p.numel() for p in mod.parameters()))'''),
    M('## 2. Dondur ve yeni baş ekle', '## 2. Freeze and add a new head'),
    K('''for p in model.parameters():
    p.requires_grad = False
model.fc = nn.Linear(512, 5)
print('«eğitilen|trainable»:', sum(p.numel() for p in model.parameters() if p.requires_grad))
for p in model.layer4.parameters():
    p.requires_grad = True                                           # «ince ayar: son blok|fine-tuning: last block»
print('«layer4 çözüldü|layer4 unfrozen»:', sum(p.numel() for p in model.parameters() if p.requires_grad))'''),
    M('## 3. Dışa aktarma: TorchScript ve ONNX', '## 3. Export: TorchScript and ONNX'),
    K('''model.eval()
ornek = torch.randn(1, 3, 224, 224)
ts = torch.jit.trace(model, ornek); ts.save('model_ts.pt')
torch.onnx.export(model, ornek, 'model.onnx', input_names=['goruntu'], output_names=['skor'], dynamic_axes={'goruntu': {0: 'N'}})
import os
print(os.path.getsize('model_ts.pt') // 1024, 'KB', os.path.getsize('model.onnx') // 1024, 'KB')'''),
    M('## 4. Dinamik int8 nicemleme', '## 4. Dynamic int8 quantisation'),
    K('''import time
q = torch.ao.quantization.quantize_dynamic(model, {nn.Linear}, dtype=torch.qint8)
x = torch.randn(8, 3, 224, 224)
for name, m in [('fp32', model), ('int8 (Linear)', q)]:
    t = time.perf_counter()
    with torch.no_grad():
        y = m(x)
    print(name, f'{(time.perf_counter() - t) * 1000:.0f} ms', y.shape)
torch.save(q.state_dict(), 'q.pt'); torch.save(model.state_dict(), 'f.pt')
print(os.path.getsize('f.pt') // 1024, 'KB ->', os.path.getsize('q.pt') // 1024, 'KB')'''),
    M('## Alıştırmalar\n1. Kendi 5 sınıflı küçük görüntü kümenle (her sınıftan 50 görüntü) yalnız başı eğit.\n2. `onnxruntime` ile ONNX modelini çalıştır ve çıktıyı PyTorch ile karşılaştır.\n3. Statik nicemleme (kalibrasyonlu) dene.',
      '## Exercises\n1. Train only the head on your own small 5-class image set (50 images per class).\n2. Run the ONNX model with `onnxruntime` and compare the output with PyTorch.\n3. Try static (calibrated) quantisation.'),
])

NB['bitirme-rakam-cnn'] = ('Bitirme projesi: el yazısı rakam tanıyan CNN', 'Capstone project: a CNN that reads handwritten digits', [
    M('## Plan\n1. Veri ve doğrulama ayrımı  2. Model  3. Eğitim + checkpoint  4. Değerlendirme (karışıklık matrisi)  5. Dışa aktarma (JSON + ONNX)  6. Tarayıcıda dene',
      '## Plan\n1. Data and validation split  2. Model  3. Training + checkpoint  4. Evaluation (confusion matrix)  5. Export (JSON + ONNX)  6. Try it in the browser'),
    K(MNIST_LOAD), K(CNN_CLASS),
    M('## Birim testleri', '## Unit tests'),
    K('''m = KucukCNN()
assert m(torch.randn(4, 1, 28, 28)).shape == (4, 10)
assert sum(p.numel() for p in m.parameters()) == 9098
print('«testler geçti|tests passed»')'''),
    K(TRAIN_CNN),
    M('## Karışıklık matrisi ve en çok karıştırılan çiftler', '## Confusion matrix and the most confused pairs'),
    K('''import matplotlib.pyplot as plt
cm = torch.zeros(10, 10, dtype=torch.long); wrong = []
model.eval()
with torch.no_grad():
    for xb, yb in te_dl:
        p = model(xb.to(device)).argmax(1).cpu()
        for t, q in zip(yb, p):
            cm[t, q] += 1
plt.imshow(cm, cmap='Blues'); plt.colorbar(); plt.xlabel('«tahmin|predicted»'); plt.ylabel('«gerçek|true»'); plt.show()
off = cm.clone(); off.fill_diagonal_(0)
top = torch.topk(off.flatten(), 3)
for v, i in zip(top.values, top.indices):
    print(f'{i.item() // 10} -> {i.item() % 10}: {v.item()}')'''),
    M('## Dışa aktarma\n`agirliklar.json` dosyasını indir ve bitirme sayfasındaki tanıyıcıya **Kendi ağırlıklarını yükle** ile ver.',
      '## Export\nDownload `agirliklar.json` and give it to the recogniser on the capstone page with **Load your own weights**.'),
    K('''import json
r = lambda t: [round(v, 6) for v in t.detach().cpu().flatten().tolist()]
sd = model.state_dict()
json.dump({'mean': 0.1307, 'std': 0.3081, 'testAcc': round(evaluate(model), 4),
           'conv1': {'w': r(sd['conv1.weight']), 'b': r(sd['conv1.bias'])},
           'conv2': {'w': r(sd['conv2.weight']), 'b': r(sd['conv2.bias'])},
           'fc': {'w': r(sd['fc.weight']), 'b': r(sd['fc.bias'])}}, open('agirliklar.json', 'w'))
torch.onnx.export(model.cpu().eval(), torch.randn(1, 1, 28, 28), 'rakam.onnx', input_names=['x'], output_names=['logit'])
try:
    from google.colab import files
    files.download('agirliklar.json')
except ImportError:
    print('«Colab dışında: dosya bu klasörde|Outside Colab: the file is in this folder»')'''),
    M('## Teslim kontrol listesi\n- [ ] G1: test doğruluğu ≥ %98\n- [ ] G2: < 50 000 parametre\n- [ ] G3: karışıklık matrisi + 3 çift\n- [ ] G4: aynı tohumla tekrar\n- [ ] G5: tarayıcıda aynı tahminler\n- [ ] G6: kendi 30 çizimin',
      '## Submission checklist\n- [ ] R1: test accuracy ≥ 98%\n- [ ] R2: < 50,000 parameters\n- [ ] R3: confusion matrix + 3 pairs\n- [ ] R4: repeat with the same seed\n- [ ] R5: same predictions in the browser\n- [ ] R6: your own 30 drawings'),
])


def build(name, lang):
    title_tr, title_en, cells = NB[name]
    title = title_tr if lang == 'tr' else title_en
    head = ('# PyTorch ile Derin Öğrenme · ' if lang == 'tr' else '# Deep Learning with PyTorch · ') + title
    head += '\n\nMacademia' + (' · Büyükler için' if lang == 'tr' else ' · For adults')
    nb_cells = []
    def md(s):
        nb_cells.append({'cell_type': 'markdown', 'metadata': {}, 'source': s.splitlines(True)})
    def code(s):
        nb_cells.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': s.splitlines(True)})
    md(head)
    md(COLAB[1] if lang == 'tr' else COLAB[2])
    code(pick(SETUP[1], lang))
    for c in cells:
        if c[0] == 'md':
            md(c[1] if lang == 'tr' else c[2])
        else:
            code(pick(c[1], lang))
    return {'nbformat': 4, 'nbformat_minor': 5, 'metadata': {
        'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
        'language_info': {'name': 'python'}, 'accelerator': 'GPU', 'colab': {'provenance': []}}, 'cells': [dict(c, id=f'c{i:02d}') for i, c in enumerate(nb_cells)]}


os.makedirs(OUT, exist_ok=True)
for name in NB:
    for lang in ('tr', 'en'):
        path = os.path.join(OUT, f'{name}{".en" if lang == "en" else ""}.ipynb')
        json.dump(build(name, lang), open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(NB) * 2, 'defter yazıldı', OUT)

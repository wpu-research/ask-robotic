// PyTorch dersinin kod örnekleri (PyTorch 2.x). Kod aynı, yalnız yorumlar dile göre: c(tr, en). Bu kodlar tarayıcıda
// çalışmaz; ünitenin Colab defterinde (public/defterler/pytorch) aynıları ve fazlası hücre hücre var.
import type { KursCode, Lang } from '@/lib/kurs/types'

type Src = (c: (tr: string, en: string) => string) => string
const block = (lang: Lang, tr: string, en: string, src: Src): KursCode => ({ title: lang === 'en' ? en : tr, src: src((a, z) => (lang === 'en' ? z : a)) })

export const tensorPy = (l: Lang) => block(l, 'Python: tensör oluşturma, şekil, yayınlama ve cihaz', 'Python: creating tensors, shapes, broadcasting and devices', (c) => `import torch

x = torch.arange(12, dtype=torch.float32).reshape(3, 4)   # ${c('3 satır, 4 sütun', '3 rows, 4 columns')}
print(x.shape, x.dtype, x.device)                        # torch.Size([3, 4]) torch.float32 cpu
b = torch.tensor([10., 20., 30., 40.])                  # ${c('şekil (4,)', 'shape (4,)')}
print((x + b).shape)                                     # ${c('yayınlama: (3,4) + (4,) → (3,4)', 'broadcasting: (3,4) + (4,) → (3,4)')}
col = x.mean(dim=1, keepdim=True)                        # ${c('(3,1): satır ortalamaları', '(3,1): row means')}
print((x - col).shape)                                   # ${c('(3,4) − (3,1) → (3,4)', '(3,4) − (3,1) → (3,4)')}

W = torch.randn(4, 2)
print((x @ W).shape)                                     # ${c('matmul: (3,4)@(4,2) → (3,2)', 'matmul: (3,4)@(4,2) → (3,2)')}
t = x.T                                                  # ${c('devrik: bitişik değil', 'transpose: not contiguous')}
print(t.is_contiguous(), t.reshape(-1).shape)            # ${c('view hata verir, reshape kopyalar', 'view would fail, reshape copies')}

device = 'cuda' if torch.cuda.is_available() else 'cpu'
x = x.to(device)                                         # ${c('model ve veri aynı cihazda olmalı', 'model and data must be on the same device')}
print(x.device)`)

export const autogradPy = (l: Lang) => block(l, 'Python: tek nöronda autograd ve sayısal kontrol', 'Python: autograd on one neuron and a numerical check', (c) => `import torch

x1, x2, t = torch.tensor(2.0), torch.tensor(0.5), torch.tensor(0.8)
w1 = torch.tensor(-0.5, requires_grad=True)              # ${c('yaprak, gradyanı tutulur', 'leaf, its gradient is kept')}
w2 = torch.tensor(1.2, requires_grad=True)
b = torch.tensor(0.3, requires_grad=True)

y = torch.tanh(w1 * x1 + w2 * x2 + b)                     # ${c('ileri geçiş grafiği kurar', 'the forward pass builds the graph')}
L = (y - t) ** 2
print(y.grad_fn, L.grad_fn)                              # TanhBackward0, PowBackward0
L.backward()                                             # ${c('zincir kuralı, tersten', 'chain rule, backwards')}
print(w1.grad, w2.grad, b.grad)

# ${c('sayısal kontrol: merkezî fark', 'numerical check: central difference')}
def loss(w):
    return ((torch.tanh(w * x1 + w2 * x2 + b) - t) ** 2).item()
h = 1e-4
print('${c('sayısal', 'numeric')}:', (loss(w1.item() + h) - loss(w1.item() - h)) / (2 * h))

with torch.no_grad():                                    # ${c('güncelleme grafiğe girmesin', 'keep the update out of the graph')}
    for p in (w1, w2, b):
        p -= 0.1 * p.grad
        p.grad = None                                    # ${c('gradyanlar birikir: sıfırla', 'gradients accumulate: reset')}`)

export const modulePy = (l: Lang) => block(l, 'Python: nn.Module ile model ve parametre sayımı', 'Python: a model with nn.Module and counting parameters', (c) => `import torch
from torch import nn

class Siniflandirici(nn.Module):
    def __init__(self, n_in=2, gizli=16, n_out=1):
        super().__init__()                               # ${c('unutma: parametre kaydı burada başlar', 'do not forget: parameter registration starts here')}
        self.net = nn.Sequential(
            nn.Linear(n_in, gizli), nn.ReLU(),
            nn.Linear(gizli, gizli), nn.ReLU(),
            nn.Linear(gizli, n_out),                     # ${c('ham skor (logit), sigmoid yok', 'raw score (logit), no sigmoid')}
        )

    def forward(self, x):
        return self.net(x)

model = Siniflandirici()
print(model)
print(sum(p.numel() for p in model.parameters()), '${c('parametre', 'parameters')}')   # 2·16+16 + 16·16+16 + 16+1 = 337
for name, p in model.named_parameters():
    print(f'{name:14s} {tuple(p.shape)}')
x = torch.randn(5, 2)                                    # ${c('5 örneklik yığın', 'a batch of 5 samples')}
print(model(x).shape)                                    # torch.Size([5, 1])`)

export const lossPy = (l: Lang) => block(l, 'Python: kayıp fonksiyonları ve optimize ediciler', 'Python: loss functions and optimisers', (c) => `import torch
from torch import nn

logits = torch.tensor([[2.0, 0.5, -1.0]])                # ${c('3 sınıf için ham skorlar', 'raw scores for 3 classes')}
target = torch.tensor([0])                               # ${c('doğru sınıf indeksi', 'index of the correct class')}
print(nn.CrossEntropyLoss()(logits, target))             # ${c('içinde log_softmax var: softmax uygulama', 'contains log_softmax: do not apply softmax')}
print(nn.BCEWithLogitsLoss()(torch.tensor([1.2]), torch.tensor([1.0])))
print(nn.MSELoss()(torch.tensor([2.5]), torch.tensor([3.0])))

# ${c('dar bir vadide üç optimize edici: f(x, y) = 0,04x² + y²', 'three optimisers in a narrow valley: f(x, y) = 0.04x² + y²')}
for name, make in [('SGD', lambda p: torch.optim.SGD(p, lr=0.05)),
                   ('Momentum', lambda p: torch.optim.SGD(p, lr=0.05, momentum=0.9)),
                   ('Adam', lambda p: torch.optim.Adam(p, lr=0.5))]:
    xy = torch.tensor([-8.0, 1.6], requires_grad=True)
    opt = make([xy])
    for _ in range(100):
        opt.zero_grad()
        f = 0.04 * xy[0] ** 2 + xy[1] ** 2
        f.backward()
        opt.step()
    print(f'{name:9s} f = {f.item():.5f}  xy = {xy.detach().numpy().round(3)}')`)

export const trainPy = (l: Lang) => block(l, 'Python: eğitim ve doğrulama döngüsü', 'Python: training and validation loop', (c) => `import torch
from torch import nn
from sklearn.datasets import make_moons

torch.manual_seed(0)                                     # ${c('tekrarlanabilirlik', 'reproducibility')}
X, y = make_moons(400, noise=0.2, random_state=0)
X, y = torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32).unsqueeze(1)
Xtr, ytr, Xva, yva = X[:300], y[:300], X[300:], y[300:]   # ${c('doğrulama ayrı tutulur', 'validation is held out')}

model = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 16), nn.ReLU(), nn.Linear(16, 1))
opt = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = nn.BCEWithLogitsLoss()

for epoch in range(1, 101):
    model.train()                                        # ${c('dropout/batchnorm eğitim kipi', 'dropout/batchnorm training mode')}
    perm = torch.randperm(len(Xtr))
    for i in range(0, len(Xtr), 32):
        idx = perm[i:i + 32]
        opt.zero_grad()                                  # ${c('1) gradyanları sıfırla', '1) zero the gradients')}
        loss = loss_fn(model(Xtr[idx]), ytr[idx])        # ${c('2) ileri geçiş + kayıp', '2) forward pass + loss')}
        loss.backward()                                  # ${c('3) geri yayılım', '3) backpropagation')}
        opt.step()                                       # ${c('4) güncelle', '4) update')}
    model.eval()
    with torch.no_grad():                                # ${c('doğrulamada grafik kurma', 'no graph during validation')}
        va = loss_fn(model(Xva), yva).item()
        acc = ((model(Xva) > 0).float() == yva).float().mean().item()
    if epoch % 20 == 0:
        print(f'epoch {epoch:3d}  train {loss.item():.3f}  val {va:.3f}  acc {acc:.3f}')`)

export const loaderPy = (l: Lang) => block(l, 'Python: Dataset ve DataLoader', 'Python: Dataset and DataLoader', (c) => `import torch
from torch.utils.data import Dataset, DataLoader, random_split

class SensorVerisi(Dataset):                             # ${c('kendi veri kümen: __len__ ve __getitem__', 'your own dataset: __len__ and __getitem__')}
    def __init__(self, n=1000):
        g = torch.Generator().manual_seed(0)
        self.X = torch.randn(n, 3, generator=g)
        self.y = (self.X.sum(1) > 0).long()
    def __len__(self):
        return len(self.X)
    def __getitem__(self, i):
        return self.X[i], self.y[i]                      # ${c('tek örnek; yığını DataLoader kurar', 'one sample; DataLoader builds the batch')}

ds = SensorVerisi()
tr, va = random_split(ds, [800, 200], generator=torch.Generator().manual_seed(42))
tr_dl = DataLoader(tr, batch_size=64, shuffle=True, drop_last=True)    # ${c('eğitimde karıştır', 'shuffle for training')}
va_dl = DataLoader(va, batch_size=256, shuffle=False)                 # ${c('doğrulamada karıştırma gerekmez', 'no need to shuffle validation')}
print(len(tr_dl), '${c('adım/tur', 'steps/epoch')}')                       # 800 // 64 = 12
xb, yb = next(iter(tr_dl))
print(xb.shape, yb.shape)                                # torch.Size([64, 3]) torch.Size([64])`)

export const cnnPy = (l: Lang) => block(l, 'Python: küçük CNN ve öznitelik haritaları', 'Python: a small CNN and its feature maps', (c) => `import torch
from torch import nn

class KucukCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, 3, padding=1)       # ${c('28×28 → 28×28 (padding=1)', '28×28 → 28×28 (padding=1)')}
        self.conv2 = nn.Conv2d(8, 16, 3, padding=1)
        self.pool = nn.MaxPool2d(2)                      # ${c('boyu yarıya indirir', 'halves the size')}
        self.fc = nn.Linear(16 * 7 * 7, 10)
    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))         # (N, 8, 14, 14)
        x = self.pool(torch.relu(self.conv2(x)))         # (N, 16, 7, 7)
        return self.fc(x.flatten(1))                     # (N, 10)

model = KucukCNN()
print(sum(p.numel() for p in model.parameters()))       # 80 + 1168 + 7850 = 9098

# ${c('öznitelik haritası: ara katmanın çıktısını kanca (hook) ile yakala', 'feature maps: capture an intermediate output with a hook')}
maps = {}
model.conv1.register_forward_hook(lambda m, i, o: maps.__setitem__('conv1', o.detach()))
model(torch.randn(1, 1, 28, 28))
print(maps['conv1'].shape)                               # torch.Size([1, 8, 28, 28])`)

export const regulPy = (l: Lang) => block(l, 'Python: dropout, ağırlık sönümü ve erken durdurma', 'Python: dropout, weight decay and early stopping', (c) => `import copy
import torch
from torch import nn

model = nn.Sequential(nn.Linear(2, 64), nn.ReLU(), nn.Dropout(0.3),       # ${c('eğitimde nöronların %30\'u sıfırlanır', '30% of neurons are zeroed during training')}
                      nn.Linear(64, 64), nn.ReLU(), nn.Dropout(0.3),
                      nn.Linear(64, 1))
opt = torch.optim.AdamW(model.parameters(), lr=0.01, weight_decay=0.01)  # ${c('ayrık ağırlık sönümü', 'decoupled weight decay')}

def egit_bir_tur(): ...                                  # ${c('5. ünitedeki döngü', 'the loop from unit 5')}
def dogrula() -> float: ...

best, best_state, sabir, bekle = float('inf'), None, 15, 0
for epoch in range(500):
    egit_bir_tur()
    va = dogrula()
    if va < best - 1e-4:
        best, best_state, bekle = va, copy.deepcopy(model.state_dict()), 0
    else:
        bekle += 1
        if bekle >= sabir:                               # ${c('15 turdur iyileşme yok: dur', 'no improvement for 15 epochs: stop')}
            print('${c('erken durdurma, tur', 'early stopping, epoch')}', epoch)
            break
model.load_state_dict(best_state)                        # ${c('en iyi doğrulama kaybındaki ağırlıklara dön', 'go back to the weights with the best validation loss')}`)

export const rnnPy = (l: Lang) => block(l, 'Python: LSTM ile dizi sınıflandırma ve dikkat', 'Python: sequence classification with an LSTM, and attention', (c) => `import torch
from torch import nn
import torch.nn.functional as F

class DiziModeli(nn.Module):
    def __init__(self, n_in=1, gizli=32, n_out=2):
        super().__init__()
        self.lstm = nn.LSTM(n_in, gizli, batch_first=True)   # ${c('girdi (N, T, özellik)', 'input (N, T, features)')}
        self.fc = nn.Linear(gizli, n_out)
    def forward(self, x):
        out, (h, c) = self.lstm(x)                       # out: (N, T, gizli), h: (1, N, gizli)
        return self.fc(h[-1])                            # ${c('son gizli durumdan sınıf', 'class from the last hidden state')}

x = torch.randn(8, 50, 1)                                # ${c('8 dizi, 50 adım', '8 sequences, 50 steps')}
print(DiziModeli()(x).shape)                             # torch.Size([8, 2])

# ${c('ölçekli nokta çarpımı dikkati: softmax(QKᵀ/√d)·V', 'scaled dot-product attention: softmax(QKᵀ/√d)·V')}
Q = K = V = torch.randn(1, 5, 16)                        # ${c('5 sözcük, 16 boyut', '5 words, 16 dimensions')}
w = torch.softmax(Q @ K.transpose(-2, -1) / 16 ** 0.5, dim=-1)
print(w.sum(-1))                                         # ${c('her satır 1', 'each row sums to 1')}
print(torch.allclose(w @ V, F.scaled_dot_product_attention(Q, K, V), atol=1e-6))`)

export const transferPy = (l: Lang) => block(l, 'Python: ResNet-18 ile aktarım öğrenmesi, ONNX ve nicemleme', 'Python: transfer learning with ResNet-18, ONNX and quantisation', (c) => `import torch
from torch import nn
from torchvision import models

model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)   # ${c('ImageNet ile önceden eğitilmiş', 'pretrained on ImageNet')}
for p in model.parameters():
    p.requires_grad = False                              # ${c('omurgayı dondur', 'freeze the backbone')}
model.fc = nn.Linear(model.fc.in_features, 5)            # ${c('yeni baş: 5 sınıf (eğitilebilir)', 'new head: 5 classes (trainable)')}
egitilen = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(egitilen)                                          # 512·5 + 5 = 2565
opt = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)

model.eval()
ornek = torch.randn(1, 3, 224, 224)
torch.onnx.export(model, ornek, 'model.onnx', input_names=['goruntu'], output_names=['skor'],
                  dynamic_axes={'goruntu': {0: 'N'}})    # ${c('tarayıcı, mobil, C++ için', 'for browser, mobile, C++')}
q = torch.ao.quantization.quantize_dynamic(model, {nn.Linear}, dtype=torch.qint8)   # ${c('Linear katmanları int8', 'Linear layers to int8')}
torch.save(model.state_dict(), 'model.pt')               # ${c('ağırlıklar; tüm nesneyi değil', 'the weights, not the whole object')}`)

export const digitsPy = (l: Lang) => block(l, 'Python: rakam tanıyıcıyı eğit, değerlendir ve dışa aktar', 'Python: train, evaluate and export the digit recogniser', (c) => `import json
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
tr = datasets.MNIST('veri', train=True, download=True, transform=tf)
te = datasets.MNIST('veri', train=False, download=True, transform=tf)
tr_dl = DataLoader(tr, batch_size=64, shuffle=True)
te_dl = DataLoader(te, batch_size=1000)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = KucukCNN().to(device)                            # ${c('7. ünitedeki sınıf', 'the class from unit 7')}
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
for epoch in range(4):
    model.train()
    for xb, yb in tr_dl:
        xb, yb = xb.to(device), yb.to(device)
        opt.zero_grad()
        nn.functional.cross_entropy(model(xb), yb).backward()
        opt.step()
    model.eval(); dogru = 0
    with torch.no_grad():
        for xb, yb in te_dl:
            dogru += (model(xb.to(device)).argmax(1).cpu() == yb).sum().item()
    print(f'epoch {epoch + 1}: ${c('test doğruluğu', 'test accuracy')} {dogru / len(te):.4f}')   # ${c('≈ 0,985', '≈ 0.985')}

# ${c('tarayıcıdaki tanıyıcıya yüklenecek JSON', 'JSON to load into the in-browser recogniser')}
r = lambda t: [round(v, 6) for v in t.detach().cpu().flatten().tolist()]
sd = model.state_dict()
json.dump({'mean': 0.1307, 'std': 0.3081,
           'conv1': {'w': r(sd['conv1.weight']), 'b': r(sd['conv1.bias'])},
           'conv2': {'w': r(sd['conv2.weight']), 'b': r(sd['conv2.bias'])},
           'fc': {'w': r(sd['fc.weight']), 'b': r(sd['fc.bias'])}}, open('agirliklar.json', 'w'))`)

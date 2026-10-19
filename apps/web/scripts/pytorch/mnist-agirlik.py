# PyTorch dersi: tarayıcıdaki rakam tanıyıcı ve öznitelik haritası görselleştiricisi için küçük CNN'i eğitir ve ağırlıkları
# JSON'a yazar. Mimari ve eğitim, bitirme defterindeki (public/defterler/pytorch/bitirme-rakam-cnn.ipynb) ile aynıdır.
# Kullanım: python3 scripts/pytorch/mnist-agirlik.py ~/.keras/datasets/mnist.npz public/veri/pytorch
# (mnist.npz: x_train, y_train, x_test, y_test; torchvision.datasets.MNIST ile indirilen veri de aynıdır.)
import json, sys, os
import numpy as np
import torch
from torch import nn

torch.manual_seed(0)
np.random.seed(0)
src, out = sys.argv[1], sys.argv[2]
d = np.load(src)
MEAN, STD = 0.1307, 0.3081
def prep(x):
    return ((torch.tensor(x, dtype=torch.float32) / 255.0 - MEAN) / STD).unsqueeze(1)
xtr, ytr = prep(d['x_train']), torch.tensor(d['y_train'], dtype=torch.long)
xte, yte = prep(d['x_test']), torch.tensor(d['y_test'], dtype=torch.long)

class KucukCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, 3, padding=1)
        self.conv2 = nn.Conv2d(8, 16, 3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.fc = nn.Linear(16 * 7 * 7, 10)
    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        return self.fc(x.flatten(1))

dev = 'cuda' if torch.cuda.is_available() else 'cpu'
model = KucukCNN().to(dev)
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()
for epoch in range(4):
    model.train()
    perm = torch.randperm(len(xtr))
    for i in range(0, len(xtr), 64):
        idx = perm[i:i + 64]
        xb, yb = xtr[idx].to(dev), ytr[idx].to(dev)
        # hafif veri artırma: ±2 piksel kaydırma (tarayıcıda çizilen rakamlar tam ortada olmayabilir)
        sh = np.random.randint(-2, 3, size=2)
        xb = torch.roll(xb, shifts=(int(sh[0]), int(sh[1])), dims=(2, 3))
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        opt.step()
    model.eval()
    with torch.no_grad():
        acc = (model(xte.to(dev)).argmax(1).cpu() == yte).float().mean().item()
    print(f'epoch {epoch + 1}: test acc {acc:.4f}')

r = lambda t: [float(f'{v:.5g}') for v in t.detach().cpu().flatten().tolist()]
sd = model.state_dict()
w = {
    'arch': 'Conv2d(1,8,3,p=1)-ReLU-MaxPool2d(2)-Conv2d(8,16,3,p=1)-ReLU-MaxPool2d(2)-Flatten-Linear(784,10)',
    'mean': MEAN, 'std': STD, 'testAcc': round(acc, 4),
    'conv1': {'w': r(sd['conv1.weight']), 'b': r(sd['conv1.bias'])},
    'conv2': {'w': r(sd['conv2.weight']), 'b': r(sd['conv2.bias'])},
    'fc': {'w': r(sd['fc.weight']), 'b': r(sd['fc.bias'])},
}
os.makedirs(out, exist_ok=True)
json.dump(w, open(os.path.join(out, 'mnist-cnn.json'), 'w'), separators=(',', ':'))
# tarayıcıda doğruluk ölçümü için ilk 200 test örneği: 200 etiket baytı + 200 × 784 piksel (uint8)
n = 200
blob = bytes(d['y_test'][:n].astype(np.uint8)) + bytes(d['x_test'][:n].astype(np.uint8).reshape(-1))
open(os.path.join(out, 'mnist-test-200.bin'), 'wb').write(blob)
print('kaydedildi', out)

// PyTorch dersi: aktarım öğrenmesi hesapları (saf, testli). torchvision ResNet-18'in blok blok parametre sayıları (BatchNorm
// dahil; toplam 11 689 512, 1000 sınıflı baş ile). Hangi bloklar dondurulursa eğitilecek parametre, Adam'ın ek belleği
// (parametre başına iki moment: 2 × 4 bayt) ve gradyan belleği buna göre değişir.

export interface Block { key: string; params: number; tr: string; en: string }
export const RESNET18: Block[] = [
  { key: 'stem', params: 9536, tr: 'Giriş: conv1 7×7 + bn1', en: 'Stem: conv1 7×7 + bn1' },
  { key: 'layer1', params: 147968, tr: 'layer1 (64 kanal)', en: 'layer1 (64 channels)' },
  { key: 'layer2', params: 525568, tr: 'layer2 (128 kanal)', en: 'layer2 (128 channels)' },
  { key: 'layer3', params: 2099712, tr: 'layer3 (256 kanal)', en: 'layer3 (256 channels)' },
  { key: 'layer4', params: 8393728, tr: 'layer4 (512 kanal)', en: 'layer4 (512 channels)' },
]
/** Yeni sınıflandırma başı: nn.Linear(512, k). */
export const headParams = (k: number) => 512 * k + k
export const RESNET18_TOTAL_IMAGENET = RESNET18.reduce((a, b) => a + b.params, 0) + headParams(1000)

export function transferPlan(frozen: Record<string, boolean>, classes: number) {
  const total = RESNET18.reduce((a, b) => a + b.params, 0) + headParams(classes)
  const trainable = RESNET18.filter((b) => !frozen[b.key]).reduce((a, b) => a + b.params, 0) + headParams(classes)
  const MB = 1024 * 1024
  return {
    total, trainable, frozen: total - trainable,
    weightsMB: (total * 4) / MB,
    /** gradyan (4 B) + Adam m ve v (8 B) yalnız eğitilen parametreler için */
    trainMB: (trainable * 12) / MB,
  }
}

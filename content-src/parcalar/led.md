# LED
slug: led
parça: led
kategori: Çıkış
özet: Akım geçince ışık veren, yönlü iki uçlu parça. Mutlaka seri direnç ister.

## Pinler
- A: Anot (+). Gerçek LED'de uzun bacak. Akımın girdiği uç.
- K: Katot (-). Gerçek LED'de kısa bacak, gövdede düz kesik taraf. GND tarafına gider.

## Nasıl çalışır
**LED** (ışık yayan diyot), akımı yalnız bir yönde geçiren ve geçirirken ışık veren bir parçadır. Akım **A'dan K'ya** akar. Ters bağlarsan akım geçmez ve LED yanmaz; bu LED'i bozmaz, yalnızca ışık vermez.

LED bir direnç gibi davranmaz. Yanarken uçları arasında yaklaşık **sabit bir gerilim** düşer; buna ileri gerilim (Vf) denir ve rengine bağlıdır. Geri kalan gerilim devredeki başka bir şeyin üzerinde düşmek zorundadır. O "başka şey" **seri direnç** değilse akım sınırlanmaz, LED çok akım çeker ve yanar. Bu yüzden LED'in yanına her zaman bir direnç koyarsın:

`I = (Vbesleme − Vf) / R`

Parlaklık akımla artar. Birkaç mA'de belirgin ışık verir; Uno pininden çekilecek güvenli akım yaklaşık 20 mA'in altındadır.

**İleri düzey:** LED'in akım-gerilim ilişkisi doğrusal değildir; gerilim biraz artınca akım hızla artar. Bu yüzden LED'i bir gerilim kaynağına doğrudan bağlamak yerine akımı bir dirençle belirlersin. Laboratuvar LED'i "sabit Vf + küçük iç direnç" olarak modeller; Uno pininin iç direncini (yaklaşık 25 Ω) de hesaba katar.

## Laboratuvarda bağlantı
Pin adları laboratuvardaki parçanın uçlarıyla aynıdır.

| Nereden | Nereye |
|---|---|
| Uno **D13** (ya da başka bir dijital pin) | Direncin **1** ucu |
| Direncin **2** ucu | LED **A** |
| LED **K** | Uno **GND** |

Direnç LED'in anot ya da katot tarafında olabilir; akım sınırlama açısından fark etmez. Bu sitedeki derslerde direnç pin tarafındadır. Rengi özellik panelinden seçersin (kırmızı, sarı, yeşil, mavi, beyaz).

Uno üzerinde D13'e bağlı dahili bir L LED'i vardır. Kodla D13'ü sürünce o da yanar.

## Tipik değerler
- Kırmızı LED Vf | 1,9 V | Laboratuvar modeli
- Sarı LED Vf | 2,0 V | Laboratuvar modeli
- Yeşil LED Vf | 2,2 V | Laboratuvar modeli
- Mavi ve beyaz LED Vf | 3,0 V | Laboratuvar modeli
- Seri direnç (5 V, kırmızı) | 330 Ω | Yaklaşık 9 mA; bu sitedeki derslerin standardı
- Rahat parlaklık akımı | 5-15 mA | Laboratuvarda parlaklık 10 mA civarında tam görünür
- Uyarı sınırı | 25 mA | Üstünde "seri direnç yok ya da çok küçük" uyarısı çıkar
- Yanma sınırı | 30 mA | Üstünde LED yanar; ↺ ile baştan başlayınca düzelir

## Sık hatalar
- **Direnç koymamak.** Akım sınırlanmaz; laboratuvar uyarı verir ve LED yanabilir. Gerçek devrede LED ve Uno pini zarar görebilir.
- **LED'i ters bağlamak.** Yanmaz. A ucunu pin/direnç tarafına, K ucunu GND'ye bağla.
- **GND'yi unutmak.** Devre kapanmaz; akım akmaz.
- **Mavi/beyaz LED'i kırmızıyla aynı parlaklık sanmak.** Vf daha büyük olduğu için aynı dirençle akım daha küçük olur: 330 Ω'da kırmızı yaklaşık 8,6 mA, mavi yaklaşık 5,6 mA çeker (laboratuvar modeli).
- **Aynı direnci birkaç LED'in ortak ucuna koymak.** Tek direnç yalnız toplam akımı sınırlar; her LED'e kendi direncini ver.

## İlgili dersler
- arduino-temelleri:1:2
- arduino-temelleri:1:3
- arduino-temelleri:1:4
- arduino-temelleri:1:5

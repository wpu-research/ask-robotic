# Döner enkoder
slug: enkoder
parça: encoder
kategori: Girdi
özet: Sınırsız dönebilen, adım ve yönü iki sinyalle (CLK ve DT) veren döner düğme. Basılabilen düğmesi de vardır.

## Pinler
- CLK: Birinci sinyal (A). Her tıkta bir kez düşer; kesme pinine (D2) bağlanır.
- DT: İkinci sinyal (B). CLK'dan çeyrek dönem (90 derece) kayıktır; yönü verir.
- SW: Düğme çıkışı. Basılınca GND'ye bağlanır.
- VCC: Modülün pull-up dirençleri için besleme (5V). Bağlamasan da INPUT_PULLUP yeterlidir.
- GND: Toprak. Her durumda bağlı olmalıdır.

## Nasıl çalışır
**Döner enkoder**, içinde iki kontak taşıyan sınırsız dönen bir düğmedir. Kontaklar aynı anda değil, biri ötekinden biraz önce değişir. Bu yüzden CLK ve DT arasında 90 derece fark vardır (quadrature). Saat yönünde (CLK, DT) durumları 11, 01, 00, 10, 11 sırasıyla değişir; ters yönde 11, 10, 00, 01, 11.

Yön kuralı: CLK 1'den 0'a düşerken DT'ye bak. DT 1 ise bir yöne, 0 ise öbür yöne dönülüyordur. Bu yüzden CLK bir kesme pinine bağlanır ve ISR içinde DT okunur.

**İleri düzey:** Gerçek kontaklar sıçrar; bir tık 2-3 kenar üretebilir. Çözüm, iki kenar arasında en az belli bir süre (örneğin 2000 µs) geçmediyse kenarı yok saymaktır. Laboratuvar modeli sıçramaz ve her benzetim milisaniyesinde bir durum geçişi uygular; bir tık 4 geçiştir, bu yüzden en çok 250 tık/sn döner.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Enkoder **CLK** | Uno **D2** (`INPUT_PULLUP`, kesme pini) |
| Enkoder **DT** | Uno **D3** (`INPUT_PULLUP`) |
| Enkoder **SW** | Uno **D4** (`INPUT_PULLUP`) |
| Enkoder **VCC** | Uno **5V** (isteğe bağlı) |
| Enkoder **GND** | Uno **GND** |

Özellik panelindeki **Konum (tık)** değeri değişince enkoder o kadar tık çevrilir (saat yönü artı). **Düğme basılı** düğmeyi basar.

## Tipik değerler
- Bir tık | 4 durum geçişi | 11, 01, 00, 10, 11
- Bir geçiş süresi | 1 ms | Laboratuvar modeli
- En hızlı dönüş | 250 tık/sn | Tık başına 4 ms
- Pull-up direnci | 10 kΩ | Modül kartında, VCC'ye
- Önerilen bounce eşiği | 2000 µs | 4 ms'den küçük olmalı

## Sık hatalar
- **CLK'yı kesme pini olmayan bir pine bağlamak.** Uno'da yalnız D2 ve D3 kesme yapar.
- **sayac değişkenini volatile yapmamak.** loop() değişimi görmeyebilir.
- **ISR içinde Serial.print ya da delay kullanmak.** ISR kısa olmalıdır.
- **Bounce filtresi koymamak ya da eşiği fazla büyütmek.** Birincisinde sayaç fazla atlar, ikincisinde hızlı çevirirken tıklar kaybolur.
- **CLK ile DT'yi karıştırmak.** Yön ters çıkar.

## İlgili dersler
- arduino-temelleri:6:4
- sensorler-ve-projeler:5:2

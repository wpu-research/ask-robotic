# Elektrik: V, I, R ve Ohm yasası
süre: 20

## Merak
Gerçek bir LED'i doğrudan 5 V'a bağlarsan çok kısa sürede bozulabilir. Aradaki küçük bir direnç onu nasıl kurtarır? Ve o direncin değerini tahmin etmek yerine hesaplayabilir miyiz? Laboratuvar bu kuralı modeller: LED'e fazla akım giderse uyarı çıkar. Üstelik akımı kendin ölçebilirsin.

## Etkinlik
### Üç temel büyüklük
| Büyüklük | Simge | Birim | Su borusu benzetmesi |
|---|---|---|---|
| Gerilim | V | volt (V) | Suyu iten basınç |
| Akım | I | amper (A) | Borudan geçen su miktarı |
| Direnç | R | ohm (Ω) | Borunun darlığı |

Su benzetmesi basit bir modeldir. Elektrik suya benzemez ama fikri anlamana yardım eder: basınç artarsa akış artar, boru daralırsa akış azalır.

Küçük akımları **miliamper** (mA) ile yazarız: 1 A = 1000 mA. Büyük dirençleri **kiloohm** (kΩ) ile yazarız: 1 kΩ = 1000 Ω.

### Ohm yasası
Bir direncin uçları arasındaki gerilim, ondan geçen akımla direncin çarpımına eşittir:

**V = I × R**

Buradan iki tane daha formül çıkar:
- **I = V / R** (akımı bulmak için)
- **R = V / I** (direnci bulmak için)

### Örnek hesaplar
1. 5 V ve 1000 Ω (1 kΩ): I = 5 / 1000 = 0,005 A = **5 mA**.
2. 5 V ve 500 Ω: I = 5 / 500 = 0,01 A = **10 mA**. Direnç yarıya inince akım iki katına çıkar.
3. 9 V ve 3 A akım isteyen bir yük: R = 9 / 3 = **3 Ω**.
4. 220 Ω dirençten 20 mA geçiyor: V = 0,02 × 220 = **4,4 V**.

### LED için direnç hesabı
LED bir direnç değildir. Yanarken uçlarında yaklaşık sabit bir gerilim düşer. Kırmızı bir LED için bu değer tipik olarak yaklaşık 2 V'tur (kesin değer LED'in veri sayfasında yazar). Geri kalan gerilim seri dirençte düşmelidir.

Besleme 5 V, LED gerilimi 2 V ise direncin üzerinde 5 − 2 = 3 V kalır.

- 330 Ω için akım: I = 3 / 330 ≈ 0,0091 A ≈ **9 mA**. LED güvenle yanar.
- 150 Ω için akım: I = 3 / 150 = 0,02 A = **20 mA**. Daha parlak olur, ama sınıra yakındır.
- 100 Ω için akım: I = 3 / 100 = **30 mA**. Bu fazladır; LED ve pin zarar görebilir.

Arduino Uno'nun bir pini için önerilen en yüksek akım yaklaşık 20 mA'dir; 40 mA ise aşılmaması gereken mutlak sınırdır. Bu yüzden bu modülde kırmızı LED'lerle **330 Ω** kullanıyoruz.

### Sanal ölçüm: akımı ve gerilimi oku
Gerçek devrelerde bu değerleri multimetre ölçer. Laboratuvarda bunun karşılığı **sanal ölçümdür**. Devre çalışırken tuvalde bir parçayı (örneğin direnci ya da LED'i) seç. Parçanın uçları arasındaki **gerilim** ve içinden geçen **akım** özellik panelinde görünür. Önce ▶ ile devreyi çalıştırman gerekir; çalışmayan devrede ölçülecek bir şey yoktur.

Ohm yasasını bununla sınayabilirsin: D13'ü 330 Ω'luk bir dirençle LED'e bağla, kod D13'ü HIGH yapsın. Direnci seçince yaklaşık 3 V ve 9 mA görmelisin. Hesabımız: (5 − 2) / 330 ≈ 9 mA. Sonra ■ ile durdur, direnci özellik panelinden 1000 Ω yap ve yeniden çalıştırıp ölç: akım yaklaşık 3 mA'e düşmelidir.

### Dirençte renk kodu
Gerçek dirençlerin üzerindeki renkli halkalar değeri verir. Laboratuvarda değeri özellik panelinden yazarsın, ama gerçek dirençleri okumak için kodu bilmek yararlıdır. 330 Ω için sıra: turuncu, turuncu, kahverengi. İlk iki halka rakamdır (3 ve 3), üçüncü halka çarpandır (kahverengi = ×10), yani 33 × 10 = 330 Ω.

### Dene
- 5 V'a bağlı 220 Ω'luk bir dirençten ne kadar akım geçer? (Cevap: yaklaşık 22,7 mA)
- Aynı 5 V ile 10 mA akım geçirmek istiyorsan hangi direnç gerekir? (Cevap: 500 Ω)
- Kırmızı LED (2 V) ve 5 V besleme ile 330 Ω yerine 1 kΩ kullanırsan akım ne olur? LED nasıl görünür? (Cevap: 3 mA; sönük yanar)
- Laboratuvarda bu devreyi kur, direnç değerini değiştir ve sanal ölçümle akımı oku. Hesabınla ölçülen değer uyuşuyor mu?

### Sık yapılan hatalar
- mA ile A'yı karıştırmak: 20 mA = 0,02 A'dir. Formülde önce ampere çevir.
- LED'e direnç koymamak: akım hiçbir şey tarafından sınırlanmaz. Laboratuvar bunu modeller ve LED yanarsa uyarı verir; ↺ ile baştan başlayabilirsin.
- "Direnç büyükse akım büyüktür" sanmak: tersine, direnç büyüdükçe akım **azalır**.

## Konuşalım
Direnci iki katına çıkarırsan LED'in parlaklığı nasıl değişir ve neden? Çok parlak ama güvenli bir LED için dirençle oynamak iyi bir fikir midir?

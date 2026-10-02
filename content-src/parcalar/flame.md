# Alev sensörü
slug: flame
parça: flame
kategori: Sensör
özet: Alevin yaydığı kızılötesi (IR) ışığı algılayan modül. Laboratuvardaki modülde alev arttıkça analog çıkış düşer.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır; en az 3 V gerekir.
- GND: Toprak ucu. GND'ye bağlanır.
- AO: Analog çıkış. Uno'nun bir analog girişine (derslerde A1) gider; alevde gerilim düşer.
- DO: Dijital çıkış. Alev şiddeti eşiği geçince LOW olur; derslerde kullanılmaz.

## Nasıl çalışır
Alev sensörü, alevin yaydığı **kızılötesi (IR) ışığa** duyarlı bir alıcıdır. Alev yaklaşınca analog çıkış değişir. Laboratuvardaki modülde **alevde değer düşer**; ama bazı modüllerde tersi olabilir. Bu yüzden ham okumayı "büyük sayı = güçlü alev" olacak biçimde tek bir fonksiyonda çevirirsin (`siddet()`); geri kalan kod yönden bağımsız kalır.

Güneş ışığı ve bazı lambalar da IR yayar; gerçek devrede bunlar yanlış alarm üretebilir. Sensörün görüş açısı ve menzili sınırlıdır. Bu sensör tek başına güvenilir bir yangın dedektörü değildir.

**İleri düzey:** Laboratuvar modelinde AO = VCC × (1 − 0,95 × Alev şiddeti). Alev yokken AO = VCC olur ve `analogRead` 1023 verir; şiddet 1 iken yaklaşık 0,25 V (ham ≈ 51) okunur.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Alev sensörü **VCC** | Uno **5V** |
| Alev sensörü **GND** | Uno **GND** |
| Alev sensörü **AO** | Uno **A1** |

Özellik panelindeki **Alev şiddeti** (0 ile 1) alevi taklit eder ve program çalışırken değiştirilebilir. **Eşik (DO)** yalnız dijital çıkışı etkiler. Gerçek alevle deney yapılmaz.

## Tipik değerler
- Alev şiddeti 0 | ham = 1023, şiddet 0 | Alev yok
- Alev şiddeti 0,31 | ham ≈ 722, şiddet ≈ 301 | Derslerdeki UYARI eşiğinin (300) yanı
- Alev şiddeti 0,4 | ham ≈ 634, şiddet ≈ 389 | UYARI
- Alev şiddeti 0,62 | ham ≈ 420, şiddet ≈ 603 | Derslerdeki TEHLIKE eşiğinin (600) yanı
- Alev şiddeti 0,8 | ham ≈ 246, şiddet ≈ 777 | TEHLIKE
- Şiddet çevirisi | siddet = 1023 − ham | Alevde değer düşen modül için

## Sık hatalar
- **Yönü bilmemek.** `ALEVDE_DUSER` değerini kontrol etmezsen alarm hep ya da hiç çalar.
- **Yönü her yerde ayrı düşünmek.** Çeviriyi tek fonksiyonda yap.
- **Kapama eşiğini açma eşiğinden büyük yazmak.** Seviye titrer ya da düşmez.
- **IR kaynaklarını unutmak.** Güneş ışığı ve bazı lambalar yanlış alarm verebilir (laboratuvar bunu modellemez).
- **Gerçek alevle deney yapmak.** Tehlikelidir; derste alev yalnızca özellik panelinden taklit edilir.

## İlgili dersler
- sensorler-ve-projeler:4:4
- sensorler-ve-projeler:4:5

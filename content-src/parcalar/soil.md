# Toprak nemi sensörü
slug: soil
parça: soil
kategori: Sensör
özet: Toprağın ne kadar ıslak olduğunu analog bir gerilimle veren modül. Islandıkça çıkış değeri düşer.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır.
- GND: Toprak ucu. GND'ye bağlanır.
- AO: Analog çıkış. Uno'nun bir analog girişine (derslerde A2) gider; ıslandıkça gerilim düşer.
- DO: Dijital çıkış. Nem eşiği geçince LOW olur; derslerde kullanılmaz.

## Nasıl çalışır
Toprak nemi modülü toprağın nemini bir gerilime çevirir. Laboratuvardaki modülde **kuruda çıkış yüksektir, ıslandıkça düşer**. `analogRead` bu gerilimi 0-1023 arası sayıya çevirir. Sayıyı yüzdeye çevirmek için kuru ve ıslak uç değerleri ölçülür ve `map` ile `constrain` kullanılır.

Gerçekte iki tür vardır. **Dirençli** sensörün toprağa gömülen açık metal uçları zamanla paslanır. **Kapasitif** sensörün uçları yalıtkanla kaplıdır ve genelde daha uzun ömürlüdür. Çıkış yönü ve sayılar üreticiden üreticiye değişir; her sensörü kendi kuru ve ıslak ölçümüyle kalibre etmek gerekir.

**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,9 − 0,6 × nem). Bu yüzden 5 V ile nem 0 iken yaklaşık 4,5 V (ham ≈ 921), nem 1 iken yaklaşık 1,5 V (ham ≈ 307) çıkar.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Toprak nemi **VCC** | Uno **5V** |
| Toprak nemi **GND** | Uno **GND** |
| Toprak nemi **AO** | Uno **A2** |

Özellik panelindeki **Toprak nemi** (0 ile 1) kaydırıcısı toprağın ne kadar ıslak olduğunu belirler ve program çalışırken değiştirilebilir. **Eşik (DO)** yalnız dijital çıkış için kullanılır. Modülün çalışması için en az 3 V besleme gerekir.

## Tipik değerler
- Nem 0 (kuru) | ham ≈ 921 | Yaklaşık 4,5 V
- Nem 0,5 | ham ≈ 614 | Orta nokta
- Nem 1 (ıslak) | ham ≈ 307 | Yaklaşık 1,5 V
- Kalibrasyon örneği | KURU = 800, ISLAK = 350 | Ham 575 değeri yaklaşık %50 eder
- Okuma gürültüsü | 8 ölçümün ortalaması | Tek ölçüm yanıltabilir

## Sık hatalar
- **Yönü bilmemek.** "Büyük sayı ıslak demektir" diye varsaymak; bu modülde ıslandıkça değer düşer.
- **`constrain` unutmak.** Kalibrasyon dışındaki okumalar %-26 ya da %130 gibi değerler verir.
- **Başka sensörün uçlarını kullanmak.** Yüzde hesabı yanlış çıkar.
- **Dirençli sensörü sürekli toprakta ve açık bırakmak.** Uçlar paslanır, okuma zamanla kayar.
- **Tek ölçüme bakmak.** Gürültü yüzünden ortalama almak gerekir.

## İlgili dersler
- sensorler-ve-projeler:3:3
- sensorler-ve-projeler:3:5

# Su seviyesi sensörü
slug: waterlevel
parça: waterlevel
kategori: Sensör
özet: Çıplak izli bir çubuğun ne kadarının suda olduğunu analog gerilimle veren sensör. Su yükseldikçe çıkış değeri artar.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır.
- GND: Toprak ucu. GND'ye bağlanır.
- AO: Analog çıkış. Uno'nun bir analog girişine (derslerde A1) gider; su yükseldikçe gerilim artar.
- DO: Dijital çıkış. Seviye eşiği geçince LOW olur; derslerde kullanılmaz.

## Nasıl çalışır
Su seviyesi sensörünün çubuğunda çıplak iletken izler vardır. Su yükseldikçe daha çok iz suya girer ve çıkış gerilimi **artar**. Bu, toprak nemi ve yağmur sensörlerinin tersidir. `analogRead` gerilimi sayıya çevirir; programda eşiklerle "boş", "orta" ya da "dolu" gibi durumlar ayrılır.

Çubuk 5 V ile bile tam ölçeğe (1023) ulaşmaz; en yüksek değeri yaklaşık 819'dur. Bu yüzden eşikler 1023'e göre değil sensörün gerçek aralığına göre seçilmelidir. Suyla temas eden çıplak izler zamanla aşınabilir; gerçek sensör için veri sayfasına bakılmalıdır.

**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,05 + 0,75 × seviye). Seviye 0 iken yaklaşık 0,25 V (ham ≈ 51), seviye 1 iken yaklaşık 4 V (ham ≈ 819) çıkar.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Su seviyesi **VCC** | Uno **5V** |
| Su seviyesi **GND** | Uno **GND** |
| Su seviyesi **AO** | Uno **A1** |

Özellik panelindeki **Su seviyesi** (0 ile 1) kaydırıcısı çubuğun ne kadarının suda olduğunu belirler ve çalışırken değiştirilebilir. Modülün çalışması için en az 3 V besleme gerekir.

## Tipik değerler
- Seviye 0 (boş) | ham ≈ 51 | Yaklaşık 0,25 V
- Seviye 0,4 | ham ≈ 358 | Dersteki eşiklere göre "orta"
- Seviye 1 (tam dolu) | ham ≈ 819 | Yaklaşık 4 V; 1023'e ulaşmaz
- Dersteki eşikler | 300 ve 600 | Altı boş, arası orta, üstü dolu

## Sık hatalar
- **Yönü ters varsaymak.** Bu sensörde su yükseldikçe değer artar.
- **Eşikleri 1023'e göre seçmek.** Çubuğun en üst değeri yaklaşık 819'dur.
- **Tek eşik kullanmak.** Su yüzeyi dalgalanınca durum hızla değişir.
- **Sensörü sürekli suda bırakmak.** Çıplak izler zamanla aşınır.

## İlgili dersler
- sensorler-ve-projeler:3:3
- sensorler-ve-projeler:3:5

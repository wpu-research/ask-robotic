# RGB LED
slug: rgbled
parça: rgbled
kategori: Çıkış
özet: Kırmızı, yeşil ve mavi üç LED'i tek kılıfta toplayan parça. Üç kanalın parlaklığını karıştırarak her rengi üretirsin.

## Pinler
- R: Kırmızı kanalın ucu. Direnç üzerinden bir PWM pinine (bu sitede D9) bağlanır.
- G: Yeşil kanalın ucu. Direnç üzerinden bir PWM pinine (bu sitede D10) bağlanır.
- B: Mavi kanalın ucu. Direnç üzerinden bir PWM pinine (bu sitede D11) bağlanır.
- COM: Üç kanalın ortak ucu. Ortak katotta GND'ye, ortak anotta 5V'a bağlanır.

## Nasıl çalışır
**RGB LED**, aynı kılıfta kırmızı, yeşil ve mavi üç ayrı LED taşır. Üç LED'in bir ucu birleşip tek bir **COM** ucu olur. Katotlar birleşmişse **ortak katot**, anotlar birleşmişse **ortak anot** denir. Laboratuvarda varsayılan ortak katottur.

Işıkta renkler **toplanır**: kırmızı + yeşil sarı, yeşil + mavi camgöbeği, kırmızı + mavi mor, üçü birden beyaz verir. Her kanalı `analogWrite(pin, 0-255)` ile ayrı ayrı ayarlarsan yaklaşık 16,7 milyon renk elde edersin (256 × 256 × 256).

Ortak katotta kanal, pin HIGH iken yanar. Ortak anotta mantık tersinedir: COM 5V'a gider ve kanal pin LOW iken yanar. Bu yüzden `analogWrite(pin, 255 - değer)` yazarsın.

**İleri düzey:** Üç LED farklı yarı iletkenlerden yapıldığı için ileri gerilimleri farklıdır: kırmızı en düşük, mavi en yüksektir. Aynı dirençle mavi kanalın akımı daha küçük olur ve mavi daha sönük görünür. Bu yüzden (255, 255, 255) laboratuvarda biraz renkli beyaz görünebilir. Gerçek devrede renk dengesi için kanallara farklı direnç değerleri seçilebilir.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Uno **D9** | Direnç 1 ucu, direncin 2 ucu RGB **R** |
| Uno **D10** | Direnç 1 ucu, direncin 2 ucu RGB **G** |
| Uno **D11** | Direnç 1 ucu, direncin 2 ucu RGB **B** |
| RGB **COM** | Uno **GND** (ortak katot) |

Her kanalın kendi direnci olmalıdır. Özellik panelindeki **Ortak uç** alanından ortak katot ya da ortak anot seçersin; ortak anotta COM, Uno 5V'a bağlanır. Üç pin de PWM yapabilir, böylece her kanalın parlaklığını ayrı ayarlarsın.

## Tipik değerler
- Kırmızı kanal Vf | 1,9 V | Laboratuvar modeli
- Yeşil kanal Vf | 2,2 V | Laboratuvar modeli
- Mavi kanal Vf | 3,0 V | Laboratuvar modeli
- Seri direnç (5 V) | 330 Ω | Her kanal için ayrı; bu sitedeki derslerin standardı
- Kanal akımı (330 Ω, pin HIGH) | kırmızı ≈ 8,6 mA, yeşil ≈ 7,8 mA, mavi ≈ 5,6 mA | Laboratuvar modeli; pin ve LED iç direnci dahil
- Yanma sınırı | 30 mA | Bir kanal bunun üstüne çıkarsa yanar; ↺ ile baştan başla
- Renk sayısı | ≈ 16,7 milyon | 256 × 256 × 256

## Sık hatalar
- **COM'u yanlış uca bağlamak.** Ortak katotlu LED'de COM, GND'ye gider. 5V'a bağlarsan kanallar yanmaz.
- **Ortak anotta değerleri ters yazmamak.** Kırmızı isteyip camgöbeği görürsün; `255 - değer` yaz.
- **Üç kanal için tek direnç kullanmak.** Kanallar birbirinin parlaklığını etkiler; her kanala kendi direncini ver.
- **R, G ve B uçlarını karıştırmak.** Renkler beklenenden farklı çıkar; kabloları kontrol et.
- **PWM'siz bir pine bağlamak.** Parlaklık ayarı çalışmaz, kanal yalnız yanar ya da söner. D9, D10 ve D11 kullan.

## İlgili dersler
- arduino-temelleri:4:2
- arduino-temelleri:4:5

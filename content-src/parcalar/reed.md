# Reed anahtarı
slug: reed
parça: reed
kategori: Girdi
özet: Mıknatıs yaklaşınca iki ucunu birleştiren anahtar; elektrik bakımından mıknatısla çalışan bir buton.

## Pinler
- A: Birinci uç. Mıknatıs yakınken B ile birleşir.
- B: İkinci uç.

## Nasıl çalışır
Reed anahtarı, cam bir tüpün içindeki iki ince metal dilden oluşur. Yanına bir mıknatıs gelince diller birbirine değer ve kontak **kapanır**; mıknatıs uzaklaşınca kontak açılır. Kapı ve pencere alarmlarında bir parça çerçeveye, mıknatıs kapıya yapıştırılır.

Arduino'da butonla aynı yöntemle okunur: bir ucu pine, öbür ucu GND'ye bağlanır ve pin `INPUT_PULLUP` yapılır.
- Mıknatıs uzakta (kontak açık): pin 5 V'a çekilir, `digitalRead` **HIGH** okur.
- Mıknatıs yakın (kontak kapalı): pin GND'ye bağlanır, `digitalRead` **LOW** okur.

Sade reed, mıknatısın hangi kutbunun yaklaştığına bakmaz. Limit anahtarı da elektrik bakımından bir butondur (laboratuvarda yerine buton parçası kullanılır).

**İleri düzey:** Gerçek kontaklar kapanırken kısa süre titrer (bounce); değişimi ancak belirli bir süre kararlı kalırsa kabul etmek yalancı olayları önler. Güvenlik uygulamalarında kontağı normalde kapalı (NC) kullanmak, kopan kablonun da ihlal olarak görülmesini sağlar.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Reed **A** | Uno **D4** |
| Reed **B** | Uno **GND** |

Kodda `pinMode(4, INPUT_PULLUP);` yazarsın. Özellik panelindeki **Mıknatıs yakın** kutusu mıknatısı getirir ve götürür; çalışırken de değiştirilebilir. Laboratuvardaki reed çıplak bir reed gibidir: kendi direnci yoktur, bu yüzden `INPUT_PULLUP` şarttır.

## Tipik değerler
- Önerilen bağlantı | D4'e A, GND'ye B | Bu sitedeki Modül 4 standardı
- Kod ayarı | INPUT_PULLUP | Dış direnç gerekmez
- Mıknatıs yakın | LOW | Kontak kapalı, ≈ 0,1 Ω
- Mıknatıs uzak | HIGH | Kontak açık, iç pull-up ≈ 35 kΩ ile 5 V'a çekilir

## Sık hatalar
- **`INPUT_PULLUP` yazmamak.** Kontak açıkken pin yüzer ve okuma rastgele olur.
- **"Mıknatıs yakın = HIGH" sanmak.** Pull-up ile kontak kapanınca pin LOW olur.
- **B ucunu GND'ye bağlamayı unutmak.** Kontak kapansa bile pin LOW olmaz.
- **Debounce koymamak.** Gerçek devrede kapı sallanınca yalancı olaylar çıkar.
- **NO ile NC'yi karıştırmak.** Devre tersine çalışır.

## İlgili dersler
- sensorler-ve-projeler:2:3
- sensorler-ve-projeler:2:5

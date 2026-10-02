# Buton
slug: buton
parça: button
kategori: Girdi
özet: Basılınca iki ucunu birleştiren anahtar. Kart, butonun durumunu bir giriş pininden okur.

## Pinler
- A: Birinci uç. Basılınca B ile birleşir.
- B: İkinci uç.

## Nasıl çalışır
Buton, basılmadığında iki ucu arasında bağlantı olmayan, basılınca iki ucu birleştiren (kısa devre yapan) bir anahtardır. Kendi başına bir gerilim üretmez; yalnızca bir yolu açar ya da kapatır.

Arduino bir butonu okumak için pini **giriş** yapar ve butonun bir ucunu o pine, öbür ucunu GND'ye bağlarsın. Sorun şudur: buton basılmamışken pin hiçbir şeye bağlı kalmaz (yüzen giriş) ve rastgele okunur. Çözüm, pini kodda `INPUT_PULLUP` yapmaktır: kartın içinde pini 5 V'a çeken bir direnç devreye girer.

Sonuç **ters mantıktır**:
- Basılı değil: pin 5 V'a çekilir, `digitalRead` **HIGH** okur.
- Basılı: pin GND'ye bağlanır, `digitalRead` **LOW** okur.

**İleri düzey:** Gerçek butonların kontakları basarken çok kısa süre titrer (bounce). Bir basış, kodda birkaç kez görünebilir. Bunu önlemeye "debounce" denir (Modül 3, 8. ders).

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Buton **A** | Uno **D2** |
| Buton **B** | Uno **GND** |

Kodda `pinMode(2, INPUT_PULLUP);` yazarsın. Butona basmak için parçayı seçip özellik panelinden **Basılı** seçeneğini açarsın ya da parçaya basılı tutarsın; devre çalışırken de değiştirebilirsin. Laboratuvarda basılı butonun direnci çok küçüktür (0,1 Ω), açıkken bağlantı yoktur. İç pull-up direnci modelde yaklaşık 35 kΩ'dur.

Laboratuvar bağlantısız (yüzen) bir giriş için uyarı verir.

## Tipik değerler
- Önerilen bağlantı | D2'ye A, GND'ye B | Bu sitedeki derslerin standardı
- Kod ayarı | INPUT_PULLUP | Dış direnç gerekmez
- Basılmamış okuma | HIGH | Pin iç pull-up ile 5 V'a çekilir
- Basılmış okuma | LOW | Pin GND'ye bağlanır
- İkinci buton | D3 | Bu sitedeki ikinci giriş pini

## Sık hatalar
- **Butonun mantığını ters sanmak.** `INPUT_PULLUP` ile basılı = LOW'dur; "basılınca HIGH" beklersen program ters çalışır.
- **`INPUT_PULLUP` yazmayı unutmak.** Dış direnç yoksa pin yüzer ve okuma rastgele olur.
- **Butonun ucunu 5 V'a bağlamak.** `INPUT_PULLUP` kullanırken diğer ucu GND'ye bağlarsın.
- **Bir basışı birden çok basış saymak.** Gerçek butonlarda kontak titreşimi (bounce) buna neden olur.
- **GND bağlantısını unutmak.** Buton basılsa bile pin LOW'a çekilemez.

## İlgili dersler
- arduino-temelleri:2:1
- arduino-temelleri:2:3

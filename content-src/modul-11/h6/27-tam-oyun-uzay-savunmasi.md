# Tam oyun 1: Uzay savunması
süre: 30

## Merak
Uzay oyunlarında düşman dalgaları zamanla hızlanır, oyuncunun süresi sınırlıdır ve en sonunda ya kazanırsın ya kaybedersin. Hiçbiri yeni bir blok gerektirmiyor: hepsi daha önce öğrendiğin parçalardır. Bu derste onları bir araya getirip süreli ve gittikçe zorlaşan bir oyun yapacaksın.

## Etkinlik
### Hazır olan
Gece gökyüzünde alt tarafta bir gemi var. Ok tuşlarıyla sağa-sola gidiyor, A ile lazer atıyor. Her 800 ms'de bir yukarıdan rastgele bir yerden uzaylı iniyor. Skor 0, can 3. Bir de `hiz` adlı bir değişken var, başlangıçta 0. Lazer ve uzaylıların çarpışma kuralları, can, süre ve zorluk henüz yok.

### Dört iş
| İş | Hangi derste öğrendin |
|---|---|
| Lazer uzaylıyı vurunca skor | 19 |
| Uzaylı gemiye değince can | 9 |
| 30 saniyelik süre | Yeni: `geri sayım` |
| Zamanla hızlanan uzaylılar | Yeni: değişkeni değiştirmek |

### Blokları kur: vurma ve can
1. `bir [Mermi] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını kur. İçine `skoru [10] değiştir`, `[patlama] melodisini çal`, `[diğer sprite] patlayıp yok olsun`, `[bu sprite] sprite'ını sil`.
2. `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını kur. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[diğer sprite] sprite'ını sil`.
3. ↺ bas. Lazerle uzaylıları vur; uzaylılar gemiye değince can azalıyor.

### Blokları kur: süre
4. **Oyun** kategorisinden `geri sayımı [30] saniyeden başlat` bloğunu `oyun başlayınca` içinin en altına ekle. Sahnenin üstünde ortada kalan süre görünür; son 5 saniyede sarıya döner.
5. **Oyun** kategorisinden `süre bitince` olayını kur. İçine `ekranda [Dünya kurtuldu!] yaz, [2] saniye` ve `oyunu bitir: [kazandın]` koy.

### Blokları kur: zorluk
6. **Oyun** kategorisinden `her [4000] ms'de bir` olayını al. İçine **Değişken** kategorisinden `[hiz] değişkenini [5] kadar değiştir` bloğunu tak.
7. Hazır gelen `her [800] ms'de bir` olayını bul. İçindeki `[ufo] hızı x [0] y [rastgele]` bloğunun y kutusuna bir toplama bloğu (`[ ] + [ ]`) koy: soluna eski rastgele sayı bloğunu, sağına `hiz` değişkenini yerleştir. Uzaylılar her 4 saniyede biraz daha hızlı iner.
8. ↺ bas ve tam oyunu oyna. 30 saniye hayatta kalırsan kazanırsın; canın biterse kaybedersin.

Beklenen sonuç: Beş hedefin hepsi ✓. Lazer vuruyor, uzaylı gemiye değince can azalıyor, sayaç 30'dan geriye sayıyor, süre bitince oyun kazanılıyor ve uzaylılar zamanla hızlanıyor.

### Nasıl çalışıyor?
- `süre bitince` olayı, geri sayım 0'a ulaşınca çalışır. Bu olayı yazmazsan oyun süre dolunca kendiliğinden biter (kaybedersin). Biz "süre dolunca kazan" kuralını seçtik.
- `hiz` bir **değişken**dir: bir sayıyı hatırlar. Her 4 saniyede 5 artar. 28. saniyede 35 olur. Uzaylı hızı 20 ile 45 arası rastgele sayıya `hiz` eklenerek hesaplandığı için başlangıçta 20-45, sonda 55-80 civarıdır.
- Aynı `hiz` değişkenini üç olay kullanır: biri başlangıçta sıfırlar, biri zamanla artırır, biri uzaylının hızını hesaplar. Böyle ortak sayılar oyunun "ayar düğmeleri" gibidir.
- Üç kural (vurma, can, süre) bağımsızdır; birini kapatsan diğerleri çalışmaya devam eder.

### Dene
1. Artış miktarını 5'ten 2'ye, sonra 10'a çıkar. Hangisi daha dengeli?
2. Süreyi 60 saniye yap; zorluk artışı yetmeyince oyun sıkıcı oluyor mu?
3. Her 4 saniyede bir ikinci bir uzaylı üreten yeni bir `her [4000] ms'de bir` olayı ekle. Oyun daha kalabalık oluyor mu?
4. Skor 100'e ulaşınca da kazanma kuralı ekle.

### Sık yapılan hatalar
- `hiz` değişkenini başlangıçta 0 yapan hazır bloğu silmek: değişkenin ilk değeri belirsiz kalır ve uzaylı hız hesabı yanlış çıkabilir. O bloğu yerinde bırak.
- Uzaylının hız bloğunda toplama yerine yalnızca `hiz` yazmak: uzaylılar başlangıçta hiç hareket etmez.
- `süre bitince` bloğunu başka bir olayın içine koymak: olaylar yalnız tek başlarına durur.
- Zorluğu çok hızlı artırmak: oyun 10. saniyede oynanamaz hâle gelir. Oyun tasarımı biraz da deneme yanılmadır.

## Konuşalım
Bu oyunun en eğlenceli anı hangisiydi: ilk dakika mı, son 5 saniye mi? Zorluğun zamanla artması neden oyunu daha çok sürükleyici yapıyor?

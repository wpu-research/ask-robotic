# Proje: Hayalet avcısı
süre: 35

## Merak
Bu haftanın hepsi bir arada: sekip duran bir devriye yarasası, seni kovalayan hayaletler, bir de ateş etmek. Hepsini aynı oyunda birleştirince gece bekçisi gibi hissedeceksin. Kendi oyunun mantığını parçalara bölüp tek tek kurma zamanı.

## Etkinlik
### Ne yapacağız?
Gece sahnesinde bir avcı (astronot) ekranın altında. Yalnız sağa-sola yürüyebiliyor ve ekranda kalıyor. Skor 0, can 3 olarak hazır. Sen şunları ekleyeceksin:

| Parça | Hangi derste öğrendin | Ne yapacak? |
|---|---|---|
| Devriye yarasası | 16 | Üstte gidip gelen bir yarasa |
| Kovalayan hayaletler | 17 | Üstten gelip avcıyı takip eden hayaletler |
| Lazer | 19 | A ile ateş, yukarı doğru |
| Vurma kuralı | 19 | Her vuruş 1 puan, 5 puanda kazan |
| Can kuralı | 9 | Düşman avcıya değerse can azalır |

### Blokları kur
1. **Yarasa:** `oyun başlayınca` bloğunun en altına yarasayı kur: `yarasa değişkenini [yeni [Yarasa] sprite'ı, türü [Düşman]] yap`, `yarasa konumu x 20 y 30`, `yarasa hızı x 40 y 0` ve `yarasa [duvar/kenara çarpınca sekmeli]: [evet]`. Yarasa ekranda gidip geliyor. (16. dersteki zamanlayıcı yöntemini de seçebilirsin.)
2. **Hayaletler:** `her [900] ms'de bir` olayı kur. İçine: `hayalet değişkenini [yeni [Hayalet] sprite'ı, türü [Düşman]] yap`; `hayalet konumu x [10 ile 150 arasında rastgele sayı] y [-8]`; `[hayalet], [avci] sprite'ını [15] hızıyla takip etsin`. Hayaletler üstten rastgele yerlerden gelip avcıya doğru süzülüyor.
3. **Lazer:** 19. dersteki gibi `[A] düğmesine [basılınca]` olayıyla lazer çıkar. Lazer `avci x konumu` ve `avci y konumu - 12` noktasında doğsun, `hızı x 0 y -140` olsun, `dünyadan çıkınca silinsin: evet`.
4. **Vurma:** `bir [Mermi] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında `skoru [1] değiştir`, `[patlama] melodisini çal`, `[diğer sprite] patlayıp yok olsun`, `[bu sprite] sprite'ını sil`. Sonra `eğer [skor] ≥ [5] ise` bloğuyla `ekranda [Avcı kazandı!] yaz, [2] saniye` ve `oyunu bitir: [kazandın]` ekle. (`skor` bloğu **Oyun** kategorisinde.)
5. **Can:** `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında `canı [-1] değiştir`, `ekranı [250] ms salla` ve `[diğer sprite] sprite'ını sil`.
6. ↺ bas ve oyna. Hayaletler üstten süzülüyor, sen sağa-sola gidip ateş ediyorsun. 5 hayalet vurunca "Avcı kazandı!" yazıyor.

Beklenen sonuç: Altı hedefin hepsi ✓. Yarasa sekiyor, hayaletler avcıyı takip ediyor, A lazer çıkarıyor, çarpışmalar skor ve can değiştiriyor, 5 puanda oyun kazanılıyor.

### Nasıl çalışıyor?
- Hem yarasa hem hayaletler **Düşman** türünde. Bu yüzden vurma ve can kuralları ikisine de uygulanıyor. Tek kural, iki farklı düşman.
- Hayaletler sahneye yukarıdan giriyor ve takip hızları (15) avcının hızından (80) çok düşük. Böylece oyuncunun kaçacak zamanı var.
- Üç olay (vurma, can, zamanlayıcı) birbirinden bağımsız çalışır. Birini bozmak diğerlerini bozmaz.
- Hayaletler ekranın üstünden avcıya ulaşana kadar yedi saniyeden uzun sürer; ateş etmek için yeterli süre.

### Dene
1. Hayaletin hızını 30 yap ve her 600 ms'de bir üret. Oyun kaç kez daha zor oldu?
2. Hedefi büyüt: kazanma skorunu 5'ten 10'a çıkar ve hayaletleri her 700 ms'de bir üret. Oyun hâlâ dengeli mi, yoksa fazla mı zor oldu?
3. `can bitince` olayına `ekranda [Hayaletler kazandı!] yaz` ve `oyunu bitir: [kaybettin]` ekle.

### Sık yapılan hatalar
- Hayaletin takip bloğunda `avci` yerine `bu sprite` yazmak: hayalet kendini takip eder ve hiç kıpırdamaz.
- Vurma kuralında `diğer sprite`'ı patlatıp `bu sprite`'ı silmeyi unutmak: lazer hedefin içinden geçmeye devam eder.
- `eğer skor ≥ 5` bloğunu çarpışma olayının dışına koymak: oyun hiç bitmeyebilir.
- Hayaletleri çok hızlı yapmak: oyuncunun şansı kalmaz.

## Konuşalım
Bu oyunda en çok hangi parça seni oyalıyor: yarasa mı, hayalet mi, lazer mi? Bir arkadaşın oynasa hangi düşmanı daha zor bulurdu? Neden?

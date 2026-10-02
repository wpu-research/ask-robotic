# Elmayı ye, hayaleti patlat
süre: 20

## Merak
Bir oyunu oyun yapan şey, nesnelerin birbirine dokunduğunda bir şey olmasıdır. Kedi elmaya değince elma yok olur. Kedi hayalete değince bir şeyler patlar. Bilgisayar iki resmin üst üste geldiğini nasıl fark eder? Ve "hangisi hangisine değdi?" sorusunu nasıl cevaplar?

## Etkinlik
Sahnede kedi (Oyuncu), sağ üstte bir elma (Yiyecek) ve sağ altta bir hayalet (Düşman) var. Ok tuşlarıyla kediyi yürüt. Şimdilik hiçbir şey olmuyor.

### Çarpışma olayı
Oyun Atölyesi iki sprite'ın üst üste gelip gelmediğini her kare kontrol eder. Bu kontrol **çarpışma** diye geçer. Sen yalnızca hangi türlerin çarpışınca ne olacağını söylersin.

Çarpışma olayında iki sprite vardır:
- `bu sprite`: Olayın başındaki türden olan, yani ilk sprite. (Bu derste kedi.)
- `diğer sprite`: Çarpılan, ikinci sprite. (Elma ya da hayalet.)

### Blokları kur
1. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` olay bloğunu çalışma alanına bırak.
2. Aynı kategoriden `[bu sprite] sprite'ını sil` bloğunu al ve olayın içine tak. İçindeki `bu sprite` yerine `diğer sprite` bloğunu (aynı kategoride) sürükle. Bu sayede kedi değil, elma silinir.
3. ▶ düğmesine bas ve kediyi elmaya götür. Elma yok olur.
4. İkinci bir olay bloğu getir: `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca`.
5. İçine `[diğer sprite] patlayıp yok olsun` bloğunu koy.
6. ↺ düğmesine bas ve bu kez hayaleti ziyaret et. Hayalet parçacıklarla patlar.
7. İstersen elma olayına **Ses** kategorisinden `[puan] melodisini çal` bloğunu da ekle.

Beklenen sonuç: Elmaya değince elma kaybolur. Hayalete değince hayalet patlayarak kaybolur.

### Nasıl çalışıyor?
- Olay bloğundaki türler sprite'ın **adını** değil **türünü** söyler. Aynı türden birçok sprite varsa hepsi için çalışır.
- Çarpışma olayı iki sprite üst üste geldiği anda **bir kez** çalışır. Kedi elmanın üstünde dursa bile her karede tekrar tekrar çalışmaz.
- `patlayıp yok olsun` bloğu `sil` bloğunun efektli hâlidir. Sprite'ı kaldırır ve parçacıklar saçar.

### Dene
1. Kediyi sil: `bu sprite`'ı sil ve ne olduğunu gör. Sonra düzelt.
2. Hayalet yerine kedi patlasın. Hangi bloğu değiştirmelisin?
3. Sahneye ikinci bir elma ekle (**Değişken oluştur...** ile `elma2`, `yeni [Elma] sprite'ı, türü [Yiyecek]` ve bir konum). Aynı olay iki elma için de çalışıyor mu?

### Sık yapılan hatalar
- `diğer sprite` yerine `bu sprite` koyarsan yanlış sprite silinir. Çoğu zaman kedi silinir ve oyun biter gibi görünür.
- Sprite türü yanlışsa olay hiç çalışmaz. Elma türü **Yiyecek**, hayalet türü **Düşman** olmalı.
- Olay bloğunu `oyun başlayınca` bloğunun içine koyma. Olay bloğu hep çalışma alanında tek başına durur.

## Konuşalım
Çarpışma yalnız "dokunma" demek değildir: iki şeyin birbirine değmesi bir oyunda nelere yol açabilir? Sen bir oyun tasarlasaydın hangi iki sprite'ın çarpışmasından ne çıksın isterdin?

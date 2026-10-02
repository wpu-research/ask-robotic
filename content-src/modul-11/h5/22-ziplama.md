# Zıplama: A ile zıpla
süre: 20

## Merak
Mario'nun zıpladığını biliyorsun. Peki havadayken tekrar basarsan ne olur? Birçok platform oyununda hiçbir şey olmaz, çünkü kahraman havadayken yeni bir zıplama başlatamaz. Bunu kontrol eden basit bir soru var: "Şu an bir şeyin üstünde duruyor muyum?" Bu derste o soruyu sorduracaksın.

## Etkinlik
Önceki derste kurduğun sahne hazır geliyor: zemin, kahraman, yerçekimi ve sağa-sola yürüme. Kahraman ilk başta zemin karosunun üstünde duruyor. Henüz zıplayamıyor.

### Zıplama aslında nedir?
Zıplamak, kahramanın y hızına ani bir **yukarı** değer vermektir. y ekseni aşağı doğru arttığı için yukarı hız **eksi** sayıdır. Yerçekimi bu hızı yavaş yavaş azaltır, kahraman tepe noktasında durur ve geri düşer.

### Blokları kur
1. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` bloğunu al ve çalışma alanına bırak.
2. **Hareket** kategorisinden `[kahraman] hızı x [30] y [0]` bloğunu al ve olayın içine tak. y hızı kutusuna -250 yaz. x hızı kutusuna **Sprite** kategorisinden `[kahraman] [x hızı]` bloğunu tak. Böylece zıplarken yatay hızı korumuş olursun.
3. ↺ bas. Boşluk (A) tuşuna bas. Kahraman zıplıyor.
4. Havadayken hızlı hızlı A'ya bas. Kahraman her basışta yeniden fırlıyor ve ekranın tepesine kadar çıkıyor. Bu, istemediğimiz bir "uçma".
5. Düzelt: **Mantık** kategorisinden `eğer ... ise ...` bloğunu al, hız bloğunu içine al ve eğer bloğunu olayın içine koy. Koşul olarak **Sprite** kategorisinden `[kahraman] [alttan bir duvara] dokunuyor mu?` bloğunu tak.
6. **Ses** kategorisinden `[zıplama] melodisini çal` bloğunu da `ise` kolundaki hız bloğunun altına ekle.
7. ↺ bas ve havadayken A'ya bas. Artık kahraman havada ikinci kez zıplamıyor.

Beklenen sonuç: A'ya basınca kahraman yaklaşık 60 piksel yükseliyor ve geri düşüyor; havadayken A işe yaramıyor; zıplarken ses çalıyor.

### Nasıl çalışıyor?
- `alttan bir duvara dokunuyor mu?` sorusu, kahramanın hemen altında duvar karosu varsa "doğru" der. Kahraman zeminde ya da bir platformun üstündeyse doğru, havadaysa yanlıştır.
- Başlangıç hızı -250, ivme 520 olduğu için yükselme yaklaşık 250 x 250 / (2 x 520) = 60 piksel eder. Zıplama yaklaşık bir saniye sürer.
- Zıplama gücünü artırmak istersen y hızını -300 yap: yükselme yaklaşık 86 piksele çıkar.
- `eğer` bloğu olmadan, her A basışı yeni bir hız verir; kahraman havada da hızlanır.

### Dene
1. Zıplama hızını -150, sonra -350 yap. Platform oyunu için hangi değer iyi? Neden?
2. Aynı bloğu `[yukarı ↑] düğmesine [basılınca]` olayına da kopyala. Artık iki tuşla zıplıyorsun.
3. Zıpladığında kahramana bir konuşma balonu ver: `[kahraman] [Hop!] desin, [1] saniye` bloğunu ekle.

### Sık yapılan hatalar
- y hızına pozitif bir sayı yazmak: kahraman yukarı değil aşağı gider ve zemine gömülmeye çalışır.
- `eğer` bloğunu unutmak: kahraman uçar.
- Zıplama bloğunu `oyun başlayınca` içine koymak: zıplama yalnız oyunun başında bir kez olur. Tuşa bağlı olay gerekir.
- Zıplama sırasında yatay hızı sıfırlamak: kahraman olduğu yerde dik çıkıp inen bir asansör gibi olur. Yatay hız için kahramanın kendi `x hızı`'nı kullan.

## Konuşalım
Bazı oyunlarda çift zıplama vardır; sence bunu bloklarla nasıl yapardın? "Zıplama sayısını" saklamak için neye ihtiyacın olurdu?

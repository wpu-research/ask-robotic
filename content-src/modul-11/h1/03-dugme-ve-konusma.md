# A düğmesine basınca değiş ve konuş
süre: 20

## Merak
Oyunlarda bazı şeyler sürekli olur, bazı şeyler ise yalnızca bir an için olur: zıplamak, ateş etmek, konuşmak. Bunlar bir düğmeye basıldığı anda gerçekleşir. Bilgisayara "A'ya bastığım anda şunu yap" demeyi öğrenelim. Kedimiz hem dönüşsün, hem konuşsun.

## Etkinlik
Kedi, ok tuşlarıyla yürüyor ve ekranda kalıyor. Bu derste ona üç yeni yetenek vereceksin.

### Olay kavramı
Bazı bloklar, bir şey **olunca** çalışan bloklardır. `oyun başlayınca` bunlardan biriydi. Şimdi yeni bir olay öğreniyoruz: düğmeye basılınca. Olay blokları altına bağladığın blokları yalnız o olay gerçekleşince çalıştırır. Olay blokları başka bloğun altına takılmaz; çalışma alanında tek başına durur.

### Blokları kur
1. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` bloğunu çalışma alanına bırak. Soldaki açılır listeden **A**'yı seç. Bu blok `oyun başlayınca` bloğunun yanında, ayrı bir blok olarak durur.
2. **Sprite** kategorisinden `[kedi] resmi [resim]` bloğunu al ve A olayının içine tak. Resim olarak **Robot**'u seç. Kedi yerine `kedi` değişkenini koymayı unutma.
3. Aynı olayın içine `[kedi] [Merhaba!] desin, [2] saniye` bloğunu ekle. Metni değiştirip "Merhaba, ben robotum!" yazabilirsin.
4. ▶ düğmesine bas ve A tuşuna (Boşluk ya da Z) bas. Kedi robota dönüşür ve konuşma balonu çıkar.
5. Şimdi yüz yönünü ayarlayalım. Bir `[sol ←] düğmesine [basılınca]` olayı ekle ve içine `[kedi] [sola] baksın` bloğunu koy.
6. Bir `[sağ →] düğmesine [basılınca]` olayı daha ekle. İçine `[kedi] [sağa] baksın` bloğunu koy.
7. ↺ düğmesine bas. Sol tuşuna basınca kedi sola, sağ tuşuna basınca sağa bakar.

Beklenen sonuç: A'ya basınca kedi robota dönüşür ve konuşur. Sola yürürken kedinin yüzü sola döner.

### Nasıl çalışıyor?
- Her olay bloğu ayrı çalışır. Birden fazla düğme olayı yazabilirsin, hepsi aynı anda bekler.
- Düğme olayı **bir kez** çalışır: düğmeye bastığın an. Basılı tutarsan tekrar tekrar çalışmaz.
- `[kedi] [sola] baksın` bloğu resmi yatay olarak çevirir. Başka resim çizmek zorunda kalmazsın.
- Konuşma balonu birkaç saniye sonra kendiliğinden kaybolur.

### Dene
1. `[A] düğmesine [bırakılınca]` olayı ekle. Kedi geri kediye dönüşsün: resim olarak **Kedi** seç.
2. B düğmesi için ayrı bir olay yaz: kedi ninja olsun (resim olarak **Ninja**) ve "Hiyaa!" desin.
3. Konuşma süresini 5 saniyeye çıkar ve ne olduğunu gözle.

### Sık yapılan hatalar
- Olay bloğunun içine bir şey takmazsan hiçbir şey olmaz.
- Düğme olaylarında `bu sprite` kullanırsan en son oluşturulan sprite etkilenir. Bu derste tek sprite var ama yine de `kedi` değişkenini kullan.
- Yön bloğunu yürüme bloğunun içine koyma. Yürümeyi tuş hareketi zaten sağlıyor. Yönü ayrı olaylar belirler.

## Konuşalım
Sence oyuncunun hangi hareketleri sürekli (tuşa basılı tutulduğu sürece), hangileri tek seferlik (bastığı an) olmalı? Zıplamak için hangisini seçerdin?

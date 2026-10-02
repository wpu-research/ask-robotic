# A, B ve A+B düğmeleri
süre: 20

## Merak
Kapı zilinin düğmesine bastığında ne olur? Zil çalar. Zil kendiliğinden çalmaz; birinin basmasını bekler. Bilgisayarlarda böyle "bir şey olunca şunu yap" kuralına olay denir. Kartın A ve B düğmeleriyle ilk olay bloklarını yazacaksın.

## Etkinlik
### Olay nedir?
Şimdiye kadar programlar kendi başına baştan sona çalıştı. Bu derste ise kart **bekler**. Sen bir düğmeye basınca, o düğmenin bloğunun içindeki işler yapılır. Bu "bir şey olunca çalışan" bloklara olay bloğu denir.

**Giriş** kategorisindeki **düğme [A] [basılınca]** bloğu bir başlık bloğudur, **başlangıçta** gibi. İçinde iki liste vardır:

- Düğme: **A**, **B** ya da **A+B**.
- Ne zaman: **basılınca**, **bırakılınca** ya da **uzun basılınca**.

### Program: duygu düğmeleri
Editörde üç tane **düğme** bloğu hazır duruyor: A, B ve A+B için. Hepsi boş. Sen içlerini dolduracaksın.

1. **Temel** kategorisinden **simgeyi göster** bloğunu birinci bloğun (A) içine sürükle. Listeden **mutlu yüz** seç.
2. İkinci bloğa (B) **simgeyi göster** koy, listeden **üzgün yüz** seç.
3. Üçüncü bloğa (A+B) **simgeyi göster** koy, listeden **kalp** seç.
4. Üçüncü bloğun ilk açılır listesinin **A+B** olduğundan emin ol.
5. ▶ **Çalıştır**.
6. Sanal kartın A düğmesine tıkla, sonra B'ye, sonra alttaki A+B düğmesine.

### Beklenen sonuç
A'ya basınca mutlu yüz, B'ye basınca üzgün yüz görünür. A+B'ye basınca kalp çıkar. Dört hedef de ✓ olmalı.

### Nasıl çalışıyor?
- Program çalışırken olay blokları sessizce **bekler**. Düğmeye basılınca o bloğun içi yukarıdan aşağıya çalışır, bitince yine beklemeye döner.
- Aynı anda hem A hem B basılı olduğunda yalnızca **A+B** olayı çalışır; A ve B'nin ayrı blokları çalışmaz.
- **basılınca** düğmeye bastığın an, **bırakılınca** parmağını çektiğin an çalışır. **uzun basılınca** düğmeyi basılı tutmaya başladıktan bir saniye sonra çalışır.
- Olaylar birbirinden bağımsızdır. Bir program içinde istediğin kadar olay bloğu bulunabilir.

### Dene
1. A bloğunu **basılınca** yerine **bırakılınca** yap. Mutlu yüz ne zaman çıkıyor?
2. B bloğunun içine ikinci bir blok ekle: **bekle 1000 ms** ve altına **ekranı temizle**. Üzgün yüz bir saniye sonra söner.
3. A düğmesine basılı tut ve bir saniye sonra bırak. Hangi blok ne zaman çalıştı? Gözlemini arkadaşına anlat.

### Sık yapılan hatalar
- **Düğme listesini değiştirmeyi unutmak.** İki blokta da A seçili kalırsa iki blok da A'ya tepki verir; B'ye basınca hiçbir şey olmaz.
- **A+B yerine birbiri ardına basmak.** A'ya, sonra B'ye ayrı ayrı basmak A+B olayını üretmez. İkisine aynı anda basmak için sanal kartın altındaki **A+B** düğmesini kullan.
- **Bloğu başlık bloğunun dışında bırakmak.** Olay bloğunun dışına koyduğun **simgeyi göster** hiçbir zaman çalışmaz. Soluk görünür.

## Konuşalım
Günlük hayatta hangi aletler bir düğmeye basılınca çalışır? Bir oyun konsolundaki düğmeleri kartın A, B ve A+B düğmeleriyle karşılaştırırsan sence en çok neye ihtiyaç duyarsın?

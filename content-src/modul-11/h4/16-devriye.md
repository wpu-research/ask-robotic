# Devriye: düşman gidip gelir
süre: 20

## Merak
Bir oyunda nöbetçi bir yarasa hep aynı koridorda gidip gelir. Kimse ona "şimdi dön" demez, ama tam zamanında döner. Bu hafta düşmanlara küçük bir "zekâ" vereceğiz. İlk adım en basiti: kendi ritmiyle gidip gelen bir devriye.

## Etkinlik
Sahnede lacivert bir arka plan ve bir yarasa var. Yarasa sağa doğru uçuyor ve birkaç saniye sonra ekrandan çıkıp kayboluyor. Başlangıç projesi hazır gelir. Sağ taraftaki Hedefler panelinde işlerini yaptıkça kutular ✓ olur.

### Düşman "tür"ü
Yarasa `Düşman` türünde bir sprite. Tür bir etikettir: ileride "düşmana çarpınca can kaybet" gibi kurallar yazarken türe göre konuşacağız. Şimdilik sadece yarasanın hareketine bakıyoruz.

### Blokları kur
1. Etkinliği aç ve ▶ düğmesine bas. Yarasa sağa gidiyor ve ekrandan çıkıyor. Bunu ■ ile durdur.
2. **Oyun** kategorisinden `her [1000] ms'de bir` bloğunu al ve çalışma alanına bırak. Sayıyı 1500 yap. (1000 ms = 1 saniye, yani 1500 ms bir buçuk saniyedir.)
3. **Hareket** kategorisinden `[bu sprite] [x (yatay)] hızını ters çevir` bloğunu al ve `her 1500 ms'de bir` bloğunun içine tak. `bu sprite` yerine **Değişken** kategorisinden `yarasa` bloğunu koy. Listede **x (yatay)** seçili kalsın.
4. ↺ düğmesine bas ve izle. Yarasa bir buçuk saniye sağa gidiyor, sonra sola dönüyor, sonra yine sağa.

Beklenen sonuç: Yarasa 6 saniye sonra başladığı yere (x yaklaşık 40) dönmüş oluyor. Hedeflerin üçü de ✓ olur.

### Nasıl çalışıyor?
- Yarasanın hızı x yönünde 40. Bir buçuk saniyede 40 x 1,5 = 60 piksel yol alır.
- `ters çevir` bloğu hızın işaretini değiştirir: 40 olan hız -40 olur, -40 olan hız 40 olur.
- `her ... ms'de bir` bloğu, o sürede bir kez çalışır ve bu hep tekrarlanır. Bloğun içindeki işler her seferinde yapılır.
- Gidiş ve dönüş süreleri eşit olduğu için yarasa 3 saniyede bir başlangıç noktasına döner.
- Bu devriye "sekme" ayarından farklıdır: duvar ya da kenar gerekmez, düşmanın kendi zamanlayıcısı karar verir.

### Dene
1. Zamanlayıcıyı 1000 ms yap. Yarasa kaç piksel yol gidiyor? Hesapla, sonra ▶ ile kontrol et.
2. Başlangıçtaki hız bloğunu `hızı x 40 y 20` yap. Yarasa çapraz uçuyor. Devriyede geri dönmesi için `[yarasa] [y (dikey)] hızını ters çevir` bloğunu da zamanlayıcıya ekle.
3. Yarasanın gittiği yöne bakmasını sağla: zamanlayıcıya `eğer [yarasa x hızı] > [0] ise [yarasa] [sağa] baksın değilse [yarasa] [sola] baksın` kur. Önce hızı ters çevir, sonra bakışı seç; bu sıra önemli.

### Sık yapılan hatalar
- Zamanlayıcının içine `hızı x 40 y 0` yazarsan yarasa hiçbir zaman dönmez, çünkü hız her seferinde yine 40 olur. Ters çevirmek için `ters çevir` bloğu gerekir.
- `ters çevir` bloğunda **y (dikey)** seçiliyse yatay hız hiç değişmez.
- Blok değişiklikleri çalışan oyuna yansımaz. Önce ↺ düğmesine bas.
- Zamanlayıcıyı 50 ms'den küçük yapamazsın.

## Konuşalım
Gidiş ve dönüş süreleri farklı olsaydı (örneğin 1 sn gidip 2 sn dönseydi) yarasa ne olurdu? Gerçek bir oyunda oyuncu devriye düzenini fark edince bunu nasıl kullanır?

# Mesaj gönder, mesaj al
süre: 20

## Merak
Telsizle konuşan iki kişi aynı kanala ayarlanmak zorundadır. Kanal farklıysa ne kadar bağırırsan bağır, öteki duymaz. Mikro Kart'ların da bir radyosu var ve kanalın adı **grup**. Bu derste iki kartı aynı gruba ayarlayıp birinden ötekine mesaj yollayacaksın.

## Etkinlik
### İki kart
Radyo, iki kartla çalışır. Bu etkinlikte editörde iki kart yan yana görünür (kendiliğinden gelmezse sağdaki **Radyo** bölümünde **İkinci kart ekle** düğmesine bas). İki kart da **aynı programı** çalıştırır. Yani yazdığın program hem gönderen hem alan kartta çalışır. Sanal portalda gerçek bir donanım ya da uzaklık yoktur; mesaj çok kısa bir an (yaklaşık 10 milisaniye) sonra öteki karta ulaşır.

### Yeni bloklar
Hepsi **Radyo** kategorisinde:
- **radyo grubunu [1] yap**: kartın hangi gruba katılacağını söyler. Grup 0 ile 255 arasında bir sayıdır. Aynı gruptaki kartlar birbirini duyar.
- **radyoyla sayı gönder [1]**: gruptaki öteki karta bir sayı yollar.
- **radyo mesajı alınınca**: bir mesaj gelince çalışan başlık.
- **alınan [sayı]**: gelen mesajdaki sayıyı verir. Listeden **yazı**, **ad** ve **değer** de seçilebilir; onları sonraki derste göreceksin.

### Adım adım
Editörde **başlangıçta**, iki düğme başlığı ve **radyo mesajı alınınca** hazır.

1. **başlangıçta** içine **radyo grubunu [1] yap** bloğunu koy.
2. **düğme [A] [basılınca]** içine **radyoyla sayı gönder [1]** koy. **düğme [B] [basılınca]** içine aynı bloğu koyup sayıyı **2** yap.
3. **radyo mesajı alınınca** içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy. (Paletinde iki **eğer** bloğu var; "değilse" kolu olanı al.)
4. Koşul için karşılaştırma bloğunu **eğer**'in koşuluna tak. Sol tarafa **Radyo** kategorisinden **alınan [sayı]**, sağ tarafa **1** yaz. İşaret **=** olsun.
5. **ise** koluna **simgeyi göster [kalp]**, **değilse** koluna **simgeyi göster [mutlu yüz]** koy.
6. ▶ **Çalıştır**. Kart 1'in **A** düğmesine bas. Sonra **B**'ye bas.

### Beklenen sonuç
Kart 1'de **A**'ya basınca Kart 2'nin ekranında kalp, **B**'ye basınca mutlu yüz görünür. Gönderen kart kendi mesajını almaz: Kart 1'in ekranı değişmez. Radyo bölümündeki **Son alınan:** kutusu alınan sayıyı gösterir. Beş hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Kart 1 **A** ile sayıyı yollar. Aynı grupta olan Kart 2'ye 10 ms sonra ulaşır. Kart 2'de **radyo mesajı alınınca** başlığı çalışır.
- **alınan [sayı]** bloğu başlığın içinde, o an gelen mesajı okur.
- Kart 2 de aynı programı çalıştırdığı için Kart 2'nin **A**'sına basarsan Kart 1'de kalp görünür. Yani iki taraf da yollayıp alabilir.
- Program grup bloğunu koymasan bile kartlar başlangıçta 1. gruptadır. Yine de grubu açıkça yazmak iyi alışkanlıktır.

### Dene
1. Kart 2'nin grubunu değiştir: Radyo bölümünde **Kart 2 grubu** listesinden **5** seç. Kart 1'den mesaj yolla. Ne oluyor? Sonra listeyi **Programdan**'a geri al.
2. Radyo bölümünden elle mesaj yolla: tür **sayı**, mesaj **1**, **Kart 2'ye gönder**. Aynı sonucu görüyor musun?
3. Programına üçüncü bir mesaj ekle: **A+B** düğmesi **3** göndersin, Kart 2 üzgün yüz göstersin.

### Sık yapılan hatalar
- **İki kartı farklı gruba koymak.** Mesaj hiç ulaşmaz. Hata mesajı da çıkmaz, çünkü kart kimin dinlediğini bilmez.
- **Alma kodunu yazmamak.** Gönderen çalışsa bile **radyo mesajı alınınca** içi boşsa alan kart hiçbir şey yapmaz.
- **Sayıyı yanlış karşılaştırmak.** **alınan [sayı]** değeri **1** ile eşit mi diye bakmak için karşılaştırma bloğundaki işaret **=** olmalı.

## Konuşalım
Telsizde kanal seçmek ile kartta grup seçmek aynı şey mi? Mesajını sadece arkadaşının duymasını nasıl sağlarsın?

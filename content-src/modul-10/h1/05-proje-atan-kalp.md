# Proje: Atan kalp
süre: 30

## Merak
Doktor kalbini dinlerken "tup-tup, tup-tup" duyar: iki kısa vuruş, sonra küçük bir dinlenme. Bu hafta öğrendiklerinle kartın ekranında gerçek bir kalp atışı yapabilirsin. Hem de ilk anda kısa bir selam yazısıyla!

## Etkinlik
### Proje: Atan kalp
Bu hafta öğrendiğin her şeyi birleştireceksin: yazı göstermek, simge göstermek, bekleme, tekrar ve ekran parlaklığı.

**Hedefler:**
- Kart açılınca kısa bir yazı kaysın.
- Ekran parlaklığı biraz kısılsın.
- Sonra kalp sonsuza kadar "tup-tup" diye atsın: büyük kalp, küçük kalp, büyük kalp, küçük kalp ve sonra biraz dinlenme.

### Yeni blok: sonsuza kadar
**Temel** kategorisindeki **sonsuza kadar** bloğu, içindeki blokları durmadan baştan tekrarlar. Sen **Durdur** düğmesine basana kadar sürer. Atan kalp gibi bitmeyen işler için birebir.

### Yeni blok: ekran parlaklığını yap
**LED** kategorisindeki **ekran parlaklığını [255] yap** bloğu bütün LED'lerin parlaklığını 0 ile 255 arasında ayarlar. 255 en parlaktır. 0'da hiçbir şey görünmez. Bir yazı göstermeden önce ışığı biraz kısmak gözünü yormaz.

### Adım adım
Editörde **başlangıçta** ve **sonsuza kadar** blokları hazır duruyor.

1. **başlangıçta** bloğunun içine **LED** kategorisinden **ekran parlaklığını [255] yap** bloğunu koy. Sayıyı 200 yap.
2. Altına **Temel** kategorisinden **yazıyı göster** bloğunu tak. Yazıyı "Sev" yap.
3. **sonsuza kadar** bloğunun içine sırayla şu blokları tak:
   - **simgeyi göster** (kalp), **bekle** 150 ms
   - **simgeyi göster** (küçük kalp), **bekle** 100 ms
   - **simgeyi göster** (kalp), **bekle** 150 ms
   - **simgeyi göster** (küçük kalp), **bekle** 400 ms
4. ▶ **Çalıştır**.

### Beklenen sonuç
Önce ekranda kısa bir "Sev" yazısı kayar (yaklaşık 2 saniye). Sonra kalp iki kez hızla atar, kısa bir dinlenme olur ve yeniden başlar. Beş hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **başlangıçta** bir kez çalışır, bittikten sonra **sonsuza kadar** devreye girer.
- Kalp atışı: büyük kalp, küçük kalp, büyük kalp, küçük kalp. Aradaki bekleme süreleri ritmi belirler. Toplam yaklaşık 0,8 saniye.
- **sonsuza kadar** her turun sonunda çok kısa bir an soluklanır, bu yüzden kartı yormaz.
- Süreleri değiştirerek heyecanlı bir kalp ya da uyuyan bir kalp yapabilirsin.

### Dene
1. Beklemeleri kısaltarak kalbi hızlandır. Koşan birinin kalbi gibi olsun.
2. Beklemeleri uzatarak yavaşlat. Uyuyan birinin kalbi gibi.
3. Yazı olarak kendi adının ilk harfini yaz. Tek harf kaymaz, ortada durur. Fark ne?
4. İstersen **başlangıçta** bloğunun içindeki parlaklığı 20 yapıp kalbin nasıl göründüğüne bak. Sonra 255'e geri al.

### Sık yapılan hatalar
- **Blokları yanlış yere koymak.** Yazı bloğu **başlangıçta**, kalp blokları **sonsuza kadar** içinde olmalı. Yazıyı sonsuza kadar bloğuna koyarsan her turda yeniden kayar.
- **Bekleme koymamak.** Büyük ve küçük kalp arasında bekleme yoksa kalbin atışını göremezsin.
- **Parlaklığı 0 yapmak.** Parlaklık 0 olursa ekran hiçbir şey göstermez. Program bozulmadı; sayıyı yükselt.

## Konuşalım
Projende hangi süreleri seçtin? Gerçek bir kalp atışı ile senin atan kalbin arasında ne kadar fark var? Bu kalbi, bir arkadaşına nasıl yeniden programlanabilir bir hediye haline getirirdin?

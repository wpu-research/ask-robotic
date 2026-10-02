# Sayaç ve değişken
süre: 25

## Merak
Bir otobüsün kapısında yolcu sayan bir görevli düşün. Her yolcuda parmağını bir kez kıvırıyor ve sayıyı aklında tutuyor. Peki kart sayıyı nerede tutar? Aklında değil, bir kutuda: değişken.

## Etkinlik
### Değişken: etiketli kutu
**Değişken**, üzerinde ad yazan bir kutudur. İçinde bir sayı ya da yazı saklar. Kutuya yeni değer koyabilirsin, içindekine bakabilirsin, içindeki sayıyı artırıp azaltabilirsin.

Editörde **sayi** adında bir değişken zaten hazır. Kendi projelerinde yeni değişken yapmak için **Değişken** kategorisinde **Değişken oluştur...** düğmesine tıklarsın, bir ad yazarsın.

**Değişken** kategorisindeki bloklar:

- **sayi değerini [0] yap:** kutuya yeni bir sayı koyar.
- **sayi değerine [1] ekle:** kutudaki sayıyı verilen kadar artırır (eksi sayı yazarsan azaltır).
- **sayi:** kutunun içindeki sayıyı verir. Başka bir bloğun deliğine takılır.

### Program: ziyaretçi sayacı
Editörde **başlangıçta** ve üç **düğme** (A, B, A+B) blokları hazır.

1. **başlangıçta** içine **Değişken** kategorisinden **sayi değerini [0] yap** bloğunu koy. Sıfır olduğundan emin ol.
2. A bloğunun içine **sayi değerine [1] ekle** bloğunu tak.
3. Altına **Temel** kategorisinden **sayıyı göster [0]** bloğunu ekle.
4. Bu bloğun içindeki 0'ı sil: **Değişken** kategorisindeki **sayi** bloğunu tutup 0'ın üstüne bırak.
5. B bloğunu aynı şekilde yap, ama **sayi değerine [-1] ekle** kullan.
6. A+B bloğunun içine **sayi değerini [0] yap** koy, altına **sayıyı göster sayi** ekle.
7. ▶ **Çalıştır**. A'ya üç kez bas, sonra B'ye bir kez, sonra A+B'ye bas.

### Beklenen sonuç
A'ya her basışta ekranda 1, 2, 3 görünür. B'ye basınca 2'ye iner. A+B ekranda 0 gösterir ve sayacı sıfırlar. Dört hedef de ✓ olmalı.

### Nasıl çalışıyor?
- **başlangıçta** bloğu sayacı sıfırlar. Böylece sayaç her çalıştırmada açıkça 0'dan başlar.
- **sayi değerine 1 ekle** kutudaki sayıyı 1 artırır. Önce eski değeri okur, 1 ekler, yeni değeri geri koyar.
- **sayıyı göster [sayi]** önce kutuya bakar, içindeki sayıyı alır, ekranda gösterir. Kutunun adı ekrana yazılmaz, içindeki sayı yazılır.
- Sayı 10'a ulaşınca ekranda iki basamak olur ve sayı kayar. Eksi sayılar da eksi işaretiyle birlikte kayar.
- **JavaScript** sekmesinde en üstte `let sayi = 0;` satırını göreceksin. Değişkenin kutusu orada oluşturuluyor.

### Dene
1. A'yı 12 kez art arda bas. Ekranda iki basamaklı sayı nasıl görünüyor?
2. B'ye başlangıçta basarsan sayaç ne yapar? Sıfırın altına inebilir mi?
3. **sayi değerine [1] ekle** bloğundaki 1'i 5 yap. Sayaç beşer beşer sayıyor.

### Sık yapılan hatalar
- **Sayıyı göstermeyi unutmak.** Değişken kutusu değişir ama bir **sayıyı göster** bloğu olmazsa ekranda bir şey görmezsin.
- **Sıfırlamayı başlangıçta yapmamak.** Kart, hiç değer verilmemiş bir değişkeni 0 sayar. Yine de başlangıçta açıkça 0 yazmak programı okuyanın neyle başladığını görmesini sağlar.
- **Çok hızlı basmak.** Sayıyı göstermek bir süre alır. Çok hızlı art arda basarsan basışların bir kısmı kuyrukta bekler ya da atlanabilir. Biraz yavaş bas.

## Konuşalım
Değişken olmasaydı kart sayıyı nasıl hatırlardı? Kendi hayatından, değerini sürekli değiştirdiğin bir şey düşün: oyundaki puanın ya da cebindeki para gibi. Onu hangi adla bir kutuya koyardın?

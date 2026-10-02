# Ezgiler ve listeler
süre: 22

## Merak
Bir şarkının bütün notalarını tek tek blokla yazmak çok uzun sürer. Kartın içinde hazır ezgiler var: tek blokla bütün şarkı çalar. Peki kendi ezgini yazmak istersen? O zaman notaları bir **liste** içine koyup hepsini sırayla çaldırabilirsin. Bu ders ikisini de öğretiyor.

## Etkinlik
### Hazır ezgiler
**Müzik** kategorisindeki **ezgiyi çal [Neşe ezgisi]** bloğu bir ezgiyi baştan sona çalar ve bitene kadar bekler. Listede dokuz ezgi var: **Neşe ezgisi**, **Yıldız ezgisi**, **Zafer**, **Üzgün**, **Alarm**, **Yukarı çıkan**, **Aşağı inen**, **Neşeli**, **Kuş cıvıltısı**. Tempo 120 iken **Yıldız ezgisi** 8 saniye, **Zafer** 2,75 saniye, **Alarm** 1,6 saniye sürer.

### Liste nedir?
Liste, birkaç değeri sıralı olarak tutan bir kutudur. Her öğenin bir numarası vardır ve **numaralar 0'dan başlar**: ilk öğe 0, ikinci öğe 1, üçüncü öğe 2... Biz bu derste notaların frekanslarını bir listeye koyacağız.

### Yeni bloklar
- **Müzik** kategorisindeki **nota [Do]** bloğu notanın frekansını (Hz) bir sayı olarak verir. Mesela **nota [Mi]** = 330.
- **Müzik** kategorisindeki **[440] Hz sesini [1/4] vuruş çal** bloğu, notanın adı yerine sayı ile çalar. Yanına **nota [Do]** gibi bir değer koyabilirsin.
- **Liste** kategorisindeki **liste oluştur** bloğu bir liste yapar. Üstündeki çarkla öğe sayısı artırılır.
- **Döngü** kategorisindeki **[öğe] ile, [liste] listesinin her öğesi için** bloğu listedeki her öğeyi sırayla alıp içindeki blokları o öğe için çalıştırır.
- **Değişken** kategorisindeki **[ezgi] değerini [0] yap** ve değişken bloğu (adı **ezgi** olan) listeyi saklamak içindir.

### Adım adım
Editörde **başlangıçta**, **düğme [A] [basılınca]** ve **düğme [B] [basılınca]** blokları hazır.

1. **Değişken** kategorisinde **Değişken oluştur...** düğmesine bas. Adı **ezgi** yap (Türkçe harf kullanmamak en iyisidir).
2. **başlangıçta** içine **ezgi değerini [0] yap** bloğunu koy. Sıfırın yerine **Liste** kategorisinden **liste oluştur** bloğunu tak. Listeye dört yer aç.
3. Dört yerin her birine **Müzik** kategorisinden **nota [Do]** bloğu tak: sırayla **Do**, **Mi**, **Sol**, **Tiz Do**.
4. **düğme [A] [basılınca]** içine **ezgiyi çal [Neşe ezgisi]** bloğunu koy, listeden **Yıldız ezgisi** seç.
5. **düğme [B] [basılınca]** içine **[öğe] ile, [liste] listesinin her öğesi için** bloğunu koy. Liste yerine **ezgi** değişkenini tak.
6. Döngünün içine **[440] Hz sesini [1/4] vuruş çal** bloğunu koy. Frekans yerine **öğe** değişkenini tak (Değişken kategorisinden alabilirsin).
7. ▶ **Çalıştır**. Önce **B**'ye bas, sonra **A**'ya bas.

### Beklenen sonuç
**B**'ye basınca dört nota çalar: 262, 330, 392 ve 523 Hz. **A**'ya basınca Yıldız ezgisi sekiz saniye boyunca çalar. Üç hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **başlangıçta** bir kez çalışır ve listeyi yapar. Bu yüzden B'ye her basışta liste baştan kurulmaz.
- Döngü listeden sırayla bir öğe alır, **öğe** değişkenine koyar ve içindeki notayı çalar. Dört öğe olduğu için dört kez döner.
- Kod sekmesinde döngü `for (oge of ezgi)` biçiminde görünür. Kod sekmesinde değişken adlarındaki Türkçe harfler ASCII karşılığıyla yazılır (ö yerine o).
- A'ya basıp ezgi çalarken B'ye de basarsan iki ezgi birlikte çalmaya çalışır. Kartın tek bir hoparlörü vardır; yeni çalan ses öncekinin yerini alır.

### Dene
1. Listeye dört yerine sekiz nota koy ve kendi ezgini bul.
2. **tempoyu [160] yap (vuruş/dk)** bloğunu döngüden önce koy. Ezgin hızlandı mı?
3. Başka bir hazır ezgiyi dene: **Kuş cıvıltısı**. Duyduğun şeyi anlat.
4. **Liste** kategorisindeki **[ezgi] listesinin uzunluğu** bloğunu **sayıyı göster** içine koy. Ekranda 4 görmelisin.

### Sık yapılan hatalar
- **Listeyi başlangıçta oluşturmamak.** Liste boşsa döngü hiç dönmez ve ses çıkmaz.
- **Nota adını doğrudan listeye yazmak.** Listeye **nota [Do]** gibi frekans blokları koyduk. Çünkü **Hz sesini çal** bloğu sayı bekler.
- **Numarayı 1'den başlatmak.** Listelerde ilk öğenin numarası 0'dır.

## Konuşalım
Bir şarkıdaki notaları listeye koymak neden bloklarla tek tek yazmaktan daha kullanışlı? Aynı listeyi hem notalar hem de renkler için kullanabilir miydin?

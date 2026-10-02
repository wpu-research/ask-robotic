# Elektronik zar
süre: 25

## Merak
Zar atınca ne geleceğini kimse bilmez; işte bu yüzden oyunlar heyecanlıdır. Bilgisayarlar da "rastgele" sayı üretebilir. Peki kartın içine bir zar yerleştirsek, 6 gelince bir sürpriz olsun mu?

## Etkinlik
### Rastgele sayı
**Matematik** kategorisindeki **[1] ile [6] arasında rastgele sayı** bloğu, her çalıştığında bu iki sayı arasında (uçlar dahil) rastgele bir tam sayı verir. Bir zarın yüzleri gibi: 1, 2, 3, 4, 5 ya da 6.

### Soru sormak: eğer
**Mantık** kategorisindeki **eğer ... ise** bloğu bir soruya göre karar verir. Soru doğruysa içindeki bloklar çalışır, değilse atlanır. Soru için aynı kategorideki **karşılaştırma** bloğunu kullanırsın. Orta kısmında **=**, **≠**, **<**, **≤**, **>**, **≥** seçenekleri bulunan bir bloktur.

Dikkat: **zar değerini 6 yap** bir **atamadır**: kutuya 6 koyar. **zar = 6** ise bir **sorudur**: kutuda 6 var mı? Cevabı doğru ya da yanlıştır.

### Program: zar at, 6'da kalp göster
Editörde A düğmesinin bloğu hazır.

1. **Değişken** kategorisinde **Değişken oluştur...** düğmesine tıkla. Adı **zar** yaz.
2. **Değişken** kategorisinden **zar değerini [0] yap** bloğunu A'nın içine koy.
3. **Matematik** kategorisinden **[1] ile [6] arasında rastgele sayı** bloğunu al ve "0"ın yerine bırak.
4. Altına **Temel** kategorisinden **sayıyı göster** bloğunu tak. İçindeki sayıyı **zar** bloğuyla değiştir.
5. **Mantık** kategorisinden **eğer ... ise** bloğunu al ve en alta tak.
6. Karşılaştırma bloğunu eğer'in "eğer" yuvasına tak. Sol deliğe **zar** bloğunu, sağ deliğe 6 koy. Ortadaki işaretin **=** olduğundan emin ol.
7. Eğer'in içine **simgeyi göster** bloğunu koy ve **kalp** seç.
8. ▶ **Çalıştır**. A'ya basarak zar at. 6 çıkana kadar devam et.

### Beklenen sonuç
A'ya her basışta ekranda 1 ile 6 arası bir rakam yarım saniye kadar görünür. 6 gelince rakam kaybolduktan sonra ekranda kalp belirir. Dört hedef de ✓ olmalı.

### Nasıl çalışıyor?
- Rastgele sayıyı **bir kez** üretip **zar** kutusuna koyuyoruz. Böylece hem ekranda gösterdiğimiz hem de karşılaştırdığımız sayı aynıdır.
- Her **rastgele sayı** bloğu çalıştığında yeni bir sayı üretir. Gösterme ve karşılaştırma için iki ayrı rastgele blok kullansaydık, gösterdiğimiz ve karşılaştırdığımız sayılar birbirinden farklı çıkabilirdi.
- Eğer bloğu, sayı gösterme bittikten sonra çalışır. Rakam yarım saniye durur, sonra kalp görünür.
- **JavaScript** sekmesinde `zar = randomInt(1, 6);` ve `if (zar == 6)` satırlarını göreceksin.

### Dene
1. Zarı 1 ile 20 arası yap. Kalbi hangi sayıda göstermek istersin?
2. **Mantık** kategorisinde **eğer** bloğunun iki çeşidi var: biri yalnızca **ise**, diğeri **ise ... değilse**. İkincisini al: 6 gelince kalp, gelmezse üzgün yüz göster.
3. A'ya 10 kez bas ve kaç kere 6 geldiğini say. Sence 6 ne sıklıkta gelmeli?

### Sık yapılan hatalar
- **Tek eşit işaretini karıştırmak.** **zar değerini 6 yap** zarı hep 6 yapar. Karşılaştırma bloğunda **=** seçili olmalı.
- **Aynı zar için iki rastgele blok kullanmak.** Rakamı ve karşılaştırmayı aynı kutudan (zar) al.
- **Kalbi göremeyip hata sanmak.** 6 gelmeyince kalp hiç görünmez. Birkaç kez daha bas.

## Konuşalım
Gerçek bir zarla bilgisayardaki rastgele sayı arasında ne fark olabilir? Aynı sayıyı art arda iki kez görürsen bu hata mıdır, yoksa rastgeleliğin bir parçası mı?

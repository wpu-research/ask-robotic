# Pusula: kuzeyi bul
süre: 25

## Merak
Bir dağda yolunu kaybettiysen, pusula iğnesi her zaman kuzeyi gösterir. Sen nereye dönersen dön, iğne yine kuzeyi bulur. Kartın pusulası da var. Bu derste kendi kuzey bulucunu yapacaksın.

## Etkinlik
### Pusula derecesi
Kartın pusulası, kartın üst kenarının hangi yöne baktığını **derece** olarak söyler:

| Derece | Yön |
|---|---|
| 0 | Kuzey (K) |
| 90 | Doğu (D) |
| 180 | Güney (G) |
| 270 | Batı (B) |

Dereceler saat yönünde artar. 0'dan 359'a kadar gider; 360 yine 0'dır.

Sanal kartta **Pusula ve sensörler** bölümünde bir kadran ve bir **Pusula** kaydırıcısı var. Kadranı tutup çevirerek ya da kaydırıcıyı oynatarak kartı döndürmüş gibi olursun. **Kuzeye çevir** düğmesi derecesi 0 yapar.

### Yeni bloklar
- **Giriş** kategorisi: **pusula yönü (derece)** pusulanın sayısını verir. **[A] düğmesi basılı mı?** o an A'ya basılıyorsa doğru verir.
- **LED** kategorisi: **oku [0] derece yönünde göster** verilen yöne bakan bir ok çizer. 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir.

### Kuzey oku nasıl bulunur?
Kart döndükçe kuzey kartın üstünde farklı bir yerde kalır. Kart doğuya (90) dönünce kuzey kartın **soluna** düşer. Yani ok sola bakmalıdır. Kartın dönüşü ne kadarsa okun bu kadar ters yöne dönmesi gerekir:

**ok açısı = 360 − pusula**

| Pusula | 360 − pusula | Ok |
|---|---|---|
| 0 | 360 (= 0) | yukarı |
| 90 | 270 | sol |
| 180 | 180 | aşağı |
| 270 | 90 | sağ |

### Program: kuzey bulucu
Editörde bir **sonsuza kadar** bloğu hazır.

1. **sonsuza kadar** içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy (iki çeşit eğer var; "değilse" olanı al).
2. Koşul yuvasına **Giriş** kategorisinden **[A] düğmesi basılı mı?** bloğunu tak.
3. "ise" kısmına **Temel** kategorisinden **sayıyı göster** bloğunu koy ve içine **pusula yönü (derece)** tak.
4. "değilse" kısmına **LED** kategorisinden **oku [0] derece yönünde göster** bloğunu koy.
5. Bloğun içindeki 0'ı silip **Matematik** kategorisinden **[ ] + [ ]** bloğunu tak. Orta işareti **−** olarak değiştir. Sol deliğe 360, sağ deliğe **pusula yönü (derece)** bloğunu koy.
6. ▶ **Çalıştır**. Pusula kaydırıcısını 0, 90, 180 yap ve oku izle. Sonra pusulayı 135 yap ve A düğmesini basılı tut.

### Beklenen sonuç
Pusula 0'dayken ok yukarıyı, 90'dayken sola, 180'deyken aşağıyı gösterir. A'yı basılı tutunca ekranda 135 gibi pusula derecesi görünür, bırakınca ok geri gelir. Beş hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **sonsuza kadar** bloğu her an pusulaya bakar ve oku günceller. Bu yüzden pusulayı çevirdiğinde ok anında tepki verir.
- **eğer A basılı mı? ise ... değilse** iki durumdan birini seçer: A basılıysa sayı, değilse ok.
- Oku çizen blok yalnızca sekiz yöne (kuzey, kuzeydoğu, doğu...) bakabilir. Verdiğin açıyı en yakın yöne yuvarlar. Örneğin 100 derece doğuya yuvarlanır.
- **JavaScript** sekmesinde `screen.showArrowAngle(360 - input.compass())` satırını bulabilirsin.

### Dene
1. Pusula derecesini 45'e çevir ve oku gözlemle. Hangi yöne bakıyor?
2. Okun üstüne yön harfi yazdır: eğer pusula 10'dan küçükse ekranda "K" yazsın. Hangi bloğa ihtiyacın var?
3. Pusulayı 270 yap ve oku tahmin et. Sonra çalıştırıp doğrula.

### Sık yapılan hatalar
- **Ok açısını yanlış hesaplamak.** Okun açısı pusulanın kendisi olursa ok dönüşle **aynı** yönde döner, kuzeyi değil. 360 çıkarmak okun ters yöne dönmesini sağlar.
- **Eksi işaretini değiştirmeyi unutmak.** Aritmetik bloğu varsayılan olarak toplar. Orta işarete tıklayıp − seçmelisin.
- **Aynı ekrana iki yerden yazmak.** Okla ilgili işi hem **sonsuza kadar** hem de bir düğme bloğuyla yaparsan ikisi ekran için yarışır, görüntü kararsız olur. Bu yüzden A'ya olay bloğu yazmadık, **A basılı mı?** diye sorduk.

## Konuşalım
Pusula iğnesi neden hep kuzeyi gösterir? Navigasyon uygulamaları pusulayı nerede kullanıyor olabilir? Kartı yerden yukarı kaldırınca pusula yine çalışır mı, sence?

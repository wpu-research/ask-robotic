# Proje: Çevre istasyonu
süre: 35

## Merak
Bir bilim insanı bir odanın nasıl olduğunu anlatmak istese ne ölçer? Sıcaklığa, ışığa ve sese bakar. Şimdi bu üç sensörü tek bir kartta toplayacaksın. Bir düğmeyle hangisini izleyeceğini seç, ekran çubukla göstersin, istediğinde de sayıyı oku!

## Etkinlik
### Proje: Çevre istasyonu
**Nasıl çalışacak?**
- **A düğmesi** modu değiştirir: 0 = sıcaklık, 1 = ışık, 2 = ses. Üçüncü basıştan sonra yeniden 0'a döner.
- Ekran seçili sensörü **çubuk grafik** olarak gösterir.
- **B düğmesini basılı tutarsan** ekran çubuk yerine sayıyı gösterir.

### Yeni blok: kalan
**Matematik** kategorisindeki **[ ] ÷ [ ] işleminin kalanı** bloğu bölme işleminden artan sayıyı verir. Örneğin 3 ÷ 3'ün kalanı 0'dır, 4 ÷ 3'ün kalanı 1'dir. Mod 0, 1, 2'den sonra yeniden 0'a dönsün istiyoruz: **(mod + 1) ÷ 3 işleminin kalanı** tam bunu yapar.

| mod | mod + 1 | ÷ 3 işleminin kalanı |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 2 | 2 |
| 2 | 3 | 0 |

### Adım adım
Editörde **başlangıçta**, **düğme A** ve **sonsuza kadar** blokları hazır. **mod**, **okuma** ve **enCok** adlı değişkenler de hazır.

1. **A düğmesi:** içine **mod değerini [0] yap** bloğunu koy. 0'ın yerine **Matematik** kategorisinden **[ ] ÷ [ ] işleminin kalanı** bloğunu tak. Birinci deliğe **[ ] + [ ]** bloğu tak: **mod** ve 1. İkinci deliğe 3 yaz.
2. **sonsuza kadar** bloğunun içine ilk olarak seçili moda göre okumayı hazırla. **eğer mod = 0 ise ... değilse** bloğu koy:
   1. **"ise":** **okuma değerini [sıcaklık (°C)] yap**, **enCok değerini [40] yap**.
   2. **"değilse":** içine ikinci bir **eğer mod = 1 ise ... değilse** bloğu koy.
      - **"ise":** **okuma değerini [ışık seviyesi] yap**, **enCok değerini [255] yap**.
      - **"değilse":** **okuma değerini [ses seviyesi] yap**, **enCok değerini [255] yap**.
3. Aynı **sonsuza kadar** içinde, bu eğer bloğunun altına ikinci bir **eğer ... ise ... değilse** koy. Koşul: **[B] düğmesi basılı mı?**
   - **"ise":** **sayıyı göster okuma**.
   - **"değilse":** **çubuk grafik okuma / en çok enCok**.
4. ▶ **Çalıştır**. Sıcaklığı 30 yap: çubuk üçte ikiden fazla dolar. A'ya basarak ışığa, sonra sese geç. B'yi basılı tutup sayıyı oku. A'ya üçüncü basışta başa dönülmeli.

### Beklenen sonuç
Başta sıcaklık modundasın. Sıcaklığı 30 yapınca çubuk yaklaşık 19 LED'i yakar (30 ÷ 40 oranı). A'ya basınca ışık çubuğu, tekrar basınca ses çubuğu, üçüncü basışta tekrar sıcaklık gelir. B'yi basılı tutunca ilgili sayı ekranda kayar. Hedefler kutusundaki beş görevin hepsi ✓ olmalı.

### Nasıl çalışıyor?
- **mod** hangi sensörün izlendiğini tutar. **okuma** seçilen sensörün değeri, **enCok** o değerin alabileceği en büyük sayıdır (sıcaklık için 40, ışık ve ses için 255).
- **sonsuza kadar** her turda önce okumayı hazırlar, sonra ekranı çizer. Ekrana yazan tek yer burasıdır; bu yüzden ekranda görüntü karışmaz.
- **A düğmesi bloğu** yalnızca modu değiştirir, ekrana dokunmaz.
- **çubuk grafik okuma / en çok enCok** oranı çizer: okuma 30, enCok 40 ise 30 ÷ 40 = 0,75; bu da 25 LED'in yaklaşık 19'u.
- Aynı programdaki bütün parçalar (olay, değişken, eğer, çubuk grafik, kalan) bu hafta öğrendiklerinin toplamı.

### Dene
1. Sıcaklık çubuğunun en büyük değerini 50 yap. Aynı sıcaklıkta kaç LED yanıyor? Neden?
2. Dördüncü bir mod ekle: **Pusula**. En çok 360 olsun. Dört mod olunca A bloğunda hangi sayıyı değiştirmelisin? (İpucu: kalan bloğundaki bölen sayı.)
3. Çubuk grafik yerine **eğer okuma yüksek ise kalp göster** gibi bir uyarı ekle.

### Sık yapılan hatalar
- **Kalanı değil sayıyı yazmak.** A bloğunda doğrudan **mod + 1** yazarsan mod hiç başa dönmez ve 3, 4, 5 diye büyür. Kalan bloğu 3'e bölünce 0, 1, 2 döngüsünü korur.
- **enCok değerini unutmak.** Sıcaklık için 255 bırakırsan çubuk neredeyse hiç dolmaz.
- **Ekrana iki yerden yazmak.** B'ye ayrı bir olay bloğu yazıp sayıyı oradan göstermeye çalışırsan, **sonsuza kadar** ekranı hemen siler. Hepsini tek yerde, **sonsuza kadar** içinde topla.
- **Sensör kaydırıcısını değiştirmeyi unutmak.** Çubuk hiç değişmezse sanal sensörlerin kaydırıcısını oynat.

## Konuşalım
Gerçek bir hava istasyonu hangi başka şeyleri ölçerdi? Bu kartın üç sensörünü nerede kullanırdın: sera, sınıf, ya da kendi odan? Hangi ölçümün senin için en önemli olduğunu düşün ve neden olduğunu anlat.

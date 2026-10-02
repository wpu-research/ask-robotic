# Sıcaklık ve ışık
süre: 25

## Merak
Hava durumu uygulaması dışarının kaç derece olduğunu söyler. Telefonun ekran parlaklığı da odanın ışığına göre kendiliğinden değişir. Bunların hepsi **sensör** denen küçük duyargalar sayesinde olur. Kartın da bir sıcaklık ve bir ışık sensörü var. Onlarla küçük bir hava istasyonu yapacaksın.

## Etkinlik
### Sanal sensörler
Gerçek kartta sensörler fiziksel parçalardır. Sanal kartta ise **sen** değerleri değiştirirsin. Kartın sağındaki **Pusula ve sensörler** bölümünde üç kaydırıcı bulursun:

- **Sıcaklık:** −5 ile 50 derece (°C) arası.
- **Işık:** 0 (karanlık) ile 255 (çok parlak) arası.
- **Ses:** 0 ile 255 arası (bunu 14. derste kullanacağız).

**Giriş** kategorisinde ilgili iki değer bloğu var:

- **sıcaklık (°C):** o anki sıcaklığı verir.
- **ışık seviyesi:** o anki ışığı verir.

### Çubuk grafik
**LED** kategorisindeki **çubuk grafik [3] / en çok [5]** bloğu bir sayıyı LED'lerle gösterir. İlk sayı ölçtüğün değerdir, ikincisi en büyük olabilecek değerdir. LED'ler aşağıdan yukarıya dolar: değer en büyük değerin yarısıysa ekranın yarısı yanar. Işık seviyesi 255 üzerinden ölçüldüğü için **çubuk grafik [ışık seviyesi] / en çok [255]** kullanırsın. Işık 128 ise yaklaşık 13 LED yanar. Işık 255 ise 25 LED'in hepsi yanar.

### Program: mini hava istasyonu
Editörde **düğme A** ve **düğme B** blokları hazır.

1. **A düğmesi:**
   1. **Temel** kategorisinden **sayıyı göster** bloğunu koy.
   2. İçindeki sayıyı **Giriş** kategorisindeki **sıcaklık (°C)** bloğu ile değiştir.
   3. Altına **Mantık** kategorisinden **eğer ... ise** bloğunu koy.
   4. Koşul için karşılaştırma bloğu al: sol deliğe **sıcaklık (°C)**, işaret **>**, sağ deliğe 30.
   5. Eğer'in içine **simgeyi göster** koy ve **üzgün yüz** seç.
2. **B düğmesi:** içine **LED** kategorisinden **çubuk grafik** bloğunu koy. İlk deliğe **ışık seviyesi** bloğunu tak, ikinci deliğe 255 yaz.
3. ▶ **Çalıştır**.
4. Sıcaklık kaydırıcısı 21 iken A'ya bas. Sonra sıcaklığı 35'e çıkar ve A'ya bas.
5. Işık kaydırıcısını sonuna kadar çek ve B'ye bas.

### Beklenen sonuç
A'ya basınca sıcaklık sayısı kayar (21 gibi). Sıcaklık 30'un üstündeyken sayıdan sonra üzgün yüz görünür. B'ye basınca ışık ne kadarsa o kadar LED yanar. Işık sonuna çekilince bütün ekran yanar. Dört hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Sensör bloğu çalıştığı **an** değeri okur. Sıcaklığı sonradan değiştirirsen, daha önce okunan değer değişmez.
- **eğer sıcaklık > 30 ise** bir soru sorar: sıcaklık 30'dan büyük mü? Büyükse içindeki blok çalışır.
- Sayı kayarken program bekler. Sayı bitince üzgün yüz çizilir. Bu yüzden önce sayıyı, sonra yüzü görürsün.
- **Eşik**, bir kararın değiştiği sınır değerdir. Burada eşik 30 derece: 30'un altında ve üstünde farklı şeyler olur.

### Dene
1. Eşiği 25'e çek. Sıcaklık kaç olunca üzgün yüz görünüyor?
2. A bloğunda **değilse** kolunu ekle: sıcaklık 30'dan küçükse mutlu yüz göstersin.
3. **çubuk grafik** bloğunun içine **sıcaklık (°C)** koy ve en çok değeri 50 yap. Sıcaklığı 25 yap. Sence kaç LED yanar? Tahminini denemeden yap, sonra dene.

### Sık yapılan hatalar
- **Çubuğun en çok değerini yanlış yazmak.** Işık 255'e kadar çıkar. En çok değeri 5 bırakırsan hemen tüm ekran yanar.
- **Koşulu ters kurmak.** **sıcaklık < 30** yazarsan serinken üzgün yüz görürsün.
- **Sensörü okumak için kaydırıcıyı unutmak.** Sanal kartta değerleri sen değiştirirsin; değiştirmezsen sabit kalır (sıcaklık başta 21, ışık 128).

## Konuşalım
Gerçek bir termometre mi, bu kartın sıcaklık sensörü mü daha güvenilir? Sence sanal sensörler gerçek ölçümler yapıyor mu, yoksa değeri biz mi söylüyoruz? Sorunun cevabı seni şaşırttı mı?

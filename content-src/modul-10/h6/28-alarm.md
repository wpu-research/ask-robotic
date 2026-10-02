# Alarm
süre: 28

## Merak
Çantanın ya da bisikletin başında bir alarm olsa, biri dokunur dokunmaz ötmeye başlasa nasıl olurdu? Alarm, aslında bir **durum** makinesidir: ya kurulu değildir, ya kuruludur, ya da çalıyordur. Durumlar arasında geçişi düğmeler ve sensörler yapar. Bu derste durumları değişkenlerle tutan bir alarm yapacaksın.

## Etkinlik
### Üç durum
| Durum | Ne zaman? | Ekranda |
|---|---|---|
| Kapalı | başta | boş |
| Kurulu | A'ya basınca | "evet" işareti |
| Çalıyor | kurulu iken kart sallanınca | kuru kafa ve alarm ezgisi |

Çalan alarmı kapatmak için **A+B**'ye bir saniyeden uzun basılır. Uzun basış kazara olmaz, bu yüzden şifre gibi iş görür. Kapanınca ekranda mutlu yüz görünür.

### Yeni fikirler
- İki **durum değişkeni**: **kurulu** (0/1) ve **alarm** (0/1). Değişkenler kartın o anki durumunu hatırlar.
- **düğme [A+B] [uzun basılınca]**: A ve B'ye birlikte 1 saniyeden uzun basınca çalışır. (Düğme başlığında listeden **A+B** ve **uzun basılınca** seç.)
- **sonsuza kadar** içinde **eğer** ile bir durumu sürekli kontrol etmek.

### Adım adım
Editörde **başlangıçta**, **düğme [A] [basılınca]**, **kart [sallandığında]**, **sonsuza kadar** ve **düğme [A+B] [uzun basılınca]** hazır.

1. **Değişken** kategorisinde **kurulu** ve **alarm** değişkenlerini oluştur.
2. **başlangıçta** içine **kurulu değerini [0] yap** ve **alarm değerini [0] yap** koy.
3. **düğme [A] [basılınca]** içine **kurulu değerini [1] yap** ve **simgeyi göster [evet]** koy.
4. **kart [sallandığında]** içine **eğer ... ise** koy. Koşul: **kurulu** **=** **1**. İçine **alarm değerini [1] yap**.
5. **sonsuza kadar** içine **eğer ... ise** koy. Koşul: **alarm** **=** **1**. İçine sırayla: **simgeyi göster [kuru kafa]**, **ezgiyi çal [Alarm]**, **ekranı temizle**, **bekle [200] ms**.
6. **düğme [A+B] [uzun basılınca]** içine sırayla: **kurulu değerini [0] yap**, **alarm değerini [0] yap**, **sesi durdur**, **simgeyi göster [mutlu yüz]**.
7. ▶ **Çalıştır**. Kartın **A** düğmesine bas. **Hareket** bölümünden **Salla**'ya bas. Alarm çalarken **A+B** yazan düğmeye bir saniyeden uzun bas ve bırakma.

### Beklenen sonuç
**A**'dan sonra ekranda "evet" işareti görünür. Salladığında kuru kafa yanıp söner ve kısa bir alarm ezgisi tekrar tekrar çalar (ezgi 1,6 saniye sürer, ardından 0,2 saniyelik boşluk olur). **A+B**'ye uzun basınca alarm durur ve mutlu yüz görünür. Altı hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **Kurulu değilken** sallarsan hiçbir şey olmaz, çünkü **kart [sallandığında]** içindeki **eğer** **kurulu = 1** olmasını bekler.
- **sonsuza kadar** hep döner ama **alarm = 0** iken içine girilmez.
- **A+B** uzun basışı **alarm**'ı 0 yapınca **sonsuza kadar** bir sonraki turda alarmı çalmaz. O an çalmakta olan ezgi bitene kadar sürebilir (en çok 1,6 saniye), ama bir daha başlamaz.
- Aynı anda birden fazla başlık çalıştığı için, ezgi bitmeden **A+B** uzun basışı işlenir.

### Dene
1. Sallama yerine kartı yüzüstü çevirince alarm çalsın: **kart [yüzü aşağı bakınca]** başlığı kullan.
2. Alarm çalarken **ışık seviyesi** 50'nin altındaysa (karanlıkta) farklı bir ezgi çal. Işığı **Işık** kaydırıcısıyla değiştir.
3. Kapatmak için A+B yerine B düğmesine 3 kez art arda basmayı dene. Sayı tutan bir değişken gerekecek.

### Sık yapılan hatalar
- **Basışı çok kısa tutmak.** Uzun basış için A+B'ye bir saniyeden fazla basılı kalmalısın.
- **kurulu** ve **alarm** değişkenlerini karıştırmak. Sallanınca **alarm** 1 olur, **kurulu** değil.
- **Alarmı kapatırken yalnız sesi durdurmak.** **alarm** değişkenini sıfırlamazsan **sonsuza kadar** alarmı yeniden çalar.
- **sonsuza kadar** içine **bekle** koymamak. Ekran ancak çok kısa bir an boşalır, yanıp sönme neredeyse görünmez.

## Konuşalım
Gerçek bir alarmda yanlışlıkla çalma (yalancı alarm) bir sorundur. Seni en çok hangisi rahatsız ederdi: yanlış yere çalan alarm mı, yoksa gerçekten gerektiğinde çalmayan alarm mı? Kartı nasıl daha güvenilir yapardın?

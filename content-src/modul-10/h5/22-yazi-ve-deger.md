# Yazı, ad ve değer
süre: 20

## Merak
"Sıcaklık 28" diye bir mesajı iki parçaya bölebilirsin: "sıcaklık" bir ad, 28 bir değer. Adı bilen kart değeri doğru yere koyar. Bir sayı yetmediğinde radyo yazı da taşıyabilir, bir ad ile bir değeri çift olarak da. Bu derste üç mesaj türünü de kullanacaksın.

## Etkinlik
### Üç mesaj türü
| Tür | Gönderen blok | Alan blok |
|---|---|---|
| sayı | **radyoyla sayı gönder [1]** | **alınan [sayı]** |
| yazı | **radyoyla yazı gönder [merhaba]** | **alınan [yazı]** |
| ad = değer | **radyoyla [ad] = [1] gönder** | **alınan [ad]** ve **alınan [değer]** |

Sınırlar: bir yazı en çok 32 karakter olabilir, bir ad en çok 12 karakter. Fazlası kesilir. Bu derste adları Türkçe harf kullanmadan yazacağız (örneğin **sicak**). Gönderen ve alan taraf adı harfi harfine aynı yazmalı.

**sinyal gücü** adlı bir blok da var. Sanal radyoda uzaklık yoktur, bu yüzden sinyal gücü hep 200'dür. Yine de bilmek güzel: gerçek radyolarda sinyal gücü genellikle uzaklaştıkça azalır.

### Adım adım
Editörde **başlangıçta**, **düğme [A] [basılınca]**, **düğme [B] [basılınca]** ve **radyo mesajı alınınca** hazır.

1. **başlangıçta** içine **radyo grubunu [1] yap** koy.
2. **düğme [A] [basılınca]** içine **radyoyla yazı gönder [selam]** koy. Yazıyı **selam** yap.
3. **düğme [B] [basılınca]** içine **radyoyla [sicak] = [0] gönder** koy. Adı **sicak** yap. Değer yerine **Giriş** kategorisinden **sıcaklık (°C)** bloğunu tak.
4. **radyo mesajı alınınca** içine **eğer ... ise ... değilse** koy. Koşul: **alınan [ad]** **=** **sicak**. **ise** kolunda **sayıyı göster** içine **alınan [değer]**. **değilse** kolunda **yazıyı göster** içine **alınan [yazı]**.
5. ▶ **Çalıştır**. Kart 1'in sıcaklığını **Pusula ve sensörler** bölümündeki **Sıcaklık** kaydırıcısıyla 28 yap. Kart 1'de **A**'ya, sonra **B**'ye bas.

### Beklenen sonuç
**A**'ya basınca Kart 2'nin ekranında **selam** yazısı kayar (yaklaşık 3 saniye). **B**'ye basınca Kart 2'de **28** görünür. Beş hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Yazı mesajının **alınan [ad]** değeri boştur. Bu yüzden karşılaştırma yanlış çıkar ve **değilse** kolu çalışır.
- **ad = değer** mesajında **alınan [ad]** "sicak", **alınan [değer]** ise 28 olur.
- Her mesajda önce türü anlamak gerekir. Bu programda ad kontrolü, mesajın türünü anlamanın basit bir yoludur.
- Kart 1'in sıcaklık kaydırıcısı Kart 1'e, Kart 2'nin kaydırıcısı Kart 2'ye aittir. Hangi kartı seçtiğini sağ paneldeki **Kart 1 / Kart 2** düğmelerinden görürsün.

### Dene
1. **alınan [yazı]** bloğunu ad = değer mesajında da dene. Değeri yazı olarak verdiğini görürsün.
2. Radyo bölümünden elle ad = değer mesajı yolla: tür **ad = değer**, ad **sicak**, mesaj **35**. Kart 2'de 35 görünmeli.
3. Yeni bir mesaj ekle: **düğme [A+B] [basılınca]** **radyoyla [isik] = [ışık seviyesi] gönder**. Alan kart adı **isik** ise çubuk grafik göstersin. (Işık 0-255, çubuk grafiğin üst sınırını **255** yap.)
4. 32 karakterden uzun bir yazı yolla. Alan kartta ne kadarı görünüyor?

### Sık yapılan hatalar
- **Adı farklı yazmak.** Gönderende **sicak**, alanda **sıcak** yazarsan karşılaştırma eşit çıkmaz.
- **Değeri yazı sanmak.** **alınan [değer]** bir sayıdır. Hesap yapmak için uygundur.
- **Ad 12 karakteri geçerse kesilir.** Uzun ad seçersen alan taraftaki karşılaştırma tutmaz.

## Konuşalım
Bir sayı yerine "ad = değer" çifti göndermek nerede işini kolaylaştırır? Sıcaklık, ışık ve ses gibi üç ölçümü aynı anda yollamak istersen mesajları nasıl düzenlersin?

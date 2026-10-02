# Adımsayar
süre: 25

## Merak
Bilekliklerdeki adımsayar nasıl sayar? İçindeki küçük bir ivmeölçer, her adımda ufak bir sarsıntı hisseder ve sayıyı bir artırır. Sanal Mikro Kart'ın da bir ivmeölçeri var. Kartı sallamayı "bir adım" sayarak bir adımsayar yapacağız ve 10. adımda küçük bir kutlama ekleyeceğiz.

## Etkinlik
### Fikir
Kartı sanal olarak sallamak, yürümek gibi bir sarsıntıdır. Kartın **sallandığında** başlığı her sallanışta bir kez çalışır. İçine **adim** değişkenini bir artıran blok koyarsak bir adımsayar olur.

### Yeni fikir: hedefe ulaşınca özel bir şey
Bir değişken **tam olarak** bir sayıya eşit olunca bir şey olsun diyebiliriz: **eğer [adim] = [10] ise**. Eşitlik yalnız o anda doğrudur. 11. adımda koşul yanlış olur, ses tekrar çalmaz.

### Adım adım
Editörde **başlangıçta**, **kart [sallandığında]**, **düğme [A] [basılınca]** ve **düğme [B] [basılınca]** hazır.

1. **Değişken** kategorisinde **adim** değişkenini oluştur.
2. **başlangıçta** içine **adim değerini [0] yap** koy.
3. **kart [sallandığında]** içine sırayla:
   - **adim değerine [1] ekle**
   - **eğer ... ise** bloğu. Koşul: **adim** **=** **10**. İçine **simgeyi göster [mutlu yüz]** ve **ezgiyi çal [Zafer]**.
4. **düğme [A] [basılınca]** içine **sayıyı göster** koy; sayı olarak **adim** değişkenini tak.
5. **düğme [B] [basılınca]** içine **adim değerini [0] yap** ve **ekranı temizle** koy.
6. ▶ **Çalıştır**. Sağ paneldeki **Hareket (ivmeölçer)** bölümünde **Salla** düğmesine üç kez bas. Sonra kartın **A** düğmesine bas: ekranda 3 görmelisin. Yedi kez daha salla. 10. sallayışta kutlama başlar. Kartın **B** düğmesiyle sıfırla.

### Beklenen sonuç
**A** adım sayısını gösterir: üç sallayıştan sonra 3, on sallayıştan sonra 10. 10. sallayışta kartın ekranında mutlu yüz belirir ve **Zafer** ezgisi çalar (yaklaşık 2,75 saniye). **B**'ye basınca sayaç sıfırlanır. Altı hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Her **Salla** ile **kart sallandığında** başlığı bir kez çalışır.
- 10. adımda **eğer** koşulu doğru olur ve kutlama başlar. Ezgi bitene kadar o başlık meşguldür; bu sırada gelen yeni sallanmalar sıraya girer (en çok 3).
- **A** ve **B** ayrı başlıklardır, ezgi çalarken de çalışabilirler.
- İvme sensöründen gelen değerleri de görebilirsin: **Hareket** bölümündeki **güç** değeri sallanırken yükselir.

### Dene
1. Hedefi 10 yerine 5 yap. Daha çabuk kutlanıyor mu?
2. Her 10 adımda kutlama yapmak için **Matematik** kategorisindeki **[adim] ÷ [10] işleminin kalanı** bloğunu kullan. Kalan **0** ise kutla.
3. Adımını 70 cm sayarsan yürüdüğün yol **adim** × 7 ÷ 10 metre eder. **A** düğmesi bunu göstersin.

### Sık yapılan hatalar
- **B ile sıfırlamayı unutmak.** Yeni bir yürüyüş için önce B'ye basmazsan sayı kaldığı yerden devam eder.
- **Eşit yerine büyük işareti kullanmak.** **adim ≥ 10** olursa 11., 12. adımlarda da ezgi yeniden çalar.
- **adim değerine 1 ekle bloğunu eğer'in içine koymak.** O zaman değişken artmaz.

## Konuşalım
Gerçek bir adımsayar sallanmayı yürüyüşten nasıl ayırır? Zıplamak ya da kolunu sallamak adım sayılır mı? Sayacı daha akıllı yapmak için hangi bilgiyi kullanabilirsin?

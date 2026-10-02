# Nabız ölçer
süre: 28

## Merak
Doktor bileğini tutup saatine bakarak kalp atışını sayar. Neden bir dakika boyunca saymaz? Çünkü kısa bir süre sayıp bir çarpma yapmak aynı sonucu çok daha çabuk verir. Bu derste kendi sanal nabız ölçerini yapacaksın. Kalbin her atışında A'ya basacaksın, kart sayıp sonucu söyleyecek.

## Etkinlik
### Fikir
Kartta gerçek bir nabız sensörü yoktur. Portal tamamen sanaldır ve ölçümü sen girersin: kendi nabzını ya da bir ritmi sayarak her atışta **A**'ya basarsın. Kart 10 saniye boyunca bu basışları sayar, sonunda çarpar.

**Dakikadaki atış = 10 saniyede sayılan atış × 6**

| 10 saniyede atış | Dakikadaki atış |
|---|---|
| 10 | 60 |
| 12 | 72 |
| 15 | 90 |

Bu bir eğitim aracıdır, tıbbi bir ölçüm değildir.

### Yeni fikir: bekleme sırasında başka iş
**bekle [10000] ms** bloğu bir başlığın içinde 10 saniye bekler. Ama kartın öteki başlıkları bu sırada çalışmaya devam eder. Yani **B** 10 saniye beklerken **A** düğmesi yine çalışır. Kart farklı başlıkları birlikte çalıştırır.

### Adım adım
Editörde **başlangıçta**, **düğme [A] [basılınca]** ve **düğme [B] [basılınca]** hazır.

1. **Değişken** kategorisinde iki değişken oluştur: **sayac** (kaç atış) ve **olcum** (ölçüm sürüyor mu? 1 = evet, 0 = hayır).
2. **başlangıçta** içine **sayac değerini [0] yap** ve **olcum değerini [0] yap** koy.
3. **düğme [A] [basılınca]** içine **eğer ... ise** koy. Koşul: **olcum** **=** **1**. İçine sırayla:
   - **sayac değerine [1] ekle**
   - **simgeyi göster [kalp]**
   - **bekle [100] ms**
   - **ekranı temizle**
4. **düğme [B] [basılınca]** içine sırayla:
   - **sayac değerini [0] yap**
   - **olcum değerini [1] yap**
   - **simgeyi göster [küçük kalp]**
   - **bekle [10000] ms**
   - **olcum değerini [0] yap**
   - **sayıyı göster** içine **sayac** **×** **6** (çarpma bloğu).
5. ▶ **Çalıştır**. **B**'ye bas ve ölçüm başlasın. 10 saniye içinde **A**'ya on iki kez bas (yaklaşık saniyede bir kez). Sonuca bak.

### Beklenen sonuç
**B**'den sonra ekranda küçük kalp durur. Her **A** basışında büyük kalp bir an parlar. 10 saniye sonra ekranda **72** kayar. Dört hedefin hepsinde ✓ olmalı. 12 atışı tam yakalayamazsan sonucun 6'nın katı olur (60, 66, 72, 78...).

### Nasıl çalışıyor?
- **olcum** bir bayraktır. 1 iken **A** sayar, 0 iken **A** hiçbir şey yapmaz. Böylece ölçüm dışında basışlar yanlışlıkla sayılmaz.
- **sayac** her ölçümün başında sıfırlanır.
- **bekle [10000] ms** 10 saniye bekler. Bu sırada **A** çalışır çünkü **A** ayrı bir başlıktır.
- 10 saniye bitince bayrak kapanır ve sonuç gösterilir.

### Dene
1. Ölçüm süresini 15 saniye yap (**bekle [15000] ms**) ve çarpanı 4 yap. Sonuç yaklaşık aynı çıkmalı.
2. Sonuca göre ekranda bir simge göster: 60'ın altı **uyuyan yüz**, 100'ün üstü **şaşkın yüz**, arası **mutlu yüz**. (**eğer ... ise ... değilse** bloklarını iç içe koy.)
3. Ölçüm başlarken kısa bir bip çal ve bitince farklı bir bip çal.

### Sık yapılan hatalar
- **olcum değerini 1 yapmayı unutmak.** **A** hiç saymaz.
- **10000 yerine 10 yazmak.** **bekle** milisaniye ile çalışır. 10 ms hiç fark edilmez.
- **sayac sıfırlanmamak.** İkinci ölçümde sayı önceki ölçümün üstüne eklenir.
- **Çarpanı unutmak.** Ekranda yalnız atış sayısı kalır; "dakikadaki atış" değil.

## Konuşalım
Hızlı koşunca nabzın artar. Ölçümü koşmadan önce ve koştuktan sonra yapsan hangi farkı görürsün? 10 saniye yerine 5 saniye ölçsen sonuç ne kadar güvenilir olurdu?

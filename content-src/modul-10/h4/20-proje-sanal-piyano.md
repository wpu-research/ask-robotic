# Proje: Sanal piyano
süre: 32

## Merak
Bir müzik grubunda herkesin bir tuşu vardır ama sihirli şey, çaldığın şarkıyı kaydedip tekrar dinleyebilmektir. Bu projede kartından beş tuşlu bir piyano yapacaksın. Tuşlara bastıkça ekranda bir sütun yanacak, notalar kaydedilecek ve logoya dokununca çaldığın şarkı baştan oynayacak.

## Etkinlik
### Proje: Sanal piyano
Bu hafta öğrendiğin her şeyi birleştireceksin: nota çalma, tempo, liste, döngü ve düğmelerle sensörlerden giriş almak.

**Hedefler:**
- Beş tuş beş farklı nota çalsın: Do, Re, Mi, Sol, La.
- Her tuş ekranda kendi sütununu yaksın.
- Çalınan notalar bir kayıt listesine eklensin.
- Logoya dokununca kayıt baştan çalınsın.

### Tuşlar
Kartın beş girişi var: **A**, **B**, **A+B** düğmeleri ve **P0**, **P1** pinleri. Pinler kartın altındaki üç dokunmatik bölgedir (kartın üzerindeki **0**, **1**, **2** yazan kutular). Sanal kartta onlara fareyle tıklayınca dokunulmuş olur. Eşleşmeyi şöyle yapalım:

| Tuş | Nota | Ekranda yanacak sütun (x) |
|---|---|---|
| A | Do | 0 |
| B | Re | 1 |
| A+B | Mi | 2 |
| P0 | Sol | 3 |
| P1 | La | 4 |

### Yeni blok
**Pinler** kategorisindeki **[P0] pinine [dokununca]** bloğu bir pine dokunulunca çalışan yeni bir başlıktır. Düğme başlıklarından farkı yoktur; yalnız tetikleyen şey bir pindir.

### Adım adım
Editörde yedi başlık hazır: **başlangıçta**, üç düğme, iki pin ve **logoya [dokununca]**. Önce yalnız **A** tuşunu yap, çalıştığını gör. Sonra diğerlerini kopyala.

1. **Değişken** kategorisinde **kayit** adlı bir değişken oluştur.
2. **başlangıçta** içine **kayit değerini [0] yap** koy. Sıfırın yerine **Liste** kategorisinden içi boş olan **liste oluştur** bloğunu tak.
3. **düğme [A] [basılınca]** içine sırayla şunları koy:
   - **LED yak x [0] y [2]**
   - **[Do] notasını [1/8] vuruş çal**
   - **[kayit] listesine [nota Do] ekle**. Liste yerine **kayit** değişkenini, eklenecek öğe yerine **nota [Do]** bloğunu tak.
   - **ekranı temizle**
4. Bu dört bloğu seçip kopyala (Ctrl+C, Ctrl+V). Kopyaları **B**, **A+B**, **P0** ve **P1** başlıklarına taşı. Her kopyada **x** değerini ve notayı tablodaki gibi değiştir.
5. **logoya [dokununca]** içine **[öğe] ile, [kayit] listesinin her öğesi için** bloğunu koy. İçine **[440] Hz sesini [1/8] vuruş çal** bloğunu koy ve frekans yerine **öğe** değişkenini tak.
6. ▶ **Çalıştır**. Tuşlara tıklayarak kısa bir melodi çal. Sonra logoya tıkla.

### Beklenen sonuç
Her tuş kendi notasını çalar, ekranın ortasındaki satırda kendi sütunu bir an yanar ve söner. Logoya basınca çaldığın notalar, çaldığın sırayla yeniden çalınır. Dört hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Liste, çalınan her notanın frekansını sırayla saklar. Listenin sonuna eklemek için **listesine ... ekle** kullanılır.
- Logoya dokununca döngü listedeki her sayıyı baştan sona çalar. Hızı notaların süresi ve tempo belirler.
- Her tuşun gövdesi aynı kalıptır: yak, çal, kaydet, temizle. Yalnız nota ve sütun değişir.
- Notalar 1/8 vuruş olduğu için tempo 120'de her biri çeyrek saniye sürer. Hızlı tıklarsan bir önceki nota bitmeden yeni tuş çalışır.

### Dene
1. **tempoyu [80] yap (vuruş/dk)** bloğunu **başlangıçta** içine koy. Çaldığın şarkı yavaşladı mı?
2. Geri oynatmada döngünün içine **bekle [50] ms** ekle. Notalar arasında küçük boşluk oluşur.
3. Listenin kaç nota tuttuğunu öğrenmek için **[kayit] listesinin uzunluğu** bloğunu **sayıyı göster** içine koy.
4. Kayıt kendiliğinden hiç silinmiyor. Kendi kayıt silme tuşunu nasıl yapardın? (İpucu: kayıt değişkenine yeniden boş liste ata.)

### Sık yapılan hatalar
- **Listeyi başlangıçta kurmamak.** **kayit** hiç liste olmazsa ekleme bloğu "Bu blok için bir liste gerekli." hatası verir ve program durur.
- **Aynı sütunu iki tuşa vermek.** Hangi tuşa bastığını ekrandan ayırt edemezsin.
- **Pin tuşunu başlıksız bırakmak.** **[P0] pinine [dokununca]** bloğunun içi boşsa dokunmak hiçbir şey yapmaz.

## Konuşalım
Piyanonu bir arkadaşın kullansa en çok neyi değiştirmek isterdi? Kayıt özelliğini başka hangi projede kullanırdın: bir şifre, bir oyun, bir günlük?

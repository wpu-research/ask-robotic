# Sahneni kur: renk, kedi ve elma
süre: 20

## Merak
Her oyun boş bir sahneyle başlar. Perde açılmadan önce dekoru kuran bir tiyatro ekibi gibi, oyun başlamadan önce oyuncuları sahneye sen yerleştirirsin. Ekran 160 piksel geniş ve 120 piksel yüksek. Bir kediyi sol tarafa, bir elmayı sağ tarafa koymak için bilgisayara hangi sayıları söylemelisin?

## Etkinlik
Bu etkinlik tamamen Oyun Atölyesi'nde, sanal sahnede yapılır. Kamera, kit ya da kâğıt gerekmez.

### Atölyeyi tanı
- **Sol tarafta sahne** var. Oyun burada oynanır. Sahnenin altındaki ▶ düğmesi oyunu başlatır, ■ durdurur, ↺ baştan başlatır.
- Sahnenin altında **Hedefler** listesi var. Her hedef yapılınca yeşile döner. Hepsi yeşil olunca etkinlik tamamdır.
- **Sağ tarafta sekmeler** var: Bloklar, JavaScript, Resimler ve Harita. Bu derste yalnız **Bloklar** sekmesini kullanacaksın.
- Blokların kutusu, çalışma alanının solunda renkli kategoriler olarak durur. Bu derste şu kategoriler açık: Sprite, Oyun, Sahne / Harita, Değişken ve Matematik.

### Üç yeni kavram
- **Sprite:** Sahnedeki bir oyuncu ya da nesne. Kedi bir sprite'tır, elma da.
- **Konum:** Her sprite'ın bir x ve bir y sayısı vardır. x soldan sağa, y yukarıdan aşağı sayılır. Sol üst köşe x 0, y 0 noktasıdır. Ekranın ortası x 80, y 60 noktasıdır.
- **Tür:** Her sprite'ın bir türü vardır (Oyuncu, Düşman, Yiyecek gibi). İleride "Oyuncu, Yiyecek'e çarpınca ne olsun?" diye soracağız. Bunu tür sayesinde söyleyebileceğiz.

### Blokları kur
1. Çalışma alanında `oyun başlayınca` bloğu hazır. Bu blok, oyun başlar başlamaz altındaki blokları sırayla çalıştırır. Bütün bloklarını bunun altına takacaksın.
2. **Sahne / Harita** kategorisinden `arka plan rengi [renk]` bloğunu sürükleyip `oyun başlayınca` bloğunun altına tak. Renk karesine tıkla ve açık mavi (gök) rengi seç.
3. **Değişken** kategorisini aç ve **Değişken oluştur...** düğmesine bas. Adına `kedi` yaz. Sonra çıkan `[kedi] değişkenini [ ] yap` bloğunu arka plan bloğunun altına tak.
4. **Sprite** kategorisinden `yeni [resim] sprite'ı, türü [tür]` bloğunu al ve değişken bloğunun boş yuvasına tak. Resim listesinden **Kedi**'yi, türden **Oyuncu**'yu seç.
5. Kediyi yerleştir. **Sprite** kategorisinden `[bu sprite] konumu x [80] y [60]` bloğunu alta ekle. İçindeki `bu sprite` yerine **Değişken** kategorisindeki `kedi` bloğunu sürükle. x için 40, y için 80 yaz.
6. Aynı işi elma için tekrarla: `elma` adında yeni bir değişken oluştur. Ona `yeni [resim] sprite'ı, türü [tür]` bloğunu bağla (resim **Elma**, tür **Yiyecek**). Sonra elmanın konumunu x 120, y 80 yap.
7. ▶ düğmesine bas. Sahnede açık mavi bir fon, solda kedi, sağda elma görmelisin.

Beklenen sonuç: Sahne mavi, kedi solda, elma sağda. Dört hedefin hepsi yeşil.

### Nasıl çalışıyor?
- Bloklar yukarıdan aşağıya, sırayla çalışır. Oyun başlayınca önce renk değişir, sonra kedi doğar ve yerine gider, sonra elma.
- **Değişken**, bir şeye verdiğin ad etiketidir. `[kedi] değişkenini [...] yap` demek "yeni sprite'a kedi diyeceğim" demektir. Sonra `kedi` bloğunu nereye koyarsan o sprite'ı gösterir.
- Konum, sprite'ın **merkezini** gösterir. Kedi 16 piksel geniş olduğundan x 40 verdiğinde kedinin ortası 40'ta olur.
- `bu sprite` en son oluşturduğun sprite demektir. İki sprite'ın olduğu yerde karışmasın diye her sprite'a bir değişken adı veriyoruz.

### Dene
1. Kedinin y değerini 20 yap. Kedi yukarı çıkıyor mu? ▶ yerine ↺ düğmesiyle baştan başlat.
2. Başka bir arka plan rengi seç ve oyunu yeniden başlat.
3. Üçüncü bir sprite ekle: `portakal` adında değişken, resim **Portakal**, tür **Yiyecek**. Onu kedi ile elmanın arasına koy.

### Sık yapılan hatalar
- Bloklar `oyun başlayınca` bloğunun altına takılı değilse hiç çalışmaz. Blokların birbirine yapıştığından emin ol.
- Blokları değiştirdikten sonra sahne eski hâliyle kalır. Yeni hâlini görmek için ↺ düğmesine bas.
- İki sprite için aynı değişken adını kullanma. Aynı değişkene ikinci kez sprite koyarsan değişken yeni sprite'ı gösterir ve ilkine bir daha ulaşamazsın.
- Resim listesinde "(resim yok)" yazıyorsa Resimler sekmesine geç, **Galeri** düğmesine bas ve istediğin resme tıkla. Resim projene eklenir.

## Konuşalım
Kedi ile elmanın x değerleri neden farklı, ama y değerleri aynı? Bir elmayı kedinin tam üstüne koymak istersen hangi sayıları değiştirirdin?

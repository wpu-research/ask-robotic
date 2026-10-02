# Kediyi ok tuşlarıyla yürüt
süre: 20

## Merak
Duran bir kedi oyun olmaz. Oyuncu bir tuşa bastığında bir şeylerin olması gerekir. Peki bilgisayar, senin hangi tuşa bastığını nereden bilir? Ve kedi ekranın kenarına gelince ne olmalı: dışarı çıkıp kaybolmalı mı, yoksa durmalı mı?

## Etkinlik
Bu derste kedi oyun başlayınca ekranın ortasında hazır duruyor. Sen ona hareket yeteneği vereceksin.

### Denetleyici
Oyun Atölyesi'nde oyuncunun kullandığı tuşlara **denetleyici** diyoruz. Dört yön tuşu (ya da W, A, S, D) ve iki düğme (A: Boşluk ya da Z, B: X ya da Enter) vardır. Sahnenin altında aynı tuşların ekran hâli de durur. Dokunmatik ekranda onları kullanabilirsin.

### Blokları kur
1. Etkinliği aç ve ▶ düğmesine bas. Ok tuşlarına bas. Kedi kıpırdamıyor.
2. **Denetleyici** kategorisini aç ve `[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]` bloğunu al. Bunu `oyun başlayınca` bloğunun içindeki son bloğun altına tak. `bu sprite` yerine **Değişken** kategorisinden `kedi` bloğunu koy.
3. ↺ düğmesine bas ve ok tuşlarıyla yürü. Kedi şimdi hareket ediyor.
4. Kediyi biraz hızlandır: hızı 100 yap ve tekrar dene. Hız, saniyede kaç piksel gittiğini gösterir.
5. Uzun süre sol tuşuna basılı tut. Kedi ekranın dışına çıkıp kayboluyor.
6. **Sprite** kategorisinden `[kedi] [ekranda kalsın]: [evet]` bloğunu al ve hareket bloğunun altına tak. Bu bir ayar bloğudur. İlk açılır listeden **ekranda kalsın** ayarını, ikinci listeden **evet** değerini seç.
7. ↺ düğmesine bas. Şimdi kedi ekranın kenarında durur.

Beklenen sonuç: Kedi dört yöne yürür ve ekranın dışına çıkamaz.

### Nasıl çalışıyor?
- Tuşla hareket bloğu bir kez çalışır ama sonsuza kadar etkili olur. Oyun, her saniye 60 kez tuşlara bakar ve kediyi buna göre kaydırır. Bunun için sen ayrıca bir döngü yazmazsın.
- Hareket biçimi üçtür: **dört yöne**, **sağa-sola** ve **yukarı-aşağı**. Bir platform oyunu için sağa-sola yeterlidir. Meyve sepeti için de.
- **ekranda kalsın** ayarı olmazsa sprite dünyadan çıkabilir. Çıkan sprite görünmez ama hâlâ vardır.

### Dene
1. Hareket biçimini **sağa-sola** yap. Yukarı ve aşağı tuşları artık işe yarıyor mu?
2. Hızı çok yükselt, örneğin 200. Kedi kontrol edilebilir mi? Sence oyunlarda hız nasıl seçilmeli?
3. Kediyi başka bir resimle değiştir: Resimler sekmesindeki robot ya da astronotu bul. `yeni [resim] sprite'ı, türü [tür]` bloğunun açılır listesinden resmi değiştir.

### Sık yapılan hatalar
- Hareket bloğunun içine `bu sprite` kalmışsa son oluşturulan sprite hareket eder. Bu derste tek sprite var, bu yüzden sorun çıkmaz. Ama ikinci bir sprite eklediğinde hep değişken adını kullan.
- Bloğu `oyun başlayınca` bloğunun içine koymayı unutma. Dışarıda duran blok çalışmaz.
- Blok değişikliği çalışan oyuna otomatik yansımaz. Önce ↺ bas.

## Konuşalım
Kedi ekranda kalmasaydı, bir oyunda bu ne gibi sorunlar çıkarırdı? Hangi oyunlarda oyuncunun ekrandan çıkmasına izin verilir?

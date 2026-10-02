# Yapay zekânın kod açıklamasını incele
süre: 30

## Merak
Model bir kodu açıklarken çok akıcı konuşur. Ama akıcılık doğruluk demek değildir. Güvenmeden önce koda bakmak gerekir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Kod incelemesi
Önünde bir Python fonksiyonu ve onu "açıklayan" yedi iddia var. İddialar **elle yazılmış örneklerdir**; gerçek bir model çıktısı değildir. Görev: her iddiayı koda bakarak işaretlemek.

### İşaretler
- **Kaynakla uyumlu:** Kod bunu gerçekten yapıyor.
- **Kaynakla çelişiyor:** Kod bunun tersini yapıyor.
- **Kaynakta yok:** Kodda böyle bir şey hiç yok (uydurulmuş ayrıntı).

### Aracı aç
**Halüsinasyon dedektifi** aracı, kod vakasıyla açılır.
1. Yedi iddiayı da işaretle.
2. En az altısını doğru işaretle.
3. "Liste boşsa 0 döndürür" iddiasını özellikle incele: `len([])` ne verir? Sıfıra bölmek ne olur?
4. **Cevapları kontrol et** düğmesine bas ve açıklamaları oku.

### Nasıl çalışıyor?
- Çıktı tahminini kendin yap: (4 + 8 + 6) / 3 hesabı 6.0 verir. Python'da `/` ondalık sonuç verir.
- Kodun yapmadığı bir şeyi yaptığını söyleyen cümle, zararsız görünse de güveni zedeler.
- Doğrulamanın en iyi yolu kodu çalıştırmak ve test yazmaktır.

### Kendini sına
1. Kodun çıktısını tahmin etmek, açıklamaya güvenmekten neden daha sağlamdır?
2. Boş liste ile neden hata alınır?

## Konuşalım
Bir yapay zekâ asistanı kodunu "tamamen doğru" diye tanıttığında hangi testleri yazmadan inanmazsın?

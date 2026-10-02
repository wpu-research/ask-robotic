# Proje: Kendi eval setin
süre: 35

## Merak
Projenin amacı: yoğun bir test seti kurmak. Sistemi savunmak değil, zayıf yerlerini açığa çıkarmak için çalışacaksın. İyi bir test mühendisi, "çalışıyor" demez; "şu vakalarda çalışmıyor" diyebilir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Görev
**Eval tablosu** aracında yorum sınıflandırıcısı için kendi test setini kur.

### Gereksinimler
- En az 10 vaka.
- Olumlu ve olumsuzdan en az 3'er, belirsizden en az 1 vaka.
- Sistemin yanıldığı en az 2 zor vaka.
- Tekrarlanan vaka yok.

### Rapor
Kısa bir rapor yaz:
1. Toplam doğruluk ve etiket başına sonuçlar.
2. Sistemin yanıldığı vakalar ve neden yandığı.
3. Sistemi iyileştirmek için bir fikir (örneğin hangi sözcük listesi ya da kural eklenebilir).
4. Bu sonuçlara ne kadar güvenebileceğin (vaka sayısı yeterli mi?).

### Nasıl çalışıyor?
- On vaka çok küçüktür; güvenilir bir ölçüm için daha çoğu gerekir. Gerçek eval setleri yüzlerce, binlerce vaka içerebilir.
- Zor vakalar işe yarar çünkü sistemin ne zaman yanıldığını gösterir.

### Kendini sına
1. Test setinin boyutu küçükse sonuçlara neden temkinli yaklaşmalısın?
2. Sistem değişince eval'ı neden yeniden çalıştırırsın?

## Konuşalım
Eval setini bir arkadaşınınkiyle değiştir. Onun yazdığı hangi vaka senin sisteminin zayıf noktasını yakaladı?
